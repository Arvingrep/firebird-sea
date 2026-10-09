$(function(){

  // 建站标准滚动条
  $(".scroll").mCustomScrollbar({theme:"minimal-dark"});


  //返回顶部
    $(".btntop").bind("click", function(){
        $('html, body').animate({scrollTop:0}, 300);
    });
})
