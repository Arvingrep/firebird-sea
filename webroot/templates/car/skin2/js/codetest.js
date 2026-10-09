$('#contact').bind('change',function(){
	checkContact();
});
function checkContact(){
  $('.test_code').hide();
  var v = $('#contact').val();
  if(v != ''){
    //修改
    if(id){
      if(v != detail.contact && ((userinfo.phoneCheck && v != userinfo.phone) || !userinfo.phoneCheck) ){
        $('.test_code').show();
      }
    //新增
    }else{
      if(userinfo.phone == '' || !userinfo.phoneCheck || v != userinfo.phone){
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
    if(btn.filter(":visible").hasClass("disabled")) return;

    var vericode = $("#vdimgck").val();  //图形验证码
    if(vericode == '' && !geetest){
      alert(langData['siteConfig'][20][170]);
      return false;
    }

    var number = $('#contact').val();
    if (number == '') {
      alert(langData['siteConfig'][20][27]);
      return false;
    }

   if(isNaN(number)){
      alert(langData['siteConfig'][20][179]);
      return false;
    }else{
      ftype = "phone";
    }

    btn.addClass("disabled");

    if(ftype == "phone"){

      var action = "getPhoneVerify";
      var dataName = "phone";
      var areaCode  = $("#areaCode").val();
      areaCode = areaCode ? areaCode : '86'
      let param = "vericode="+vericode+"&areaCode="+areaCode+"&phone="+number
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
          //获取成功
          if(callback){
            callback(data)
          }
          if(data && data.state == 100){
          //获取失败
           alert('验证码已发送');
           countDown(60, $('.getCodes'));
          }else{
            btn.removeClass("disabled");
            if(data.info != '图形验证错误，请重试！'){
              alert(data.info);
            }
          }
        },
        error: function(){
          btn.removeClass("disabled");
          alert(langData['siteConfig'][20][173]);
        }
      });
    }
  }

//倒计时
function countDown(time, obj){
    obj.html(time+'秒后重发').addClass('disabled');
    mtimer = setInterval(function(){
        obj.html((--time)+'秒后重发').addClass('disabled');
        if(time <= 0) {
            clearInterval(mtimer);
            obj.html('重新发送').removeClass('disabled');
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
    
  captchaVerifyFun.initCaptcha('web','#button',sendPhoneVerCode)
    //获取验证码
    $('.test_btn button').click(function(){
      if($(this).hasClass("disabled")) return;
      var number   = $('#contact').val();
      if (number == '') {
        alert(langData['siteConfig'][20][27]);
        return false;
      } else {
        if(isNaN(number)){
          alert(langData['siteConfig'][20][179]);
          return false;
        }else{
          ftype = "phone";
        }
		
        if(geetest == 1){
          captchaVerifyFun.config.captchaObjReg.verify();
        }else{
          $('#button').click()
        }
      
      }
    });


   

   
  }