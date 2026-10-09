$(function() {
    //APP端取消下拉刷新
    toggleDragRefresh('off'); 

  
    var mask = $('.mask');


    $('.reno_company').delegate('li.com_li', 'click', function(){
        var t = $(this), a = t.find('a'), url = a.attr('data-url');

        setTimeout(function(){location.href = url;}, 500);

    })

    // 筛选框
    var chooseArea = chooseInfo = null;
    $('.choose-tab li').click(function(){
        var $t = $(this), index = $t.index(), box = $('.choose-box .choose-local').eq(index);
        if (box.css("display")=="none") {
            $t.addClass('active').siblings().removeClass('active');
            box.show().siblings().hide();
            if (index == 1 && chooseArea == null) {
                chooseArea = new iScroll("reno_class", {vScrollbar: false,mouseWheel: true,click: true});
            }
           if (index == 2 && chooseArea == null) {
                chooseArea = new iScroll("orderby_class", {vScrollbar: false,mouseWheel: true,click: true});
            }
            mask.show();
          
        }else{
            $t.removeClass('active');
            box.hide();mask.hide();
        }
    });

    // 装修风格
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

    //装修阶段
    $('#reno_class').delegate("li", "click", function(){
        var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-local'), index = local.index();

        $t.addClass('on').siblings().removeClass('on');
        $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
        local.hide();
        mask.hide();
        getList(1);

    })

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
    getList(1);

    //获取信息列表
    function getList(tr){
        isload = true;
        var data = [];
        data.push("page="+page);
        data.push("company="+did);
        data.push("pageSize="+pageSize);
        var style = $("#type_box li.select").attr("data-id");
            style = style == undefined ? "" : style;
        if(style != ""){
            data.push("style="+style);
        }

        var stage = $("#reno_class_box li.on").attr("data-id");
        stage = stage == undefined ? "" : stage;
        if(stage != ""){
            data.push("stageid="+stageid);
        }

        if(tr){
            page=1;
            $('.com_ul').html('')
        }
        $('.com_ul').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=constructionList&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    $(".loading").remove();
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length > 0){
                    
                        for (var i = 0; i < list.length; i++) {
                            var id = list[i].id;
                            var durl = detailUrl.replace("%id%", id);
                            html.push('<li class="com_li" data-id="'+list[i].id+'">');
                            html.push('<a href="javascript:;" data-url="'+durl+'">');
                            var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                            html.push('<div class="com_bottom">');                        
                            html.push('<div class="middle">');                        
                            html.push('<h4 class="com_type">'+list[i].title+'</h4>');
                            html.push('<p class="artist_order">'+list[i].mqjd+'</p>');//立即预约
                            html.push('</div>');                 
                            html.push('<div class="bottom">');                 
                            html.push('<ul>');
                            var sLen = list[i].stage.length;
                            var picarr = list[i].stage[sLen-1].listpicarr;

                            if(picarr && picarr.length > 0){
                                var picLen = picarr.length <3 ? picarr.length : 3
                                for (var a = 0; a < picLen; a++) {

                                    html.push('<li><img src="' + picarr[a].path + '"    onerror="javascript:this.src=\'' + staticPath + 'images/404.jpg\';"  alt=""></li>');
                                }
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



})
