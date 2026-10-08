$(function(){
	
	$('.ticket_info').delegate('.qrcode i','click',function(){
		$('.mask,.ercode').show();
        var t = $(this), url = t.data('code');
		if(url != '' && url != undefined){
            url = tuanQR + url ;
			$('.ercode dd').html('<img src="'+url+'" alt="">');
			$('.mask').show();
		}
	});

	$('.ercode i').click(function(){
		$('.mask,.ercode').hide();
	});

})
