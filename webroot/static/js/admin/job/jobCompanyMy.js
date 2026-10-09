var dialog_manage = null,dialog_change = null;
$(function(){
	// $("body").delegate('.add-page','click',function(e){
	// 	let url = $(this).attr('href');
	// 	let id = $(this).attr('data-id')
	// 	let title = $(this).attr('data-title')
	// 	try {
	// 		e.preventDefault();
	// 		parent.addPage(id, "job", title, "job/"+url);
	// 	} catch(e) {}
	// })
	var defaultBtn = $("#delBtn, #batchAudit, #addTag, #delTag"),
		checkedBtn = $("#stateBtn, #tagBtn, .tongji"),
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
					defaultBtn.css('display', 'inline-block');
					checkedBtn.hide();
				}else{
					defaultBtn.hide();
					checkedBtn.css('display', 'inline-block');
				}
			}

			//菜单递归分类
			,selectTypeList: function(type){
				var typeList = [], title = type == "addr" ? "全部地区" : "全部分类";
				typeList.push('<ul class="dropdown-menu">');
				typeList.push('<li><a href="javascript:;" data-id="">'+title+'</a></li>');

				var l = type == "addr" ? addrListArr : typeListArr;
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

					huoniao.operaJson("jobCompanyMy.php?dopost=del", "id="+id, function(data){
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
							$.dialog.alert("<div class='errInfo'><strong>以下信息操作失败：</strong><br />" + info.join("<br />") + '</div>', function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}

			//更新信息状态
			,updateState: function(type, refuse = ''){
				huoniao.showTip("loading", "正在操作，请稍候...");
				$("#smartMenu_state").remove();

				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					var state = "";
					if(type == "待审核"){
						state = 0;
					}else if(type == "已审核"){
						state = 1;
					}else if(type == "拒绝审核"){
						state = 2;
					}

					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-cid"));
					}
					huoniao.operaJson("jobCompanyMy.php?dopost=updateState", "id="+id+"&state="+state+"&refuse=" + encodeURIComponent(refuse), function(data){
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
										info.push("▪ "+tr.find("td:eq(1) a").text());
									}
								}
							}
							$.dialog.alert("<div class='errInfo'><strong>以下信息修改失败：</strong><br />" + info.join("<br />") + '</div>', function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}//右键菜单
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
			//快速编辑
			,quickEdit: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					id = checked.attr("data-id");
					cid = checked.attr("data-cid");

					$.dialog({
						fixed: true,
						title: "新增跟进记录",
						content: $("#fillLogForm").html(),
						width: 500,
						ok: function(){

							let logTagSelect = self.parent.$("#logTagSelect>option:selected").val();

							if(logTagSelect==0){
								$.dialog.alert("请选择类型！");
								return false;
							}
							let fillTime = self.parent.$("#fillTime").val();
							if(!fillTime){
								$.dialog.alert("请选择时间！");
								return false;
							}
							let fillContent = self.parent.$("#fillContent").val();
							if(!fillContent){
								$.dialog.alert("请填写内容");
							}
							//请求json
							huoniao.operaJson("jobCompanyMy.php?&dopost=addCompanyLog", "bid="+id+"&time="+fillTime+"&type="+logTagSelect+"&content="+fillContent+"&cid="+cid, function(data){
								if(data.state == 100){
									huoniao.showTip("success", data.info, "auto");
									$("#selectBtn a:eq(1)").click();
									setTimeout(function() {
										getList();
									}, 800);
								}else{
									var title = data.info;
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
			//添加、删除标签
			,propertyForm: function(type, title){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-cid"));
					}
					// 修改
					this.propertyChange(type,title,id);
				}
			},


			// 增删标签
			propertyChange:function(type,title,id){
				dialog_change = $.dialog({
					id:'propertyBox',
					fixed: true,
					title: title + '<span class="labs" name="manage">标签管理</span>',
					content: $("#propertyForm").html(),
					width: 580,
					height:174,
					lock:true,
					fn:{
						manage:function(){
							init.propertyManage()
						}
					},
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
						huoniao.operaJson("jobCompanyMy.php?&dopost="+type+"Tag", "id="+id+"&attr="+attr, function(data){
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
					cancel: true,
				});
				// console.log(dialog_change)
			},


			// 标签管理
			propertyManage:function(){
				let url = window.location.href.replace('jobCompanyMy','jobCompanyTag');
				if(url.indexOf('?') > -1){
					url = url + '&iframe=1'
				}else{
					url = url + '?iframe=1'
				}
				let openObj = window
				if(dialog_change){
					openObj = dialog_change.opener;
				}
				dialog_manage = openObj.$.dialog({
								id:'propertyBox_manage',
								fixed: true,
								title: '客户标签管理',
								content: `url:${url}`,
								width: 800,
								height:500,
								parent:dialog_change,
								lock:true,
								button:[{
									name:'取消',
									callback:function(){
										
									},
								},{
									name:'确定',
									focus:true,
									callback:function(){
										var a = $("iframe[name='propertyBox_manage']",parent.document);
										var b = a.contents();
										let savebtn = b.find("#saveBtn")
										savebtn.click();
										setTimeout(() => {
											location.reload();	
										}, 1000);
									},
								}],
							})
			},

		};


	huoniao.choseCity($(".choseCity"),$("#cityid"));  //城市分站选择初始化
	//地区递归分类
	$("#addrBtn").append(init.selectTypeList("addr"));

    $(".chosen-select").chosen();

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	//初始加载
	getList();

	//添加属性
	$("#addTag").bind("click", function(){
		init.propertyForm("add", "添加标签");
	});

	//删除属性
	$("#delTag").bind("click", function(){
		init.propertyForm("del", "删除标签");
	});

	$("#labManage").bind('click',function(){
		init.propertyManage()
	})

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#sAddr").html($("#addrBtn").attr("data-id"));
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
	$("#addrBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#addrBtn").attr("data-id", id);
		$("#addrBtn button").html(title+'<span class="caret"></span>');
	});

	$("#stateBtn, #pageBtn, #paginationBtn, #comboBtn, #certBtn, #tagBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
		obj.attr("data-id", id);
		if(obj.attr("id") == "paginationBtn"){
			var totalPage = $("#list").attr("data-totalpage");
			$("#list").attr("data-atpage", id);
			obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
			$("#list").attr("data-atpage", id);
		}else{
			if(obj.attr("id") != "propertyBtn"){
				obj.find("button").html(title+'<span class="caret"></span>');
			}
			$("#list").attr("data-atpage", 1);
		}
		var nolist = $(this).data("nolist");
		if(!nolist){
			getList();
		}
	});

	//下拉菜单过长设置滚动条
	$(".dropdown-toggle").bind("click", function(){
		if($(this).parent().attr("id") != "typeBtn" && $(this).parent().attr("id") != "addrBtn"){
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

			defaultBtn.css('display', 'inline-block');
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
			checkedBtn.css('display', 'inline-block');
		}
	});

	//新增
	$("#addNew").bind("click", function(event){
		var href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("jobCompanyAdd", "job", "新增招聘企业", "job/"+href);
		} catch(e) {}
	});

	//修改
	$("#list").delegate(".modify", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("jobCompanyEdit"+id, "job", title, "job/"+href);
		} catch(e) {}
	});

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('确定要释放选中的客户吗？', function(){
			init.del();
		});
	});

	//单条删除
	$("#list").delegate(".shifang", "click", function(){
		$.dialog.confirm('确定要释放该客户吗？', function(){
			init.del();
		});
	});

	//批量审核
	$("#batchAudit a").bind("click", function(){
		init.updateState($(this).text());
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
		}else if(event.target.className.indexOf("edit") > -1 || event.target.className.indexOf("del") > -1) {
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
	// $("#list tbody").selectable({
	// 	distance: 3,
	// 	cancel: '.check, a',
	// 	start: function(){
	// 		$("#smartMenu_state").remove();
	// 	},
	// 	stop: function() {
	// 		init.funTrStyle();
	// 	}
	// });

	//地区链接点击
	$("#list").delegate(".addr", "click", function(event){
		event.preventDefault();
		var id = $(this).attr("data-id"), txt = $(this).text();

		$("#addrBtn")
			.attr("data-id", id)
			.find("button").html(txt+'<span class="caret"></span>');

		$("#sAddr").html(id);

		$("#list").attr("data-atpage", 1);
		getList();

		$("#selectBtn a:eq(1)").click();
	});

	//填写记录
	$("#list").delegate(".fillLog", "click", function(event){
		event.preventDefault();
		var id = $(this).attr("data-id"), txt = $(this).text();

		init.quickEdit();
	});


	//编辑标签
	$("#list").delegate(".labelChange", "click", function(event){
		event.preventDefault();
		var id = $(this).attr("data-id");

		init.propertyChange('add','新增标签',id);
	});

	//查阅记录
	$("#list").delegate(".viewLogs", "click", function(event){
		event.preventDefault();
		var id = $(this).attr("data-id"), txt = $(this).text();
		//获取列表数据
		huoniao.operaJson("jobCompany.php?dopost=companyFillList", {"cid":id},function (r){
			//成功，渲染列表
			if(r.state==100){
				let html = "";
				for (let i = 0; i < r.list.length; i++) {
					html += `<div>跟进销售：${r.list[i].adminName}<br>跟进时间：${r.list[i].showTime}<br>跟进类型：${r.list[i].typeName}<br>跟进内容：${r.list[i].content}<hr style="margin: 10px 0;"></div>`;
				}
				if(html.length===0){
					html = "暂无相关数据";
				}
				$.dialog({
					fixed: true,
					title: "跟进记录",
					content: '<div style="padding: 0 15px; max-height: 500px; overflow-y: auto;">' + html + '</div>',
					width: 500,
					ok: true
				});
			}
			//失败，提示
			else{
				$.dialog.alert("记录获取失败");
			}
		});
	});

	//领取记录
	$("#list").delegate(".bindLogs", "click", function(event){
		event.preventDefault();
		var id = $(this).attr("data-id"), txt = $(this).text();
		//获取列表数据
		huoniao.operaJson("jobCompany.php?dopost=companyBindList", {"cid":id},function (r){
			//成功，渲染列表
			if(r.state==100){
				let html = "";
				for (let i = 0; i < r.list.length; i++) {
					html += `<div>领取销售：${r.list[i].adminName}<br>领取时间：${r.list[i].pubdate}<br>领取状态：${r.list[i].release_type}<br>释放时间：${r.list[i].release_time}<hr style="margin: 10px 0;"></div>`;
				}
				if(html.length===0){
					html = "暂无相关数据";
				}
				$.dialog({
					fixed: true,
					title: "领取记录",
					content: '<div style="padding: 0 15px; max-height: 500px; overflow-y: auto;">' + html + '</div>',
					width: 500,
					ok: true
				});
			}
			//失败，提示
			else{
				$.dialog.alert("记录获取失败");
			}
		});
	});

	//审核状态更新
	$("#list").delegate(".more", "click", function(event){
		event.preventDefault();

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

            //拒审的提示填写原因
            if($(this).text() == '拒绝审核'){
                var refuse = prompt('请输入拒审原因');
                if(refuse !== null && refuse != '') {
                    init.updateState($(this).text(), refuse);
                }else{
                    return;
                }
            }else{
			    init.updateState($(this).text());
            }
            
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

});

// 导出
$("#export").click(function(e){
	// e.preventDefault();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		sAddr    = $("#sAddr").html(),
		cityid   = $("#cityid").val(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1",
		start    = $("#stime").val(),
		end      = $("#etime").val(),
		combo     = $("#comboBtn").attr("data-id") ? $("#comboBtn").attr("data-id") : "",
		certState  = $("#certBtn").attr("data-id") ? $("#certBtn").attr("data-id") : "",
		searchType     = $("#searchType").val() ? $("#searchType").val() : "",
		tag = $("#tagBtn").attr("data-id") ? $("#tagBtn").attr("data-id") : "";

	var data = [];
	data.push("sKeyword="+sKeyword);
	data.push("sAddr="+sAddr);
	data.push("cityid="+cityid);
	data.push("state="+state);
	data.push("pagestep=200000");
	data.push("page="+page);
	data.push("stime="+start);
	data.push("etime="+end);
	data.push("combo="+combo);
	data.push("certState="+certState);
	data.push("searchType="+searchType);
	data.push("tag="+tag);
	huoniao.showTip("loading", "正在导出，请稍候...", "auto");
	$(this).attr('href', '?dopost=getList&do=export&'+data.join('&'));

})

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		sAddr    = $("#sAddr").html(),
        cityid   = $("#cityid").val(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1",
		start    = $("#stime").val(),
		end      = $("#etime").val(),
		combo     = $("#comboBtn").attr("data-id") ? $("#comboBtn").attr("data-id") : "",
		certState  = $("#certBtn").attr("data-id") ? $("#certBtn").attr("data-id") : "",
		searchType     = $("#searchType").val() ? $("#searchType").val() : "",
		tag = $("#tagBtn").attr("data-id") ? $("#tagBtn").attr("data-id") : "";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("sAddr="+sAddr);
    	data.push("cityid="+cityid);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
		data.push("stime="+start);
		data.push("etime="+end);
		data.push("combo="+combo);
		data.push("certState="+certState);
		data.push("searchType="+searchType);
		data.push("tag="+tag);

	huoniao.operaJson("jobCompanyMy.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, jobCompany = val.jobCompany;
		obj.attr("data-totalpage", val.pageInfo.totalPage);

		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".totalAudit").html(val.pageInfo.totalAudit);
		$(".totalRefuse").html(val.pageInfo.totalRefuse);
		$(".totalChange").html(val.pageInfo.totalChange);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < jobCompany.length; i++){
				list.push('<tr data-id="'+jobCompany[i].bid+'" data-cid="'+jobCompany[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');

                let adminInfo = "";
                var adminTag = jobCompany[i].adminTag;
				if(adminTag && adminTag.length > 0){
                    var tags = [];
                    for(var ti = 0; ti < adminTag.length; ti++){
                        if(adminTag[ti].color && adminTag[ti].color != '#ffffff'){
                            tags.push('<span class="tag" style="background:'+adminTag[ti].color+'">'+adminTag[ti].typename+'</span>');
                        }else{
                            tags.push('<span class="tag tag-default">'+adminTag[ti].typename+'</span>');
                        }                        
                    }
					adminInfo += "标签："+tags.join('')+"<br>";
				}
				let bindCount = jobCompany[i].bindCount;
                adminInfo += "<span style='cursor: pointer; margin-right: 10px;' class='bindLogs' data-id='"+jobCompany[i].id+"'>领取记录("+bindCount+")</span>";
				let bindLogsCount = jobCompany[i].bindLogsCount;
                adminInfo += "<span style='cursor: pointer;' class='viewLogs' data-id='"+jobCompany[i].id+"'>跟进记录("+bindLogsCount+")</span>";

				list.push('  <td class="row23 left"><code>'+jobCompany[i].cityName+'</code> <a href="'+jobCompany[i].url+'" target="_blank" class="link">'+jobCompany[i].title+'</a><br/><small>'+adminInfo+'</small></td>');
				list.push('  <td class="row15 left">'+(jobCompany[i].people ? jobCompany[i].people : '无')+'<br/>'+(jobCompany[i].contact ? jobCompany[i].contact : '无')+'<br/><a class="userinfo" href="javascript:;" data-id='+jobCompany[i].userid+'>'+jobCompany[i].username+'</a></td>');
				list.push('  <td class="row9 left">'+jobCompany[i].jobs+'/'+jobCompany[i].jobs_online+'</td>');
				list.push('  <td class="row14 left">'+jobCompany[i].combo_name+"<br/>"+jobCompany[i].combo_enddate+(jobCompany[i].combo_datediff ? '<br>' + jobCompany[i].combo_datediff : '')+'</td>');
                let cer = jobCompany[i].certification ? "认证通过" : "待认证";
				list.push('  <td class="row14 left">'+jobCompany[i].pubdate+'<br />'+cer+'</td>');
				var state = "";
				switch (jobCompany[i].state) {
					case "0":
						state = '<span class="gray">待审核</span>';
						break;
					case "1":
						state = '<span class="audit">已审核';
						if(jobCompany[i].changeState){
							state += "<code>改</code>";
						}
						state += "</span>";
						break;
					case "2":
						state = '<span class="refuse statusTips1" data-toggle="tooltip" data-placement="bottom" data-original-title="'+jobCompany[i].refuse+'"><i class="icon-question-sign" style="margin-top: 3px;"></i>拒绝</span>';
						break;
				}
				list.push('  <td class="row10 state">'+state+'<span class="more"><s></s></span></td>');

				list.push('  <td class="row12">');
				list.push('<div class="flex_row">')
				list.push('<div class="flex_l"><a href="javascript:;" class="fillLog link">跟进</a><a data-id="'+jobCompany[i].id+'" class="link  labelChange">标签</a><a data-id="'+jobCompany[i].id+'" data-title="'+jobCompany[i].title+'" href="jobCompanyAdd.php?dopost=edit&id='+jobCompany[i].id+'" title="编辑" class="modify link">修改</a></div>');
				list.push('<a href="javascript:;" title="释放" class="shifang link">释放</a></td>');
				list.push('</div>')

				list.push('</tr>');
			}

			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();
			huoniao.showPageInfo();
            
            $('.statusTips1').tooltip();
		}else{

			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
