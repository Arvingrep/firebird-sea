$(function () {
    $('.header .searchbox .searchkey').bind('focus',function () {
        $(this).closest('.searchbox').addClass('focus');
    });
    $('.header .searchbox').hover(function () {
        $(this).addClass('curr');
    },function () {
        $(this).removeClass('curr');
    });

    $('.header .searchbox .searchkey').bind('blur',function () {
        $(this).closest('.searchbox').removeClass('focus');
    });
    // 鼠标经过下拉排序框
    $('.header .nav .state').hover(function(){
        $('.header .nav .state .ModuleBox').show();
    },function(){
        $('.header .nav .state .ModuleBox').hide();
    });
    //鼠标点击下拉列表项
    $('.header .nav  .state a').click(function(){
        
        $('.header .nav  .state .ModuleBox').hide();
    });
    $('.searchbox form').submit(function(e){
        var val = $.trim($('.searchkey').val());
        if(val == ''){
            e.preventDefault();
        }
    });

    $('.isearch').bind('click', function () {
        $(this).closest('form').submit();
    })

    //分类名最多六个字
    $('.ModuleBox a').each(function(index, el) {
   
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });


    //预约提交
    $(".order_mask .order_submit").bind("click", function(e){
        e.preventDefault();
        var t = $("#fabuForm"), action = t.attr('action');
        var f = $(this);
        var str = '',r = true;
        if(f.hasClass("disabled")) return false;        

        // 称呼
        var username = $('#username');
        var usernamev = $.trim(username.val());
        if(usernamev == '') {
            if (r) {
                username.focus();
                errmsg(username, langData['education'][9][14]);   //请填写您的称呼
            }
            r = false;
        }
        // 手机号
        var tel = $('#tel')
        var telv = $.trim(tel.val());
        if(telv == '') {
            if (r) {
                tel.focus();
                errmsg(tel, langData['education'][9][15]);//请填写您的联系方式
            }
            r = false;
        } else {
            // var telReg = !!telv.match(/^(13|14|15|17|18)[0-9]{9}$/);
            // if(!telReg){
            // if (r) {
            //     tel.focus();
            //     errmsg(tel,langData['education'][9][16]);//请输入正确手机号码
            // }
            // r = false;
            // }
        }

        if(!r) {
            return false;
        }       
        $.ajax({
            url: action,
            data: t.serialize(),
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    
                    $('.order_mask').hide();
                    $('.tutor_success').show();
                }else{
                  alert(data.info);
                }
            },
            error: function(){
              alert(langData['education'][5][33]);//提交审核
            }
        });

    });
    //关闭预约弹窗
    $(".order_mask .close_alert").bind("click", function(){
        $('.order_mask').hide();
    })

    //家教详情关闭预约成功弹窗
    $(".tutor_success .close_alert").bind("click", function(){
        $('.tutor_success').hide();
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

    //举报
    var complain = null;
    $(".report").bind("click", function(){

        var domainUrl = channelDomain.replace(masterDomain, "").indexOf("http") > -1 ? channelDomain : masterDomain;
        complain = $.dialog({
            fixed: true,
            title: "直播举报",
            content: 'url:'+domainUrl+'/complain-live-detail-'+id+'.html',
            width: 500,
            height: 300
        });
    });




});
