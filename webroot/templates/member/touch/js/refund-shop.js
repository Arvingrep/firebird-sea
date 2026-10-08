


$(function () {
    toggleDragRefresh('off');
     //仅退款--退货退款
    $('.tktype .tkcon').click(function(){
        $('.tktype').hide();
        $(this).addClass('active').siblings('.tkcon').removeClass('active');
        $('.resonWrap').removeClass('reson-hide');
        $('#refundtype').val($(this).attr('data-type'));
    })

    //计算可退金额
    if(quancount > 0){
        var totalPrice = $("#cancel_price").val()
        var count = $(".tui_num").attr('data-count')
        var singlePrice = totalPrice / (module == 'shop' ? procount : count)
        var totalRefundPrice = singlePrice * count
        totalRefundPrice = totalRefundPrice.toFixed(2);

        $('#cancel_price, #oldprice').val(totalRefundPrice);
        $(".maxMoney").text('最多可退'+ echoCurrency("symbol") + totalRefundPrice)
    }


    // if(confirmtype == '0'){
        $(".tkcon[data-type='0']").click();

        var totalPrice = $("#cancel_price").val()
        var count = $(".tui_num").attr('data-count')
        var singlePrice = totalPrice / (module == 'shop' ? procount : count)
        // 改变退款件数 ------ 减少
        $(".shop-info-num .rec ").click(function(){
            var num = $(".shop-info-num .num em ").text();
            num--;
            num = num > 1 ?　num : 1
            $(".shop-info-num .num em ").text(num)
            if(num == 1){
                $(".shop-info-num .rec ").addClass('disabled')
            }else{
                $(".shop-info-num .rec ").removeClass('disabled') 
            }

            if(num < count){
                $(".shop-info-num .append ").removeClass('disabled') 
            }else{
                $(".shop-info-num .append ").addClass('disabled') 
            }


            $("#cancel_price").val((singlePrice * num).toFixed(2))
            $(".maxMoney").text('最多可退'+ echoCurrency("symbol") + (singlePrice * num).toFixed(2))

        })


        // 改变退款件数 ------ 增加
        $(".shop-info-num .append ").click(function(){
            var num = $(".shop-info-num .num em ").text();
            num++;
            $(".shop-info-num .num em ").text(num);

            if(num == 1){
                $(".shop-info-num .rec ").addClass('disabled')
            }else{
                $(".shop-info-num .rec ").removeClass('disabled') 
            }

            if(num >= count){
                $(".shop-info-num .append ").addClass('disabled')
            }else{
                $(".shop-info-num .append ").removeClass('disabled') 
            }

            $("#cancel_price").val((singlePrice * num).toFixed(2))
            $(".maxMoney").text('最多可退'+ echoCurrency("symbol") + (singlePrice * num).toFixed(2))

        })



    // }





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
            var firWheel =$('.mobileSelect-show .wheels .selectContainer');
            firWheel.find('li').removeClass('onchose');
            firWheel.find('li').eq(fir).addClass('onchose');
             
        },
        position:[0, 0],
        callback:function(indexArr, data){
            $('#reason').val(data[0]);
            $('.cancel_reason .choose span').hide();
        }
        ,triggerDisplayData:false,
    });
    //退款类型
    var numArr2 =[
    {'id':'0','value':'仅退款'},
    {'id':'1','value':'退货退款'},

    ];//自定义数据
    var huxinSelect = new MobileSelect({
        trigger: '.tk_typeW ',
        title: '请选择退款类型',
        wheels: [
            {data: numArr2}

        ],
        transitionEnd:function(indexArr, data){         
            var fir = indexArr[0];
            var firWheel =$('.mobileSelect-show .wheels .selectContainer');
            firWheel.find('li').removeClass('onchose');
            firWheel.find('li').eq(fir).addClass('onchose');

             
        },
        position:[0, 0],
        callback:function(indexArr, data){
            $('#tk_type').val(data[0].value);
            $('#refundtype').val(data[0].id);
            $('.tk_typeW .choose span').hide();
        }
        ,triggerDisplayData:false,
    });

    $('.wheels .wheel:first-child li:first-child').addClass('onchose');


   

    //提交发布
	$(".cancel_submit a").bind("click", function(event){
        event.preventDefault();


        var t           = $(this),
            cancel_desc = $("#cancel_desc").val(),
            cancel_price= parseFloat($("#cancel_price").val()),
            oldprice    = parseFloat($("#oldprice").val()),
            tui_num     = parseInt($(".shop-info-num .num em").text()),
            reason      = $("#reason").val();
           
        if(cancel_price>oldprice){
            showMsg(langData['homemaking'][10][13]);
            return;
        }

        if(reason == ''){
            showMsg(langData['homemaking'][9][68]);
            return;
        }

        // if(cancel_desc == ''){
        //     showMsg(langData['homemaking'][9][69]);
        //     return;
        // }

        //获取图片的
		var pics = [];
        $("#fileList").find('.thumbnail').each(function(){
            var src = $(this).find('img').attr('data-val');
            pics.push(src);
        });
        $("#retpics").val(pics.join(','));

        var form = $("#fabuForm"), action = form.attr("action");
        data = form.serialize();
        // if(confirmtype == '0'){
           data = data + '&tuinum='+ tui_num;
        // }
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
					t.removeClass("disabled").html(langData['siteConfig'][6][151]);
				}
			},
			error: function(){
				t.removeClass("disabled").html(langData['siteConfig'][6][151]);
			}
		});
    });



});
 // 错误提示
function showMsg(str){
    var o = $(".error");
    o.html('<p>'+str+'</p>').css('display','block');
    setTimeout(function(){o.css('display','none')},1000);
}
