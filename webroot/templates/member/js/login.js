$(function(){

	// 记住密码
	var remember = $('.rememberpsd');
	remember.click(function(){
		remember.toggleClass('checked');
	})
	// 更换验证码
	$('#vdimgck,.change').click(function(){
		var img = $('#vdimgck'),src = img.attr('src') + '?v=' + new Date().getTime();
		img.attr('src',src);
	})
	// 二维码登陆
	$('.ewmlogin').click(function(){
		$('.ewmlogin ,.saoma').toggleClass('open');
	})

	//切换短信登录
	$('.login-container li').bind('click', function(){
		var t = $(this), index = t.index();
		t.addClass('curr').siblings('li').removeClass('curr');
		$('.login-container .main .item:eq('+index+')').show().siblings('.item').hide();
	});


	var lgform = $('.loginform');

	lgform.find('.inp').focus(function(){
		$(this).closest('.inpbdr').addClass('focus');
	}).blur(function(){
		$(this).closest('.inpbdr').removeClass('focus');
	})

	// 提交
	var err = lgform.find('.error p');
	lgform.submit(function(e){
		e.preventDefault();
		err.text('').hide();

		var ltype = $('.login-container .tab .curr').index();
		var submit = $(".submit");

		//普通登录
		if(ltype == 0){

			var nameinp = $('.username'),
				name = nameinp.val(),
				psdinp = $('.password'),
				psd = psdinp.val(),
				vdimgckinp = $('.vdimgck'),
				vdimgck = vdimgckinp.val(),
				r = true;
			if(name == ''){
				err.text(langData['siteConfig'][20][541]).show();   //请填写登录帐号
				nameinp.focus();
				r = false;
			}
			if(r && psd == ''){
				err.text(langData['siteConfig'][20][542]).show();   //请填写登陆密码
				psdinp.focus();
				r = false;
			}
			if(r && vdimgckinp && vdimgck == "" && vdimgck != undefined){
				err.text(langData['siteConfig'][20][540]).show();   //请填写验证码
				vdimgckinp.focus();
				r = false;
			}

			if(r){

				submit.attr("disabled", true).val(langData['siteConfig'][2][5]+"...");  //登录中
				var data = [];
                data.push("rsaEncrypt=1");
				data.push("username="+rsaEncrypt(name));
				data.push("password="+rsaEncrypt(psd));
				if(vdimgck != undefined){
					data.push("vericode="+vdimgck);
				}

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
								setTimeout(function(){
									top.location.href = decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&');
								},200)
							}else if(data.indexOf("201") > -1){
								var data = data.split("|");
								err.text(data[1]).show();
								nameinp.focus();
								submit.attr("disabled", false).val(langData['siteConfig'][16][158]);   //重新登录

							}else if(data.indexOf("202") > -1){
								var data = data.split("|");
								err.text(data[1]).show();
								$('#vdimgck').click();
								vdimgckinp.focus();
								submit.attr("disabled", false).val(langData['siteConfig'][16][158]);   //重新登录

							}else{
								alert(langData['siteConfig'][21][3]);   //登录失败，请重试！
								$('#vdimgck').click();
								submit.attr("disabled", false).val(langData['siteConfig'][16][158]);   //重新登录
							}
						}else{
							alert(langData['siteConfig'][21][3]);  //登录失败，请重试！
							$('#vdimgck').click();
							submit.attr("disabled", false).val(langData['siteConfig'][16][158]);   //重新登录
						}
					},
					error: function(){
						alert(langData['siteConfig'][20][168]);   //网络错误，登录失败！
						$('#vdimgck').click();
						submit.attr("disabled", false).val(langData['siteConfig'][16][158]);   //重新登录
					}
				});
				return false;


			}

		//短信验证码登录
		}else{
			var areaCode = $(".areaCode i").text().replace('+', '');
			var phone = $("#phone").val();
			var code = $("#vercode").val();
			var loginUrl = "/include/ajax.php?service=member&action=smsLogin&rsaEncrypt=1&phone=" + rsaEncrypt(phone) + "&code=" + code + "&areaCode=" + areaCode;

			if(phone == ''){
				err.text(langData['siteConfig'][20][463]).show();   //请输入手机号码
				$("#phone").focus();
				return false;
			}

			if(areaCode == "86"){
	    		var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
		        if(!phoneReg.test(phone)){
					err.text(langData['siteConfig'][20][465]).show();   //手机号码格式不正确
    				$("#phone").focus();
    				return false;
		        }
	    	}

			if(code == ''){
				err.text(langData['siteConfig'][20][28]).show();   //请输入短信验证码
				$("#vercode").focus();
				return false;
			}

			submit.attr("disabled", true).val(langData['siteConfig'][2][5]+"...");   //登录中

			$.ajax({
				url: loginUrl,
				dataType: 'json',
				success: function (res) {
				if (res.state != 100) {
								err.text(res.info).show();
								submit.attr("disabled", false).val(langData['siteConfig'][16][158]);    //重新登录
				}else{
					top.location.href = decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&');
				}
				},
				error: function (res) {
							alert(langData['siteConfig'][20][168]);  //网络错误，登录失败！
							submit.attr("disabled", false).val(langData['siteConfig'][16][158]); //重新登录
				}
			})
		}

	})


	//国际区号获取
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
                        $('.areaCode').hide();
                        $('#phone').css({'padding-left':'0'});
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                   }
                   $('.areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
	//显示区号
	var w = $('.areaCode_wrap');
	$('.areaCode').bind('click', function(){
		if(w.is(':visible')){
			w.fadeOut(300)
		}else{
			w.fadeIn(300);
			return false;
		}
	});

	//选择区号
	$('.areaCode_wrap').delegate('li', 'click', function(){
		var t = $(this), code = t.attr('data-code');
		$('.areaCode i').html('+' + code);
	});

	$('body').bind('click', function(){
		w.fadeOut(300);
	});



	var sendSmsData = [];

  if(geetest){
	captchaVerifyFun.initCaptcha('web','#button',sendSmsFunc)
	$('.getCodes').bind("click", function () {
		if ($(this).hasClass('disabled')) return false;

		var tel = $("#phone").val();
		var areaCode = $(".areaCode i").text().replace('+', '');

		if (tel == '') {
			err.text(langData['siteConfig'][20][463]).show();  //'请输入手机号码'
			$("#phone").focus();
			return false;
		}

		if (areaCode == "86") {
			var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
			if (!phoneReg.test(tel)) {
				err.text(langData['siteConfig'][20][465]).show();   //手机号码格式不正确
				$("#phone").focus();
				return false;
			}
		}
		if(geetest == 1){
			captchaVerifyFun.config.captchaObjReg.verify();
		}else{
			$('#button').click()
		}
	})

  }else{
    $(".getCodes").bind("click", function (){
			if($(this).hasClass('disabled')) return false;

			var tel = $("#phone").val();
			var areaCode = $(".areaCode i").text().replace('+', '');

			if(tel == ''){
				err.text(langData['siteConfig'][20][463]).show();  //'请输入手机号码'
				$("#phone").focus();
				return false;
			}

			if(areaCode == "86"){
				var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
				if(!phoneReg.test(tel)){
					err.text(langData['siteConfig'][20][465]).show();   //手机号码格式不正确
					$("#phone").focus();
					return false;
				}
	    	}
			
			$("#vercode").focus();
			sendSmsFunc();
    })
  }

	//发送验证码
	function sendSmsFunc(captchaVerifyParam,callback){
		
		var tel = $("#phone").val();
		var areaCode = $(".areaCode i").text().replace('+', '');
		var sendSmsUrl = "/include/ajax.php?service=siteConfig&action=getPhoneVerify";
		sendSmsData = []
        sendSmsData.push('rsaEncrypt=1');
		sendSmsData.push('type=sms_login');
		sendSmsData.push('areaCode=' + areaCode);
		sendSmsData.push('phone=' + rsaEncrypt(tel));
		sendSmsData.push('terminal=mobile');
		let param = sendSmsData.join('&')
		if(captchaVerifyParam && geetest == 2){
			param = param + '&geetest_challenge=' + captchaVerifyParam
		}else if(geetest == 1 && captchaVerifyParam){
			param = param +  captchaVerifyParam
		}
		$.ajax({
			url: sendSmsUrl,
			data: param,
			type: 'POST',
			dataType: 'json',
			success: function (res) {
				if(callback){
					callback(res)
				}
				if (res.state == 101) {
					err.text(res.info).show();
				}else{
					err.text('').hide();
					countDown(60, $('.getCodes'));
				}
			}
		})
	}



	//倒计时
	function countDown(time, obj){
		obj.html(time+langData['siteConfig'][30][46]).addClass('disabled');   //秒后重发
		mtimer = setInterval(function(){
			obj.html((--time)+langData['siteConfig'][30][46]).addClass('disabled');   //秒后重发
			if(time <= 0) {
				clearInterval(mtimer);
				obj.html(langData['siteConfig'][6][55]).removeClass('disabled');   //重新发送
			}
		}, 1000);
	}

})
