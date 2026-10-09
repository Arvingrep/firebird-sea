$(function(){
	huoniao.choseCity($(".choseCity"),$("#cityid"));
	$(".chosen-select").chosen();

	var init = {

			//删除
			del: function(){
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

	//初始加载
	getList();

	//开始、结束时间
	$("#stime, #etime").datetimepicker({format: 'yyyy-mm-dd', autoclose: true, minView: 3, language: 'ch'});

	//搜索
	$("#searchBtn").bind("click", function(){
		$("#sKeyword").html($("#keyword").val());
		$("#sPlatform").html($("#platform").val());
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
	$("#stateBtn, #pageBtn, #paginationBtn").delegate("a", "click", function(){
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

	//失败重试
	$('#list').delegate('.retry', 'click', function(){
		var t = $(this), id = t.closest('tr').attr('data-id');
		$.dialog.confirm('确认要重试吗？', function(){

			huoniao.operaJson("shareAllocation.php?dopost=retry", "id="+id, function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
					setTimeout(function() {
						getList();
					}, 800);
				}else{
					$.dialog.alert(data.info, function(){
						getList();
					});
				}
			});

		});
	});

	$('#list').delegate('.changeAmount', 'click', function(){
		var t = $(this), id = t.closest('tr').attr('data-id'), amount = t.attr('data-amount');

		$.dialog({
			fixed: true,
			title: '设置',
			content: $("#quickEdit").html(),
			width: 400,
			ok: function(){
				//提交
				var amount = self.parent.$("#amount").val();

				huoniao.operaJson("?dopost=updateAmount", "id="+id+"&amount="+amount, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						setTimeout(function() {
							getList();
						}, 800);
					}else{
						huoniao.showTip("error", data.info, "auto");
					}
				});

			},
			cancel: true
		});

		//填充信息
		self.parent.$("#amount").val(amount);

	});



	// 导出
	$("#export").click(function(e){
		// e.preventDefault();
		var sKeyword = encodeURIComponent($("#sKeyword").html()),
			platform = $("#sPlatform").html(),
			cityid   = $("#cityid").val(),
			start    = $("#start").html(),
			end      = $("#end").html(),
			state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "";

		var data = [];
			data.push("sKeyword="+sKeyword);
			data.push("platform="+platform);
			data.push("cityid="+cityid);
			data.push("start="+start);
			data.push("end="+end);
			data.push("state="+state);
			data.push("pagestep=200000");
			data.push("page=1");
		huoniao.showTip("loading", "正在导出，请稍候...", "auto");
		$(this).attr('href', '?dopost=getList&do=export&'+data.join('&'));

	})

});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		platform = $("#sPlatform").html(),
		cityid   = $("#cityid").val(),
		start    = $("#start").html(),
		end      = $("#end").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("platform="+platform);
		data.push("cityid="+cityid);
		data.push("start="+start);
		data.push("end="+end);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("shareAllocation.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), listArr = [], i = 0, list = val.list;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".state0").html(val.pageInfo.state0);
		$(".state1").html(val.pageInfo.state1);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < list.length; i++){
				listArr.push('<tr data-id="'+list[i].id+'">');
				listArr.push('  <td class="row2"></td>');
				listArr.push('  <td class="row5 left">'+list[i].cityname+'</td>');
				listArr.push('  <td class="row15 left">'+list[i].storename+'<i class="icon-question-sign" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="商户号：'+list[i].subMerId+(list[i].subMerPrtclNo ? '<br />协议编号：'+list[i].subMerPrtclNo : '')+'" data-html="true"></i><br /><a href="javascript:;" data-id="'+list[i].uid+'" class="userinfo"><code>'+list[i].username+'</code></a></td>');
				listArr.push('  <td class="row20 left">'+list[i].title+(list[i].orderdata ? '<i class="icon-question-sign" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="'+list[i].orderdata+'" data-html="true"></i>' : '')+'<br /><code>'+list[i].ordernum+'</code>'+(list[i].seqNo ? '<i class="icon-question-sign" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="第三方平台支付订单号：'+list[i].seqNo+'" data-html="true"></i>' : '')+'</td>');
				listArr.push('  <td class="row25 left"><span class="label label-success" style="margin-right:3px;">'+list[i].platform+'</span>'+list[i].subOrderNo+'<br />'+(list[i].subOrderTrxid ? '<code title="第三方平台支付订单号">'+list[i].subOrderTrxid+'</code>' : '')+'</td>');

                var amount = list[i].amount;
                if(!list[i].state){
                    amount = '<a href="javascript:;" class="changeAmount" title="点击修改金额" data-amount="'+amount+'"><u>'+amount+'</u></a>';
                }

				listArr.push('  <td class="row10 left">分账金额：'+amount+'<br /><code title="订单总金额">订单总额：'+list[i].totalAmount+'</code></td>');
				listArr.push('  <td class="row13 left">'+huoniao.transTimes(list[i].pubdate, 1)+'</td>');
				listArr.push('  <td class="row25 left">'+(list[i].state ? '<span class="audit">成功</span>' : '<span class="refuse">失败</span>')+(!list[i].state ? '<i class="icon-question-sign" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="'+list[i].info+'" data-html="true"></i><a href="javascript:;" class="retry">重试</a>' : '')+'</td>');
			}

			obj.find("tbody").html(listArr.join(""));
			$("#loading").hide();
			$("#list table").show();
			$('.icon-question-sign').tooltip();

			huoniao.showPageInfo();
		}else{

			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
