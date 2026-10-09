$(function(){
  $('.item').click(function(){
    var t = $(this);
    if (t.hasClass('active')) {
      t.removeClass('active');
    }else {
      t.addClass('active');
    }
  })

})
