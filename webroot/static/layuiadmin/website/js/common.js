var $p = {
  stimo: undefined,
  id: function(id) {
    return document.getElementById(id)
  }
}

function SetCookie(name, value) {
  var exp = new Date();
  exp.setTime(exp.getTime() + 24 * 3600000);
  document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString() + ";path=/";
}

function GetCookie(name) {
  var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
  if (arr != null) {
    return unescape(arr[2]);
  } else {
    return "";
  }
}
$(function() {
    if (Number($(window).height()) < 700) {
      if ($(".majia-moreposting .morepost-con .mpc-left dl.js-dl").length > 0) {
        $(".majia-moreposting .morepost-con .mpc-left dl.js-dl").css('height', 450)
      }
    }
  })
  //当天时间

var today = new Date();
var todayStr = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
var todayLongStr = todayStr + ' ' + today.getHours() + ':' + today.getMinutes();
//延迟显示提示
var Timer = null;
//1、aControl 移入层[$('ul.warp-icon li')]  2、dom显示的层[ul,div..]  3、showTime显示所用时间
//4、hideTime隐藏所用时间  5、delayTime延迟所用时间[建议不大于1000] 根据需求而定
$(document).on('mousemove', '.tr-icon a', function() {
  //console.log('测试common');
  //var This = this;
  $(this).find('div').show();
  // Timer = setTimeout(function () { $(This).find(dom).show(showTime) }, delayTime);
})
$(document).on('mouseout', '.tr-icon a', function() {
  $(this).find('div').hide();
});

function DelayToggle(aControl, dom, showTime, hideTime, delayTime) {
  //$.isNumeric(showTime) && showTime > 0 ? showTime = showTime : showTime = 0;
  //$.isNumeric(hideTime) && hideTime > 0 ? hideTime = hideTime : hideTime = 0;
  //$.isNumeric(delayTime) && delayTime > 0 ? delayTime = delayTime : delayTime = 0;
  $(document).on('mousemove', '.tr-icon a', function() {
    var This = this;
    Timer = setTimeout(function() { $(This).find(dom).show(showTime) }, delayTime);
  })
  clearTimeout(Timer);
  $(document).on('mouseout', '.tr-icon a', function() {
    $(this).find(dom).hide(hideTime);
  });
  aControl.hover(function() {
    var This = this;
    //console.log(This);
    Timer = setTimeout(function() { $(This).find(dom).show(showTime) }, delayTime);
    //alert('测试');
  }, function() {
    clearTimeout(Timer);
    $(this).find(dom).hide(hideTime);
  });
}

function aa(v) {
  var json = null;
  var regex = 'none';
  var alertext1 = '';
  var alertext2 = '';
  var arrJson = null;
  var arrName = null;
  v.focus(function() {
    if ($(this).attr('flag') != undefined)
      $(this).attr('flag', '0');
  }).blur(function() {
    $('.table.ui_dialog').css({ width: '130px' })
    json = $(this).attr('valid');
    var size = $(this).attr('valid-size');
    var arrI = json.split(' ');
    var jsonI = null;
    var temp1 = /\S/;
    var numMax, numMin;

    for (var key in regb) {
      if (key == json) {
        arrJson = regb[key];
      }
      for (var j in arrJson) {
        if (j == 'regex')
          regex = arrJson[j];
        if (j == 'alertext1')
          alertext1 = arrJson[j];
        if (j == 'alertext2')
          alertext2 = arrJson[j];
      }
    }
    //必填项且为空
    if (!temp1.test($(this).val()) && $(this).attr('flag') != undefined) {
      showTip(alertext1, 2, 1.5);
      $(this).attr('flag', '0');
      return;
    }
    //size 属性
    if (size != undefined) {
      //console.log(size.indexOf('sizeMax') >= 0);
      if (size.indexOf('sizeR') >= 0) {
        numMax = size.split(',')[1].split(']')[0].trim();
        numMin = size.split(',')[0].split('[')[1].trim();
        if ($(this).val().trim().length < numMin) {
          showTip('不能小于' + numMin + '个字符！', 3, 1.5);
          if ($(this).attr('flag') != undefined) {
            $(this).attr('flag', '1');
            return;
          } else {
            return;
          }
        }
        if ($(this).val().trim().length > numMax) {
          //console.log(size.indexOf('sizeMax') >= 0);
          showTip('不能超过' + numMax + '个字符！', 3, 1.5);
          if ($(this).attr('flag') != undefined) {
            $(this).attr('flag', '1');
            return;
          } else {
            return;
          }
        }
      } else if (size.indexOf('sizeMin') >= 0) {
        // console.log(size)
        numMin = size.split('[')[1].split(']')[0].trim();
        if ($(this).val().trim().length < numMin) {
          showTip('不能小于' + numMin + '个字符！', 3, 1.5);
          if ($(this).attr('flag') != undefined) {
            $(this).attr('flag', '1');
            return;
          } else {
            return;
          }
        }
      } else if (size.indexOf('sizeMax') >= 0) {
        numMax = size.split('[')[1].split(']')[0].trim();
        if ($(this).val().trim().length > numMax) {
          showTip('不能超过' + numMax + '个字符！', 3, 1.5);
          if ($(this).attr('flag') != undefined) {
            $(this).attr('flag', '1');
            return;
          } else {
            return;
          }
        }
      } else {
        return;
      }
    }

    //reg 正则
    if (json != '') {
      console.log(regex.test($(this).val().trim()));
      if (regex.test($(this).val().trim())) {
        if ($(this).attr('flag') != undefined) {
          $(this).attr('flag', '1');
          return;
        } else {
          // showTip(alertext1, 2, 1.5);
          return;
        }
      } else {
        showTip(alertext2, 2, 1.5);
        return;
      }
    }
  })

}


