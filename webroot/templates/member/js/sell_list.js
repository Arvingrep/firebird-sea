/**
 * Created by Administrator on 2018/5/18.
 */
$(function(){
    // 判断浏览器是否是ie8
     if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.app-con .down .con-box:last-child').css('margin-right','0');
        $('.wx-con .c-box:last-child').css('margin-right','0');
        $('.module-con .box-con:last-child').css('margin-right','0');


    }

    //数字滚动
    $('.value').leoTextAnimate({fixed:[',',':','.'],start:'0'});


    //鼠标经过头部链接显示浮动菜单
    $(".nav-con ul li").hover(function(){
        var t = $(this);       
        t.addClass("active");
    }, function(){
        var t = $(this);
        t.removeClass("active");
    });
    $('.type .input_div').on("click", function (e) { 
        console.log(111)
        var par = $(this).parent('.type')
        if(par.hasClass('active')){
            par.removeClass('active')
            // $('.aside').stop(true,false).slideUp();
            $('.aside').hide();
        }else{
           par.addClass('active')
            // $('.aside').stop(true,false).slideDown();
            $('.aside').show();
        }
        
    })

    // 侧边栏点击字幕条状
    var navBar = $(".navbar li");
    navBar.on("click", function (e) {        
        $(this).addClass("active").siblings().removeClass('active');
            var id = $(this).find('a').attr('data-id');
            var mao = $('#' + id)
            var scrollTop = $('.aside .aside-main').scrollTop()
            var off = mao.position().top + scrollTop;//position() 方法返回匹配元素相对于父元素的位置（偏移）。
            $('.aside .aside-main').stop(true).animate({scrollTop: off+'px'}, 500)

    });
    $('.aside .aside-main').delegate('li','click',function(){
        var txt=$(this).text(),id = $(this).attr('data-id');
        $('#type').val(txt);
        $('#brand').val(id);
        $('.aside').hide();
        $('.type').removeClass('active')
    })
    //预约提交
    $(".right_con .submit .sell_car").bind("click", function(){
        var f = $(this);
        var str = '',r = true;
        var form = $("#fabuForm"), action = form.attr("action");
        data = form.serialize();
        if(f.hasClass("disabled")) return false;        
        // 选择车型
        var type = $('#type');
        var typev = $.trim(type.val());//trim()删除字符串开始和末尾的空格
        if(typev == '') {
            if (r) {
                type.focus();
                errmsg(type, langData['car'][5][26]);   //请选择车型
            }
            r = false;
        }

        // 手机号
        var phone = $('#phone')
        var phonev = $.trim(phone.val());
        if(phonev == '') {
            if (r) {
                phone.focus();
                errmsg(phone, langData['car'][8][15]);//请输入手机号码
            }
            r = false;
        } else {
            // var telReg = !!phonev.match(/^(13|14|15|17|18)[0-9]{9}$/);
            // if(!telReg){
            // if (r) {
            //     phone.focus();
            //     errmsg(phone,langData['car'][8][16]);//请输入正确手机号码
            // }
            // r = false;
            // }
        }

        if(!r) {
            return false;
        }       
        $.ajax({
            url: action,
            data: data,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    $('.order_success').show()
                }else{
                    alert(data.info);
                }
            },
            error: function(){
                alert(langData['siteConfig'][20][183])
            }
        });

    });

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
