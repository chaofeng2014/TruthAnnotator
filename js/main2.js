/*

  truth-annotator
  Version 0.0.1
  (c) 2014 by Yu, Shuangping

*/

Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

/*
  After the page load, using multiple lists to store the information from the current html
    * tweet id list (string)
    * user name list (string)
    * tweet text node list (node)
*/

var _gUser = "";

$(document).ready(function() {
  
  chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
          console.log("received message!");
          this._gUser = request.nickname;
          console.log(_gUser);
          if(_gUser != ""){
            initPopline();
            console.log("popline inited");
          }
          else{
            destroyExistingPopline();
            console.log("popline destoryed");
          }
          sendResponse({farewell: document.URL + ": message received"});
  });

  chrome.storage.sync.get("nickname", function(data){
    console.log("data is ", data);
    _gUser = data.nickname;
    console.log("_gUser is  ", _gUser);

    if(_gUser != "" & _gUser != undefined){
      initPopline();
      console.log("popline inited");
    }
  });
  
  chrome.storage.sync.get("email", function(data){
    //console.log("data is ", data);
  });

  var posts = parseTweetInfo(highlightNode);
  var highlightNode = [];
  var currentTarget;

  queryDB(posts);

  // Initialize Rangy module
  rangy.init();
  
  // Create div into the HTML file to store the info
  createStoreDiv();
  
 
  // React with the click event: updating lists, check if tweet is selected then write the selected information to html 
  $(document.body).on("mousedown", ".js-tweet-text", function(event) {
    currentTarget = event.target;
  }).on("mouseup", function(event) {
    var selection = rangy.getSelection();

    if (selection.rangeCount > 0) {
      var selectText = selection.toString();
      console.log("the selection is : " + selectText);

      // If the selection is not empty, check if it overlap with existing annotated parts 
      if (selectText.length != 0 && !($.trim(selectText) === "")) {
        var selectElement = currentTarget;

        var textRange = selection.saveCharacterRanges(selectElement);

        var infoElement = getElementWithTweetInfo(selectElement);
        var username = infoElement.attr("data-screen-name");
        var tweetId = infoElement.attr("data-tweet-id");

        setHtmlElements(tweetId, username, selectText, textRange[0]);

        console.log("tweet id: ", tweetId, "user name ", username);
      }
    }
  });

  $(window).scroll(function() {
    //every time scroll, the list refresh
    var updatePosts = parseTweetInfo(highlightNode);

    var origTweetNumber = Object.keys(posts).length;
    var newTweetNumber = Object.keys(updatePosts).length;

    if (newTweetNumber > origTweetNumber) {
      queryDB(updatePosts);
      posts = updatePosts;

      destroyExistingPopline();
    }
  });
});

function initPopline(){
    $(document.body).on("mouseenter", ".js-stream-item", function(event) {
      $(event.target).popline();
    })
    
    $(document.body).on("mouseenter", ".post-body", function(event) {
      $(event.target).popline();
    })
  }
  

function destroyExistingPopline() {
  instances = $.popline.instances;
  for (var i = 0; i < instances.length; i++) {
    if (instances[i].target.data("popline") !== undefined) {
      instances[i].target.data("popline").destroy();
    }
  }
}

function highlightText(element, textRange) {
  var range = rangy.createRange(element);
  var characterRange = textRange.characterRange;

  range.selectCharacters(element, characterRange.start, characterRange.end);
  var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

  if (rangy.supported && classApplierModule && classApplierModule.supported) {
    var boldRedApplier = rangy.createCssClassApplier("normalYellowBg");
    boldRedApplier.applyToRange(range);
  }
}

/*
  Query database and highlight node with annotation
*/
function queryDB(posts) {
  // Query through Parse database
  var OpinionObject = Parse.Object.extend("OpinionObject");
  var idQuery = new Parse.Query(OpinionObject);

  idQuery.containedIn("tweetId", Object.keys(posts));

  idQuery.find({
    success: function(results) {
      console.log("Find " + results.length.toString() + " results!");

      if (results.length != 0) {
        var selectedText = {};
        for (var j = 0; j < results.length; j++) {
          id = results[j].get('tweetId');

          // Here assume the postId list does not contain any duplicated id
          if (posts[id] !== undefined) {
            text = results[j].get("selectedText");
            textRange = results[j].get('textRange');

            if (selectedText[id] === undefined) {
              selectedText[id] = [];
            }

            // Collect the selected text for each ID
            selectedText[id].push(text);
            highlightText(posts[id].element, textRange);
          }
        }
        
          for (var id in selectedText) {
            $(posts[id].element).popinfo({"selectedText" : selectedText[id]});
          }
      }
    },
    error: function(error){
      console.log("could not finish the query");
    }
  });
}

/*
  Organize all the tweet text node into an object:
  {
    tweetId : {
      username: [String],
      element: [HTML Element],
    },
    ...
  }
*/
function parseTweetInfo(highlightNode) {
  var posts = {};
  
  highlightNode = [];

  var hlNodes = $(".normalYellowBg");
  hlNodes.each(function() {
    highlightNode.push(this);
  });

  $(".js-tweet-text").each(function() {
    var userName, tweetId;
    var infoParent = getElementWithTweetInfo(this)

    userName = infoParent.attr("data-screen-name");
    tweetId = infoParent.attr("data-tweet-id");

    posts[tweetId] = {username : userName, element : this};
  });

  return posts;
}

/*
  Find the correct parent element with tweet info embedded
  Either the parent or the parent of the parent has the attributes
*/
function getElementWithTweetInfo(element) {
  thisParent = $(element).parent();

  if (thisParent.is("[data-screen-name]")) {
    parentElement = thisParent;
  } else {
    parentElement = thisParent.parent();
  }

  return parentElement;
}
  
function createStoreDiv() {
  var div = document.createElement("div");
  div.setAttribute("id", "ta-store");
  document.body.appendChild(div);

  div.style.visibility = "hidden";
}
  
function setHtmlElements(id, name, text, textRange) {
  console.log("the global variable is " + _gUser);
  var storeDiv = $("div#ta-store");

  storeDiv.data("tweet-id", id);
  storeDiv.data('username', name);
  storeDiv.data('select-text', text);
  storeDiv.data('text-range', textRange);
}
