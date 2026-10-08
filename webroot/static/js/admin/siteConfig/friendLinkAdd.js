$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	//填充城市列表
	// huoniao.buildAdminList($("#cityid"), cityList, '请选择分站', cityid);
	// $(".chosen-select").chosen();
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

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			cityid       = $("#cityid").val(),
			typeid       = $("#typeid").val(),
			sitename     = $("#sitename"),
			sitelink     = $("#sitelink"),
			weight       = $("#weight");

		//城市
		if(cityid == "" || cityid == "0"){
			$.dialog.alert("请选择分站城市");
			tj = false;
			huoniao.goTop();
			return false;
		}

		//分类
		if(typeid == "" || typeid == "0"){
			$.dialog.alert("请选择链接分类");
			tj = false;
			huoniao.goTop();
			return false;
		}

		//网站名称
		if(!huoniao.regex(sitename)){
			huoniao.goTop();
			return false;
		};

		//网站地址
		if(!huoniao.regex(sitelink)){
			huoniao.goTop();
			return false;
		};

		//排序
		if(!huoniao.regex(weight)){
			huoniao.goTop();
			return false;
		}

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "friendLink.php?dopost="+$("#dopost").val()+"&action="+action,
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#dopost").val() == "Add"){
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
									$("body",parent.document).find("#nav-friendLinkphpaction"+action).click();
									parent.reloadPage($("body",parent.document).find("#body-friendLinkphpaction"+action));
									$("body",parent.document).find("#nav-friendLinkEdit"+id+" s").click();
								}catch(e){
									location.href = thisPath + "friendLink.php?action="+action;
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
