$(function(){

	//类别切换
	$(".type span").bind("click", function(){
		var id = $(this).attr("data-id");
		$(".industry, .transfer").hide();
		if(id == 2){
			$("#priceType").html(langData['siteConfig'][13][27]+echoCurrency('short'));   //万
			//出售状态
			$('.state_zu,.state_zhuan').removeClass('show');
			$('.state_shou').addClass('show');
		}else{
			$("#priceType").html(echoCurrency('short')+"/"+langData['siteConfig'][13][18]);  //月
			if(id == 1){
				//转让状态
				$('.state_zu,.state_shou').removeClass('show');
				$('.state_zhuan').addClass('show');
			}else{
				//出租状态
				$('.state_zhuan,.state_shou').removeClass('show');
				$('.state_zu').addClass('show');
			}
		}

		if(id == 1){
			$(".industry, .transfer").show();

		}
		autoTitle();
		//获取销售状态值
		var finalState = $('.cfstate.show').find('.curr').data('id');
		$('#sellstate').val(finalState);
	});

	$("#area, #price").bind("blur", function(){autoTitle();});
	$(".protype a").bind("click", function(){
		autoTitle();

		if($(this).text() == langData['siteConfig'][44][70]){
			$('.cenggao').hide();
		}else{
			$('.cenggao').show();
		}
	});

	$("#title").bind("input", function(){
		istit = true;
	});

	getEditor("note");


	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();

		$('#addrid').val($('#selAddr .addrBtn').attr('data-id'));
        var addrids = $('#selAddr .addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
		var t           = $(this),
				lei         = $("#lei"),
				title       = $("#title"),
				addrid      = $("#addrid").val(),
				address     = $("#address"),
				litpic      = $("#litpic").val(),
				price       = $("#price"),
				area        = $("#area"),
				litpic      = $("#litpic"),
				person      = $("#person"),
				tel         = $("#tel");

		if(t.hasClass("disabled")) return;

		if($('.uploadVideo').find('video').size() > 0) {
      $('#video').val($('.uploadVideo').find('video').attr('data-val'));
    }

    if($('#qj_type').val() == 0) {
      var qj_pics = [];
      $('.qj360').find('img').each(function(){
      	var t = $(this), val = t.attr('data-val');
        qj_pics.push(val);
      });
      $('#qj_pics').val(qj_pics.join(','));
    }

		var offsetTop = 0;

		if($.trim(address.val()) == ""){
			var dl = address.closest("dl");
			dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+address.attr("data-title"));
			offsetTop = offsetTop == 0 ? address.offset().top : offsetTop;
		}

		if(addrid == 0 || addrid == ""){
			var dl = $("#selAddr");
			dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+$("#selAddr .sel-group:eq(0)").attr("data-title"));
			offsetTop = offsetTop == 0 ? $("#selAddr").offset().top : offsetTop;
		}

		if(price.val() == ""){
			var dl = price.closest("dl");
			dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+price.attr("data-title"));
			offsetTop = offsetTop == 0 ? $("#totalPrice").offset().top : offsetTop;
		}

		if(area.val() == ""){
			var dl = area.closest("dl");
			dl.find(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+area.attr("data-title"));
			offsetTop = offsetTop == 0 ? $("#area").offset().top : offsetTop;
		}

		var exp = new RegExp("^" + titleRegex + "$", "img");
		if(!exp.test(title.val())){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+titleErrTip);
			offsetTop = offsetTop == 0 ? title.offset().top : offsetTop;
		}

		if(litpic.val() == "" && offsetTop == 0){
			$.dialog.alert(langData['siteConfig'][20][520]);   //请上传房源代表图片！
			$('html, body').animate({scrollTop: $("#license").offset().top - 5}, 300);
			return false;
		}

		ue.sync();

		if(!ue.hasContents() && offsetTop == 0){
			// $.dialog.alert(langData['siteConfig'][20][521]);  //请输入房源描述信息！
			// offsetTop = offsetTop == 0 ? $("#note").offset().top : offsetTop;
		}

		//验证联系人
		var exp = new RegExp("^" + personRegex + "$", "img");
		if(!exp.test(person.val())){
			person.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+personErrTip);
			offsetTop = offsetTop == 0 ? person.offset().top : offsetTop;
		}

		//验证手机号码
		var exp = new RegExp("^" + telRegex + "$", "img");
		if(!exp.test(tel.val())){
			tel.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+telErrTip);
			offsetTop = offsetTop == 0 ? tel.offset().top : offsetTop;
		}

		if(offsetTop){
			$('html, body').animate({scrollTop: offsetTop - 5}, 300);
			return false;
		}

		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize();

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");   //提交中
		console.log(data)
		$.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					fabuPay.check(data, url, t);

				}else{
					$.dialog.alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][11][19]);  //立即发布
					$("#verifycode").click();
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
				t.removeClass("disabled").html(langData['siteConfig'][11][19]); //立即发布
				$("#verifycode").click();
			}
		});


	});

});

function autoTitle(){
	if(!istit){
		setTimeout(function(){
			var lei    = $(".type .curr").text(),
					index  = $(".type .curr").index(),
					protype = $(".protype button").text(),
					price  = $("#price").val(),
					area   = $("#area").val(),
					title  = "";
			if(area != ""){
				title = area + "㎡";
			}
			if(protype != "" && protype != langData['siteConfig'][19][123]){   //厂房类型
				title += " " + protype;
			}
			if(price != ""){
				if(price == 0){
					title += " " + langData['siteConfig'][51][16];  //价格面议
				}else{
					title += " " + price + ((index == 0 || index == 2) ? (echoCurrency('short')+"/"+langData['siteConfig'][13][18]) : (langData['siteConfig'][13][27]+echoCurrency('short')));  //月-万
				}
			}
			title += " " + lei;
			$("#title").val(title);
		}, 200);
	}
}
