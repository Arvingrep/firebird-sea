$(function(){

  var errorMsg = '';

	//验证提示弹出层
	function showTipMsg(msg){
   /* 给出一个浮层弹出框,显示出errorMsg,2秒消失!*/
    /* 弹出层 */
	  $('.protips').html(msg);
		  var scrollTop=$(document).scrollTop();
		  var windowTop=$(window).height();
		  var xtop=windowTop/2+scrollTop;
		  $('.protips').css('display','block');
		  setTimeout(function(){      
			$('.protips').css('display','none');
		  },2000);
	}


	$('.time_txt_t p span').click(function(){
        var t = $(this);
        if(!t.find('i').hasClass('active')){
        	t.find('i').addClass('active');
        	t.siblings().find('i').removeClass('active');
        }
	});

  var sendSmsData = [];

  if(geetest){
    captchaVerifyFun.initCaptcha('h5','#codeButton',sendSmsFunc)
    $('.getCodes').bind("click", function (){
      if($(this).hasClass('disabled')) return false;
      var tel = $(".contact_phone").val();
      if(tel == ''){
        errMsg = "请输入手机号码";
        showTipMsg(errMsg);
        $(".contact_phone").focus();
        return false;
      }
      //弹出验证码
      if(geetest == 1){
        captchaVerifyFun.config.captchaObjReg.verify();
      }else{
          $('#codeButton').click()
      }
    })
  }else{
    $(".getCodes").bind("click", function (){
      if($(this).hasClass('disabled')) return false;
      var tel = $(".contact_phone").val();
      if(tel == ''){
        errMsg = "请输入手机号码";
        showTipMsg(errMsg);
        $(".contact_phone").focus();
        return false;
      }
      $("#vercode").focus();
      sendSmsFunc();
    })
  }

  //发送验证码
  function sendSmsFunc(captchaVerifyParam, callback){
    var tel = $(".contact_phone").val();
    var areaCode = $("#areaCode").val().replace('+', '');
    var sendSmsUrl = "/include/ajax.php?service=siteConfig&action=getPhoneVerify";

    sendSmsData = []
    sendSmsData.push('type=verify');
    sendSmsData.push('areaCode=' + areaCode);
    sendSmsData.push('phone=' + tel);
    let param = sendSmsData.join('&')
    if (captchaVerifyParam && geetest == 2) {
        param = param + '&geetest_challenge=' + captchaVerifyParam
    } else if (geetest == 1 && captchaVerifyParam) {
        param = param + captchaVerifyParam
    }
    $('.senderror').text('');
    $.ajax({
      url: sendSmsUrl,
      data:param,
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        if (callback) {
            callback(res)
        }
        if (res.state == 101) {
          $('.senderror').text(res.info);
        }else{
          countDown($('.getCodes'), 60);
        }
      }
    })
  }

	//倒计时
  function countDown(obj,time){
    obj.html(time+'s').addClass('disabled');
    mtimer = setInterval(function(){
      obj.html((--time)+'s').addClass('disabled');
      if(time <= 0) {
        clearInterval(mtimer);
        obj.html('重新发送').removeClass('disabled');
      }
    }, 1000);
  }
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
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        console.log(txt)
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code, #popupReg-captcha-mobile').hide();
        $('.mask-code').removeClass('show');
    })

	// 提交验证
	$('.btn button').click(function(){
    var t = $(this);
    if(t.hasClass('disabled')) return;

		var contact_name = $('.contact_name').val();
		var contact_phone = $('.contact_phone').val();
		var contact_yzm = $('.contact_yzm').val();

    errorMsg = '';

		if(!contact_name){
			errorMsg="请输入您的姓名";
	        showTipMsg(errorMsg);
		}else if(!contact_phone){
			errorMsg="请输入您的手机号码";
	        showTipMsg(errorMsg);
		}else if(contact_phone.length !== 11){
			errorMsg="请输入正确的手机号";
	        showTipMsg(errorMsg);
    } else if(!userinfo.phoneCheck){

  		if(!contact_yzm){
  			errorMsg="请输入验证码";
        showTipMsg(errorMsg);
  		}
    }

    if(errorMsg) return;

    var data = [];

    data.push('type='+type);
    data.push('aid='+id);
    // data.push('title='+title);
    data.push('day='+$('.time_txt_t').eq(0).find('.active').parent().index() - 1);
    data.push('time='+$('.time_txt_t').eq(0).find('.active').parent().index() - 1);
    data.push('note='+$('#note').val());
    data.push('username='+$('.contact_name').val());
    data.push('mobile='+$('.contact_phone').val());
    data.push('areaCode='+$('#areaCode').val());
    data.push('vercode='+$('.contact_yzm').val());
    // data.push('sex='+$('[name="sex"]:checked').val());

    t.addClass("disabled").val("提交中...");

    $.ajax({
      url: masterDomain + '/include/ajax.php?service=house&action=bookHouse',
      type: 'get',
      data: data.join('&'),
      dataType: 'jsonp',
      success: function(data){
        if(data && data.state == 100){
          showTipMsg(data.info);
          setTimeout(function(){
            // if(device.indexOf('huoniao') > -1) {
            //     setupWebViewJavascriptBridge(function (bridge) {
            //         bridge.callHandler("goBack", {}, function (responseData) {
            //         });
            //     });
            // }else{
            //     window.location.href = document.referrer;
            // }
            history.go(-1);
            t.removeClass('disabled').val('立即预约');
          }, 2000)
        }else{
          showTipMsg(data.info);
          t.removeClass('disabled').val('立即预约');
        }
      },
      error: function(){
        showTipMsg('网络错误，请重试！');
        t.removeClass('disabled').val('立即预约');
      }
    })
	});








})