$(function(){

    //联系方式弹出
    $('.org_footer').delegate('.contact', 'click', function(){
        $('.contact_mask').show();

    })
    //联系方式关闭
    $('.contact_mask').delegate('.know', 'click', function(){
        $('.contact_mask').hide();

    })
})
