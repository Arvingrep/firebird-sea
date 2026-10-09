$(function(){

	// 切换视频类型
	$('#box_videotype span').click(function(){
		var t = $(this), val = t.data('id');
		if(t.hasClass('curr')) return;
		mold = val;
		changeItem(val);
	})

	function changeItem(mmid){
		
		if(mmid == 1){
			$('#video_2').show();
			$('#video_1').hide();
		}else{
			$('#video_1').show();
			$('#video_2').hide();
		}
		
	}
	
	$(".w-form").delegate("input[type=text],textarea", "focus", function(){
        var t = $(this), dl = t.closest("dl"), hline = dl.find(".tip-inline");
        var errrTip = t.attr('data-title');

        if(dl.attr("data-required") == 1){
            if($(this).val() ==" " || $(this).val() ==""){
                hline.removeClass().addClass("tip-inline focus").html("<s></s>"+errrTip)
            }
        }        
    })

	$(".w-form").delegate("input[type=text],textarea", "blur", function(){
        var t = $(this), dd = t.closest("dd"),dl = t.closest("dl"), hline = dd.find(".tip-inline");
        var errrTip = t.attr('data-title');
        if(dl.attr("data-required") == 1){
            if($(this).val() !=" " && $(this).val() !=""){
                hline.removeClass().addClass("tip-inline success").html("<s></s>");
            }else{
                hline.removeClass().addClass("tip-inline error").html("<s></s>"+errrTip)
            }
        }

        
    })


	//提交发布
	$("#submit").bind("click", function(event){

		event.preventDefault();
		var t       = $(this),
				typeid  = $("#typeid").val(),
				title   = $("#title"),
				videourl   = $("#videourl"),
				videotype   = $("#videotype").val(),
				pics   = $("#pics").val();

		if(t.hasClass("disabled")) return;

		var offsetTop = 0;


		//验证标题
		var exp = new RegExp("^" + titleRegex + "$", "img");
		if(!exp.test(title.val())){
			title.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+titleErrTip);
			offsetTop = title.offset().top;
		}


		if(!pics){
			$.dialog.alert(langData['travel'][12][50]);  //请上传封面
			offsetTop = $(".listImgBox").position().top;
		}

		if(videotype == 0 && $('.uploadVideo .pubitem').size() == 0){//本地
			$.dialog.alert(langData['travel'][14][84]);  //请上传旅游视频
			offsetTop = $("#video_1").position().top;
		}else if(videotype == 1 && $('#videourl').val() == ''){//外站调用
			var tips = videourl.attr('data-title')
			videourl.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+tips);
			offsetTop = videourl.offset().top;
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
