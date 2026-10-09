/**
 * 会员中心旅游订单列表
 * by zmy at: 20210422
 */

var objId = $("#list");
$(function(){
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

	//同意退款
	objId.delegate(".refund_sure", "click", function(){
		$('.agreekuanWrap').css('display','flex');
    	$('.agreelegouMask').show();
    	var pdid = $(this).closest("table").attr('data-id');
    	$('.agreekuanWrap .sureTuikuan').attr('data-id',pdid);
	});	

	//同意退款--同意
	$('.agreekuanWrap .sureTuikuan').click(function () {
        var t = $(this), id = t.attr("data-id");
        if(t.hasClass('disabled')) return false;

        if(id){
        	t.addClass('disabled');
            var data = [];
            data.push('id='+id);
            $.ajax({
                url: '/include/ajax.php?service=travel&action=refundPay',
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

    //关闭弹窗
	$(".legouComWrap .closeAlert,.agreelegouMask,.legouComWrap .cancelTui").click(function(e){
    	$('.legouComWrap').css('display','none');
    	$('.agreelegouMask').hide();

    })



});

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	var data = [];
	data.push('store=1');
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
                                typetitle     = list[i].title,
                                collecttype   = list[i].type,
                                payurl        = list[i].payurl,
                                paytype      = list[i].paytype,
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
									stateInfo = "<span class='state0'>"+langData['siteConfig'][9][22]+"</span>";//未付款
									btn = '<div><a href="javascript:;" class="chat_to-Link" data-type="user" data-chatId="29">'+langData['travel'][13][64]+'</a></div>';//联系用户
									break;
                                case "1":
                                	stateInfo = "<span class='state1'>"+langData['travel'][13][36]+"</span>";//待使用

									btn = '<div><a href="'+vertifyUrl+'" class="quanSure">'+langData['travel'][13][51]+'</a></div>';//验证券码

									break;
								case "3":
									stateInfo = "<span class='state3'>"+langData['siteConfig'][9][37]+"</span>";//交易成功
									break;

								case "7":
									stateInfo = "<span class='state7'>"+langData['siteConfig'][9][13]+"</span>";//已取消
									break;
								case "8":
									stateInfo = "<span class='state8'>"+langData['siteConfig'][9][27]+"</span>";//退款中
									btn ='<div><a href="javascript:;" class="refund_sure">'+langData['travel'][13][63]+'</a></div>';//确认退款
									break;
								case "9":
									stateInfo = "<span class='state9'>"+langData['siteConfig'][10][14]+"</span>";//退款成功
									break;
								case "10":
									stateInfo = "<span class='state10'>拒绝退款</span>";//申请平台客服
									break;
							}

							html.push('<table data-id="'+id+'"><colgroup><col style="width:38%;"><col style="width:10%;"><col style="width:7%;"><col style="width:17%;"><col style="width:16%;"><col style="width:12%;"></colgroup>');
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
							html.push('</td>');
							html.push('<td colspan="1"></td></tr></thead>');
							html.push('<tbody>');
						

							html.push('<tr class="lt">');
							html.push('<td class="nb"><div class="info productInfo"><a href="'+prourl+'" title="'+title+'" target="_blank" class="pic"><img src="'+huoniao.changeFileSize(litpic, "small")+'" /></a><div class="txt"><a href="'+prourl+'" title="'+title+'" target="_blank"><h2>'+typetitle+'</h2><div class="timeDiv">');
							html.push('<p>'+title+'</p>');
							html.push('<td class="nb">'+ orderprice +'</td>');
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
						case "10":
							totalCount = pageInfo.state10;
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
					$("#state10").html(pageInfo.state10);


					showPageInfo();
				}
			}else{
				$(".main-sub-tab, .oh").hide();
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
			}
		}
	});
}
