$(function(){
	var hui_click = 0;  //未勾选
	var quantype = 0; //券类型
	var waimaiGetType = 0;  //默认外卖 ，否则自提
    var utils = {
        canStorage: function(){
            if (!!window.localStorage){
                return true;
            }
            return false;
        },
        setStorage: function(a, c){
            try{
                if (utils.canStorage()){
                    localStorage.removeItem(a);
                    localStorage.setItem(a, c);
                }
            }catch(b){
                if (b.name == "QUOTA_EXCEEDED_ERR"){
                    alert("您开启了秘密浏览或无痕浏览模式，请关闭");
                }
            }
        },
        getStorage: function(b){
            if (utils.canStorage()){
                var a = localStorage.getItem(b);
                return a ? JSON.parse(localStorage.getItem(b)) : null;
            }
        },
        removeStorage: function(a){
            if (utils.canStorage()){
                localStorage.removeItem(a);
            }
        },
        cleanStorage: function(){
            if (utils.canStorage()){
                localStorage.clear();
            }
        }
    };

	var totalPrice = 0;

	//加载购物车内容
	var waimaiDiscount ='';
	var cartHistory = utils.getStorage("wm_cart_"+shopid), food = '[';
	if(cartHistory){

		order_content = cartHistory;

		var list = [];
		var sum=0;
		var is_discount = 0;
		var zkprice = 0;
		var hui_jian_price = 0
		waimaiDiscount = checkAuth('waimai');

		if(is_vipdiscount==1){

			waimaiDiscount = vipdiscount_value;

		}
		for(var i = 0; i < cartHistory.length; i++){
			if($('.rec_box li[data-id="'+cartHistory[i].id+'"]').size()>0){
			$('.rec_box li[data-id="'+cartHistory[i].id+'"]').remove();
			var rec_num = $('.rec_box li').length;
			$('.rec_box h2').html(langData['waimai'][9][3].replace("1",rec_num))
		}

			//商品价格
			var price_ = cartHistory[i].price + cartHistory[i].nprice;
			// var price = (cartHistory[i].price + cartHistory[i].nprice) * cartHistory[i].count;
			var price_show = cartHistory[i].price + cartHistory[i].nprice ;
			//会员价格与商品价格选择
			if(cartHistory[i].is_discount == 1){
				//是否开启商品打折1-开启，2-关闭

				//判断会员价跟商品价格哪个优惠力度大
				if((cartHistory[i].discount_value >= waimaiDiscount) && userinfovip.level){
					//会员力度大
					var price = (cartHistory[i].price / (cartHistory[i].discount_value/10))* cartHistory[i].count;
					console.log("1:"+price);
					price_show = (cartHistory[i].price / (cartHistory[i].discount_value)*vip_discount);


				}else{

					var price = (cartHistory[i].price + cartHistory[i].nprice)*cartHistory[i].count;
					price_show = cartHistory[i].price + cartHistory[i].nprice
					// console.log("2:"+price);
					zkprice+= price; //这里主要是计算商品折扣力度大的时候 跟会员价格合并运算时候的问题(某个商品折扣力度大，该商品使用的是商品折扣的优惠，其他商品没设置商品折扣如果是会员就会按照会员价格计算)
					is_discount = 1;
				}

			}else{

				 var price = (cartHistory[i].price + cartHistory[i].nprice) * cartHistory[i].count;

			}


			foodTotalPrice += price;

			//打包费用
			if(cartHistory[i].dabao > 0){
				dabaoTotalPrice += cartHistory[i].dabao * cartHistory[i].count;
			}

			var on_discount = cartHistory[i].is_discount=="1"?"on_discount":""
			list.push('<div class="car_t1 '+on_discount+' fn-clear" data-id="'+cartHistory[i].id+'" data-dabao="'+cartHistory[i].dabao+'" data-price="'+cartHistory[i].price+'" data-discount_value="'+(cartHistory[i].discount_value?cartHistory[i].discount_value:0)+'"><p class="car_title fn-clear"><span class="car_h1 fn-left">'+cartHistory[i].title+'</span><span class="car_h2 fn-left">'+cartHistory[i].count+'</span><em class="fn-right car_h3">'+echoCurrency("symbol")+price_show.toFixed(2)+'</em></p><p class="car_info">'+cartHistory[i].ntitle+'</p></div>');

			// food.push({id:cartHistory[i].id, price: cartHistory[i].price * cartHistory[i].count});
			if(cartHistory[i].is_discount!='1'){
				hui_jian_price = (cartHistory[i].price*cartHistory[i].count)*(1-(vip_discount/10))+hui_jian_price;
			}
            // console.log(vip_discount)
			var price_price = cartHistory[i].price + cartHistory[i].nprice;
			food = food + '{"id": "'+cartHistory[i].id+'", "price": '+price_price.toFixed(2) * cartHistory[i].count + '},';

			sum += parseInt(cartHistory[i].count);
		}
		//共多少份
		$('.totalFood em').text(sum)
		// 非会员加入会员会减免
		$(".hui_box .left_hui p em").html(echoCurrency("symbol")+hui_jian_price.toFixed(2));

		food = food.substr(0, food.length-1);
		food = food + ']';

		//商品总价 && 打包费
		$("#totalFoodPrice").html(foodTotalPrice.toFixed(2));
		if(dabaoTotalPrice > 0){
			$("#dabaoPrice").html(dabaoTotalPrice);
			$("#dabao").show();
		}

		//满减
		var manjianTxt = "";
		// if(promotions.length > 0 && is_discount ==0){  //有折扣就不满减
		if(promotions.length > 0){
			for(var i = 0; i < promotions.length; i++){
				if(promotions[i][0] > 0 && promotions[i][0] <= foodTotalPrice){
					// console.log( langData['waimai'][2][10],promotions[i][0], promotions[i][1]);
					// manjianTxt = '<i class="icon_jian"></i>'+langData['waimai'][2][95]+'<span class="fn-right">'+langData['waimai'][2][10].replace('1', promotions[i][0]).replace('2', promotions[i][1])+'</span>';
					manjianTxt = '<i class="icon_jian"></i>'+langData['waimai'][2][95]+'<span class="fn-right">满'+promotions[i][0]+'减'+promotions[i][1]+'元</span>';
					manjianPrice = promotions[i][1];
				}
			}
		}
		// console.log(manjianTxt)
		if(manjianPrice > 0){
			$("#manjian").html(manjianTxt).show();
			$(".rec_box").hide();
		}else{
			$(".rec_box").show();
		}

		// if(manjianPrice > 0){
		// 	$(".on_full").show();
		// 	$(".rec_box").hide();
		// 	$(".on_full .price-hui em").html(manjianPrice)
		// }else{
		// 	$(".rec_box").show();
		// 	$(".on_full").hide();
		// }






		//增值服务
		var addserviceTxt = "", nowt = Number(nowTime.replace(":", ""));
		if(addservice!=''){
			for(var i = 0; i < addservice.length; i++){
				var tit = addservice[i][0], start = Number(addservice[i][1].replace(":", "")), end = Number(addservice[i][2].replace(":", "")), pri = parseFloat(addservice[i][3]);
				if(start < nowt && end > nowt && pri > 0){
					addserviceTxt = '<span class="spantit">'+tit+'</span><em class="fn-right">'+echoCurrency("symbol")+pri+'</em>';
					addservicePrice = pri;
				}
			}
			if(addserviceTxt!=''){
				$("#addservice").html(addserviceTxt).show();
			}

		}


		//配送费

		//固定起送价、配送费
		if(delivery_fee_mode == 1){

			//满额减
			if(delivery_fee_type == 2 && foodTotalPrice >= delivery_fee_value){
				delivery_fee = 0;
                $("#peisongPrice").html(delivery_fee);
			}

		}

		//按区域
		if(delivery_fee_mode == 2){

		}

		//按距离
		if(delivery_fee_mode == 3 && range_delivery_fee_value.length > 0){
			for(var i = 0; i < range_delivery_fee_value.length; i++){
				var sj = parseFloat(range_delivery_fee_value[i][0]), ej = parseFloat(range_delivery_fee_value[i][1]), ps = parseFloat(range_delivery_fee_value[i][2]), qs = parseFloat(range_delivery_fee_value[i][3]);
				if(sj <= juli && ej >= juli){
					delivery_fee = ps;
					basicprice = qs;
				}
			}
		}




		// if(delivery_fee_type == 1 || (delivery_fee_type == 2 && foodTotalPrice <= delivery_fee_value)){
		//
		// 	//开启按距离收取不同的配送费和不同的起送价
		// 	if(open_range_delivery_fee && range_delivery_fee_value.length > 0){
		//
		// 		for(var i = 0; i < range_delivery_fee_value.length; i++){
		// 			var sj = parseFloat(range_delivery_fee_value[i][0]), ej = parseFloat(range_delivery_fee_value[i][1]), ps = parseFloat(range_delivery_fee_value[i][2]), qs = parseFloat(range_delivery_fee_value[i][3]);
		// 			if(sj <= juli && ej >= juli){
		// 				delivery_fee = ps;
		// 				basicprice = qs;
		// 			}
		// 		}
		//
		// 	}else{
		// 		delivery_fee = delivery_fee;
		// 	}
		//
		// }else{
		// 	delivery_fee = 0;
		// }
		if(delivery_fee > 0){

			$("#peisong").show();
			$(".delever_jian").html(echoCurrency("symbol")+delivery_fee);
		}

		//起送验证
		if(foodTotalPrice < basicprice){
			$("#tj").html(langData['waimai'][2][96]+basicprice+echoCurrency("short")+"（"+langData['waimai'][2][97]+(basicprice - foodTotalPrice)+echoCurrency("short")+"）");//未达到起送价 -- 还差
			$("#tj").addClass('disabled')
		}else{
			$("#tj").html(langData['waimai'][2][35]);//提交订单
			$("#tj").removeClass('disabled')
		}


		// 非普通会员计算优惠信息
		var auth_waimai_price = 0, auth_delivery_price = 0;	// 优惠金额
		if(userinfovip.level){
			// 减去会员折扣
			var auth = {}, str = '', newAmount = 0;

			// 商品原价
			// 生日优惠/普通优惠
			// if(userinfo.birthday == today){
			// 	auth = checkAuth('birthday');
			// 	if(auth.type && auth.val.discount > 0 && auth.val.discount < 10){
			// 		// 当日订单总额限制
			// 		if(auth.val.limit > 0){
			// 			if(today_amount + foodTotalPrice > auth.val.limit){
			// 				var auth_shop_can = auth.val.limit - today_amount;
			// 				auth_shop_price = (auth_shop_can * (1 - auth.val.discount / 10));
			// 			}else{
			// 				auth_shop_price = (foodTotalPrice * (1 - auth.val.discount / 10));
			// 			}
			// 		}else{
			// 			auth_shop_price = (foodTotalPrice * (1 - auth.val.discount / 10));
			// 		}
			// 		if(auth_shop_price > 0){
			// 			newAmount = foodTotalPrice * discount_value / 10 - auth_shop_price;
			// 			str = '<li class="hui authtxt auth_foodPrice"><img src="'+userinfo.levelIcon+'">今天是您的生日，商品原价享受'+auth.val.discount+'折优惠'+(auth.val.limit ? '（当日订单金额'+auth.val.limit+'元内）' : '') + '</li>';
			// 		}
			// 	}
			// }
			// if(str == ''){
			// 	auth = checkAuth('shop');
			// 	if(auth.val){
			// 		auth_shop_price = (foodTotalPrice * discount_value / 10 * (1 - auth.val / 10));
			// 		newAmount = foodTotalPrice * discount_value / 10 - auth_shop_price;
			// 		str = '<li class="hui authtxt auth_foodPrice"><img src="'+userinfo.levelIcon+'">商品原价享受'+auth.val+'折优惠</li>';
			// 	}
			// }
			// if(str){
			// 	$('#foodprice span').addClass('del').after('<font>&yen;'+newAmount.toFixed(2)+'</font>');
			// 	$('#foodprice').before(str);
			// 	// $('#manjian').before(str);
			// }

			if(str == ''){
				var newfoodTotalPrice = foodTotalPrice
				// waimaiDiscount = checkAuth('waimai');
				if(waimaiDiscount){
					if(is_discount == 1){
						newfoodTotalPrice-=zkprice;
					}
					auth_waimai_price = (newfoodTotalPrice * (1 - waimaiDiscount / 10)); //会员减免的钱
					$("#huijian .fn-right em").html((auth_waimai_price*1).toFixed(2))

					//str = '<li class="hui authtxt auth_foodPrice"><img src="'+userinfovip.levelIcon+'">商品原价享受'+waimaiDiscount+'折优惠</li>';
				}
			}
			// if(str){
				// $("#peisong").before(str)
				// $('#manjian').before(str);
			// }

			// 配送费
			if(delivery_fee > 0){
				str = '';
				newAmount = 0;

				auth = checkAuth('delivery');
				if(auth!=0){
				str = '<li class="hui authtxt auth_delivery"><img src="'+userinfovip.levelIcon+'">配送费享受'+auth[0].val+'折优惠（剩余次数：不计次数）</li>';
				str ='配送费享受'+auth[0].val+'折优惠';
				// 打折
				if(auth[0].type == 'discount'){
					if(auth[0].val > 0 && auth[0].val < 10){
						auth_delivery_price = (delivery_fee * (1 - auth[0].val / 10));
						newAmount = delivery_fee - auth_delivery_price;

					}else{
						str = '';
					}
				// 计次
				}else if(auth[0].type == 'count'){
					// str = '<li class="hui authtxt auth_delivery"><img src="'+userinfovip.levelIcon+'">本次下单享受免费配送服务（剩余次数：不计次数）</li>';
					str = '本次下单享受免费配送服务（剩余次数：不计次数）';
					// 限次数
					if(auth[0].val > 0){
						if(userinfovip.delivery_count == 0){
							str = '';
						}else{
							console.log(delivery_fee)
							// auth_delivery_price = delivery_fee > 3 ? 3 : delivery_fee;
							auth_delivery_price = delivery_fee;
							newAmount = delivery_fee - auth_delivery_price;

							// str = '<li class="hui authtxt auth_delivery"><img src="'+userinfovip.levelIcon+'"></li>';
							// str = '享受'+(delivery_fee > 3 ? '免3元配送费' : '免配送费')+'（'+userinfovip.delivery_count+'次）'
							str = '享受免配送费'+'（'+userinfovip.delivery_count+'次）'
						}
					}else{
						str = '';
						$(".v_tip,.delever_jian").hide()
						auth_delivery_price = delivery_fee;
					}
				}
				}

				if(str){
					// $("#peisong em.delever_jian").html(echoCurrency("symbol")+newAmount);
					$("#peisongPrice").html(newAmount.toFixed(2));  //会员计算之后的配送费
					$("#peisong .v_tip").html(str)
					// $('#peisong').after(str);
				}else{
                  $("#peisongPrice").html(delivery_fee);
                  $('#peisong span.fn-right').hide();
                }
			}

			// 选择优质配送员

		}else{
			$("#peisongPrice").html(delivery_fee);
		}
		//总费用
		//商品总价 * 打折 - 满减 + 打包费 + 配送费 + 增值服务费 - 首单减免
		// console.log(foodTotalPrice , manjianPrice , dabaoTotalPrice , delivery_fee , addservicePrice , first_discount,auth_waimai_price,auth_delivery_price)
		totalPrice = (foodTotalPrice  - manjianPrice + dabaoTotalPrice + delivery_fee + addservicePrice - first_discount-auth_waimai_price-auth_delivery_price).toFixed(2);
		totalPrice = totalPrice < 0 ? 0 : totalPrice;
		//满返
		var manfanTxt = "";
		var oldPrice = totalPrice;//获取优惠之后的最终金额

		if(fullcoupon.length>0){
			for(var i = 0; i < fullcoupon.length; i++){

				if(fullcoupon[i][0] > 0 && fullcoupon[i][0] <= oldPrice){
					manfanTxt = '<i class="icon_fan"></i><em>'+langData['waimai'][7][32]+'</em><span>'+langData['waimai'][7][33].replace('1', '<em>'+fullcoupon[i][1]+'</em>')+'</span>';
					manfanPrice = fullcoupon[i][1];

			break;
				}

			}
		}
		if(manfanPrice > 0){
			$("#manFan").html(manfanTxt).show();
		}



		// if(ptprofit * 1 !=0){

		// 	ptprofitprice = ((totalPrice - delivery_fee-auth_delivery_price) * ptprofit / 100) * 1;


		// 	$("#ptshouyi").show();
		// 	$('#ptshouyiPrice').html(ptprofitprice.toFixed(2));

		// }

		$('.ontime_box .tprice em').html(((totalPrice*1/*+ptprofitprice*/) * zsbproportion/100).toFixed(2)); //准时达的钱
		$(".ontime_box p em").each(function(){
			var t = $(this);
			var p = t.text()*1/100;
			t.text(echoCurrency("symbol")+((totalPrice*1/*+ptprofitprice*/)*p).toFixed(2));
		})
		// totalPrice = totalPrice*1 + ptprofitprice*1;

		$(".price strong").html((totalPrice * 1 /*+ ptprofitprice*/).toFixed(2));

		if(paytype == '1' && offline_limit && totalPrice > offline_limit){
			$(".payType li[data-pay='1']").hide();
		}
		var youhuid = (foodTotalPrice - totalPrice) > 0 ? (foodTotalPrice - totalPrice) : 0;
		$(".youhui i").text(youhuid.toFixed(2));

		$("#cartList").html(list.join(""));

		$(".cart").show();
	}else{
		$(".empty").show();
	}


	var autoSelectQun = true;
	function getquanList(param,total,ps_now){
		var ps_now = $("#peisongPrice").text()*1;
		var data = [];
		data.push('shop='+shopid);
		data.push('food='+food);
		if(param){
			data.push("openlevel=1");
		}
		$("#list .loading").html("加载中，请稍后");
		check_intergal(total)
		$.ajax({
			url: '/include/ajax.php?service=waimai&action=quanList',
			type: 'post',
			data : data.join("&"),
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var list = data.info.list, len = list.length, html = [];
					var allPrice = total;
					for(var i = 0; i < len; i++){
						var obj = list[i], item = [];
						var shopList = obj.shopList, foodList = obj.foodList;
						//右侧优惠券列表
						var limit = [];
						if(shopList.length > 0){
							if(shopList.length > 3){
								limit.push(langData['waimai'][2][110].replace('1', shopList[0]).replace('2', shopList.length));//限1等2家店铺使用
							}else{
								limit.push(langData['waimai'][2][111].replace('1', shopList.join("、")));//限1使用
							}
						}
						if(foodList.length > 0){
							if(foodList.length > 3){
								limit.push(langData['waimai'][2][112].replace('1', foodList[0]).replace('2', foodList.length));//限1等2件商品使用
							}else{
								limit.push(langData['waimai'][2][111].replace('1', foodList.join("、")));//限1使用
							}
						}

						limit.push(langData['waimai'][2][111].replace('1', obj.username));
						item.push('<div class="item mgb'+( obj.fail == 1 ? ' disabled' : '')+'" id="'+obj.id+'" data-type="'+(obj.quantype?obj.quantype:"0")+'">');
						item.push('	<a href="javascript:;" class="fn-clear">');

						item.push('			<div class="countNum"><p class="mianzhi">' + echoCurrency("symbol")+'<strong class="youhmoney">'+obj.money+'</strong><span>'+langData['waimai'][1][103]+ obj.basic_price+'</span></p>');//满
						item.push('			<p class="time fz22">'+langData['waimai'][7][143]+obj.deadline+'</p></div>');//有效期至
						item.push('			<p class="infoTit">'+obj.name+'</p>');
						item.push('	</a>');

						if(obj.fail == 1){//不可用原因
							item.push('	<div class="because"><i class="icon_error"></i>'+obj.failnote+'</div>');
						}
						item.push('</div>');

						html.push(item.join(""));


					}

					$("#list").html(html.join(""));
					if(ptprofit * 1 !=0){
						var ptprofitprice = 0;

						ptprofitprice = ((allPrice - ps_now*1) * ptprofit / 100) * 1;
						ptprofitprice = ptprofitprice > 0 ? ptprofitprice : 0;

						$("#ptshouyi").show();
						$('#ptshouyiPrice').html(ptprofitprice.toFixed(2));

						 $(".tprice em").text((zsbproportion*(allPrice*1+ptprofitprice)/100).toFixed(2))
						for(let zs=0; zs<zsbspe.length; zs++){
	                        if(zsbspe[zs].time !=0 ){
	                            $(".ontime_box p em").eq(zs).text(echoCurrency("symbol") + (zsbspe[zs].proportion/100*(allPrice*1+ptprofitprice)).toFixed(2));
	                        }
                   		}
                   		var zs_fee = $(".ontime_box").hasClass("click")?(zsbproportion*(allPrice*1+ptprofitprice)/100):0;
                   		var vpce =  param != '' ? vip_price : 0;
                   		$(".car_tprice strong").text((allPrice*1 + ptprofitprice + vpce + zs_fee).toFixed(2));
										  check_intergal(allPrice*1 + ptprofitprice + vpce + zs_fee)
					}
						//左侧订单获取优惠券
						var txt = '', cls = '';
						if(data.info.good == 0){
							quanid = 0;
							$('.quan span').html(langData['waimai'][2][37]).addClass('noquan');//暂无可用优惠券
							$('.quan').attr('data-id',0)
						}else{
							quanid = data.info.good;
							var quanmoney=0;
							//选中的优惠券
							$('#list .item').each(function(){

								var index=$(this).index();

								if(!$(this).hasClass('disabled') && !$(this).hasClass('checked')){
									$('.quan span').html(langData['waimai'][8][31]).addClass('noquan');//暂不使用优惠券
									$('.quan').attr('data-id',0)
								}
							})

							$('#list').off('click').delegate('.item','click', function () {
								var checkId=$(this).attr('id');
								var type=$(this).attr('data-type');
								allPrice = total;
								if($(this).hasClass('disabled')) {
									alert(langData['waimai'][2][118]);$(".fee_info .b_txt em").text((ftotalPrice - allcountTotalPrice + quan*1).toFixed(2) + (zsbspe[zs].proportion/100*allcountTotalPrice).toFixed(2));
								}else{
									if(!$(this).hasClass('checked')){
										$('#list .item').removeClass('checked');
										$(this).addClass('checked');
										quantype = type;
										quanmoney=Number($(this).find('.youhmoney').text());
										quanid=checkId;
										quanhuo(quanmoney);

									}else{
										quantype = 0;
										$(this).removeClass('checked');

										quanhuo(0);
									}
									if($('#list .checked').length==0){
										$('.quan span').html(langData['waimai'][8][31]).addClass('noquan');//暂不使用优惠券
										$('.quan').attr('data-id',0)
									}
									// $(this).toggleClass('checked').siblings().removeClass('checked');
								}
							})

							function quanhuo(m){
								txt = '-'+echoCurrency("symbol")+'<em>'+m+'</em>';//抵用券

								allPrice = allPrice - m;
								allPrice = allPrice < 0 ? 0 : allPrice;
								var ptprofitprice = 0;
								if(ptprofit * 1 !=0){

									ptprofitprice = ((allPrice - ps_now*1) * ptprofit / 100) * 1;
									ptprofitprice = ptprofitprice > 0 ? ptprofitprice : 0;

									$("#ptshouyi").show();
									$('#ptshouyiPrice').html(ptprofitprice.toFixed(2));

								}
                                $(".tprice em").text((zsbproportion*(allPrice*1+ptprofitprice)/100).toFixed(2))
								for(let zs=0; zs<zsbspe.length; zs++){
                                if(zsbspe[zs].time !=0 ){
                                    $(".ontime_box p em").eq(zs).text(echoCurrency("symbol") + (zsbspe[zs].proportion/100*(allPrice*1+ptprofitprice)).toFixed(2));
                                }
                            }


								$(".car_tprice strong").text((allPrice*1 + ptprofitprice + (param!=''?vip_price:0)*1 + ($(".ontime_box").hasClass("click")?(zsbproportion*(allPrice*1+ptprofitprice)/100):0)).toFixed(2));
								cls = 'has';
								$('.quan span').html(txt).addClass(cls);
								$('.quan').attr('data-id',quanid);
								var integralAll = allPrice*1 + ptprofitprice + (param!=''?vip_price:0)*1 + ($(".ontime_box").hasClass("click")?(zsbproportion*(allPrice*1+ptprofitprice)/100):0);
								check_intergal(integralAll)
							}


						}

				}else{
					$("#list ").html('<div class="loading">'+langData['waimai'][2][117]+'</div>');
					$('.quan span').html(langData['waimai'][2][37]).addClass('noquan');//暂无可用优惠券
					$('.quan').attr('data-id',0);


				}
			}
		})
	}
	getquanList('',totalPrice,delivery_fee);
	var oldDelivery_fee = delivery_fee;//保存初始配送费
	//自提和配送切换
	$('.type_tab li').click(function(){
		var t = $(this), index = t.index();
		t.addClass('active').siblings().removeClass('active');
		$('.right_contain .type_con').eq(index).show().siblings('.type_con').hide();
		waimaiGetType = index;  //0是外卖  1是自提
		if(index == 0){
			delivery_fee = oldDelivery_fee;
			countPrice(hui_click);
          	$('.ontime_box').show();//准时宝
			$("#pickuptimeContener").remove();
			$('html').removeClass('noscroll');
		}else{

			delivery_fee = 0;//自提时配送费为0
			countPrice(hui_click);
           $('.ontime_box').hide();//准时宝
		}
	})
	//选择时间弹窗
	$('.chose-time').on('click', function () {
		var tflag = 1,
		_taht = this;
		$(_taht).toggleClass('on');
		if (!($(_taht).hasClass('on'))) {
		tflag = 0;
		}
		$('html').addClass('noscroll');
		var topn = $(_taht).offset().top - $(document).scrollTop() + 40;
		var leftn = $(_taht).offset().left;
		//数字为正整数，0表示当天可取
		// topn 当前位置-top
		// leftn 当前位置-left
		pickuptime.init(0, topn, leftn, tflag, function (data,adate) {
			$(_taht).removeClass('on');
			$('html').removeClass('noscroll');
			$(".chose-time").html(data[0]).addClass('has-cho');
			var ymd2 = DateToUnix(data[1]);
			$(".chose-time").attr('data-time',ymd2);
		});
	});

	//支付方式
	$('.payType li').click(function(){
		var t = $(this);
		t.addClass('checked').siblings().removeClass('checked');

	})



	//提交
	$("#tj").bind("click", function(){

		var t = $(this);
		var quanid=$('.car_t4 .quan').data('id');
		var psType = $('.type_tab li.active').attr('data-type') * 1;//配送方式
		var ztTime = $('.chose-time').attr('data-time');//配送时间
		var phone  = $('#cosume_tel').val();
		if(!cart_address_id  && !psType){
			alert(langData['waimai'][3][74]);//请选择送餐地址！
			return false;
		}

		if(!order_content){
			alert(langData['siteConfig'][20][450]);//购物车是空的，请选择商品后再提交！
			return false;
		}

		if(psType == 1 && !ztTime){
			alert(langData['waimai'][10][130]);//请选择自提时间
			return false;
		}
		if(psType==1 && !phone){
			alert(langData['waimai'][3][84]);//请填写手机号
			return false;
		}
		// if(psType ==1 &&!/1[0-9]{10}/.test(phone)){
		// 	alert(langData['siteConfig'][21][98]);   //请填写正确手机号
		// 	return false;
		// }
		var preset = [];
		$(".preset_item").each(function(){
			var p = $(this), tit = p.find("em").text(), val = p.find(".preset").val();
			preset.push({"title": tit, "value": val});
		});

		var paytype= $('.payType .checked').data('pay');
		var note = $("#note").val();

		t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");//提交中
		var tprice = '';
		if($('.ontime_box').hasClass('click')){
			tprice = ($(".tprice em").text())*1;
		}else{
			tprice = '';
		}
		var selectAddress=$('.addr-article.checked .consignee_addr').text();

		order_content = JSON.parse(JSON.stringify((cartHistory)));
		order_content.push.apply(order_content,rec_food); //推荐商品优惠添加进数组
		console.log(order_content)
		var openlevel = 0,level='';
		if($(".c_span").hasClass('click')){
			openlevel = 1;
			level=vlevel
		}

		if(psType == 1){//自提
			$.ajax({
	            url: '/include/ajax.php?service=waimai&action=deal',
	            data: {
	                shop: shopid,
	                address: cart_address_id,
	                order_content: JSON.stringify(order_content),
	                preset: JSON.stringify(preset),
	                note: note,
	                quanid: quanid,
					tprice:tprice,
					paytype:paytype,
					quantype:quantype,
					openlevel:openlevel,
					level:vlevel,
					peitype:psType,
					selftime:ztTime,
					phone:phone,
					usePinput:($('.integral .gou').hasClass('hasgou')?'1':'0')

	            },
	            type: 'post',
	            dataType: 'json',
	            success: function(data){
					if(data && data.state == 100){
                        utils.cleanStorage("wm_cart_"+shopid);

						var arr = data.info.split("|");

						if(arr[0]=="delivery"){

							location.href = apayUrl.replace("#ordernum",arr[1]);

						}else{

	                        var url = payUrl.replace("#ordernum", arr[0]);

	                        location.href = url + (url.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
						}

					}else{
						alert(data.info);
						t.removeAttr("disabled").html(langData['waimai'][2][40]);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][181]);
					t.removeAttr("disabled").html(langData['waimai'][2][40]);
				}
			});
		}else{
			if(confirm(langData['waimai'][3][75]+"\n"+selectAddress)){//是否确认配送到
				$.ajax({
		            url: '/include/ajax.php?service=waimai&action=deal',
		            data: {
		                shop: shopid,
		                address: cart_address_id,
		                order_content: JSON.stringify(order_content),
		                preset: JSON.stringify(preset),
		                note: note,
		                quanid: quanid,
						tprice:tprice,
						paytype:paytype,
						quantype:quantype,
						openlevel:openlevel,
						level:vlevel,
						usePinput:($('.integral .gou').hasClass('hasgou')?'1':'0')

					},
		            type: 'post',
		            dataType: 'json',
		            success: function(data){
						if(data && data.state == 100){
	                        utils.cleanStorage("wm_cart_"+shopid);

	                       if (typeof (data.info) == 'object') {
								info = data.info;
								orderurl = data.info.orderurl;
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

								// if (usermoney * 1 < info.order_amount * 1) {
								//
								// 	$("#moneyinfo").text('余额不足，');
								// }
							   if (usermoney * 1 < info.order_amount * 1) {

								   $("#moneyinfo").text('余额不足，');
								   $("#moneyinfo").closest('.pay_item').addClass('disabled_pay')
							   }else{
								   $("#moneyinfo").text('可用');
								   $("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
							   }
							   if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
								   $("#bonusinfo").text('额度不足，可用');
								   $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
							   }else if( bonus * 1 < info.order_amount * 1){
								   $("#bonusinfo").text('余额不足，');
								   $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
							   }else{
								   $("#bonusinfo").text('');
								   $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
							   }
								ordernum = info.ordernum;
								order_amount = info.order_amount;

								$("#ordertype").val('');
								$("#service").val('waimai');
								service = 'waimai';
								var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
								$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

						   }else {

	                       	   if( data.info.indexOf('|') > 0) {
								   var arr = data.info.split("|");

								   if (arr[0] == "delivery") {

									   location.href = apayUrl.replace("#ordernum", arr[1]);

								   } else if (arr[0] == "ok") {

									   location.href = arr[1];
								   } else {

									   var url = payUrl.replace("#ordernum", arr[0]);

									   location.href = url + (url.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
								   }

							   }else{
								   location.href = data.info;
							   }
						   }

						}else{
							alert(data.info);
							t.removeAttr("disabled").html(langData['waimai'][2][40]);
						}
					},
					error: function(){
						alert(langData['siteConfig'][20][181]);
						t.removeAttr("disabled").html(langData['waimai'][2][40]);
					}
				});
			}else{
				t.removeAttr("disabled").html(langData['waimai'][2][40]);
			}
		}


	});

	$(".place a, .quan a").click(function(e){
		// e.preventDefault();
		updateCarInfo();
	})

	function updateCarInfo(){
		var paytype = $(".pay_style .pay_bc").attr("id"), paypwd = $(".paypwd").val();
		var preset = [];
		$(".preset_item").each(function(){
			var p = $(this), tit = p.find("em").text(), val = p.find(".preset").val();
			preset.push({"title": tit, "value": val});
		});
		var note = $("#note").val();


		$.ajax({
			url: '/include/ajax.php?service=waimai&action=updateCart',
			type: 'get',
			data: {
                shop: shopid,
                address: cart_address_id,
                paytype: paytype,
                preset: JSON.stringify(preset),
                note: note,
                quanid: quanid,
                paypwd: paypwd
            },
			dataType: 'json',
			success: function(data){

			}
		})
	}



	// 准时宝
	$(".btn_agree span").click(function(){
		var type = $(this).parents('.btn_agree').attr('data-type');
		$(".mask,.xieyi_box[data-xy="+type+"]").show();
		return false;
	});

	$(".ontime_box p i").click(function(){
		$(".mask,.xieyi_box").show();
		return false;
	});


	$('.ontime_box').click(function(){

		$(this).toggleClass('click');
		countPrice(hui_click);
	})

	// 会员服务协议
	$(".xieyi_box .close").click(function(){
		$(".mask,.xieyi_box").hide();
	});

	$(".open_tip").click(function(){
		$(".mask").show();
		$(".aright_box").addClass('show')
	});
	$('.aright_box .close,.btn_close').click(function(){
		$(".mask").hide();
		$(".aright_box").removeClass('show')
	})






	// 滚动置顶
	$(window).scroll(function(){
		var scr = $(".main-cart").offset().top;
		if($(window).scrollTop()+20 >= scr){
			$('.left_order').addClass('fixedTop')
		}else{
			$('.left_order').removeClass('fixedTop')
		}
	});


	$('#cartList .car_info').each(function(){
        if($(this).text()!=''){
            var cartH1 = $(this).siblings('.car_title').find('.car_h1');
            cartH1.css('line-height','40px');
        }
    })


	// 勾选和取消会员服务

	$(".openvip .btn_agree").click(function(){
		var t = $(this);
		if(t.hasClass("click")){
			t.removeClass("click");
			$(".openvip .hui_box .c_span").removeClass("click");
			hui_click = 0;
			$("#huijian").addClass("fn-hide")
		}else{
			t.addClass("click");
			$(".openvip .hui_box .c_span").addClass("click");
			hui_click = 1;
			$("#huijian").removeClass("fn-hide")

		}
		countPrice(hui_click)
	});

	$(".openvip .hui_box").click(function(){
		$(".openvip .btn_agree").click();
	})

	// 勾选推荐商品
	var p = 0 , rec_food=[];  //推荐商品 的价格,推荐商品的数组
	$(".rec_box").delegate("li",'click',function(){
		var t = $(this);
		rec_food=[];
		t.toggleClass('click');

		var li_id = t.attr('data-id');
		var li_price = t.attr('data-price');
		var li_title = t.attr('data-title');
		var li_dabao = t.attr('data-dabao');  // 打包
		var li_nprice = t.attr('data-nprice');
		// var sum  = $('.totalFood em').text();
		var li_dis_value = t.attr('data-discount_value');

		// if(t.hasClass('click')){
		// 	sum= parseInt(sum) + 1;
		// }else{
		// 	sum= parseInt(sum) - 1;
		// }

		var tjprice =0;
		$('.totalFood em').text(sum);
		if($(".rec_box li.click").size()>0){
			$('.rec_box .rec_count').show();
			$(".rec_box li.click").each(function(){
				var r 			= $(this);
				var title 		= r.attr('data-title');//商品名
				var pic 		= r.attr('data-pic');//商品名
				var count 		= r.attr('data-count');  //数目
				var price 		= r.attr('data-price');  //价格
				var id 			= r.attr('data-id');   //id
				var dabao 		= r.attr('data-dabao');  //打包费
				var is_discount = r.attr('data-is_discount') ; //是否打折
				var discount_value = r.attr('data-discount_value'); // 商品
				var ntitle 		= r.attr('data-ntitle') ;
				var nprice 		= r.attr('data-nprice') ;
				var unit 		= r.attr('data-unit') ;
				var vpce        = r.attr('data-vprice') ;// 会员价格
				if((discount_value >= waimaiDiscount) && userinfovip['level']){
					//tjprice = ((price/ (discount_value*.1)).toFixed(2)) * waimaiDiscount *.1;
	                tjprice 	= (price*1/discount_value*waimaiDiscount).toFixed(2);

				}else{
					tjprice = price;
				}
				if((discount_value >= vip_discount) && $('.c_span').hasClass("click")){
				    tjprice 	= (price*1/discount_value*vip_discount).toFixed(2);
				}else{
					tjprice = price;
				}
	            r.attr('data-hui',tjprice);

				rec_food.push({
					'title' : title,
					'pic' : pic,
					'count' : count,
					'price' : price,
					'id' : id,
					'dabao' : dabao,
					'is_discount' : is_discount,
					'discount_value' : discount_value,
					'ntitle' : ntitle,
					'nprice' : nprice,
					'unit' : unit,
				});
			})
		}else{
			$('.rec_box .rec_count').hide();
		}

		if(t.hasClass('click')){

			var offset = $(".left_order").offset();//匹配元素相对于文档的偏移（位置）
			var img = t.find('img').attr('src'); //获取当前点击图片链接
			var scH = $(window).scrollTop();
			var btn = t.find('.gou').offset();
			var flyer = $('<img class="flyer-img" src="' + img + '">'); //抛物体对象
			flyer.fly({
				start: {
					left: btn.left - 50, //抛物体起点横坐标
					top: btn.top - scH - 30 //抛物体起点纵坐标
				},
				end: {
					left: offset.left + 15, //抛物体终点横坐标
					top: offset.top - scH, //抛物体终点纵坐标
					width: 15,
					height: 15

				},
				onEnd: function() {
					this.destroy(); //销毁抛物体
					$(".left_order").addClass('swing');
					setTimeout(function(){$(".left_order").removeClass('swing')},300);
				}
			});
			// 添加进去
			$('#cartList').append('<div class="car_t1 on_discount fn-clear" data-id="'+li_id+'"  data-dabao="'+li_dabao+'" data-price="'+li_price+'" data-discount_value="'+li_dis_value+'"><p class="car_title fn-clear"><span class="car_h1 fn-left">'+li_title+'</span><span class="car_h2 fn-left">1</span><em class="fn-right car_h3">'+echoCurrency("symbol")+li_price+'</em></p><p class="car_info"></p></div>');

		}else{
			$('#cartList div[data-id="'+li_id+'"]').remove()
		};



		 countPrice(hui_click)





	})

	$('.integral .gou').click(function(){
		var t = $(this);
		t.toggleClass('hasgou');
		countPrice(hui_click)
	})


	/* 由于推荐商品和购物车商品放在一起，只需要遍历已加购的商品 */
	function countPrice(gou){
		var ftotalPrice = 0 ; // 商品原总价-------未计算优惠价
		var fctotalPrice = 0;  // 总价1  ------ 未勾选买会员
		var fmtPrice = 0;  //总价2--------勾选会员
		var allcountTotalPrice = 0;
		var db_fee = 0;   //打包费统计
		var ps_now = delivery_fee;  //配送费
		var mjPrice = 0 , mjTxt = ''; //计算满减
		var ifdiscount = 0; //是否有商品打折
		quanFood = [];
		$("#cartList .car_t1").each(function(){
			var t = $(this);
			var id =  t.attr('data-id')
			var dis_value = Number(t.attr('data-discount_value'));  //折扣
			var price = Number(t.find('.car_h3').text().replace(echoCurrency("symbol"),''));  //未勾选会员的价格
			var oprice = t.hasClass("on_discount")?(price/dis_value*10):price;
			var nprice = price ;  //价格
			var num = Number(t.find(".car_h2").text())
			var dabao = (t.attr('data-dabao'))*1 * num; //打包费
			db_fee =  db_fee + dabao;  //计算所有商品 的打包费
			ftotalPrice = ftotalPrice + oprice * num ;
			fctotalPrice =  fctotalPrice + price * num ;
			if(t.hasClass("on_discount")){
				if(userinfovip['level'] || gou){   //是会员 或者 准会员

					if(dis_value < vip_discount && Number(vip_discount)!= 0  && dis_value != 0){
						ifdiscount = 1;
					}else{
						if(Number(vip_discount)){
							nprice = oprice * (Number(vip_discount)==0?10:Number(vip_discount)) / 10;
						}else{
							nprice = nprice
						}


					}
				}else{
					ifdiscount = 1;
				}
			}else{
				if(userinfovip['level'] || gou){
					nprice = oprice * (Number(vip_discount)==0?10:Number(vip_discount)) / 10;
				}
			}
            nprice = parseFloat(nprice.toFixed(2));

			fmtPrice =  nprice * num + fmtPrice ;   //会员折扣之后
            fmtPrice = parseFloat(fmtPrice.toFixed(2));

			quanFood.push({
				'id': id,
				'price' :nprice * num
			})
		});
		$("#huijian .fn-right em").text((fctotalPrice - fmtPrice).toFixed(2))

		food = JSON.stringify(quanFood);

		// 计算配送费
		var delievery = vlevel?(vlevel.privilege?vlevel.privilege.delivery[0]:delivery_fee):(privilege!=''?privilege.delivery[0]:"");
		var delievery_type = delievery?delievery.type:0;
		var delievery_val  = delievery?delievery.val:0;
		if(gou){
			if(delievery_type=="discount"){
				ps_now = delivery_fee * delievery_val /10;
			}else if(delievery_type=="count"){
				if(delievery_val>0){
					ps_now = 0;
				}
			}
		}else if(userinfovip['level']){
			if(delievery_type=="discount"){
				ps_now = delivery_fee * delievery_val /10;
			}else if(delievery_type=="count"){
                delievery_val = userinfovip.delivery_count;
				if(delievery_val>0){
					ps_now = 0;
				}
			}else{
				ps_now = delivery_fee;
			}

		}else{
			ps_now = delivery_fee;
		}
		var psType = $('.type_tab li.active').attr('data-type');//配送方式
		if(psType=='1'){
			ps_now = 0;
		}


		// 满减
		// if(promotions.length > 0 && !ifdiscount){
		if(promotions.length > 0 ){
			for(var i = 0; i < promotions.length; i++){
				if(promotions[i][0] > 0 && promotions[i][0] <= fctotalPrice){
					mjTxt = '<i class="icon_jian"></i>'+langData['waimai'][2][95]+'<span class="fn-right">满'+promotions[i][0]+'减'+promotions[i][1]+'元</span>';
					mjPrice = promotions[i][1];
				}
			}
		}

		if(mjPrice>0){
			$("#manjian").html(mjTxt).show();
		}else{
			$("#manjian").hide();
		}

		allcountTotalPrice = fmtPrice + db_fee - mjPrice + addservicePrice - first_discount ;


		if (delivery_fee_mode == 1 && delivery_fee_type == 2 && allcountTotalPrice >= delivery_fee_value) {
			ps_now = 0;
		}
		allcountTotalPrice +=ps_now;

		// var ptprofitprice = 0;

		// if(ptprofit * 1 !=0){



		// 	ptprofitprice = ((allcountTotalPrice -ps_now)  * ptprofit / 100) * 1;


		// 	$("#ptshouyi").show();
		// 	$('#ptshouyiPrice').html(ptprofitprice.toFixed(2));

		// }
		$("#peisongPrice").text(ps_now.toFixed(2));
        $(".ontime_box .tprice em").text((zsbproportion*(allcountTotalPrice /*+ptprofitprice*/) /100).toFixed(2))
          for(let zs=0; zs<zsbspe.length; zs++){
              if(zsbspe[zs].time !=0 ){
                  $(".ontime_box p em").eq(zs).text(echoCurrency("symbol") + (zsbspe[zs].proportion/100*(allcountTotalPrice /*+ptprofitprice*/)).toFixed(2));
              }
          }
        //console.log(fmtPrice , ps_now , db_fee , mjPrice , addservicePrice , first_discount)
		getquanList(gou,allcountTotalPrice,ps_now)


		// allcountTotalPrice += ptprofitprice;

		// 计算准时宝的价格
		console.log(allcountTotalPrice*1 + (gou?vip_price:0)*1 + ($(".ontime_box").hasClass("click")?(zsbproportion*(allcountTotalPrice /*+ptprofitprice*/)/100):0)*1)
		$(".car_tprice strong").text((allcountTotalPrice*1 /*+ ptprofitprice*/ + (gou?vip_price:0)*1 + ($(".ontime_box").hasClass("click")?(zsbproportion*allcountTotalPrice/100):0)*1).toFixed(2));
		var integralAll = allcountTotalPrice*1 + (gou?vip_price:0)*1 + ($(".ontime_box").hasClass("click")?(zsbproportion*allcountTotalPrice/100):0)*1
		check_intergal(integralAll)
		var apprice =  (allcountTotalPrice + (gou?vip_price:0) + ($(".ontime_box").hasClass("click")?(zsbproportion*(allcountTotalPrice /*+ptprofitprice*/)/100):0))
		if(apprice > offline_limit){
			$(".payType li[data-pay='1']").hide();
		}else{

			$(".payType li[data-pay='1']").show();
		}


	}

})





 function checkAuth(type){
	var type = type == undefined ? 'discount' : type;
	var r = {"type" : 0, "val" : 0};
	for(var i in privilege){
		if(i == type){
			r = privilege[i];
			break;
		}
	}
	return r;
}
function check_intergal(priceAll){
	// return  false;
	priceAll = Number(priceAll)
	if(hasPoint <= 0) return false;
	jifen_di = parseInt(jifen_ * priceAll * pointRatio / 100);
	jifen_di = hasPoint <= jifen_di ? hasPoint * 1  : jifen_di;
	jifen_di = Number(jifen_di);
	jian = parseFloat((jifen_di/pointRatio).toFixed(2));
	$(".integral .jifen").html(parseFloat(jifen_di.toFixed(2))) ;
	$(".integral .jian").html(parseFloat(jian.toFixed(2))) ;
	if($(".integral .gou").hasClass('hasgou')){
		$('.car_tprice strong').html(parseFloat((priceAll-jian).toFixed(2)));
	}else{
		$('.car_tprice strong').html(parseFloat(priceAll.toFixed(2)));
	}

	if(jifen_di == 0 || jian == 0){
  		$(".integral").hide()
  	}

  	if((priceAll-jian).toFixed(2) == 0){
		$(".car_button #tj").html(langData['siteConfig'][23][113]); //立即支付
	}
}
function DateToUnix(string) {
	var f = string.split(' ', 2);
	var d = (f[0] ? f[0] : '').split('-', 3);
	var t = (f[1] ? f[1] : '').split(':', 3);
	return (new Date(
		parseInt(d[0], 10) || null,
		(parseInt(d[1], 10) || 1) - 1,
		parseInt(d[2], 10) || null,
		parseInt(t[0], 10) || null,
		parseInt(t[1], 10) || null,
		parseInt(t[2], 10) || null
	)).getTime() / 1000;
}
