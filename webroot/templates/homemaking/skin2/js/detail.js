$(function(){
    $('.appMapBtn').attr('href', OpenMap_URL);
    // 点击收藏
    $('.btn_group .store-btn').click(function(){
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
            return false;
        }

        var t = $(this), type = '';
        if(t.hasClass('curr')){
            t.removeClass('curr');
            t.find('span').text(langData['homemaking'][0][10]);//收藏
            type = 'del';
        }else{
            t.addClass('curr');
            t.find('span').text(langData['homemaking'][8][84]);//已收藏
            type = 'add';
        }
        $.post("/include/ajax.php?service=member&action=collect&module=homemaking&temp=detail&type="+type+"&id="+id);
    });
    //查看电话
    $('.info_ul .call').delegate('a','click',function(){
        var tel = $(this).data('tel');
        $(this).text(tel);
        return false;
        e.stopPropagation();
    })

})
