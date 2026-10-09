/**
 * 会员中心商城商品列表
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
			$.dialog.confirm(langData['siteConfig'][27][116], function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=awardlegou&action=offShelf&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							t.siblings("a").show();
							t.removeClass("load").html(langData['siteConfig'][27][117]);
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
				url: masterDomain+"/include/ajax.php?service=awardlegou&action=upShelf&id="+id,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						t.siblings("a").show();
						t.removeClass("load").html(langData['siteConfig'][27][118]);
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
		url: masterDomain+"/include/ajax.php?service=awardlegou&action=goodList&u=1&orderby=5&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
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
									url       = state == 1 ? list[i].linkurl : "javascript:;",
									sales     = list[i].buynum,
									comment   = list[i].comment,
									inventory = list[i].inventory,
									litpic    = list[i].litpicpath,
								joinnuember   = list[i].joinnuember,
									date      = huoniao.transTimes(list[i].pubdate, 1);

							html.push('<div class="item fn-clear" data-id="'+id+'">');
							if(litpic != ""){
								html.push('<div class="p"><a href="/include/qrcode.php?data='+url+'" target="_blank"><i></i><img src="'+huoniao.changeFileSize(litpic, "small")+'" /></a></div>');
							}
							html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');
							if(sta == "1"){
								html.push('<a href="javascript:;" class="offShelf"><s></s>'+langData['siteConfig'][19][558]+'</a>');
							}else if(sta == "2"){
								html.push('<a href="javascript:;" class="upShelf"><s></s>'+langData['siteConfig'][26][166]+'</a>');
							}
							html.push('</div>');
							html.push('<div class="i">');

							html.push('<h5><a href="/include/qrcode.php?data='+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');

							var arcrank = "";
							if(sta == "0"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][26][74]+'</span>';
							}else if(sta == "1"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][26][167];
							}else if(sta == "2"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][26][168]+langData['siteConfig'][19][558]+'</span>';
							}

							html.push('<p>'+langData['siteConfig'][11][8]+'：'+date+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['shop'][3][16]+'：'+sales+'&nbsp;&nbsp;·&nbsp;&nbsp;参与人数：'+joinnuember+'</p>');
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
