$(function () {

	var changeUidByPhone = '';
	var timer = null;

	//动态步骤
	var names = [];
	for (var i = 0; i < certifyArr.length; i++) {
		names.push(certifyArr[i].title);
	}

	//显示第一个
	var step = 0;
	$('.item-' + certifyArr[0]['type']).show();

	//大于一种时，显示步骤
	if(names.length > 1){
		initStep();
		function initStep() {
			$(".step").step({
				stepNames: names,
				initStep: 0
			})
		}
	}else{
		$('.bg h3').css({'padding-top': '.7rem'});
	}

	//判断是否为公众号
	if(certifyArr[step].type == 'wechat'){
		dynamicVertifyWechat();
	}


	//提交
	$('.item-phone .confirm').bind('click', function(){

		var t = $(this);
		if(t.hasClass('disabled')) return false;

		var phone = $("#phone"), vdimgck = $("#vercode");
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

		t.addClass('disabled').html(langData['siteConfig'][6][35] + '...');  //提交中

		$.ajax({
			url: "/include/ajax.php?service=member&action=updateAccount&do=chphone",
			data: "areaCode="+$("#areaCode").val()+"&phone="+phone.val()+"&vdimgck="+vdimgck.val()+"&changeUidByPhone="+changeUidByPhone,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					stepNext();
				}else{
					popTip(data.info, "error");
					t.removeClass('disabled').html(langData['siteConfig'][6][118]);  //重新提交
				}
			}
		});

	});

	//关注公众号，提交
	var wechatClick = false;
	$('.item-wechat .confirm').bind('click', function(){

		var t = $(this);
		if(t.hasClass('disabled')) return false;

		wechatClick = true;
		t.addClass('disabled').html(langData['siteConfig'][23][143] + '...');  //检测中

		dynamicVertifyWechat();
	});


	//实名认证，提交
	$('.item-card .confirm').bind('click', function(){

		var t = $(this);
		if(t.hasClass('disabled')) return false;

		var realname = $("#realname"), idcard = $("#idcard"), license = $("#licenseCom"), front = $("#idcardFront"), back = $("#idcardBack");

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

		if(license.size() > 0 && $.trim(license.val()) == ""){
			popTip(langData['siteConfig'][20][109], "error");  //请上传营业执照
			return "false";
		}

		t.addClass('disabled').html(langData['siteConfig'][6][35] + '...');  //提交中

		$.ajax({
			url: "/include/ajax.php?service=member&action=updateAccount&do=certify",
			data: "realname="+realname.val()+"&idcard="+idcard.val()+"&front="+front.val()+"&back="+back.val()+"&license="+license.val(),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					$('.auditState, .auditState .state3').show();
					$('.auditState .state2, .item-card .form, .cardSub').hide();
				}else{
					popTip(data.info, "error");
					t.removeClass('disabled').html(langData['siteConfig'][6][118]);  //重新提交
				}
			}
		});

	});


	//下一步
	function stepNext(){
		//如果是最后一步，并且不是实名认证
		if(step == certifyArr.length - 1 && certifyArr[step].type != 'card'){
			location.href = from;
		}

		if(step < certifyArr.length - 1){
			$(".step").step("next");
			step++;

			$('.main .item').hide();
			$('.item-' + certifyArr[step]['type']).show();
		}

		//判断是否为公众号
		if(certifyArr[step].type == 'wechat'){
			dynamicVertifyWechat();
		}
	}



	var geetestData = "";
	if(geetest){

		captchaVerifyFun.initCaptcha('h5','#button',getPhoneVerify)

		// 重新发送
		$("html").delegate(".getCodes", "click", function(){
			var areaCode = $("#areaCode"), phone = $("#phone");

			if($(this).hasClass("disabled")) return false;

			if(areaCode.val() == ''){
				popTip(langData['siteConfig'][30][39], "error");   //请选择国家区号
				return false;
			}
			if(phone.val() == ''){
				popTip(langData['siteConfig'][20][463], "error");  //请输入手机号码
				phone.focus();
				return false;
			}
			if(geetest == 1){
				captchaVerifyFun.config.captchaObjReg.verify();
			}else{
				$('#button').click()
			}
		})

	//没有验证码时
	}else{
		// 重新发送
		$("html").delegate(".getCodes", "click", function(){
			checkPhoneBindState();
		})
	}

	function getPhoneVerify(captchaVerifyParam,callback){
		var t = $(".getCodes"), areaCode = $("#areaCode"), phone = $("#phone");
		let param = "areaCode="+areaCode.val()+"&phone="+phone.val() 
		if(captchaVerifyParam && geetest == 2){
			param = param + '&geetest_challenge=' + captchaVerifyParam
		}else if(geetest == 1 && captchaVerifyParam){
			param = param +  captchaVerifyParam
		}
		$.ajax({
			url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=verify",
			data: param,
			type: "POST",
			dataType: "json",
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
				}
			}
		});
		$("#vdimgck").focus();
	}

	function checkPhoneBindState(){
		var t = $(".getCodes"), areaCode = $("#areaCode"), phone = $("#phone");

		if(t.hasClass("disabled")) return false;

		if(areaCode.val() == ''){
			popTip(langData['siteConfig'][30][39], "error");   //请选择国家区号
		}
		if(phone.val() == ''){
			popTip(langData['siteConfig'][20][463], "error");  //请输入手机号码
			phone.focus();
		}else{

			t.addClass("disabled");
			t.html(langData['siteConfig'][7][3]+'...');

			// 验证手机号是否被其他用户绑定
			$.ajax({
				url: "/include/ajax.php?service=siteConfig&action=checkPhoneBindState",
				data: "phone="+phone.val(),
				type: "POST",
				dataType: "json",
				success: function (data) {
					//获取成功
					if(data && data.state == 100){
						// 手机号已被其他用户绑定
						if(data.info != "no"){
							if(confirm(langData['siteConfig'][30][88].replace('<br>', "\r\n"))){ //该手机号码已经注册过会员，确定要将该手机号码绑定到当前登陆账号吗？<br>确定后原账号将解除手机绑定，确认进入下一步？
								changeUidByPhone = data.info;
								getPhoneVerify();
							}else{
								t.removeClass("disabled").html(langData['siteConfig'][4][4]);//获取短信验证码
							}
						}else{
							getPhoneVerify();
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

	//提示信息
	function popTip(txt, cla){
		alert(txt);
	}


	//判断手机号码
	function checkPhone(num){
		if($('#areaCode').val() == '86'){
			var exp = new RegExp("^1[23456789]{1}[0-9]{9}$", "img");
			if(!exp.test(num)){
				return false;
			}
		}
		return true;
	}


	//动态验证是否关注公众号
	function dynamicVertifyWechat(){
		if(timer != null){
  			clearInterval(timer);
  		}
		timer = setInterval(function(){
			$.ajax({
				type: 'POST',
				async: false,
				url: '/include/ajax.php?service=member&action=detail&id='+uid,
				dataType: 'json',
				success: function(str){
					if(str.state == 100 && str.info.wechat_subscribe == 1){
						//如果已经关注，进行下一步
						clearInterval(timer);

						//下一步
						stepNext();

					}else{
						if(wechatClick){
							$('.item-wechat .confirm').removeClass('disabled').html(langData['siteConfig'][6][57]);  //重新检测
							wechatClick = false;
							popTip(langData['siteConfig'][23][144]);  //检测到还未关注，请重新扫码！\r\n已经关注？请检查关注的账号是否与当前登录账号一致，如果不一致，请先在微信端解除绑定！
							location.reload();
						}
					}
				}
			});
		}, 2000);
	}


	//国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').hide();
                        $('.areacode_span').siblings('input').css({'paddingLeft':'.24rem'})
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'"><span>'+list[i].name+'<span><em class="fn-right">+'+list[i].code+'</em></span></span></li>');
                   }
                   $('.areacodeList ul').append(phoneList.join(''));
                }else{
                   $('.areacodeList ul').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');  //暂无数据！
                  }
            },
            error: function(){
                    $('.areacodeList ul').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');  //加载失败！
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $(".popl_box").animate({"bottom":"0"},300,"swing");
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.areacodeList').delegate('li','click',function(){
        var t = $(this), txt = t.attr('data-code');
        t.addClass('achose').siblings('li').removeClass('achose');
        $(".areacode_span label").text('+'+txt);
        $("#areaCode").val(txt);

        $(".popl_box").animate({"bottom":"-100%"},300,"swing");
        $('.mask-code').removeClass('show');
    })


    // 关闭弹出层
    $('.anum_box .back, .mask-code').click(function(){
        $(".popl_box").animate({"bottom":"-100%"},300,"swing");
        $('.mask-code').removeClass('show');
    })



	// 上传身份证正面
	var upPhoto = new Upload({
		btn: '#idcardF',
		bindBtn: '',
		title: 'Images',
		mod: 'siteConfig',
		params: 'type=atlas',
		atlasMax: 1,
		deltype: 'delAtlas',
		replace: true,
		fileQueued: function(file){

		},
		uploadSuccess: function(file, response){
			if(response.state == "SUCCESS"){
				var img = $("#idcardFimg");
				if(img.length){
					var old = img.attr('data-url');
					upPhoto.del(old);
				}
				$("#idcardFimg").attr('src',response.turl);
				$("#idcardFimg").attr('data-url',response.url).show();
				$("#idcardFront").val(response.url);
			}
		},
		showErr: function(info){
			showMsg(info);
		}
	});

	//上传身份证反面
	var upPhoto = new Upload({
		btn: '#idcardB',
		bindBtn: '',
		title: 'Images',
		mod: 'siteConfig',
		params: 'type=atlas',
		atlasMax: 1,
		deltype: 'delAtlas',
		replace: true,
		fileQueued: function(file){

		},
		uploadSuccess: function(file, response){
			if(response.state == "SUCCESS"){
				var img = $("#idcardBimg");
				if(img.length){
					var old = img.attr('data-url');
					upPhoto.del(old);
				}
				$("#idcardBimg").attr('src',response.turl);
				$("#idcardBimg").attr('data-url',response.url).show();
				$("#idcardBack").val(response.url);
			}
		},
		showErr: function(info){
			showMsg(info);
		}
	});

	//上传身份证反面
	var upPhoto = new Upload({
		btn: '#licenseC',
		bindBtn: '',
		title: 'Images',
		mod: 'siteConfig',
		params: 'type=atlas',
		atlasMax: 1,
		deltype: 'delAtlas',
		replace: true,
		fileQueued: function(file){

		},
		uploadSuccess: function(file, response){
			if(response.state == "SUCCESS"){
				var img = $("#licenseCimg");
				if(img.length){
					var old = img.attr('data-url');
					upPhoto.del(old);
				}
				$("#licenseCimg").attr('src',response.turl);
				$("#licenseCimg").attr('data-url',response.url).show();
				$("#licenseCom").val(response.url);
			}
		},
		showErr: function(info){
			showMsg(info);
		}
	});


	// 错误提示
	function showMsg(str){
	  var o = $(".error");
	  o.html('<p>'+str+'</p>').show();
	  setTimeout(function(){o.hide()},1000);
	}

	//重新认证
	$('.recertify').bind('click', function(){
		$('.auditState').hide();
		$('.form, .cardSub').show();
	});





});
