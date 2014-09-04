/*
  jquery.popinfo.vote.js 0.0.1

  Version: 0.0.1
  Updated: May 18th, 2013

  (c) 2013 by archlyx
*/

;(function(processor, $) {

  // The variables for giving opinions
  var thumbsUpValue = false;
  var thumbsDownValue = false;
  var currentIndex;

  var toggleButton =  function(numAgree, numDisagree, op) {
    var thumbsUpButtonElement = $(".popinfo-button.popinfo-thumbsUp-button");
    var thumbsDownButtonElement = $(".popinfo-button.popinfo-thumbsDown-button");

    var thumbsUpButton = thumbsUpButtonElement.find("i");
    var thumbsDownButton = thumbsDownButtonElement.find("i");

    thumbsUpButtonElement.find(".text").text(numAgree.toString());
    thumbsDownButtonElement.find(".text").text(numDisagree.toString());

    if (op === 1) {
      thumbsUpButton.css("color", "#0084b4");
      thumbsDownButton.css("color", "#d2d2d2");
      thumbsUpValue = true;
      thumbsDownValue = false;
    } else if (op === -1) {
      thumbsDownButton.css("color", "#0084b4");
      thumbsUpButton.css("color", "#d2d2d2");
      thumbsUpValue = false;
      thumbsDownValue = true;
    } else if (op === 0) {
      thumbsUpButton.css("color", "#d2d2d2");
      thumbsDownButton.css("color", "#d2d2d2");
      thumbsUpValue = false;
      thumbsDownValue = false;
    }
  };

  var opinion = 0;
  var userOpinion = {};

  $.popinfo.addButton({
    selectedText: {
      text: " ",
      textClass: "opinions",
      mode: "edit",
      beforeShow: function(popinfo) {
        //processor.utils.removeHighlight(popinfo.target.get(0));
        var textField = this.find(".text");
        if (this.find(".opinion").length === 0) {
          var selectedText = popinfo.settings["selectedText"];
          for (var i = 0; i < selectedText.length; i++) {
            textField.append("<div " + "class=" + "opinion " 
                             + "index=" + i + ">"
                             + selectedText[i].text + "</div>");
            userOpinion[selectedText[i].id] = 0;
          }

          textField.slick({
            dots: true,
            infinite: true,
            speed: 100,
            fade: true,
            slide: 'div',
            cssEase: 'linear',
            onInit: function() {
              currentIndex = this.currentSlide;     
              var currentId = selectedText[currentIndex].id;
              toggleButton(selectedText[currentIndex].agree,
                           selectedText[currentIndex].disagree,
                           userOpinion[currentId]);   
              //processor.utils.toggleHighlight(popinfo.target.get(0), selectedText[currentIndex].range);      
            },
            onReInit: function() {
              currentIndex = this.currentSlide;     
              var currentId = selectedText[currentIndex].id;
              toggleButton(selectedText[currentIndex].agree,
                           selectedText[currentIndex].disagree,
                           userOpinion[currentId]);   
              //processor.utils.toggleHighlight(popinfo.target.get(0), selectedText[currentIndex].range);      
            },
            onAfterChange: function() {
              currentIndex = this.currentSlide;
              var currentId = selectedText[currentIndex].id;
              toggleButton(selectedText[currentIndex].agree,
                           selectedText[currentIndex].disagree,
                           userOpinion[currentId]);
              //processor.utils.toggleHighlight(popinfo.target.get(0), selectedText[currentIndex].range);
            },
            onBeforeChange: function() {
              currentIndex = this.currentSlide;
              var currentId = selectedText[currentIndex].id;
              toggleButton(selectedText[currentIndex].agree,
                           selectedText[currentIndex].disagree,
                           userOpinion[currentId]); 
              //processor.utils.toggleHighlight(popinfo.target.get(0), selectedText[currentIndex].range);
            }
          });
        }

      }
    },

    thumbsUp: {
      iconClass: "fa fa-thumbs-up",
      text: " ",
      mode: "edit",
      beforeShow: function(popinfo) {
        // FIXME: The thumbsUpValue is temporarily reset. It should be
        // set according to the content of selection.
        thumbsUpValue = false;

        // Set up the icon according to the vote value
        if (thumbsUpValue) {
          this.find("i").css("color", "#0084b4");
        } else {
          this.find("i").css("color", "#d2d2d2");
        }

        // Bind the click behavior of the button if not set yet
        if (!this.data("click-event-binded")) {
          this.click(function(event) {
            var $_this = $(this);
            var thumbsDownElement = $(".popinfo-button.popinfo-thumbsDown-button");

            if (!thumbsUpValue) {
              thumbsUpValue = true;
              opinion = 1;
              $_this.find("i").css("color", "#0084b4");

              // Flip the icon of another button because the two buttons cannot be
              // selected at the same time.
              if (thumbsDownValue) {

                var thumbsDownButton = thumbsDownElement.find("i");
                thumbsDownButton.css("color", "#d2d2d2");
                thumbsDownValue = false;
              }
            } else {
              thumbsUpValue = false;
              opinion = 0;
              $_this.find("i").css("color", "#d2d2d2");
            }

            userOpinion[popinfo.settings["selectedText"][currentIndex].id] = opinion;
          });
          this.data("click-event-binded", true);
        }
      },

      afterHide: function(popinfo) {
        selectedText = popinfo.settings["selectedText"];
        /*
        for (var i = 0; i < selectedText.length; i++) {
          processor.utils.highlight(popinfo.target.get(0), selectedText[i].range);
        }
        */
        for (var objectId in userOpinion) {
          processor.database.update(objectId, userOpinion[objectId]);
        }
      }
    },

    thumbsDown: {
      text: " ",
      iconClass: "fa fa-thumbs-down",
      mode: "edit",
      beforeShow: function(popinfo) {
        // FIXME: The thumbsDownValue is temporarily reset. It should be set according to the content of selection.
        thumbsDownValue = false;

        if (thumbsDownValue) {
          this.find("i").css("color", "#0084b4");
        } else {
          this.find("i").css("color", "#d2d2d2");
        }

        if (!this.data("click-event-binded")) {
          this.click(function(event) {
            var $_this = $(this);
            var thumbsUpElement = $(".popinfo-button.popinfo-thumbsUp-button");

            if (!thumbsDownValue) {
              thumbsDownValue = true;
              opinion = -1;
              $_this.find("i").css("color", "#0084b4");
              if (thumbsUpValue) {
                var thumbsUpButton = thumbsUpElement.find("i");
                thumbsUpButton.css("color", "#d2d2d2");
                thumbsUpValue = false;
              }
            } else {
              thumbsDownValue = false;
              opinion = 0;
              $_this.find("i").css("color", "#d2d2d2");
            }
            userOpinion[popinfo.settings["selectedText"][currentIndex].id] = opinion;
          });
          this.data("click-event-binded", true);
        }
      }
    }
  });
})(processor, jQuery);
