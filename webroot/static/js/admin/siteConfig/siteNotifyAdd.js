$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	//TAB切换
	$('.nav-tabs a').click(function (e) {
		e.preventDefault();
		var obj = $(this).attr("href").replace("#", "");
		if(!$(this).parent().hasClass("active")){
			$(this).parent().siblings("li").removeClass("active");
			$(this).parent().addClass("active");

			$(this).parent().parent().next(".tagsList").find("div").hide();
			$("#"+obj).show();
		}
	});

	//一键导入模板
	$('#syncSmsTemplate').bind('click', function(e){
		var t = $(this), id = $('#id').val();
		if(t.hasClass('disabled') || !id) return false;

		$.dialog.confirm('一键导入功能将会覆盖已经配置好的模板ID，确认要导入吗？', function(){

			huoniao.showTip("loading", "正在操作，请稍候...");
			t.addClass('disabled');

			$.ajax({
				type: "GET",
				url: "../inc/json.php?action=addSmsTemplate&id="+id,
				dataType: "json",
				success: function(data){
					huoniao.hideTip();
					t.removeClass('disabled');
					if(data.state == 100){

						$('#sms_tempid').val(data.code);

						$.dialog({
							fixed: true,
							title: "导入成功",
							icon: 'success.png',
							content: "导入成功！",
							ok: function(){
							}
						});

					}else{
						huoniao.hideTip();
						$.dialog.alert(data.info);
					}
				},
				error: function(){
					huoniao.hideTip();
					t.removeClass('disabled');
					$.dialog.alert("网络错误，请刷新页面重试！");
				}
			});
		});

	});

	$('#syncSmsWeixinTemplate').bind('click', function(e){
		var t = $(this), id = $('#id').val();
		if(t.hasClass('disabled') || !id) return false;

		$.dialog.confirm('如果此编号已经在微信公众平台模板库添加过，一键导入功能会重复添加一条，这将导致模板数量被占用，确认无误，继续导入吗？', function(){

			huoniao.showTip("loading", "正在操作，请稍候...");
			t.addClass('disabled');

			$.ajax({
				type: "GET",
				url: "../inc/json.php?action=addWxTemplate&addtype=1&id="+id,
				dataType: "json",
				success: function(data){
					huoniao.hideTip();
					t.removeClass('disabled');
					if(data.state == 100){

						$('#wechat_tempid').val(data.code);

						$.dialog({
							fixed: true,
							title: "导入成功",
							icon: 'success.png',
							content: "导入成功！",
							ok: function(){
							}
						});

					}else{
						huoniao.hideTip();
						$.dialog.alert(data.info);
					}
				},
				error: function(){
					huoniao.hideTip();
					t.removeClass('disabled');
					$.dialog.alert("网络错误，请刷新页面重试！");
				}
			});
		});

	});
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

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t     = $(this),
			id    = $("#id").val(),
			title = $("#title");

		//关键字
		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "siteNotifyAdd.php",
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
								try{
									$("body",parent.document).find("#nav-siteNotifyphp").click();
									parent.reloadPage($("body",parent.document).find("#body-siteNotifyphp"));
									$("body",parent.document).find("#nav-siteNotifyAdd s").click();
								}catch(e){
									location.href = thisPath + "siteNotify.php";
								}
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
									$("body",parent.document).find("#nav-siteNotifyphp").click();
									parent.reloadPage($("body",parent.document).find("#body-siteNotifyphp"));
									$("body",parent.document).find("#nav-siteNotifyEdit"+id+" s").click();
								}catch(e){
									location.href = thisPath + "siteNotify.php";
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
