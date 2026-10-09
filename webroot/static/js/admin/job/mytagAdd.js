$(function () {
	
	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" ); 
		thisUPage = tmpUPage[ tmpUPage.length-1 ]; 
		thisPath  = thisURL.split(thisUPage)[0];
	
	var init = {
		//树形递归分类
		treeTypeList: function(type){
			var typeList = [], cl = "";
			if(type == "type"){
				var l=typeListArr, c = typeid;
				typeList.push('<option value="">不限类别</option>');
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
	
	//填充职位类别
	$("#posttype").html(init.treeTypeList("type"));
	
	//填充职位类别
	$("#resumetype").html(init.treeTypeList("type"));
	
	//填充资讯分类
	$("#newstype").html(init.treeTypeList("newstype"));
	
	//开始、结束时间
	$("#start, #end").datetimepicker({format: 'yyyy-mm-dd', minView: 2, autoclose: true, language: 'ch'});
	
	//分类切换
	$("#type").change(function(){
		var val = $(this).val();
		$(".listitem").hide();
		$("#"+val+"List").show();
	});
	
	//预览
	$("#preview").bind("click", function(){
		var data = [], type = $("#type").val();
		data.push("t="+type);
		//招聘职位
		if(type == "post"){
			data.push("type="+$("#posttype").val());
			data.push("experience="+$("#postexperience").val());
			data.push("educational="+$("#posteducational").val());
			data.push("nature="+$("#postnature").val());
		//招聘简历
		}else if(type == "resume"){
			data.push("type="+$("#resumetype").val());
			data.push("experience="+$("#resumeexperience").val());
			data.push("educational="+$("#resumeeducational").val());
			data.push("nature="+$("#resumenature").val());
		//一句话
		}else if(type == "sentence"){
			data.push("type="+$("input[name='sentencetype']:checked").val());
		//招聘资讯
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
		
		//招聘职位
		if(type == "post"){
			var type = $("#posttype").val(),
				experience = $("#postexperience").val(),
				educational = $("#posteducational").val(),
				nature = $("#postnature").val();
				
			type != "" ? it.push('"type":'+type) : "";
			experience != "" ? it.push('"experience":'+experience) : "";
			educational != "" ? it.push('"educational":'+educational) : "";
			nature != "" ? it.push('"nature":'+nature) : "";
		//招聘简历
		}else if(type == "resume"){
			var type = $("#resumetype").val(),
				experience = $("#resumeexperience").val(),
				educational = $("#resumeeducational").val(),
				nature = $("#resumenature").val();
				
			type != "" ? it.push('"type":'+type) : "";
			experience != "" ? it.push('"experience":'+experience) : "";
			educational != "" ? it.push('"educational":'+educational) : "";
			nature != "" ? it.push('"nature":'+nature) : "";
		//一句话
		}else if(type == "sentence"){
			var type = $("input[name='sentencetype']:checked").val();
			
			type != "" ? it.push('"type":'+type) : "";
		//招聘资讯
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