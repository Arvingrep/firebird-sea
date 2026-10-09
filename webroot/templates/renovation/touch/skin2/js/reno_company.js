$(function() {
    //APP端取消下拉刷新
    toggleDragRefresh('off'); 
    var mask = $('.mask');

    var detailList;
    detailList = new h5DetailList();
    detailList.settings.appendTo = ".reno_company";

    setTimeout(function(){detailList.removeLocalStorage();}, 800);

    var isload = false, isClick = true;

    var dataInfo = {
        id: '',
        url: '',
        keywords: '',
        jiastyle: '',
        jiastyleName: '',
        comstyle: '',
        comstyleName: '',
        range: '',
        rangeName: '',
        cityName: '',
        parAddrid: '',
        addrid: '',
        style: '',
        styleName: '',
        isBack: true
    };


    $('.reno_company').delegate('.com_li', 'click', function(){
        var t = $(this), a = t.find('a'), url = a.attr('data-url'), id = t.attr('data-id');

        var jiastyle = $('.choose-tab .reno_class').attr('data-id'),
            jiastyleName = $('#reno_class_box li.on').text(),

            comstyle = $('#comtype_box li.select').attr('data-id'),
            comstyleName = $('#comtype_box li.select').text(),
            range = $('.choose-tab .addrid').attr('data-id'),
            rangeName = $('.choose-tab .addrid span').text(),
            parAddrid = $('#choose-area .active').attr('data-id'),
            addrid = $('.choose-tab .addrid').attr('data-id'),
            cityName = $('.choose-tab .addrid span').text(),
            style = $('#type_box li.select').attr('data-id'),
            styleName = $('#type_box li.select').text(),
            keywords = $('.reno_form #keywords').val();

        dataInfo.id = id;
        dataInfo.url = url;
        dataInfo.jiastyle = jiastyle;
        dataInfo.jiastyleName = jiastyleName;
        dataInfo.comstyle = comstyle;
        dataInfo.comstyleName = comstyleName;
        dataInfo.range = range;
        dataInfo.rangeName = rangeName;
        dataInfo.cityName = cityName;
        dataInfo.parAddrid = parAddrid;
        dataInfo.addrid = addrid;
        dataInfo.style = style;
        dataInfo.styleName = styleName;
        dataInfo.keywords = keywords;

        detailList.insertHtmlStr(dataInfo, $("#maincontent").html(), {lastIndex: page});

        setTimeout(function(){location.href = url;}, 500);

    })


    // 筛选框
    var chooseArea = chooseInfo = chooseSort = null;
    $('.choose-tab li').click(function(){
        $('.confirm').hide();

        var $t = $(this), index = $t.index(), box = $('.choose-box .choose-local').eq(index);
        if (box.css("display")=="none") {
            $t.addClass('active').siblings().removeClass('active');
            box.show().siblings().hide();
            if (index == 2 && chooseArea == null) {
                chooseArea = new iScroll("choose-area", {vScrollbar: false,mouseWheel: true,click: true});
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
            getList(1);
        }else{
            t.siblings().removeClass('current');
            t.addClass('active').siblings().removeClass('active');
            $('#area-box .choose-stage-l').addClass('choose-stage-l-short');
            $('.choose-stage-r').show();
            chooseAreaSecond = new iScroll("choose-area-second", {vScrollbar: false,mouseWheel: true,click: true});

            $.ajax({
                url: "/include/ajax.php?service=renovation&action=addr&type="+id,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    if(data && data.state == 100){
                        var html = [], list = data.info;
                        html.push('<li data-id="'+id+'">'+langData['renovation'][4][28]+'</li>');//不限
                        for (var i = 0; i < list.length; i++) {
                            html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
                        }
                        $("#choose-area-second").html('<ul>'+html.join("")+'</ul>');
                        chooseSecond = new iScroll("choose-area-second", {vScrollbar: false,mouseWheel: true,click: true});
                    }else if(data.state == 102){
                        $("#choose-area-second").html('<ul><li data-id="'+id+'">'+langData['renovation'][4][28]+'</li></ul>');//不限
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

    // // 分类二级

    // 一级筛选  地址和
    //类别
    $('#reno_class').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();
        getList(1);

    })
    //区域二级选择
    $('#choose-area-second').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();
        getList(1);

    })


    // 工装类型
    //单选   
    $('#comtype_box .one_choose ul li').click(function () {
        $(this).toggleClass('select').siblings().removeClass('select');
        if($(this).hasClass('select')){
            var select_val1=$(this).text();        
            $('.com_type').find('span').text(select_val1);
            $('.choose-local').hide();
            $('.mask').hide();
            $('.com_type').removeClass('active')            
            getList(1);
        }
    });
    // 专长风格
    //单选   
    $('#type_box .one_choose ul li').click(function () {
        $(this).toggleClass('select').siblings().removeClass('select');
        if($(this).hasClass('select')){
            var select_val2=$(this).text();
         
            $('.typeid').find('span').text(select_val2);
            $('.choose-local').hide();
            $('.mask').hide();
            $('.typeid').removeClass('active')           
            getList(1);
        }
    });



    // //点击小箭头 收起
    $('.sort').click(function () {
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab  li').removeClass('active');
    });


    // 遮罩层
    $('.mask').on('click',function(){
        mask.hide();
        $('.choose-local').hide();
        $('.choose-tab li').removeClass('active');
    })
    var isload = false;
    //搜索公司
    $('.renoform_go').click(function(){
        var keyWords = $('.reno_form #keywords').val();
        if(keyWords!=''){
            isload = false;
            getList(1);
        }
        return false;

    }) 
    //初始加载
    if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){

        getList(1);
    }else {
        getData();
        setTimeout(function(){
            detailList.removeLocalStorage();
        }, 500)
    }

    // 下拉加载
    
    $(window).scroll(function() {
        var h = $('.reno_company .com_li').height();  
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - h - w;
        if ($(window).scrollTop() > scroll && !isload) {
            page++;
            getList();
        };
    });

    //获取信息列表
    function getList(tr){

        
        if(tr){
            isload = false;
            page=1;
            $('.com_ul').html('')
        }
        if(isload) return false;
        isload = true;
        $(".loading").remove();
        $('.com_ul').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        var keywords = $('.reno_form #keywords').val();
        if(keywords !=''){
            data.push("title="+keywords);
        }
        var jiastyle = $("#reno_class li.on").attr("data-id");
            jiastyle = jiastyle == undefined ? "" : jiastyle;
        if(jiastyle != ""){
            data.push("jiastyle="+jiastyle);
        }

        var comstyle = $("#comtype_box li.select").attr("data-id");
        comstyle = comstyle == undefined ? "" : comstyle;
        if(comstyle != ""){
            data.push("comstyle="+comstyle);
        }

        var range = $(".addrid").attr("data-id");
        range = range == undefined ? "" : range;
        if(range != ""){
            data.push("addrid="+range);
        }

        var style = $("#type_box li.select").attr("data-id");
        style = style == undefined ? "" : style;
        if(style != ""){
            data.push("style="+style);
        }
      
        
        $.ajax({
            url:  "/include/ajax.php?service=renovation&action=store&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length>0){
                        $(".com_ul .loading").remove();
                        for (var i = 0; i < list.length; i++) {
                            html.push('<li class="com_li" data-id="'+list[i].id+'">');
                            html.push('<a href="javascript:;" data-url="'+list[i].url+'">');
                            var pic = list[i].logo != "" && list[i].logo != undefined ? list[i].logo : "/static/images/404.jpg";
                            html.push('<div class="com_bottom">');                        
                            html.push('<div class="middle">');                        
                            html.push('<div class="left_b">');                        
                            html.push('<img src="'+pic+'" alt="">');
                            html.push('</div>');
                            html.push('<div class="right_b">');
                            html.push('<div class="com1">');
                            html.push('<h4 class="com_type">'+list[i].company+'</h4>');
                            if(list[i].safeguard > 0){
                                 html.push('<span class="defend"></span>'); 
                            }
                            if (list[i].certi == 1) {
                                html.push('<span class="certify"></span>'); 
                            }                
                            html.push('</div>'); 
                            html.push('<ul class="right_ul">');                 
                            html.push('<li>'+langData['renovation'][0][24]+'：<span>'+list[i].diaryCount+'</span></li>'); //  案例              
                            html.push('<li>'+langData['renovation'][0][25]+'：<span>'+list[i].constructionCount+'</span></li>'); //   工地             
                            html.push('<li>'+langData['renovation'][0][4]+'：<span>'+list[i].teamCount+'</span></li>');   //     设计师         
                            html.push('</ul>');                                     
                            html.push('</div>');                                     
                            html.push('</div>');    
                          	var diarylist = list[i].diarylist;
                          	if(diarylist.length>0){
                              html.push('<div class="bottom">');                 
                              html.push('<ul>');
                              var alen = diarylist.length <3?diarylist.length:3;
                              for (var a = 0; a < alen; a++) {
                                  html.push('<li><img src="'+diarylist[a].litpic+'" alt=""></li>');                 
                              }                                
                              html.push('</ul>');                 
                              html.push('</div> ');                 
                              html.push('</div> '); 
                          	}
                                            
                            html.push('</a>');
                            html.push('</li>');                                               

                        }
                        $(".reno_company .com_ul").append(html.join(""));  
                        isload = false;

                        if(page >= pageinfo.totalPage){
                            isload = true;                            
                            $(".reno_company .com_ul").append('<div class="loading">'+langData['renovation'][2][28]+'</div>');//到底了...                            
                        }
                    }else{
                        $(".com_ul .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }                                      
                }else{
                    $(".reno_company .com_ul .loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                $(".reno_company .com_ul .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        });

    }



    // 本地存储的筛选条件
    function getData() {

        var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];

        page = detailList.getLocalStorage()['extraData'].lastIndex;

        if (filter.jiastyle != '' && filter.jiastyle != null) {
            $('#reno_class_box li[data-id="'+filter.jiastyle+'"]').addClass('on').siblings('li').removeClass('on');
            $('.choose-tab .reno_class').attr('data-id',filter.jiastyle)
        }
        if (filter.jiastyleName != '' && filter.jiastyleName != null ) {
            $('.choose-tab .reno_class span').text(filter.jiastyleName);
        }
        if (filter.comstyle != '' && filter.comstyle != null) {
            $('#comtype_box li[data-id="'+filter.comstyle+'"]').addClass('select').siblings('li').removeClass('select');
        }
        if (filter.comstyleName != '' && filter.comstyleName != null) {
            $('.choose-tab li.com_type span').text(filter.comstyleName);
        }
        if (filter.range != '' && filter.range != null) {
            $('.choose-tab .addrid').attr('data-id',filter.range)
            $('.choose-stage-l li[data-id="'+filter.cityid+'"]').addClass('active').siblings('li').removeClass('active');
        }
        if (filter.rangeName != '' && filter.rangeName != null) {
            $('.choose-tab li.addrid span').text(filter.rangeName);
        }
        if (filter.style != '' && filter.style != null) {
            $('#type_box li[data-id="'+filter.style+'"]').addClass('select').siblings('li').removeClass('select');
        }
        if (filter.styleName != '' && filter.styleName != null) {
            $('.choose-tab li.typeid span').text(filter.comstyleName);
        }
        if (filter.keywords != '' && filter.keywords != null) {
            $('.reno_form #keywords').val(keywords);
        }
        if (filter.cityName != '') {$('.choose-tab .addrid span').text(filter.cityName);}
        if (filter.parAddrid != '') {
            $('#choose-area li[data-id="'+filter.parAddrid+'"]').addClass('active').siblings('li').removeClass('active');
        }
        if (filter.addrid != '') {
            $('.choose-tab .addrid').attr('data-id', filter.addrid);
        }

    }


})
