/**
 * 会员中心-经纪人收到的房源委托
 * by guozi at: 20150627
 */

var objId = $("#list");
$(function(){

	$(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("active") && !t.hasClass("add")){
			type = id;
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
			getList(1);
		}
	});

	getList(1);


	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){
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
						$.dialog.alert(langData['siteConfig'][20][183]);
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});

  // 改变状态
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
		$('html, body').animate({scrollTop: $(".nav-tabs").offset().top}, 300);
	}else{
		atpage = 1;
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: "/include/ajax.php?service=house&action=getRecord&type=3&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$(".nav-tabs li span").html(0);
					objId.html("<p class='loading noData'><s></s>"+langData['siteConfig'][20][126]+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					$('#total').text(pageInfo.totalCount);
					//拼接列表
					if(list.length > 0){
            	html.push('<table > <colgroup> <col style="width:30%;"> <col style="width:12%;"> <col style="width:12%;"> <col style="width:10%;"> <col style="width:16%;"> <col style="width:10%;"> <col style="width:20%;"> </colgroup> <thead> <th>房源信息</th> <th>用户昵称</th> <th>联系电话</th> <th>所属经纪人</th> <th>最近访问时间</th> <th>状态</th> <th>操作</th> </thead>');
              html.push('<tbody>');
						for(var i = 0; i < list.length; i++){

							html.push('<tr data-id="'+list[i].id+'">');
					  	html.push('	<td><a href="'+list[i].url+'">'+list[i].title+'</a></td>');
					  	html.push('	<td>'+list[i].username+'</td>');
					  	html.push('	<td>'+list[i].phone+'</td>');
					  	html.push('	<td class="grey">'+list[i].jjusername+'</td>');
					  	html.push('	<td class="grey">'+list[i].date+'</td>');

              if(list[i].status == '0'){
                html.push('	<td><p class="blue">未联系</p></td>');
              }else if(list[i].status == '1'){
                html.push('	<td><p class="title">已联系</p></td>');
              }else{
                html.push('	<td><p class="title">号码无效</p></td>');
              }

						  html.push('	<td class="o">');
              if(list[i].status == '0'){

                html.push('<div class="change_state"><s></s>标记 <div class="btn_group"><a href="javascript:;" data-type="1">已联系</a><a href="javascript:;"  data-type="2">号码无效</a></div></div>');  //删除
              }else{
                html.push('<a href="javascript:;" class="del"><s></s>删除</a>');  //删除

              }
					  	html.push('	</td>');
					  	html.push('</tr>');

						}
            html.push('</tobdy>');
            html.push('</table>');
						objId.html(html.join(""));
					}else{
						objId.html("<p class='loading noData'><s></s>"+langData['siteConfig'][20][126]+"</p>");
					}

					if(type == ''){
						totalCount = pageInfo.totalCount;
					}

					$("#total").html(pageInfo.totalCount);

					showPageInfo();
				}
			}else{
				$("#total").html(0);
				objId.html("<p class='loading noData'><s></s>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
