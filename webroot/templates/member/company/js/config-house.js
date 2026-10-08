$(function(){

	getEditor("note");

	$(".chosen-select").chosen();

	$('.switch').click(function(){
		var t = $(this);
		if(t.hasClass('open')){
			t.removeClass('open').next('.switch_text').text(langData['siteConfig'][42][24])//关闭
			// $('.closeinfo').html('<p>关闭后会员中心首页将同时隐藏模块内容，如果需要开启，请到管理中心开启模块</p>');
			$('.store_switch').val(0);
		}else{
			t.addClass('open').next('.switch_text').text(langData['siteConfig'][42][23]);//开启
			$('.store_switch').val(1);
			// $('.closeinfo').html('');
		}
	})

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		var t       = $(this),
				title   = $("#title"),
				litpic  = $("#litpic"),
				tel     = $("#tel"),
				cityid  = 0,
				addrid  = 0,
				address = $("#address");

		if(t.hasClass("disabled")) return;

		var addrbtn = $('.addrBtn'), ids = addrbtn.attr('data-ids');
		if(ids == undefined || ids == ''){
			offsetTop = offsetTop == 0 ? addrbtn.offset().top : offsetTop;
			$('#cityid').val(0);
			$('#addrid').val(0);
		}else{
			cityid = ids.split(' ')[0];
			addrid = addrbtn.attr('data-id');
			$('#cityid').val(cityid);
			$('#addrid').val(addrid);
		}


		var offsetTop = 0;

        //验证城市
        if(cityid == "" || cityid == 0){
            var dl = $("#cityid").closest("dl");
            dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+$("#cityid").attr("data-title"));
            offsetTop = offsetTop == 0 ? dl.offset().top : offsetTop;
        }

		//公司名称
		if($.trim(title.val()) == "" || title.val() == 0){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['shop'][4][42]);
			offsetTop = offsetTop == 0 ? title.position().top : offsetTop;
		}

		//logo
		if($.trim(litpic.val()) == "" && offsetTop == 0){
			$.dialog.alert(langData['siteConfig'][27][88]);
			offsetTop = offsetTop == 0 ? $("#listSection1").position().top : offsetTop;
		}

		//联系方式
		if($.trim(tel.val()) == "" || tel.val() == 0){
			tel.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][433]);
			offsetTop = offsetTop == 0 ? tel.position().top : offsetTop;
		}

		//地址
		if($.trim(address.val()) == "" || address.val() == 0){
			address.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][27][58]);
			offsetTop = offsetTop == 0 ? address.position().top : offsetTop;
		}

		ue.sync();

		if(offsetTop){
			$('.main').animate({scrollTop: offsetTop + 10}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action");
		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

		$.ajax({
			url: action,
			data: form.serialize(),
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					$.dialog({
						title: langData['siteConfig'][19][287],
						icon: 'success.png',
						content: data.info,
						ok: function(){}
					});
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][63]);
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled").html(langData['siteConfig'][6][63]);
				$("#verifycode").click();
			}
		});


	});
});
