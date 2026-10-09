
var objId = $("#list");
$(function(){
	$(".nav-tabs li[data-id='"+state+"']").addClass("active");

	$(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id"),fabuUrl = t.attr('data-fabu'),tit = t.attr('data-title');

		if(!t.hasClass("active")){
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
			getList();
			$('.nav-tabs .btn').attr('href',fabuUrl);
			$('.nav-tabs .btn').text(tit);
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
				var url = masterDomain+"/include/ajax.php?service=marry&action=operPlanmeal&oper=del&id="+id
			if (typeid == 7){
				url = masterDomain+"/include/ajax.php?service=marry&action=operHost&oper=del&id="+id
			}else if (typeid == 10 ){
				url = masterDomain+"/include/ajax.php?service=marry&action=operRental&oper=del&id="+id
			}else{
				url = masterDomain+"/include/ajax.php?service=marry&action=operPlanmeal&oper=del&id="+id
			}
				$.ajax({
					url: url,
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
	var ac = $('.nav-tabs li.active').data('type');
	var url;
	if(ac==0){//套餐
		if (typeid == 7){
		url =  "/include/ajax.php?service=marry&action=marryhostList&u=1&orderby=5&type="+typeid+"&page="+atpage+"&pageSize="+pageSize;
		}else if (typeid == 10){
			url="/include/ajax.php?service=marry&action=marrycarList&u=1&orderby=5&type="+typeid+"&page="+atpage+"&pageSize="+pageSize;

		}else{
			url="/include/ajax.php?service=marry&action=planmealList&u=1&orderby=5&type="+typeid+"&page="+atpage+"&pageSize="+pageSize;

		}

	}else{//案例
		url="/include/ajax.php?service=marry&action=plancaseList&u=1&stypeid="+typeid+"&orderby=5&page="+atpage+"&pageSize="+pageSize;
	}
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

						var param =  "&do=edit&id=";
						var editUrl = $(".nav-tabs li.active").attr('data-fabu');
						var urlString = editUrl + param;

						for(var i = 0; i < list.length; i++){
							var item        = [],
									id          = list[i].id,
									title       = list[i].title,
									url         = list[i].url,
									litpic      = list[i].litpic,
									price       = list[i].price,
									state       = list[i].state,
									holdingtime       = list[i].holdingtime,//案例时间
									pubdate     = list[i].pubdate;

							html.push('<div class="item fn-clear" data-id="'+id+'">');
							if(litpic != ""){
								html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img src="'+litpic+'" /></a></div>');
							}
							html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
							html.push('<div class="i">');

							var arcrank = "";
							if(list[i].arcrank == 0){//未审核
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';
							}else if(list[i].arcrank == 2){//审核拒绝
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';
							}
							//发布时间
							var pub = huoniao.transTimes(pubdate,1);
							html.push('<p>'+langData['marry'][5][24]+'：'+pub+arcrank+'</p>');
							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');
							if(ac == 0){//套餐
								html.push('<p class="price">'+echoCurrency('symbol')+'<strong>'+price+'</strong></p>');
							}else{//案例
								var timeH = huoniao.transTimes(holdingtime,2);
								//案例时间                        
								html.push('<p>'+langData['marry'][8][32]+'：'+timeH+'</p>');
							}													
							
							html.push('</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}
					$("#total").html(pageInfo.totalCount);
					$("#audit").html(pageInfo.state1);
					$("#gray").html(pageInfo.state0);
					$("#refuse").html(pageInfo.state2);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
