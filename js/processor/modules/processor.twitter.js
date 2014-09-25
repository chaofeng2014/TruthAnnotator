/*
  processor.twitter.js

  (c) 2014 by archlyx
*/

;(function(processor, $) {
  processor.addModule({
    twitter: {
      // initElements: "#doc, #profile_popup, #activity-popup-dialog",
      initElements: "#doc",
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
        var updatePosts = function() {
          var origTweetNumber = Object.keys(processor.postList).length;
          var newTweetNumber = $(processor.container).length;

          if (newTweetNumber !== origTweetNumber) {
            $(window).trigger("postUpdated");
          }
        };
        
        var node = document.getElementById("page-container");
        var observer = new MutationObserver(function(mutations) {
          updatePosts();
        });

        try {
          observer.observe(node, {attributes: true, attributeFilter: ["class"] });
        } catch(error) {
          console.log("Issue in iframe");
        }

        $(window).scroll(updatePosts);
        $(document).on("mouseup", ".js-new-tweets-bar", updatePosts);
      }
    }
  });
})(processor, jQuery);
