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

  processor.initializeUpdateEvent();
  $(window).on("postUpdated", function() {
    processor.updateAnnotations();
  })

  // Pull user info from chrome local storage 
  chrome.storage.sync.get(['objectId', 'username','nickname'], function(data){
    processor.user = data;
    if (data.objectId !== "" && data.username !== "" && data.nickname !== "" && 
        data.objectId !== undefined && data.username !== undefined && data.nickname !== undefined) {
      setTimeout(function(){
        //need to adjust the delay time for iframe
        processor.updateAnnotations();
        processor.user = data; 
        $(processor.initElements).popline();
      }, 1000);
    }
  });
  
  // Listen to popup page login/logout, update user info
  // depends on if it is an iframe
  if (!window.isTop | !iframe){
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      chrome.storage.sync.get(['objectId', 'username','nickname'], function(data) {
        processor.user = data;
        if (data.objectId !== "" & data.username !== "" & data.nickname !== "" & 
            data.objectId !== undefined & data.username !== undefined & data.nickname !== undefined) {
          $(processor.initElements).popline();
          processor.updateAnnotations();
        } else {
          instances = $.popline.instances;
          for (var i = 0; i < instances.length; i++) {
            if (instances[i].target.data("popline") !== undefined) {
              instances[i].target.data("popline").destroy();
            }
          }
          processor.updateAnnotations();
        }
      });
    });
  }
});
