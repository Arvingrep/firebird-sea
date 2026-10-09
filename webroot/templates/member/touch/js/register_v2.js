function getQueryVariable(variable)
{
   var query = window.location.search.substring(1);
   var vars = query.split("&");
   for (var i=0;i<vars.length;i++) {
           var pair = vars[i].split("=");
           if(pair[0] == variable){return pair[1];}
   }
   return(false);
}

var wxpath = getQueryVariable('path') || redirectUrl.indexOf('/pages/' == 0) && redirectUrl || '';
var redirectUrlPath = redirectUrl;
var pageVue = new Vue({
	el : "#register_page",
	data:{
		regType: regType, //注册方式 1--用户名注册  3---手机   2---邮箱注册
		areacode :areacode, //手机区号
		psdshow:false, // 密码可见
		noagree:consult=='0'?true:false, //不同意勾选协议
		loading :false,
		dataGeetest:'',
		showvcode :false,
		register_success:false,
		uid:null,
		path:wxpath,
		returnPath:'',
	},
	mounted(){
		var t = this;

		toggleDragRefresh('off');  //取消下拉刷新

		// 更改标题下划线的样式
		if($(".form_title .curr").size()>0){
			var left = $(".form_title .curr").offset().left + $(".form_title .curr").width()/2;
			$(".form_title s").css("left",left);
		}

		// 极验相关
		if(geetest){
			t.$nextTick(() => {
                captchaVerifyFun.initCaptcha('h5','#codeButton',t.sendVerCode)	
            })
		};


		// 页面回弹

		$("input,textarea").on("blur", function() {
	        window.scroll(0, 0);
	     });



		// 点击去逛逛
		$("#register_success_page .tip").click(function(){
			if(t.returnPath.indexOf('path') > -1){
				wx.miniProgram.redirectTo({url: '/pages/loginRedirect/index?url='+encodeURIComponent(t.returnPath).replace(/&amp;amp;/g, '&')});
			}else if(wx_miniprogram){
				wx.miniProgram.redirectTo({url: '/pages/redirect/index?url='+ decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&')+'&uid='+t.uid});
			}else{
				top.location.href = decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&');
			}
			return false;
		})
	},
	methods:{
		goBack(){
			//APP端后退、目前只有安卓端有此功能
		    var deviceUserAgent = navigator.userAgent;
		    if (deviceUserAgent.indexOf('huoniao') > -1) {
		    	setupWebViewJavascriptBridge(function(bridge) {
		    		event.preventDefault();
		       		bridge.callHandler("goBack", {}, function(responseData){});
		    	});
		    }
		},
		// 更改注册方式
		changeReg:function(){
			var t = this;
			var btn = event.currentTarget;
			$(btn).addClass('curr').siblings('span').removeClass('curr');
			var left = $(btn).offset().left + $(btn).width()/2;
			$(".form_title s").css({
				"left":left,
				'transition':'left .3s'
			});
		},

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
			if (geetest) {
				//弹出验证码
				if (geetest == 1) {
					captchaVerifyFun.config.captchaObjReg.verify();
				} else {
					$('#codeButton').click()
				}
			}

			// 不需要极验
			if(!geetest){
				if(t.showvcode && $("#vdimgck").val()!=''){
					t.sendVerCode();
				}else{
					t.sendVerCode();
				}
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
			let btn = $('.getCode')
			btn.addClass('noclick');
			var param = '';
			var action = t.regType==3 ? 'getPhoneVerify': (t.regType==2?'getEmailVerify':"")
			if(t.regType==3){
				var phone = $("#phone").val();
				var areacode = $("#codeChoose").val();
				param = "rsaEncrypt=1&phone="+rsaEncrypt(phone) +"&areaCode="+areacode + t.dataGeetest
			}else if(t.regType==2){
				var email = $("#email").val();
				param = "rsaEncrypt=1&email="+rsaEncrypt(email) + t.dataGeetest
			}

			if(captchaVerifyParam && geetest == 2){
                param = param + '&geetest_challenge=' + captchaVerifyParam
              }else if(geetest == 1 && captchaVerifyParam){
                param = param +  captchaVerifyParam
              }
			$.ajax({
				url: "/include/ajax.php?service=siteConfig&action="+action+"&type=signup",
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
						btn.removeClass("noclick").text(langData['siteConfig'][4][1]);
						showErrAlert(data.info);
					}
				},
				error: function(){
					btn.removeClass("noclick").text(langData['siteConfig'][4][1]);
					showErrAlert(langData['siteConfig'][20][173]);
				}
			});
		},

		// 倒计时
		countDown:function(time, obj, func){
			times = obj;
			obj.addClass("noclick").text(langData['siteConfig'][20][5].replace('1',time));  //1s后重新发送
			mtimer = setInterval(function(){
				obj.text(langData['siteConfig'][20][5].replace('1',(--time)));  //1s后重新发送
				if(time <= 0) {
					clearInterval(mtimer);
					obj.removeClass('noclick').text(langData['siteConfig'][4][2]);
				}
			}, 1000);
		},
		countDown2(time, obj, func){
			times = obj;

			mtimer2 = setInterval(function(){
				obj.find("em").text((--time));
				if(time <= 0) {
					clearInterval(mtimer2);
					$("#register_success_page .btn_link").click()
				}
			}, 1000);
		},
		// 获取邮箱验证码
		getEmailMsg:function(){
			var t = this;
			var btn =  event.currentTarget;
			var email = $("#email").val();
			if(email == ''){
				showErrAlert(langData['siteConfig'][20][497]);  //请输入邮箱账号
				return false;
			}else{
				var emReg = !!email.match(/^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/);
				if (!emReg) {
					showErrAlert(langData['siteConfig'][20][178])
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
				t.sendVerCode($('.getCode'));
			}
		},

		// 更改图片验证码
		change_vericode:function(){
			var img = event.currentTarget;
			var src = $(img).attr('src') + '?v=' + new Date().getTime();
			$(img).attr('src',src)
		},

		// 验证可登录
		checkform:function(){
			var form = $(event.currentTarget).closest(".formbox"),r = false;
			form.find('input').each(function(){
				var tt = $(this);
				if(tt.val() == ''){
					console.log(333)
					r = true;
					return false;
				}
			})

			if(r){
				form.find('.btn').addClass('error')
			}else{
				form.find('.btn').removeClass('error')
			}
		},

		// 隐藏勾选弹窗
		hidePop:function(){
			$(".pop_mask,.pop_agree").hide();
		},

		// 显示勾选弹窗
		showPop:function(){
			$(".pop_mask,.pop_agree").show();
		},

		// 点击弹出确定登录
		sureClick:function(){
			var t = this;
			t.noagree = false;
			t.hidePop();
			// this.login_by_psd();
			if(t.regType == 1){
				t.register_by_username('.btn_login')
			}else if(t.regType == 2){
				t.register_by_email('.btn_login')
			}else{
				t.register_by_tel('.btn_login')
			}
		},

		// 注册 -- 手机号
		register_by_tel:function(btn){
			var btn = btn?btn:event.currentTarget;
			var phone = $("#phone").val(),
				areacode = $("#codeChoose").val();
				if(areacode == 86){
					var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
						if(!phoneReg.test(phone)){
							showErrAlert(langData['siteConfig'][20][465]);   //手机号码格式不正确
							return false;
						}
				}
			this.submit_to(btn);
		},

		// 注册 -- 邮箱
		register_by_email:function(btn){
			var btn = btn?btn:event.currentTarget;
			var form = $(btn).closest('form');
			var account  = form.find('#email').val();
			if(account == ''){
				 showErrAlert(langData['siteConfig'][30][82]);//请填写正确邮箱
				 return false;
			}else if(!/^[a-z0-9]+([\+_\-\.]?[a-z0-9]+)*@([a-z0-9]+\.)+[a-z]{2,6}$/i.test(account)){
			  showErrAlert(langData['siteConfig'][20][511]);//邮箱格式错误！
			  return  false;
			}
			this.submit_to(btn);
		},

		// 注册 -- 用户名
		register_by_username:function(btn){
			var btn = btn?btn:event.currentTarget;
			var form = $(btn).closest('form');
			var account  = form.find('#username').val();
			var email = form.find("#email").val();
			var nickname = form.find("#nickname").val();
			var phone = form.find("#phone").val();
			areacode = $("#codeChoose").val();
			if(account == ''){
				showErrAlert(langData['siteConfig'][45][15]);//请输入用户名
				return false;
			  }else{
				if(!/^[a-zA-Z]{1}[0-9a-zA-Z_]{4,15}$/.test(account)){
				  showErrAlert(langData['siteConfig'][45][16]);//用户名格式：英文字母、数字、下划线以内的5-20个字！<br />并且只能以字母开头！
				  return false;
				}
			  }

			  if(nickname == ''){
				   showErrAlert(langData['siteConfig'][32][50]);//请输入您的真实姓名！
				   return false;
			  }

			  if(email == ''){
				  showErrAlert(langData['siteConfig'][20][31]);//请输入邮箱！
				  return  false;
			  }else if(email && !/^[a-z0-9]+([\+_\-\.]?[a-z0-9]+)*@([a-z0-9]+\.)+[a-z]{2,6}$/i.test(email)){
				  showErrAlert(langData['siteConfig'][20][511]);//邮箱格式错误！
				  return  false;
				}

				if(phone == ''){
				   showErrAlert(langData['siteConfig'][20][239]);//请输入您的真实姓名！
				   return false;
				}else if(phone && areacode == 86){
					var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
						if(!phoneReg.test(phone)){
							showErrAlert(langData['siteConfig'][20][465]);   //手机号码格式不正确
							return false;
						}
				}


			  this.submit_to(btn);
		},

		// 提交后台
		submit_to(btn){
			var t = this;
			var form = $(btn).closest('form');
			$(btn).addClass('disabled').text('注册中~');
			t.loading = true;
			let param = new URLSearchParams();
			var darr = form.serializeArray()
			darr.forEach(function(val){
                if(val.name == 'account' || val.name == 'password'){
                    param.append(val.name, rsaEncrypt(val.value));
                }else{
				    param.append(val.name, val.value);
                }
			})

            param.append('rsaEncrypt', 1);
			param.append('mtype', 1);
			param.append('rtype', t.regType);
			if(wxpath && wx_miniprogram){
				param.append('path', wxpath);
				param.append('wxMiniProgramLogin', 1);

			}

			axios({
				method: 'post',
				url: '/registerCheck_v1.html',
				data: param,
			})
			.then((response)=>{
				var data = response.data;
				var dataArr = data.split("|");
				var info = dataArr[1];
				t.loading = false;
				if(data.indexOf("100|") > -1){
					showErrAlert(langData['siteConfig'][55][16])  //注册成功
					t.register_success = true;
					var uid = $.cookie("HN_userid");
					if(uid){
						t.uid = uid;
					}
					t.returnPath = data.split('100|')[1]
					var deviceUserAgent = navigator.userAgent;
					if(deviceUserAgent.indexOf('huoniao') > -1){  //app端交互
						setupWebViewJavascriptBridge(function (bridge) {
							bridge.callHandler('appLoginFinish', {
									'passport': t.uid,
									
							}, function () {});
						});
					}
				}else{
					showErrAlert(info.replace(new RegExp('<br />','gm'),'\n'));
				}
				 
				
				$(btn).removeClass("disabled").text(langData['siteConfig'][6][118]);
			})
			.catch(error => {
				t.loading = false;
				showErrAlert(langData['siteConfig'][20][388]);  //'请求出错，请稍后再试'
				$(btn).removeClass("disabled").text(langData['siteConfig'][6][118]);
			});
		},

		goLink(){
			var t = this;
			if(wx_miniprogram && t.returnPath.indexOf('path') > -1){
				wx.miniProgram.redirectTo({url: '/pages/loginRedirect/index?url='+encodeURIComponent(t.returnPath).replace(/&amp;amp;/g, '&')});
			}else if(wx_miniprogram){
				if(redirectUrl.indexOf('/pages') == 0){
					wx.miniProgram.redirectTo({url: redirectUrl + (redirectUrl.indexOf('?') > - 1 ? "&" : "?") +'uid='+t.uid});
				}else{
					wx.miniProgram.redirectTo({url: '/pages/redirect/index?url='+ decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&')+'&uid='+t.uid});
				}
				
				
			}else{
				var deviceUserAgent = navigator.userAgent;
				if(deviceUserAgent.indexOf('huoniao') > -1){  //app端交互
					setupWebViewJavascriptBridge(function (bridge) {
						bridge.callHandler('appLoginFinish', {
								'passport': t.uid,
								
						}, function () {});
					});
				}else{
					top.location.href = decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&');
				}
			}
			return false;
		},





	},
	watch:{
		register_success(val){
			var t = this;
			// 点击去逛逛
			$("#register_success_page .tip").click(function(){
				
			})
			if(val){
				setTimeout(function(){
					t.countDown2(5, $("#register_success_page .tip"));
				},1000)
			}
		},

		// returnPath(val){
		// 	var tt = this;
		// 	if(val.indexOf('path') > -1){
		// 		wx.miniProgram.redirectTo({url: '/pages/loginRedirect/index?url='+encodeURIComponent(val).replace(/&amp;amp;/g, '&')});
		// 	}else if(wx_miniprogram){
		// 		wx.miniProgram.redirectTo({url: '/pages/redirect/index?url='+ decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&')+'&uid='+tt.uid});
		// 	}else{
		// 		top.location.href = decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&');
		// 	}
		// }
	}

})
