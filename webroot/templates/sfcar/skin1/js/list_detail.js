$(function(){


    // 信息举报
    var complain = null;
    $(".report").bind("click", function(){

        var domainUrl = masterDomain;
        complain = $.dialog({
            fixed: true,
            title: langData['siteConfig'][24][0],//信息举报
            content: 'url:'+domainUrl+'/complain-sfcar-detail-'+id+'.html',
            width: 460,
            height: 300
        });
    });

    //收藏
    $(".store-btn").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = langData['siteConfig'][44][0];//已收藏

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        if(!t.hasClass("curr")){
            t.addClass("curr");
        }else{
            type = "del";
            t.removeClass("curr");
            oper = "-1";
            txt = langData['siteConfig'][19][240];//收藏
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
            $i.remove();
        });

        t.children('button').html("<em></em><span>"+txt+"</span>");

        $.post("/include/ajax.php?service=member&action=collect&module=sfcar&temp=detail&type="+type+"&id="+id);

    });
    //查看电话
    $('.phone_info').click(function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }
        var call = $(this).attr('data-call');

        $(this).find('.seePhone').text(call)
    })

    // 导航栏置顶
    var Ggoffset = $('.list-lead').offset().top - 140;
    $(window).bind("scroll",function(){
        var d = $(document).scrollTop();
        if(Ggoffset < d){
                $('.list-lead').addClass('fixed');
        }else{
            $('.list-lead').removeClass('fixed');
        }
    });



})
