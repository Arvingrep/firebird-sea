$(function(){

  var djs = $('#djs em');
  var dataGeetest = "";
  var ftype = "phone";

  // 文本框输入
  $('.inpbox input').focus(function(){
    var t = $(this), inpbox = t.closest('.inpbox');
    inpbox.addClass('focus');
  })
  $('.inpbox input').blur(function(){
    var t = $(this), inpbox = t.closest('.inpbox');
    inpbox.removeClass('focus');
  })
  $('.inpbox input').on('input propertychange', function(){
    var account = $('#account'), vdimgck = $('#vdimgck'), yzm = $('#yzm'), password = $('#password');
    if (account.val() != "" && vdimgck.val() != "") {
      $('.step1 .submit').removeClass('disabled');
    }else {
      $('.step1 .submit').addClass('disabled');
    }
    if (yzm.val() != "") {
      $('.step2 .submit').removeClass('disabled');
    }else {
      $('.step2 .submit').addClass('disabled');
    }
    if (password.val() != "") {
      $('.step3 .submit').removeClass('disabled');
    }else {
      $('.step3 .submit').addClass('disabled');
    }
  })

  $('.account_clear').click(function(){
    $('#account').val('');
  })

  // 更新验证码
  $(".vdimgck").click(function(){
    var img = $(this), src = img.attr('src') + '?v=' + new Date().getTime();
    img.attr('src',src);
  })

  // 弹出层
  $('.account dt').click(function(){
    $('.layer').show();
    $('.mask').addClass('show');
  })

  // 关闭弹出层
  $('.layer_close').click(function(){
    $('.layer').hide();
    $('.mask').removeClass('show');
  })

  $('.layer li').click(function(){
    var t = $(this), txt = t.find('em').text();
    $('.account dt label').text(txt);
    $('.layer').hide();
    $('.mask').removeClass('show');
  })



  /*var times = null;
  // 第一步的下一步
  $('.submit').click(function(){
    event.preventDefault();

    var t = $(this), step = t.closest('.step');
    if(t.hasClass('disabled')){return;};

    $('.step').removeClass('hide').addClass('show');
    if (step.hasClass('step1') && times == null) {
      countDown(60,djs);
    };

  })*/

  //发送验证码
  function sendPhoneVerCode(){
    var btn = $('.get-yzm');
    if(btn.filter(":visible").hasClass("disabled")) return;

    var vericode = $("#vdimgck").val();
    if(vericode == '' && !geetest){
      alert(langData['siteConfig'][20][170]);
      return false;
    }

    var number = $('#account').val();
    if (number == '') {
      alert(langData['siteConfig'][20][166]);
      return false;
    }

    if(number.indexOf("@") > 0){
      var emReg = !!number.match(/^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/);
      if (!emReg) {
        alert(langData['siteConfig'][20][178]);
        return false;
      }
      ftype = "email";
    }else if(isNaN(number)){
      alert(langData['siteConfig'][20][179]);
      return false;
    }else{
      ftype = "phone";
    }

    btn.addClass("disabled");

    if(ftype == "phone"){

      var action = "getPhoneVerify";
      var dataName = "phone";

      $.ajax({
        url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=fpwd",
        data: "vericode="+vericode+"&areaCode=86&phone="+number+dataGeetest,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {

          //获取成功
          if(data && data.state == 100){

            $(".sendform2 .tips").html(langData['siteConfig'][7][0]+'<em class="blue jsphone"></em>'+langData['siteConfig'][4][3]).siblings().show();
            $(".jsphone").text(number);
            $('.step').addClass('show').removeClass("hide");

            $("#maskFpwd, #popupFpwd-captcha-mobile").removeClass("show");

            countDown(60, djs);

          //获取失败
          }else{
            btn.removeClass("disabled");
            alert(data.info);
          }
        },
        error: function(){
          btn.removeClass("disabled");
          alert(langData['siteConfig'][20][173]);
        }
      });

    }else{

      $.ajax({
        url: masterDomain+"/include/ajax.php?service=member&action=backpassword",
        data: "vericode="+vericode+"&type=1&email="+$('#account').val()+dataGeetest,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {

          $("#maskFpwd, #popupFpwd-captcha-mobile").removeClass("show");

          if(data){
            if(data.state == 100){

              $(".jsphone").text($("#account").val())
              $(".sendform2 .tips").html(langData['siteConfig'][20][72]).siblings().hide();
              $('.step').addClass('show').removeClass("hide");

            }else{
              alert(data.info);
              btn.removeAttr("disabled").val(langData['siteConfig'][6][1]);
            }
          }else{
            alert(langData['siteConfig'][20][180]);
            btn.removeAttr("disabled").val(langData['siteConfig'][6][1]);
          }
        },
        error: function(){
          alert(langData['siteConfig'][20][181]);
          btn.removeAttr("disabled").val(langData['siteConfig'][6][1]);
        }
      });

    }



  }


  if(!geetest){
    $('.get-yzm').click(function(){
      if(!$(this).hasClass("disabled")){
        sendPhoneVerCode();
      }
    });
  }else{

    //极验验证
    var handlerPopupFpwd = function (captchaObjFpwd) {
      // captchaObjFpwd.appendTo("#popupFpwd-captcha-mobile");

      // 成功的回调
      captchaObjFpwd.onSuccess(function () {
        var validate = captchaObjFpwd.getValidate();
        dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;

        //邮箱找回
        if(ftype == "email"){
          var btn = $("#fpwdForm .login-btn input");
          //异步提交
          $.ajax({
            url: masterDomain+"/include/ajax.php?service=member&action=backpassword",
            data: "type=1&email="+$('#account').val()+dataGeetest,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {

              $("#maskFpwd, #popupFpwd-captcha-mobile").removeClass("show");

              if(data){
                if(data.state == 100){

                  $(".jsphone").text($("#account").val())
                  $(".sendform2 .tips").html(langData['siteConfig'][20][72]).siblings().hide();
                  $('.step').addClass('show').removeClass("hide");


                }else{
                  alert(data.info);
                  btn.removeAttr("disabled").val(langData['siteConfig'][6][1]);
                }
              }else{
                alert(langData['siteConfig'][20][180]);
                btn.removeAttr("disabled").val(langData['siteConfig'][6][1]);
              }
            },
            error: function(){
              alert(langData['siteConfig'][20][181]);
              btn.removeAttr("disabled").val(langData['siteConfig'][6][1]);
            }
          });


        //获取短信验证码
        }else{

          $(".sendform2 .tips").html(langData['siteConfig'][7][0]+'<em class="blue jsphone"></em>'+langData['siteConfig'][4][3]).siblings().show();

          var number   = $('#account').val();
          if (number == '') {
            alert(langData['siteConfig'][20][27]);
            return false;
          } else {
            sendPhoneVerCode();
          }

        }
      });

      window.captchaObjFpwd = captchaObjFpwd;
    };

    $(".sendform").submit(function(e){
      e.preventDefault();
      $(this).find('.submit').click();
    })

    //获取验证码
    $('.get-yzm').click(function(){
      if($(this).hasClass("disabled")) return;
      var number   = $('#account').val();
      if (number == '') {
        alert(langData['siteConfig'][20][166]);
        return false;
      } else {
        if(number.indexOf("@") > 0){
          var emReg = !!number.match(/^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/);
          if (!emReg) {
            alert(langData['siteConfig'][20][178]);
            return false;
          }
          ftype = "email";
        }else if(isNaN(number)){
          alert(langData['siteConfig'][20][179]);
          return false;
        }else{
          ftype = "phone";
        }

        if (captchaObjFpwd) {
            captchaObjFpwd.verify();
        }
        // $("#maskFpwd, #popupFpwd-captcha-mobile").addClass("show");

      }
    });


    //邮箱确认找回
    $("#fpwdForm .login-btn input").bind("click", function(){
      if(!$('.form-item-email').hasClass('dn')){

        var number = $('#account').val();
        if (number == '') {
          alert(langData['siteConfig'][20][31]);
          return false;
        } else {
          var emReg = !!number.match(/^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/);
          if (!emReg) {
            alert(langData['siteConfig'][20][178])
            return false;
          }
        }

        if (captchaObjFpwd) {
          captchaObjFpwd.verify();
        }
        // $("#maskFpwd, #popupFpwd-captcha-mobile").addClass("show");

      }
    });


    $("#maskFpwd").click(function () {
      // $("#maskFpwd, #popupFpwd-captcha-mobile").removeClass("show");
    });


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
            }, handlerPopupFpwd);
        }
    });
  }

  // 手机号已注册
  $('.login-pop .cancel').click(function(){
    $('.login-pop').hide();
    $('.mask').removeClass('show');
  })

  // 第二步
  // 密码可见
  $('.psw-show').click(function(){
    var t = $(this);
    if (t.hasClass('psw-hide')) {
      t.removeClass('psw-hide');
      $('#password').attr('type', 'password');
    }else {
      t.addClass('psw-hide');
      $('#password').attr('type', 'text');
    }
  })


  // 手机找回时提交
  /*$('#step2_btn').click(function(){
    var t = $(this);
    if(t.hasClass('disabled')){return;};

    $('.step').removeClass('hide show').addClass('show1');

  })*/

  // 确定
  //没有开启极验，或者开启了但是必须是手机找回时才可用
  $('#step2_btn').click(function() {
    if(!geetest || (geetest && ftype == "phone")){
      var btn = $(this), type = 2, data = [];
      var number = $('#account').val();

      //邮箱找回
      if (ftype == "email") {
        type = 1;
        if (number == '') {
          alert(langData['siteConfig'][20][31]);
          return false;
        } else {
          var emReg = !!number.match(/^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/);
          if (!emReg) {
            alert(langData['siteConfig'][20][178])
            return false;
          }
        }

        data.push("email="+number);

      //手机找回
      }else{

        if (number == '') {
          alert(langData['siteConfig'][20][27]);
          return false;
        }

        var yzm = $("#yzm").val();
        if(yzm == ''){
          alert(langData['siteConfig'][20][28]);
          return false;
        }

        data.push("areaCode=86");
        data.push("phone="+number);
        data.push("vdimgck="+yzm);

      }

      if(!geetest){
        var vericode = $("#vdimgck").val();
        if(vericode == ''){
          alert(langData['siteConfig'][20][176]);
          return false;
        }
      }

      btn.attr("disabled", true).val(langData['siteConfig'][6][35]+'...');
      data.push("type="+type);
      data.push("vericode="+vericode);

      //异步提交
      $.ajax({
        url: masterDomain+"/include/ajax.php?service=member&action=backpassword",
        data: data.join("&"),
        type: "GET",
        dataType: "jsonp",
        success: function (data) {

          if(data){
            if(data.state == 100){

              $(".step").removeClass("show hide").addClass("show1");
              $("#data").val(data.info.split("data=")[1]);

              /*if(type == 1){
                $("#mailNote").html(data.info);
                $(".mask").fadeIn(100);

                $("#fpwdForm #verifycode").click();
                btn.removeAttr("disabled").val(langData['siteConfig'][6][1]);
              }else{
                location.href = data.info;
              }*/

            }else{
              alert(data.info);
              $("#fpwdForm #verifycode").click();
              btn.removeAttr("disabled").val(langData['siteConfig'][6][1]);
            }
          }else{
            alert(langData['siteConfig'][20][180]);
            $('#fpwdForm #verifycode').click();
            btn.removeAttr("disabled").val(langData['siteConfig'][6][1]);
          }
        },
        error: function(){
          alert(langData['siteConfig'][20][181]);
          $('#fpwdForm #verifycode').click();
          btn.removeAttr("disabled").val(langData['siteConfig'][6][1]);
        }
      });


    }
  })

  /*$('#step3_btn').click(function(){
    var t = $(this);
    if(t.hasClass('disabled')){return;};

    $('.success-pop').show();
    $('.mask').addClass('show');

  })*/

  // 提交新密码
  $("#setPswForm").submit(function(e){
    e.preventDefault();
    $("#step3_btn").click();
  })
  $("#step3_btn").click(function(){
    var t = $(this), tj = true;

    if(t.hasClass("disabled")) return false;

    var password = $('#password');
    if (password.val() == "") {
      alert(langData['siteConfig'][20][164]);
      return false;
    }

    t.addClass("disabled").html(langData['siteConfig'][7][1]+"...");

    //异步提交
    $.ajax({
      url: masterDomain+"/include/ajax.php?service=member&action=resetpwd&data="+$("#data").val()+"&npwd="+password.val(),
      type: "post",
      dataType: "jsonp",
      success: function (data) {
        if(data){

          if(data.state == 100){

            $('.success-pop').show();
            $('.mask').addClass('show');

            setTimeout(function(){
              location.href = userDomain;
            }, 1000);

          }else{
            alert(data.info);
            t.removeClass("disabled").html(langData['siteConfig'][6][1]);
          }

        }else{
          alert(langData['siteConfig'][20][180]);
          t.removeClass("disabled").html(langData['siteConfig'][6][1]);
        }
      }
    });
  })

  //返回
  $('.back').click(function(){
    var step = $(this).closest('.step'), index = step.index();
    if (index == 1) {
      $('.step').addClass('hide').removeClass('show');
    }
    if (index == 2) {
      $('.step').addClass('show').removeClass('show1');
    }
  })



  //倒计时（开始时间、结束时间、显示容器）
  var times = null;
	var countDown = function(time, obj, func){
    times = obj;
    $(".get-yzm").addClass("disabled")
    obj.text(time+'s');
    mtimer = setInterval(function(){
      obj.text((--time)+'s');
      if(time <= 0) {
        clearInterval(mtimer);
        obj.text('');
        $(".get-yzm").removeClass("disabled")
      }
    }, 1000);
  }

})
