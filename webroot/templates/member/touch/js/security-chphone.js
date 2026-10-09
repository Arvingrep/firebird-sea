var verifyFunc = verifyType = verifyData = opera = returnUrl = null;
var changeUidByPhone = '';

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
                        $('#areaCode').closest('.inpbox').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){

                        phoneList.push('<option value="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</option>');
                   }
                   $('#areaCode').append(phoneList.join(''));
                }else{
                   $('#areaCode').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('#areaCode').html('<div class="loading">加载失败！</div>');
                }

        })
    }

	$('.tab li').click(function(){
		var t = $(this);
		t.addClass('curr').siblings('li').removeClass('curr');
	})

	//绑定手机
	$("#chphone").bind("click", function(){
		var phone = $("#phone"), vdimgck = $("#vdimgck"), btn = $(this), areaCode = $('#areaCode');
		if($.trim(phone.val()) == ""){
			showMsg(langData['siteConfig'][20][232], "error");
			phone.focus();
			return "false";
		}
		if($.trim(vdimgck.val()) == ""){
			showMsg(langData['siteConfig'][20][28], "error");
			vdimgck.focus();
			return "false";
		}

		var param = "phone="+phone.val()+"&vdimgck="+vdimgck.val()+"&areaCode="+areaCode.val()+"&changeUidByPhone="+changeUidByPhone;
		modifyFun(btn, langData['siteConfig'][6][47], 'chphone', param);
	});


	//修改手机号码或邮箱
	$("#chPhoneEdit").bind("click", function(){
		opera = 'changePhone';
		authentication(bindPhoneUrl);
	});

	//解绑手机号码
	$("#chphoneDel").bind("click", function(){
		opera = "changePhone";
		authentication(bindPhoneUrl);
	});


	//绑定邮箱
	var memeryEmailData = "";
	$("#chemail").bind("click", function(){
		var email = $("#email"), btn = $(this);

		if($.trim(email.val()) == "" || !checkEmail(email.val())){
			showMsg(langData['siteConfig'][20][178], "error");
			email.focus();
			return "false";
		}
			var param = "email="+email.val();
			memeryEmailData = param;

		modifyFun(btn, langData['siteConfig'][6][32], 'chemail', param);

	});

	//修改邮箱
	$("#chEmailEdit").bind("click", function(){
		opera = "changeEmail";
		authentication(bindEmailUrl);
	});

	//解绑邮箱
	$("#chEmailDel").bind("click", function(){
		opera = "changeEmail";
		authentication(bindEmailUrl);
	});


	// 安全保护问题 --------- s
	$('.q1').change(function(){
		var val = $(this).val();
		$("#q1").val(val);
	})
	$('.q2').change(function(){
		var val = $(this).val();
		$("#q2").val(val);
	})


	//设置安全保护问题
	$("#question").bind("click", function(){

		var q1 = $("#q1"), q2 = $("#q2"), answer = $("#answer"), btn = $(this);
		if($.trim(q1.val()) == ""){
			showMsg(langData['siteConfig'][20][233].replace('1', '一'), "error");
			return "false";
		}
		if($.trim(q2.val()) == ""){
			showMsg(langData['siteConfig'][20][233].replace('1', '二'), "error");
			return "false";
		}
		if($.trim(answer.val()) == ""){
			showMsg(langData['siteConfig'][20][102], "error");
			answer.focus();
			return "false";
		}

		var q1 = $("#q1"), q2 = $("#q2"), answer = $("#answer");
		param = "q1="+q1.val()+"&q2="+q2.val()+"&answer="+answer.val();
		modifyFun(btn, langData['siteConfig'][6][128], 'question', param);

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
	// -------------------------

    var geetestData = "";
	if(geetest){

		//极验验证
		// var handlerPopup = function (captchaObj) {
		// 	// captchaObj.appendTo("#popup-captcha");

		// 	// 成功的回调
		// 	captchaObj.onSuccess(function () {

		// 		var result = captchaObj.getValidate();
		// 		var geetest_challenge = result.geetest_challenge,
		// 			geetest_validate = result.geetest_validate,
		// 			geetest_seccode = result.geetest_seccode;

		// 		geetestData = "&geetest_challenge="+geetest_challenge+'&geetest_validate='+geetest_validate+'&geetest_seccode='+geetest_seccode;

		// 		checkPhoneBindState();
		// 	});


			
		// }

		captchaVerifyFun.initCaptcha('h5','#codeButton',checkPhoneBindState)	
		// 重新发送
		$("html").delegate("#getPhoneVerify", "click", function(){
			var areaCode = $("#areaCode"), phone = $("#phone");

			if(areaCode.val() == ''){
				alert(langData['siteConfig'][20][134], "error");   //请选择区域！
				return false;
			}
			if(phone.val() == ''){
				alert(langData['siteConfig'][20][463], "error");  //请输入手机号码
				phone.focus();
				return false;
			}
			 //弹出验证码
			 if (geetest == 1) {
				captchaVerifyFun.config.captchaObjReg.verify();
			} else {
				$('#codeButton').click()
			}
		})

	//没有验证码时
	}else{
		// 重新发送
		$("html").delegate("#getPhoneVerify", "click", function(){
			checkPhoneBindState();
		})
	}

  function getPhoneVerify(captchaVerifyParam,callback){
    var t = $("#getPhoneVerify"), phone = $("#phone"), areaCode = $('#areaCode').val();
	var  param = "phone="+phone.val() ;
	if(captchaVerifyParam && geetest == 2){
		param = param + '&geetest_challenge=' + captchaVerifyParam
	  }else if(geetest == 1 && captchaVerifyParam){
		param = param +  captchaVerifyParam
	  }
    $.ajax({
      url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=verify&areaCode="+areaCode,
      data: param,
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
            t.removeClass("disabled").html(langData['siteConfig'][4][4]);
            showMsg(data.info, "error");
            $('.edit-tip').text(data.info);
        }
      }
    });

    $("#vdimgck").focus();
  }

  function checkPhoneBindState(captchaVerifyParam,callback){
      var t = $(this), phone = $("#phone"), areaCode = $('#areaCode').val();

      if(t.hasClass("disabled")) return false;

    	t.addClass("disabled");
    	t.html('<img src="'+staticPath+'images/loading_16.gif" /> '+langData['siteConfig'][7][3]+'...');

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
              $('.phone_msg').removeClass('fn-hide').attr('data-id', data.info);
              t.removeClass("disabled").html(langData['siteConfig'][4][4]);
			  if(callback){
				callback(data)
			  }
            }else{
              getPhoneVerify(captchaVerifyParam,callback);
            }
          }
        }
      })
  }
  //获取短信验证码

  $('.phone_msg .confirm').click(function(){
    changeUidByPhone = $('.phone_msg').attr('data-id');
    getPhoneVerify();
    $('.phone_msg').addClass('fn-hide');
  })
  $('.phone_msg .cancel, .phone_msg .close').click(function(){
    $('.phone_msg').addClass('fn-hide');
  })



	//短信验证
	$("html").delegate("#getPhoneAuthVerify", "click", function(){
		var t = $(this);

		if(t.hasClass("disabled")) return false;
		t.addClass("disabled");
		t.html('<img src="'+staticPath+'images/loading_16.gif" /> '+langData['siteConfig'][7][3]+'...');

		$('.edit-tip').html(langData['siteConfig'][20][101], "");

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
					$('.edit-tip').html(data.info, "error");
					showMsg(data.info);
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

		$('.edit-tip').html(langData['siteConfig'][20][100], "");

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
					$('.edit-tip').html(data.info, "error");
					showMsg(data.info);
				}
			}
		});

		$("#vdimgck").focus();
	});


	var wait = 60;
	function countDown(t) {
		if (wait == 0) {
			t.removeClass("disabled");
			t.html(langData['siteConfig'][4][1]);
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

	//验证身份信息
	function authentication(url){
		if(phoneCheck == 1 || emailCheck == 1 || questionSet == 1){

			returnUrl = url;
			authVerifyFun();
			$(".ui_buttons").hide();

		}else{
			$('.edit-tip').text(langData['siteConfig'][20][235]);
		}
	}

	//异步提交修改
	function authVerifyFun(){
		if(verifyFunc == null){
			showMsg(langData['siteConfig'][6][127]);
			return;
		}
	    if(verifyFunc() == "false") return false;

	    $.ajax({
	      url: masterDomain+"/include/ajax.php?service=member&action=authentication&do="+verifyType+"&opera="+opera,
	      data: verifyData(),
	      type: "POST",
	      dataType: "jsonp",
	      success: function (data) {
	        if(data && data.state == 100){

	          showMsg(data.info, "success");
	          setTimeout(function(){
	            location.href = returnUrl;
	          }, 1000);

	        }else{
	          showMsg(data.info, "error");

	        }
	      }
	    });
	}

    //确定身份验证方式
  	$('.checkway').change(function(){
  		checkwayChange();
  	});


})


