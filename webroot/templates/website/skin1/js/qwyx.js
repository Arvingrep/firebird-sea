$(function(){

  // 幻灯片
  $(".slidebox").slide({titCell:".hd ul",mainCell:".bd .slideobj",effect:"fold",autoPlay:true,autoPage:"<li></li>"});


  // part-1
  $('.part-1 .tab li').hover(function(){
    var t = $(this), index = t.index(), ul = $('.part-1 .content ul');
    t.addClass('on').siblings('li').removeClass('on');
    ul.hide().eq(index).show();
  })


  // part-2
  $('.part-2 li').hover(function(){
    $(this).addClass("hover");
  }, function(){
    $(this).removeClass("hover");
  })

  // 案例
  $('.case-tab li').hover(function(){
    var t = $(this), index = t.index(), box = $('.case .con li');
    t.addClass('on').siblings('li').removeClass('on');
    box.hide().eq(index).show();
  })

  // 服务保障
  $('.ensure_con li').hover(function(){
    var t = $(this);
    t.addClass('curr').siblings('li').removeClass('curr');
  })

  //返回顶部
	$(".btntop").bind("click", function(){
		$('html, body').animate({scrollTop:0}, 300);
	});

})
