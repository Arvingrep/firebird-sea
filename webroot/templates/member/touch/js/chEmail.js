
new Vue({
    el:'#login_page',
    data:{
        areacode:86,
        emailCheck:emailCheck == '1' ? true : false, // 是否绑定过邮箱
        email:'' , //要绑定的手机号
        vercode:'', //验证码
        hasBindUid:'', // 要绑定的手机号 之前绑定过的账号
        hasCheckInfo:false, //修改绑定手机号时 是否验证过用户信息
        oldPhone:oldPhone, // 绑定过的手机号
        checkVerCode:'',  //解绑手机号/邮箱号的验证码
        checkby:1,  //验证方式
    },
    mounted(){
        var tt = this;
         // 极验相关
		if(geetest && phoneCheck=='1'){ //绑定过手机号的才可以手机验证
			captchaVerifyFun.initCaptcha('h5','#codeButton',tt.sendVerCode)
		}
    },
    methods:{
        

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
			if (geetest && captchaObjReg) {
				captchaObjReg.verify();
			}

			// 不需要极验
			if(!geetest ){
                t.sendVerCode()
    
			}
		},

        // 极验
		handlerPopupReg:function(captchaObjReg){
			// 成功的回调
			var t = this;
			captchaObjReg.onSuccess(function () {
				var validate = captchaObjReg.getValidate();
				t.dataGeetest = "&terminal=mobile&geetest_challenge="+validate.geetest_challenge+"&geetest_validate="+validate.geetest_validate+"&geetest_seccode="+validate.geetest_seccode;
                t.sendVerCode()

			});
			captchaObjReg.onClose(function () {
			})

			window.captchaObjReg = captchaObjReg;
		},

        // 验证当前用户的信息
        checkUserInfo(){
            // 验证成功之后 ，修改phoneCheck的值
            var tt = this;
            if(tt.hasCheckInfo){
                tt.phoneCheck = false;
            }else{
                var opera = '',param = '';
                opera = 'changeEmail'
                verifyType = tt.checkby == 2 ? 'authPhone' : 'authEmail'
                if(!tt.checkVerCode){
                    showErrAlert('请输入验证码');
                    return false;
                }
                var el = event.currentTarget;
                if($(el).hasClass('disabled')) return false;
                $(el).addClass('disabled').text('验证中...')
                param = "vdimgck=" + tt.checkVerCode
                $.ajax({
                    url: "/include/ajax.php?service=member&action=authentication&do="+verifyType+"&opera="+opera,
                    data: param,
                    type: "POST",
                    dataType: "jsonp",
                    success: function (data) {
                      if(data && data.state == 100){
                        $(el).removeClass('disabled').text('立即绑定')
                        showErrAlert('验证成功')
                        tt.emailCheck = false;
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

  

    // 发送验证码
		sendVerCode :function(captchaVerifyParam,callback){
			var t = this;
            let btn = $('.getCode'),vertype = 'auth';
			btn.addClass('noclick');

			var param = "phone="+oldPhone +"&areaCode="+areacode + t.dataGeetest;
            // var vertype = vertype ? vertype : 'verify'
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

        // 绑定邮箱号
        bindEmail(type){
            var tt = this;
            if(!tt.email){
                showErrAlert('请输入绑定的手机号')
                return false;
            }
           
           
            if(type == 'chemail'){
                param = '&email='+tt.email 
            }

            var el = event.currentTarget;
            var btn = $(el)
            var btnstr = btn.text();

            var popOptions = {
                noSure:true,
                title:'请确认邮箱',
                btnCancel:'我知道了',
                isShow: true,
                btnCancelColor:'#FF4621 '
            }
            
           
            $.ajax({
                url: "/include/ajax.php?service=member&action=updateAccount&do="+type,
                data: param,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                  if(data && data.state == 100){
                      if(type == 'chemail'){
                          btn.removeClass('disabled').html(langData['siteConfig'][6][55]);
                          popOptions.title = data.info+"\n"+langData['siteConfig'][20][237]
                          confirmPop(popOptions)
                          return;
                      }
                     
                  }else{
                    showErrAlert(data.info);
                    btn.removeClass('disabled').text(btnstr);
                  }
                },
                error: function(){
                  showErrAlert(langData['siteConfig'][20][183]);
                  btn.removeClass('disbaled').text(btnstr);
                }
              })
        },

        // 获取邮箱验证码
        getEmailMsg(){
            var tt = this;
            var el = event.currentTarget;
            if($(el).hasClass("noClick")) return false;
            $(el).addClass("noClick");
            $(el).html('<img src="'+staticPath+'images/loading_16.gif" /> '+langData['siteConfig'][7][3]+'...');
            $.ajax({
                url: "/include/ajax.php?service=siteConfig&action=getEmailVerify&type=auth",
                type: "POST",
                dataType: "json",
                success: function (data) {
                    //获取成功
                    if(data && data.state == 100){
                        tt.countDown(60,$(el));
                    //获取失败
                    }else{
                        $(el).removeClass("disabled").html(langData['siteConfig'][4][4]);
                        showErrAlert(data.info);
                    }
                }
            });
        },
    }
})