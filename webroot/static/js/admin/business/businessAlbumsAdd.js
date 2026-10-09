$(function () {

	huoniao.parentHideTip();
	$(".chosen-select").chosen();

	$("#uid").change(function(){
		var uid = $(this).val();
		if(uid){
			$.ajax({
				type: "GET",
				url: "?dopost=getTypeList&id="+uid,
				dataType: "json",
				success: function(data){
					var content = [];
					content.push('<option value="0">请选择</option>');
					if(data){
						for(var i = 0; i < data.length; i++){
							var sel = data[i].id == typeid ? " selected" : "";
							content.push('<option value="'+data[i].id+'"'+sel+'>'+data[i].typename+'</option>');
						}
					}
					$("#typeid").html(content.join(""));

				},
				error: function(msg){
					$.dialog.alert("网络错误，请刷新页面重试！");
				}
			});
		}
	}).change();

	//管理新闻分类
	$("#typeBtn").bind("click", function(){
		var uid = $("#uid").val();

		if(uid == "" || uid == 0){
			$.dialog.alert("请先选择所属商家！");
			return false;
		}

		$.ajax({
			url: "?dopost=getTypeList&id="+uid,
			type: "GET",
			dataType: "json",
			success: function(data){
				var content = [], html = "";
				if(data){
					for(var i = 0; i < data.length; i++){
						content.push('<li data-id="'+data[i].id+'"><i data-toggle="tooltip" data-placement="top" data-original-title="拖动以排序" class="icon-move"></i><input type="text" name="name[]" value="'+data[i].typename+'" /><a data-toggle="tooltip" data-placement="top" data-original-title="删除" href="javascript:;" class="icon-trash"></a></li>');
					}
				}
				html = '<ul class="menu-itemlist">'+content.join("")+'</ul>';
				html += '<a href="javascript:;" id="addNewManageType"><i class="icon-plus"></i>新增分类</a>';

				$.dialog({
					id: "ManageType",
					title: "管理相册分类",
					content: html,
					width: 360,
					ok: function(){
						var data = [], itemList = self.parent.$(".menu-itemlist li");
						for(var i = 0; i < itemList.length; i++){
							var obj = itemList.eq(i), id = obj.attr("data-id"), weight = obj.index(), val = obj.find("input").val();
							data.push('{"id": "'+id+'", "weight": "'+weight+'", "val": "'+val+'"}');
						}

						$.ajax({
							url: "?dopost=saveManageType&uid="+uid,
							data: "data=["+data.join(",")+"]",
							type: "POST",
							dataType: "json",
							success: function(data){
								if(data){
									var option = [];
									for(var i = 0; i < data.length; i++){
										var sel = data[i].id == typeid ? " selected" : "";
										option.push('<option value="'+data[i].id+'">'+data[i].typename+'</option>');
									}
									$("#typeid").html(option.join(""));
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
						$.dialog.confirm("确定要删除吗？<br />此操作将同时删除分类下的动态，请谨慎操作！", function(){
							parent.remove();
							$("#typeid option").each(function(index, element) {
								if($(this).attr("value") == id){
									$(this).remove();
								}
              });

							$.ajax({
								url: "?dopost=delManageType&uid="+uid+"&id="+id,
								type: "GET"
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



	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];


	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t    = $(this),
			uid    = $("#uid").val(),
			id     = $("#id").val(),
			typeid = $("#typeid").val();

		//商家
		if(uid == "" || uid == 0){
			huoniao.goTop();
			$.dialog.alert("请选择所属商家！");
			return false;
		}

		//分类
		if(typeid == "" || typeid == 0){
			huoniao.goTop();
			$.dialog.alert("请选择所属分类！");
			return false;
		}

		t.attr("disabled", true);

		$.ajax({
			type: "POST",
			url: "?dopost="+$("#dopost").val(),
			data: $(this).parents("form").serialize() + "&submit=" + encodeURI("提交"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#dopost").val() == "add"){
						huoniao.parentTip("success", "发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
						huoniao.goTop();
						location.reload();
					}else{
						huoniao.parentTip("success", "修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
						t.attr("disabled", false);
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
