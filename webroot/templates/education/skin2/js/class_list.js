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
    //进店看看
    $('.list_ul').delegate('.new_info','click',function(){
        var id = $(this).attr('data-id')
        window.location.href = channelDomain+'/store-detail-'+id+'.html';
        //window.open(channelDomain+'/store-detail-'+id+'.html',"_blank");
         return false;
    })




})