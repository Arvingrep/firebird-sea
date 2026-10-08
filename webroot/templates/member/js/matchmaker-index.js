$(function(){
	// 判断浏览器是否是ie8
    if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.app-con .down .con-box:last-child').css('margin-right','0');
        $('.wx-con .c-box:last-child').css('margin-right','0');
        $('.footer .foot-bottom .wechat .wechat-pub:last-child').css('margin-right','0');
        $('.high-member .high-box .high-list:nth-child(3n)').css('margin-right','0');
        $('.buy-strings-popup .month ul li:nth-child(3n)').css('margin-right','0');
        $('.high-member .high-box .high-list:nth-child(3n)').css('margin-right','0');

    }
    
    $('.use-money .select-btn').click(function(){
        $(this).toggleClass('active');
    })
    //购买红娘牵线
    $('.buy-strings-popup .month ul li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
    })
    //牵线弹窗（未购买）
    $('.high-list .high-info .strings').click(function(){
        $('.desk').show();
        $('.buy-strings-popup').fadeIn(600);
    })
    $('#close').click(function(){
        $('.desk').hide();
        $('.buy-strings-popup').fadeOut(600);
    }) 
    
    // 牵线弹窗(已购买)
    // $('.high-list .high-info .strings').click(function(){
    //     $('.desk').show();
    //     $('.pull-strings-popup').fadeIn(600);
    // })
    // $('#close').click(function(){
    //     $('.desk').hide();
    //     $('.pull-strings-popup').fadeOut(600);
    // })
    
    // 购买牵线红娘导航条
    $(".buy-strings-popup .buy-strings-title ul li").click(function(){
        $(this).addClass("active").siblings().removeClass("active");
        var i=$(this).index();
        $(this).closest('.buy-strings-popup').find('.buy-box').eq(i).addClass("show").siblings().removeClass("show");
    });

    //关闭购买红娘牵线弹窗
    $('#buy-strings').click(function(){
        $('.buy-strings-popup').hide();
        $('.desk').hide();
    })

	// 红娘简介导航条
    $(".maker-brief .brief-title ul li").click(function(){
        $(this).addClass("active").siblings().removeClass("active");
        var i=$(this).index();
        $(this).closest('.maker-brief').find('.brief-text').eq(i).addClass("show").siblings().removeClass("show");
    });

    // 牵线弹窗-联系方式表单验证
    var hasLoadGt = false;
    var getYzmBtn = null;
    var getYzmType = '';

    $("#leave-tel").submit(function(e){
    e.preventDefault();
    var f = $(this),
        phone = f.find("#phone-num"),
        vcode = f.find("#number"),
        nickname = f.find('.nickname'),
        r = true;

    if(nickname.val() == ""){
        r=false;
        nickname.focus();
        $('.error p').text(langData['siteConfig'][20][533]).show();  //请输入您的姓名
    }else if(phone.val() == ""){
        r = false;
        phone.focus();
        $('.error p').text(langData['siteConfig'][29][150]).show();  //请输入您的电话号码
    }
    if(!r) return;
    })
    $(document).on('click','.sendvdimgck',function(){
        var a = $(this);
        getYzmBtn = a;
        if(!returnCheckPhone(a)) return;
        returnDJS(getYzmBtn, 60); 
    });
   

    // 用户名验证
    function returnCheckPhone(o){
        var t = o, form = $('#sub-apply'), oaccount = form.closest('#leave-tel').find('#phone-num'), account = $.trim(oaccount.val());
        var r = true;
        if(account == '') {
          r = false;
          $('.error p').text(langData['siteConfig'][29][150]).show();//请输入您的电话号码
          oaccount.focus();
        } else {
          var reg , h = '';
          reg = !!account.match(/^1[34578](\d){9}$/);
          if(!reg){
            $('.error p').text(langData['siteConfig'][29][151]).show();  //请输入您的电话号码
            oaccount.focus();
            r = false;
          }else{
            oaccount.attr('placeholder','');
          }
        }
        return r;
      }
    //倒计时
    var ct;
    function returnDJS(obj,time) {
        obj.attr('disabled',true);
        obj.css('background','#eee');
        ct = setInterval(function() {
          obj.text(--time + 's');
          if(time <= 0) {
            clearInterval(ct);
            obj.text(langData['siteConfig'][4][1]).removeClass('loading');   //获取验证码
            obj.attr('disabled',false);
            obj.css('background','##ff295b');
          }
        },1000)
    }

	

})
 