$(function(){

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
			if($(this).val() == ""){
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
			pay_config   = [],
			action       = $("#action").val(),
			id           = $("#id").val(),
			code         = $("#code").val(),
			pay_name     = $("#pay_name"),
			pay_desc     = $("#pay_desc").val(),
			state        = $("input[name='state']:checked").val();

		//名称
		if(!huoniao.regex(pay_name)){
			huoniao.goInput(pay_name);
			return false;
		};

		$("#payConfig").find("input, select, textarea").each(function(index, element) {
            var name = $(this).attr("name"), val = $(this).val();
			pay_config.push('{"name": "'+name+'", "value": "'+encodeURIComponent(val.replace(/\n/g,''))+'"}');
        });

		if(pay_config.length == 0){
			$.dialog.alert("请输入帐号信息");
			return false;
		}

		var form = [];
		form.push("id="+id);
		form.push("code="+code);
		form.push("pay_name="+pay_name.val());
		form.push("pay_desc="+pay_desc);
		form.push("pay_config="+'['+pay_config.join(",")+']');
		form.push("state="+state);
		form.push("submit=提交");

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "sitePayment.php?action="+action,
			data: form.join("&"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					$.dialog({
						fixed: true,
						title: "配置成功",
						icon: 'success.png',
						content: "配置成功！",
						ok: function(){
							try{
								$("body",parent.document).find("#nav-sitePaymentphp").click();
								//parent.reloadPage($("body",parent.document).find("#body-siteHelpsphp")[0].contentWindow);
								parent.reloadPage($("body",parent.document).find("#body-sitePaymentphp"));
								$("body",parent.document).find("#nav-sitePayment"+id+" s").click();
							}catch(e){
								location.href = thisPath + "sitePayment.php";
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
