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

function getList(is){

  isload = true;

	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();


	$.ajax({
		url: masterDomain+"/include/ajax.php?service=tuan&action=orderList&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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

					var msg = totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
	  					var item     = [],
								id         = list[i].id,
								company    = list[i].company,
								ordernum   = list[i].ordernum,
								proid      = list[i].proid,
								procount   = list[i].procount,
								orderprice = list[i].orderprice,
								orderstate = list[i].orderstate,
								paydate    = list[i].paydate,
								retState   = list[i].retState,
								expDate    = list[i].expDate,
								orderdate  = huoniao.transTimes(list[i].orderdate, 1).replace(new Date().getFullYear() + "-", ""),
								title      = list[i].product.title,
								enddate    = huoniao.transTimes(list[i].product.enddate, 2),
								litpic     = list[i].product.litpic,
								url        = list[i].product.url,
								payurl     = list[i].payurl,
								common     = list[i].common,
								cardnumUrl = list[i].cardnumUrl,
								tuantype   = list[i].tuantype,
								commonUrl  = list[i].commonUrl,
								tuikuan    = list[i].product.is_tuikuan;  //是否支持退款

              var stateInfo = btn = "";

              var detailUrl = durl.replace("%id%", id);

              switch(orderstate){
                case "0":
                  stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][22]+'</span></p>';
                  btn = '<a href="javascript:;" class="btn-cancel btn-nobg del">'+langData['siteConfig'][6][65]+'</a><a href="javascript:;" class="btn-pay btn-bg popPay" data-ordernum ="'+ordernum+'">'+langData['siteConfig'][6][64]+'</a>';
                  break;
				case "1":
					if(tuantype != 2){
						if(list[i].pinid!=0 && list[i].pinstate==0){
							stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][39][2]+'</span></p>';//正在拼团中
						}else{
							stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][45][29]+'</span></p>';  //待使用
						}


                        btn = '<a href="javascript:;" class="btn-cancel btn-nobg refund">' + langData['siteConfig'][6][66] + '</a>';
                        btn = tuikuan == '0' ? btn : "";  //tuikuan   0支持 1不支持
                        if(cardnumUrl != undefined) {
                            btn += '<a href="javascript:;" data-code="' + cardnumUrl + '" class="btn-pay btn-bg showQrcode">'+langData['siteConfig'][45][30]+'</a>';//团购券码
                        }
					}else{
						if(list[i].pinid && list[i].pinstate==0){
							stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][39][2]+'</span></p>';  //正在拼团中
						}else{
							stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][45][31]+'</span></p>';  //等待卖家发货
						}
						btn = '<a href="javascript:;" class="btn-cancel btn-nobg refund">'+langData['siteConfig'][6][66]+'</a>';
						btn = tuikuan == '0' ? btn : "";  //tuikuan   0支持 1不支持
					}
                  break;
                case "2"://已过期
                  if(paydate != 0){
                    stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][29]+'</span></p>';
                    btn = '<a href="javascript:;" class="btn-cancel btn-nobg refund">' + langData['siteConfig'][6][66] + '</a>';
                     btn = tuikuan == '0' ? btn : "";  //tuikuan   0支持 1不支持
                  }else{
                    stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][40]+'</span></p>';
                    btn = '<a href="javascript:;" class="btn-cancel btn-nobg del">'+langData['siteConfig'][6][65]+'</a>';

                  }
                  break;
                case "3":
                  stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][37]+'</span></p>';
                  if(common == 1){
                    btn = '<a href="'+commonUrl+'" class="btn-bg btn-changepj">'+langData['siteConfig'][8][2]+'</a>';
                  }else{
                    btn = '<a href="'+commonUrl+'" class="btn-bg btn-changepj">'+langData['siteConfig'][19][365]+'</a>';
                  }

                  break;
                case "4":
                  stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][27]+'</span></p>';
                  // btn = '<a href="javascript:;" class="edit">退款去向</a>';
                  break;
                case "6":

                  //申请退款
                  if(retState == 1){

                    //还未发货
                    if(expDate == 0){
                      stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][44]+'</span></p>';

                    //已经发货
                    }else{
                      stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][42]+'</span></p>';
                    }

                  //未申请退款
                  }else{
                    stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][26]+'</span></p>';
                    btn = '<a href="'+detailUrl+'" class="btn-bg edit">'+langData['siteConfig'][6][45]+'</a>';
                  }
                  break;
                case "7":
                  stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][34]+'</span></p>';
                  // btn = '<a href="javascript:;" class="edit">退款去向</a>';
                  break;
              }

							html.push('<dl class="myitem" data-id="'+id+'">');
							html.push('<dt><p class="shop_name"><i></i><span>'+company+'</span></p><p class="order-state"><span>'+stateInfo+'</span></p></dt>')
							html.push('<dd class="order-content"><a href="'+detailUrl+'"><div class="fn-clear">');
							html.push('<div class="imgbox-l"><img src="'+litpic+'" alt="" /></div>');
							html.push('<div class="info-r">');
							html.push('<div class="txtbox-c"><p>'+title+'</p></div>');
							html.push('<div class="pricebox-r"><p class="mprice">x'+procount+'</p></div>');
							html.push('<p class="pprice"><span>合计'+(echoCurrency('symbol'))+'</span>'+orderprice+'</p>');
							html.push('</div>');
							html.push('</div>');

							html.push('</a>');
							html.push('<div class="btn-group" data-action="tuan">'+btn+'</div>');
							html.push('</dd>');
							html.push('</dl>');

						}

						objId.append(html.join(""));
          				  $('.loading').remove();
          				  $('.no-data').hide();

           				  isload = false;

					}else{
           				$('.loading').remove();
//						objId.append("<p class='loading'>"+msg+"</p>");
						if(totalCount==0){
							$('.no-data').show();
						}else{
							objId.append("<p class='loading'>"+msg+"</p>");
						}
					}

					$("#total").html(pageInfo.totalCount);
					$("#unpaid").html(pageInfo.unpaid);
					$("#unused").html(pageInfo.ongoing);
					$("#recei").html(pageInfo.recei);
					$("#used").html(pageInfo.success);
					$("#expired").html(pageInfo.expired);
					$("#refund").html(pageInfo.refunded);
					$("#rates").html(pageInfo.rates);
					$("#closed").html(pageInfo.closed);
					$("#cancel").html(pageInfo.cancel);

				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}


$('body').delegate(".popPay", "click", function(){

	var ordernum1 = $(this).attr('data-ordernum');

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=tuan&action=pay",
		type: 'post',
		data: {'ordernum':ordernum1,'orderfinal':1},
		dataType: 'json',
		success: function(data){
			if(data && data.state == 100){

				sinfo = data.info;
				service   = 'tuan';
				$('#ordernum').val(sinfo.ordernum);
				$('#action').val('pay');

				$('#pfinal').val('1');
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
});
