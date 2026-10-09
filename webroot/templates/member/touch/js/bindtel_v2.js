var device = navigator.userAgent;
var pageVue = new Vue({
	el : "#register_page",
	data:{
		areacode :areacode, //手机区号
		psdshow:false, // 密码可见
		loading :false,
		dataGeetest:'',
		showvcode :false,
	},
	mounted() {
		var t = this;
		// 极验相关
		if(geetest){
			t.$nextTick(() => {
				captchaVerifyFun.initCaptcha('h5','#codeButton',t.sendVerCode)
			})
		}
	},
	methods:{
		// 显示区号
		showAreacode:function(){
			$(".popl_mask").show();
			$('.popl_box').css({
				'transform':"translateY(-9rem)"
			})
		},

		// 隐藏区号
		hideAreaCode:function(){
			$(".popl_mask").hide();
			$('.popl_box').css({
				'transform':"translateY(0)"
			})
		},

		// 区号选择
		getAreaCode:function(){
			var li = event.currentTarget;
			var code = $(li).attr('data-code');
			this.areacode = code;
			this.hideAreaCode();
		},

		// 显示清除按钮
		showBtn:function(){
			var inp = event.currentTarget;
			var inp_val = $(inp).val();
			if(inp_val != ''){  //有值的时候显示清除按钮
				$(inp).next('.clearInp').removeClass('fn-hide');
			}else{
				$(inp).next('.clearInp').addClass('fn-hide');
			}
		},

		// 清除input的值
		clearInp:function(){
			var btn =  event.currentTarget;
			$(btn).siblings('input').val('');
			$(btn).addClass('fn-hide')
		},

		// 获取短信验证码
		getPhoneMsg:function(){
			var t = this;
			var btn =  event.currentTarget;
			var phone = $("#phone").val(),areacode = $("#codeChoose").val();
			if(phone == ''){
				showErrAlert(langData['siteConfig'][20][463]);//请输入手机号码
				return false;
			}else if(areacode == "86"){
				var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
				if(!phoneReg.test(phone)){
					showErrAlert(langData['siteConfig'][20][465]);   //手机号码格式不正确
					return false;
				}
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

			// 不需要极验
			if(!geetest){
				t.sendVerCode();
			}

		},
		// 极验
		handlerPopupReg:function(captchaObjReg){
			// 成功的回调
			var t = this;
			captchaObjReg.onSuccess(function () {
				var validate = captchaObjReg.getValidate();
				t.dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;
				t.sendVerCode();

			});
			captchaObjReg.onClose(function () {
			})

			window.captchaObjReg = captchaObjReg;
		},

		// 发送验证码
		sendVerCode :function(captchaVerifyParam,callback){
			var t = this;
			let btn = $(".getCode")
			btn.addClass('noclick');
			var param = '';

			var phone = $("#phone").val();
			var areacode = $("#codeChoose").val();
			param = "phone="+phone +"&areaCode="+areacode 
			if(captchaVerifyParam && geetest == 2){
				param = param + '&geetest_challenge=' + captchaVerifyParam
			  }else if(geetest == 1 && captchaVerifyParam){
				param = param +  captchaVerifyParam
			  }
			$.ajax({
				url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=signup&from=bind&code="+$('#code').val(),
				data: param,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(callback){
						callback(data)
					}
					//获取成功
					if(data && data.state == 100){
						t.countDown(60, btn);
						//获取失败
					}else{
						btn.removeClass("noclick").text(langData['siteConfig'][4][1]); //获取验证码
						showErrAlert(data.info);
					}
				},
				error: function(){
					btn.removeClass("noclick").text(langData['siteConfig'][4][1]); //获取验证码
					showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
				}
			});
		},

		// 倒计时
		countDown:function(time, obj, func){
			times = obj;
			obj.addClass("noclick").text(langData['siteConfig'][20][5].replace('1',time)); //1s后重新发送
			mtimer = setInterval(function(){
				obj.text(langData['siteConfig'][20][5].replace('1',(--time))); //1s后重新发送
				if(time <= 0) {
					clearInterval(mtimer);
					obj.removeClass('noclick').text(langData['siteConfig'][4][2]);  //重发验证码
				}
			}, 1000);
		},

		// 绑定手机号
		bind_by_tel:function(){
			var t = this;
			var btn = event.currentTarget;
			t.loading = true;
			$(btn).addClass('disabled')
			var vdimgck = $("#vercode"),tel = $("#phone").val();
			var areaCode = $("#codeChoose").val()
			if(tel == ''){
				t.loading = false;
				$(btn).removeClass("disabled");
				showErrAlert(langData['siteConfig'][20][463]);//请输入手机号码
				return false;
			}

			if(areaCode == "86"){
				var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
				if(!phoneReg.test(tel)){
					t.loading = false;
					$(btn).removeClass("disabled");
					showErrAlert(langData['siteConfig'][20][465]);   //手机号码格式不正确
					return false;
				}
			}

			if(vdimgck.val() == ""){
				t.loading = false;
				$(btn).removeClass("disabled");
				showErrAlert(langData['siteConfig'][20][28]);
				vdimgck.focus();
				return false;
			}
			var aid = connect_uid || $.cookie(cookiePre+"connect_uid");
			if(aid == undefined || aid == '' || aid == 0){
			  location.href = masterDomain;
			}
			var time = new Date().getTime();
			let param = new URLSearchParams();
			param.append('account', tel);
			param.append('bindMobile', aid);
			param.append('vcode', vdimgck.val());
			param.append('areaCode', areaCode);
			param.append('mtype',1);
			param.append('rtype', 3);
			param.append('code', $('#code').val());
			param.append('password',time.toString().substr(4,6));

            if(redirectUrl.indexOf('/pages/') > -1){
                param.append('path', redirectUrl);
            }

			axios({
				method: 'post',
				url: "/registerCheck_v1.html",
				data: param,
			})
			.then((response)=>{
				t.loading = false;
				$(btn).removeClass("disabled").text(langData['siteConfig'][6][118]);
				var data = response.data;
				if(data.indexOf("100") > -1){
					showErrAlert(langData['siteConfig'][21][250]);  //'成功绑定手机号'
					setTimeout(function(){
					    if(device.indexOf('huoniao') > -1){

							$("body").append('<div style="display:none;">' + data + '</div>');

							setupWebViewJavascriptBridge(function(bridge) {
								bridge.callHandler('appLoginFinish', {'passport': userinfo.passport, 'username': userinfo.username, 'nickname': userinfo.nickname, 'userid_encode': userinfo.userid_encode, 'cookiePre': userinfo.cookiePre, 'photo': userinfo.photo, 'dating_uid': userinfo.dating_uid, 'access_token': userinfo.access_token, 'refresh_token': userinfo.refresh_token}, function(){});
								// setTimeout(function(){
                                //     bridge.callHandler("goBack", {}, function(responseData){});
                                // }, 200);
                                
                                top.location.href = userDomain;
                                bridge.callHandler("goBack", {}, function(responseData){});

                                // if(device.indexOf('android') > -1){
                                //     top.location.href = userDomain;  //强制回到我的页面
                                // }else{
                                //     bridge.callHandler("goBack", {}, function(responseData){});
                                // }
								// bridge.callHandler('pageReload', {}, function(responseData){});
								// bridge.callHandler("goBack", {}, function(responseData){});
								// bridge.callHandler("goBack", {}, function(responseData){});
								// bridge.callHandler("pageClose", {}, function(responseData){});
							});
							
						}else{
                            var hrefData = data.split("|");
                            var href = hrefData[1];
		              		top.location.href = href && href != masterDomain ? href : (redirectUrl ? redirectUrl : userDomain);
						}
		            },2000)
				}else{
					var info = data.split("|");
					showErrAlert(info[1])
				}
			})
			.catch(error => {
				t.loading = false;
				showErrAlert(langData['siteConfig'][20][388])  //'请求出错，请稍后再试'
				$(btn).removeClass("disabled").text(langData['siteConfig'][6][118]);  //重新提交
			});
		},

	}
})
