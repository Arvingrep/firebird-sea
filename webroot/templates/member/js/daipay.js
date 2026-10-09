$(function(){
	// 未付款状态
	if(!state && timeCount){
		//时间换算
		function timer() {
			timeCount--

			if(timeCount <= 0){
				$('.timeCut').hide();
				return;
			}
			var time = timeCount;
			var d = parseInt(time / (60 * 60 * 24));
			var h = parseInt(time / 60 / 60 % 24);
			var m = parseInt(time / 60 % 60);
			var s = parseInt(time % 60);
			return h + ' : ' + m + ' : ' + s;
		}

		setInterval(function(){
			$(".timeCut b").html(timer())
		}, 1000)
	}


	$(".btn_pay").click(function(){
		$(".QR_box,.QR_Mask").show();
	})

	$(".QR_Mask,.QR_box .close").click(function(){
		$(".QR_box,.QR_Mask").hide();
	});


	var clipboardShare = new ClipboardJS('.btn_copy');
	clipboardShare.on('success', function(e) {
		alert(langData['siteConfig'][46][101]);  //复制成功
	});

	clipboardShare.on('error', function(e) {
		alert(langData['siteConfig'][46][102]); //复制失败
	});


	$(".linkbox p").click(function(){
		var range = document.createRange();

		    referenceNode = $(this)[0];
			range.selectNodeContents(referenceNode);
		    var selection = window.getSelection();
		    selection.removeAllRanges();
		    selection.addRange(range)
	})
})
