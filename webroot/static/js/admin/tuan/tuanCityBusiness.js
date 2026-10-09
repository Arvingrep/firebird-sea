$(function(){

	//新增商圈
	$(".btn-primary").bind("click", function(){
		$.dialog({
			fixed: true,
			title: '新增商圈',
			content: $("#addNew").html(),
			width: 450,
			ok: function(){

				var qid = parent.$("#qBtn").val(), hot = parent.$("#hot").is(":checked") ? 1 : 0, name = $.trim(parent.$("#name").val());

				if(qid == 0){
					alert("请选择所属区域！");
					return false;
				}

				if(name == ""){
					alert("请输入商圈名称");
					return false;
				}

				var data = [],
				t = this;
				data.push("qid="+qid);
				data.push("hot="+hot);
				data.push("name="+name);

				huoniao.operaJson("tuanCityBusiness.php?dopost=add&cid="+cid, data.join("&"), function(data){
					if(data && data['state'] == 100){
						t.close();
						location.reload();
					}else{
						alert(data.info);
					}
				});
				return false;

			}
		});
	});

	//input焦点离开自动保存
	$("#list").delegate("input", "blur", function(){
		var id = $(this).attr("data-id"), value = $(this).val();
		if(id != "" && id != 0 && id != undefined){
			huoniao.operaJson("tuanCityBusiness.php?dopost=updateType&id="+id, "type=single&name="+value, function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
				}else if(data.state == 101){
					//huoniao.showTip("warning", data.info, "auto");
				}else{
					huoniao.showTip("error", data.info, "auto");
				}
			});
		}
	});

	//input焦点离开自动保存
	$("#list").delegate("input[type=checkbox]", "click", function(){
		var id = $(this).parent().prev("input").attr("data-id"), value = $(this).is(":checked");
		value = value ? 1 : 0;
		if(id != "" && id != 0 && id != undefined){
			huoniao.operaJson("tuanCityBusiness.php?dopost=updateType&id="+id, "type=hot&val="+value, function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
				}else if(data.state == 101){
					//huoniao.showTip("warning", data.info, "auto");
				}else{
					huoniao.showTip("error", data.info, "auto");
				}
			});
		}
	});

	//下拉菜单过长设置滚动条
	$(".dropdown-toggle").bind("click", function(){
		if($(this).parent().attr("id") != "typeBtn" && $(this).parent().attr("id") != "addrBtn"){
			var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
			$(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
		}
	});


	//删除
	$("#list").delegate(".del", "click", function(event){
		event.preventDefault();
		var t = $(this), id = t.parent().parent().find("input").attr("data-id"), type = t.parent().text();

		//从异步请求
		$.dialog.confirm("删除后无法恢复，确定要删除吗？", function(){
			huoniao.showTip("loading", "正在删除，，请稍候...");
			huoniao.operaJson("tuanCityBusiness.php?dopost=del", "id="+id, function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
					setTimeout(function() {
						location.reload();
					}, 800);
				}else{
					alert(data.info);
					return false;
				}
			});
		});

	});

});
