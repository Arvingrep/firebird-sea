$(function(){

	var init = {

		//新增、修改
		quickEdit: function(id){
			var mailServer, mailPort, mailFrom, mailUser, mailPass;
			var title = "新增帐号";
			var dopost = "add";
			if(id !== "" && id != undefined){
				huoniao.showTip("loading", "正在获取信息，请稍候...");
				huoniao.operaJson("smsAccount.php?action=getInfo&token="+$("#token").val(), "id="+id, function(data){
					if(data != null){
						huoniao.hideTip();
						//填充信息
						self.parent.$("#title").val(data.title);
						self.parent.$("#username").val(data.username);
						self.parent.$("#password").val(data.password);
						self.parent.$("#signCode").val(data.signCode);
						self.parent.$('.typeid label input').attr('checked', false);
						if (data.title == '腾讯云' || data.title == '阿里云' || data.title == '阿里大于' || data.title == '阿里大鱼' || data.title == '大于' || data.title == '大鱼') {
							self.parent.$('.quick-editForm dl').hide();
							self.parent.$('.quick-editForm dl.dayu').show();
							self.parent.$('.quick-editForm dl.typeid').show();
							if (data.title == '阿里云') {
								self.parent.$(".typeid label input[value='0']").attr('checked', true);

								self.parent.$('#usernameTitle').html('Access Key ID：');
								self.parent.$('#passwordTitle').html('Access Key Secret：');

							}else if(data.title == '腾讯云'){
								// if(data.international==1){
								// 	self.parent.$("input:checkbox[name='international']").attr('checked', true);
								// }
								self.parent.$(".typeid label input[value='3']").attr('checked', true);

								self.parent.$('#usernameTitle').html('SDK AppID：');
								self.parent.$('#passwordTitle').html('App Key：');

							}else {
								self.parent.$(".typeid label input[value='1']").attr('checked', true);

								self.parent.$('#usernameTitle').html('Access Key ID：');
								self.parent.$('#passwordTitle').html('Access Key Secret：');
							}
							self.parent.$('#title').val("");
							self.parent.$('#website').val("");
							self.parent.$('#contact').val("");
						}else {
							self.parent.$('.quick-editForm dl.hide').removeClass('hide');
							self.parent.$(".typeid label input[value='2']").attr('checked', true);
							self.parent.$("input[name=charset]").each(function(){
								if($(this).val() == data.charset){
									$(this).attr("checked", true);
								}
							});

							self.parent.$("#sendUrl").val(data.sendUrl);
							self.parent.$("#sendCode").val(data.sendCode);
							self.parent.$("#accountUrl").val(data.accountUrl);
							self.parent.$("#accountCode").val(data.accountCode);
							self.parent.$("#website").val(data.website);
							self.parent.$("#contact").val(data.contact);
						}

                        if(data.international==1){
                            self.parent.$("input:checkbox[name='international']").attr('checked', true);
                        }

                        if(data.china==1){
                            self.parent.$("input:checkbox[name='china']").attr('checked', true);
                        }
                        self.parent.$('.quick-editForm dl.tencent').show();


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
						signCode  = self.parent.$("#signCode").val(),
						sendUrl   = self.parent.$("#sendUrl").val(),
						sendCode  = self.parent.$("#sendCode").val(),
						international  = self.parent.$("input:checkbox[name='international']:checked").val(),
						china  = self.parent.$("input:checkbox[name='china']:checked").val(),
						typeid		= self.parent.$(".typeid input[type='radio']:checked").val(), serialize = '';

                    international = international==1 ? 1 : 0;
                    china = china==1 ? 1 : 0;
					if (typeid == '0') {
						serialize += 'username='+username+'&password='+password+'&signCode='+signCode+'&international='+international+'&china='+china+'&title=阿里云&website=https://www.aliyun.com/&contact=95187';
					}else if (typeid == '1') {
						serialize += 'username='+username+'&password='+password+'&signCode='+signCode+'&international='+international+'&china='+china+'&title=阿里大于&website=https://dayu.aliyun.com/&contact=95187';
					}else if(typeid == '3'){
						serialize += 'username='+username+'&password='+password+'&signCode='+signCode+'&international='+international+'&china='+china+'&title=腾讯云&website=https://cloud.tencent.com/&contact=4009100100';
					}else {
						serialize = self.parent.$(".quick-editForm").serialize();
					}
					if (typeid == '2') {
						if(title == ""){
							alert("请输入平台名称");
							return false;
						}
					}else {
						self.parent.$('#contact').val("95187");
					}

					if(username == ""){
						alert("请输入用户名");
						return false;
					}

					if(password == ""){
						alert("请输入密码");
						return false;
					}

					huoniao.operaJson("smsAccount.php?dopost="+dopost, "id="+id+"&token="+$("#token").val()+"&"+serialize, function(data){
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

	parent.$('body').delegate('.typeid label input', 'click', function(){
		var t = $(this), val = t.val();
		if (val != '2') {
			t.closest('.quick-editForm').find('dl').hide();
			t.closest('.quick-editForm').find('.dayu').show();
			t.closest('.quick-editForm').find('.typeid').show();
            t.closest('.quick-editForm').find('.tencent').show();
			// if(val==3) {t.closest('.quick-editForm').find('.tencent').show();}
			self.parent.$('#title').val("");
			self.parent.$('#website').val("");
			self.parent.$('#contact').val("");
		}else {
			t.closest('.quick-editForm').find('dl').show();
		}

		//阿里云&大于
		if(val == '0' || val == '1'){
			self.parent.$('#usernameTitle').html('Access Key ID：');
			self.parent.$('#passwordTitle').html('Access Key Secret：');

		//腾讯云
		}else if(val == '3'){
			self.parent.$('#usernameTitle').html('SDK AppID：');
			self.parent.$('#passwordTitle').html('App Key：');
		
		//其他
		}else{
			self.parent.$('#usernameTitle').html('用户名/AppKey：');
			self.parent.$('#passwordTitle').html('密码/AppSecret：');
		}

		t.closest('label').siblings('label').find('input').attr('checked', false);
		t.attr('checked', true);
	})

	//查询剩余条数
	$(".mail-list").find(".mail-item").each(function(){
		var t = $(this), id = t.attr("data-id"), title = t.attr("data-title");
		if(title.indexOf("大于") > -1 || title.indexOf("大鱼") > -1 || title.indexOf("阿里") > -1){
			t.find(".sur").html('<a href="http://www.alidayu.com" target="_blank">官网查询</a>');
		}else if(title.indexOf("腾讯") > -1){
			t.find(".sur").html('<a href="https://cloud.tencent.com/" target="_blank">官网查询</a>');
		}else{
			huoniao.operaJson("smsAccount.php?action=surplus", "id="+id+"&token="+$("#token").val(), function(data){
				t.find(".sur").html(data);
			});
		}
	});

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

			huoniao.operaJson("smsAccount.php?action=update", "id="+id+"&token="+$("#token").val(), function(data){
				var state = "success";
				if(data.state != 100){
					state = "error";
				}
				huoniao.showTip(state, data.info, "auto");
			});

			//启用阿里大于 腾讯云
			var title = t.data("title"), smsAlidayu = 0;
			if(title.indexOf("阿里") > -1 || title.indexOf("大于") > -1 || title.indexOf("大鱼") > -1){
				smsAlidayu = 1;
			}else if(title.indexOf("腾讯") > -1){
				smsAlidayu = 2;
			}
			huoniao.operaJson("siteConfig.php?action=Alidayu", "smsAlidayu="+smsAlidayu+"&token="+$("#token").val());
		}
	});

	//删除短信帐号
	$(".mail-list").delegate(".mail-item .del", "click", function(){
		var t = $(this).closest(".mail-item"), id = t.data("id"), index = t.index();
		$.dialog.confirm('确定要删除此帐号吗？', function(){
			if(!t.hasClass("current")){
				$(".mail-list .mail-item:eq("+index+")").remove();
				huoniao.operaJson("smsAccount.php", "dopost=del&id="+id+"&token="+$("#token").val(), function(data){
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

	//检测启用短信帐号是否可用
	$("#check").bind("click", function(){
		var smsPopup = $.dialog({
			fixed: true,
			title: "测试短信帐号",
			content: '<form class="quick-editForm" style="padding:30px 0;"><dl class="clearfix"><dt>手机号码：</dt><dd><input class="input-xlarge" type="text" name="mobile" id="mobile" value="" placeholder="请加上区域代码，如：86"></dd></dl></form>',
			width: 460,
			ok: function(){
				//提交
				var mobile  = self.parent.$("#mobile").val();

				if(mobile == ""){
					alert("请输入手机号码！");
					return false;
				}

				huoniao.showTip("loading", "正在发送，请稍候...");

				huoniao.operaJson("../inc/json.php?action=checkSMS", "mobile="+mobile, function(data){
					huoniao.hideTip();
					if(data.state == 100){
						$(".mail-list").prev(".alert").remove();
						$(".mail-list").before('<div class="alert alert-success" style="margin:0 50px 10px;"><button type="button" class="close" data-dismiss="alert">&times;</button>'+data.info+'</div>');
						smsPopup.close();

					}else if(data.state == 101){
						alert(data.info);
						return false;
					}else{
						huoniao.showTip("error", data.info, "auto");
						smsPopup.close();
					}
				});

				return false;

			},
			cancel: true
		});
	});

});
