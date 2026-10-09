
var navList = [{txt:'新房管理',link:'/supplier/loupan',},{txt:'基本资料',link:'/supplier/loupan/base_info.html',},{txt:'详细信息',link:'/supplier/loupan/detail_info.html',},{txt:'图片视频',link:'/supplier/loupan/albums.html',},{txt:'全景看房',link:'/supplier/loupan/quanjing.html',},{txt:'户型介绍',link:'/supplier/loupan/huxing.html',},{txt:'资讯动态',link:'/supplier/loupan/article.html',},{txt:'沙盘信息',link:'/supplier/loupan/shapan.html',},{txt:'销售顾问',link:'/supplier/loupan/adviser.html',},{txt:'优惠活动',link:'/supplier/loupan/huodong.html',},{txt:'意向客户',link:'/supplier/loupan/customer.html',},{txt:'分销报备',link:'/supplier/loupan/fenxiaobaobei.html',},{txt:'浏览统计',link:'/supplier/loupan/liulan.html',}];
$(function(){


  //打印分页
function showPageInfo() {
	var info = $(".pagination");
	var nowPageNum = atpage;
	var allPageNum = Math.ceil(totalCount/pageSize);
	var pageArr = [];
	info.html("").hide();
	console.log(1111)
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
				getList();
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
						atpage = Number($(this).text());
						getList();
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
						getList();
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
								getList();
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
						getList();
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
				getList();
			}
			info.find(".pagination-pages").append(next);
		}

		info.show();

	}else{
		info.hide();
	}
}

})
