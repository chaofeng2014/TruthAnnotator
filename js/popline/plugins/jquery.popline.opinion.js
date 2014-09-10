/*
  jquery.popline.opinion.js 0.0.1

  Version: 0.0.1
  Updated: May 18th, 2013

  (c) 2013 by archlyx
*/

;(function($) {

  var opinion = 0;
  var userOpinion = {};

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

    opinion = newOpinion;
  };

  $.popline.addButton({
    thumbsUp: {
      iconClass: "fa fa-thumbs-up",
      mode: "always",
      beforeShow: function(popline) {
        if (popline.settings.mode === "display") {
          popline.target.off("mouseleave");
          popline.target.css("background-color", "rgba(255, 178, 0, 0.7)");
        }

        // Bind the click behavior of the button if not set yet
        if (!this.data("click-event-binded")) {
          this.click(function(event) {
            toggleButton(popline, calcOpinion("thumbsUp"));
          });

          this.on("slideChange", function() {
            var newOpinion = 0;
            if (popline.currentAnnotation.opinion) {
              newOpinion = popline.currentAnnotation.opinion;
            }
            toggleButton(popline, newOpinion);
          });

          this.data("click-event-binded", true);
        }

      },

      afterHide: function(popline) {
        var mode = popline.settings.mode;

        if (mode === "annotation") {
          //FIXME: the number of the agree/disagree
          $.extend($.popline.selection, {numberOfAgree: 1, numberOfDisagree: 0,
                                         opinion : opinion});
        } else if (mode === "display") {
          popline.target.css("background-color", "rgba(136, 153, 166, 0.4)");
          popline.target.on("mouseleave", function() {
            var _this = this;
            setTimeout(function() {
              $(_this).css("background-color", "rgba(136, 153, 166, 0.4)");
            }, 200);
          });

          for (var objectId in userOpinion) {
            processor.database.update(objectId, userOpinion[objectId]);
          }
        }

      }
    },

    numThumbsUp: {
      text: " ",
      mode: "display"
    },

    thumbsDown: {
      iconClass: "fa fa-thumbs-down",
      mode: "always",
      beforeShow: function(popline) {

        if (!this.data("click-event-binded")) {
          this.click(function(event) {
            toggleButton(popline, calcOpinion("thumbsDown"));
          });
          this.data("click-event-binded", true);
        }

      }
    },

    numThumbsDown: {
      text: " ",
      mode: "display"
    }

  });
})(jQuery);
