$(function(){

	var defaultBtn = $("#delBtn"),
		checkedBtn = $("#stateBtn"),
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

					huoniao.operaJson("paimaiOrderList.php?dopost=del", "id="+id, function(data){
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

		};

    //填充分站列表
   huoniao.choseCity($(".choseCity"),$("#cityList"));

	//初始加载
	getList();

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 3, language: 'ch'});

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
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
	$("#typeBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#typeBtn").attr("data-id", id);
		$("#typeBtn button").html(title+'<span class="caret"></span>');
	});

	$("#stateBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).html(), obj = $(this).parent().parent().parent();
		obj.attr("data-id", id);
		if(obj.attr("id") == "paginationBtn"){
			var totalPage = $("#list").attr("data-totalpage");
			$("#list").attr("data-atpage", id);
			obj.find("button").html(id+"/"+totalPage+'页<span class="caret"></span>');
			$("#list").attr("data-atpage", id);
		}else{


			$("#sType").html("");

			$("#addrBtn")
				.attr("data-id", "")
				.find("button").html('全部地区<span class="caret"></span>');

			$("#sAddr").html("");

			if(obj.attr("id") != "propertyBtn"){
				obj.find("button").html(title+'<span class="caret"></span>');
			}
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

			defaultBtn.show();
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
			checkedBtn.show();
		}
	});

	$("#export").click(function(e){
		var t = $(this), 
			sKeyword = encodeURIComponent($("#sKeyword").html()),
			start    = $("#start").html(),
			end      = $("#end").html(),
			state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : ""

		
		var url = '?do=export&sKeyword='+sKeyword+'&start='+start+'&end='+end+'&state='+state;
		console.log(url);

		t.attr('href', url);

	})
	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("editpaimaiorder"+id, "paimai", title, "paimai/"+href);
		} catch(e) {}
	});

	//付款
	$("#list").delegate(".payment", "click", function(){
		var id = $(this).attr("data-id");
		if(id != ""){
			$.dialog.confirm('此操作不可恢复，您确定要付款吗？', function(){
				huoniao.showTip("loading", "正在操作，请稍候...");
				huoniao.operaJson("paimaiOrderList.php?dopost=payment", "id="+id, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						setTimeout(function() {
							getList();
						}, 800);
					}else{
						huoniao.showTip("error", data.info, "auto");
					}
				});
				$("#selectBtn a:eq(1)").click();
			});
		}
	});

	//退款
	$("#list").delegate(".refund", "click", function(){
		var id = $(this).attr("data-id");
		if(id != ""){
			$.dialog.confirm('此操作不可恢复，您确定要退款吗？', function(){
				huoniao.showTip("loading", "正在操作，请稍候...");
				huoniao.operaJson("paimaiOrderList.php?dopost=refund", "id="+id, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						setTimeout(function() {
							getList();
						}, 800);
					}else{
						huoniao.showTip("error", data.info, "auto");
					}
				});
				$("#selectBtn a:eq(1)").click();
			});
		}
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
});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		start    = $("#start").html(),
		end      = $("#end").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		type    = $("#typeBtn").attr("data-id") ? $("#typeBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";


	var data = [];
		data.push("sKeyword="+sKeyword);
    	data.push("adminCity="+$("#cityList").val());
		data.push("start="+start);
		data.push("end="+end);
		data.push("state="+state);
		data.push("type="+type);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("paimaiOrderList.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, paimaiOrderList = val.paimaiOrderList;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		console.log(val);
		$(".totalCount").html(val.pageInfo.totalCount);
		$("#totalPrice").html(val.totalPrice);
		$("#commission").html(val.commission);
		$(".state0").html(val.pageInfo.state0);
		$(".state1").html(val.pageInfo.state1);
		$(".state2").html(val.pageInfo.state2);
		$(".state3").html(val.pageInfo.state3);
		$(".state4").html(val.pageInfo.state4);
		$(".state5").html(val.pageInfo.state5);
		$(".state6").html(val.pageInfo.state6);
		$(".state7").html(val.pageInfo.state7);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < paimaiOrderList.length; i++){
				list.push('<tr data-id="'+paimaiOrderList[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				list.push('  <td class="row10 left"><a href="javascript:;" data-id="'+paimaiOrderList[i].userid+'" class="userinfo link"><span class="label label-success" style="margin-right:3px;">昵称</span>'+paimaiOrderList[i].nickname+'</a><br /><span class="label label-success" style="margin-right:3px;">姓名</span>'+paimaiOrderList[i].name+'<br /><span class="label label-success" style="margin-right:3px;">手机</span>'+paimaiOrderList[i].phone+'</td>');
				list.push('  <td class="row7 left">'+paimaiOrderList[i].type+`<code>x${paimaiOrderList[i].procount}</code></td>`);
				list.push('  <td class="row10 left">'+paimaiOrderList[i].ordernum+'</td>');
				list.push('  <td class="row25 left"><a href="'+paimaiOrderList[i].prourl+'" target="_blank" data-id="'+paimaiOrderList[i].proid+'" class="product">'+paimaiOrderList[i].proname+'</a></td>');
				list.push('  <td class="row5 left">&yen;'+paimaiOrderList[i].orderprice+'</td>');
				list.push('  <td class="row12 left">'+paimaiOrderList[i].orderdate+'</td>');
				list.push('  <td class="row10 left">'+paimaiOrderList[i].paytype+'</td>');
				var state = "&nbsp;";
				switch (paimaiOrderList[i].orderstate) {
					case "0":
						state = '<span class="gray">未付款</span>';
						break;
					case "1":
						state = '已付款';
						if(paimaiOrderList[i].type==='保证金'){
							state = '已交保';
							if(paimaiOrderList[i].paistate===0){
								state += '<code>(未出价)</code>';
							}
							if(paimaiOrderList[i].paistate===1){
								state += '<code>(最高出价：';
								state += paimaiOrderList[i].price_max;
								state += ')</code>';
							}
							if(paimaiOrderList[i].paistate===2){
								state = "待补款";
								if(paimaiOrderList[i].weiyue){
									state += '<code>已违约</code>';
								}else{
									state += '<code>(出价：';
									state += paimaiOrderList[i].price_max;
									state += '，中拍数'+paimaiOrderList[i].success_num+')</code>';
								}
							}
						}
						break;
					case "2":
						state = '<span class="refuse">已过期</span>';
						break;
					case "3":
						state = '配送中';
						break;
					case "4":
						state = '<span class="audit">订单完成</span>';
						break;
					case "5":
						state = '<span class="refuse">未获拍</span>';
						if(paimaiOrderList[i].type==="保证金"){
							if(paimaiOrderList[i].success_num===0){  // 中拍数为0，未出价、或淘汰

								if(paimaiOrderList[i].paistate===0){
									state += '<code>(未出价)</code>';
								}else{
									state += '<code>(淘汰)</code>';
								}
							}else{
								if(paimaiOrderList[i].paistate===2){
									state += '<code>(已成交数：';
									state += paimaiOrderList[i].success_num;
									state += '个)</code>';
								}
							}
						}
						break;
				}
				list.push('  <td class="row8 left">'+state+'</td>');
				var btn = "";
				list.push('  <td class="row10 left"><a href="javascript:;" title="删除" class="del">删除</a>'+btn+'</td>');
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
