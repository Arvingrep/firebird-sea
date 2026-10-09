$(function(){

	var defaultBtn = $("#delBtn"),
		checkedBtn = $("#stateBtn, #pendBtn"),
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
					checkedBtn.hide();
				}else{
					defaultBtn.hide();
					checkedBtn.show();
				}
			}

			//快速编辑
			,quickEdit: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					id = checked.attr("data-id");
					huoniao.showTip("loading", "正在获取信息，请稍候...");

					huoniao.operaJson("?dopost=getDetail", "id="+id, function(data){
						if(data.state == 100){
							huoniao.hideTip();
							//huoniao.showTip("success", "获取成功！", "auto");
							$.dialog({
								fixed: true,
								title: '快速编辑',
								content: $("#quickEdit").html(),
								width: 870,
								ok: function(){
									//提交
									var serialize = self.parent.$(".quick-editForm").serialize();

									huoniao.operaJson("?dopost=reply", "id="+id+"&"+serialize, function(data){
										if(data.state == 100){
											huoniao.showTip("success", data.info, "auto");
											setTimeout(function() {
												getList();
											}, 800);
										}else if(data.state == 101){
											alert(data.info);
											return false;
										}else{
											huoniao.showTip("error", data.info, "auto");
											//getList();
										}
									});

								},
								cancel: true
							});

							//填充信息
							self.parent.$("#userinfo").html(data.username);
							self.parent.$("#name").html(data.name);
							self.parent.$("#phone").html(data.phone);
							self.parent.$("#title").html(data.title);
							self.parent.$("#pubdate").html(data.pubdate);
                            self.parent.$('#state' + data.status).prop('checked', true);
							self.parent.$("#note").val(data.note);

							if(data.imgList){
								var imglist = [];
								for(var i = 0; i < data.imgList.length; i++){
									imglist.push('<a href="'+data.imgList[i]+'" target="_blank"><img src="'+data.imgList[i]+'" style="object-fit:cover;width:150px;height:150px;margin-right:10px;"></a>');
								}
								self.parent.$("#pics").html(imglist.join(""));
							}

						}else{
							huoniao.showTip("error", "信息获取失败！", "auto");
						}
					});
				}

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

					huoniao.operaJson("?dopost=del", "id="+id, function(data){
						huoniao.hideTip();
						if(data.state == 100){
							$("#selectBtn a:eq(1)").click();
							getList();
						}else{
							$.dialog.alert(data.info);
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}

		};

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 2, language: 'ch'});

	//初始加载
	getList();

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#mtype").html($("#ctype").attr("data-id"));
		$("#level").html($("#clevel").attr("data-id"));
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

	//二级菜单点击事件
	$("#ctype").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#ctype").attr("data-id", id);
		$("#ctype button").html(title+'<span class="caret"></span>');
	});
	$("#clevel").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#clevel").attr("data-id", id);
		$("#clevel button").html(title+'<span class="caret"></span>');
	});

	$("#stateBtn, #pendBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
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
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
			checkedBtn.show();
		}
	});

	//回复
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

})

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		start    = $("#start").html(),
		end      = $("#end").html(),
		mtype    = $("#mtype").html(),
		level    = $("#level").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pend    = $("#pendBtn").attr("data-id") ? $("#pendBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		sort     = $('.thead li.sort.curr').length ? $('.thead li.sort.curr').attr('data-type') : '',
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("start="+start);
		data.push("end="+end);
		data.push("mtype="+mtype);
		data.push("level="+level);
		data.push("state="+state);
		data.push("pend="+pend);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
		data.push("sort="+sort);

	huoniao.operaJson("?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, _data = val.list;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".totalGray").html(val.pageInfo.totalGray);
		$(".normal").html(val.pageInfo.normal);

		if(val.state == "100"){
			huoniao.hideTip();
			for(i; i < _data.length; i++){
				list.push('<tr data-id="'+_data[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				list.push('  <td class="row10 left"><a href="javascript:;" class="userinfo" data-id="'+_data[i].uid+'">'+_data[i].username+'</a></td>');
				list.push('  <td class="row10 left">'+_data[i].name+'</td>');
				list.push('  <td class="row15 left">'+_data[i].phone+'</td>');
				list.push('  <td class="row25 left">'+_data[i].title+'</td>');
				list.push('  <td class="row15 left">'+_data[i].pubdate+'</td>');
				var state = "";
				switch(_data[i].state){
					case "0":
						state = "<span class='gray'>待处理</span>";
						break;
					case "1":
						state = "<span class='audit'>已处理</span>";
						break;
				}
				list.push('  <td class="row12 state">'+state+'</td>');
				list.push('  <td class="row10"><a href="javascript:;" class="edit" title="查看">查看</a></td>');
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
