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
			$.dialog.confirm(langData['siteConfig'][30][52], function(){//确定删除订单？<br />删除后本订单将从订单列表消失，且不能恢复。
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=integral&action=cancelOrder&id="+id,
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

	//收货
	objId.delegate(".sh", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][545], function(){//确定要收货吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=integral&action=receipt&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							t.removeClass("load").html(langData['siteConfig'][6][108]);  //确认成功
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
		url: masterDomain+"/include/ajax.php?service=integral&action=orderList&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
								orderdate  = huoniao.transTimes(list[i].orderdate, 1),
								payUrl     = list[i].payUrl,
								paytype    = list[i].paytype,
								totalPayPrice  = list[i].totalPayPrice,
								freight    = list[i].freight,
								product = list[i].product;

							var detailUrl = durl.replace("%id%", id);
							var refundlUrl = rUrl.replace("%id%", id);
							var commentUrl = cUrl.replace("%id%", id);
							var stateInfo = btn = "";

							switch(orderstate){
								case "0":
									stateInfo = "<span class='state0'>"+langData['siteConfig'][9][22]+"</span>";//未付款
									btn = '<div><a href="'+payUrl+'" class="edit" target="_blank">'+langData['siteConfig'][6][64]+'</a></div>'+//立即付款
									'<div><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][65]+'</a></div>';//取消订单
									break;
								case "1":
									stateInfo = "<span class='state1'>"+langData['siteConfig'][39][1]+"</span>";//已接单，待发货
									//btn = '<div><a href="'+refundlUrl+'" target="_blank">申请退款</a></div>';
									break;
								case "3":
									stateInfo = "<span class='state3'>"+langData['siteConfig'][9][37]+"</span>";//交易成功
									break;
								case "4":
									stateInfo = "<span class='state4'>"+langData['siteConfig'][9][27]+"</span>";//退款中
									break;
								case "6":
									stateInfo = "<span class='state6'>"+langData['siteConfig'][9][58]+"</span>";//已发货
									btn = '<a href="javascript:;" class="sh">'+langData['siteConfig'][6][45]+'</a>';//确认收货
									break;
								case "7":
									stateInfo = "<span class='state7'>"+langData['siteConfig'][9][34]+"</span>";//退款成功
									break;
								case "10":
									stateInfo = "<span class='state10'>"+langData['siteConfig'][6][15]+"</span>";//关闭
									break;
							}

							// html.push('<table data-id="'+id+'"><colgroup><col style="width:38%;"><col style="width:10%;"><col style="width:7%;"><col style="width:17%;"><col style="width:16%;"><col style="width:12%;"></colgroup>');
							html.push('<table data-id="'+id+'"><colgroup><col style="width:28%;"><col style="width:20%;"><col style="width:7%;"><col style="width:15%;"><col style="width:10%;"><col style="width:13%;"><col style="width:10%;"></colgroup>');
							html.push('<thead><tr class="placeh"><td></td><td></td><td></td><td></td><td></td><td></td></tr><tr><td colspan="6">');
							html.push('<span class="dealtime" title="'+orderdate+'">'+orderdate+'</span>');
							html.push('<span class="number">'+langData['siteConfig'][19][308]+'：<a target="_blank" href="'+detailUrl+'">'+ordernum+'</a></span>');//订单号
							var storeHtml = '';
							html.push('<span class="store">'+storeHtml+'</span>');
							html.push('</td>');
							html.push('<td colspan="1"></td></tr></thead>');

							html.push('<tbody>');
							html.push('    <tr class="lt">');
							html.push('        <td class="nb">');
							html.push('            <div class="info">');
							html.push('                <a href="'+product.url+'" title="'+product.title+'" target="_blank" class="pic">');
							html.push('                    <img src="'+huoniao.changeFileSize(product.litpic, "small")+'"></a>');
							html.push('                <div class="txt">');
							html.push('                    <a href="'+product.url+'" title="'+product.title+'" target="_blank">'+product.title+'</a>');
							html.push('                    <p>');
							html.push('                    </p>');
							html.push('                </div>');
							html.push('            </div>');
							html.push('        </td>');
							html.push('        <td class="nb">'+list[i].price+langData['siteConfig'][40][44]+' + '+list[i].point+pointName+'</td>');//元
							html.push('        <td>1</td>');
							html.push('        <td class="bf" rowspan="1">');
							html.push('            <strong>'+totalPayPrice+'</strong>');
							html.push('            <div class="paytype">'+paytype+'</div></td>');
							html.push('        <td class="bf" rowspan="1" style="vertical-align: middle;">');
							html.push('            <strong>'+freight+'</strong></td>');
							html.push('        <td class="bf" rowspan="1">');
							html.push('            <div>');
							html.push('                <a href="'+detailUrl+'" target="_blank">');
							html.push('                    <span class="state1">'+stateInfo+'</span></a>');
							html.push('            </div>');
							html.push('            <a href="'+detailUrl+'" target="_blank">'+langData['siteConfig'][19][313]+'</a></td>');//订单详情
							html.push('        <td class="bf nb" rowspan="1">'+btn+'</td>');
							html.push('    </tr>');
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
					}


					$("#total").html(pageInfo.totalCount);

					if(pageInfo.unpaid == 0){
						$("#unpaid").parent().parent().hide();
					}else{
						$("#unpaid").parent().parent().show();
						$("#unpaid").html(pageInfo.unpaid);
					}

					if(pageInfo.ongoing == 0){
						$("#unused").parent().parent().hide();
					}else{
						$("#unused").parent().parent().show();
						$("#unused").html(pageInfo.ongoing);
					}

					if(pageInfo.success == 0){
						$("#used").parent().parent().hide();
					}else{
						$("#used").parent().parent().show();
						$("#used").html(pageInfo.success);
					}

					if(pageInfo.refunded == 0){
						$("#refund").parent().parent().hide();
					}else{
						$("#refund").parent().parent().show();
						$("#refund").html(pageInfo.refunded);
					}

					if(pageInfo.rates == 0){
						$("#rates").parent().parent().hide();
					}else{
						$("#rates").parent().parent().show();
						$("#rates").html(pageInfo.rates);
					}

					if(pageInfo.recei == 0){
						$("#recei").parent().parent().hide();
					}else{
						$("#recei").parent().parent().show();
						$("#recei").html(pageInfo.recei);
					}

					if(pageInfo.closed == 0){
						$("#closed").parent().parent().hide();
					}else{
						$("#closed").parent().parent().show();
						$("#closed").html(pageInfo.closed);
					}

					if(pageInfo.cancel == 0){
						$("#cancel").parent().parent().hide();
					}else{
						$("#cancel").parent().parent().show();
						$("#cancel").html(pageInfo.cancel);
					}

					showPageInfo();
				}
			}else{
				$(".main-sub-tab, .oh").hide();
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
			}
		}
	});
}
