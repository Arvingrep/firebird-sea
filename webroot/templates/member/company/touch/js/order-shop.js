/**
 * 会员中心商城订单列表
 * by guozi at: 20151130
 */

var objId = $("#list");
$(function(){

	$('#list').addClass('noTop');

	//状态切换
	$(".tab ul li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");

		if(id != '4,7' && !t.hasClass("curr") && !t.hasClass("sel")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
      		objId.html('');
			getList();
			if(t.hasClass("all")){//全部
				$('.allChoose').css('display','flex');
				$('.peisChoose').css('display','none');
				$('#list').addClass('noTop');
			}else if(t.hasClass("psing")){//配送中
				$('.allChoose').css('display','none');
				$('.peisChoose').css('display','flex');
				$('#list').removeClass('noTop');
			}else{
				$('.allChoose').css('display','none');
				$('.peisChoose').css('display','none');
				$('#list').addClass('noTop');
			}
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
	}else{
		getList(1);
	}

	//拍下时间--付款时间--发货时间
	
	$('.allChoose li').click(function(){
		var t = $(this);
		var sclick = t.attr('data-click');
		if(!t.hasClass('curr')){
			t.addClass('curr').siblings("li").removeClass();
			t.siblings("li").attr('data-click',0);
			t.addClass('up').removeClass('down').attr('data-id',1);
		}else{
			if(t.hasClass('down')){
                t.removeClass('down').addClass('up');
                t.attr("data-id",2);
            }else{
                t.removeClass('up').addClass('down')
                t.attr("data-id",1);
            }
		}
		if(sclick == 2){
			t.removeClass().attr('data-id',0);
			sclick = -1;
		}
		sclick++;
		t.attr('data-click',sclick);
		atpage = 1;
		objId.html('');
		getList();
	})

	//配送类型 -- 全部/快递/商家/平台
	$('.peisChoose li').click(function(){
		var t = $(this);
		if(!t.hasClass('curr')){
			t.addClass("curr").siblings("li").removeClass("curr");
			atpage = 1;
			objId.html('');
			getList();
		}
	})

	//搜索我的订单
	$('.ordershopForm form').submit(function(e){
		e.preventDefault();
		atpage = 1;
		objId.html('');
		getList();
		return false;
	})


	// 下拉加载
	$(window).scroll(function() {
		var h = $('.item').height();
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w - h;
		if ($(window).scrollTop() > scroll && !isload) {
			atpage++;
			getList();
		};
	});

	

});
function DateDiff(startTime, endTime, type) {
	if(endTime > startTime){
		var timeDiff = endTime - startTime;
	}else{
		var timeDiff = startTime - endTime;
	}
    
    switch (type) {
        case "year":
            return Math.floor(timeDiff / 86400 / 365);
            break;
        case "month":
            return Math.floor(timeDiff / 86400 / 30);
            break;
        case "day":
            return (timeDiff / 86400).toFixed(1);
            break;
        case "hour":
            return Math.floor(timeDiff / 3600);
            break;
        case "minute":
            return Math.floor(timeDiff / 60);
            break;
        case "second":
            return timeDiff % 60;
            break;
    }
}
function getList(is){
  $(".noData").hide()		
  isload = true;

	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	state = $('.tab .curr').attr('data-id') ? $('.tab .curr').attr('data-id') : '';

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();
	//请求数据
	var data = [];
	data.push("pageSize="+pageSize);
	data.push("page="+atpage);
	data.push("state="+state);
	var keywords = $('#keyword').val();
	data.push("title="+keywords);
	$('.allChoose li').each(function(){
		var ttype = $(this).attr('data-type');
		var ttid = $(this).attr('data-id');
		data.push(ttype+'='+ttid);
	})

	
	var pstype = $('.peisChoose li.curr').attr('data-id');
	if(state == '6,2' && pstype != undefined && pstype != ''){
		data.push("shipping="+pstype);
	}

	$.ajax({
		url: "/include/ajax.php?service=shop&action=orderList&store=1",
		type: "GET",
		data: data.join("&"),
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
						case "6,1":
							totalCount = pageInfo.recei1;
							break;
						case "6,2":
							totalCount = pageInfo.recei2;
							break;
						case "7":
							totalCount = pageInfo.closed;
							break;
					}

					var total = pageInfo.totalCount;
					// pageInfo.tobeuse + pageInfo.success + 
					// pageInfo.refunded + pageInfo.ongoing + 
					// pageInfo.cancel + pageInfo.cancel + 
					// pageInfo.recei + pageInfo.recei1 + 
					// pageInfo.recei2 + pageInfo.c + 
					$("#all").html(total);
					$("#tobeuse").html(pageInfo.tobeuse);
					$("#used").html(pageInfo.success);
					$("#refunded").html(pageInfo.refunded);
					$("#ongoing").html(pageInfo.ongoing);
					$("#recei2").html(pageInfo.recei2);
					$("#closed").html(pageInfo.closed);

					var msg = totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];


					// $("#total").html(pageInfo.totalCount);
					// $("#unpaid").html(pageInfo.unpaid);
					// $("#unused").html(pageInfo.ongoing);
					// $("#used").html(pageInfo.success);
					// $("#refund").html(pageInfo.refunded);
					// $("#rates").html(pageInfo.rates);
					// $("#recei").html(pageInfo.recei);
					// $("#closed").html(pageInfo.closed);
					// $("#cancel").html(pageInfo.cancel);

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item       = [],
									id         = list[i].id,
									member     = list[i].member,
									ordernum   = list[i].ordernum,
									orderstate = list[i].orderstate,
									retState   = list[i].retState,
									ordertime  = list[i].orderdate,
									orderdate  = huoniao.transTimes(list[i].orderdate, 2),
									expDate    = list[i].expDate,
									//expireddate = list[i].expireddate?list[i].expireddate.replace(/./g,'-'):'',
								   expireddate = list[i].expireddate?list[i].expireddate.split('.').join('/'):'',

								payurl     = list[i].payurl,
									common     = list[i].common,
									commonUrl  = list[i].commonUrl,
									paytype    = list[i].paytype,
									totalPayPrice  = list[i].totalPayPrice,
									peisongid  = list[i].peisongid,
									songdate   = list[i].songdate,
									member     = list[i].member,
									shipping   = list[i].shipping,
									product    = list[i].product,
									protype    = list[i].protype,
									shopquan   = list[i].shopquan;
							var chatid = list[i].storeuserid
							var chattitle = list[i].storename
							if (list[i].branch){
								chatid = list[i].branch.userid;
								chattitle = list[i].branch.branchusername;
							}

							var detailUrl = shopEditUrl.replace("%id%", id);
							var priceUrl = priceEditUrl+'?id='+id;
							var refundUrl = refundEditUrl.replace("%id%", id);
							var fhUrl = detailUrl.indexOf("?") > -1 ? detailUrl + "&rates=1" : detailUrl + "?rates=1";
							var stateInfo = btn = timeInfo = tktxt =spetxt ='';
							var nowDate = parseInt(((new Date()).getTime())/1000);
							var ssdate = ordertime;
							var hourDiff,minuteDiff,dayDiff,monthDiff;							
							if(orderstate == 6){
								if(retState == 1){//被申请退款 按何时自动退款计算
                                    //拒绝了
                                    if(list[i].ret_audittype == 1){
                                        ssdate = list[i].autocloseexptime
                                    }else{
                                        ssdate = list[i].autotuikuantime;
                                    }
								}else{//发货未退款 按发货时间计算									
									ssdate = expDate;
								}

							}else if(orderstate == 3){//交易成功的
								ssdate = list[i].autotuikuantime;
							}else if(orderstate == 7){//退款成功的 以退款成功时间 开始计算
								ssdate = list[i].ret_ok_date;
							}else if(orderstate == 10){//取消的 以取消时间 开始计算
								ssdate = list[i].canceltime;
							}//还有团购商品的已过期（交易关闭）和 已使用（交易成功）这两种情况

							hourDiff = DateDiff(ssdate,nowDate,'hour');
							minuteDiff = DateDiff(ssdate,nowDate,'minute');
							dayDiff = DateDiff(ssdate,nowDate,'day');
							monthDiff = DateDiff(ssdate,nowDate,'month');
							

							if(hourDiff < 1){//一小时内								
								timeInfo = minuteDiff+'分钟前'
							}else if(hourDiff < 24){//一天之内
								timeInfo = hourDiff+'小时前'

							}else if(hourDiff < 720){//一个月之内
								
								var dayArr = dayDiff.split('.');
								if(dayArr[1] > 0){
									timeInfo = dayArr[0]+'天'+Math.floor((dayArr[1]/10)*24)+'时前'
								}else{
									timeInfo = dayArr[0]+'天前';
								}

							}else if(hourDiff < 8760){//一年之内								
								timeInfo = monthDiff+'月前';

							}else{//一年以上
								timeInfo = (huoniao.transTimes(list[i].orderdate, 2)).replace(/\-/g, ".");
							}
							
							btn='<a href="'+detailUrl+'">'+langData['siteConfig'][19][313]+'</a>';
							switch(orderstate){
								case "0":
									stateInfo = "<span class='state blue'>"+langData['siteConfig'][9][23]+"</span>";//待付款
									timeInfo += "下单";
									btn='<a href="'+priceUrl+'">修改价格</a>';//修改价格
									break;
								case "1":
									
									if(protype ==1 ){//电子券 、 团购商品
										var nowDateArr = (new Date()).getTime();
										var expDateArr = (new Date(expireddate)).getTime();

										if(shopquan!=0){
											if(expDateArr >nowDateArr){
												stateInfo = '<span class="state blue">'+langData['siteConfig'][9][49]+'</span>';  //未使用
												timeInfo += "付款";
											}else{
												stateInfo = '<span class="state grey">'+langData['siteConfig'][57][26]+'</span>';  //交易关闭
												tktxt = '<span class="tktxt">'+langData['siteConfig'][9][29]+'</span>';//已过期
												timeInfo += "关闭";

											}
											

										}else{//已使用
											stateInfo = '<span class="state grey">'+langData['siteConfig'][9][37]+'</span>';//交易成功
											timeInfo += "完成";
										}
										spetxt = '<h3 class="spec">有效期至：'+list[i].expireddate+'</h3>';

									}else{
										if(shipping==1){
	                                        stateInfo = "<span class='state blue'>"+langData['siteConfig'][9][25]+"</span>";//待发货
	                                    }else{//待确认
	                                        stateInfo = "<span class='state blue'>"+langData['siteConfig'][9][25]+"</span>";//待发货
	                                    }
	                                    btn='<a href="'+detailUrl+'">'+(shipping == 0 ? '去确认' : '去发货')+'</a>';
	                                    timeInfo += "付款";
									}
									break;
								case "11":
									timeInfo += "付款"; 
									stateInfo = '<span class="state blue">'+langData['siteConfig'][9][25]+'</span>';//待发货
									btn = '<a href="'+fhUrl+'" class="sureBtn">'+langData['siteConfig'][6][154]+'</a>';
									break;
								case "3":
									stateInfo = '<span class="state grey">'+langData['siteConfig'][9][37]+'</span>';//交易成功
									timeInfo += "完成";
									break;
								case "4":
									stateInfo = '<span class="state orange">'+langData['siteConfig'][9][27]+'</span>';//退款中
									break;
								case "6":

									//申请退款
									if(retState == 1){

										//还未发货,申请退款
										if(expDate == 0){
											stateInfo = "<span class='state orange'>"+langData['siteConfig'][9][27]+"</span>";//退款中

										//已经发货,申请退款
										}else{
											stateInfo = "<span class='state orange'>"+langData['siteConfig'][9][27]+"</span>";//退款中
										}

										//计算多少天后自动操作
                                        timeInfo = timeInfo.replace('前', '后');

                                        //等待处理
                                        if(list[i].ret_audittype == 0){
                                            btn = '<a href="'+refundUrl+'">处理退款</a>';
                                            tktxt = '<span class="tktxt">等待商家处理</span>';
                                            timeInfo += "自动退款";
                                        }
                                        //如果拒绝了
                                        else if(list[i].ret_audittype == 1){
                                            btn = '<a href="'+refundUrl+'">退款详情</a>';
                                            tktxt = '<span class="tktxt">等待买家处理</span>';
                                            timeInfo += "自动关闭";
                                        }
                                        else{                                            
                                            btn = '<a href="'+refundUrl+'">退款详情</a>';
                                        }
										
										

									//未申请退款
									}else{
                                        if(protype != 1){

	                                        if(shipping == 1 || shipping == 2){
	                                            var shippingName = shipping == 2 ? langData['siteConfig'][9][71] : langData['siteConfig'][9][70];//快递 -- 商家自送
												stateInfo = "<span class='state yellow'>"+shippingName+"</span>";  //商家配送

												timeInfo += "送出";//待改

											}else{
												if(peisongid == 0){//待分配骑手
													stateInfo = "<span class='state blue'>"+langData['siteConfig'][9][58]+"</span>";//已发货
												}else{
													if(songdate == 0){//待取货
														stateInfo = "<span class='state blue'>"+langData['siteConfig'][9][58]+"</span>";//已发货
													}else{//配送中
														stateInfo = "<span class='state blue'>"+langData['siteConfig'][9][58]+"</span>";//已发货
													}
												}

												timeInfo += "发货";//待改
											}
                                        }else{
                                        	var nowDateArr = (new Date()).getTime();
											var expDateArr = (new Date(expireddate)).getTime();

											if(shopquan!=0){
												if(expDateArr >nowDateArr){
													stateInfo = '<span class="state blue">'+langData['siteConfig'][9][49]+'</span>';  //未使用
													timeInfo += "付款";
												}else{
													stateInfo = '<span class="state grey">'+langData['siteConfig'][57][26]+'</span>';  //交易关闭
													tktxt = '<span class="tktxt">'+langData['siteConfig'][9][29]+'</span>';//已过期
													timeInfo += "关闭";

												}
												

											}else{//已使用
												stateInfo = '<span class="state grey">'+langData['siteConfig'][9][37]+'</span>';//交易成功
												timeInfo += "完成";
											}
											spetxt = '<h3 class="spec">有效期至：'+list[i].expireddate+'</h3>';
                                        }
									}
									break;
								case "7"://退款成功
									stateInfo = "<span class='state grey'>"+langData['siteConfig'][57][26]+"</span>";//交易关闭
									tktxt = '<span class="tktxt">'+langData['siteConfig'][9][34]+'</span>';//退款成功
									timeInfo += "关闭";
									break;
								case "10"://已取消
									stateInfo = "<span class='state grey'>"+langData['siteConfig'][57][26]+"</span>";//交易关闭
									tktxt = '<span class="tktxt">已取消</span>';//已取消
									timeInfo += "关闭";
									break;
							}

                          for(var p = 0; p < product.length; p++){
                                cla = p == product.length - 1 ? ' class="lt"' : "";

								html.push('<div class="item" data-id="'+id+'">');
							    html.push('<p class="order-number fn-clear">'+stateInfo+'<span class="fn-left ornum">'+langData['siteConfig'][19][308]+ordernum+'</span><span class="time">'+timeInfo+'</span></p>');
							    if(list[i].branch){
							    	html.push('<p class="store fn-clear">');
									html.push('<span class="title fn-clear"><em class="sname">'+langData['siteConfig'][45][82]+'：' + list[i].branch.title+'</em></span></p>');//分店
							    }
								
								html.push('<div class="shop-list '+(list[i].branch?'spe':'')+'">');
								 var totalCount = 0;
								for (var p = 0; p < product.length; p++) {
									html.push('<a href="' + detailUrl + '"><div class="fn-clear">');
									html.push('<div class="imgbox"><img src="' + product[p].litpic + '" alt="" onerror="this.src=\'/static/images/good_default.png\'" /></div>');
									var specTxt = '';
									if (product[p].specation != "") {
										var speArr = product[p].specation.split('$$$');
										var shtml = [];
										for (var j = 0; j < speArr.length; j++) {
											var speArr1 = speArr[j].split('：');
											shtml.push(speArr1[1])

										}
										specTxt = '<h3 class="spec">' + shtml.join(';') + '</h3>'

									}

									html.push('<div class="txtbox"><p>' + product[p].title + '</p>' + (spetxt!=''?spetxt:specTxt) + '</div>');
									html.push('<div class="pricebox"><p class="price"><span>' + (echoCurrency('symbol')) + '</span>' + product[p].price + '</p><p class="mprice">x' + product[p].count + '</p></div>');
									html.push(tktxt)
									html.push('</div></a>');
									totalCount += (product[p].count)*1;
								}
								html.push('</div>');

								var priceArr = totalPayPrice.split('.');
								html.push('<div class="shop_price"><span class="shop_pnum">' + langData['siteConfig'][57][14].replace('1', totalCount) + '</span><p class="pprice"><em>' + langData['siteConfig'][19][316] + '</em><span>   ' + echoCurrency('symbol') + '<strong>' + priceArr[0] + '</strong><i>.' + priceArr[1] + '</i></span></p></div>');//共1件商品 -- 实付款

								html.push('<div class="itemBot">');
								html.push('	<div class="userchat chat_to-Link" data-type="orderlist" data-chatid="'+chatid+'" data-mod="shop" data-title="'+product[0].title+'" data-img="'+product[0].litpic+'" data-price="'+product[0].price+'" data-link="'+detailUrl+'" data-ordernum="'+ordernum+'" data-count="'+totalCount+'" data-sdate="'+huoniao.transTimes(list[i].orderdate, 1)+'"><i></i>'+chattitle+'</div>');
								html.push('	<div class="btn-group" data-action="shop">' + btn + '</div>');
								html.push('</div>');
								html.push('</div>');

							}


						}

						objId.append(html.join(""));
                        $('.loading').remove();
                        isload = false;

					}else{
						if(atpage == 1){
							$(".noData").show()
						}
						
						// $('.loading').remove();
						// objId.append("<p class='loading'>"+msg+"</p>");
					}

				}
			}else{
				$(".noData").hide()
				// objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
