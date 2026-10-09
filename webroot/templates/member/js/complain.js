$(function(){
	//更新验证码
	var verifycode = $("#verifycode").attr("src");
	$("#verifycode").bind("click", function(){
		$(this).attr("src", verifycode+"?v="+Math.random());
	});

	// //表单提示
	$(".form").delegate("input[type=text]", "focus", function(){
		var t = $(this), tip = t.data("title"), hline = t.siblings(".tip-inline");
		hline.removeClass().addClass("tip-inline focus").html("<s></s>"+tip);
	});

	$("body").delegate("input[type=text]", "blur", function(){
		var t = $(this), dl = t.closest("dl"), name = t.attr("name"), tip = t.data("title"), hline = t.siblings(".tip-inline"), check = true;
		if($.trim(t.val()) != ""){
			//验证码
			if(name == "vdimgck"){
				$.ajax({
					url: "/include/ajax.php?service=siteConfig&action=checkVdimgck&code="+t.val(),
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							if(data.info == "error"){
								hline.removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][99]);   //验证码输入错误，请重试！
							}else{
								hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
							}
						}
					}
				});
				return;
			}
			hline.removeClass().addClass("tip-inline success").html("<s></s>"+tip);
		}else{
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tip);
		}
	});
	// //国际手机号获取
	getNationalPhone();
	function getNationalPhone(){
		console.log(111)
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
                        $('.Ju_areaCode').hide();
                        // $('.form .inp#phone').css({'padding-left':'10px'});
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                   }
                   $('.Ju_areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.Ju_areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                        $('.Ju_areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                    }

        })
	}


	//选择区号
	$('.Ju_areaCode_wrap').delegate('li', 'click', function(){
		var t = $(this), code = t.attr('data-code');
		var par = t.closest(".JuTel");
		var areaIcode = par.find(".Ju_areaCode");
		areaIcode.find('em').html('+' + code);
	});

	$('body').bind('click', function(){
		$('.Ju_areaCode_wrap').fadeOut(300);
	});

	// //提交
	// $("#submit").bind("click", function(event){
	// 	event.preventDefault();
	//
	//
	// 	var t = $(this), check = true;
	// 	var type = $("#type");
	// 	var areaIcode = t.closest(".form").find(".areaCode");
	// 	var areaCode = areaIcode.find("i").text().replace('+', '');
	// 	if(type.val() == ""){
	// 		type.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+type.attr("data-title"));
	// 		check = false;
	// 	}
	// 	var phone = $("#phone");
	// 	if(phone.val() == ""){
	// 		phone.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+phone.attr("data-title"));
	// 		check = false;
	// 	}
	// 	var vdimgck = $("#vdimgck");
	// 	if(vdimgck.val() == ""){
	// 		vdimgck.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+vdimgck.attr("data-title"));
	// 		check = false;
	// 	}
	//
	// 	if(!check) return false;
	// 	t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");   //提交中
	//
	// 	$.ajax({
	// 		url: "/include/ajax.php",
	// 		data: {
	// 			"service": "member",
	// 			"template": "complain",
	// 			"module": module,
	// 			"dopost": dopost,
	// 			"aid": aid,
	// 			"type": type.val(),
	// 			"desc": $("#desc").val(),
	// 			"phone": $("#phone").val(),
	// 			"areaCode": areaCode,
	// 			"vdimgck": vdimgck.val(),
	// 			"commonid": $('#commonid').val()
	// 		},
	// 		type: "POST",
	// 		dataType: "jsonp",
	// 		success: function (data) {
	// 			if(data && data.state == 100){
	// 				t.html(langData['siteConfig'][21][242]);   //举报成功！
	//
	// 				setTimeout(function(){
	// 					frameElement.api.close();
	// 				}, 500);
	//
	// 			}else{
	// 				alert(data.info);
	// 				t.attr("disabled", false).html(langData['siteConfig'][6][151]);  //提交
	//
	// 				if(data.state == 101){
	// 					setTimeout(function(){
	// 						frameElement.api.close();
	// 					}, 500);
	// 				}
	// 			}
	// 		},
	// 		error: function(){
	// 			alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
	// 			t.attr("disabled", false).html(langData['siteConfig'][6][151]);  //提交
	// 		}
	// 	});
	//
	// });


		$('.JubaoBox .JuList li').click(function() {
			var txt = $(this).text();
			$(this).addClass('juChose').siblings('li').removeClass('juChose');
			hline = $(".JubaoBox .JuList .tip-inline");
			hline.removeClass().addClass("tip-inline");
			if( $(".JuList li.juChose").length != 0 && $("#Ju_tel").val() != ''){
				$('.JuSubmit').removeClass('JuDisabled')
			}else{
				$('.JuSubmit').addClass('JuDisabled')
			}
		});

		//计算输入的字数
		$('textarea#JuDesc').on('input propertychange', function() {
			var length = 100;
			var content_len = $("#JuDesc").val().length;
			var in_len = length - content_len;
			if (content_len >= 100) {
				$("#JuDesc").val($("#JuDesc").val().substring(0, 100));
			}
			$('.JuTextCount span').text($("#JuDesc").val().length);
		});

		$('#Ju_tel').on('input propertychange', function() {
			$(this).siblings('.tip-inline').removeClass().addClass('tip-inline')
			if($(this).val() != '' && $(".JuList li.juChose").length != 0){
				$('.JuSubmit').removeClass('JuDisabled')
			}else{
				$('.JuSubmit').addClass('JuDisabled')
			}

		});

		// 显示选择区号
		$(".Ju_areaCode").click(function(event) {
			/* Act on the event */
			$(".Ju_areaCode_wrap").show();
			$(document).one('click',function() {
				$(".Ju_areaCode_wrap").hide();
			});
			event.stopPropagation()
		});

	// 选择区号
		$(".Ju_areaCode_wrap li").click(function() {
			var t = $(this);
			$('.Ju_areaCode span').text('+'+t.attr('data-code'));
			$(".Ju_areaCode").attr('data-code',t.attr('data-code'));
		})

		$('.report').off('click').click(function() {
			$(".JuMask,.JuPop").show();

		});

		// 举报提交
		$('.JuSubmit').click(function() {
			var t = $(this), check = true;
			if($(".JuList li.juChose").length == 0){
				$(".JuList").find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请选择举报类型！");
				return false;
			}

			if($("#Ju_tel").val() == ''){
				// alert('请输入联系方式！')
				$("#Ju_tel").siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请输入联系方式！");
				return false;
			}
			var vdimgck = $("#vdimgck")
			if(vdimgck.val() == ''){
				vdimgck.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>请输入验证码！");
				return false;
			}

			var  type = $(".JuList .juChose").text();
			var areaCode = $('.Ju_areaCode').attr('data-code');

				$.ajax({
					url: "/include/ajax.php",
					data: {
						"service": "member",
						"template": "complain",
						"module": module,
						"dopost": dopost,
						"aid": aid,
						"type": type,
						"desc": $("#JuDesc").val(),
						"phone": $("#Ju_tel").val(),
						"areaCode": areaCode,
						"vdimgck": vdimgck.val(),
						"commonid": $('#commonid').val()
					},
					type: "POST",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							t.html(langData['siteConfig'][21][242]);   //举报成功！

							setTimeout(function(){
								frameElement.api.close();
							}, 500);

						}else{
							alert(data.info);
							t.attr("disabled", false).html(langData['siteConfig'][6][151]);  //提交

							if(data.state == 101){
								setTimeout(function(){
									frameElement.api.close();
								}, 500);
							}
						}
					},
					error: function(){
						alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
						t.attr("disabled", false).html(langData['siteConfig'][6][151]);  //提交
					}
				});

		})
});
