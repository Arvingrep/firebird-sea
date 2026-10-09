/**
 * 会员中心商城订单
 * by guozi at: 20150928
 */

var objId = $("#list");
$(function(){
  // 保留两位小数
  function keepTwoDecimal(num) {
  	var result = parseFloat(num);
  	if (isNaN(result)) {
  		console.log('传递参数错误，请检查！');
  		return false;
  	}
  	result = Math.round(num * 100) / 100;
  	return result;
  };
	state = state == "" ? 1 : state;
	$(".nav-tabs li[data-id='"+state+"']").addClass("active");

	$(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("active") && !t.hasClass("add")){
			state = id;
			t.addClass("active").siblings("li").removeClass("active");
			if(id=='4,7'){//售后专享列表
				atpage = 1;
				getAfterList();
				$('.saleAfterOh').removeClass('fn-hide');
				$('.shopOh').addClass('fn-hide');
			}else{
				atpage = 1;
				getList();
				$('.saleAfterOh').addClass('fn-hide');
				$('.shopOh').removeClass('fn-hide');
			}

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

	//删除
	$("#list").delegate(".delOrder", "click", function(){
		var t = $(this), table = t.closest("table"), id = table.attr("data-id");
		$.dialog.confirm('此操作不可恢复，您确定要删除吗？', function () {
            $.ajax({
			url: "/include/ajax.php?service=shop&action=delOrder&id="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data.state == 100){

					$.dialog({
						title: '提示消息',
						icon: 'success.png',
						content: '删除成功',
						ok: function(){
							getList(1);
						}
					});
				}else{
					$.dialog({
						title: '提示消息',
						icon: 'success.png',
						content: data.info,
					});
				}
			},
			error: function(){
				alert('网络错误，操作失败！');
			}
		});
        });
		
	});


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
	// 2021-12-23
	//修改订单价格
	$("#list").delegate(".changePrice", "click", function(){

		var par = $(this).closest('table'),tid = par.attr('data-id');
		$.ajax({
			url: "/include/ajax.php?service=shop&action=orderDetail&id="+tid,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state ==100){
					var totalPayPrice = Number(data.info.totalPayPrice),  //剩余应付总价
					    logistic = Number(data.info.logistic), //运费 没有优惠之前
					    totalpointprice = Number(data.info.pointprice), //使用积分抵扣的价格
                        oPrice = 0,  //原价 没减掉积分抵扣的
					    product = data.info.product;
					var proHtml = [];
                    var chYzj = 0;
                    var changeprice = 0;
					for(var p = 0; p < product.length; p++){

                        var _totalPrice = product[p].price * 1 * product[p].count;
                        chYzj += _totalPrice;

                        changeprice = parseFloat(product[p].changeprice);
                        changePrice = changeprice ? changeprice : _totalPrice;
            
                        _totalPrice = changePrice;
                        oPrice += _totalPrice;

						proHtml.push('<tr class="goodItem" data-id="'+product[p].id+'" data-price="'+_totalPrice+'">');
						proHtml.push('	<td>');
						proHtml.push('		<div class="info">');
						proHtml.push('			<a href="'+product[p].url+'" title="'+product[p].title+'" target="_blank" class="pic"><img src="'+product[p].litpic+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"/></a>');
						proHtml.push('			<div class="txt"><a href="'+product[p].url+'" title="'+product[p].title+'" target="_blank">'+product[p].title+'</a><p>'+(product[p].specation?product[p].specation:'')+'</p>');
						proHtml.push('			</div>');
						proHtml.push('		</div>');
						proHtml.push('	</td>');
						proHtml.push('	<td>'+echoCurrency('symbol')+product[p].yprice+'</td>');
						proHtml.push('	<td>'+product[p].count+'</td>');
						proHtml.push('	<td><div class="inpBox"><em>'+echoCurrency('symbol')+'</em><input type="text" placeholder="修改价格" class="afterprice" value="'+changePrice+'"></div></td>');
						proHtml.push('</tr>');
					}
					$('.chpriTa tbody').html(proHtml.join(''));

                    $('.chYzj').html(keepTwoDecimal(chYzj+logistic*1)); //还需支付的钱 包含运费
                    // var proPrice_total = (totalPayPrice * 1 + totalpointprice * 1) - logistic * 1; //商品总计
                    var proPrice_pay = chYzj; //商品应付价格
                    var logistic_pay = logistic*1; //应付运费
                    proPrice_pay = keepTwoDecimal(proPrice_pay);
                    logistic_pay = keepTwoDecimal(logistic_pay);
                    $('#priceAll').html(keepTwoDecimal(oPrice * 1 + logistic_pay));
                    $('#logistic').val(logistic_pay);
                    $('#totalprice').val(proPrice_pay);
                    $('.zongjia').attr('data-totalprice',proPrice_pay);
                    $('.priceItem .free').attr('data-price',logistic_pay);
                    if(logistic_pay >0){
                        $('.chYf').html('(含运费'+echoCurrency('symbol')+logistic_pay+')')
                    }else{
                        $('.chYf').html('(不含运费)')
                    }
				}
			}
		});

		$('.changeMask').show();
		$('.chpriceAlert').addClass('show');
		$('.sureChange').attr('data-id',tid);
	});
	//关闭修改价格弹窗
	$(".changeMask,.chpriceAlert .chprice_close").click(function(){
		$('.changeMask').hide();
		$('.chpriceAlert').removeClass('show');
	})
	//免运费
  	$('.free').click(function(){
	    var t = $(this);
	    if(!t.hasClass('curr')){
			t.addClass('curr');
			var logistic = $('#logistic').val();
			t.attr('data-price',logistic);
			$('#logistic').val('0.00');
	    }else{
			t.removeClass('curr');
			var logistic = $('#logistic').val();
			if(logistic == 0){
				var nowLog = t.attr('data-price');
				$('#logistic').val(nowLog);
			}
    	}

   		calcPrice();
   	})
    //实时监听
  	$("#totalprice").focus(function(){
      	var tval = $(this).val();
      	if(tval !=""){
        	$('#fakeprice').val(tval)
      	}
  	})
  	$("#logistic").focus(function(){
	    var tval = $(this).val();
	    if(tval !=""){
	        $('#fakelogistic').val(tval)
	    }
  	})

  	//监听运费输入
  	$('#logistic').blur(function(){
	    var logval = $(this).val();
	    var nowLog = $('#fakelogistic').val();
	    if(logval > 0 && $('.free').hasClass('curr')){
	      $('.free').removeClass('curr')
	    }else if(logval == "" || logval == " "){
	      $(this).val(nowLog);
	    }
	    calcPrice();
  	})
 	//修改商品总价
  	$('#totalprice').blur(function(){
	    var oldTot = $('#fakeprice').val();
	    var tval = $(this).val();
	    if(tval == ''){
	      $(this).val(oldTot);
	    }
	    calcgoodPrice(1);
  	})

  	//修改商品总价将均摊至单件商品价格
  	function calcgoodPrice(tr){
	    var ssflag = 0;
	    var oldTot = $('.zongjia').attr('data-totalprice');
	    var nowTot = $('#totalprice').val();
	    var difference = Math.abs(oldTot-nowTot);

	    if(nowTot*1 > oldTot*1){
	      ssflag = 1;
	    }
    	var afterAllprice = 0;
    	if(difference > 0){//总价做了修改
	        $('.goodWrap .goodItem').each(function(){
	          var xdprice = $(this).attr('data-price');
	          var xdRadio = (xdprice/oldTot)*difference;
	          if(ssflag == 1){
	            var afterprice = (xdprice*1 + xdRadio*1).toFixed(2);
	          }else{
	            var afterprice = (xdprice - xdRadio).toFixed(2);
	          }
	          $(this).find('.afterprice').val(afterprice);
	          $(this).find('.inpBox').addClass('active');
	          afterAllprice += afterprice*1;

	        })


	      	if(tr){//从修改商品总价处过来的
		        if(afterAllprice > nowTot){//总和 大于修改
		          var cha = afterAllprice-nowTot;
		          var tprice = $('.goodWrap .goodItem:first-child').find('.afterprice').val() - cha;
		          $('.goodWrap .goodItem:first-child').find('.afterprice').val(tprice.toFixed(2));
		        }else if(afterAllprice < nowTot){
		          var cha = nowTot-afterAllprice;
		          var tprice = ($('.goodWrap .goodItem:first-child').find('.afterprice').val())*1 + cha*1;
		          $('.goodWrap .goodItem:first-child').find('.afterprice').val(tprice.toFixed(2));
		        }
	      	}
      		calcPrice();
    	}

  	}
 	$('.goodWrap').delegate('.afterprice','focus',function(){
    	$(this).attr('placeholder','');
    	$(this).closest('.inpBox').addClass('active');
  	})
  	//单独修改某件商品价格
  	$('.goodWrap').delegate('.afterprice','blur',function(){
	    var tval = $(this).val();
	    if(tval == ''){
	      $(this).closest('.inpBox').removeClass('active');
	      $(this).attr('placeholder','修改价格');
	    }
	    calctotPrice(1);
  	})
  	//单独修改某件商品价格 -- 改总价
  	function calctotPrice(){
	    var afterAllprice = 0;
	    $('.goodWrap .goodItem').each(function(){
	      var afterprice = $(this).find('.afterprice').val()?$(this).find('.afterprice').val():$(this).attr('data-price');
	      afterAllprice += afterprice*1;
	    })
	    $('#totalprice').val(afterAllprice.toFixed(2));
	    calcPrice();
  	}


  	function calcPrice(){
	    var totalprice = $('#totalprice').val();
	    var logPrice = $('#logistic').val();
	    totalprice = totalprice*1+logPrice*1;
	    $('#priceAll').text(totalprice.toFixed(2));
	    // if(logPrice > 0){
	    //   $('.chYf').text('(含运费'+echoCurrency('symbol')+logPrice+')');
	    // }else{
	    //   $('.chYf').text('(免运费)');
	    // }

  	}

  	//确认修改价格
  	$('.sureChange').click(function(){
	    var btn = $(this);
	    if(btn.hasClass('disabled')) return false;
	    var priceArr = [];
	    $('.goodWrap .goodItem').each(function(){
	      var tid = $(this).attr('data-id');
	      var afterprice = $(this).find('.afterprice').val()?$(this).find('.afterprice').val():$(this).attr('data-price');
	      priceArr.push({'id':tid,'price':afterprice});
	    })
	    var totalprice = $('#priceAll').text();
	    var logistic   = $('#logistic').val();
	    var orderid = $('.sureChange').attr('data-id');
	    var data = 'orderid='+orderid+'&totalprice='+totalprice+'&logistic='+logistic+'&goodpricearr='+JSON.stringify(priceArr);
	    btn.addClass('disabled');
	    $.ajax({
	      url: "/include/ajax.php?service=shop&action=changePayprice",
	      type: 'get',
	      data:data,
	      dataType: 'jsonp',
	      success: function(data){
	           if(data && data.state == 100){
	            	$.dialog.alert('修改成功');
	           }else{
	            	$.dialog.alert(data.info);
	           }
	           btn.removeClass('disabled');
	           $('.changeMask').hide();
			   $('.chpriceAlert').removeClass('show');
			   location.reload();
	      },
	      error: function(){
	        $.dialog.alert('网络错误，加载失败！')
	        btn.removeClass('disabled');
	      }

	    })

  	})


});

