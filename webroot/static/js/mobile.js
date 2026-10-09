$(function(){

   $('.navbar li').hover(function(){
      var of = $(this).position().left;
      var ow = $(this).width()/2;
      var tw = $('.navbar i').width()/2;
      $('.navbar i').stop().animate({'left':of+ow-tw+'px'},200);
    },function(){
      $('.navbar i').stop().animate({'left':'139px'},200);
    });


})
