/**
 * 会员中心——经纪人收到的看房预约
 * by guozi at: 20150627
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
				title = langData['siteConfig'][31][123];   //确定要该条信息标记为已看房吗？
				newstate = 1;
			}else{
				return;
				title = langData['siteConfig'][31][124];//确定要该条信息标记为未看房吗？
				newstate = 0;
			}
			$.dialog.confirm(title, function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=house&action=operBookHouse&type=updateState&spec=in&state="+newstate+"&id="+id,
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
					url: masterDomain+"/include/ajax.php?service=house&action=operBookHouse&type=del&spec=in&state="+state+"&id="+id,
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
		url: masterDomain+"/include/ajax.php?service=house&action=bookHouseList&u=1&spec=in&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
									mobile   = list[i].mobile,
									sex        = list[i].sex,
									istate    = list[i].state,
									type     = list[i].type,
									note     = list[i].note,
									detail   = list[i].detail,
									pubdate  = list[i].pubdate;


							html.push('<table data-id="'+id+'" class="oh"> <colgroup> <col style="width:5%;"> <col style="width:40%;"> <col style="width:15%;"> <col style="width:15%;"> <col style="width:15%;"> <col style="width:25%;"> </colgroup> <thead> <th></th> <th class="tl">'+langData['siteConfig'][31][125]+'</th> <th>'+langData['siteConfig'][31][120]+'</th> <th>'+langData['siteConfig'][31][119]+'</th> <th>'+langData['siteConfig'][6][11]+'</th> </thead> <tbody>');
							//预约客户--申请日期--预约时间--操作
							var url = detialUrl.replace('#type', type).replace('#id', aid);

							var hDetail = '';
							try{
								if(detail.id == aid){
									hDetail = '<a href="'+url+'" class="title" target="_blank" title="'+detail.title+'">'+title+'</a>';
								}
							}catch(err){
								hDetail = '<p class="title" title="'+langData['siteConfig'][31][122]+'">'+title+'</p>';  //该房源已删除或状态异常，暂时无法查看
							}

							html.push('<tr>');
					  	html.push('	<td></td>');
					  	html.push('	<td class="tl"><p class="user">'+username+(sex == 1 ? langData['siteConfig'][19][693] : (sex == 2 ? langData['siteConfig'][19][694] : ''))+'&nbsp;&nbsp;'+mobile+'</p>'+hDetail+'</td>');  
					  	//先生--女士
					  	html.push('	<td>'+pubdate+'</td>');
					  	html.push('	<td>'+date+'</td>');
					  	html.push('	<td>');
					  	if(istate == "0"){
						  	html.push('		<span class="bj state0" title="'+langData['siteConfig'][31][126]+'"><em></em>'+langData['siteConfig'][6][138]+'</span>');  //标记为已看房---标记
						  }else{
						  	html.push('		<span class="bj state1" title="'+langData['siteConfig'][31][127]+'">'+langData['siteConfig'][32][7]+'</span>');//点击标记为未看房---已看房
						  }
					  	html.push('		<a href="javascript:;" class="del"></a>');
				  		html.push('	</td>');
					  	html.push('</tr>');
					  	if(note != ''){
					  		html.push('<tr class="note"><td colspan="5">'+note+'</td></tr>');
					  	}
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
