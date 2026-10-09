$(function(){
    //出发地 目的地切换 值调换
    $('.changecity').click(function(){
        var departure = $('.placeTop .startPlace').val();
        var destination = $('.placeTop .endPlace').val();
        $('.placeTop .startPlace').toggleClass('choose').addClass('left_move');
        $('.placeTop .endPlace').toggleClass('choose').addClass('right_move');
        $('.changecity s').addClass('transform');
        setTimeout(function () {
            $('.placeTop .endPlace').val(departure).removeClass('right_move');
            $('.placeTop .startPlace').val(destination).removeClass('left_move');;
            $('.changecity s').removeClass('transform');
        }, 300)

    })

    //自定义出发地
    $(".serButton").click(function () {
        var t = $(this), url = t.data('url');
        var startPlace = $('.placeTop .startPlace').val();
        var endPlace = $('.placeTop .endPlace').val();       
        url=url.replace('departure', startPlace).replace('destination', endPlace)
        location.href = url;
    })
    //查看电话
    $('.seePhone').click(function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }
        var t =$(this);
        $(this).fadeOut(200);
        setTimeout(function(){
            t.siblings('.phoneNum').show()
        },100)
        return false;
    })

})
