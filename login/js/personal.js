Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

$(document).ready(function(){
      var currentUser = Parse.User.current();
    console.log("the current user is ", currentUser.id);
    var currentUserId = showNickname();
    //alert("showNickname already done");
    //generateToggleHTML();
    generateRecentAnnotations();
    $("#personal-logout").click(function(){
      Parse.User.logOut();
      //removeStorage();
      //location.reload();
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
  
  //query.matchesKeyInQuery("objectId","annotationId", innerQuery);
  //alert(query);
  //query.descending("updatedAt");
  //query.limit(10);
  innerQuery.find({
    success: function(objects) {
      var inHtml_title = '<p class=stat-title id=stat-title>10 Recent Annotations<br></p><hr>'; 
      $("#recentAnnotation").html(inHtml_title);
      //queryCurrentUser(objects, currentUserId);
      //alert("Successfully retrieved " + objects[0].get('username') + " scores.");
      for (var i = 0; i < objects.length; i++){
        //generateAnnotation(objects[i], i);
        getPersonalAnnotation(objects[i].get("annotationId"));
        
        //var annotationId = objects[i].get("annotationId");
        

        console.log(objects[i].get("annotationId"));
      }
    }
  });
}

function getPersonalAnnotation(object) {
 // alert(object);
  // var annotationsQuery = Parse.Object.extend("Annotation");
  // var query = new Parse.Query(annotationsQuery);
  //       //query.equalTo("objectId",object);
  // query.find({
  //           success: function(iobjects) {
  //             console.log(iobjects);
  //           }
  //       });

  var Annotator = Parse.Object.extend("Annotation");
  var query = new Parse.Query(Annotator);
  query.equalTo("objectId",object);
  //query.descending("hostDomain");
  //query.limit(10);
  query.find({
    success: function(objects) {
      //var inHtml_title = '<p class=stat-title id=stat-title>Top 10 Annotators<br></p><hr>'; 
      //$("#annotators").html(inHtml_title);
      //queryCurrentUser(objects, currentUserId);
      //alert("Successfully retrieved " + objects[0].get('objectId') + " scores.");
      //for (var i = 0; i < objects.length; i++){
      //  generateAnnotator(objects[i], i);
      //}
    }
  });
}

function generateToggleHTML() {
  var Annotation = Parse.Object.extend("Annotation");
  var query = new Parse.Query(Annotation);
  query.descending("numberOfAgree");
  query.limit(10);
  query.find({
    success: function(objects) {
      var inHtml_title = '<p class=stat-title id=stat-title>Top 10 Agreed Annotations<br></p><hr>'; 
      $("#agreed").html(inHtml_title);
      //queryCurrentUser(objects, currentUserId);
      for (var i = 0; i < objects.length; i++){
        generateAnnotation(objects[i], i, "agreed");
      }
      query.descending("numberOfDisagree");
      query.limit(10);
      query.find({
        success: function(objects) {
          var inHtml_title = '<p class=stat-title id=stat-title>Top 10 Disagreed Annotations<br></p><hr>'; 
          $("#disagreed").append(inHtml_title);
          //queryCurrentUser(objects, currentUserId);
          for (var i = 0; i < objects.length; i++){
            generateAnnotation(objects[i], i+10, "disagreed");
          }
          //_callback();
        }
      });
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


function generateAnnotator(object, index){
  //var opinion;
    var btnup_pop = makeButton ('btnup_pop', 'gray');
    var selectedText = object.get('nickname');
    var author = object.get('nickname');
    var count = object.get('numOfAnnotation');
    //var disagree = object.get('numberOfDisagree');
    //var source = object.get('hostDomain');
    var inHtml_user = '<p class=stat-text id=stat-text-'+ index +'>  ' + selectedText + ': ' + count +' </p>';
    var inHtml_count = '<span class=stat-count id=pop_count> times: ' + count + '</span>';
    var inHtml_pop = inHtml_user  + '<hr>';
    $("#top-annotators").append(inHtml_pop);
    var linkId = '#pop_goPost_' + index;
    $(linkId).data("annotator", object);
}

function generateNewTab(node){
  //console.log(node.data());
  var postId = node.data("annotation").get('postId');
  var userName = node.data("annotation").get('userName');
  url = 'https://twitter.com/' + userName + '/status/' + postId;
  window.open(url);
}

function bindEvent(userId){

/*
  $('#thumbup_pop, #thumbdown_pop, #thumbup_con, #thumbdown_con').click(function(){
    processVote($(this), userId);
  });
  
  $('#thumbup_pop, #thumbdown_pop, #thumbup_con, #thumbdown_con').click(function(){
    generateModal($(this));
  });
*/
  for (var i = 0; i < 20; i++){
    var linkId = '#pop_goPost_' + i;
    $(linkId).click(function(){
      generateNewTab($(this));
    });
  }
 
  $("#welcome-logout").click(function(){
      Parse.User.logOut();
      //removeStorage();
      //location.reload();
      window.location.href = 'personal.html';
  });
  
  $("#welcome-close").click(function(){
    window.close();
  });
}

/*
function queryCurrentUser(objects, userId, _callback){
  var UserAnnotation = Parse.Object.extend("UserAnnotation");
  var query = new Parse.Query(UserAnnotation);
  query.equalTo('annotationId', annotationId);
  query.equalTo('userId', userId);
  query.find({
      success: function(results) {
        _callback(results);
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
  });
}
*/

function makeButton(btn, color){
  var btnClass;
  var font;
  var id;
  var button;
  if (btn === 'btnup_pop' | btn === 'btnup_con'){
    //console.log("inside");
    btnClass = '"btnup"';
    font = 'ta-like';
    if(btn === 'btnup_pop')
    id = '"thumbup_pop"';
    else
    id = '"thumbup_con"';
  }
  else {
    btnClass = '"btndown"';
    font = 'ta-dislike';
    if(btn === 'btndown_pop')
    id = '"thumbdown_pop"';
    else
    id = '"thumbdown_con"';
  }
  button = '<span class=' + btnClass + ' id=' + id + ' style="color:'+ color + '"; data-toggle="modal" data-target="#myModal"><i class="fa ' + font + '"></i></span>';
  return button;
}

/*
function removeStorage(){
  chrome.storage.sync.set({objectId: "", username: "", nickname:""}, function(){
  console.log('local nickname removed');
  });
}
*/

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

