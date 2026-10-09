$(function(){

	var init = {
		//删除
		del: function(id){

			huoniao.showTip("loading", "正在操作，请稍候...");
			huoniao.operaJson("logisticTemplate.php?dopost=del", "id="+id, function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
					setTimeout(function() {
						location.reload();
					}, 800);
				}else{
					$.dialog.alert("删除失败");
				}
			});
		}

	}

	//新增模板
	$("#addBtn").bind("click", function(){
		try {
			parent.addPage("logisticTemplateAdd"+sid, "shop", "新增运费模板", "shop/logisticTemplate.php?dopost=add&sid="+sid);
		} catch(e) {}
	});


	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("logisticTemplateEdit"+id, "shop", title, "shop/"+href);
		} catch(e) {}
	});

	//单条删除
	$("#list").delegate(".del", "click", function(){
		var id = $(this).closest("tr").data("id");
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del(id);
		});
	});



});
