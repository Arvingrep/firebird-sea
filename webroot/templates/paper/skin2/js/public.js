$(function () {
    //搜索
    $('.search-box .choose-box li').click(function () {
        var t = $(this);
        t.toggleClass('active').siblings().removeClass('active');
        if(t.hasClass('active')){
            $('#seach_date').val(t.attr('date-time'));
        }else{
            $('#seach_date').val('');
        }
    });
    $('.search-box .form-box input').focus(function () {
        $('.search-box .form-box').addClass('curr');
    });
    $('.search-box .form-box input').blur(function () {
        $('.search-box .form-box').removeClass('curr');
    });


    $('.search-box form').submit(function(e){
        // var val = $('#search_keyword').val();
        // if(val == ''){
        // }
        // e.preventDefault();
    });

    $('#search_button').bind('click', function () {
        if($('.search-box .choose-box li').hasClass('active')){
            var date = $('.search-box .choose-box li.active').attr('date-time');
        }else {
            var date = " ";
            console.log(date);
        }

    })


    //第三方登录
    $(".loginconnect, .othertype a").click(function(e){
        e.preventDefault();
        var href = $(this).attr("href");
        loginWindow = window.open(href, 'oauthLogin', 'height=565, width=720, left=100, top=100, toolbar=no, menubar=no, scrollbars=no, status=no, location=yes, resizable=yes');

        //判断窗口是否关闭
        mtimer = setInterval(function(){
            if(loginWindow.closed){
                clearInterval(mtimer);
                huoniao.checkLogin(function(){
                    location.reload();
                });
            }
        }, 1000);
    });


    // 顶部二维码
    $('.topbarlink li').hover(function(){
        var s = $(this);
        s.find('.pop').show();
    }, function(){
        $(this).find('.pop').hide();
    })


    //搜索
    // $("#search").bind("click", function(){
    //     var company = $("#company").val(), date = $("#date").val();
    //     if(company){
    //         location.href = searchUrl.replace("%1", company).replace("%2", date);
    //     }
    // });

});