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
      console.log("updating author vote");
      processor.database.queryAuthor(function(results){
        //console.log("Find " + results.length.toString() + " results!");
        callback2(results);
      });
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
              console.log("find", results.length, "annotation results for current author");
              for (var id in processor.postList) {
                post = processor.postList[id];
                if ("selectedTexts" in post) {
                  var selectedTexts = post.selectedTexts;

                  for (var i = 0; i < selectedTexts.length; i++) {
                    processor.utils.highlight(post.element, selectedTexts[i].range);
                  }

                  $(post.element).popinfo({"selectedText": selectedTexts});
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

      highlight: function(element, textRange) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          var cssApplier = rangy.createCssClassApplier("ta-annotation-highlight");
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
      processor.database.save:
    */
      save: function(entry) {
        var Annotation = Parse.Object.extend(ANNOTATION_TABLE_NAME);
        var annotation = new Annotation();
        //var user 
        console.log(entry);
        annotation.save({postId : entry.postId, userName: entry.userName, selectedText:entry.selectedText,
                         textRange : entry.textRange, numberOfAgree: entry.numberOfAgree, 
                         numberOfDisagree: entry.numberOfDisagree, sourceURL: entry.sourceURL},
        //annotation.save(entry,
        {
          success: function(newEntry) {
            console.log('New annotation saved');
            processor.utils.highlight();
            var UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE_NAME);
            var userannotation = new UserAnnotation();
            console.log(processor.author.username);
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

      FIXME: Complete the update logic
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
        //console.log(processor.author.objectId);
        //console.log(processor.annotationIdList);
        query.equalTo("userId", processor.author.objectId);
        query.containedIn("annotationId", processor.annotationIdList);

        query.find({
          success: function(results) {
            //console.log(results);
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
