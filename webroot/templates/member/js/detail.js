/**
 * Created by Administrator on 2018/5/18.
 */
$(function(){


    $('.list_left .list_ul li:nth-child(4n)').css('margin-right','0')
    $('.adviser-list li:nth-child(2n)').css('margin-right','0')
    $('.photos .img_list:nth-child(2n)').css('margin-right','0')
     


    $("#slideBox").slide({mainCell:".bd ul",autoPlay:true,autoPage:true,});
    $("#slideBox2").slide({mainCell:".bd ul",autoPlay:true,autoPage:true,});

    $(".icon-yellow-error").hover(function(){
        $(this).addClass('active')
    },function(){
        $(this).removeClass('active')
    });

    //控制标题的字数
    $('.sliceFont').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });

    //点击电话
    $(".l_phone2").bind("click", function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = '/login.html';
            return false;
        }
        $('.l_phone3').show()
        $(this).hide()

    })
    //点击电话
    $(".tel2").bind("click", function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = '/login.html';
            return false;
        }
        $('.tel3').show()
        $(this).hide()
        return false;

    })

    //点击预约
    $(".order").bind("click", function(){
        $('.order_mask').show()
    })
    //预约提交
    $(".order_mask .order_submit").bind("click", function(){
        var f = $(this);
        var str = '',r = true;
        if(f.hasClass("disabled")) return false;        

        // 手机号
        var order_phone = $('#order_phone')
        var order_phonev = $.trim(order_phone.val());
        if(order_phonev == '') {
            if (r) {
                order_phone.focus();
                errmsg(order_phone, langData['car'][8][15]);//请输入手机号码
            }
            r = false;
        } else {
            // var telReg = !!order_phonev.match(/^(13|14|15|17|18)[0-9]{9}$/);
            // if(!telReg){
            // if (r) {
            //     order_phone.focus();
            //     errmsg(order_phone,langData['car'][8][16]);//请输入正确手机号码
            // }
            // r = false;
            // }
        }

        if(!r) {
            return false;
        }       
        $('.order_mask').hide()
        $('.order_success').show()

    });
    //关闭预约弹窗
    $(".order_mask .close_alert,.order_mask .cancel").bind("click", function(){
        $('.order_mask').hide();
    })

    //关闭预约成功弹窗
    $(".order_success .close_alert,.order_success .t3").bind("click", function(){
        $('.order_success').hide();
    })


    //数量错误提示
    var errmsgtime;
    function errmsg(div,str){
        $('#errmsg').remove();
        clearTimeout(errmsgtime);
        var top = div.offset().top - 33;
        var left = div.offset().left;

        var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;height:30px;line-height:30px;text-align:center;color:#f76120;font-size:14px;display:none;z-index:99999;background:#fff;">' + str + '</div>';
        $('body').append(msgbox);
        $('#errmsg').fadeIn(300);
        errmsgtime = setTimeout(function(){
            $('#errmsg').fadeOut(300, function(){
                $('#errmsg').remove()
            });
        },2000);
    };


    


})
