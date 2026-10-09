$(function(){

	$(".chosen-select").chosen();

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

	$("#export").click(function(e){
		var t = $(this),
			sKeyword = encodeURIComponent($("#sKeyword").html()),
			cityid   = $("#cityid").val(),
			start    = $("#start").html(),
			end      = $("#end").html(),
			type    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "";
			leimutype    = $("#leimuBtn").attr("data-id") ? $("#leimuBtn").attr("data-id") : "";
			paytype    = $("#shouruBtn").attr("data-id") ? $("#shouruBtn").attr("data-id") : "";


		var url = '?do=export&sKeyword='+sKeyword+'&start='+start+'&end='+end+'&type='+type+'&paytype='+paytype;
		t.attr('href', url);

	})

	//二级菜单点击事件
	$("#stateBtn, #pageBtn, #paginationBtn,#leimuBtn, #shouruBtn").delegate("a", "click", function(){
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
		if(!obj.attr("noList")){
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

    //跳转到支付方式页面
    $('#sitePaymentLink').bind('click', function(event){
        var href = $(this).attr("href");
        event.preventDefault();
	  	try {
            parent.addPage("sitePaymentphp", "siteConfig", "支付方式设置", href);
	  	} catch(e) {}
	});

});

var clipboards = null;

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		cityid   = $("#cityid").val(),
		start    = $("#start").html(),
		end      = $("#end").html(),
		type     = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		leimutype    = $("#leimuBtn").attr("data-id") ? $("#leimuBtn").attr("data-id") : "",
		paytype    = $("#shouruBtn").attr("data-id") ? $("#shouruBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("cityid="+cityid);
		data.push("start="+start);
		data.push("end="+end);
		data.push("type="+type);
		data.push("leimutype="+leimutype);
		data.push("paytype="+paytype);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("ptChargeLogs.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), listArr = [], i = 0, list = val.list;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$("#totalLess").html(val.totalLess);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();

			for(i; i < list.length; i++){
				listArr.push('<tr data-id="'+list[i].id+'">');

				if(list[i].ordertype == null){
					ordertype = "未知";
				}else{
					ordertype = list[i].ordertype;
				}
				listArr.push('  <td class="row10 left">&nbsp;&nbsp;'+ordertype+'</td>');
				listArr.push('  <td class="row20 left"><a href="javascript:;" data-id="'+list[i].userid+'" class="userinfo">'+list[i].username+'</a></td>');
				listArr.push('  <td class="row15 left">'+list[i].pt_charge+'<br><code>'+list[i].amount+'</code></td>');
				listArr.push('  <td class="row30 left">'+list[i].paytype+'<br>'+list[i].ordernum+"<br>"+list[i].transaction_id+'</td>');
				listArr.push('  <td class="row15 left">'+list[i].date+'</td>');
				listArr.push('  <td class="row10">'+'<span class="copy btn_copy" style="cursor: pointer;" title="复制信息" data-clipboard-text='+list[i].info+'></span></td>');
			}

			obj.find("tbody").html(listArr.join(""));
			$("#loading").hide();
			$("#list table").show();
			huoniao.showPageInfo();

			var btns = document.querySelectorAll('.btn_copy');
			// 生成clipboard
			if(clipboards){
				clipboards.destroy();
				clipboards = null;
			}
			clipboards = new ClipboardJS(btns);
			// 复制成功事件
			clipboards.on('success', function(e) {
				huoniao.showTip("success", "复制成功！", "auto");
			});
			// 复制失败事件
			clipboards.on('error', function(e) {
				huoniao.showTip("warning", "复制失败！", "auto");
			});
		}else{

			obj.find("tbody").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
