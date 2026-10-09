/**
 * 会员中心商城订单列表
 * by guozi at: 20151130
 */

$(function(){

	//状态切换
	$(".tab ul li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("sel")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			objId.html('');
			getList();
		}
	});

	// 获取url参数

	function getParam(paramName) {
	    paramValue = "", isFound = !1;
	    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
	        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
	        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
	    }
	    return paramValue == "" && (paramValue = null), paramValue
	}
	if(getParam('state')){
		$(".tab ul li[data-id='"+getParam('state')+"']").click()
	}
	// 下拉加载
	$(window).scroll(function() {
		var h = $('.myitem').height();
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w - h;
		if ($(window).scrollTop() > scroll && !isload) {
			atpage++;
			getList();
		};
	});

	//收货
	objId.delegate(".sh", "click", function(){
		var t = $(this), par = t.closest(".myitem"), id = par.attr("data-id");
		if(id){
			if(confirm(langData['siteConfig'][20][188])){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=awardlegou&action=receipt&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							t.removeClass("load").html(langData['siteConfig'][6][108]);
							setTimeout(function(){objId.html('');getList();}, 1000);

						}else{
							alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						alert(langData['siteConfig'][20][183]);
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			};
		}
	});

});


// $("body").delegate('.btn-pay',"click",function () {
// 	var t = $(this),myitem = t.closest('.myitem');
// 	var pinid = t.attr('data-pinid');
// 	var title = myitem.find('.txtbox-c p').text();
// 	var imgurl = myitem.find('.imgbox-l img').attr('src');
// 	var id = myitem.attr('data-goodid')
// 	var userShareId = $.cookie((window.cookiePre ? window.cookiePre : 'HN_') + 'userid');
// 	var link = masterDomain +'/awardlegou/detail-'+id+'.html?pinid='+pinid+(userShareId?("&fromShare="+userShareId):"");
// 	wxconfig.imgUrl  = imgurl;
// 	wxconfig.title  = title;
// 	wxconfig.link  = link;
// 	$('.HN_button_link').attr('data-clipboard-text',wxconfig.link)
// 	$(".HN_PublicShare").click();
// 	return false;

