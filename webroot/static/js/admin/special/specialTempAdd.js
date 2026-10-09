$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//树形递归分类
		treeTypeList: function(){
			var typeList = [];
			var l=typeListArr;
			typeList.push('<option value="">选择分类</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(typeid == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+jsonArray["typename"]+'</option>');
				})(l[i]);
			}
			return typeList.join("");
		}

	};

	//填充栏目分类
	$("#typeid").html(init.treeTypeList());

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
			typeid       = $("#typeid").val(),
			title        = $("#title"),
			litpic       = $("#litpic"),
			html         = $("#html"),
			weight       = $("#weight");

		//分类
		if(typeid == "" || typeid == "0"){
			$("#typeList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			$("#typeList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		//名称
		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		//缩略图
		if(litpic == ""){
			huoniao.goTop();
			$.dialog.alert("请上传缩略图");
			return false;
		}

		//模板内容
		if(html == ""){
			huoniao.goTop();
			$.dialog.alert("请输入模板内容");
			return false;
		}

		//排序
		if(!huoniao.regex(weight)){
			huoniao.goTop();
			return false;
		}

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "specialTempList.php?dopost="+$("#dopost").val(),
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
									$("body",parent.document).find("#nav-specialTempListphp").click();
									//parent.reloadPage($("body",parent.document).find("#body-shopBrandphp")[0].contentWindow);
									parent.reloadPage($("body",parent.document).find("#body-specialTempListphp"));
									$("body",parent.document).find("#nav-specialTempEdit"+id+" s").click();
								}catch(e){
									location.href = thisPath + "specialTempList.php";
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
