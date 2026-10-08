/**
 * 已消费团购券列表
 * by guozi at: 20151008
 */

var objId = $("#list");
$(function(){

	getList(1);

	//撤消
	objId.delegate(".cancel", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-id");
		if(id && t.attr("disabled") != "disabled"){
			$.dialog.confirm(langData['siteConfig'][20][457], function(){
				t.addClass("load").html(langData['siteConfig'][7][8]+"...").attr("disabled", true);

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=tuan&action=cancelQuan&ids="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state != 200){

							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();

								setTimeout(function(){getList(1);}, 200);
							});

						}else{
							$.dialog.alert(langData['siteConfig'][27][122]);
							t.removeClass("load").html(langData['siteConfig'][26][175]).attr("disabled", false);
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);
						t.removeClass("load").html(langData['siteConfig'][26][175]).attr("disabled", false);
					}
				});
			});
		}
	});

});

function getQueryVariable(variable){
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
           var pair = vars[i].split("=");
           if(pair[0] == variable){return pair[1];}
       }
       return '';
}

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

    var ordernum = getQueryVariable('ordernum');

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=tuan&action=quanList&ordernum="+ordernum+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

						for(var i = 0; i < list.length; i++){
							var item     = [],
									id       = list[i].id,
									ordernum = list[i].ordernum,
									cardnum  = list[i].cardnum,
									usedate  = huoniao.transTimes(list[i].usedate, 1),
									pro      = list[i].pro,
									title    = pro.title,
									url      = pro.url,
									price    = list[i].price,
									product  = title != "" ? '<a href="'+url+'" target="_blank">'+title+'</a>' : "";

							html.push('<tr data-id="'+id+'"><td class="fir"></td>');
							html.push('<td>'+ordernum+'</td>');
							html.push('<td>'+cardnum+'</td>');
							html.push('<td>'+usedate+'</td>');
							html.push('<td>'+product+'</td>');
							html.push('<td>'+price+'</td>');
							html.push('<td><a href="javascript:;" class="cancel">'+langData['siteConfig'][26][175]+'</a></td>');
							html.push('</tr>');

						}

						objId.html('<table><thead class="thead"><tr><th class="fir"></th><th width="180">'+langData['siteConfig'][19][308]+'</th><th width="180">'+langData['siteConfig'][5][15]+'</th><th width="200">'+langData['siteConfig'][26][176]+'</th><th>'+langData['siteConfig'][26][177]+'</th><th width="150">'+langData['siteConfig'][19][428]+'</th><th width="150">'+langData['siteConfig'][6][11]+'</th></tr></thead><tbody>'+html.join("")+'</tbody></table>');

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalCount = pageInfo.totalCount;
					$("#total").html(totalCount);
					showPageInfo();
				}
			}else{
				$("#total").html(0);
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
