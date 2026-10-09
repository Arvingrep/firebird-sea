$(function(){

	$(".chosen-select").chosen();
	// huoniao.choseCity($(".choseCity"),$("#cityid"));

	var defaultBtn = $("#delBtn"),
		checkedBtn = $("#stateBtn"),
		init = {

			//选中样式切换
			funTrStyle: function(){
				// var trLength = $("#list tbody tr").length, checkLength = $("#list tbody tr.selected").length;
				// if(trLength == checkLength){
				// 	$("#selectBtn .check").removeClass("checked").addClass("checked");
				// }else{
				// 	$("#selectBtn .check").removeClass("checked");
				// }
				//
				// if(checkLength > 0){
				// 	defaultBtn.show();
				// 	checkedBtn.hide();
				// }else{
				// 	defaultBtn.hide();
				// 	checkedBtn.show();
				// }
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

					huoniao.operaJson("moneyLogs.php?dopost=del", "id="+id, function(data){
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
			//快速编辑
			,quickEdit: function(){
				$.dialog({
					fixed: true,
					title: '更新余额',
					content: $("#quickEdit").html(),
					width: 400,
					ok: function(){
						//提交
						var type   = self.parent.$("input[name='type']:checked").val(),
							opmoney    = self.parent.$("#opmoney").val(),
							opeinfo    = self.parent.$("#opeinfo").val(),
							serialize = self.parent.$(".quick-editForm").serialize();
						if(!type){
							alert("请选择操作增加或减少");
							return false;
						}

						if($.trim(opmoney) == ""){
							alert("请输入金额");
							return false;
						}

						huoniao.operaJson("commissionCount.php?dopost=editAdminCity","&"+serialize, function(data){
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
								setTimeout(function() {
									getList();
								}, 800);
							}
						});

					},
					cancel: true
				});

                self.parent.$("input[name='cityid']").val(cityid);

			}

		};

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
		cityid = $('#cityid').val();
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
	$("#stateBtn, #pageBtn, #paginationBtn,#leimuBtn").delegate("a", "click", function(){
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

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});

	$("#export").click(function(e){
		var t = $(this),
			sKeyword = encodeURIComponent($("#keyword").val()),
			start    = $("#start").html(),
			end      = $("#end").html(),
			type    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "";
			leimutype    = $("#leimuBtn").attr("data-id") ? $("#leimuBtn").attr("data-id") : "";


		var url = '?do=export&sKeyword='+sKeyword+'&start='+start+'&end='+end+'&type='+type+'&cityid='+cityid;
		console.log(url);

		t.attr('href', url);

	})

	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function(){
			init.del();
		});
	});

	//单选
	// $("#list tbody").delegate("tr", "click", function(event){
	// 	var isCheck = $(this), checkLength = $("#list tbody tr.selected").length;
	// 	if(event.target.className.indexOf("check") > -1) {
	// 		if(isCheck.hasClass("selected")){
	// 			isCheck.removeClass("selected");
	// 		}else{
	// 			isCheck.addClass("selected");
	// 		}
	// 	}else if(event.target.className.indexOf("edit") > -1 || event.target.className.indexOf("revert") > -1 || event.target.className.indexOf("del") > -1) {
	// 		$("#list tr").removeClass("selected");
	// 		isCheck.addClass("selected");
	// 	}else{
	// 		if(checkLength > 1){
	// 			$("#list tr").removeClass("selected");
	// 			isCheck.addClass("selected");
	// 		}else{
	// 			if(isCheck.hasClass("selected")){
	// 				isCheck.removeClass("selected");
	// 			}else{
	// 				$("#list tr").removeClass("selected");
	// 				isCheck.addClass("selected");
	// 			}
	// 		}
	// 	}
	//
	// 	init.funTrStyle();
	// });

	$("#userWithdraw").bind("click", function(){
		var href = $(this).attr("href");
	    try {
	      event.preventDefault();
	      parent.addPage("userWithdraw", "finance", "佣金提现","member/"+href);
	    } catch(e) {}
	});
	$("#catrecord").bind("click", function(){
		var href = $(this).attr("href");
		console.log(href);
	    try {
	      event.preventDefault();
	      parent.addPage("catRecord", "finance", "提现记录","member/"+href);
	    } catch(e) {}
	});

	//更新资料
	$("#updataPro").bind("click", function(){

		init.quickEdit();

	});
});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#keyword").val()),
		start    = $("#start").html(),
		end      = $("#end").html(),
		type     = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		leimutype= $("#leimuBtn").attr("data-id") ? $("#leimuBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";
	var data = [];
		data.push("cityid="+cityid);
		data.push("start="+start);
		data.push("end="+end);
		data.push("pagestep="+pagestep);
		data.push("page="+page);
		data.push("sKeyword="+sKeyword);
		data.push("type="+type);
		data.push("leimutype="+leimutype);
	huoniao.operaJson("commissionCount.php?dopost=getList",data.join("&"), function(val){
		console.log(val);
		var obj = $("#list"), listArr = [], moduleArr = [],i = 0, list = val.list,modulemoneyarr = val.modulemoneyarr;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount0);
		$(".totalMoney, #totalAdd").html(val.pageInfo.totalMoney);
		$("#allcommission").html(val.allcommission);
		$("#count").html(val.count);
		$("#ordertype").html(val.ordertype);
		$("#date").html(val.date);
		$(".state0").html(val.pageInfo.state0);
		$(".state1").html(val.pageInfo.state1);
		$("#fzmoney").html(val.fzmoney);

		$("#typeinfolist").html('');

		if(modulemoneyarr){
			for (var a = 1; a < modulemoneyarr.length; a++ ){
				if(modulemoneyarr[a].name == '' ) continue;
				moduleArr.push(' <li><a href="javascript:;" data-id="'+modulemoneyarr[a].name+'">'+modulemoneyarr[a].subject+'(数量:<span class="normal">'+modulemoneyarr[a].allcount+'</span>)(金额:<span class="normal">'+modulemoneyarr[a].allcommission+'</span>)</a></li>')
			}
		}
		$("#typeinfolist").html(moduleArr.join(""));

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();
			moduleArr.push(' <li><a href="javascript:;"  data-id="all">全部信息(数量:<span class="totalCount">'+val.pageInfo.totalCount0+'</span>)(金额:<span class="totalMoney">'+val.pageInfo.totalMoney+'</span>)</a></li>')

			ordertype = '';
			for(i; i < list.length; i++){
				if(list[i].ordertype == ''){
					ordertype = "会员升级";
				}else{
					ordertype = list[i].ordertype;
				}
				if (ordertype == null){
					ordertype = "会员";
				}
				var opctxt = '<font color="#b1000f">- '+list[i].commission+'</font>';
				if(list[i].type == 1){//增加
					opctxt = '<font color="#30992e">+ '+list[i].commission+'</font>'
				}
				listArr.push('<tr data-id="'+list[i].id+'">');
				listArr.push('  <td class="row3"></td>');
				listArr.push('  <td class="row5 left">'+list[i].cityname+'</td>');
				listArr.push('  <td class="row10 left">'+ordertype+'</td>');
				listArr.push('  <td class="row10 left">'+list[i].ctypename+'</td>');
				listArr.push('  <td class="row10 left"><a href="javascript:;" class="userinfo" data-id="'+list[i].userid+'">'+list[i].username+'</td>');
				listArr.push('  <td class="row10 left">'+opctxt+'</td>');
				listArr.push('  <td class="row10 left">'+list[i].substation+'</td>');
				listArr.push('  <td class="row30 left">'+list[i].info+'</td>');
				listArr.push('  <td class="row12 left">'+list[i].date+'</td>');

				// var amount = "";
				// if(list[i].type == 0){
				// 	amount = '<font color="#b1000f">- '+list[i].amount+'</font>';
				// }else{
				// 	amount = '<font color="#30992e">+ '+list[i].amount+'</font>';
				// }
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
