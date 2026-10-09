var objId = $("#list"), isload = true;
$(function(){

  var device = navigator.userAgent;

  // 选择模块
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
      hideMask();
    }
  })

  $('.mask').click(function(){
    hideMask();
  })

  // 隐藏下拉框跟遮罩层
  function hideMask(){
    $('body').removeClass('fixed');
    $('.orderbtn').removeClass('on');
    $('.orderbox').animate({"top":"-100%"},200);
    $('.mask').hide().animate({"opacity":"0"},200);
  }



	//状态切换
	$(".tab ul li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("sel")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
      objId.html('');
			getList();
		}
	});

})
