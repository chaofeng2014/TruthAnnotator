/*
  processor.platformModules.js

  (c) 2014 by archlyx
*/

;(function(processor, $) {
  processor.addModule({
    twitter: {
      initElements: "#doc, #profile_popup, #activity-popup-dialog",
      container: ".js-tweet-text",

      getInfoFromContainer: function(element) {
        var thisParent = $(element).parent();
        var parentElement;

        if (thisParent.is("[data-screen-name]")) {
          parentElement = thisParent;
        } else {
          parentElement = thisParent.parent();
        }
        
        tweetId = parentElement.attr("data-tweet-id");
        userName = parentElement.attr("data-screen-name");

        return {postId: tweetId, userName: userName};
      },

      initializeUpdateEvent: function() {
        $(window).scroll(function() {
          var origTweetNumber = Object.keys(processor.postList).length;
          var newTweetNumber = $(processor.container).length;

          if (newTweetNumber > origTweetNumber) {
            $(window).trigger("postUpdated");
          }
        });
      }
    }
  });

  processor.addModule({
    disqus: {
      initElements: "#post-list",
      container: ".post",

      getInfoFromContainer: function(element) {
        var userName   = $(element).find(".author").children().html();
        var commentId  = $(element).attr("id");

        return {postId: commentId, userName: userName};
      },

      initializeUpdateEvent: function() {
      console.log("init update event");
      }
    }
  });
})(processor, jQuery);
