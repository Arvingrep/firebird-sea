/**
 * 会员中心————教育培训 预约管理
 * by zmy at: 20210519
 */

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

	objId.delegate(".bj", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id"), title, newstate;
		if(id){
			if(t.hasClass('state0')){
				title = '确定要该条信息标记为已联系吗？';   //确定要该条信息标记为已联系吗？
				newstate = 1;
			}else{
				return;
				title = '确定要该条信息标记为未联系吗？';//确定要该条信息标记为未联系吗？
				newstate = 0;
			}
			$.dialog.confirm(title, function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: "/include/ajax.php?service=education&action=booking&oper=update&id="+id,
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
						$.dialog.alert(langData['siteConfig'][20][183]);     //网络错误，请稍候重试！
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){  //你确定要删除这条信息吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: "/include/ajax.php?service=education&action=booking&oper=del&id="+id,
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
						$.dialog.alert(langData['siteConfig'][20][183]); //网络错误，请稍候重试！
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
		url: "/include/ajax.php?service=education&action=bookingList&u=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
									aid      = list[i].aid,
									title    = list[i].title,
									date     = list[i].date,
									username = list[i].username,
									tel   = list[i].tel,
									sex        = list[i].sex,
									istate    = list[i].state,
									type     = list[i].type,
									note     = list[i].note,
									detail   = list[i].detail,
									pubdate  = list[i].pubdate;


							html.push('<table data-id="'+id+'" class="oh"> <colgroup> <col style="width:5%;"> <col style="width:15%;"> <col style="width:60%;"> <col style="width:20%;"> </colgroup> <thead> <th></th> <th class="tl">'+langData['siteConfig'][31][125]+'</th>  <th>联系电话</th> <th>'+langData['siteConfig'][6][11]+'</th> </thead> <tbody>');
							//预约客户--联系电话---操作


							html.push('<tr>');
					  	html.push('	<td></td>');
					  	html.push('	<td class="tl"><p class="user">'+username+(sex == 1 ? langData['siteConfig'][19][693] : (sex == 2 ? langData['siteConfig'][19][694] : ''))+'</p></td>');  
					  	//先生--女士
					  	html.push('	<td>'+tel+'</td>');
					  	html.push('	<td>');
					  	if(istate == "0"){
						  	html.push('		<span class="bj state0" title="标记为已联系"><em></em>'+langData['siteConfig'][6][138]+'</span>');  //标记为已联系---标记
						  }else{
						  	html.push('		<span class="bj state1">'+langData['siteConfig'][26][146]+'</span>');//点击标记为未看房---已联系
						  }
					  	html.push('		<a href="javascript:;" class="del"></a>');
				  		html.push('	</td>');
					  	html.push('</tr>');
					  	html.push('</tobdy>');
					  	html.push('</table>');
							
						}
						objId.html(html.join(""));
					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
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
