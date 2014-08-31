Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

$(document).ready(function(){
    $('#signup-submit').click(function(){
          var email = $("#signup-email").val();
          var password = $("#signup-password").val();
          var repassword = $("#signup-repassword").val();
          var nickname = $("#signup-nickname").val();

          if (email === "") {
            $('#signup-info').html('<p>please enter a email</p>');
            setTimeout(function(){$('#signup-info').html('<p style="visibility : hidden">info</p>');}, 5000);
          }

          else if (password != repassword) {
            $('#signup-info').html('<p>the password did not match</p>');
            setTimeout(function(){$('#signup-info').html('<p style="visibility : hidden">info</p>');}, 5000);
          }
          
          else if (password === "" || repassword === ""){
            $('#signup-info').html('<p>the password cannot be empty</p>');
            setTimeout(function(){$('#signup-info').html('<p style="visibility : hidden">info</p>');}, 5000);
          }

          else if (nickname ==="") {
            $('#signup-info').html('<p>please enter a nickname</p>');
            setTimeout(function(){$('#signup-info').html('<p style="visibility : hidden">info</p>');}, 5000);
          }

          else {
            saveParse(email, password, nickname);
          }
      });

      function saveParse(email, password, nickname){
          var user = new Parse.User();    
          user.signUp({username: email.toLowerCase(), password: password.toLowerCase(), email: email.toLowerCase(),
          nickname: nickname}, {
              success: function(user){
                  var username = user.get('username');
                  var objectId = user.id;
                  console.log(objectId);
                  //sendToContent(objectId, username, nickname);
                  saveToStorage(objectId, username, nickname);
                  chrome.browserAction.setIcon({path:'../../util/T-400.png'});
                  console.log("save succeeded");
                  window.location.href="login.html";
              },
              error: function(user, error){
                  console.log("Error: ", error);
                  console.log(error.code);
                  if (error.code === 202) {
                    $('#signup-info').html('<p>this email is registed</p>');
                    setTimeout(function(){$('#signup-info').html('<p style="visibility : hidden">info</p>');}, 5000);
                    
                  }

                  else if (error.code === 125) {
                    $('#signup-info').html('<p>the email is invalid</p>');
                    setTimeout(function(){$('#signup-info').html('<p style="visibility : hidden">info</p>');}, 5000);
                  }

                }
            });
        }
        /* 
        function sendToContent(objectId, username, nickname){
            console.log("sending to content");
            chrome.tabs.query({url:'*://twitter.com/*'}, function(tabs) {
            //chrome.tabs.query({}, function(tabs) {
              for( var i = 0; i < tabs.length; i ++){
                chrome.tabs.sendMessage(tabs[i].id, {objectId: objectId, username: username, nickname: nickname}, function(response) {
                  console.log(response.farewell);
                });
              }
            }); 
        }
        */
        
        function saveToStorage(objectId, username, nickname){
          chrome.storage.sync.set({'objectId': objectId, 'username':username, 'nickname': nickname}, function() {
             console.log('Settings saved to local storage');
          });
        } 
});

