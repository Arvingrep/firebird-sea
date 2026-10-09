/**
 * 会员中心活动列表
 * by guozi at: 20161228
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
			$.dialog.confirm(langData['siteConfig'][20][543], function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=huodong&action=del&id="+id,
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


function transTimes(timestamp, n){
	
    const dateFormatter = huoniao.dateFormatter(timestamp);
    const year = dateFormatter.year;
    const month = dateFormatter.month;
    const day = dateFormatter.day;
    const hour = dateFormatter.hour;
    const minute = dateFormatter.minute;
    const second = dateFormatter.second;
    
	if(n == 1){
		return (month+'-'+day+' '+hour+':'+minute);
	}else{
		return 0;
	}
}


function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=huodong&action=hlist&u=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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

						var editUrl = $(".nav-tabs").data("url"), regUrl = $(".nav-tabs").data("reg");

						for(var i = 0; i < list.length; i++){
							var item     = [],
								id       = list[i].id,
								title    = list[i].title,
								litpic   = huoniao.changeFileSize(list[i].litpic, "middle"),
								typename = list[i].typename.join("-"),
								url      = list[i].url,
								click    = list[i].click,
								reg      = list[i].reg,
								began    = transTimes(list[i].began, 1),
								end      = transTimes(list[i].end, 1),
								feetype  = list[i].feetype,
								reply    = list[i].reply,
								pubdate  = huoniao.transTimes(list[i].pubdate, 1);

							html.push('<div class="item fn-clear" data-id="'+id+'">');

							if(litpic){
								html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img src="'+litpic+'"></a></div>');
							}

							html.push('<div class="o">');
							if(reg > 0 ){
								if((is_staff==1 && baoming ==1) || is_staff ==0){

									html.push('<a href="'+regUrl.replace("%id", id)+'" class="reg"><s></s>'+langData['siteConfig'][19][421]+'</a>');
								}
							}
							html.push('<a href="'+editUrl.replace("%id", id)+'" target="_blank" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');
							if(reg <= 0){
								html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>');
							}
							html.push('</div>');
							html.push('<div class="i">');

							var arcrank = "";
							if(list[i].state == "0"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';
							}else if(list[i].state == "2"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';
							}

							html.push('<p>'+langData['siteConfig'][19][393]+'：'+typename+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][11][8]+'：'+pubdate+arcrank+'</p>');

							var type = "";
							if(feetype == "1"){
								type = '<span style="background: #f66; color:#fff; padding: 0 5px; margin-left: 10px; font-size: 12px; font-weight: 500;">'+langData['siteConfig'][19][889]+'</span>';
							}else{
								type = '<span style="background: #66a3ff; color:#fff; padding: 0 5px; margin-left: 10px; font-size: 12px; font-weight: 500;">'+langData['siteConfig'][19][427]+'</span>';
							}
							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a>'+type+'</h5>');

							html.push('<p>'+langData['siteConfig'][19][384]+'：'+began+'至'+end+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][394]+'：'+click+langData['siteConfig'][13][26]+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][420]+'：'+reg+'人&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][6][114]+'：'+reply+langData['siteConfig'][13][49]+'</p>');
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
