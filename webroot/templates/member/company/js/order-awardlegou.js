/**
 * 会员中心商城订单
 * by guozi at: 20150928
 */

var objId = $("#list");
$(function(){

	state = state == "" ? 1 : state;
	$(".nav-tabs li[data-id='"+state+"']").addClass("active");

	$(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("active") && !t.hasClass("add")){
			state = id;
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
			getList();
		}
	});

	getList(1);

	//确认订单
	// $("#list").delegate(".confirm", "click", function(){
	// 	var t = $(this), table = t.closest("table"), id = table.attr("data-id");
	// 	$.ajax({
	// 		url: masterDomain+"/include/ajax.php?service=shop&action=orderConfirm&id="+id,
	// 		type: "GET",
	// 		dataType: "jsonp",
	// 		success: function (data) {
	// 			$.dialog({
	// 				title: '提示消息',
	// 				icon: 'success.png',
	// 				content: '操作成功',
	// 				ok: function(){
	// 					getList(1);
	// 				}
	// 			});
	// 		},
	// 		error: function(){
	// 			alert('网络错误，操作失败！');
	// 		}
	// 	});
	// });


	//打印订单
	$("#list").delegate(".print", "click", function(){
		var t = $(this), table = t.closest("table"), id = table.attr("data-id");
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=shop&action=orderPrint&id="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				$.dialog({
					title: langData['siteConfig'][19][287],//提示消息
					icon: 'success.png',
					content: langData['siteConfig'][44][15],//打印成功
					ok: function(){
						getList(1);
					}
				});
			},
			error: function(){
				alert(langData['siteConfig'][45][81]);//网络错误，打印失败！
			}
		});
	});

	//关闭弹窗
	$(".legouComWrap .closeAlert,.agreelegouMask,.legouComWrap .cancelTui").click(function(e){
    	$('.legouComWrap').css('display','none');
    	$('.agreelegouMask').hide();

    })
	//同意退货
	objId.delegate(".agreeTh", "click", function(){
		$('.agreehuoWrap').css('display','flex');
    	$('.agreelegouMask').show();
    	var pdid = $(this).closest("table").attr('data-id');
    	$('.agreehuoWrap .sureTuihuo').attr('data-id',pdid);
	});
	//同意退货--同意
	$('.agreehuoWrap .sureTuihuo').click(function () {
        var t = $(this), id = t.attr("data-id");
        if(t.hasClass('disabled')) return false;

        if(id){
        	t.addClass('disabled');
            var data = [];
            data.push('id='+id);
            $.ajax({
                url: '/include/ajax.php?service=awardlegou&action=awardlegouAgree',
                data: data.join("&"),
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        $(".legouComWrap .closeAlert").click();                       
                        setTimeout(function(){getList(1);}, 1000);
                    }else{
                        $.dialog.alert(data.info);
                        t.removeClass('disabled');
                    }
                },
                error: function(){
                    $.dialog.alert(langData['siteConfig'][6][203]);
                    t.removeClass('disabled');
                }
            });
        }
        
    })

	//同意退款
	objId.delegate(".agreeTk", "click", function(){
		$('.agreekuanWrap').css('display','flex');
    	$('.agreelegouMask').show();
    	var pdid = $(this).closest("table").attr('data-id');
    	$('.agreekuanWrap .sureTuikuan').attr('data-id',pdid);
	});	

	//同意退货--同意
	$('.agreekuanWrap .sureTuikuan').click(function () {
        var t = $(this), id = t.attr("data-id");
        if(t.hasClass('disabled')) return false;

        if(id){
        	t.addClass('disabled');
            var data = [];
            data.push('id='+id);
            $.ajax({
                url: '/include/ajax.php?service=awardlegou&action=refundPay',
                data: data.join("&"),
                type: 'post',
                dataType: 'json',
                success: function(data){
                    if(data && data.state == 100){
                        $(".legouComWrap .closeAlert").click();                       
                        setTimeout(function(){getList(1);}, 1000);
                    }else{
                        $.dialog.alert(data.info);
                        t.removeClass('disabled');
                    }
                },
                error: function(){
                    $.dialog.alert(langData['siteConfig'][6][203]);
                    t.removeClass('disabled');
                }
            });
        }
        
    })
	

});


