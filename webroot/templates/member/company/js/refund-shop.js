/**
 * 会员中心家政退款进度
 * by zmy at: 20210324
 */
$(function(){
	var timer2 = null;

	//商家处理倒计时
    var time = $(".time-item").attr('data-time');
    if(time){
        var now = parseInt((new Date()).valueOf()/1000)
        var intDiff = parseInt(time);    //倒计时总秒数量
            console.log(intDiff - now)                  
        if(now <= intDiff){
            timerPay(intDiff - now); 
        }
        
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
                if(day <= 3){//3天之内的只要小时 不要天
                    hour = hour + day*24;
                    day = 0;
                }
                hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
                minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
                second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
            }else{
                clearInterval(timer2)
            }
            if (minute <= 9) minute = '0' + minute;
            if (second <= 9) second = '0' + second;
            if(day > 0){
               $('#day_show').html(day); 
           }else{
               $('#day_show').html(''); 
                $('#day_show').next('span').hide()
           }
            
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
                url: '/include/ajax.php?service=shop&action=refundPay&id='+id+'&proid='+proid+'&title='+title+'&pics='+pics+'&price='+price+'&type=3'+'&status=1',
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    if (data.state == 100) {
                        $.dialog.alert('退款成功');
                        location.reload();
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
                url: '/include/ajax.php?service=shop&action=refundPay&id='+id+'&proid='+proid+'&title='+title+'&pics='+pics+'&price='+price+'&type=3'+'&status=2'+'&explain='+refusenote,
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    if (data.state == 100) {

                        $('.fwMask').hide();
                        $('.refuseWrap').css('display','none');
                        location.reload();
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
	$('.fwMask,.refuseWrap .close').click(function(){
		$('.fwMask').hide();
		$('.jzComWrap').css('display','none');
	})


    /******2021-12-30 商城退款新增*******/
    //确认收货
    $('.agreeTuihuo').click(function(){
        $('.tuihuoMask').show();
        $('.thWrap').css('display','flex');
    })
    //关闭弹窗
    $('.tuihuoMask,.thWrap .close').click(function(){
        $('.tuihuoMask').hide();
        $('.thWrap').css('display','none');
    })
    //确认收货表单验证
    var inputVerify = {
        addrid: function(){
            if($(".addrBtn").attr('data-id') == 0 || $(".addrBtn").attr('data-id') == ''){
                $("#selAddr").parents("li").addClass("error");
                return false;
            }else{
                $("#selAddr").parents("li").removeClass("error");

            }
            return true;
        }
        ,address: function(){
            var t = $("#address"), val = t.val(), par = t.closest("li");
            if(val.length < 5 || val.length > 60 || /^\d+$/.test(val)){
                par.addClass("error");
                return false;
            }
            return true;
        }
        ,person: function(){
            var t = $("#person"), val = t.val(), par = t.closest("li");
            console.log(val)
            if(val.length < 2 || val.length > 15){
                par.addClass("error");
                par.find(".input-tips").show();
                return false;
            }
            return true;
        }
        ,mobile: function(){
            var t = $("#mobile"), val = t.val(), par = t.closest("li");
            if(val == ""){
                par.addClass("error");
                par.find(".input-tips").show();
                return false;
            }else{
                par.find(".input-tips").hide();

            }
            return true;
        }
        ,tel: function(){
            var t = $("#tel"), val = t.val(), par = t.closest("li");
            if($("#mobile").val() == "" && val == ""){
                par.addClass("error");
                return false;
            }
            return true;
        }

    }

    $("#submit").bind("click", function(){


        var t = $(this);
        if(t.hasClass("disabled")) return false;
        var addr = $(".addrBtn").attr("data-id");
        $("#addrid").val(addr);
        //验证表单
        if( inputVerify.person() && inputVerify.mobile() && inputVerify.addrid() && inputVerify.address()){
            var data = $('.fabuform').serialize();
            t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

            $.ajax({
                url:  '/include/ajax.php?service=shop&action=refundPay&id='+id+'&proid='+proid+'&returngoods=1',
                data: data,
                type: "POST",
                dataType: "jsonp",
                success: function (data) {
                    if(data && data.state == 100){

                        //操作成功后关闭浮动层
                        $('.tuihuoMask').hide();
                        $('.thWrap').css('display','none');
                        location.reload();

                    }else{
                        alert(data.info);
                        t.removeClass("disabled").html(langData['shop'][5][32]);
                    }
                },
                error: function(){
                    alert(langData['siteConfig'][20][183]);
                    t.removeClass("disabled").html(langData['shop'][5][32]);
                }
            });

        }

    });



});

//协商历史
function getList(tr){
    $.ajax({
        url: "/include/ajax.php?service=shop&action=getrefund&id="+id+"&proid="+proid+"&page="+atpage+"&pageSize="+pageSize,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if(data && data.state == 100){

                var list = data.info.list.refundinfo,html = [];
                if(list.length > 0){
                    for(var i = 0;i < list.length;i++){

                        retokdate     = huoniao.transTimes(list[i].datetime, 1),

                        html.push('<li class="fn-clear">');
                        html.push('<div class="userImg"><img src="'+(list[i].typestatus == 1 ? logo : photo)+'" onerror="this.src=\'/static/images/noPhoto_100.jpg\'" alt=""></div>');
                        html.push('<div class="userIxt">');
                        html.push('<h3>'+ list[i].typename+'<span>'+retokdate +'</span></h3>');
                        // if (list[i].status == 1){
                        //     html.push('<p>商家已同意退款</p>');
                        // }else if(list[i].status == 2){
                        //     html.push('<p>商家拒绝退款</p>');
                        // }else{
                        //     html.push('<p>买家创建了退款申请，退款类型：仅退款，原因：'+list[i].rettype+'，金额：'+list[i].price+'元。</p>');

                        // }
                        html.push('<p>'+list[i].refundinfo+'</p>')
                        if(list[i].pics){
                            var picArr = [];
                            var pics = list[i].pics.split(',');
                            if(pics){
                                for(var p = 0; p < pics.length; p++){
                                    picArr.push('<a href="/include/attachment.php?f='+pics[p]+'" target="_blank"><img src="/include/attachment.php?f='+pics[p]+'" /></a>')
                                }
                            }
                            html.push('<div class="images">'+picArr.join('')+'</div>');
                        }
                        html.push('</div>');
                        html.push('</li>');
                    }
                    $('.talkList ul').html(html.join(''));
                    $('.talkList').removeClass('fn-hide');
                }else{
                    $('.talkList').addClass('fn-hide');
                }
                totalCount = data.info.list.refundinfo.length;
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
