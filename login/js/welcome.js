Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

/*
var _userOpinion;
var _popUserName;
var _conUserName;
var _popPostId;
var _conPostId;
var _popObject;
var _conObject;
*/
$(document).ready(function(){
    //var currentUserId = showNickname();
    generateToggleHTML();
    generateTopUser();
});

function generateTopUser() {
  var Annotator = Parse.Object.extend("User");
  var query = new Parse.Query(Annotator);
  query.descending("numOfAnnotation");
  query.limit(10);
  query.find({
    success: function(objects) {
      var inHtml_title = '<p class=stat-title id=stat-title>top 10 agreed annotator<br></p><hr>'; 
      $("#top-10-annotator").html(inHtml_title);
      //queryCurrentUser(objects, currentUserId);
      alert("Successfully retrieved " + objects[0].get('username') + " scores.");
      for (var i = 0; i < objects.length; i++){
        generateAnnotator(objects[i], i);
      }
    }
  });
}



function generateToggleHTML( _callback) {
  var Annotation = Parse.Object.extend("Annotation");
  var query = new Parse.Query(Annotation);
  query.descending("numberOfAgree");
  query.limit(10);
  query.find({
    success: function(objects) {
      var inHtml_title = '<p class=stat-title id=stat-title>top 10 agreed annotations<br></p><hr>'; 
      $("#post-stat-pop").html(inHtml_title);
      //queryCurrentUser(objects, currentUserId);
      alert("Successfully retrieved " + objects[0].get('username') + " scores.");

      for (var i = 0; i < objects.length; i++){
        generateAnnotation(objects[i], i);
      }
      
      query.descending("numberOfDisagree");
      query.limit(10);
      query.find({
        success: function(objects) {
          var inHtml_title = '<p class=stat-title id=stat-title>top 10 disagreed annotations<br></p><hr>'; 
          $("#post-stat-pop").append(inHtml_title);
          //queryCurrentUser(objects, currentUserId);
          for (var i = 0; i < objects.length; i++){
            generateAnnotation(objects[i], i+10);
          }
          _callback();
        }
      });
    }
  });
}
function generateAnnotator(object, index){
  //var opinion;
    var btnup_pop = makeButton ('btnup_pop', 'gray');
    var selectedText = object.get('nickname');
    var author = object.get('nickname');
    var count = object.get('numOfAnnotation');
    //var disagree = object.get('numberOfDisagree');
    //var source = object.get('hostDomain');
    var inHtml_user = '<p class=stat-text id=stat-text-'+ index +'>  ' + selectedText + ' </p>';
    var inHtml_count = '<span class=stat-count id=pop_count> times: ' + count + '</span>';
    var inHtml_pop = inHtml_user +inHtml_count + '<hr>';
    $("#top-10-annotator").append(inHtml_pop);
    var linkId = '#pop_goPost_' + index;
    $(linkId).data("annotator", object);
}

function generateAnnotation(object, index){
  //var opinion;
    var btnup_pop = makeButton ('btnup_pop', 'gray');
    var btndown_pop = makeButton ('btndown_pop', 'gray');
    var selectedText = object.get('selectedText');
    var author = object.get('userName');
    var agree = object.get('numberOfAgree');
    var disagree = object.get('numberOfDisagree');
    var source = object.get('hostDomain');
    var inHtml_source = '<p class=stat-source>from ' + source + ': </p>'; 
    var inHtml_text = '<p class=stat-text id=stat-text-'+ index +'> " ' + selectedText + ' "</p>';
    var inHtml_author = '<p class=stat-author>' +'--by '+ author + '</p>';
    var inHtml_agree = '<span class=stat-agree id=pop_agree>' + agree + '</span>';
    var inHtml_disagree = '<span class=stat-disagree id=pop_disagree>' + disagree + '</span>';
    var inHtml_goPost = '<span class=stat-goPost id=pop_goPost_'+ index+'> see original post </span>';
    var inHtml_pop = inHtml_source + inHtml_text + inHtml_author + btnup_pop + inHtml_agree + btndown_pop + inHtml_disagree + inHtml_goPost + '<hr>';
    $("#post-stat-pop").append(inHtml_pop);
    var linkId = '#pop_goPost_' + index;
    $(linkId).data("annotation", object);
}

function generateNewTab(node){
  //console.log(node.data());
  var postId = node.data("annotation").get('postId');
  var userName = node.data("annotation").get('userName');
  url = 'https://twitter.com/' + userName + '/status/' + postId;
  window.open(url);
}

function bindEvent(userId){
  for (var i = 0; i < 20; i++){
    var linkId = '#pop_goPost_' + i;
    $(linkId).click(function(){
      generateNewTab($(this));
    });
  }
 
  $("#welcome-logout").click(function(){
      Parse.User.logOut();
      removeStorage();
      chrome.browserAction.setIcon({path:'../../img/T-400_white.png'}, function()
      {
        window.close();
      });
  });
  
  $("#welcome-close").click(function(){
    window.close();
  });
}



function makeButton(btn, color){
  var btnClass;
  var font;
  var id;
  var button;
  if (btn === 'btnup_pop' | btn === 'btnup_con'){
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
  return currentUser.id;
}

