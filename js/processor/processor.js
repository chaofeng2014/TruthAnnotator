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
    author: {},
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

    updateAuthorVote: function(callback2){
      processor.database.queryAuthor(function(results){
        callback2(results);
      });
    },

    //init popinf right after the new annotation is saved 
    updateCurrentAnnotation: function(entry, objectId) {
      var selectedText = [{id: objectId, text: entry.selectedText, range: entry.textRange, agree: entry.numberOfAgree, disagree:
      entry.numberOfDisagree}];
      console.log(selectedText);
      var currentElement = processor.postList[entry.postId].element;
      $(currentElement).popinfo({"selectedText": selectedText});
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

            //query the author vote
            processor.updateAuthorVote(function (results){
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
                    }
                    $(post.element).find("[annotation-group = '" + i + "']").popinfo({"selectedText": groupSel});
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
          if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
            var range = rangy.createRange(element);
            var characterRange = textRange.characterRange;
            range.selectCharacters(element, characterRange.start, characterRange.end);
            cssApplier.applyToRange(range);
          } else {
            if (window.getSelection().toString().length > 0) {
              cssApplier.applyToSelection();
            }
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

        annotation.save({postId : entry.postId, userName: entry.userName, selectedText:entry.selectedText,
                         textRange : entry.textRange, numberOfAgree: entry.numberOfAgree, 
                         numberOfDisagree: entry.numberOfDisagree, sourceURL: entry.sourceURL, hostDomain:
                         entry.hostDomain},
        //annotation.save(entry,
        {
          success: function(newEntry) {
            console.log('New annotation saved');
            processor.utils.highlight();
            processor.updateCurrentAnnotation(entry, newEntry.Id);
            var UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE_NAME);
            var userannotation = new UserAnnotation();
            userannotation.save({userId:processor.author.objectId, username:processor.author.username, annotationId: newEntry.id, opinion: entry.opinion, link:
            entry.link}, {success: function(newUserEntry){
                          console.log('New annotation user saved');
                        },
                          error: function(newUserEntry, error){
                            alert("Failed to create new object, with error code: " + error.message);
                          }
                        });
          },
          error: function(newEntry, error) {
            alert("Failed to create new object, with error code: " + error.message);
          }
        });
      },
    
    /*
      processor.database.update:

      FIXME: Complete the update logic, change the update to updateAnnotation
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
      
      queryAuthor: function(callback) {
      // Query through USER_ANNOTATION table 
        var userAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE_NAME);

        var query = new Parse.Query(userAnnotation);

        query.equalTo("userId", processor.author.objectId);
        query.containedIn("annotationId", processor.annotationIdList);

        query.find({
          success: function(results) {
            callback(results);
          },
          error: function(error) {
            console.log("Could not finish the Main query!");
          }
        });
      }

    }

  });

})(window.processor = window.processor || {}, rangy, Parse, jQuery);