function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();
	state = state =='' || state ==1 ? 5 : state ;
	$.ajax({
		url: masterDomain+"/include/ajax.php?service=awardlegou&action=orderList&store=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item       = [],
								id         = list[i].id,
								foodid     = list[i].foodid,
								ordernum   = list[i].ordernum,
								orderstate = list[i].orderstate,
								retState   = list[i].retState,
								orderdate  = list[i].orderdate,
								expDate    = list[i].expDate,
								payurl     = list[i].payurl,
								common     = list[i].common,
								commonUrl  = list[i].commonUrl,
								paytype    = list[i].paytype,
								totalPayPrice  = list[i].totalPayPrice,
								peisongid  = list[i].peisongid,
								songdate   = list[i].songdate,
								shipping   = list[i].shipping,
								member     = list[i].member,
								retExpnumber     = list[i].retExpnumber,
								retExpcompany     = list[i].retExpcompany,
								product    = list[i].product;

							var detailUrl = editUrl.replace("%id%", id);
							var goodDetailUrl = goodDetail.replace("%id%", foodid);
							var fhUrl = detailUrl.indexOf("?") > -1 ? detailUrl + "&rates=1" : detailUrl + "?rates=1";
							var stateInfo = btn = "";

							switch(orderstate){
								case "1":
									if(shipping==1){
										stateInfo = "<span class='state1'>"+langData['siteConfig'][9][25]+"</span>";
										btn = '<div><a href="'+fhUrl+'">'+langData['siteConfig'][6][154]+'</a></div>';
									}else{
										stateInfo = "<span class='state1'>"+langData['siteConfig'][9][11]+"</span>";//待确认
										// btn = '<div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//打印订单
									}
									break;
								case "3":
									stateInfo = "<span class='state3'>"+langData['siteConfig'][9][37]+"</span>";//交易成功
									break;
								case "4":
									stateInfo = "<span class='state4'>"+langData['siteConfig'][9][27]+"</span>";//退款中
									break;
								case "5":									
									//申请退款
									if(retState == 1){
										stateInfo = "<span class='state5'>"+langData['siteConfig'][9][55]+"</span>";//未发货，买家申请退款
										btn = '<a href="javascript:;" class="agreeTk">'+langData['siteConfig'][55][35]+'</a>';//同意退款

									}else{
										stateInfo = "<span class='state5'>"+langData['siteConfig'][9][25]+"</span>";//待发货

									}									
									break;
								case "6":

									//申请退款
									if(retState == 1){

										//还未确认
										if(expDate != 0){
											stateInfo = "<span class='state61'>"+langData['siteConfig'][55][36]+"</span>";//买家申请退货退款
											btn = '<a href="javascript:;" class="agreeTh">'+langData['siteConfig'][55][37]+'</a>';//同意退货
										}										

									//未申请退款
									}else{
										if(shipping == 1 || shipping == 2){
											var shippingName = shipping == 1 ? langData['siteConfig'][9][71] : langData['siteConfig'][9][70];//快递 -- 商家自送
											stateInfo = "<span class='state6'>"+langData['siteConfig'][9][26]+"("+shippingName+")</span>";  //待收货
											btn = '<div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//打印订单
										}else{
											if(peisongid == 0){
												stateInfo = "<span class='state6'>"+langData['siteConfig'][44][13]+"</span>";//待分配骑手
												btn = '<div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//打印订单
											}else{
												if(songdate == 0){
													stateInfo = "<span class='state6'>"+langData['siteConfig'][44][14]+"</span>";//待取货
													btn = '<div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//打印订单
												}else{
													stateInfo = "<span class='state6'>"+langData['siteConfig'][16][115]+"</span>";//配送中
													btn = '<div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//打印订单
												}
											}
										}

										//btn = '<a href="javascript:;" class="sh">确认收货</a>';
									}
									break;

								case "7":
									stateInfo = "<span class='state7'>"+langData['siteConfig'][9][34]+"</span>";//退款成功
									// btn = '<a href="javascript:;" class="edit">退款去向</a>';
									break;
									//商家已同意退货
								case "9":
									if(retExpnumber == '' || retExpcompany == ''){
										stateInfo = "<span class='state9'>"+langData['siteConfig'][55][38]+"</span>";//等待买家退货

									}else{
										stateInfo = "<span class='state9'>"+langData['siteConfig'][55][39]+"</span>";//买家已退货，待退款
										btn = '<a href="javascript:;" class="agreeTk">'+langData['siteConfig'][55][35]+'</a>';//同意退款
									}
									break;	
							}

							html.push('<table data-id="'+id+'"><colgroup><col style="width:33%;"><col style="width:16%;"><col style="width:17%;"><col style="width:22%;"><col style="width:12%;"></colgroup>');
							html.push('<thead><tr class="placeh"><td></td><td></td><td></td><td></td><td></td></tr><tr><td colspan="3">');
							html.push('<span class="dealtime" title="'+orderdate+'">'+orderdate+'</span>');
							html.push('<span class="number">'+langData['siteConfig'][19][308]+'：<a href="'+detailUrl+'">'+ordernum+'</a></span>');
							var memberHtml = list[i].branch ? langData['siteConfig'][45][82]+'：' + list[i].branch.title + ' ' + list[i].branch.tel : '';//分店
							html.push('<span class="store">'+memberHtml+'</span>');
							html.push('</td>');
							html.push('<td colspan="2"></td></tr></thead>');
							html.push('<tbody>');
								html.push('<tr>');
								html.push('<td class="nb"><div class="info"><a href="/include/qrcode.php?data='+goodDetailUrl+'" title="'+list[i].title+'" target="_blank" class="pic"><img src="'+huoniao.changeFileSize(list[i].litpicpath, "small")+'" /></a><div class="txt"><a href="/include/qrcode.php?data='+goodDetailUrl+'" title="'+list[i].title+'" target="_blank">'+list[i].title+'</a></div></div></td>');

								html.push('<td >'+list[i].price+'</td>');

								var pointstr = '';
								if(list[i].point * 1 != 0){
									pointstr = '(包含'+list[i].point+' 积分)';
								}
			
								html.push('<td class="bf" rowspan="1"><strong>'+totalPayPrice+pointstr+'</strong>'+(paytype ? '<div class="paytype">'+paytype+'</div>' : '')+'</td>');
								html.push('<td class="bf spebf" rowspan="1"><div><a href="'+detailUrl+'">'+stateInfo+'</a></div><a href="'+detailUrl+'">'+langData['siteConfig'][19][313]+'</a></td>');
								html.push('<td class="bf opera">'+btn+'</td>');
								html.push('</tr>');

							html.push('</tbody>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					$("#daifahuo").html(pageInfo.daifahuo);
					$("#yifahuo").html(pageInfo.yifahuo);
					$("#success").html(pageInfo.success);
					$("#tuikuan").html(pageInfo.tuikuan);
					$("#ytuikuan").html(pageInfo.ytuikuan);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
