$(function(){
    //广告轮播
    $(".adv_r #slideBox").slide({mainCell:".bd ul",effect:"left",easing:"easeOutCirc",delayTime:600,
        autoPlay:true,autoPage:'<li></li>', titCell: '.hd ul'});

    //预约弹窗弹出
    $(".order_time").bind("click", function(){
        var f = $(this);
        if(f.hasClass("disabled")) return false;
        $('.order_mask').show();
        return false;
     })

    $('.main_wrap3 .claDetail:nth-child(2n)').css('margin-right','0')
    $('.class_bot .claTeach .teach_ul li:nth-child(2n)').css('margin-right','0')
    //教师详情切换
    $(".teac_tab li").bind("click", function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i=$(this).index();
        $(".teac_wrap2 .teac_con").eq(i).addClass('teac_show').siblings().removeClass('teac_show')
        
     })
      



    //控制标题的字数
    $('.org_name').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });


   




})