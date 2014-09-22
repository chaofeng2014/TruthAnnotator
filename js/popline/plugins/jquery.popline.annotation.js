/*
  jquery.popline.vote.js 0.0.1

  Version: 0.0.1
  Updated: May 18th, 2013

  (c) 2013 by archlyx
*/

;(function(processor, $) {

  var slideChange = function(popline, current, previous) {
    var currentAnnotation = popline.settings["selectedText"][current];
    var currentId = currentAnnotation.id;
    popline.currentAnnotation = currentAnnotation;

    var element = popline.settings["element"];
    if (previous !== null) {
      var previousAnnotation = popline.settings["selectedText"][previous];
      processor.utils.removeInnerHighlight(element, previousAnnotation.range);
    }
    processor.utils.innerHighlight(element, currentAnnotation.range);

    var bar = popline.bar;
    bar.find(".popline-thumbsUp-button").find("i").trigger("slideChange");
    bar.find(".popline-numThumbsUp-button").find(".text").trigger("slideChange");
    bar.find(".popline-numThumbsDown-button").find(".text").trigger("slideChange");
  };

  $.popline.addButton({
    nextArrow: {
      iconClass: "ta-chevron-right",
      mode: "display",
      beforeShow: function(popline) {
        this.find("i").toggleClass("button-disabled", (popline.settings["selectedText"].length === 1));
      }
    },

    prevArrow: {
      iconClass: "ta-chevron-left",
      mode: "display",
      beforeShow: function(popline) {
        this.find("i").toggleClass("button-disabled", (popline.settings["selectedText"].length === 1));
      }
    },

    close: {
      iconClass: "ta-cancel",
      mode: "display",
      beforeShow: function(popline) {
        if (!this.data("click-event-binded")) {
          this.click(function() {
            $.popline.hideAllBar();
          });
          this.data("click-event-binded", true);
        }
      }
    },

    annotationText: {
      mode: "display",
      beforeShow: function(popline) {
        var textField = this.find("#annotation-carousel");
        if (textField.length === 0) {
          this.find(".pop-btn").append("<div class=carousel><ul id=annotation-carousel></ul></div>");
          textField = this.find("#annotation-carousel");

          var selectedText = popline.settings["selectedText"];
          for (var i = 0; i < selectedText.length; i++) {
            textField.append("<li " + "class=" + "opinion " 
                             + "index=" + i + ">"
                             + selectedText[i].text + "</li>");
          }

          textField.simplecarousel({
            next: popline.bar.find(".popline-nextArrow-button").find("i"),
            prev: popline.bar.find(".popline-prevArrow-button").find("i"),
            slidespeed: 700,
            fade: 200,
            width: 252,
            height: 100,
            auto: false,
            onslidechange: function(current, previous) {
              slideChange(popline, current, previous);
            }
          });

        } else {
          processor.utils.innerHighlight(popline.settings["element"], popline.currentAnnotation.range);
        }

      },

      afterHide: function(popline) {
        processor.utils.removeInnerHighlight(popline.settings["element"], popline.currentAnnotation.range);
      }
    }

  });
})(processor, jQuery);
