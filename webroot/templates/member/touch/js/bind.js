$(function(){
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

  var aid = $.cookie(cookiePre+"connect_uid");
  if(aid == undefined || aid == '' || aid == 0){
    location.href = masterDomain;
  }

  var regType = 'mobile';
  var dataGeetest = "";
  var djs = $('#djs em');

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
    var tel = $('#tel'), yzm = $('#yzm'), password = $('#password');
    if (tel.val() != "") {
      $('.step1 .submit').removeClass('disabled');
    }else {
      $('.step1 .submit').addClass('disabled');
    }
    if (yzm.val() != "" && password.val() != "") {
      $('.step2 .submit').removeClass('disabled');
    }else {
      $('.step2 .submit').addClass('disabled');
    }
  })

  // 去掉手机号前的0
  $('#tel').blur(function(){
    var username3 = $('#tel').val();
    $('#tel').val(username3.replace(/\b(0+)/gi,""));
  })


  // 更新验证码
  $(".vdimgck img").click(function(){
    var img = $(this), src = img.attr('src') + '?v=' + new Date().getTime();
    img.attr('src',src);
  })

  //发送验证码
  function sendVerCode(){
    var btn = $('.get-yzm');
    if(btn.hasClass("disabled")) return;

    var number = $('#tel').val();
    if (number == '') {
      alert(langData['siteConfig'][20][239]);
      return false;
    }else{

        var action = "getPhoneVerify";
        var dataName = "phone";
        var areaCode = $("#areaCode").text().replace("+","");

        btn.addClass("disabled");

        $.ajax({
          url: masterDomain+"/include/ajax.php?service=siteConfig&action="+action+"&type=signup&from=bind&code="+$('#code').val(),
          data: "areaCode="+areaCode+"&"+dataName+"="+number+dataGeetest,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {

            $("#maskReg, #popupReg-captcha-mobile").removeClass("show");

            //获取成功
            if(data && data.state == 100){
              $(".jsphone").text(number);
              $('.step').removeClass('hide').addClass('show');
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
      });

      window.captchaObjReg = captchaObjReg;
    };

    //获取验证码
    $('.get-yzm').click(function(e){
      e.preventDefault();
      var t = $(this);
      if(t.hasClass("disabled")) return;

      registAccountCheck(function(){
        if (captchaObjReg) {
          captchaObjReg.verify();
        }
      })

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
    $('.get-yzm').click(function(){
      registAccountCheck(function(){
        sendVerCode();
      })
    });
  }

  // 弹出层
  $('.account dt').click(function(){
    $('.layer').show();
    $('.mask-code').addClass('show');
  })

  // 关闭弹出层
  $('.layer_close, .mask-code').click(function(){
    $('.layer, #popupReg-captcha-mobile').hide();
    $('.mask-code').removeClass('show');
  })
  $("#maskReg").click(function () {
      $("#maskReg, #popupReg-captcha-mobile").removeClass("show");
  });

  $('.layer').delegate('li', 'click', function(){
    var t = $(this), txt = t.find('em').text();
    $('#areaCode').text(txt);
    $('.layer').hide();
    $('.mask-code').removeClass('show');
  })

  // var times = null;
  // 第一步的下一步
  /*$('.submit').click(function(){
    event.preventDefault();

    var t = $(this), step = t.closest('.step');
    if(t.hasClass('disabled')){return;};

    $('.step').removeClass('hide').addClass('show');
    if (step.hasClass('step1') && times == null) {
      countDown(60,djs);
    };

  })*/

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

  // 重新发送验证码
  /*$('#djs').click(function(){
    var t = $(this);
    if (!t.hasClass('disabled')) {
      t.addClass('disabled');
      countDown(60,djs);
    }
  })*/

  // 提交
  $("#regForm").submit(function(event){
    event.preventDefault();
    $('#step2_btn').click();
  });

  $('#step2_btn').click(function(){
    var t = $(this);
    if(t.hasClass('disabled')){return;};


    var btn      = t;
    var number   = $('#tel').val();
    var yzm      = $('#yzm').val();
    var areaCode = $('#areaCode').text().replace("+", "");

    if(number == ''){
      alert(langData['siteConfig'][20][239]);
      return false;
    }

    if(yzm == ''){
      alert(langData['siteConfig'][20][176]);
      return false;
    }

    btn.attr("disabled", true).val(langData['siteConfig'][1][7]+'...');

    var mtype = 1;
    var time = new Date().getTime();
    var data = [];
    data.push('mtype='+mtype);
    data.push('rtype=3');
    data.push('bindMobile='+aid);
    data.push('account='+number);
    data.push('areaCode='+areaCode);
    data.push('vcode='+yzm);
    data.push('code='+$('#code').val());
    data.push('password='+time.toString().substr(4,6));

    //异步提交
    $.ajax({
      url: masterDomain+"/registerCheck_v1.html",
      data: data.join("&"),
      type: "POST",
      dataType: "html",
      success: function (data) {
        if(data){
          if(data.indexOf("100") > -1){
            $("body").append('<div style="display:none;">'+data+'</div>');
            $('.success-pop').show();
            $('.mask').addClass('show');
            setTimeout(function(){
              top.location.href = userDomain;
            },2000)
          }else{
            var data = data.split("|");
            alert(data[1]);
            btn.removeAttr("disabled").val(langData['siteConfig'][1][0]);
          }
        }else{
          alert(langData['siteConfig'][20][174]);
          btn.removeAttr("disabled").val(langData['siteConfig'][1][0]);
        }
      },
      error: function(){
        alert(langData['siteConfig'][20][175]);
        btn.removeAttr("disabled").val(langData['siteConfig'][1][0]);
      }
    });

  })

  //返回
  $('step2 .back').click(function(){
    $('.step2').addClass('hide');
    $('.step').removeClass('show');
    $('#tel').val('');
  })



  //倒计时（开始时间、结束时间、显示容器）
  var times = null;
  var countDown = function(time, obj, func){
    times = obj;
    obj.addClass("disabled").text(time+'s');
    mtimer = setInterval(function(){
      obj.text((--time)+'s');
      if(time <= 0) {
        clearInterval(mtimer);
        obj.text('');
        $('#djs').removeClass('disabled').text(langData['siteConfig'][4][2]);
      }
    }, 1000);
  }



  // 极验或发送验证码之前验证手机号是否可注册
  function registAccountCheck(callback){
    var account = $('#tel').val(), type = 3;
    var data = '';
    if(type == 3){
      var areaCode = $("#areaCode").text().replace('+','');
      if(areaCode == "86"){
        var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;  
        if(!phoneReg.test(account)){
          alert(langData['siteConfig'][20][465]);
          return;
        }
      }
      data = '&areaCode=' + areaCode;
    }

    $.ajax({
      url: '/include/ajax.php?service=member&action=registAccountCheck&rtype='+type+'&account='+account+data+"&from=bind&code="+$("#code").val(),
      type: 'get',
      dataType: 'json',
      success: function(data){
        if(data && data.state == 100){
          callback();
        }else{
          if(data.info.indexOf('   ') > -1){
            $('.phone_msg .info').html(data.info);
            $('.phone_msg').removeClass('fn-hide');
          }else{
            alert(data.info);
          }
        }
      },
      error: function(){
        callback();
      }
    })
  }

  // 关闭手机号已注册的提示弹框
  $('.phone_msg .close').click(function(){
    $('.phone_msg').addClass('fn-hide');
  })


})
