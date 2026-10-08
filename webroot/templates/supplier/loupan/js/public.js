
// var navList = [{txt:'新房管理',link:'/supplier/loupan',},{txt:'基本资料',link:'/supplier/loupan/base_info.html',},{txt:'详细信息',link:'/supplier/loupan/detail_info.html',},{txt:'图片视频',link:'/supplier/loupan/albums.html',},{txt:'全景看房',link:'/supplier/loupan/quanjing.html',},{txt:'户型介绍',link:'/supplier/loupan/huxing.html',},{txt:'资讯动态',link:'/supplier/loupan/article.html',},{txt:'沙盘信息',link:'/supplier/loupan/shapan.html',},{txt:'销售顾问',link:'/supplier/loupan/adviser.html',},{txt:'优惠活动',link:'/supplier/loupan/huodong.html',},{txt:'意向客户',link:'/supplier/loupan/customer.html',},{txt:'分销报备',link:'/supplier/loupan/fenxiaobaobei.html',},{txt:'浏览统计',link:'/supplier/loupan/liulan.html',}];
var navList = [
	{
		id:1,
		txt:'工作台',
		link:'/supplier/loupan',
	},
	{
		id:2,
		txt:'楼盘资料',
		link:'/supplier/loupan/base_info.html',
		hide:true,
		list:[
			
			{
				id:21,
				txt:'详细资料',
				link:'/supplier/loupan/base_info.html?type=1',
			},
			{
				id:22,
				txt:'楼盘相册',
				link:'/supplier/loupan/albums.html',
			},
			{
				id:23,
				txt:'户型',
				link:'/supplier/loupan/huxing.html',
			},
			{
				id:24,
				txt:'3D沙盘',
				link:'/supplier/loupan/shapan.html'
			}
		]
	},
	{
		id:3,
		txt:'团队管理',
		link:'/supplier/loupan/teamManage',
	},
	{
		id:4,
		txt:'客户管理',
		link:'/supplier/loupan/customerManage',
	},
	{
		id:5,
		txt:'优惠活动',
		link:'/supplier/loupan/huodong.html',
	},
	{
		id:9,
		txt:'一房一价',
		link:'/supplier/loupan/oneRoom.html',
	},
	{
		id:6,
		txt:'楼盘时刻',
		link:'/supplier/loupan/houseMoment.html',
	},
	{
		id:7,
		txt:'实时动态',
		link:'/supplier/loupan/article.html',
	},
	{
		id:8,
		txt:'分销报备',
		link:'/supplier/loupan/reportList.html',
		hide:true,
		list:[
			// {
			// 	id:81,
			// 	txt:'报备管理',
			// 	link:'/supplier/loupan/reportList.html'
			// },
			{
				id:82,
				txt:'佣金明细',
				link:'/supplier/loupan/commissionList.html'
			},
			{
				id:85,
				txt:'全民分销',
				link:'/supplier/loupan/nationalFx.html'
			},
			
			{
				id:84,
				txt:'分销公司管理',
				link:'/supplier/loupan/salesBranchManage.html'
			},
			{
				id:83,
				txt:'分销设置',
				link:'/supplier/loupan/config.html'
			},
		]
	},
]
if(typeof currid != 'undefined'){
	for(let i  = 0; i < navList.length; i++){
		if(navList[i].id == currid){
			navList[i].hide = false;
			break;
		}
		if(navList[i].list && navList[i].list.length > 0){
			for(let j = 0; j < navList[i].list.length; j++){
				if(navList[i].list[j].id == currid){
					navList[i].hide = false;
					break;
				}
			}
		}
	}
}
$(function(){
	$(".leftNavBox").delegate('li.hasChild a','click',function(){
		let id = $(this).closest('li').attr('data-id');
		if(id == 8 && detail_distributor_status == 2){
			pageVue && pageVue.$alert('还未开启分销功能，请联系平台管理员开启', '温馨提示', {
				confirmButtonText: '确定',
				customClass: "confirmVerify-dialog confirm-dialog",
				callback: action => {
					
				}
			});
			return false;
		}
	})

  //打印分页
function showPageInfo() {
	var info = $(".pagination");
	var nowPageNum = atpage;
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

var showAlertErrTimer;
function showErrAlert(data, type = '',tip = '') {
    showAlertErrTimer && clearTimeout(showAlertErrTimer);
    $(".popErrAlert").remove();
    var type = type ?  '<s class="' + type + '"></s>' : '';
    let tipDom  = tip ? '<p class="popErr_tip">'+ tip +'</p>' : '' ;
    let moreH = tip && data ? 'moreHigh' : ''
    $("body").append('<div class="popErrAlert"><div class="popErrCon '+ moreH +'"><div class="popErr_msg">' + type + data + '</div>'+ tipDom +'</div></div>');

    $(".popErrAlert").css({
        "visibility": "visible"
    });
    showAlertErrTimer = setTimeout(function () {
        $(".popErrAlert").fadeOut(300, function () {
            $(this).remove();
        });
    }, 1500);
}
