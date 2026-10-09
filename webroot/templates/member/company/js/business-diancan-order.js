/**
 * 会员中心商家点评
 * by guozi at: 20170328
 */

var objId = $("#list"), isload = false;
$(function(){

	getList(1);

	$("#stateCon li").click(function(){
		if(isload) return;
		$(this).addClass("active").siblings().removeClass("active");
		getList(1);
	})

});

function getList(is){

	if(isload) return;

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	var state = $("#stateCon li.active").attr("data-id");

	isload = true;
	$.ajax({
		url: masterDomain+"/include/ajax.php?service=business&action=diancanOrder&u=1&page="+atpage+"&pageSize="+pageSize+"&state="+state,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {

			// return;
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item       = [],
									id         = list[i].id,
									ordernum   = list[i].ordernum,
									orderstate = list[i].state,
									table      = list[i].table,
									people     = list[i].people,
									orderdate  = huoniao.transTimes(list[i].pubdate, 1),
									amount     = list[i].amount,
									user       = list[i].user;

							var detailUrl = editUrl.replace("%id%", id);
							var fhUrl = detailUrl.indexOf("?") > -1 ? detailUrl + "&rates=1" : detailUrl + "?rates=1";
							var stateInfo = btn = "";

							switch(orderstate){
								// case "1":
								// 	stateInfo = "<span class='state1'>已完成</span>";
								// 	totalCount = pageInfo.totalCount;
								// 	break;
								case "3":
									stateInfo = "<span class='state3'>"+langData['siteConfig'][9][12]+"</span>";
									totalCount = pageInfo.totalAudit;
									break;
								case "0":
									stateInfo = "<span class='state4'>"+langData['siteConfig'][9][11]+"</span>";
									totalCount = pageInfo.totalGray;
									break;
								default :
									totalCount = pageInfo.totalCount;
									break;
							}

							html.push('<table data-id="'+id+'"><colgroup><col style="width:50%;"><col style="width:30%;"><col style="width:20%;"></colgroup>');
							html.push('<thead><tr class="placeh"><td colspan="2">');
							html.push('<span class="dealtime" title="'+orderdate+'">'+orderdate+'</span>');
							html.push('<span class="number">'+langData['siteConfig'][19][308]+'：<a href="'+detailUrl+'">'+ordernum+'</a></span>');
							// var memberHtml = user.name;
							// html.push('<span class="store">'+memberHtml+'</span>');
							html.push('</td>');
							html.push('<td colspan="1"></td></tr></thead>');
							html.push('<tbody>');

							cla = "";
							html.push('<tr'+cla+'>');
							html.push('<td class="nb"><div class="info"><a href="'+detailUrl+'" class="pic"><img src="'+(user.photo != '' ? huoniao.changeFileSize(user.photo, "small") : '/static/images/default_user.jpg')+'" /></a><div class="txt"><p>'+user.name+'</p><span style="color:#f60;font-weight:bold;">'+table+'</span>'+langData['siteConfig'][26][152]+'&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#f60;font-weight:bold;">'+people+'</span>'+langData['siteConfig'][13][35]+'<p></p></div></div></td>');
							html.push('<td class="nb">'+langData['siteConfig'][19][512]+'：'+amount+'</td>');
							html.push('<td class="bf" rowspan="1"><div><a href="'+detailUrl+'">'+stateInfo+'</a></div><a href="'+detailUrl+'">'+langData['siteConfig'][19][313]+'</a></td>');

							html.push('</tr>');

							html.push('</tbody>');

						}


						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					$("#total").html(pageInfo.totalCount);
					showPageInfo();

					$("#total").text(pageInfo.totalCount);
					$("#unused").text(pageInfo.totalGray);
					$("#recei").text(pageInfo.totalAudit);

				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}

			isload = false;

		}
	});
}
