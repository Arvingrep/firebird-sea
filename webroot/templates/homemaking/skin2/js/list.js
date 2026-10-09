$(function(){

    //商家列表页 查看电话
    $('.store_wrap').delegate('.call2','click',function(){
       
        var tel = $(this).find('em').data('tel');
        $(this).find('em').text(tel);
        return false;
        e.stopPropagation();
    })

    $("img").scrollLoading();

    var lens = $('#fnav .item_box a').length;
    if(lens<=11){
        $(".f_more").hide();
    }else{
        $(".f_more").show();
    }

    //选择排序
    $('.order_div').delegate('a','click',function(){
        $(this).addClass('on').siblings('a').removeClass('on')
        $('.other_filter a').removeClass('active')
        $(this).parents('.order_price').addClass('active');
        var txt = $(this).text();
        $(this).parents('.order_price').find('em').text(txt);
        $('.order_div').hide();

    })
    $(".order_price").hover(function(){       
        $(this).find(".order_div").css('display','block')              
    },function(){
        $(this).find(".order_div").css('display','none');
    });


    /**
     * 筛选变量
     */
    var addrid; //地址
    var flag = 1; // pc端
    var item;
    var orderby = $(".sort ul").find('.curr').attr("data-sort"); //排序
    //折叠筛选
    $(".f_more").bind("click", function(){
        var t = $(this);
        t.hasClass("curr") ? t.removeClass("curr") : t.addClass("curr");
        if(t.hasClass("curr")){
            t.next('.item_box').addClass('on');
            t.html("收起 <i></i>");
        }else{
            t.next('.item_box').removeClass('on');
            t.html("更多 <i></i>");
        }

    });

    // //筛选
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
        console.log(price_section);

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
                $('.deletebox .fi-state dd').append('<a href="javascript:;" data-chose="price"><span>' + price_section + '</span><i class="idel"></i></a>');
           }
   
        } else {           

            $('.deletebox .fi-state dd').append('<a href="javascript:;" data-chose="price"><span>' + price_section + '</span><i class="idel"></i></a>');
        }
        $('.fi-state').show()
        location.href = priceUrl.replace("pricePlaceholder", price.join(""));

    })


    //二级区域二级分类交互
    $("#subnav .item_box>a,#addr dd>a").bind("click", function () {
        var t = $(this),
            id = t.attr("data-id"),
            type = t.closest("dl").attr("id");
        if(type == "subnav") typeid = id;
        if(type == "addr") addrid = id;
        if (id == 0 || $("#" + type + id).size() == 0) {
            $("#" + type).find(".subnav").hide();

        } else {
            $("#" + type).find(".subnav").show()
            $("#" + type).find(".subnav div").hide();
            $("#" + type + id).show();
            $("#" + type + id).find("a").removeClass("curr");
            $("#" + type + id).find("a:eq(0)").addClass("curr");
        }

    });


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
        clearAll();
    });
    //清除所有筛选条件
    function clearAll(){
        $(".fi-state").hide().children('dd').html('');
        $(".fi-state").hide();
        $(".subnav").hide();
        $('.filter a').removeClass('curr');
        $('#fnav .item_box').removeClass('on');
        $(".f_more").removeClass('curr')
        $(".f_more").html("更多 <i></i>");
    }

    //点击排序
    $(".other_filter a").on("click", function () {
        $(this).addClass('active').siblings().removeClass('active')
    })

})