$(function(){

	var defaultBtn = $("#delBtn"),
		init = {

			//选中样式切换
			funTrStyle: function(){
				var trLength = $("#list tbody tr").length, checkLength = $("#list tbody tr.selected").length;
				if(trLength == checkLength){
					$("#selectBtn .check").removeClass("checked").addClass("checked");
				}else{
					$("#selectBtn .check").removeClass("checked");
				}

				if(checkLength > 0){
					defaultBtn.show();
				}else{
					defaultBtn.hide();
				}
			}

			//菜单递归分类
			,selectTypeList: function(){
				var typeList = [], title = "全部分类";
				typeList.push('<ul class="dropdown-menu">');
				typeList.push('<li><a href="javascript:;" data-id="">'+title+'</a></li>');

				var l = typeListArr;
				for(var i = 0; i < l.length; i++){
					(function(){
						var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
						if(jArray.length > 0){
							cl = ' class="dropdown-submenu"';
						}
						typeList.push('<li'+cl+'><a href="javascript:;" data-id="'+jsonArray["id"]+'">'+jsonArray["typename"]+'</a>');
						if(jArray.length > 0){
							typeList.push('<ul class="dropdown-menu">');
						}
						for(var k = 0; k < jArray.length; k++){
							if(jArray[k]['lower'] != ""){
								arguments.callee(jArray[k]);
							}else{
								typeList.push('<li><a href="javascript:;" data-id="'+jArray[k]["id"]+'">'+jArray[k]["typename"]+'</a></li>');
							}
						}
						if(jArray.length > 0){
							typeList.push('</ul></li>');
						}else{
							typeList.push('</li>');
						}
					})(l[i]);
				}

				typeList.push('</ul>');
				return typeList.join("");
			}

			//删除
			,del: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("houseFaqList.php?dopost=del", "id="+id, function(data){
						if(data.state == 100){
							$("#selectBtn a:eq(1)").click();
							getList();
						}else{
							var info = [];
							for(var i = 0; i < $("#list tbody tr").length; i++){
								var tr = $("#list tbody tr:eq("+i+")");
								for(var k = 0; k < data.info.length; k++){
									if(data.info[k] == tr.attr("data-id")){
										info.push("▪ "+tr.find("td:eq(1) a").text());
									}
								}
							}
							$.dialog.alert("<div class='errInfo'><strong>以下信息删除失败：</strong><br />" + info.join("<br />") + '</div>', function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}

			//树形递归分类
			,treeTypeList: function(){
				var l=typeListArr.length, typeList = [], cl = "";
				typeList.push('<option value="">选择分类</option>');
				for(var i = 0; i < l; i++){
					(function(){
						var jsonArray =arguments[0], jArray = jsonArray.lower;
						typeList.push('<option value="'+jsonArray["id"]+'">'+cl+"|--"+jsonArray["typename"]+'</option>');
						for(var k = 0; k < jArray.length; k++){
							cl += '    ';
							if(jArray[k]['lower'] != null){
								arguments.callee(jArray[k]);
							}else{
								typeList.push('<option value="'+jArray[k]["id"]+'">'+cl+"|--"+jArray[k]["typename"]+'</option>');
							}
						}
						if(jsonArray["lower"] == null){
							cl = "";
						}else{
							cl = cl.replace("    ", "");
						}
					})(typeListArr[i]);
				}
				return typeList.join("");
			}

			//快速编辑
			,quickEdit: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					id = checked.attr("data-id");
					huoniao.showTip("loading", "正在获取信息，请稍候...");

					huoniao.operaJson("houseFaqList.php?dopost=getDetail", "id="+id, function(data){
						if(data != null && data.length > 0){
							data = data[0];
							huoniao.showTip("success", "获取成功！", "auto");
							$.dialog({
								fixed: true,
								title: '快速编辑',
								content: $("#quickEdit").html(),
								width: 600,
								ok: function(){
									//提交
									var typeid = self.parent.$("#typeid").val(),
										body   = self.parent.$("#body").val(),
										serialize = self.parent.$(".quick-editForm").serialize();

									if(typeid == ""){
										$.dialog.alert("请选择所属栏目");
										return false;
									}

									huoniao.operaJson("houseFaqList.php?dopost=updateDetail", "id="+id+"&"+serialize, function(data){
										if(data.state == 100){
											huoniao.showTip("success", data.info, "auto");
											$("#selectBtn a:eq(1)").click();
											setTimeout(function() {
												getList();
											}, 800);
										}else if(data.state == 101){
											$.dialog.alert(data.info);
											return false;
										}else{
											huoniao.showTip("error", data.info, "auto");
											$("#selectBtn a:eq(1)").click();
											setTimeout(function() {
												getList();
											}, 800);
										}
									});

								},
								cancel: true
							});

							//填充信息
							self.parent.$("#typeid").html(init.treeTypeList());
							self.parent.$("#typeid").find("option").each(function(){
								if($(this).val() == data.typeid){
									$(this).attr("selected", true);
								}
							});
							self.parent.$("#title").html(data.title);
							self.parent.$("#body").val(data.body);
							self.parent.$("#click").val(data.click);

							self.parent.$("#state").find("option").each(function(){
								if($(this).val() == data.state){
									$(this).attr("selected", true);
								}
							});

						}else{
							huoniao.showTip("error", "信息获取失败！", "auto");
						}
					});
				}

			}

		};

	//菜单递归分类
	$("#typeBtn").append(init.selectTypeList());

	//初始加载
	getList();
	
	huoniao.choseCity($(".choseCity"),$("#cityid"))
    $(".chosen-select").chosen();

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#sType").html($("#typeBtn").attr("data-id"));
		$("#list").attr("data-atpage", 1);
		getList();
	});

	//搜索回车提交
    $("#keyword").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#searchBtn").click();
        }
    });

	//二级菜单点击事件
	$("#typeBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#typeBtn").attr("data-id", id);
		$("#typeBtn button").html(title+'<span class="caret"></span>');
	});

	$("#pageBtn, #paginationBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
		obj.attr("data-id", id);
		if(obj.attr("id") == "paginationBtn"){
			var totalPage = $("#list").attr("data-totalpage");
			$("#list").attr("data-atpage", id);
			obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
			$("#list").attr("data-atpage", id);
		}else{

			$("#typeBtn")
				.attr("data-id", "")
				.find("button").html('全部分类<span class="caret"></span>');

			$("#sType").html("");

			if(obj.attr("id") != "propertyBtn"){
				obj.find("button").html(title+'<span class="caret"></span>');
			}
			$("#list").attr("data-atpage", 1);
		}
		getList();
	});

	//下拉菜单过长设置滚动条
	$(".dropdown-toggle").bind("click", function(){
		if($(this).parent().attr("id") != "typeBtn"){
			var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
			$(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
		}
	});

	//全选、不选
	$("#selectBtn a").bind("click", function(){
		var id = $(this).attr("data-id");
		if(id == 1){
			$("#selectBtn .check").addClass("checked");
			$("#list tr").removeClass("selected").addClass("selected");

			defaultBtn.show();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
		}
	});

	//修改
	$("#list").delegate(".edit", "click", function(event){
		init.quickEdit();
	});

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});

	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});

	//单选
	$("#list tbody").delegate("tr", "click", function(event){
		var isCheck = $(this), checkLength = $("#list tbody tr.selected").length;
		if(event.target.className.indexOf("check") > -1) {
			if(isCheck.hasClass("selected")){
				isCheck.removeClass("selected");
			}else{
				isCheck.addClass("selected");
			}
		}else if(event.target.className.indexOf("edit") > -1 || event.target.className.indexOf("revert") > -1 || event.target.className.indexOf("del") > -1) {
			$("#list tr").removeClass("selected");
			isCheck.addClass("selected");
		}else{
			if(checkLength > 1){
				$("#list tr").removeClass("selected");
				isCheck.addClass("selected");
			}else{
				if(isCheck.hasClass("selected")){
					isCheck.removeClass("selected");
				}else{
					$("#list tr").removeClass("selected");
					isCheck.addClass("selected");
				}
			}
		}

		init.funTrStyle();
	});

	//拖选功能
	$("#list tbody").selectable({
		distance: 3,
		cancel: '.check, a',
		start: function(){
			//$("#smartMenu_state").remove();
		},
		stop: function() {
			init.funTrStyle();
		}
	});

	//分类链接点击
	$("#list").delegate(".type", "click", function(event){
		event.preventDefault();
		var id = $(this).attr("data-id"), txt = $(this).text();

		$("#typeBtn")
			.attr("data-id", id)
			.find("button").html(txt+'<span class="caret"></span>');

		$("#sType").html(id);

		$("#list").attr("data-atpage", 1);
		getList();

		$("#selectBtn a:eq(1)").click();
	});

});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		sType    = $("#sType").html(),
        cityid   = $("#cityid").val(),
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("sType="+sType);
        data.push("cityid="+cityid);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("houseFaqList.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, houseFaqList = val.houseFaqList;
		if(val.state == "100"){
			huoniao.hideTip();

			obj.attr("data-totalpage", val.pageInfo.totalPage);

			for(i; i < houseFaqList.length; i++){
				list.push('<tr data-id="'+houseFaqList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				list.push('  <td class="row30 left"><a href="'+houseFaqList[i].url+'" target="_blank">'+houseFaqList[i].title+'</a></td>');
                list.push('  <td class="row9">'+houseFaqList[i].cityname+'</td>');
				list.push('  <td class="row10"><a href="javascript:;" data-id="'+houseFaqList[i].typeid+'" class="type">'+houseFaqList[i].type+'</a></td>');
				list.push('  <td class="row10">'+houseFaqList[i].people+'</td>');
				list.push('  <td class="row10">'+houseFaqList[i].phone+'</td>');
				list.push('  <td class="row12">'+houseFaqList[i].date+'</td>');
				list.push('  <td class="row8">'+houseFaqList[i].state+'</td>');
				list.push('  <td class="row8"><a data-id="'+houseFaqList[i].id+'" data-title="'+houseFaqList[i].title+'" href="javascript:;" title="修改" class="edit">编辑</a><a href="javascript:;" title="删除" class="del">删除</a></td>');
				list.push('</tr>');
			}

			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();
			huoniao.showPageInfo();
		}else{
			obj.attr("data-totalpage", "1");

			huoniao.showPageInfo();

			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
