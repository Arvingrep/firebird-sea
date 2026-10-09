$(function(){

  new Swiper('.tab_li.show .swiper-container', {
      slidesPerView: 'auto',
  });

  $('.grade li').click(function(){
    var t = $(this), index = t.index();
    t.addClass('active').siblings('li').removeClass('active');
    $('.price .tab_li').removeClass('show').eq(index).addClass('show');
    $('.price .tab_li.show .li_box').eq(1).click();
	$('.special_box .right_box').removeClass('show').eq(index).addClass('show');
	  new Swiper('.tab_li.show .swiper-container', {
	      slidesPerView: 'auto',
	  });
  });

  $(".tab_box .li_box").click(function(){
	  var t =$(this);
	  $(".tab_box .li_box").removeClass("chosed")
	  t.toggleClass('chosed');
  });

  if(nlevel>0){
  	  $(".grade li[data-type='"+nlevel+"']").click()
      let ind = $(".grade li[data-type='"+nlevel+"']").index();
      let oleft =  $(".grade li[data-type='"+nlevel+"']").offset().left
      $(".grade ul").scrollLeft(oleft)
  	  $(".tab_box .tab_li[data-type='"+nlevel+"'] .li_box").eq(1).click();
  }else{
	  $(".tab_box .tab_li:eq(0)").find(".li_box").eq(1).click();
  }

  // 同意条款
  $('.agree_box i').click(function(){
    $(this).toggleClass('agreed')
  })

  $(".publicpaybtn").off('click').bind("click", function(){
	  var t = $(this);
	  var paytype ='';
	  var amount = 0;
	  var daytype ='month';
	  var level ='1';
	  var day = 1;

      if(!$('.agree_box i').attr('class').includes('agreed')){
        $(".payBeforeLoading").hide();
        showErrAlert('请勾选我已阅读并同意《会员服务协议》');
        return false
      }
    
      if(t.hasClass('disabled')){
        return false;
      }
      t.addClass('disabled');

	  if($(".tab_box .li_box.chosed").size()==0){
		  alert('请选择会员种类');
		  return false;
	  }else{
		  var chosed = $(".tab_box .li_box.chosed");
		  level = chosed.parents('.tab_li').attr('data-type');
		  day = chosed.attr('data-time');
		  amount = chosed.attr('data-count');
	  }

	 $.ajax({
	     url: '/include/ajax.php?service=member&action=upgrade&check=1',
	     data: {
	        amount  : amount,
			level   : level,
			day     : day,
			daytype : daytype,
			paytype : paytype
	     },
	     type: 'post',
	     dataType: 'json',
	     success: function(data){

            t.removeClass('disabled');

	 		if(data && data.state == 100){

                info = data.info;

                ordernum     = info.ordernum;
                order_amount = info.order_amount;

                $("#plevel").val(level);
                $("#pday").val(day);
                $("#pdaytype").val(daytype);
                
                payCutDown('',info.timeout,info);
                $("#amout").text(info.order_amount);
                $('.payMask').show();
                $('.payPop').css('transform','translateY(0)');

                // if(usermoney*1 < info.order_amount *1){
                //
                // 	$("#moneyinfo").text('余额不足，');
                // }
                if (usermoney * 1 < info.order_amount * 1) {

                    $("#moneyinfo").text('余额不足，');
                    $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

                    $('#balance').hide();
                }


                if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                    $("#bonusinfo").text('额度不足，');
                    $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                }else if( bonus * 1 < info.order_amount * 1){
                    $("#bonusinfo").text('余额不足，');
                    $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                }else{
                    $("#bonusinfo").text('');
                    $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                }
                t.removeClass('disabled')

			}else{
				$(".payBeforeLoading").hide();
				
				if(data.info.indexOf('超时') > -1){
					location.href = location.href + (location.href.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1'
				}else{
					alert(data.info);
					setTimeout(function(){
						t.removeClass('disabled')
					},1500)
					return false;
				}

			}
	 	 },
	 	error: function(){

	 	}
	 });
  });



})
