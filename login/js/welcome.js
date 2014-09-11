Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

$(document).ready(function(){
    showNickname();
    queryStat();
    $("#logout").click(function(){
        Parse.User.logOut();
        //sendToContentLogout();
        removeStorage();
        chrome.browserAction.setIcon({path:'../../img/T-400_white.png'}, function()
        {
          console.log('iconCC');
          window.close();
        });
    });
});

function queryStat() {
  var Annotation = Parse.Object.extend("Annotation");
  var query = new Parse.Query(Annotation);
  query.descending("numberOfAgree");
  query.first({
    success: function(object) {
      //console.log(object);
      var selectedText = object.get('selectedText');
      var author = object.get('userName');
      var agree = object.get('numberOfAgree');
      var inHtml1 = '<p>Most Agree: <br>'; 
      var inHtml2 =  '"' + selectedText + '"</p>';
      var inHtml = inHtml1 + inHtml2;
      $("#tweet-stat").html(inHtml);
     // console.log(selectedText, author, agree);
      
    // Successfully retrieved the object.
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });
}

function removeStorage(){
  chrome.storage.sync.set({objectId: "", username: "", nickname:""}, function(){
  console.log('local nickname removed');
  });
}

function showNickname(){
  var currentUser = Parse.User.current();
  if(!currentUser){
      window.location.href = "login.html";
  }

  var inHtml1 = '<h1>Hello, '; 
  var inHtml2 = currentUser.get("nickname") + ' !' + '</h1>';
  var inHtml = inHtml1 + inHtml2;
  $("#welcome-toggle").html(inHtml);
}


    /*
    function sendToContentLogout(){
        console.log("sending to content");
        chrome.tabs.query({url:'*://twitter.com/'}, function(tabs) {
          for (var i = 0; i < tabs.length; i++){
            chrome.tabs.sendMessage(tabs[i].id, {objectId: "", username: "", nickname:""}, function(response) {
              console.log("change sent to content script");
            });
          }
        }); 
    }
    */
