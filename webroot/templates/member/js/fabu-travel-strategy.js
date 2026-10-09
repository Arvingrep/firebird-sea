$(function(){



	getEditor("body");

	//下拉弹窗
	$('.w-form#travelForm .down-div .inp').click(function(e){
		var par = $(this).closest('.down-div');
		var downCon = par.find('.time_choose');
		if(!par.hasClass('curr')){
			par.addClass('curr');
			$('.time_choose').removeClass('active');
			downCon.addClass('active');
		}else{
			par.removeClass('curr');
			downCon.removeClass('active');
		}
			
		$(document).one('click',function(){
			par.removeClass('curr');
			downCon.removeClass('active');
		})
		e.stopPropagation();
	})

	//选择下拉
	$('.time_choose p').click(function(){
		$(this).addClass('curr').siblings('p').removeClass('curr');
		var par = $(this).closest('.time_choose');
		var timeDiv = $(this).closest('.down-div').find('.time-div');
		var tid = $(this).find('a').attr('data-id');
		var txt = $(this).find('a').text();
		par.siblings('input').val(tid);
		if(timeDiv.hasClass('huNum')){
			timeDiv.find('input').val(tid);
		}else{
			timeDiv.find('input').val(txt);
		}
		var pardl = $(this).closest('dl');
        var hline = pardl.find(".tip-inline");
        hline.removeClass().addClass("tip-inline success").html("<s></s>");
		
	})




	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();
		var t       = $(this),
				typeid  = $("#typeid").val(),
				title   = $("#title"),
				pics   = $("#pics").val();

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;
		

		//验证标题
		var exp = new RegExp("^" + titleRegex + "$", "img");
		if(!exp.test(title.val())){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+titleErrTip);
			offsetTop = title.offset().top;
		}

		ue.sync();
		if(typeid == ''){

			var pardl = $('#typename').closest('dd');
            var hline = pardl.find(".tip-inline"), tips = $('#typename').data("title");
			hline.removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = $('#typename').position().top;
		}
		if(!pics){
			$.dialog.alert(langData['travel'][12][50]);  //请上传封面
			offsetTop = $(".listImgBox").position().top;
		}

		if(!ue.hasContents()){
			$.dialog.alert(langData['siteConfig'][20][329]);  //请输入内容
			offsetTop = $("#body").position().top;
		}


		if(offsetTop){
			$('html, body').animate({scrollTop: offsetTop - 5}, 300);
			return false;
		}


		var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url");
		data = form.serialize();

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中

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
					t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即发布
					$("#verifycode").click();
				}

			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][184]);  //加载中，请稍候
				t.removeClass("disabled").html(langData['siteConfig'][11][19]);//立即发布
				$("#verifycode").click();
			}
		});


	});
	//视频预览
	$("#listSection3").delegate(".enlarge", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href");

		window.open(href, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

});
//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
	console.log(obj);
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<a href="/include/videoPreview.php?f=" data-id="'+file+'">预览视频</a>');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: contents");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}
//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "info",
		type: "delVideo",
		picpath: b,
		randoms: Math.random()
	};
	$.ajax({
		type: "POST",
		cache: false,
		async: d,
		url: "/include/upload.inc.php",
		dataType: "json",
		data: $.param(g),
		success: function(a) {
			try {
				c(a)
			} catch(b) {}
		}
	})
}
