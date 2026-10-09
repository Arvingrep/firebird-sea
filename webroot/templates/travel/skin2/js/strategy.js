$(function(){

    //热门目的地搜索
    $('.i_search').click(function(){
        if ($('.textBox').val()!=''){
            $('.glForm').submit();
        } 
    })
    $('.gl_con').delegate('li','click',function(){
        var txt = $(this).find('a').data('dest');
        location.href = channelDomain+'/grouptravel.html?keywords='+txt
        return false;
    });

    //控制目的地的字数
    $('.dest_a').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });

    var isload = false;

    //旅游攻略切换tab
    $('.travel_nav').delegate('li','click',function(){
		$(this).addClass('on').siblings().removeClass('on');
	    var i = $(this).index();
        subpage = 1;
	    getList();
    });
    
    getList();

    function getList(){
        var data = [];
        data.push("page="+subpage);
        data.push("pageSize="+pageSize);
        
        var typeid = $('.travel_nav li.on').data('id');
        typeid = typeid ? typeid : 0;
        data.push("typeid="+typeid);
        
        isload = true;
        if(page == 1){
			$(".travel_content ul").html();
            $(".tip").html(langData['travel'][12][57]).show();//加载中~
        }else{
            $(".tip").html(langData['travel'][12][57]).show();//加载中~
        }
        
        $.ajax({
            url: "/include/ajax.php?service=travel&action=strategyList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    var totalCount = pageinfo.totalCount;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li><a href="'+list[i].url+'" target="_blank">');
						var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "";
						html.push('<div class="left_img"><img src="'+pic+'" alt=""></div>');
						html.push('<div class="right_text">');
                        html.push('<h2>'+list[i].title+'</h2>');
						html.push('<div class="desc">'+list[i].note+'</div>');
						html.push('<div class="up_info">');
						html.push('<div class="_left">');
						var pics = list[i].user['photo'] != "" && list[i].user['photo'] != undefined ? huoniao.changeFileSize(list[i].user['photo'], "small") : "/static/images/noPhoto_40.jpg";
						html.push('<div class="headimg"><img src="'+pics+'"></div>');
						html.push('<p class="up_name">'+list[i].user['nickname']+'</p>');
						html.push('</div>');
						html.push('<p class="_right"><i></i>'+list[i].click+'</p>');
						html.push('</div>');
						html.push('</div>');
						html.push('</a></li>');
                    }
                    
                    $(".travel_content ul").html(html.join(""));
                    
                    showPageInfo(totalCount);
                    isload = false;

                    if(page >= pageinfo.totalPage){
                        isload = true;
                        $(".tip").html(langData['travel'][0][9]).show();
                    }
                }else{
                    if(page == 1){
                        $(".travel_content ul").html("");
                    }
					$(".tip").html(data.info).show();
                }
            },
            error: function(){
				isload = false;
				$(".travel_content ul").html("");
				$('.tip').text(langData['travel'][0][10]).show();//请求出错请刷新重试
            }
        });

    }
    //打印分页
    function showPageInfo(totalCount) {
        var info = $(".pagination");
        var nowPageNum = subpage;
        var totalCount=totalCount
        var allPageNum = Math.ceil(totalCount / pageSize);
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
                prev.innerHTML = '上一页';
                prev.setAttribute('href','#');
                prev.onclick = function () {
                    subpage = nowPageNum - 1;
                    getList();
                }
            } else {
                var prev = document.createElement("span");
                prev.className = "prev disabled";
                prev.innerHTML = '上一页';
            }
            info.find(".pagination-pages").append(prev);

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
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            subpage = Number($(this).text());
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
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            subpage = Number($(this).text());
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
                    } else {
                        if (i <= 2) {
                            continue;
                        } else {
                            if (nowPageNum == i) {
                                var page = document.createElement("span");
                                page.className = "curr";
                                page.innerHTML = i;
                            } else {
                                var page = document.createElement("a");
                                page.innerHTML = i;
                                page.setAttribute('href','#');
                                page.onclick = function () {
                                    subpage = Number($(this).text());
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
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            subpage = Number($(this).text());
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
                next.innerHTML = '下一页';
                next.setAttribute('href','#');
                next.onclick = function () {
                    subpage = nowPageNum + 1;
                    getList();
                }
            } else {
                var next = document.createElement("span");
                next.className = "next disabled";
                next.innerHTML = '下一页';
            }
            info.find(".pagination-pages").append(next);

            info.show();

        } else {
            info.hide();
        }
    }
	
})
