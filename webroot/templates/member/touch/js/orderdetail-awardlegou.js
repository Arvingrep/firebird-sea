$(function(){

  var timer2 = null, now = new Date();;
  //判断倒计时类型
  var djstype = $('#djstype').val();

  if(djstype != ''){
    
    var intDiff = 0,addDate = 0;
    if(djstype == 1){//自动同意退款
      addDate = DateAdd("d",customautotuikuan,new Date(retDate*1000));
    }else if(djstype == 2){//自动同意退货
      addDate = DateAdd("d",customautotuihuo,new Date(retDate*1000));
    }else if(djstype == 3){//自动确认收货
      addDate = DateAdd("d",confirmDay,new Date(expDate*1000));
    }else if(djstype == 4){//自动关闭退货申请
      addDate = DateAdd("d",customofftuikuan,new Date(tongyidate*1000));
    }else if(djstype == 5){//活动截止时间
      addDate = DateAdd("h",hdday*1,new Date(startDate*1000));
    }

    if(addDate.getTime() > now){
      var datedjs = addDate.getTime() - now;
      intDiff = parseInt(datedjs/1000);    //倒计时总秒数量
      timerPay(intDiff);
    }
  }
  //商家处理倒计时

  function timerPay(intDiff) {
      timer2 = setInterval(function () {
          var day = 0,
          hour = 0,
          minute = 0,
          second = 0;//时间默认值
          if (intDiff > 0) {
              //计算相关的天，小时，还有分钟，以及秒
              day = Math.floor(intDiff / (60 * 60 * 24));
              hour = Math.floor(intDiff / (60 * 60)) - (day * 24);
              minute = Math.floor(intDiff / 60) - (day * 24 * 60) - (hour * 60);
              second = Math.floor(intDiff) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
          }
          if (minute <= 9) minute = '0' + minute;
          if (second <= 9) second = '0' + second;
          if(day > 0){
            $('#day_show').html(day);
          }else{
            $('#day_show,.dayhide').hide();
          }
          
          $('#hour_show').html('<s id="h"></s>' + hour);
          $('#minute_show').html('<s></s>' + minute);
          $('#second_show').html('<s></s>' + second);
          intDiff--;
          if($('#minute_show').text() =='00' && $('#second_show').text() =='00'){
             clearInterval(timer2);
          }
       }, 1000);

  }
  //活动 时间
  function DateAdd(stype,number, date) {
      switch (stype) {
          case "d": {
              date.setDate(date.getDate() + number);
              return date;
              break;
          }
          case "h": {
              date.setHours(date.getHours() + number);
              return date;
              break;
          }
          default: {
              date.setDate(date.getDate() + number);
              return date;
              break;
          }
      }        
  } 


	//导航
  $('.header-r .screen').click(function(){
    var nav = $('.nav'), t = $('.nav').css('display') == "none";
    if (t) {nav.show();}else{nav.hide();}
  });

  $('.sureShou').click(function(){
  	$.ajax({
  		url: '/include/ajax.php?service=awardlegou&action=receipt&id='+id,
  		type: 'post',
  		dataType: 'json',
  		success: function(data){
  			if(data && data.state == 100){
  				alert(langData['siteConfig'][40][93]);//操作成功
  				location.reload();
  			}else{
  				alert(langData['siteConfig'][20][295]);//操作失败！
  			}
  		},
  		error: function(){
  			alert(langData['siteConfig'][31][135]);//网络错误，操作失败！
  		}
  	})
  });
  
  
  // 拆红包
  $(".chai").click(function(){
	  $('.hb_mask,.hb_pop').show()
  });
  
  $(".hb_mask,.hb_pop .hb_close").click(function(){
  	  $('.hb_mask,.hb_pop').hide()
  });

  /*获取红包*/
  $(".get_hb").click(function(){
	  $.ajax({
		  url: '/include/ajax.php?service=awardlegou&action=getHongbao&id='+id,
		  type: 'post',
		  dataType: 'json',
		  success: function(data){
			  if(data && data.state == 100){
				  alert(data.info);//操作成功
				  location.reload();
			  }else{
				  alert(data.info);
				  window.location.href = shCertify;
			  }
		  },
		  error: function(){
			  alert(langData['siteConfig'][31][135]);//网络错误，操作失败！
		  }
	  })
  })

})
