$(function(){
	
	//初始加载表
	huoniao.operaJson("dbReplace.php?action=getTables", "", function(data){
		if(data != null && data.length > 0){
			var tables = [];
			for(var i = 0; i < data.length; i++){
				tables.push('<ul class="clearfix">');
				tables.push('  <li class="row40">'+data[i].name+'</li>');
				tables.push('  <li class="row10 center">'+data[i].Rows+'</li>');
				tables.push('  <li class="row10 center">'+data[i].Data_length+'</li>');
				tables.push('  <li class="row40">'+data[i].Comment+'</li>');
				tables.push('</ul>');
			}
			$("#tablist").html(tables.join(""));
		};
	});
	
	//点击选择表
	$("#tablist").delegate("ul", "click", function(){
		$(this).siblings("ul").removeClass("checked");
		$(this).addClass("checked");
		
		var table = $(this).find("li:eq(0)").text();
		$("#fields small").html('“'+table+'”表含有的字段：');
		$("#fields").show();
		
		//初始加载表
		huoniao.operaJson("dbReplace.php?action=getFields", "table="+table, function(data){
			if(data != null && data.length > 0){
				var field = [];
				for(var i = 0; i < data.length; i++){
					field.push('<span>'+data[i]+'</span>');
				}
				$("#fields div").html(field.join(""));
			};
		});
	});
	
	//点击选择字段
	$("#fields").delegate("span", "click", function(){
		$(this).siblings("span").removeClass("checked");
		$(this).addClass("checked");
	});
	
	//提交
	$("#btnSubmit").bind("click", function(){
		var table = $("#tablist ul.checked li:eq(0)").text(),
			field = $("#fields span.checked").text(),
			rpstring = $("#rpstring").val(),
			tostring = $("#tostring").val();
			
		if(table == ""){
			$.dialog.alert("请选择要查找的表。");
			return
		};
		
		if(field == ""){
			$.dialog.alert("请选择要查找的字段。");
			return
		};
		
		if(rpstring == ""){
			// $.dialog.alert("请输入要查找的内容。");
			// return
		};
		var data = [];
		data.push("table="+table);
		data.push("field="+field);
		data.push("rpstring="+rpstring);
		data.push("tostring="+tostring);
		data.push("token="+$("#token").val());

		if(rpstring == "" && tostring == ""){
			$.dialog.confirm('<span style="color:red;font-weight:bold;">确定要清空该字段内容吗！！！？</span>', function(){
				//提交
				huoniao.operaJson("dbReplace.php?action=apply", data.join("&"), function(data){
					if(data.state == 100){
						$.dialog({
							title: "替换成功",
							icon: 'success.png',
							content: data.info,
							ok: true
						});
					}else{
						$.dialog.alert(data.info);
					}
				});
			})
		}else{
			
			//提交
			huoniao.operaJson("dbReplace.php?action=apply", data.join("&"), function(data){
				if(data.state == 100){
					$.dialog({
						title: "替换成功",
						icon: 'success.png',
						content: data.info,
						ok: true
					});
				}else{
					$.dialog.alert(data.info);
				}
			});
		}
		
		
	});
});