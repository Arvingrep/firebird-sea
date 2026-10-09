$(function(){
	//查看地图
   $('.appMapBtn').attr('href', OpenMap_URL);

    //立即预定
	var orderBtn = $('.info_ticket .spe-dd').find('.order_btn');
	var orderHref = orderBtn.attr('href')
	$('.buy a').attr('href',orderHref);
   

})
