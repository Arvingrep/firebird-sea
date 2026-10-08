var objId = $("#list");
$(function(){

	$(".main-tab li[data-id='"+state+"']").addClass("curr");

	$(".main-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});

	getList(1);
	
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){   //你确定要删除这条信息吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=pension&action=booking&oper=del&id="+id,
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
		url: masterDomain+"/include/ajax.php?service=pension&action=bookingList&u=2&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$("#total").html(0);
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //  //暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item     = [],
									id       = list[i].id,
									storeaid = list[i].storeaid,
									store    = list[i].store,
									title    = list[i].title,
									date     = list[i].date,
									people   = list[i].people,
									storetel   = list[i].storetel,
									sex      = list[i].sex,
									istate   = list[i].state,
									type     = list[i].type,
									note     = list[i].note,
									detail   = list[i].detail,
									pubdate  = list[i].pubdate;


							html.push('<table data-id="'+id+'" class="oh"> <colgroup> <col style="width:5%;"> <col style="width:40%;"> <col style="width:15%;"> <col style="width:15%;"> <col style="width:15%;"> <col style="width:25%;"> </colgroup> <thead> <th></th> <th class="tl">'+langData['siteConfig'][38][94]+'</th> ');//预约机构
							html.push('<th>'+langData['siteConfig'][6][11]+'</th> ');//联系方式
							html.push('<th>'+langData['siteConfig'][19][424]+'</th> ');//预约日期
							html.push('<th>'+langData['siteConfig'][6][11]+'</th> </thead> <tbody>');//操作
							

							var url = detialUrl.replace('#id', store);

							var hDetail = '';
							try{
								if(storeaid == store){
									hDetail = '<a href="'+url+'" class="title" target="_blank" title="'+title+'">'+title+'</a>';
								}
							}catch(err){
								hDetail = '<p class="title" title="'+langData['siteConfig'][31][122]+'">'+title+'</p>';   //该房源已删除或状态异常，暂时无法查看
							}

							html.push('<tr>');
					  	html.push('	<td></td>');
						  html.push('	<td class="tl">'+hDetail+'<p class="user">'+storetel+'</p></td>');
						html.push('	<td>'+storetel+'</td>');
					  	html.push('	<td>'+huoniao.transTimes(pubdate,1)+'</td>');
					  	html.push('	<td>');
					  	html.push('		<a href="javascript:;" class="del"></a>');
				  		html.push('	</td>');
					  	html.push('</tr>');
					  	html.push('</tobdy>');
					  	html.push('</table>');
							
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
