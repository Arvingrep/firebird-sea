$(function(){

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

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

	$("#editform").delegate("select", "change", function(){
		if($(this).parent().siblings(".input-tips").html() != undefined){
			if($(this).val() == 0){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});

	//搜索回车提交
    $("#editform input").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#btnSubmit").click();
        }
    });

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			litpic       = $("#litpic").val();

		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		if($.trim(litpic) == ""){
			$.dialog.alert("请上传封面");
			return false;
		}

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("marryhostvideoAdd.php", $("#editform").serialize() +"&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){
					huoniao.parentTip("success", "添加成功！");
					huoniao.goTop();
					location.reload();
				}else{
					huoniao.parentTip("success", "修改成功！");
					t.attr("disabled", false);
				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

	//视频预览
	$("#videoPreview").delegate("a", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"),
			id   = $(this).attr("data-id");

		window.open(href+id, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
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
	$("#"+obj).val(file);
	$("#"+obj).siblings(".spic").find(".sholder").html('<a href="/include/videoPreview.php?f=" data-id="'+file+'">预览视频</a>');
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline-block");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}
//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "marry",
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
