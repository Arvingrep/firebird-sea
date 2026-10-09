$(function(){

	var defaultBtn = $("#delBtn, #batchAudit"),
		checkedBtn = $("#stateBtn, #import"),
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

            //更新信息状态
            ,updateState: function(type){
                huoniao.showTip("loading", "正在操作，请稍候...");
    
                var checked = $("#list tbody tr.selected");
                if(checked.length < 1){
                    huoniao.showTip("warning", "未选中任何信息！", "auto");
                }else{
                    var arcrank = "";
                    if(type == "正常"){
                        arcrank = 1;
                    }else if(type == "锁定"){
                        arcrank = 2;
                    }
    
                    huoniao.showTip("loading", "正在操作，请稍候...");
                    var id = [];
                    for(var i = 0; i < checked.length; i++){
                        id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
                    }
                    huoniao.operaJson("?dopost=updateState", "id="+id+"&state="+arcrank, function(data){
                        if(data.state == 100){
                            huoniao.showTip("success", data.info, "auto");
                            setTimeout(function() {
                                getList();
                            }, 800);
                        }else{
                            $.dialog.alert("<div class='errInfo'>操作失败！</div>", function(){
                                getList();
                            });
                        }
                    });
                    $("#selectBtn a:eq(1)").click();
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
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							$("#selectBtn a:eq(1)").click();
							setTimeout(function() {
								getList();
							}, 800);
						}else{
							$.dialog.alert("删除失败！" + data.info, function(){
								getList();
							});
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
		$("#cityCode").html($("#ctype").attr("data-id"));
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
	$("#leimuBtn").delegate("a", "click", function(){
		var id = $(this).attr("data-id"), title = $(this).text();
		$("#leimuBtn").attr("data-id", id);
		$("#leimuBtn button").html(title+'<span class="caret"></span>');
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

			defaultBtn.css('display', 'inline-block');
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list tr").removeClass("selected");

			defaultBtn.hide();
			checkedBtn.css('display', 'inline-block');
		}
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
		}else if(event.target.className.indexOf("edit") > -1 || event.target.className.indexOf("revert") > -1 || event.target.className.indexOf("del") > -1 || event.target.className.indexOf("audit") > -1 || event.target.className.indexOf("refuse") > -1) {
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

	//删除
	$("#delBtn").bind("click", function(){
		$.dialog.confirm('此操作不可恢复，删除绑定记录会同时删除呼叫记录，您确定要删除吗？', function(){
			init.del();
		});
	});

	//单条删除
	$("#list").delegate(".del", "click", function(){
		$.dialog.confirm('此操作不可恢复，删除绑定记录会同时删除呼叫记录，您确定要删除吗？', function(){
			init.del();
		});
	});

	//批量解绑
	$("#batchAudit").bind("click", function(){
		$.dialog.confirm('您确定要解绑吗？', function(){
		    init.updateState($(this).text());
        });
	});

    //更新单条状态
	$("#list tbody").delegate(".unbind", "click", function(event){
        event.preventDefault();
        var t = $(this);
		$.dialog.confirm('您确定要解绑吗？', function(){
            init.updateState(t.attr('data-text'));
        });
    });

});

//获取列表
function getList(){
	huoniao.showTip("loading", "正在操作，请稍候...");
	$("#list table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		cityCode    = $("#cityCode").html(),
		start    = $("#start").html(),
		end      = $("#end").html(),
        leimutype= $("#leimuBtn").attr("data-id") ? $("#leimuBtn").attr("data-id") : "",
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("cityCode="+cityCode);
        data.push("source="+leimutype);
		data.push("start="+start);
		data.push("end="+end);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, data = val.list;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$(".used").html(val.pageInfo.used);
		$(".unbind").html(val.pageInfo.unbind);

		if(val.state == "100"){
			huoniao.hideTip();

			for(i; i < data.length; i++){
				list.push('<tr data-id="'+data[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				
				list.push('  <td class="row17 left">'+data[i].number+'<i class="icon-question-sign" data-toggle="tooltip" data-placement="bottom" title="" data-original-title="绑定ID：'+data[i].subscriptionId+'" data-html="true"></i><br /><code>'+data[i].cityName+'</code> <code>'+data[i].cityCode+'</code> <code>'+data[i].carrier+'</code></td>');
				list.push('  <td class="row25 left"><code>'+data[i].service+'</code> <small style="display: inline;">'+(data[i].url ? '<a href="'+data[i].url+'" target="_blank">'+data[i].title+'</a>' : data[i].title)+'</small></td>');
				list.push('  <td class="row12 left"><a href="javascript::" data-id="'+data[i].uidA+'" class="userinfo">'+data[i].userA+'</a><br /><code>'+data[i].numberA+'</code></td>');
				list.push('  <td class="row12 left"><a href="javascript::" data-id="'+data[i].uidB+'" class="userinfo">'+data[i].userB+'</a><br /><code>'+data[i].numberB+'</code></td>');
				list.push('  <td class="row12 left">'+data[i].time1+'<br />'+data[i].expire+'</td>');
				list.push('  <td class="row12 left">'+(data[i].iscall ? '<span style="color:#06bf06;">已呼叫</span><br />' : '<span class="gray">未呼叫</span><br />')+data[i].time2+'</td>');
				list.push('  <td class="row7">'+(data[i].time2.indexOf('使用中') > -1 ? '<a href="javascript:;" class="unbind" style="color:red">解绑</a>' : '<a href="javascript:;" class="del">删除</a>')+'</td>');
				list.push('</tr>');
			}

			obj.find("tbody").html(list.join(""));
            $('.icon-question-sign').tooltip();
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
