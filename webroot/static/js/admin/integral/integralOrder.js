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


			//快速编辑
			,quickEdit: function(){
				var checked = $("#list tbody tr.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					id = checked.attr("data-id");
					huoniao.showTip("loading", "正在获取信息，请稍候...");

					huoniao.operaJson("shopCommon.php?dopost=getDetail", "id="+id, function(data){
						if(data != null && data.length > 0){
							data = data[0];
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

									//图集
									var imglist = [], imgli = self.parent.$("#listSection li");
									if(imgli.length > 0){
										for(var i = 0; i < imgli.length; i++){
											var imgsrc = self.parent.$("#listSection li:eq("+i+")").find(".li-thumb img").attr("data-val");
											imglist.push(imgsrc);
										}
									}
									serialize = serialize+"&pics="+imglist.join(",");

									huoniao.operaJson("shopCommon.php?dopost=updateDetail", "id="+id+"&"+serialize, function(data){
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
							self.parent.$("#tuanTitle").html('<a href="'+data.prourl+'" target="_blank">'+data.protitle+'</a>');
							self.parent.$("#commonUser").html(data.username);
							self.parent.$("#commonContent").val(data.content);
							self.parent.$("#commonTime").val(huoniao.transTimes(data.dtime, 1));
							self.parent.$("#commonIp").val(data.ip);
							self.parent.$("#commonGood").val(data.good);
							self.parent.$("#commonBad").val(data.bad);
							self.parent.$("#rating").val(data.rating);
							self.parent.$("#score1").val(data.score1);
							self.parent.$("#score2").val(data.score2);
							self.parent.$("#score3").val(data.score3);
							self.parent.$("#replyContent").val(data.reply);

							if(data.pics != ""){
								var picsObj = self.parent.$("#pics");
								var imglist = data.pics;
								var picList = [];
								for(var i = 0; i < imglist.length; i++){
									picList.push('<li class="clearfix" style="cursor: default;">');
									picList.push('  <a class="li-rm" href="javascript:;">×</a>');
									picList.push('  <div class="li-thumb" style="display:block;">');
									picList.push('    <span class="ibtn">');
									picList.push('      <a href="'+cfg_attachment+imglist[i].val+'&type=large" target="_blank" class="enlarge" title="放大"></a>');
									picList.push('    </span>');
									picList.push('    <span class="ibg"></span>');
									picList.push('    <img data-val="'+imglist[i].val+'" src="'+cfg_attachment+imglist[i].val+'" style="cursor: default;" />');
									picList.push('  </div>');
									picList.push('</li>');
								}
								self.parent.$("#listSection").html(picList.join(""));
								self.parent.$("#deleteAllAtlas").show();
								picsObj.show();

								self.parent.$("#listSection").delegate(".li-rm", "click", function(){
									if(confirm("确定要删除吗？")){
										$(this).closest("li").remove();
									}
								});
							}

							self.parent.$("#commonIsCheck").find("option").each(function(){
								if($(this).val() == data.ischeck){
									$(this).attr("selected", true);
								}
							});

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

					huoniao.operaJson("integralOrder.php?dopost=del", "id="+id, function(data){
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
    $(".chosen-select").chosen();

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

			$("#typeBtn")
				.attr("data-id", "")
				.find("button").html('全部分类<span class="caret"></span>');

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

	//修改
	$("#list").delegate(".edit", "click", function(event){
		var id = $(this).attr("data-id"),
			title = $(this).attr("data-title"),
			href = $(this).attr("href");

		try {
			event.preventDefault();
			parent.addPage("editintegralorder"+id, "integral", title, "integral/"+href);
		} catch(e) {}
	});

	//付款
	$("#list").delegate(".payment", "click", function(){
		var id = $(this).attr("data-id");
		if(id != ""){
			$.dialog.confirm('此操作不可恢复，您确定要付款吗？', function(){
				huoniao.showTip("loading", "正在操作，请稍候...");
				huoniao.operaJson("integralOrder.php?dopost=payment", "id="+id, function(data){
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
				huoniao.operaJson("integralOrder.php?dopost=refund", "id="+id, function(data){
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

	//发货
	$("#list").delegate(".run", "click", function(event){
		var id = $(this).attr("data-id"), ordernum = $(this).closest('tr').find('.ordernum').text();

		$.dialog({
			fixed: true,
			title: '发货',
			content: $("#quickEdit").html(),
			width: 400,
			ok: function(){
				//提交
				var serialize = self.parent.$(".quick-editForm").serialize();

				huoniao.operaJson("integralOrder.php?dopost=delivery", "id="+id+"&"+serialize, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						setTimeout(function() {
							getList();
						}, 800);
					}else{
						alert(data.info);
						return false;
					}
				})
			}
		})

		self.parent.$("#productOrdernum").html(ordernum);

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


	//设置配送员
    $("#setCourier").bind("click", function(){
        var data = new Array();
        var courier = $("#courier_id").val();
        var checked = $("#list tbody tr.selected");
		if(checked.length < 1){
			huoniao.showTip("warning", "未选中任何信息！", "auto");
			return;
		}else if(courier == 0){
			huoniao.showTip("warning", "未选择骑手！", "auto");
			return;
		}

		huoniao.showTip("loading", "正在操作，请稍候...");
		var id = [];
		for(var i = 0; i < checked.length; i++){
			id.push($("#list tbody tr.selected:eq("+i+")").attr("data-id"));
		}

		huoniao.operaJson("integralOrder.php?dopost=setCourier", "id="+id+"&courier="+courier, function(data){
			if(data.state == 100){
				huoniao.showTip("success", data.info, "auto");
				$("#selectBtn a:eq(1)").click();
				setTimeout(function() {
					getList();
				}, 800);
			}else{
				$.dialog.alert(data.info, function(){
					getList();
				});
			}
		});
		$("#selectBtn a:eq(1)").click();

    });



    //取消配送员
    $("#cancelCourier").bind("click", function(){
        var data = new Array();
        $("input[name='selectorderl\[\]']:enabled").each(function (){
            if(this.checked == true){
                data.push(this.value);
            }
        });

        if(data.length > 0){

            $.dialog.confirm("确定取消？", function(){
                $.ajax({
                    url: "waimaiOrder.php",
                    type: "post",
                    data: {action: "cancelCourier", id: data.join(",")},
                    dataType: "json",
                    success: function(res){
                        if(res.state != 100){
                            $.dialog.alert(res.info);
                        }else{
                            location.reload();
                        }
                    },
                    error: function(){
                        $.dialog.alert("网络错误，操作失败！");
                    }
                })
            })
            return false;

        }else{
            $.dialog.alert("请选择要操作的订单和配送员!");
            return false;
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
		start    = $("#start").html(),
		end      = $("#end").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
    	data.push("adminCity="+$("#cityList").val());
		data.push("start="+start);
		data.push("end="+end);
		data.push("state="+state);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("integralOrder.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, integralOrder = val.integralOrder;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$("#totalPrice").html(val.totalPrice);
		$(".state0").html(val.pageInfo.state0);
		$(".state1").html(val.pageInfo.state1);
		$(".state3").html(val.pageInfo.state3);
		$(".state4").html(val.pageInfo.state4);
		$(".state6").html(val.pageInfo.state6);
		$(".state7").html(val.pageInfo.state7);
		$(".state10").html(val.pageInfo.state10);


		if(val.state == "100"){

			var integralTotalPrice = val.integralTotalPrice,
			peisongTotalPrice = val.peisongTotalPrice;
			$(".integralTotalPrice").html('&yen;'+integralTotalPrice);
			$(".peisongTotalPrice").html('&yen;'+peisongTotalPrice);
			$(".totalMoney").html('&yen;'+(integralTotalPrice+peisongTotalPrice));
		
			//huoniao.showTip("success", "获取成功！", "auto");
			huoniao.hideTip();


			for(i; i < integralOrder.length; i++){
				list.push('<tr data-id="'+integralOrder[i].id+'">');
				list.push('  <td class="row3"><span class="check"></span></td>');
				list.push('  <td class="row12 left"><div title="内部订单号" class="ordernum">'+integralOrder[i].ordernum+'</div><div title="第三方订单号">'+integralOrder[i].outordernum+'</div></td>');
				list.push('  <td class="row10 left"><a href="javascript:;" data-id="'+integralOrder[i].userid+'" class="userinfo">'+integralOrder[i].username+'</a></td>');
				list.push('  <td class="row13 left">'+integralOrder[i].orderprice+'元 + '+integralOrder[i].orderpoint+'积分</td>');
				list.push('  <td class="row15 left">'+integralOrder[i].orderdate+'</td>');
				list.push('  <td class="row15 left">'+integralOrder[i].paytype+'</td>');
				var state = "&nbsp;";
				switch (integralOrder[i].orderstate) {
					case "0":
						state = '<span class="gray">未付款</span>';
						break;
					case "1":
						state = '已付款';
						break;
					case "2":
						state = '<span class="refuse">已过期</span>';
						break;
					case "3":
						state = '<span class="audit">交易成功</span>';
						break;
					case "4":
						state = '<span class="refuse">退款中</span>';
						break;
					case "6":
						//申请退款
						if(integralOrder[i].retState == 1){
							state = '<span class="refuse">申请退款</span>';
						//未申请退款
						}else{
							state = "已发货";
						}
						break;
					case "7":
						state = '<span class="audit">退款成功</span>';
						break;
					case "10":
						state = '<span class="refuse">关闭</span>';
						break;
				}
				list.push('  <td class="row17 left">'+state+'</td>');
				// list.push('  <td class="row17 left">');
				// var qishou = '';
				// if(integralOrder[i].peisongid){
				// 	qishou += '<div>骑手：'+integralOrder[i].peisongid+'</div>';
				// 	qishou += '<div>接单时间：'+integralOrder[i].peidate+'</div>';
				// 	if(integralOrder[i].songdate){
				// 		qishou += '<div>取货时间：'+integralOrder[i].songdate+'</div>';
				// 	}
				// 	if(integralOrder[i].okdate){
				// 		qishou += '<div style="color:#629b58;">完成时间：'+integralOrder[i].okdate+'</div>';
				// 	}
				// }else{
				// 	qishou = '<div style="color:#f60;">未分配</div>';
				// }
				// list.push(qishou);
				// list.push('  </td>');
				var btn = "";
				// if(integralOrder[i].orderstate == "0"){
				// 	btn = '<a href="javascript:;" data-id="'+integralOrder[i].id+'" class="payment" title="付款">付款</a>';
				// }
				// if(integralOrder[i].orderstate == "1" || integralOrder[i].orderstate == "2" || integralOrder[i].orderstate == "4" || integralOrder[i].orderstate == "6"){
				// 	btn = '<a href="javascript:;" data-id="'+integralOrder[i].id+'" class="refund" title="退款">退款</a>';
				// }

				if(integralOrder[i].orderstate == "1"){
					btn = '<a href="javascript:;" data-id="'+integralOrder[i].id+'" class="run" title="发货">发货</a>';
				}

				list.push('  <td class="row15 left"><a data-id="'+integralOrder[i].id+'" data-title="'+integralOrder[i].ordernum+'" href="integralOrderEdit.php?dopost=edit&id='+integralOrder[i].id+'" title="修改" class="edit">修改</a><a href="javascript:;" title="删除" class="del">删除</a>'+btn+'</td>');

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
