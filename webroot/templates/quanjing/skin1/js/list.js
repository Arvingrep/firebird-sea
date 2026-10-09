/**
 * Created by Administrator on 2018/5/30.
 */
var listObj = $("#mainList");

$(function(){
    getList();
    $(".main-tab ul li a").click(function(){
        var t = $(this).parent(), index = t.index();
        if(!t.hasClass("curr")){
            t.addClass("curr").siblings("li").removeClass("curr");
            
            $(".tab-con").eq(index).addClass('all').siblings('.tab-con').removeClass('all');
            listObj.attr("data-page", 1).html('<div class="loading">正在加载...</div>');
            getList();

        }
    });
    //tab 切换  全部最新人气
    $(".pos-item a").bind("click", function(){
        var t = $(this);
        if(!$(this).hasClass("curr")){
            $(".pos-item a").removeClass("curr");
            $(this).addClass("curr");

            listObj.attr("data-page", 1).html('<div class="loading">正在加载...</div>');
            getList();
        }
    });


});

//拼接列表
function joinList(list){
    var html = [];
    for(var i = 0; i < list.length; i++){

        html.push('<li>');
        html.push('<a href="'+list[i].url+'" target="_blank">');
        html.push('<div class="v-img">');
        html.push('<img src="'+(list[i].litpic ? list[i].litpic : staticPath + 'images/blank.gif')+'" >');
        html.push('<div class="cover-img">');
        html.push('<img src="'+templatePath+'images/play.png" >');
        html.push('</div>');
        html.push('</div>');
        html.push('<h5>'+list[i].title+'</h5>');
        html.push('<p><span><i class="v-play"></i>'+list[i].click+'</span><span><i class="v-comment"></i>'+list[i].common+'</span><span><i class="v-time"></i>'+huoniao.transTimes(list[i].pubdate, 2)+'</span></p>');
        html.push('</a>');
        html.push('</li>');

    }
    return html.join("");

}
//加载列表
function getList(){
    listObj.html("<div class='loading'>正在加载，请稍后</div>");
    var pid = 0, group = 0;
    $(".main-tab ul li").each(function(i){
        var t = $(this), tid = t.attr("data-id");
        if(t.hasClass("curr")){
            group = i;
            pid = tid;
            return;
        }
    })
    if(pid){
        typeid = pid;
        $(".tab-con").eq(group).find("a").each(function(){
            var t = $(this), tid = t.attr("data-id");
            if(t.hasClass("curr")){
                typeid = tid;
                return;
            }
        })
    }

    //异步获取用户信息
    $.ajax({
        url: "/include/ajax.php?service=quanjing&action=qlist&page="+atpage+"&pageSize="+pageSize+"&typeid="+typeid,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if(data && data.state == 100){
                totalCount = data.info.pageInfo.totalCount;
                if(data.info.list.length){
                    if(listObj.find("li").length > 0){
                        listObj.append(joinList(data.info.list));
                    }else{
                        listObj.html(joinList(data.info.list));
                    }
                }else{
                    listObj.html("<div class='empty'>暂无相关信息</div>");
                }
                
                showPageInfo();
            }else{
                showPageInfo();
                if(listObj.find("li").length <= 0){
                    listObj.html("<div class='empty'>暂无相关信息</div>");
                }
            }
        },
        error: function(){
            totalCount = 0;
            showPageInfo();
            if(listObj.find("li").length <= 0){
                listObj.html("<div class='empty'>暂无相关信息</div>");
            }
        }
    });
}

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
            prev.innerHTML = langData['siteConfig'][6][33];
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
            next.innerHTML = langData['siteConfig'][6][34];
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