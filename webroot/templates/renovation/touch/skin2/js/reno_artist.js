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
        style: '',
        styleName: '',
        works: '',
        worksName: '',
        orderby: '',
        orderbyName: '',
        isBack: true
    };


    $('.reno_company').delegate('li.com_li', 'click', function(e){
        var t = $(this), a = t.find('a'), url = a.attr('data-url'), id = t.attr('data-id');

        var orderby = $('#orderby_class li.on').attr('data-id'),
            orderbyName = $('#orderby_class li.on').text(),
            style = $('#type_class li.select').attr('data-id'),
            styleName = $('#type_class li.select').text(),
            works = $('#reno_class li.on').attr('data-id'),
            worksName = $('#reno_class li.on').text(),
            keywords = $('.reno_form #keywords').val();

            dataInfo.id = id;
            dataInfo.url = url;
            dataInfo.style = style;
            dataInfo.styleName = styleName;
            dataInfo.works = works;
            dataInfo.worksName = worksName;
            dataInfo.orderby = orderby;
            dataInfo.orderbyName = orderbyName;
            dataInfo.keywords = keywords;

        detailList.insertHtmlStr(dataInfo, $("#maincontent").html(), {lastIndex: page});
        if(e.target == t.find('.artist_order')[0]){
            
        }else{
           setTimeout(function(){location.href = url;}, 300); 
        }
        

    })

    // 筛选框
    var chooseArea = chooseInfo = chooseSort = null;
    $('.choose-tab li').click(function(){
        var $t = $(this), index = $t.index(), box = $('.choose-box .choose-local').eq(index);
        if (box.css("display")=="none") {
            $t.addClass('active').siblings().removeClass('active');
            box.show().siblings().hide();
            
            if (index == 1 && chooseInfo == null) {
                chooseInfo = new iScroll("reno_class", {vScrollbar: false,mouseWheel: true,click: true});
            }
           if (index == 2 && chooseSort == null) {
                chooseSort = new iScroll("orderby_class", {vScrollbar: false,mouseWheel: true,click: true});
            }
            mask.show();
          
        }else{
            $t.removeClass('active');
            box.hide();mask.hide();
        }
    });


    //职业年限
    $('#reno_class').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();      
        getList(1);

    })

     //排列顺序
    $('#orderby_class').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();
        getList(1);

    })



    // 擅长风格
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

    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').closest('li').hide();
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        var par = $('.formCommon')
        var arcode = par.find('.areacode_span')
        arcode.find("label").text(txt);
        par.find(".areaCodeinp").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code, #popupReg-captcha-mobile').hide();
        $('.mask-code').removeClass('show');
    })


    //立即预约
    //预约弹窗弹出
    $('.reno_company').delegate(".artist_order", "click", function(e){
        var com_type=$(this).parents('.right_b').find('.com_type');
        var peo_name=com_type.html();
        $('.order_mask').show();
        $('.peo_name').text(peo_name);
        var par = $(this).closest('.com_li');
        $('.com_li').removeClass('hasLi')
        par.addClass('hasLi')
        return false;

    })
    // 立即预约 表单验证
    $('.free').click(function(){
        var f = $(this);  
        var txt = f.text();      
        var name = $('#order_name').val(), 
            tel = $('#order_phone').val();
        var teamId = $('.com_li.hasLi').attr('data-id');   
        if(f.hasClass("disabled")) return false;
        var par = f.closest('.formCommon');
        var areaCodev = par.find('.areaCodeinp').val();
        if (!name) {

            $('.name-1').show();
            setTimeout(function(){$('.name-1').hide()},1000);

        }else if (!tel) {

            $('.phone-1').show();
            setTimeout(function(){$('.phone-1').hide()},1000);

        }else {
            f.addClass("disabled").text(langData['renovation'][14][58]);//预约中...
            var data = [];
            data.push("bid="+teamId);//设计师id
            data.push("people="+name);
            data.push("type=2");
            data.push("areaCode="+areaCodev);
            data.push("contact="+tel);
          
            $.ajax({
                url: "/include/ajax.php?service=renovation&action=sendRese",
                data: data.join("&"),
                type: "POST",
                dataType: "json",
                success: function (data) {
                    f.removeClass("disabled").text(txt);//
                    if(data && data.state == 100){
                        $('.order_mask').hide();
                        $('.order_mask2').show();
                        
                    }else{
                        alert(data.info);
                    }
                },
                error: function(){
                    alert(langData['renovation'][14][90]);//预约失败，请重试！
                    f.removeClass("disabled").text(txt);//
                }
            });
        }
    })

    // 立即预约关闭
     $('.order_mask .work_close').click(function(){
        $('.order_mask').hide();
   
     })
     $('.order_mask2 .t3').click(function(){
        $('.order_mask2').hide();
   
     })
     
     //搜索设计师
    $('.renoform_go').click(function(){
        var keyWords = $('.reno_form #keywords').val();
        if(keyWords!=''){
            isload = false;
            getList(1);
        }
        return false;

    }) 

    // 下拉加载
    var isload = false;
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
        data.push("pageSize=10");
        var keywords = $('.reno_form #keywords').val();
        if(keywords !=''){
            data.push("title="+keywords);
        }
        var style = $("#type_class li.select").attr("data-id");
        style = style == undefined ? "" : style;
        if(style != ""){
            data.push("style="+style);
        }

        var works = $("#reno_class li.on").attr("data-id");
        works = works == undefined ? "" : works;
        if(works != ""){
            data.push("works="+works);
        }

        var orderby = $("#orderby_class li.on").attr("data-id");
        orderby = orderby == undefined ? "" : orderby;
        if(orderby != ""){
            data.push("orderby="+orderby);
        }       
        
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=team&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length>0){
                        $(".com_ul .loading").remove();
                        for (var i = 0; i < list.length; i++) {
                            html.push('<li class="com_li" data-id="'+list[i].id+'">');
                            html.push('<a href="javascript:;" data-url="'+list[i].url+'">');
                            var pic = list[i].photo != "" && list[i].photo != undefined ? huoniao.changeFileSize(list[i].photo, "small") : "/static/images/404.jpg";
                            html.push('<div class="com_bottom">');                        
                            html.push('<div class="middle">');                        
                            html.push('<div class="left_b">');                        
                            html.push('<img src="'+pic+'" alt="">');
                            html.push('</div>');
                            html.push('<div class="right_b">');
                            html.push('<div class="com1">');
                            html.push('<h4 class="com_type">'+list[i].name+'</h4>');
                            if (list[i].certifyState ==1) {

                                html.push('<span class="certify"></span>');                 
                            }
                            html.push('</div>'); 
                            html.push('<ul class="right_ul">');   
                            if(list[i].works > 0){
                                html.push('<li>'+langData['renovation'][14][70].replace('1',list[i].works)+'</li>'); //1年工作经验     
                            }else{
                                html.push('<li>'+langData['renovation'][14][72]+'</li>');//暂无工作经验
                            }             
                            if(list[i].diary > 0){
                                html.push('<li>'+langData['renovation'][14][100].replace('1',list[i].diary)+'</li>'); //1套设计案例 
                            }else{
                                html.push('<li>'+langData['renovation'][14][73]+'</li>');//暂无案例
                            }         
                                                  
                            html.push('</ul>'); 
                            html.push('<p class="artist_order">'+langData['renovation'][0][20]+'</p>');//立即预约                                    
                            html.push('</div>');                                     
                            html.push('</div>');                 
                            html.push('<div class="bottom">');                 
                            html.push('<ul>');   
                            var diarylitpic = list[i].diarylitpic;
                            var aLen = diarylitpic.length< 3 ?diarylitpic.length:3;
                            for (var a = 0; a < aLen; a++) {
                                html.push('<li><img src="'+diarylitpic[a].litpic+'" alt=""></li>');                 
                            }                              
                            html.push('</ul>');                                 
                            html.push('</div> ');                 
                            html.push('</div> ');                 
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
        console.log(filter)
        page = detailList.getLocalStorage()['extraData'].lastIndex;

        if (filter.style != '' && filter.style != null) {
            $('#type_class li[data-id="'+filter.style+'"]').addClass('select').siblings('li').removeClass('select');
        }
        if (filter.styleName != '' && filter.styleName != null ) {
            $('.choose-tab li.typeid span').text(filter.styleName);
        }
        if (filter.works != '' && filter.works != null) {
            $('#reno_class li[data-id="'+filter.works+'"]').addClass('on').siblings('li').removeClass('on');
        }
        if (filter.worksName != '' && filter.worksName != null) {
            $('.choose-tab li.reno_class span').text(filter.worksName);
        }
        if (filter.orderby != '' && filter.orderby != null) {
            $('#orderby_class li[data-id="'+filter.orderby+'"]').addClass('on').siblings('on').removeClass('on');
        }
        if (filter.orderbyName != '' && filter.orderbyName != null) {
            $('.choose-tab li.com_type span').text(filter.orderbyName);
        }
        if (filter.keywords != '' && filter.keywords != null) {
            $('.reno_form #keywords').val(keywords);
        }


    }


})