function CheckInfo() {
    var _state = $('.nav-tabs .active').attr('data-id');
    if (event.keyCode == 13) {
        atpage = 1;
        if(_state == '4,7'){
            getAfterList();
        }else{
            getList();
        }
    }
}
//售后订单列表
function getAfterList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=shop&action=orderList&store=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
								ordernum   = list[i].ordernum,
								orderstate = list[i].orderstate,
								retState   = list[i].retState,
								orderdate  = huoniao.transTimes(list[i].orderdate, 1),
								ret_refund_date  = huoniao.transTimes(list[i].ret_refund_date, 1),
								expDate    = list[i].expDate,
								expireddate = list[i].expireddate?list[i].expireddate.replace(/./g,'-'):'',
								payurl     = list[i].payurl,
								common     = list[i].common,
								commonUrl  = list[i].commonUrl,
								paytype    = list[i].paytype,
								totalPayPrice  = list[i].totalPayPrice,
								peisongid  = list[i].peisongid,
								songdate   = list[i].songdate,
								shipping   = list[i].shipping,
								member     = list[i].member,
								pinid      = list[i].pinid,
								pinstate   = list[i].pinstate,
								huodongtype     = list[i].huodongtype,
								product    = list[i].product,
								protype    = list[i].protype,
								shopquan   = list[i].shopquan;

							var detailUrl = editUrl.replace("%id%", id);
							var fhUrl = detailUrl.indexOf("?") > -1 ? detailUrl + "&rates=1" : detailUrl + "?rates=1";
							var stateInfo = btn = "";
							html.push('<table data-id="'+id+'"><colgroup><col style="width:28%;"><col style="width:10%;"><col style="width:17%;"><col style="width:17%;"><col style="width:16%;"><col style="width:12%;"></colgroup>');
							html.push('<thead><tr class="placeh"><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td colspan="5">');
							html.push('<span class="dealtime" title="'+orderdate+'">'+orderdate+'</span>');
							html.push('<span class="number">'+langData['siteConfig'][19][308]+'：<a href="'+detailUrl+'">'+ordernum+'</a></span>');
							if(list[i].branch){
								html.push('<span class="dealtime">分店：<em>'+list[i].branch.title+'</em></span>');
						    }
							html.push('<span class="number">买家：<a href="javascript:;">'+list[i].member.nickname+'</a></span>');
							html.push('</td>');
							html.push('<td colspan="1"></td></tr></thead>');
							html.push('<tbody>');
							var scla = product.length>1?'borle':'';
							for(var p = 0; p < product.length; p++){
								cla = p == product.length - 1 ? ' class="lt"' : "";
								html.push('<tr'+cla+'>');
								html.push('<td class="nb"><div class="info"><a href="'+product[p].url+'" title="'+product[p].title+'" target="_blank" class="pic"><img src="'+huoniao.changeFileSize(product[p].litpic, "small")+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"/></a><div class="txt"><a href="'+product[p].url+'" title="'+product[p].title+'" target="_blank">'+product[p].title+'</a><p>'+product[p].specation.replace("$$$", " ")+'</p></div></div></td>');
								

								if(p == 0){

                                    //退款金额 并不是商品的price哦
                                    html.push('<td class="bf nb salered" style="border-left: 1px solid #e5e5e5;" rowspan="'+product.length+'">'+echoCurrency('symbol')+list[i].totalPayPrice+'</td>');
                                    html.push('<td class="bf nb" rowspan="'+product.length+'">'+ret_refund_date+' </td>');//申请退款的时间

									var stateInfo = '';
									//申请退款
                                    if(retState == '1'){
                                        //还未发货
                                        if(expDate == '0'){
                                            stateInfo = langData['siteConfig'][9][43];  //未发货  申请退款

                                        //已经发货
                                        }else{
                                            stateInfo = langData['siteConfig'][9][42];   //已发货  退款
                                        }



                                    }else{
                                    	 if(list[i].ret_ok_date != '0'){
                                    	 	 stateInfo = langData['siteConfig'][9][34];   //已发货  退款
                                    	 }
                                    }
                                    if(list[i].pingstate == '1'){
                                    	stateInfo = '平台介入';   //已发货  退款
                                    }
									// switch(orderstate){
									// 	case '4':
									// 		stateInfo = langData['siteConfig'][9][27];  //退款中
									// 		break;
									// 	case '6':
											
		       //                              break;
		       //                          case '7':
		       //                          	stateInfo = langData['siteConfig'][9][34];  //退款成功
         //                            		break;
									// }
									//退款类型 退货退款 -- 只退款
									html.push('<td class="bf nb '+scla+'" rowspan="'+product.length+'">'+(list[i].user_refundtype == "0" ? "仅退款" : "退货退款")+'</td>');
									//退款状态 退货完成 -- 退款完成 -- 等待卖家处理
									html.push('<td class="bf nb salered2" rowspan="'+product.length+'">'+stateInfo+'</td>');
									html.push('<td class="bf nb saleblue" rowspan="'+product.length+'"><a href="'+detailUrl+'">'+langData['siteConfig'][6][113]+'</a></td>');//查看详情
								}
								html.push('</tr>');
							}

							html.push('</tbody>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}


					totalCount = pageInfo.refunded+pageInfo.closed;
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
$(".searchItem").click(function(){
    var _state = $('.nav-tabs .active').attr('data-id');
	atpage = 1;
    if(_state == '4,7'){
        getAfterList();
    }else{
        getList();
    }
})
//全部的订单列表
function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();
	var title = $("#searchTit").val()
	$.ajax({
		url: masterDomain+"/include/ajax.php?service=shop&action=orderList&store=1&state="+state+"&page="+atpage+"&pageSize="+pageSize+"&title="+title,
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
								ordernum   = list[i].ordernum,
								orderstate = list[i].orderstate,
								retState   = list[i].retState,
								orderdate  = huoniao.transTimes(list[i].orderdate, 1),
								expDate    = list[i].expDate,
								expireddate = list[i].expireddate?list[i].expireddate.split('.').join('-'):'',
								payurl     = list[i].payurl,
								common     = list[i].common,
								commonUrl  = list[i].commonUrl,
								paytype    = list[i].paytype,
								totalPayPrice  = list[i].totalPayPrice,
								peisongid  = list[i].peisongid,
								songdate   = list[i].songdate,
								shipping   = list[i].shipping,
								member     = list[i].member,
								pinid      = list[i].pinid,
								pinstate   = list[i].pinstate,
								huodongtype     = list[i].huodongtype,
								product    = list[i].product,
								protype    = list[i].protype,
								shopquan   = list[i].shopquan;

							var detailUrl = editUrl.replace("%id%", id);
							var fhUrl = detailUrl.indexOf("?") > -1 ? detailUrl + "&rates=1" : detailUrl + "?rates=1";
							var stateInfo = btn = "";

							switch(orderstate){
								case "0":

									//待付款
									stateInfo = "<span class='state1'>"+langData['siteConfig'][9][23]+"</span>";
									btn = '<div class="unpaytd"><a href="'+detailUrl+'" class="bgblue">订单详情</a><a href="javascript:;" class="changePrice">修改价格</a></div>';//修改价格

									break;
								case "1":
									if(protype ==1 ){//电子券 、 团购商品
										if(shopquan!=0){//未使用
											var nowDateArr = (new Date()).getTime();
											var expDateArr = (new Date(expireddate)).getTime();

											if(expDateArr >nowDateArr){//没过期
												stateInfo = "<span class='state1'>待使用</span><div><span class='jytip'> 有效期至："+list[i].expireddate+"</span></div>";

											}else{//已过期
												stateInfo = "<span class='state1'>已过期</span><div><span class='jytip'> 有效期至："+list[i].expireddate+"</span></div>";
											}
										}else{//已使用
											stateInfo = "<span class='state1'>交易成功</span><div><span class='jytip'> 有效期至："+list[i].expireddate+"</span></div>";
										}
										btn = '<div><a href="'+detailUrl+'" class="bgblue">订单详情</a></div><div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//打印订单
									}else{


										//待发货
										stateInfo = "<span class='state1'>"+(shipping == 0 ? '待确认' : langData['siteConfig'][9][25])+"</span>";
										btn = '<div><a href="'+detailUrl+'" class="bgblue">'+(shipping == 0 ? '去确认' : '去发货')+'</a></div><div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//打印订单
									}


									break;
								case "3":
									stateInfo = "<span class='state3'>"+langData['siteConfig'][9][37]+"</span>";//交易成功
									btn = '<div><a href="'+detailUrl+'" class="bgblue">订单详情</a></div><div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//打印订单
									break;
								case "4":
									stateInfo = "<span class='state4'>"+langData['siteConfig'][9][27]+"</span><div><span class='jytip'>等待商家处理</span></div>";//退款中
									btn = '<div><a href="'+detailUrl+'" class="tk bgblue">'+langData['siteConfig'][26][169]+'</a></div><div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//处理退款
									break;
								case "6":

									//申请退款
									if(retState == 1){

										//还未确认
										//if(expDate == 0){
											//stateInfo = "<span class='state61'>"+langData['siteConfig'][38][92]+"</span>";//未确认，申请退款中

											//已经确认
										//}else{
											stateInfo = "<span class='state61'>"+langData['siteConfig'][9][27]+"</span><div><span class='jytip'>等待商家处理</span></div>";//退款中
										//}
										btn = '<div><a href="'+detailUrl+'" class="tk bgblue">'+langData['siteConfig'][26][169]+'</a></div><div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//处理退款

										//未申请退款
									}else{
										//1快递 2 商家自配
										if(protype != 1){

											if(shipping == 1 || shipping == 2){

												var shippingName = shipping == 2 ? '(商家配送)' : '';
												stateInfo = "<span class='state6'>"+langData['siteConfig'][9][58]+shippingName+"</span>";  //已发货

												btn = '<div><a href="'+detailUrl+'" class="bgblue">'+langData['siteConfig'][19][313]+'</a></div><div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//订单详情--打印订单
											}else{
                                                if(expDate == 0){
                                                    //待发货
                                                    stateInfo = "<span class='state1'>"+langData['siteConfig'][9][25]+"</span>";
                                                    btn = '<div><a href="'+detailUrl+'" class="bgblue">去发货</a></div><div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//打印订单
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
											}
										}else{
											if(shopquan!=0){//未使用
												var nowDateArr = (new Date()).getTime();
												var expDateArr = (new Date(expireddate)).getTime();

												if(expDateArr >nowDateArr){//没过期
													stateInfo = "<span class='state1'>待使用</span><div><span class='jytip'> 有效期至："+list[i].expireddate+"</span></div>";

												}else{//已过期
													stateInfo = "<span class='state1'>已过期</span><div><span class='jytip'> 有效期至："+list[i].expireddate+"</span></div>";
												}
											}else{//已使用
												stateInfo = "<span class='state1'>交易成功</span><div><span class='jytip'> 有效期至："+list[i].expireddate+"</span></div>";
											}
											btn = '<div><a href="'+detailUrl+'" class="bgblue">订单详情</a></div><div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//打印订单
										}

										//btn = '<a href="javascript:;" class="sh">确认收货</a>';
									}
									break;
								case "7":
									stateInfo = "<div><span class='state7'>交易关闭</span></div><div><span class='jytip'>"+langData['siteConfig'][9][34]+"</span></div>";//交易关闭=-退款成功

									btn = '<div><a href="'+detailUrl+'" class="bgblue">'+langData['siteConfig'][19][313]+'</a></div><div><a href="javascript:;" class="print">'+langData['siteConfig'][38][91]+'</a></div>';//订单详情--打印订单
									break;

								case "10":
									stateInfo = "<div><span class='state7'>交易关闭</span></div><div><span class='jytip'></span></div>";//交易关闭=-退款成功
									btn = '<div><a href="'+detailUrl+'" class="bgblue">'+langData['siteConfig'][19][313]+'</a></div><div><a href="javascript:;" class="delOrder">删除订单</a>';//订单详情--打印订单
							}

							html.push('<table data-id="'+id+'"><colgroup><col style="width:38%;"><col style="width:10%;"><col style="width:7%;"><col style="width:17%;"><col style="width:16%;"><col style="width:12%;"></colgroup>');
							html.push('<thead><tr class="placeh"><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td colspan="5">');
							html.push('<span class="dealtime" title="'+orderdate+'">'+orderdate+'</span>');
							html.push('<span class="number">'+langData['siteConfig'][19][308]+'：<a href="'+detailUrl+'">'+ordernum+'</a></span>');
							if(list[i].branch){
								html.push('<span class="dealtime">分店：<em>'+list[i].branch.title+'</em></span>');
						    }
							html.push('<span class="number">买家：<a href="javascript:;">'+list[i].member.nickname+'</a></span>');

							var statename = '';
							if(huodongtype ==4 && pinid){

								if(pinstate == 1){
									statename = '拼团成功';
								}else if(pinstate ==0){
									statename = '拼团中';
								}else{
									statename = '拼团失败';
								}
								html.push('<span class="number">活动类型：拼团('+statename+')</span>');
							}

							html.push('</td>');
							html.push('<td colspan="1"></td></tr></thead>');
							html.push('<tbody>');

							for(var p = 0; p < product.length; p++){
								cla = p == product.length - 1 ? ' class="lt"' : "";
								html.push('<tr'+cla+'>');
								html.push('<td class="nb"><div class="info"><a href="'+product[p].url+'" title="'+product[p].title+'" target="_blank" class="pic"><img src="'+huoniao.changeFileSize(product[p].litpic, "small")+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"/></a><div class="txt"><a href="'+product[p].url+'" title="'+product[p].title+'" target="_blank">'+product[p].title+'</a><p>'+product[p].specation.replace("$$$", " ")+'</p></div></div></td>');
								html.push('<td class="nb">'+product[p].price+'</td>');
								html.push('<td>'+product[p].count+'</td>');

								if(p == 0){
									html.push('<td class="bf" rowspan="'+product.length+'"><strong>'+totalPayPrice+'</strong>'+(paytype ? '<div class="paytype">'+paytype+'</div>' : '')+'</td>');
									html.push('<td class="bf" rowspan="'+product.length+'"><div><a href="'+detailUrl+'">'+stateInfo+'</a></div></td>');
									html.push('<td class="bf nb" rowspan="'+product.length+'">'+btn+'</td>');
								}
								html.push('</tr>');
							}

							html.push('</tbody>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
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
						case "6,2":
							totalCount = pageInfo.recei2;
							break;
						case "6,3":
							totalCount = pageInfo.tobeuse;
							break;
						case "4,7":
							totalCount = pageInfo.refunded+pageInfo.closed;
							break;
					}

					$("#total").html(pageInfo.totalCount);
					$("#unused").html(pageInfo.ongoing);
					$("#used").html(pageInfo.success);
					// $("#refund").html(pageInfo.refunded+pageInfo.closed);
					$("#refund").html(pageInfo.refunded);
					$("#recei1").html(pageInfo.recei1);
					$("#recei2").html(pageInfo.recei2);
					$("#tobeuse").html(pageInfo.tobeuse);
					$("#closed").html(pageInfo.closed);
					$("#unpaid").html(pageInfo.unpaid);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
