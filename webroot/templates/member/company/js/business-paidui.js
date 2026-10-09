/**
 * 会员中心商家
 * by guozi at: 20170328
 */

$(function(){

	$("#serviceFrom").submit(function(e){
		e.preventDefault();
		var form = $(this), t = $("#submit");

		t.attr("disabled", true).text(langData['siteConfig'][26][153]);
		var url = form.attr("action"), data = form.serialize();
		$.ajax({
			url: url,
			data: data,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					t.text(langData['siteConfig'][6][39]);
				}else{
					$.dialog.alert(data.info);
				}
				setTimeout(function(){
					t.attr("disabled", false).text(langData['siteConfig'][6][27]);
				},1000)

			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
				t.attr("disabled", false).text(langData['siteConfig'][6][27]);
			}
		})
	})
});
