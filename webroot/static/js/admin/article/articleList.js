var defaultBtn = $("#delBtn, #fullyDelBtn, #addProperty, #delProperty, #moveBtn, #batchAudit"),
	rDefaultBtn = $("#revertBtn, #fullyDelBtn"),
	checkedBtn = $("#stateBtn, #propertyBtn"),
	init = {
		//选中样式切换
		funTrStyle: function(){
			var trLength = $("#list tbody tr").length, checkLength = $("#list tbody tr.selected").length;
			if(trLength == checkLength){
				$("#selectBtn .check").removeClass("checked").addClass("checked");
			}else{
				$("#selectBtn .check").removeClass("checked");
			}

			var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";

			if(checkLength > 0){
				if(recycle != ""){
					rDefaultBtn.css('display', 'inline-block');
				}else{
					defaultBtn.css('display', 'inline-block');
				}
				checkedBtn.hide();
			}else{
				if(recycle != ""){
					rDefaultBtn.hide();
				}else{
					defaultBtn.hide();
				}
				checkedBtn.css('display', 'inline-block');
			}
		}

		//菜单递归分类
		,selectTypeList: function(dataArr, def, charlimit){
			var charlimit = charlimit || 20;
			var typeList = [];
			typeList.push('<ul class="dropdown-menu">');
			typeList.push('<li><a href="javascript:;" data-id="">'+(def ? def : '全部分类')+'</a></li>');

			var l=dataArr.length;
			for(var i = 0; i < l; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, cl = "";
					if(jArray.length > 0){
						cl = ' class="dropdown-submenu"';
					}
					typeList.push('<li'+cl+'><a href="javascript:;" data-id="'+jsonArray["id"]+'">['+jsonArray["id"]+']'+jsonArray["typename"].substr(0, charlimit)+'</a>');
					if(jArray.length > 0){
						typeList.push('<ul class="dropdown-menu">');
					}
					for(var k = 0; k < jArray.length; k++){
						if(jArray[k]['lower'] != null){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<li><a href="javascript:;" data-id="'+jArray[k]["id"]+'">['+jsonArray[k]["id"]+']'+jArray[k]["typename"]+'</a></li>');
						}
					}
					if(jArray.length > 0){
						typeList.push('</ul></li>');
					}else{
						typeList.push('</li>');
					}
				})(dataArr[i]);
			}

			typeList.push('</ul>');
			return typeList.join("");
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

		//浏览
		,showDetail: function(){
			var href = $("#list tbody tr.selected").find("td:eq(1) a").attr("href");
			window.open(href);
		}

		//快速编辑
		,quickEdit: function(){
			var checked = $("#list tbody tr.selected");
			if(checked.length < 1){
				huoniao.showTip("warning", "未选中任何信息！", "auto");
			}else{
				id = checked.attr("data-id");
				huoniao.showTip("loading", "正在获取信息，请稍候...");

				huoniao.operaJson("articleJson.php?action=getArticleDetail&dopost="+action, "id="+id, function(data){
					if(data != null && data.length > 0){
						data = data[0];
						huoniao.showTip("success", "获取成功！", "auto");
						$.dialog({
							fixed: true,
							title: '快速编辑',
							content: $("#quickEdit").html(),
							width: 400,
							ok: function(){
								//提交
								var typeid   = self.parent.$("#typeid").val(),
									title    = self.parent.$("#title").val(),
									serialize = self.parent.$(".quick-editForm").serialize();

								if(typeid == ""){
									$.dialog.alert("请选择所属栏目");
									return false;
								}

								if($.trim(title) == ""){
									$.dialog.alert("请填写标题");
									return false;
								}else{
									if(!/^.{5,60}$/.test(title)){
										$.dialog.alert("请正确填写标题\n5-60个汉字");
										return false;
									}
								}

								huoniao.operaJson("articleJson.php?action=updateDetail&dopost="+action, "id="+id+"&"+serialize, function(data){
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
						self.parent.$("#title").val(data.title);
						self.parent.$("#subtitle").val(data.subtitle);

						var flag = data.flag.split(",");
						for(var i = 0; i < flag.length; i++){
							self.parent.$(".quick-editForm input[type=checkbox][value="+flag[i]+"]").attr("checked", true);
						}

						self.parent.$("#arcrank").find("option").each(function(){
							if($(this).val() == data.arcrank){
								$(this).attr("selected", true);
							}
						});


					}else{
						huoniao.showTip("error", "信息获取失败！", "auto");
					}
				});
			}

		}

		//添加、删除属性
		,propertyForm: function(type, title){
			var checked = $("#list tbody tr.selected");
			if(checked.length < 1){
				huoniao.showTip("warning", "未选中任何信息！", "auto");
			}else{
				var id = [];
				for(var i = 0; i < checked.length; i++){
					id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
				}

				$.dialog({
					fixed: true,
					title: title,
					content: $("#propertyForm").html(),
					width: 400,
					ok: function(){

						var attr = [], checkbox = self.parent.$(".quick-editForm input[type=checkbox]");
						for(var i = 0; i < checkbox.length; i++){
							var check = self.parent.$(".quick-editForm input[type=checkbox]:eq("+i+")");
							if(check.is(":checked")){
								attr.push(check.val());
							}
						}

						if(attr == ""){
							$.dialog.alert("请选择要添加的属性！");
							return false;
						}

						huoniao.operaJson("articleJson.php?action="+type+"Property&dopost="+action, "id="+id+"&attr="+attr, function(data){
							if(data.state == 100){
								huoniao.showTip("success", data.info, "auto");
								$("#selectBtn a:eq(1)").click();
								setTimeout(function() {
									getList();
								}, 800);
							}else{

								var title = '';
								if(typeof data.info == 'string'){
									title = data.info;
								}else{
									var info = [];
									for(var i = 0; i < $("#list tbody tr").length; i++){
										var tr = $("#list tbody tr:eq("+i+")");
										for(var k = 0; k < data.info.length; k++){
											if(data.info[k] == tr.attr("data-id")){
												info.push("▪ "+tr.find(".row2 a").text());
											}
										}
									}
									title = '<strong>以下信息修改失败：</strong><br />' + info.join("<br />");
								}
								$.dialog.alert("<div class='errInfo'>" + title + "</div>", function(){
									$("#selectBtn a:eq(1)").click();
									getList();
								});
							}
						});
					},
					cancel: true
				});

			}
		}

		//删除
		,del: function(type){
			var checked = $("#list tbody tr.selected");
			if(checked.length < 1){
				huoniao.showTip("warning", "未选中任何信息！", "auto");
			}else{
				huoniao.showTip("loading", "正在操作，请稍候...");
				var id = [];
				for(var i = 0; i < checked.length; i++){
					id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
				}

				huoniao.operaJson("articleJson.php?action="+type+"&dopost="+action, "id="+id, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						$("#selectBtn a:eq(1)").click();
						setTimeout(function() {
							getList();
						}, 800);
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

		//还原
		,revert: function(){
			var checked = $("#list tbody tr.selected");
			if(checked.length < 1){
				huoniao.showTip("warning", "未选中任何信息！", "auto");
			}else{
				huoniao.showTip("loading", "正在操作，请稍候...");
				var id = [];
				for(var i = 0; i < checked.length; i++){
					id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
				}

				huoniao.operaJson("articleJson.php?action=revert&dopost="+action, "id="+id, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						setTimeout(function() {
							getList();
						}, 800);
					}else{
						var info = [];
						for(var i = 0; i < $("#list tbody tr").length; i++){
							var tr = $("#list tbody tr:eq("+i+")");
							for(var k = 0; k < data.info.length; k++){
								if(data.info[k] == tr.attr("data-id")){
									info.push("▪ "+tr.find(".row2 a").text());
								}
							}
						}
						$.dialog.alert("<div class='errInfo'><strong>以下信息操作失败：</strong><br />" + info.join("<br />") + '</div>', function(){
							getList();
						});
					}
				});
				$("#selectBtn a:eq(1)").click();
			}
		}

		//移动
		,move: function(){
			var checked = $("#list tbody tr.selected");
			if(checked.length < 1){
				huoniao.showTip("warning", "未选中任何信息！", "auto");
			}else{
				var id = [];
				for(var i = 0; i < checked.length; i++){
					id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
				}

				$.dialog({
					fixed: true,
					title: "信息移动",
					content: $("#moveForm").html(),
					width: 400,
					ok: function(){
						var typeid = self.parent.$("#typeid").val();
						if(typeid != ""){
							huoniao.operaJson("articleJson.php?action=move&dopost="+action, "id="+id+"&typeid="+typeid, function(data){
								if(data.state == 100){
									huoniao.showTip("success", data.info, "auto");
									setTimeout(function() {
										getList();
									}, 800);
								}else{
									var info = [];
									for(var i = 0; i < $("#list tbody tr").length; i++){
										var tr = $("#list tbody tr:eq("+i+")");
										for(var k = 0; k < data.info.length; k++){
											if(data.info[k] == tr.attr("data-id")){
												info.push("▪ "+tr.find(".row2 a").text());
											}
										}
									}
									$.dialog.alert("<div class='errInfo'><strong>以下信息修改失败：</strong><br />" + info.join("<br />") + '</div>', function(){
										getList();
									});
								}
							});
						}else{
							alert("请选择目标栏目");
							return false;
						}
					},
					cancel: true
				});
				self.parent.$("#typeid").html(init.treeTypeList());

			}
		}

		//更新信息状态
		,updateState: function(type){
			huoniao.showTip("loading", "正在操作，请稍候...");
			$("#smartMenu_state").remove();

			var checked = $("#list tbody tr.selected");
			if(checked.length < 1){
				huoniao.showTip("warning", "未选中任何信息！", "auto");
			}else{
				var arcrank = "";
				if(type == "待审核"){
					arcrank = 0;
				}else if(type == "已审核"){
					arcrank = 1;
				}else if(type == "拒绝审核"){
					arcrank = 2;
				}

				huoniao.showTip("loading", "正在操作，请稍候...");
				var id = [];
				for(var i = 0; i < checked.length; i++){
					id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
				}
				huoniao.operaJson("articleJson.php?action=updateState&dopost="+action, "id="+id+"&arcrank="+arcrank, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						setTimeout(function() {
							getList();
						}, 800);
					}else{
						var title = '';
						if(typeof data.info == 'string'){
							title = data.info;
						}else{
							var info = [];
							for(var i = 0; i < $("#list tbody tr").length; i++){
								var tr = $("#list tbody tr:eq("+i+")");
								for(var k = 0; k < data.info.length; k++){
									if(data.info[k] == tr.attr("data-id")){
										info.push("▪ "+tr.find(".row2 a").text());
									}
								}
							}
							title = '<strong>以下信息修改失败：</strong><br />' + info.join("<br />");
						}
						$.dialog.alert("<div class='errInfo'>" + title + "</div>", function(){
							getList();
						});
					}
				});
				$("#selectBtn a:eq(1)").click();
			}
		}

		//右键菜单
		,smartMenu: function(){
			//右键菜单功能
			var objShow = {
				text: "浏览",
				func: function() {
					init.showDetail();
				}
			},objEdit = {
				text: "快速编辑",
				func: function() {
					init.quickEdit();
				}
			}, objAddProperty = {
				text: "添加属性",
				func: function() {
					init.propertyForm("add", "添加属性");
				}
			}, objDelProperty = {
				text: "删除属性",
				func: function() {
					init.propertyForm("del", "删除属性");
				}
			}, objDel = {
				text: "删除",
				func: function() {
					init.del("del");
				}
			}, objMove = {
				text: "移动",
				func: function() {
					init.move();
				}
			}, objAudit = {
				text: "审核",
				func: function() {
					init.updateState("已审核");
				}
			};
			var listMenuData = [];

			$("#list tr").smartMenu(listMenuData, {
				name: "list",
				beforeShow: function() {
					var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";
					//alert(recycle)
					if(recycle == ""){
						if(!$(this).hasClass("selected")){
							$("#list tr").removeClass("selected");
							$(this).addClass("selected");
						}

						init.funTrStyle();

						//动态数据，及时清除
						$("#smartMenu_state").remove();
						$.smartMenu.remove();

						var checkLength = $("#list tbody tr.selected").length;
						if(checkLength > 1){
							listMenuData[0] = [objAddProperty, objDelProperty, objDel, objMove, objAudit];
							listMenuData.splice(1,listMenuData.length);
						}else{
							listMenuData[0] = [objShow, objEdit];
							listMenuData[1] = [objAddProperty, objDelProperty, objDel, objMove, objAudit];
						}
					}
				}
			});
		}

	};

$(function(){
	huoniao.choseCity($(".choseCity"),$("#cityid"));
	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

    //填充分站列表
    // huoniao.buildAdminList($("#cityList"), cityList, '请选择分站');
    $(".chosen-select").chosen();

    //菜单递归分类
	$("#typeBtn").append(init.selectTypeList(typeListArr));
	// 类型
	$("#typeBtnMold").append(init.selectTypeList(moldListArr, '全部类型'));
	// 专题
	$("#typeBtnZt").append(init.selectTypeList(ztTypeListArr, '全部专题', 9));

	//初始加载
	getList();

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#mType").html($("#typeBtnMold").attr("data-id"));
		$("#sType").html($("#typeBtn").attr("data-id"));
		$("#zType").html($("#typeBtnZt").attr("data-id"));
		$("#start").html($("#stime").val());
		$("#end").html($("#etime").val());
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



	//发布信息
	$("#addNew").bind("click", function(){
		var href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage(action+"Add", "article", "添加"+(action == "article" ? "新闻" : "图片"), "article/"+href);
		} catch(e) {}
	});


	//二级菜单点击事件
	$("#typeBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#typeBtn").attr("data-id", id);
		$("#typeBtn button").html(title+'<span class="caret"></span>');
	});

	//类型二级菜单点击事件
	$("#typeBtnMold").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#typeBtnMold").attr("data-id", id);
		$("#typeBtnMold button").html(title+'<span class="caret"></span>');
		getType(id);
	});
	//专题二级菜单点击事件
	$("#typeBtnZt").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#typeBtnZt").attr("data-id", id);
		$("#typeBtnZt button").html(title+'<span class="caret"></span>');
	});
	function getType(id){
		$('#typeid').val(0);
		$.ajax({
			url: 'articleJson.php?action=getArticleType',
			type: 'post',
			data: 'mold='+id,
			dataType: 'json',
			success: function(data){
				$('#typeBtn .btn').html('全部分类<span class="caret"></span>').siblings('.dropdown-menu').remove();
				if(data){
					$("#typeBtn").append(init.selectTypeList(data));
				}
			},
			error: function(){
				$('#typeBtn .btn').html('全部分类<span class="caret"></span>').siblings('.dropdown-menu').remove();
			}
		})
	}

	$("#stateBtn, #propertyBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
		obj.attr("data-id", id);
		if(obj.attr("id") == "paginationBtn"){
			var totalPage = $("#list").attr("data-totalpage");
			$("#list").attr("data-atpage", id);
			obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
			$("#list").attr("data-atpage", id);
		}else{

			$("#typeBtnMold")
				.attr("data-id", "")
				.find("button").html('全部类型<span class="caret"></span>');
			$("#mType").html("");

			$("#typeBtn")
				.attr("data-id", "")
				.find("button").html('全部分类<span class="caret"></span>');

			$("#sType").html("");

			$("#typeBtnZt")
				.attr("data-id", "")
				.find("button").html('全部专题<span class="caret"></span>');

			$("#zType").html("");

			if(obj.attr("id") != "propertyBtn"){
				obj.find("button").html(title+'<span class="caret"></span>');
			}
			$("#list").attr("data-atpage", 1);
		}
		getList();
	});

	//下拉菜单过长设置滚动条
	// $(".dropdown-toggle").bind("click", function(){
	// 	if($(this).parent().attr("id") != "typeBtn"){
	// 		var height = document.documentElement.clientHeight - $(this).offset().top - $(this).height() - 30;
	// 		$(this).next(".dropdown-menu").css({"max-height": height, "overflow-y": "auto"});
	// 	}
	// });

	//全选、不选
	$("#selectBtn a").bind("click", function(){
		var id = $(this).attr("data-id");
		var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";
		if(id == 1){
			$("#selectBtn .check").addClass("checked");
			$("#list tr").removeClass("selected").addClass("selected");

			if(recycle != ""){
				rDefaultBtn.css('display', 'inline-block');
			}else{
				defaultBtn.css('display', 'inline-block');
			}
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			if(recycle != ""){
				rDefaultBtn.hide();
			}else{
				defaultBtn.hide();
			}
			checkedBtn.css('display', 'inline-block');
		}
	});

	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("edit"+action+id, "article", title, "article/"+href);
		} catch(e) {}
	});

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('您确定要将选中的信息放入回收站吗？', function(){
			init.del("del");
		});
	});

	//彻底删除
	$("#fullyDelBtn").bind("click", function(){
		$.dialog.confirm('删除信息将会删除信息下面的所有图片和评论，此操作不可恢复，您确定要删除吗？', function(){
			init.del("fullyDel");
		});
	});

	//还原
	$("#revertBtn").bind("click", function(){
		init.revert();
	});

	//单条删除
	$("#list").delegate(".del", "click", function(){
		var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";
		if(recycle != ""){
			$.dialog.confirm('删除信息将会删除信息下面的所有图片和评论，此操作不可恢复，您确定要删除吗？', function(){
				init.del("fullyDel");
			});
		}else{
			$.dialog.confirm('您确定要将此条信息放入回收站吗？', function(){
				init.del("del");
			});
		}
	});

	//单条还原
	$("#list").delegate(".revert", "click", function(){
		init.revert();
	});

	//添加属性
	$("#addProperty").bind("click", function(){
		init.propertyForm("add", "添加属性");
	});

	//删除属性
	$("#delProperty").bind("click", function(){
		init.propertyForm("del", "删除属性");
	});

	//移动
	$("#moveBtn").bind("click", function(){
		init.move();
	});

	//批量审核
	$("#batchAudit a").bind("click", function(){
		init.updateState($(this).text());
	});

	//回收站
	$("#recycleBtn").bind("click", function(){
		var t = $(this);

		$("#typeBtn")
			.attr("data-id", "")
			.find("button").html('全部分类<span class="caret"></span>');

		$("#sType").html("");

		if(t.text() == "回收站"){
			t.attr("data-id", 1);
			t.html("返回");
		}else{
			t.attr("data-id", "");
			t.html("回收站");
		}
		$("#list").attr("data-atpage", 1);
		getList();
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
			$.smartMenu.remove();
			$("#smartMenu_state").remove();
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

	//审核状态更新
	$("#list").delegate(".more", "click", function(event){
		event.preventDefault();

		$.smartMenu.remove();

		var t = $(this), top = t.offset().top - 5, left = t.offset().left + 15, obj = "smartMenu_state";
		if($("#"+obj).html() != undefined){
			$("#"+obj).remove();
		}

		t.parent().parent().removeClass("selected").addClass("selected");

		var htmlCreateStateMenu = function(){
			var htmlMenu = [];
			htmlMenu.push('<div id="'+obj+'" class="smart_menu_box">');
			htmlMenu.push('  <div class="smart_menu_body">');
			htmlMenu.push('    <ul class="smart_menu_ul">');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">待审核</a></li>');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">已审核</a></li>');
			htmlMenu.push('      <li class="smart_menu_li"><a href="javascript:" class="smart_menu_a">拒绝审核</a></li>');
			htmlMenu.push('    </ul>');
			htmlMenu.push('  </div>');
			htmlMenu.push('</div>');

			return htmlMenu.join("");
		}

		$("body").append(htmlCreateStateMenu());

		$("#"+obj).find("a").bind("click", function(event){
			event.preventDefault();
			init.updateState($(this).text());
		});

		$("#"+obj).css({
			top: top,
			left: left - $("#"+obj).width()/2
		}).show();

		return false;
	});

	$(document).click(function (e) {
		var s = e.target;
		if ($("#smartMenu_state").html() != undefined) {
			if (!jQuery.contains($("#smartMenu_state").get(0), s)) {
				if (jQuery.inArray(s, $(".smart_menu_body")) < 0) {
					$("#smartMenu_state").remove();
				}
			}
		}
	});

	//打赏记录
	$("#list").delegate(".reward", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("rewardLogsArticle"+id, "member", "打赏记录【"+title+"】", href);
		} catch(e) {}
	});

});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		mType    = $("#mType").html(),
		sType    = $("#sType").html(),
		zType    = $("#zType").html(),
		start    = $("#start").html(),
		end      = $("#end").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		property = $("#propertyBtn").attr("data-id") ? $("#propertyBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1",
		aType    = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";

	var data = [];
		data.push("sKeyword="+sKeyword);
    	data.push("adminCity="+$("#cityid").val());
		data.push("mType="+mType);
		data.push("sType="+sType);
		data.push("zType="+zType);
		data.push("state="+state);
		data.push("start="+start);
		data.push("end="+end);
		data.push("property="+property);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
		data.push("aType="+aType);

	huoniao.operaJson("articleJson.php?dopost="+action, data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, articleList = val.articleList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);

		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".totalAudit").html(val.pageInfo.totalAudit);
		$(".totalRefuse").html(val.pageInfo.totalRefuse);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < articleList.length; i++){
				console.log(articleList[i])
				list.push('<tr data-id="'+articleList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				var img = "";
				if(action == "pic"){
					img = '<img src="'+cfg_attachment+articleList[i].litpic+'&type=small" class="litpic" />';
				}
				var append = "", color = "";
				if(articleList[i].color != ""){
					color = " style='color:"+articleList[i].color+"'";
				}
				if(articleList[i].append != ""){
					append += "<span class='append'>（"+articleList[i].append+"）</span>";
				}
				list.push('  <td class="row20 left">'+img+'<span><a href="'+articleList[i].url+'" target="_blank"'+color+'>【'+(moldListArr[articleList[i].moldid] ? moldListArr[articleList[i].moldid].typename : articleList[i].moldid)+'】'+articleList[i].title+'</a>'+append+'</span></td>');
				list.push('  <td class="row5">');
				var recycle = $("#recycleBtn").attr("data-id") ? $("#recycleBtn").attr("data-id") : "";
				if(recycle != ""){
					list.push('<a href="javascript:;" title="还原" class="revert">还原</a>');
				}else{
					list.push('<a data-id="'+articleList[i].id+'" data-title="'+articleList[i].title+'" href="articleAdd.php?dopost=edit&id='+articleList[i].id+'&action='+action+'" title="修改" class="edit">修改</a>');
				}
				list.push('</td>');
				list.push('  <td class="row12"><a href="javascript:;" data-id="'+articleList[i].typeid+'" class="type">'+articleList[i].type+'</a></td>');
				list.push('  <td class="row5">'+(recycle != "" ? "&nbsp;" : articleList[i].cityname)+'</td>');
				var state = "";
				switch (articleList[i].state) {
					case "等待审核":
						state = '<span class="gray">待审核</span>';
						break;
					case "审核通过":
						state = '<span class="audit">已审核</span>';
						break;
					case "审核拒绝":
						state = '<span class="refuse">审核拒绝</span>';
						break;
				}

				// 审核流程
				// var auditHtml = [];
				// if(articleList[i].orgAudit){
				// 	for(var n in articleList[i].orgAudit){
				// 		var d = articleList[i].orgAudit[n];
				// 		if(d.state == '0'){
				// 			auditHtml.push('<p>'+d.levelName+' 待审核</p>');
				// 		}else if(d.state == '2'){
				// 			auditHtml.push('<p>'+d.levelName+' 已审核&nbsp;审核人：'+d.nickname+'&nbsp;审核时间：'+d.date+'</p>');
				// 		}else {
				// 			auditHtml.push('<p>'+d.levelName+' 审核拒绝&nbsp;审核人：'+d.nickname+'&nbsp;审核时间：'+d.date+'</p>');
				// 		}
				// 	}
				// 	state = auditHtml.join("");
				// }

				list.push('  <td class="row15 state">'+(recycle != "" ? "&nbsp;" : state+'<span class="more"><s></s></span>')+'</td>');
				var selfmedia = '';
				if(articleList[i].selfmedia_name){
					selfmedia = '<p title="自媒体" style="margin-bottom:0;">【'+articleList[i].selfmedia_name+'】 </p>';
				}
				list.push('  <td class="row10">'+selfmedia+'<a href="javascript:;" class="userinfo" data-id="'+articleList[i].admin+'"title="发布人">'+articleList[i].adminame+'</a></td>');
				list.push('  <td class="row15">'+articleList[i].date+'</td>');
				list.push('  <td class="row10">'+(articleList[i].reward.count > 0 ? ('<a class="link reward" data-id="'+articleList[i].id+'" data-title="'+articleList[i].title+'" href="member/rewardLogs.php?source=article&type=2&sKeyword='+articleList[i].id+'">'+articleList[i].reward.count+'次 共'+articleList[i].reward.amount+echoCurrency('short')+'</a>') : '暂无打赏')+'</td>');



				list.push('  <td class="row5">');
				list.push('<a href="javascript:;" title="删除" class="del">删除</a></td>');
				list.push('</tr>');
			}

			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();
			huoniao.showPageInfo();

			init.smartMenu();
		}else{
			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
