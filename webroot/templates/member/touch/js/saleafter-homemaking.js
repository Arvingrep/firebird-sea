

$(function () {

    var huxinSelect2 = new MobileSelect({
        trigger: '.cancel_reason3 ',
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
            $('#reason3').val(data[0]);
            $('.cancel_reason3 .choose span').hide();
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
            reason      = $("#reason3").val();

        if(reason == ''){
            showMsg('请选择售后类型');
            return;
        }
        if(cancel_price ==''){
            showMsg('请输入退款金额');
            return;
        }
        if(cancel_price>oldprice){
            showMsg(langData['homemaking'][10][13]);
            return;
        }

        

        if(cancel_desc == ''){
            showMsg('请填写售后说明');
            return;
        }
        if($("#fileList").find('.thumbnail').length == 0){
            showMsg('请上传凭证');
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
        console.log(data)

        t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

  //       $.ajax({
		// 	url: action,
		// 	data: data,
		// 	type: "POST",
		// 	dataType: "json",
		// 	success: function (data) {
		// 		if(data && data.state == 100){
		// 			location.href = refunddetailUrl;
        //          t.removeClass("disabled").html(langData['siteConfig'][11][19]);
		// 		}else{
		// 			showMsg(data.info);
		// 			t.removeClass("disabled").html(langData['siteConfig'][11][19]);
		// 		}
		// 	},
		// 	error: function(){
		// 		t.removeClass("disabled").html(langData['siteConfig'][11][19]);
		// 	}
		// });
    });



});
 // 错误提示
function showMsg(str){
    var o = $(".error");
    o.html(str).css('display','block');
    setTimeout(function(){o.css('display','none')},1000);
}
