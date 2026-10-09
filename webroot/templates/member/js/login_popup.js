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
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.area').hide();
                        //手机注册
                        $('.telbox input#ftel').css('width','299px');

                        $('.telbox input#rtel').css('width','299px');
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li>'+list[i].name+'<span class="fn-right">+'+list[i].code+'</span></li>');
                   }
                   $('.telbox ul.select-content').append(phoneList.join(''));
                }else{
                   $('.telbox ul.select-content').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul.select-content').html('<div class="loading">加载失败！</div>');
                }

        })
    }

	var typeCount = 3;

	var zindex = 1000, showTip = function(obj, state, txt){
		var error = obj.closest('.login_right').find('.error');
		error.text(txt);
	};

	var mtimer = null;

	//如果在iframe页面则去除margin值以及背景色
	if(top.location != location){
		$(".login-pup").css({"margin": "0 auto"});
		$("html").css({"background": "none"});

		var height = $(".login-pup").height();
		height = height == 0 ? 350 : height;

		$("<div>")
			.attr("id", "site_iframe")
			.html('<iframe scrolling="no" src="'+site+'/loginFrame.html?v='+Math.random()+'#height_'+height+'" frameborder="0" allowtransparency="true" style="display: none;" class="iframeHeight"></iframe>')
			.appendTo("body");
	};

	$("#close").bind("click", function(){
		if(top.location != location){
			$(".login-pup").remove();
			$("#site_iframe iframe").attr("src", site+"/loginFrame.html?v=" + Math.random() + "#close_1");
		}else{
			top.location.href = redirectUrl;
		}
		clearInterval(mtimer);
	});

	//验证是否已经登录
	if($("#isLogin").html() == 1){
		if(top.location != location){
			$("#site_iframe iframe").attr("src", site+"/loginFrame.html?v=" + Math.random() + "#success_1");
		}else{
			location.href = redirectUrl;
		}
	}

	// 手机注册选择区号
	$('.telbox .area').click(function(){
		var box = $(this).closest('.telbox');
		if (box.hasClass('open')) {
			box.removeClass('open');
		}else {
			box.addClass('open');
		}
		return false;
	})
	$('.telbox .select-content').delegate('li','click',function(){
		var t = $(this), number = t.find('span').text(), parent = t.closest('.register_right');
		if (!parent.hasClass('fwdBox')) {
			areaCode1 = number.replace('+', '')
		}else {
			areaCode2 = number.replace('+', '')
		}
		parent.find('.area').text(number);
		$('#areaCode1').val(areaCode1);
		$('#areaCode2').val(areaCode2);
		t.addClass('select-selected').siblings('li').removeClass('select-selected');
	})

	$('body').click(function(){
		$('.telbox').removeClass('open');
	})

	// 手机注册获取验证码
	var geetestData = "";

	//发送验证码
	function sendVerCode(captchaVerifyParam,callback){
		var b = $('.getpwd'+typeCount), v = $('.username'+typeCount).val();
		let param = '';
		if(captchaVerifyParam && geetest == 2){
		param = param + '&geetest_challenge=' + captchaVerifyParam
		}else if(geetest == 1 && captchaVerifyParam){
		param = param +  captchaVerifyParam
		}
		if(vdimgck.username(typeCount)){

				var action = typeCount == 2 ? "getEmailVerify" : "getPhoneVerify";
				var dataName = typeCount == 2 ? "email" : "phone";
				var registform = typeCount == 2 ? "register-telBox" : "register-emailBox"

				var areaCode1 = $('#areaCode1').val();
				var areaCode2 = $('#areaCode2').val();
				// $("#areaCode1").val(areaCode1);

			if(typeCount != 1){
				$.ajax({
					url: masterDomain+"/include/ajax.php?service=siteConfig&action="+action,
					data: $("#"+registform+"").serialize()+"&"+dataName+"="+v+"&type=signup"+param+'&areaCode='+areaCode1,
					type: "POST",
					dataType: "jsonp",
					success: function (data) {
						if(callback){
							callback(data)
						  }
						//获取成功
						if(data && data.state == 100){
							var time = new Date().getTime();
							b.addClass('disabled');
							countDown(60,b);
							info(typeCount,v);

						//获取失败
						}else{
							if(data.info != '图形验证错误，请重试！'){
								alert(data.info);
							  }
						}
					},
					error: function(){
						alert(langData['siteConfig'][20][173]);   //网络错误，发送失败！
					}
				});

			// 找回密码
			}else {
				$.ajax({
          url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify",
          data: $(".form-horizontal").serialize()+'&type=fpwd'+param+'&areaCode='+areaCode2,
          type: "POST",
          dataType: "jsonp",
          success: function (data) {
			if(callback){
                callback(data)
              }
            //获取成功
            if(data && data.state == 100){
							a.addClass('disabled');
              countDown(60, a);

            //获取失败
            }else{
              // a.removeClass("disabled").html("获取验证码");
              if(data.info != '图形验证错误，请重试！'){
				alert(data.info);
			  }
            }
          }
        });
			}
		}
	}


	//是否使用极验验证码
	var sendvdimgckBtn;

	if(geetest){

	
	captchaVerifyFun.initCaptcha('web','#codeButton',sendVerCode)	
	$("html").delegate(".getPhoneVerify", "click", function(){
        var t = $(this), phone = $("#ftel");
        if(t.hasClass("disabled")) return false;
        if(vdimgck.username(1)){
			$('.error').text("");
			sendvdimgckBtn = t;
			//弹出验证码
			if (geetest == 1) {
				captchaVerifyFun.config.captchaObjReg.verify();
			} else {
				$('#codeButton').click()
			}
		}
      });
	$(document).on('click','.getpwd',function(){
		var a = $(this), b = $('.getpwd'+typeCount), v = $('.username'+typeCount).val();
		if (a.hasClass('disabled')) {return;}
		if(vdimgck.username(typeCount)){
			$('.error').text("");
			sendvdimgckBtn = a;
			if (geetest == 1) {
				captchaVerifyFun.config.captchaObjReg.verify();
			} else {
				$('#codeButton').click()
			}
		}
	});
	}



	// 发送验证码
	if(!geetest){
		$(document).on('click','.getpwd',function(){
			if ($(this).hasClass('disabled')) {return;}
			sendVerCode();
		})

		$("html").delegate(".getPhoneVerify", "click", function(){
			var t = $(this), phone = $("#ftel");
			if(t.hasClass("disabled")) return false;
			if(vdimgck.username(1)){
				$('.error').text("");
				sendvdimgckBtn = t;
				sendVerCode();
			}
		});
	}

	function info(typeCount,v){
		var t = typeCount == 2 ? langData['siteConfig'][3][0] : langData['siteConfig'][23][112];   //邮箱--手机
	}


	var vdimgck = {
		username : function(){
			var o = $('.username'+typeCount),v = o.val(),e = o.closest('.inpbox').siblings('.error');
			if(typeCount == 3){
				if(v == ''){
					$('#registerBox .error').text(langData['waimai'][3][84]);//纵向排列
					return false;
				}else{
					return true;
				}
			}
			if(typeCount == 2){
				if(v == ''){
					$('#registerBox .error').text(langData['siteConfig'][20][538]);   //请填写您的邮箱
					return false;
				}else{
					var reg = !!v.match(/^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/);
					if(!reg) {
						$('#registerBox .error').text(langData['siteConfig'][20][319]);  //邮箱有误
						return false;
					}else{
						return true;
					}
				}
			}
			if (typeCount == 1) {
				if(v == ''){
					$('#fwdBox .error').text(langData['waimai'][3][84]);    //纵向排列
					return false;
				}else{
					return true;
				}
			}
		},
		password : function(){
			var o = $('.password'+typeCount),v = o.val(),e = o.closest('.inpbox').siblings('.error');
			if(v == ''){
				$('#registerBox .error').text(langData['siteConfig'][20][502]);  //请填写密码
				return false;
			}else{
				var o2 = $('.repassword'+typeCount),v2 = o2.val(),e2 = o2.closest('.inpbox').siblings('.error');
				if(v2 == ''){
					$('#registerBox .error').text(langData['siteConfig'][20][539]);//请填写确认密码
					return false;
				}else{
					if(v != v2){
						$('#registerBox .error').text(langData['siteConfig'][20][381]);//两次密码不一致
						return false;
					}else{
						return true;
					}
				}
			}
		},
		yzm : function(){
			var o = $('.yzm'+typeCount),v = o.val(),e = o.closest('.inpbox').siblings('.error');
			if (typeCount == 1) {
				if(v == ''){
					$('#fwdBox .error').text(langData['siteConfig'][20][540]);  //请填写验证码
					return false;
				}else{
					return true;
				}
			}else {
				if(v == ''){
					$('#registerBox .error').text(langData['siteConfig'][20][540]);  //请填写验证码
					return false;
				}else{
					return true;
				}
			}
		}
	}

	// 注册提交
	$('#registerBox .login-btn').click(function(e){
		e.preventDefault();

		var btn = $(this), regform = $('#registerBox');
		regform.find('.error').text('');

		var tj = true;

		//邮箱、手机
		if(vdimgck.username() && vdimgck.yzm() && vdimgck.password()){

			var data = [];
			data.push('mtype=1');
			data.push('rtype='+typeCount);
			data.push('rtype='+typeCount);
			if(typeCount == 3){
				data.push("areaCode="+$("#areaCode1").val());
			}
			data.push('account='+$('.username'+typeCount).val());
			data.push('password='+$('.password'+typeCount).val());

			data.push('vcode='+$('.yzm'+typeCount).val());

		}else{
			tj = false;
		}


		if(!tj) return false;
		btn.attr("disabled", true).val(langData['siteConfig'][6][35]+"...");   //提交中

		//异步提交
		$.ajax({
			url: masterDomain+"/registerCheck_v1.html",
			data: data.join("&"),
			type: "POST",
			dataType: "html",
			success: function (data) {

				var dataArr = data.split("|");
					var info = dataArr[1];
					if(data.indexOf("100|") > -1){
						$("body").append('<div style="display:none;">'+data+'</div>');
						if(top.location != location){
							$("#site_iframe iframe").attr("src", site+"/loginFrame.html?v=" + Math.random() + "#success_1");
						}else{
							top.location.href = redirectUrl;
						}

					}else{
						alert(info.replace(new RegExp('<br />','gm'),'\n'));
					}
					btn.attr("disabled", false).val(langData['siteConfig'][6][118]);   //重新提交

			},
			error: function(){
				alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
				btn.attr("disabled", false).val(langData['siteConfig'][6][118]);   //重新提交
			}
		});
		return false;

	})

	// 找回密码提交新密码
	$("#fwdBox .login-btn").click(function(){
		var t = $(this), tj = true;

		if(t.hasClass("disabled")) return false;

		var password = $('#fwdpass'), repassword = $("#fconfirmpass");
		if (password.val() == "") {
			$('#fwdBox .error').text(langData['siteConfig'][20][502]);    //请填写密码
			return false;
		}
		if (repassword.val() == "") {
			$('#fwdBox .error').text(langData['siteConfig'][20][539]);  //请填写确认密码
			return false;
		}
		if (password.val() != repassword.val()) {
			$('#fwdBox .error').text(langData['siteConfig'][20][381]); //两次密码不一致
			return false;
		}

		if(!geetest || (geetest && typeCount == 1)){
      var t = $(this), tj = true;

      if(typeCount == 1){
        if(!vdimgck.username(1)){
          tj = false;
          return false;
        }
        if(!vdimgck.yzm(1)){
          tj = false;
          return false;
        }
      }

      if(!tj) return false;

			t.addClass("disabled").html(langData['siteConfig'][7][1]+"...");   //请稍候

      //异步提交
      $.ajax({
        url: masterDomain+"/include/ajax.php?service=member&action=backpassword&type=2",
        data: $(".form-horizontal").serialize(),
        type: "POST",
        dataType: "jsonp",
        success: function (data) {
          if(data){

            if(data.state == 100){
              $("#data").val();
							var dataVal = data.info.split("data=")[1];

							$.ajax({
									url: masterDomain+"/include/ajax.php?service=member&action=resetpwd&data="+dataVal+"&npwd="+password.val(),
									type: "post",
									dataType: "jsonp",
									success: function (data) {
										if(data){

											if(data.state == 100){

												$('.success-pop').show();
												$('.mask').addClass('show');

												setTimeout(function(){
													if(top.location != location){
														$("#site_iframe iframe").attr("src", site+"/loginFrame.html?v=" + Math.random() + "#success_1");
													}else{
														top.location.href = redirectUrl;
													}
												}, 1000);

											}else{
												alert(data.info);
												t.removeClass("disabled").html(langData['siteConfig'][6][0]);   //确认
											}

										}else{
											alert(langData['siteConfig'][20][180]);  //提交失败，请重试！
											t.removeClass("disabled").html(langData['siteConfig'][6][0]);  //确认 
										}
									}
								});

              // location.href = data.info;
            }else{
              alert(data.info);
							return false;
            }

          }else{
            alert(langData['siteConfig'][20][180]);   //提交失败，请重试！
            t.removeClass("disabled").html(langData['siteConfig'][6][118]);  //重新提交
          }
        }
      });

    }

	})

	// 点击登录层出现
	$('.gotoLogin').click(function(){
		$('.login_right').hide();
		$('#loginBox').show();
	})

	// 点击注册层出现
	$('.register-btn').click(function(){
		$('.login_right').hide();
		$('#registerBox').show();
		typeCount = 3;

		var height = $(".login-pup").height();
		height = height == 0 ? 350 : height;
		$("#site_iframe iframe").attr("src", site+"/loginFrame.html?v=" + Math.random() + "#height_"+height);
	})

	// 忘记密码弹出层出现
	$('#pwdbtn').click(function(){
		$('.login_right').hide();
		$('#fwdBox').show();
		typeCount = 1;

		var height = $(".login-pup").height();
		height = height == 0 ? 350 : height;
		$("#site_iframe iframe").attr("src", site+"/loginFrame.html?v=" + Math.random() + "#height_"+height);
	})

	// 扫描二维码
	$('.codebtn').click(function(){
		var t = $(this), code = $('.codeBox');
		$(window.frames["code_iframe"].document).find("html").css('padding', '0');
		$(window.frames["code_iframe"].document).find(".codeBox").css('padding', '4px 12px');
		$(window.frames["code_iframe"].document).find("#qrcode").css('margin', '5px auto 0');
		if (code.css('display') == 'none') {
			code.show();
			t.addClass('show');
		}else {
			code.hide();
			t.removeClass('show');
		}
	})

	//倒计时（开始时间、结束时间、显示容器）
	function countDown(time, obj, func){
		obj.text(langData['siteConfig'][20][5].replace('1', time));   //1s后重新发送
		mtimer = setInterval(function(){
			obj.text(langData['siteConfig'][20][5].replace('1', (--time)));  //1s后重新发送
			if(time <= 0) {
				clearInterval(mtimer);
				obj.text(langData['siteConfig'][4][1]).removeClass('disabled');   //验证码
			}
		}, 1000);
	}

	//第三方登录
	// $(".login-other li a").click(function(e){
	// 	e.preventDefault();
	// 	var href = $(this).attr("href"), type = href.split("type=")[1];
	// 	loginWindow = window.open(href, 'oauthLogin', 'height=565, width=720, left=100, top=100, toolbar=no, menubar=no, scrollbars=no, status=no, location=yes, resizable=yes');

	// 	var i = 0;
	// 	// 判断窗口是否关闭
	// 	mtimer = setInterval(function(){
	// 		// if(loginWindow.closed){
	// 		// 	clearInterval(mtimer);
	// 		// 	huoniao.checkLogin(function(){
	// 		// 		if(top.location != location){
	// 		// 			$("#site_iframe iframe").attr("src", site+"/loginFrame.html?v=" + Math.random() + "#success_1");
	// 		// 		}else{
	// 		// 			location.href = redirectUrl;
	// 		// 		}
	// 		// 	});
	// 		// }
	// 		if($.cookie(cookiePre+"connect_uid") && $.cookie(cookiePre+"connect_code") == type){
	// 			loginWindow.close();
	// 			var modal = '<div id="loginconnectInfo"><div class="mask"></div> <div class="layer"> <p class="layer-tit"><span>温馨提示</span></p> <p class="layer-con">为了您的账户安全，请绑定您的手机号<br /><em class="layer_time">3</em>s后自动跳转</p> <p class="layer-btn"><a href="'+masterDomain+'/bindMobile.html?type='+type+'">前往绑定</a></p> </div></div>';

	// 			$("#loginconnectInfo").remove();
	// 			$('body').append(modal);

	// 			var t = 3;
	// 			var timer = setInterval(function(){
	// 				if(t == 1){
	// 					clearTimeout(timer);
	// 					// if(top.location != location){
	// 					// 	$("#site_iframe iframe").attr("src", site+"/loginFrame.html?v=" + Math.random() + "#success_1");
	// 					// }else{
	// 					// 	top.location.href = redirectUrl;
	// 					// }
	// 					top.location.href = masterDomain+'/bindMobile.html?type='+type;
	// 				}else{
	// 					$(".layer_time").text(--t);
	// 				}
	// 			},1000)
	// 		}else{
	// 			if(loginWindow.closed){
	// 				clearInterval(mtimer);
	// 				huoniao.checkLogin(function(){
	// 					location.reload();
	// 				});
	// 			}
	// 		}

	// 	}, 1000);
	// });

	// 手机、邮箱注册切换
	$('#registerBox .login-tab span').click(function(){
		var t = $(this), type = t.attr('data-type');
		t.addClass('active').siblings('span').removeClass('active');
		$('#register-'+type).show().siblings().hide();
		typeCount = type == 'telBox' ? 3 : 2;
		$('#registerBox .error').text('');
	})

	//注册、找回密码
	$("#regbtn, #pwdbtn").bind("click", function(event){
		var href = $(this).attr("href");
		if(top.location == location){
			event.preventDefault();
			location.href = href;
		}
	});

	//表单占位符
	$("#loginForm li span").bind("click", function(){
		var t = $(this);
		t.hide();
		t.prev("input").focus();
	});

	//表单聚焦时状态
	$("#loginForm li input").bind("focus", function(){
		var t = $(this), id = t.attr("id");
		t.next("span").hide();
		t.removeClass("error").addClass("focus");
		$("#"+id+"_Tip").remove();
	});

	//表单失去焦点时状态
	$("#loginForm li input").bind("blur", function(){
		var t = $(this), id = t.attr("id");
		if($.trim(t.val()) == ""){
			t.next("span").show();

			if(id == "loginuser"){
				showTip($("#loginuser"), "error", langData['siteConfig'][20][166]);   //请输入手机号/邮箱
			}else if(id == "loginpass"){
				showTip($("#loginpass"), "error", langData['siteConfig'][20][164]);  //请输入密码
			}else if(id == "logincode"){
				showTip($("#logincode"), "tip", langData['siteConfig'][20][176]);  //请输入验证码
			}
		}else{
			if(id == "loginpass" && !/^.{5,}$/.test($.trim($("#loginpass").val()))){
				showTip($("#loginpass"), "error", langData['siteConfig'][21][103]);  //密码长度最少为5位！
			}else{
				t.removeClass("err");
			}
		}
		t.removeClass("focus");
	});

	//更新验证码
	var verifycode = $("#verifycode").attr("src");
	$("#verifycode").bind("click", function(){
		$(this).attr("src", verifycode+"?v="+Math.random());
	});

	setTimeout(function(){
		var loginuser = $("#loginuser"),
				loginpass = $("#loginpass");
		if($.trim(loginuser.val()) != ""){
			loginuser.next("span").hide();
			loginpass.next("span").hide();
		}
	}, 100);

	//回车提交
	$("#loginForm input").keyup(function (e) {
		if (!e) {
			var e = window.event;
		}
		var code = 0;
		if (e.keyCode) {
			code = e.keyCode;
		}else if (e.which) {
			code = e.which;
		}
		if (code === 13) {
			$("#submitLogin").click();
		}
	});

	//提交
	$("#submitLogin").bind("click", function(){
		var t = $(this),
				loginuser = $("#loginuser"),
				loginpass = $("#loginpass"),
				logincode = $("#logincode"),
				data = [];

		if(t.hasClass("disabled")) return false;

		if($.trim(loginuser.val()) == ""){
			showTip(loginuser, "error", langData['siteConfig'][20][166]);  //请输入手机号/邮箱
			return false;
		}

		if($.trim(loginpass.val()) == ""){
			showTip(loginpass, "error", langData['siteConfig'][20][164]);  //请输入密码
			return false;
		}

		if(!/^.{5,}$/.test($.trim(loginpass.val())) && $.trim(loginpass.val()) != ""){
			showTip(loginpass, "error", langData['siteConfig'][21][103]);   //密码长度最少为5位！
			return false;
		}

		if(logincode && $.trim(logincode.val()) == "" && logincode.val() != undefined){
			showTip(logincode, "tip", langData['siteConfig'][20][176]);    //请输入验证码
			return false;
		}

		data.push("username="+loginuser.val());
		data.push("password="+loginpass.val());
		if(logincode.val() != undefined){
			data.push("vericode="+logincode.val());
		}

		t.addClass("disabled").html(langData['siteConfig'][2][5]+"...");  //登录中

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
						t.html(langData['siteConfig'][21][0]);  //登录成功！
						if(top.location != location){
							$("#site_iframe iframe").attr("src", site+"/loginFrame.html?v=" + Math.random() + "#success_1");
						}else{
							top.location.href = redirectUrl;
						}
					}else if(data.indexOf("201") > -1){
						var data = data.split("|");
						showTip($("#loginuser"), "error", data[1]);
						t.removeClass("disabled").html(langData['siteConfig'][2][0]);  //登录
					}else if(data.indexOf("202") > -1){
						var data = data.split("|");
						showTip($("#logincode"), "error", data[1]);
						t.removeClass("disabled").html(langData['siteConfig'][2][0]);  //登录
					}
				}else{
					alert(langData['siteConfig'][20][167]);
					t.removeClass("disabled").html(langData['siteConfig'][2][0]);  //登录
				}
			}
		});
		return false;

	});
});
