$(function () {
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.dataList li:nth-child(2n)').css('margin-right','0');
    }
    // //导航全部分类
    // $(".lnav").find('.category-popup').hide();
    //
    // $(".lnav").hover(function(){
    //     $(this).find(".category-popup").show();
    // }, function(){
    //     $(this).find(".category-popup").hide();
    // });

    getquanbtn();
    function getquanbtn() {
        console.log(111);
        var b=$('.jinList li span');
        if(!b.hasClass('curr')){
            $('.jinList li span').html('111');
        }else {
            $('.jinList li span').html('222');
        }
    }
    
    //领券导航切换
    $(".txtScroll-left").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:true,effect:"left",scroll:5,vis:9,pnLoop:false,trigger:"click"});
    
    $('.txtScroll-left .bd ul li').click(function () {
        $(this).addClass('on');
        $(this).siblings().removeClass('on');
        var i = $(this).index();
        $('.containtwo ul').eq(i).addClass('show').siblings().removeClass('show');
    });




});