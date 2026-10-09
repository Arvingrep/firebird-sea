$(function () {

	$(".inp").delegate('#search', 'click', function(event) {
		$('#sform').submit();
   });

	   // banner轮播图
  	new Swiper('.banner .swiper-container', {pagination:{ el: '.banner .pagination',} ,slideClass:'slideshow-item',loop: true,grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,}});

})