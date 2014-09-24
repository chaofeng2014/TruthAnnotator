/*
  processor.twitter.js

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
        
        $('.js-new-items-bar-container').click(function(){
          console.log("new tweet loaded");
          $(window).trigger("postUpdated");
        });
          
        $('.ProfileTweet.js-actionable-tweet.u-textBreak').click(function(){
          console.log("reloading page...");
          setTimeout(function(){
            $(window).trigger("refreshPage");
          },1000);
        });
      }
    }
  });
})(processor, jQuery);
