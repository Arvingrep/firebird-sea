var objId = $("#list");
$(function(){

	getList(1);

	//操作
	objId.delegate(".lx", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][27][79], function(){
				t.addClass("load");

				$.ajax({
					url: "/include/ajax.php?service=renovation&action=updateZhaobiao&id="+id,
					type: "GET",
					dataType: "json",
					success: function (data) {
						if(data && data.state != 200){
							t.parent().html(langData['siteConfig'][26][146]);
						}else{
							$.dialog.alert(langData['siteConfig'][27][77]);
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);
						t.removeClass("load");
					}
				});
			});
		}
	});

});

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=renovation&action=zhaobiao&u=1&b=1&company="+Identity.store.id+"&page="+atpage+"&pageSize="+pageSize,
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

						html.push('<table><thead><tr><td class="fir"></td>');
						html.push('<td class="row8">'+langData['siteConfig'][19][642]+'</td>');//联系人
						html.push('<td class="row10">'+langData['siteConfig'][19][56]+'</td>');//联系电话
						html.push('<td class="row8">'+langData['renovation'][15][33]+'</td>');//房屋面积
						html.push('<td class="row8">'+langData['renovation'][1][34]+'</td>');//装修预算
						html.push('<td class="row10">'+langData['renovation'][2][17]+'</td>');//小区名字
						html.push('<td>'+langData['renovation'][1][33]+'</td>');//详细地址
						html.push('<td>'+langData['siteConfig'][19][304]+'</td>');//申请时间
						html.push('<td class="row10">'+langData['siteConfig'][19][307]+'</td>');//状态
						html.push('<td  class="row8">'+langData['siteConfig'][6][11]+'</td>');//操作
						html.push('</tr></thead>');

						for(var i = 0; i < list.length; i++){
							var item      = [],
									id        = list[i].id,
									area      = list[i].area,
									budget    = list[i].budget,
									address   = list[i].address,
									people    = list[i].people,
									tel       = list[i].contact,
									community       = list[i].community,
									pubdate   = huoniao.transTimes(list[i].pubdate, 1),
									state     = list[i].state;

							html.push('<tr data-id="'+id+'"><td class="fir"></td>');
							html.push('<td>'+people+'</td>');
							html.push('<td>'+tel+'</td>');
							html.push('<td>'+area+echoCurrency('areasymbol')+'</td>');
							html.push('<td>'+budget+'</td>');
							html.push('<td>'+community+'</td>');
							html.push('<td>'+address+'</td>');
							html.push('<td>'+pubdate+'</td>');
							var classn ="";
							switch (list[i].state ) {
								case '0':
									statename = "招标审核中";
									break;
								case '1':
									statename = "招标中";
									break;
								case '2':
									statename = "招标成功";
									break;
								case '3':
									statename = "招标结束";
									classn 	  = "over";
									break;
								case '4':
									statename = "停止结束";
									classn 	  = "over";
									break;
							}
							//状态 招标中 招标结束

							html.push('<td class="'+classn+'">'+statename+'</td>');

							if(list[i].contacstate == 0){
								html.push('<td><button class="lx" type="button">&nbsp;&nbsp;'+langData['siteConfig'][6][0]+'&nbsp;&nbsp;</button></td>');//确认
							}else{
								html.push('<td>'+langData['siteConfig'][26][146]+'</td>');
							}
							html.push('</tr>');


						}

						objId.html(html.join("")+"</table>");

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalCount = pageInfo.totalCount;

					$("#total").html(pageInfo.totalCount);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
