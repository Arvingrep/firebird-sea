//充值消费金 2021-12-13
$(function(){


  //输入密码
  $(".giftpassword").bind("input", function(){
    var t = $(this), val = t.val();
    if(val != ""){
      $('.giftBox s').show();
      $('.depositCon .giftSure a').removeClass('disabled');
    }else{
      $('.giftBox s').hide();
      $('.depositCon .giftSure a').addClass('disabled');
    }

  })
  $('.giftBox s').click(function(){
    $(".giftpassword").val('');
    $(".giftpassword").focus();
    $(this).hide();
    $('.depositCon .giftSure a').addClass('disabled');
  })
  //同意协议
  $('.depositTip').click(function () {
    $(this).toggleClass('agree');
  })
  //确定礼品卡
  $('.depositCon .giftSure a').click(function(){
    if ($(this).hasClass('disabled')) {
      return false;
    }else if(!$('.depositTip').hasClass('agree')){
      showErrAlert("请同意《充值协议》");
      return false;
    }
    var code = $(".giftpassword").val()
    if(code ==''){
      showErrAlert("请填写充值卡密");
    }
        $.ajax({
          type: 'POST',
          async: false,
          url: '/include/ajax.php?service=member&action=useCoupon&code='+code,
          dataType: 'json',
          success: function(data){
            if(data.state == 100 ){
              showErrAlert("充值成功！")
              setTimeout(function(){
                location.reload();
              }, 500);
            }else{
              showErrAlert(data.info);
            }
          },
          error: function(){
            showErrAlert("网络错误");
          }
        });
  })


})

// 错误提示
function showMsg(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
