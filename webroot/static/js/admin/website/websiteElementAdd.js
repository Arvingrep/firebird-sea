$(function(){
	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" ); 
		thisUPage = tmpUPage[ tmpUPage.length-1 ]; 
		thisPath  = thisURL.split(thisUPage)[0];
	
	$("#type").bind("input", function(){
		$("#theme").val($(this).val());
		huoniao.regex($("#theme"));
	});

	$("input[name='sort']").bind("click", function(){
		var val = $("input[name='sort']:checked").val();
		if(val == "apps"){
			$("#appsObj").show();
		}else{
			$("#appsObj").hide();
		}
	});
	
	//管理应用分类
	$("#manageType").bind("click", function(){
		$.ajax({
			url: "websiteElementAdd.php?dopost=manageType",
			type: "POST",
			dataType: "json",
			success: function(data){
				var content = [];
				if(data){
					for(var i = 0; i < data.length; i++){
						content.push('<li data-id="'+data[i].id+'"><i data-toggle="tooltip" data-placement="top" data-original-title="拖动以排序" class="icon-move"></i><input type="text" name="name[]" value="'+data[i].val+'" /><a data-toggle="tooltip" data-placement="top" data-original-title="删除" href="javascript:;" class="icon-trash"></a></li>');
					}
					content = '<ul class="menu-itemlist">'+content.join("")+'</ul>';
					content += '<a href="javascript:;" id="addNewManageType"><i class="icon-plus"></i>新增分类</a>';
				}
				
				$.dialog({
					id: "ManageType",
					title: "管理应用分类",
					content: content,
					width: 360,
					ok: function(){
						var data = [], itemList = self.parent.$(".menu-itemlist li");
						for(var i = 0; i < itemList.length; i++){
							var obj = itemList.eq(i), id = obj.attr("data-id"), weight = obj.index(), val = obj.find("input").val();
							data.push('{"id": "'+id+'", "weight": "'+weight+'", "val": "'+val+'"}');
						}
						
						$.ajax({
							url: "websiteElementAdd.php?dopost=saveManageType",
							data: "data=["+data.join(",")+"]",
							type: "POST",
							dataType: "json",
							success: function(data){
								if(data){
									var option = [];
									for(var i = 0; i < data.length; i++){
										option.push('<option value="'+data[i].id+'">'+data[i].name+'</option>')
									}
									$("#appstype").html(option.join(""));
									$("#typeList").siblings(".input-tips").hide();
								}
							}
						});
					},
					cancel: true
				});
				
				//提示
				parent.$('.menu-itemlist i, .menu-itemlist a').tooltip();
				parent.$('.menu-itemlist i').bind("mousedown", function(){
					parent.$('.menu-itemlist i').tooltip("hide");
				});
				//拖动排序
				parent.$(".menu-itemlist").dragsort({ dragSelector: "li>i", placeHolderTemplate: '<li class="holder"></li>' });
				
				//删除
				parent.$('.menu-itemlist').delegate("a", "click", function(){
					var parent = $(this).parent(), id = parent.attr("data-id");
					if(id != ""){
						$.dialog.confirm("确定要删除吗？<br />此操作将同时删除分类下的应用，请谨慎操作！", function(){
							parent.remove();
							$("#appstype option").each(function(index, element) {
                                if($(this).attr("value") == id){
									$(this).remove();
								}
                            });
							
							$.ajax({
								url: "websiteElementAdd.php?dopost=delManageType",
								data: "id="+id,
								type: "POST"
							});
							
						})
					}else{
						parent.remove();
					}
				});
				
				//新增
				parent.$("#addNewManageType").bind("click", function(){
					var html = '<li data-id=""><i data-toggle="tooltip" data-placement="top" data-original-title="拖动以排序" class="icon-move"></i><input type="text" name="name[]" value="" placeholder="请输入分类名" /><a data-toggle="tooltip" data-placement="top" data-original-title="删除" href="javascript:;" class="icon-trash"></a></li>';
					parent.$(".menu-itemlist").append(html);
				});
			}
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
	
	//搜索回车提交
    $("#editform input").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#btnSubmit").click();
        }
    });
	
	//提示
	$('.themeList i, .themeList a').tooltip();
	$('.themeList i').bind("mousedown", function(){
		$('.themeList i').tooltip("hide");
	});
	
	//拖动排序
	$(".themeList").dragsort({ dragSelector: "li>i", placeHolderTemplate: '<li class="holder"></li>' });
	
	//选择颜色组
	var colorArr = ["white|白色", "black|黑色", "red|红色", "orange|橙色", "yellow|黄色", "green|绿色", "blue|蓝色", "cyan|青色", "purple|紫色", "|无"];
	var colorObj = null;
	$(".themeList").delegate(".color_pick", "click", function(){
		var t = $(this), obj = $("#colorPicker"), position = $(this).offset();
		obj.html() != undefined ? obj.remove() : "";
		
		colorObj = t;
		
		var colorHtml = [];
		for(var i = 0; i < colorArr.length; i++){
			var c = colorArr[i].split("|"),
				h = '<a href="javascript:;" style="background-color:'+c[0]+'" title="'+c[1]+'"><i></i></a>';
			if(c[0] == ""){
				h = '<a href="javascript:;" style="background-color:" title="'+c[1]+'"><i>'+c[1]+'</i></a>';
			}
			colorHtml.push(h);
		}
		
		$("<div>")
			.attr("id", "colorPicker")
			.attr("class", "colorPicker")
			.css({"left": position.left, "top": position.top+30})
			.html(colorHtml.join(""))
			.appendTo("body");
	});
	
	$("#colorPicker a").live("click", function(){
		var val = $(this).attr("style").replace("background-color:", "");
		colorObj.siblings(".color").val(val);
		colorObj.find("em").attr("style", "background:"+val);
		$("#colorPicker").remove();
	});
	
	$(document).click(function (e) {
        var s = e.target;
        if (!jQuery.contains($(".themeList").get(0), s)) {
            if (jQuery.inArray(s.id, "colorPicker") < 0) {
                $("#colorPicker").remove();
            }
        }
    });
	
	//删除
	$(".themeList").delegate(".icon-trash", "click", function(){
		var t = $(this), id = t.siblings(".ids").val();
		if(id != ""){
			$.dialog.confirm("确认要删除吗？", function(){
				$.ajax({
					url: "websiteElementAdd.php?dopost=delTheme",
					data: "id="+id,
					type: "POST"
				});
				t.parent().remove();
			});
		}else{
			t.parent().remove();
		}
	});
	
	//增加风格
	$("#addNewTheme").bind("click", function(){
		var html = '<li><i data-toggle="tooltip" data-placement="right" data-original-title="拖动以排序" class="icon-move"></i><input class="ids" type="hidden" name="ids[]" value=""><input type="text" name="name[]" value="" placeholder="风格名"><input class="color" type="hidden" name="color[]" value=""><div class="color_pick"><em></em></div><a data-toggle="tooltip" data-placement="right" data-original-title="删除" href="javascript:;" class="icon-trash"></a></li>';
		$(".themeList").append(html);
		
		$('.themeList i, .themeList a').tooltip();
		$('.themeList i').bind("mousedown", function(){
			$('.themeList i').tooltip("hide");
		});
	});
	
	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			type         = $("#type"),
			appstype     = $("#appstype").val(),
			weight       = $("#weight");
			
		if(!huoniao.regex(title)){
			huoniao.goInput(title);
			return false;
		};
		
		if($("input[name=sort]:checked").val() == "apps"){
			if(appstype == "" || appstype == 0){
				huoniao.goInput($("#appstype"));
				$("#typeList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
				return false;
			}else{
				$("#typeList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
		
		if(!huoniao.regex(weight)){
			return false;
		}
		
		t.attr("disabled", true);
		
		//异步提交
		huoniao.operaJson("websiteElementAdd.php", $("#editform").serialize() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){
					$.dialog({
						fixed: true,
						title: "添加成功",
						icon: 'success.png',
						content: "添加成功！",
						ok: function(){
							huoniao.goTop();
							window.location.reload();
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
								$("body",parent.document).find("#nav-websiteElementphp").click();
								parent.reloadPage($("body",parent.document).find("#body-websiteElementphp"));
								$("body",parent.document).find("#nav-websiteElementEdit"+id+" s").click();
							}catch(e){
								location.href = thisPath + "websiteElement.php";
							}
						},
						cancel: false
					});
				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});
	
});