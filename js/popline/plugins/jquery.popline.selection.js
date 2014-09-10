/*
  jquery.popline.vote.js 0.0.1

  Version: 0.0.1
  Updated: May 18th, 2013

  (c) 2013 by archlyx
*/

;(function(processor, $) {

  var slideChange =  function(popline) {
    var currentAnnotation = selectedText[this.currentSlide];
    var currentId = currentAnnotation.id;
    popline.currentAnnotation = currentAnnotation;
    
    bar.find(".popline-thumbsUp-button").find("i").trigger("slideChange");
  };

  $.popline.addButton({
    selectedText: {
      text: " ",
      textClass: "opinions",
      mode: "display",
      beforeShow: function(popline) {
        var textField = this.find(".text");
        if (this.find(".opinion").length === 0) {
          var selectedText = popline.settings["selectedText"];
          for (var i = 0; i < selectedText.length; i++) {
            textField.append("<div " + "class=" + "opinion " 
                             + "index=" + i + ">"
                             + selectedText[i].text + "</div>");
          }

          textField.slick({
            dots: false,
            infinite: true,
            speed: 100,
            fade: true,
            slide: 'div',
            cssEase: 'linear',
            onInit: slideChange,
            onReInit: slideChange,
            onAfterChange: slideChange,
            onBeforeChange: slideChange
          });
        }

      }
    }

  });
})(processor, jQuery);
