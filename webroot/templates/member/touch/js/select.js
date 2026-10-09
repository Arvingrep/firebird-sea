$(function(){

  var itemLast = $('.item:last').offset().top, itemHeight = $('.item').height();
  $('.itembox').height((itemLast + itemHeight));

  // 选择模块
  $('.item').click(function(){
    var t = $(this);
    if (t.hasClass('active')) {
      t.removeClass('active');
    }else {
      t.addClass('active');
    }
  })

  $('.nextbtn').click(function(){
    var t = $(this);
    if ($('.itembox .active').length < 1) {
      alert(langData['siteConfig'][20][383]);
    }else {
      var modules = [];
      $('.itembox .active').each(function(){
        var t = $(this), name = t.data("name");
        modules.push(name);
      })
      window.location.href = redirectUrl.replace("#modules#", modules.join(","));
    }
  })

})
