$(function(){
	var treeLevel = 0;
	var init = {
		
		//拼接分类
		printListTree: function(){
			var typeList = [], l = zjUserGroupArr.length, cl = -45, level = 0;
			for(var i = 0; i < l; i++){
				(function(){
					var jsonArray =arguments[0];
					typeList.push('<li class="li'+level+'">');
					
					typeList.push('<div class="tr clearfix" data-id="'+jsonArray["id"]+'">');
					typeList.push('  <div class="row20 left">&nbsp;&nbsp;<input type="text" class="input-medium" value="'+jsonArray["typename"]+'"></div>');
					typeList.push('  <div class="row20 left"><input type="text" class="input-small" value="'+jsonArray["num"]+'"></div>');
					typeList.push('  <div class="row30 left"><input type="text" value="'+jsonArray["icon"]+'"></div>');
					typeList.push('  <div class="row20 left"><img src="'+jsonArray["icon"]+'" /></div>');
					typeList.push('  <div class="row10"><a href="javascript:;" class="del" title="删除">删除编辑</a></div>');
					typeList.push('</div>');
					
					typeList.push('</li>');
				})(zjUserGroupArr[i]);
			}
			$(".root").html(typeList.join(""));
			init.dragsort();
		}
		
		//拖动排序
		,dragsort: function(){
			//一级
			$('.root').sortable({
	            items: '>li.li0',
				placeholder: 'placeholder',
	            orientation: 'vertical',
	            axis: 'y',
				handle:'>div.tr',
	            opacity: .5,
	            revert: 0,
				stop:function(){
					$("#saveBtn").click();
				}
	        });
		}
	};
	
	//拼接现有分类
	if(zjUserGroupArr != ""){
		init.printListTree();
	};
	
	//底部添加
	$("#addNew").bind("click", function(){
		var html = [];
		
		html.push('<li class="li0">');
		html.push('  <div class="tr clearfix" data-id="0">');
		html.push('    <div class="row20 left">&nbsp;&nbsp;<input type="text" class="input-medium" value=""></div>');
		html.push('    <div class="row20 left"><input type="text" class="input-small" value=""></div>');
		html.push('    <div class="row30 left"><input type="text" value=""></div>');
		html.push('    <div class="row20 left">&nbsp;</div>');
		html.push('    <div class="row10"><a href="javascript:;" class="del">删除</a></div>');
		html.push('  </div>');
		html.push('</li>');
		
		$(this).parent().parent().prev(".root").append(html.join(""));
	});
	
	//鼠标经过li
	$("#list").delegate(".tr", "mouseover", function(){
		$(this).parent().addClass("hover");
	});
	$("#list").delegate(".tr", "mouseout", function(){
		$(this).parent().removeClass("hover");
	});
	
	//删除
	$(".root").delegate(".del", "click", function(event){
		event.preventDefault();
		var t = $(this), id = t.parent().parent().attr("data-id"), type = t.parent().text();
		
		//从数据库删除
		if(type.indexOf("编辑") > -1){
			$.dialog.confirm("此操作不可恢复，请谨慎操作！", function(){
				huoniao.operaJson("zjUserGroup.php?dopost=del", "id="+id, function(data){
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
			t.parent().parent().parent().remove();
		}
	});
	
	$("#list").on("submit", function(event){
		event.preventDefault();
	});
	
	//保存
	$("#saveBtn").bind("click", function(){
		var first = $("ul.root>li"), json = '[';
		for(var i = 0; i < first.length; i++){
			(function(){
				var html =arguments[0], count = 0, tr = $(html).find(".tr input"), 
					id = $(html).find(".tr").attr("data-id"), val = tr.eq("0").val(), num = tr.eq("1").val(), icon = tr.eq("2").val();

				if(val != ""){
					json = json + '{"id": "'+id+'", "name": "'+encodeURIComponent(val)+'", "num": "'+num+'", "icon": "'+icon+'"},';
				}
			})(first[i]);
		}
		json = json.substr(0, json.length-1);
		json = json + ']';
		
		huoniao.operaJson("zjUserGroup.php?dopost=typeAjax", "data="+json, function(data){
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