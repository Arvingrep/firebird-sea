$(function() {	

 //筛选
 //    $('.filter a').click(function () {
 //        $(this).addClass('curr').siblings().removeClass('curr')
 //        var chooseType = $(this).parents('.chooseClass').attr('data-chose');
 //        var _that = $(this),
 //            t = _that.text(),
 //            stateDiv = $('.fi-state dd a');
 //        if(t !='不限'){
 //            if (stateDiv.length > 0) {
 //                var flag = 1;
 //                var thisType2;
 //                stateDiv.each(function () {//遍历条件里的a
 //                    var thisType = $(this).attr('data-chose');
 //                    if (thisType == (chooseType + '_sub')) {
 //
 //                        $(this).remove();
 //                    } else {
 //                        if (thisType == chooseType) {
 //                            $(this).find('span').text(t);
 //                            flag = 0;
 //                        } else {
 //                            if (chooseType.indexOf(thisType) != -1) {//检索到想要的字符串 即找到父元素
 //                                thisType2=$(this);
 //                                flag = 2;
 //                            }
 //                        }
 //                    }
 //                })
 //                if(flag ==2){//插入值跟在父元素之后
 //                    thisType2.after('<a href="javascript:;" data-chose="' + chooseType + '"><span>' + t + '</span><i class="idel"></i></a>');
 //                }
 //                if (flag == 1) {
 //                    $('.deletebox .fi-state dd').append('<a href="javascript:;" data-chose="' + chooseType + '"><span>' + t + '</span><i class="idel"></i></a>');
 //                }
 //            } else {
 //                $('.deletebox .fi-state dd').append('<a href="javascript:;" data-chose="' + chooseType + '"><span>' + t + '</span><i class="idel"></i></a>');
 //            }
 //
 //        $('.fi-state').show()
 //        }
 //
 //    })

    //  //二级区域
    // $("#addr .parNav a").bind("click", function () {
    //     var t = $(this),
    //         id = t.attr("data-id"),
    //         par = t.closest("dd");
    //         console.log(id)
    //     if (id == 0 || $("#addr"+id).size() == 0) {
    //         par.find(".subnav").hide();
    //     } else {
    //         par.find(".subnav").show()
    //         par.find(".subnav div").hide();
    //         $("#addr"+ id).show();
    //         $("#addr"+ id).find("a").removeClass("curr");
    //     }
    //     return false;
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
        clearAll();
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
