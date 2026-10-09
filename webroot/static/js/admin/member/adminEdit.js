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
			username     = $("#username"),
			oldpass      = $("#oldpass"),
			password     = $("#password"),
			nickname     = $("#nickname");
		
		//用户名
		if(!huoniao.regex(username)){
			huoniao.goTop();
			return false;
		};
		
		//原始密码
		if(oldpass.val() == ""){
			huoniao.goTop();
			oldpass.focus();
			return false;
		}
		
		//新密码
		if(!huoniao.regex(password)){
			huoniao.goTop();
			return false;
		};
		
		//真实姓名
		if(!huoniao.regex(nickname)){
			huoniao.goTop();
			return false;
		};
		
		t.attr("disabled", true);
		
		$.ajax({
			type: "POST",
			url: "adminEdit.php",
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					$.dialog({
						fixed: true,
						title: "修改成功",
						icon: 'success.png',
						content: "修改成功！",
						ok: function(){
							try{
								$("body",parent.document).find("#nav-index").click();
								parent.reloadPage($("body",parent.document).find("#body-index"));
								$("body",parent.document).find("#nav-adminEdit s").click();
							}catch(e){
								location.href = thisPath + "adminList.php";
							}
						},
						cancel: false
					});
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