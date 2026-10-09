$(function(){

	var defaultBtn = $("#delBtn, #batchAudit"),
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

					huoniao.operaJson("circleList.php?dopost=del", "id="+id, function(data){
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

			//更新信息状态
			,updateState: function(type){
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
						id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
					}
					huoniao.operaJson("circleList.php?dopost=updateState", "id="+id+"&state="+state, function(data){
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

					huoniao.operaJson("circleList.php?dopost=getDetail", "id="+id, function(data){
						if(data != null && data.length > 0){
							data = data[0];
							huoniao.showTip("success", "获取成功！", "auto");
							$.dialog({
								fixed: true,
								title: '快速编辑',
								content: $("#quickEdit").html(),
								width: 670,
								ok: function(){
									//提交
									var typeid   = self.parent.$("#typeid").val(),
										title    = self.parent.$("#title").val(),
										content   = self.parent.$("#content").val(),
										serialize = self.parent.$(".quick-editForm").serialize();

									if(typeid == ""){
										$.dialog.alert("请选择所属栏目");
										return false;
									}

									if(content == ""){
										$.dialog.alert("请填写帖子内容");
										return false;
									}

									huoniao.operaJson("circleList.php?dopost=updateDetail", "id="+id+"&"+serialize, function(data){
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
							self.parent.$("#click").val(data.click);
							self.parent.$("#weight").val(data.weight);
							self.parent.$("#color").val(data.color);
							self.parent.$("#content").val(data.content);

							if(data.bold == 1){
								self.parent.$(".quick-editForm input[name=bold]").attr("checked", true);
							}

							if(data.isreply == 1){
								self.parent.$(".quick-editForm input[name=isreply]").attr("checked", true);
							}

							if(data.jinghua == 1){
								self.parent.$(".quick-editForm input[name=jinghua]").attr("checked", true);
							}

							if(data.top == 1){
								self.parent.$(".quick-editForm input[name=top]").attr("checked", true);
							}

							if(data.color != ""){
								self.parent.$(".quick-editForm .color_pick em").css({"background": data.color});
							}

							self.parent.$("#state").find("option").each(function(){
								if($(this).val() == data.state){
									$(this).attr("selected", true);
								}
							});

							self.parent.$(".color_pick").colorPicker({
								callback: function(color) {
									var color = color.length === 7 ? color : '';
									self.parent.$("#color").val(color);
									self.parent.$(this).find("em").css({"background": color});
								}
							});


						}else{
							huoniao.showTip("error", "信息获取失败！", "auto");
						}
					});
				}

			}

		};

	//地区递归分类
	$("#typeBtn").append(init.selectTypeList());

    //填充分站列表
    huoniao.buildAdminList($("#cityList"), cityList, '请选择分站');
    $(".chosen-select").chosen();

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	//初始加载
	getList();

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#start").html($("#stime").val());
		$("#end").html($("#etime").val());
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

	$("#stateBtn, #propertyBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
		obj.attr("data-id", id);
		if(obj.attr("id") == "paginationBtn"){
			var totalPage = $("#list").attr("data-totalpage");
			$("#list").attr("data-atpage", id);
			obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
			$("#list").attr("data-atpage", id);
		}else{

			// $("#addrBtn")
			// 	.attr("data-id", "")
			// 	.find("button").html('全部地区<span class="caret"></span>');

			// $("#sAddr").html("");

			//if(obj.attr("id") != "propertyBtn"){
				obj.find("button").html(title+'<span class="caret"></span>');
			//}
			$("#list").attr("data-atpage", 1);
		}
		getList();
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

	//新增信息
	$("#addNew").bind("click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"), type = "circle";
		try {
			event.preventDefault();
			parent.addPage("circleListphpdopostAdd", type, "新增贴子", "circle/"+href);
		} catch(e) {}
	});

	//修改
	$("#list").delegate(".modify", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("circleEdit"+id, "circle", title, "circle/"+href);
		} catch(e) {}
	});

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('删除信息将会删除信息下面的评论信息。<br />此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});

	//单条删除
	$("#list").delegate(".delete", "click", function(){
		$.dialog.confirm('删除信息将会删除信息下面的评论信息。<br />此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});


	//查看回复
	$("#list").delegate(".reply", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("circleReply"+id, "circle", "查看id为"+title+"的动态回复", "circle/"+href);
		} catch(e) {}
	});

	//打赏记录
	$("#list").delegate(".reward", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("rewardLogsCircle"+id, "member", "打赏记录【"+title+"】", href);
		} catch(e) {}
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

});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		sType    = $("#sType").html(),
		start    = $("#start").html(),
		end      = $("#end").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		property = $("#propertyBtn").attr("data-id") ? $("#propertyBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
    	data.push("adminCity="+$("#cityList").val());
		data.push("sType="+sType);
		data.push("state="+state);
		data.push("start="+start);
		data.push("end="+end);
		data.push("property="+property);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("circleList.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, circleList = val.circleList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);

		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".totalAudit").html(val.pageInfo.totalAudit);
		$(".totalRefuse").html(val.pageInfo.totalRefuse);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < circleList.length; i++){
				list.push('<tr data-id="'+circleList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				var append = [];
				if(circleList[i].top == 1){
					append.push('<span class="label label-inverse">置顶</span>');
				}
				if(circleList[i].jinghua == 1){
					append.push('<span class="label label-warning">精华</span>');
				}
				if(circleList[i].isreply == 0){
					append.push('<span class="label">不可评论</span>');
				}
				if(circleList[i].topictitle){
					append.push('<span class="label label-inverse">'+circleList[i].topictitle+'</span>');
				}

				var style = [];
				if(circleList[i].bold == 1){
					style.push('font-weight: 700;');
				}
				if(circleList[i].color != ""){
					style.push('color: '+circleList[i].color+';');
				}

				list.push('  <td class="row30 left"><span class="content" target="_blank" style="'+style.join(" ")+'">'+circleList[i].content+'</span>'+append.join(" ")+'</td>');
				list.push('  <td class="row10"><a href="javascript:;" class="userinfo" data-id="'+circleList[i].userid+'">'+circleList[i].username+'</a></td>');
				list.push('  <td class="row15">'+circleList[i].addtime+'<br />'+circleList[i].ip+'</td>');
				list.push('  <td class="row9">'+circleList[i].browse+'/'+circleList[i].reply+'</td>');
				var state = "";
				switch (circleList[i].state) {
					case "0":
						state = '<span class="gray">待审核</span>';
						break;
					case "1":
						state = '<span class="audit">已审核</span>';
						break;
					case "2":
						state = '<span class="refuse">审核拒绝</span>';
						break;
				}
				list.push('  <td class="row10 state">'+state+'<span class="more"><s></s></span></td>');
				list.push('  <td class="row10">'+(circleList[i].reward.count > 0 ? ('<a class="link reward" data-id="'+circleList[i].id+'" data-title="'+circleList[i].content+'" href="member/rewardLogs.php?source=circle&type=2&sKeyword='+circleList[i].id+'">'+circleList[i].reward.count+'次 共'+circleList[i].reward.amount+echoCurrency('short')+'</a>') : '暂无打赏')+'</td>');
				list.push('  <td class="row13">');
				list.push('<a data-id="'+circleList[i].id+'"  class="preview">预览</a>&nbsp;|&nbsp;');
				list.push('<a href="javascript:;" title="删除" class="link delete">删除</a>');
				if(circleList[i].reply > 0){
					list.push('&nbsp;|&nbsp;<a href="circleReply.php?tid='+circleList[i].id+'" data-id="'+circleList[i].id+'" data-title="'+circleList[i].id+'" title="查看回复" class="link reply">查看回复</a>');
				}
				list.push('</td>');
				list.push('</tr>');
			}

			obj.find("tbody").html(list.join(""));
			$("#loading").hide();
			$("#list table").show();
			huoniao.showPageInfo();
		}else{

			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};

$(function(){
//预览
 	$("body").delegate(".preview", "click", function () {
		var id = $(this).attr("data-id");
        if (id) {
            huoniao.showTip("loading", "数据读取中，请稍候...");
            huoniao.operaJson("circleList.php?dopost=getList", "id=" + id,function (data) {
                huoniao.hideTip();
                var circleList = data.circleList[0];
                var picadr 		= circleList.picadr;
                var commodity 	= circleList.commodity;
                var img =[];
                for (var i = 0; i < picadr.length; i++) {
					if(picadr[i] !=''){
						img.push("<a target='_Blank' href='"+cfg_attachment+picadr[i]+"' style='disply:inline-block; margin-right:10px; margin-bottom:10px;'><img src="+cfg_attachment+picadr[i]+" style=' width:100px'/></a>");
					}
                }
				var imglist = '';
				if(img.length>0){
					imglist = '<tr><td width="80" align="left" >图片</td>'+
							  '<td align="left" >'+img.join('')+'</td></tr>';
				}
                var commodityres = [],linklist='';
                if(commodity!=''){
	                 for (var i = 0; i < commodity.length; i++) {
	                 	commodityres.push("<div class='link_li'><img src="+commodity[i].litpic+" style='width:50px!important; height:50px!important; object-fit:cover;; float: left!important;'/><div class='right_info' style='margin-left:60px;'><h4 style='font-size:14px; margin:0;'>商品名称："+commodity[i].title+"</h4><p>价格："+commodity[i].price+"</p></div></div>");
	                 }
					linklist = '<tr><td width="80" align="left" >链接：</td>'+
								 '<td>'+commodityres.join('')+'</td></tr>'
             	}

				var videolist = '';
                 if (circleList.videoadr) {
                 	var video = '<a target="_Blank" href="/include/videoPreview.php?f='+circleList.videoadr+'">预览视频</a>'
					videolist = '<tr><td width="80" align="left" >视频：</td><td><a target="_Blank" href="'+circleList.videoadr+'" class="video_box" style="display:inline-block; width:100px;"><img style="width:100%;" src="'+circleList.thumbnail+'"></a>&nbsp;&nbsp;'+video+'</td></tr>'
                 }

                if (data) {

                    $.dialog({
                        id: "memberInfo",
                        fixed: false,
                        title: "动态ID【" + id + "】",
                        content: '<table width="100%"border="0"cellspacing="1"cellpadding="5" style="line-height:2em;">'+
						         '<tr><td width="80"align="left" valign="top">发布者：</td>'+
								 '<td width=""align="left" valign="top">'+circleList.username+'</td></tr>'+
								 '<tr><td width="80"align="left" valign="top">发布时间：</td><td>'+circleList.addtime+'</td></tr>'+
								 '<td width="80"align="left" valign="top">发布位置：</td><td>'+circleList.addrname+'</td></tr>'+
								 '<tr><td width="80" align="left" >话题标题：</td><td>'+(circleList.topictitle?circleList.topictitle:"暂无")+'</td></tr>'+
								 '<tr><td width="80" align="left" >动态内容：</td><td style="font-size:14px; color:#333;">'+circleList.content+'</td></tr>'+
								 imglist+videolist+linklist+
								 '</table>',
                        width: 1000,
                        ok: function () {
                            var title = data[0]["username"],
                                href = "memberList.php?dopost=Edit&id=" + id;

                            try {
                                parent.addPage("memberListEdit" + id, "member", title, "member/" + href);
                            } catch (e) {
                            }
                        },
                        cancelVal: "关闭",
                        cancel: true
                    });

                } else {
                    huoniao.showTip("error", "数据读取失败");
                }
            });
        }
	});
 });
