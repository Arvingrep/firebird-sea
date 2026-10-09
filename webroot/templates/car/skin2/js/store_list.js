/**
 * Created by Administrator on 2018/5/18.
 */
$(function(){
    //地图链接
    $('.appMapBtn').attr('href', OpenMap_URL);
        //收藏
    $(".store-btn").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = "已收藏";

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        if(!t.hasClass("curr")){
            t.addClass("curr");
        }else{
            type = "del";
            t.removeClass("curr");
            oper = "-1";
            txt = "收藏";
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
            $i.remove();
        });

        t.children('button').html("<em></em><span>"+txt+"</span>");

        $.post("/include/ajax.php?service=member&action=collect&module=car&temp=store-detail&type="+type+"&id="+id);

    });
    // 判断浏览器是否是ie8
     if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.app-con .down .con-box:last-child').css('margin-right','0');
        $('.wx-con .c-box:last-child').css('margin-right','0');
        $('.module-con .box-con:last-child').css('margin-right','0');
        $('.list_left .list_ul li:nth-child(5n)').css('margin-right','0');

    }
    //点击电话
    $(".l_phone2").bind("click", function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = '/login.html';
            return false;
        }
        $(this).hide()
        $('.l_phone3').show()

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
        
        f.addClass('disabled');
        
        $.ajax({
            url: '/include/ajax.php?service=car&action=storeAppoint',
            data: 'storeid=' + eduData.id + '&tel=' + order_phonev,
            type: "POST",
            dataType: "json",
            success: function (data) {    
                $('.order_mask').hide()
                $('.order_success').show()
                f.removeClass('disabled');
            },
            error: function(){    
                alert('网络错误，预约失败，请稍候重试！')
                $('.order_mask').hide()
                f.removeClass('disabled');
            }
        });

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
