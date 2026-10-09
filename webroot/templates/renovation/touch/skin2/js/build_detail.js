$(function(){
$(".section1 ul li:nth-child(3n)").css("margin-right","0");
     //放大图片
    $.fn.bigImage({
        artMainCon:".build_container",  //图片所在的列表标签
    });

            //预约参观
    $('.build_foot').delegate(".order_see", "click", function(){
        //参观工地        
        var site_view=$('.build_title').text();
        //建筑面积
        var site_area=$('.area').text();
        $('.site_view').text(site_view);//工地名称
        $('.site_area').text(site_area);//建筑面积
        $('.order_mask').show();

    })
    // 预约参观 表单验证
    function isPhoneNo(p) {
        var pattern = /^1[34578]\d{9}$/;
        return pattern.test(p);
    }
    $('.free').click(function(){

        var f = $(this);        
        var name = $('#order_name').val(), 
            tel = $('#order_phone').val();
        if(f.hasClass("disabled")) return false;

        if (!name) {

            $('.name-1').show();
            setTimeout(function(){$('.name-1').hide()},1000);

        }else if (!tel) {

            $('.phone-1').show();
            setTimeout(function(){$('.phone-1').hide()},1000);

        }else if (isPhoneNo($.trim($('#order_phone').val())) == false){

            $('.phone-1').text('请填写正确的手机号').show();
            setTimeout(function(){$('.phone-1').hide()},1000);

        }else {

            $('.order_mask').hide();
            $('.order_mask2').show();
        }
    })
    // 立即预约关闭
     $('.order_mask .work_close').click(function(){
        $('.order_mask').hide();
   
     })
     $('.order_mask2 .t3').click(function(){
        $('.order_mask2').hide();
   
     })

  

})