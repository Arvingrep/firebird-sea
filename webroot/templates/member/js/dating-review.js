/**
 * 会员中心交友私信列表
 * by guozi at: 20160608
 */

var objId = $("#list");
$(function(){

	getList(1);

	//全选
	$("#selectAll").bind("click", function(){
		$(this).is(":checked") ? $("#list input").attr("checked", true) : $("#list input").attr("checked", false);
	});


	//删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][518], function(){   //您确定要删除选中的信息吗？
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=dating&action=delReview&id="+id,
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
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);   //网络错误，请稍候重试！
						t.removeClass("load");
					}
				});
			});
		}
	});


	//删除
	$(".delSelect").bind("click", function(){
		var id = [];
		$("#list input").each(function(){
			$(this).is(":checked") ? id.push($(this).val()) : "";
		});

		if(id){
			$.dialog.confirm(langData['siteConfig'][20][518], function(){

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=dating&action=delReview&id="+id.join(","),
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							getList(1);
						}else{
							$.dialog.alert(data.info);
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);
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
	$(".opera").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=dating&action=review&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");   //暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item    = [],
									member  = list[i].member,
									info    = list[i].info;

							var is = info['isread'] == 1 ? "" : " nr";
							html.push('<div class="item'+is+'" data-id="'+info['id']+'">');
							html.push('	<a href="javascript:;" class="del">&times;</a>');
							html.push('	<input type="checkbox" value="'+info['id']+'" />');
							html.push('	<a href="'+member['url']+'" target="_blank" class="pic"><img src="'+member['photo']+'" onerror="javascript:this.src=\''+masterDomain+'/static/images/noPhoto_100.jpg\';" /></a>');
							html.push('	<div class="info">');
							html.push('		<p><a href="'+member['url']+'" target="_blank"><strong>'+member['nickname']+'</strong></a>'+member['age']+langData['siteConfig'][13][29]+' <em>|</em> '+member['height']+'cm <em>|</em> '+member['addr'][1]+' <em>|</em> '+member['education']+'</p>');
							//岁
							html.push('		<div class="note"><a href="'+info['url']+'#r'+info['pubdate']+'" target="_blank">'+info['note']+'</a></div>');
							html.push('		<p><a href="'+info['url']+'#r'+info['pubdate']+'" target="_blank">'+langData['siteConfig'][6][29]+'</a>&nbsp;&nbsp;&nbsp;&nbsp;'+huoniao.transTimes(info['pubdate'], 1)+'</p>');
							//回复
							html.push('	</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));
						$(".opera").show();

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
					}

					totalCount = pageInfo.totalCount;
					$("#total").html(pageInfo.totalCount);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
			}
		}
	});
}
