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

	$("input[name=mtype]").bind("click", function(){
		var val = $(this).val();
		if(val == 1){
			$("#companyobj").hide();
		}else{
			$("#companyobj").show();
		}
	})

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t       = $(this),
			mtype     = $("input[name=mtype]:checked").val(),
			username  = $("#username"),
			password  = $("#password"),
			nickname  = $("#nickname"),
			email     = $("#email"),
			phone     = $("#phone"),
			company   = $("#company");

		//用户名
		if(!huoniao.regex(username)){
			huoniao.goTop();
			return false;
		};

		//密码
		if(!huoniao.regex(password)){
			huoniao.goTop();
			return false;
		};

		//真实姓名
		if(!huoniao.regex(nickname)){
			huoniao.goTop();
			return false;
		};

		//邮箱
		if(!huoniao.regex(email)){
			//huoniao.goTop();
			//return false;
		};

		//手机
		if(!huoniao.regex(phone)){
			huoniao.goTop();
			return false;
		};

		//公司名称
		if(mtype == 2 && !huoniao.regex(company)){
			huoniao.goTop();
			return false;
		};

		$('#addr').val($('.addrBtn').attr('data-id'));

		if(!$("#addr").val()){
			$.dialog.alert('请选择所在区域！');
			return false;
		}

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "memberList.php?dopost=Add",
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					$.dialog({
						fixed: true,
						title: "添加成功",
						icon: 'success.png',
						content: "添加成功！",
						ok: function(){
							try{
								$("body",parent.document).find("#nav-memberListphp").click();
								parent.reloadPage($("body",parent.document).find("#body-memberListphp"));
								$("body",parent.document).find("#nav-memberAdd s").click();
							}catch(e){
								location.href = thisPath + "memberList.php";
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
