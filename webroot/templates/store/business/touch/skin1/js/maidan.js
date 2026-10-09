$(function(){

	$('.warning_btn').click(function(){
		$('.disk').hide();
		$('.warning').hide();
	})

	if(state == 0) return;

	// 是否输入不参与优惠金额
	$('.Drop_out').click(function(){
		var x = $(this);
		if (x.hasClass('check')) {
			x.removeClass('check');
			$('.Drop_out_pay').hide();
		}else{
			x.addClass('check');
			$('.Drop_out_pay').show();
		}
		getTotalMoney();
	})

	$('#all_money, #out_money').keyup(function(){
		getTotalMoney();
	})


	// 支付
	$(".pay_btn").click(function(){
		var t = $(this);

		var price = getTotalMoney();

		if(t.hasClass("disabled") || !t.hasClass("keyup")) return;

		t.addClass("disabled");

		$.ajax({
			url: '/include/ajax.php?service=business&action=maidanDeal',
			type: 'post',
			data: {
				store  :  shopid,
				amount :  price.amount,
				amount_alone : price.amount_alone
			},
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					location.href = payUrl.replace('%ordernum%', data.info);
				}else{
					alert(data.info);
					t.removeClass("disabled");
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.removeClass("disabled");
			}
		})
	})

	// 计算实付金额
	function getTotalMoney(){
		var all_money     = $("#all_money").val() ? parseFloat($("#all_money").val()) : 0,
			has_out_money = $(".Drop_out").hasClass("check"),
			out_money     = $('#out_money').val() ? parseFloat($('#out_money').val()) : 0;

		var out_money_ = has_out_money ? out_money : 0;

		out_money_ = out_money_ > all_money ? all_money : out_money_;

		var money = (all_money - out_money_) * (100 - (youhui_open ? youhui_value : 0)) / 100 + out_money_;

		if(money <= 0){
			money = 0;
			$(".pay_btn").removeClass("keyup");
		}else{
			$(".pay_btn").addClass("keyup");
		}

		$(".fanial i").text(money);

		return {amount : all_money, amount_alone : out_money_};

	}

	setTimeout(function(){
		getTotalMoney();
	},500)


})
