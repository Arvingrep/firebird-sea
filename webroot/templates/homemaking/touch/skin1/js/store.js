$(function() {
    //APP端取消下拉刷新
    toggleDragRefresh('off'); 
 
    var dom = $('#screen');
    var mask = $('.mask');
    var lng ='', lat = '';

    var detailList;
    detailList = new h5DetailList();
    detailList.settings.appendTo = ".jz_baomu";
    setTimeout(function(){detailList.removeLocalStorage();}, 800);

    var	isload = false, isClick = true,
        xiding = $(".choose"),
        chtop = parseInt(xiding.offset().top),
        device = navigator.userAgent;

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


    $('.jz_baomu').delegate('li', 'click', function(){
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

        detailList.insertHtmlStr(dataInfo, $("#maincontent").html(), {lastIndex: page});

        // setTimeout(function(){location.href = url;}, 500);

    })


    // 筛选框
    var chooseArea = chooseInfo = chooseSort = null;
    $('.choose-tab li').click(function(){
        dom.hide();
        $('.confirm').hide();

        var $t = $(this), index = $t.index(), box = $('.choose-box .choose-local').eq(index);
        if (box.css("display")=="none") {
            $t.addClass('active').siblings().removeClass('active');
            box.show().siblings().hide();
            if (index == 0 && chooseArea == null) {
                chooseArea = new iScroll("choose-area", {vScrollbar: false,mouseWheel: true,click: true});
            }
            if (index == 1 && chooseInfo == null) {
                chooseInfo = new iScroll("choose-info", {vScrollbar: false,mouseWheel: true,click: true});
            }
            if (index == 2 && chooseSort == null) {
                chooseSort = new iScroll("choose-sort", {vScrollbar: false,mouseWheel: true,click: true});
            }
            mask.show();
          
        }else{
            $t.removeClass('active');
            box.hide();mask.hide();
        }
    });


    // 区域二级
    var chooseAreaSecond = null;
    $('#choose-area li').click(function(){
        var t = $(this), index = t.index(), id = t.attr("data-id"), localIndex = t.closest('.choose-local').index();
        if (index == 0) {
            $('#area-box .choose-stage-l').removeClass('choose-stage-l-short');
            t.addClass('current').siblings().removeClass('active');
            t.closest('.choose-local').hide();
            $('.choose-tab li').eq(localIndex).removeClass('active').attr("data-id", 0).find('span').text(langData['homemaking'][8][73]);
            mask.hide();

            page = 1;
            getList();
        }else{
            t.siblings().removeClass('current');
            t.addClass('active').siblings().removeClass('active');
            $('#area-box .choose-stage-l').addClass('choose-stage-l-short');
            $('.choose-stage-r').show();
            chooseAreaSecond = new iScroll("choose-area-second", {vScrollbar: false,mouseWheel: true,click: true});

            $.ajax({
                url: masterDomain + "/include/ajax.php?service=homemaking&action=addr&type="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    if(data && data.state == 100){
                        var html = [], list = data.info;
                        html.push('<li data-id="'+id+'">'+langData['homemaking'][8][73]+'</li>');
                        for (var i = 0; i < list.length; i++) {
                            html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
                        }
                        $("#choose-area-second").html('<ul>'+html.join("")+'</ul>');
                        chooseSecond = new iScroll("choose-area-second", {vScrollbar: false,mouseWheel: true,click: true});
                    }else if(data.state == 102){
                        $("#choose-area-second").html('<ul><li data-id="'+id+'">'+langData['homemaking'][8][73]+'</li></ul>');
                    }else{
                        $("#choose-area-second").html('<ul><li class="load">'+data.info+'</li></ul>');
                    }
                },
                error: function(){
                    $("#choose-area-second").html('<ul><li class="load">'+langData['homemaking'][8][81]+'</li></ul>');
                }
            });
        }
    })

    // 分类二级
    var chooseSecond = null;
    $('#choose-info li').click(function(){
        var t = $(this),
            index = t.index(),
            id = t.attr("data-id"),
            localIndex = t.closest('.choose-local').index();
        if (index == 0) {
            $('#info-box .choose-stage-l').removeClass('choose-stage-l-short');
            t.addClass('current').siblings().removeClass('active').removeClass('current');
            t.closest('.choose-local').hide();
            $('.choose-tab li').eq(localIndex).removeClass('active').attr("data-id", '').find('span').text(langData['homemaking'][8][74]);
            mask.hide();
            $(".pack").css("margin-top","1.6rem");
            $(".screen").hide();
            $(".screen_list li").removeClass('on');

            page = 1;
            getList();
        }else{
            t.siblings().removeClass('current');
            t.addClass('active').siblings().removeClass('active');
            $('#info-box .choose-stage-l').addClass('choose-stage-l-short');
            $('.choose-stage-r').show();
            chooseSecond = new iScroll("choose-info-second", {vScrollbar: false,mouseWheel: true,click: true});

            $.ajax({
                url: masterDomain + "/include/ajax.php?service=homemaking&action=type&type="+id,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    if(data && data.state == 100){
                        var html = [], list = data.info;
                        html.push('<li data-id="'+id+'">'+langData['homemaking'][8][73]+'</li>');
                        for (var i = 0; i < list.length; i++) {
                            html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
                        }
                        $("#choose-info-second").html('<ul>'+html.join("")+'</ul>');
                        chooseSecond = new iScroll("choose-info-second", {vScrollbar: false,mouseWheel: true,click: true});
                    }else if(data.state == 102){
                        $('#info-box .choose-stage-l').removeClass('choose-stage-l-short');
                        t.addClass('current').siblings().removeClass('active');
                        t.closest('.choose-local').hide();
                        var val = t.html()
                        $('.choose-tab li').eq(localIndex).removeClass('active').attr("data-id", id).find('span').text(val);
                        mask.hide();
                        $(".pack").css("margin-top","1.6rem");
                        $(".screen").hide();
                        $(".screen_list li").removeClass('on');
                        page = 1;
                        getList();
                        //$("#choose-info-second").html('<ul><li data-id="'+id+'">'+langData['homemaking'][8][73]+'</li></ul>');
                    }else{
                        $("#choose-info-second").html('<ul><li class="load">'+data.info+'</li></ul>');
                    }
                },
                error: function(){
                    $("#choose-info-second").html('<ul><li class="load">'+langData['homemaking'][8][81]+'</li></ul>');
                }
            });
        }
    })

    // 一级筛选  地址和排序
    var screenScroll = null;
    $('#choose-sort, #choose-area-second').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();

        page = 1;
        getList();

    })

    $('#choose-info-second').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();
        $(".pack").css("margin-top","1.6rem");

        page = 1;
        getList();
    })

    $('.screen').delegate(".screen_box", "click", function(){
        var t = $(this),id = "";
        id = t.attr("data-id");
        $('.screen_list').hide();
        $('.'+id+'').show();
        $(".screen_list li").removeClass('on');
        $('.screen_box').removeClass('on');
        t.addClass('on');

    })
    $('.screen').delegate(".screen_list li", "click", function(){
        var x = $(this),name = x.attr("data-name"),id = x.closest('.screen_list').attr("data-id");
        $('.sb'+id+'').text(name).removeClass("on");
        x.addClass('on').siblings().removeClass('on');
        $('.screen_list').hide();
        page = 1;
        getList();
    })

    // 更多筛选
    //单选   
    $('.choose-more .one_choose ul li').click(function () {
        $(this).toggleClass('select').siblings().removeClass('select');
    });

    //多选
    $('.choose-more .more_choose ul li').click(function () {
        $(this).toggleClass('select');
    });
    
    //重置
    $('.choose-more .baomu_reset').click(function () {
        $('.choose-more .one_choose ul li').removeClass('select');
        $('.choose-more .more_choose ul li').removeClass('select');
        $('.choose-more .last_more_child ul input').val(' ')       
    });

    //取消
    $('.choose-more .btns span.cancel').click(function () {
        $('.choose-more .more-child ul li').removeClass('select');
        $('.choose-local').hide();
        $('.mask').hide();
    });
    //确定
    $('.choose-more .btns span.sure').click(function () {
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab  li').removeClass('active');
    });
    // //点击小箭头 收起

    $('.sort').click(function () {
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab  li').removeClass('active');
    });


    // 遮罩层
    $('.mask').on('click',function(){
        mask.hide();dom.hide();$('.confirm').hide();
        $('.choose-local').hide();
        $('.choose-tab li').removeClass('active');
        $('.screen').hide();
    })

    // 筛选
    $('.header-user').click(function(){
        if (dom.css('display') == 'none') {
            dom.show();
            mask.show();

            $('.confirm').show();
            if(screenScroll == null){
                screenScroll = new iScroll("screen", {vScrollbar: false,mouseWheel: true,click: true});
            }else{
                screenScroll.refresh();
            }
            $('.choose-local').hide();
            $('.choose-tab li').removeClass('active');
        }
        else{
            dom.hide();
            mask.hide();
            $('.confirm').hide();
        }
    })

    $('.scroll-screen').delegate("li", "click", function(){
        $(this).addClass('active').siblings().removeClass('active');
    })

    $('.confirm').click(function(){
        dom.hide();
        mask.hide();
        $('.confirm').hide();

        page = 1;
        getList();
    })



    // 下拉加载
    var isload = isend = false;
    $(window).scroll(function() {
        var h = $('.jz_baomu li').height();
   
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - h - w;
        if ($(window).scrollTop() > scroll && !isload && !isend) {
            page++;
            getList();
        };
    });

    
    //初始加载
    if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){
        HN_Location.init(function(data){
			if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
		  		$(".jz_baomu").append('<div class="loading">'+langData['homemaking'][8][80]+'</div>');
		  	}else{
			  lng = data.lng, lat = data.lat;
			  getList(1);
		  	}
		});
    }else {
        getData();
        setTimeout(function(){
            detailList.removeLocalStorage();
        }, 500)
    }



    //获取信息列表
    function getList(tr){

        if(isload) return false;
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("lng="+lng);
        data.push("lat="+lat);
        $(".choose-tab li").each(function(){
            data.push($(this).attr("data-type") + "=" + $(this).attr("data-id"));
        });

        isload = true;
        if(page == 1){
            $(".jz_baomu ul").html('<div class="empty">'+langData['homemaking'][8][64]+'</div>');
        }else{
            $(".jz_baomu ul").append('<div class="empty">'+langData['homemaking'][8][64]+'</div>');
        }
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=homemaking&action=storeList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".empty").remove();
                    var html = [],html_box = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li class="fn-clear">');
                        html.push('<a href="'+list[i].url+'" >');
                        if(list[i].rec==1){
                            html.push('<img src="'+templatePath+'images/new_recom.png" alt="" class="new_recom">');
                        }
                        html.push('<div class="left_b"><img src="'+list[i].litpic+'" alt="" class="bm_img"></div>');
                        html.push('<div class="baomu_content_div">');
                        html.push('<p class="bm_name">'+list[i].title+'</p> ');
                        if(list[i].tag!=''){
                            html.push('<p class="bm_type">');
                            for(var m=0;m<list[i].tagAll.jc.length;m++){
                                if(m>3) break;
                                html.push('<span>'+list[i].tagAll.jc[m]+'</span>');
                            }
                            html.push('</p>');
                        }
                        html.push('<p class="bm_salary"><a href="tel:'+list[i].tel+'"><span><img src="'+templatePath+'images/phone.png" alt=""><span>'+list[i].tel+'</span></span></a><span class="recom_sistance">'+list[i].distance+'</span></p>');
                        html.push('</div>');
                        html.push('</a>');
                        html.push('</li>');
                    }

                    if(page == 1){
                        $(".jz_baomu ul").html("");
                        setTimeout(function(){$(".jz_baomu ul").html(html.join(""))}, 200);
                    }else{
                        $(".jz_baomu ul").append(html.join(""));
                    }
                    isend = false;

                    if(page >= pageinfo.totalPage){
                        isend = true;
                        if(page != 1){
                            $(".jz_baomu ul").append('<div class="empty">'+langData['homemaking'][8][65]+'</div>');
                        }
                    }

                }else{
                    if(page == 1){
                        $(".jz_baomu ul").html("");
                    }
                    $(".jz_baomu ul").html('<div class="empty">'+data.info+'</div>');
                }
            },
            error: function(){
                isload = false;
                if(page == 1){
                    $(".jz_baomu ul").html("");
                }
                $(".jz_baomu ul .empty").html(langData['homemaking'][8][66]).show();
            }
        });

    }


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


})
