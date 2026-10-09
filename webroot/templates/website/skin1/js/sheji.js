$(function(){

  // tab切换
  $('.tab li').hover(function(){
    var t = $(this), index = t.index();
    t.addClass('curr').siblings('li').removeClass('curr');
    $('.content ul').hide().eq(index).show();
  })

  // 我们的案例
  $(".casebox").slide({mainCell:".slide ul",effect:"leftLoop",autoPlay:true,autoPage:true,vis:5});



  //返回顶部
    $(".btntop").bind("click", function(){
        $('html, body').animate({scrollTop:0}, 300);
    });

})
