Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");


$(document).ready(function(){
    var currentUser = Parse.User.current();
    if(currentUser){
        alert("welcome");
        window.location.href = 'welcome.html';
        alert("login already");
    }
    
    $("#login-password").focus();

          $("#login").click(function(){ 
          console.log("login in");
          var email = $("#login-email").val();
          var password = $("#login-password").val();

          if (email === "") {
              $('#login-info').html('<p>Please enter your registed email</p>');
              setTimeout( function(){$('#login-info').html('<p style="visibility:hidden">info</p>');}, 5000 );
          }

          else if (password === "") {
              $('#login-info').html('<p>Please enter your password</p>');
              setTimeout( function(){$('#login-info').html('<p style="visibility:hidden">info</p>');}, 5000 );
          }
            
          else {
            console.log("log in function");
            login(); 
          }
      });
          $("#close").click(function(){window.close();}); 
    
    $("#logout").click(function(){ 
        Parse.User.logOut();
        window.location.reload();
        });

      function login(){
          var email = $("input[name=email]").val();
          var password = $("input[name=pass]").val();
          
          Parse.User.logIn(email.toLowerCase(), password.toLowerCase(), {
              success: function(user) {
                console.log(user);
                var nickname = user.get("nickname");
                var username = user.get("username");
                var objectId = user.id;
                console.log(objectId);
                //sendToContentLogin(objectId, username, nickname);
                saveToStorage(objectId, username, nickname);
                chrome.browserAction.setIcon({path:'../../img/T-400.png'}, function()
                { 
                  window.location.reload();
                });
              },
              error: function(user, error){
                console.log("Error: ", error);
                  $('#login-info').html('<p>email or password is incorrect</p>');
                setTimeout( function(){$('#login-info').html('<p style="visibility:hidden">info</p>');}, 5000 );
              },
          });
        }
        
        
        
        function saveToStorage(objectId, username, nickname){
          chrome.storage.sync.set({'objectId': objectId, 'username': username, 'nickname': nickname}, function() {
             console.log('Settings saved to local storage');
          });
        } 
});
