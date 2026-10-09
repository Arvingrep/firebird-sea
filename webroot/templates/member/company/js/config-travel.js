$(function(){

	getEditor("body");


	//地图标注
	var init = {
		popshow: function() {
			var src = "/api/map/mark.php?mod=travel",
					address = $("#address").val(),
					lnglat = $("#lnglat").val();
			if(address != ""){
				src = src + "&address="+address;
			}
			if(lnglat != ""){
				src = src + "&lnglat="+lnglat;
			}
			$("#markPopMap").after($('<div id="shadowlayer" style="display:block"></div>'));
			$("#markDitu").attr("src", src);
			$("#markPopMap").show();
		},
		pophide: function() {
			$("#shadowlayer").remove();
			$("#markDitu").attr("src", "");
			$("#markPopMap").hide();
		}
	};

	$(".map-pop .pop-close, #cloPop").bind("click", function(){
		init.pophide();
	});

	$("#mark").bind("click", function(){
		init.popshow();
	});

	$("#okPop").bind("click", function(){
		var doc = $(window.parent.frames["markDitu"].document),
				lng = doc.find("#lng").val(),
				lat = doc.find("#lat").val(),
				address = doc.find("#addr").val();
		$("#lnglat").val(lng+","+lat);
		if($("#address").val() == ""){
			$("#address").val(address).blur();
		}
		init.pophide();
	});


	//时间
	var selectDate = function(el, func){
		WdatePicker({
			el: el,
			isShowClear: false,
			isShowOK: false,
			isShowToday: false,
			qsEnabled: false,
			dateFmt: 'HH:mm',
			onpicked: function(dp){
				$("#openStart").parent().siblings(".tip-inline").removeClass().addClass("tip-inline success").html("<s></s>");
			}
		});
	}
	$("#openStart").focus(function(){
		selectDate("openStart");
	});
	$("#openEnd").focus(function(){
		selectDate("openEnd");
	});

	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();
        $('#addrid').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
        //分类
        var typeArr = $('.checkbox input[name="bind_module[]"]:checked'),typelist=[];
        typeArr.each(function(){
        	var tid = $(this).val();
        	typelist.push(tid)
        })
        $('#shop_type').val(typelist.join(','));

        //分类
        var weekArr = $('.checkbox input[name="openweek[]"]:checked'),weeklist=[];
        weekArr.each(function(){
        	var tid = $(this).val();
        	weeklist.push(tid)
        })
        $('#open_week').val(weeklist.join(','));

		var t           = $(this),
				shopname      = $("#shopname"),
				permisscode      = $("#permisscode"),
				contact      = $("#contact"),
				addrid      = $("#addrid"),
				address     = $("#address"),
				phone       = $("#phone"),
				logo       = $("#logo"),
				shop_type       = $("#shop_type"),
				open_week   = $("#open_week"),
				openStart   = $("#openStart"),
				openEnd     = $("#openEnd");
				//note        = $("#note");

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;

		//公司名称
		if($.trim(shopname.val()) == ""){
			var tips =shopname.data('title');
			shopname.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? shopname.position().top : offsetTop;
		}

		//许可证号
		if($.trim(permisscode.val()) == ""){
			var tips =permisscode.data('title');
			permisscode.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? permisscode.position().top : offsetTop;
		}
		//联系人
		if($.trim(contact.val()) == ""){
			var tips =contact.data('title');
			contact.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? contact.position().top : offsetTop;
		}
		//电话
		if($.trim(phone.val()) == "" || phone.val() == 0){
			phone.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][433]);
			offsetTop = offsetTop == 0 ? phone.position().top : offsetTop;
		}
		//验证分类
		if(shop_type.val() == ''){
			var pardl = shop_type.closest('dl');
			var hline = pardl.find(".tip-inline"), tips = shop_type.data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = offsetTop == 0 ? phone.position().top : offsetTop;
		}

		//服务时间
		if(open_week.val() == ""){
			open_week.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['travel'][14][97]);//请选择服务时间
			offsetTop = offsetTop == 0 ? phone.position().top : offsetTop;
		}
		//营业时间
		if($.trim(openStart.val()) == "" || openStart.val() == 0 || $.trim(openEnd.val()) == "" || openEnd.val() == 0){
			openStart.parent().siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][434]);
			offsetTop = offsetTop == 0 ? phone.position().top : offsetTop;
		}

		//区域
		if($.trim(addrid.val()) == "" || addrid.val() == 0){
			addrid.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][68]);
			offsetTop = offsetTop == 0 ? $("#selAddr").position().top : offsetTop;
		}

		//地址
		if($.trim(address.val()) == "" || address.val() == 0){
			address.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+langData['siteConfig'][20][69]);
			offsetTop = offsetTop == 0 ? address.position().top : offsetTop;
		}

		//logo
		// if($.trim(logo.val()) == ""){
		// 	$.dialog.alert('请上传店铺logo');
		// 	offsetTop = offsetTop == 0 ? address.position().top : offsetTop;
		// }



		//图集
		var imgli = $("#listSection2 li");
		if(imgli.length <= 0 && offsetTop <= 0){
			$.dialog.alert(langData['siteConfig'][20][436]);
			offsetTop = offsetTop == 0 ? address.position().top : offsetTop;
		}

		var video = "";
	    if($("#listSection3 li").length){
	      video = $("#listSection3 li").eq(0).children("video").attr("data-val");
	    }
        $("#video").val(video);

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
