$(function(){

	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});

	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this);
		huoniao.regex(obj);
	});

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();

		//异步提交
		var post = $("#editform").serialize();
		huoniao.operaJson("wechatConfig.php", post, function(data){
			var state = "success";
			if(data.state != 100){
				state = "error";
			}
			huoniao.showTip(state, data.info, "auto");
		});
	});


	//删除文件
	$(".weixinQr .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");

		var g = {mod: "siteConfig", type: "delCard", picpath: input.val(), randoms: Math.random()};
		$.ajax({
			type: "POST",
			cache: false,
			url: "/include/upload.inc.php",
			dataType: "json",
			data: $.param(g),
			success: function(a) {
				try {
					input.val("");
					t.prev(".sholder").html('');
					parent.hide();
					iframe.attr("src", src).show();
				} catch(b) {}
			}
		});
	});

	//删除小程序
	$(".miniProgramQr .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");

		var g = {mod: "siteConfig", type: "delCard", picpath: input.val(), randoms: Math.random()};
		$.ajax({
			type: "POST",
			cache: false,
			url: "/include/upload.inc.php",
			dataType: "json",
			data: $.param(g),
			success: function(a) {
				try {
					input.val("");
					t.prev(".sholder").html('');
					parent.hide();
					iframe.attr("src", src).show();
				} catch(b) {}
			}
		});
	});


});




//上传成功接收
function uploadSuccess(obj, file){
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<img src="'+cfg_attachment+file+'" />');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}
