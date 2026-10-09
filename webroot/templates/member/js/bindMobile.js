$(function() {
	let clickBtn = ''
	var aid = $.cookie(cookiePre+"connect_uid");
	if(aid == undefined || aid == '' || aid == 0){
		location.href = masterDomain;
	}

    //第三方登录
    $(".loginconnect").click(function(e){
        e.preventDefault();

        var href = $(this).attr("href"), type = href.split("type=")[1];
        loginWindow = window.open(href, 'oauthLogin', 'height=565, width=720, left=100, top=100, toolbar=no, menubar=no, scrollbars=no, status=no, location=yes, resizable=yes');

        //判断窗口是否关闭
        mtimer = setInterval(function(){
          if(loginWindow.closed){
            $.cookie(cookiePre+"connect_uid", null, {expires: -10, domain: masterDomain.replace("http://www", ""), path: '/'});
            clearInterval(mtimer);
            huoniao.checkLogin(function(){
              location.reload();
            });
          }else{
            if($.cookie(cookiePre+"connect_uid") && $.cookie(cookiePre+"connect_code") == type){
              loginWindow.close();
              var modal = '<div id="loginconnectInfo"><div class="mask"></div> <div class="layer"> <p class="layer-tit"><span>'+langData['siteConfig'][21][5]+'</span></p> <p class="layer-con">'+langData['siteConfig'][20][510]+'<br /><em class="layer_time">3</em>s'+langData['siteConfig'][23][97]+'</p> <p class="layer-btn"><a href="'+masterDomain+'/bindMobile.html?type='+type+'">'+langData['siteConfig'][23][98]+'</a></p> </div></div>';
              //温馨提示--排队编号--后自动跳转--前往绑定
              
              $("#loginconnectInfo").remove();
              $('body').append(modal);

              var t = 3;
              var timer = setInterval(function(){
                if(t == 1){
                  clearTimeout(timer);
                  location.href = masterDomain+'/bindMobile.html?type='+type;
                }else{
                  $(".layer_time").text(--t);
                }
              },1000)
            }
          }
        }, 1000);
    });
    //国际手机号获取
	getNationalPhone();
	function getNationalPhone(){
		$.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-role="item" class="ui-select-item" data-defaultselected="true" data-selected="true" data-disabled="false">'+list[i].name+'<span class="fn-right">'+list[i].code+'</span></li>');
                   }
                   $('.ui-select ul').append(phoneList.join(''));
                }else{
                   $('.ui-select ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                        $('.ui-select ul').html('<div class="loading">加载失败！</div>');
                    }

        })
	}


    var regform = $('.fpwdwrap');

    function showTip(obj, state, txt) {
        var error = obj.closest('.inpbox').siblings('.error');
        error.show().find('span').text(txt);
    }
    $('.tab-nav li').click(function() {
        var t = $(this),
            index = t.index();
        t.addClass('active').siblings('li').removeClass('active');
        $('.tab-pane .ftype').hide().eq(index).show();
    })


		var geetestData = "", verbtn;
		if(geetest){

			//极验验证
			var handlerPopup = function (captchaObj) {
				// captchaObj.appendTo("#popup-captcha");

				// 成功的回调
				captchaObj.onSuccess(function () {

					var result = captchaObj.getValidate();
					var geetest_challenge = result.geetest_challenge,
							geetest_validate = result.geetest_validate,
							geetest_seccode = result.geetest_seccode;

					geetestData = "&geetest_challenge="+geetest_challenge+'&geetest_validate='+geetest_validate+'&geetest_seccode='+geetest_seccode;

					sendPhoneCode();
				});


				


			};
			captchaVerifyFun.initCaptcha('h5','#codeButton',sendPhoneCode)
			$('.submit').click(function () {
				var t = $(this),
					step = t.closest('.form-step'),
					index = step.index();

				verbtn = t;

				// 获取验证码
				if (index == 0) {
					if (!verifyInput($("#phone"))) {
						tj = false;
						return false;
					} else {

						registAccountCheck(function () {
							var areaCode = $("#J-countryMobileCode label").text();
							$("#areaCode").val(areaCode);
							$(".input-tips span").text("+" + areaCode + $("#phone").val())

							t.addClass("disabled").text(langData['siteConfig'][23][99] + "...");   //正在发送

							if (geetest == 1) {
								captchaVerifyFun.config.captchaObjReg.verify();
							} else {
								$('#codeButton').click()
							}
						})

					}

					// 提交
				} else {

					if (!verifyInput($("#vcode"))) {
						tj = false;
						return false;
					}

					var time = new Date().getTime();
					var data = [];
					data.push('mtype=1');
					data.push('rtype=3');
					data.push('bindMobile=' + aid);
					data.push('account=' + $('#phone').val());
					data.push('areaCode=' + $('#areaCode').val());
					data.push('vcode=' + $('#vcode').val());
					data.push('code=' + $('#code').val());
					data.push('password=' + time.toString().substr(4, 6));
					//异步提交
					$.ajax({
						url: masterDomain + "/registerCheck_v1.html",
						data: data.join("&"),
						type: "POST",
						dataType: "html",
						success: function (data) {

							var dataArr = data.split("|");
							var info = dataArr[1];
							if (data.indexOf("100|") > -1) {
								$("body").append('<div style="display:none;">' + data + '</div>');
								top.location.href = userDomain;

							} else {
								alert(info.replace(new RegExp('<br />', 'gm'), '\n'));
							}
							t.attr("disabled", false).val(langData['siteConfig'][6][118]);  //重新提交

						},
						error: function () {
							alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
							t.attr("disabled", false).val(langData['siteConfig'][6][118]);  //重新提交
						}
					});


				}

			})

			// 重新发送
			$(".sendvdimgck0").click(function(){
					verbtn = $(this);
					if (geetest == 1) {
						captchaVerifyFun.config.captchaObjReg.verify();
					} else {
						$('#codeButton').click()
					}
			})


				

		}else{

	    $('.submit').click(function() {
	        var t = $(this),
	            step = t.closest('.form-step'),
	            index = step.index();
				verbtn = t;
	        // 获取验证码
	        if (index == 0) {
	            if (!verifyInput($("#phone"))) {
	                tj = false;
	                return false;
	            } else {

                registAccountCheck(function(){
  	            	var areaCode = $("#J-countryMobileCode label").text();
  	            	$("#areaCode").val(areaCode);
  	            	$(".input-tips span").text("+"+areaCode+$("#phone").val())

  	            	t.addClass("disabled").text(langData['siteConfig'][23][99]+"...");    //正在发送
					clickBtn = t;
  	            	sendPhoneCode();

                })

	            }

	        // 提交
	        } else {

	            if (!verifyInput($("#vcode"))) {
	                tj = false;
	                return false;
	            }

	            var time = new Date().getTime();
							var data = [];
				            data.push('mtype=1');
							data.push('rtype=3');
							data.push('bindMobile='+aid);
							data.push('account='+$('#phone').val());
							data.push('areaCode='+$('#areaCode').val());
							data.push('vcode='+$('#vcode').val());
							data.push('code='+$('#code').val());
							data.push('password='+time.toString().substr(4,6));
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
											top.location.href = userDomain;

										}else{
											alert(info.replace(new RegExp('<br />','gm'),'\n'));
										}
										t.attr("disabled", false).val(langData['siteConfig'][6][118]);     //重新提交

								},
								error: function(){
									alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
									t.attr("disabled", false).val(langData['siteConfig'][6][118]); //重新提交
								}
							});


	        }

	    })

			// 重新发送
	    $(".sendvdimgck0").click(function(){
			clickBtn = $(this)
	    	sendPhoneCode();
	    })

		}


	function sendPhoneCode(captchaVerifyParam,callback){
		$("#areaCode").val($("#J-countryMobileCode label").text());

    	var djs = $(".djs0"),
    		ftype = $('.ftype');
			let param = $(".registform").serialize()
			if(captchaVerifyParam && geetest == 2){
			  param = param + '&geetest_challenge=' + captchaVerifyParam
			}else if(geetest == 1 && captchaVerifyParam){
			  param = param +  captchaVerifyParam
			}
		let t = verbtn;

    	$.ajax({
			url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&from=bind&code="+$('#code').val(),
			data: param,
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(callback){
					callback(data)
				  }
				//获取成功
				if(data && data.state == 100){
					if(t && t.hasClass("submit")){
						$('.step0 li').addClass('active');
	        			ftype.find('.form-step:eq(0)').hide().next().show();
	        		}
        			countDown(60, djs, 0);
				//获取失败
				}else{
					if(t && t.hasClass("submit")){
						t.removeClass("disabled").text(langData['siteConfig'][6][32]);   //下一步
					}else if(t){
						t.removeClass("disabled").text(langData['siteConfig'][4][1]);     //获取验证码
					}
					alert(data.info);
				}
			},
			error: function(){
				t.removeClass("disabled").text(langData['siteConfig'][6][32]);   //下一步
				alert(langData['siteConfig'][20][173]);   //网络错误，发送失败！
			}
		});
	}


    regform.find('.inpbox input').focus(function() {
        $(this).closest('.inpbox').siblings('.error').hide();
    })
    var verifyInput = function(t) {
        var id = t.attr("id");
        t.removeClass("focus");
        if ($.trim(t.val()) == "") {
            t.next("span").show();
            if (id == "email") {
                showTip(t, "error", langData['siteConfig'][21][36]);   //请输入邮箱地址！
            } else if (id == "phone") {
                showTip(t, "error", langData['siteConfig'][20][463]); //请输入手机号码
            } else if (id == "vericode") {
                showTip(t, "error", langData['siteConfig'][20][176]); //请输入验证码
            } else if (id == "vcode") {
                showTip(t, "error", langData['siteConfig'][20][28]); //请输入短信验证码
            }
            return false;
        } else {
            if (id == "email" && !/^[a-z0-9]+([\+_\-\.]?[a-z0-9]+)*@([a-z0-9]+\.)+[a-z]{2,6}$/i.test($.trim(t.val()))) {
                showTip(t, "error", langData['siteConfig'][20][511]);   //邮箱格式错误！
                return false;
            } else if (id == "phone") {

            } else if (id == "vcode") {
                /*t.removeClass("err");
                $.ajax({
                    url: "/include/ajax.php?service=siteConfig&action=checkVdimgck&code=" + t.val(),
                    type: "GET",
                    dataType: "jsonp",
                    async: false,
                    success: function(data) {
                        if (data && data.state == 100) {
                            if (data.info == "error") {
                                t.addClass("err");
                                showTip(t, "error", "验证码输入错误，请重试！");
                                $("#verifycode").click();
                            }
                        }
                    }
                });*/
            } else {
                t.removeClass("err");
            }
        }
        return true;
    },
    emailMemData = "";

    // 获取验证码
    $('.sendvdimgck').click(function() {
        var t = $(this),
            step = t.closest('.form-step'),
            index = step.index(),
            ftype = t.closest('.ftype'),
            type = $('.tab-nav .active').index(),
            djs = $('.djs' + type);
        countDown(60, djs, type);
    })

    //倒计时（开始时间、结束时间、显示容器）
    function countDown(time, obj, type) {
        $('.sendvdimgck' + type).hide();
        $('.djs' + type).show();
        obj.text(langData['siteConfig'][20][5].replace('1', time));
        mtimer = setInterval(function() {
            obj.text(langData['siteConfig'][20][5].replace('1', (--time)));
            if (time <= 0) {
                clearInterval(mtimer);
                obj.text('');
                $('.sendvdimgck' + type).show();
                $('.djs' + type).hide();
            }
        }, 1000);
    }

    // 极验或发送验证码之前验证手机号是否可注册
    function registAccountCheck(callback){
      var account = $('#phone').val(), type = 3;
      var data = '';
      if(type == 3){
        var areaCode = $("#J-countryMobileCode label").text();
        if(areaCode == "86"){
          var phoneReg = /(^1[3|4|5|6|7|8|9]\d{9}$)|(^09\d{8}$)/;  
          if(!phoneReg.test(account)){
            $("#phone").parent().next(".error").show();
            return;
          }else{
            $("#phone").parent().next(".error").hide();
          }
        }
        data = '&areaCode=' + areaCode;
      }

      $.ajax({
        url: '/include/ajax.php?service=member&action=registAccountCheck&rtype='+type+'&account='+account+data+"&from=bind&code="+$('#code').val(),
        type: 'get',
        dataType: 'json',
        success: function(data){
          if(data && data.state == 100){
            callback();
          }else{
            if(data.info.indexOf("   ") > -1){
              $('.dialog_msg .info').html(data.info);
              $('.dialog_msg').removeClass('fn-hide');
            }else{
              alert(data.info);
            }
          }
        },
        error: function(){
          callback();
        }
      })
    }

  $('.dialog_msg .close').click(function(){
    $('.dialog_msg').addClass('fn-hide');
  })


})
