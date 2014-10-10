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

    refreshPostList: function() {
      processor.postList = {};
      $(processor.container).each(function() {
        var info = processor.getInfoFromContainer(this)
        processor.postList[info.postId] = {username: info.userName, element: this};
      });
    },

    refreshAnnotations: function(user) {
      var isUserValidate = !processor.user.isUserLogOut(user);
      
      var initDisplay = function(annotationsInPosts, opinions) {
        for (var id in annotationsInPosts) {
          processor.utils.initAnnotationDisplay(processor.postList[id], opinions);
        }
      };

      processor.refreshPostList();

      if (isUserValidate) {
        console.log("init popline");
        $(processor.initElements).popline();
      }

      processor.database.queryAnnotation(function(annotationsIdList, annotationsInPosts) {
        if (isUserValidate) {
          processor.database.queryUserAnnotation(annotationsIdList, function(opinions) {
            initDisplay(annotationsInPosts, opinions);
          });
        } else {
          initDisplay(annotationsInPosts, {});
        }
      });
    },

    clearAnnotations: function() {
      var annotator = $(processor.initElements).data("popline");
      if (annotator) {
        annotator.destroy();
      }
      for (id in processor.postList) {
        processor.utils.destroyAnnotationDisplay(processor.postList[id]);
      }
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
      isUserLogOut: function(newUser) {
        var user = newUser || this;
        var keys = ['objectId', 'username', 'nickname'];
        for (var i = 0; i < keys.length; i++) {
          var value = user[keys[i]];
          if (value === "" || typeof(value) === "undefined") {
            return true;
          }
        }
        return false;
      },
      
      getLoginUser: function(callback) {
        chrome.storage.sync.get(['objectId', 'username', 'nickname'], function(user) {
          $.extend(processor.user, user, {opinions: {}});
          callback(user);
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
        var displayOnly = processor.user.isUserLogOut();

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
                                                                     element: element, displayOnly: displayOnly});
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

      insertAnnotationDisplay: function(entry, result) {
        var annotation = {
          id: result.id,
          text: entry.selectedText,
          range: entry.textRange,
          agree: entry.numberOfAgree,
          disagree: entry.numberOfDisagree
        };
        processor.user.opinions[result.id] = {opinion: entry.opinion, link: entry.link};

        var post = processor.postList[entry.postId];
        post.selectedTexts = post.selectedTexts || [];
        post.selectedTexts.push(annotation);

        processor.utils.destroyAnnotationDisplay(post);
        processor.utils.initAnnotationDisplay(post, processor.user.opinions);
      },

      groupTextRanges: function(textRanges) {
        var groupRanges = [{
          end: textRanges[0].range.characterRange.end,
          start: textRanges[0].range.characterRange.start,
          selections: [textRanges[0]]
        }];
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
          
          try {
            if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
              var range = rangy.createRange(element);
              var characterRange = textRange.characterRange;
              range.selectCharacters(element, characterRange.start, characterRange.end);
              cssApplier.applyToRange(range);
            } else if (window.getSelection().toString().length > 0) {
              cssApplier.applyToSelection();
            }
          }
          catch(error) {
            console.log("DOM mutation!");
          }
        }
      },

      innerHighlight: function(element, textRange) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          var cssApplier = rangy.createCssClassApplier("ta-annotation-inner-highlight");
          try {
            if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
              var range = rangy.createRange(element);
              var characterRange = textRange.characterRange;
              range.selectCharacters(element, characterRange.start, characterRange.end);
              cssApplier.applyToRange(range);
            }
          }
          catch(error) {
            console.log("DOM mutation!");
          }
        }
      },

      removeInnerHighlight: function(element, textRange) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          var cssApplier = rangy.createCssClassApplier("ta-annotation-inner-highlight");
          try {
            if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
              var range = rangy.createRange(element);
              var characterRange = textRange.characterRange;
              range.selectCharacters(element, characterRange.start, characterRange.end);
              cssApplier.undoToRange(range);
            }
          }
          catch(error) {
            console.log("DOM mutation!");
          }
        }

      },

      removeHighlight: function(element, textRange, group) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          var cssApplier = rangy.createCssClassApplier("ta-annotation-highlight", {elementAttributes : group});
          try {
            if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
              var range = rangy.createRange(element);
              var characterRange = textRange.characterRange;
              range.selectCharacters(element, characterRange.start, characterRange.end);
              cssApplier.undoToRange(range);
            }
          }
          catch(error) {
            console.log("DOM mutation!");
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

            processor.utils.insertAnnotationDisplay(entry, result);
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
        var entrySave = {
          userId: processor.user.objectId,
          username: processor.user.username,
          annotationId: annotationId,
          opinion: entry.opinion,
          link: entry.link
        };

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
        var Annotation = Parse.Object.extend(ANNOTATION_TABLE_NAME);

        var generateAnnotationsIdList = function(results) {
          var annotationsIdList = [];
          for (var j = 0; j < results.length; j++) {
            if (!(results[j].id in annotationsIdList)) {
              annotationsIdList.push(results[j].id);
            }
          }
          return annotationsIdList;
        };

        var mapAnnotationsToPosts = function(results) {
          var postId, annotationsInPosts = {};

          for (var j = 0; j < results.length; j++) {
            var annotation = {
              id: results[j].id,
              text: results[j].get("selectedText"),
              range: results[j].get('textRange'),
              agree: results[j].get("numberOfAgree"),
              disagree: results[j].get("numberOfDisagree")
            };

            postId = results[j].get("postId");
            annotationsInPosts[postId] = annotationsInPosts[postId] || {selectedTexts: []};
            if ($.inArray(annotation, annotationsInPosts[postId]) === -1) {
              annotationsInPosts[postId].selectedTexts.push(annotation);
            }
          }
          return annotationsInPosts;
        };

        var query = new Parse.Query(Annotation);
        query.containedIn("postId", Object.keys(processor.postList));

        query.find({
          success: function(results) {
            console.log("Find " + results.length.toString() + " annotations in current view!");
            
            if (results.length > 0) {
              var annotationsInPosts = mapAnnotationsToPosts(results);
              var annotationsIdList = generateAnnotationsIdList(results);
              $.extend(true, processor.postList, annotationsInPosts);
              callback(annotationsIdList, annotationsInPosts);
            }
          },
          error: function(error) {
            console.log("Could not query Annotation!");
          }
        });
      },
      
      queryUserAnnotation: function(annotationsIdList, callback) {
        var UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE_NAME);
        var query = new Parse.Query(UserAnnotation);

        query.equalTo("userId", processor.user.objectId);
        query.containedIn("annotationId", annotationsIdList);

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
            console.log("Could not query UserAnnotation!");
          }
        });
      }

    }

  });

})(window.processor = window.processor || {}, rangy, Parse, jQuery);
