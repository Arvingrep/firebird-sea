$('#contact').bind('change',function(){
	checkContact();
});
// 错误提示
  function showError(str){
    var o = $(".error");
    o.html('<p>'+str+'</p>').css('display','block');
    setTimeout(function(){o.hide()},1000);
  }
function checkContact(){
  $('.test_code').hide();
  if(!customFabuCheckPhone) return;
  var v = $('#contact').val();
  if(v != ''){
    //修改
    if(id){
      if(v != detail.tel && ((userinfo.phoneCheck && v != userinfo.phone) || !userinfo.phoneCheck) ){
        $('.test_code').show();
      }
    //新增
    }else{
      if(userinfo.phone == '' || userinfo.phoneCheck == 0 || v != userinfo.phone){
        $('.test_code .tip').hide();
        $('.test_code').show();
      }
    }
  }
}
checkContact();

var dataGeetest = "";
  var ftype = "phone";

    //发送验证码
 function sendPhoneVerCode(captchaVerifyParam,callback){
    var btn = $('.test_btn button');
    var areaCode = $('#areaCode').val();
    if(btn.filter(":visible").hasClass("disabled")) return;
    var vericode = $("#vdimgck").val();  //图形验证码
    if(vericode == '' && !geetest){
      alert(langData['siteConfig'][20][170]);//请输入图片验证码
      return false;
    }
    var number = $('#contact').val();
    if (number == '') {
      showError(langData['siteConfig'][20][27]);//请输入您的手机号
      return false;
    }

   if(isNaN(number)){
      alert(langData['siteConfig'][20][179]);//账号错误
      return false;
    }else{
      ftype = "phone";
    }

    btn.addClass("disabled");

    if(ftype == "phone"){

      var action = "getPhoneVerify";
      var dataName = "phone";
      var  param = "vericode="+vericode+"&areaCode="+areaCode+"&phone="+number;
      if(captchaVerifyParam && geetest == 2){
          param = param + '&geetest_challenge=' + captchaVerifyParam
        }else if(geetest == 1 && captchaVerifyParam){
          param = param +  captchaVerifyParam
        }
      $.ajax({
        url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=verify",
        data: param,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
          if(callback){
            callback(data)
          }
          //获取成功

          if(data && data.state == 100){
           showErrAlert('已发送到 +'+areaCode+' '+number);//验证码已发送
           countDown(60, $('.test_btn button'));
           //获取失败
          }else{
            btn.removeClass("disabled");
            showErrAlert(data.info);
          }
        },
        error: function(){
          btn.removeClass("disabled");
          showErrAlert(langData['siteConfig'][20][173]);//网络错误，发送失败！
        }
      });
    }
  }

//倒计时
function countDown(time, obj){
    obj.html(time+(langData['siteConfig'][44][1].replace('1',''))).addClass('disabled');//1秒后重发
    mtimer = setInterval(function(){
        obj.html((--time)+(langData['siteConfig'][44][1].replace('1',''))).addClass('disabled');//1秒后重发
        if(time <= 0) {
            clearInterval(mtimer);
            obj.html(langData['siteConfig'][6][55]).removeClass('disabled');//重新发送
        }
    }, 1000);
}

  if(!geetest){
    $('.test_btn button').click(function(){
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
        if(ftype == "phone"){
			//获取短信验证码
          var number   = $('#contact').val();

          if (number == '') {
            showError(langData['siteConfig'][20][27]);//请输入您的手机号
            return false;
          } else {
            sendPhoneVerCode();
          }

        }
      });

      window.captchaObjFpwd = captchaObjFpwd;
    };


    



    captchaVerifyFun.initCaptcha('h5','#codeButton',sendPhoneVerCode)	
    //获取验证码
    $('.test_btn button').click(function(){
      if($(this).hasClass("disabled")) return;
      var number   = $('#contact').val();
      if (number == '') {
        showError(langData['siteConfig'][20][27]);//请输入您的手机号
        return false;
      } else {
        if(isNaN(number)){
          alert(langData['siteConfig'][20][179]);//账号错误
          return false;
        }else{
          ftype = "phone";
        }

        if (geetest) {
          //弹出验证码
          if (geetest == 1) {
            captchaVerifyFun.config.captchaObjReg.verify();
          } else {
            $('#codeButton').click()
          }
        }

      }
    });
  }
