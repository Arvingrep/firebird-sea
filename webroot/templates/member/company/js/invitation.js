/**
 * 会员中心邀请记录管理
 * by guozi at: 20160530
 */

var objId = $("#list");
$(function(){

	getList(1);

});

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=job&action=invitationList&type=company&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

						for(var i = 0; i < list.length; i++){
							var item  = [],
									id    = list[i].aid,
									detail = list[i].resume,
									date  = list[i].date;

							html.push('<tr><td class="fir">&nbsp;</td>');
							html.push('<td><a href="'+detail['url']+'" target="_blank"><img src="'+detail['photo']+'" width="50" />'+detail['name']+'</a></td>');
							html.push('<td><a href="'+list[i]['post'].url+'" target="_blank">'+list[i]['post'].title+'</a></td>');
							html.push('<td>'+(detail['sex'] == 0 ? langData['siteConfig'][13][4] : langData['siteConfig'][13][5])+'</td>');
							html.push('<td>'+detail['age']+'</td>');
							html.push('<td>'+detail['home']+'</td>');
							html.push('<td>'+detail['workyear']+langData['siteConfig'][13][14]+'</td>');
							html.push('<td>'+detail['educationalname']+'</td>');
							html.push('<td>'+detail['college']+'</td>');
							html.push('<td>'+list[i].date+'</td>');
							html.push('</tr>');

						}

						objId.html('<table><thead class="thead"><tr><th class="fir">&nbsp;</th><th>'+langData['siteConfig'][19][4]+'</th><th>'+langData['siteConfig'][26][164]+'</th><th>'+langData['siteConfig'][19][7]+'</th><th>'+langData['siteConfig'][19][12]+'</th><th>'+langData['siteConfig'][19][769]+'</th><th>'+langData['siteConfig'][26][165]+'</th><th>'+langData['siteConfig'][19][165]+'</th><th>'+langData['siteConfig'][19][144]+'</th><th>'+langData['siteConfig'][23][110]+'</th></tr></thead><tbody>'+html.join("")+'</tbody></table>');

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalCount = pageInfo.totalCount;
					$("#totalCount").html(totalCount);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
