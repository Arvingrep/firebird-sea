$(function(){


	// 提交回复
	$("#submitBtn").click(function(e){
		console.log("aaaa")
		var btn = $(this),
			content = $(".replycontenta");

		if(btn.hasClass("disabled")) return;

		if($.trim(content.text()) == ''){
			$.dialog.alert(langData['shop'][4][26]);
			return;
		}

		btn.addClass("disabled").text(langData['siteConfig'][26][153]);

		var data = [];
		data.push('id='+id);
		data.push('content='+content.text());
		$.ajax({
			url: '?action=reply',
			data: data.join("&"),
			type: 'get',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					$.dialog.confirm(data.info, function(){
						location.reload();
					})
				}else{
					$.dialog.alert(data.info);
					btn.removeClass("disabled").text(langData['siteConfig'][26][153]);
				}
			},
			error: function(){
				btn.removeClass("disabled").text(langData['siteConfig'][26][153]);
				$.dialog.alert(langData['siteConfig'][20][181]);
			}
		})
	})

})
