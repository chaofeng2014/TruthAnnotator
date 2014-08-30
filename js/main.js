/*

  truth-annotator
  Version 0.0.1
  (c) 2014 by Yu, Shuangping

*/

// Initialize database 
Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

// Initialize rangy 
rangy.init();

$(document).ready(function() {
  
  processor.useModule("twitter");
  processor.updateAnnotations();
  processor.initializeUpdateEvent();
  $(window).on("postUpdated", function() {
    processor.updateAnnotations();
  })
  
  //pull user info from chrome local storage 
  chrome.storage.sync.get(['objectId', 'username','nickname'], function(data){
    processor.author = data;
    if (data.objectId !== "" & data.username !== "" & data.nickname !== "" & 
        data.objectId !== undefined & data.username !== undefined & data.nickname !== undefined){
          $(processor.initElements).popline();
    }
          
    console.log("processor author is:", processor.author);
  });
  
  //listen to popup page login/logout, update user info
  chrome.runtime.onMessage.addListener(
      function(data, sender, sendResponse) {
          console.log("received message!");
          processor.author = data;
            if (data.objectId !== "" & data.username !== "" & data.nickname !== "" & 
                data.objectId !== undefined & data.username !== undefined & data.nickname !== undefined){
                $(processor.initElements).popline();
                processor.updateAnnotations();
                //processor.updateAuthorVote();
              }
            else{
              //destory all existing popline
              instances = $.popline.instances;
              for (var i = 0; i < instances.length; i++) {
                if (instances[i].target.data("popline") !== undefined) {
                  instances[i].target.data("popline").destroy();
                }
              }
                processor.updateAnnotations();
                //processor.updateAuthorVote();
            }
          console.log("processor author is:", processor.author);
          sendResponse({farewell: document.URL + ": message received"});
  });
  
});
