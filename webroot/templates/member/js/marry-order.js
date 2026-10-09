/**
 * 会员中心婚嫁预约 套餐咨询记录
 * by zmy at: 2021-4-6
 */

var objId = $("#list");
$(function(){
	$(".main-tab li[data-id='"+state+"']").addClass("curr");
	getList(1);

});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');//加载中，请稍候
	$(".pagination").hide();
    if (state == 1) {
                 
		url = "/include/ajax.php?service=marry&action=getrese&u=1&page="+atpage+"&pageSize="+pageSize;

    }else{
		 url = "/include/ajax.php?service=marry&action=getContactlog&u=1&page="+atpage+"&pageSize="+pageSize;
	}

	$.ajax({
		url: url,
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
								id      = list[i].id,
								companyid      = list[i].company,
								title    = list[i].title;
								var stUrl = state==1?storeUrl.replace('%id%',companyid):list[i].link;
								var litpic = state==1?list[i].litpic:list[i].img;
                            	var pubdate  = state==1?huoniao.transTimes(list[i].pubdate, 1):huoniao.transTimes(list[i].date, 1);
								html.push('<tr><td class="fir"></td>');
								html.push('<td><a href="'+stUrl+'" target="_blank" title="'+title+'">'+title+'</a></td>');
								html.push('<td>'+pubdate+'</td>');
								html.push('</tr>');								                           

						}
						if(state == 1){
							objId.html('<table><thead class="thead"><tr><th class="fir"></th><th>'+langData['marry'][8][54]+'</th><th>'+langData['marry'][8][55]+'</th></tr></thead><tbody>'+html.join("")+'</tbody></table>');
							//商家名称---提交时间
						}else{
							objId.html('<table><thead class="thead"><tr><th class="fir"></th><th>'+langData['marry'][3][12]+'</th><th>'+langData['marry'][8][55]+'</th></tr></thead><tbody>'+html.join("")+'</tbody></table>');
							//套餐名称---提交时间
						}
						

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
