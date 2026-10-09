


$(function () {


    var timer2 = null;
    //商家处理倒计时
    if(datedjs){
        console.log(333)
       var intDiff = parseInt(datedjs);    //倒计时总秒数量
        timerPay(intDiff); 
    }
    
    
    function timerPay(intDiff) {
        timer2 = setInterval(function () {
            var day = 0,
            hour = 0,
            minute = 0,
            second = 0;//时间默认值
            if (intDiff > 0) {
                //计算相关的天，小时，还有分钟，以及秒
                day = Math.floor(intDiff / (60 * 60 * 24));
                hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
                minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
                second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
            }
            if (minute <= 9) minute = '0' + minute;
            if (second <= 9) second = '0' + second;
            $('#day_show').html(day);
            $('#hour_show').html('<s id="h"></s>' + hour);
            $('#minute_show').html('<s></s>' + minute);
            $('#second_show').html('<s></s>' + second);
            intDiff--;
            if($('#minute_show').text() =='00' && $('#second_show').text() =='00'){
               clearInterval(timer2);
            }
         }, 1000);

    }

    //关闭弹窗
    $('.comMask').click(function(){
        $('.comMask').hide();
        $('.comAlert').removeClass('show');
    })


    //同意退款 -- 弹出
    $('.changeAply').click(function(){
        $('.comMask').show();
        $('.agreeAlert').addClass('show');
    })
    //同意退款 -- 取消
    $('.agreeAlert .cancelDel').click(function(){
        $('.comMask').hide();
        $('.agreeAlert').removeClass('show');
    })
    

    //同意退款 -- 确定
    $('.agreeAlert .sureDel').click(function(){
        $('.comMask').hide();
        $('.agreeAlert').removeClass('show');
        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=refundPay&id='+id+'&title='+title+'&pics='+pics+'&price='+price+'&type=3'+'&status=1',
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    setTimeout(function(){location.href = orderdetailUrl;},200)
                }else{
                    showMsg(data.info);
                }
            },
            error: function(){
                showMsg(langData['siteConfig'][6][203]);
            }
        });

    })


    



});
 // 错误提示
function showMsg(str){
    var o = $(".error");
    o.html('<p>'+str+'</p>').show();
    setTimeout(function(){o.hide()},1000);
}
