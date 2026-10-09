//办证须知
$('.top_cont li').click(function(){
	var i = $(this).index();
	$(this).addClass('on').siblings().removeClass('on');
	$('.listBox .ul_box').eq(i).addClass('show').siblings('.ul_box').removeClass('show')
});

$('.processbox').delegate('.notice a','click',function(){
	$('.noticeBox').animate({
		'right':"0"
	},150);
	
});
$('.closetip').click(function(){
	$('.noticeBox').animate({
		'right':"-100%"
	},150);
})

//店铺相关tab
	$('.detail_nav').delegate('li','click',function(){
		$(this).addClass('on').siblings().removeClass('on');
	    var i = $(this).index();
	    $('.detail_content .changebox').eq(i).addClass('show').siblings().removeClass('show');

	});
	
//价格明细
$('.price_visa a').click(function(){
	$('.mask').show();
	$('.detail_price').animate({'bottom':'0'},200)
});

$('.detail_price h2>i,.mask').click(function(){
	$('.mask').hide();
	$('.detail_price').animate({'bottom':'-4rem'},200)	
});
	

//$('.more_detail').click(function(){
//	var len =$('.flowbox ul').find('li').length ;
//	var html = [];
//	
//	for(var i=0; i<2; i++){
//		list = `
//		<li>
//			<i>`+(len+i+1)+`</i>
//			<label>准备材料</label>
//			<div class="conte-text">
//				必须是当日11点之前提交材料或者提供增补材料后，1个工作日配额日，2个工作日给到入台证审核结果，等待面试时间=等待配额日时间;
//			办理时长为入台证签发机构的常规办理时长，不排除非旅行社原因导致办理时长延长的可能，若台湾移民署审核通知增补材料的，在材料递交后，重新计算受理时间，建议您预留足够时间办理入台证，以免给您带来不必要的损失
//			</div>
//		</li>
//		`
//		html.push(list);
//	}
//	$('.flowbox ul').append(html.join(''));
//	$(this).hide()
//	
//})
