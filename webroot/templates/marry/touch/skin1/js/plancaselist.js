$(function () {
    var isload = false;

    getList();
    var typeid = 0;

    // 导航切换
    $(".comm-nav li").bind("click", function(){
        $(this).addClass('active').siblings().removeClass('active');
        var end = $(this).offset().left + $(this).width() / 2 - $('body').width() /2;
        var star = $(".comm-nav ul").scrollLeft();
        $('.comm-nav ul').scrollLeft(end + star);
        typeid = $(this).attr('data-typeid');
        getList(1)
    })

    function  getList(tr){
        if(tr){
            page =1;
            $(".seller-case ul").html('');
        }
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("detailid="+storeId);
        data.push("typeid="+typeid);

        isload = true;
        if(page == 1){
            $(".loading").html('<span>'+langData['marry'][5][22]+'</span>');
        }else{
            $(".loading").html('<span>'+langData['marry'][5][22]+'</span>');
        }

        $.ajax({
            url: masterDomain + "/include/ajax.php?service=marry&action=plancaseList&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li><a href="'+detailUrl.replace('%',list[i].id)+'">');
                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                        html.push('<div class="img-box"><img src="'+pic+'" alt=""></div>');
                        html.push('<p class="name">'+list[i].title+'</p>');
                        html.push('<div class="msg">'+list[i].holdingtimeSource+'</div>');
                        html.push('</a></li>');
                    }
                    if(page == 1){
                        $(".seller-case ul").html(html.join(""));
                    }else{
                        $(".seller-case ul").append(html.join(""));
                    }
                    isload = false;

                    if(page >= pageinfo.totalPage){
                        isload = true;
                        $(".loading").html('<span>'+langData['marry'][5][29]+'</span>');
                    }
                }else{
                    if(page == 1){
                        $(".seller-case ul").html("");
                    }
                    $(".loading").html('<span>'+data.info+'</span>');
                }
            },
            error: function(){
                isload = false;
                if(page == 1){
                    $(".seller-case ul").html("");
                }
                //网络错误，加载失败
                $(".loading").html('<span>'+langData['marry'][5][23]+'</span>');
            }
        });
        
    }

    //滚动底部加载
    $(window).scroll(function() {
        var sh = $('.seller-case .loading').height();
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - sh - w;
        if ($(window).scrollTop() > s_scroll && !isload) {
            page++;
            getList();
        };
    });

});