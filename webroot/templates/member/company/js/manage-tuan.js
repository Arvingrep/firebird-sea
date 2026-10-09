/**
 * 会员中心团购列表
 * by guozi at: 20150627
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

	//删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm("确定后将会删除所有订单和评论。<br />如果此商品下有未消费的团购券或订单请先进行退款操作，以免产生用户投诉。", function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=tuan&action=del&id="+id,
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

	objId.delegate(".offshelf", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm("确定要下架吗？", function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=tuan&action=offshelf&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//下架后移除信息层并异步获取最新列表
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

	objId.delegate(".onshelf", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm("确定要上架吗？", function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=tuan&action=onshelf&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//上架后移除信息层并异步获取最新列表
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

});

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=tuan&action=tlist&u=1&orderby=5&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
									startdate = huoniao.transTimes(list[i].startdate, 1),
									enddate   = huoniao.transTimes(list[i].enddate, 1),
									url       = list[i].url,
									buynum    = list[i].buynum,
									common    = list[i].common,
									litpic    = list[i].litpic;

							if(list[i].arcrank != "1") url = 'javascript:;" style="cursor:default;"';

							html.push('<div class="item fn-clear" data-id="'+id+'">');
							if(litpic != ""){
								html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img src="'+litpic+'" /></a></div>');
							}
							html.push('<div class="o"><a href="'+urlString+id+'" class="edit" style="color: #5584ff; display: block; margin-bottom: 10px;">编辑商品</a>');
							// if(list[i].arcrank != "1"){
								// html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>');
							// }
							if(list[i].arcrank == "" || list[i].arcrank == "1"){
								html.push('<a href="javascript:;" class="offshelf" style="color: #5584ff; display: block; margin-bottom: 10px;">'+'立即下架'+'</a>');
							}
							else if(list[i].arcrank == "6"){
								html.push('<a href="javascript:;" class="onshelf"  style="color: #5584ff; display: block; margin-bottom: 10px;">'+'立即上架'+'</a>');
							}
							html.push('</div>');
							html.push('<div class="i">');

							var arcrank = "";
							if(list[i].arcrank == "0"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][26][74]+'</span>';
							}else if(list[i].arcrank == "1"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#1dc11d">出售中</font>';
							}else if(list[i].arcrank == "2"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';
							}else if(list[i].arcrank == "3"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][19][507]+'</span>';
							}else if(list[i].arcrank == "6"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#ff9419">'+'已下架'+'</font>';
							}

							html.push('<p>'+langData['siteConfig'][17][34]+'：'+startdate+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][310]+'：'+enddate+arcrank+'</p>');
							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');

							html.push('<p>'+langData['shop'][3][0]+'：'+buynum+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][6][114]+'：'+common+langData['siteConfig'][13][49]+'</p>');
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
						case "3":
							totalCount = pageInfo.finish;
							break;
						case "6":
							totalCount = pageInfo.offshelf;
							break;
					}


					$("#total").html(pageInfo.totalCount);
					$("#audit").html(pageInfo.audit);
					$("#gray").html(pageInfo.gray);
					$("#refuse").html(pageInfo.refuse);
					$("#finish").html(pageInfo.finish);
					$("#offshelf").html(pageInfo.offshelf);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
