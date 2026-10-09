/**
 * 会员中心——教育培训 报名管理
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
			}
			$.dialog.confirm(title, function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: "/include/ajax.php?service=education&action=receipt&id="+id,
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

});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');   //加载中，请稍候 
	$(".pagination").hide();

	$.ajax({
		url: "/include/ajax.php?service=education&action=orderList&store=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
									people = list[i].people,
									contact   = list[i].contact,
									sex        = list[i].member.sex,
									isorderstate   = list[i].orderstate,
									price   = list[i].product.price,
									coursestitle   = list[i].product.coursestitle,
									classtitle   = list[i].product.classtitle,
									pubdate  = list[i].pubdate;


							html.push('<table data-id="'+id+'" class="oh"> <colgroup> <col style="width:5%;"> <col style="width:20%;"> <col style="width:35%;"> <col style="width:15%;"> <col style="width:15%;"> <col style="width:25%;"> </colgroup> <thead> <th></th> <th class="tl">报名客户</th> <th>报名课程</th> <th>课程价格</th> <th>'+langData['siteConfig'][6][11]+'</th> </thead> <tbody>');
							//报名客户--报名课程--课程价格--操作

							html.push('<tr>');
					  	html.push('	<td></td>');
					  	html.push('	<td class="tl"><p class="user">'+people+(sex == 1 ? langData['siteConfig'][19][693] : (sex == 2 ? langData['siteConfig'][19][694] : ''))+'&nbsp;&nbsp;'+contact+'</p></td>');  
					  	//先生--女士
					  	html.push('	<td class="proTie"><h3>'+coursestitle+'</h3>');
					  	if(classtitle!=''){
                            html.push('<p class="entroll_class">'+classtitle+'</p>');
                        }
                        html.push('	</td>');
					  	html.push('	<td>'+echoCurrency('symbol')+price+'</td>');
					  	html.push('	<td>');
					  	if(isorderstate == "1"){
						  	html.push('		<span class="bj state0" title="标记为已联系"><em></em>'+langData['siteConfig'][6][138]+'</span>');  //标记为已联系---标记
						  }else if (isorderstate == "3"){
						  	html.push('		<span class="state1">'+langData['siteConfig'][26][146]+'</span>');//点击标记为未联系---已联系
						  }
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
