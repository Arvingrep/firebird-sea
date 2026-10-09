$(function(){

  var device = navigator.userAgent;

  $('.orderbtn').click(function(){

    var t = $(this);
    if (!t.hasClass('on')) {
      if (device.indexOf('huoniao_iOS') > -1) {
    		$('.orderbox').css("top", "calc(.9rem + 20px)");
    	}else {
        $('.orderbox').animate({"top":".9rem"},200);
    	}
      $('.mask').show().animate({"opacity":"1"},200);
      $('body').addClass('fixed');
      t.addClass('on');
    }else {
      $('.orderbox').animate({"top":"-100%"},200);
      $('.mask').hide().animate({"opacity":"0"},200);
      $('body').removeClass('fixed');
      t.removeClass('on');
    }

  })

  $('.mask').click(function(){
    $('body').removeClass('fixed');
    $('.orderbtn').removeClass('on');
    $('.orderbox').animate({"top":"-100%"},200);
    $('.mask').hide().animate({"opacity":"0"},200);
  })


})
