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
				var l=addrListArr, c = addrid;
				typeList.push('<option value="">不限区域</option>');
			}else{
				var l=newsListArr, c = newstypeid;
				typeList.push('<option value="">所有分类</option>');
			}
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(c == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";
						if(c == jArray[k]["id"]){
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

	};
	
	//填充栏目分类
	$("#addr").html(init.treeTypeList("addr"));
	
	//填充资讯分类
	$("#newstype").html(init.treeTypeList("newstype"));
	
	//开始、结束时间
	$("#start, #end").datetimepicker({format: 'yyyy-mm-dd', minView: 2, autoclose: true, language: 'ch'});
	
	//分类切换
	$("#type").change(function(){
		var val = $(this).val();
		$(".listitem").hide();
		$("#"+val+"List").show();
		if(val == "zhaobiao" || val == "store"){
			$("#addrList").show();
		}else{
			$("#addrList").hide();
		}
	});
	
	//装修类别切换
	$("input[name='casetype']").bind("click", function(){
		$(".styleObj").hide();
		$("#style"+$(this).val()).show();
	});
	
	//预览
	$("#preview").bind("click", function(){
		var data = [], type = $("#type").val();
		data.push("t="+type);
		//装修招标
		if(type == "zhaobiao"){
			data.push("addrid="+$("#addr").val());
			data.push("type="+$("input[name='zhaobiaotype']:checked").val());
			data.push("price="+$("#zhaobiaoprice").val());
			data.push("nature="+$("#zhaobiaonature").val());
			data.push("orderby="+$("#zhaobiaoorderby").val());
		//装修公司
		}else if(type == "store"){
			data.push("addrid="+$("#addr").val());
			data.push("jiastyle="+$("#storejiastyle").val());
			data.push("comstyle="+$("#storecomstyle").val());
			data.push("style="+$("#storestyle").val());
			var flags = [], obj = $("#flags input");
			for(var i = 0; i < obj.length; i++){
				if(obj.eq(i).is(":checked")){
					flags.push(obj.eq(i).val());
				}
			}
			data.push("property="+flags.join(","));
		//装修团队
		}else if(type == "team"){
			data.push("company="+$("#teamstore").val());
			data.push("special="+$("#teamspecial").val());
			data.push("style="+$("#teamstyle").val());
			data.push("works="+$("#teamworks1").val()+","+$("#teamworks2").val());
		//装修作品
		}else if(type == "case"){
			data.push("company="+$("#casestore").val());
			var type = $("input[name='casetype']:checked").val();
			data.push("type="+type);
			if(type == 0){
				data.push("jiastyle="+$("#casejiastyle").val());
				data.push("style="+$("#casestyle").val());
			}else{
				data.push("comstyle="+$("#casecomstyle").val());
			}
			
			data.push("apartment="+$("#caseprice").val());
			data.push("units="+$("#caseunits").val());
			data.push("area="+$("#casearea1").val()+","+$("#casearea2").val());
		//装修日志
		}else if(type == "diary"){
			data.push("company="+$("#diarystore").val());
			data.push("btype="+$("input[name='diarytype']:checked").val());
			data.push("units="+$("#diaryunits").val());
			data.push("stage="+$("#diarystage").val());
		//装修大学
		}else if(type == "news"){
			data.push("typeid="+$("#newstype").val());
		}
		
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
		
		var data = [], it = [], type = $("#type").val();
		data.push("dopost="+$("#dopost").val());
		data.push("id="+$("#id").val());
		data.push("token="+$("#token").val());
		data.push("name="+$("#name").val());
		data.push("type="+$("#type").val());
		
		//装修招标
		if(type == "zhaobiao"){
			var addrid = $("#addr").val(),
				type = $("input[name='zhaobiaotype']:checked").val(),
				price = $("#zhaobiaoprice").val(),
				nature = $("#zhaobiaonature").val(),
				orderby = $("#zhaobiaoorderby").val();
				
			addrid != "" ? it.push('"addrid":'+addrid) : "";
			type != "" ? it.push('"type":'+type) : "";
			price != "" ? it.push('"price":'+price) : "";
			nature != "" ? it.push('"nature":'+nature) : "";
			orderby != "" ? it.push('"orderby":'+orderby) : "";
		//装修公司
		}else if(type == "store"){
			var addrid = $("#addr").val(),
				jiastyle = $("#storejiastyle").val(),
				comstyle = $("#storecomstyle").val(),
				style = $("#storestyle").val();
				
				var flags = [], obj = $("#flags input"), property = "";
				for(var i = 0; i < obj.length; i++){
					if(obj.eq(i).is(":checked")){
						flags.push(obj.eq(i).val());
					}
				}
				if(flags.length > 0){
					property = flags.join(",");
				}
				
			addrid != "" ? it.push('"addrid":'+addrid) : "";
			jiastyle != "" ? it.push('"jiastyle":'+jiastyle) : "";
			comstyle != "" ? it.push('"comstyle":'+comstyle) : "";
			style != "" ? it.push('"style":'+style) : "";
			property != "" ? it.push('"property":'+property) : "";
		//装修团队
		}else if(type == "team"){
			var company = $("#teamstore").val(),
				special = $("#teamspecial").val(),
				style = $("#teamstyle").val(),
				works1 = $("#teamworks1").val(),
				works2 = $("#teamworks2").val();
				
			company != "" ? it.push('"company":'+company) : "";
			special != "" ? it.push('"special":'+special) : "";
			style != "" ? it.push('"style":'+style) : "";
			works1 != "" && works2 != "" ? it.push('"works":"'+works1+","+works2+'"') : "";
		//装修案例
		}else if(type == "case"){
			var company = $("#casestore").val(),
				type = $("input[name='casetype']:checked").val();
				
			if(type == 0){
				var jiastyle = $("#casejiastyle").val();
				var style    = $("#casestyle").val();
				
				jiastyle != "" ? it.push('"jiastyle":'+jiastyle) : "";
				style != "" ? it.push('"style":'+style) : "";
			}else{
				var comstyle = $("#casecomstyle").val();
				
				comstyle != "" ? it.push('"comstyle":'+comstyle) : "";
			}
			
			var apartment = $("#caseprice").val(),
				units = $("#caseunits").val(),
				area1 = $("#casearea1").val(),
				area2 = $("#casearea2").val();
				
			company != "" ? it.push('"company":'+company) : "";
			type != "" ? it.push('"type":'+type) : "";
			apartment != "" ? it.push('"apartment":'+apartment) : "";
			units != "" ? it.push('"units":'+units) : "";
			area1 != "" && area2 != "" ? it.push('"area":"'+area1+","+area2+'"') : "";
		//装修日记
		}else if(type == "diary"){
			var company = $("#diarystore").val(),
				btype = $("input[name='diarytype']:checked").val(),
				units = $("#diaryunits").val(),
				stage = $("#diarystage").val();
				
			company != "" ? it.push('"company":'+company) : "";
			btype != "" ? it.push('"btype":'+btype) : "";
			units != "" ? it.push('"units":'+units) : "";
			stage != "" ? it.push('"stage":'+stage) : "";
		//资讯
		}else if(type == "news"){
			var newstype = $("#newstype").val();
			
			newstype != "" ? it.push('"typeid":'+newstype) : "";
		}
		data.push("item="+"{"+it.join(", ")+"}");

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