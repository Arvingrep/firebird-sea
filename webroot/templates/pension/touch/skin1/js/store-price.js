$(function(){
    //机构养老 居家养老 旅居养老 
    $('.head_wrap .detail_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.con_wrap .detail_con').eq(i).addClass('detail_show').siblings().removeClass('detail_show');
    });

    // 机构养老小切换1
     $('.org_con .price_tab2 .table_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.org_con .tab_container .tab_con').eq(i).addClass('tab_show').siblings().removeClass('tab_show');
    });
    //机构养老小切换2
     $('.org_con .price_tab3 .table_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.org_con .tab_container2 .tab_con2').eq(i).addClass('tab_show2').siblings().removeClass('tab_show2');
    });

    // 居家养老小切换
     $('.home_con .table_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.home_con .tab_container .tab_con').eq(i).addClass('tab_show').siblings().removeClass('tab_show');
    });

     // 旅居养老小切换
     $('.travel_con .table_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.travel_con .tab_container .tab_con').eq(i).addClass('tab_show').siblings().removeClass('tab_show');
    });
     //联系方式弹出
    $('.org_footer').delegate('.contact', 'click', function(){
        $('.contact_mask').show();

    })
    //联系方式关闭
    $('.contact_mask').delegate('.know', 'click', function(){
        $('.contact_mask').hide();

    })



})
