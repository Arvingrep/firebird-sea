/**
 * 会员中心团购订单列表
 * by guozi at: 20150903
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

	//发布房源子级菜单
	$(".main-tab .add").hover(function(){
		var t = $(this), dl = t.find("dl");
		if(dl.size() > 0){
			dl.show();
		};
	}, function(){
		var t = $(this), dl = t.find("dl");
		if(dl.size() > 0){
			dl.hide();
		};
	});

	getList(1);

	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][182], function(){//确定删除订单？删除后本订单将从订单列表消失，且不能恢复。
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=education&action=delOrder&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();
								setTimeout(function(){getList(1);}, 200);
							});

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
		url: masterDomain+"/include/ajax.php?service=education&action=orderList&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$('.main-sub-tab').hide();
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [], durl = $(".main-sub-tab").data("url");

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item       = [],
									id         = list[i].id,
									ordernum   = list[i].ordernum,
									proid      = list[i].proid,
									procount   = list[i].procount,
									orderprice = list[i].orderprice,
									orderstate = list[i].orderstate,
									paydate    = list[i].paydate,
									retState   = list[i].retState,
									expDate    = list[i].expDate,
									orderdate  = huoniao.transTimes(list[i].orderdate, 1),
									title      = list[i].product.title,
									enddate    = huoniao.transTimes(list[i].product.enddate, 2),
									litpic     = list[i].product.litpic,
									url        = list[i].product.url,
									payurl     = list[i].payurl,
									common     = list[i].common,
									commonUrl  = list[i].commonUrl;

							var stateInfo = btn = "";
							
							switch(orderstate){
                                    case "0":
                                        stateInfo = langData['homemaking'][4][1];//待付款
                                        btn = '<a href="javascript:;" class="cancel_order del publicpaybtn">'+langData['travel'][13][38]+'</a><a href="javascript:;" class="pay_order sure popPay" data-ordernum="'+ordernum+'">'+langData['travel'][13][37]+'</a>';
                                        //取消订单 付款
                                        urlString = 'javascript:;';
                                        break;
                                    case "1":
                                        stateInfo = langData['education'][7][46];//待联系
                                        break;
                                    case "3":
                                        stateInfo = langData['travel'][13][62];//交易完成
                                        btn = '<a href="javascript:;" class="cancel_order del">'+langData['homemaking'][9][54]+'</a>';//删除订单
                                        break;
                                    case "7":
                                        stateInfo = langData['homemaking'][9][53]; //已取消
                                        btn = '<a href="javascript:;" class="cancel_order del">'+langData['homemaking'][9][54]+'</a>';//删除订单
                                        break;
                                    case "8":
                                        stateInfo = langData['homemaking'][9][71]; //退款中
                                        break;
                                    case "9":
                                        stateInfo = langData['homemaking'][10][14]; //退款成功
                                        btn = '<a href="javascript:;" class="cancel_order del">'+langData['homemaking'][9][54]+'</a>';//删除订单
                                        break;
                                }

							var detailUrl = durl.replace("%id%", id);

							html.push('<div class="item fn-clear" data-id="'+id+'">');
							html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img src="'+litpic+'"></a></div>');
							html.push('<div class="o">'+btn+'</div>');
							html.push('<div class="i">');
							html.push('<p>'+langData['siteConfig'][19][308]+'：'+ordernum+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][309]+'：'+orderdate+'</p>');//订单号---下单时间
							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');
							html.push('<p>'+langData['siteConfig'][19][312]+'：'+orderprice+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][307]+'：'+stateInfo+'&nbsp;&nbsp;·&nbsp;&nbsp;<a href="'+detailUrl+'" target="_blank">'+langData['siteConfig'][19][313]+'</a></p>');
							//总价--状态--订单详情
							html.push('</div></div>');

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
						case "2":
							totalCount = pageInfo.expired;
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
					}


					$("#total").html(pageInfo.totalCount);

					if(pageInfo.state0 == 0){
						$("#unpaid").parent().parent().hide();
					}else{
						$("#unpaid").parent().parent().show();
						$("#unpaid").html(pageInfo.state0);
					}

					if(pageInfo.state1 == 0){
						$("#unused").parent().parent().hide();
					}else{
						$("#unused").parent().parent().show();
						$("#unused").html(pageInfo.state1);
					}
					
					if(pageInfo.state3 == 0){
						$("#used").parent().parent().hide();
					}else{
						$("#used").parent().parent().show();
						$("#used").html(pageInfo.state3);
					}
				

					showPageInfo();
				}
			}else{
				$('.main-sub-tab').hide();
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
			}
		}
	});

	$('body').delegate(".popPay", "click", function(){

		var ordernum1 = $(this).attr('data-ordernum');

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=education&action=pay",
			type: 'post',
			data: {'ordernum':ordernum1,'orderfinal':1},
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					if (typeof (data.info) == 'object') {
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
						$("#service").val('education');
						service = 'education';
						var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
						$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
					}else {
						if (device.indexOf('huoniao_Android') > -1) {
							setupWebViewJavascriptBridge(function (bridge) {
								bridge.callHandler('pageClose', {}, function (responseData) {
								});
							});
							location.href = data.info;
						} else {
							location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
						}
					}
				}
			},
			error: function(){
				alert('网络错误，请重试！');
				t.removeClass('disabled');
			}
		})
	});
}
