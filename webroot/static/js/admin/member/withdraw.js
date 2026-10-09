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

					huoniao.operaJson("withdraw.php?dopost=del", "id="+id, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							$("#selectBtn a:eq(1)").click();
							setTimeout(function() {
								getList();
							}, 800);
						}else{
							$.dialog.alert("删除失败，请检查提现状态<br />审核中的不可以直接删除！", function(){
								getList();
							});
						}
					});
					$("#selectBtn a:eq(1)").click();
				}
			}

		};

	//初始加载
	getList();

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 3, language: 'ch'});

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#type").html($("#typeBtn").attr("data-id"));
		$("#couriertypev").html($("#couriertype").attr("data-id"));
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

	$("#couriertype a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#couriertype").attr("data-id", id);
		$("#couriertype button").html(title+'<span class="caret"></span>');
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

			$("#typeBtn")
				.attr("data-id", "")
				.find("button").html('全部<span class="caret"></span>');

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

	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("editwithdraw"+id, "member", title, "member/"+href);
		} catch(e) {}
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

	//打款
	$("#list").delegate(".payment", "click", function(){
		var id = $(this).attr('data-id');
		$.dialog.confirm('此操作不可恢复，您确定要打款吗？', function(){
			huoniao.showTip("loading", "正在操作，请稍候...");
			huoniao.operaJson("withdrawEdit.php?dopost=transfers", "id="+id, function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
					setTimeout(function() {
						getList();
					}, 500);
				}else{
                    if(data.info.indexOf('微信转账中') > -1){
                        huoniao.showTip("success", data.info, "auto");
                        setTimeout(function() {
                            getList();
                        }, 500);
                    }else{
                        $.dialog.alert(data.info);
					    huoniao.hideTip();
                    }
				}
			});
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

// 导出
$("#export").click(function(e){
	// e.preventDefault();
	var type    = $("#type").html(),
		sKeyword = encodeURIComponent($("#sKeyword").html()),
		start    = $("#start").html(),
		end      = $("#end").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
	data.push("type="+type);
	data.push("sKeyword="+sKeyword);
	data.push("start="+start);
	data.push("end="+end);
	data.push("state="+state);
	data.push("pagestep="+pagestep);
	data.push("page="+page);
	data.push("pagestep=200000");
	data.push("page=1");

	$(this).attr('href', 'withdraw.php?dopost=getList&do=export&'+data.join('&'));




})

// 页面跳转
$("#list tbody").delegate(".qshref", "click", function(event){
	var href = $(this).attr("href");
	var tid=$(this).attr('data-id');
	var tname=$(this).attr('data-name');

	try {
		event.preventDefault();
		parent.addPage("waimaiCourierEdit"+tid, "waimai", "修改配送员-"+tname,href);
	} catch(e) {}
});
$("#list tbody").delegate(".fzhref", "click", function(event){
	var href = $(this).attr("href");
	try {
		event.preventDefault();
		parent.addPage("commissionCount", "member", "佣金统计",href);
	} catch(e) {}
});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var type    = $("#type").html(),
		sKeyword = encodeURIComponent($("#sKeyword").html()),
		start    = $("#start").html(),
		couriertype    = $("#couriertypev").html(),
		end      = $("#end").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("type="+type);
		data.push("sKeyword="+sKeyword);
		data.push("start="+start);
		data.push("end="+end);
		data.push("state="+state);
		data.push("couriertype="+couriertype);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("withdraw.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), listArr = [], i = 0, list = val.list;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$("#totalPrice").html(val.totalPrice);
		$("#totalAmount").html(val.totalAmount);
		$("#totalShouxu").html(val.totalShouxu);
		$(".state0").html(val.pageInfo.state0);
		$(".state1").html(val.pageInfo.state1);
		$(".state2").html(val.pageInfo.state2);
		$(".state3").html(val.pageInfo.state3);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < list.length; i++){
				listArr.push('<tr data-id="'+list[i].id+'">');
				listArr.push('  <td class="row3"><span class="check"></span></td>');
				listArr.push('  <td class="row5 left">'+(list[i].type == 0 && list[i].usertype == 0 ? '余额' : (list[i].type == 1 && list[i].usertype == 0 ? '分站' : (list[i].type == 2 && list[i].usertype == 0 ? '推荐奖金' : (list[i].usertype == 0 ? '其他':'骑手'))))+'</td>');

				var userinfoclass =nuserTxt= '';
				if (list[i].usertype == 0 && list[i].type == 0) {
					userinfoclass  = 'class="userinfo"';
					nuserTxt ='<a href="javascript:;" data-id="'+list[i].uid+'" '+userinfoclass+'>'+list[i].username+'</a>';
				}else if (list[i].usertype == 1) {//骑手
					userinfoclass  = 'class="qshref"';
					nuserTxt ='<a href="waimai/waimaiCourierAdd.php?id='+list[i].uid+'" data-name="'+list[i].username+'" data-id="'+list[i].uid+'" '+userinfoclass+'>'+list[i].username+'</a>';
				}else if (list[i].usertype == 0 && list[i].type == 1) {//分站
					userinfoclass  = 'class="fzhref"';
					nuserTxt ='<a href="member/commissionCount.php?cityid='+list[i].cityid+'"data-id="'+list[i].cityid+'" '+userinfoclass+'>'+list[i].username+'</a>';
				}else{
					nuserTxt ='<a href="javascript:;" data-id="'+list[i].uid+'">'+list[i].username+'</a>';
				}
				listArr.push('  <td class="row15 left">'+nuserTxt+'</td>');
				listArr.push('  <td class="row13 left">'+list[i].tdate+'</td>');

				var account = list[i].cardname+'（'+(list[i].bank == 'alipay' ? '支付宝' : list[i].bank)+'）'+'<br />'+list[i].cardnum;
				if(list[i].bank == 'weixin'){
					account = '微信';
				}

				listArr.push('  <td class="row14 left">'+account+'</td>');
				listArr.push('  <td class="row10 left">&yen;'+list[i].amount+'</td>');
				listArr.push('  <td class="row10 left">&yen;'+list[i].shouxu+'</td>');
				listArr.push('  <td class="row10 left">&yen;'+list[i].price+'</td>');

				var state = "&nbsp;";
				if (list[i].state == 0 && list[i].auditstate ==0) {

					state = '<span class="gray">审核中</span>';

				}else if(list[i].state == 0 && list[i].auditstate ==1){

					state = '<span class="gray">审核通过,待打款</span>';

				}else if(list[i].state == 1){

					state = '<span class="audit">成功</span>';

				}else if(list[i].state == 2){

					state = '<span class="refuse">失败</span>';
				}else if(list[i].state == 3){

					state = '<span class="gray">微信打款中</span>';
				}
				// switch (list[i].state) {
				// 	case "0":
				// 		state = '<span class="gray">审核中</span>';
				// 		break;
				// 	case "1":
				// 		state = '<span class="audit">成功</span>';
				// 		break;
				// 	case "2":
				// 		state = '<span class="refuse">失败</span>';
				// 		break;
				// }
				listArr.push('  <td class="row10 left">'+state+'</td>');

				var btn = '';
				if(list[i].state == '0' && (list[i].bank == 'weixin' || list[i].bank == 'alipay') && list[i].auditstate ==1&&list[i].withdrawtransfer ==1){
					btn = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="javascript:;" data-id="'+list[i].id+'" class="payment" title="确认打款">付款</a>';
				}

				listArr.push('  <td class="row10 left"><a data-id="'+list[i].id+'" data-title="'+list[i].username+'提现详细" href="withdrawEdit.php?dopost=edit&id='+list[i].id+'" title="修改" class="edit">修改</a><a href="javascript:;" title="删除" class="del">删除</a>'+btn+'</td>');
			}

			obj.find("tbody").html(listArr.join(""));
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
