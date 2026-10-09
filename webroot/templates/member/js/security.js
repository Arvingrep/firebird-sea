$(function(){

	// $(".sidebar dl").each(function(index){
	// 	if(index > 1){
	// 		$(this).addClass("curr");
	// 		$(this).find("dd").hide();
	// 	}
	// });
	var modifyPop = null;
	var changeUidByPhone = '';
	var interval = [300, 500, 700, 900, 1100];
	var i = 0, score = 100;
	var testing = $(".testing"), percentage = testing.find(".percentage"), progress = testing.find(".progress");
	var verifyFunc = verifyType = verifyData = opera = returnUrl = null;
	var title = testing.find("h5");
	var p1 = progress.find(".p1"),
			p2 = progress.find(".p2"),
			p3 = progress.find(".p3"),
			p4 = progress.find(".p4"),
			p5 = progress.find(".p5");

	if(doget != ""){
		setPercentage(rating, 1);
		$(".list ul").show();
		setTimeout(function(){
			//查看等待审核中的实名认证资料
			if(doget == "chCertify" && (certifyState == 3 || certifyState == 1)){
				$("#shCertify").click();
			}else{
				$("#"+doget).click();
			}
		}, 1);
	}else{
		//异步获取体检结果
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=member&action=riskAdvicePolicy",
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				//检测成功
				if(data && data.state != 200){
					animation(data.info);

				// //检测失败
				}else{
					progress.hide();
					percentage.removeClass().addClass("percentage complete l3").html("0");
					testing.find(".suc-tip").html("<font color='#de0202'>"+langData['siteConfig'][20][561]+"<br /><a href='javascript:;' class='btn' onclick='location.reload();'>"+langData['siteConfig'][6][179]+"</a></font>").show();
					//本次体检未完成，建议您重新进行体检！---- 重新体检
					title.html(langData['siteConfig'][20][562]);  //体检已取消！
				}
			}
		});
	}

	function animation(data){
		var term = setTimeout(function(){
			if(i < interval.length){
				clearTimeout(term);
				if(i == 0){
					title.html(langData['siteConfig'][20][563]+"···");   //正在进行实名认证验证
					if(data.paypwd == "ok"){
						p1.addClass("ok");
					}else{
						p1.addClass("fail");
						$(".paypwd").addClass("fail");
						score -= 20;
					}
					$(".paypwd").fadeIn();
				}else if(i == 1){
					title.html(langData['siteConfig'][20][564]+"···");  //正在进行手机绑定验证
					if(data.certifyState == "ok"){
						p2.addClass("ok");
					}else{
						p2.addClass("fail");
						$(".certify").addClass("fail");
						score -= 20;
					}
					$(".certify").fadeIn();
				}else if(i == 2){
					title.html(langData['siteConfig'][20][565]+"···");   //正在进行邮箱绑定验证
					if(data.phoneCheck == "ok"){
						p3.addClass("ok");
					}else{
						p3.addClass("fail");
						$(".mobile").addClass("fail");
						score -= 20;
					}
					$(".mobile").fadeIn();
				}else if(i == 3){
					title.html(langData['siteConfig'][20][566]+"···");   //正在进行安全问题验证
					if(data.emailCheck == "ok"){
						p4.addClass("ok");
					}else{
						p4.addClass("fail");
						$(".email").addClass("fail");
						score -= 20;
					}
					$(".email").fadeIn();
				}else if(i == 4){
					title.html(langData['siteConfig'][20][567]+"···");   //完成体检，正在汇总得分
					if(data.security == "ok"){
						p5.addClass("ok");
					}else{
						p5.addClass("fail");
						$(".question").addClass("fail");
						score -= 20;
					}
					$(".question").fadeIn();
				}
				i++;
				setPercentage(score, 0);
				animation(data);
			}else{
				setTimeout(function(){setPercentage(score, 1);}, 500);
			}
		}, interval[Math.round(Math.random() * 2)]);
	}

	function setPercentage(num, state){
		percentage.html(num);
		var cla = "", txt = "";
		progress.find(".bar i").animate({"width": (i*20)+"%"}, 500);
		if(state == 1){
			// progress.hide();
			if(num < 100 && num > 40){
				percentage.removeClass().addClass("percentage complete l2");
				// testing.find(".suc-tip").html("<font color='#ffb014'>建议继续完善，获得更高保障<br />完善建议：支付密码不使用连续的或简单重复的数字/字母，使用两种以上字符设置安全问题</font>").show();
				cla = "ffb014";
				txt = langData['siteConfig'][13][2];   //中
			}else if(num <= 40){
				percentage.removeClass().addClass("percentage complete l3");
				// testing.find(".suc-tip").html("<font color='#de0202'>您的帐户存在严重安全隐患，强烈建议您立即升级！<br />友情提示：升级您的帐户信息将享受安全的在线支付服务以及方便查看和管理账户支出和收入</font>").show();
				cla = "de0202";
				txt = langData['siteConfig'][13][3];  //低
			}else{
				percentage.removeClass().addClass("percentage complete l1");
				// testing.find(".suc-tip").html("<font color='#008e11'>恭喜您，您已获得全面的安全保障<br />温馨建议：在账号日常操作中注意密码等安全信息的保护，切勿泄露</font>").show();
				cla = "008e11";
				txt = langData['siteConfig'][13][1];  //高
			}
			title.html(langData['siteConfig'][15][6]+"：<strong style='color: #"+cla+"'>"+txt+"</strong>");   //账号安全等级
			$(".checkSecure").show();
		}
	}

	$("html").delegate(".editForm input", "focus", function(){
		$('dl').removeClass("focus")
		$(this).closest("dl").addClass("focus");
	});

	$("html").delegate(".editForm input", "blur", function(e){
		if($(this).parents('.pwdInp').size() == 0){
			$(this).closest("dl").removeClass("focus");
		}else{
			$(document).one('click',function(ev){
				if(ev.target != 'input'){
					$('dl').removeClass('focus');
				}
			})
		}

	});

	//修改昵称
	$("#chnickname").bind("click", function(){
		modifyFun(langData['siteConfig'][6][180], "chnicknameEdit", "nick", 500, langData['siteConfig'][6][181], function(){
			//修改登录昵称---确定修改
			var name = $("#name");
			return "name="+name.val();
		}, function(){
			var name = $("#name");
			if($.trim(name.val()) == ""){
				popTip(langData['siteConfig'][20][568], "error");  //请输入新的昵称
				name.focus();
				return "false";
			}
		});
	});

	//修改登录密码
	$("#chpassword").bind("click", function(){
		modifyFun(langData['siteConfig'][5][19], "chpasswordEdit", "password", 500, langData['siteConfig'][6][181], function(){
			//修改登录密码-----确定修改
			var old = $("#old"), newest = $("#new"), confirm = $("#confirm");
			return "old="+old.val()+"&new="+newest.val()+"&confirm="+confirm.val();
		}, function(){
			var old = $("#old"), newest = $("#new"), confirm = $("#confirm"), passwordStrengthDiv = $("#passwordStrengthDiv").attr("class");
			if(old.size() > 0 && $.trim(old.val()) == ""){
				popTip(langData['siteConfig'][20][240], "error");  //请输入当前密码
				old.focus();
				return "false";
			}
			if($.trim(newest.val()) == ""){
				popTip(langData['siteConfig'][20][84], "error");//请输入新密码
				newest.focus();
				return "false";
			}
			if(passwordStrengthDiv == "" || passwordStrengthDiv == undefined || Number(passwordStrengthDiv.replace("is", "")) < 50){
				popTip(langData['siteConfig'][20][241], "error");//您输入的新密码太过简单，请重新输入
				newest.focus();
				return "false";
			}
			if($.trim(confirm.val()) == ""){
				popTip(langData['siteConfig'][20][569], "error");//请确认新密码
				confirm.focus();
				return "false";
			}
			if(newest.val() != confirm.val()){
				popTip(langData['siteConfig'][20][242], "error");//两次输入的密码不一致，请重新输入
				confirm.focus();
				return "false";
			}
		});

		$(".editForm #new").passwordStrength();
	});

	//设置支付密码
	$("#paypwdAdd").bind("click", function(){
		modifyFun(langData['siteConfig'][6][120], "chpaypwdAdd", "paypwdAdd", 500, langData['siteConfig'][6][128], function(){
			//设置支付密码-----确定提交
			var pay1 = $("#pay1"), pay2 = $("#pay2");
			return "pay1="+pay1.val()+"&pay2="+pay2.val();
		}, function(){
			var pay1 = $("#pay1"), pay2 = $("#pay2"), passwordStrengthDiv = $("#passwordStrengthDiv").attr("class");
			if($.trim(pay1.val()) == ""){
				popTip(langData['siteConfig'][20][213], "error");//请输入支付密码
				pay1.focus();
				var ul = newpay.siblings('.pwdInp');
				ul.children('li').eq(0).find('input').click();
				return "false";
			}
			if($.trim(pay1.val()).length < 6){
				popTip('请输入6位数支付密码', "error");//请输入支付密码
				pay1.focus();
				var ul = newpay.siblings('.pwdInp');
				ul.children('li').eq(0).find('input').click();
				return "false";
			}
			// if(passwordStrengthDiv == "" || passwordStrengthDiv == undefined || Number(passwordStrengthDiv.replace("is", "")) < 50){
			// 	popTip(langData['siteConfig'][20][241], "error");//您输入的新密码太过简单，请重新输入
			// 	pay1.focus();
			// 	return "false";
			// }
			// if($.trim(pay2.val()) == ""){
			// 	popTip(langData['siteConfig'][20][570], "error");//请确认支付密码
			// 	pay2.focus();
			// 	return "false";
			// }
			// if(pay1.val() != pay2.val()){
			// 	popTip(langData['siteConfig'][20][242], "error");//两次输入的密码不一致，请重新输入
			// 	pay2.focus();
			// 	return "false";
			// }
		});

		$(".editForm #pay1").passwordStrength();
	});

	//修改支付密码
	$("#paypwdEdit").bind("click", function(){
		modifyFun(langData['siteConfig'][5][20], "chpaypwdEdit", "paypwdEdit", 500, langData['siteConfig'][6][128], function(){
			//修改支付密码----确定提交
			var old = $("#old"), newpay = $("#new"), confirm = $("#confirm");
			return "old="+old.val()+"&new="+newpay.val()+"&confirm="+confirm.val();
		}, function(){
			var old = $("#old"), newpay = $("#new"), confirm = $("#confirm"), passwordStrengthDiv = $("#passwordStrengthDiv").attr("class");
			if($.trim(old.val()) == ""){
				popTip(langData['siteConfig'][20][571], "error");//请输入原支付密码
				old.focus();
				return "false";
			}
			if($.trim(newpay.val()) == ""){
				popTip(langData['siteConfig'][20][572], "error");//请输入新的支付密码
				newpay.focus();
				var ul = newpay.siblings('.pwdInp');
				ul.children('li').eq(0).find('input').click();
				return "false";
			}

			if($.trim(newpay.val()).length<6){
				popTip(langData['siteConfig'][56][7], "error");//请输入新的支付密码
				newpay.focus();
				var ul = newpay.siblings('.pwdInp');
				ul.children('li').eq(0).find('input').click();
				return "false";
			}
			// if(passwordStrengthDiv == "" || passwordStrengthDiv == undefined || Number(passwordStrengthDiv.replace("is", "")) < 50){
			// 	popTip(langData['siteConfig'][20][241], "error");//您输入的新密码太过简单，请重新输入
			// 	newpay.focus();
			// 	return "false";
			// }
			// if($.trim(confirm.val()) == ""){
			// 	popTip(langData['siteConfig'][20][570], "error");//请确认支付密码
			// 	confirm.focus();
			// 	return "false";
			// }
			// if(newpay.val() != confirm.val()){
			// 	popTip(langData['siteConfig'][20][242], "error");//两次输入的密码不一致，请重新输入
			// 	confirm.focus();
			// 	return "false";
			// }
		});

		// $(".editForm #new").passwordStrength();
	});

	//重置支付密码
	$("#paypwdReset").bind("click", function(){
		opera = "paypwd";
		authentication(bindPaypwdUrl);
	});
	$("html").delegate("#paypwdReset", "click", function(){
		opera = "paypwd";
		authentication(bindPaypwdUrl);
	})
	// 2020-10-10
	//支付密码手机验证修改
	$("html").delegate(".phoneYz", "click", function(){

      	verifyType = "authPhone";

      //验证脚本
      verifyFunc = function(){
        var vdimgck = $("#vdimgck");
        if($.trim(vdimgck.val()) == ""){
          popTip(langData['siteConfig'][20][28], "error");
          vdimgck.focus();
          return "false";
        }
      };

      //传送数据
      verifyData = function(){
        return "vdimgck="+$("#vdimgck").val();
      };


		$('.ui_close').click();
		opera = "paypwd";
		authentication(bindPaypwdUrl);

		$(".authenticated, .footer-tip").hide();
		$(".authlist, .authlist .item:eq(0), .ui_buttons").fadeIn(300);
		if($(".ui_state_focus .ui_buttons").find(".anotherWay").size() == 0){
			$(".ui_state_focus .ui_buttons").prepend('<a href="javascript:;" class="anotherWay">&laquo; '+langData['siteConfig'][20][97]+'</a>');
		}
	})
	// 2020-10-10
	//支付密码邮箱验证修改
	$("html").delegate(".emailYz", "click", function(){

        verifyType = "authEmail";

      //验证脚本
      verifyFunc = function(){
        var vdimgck = $("#vdimgckEmail");
        if($.trim(vdimgck.val()) == ""){
          popTip(langData['siteConfig'][20][236], "error");
          vdimgck.focus();
          return "false";
        }
      };

      //传送数据
      verifyData = function(){
        return "vdimgck="+$("#vdimgckEmail").val();
      };

		$('.ui_close').click();
		opera = "paypwd";
		authentication(bindPaypwdUrl);

		$(".authenticated, .footer-tip").hide();
		$(".authlist, .authlist .item:eq(0), .ui_state_focus .ui_buttons").fadeIn(300);
		if($(".ui_buttons").find(".anotherWay").size() == 0){
			$(".ui_buttons").prepend('<a href="javascript:;" class="anotherWay">&laquo; '+langData['siteConfig'][20][97]+'</a>');
		}
	})

	//删除文件
	$("html").delegate(".spic .reupload", "click", function(){
		var t = $(this), parent = t.parent(), input = parent.siblings("input"), iframe = parent.siblings("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

	//实名认证
	$("#chCertify").bind("click", function(){
		modifyFun(langData['siteConfig'][19][255], "chCertifyAdd", "certify", 590, langData['siteConfig'][6][60], function(){
			//实名认证----提交认证
			var realname = $("#realname"), idcard = $("#idcard"), front = $("#front"), back = $("#back"), license = $("#license");
			return "realname="+realname.val()+"&idcard="+idcard.val()+"&front="+front.val()+"&back="+back.val()+"&license="+license.val();
		}, function(){
			var realname = $("#realname"), idcard = $("#idcard"), front = $("#front"), back = $("#back");
			if($.trim(realname.val()) == ""){
				popTip(langData['siteConfig'][20][248], "error");  //请输入真实姓名
				realname.focus();
				return "false";
			}
			if($.trim(idcard.val()) == ""){
				popTip(langData['siteConfig'][20][106], "error");//请输入身份证号码
				idcard.focus();
				return "false";
			}
			// if(!checkIdcard(idcard.val())){
			// 	popTip("请输入正确的身份证号码", "error");
			// 	idcard.focus();
			// 	return "false";
			// }
			if($.trim(front.val()) == ""){
				popTip(langData['siteConfig'][20][107], "error");//请上传身份证正面照片
				return "false";
			}
			if($.trim(back.val()) == ""){
				popTip(langData['siteConfig'][20][108], "error");//请上传身份证反面照片
				return "false";
			}
		});

		$(".cardUpload .spic").hover(function(){
			$(this).find(".reupload").show();
		}, function(){
			$(this).find(".reupload").hide();
		});

	});

	//查看实名认证资料
	var certifyData = null;
	$("#shCertify").bind("click", function(){
		modifyFun(langData['siteConfig'][23][117], "chCertify", "certify", 590, false);//不可用余额是指用户办理一些特殊业务时，本人账户中暂时不能使用的那部分资金。

		if(certifyData == null){
			$.ajax({
				url: masterDomain+"/include/ajax.php?service=member&action=updateAccount&do=getCerfityData",
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					//获取成功
					if(data && data.state != 200){
						certifyData = data.info;
						bindCertifyData(data.info);

					//获取失败
					}else{
						alert(langData['siteConfig'][20][250]);//信息获取失败，请刷新页面重试！
					}
				}
			});
		}else{
			bindCertifyData(certifyData);
		}
	});

	//填充认证数据
	function bindCertifyData(data){
		if(data){
			$("#realname").val(data.realname);
			$("#idcard").val(data.idcard);
			$(".front .sholder").html('<a href="'+data.front+'" target="_blank"><img src="'+data.front+'" /></a>');
			$(".back .sholder").html('<a href="'+data.back+'" target="_blank"><img src="'+data.back+'" /></a>');
			$(".licenseUpload .sholder").html('<a href="'+data.license+'" target="_blank"><img src="'+data.license+'" /></a>');
		}else{
			alert(langData['siteConfig'][20][250]);//信息获取失败，请刷新页面重试！
		}
	}


	var geetestData = "";
	if(geetest){

		
		captchaVerifyFun.initCaptcha('web','#codeButton',getPhoneVerify)
		// 重新发送
		$("html").delegate("#getPhoneVerify", "click", function(){
			var areaCode = $("#areaCode"), phone = $("#phone");

			if(areaCode.val() == ''){
				popTip(langData['siteConfig'][30][39], "error");   //请选择国家区号
				return false;
			}
			if(phone.val() == ''){
				popTip(langData['siteConfig'][20][463], "error");  //请输入手机号码
				phone.focus();
				return false;
			}
			checkPhoneBindState()
		})

	//没有验证码时
	}else{
		// 重新发送
		$("html").delegate("#getPhoneVerify", "click", function(){
			checkPhoneBindState();
		})
	}


	function getPhoneVerify(captchaVerifyParam,callback){
		var t = $("#getPhoneVerify"), areaCode = $("#areaCode"), phone = $("#phone");
		let param = "";
		if(captchaVerifyParam && geetest == 2){
		  param = param + '&geetest_challenge=' + captchaVerifyParam
		}else if(geetest == 1 && captchaVerifyParam){
		  param = param +  captchaVerifyParam
		}
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=verify",
			data: "areaCode="+areaCode.val()+"&phone="+phone.val() + param,
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(callback){
					callback(data)
				}
				//获取成功
				if(data && data.state == 100){
					countDown(t);

				//获取失败
				}else{
					t.removeClass("disabled").html(langData['siteConfig'][4][4]);//获取短信验证码
					popTip(data.info, "error");
					alert(data.info);
				}
			}
		});
		$("#vdimgck").focus();
	}

	function checkPhoneBindState(){
		var t = $(this), areaCode = $("#areaCode"), phone = $("#phone");

		if(t.hasClass("disabled")) return false;

		if(areaCode.val() == ''){
			popTip(langData['siteConfig'][30][39], "error");   //请选择国家区号
		}
		if(phone.val() == ''){
			popTip(langData['siteConfig'][20][463], "error");  //请输入手机号码
			phone.focus();
		}else{

			t.addClass("disabled");
			t.html('<img src="'+staticPath+'images/loading_16.gif" /> '+langData['siteConfig'][7][3]+'...');

			popTip(langData['siteConfig'][20][101], "");  //请输入短信验证码，没收到短信？<br />1. 网络通讯异常可能会造成短信丢失，请重新获取或稍后再试；<br />2. 请核实手机是否已欠费停机，或者屏蔽了系统短信；

			// 验证手机号是否被其他用户绑定
			$.ajax({
				url: masterDomain+"/include/ajax.php?service=siteConfig&action=checkPhoneBindState",
				data: "phone="+phone.val(),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					//获取成功
					if(data && data.state == 100){
						// 手机号已被其他用户绑定
						if(data.info != "no"){
							$.dialog.confirm(langData['siteConfig'][30][88], function(){                 //该手机号码已经注册过会员，确定要将该手机号码绑定到当前登陆账号吗？<br>确定后原账号将解除手机绑定，确认进入下一步？
								changeUidByPhone = data.info;
								//弹出验证码
								if (geetest == 1) {
									captchaVerifyFun.config.captchaObjReg.verify();
								} else if(geetest == 2){
									$('#codeButton').click()
								}else{
									getPhoneVerify();
								}
							}, function(){
								modifyPop.close();
							})
						}else{
							//弹出验证码
							if (geetest == 1) {
								captchaVerifyFun.config.captchaObjReg.verify();
							} else if(geetest == 2){
								$('#codeButton').click()
							}else{
								getPhoneVerify();
							}
						}
					}
				}
			})
		}
	}

	var wait = 60;
	function countDown(t) {
		if (wait == 0) {
			t.removeClass("disabled");
			t.html(langData['siteConfig'][6][184]);  //重新获取验证码
			wait = 60;
		} else {
			t.addClass("disabled");
			t.html(langData['siteConfig'][20][234].replace('1', wait));  //1秒后可重新获取
			wait--;
			setTimeout(function() {
				countDown(t)
			}, 1000);
		}
	}

	//绑定手机
	$("#chphone").bind("click", function(){
		modifyFun(langData['siteConfig'][3][7], "chphoneAdd", "chphone", 500, langData['siteConfig'][6][60], function(){
			//手机认证-----提交认证
			var phone = $("#phone"), vdimgck = $("#vdimgck");
			return "areaCode="+$(".areaCodeBox .code").text()+"&phone="+phone.val()+"&vdimgck="+vdimgck.val()+"&changeUidByPhone="+changeUidByPhone;
		}, function(){
			var phone = $("#phone"), vdimgck = $("#vdimgck");
			if($.trim(phone.val()) == "" || !checkPhone(phone.val())){
				popTip(langData['siteConfig'][20][232], "error");//请输入正确的手机号码
				phone.focus();
				return "false";
			}
			if($.trim(vdimgck.val()) == ""){
				popTip(langData['siteConfig'][20][28], "error");//请输入短信验证码
				vdimgck.focus();
				return "false";
			}
		});
	});

	//修改手机号码
	$("#chphoneEdit").bind("click", function(){
		opera = "changePhone";
		authentication(bindPhoneUrl);
	});

	//解绑手机号码
	$("#chphoneDel").bind("click", function(){
		opera = "changePhone";
		authentication(pageUrl);
	});


	//绑定邮箱
	var memeryEmailData = "";
	$("#chemail").bind("click", function(){
		modifyFun(langData['siteConfig'][3][10], "chemailAdd", "chemail", 500, langData['siteConfig'][6][32], function(){
			var email = $("#email");
			data = "email="+email.val();
			memeryEmailData = data;
			return data;
		}, function(){
			var email = $("#email");
			if($.trim(email.val()) == "" || !checkEmail(email.val())){
				popTip(langData['siteConfig'][20][57], "error");
				email.focus();
				return "false";
			}
		});
	});

	//修改邮箱
	$("#chEmailEdit").bind("click", function(){
		opera = "changeEmail";
		authentication(bindEmailUrl);
	});

	//解绑邮箱
	$("#chEmailDel").bind("click", function(){
		opera = "changeEmail";
		authentication(pageUrl);
	});

	//重新发送
	$("html").delegate("#sendAgain", "click", function(){
		if(memeryEmailData != ""){
			var t = $(this);

			t.html(langData['siteConfig'][6][184]+"...");
			$.ajax({
				url: masterDomain+"/include/ajax.php?service=member&action=updateAccount&do=chemail",
				data: memeryEmailData,
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						t.html(langData['siteConfig'][20][298]);
					}
				}
			});
			modifyFun(langData['siteConfig'][3][10], "chemailAdd", "chemail", 500, langData['siteConfig'][6][32], function(){return memeryEmailData;}, null);
		}else{
			alert(langData['siteConfig'][20][578]);
			location.reload();
		}
	});

	$("html").delegate(".sel select", "change", function(){
		var selVal = $(this).val(), label = $(this).siblings("label"), input = $(this).parent().next("input");
		input.val(selVal == langData['siteConfig'][7][2] ? "" : selVal);
		label.html(selVal+"<s></s>");
	});

	//设置安全保护问题
	$("#question").bind("click", function(){
		modifyFun(langData['siteConfig'][19][213], "questionAdd", "question", 500, langData['siteConfig'][6][128], function(){
			var q1 = $("#q1"), q2 = $("#q2"), answer = $("#answer");
			data = "q1="+q1.val()+"&q2="+q2.val()+"&answer="+answer.val();
			return data;
		}, function(){
			var q1 = $("#q1"), q2 = $("#q2"), answer = $("#answer");
			if($.trim(q1.val()) == ""){
				popTip(langData['siteConfig'][20][576], "error");
				return "false";
			}
			if($.trim(q2.val()) == ""){
				popTip(langData['siteConfig'][20][577], "error");
				return "false";
			}
			if($.trim(answer.val()) == ""){
				popTip(langData['siteConfig'][20][62], "error");
				answer.focus();
				return "false";
			}
		});
	});

	//修改安全保护问题
	$("#chQuestionEdit").bind("click", function(){
		opera = "changeQuestion";
		authentication(bindQuestionUrl);
	});

	//重置安全保护问题
	$("#chQuestionDel").bind("click", function(){
		opera = "changeQuestion";
		authentication(pageUrl);
	});

