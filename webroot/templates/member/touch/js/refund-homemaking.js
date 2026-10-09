


$(function () {

    //申请退款原因
    //var numArr =['决定选择其他商家','计划时间有变','买错了/买多了','协商一致退款'];//自定义数据


    //申请退款原因 申请售后
    var numArr =['决定选择其他商家','计划时间有变','买错了/买多了','协商一致退款'];//自定义数据
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
					location.href = refunddetailUrl;
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
    o.html(str).css('display','block');
    setTimeout(function(){o.css('display','none')},1000);
}
