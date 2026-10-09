$(function(){

	var modifyPop = null;
	var changeUidByPhone = '';
	var interval = [200, 400, 600, 800, 1000];
	var i = 0, score = 100;
	var testing = $(".testing"), percentage = testing.find(".percentage"), progress = testing.find(".progress");
	var verifyFunc = verifyType = verifyData = opera = returnUrl = null;
	var title = testing.find("h5");
	var p1 = progress.find(".p1"),
			p2 = progress.find(".p2"),
			p3 = progress.find(".p3"),
			p4 = progress.find(".p4"),
			p5 = progress.find(".p5");

	// if(doget != ""){
	// 	setPercentage(rating, 1);
	// 	$(".list ul").show();
	// 	setTimeout(function(){
	// 		//查看等待审核中的企业认证资料
	// 		if(doget == "chCertify" && (certifyState == 3 || certifyState == 1)){
	// 			$("#shCertify").click();
	// 		}else{ 
	// 			$("#"+doget).click();
	// 		}
	// 	}, 1);
	// }else{
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
					title.html(langData['siteConfig'][20][562]);
				}
			}
		});
	// }

	function animation(data){
		var term = setTimeout(function(){
			if(i < interval.length){
				clearTimeout(term);
				if(i == 0){
					title.html(langData['siteConfig'][27][123]);
					if(data.paypwd == "ok"){
						p1.addClass("ok");
					}else{
						p1.addClass("fail");
						$(".paypwd").addClass("fail");
						score -= 20;
					}
					$(".paypwd").fadeIn();
				}else if(i == 1){
					title.html(langData['siteConfig'][20][564]);
					if(data.licenseState == "ok"){
						p2.addClass("ok");
					}else{
						p2.addClass("fail");
						$(".certify").addClass("fail");
						score -= 20;
					}
					$(".certify").fadeIn();
				}else if(i == 2){
					title.html(langData['siteConfig'][20][565]);
					if(data.phoneCheck == "ok"){
						p3.addClass("ok");
					}else{
						p3.addClass("fail");
						$(".mobile").addClass("fail");
						score -= 20;
					}
					$(".mobile").fadeIn();
				}else if(i == 3){
					title.html(langData['siteConfig'][20][566]);
					if(data.emailCheck == "ok"){
						p4.addClass("ok");
					}else{
						p4.addClass("fail");
						$(".email").addClass("fail");
						score -= 20;
					}
					$(".email").fadeIn();
				}else if(i == 4){
					title.html(langData['siteConfig'][20][567]);
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
				txt = langData['siteConfig'][13][2];
			}else if(num <= 40){
				percentage.removeClass().addClass("percentage complete l3");
				// testing.find(".suc-tip").html("<font color='#de0202'>您的帐户存在严重安全隐患，强烈建议您立即升级！<br />友情提示：升级您的帐户信息将享受安全的在线支付服务以及方便查看和管理账户支出和收入</font>").show();
				cla = "de0202";
				txt = langData['siteConfig'][13][3];
			}else{
				percentage.removeClass().addClass("percentage complete l1");
				// testing.find(".suc-tip").html("<font color='#008e11'>恭喜您，您已获得全面的安全保障<br />温馨建议：在账号日常操作中注意密码等安全信息的保护，切勿泄露</font>").show();
				cla = "008e11";
				txt = langData['siteConfig'][13][1];
			}
			title.html(langData['siteConfig'][15][6]+"：<strong style='color: #"+cla+"'>"+txt+"</strong>");
			$(".checkSecure").show();
		}
	}

	$("html").delegate(".editForm input", "focus", function(){
		$(this).closest("dl").addClass("focus");
	});

	$("html").delegate(".editForm input", "blur", function(){
		$(this).closest("dl").removeClass("focus");
	});

	//修改登录密码
	$("#chpassword").bind("click", function(){
		modifyFun(langData['siteConfig'][5][19], "chpasswordEdit", "password", 500, langData['siteConfig'][6][181], function(){
			var old = $("#old"), newest = $("#new"), confirm = $("#confirm");
			return "old="+old.val()+"&new="+newest.val()+"&confirm="+confirm.val();
		}, function(){
			var old = $("#old"), newest = $("#new"), confirm = $("#confirm"), passwordStrengthDiv = $("#passwordStrengthDiv").attr("class");
			if(old.size() > 0 && $.trim(old.val()) == ""){
				popTip(langData['siteConfig'][20][240], "error");
				old.focus();
				return "false";
			}
			if($.trim(newest.val()) == ""){
				popTip(langData['siteConfig'][20][84], "error");
				newest.focus();
				return "false";
			}
			if(passwordStrengthDiv == "" || passwordStrengthDiv == undefined || Number(passwordStrengthDiv.replace("is", "")) < 50){
				popTip(langData['siteConfig'][20][241], "error");
				newest.focus();
				return "false";
			}
			if($.trim(confirm.val()) == ""){
				popTip(langData['siteConfig'][20][569], "error");
				confirm.focus();
				return "false";
			}
			if(newest.val() != confirm.val()){
				popTip(langData['siteConfig'][20][242], "error");
				confirm.focus();
				return "false";
			}
		});

		$(".editForm #new").passwordStrength();
	});

	//设置支付密码
	$("#paypwdAdd").bind("click", function(){
		modifyFun(langData['siteConfig'][6][120], "chpaypwdAdd", "paypwdAdd", 500, langData['siteConfig'][6][128], function(){
			var pay1 = $("#pay1"), pay2 = $("#pay2");
			return "pay1="+pay1.val()+"&pay2="+pay2.val();
		}, function(){
			var pay1 = $("#pay1"), pay2 = $("#pay2"), passwordStrengthDiv = $("#passwordStrengthDiv").attr("class");
			if($.trim(pay1.val()) == ""){
				popTip(langData['siteConfig'][20][213], "error");
				pay1.focus();
				return "false";
			}
			if(passwordStrengthDiv == "" || passwordStrengthDiv == undefined || Number(passwordStrengthDiv.replace("is", "")) < 50){
				popTip(langData['siteConfig'][20][241], "error");
				pay1.focus();
				return "false";
			}
			if($.trim(pay2.val()) == ""){
				popTip(langData['siteConfig'][20][570], "error");
				pay2.focus();
				return "false";
			}
			if(pay1.val() != pay2.val()){
				popTip(langData['siteConfig'][20][242], "error");
				pay2.focus();
				return "false";
			}
		});

		$(".editForm #pay1").passwordStrength();
	});

	//修改支付密码
	$("#paypwdEdit").bind("click", function(){
		modifyFun(langData['siteConfig'][5][20], "chpaypwdEdit", "paypwdEdit", 500, langData['siteConfig'][6][128], function(){
			var old = $("#old"), newpay = $("#new"), confirm = $("#confirm");
			return "old="+old.val()+"&new="+newpay.val()+"&confirm="+confirm.val();
		}, function(){
			var old = $("#old"), newpay = $("#new"), confirm = $("#confirm"), passwordStrengthDiv = $("#passwordStrengthDiv").attr("class");
			if($.trim(old.val()) == ""){
				popTip(langData['siteConfig'][20][571], "error");
				old.focus();
				return "false";
			}
			if($.trim(newpay.val()) == ""){
				popTip(langData['siteConfig'][20][572], "error");
				newpay.focus();
				return "false";
			}
			if(passwordStrengthDiv == "" || passwordStrengthDiv == undefined || Number(passwordStrengthDiv.replace("is", "")) < 50){
				popTip(langData['siteConfig'][20][241], "error");
				newpay.focus();
				return "false";
			}
			if($.trim(confirm.val()) == ""){
				popTip(langData['siteConfig'][20][570], "error");
				confirm.focus();
				return "false";
			}
			if(newpay.val() != confirm.val()){
				popTip(langData['siteConfig'][20][242], "error");
				confirm.focus();
				return "false";
			}
		});

		$(".editForm #new").passwordStrength();
	});

	//重置支付密码
	$("#paypwdReset").bind("click", function(){
		opera = "paypwd";
		authentication(bindPaypwdUrl);
	});



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

	//企业认证
	$("#chCertify").bind("click", function(){
		modifyFun(langData['siteConfig'][26][79], "chCertifyAdd", "certify", 590, langData['siteConfig'][6][60], function(){
			var realname = $("#realname"), idcard = $("#idcard"), front = $("#front"), back = $("#back"), license = $("#license");
			return "realname="+realname.val()+"&idcard="+idcard.val()+"&front="+front.val()+"&back="+back.val()+"&license="+license.val();
		}, function(){
			var realname = $("#realname"), idcard = $("#idcard"), front = $("#front"), back = $("#back"), license = $("#license");
			if($.trim(realname.val()) == ""){
				popTip(langData['siteConfig'][20][248], "error");
				realname.focus();
				return "false";
			}
			if($.trim(idcard.val()) == ""){
				popTip(langData['siteConfig'][20][106], "error");
				idcard.focus();
				return "false";
			}
			if(!checkIdcard(idcard.val())){
				popTip(langData['siteConfig'][27][124], "error");
				idcard.focus();
				return "false";
			}
			if($.trim(front.val()) == ""){
				popTip(langData['siteConfig'][20][107], "error");
				return "false";
			}
			if($.trim(back.val()) == ""){
				popTip(langData['siteConfig'][20][108], "error");
				return "false";
			}
			if($.trim(license.val()) == ""){
				popTip(langData['siteConfig'][20][109], "error");
				return "false";
			}
		});

		$(".cardUpload .spic").hover(function(){
			$(this).find(".reupload").show();
		}, function(){
			$(this).find(".reupload").hide();
		});

	});

	//查看企业认证资料
	var certifyData = null;
	$("#shCertify").bind("click", function(){
		modifyFun(langData['siteConfig'][26][180], "chCertify", "certify", 590, false);

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
						alert(langData['siteConfig'][20][250]);
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
			alert(langData['siteConfig'][20][250]);
		}
	}


	//获取短信验证码
	$("html").delegate("#getPhoneVerify", "click", function(){
		var t = $(this), areaCode = $("#areaCode"), phone = $("#phone");

		if(t.hasClass("disabled")) return false;
		if(areaCode.val() == ''){
			popTip(langData['siteConfig'][20][134], "error");
		}
		if(!checkPhone(phone.val())){
			popTip(langData['siteConfig'][20][232], "error");
			phone.focus();
		}else{

			t.addClass("disabled");
			t.html('<img src="'+staticPath+'images/loading_16.gif" /> '+langData['siteConfig'][7][3]+'...');

			popTip(langData['siteConfig'][20][101], "");

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
							$.dialog.confirm(langData['siteConfig'][30][88], function(){//该手机号码已经注册过会员，确定要将该手机号码绑定到当前登陆账号吗？<br>确定后原账号将解除手机绑定，确认进入下一步？
								changeUidByPhone = data.info;
								getPhoneVerify();
							}, function(){
								modifyPop.close();
							})
						}else{
							getPhoneVerify();
						}
					}
				}
			})
		}
	});

	var wait = 60;
	function countDown(t) {
		if (wait == 0) {
			t.removeClass("disabled");
			t.html(langData['siteConfig'][4][2]);
			wait = 60;
		} else {
			t.addClass("disabled");
			t.html(langData['siteConfig'][20][234].replace('1', wait));
			wait--;
			setTimeout(function() {
				countDown(t)
			}, 1000);
		}
	}

	//绑定手机
	$("#chphone").bind("click", function(){
		modifyFun(langData['siteConfig'][3][7], "chphoneAdd", "chphone", 500, langData['siteConfig'][6][60], function(){
			var phone = $("#phone"), vdimgck = $("#vdimgck");
			return "areaCode="+$(".areaCodeBox .code").text()+"&phone="+phone.val()+"&vdimgck="+vdimgck.val()+"&changeUidByPhone="+changeUidByPhone;
		}, function(){
			var phone = $("#phone"), vdimgck = $("#vdimgck");
			if($.trim(phone.val()) == "" || !checkPhone(phone.val())){
				popTip(langData['siteConfig'][20][232], "error");
				phone.focus();
				return "false";
			}
			if($.trim(vdimgck.val()) == ""){
				popTip(langData['siteConfig'][20][28], "error");
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
				popTip(langData['siteConfig'][21][57], "error");
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

			t.html(langData['siteConfig'][6][183]+"...");
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
				popTip(langData['siteConfig'][20][233], "error");
				return "false";
			}
			if($.trim(q2.val()) == ""){
				popTip(langData['siteConfig'][20][233].replace("1", "2"), "error");
				return "false";
			}
			if($.trim(answer.val()) == ""){
				popTip(langData['siteConfig'][21][62], "error");
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
		var t = $(this), index = t.index();
		$(".authenticated, .footer-tip").hide();
		$(".authlist, .authlist .item:eq("+index+"), .ui_buttons").fadeIn(300);
		$(".ui_buttons").prepend('<a href="javascript:;" class="anotherWay">&laquo; '+langData['siteConfig'][20][97]+'</a>');

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

	function getPhoneVerify(){
		var t = $("#getPhoneVerify"), areaCode = $("#areaCode"), phone = $("#phone");

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=verify",
			data: "areaCode="+areaCode.val()+"&phone="+phone.val(),
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
	}

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
		popTip(langData['siteConfig'][20][98], "");
		$(".authenticated, .footer-tip").fadeIn(300);
		$(".authlist, .authlist .item, .ui_buttons").hide();
		$(this).remove();
	});


	//验证身份信息
	function authentication(url){
		if(phoneCheck == 1 || emailCheck == 1 || questionSet == 1){

			returnUrl = url;
			authVerifyFun();
			$(".ui_buttons").hide();

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
		//国际手机号获取
	
	function getNationalPhone(){
		$.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
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
	$('body').delegate('.areaCode','click', function(){
		getNationalPhone();
		var areaWrap =$(this).closest("dd").find('.areaCode_wrap');
		if(areaWrap.is(':visible')){
			areaWrap.fadeOut(300)
		}else{
			areaWrap.fadeIn(300);
			return false;
		}
	});

	//选择区号
	$('body').delegate('.areaCode_wrap li', 'click', function(){
		var t = $(this), code = t.attr('data-code');
		var par = t.closest("dd");
		var areaIcode = par.find(".areaCode");
		areaIcode.find('i').html('+' + code);
		par.find('#areaCode').val(code)
	});

	$('body').bind('click', function(){
		$('.areaCode_wrap').fadeOut(300);
	});

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
