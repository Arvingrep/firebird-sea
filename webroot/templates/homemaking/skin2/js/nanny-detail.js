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
        $.post("/include/ajax.php?service=member&action=collect&module=homemaking&temp=nanny-detail&type="+type+"&id="+id);
    });
    //查看电话
    $('.right_con .see_phone').delegate('a','click',function(){
        var tel = $(this).data('tel');
        $(this).text(tel);
        return false;
        e.stopPropagation();
    })
    var r=$('.command').offset().top; 
    var p1 = $(".command").height();
    var tp1=r + p1;
    var h=$(window).height();
        //滚动监听
    $(window).scroll(function() {
        var scroH = $(this).scrollTop();
        var thh =scroH + h;

        if(scroH > 246){ //246为$('.right_con').offset().top 写成固定值 因为这个值是变动的
        
            $('.right_con').addClass('fixed').removeClass('sticky')
        }else{

               $('.right_con').removeClass('fixed') 
               $('.right_con').removeClass('sticky') 
            
        }
        if(tp1 > scroH && r <thh){
            $('.right_con').removeClass('fixed').addClass('sticky');
        }

        
    });

})
