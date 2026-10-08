$(function(){
	 getList(1,0);
	// 切换
	$(".tab_ul li").click(function(){
		keywords = '';
		var t = $(this),index = t.index(),dtype = t.attr('data-type');
		t.addClass("ontab").siblings("li").removeClass("ontab");
		$(".charts_wrap .chart_list").eq(index).removeClass("fn-hide").siblings().addClass("fn-hide");
		getList(1,dtype);
	});
});

function getList(is,type){
	var atpage = $(".chart_list").not(".fn-hide").attr('data-page'),
		totalCount = $(".chart_list").not(".fn-hide").attr('data-count');
	var objId = $(".chart_list").not(".fn-hide").find(".list");

	if(is != 1){
		$('html, body').animate({scrollTop: $(".live_head").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".chart_list").not(".fn-hide").find(".pagination").hide();

	var action = type == '0' ? "getRewardList" : "getShareList";

	$.ajax({
		url: "/include/ajax.php?service=live&action="+action+"&liveid="+chatid+"&pageSize="+pageSize+"&page="+atpage+"&keyword="+keywords,
		type: "GET",
		dataType: "json",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state != 100){
					$('.shai em').html(0);
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  // //暂无相关信息！
				}else{
					var list = data.info, pageInfo = data.info.pageInfo, html = [];
					if(type){
						// $(".tab_ul .ontab em").text(pageInfo.totalCount)
					}
					var px_num = (atpage-1)*pageSize;
					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item     = [],
								id       = list[i].user.userid,
								photo    = list[i].user.photo,
								url      = masterDomain+'user/'+id,
								nickname = list[i].user.nickname,
								ip       = list[i].user.lastloginip,
								sex		 = list[i].user.sex=="0"?"女":"男",
								ontime   = list[i].user.lastlogintime;
								px_num = px_num + 1;
								var cls = '',px = '';
								if(px_num==1){
									cls = 'first_li';
									px = '';
								}else if(px_num==2){
									cls = 'second_li';
									px = '';
								}else if(px_num==3){
									cls = 'third_li';
									px = '';
								}else{
									px = px_num;
								}
							html.push('<li class="'+cls+' chart_li"><div class="chartbox fn-clear">');
							html.push('<div class="chart_user"><i class="p_num">'+px+'</i>');
							html.push('<div class="user_img"><img src="'+photo+'" onerror="javascript:this.src=\'/static/images/noPhoto_40.jpg\';"></div>');
							html.push('<div class="user_info"><h4><a href="/user/'+list[i].user.userid+'" target="_blank">'+nickname+'</a></h4><p>'+sex+'</p></div></div>');
							html.push('<div class="chart_uid"><p>'+id+'</p></div>');
							if(type=='0'){
								html.push('<div class="chart_money">'+echoCurrency("symbol")+'<em>'+list[i].sumamount+'</em></div></div></li>');
							}else{
								html.push('<div class="chart_money"><em>'+list[i].scount+'</em></div></div></li>');
							}

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
					}

					$('.shai em').html(list.length);
				}
			}else{
				$('.shai em').html(0);
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
			}
		}
	});
}

//打印分页
function showPageInfo_tab(info,type,atpage,totalCount) {
	var nowPageNum = Number(atpage);
	var allPageNum = Math.ceil(totalCount/pageSize);
	var pageArr = [];
	info.html("").hide();
	var pages = document.createElement("div");
	pages.className = "pagination-pages";
	info.append(pages);

	//拼接所有分页
	if (allPageNum > 1) {

		//上一页
		if (nowPageNum > 1) {
			var prev = document.createElement("a");
			prev.className = "prev";
			prev.innerHTML = langData['siteConfig'][6][33];//上一页
			prev.onclick = function () {
				atpage = nowPageNum - 1;
				$(".chart_list").not(".fn-hide").attr('data-page',atpage);
				getList('',type);
			}
			info.find(".pagination-pages").append(prev);
		}

		//分页列表
		if (allPageNum - 2 < 1) {
			for (var i = 1; i <= allPageNum; i++) {
				if (nowPageNum == i) {
					var page = document.createElement("span");
					page.className = "curr";
					page.innerHTML = i;
				} else {
					var page = document.createElement("a");
					page.innerHTML = i;
					page.onclick = function () {
						console.log("1");
						atpage = Number($(this).text());
						$(".chart_list").not(".fn-hide").attr('data-page',atpage);
						getList('',type);
					}
				}
				info.find(".pagination-pages").append(page);
			}
		} else {
			for (var i = 1; i <= 2; i++) {
				if (nowPageNum == i) {
					var page = document.createElement("span");
					page.className = "curr";
					page.innerHTML = i;
				}
				else {
					var page = document.createElement("a");
					page.innerHTML = i;
					page.onclick = function () {
						atpage = Number($(this).text());
						$(".chart_list").not(".fn-hide").attr('data-page',atpage);
						getList('',type);
						console.log($(this).text(),"~2");
					}
				}
				info.find(".pagination-pages").append(page);
			}
			var addNum = nowPageNum - 4;
			if (addNum > 0) {
				var em = document.createElement("span");
				em.className = "interim";
				em.innerHTML = "...";
				info.find(".pagination-pages").append(em);
			}
			for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
				if (i > allPageNum) {
					break;
				}
				else {
					if (i <= 2) {
						continue;
					}
					else {
						if (nowPageNum == i) {
							var page = document.createElement("span");
							page.className = "curr";
							page.innerHTML = i;
						}
						else {
							var page = document.createElement("a");
							page.innerHTML = i;
							page.onclick = function () {
								atpage = Number($(this).text());
								$(".chart_list").not(".fn-hide").attr('data-page',atpage);
								getList('',type);
								console.log("3");
							}
						}
						info.find(".pagination-pages").append(page);
					}
				}
			}
			var addNum = nowPageNum + 2;
			if (addNum < allPageNum - 1) {
				var em = document.createElement("span");
				em.className = "interim";
				em.innerHTML = "...";
				info.find(".pagination-pages").append(em);
			}
			for (var i = allPageNum - 1; i <= allPageNum; i++) {
				if (i <= nowPageNum + 1) {
					continue;
				}
				else {
					var page = document.createElement("a");
					page.innerHTML = i;
					page.onclick = function () {
						atpage = Number($(this).text());
						$(".chart_list").not(".fn-hide").attr('data-page',atpage);
						getList('',type);
						console.log("4");
					}
					info.find(".pagination-pages").append(page);
				}
			}
		}

		//下一页
		if (nowPageNum < allPageNum) {
			var next = document.createElement("a");
			next.className = "next";
			next.innerHTML = langData['siteConfig'][6][34];//下一页
			next.onclick = function () {
				atpage = nowPageNum + 1;
				$(".chart_list").not(".fn-hide").attr('data-page',atpage);
				console.log($(this).text(),"~5");
				getList('',type);
			}
			info.find(".pagination-pages").append(next);
		}

		info.show();

	}else{
		info.hide();
	}
}
