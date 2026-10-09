$(function() {
    //APP端取消下拉刷新
    toggleDragRefresh('off'); 
    
    var dom = $('#screen');
    var mask = $('.mask');

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
        naturedesc: '',
        age: '',
        experience: '',
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

            var naturedesc = [], age = $('.tab-age .select').attr('data-id'),
                experience = $('.tab-experience .select').attr('data-id');

            $(".more-child ul li").each(function(){
                var t = $(this), type = t.data('type');
                if(type == 'naturedesc'){
                    if(t.hasClass('select')){
                        var naturedescid = t.data('id');
                        naturedesc.push(naturedescid);
                    }
                }
            })
               

        dataInfo.url = url;
        dataInfo.parid = parid;
        dataInfo.typeid = typeid;
        dataInfo.typename = typename;
        dataInfo.cityName = cityName;
        dataInfo.parAddrid = parAddrid;
        dataInfo.addrid = addrid;
        dataInfo.orderby = orderby;
        dataInfo.orderbyName = orderbyName;

        if (naturedesc != '') {dataInfo.naturedesc = naturedesc;}
		if (age != '') {dataInfo.age = age;}
		if (experience != '') {dataInfo.experience = experience;}

        detailList.insertHtmlStr(dataInfo, $("#nanny").html(), {lastIndex: page});
        
        if (!wx_miniprogram) {
            setTimeout(function(){location.href = url;}, 500);
        }

    })


    // 筛选框
    var chooseArea = chooseInfo = chooseMore = chooseSort = null;
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
            if (index == 2 && chooseMore == null) {
                chooseMore = new iScroll("choose-more", {vScrollbar: false,mouseWheel: true,click: true});
            }
            if (index == 3 && chooseSort == null) {
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
            $('.choose-tab li').eq(localIndex).removeClass('active').attr("data-id", 0).find('span').text("不限");
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
            $('.choose-tab li').eq(localIndex).removeClass('active').attr("data-id", '').find('span').text("全部分类");
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
                        html.push('<li data-id="'+id+'">不限</li>');
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
                        //$("#choose-info-second").html('<ul><li data-id="'+id+'">不限</li></ul>');
                    }else{
                        $("#choose-info-second").html('<ul><li class="load">'+data.info+'</li></ul>');
                    }
                },
                error: function(){
                    $("#choose-info-second").html('<ul><li class="load">网络错误，加载失败！</li></ul>');
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
        $('.choose-more .last_more_child ul input').val('')       
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
        page = 1;
        getList();
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
        if ($(window).scrollTop() > scroll && !isload) {
            page++;
            getList();
        };
    });


    //初始加载 3-21
    if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){

        getList(1);
    }else {
        getData();
        setTimeout(function(){
            detailList.removeLocalStorage();
        }, 500)
    }

    $(".txtSearchs").click(function () {
        
    })

    //获取信息列表
    function getList(tr){

        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        $(".choose-tab li").each(function(){
            data.push($(this).attr("data-type") + "=" + $(this).attr("data-id"));
        });

        var naturedesc = [];
        var age  = [];
        var experience = [];
        $(".more-child ul li").each(function(){
            var t = $(this), type = t.data('type');
            if(type == 'naturedesc'){
                if(t.hasClass('select')){
                    var naturedescid = t.data('id');
                    naturedesc.push(naturedescid);
                }
            }else if(type == 'age'){
                if(t.hasClass('select')){
                    var ageid = t.data('id');
                    age.push(ageid);
                }
            }else if(type == 'experience'){
                if(t.hasClass('select')){
                    var experienceid = t.data('id');
                    experience.push(experienceid);
                }
            }
        });

        naturedesc = naturedesc ? naturedesc.join(',') : '';
        if(naturedesc != ""){
            data.push("naturedesc="+naturedesc);
        }

        if(age != ""){
            data.push("age="+age);
        }

        if(experience != ""){
            data.push("experience="+experience);
        }

        var minprice = $("#minprice").val();
        minprice = minprice==undefined || minprice=='' ? '' : minprice; 
        var maxprice = $("#maxprice").val();
        maxprice = maxprice==undefined || maxprice=='' ? '' : maxprice;
        if(minprice!='' || maxprice!=''){
            minprice = minprice=='' && maxprice!='' ? 0 : minprice;
            data.push("salary="+minprice + ',' + maxprice);
        }

        isload = true;
        $(".empty").remove();
        if(page == 1){
            $(".jz_baomu ul").html('<div class="empty">'+langData['homemaking'][8][64]+'</div>');
        }else{
            $(".jz_baomu ul").append('<div class="empty">'+langData['homemaking'][8][64]+'</div>');
        }
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=homemaking&action=nannyList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".empty").remove();
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;

                    for (var i = 0; i < list.length; i++) {
                        html.push('<li data-id="'+list[i].id+'" class="fn-clear">');
                        html.push('<a data-url="'+list[i].url+'" href="javascript:;">');
                        var classStyle = 'style="left:.23rem;"';
                        if(list[i].tag.indexOf("1")>-1){
                            html.push('<img src="'+templatePath+'images/new_recom.png" alt="" class="new_recom">');
                            classStyle = '';
                        }
                        if(list[i].tag.indexOf("0")>-1){
                            html.push('<img src="'+templatePath+'images/jin.png" alt="" '+classStyle+' class="new_recom jin">');
                        }
                        html.push('<div class="left_b"><img src="'+list[i].photo+'" alt="" class="bm_img"></div>');
                        html.push('<div class="yuesao_div">');
                        html.push('<p class="bm_name">'+list[i].username+'</p>');
                        html.push('<p class="bm_info"><span>'+list[i].age+langData['homemaking'][8][82]+'</span><span>'+list[i].placename+langData['homemaking'][8][83]+'</span><span>'+list[i].educationname+'</span><span>'+list[i].experiencename+'</span></p>');
                        if(list[i].naturedescname!=''){
                            html.push('<p class="bm_type">');
                            for(var m=0;m<list[i].naturedescname.length;m++){
                                if(m>=4) break;
                                html.push('<span>'+list[i].naturedescname[m]+'</span>');
                            }
                            html.push('</p>');
                        }
                        html.push('<p class="bm_salary">'+langData['homemaking'][8][95]+'<span>'+list[i].salaryname+'</span>'+langData['homemaking'][8][96]+'</p>');
                        html.push('<p class="bm_company">'+list[i]['store']['title']+'</p>');
                        html.push('</div>');
                        html.push('</a>');
                        html.push('</li>');
                    }

                    if(page == 1){
                         $(".jz_baomu ul").html("");
                         $(".jz_baomu ul").html(html.join(""))
                         //setTimeout(function(){$(".jz_baomu ul").html(html.join(""))}, 200);
                    }else{
                        $(".jz_baomu ul").append(html.join(""));
                    }
                    isload = false;
                    if(page >= pageinfo.totalPage){
                        isload = true;
                        $(".jz_baomu ul").append('<div class="empty">'+langData['homemaking'][8][65]+'</div>');
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
                $(".jz_baomu ul .empty").html(''+langData['homemaking'][0][26]+'...').show();
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
        if (filter.naturedesc != undefined && filter.naturedesc!='') {
            $('.tab-naturedesc li').siblings('li').removeClass('select');
            for (var i = 0; i < filter.naturedesc.length; i++) {
                $('.tab-naturedesc li[data-id="'+filter.naturedesc[i]+'"]').addClass('select');
            }
		}
		if (filter.age != undefined) {
			$('.tab-age li[data-id="'+filter.age+'"]').addClass('select').siblings('li').removeClass('select');
		}
		if (filter.experience != undefined) {
			$('.tab-experience li[data-id="'+filter.experience+'"]').addClass('select').siblings('li').removeClass('select');
		}
        // 排序选中状态
        if (filter.orderby != "") {
            $('.choose-tab .orderby').attr('data-id', filter.orderby);
            $('#choose-sort li[data-id="'+filter.orderby+'"]').addClass('on').siblings('li').removeClass('on');
        }

    }


})
