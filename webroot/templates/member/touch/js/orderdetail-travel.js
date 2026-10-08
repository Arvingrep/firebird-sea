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

    //一键续住
    $(".go_btn").unbind("click").click(function (){
        var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
        }

        var t = $(this), id = t.attr("data-id");

        if(id){
            if(confirm(langData['travel'][13][101])){
                $.ajax({
                    url: masterDomain+"/include/ajax.php?service=travel&action=oneKeyContinued&id="+id,
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100){
							if(device.indexOf('huoniao_Android') > -1) {
		                        setupWebViewJavascriptBridge(function (bridge) {
		                            bridge.callHandler('pageClose', {}, function (responseData) {
		                            });
		                        });
		                        location.href = data.info;
		                    }else{
		                        location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
		                    }
                        }else{
                            alert(data.info);
                        }
                    },
                    error: function(){
                        alert(langData['siteConfig'][20][183]);
                    }
                });
            }
        }

    });

})
