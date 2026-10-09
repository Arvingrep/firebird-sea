$(function(){

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

})
