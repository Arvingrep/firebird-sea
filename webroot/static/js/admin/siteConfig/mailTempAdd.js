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
		var obj = $(this), tip = obj.siblings(".input-tips");
		if(obj.attr("data-required") == "true"){
			if($(this).val() == ""){
				tip.removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				tip.removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}else{
			huoniao.regex(obj);
		}
	});


	//插入系统参数
	$(".systemLabel label").bind("click", function(){
		var t = $(this), val = t.data("val"), content = $("#content");
		if(val != "" && val){
			content.insertContent(val);
		}
	});

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t     = $(this),
			id      = $("#id").val(),
			module  = $("#module").val(),
			temp    = $("#temp"),
			title   = $("#title"),
			content = $("#content");

		//模块
		if(module == "" || module == 0){
			huoniao.goTop();
			$("#moduleList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#moduleList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		//模板名称
		if(!huoniao.regex(temp)){
			huoniao.goTop();
			return false;
		};

		//标题
		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		//内容
		if(!huoniao.regex(content)){
			huoniao.goTop();
			return false;
		};

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "mailTempAdd.php",
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#dopost").val() == "save"){

						$.dialog({
							fixed: true,
							title: "添加成功",
							icon: 'success.png',
							content: "添加成功！",
							ok: function(){
								huoniao.goTop();
								window.location.reload();
							},
							cancel: false
						});

					}else{
						$.dialog({
							fixed: true,
							title: "修改成功",
							icon: 'success.png',
							content: "修改成功",
							ok: function(){
								try{
									$("body",parent.document).find("#nav-mailTempphp").click();
									parent.reloadPage($("body",parent.document).find("#body-mailTempphp"));
									$("body",parent.document).find("#nav-mailTempEdit"+id+" s").click();
								}catch(e){
									location.href = thisPath + "mailTemp.php";
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