function checkwayChange(){
  var t = $('.checkway'), val = t.val();
  $(".authlist .item").hide();
  if (val != "") {
    $(".authlist .item"+val).show();
  }

  //短信验证
  if(val == 0){

    verifyType = "authPhone";

    //验证脚本
    verifyFunc = function(){
      var vdimgck = $("#vdimgck");
      if(vdimgck.val() == ""){
        showMsg(langData['siteConfig'][20][28], "error");
        vdimgck.focus();
        return "false";
      }
    };

    //传送数据
    verifyData = function(){
      return "vdimgck="+$("#vdimgck").val();
    };

    //邮箱验证
  }else if(val == 1){

    verifyType = "authEmail";

    //验证脚本
    verifyFunc = function(){
      var vdimgck = $("#vdimgckEmail");
      if(vdimgck.val() == ""){
        showMsg(langData['siteConfig'][20][236].replace('1', '6'), "error");
        vdimgck.focus();
        return "false";
      }
    };

    //传送数据
    verifyData = function(){
      return "vdimgck="+$("#vdimgckEmail").val();
    };

    //安全保护问题
  }else if(val == 2){

    verifyType = "authQuestion";

    //验证脚本
    verifyFunc = function(){
      var answer = $("#answer");
      if(answer.val() == ""){
        showMsg(langData['siteConfig'][20][102], "error");
        answer.focus();
        return "false";
      }
    };

    //传送数据
    verifyData = function(){
      return "answer="+$("#answer").val();
    };

  }
}


//判断邮箱
function checkEmail(num){
	if(!/\w+((-w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+/.test(num)){
		return false;
	}
	return true;
}



// 错误提示
function showMsg(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}

function modifyFun(btn, btnstr, type, param, func){
  var data = param == undefined ? '' : param;
  if(btn.hasClass('disabled')){
    return false;
  }
  btn.addClass('disabled').text(langData['siteConfig'][6][35]+'...');
  $.ajax({
    url: "/include/ajax.php?service=member&action=updateAccount&do="+type,
    data: data,
    type: "POST",
    dataType: "jsonp",
    success: function (data) {
      if(data && data.state == 100){
      	if(type == 'chemail'){
      		alert(data.info+"\n"+langData['siteConfig'][20][237]);
      		btn.removeClass('disabled').html(langData['siteConfig'][6][55]);
      		return;
      	}
      	alert(data.info);
        location.href = pageUrl;
      }else{
        alert(data.info);
        btn.removeClass('disabled').text(btnstr);
      }
    },
    error: function(){
      alert(langData['siteConfig'][20][183]);
      btn.removeClass('disbaled').text(btnstr);
    }
  })
}
