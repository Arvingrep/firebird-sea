/**
 * 会员中心保姆/月嫂列表
 * by zmy at: 20210312
 */

var objId = $("#list");
$(function(){
	//搜索
	$('#searchForm').submit(function(e){
		e.preventDefault();
		getList(1);
	})
	getList(1);
	//删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){
				$.ajax({
					url: "/include/ajax.php?service=education&action=operTeacher&oper=del&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							$.dialog.alert('删除成功');
							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();
								setTimeout(function(){getList(1);}, 200);
							});

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

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	if(is){
		atpage = 1;
	}

	var keywords = $('.keywords').val();

	$.ajax({
		url: "/include/ajax.php?service=education&action=teacherList&u=1&orderby=2&title="+keywords+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$('.total span').text(0);
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					$('.total span').text(pageInfo.totalCount);

					//拼接列表
					if(list.length > 0){
						var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
                    	var param = t + "id=";
                    	var urlString = editUrl + param;

						for(var i = 0; i < list.length; i++){
							var item           = [],
								id             = list[i].id,
								name           = list[i].name,
								url            = list[i].url,
								photo          = list[i].photo,
								pubdate        = huoniao.transTimes(list[i].pubdate, 2);

							html.push('<div class="item" data-id="'+id+'">');
							html.push('	<div class="pic"><img src="'+(photo != '' ? huoniao.changeFileSize(photo, "small") : '/static/images/default_user.jpg')+'" alt=""></div>');
							html.push('	<div class="info">');
							html.push('		<p class="name">'+name+'</p>');
							html.push('     <p class="bm_info">加入时间：'+pubdate+'</p>');//
							html.push('	</div>');
							html.push('	<a href="javascript:;" class="del"></a>');
							html.push('	<a href="'+urlString+id+'" class="edit"></a>');
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}
					totalCount = pageInfo.totalCount;
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
