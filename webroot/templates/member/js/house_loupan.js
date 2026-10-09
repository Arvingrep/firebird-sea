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

function getList(is,keywords){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	if(!keywords){
		keywords = '';
	}
	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');   //加载中，请稍候
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=house&action=loupanList&fenxiaobb=1&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
    	data:"keywords="+keywords,
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
							var item = [],
								id = list[i].id,
								date = list[i].date,
								ordernum = list[i].ordernum,
								totalprice = list[i].totalprice,
								config = list[i].config,
								address = list[i].address,
								title = list[i].title,
								fenxiaotitle = list[i].fenxiaotitle,
								fenxiaotime = list[i].fenxiaotime,
								paytype = list[i].paytype;

							if(i == 0){
								html.push('<table class="oh" style="table-layout:fixed"> <colgroup> <col style="width:18%;"> <col style="width:25%;"> <col style="width:12%;"> <col style="width:15%;"> </colgroup> <thead> <th class="tl">楼盘名称</th> <th class="tl">佣金说明</th> <th>有效时间</th> <th>操作</th> </thead> <tbody>');
								//订单号---金额---套餐---套餐时长---下单时间---支付方式---操作
							}

							html.push('<tr data-id="'+id+'">');
					  	html.push('	<td class="tl"><h2><a href="'+list[i].url+'" target="_blank">'+title+'</a></h2><p>'+address+'</p></td>');
					  	html.push('	<td class="tl">'+fenxiaotitle+'</td>');


					  	html.push('	<td class="">'+fenxiaotime+' </td>');
					  	html.push('	<td>');
					  	html.push('		<a href="'+addUrl+'?id='+id+'" class="addbb" style="margin-left:0;"><s></s>添加报备</a>');  //删除
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


// 搜索
$(".search_btn").click(function(){
  var keyword = $("#search").val()
  getList(1,keyword)
})
