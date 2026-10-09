var dataGeetest = '';

$(function(){
	$.cookie('downloadAppTips', 1, {expires: 1}); //隐藏下载app按钮

	/* 注册 */
	//选择区号
	$(".areacode").click(function(){
		 $(".popl_mask").show();
		 $(".popl_box").animate({"bottom":"0"},300,"swing");
	});

	// 取消选择区号
	$("#areaList li").click(function(){
		var t = $(this);
		var code = t.attr("data-code");
		var area = t.attr("data-cn");
		$('.areacode').attr('data-code',code)
		$(".areacode em").html('+'+code);
		$("#areaCode").val(code);
		t.addClass('achose').siblings('li').removeClass('achose');
		$(".popl_box.anum_box .back").click();
	})

    // 取消选择区号
	$(".popl_box.anum_box .back,.popl_mask").click(function(){
	  $(".popl_mask").hide();
	  $(".popl_box").animate({"bottom":"-9rem"},300,"swing");
	});

	//倒计时
	function countDown(time, obj){
		obj.html(time+(langData['siteConfig'][44][1].replace('1',''))).addClass('disabled');//1秒后重发
		mtimer = setInterval(function(){
			obj.html((--time)+(langData['siteConfig'][44][1].replace('1',''))).addClass('disabled');//1秒后重发
			if(time <= 0) {
				clearInterval(mtimer);
				obj.html(langData['siteConfig'][6][55]).removeClass('disabled').removeClass('not');//重新发送
			}
		}, 1000);
	}


	/* 以下是获取验证码 */
	//发送验证码
	  function sendVerCode(captchaVerifyParam,callback){
		var form = $(".regist").find("form");
		var btn = form.find('.getyzm'), v = form.find("#account").val();
		if(btn.hasClass("disabled") || btn.hasClass("not")) return;


		if (v == '') {
		  showErrAlert('请输入手机号');
		  return false;
		}else{

			btn.addClass("not").text(langData['siteConfig'][23][99]);
			var  param = '' ;
            if(captchaVerifyParam && geetest == 2){
                param = param + '&geetest_challenge=' + captchaVerifyParam
              }else if(geetest == 1 && captchaVerifyParam){
                param = param +  captchaVerifyParam
              }
			$.ajax({
			  url: '/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=signup&phone='+v+param,
			  type: "GET",
			  dataType: "json",
			  success: function (data) {

				// $("#maskReg, #popupReg-captcha-mobile").removeClass("show");

				//获取成功
				if(data && data.state == 100){
				  countDown(60, form.find(".getyzm"));
				//获取失败
				}else{
				  btn.removeClass("not").text(langData['siteConfig'][4][1]);
				  showErrAlert(data.info);
				}
			  },
			  error: function(){
				btn.removeClass("not").text(langData['siteConfig'][4][1]);
				showErrAlert(langData['siteConfig'][20][173]);
			  }
			});
		}
	  }


	  if(geetest){

		// //极验验证
		// var handlerPopupReg = function (captchaObjReg) {
		//   // captchaObjReg.appendTo("#popupReg-captcha-mobile");

		//   // 成功的回调
		//   captchaObjReg.onSuccess(function () {
		// 	var validate = captchaObjReg.getValidate();
		// 	dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;
		// 	sendVerCode();
		// 	// $("#maskReg, #popupReg-captcha-mobile, .gt_popup").removeClass("show");
		//   });
		//   // captchaObjReg.onClose(function () {
		//   //   var djs = $('.djs'+type);
		//   //   djs.text('').hide().siblings('.sendvdimgck').show();
		//   // })

		//   window.captchaObjReg = captchaObjReg;
		// };

		captchaVerifyFun.initCaptcha('h5','#codeButton',sendVerCode)	
		//获取验证码
		$('.regist').delegate('.getyzm', 'click', function(){
		  var t = $(this);
		  if(t.hasClass("disabled") || t.hasClass("not")) return;

		  //弹出验证码
		  if (geetest == 1) {
				captchaVerifyFun.config.captchaObjReg.verify();
			} else {
				$('#codeButton').click()
			}
		})

		

	  }

	  if(!geetest){
		$('.regist').delegate('.getyzm', 'click', function(){
		  var t = $(this);
		  if(t.hasClass("disabled") || t.hasClass("not")) return;
		  sendVerCode();
		});
	  }


	// 协议勾选
	$('#protocol').click(function(){
		$(this).toggleClass('agree')
	})
	// 提交注册
	$(".submit_btn").click(function(){
		var form = $(".regist").find("form"), btn = $(this);
		if(btn.hasClass('disabled')) return;
		 var reg = /^1[0-9]{10}$/;
		 var account = $("#account").val();
		 var areaCode = $("#areaCode").val();
		 var codetest = $("#vcode").val();
		 if(!$('#protocol').hasClass('agree')){
			showErrAlert('请同意《会员注册协议》');
			 return false;
		 }else if(account == ''){
			 showErrAlert('请输入手机号');
			 return false;
		 }else if(areaCode == '86' && !account.match(reg)){
			 showErrAlert('请输入正确的手机号');
			 return false;
		 }else if(codetest == ''){
			 showErrAlert('请输入手机号验证码');
			 return false;
		 }

		 btn.addClass('disabled').html('<span>礼包领取中...</span>');

		 $.ajax({
			  url: masterDomain+"/registerCheck_v1.html",
			  data: form.serialize() + "&mtype=1&rtype=3&from=invite",
			  type: "POST",
			  async: false,
			  dataType: "html",
			  success: function (data) {
				 var dataArr = data.split("|");
				 var info = dataArr[1];
				 if(data.indexOf("100|") > -1){
					 $(".mask,.pop_success").show();
				 }else{
					  showErrAlert(info);
				 }
				 btn.removeClass('disabled').html('<span>立即领取礼包</span>');
			  }
		})
	});


	// 关闭注册成功弹出层
	// $(".pop_success .close_btn,.mask").click(function(){
	// 	$(".mask").hide();
	// 	$(".pop_success").hide()
	// });

	if(Urltype == 'registe'){
		if(typeof cfg_appinfo != "undefined"){
			var url_path =  window.location.href;
			var iOSver = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);  //ios版本信息
			var isIOS9 = iOSver?iOSver[1]:0;
			var appConfig = {
				scheme_IOS: cfg_appinfo.URLScheme_iOS?(cfg_appinfo.URLScheme_iOS+'://?url='+url_path):(masterDomain+'/mobile.html'),
				scheme_Adr: cfg_appinfo.URLScheme_Android?('portal://'+cfg_appinfo.URLScheme_Android+':8000/splash?url='+url_path):(masterDomain+'/mobile.html'),
				download_url_IOS: masterDomain+'/mobile.html',
				timeout: 600
			};
			 var isWeixin = device.toLowerCase().indexOf('micromessenger') != -1;
			var wx_stringArr = isWeixin?device.toLowerCase().match(/micromessenger\/([\d\.]+)/i):0;
			var wx_version = wx_stringArr.length>0?device.toLowerCase().match(/micromessenger\/([\d\.]+)/i)[1]:0; //微信版本号
			var wx_for = isWeixin?(wx_version.split('.')[0]>=7 || (wx_version.split('.')[1] >= 0 && wx_version.split('.')[0]==7) || (wx_version.split('.')[2]>=12 && wx_version.split('.')[0]==7 && wx_version.split('.')[1] == 0) ):0;//微信版本号是否大于7.0.12

			if(wx_for &&  cfg_appinfo.wx_appid){
				$('.btn_success.btn_app').append('<div class="btn_down_box" style="display: block; position: absolute; left: 0; right: 0; bottom: 0; top: 0; z-index:9;" >'+
				'     <wx-open-launch-app' +
				 '          id="launch-btn"' +
				 '          appid="'+cfg_appinfo.wx_appid+'"' +
				 '			extinfo=""'+
				 '    ><template>\n' +
				 '     <style>.btn_down{display: block; width: 200px; height: 50px; border-radius: 21px;  line-height: .7rem; font-size:18px;opacity:0;}\n'+
				 '</style>\n'+
				  ' <a class="btn_down">前往APP查收</a>\n' +  //立即打开
				 '   </template>\n'+
				'   </wx-open-launch-app>\n'+
				'</div>')
			}
		}
		$(".btn_success.btn_app").click(function(){
			if(isWeixin && !wx_for){
				location.href = appConfig.download_url_IOS
			}else if(!isWeixin){
			  openclient();
			}
		})


	if(isWeixin && wx_for){
         wx.ready(function(){
	         var btn = document.getElementById('launch-btn');
			 btn.addEventListener('click', function (e) {
				 //调起失败后兼容处理
				 setTimeout(function(){
					 if(!isClick){
						 isClick = true;
						 location.href = appConfig.download_url_IOS
					 }
				 }, 1000);

			 });
	         btn.addEventListener('launch', function (e) {
	           console.log('success');
	         });
	         btn.addEventListener('error', function (e) {
				 //调起失败后兼容处理
				 isClick = true;
				 $.cookie('appDownloadLocation', true);
				 location.href = appConfig.download_url_IOS
	         });
         })

       }
	}
	function openclient() {
		var startTime = Date.now();
		// 用户点击时，在动态创建一个iframe，并且让这个iframe去加载config中的Schema
		var ifr = document.createElement('iframe');
		// 端口判断 安卓或IOS
		console.log(device)
		ifr.src = device.toLowerCase().indexOf('os') > 0 ? appConfig.scheme_IOS : appConfig.scheme_Adr;
		ifr.style.display = 'none';
		if(isIOS9 >= 9){
			 window.location.href = appConfig.scheme_IOS;
			 setTimeout(function(){
				window.location.href = appConfig.download_url_IOS
			 },appConfig.timeout)
		}else{
			document.body.appendChild(ifr);
		}
		var t = setTimeout(function() {
			var endTime = Date.now();
			//指定的时间内没有跳转成功 当前页跳转到apk的下载地址
			if ((endTime - startTime) < (appConfig.timeout + 200)) {
				//判断是安卓 还是IOS
				if (/iphone|ipad|ipod/.test(device.toLowerCase())) {
					window.location.href = appConfig.download_url_IOS;
				} else if (/android/.test(device.toLowerCase())) {
					window.location.href = appConfig.download_url_IOS;
				}
			} else {
				window.close();
			}
		}, appConfig.timeout);

		window.onblur = function() {
			clearTimeout(t);
		}
	}

})
