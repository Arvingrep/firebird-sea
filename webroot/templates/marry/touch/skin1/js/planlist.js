$(function () {
    var isload = false;
    //APP端取消下拉刷新
    toggleDragRefresh('off'); 

    var detailList;
    detailList = new h5DetailList();
    detailList.settings.appendTo = ".plan-list";
    setTimeout(function(){detailList.removeLocalStorage();}, 800);

    var dataInfo = {
        id: '',
        url: '',
        parid: '',
        typeid: '',
        typename: '',
        cityName: '',
        parAddrid: '',
        addrid: '',
        orderby: '',
        orderbyName: '',
        isBack: true
    };

    $('.plan-list').delegate('li', 'click', function(){
        var t = $(this), a = t.find('a'), url = a.attr('data-url'), id = t.attr('data-id');

        var orderby = $('.choose-tab .orderby').attr('data-id'),
            orderbyName = $('.choose-tab .orderby span').text(),

            parid = $('#choose-info li.active').attr('data-id'),
            typeid = $('.choose-tab .typeid').attr('data-id'),
            typename = $('.choose-tab .typeid span').text(),
            parAddrid = $('#choose-area .active').attr('data-id'),
            addrid = $('.choose-tab .addrid').attr('data-id'),
            cityName = $('.choose-tab .addrid span').text();

        dataInfo.url = url;
        dataInfo.parid = parid;
        dataInfo.typeid = typeid;
        dataInfo.typename = typename;
        dataInfo.cityName = cityName;
        dataInfo.parAddrid = parAddrid;
        dataInfo.addrid = addrid;
        dataInfo.orderby = orderby;
        dataInfo.orderbyName = orderbyName;

        detailList.insertHtmlStr(dataInfo, $("#planlist").html(), {lastIndex: page});

        setTimeout(function(){location.href = url;}, 500);

    })

    // 显示下拉框
    $('.choose-tab  li').click(function(){
        var index = $(this).index();
        var local = $('.choose-local').eq(index);
        if ( local.css("display") == "none") {
            $(this).addClass('active').siblings('.choose-tab li').removeClass('active');
            local.show().siblings('.choose-local').hide();
            $('.mask').show();
        }else{
            $(this).removeClass('active');
            local.hide();
            $('.mask').hide();
        }
    });

    // 二级类别切换
    $('.choose-list .choose-city .category-wrapper .brand-list li').click(function(){
        var t = $(this), index = t.index(), id = t.attr("data-id");
        $(this).addClass('curr').siblings().removeClass('curr');
        
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=marry&action=addr&type="+id,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    var html = [], list = data.info;
                    html.push('<li data-id="'+id+'">不限</li>');
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
                    }
                    $(".brand-wrapper ul").html(html.join(""));
                    // chooseSecond = new iScroll("choose-area-second", {vScrollbar: false,mouseWheel: true,click: true});
                }else if(data.state == 102){
                    $(".brand-wrapper ul").html('<li data-id="'+id+'">'+langData['marry'][5][39]+'</li>');
                }else{
                    $(".brand-wrapper ul").html('<li class="load">'+data.info+'</li>');
                }
            },
            error: function(){
                $(".brand-wrapper ul").html('<li class="load">网络错误，加载失败！</li>');
            }
        });

        $('.choose-list .choose-city .brand-wrapper ul').addClass('show');
    });
    //
    $('.choose-city .brand-wrapper ul').delegate("li", "click", function(){
        var id = $(this).attr("data-id");
        $(this).addClass('active').siblings().removeClass('active');
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab .addrid').attr("data-id", id);
        $('.choose-tab .addrid span').html($(this).html());
        $('.choose-tab  li').removeClass('active');
        page = 1;
        getList();
    });

    $('.choose-list .choose-city .category-wrapper .city-top').click(function () {
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab .addrid span').html($(this).html());
        $('.choose-tab  li').removeClass('active');
        $('.choose-tab .addrid').attr("data-id", '');
        page = 1;
        getList();
    });



    // 酒店筛选
    $('.choose-list .choose-hotel li').click(function () {
        $(this).addClass('active').siblings().removeClass('active');
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab .hotels span').html($(this).html());
        $('.choose-tab  li').removeClass('active');
    });

    // 排序筛选
    $('.choose-list .choose-sort li').click(function () {
        var id = $(this).attr("data-id");
        $(this).addClass('active').siblings().removeClass('active');
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab .orderby').attr("data-id", id);
        $('.choose-tab .orderby span').html($(this).html());
        $('.choose-tab  li').removeClass('active');
        page = 1;
        getList();
    });

    $('.mask').click(function () {
        $('.mask').hide();
        $('.choose-local').hide();
        $('.choose-tab  li').removeClass('active');
    });

     //初始加载
     if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){
        getList();
    }else {
        getData();
        setTimeout(function(){
            detailList.removeLocalStorage();
        }, 500)
    }

    function  getList(){
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("istype=2");
        $(".choose-tab li").each(function(){
            data.push($(this).attr("data-type") + "=" + $(this).attr("data-id"));
        });

        isload = true;
        if(page == 1){
            $(".loading").html('<span>'+langData['marry'][5][22]+'</span>');
        }else{
            $(".loading").html('<span>'+langData['marry'][5][22]+'</span>');
        }

        $.ajax({
            url: masterDomain + "/include/ajax.php?service=marry&action=storeList&filter=2&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        //var planUrl = plandetailUrl.replace("%id%", list[i].id);
                        //html.push('<li class="fn-clear"><a href="javascript:;" data-url="'+planUrl+'">');
                        html.push('<li class="fn-clear"><a href="javascript:;" data-url="'+list[i].url+'">');
                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                        html.push('<div class="img"><img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                        html.push('<div class="info">');
                        html.push('<p class="name">'+list[i].title+'</p>');
                        html.push('<p class="type">'+langData['marry'][0][47]+' '+list[i].anli+' | '+langData['marry'][0][48]+' '+list[i].taoxi+'</p>');
                        html.push('<p class="tel">'+langData['marry'][0][19]+': '+list[i].tel+'</p>');
                        html.push('<p class="adr">'+langData['marry'][0][20]+': '+list[i].address+'</p>');
                        html.push('</div>');
                        html.push('<span class="price"><em>'+echoCurrency('symbol')+list[i].price+' </em>'+langData['marry'][0][6]+'</span>');
                        html.push('</a></li>');
                    }
                    if(page == 1){
                        $(".hotel-box ul").html(html.join(""));
                    }else{
                        $(".hotel-box ul").append(html.join(""));
                    }
                    isload = false;

                    if(page >= pageinfo.totalPage){
                        isload = true;
                        $(".loading").html('<span>'+langData['marry'][5][29]+'</span>');
                    }
                }else{
                    if(page == 1){
                        $(".hotel-box ul").html("");
                    }
                    $(".loading").html('<span>'+data.info+'</span>');
                }
            },
            error: function(){
                isload = false;
                if(page == 1){
                    $(".hotel-box ul").html("");
                }
                //网络错误，加载失败
                $(".loading").html('<span>'+langData['marry'][5][23]+'</span>');
            }
        });

    }

    //滚动底部加载
    $(window).scroll(function() {
        var sh = $('.hotel-box .loading').height();
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - sh - w;
        //服务列表
        if ($(window).scrollTop() > s_scroll && !isload) {
            page++;
            getList();
        };
    });

    // 本地存储的筛选条件
    function getData() {

        var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];

        page = detailList.getLocalStorage()['extraData'].lastIndex;

        if (filter.typename != '') {$('.choose-tab .typeid span').text(filter.typename);}
        if (filter.parid != '') {
            $('#choose-info li[data-id="'+filter.parid+'"]').addClass('active').siblings('li').removeClass('active');
        }
        if (filter.typeid != '') {
            $('.choose-tab .typeid').attr('data-id', filter.typeid);
        }
        if (filter.cityName != '') {$('.choose-tab .addrid span').text(filter.cityName);}
        if (filter.parAddrid != '') {
            $('#choose-area li[data-id="'+filter.parAddrid+'"]').addClass('active').siblings('li').removeClass('active');
        }
        if (filter.addrid != '') {
            $('.choose-tab .addrid').attr('data-id', filter.addrid);
        }

        // 排序选中状态
        if (filter.orderby != "") {
            $('.choose-tab .orderby').attr('data-id', filter.orderby);
            $('#choose-sort li[data-id="'+filter.orderby+'"]').addClass('on').siblings('li').removeClass('on');
        }

    }




});