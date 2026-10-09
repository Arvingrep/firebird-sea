$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

  firstLoad();
  window.addEventListener('hashchange', function () {
    firstLoad();
  })

  //小程序不显示其他快捷登录
  var device = navigator.userAgent;
// 百度小程序、QQ小程序
  var isbaidu = device.indexOf('swan-baiduboxapp') > -1 ; //百度小程序
  var isqq = device.toLowerCase().indexOf('qq') > -1 && device.toLowerCase().indexOf('miniprogram')>-1 ; //QQ小程序
  if(!isbaidu && !isqq){
     $('.other-login').show();
  }

  // if(self.parent.$('html').hasClass('wx_miniprogram')){
  //     $('.other-login li').hide();
  //     $('.other-login .li-sms, .other-login .li-weixin').show();
  // }

  function firstLoad(){
    if(location.hash == '#reg'){
      if(regstatus == 0){
        showMsg(regclosemessage ? regclosemessage : langData['siteConfig'][45][9]);//会员注册暂时关闭，请稍后重试
        $('.tabCon').eq(1).find("input").attr("disabled", true);
        $('.submit').addClass('disabled');
      }
      $("#register").parent().addClass('active').siblings().removeClass('active');
      $('.tabCon').eq(1).addClass("showform").siblings().removeClass("showform");
    }else{
      $("#login").parent().addClass('active').siblings().removeClass('active');
      $('.tabCon').eq(0).addClass("showform").siblings().removeClass("showform");
    }
  }

 // console.log(parent.operType);
 // if(parent.operType == "login"){
 //  $("#login").parent().addClass('active').siblings().removeClass('active');
 // }else if(parent.operType == "register"){
 //  $("#register").parent().addClass('active').siblings().removeClass('active');
 //  $('.tabCon').eq(1).addClass("showform").siblings().removeClass("showform");
 // }
