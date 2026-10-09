$(function(){
	//查看地图
   $('.appMapBtn').attr('href', OpenMap_URL);
   $(".picFocus").slide({ mainCell:".bd ul",effect:"left", });
   //立即预定
	var orderBtn = $('.info_ticket .spe-dd').find('.order_btn');
	var orderHref = orderBtn.attr('href')
	$('.buy a').attr('href',orderHref);
  	
    if(($('.device dl .tingche').size()>0) && ($('.device dl .mianfeitingche').size()>0)){
      $('.device dl .tingche').closest('dl').hide();
    }
  	if(($('.device dl .wifi').size()>0) && ($('.device dl .mianfeiwifi').size()>0)){
      $('.device dl .wifi').closest('dl').hide();
    }
  	if(($('.device dl .jiejifuwu').size()>0) && ($('.device dl .mianfeijieji').size()>0)){
      $('.device dl .jiejifuwu').closest('dl').hide();
    }

	if($(".info_ticket  .noimg").length == $(".info_ticket dd").length){
		$(".info_ticket  .noimg .rimg").remove();
	}
	
	
	// 查看大图
	$(".info_ticket .room_info  .rimg").click(function(){
		var t = $(this);
		var imgpath = t.attr('data-imgpath');
		var tit = t.closest('.room_info').find('.rbox label').text();
		if(imgpath){
			var imgArr = imgpath.split(',');
			$(".imgPopShow .head h2").text(tit);
			$(".imgPopShow  .tempWrap").remove();
			if($(".imgBox").length==0){
				$(".imgPopShow .slidebox").prepend('<ul class="imgBox"></ul>')
			}
			imgArr.forEach(function(val){
				$(".imgPopShow .imgBox").append('<li ><img src="/include/attachment.php?f='+val+'"></li>')
			});
			$(".mask_pop,.imgPopShow").show();
			jQuery(".slidebox").slide({mainCell:".imgBox",effect:"leftLoop",autoPlay:false,autoPage:true,});
		}
	});
	
	$(".mask_pop,.imgPopShow .close_btn").click(function(){
		$(".mask_pop,.imgPopShow").hide();
	})
})
