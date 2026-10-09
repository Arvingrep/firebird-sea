/**
 * Created by Administrator on 2018/5/18.
 */
$(function(){
    // 判断浏览器是否是ie8
     if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.app-con .down .con-box:last-child').css('margin-right','0');
        $('.wx-con .c-box:last-child').css('margin-right','0');
        $('.module-con .box-con:last-child').css('margin-right','0');
        $('.list_left .store_ul li:nth-child(3n)').css('margin-right','0');

    }

    //控制标题的字数
    $('.sliceFont').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });
    
    isIE();
    function isIE() {
        if(!!window.ActiveXObject || "ActiveXObject" in window){
            //控制标题的字数 20
            $('.car_info .car_name').each(function(index, el) {
                var num = $(this).attr('data-num');
                var text = $(this).text();
                var len = text.length;
                if(len > num){
                    $(this).html(text.substring(0,num));
                }
            });
        }else{
          return false;
    　　 }
    }







})
