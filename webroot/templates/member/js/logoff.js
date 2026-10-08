

$(function(){

    //同意注销
    $('.off-agree').delegate("a", "click", function(){
        var t = $(this);
        if(t.hasClass('disabled')) return false;

        $('.delMask').addClass('show');
        $('.delAlert').show();      
        
    });
    //确认删除
    $('.sureDel').click(function(e){
        var t = $('.off-agree a'), txt = t.text();
        $('.delMask').removeClass('show');
        $('.delAlert').hide();
        t.addClass("disabled").html(langData['siteConfig'][54][87]+'...');//申请中
        $.ajax({
            url: "/include/ajax.php?service=member&action=canceLlation",
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                    //注销成功
                    t.addClass("disabled").html(langData['siteConfig'][45][54]);//退出中
                    var device = navigator.userAgent;
                    if(device.indexOf('huoniao') > -1){

                        $.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain, path: '/'});

                    }else{
                        window.location.href="/logout.html"
                    }

                }else{
                    alert(data.info);
                    t.removeClass("disabled").html(txt);
                }
            },
            error: function(){
                alert(langData['siteConfig'][20][227]);//网络错误，加载失败！
                t.removeClass("disabled").html(txt);
            }
        });
    })

    //关闭删除
    $('.cancelDel,.delMask').click(function(){
        $('.delMask').removeClass('show');
        $('.delAlert').hide();
    })

})
