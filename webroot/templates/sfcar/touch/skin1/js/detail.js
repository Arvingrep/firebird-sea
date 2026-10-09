$(function(){

    // 点击收藏
    $('.foot_bottom .scBox').click(function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
            return false;
        }

        var t = $(this), type = '';
        if(t.hasClass('active')){
            t.removeClass('active');
            t.find('.text-follow').text(langData['siteConfig'][19][240]);//收藏
            type = 'del';
        }else{
            t.addClass('active');
            t.find('.text-follow').text(langData['siteConfig'][44][0]);//已收藏
            type = 'add';
        }
        $.post("/include/ajax.php?service=member&action=collect&module=sfcar&temp=detail&type="+type+"&id="+detailId);
    });
    //关闭头部发布
    $('.fabu-top .close').click(function(){
        $('.fabu-top').hide();
        $('.container').css('paddingTop','.2rem')
    })

    //查看大图
    $.fn.bigImage({
        artMainCon:".note ",  //图片所在的列表标签
        show_Con: '.imgList',
    });
    
    //举报按钮
    var JuMask = $('.JuMask'),
        JubaoBox = $('.jubao');
    $('.jubao_btn span').click(function() {
        JubaoConfig.id = plid;
        JuMask.addClass('show');
        JubaoBox.addClass('show');
        $('html').addClass('noscroll');
    });

    //关闭举报窗口
    $('.jubao .close_btn,.JuMask').click(function() {
        JubaoBox.removeClass('show');
        JuMask.removeClass('show');
        JubaoBox.find('input').val('');
        JubaoBox.find('textarea').val('');
        $('.chosebox').removeClass('show');
        $('html').removeClass('noscroll');
    });

    //举报类型选择
    $('.jubap_type').click(function(e) {
        $('.chosebox').addClass('show');
        $(document).one('click', function() {
            $('.chosebox').removeClass('show');
        });
        e.stopPropagation();
    });
    $('.chose_ul li').click(function() {
        var txt = $(this).text();
        $('.chosebox').removeClass('show');
        $('.jubap_type input').val(txt);
        return false;
    });

    //计算输入的字数
    $(".jubao_content ").bind('input propertychange', 'textarea', function() {
        var length = 100;
        var content_len = $(".jubao_content textarea").val().length;
        var in_len = length - content_len;
        if (content_len >= 100) {
            $(".jubao_content textarea").val($(".jubao_content textarea").val().substring(0, 100));
        }
        $('.jubao_content dt em').text($(".jubao_content textarea").val().length);

    });

    // 错误提示
    function showErr(str){
      var o = $(".error");
      o.html(str).css('display','block');
      setTimeout(function(){
        o.css('display','none')
      },1000);
    }
    // 举报提交
    
    $('.content_box .sub').click(function() {

        var t = $(this);
        if (t.hasClass('disabled')) return;
        if ($('.jubap_type input').val() == '') {
            showErr(langData['siteConfig'][24][2]); //请选择举报类型
        } else if ($('.contact input').val() == "") {
            showErr(langData['siteConfig'][20][459]); //请填写您的联系方式
        } else {

            var type = $('.jubap_type input').val();
            var desc = $('.jubao_content .con textarea').val();
            var phone = $('.contact input').val();

            if (JubaoConfig.module == "" || JubaoConfig.action == "" || JubaoConfig.id == 0) {
                showErr('Error!');
                setTimeout(function() {
                    JubaoBox.removeClass('show');
                    JuMask.removeClass('show');
                    $('html').removeClass('noscroll');
                }, 1000);
                return false;
            }

            t.addClass('disabled').html(langData['siteConfig'][26][153]);   /* 正在提交*/

            $.ajax({
                url: "/include/ajax.php",
                data: "service=member&template=complain&module=" + JubaoConfig.module + "&dopost=" + JubaoConfig.action +
                    "&aid=" + JubaoConfig.id + "&type=" + encodeURIComponent(type) + "&desc=" + encodeURIComponent(desc) +
                    "&phone=" + encodeURIComponent(phone),
                type: "GET",
                dataType: "jsonp",
                success: function(data) {
                    t.removeClass('disabled').html(langData['siteConfig'][6][151]); //提交
                    if (data && data.state == 100) {
                        showErr(langData['siteConfig'][21][242]); //举报成功！
                        setTimeout(function() {
                            JubaoBox.removeClass('show');
                            JuMask.removeClass('show');
                            $('html').removeClass('noscroll');
                        }, 1500);

                    } else {
                        showErr(data.info);
                    }
                },
                error: function() {
                    t.removeClass('disabled').html(langData['siteConfig'][6][151]); //提交
                    showErr(langData['siteConfig'][20][183]); //网络错误，请稍候重试！
                }
            });

        }
    });

})