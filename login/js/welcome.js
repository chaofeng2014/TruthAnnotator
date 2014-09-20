Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

var _userOpinion;
var _popUserName;
var _conUserName;
var _popPostId;
var _conPostId;
$(document).ready(function(){
    var currentUserId = showNickname();
    generateHTML(currentUserId, function(){
      bindEvent(currentUserId);
    });
});

function generateHTML(currentUserId, _callback) {

  var btnup_pop = '<span class="btnup" id=thumbup_pop style="color:gray;" title=""><i class="fa fa-thumbs-up"></i></span>';
  var btndown_pop = '<span class="btndown" id=thumbdown_pop style="color:gray;" title=""><i class="fa fa-thumbs-down"></i></span>';
  var btnup_con = '<span class="btnup" id=thumbup_con style="color:gray;"title=""><i class="fa fa-thumbs-up"></i></span>';
  var btndown_con = '<span class="btndown" id=thumbdown_con style="color:gray;"title=""><i class="fa fa-thumbs-down"></i></span>';
  var Annotation = Parse.Object.extend("Annotation");
  var query = new Parse.Query(Annotation);
  query.descending("numberOfAgree");
  query.first({
    success: function(object) {
      _popUserName = object.get('userName'); 
      _popPostId = object.get('postId');
      //chrome.storage.sync.set({popAnnotation: object});
      queryCurrentUser(object.id, currentUserId, function(result){
          var opinion;
          if (result.length === 0){opinion = 0;}
          else {opinion = result[0].get('opinion');}
          var selectedText = object.get('selectedText');
          var author = object.get('userName');
          var agree = object.get('numberOfAgree');
          var disagree = object.get('numberOfDisagree');
          var source = object.get('hostDomain');
          var inHtml_title = '<p class=stat-mostAgree>Most popular (' + source + '): <br></p>'; 
          var inHtml_text = '<p class=stat-text>'+'" ' + selectedText + ' "</p>';
          var inHtml_author = '<p class=stat-author>' +'--by '+ author + '</p>';
          var inHtml_agree = '<span class=stat-agree id=pop_agree>' + agree + '</span>';
          var inHtml_disagree = '<span class=stat-disagree id=pop_disagree>' + disagree + '</span>';
          var inHtml_goPost = '<span class=stat-disagree id=pop_goPost> original post </span>';
          if(opinion === 1){
            btnup_pop = '<span class="btnup" id=thumbup_pop style="color: blue;" title=""><i class="fa fa-thumbs-up"></i></span>';
          }
          else if(opinion === -1){
            btndown_pop = '<span class="btndown" id=thumbdown_pop style="color: blue;" title=""><i class="fa fa-thumbs-down"></i></span>';
          }
          var inHtml_pop = inHtml_title + inHtml_text + inHtml_author + btnup_pop + inHtml_agree + btndown_pop + inHtml_disagree + inHtml_goPost;
          $("#post-stat-pop").html(inHtml_pop);
          $(".stat-mostAgree").data("object", object);
          query.descending("numberOfDisagree");
          query.first({
            success: function(object) {
              //chrome.storage.sync.set({conAnnotation: object});
              _conUserName = object.get('userName'); 
              _conPostId = object.get('postId');
              queryCurrentUser(object.id, currentUserId, function(result){
                var opinion;
                if (result.length === 0){opinion = 0;}
                else {opinion = result[0].get('opinion');}
                var selectedText = object.get('selectedText');
                var author = object.get('userName');
                var agree = object.get('numberOfAgree');
                var disagree = object.get('numberOfDisagree');
                var source = object.get('hostDomain');
                var inHtml_title = '<p class=stat-mostDisagree>Most controversial (' + source + '): <br></p>'; 
                var inHtml_text = '<p class=stat-text>'+'" ' + selectedText + ' "</p>';
                var inHtml_author = '<p class=stat-author>' +'--by '+ author + '</p>';
                var inHtml_agree = '<span class=stat-agree id=con_agree>' + agree + '</span>';
                var inHtml_disagree = '<span class=stat-disagree id=con_disagree>' + disagree + '</span>';
                var inHtml_goPost = '<span class=stat-disagree id=con_goPost> original post </span>';
                if(opinion === 1){
                  btnup_con = '<span class="btnup" id=thumbup_con style="color: blue;"title=""><i class="fa fa-thumbs-up"></i></span>';
                }
                else if(opinion === -1){
                  btndown_con = '<span class="btndown" id=thumbdown_con style="color: blue;"title=""><i class="fa fa-thumbs-down"></i></span>';
                }
                var inHtml_con = inHtml_title + inHtml_text + inHtml_author + btnup_con +inHtml_agree +  btndown_con + inHtml_disagree + inHtml_goPost;
                $("#post-stat-con").html(inHtml_con);
                $(".stat-mostDisagree").data("object", object);

                _callback();
              });
            },
            error: function(error) {
              alert("Error: " + error.code + " " + error.message);
            }
          });
      });
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });
}

function queryCurrentUser(annotationId, userId, _callback){
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
  
function bindEvent(userId){
  $('#thumbup_pop, #thumbdown_pop, #thumbup_con, #thumbdown_con').click(function(){
    processVote($(this), userId);
  });
  
  $('#thumbup_pop, #thumbdown_pop, #thumbup_con, #thumbdown_con').tooltip(
    {content: "Note: see the original post to vote"},
    {position: {my:"left top-30", at:"right+10 center"}}
  );

  $('#pop_goPost, #con_goPost').click(function(){
    generateNewTab($(this));
  });
 
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

function generateNewTab(node){
  console.log('clicked');
  if(node.attr('id') === 'pop_goPost'){
    _popUserName;
    url = 'https://twitter.com/' + _popUserName + '/status/' + _popPostId;
    window.open(url);
  }
  else {
    var userName = _conUserName;
    url = 'https://twitter.com/' + _conUserName + '/status/' + _conPostId;
    window.open(url);
   } 
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
    /*
    if(node.css("color") === "rgb(0, 0, 255)") 
      chrome.storage.sync.set({thumbup_pop: 0});
    else
      chrome.storage.sync.set({thumbup_pop: 1});
    */
  }

  else if (node.attr('id') === 'thumbdown_pop'){
    numNode = $("#pop_disagree");
    num = parseInt(numNode.html());
    counterBtn = $('#thumbup_pop');
    counterNumNode = $('#pop_agree');
    counterNum = parseInt(counterNumNode.html());
    annotationObject = $("stat-mostAgree").data("object");
    /*
    if(node.css("color") === "rgb(0, 0, 255)") 
      chrome.storage.sync.set({thumbdown_pop: 0});
    else
      chrome.storage.sync.set({thumbdown_pop: 1});
    */
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

