/**
 * 会员中心——经纪人套餐记录
 * by guozi at: 20150627
 */

var objId = $("#list");
$(function(){

	$(".main-tab li[data-id='"+state+"']").addClass("curr");

	getList(1);
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){   //你确定要删除这条信息吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: "/include/ajax.php?service=house&action=updateHistory&type=del&id="+id,
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
	objId.delegate(".btn_group a", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-id");
		if(id){
			// $.dialog.confirm(langData['siteConfig'][20][543], function(){   //你确定要删除这条信息吗？
				var otype = t.attr('data-type');
				$.ajax({
					url: "/include/ajax.php?service=house&action=updateHistory&type=update&status="+otype+"&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							$.dialog({
	    						title: langData['siteConfig'][19][287],
	    						icon: 'success.png',
	    						content: data.info,
	    						ok: function(){
	    							getList(1)
	    						}
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
			// });
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
		url: "/include/ajax.php?service=house&action=getRecord&type=2&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$("#total").html(0);
					objId.html("<p class='loading noData'><s></s>"+langData['siteConfig'][20][126]+"</p>");   //暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item     = [],
									id       = list[i].id,
									date     = list[i].date,
									ordernum = list[i].ordernum,
									totalprice = list[i].totalprice,
									config = list[i].config,
									paytype   = list[i].paytype;

							if(i == 0){
								html.push('<table class="oh"> <colgroup> <col style="width:40%;"> <col style="width:15%;"> <col style="width:20%;"> <col style="width:10%;"> <col style="width:15%;"> </colgroup> <thead> <th class="tl">房源信息</th> <th>客户信息</th>  <th>最近访问时间</th> <th>状态</th> <th>操作</th> </thead> <tbody>');
								//房源信息---客户信息---最近访问时间---状态---操作
							}

							html.push('<tr data-id="'+id+'">');
					  	html.push('	<td class="tl"><div class="lp_img"><img src="'+list[i].litpic+'" onerror="this.src=\'/static/images/404.jpg\'"></div><h4>'+list[i].title+'</h4></td>');
					  	html.push('	<td><h3>'+list[i].username+'</h3><p>'+list[i].phone+'</p></td>');
					  	html.push('	<td class="grey">'+list[i].date+'</td>');
              if(list[i].status == '0'){
                html.push('	<td class="blue state_txt">未联系</td>');
              }else if(list[i].status == '1'){
                html.push('	<td class=" state_txt">已联系</td>');
              }else{
                html.push('	<td class=" state_txt">号码无效</td>');
              }
					  	html.push('	<td>');
               if(list[i].status == '0'){

                 html.push('<div class="change_state"><s></s>标记 <div class="btn_group"><a href="javascript:;" data-type="1">已联系</a><a href="javascript:;"  data-type="2">号码无效</a></div></div>');  //删除
               }else{
                 html.push('<a href="javascript:;" class="del"><s></s>删除</a>');  //删除

               }
				  		html.push('	</td>');
					  	html.push('</tr>');

					  	if(i + 1 == list.length){
						  	html.push('</tobdy>');
						  	html.push('</table>');
						  }

						}
						objId.html(html.join(""));
					}else{
						objId.html("<p class='loading  noData'><s></s>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
					}

					totalCount = pageInfo.totalCount;

					$("#total").html(pageInfo.totalCount);

					showPageInfo();
				}
			}else{
				$("#total").html(0);
				objId.html("<p class='loading  noData'><s></s>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
			}
		}
	});
}
