/**
 * 会员中心装修案例
 * by guozi at: 20160516
 */

var objId = $("#list");
$(function(){
	$(".nav-tabs li[data-id='"+state+"']").addClass("active");

	$(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("active")){
			state = id;
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
			getList();
		}
	});
	getList(1);

	//删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][211], function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: "/include/ajax.php?service=travel&action=operVisa&oper=del&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state != 200){

							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();

								setTimeout(function(){getList(1);}, 200);
							});

						}else{
							$.dialog.alert(langData['siteConfig'][27][77]);
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

});

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: "/include/ajax.php?service=travel&action=visaList&u=1&orderby=2&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
                  totalCount = pageInfo.totalCount;

					//拼接列表
					if(list.length > 0){

						var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
						var param = t + "id=";
						var urlString = editUrl + param;

						for(var i = 0; i < list.length; i++){
							var item        = [],
									id          = list[i].id,
									title       = list[i].title,
									url         = list[i].url,
									litpic      = list[i].litpic,
									click       = list[i].click,
									typename    = list[i].typename,
									countryname = list[i].countryname,
									opentime    = list[i].opentime,
									price       = list[i].price,
									sale        = list[i].sale,
									pubdate     = huoniao.transTimes(list[i].pubdate, 1);

							html.push('<div class="item fn-clear" data-id="'+id+'">');
							if(litpic != ""){
								html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img src="'+litpic+'" /></a></div>');
							}
							html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
							html.push('<div class="i">');

							var arcrank = "";
							if(list[i].state == 0){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';
							}else if(list[i].state == 2){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';
							}

							html.push('<p>'+typename+'&nbsp;&nbsp;·&nbsp;&nbsp;'+countryname+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][55][60]+'：'+pubdate+arcrank+'</p>');//发布时间
							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');

							html.push('<p>'+langData['siteConfig'][19][394]+'：'+click+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][518]+'：'+''+ sale+'</p>');//浏览--已售
							html.push('</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					switch(state){
						case "":
							totalCount = pageInfo.totalCount;
							break;
						case "0":
							totalCount = pageInfo.gray;
							break;
						case "1":
							totalCount = pageInfo.audit;
							break;
						case "2":
							totalCount = pageInfo.refuse;
							break;
					}


					$("#total").html(pageInfo.totalCount);
					$("#audit").html(pageInfo.audit);
					$("#gray").html(pageInfo.gray);
					$("#refuse").html(pageInfo.refuse);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
