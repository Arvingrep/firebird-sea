
if(tj_state == 1){
  setTimeout(function(){
    location.href = fenxiaoUrl;
  }, 1000)
}
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
                        $('.areChoose').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'"><span>'+list[i].name+'<span><em class="fn-right">+'+list[i].code+'</em></span></span></li>');
                   }
                   $('.areacodeList ul').append(phoneList.join(''));
                }else{
                   $('.areacodeList ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.areacodeList ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areChoose").click(function(){
        $(".areaC_box").animate({"bottom":"0"},300,"swing");
        $('.mask-code').addClass('show');
    })
    // 选中区号
    $('.areacodeList').delegate('li','click',function(){
        var t = $(this), txt = t.attr('data-code');
        t.addClass('achose').siblings('li').removeClass('achose');
        $(".areCs").text(txt);
        $("#areaCode").val(txt);

        $(".areaC_box").animate({"bottom":"-100%"},300,"swing");
        $('.mask-code').removeClass('show');
    })


    // 关闭弹出层
    $('.areaC_box .back, .mask-code').click(function(){
        $(".areaC_box").animate({"bottom":"-100%"},300,"swing");
        $('.mask-code').removeClass('show');
    })


    // 打开合伙人等级层
    $(".chooseLevel").click(function(){
        $(".popl_box").animate({"bottom":"0"},300,"swing");
        $('.mask-level').addClass('show');
    })

    // 选中区域
    $('.levelList').delegate('li','click',function(){
        var t = $(this), id = t.attr('data-id'),txt = t.text();
        t.addClass('achose').siblings('li').removeClass('achose');
        $("#levelname").val(txt);
        $("#level").val(id);
        $(".popl_box").animate({"bottom":"-100%"},300,"swing");
        $('.mask-level').removeClass('show');
        var tPrice = t.attr('data-price');
        $('.botPrice .priceAll strong').text(tPrice);
        $('.botPrice .fakeD p').text(txt);//费用
    })


    // 关闭弹出层
    $('.anum_box .back, .mask-level').click(function(){
        $(".popl_box").animate({"bottom":"-100%"},300,"swing");
        $('.mask-level').removeClass('show');
    })

var dataGeetest = "";
  var ftype = "phone";

    //发送验证码
  function sendPhoneVerCode(captchaVerifyParam,callback){
    var btn = $('.test_btn button');
    if(btn.filter(":visible").hasClass("disabled")) return;

    var vericode = "";
    // var vericode = $("#vdimgck").val();  //图形验证码
    // if(vericode == '' && !geetest){
    //   alert(langData['siteConfig'][20][170]);
    //   return false;
    // }

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
      var  param = "vericode="+vericode+"&areaCode="+$('#areaCode').val()+"&phone="+number;
      if(captchaVerifyParam && geetest == 2){
          param = param + '&geetest_challenge=' + captchaVerifyParam
        }else if(geetest == 1 && captchaVerifyParam){
          param = param +  captchaVerifyParam
        }
      $.ajax({
        url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=verify",
        data: param,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
          if(callback){
            callback(data)
          }
          //获取成功
          if(data && data.state == 100){
          //获取失败
           // alert(langData['siteConfig'][38][101]);//验证码已发送
            countDown(60, $('.getCodes'));
          }else{
            btn.removeClass("disabled");
            showErrAlert(data.info);
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
    obj.html(time+(langData['siteConfig'][44][1].replace('1',''))).addClass('disabled');
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
            alert(langData['siteConfig'][20][27]);
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
        alert(langData['siteConfig'][20][27]);
        return false;
      } else {
        if(isNaN(number)){
          alert(langData['siteConfig'][20][179]);
          return false;
        }else{
          ftype = "phone";
        }

       // 需要极验
       if (geetest ) {
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

$('.sub_btn').click(function(){
  var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;
  var t = $(this)
      ,phone = $('#contact').val()  //手机号
      ,vercode = $('#vercode').val()  //验证码
      ,cityname = $('#addr').val()  //分站
      ,level = $('#level').val()  //合伙人等级
      ;
  if(t.hasClass('disabled')) return;
  if(cityname == ''){
    showMsg(langData['siteConfig'][54][45]);//请选择分站
    return false;
  }
  if(level == '' && identify){
    showMsg(langData['siteConfig'][54][46]);//请选择合伙人等级
    return false;
  }
  if(phone == ''){
    showMsg(langData['siteConfig'][20][239]);
    return false;
  }
  if(vercode == '' && fenxiaoJoinCheckPhone == 0){
    showMsg(langData['siteConfig'][20][176]);
    return false;
  }
  t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

  $.ajax({
    url: action,
    type: 'post',
    data: form.serialize(),
    dataType: 'json',
    success: function(res){
        t.removeClass("disabled").html(langData['siteConfig'][54][44]);
      if(res && res.state == 100){
          if (typeof (res.info) == 'object') {
              sinfo = res.info;
              service = 'member';
              $('#ordernum').val(sinfo.ordernum);
              $('#action').val('pay');
              $('#pordertype').val('fenxiaoJoinPay');

              $('#pfinal').val('1');
              $("#amout").text(sinfo.order_amount);
              $('.payMask').show();
              $('.payPop').css('transform', 'translateY(0)');
              //
              // if (totalBalance * 1 < sinfo.order_amount * 1) {
              //
              //     $("#moneyinfo").text('余额不足，');
              //
              //     $('#balance').hide();
              // }
              if (totalBalance * 1 < sinfo.order_amount * 1) {

                  $("#moneyinfo").text('余额不足，');
                  $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

                  $('#balance').hide();
              }


              if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
                $("#bonusinfo").text('额度不足，');
                $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
              }else if( bonus * 1 < sinfo.order_amount * 1){
                $("#bonusinfo").text('余额不足，');
                $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
              }else{
                $("#bonusinfo").text('');
                $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
              }

              ordernum = sinfo.ordernum;
              order_amount = sinfo.order_amount;

              payCutDown('', sinfo.timeout, sinfo);
          }else {
              if(res.info.indexOf('http') > -1){
                  location.href = res.info;
              }else{
                  location.reload();
              }
          }


      }else{
        showMsg(res.info);
        t.removeClass("disabled").html(langData['siteConfig'][54][44]);
      }
    },
    error: function(){
      showMsg(langData['siteConfig'][20][183]);
      t.removeClass("disabled").html(langData['siteConfig'][54][44]);
    }
  })
})

// 错误提示
  function showMsg(str){
    var o = $(".error");
    o.html('<p>'+str+'</p>').show();
    setTimeout(function(){o.hide()},1000);
  }
