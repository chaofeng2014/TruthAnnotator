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
    var currentUserId = showNickname();
    generateToggleHTML(currentUserId, function(){
      bindEvent(currentUserId);
    });
});

function generateToggleHTML(currentUserId, _callback) {
  var Annotation = Parse.Object.extend("Annotation");
  var query = new Parse.Query(Annotation);
  query.descending("numberOfAgree");
  query.limit(10);
  query.find({
    success: function(objects) {
      var inHtml_title = '<p class=stat-title id=stat-title>top 10 agreed annotations<br></p><hr>'; 
      $("#post-stat-pop").html(inHtml_title);
      //queryCurrentUser(objects, currentUserId);
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
function generateModal(node){
  if (node.attr('id') === 'thumbup_pop'){
    var wholePost = _popObject.get('wholePost');
    var textRange = _popObject.get('textRange');
  }
  else{
    var wholePost = _conObject.get('wholePost');
    var textRange = _conObject.get('textRange');
  }
  //console.log(wholePost);
  $(".modal-body").html(wholePost);

    //highlight the annotation
    var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;
    if (rangy.supported && classApplierModule && classApplierModule.supported) {
      var cssApplier = rangy.createCssClassApplier("whole-post-highlight");
    }
    var element = $(".modal-body").get(0);
    if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
      var range = rangy.createRange();
      console.log(textRange);
      startOffset = textRange.characterRange.start;
      endOffset = textRange.characterRange.end;
      range.setStart(element.firstChild, startOffset);
      range.setEnd(element.firstChild, endOffset);
      cssApplier.applyToRange(range);
    } else return;
}

function processVote(node,userId){
  var num;
  var numNode;

  var counterBtn; 
  var counterNumNode;
  var counterNum;

  var annotationObject;
  if (node.attr('id') === 'thumbup_pop'){
    numNode = $("#pop_agree");
    num = parseInt(numNode.html());
    counterBtn = $('#thumbdown_pop');
    counterNumNode = $('#pop_disagree');
    counterNum = parseInt(counterNumNode.html());
    annotationObject = $("stat-mostAgree").data("object");
    if(node.css("color") === "rgb(0, 0, 255)") 
      chrome.storage.sync.set({thumbup_pop: 0});
    else
      chrome.storage.sync.set({thumbup_pop: 1});
  }

  else if (node.attr('id') === 'thumbdown_pop'){
    numNode = $("#pop_disagree");
    num = parseInt(numNode.html());
    counterBtn = $('#thumbup_pop');
    counterNumNode = $('#pop_agree');
    counterNum = parseInt(counterNumNode.html());
    annotationObject = $("stat-mostAgree").data("object");
    if(node.css("color") === "rgb(0, 0, 255)") 
      chrome.storage.sync.set({thumbdown_pop: 0});
    else
      chrome.storage.sync.set({thumbdown_pop: 1});
  }
  
  else if (node.attr('id') === 'thumbup_con'){
    numNode = $("#con_agree");
    num = parseInt(numNode.html());
    counterBtn = $('#thumbdown_con');
    counterNumNode = $('#con_disagree');
    counterNum = parseInt(counterNumNode.html());
    annotationObject = $("stat-mostDisagree").data("object");
  }
  
  else {
    numNode = $("#con_disagree");
    num = parseInt(numNode.html());
    counterBtn = $('#thumbup_con');
    counterNumNode = $('#con_agree');
    counterNum = parseInt(counterNumNode.html());
    annotationObject = $("stat-mostDisagree").data("object");
  }

  if(node.css("color") === "rgb(0, 0, 255)") {
    node.css({"color" : "gray"});
    num--;
    numNode.html(num);
  }
  else {
    if(counterBtn.css("color") === "rgb(0, 0, 255)") {
      counterNum--;
      counterNumNode.html(counterNum);
    }
      node.css({"color" : "blue"});
      num++;
      //console.log(counterBtn);
      counterBtn.css({"color":"gray"});
      numNode.html(num);
  }
    // need better logic to update parse
    //chrome.storage.sync.set({popAnnotation: object});
    //counterBtn.css({"color":""});
}
*/

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

