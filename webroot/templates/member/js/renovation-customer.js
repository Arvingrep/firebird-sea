/**
 * 会员中心——装修客户管理
 * by guozi at: 20150627
 */

var objId = $("#list");
$(function(){


	getList(1);
	//标记为已联系
	objId.delegate(".bj", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id"), title, newstate = 1;
		if(id){

			$.dialog.confirm(langData['renovation'][15][71], function(){//确定要该条信息改为已联系吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: "/include/ajax.php?service=renovation&action=updateRese&type="+Identity.typeid+"&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//异步获取最新列表							
							setTimeout(function(){getList(1);}, 200);
							

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
					url: "/include/ajax.php?service=renovation&action=delRese&type="+Identity.typeid+"&id="+id,
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
		url: "	/include/ajax.php?service=renovation&action=rese&type="+Identity.typeid+"&bid="+Identity.id+"&atpage="+atpage +"&pageSize="+pageSize,
		type: "GET",
		dataType: "json",
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
								contact      = list[i].contact,
									community    = list[i].community,
								    people = list[i].people,
									mobile   = list[i].mobile,
									istate    = list[i].state,
									pubdate  = huoniao.transTimes(list[i].pubdate, 1);


							html.push('<table data-id="'+id+'" class="oh"> <colgroup> <col style="width:3%;"> <col style="width:10%;"> <col style="width:30%;"> <col style="width:15%;"> <col style="width:20%;"> <col style="width:5%;"><col style="width:17%;"> </colgroup> <thead> <th></th> <th class="tl">'+langData['renovation'][15][69]+'</th> <th>'+langData['renovation'][4][5]+'</th><th>'+langData['renovation'][8][20]+'</th> <th>'+langData['siteConfig'][31][119]+'</th><th>'+langData['siteConfig'][19][307]+'</th> <th class="speTh">'+langData['siteConfig'][6][11]+'</th> </thead> <tbody>');
							//客户--小区--联系电话--预约时间--状态--操作

							html.push('<tr>');
						  	html.push('	<td></td>');
						  	html.push('	<td>'+people+'</td>');
						  	html.push('	<td>'+community+'</td>');
						  	html.push('	<td>'+contact+'</td>');
						  	html.push('	<td>'+pubdate+'</td>');
						  	if(istate == "0"){
						  		html.push('	<td class="colorTd">'+langData['renovation'][15][70]+'</td>');//未联系
						  	}else{
								html.push('	<td class="colorTd">'+langData['siteConfig'][26][146]+'</td>');//已联系
						  	}
						  	html.push('	<td class="speTd">');
						  	if(istate == "0"){
							  	html.push('		<span class="bj state0">'+langData['siteConfig'][26][146]+'</span>');  //已联系
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
