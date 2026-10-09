/**
 * 会员中心教育培训列表
 * by zmy at: 2021-5-25
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

	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=education&action=del&id="+id,
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

	//刷新
	objId.delegate('.refresh', 'click', function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
		refreshTopFunc.init('refresh', 'education', 'detail', id, t, title);
	});


	//置顶
	objId.delegate('.topping', 'click', function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
		refreshTopFunc.init('topping', 'education', 'detail', id, t, title);
	});



});

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url:"/include/ajax.php?service=education&action=coursesList&u=1&orderby=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
						var urlString = editUrl2 + param;

						for(var i = 0; i < list.length; i++){
							var item        = [],
									id          = list[i].id,
									title       = list[i].title,
									color       = list[i].color,
									url         = list[i].url,
									litpic      = list[i].litpic,
									click      = list[i].click,
									coursetype = list[i].coursetype,
									stat      = list[i].state,
									sale      = list[i].sale,
									refreshSmart= list[i].refreshSmart,
									waitpay    = list[i].waitpay,
									isbid    = list[i].isbid,
									pubdate     = huoniao.transTimes(list[i].pubdate, 1);

							//智能刷新
							if(refreshSmart){
								refreshCount = list[i].refreshCount;
								refreshTimes = list[i].refreshTimes;
								refreshPrice = list[i].refreshPrice;
								refreshBegan = huoniao.transTimes(list[i].refreshBegan, 1);
								refreshNext = huoniao.transTimes(list[i].refreshNext, 1);
								refreshSurplus = list[i].refreshSurplus;
							}
							url = waitpay == "1" || list[i].state != 1 ? 'javascript:;' : url;
							var arcrank = "";
							if(list[i].state == 0){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';  //未审核
							}else if(list[i].state == 2){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';   //审核拒绝
							}

							html.push('<div class="item fn-clear" data-id="'+id+'" data-title="'+title+'">');
							var targetxt ='';
							if(list[i].state == 1){
								targetxt = 'target="_blank"';

							}
							if(litpic != "" && litpic != undefined){
								
								html.push('<div class="p"><a href="'+url+'" '+targetxt+'><i></i><img src="'+huoniao.changeFileSize(litpic, "small")+'" /></a></div>');
							}
							html.push('<div class="o">');
							if(list[i].state == 1 && waitpay!=1){
								if(!refreshSmart){
									html.push('<a href="javascript:;" class="refresh"><s></s>'+langData['siteConfig'][16][70]+'</a>'); //刷新
								}
								if(isbid == 0){
									html.push('<a href="javascript:;" class="topping"><s></s>'+langData['siteConfig'][19][762]+'</a>');  //置顶
								}
							}
							html.push('<a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');

							html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>');

							html.push('</div>');
							html.push('<div class="i">');
							html.push('<p>'+langData['siteConfig'][19][393]+'：'+coursetype+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][11][8]+'：'+pubdate+arcrank+'</p>');   //发布时间
							html.push('<h5><a href="'+url+'" '+targetxt+' title="'+title+'" style="color:'+color+';">'+title+'</a></h5>');


							html.push('<p>'+langData['siteConfig'][19][394]+'：'+click+langData['siteConfig'][13][26]+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][6][114]+'：'+sale+langData['siteConfig'][13][26]+'</p>');
							//浏览--次--预约--次-

							html.push('</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}
                    countDownRefreshSmart();

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
						case "4":
							totalCount = pageInfo.expire;
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
