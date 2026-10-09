$(function(){

    //立即预定
	var orderBtn = $('.info_ticket .spe-dd').find('.order_btn');
	var orderHref = orderBtn.attr('href')
	$('.buy a').attr('href',orderHref);
  	if(st ==1){
      var chosetimeArr2 = chosetimeArr.join(',');
      $('.ftTime').html(chosetimeArr2)
    }
   

})
