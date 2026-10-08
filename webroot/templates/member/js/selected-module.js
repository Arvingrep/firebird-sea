$(function(){

  // 第一步选择开通模块
  $('.module-box li').click(function(){
    var t = $(this);
    t.hasClass('active') ? t.removeClass('active') : t.addClass('active');
  })

  $('.next-btn').click(function(){
    var t = $(this);
    if ($('.module-box .active').length < 1) {
      alert(langData['siteConfig'][20][383]);
    }else {
      var modules = [];
      $('.module-box .active').each(function(){
        var t = $(this), name = t.data("name");
        modules.push(name);
      })
      window.location.href = redirectUrl.replace("#modules#", modules.join(","));
    }
  })

  $('.jump-btn').click(function(){
      $("#pay").submit();
  })

})
