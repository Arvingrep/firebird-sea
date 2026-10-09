//实例化编辑器
var ue = UE.getEditor('body');

$(function () {

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];



	//管理新闻分类
	$("#manageType").bind("click", function(){
		$.ajax({
			url: "websiteArticle.php?dopost=manageType&website="+$("#website").val(),
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
					title: "管理新闻分类",
					content: content,
					width: 360,
					ok: function(){
						var data = [], itemList = self.parent.$(".menu-itemlist li");
						for(var i = 0; i < itemList.length; i++){
							var obj = itemList.eq(i), id = obj.attr("data-id"), weight = obj.index(), val = obj.find("input").val();
							data.push('{"id": "'+id+'", "weight": "'+weight+'", "val": "'+val+'"}');
						}

						$.ajax({
							url: "websiteArticle.php?dopost=saveManageType&website="+$("#website").val(),
							data: "data=["+data.join(",")+"]",
							type: "POST",
							dataType: "json",
							success: function(data){
								if(data){
									var option = [];
									for(var i = 0; i < data.length; i++){
										option.push('<option value="'+data[i].id+'">'+data[i].name+'</option>')
									}
									$("#typeid").html(option.join(""));
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
						$.dialog.confirm("确定要删除吗？<br />此操作将同时删除分类下的新闻，请谨慎操作！", function(){
							parent.remove();
							$("#typeid option").each(function(index, element) {
                                if($(this).attr("value") == id){
									$(this).remove();
								}
                            });

							$.ajax({
								url: "websiteArticle.php?dopost=delManageType&website="+$("#website").val(),
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

	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			typeid       = $("#typeid").val(),
			weight       = $("#weight");

		//标题
		if(!huoniao.regex(title)){
			huoniao.goTop();
			return false;
		};

		//分类
		if(typeid == "" || typeid == "0"){
			$("#typeList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			tj = false;
			huoniao.goTop();
			return false;
		}else{
			$("#typeList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}

		ue.sync();

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "websiteArticle.php?dopost="+$("#dopost").val(),
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					ue.execCommand('cleardoc');
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
									$("body",parent.document).find("#nav-websiteArticle"+$("#website").val()).click();
									//parent.reloadPage($("body",parent.document).find("#body-websiteArticlephp")[0].contentWindow);
									parent.reloadPage($("body",parent.document).find("#body-websiteArticle"+$("#website").val()));
									$("body",parent.document).find("#nav-websiteArticleEdit"+id+" s").click();
								}catch(e){
									location.href = thisPath + "websiteArticle.php?website="+$("#website").val();
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

	//页面刷新前提示
	window.onbeforeunload = function() {
		if (ue.hasContents()) {
			return "您正在编辑的文章没有保存，离开会导致内容丢失，是否确定离开？";
		}
	}


});
