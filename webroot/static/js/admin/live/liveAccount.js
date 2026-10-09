$(function(){
	var init = {

		//新增、修改
		quickEdit: function(id){
			var mailServer, mailPort, mailFrom, mailUser, mailPass;
			var title = "新增帐号";
			var dopost = "add";
			if(id !== "" && id != undefined){
				huoniao.showTip("loading", "正在获取信息，请稍候...");
				huoniao.operaJson("liveAccount.php?action=getInfo&token="+$("#token").val(), "id="+id, function(data){
					if(data != null){
						huoniao.hideTip();

						//填充信息
						self.parent.$("#title").val(data.title);
						self.parent.$("#username").val(data.username);
						self.parent.$("#password").val(data.password);
						self.parent.$("#vhost").val(data.vhost);
                        self.parent.$("#appname").val(data.appname),
						self.parent.$("#pushdomain").val(data.pushdomain),
						self.parent.$("#playdomain").val(data.playdomain),
						self.parent.$("#playprivatekey").val(data.playprivatekey),
						self.parent.$("#duration").val(data.duration),

                        self.parent.$("#privatekey").val(data.privatekey),
						self.parent.$("#website").val(data.website);
						self.parent.$("#contact").val(data.contact);


					}else{
						huoniao.showTip("error", "信息获取失败！", "auto");
					}
				});
				title = "修改帐号";
				dopost = "edit";
			}

			$.dialog({
				fixed: true,
				title: title,
				content: $("#smsForm").html(),
				width: 730,
				ok: function(){
					//提交
					var title  = self.parent.$("#title").val(),
						username  = self.parent.$("#username").val(),
						password  = self.parent.$("#password").val(),
                        vhost  = self.parent.$("#vhost").val(),
                        appname   = self.parent.$("#appname").val(),
                        pushdomain  = self.parent.$("#pushdomain").val(),
						serialize = self.parent.$(".quick-editForm").serialize();

					if(title == ""){
						alert("请输入平台名称");
						return false;
					}

					if(username == ""){
						alert("请输入用户名");
						return false;
					}

					if(vhost == ""){
						alert("请输入直播加速域名");
						return false;
					}

                    if(appname == ""){
                        alert("请输入应用名称");
                        return false;
                    }


                    huoniao.operaJson("liveAccount.php?dopost="+dopost, "id="+id+"&token="+$("#token").val()+"&"+serialize, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							setTimeout(function(){
								location.reload();
							}, 300);

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

	//选择短信帐号
	$(".mail-list").delegate(".mail-item .bg", "click", function(){
		var t = $(this).parent(), id = t.data("id");
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

			huoniao.operaJson("liveAccount.php?action=update", "id="+id+"&token="+$("#token").val(), function(data){
				var state = "success";
				if(data.state != 100){
					state = "error";
				}
				huoniao.showTip(state, data.info, "auto");
			});

			// //启用阿里大于
			// var title = t.data("title"), smsAlidayu = 0;
			// if(title.indexOf("大于") > -1 || title.indexOf("大鱼") > -1){
			// 	smsAlidayu = 1;
			// }
			// huoniao.operaJson("siteConfig.php?action=Alidayu", "smsAlidayu="+smsAlidayu+"&token="+$("#token").val());
		}
	});

	//删除短信帐号
	$(".mail-list").delegate(".mail-item .del", "click", function(){
		var t = $(this).closest(".mail-item"), id = t.data("id"), index = t.index();
		$.dialog.confirm('确定要删除此帐号吗？', function(){
			if(!t.hasClass("current")){
				$(".mail-list .mail-item:eq("+index+")").remove();
				huoniao.operaJson("liveAccount.php", "dopost=del&id="+id+"&token="+$("#token").val(), function(data){
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
	$("#add").bind("click", function(){
		init.quickEdit();
	});

	//修改邮箱帐号
	$(".mail-list").delegate(".edit", "click", function(){
		var index = $(this).closest(".mail-item").data("id");
		init.quickEdit(index);
	});

});
