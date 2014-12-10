Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

$(document).ready(function(){
      var currentUser = Parse.User.current();
    console.log("the current user is ", currentUser.id);
    var currentUserId = showNickname();
    generateRecentAnnotations();
    $("#personal-logout").click(function(){
      Parse.User.logOut();
      window.location.href = 'index.html';
    });  
});


function generateRecentAnnotations() {

  var user = Parse.User.current();
  var userid = user.id;

  var username = user.get("username");
  var annotationIdQuery = Parse.Object.extend("UserAnnotation");
  
  var innerQuery = new Parse.Query(annotationIdQuery);
  innerQuery.equalTo("userId", userid);

  innerQuery.find({
    success: function(objects) {
      var inHtml_title = '<p class=stat-title id=stat-title>Your Annotations<br></p><hr>'; 
      $("#recentAnnotation").html(inHtml_title);
      var j = 1;
      for (var i = 0; i < objects.length; i++){
        getPersonalAnnotation(objects[i].get("annotationId"), j);
        j++;
      }
    }
  });
}

function getPersonalAnnotation(obj) {
  var Annotation = Parse.Object.extend("Annotation");
  var query = new Parse.Query(Annotation);

  query.equalTo("objectId",obj);
  query.find({
            success: function(object) {
              var selectedText = object[0].get('selectedText');
             var source = object[0].get('hostDomain');
              var inHtml_source = '&emsp; &emsp;'+ '(' + source  + ')';
              var inHtml_text = '<p class=stat-text id=stat-text> " ' + selectedText + ' "</p>';
              var inHtml_pop = inHtml_text + " " + inHtml_source + '<hr>';
              $("#10-recent").append(inHtml_pop);
            }
        });
}


//inHtml_text + source
function generateAnnotation(object, index, type){
  //var opinion;
    var btnup_pop = makeButton ('btnup_pop', 'gray');
    var btndown_pop = makeButton ('btndown_pop', 'gray');
    var selectedText = object.get('selectedText');
    var author = object.get('userName');
    var agree = object.get('numberOfAgree');
    var disagree = object.get('numberOfDisagree');
    var source = object.get('hostDomain');
    var date = object.updatedAt;
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    //console.log(date);
    var inHtml_source = '--by '+ author  +'&emsp; &emsp;'+ '(' + source  + ')' + ' ' + month + '/' + day + '/'+ year;; 
    var inHtml_text = '<p class=stat-text id=stat-text-'+ index +'> " ' + selectedText + ' "</p>';
    var inHtml_author = '<p class=stat-author>' +'--by '+ author + '</p>';
    var inHtml_agree = '<span class=stat-agree id=pop_agree>' + agree + '</span>';
    var inHtml_disagree = '<span class=stat-disagree id=pop_disagree>' + disagree + '</span>';
    var inHtml_goPost = '<span class=stat-goPost id=pop_goPost_'+ index+'> see original post </span>';
    //var inHtml_date = '<span>'+ month + '/' + day + '/'+ year + '</span>';
    var inHtml_pop = inHtml_text + inHtml_source + btnup_pop + '<hr>';
    $("#10-recent").append(inHtml_pop); 
    var linkId = '#pop_goPost_' + index;
    $(linkId).data("recentAnnotation", object);
}




function showNickname(){
  console.log("showNickname running");
  //$("#show-nickname").html("123");

  var currentUser = Parse.User.current();
  if(!currentUser){
      return;
      //window.location.href = "index.html";
  }

  var inHtml1 = '<h4>Hello, '; 
  var inHtml2 = currentUser.get("nickname") + ' !' + '</h4>';
  var inHtml = inHtml1 + inHtml2;
  console.log(inHtml);
  $("#show-nickname").html(inHtml);
  return currentUser.id;
}

