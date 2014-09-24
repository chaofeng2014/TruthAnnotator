/*

  Truth Annotator
  Version 0.0.1
  (c) 2014 by Yu, Shuangping

*/

// Initialize parse database 
Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

// Initialize rangy 
rangy.init();

$(document).ready(function() {
  var iframe;
  
  var host = window.location.host;
  if (host === "twitter.com"){
    processor.useModule("twitter");
    iframe = false;
  } else if (host === "disqus.com") {
    processor.useModule("disqus");
    iframe = true;
  } else {
    return;
  }
  
  // FIXME: Probably need a delay for iframe
  processor.user.getLoginUser(function(user) {
    processor.refreshAnnotations(user);
  });

  processor.initializeUpdateEvent();

  $(window).on("postUpdated", function() {
    processor.clearAnnotations();
    processor.refreshAnnotations();
  });

  /* 
    Listen to popup page login/logout, update user info
    depends on if it is an iframe
  */ 
  if (!window.isTop | !iframe) {
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      processor.clearAnnotations();

      processor.user.getLoginUser(function(user) {
        processor.refreshAnnotations();        
      });

    });
  }

});
