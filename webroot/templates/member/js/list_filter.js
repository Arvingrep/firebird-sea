$(function(){
    $("img").scrollLoading();
    $('.filter dl:last-child').css('border-bottom','none')

    $('.filter .inpbox input').bind('focus',function () {
        $('.filter .inpbox input').removeClass('focus');
        $(this).addClass('focus');
    });

    //排序切换
    $('.sort li').click(function () {
        $(this).addClass('curr').siblings().removeClass('curr')
    })

    //准新车切换
    $('.sort2 li').click(function () {
        $(this).toggleClass('active')
    })
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
    //                 thisType2.after('<a href="javascript:;" data-chose="' + chooseType + '" class="fa"><span>' + t + '</span><i class="idel"></i></a>');
    //             }
    //             if (flag == 1) {
    //                 if(chooseType != 'brand'){

    //                     $('.deletebox .fi-state dd').append('<a href="javascript:;" data-chose="' + chooseType + '" class="fa"><span>' + t + '</span><i class="idel"></i></a>');
    //                 }
    //             }
    //         } else {
    //             if(chooseType != 'brand'){

    //               $('.deletebox .fi-state dd').append('<a href="javascript:;" data-chose="' + chooseType + '" class="fa"><span>' + t + '</span><i class="idel"></i></a>');  
    //             }
                
    //         }

    //         if ($('.fa').size()>0) {
    //             $('.fi-state').show()
    //         } else{
    //             $('.fi-state').hide()
    //         }
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
        price_section = pri_1 + '-' + pri_2+langData['siteConfig'][40][44];//元
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


    //品牌二级
    //默认先展开热门下的品牌
    clickSub();
    function clickSub(){       
        $('#brand .subnav,#brand .subnav div').show();
        $('#jump-li-hot').show().siblings().hide()     
    }

    $("#brand dd>a").bind("click", function () {
        console.log(222)
        $('#brand .subnav,#brand .subnav div').show();
        var typeid = $(this).attr('data-id');
        $('.jump-brand').each(function () {

            var thisID = $(this).attr('id');
            if(typeid == thisID){

                $(this).show();
                $(this).siblings().hide()
            }
        })
        
    });
    
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

     //更多筛选条件
     $('.filter dl.more .item ul ').delegate("a", "click", function () {
        
         var id=$(this).attr('data-id');
         if(id ==0){
            
            $('.filter dl.more .item ul a').removeClass('curr');
         }else{
            $('.filter dl.more .item ul a').removeClass('curr')
            $(this).addClass('curr');
         }
         var thisText=$(this).text();
         var more_span=$(this).parents('.item').find('.more_span');
         more_span.text(thisText);
         if(!($('.car-config .more_span').text() == langData['car'][5][15])){//亮点配置
            $('.car-config').css('width','96px')
         }
         

     })



    $(".filter .more .item").hover(function () {
        $(this).addClass('active')
        $(this).find("ul").stop().slideDown(150);
    }, function () {
        $(this).find("ul").stop().slideUp(150);
        $(this).removeClass('active')
    });

    //更多 收起展开
    var lens = $('#fnav dd a').length;
    if(lens<=10){
        $(".f_more").hide()
    }else{
        $(".f_more").show();
    }
    //折叠筛选
    $(".f_more").bind("click", function(){
        var t = $(this);
        t.hasClass("curr") ? t.removeClass("curr") : t.addClass("curr");
        if(t.hasClass("curr")){
            t.next('.item_box').addClass('on');

            t.html(langData['siteConfig'][22][8]+" <i></i>");//收起
        }else{
            t.next('.item_box').removeClass('on');

            t.html(langData['siteConfig'][18][18]+" <i></i>");//更多
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