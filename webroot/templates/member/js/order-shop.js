/**
 * 会员中心商城订单列表
 * by guozi at: 20151130
 */

var objId = $("#list");
$(function(){

	$(".main-sub-tab li[data-id='"+state+"']").addClass("curr");

	//状态切换
	$(".main-sub-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("sel")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});

	getList(1);

	//删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm('确定取消订单么?确认后将不可恢复！', function(){ //确定删除订单？删除后本订单将从订单列表消失，且不能恢复。
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=shop&action=cancelOrder&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							setTimeout(function(){getList(1);}, 500);

						}else{
							$.dialog.alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});

	//收货
	objId.delegate(".sh", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][188], function(){//确定要收货吗？确定后费用将直接转至卖家账户，请谨慎操作！
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=shop&action=receipt&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							t.removeClass("load").html(langData['siteConfig'][6][108]);//确认成功
							setTimeout(function(){getList(1);}, 1000);

						}else{
							$.dialog.alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});

});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');//加载中，请稍候
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=shop&action=orderList&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$(".main-sub-tab, .oh").hide();
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [], durl = $(".main-sub-tab").data("url"), rUrl = $(".main-sub-tab").data("refund"), cUrl = $(".main-sub-tab").data("comment");

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item       = [],
									id         = list[i].id,
									ordernum   = list[i].ordernum,
									orderstate = list[i].orderstate,
									retState   = list[i].retState,
									orderdate  = huoniao.transTimes(list[i].orderdate, 1),
									expDate    = list[i].expDate,
									payurl     = list[i].payurl,
									common     = list[i].common,
									commonUrl  = list[i].commonUrl,
									paytype    = list[i].paytype,
									paytypeold = list[i].paytypeold,
									totalPayPrice  = list[i].totalPayPrice,
									peisongid  = list[i].peisongid,
									store      = list[i].branch ? list[i].branch : list[i].store,
									shipping   = list[i].shipping,
									songdate   = list[i].songdate,
									product    = list[i].product,
									is_tuikuan = product[0].is_tuikuan,
									protype    = list[i].protype,
									shopquan   = list[i].shopquan,
									expDate    = list[i].expDate,
									expireddate    = list[i].expireddate.replaceAll('.','-');

							var detailUrl = durl.replace("%id%", id);
							var refundlUrl = rUrl.replace("%id%", id);
							var commentUrl = cUrl.replace("%id%", id);
							var stateInfo = btn = "";

							switch(orderstate){
								case "0":
									stateInfo = "<span class='state0'>"+langData['siteConfig'][9][22]+"</span>";//未付款
										btn = '<div><a href="javascript:;" class="edit popPay" data-ordernum="'+ordernum+'">'+langData['siteConfig'][6][64]+'</a></div><div><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][65]+'</a></div>';//立即付款  取消订单
									break;
                                case "1":
                                	stateInfo = "<span class='state1'>"+langData['siteConfig'][9][25]+"</span>";//待发货
                                	btn = '<div><a href="'+refundlUrl+'" target="_blank">'+langData['siteConfig'][6][66]+'</a></div>';//申请退款
                                	if(protype ==1 ){//电子券
										var nowDateArr = (new Date()).getTime();
										var expDateArr = (new Date(expireddate)).getTime();
										if(shopquan!=0){
											if(expDateArr >nowDateArr){
												stateInfo = "<span class='state1'>"+langData['siteConfig'][57][27]+"</span>";//待使用
												btn = '<div><a href="'+detailUrl+'" target="_blank">查看券码</a></div>';//查看券码
											}else{//已过期
												stateInfo = "<span class='state1'>已过期</span>";//已过期
												btn = '<div><a href="'+refundlUrl+'" target="_blank">申请退款</a></div>';//申请退款
											}
										}else{
											stateInfo = "<span class='state1'>"+langData['siteConfig'][19][706]+"</span>";//已使用
											btn = '<div><a href="'+detailUrl+'" target="_blank">查看详情</a></div>';//查看详情
										}
									}else if(list[i].paytypeold == 'delivery'){
										btn = '<div><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][65]+'</a></div><div><a href="javascript:;" class="sh">确认收货</a></div>';//申请退款
									}

									if(list[i].pinid!=0 &&list[i].pinstate==0){
										stateInfo = "<span class='state1'>拼团中</span>";
									}

									break;
								case "3":
									stateInfo = "<span class='state3'>"+langData['siteConfig'][9][37]+"</span>";//交易成功
									if(common == 1){
										btn = '<div><a href="'+commentUrl+'">'+langData['siteConfig'][8][2]+'</a></div>';  //修改评价
									}else{
										btn = '<div><a href="'+commentUrl+'">'+langData['siteConfig'][19][365]+'</a></div>';  //评价
									}
									break;
								case "4":
									stateInfo = "<span class='state4'>"+langData['siteConfig'][9][27]+"</span>";//退款中
									break;
								case "6":

									//申请退款
									if(retState == 1){

										//还未确认
										if(expDate == 0){
											stateInfo = "<span class='state61'>"+langData['siteConfig'][38][92]+"</span>";//未确认，申请退款中

										//已经确认
										}else{
											stateInfo = "<span class='state61'>"+langData['siteConfig'][38][93]+"</span>";//已确认，申请退款中
										}
										// btn = '<a href="'+detailUrl+'" class="tk">确认退款</a>';

									//未申请退款
									}else{
                                        if(shipping == 1 || shipping == 2){
											stateInfo = "<span class='state6'>"+langData['siteConfig'][9][26]+"</span>";  //待收货
                                            btn = '<a href="javascript:;" class="sh">确认收货</a>';
										}else{
                                            if(expDate == 0){
                                                stateInfo = "<span class='state1'>"+langData['siteConfig'][9][25]+"</span>";//待发货
                                                btn = '<div><a href="'+refundlUrl+'" target="_blank">'+langData['siteConfig'][6][66]+'</a></div>';//申请退款
                                            }
                                        }
										// else{
										// 	if(peisongid == 0){
										// 		stateInfo = "<span class='state6'>"+langData['siteConfig'][44][13]+"</span>";//待分配骑手
										// 	}else{
										// 		if(songdate == 0){
										// 			stateInfo = "<span class='state6'>"+langData['siteConfig'][44][14]+"</span>";//待取货
										// 		}else{
										// 			stateInfo = "<span class='state6'>"+langData['siteConfig'][16][115]+"</span>";//配送中
										// 		}
										// 	}
										// }

										//btn = '<a href="javascript:;" class="sh">确认收货</a>';
									}
									break;
								case "7":
									stateInfo = "<span class='state7'>"+langData['siteConfig'][9][34]+"</span>";//退款成功
									if(protype ==1 ){//电子券
										stateInfo = "<span class='state7'>交易关闭</span>";//交易关闭
									}
									// btn = '<a href="javascript:;" class="edit">退款去向</a>';
									break;
								case "10":
									stateInfo = "<span class='state10'>"+langData['siteConfig'][6][15]+"</span>";	//关闭
									break;
							}

							html.push('<table data-id="'+id+'"><colgroup><col style="width:38%;"><col style="width:10%;"><col style="width:7%;"><col style="width:17%;"><col style="width:16%;"><col style="width:12%;"></colgroup>');
							html.push('<thead><tr class="placeh"><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td colspan="5">');
							html.push('<span class="dealtime" title="'+orderdate+'">'+orderdate+'</span>');
							html.push('<span class="number">'+langData['siteConfig'][19][308]+'：<a target="_blank" href="'+detailUrl+'">'+ordernum+'</a></span>');//订单号
							var storeHtml = store.id == 0 ? langData['siteConfig'][19][709] : '<a href="'+store.domain+'" target="_blank">'+store.title+'</a>';
							//官方直营---QQ在线交谈
							html.push('<span class="store">'+storeHtml+'</span>');
							html.push('</td>');
							html.push('<td colspan="1"></td></tr></thead>');
							html.push('<tbody>');

							for(var p = 0; p < product.length; p++){
								var protxt = product[p].specation.replace("$$$", " ");
								if(protype ==1 && orderstate !=10){//电子券
									protxt = '有效期至：'+list[i].expireddate;
									if(list[i].orderstate == 7){
										protxt +="<em class='tktxt'>退款成功</em>"
									}
								}
								cla = p == product.length - 1 ? ' class="lt"' : "";
								html.push('<tr'+cla+'>');
								html.push('<td class="nb"><div class="info"><a href="'+product[p].url+'" title="'+product[p].title+'" target="_blank" class="pic"><img src="'+product[p].litpic+'" onerror="this.src=\'/static/images/good_default.png\'" /></a><div class="txt"><a href="'+product[p].url+'" title="'+product[p].title+'" target="_blank">'+product[p].title+'</a><p>'+protxt+'</p></div></div></td>');
								html.push('<td class="nb">'+product[p].price+'</td>');
								html.push('<td>'+product[p].count+'</td>');

								if(p == 0){
									html.push('<td class="bf" rowspan="'+product.length+'"><strong>'+totalPayPrice+'</strong>'+(paytype ? '<div class="paytype">'+paytype+'</div>' : '')+'</td>');
									html.push('<td class="bf" rowspan="'+product.length+'"><div><a href="'+detailUrl+'" target="_blank">'+stateInfo+'</a></div><a href="'+detailUrl+'" target="_blank">'+langData['siteConfig'][19][313]+'</a></td>');//订单详情
									html.push('<td class="bf nb" rowspan="'+product.length+'">'+btn+'</td>');
								}
								html.push('</tr>');
							}

							html.push('</tbody>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
					}

					switch(state){
						case "":
							totalCount = pageInfo.totalCount;
							break;
						case "0":
							totalCount = pageInfo.unpaid;
							break;
						case "1":
							totalCount = pageInfo.ongoing;
							break;
						case "3":
							totalCount = pageInfo.success;
							break;
						case "4":
							totalCount = pageInfo.refunded;
							break;
						case "5":
							totalCount = pageInfo.rates;
							break;
						case "6":
							totalCount = pageInfo.recei;
							break;
						case "7":
							totalCount = pageInfo.closed;
							break;
						case "10":
							totalCount = pageInfo.cancel;
							break;
						case "6,3":
							totalCount = pageInfo.tobeuse;
							break;
						case "6,4":
							totalCount = pageInfo.tofenx;
							break;
						case "4,7":
							totalCount = pageInfo.refunded;
							break;
						case "6,5":
							totalCount = pageInfo.tobeguoqi;
							break;
					}


					$("#total").html(pageInfo.totalCount);

					if(pageInfo.unpaid == 0){
						//$("#unpaid").parent().parent().hide();
					}else{
						$("#unpaid").parent().parent().show();
						$("#unpaid").html(pageInfo.unpaid);
					}

					if(pageInfo.ongoing == 0){
						//$("#unused").parent().parent().hide();
					}else{
						$("#unused").parent().parent().show();
						$("#unused").html(pageInfo.ongoing);
					}

					if(pageInfo.success == 0){
						//$("#used").parent().parent().hide();
					}else{
						$("#used").parent().parent().show();
						$("#used").html(pageInfo.success);
					}

					if(pageInfo.refunded == 0){
						//$("#refund").parent().parent().hide();
					}else{
						$("#refund").parent().parent().show();
						$("#refund").html(pageInfo.refunded);
					}

					if(pageInfo.rates == 0){
						//$("#rates").parent().parent().hide();
					}else{
						$("#rates").parent().parent().show();
						$("#rates").html(pageInfo.rates);
					}

					if(pageInfo.recei == 0){
						//$("#recei").parent().parent().hide();
					}else{
						$("#recei").parent().parent().show();
						$("#recei").html(pageInfo.recei);
					}

					if(pageInfo.closed == 0){
						//$("#closed").parent().parent().hide();
					}else{
						$("#closed").parent().parent().show();
						$("#closed").html(pageInfo.refunded);
					}

					if(pageInfo.cancel == 0){
						//$("#cancel").parent().parent().hide();
					}else{
						$("#cancel").parent().parent().show();
						$("#cancel").html(pageInfo.cancel);
					}

					if(pageInfo.tobefenx == 0){//待分享
						//$("#waitshare").parent().parent().hide();
					}else{
						$("#waitshare").parent().parent().show();
						$("#waitshare").html(pageInfo.tobefenx);
					}
					if(pageInfo.tobeuse == 0){//待使用
						//$("#waituse").parent().parent().hide();
					}else{
						$("#waituse").parent().parent().show();
						$("#waituse").html(pageInfo.tobeuse);
					}

					if(pageInfo.tobeguoqi == 0){//已过期
						//$("#overuse").parent().parent().hide();
					}else{
						$("#overuse").parent().parent().show();
						$("#overuse").html(pageInfo.tobeguoqi);
					}

					showPageInfo();
				}
			}else{
				$(".main-sub-tab, .oh").hide();
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
			}
		}
	});

	$('body').delegate(".popPay", "click", function(){

		var ordernum1 = $(this).attr('data-ordernum');

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=shop&action=pay",
			type: 'post',
			data: {'ordernum':ordernum1,'final':0},
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){

					info = data.info;
					cutDown = setInterval(function () {
						$(".payCutDown").html(payCutDown(info.timeout));
					}, 1000)

					var datainfo = [];
					for (var k in info) {
						datainfo.push(k + '=' + info[k]);
					}
					$("#amout").text(info.order_amount);
					$('.payMask').show();
					$('.payPop').show();

					if (usermoney * 1 < info.order_amount * 1) {

						$("#moneyinfo").text('余额不足，');
						$("#moneyinfo").closest('.pay_item').addClass('disabled_pay')
					}else{
						$("#moneyinfo").text('可用');
						$("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
					}

					if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
						$("#bonusinfo").text('额度不足，可用');
						$("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
					}else if( bonus * 1 < info.order_amount * 1){
						$("#bonusinfo").text('余额不足，可用');
						$("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
					}else{
						$("#bonusinfo").text('可用');
						$("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
					}

					ordernum  = info.ordernum;
					order_amount = info.order_amount;

					$("#ordertype").val('');
					$("#service").val('shop');
					service = 'shop';
					var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
					$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
				}
			},
			error: function(){
				alert('网络错误，请重试！');
				t.removeClass('disabled');
			}
		})
	});
}
