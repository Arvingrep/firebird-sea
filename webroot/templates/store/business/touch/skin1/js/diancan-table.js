$(function(){

	//加载购物车内容
	var cartHistory = utils.getStorage("business_diancan_cart_"+shopid), food = '[';
	var cartPeopleHistory =  utils.getStorage("business_diancan_cart_people_"+shopid);

	if(cartHistory){
		var list = [];
		for(var i = 0; i < cartHistory.length; i++){

			//商品价格
			var price_ = cartHistory[i].price + cartHistory[i].nprice; // 单价
			var price = (cartHistory[i].price + cartHistory[i].nprice) * cartHistory[i].count;

			list.push('<li><em class="f_name">'+cartHistory[i].title+'</em><em class="f_num">×'+cartHistory[i].count+'</em><em class="f_price">'+echoCurrency("symbol")+'<i>'+cartHistory[i].price+'</i></em></li>');

			food = food + '{"id": "'+cartHistory[i].id+'", "price": '+price+ '},';

		}

		food = food.substr(0, food.length-1);
		food = food + ']';

		$(".food_con ul").html(list.join(""));

	}else{
		alert(langData['siteConfig'][22][91]);
		return false;
	}

	$('.write').click(function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == undefined || userid == null || userid == ""){
			location.href = '/login.html';
			return;
		}
		$('.sure_box').hide();
		$(".number").show();
		$('.disk').show();
	})
	$(".sure_btn").click(function(){
		$('.sure_box').hide();
		$(".number").show();
	})
	// 确定桌号
	$(".number span").click(function(){

		$(".number").hide();

		var table = $.trim($(".number input").val());
		if(table == ''){
			$('.fail_box ').show();
		}else{

			var data = [];
			data.push('people='+cartPeopleHistory ? cartPeopleHistory : 1);

			$.ajax({
				url: '/include/ajax.php?service=business&action=diancanDeal',
				data: {
            shop: shopid,
            order_content: JSON.stringify(cartHistory),
            people: cartPeopleHistory ? cartPeopleHistory : 1,
            table: table
        },
				type: 'post',
				dataType: 'json',
				success: function(data){
					if(data && data.state == 100){
						utils.removeStorage("business_diancan_cart_"+shopid);
						alert(langData['siteConfig'][22][92]);
						location.href = manageUrl;
					}else{
						alert(data.info);
					}
					$(".disk").hide();
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
				}
			})
		}


	})
	$(".rewrite_btn").click(function(){
		$('.fail_box ').hide();
		$(".number").show();
	})
	$(".cancel_btn").click(function(){
		$('.fail_box ').hide();
		$(".disk").hide();
	})


})
