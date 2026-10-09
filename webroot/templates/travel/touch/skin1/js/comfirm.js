$(function(){
	//价格明细
	$('.price_all a').click(function(){
		$('.mask').show();
		$('.detail_price').animate({'bottom':'0'},200)
	});
	
	$('.detail_price h2>i,.mask').click(function(){
		$('.mask').hide();
		$('.detail_price').animate({'bottom':'-20rem'},200)	
	});

})
