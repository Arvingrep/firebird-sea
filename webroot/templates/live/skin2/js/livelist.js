$(function () {

      $('.selectList .fir .more ').click(function () {
        $(this).find('i').toggleClass('on');
        $('.selectList .sec').toggleClass('show');
    });


    // $('.conBox .conList li').hover(function () {
    //     $(this).find('.code_bg').show();
    // },function () {
    //     $(this).find('.code_bg').hide();
    // });

    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.conBox .conList li:nth-child(4n)').css('margin-right','0');
    }

    $('.select_x a').click(function () {
        $(this).addClass('curr').siblings().removeClass('curr');
    });
    $('.select_bar .cateList li').click(function () {
        $(this).addClass('curr').siblings().removeClass('curr');
        var i = $(this).index();
        $('.filter .container').eq(i).addClass('show').siblings().removeClass('show');
    });
    $('.select_bar .sele_r .sort span').click(function () {
        $(this).addClass('curr').siblings().removeClass('curr');
    });

    // 鼠标经过下拉排序框
    $('.select_bar .sele_r .state').hover(function(){
        $('.select_bar .sele_r .state .ModuleBox').show();
    },function(){
        $('.select_bar .sele_r .state .ModuleBox').hide();
    });
    //鼠标点击下拉列表项
    $('.select_bar .sele_r  .state a').click(function(){
        $('.select_bar .sele_r  .state dt a').text($(this).text());
        $('.select_bar .sele_r  .state .ModuleBox').hide();
    });

    //点击关注
    $('.zhuBo_Box ul li .info .btn_box .btn').click(function () {
        var t = $(this);
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        if(!t.hasClass("curr")){
            t.addClass("curr");
            t.find('span').html('已关注');
            $(this).parent().find('.appo_sec').show();
            fadeOut();
        }else {
            t.removeClass("curr");
            t.find('span').html('关注');
        }

    });
    function fadeOut(){
        setTimeout(function () {
            $('.appo_sec').fadeOut();
        },1500);
    }




});