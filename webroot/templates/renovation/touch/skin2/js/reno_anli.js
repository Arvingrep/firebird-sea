$(function() {
    //APP端取消下拉刷新
    toggleDragRefresh('off'); 
    var mask = $('.mask');

    var detailList;
    detailList = new h5DetailList();
    detailList.settings.appendTo = ".reno_anli";
    setTimeout(function(){detailList.removeLocalStorage();}, 800);

    var	isload = false, isClick = true;
    var dataInfo = {
        id: '',
        url: '',
        category: '',
        categoryname: '',
        mode: '',
        modeName: '',
        style: '',
        styleName: '',
        houseType: '',
        houseTypeName: '',
        typeId: '',
        typeName: '',
        isBack: true
    };


    $('.reno_anli').delegate('li', 'click', function(){
        var t = $(this), a = t.find('a'), url = a.attr('data-url'), id = t.attr('data-id');

        var category = $('#reno_class li.on').attr('data-id'),
            categoryname = $('#reno_class li.on').text(),
            mode = $('#choose-info li.on').attr('data-id'),
            modeName = $('#choose-info li.on').text(),
            style = $('#type_box li.select').attr('data-id'),
            styleName = $('#type_box li.select').text(),
            houseType = $('#style_box li.select').attr('data-id'),
            houseTypeName = $('#style_box li.select').text(),
            typeId = $('#pubType_box li.select').attr('data-id'),
            typeName = $('#pubType_box li.select').text();

        dataInfo.id = id;
        dataInfo.url = url;
        dataInfo.category = category;
        dataInfo.categoryname = categoryname;
        dataInfo.mode = mode;
        dataInfo.modeName = modeName;
        dataInfo.style = style;
        dataInfo.styleName = styleName;
        dataInfo.houseType = houseType;
        dataInfo.houseTypeName = houseTypeName;
        dataInfo.typeId = typeId;
        dataInfo.typeName = typeName;

        detailList.insertHtmlStr(dataInfo, $("#maincontent").html(), {lastIndex: page});

        setTimeout(function(){location.href = url;}, 500);

    })

    // 筛选框
    var chooseArea = chooseInfo = chooseSort = null;
    $('.choose-tab li').click(function(){
        var $t = $(this), index = $t.index(), box = $('.choose-box .choose-local').eq(index);
        if (box.css("display")=="none") {
            $t.addClass('active').siblings().removeClass('active');
            box.show().siblings().hide();
            if (index == 0 && chooseArea == null) {
                chooseArea = new iScroll("reno_class", {vScrollbar: false,mouseWheel: true,click: true});
            }
            if (index == 1 && chooseInfo == null) {
                chooseInfo = new iScroll("choose-info", {vScrollbar: false,mouseWheel: true,click: true});
            }
            mask.show();
          
        }else{
            $t.removeClass('active');
            box.hide();mask.hide();
        }
    });

    //类别
    $('#reno_class').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();
        if(id=='1'){//公装
            $('.houseStyle,.houseType').hide();
            $('.pubType').show();
        }else{//家装
            $('.houseStyle,.houseType').show();
            $('.pubType').hide();
        }
        getList(1);
    })


    //方式
    $('#choose-info').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();        
        getList(1);

    })

    // 风格
    //单选   
    $('#type_box .one_choose ul li').click(function () {
        $(this).toggleClass('select').siblings().removeClass('select');
        if($(this).hasClass('select')){
            var select_val=$(this).text();
            $('.houseStyle').find('span').text(select_val);
            $('.choose-local').hide();
            $('.mask').hide();
            $('.houseStyle').removeClass('active')
            getList(1);
        }
    });

    // 户型
    //单选   
    $('#style_box .one_choose ul li').click(function () {
        $(this).toggleClass('select').siblings().removeClass('select');
        if($(this).hasClass('select')){
            var select_val=$(this).text();
            $('.houseType').find('span').text(select_val);
            $('.choose-local').hide();
            $('.mask').hide();
            $('.houseType').removeClass('active')
            getList(1);
        }
    });

    //类型    
    $('#pubType_box .one_choose ul li').click(function () {
        $(this).toggleClass('select').siblings().removeClass('select');
        if($(this).hasClass('select')){
            var select_val=$(this).text();
            $('.pubType').find('span').text(select_val);
            $('.choose-local').hide();
            $('.mask').hide();
            $('.pubType').removeClass('active')
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

 

    // 下拉加载
    var isload  = false;
    $(window).scroll(function() {
        var h = 60;  
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - h - w;
        if ($(window).scrollTop() > scroll && !isload) {
            page++;
            getList();
        };
    });
    //搜索
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
    //获取信息列表
    function getList(tr){
        isload = true;
        if(tr){
            page=1;
            $('.content ul').html('')
        }
        $(".loading").remove();
        $('.reno_anli').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);

        var keywords = $('.reno_form #keywords').val();
        if(keywords !=''){
            data.push("title="+keywords);
        }
        var type = $("#reno_class_box li.on").attr("data-id");
            type = type == undefined ? "" : type;
        if(type != ""){
            data.push("type="+type);
        }

        var btype = $("#choose-info li.on").attr("data-id");
        btype = btype == undefined ? "" : btype;
        if(btype != ""){
            data.push("btype="+btype);
        }

        var style = $("#type_box li.select").attr("data-id");
        style = style == undefined ? "" : style;
        if(style != ""){
            data.push("style="+style);
        }

        var comstyle = $("#pubType_box li.select").attr("data-id");
        comstyle = comstyle == undefined ? "" : comstyle;
        if(comstyle != ""){
            data.push("comstyle="+comstyle);
        }

        var units = $("#style_box li.select").attr("data-id");
        units = units == undefined ? "" : units;
        if(units != ""){
            data.push("units="+units);
        }
        
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=diary&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    
                    var html = [], html2=[],list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length > 0){
                        $(".loading").remove();
                        for (var i = 0; i < list.length; i++) {
                            if(i%2 == 0){

                                html.push('<li class="fn-clear" data-id="'+list[i].id+'">');
                                html.push('<a href="javascript:;" data-url="'+list[i].url+'">');
                                var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                                html.push('<div class="top_b">');                        
                                html.push('<img src="'+pic+'" alt="">');
                                html.push('</div>');
                                html.push('<div class="bottom_b">');
                                html.push('<p class="anli_title">'+list[i].title+'</p>');
                                html.push('<div class="anli_info fn-clear">');                 
                                html.push('<div class="anli_l">'); 
                               	var ftype = list[i].ftype;
                                var dlogo='';
                              	if(ftype == 0 && list[i].designer !=null){
                                  dlogo = list[i].designer.logo != "" && list[i].litpic != undefined ? list[i].designer.logo : "/static/images/noPhoto_100.jpg";
                                  
                                }else{
                                  if(list[i].designer !=null)
                                  dlogo = list[i].designer.photo != "" && list[i].litpic != undefined ? list[i].designer.photo : "/static/images/noPhoto_100.jpg";
                                }
                              	dlogo = dlogo != "" ? dlogo : "/static/images/noPhoto_100.jpg";
                                html.push('<img src="'+dlogo+'" alt="">');
                              	html.push('</div>');
                                html.push('<p class="anli_r">'+list[i].area+'m² | '+list[i].style+' | '+Number(list[i].price).toFixed(0)+langData['renovation'][9][22]+'</p>');  //万               
                                html.push('</div>');                                     
                                html.push('</div>');                 
                                html.push('</a>');
                                html.push('</li>');
                            }else{
                                html2.push('<li class="fn-clear"  data-id="'+list[i].id+'">');
                                html2.push('<a href="javascript:;" data-url="'+list[i].url+'">');
                                var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "large") : "/static/images/404.jpg";
                                html2.push('<div class="top_b">');                        
                                html2.push('<img src="'+pic+'" alt="">');
                                html2.push('</div>');
                                html2.push('<div class="bottom_b">');
                                html2.push('<p class="anli_title">'+list[i].title+'</p>');
                                html2.push('<div class="anli_info fn-clear">');                 
                                html2.push('<div class="anli_l">'); 
                               	var ftype = list[i].ftype;
                                var dlogo='';
                              	if(ftype == 0 && list[i].designer !=null){
                                  dlogo = list[i].designer.logo != "" && list[i].litpic != undefined ? list[i].designer.logo : "/static/images/noPhoto_100.jpg";
                                  
                                }else{
                                  if(list[i].designer !=null)
                                  dlogo = list[i].designer.photo != "" && list[i].litpic != undefined ? list[i].designer.photo : "/static/images/noPhoto_100.jpg";
                                }
                              	dlogo = dlogo != "" ? dlogo : "/static/images/noPhoto_100.jpg";
                                html2.push('<img src="'+dlogo+'" alt="">');
                              	html2.push('</div>'); 
                                html2.push('<p class="anli_r">'+list[i].area+'m² | '+list[i].style+' | '+Number(list[i].price).toFixed(0)+langData['renovation'][9][22]+'</p>');  //万                   
                                html2.push('</div>');                                     
                                html2.push('</div>');                 
                                html2.push('</a>');
                                html2.push('</li>');
                            }                       

                        }                  
                         
                        $(".reno_anli .box1").append(html.join(""));
                        $(".reno_anli .box2").append(html2.join(""));
                        
                        isload = false;

                        if(page >= pageinfo.totalPage){
                            isload = true;
                            
                            $(".reno_anli").append('<div class="loading">'+langData['renovation'][2][28]+'</div>');//到底了...
                            
                        }
                    }else{
                        $(".reno_anli .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }
                    

                }else{
                    $(".reno_anli .loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                $(".reno_anli .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        });

    }




    // 本地存储的筛选条件
    function getData() {
        var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];
        page = detailList.getLocalStorage()['extraData'].lastIndex;
        if (filter.category != '' && filter.category != null) {
            $('#reno_class li[data-id="'+filter.category+'"]').addClass('on').siblings('li').removeClass('on');
            if(filter.category == '1'){//公装
                $('.houseStyle,.houseType').hide();
                $('.pubType').show();
            }else{//家装
                $('.houseStyle,.houseType').show();
                $('.pubType').hide();
            }
        }
        if (filter.categoryname != '' && filter.categoryname != null) {
            $('.choose-tab li.reno_class span').text(filter.categoryname);
        }
        if (filter.mode != '' && filter.mode != null) {
            $('#choose-info li[data-id="'+filter.mode+'"]').addClass('on').siblings('li').removeClass('on');
        }
        if (filter.modeName != '' && filter.modeName != null) {
            $('.choose-tab li.classid span').text(filter.modeName);
        }
        if (filter.style != '' && filter.style != null) {
            $('#type_box li[data-id="'+filter.style+'"]').addClass('select').siblings('li').removeClass('select');
        }
        if (filter.styleName != '' && filter.styleName != null) {
            $('.choose-tab li.houseStyle span').text(filter.styleName);
        }
        if (filter.houseType != '' && filter.houseType != null) {
            $('#style_box li[data-id="'+filter.houseType+'"]').addClass('select').siblings('li').removeClass('select');
        }
        if (filter.houseTypeName != '' && filter.houseTypeName != null) {
            $('.choose-tab li.houseType span').text(filter.houseTypeName);
        }
        if (filter.typeId != '' && filter.typeId != null) {
            $('#pubType_box li[data-id="'+filter.typeId+'"]').addClass('select').siblings('li').removeClass('select');
        }
        if (filter.typeName != '' && filter.typeName != null) {
            $('.choose-tab li.pubType span').text(filter.typeName);
        }


    }


})