aa($('[valid]'));

//下拉按钮
function SelectBtn() {
  $('.selectbtn').bind('mouseover', function() {
    $(this).next().show();
  })
  $('.select-btn').bind('mouseover', function() {
    $(this).find('.btn').addClass('active');
    $(this).find('ul').show();
  })
  $('.select-btn').bind('mouseout', function() {
    $(this).find('.btn').removeClass('active');
    $(this).find('ul').hide();
  })
}

$.extend({
  vToggleInput: function(vForm) {
    vForm.find(':text').focus(function() {
      if (!this.initValue) {
        this.initValue = this.value;
      }
      if (this.value === this.initValue) {
        this.value = '';
        $(this).css({ color: '#666' });
      }
    }).blur(function() {
      if (this.value === '' || this.value === null) {
        this.value = this.initValue;
        $(this).css({ color: '#999' });
      }
    });
  }
})


//全选插件
// $.extend({

//     checkedAllToggle: function (aControl, boxName) {
//         //全选(1、点击element[div.class #id]  2、checkbox名称name)
//         aControl.toggle(function () {
//             $('input[name=' + boxName + ']').attr('checked', 'checked');
//             $(this).html('取消全选');
//         }, function () {
//             $('input[name=' + boxName + ']').removeAttr('checked');
//             $(this).html('全选');
//         })
//     }
// });
function CheckedAllToggle(aControl, boxName) {
  aControl.on('click', function() {
    if ($('input[name=' + boxName + ']').prop('checked')) {
      $('input[name=' + boxName + ']').prop('checked', false);
      //$(this).val('取消全选');
    } else {
      $('input[name=' + boxName + ']').prop('checked', true);
      //$(this).val('全选');
    }
  })

}


$(function() {
  //下拉按钮
  SelectBtn();

  //侧边菜单伸缩
  $('.leftnav ol').find('li.active').parent().show().siblings('span').addClass('active');
  $('.leftnav span').click(function() {
    $('.leftnav ol').not($(this).next()).slideUp(500);
    $('.leftnav span').not($(this)).removeClass('active');
    $(this).toggleClass('active');
    $(this).next().slideToggle(500);
  })
  $(".leftnav ol").find("li").click(function() {
    $(".leftnav ol").find("li").removeClass('active');
    $(this).addClass('active');
  })
  $('.leftwarp').on('click','.parentnav-item',function(){
    var that = $(this),
    oUl = that.siblings('.leftnav'),
    aUl = $('.leftnav');
    that.parents('.leftwarp').find('.parentnav-item').not(that).removeClass('active')
    $(this).toggleClass('active');
    if(that.hasClass('active')){
      aUl.slideUp(500)
      oUl.slideDown(500)
    }else{
      aUl.slideUp(500)
    }
  })
  $('.leftwarp').on('click','.leftnav>li',function(){
    var length = $(this).children().length;
    if(length == 1){
      $(this).addClass('active')
    }
  })

  //侧边栏伸缩
  $(".nav_btn").click(function() {
    if ($(this).hasClass("off")) {
      $(this).removeClass("off");
      $('.leftwarp').animate({ marginLeft: '0px' }, "100");
      $('.rightwarp').animate({ marginLeft: '200px' }, "100");
      SetCookie("leftZd", "n");
    } else {
      $(this).addClass("off");
      $('.leftwarp').animate({ marginLeft: '-180px' }, "100");
      $('.rightwarp').animate({ marginLeft: '10px' }, "100");
      SetCookie("leftZd", "y")

    }
  })
  if (GetCookie("leftZd") == "y") {
    $(".nav_btn").addClass("off");
    $('.leftwarp').animate({ marginLeft: '-180px' }, "100");
    $('.rightwarp').css({ marginLeft: '10px' });
  } else {
    $(".nav_btn").removeClass("off");
    $('.leftwarp').animate({ marginLeft: '0px' }, "100");
    $('.rightwarp').css({ marginLeft: '200px' });
  }
  //图标提示
  //DelayToggle($('ul.warp-icon li'), 'div', 100, 100, 400);
  //DelayToggle($('.tr-icon a'), 'div', 100, 100, 400);
  //DelayToggle($('ul.tip-icon li'), 'div', 100, 100, 400);
  //用户弹窗
  DelayToggle($('ul.userul li'), 'ul', 500, 500, 400);
  //全选
  CheckedAllToggle($('#check'), 'ischecked');
  //$.checkedAllToggle($('#check'), 'ischecked');
  //选择
  $(".btn-del").click(function() {
      var str = "";
      $('[name=ischecked]:checkbox:checked').each(function() {
        str += $(this).val() + ",";
      })
      if (str.length > 0) {
        //alert(10);
      } else {
        showTip("请选择要操作的项目", 4);
      }
    })
    //关闭
  $('.icon-exit').click(function() {
    $(this).parent().hide("slow");
  })
})

