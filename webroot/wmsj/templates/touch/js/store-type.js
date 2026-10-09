$(function(){

  // 操作提示层
  $('.item .more').click(function(){
    $('.layer .mask').addClass('show').animate({'opacity':'.5'}, 100);
    $('.layer .operate').animate({'bottom':'0'}, 150);
  })
  $('.mask, .cancel').click(function(){
    $('.layer .mask').animate({'opacity':'0'}, 100);
    setTimeout(function(){
      $('.layer .mask').removeClass('show');
    }, 100)
    $('.layer .operate').animate({'bottom':'-100%'}, 150);
  })



})
