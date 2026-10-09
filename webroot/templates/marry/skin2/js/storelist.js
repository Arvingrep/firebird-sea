$(function(){

    //css 样式设置
    $('.listr_con li:last-child:last-child').css('border-bottom','none')
    $('.wedding-wrap li:last-child').css('margin-right','0')

    //点击查看完整电话
    $('.hotelbottom').delegate('.seePhone','click',function(){
        var h3 = $(this).closest('.hotelbottom').find('.tel');
        var realCall = h3.attr('data-call');
        h3.text(realCall);
        $(this).fadeOut(500);
        return false;
    })

    //头部切换
    $('.nav_tab li').click(function(){
    	$(this).addClass('active').siblings().removeClass('active')
    })



    $("#price_sure").click(function () {
        $('#priceChoose a').removeClass('curr');
        var pri_1 = $(".inp_price .p1").val();
        var pri_2 = $(".inp_price .p2").val();
        var price = [];
        if(pri_1 != "" || pri_2 != ""){
            if(pri_1 != ""){
                price.push(pri_1);
            }
            price.push(",");

            if(pri_2 != ""){
                price.push(pri_2);
            }
        }
        price_section = pri_1 + '-' + pri_2+'元';
        $(".inp_price .p1").val('');
        $(".inp_price .p2").val('');
        var stateDiv = $('.fi-state dd').find('a');
        if (stateDiv.length > 0) {
            var flag = 1;
            stateDiv.each(function () {
                var thisType = $(this).attr('data-chose');
                if (thisType == 'price') {//等于价格
                    $(this).find('span').text(price_section);
                    flag = 0;
                }
            })
            if (flag == 1) {
                $('.deletebox .fi-state dd').append('<a href="12312312" data-chose="price"><span>' + price_section + '</span><i class="idel"></i></a>');
            }

        } else {

            $('.deletebox .fi-state dd').append('<a href="1212" data-chose="price"><span>' + price_section + '</span><i class="idel"></i></a>');
        }
        $('.fi-state').show();
        location.href = priceUrl.replace("pricePlaceholder", price.join(""));

    })

})