// })
function getList(is){

  isload = true;

	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=awardlegou&action=orderList&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [], durl = $(".tab ul").data("url"), rUrl = $(".tab ul").data("refund"), cUrl = $(".tab ul").data("comment");
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
						case "9,9":
							totalCount = pageInfo.closed;
							break;
						case "10":
							totalCount = pageInfo.shouhou;
							break;
					}

					var msg = totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];
					//拼接列表
					if(list.length > 0){
						$('.no-data').hide();
						for(var i = 0; i < list.length; i++){
							var item       = [],
								id = list[i].id,
								ordernum = list[i].ordernum,
								orderstate = list[i].orderstate,
								retState = list[i].retState,
								orderdate = huoniao.transTimes(list[i].orderdate, 1),
								expDate = list[i].expDate,
								payurl = list[i].payurl,
								common = list[i].common,
								commonUrl = list[i].commonUrl,
								paytype = list[i].paytype,
								paytypeold = list[i].paytypeold,
								totalPayPrice = list[i].totalPayPrice,
								shopname = list[i].shopname,
								product = list[i].product,
								havenumber = list[i].havenumber,
								paytuikuanlogtic = list[i].is_paytuikuanlogtic,
								retExpnumber = list[i].retExpnumber,
								retExpcompany = list[i].retExpcompany,
								pinid = list[i].pinid;
							var detailUrl = durl.replace("%id%", id);
							var refundlUrl = rUrl.replace("%id%", id);
							var commentUrl = cUrl.replace("%id%", id);
							var stateInfo = btn = "";

							switch(orderstate){
								case "0":
									stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][22]+'</span></p>';  //未付款    //取消订单
									btn = '<a href="javascript:;" class="btn-cancel btn-nobg del">'+langData['siteConfig'][6][65]+'</a><a href="javascript:;" class="popPay btn-bg " data-ordernum = '+ordernum+'>'+langData['siteConfig'][6][64]+'</a>';  //立即付款
									break;
								case "1":
									stateInfo = '<p class="order-state"><span>还需邀请'+havenumber+'人</span></p>';  //代发货

									btn = '<a href="'+detailUrl+'" class="btn-pay btn-bg" data-pinid="'+pinid+'">'+langData['siteConfig'][55][30]+'</a>';  //邀请好友参与

									break;
								case "3":
									stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][37]+'</span></p>';  //交易成功
									break;
								case "4":
									stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][27]+'</span></p>';   //退款中
									btn = '<a href="#" class="btn-pay btn-bg">'+langData['siteConfig'][45][28]+'</a>'  //退款进度
									break;
								case "5":
									if(retState == 1){//申请退款中
										stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][55][28]+'</span></p>';   //退款中，待商家处理
									}else{
										stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][25]+'</span></p>';  //待发货
										btn = '<a href="'+detailUrl+'" class=" btn-bg">'+langData['siteConfig'][55][29]+'</a>';  //查看活动结果
									}

									break;
								case "6":
									if(retState == 1){//申请退款中
										stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][55][28]+'</span></p>';   //退款中，待商家处理
									}else{
										stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][58]+'</span></p>';   //已发货
										btn = '<a href="JavaScript:;" class="btn-nobg sh">'+langData['siteConfig'][6][45]+'</a><a href="'+detailUrl+'" class=" btn-bg">'+langData['siteConfig'][55][29]+'</a>';  //确认收货--查看活动结果
									}
									break;
								case "7":
									stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][34]+'</span></p>';  //退款成功
										btn = '<a href="'+detailUrl+'" class=" btn-bg">'+langData['siteConfig'][55][29]+'</a>';  //查看活动结果
									break;
								case "9":// 已发货--商家已同意退货
									if(paytuikuanlogtic == 1){//
										if(retExpnumber !='' && retExpcompany !=''){
											stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][55][31]+'</span></p>';   //已退货，待商家处理
										}else{
											stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][55][32]+'</span></p>';   //待上门取件退货
										}
									}else{
										stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][55][33]+'</span></p>';   //待退货--没有支付运费
									}
									break;
							}


							html.push('<dl class="myitem" data-id="'+id+'" data-goodid="'+list[i].foodid+'">');
							html.push('<dt><p class="shop_name"><i></i><span>'+shopname+'</span></p>'+stateInfo+'</dt>')
							html.push('<dd class="order-content">');
							var totalCount = 0;
							html.push('<a href="'+detailUrl+'"><div class="fn-clear">');
							html.push('<div class="imgbox-l"><img src="'+list[i].litpicpath+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"/></div>');
							html.push('<div class="txtbox-c"><p>'+list[i].title+'</p></div>');
							html.push('<div class="pricebox-r"><p class="price"><span>'+(echoCurrency('symbol'))+'</span>'+list[i].price+'</p><p class="mprice">x'+list[i].procount+'</p></div>');
							html.push('</div></a>');
							html.push('<div class="shop_price"><p class="pprice"><span>'+langData['siteConfig'][19][689].replace('1',(list[i].procount))+langData['siteConfig'][21][20]+'   ￥</span>'+totalPayPrice+'</p></div>');//共1件商品 -- 合计
							html.push('<div class="btn-group" data-action="awardlegou">'+btn+'</div>');
							html.push('</dd>');
							html.push('</dl>');

						}

						objId.append(html.join(""));
            $('.loading').remove();
            isload = false;

					}else{
						$('.loading').remove();
						if(totalCount==0){
							$('.no-data').show();
						}else{
							objId.append("<p class='loading'>"+msg+"</p>");
						}
					}

					$("#total").html(pageInfo.totalCount);
					$("#unpaid").html(pageInfo.daiyaoqing);
					$("#unused").html(pageInfo.daifahuo);
					$("#recei").html(pageInfo.yifahuo);
					$("#refund").html(pageInfo.closed);
					$("#rates").html(pageInfo.rates);
					$("#recei").html(pageInfo.recei);
					$("#closed").html(pageInfo.closed);
					$("#cancel").html(pageInfo.cancel);
					$("#shouhou").html(pageInfo.shouhou);

				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});

	$('body').delegate(".popPay", "click", function(){

		var ordernum1 = $(this).attr('data-ordernum');
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=awardlegou&action=deal",
			type: 'post',
			data: {'ordernum':ordernum1},
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					sinfo = data.info;
					service   = 'awardlegou';
					$('#ordernum').val(sinfo.ordernum);
					$('#action').val('pay');


					$("#amout").text(sinfo.order_amount);
					$('.payMask').show();
					$('.payPop').css('transform', 'translateY(0)');

					// if (totalBalance * 1 < sinfo.order_amount * 1) {
					//
					// 	$("#moneyinfo").text('余额不足，');
					//
					// 	$('#balance').hide();
					// }
					if (totalBalance * 1 < sinfo.order_amount * 1) {

						$("#moneyinfo").text('余额不足，');
						$("#moneyinfo").closest('.check-item').addClass('disabled_pay')

						$('#balance').hide();
					}


          if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
            $("#bonusinfo").text('额度不足，');
            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
          }else if( bonus * 1 < sinfo.order_amount * 1){
            $("#bonusinfo").text('余额不足，');
            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
          }else{
            $("#bonusinfo").text('');
            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
          }


					ordernum = sinfo.ordernum;
					order_amount = sinfo.order_amount;

					payCutDown('', sinfo.timeout. sinfo);
				}else{
					alert(data.info);
					if(data.info == '积分不足'){
						window.location = pointurl;
					}else if(data.info == '本次乐购活动参与人数已满，您可以自己发起乐购！'){
						window.location = prourl;
					}
					t.removeClass('disabled');
				}
			},
			error: function(){
				alert('网络错误，请重试！');
				t.removeClass('disabled');
			}
		})
	});
}
