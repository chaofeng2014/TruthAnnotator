Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

$(document).ready(function(){
    var currentUser = Parse.User.current();
    console.log("the current user is ", currentUser);
    if(currentUser){
        window.location.href = 'personal.html';
    }
    
    $("#login-password").focus();

    $("#login").click(function(){ 
          var email = $("#login-email").val();
          var password = $("#login-password").val();

          if (email === "") {
              $('#login-info').html('<p>Please enter your registed email</p>');
              setTimeout( function(){$('#login-info').html('<p style="visibility:hidden">info</p>');}, 10000 );
          }

          else if (password === "") {
              $('#login-info').html('<p>Please enter your password</p>');
              setTimeout( function(){$('#login-info').html('<p style="visibility:hidden">info</p>');}, 10000 );
          }
            
          else {
            login(); 
          }
      });
    
    $("#forgot-password").click(function(){ 
        var email = $("#forgot-password-email").val();
        Parse.User.requestPasswordReset(email, {
        success: function() {
        // Password reset request was sent successfully
        alert("Password reset request was sent successfully");
        $("#forgot-password-email").val('');
        },
       error: function(error) {
      // Show the error message somewhere
      alert("Error: " + error.code + " " + error.message);
       }
      });
    });


    $("#logout").click(function(){ 
        Parse.User.logOut();
        window.location.reload();
    });

    $("#close").click(function(){window.close();}); 

      function login(){
          var email = $("input[name=email]").val();
          var password = $("input[name=pass]").val();
          
          Parse.User.logIn(email.toLowerCase(), password.toLowerCase(), {
              success: function(user) {
                console.log("parse login successed");
                var nickname = user.get("nickname");
                var username = user.get("username");
                var objectId = user.id;

                //TODO

                //document.cookie="username=" + username;
                /*
                chrome.runtime.sendMessage({'objectId': objectId, 'username': username, 'nickname': nickname}, function(response) {
                  console.log("content messaging feedback received");
                });
                */


                window.location.reload();
              
              },
              error: function(user, error){
                console.log("Error: ", error);
                  $('#login-info').html('<p>The email or password you entered is incorrect.</p>');
                setTimeout( function(){$('#login-info').html('<p style="visibility:hidden">info</p>');}, 30000 );
              },
          });
      }
        
        /*
        function sendToContentLogin(objectId, username, nickname){
            console.log("sending to content");
            chrome.tabs.query({}, function(tabs) {
              for (var i = 0; i < tabs.length; i++){
                //console.log("the nick name will be sent ", nickname);
                chrome.tabs.sendMessage(tabs[i].id, {objectId: objectId, username: username, nickname:nickname}, function() {
                  console.log('login change sent to content script');
                });
              }
            }); 
        }
        
        function saveToStorage(objectId, username, nickname){
          chrome.storage.sync.set({'objectId': objectId, 'username': username, 'nickname': nickname}, function() {
             console.log('Settings saved to local storage');
          });
        } 
        */
});