//正则表达式
var regb = {
  'phone': //手机号
  {
    //'regex': /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/,
    'regex': /^[1][3-9][0-9]{9}$/,
    'alertext1': '手机号为必填项不能为空！',
    'alertext2': '手机号码格式错误！'
  },
  'qq': //QQ号
  {
    'regex': '/[1-9][0-9]{4,}/',
    'alertext1': 'qq号码为必填项不能为空！',
    'alertext2': 'qq号码填写不正确！'
  },
  'name': //
  {
    'regex': '/^[a-zA-Z][a-zA-Z0-9_]{4,15}$/',
    'alertext1': '姓名为必填项不能为空',
    'alertext2': '姓名填写不正确！'
  },
  'password': //长度在6~18之间，只能包含字母、数字和下划线
  {
    'regex': '/^[a-zA-Z]w{5,17}$/',
    'alertext1': '密码为必填项不能为空',
    'alertext2': '密码格式不正确！'
  },
  'sfz': //身份证号(15位、18位数字)
  {
    'regex': /^\d{15}|\d{18}$/,
    'alertext1': '身份证为必填项不能为空',
    'alertext2': '身份证格式不正确！'
  },
  'email': //email
  {
    'regex': /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
    'alertext1': '邮箱为必填项不能为空',
    'alertext2': '邮箱格式不正确！'
  },
  'chinese': //汉字
  {
    //'regex': '/^[\u4E00-\u9FA5]+$/',
    'regex': /^[\u4e00-\u9fa5]{0,}$/,
    'alertext1': '必填项，请输入汉字',
    'alertext2': '请输入汉字！'
  },
  'numd': //正整数【0-9】
  {
    'regex': /^[1-9]d*$/,
    'alertext1': '必填项，请输入1-9正整数',
    'alertext2': '请输入1-9正整数！'
  },
  'numf': //负整数
  {
    'regex': /^-[1-9]d*$/,
    'alertext1': '必填项，请输入负整数',
    'alertext2': '请输入负整数！'
  },
  'url': //url(网站地址)
  {
    'regex': '/^http://([\w-]+\.)+[\w-]+(/[\w-./?%&=]*)?$/',
    'alertext1': '必填项，请输入正确的url',
    'alertext2': 'url格式不正确！'
  },
  'strNoTeshu': //不允许输入特殊符号
  {
    'regex': /^[\u4E00-\u9FA5A-Za-z0-9]+$/,
    'alertext1': '必填项，请从新输入',
    'alertext2': '输入中不能包含特殊符号，请从新输入！'
  },
  'strYEnlish': //只能输入字符串
  {
    'regex': /[A-Za-z]+$/,
    'alertext1': '必填项，请输入字符串!',
    'alertext2': '只能输入字符串，请从新输入！'
  },
  'IP': //IP
  {
    'regex': /\d+\.\d+\.\d+\.\d+/,
    'alertext1': '必填项，请输入IP！',
    'alertext2': '只能输入字符串，请从新输入！'
  },
  'youxiang': //邮箱
  {
    'regex': /\d+\.\d+\.\d+\.\d+/,
    'alertext1': '必填项，请输入IP！',
    'alertext2': '只能输入字符串，请从新输入！'
  },
}

//动画隐藏
function AnimationHide(animation, selector) {
  switch (animation) {
    case 'fadeIn':
      selector.fadeOut();
      break;
    case 'show':
      selector.hide();
      break;
    default:
      selector.fadeIn();
      break;
  }
}
//动画显示
function AnimationShow(animation, selector) {
  switch (animation) {
    case 'fadeIn':
      selector.fadeIn();
      break;
    case 'show':
      selector.show();
      break;
    default:
      selector.fadeIn();
      break;
  }
}
//定位
function Dir(dir, selector) {
  var _left, _top, _bottom, _right;
  if (dir == 'center') {
    _left = ($(document).width() - selector.width()) / 2 + 'px';
    _top = ($(window).height() - selector.height()) / 2 + 'px';
    selector.css({ 'left': _left, 'top': _top });
  } else if (dir == 'centerTop') {
    _left = ($(document).width() - selector.width()) / 2 + 'px';
    _top = 0 + 'px';;
    selector.css({ 'left': _left, 'top': _top })
  } else if (dir == 'centerBottom') {
    _left = ($(document).width() - selector.width()) / 2 + 'px';
    _bottom = 0 + 'px';
    selector.css({ 'left': left, 'bottom': _bottom })
  } else if (dir == 'centerTop20') {
    _left = ($(document).width() - selector.width()) / 2 + 'px';
    _top = 20 + 'px';
    selector.css({ 'left': _left, 'top': _top })
  } else if (dir == 'centerBottom20') {
    _left = ($(document).width() - selector.width()) / 2 + 'px';
    _bottom = 20 + 'px';
    selector.css({ 'left': _left, 'bottom': _bottom })
  } else if (dir == 'left') {
    _top = 0 + 'px';
    _left = 0 + 'px';
    selector.css({ 'left': _left, 'top': top });
  } else if (dir == 'leftCenter') {
    _left = 0 + 'px';
    _top = ($(document).height() - selector.height()) / 2 + 'px';
    selector.css({ 'left': _left, 'top': _top });
  } else {
    _left = ($(document).width() - selector.width()) / 2 + 'px';
    _top = ($(document).height() - selector.height()) / 2 + 'px';
    selector.css({ 'left': _left, 'top': _top });
  }
}
/*
 vs --- 练手msg 1.00
 ypf 2015-11-10
 提示框
 */
