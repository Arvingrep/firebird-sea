$(function(){
    $("img").scrollLoading();

    $('.filter .inpbox input').bind('focus',function () {
        $('.filter .inpbox input').removeClass('focus');
        $(this).addClass('focus');
    });


    //筛选
    // $('.filter a').click(function () {
    //     $(this).addClass('curr').siblings().removeClass('curr')
    //     var chooseType = $(this).parents('.chooseClass').attr('data-chose');
    //     var _that = $(this),
    //         t = _that.text(),
    //         stateDiv = $('.fi-state dd a');
    //     if(t !='不限'){
    //         if (stateDiv.length > 0) {
    //             var flag = 1;
    //             var thisType2;
    //             stateDiv.each(function () {//遍历条件里的a
    //                 var thisType = $(this).attr('data-chose');
    //                 if (thisType == (chooseType + '_sub')) {

    //                     $(this).remove();
    //                 } else {
    //                     if (thisType == chooseType) {
    //                         $(this).find('span').text(t);
    //                         flag = 0;
    //                     } else {
    //                         if (chooseType.indexOf(thisType) != -1) {//检索到想要的字符串 即找到父元素                            
    //                             thisType2=$(this);
    //                             flag = 2;
    //                         }
    //                     }
    //                 }
    //             })
    //             if(flag ==2){//插入值跟在父元素之后
    //                 thisType2.after('<a href="javascript:;" data-chose="' + chooseType + '"><span>' + t + '</span><i class="idel"></i></a>');
    //             }
    //             if (flag == 1) {
    //                 $('.deletebox .fi-state dd').append('<a href="javascript:;" data-chose="' + chooseType + '"><span>' + t + '</span><i class="idel"></i></a>');
    //             }
    //         } else {
    //             $('.deletebox .fi-state dd').append('<a href="javascript:;" data-chose="' + chooseType + '"><span>' + t + '</span><i class="idel"></i></a>');
    //         }

    //     $('.fi-state').show() 
    //     }
        
    // })
    //自定义价格
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


    //二级区域
    // $("#addr dd>a").bind("click", function () {
    //     var t = $(this),
    //         id = t.attr("data-id"),
    //         type = t.closest("dl").attr("id");
    //     if(type == "subnav") typeid = id;
    //     if(type == "addr") addrid = id;
    //     if (id == 0 || $("#" + type + id).size() == 0) {
    //         $("#" + type).find(".subnav").hide();
    //     } else {
    //         $("#" + type).find(".subnav").show()
    //         $("#" + type).find(".subnav div").hide();
    //         $("#" + type + id).show();
    //         $("#" + type + id).find("a").removeClass("curr");
    //         $("#" + type + id).find("a:eq(0)").addClass("curr");
    //     }
    // });


    // 单个删除
    $(".fi-state").delegate(".idel", "click", function () {
        var par = $(this).parent();
        par.remove();
        if($('.fi-state dd a').length == 0){
            clearAll();
        }
        
    });

    // 清空条件
    $(".btn_clear").on("click", function () {
        $(".fi-state").hide().children('dd').html('');
        clearFilter();
        $(".fi-state").hide();

    });
    //清除所有筛选条件
    function clearAll(){
        $(".fi-state").hide().children('dd').html('');
        $(".fi-state").hide();
        $(".subnav").hide();
        $('.filter a').removeClass('curr');
    }




})