$(function(){

  var depositPrice = 0;
  var timer = null;

  $("#paytype").val($('.paybox li:eq(0)').data("type"));
  $('.paybox li').click(function(){
    var t = $(this), type = t.data('type');
    if(t.hasClass('on')) return;
    t.addClass('on').siblings('li').removeClass('on');
    $("#paytype").val(type);
  })


	// 遮罩层
	$('.bg').on('click',function(){
    $('.bg').hide().animate({"opacity":"0"},200);
    $('.paybox').animate({"bottom":"-100%"},300)
    setTimeout(function(){
      $('.paybox').removeClass('show');
    }, 300);
		$('body').unbind('touchmove')
	})


  // 选择支付方式
  $('#tj').click(function(){
    var t = $('#price'),val = t.val();
    var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
    var re = new RegExp(regu);
    if (!re.test(val)) {
      showMsg(langData['siteConfig'][20][202]);
      t.focus();
      depositPrice = 0;
    }else{
      depositPrice = val;

      //如果不在客户端中访问，根据设备类型删除不支持的支付方式
      if(appInfo.device == ""){
          // 赏
          if(navigator.userAgent.toLowerCase().match(/micromessenger/)){
              $("#alipay, #globalalipay").remove();
          }
      }else{
          $("#payform").append('<input type="hidden" name="app" value="1" />');
      }
      $(".paybox li:eq(0)").addClass("on");

      $('.bg').show().animate({"opacity":"1"},200);
      $('.paybox').addClass('show').animate({"bottom":"0"},300);
    }
  })

  //提交支付
  $(".paybtn").bind("click", function(event){
    var t = $(this);

    if($("#paytype").val() == ""){
      alert(langData['siteConfig'][20][203]);
      return false;
    }
    if(depositPrice == 0){
      alert(langData['siteConfig'][20][64]);
      $('.bg').click();
      $("#price").focus();
      return false;
    }


    $('#amount').val(depositPrice);

    $("#payform").submit();

    //验证是否支付成功，如果成功跳转到指定页面
    if(timer != null){
      clearInterval(timer);
    }
    timer = setInterval(function(){

      $.ajax({
        type: 'POST',
        async: false,
        url: '/include/ajax.php?service=member&action=tradePayResult&type=2',
        dataType: 'json',
        success: function(str){
          if(str.state == 100 && str.info != ""){
            //如果已经支付成功，则跳转到指定页面
            location.href = str.info;
          }
        }
      });

    }, 2000);

  });


})

// 错误提示
function showMsg(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
