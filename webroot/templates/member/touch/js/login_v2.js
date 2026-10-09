
var device = navigator.userAgent;
var isBytemini = device.toLowerCase().includes("toutiaomicroapp");
var times = null;

var url = window.location.href;
// console.log(url)


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

//如果在小程序端并且页面来源不是小程序
var needJumpWxmini = 0;
if(isWxMiniprogram && getQueryVariable('from') != 'wxmini'){
    needJumpWxmini = 1;
}

var path = getQueryVariable('path');  //小程序跳转路径
var wxMiniProgramLogin = getQueryVariable('wxMiniProgramLogin');  //小程序
var pageVue = new Vue({
	el : "#login_page",
	data:{
		psdshow:false, // 密码可见
		codeLogin : false,  //验证码登录
		noagree:consult=='0'?true:false, //不同意勾选协议
		areacode:areacode,  //区号
		appSign:[],
		isapp:0,
		loading:false,  //loading是否显示
		dataGeetest:"",  //极验
		qqMiniprogram:false,
	},
	created() {
		var t = this;
		toggleDragRefresh('off');  //取消下拉刷新

		// 获取用户app信息
		setTimeout(function(){
			setupWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler("getAppInfo", {}, function(responseData){
					t.isapp = 1;
					var data = JSON.parse(responseData);
					if(data.device && data.title && data.serial){
						t.appSign.push('deviceTitle='+data.title);
						t.appSign.push('deviceType='+data.device);
						t.appSign.push('deviceSerial='+data.serial);
					}
				});
			  });
		},500)


		if(hn_getCookie('nologin')){
			var now = new Date();
			var sec = now.valueOf();
			var end = hn_getCookie('nologin')
			if(end > sec){
				t.countTime(end - sec)
			}
		}


		// t.setCookie('HN_connect_uid',15617,4);
		// t.setCookie('HN_connect_code','wechat',4)
	},
	mounted() {
		var t = this;
        if(needJumpWxmini && cfg_useWxMiniProgramLogin){
            wx.miniProgram.redirectTo({ url: '/pages/login/index?path=' + redirectUrl + '&back=1&fromShare=' + $.cookie('HN_fromShare') });

            setTimeout(function(){
                $('#login_page').removeClass('fn-hide');
            }, 1500);
            return false;
        }else{
            $('#login_page').removeClass('fn-hide');
        }
		$('.other_login .alipay').hide();
      
		//小程序不显示其他快捷登录
		if(window.__wxjs_environment == 'miniprogram'){
			$('.other_login li').hide();
			$('.other_login .wechat').show();
			setTimeout(function(){
			  $('.othertype').show().addClass('single_login');
              if($('.other_login .wechat').size() == 0){
                $('.othertype').hide();
              }
			}, 500);
		}
		var isqq = device.toLowerCase().indexOf('qq') > -1 && device.toLowerCase().indexOf('miniprogram')>-1 ; //qq小程序
		if(isqq){

			t.qqMiniprogram = true;
			$('.other_login li').hide();
			$('.other_login .qq').show();
			setTimeout(function(){
			  $('.othertype').show().addClass('qq_login');
			}, 500);

		}else{
			var isbaidu = device.indexOf('swan-baiduboxapp') > -1 ; //百度小程序
			if(!isbaidu ){
			  $('.othertype').show();
			}else{
			  $('.othertype').hide();
			}
		}

		//支付宝登录只在APP端或者支付宝APP中显示
		if(device.indexOf('huoniao') > -1 || device.toLowerCase().indexOf('alipayclient') > -1){
			$('.other_login .alipay').show();
		}

		geetest && captchaVerifyFun.initCaptcha('h5','#codeButton',t.sendVerCode)

		

		// 页面回弹

		$("input,textarea").on("blur", function() {
	        window.scroll(0, 0);
	     });


		//客户端登录
		$(".other_login a").bind("click", function(e){
		  var el = e.currentTarget;
		  if($(el).closest('.wechat').length && !navigator.userAgent.toLowerCase().match(/micromessenger/) && navigator.userAgent.toLowerCase().match(/iphone|android/) && device.indexOf('huoniao') <= -1){
				return false
		   }
		  if(t.noagree && !$(el).hasClass('oneKeyLogin')){
				$(el).closest('li').addClass('nowClick').siblings('li').removeClass('nowClick');
				t.showPop();
				$(".pop_agree").addClass('fastLogin');
				return false;
		  }
		  if(device.indexOf('huoniao') > -1 && !$(this).hasClass('oneKeyLogin')){
			var btn = $(this), href = btn.attr('href'), type = href.split("type=")[1];
			e.preventDefault();

			setupWebViewJavascriptBridge(function(bridge) {

					var action = "", loginData = {};

					//QQ登录
					if(type == "qq"){
						action = "qq";
					}

					//微信登录
					if(type == "wechat"){
						action = "wechat";
					}

					//新浪微博登录
					if(type == "sina"){
						action = "sina";
					}

					//支付宝登录
					if(type == "alipay"){
						action = "alipay";
						loginData = alipay_app_login;
					}

					//Facebook登录
					if(type == "facebook"){
						action = "facebook";
					}


					bridge.callHandler(action+"Login", loginData, function(responseData) {
						if(responseData){

							var data = JSON.parse(responseData);
							var access_token = data.access_token ? data.access_token : data.accessToken, openid = data.openid, unionid = data.unionid;

							var param = "type="+action+"&action=appback&access_token="+access_token+"&openid="+openid+"&unionid="+unionid+"&"+(t.appSign.join("&"));
							if(action == 'facebook'){
								param = "type="+action+"&action=appback&uid="+data.uid+"&iconurl="+encodeURIComponent(data.iconurl)+"&name="+data.name+"&"+(t.appSign.join("&"));
							}

							$('.psdlogin .btn_login,.psdlogin .toagree').addClass('disabled').text(langData['siteConfig'][2][5]+'...');

							//异步提交
							$.ajax({
								url: "/api/login.php",
								data: param,
								type: "GET",
								dataType: "text",
								success: function (data) {

									//绑定手机
									if(data == 'bindMobile'){
										location.href = masterDomain + '/bindMobile.html?type=' + action;
										return false;
									}

									//登录成功
									if (data.indexOf("userinfo") > -1) {
										$("body").append('<div style="display:none;">' + data + '</div>');

										bridge.callHandler('appLoginFinish', {'passport': userinfo.userid, 'username': userinfo.username, 'nickname': userinfo.nickname, 'userid_encode': userinfo.userid_encode, 'cookiePre': userinfo.cookiePre, 'photo': userinfo.photo, 'dating_uid': userinfo.dating_uid}, function(){});
										bridge.callHandler('pageReload', {}, function(responseData){});
										setTimeout(function(){
										  bridge.callHandler("goBack", {}, function(responseData){});
										}, 200);
										return false;
									}

									$.ajax({
										url: '/getUserInfo.html',
										type: "get",
										async: false,
										dataType: "jsonp",
										success: function (data) {
											if(data){
												bridge.callHandler('appLoginFinish', {'passport': data.userid, 'username': data.username, 'nickname': data.nickname, 'userid_encode': data.userid_encode, 'cookiePre': data.cookiePre, 'photo': data.photo, 'dating_uid': data.dating_uid}, function(){});
												bridge.callHandler('pageReload', {}, function(responseData){});
												setTimeout(function(){
												  bridge.callHandler("goBack", {}, function(responseData){});
												}, 200);
											}else{
												showErrAlert(langData['siteConfig'][20][167]);
												$('.psdlogin .btn_login,.psdlogin .toagree').removeClass('disabled').text(langData['siteConfig'][2][0]);
											}
										},
										error: function(){
											showErrAlert('Error');
											$('.psdlogin .btn_login,.psdlogin .toagree').removeClass('disabled').text(langData['siteConfig'][2][0]);
										}
									});

								},
								error: function(){
									showErrAlert(langData['siteConfig'][20][168]);
									$('.psdlogin .btn_login,.psdlogin .toagree').removeClass('disabled').text(langData['siteConfig'][2][0]);
								}
							});
						}
					});
				});
			return false;
		  }


		  if(qq_miniprogram){
			event.preventDefault();
			qq.miniProgram.navigateTo({url: '/pages/login/index?url=' + encodeURIComponent(decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&'))});
			return false;
		  }


		});


		if((device.indexOf('huoniao') > -1 || device.indexOf('Alipay') > -1) && alipay_app_login != false){
		  $('.alipay').show();
		}


		  //微信登录验证
		$(".wechat").click(function(e){
			if(!navigator.userAgent.toLowerCase().match(/micromessenger/) && navigator.userAgent.toLowerCase().match(/iphone|android/) && device.indexOf('huoniao') <= -1){
				e.preventDefault();
				alert(langData['siteConfig'][20][169]);
				return false;
			}
		});

	},
	methods:{
		// 一键登录
		oneKeyLogin:function(){
			setupWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler("oneKeyLogin", {}, function(responseData){});
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

		// 隐藏勾选弹窗
		hidePop:function(){
			$(".pop_agree").removeClass('fastLogin');
			$(".pop_mask,.pop_agree").hide();
		},

		// 显示勾选弹窗
		showPop:function(){
			$(".pop_mask,.pop_agree").show();
		},

		// 点击弹出确定登录
		sureClick:function(){
			var tt = this
			tt.noagree = false;
			var el = event.currentTarget;
			if($(el).closest('.fastLogin').length > 0){
				$('.nowClick a').click();
				tt.hidePop();
				return false;
			}
			tt.hidePop();

			//验证码登录
			if(this.codeLogin){
				this.lohin_by_msg('.codelogin .toagree');

			//用户名密码登录
			}else{
				this.login_by_psd('.psdlogin .toagree');
			}
		},

		// 普通方式登录
		login_by_psd:function(btn){
			var t = this;
			var btn = btn ? btn : event.currentTarget;
			var account = $("#account").val();  //账号
			var password = $("#password").val();  //密码
			if(account == ""){
				showErrAlert(langData['siteConfig'][20][166]); //请输入手机/邮箱
				return false;
			}else if(password == ''){
				showErrAlert(langData['siteConfig'][20][165]); //请输入密码
				return false;
			}

			let param = new URLSearchParams();
            param.append('rsaEncrypt', 1);
			param.append('username', rsaEncrypt(account));
			param.append('password', rsaEncrypt(password));
			// 从小程序过来的
			if(path){
				param.append('path', path);
				param.append('wxMiniProgramLogin', wxMiniProgramLogin);
			}
			param = param.toString();
			if(t.appSign.length > 0){
				param += ('&' + t.appSign.join("&"));
			}

			$(btn).addClass('disabled').text(langData['siteConfig'][55][9]);  //登陆中~
			t.loading = true;
			axios({
				method: 'post',
				url: '/loginCheck.html',
				data: param,
			})
			.then((response)=>{
				var data = response.data;
				t.loading = false;
				if(data.indexOf('100') < 0){
					// 登录失败
					$(btn).removeClass('disabled').text(langData['siteConfig'][2][0]); //恢复按钮可点
					$('.btn_login').removeClass('disabled').text(langData['siteConfig'][2][0]); //恢复按钮可点
					var info = data.split('|')[1];
						if(data.split('|').length > 2){
							var time = 4;
							var nowDate = new Date();
							nowDates = nowDate.valueOf();
							endDates = nowDate.valueOf() + time * 60 * 1000; //截止时间
							t.setCookie('nologin',endDates,time)
						}else{
							showErrAlert(info);
						}

				}else{
					$("body").append('<div style="display:none;">' + data + '</div>');
					if (device.indexOf('huoniao') <= -1 && !t.isapp) {
						if(userinfo && userinfo.url && (userinfo.url.indexOf('wxMiniProgramLogin') > -1||userinfo.url.indexOf('byteMiniProgramLogin') > -1)){
							if(userinfo.url.indexOf('path') > -1){

                                // 小程序
                                // wx.miniProgram.redirectTo({ url: '/pages/loginRedirect/index?url=' + encodeURIComponent(userinfo.url).replace(/&amp;amp;/g, '&').replace(/&amp;/g, '&') });
                                let arr=userinfo.url.split('&');
                                let info={};
                                for(let i=0;i<arr.length;i++){
                                    let newArr=arr[i].split('=');
                                    info[newArr[0]]=newArr[1];
                                };
                                let paramUrl =  `access_token=${info.access_token}&refresh_token=${info.refresh_token}&userid=${info.uid}`; //最终的url
                                
								// 抖音
								if(isBytemini){
									if ((info.path).indexOf('/pages/') == -1 && info.path.indexOf('%2Fpages%2F') == -1 ) { //h5
                                        // info.path = info.path ? info.path : info.url;
										// let npath = info.path.replace('?','huoniaowh').replace(/&/g,'huoniaolj').replace(/=/g,'huoniaodh')
										// paramUrl = paramUrl.replace('?','huoniaowh').replace(/&/g,'huoniaolj').replace(/=/g,'huoniaodh')
										// let finUrl = npath + (npath.indexOf('huoniaowh') > -1 ? 'huoniaolj' : 'huoniaowh') + paramUrl;
										tt.miniProgram.reLaunch({ url: `/pages/redirect/index?url=${userinfo.url.replace('?','huoniaowh').replace(/&/g,'huoniaolj').replace(/=/g,'huoniaodh')}&${paramUrl}`});
                                        // location.href = userinfo.url;
									}else{ //原生
										let finUrl = decodeURIComponent(info.path) ;
										tt.miniProgram.reLaunch({ url: `/pages/redirect/index?${paramUrl}&redirectPath=${finUrl}`});
									}
								} else {
									if ((info.path).indexOf('/pages/') == -1 && info.path.indexOf('%2Fpages%2F') == -1 ) { //h5
                                        // info.path = info.path ? info.path : info.url;
										// let npath = info.path.replace('?','huoniaowh').replace(/&/g,'huoniaolj').replace(/=/g,'huoniaodh')
										// paramUrl = paramUrl.replace('?','huoniaowh').replace(/&/g,'huoniaolj').replace(/=/g,'huoniaodh')
										// let finUrl = npath + (npath.indexOf('huoniaowh') > -1 ? 'huoniaolj' : 'huoniaowh') + paramUrl;
										wx.miniProgram.reLaunch({ url: `/pages/redirect/index?url=${userinfo.url.replace('?','huoniaowh').replace(/&/g,'huoniaolj').replace(/=/g,'huoniaodh')}&${paramUrl}`});
                                        // location.href = userinfo.url;
									}else{ //原生
										let finUrl = decodeURIComponent(info.path) ;
										wx.miniProgram.reLaunch({ url: `/pages/redirect/index?${paramUrl}&redirectPath=${finUrl}`});
									}
								}
							}else{
                                if(isBytemini){
                                    tt.miniProgram.reLaunch({url: '/pages/redirect/index?url='+decodeURIComponent(userinfo.url).replace(/&amp;amp;/g, '&')});
                                }else{
                                    wx.miniProgram.reLaunch({url: '/pages/redirect/index?url='+decodeURIComponent(userinfo.url).replace(/&amp;amp;/g, '&')});
                                }
							}
						}else{
							if(wx_miniprogram){
								wx.miniProgram.reLaunch({url: '/pages/redirect/index?uid='+userinfo.userid+'&access_token='+userinfo.access_token+'&refresh_token='+userinfo.refresh_token +'&url='+ decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&')});
							}else {
								// console.log(decodeURIComponent(redirectUrl));
								top.location.href = decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&').replace(/&amp;/g, '&');
							}
						}
					}else{
						 setupWebViewJavascriptBridge(function (bridge) {
							if (redirectUrl.indexOf('wmsj') > -1) {
								bridge.callHandler('appLoginFinish', {'passport': userinfo.userid}, function () {
								});
								top.location.href = decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&').replace(/&amp;/g, '&');
							} else {
								bridge.callHandler('appLoginFinish', {
									'passport': userinfo.userid,
									'username': userinfo.username,
									'nickname': userinfo.nickname,
									'userid_encode': userinfo.userid_encode,
									'cookiePre': userinfo.cookiePre,
									'photo': userinfo.photo,
									'dating_uid': userinfo.dating_uid,
                                    'access_token': userinfo.access_token,
                                    'refresh_token': userinfo.refresh_token
								}, function () {
								});
								bridge.callHandler('pageReload', {}, function (responseData) {
								});
								setTimeout(function () {
									bridge.callHandler("goBack", {}, function (responseData) {
									});
								}, 200);
							}
						});
					}
				}

				$(btn).removeClass('disabled').text(langData['siteConfig'][2][0]);  //'登陆'

			})
		},

		// 短信登录
		lohin_by_msg:function(btn){
			var t = this;
			var btn = btn ? btn : event.currentTarget;
			var areaCode = $("#codeChoose").val();
			var phone = $("#phone").val();
			var code = $("#vercode").val();
			var loginUrl = "/include/ajax.php?service=member&action=smsLogin&rsaEncrypt=1&phone=" + rsaEncrypt(phone) + "&code=" + code + "&areaCode=" + areaCode;
			if(t.appSign.length > 0){
				loginUrl += ('&' + t.appSign.join("&"));
			}

			 if(phone == ''){
				showErrAlert(langData['siteConfig'][20][463]);//请输入手机号码
				return false;
			}

			if(areaCode == "86"){
				var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
				if(!phoneReg.test(phone)){
					showErrAlert(langData['siteConfig'][20][465]);   //手机号码格式不正确
					return false;
				}
			}

			if(code == ''){
				showErrAlert(langData['siteConfig'][20][28]);//请输入短信验证码
				return false;
			}

			let param = new URLSearchParams();
            param.append('rsaEncrypt', 1);
			param.append('phone', rsaEncrypt(phone));
			param.append('code', code);
			param.append('areaCode', areaCode);
			$(btn).addClass('disabled').text(langData['siteConfig'][55][9]);  //登陆中~
			// 从小程序过来的
			if(path){
				param.append('path', path);
				param.append('wxMiniProgramLogin', wxMiniProgramLogin);
			}

			t.loading = true;
			axios({
				method: 'post',
				url: loginUrl,
				data:param,
			})
			.then((response)=>{
				var data = response.data;
				t.loading = false;
				if(data.state != 100){
					showErrAlert(data.info);
					$(btn).removeClass('disabled').text(langData['siteConfig'][2][0]);  //登录
					$('.btn_login').removeClass('disabled').text(langData['siteConfig'][2][0]); //恢复按钮可点
				}else{
					userinfo = data.info;
					if (device.indexOf('huoniao') <= -1) {
						if(userinfo && typeof(userinfo)=='string' && userinfo.indexOf('wxMiniProgramLogin') > -1){
							if(userinfo.indexOf('path') > -1){

                                // 小程序
                                // wx.miniProgram.redirectTo({ url: '/pages/loginRedirect/index?url=' + encodeURIComponent(userinfo).replace(/&amp;amp;/g, '&').replace(/&amp;/g, '&') });
                                let arr=userinfo.split('&');
                                let info={};
                                for(let i=0;i<arr.length;i++){
                                    let newArr=arr[i].split('=');
                                    info[newArr[0]]=newArr[1];
                                };
                                let paramUrl =  `access_token=${info.access_token}&refresh_token=${info.refresh_token}&userid=${info.uid}`; //最终的url
                                
								// 抖音
								if(isBytemini){
									if ((info.path).indexOf('/pages/') == -1 && info.path.indexOf('%2Fpages%2F') == -1 ) { //h5
                                        // info.path = info.path ? info.path : info.url;
										// let npath = info.path.replace('?','huoniaowh').replace(/&/g,'huoniaolj').replace(/=/g,'huoniaodh')
										// paramUrl = paramUrl.replace('?','huoniaowh').replace(/&/g,'huoniaolj').replace(/=/g,'huoniaodh')
										// let finUrl = npath + (npath.indexOf('huoniaowh') > -1 ? 'huoniaolj' : 'huoniaowh') + paramUrl;
										tt.miniProgram.reLaunch({ url: `/pages/redirect/index?url=${userinfo.replace('?','huoniaowh').replace(/&/g,'huoniaolj').replace(/=/g,'huoniaodh')}&${paramUrl}`});
                                        // location.href = userinfo;
									}else{ //原生
										let finUrl = decodeURIComponent(info.path) ;
										tt.miniProgram.reLaunch({ url: `/pages/redirect/index?${paramUrl}&redirectPath=${finUrl}`});
									}
								} else {
									if ((info.path).indexOf('/pages/') == -1 && info.path.indexOf('%2Fpages%2F') == -1 ) { //h5
                                        // info.path = info.path ? info.path : info.url;
										// let npath = info.path.replace('?','huoniaowh').replace(/&/g,'huoniaolj').replace(/=/g,'huoniaodh')
										// paramUrl = paramUrl.replace('?','huoniaowh').replace(/&/g,'huoniaolj').replace(/=/g,'huoniaodh')
										// let finUrl = npath + (npath.indexOf('huoniaowh') > -1 ? 'huoniaolj' : 'huoniaowh') + paramUrl;
										wx.miniProgram.reLaunch({ url: `/pages/redirect/index?url=${userinfo.replace('?','huoniaowh').replace(/&/g,'huoniaolj').replace(/=/g,'huoniaodh')}&${paramUrl}`});
                                        // location.href = userinfo;
									}else{ //原生
										let finUrl = decodeURIComponent(info.path) ;
										wx.miniProgram.reLaunch({ url: `/pages/redirect/index?${paramUrl}&redirectPath=${finUrl}`});
									}
								}
							}else{
                                if(isBytemini){
                                    tt.miniProgram.reLaunch({url: '/pages/redirect/index?url='+decodeURIComponent(userinfo).replace(/&amp;amp;/g, '&')});
                                }else{
                                    wx.miniProgram.reLaunch({url: '/pages/redirect/index?url='+decodeURIComponent(userinfo).replace(/&amp;amp;/g, '&')});
                                }
							}
						}else{
							if(wx_miniprogram){
								wx.miniProgram.reLaunch({url: '/pages/redirect/index?url='+ decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&')+'&uid='+userinfo.userid+'&access_token='+userinfo.access_token+'&refresh_token='+userinfo.refresh_token});
							}else{
								top.location.href = decodeURIComponent(redirectUrl).replace(/&amp;amp;/g, '&').replace(/&amp;/g, '&');
							}
						}
					} else {
						setupWebViewJavascriptBridge(function (bridge) {
							bridge.callHandler('appLoginFinish', {
								'passport': userinfo.userid,
								'username': userinfo.username,
								'nickname': userinfo.nickname,
								'userid_encode': userinfo.userid_encode,
								'cookiePre': userinfo.cookiePre,
								'photo': userinfo.photo,
								'dating_uid': userinfo.dating_uid,
                                'access_token': userinfo.access_token,
                                'refresh_token': userinfo.refresh_token
							}, function () {
							});
							bridge.callHandler('pageReload', {}, function (responseData) {
							});
							setTimeout(function () {
								bridge.callHandler("goBack", {}, function (responseData) {
								});
							}, 200);
						});
					}
				}
			});
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
				if(geetest == 1){
					captchaVerifyFun.config.captchaObjReg.verify();
				}else{
					$('#codeButton').click()
				}
			}

			// 不需要极验
			if(!geetest){
				t.sendVerCode($('.getCode'));
			}

		},

		// 极验
		handlerPopupReg:function(captchaObjReg){
			// 成功的回调
			var t = this;
			captchaObjReg.onSuccess(function () {
				var validate = captchaObjReg.getValidate();
				t.dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;
				t.sendVerCode($('.getCode'));

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
			var phone = $("#phone").val();
			var areacode = $("#codeChoose").val();

			var param = "rsaEncrypt=1&phone="+rsaEncrypt(phone) +"&areaCode="+areacode 
			if(captchaVerifyParam && geetest == 2){
				param = param + '&geetest_challenge=' + captchaVerifyParam
			}else if(geetest == 1 && captchaVerifyParam){
				param = param +  captchaVerifyParam
			}
			$.ajax({
				url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=sms_login",
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
						btn.removeClass("noclick").text(langData['siteConfig'][4][1]);  //获取验证码
						showErrAlert(data.info);
					}
				},
				error: function(){
					btn.removeClass("noclick").text(langData['siteConfig'][4][1]);  //获取验证码
					showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
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

		// 设置cookie
		setCookie:function (name, value, min) {
		  if(min !== 0){     //当设置的时间等于0时，不设置expires属性，cookie在浏览器关闭后删除
			var expires = min * 60 * 1000;
			var date = new Date(+new Date()+expires);
			document.cookie = name + "=" + escape(value) + ";expires=" + date.toUTCString();
		  }else{
			document.cookie = name + "=" + escape(value);
		  }
		},

		// 计算倒计时时间
		countTime:function(time){
				time = parseInt( time /1000);
				$(".psdlogin .btn_login,.psdlogin .toagree").addClass('error').html(langData['siteConfig'][55][10].replace(' 1 ',parseInt(time  / 60 )));  //输入错误次数太多，请 1 分钟后重试
			var timer = setInterval(function(){
				time -- ;
				var min = parseInt(time  / 60);
				var sec = parseInt(time  % 60);
				if(min > 0){
					$(".psdlogin .btn_login,.psdlogin .toagree").html(langData['siteConfig'][55][10].replace(' 1 ',min))
				}else{
					$(".psdlogin .btn_login,.psdlogin .toagree").html(langData['siteConfig'][55][11].replace(' 1 ',sec))
				}
				if(time <= 0){
					$(".psdlogin .btn_login,.psdlogin .toagree").removeClass('error').html(langData['siteConfig'][2][0]);  //登录
					clearInterval(timer);
				}
			},1000);

		}
	},
});
