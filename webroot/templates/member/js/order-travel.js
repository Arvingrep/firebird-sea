/**
 * 会员中心旅游订单列表
 * by zmy at: 20210422
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

	//删除订单
	objId.delegate(".del_cancel", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][182], function(){ //确定删除订单？删除后本订单将从订单列表消失，且不能恢复。
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: "/include/ajax.php?service=travel&action=delOrder&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							par.remove();
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
	var data = [];
	data.push('state='+state);
	data.push('page='+atpage);
	data.push('pageSize='+pageSize);
	$.ajax({
		url: "/include/ajax.php?service=travel&action=orderList",
		data:data.join('&'),
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$(".main-sub-tab, .oh").hide();
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item       = [],
							    id            = list[i].id,
                                ordernum      = list[i].ordernum,
                                orderstate    = list[i].orderstate,
                                orderdate     = huoniao.transTimes(list[i].orderdate, 1),
                                orderprice    = list[i].orderprice,
                                procount      = list[i].procount,
                                prourl        = list[i].product.url,
                                litpic        = list[i].product.litpic,
                                title         = list[i].product.title,
                                collecttype   = list[i].type,
                                payurl        = list[i].payurl,
                                paytype       = list[i].paytype,
								visatitle     = list[i].title,
								companyname   = list[i].company,


								orderdate  = huoniao.transTimes(list[i].orderdate, 1);
                            if(list[i].product.length == 0){
                                    continue;
                            }
							var urlString = travelEditUrl.replace("%id%", id);
							var stateInfo = btn = "";
                            /**
                             * 0 、待付款
                             * 1、已付款 待使用
                             * 3、交易完成
                             * 订单取消   7
                             * 申请退款   8
                             * 退款成功   9
                             */
							switch(orderstate){
								case "0":
									stateInfo = "<span class='state0'>"+langData['travel'][14][85]+"</span>";//未支付
									btn = '<div><a href="javascript:;" class="edit popPay" data-ordernum="'+ordernum+'">'+langData['siteConfig'][6][64]+'</a></div><div><a href="javascript:;" class="yuyue_cancel">'+langData['siteConfig'][6][65]+'</a></div>';//立即付款  取消订单
									break;
                                case "1":
                                	stateInfo = "<span class='state1'>"+langData['travel'][13][36]+"</span>";//待使用								
										
									btn = '<div><a href="'+urlString+'?rates=1" class="moneyback">'+langData['siteConfig'][6][66]+'</a></div>';//申请退款										
									
									break;
								case "3":
									stateInfo = "<span class='state3'>"+langData['siteConfig'][9][37]+"</span>";//交易成功
									break;

								case "7":
									stateInfo = "<span class='state7'>"+langData['siteConfig'][9][13]+"</span>";//已取消
									btn ='<div><a href="javascript:;" class="del_cancel">'+langData['siteConfig'][6][111]+'</a></div>';//删除订单
									break;
								case "8":
									stateInfo = "<span class='state8'>"+langData['siteConfig'][9][27]+"</span>";//退款中
									btn ='<div><a href="javascript:;" class="refund_cancel">'+langData['siteConfig'][55][48]+'</a></div>';//取消退款
									break;
								case "9":
									stateInfo = "<span class='state9'>"+langData['siteConfig'][10][14]+"</span>";//退款成功
									btn ='<div><a href="javascript:;" class="del_cancel">'+langData['homemaking'][9][54]+'</a></div>';//删除订单
									break;	
							}

							html.push('<table data-id="'+id+'"><colgroup><col style="width:38%;"><col style="width:5%;"><col style="width:12%;"><col style="width:17%;"><col style="width:16%;"><col style="width:12%;"></colgroup>');
							html.push('<thead><tr class="placeh"><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td colspan="5">');
							html.push('<span class="dealtime" title="'+orderdate+'">'+orderdate+'</span>');				
                            var typename = '';
                            if(collecttype =='1'){
                                typename = '景点门票'; /*景点门票*/
                            }else if(collecttype =='2'){
                                typename = '周边游';/*周边游*/
                            }else if(collecttype =='3'){
                                typename = '酒店';/*酒店*/
                            }else if(collecttype =='4'){
                                typename = '签证';/*签证*/
                            }			
							html.push('<span class="number">分类：<a href="javascript:;">'+typename+'</a></span>');
							html.push('<span class="store"><a href="" target="_blank">'+companyname+'</a></span>');
							html.push('</td>');
							html.push('<td colspan="1"></td></tr></thead>');
							html.push('<tbody>');
						

							html.push('<tr class="lt">');
							html.push('<td class="nb"><div class="info productInfo"><a href="'+prourl+'" title="'+title+'" target="_blank" class="pic"><img src="'+huoniao.changeFileSize(litpic, "small")+'" /></a><div class="txt"><a href="'+prourl+'" title="'+title+'" target="_blank"><h2>'+visatitle+'</h2><div class="timeDiv">');
							html.push('<p>'+title+'</p>');
							html.push('<td class="nb"></td>');
							html.push('<td>'+procount+'</td>');
							
							html.push('<td class="bf priceTd" rowspan="1">');
							html.push('<div class="bfmoney">');
							html.push('<strong>'+orderprice+'</strong>');				
							html.push('</div>');
							html.push('<div class="paytype">'+paytype+'</div></td>');
							html.push('<td class="bf" rowspan="1"><div><a href="'+urlString+'" target="_blank">'+stateInfo+'</a></div><div><a href="'+urlString+'" target="_blank">'+langData['siteConfig'][19][313]+'</a></div></td>');//订单详情
							html.push('<td class="bf nb" rowspan="1">'+btn+'</td>');//
							
							html.push('</tr>');
							

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
                            totalCount = pageInfo.state0;
                            break;
                        case "1":
                            totalCount = pageInfo.state1;
                            break;
                        case "2":
                            totalCount = pageInfo.state2;
                            break;
                        case "3":
                            totalCount = pageInfo.state3;
                            break;
                        case "4":
                            totalCount = pageInfo.state4;
                            break;
                        case "5":
                            totalCount = pageInfo.state5;
                            break;
                        case "6":
                            totalCount = pageInfo.state6;
                            break;
                        case "7":
                            totalCount = pageInfo.state7;
                            break;
                        case "8":
                            totalCount = pageInfo.state8;
                            break;
                        case "9":
                            totalCount = pageInfo.state9;
                            break;
                        case "20":
                            totalCount = pageInfo.state20;
                            break;
                    }


					$("#state").html(pageInfo.totalCount);
                    $("#state0").html(pageInfo.state0);
                    $("#state1").html(pageInfo.state1);
                    $("#state3").html(pageInfo.state3);
                    $("#state7").html(pageInfo.state7);
                    $("#state8").html(pageInfo.state8);
                    $("#state9").html(pageInfo.state9);

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
			url: masterDomain+"/include/ajax.php?service=travel&action=pay",
			type: 'post',
			data: {'ordernum':ordernum1,'orderfinal':1},
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
						$("#bonusinfo").text('余额不足，');
						$("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
					}else{
						$("#bonusinfo").text('');
						$("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
					}

					ordernum  = info.ordernum;
					order_amount = info.order_amount;

					$("#ordertype").val('');
					$("#service").val('travel');
					service = 'travel';
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