var audio,audio1,audio2;
    audio = new Audio();
    audio1 = new Audio();
    audio2 = new Audio();
    audio.src = audioSrc.refresh;
    audio1.src = audioSrc.tap;
    audio2.src = audioSrc.cancel;

    var appSign = [];
    var isapp = 0;
    setTimeout(function(){
      //获取APP信息
      setupWebViewJavascriptBridge(function(bridge) {
        bridge.callHandler("getAppInfo", {}, function(responseData){
            isapp = 1;
            var data = JSON.parse(responseData);
            if(data.device && data.title && data.serial){
                appSign.push('deviceTitle='+data.title);
                appSign.push('deviceType='+data.device);
                appSign.push('deviceSerial='+data.serial);
            }
        });
      });
    }, 500);

  var device = navigator.userAgent;
  if (device.indexOf('huoniao_iOS') > -1) {
  	$('.header').addClass('padTop20');
  }

  // 免费注册
  $('.free-reg').click(function(){
      $(".formbox .tabHead ul li").removeClass('active');
      $("#register").parent().addClass('active');
      $('.tabCon').eq(1).addClass("showform").siblings().removeClass("showform");
  })

  $("#register").on("touchend",function(){
        audio.play();
       $(".formbox .tabHead ul li").removeClass('active');
       $("#register").parent().addClass('active');
       $('.tabCon').eq(1).addClass("showform").siblings().removeClass("showform");
  })
  $("#login").on("touchend",function(){
        audio.play();
       $(".formbox .tabHead ul li").removeClass('active');
       $("#login").parent().addClass('active');
       $('.tabCon').eq(0).addClass("showform").siblings().removeClass("showform");
  })

   // 注册切换
  $(".tabCon .reg-tab ul li").bind('touchend', function(){
        audio.play();
        $(this).addClass("curr").siblings().removeClass("curr");
        var i=$(this).index();
        $('.regbox').eq(i).addClass("regshow").siblings().removeClass("regshow");
  });

  // 短信登录
  $('.li-sms').on('click',function(){
     $('.logbox').toggleClass('logshow');
     var text = $(this).find('p').text();
     if(text==langData['siteConfig'][2][15]){//短信登录
       $(this).find('p').text(langData['siteConfig'][2][14]).siblings('em').removeClass('sms').addClass('normal');//普通登录
     }else{
       $(this).find('p').text(langData['siteConfig'][2][15]).siblings('em').removeClass('normal').addClass('sms');//短信登录
     }
  })

  // 底部按钮关闭
    $(".closeBox i").on("touchend",function() {
        //处理跨域问题
        if(parentDomain.indexOf(masterDomain) < 0){
            $('body').append('<iframe style="display: none;" scrolling="no" src="'+parentDomain+'include/iframe.html?action=btnLoginClose&v='+~(-new Date())+'"></iframe>');
        }

        window.parent.postMessage(['btnLoginClose'], masterDomain);
        parent.btnLoginClose();
    });

  // 登录
  // 密码框显示叉号
  $('#loginForm #password').bind({
      focus:function(){
          if (this.value == this.defaultValue){
             this.value="";
          }
          $('.icon-clear').css('opacity','1');
      },
      keypress:function(){
          if (this.value == this.defaultValue){
            this.value="";
          }
          $('.icon-clear').css('opacity','1');
        },
        blur:function(){
          if (this.value == ""){
            this.value = this.defaultValue;
          }
          $('.icon-clear').css('opacity','0');
        }
      });
  if($('#loginForm #password').val()!=''){
     $('.icon-clear').css('opacity','1');
  }
  // 密码清空
  $("#loginForm .icon-clear").bind('click', function(){
      var inppass = $('#password').val();
      if(inppass!=''){

        $('#password').val('');
      }
      $('#loginForm .icon-clear').css('opacity','0');
  });
  //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        //手机注册
                        $('#registerAreaCodeLab').closest('label').hide();
                        $('.regbox .f-mobile .inp').css({'padding-left':'.2rem'});
                        //用户名注册
                        $('.areacode_span').hide();
                        //短信登录
                        $('#loginAreaCodeLab').closest('label').hide();
                        $('.logbox .f-mobile .inp').css({'padding-left':'.2rem'});
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层 用户名注册
    $(".areacode_span").click(function(){
        $('.layer').show();
        $('.mask').addClass('show');
    })


  // 打开手机号地区弹出层
  $(".f-mobile dt").click(function(){
    var t = $(this), fid = t.closest("form").attr("id"), top = t.offset().top + t.height();
    $('.layer').css('top',top).attr("data-form", fid).show();
    $('.mask-code').addClass('show');
  })

  // 选中区域
  $('.layer').delegate('li', 'click', function(){

    var t = $(this), txt = t.find('em').text(), form = $("#"+$(".layer").attr("data-form"));
    form.find(".f-mobile dt font").text(txt);
    form.find(".areaCode").val(txt.replace("+",""));

    //用户名注册
    $(".areacode_span label").text(txt);
    $("#userAreacode").val(txt.replace("+",""));

    $('.layer').hide();
    $('.mask-code').removeClass('show');
  })

  // 关闭弹出层
  $('.layer_close, .mask-code').click(function(){
    $('.layer, #popupReg-captcha-mobile').hide();
    $('.mask-code').removeClass('show');
  })


  // 密码可见
  $('.icon-eye').click(function(){
    var t = $(this);
    if (t.hasClass('disabled')) {
      t.removeClass('disabled');
      $('#password').attr('type', 'text');
    }else {
      t.addClass('disabled');
      $('#password').attr('type', 'password');
    }
  })

  // 去掉手机号前的0
  // 部分用户名是以0开头的，这里的操作会影响用户名登录 by gz 20200115
  $('#user-name').blur(function(){
    // var vuser = $('#user-name').val();
    // $('#user-name').val(vuser.replace(/\b(0+)/gi,""));
  })

  $('.btn-close').click(function(){
      $('.tipBox').hide();
  })

  // 登录验证
  $('.login-button').click(function(){
    event.preventDefault();

    var t = $(this);
    if(t.hasClass('disabled')){return;};

    var config = getConfig();
    var tj = true;

    if(config.logintype == 'normal'){
      var username = $('#user-name').val(),
          password = $('#password').val()

      if (username == "") {
        showMsg(langData['siteConfig'][20][166],2000)
        tj = false;
      }else if (password == "") {
        showMsg(langData['siteConfig'][20][165],2000)
        tj = false;
      }

    }else{
      var areaCode = $("#loginAreaCode").val(),
          phone = $("#loginPhone").val(),
          code = $("#vcode1").val();
      var r = checkFrom.phone(areaCode, phone);
      if(!r.ret){
        showMsg(r.info);
        tj = false;
      }else if(code == ''){
        showMsg(langData['siteConfig'][20][28],2000)
        tj = false;
      }
    }

	  if(!tj){
      return false;
    }
    var data = [];
    if(config.logintype == 'normal'){
      data.push("username="+username);
      data.push("password="+password);
      //异步提交
      $.ajax({
        url: "/loginCheck.html",
        data: data.join("&"),
        type: "POST",
        dataType: "html",
        success: function (data) {
          if(data){
            if(data.indexOf("100") > -1){
              $("body").append('<div style="display:none;">'+data+'</div>');

              if(device.indexOf('huoniao') <= -1){
                top.location.reload();
              }else{
                setupWebViewJavascriptBridge(function(bridge) {
                  $.ajax({
                    url: '/getUserInfo.html',
                    type: "GET",
                    async: false,
                    dataType: "jsonp",
                    success: function (data) {
                      if(data){
                        if(redirectUrl.indexOf('wmsj') > -1){
                          bridge.callHandler('appLoginFinish', {'passport': data.userid}, function(){});
                          $('.sucBox').removeClass('tipBox-hide');
                          setTimeout(function(){$('.sucBox').addClass('tipBox-hide');}, 2000)
                          top.location.href = redirectUrl;
                        }else{
                          bridge.callHandler('appLoginFinish', {'passport': data.userid, 'username': data.username, 'nickname': data.nickname, 'userid_encode': data.userid_encode, 'cookiePre': data.cookiePre, 'photo': data.photo}, function(){});
                          bridge.callHandler('pageReload',	{},	function(responseData){});
                          setTimeout(function(){
                              top.location.reload();
                          }, 200);
                        }
                      }else{
                        showMsg(langData['siteConfig'][20][167],2000);
                        $('.login-button').addClass('disabled').text(langData['siteConfig'][2][0]);
                        return false;
                      }
                    },
                    error: function(){
                      showMsg(langData['siteConfig'][20][168],2000)
                      $('.login-button').addClass('disabled').text(langData['siteConfig'][2][0]);
                      return false;
                    }
                  });
                });
              }


            }else{
              var data = data.split("|");
              showMsg(data[1],2000)
              t.removeClass("disabled").text(langData['siteConfig'][2][0]);
              return false;
            }
          }else{
            showMsg(langData['siteConfig'][20][167],2000)
            t.removeClass("disabled").text(langData['siteConfig'][2][0]);
            return false;
          }
        },
        error: function(){
          showMsg(langData['siteConfig'][20][168],2000)
          t.removeClass("disabled").text(langData['siteConfig'][2][0]);
          return false;
        }
      });

    }else if(config.logintype == 'smslogin'){
      data.push("phone="+phone);
      data.push("areaCode="+areaCode);
      data.push("code="+code);
      //异步提交
      $.ajax({
        url: "/include/ajax.php?service=member&action=smsLogin",
        data: data.join("&"),
        type: "POST",
        dataType: "json",
        success: function (data) {
          if(data && data.state == 100){
            if(data.info.isNew == '1'){
              alert(langData['siteConfig'][45][10]);//您已注册成功，初始密码为：111111，请尽快修改
            }

              if(device.indexOf('huoniao') <= -1){
                  top.location.reload();
              }else{
                  setupWebViewJavascriptBridge(function(bridge) {
                      $.ajax({
                          url: '/getUserInfo.html',
                          type: "GET",
                          async: false,
                          dataType: "jsonp",
                          success: function (data) {
                              if(data){
                                  if(redirectUrl.indexOf('wmsj') > -1){
                                      bridge.callHandler('appLoginFinish', {'passport': data.userid}, function(){});
                                      $('.sucBox').removeClass('tipBox-hide');
                                      setTimeout(function(){$('.sucBox').addClass('tipBox-hide');}, 2000)
                                      top.location.href = redirectUrl;
                                  }else{
                                      bridge.callHandler('appLoginFinish', {'passport': data.userid, 'username': data.username, 'nickname': data.nickname, 'userid_encode': data.userid_encode, 'cookiePre': data.cookiePre, 'photo': data.photo}, function(){});
                                      bridge.callHandler('pageReload',	{},	function(responseData){});
                                      setTimeout(function(){
                                          top.location.reload();
                                      }, 200);
                                  }
                              }else{
                                  showMsg(langData['siteConfig'][20][167],2000);
                                  $('.login-button').addClass('disabled').text(langData['siteConfig'][2][0]);
                                  return false;
                              }
                          },
                          error: function(){
                              showMsg(langData['siteConfig'][20][168],2000)
                              $('.login-button').addClass('disabled').text(langData['siteConfig'][2][0]);
                              return false;
                          }
                      });
                  });
              }
          }else{
            showMsg(data.info,2000)
            t.removeClass("disabled").text(langData['siteConfig'][2][0]);
            return false;
          }
        },
        error: function(){
          showMsg(langData['siteConfig'][20][168],2000)
          t.removeClass("disabled").text(langData['siteConfig'][2][0]);
          return false;
        }
      });
    }

  })

  var getYzmBtn = null;
  var dataGeetest = "";

  //发送验证码
  function sendVerCode(captchaVerifyParam,callback){
    var btn = getYzmBtn, form = btn.closest("form");
    var account = form.find(".account");
    account.attr("name", account.attr("data-send"));

    if(btn.hasClass("disabled")) return;

    btn.addClass("disabled").text(langData['siteConfig'][23][99]);
    var  param = form.serialize() ;
    if(captchaVerifyParam && geetest == 2){
        param = param + '&geetest_challenge=' + captchaVerifyParam
      }else if(geetest == 1 && captchaVerifyParam){
        param = param +  captchaVerifyParam
      }
    $.ajax({
      // url: masterDomain+"/include/ajax.php?service=siteConfig&action="+action,
      // data: form.serialize()+"&"+dataName+"="+v+"&type="+type + dataGeetest,
      url: "/include/ajax.php?service=siteConfig",
      data: param,
      type: "GET",
      dataType: "jsonp",
      success: function (data) {

        $("#maskReg, #popupReg-captcha-mobile").removeClass("show");
        if(callback){
          callback(data)
        }
        //获取成功
        if(data && data.state == 100){
          countDown(60, btn);
        //获取失败
        }else{
          btn.removeClass("disabled").text(langData['siteConfig'][4][1]);
          showMsg(data.info);
        }
      },
      error: function(){
        btn.removeClass("disabled").text(langData['siteConfig'][4][1]);
        showMsg(langData['siteConfig'][20][173]);
      }
    });
  }


  if(geetest){

    // //极验验证
    // var handlerPopupReg = function (captchaObjReg) {
    //   // captchaObjReg.appendTo("#popupReg-captcha-mobile");

    //   // 成功的回调
    //   captchaObjReg.onSuccess(function () {
    //     var validate = captchaObjReg.getValidate();
    //     dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;
    //     sendVerCode();
    //     // $("#maskReg, #popupReg-captcha-mobile, .gt_popup").removeClass("show");
    //   });
    //   captchaObjReg.onClose(function () {
    //     // getYzmBtn.text(langData['siteConfig'][4][1]);
    //   })

    //   window.captchaObjReg = captchaObjReg;
    // };

    //获取验证码
    captchaVerifyFun.initCaptcha('h5','#codeButton',sendVerCode)	
    $('.get-yzm').click(function(){
      var t = $(this);
      getYzmBtn = t;

      if(t.hasClass("disabled")) return;

      var r = checkFrom.account();
      if(!r.ret){
        showMsg(r.info);
        return;
      }
      var config = getConfig();

      if(config.type == 'register'){
        t.text(langData['siteConfig'][7][6]);
        sendBeforeCheck(function(data){
          if(data){
            t.text(langData['siteConfig'][4][1]);
            if(data.state == 100){
               //弹出验证码
                if (geetest == 1) {
                  captchaVerifyFun.config.captchaObjReg.verify();
                } else {
                  $('#codeButton').click()
                }
            }else{
              showMsg(data.info);
            }
          // 请求失败直接弹出极验
          }else{
            showMsgClose()
            //弹出验证码
            if (geetest == 1) {
              captchaVerifyFun.config.captchaObjReg.verify();
            } else {
              $('#codeButton').click()
            }
          }
        });

      // 短信验证码登陆直接弹出极验
      }else if(config.type == "login"){
         //弹出验证码
				if (geetest == 1) {
					captchaVerifyFun.config.captchaObjReg.verify();
				} else {
					$('#codeButton').click()
				}
      }

      // $("#maskReg, #popupReg-captcha-mobile, .gt_popup").addClass("show");
    })

   

  }

  if(!geetest){
    $('.get-yzm').click(function(){
      var t = $(this);
      getYzmBtn = t;

      if(t.hasClass("disabled")) return;

      var r = checkFrom.account();
      if(!r.ret){
        showMsg(r.info);
        return;
      }
      var config = getConfig();

      if(config.type == 'register'){
        showMsg('loading', 10000, langData['siteConfig'][45][11], 1);//正在验证账号
        sendBeforeCheck(function(data){
          if(data){
            if(data.state == 100){
              showMsgClose();
              sendVerCode();
            }else{
              showMsg(data.info);
            }
          // 请求失败直接弹出极验
          }else{
            showMsgClose()
            sendVerCode();
          }
        });

      // 短信验证码登陆直接弹出极验
      }else if(config.type == "login"){
        sendVerCode();
      }
    })
  }

  // 更新验证码
  $(".vericode_img").click(function(){
    var img = $(this), src = img.attr('src').split('?')[0] + '?v=' + new Date().getTime();
    img.attr('src',src);
  })
  $(".submit").click(function(){
    $(".regbox.regshow form").submit();
  })
  $(".registerForm").submit(function(e){
    e.preventDefault();

    var form = $(this), btn = $(".submit");

    if(btn.hasClass("disabled")) return;

    form.find(".account").attr("name", "account");

    var config = getConfig();

    // 手机号
    if(config.regtype == "phone"){
      var r = checkFrom.phone($("#registerAreaCode").val(), $("#phone").val());
      if(!r.ret){
        showMsg(r.info);
        return;
      }
      if($("#phone_code").val() == ''){
        showMsg($("#phone_code").attr("placeholder"));
        return;
      }
      if($("#phone_pasw").val() == ''){
        showMsg($("#phone_pasw").attr("placeholder"));
        return;
      }

    // 用户名
    }else if(config.regtype == "username"){
      var r = checkFrom.username($("#username").val());
      if(!r.ret){
        showMsg(r.info);
        return;
      }
      if($("#username_pasw").val() == ''){
        showMsg($("#username_pasw").attr("placeholder"));
        return;
      }
      if($("#username_nickname").length && $("#username_nickname").val() == ''){
        showMsg($("#username_nickname").attr("placeholder"));
        return;
      }
      if($("#username_email").length){
        var r = checkFrom.email($("#username_email").val());
        if(!r.ret){
          showMsg(r.info);
          return;
        }
      }
      if($("#username_phone").length && $("#username_phone").val() == ''){
        showMsg($("#username_phone").attr("placeholder"));
        return;
      }
      if($("#username_code").length && $("#username_code").val() == ''){
        showMsg($("#username_code").attr("placeholder"));
        return;
      }

    // 邮箱
    }else if(config.regtype == "email"){
      var r = checkFrom.email($("#email").val());
      if(!r.ret){
        showMsg(r.info);
        return;
      }
      if($("#email_code").val() == ''){
        showMsg($("#email_code").attr("placeholder"));
        return;
      }
      if($("#email_pasw").val() == ''){
        showMsg($("#email_pasw").attr("placeholder"));
        return;
      }
    }
    if(!$(".agree").is(":checked")){
      showMsg(langData['siteConfig'][45][12]);//您必须同意会员注册协议
      return;
    }
    btn.addClass("disabled").text(langData['siteConfig'][6][35]+"...");
    $.ajax({
      url: "/registerCheck_v1.html",
      data: form.serialize(),
      type: "POST",
      dataType: "html",
      success: function (data) {

        var dataArr = data.split("|");
        var info = dataArr[1];
        if(data.indexOf("100|") > -1){
          $("body").append('<div style="display:none;">'+data+'</div>');
          top.location.href = userDomain;
        }else{
          showMsg(info.replace(new RegExp('<br />','gm'),'\n'));
        }
        btn.removeClass("disabled").text(langData['siteConfig'][6][118]);

      },
      error: function(){
        showMsg(langData['siteConfig'][20][183]);
        btn.removeClass("disabled").text(langData['siteConfig'][6][118]);
      }
    });
  })

   // 消息提示
  var showMsgTimer;
  function showMsg(msg, time, title, type){
    if(showMsgTimer != null){
        clearTimeout(showMsgTimer);
    }
    var type = type != 1 ? 0 : 1;
    var title = title ? title : langData['siteConfig'][44][93];//发生了错误
    $('.tipBox').remove();
    var time = time ? time : 2000;
    $('.errBox').removeClass('tipBox-hide');
    var html='<div class="tipBox errBox">';
    if(type == 0){
      html += '<div class="erleft"><i></i></div>';
    }
    html += '<div class="erright">';
    html += '<h5>'+title+'</h5>';
    html += '<p>'+msg+'</p>';
    // html += '<i class="btn-close"><img src="'+templets+'images/tclose.png" alt=""></i>';
    html += '</div>';
    html += '</div>';
    $('body').append(html);
    showMsgTimer = setTimeout(function(){
      $('.errBox').addClass('tipBox-hide').removeClass('errBox');
    }, time)
    $('.btn-close').click(function(){
      $('.tipBox').hide();
    })
  }
  function showMsgClose(){
    $('.errBox').addClass('tipBox-hide').removeClass('errBox');
  }


  //获取当前操作类型
  function getConfig(){
    var d = {};
    d.type = $(".tabHead li.active").index() == 0 ? 'login' : 'register';
    d.logintype = $(".logbox.logshow").index() == 0 ? 'normal' : 'smslogin';
    d.regtype = $(".reg-tab li.curr").attr("data-type");
    return d;
  }
  var checkFrom = {
    account: function(){
      var config = getConfig();

      if(config.type == "login"){
        var area = $("#loginAreaCode").val();
        var val = $("#loginPhone").val();
        return this.phone(area, val);
      }else if(config.type == 'register'){
        if(config.regtype == "phone"){
          var area = $("#registerAreaCode").val();
          var val = $("#phone").val();
          return this.phone(area, val);
        }else if(config.regtype == "email"){
          var val = $("#email").val();
          return this.email(val);
        }
      }

    },
    phone: function(area, val){
      var res = {};
      if(val != ''){
        if(area == "86"){
          var phoneReg = /(^1\d{10}$)|(^09\d{8}$)/;
          if(!phoneReg.test(val)){
            res = {ret:0,info:langData['siteConfig'][20][465]};//手机号码格式不正确
          }else{
            res = {ret:1,info:'ok'};
          }
        }else{
          res = {ret:1,info:'ok'};
        }
      }else{
        res = {ret:0,info:langData['siteConfig'][20][27]};//请输入您的手机号
      }

      return res;
    },
    email: function(val){
      var res = {};
      if(val != ''){
        var emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
        if(!emailReg.test(val)){
          res = {ret:0,info:langData['siteConfig'][45][14]};//邮箱格式不正确
        }else{
          res = {ret:1,info:'ok'};
        }
      }else{
        res = {ret:0,info:langData['siteConfig'][45][13]};//请输入您的邮箱
      }
      return res;
    },
    username: function(val){
      var res = {};
      if(val == ''){
        res = {ret:0,info:langData['siteConfig'][45][15]};//请输入用户名
      }else{
        if(!/^[a-zA-Z]{1}[0-9a-zA-Z_]{4,15}$/.test(val)){
          res = {ret:0,info:langData['siteConfig'][45][16]};//用户名格式：英文字母、数字、下划线以内的5-20个字！<br />并且只能以字母开头！
        }else{
          res = {ret:1,info:'ok'};
        }
      }
      return res;
    }
  }

  function sendBeforeCheck(callback){
    var rtype = 0, account = data = '';
    var config = getConfig();
    if(config.type == 'register'){
      if(config.regtype == "phone"){
        rtype = 3;
        data = '&areaCode=' + $("#registerAreaCode").val();
        account = $("#phone").val();
      }else if(config.regtype == "username"){
        rtype = 1;
        account = $("#phone").val();
      }else if(config.regtype == "email"){
        rtype = 2;
        account = $("#email").val();
      }
    }

    if(rtype == 0){
      return;
    }

    $.ajax({
      url: '/include/ajax.php?service=member&action=registAccountCheck&rtype='+rtype+'&account='+account+data,
      type: 'get',
      dataType: 'json',
      success: function(data){
        callback(data);
        return;
        yzm.text(langData['siteConfig'][4][1]);
        if(data && data.state == 100){
          callback();
        }else{
          if(config.regtype == "phone" && data.info.indexOf("   ") > -1){
            $('.phone_msg').removeClass('fn-hide');
            showMsg(data.info, 1500, false);
          }
        }
      },
      error: function(){
        callback();
        return;
        yzm.removeClass("disabled").addClass("js_getyzm").text(langData['siteConfig'][4][1]);
        showMsg(langData['siteConfig'][20][173], 1500, false)
      }
    })
  }

  //倒计时（开始时间、结束时间、显示容器）
  var times = null;
  var countDown = function(time, obj, func){
    times = obj;
    obj.addClass("disabled").text(time+'s');
    mtimer = setInterval(function(){
      obj.text((--time)+'s');
      if(time <= 0) {
        clearInterval(mtimer);
        obj.removeClass('disabled').text(langData['siteConfig'][4][2]);
      }
    }, 1000);
  }



    //客户端登录
    $(".other_login a").bind("click", function(event){

        if(device.indexOf('huoniao') > -1){
            var t = $(this), href = t.attr('href'), type = href.split("type=")[1];
            event.preventDefault();

            if(href == 'javascript:;') return false;

            setupWebViewJavascriptBridge(function(bridge) {

                var action = "", loginData = {};

                //QQ登录
                if(type == "qq"){
                    action = "qq";
                }

                //微信登录
                if(type == "wechat"){
                    action = "wechat";
                }

                //新浪微博登录
                if(type == "sina"){
                    action = "sina";
                }

                //支付宝登录
                if(type == "alipay"){
                    action = "alipay";
                    loginData = alipay_app_login;
                }

                //Facebook登录
                if(type == "facebook"){
                    action = "facebook";
                }

                bridge.callHandler(action+"Login", loginData, function(responseData) {
                    if(responseData){

                        var data = JSON.parse(responseData);
    					var access_token = data.access_token ? data.access_token : data.accessToken, openid = data.openid, unionid = data.unionid;

                      	var param = "type="+action+"&action=appback&access_token="+access_token+"&openid="+openid+"&unionid="+unionid+"&"+(appSign.join("&"));
                        if(action == 'facebook'){
                        	param = "type="+action+"&action=appback&uid="+data.uid+"&iconurl="+encodeURIComponent(data.iconurl)+"&name="+data.name+"&"+(appSign.join("&"));
                        }

                        $('.login-button').prop("disabled", true).val(langData['siteConfig'][2][5]+'...');

                        //异步提交
                        $.ajax({
                            url: "/api/login.php",
                            data: param,
                            type: "GET",
                            dataType: "text",
                            success: function (data) {

                                //绑定手机
                                if(data == 'bindMobile'){
                                    location.href = masterDomain + '/bindMobile.html?type=' + action;
                                    return false;
                                }

                                $.ajax({
                                    url: '/getUserInfo.html',
                                    type: "get",
                                    async: false,
                                    dataType: "jsonp",
                                    success: function (data) {
                                        if(data){
                                            bridge.callHandler('appLoginFinish', {'passport': data.userid, 'username': data.username, 'nickname': data.nickname, 'userid_encode': data.userid_encode, 'cookiePre': data.cookiePre, 'photo': data.photo}, function(){});
                                            bridge.callHandler('pageReload', {}, function(responseData){});
                                            setTimeout(function(){
                                                bridge.callHandler("goBack", {}, function(responseData){});
                                            }, 200);
                                        }else{
                                            alert(langData['siteConfig'][20][167]);
                                            $('.login-button').prop("disabled", false).val(langData['siteConfig'][2][0]);
                                        }
                                    },
                                    error: function(){
                                        top.location.href = '/bindMobile.html?type='+action;
                                        return false;
                                    }
                                });

                            },
                            error: function(){
                                // alert(langData['siteConfig'][20][168]);
                                $('.login-button').prop("disabled", false).val(langData['siteConfig'][2][0]);
                            }
                        });
                    }
                });
            });
        }
    });


    if((device.indexOf('huoniao') > -1 || device.indexOf('Alipay') > -1) && alipay_app_login != false){
        $('.li-alipay').show();
    }


    //微信登录验证
    $(".li-weixin").click(function(event){
        if(!navigator.userAgent.toLowerCase().match(/micromessenger/) && navigator.userAgent.toLowerCase().match(/iphone|android/) && device.indexOf('huoniao') <= -1){
            event.preventDefault();
            alert(langData['siteConfig'][20][169]);
        }
    });


})
