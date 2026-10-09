$(function(){
	
	var init = {
		
		//新增、修改
		quickEdit: function(id){
			var mailServer, mailPort, mailFrom, mailUser, mailPass;
			var title = "新增帐号";
			var dopost = "addMail";
			if(id !== "" && id != undefined){
				huoniao.showTip("loading", "正在获取信息，请稍候...");
				huoniao.operaJson("emailAccount.php?action=getMailInfo&token="+$("#token").val(), "id="+id, function(data){
					if(data != null){
						huoniao.hideTip();
						mailServer = data[0];
						mailPort   = data[1];
						mailFrom   = data[2];
						mailUser   = data[3];
						mailPass   = data[4];
			
						//填充信息
						self.parent.$("#mailServer").val(mailServer);
						self.parent.$("#mailPort").val(mailPort);
						self.parent.$("#mailFrom").val(mailFrom);
						self.parent.$("#mailUser").val(mailUser);
						self.parent.$("#mailPass").val(mailPass);
					}else{
						huoniao.showTip("error", "信息获取失败！", "auto");
					}
				});
				title = "修改帐号";
				dopost = "editMail";
			}
			
			$.dialog({
				fixed: true,
				title: title,
				content: $("#mailForm").html(),
				width: 460,
				ok: function(){
					//提交
					var mailServer  = self.parent.$("#mailServer").val(),
						mailPort    = self.parent.$("#mailPort").val(),
						mailFrom    = self.parent.$("#mailFrom").val(),
						mailUser    = self.parent.$("#mailUser").val(),
						mailPass    = self.parent.$("#mailPass").val(),
						serialize   = self.parent.$(".quick-editForm").serialize();
					
					if(mailServer == ""){
						alert("请输入SMTP服务器");
						return false;
					}
					
					if(mailPort == ""){
						alert("请输入服务器端口");
						return false;
					}
					
					if(mailFrom == ""){
						alert("请输入发信人地址");
						return false;
					}
					
					if(mailUser == ""){
						alert("请输入用户名");
						return false;
					}
					
					if(mailPass == ""){
						alert("请输入密码");
						return false;
					}
					
					huoniao.operaJson("emailAccount.php?action=email&dopost="+dopost, "id="+id+"&token="+$("#token").val()+"&"+serialize, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							var state = '<font class="muted">未启用</font>';
							if(id !== "" && id != undefined){
								if($(".mail-list .mail-item:eq("+id+")").hasClass("current")){
									state = '<font class="text-success">已启用</font>';
								}
							}
							var itemHtml = '<div class="bg">启用此帐号</div><dt>服务器：</dt><dd>'+mailServer+'</dd><dt>端口：</dt><dd>'+mailPort+'</dd><dt>发信人：</dt><dd>'+mailFrom+'</dd><div class="opera">'+state+'<a href="javascript:;" class="del btn btn-mini" title="删除"><s class="icon-trash"></s></a><a href="javascript:;" class="edit btn btn-mini" title="修改"><s class="icon-edit"></s></a></div>';

							if(id !== "" && id != undefined){
								$(".mail-list .mail-item:eq("+id+")").html(itemHtml);
							}else{
								$(".mail-list").append('<dl class="mail-item clearfix">'+itemHtml+'</dl>');
							}

						}else if(data.state == 101){
							alert(data.info);
							return false;
						}else{
							huoniao.showTip("error", data.info, "auto");
						}
					});
					
				},
				cancel: true
			});
			
		}
	};
	
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

	//选择邮件帐号
	$(".mail-list").delegate(".mail-item .bg", "click", function(){
		var t = $(this).parent(), index = t.index();
		t.siblings(".current").find("font")
			.removeClass()
			.addClass("muted")
			.html("未启用");
		t.siblings(".current").removeClass("current");
		if(!t.hasClass("current")){			
			t.addClass("current");
			t.find("font")
				.removeClass()
				.addClass("text-success")
				.html("已启用");

			huoniao.operaJson("emailAccount.php?action=updateMail", "mail="+index+"&token="+$("#token").val(), function(data){
				var state = "success";
				if(data.state != 100){
					state = "error";
				}
				huoniao.showTip(state, data.info, "auto");
			});
		}
	});

	//删除邮件帐号
	$(".mail-list").delegate(".mail-item .del", "click", function(){
		var t = $(this).closest(".mail-item"), index = t.index();
		$.dialog.confirm('确定要删除此帐号吗？', function(){
			if(!t.hasClass("current")){	
				$(".mail-list .mail-item:eq("+index+")").remove();
				var nId = $(".mail-list .current").index();
				huoniao.operaJson("emailAccount.php?action=delMail", "dopost=delMail&index="+index+"&nid="+nId+"&token="+$("#token").val(), function(data){
					var state = "success";
					if(data.state != 100){
						state = "error";
					}
					huoniao.showTip(state, data.info, "auto");
				});
			}else{
				$.dialog.alert("启用状态下无法删除！");
			}
		});
	});

	//新增邮箱帐号
	$("#addMail").bind("click", function(){
		init.quickEdit();
	});

	//修改邮箱帐号
	$(".mail-list").delegate(".edit", "click", function(){
		var index = $(this).closest(".mail-item").index();
		init.quickEdit(index);
	});

	//检测启用邮件帐号是否可用
	$("#checkMail").bind("click", function(){
		$.dialog({
			fixed: true,
			title: "测试邮件帐号",
			content: '<form class="quick-editForm" style="padding:30px 0;"><dl class="clearfix"><dt>测试帐号：</dt><dd><input class="input-xlarge" type="text" name="mailUser" id="mailUser" value=""></dd></dl></form>',
			width: 460,
			ok: function(){
				//提交
				var mailUser  = self.parent.$("#mailUser").val();
				
				if(mailUser == ""){
					alert("请输入测试帐号！");
					return false;
				}

				huoniao.showTip("loading", "正在发送，请稍候...");
				
				huoniao.operaJson("../inc/json.php?action=checkMail", "mailUser="+mailUser, function(data){
					huoniao.hideTip();
					if(data.state == 100){
						$(".mail-list").prev(".alert").remove();
						$(".mail-list").before('<div class="alert alert-success" style="margin:0 50px 10px;"><button type="button" class="close" data-dismiss="alert">&times;</button>'+data.info+'</div>');

					}else if(data.state == 101){
						alert(data.info);
						return false;
					}else{
						huoniao.showTip("error", data.info, "auto");
					}
				});
				
			},
			cancel: true
		});
	});
	
});