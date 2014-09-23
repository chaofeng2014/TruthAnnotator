;(function(processor, rangy, Parse, $) {

  var ANNOTATION_TABLE_NAME= "Annotation";
  var USER_TABLE_NAME = "User";
  var USER_ANNOTATION_TABLE_NAME = "UserAnnotation";

  $.extend(processor, {

    useModule: function(moduleName) {
      $.extend(processor, processor.modules[moduleName]);
    },

    addModule: function(module) {
      $.extend(processor.modules, module);
    },

    modules: {},

    postList: {},
    annotationIdList: [],  

    updatePostList: function() {
      $(processor.container).each(function() {
        var info = processor.getInfoFromContainer(this)

        if (!(info.postId in processor.postList)) {
          processor.postList[info.postId] = {username: info.userName, element: this};
        }
    
      });
    },

    // Initialize popline right after the new annotation is saved 
    addAnnotationDisplay: function(entry, result) {
      var annotation = {id: result.id, text: entry.selectedText,
                        range: entry.textRange,
                        agree: entry.numberOfAgree,
                        disagree: entry.numberOfDisagree};
      processor.user.opinions[result.id] = {opinion: entry.opinion, link: entry.link};

      var post = processor.postList[entry.postId];
      if (!post.selectedTexts) {
        post.selectedTexts = [];
      }
      post.selectedTexts.push(annotation);

      processor.utils.destroyAnnotationDisplay(post);
      processor.utils.initAnnotationDisplay(post, processor.user.opinions);
    },

    updateAnnotations: function() {
      processor.updatePostList();
      processor.database.queryAnnotation(function(results) {
        console.log("Find " + results.length.toString() + " annotation results on current view!");

        if (results.length !== 0) {
          var objectId, postId, text, textRange, post;

          for (var j = 0; j < results.length; j++) {
            objectId = results[j].id;
            postId = results[j].get('postId');
            text = results[j].get("selectedText");
            textRange = results[j].get('textRange');
            numAgree = results[j].get("numberOfAgree");
            numDisagree = results[j].get("numberOfDisagree");

            post = processor.postList[postId];

            if (!(objectId in processor.annotationIdList)){
              processor.annotationIdList.push(objectId);
            }

            if (!("selectedTexts" in post)) {
              $.extend(post, {selectedTexts: []});
            }

            // Check if the selected text has been added
            var selectedText = {id: objectId, text: text, range: textRange,
                                agree: numAgree, disagree: numDisagree};
            if ($.inArray(selectedText, post.selectedTexts) === -1) {
              post.selectedTexts.push(selectedText);
            }
          }

          processor.database.queryUserAnnotation(function(opinions) {
            for (var id in processor.postList) {
              post = processor.postList[id];
              if ("selectedTexts" in post) {
                processor.utils.initAnnotationDisplay(post, opinions);
              }
            }
          });

        }
      });

    },

    /* 
      user: {objectId, username, nickname, opinions: {opinion, link}}
    */
    user: {
      objectId: null,
      username: null,
      nickname: null,
      opinions: {},

      /*
        isUserLogOut:
          Here input user should only have three keys: [objectId, username, nickname]
      */
      isUserLogOut: function(user) {
        for (key in user) {
          value = user[key];
          if (value === "" || typeof(value) === "undefined") {
            return true;
          }
        }
        return false;
      },
      getLoginUser: function() {
        chrome.storage.sync.get(['objectId', 'username', 'nickname'], function(user) {
          $.extend(processor.user, user);
        });
      }
    },

    utils: {

      getContainerFromRange: function(containerClass, range) {
        var element = range.commonAncestorContainer;
        while (element) {
          if ($(element).is(containerClass)) {
            return element;
          }
          element = element.parentNode;
        }
        return null;
      },

      initAnnotationDisplay: function(post, opinions) {
        var element = post.element, selectedTexts = post.selectedTexts;

        selectedTexts.sort(function(a, b) {
           return parseInt(a.range.characterRange.start) -
                  parseInt(b.range.characterRange.start)
        }); 

        var groupTexts = processor.utils.groupTextRanges(selectedTexts);
        $(element).data("annotation-groups", groupTexts);

        for (var i = 0; i < groupTexts.length; i++) {
          var groupSel = groupTexts[i].selections;
          for (var j = 0; j < groupSel.length; j++) {
            processor.utils.highlight(element, groupSel[j].range, {"annotation-group": i});
            $.extend(groupSel[j], opinions[groupSel[j].id]);
          }
          $(element).find("[annotation-group = " + i + "]").popline({mode: "display", selectedText: groupSel, 
                                                                     element: element});
        }
      },

      destroyAnnotationDisplay: function(post) {
        var element = post.element;
        var groupTexts = $(element).data("annotation-groups");

        if (groupTexts) {
          for (var i = 0; i < groupTexts.length; i++) {
            var groupSel = groupTexts[i].selections;
            var $annotationGroup = $(element).find("[annotation-group = " + i + "]");
            $annotationGroup.data("popline").destroy();
            for (var j = 0; j < groupSel.length; j++) {
              processor.utils.removeHighlight(element, groupSel[j].range, {"annotation-group": i});
            }
          }
          $(element).removeData("groupTexts");
        }
      },

      groupTextRanges: function(textRanges) {
        var groupRanges = [{end: textRanges[0].range.characterRange.end,
                            start: textRanges[0].range.characterRange.start,
                            selections: [textRanges[0]]}];
        var groupOrder = 0;
        for (var i = 1; i < textRanges.length; i++) {
          var characterRange = textRanges[i].range.characterRange;
          var group = groupRanges[groupOrder];

          if (characterRange.start < group.end) {
            group.selections.push(textRanges[i]);
            group.end = (characterRange.end < group.end) ? group.end : characterRange.end;
          } else {
            groupRanges.push({end: characterRange.end,
                              start: characterRange.start,
                              selections: [textRanges[i]]});
            groupOrder = groupOrder + 1;
          }
        }
        return groupRanges;
      },


      highlight: function(element, textRange, group) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          if (group) {
            var cssApplier = rangy.createCssClassApplier("ta-annotation-highlight", {elementAttributes : group});
          } else {
            var cssApplier = rangy.createCssClassApplier("ta-annotation-highlight");
          }
          
          if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
            var range = rangy.createRange(element);
            var characterRange = textRange.characterRange;
            range.selectCharacters(element, characterRange.start, characterRange.end);
            cssApplier.applyToRange(range);
          } else if (window.getSelection().toString().length > 0) {
            cssApplier.applyToSelection();
          }
        }
      },

      innerHighlight: function(element, textRange) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          var cssApplier = rangy.createCssClassApplier("ta-annotation-inner-highlight");
          if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
            var range = rangy.createRange(element);
            var characterRange = textRange.characterRange;
            range.selectCharacters(element, characterRange.start, characterRange.end);
            cssApplier.applyToRange(range);
          }
        }
      },

      removeInnerHighlight: function(element, textRange) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          var cssApplier = rangy.createCssClassApplier("ta-annotation-inner-highlight");
          if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
            var range = rangy.createRange(element);
            var characterRange = textRange.characterRange;
            range.selectCharacters(element, characterRange.start, characterRange.end);
            cssApplier.undoToRange(range);
          }
        }

      },

      removeHighlight: function(element, textRange, group) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          var cssApplier = rangy.createCssClassApplier("ta-annotation-highlight", {elementAttributes : group});
          if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
            var range = rangy.createRange(element);
            var characterRange = textRange.characterRange;
            range.selectCharacters(element, characterRange.start, characterRange.end);
            cssApplier.undoToRange(range);
          }
        }

      }

    },

    database: {
    /*
      processor.database.saveAnnotation:
    */
      saveAnnotation: function(entry) {
        var Annotation = Parse.Object.extend(ANNOTATION_TABLE_NAME);
        var annotation = new Annotation();

        annotation.save(entry,
        {
          success: function(result) {
            console.log('New annotation saved');

            window.getSelection().removeAllRanges();

            processor.addAnnotationDisplay(entry, result);
            processor.database.saveUserAnnotation(entry, result);
          },
          error: function(result, error) {
            alert("Failed to create new object, with error code: " + error.message);
          }
        });
      },

      saveUserAnnotation: function(entry, result) {
        // Here result is the result return from Parse
        var UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE_NAME);
        var userAnnotation = new UserAnnotation();

        var annotationId = result ? result.id : entry.annotationId;
        var entrySave = {userId: processor.user.objectId,
                         username: processor.user.username,
                         annotationId: annotationId,
                         opinion: entry.opinion,
                         link: entry.link};

        userAnnotation.save(entrySave, {
          success: function(newUserEntry){
            console.log('New annotation user saved');
          },
          error: function(newUserEntry, error){
            alert("Failed to create new object, with error code: " + error.message);
          }
        });
      },
    
    /*
      processor.database.update:
    */
      updateAnnotation: function(objectId, userOpinion) {
        var Annotation = Parse.Object.extend(ANNOTATION_TABLE_NAME);
        var annotation = new Annotation();
        annotation.id = objectId;
        
        if (userOpinion.increment[0] !== 0) {
          annotation.increment("numberOfAgree", userOpinion.increment[0]);
        }

        if (userOpinion.increment[1] !== 0) {
          annotation.increment("numberOfDisagree", userOpinion.increment[1]);
        }        

        annotation.save(null, {
          success: function(annotation) {
            processor.database.updateUserAnnotation(objectId, userOpinion.opinion);
          },
          error: function(annotation, error) {
            alert("Failed to create new object, with error code: " + error.message);
          }
        });

      },

      updateUserAnnotation: function(objectId, opinion) {
        var UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE_NAME);
        var query = new Parse.Query(UserAnnotation);

        query.equalTo("userId", processor.user.objectId);
        query.equalTo("annotationId", objectId);

        query.first({
          success: function(result) {
            if (result) {
              result.set("opinion", opinion);
              result.save();
              console.log('New opinion updated');
            } else {
              var entry = {annotationId: objectId, opinion: opinion}
              processor.database.saveUserAnnotation(entry);
            }
          },
          error: function(annotation, error) {
            alert("Failed to create new object, with error code: " + error.message);
          }
        });
      },

      /*
        processor.database.query: 

        INPUT: The posts are organized as followed:
        {
          postId : {
            username: [String],
            element: [HTML Element],
          },
          ...
        }
      */
      queryAnnotation: function(callback) {
      // Query through ANNOTATION table 
        var Annotation = Parse.Object.extend(ANNOTATION_TABLE_NAME);
        var query = new Parse.Query(Annotation);

        query.containedIn("postId", Object.keys(processor.postList));

        query.find({
          success: function(results) {
            callback(results);
          },
          error: function(error) {
            console.log("Could not finish the query!");
          }
        });
      },
      
      queryUserAnnotation: function(callback) {
        var UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE_NAME);
        var query = new Parse.Query(UserAnnotation);

        query.equalTo("userId", processor.user.objectId);
        query.containedIn("annotationId", processor.annotationIdList);

        query.find({
          success: function(results) {
            for (var i = 0; i < results.length; i++) {
              var annotationId = results[i].get("annotationId");
              var opinion = results[i].get("opinion");
              var link = results[i].get("link");
              processor.user.opinions[annotationId] = {opinion: opinion, link: link};
            }
            callback(processor.user.opinions);
          },
          error: function(error) {
            console.log("Could not finish the Main query!");
          }
        });
      }

    }

  });

})(window.processor = window.processor || {}, rangy, Parse, jQuery);
