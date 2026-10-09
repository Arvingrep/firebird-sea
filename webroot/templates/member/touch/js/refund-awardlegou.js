$(function () {

    //申请退款原因
    var huxinSelect = new MobileSelect({
        trigger: '.cancel_reason ',
        title: '请选择退款原因',
        wheels: [
            {data: numArr}

        ],
        transitionEnd:function(indexArr, data){
            var fir = indexArr[0];
            //var sec = indexArr[1];
            $('.selectContainer').find('li').removeClass('onchose')
            var firWheel =$('.wheels .wheel:first-child').find('.selectContainer');
            //var secWheel =$('.wheels .wheel:last-child').find('.selectContainer');
            firWheel.find('li').eq(fir).addClass('onchose');
            //secWheel.find('li').eq(sec).addClass('onchose');
             
        },
        position:[0, 0],
        callback:function(indexArr, data){
            $('#reason').val(data[0]);
            $('.cancel_reason .choose span').hide();
        }
        ,triggerDisplayData:false,
    });

    $('.wheels .wheel:first-child').find('li').eq(0).addClass('onchose')
    //$('.wheels .wheel:last-child').find('li').eq(0).addClass('onchose')



    //提交发布
	$(".cancel_submit a").bind("click", function(event){
        event.preventDefault();
        

        var t           = $(this),
            reason      = $("#reason").val();

        if(t.hasClass("disabled")) return false;
        if(reason == ''){//退款原因
            showMsg(langData['homemaking'][9][68]);
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

        t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");//提交中

        $.ajax({
			url: action,
			data: data,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
                    if(tuikType == 1){
                        showMsg('已提交退款申请');
                    }else{
                        showMsg('已提交退货申请');
                    }
                    
					location.href = orderdetailUrl;
				}else{
					showMsg(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][6][151]);
				}
			},
			error: function(){
                showMsg(langData['siteConfig'][20][183])//网络错误，请稍候重试！
				t.removeClass("disabled").html(langData['siteConfig'][6][151]);
			}
		});
    });



});
 // 错误提示
function showMsg(str){
    var o = $(".error");
    o.html(str).css('display','block');
    setTimeout(function(){o.css('display','none')},1000);
}
