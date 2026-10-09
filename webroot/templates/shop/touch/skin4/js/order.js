$(function(){

    // 电话弹框
    $(".tel").on("click",function(){
        $.smartScroll($('.modal-public'), '.modal-main');
        $('html').addClass('nos');
        $('.m-telphone').addClass('curr');
        return false;
    });
    $(".modal-public .close").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
        return false;
     })
    $(".bgCover").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
    })

    // 电话弹框
    $(".dindan_btn .quxiao").on("click",function(){
        $.smartScroll($('.modal-public'), '.dindan_cancel');
        $('html').addClass('nos');
        $('.m_cancel').addClass('curr');
        return false;
    });
    $(".modal-public .cancel_04").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
        return false;
     })

    // 邀请好友拼单
    $(".btn_order").on("click",function(){
        $.smartScroll($('.modal-public'), '.inviting_friends');
        $('html').addClass('nos');
        $('.in_friends').addClass('curr');
        return false;
    });

    $('.inviting_img ul li').click(function(){
        var t = $(this);
         $("html, .modal-public").removeClass('curr nos');
    });
    $('.inviting_img ul li .HN_button_code').click(function(){
        $('.bgCover').css('visibility','visible');
        $('.bgCover').css('opacity','.2');
    });
    $('.HN_PublicShare_cancel').click(function(){
        $('.bgCover').css('visibility','hidden');
        $('.bgCover').css('opacity','1');
    });


})