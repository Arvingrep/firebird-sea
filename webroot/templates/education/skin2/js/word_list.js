$(function(){

    //显示二维码
    $('.list_ul li .t_bg').hover(function () {
        $(this).parents('li').find('.code_bg').show();
    },function () {
        $(this).parents('li').find('.code_bg').hide();
    });
    //广告轮播
    $(".adv_r #slideBox").slide({mainCell:".bd ul",effect:"left",easing:"easeOutCirc",delayTime:600,
        autoPlay:true,autoPage:'<li></li>', titCell: '.hd ul'});
    //排序切换
    $('.sort ul li').click(function(){
        $(this).addClass('curr').siblings().removeClass('curr')
    })
    //查看联系方式
    $('.list_ul li').delegate('.see_phone','click',function(){

        //验证登录
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = '/login.html';
            return false;
        }
        $(this).hide()
        $(this).siblings('.pnumber').show();
        return false;
    })





})