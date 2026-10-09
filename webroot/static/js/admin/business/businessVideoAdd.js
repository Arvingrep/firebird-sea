$(function () {

	huoniao.parentHideTip();
	$(".chosen-select").chosen();

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

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t          = $(this),
			uid          = $("#uid").val(),
			id           = $("#id").val(),
			title        = $("#title"),
			litpic       = $("#litpic").val(),
			video        = $("#video").val();

		//商家
		if(uid == "" || uid == 0){
			huoniao.goTop();
			$.dialog.alert("请选择所属商家！");
			return false;
		}

		//标题
		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		//缩略图
		if(litpic == ""){
			huoniao.goTop();
			$.dialog.alert("请上传缩略图！");
			return false;
		}

		//视频地址
		if(video == ""){
			huoniao.goTop();
			$.dialog.alert("请输入视频地址！");
			return false;
		}

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "?dopost="+$("#dopost").val(),
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#dopost").val() == "add"){
						huoniao.parentTip("success", "发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
						huoniao.goTop();
						location.reload();
					}else{
						huoniao.parentTip("success", "修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
						t.attr("disabled", false);
					}
				}else{
					$.dialog.alert(data.info);
					t.attr("disabled", false);
				};
			},
			error: function(msg){
				$.dialog.alert("网络错误，请刷新页面重试！");
				t.attr("disabled", false);
			}
		});
	});

});
