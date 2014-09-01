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
  var iframe;
  console.log("the modules are ", processor.modules);
  
  var host = window.location.host;
  if (host === "twitter.com"){
    processor.useModule("twitter");
    iframe = false;
  }
  else if(host === "disqus.com"){
    processor.useModule("disqus");
    iframe = true;
  }

  else return;

  processor.initializeUpdateEvent();
  $(window).on("postUpdated", function() {
    processor.updateAnnotations();
    console.log("post update event trigger");
  })

  //pull user info from chrome local storage 
  chrome.storage.sync.get(['objectId', 'username','nickname'], function(data){
    processor.author = data;
    if (data.objectId !== "" & data.username !== "" & data.nickname !== "" & 
        data.objectId !== undefined & data.username !== undefined & data.nickname !== undefined){
          setTimeout(function(){
            //FIXME adjust the delay time
            processor.updateAnnotations();
            $(processor.initElements).popline();
          }, 1000);
    }
    console.log("processor author is:", processor.author);
  });
  
  //listen to popup page login/logout, update user info
  // dependes on if it is iframe
  if (!window.isTop | !iframe){
    chrome.storage.onChanged.addListener(
      function(changes, namespace){
        console.log("local storage changed!");
        chrome.storage.sync.get(['objectId', 'username','nickname'], function(data){
          processor.author = data;
          if (data.objectId !== "" & data.username !== "" & data.nickname !== "" & 
              data.objectId !== undefined & data.username !== undefined & data.nickname !== undefined){
                  $(processor.initElements).popline();
                  processor.updateAnnotations();
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
          }
            console.log("processor author is:", processor.author);
        });
      });
  }
          
  /*
  chrome.runtime.onMessage.addListener(
      function(data, sender, sendResponse) {
          console.log("received message!");
          console.log("local storage changed!");
          processor.author = data;
            if (data.objectId !== "" & data.username !== "" & data.nickname !== "" & 
                data.objectId !== undefined & data.username !== undefined & data.nickname !== undefined){
                $(processor.initElements).popline();
                processor.updateAnnotations();
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
            }
          console.log("processor author is:", processor.author);
          sendResponse({farewell: document.URL + ": message received"});
  });
  */
  
});
