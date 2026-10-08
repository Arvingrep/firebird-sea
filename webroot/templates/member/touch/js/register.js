$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

  var type = 0, rtype = 0;

  $("#footer .item").click(function(){
    var t = $(this), index = t.index(), txt = t.children("p").text();
    type = t.attr("data-type");
    rtype = t.attr("data-rtype");
    $("#header .title").text(txt);
    $(".regbox").eq(index).show().siblings().hide();
    t.addClass("active").siblings().removeClass("active");
  }).eq(0).click();
  //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        //手机注册处 区号隐藏
                        $('#areaCodeLab').closest('label').hide();
                        $('.regbox .f-mobile .inp').css({'padding-left':'1.04rem'});
                        //用户名注册处 区号隐藏
                        $('.areacode_span').hide();
                        $('.regbox .inp.code_phone').css({'padding-left':'1.04rem','width':'100%'});
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
    //用户注册 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer').show();
        $('.mask').addClass('show');
    })

  // 手机号注册 打开手机号地区弹出层
  $(".f-mobile dt").click(function(){
    var t = $(this), top = t.offset().top + t.height();
    $('.layer').css('top',top).show();
    $('.mask-code').addClass('show');
  })
  // 选中区域
  $('.layer').delegate('li', 'click', function(){
    var t = $(this), txt = t.find('em').text();

    $("#areaCodeLab").text(txt);//手机号注册
    $(".areacode_span label").text(txt);//用户注册
    $("#areaCode").val(txt.replace("+",""));

    $('.layer').hide();
    $('.mask-code').removeClass('show');

    checkForm($(".regbox-mobile form"));
  })

  // 关闭弹出层
  $('.layer_close, .mask-code').click(function(){
    $('.layer, #popupReg-captcha-mobile').hide();
    $('.mask-code').removeClass('show');
  })

  // 更新验证码
  $(".vericode_img").click(function(){
    var img = $(this), src = img.attr('src') + '?v=' + new Date().getTime();
    img.attr('src',src);
  })

  // 手机号注册 input
  $('#tel').on('input propertychange', function(e){
    var form = $(this).closest("form");
    var r = checkForm(form);
    if(r.account){
      var t = $(this), id = t.attr("id"), account = t.val(), yzm = form.find(".get-yzm"), data = '';
      var rtype = 0;
      yzm.addClass('disabled').text(langData['siteConfig'][7][6]);
      if(id == "tel"){
        rtype = 3;
        data = '&areaCode=' + $("#areaCode").val();
      }else if(id == "email"){
        rtype = 2;
      }else if(id == "username"){
        rtype = 1;
      }else{
        return;
      }

      $.ajax({
        url: '/include/ajax.php?service=member&action=registAccountCheck&rtype='+rtype+'&account='+account+data,
        type: 'get',
        dataType: 'json',
        success: function(data){
          yzm.text(langData['siteConfig'][4][1]);
          if(data && data.state == 100){
            yzm.removeClass("disabled").addClass("js_getyzm");
          }else{
            yzm.removeClass("js_getyzm").addClass("disabled");
            if(id == "tel" && data.info.indexOf("   ") > -1){
              $('.phone_msg .info span').text(account);
              $('.phone_msg').removeClass('fn-hide');
            }else{
              showMsg(data.info, 1500, false);
            }
          }
        },
        error: function(){
          yzm.removeClass("disabled").addClass("js_getyzm").text(langData['siteConfig'][4][1]);
          showMsg(langData['siteConfig'][20][173], 1500, false)
        }
      })

    }
  }).trigger('propertychange');
  // 关闭手机号已注册的提示弹框
  $('.phone_msg .close').click(function(){
    $('.phone_msg').addClass('fn-hide');
  })

  $('.regbox input').change(function(){
    checkForm($(this).closest("form"));
  })

  function checkForm(form){
    var r = true;
    var res = {account:0};
    form.find('input').each(function(){
      var t = $(this);
      if(t.hasClass("inp")){
        if(t.val() == ''){
          r = false;
          return;
        }
      }else if(t.hasClass("agree")){
        if(!t.is(":checked")){
          r = false;
        }
      }
    })

    var account = form.find(".account");
    var val = account.val();
    var yzm = form.find(".get-yzm");
    // 手机号
    if(account.attr("id") == "tel"){
      var area = $("#areaCode").val();
      if(val != ''){
        if(area == "86"){
          var phoneReg = /(^1\d{10}$)|(^09\d{8}$)/;
          if(!phoneReg.test(val)){
            r = false;
            yzm.removeClass("js_getyzm").addClass("disabled");
          }else{
            res.account = 1;
            // yzm.removeClass("disabled").addClass("js_getyzm");
          }
        }else{
          yzm.removeClass("disabled").addClass("js_getyzm");
        }
      }else{
        r = false;
        yzm.removeClass("js_getyzm").addClass("disabled");
      }
    // 邮箱
    }else if(account.attr("id") == "email"){
      if(val != ''){
        var emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
        if(!emailReg.test(val)){
          r = false;
          yzm.removeClass("js_getyzm").addClass("disabled");
        }else{
          console.log("ok")
          res.account = 1;
           yzm.removeClass("disabled").addClass("js_getyzm");
        }
      }else{
        r = false;
        yzm.removeClass("js_getyzm").addClass("disabled");
      }
    }

    if(r){
      form.find('.submit').removeClass('disabled');
    }else{
      form.find('.submit').addClass('disabled');
    }

    return res;
  }

  // 去掉手机号前的0, 86下验证合法性和是否可注册
  $('#tel').keyup(function(){
    var t = $(this), username3 = t.val();
    username3 = username3.replace(/\b(0+)/gi,"");
    t.val(username3);
  })

  var dataGeetest = "";

  //发送验证码
  function sendVerCode(){
    var index = $("#footer .active").index(), form = $(".regbox").eq(index).find("form");
    var btn = form.find('.get-yzm'), v = form.find(".account").val();
    if(btn.hasClass("disabled") || btn.hasClass("not")) return;

    var action = type == 3 ? "getEmailVerify" : "getPhoneVerify";
    var dataName = type == 3 ? "email" : "phone";

    if (v == '') {
      showMsg(type == 3 ? langData['siteConfig'][20][503] : langData['siteConfig'][20][27]);
      return false;
    }else{

        btn.addClass("not").text(langData['siteConfig'][23][99]);

        $.ajax({
          url: masterDomain+"/include/ajax.php?service=siteConfig&action="+action,
          data: form.serialize()+"&"+dataName+"="+v+"&type=signup" + dataGeetest,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {

            $("#maskReg, #popupReg-captcha-mobile").removeClass("show");

            //获取成功
            if(data && data.state == 100){
              countDown(60, form.find(".get-yzm"));
            //获取失败
            }else{
              btn.removeClass("not").text(langData['siteConfig'][4][1]);
              showMsg(data.info);
            }
          },
          error: function(){
            btn.removeClass("not").text(langData['siteConfig'][4][1]);
            showMsg(langData['siteConfig'][20][173]);
          }
        });
    }
  }


  if(geetest){

    //极验验证
    var handlerPopupReg = function (captchaObjReg) {
      // captchaObjReg.appendTo("#popupReg-captcha-mobile");

      // 成功的回调
      captchaObjReg.onSuccess(function () {
        var validate = captchaObjReg.getValidate();
        dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;
        sendVerCode();
        // $("#maskReg, #popupReg-captcha-mobile, .gt_popup").removeClass("show");
      });
      captchaObjReg.onClose(function () {
        var djs = $('.djs'+type);
        djs.text('').hide().siblings('.sendvdimgck').show();
      })

      window.captchaObjReg = captchaObjReg;
    };

    //获取验证码
    $('.regbox').delegate('.js_getyzm', 'click', function(){
      var t = $(this);
      if(t.hasClass("disabled") || t.hasClass("not")) return;

      if (captchaObjReg) {
        captchaObjReg.verify();
      }
      // $("#maskReg, #popupReg-captcha-mobile, .gt_popup").addClass("show");
    })

    $.ajax({
      url: masterDomain+"/include/ajax.php?service=siteConfig&action=geetest&terminal=mobile&t=" + (new Date()).getTime(), // 加随机数防止缓存
      type: "get",
      dataType: "json",
      success: function (data) {
          initGeetest({
              gt: data.gt,
              challenge: data.challenge,
              offline: !data.success,
              new_captcha: true,
              product: "bind",
              width: '312px'
          }, handlerPopupReg);
      }
    });

  }

  if(!geetest){
    $('.regbox').delegate('.js_getyzm', 'click', function(){
      var t = $(this);
      if(t.hasClass("disabled") || t.hasClass("not")) return;
      sendVerCode();
    });
  }


  // 提交
  $(".regbox .submit").click(function(){
    var t = $(this);
    if(t.hasClass("disabled")) return;
    t.closest("form").submit();
  })
  $(".regbox form").submit(function(e){
    e.preventDefault();

    var form = $(this), btn = form.find(".submit"), account = form.find(".account").val();
    var data = [];

    if(btn.hasClass("disabled")) return;

    var tj = true;

    //用户名
    if(type == 1){
      if(account == ''){
        showMsg(langData['siteConfig'][45][15]);//请输入用户名
        return;
      }else{
        if(!/^[a-zA-Z]{1}[0-9a-zA-Z_]{4,15}$/.test(account)){
          showMsg(langData['siteConfig'][45][16]);//用户名格式：英文字母、数字、下划线以内的5-20个字！<br />并且只能以字母开头！
          return;
        }
      }

    // 手机号
    }else if(type == 2){

    // 邮箱
    }else if(type == 3){
      if(account == ''){
        showMsg(langData['siteConfig'][30][82]);//请填写正确邮箱
        return;
      }else{
        if(!/^[a-z0-9]+([\+_\-\.]?[a-z0-9]+)*@([a-z0-9]+\.)+[a-z]{2,6}$/i.test(account)){
          showMsg(langData['siteConfig'][20][511]);//邮箱格式错误！
          return;
        }
      }
    }

    if(!tj) return false;
    btn.addClass("disabled").text(langData['siteConfig'][6][35]+"...");
    //异步提交
    $.ajax({
      url: masterDomain+"/registerCheck_v1.html",
      data: form.serialize() + "&mtype=1&rtype=" + rtype + (data.length ? '&' + data.join('&') : ''),
      type: "POST",
      dataType: "html",
      success: function (data) {

        var dataArr = data.split("|");
        // if(dataArr.length == 3){
        //
        //     location.href = dataArr[2];
        // }

        var info = dataArr[1];
        if(data.indexOf("100|") > -1){
          $("body").append('<div style="display:none;">'+data+'</div>');

		  if(redirectUrl){
			  location.href = decodeURIComponent(redirectUrl);
		  }else{
	          location.href = userDomain;
		  }
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
    return false;

  })

  // 消息提示
  function showMsg(msg, time, showbg){
    var time = time ? time : 2000;
    var sowbg = showbg !== undefined ? showbg : true;
    $('.dialog_msg').remove();

    var html = '<div class="dialog_msg'+(showbg ? ' dialog_top' : '')+'">';
        html += '<div class="box">'+msg+'</div>';
        html += sowbg ? '<div class="bg"></div>' : '';
        html += '</div>';
    $('body').append(html);
    setTimeout(function(){
      $('.dialog_msg').remove();
    }, time)
  }

  //倒计时（开始时间、结束时间、显示容器）
  var times = null;
  var countDown = function(time, obj, func){
    times = obj;
    obj.addClass("not").text(time+'s');
    mtimer = setInterval(function(){
      obj.text((--time)+'s');
      if(time <= 0) {
        clearInterval(mtimer);
        obj.removeClass('not').text(langData['siteConfig'][4][2]);
      }
    }, 1000);
  }

})
