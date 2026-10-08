/**
 * 会员中心贴吧帖子列表
 * by guozi at: 20161124
 */

var objId = $("#list");
$(function(){

	getList(1);

});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');//加载中，请稍候
	$(".pagination").hide();

	$.ajax({
		url: "/include/ajax.php?service=renovation&action=zhaobiao&u=1&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					totalCount = pageInfo.totalCount;
					//拼接列表
					if(list.length > 0){

						for(var i = 0; i < list.length; i++){
							var item     = [],
								id       = list[i].id,
								title    = list[i].title,															
								url      = list[i].url,								
								pubdate  = huoniao.transTimes(list[i].pubdate, 1);							

							html.push('<div class="item fn-clear" data-id="'+id+'">');
							
								html.push('<div class="o"><p class="inv_price">'+list[i].budget+'</p></div>');
								//
							
							html.push('<div class="i">');

							var arcrank = "";
							if(list[i].state == "0"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['renovation'][14][67]+'</span>'; //招标中
							}else if(list[i].state == "2"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['renovation'][14][68]+'</span>';//招标结束
							}

							html.push('<p>'+pubdate+arcrank+'</p>');
							html.push('<h5><a href="'+imgtextUrl+id+'" target="_blank" title="'+title+'">'+title+'</a></h5>');
				
							html.push('<p>'+list[i].address+'&nbsp;&nbsp;·&nbsp;&nbsp;<a href="'+imgtextUrl+id+'" target="_blank" title="'+title+'">'+langData['renovation'][8][32]+'</a></p>');
							//招标详情
							html.push('</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
					}

					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
			}
		}
	});
}
