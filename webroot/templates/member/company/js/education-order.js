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
					url: masterDomain+"/include/ajax.php?service=education&action=receipt&id="+id,
					type: "GET",
					dataType: "jsonp",
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
		url: "/include/ajax.php?service=education&action=orderList&store=1&page="+atpage+"&pageSize="+pageSize,
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
						html.push('<td>'+langData['siteConfig'][19][642]+'</td>');
						html.push('<td>'+langData['siteConfig'][19][56]+'</td>');
						html.push('<td>报名课程</td>');
						html.push('<td>课程价格</td>');
						html.push('<td>'+langData['siteConfig'][19][307]+'</td>');
						html.push('</tr></thead>');

						for(var i = 0; i < list.length; i++){
							var item      = [],
									id       = list[i].id,
									aid      = list[i].aid,
									title    = list[i].title,
									date     = list[i].date,
									people = list[i].people,
									contact   = list[i].contact,
									sex        = list[i].member.sex,
									isorderstate   = list[i].orderstate,
									price   = list[i].product.price,
									coursestitle   = list[i].product.coursestitle,
									classtitle   = list[i].product.classtitle,
									pubdate  = list[i].pubdate;

							html.push('<tr data-id="'+id+'"><td class="fir"></td>');
							html.push('<td>'+people+(sex == 1 ? langData['siteConfig'][19][693] : (sex == 2 ? langData['siteConfig'][19][694] : ''))+'</td>');
							html.push('<td>'+contact+'</td>');
							html.push('	<td class="proTie"><h3>'+coursestitle+'</h3>');
						  	if(classtitle!=''){
	                            html.push('<p class="entroll_class">'+classtitle+'</p>');
	                        }
	                        html.push('	</td>');
						  	html.push('	<td>'+echoCurrency('symbol')+price+'</td>');
							if(isorderstate == 1){
								html.push('<td><button class="lx" type="button">&nbsp;&nbsp;确认&nbsp;&nbsp;</button></td>');
							}else if(isorderstate == 3){
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
