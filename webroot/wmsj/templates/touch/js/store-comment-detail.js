$(function(){

  $('.reply').click(function(){
    var comment = $('.comment').val(), error = $('.error');
    if (comment == "") {
      error.show();
      setTimeout(function(){error.hide()},1000);
    }
  })


})
