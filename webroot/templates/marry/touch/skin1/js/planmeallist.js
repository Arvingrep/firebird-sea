$(function () {
    var isload = false;

    getList();
    // 导航切换
    $(".comm-nav li").bind("click", function(){
        $(this).addClass('active').siblings().removeClass('active');
        var end = $(this).offset().left + $(this).width() / 2 - $('body').width() /2;
        var star = $(".comm-nav ul").scrollLeft();
        $('.comm-nav ul').scrollLeft(end + star);
        getList(1)
    })
    function  getList(tr){
        if(tr){
            page =1;
            $("#planmeallist").html('');
        }
        var type = $('.comm-nav li.active').attr('data-typeid');
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("detailid="+storeId);
        data.push("typeid="+type);
        data.push("istype="+istype);
        data.push("businessid="+businessid);

        isload = true;
        if(page == 1){
            $(".loading").html('<span>'+langData['marry'][5][22]+'</span>');
        }else{
            $(".loading").html('<span>'+langData['marry'][5][22]+'</span>');
        }

        var url = "/include/ajax.php?service=marry&action=planmealList&"+data.join("&");
        if(type == 7){
            url = "/include/ajax.php?service=marry&action=marryhostList&"+data.join("&");
        }

        $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li class="fn-clear mealLi"><a href="'+list[i].url+'">');
                        html.push('<span class="clafy">'+ list[i].typename+'</span>');
                        html.push('<div class="topImg">');
                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                        html.push('<img src="'+pic+'" alt="">');
                        html.push('</div>');
                        html.push('<div class="mealInfo">');
                        html.push('<h2 class="name">'+list[i].title+'</h2>');
                        html.push('<div class="other fn-clear">');
                        html.push('<p class="pri"><strong>'+echoCurrency('symbol')+list[i].price+'</strong>起</p>');//起
                        html.push('<p class="tag">');
                        // html.push('<span class="ddyl">到店有礼</span>');
                        // html.push('<span class="zthl">主题婚礼</span>');
                        var tLenn = list[i].tagAll.length <2 ?list[i].tagAll.length : 2;
                        var conarr =list[i].tagAll;
                        for(var n=0;n<tLenn;n++){
                            // html.push('<span  class="zthl">'+conarr[n].jc+'</span>');
                            html.push('<span class="'+conarr[n].py+'">'+conarr[n].jc+'</span>');

                        }
                        html.push('</p>');
                        html.push('</div>');
                        html.push('</div>');
                        html.push('</a></li>');
                    }
                    if(page == 1){
                        $("#planmeallist").html(html.join(""));
                    }else{
                        $("#planmeallist").append(html.join(""));
                    }
                    isload = false;

                    if(page >= pageinfo.totalPage){
                        isload = true;
                        $(".loading").html('<span>'+langData['marry'][5][29]+'</span>');
                    }
                }else{
                    if(page == 1){
                        $("#planmeallist").html("");
                    }
                    $(".loading").html('<span>'+data.info+'</span>');
                }
            },
            error: function(){
                isload = false;
                if(page == 1){
                    $("#planmeallist").html("");
                }
                //网络错误，加载失败
                $(".loading").html('<span>'+langData['marry'][5][23]+'</span>');
            }
        });

    }

    //滚动底部加载
    $(window).scroll(function() {
        var sh = $('.meal .loading').height();
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - sh - w;
        if ($(window).scrollTop() > s_scroll && !isload) {
            page++;
            getList();
        };

    });

});