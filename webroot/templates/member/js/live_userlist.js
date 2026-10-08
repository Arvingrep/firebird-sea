var keywords = "", operAction = operType = '', operUserid = 0;
$(function(){
	// 将用户禁言/拉黑相关操作
	$(".all_user").delegate("li.user_li button","click",function(e){
		var t      = $(this),
			action = t.attr("data-action"),
			id     = t.attr("data-id"),
			type_   = '';

		$(".pop_box").hide();

		if(t.hasClass("actioned")){  //取消禁言/拉黑
			t.find(".notip").show();
			type_ = 'remove';
		}else{
			t.find(".popaction").show();
			type_ = 'add';
		}
		$(document).one("click",function(){
			$(".pop_box").hide();
		});

		operAction = action;
		operType = type_;
		operUserid = id;
		e.stopPropagation();
	});

	$(".all_user").delegate(".pop_box .cancel_btn","click",function(e){
		$(".pop_box").hide();
		e.stopPropagation();
	});

	var tj = false;
	$(".userlist").delegate(".pop_box .sure_btn","click",function(e){
		$(".pop_box").hide();
		var t = $(this),pop = t.parents(".pop_box");
		if(tj) return false;

		tj = true;

		$.ajax({
			url: '/include/ajax.php?service=live&action=operMember',
			data: {aid: chatid, uid: operUserid, act: operAction, type: operType},
			type: "POST",
			dataType: "json",
			success: function(data) {
				tj = false;
				if (data.state == 100) {

				} else {
					alert(data.info);
				}
				getList(0, $(".tab_ul li.ontab").attr('data-type'));
			},
			error: function() {
				tj = false;
				console.log(langData['siteConfig'][31][135]);  //网络错误，操作失败！
			}
		});

		e.stopPropagation();
	});

	getList(1,0);

	// 切换
	$(".tab_ul li").click(function(){
		var t = $(this),index = t.index(),dtype = t.attr('data-type');
		t.addClass("ontab").siblings("li").removeClass("ontab");
		$(".user_wrap .userlist").eq(index).removeClass("fn-hide").siblings().addClass("fn-hide");
		$(".userlist").not(".fn-hide").attr('data-page', 1);
		getList(1,dtype);
	});

	// 搜索用户
	$(".search_btn").click(function(){
		keywords = $("#search").val();
		var dtype = $(".tab_ul li.ontab").attr('data-type')
		getList(1,dtype);
	})

	// 移除禁言/拉黑
	$(".userlist.jy_user,.userlist.lh_user").delegate("li.user_li .user_op button","click",function(e){
		var t = $(this),id = t.attr("data-id"),action = t.attr('data-action');
		t.find('.pop_box').show();

		$(document).one("click",function(){
			t.find('.pop_box').hide();
		});

		operAction = action;
		operType = 'remove';
		operUserid = id;

		e.stopPropagation();
	})
});

