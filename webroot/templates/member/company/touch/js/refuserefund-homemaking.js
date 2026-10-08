


$(function () {


    //提交
    $('.cancel_submit a').click(function(){
        if($(this).hasClass('disabled')) return;
        var refusenote =$('#refuse_tip').val();
        if(refusenote ==""){
            showMsg('请填写拒绝退款原因');
            return false;
        }
        $.ajax({
            url: '/include/ajax.php?service='+module+'&action=refundPay&id='+id+'&proid='+proid+'&type=3'+'&status=2'+'&explain='+refusenote,
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    setTimeout(function(){location.href = refunddetailUrl;},200)
                 t.removeClass("disabled").html(langData['siteConfig'][11][19]);
                }else{
                    showMsg(data.info);
                     t.removeClass("disabled").html(langData['siteConfig'][11][19]);
                }
            },
            error: function(){
                showMsg(langData['siteConfig'][6][203]);
                t.removeClass("disabled").html(langData['siteConfig'][11][19]);
            }
        });

    })


    



});
 // 错误提示
function showMsg(str){
    var o = $(".error");
    o.html(str).css('display','block');
    setTimeout(function(){o.css('display','none')},1000);
}
