/*
  jquery.popline.js 0.0.1

  Version: 0.0.1

  jquery.popline.js is an open source project, contribute at GitHub:
  https://github.com/kenshin54/popline.js

  (c) 2013 by kenshin54
*/

;(function(processor, rangy, $) {

  var isIMEMode = false;
  $(document).on('compositionstart', function(event) {
    isIMEMode = true;
  });
  $(document).on('compositionend', function(event) {
    isIMEMode = false;
  });

  var toggleBox = function(event) {
    if ($.popline.utils.isNull($.popline.current)) {
      return;
    }
    var isTargetOrChild = $.contains($.popline.current.target.get(0), event.target) || $.popline.current.target.get(0) === event.target;
    var isBarOrChild = $.contains($.popline.current.bar.get(0), event.target) || $.popline.current.bar.get(0) === event.target;

    if ((isTargetOrChild || isBarOrChild) && $.popline.current.isAnnotationOrDisplay()) {
      var target= $.popline.current.target, bar = $.popline.current.bar;
      if (bar.is(":hidden") || bar.is(":animated")) {
        bar.stop(true, true);
        var pos = Position().mouseup(event);
        $.popline.current.show(pos);
      }
    } else {
      $.popline.hideAllBar();
    }
  };

  var targetEvent = {
    mousedown: function(event) {
      $.popline.hideAllBar();
    },

    mouseup: function(event) {
      if (($(this).data("popline").settings.mode === "display"
           && rangy.getSelection().toString().length === 0) ||
          ($(this).data("popline").settings.mode === "annotation"
           && rangy.getSelection().toString().length > 0)) {
        $.popline.current = $(this).data("popline");
      }

      $.popline.utils.getWholeWord(); 
    },

    mouseenter: function(event) {
      if ($(this).data("popline").settings.mode === "display") {
        $(this).css("background-color", "rgba(255, 178, 0, 0.7)");
      }
    },

    mouseleave: function(event) {
      if ($(this).data("popline").settings.mode === "display") {
        var _this = this;
        setTimeout(function() {
          $(_this).css("background-color", "rgba(136, 153, 166, 0.4)");
        }, 200);
      }
    },

    click: function(event) {
      if (rangy.getSelection().toString().length === 0) {
        event.stopPropagation();
      }
    }
  }

  var Position = function() {
    var target= $.popline.current.target, bar = $.popline.current.bar, positionType = $.popline.current.settings.mode;

    var positions = {
      "annotation": {
        mouseup: function(event) {
          var rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
          var left = event.pageX - bar.width() / 2;
          var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
          if (left < 0) left = 10;
          var top = scrollTop + rect.top - bar.outerHeight() -10; 
          return {left: left, top: top};
        }
      },
      "display": {
        mouseup: function(event) {
          var rect = target.get(0).getBoundingClientRect();
          var left = rect.right;
          var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
          if (left < 0) left = 10;
          var top = scrollTop + rect.top - bar.outerHeight();
          return {left: left, top: top};
        }
      }
    };

    return positions[positionType];
  };

  $.fn.popline = function(options) {

    _arguments = arguments;
    this.each(function() {
      if (_arguments.length >= 1 && typeof(_arguments[0]) === "string" && $(this).data("popline")) {
        var func = $(this).data("popline")[_arguments[0]];
        if (typeof(func) === "function") {
          func.apply($(this).data("popline"), Array.prototype.slice.call(_arguments, 1));
        }
      } else if (!$(this).data("popline")) {
        var popline = new $.popline(options, this);
      }
    });

    if (!$(document).data("popline-global-binded")) {
      $(document).mouseup(function(event){
        var _this = this;
        setTimeout((function(){
          toggleBox.call(_this, event);
        }), 1);
      });
      $(document).data("popline-global-binded", true);
    }
  };

  $.popline = function(options, target) {
    this.settings = $.extend(true, {}, $.popline.defaults, options);
    this.target = $(target);

    this.beforeShowCallbacks = [];
    this.afterHideCallbacks = [];

    this.init();

    $.popline.addInstance(this);
  };

  $.extend($.popline, {

    defaults: {
      zIndex: 9999,
      mode: "annotation",
      enable: null,
      disable: null,
      keepSlientWhenBlankSelected: true
    },

    instances: [],

    selection: {},

    currentAnnotation: null,

    current: null,

    prototype: {
      init: function() {
        this.bar = $("<div class='popline' style='z-index:" + this.settings.zIndex + "'></div>").appendTo("body");
        this.bar.data("popline", this);
        this.target.data("popline", this);
        var me = this;

        var isEnable = function(array, name) {
          if (array === null) {
            return true;
          }
          for (var i = 0, l = array.length; i < l; i++) {
            var v = array[i];
            if (typeof(v) === "string" && name === v) {
              return true;
            } else if ($.isArray(v)) {
              if (isEnable(v, name)) {
                return true;
              }
            }
          }
          return false;
        }


        var isDisable = function(array, name) {
          if (array === null) {
            return false;
          }
          for (var i = 0, l = array.length; i < l; i++) {
            var v = array[i];
            if (typeof(v) === "string" && name === v) {
              return true;
            }else if ($.isArray(v)) {
              if ((v.length === 1 || !$.isArray(v[1])) && isDisable(v, name)) {
                return true;
              }else if (isDisable(v.slice(1), name)) {
                return true;
              }
            }
          }
          return false;
        }

        var makeButtons = function(parent, buttons) {
          for (var name in buttons) {
            var button = buttons[name];
            var mode = $.popline.utils.isNull(button.mode) ? $.popline.defaults.mode : button.mode;

            if ((mode !== me.settings.mode && mode !== "always")
                || !isEnable(this.settings.enable, name)
                || isDisable(this.settings.disable, name)) {
              continue;
            }

            var $button = $("<div><span class='pop-btn'></span></div>");

            $button.addClass("popline-button popline-" + name + "-button")

            if (button.iconClass) {
              $button.children(".pop-btn").append("<i class='" + button.iconClass + "'></i>");
            }

            if (button.text) {
              $button.children(".pop-btn").append("<span class='text " + (button.textClass || '') + "'>" + button.text + "</span>");
            }

            if (button.bgColor) {
              $button.css({'background-color': button.bgColor});
            }

            if ($.isFunction(button.beforeShow)) {
              this.beforeShowCallbacks.push({name: name, callback: button.beforeShow});
            }

            if ($.isFunction(button.afterHide)) {
              this.afterHideCallbacks.push({name: name, callback: button.afterHide});
            }

            $button.appendTo(parent);

            if (button.buttons) {
              $subbar = $("<div class='subbar'></div>");
              $button.append($subbar);
              makeButtons.call(this, $subbar, button.buttons);
              $button.click(function(event) {
                var _this = this;
                if (!$(this).hasClass("boxed")) {
                  me.switchBar($(this), function() {
                    $(_this).siblings("div").hide().end()
                         .children(".pop-btn").hide().end()
                         .children("div").show().end()
                  });
                  event.stopPropagation();
                }
              });
            } else if($.isFunction(button.action)) {
              $button.click((function(button) {
                  return function(event) {
                    button.action.call(this, event, me);
                  }
                })(button)
              );
            }
            $button.mousedown(function(event) {
              if (!$(event.target).is("input")) {
                event.preventDefault();
              }
            });
            $button.mouseup(function(event) {
              event.stopPropagation();
            });
          }
        }

        makeButtons.call(this, this.bar, $.popline.buttons);

        this.target.bind(targetEvent);
      },
      
      show: function(options) {
        for (var i = 0, l = this.beforeShowCallbacks.length; i < l; i++) {
          var obj = this.beforeShowCallbacks[i];
          var $button = this.bar.find("div.popline-" + obj.name + "-button");
          obj.callback.call($button, this);
        }
        this.bar.css('top', options.top + "px").css('left', options.left + "px").stop(true, true).fadeIn();
        this.bar.resize();
      },

      hide: function() {
        var _this = this;
        if (this.bar.is(":visible") && !this.bar.is(":animated")) {
          this.bar.fadeOut(function(){
            _this.bar.find("div").removeClass("boxed").show();
            _this.bar.find(".subbar").hide();
            _this.bar.find(".textfield").hide();
            _this.bar.find(".pop-btn").show();
            for (var i = 0, l = _this.afterHideCallbacks.length; i < l; i++) {
              var obj = _this.afterHideCallbacks[i];
              var $button = _this.bar.find("div.popline-" + obj.name + "-button");
              obj.callback.call($button, _this);
            }
          });
        }
      },

      destroy: function() {
        this.target.unbind(targetEvent);
        this.target.removeData("popline");
        this.target.removeData("lastKeyPos");
        this.bar.remove();
      },

      switchBar: function(button, hideFunc, showFunc) {
        if (typeof(hideFunc) === "function") {
          var _this = this;
          var position = parseInt(_this.bar.css('left')) + _this.bar.width() / 2;
          _this.bar.animate({ opacity: 0, marginTop: -_this.bar.height() + 'px' }, function() {
            hideFunc.call(this);
            button.removeClass('hover').addClass('boxed').show();
            _this.bar.css("margin-top", _this.bar.height() + "px")
            _this.bar.css("left", position - _this.bar.width() / 2 + "px");
            if (typeof(showFunc) === "function") {
              _this.bar.animate({ opacity: 1, marginTop: 0 }, showFunc)
            } else {
              _this.bar.animate({ opacity: 1, marginTop: 0 })
            }
          });
        }
      },

      keepSlientWhenBlankSelected: function() {
        if (this.settings.keepSlientWhenBlankSelected && $.trim(window.getSelection().toString()) === "") {
          return true;
        } else {
          return false;
        }
      },

      isAnnotationOrDisplay: function() {
        var selection = rangy.getSelection();

        if (this.settings.mode === "annotation" && selection.toString().length > 0 && !this.keepSlientWhenBlankSelected()) {
          if (selection.rangeCount > 0) {
            // Check if the selection is in container
            var containerElement = processor.utils.getContainerFromRange(processor.container, selection.getRangeAt(0));
            if (containerElement != null) {
              $.extend($.popline.selection, processor.getInfoFromContainer(containerElement), {
                selectedText: selection.toString(),
                textRange: selection.saveCharacterRanges(containerElement)[0]
              });

              return true;
            }
          }
        } else if (this.settings.mode === "display" && selection.toString().length === 0) {
          return true;
        } else {
          return false;
        }
      }

    },

    hideAllBar: function() {
      for (var i = 0, l = $.popline.instances.length; i < l; i++) {
        $.popline.instances[i].hide();
      }
    },

    addInstance: function(popline){
      $.popline.instances.push(popline);
    },

    utils: {
      getWholeWord: function(){
        var sel;

      // Check for existence of window.getSelection() and that it has a
      // modify() method. IE 9 has both selection APIs but no modify() method.
        if (window.getSelection && (sel = window.getSelection()).modify) {
          sel = window.getSelection();
        if (!sel.isCollapsed) {

      // Detect if selection is backwards
          var range = document.createRange();
          range.setStart(sel.anchorNode, sel.anchorOffset);
          range.setEnd(sel.focusNode,sel.focusOffset);
          var backwards = range.collapsed;
          range.detach();

          var endNode=sel.focusNode;
          var endOffset=sel.focusOffset;
          sel.collapse(sel.anchorNode,sel.anchorOffset);

          var direction=[];
          if(backwards){
            direction= ['backward','forward'];
          }else{
            direction=['forward','backward'];
          }

          sel.modify("move",direction[0],"character");
          sel.modify("move",direction[1],"word");
          sel.extend(endNode,endOffset);
          sel.modify("extend",direction[1],"character");
          sel.modify("extend",direction[0],"word");
          }
        }
        else if((sel=document.selection)&&sel.type!="Control"){
            var textRange=sel.createRange();
            if(textRange.text)
            {
            textRange.expand("word");
            while(/\s$/.test(textRange.text)){
              textRange.moveEnd("character",-1);
            }
              textRange.select();
            }
        }
      },
        
      isNull: function(data) {
        if (typeof(data) === "undefined" || data === null) {
          return true;
        }
        return false;
      },
      randomNumber: function() {
        return Math.floor((Math.random() * 10000000) + 1);
      },
      trim: function(string) {
        return string.replace(/^\s+|\s+$/g, '');
      },

      findNodeWithTags: function(node, tags) {
        if (!$.isArray(tags)) {
          tags = [tags];
        }
        while (node) {
          if (node.nodeType !== 3) {
            var index = tags.indexOf(node.tagName);
            if (index !== -1) {
              return node;
            }
          }
          node = node.parentNode;
        }
        return null;
      }
    },

    addButton: function(button) {
      $.extend($.popline.buttons, button);
    },

    buttons: {}

  });
})(processor, rangy, jQuery);
