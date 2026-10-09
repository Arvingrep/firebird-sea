
$(function() {
    var bodyheight = $(window).height(),flag=0;
    //筛选弹窗显示
    function showNav() {
        $('body').css({
            overflow: 'hidden',
            height: bodyheight
        })
        $('.nav-container').addClass('active');
        $('.nav-mask').addClass('active');
    }
    //筛选弹窗关闭
    function closeNav() {
        $('.nav-container').removeClass('active');
            $('.nav-mask').removeClass('active');
            $('body').css({
                overflow: 'auto',
                height: 'auto'
        })
        if(flag == 1){
            
            if($('.nav-content li.active').size()>0 || $('.nav-content .type_p.on').size()>0){
                $('.filter').addClass('active');
                $('.reno_tab li').removeClass('active');
                getList(1);
            }  
        }    
    }

    //筛选弹窗  弹出
    $('.filter').click(function(){
        showNav();
    })
    $('.nav-mask').click(function () {
        flag = 0;
        closeNav()
    })
    $('.nav-second>li').click(function () {      
        if($(this).hasClass('active')){
            $(this).removeClass('active')
        }else{
            $('.nav-second>li').removeClass('active');
            $('.nav-content .type_p.noClick').removeClass('on');
            $(this).addClass('active')
        }              
    })
    $('.nav-content .common-choose').each(function(){
        var arrow = $(this).find('.arrow');
        var click = $(this).find('.canClick');
        var navSec = $(this).find('.nav-second');
        var len = navSec.find('li').length;
        if(len == 0){
            navSec.remove();
            arrow.remove();
            click.removeClass('canClick').addClass('noClick');
        }
    })
    $('.nav-content .type_p.canClick').click(function () {//二级分类里的选项
        var t=$(this).siblings('.nav-second');
        t.toggleClass('active');
    })

    $('.nav-content .type_p.noClick').click(function () {//没有二级分类
        if($(this).hasClass('on')){
            $(this).removeClass('on')
        }else{
            $('.nav-second>li').removeClass('active');
            $('.nav-content .type_p.noClick').removeClass('on');
            $(this).addClass('on')
        }
    })

    //导航切换
    $('.reno_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        $('.filter').removeClass('active');
        $('.nav-second>li').removeClass('active');
        $('.nav-content .type_p.noClick').removeClass('on');
        getList(1);
    });
    //重置
    $('.reset').click(function () {
        $('.nav-second>li').removeClass('active');
        $('.nav-content .type_p.noClick').removeClass('on');
        $('.reno_tab li:first-child').click();
    })

    //确认
    $('.sure').click(function () {
        flag = 1;
        closeNav()
    })
  

    // 下拉加载
    var isload = false;   
    var page=1,pageSize=5;    
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
    getList();
    //获取信息列表
    function getList(tr){

        if(tr){
            page=1;
            $('.wiki_container ul').html('')
        }
        $(".loading").remove();
        $('.wiki_container ul').append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        if($('.reno_tab li.active').size()>0){
            var active = $('.reno_tab li.active');
            var activeId = active.attr("data-id")
            if(activeId){
                data.push("typeid=" + activeId);
            }
            
        }else if($('.nav-content li.active').size()>0){
            var active = $('.nav-content li.active');
            data.push("typeid=" + active.attr("data-id"));
        }else if($('.nav-content .type_p.on').size()>0){

            var active = $('.nav-content .type_p.on');
            data.push("typeid=" + active.attr("data-id"));

        }

        isload = true;
        
        $.ajax({
            url: "/include/ajax.php?service=renovation&action=news&"+data.join("&"),
            type: "GET",
            dataType: "json",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){                    
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length > 0){
                        $(".loading").remove();
                        for (var i = 0; i < list.length; i++) {                        
                            html.push('<li class="fn-clear">');
                            html.push('<a href="'+list[i].url+'">');
                            if(list[i].litpic != ""){
                                html.push('<div class="right_b">');                       
                                html.push('<img src="'+list[i].litpic+'" alt="">');
                                html.push('</div>');
                            }
                            html.push('<div class="left_b">');                        
                            html.push('<p class="wiki_title">'+list[i].title+'</p>');                        
                            html.push('<div class="wiki_info">'); 
                            var pubTime = list[i].pubdate;
                            var pub = huoniao.transTimes(pubTime,2)
                            var reg = new RegExp("-","g");//g,表示全部替换。                       
                            html.push('<p class="wiki_time"><span>'+pub.replace(reg,'.')+'</span></p>');                        
                            html.push('<p class="wiki_read">'+langData['renovation'][14][96].replace('1',list[i].click)+'</p>');//1次浏览                        
                            html.push('</div>');                        
                            html.push('</div>');              
                            html.push('</a>');
                            html.push('</li>');
                                                
                        }
                                             
                        $(".wiki_container ul").append(html.join(""));
                                           
                        isload = false;

                        if(page >= pageinfo.totalPage){
                            isload = true;                        
                            $(".wiki_container ul").append('<div class="loading">'+langData['renovation'][2][28]+'</div>');//到底了...                        
                        }
                    }else{
                        $(".wiki_container .loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }

                }else{
                    $(".wiki_container .loading").html(data.info);
                }
            },
            error: function(){
                isload = false;
                $(".wiki_container .loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        });

    }







})
