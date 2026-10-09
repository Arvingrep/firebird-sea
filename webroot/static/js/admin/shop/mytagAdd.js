$(function () {
	
	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" ); 
		thisUPage = tmpUPage[ tmpUPage.length-1 ]; 
		thisPath  = thisURL.split(thisUPage)[0];
	
	var init = {
		//树形递归分类
		treeTypeList: function(){
			var l=typeListArr.length, typeList = [], cl = "";
			typeList.push('<option value="">不限分类</option>');
			for(var i = 0; i < l; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(typeid == jsonArray["id"]){
						selected = " selected";
					}
					if(jsonArray['lower'] != ""){
						typeList.push('<optgroup label="'+cl+"|--"+jsonArray["typename"]+'"></optgroup>');
					}else{
						typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					}
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";
						if(typeid == jArray[k]["id"]){
							selected = " selected";
						}
						if(jArray[k]['lower'] != null){
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
				})(typeListArr[i]);
			}
			return typeList.join("");
		}
	};
	
	//填充栏目分类
	$("#typeid").html(init.treeTypeList());	
	
	//开始、结束时间
	$("#start, #end").datetimepicker({format: 'yyyy-mm-dd', minView: 2, autoclose: true, language: 'ch'});
	
	//分类切换
	$("#typeid").bind("change", function(){
		var t = $(this), id = t.val(), tj = false;
		if(id != ""){
			huoniao.operaJson("mytag.php?dopost=getTypeItem", "id="+id, function(data){
				if(data){
					if(data.typeItem && data.typeItem.state == 100){
						tj = true;
						var typeItem = data.typeItem.info, innerHtml = [];
						for(var i = 0; i < typeItem.length; i++){
							var infoId = typeItem[i].id, typeName = typeItem[i].typeName, listItem = typeItem[i].listItem;
							innerHtml.push('<dl class="clearfix">');
							innerHtml.push('  <dt><label for="item'+infoId+'">'+typeName+'：</label></dt>');
							innerHtml.push('  <dd><select name="typeid" id="item'+infoId+'" data-id="'+infoId+'" class="input-large">');
							innerHtml.push('<option value="">不限</option>');
							
							//默认选中
							for(var l = 0; l < listItem.length; l++){
								var itemId = listItem[l].id, itemVal = listItem[l].val, s = "";
								for(var v = 0; v < itemType.length; v++){
									if(itemType[v].id == infoId){
										if(!isNaN(itemType[v].value)){
											if(itemType[v].value == itemId){
												s = " selected";
											}
										}else{
											if(itemType[v].value == itemVal){
												s = " selected";
											}
										}
									}
								}
								innerHtml.push('<option value="'+itemId+'"'+s+'>'+itemVal+'</option>');
							}
							
							innerHtml.push('  </select></dd>');
							innerHtml.push('</dl>');
						}
						$("#itemType").html(innerHtml.join("")).show();
					}
					
					if(data.typeSpe && data.typeSpe.state == 100){
						tj = true;
						var typeSpe = data.typeSpe.info, innerHtml = [];
						for(var i = 0; i < typeSpe.length; i++){
							var infoId = typeSpe[i].id, typeName = typeSpe[i].typename, listItem = typeSpe[i].listItem;
							innerHtml.push('<dl class="clearfix">');
							innerHtml.push('  <dt><label>'+typeName+'：</label></dt>');
							innerHtml.push('  <dd class="radio" data-id="'+infoId+'">');
							
							//默认选中
							for(var l = 0; l < listItem.length; l++){
								var itemId = listItem[l].id, itemVal = listItem[l].val, s = "";
								itemSpe = itemSpe.join(",").split(",");
								if($.inArray(itemId, itemSpe) > -1){
									s = " checked";
								}
								innerHtml.push('<label><input type="checkbox" value="'+itemId+'"'+s+' />'+itemVal+'</label>');
							}
							
							innerHtml.push('  </dd>');
							innerHtml.push('</dl>');
						}
						$("#itemSpe").html(innerHtml.join("")).show();
					}
					
					if(tj){
						$("#itemList").show();
					}else{
						$("#itemList > div").html("").hide();
						$("#itemList").hide();
					}
				}else{
					$("#itemList > div").html("").hide();
					$("#itemList").hide();
				}
			});
		}else{
			$("#itemList > div").html("").hide();
			$("#itemList").hide();
		}
	});
	
	//选择所属店铺
	if($("#id").val() != ""){
		$("#typeid").change();
		createStoreType($("#store").val());
	}
	$("#store").bind("change", function(){
		var id = $(this).val();
		if(id == 0){
			$("#category").html("");
			$("#categoryObj").hide();
		}else{
			createStoreType(id);
		}
	});
	
	function createStoreType(id){
		huoniao.operaJson("mytag.php?dopost=getStoreType", "id="+storetype+"&sid="+id, function(data){
			if(data.state == 100){
				$("#category").html(data.list);
				$("#categoryObj").show();
			}else{
				$("#category").html("");
				$("#categoryObj").hide();
			}
		});
	}
	
	//预览
	$("#preview").bind("click", function(){
		var data = [];
		data.push("typeid="+$("#typeid").val());
		
		var itemList = [], b = 0, obj = $("#itemType").find("select");
		for(var i = 0; i < obj.length; i++){
			var id = obj.eq(i).attr("data-id"), val = obj.eq(i).val();
			if(val != ""){
				itemList[b] = '{"id": '+id+', "value": "'+val+'"}';
				b++;
			}
		}
		data.push("item=["+itemList.join(",")+"]");
		
		var speList = [], obj = $("#itemSpe").find("dl");
		for(var i = 0; i < obj.length; i++){
			var input = obj.eq(i).find("input"), b = 0, inputArr = [];
			for(var l = 0; l < input.length; l++){
				if(input.eq(l).is(":checked")){
					var val = input.eq(l).val();
					inputArr.push(val);
					b++;
				}
			}
			if(inputArr.length > 0){
				speList[i] = '['+inputArr.join(",")+']';
			}
		}
		data.push("specification=["+speList.join(",")+"]");
		
		data.push("store="+$("#store").val());
		data.push("storetype="+$("#category").val());
		data.push("price="+$("#price1").val()+","+$("#price2").val());
		
		var flags = [], obj = $("#flags input");
		for(var i = 0; i < obj.length; i++){
			if(obj.eq(i).is(":checked")){
				flags.push(obj.eq(i).val());
			}
		}
		
		data.push("flag="+flags.join(","));
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
		
		var itemList = [], b = 0, obj = $("#itemType").find("select");
		for(var i = 0; i < obj.length; i++){
			var id = obj.eq(i).attr("data-id"), val = obj.eq(i).val();
			if(val != ""){
				itemList[b] = '{"id": '+id+', "value": "'+val+'"}';
				b++;
			}
		}
		data.push("item=["+itemList.join(",")+"]");
		
		var speList = [], obj = $("#itemSpe").find("dl");
		for(var i = 0; i < obj.length; i++){
			var input = obj.eq(i).find("input"), b = 0, inputArr = [];
			for(var l = 0; l < input.length; l++){
				if(input.eq(l).is(":checked")){
					var val = input.eq(l).val();
					inputArr.push(val);
					b++;
				}
			}
			if(inputArr.length > 0){
				speList[i] = '['+inputArr.join(",")+']';
			}
		}
		data.push("specification=["+speList.join(",")+"]");
		
		data.push("store="+$("#store").val());
		data.push("storetype="+$("#category").val());
		data.push("price="+$("#price1").val()+","+$("#price2").val());
		
		var flags = [], obj = $("#flags input");
		for(var i = 0; i < obj.length; i++){
			if(obj.eq(i).is(":checked")){
				flags.push(obj.eq(i).val());
			}
		}
		
		data.push("flag="+flags.join(","));
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