/***************************20210508新增s************************************/
	// 密码输入

	$("html").delegate(".editForm.newEditForm .pwdInp input", "click", function(e){
		var t = $(this);
		var pwd = $.trim($(".pwdInp").siblings('input').val());
		$(".pwdInp li").each(function(){
			if($(this).find('input').val()==''){
				$(this).find('input').focus();
				return false;
			}else{
				$(".pwdInp li").eq(pwd.length - 1).find('input').focus()
			}

		});
		e.stopPropagation()
	});



	$("html").delegate(".editForm.newEditForm .pwdInp input", "input", function(){
		var t = $(this), li = t.closest('li');
		t.val(t.val().replace(/[^\d]/g,''))
		if(t.val() != ''){
			li.next('li').find('input').focus()
		}

		var paypwd = []
		$(".pwdInp li").each(function(){
			paypwd.push($(this).find('input').val())
		});
		$("#new,#confirm,#pay2,#pay1").val(paypwd.join(''))
		// console.log(paypwd.join(''))
	});

	// 监听键盘
	$("html").delegate(".editForm.newEditForm .pwdInp input", "keydown", function(e){
			var t = $(this), li = t.closest('li');
		if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40){
			return false;
		}
		if(e.keyCode == 8){
			$(this).val('');
			setTimeout(function(){
				li.prev('li').find('input').focus();
			},100)
		}
		if(t.val() != ''){
			li.next('li').find('input').focus()
		}

		var paypwd = []
		$(".pwdInp li").each(function(){
			paypwd.push($(this).find('input').val())
		});
		$("#new,#confirm,#pay2,#pay1").val(paypwd.join(''))
	})


	/***************************20210508新增e************************************/
	//异步提交修改
	function modifyFun(title, editForm, type, width, btn, param, func){
		var button = btn == false ? null : [{
					id: "okBtn",
					name: btn,
					callback: function(){

						if(func() == "false") return false;
						var t = this;
						var data = param();

						t.button({
							id:'okBtn',
							name:langData['siteConfig'][7][8]+'...',
							disabled: true
						});

						$.ajax({
							url: masterDomain+"/include/ajax.php?service=member&action=updateAccount&do="+type,
							data: data,
							type: "POST",
							dataType: "jsonp",
							success: function (data) {
								if(data && data.state == 100){
									t.button({
										id:'okBtn',
										name:langData['siteConfig'][20][244],
										disabled: true
									});

									//绑定邮箱提示
									if(type == "chemail"){

										$(".edit-tip, .ui_buttons").hide();
										t.content('<div class="bindSuccess">'+data.info+'<br /><br /><small>'+langData['siteConfig'][20][20]+'<br />1. '+langData['siteConfig'][20][573]+'<br />2. '+langData['siteConfig'][20][574]+'【<a href="javascript:;" id="sendAgain">'+langData['siteConfig'][6][55]+'</a>】<br />3. '+langData['siteConfig'][20][575]+' <a href="javascript:;" onclick="javascript:location.reload();">'+langData['siteConfig'][6][182]+'</a></small></div>');

									}else{
										popTip(data.info, "success");
										setTimeout(function(){
											modifyPop.close();
											location.href = pageUrl;
										}, 1000);
									}
								}else{
									popTip(data.info, "error");
									t.button({
										id:'okBtn',
										name: btn,
										disabled: false
									});
								}
							}
						});

						return false;
					},
					focus: true
				}]
		modifyPop = $.dialog({
			id: "modifyPop",
			fixed: true,
			title: title,
			content: $("#"+editForm).html(),
			width: width,
			button: button
		});
	}

	function popTip(txt, cla){
		$(".edit-tip").removeClass().addClass("edit-tip "+cla);
		$(".edit-tip p").html(txt);
	}


	//确定身份验证方式
	$("html").delegate(".authenticated li", "click", function(){
		var t = $(this), index = t.index(),par_con = t.closest('.ui_state_lock');
		$(".authenticated, .footer-tip").hide();
		$(".authlist, .authlist .item:eq("+index+"),.ui_state_focus .ui_buttons").fadeIn(300);
		if(par_con.find(".anotherWay").size() == 0){
			par_con.find(".ui_buttons").prepend('<a href="javascript:;" class="anotherWay">&laquo; '+langData['siteConfig'][20][97]+'</a>');
		}

		//短信验证
		if(t.hasClass("p")){

			verifyType = "authPhone";

			//验证脚本
			verifyFunc = function(){
				var vdimgck = $("#vdimgck");
				if($.trim(vdimgck.val()) == ""){
					popTip(langData['siteConfig'][20][28], "error");
					vdimgck.focus();
					return "false";
				}
			};

			//传送数据
			verifyData = function(){
				return "vdimgck="+$("#vdimgck").val();
			};

		//邮箱验证
		}else if(t.hasClass("e")){

			verifyType = "authEmail";

			//验证脚本
			verifyFunc = function(){
				var vdimgck = $("#vdimgckEmail");
				if($.trim(vdimgck.val()) == ""){
					popTip(langData['siteConfig'][20][236], "error");
					vdimgck.focus();
					return "false";
				}
			};

			//传送数据
			verifyData = function(){
				return "vdimgck="+$("#vdimgckEmail").val();
			};

		//安全保护问题
		}else if(t.hasClass("q")){

			verifyType = "authQuestion";

			//验证脚本
			verifyFunc = function(){
				var answer = $("#answer");
				if($.trim(answer.val()) == ""){
					popTip(langData['siteConfig'][20][102], "error");
					answer.focus();
					return "false";
				}
			};

			//传送数据
			verifyData = function(){
				return "answer="+$("#answer").val();
			};

		}

	});

	//短信验证
	$("html").delegate("#getPhoneAuthVerify", "click", function(){
		var t = $(this);

		if(t.hasClass("disabled")) return false;
		t.addClass("disabled");
		t.html('<img src="'+staticPath+'images/loading_16.gif" /> '+langData['siteConfig'][7][3]+'...');

		popTip(langData['siteConfig'][20][101], "");

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=auth",
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				//获取成功
				if(data && data.state == 100){
					countDown(t);

				//获取失败
				}else{
					t.removeClass("disabled").html(langData['siteConfig'][4][4]);
					popTip(data.info, "error");
					alert(data.info);
				}
			}
		});

		$("#vdimgck").focus();
	});

	//邮箱验证
	$("html").delegate("#getEmailAuthVerify", "click", function(){
		var t = $(this);

		if(t.hasClass("disabled")) return false;
		t.addClass("disabled");
		t.html('<img src="'+staticPath+'images/loading_16.gif" /> '+langData['siteConfig'][7][3]+'...');

		popTip(langData['siteConfig'][20][100], "");

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=siteConfig&action=getEmailVerify&type=auth",
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				//获取成功
				if(data && data.state == 100){
					countDown(t);

				//获取失败
				}else{
					t.removeClass("disabled").html(langData['siteConfig'][4][4]);
					popTip(data.info, "error");
					alert(data.info);
				}
			}
		});

		$("#vdimgck").focus();
	});

	//选择其它方式验证
	$("html").delegate(".anotherWay", "click", function(){
		 //popTip(langData['siteConfig'][20][92], "");
		//$(".authenticated, .footer-tip").fadeIn(300);
		if($(".authlist .item").size() == 1){
			$('.ui_close').click();
			$(".authlist, .authlist .item, .ui_state_focus .ui_buttons").hide();
			$(this).remove();
			$('#paypwdEdit').click();
		}else{
			$(".authenticated, .footer-tip").fadeIn(300);
			$(this).remove();
			$(".ldg_lockmask").show()
			$(" .authlist, .authlist .item,.ui_state_focus .ui_buttons").hide()
		}
	});


	//验证身份信息
	function authentication(url){
		if(phoneCheck == 1 || emailCheck == 1 || questionSet == 1){

			returnUrl = url;
			authVerifyFun();
			$(".ui_state_focus .ui_buttons").hide();

		}else{
			$.dialog.alert(langData['siteConfig'][20][235]);
		}
	}

	//异步提交修改
	function authVerifyFun(){
		var button = [{
					id: "okBtn",
					name: langData['siteConfig'][6][32],
					callback: function(){

						if(verifyFunc() == "false") return false;
						var t = this;

						t.button({
							id:'okBtn',
							name:langData['siteConfig'][7][8]+'...',
							disabled: true
						});

						$.ajax({
							url: masterDomain+"/include/ajax.php?service=member&action=authentication&do="+verifyType+"&opera="+opera,
							data: verifyData(),
							type: "POST",
							dataType: "jsonp",
							success: function (data) {
								if(data && data.state == 100){
									t.button({
										id:'okBtn',
										name:langData['siteConfig'][20][244],
										disabled: true
									});

									popTip(data.info, "success");
									setTimeout(function(){
										authVerifyPop.close();
										location.href = returnUrl;
									}, 1000);

								}else{
									popTip(data.info, "error");
									t.button({
										id:'okBtn',
										name: langData['siteConfig'][6][32],
										disabled: false
									});
								}
							}
						});

						return false;
					},
					focus: true
				}]
		var authVerifyPop = $.dialog({
			id: "authVerifyPop",
			fixed: true,
			title: langData['siteConfig'][20][91],
			content: $("#authentication").html(),
			width: 500,
			button: button
		});
	}


});


//上传成功接收
function uploadSuccess(obj, file, filetype, path, data){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<img src="'+path+'" />');
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();

    if(obj == 'front' && data.idcardname){
        $('#realname').val(data.idcardname);
    }
    if(obj == 'front' && data.idcardno){
        $('#idcard').val(data.idcardno);
    }

	if(obj == "license"){
		$("#"+obj).siblings(".spic").find(".reupload").show();
	}
}

//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "siteConfig",
		type: "delCard",
		picpath: b,
		randoms: Math.random()
	};
	$.ajax({
		type: "POST",
		cache: false,
		async: d,
		url: "/include/upload.inc.php",
		dataType: "json",
		data: $.param(g),
		success: function(a) {
			try {
				c(a)
			} catch(b) {}
		}
	})
}
