/*
  jquery.popline.opinion.js 0.0.1

  Version: 0.0.1
  Updated: May 18th, 2013

  (c) 2013 by archlyx
*/

;(function($) {

  var opinion = 0;
  var userOpinions = {};

  // A table mapping the original opinion and new opinion
  // to the increment/decrement of the number of agree/disagree
  var updateNumberTable = {"0,1":  [1, 0],  "0,-1": [0, 1],
                           "1,-1": [-1, 1], "-1,1": [1, -1],
                           "1,0":  [-1, 0], "-1,0": [0, -1]};

  var calcOpinion = function(buttonType) {
    if (buttonType === "thumbsUp") {
      newOpinion = opinion > 0 ? 0 : 1;
    } else if (buttonType === "thumbsDown") {
      newOpinion = opinion < 0 ? 0 : -1;
    }
    return newOpinion;
  };

  var toggleButton = function(popline, newOpinion) {
    var bar = popline.bar;
    var thumbsUpButton = bar.find(".popline-thumbsUp-button").find("i");
    var thumbsDownButton = bar.find(".popline-thumbsDown-button").find("i");

    var highlightColor = "rgba(255, 178, 0, 0.7)";
    var defaultColor = "rgba(255, 255, 255, 1.0)";

    thumbsUpButton.css("color", newOpinion > 0 ? highlightColor : defaultColor);
    thumbsDownButton.css("color", newOpinion < 0 ? highlightColor : defaultColor);
  };

  var updateNumber = function(popline, newOpinion) {
    var bar = popline.bar;
    var numThumbsUp = bar.find(".popline-numThumbsUp-button").find(".text");
    var numThumbsDown = bar.find(".popline-numThumbsDown-button").find(".text");

    var increment = updateNumberTable[[opinion, newOpinion]];
    numThumbsUp.text(parseInt(numThumbsUp.text()) + increment[0]);
    numThumbsDown.text(parseInt(numThumbsDown.text()) + increment[1]);

    $.extend(userOpinions[popline.currentAnnotation.id], {increment: increment});
  };

  var isAnnotatedChanged = function(objectId) {
    if (!(objectId in processor.userAnnotations)) {
      processor.userAnnotations[objectId] = {opinion: userOpinions[objectId].opinion};
      return true;
    } else if (processor.userAnnotations[objectId].opinion !== userOpinions[objectId].opinion) {
      processor.userAnnotations[objectId].opinion = userOpinions[objectId].opinion;
      return true;
    }
    return false;
  };

  $.popline.addButton({
    thumbsUp: {
      iconClass: "fa fa-thumbs-up",
      mode: "always",
      beforeShow: function(popline) {
        if (popline.settings.mode === "display") {
          popline.bar.addClass("popline-display");
        } else if (popline.settings.mode === "annotation") {
          popline.bar.addClass("popline-annotation");
          opinion = 0;
          toggleButton(popline, 0);
        }

        // Bind the click behavior of the button if not set yet
        if (!this.data("click-event-binded")) {
          this.click(function(event) {
            var newOpinion = calcOpinion("thumbsUp");
            toggleButton(popline, newOpinion);
            
            if (popline.settings.mode === "display") {
              userOpinions[popline.currentAnnotation.id] = {opinion: newOpinion};
              updateNumber(popline, newOpinion);
            }

            opinion = newOpinion;
          });

          this.on("slideChange", function() {
            var newOpinion = 0;
            if (popline.currentAnnotation.opinion) {
              newOpinion = popline.currentAnnotation.opinion;
            }
            toggleButton(popline, newOpinion);
            opinion = newOpinion;
          });

          this.data("click-event-binded", true);
        }

      },

      afterHide: function(popline) {
        var mode = popline.settings.mode;

        if (mode === "annotation") {
          $.extend($.popline.selection, {numberOfAgree: opinion > 0 ? 1 : 0,
                                         numberOfDisagree: opinion < 0 ? 1 : 0,
                                         opinion : opinion});
        } else if (mode === "display") {
          for (var objectId in userOpinions) {
            if (isAnnotatedChanged(objectId)) {
              processor.database.updateAnnotation(objectId, userOpinions[objectId]);
            }
          }

        }
      }
    },

    numThumbsUp: {
      text: " ",
      mode: "display",
      beforeShow: function(popline) {
        if (!this.data("slide-event-binded")) {
          this.on("slideChange", function() {
            $(this).find(".text").text(popline.currentAnnotation.agree);
          });
          this.data("slide-event-binded", true);
        }
      }
    },

    thumbsDown: {
      iconClass: "fa fa-thumbs-down",
      mode: "always",
      beforeShow: function(popline) {

        if (!this.data("click-event-binded")) {
          this.click(function(event) {
            var newOpinion = calcOpinion("thumbsDown");
            toggleButton(popline, newOpinion);

            if (popline.settings.mode === "display") {
              userOpinions[popline.currentAnnotation.id] = {opinion: newOpinion};
              updateNumber(popline, newOpinion);
            }

            opinion = newOpinion;
          });
          this.data("click-event-binded", true);
        }

      }
    },

    numThumbsDown: {
      text: " ",
      mode: "display",
      beforeShow: function(popline) {
        if (!this.data("slide-event-binded")) {
          this.on("slideChange", function() {
            $(this).find(".text").text(popline.currentAnnotation.disagree);
          });
          this.data("slide-event-binded", true);
        }
      }
    }

  });
})(jQuery);
