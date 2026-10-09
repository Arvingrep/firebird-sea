$(function () {
	
	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" ); 
		thisUPage = tmpUPage[ tmpUPage.length-1 ]; 
		thisPath  = thisURL.split(thisUPage)[0];
	
	var init = {
		//树形递归分类
		treeTypeList: function(type){
			var typeList = [], cl = "";
			if(type == "addr"){
				var l=addrListArr;
				typeList.push('<option value="">所有地区</option>');
			}else{
				var l=typeListArr;
				typeList.push('<option value="">所有分类</option>');
			}
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if((type == "type" && typeid == jsonArray["id"]) || (type == "addr" && addr == jsonArray["id"])){
						selected = " selected";
					}
					if(jsonArray['lower'] != "" && type == "type"){
						typeList.push('<optgroup label="'+cl+"|--"+jsonArray["typename"]+'"></optgroup>');
					}else{
						typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					}
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";
						if((type == "type" && typeid == jArray[k]["id"]) || (type == "addr" && addr == jArray[k]["id"])){
							selected = " selected";
						}
						if(jArray[k]['lower'] != ""){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<option value="'+jArray[k]["id"]+'"'+selected+'>'+cl+"|--"+jArray[k]["typename"]+'</option>');
						}
						if(jsonArray["lower"] == null){
							cl = "";
						}else{
							cl = cl.replace("    ", "");
						}
					}
				})(l[i]);
			}
			return typeList.join("");
		}
		
		//异步字段html
		,ajaxItemHtml: function(data){
			$.ajax({
				type: "POST",
				url: "infoAdd.php?dopost=getInfoItem",
				data: data,
				dataType: "json",
				success: function(data){
					if(data){
						init.itemHtml(data);
					}else{
						$("#itemList").html("").hide();
					}
				}
			});
		}
		
		//字段html
		,itemHtml: function(data){
			var itemList = data.itemList, html = [];
			for(var i = 0; i < itemList.length; i++){
				if(itemList[i].type != "text"){
					html.push('<dl class="clearfix" data-id="'+itemList[i].id+'">');
					html.push('  <dt><label for="'+itemList[i].field+'">'+itemList[i].title+'：</label></dt>');
					html.push('  <dd>');
					
					var list = itemList[i].options.split(",");
					html.push('    <select name="'+itemList[i].field+'" id="'+itemList[i].field+'" class="input-large">');
					html.push('      <option value="">不限</option>');
					for(var a = 0; a < list.length; a++){
						var checked = "";
						
						if(itemArr){
							for(l = 0; l < itemArr.length; l++){
								if(itemArr[l].id == itemList[i].id && itemArr[l].value == list[a]){
									checked = " selected";
								}
							}
						}
						
						html.push('      <option value="'+list[a]+'"'+checked+'>'+list[a]+'</option>');
					}
					html.push('    </select>');

				}
				
				html.push('  </dd>');
				html.push('</dl>');
			}
			$("#itemList").html(html.join("")).show();
		}
	};
	
	//填充栏目分类
	$("#typeid").html(init.treeTypeList("type"));
	
	//填充地区
	$("#addr").html(init.treeTypeList("addr"));
	
	//首次加载
	if($("#dopost").val() == "edit"){
		init.ajaxItemHtml("typeid="+$("#typeid").val()+"&id="+$("#id").val());
	}
	
	//分类切换
	$("#typeid").change(function(){
		if($("#typeid").val() != ""){
			if($("#dopost").val() == "edit"){
				init.ajaxItemHtml("typeid="+$("#typeid").val()+"&id="+$("#id").val());
			}else{
				init.ajaxItemHtml("typeid="+$("#typeid").val());
			}
		}else{
			$("#itemList").html("").hide();
		}
	});
	
	//开始、结束时间
	$("#start, #end").datetimepicker({format: 'yyyy-mm-dd', minView: 2, autoclose: true, language: 'ch'});
	
	//预览
	$("#preview").bind("click", function(){
		var data = [];
		data.push("typeid="+$("#typeid").val());
		data.push("addr="+$("#addr").val());
		
		var itemList = [], b = 0, obj = $("#itemList").find("dl");
		for(var i = 0; i < obj.length; i++){
			var id = obj.eq(i).attr("data-id"), val = obj.eq(i).find("select").val();
			if(val != ""){
				itemList[b] = '{"id": '+id+', "value": "'+val+'"}';
				b++;
			}
		}
		
		data.push("item=["+itemList.join(",")+"]");
		data.push("valid="+$("#valid").val());
		data.push("orderby="+$("#orderby").val());
		data.push("submit="+encodeURI("预览"));
		
		$.ajax({
			type: "POST",
			url: "mytag.php?action="+module,
			data: data.join("&"),
			dataType: "json",
			success: function(data){
				var content = "";
				if(data.state == 100){
					var dataList = [], list = data.info.list;
					for(var i = 0; i < list.length; i++){
						var data_ = [];
						for(var key in list[i]){
							data_.push('<font color="red">'+key+"：</font>"+list[i][key]); 
						}
						dataList.push(data_.join("<br />"));
				 　　}
					content = dataList.join("<hr />");
				}else{
					content = data.info;
				};
				
				$.dialog({
					title: "预览结果",
					content: '<div style="height:300px; overflow-y:auto;">'+content+'</div>',
					width: 450,
					height: 300,
					ok: true
				});
				
				
			},
			error: function(msg){
				$.dialog.alert("网络错误，预览失败 ！");
			}
		});
	});
	
	//提交表单
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		var t = $(this);
		t.attr("disabled", true);
		
		var data = [];
		data.push("dopost="+$("#dopost").val());
		data.push("id="+$("#id").val());
		data.push("token="+$("#token").val());
		data.push("name="+$("#name").val());
		data.push("typeid="+$("#typeid").val());
		data.push("addr="+$("#addr").val());
		
		var itemList = [], b = 0, obj = $("#itemList").find("dl");
		for(var i = 0; i < obj.length; i++){
			var id = obj.eq(i).attr("data-id"), val = obj.eq(i).find("select").val();
			if(val != ""){
				itemList[b] = '{"id": '+id+', "value": "'+val+'"}';
				b++;
			}
		}
		
		data.push("item=["+itemList.join(",")+"]");
		data.push("valid="+$("#valid").val());
		data.push("orderby="+$("#orderby").val());
		data.push("start="+$("#start").val());
		data.push("end="+$("#end").val());
		data.push("expbody="+$("#expbody").val());
		data.push("state="+$("input[name='state']:checked").val());
		data.push("submit="+encodeURI("提交"));
		
		$.ajax({
			type: "POST",
			url: "mytag.php?action="+module,
			data: data.join("&"),
			dataType: "json",
			success: function(data){
				if(data.state == 100){
					if($("#dopost").val() == "save"){
						$.dialog({
							fixed: true,
							title: "生成成功",
							icon: 'success.png',
							content: "生成成功！",
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
									$("body",parent.document).find("#nav-mytagphpaction"+module).click();
									parent.reloadPage($("body",parent.document).find("#body-mytagphpaction"+module));
									$("body",parent.document).find("#nav-edit"+module+"Mytag"+$("#id").val()+" s").click();
								}catch(e){
									location.href = thisPath + "mytag.php?action="+module;
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