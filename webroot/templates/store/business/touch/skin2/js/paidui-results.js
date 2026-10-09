$(function(){

	$(".edit").click(function(){
		$('.warning_box').show();
		$('.disk').show();
	})

	$(".know").click(function(){
		$('.warning_box').hide();
		$('.disk').hide();
	})

	// 取消排队
	$(".foot_btn .cancel").click(function(){
		var t = $(this);
		if(confirm(langData['siteConfig'][22][98])){
			$.ajax({
				url: '/include/ajax.php?service=business&action=paiduiUpdateState&state=2&id='+id,
				type: 'post',
				dataType: 'json',
				success: function(data){
					if(data && data.state == 100){
						location.reload();
					}else{
						alert(data.info);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
				}
			})
		}
	})

	// 删除预约
	$(".foot_btn .del").click(function(){
		var t = $(this);
		if(confirm(langData['siteConfig'][20][461])){
			$.ajax({
				url: '/include/ajax.php?service=business&action=serviceOrderDel&type=dingzuo&id='+id,
				type: 'post',
				dataType: 'json',
				success: function(data){
					if(data && data.state == 100){
						location.href = history.go(-1);
					}else{
						alert(data.info);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
				}
			})
		}
	})

})
