$(function(){
    // 点击收藏
    $('.follow-wrapper').click(function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
            return false;
        }

        var t = $(this), type = '';
        if(t.find('.follow-icon').hasClass('active')){
            t.find('.follow-icon').removeClass('active');
            t.find('.text-follow').text(langData['education'][0][2]);//收藏
            type = 'del';
        }else{
            t.find('.follow-icon').addClass('active');
            t.find('.text-follow').text(langData['education'][4][6]);//已收藏
            type = 'add';
        }
        $.post("/include/ajax.php?service=member&action=collect&module=education&temp=class-detail&type="+type+"&id="+pageData.id);
    });


})