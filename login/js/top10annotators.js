Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

$(document).ready(function(){
    //var currentUserId = showNickname();
    generateToggleHTML( function(){
      bindEvent();
    });
});


function generateToggleHTML( _callback) {
  var Annotation = Parse.Object.extend("Annotation");
  var query = new Parse.Query(Annotation);
  query.descending("numberOfAgree");
  query.limit(10);
  query.find({
    success: function(objects) {
      alert("Successfully retrieved " + results.length + " scores.");
      var inHtml_title = '<p class=stat-title id=stat-title>top 10 agreed annotations<br></p><hr>'; 

      $("#post-stat-pop").html(inHtml_title);
      //queryCurrentUser(objects, currentUserId);
      for (var i = 0; i < objects.length; i++){
        var object = results[i];
      	alert(object.id + ' - ' + object.get('selectedText'));
      }
      //query.descending("numberOfDisagree");
      //query.limit(10);
    }
  });
}