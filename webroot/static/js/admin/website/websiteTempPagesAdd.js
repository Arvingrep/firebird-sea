$(function () {

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
		var t            = $(this),
			id           = $("#id").val(),
			name         = $("#name"),
			alias        = $("#alias");

		//页面名称
		if(!huoniao.regex(name)){
			huoniao.goInput(name);
			return false;
		};

		//文件名
		if(!huoniao.regex(alias)){
			huoniao.goInput(alias);
			return false;
		};

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "websiteTempPages.php?dopost="+$("#dopost").val(),
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#dopost").val() == "add"){
						huoniao.goTop();
						$.dialog({
							fixed: true,
							title: "添加成功",
							icon: 'success.png',
							content: "添加成功！",
							ok: function(){
								location.reload();
							},
							cancel: false
						});

					}else{
						$.dialog({
							fixed: true,
							title: "修改成功",
							icon: 'success.png',
							content: "修改成功！",
							ok: function(){
								try{
									$("body",parent.document).find("#nav-websiteTempPages"+$("#tempid").val()).click();
									parent.reloadPage($("body",parent.document).find("#body-websiteTempPages"+$("#tempid").val()));
									$("body",parent.document).find("#nav-websiteTempPagesEdit"+id+" s").click();
								}catch(e){
									location.href = thisPath + "websiteTempPages.php?tempid="+$("#tempid").val();
								}
							},
							cancel: false
						});
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
