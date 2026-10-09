$(function(){

	// 就餐人数弹出层打开关闭
	$(".per_num").click(function(){
		if ($('.choice_num').css('display') == "block") {
			$('.choice_num').slideUp(300);
			$('.disk').hide();
		}else{
			$('.choice_num').slideDown(300);
			$('.disk').show();
			$('.choice_num').show();
		}
	})
	$(".choice_num .cn_lead em").click(function(){
		$('.choice_num').slideUp(300);
		$('.disk').hide();
	})
	// 就餐人数选择后关闭弹出层
	$('.choice_num .choice_box ul li').click(function(){
		var x = $(this), num = x.text();
		x.addClass('cb_bc').siblings().removeClass('cb_bc');
		$('.choice_num').slideUp(300);
		$('.disk').hide();

		utils.setStorage("business_diancan_cart_people_"+shopid, num);

		allprice();
	})

	function allprice(){
		var sum2 = 0;
		$(".cart_list .car_t1").each(function(){
			var number =Number($(this).find('.num-account').text()),
				price = Number($(this).attr('data-price'));
			sum1 = number * price;
		    sum2+=+sum1;
		});
		sum2 += tablewarePrice * parseInt($('.choice_num .choice_box ul li.cb_bc').text());
		$('.all_price .price_num').text(sum2);

	}


	// 增加或减少计算价格
	$('#cart_list').delegate('.plus', 'click', function(){
		var x = $(this),
			price = x.closest('.car_t1').attr('data-price'),
			find = x.closest('.car_t1').find('.num-account').text();
			cont = Number(find);
		number = cont + 1;
		x.closest('.car_t1').find('.num-account').text(number);

		allprice();
	})
	$('#cart_list').delegate('.reduce', 'click', function(){
		var x = $(this),
			price = x.closest('.car_t1').attr('data-price'),
			find = x.closest('.car_t1').find('.num-account').text();
			cont = Number(find);
		number = cont - 1;
		if (number <= 0 ) {
			x.closest('.car_t1').find('.num-account').text(number);
			allprice();
			x.closest('.car_t1').remove();
			var length = $('.cart_list .car_t1').length;
			$('.header-address em').text(length);
		}else{
			x.closest('.car_t1').find('.num-account').text(number);
			allprice();
		}
	})
	// 购物车清空
	$('.dropnav').click(function(){
		$(".sure_box").show();
		$(".disk2").show();
	})
	$('.cancel_btn').click(function(){
		$(".sure_box").hide();
		$(".disk2").hide();
	})
	$('.sure_btn').click(function(){
		utils.removeStorage("business_diancan_cart_"+shopid);
		$('.cart_list').html("");
		$('.all_price .price_num').text('0');
		$(".sure_box").hide();
		$(".disk2").hide();
		$('.header-address em').text('0');

		$(".cart").hide();
		$(".empty").show();
	})

	//加载购物车内容
	var cartHistory = utils.getStorage("business_diancan_cart_"+shopid), food = '[';
	var cartPeopleHistory =  utils.getStorage("business_diancan_cart_people_"+shopid);
	if(cartPeopleHistory){
		$('.choice_num .choice_box ul li').each(function(){
			if($(this).text() == cartPeopleHistory){
				$(this).addClass("cb_bc").siblings().removeClass("cb_bc");
				return false;
			}
		})
	}else{
		utils.setStorage("business_diancan_cart_people_"+shopid, 1);
	}
	if(cartHistory){

		order_content = cartHistory;

		var list = [];
		for(var i = 0; i < cartHistory.length; i++){

			//商品价格
			var price_ = cartHistory[i].price + cartHistory[i].nprice; // 单价
			var price = (cartHistory[i].price + cartHistory[i].nprice) * cartHistory[i].count;

			foodTotalPrice += price;

			var html = '';
			html += '<div class="car_t1 fn-clear" id="food'+cartHistory[i].id+'" data-id="'+cartHistory[i].id+'" data-title="'+cartHistory[i].title+'" data-src="'+cartHistory[i].pic+'" data-price="'+price_+'" data-nature="">';
			// html += '	<span class="label">新品</span>';
			html += '	<div class="car_pic">';
			html += '		<a href="#"><img src="'+cartHistory[i].pic+'" onerror="this.src=\'/static/images/food.png\'"></a>';
			html += '	</div>';
			html += '	<h1>'+cartHistory[i].title+'</h1>';
			html += '	<h3>'+cartHistory[i].ntitle+'</h3>';
			html += '	<h4>&nbsp;</h4>';
			html += '	<span class="fn-clear"><em class="sale-price">'+echoCurrency("symbol")+''+price_.toFixed(2)+'</em><i>/'+langData['siteConfig'][21][17]+'</i>';
			// html += '		<p><i class="reduce"></i><strong class="num-account">'+cartHistory[i].count+'</strong><b class="plus"></b></p>';
			html += '		<p><strong class="num-account">'+cartHistory[i].count+'</strong> '+langData['siteConfig'][21][17]+'</p>';
			html += '	</span>';
			html += '</div>';

			list.push(html);

			food = food + '{"id": "'+cartHistory[i].id+'", "price": price},';

		}

		food = food.substr(0, food.length-1);
		food = food + ']';

		var totalPrice = foodTotalPrice + tablewarePrice * parseInt($('.choice_num .choice_box ul li.cb_bc').text());
		totalPrice = totalPrice.toFixed(2);
		$(".price_num").html(totalPrice);

		$("#cart_list").html(list.join(""));

		$(".header-address em").text(list.length);

		$(".cart").show();



	}else{
		$(".empty").show();
	}

})