function Msg() {
  this.settings = {
    dir: 'center',
    type: 'default',
    animation: 'fadeIn',
    txt: '提示',
    dalay: 3000
  };
};
(function($) {
  Msg.prototype.init = function(opt, callback) {
    $.extend(this.settings, opt);
    this.create(callback);
    this.die();
  }
  Msg.prototype.create = function(callback) {
    $(document.body).prepend('<div id="msg"  class=""><div class="msg-icon"><i class="iconf "></i></div><div class="msg-txt">' + this.settings.txt + '</div></div>');
    //背景颜色和图标字体
    switch (this.settings.type) {
      case 'default':
        $('#msg').attr('class', 'defalut');
        $('#msg .iconf').attr('class', 'iconf icon-x-tixing1');
        break;
      case 'err':
        $('#msg').attr('class', 'err');
        $('#msg .iconf').attr('class', 'iconf icon-x-shanchu');
        break;
      case 'alert':
        $('#msg').attr('class', 'alert');
        $('#msg .iconf').attr('class', 'iconf icon-x-alert');
        break;
      case 'pass':
        $('#msg').attr('class', 'pass');
        $('#msg .iconf').attr('class', 'iconf icon-x-tongguo');
        break;
      default:
        $('#msg').attr('class', 'defalut');
        $('#msg .iconf').attr('class', 'iconf icon-x-tixing1');
        break;
    }
    //定位
    Dir(this.settings.dir, $('#msg'));
    //显示
    AnimationShow(this.settings.animation, $('#msg'));
    //回调函数
    if (typeof(callback) == 'undefined') {
      return false;
    } else {
      callback();
    }
  }

  Msg.prototype.die = function() {
    var timer1, timer2;
    var _this = this;
    clearTimeout(timer1);
    clearTimeout(timer2);
    timer1 = setTimeout(function() {
      AnimationHide(_this.settings.animation, $('#msg'));
      timer2 = setTimeout(function() { $('#msg').remove() }, 1000);
    }, this.settings.dalay);
  }
})(jQuery);

/**
 * [confirmDialog 下架弹窗]
 * @param  {[确认下架]} fnOK [回调函数]
 * @return {[type]}      [description]
 */
function confirmDialog(titxt, rightxt, exitxt, fnOK) {

  var str = '<div class="m-cover"></div><div class="dialog1">' +
    '<h4>' + titxt + '</h4>' +
    '<div class="dialog1-footer">' +
    '<button class="btn ccc jsok">' + rightxt + '</button>' +
    '<button class="btn jsexit">' + exitxt + '</button>' +
    '</div>' +
    '</div>';
  if (!$('.dialog1').hasClass('dialog1')) {
    $(document.body).append(str);
  }
  $('.dialog1').css({ 'marginTop': -$('.dialog1').height() / 2 })
  $('.dialog1').show();
  $('.m-cover').show();
  $(document.body).on('click', '.jsexit', function() {
    $('.dialog1').remove();
    $('.m-cover').remove();
  })
  $(".jsok").unbind().click(function() {
    fnOK();
    $('.dialog1').remove();
    $('.m-cover').remove();
  })
}

/**
 * [新提示]---原来弹窗和提示是一个函数当同时出现会有问题
 * @param  {[type]} $ [text：文字 timer：显示时间 icon：图标  callback：回调函数w]
 * @return {[type]}   [description]
 */
;
(function($) {
  $.moduleTip = function(option) {
    var opt = $.extend({ 'text': '提示', 'timer': 2000, 'icon': '1' }, option);
    if (!$('.m-tip').hasClass('m-tip')) {
      var str = '<div class="m-tip">';
      if(opt.width){
        str = '<div class="m-tip" style="width:'+opt.width+';max-width:unset">';
      }
      str += '<div class="m-tip-table">' +
        '<img  class="m-tip-cell" src=' + iconSelect(opt.icon) + ' />' +
        '<div class="m-tip-cell">' + opt.text + '</div>' +
        '</div>' +
        '</div>';
      $(document.body).append(str);
    } else {
      return false;
    }
    $('.m-tip').fadeIn(1000);
    var dir = function() {
      $('.m-tip').css({
        'marginLeft': -$('.m-tip').outerWidth() / 2,
        'marginTop': -$('.m-tip').outerHeight() / 2
      });
    }
    var someClose = function() {
      opt.timer = opt.timer < 2000 ? 2000 : opt.timer;
      setTimeout(function() {
        setTimeout(function() {
          $('.m-tip').remove();
        }, 1000)
        $('.m-tip').fadeOut();
      }, opt.timer)
    }
    var fire = function() {
      if (typeof(opt.callback) == 'function') {
        //var _callback = opt.callback;
        setTimeout(opt.callback, opt.timer);
      }
    }
    dir();
    someClose();
    fire();
  }
})(jQuery);

