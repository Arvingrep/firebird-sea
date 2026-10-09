$(function () {
    $('.header .searchbox .txt_search').bind('focus',function () {
        $(this).closest('.searchbox').addClass('focus');
    });
    $('.header .searchbox .txt_search').bind('blur',function () {
        $(this).closest('.searchbox').removeClass('focus');
    });
    $('.header .searchbox').hover(function () {
        $(this).addClass('curr');
    },function () {
        $(this).removeClass('curr');
    });
  
   $('#search_button').bind('click', function () {
        $(this).closest('form').submit();
    })
  
  
});