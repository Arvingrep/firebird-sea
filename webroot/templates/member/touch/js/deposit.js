var depositPrice = 0;
var pointNum;
//金额验证
function jsPrice(){
if(type=='deposit'){
  depositPrice = pointNum;
  $("#allPrice").html(depositPrice);
}else{
  depositPrice = (pointNum/pointRatio).toFixed(2);
  $("#allPrice").html(depositPrice);
}

}
$(function(){

  var timer = null;

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
  pointNum =0;
  //选择数量
  $('.mainWrap .mainUl li').off('click').click(function(){
  	slfBox.ds_inp = false;
    if(!$(this).hasClass('active')){ //选中
      $(this).addClass('active').siblings('li').removeClass('active');
      var tnum = $(this).attr('data-id');
      pointNum = tnum;
    }else{
      $(this).removeClass('active');
      pointNum = 0;
    }
    jsPrice();//计算所需金额
    $("#selfNum").val('');

  })

  //自定义数量
  $("#selfNumBox").bind("input", function(){
    var t = $('#selfNum'), val = t.val();
    if(val > 0){
      $('.mainWrap li').removeClass('active');
      pointNum = val;
      jsPrice();
    }else{
      if($('.mainWrap li.active').length == 0){
        pointNum = 0;
        jsPrice();
      }
    }

  })


  //充值、礼品卡切换
  $('.depTab li').click(function(){
    var tindex = $(this).index();
    $(this).addClass('curr').siblings().removeClass('curr');
    $('.mainWrap .depositCon').eq(tindex).addClass('deshow').siblings().removeClass('deshow');
    $('.mainWrap .depositCon,.depositConbot').addClass('deRightFadein');
    $('.mainWrap .mainUl li span').removeClass('curr')
    if(tindex == 0){
      $('.depositConbot').addClass('show');
    }else{
      $('.depositConbot').removeClass('show');
    }
  })

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

  //确定礼品卡
  $('.depositCon .giftSure a').click(function(){
    if ($(this).hasClass('disabled')) {
      return false;
    }
    var code = $(".giftpassword").val()
    if(code ==''){
      alert("请填写充值卡密");
    }
        $.ajax({
          type: 'POST',
          async: false,
          url: '/include/ajax.php?service=member&action=useCoupon&code='+code,
          dataType: 'json',
          success: function(data){
            if(data.state == 100 ){
              alert("消费成功！")
              location.reload();
            }else{
              alert(data.info);
            }
          },
          error: function(){
            alert("网络错误");
          }
        });
  })
  //同意协议
  $('.depositTip').click(function(){
      let className=$(this).attr('class');
      if(className.includes('agree')){
        $(this).removeClass('agree');
        $('.publicpaybtn').removeClass('agree');
      }else{
        $(this).addClass('agree');
        $('.publicpaybtn').addClass('agree');
      }
  })
  // 选择支付方式
  var tjtime = Date.parse(new Date());
  $('.publicpaybtn').click(function(){
    $("#balance").remove();
    $(".payListBox ul li").eq(0).addClass('paychosed').siblings('li').removeClass('paychosed');  //默认第一个选中
    var t = $(this);
    if(t.hasClass('disabled')){
        return false;
    }

    //如果一秒内点击两次，则不触发
    var nowtime = Date.parse(new Date());
    if(nowtime - tjtime < 1000){
        return false;
    }
    tjtime = nowtime;

    if (!$('.depositTip').attr('class').includes('agree')) {
      $('.payBeforeLoading').hide();
      slfBox.ds_inp = false;
      showMsg('请同意《'+(ordertype == 'deposit' ? '充值服务协议' : pointName+'充值协议')+'》');
      return false;
    }else if(depositPrice == 0){
      showMsg(langData['siteConfig'][54][123]);//请输入充值数量！
    }else{
      t.addClass('disabled');
      $('#balance').remove();
      $('#monBonus').remove();

      $('.payListBox li:eq(0)').addClass('paychosed');

      $.ajax({
        type: 'POST',
        url: '/include/ajax.php?service=member&action='+ordertype+'&amount='+depositPrice,
        dataType: 'json',
        success: function(str){

          t.removeClass('disabled');

          info = str.info;
          if(str.state == 100 && str.info != ""){

            payCutDown('',info.timeout, info);
            $("#amout").text(info.order_amount);
            $('.payMask').show();
            $('.payPop').css('transform','translateY(0)');

            if(usermoney*1 < info.order_amount *1){

            $("#moneyinfo").text('余额不足，');
            }

            ordernum     = info.ordernum;
            order_amount = info.order_amount;


          }
        }
      });
      // $('#submit').click();

        // if(device.indexOf('huoniao') > -1) {
        //     setupWebViewJavascriptBridge(function (bridge) {
        //         bridge.callHandler('pageClose', {}, function (responseData) {
        //         });
        //     });
        // }

      //验证是否支付成功，如果成功跳转到指定页面
      // if(timer != null){
      //   clearInterval(timer);
      // }
      // timer = setInterval(function(){
    //
      //   $.ajax({
      //     type: 'POST',
      //     async: false,
      //     url: '/include/ajax.php?service=member&action=tradePayResult&type=2',
      //     dataType: 'json',
      //     success: function(str){
      //       if(str.state == 100 && str.info != ""){
      //         //如果已经支付成功，则跳转到指定页面
      //         location.href = str.info;
      //       }
      //     }
      //   });
    //
      // }, 2000);

      return;

      //如果不在客户端中访问，根据设备类型删除不支持的支付方式
      if(appInfo.device == ""){
          // 赏
          if(navigator.userAgent.toLowerCase().match(/micromessenger/)) {
              $("#alipay, #globalalipay").remove();

              //小程序
              if (wx_miniprogram) {
                  $("#paypal").remove();
              }
          }

      }else{
          $("#payform").append('<input type="hidden" name="app" value="1" />');
      }
      $(".paybox li").removeClass("on");
      $(".paybox li:eq(0)").addClass("on");
      $("#paytype").val($(".paybox li:eq(0)").data("type"));

        //小程序
        if(navigator.userAgent.toLowerCase().match(/micromessenger/) && wx_miniprogram){
            $(".paybtn").click();
        }else{
            $('.bg').show().animate({"opacity":"1"},200);
            $('.paybox').addClass('show').animate({"bottom":"0"},300);
        }

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

  setTimeout(function(){

    if(device.indexOf('huoniao') > -1) {
      setupWebViewJavascriptBridge(function (bridge) {
        bridge.callHandler('pageClose', {}, function (responseData) {
        });
      });
    }

  }, 3000);

  });


})

// 错误提示
function showMsg(str){
  var o = $(".error");
  o.html('<p>'+str+'</p>').show();
  setTimeout(function(){o.hide()},1000);
}
