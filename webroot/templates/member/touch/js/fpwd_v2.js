var pageVue = new Vue({
	el : "#fpwd_page",
	data:{
		regType: 3, //注册方式 1--用户名注册  3---手机   2---邮箱注册
		areacode :areacode, //手机区号
		psdshow:false, // 密码可见
		loading :false,
		phoneCheck:phoneCheck, //手机验证
		emailCheck:emailCheck, //邮箱验证
		showtype:((phoneCheck && emailCheck)|| (!phoneCheck && !emailCheck))?1:(emailCheck?0:1), //邮箱验证显示
		showvcode:false,
		dataGeetest:'',
	},
	mounted() {
		var t = this;

		toggleDragRefresh('off');  //取消下拉刷新

		// 极验相关
		if(geetest){
			t.$nextTick(() => {
                captchaVerifyFun.initCaptcha('h5','#codeButton',t.sendVerCode)	
            })
		}
	},
	methods:{
		// 获取短信验证码
		getPhoneMsg:function(){
			var t = this;
			var btn =  event.currentTarget;
			var phone = $("#phone").val(),areacode = t.areacode;
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
				if(!t.showvcode){
					t.showvcode = true;
				}

				if(t.showvcode && $("#vdimgck").val()!=''){
					t.sendVerCode();
				}else{
					showErrAlert(langData['siteConfig'][20][176]); //'请输入验证码'
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
			let btn = $('.phonecode .getCode')
			btn.addClass('noclick');
			var param = '';
			var action = t.showtype ? 'getPhoneVerify':'getEmailVerify'
			if(t.showtype){
				var phone = $("#phone").val();
				var areacode = $("#codeChoose").val();
				param = "rsaEncrypt=1&phone="+rsaEncrypt(phone) +"&areaCode="+areacode + t.dataGeetest
			}else{
				var email = $("#email").val();
				param = "rsaEncrypt=1&email="+rsaEncrypt(email) + t.dataGeetest
			}
			param = param + "&vericode=" + $("#vdimgck").val()
			if(captchaVerifyParam && geetest == 2){
                param = param + '&geetest_challenge=' + captchaVerifyParam
              }else if(geetest == 1 && captchaVerifyParam){
                param = param +  captchaVerifyParam
              }
			$.ajax({
				url: "/include/ajax.php?service=siteConfig&action="+action+"&type=fpwd",
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
			obj.addClass("noclick").text(langData['siteConfig'][20][5].replace('1',time)); //1s后重新发送
			mtimer = setInterval(function(){
				obj.text(langData['siteConfig'][20][5].replace('1',(--time))); //1s后重新发送
				if(time <= 0) {
					clearInterval(mtimer);
					obj.removeClass('noclick').text(langData['siteConfig'][4][2]);   //重发验证码
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
					showErrAlert(langData['siteConfig'][20][178]);  //提交失败，请重试！
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

				if(!t.showvcode){
					t.showvcode = true;
				}

				if(t.showvcode && $("#vdimgck").val()!=''){
					t.sendVerCode($('.phonecode .getCode'));
				}else{
					showErrAlert(langData['siteConfig'][20][176]);    //'请输入验证码'
				}
			}
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

		// 修改图片验证码
		change_vdimgck:function(){
			var t = this;
			var el = event.currentTarget;
			var src = $(el).attr('src') + '?v=' + new Date().getTime();
			$(el).attr('src',src)
		},

		// 修改密码 -- 手机验证码
		change_by_phone:function(){
			var t = this;
			var btn = $(event.currentTarget)
			var type = 2;  //手机验证码修改时，type=2
			var number = $('#phone').val();  //手机号
			var emVal = $('#email').val();  //邮箱号

			if (number == '') {
			   showErrAlert(langData['siteConfig'][20][27]);  //请输入您的手机号
			   return false;
			}

			 var yzm = $("#vercode").val();
			 if(yzm == ''){
			   showErrAlert(langData['siteConfig'][20][28]);  //请输入短信验证码
			   return false;
			 }

			 let param = new URLSearchParams();
			 param.append('type', 2);   //类型
             param.append('rsaEncrypt', 1);
			 param.append('phone', rsaEncrypt(number));  //手机
			 param.append('areaCode',  t.areacode);  //区号
			 param.append('vdimgck',  yzm);  //短信验证码
			 if(!geetest){
				var vdimg = $('#vdimgck').val()
			 }
			 param.append('vericode',  $('#vdimgck').val()); //图片验证码
			 t.reset_npwd(param,btn)

		},


		// 修改密码 -- 邮箱验证码
		change_by_email:function(){
			var t = this;
			var btn = $(event.currentTarget)
			var type = 1;  //手机验证码修改时，type=2
			var emVal = $('#email').val();  //邮箱号
			if (emVal == '') {
			  showErrAlert(langData['siteConfig'][20][31]);
			  return false;
			} else {
			  var emReg = !!emVal.match(/^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/);
			  if (!emReg) {
				showErrAlert(langData['siteConfig'][20][178]);   //请输入正确的邮箱
				return false;
			  }
			}
			var yzm = $("#vercode").val();
			if(yzm == ''){
			  showErrAlert(langData['siteConfig'][21][236]);  //请输入短信验证码
			  return false;
			}
			let param = new URLSearchParams();
            param.append('rsaEncrypt', 1);
			param.append('type', 1);
			param.append('email', rsaEncrypt(emVal));
			param.append('vdimgck', yzm);
			if(!geetest){
			   var vdimg = $('#vdimgck').val()
			}
			param.append('vericode',  $('#vdimgck').val()); //图片验证码
			// param.append('isend', 1);

			t.reset_npwd(param,btn)
		},

		// 修改密码
		reset_npwd:function(dataList,btn){
			var t = this;
			var psd = dataList.get('type') == 2 ? $("#password").val() : $("#password_email").val();
			if(psd == ''){
				showErrAlert(langData['siteConfig'][20][84]); // 请输入新密码
				return false;
			}

			t.loading = true;
			btn.addClass('disabled')
			axios({
				method: 'post',
				url: '/include/ajax.php?service=member&action=backpassword',
				data: dataList,
			})
			.then((response)=>{
				 var data = response.data;
				 if(data.state == 100){
					 var info = data.info.split('data=')[1];

					 let param2 = new URLSearchParams();
                     param2.append('rsaEncrypt', 1);
					 param2.append('data', info);
					 param2.append('npwd', rsaEncrypt(psd));

					 axios({
					 	method: 'post',
					 	url: '/include/ajax.php?service=member&action=resetpwd',
					 	data: param2,
					 })
					 .then((response)=>{
						var d = response.data;
						t.loading = false;
						btn.removeClass('disabled')
						if(d.state == 100){
							showErrAlert(d.info);
							setTimeout(function(){
							  location.href = userDomain;
						    }, 2000);
						}else{
							showErrAlert(d.info)
						}
					 })
					 .catch(error => {
						t.loading = false;
						btn.removeClass('disabled')
					 	showErrAlert(langData['siteConfig'][20][388]);   //'请求出错，请稍后再试'
					 });
				 }else{
					 showErrAlert(data.info);
					 t.loading = false;
					 btn.removeClass('disabled')
				 }
			})
		}

	}
});
