$(function () {
    var pageSize = 9;
    // //导航全部分类
    $(".lnav").find('.category-popup').hide();

    $(".lnav").hover(function(){
        $(this).find(".category-popup").show();
    }, function(){
        $(this).find(".category-popup").hide();
    });

    $('.filter .filter-right .one-filter li').click(function () {
        $(this).find('.two-filter').show();
        $(this).siblings().find('.two-filter').hide();
    });

    // 商圈切换
    $('.filter-second .sort-all').click(function () {
        $(this).addClass('on');
    });
    $('.filter .filter-right .one-filter a').click(function(){
    $('.filter-second .sort-all').removeClass('on');
    $(this).addClass('curr').siblings().removeClass('curr');
    var i = $(this).index();
    $('.filter.filter-second .two-filter').eq(i).addClass('show').siblings().removeClass('show');
    });

    $('.filter .filter-right .two-filter a').click(function(){
        $(this).addClass('on').siblings().removeClass('on');
    });

    $('.filter-second .sort-all').click(function () {
        $('.filter.filter-second .two-filter').removeClass('show');
        $('.filter .filter-right .one-filter a').removeClass('curr');
    });


    //展开更多优惠券
        $('#mod-item ul li .btn ').live('click',function () {
            var t= $(this);
            if( t.find('.icon').hasClass('shou')) {
                $(this).find('.text').text('展开');
                $(this).find('.icon').removeClass('shou');
                t.parents('li').find('.more').addClass('mq');
            }else{

                $(this).find('.text').text('收起');
                $(this).find('.icon').addClass('shou');
                t.parents('li').find('.more').removeClass('mq');
            }
            return false;
        });





    //排序
    $("#bar-area .l a").bind("click", function(){

        var t = $(this), sort = t.attr("data-sort"), index = t.index(), load = 0;

        //默认
        if(index == 0){
            if(!t.hasClass("active")){
                t.addClass("active").siblings("a").removeClass("active price-up price-down");
                load = 1;
            }
        }else{

            //价格
            if(t.hasClass("price")){

                if(t.hasClass("price-up")){
                    t.removeClass("price-up").addClass("active price-down").siblings("a").removeClass("active");
                    t.attr("data-sort", 4);
                }else{
                    t.removeClass("price-down").addClass("active price-up").siblings("a").removeClass("active");
                    t.attr("data-sort", 3);
                }
                load = 1;

                //其他情况
            }else{

                //下
                if(t.hasClass("sort-down")){
                    if(!t.hasClass("active")){
                        t.addClass("active sort-down-active").siblings("a").removeClass("active price-up price-down");
                        load = 1;
                    }

                    //上
                }else{
                    if(!t.hasClass("active")){
                        t.addClass("active sort-up-active").siblings("a").removeClass("active price-up price-down");
                        load = 1;
                    }
                }

            }

        }

        if(load){
            atpage = 1;
            onefindList();
        }

    });

    //自定义属性筛选
    $(".flags label").bind("click", function(){
        var t = $(this);
        t.hasClass("curr") ? t.removeClass("curr") : t.addClass("curr");
        atpage = 1;
        onefindList();
    });

    var win = $(window), modList = $("#bar-area"), modTop = modList.offset().top;
    $(window).scroll(function() {
        var stop = win.scrollTop();
        stop > modTop ? modList.addClass("fixed") : modList.removeClass("fixed");
    });


    var atpage = 1, isload = false, lng='',lat='';
    onefindList();
    //获取商圈数据
    function onefindList(tr){
        var orderby = $("#bar-area .l").find(".active").attr("data-sort");

        $(".mod-list ul").html("");

        var data = [];
        data.push("page="+atpage);
        data.push("&orderby="+orderby);
        data.push("&pageSize="+pageSize);
        data.push("typeid="+typeid);
        data.push("addrid="+addrid);
        data.push("circle="+circle);
        data.push("voucher=1");
        $(".mod-list").append('<div class="loading">加载中...</div>');
        $(".mod-list .loading").remove();

        $.ajax({
            url:"/include/ajax.php?service=tuan&action=storeList",
            data: data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data){
                    if(data.state == 100){
                        $(".mod-list .loading").remove();
                        var list = data.info.list, html = [];
                        if(list.length > 0){
                            for(var i = 0; i < list.length; i++){
                                html.push('<li class="fn-clear">');
                                html.push('<a target="_blank" href="'+list[i].url+'" class="voucher">');
                                html.push('<div class="sq_img">');
                                html.push('<img src="'+list[i].litpic+'">');
                                html.push('</div>');
                                html.push('<div class="info">');
                                html.push('<p class="name">'+list[i].company+'</p>');
                                html.push('<p class="fen">综合评分 '+list[i].rating+'</p>');
                                html.push('<p class="addr">'+list[i].address+'</p>');
                                if(list[i].voucheArr!='' && list[i].voucheArr!=undefined && list[i].voucheArr!=null){
                                    html.push('<div class="quan">');
                                    html.push('<p class="qname">'+list[i].voucheArr['0']['packagerow']['0'] + '&nbsp;' + list[i].voucheArr['0']['packagerow']['1']+'</p>');
                                    html.push('<p class="price"><span class="pf">'+echoCurrency('symbol')+' <strong>'+list[i].voucheArr['0']['price']+'</strong></span> <span class="num">已售 '+list[i].voucheArr['0']['sale']+'</span></p>');
                                    html.push('</div>');
                                    if(list[i].voucheArr.length > 1){
                                        for(var j = 1; j < list[i].voucheArr.length; j++){
                                            html.push('<div class="more mq">');
                                            html.push('<div class="quan">');
                                            html.push('<p class="qname">'+list[i].voucheArr[j]['packagerow']['0'] + '&nbsp;' + list[i].voucheArr[j]['packagerow']['1']+'</p>');
                                            html.push('<p class="price"><span class="pf">'+echoCurrency('symbol')+' <strong>'+list[i].voucheArr[j]['price']+'</strong></span> <span class="num">已售 '+list[i].voucheArr[j]['sale']+'</span></p>');
                                            html.push('</div>');
                                            html.push('</div>');
                                        }
                                        html.push('<span class="btn"><span class="text">展开</span> <i class="icon"></i></span>');
                                    }
                                }
                                html.push('</div>');
                                html.push('</a>');
                                html.push('</li>');
                            }
                            $(".mod-list ul").html(html.join(""));
                            totalCount = data.info.pageInfo.totalCount;
                            showPageInfo();
                        }else{
                            $(".mod-list ul").html('<div class="loading">暂无相关信息</div>').show();
                        }
                    }else{
                        $(".mod-list ul").html('<div class="loading">'+data.info+'</div>').show();
                    }
                }else{
                    $(".mod-list ul").html('<div class="loading">加载失败</div>').show();
                }
            },
            error: function(){
                $(".mod-list ul").html('<div class="loading">网络错误，加载失败！</div>').show();
            }
        });
    };


    //翻页
    $("#bar-area .pagination").delegate("a", "click", function(){
        var cla = $(this).attr("class");
        if(cla == "pg-prev"){
            atpage -= 1;
        }else{
            atpage += 1;
        }
        onefindList();
    });

    //打印分页
    function showPageInfo() {
        var info = $("#mod-item .pagination");
        var nowPageNum = atpage;
        var allPageNum = Math.ceil(totalCount/pageSize);
        var pageArr = [];

        info.html("").hide();

        var pageList = [];
        //上一页
        if(atpage > 1){
            pageList.push('<a href="javascript:;" class="pg-prev"><i class="trigger"></i><span class="text">上一页</span></a>');
        }else{
            pageList.push('<span class="pg-prev"><i class="trigger"></i><span class="text">上一页</span></span>');
        }

        //下一页
        if(atpage >= allPageNum){
            pageList.push('<span class="pg-next"><span class="text">下一页</span><i class="trigger"></i></span>');
        }else{
            pageList.push('<a href="javascript:;" class="pg-next"><span class="text">下一页</span><i class="trigger"></i></a>');
        }

        //页码统计
        pageList.push('<span class="sum"><em>'+atpage+'</em>/'+allPageNum+'</span>');

        $("#bar-area .pagination").html(pageList.join(""));

        var pages = document.createElement("div");
        pages.className = "pagination-pages fn-clear";
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
                    atpage = nowPageNum - 1;
                    onefindList();
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
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            onefindList();
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
                        page.setAttribute('href','#');
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            onefindList();
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
                                    onefindList();
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
                            onefindList();
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
                    atpage = nowPageNum + 1;
                    onefindList();
                }
                info.find(".pagination-pages").append(next);
            }

            //输入跳转
            var insertNum = Number(nowPageNum + 1);
            if (insertNum >= Number(allPageNum)) {
                insertNum = Number(allPageNum);
            }

            var redirect = document.createElement("div");
            redirect.className = "redirect";
            redirect.innerHTML = '<i>到</i><input id="prependedInput" type="number" placeholder="页码" min="1" max="'+allPageNum+'" maxlength="4"><i>页</i><button type="button" id="pageSubmit">确定</button>';
            info.find(".pagination-pages").append(redirect);

            //分页跳转
            info.find("#pageSubmit").bind("click", function(){
                var pageNum = $("#prependedInput").val();
                if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
                    atpage = Number(pageNum);
                    onefindList();
                } else {
                    $("#prependedInput").focus();
                }
            });

            info.show();

        }else{
            info.hide();
        }
    }





});
