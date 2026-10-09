  //手机号码改变的时候
  // $('#tel').bind('change',function(){
  //  $('.testbox').removeClass('fn-hide')
  // });
  // //验证码没有输入的时候
  // $('#testcode').bind('blur',function(){
  //  if($(this).val()==''){
  //    $(this).siblings('span.tip-inline').removeClass('focus').addClass('error');
  //    return 0;
  //  }else{
  //    //验证验证码
  //    $(this).siblings('span.tip-inline').removeClass('focus').addClass('success');
  //  }
  // })

  $('#tel').bind('keyup',function(){
    checkContact();
  });
  function checkContact(){
    $('.testbox').hide();
    if(!customFabuCheckPhone) return;
    var v = $('#tel').val();
    if(v != ''){
      //修改
      if(id){
        if(v != detail.contact && ((userinfo.phoneCheck && v != userinfo.phone) || !userinfo.phoneCheck) ){
          $('.testbox').show();
        }
      //新增
      }else{
        if(userinfo.phone == '' || !userinfo.phoneCheck || v != userinfo.phone){
          $('.testbox .tip').hide();
          $('.testbox').show();
        }
      }
    }
  }
  checkContact();

//极速验证
var dataGeetest = "";
  var ftype = "phone";

    //发送验证码
 function sendPhoneVerCode(captchaVerifyParam,callback){
    var btn = $('.codebtn');
    if(btn.filter(":visible").hasClass("disabled")) return;

    var vericode = "";
    // var vericode = $("#vdimgck").val();  //图形验证码
    // if(vericode == '' && !geetest){
    //   alert(langData['siteConfig'][20][170]);
    //   return false;
    // }

    var number = $('#tel').val();
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
      
      let param = "vericode="+vericode+"&areaCode="+$("#areaCode").val()+"&phone="+number
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
           alert('验证码已发送');
           countDown(60, $('.codebtn'));
          //获取失败
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
  if(!geetest){
    $('.codebtn').click(function(){
      if(!$(this).hasClass("disabled")){
        sendPhoneVerCode();
      }
    });
  }else{
    captchaVerifyFun.initCaptcha('web','#codeButton',sendPhoneVerCode)
    //获取验证码
    $('.codebtn').click(function(){
     if($(this).hasClass("disabled")) return;
       var number   = $('#tel').val();
       if (number == '') {
         alert(langData['siteConfig'][20][27]);   //请输入您的手机号
         return false;
       } else {
         if(isNaN(number)){
           alert(langData['siteConfig'][20][179]);  //账号错误
           return false;
         }else{
           ftype = "phone";
     }

         //弹出验证码
       if (geetest == 1) {
         captchaVerifyFun.config.captchaObjReg.verify();
       } else {
         $('#codeButton').click()
       }

       }
     });

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
  }
