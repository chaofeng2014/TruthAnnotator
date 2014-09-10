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
    user: {},
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

    //init popline right after the new annotation is saved 
    addAnnotationDisplay: function(entry) {
      var selectedObject = [{id: entry.id, text: entry.get("selectedText"),
                             range: entry.get("textRange"),
                             agree: entry.get("numberOfAgree"),
                             disagree: entry.get("numberOfDisagree") }];

      var postElement  = processor.postList[entry.postId].element;
      
      //FIXME add annotation-group attribute
      var currentElements = $(postElement).find(".ta-annotation-highlight").not("[annotation-group]");

      for( var i = 0; i < currentElements.size(); i++){
        $(currentElements.get(i)).popline({"mode": "display","selectedText": selectedObject});
      }
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

            //update annotationList
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

          processor.database.queryUserAnnotation(function(userAnnotations) {
            for (var id in processor.postList) {
              post = processor.postList[id];
              if ("selectedTexts" in post) {
                var selectedTexts = post.selectedTexts;
                selectedTexts.sort(function(a, b) {
                   return parseInt(a.range.characterRange.start) -
                          parseInt(b.range.characterRange.start)
                });

                var groupTexts = processor.utils.groupTextRanges(selectedTexts);

                for (var i = 0; i < groupTexts.length; i++) {
                  var groupSel = groupTexts[i].selections;
                  for (var j = 0; j < groupSel.length; j++) {
                    processor.utils.highlight(post.element, groupSel[j].range, 
                                              {"annotation-group": i});
                    $.extend(groupSel[j], userAnnotations[groupSel[j].id]);
                  }
                  console.log(groupSel);
                  $(post.element).find("[annotation-group = '" + i + "']").popline({"mode": "display", "selectedText": groupSel});
                }
              }
            }
          });
        }
      });

    },

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

    utils: {

      groupTextRanges: function(textRanges) {
        var groupRanges = [{maxEnd: textRanges[0].range.characterRange.end,
                            selections: [textRanges[0]]}];
        var groupOrder = 0;
        for (var i = 1; i < textRanges.length; i++) {
          var characterRange = textRanges[i].range.characterRange;
          var group = groupRanges[groupOrder];

          if (characterRange.start < group.maxEnd) {
            group.selections.push(textRanges[i]);
            group.maxEnd = (characterRange.end < group.maxEnd) ? group.maxEnd : characterRange.end;
          } else {
            groupRanges.push({maxEnd: characterRange.end,
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
          //over load 
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

      toggleHighlight: function(element, textRange) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          var cssApplier = rangy.createCssClassApplier("ta-annotation-highlight");
          if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
            var range = rangy.createRange(element);
            var characterRange = textRange.characterRange;
            range.selectCharacters(element, characterRange.start, characterRange.end);
            cssApplier.toggleRange(range);
          }
        }

      },

      removeHighlight: function(element) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          var cssApplier = rangy.createCssClassApplier("ta-annotation-highlight");
          var range = rangy.createRange();
          range.selectNodeContents(element);
          cssApplier.toggleRange(range);
          cssApplier.toggleRange(range);
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

            processor.utils.highlight();
            window.getSelection().removeAllRanges();

            processor.addCurrentAnnotation(result);
          },
          error: function(newEntry, error) {
            alert("Failed to create new object, with error code: " + error.message);
          }
        });
      },

      saveUserAnnotation: function(entry) {
        // Here entry is the result return from Parse
        var UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE_NAME);
        var userAnnotation = new UserAnnotation();

        var entrySave = {userId: processor.user.objectId,
                         username: processor.user.username,
                         annotationId: entry.id,
                         opinion: entry.get("opinion"),
                         link: entry.get("link")}

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
      update: function(objectId, opinion) {
        var Annotation = Parse.Object.extend(ANNOTATION_TABLE_NAME);
        var annotation = new Annotation();
        annotation.id = objectId;

        if (opinion != 0) {
          if (opinion === 1) {
            annotation.increment("numberOfAgree");
          } else if (opinion === -1) {
            annotation.increment("numberOfDisagree");
          }
          
          annotation.save(null, {
            success: function(annotation) {
              console.log('New opinion saved');
            },
            error: function(annotation, error) {
              alert("Failed to create new object, with error code: " + error.message);
            }
          });

        }
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
            var userAnnotations = {};
            for (var i = 0; i < results.length; i++) {
              var annotationId = results[i].get("annotationId");
              var opinion = results[i].get("opinion");
              var link = results[i].get("link");
              userAnnotations[annotationId] = {opinion: opinion, link: link};
            }
            callback(userAnnotations);
          },
          error: function(error) {
            console.log("Could not finish the Main query!");
          }
        });
      }

    }

  });

})(window.processor = window.processor || {}, rangy, Parse, jQuery);
