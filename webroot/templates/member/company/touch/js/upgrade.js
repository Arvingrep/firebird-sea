$(function(){
  $('.grade li').click(function(){
    var t = $(this), index = t.index();
    t.addClass('active').siblings('li').removeClass('active');
    $('.price ul').hide().eq(index).show();
    $('.special-box ul').hide().eq(index).show();
  })
})
