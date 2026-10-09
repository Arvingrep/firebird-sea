$(function () {
    var isload = false;
    //APP端取消下拉刷新
    toggleDragRefresh('off'); 

    var detailList;
    detailList = new h5DetailList();
    detailList.settings.appendTo = ".hotel-list";
    setTimeout(function(){detailList.removeLocalStorage();}, 800);

    var dataInfo = {
        id: '',
        url: '',
        typeid: '',
        typename: '',
        cityName: '',
        parAddrid: '',
        addrid: '',
        orderby: '',
        price: '',
        isBack: true
    };

    $('.hotel-list').delegate('li', 'click', function(){
        var t = $(this), a = t.find('a'), url = a.attr('data-url'), id = t.attr('data-id');

        var orderby = $('.zhOrder li.chosed').attr('data-id'),
            typeid = $('.choose-tab .typeid').attr('data-id'),
            typename = $('.choose-tab .typeid span').text(),
            parAddrid = $('#choose-area .active').attr('data-id'),
            addrid = $('.choose-tab .addrid').attr('data-id'),
            cityName = $('.choose-tab .addrid span').text(),
            price = $('#pricetemp').val();

        dataInfo.url = url;
        dataInfo.typeid = typeid;
        dataInfo.typename = typename;
        dataInfo.cityName = cityName;
        dataInfo.parAddrid = parAddrid;
        dataInfo.addrid = addrid;
        dataInfo.orderby = orderby;
        dataInfo.price = price;

        detailList.insertHtmlStr(dataInfo, $("#hotellist").html(), {lastIndex: page});

        setTimeout(function(){location.href = url;}, 500);

    })

    var myscroll_area = new iScroll("choose-area", {vScrollbar: false});
    var myscroll_hotel = new iScroll("hotel-box", {vScrollbar: false});
    // 显示下拉框
    $('.choose-tab  li').click(function(){
        var index = $(this).index();
        var local = $('.choose-local').eq(index);
        if ( local.css("display") == "none") {
            $(this).addClass('active').siblings('.choose-tab li').removeClass('active');
            local.show().siblings('.choose-local').hide();
            $('.mask').show();
            myscroll_hotel.refresh();
            myscroll_area.refresh();
        }else{
            $(this).removeClass('active');
            local.hide();
            $('.mask').hide();
        }
    });

    // 展开二级区域
    var chooseAreaSecond = null;
    $('#choose-area li').click(function(){
        var t = $(this), index = t.index(), id = t.attr("data-id"), localIndex = t.closest('.choose-local').index();
        if (index == 0) {
            $('#area-box .choose-stage-l').removeClass('choose-stage-l-short');
            t.addClass('current').siblings().removeClass('active');
            t.closest('.choose-local').hide();
            $('.choose-tab li').eq(localIndex).removeClass('active').attr("data-id", 0).find('span').text("不限");
            $('.mask').hide();
            getList(1);
        }else{
            t.siblings().removeClass('current');
            t.addClass('active').siblings().removeClass('active');
            $('#area-box .choose-stage-l').addClass('choose-stage-l-short');
            $('.choose-stage-r').show();
            chooseAreaSecond = new iScroll("choose-area-second", {vScrollbar: false,mouseWheel: true,click: true});

            $.ajax({
                url: masterDomain + "/include/ajax.php?service=house&action=addr&type="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    if(data && data.state == 100){
                        var html = [], list = data.info;
                        html.push('<li data-id="'+id+'">不限</li>');
                        for (var i = 0; i < list.length; i++) {
                            html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
                        }
                        $("#choose-area-second").html('<ul>'+html.join("")+'</ul>');
                        chooseSecond = new iScroll("choose-area-second", {vScrollbar: false,mouseWheel: true,click: true});
                    }else if(data.state == 102){
                        $("#choose-area-second").html('<ul><li data-id="'+id+'">不限</li></ul>');
                    }else{
                        $("#choose-area-second").html('<ul><li class="load">'+data.info+'</li></ul>');
                    }
                },
                error: function(){
                    $("#choose-area-second").html('<ul><li class="load">网络错误，加载失败！</li></ul>');
                }
            });
        }
    })

    //点击二级区域
    $('#choose-area-second').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        $('.choose-local').hide();
        $('.mask').hide();
        getList(1);

    })


    //点击小箭头 收起
    $('.sort').click(function () {
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab  li').removeClass('active');
    });





    // 酒店筛选
    $('.choose-list .choose-hotel li').click(function () {
        var id = $(this).attr("data-id");
        $(this).addClass('active').siblings().removeClass('active');
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab .typeid').attr("data-id", id);
        $('.choose-tab .typeid span').html($(this).html());
        $('.choose-tab  li').removeClass('active');
        page = 1;
        getList();
    });

    //综合排序
    $('.otherFilter .orderby').click(function(){
        $('.choose-more').animate({"right":'0'},200);
        $('.mask').addClass('spe').show();
        $('.choose-local').hide();
        $('.choose-tab li').removeClass('active');
    })
    // 确认
    $('.btn_confirm').click(function(){
        $('.mask').removeClass('spe').hide();
        $('.choose-more').animate({"right":'-100%'},200);       
        getList(1);
    });

    // 取消
    $('.btn_reset'). click(function() {
        $('.mask').removeClass('spe').hide();
        $('.choose-more').animate({"right":'-100%'},200);
    });
    //自定义价格
    $("#price_u").ionRangeSlider({
        skin: "big",
        type: "double",
        min: 0,
        max: 5000,
        from: 0,
        to: 5000,
        grid: true,
        step: 1000,
        from_fixed: false,  // fix position of FROM handle
        to_fixed: false     // fix position of TO handle
    });

    var slider = $("#price_u").data("ionRangeSlider");
    
    $("#price_u").on("change", function () {
        var $inp = $(this);
        var v = $inp.prop("value");     // input value in format FROM;TO
        var from = $inp.data("from");   // input data-from attribute
        var to = $inp.data("to");       // input data-to attribute

        if(to==1000){
           $('.price_text').html(''+echoCurrency('symbol')+from+'-'+langData['travel'][7][63]);
           $("#pricetemp").val(from + ',' + '1000');
        }else{
            $('.price_text').html(''+echoCurrency('symbol')+from+'-'+echoCurrency('symbol')+to);
            $("#pricetemp").val(from + ',' + to);
        }
        
        $('.zhPrice li').removeClass('chosed');
    });
    // 排序筛选
    $('.zhOrder li').click(function(){
        if($(this).hasClass('chosed')){
            $(this).removeClass('chosed');
            $(this).siblings('li').removeClass('chosed');
        }else{
            $(this).addClass('chosed').siblings('li').removeClass('chosed');
        }

    });

    $('.zhPrice li').click(function(){
        slider.reset();
        $('.price_text').html('');
        if($(this).hasClass('chosed')){
            $(this).removeClass('chosed');
            $(this).siblings('li').removeClass('chosed');
        }else{
            $(this).addClass('chosed').siblings('li').removeClass('chosed');
            var pr = $(this).attr('data-id')
            $("#pricetemp").val(pr);
        }
        

    });
    
    
    $('.mask').click(function () {
        $('.mask').removeClass('spe').hide();
        $('.choose-local').hide();
        $('.choose-tab li').removeClass('active');
        $('.choose-more').animate({"right":'-100%'},200);
    });
    
    // 获取酒店数据
     //初始加载
     if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){

        getList(1);
    }else {
        getData();
        setTimeout(function(){
            detailList.removeLocalStorage();
        }, 500)
        $(".loading").html('');
    }

    function  getList(){
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("istype=1");
        $(".choose-tab li").each(function(){
            data.push($(this).attr("data-type") + "=" + $(this).attr("data-id"));
        });
        var ord = $('.zhOrder li.chosed').attr('data-id');
        if(ord != undefined)
        data.push("&orderby="+ord)
        if($("#pricetemp").val()!=''){
          data.push("&price="+$("#pricetemp").val())  
        }
        isload = true;
        if(page == 1){
            $(".loading").html('<span>'+langData['marry'][5][22]+'</span>');
        }else{
            $(".loading").html('<span>'+langData['marry'][5][22]+'</span>');
        }

        $.ajax({
            url: "/include/ajax.php?service=marry&action=storeList&filter=8&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li class="fn-clear">');
                         html.push('<a href="javascript:;" data-url='+list[i].url +'>');
                        // html.push('<li><a href="'+list[i].url+'">')
                        var pic = list[i].litpic != "" && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
                        html.push('<div class="img"><img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                        html.push('<div class="info">');
                        html.push('<p class="name">'+list[i].title+'</p>');
                        html.push('<p class="type">'+list[i].typename+'<em>|</em>0-10桌</p>');
                        if(list[i].flagAll!=''){
                            html.push('<p class="tip">');
                            for(var m=0;m<list[i].flagAll.length;m++){
                                var className = '';
                                if(m==0){
                                    className = 'dt';
                                }else if(m==1){
                                    className = 'dl';
                                }else if(m==2){
                                    className = 'gg';
                                }
                                if(m>2) break;
                                html.push('<span class="'+className+'">'+list[i].flagAll[m].jc+'</span>');
                            }
                            html.push('</p>');
                        }
                        var newPrice = list[i].hotelprice.split('.');
                        if(newPrice[1]==0){
                            newPrice = newPrice[0];
                        }else{
                            newPrice = list[i].hotelprice;
                        }
                        var adrLen = list[i].addrname.length;
                        html.push('<p class="area">'+list[i].addrname[adrLen-2]+' <span class="price"><strong>'+echoCurrency('symbol')+newPrice+'</strong><i>/'+langData['marry'][5][25]+'</i><em>'+langData['marry'][5][40]+'</em></span></p>');
                        html.push('</div>');
                        html.push('</a>');
                        html.push('</li>');
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
        console.log(filter);
        if (filter.typename != '' && filter.typename != null) {$('.choose-tab .typeid span').text(filter.typename);}

        if (filter.typeid != ''  && filter.typeid != null) {
            $('.choose-tab .typeid').attr('data-id', filter.typeid);
            $('.choose-hotel li[data-id="'+filter.typeid+'"]').addClass('active').siblings('li').removeClass('active');
        }

        if (filter.cityName != '' && filter.cityName != null) {$('.choose-tab .addrid span').text(filter.cityName);}
        if (filter.parAddrid != '' && filter.parAddrid != null) {
            $('#choose-area li[data-id="'+filter.parAddrid+'"]').addClass('curr').siblings('li').removeClass('curr');
        }
        if (filter.addrid != '' && filter.addrid != null) {
            $('.choose-tab .addrid').attr('data-id', filter.addrid);
        }

        // 排序选中状态
        if (filter.orderby != "" && filter.orderby != null) {           
            $('.zhOrder li[data-id="'+filter.orderby+'"]').addClass('chosed').siblings('li').removeClass('chosed');
        }

        // 价格
        if (filter.price != "" && filter.price != null) {           
            $('.zhPrice li[data-id="'+filter.price+'"]').addClass('chosed').siblings('li').removeClass('chosed');
            $('#pricetemp').val(filter.price);
        }

    }


    
    

});