function iconSelect(st) {
  var icont;
  if (st == 0) {
    icont = ""; //错误
  } else if (st == 1) {
    icont = ""; //正确
  } else if (st == 2) {
    icont = ""; //警告
  } else if (st == 3) {
    icont = ""; //提示
  } else {
    icont = ""; //提示
  }
  return icont;
}
/**
 * 对话框
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
;
(function($) {
  $.moduleConfirm = function(option) {
    var opt = $.extend({ 'title': '对话框', 'content': '', 'oktxt': '确认', 'exitxt': '取消' },
      option);
    if (!$('.m-tip').hasClass('m-confirm')) {
      var str;
      if (opt.content == null || opt.content == "") {

        str = '<div class="m-warp"><div class="m-cover1"></div><div class="m-confirm" style="z-index:23000;">' +
          '<h4>' + opt.title + '</h4>' +
          '<div class="m-confirm-footer">' +
          '<button class="btn btn-lan jsok">' + opt.oktxt + '</button>' +
          '<button class="btn jsexit">' + opt.exitxt + '</button>' +
          '</div>' +
          '</div>' +
          '</div>';
      } else {
        str = '<div class="m-warp"><div class="m-cover1"></div><div class="m-confirm">' +
          '<h4>' + opt.title + '</h4>' +
          '<p>' + opt.content + '</p>' +
          '<div class="m-confirm-footer">' +
          '<button class="btn btn-lan jsok">' + opt.oktxt + '</button>' +
          '<button class="btn jsexit">' + opt.exitxt + '</button>' +
          '</div>' +
          '</div>' +
          '</div>';
      }

    } else {
      return false;
    }
    $(document.body).append(str);
    $('.m-confirm').css({ 'marginTop': -$('.m-confirm').height() / 2 });
    $('.jsexit').click(function() {

      if (typeof(opt.exitcallback) == 'function') {
        var _a = opt.exitcallback;
        _a();
      }
      $('.m-warp').remove();
    })

    $('.jsok').click(function() {


      if (typeof(opt.callback) == 'function') {
        var _a = opt.callback;
        _a();
      }
      $('.m-warp').remove();
    })
  }
})(jQuery);
/*成功提示框*/
function tipFunZwh(msg, callFn, tim) {
  $('#arrorbox,#coverBk').remove();
  //tipLoadingRemove();
  clearTimeout($p.stimo);
  if (msg !== "") {
    $("#arrorbox").length > 0 ? $("#arrorbox").html(msg) : $("body").append("<div id='coverBk'></div><div id='arrorbox' style='background:#2db464; position:fixed; top:330px;left:0;border-radius:5px; text-align:center; color:#FFF; font-size:14px; padding:10px 25px;min-width:100px;overflow:hidden;z-index:99999;opacity:1;-webkit-transition:opacity 200ms ease-in-out;word-wrap:break-word;'><i style='font-size:18px;margin-right:6px;'>√</i>" + msg + "</div>");
    $("#arrorbox").css({
      "margin-left": -Math.floor($("#arrorbox").outerWidth() / 2),
      "left": "50%",
      "opacity": 1
    });
    $p.stimo = (tim == undefined) ? setTimeout(function() { $('#arrorbox,#coverBk').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, 3000) : setTimeout(function() { $('#arrorbox').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, tim);
  }
};
/*失败提示框*/
function tipFunZwh1(msg, callFn, tim) {
  $('#arrorbox,#coverBk').remove();
  //tipLoadingRemove();
  clearTimeout($p.stimo);
  if (msg !== "") {
    $("#arrorbox").length > 0 ? $("#arrorbox").html(msg) : $("body").append("<div id='coverBk'></div><div id='arrorbox' style='background:#cd4646; position:fixed; top:330px;left:0;border-radius:5px; text-align:center; color:#FFF; font-size:14px; padding:10px 25px;min-width:100px;overflow:hidden;z-index:99999;opacity:1;-webkit-transition:opacity 200ms ease-in-out;word-wrap:break-word;'><i style='font-size:16px;margin-right:6px;'>X</i>" + msg + "</div>");
    $("#arrorbox").css({
      "margin-left": -Math.floor($("#arrorbox").outerWidth() / 2),
      "left": "50%",
      "opacity": 1
    });
    $p.stimo = (tim == undefined) ? setTimeout(function() { $('#arrorbox,#coverBk').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, 3000) : setTimeout(function() { $('#arrorbox').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, tim);
  }
};
$(' body').on('click', '.dataTables_paginate a', function() {
  if ($(this).hasClass('first') || $(this).hasClass('previous') || $(this).hasClass('next') || $(this).hasClass('last')) {

  } else {
    var val = $(this).text();
    //window.location.href=window.location.href+'#'+val;
    //console.log(window.location.href)
  }
})

/*成功提示框*/
function tipFunSuc(msg, callFn, tim) {
  $('#arrorbox,#coverBk').remove();
  //tipLoadingRemove();
  clearTimeout($p.stimo);
  if (msg !== "") {
    $("#arrorbox").length > 0 ? $("#arrorbox").html(msg) : $("body").append("<div id='coverBk'></div><div id='arrorbox' style='background:#2db464; position:fixed; top:330px;left:0;border-radius:5px; text-align:center; color:#FFF; font-size:14px; padding:10px 25px;min-width:100px;overflow:hidden;z-index:99999;opacity:1;-webkit-transition:opacity 200ms ease-in-out;word-wrap:break-word;'><i style='font-size:18px;margin-right:6px;'>√</i>" + msg + "</div>");
    $("#arrorbox").css({
      "margin-left": -Math.floor($("#arrorbox").outerWidth() / 2),
      "left": "50%",
      "opacity": 1
    });
    $p.stimo = (tim == undefined) ? setTimeout(function() { $('#arrorbox,#coverBk').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, 3000) : setTimeout(function() { $('#arrorbox').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, tim);
  }
};
/*失败提示框*/
function tipFunFail(msg, callFn, tim) {
  $('#arrorbox,#coverBk').remove();
  //tipLoadingRemove();
  clearTimeout($p.stimo);
  if (msg !== "") {
    $("#arrorbox").length > 0 ? $("#arrorbox").html(msg) : $("body").append("<div id='coverBk'></div><div id='arrorbox' style='background:#cd4646; position:fixed; top:330px;left:0;border-radius:5px; text-align:center; color:#FFF; font-size:14px; padding:10px 25px;min-width:100px;overflow:hidden;z-index:99999;opacity:1;-webkit-transition:opacity 200ms ease-in-out;word-wrap:break-word;'><i style='font-size:16px;margin-right:6px;'>X</i>" + msg + "</div>");
    $("#arrorbox").css({
      "margin-left": -Math.floor($("#arrorbox").outerWidth() / 2),
      "left": "50%",
      "opacity": 1
    });
    $p.stimo = (tim == undefined) ? setTimeout(function() { $('#arrorbox,#coverBk').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, 3000) : setTimeout(function() { $('#arrorbox').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, tim);
  }
};
/*提示框*/
function tipad(msg, type, tim, callFn) {
  //type 1 代表成功 2 代表失败
  $('#adbox,#coverBk').remove();
  //tipLoadingRemove();
  clearTimeout($p.stimo);
  if (msg !== "") {
    $("#adbox").length > 0 ? $("#adbox").html(msg) : $("body").append("<div id='coverBk'></div><div id='adbox' style='background:#48494a; position:fixed; top:330px;left:0;border-radius:5px; text-align:center; color:#FFF; font-size:18px; padding:20px 25px;min-width:250px;overflow:hidden;z-index:99999;opacity:1;-webkit-transition:opacity 200ms ease-in-out;word-wrap:break-word;'><i  class='icon" + type + " '></i>" + msg + "</div>");
    $("#adbox").css({
      "margin-left": -Math.floor($("#adbox").outerWidth() / 2),
      "left": "50%",
      "opacity": 1
    });
    $p.stimo = (tim == undefined) ? setTimeout(function() { $('#adbox,#coverBk').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, 3000) : setTimeout(function() { $('#adbox').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, tim);
  }
};
/*提示框*/
function tipad1(msg, type, tim, callFn) {
  //type 1 代表成功 2 代表失败
  $('#adbox,#coverBk').remove();
  //tipLoadingRemove();
  clearTimeout($p.stimo);
  if (msg !== "") {
    $("#adbox").length > 0 ? $("#adbox").html(msg) : $("body").append("<div id='coverBk'></div><div id='adbox' style='background:#48494a; position:fixed; top:100px;left:0;border-radius:5px; text-align:center; color:#FFF; font-size:18px; padding:20px 25px;min-width:250px;overflow:hidden;z-index:99999;opacity:1;-webkit-transition:opacity 200ms ease-in-out;word-wrap:break-word;'><i  class='icon" + type + " '></i>" + msg + "</div>");
    $("#adbox").css({
      "margin-left": -Math.floor($("#adbox").outerWidth() / 2),
      "left": "50%",
      "opacity": 1
    });
    $p.stimo = (tim == undefined) ? setTimeout(function() { $('#adbox,#coverBk').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, 3000) : setTimeout(function() { $('#adbox').remove(); if (callFn != "" && typeof callFn == "function") { callFn() } }, tim);
  }
};

function tipLoading(options) {
  if ($(".pc-loading").length > 0) return;
  var pcOpt = $.extend({ 'top': '50%', 'time': '2000', 'cb': null, 'ele': 'body' }, options)
  var left = $(pcOpt.ele).width() / 2 + 'px';
  var timer = null;
  if ($(pcOpt.ele).css("position") == "static") {
    $(pcOpt.ele).css("position", "relative");
  }
  var obj = $("<div class='pc-loading'><div style='position:fixed;top:" + pcOpt.top + ";left:" + left + ";margin-left:-32px;margin-top:-32px;z-index:1000000'><img style='width:64px;height:64px;' src=''></div><div style='position:fixed;top:0;left:0;width:100%;height:100%;background:#000;opacity:0.6;z-index:999999;display:" + (pcOpt.ele == 'body' ? 'block' : 'none') + ";'></div></div>")
  $(pcOpt.ele).append(obj);
  timer = setTimeout(function() {
    $(".pc-loading").remove();
    pcOpt.cb && pcOpt.cb()
  }, pcOpt.time)
}
function newTipsLoading(options) {
  if ($(".pc-loading").length > 0) return;
  var pcOpt = $.extend({ 'top': '50%', 'time': '2000', 'cb': null, 'ele': 'body' }, options)
  var left = $(pcOpt.ele).width() / 2 + 'px';
  var timer = null;
  if ($(pcOpt.ele).css("position") == "static") {
    $(pcOpt.ele).css("position", "relative");
  }
  var obj = $("<div class='pc-loading'><div style='position:absolute;top:" + pcOpt.top + ";left:" + left + ";margin-left:-32px;margin-top:-32px;z-index:1000000'><img style='width:64px;height:64px;' src=''></div><div style='position:fixed;top:0;left:0;width:100%;height:100%;background:#000;opacity:0.6;z-index:999999;display:" + (pcOpt.ele == 'body' ? 'block' : 'none') + ";'></div></div>")
  $(pcOpt.ele).append(obj);
}
function removeTipLoading(){
  $(".pc-loading").remove();
}

/* 兼容ie8字体库 */
!(function redrawFontFace() {
  if ($.support.leadingWhitespace) return;
  $(window).one("load", function() {
    $('html').addClass('fix-ie-font-face');
    setTimeout(function() {
        $('html').removeClass('fix-ie-font-face');
    }, 10);
  });
}());
/* ie8不支持trim函数 forEach函数自行添加 */
String.prototype.trim = function()
{
  return this.replace(/(^\s*)|(\s*$)/g, "");
};
if ( !Array.prototype.forEach ) {
  Array.prototype.forEach = function forEach( callback, thisArg ) {
    var T, k;
    if ( this == null ) {
      throw new TypeError( "this is null or not defined" );
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if ( typeof callback !== "function" ) {
      throw new TypeError( callback + " is not a function" );
    }
    if ( arguments.length > 1 ) {
      T = thisArg;
    }
    k = 0;
    while( k < len ) {
      var kValue;
      if ( k in O ) {
        kValue = O[ k ];
        callback.call( T, kValue, k, O );
      }
      k++;
    }
  };
};
//图片预览
/*$('body').on('click', '.evaluation-pic-list li', function(e) {
    var index = $(this).index();
    var oLeft = $(window).width() * index;
    e.preventDefault();
    var num = $(this).parent().children().length;
    var arry = [];
    $(this).parent().find("li").each(function() {
        var imgUrl = $(this).data("url");
        arry.push(imgUrl);
    });
    photoCover1(num, arry, index);
});*/
//图片预览
function photoCover1(num, imgArr, index) {
    //var left=Number(left);
    var page = index + 1;
    var imgHtml = '';
    //pag = '';
    for (var i = 0; i < num; i++) {
        imgHtml += '<li class="swiper-slide" style="background:#000"><div style="position:static"><img src=' + imgArr[i] + '></div></li>';
        // pag += '<span></span>';
    }
    var html = '<div  class="cover-bk-photo" onclick="removePhotoCover($(this),event)"></div><div class="photo-cover">' +
        '<div class="photo-wrap1"><div class="photo-wrap swiper-container"><ul class="photo-list swiper-wrapper"> ' + imgHtml + '</ul>' +
            // '<div class="swiper-pagination"><span></span> / <span>3</span></div>' +
            // '<div class="cursor">' + pag + '</div></div>' +
        '<div class="page" style="bottom:80px;z-index:20;"><span id="pages">' + page + '</span>&nbsp;/&nbsp;<em>0</em></div>' +
        ' <div class="swiper-button-prev"></div>'+
        '<div class="swiper-button-next"></div>'+
        '</div></div>';
    $("body").append(html);
    //$(".cursor span:first").addClass("active");
    $(".photo-list").css({"width": num * 100 + "%"});
    $(".photo-list li").css({"width": 100 / num + "%"});
    $(".photo-cover .page em").html(num);
    var swiperPhoto = new Swiper('.photo-wrap.swiper-container', {
        //pagination: 'swiper-pagination',
        //type: 'fraction',
        prevButton:'.photo-wrap .swiper-button-prev',
        nextButton:'.photo-wrap .swiper-button-next',
        autoplayDisableOnInteraction: false,
        speed: 500,
        onSlideNextStart: function () {
            var oLength = Number($('.photo-list').children().length);
            var total = Number($('#pages').text())
            var pages = Number($('#pages').text()) + 1;
            if (oLength == total) {
                $('#pages').text(oLength)
            } else {
                $('#pages').text(pages)
            }
        },
        onSlidePrevStart: function () {
            var pages = Number($('#pages').text()) - 1;
            var total = Number($('#pages').text())
            if (total == 1) {
                $('#pages').text(1)
            } else {
                $('#pages').text(pages)
            }
        },

    });
    swiperPhoto.slideTo(index, 0, false);//切换到第一个slide，速度为1秒
    //点击关闭图片预览
    $("div.photo-cover dd.close-photo").click(function () {
        $("div.photo-cover").remove();
    });
}
function removePhotoCover(index,e) {
    $('.photo-cover,.cover-bk-photo').remove();
}
//倒计时
function add0(m) { return m < 10 ? '0' + m : m }
function formatDate1(now) {
    var time = new Date(now);
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    return y + '/' + add0(m) + '/' + add0(d) + ' ' + add0(h) + ':' + add0(mm) + ':' + add0(s);
}
function countDownDay() {//有天
    $('.s_countdown').each(function (i, obj) {
        var end_time = $(obj).attr('data-enddate');
        var timestamp = Date.parse(new Date());
        var now = timestamp / 1000;
        var end_time_date = formatDate1(end_time * 1000);
        var NowTime = new Date();
        var t = end_time - NowTime.getTime();
        var d = Math.floor(t / 1000 / 60 / 60 / 24);
        var h = Math.floor(t / 1000 / 60 / 60 % 24);
        var m = Math.floor(t / 1000 / 60 % 60);
        var s = Math.floor(t / 1000 % 60);
        if (s >= 0) {
            var _html = '<em class="timebox-num">${d}</em>天 <em class="timebox-num">${h}</em>:<em class="timebox-num">${m}</em>:<em class="timebox-num">${s}</em>';
            $(obj).html(_html)
        }
        if (t <= 0) {
            var _html = '已结束';
            $(obj).parent('.bm-time').html(_html)
        }
    })
}
/*抖音视频库弹窗预览*/
function dyPop(id){
    $('.bPhotoWrap').remove()
    console.log('groupData:',groupData)
    var dyBox = $('.js-uldy')
    var dyBoxCur = dyBox.find('.js-popdy.cur')
    var prevId = dyBoxCur.prev().data('id'),
        nextId = dyBoxCur.next().data('id');
    var bPhotoWrapHtml = '<div class="bPhotoWrap no-select" style="display:block;">\
                        <div class="bPhotoBox">\
                            <div class="ui_title_bar" style="height:auto;"><div class="ui_title" unselectable="on" style="cursor: move;">播放视频</div><div class="ui_title_buttons"><a class="ui_close" href="javascript:;" onclick="$(this).parents(\'.bPhotoWrap\').remove();$(\'.js-popdy\').removeClass(\'cur\');">×</a></div></div>'
    if(prevId){
        bPhotoWrapHtml += '<span class="rowbtn lefrow on"></span>'
    }else{
        bPhotoWrapHtml += '<span class="rowbtn lefrow off" onclick="showTip(\'这已经是第一个了~\', 3, 2);"></span>'
    }
    bPhotoWrapHtml += '<div class="cenbox clearfix"><div class="conbox"></div></div>'
    if(nextId){
        bPhotoWrapHtml += '<span class="rowbtn rigrow on"></span>'
    }else{
        bPhotoWrapHtml += '<span class="rowbtn rigrow off" onclick="showTip(\'这已经是最后一个了~\', 3, 2);"></span>'
    }
    bPhotoWrapHtml += '</div></div>'
    $('body').append(bPhotoWrapHtml)
    popConBox(id)
    $('.bPhotoWrap .lefrow.on').click(function(event) {
        dyBoxCur.removeClass('cur').prev().addClass('cur')
        var prevGroupData=dyBoxCur.prev().data('json')
        groupData = prevGroupData
        if(groupData){
            dyPop(prevId)
        }
    });
    $('.bPhotoWrap .rigrow.on').click(function(event) {
        dyBoxCur.removeClass('cur').next().addClass('cur')
        var nextGroupData=dyBoxCur.next().data('json')
        groupData = nextGroupData
        if(groupData){
            dyPop(nextId)
        }
    });
}
function popConBox(id){
    console.log(groupData)
    var conBoxHtml = ''
    //视频
    conBoxHtml = '<div class="showbox">\
        <iframe src="'+groupData.video+'" style="width:100%;height:100%;"></iframe>\
    </div>'
    if(groupData.collect > 0){
        var collectHtml = '<span class="btn active r js-collect" data-id="'+groupData.id+'" data-collect="'+groupData.collect+'">已收藏</span>';
    }else{
        var collectHtml = '<span class="btn r js-collect" data-id="'+groupData.id+'" data-collect="'+groupData.collect+'">收藏</span>';
    }
    conBoxHtml += '<div class="txtbox">\
                    <div class="iconbox clearfix">\
                        <span><i class="iconf icon-zanpress"></i>'+groupData.zan+'</span>\
                        <span><i class="iconf icon-huifu"></i>'+groupData.huifu+'</span>\
                        <span><i class="iconf icon-fenxiang"></i>'+groupData.fenxiang+'</span>\
                    </div>\
                    <div class="info ellipsis2">'+groupData.info+'</div>\
                    <div class="avabox">\
                        <img src="'+groupData.ava+'" alt="头像">\
                        <span class="name">'+groupData.name+'</span>'
    if(groupData.heji){
      conBoxHtml += '<span class="intro">所属合集：'+groupData.heji+'</span>'
    }
    conBoxHtml += '<span class="time">发布时间：'+groupData.time+'</span>\
                        '+collectHtml+'\
                    </div>\
                  </div>'
    $('.bPhotoWrap .conbox').html(conBoxHtml)
}
//复制链接
function copyMiniAppPath(obj) {
    var path = obj.getAttribute('data-src');
    $("#clipboard").val(path);
    $("#clipboard").select();
    document.execCommand("Copy"); // 执行浏览器复制命令
    alert("复制成功，地址为：" + path);
}