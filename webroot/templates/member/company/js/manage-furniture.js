/**
 * 会员中心家具商品列表
 * by guozi at: 20160419
 */

var objId = $("#list");
$(function(){

	$(".nav-tabs li[data-id='"+state+"']").addClass("active");

	$(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("active") && !t.hasClass("add")){
			state = id;
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
			getList();
		}
	});

	getList(1);

	//下架
	objId.delegate(".offShelf", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][27][116], function(){//确定要下架这个商品吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=furniture&action=offShelf&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							t.siblings("a").show();
							t.removeClass("load").html(langData['siteConfig'][27][117]);//下架成功
							setTimeout(function(){getList(1);}, 1000);
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

	//上架
	objId.delegate(".upShelf", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			t.siblings("a").hide();
			t.addClass("load");

			$.ajax({
				url: masterDomain+"/include/ajax.php?service=furniture&action=upShelf&id="+id,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						t.siblings("a").show();
						t.removeClass("load").html(langData['siteConfig'][27][117]);//上架成功
						setTimeout(function(){getList(1);}, 1000);
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
		}
	});

});

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=furniture&action=flist&u=1&orderby=5&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

						var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
						var param = t + "do=edit&id=";
						var urlString = editUrl + param;

						for(var i = 0; i < list.length; i++){
							var item      = [],
									id        = list[i].id,
									title     = list[i].title,
									sta       = list[i].state,
									url       = state == 1 ? list[i].url : "javascript:;",
									sales     = list[i].sales,
									comment   = list[i].comment,
									inventory = list[i].inventory,
									litpic    = list[i].litpic,
									date      = huoniao.transTimes(list[i].pubdate, 1);

							html.push('<div class="item fn-clear" data-id="'+id+'">');
							if(litpic != ""){
								html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img src="'+huoniao.changeFileSize(litpic, "small")+'" /></a></div>');
							}
							html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');
							if(sta == "1"){
								html.push('<a href="javascript:;" class="offShelf"><s></s>'+langData['siteConfig'][19][558]+'</a>');//下架
							}else if(sta == "2"){
								html.push('<a href="javascript:;" class="upShelf"><s></s>'+langData['siteConfig'][26][166]+'</a>');//上架
							}
							html.push('</div>');
							html.push('<div class="i">');

							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');

							var arcrank = "";
							if(sta == "0"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][26][74]+'</span>';
							}else if(sta == "1"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][26][167];//销售中
							}else if(sta == "2"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][19][557]+'</span>';//已下架
							}

							html.push('<p>'+langData['siteConfig'][11][8]+'：'+date+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['shop'][3][16]+'：'+sales+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][525]+'：'+inventory+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][6][114]+'：'+comment+arcrank+'</p>');
							html.push('</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalCount = pageInfo.totalCount;

					switch(state){
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
