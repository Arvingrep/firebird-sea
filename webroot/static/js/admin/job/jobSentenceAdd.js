$(function(){
	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	//填充城市列表
	huoniao.choseCity($(".choseCity"),$("#cityid"));  //城市分站选择初始化

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

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t          = $(this),
			id           = $("#id").val(),
			cityid       = $("#cityid").val(),
			title        = $("#title"),
			type         = $("#type").val(),
			people       = $("#people"),
			contact      = $("#contact"),
			password     = $("#password"),
			weight       = $("#weight");

		//城市
		if(cityid == '' || cityid == 0){
				$.dialog.alert('请选择城市');
				return false;
		};

		if(!huoniao.regex(title)){
			huoniao.goInput($("#title"));
			return false;
		}

		if(!huoniao.regex(people)){
			huoniao.goInput(people);
			return false;
		}

		if(!huoniao.regex(contact)){
			huoniao.goInput(contact);
			return false;
		}

		if($("#edit").val() == "edit"){
			if(!huoniao.regex(password)){
				huoniao.goInput(password);
				return false;
			}
		}

		if(!huoniao.regex(weight)){
			huoniao.goInput(weight);
			return false;
		}

		t.attr("disabled", true);

		//异步提交
		huoniao.operaJson("jobSentenceAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){
					huoniao.parentTip("success", "发布成功！");
					location.reload();

				}else{
					huoniao.parentTip("success", "修改成功！");
					location.reload();

				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});

		return false;
	});

});
