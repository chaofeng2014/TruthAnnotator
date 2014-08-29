Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

$(document).ready(function(){
    var currentUser = Parse.User.current();
    if(!currentUser){
        window.location.href = "login.html";
    }

    var inHtml1 = '<h1>Hello, <br>'; 
    var inHtml2 = currentUser.get("nickname") + ' !' + '</h1>';
    var inHtml = inHtml1 + inHtml2;
    $("#welcome-toggle").html(inHtml);
    
    $("#logout").click(function(){
        Parse.User.logOut();
        sendToContentLogout();
        removeStorage();
        window.location.href = "login.html";
    });

    function sendToContentLogout(){
        console.log("sending to content");
        //chrome.extension.getBackgroundPage().chrome.tabs.query({url:'*://twitter.com/'}, function(tabs) {
        chrome.tabs.query({url:'*://twitter.com/'}, function(tabs) {
          for (var i = 0; i < tabs.length; i++){
            chrome.tabs.sendMessage(tabs[i].id, {objectId: "", username: "", nickname:""}, function(response) {
              console.log(response.farewell);
            });
          }
        }); 
    }

    function removeStorage(){
      chrome.storage.sync.set({objectId: "", username: "", nickname:""}, function(){
        console.log('local nickname removed');
      });
    }
});
