$(function(){

	var defaultBtn = $("#delBtn, #courierSelect"),
		checkedBtn = $("#stateBtn"),
		init = {

			//选中样式切换
			funTrStyle: function(){
				var trLength = $("#list table").length, checkLength = $("#list table.selected").length;
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
				var checked = $("#list table.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					huoniao.showTip("loading", "正在操作，请稍候...");
					var id = [];
					for(var i = 0; i < checked.length; i++){
						id.push($("#list table.selected:eq("+i+")").attr("data-id"));
					}

					huoniao.operaJson("shopOrder.php?dopost=del", "id="+id, function(data){
						if(data.state == 100){
							huoniao.showTip("success", data.info, "auto");
							$("#selectBtn a:eq(1)").click();
							setTimeout(function() {
								getList();
							}, 800);
						}else{
							var info = [];
							for(var i = 0; i < $("#list table").length; i++){
								var tr = $("#list table:eq("+i+")");
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
				var checked = $("#list table.selected");
				if(checked.length < 1){
					huoniao.showTip("warning", "未选中任何信息！", "auto");
				}else{
					id = checked.attr("data-id");
					huoniao.showTip("loading", "正在获取信息，请稍候...");

					huoniao.operaJson("shopOrder.php?dopost=getDetail", "id="+id, function(data){
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
									serialize = serialize;

									huoniao.operaJson("shopOrder.php?dopost=refund", "tuikuantype=1&id="+id+"&"+serialize, function(data){
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
							self.parent.$("#store").html(data.user_exptypename);
							self.parent.$("#user").html(data.ret_datetime);
							if(data.ret_negotiate){
								var negotiate = [];

								var ret_negotiate = data.ret_negotiate.refundinfo;
								negotiate.push('<div>');
								for(var i = 0; i < ret_negotiate.length; i++){
									negotiate.push('类型:'+ret_negotiate[i].typename+'</br>'+'原因:'+ret_negotiate[i].refundinfo);
								}
								negotiate.push('</div>');
							}

							self.parent.$("#negotiate").html(negotiate.join(""));

						}else{
							huoniao.showTip("error", "信息获取失败！", "auto");
						}
					});
				}

			}

		};

   //填充分站列表
   huoniao.choseCity($(".choseCity"),$("#cityList"));  //城市分站选择初始化
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

        $("#shoptype").html($('#shoptypeBtn').attr('data-id'));
        $("#payment").html($('#paymentBtn').attr('data-id'));
        $("#huodong").html($('#huodongBtn').attr('data-id'));
        $("#shipping").html($('#shippingBtn').attr('data-id'));
        $("#timetype").html($('#timetypeBtn').val());
        $("#searchtype").html($('#searchtypeBtn').val());

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
	$("#shoptypeBtn a, #paymentBtn a, #huodongBtn a, #shippingBtn a").bind("click", function(){
		var id = $(this).attr("data-id"), title = $(this).text(), par = $(this).closest('.btn-group');
		par.attr("data-id", id);
		par.find("button").html(title+'<span class="caret"></span>');
	});

	// 导出
	$("#export").click(function(e){
		var sKeyword = encodeURIComponent($.trim($("#sKeyword").html())),
			start    = $("#start").html(),
			end      = $("#end").html(),
			shoptype = $("#shoptype").html(),
			payment = $("#payment").html(),
			huodong = $("#huodong").html(),
			shipping = $("#shipping").html(),
			timetype = $("#timetype").html(),
			searchtype = $("#searchtype").html(),
			state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "";

		var data = [];
		data.push("sKeyword="+sKeyword);
		data.push("adminCity="+$("#cityList").val());
		data.push("start="+start);
		data.push("end="+end);
		data.push("state="+state);
		data.push("shoptype="+shoptype);
		data.push("payment="+payment);
		data.push("huodong="+huodong);
		data.push("shipping="+shipping);
		data.push("timetype="+timetype);
		data.push("searchtype="+searchtype);
		data.push("pagestep=200000");
		data.push("page=1");

        huoniao.showTip("loading", "正在导出，请稍候...");
        setTimeout(function() {
            huoniao.hideTip();
        }, 10000);
		$(this).attr('href', 'shopOrder.php?dopost=getList&do=export&'+data.join('&'));

	})

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
			$("#list table").removeClass("selected").addClass("selected");

			defaultBtn.show();
			checkedBtn.hide();
		}else{
			$("#selectBtn .check").removeClass("checked");
			$("#list table").removeClass("selected");

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
			parent.addPage("editshoporder"+id, "shop", title, "shop/"+href);
		} catch(e) {}
	});

	//配送员位置
	$("#courierLocation").bind("click", function(){
		try {
			event.preventDefault();
			parent.addPage("waimaiCourierMapphp", "waimai", "配送员位置", "waimai/waimaiCourierMap.php");
		} catch(e) {}
	});


    //查看位置
    $("#list").delegate(".dituMark", "click", function(){
        var t = $(this), lng = t.data("lng"), lat = t.data("lat");

        $.dialog({
			id: "markDitu",
			title: "查看收货地址位置",
			content: 'url:/api/map/mark.php?mod=shop&lnglat='+lat+","+lng+"&city=&onlyshow=1",
			width: 1000,
			height: 600,
			max: true,
			ok: function(){

			},
			cancel: true
		});
    });

	//付款
	$("#list").delegate(".payment", "click", function(){
		var id = $(this).attr("data-id");
		if(id != ""){
			$.dialog.confirm('此操作不可恢复，确定要更新该订单为已付款吗？<br />如果订单中使用了'+cfg_pointName+'抵扣，但是用户的'+cfg_pointName+'余额不足时，将自动把抵扣的费用全部使用余额支付！<br />如果订单使用了vip折扣和优惠券，请确认有效后再操作！<br />注意：支付的金额将从下单用户的账户余额中扣除，如果账户余额不足，请先为用户充值！', function(){
				huoniao.showTip("loading", "正在操作，请稍候...");
				huoniao.operaJson("shopOrder.php?dopost=payment", "id="+id, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						setTimeout(function() {
							getList();
						}, 800);
					}else{
                        huoniao.hideTip();
                        $.dialog.alert(data.info);
					}
				});
				$("#selectBtn a:eq(1)").click();
			});
		}
	});

	//恢复订单
	$("#list").delegate(".reset", "click", function(){
		var id = $(this).attr("data-id");
		if(id != ""){
			$.dialog.confirm('该功能用于订单已完成付款，但状态未更新为已付款；<br />或者其他原因需要直接恢复订单状态时使用。<br />操作前，请先与店铺确认订单中涉及到的商品是否可以正常销售！<br />涉及到的资金对账问题，请线下做好记录！<br /><br />如果订单中使用了'+cfg_pointName+'抵扣，但是用户的'+cfg_pointName+'余额不足时，将自动把抵扣的费用全部使用余额支付！<br />如果订单使用了vip折扣和优惠券，请确认有效后再操作！<br />注意：支付的金额将从下单用户的账户余额中扣除，如果账户余额不足，请先为用户充值！', function(){
				huoniao.showTip("loading", "正在操作，请稍候...");
				huoniao.operaJson("shopOrder.php?dopost=payment", "admin=1&id="+id, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						setTimeout(function() {
							getList();
						}, 800);
					}else{
                        huoniao.hideTip();
                        $.dialog.alert(data.info);
					}
				});
				$("#selectBtn a:eq(1)").click();
			});
		}
	});

	//退款
	// $("#list").delegate(".refund", "click", function(){
	// 	var id = $(this).attr("data-id");
	// 	if(id != ""){
	// 		$.dialog.confirm('此操作不可恢复，您确定要退款吗？', function(){
	// 			huoniao.showTip("loading", "正在操作，请稍候...");
	// 			huoniao.operaJson("shopOrder.php?dopost=refund", "id="+id, function(data){
	// 				if(data.state == 100){
	// 					huoniao.showTip("success", data.info, "auto");
	// 					setTimeout(function() {
	// 						getList();
	// 					}, 800);
	// 				}else{
	// 					huoniao.showTip("error", data.info, "auto");
	// 				}
	// 			});
	// 			$("#selectBtn a:eq(1)").click();
	// 		});
	// 	}
	// });

	//退款
	$("#list").delegate(".refund", "click", function(){
		var id = $(this).attr("data-id"), step = $(this).attr('title'), state = $(this).closest('tr').attr('data-state');
		if(id != ""){
			var info = '';
	        if(step == '继续退款'){
	            info = '<p style="font-weight:bold;font-size:14px;color:#f60;">该订单已经有过退款操作，确定要继续退款吗？</p><p>(选填金额，0表示退回剩余全部)</p>';
	        }else{
	            info = state == "3" ? '<p style="font-weight:bold;font-size:14px;color:#f60;">该订单已成功，确定要退款吗？</p><p>(选填金额，0表示全额退款)' : '确定要退款吗？(选填金额，0表示全额退款)</p>';
	        }
			$.dialog.prompt(info, function(amount){
				huoniao.showTip("loading", "正在操作，请稍候...");
				huoniao.operaJson("shopOrder.php?dopost=refund", "id="+id+"&amount="+amount, function(data){
					if(data.state == 100){
						huoniao.showTip("success", data.info, "auto");
						setTimeout(function() {
							getList();
						}, 800);
					}else{
                        huoniao.hideTip();
                        $.dialog.alert(data.info);
					}
				});
				$("#selectBtn a:eq(1)").click();
			}, '0" type="number" min="0"');
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

	//撤销申请
	$("#list").delegate(".revoke", "click", function(){
		var t = $(this), id = t.closest('tr').attr('data-id');
		$.dialog.confirm('确定要撤销此申请吗？', function(){
			huoniao.showTip("loading", "正在操作，请稍候...");
			huoniao.operaJson("shopOrder.php?dopost=revoke", "id="+id, function(data){
				if(data.state == 100){
					huoniao.showTip("success", data.info, "auto");
					setTimeout(function() {
						getList();
					}, 800);
				}else{
                    huoniao.hideTip();
                    $.dialog.alert(data.info);
				}
			});
		});
	});

	//详情、修改
	$("#list").delegate(".ptjieru", "click", function(){
		init.quickEdit();
	});

	//单选
	$("#list").delegate("table", "click", function(event){
		var isCheck = $(this), checkLength = $("#list table.selected").length;
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
				$("#list table").removeClass("selected");
				isCheck.addClass("selected");
			}else{
				if(isCheck.hasClass("selected")){
					isCheck.removeClass("selected");
				}else{
					$("#list table").removeClass("selected");
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
        var checked = $("#list table.selected");
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
			id.push($("#list table.selected:eq("+i+")").attr("data-id"));
		}

		huoniao.operaJson("shopOrder.php?dopost=setCourier", "id="+id+"&courier="+courier, function(data){
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
	$("#table, #pageInfo").hide();
	$("#selectBtn a:eq(1)").click();
	$("#loading").html("加载中，请稍候...").show();
	var sKeyword = encodeURIComponent($("#sKeyword").html()),
		start    = $("#start").html(),
		end      = $("#end").html(),
        shoptype = $("#shoptype").html(),
        payment = $("#payment").html(),
        huodong = $("#huodong").html(),
        shipping = $("#shipping").html(),
        timetype = $("#timetype").html(),
        searchtype = $("#searchtype").html(),
		state    = $("#stateBtn").attr("data-id") ? $("#stateBtn").attr("data-id") : "",
		pagestep = $("#pageBtn").attr("data-id") ? $("#pageBtn").attr("data-id") : "10",
		page     = $("#list").attr("data-atpage") ? $("#list").attr("data-atpage") : "1";

	var data = [];
		data.push("sKeyword="+sKeyword);
    	data.push("adminCity="+$("#cityList").val());
		data.push("start="+start);
		data.push("end="+end);
		data.push("state="+state);
		data.push("shoptype="+shoptype);
		data.push("payment="+payment);
		data.push("huodong="+huodong);
		data.push("shipping="+shipping);
		data.push("timetype="+timetype);
		data.push("searchtype="+searchtype);
		data.push("pagestep="+pagestep);
		data.push("page="+page);

	huoniao.operaJson("shopOrder.php?dopost=getList", data.join("&"), function(val){
		var obj = $("#list"), list = [], i = 0, shopOrder = val.shopOrder;
		obj.attr("data-totalpage", val.pageInfo.totalPage);
		$(".totalCount").html(val.pageInfo.totalCount);
		$("#totalPrice").html(val.totalPrice);
		$(".state0").html(val.pageInfo.state0);
		$(".state1").html(val.pageInfo.state1);
		$(".state3").html(val.pageInfo.state3);
		$(".state4").html(val.pageInfo.state4);
		$(".state60").html(val.pageInfo.state60);
		$(".state61").html(val.pageInfo.state61);
		$(".state62").html(val.pageInfo.state62);
		$(".state63").html(val.pageInfo.state63);
		$(".state64").html(val.pageInfo.state64);
		$(".state65").html(val.pageInfo.state65);
		$(".state66").html(val.pageInfo.state66);
		$(".state7").html(val.pageInfo.state7);
		$(".state10").html(val.pageInfo.state10);
		$(".state11").html(val.pageInfo.state11);
		$(".state12").html(val.pageInfo.state12);

		if(val.state == "100"){
			//huoniao.showTip("success", "获取成功！", "auto");

			var shopTotalPrice = val.shopTotalPrice,
			peisongTotalPrice = val.peisongTotalPrice;
			$(".shopTotalPrice").html('&yen;'+shopTotalPrice);
			$(".peisongTotalPrice").html('&yen;'+peisongTotalPrice);
			$(".totalMoney").html('&yen;'+(shopTotalPrice+peisongTotalPrice));

			huoniao.hideTip();

			for(i; i < shopOrder.length; i++){

                var item = shopOrder[i];

                var protype = item.protype == 0 ? '实物' : '电子券';

                //活动信息
                var huodong = '';
                if(item.huodongtype){
                    var huodongName = '';
                    if(item.huodongtype == 1){
                        huodongName = '准点抢';
                    }else if(item.huodongtype == 2){
                        huodongName = '秒杀';
                    }else if(item.huodongtype == 3){
                        huodongName = '砍价';
                    }else if(item.huodongtype == 4){
                        huodongName = '拼团';
                    }
                    huodong = '<span class="label label-info label-huodong-'+item.huodongtype+'">'+huodongName+'</span>';
                }

                //操作按钮
                var btn = "";
				if(shopOrder[i].orderstate == "0"){
					// btn = '<a href="javascript:;" data-id="'+shopOrder[i].id+'" class="payment" title="付款">授权付款</a>';
				}
				if(shopOrder[i].orderstate == "1" || shopOrder[i].orderstate == "2" || shopOrder[i].orderstate == "4" || shopOrder[i].orderstate == "6"){
					if(shopOrder[i].paytypeold != 'delivery'){
						// btn = '<a href="javascript:;" data-id="'+shopOrder[i].id+'" class="refund" title="退款">确认退款</a>';
					}
				}

                list.push(`<table class="oh" data-id="${item.id}">
                <colgroup>
                    <col style="width:31%;">
                    <col style="width:8%;">
                    <col style="width:19%;">
                    <col style="width:15%;">
                    <col style="width:15%;">
                    <col style="width:12%;">
                </colgroup>
                <thead>
                    <tr>
                        <th colspan="4" align="left">
                            <span class="check"></span>
                            <code style="padding: 1px 4px; margin-right: 3px; display: inline-block; line-height: 16px; background: #F7FAFF; border: 1px solid #CED9ED; border-radius: 4px; color: #7D8FB3;">${protype}</code>
                            ${huodong}
                            <span class="text">订单号：${item.ordernum}</span>
                            <span class="text">下单时间：${item.orderdate}</span>
                            <span class="text">店铺：<a href="${item.storeUrl}" target="_blank">${item.store}</a></span>
                        </th>
                        <th class="oper-td" colspan="2">
                            <a data-id="${item.id}" data-title="${item.ordernum}" href="shopOrderEdit.php?dopost=edit&id=${item.id}" title="修改" class="edit">订单详情</a>
                            ${btn}
                            <a href="javascript:;" title="删除" class="del">删除订单</a>
                        </th>
                    </tr>
                </thead>
                <tbody>
                `);

                //骑手配送信息
                var qishou = '';
                if(item.shipping == 0 && item.peisongid){
                    qishou += '<div>骑手：'+item.peisongname+'</div>';
                    qishou += '<small>接单时间：'+item.peidate+'</small>';
                    if(item.songdate){
                        qishou += '<small>取货时间：'+item.songdate+'</small>';
                    }
                    if(item.okdate){
                        qishou += '<small style="color:#629b58;">完成时间：'+item.okdate+'</small>';
                    }
                }

                //配送方式
                var shipping = '-';
                if(item.shipping == 0 && item.peisongid){
                    shipping = '骑手配送';
                }else if(item.shipping == 1){
                    shipping = '快递配送';
                    if(item.exp_company && item.exp_number){
                        shipping += `<p>${item.exp_company} <a href="https://www.baidu.com/s?wd=${item.exp_number}" target="_blank">${item.exp_number}</a></p>`;
                        if(item.exp_date){
                            shipping += `<small>发货时间：${item.exp_date}</small>`;
                        }
                    }
                }else if(item.shipping == 2){
                    shipping = '商家自配';
                }
                shipping += qishou;

                //订单状态
                var state = "";
				switch (item.orderstate) {
					case "0":
						state = '<span class="refuse">未付款</span><br /><a href="javascript:;" style="background: none;text-indent: 0;width: auto;margin: 0;height: auto;" data-id="'+shopOrder[i].id+'" class="payment btn btn-mini" title="付款">授权付款</a>';
						break;
					case "1":
						// state = '已付款';
						state = '待发货';
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
						if(item.retState == 1){
							// if(item.paytypeold!='delivery'){
								state = '<span class="refuse">申请退款</span><br /><a href="javascript:;" class="btn btn-mini revoke">撤销申请</a>';
							// }
						//未申请退款
						}else{
							if(item.shipping==1){
								state = "已发货<br /><small>" + item.exp_date + "</small>";
							}else{
								if((item.peisongid == 0 || item.peisongid == '')&&  item.retState == 0 && item.exp_date != 0 ){
									state = '<span class="refuse">'+(item.shipping == 0 ? '待配送' : '配送中')+'-'+(item.shipping == 0 ? '平台配送' : '商家配送')+'</span><br />' + item.exp_date;
								}else if ((item.peisongid == 0 || item.peisongid == '') && item.exp_date == 0 ){
									state = '<span class="refuse">待配送</span>';
								}else{
									if(item.songdate == 0){
										state = '<span class="refuse">待取货</span>';
									}else{
										state = '<span class="refuse">配送中</span>';
									}
								}
							}
						}
						break;
					case "7":
						state = '<span class="audit">退款成功</span>';
						var moneyname = "";
						if(item.paytype=="paytypeold"){
							moneyname = cfg_pointName;
						}else{
							moneyname = "余额";
						}
						state += '<div class="audit">'+(item.refrundamount == 0 ? '全额' : moneyname+(echoCurrency('symbol')+item.refrundamount))+'</div>';
						break;
					case "10":
						state = '<span class="gray">关闭</span><br /><a href="javascript:;" style="background: none;text-indent: 0;width: auto;margin: 0;height: auto;" data-id="'+shopOrder[i].id+'" class="reset btn btn-mini" title="恢复订单">恢复订单</a>';
						break;
				}

                if(shopOrder[i].orderstate == "1" || shopOrder[i].orderstate == "2" || shopOrder[i].orderstate == "4" || shopOrder[i].orderstate == "6"){
					if(shopOrder[i].paytypeold != 'delivery'){
						state += '<br /><a style="background: none;text-indent: 0;width: auto;margin: 0;height: auto;" href="javascript:;" data-id="'+shopOrder[i].id+'" class="btn btn-mini refund" title="退款">授权退款</a>';
					}
				}

                //订单商品列表
                var proList = item.proList;

                if(proList.length > 0){
                    for(var j = 0; j < proList.length; j++){

                        var proItem = proList[j];
                        var proprice = echoCurrency('symbol') + proItem.price;

                        //商品规格
                        var specation = proItem.specation ? proItem.specation.join('<br />') : '';

                        //收货信息
                        var address = '';
                        if(item.people && item.contact){
                            address = '<p>收货人：'+item.people+'</p>';
                            address += '<p>联系方式：'+item.contact+(item.lng && item.lat ? '<img data-lng="'+item.lat+'" data-lat="'+item.lng+'" src="/static/images/admin/markditu.jpg" class="dituMark" style="cursor: pointer; margin-left: 10px; display: inline-block; vertical-align: text-top; width: auto; height: 16px;" title="查看地图位置">' : '')+'</p>';
                            address += '<p>收货地址：'+item.address+'</p>';
                        }

                        //会员信息
                        var level = '';
                        if(item.level.length != 0){
                            level = '<span class="level">'+(item.level.icon ? '<img src="'+item.level.icon+'" onerror="this.src=\'/static/images/rz_licenseState.png\'" />' : '')+item.level.name+'</span>';
                        }

                        //费用明细
                        var priceinfo = `<em style='width:90px;text-align:right;display:inline-block;font-style:normal;'>商品小计：</em>${echoCurrency('symbol') + item.proPrice}<br /><em style='width:90px;text-align:right;display:inline-block;font-style:normal;'>运费：</em>${echoCurrency('symbol') + item.logistic}`;

                        var changeprice = item.changeprice;
                        if(changeprice){
                            priceinfo += `<br /><em style='width:90px;text-align:right;display:inline-block;font-style:normal;'>改价后总额：</em>${echoCurrency('symbol') + changeprice}`;
                        }
                        
                        var auth_shop_price = item.auth_shop_price;
                        if(auth_shop_price){
                            priceinfo += `<br /><em style='width:90px;text-align:right;display:inline-block;font-style:normal;'>会员商品折扣：</em>-${echoCurrency('symbol') + auth_shop_price}`;
                        }
                        var auth_logistic = item.auth_logistic;
                        if(auth_logistic){
                            priceinfo += `<br /><em style='width:90px;text-align:right;display:inline-block;font-style:normal;'>会员运费折扣：</em>-${echoCurrency('symbol') + auth_logistic}`;
                        }

                        var auth_quan = item.auth_quan;
                        if(auth_quan){
                            priceinfo += `<br /><em style='width:90px;text-align:right;display:inline-block;font-style:normal;'>优惠券：</em>-${echoCurrency('symbol') + auth_quan}`;
                        }

                        var pointAmount = item.pointAmount;
                        if(pointAmount){
                            priceinfo += `<br /><em style='width:90px;text-align:right;display:inline-block;font-style:normal;'>${cfg_pointName}支付：</em>-${echoCurrency('symbol') + pointAmount}`;
                        }

                        priceinfo += `<br /><em style='width:90px;text-align:right;display:inline-block;font-style:normal;'>实付款：</em><font color='#ff0000'>${echoCurrency('symbol') + item.orderprice}</font>`;


                        var td = j == 0 ? `<td rowspan="${proList.length}">
                            <p><a href="javascript:;" data-id="${item.userid}" class="link userinfo">${item.username}</a>${level}</p>
                            ${address}
                        </td>
                        <td rowspan="${proList.length}">
                            <p class="orderPrice" data-toggle="popover" data-placement="top" data-content="<p style='font-size:12px;padding-right:10px;'>${priceinfo}</p>">${echoCurrency('symbol') + item.orderprice + (item.paydate ? '（' + item.payname + '）' : '')}</p>
                            <p>${item.protype == 0 ? '含运费：' + echoCurrency('symbol') + item.logistic : ''}</p>
                            ${item.changeprice ? '<code>有改价</code>' : ''}
                        </td>
                        <td rowspan="${proList.length}">
                            <p>${shipping}</p>
                        </td>
                        <td rowspan="${proList.length}">
                            <p>${state}</p>
                        </td>` : '';

                        list.push(`<tr>
                            <td class="pro-info">
                                <a class="pro-image" href="${proItem.url}" target="_blank"><img onerror="this.src='/static/images/good_default.png'" class="litpic" src="${proItem.litpic}" style="width:66px;" alt="${proItem.title}"></a>
                                <div class="pro-txt">
                                    <a class="pro-title" href="${proItem.url}" target="_blank">${proItem.title}</a>
                                    <p class="pro-spection">${specation}</p>
                                </div>
                            </td>
                            <td>
                                <p>${proprice}</p>
                                <p>X ${proItem.count}</p>
                            </td>
                            ${td}
                        `);

                    }
                }
                //订单中的商品异常时
                else{

                    list.push(`<tr><td colspan="6" style="text-align: center; height: 50px; color: #f00;">订单中的商品已被删除，获取失败！</td></tr>`);

                }

                list.push('</tr></tbody>');
                

                //砍价信息
                var bargaining = item.bargaining;
                if(item.huodongtype == 3 && bargaining != undefined){

                    var _state = '';
                    if(bargaining.state == 0){
                        _state = '砍价中';
                    }else if(bargaining.state == 1){
                        _state = '砍价成功';
                    }else if(bargaining.state == 2){
                        _state = '砍价失败';
                    }else if(bargaining.state == 3){
                        _state = '已购买';
                    }

                    list.push('<tbody><tr><td colspan="7">砍价次数 <span class="label" style="margin-right: 20px;">'+bargaining.kj_num+'</span>商品原价 <span class="label" style="margin-right: 20px;">'+echoCurrency('symbol') + bargaining.gmoney+'</span>最低可砍至 <span class="label" style="margin-right: 20px;">'+echoCurrency('symbol') + bargaining.gfinalmoney+'</span>开始时间 <span class="label" style="margin-right: 20px;">'+bargaining.pubdate+'</span>结束时间 <span class="label" style="margin-right: 20px;">'+bargaining.enddate+'</span>状态 <span class="label '+(bargaining.state == 1 ? 'label-success' : 'label-danger')+'" style="margin-right: 20px;">'+_state+'</span></td></tr></tbody>');
                }

                //拼团信息
                if(item.huodongtype == 4){
                    list.push('<tbody><tr><td colspan="7">拼团ID <code style="margin-right: 20px;">'+item.pinid+'</code>状态 '+(item.pinstate == 0 ? '<span class="label" style="margin-right: 20px;">待成团</span>' : '<span class="label label-success" style="margin-right: 20px;">已成团</span>')+'身份 '+(item.pintype == 0 ? '<span class="label">成员</span>' : '<span class="label label-info">团长</span>')+'</td></tr></tbody>');
                }

                list.push('</table>');
			}

			obj.find("#table").html(list.join(""));
			$("#loading").hide();
			$("#table").show();
			huoniao.showPageInfo();
            $('#table .orderPrice').popover({'trigger': 'hover', 'html': true, 'container': 'body'});
		}else{

			obj.find("#table").html("");
			huoniao.showTip("warning", val.info, "auto");
			$("#loading").html(val.info).show();
		}
	});

};
