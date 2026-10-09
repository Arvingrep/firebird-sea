$(function(){

  // 典型案例
  $('.slidebox').slide({mainCell:".slide ul",effect:"left",autoPage:"<li></li>", vis:4})


  //返回顶部
    $(".btntop").bind("click", function(){
        $('html, body').animate({scrollTop:0}, 300);
    });

})
