$(function(){

  //导航
  $('.header-r .screen').click(function(){
    var nav = $('.nav'), t = $('.nav').css('display') == "none";
    if (t) {nav.show();}else{nav.hide();}
  })

  $('.item .title').click(function(){
    var t = $(this), parent = t.parents('.item'), index = parent.index(), title = $('.item .title'), subitem = $('.subitem'), tsubmit = parent.find('.subitem');
    if (tsubmit.css('display') == 'none') {
      subitem.hide();
      title.removeClass('open');
      t.addClass('open');
      tsubmit.show();
    }else {
      t.removeClass('open');
      tsubmit.hide();
    }
  })

})
