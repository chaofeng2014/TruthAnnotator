/*
  jquery.popline.link.js 0.0.1

  Version: 0.0.1
  Updated: May 18th, 2013

  (c) 2013 by kenshin54
*/
Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak","anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

;(function(processor, $) {

  var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/

  // selectionHasLink function should be used to testify whether the current
  // selection has link associated.
  var selectionHasLink = function() {
    var result = false;
    //var selection = window.getSelection();
    //result = $.popline.utils.findNodeWithTags(selection.focusNode, 'A');
    return result;
  }

  var buildTextField = function(popline, button) {
    if (button.find(":text").length === 0) {
      var $textField = $("<input type='text' />");
      $textField.addClass("textfield");
      $textField.attr("placeholder", "comments & reference");

      $textField.keyup(function(event) {
        if (event.which === 13) {
          $(this).blur();
		  if (pattern.test($(this).val())) {
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(button.data('selection'));
            document.execCommand("createlink", false, $(this).val());
		  } else {
            window.getSelection().addRange(button.data('selection'));
		  }
          popline.hide();
        }
      });

      $textField.mouseup(function(event) {
        event.stopPropagation();
      });
      button.append($textField);
    }
  }

  $.popline.addButton({
    link: {
      iconClass: "fa fa-link",
      mode: "edit",
      beforeShow: function(popline) {
        if (selectionHasLink()) {
          this.find("i").removeClass("fa fa-unlink").addClass("fa fa-link");
        } else {
          this.find("i").removeClass("fa fa-link").addClass("fa fa-unlink");
        }

        $(this).data('selection', window.getSelection().getRangeAt(0));

        if (!this.data("click-event-binded")) {
          
          this.click(function(event) {
           var $_this = $(this);

            buildTextField(popline, $_this);

            if (!$_this.hasClass("boxed")) {
              $_this.children(":text").val('');
              popline.switchBar($_this, function() {
                $_this.siblings("li").hide().end()
                  .children(":text").show().end()
              }, function() {
                $_this.children(":text").focus()
              });
              event.stopPropagation();
            }
          });

          this.data("click-event-binded", true);
        }

      },
      afterHide: function(popline) {
        var linkText = this.find(":text").val();
        $.extend($.popline.selection, {link:linkText});
        window.getSelection().removeAllRanges();
        window.getSelection().addRange($(this).data('selection'));
        
        //for iframe, the window.lcoation.host only return iframe domain, not the host domain
        //console.log(window.location.host);
        chrome.runtime.sendMessage({question:"what is the host domain?"}, function(response){
          console.log(response.answer);
          $.extend($.popline.selection, {sourceURL: response.answer}, {hostDomain: window.location.host});
          if ($.popline.selection.opinion === 1 | $.popline.selection.opinion === -1) {
            console.log($.popline.selection.opinion);
            processor.database.saveAnnotation($.popline.selection);
          }
        });
      }
    }
  });
})(processor, jQuery);


