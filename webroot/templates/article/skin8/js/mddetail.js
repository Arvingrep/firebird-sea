$(function () {
    //左侧导航吸顶
    var navHeight = $('.navlist').offset().top;


    $(window).scroll(function() {
        if ($(window).scrollTop() > navHeight) {
            $('.navlist').addClass('topfixed');
        } else {
            $('.navlist').removeClass('topfixed');
        }
    });






    //收藏
    $(".collect").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = "已关注";

        if(t.hasClass('disabled')) return;

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }
        $(this).toggleClass("active");
        if(!t.hasClass("curr")){
            t.addClass("curr");
            $(".keyAndshare .share-oper .collect").text('关注');
        }else{
            type = "del";
            t.removeClass("curr");
            oper = "-1";
            txt = "关注";
            $(".keyAndshare .share-oper .collect").text('取消关注');
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
            $i.remove();
        });

        t.html("<i></i>"+txt);

        $.post("/include/ajax.php?service=member&action=followMember&for=media&id="+id);

    });

});