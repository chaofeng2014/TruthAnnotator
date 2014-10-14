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
    iframeReady = false;
  } else {
    return;
  }
  
  //There may be multiple disqus domain iframe running on the page
  processor.user.getLoginUser(function(user) {
    var waitingTime = 0;
    var waitIframe = window.setInterval(function(){
      var postListEle = $(processor.initElements);
        initElementNum = postListEle.length;
        console.log(document);
        if (initElementNum != 0){
          processor.refreshAnnotations(user);
          clearInterval(waitIframe);
        }
        waitingTime ++;
        if(waitingTime > 10)
          clearInterval(waitIframe);
      }, 3000);
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
