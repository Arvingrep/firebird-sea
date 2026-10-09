$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

    if(redirectUrl.indexOf('wmsj') > -1){
        $('.header .header-search a').addClass('notMenu');
    }

    var appSign = [];
    var isapp = 0;
    setTimeout(function(){
      //获取APP信息
      setupWebViewJavascriptBridge(function(bridge) {
        bridge.callHandler("getAppInfo", {}, function(responseData){
            isapp = 1;
            var data = JSON.parse(responseData);
            if(data.device && data.title && data.serial){
                appSign.push('deviceTitle='+data.title);
                appSign.push('deviceType='+data.device);
                appSign.push('deviceSerial='+data.serial);
            }
        });
      });
    }, 500);

    //手机号码一键登录
    $('.oneKeyLogin').bind('click', function(){
      setupWebViewJavascriptBridge(function(bridge) {
        bridge.callHandler("oneKeyLogin", {}, function(responseData){});
      });
    });

  var device = navigator.userAgent;
    //小程序不显示其他快捷登录
    if(window.__wxjs_environment == 'miniprogram'){
        $('.other_login li').hide();
        $('.other_login .wechat').show();
        setTimeout(function(){
          $('.othertype').show();
        }, 500);
    }else{
        var isbaidu = device.indexOf('swan-baiduboxapp') > -1 ; //百度小程序
        if(!isbaidu){
          $('.othertype').show();
        }
    }

  if (device.indexOf('huoniao_iOS') > -1) {
  	$('.header').addClass('padTop20');
  }

  // 文本框输入
  $('.inpbox input').focus(function(){
    var t = $(this), inpbox = t.closest('.inpbox');
    inpbox.addClass('focus');
  })
  $('.inpbox input').blur(function(){
    var t = $(this), inpbox = t.closest('.inpbox');
    inpbox.removeClass('focus');
  })

  $('.account_clear').click(function(){
    $('#account').val('');
  })
  // 记住密码
  $('.remember').click(function(){
    var t = $(this);
    if (t.hasClass('checked')) {
      t.removeClass('checked');
    }else {
      t.addClass('checked');
    }
  })
  // 密码可见
  $('.psw-show').click(function(){
    var t = $(this);
    if (t.hasClass('psw-hide')) {
      t.removeClass('psw-hide');
      $('#password').attr('type', 'password');
    }else {
      t.addClass('psw-hide');
      $('#password').attr('type', 'text');
    }
  })

  // 去掉手机号前的0
  // 部分用户名是以0开头的，这里的操作会影响用户名登录 by gz 20200115
  $('#account').blur(function(){
    // var username3 = $('#account').val();
    // $('#account').val(username3.replace(/\b(0+)/gi,""));
  })

    $('.smsLogin').bind('click', function(){
       if($('.litem:eq(0)').is(':visible')){
           $('.litem:eq(0)').hide();
           $('.litem:eq(1)').show();
           $(this).html(langData['siteConfig'][45][8]);//用户名密码登录
       }else{
           $('.litem:eq(1)').hide();
           $('.litem:eq(0)').show();
           $(this).html(langData['siteConfig'][41][24]);//短信验证码登录
       }
    });
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
                        $('.inpbox.phone dt').hide();
                        $('.sms .phone dd input').css({'border-radius':'1rem'});
                        return false;
                   }
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
    $(".sms .phone dt").click(function(){
        $('.layer').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer').delegate('li', 'click', function(){
        var t = $(this), txt = t.find('em').text();

        $(".sms .phone dt label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer, #popupReg-captcha-mobile').hide();
        $('.mask-code').removeClass('show');
    })




    var getYzmBtn = null;
    var dataGeetest = "";

    //发送验证码
    function sendVerCode(){
        var btn = getYzmBtn, form = btn.closest("form");
        var account = form.find("#phone");

        if(btn.hasClass("disabled")) return;
        btn.addClass("disabled").text(langData['siteConfig'][23][99]);

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=sms_login",
            data: form.serialize()+dataGeetest,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {

                $("#maskReg, #popupReg-captcha-mobile").removeClass("show");

                //获取成功
                if(data && data.state == 100){
                    countDown(60, btn);
                    //获取失败
                }else{
                    btn.removeClass("disabled").text(langData['siteConfig'][4][1]);
                    showMsg(data.info);
                }
            },
            error: function(){
                btn.removeClass("disabled").text(langData['siteConfig'][4][1]);
                showMsg(langData['siteConfig'][20][173]);
            }
        });
    }


    if(geetest){

        //极验验证
        var handlerPopupReg = function (captchaObjReg) {
            // captchaObjReg.appendTo("#popupReg-captcha-mobile");

            // 成功的回调
            captchaObjReg.onSuccess(function () {
                var validate = captchaObjReg.getValidate();
                dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;
                sendVerCode();
                // $("#maskReg, #popupReg-captcha-mobile, .gt_popup").removeClass("show");
            });
            captchaObjReg.onClose(function () {
                // getYzmBtn.text(langData['siteConfig'][4][1]);
            })

            window.captchaObjReg = captchaObjReg;
        };

        //获取验证码
        $('.vcode').click(function(){
            var t = $(this);
            getYzmBtn = t;

            if(t.hasClass("disabled")) return;

            var areaCode = $("#areaCode").val();
            var phone = $("#phone").val();
            if(phone == ''){
                showMsg(langData['siteConfig'][20][463]);//请输入手机号码
                return false;
            }

            if(areaCode == "86"){
    			var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
    			if(!phoneReg.test(phone)){
    				showMsg(langData['siteConfig'][20][465]);   //手机号码格式不正确
    				return false;
    			}
    		}

            if (captchaObjReg) {
                captchaObjReg.verify();
            }
        })

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=geetest&terminal=mobile&t=" + (new Date()).getTime(), // 加随机数防止缓存
            type: "get",
            dataType: "json",
            success: function (data) {
                initGeetest({
                    gt: data.gt,
                    challenge: data.challenge,
                    offline: !data.success,
                    new_captcha: true,
                    product: "bind",
                    width: '312px'
                }, handlerPopupReg);
            }
        });

    }

    if(!geetest){
        $('.vcode').click(function(){
            var t = $(this);
            getYzmBtn = t;

            if(t.hasClass("disabled")) return;

            var r = $('#phone').val();
            if(!r){
                showMsg(langData['siteConfig'][20][463]);//请输入手机号码
                return;
            }

            sendVerCode();
        })
    }




  // 登录验证
  $('.submit').click(function(){
    event.preventDefault();

    var t = $(this);
    if(t.hasClass('disabled')){return;};

    //普通登录
    if($('.litem:eq(0)').is(':visible')) {

        var tj = true;

        var account = $('#account').val(),
            password = $('#password').val(),
            vericode = $('.vericode').val();

        if (account == "") {
            showMsg(langData['siteConfig'][20][166]);
            tj = false;
        } else if (password == "") {
            showMsg(langData['siteConfig'][20][165]);
            tj = false;
        }

        if (!tj) {
            return false;
        }

        var data = [];
        data.push("username=" + account);
        data.push("password=" + password);
        if (vericode != undefined) {
            data.push("vericode=" + vericode);
        }
        if(appSign){
            data.push(appSign.join("&"));
        }

        $('.submit').prop("disabled", true).val(langData['siteConfig'][2][5] + '...');

        //异步提交
        $.ajax({
            url: "/loginCheck.html",
            data: data.join("&"),
            type: "POST",
            dataType: "html",
            success: function (data) {
                if (data) {
                    if (data.indexOf("100") > -1) {
                        $("body").append('<div style="display:none;">' + data + '</div>');

                        if (device.indexOf('huoniao') <= -1 && !isapp) {
                            top.location.href = decodeURIComponent(redirectUrl);
                        } else {
                            setupWebViewJavascriptBridge(function (bridge) {
                                if (redirectUrl.indexOf('wmsj') > -1) {
                                    bridge.callHandler('appLoginFinish', {'passport': userinfo.userid}, function () {
                                    });
                                    top.location.href = decodeURIComponent(redirectUrl);
                                } else {
                                    bridge.callHandler('appLoginFinish', {
                                        'passport': userinfo.userid,
                                        'username': userinfo.username,
                                        'nickname': userinfo.nickname,
                                        'userid_encode': userinfo.userid_encode,
                                        'cookiePre': userinfo.cookiePre,
                                        'photo': userinfo.photo,
                                        'dating_uid': userinfo.dating_uid
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


                    } else {
                        var data = data.split("|");
                        showMsg(data[1]);
                        $('#verifycode').click();
                        t.removeAttr("disabled").val(langData['siteConfig'][2][0]);
                    }
                } else {
                    showMsg(langData['siteConfig'][20][167] + '_3');
                    $('#verifycode').click();
                    t.removeAttr("disabled").val(langData['siteConfig'][2][0]);
                }
            },
            error: function () {
                showMsg(langData['siteConfig'][20][168] + '_4');
                $('#verifycode').click();
                t.removeAttr("disabled").val(langData['siteConfig'][2][0]);
            }
        });

    //短信验证码登录
    }else{
        var areaCode = $("#areaCode").val();
        var phone = $("#phone").val();
        var code = $("#vercode").val();
        var loginUrl = "/include/ajax.php?service=member&action=smsLogin&phone=" + phone + "&code=" + code + "&areaCode=" + areaCode;
        if(appSign){
            loginUrl += ('&' + appSign.join("&"));
        }
        if(phone == ''){
            showMsg(langData['siteConfig'][20][463]);//请输入手机号码
            return false;
        }

        if(areaCode == "86"){
			var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
			if(!phoneReg.test(phone)){
				showMsg(langData['siteConfig'][20][465]);   //手机号码格式不正确
				return false;
			}
		}

        if(code == ''){
            showMsg(langData['siteConfig'][20][28]);//请输入短信验证码
            return false;
        }

        $('.submit').prop("disabled", true).val(langData['siteConfig'][2][5] + '...');

        $.ajax({
            url: loginUrl,
            dataType: 'json',
            success: function (res) {
                if (res.state != 100) {
                    showMsg(res.info);
                    t.removeAttr("disabled").val(langData['siteConfig'][2][0]);
                }else{
                    userinfo = res.info;
                    if (device.indexOf('huoniao') <= -1) {
                        top.location.href = decodeURIComponent(redirectUrl);
                    } else {
                        setupWebViewJavascriptBridge(function (bridge) {
                            bridge.callHandler('appLoginFinish', {
                                'passport': userinfo.userid,
                                'username': userinfo.username,
                                'nickname': userinfo.nickname,
                                'userid_encode': userinfo.userid_encode,
                                'cookiePre': userinfo.cookiePre,
                                'photo': userinfo.photo,
                                'dating_uid': userinfo.dating_uid
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
            },
            error: function (res) {
                showMsg(langData['siteConfig'][20][168]);
                t.removeAttr("disabled").val(langData['siteConfig'][2][0]);
            }
        })
    }

  })



  	//客户端登录
    $(".other_login a").bind("click", function(event){

      if(device.indexOf('huoniao') > -1){
        var t = $(this), href = t.attr('href'), type = href.split("type=")[1];
        event.preventDefault();

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

                      	var param = "type="+action+"&action=appback&access_token="+access_token+"&openid="+openid+"&unionid="+unionid+"&"+(appSign.join("&"));
                        if(action == 'facebook'){
                        	param = "type="+action+"&action=appback&uid="+data.uid+"&iconurl="+encodeURIComponent(data.iconurl)+"&name="+data.name+"&"+(appSign.join("&"));
                        }

    					$('.submit').prop("disabled", true).val(langData['siteConfig'][2][5]+'...');

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
    										showMsg(langData['siteConfig'][20][167]);
    										$('.submit').prop("disabled", false).val(langData['siteConfig'][2][0]);
    									}
    								},
    								error: function(){
                                        showMsg('Error');
            							$('.submit').prop("disabled", false).val(langData['siteConfig'][2][0]);
    								}
    							});

    						},
    						error: function(){
    							showMsg(langData['siteConfig'][20][168]);
    							$('.submit').prop("disabled", false).val(langData['siteConfig'][2][0]);
    						}
    					});
    				}
    			});
    		});
      }

      if(wx_miniprogram){
        event.preventDefault();
        wx.miniProgram.navigateTo({url: '/pages/login/index?path=' + encodeURIComponent(decodeURIComponent(redirectUrl))});
        return false;
      }

	  if(qq_miniprogram){
        event.preventDefault();
        qq.miniProgram.navigateTo({url: '/pages/login/index?url=' + encodeURIComponent(decodeURIComponent(redirectUrl))});
        return false;
      }


    });


    if((device.indexOf('huoniao') > -1 || device.indexOf('Alipay') > -1) && alipay_app_login != false){
      $('.alipay').show();
    }


      //微信登录验证
  	$(".wechat").click(function(event){
  		if(!navigator.userAgent.toLowerCase().match(/micromessenger/) && navigator.userAgent.toLowerCase().match(/iphone|android/) && device.indexOf('huoniao') <= -1){
  			event.preventDefault();
  			alert(langData['siteConfig'][20][169]);
  		}
  	});


    // 消息提示
    function showMsg(msg, time, showbg){
        var time = time ? time : 2000;
        var sowbg = showbg !== undefined ? showbg : true;
        $('.dialog_msg').remove();

        var html = '<div class="dialog_msg'+(showbg ? ' dialog_top' : '')+'">';
        html += '<div class="box">'+msg+'</div>';
        html += sowbg ? '<div class="bg"></div>' : '';
        html += '</div>';
        $('body').append(html);
        setTimeout(function(){
            $('.dialog_msg').remove();
        }, time)
    }


    //倒计时（开始时间、结束时间、显示容器）
    var times = null;
    var countDown = function(time, obj, func){
        times = obj;
        obj.addClass("disabled").text(time+'s');
        mtimer = setInterval(function(){
            obj.text((--time)+'s');
            if(time <= 0) {
                clearInterval(mtimer);
                obj.removeClass('disabled').text(langData['siteConfig'][4][2]);
            }
        }, 1000);
    }


})