function getList(is,type){
	var atpage = $(".userlist").not(".fn-hide").attr('data-page'),
		totalCount = $(".userlist").not(".fn-hide").attr('data-count');
	var objId = $(".userlist").not(".fn-hide").find(".list");
	if(is != 1){
		$('html, body').animate({scrollTop: $(".live_head").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".userlist").not(".fn-hide").find(".pagination").hide();

	var mute_ = block_ = 0;
	if(type == 1){
		mute_ = 1;
	}else if(type == 2){
		block_ = 1;
	}

	$.ajax({
		url: "/include/ajax.php?service=live&action=member&aid="+chatid+"&mute="+mute_+"&block="+block_+"&pageSize="+pageSize+"&page="+atpage+"&keywords="+keywords,
		type: "GET",
		dataType: "json",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state != 100){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					$("#totalMember").text(pageInfo.totalMember);
					$("#totalMute").text(pageInfo.totalMute);
					$("#totalBlock").text(pageInfo.totalBlock);

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item     = [],
								id       = list[i].id,
								date     = list[i].date,
								mute     = list[i].mute,
								block    = list[i].block,
								userid   = list[i].uid,
								userinfo = list[i].userinfo,
								photo    = userinfo.photo,
								nickname = userinfo.nickname,
								sex      = userinfo.sex == 0 ? '女' : '男';
								addrName = userinfo.addrName ? userinfo.addrName.split(' > ') : '',
								ip       = userinfo.lastloginip;

							if(type == '0'){
								html.push('<li class="user_li "><div class="userbox fn-clear">');
								html.push('<div class="user_info fn-clear"><div class="user_img"><a href="/user/'+userid+'" target="_blank"><img onerror="javascript:this.src=\'/static/images/noPhoto_40.jpg\';" src="'+(photo?photo:"/static/images/noPhoto_40.jpg")+'"></a></div>');
								html.push('<div class="user_detail"><h4 title="'+nickname+'"><a href="/user/'+userid+'" target="_blank">'+nickname+'</a></h4><p>ID：'+userid+'</p><p>'+sex+'</p></div></div>');
								html.push('<div class="user_area"><p>'+(addrName ? (addrName[addrName.length-2]+' '+addrName[addrName.length-1]) : '未知')+'</p></div>');
								html.push('<div class="user_ip "><p>'+ip+'</p></div>');
								html.push('<div class="user_time"><p>'+huoniao.transTimes(date, 1)+'</p></div>');

								if(mute == '1'){
									html.push('<div class="user_op"><button class="jinyan actioned" data-action="jinyan" data-id="'+id+'">'+langData['live'][2][52]);  //已禁言
								}else{
									html.push('<div class="user_op"><button class="jinyan" data-action="jinyan" data-id="'+id+'">'+langData['live'][2][49]);  //禁言
								}

								html.push('<div class="pop_box popaction"><i class="arr"></i>');
								/* <h5>确定禁言此用户吗？</h5><p> 禁言后Ta将不能在该直播间发言，可观看直播 若设涉及退款问题，请自行协商解决 </p> */
								html.push(langData['live'][2][47]);
								/* 取消 确认*/
								html.push('<div class="btns_group"><a href="javascript:;" class="cancel_btn">'+langData['live'][0][9]+'</a><a href="javascript:;" class="sure_btn">'+langData['live'][1][39]+'</a></div></div>');
								html.push('<div class="pop_box notip"><i class="arr"></i>');
								/*  <h5>解除禁言后，Ta可在当前直播间发言</h5>*/
								html.push(langData['live'][2][48]);
								/* 取消 */
								html.push('<div class="btns_group"><a href="javascript:;" class="cancel_btn">'+langData['live'][0][9]+'</a>');
								/* 确认 */
								html.push('<a href="javascript:;" class="sure_btn">'+langData['live'][1][39]+'</a></div></div></button>');

								if(block == '1'){
									html.push('<button class="lahei actioned" data-action="lahei" data-id="'+id+'">'+langData['live'][2][53]);  //已拉黑
								}else{
									html.push('<button class="lahei" data-action="lahei" data-id="'+id+'">'+langData['live'][2][50]);  //拉黑
								}

								html.push('<div class="pop_box popaction" ><i class="arr"></i>');

								/* <h5>确定拉黑此用户吗？</h5><p>拉黑后，Ta将不能再进入该直播间 若设涉及退款问题，请自行协商解决 </p> */
								html.push(langData['live'][3][0]);
								/* 取消 确认*/
								html.push('<div class="btns_group"><a href="javascript:;" class="cancel_btn">'+langData['live'][0][9]+'</a><a href="javascript:;" class="sure_btn">'+langData['live'][1][39]+'</a></div></div>');
								html.push('<div class="pop_box notip" ><i class="arr"></i>');
								/* 解除拉黑后，Ta可正常访问当前直播间 */
								html.push('<h5>'+langData['live'][3][1]+'</h5>');
								/* 取消 确认*/
								html.push('<div class="btns_group"><a href="javascript:;" class="cancel_btn">'+langData['live'][0][9]+'</a><a href="javascript:;" class="sure_btn">'+langData['live'][1][39]+'</a></div>');
								html.push('</div></button></div></div></li>');
							}else{
								html.push('<li class="user_li "><div class="userbox fn-clear">');
								html.push('<div class="user_info fn-clear"><div class="user_img"><a href="/user/'+userid+'" target="_blank"><img onerror="javascript:this.src=\'/static/images/noPhoto_40.jpg\';" src="'+(photo?photo:"/static/images/noPhoto_40.jpg")+'"></a></div>');
								html.push('<div class="user_detail"><h4 title="'+nickname+'"><a href="/user/'+userid+'" target="_blank">'+nickname+'</a></h4><p>ID：'+id+'</p><p>'+sex+'</p></div></div>');
								html.push('<div class="user_time"><p>'+huoniao.transTimes(date, 1)+'</p></div>');
								html.push('<div class="user_op"><button type="button" data-action="'+(mute_ ? 'jinyan' : 'lahei')+'" data-id="'+id+'"><i></i>'+langData['live'][3][4]);
								/* 移除后，Ta可在当前直播间发言     移除后，Ta可观看当前直播间 */
								html.push('<div class="pop_box notip"><i class="arr"></i><h5>'+(mute == '1' && mute_ ? langData['live'][3][3] : langData['live'][3][56])+'</h5>');
								html.push('<div class="btns_group"><a href="javascript:;" class="cancel_btn">'+langData['live'][0][9]+'</a><a href="javascript:;" class="sure_btn">'+langData['live'][1][39]+'</a></div>');
								html.push('</div></button></div></div></li>');
							}

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
					}

					totalCount = pageInfo.totalCount;
					showPageInfo_tab($(".userlist").not(".fn-hide").find(".pagination"),type,atpage,totalCount)
				}
			}else{
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
				$(".userlist").not(".fn-hide").attr('data-page',atpage);
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
						$(".userlist").not(".fn-hide").attr('data-page',atpage);
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
						$(".userlist").not(".fn-hide").attr('data-page',atpage);
						getList('',type);
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
								$(".userlist").not(".fn-hide").attr('data-page',atpage);
								getList('',type);
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
						$(".userlist").not(".fn-hide").attr('data-page',atpage);
						getList('',type);
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
				$(".userlist").not(".fn-hide").attr('data-page',atpage);
				getList('',type);
			}
			info.find(".pagination-pages").append(next);
		}

		info.show();

	}else{
		info.hide();
	}
}
