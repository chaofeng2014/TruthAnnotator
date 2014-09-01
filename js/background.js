//FIXME: this is unsafe way to match URL, use tab query instead

//Listen for any changes to the URL of any tab.
function pullLocalStorage(){
  //pull from local storage to determine the icon
  chrome.storage.sync.get(['objectId', 'username','nickname'], function(data){
    if (data.objectId !== "" & data.username !== "" & data.nickname !== "" & 
        data.objectId !== undefined & data.username !== undefined & data.nickname !== undefined){
        chrome.browserAction.setIcon({path:'../../util/T-400.png'}, function(){console.log("icon changed")});
    }
  });
}

chrome.tabs.onUpdated.addListener(pullLocalStorage);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.question === "what is the host domain?"){
      console.log("question received");
      sendResponse({answer: sender.tab.url});
    }
});

/*
function checkForValidUrl(tabId, changeInfo, tab) {
    var URLlist = ["twitter.com", "cnn.com"];
    // If the tabs url contains URLlist 
    if(isCandidateURL(tab, URLlist)){
    // ... show the page action.
        chrome.pageAction.show(tabId);
        //tellContent();
    }
};

function isCandidateURL(tab, URLlist){
    for(i = 0; i < URLlist.length; i++){
        if(tab.url.indexOf(URLlist[i]) != -1){
            return true;
        }
    }
    return false;
};
*/
