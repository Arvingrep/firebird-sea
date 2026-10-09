
new Vue({
    el:'#login_page',
    data:{
        areacode:86,
        phoneCheck:phoneCheck == '1' ? true : false, // 是否绑定过手机
        phone:'' , //要绑定的手机号
        vercode:'', //验证码
        hasBindUid:'', // 要绑定的手机号 之前绑定过的账号
        hasCheckInfo:false, //修改绑定手机号时 是否验证过用户信息
        oldPhone:oldPhone, // 绑定过的手机号
        checkVerCode:'',  //解绑手机号的验证码
    },
    mounted(){
        var tt = this;
        // 极验相关
		if(geetest){
			tt.$nextTick(() => {
                captchaVerifyFun.initCaptcha('h5','#codeButton',tt.sendVerCode)
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

        // 获取短信验证码
		getPhoneMsg:function(vertype){
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
                if(t.phoneCheck){
                    //弹出验证码
                    if (geetest == 1) {
                        captchaVerifyFun.config.captchaObjReg.verify();
                    } else {
                        $("#codeButton").click()
                    }
                }else{
                    t.checkPhoneBind();
                }
			}

			// 不需要极验
			if(!geetest ){
                if(vertype != 'checkInfo'){
                    t.checkPhoneBind();

                }else{
                    t.sendVerCode()
                }
    
			}
		},

        // 极验
		// handlerPopupReg:function(captchaObjReg){
		// 	// 成功的回调
		// 	var t = this;
		// 	captchaObjReg.onSuccess(function () {
		// 		var validate = captchaObjReg.getValidate();
		// 		t.dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;
        //         if(!t.phoneCheck){

        //             t.checkPhoneBind($('.getCode'));
        //         }else{
        //             t.sendVerCode($('.getCode'),'auth')
        //         }

		// 	});
		// 	captchaObjReg.onClose(function () {
		// 	})

		// 	window.captchaObjReg = captchaObjReg;
		// },

        // 验证当前用户的信息
        checkUserInfo(verifyType){
            // 验证成功之后 ，修改phoneCheck的值
            var tt = this;
            if(tt.hasCheckInfo){
                tt.phoneCheck = false;
            }else{
                // 此处接口验证
                if(!tt.checkVerCode){
                    showErrAlert('请输入验证码');
                    return false;
                }
                var opera = '',param = '';
                if(verifyType == 'authPhone'){
                    opera = 'changePhone';
                    param = "vdimgck=" + tt.checkVerCode
                }
                var el = event.currentTarget;
                if($(el).hasClass('disabled')) return false;
                $(el).addClass('disabled');
                // .text('验证中...')
                $.ajax({
                    url: "/include/ajax.php?service=member&action=authentication&do="+verifyType+"&opera="+opera,
                    data: param,
                    type: "POST",
                    dataType: "jsonp",
                    success: function (data) {
                      $(el).removeClass('disabled');
                    //   .text('立即绑定')
                      if(data && data.state == 100){
                        showErrAlert('验证成功')
                        tt.phoneCheck = false;
                        tt.checkUserInfo = true;
          
                      }else{
                        showErrAlert(data.info);
          
                      }
                    },

                    error:function(){
                        $(el).removeClass('disabled').text('下一步')
                        showErrAlert(data.info)
                    }
                  });
            }
        },

        // 验证该手机是否绑定过其他账号
        checkPhoneBind(btn){
            var tt = this;
          
            $.ajax({
				url: "/include/ajax.php?service=siteConfig&action=checkPhoneBindState&phone="+tt.phone,
				type: "GET",
				dataType: "json",
				success: function (data) {
                    if(data.state == 100){
                        // tt.sendVerCode('','verify')
                        //弹出验证码
                        if (geetest == 1) {
                            captchaVerifyFun.config.captchaObjReg.verify();
                        } else if(geetest == 2){
                            $("#codeButton").click()
                        }else{
                            tt.sendVerCode('','verify')
                        }
                    }else{
                        tt.hasBindId = data.info;
                    }
				},
				error: function(){
					btn.removeClass("noclick").text(langData['siteConfig'][4][1]);  //获取验证码
					showErrAlert(langData['siteConfig'][20][173]);  //网络错误，发送失败！
				}
			});
        },

        // 发送验证码
		// sendVerCode :function(btn,vertype){
		sendVerCode :function(captchaVerifyParam,callback){
			var t = this;
            let btn = $(".getCode")
			btn.addClass('noclick');
			var phone = $("#phone").val();
            if(phone.includes('****')){
                phone = t.phone || oldPhone
            }
			var areacode = $("#codeChoose").val() || '86';

			var param = "phone="+phone +"&areaCode="+areacode;
            var vertype = !t.phoneCheck ?  'verify': 'auth'

            if(captchaVerifyParam && geetest == 2){
                param = param + '&geetest_challenge=' + captchaVerifyParam
              }else if(geetest == 1 && captchaVerifyParam){
                param = param +  captchaVerifyParam
              }
			$.ajax({
				url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&type="+vertype,
				data: param,
				type: "GET",
				dataType: "json",
				success: function (data) {
                    if(callback && typeof(callback) != 'string'){
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

        // 绑定手机号
        bindPhone(type){
            var tt = this;
            if(!tt.phone){
                showErrAlert('请输入绑定的手机号')
                return false;
            }
            if(!tt.vercode){
                showErrAlert('请输入验证码')
                return false;
            }

            if(areacode == "86"){
				var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;
				if(!phoneReg.test(tt.phone)){
					showErrAlert(langData['siteConfig'][20][465]);   //手机号码格式不正确
					return false;
				}
			}
            if(type == 'chphone'){
                param = '&phone='+tt.phone + '&vdimgck=' + tt.vercode + "&changeUidByPhone=" + tt.hasBindUid 
            }

            var el = event.currentTarget;
            var btn = $(el)
            var btnstr = btn.text();
            $.ajax({
                url: "/include/ajax.php?service=member&action=updateAccount&do="+type,
                data: param,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                  if(data && data.state == 100){
                      if(type == 'chemail'){
                          showErrAlert(data.info+"\n"+langData['siteConfig'][20][237]);
                          btn.removeClass('disabled').html(langData['siteConfig'][6][55]);
                          return;
                      }
                      showErrAlert(data.info);

                      setTimeout(function(){
                        //小程序端后退
                        if(wx_miniprogram){
                            wx.miniProgram.navigateBack();
                        }
                        else{

                            //APP端后退
                            if(device.indexOf('huoniao_iOS') > -1){
                                setupWebViewJavascriptBridge(function (bridge) {
                                    bridge.callHandler("goBack", {}, function(responseData){});
                                });
                            }
                            else{
                                if(document.referrer){
                                    window.location.href=document.referrer; //返回上一页
                                }else{
                                    //回到上个页面
                                    history.go(-1);
                                }
                            }

                        }
                        },1500)
                  }else{
                    showErrAlert(data.info);
                    btn.removeClass('disabled').text(btnstr);
                  }
                },
                error: function(){
                  alert(langData['siteConfig'][20][183]);
                  btn.removeClass('disbaled').text(btnstr);
                }
              })
        },
    }
})