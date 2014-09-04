/*
  jquery.popline.vote.js 0.0.1

  Version: 0.0.1
  Updated: May 18th, 2013

  (c) 2013 by archlyx
*/

;(function($) {

  // The variables for giving opinions
  var thumbsUpValue = false;
  var thumbsDownValue = false;

  $.popline.addButton({
    thumbsUp: {
      iconClass: "fa fa-thumbs-o-up",
      mode: "edit",
      beforeShow: function(popline) {
        // FIXME: The thumbsUpValue is temporarily reset. It should be
        // set according to the content of selection.
        thumbsUpValue = false;

        // Set up the icon according to the vote value
        if (thumbsUpValue) {
          this.find("i").removeClass("fa fa-thumbs-o-up").addClass("fa fa-thumbs-up");
        } else {
          this.find("i").removeClass("fa fa-thumbs-up").addClass("fa fa-thumbs-o-up");
        }

        // Bind the click behavior of the button if not set yet
        if (!this.data("click-event-binded")) {
          this.click(function(event) {
            var $_this = $(this);

            if (!thumbsUpValue) {
              thumbsUpValue = true;
              $_this.find("i").removeClass("fa fa-thumbs-o-up").addClass("fa fa-thumbs-up");

              // Flip the icon of another button because the two buttons cannot be
              // selected at the same time.
              if (thumbsDownValue) {
                var thumbsDownButton = $(".popline-button.popline-thumbsDown-button").find("i");
                thumbsDownButton.removeClass("fa fa-thumbs-down").addClass("fa fa-thumbs-o-down");
                thumbsDownValue = false;
              }
            } else {
              thumbsUpValue = false;
              $_this.find("i").removeClass("fa fa-thumbs-up").addClass("fa fa-thumbs-o-up");
            }
          });
          this.data("click-event-binded", true);
        }
      },
      afterHide: function(popline) {
        if (thumbsUpValue) {
          $.extend($.popline.selection, {numberOfAgree: 1}, {opinion : 1});
          $.extend($.popline.selection, {numberOfDisagree: 0});
        } else if (thumbsDownValue) {
          $.extend($.popline.selection, {numberOfAgree: 0}, {opinion: -1});
          $.extend($.popline.selection, {numberOfDisagree: 1});
        }
        else{
          $.extend($.popline.selection,{opinion: 0});
        }

      }
    },

    thumbsDown: {
      iconClass: "fa fa-thumbs-o-down",
      mode: "edit",
      beforeShow: function(popline) {
        // FIXME: The thumbsDownValue is temporarily reset. It should be set according to the content of selection.
        thumbsDownValue = false;

        if (thumbsDownValue) {
          this.find("i").removeClass("fa fa-thumbs-o-down").addClass("fa fa-thumbs-down");
        } else {
          this.find("i").removeClass("fa fa-thumbs-down").addClass("fa fa-thumbs-o-down");
        }

        if (!this.data("click-event-binded")) {
          this.click(function(event) {
            var $_this = $(this);

            if (!thumbsDownValue) {
              thumbsDownValue = true;
              $_this.find("i").removeClass("fa fa-thumbs-o-down").addClass("fa fa-thumbs-down");
              if (thumbsUpValue) {
                var thumbsUpButton = $(".popline-button.popline-thumbsUp-button").find("i");
                thumbsUpButton.removeClass("fa fa-thumbs-up").addClass("fa fa-thumbs-o-up");
                thumbsUpValue = false;
              }
            } else {
              thumbsDownValue = false;
              $_this.find("i").removeClass("fa fa-thumbs-down").addClass("fa fa-thumbs-o-down");
            }
          });
          this.data("click-event-binded", true);
        }
      }
    }
  });
})(jQuery);
