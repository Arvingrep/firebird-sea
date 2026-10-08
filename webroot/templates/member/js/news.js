/**
 * Created by Administrator on 2018/5/18.
 */
$(function(){
    // 判断浏览器是否是ie8
     if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.app-con .down .con-box:last-child').css('margin-right','0');
        $('.wx-con .c-box:last-child').css('margin-right','0');
        $('.module-con .box-con:last-child').css('margin-right','0');
        $('.wrap3 ul li:nth-child(4n)').css('margin-right','0');
        $('.wrap4 ul li:nth-child(4n)').css('margin-right','0');

     }


    // 焦点图
    $("#slideBox3").slide({mainCell:".bd ul",autoPlay:true,});

    // 获取汽车数据
    getNewsList(1);
    function  getNewsList(tr){
        $(".list ul").html('<div class="loading"><span>'+langData['education'][9][17]+'</span></div>'); //加载中
        var id = $('.news_tab ul li.active').attr("data-id");
        var url ="/include/ajax.php?service=car&action=news&page="+ subpage +"&pageSize=4" + "&typeid=" + id;
        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                var datalist = data.info.list, html = [];
                if(data.state == 100){
                    $(".list .loading").remove();
                    totalpage = data.info.pageInfo.totalPage;
                    var totalCount = data.info.pageInfo.totalCount;
                    for(var i=0;i<datalist.length;i++){
                        html.push('<li class="fn-clear">');
                        var litpic = datalist[i].litpic != "" && datalist[i].litpic != undefined ? huoniao.changeFileSize(datalist[i].litpic, "small") : "/static/images/404.jpg";
                        // if(datalist[i].litpic){
                        html.push('<div class="img-box"><a href="'+datalist[i].url+'"><img src="'+litpic+'" alt=""></a></div>');
                        //}
                        html.push('<div class="info"><h4 class="h4_tit"><a href="'+datalist[i].url+'">'+datalist[i].title+'</a></h4>');
                        html.push('<p class="info-desc">'+datalist[i].description+'</p>');
                        html.push('<p class="see-info">');
                        html.push(' <span class="new-sour"><i></i>'+datalist[i].source+'</span>');
                        html.push(' <span class="see-num"><i></i>'+datalist[i].click+'</span>');
                        html.push(' <span class="pubday"><i></i>'+datalist[i].floortime+'</span></p>');
                        html.push(' </div>');
                        html.push('</li>');
                    }
                    $('.list ul').append(html.join(''));
                    isload = false;
                     showPageInfo(totalCount);
                }else {
                    isload = true;
                     $(".list ul").append('<div class="loading"><span>'+langData['siteConfig'][20][126]+'</span></div>'); //暂无相关信息
                }
            },
            error: function(){
                 $(".list ul").append('<div class="loading"><span>'+langData['education'][8][3]+'</span></div>'); //网络错误，加载失败！
            }
        })
    }

    $('.news_tab ul li').click(function () {
        var id = $(this).attr('data-id');
        $(this).addClass('active').siblings().removeClass('active');
        getNewsList(1);
    });

        //打印分页1
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
                prev.innerHTML = langData['siteConfig'][6][33];//上一页
                prev.setAttribute('href','#');
                prev.onclick = function () {
                    subpage = nowPageNum - 1;
                    getNewsList();
                }
            } else {
                var prev = document.createElement("span");
                prev.className = "prev disabled";
                prev.innerHTML = langData['siteConfig'][6][33];//上一页
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
                            getNewsList();
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
                            getNewsList();
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
                                    getNewsList();
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
                            getNewsList();
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
                next.setAttribute('href','#');
                next.onclick = function () {
                    subpage = nowPageNum + 1;
                    getNewsList();
                }
            } else {
                var next = document.createElement("span");
                next.className = "next disabled";
                next.innerHTML = langData['siteConfig'][6][34];//下一页
            }
            info.find(".pagination-pages").append(next);

            info.show();

        } else {
            info.hide();
        }
    } 





})
