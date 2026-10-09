$(function(){
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
                     var listLen = list.length;
                     var codeArea = list[0].code;
                     if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                          $('.dropdown-menu').hide();
                          return false;
                     }
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
  //第三方登录
  $(".loginconnect").click(function(e){
    e.preventDefault();
    var href = $(this).attr("href"), type = href.split("=")[1];
    loginWindow = window.open(href, 'oauthLogin', 'height=565, width=720, left=100, top=100, toolbar=no, menubar=no, scrollbars=no, status=no, location=yes, resizable=yes');

    //判断窗口是否关闭
    mtimer = setInterval(function(){
      if(loginWindow.closed){
        clearInterval(mtimer);
        huoniao.checkLogin(function(){
          location.reload();
        });
      }else{
        if($.cookie(cookiePre+"connect_uid")){
          loginWindow.close();
          var modal = '<div id="loginconnectInfo"><div class="mask"></div> <div class="layer"> <p class="layer-tit"><span>'+langData['siteConfig'][21][5]+'</span></p> <p class="layer-con">'+langData['siteConfig'][20][510]+'<br /><em class="layer_time">3</em>s'+langData['siteConfig'][23][97]+'</p> <p class="layer-btn"><a href="'+masterDomain+'/bindMobile.html?type='+type+'">'+langData['siteConfig'][23][98]+'</a></p> </div></div>';
				//温馨提示-为了您的账户安全，请绑定您的手机号-后自动跳转-前往绑定
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


  var regform = $('.fpwdwrap');

  function showTip(obj, state, txt){
    var error = obj.closest('.inpbox').siblings('.error');
    error.show().find('span').text(txt);
  }

  //重新发送公共函数
  function sendAgain(t){
    if(!t.hasClass("disabled")){

      //异步提交
      // $.ajax({
      //   url: masterDomain+"/include/ajax.php?service=member&action=backpassword",
      //   data: $(".form-horizontal-email").serialize()+"&isend=1&type=1&email="+emailMemData,
      //   type: "POST",
      //   dataType: "jsonp",
      //   success: function (data) {
      //     if(data){
      //       if(data.state == 100){
      //         countDown(60, t);
      //       }else{
      //         alert(data.info);
      //         t.removeClass("disabled");
      //         t.html(langData['siteConfig'][6][55]);  //重新发送
      //       }
      //     }else{
      //       alert(langData['siteConfig'][20][526]);  //发送失败，请重试！
      //       t.removeClass("disabled");
      //       t.html(langData['siteConfig'][6][55]);//重新发送
      //     }
      //   }
      // });

      var data = '';
      if(geetest){
          data = '&geetest_challenge='+geetest_challenge+'&geetest_validate='+geetest_validate+'&geetest_seccode='+geetest_seccode;
      }

	  $.ajax({
		url: '/include/ajax.php?service=siteConfig&action=getEmailVerify',
		data: $(".form-horizontal-email").serialize()+"&type=fpwd&rsaEncrypt=1&email="+rsaEncrypt(emailMemData)+data,
		type: "GET",
		dataType: "json",
		success: function (data) {
			//获取成功
			if(data && data.state == 100){
				countDown(60, t);
				//获取失败
			}else{
				t.removeClass("disabled").text(langData['siteConfig'][4][1]);
				alert(data.info);
			}
		},
		error: function(){
			t.removeClass("disabled").text(langData['siteConfig'][4][1]);
			alert(langData['siteConfig'][20][173]);
		}
	});

    }
  }


  //重新发送邮件
  if(!geetest){
    $("html").delegate(".getEmailVerify", "click", function(){
      if(emailMemData != ""){
        sendAgain($(this));
      }else{
        location.href = masterDomain+"/fpwd.html";
      }
    });
  }


  // 类型切换
  $('.tab-nav li').click(function(){
    var t = $(this), index = t.index();
    typeval = index == 0 ? 2 : 1;
    t.addClass('active').siblings('li').removeClass('active');
    $('.tab-pane .ftype').hide().eq(index).show();
  })

  //更新验证码
  var verifycode = $(".verifycodebox img").attr("src");
  $(".verifycodebox img").bind("click", function(){
    $(this).attr("src", verifycode+"?v="+Math.random());
  });


  //没有使用极验获取短信验证码
  if(!geetest){
    $("html").delegate(".getPhoneVerify", "click", function(){
      var t = $(this), areaCode = $('#J-countryMobileCode label'), phone = $("#phone");

      if(t.hasClass("disabled")) return false;
      if(!verifyInput($("#phone"))) return false;

      var vericode = $("#vericode2");
      if(!verifyInput(vericode)) return false;

      t.addClass("disabled");

      $.ajax({
        url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=fpwd",
        data: $(".form-horizontal").serialize()+"&type=fpwd",
        type: "POST",
        dataType: "jsonp",
        success: function (data) {
          //获取成功
          if(data && data.state == 100){

            if(t.hasClass("submit")){
              $('.step0 li:eq(1)').addClass("active");
              $(".phone-step .form-step:eq(0)").hide().next().show();
              $('.regphone').text('+'+areaCode.text()+phone.val());
            }

            countDown(60, $('.sendvdimgck0'));

          //获取失败
          }else{
            t.removeClass("disabled");
            alert(data.info);
          }
        }
      });
    });


    $("html").delegate("#submitFpwdemai", "click", function(){
      var t = $(this), email = $("#email");

      if(t.hasClass("disabled")) return false;
      if(!verifyInput($("#email"))) return false;

      var vericode = $("#vericode1");
      if(!verifyInput(vericode)) return false;

      t.addClass("disabled");
      emailMemData = email.val();

      $.ajax({
        url: masterDomain+"/include/ajax.php?service=siteConfig&action=getEmailVerify&type=fpwd",
        data: $(".form-horizontal-email").serialize()+"&type=fpwd",
        type: "POST",
        dataType: "jsonp",
        success: function (data) {
          //获取成功
          if(data && data.state == 100){

            if(t.hasClass("submit")){
                $('.step1 li:eq(1)').addClass("active").siblings();
                $("#formEmail .form-step:eq(0)").hide().next().show().find(".regemail").text(emailMemData);
                countDown(60, $(".getEmailVerify"));
            }

          //获取失败
          }else{
            t.removeClass("disabled");
            alert(data.info);
          }
        }
      });
    });

  }

  //是否使用极验验证码
  if(geetest){

    

     captchaVerifyFun.initCaptcha('web','#codeButton',captchaVerifyCallback)
      //获取短信验证码
      $("html").delegate(".getPhoneVerify", "click", function(){
        var t = $(this), phone = $("#phone");
        if(t.hasClass("disabled")) return false;
        if(!verifyInput($("#phone"))) return false;
          //弹出验证码
          if (geetest == 1) {
            captchaVerifyFun.config.captchaObjReg.verify();
          } else {
            $('#codeButton').click()
          }
      });

      //邮箱确认找回
      $("#submitFpwdemai").bind("click", function(){
        emailMemData = $("#email").val();
        if(typeval == 1){
          var t = $(this);
          if(t.hasClass("disabled")) return false;
          if(!verifyInput($("#email"))){
            tj = false;
            return false;
          }
            //弹出验证码
          if (geetest == 1) {
            captchaVerifyFun.config.captchaObjReg.verify();
          } else {
            $('#codeButton').click()
          }
        }
      });
  }

  

  //提交
  //没有开启极验，或者开启了但是必须是手机找回时才可用
  $("#submitFpwd, #submitFpwdEmail").bind("click", function(){
    if(!geetest || (geetest && typeval == 2) || (geetest && typeval == 1)){
      var t = $(this), tj = true;

      if(t.hasClass("disabled")) return false;

      if(typeval == 1){
        if(!verifyInput($("#email"))){
          tj = false;
          return false;
        }
        if(!verifyInput($("#vericode1")) && !geetest){
          tj = false;
          return false;
        }
		if(!verifyInput($("#vdimgck_email"))){
			tj = false;
			return false;
		}
      }
      if(typeval == 2){
        if(!verifyInput($("#phone"))){
          tj = false;
          return false;
        }
        if(!verifyInput($("#vericode2")) && !geetest){
          tj = false;
          return false;
        }
        if(!verifyInput($("#vdimgck"))){
          tj = false;
          return false;
        }
      }

      if(!tj) return false;

      t.addClass("disabled").html(langData['siteConfig'][7][1]+"...");


      //异步提交
      $.ajax({
        url: masterDomain+"/include/ajax.php?service=member&action=backpassword",
        data: typeval == 2 ? ($(".form-horizontal").serialize() + "&vdimgck=" + $('#vdimgck').val()) : ($(".form-horizontal-email").serialize() + "&vdimgck=" + $('#vdimgck_email').val()),
        type: "POST",
        dataType: "jsonp",
        success: function (data) {
          if(data){

            if(data.state == 100){
				// $("input[name='data']").val(data.info.split("data=")[1]);
              if(typeval == 1){
				$('.step1 li:eq(2)').addClass("active");
				$("#formEmail .form-step:eq(1)").hide().next().show();
				$("#data_email").val(data.info.split("data=")[1]);

              }else{
				$('.step0 li:eq(2)').addClass("active");
                $("#data").val(data.info.split("data=")[1]);
                $(".phone-step .form-step:eq(1)").hide().next().show();
                // location.href = data.info;

              }


            }else{
              alert(data.info);
              t.removeClass("disabled").html(langData['siteConfig'][6][32]);   //下一步
              $("#verifycode").click();
            }

          }else{
            alert(langData['siteConfig'][20][180]);   //提交失败，请重试！
            t.removeClass("disabled").html(langData['siteConfig'][6][32]); //下一步
          }
        }
      });
      return false;

    }
  });

  // 提交新密码
  $(".setpsw").click(function(){
    var t = $(this), tj = true;

    if(t.hasClass("disabled")) return false;

    $(".form-row .error").hide();
	var password,data;
	if(typeval==1){
		password = $('#password_email'), repassword = $("#repassword_email");
		data = $("#data_email").val()
	}else{
		data = $("#data").val()
		password = $('#password'), repassword = $("#repassword");
	}

    if (password.val() == "") {
      password.parent().next().show();
      return false;
    }
    if (repassword.val() == "") {
      repassword.parent().next().show();
      return false;
    }

    t.addClass("disabled").html(langData['siteConfig'][7][1]+"...");//请稍候

    //异步提交
    $.ajax({
      url: masterDomain+"/include/ajax.php?service=member&action=resetpwd&rsaEncrypt=1&data="+data+"&npwd="+rsaEncrypt(password.val()),
      type: "post",
      dataType: "jsonp",
      success: function (data) {
        if(data){

          if(data.state == 100){

            alert(data.info);

            setTimeout(function(){
              location.href = userDomain;
            }, 1000);

          }else{
            alert(data.info);
            t.removeClass("disabled").html(langData['siteConfig'][6][0]);  //确认
          }

        }else{
          alert(langData['siteConfig'][20][180]); //提交失败，请重试！
          t.removeClass("disabled").html(langData['siteConfig'][6][0]);  //确认
        }
      }
    });
  })


  // 密码可见
  $('.psw-show').click(function(){
    var t = $(this);
    if (t.hasClass('psw-hide')) {
      t.removeClass('psw-hide');
      t.siblings('input').attr('type', 'password');
    }else {
      t.addClass('psw-hide');
      t.siblings('input').attr('type', 'text');
    }
  })


	regform.find('.inpbox input').focus(function(){
		$(this).closest('.inpbox').siblings('.error').hide();
	})


  var verifyInput = function(t){
		var id = t.attr("id");
		t.removeClass("focus");
		if($.trim(t.val()) == ""){
			t.next("span").show();

			if(id == "email"){
				showTip(t, "error", langData['siteConfig'][21][36]);  //请输入邮箱地址！
			}else if(id == "phone"){
				showTip(t, "error", langData['siteConfig'][20][463]);  //请输入手机号码
			}else if(id == "vericode1" || id == "vericode2"){
				showTip(t, "error", langData['siteConfig'][20][176]);  //请输入验证码
			}else if(id == "vdimgck"){
				showTip(t, "error", langData['siteConfig'][20][28]);  //请输入短信验证码
			}
			return false;

		}else{
			if(id == "email" && !/^[a-z0-9]+([\+_\-\.]?[a-z0-9]+)*@([a-z0-9]+\.)+[a-z]{2,6}$/i.test($.trim(t.val()))){
				showTip(t, "error", langData['siteConfig'][20][511]);   //邮箱格式错误！
				return false;
			}else if(id == "phone"){

			}else if(id == "vericode"){
				t.removeClass("err");
				$.ajax({
					url: "/include/ajax.php?service=siteConfig&action=checkVdimgck&code="+t.val(),
					type: "GET",
					dataType: "jsonp",
					async: false,
					success: function (data) {
						if(data && data.state == 100){
							if(data.info == "error"){
								t.addClass("err");
								showTip(t, "error", langData['siteConfig'][21][99]);  //此手机号码已被注册！
								$("#verifycode").click();
							}
						}
					}
				});
			}else{
				t.removeClass("err");
			}
		}
		return true;
	}, emailMemData = "";


  //倒计时（开始时间、结束时间、显示容器）
	function countDown(time, obj, type){
		$('.sendvdimgck'+type).hide();
		obj.addClass('disabled').text(langData['siteConfig'][20][5].replace('1', time));  //1s后重新发送
		mtimer = setInterval(function(){
			obj.text(langData['siteConfig'][20][5].replace('1', (--time))); //1s后重新发送
			if(time <= 0) {
				clearInterval(mtimer);
				obj.removeClass('disabled').text(langData['siteConfig'][6][55]);//重新发送
			}
		}, 1000);
	}


  // 验证码的回调
  function captchaVerifyCallback(captchaVerifyParam,callback){
    //发送邮箱验证码
    if(typeval == 1 || (typeval == undefined && emailMemData)){
      emailCheck(captchaVerifyParam,callback)
    }else{
      phoneCheck(captchaVerifyParam,callback)
    }

  }

  // 验证邮箱
  function emailCheck(captchaVerifyParam,callback){
    let t = $("#getEmailVerify");
    if(t.hasClass("disabled")) return false;
    t.addClass('disabled');
    let param = '';
    if(captchaVerifyParam && geetest == 2){
      param = param + '&geetest_challenge=' + captchaVerifyParam
    }else if(geetest == 1 && captchaVerifyParam){
      param = param +  captchaVerifyParam
    }
    $.ajax({
      url: '/include/ajax.php?service=siteConfig&action=getEmailVerify',
      data: $(".form-horizontal-email").serialize()+"&type=fpwd&rsaEncrypt=1&email="+rsaEncrypt(emailMemData)+param,
      type: "GET",
      dataType: "json",
      success: function (data) {
        if(callback){
          callback(data)
        }
        //获取成功
        if(data && data.state == 100){
          
          if($('.step1 li:eq(0)').hasClass('active')){
            $('.step1 li:eq(1)').addClass("active").siblings();
            $("#formEmail .form-step:eq(0)").hide().next().show().find(".regemail").text(emailMemData);
          }
          countDown(60, $(".getEmailVerify"));
          //获取失败
        }else{
          t.removeClass("disabled").text(langData['siteConfig'][4][1]);
          if(data.info != '图形验证错误，请重试！'){
            alert(data.info);
          }
        }
      },
      error: function(){
        t.removeClass("disabled").text(langData['siteConfig'][4][1]);
        alert(langData['siteConfig'][20][173]);
      }
    });
  }

  // 手机验证
  function phoneCheck(captchaVerifyParam,callback){
    var t = $(".getPhoneVerify"), phone = $("#phone");
    if(t.hasClass("disabled")) return false;
      t.addClass("disabled");
      let param = '';
      if(captchaVerifyParam && geetest == 2){
        param = param + '&geetest_challenge=' + captchaVerifyParam
      }else if(geetest == 1 && captchaVerifyParam){
        param = param +  captchaVerifyParam
      }
      $.ajax({
        url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify",
        data: "rsaEncrypt=1&areaCode="+$('#areaCode').val()+"&phone="+rsaEncrypt(phone.val())+"&type=fpwd" + param,
        type: "POST",
        dataType: "jsonp",
        success: function (data) {
          if(callback){
            callback(data)
          }
          //获取成功
          if(data && data.state == 100){
            
            if(t.hasClass("submit")){
              $('.step0 li:eq(1)').addClass("active").siblings();
              $(".phone-step .form-step:eq(0)").hide().next().show();
              $('.regphone').text('+'+$('#J-countryMobileCode label').text()+phone.val());
            }
            countDown(60, $('.sendvdimgck0'));

          //获取失败
          }else{
            t.removeClass("disabled").html(langData['siteConfig'][4][4]);   //获取短信验证码
            if(data.info != '图形验证错误，请重试！'){
              alert(data.info);
            }
          }
        }
      });
  }


})
