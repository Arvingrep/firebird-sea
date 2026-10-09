$(function(){

  $('.main-tit .select em').click(function(){
     var t = $(this).parent();
     if (t.hasClass('show')) {
       t.removeClass('show');
     }else {
       t.addClass('show');
     }
     return false;
   })

   $('body').click(function(){
     $('.main-tit .select').removeClass('show');
   })


   //类型切换
   $(".select ul li").bind("click", function(){
     var t = $(this), id = t.attr("data-id"), txt = t.text();
     if(!t.hasClass("curr")){
       t.addClass("curr").siblings("li").removeClass("curr");
       $('.select em').text(txt);
     }
   });

})
