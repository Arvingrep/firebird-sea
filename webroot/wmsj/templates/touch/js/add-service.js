$(function(){

  //年月日
  $('.demo-test-date').scroller(
    $.extend({preset: 'time'})
  );

  // 开启、关闭
  $('.openbtn .toggle').click(function(){
    if ($(this).hasClass('on')) {
      $(this).removeClass('on');
    }else {
      $(this).addClass('on');
    }
  })

  // 提交
  $('.submit').click(function(){
    $("#submitForm").submit();
  })

  $("#submitForm").submit(function(e){
    e.preventDefault();
    var btn = $(".submit"), form = $(this);
    if(btn.hasClass("disabled")) return;

    // 开关类
    $(".toggle").each(function(){
      var t = $(this), type = t.attr('data-type');
      $('#'+type).val(t.hasClass('on') ? 1 : 0);
    })

    formSubmit('add-service');

  })

})
