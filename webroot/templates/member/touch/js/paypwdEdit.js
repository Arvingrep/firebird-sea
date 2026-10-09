var verifyFunc = verifyType = verifyData = opera = returnUrl = null;
var changeUidByPhone = '';

var pagePay = new Vue({
  el:'#pagePaypwd',
  data:{
    step:paypwdCheck?1:3, //步骤
    loading:false, //loading
    pwd:[], //密码
    areacode:areacode,
    paypwdCheck:paypwdCheck, //是否设置过密码
    phoneCheck:phoneCheck, //手机验证
    emailCheck:emailCheck, //邮箱验证
    showtype:((phoneCheck && emailCheck)|| (!phoneCheck && !emailCheck))?1:(emailCheck?0:1), //邮箱验证显示
		showvcode:false,
		dataGeetest:'',
    gobackUrl:false, //返回上一页url
  },
  mounted(){
    var tt = this;
    if(tt.step == 3){
      tt.showBoard()
    }

    if(tt.step == 2){
      tt.geeInit()
    }


    var currUrl = window.location.href;
    if(currUrl.indexOf('step=2')>-1){
      tt.step = 2;
      tt.gobackUrl = true;
    }
    // 输入密码
		$(".num_keyboard li:not(.nobg)").off('click').bind('click',function(e){
			var t = $(this),txt = t.text();
			if(tt.pwd.length <= 6){
				tt.pwd.push(txt);
			}
      // $(document).one('click',function(){
      //     console.log(11111)
      //     tt.hideBoard()
      // });
      // e.stopPropagation();  //停止事件传播

		});

  },

  methods:{
    // 显示弹出层
		showPop:function(){
			$(".pop_mask, .pop_agree").show();
		},

		// 隐藏弹出层
		hidePop:function(){
			$(".pop_mask, .pop_agree").hide();
		},
    // 检验原密码是否正确
    checkOldPwd:function(){
      var tt = this;
      if(tt.loading) return false;
      var oldpwd = $("#old").val();
      if(oldpwd==''){
        showErrAlert(langData['siteConfig'][20][83]); //请输入原密码
        return false;
      }


        // 以下验证原密码
      tt.step = 3;  //需要删除
      return false;

      tt.loading = true;

      axios({
				method: 'post',
				url: "checkpwd",
        data:param,
			})
			.then((response)=>{
        tt.loading = false;
        tt.step = 3;

      })
    },

    // 显示数字键盘
    showBoard:function(){
      $(".board_mask").show();
      $(".num_keyboard").css({'transform':'translateY(0)'});
    },
    // 隐藏数字键盘
    hideBoard:function(){
      $(".board_mask").hide();
      $(".num_keyboard").css({'transform':'translateY(100%)'});
      // tt.pwd = [];
    },

    //清除输入
		delNum:function(){
			var tt = this;
			tt.pwd.pop();
		},

    // 修改支付密码
    resetPwd:function(){
      var tt = this;
      if(tt.loading) return false;
      if(tt.pwd.length != 6){
        showErrAlert($langData['siteConfig'][56][7]); //请输入原密码
        return false;
      }
      tt.loading = true;
      param = "pay1="+tt.pwd.join('')+"&pay2="+tt.pwd.join('');
      tt.hideBoard();
      axios({
			method: 'post',
			url: "/include/ajax.php?service=member&action=updateAccount&do=paypwdAdd", // 加随机数防止缓存,
			data:param,
		})
		.then((response)=>{
			var data = response.data;
			tt.loading = false;
		if(data && data.state == 100){
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

        }
			})

    },

    /* 以下是邮箱手机相关 */
    // 极验初始化
    geeInit(){
      // 极验相关
      var tt = this;
  		if(geetest){
			captchaVerifyFun.initCaptcha('h5','#codeButton',tt.sendVerCode)	
  		}
    },

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
		// handlerPopupReg:function(captchaObjReg){
		// 	// 成功的回调
		// 	var t = this;
		// 	captchaObjReg.onSuccess(function () {
		// 		var validate = captchaObjReg.getValidate();
		// 		t.dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;

		// 		t.sendVerCode($('.phonecode .getCode'));


		// 	});
		// 	captchaObjReg.onClose(function () {
		// 	})

		// 	window.captchaObjReg = captchaObjReg;
		// },

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
				param = "phone="+phone +"&areaCode="+areacode + t.dataGeetest
			}else{
				var email = $("#email").val();
				param = "email="+email + t.dataGeetest
			}
			param = param + "&vericode=" + $("#vdimgck").val()
			if(captchaVerifyParam && geetest == 2){
                param = param + '&geetest_challenge=' + captchaVerifyParam
              }else if(geetest == 1 && captchaVerifyParam){
                param = param +  captchaVerifyParam
              }
			$.ajax({
				url: "/include/ajax.php?service=siteConfig&action="+action+"&type=auth",
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
			if (geetest && captchaObjReg) {
				captchaObjReg.verify();
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

    // 验证手机方式 重置支付密码
    change_by_phone:function(){
      var tt = this;
      opera = "paypwd";
      verifyType = "authPhone";
      // 验证
      verifyFunc = function(){
        var vdimgck = $("#vercode");
        if(vdimgck.val() == ""){
          showErrAlert(langData['siteConfig'][20][28]);
          vdimgck.focus();
          return 'false';
        }
      };
      //传送数据
     verifyData = function(){
       return "vdimgck="+ $("#vercode").val();
     };
  		tt.authentication(bindPaypwdUrl);
    },

    // 验证邮箱方式 重置支付密码
    change_by_email:function(){
      var tt = this;
      opera = "paypwd";
      verifyType = "authEmail";
        //验证脚本
      verifyFunc = function(){
        var vdimgck = $("#vercode");
        if(vdimgck.val() == ""){
          showErrAlert(langData['siteConfig'][20][236].replace('1', '6'),);
          vdimgck.focus();
          return "false";
        }
      };

      //传送数据
      verifyData = function(){
        return "vdimgck="+$("#vercode").val();
      };
      tt.authentication(bindPaypwdUrl);
    },

    // 验证身份
    authentication:function(url){
      var tt = this;
      if(phoneCheck == 1 || emailCheck == 1 || questionSet == 1){
  			returnUrl = url;
  			tt.authVerifyFun();
  			// $(".ui_buttons").hide();

  		}else{
  			showErrAlert(langData['siteConfig'][20][235]);
  		}
    },

    // 异步提交
    authVerifyFun:function(){
      var tt = this;
      if(tt.loading) return false;
      if(verifyFunc == null){
        showErrAlert(langData['siteConfig'][6][127]);
        return;
      }
      if(verifyFunc() == "false") return false;
      // console.log('进入')
      // return false;
      tt.loading = true;
      axios({
				method: 'post',
				url:  "/include/ajax.php?service=member&action=authentication&do="+verifyType+"&opera="+opera, // 加随机数防止缓存,
        data:verifyData(),
			})
			.then((response)=>{
				var data = response.data;
        tt.loading = false;
        if(data && data.state == 100){
          showErrAlert(data.info);
          setTimeout(function(){
            // location.href = returnUrl;
            tt.step = 3; //重置密码
          }, 1000);

        }else{
          showErrAlert(data.info);

        }
			})
    },

  },

  watch:{
    pwd:function(){
			var tt = this;
			if(tt.pwd.length == 6){  //密码输入6位
        $(".board_mask").hide();
			}else{
        $(".board_mask").show();
      }
		},
    step:function(){
      var tt = this;
      if(tt.step == 3){
        tt.showBoard();
      }else{
        tt.hideBoard();
        if(tt.step == 2){
          tt.geeInit()
        }
      }
    }
  }
})
