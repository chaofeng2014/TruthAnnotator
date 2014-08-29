//FIXME: this is unsafe way to match URL, use tab query instead

//Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

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
// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);
