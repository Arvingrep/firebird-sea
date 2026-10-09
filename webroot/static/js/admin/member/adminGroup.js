$(function(){
	//添加管理员
	$("#addAdmin").bind("click", function(){
		try {
			event.preventDefault();
			var href = $(this).attr("href");
			parent.addPage(href.replace(".", ""), "member", $(this).text(), "member/"+href);
		} catch(e) {}
	});
	
	//底部添加新分类
	$("#addNew").bind("click", function(){
		var html = [];
		
		html.push('<li class="clearfix tr">');
		html.push('  <div class="row30 left">&nbsp;&nbsp;&nbsp;&nbsp;<input data-id="0" type="text" value="" /></div>');
		html.push('  <div class="row70 left"><a href="javascript:;" class="del">删除</a></div>');
		html.push('</li>');
		
		$(this).parent().parent().prev(".root").append(html.join(""));
	});
	
	//input焦点离开自动保存
	$("#list").delegate("input", "blur", function(){
		var id = $(this).attr("data-id"), value = $(this).val();
		if(id != "" && id != 0){
			huoniao.operaJson("adminGroup.php?dopost=updateName&id="+id, "name="+value+"&token="+$("#token").val(), function(data){
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
	
	//编辑权限
	$(".root").delegate(".edit", "click", function(event){
		try {
			event.preventDefault();
			var href = $(this).attr("href");
			var t = $(this), id = t.parent().parent().find("input").attr("data-id"), val = t.parent().parent().find("input").val();
			parent.addPage("adminGroupPerm"+id, "member", val+"权限", "member/"+href);
		} catch(e) {}
	});
	
	//删除
	$(".root").delegate(".del", "click", function(event){
		event.preventDefault();
		var t = $(this), id = t.parent().parent().find("input").attr("data-id"), type = t.parent().text();
		//从数据库删除
		if(type.indexOf("编辑") > -1){
			$.dialog.confirm("此管理组下的管理员也会删除<br />确认要删除吗？", function(){
				huoniao.operaJson("adminGroup.php?dopost=del", "id="+id+"&token="+$("#token").val(), function(data){
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
		}else{
			t.parent().parent().remove();
		}
	});
	
	//保存
	$("#saveBtn").bind("click", function(){
		var first = $("ul.root>li"), json = '[';
		for(var i = 0; i < first.length; i++){
			var tr = $("ul.root>li:eq("+i+")").find("input"), id = tr.attr("data-id"), val = tr.val();
			json = json + '{"id": "'+id+'", "name": "'+encodeURIComponent(val)+'"},';
		}
		json = json.substr(0, json.length-1);
		json = json + ']';
		
		huoniao.operaJson("adminGroup.php?dopost=update", "data="+json+"&token="+$("#token").val(), function(data){
			if(data.state == 100){
				huoniao.showTip("success", data.info, "auto");
				window.scroll(0, 0);
				setTimeout(function() {
					location.reload();
				}, 800);
			}else{
				huoniao.showTip("error", data.info, "auto");
			}
		});
		
	});
	
});