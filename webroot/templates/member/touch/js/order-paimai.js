$(function(){

    var page = 1, isload = false;

    $(window).scroll(function(){
        var scrollTop = $(window).scrollTop();
        var scrollHeight = $(document).height();
        var windowHeight = $(window).height();
        if((scrollTop + windowHeight >= scrollHeight) && !isload){
            getList();
        }
    })

    function getParam(paramName) {
	    paramValue = "", isFound = !1;
	    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
	        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
	        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
	    }
	    return paramValue == "" && (paramValue = null), paramValue
    }


    getList();

    $('body').delegate('.toPay', 'click', function(){
        var t = $(this), id = t.attr('data-id');
        var ordernum1 = $(this).attr('data-ordernum');

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=paimai&action=pay",
			type: 'post',
			data: {'ordernum':ordernum1,'orderfinal':1,'newOrder':1},
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){

					sinfo = data.info;
					service   = 'paimai';
					$('#ordernum').val(sinfo.ordernum);
					$('#action').val('pay');

					$('#pfinal').val('1');
					$("#amout").text(sinfo.order_amount);
					$('.payMask').show();
					$('.payPop').css('transform', 'translateY(0)');

					if (totalBalance * 1 < sinfo.order_amount * 1) {

						$("#moneyinfo").text('余额不足，');

						$('#balance').hide();
					}

					ordernum = sinfo.ordernum;
					order_amount = sinfo.order_amount;

					payCutDown('', sinfo.timeout, sinfo);
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert('网络错误，请重试！');
				t.removeClass('disabled');
			}
		})
    })

    $(".tab li").click(function(){
        var t = $(this), id = t.attr('data-id');
       t.addClass('curr').siblings('li').removeClass('curr');
       page = 1,isload =false;
       getList()
    })

    var urlState = getParam('state');
    if(urlState){
        $(".tab ul li[data-id='"+urlState+"']").click()
    }


    // 获取订单列表
    function getList(){
        if(isload) return false;
        isload = true;
        if(page == 1){
            objId.html('');
        }
        objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');//加载中，请稍候
        var state = $('.tab .curr').attr('data-id');
        $.ajax({
            url:'/include/ajax.php?service=paimai&action=orderList&pageSize=10&page='+page+'&state='+state,
            type:'get',
            dataType:'json',
            success:function(data){
                if(data.state == 100){
                    var list = data.info.list;
                    var html = [];
                  
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
						case "10":
							totalCount = pageInfo.cancel;
							break;
					}

					var msg = totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];//暂无相关信息！ -- 已加载完全部信息！

					//拼接列表
					if(list.length > 0){
						$('.no-data').hide();
                    
                        for(var i = 0; i < list.length; i++){
                            var item       = [],
                                    id         = list[i].id,
                                    ordernum   = list[i].ordernum,
                                    orderstate = list[i].orderstate,
                                    retState   = 0,
                                    orderdate  = huoniao.transTimes(list[i].orderdate, 1),
                                    expDate    = list[i].expDate,
                                    payurl     = list[i].payUrl,
                                    common     = list[i].common,
                                    commonUrl  = list[i].commonUrl,
                                    paytype    = list[i].paytype,
                                    totalPayPrice  = list[i].totalPayPrice,
                                    store      = list[i].store,
                                    expcompany= list[i].expcompany,
                                    expnumber = list[i].expnumber,
                                    product    = list[i].product;

                            var detailUrl = durl.replace("%id%", id);
                            // var refundlUrl = rUrl.replace("%id%", id);
                            // var commentUrl = cUrl.replace("%id%", id);
                            var stateInfo = btn = "";
    //							console.log(rUrl)
                            var priceTit = '成交价'
                            switch(orderstate){
                                
                                case 1:
                                    stateInfo = '<p class="order-state"><span>'+(list[i].type == 'pai'? "已付款,待发货" : "已交保")+'</span></p>';//已接单，待配送
                                    priceTit = (list[i].type == 'pai'? "成交价" : "当前价")
                                    break;
                                case 3:
                                    stateInfo = '<p class="order-state"><span>配送中</span></p>';
                                    break;
                                case 4:
                                    stateInfo = '<p class="order-state"><span>已完成</span></p>';//退款中
                                    break;
                                
                                case 5:
                                    stateInfo = '<p class="order-state"><span>未获拍</span></p>';//退款成功
                                    priceTit = '当前价'
                                    if(list[i].success_num > 0){
                                        stateInfo = '<p class="order-state"><span>已取消</span></p>';//中拍，未付款
                                    }
                                    break;
                                case 6:
                                    stateInfo = '<p class="order-state"><span>待发货</span></p>';//退款成功
                                    break;
                                case 7:
                                    stateInfo = '<p class="order-state"><span>待支付</span></p>';//退款成功
                                    btn = '<a href="javascript:;" class="yellow btn-bg toPay" data-ordernum="'+list[i].ordernum+'">立即支付</a>';
                                    break;
                               
                            }

                            cla = ' class="lt"';
                                typeText = echoCurrency("symbol") + list[i].product['bao_money'] + ' 保证金';
                                var priceReg = '<p class="pjifen">'+typeText+'</p>'
                            
                                var priceInfo = '<div class="proPrice"><span class="txt">'+priceTit+'</span><span class="price">'+echoCurrency("symbol")+'<b>'+ (list[i].product.money) +'</b></span></div>'
                                var priceHtml = '<div class="priceInfo">'+priceReg+priceInfo+'</div>'
                             
                            html.push('<dl class="myitem" data-id="'+list[i].id+'">');
                            html.push('<dt><a href="'+list[i].url+'"><p class="order_id"><i></i><span>'+ordernum+'</span></p><p class="order-state"><span>'+stateInfo+'</span></p></a></dt>');
                            html.push('<dd class="order-content">');
                            html.push('<a href="'+detailUrl+'"><div class="fn-clear">');
                            html.push('<div class="imgbox-l"><img src="'+product.litpic+'" /></div>');
                            html.push('<div class="info-r"><div class="txtbox-c"><p>'+product.title+'</p></div><div class="pricebox-r"><p class="mprice">x'+list[i].procount+'</p></div>'+priceHtml+'</div>');
                            html.push('</div></a>');
                            if(btn){

                                html.push('<div class="btn-group" action="paimai">'+btn+'</div>');
                            }
                            html.push('</dd>');
                            html.push('</dl>')
                        }
                        objId.append(html.join(""));
                        $('.no-data').hide();
                        $('.loading').remove();
                        isload = false;
                    }else{

						$('.loading').remove();
//						objId.append("<p class='loading'>"+msg+"</p>");
						if(!totalCount){
							$('.no-data').show();
						}else{
							objId.append("<p class='loading'>"+msg+"</p>");
						}
					}


                    if(state == ''){
                        $("#total").html(pageInfo.totalCount);
                        $("#unpaid").html(pageInfo.state0);
                        $("#haspaid").html(pageInfo.state1);
                        $("#expired").html(pageInfo.state6);
                        $("#used").html(pageInfo.state3);
                        $("#hasget").html(pageInfo.state4);
                        $("#refund").html(pageInfo.state5);
                        $("#toFa").html(pageInfo.state7);
                    }
					


                    isload = false;
                    page ++;
                    if(page > data.info.pageInfo.totalPage){
                        isload = true;
                        objId.append("<p class='loading'>没有更多了</p>");//暂无相关信息！
                    }

                }else{
                    objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
                }
            },
            error:function(){}
        })
    }
})