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
      iconClass: "fa fa-angle-right",
      mode: "display"
    },

    prevArrow: {
      iconClass: "fa fa-angle-left",
      mode: "display"
    },

    selectedText: {
      text: " ",
      textClass: "opinions",
      mode: "display",
      beforeShow: function(popline) {
        this.find(".text").append("<ul id=annotation-carousel></ul>");
        var textField = this.find("#annotation-carousel");
        if (textField.find(".opinion").length === 0) {
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
            width: 220,
            height: 120,
            auto: false,
            onslidechange: function(current) {
              slideChange(current, popline);
            }
          });

          // textField.slick({
          //   dots: false,
          //   infinite: true,
          //   speed: 100,
          //   fade: true,
          //   slide: 'div',
          //   cssEase: 'linear',
          //   onInit: function() {slideChange.call(this, popline)},
          //   onReInit: function() {slideChange.call(this, popline)},
          //   onAfterChange: function() {slideChange.call(this, popline)},
          //   onBeforeChange: function() {slideChange.call(this, popline)}
          // });
        }

      }
    }

  });
})(processor, jQuery);
