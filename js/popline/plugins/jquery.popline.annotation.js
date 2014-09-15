/*
  jquery.popline.vote.js 0.0.1

  Version: 0.0.1
  Updated: May 18th, 2013

  (c) 2013 by archlyx
*/

;(function(processor, $) {

  var slideChange = function(current, popline) {
    var currentAnnotation = popline.settings["selectedText"][current];
    var currentId = currentAnnotation.id;
    popline.currentAnnotation = currentAnnotation;

    var bar = popline.bar;
    bar.find(".popline-thumbsUp-button").find("i").trigger("slideChange");
    bar.find(".popline-numThumbsUp-button").find(".text").trigger("slideChange");
    bar.find(".popline-numThumbsDown-button").find(".text").trigger("slideChange");
  };

  $.popline.addButton({
    nextArrow: {
      iconClass: "fa fa-angle-right fa-2x",
      mode: "display",
      beforeShow: function(popline) {
        if (popline.settings["selectedText"].length === 1) {
          this.css("color", "rgba(189, 189, 189, 0.5)");
        }
      }
    },

    prevArrow: {
      iconClass: "fa fa-angle-left fa-2x",
      mode: "display",
      beforeShow: function(popline) {
        if (popline.settings["selectedText"].length === 1) {
          this.css("color", "rgba(189, 189, 189, 0.5)");
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
            onslidechange: function(current) {
              slideChange(current, popline);
            }
          });

        }

      }
    }

  });
})(processor, jQuery);
