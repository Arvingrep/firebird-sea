$(function(){

  //APP端取消下拉刷新
  toggleDragRefresh('off');

// 价格初始化
var proPrice_total = (totalPayPrice + totalpointprice) - totalLogistic; //商品总计
var proPrice_pay = 0; //商品应付价格
    proPrice_pay = (totalPayPrice + totalpointprice) > 0 ? (proPrice_total/(totalPayPrice + totalpointprice) * totalPayPrice) : 0; //商品应付价格
    proPrice_pay = keepTwoDecimal(proPrice_pay);
var logistic_pay = 0; //应付运费
    logistic_pay = (totalPayPrice + totalpointprice) > 0 ? totalLogistic/(totalPayPrice + totalpointprice) * totalPayPrice : 0; //应付运费
    logistic_pay = keepTwoDecimal(logistic_pay);
    $(".price.zongjia").attr('data-totalprice',proPrice_pay);
    $("#totalprice").val(proPrice_pay)
    $("#logistic").val(logistic_pay)
    $(".pricetip s").text(logistic_pay)




// 保留两位小数
function keepTwoDecimal(num) {
	var result = parseFloat(num);
	if (isNaN(result)) {
		console.log('传递参数错误，请检查！');
		return false;
	}
	result = Math.round(num * 100) / 100;
	return result;
};

// 商品原来的总价（不抵扣积分）
var totalPrice = $(".zongjia").attr('data-totalprice')
var totalOprice = $(".allPrice").attr('data-oprice');
$('.goodWrap .goodItem').each(function(){
  var singlePrice = $(this).find('.goodPrice strong').attr('data-price');
  currSinglePrice = (singlePrice / totalOprice * totalPrice).toFixed(2);
  console.log(currSinglePrice)
  $(this).find('.goodPrice strong.xdprice').attr('data-price',currSinglePrice).html(echoCurrency('symbol')+currSinglePrice);
})


  //免运费
  $('.free').click(function(){
    var t = $(this);
    if(!t.hasClass('curr')){
      t.addClass('curr');
      var logistic = $('#logistic').val();
      t.attr('data-price',logistic);
      $('#logistic').val('0.00');
    }else{
      t.removeClass('curr');
      var logistic = $('#logistic').val();
      if(logistic == 0){
        var nowLog = t.attr('data-price');
        $('#logistic').val(nowLog);
      }

    }
    calcPrice();
  })
  //实时监听
  $("#totalprice").focus(function(){
      var tval = $(this).val();
      if(tval !=""){
        $('#fakeprice').val(tval)
      }
  })
  $("#logistic").focus(function(){
      var tval = $(this).val();
      if(tval !=""){
        $('#fakelogistic').val(tval)
      }
  })

  //监听运费输入
  $('#logistic').blur(function(){
    var logval = $(this).val();
    var nowLog = $('#fakelogistic').val();
    if(logval > 0 && $('.free').hasClass('curr')){
      $('.free').removeClass('curr')
    }else if(logval == "" || logval == " "){
      $(this).val(nowLog);
    }
    calcPrice();
  })
  //修改商品总价
  $('#totalprice').blur(function(){
    var oldTot = $('#fakeprice').val();
    var tval = $(this).val();
    if(tval == ''){
      $(this).val(oldTot);
    }
    calcgoodPrice(1);
  })

  //修改商品总价将均摊至单件商品价格
  function calcgoodPrice(tr){
    var ssflag = 0;
    var oldTot = $('.zongjia').attr('data-totalprice');
    var nowTot = $('#totalprice').val();
    var difference = Math.abs(oldTot-nowTot);

    if(nowTot*1 > oldTot*1){
      ssflag = 1;
    }
    var afterAllprice = 0;
    if(difference > 0){//总价做了修改
        $('.goodWrap .goodItem').each(function(){
          var xdprice = $(this).find('.xdprice').attr('data-price');
          var xdRadio = (xdprice/oldTot)*difference;
          if(ssflag == 1){
            var afterprice = (xdprice*1 + xdRadio*1).toFixed(2);
          }else{
            var afterprice = (xdprice - xdRadio).toFixed(2);
          }
          $(this).find('.afterprice').val(afterprice);
          $(this).find('.inpBox').addClass('active');
          afterAllprice += afterprice*1;

        })


      if(tr){//从修改商品总价处过来的
        if(afterAllprice > nowTot){//总和 大于修改
          var cha = afterAllprice-nowTot;
          var tprice = $('.goodWrap .goodItem:first-child').find('.afterprice').val() - cha;
          $('.goodWrap .goodItem:first-child').find('.afterprice').val(tprice.toFixed(2));
        }else if(afterAllprice < nowTot){
          var cha = nowTot-afterAllprice;
          var tprice = ($('.goodWrap .goodItem:first-child').find('.afterprice').val())*1 + cha*1;
          $('.goodWrap .goodItem:first-child').find('.afterprice').val(tprice.toFixed(2));
        }
      }
      calcPrice();


    }

  }
  $('.goodWrap').delegate('.afterprice','focus',function(){
    $(this).attr('placeholder','');
    $(this).closest('.inpBox').addClass('active');
  })
  //单独修改某件商品价格
  $('.goodWrap').delegate('.afterprice','blur',function(){
    var tval = $(this).val();
    if(tval == ''){
      $(this).closest('.inpBox').removeClass('active');
      $(this).attr('placeholder','修改商品价格');
    }
    calctotPrice(1);
  })
  //单独修改某件商品价格 -- 改总价
  function calctotPrice(){
    var afterAllprice = 0;
    var countChange = 0;
    var currTotalPrice = $(".zongjia").attr('data-totalprice')
    $('.goodWrap .goodItem').each(function(){
      var afterprice = $(this).find('.afterprice').val()?$(this).find('.afterprice').val():$(this).find('.xdprice').attr('data-price');
      afterAllprice += afterprice*1;

      if($(this).find('.afterprice').val() == ''){
        countChange++;
      }
    })

    $('#totalprice').val(afterAllprice.toFixed(2));
    if(countChange ==  $('.goodWrap .goodItem').length && currTotalPrice < afterAllprice){
       $('#totalprice').val(currTotalPrice.toFixed(2));
    }
    
    calcPrice();
  }


  function calcPrice(){
    var totalprice = $('#totalprice').val();
    var logPrice = $('#logistic').val();
    totalprice = totalprice*1+logPrice*1;
    $('#priceAll').text(totalprice.toFixed(2));
    if(logPrice > 0){
      $('.pricetip em').text('(含运费'+echoCurrency('symbol')+logPrice+')');
    }else{
      $('.pricetip em').text('(免运费)');
    }

  }

  $('.changeBot .sureChange').click(function(){
    var btn = $(this);
    if(btn.hasClass('disabled')) return false;
    var priceArr = [];
    $('.goodWrap .goodItem').each(function(){
      var tid = $(this).attr('data-id');
      var afterprice = $(this).find('.afterprice').val()?$(this).find('.afterprice').val():$(this).find('.xdprice').attr('data-price');
      priceArr.push({'id':tid,'price':afterprice});
    })
    var totalprice = $('#priceAll').text();
    var logistic   = $('#logistic').val();
    var data = 'orderid='+orderid+'&totalprice='+totalprice+'&logistic='+logistic+'&goodpricearr='+JSON.stringify(priceArr);
    console.log(data)
    btn.addClass('disabled');
    $.ajax({
      url: "/include/ajax.php?service=shop&action=changePayprice",
      type: 'get',
      data:data,
      dataType: 'jsonp',
      success: function(data){
          if(data && data.state == 100){
            showErrAlert('修改成功');
            setTimeout(function(){
              $('.header .goBack').click();
            },1000);
          }else{
            showErrAlert(data.info);
          }
          btn.removeClass('disabled');
      },
      error: function(){
        showErrAlert('网络错误，加载失败！')
        btn.removeClass('disabled');
      }

    })

  })


})
