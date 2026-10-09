$(function(){

  // 线上线下协同
  $('.slidebox').slide({titCell:".hd ul",mainCell:".slideobj ul",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>"})

  // 精细化经营
  $('.slidebox1').slide({mainCell:".slide ul",effect:"left",autoPage:"<li></li>",vis:3})



  //返回顶部
    $(".btntop").bind("click", function(){
        $('html, body').animate({scrollTop:0}, 300);
    });
})
