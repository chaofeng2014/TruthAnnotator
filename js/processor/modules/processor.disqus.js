/*
<<<<<<< HEAD
  processor.platformModules.js
=======
  processor.twitter.js
>>>>>>> 1ba097a100a0901ef8bcc27e9d678543ba28d1eb

  (c) 2014 by archlyx
*/

;(function(processor, $) {
  processor.addModule({
    disqus: {
      initElements: "#post-list",
      container: ".post-body",

      getInfoFromContainer: function(element) {
        var post-byline = $(element).find('.post-byline');
        var post-meta = $(element).find('.post-meta');
        
        var userName   = $(post-byline).find("a[data-role=username]").val();
        var commentURL = $(post-meta).find("a").attr("href");
        //var commentID = 
        //console.log("userName is : ", userName, "  commentURL is: ", commentURL);

        return {postId: commentURL, userName: userName};
      },

      initializeUpdateEvent: function() {
      console.log("init update event");
      /*
        $(window).scroll(function() {
          var origTweetNumber = Object.keys(processor.postList).length;
          var newTweetNumber = $(processor.container).length;

          if (newTweetNumber > origTweetNumber) {
            $(window).trigger("postUpdated");
          }
        });
        */

      }
    }
  });
})(processor, jQuery);
