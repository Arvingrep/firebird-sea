
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
			$.dialog.confirm(langData['siteConfig'][20][543], function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=marry&action=operHotelmenu&oper=del&id="+id,
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
	var url ="/include/ajax.php?service=marry&action=hotelmenuList&u=1&orderby=5&state="+state+"&page="+atpage +"&pageSize="+pageSize;
	$.ajax({
		url: url,
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
						var param = t + "do=edit&id=";
						var urlString = editUrl + param;

						for(var i = 0; i < list.length; i++){
							var item        = [],
									id          = list[i].id,
									title       = list[i].title,
									url         = list[i].url,
									litpic      = list[i].litpic,
									price       = list[i].price,//价格
									state       = list[i].state,
									pubdate     = list[i].pubdate;

							html.push('<div class="item fn-clear" data-id="'+id+'">');
							
							html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
							html.push('<div class="i">');

							var arcrank = "";
							if(list[i].arcrank == 0){//未审核
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';
							}else if(list[i].arcrank == 2){//审核拒绝
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';
							}
							//发布时间
							var pub = huoniao.transTimes(pubdate,1)
							html.push('<p>'+langData['marry'][5][24]+'：'+pub+arcrank+'</p>');
							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a><span class="price"><strong>'+price+'</strong>/'+langData['marry'][2][48]+'</span></h5>');//桌
							var cLen = list[i].tagArr_.length; 
							html.push('<div class="menuInfo fn-clear">');  
							html.push('<div class="menuNum">'+langData['marry'][7][39].replace('1',cLen)+'：</div>');//1道菜品 
							html.push('<div>');
							for(var j = 0;j<cLen;j++){
								html.push('<em>'+list[i].tagArr_[j]+'</em>');
							}
							html.push('</div>');
							html.push('</div>');
							html.push('</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
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
