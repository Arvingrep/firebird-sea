


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

    //撤销申请 -- 弹出
    $('.cancelApply').click(function(){
        $('.delMask').show();
        $('.delAlert').addClass('show');
    })
    //撤销申请 -- 取消
    $('.delAlert .cancelDel,.delMask').click(function(){
        $('.delMask').hide();
        $('.delAlert').removeClass('show');
    })

    //撤销申请 -- 确定
    $('.delAlert .sureDel').click(function(){
        $('.delMask').hide();
        $('.delAlert').removeClass('show');
        $.ajax({
            url: '/include/ajax.php?service=homemaking&action=operOrder&oper=cancelrefund&id='+detailId,
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    setTimeout( function(){location.href = orderdetailUrl;},200)
                }else{
                    showMsg(data.info);
                }
            },
            error: function(){
                showMsg(langData['siteConfig'][6][203]);
            }
        });

    })

    //提交发布
	$(".cancel_submit a").bind("click", function(event){
        event.preventDefault();


        var t           = $(this),
            cancel_desc = $("#cancel_desc").val(),
            cancel_price= $("#cancel_price").val(),
            oldprice    = $("#oldprice").val(),
            reason      = $("#reason").val();
            console.log(333)
        if(cancel_price>oldprice){
            showMsg(langData['homemaking'][10][13]);
            return;
        }

        if(reason == ''){
            showMsg(langData['homemaking'][9][68]);
            return;
        }

        if(cancel_desc == ''){
            showMsg(langData['homemaking'][9][69]);
            return;
        }

        //获取图片的
		var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#retpics").val(pics.join(','));

        var form = $("#fabuForm"), action = form.attr("action");
        data = form.serialize();

        t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

        $.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					// setTimeout(function () {
                    //     bridge.callHandler("goBack", {}, function (responseData) {
                    //     });
                    // }, 200);
                    //showMsg(data.info);
                    // history.go(-1);
					location.href = orderdetailUrl;
				}else{
					showMsg(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][11][19]);
				}
			},
			error: function(){
				t.removeClass("disabled").html(langData['siteConfig'][11][19]);
			}
		});
    });



});
 // 错误提示
function showMsg(str){
    var o = $(".error");
    o.html('<p>'+str+'</p>').show();
    setTimeout(function(){o.hide()},1000);
}
