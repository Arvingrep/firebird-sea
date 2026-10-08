var huxinSelect = new MobileSelect({
    trigger: '.cancel_reason ',
    title: '',
    wheels: [
        {data: numArr}

    ],
    position:[0, 0],
    callback:function(indexArr, data){
        $('#reason').val(data[0]);
        $('.cancel_reason .choose span').hide();
    }
    ,triggerDisplayData:false,
});

//确认服务后申请售后
var huxinSelect2 = new MobileSelect({
    trigger: '.cancel_reason3 ',
    title: '',
    wheels: [
        {data: numArr}

    ],
    position:[0, 0],
    callback:function(indexArr, data){
        $('#reason3').val(data[0]);
        $('.cancel_reason3 .choose span').hide();
    }
    ,triggerDisplayData:false,
});

$(function () {

    //申请退款原因
    //var numArr =['决定选择其他商家','计划时间有变','买错了/买多了','协商一致退款'];//自定义数据


    //申请退款原因 申请售后
    var numArr =['决定选择其他商家','计划时间有变','买错了/买多了','协商一致退款'];//自定义数据
    var huxinSelect1 = new MobileSelect({
        trigger: '.cancel_reason2 ',
        title: '',
        wheels: [
            {data: numArr}

        ],
        position:[0, 0],
        callback:function(indexArr, data){
            $('#reason2').val(data[0]);
            $('.cancel_reason2 .choose span').hide();
        }
        ,triggerDisplayData:false,
    });



    //提交发布
	$(".cancel_submit p").bind("click", function(event){
        event.preventDefault();


        var t           = $(this),
            cancel_desc = $("#cancel_desc").val(),
            cancel_price= $("#cancel_price").val(),
            oldprice    = $("#oldprice").val(),
            reason      = $("#reason").val();

        if(cancel_price>oldprice){
            alert(langData['homemaking'][10][13]);
            return;
        }

        if(reason == ''){
            alert(langData['homemaking'][9][68]);
            return;
        }

        if(cancel_desc == ''){
            alert(langData['homemaking'][9][69]);
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
                    //alert(data.info);
                    // history.go(-1);
					location.href = orderdetailUrl;
				}else{
					alert(data.info);
					t.removeClass("disabled").html(langData['siteConfig'][11][19]);
				}
			},
			error: function(){
				t.removeClass("disabled").html(langData['siteConfig'][11][19]);
			}
		});
    });



});
