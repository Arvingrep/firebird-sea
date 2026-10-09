$(function () {

	var timer = null;

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




	//提示信息
	function popTip(txt, cla){
		showErrAlert(txt);
	}
	//查看实名认证资料

		if(waiting){
			getdata();
		}
		function getdata(){
			$.ajax({
				url: masterDomain+"/include/ajax.php?service=member&action=updateAccount&do=getCerfityData",
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					//获取成功
					if(data && data.state != 200){
						bindCertifyData(data.info);
					//获取失败
					}else{
						alert(langData['siteConfig'][20][250]);
					}
				}
			});
		}

		//填充认证数据
		function bindCertifyData(data,cer,licen){
			if(data){
				$("#idcardFimg").attr('src',data.front).show();
				$("#idcardBimg").attr('src',data.back).show();				
				$("#licenseCimg").attr('src',data.license).show();
					
									
			}else{
				alert(langData['siteConfig'][20][250]);
			}
		}



	// 上传身份证正面
	var upPhoto = new Upload({
		btn: '#idcardF',
		bindBtn: '',
		title: 'Images',
		mod: 'siteConfig',
		params: 'type=card&obj=front',
		atlasMax: 1,
		deltype: 'delAtlas',
		replace: true,
		fileQueued: function(file){
			$("body").append("<div id='private_phone_container'><div class='loading'></div></div>")
		},
		uploadComplete:function(file){
			// 无论失败成功 都隐藏按钮
			$("#private_phone_container").remove()
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

                if(response.idcardname){
                    $("#realname").val(response.idcardname);
                }
                if(response.idcardno){
                    $("#idcard").val(response.idcardno);
                }

			}else{
                showErrAlert(response.state);
            }
		},
		showErr: function(info){
			showErrAlert(info);
		}
	});

	//上传身份证反面
	var upPhoto = new Upload({
		btn: '#idcardB',
		bindBtn: '',
		title: 'Images',
		mod: 'siteConfig',
		params: 'type=card&obj=back',
		atlasMax: 1,
		deltype: 'delAtlas',
		replace: true,
		fileQueued: function(file){
			$("body").append("<div id='private_phone_container'><div class='loading'></div></div>")
		},
		uploadComplete:function(file){
			// 无论失败成功 都隐藏按钮
			$("#private_phone_container").remove()
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
			}else{
                showErrAlert(response.state);
            }
		},
		showErr: function(info){
			showErrAlert(info);
		}
	});

	//营业执照
	var upPhoto = new Upload({
		btn: '#licenseC',
		bindBtn: '',
		title: 'Images',
		mod: 'siteConfig',
		params: 'type=card',
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
			}else{
                showErrAlert(response.state);
            }
		},
		showErr: function(info){
			showErrAlert(info);
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
