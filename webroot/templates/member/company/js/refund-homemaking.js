/**
 * 会员中心家政退款进度
 * by zmy at: 20210324
 */
$(function(){
	var timer2 = null;

	//商家处理倒计时
    if(datedjs){
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

	getList(1);
	//同意退款
	$('.agreeOk').click(function(){
	    if($(this).hasClass('disabled')) return false;
		$.dialog.confirm('确定同意退款吗？',function(){
            $('.agreeOk').addClass('disabled').html('退款中...');
            $.ajax({
                url: '/include/ajax.php?service=homemaking&action=refundPay&id='+id+'&title='+title+'&pics='+pics+'&price='+price+'&type=3'+'&status=1',
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    location.reload();
                    return;
                    if (data.state == 100) {
                        $('.thirLi').addClass('active')
                        $('#cancelIng').addClass('fn-hide');
                        $('#cancelFinish,.successResult').removeClass('fn-hide');

                        getList(1);//重新调取协商历史
                    } else {
                        $.dialog.alert(data.info);
                        $('.agreeOk').removeClass('disabled').html('同意退款');
                    }
                },
                error: function () {
                    $.dialog.alert(langData['siteConfig'][6][203]);
                    $('.agreeOk').removeClass('disabled').html('同意退款');

                }
            });

		})

	})

	//拒绝退款
	$('.refuseRefund').click(function(){
		$('.fwMask').show();
		$('.refuseWrap').css('display','flex');
	})

	$('.refuseWrap .refusesubmit').click(function(){
		var refusenote = $('#refuse_tip').val();
		if(refusenote == ''){
			$.dialog.alert('请填写拒绝退款原因');
			return false;
		}


        if($(this).hasClass('disabled')) return false;
        $.dialog.confirm('确定拒绝退款吗？',function(){
            $('.refuseRefund').addClass('disabled').html('拒绝中...');
            $.ajax({
                url: '/include/ajax.php?service=homemaking&action=refundPay&id='+id+'&title='+title+'&pics='+pics+'&price='+price+'&type=3'+'&status=2'+'&explain='+refusenote,
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    if (data.state == 100) {
                        location.reload();
                        return;
                        $('.refuseApply,.failedResult').removeClass('fn-hide');
                        $('.canApply,.firstApply').addClass('fn-hide');
                        $('.fwMask').hide();
                        $('.refuseWrap').css('display','none');

                        getList(1);//重新调取协商历史
                        clearInterval(timer2);
                        var intDiff2 = parseInt(datetds);    //自动关闭本次退款
                        timerPay(intDiff2);
                    } else {
                        $.dialog.alert(data.info);
                        $('.refuseRefund').removeClass('disabled').html('拒绝退款');
                    }
                },
                error: function () {
                    $.dialog.alert(langData['siteConfig'][6][203]);
                    $('.refuseRefund').removeClass('disabled').html('拒绝退款');

                }
            });

        })

		// $.ajax({
	 //        url: "/include/ajax.php?service=info&action=ilist_v2&page=1&pageSize=4",
	 //        type: "GET",
	 //        dataType: "jsonp",
	 //        success: function (data) {
	 //            if(data && data.state == 100){

	 //            }else{

	 //            }
	 //        },
	 //        error: function(){

	 //        }
	 //    });
	})
	//关闭弹窗
	$('.fwMask').click(function(){
		$('.fwMask').hide();
		$('.jzComWrap').css('display','none');
	})

	$('.refuseWrap .close').click(function(){
		$('.fwMask').hide();
		$('.jzComWrap').css('display','none');
	})


});

//协商历史
function getList(tr){
    $.ajax({
        url: "/include/ajax.php?service=homemaking&action=getrefund&id="+id+"&page="+atpage+"&pageSize="+pageSize,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if(data && data.state == 100){

                var list = data.info.list,html = [];
                if(list.length > 0){
                    for(var i = 0;i < list.length;i++){

                        retokdate     = huoniao.transTimes(list[i].retokdate, 1),

                        html.push('<li class="fn-clear">');
                        html.push('<div class="userImg"><img src="'+list[i].litpic+'" alt=""></div>');
                        html.push('<div class="userIxt">');
                        html.push('<h3>'+ list[i].nickname+'<span>'+retokdate +'</span></h3>');
                        
                        if(list[i].service == 1){
                            html.push('<p>买家申请平台介入处理</p>');
                        }else{
                            if(list[i].type == 1){
                                html.push('<p>买家提交了退款申请，退款类型：'+list[i].rettype+'，金额：'+ list[i].price+echoCurrency('short')+'。<br />退款说明：'+list[i]['retnote']+'</p>');//元
                            }else if(list[i].type == 2){
                                if(list[i].status == 2){
                                    html.push('<p>平台介入拒绝退款</p>');
                                }else{
                                    html.push('<p>平台介入同意退款</p>');
                                }
                            }else{
                                if(list[i].status == 2){
                                    html.push('<p>商家拒绝退款<br />原因：'+list[i]['retnote']+'</p>');
                                }else{
                                    html.push('<p>商家已同意退款</p>');
                                }
                            }
                        }
                        
                        html.push('</div>');
                        html.push('</li>');
                    }
                    $('.talkList ul').html(html.join(''));
                    $('.talkList').removeClass('fn-hide');
                }else{
                    $('.talkList').addClass('fn-hide');
                }
                totalCount = data.info.pageInfo.totalCount;
                showPageInfo();

            }else{
                $('.talkList').addClass('fn-hide');
            }
        },
        error: function(){
            $('.talkList').addClass('fn-hide');
        }
    });


}
