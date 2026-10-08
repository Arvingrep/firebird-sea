/**
 * 会员中心——经纪人套餐记录
 * by guozi at: 20150627
 */

var objId = $("#list");
$(function(){

	$(".main-tab li[data-id='"+state+"']").addClass("curr");

	getList(1);

	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){   //你确定要删除这条信息吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=house&action=delMealOrder&id="+id,
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
						$.dialog.alert(langData['siteConfig'][20][183]);   //网络错误，请稍候重试！
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

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');   //加载中，请稍候
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=house&action=mymeal&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$("#total").html(0);
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");   //暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item     = [],
									id       = list[i].id,
									date     = list[i].date,
									ordernum = list[i].ordernum,
									totalprice = list[i].totalprice,
									config = list[i].config,
									paytype   = list[i].paytype;

							if(i == 0){
								html.push('<table class="oh"> <colgroup> <col style="width:20%;"> <col style="width:10%;"> <col style="width:10%;"> <col style="width:15%;"> <col style="width:15%;"> <col style="width:10%;"> <col style="width:10%;"> </colgroup> <thead> <th class="tl">'+langData['siteConfig'][19][308]+'</th> <th>'+langData['siteConfig'][19][306]+'</th> <th>'+langData['siteConfig'][19][545]+'</th> <th>'+langData['siteConfig'][31][118] +'</th> <th>'+langData['siteConfig'][19][51] +'</th> <th>'+langData['siteConfig'][19][296]+'</th> <th>'+langData['siteConfig'][6][11]+'</th> </thead> <tbody>');
								//订单号---金额---套餐---套餐时长---下单时间---支付方式---操作
							}

							html.push('<tr data-id="'+id+'">');
					  	html.push('	<td class="tl">'+ordernum+'</td>');
					  	html.push('	<td>'+totalprice+'</td>');
					  	html.push('	<td>'+config.name+'<br>'+langData['siteConfig'][16][26]+'：'+config.house+'<br>'+langData['siteConfig'][16][70]+'：'+config.refresh+'<br>'+langData['siteConfig'][19][762]+'：'+config.settop+'</td>');
					  	//房源---刷新---置顶
					  	html.push('	<td>'+config.time+langData['siteConfig'][13][31]+'</td>');   //个月
					  	html.push('	<td>'+huoniao.transTimes(date, 1)+'</td>');
					  	html.push('	<td>'+paytype+'</td>');
					  	html.push('	<td>');
					  	html.push('		<a href="javascript:;" class="link del" style="margin-left:0;">'+langData['siteConfig'][6][8]+'</a>');  //删除
				  		html.push('	</td>');
					  	html.push('</tr>');

					  	if(i + 1 == list.length){
						  	html.push('</tobdy>');
						  	html.push('</table>');
						  }
							
						}
						objId.html(html.join(""));
					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
					}

					totalCount = pageInfo.totalCount;

					$("#total").html(pageInfo.totalCount);

					showPageInfo();
				}
			}else{
				$("#total").html(0);
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
			}
		}
	});
}
