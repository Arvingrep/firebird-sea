var bodyheight = $(window).height();
    //筛选弹窗显示
    function showNav() {
        $('body').css({
            overflow: 'hidden',
            height: bodyheight
        })
        $('.nav-container').addClass('active');
        $('.nav-mask').addClass('active');

        $('.mask').hide();
        $('.choose-box .choose-local').hide();
        $('.choose-tab li').removeClass('active');
    }
    //筛选弹窗关闭
    function closeNav() {
        $('.nav-container').removeClass('active');
        $('.nav-mask').removeClass('active');
        // $('.nav-second li').removeClass('active');
        $('body').css({
            overflow: 'auto',
            height: 'auto'
        })

    }

$(function() {
    //APP端取消下拉刷新
    toggleDragRefresh('off'); 
    var mask = $('.mask');

    // 筛选框
    var chooseArea = null;
    $('.choose-tab li').click(function(){
        var $t = $(this), index = $t.index(), box = $('.choose-box .choose-local').eq(index);
        if (box.css("display")=="none") {
            $t.addClass('active').siblings().removeClass('active');
            box.show().siblings().hide();
            
            if (index == 0 && chooseArea == null) {
                chooseArea = new iScroll("choose-area", {vScrollbar: false,mouseWheel: true,click: true});
            }

            mask.show();
          
        }else{
            $t.removeClass('active');
            box.hide();mask.hide();
        }
    });



    //筛选弹窗
    $(".nav-content ul li:nth-child(3n)").css("margin-right","0");

    $('.nav-mask').click(function () {
        closeNav()
    })
    $('.nav-second>li').click(function () {
        $(this).toggleClass('active').siblings().removeClass('active')
        var nowtext = $(this).text();
    })
    $('.nav-content .type_p').click(function () {
        var t=$(this).siblings('.nav-second');
        t.toggleClass('active');
        var i=$(this).siblings('.price_input');
        i.toggleClass('active');
    })


    /* $('.sure').click(function () {
        closeNav();
    })*/
    $('.reset').click(function () {
        // $('.nav-second>li').removeClass('active');
         closeNav();
    }) 


    // //点击小箭头 收起
    $('.sort').click(function () {
        $('.choose-local').hide();
        $('.mask').hide();
        $('.choose-tab  li').removeClass('active');
    });

    //搜索
    $('.ruzhu').bind('click',function(){
        $('.hh').removeClass('btnHide').addClass('btnShow');
        $('.mask').hide();
        $('.choose-local').hide();
        $('.ruzhu').hide();
        $('.choose-tab  li').removeClass('active');
        //$('.hh .serach').animate({'background':'#f5f5f5'})
        return false
      
    });

    //关闭搜索
    $('.cuo').bind('click',function(){
        //var p = $(this).parent('.hh');
        $('.hh').removeClass('btnShow').addClass('btnHide');
         $('.ruzhu').show();
      
    });


})
