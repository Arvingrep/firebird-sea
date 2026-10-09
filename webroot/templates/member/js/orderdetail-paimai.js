$(function(){

	//收货
	$(".sh").bind("click", function(){
		var t = $(this);
		if(t.attr("disabled") == "disabled") return;

		if(confirm(langData['siteConfig'][20][545])){  //确定要收货吗？
			t.html(langData['siteConfig'][6][35]+"...").attr("disabled", true);  //提交中

			$.ajax({
				url: "/include/ajax.php?service=paimai&action=receipt",
				data: "id="+id,
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						location.reload();

					}else{
						alert(data.info);
						t.attr("disabled", false).html(langData['siteConfig'][6][45]);  //确认收货
					}
				},
				error: function(){
					$.dialog.alert(langData['siteConfig'][20][183]); //网络错误，请重试！
					t.attr("disabled", false).html(langData['siteConfig'][6][45]); //确认收货
				}
			});

		}

	});


	$('.popPay').bind("click", function(){

		var ordernum1 = $(this).attr('data-ordernum');
		var dataJson = {'ordernum':ordernum1,'orderfinal':1,'newOrder':1}
		if(orderstate == '0'){
		   dataJson = {'ordernum':ordernum1,'orderfinal':1}
		}

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=paimai&action=pay",
			type: 'post',
			data:dataJson ,
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){

					info = data.info;
					cutDown = setInterval(function () {
						$(".payCutDown").html(payCutDown(info.timeout));
					}, 1000)

					var datainfo = [];
					for (var k in info) {
						datainfo.push(k + '=' + info[k]);
					}
					$("#amout").text(info.order_amount);
					$('.payMask').show();
					$('.payPop').show();

					if (usermoney * 1 < info.order_amount * 1) {

						$("#moneyinfo").text('余额不足，');
						$("#moneyinfo").closest('.pay_item').addClass('disabled_pay')
					}else{
						$("#moneyinfo").text('可用');
						$("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
					}

					if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
						$("#bonusinfo").text('额度不足，可用');
						$("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
					}else if( bonus * 1 < info.order_amount * 1){
						$("#bonusinfo").text('余额不足，可用');
						$("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
					}else{
						$("#bonusinfo").text('可用');
						$("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
					}
					ordernum  = info.ordernum;
					order_amount = info.order_amount;

					$("#ordertype").val('');
					$("#service").val('paimai');
					service = 'paimai';
					var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
					$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
				}else{
					alert(data.info);
				}
			},
			error: function(){
				alert('网络错误，请重试！');
			}
		})
	});

});
