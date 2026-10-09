$(function(){
	var intergal_jian = 0;
	toggleDragRefresh('off');
	var hui_click = 0;  //未勾选会员
	var totalPrice = 0;
	var qtotalPrice = 0; //除优惠券之外的总价
	var totalzhe = 0.00; //折扣商品的总价
	var totalno = 0.00; //非折扣商品的总价
	var nurl = window.location.href;
	if(nurl.indexOf('openlevel=')>-1){
		openlevel = 1;
	}else{
		openlevel = 0;
	}


	var lng = '';
	var lat = '';

	 // 定位

	var localData = utils.getStorage('waimai_local');
	if(localData != null){
		var last = localData.time;
	}else{
		var last = 0;
	}
	var time = Date.parse(new Date());



  // 手动定位或10分钟内使用上次坐标

	if(local == 'manual' || (time - last < 60*10*1000)){
		var lat = localData.lat;
		var lng = localData.lng;
		utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': localData.address,site_map:site_map}));
	}else{
		HN_Location.init(function(data){
			if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {

			}else{

				lng = data.lng;
				lat = data.lat;
				 //精选品牌
				utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address':name,site_map:site_map}));
			}
		}, device.indexOf('huoniao') > -1 ? false : true);
	}

	$(".btn_agree span,.ontime_box p i").click(function(){
		$('.mask_gz').show();
		$('.pop_box[data-xy="zsb"]').animate({"bottom":"0"},300)
	});

	$(".cancel,.mask_gz").click(function(){
		$('.mask_gz').hide();
		$('.pop_box').animate({"bottom":"-88%"},300)
	})

	var cartId = []
	// 加载购物车内容
	var cartHistory = utils.getStorage("wm_cart_"+shopid), food = '[';
	var waimaiDiscount = shopin?10:(checkAuth('waimai')?checkAuth('waimai'):10);



	if(is_vipdiscount == 1 && userinfovip.level>0){
		waimaiDiscount = vipdiscount_value;
	}

	if(cartHistory){
		order_content = cartHistory;
		var list = [];
		var is_discount = 0;
		var zkprice = 0;
		var hui_jian_price = 0;
		$(".num_cart em").html(cartHistory.length)
		for(var i = 0; i < cartHistory.length; i++){
			if($('.rec_box li[data-id="'+cartHistory[i].id+'"]').size()>0){
				$('.rec_box li[data-id="'+cartHistory[i].id+'"]').remove();
				var rec_num = $('.rec_box li').length;
				if(rec_num==0){
					$(".rec_box").remove()
				}
				$('.rec_box h2').html(langData['waimai'][9][3].replace("1",rec_num))
			}
			//商品没打折之前的价格
            var price1 = cartHistory[i].is_discount == "1"?((cartHistory[i].price + cartHistory[i].nprice) / (cartHistory[i].discount_value/10)):(cartHistory[i].price + cartHistory[i].nprice);

          var price_ = price1;

			//会员价格与商品价格选择
			if(cartHistory[i].is_discount == "1"){

				//是否开启商品打折1-开启，2-关闭
				//判断会员价跟商品价格哪个优惠力度大

				if((cartHistory[i].discount_value >= waimaiDiscount) && userinfovip.level){
					//会员力度大
					var price = ((cartHistory[i].price + cartHistory[i].nprice) / (cartHistory[i].discount_value/10))* cartHistory[i].count;
					totalno += price;
				}else{
					var price = (cartHistory[i].price + cartHistory[i].nprice)*cartHistory[i].count;
					zkprice+= price; //这里主要是计算商品折扣力度大的时候 跟会员价格合并运算时候的问题(某个商品折扣力度大，该商品使用的是商品折扣的优惠，其他商品没设置商品折扣如果是会员就会按照会员价格计算)
					is_discount = 1;

				}

			}else{
				 var price = (cartHistory[i].price + cartHistory[i].nprice) * cartHistory[i].count;
			}

			// var price = (cartHistory[i].price + cartHistory[i].nprice) * cartHistory[i].count;



			// if (cartHistory[i].is_discount == 1 ){

			// 	is_discount = 1;

			// }

			totalno += (cartHistory[i].is_discount==0?price:0);
			foodTotalPrice += price;

			//打包费用

			if(cartHistory[i].dabao > 0 && shopin!=1){
				dabaoTotalPrice += cartHistory[i].dabao * cartHistory[i].count;
				$('.daba-fee').removeClass('fn-hide');
				$('.daba-fee .fee_num em').html(dabaoTotalPrice);
			}

			var price_before = price_;  //只为显示
			var nowPrice = price_ * waimaiDiscount/10;
			// console.log(price_ , waimaiDiscount)
			nowPrice = nowPrice>(cartHistory[i].price + cartHistory[i].nprice)?(cartHistory[i].price + cartHistory[i].nprice):nowPrice;
			list.push('<li class="li_con fn-clear '+(cartHistory[i].is_discount=="1"?"on_discount":"")+' " data-discount="'+(cartHistory[i].discount_value?cartHistory[i].discount_value:"0")+'"><div class="left_pro"><img onerror="this.src=\'/static/images/food.png\'" src="'+(cartHistory[i].pic?cartHistory[i].pic:staticPath+"images/shop.png")+'" /></div><div class="right_info"><h3>'+cartHistory[i].title+'</h3><p class="pro_des">规格：'+cartHistory[i].ntitle+'&nbsp;</p><p class="pro_num">x<em>'+cartHistory[i].count+'</em></p><span class="p_count">'+((cartHistory[i].is_discount=="1" || waimaiDiscount<10)?"<s class='oprice'>"+echoCurrency('symbol')+price_.toFixed(2)+"</s>":"")+'<em>'+echoCurrency("symbol")+'</em>'+nowPrice.toFixed(2)+'</span></div></li>');

			var price_price = cartHistory[i].price + cartHistory[i].nprice;
			food = food + '{"id": "'+cartHistory[i].id+'", "price": '+price_price.toFixed(2) * cartHistory[i].count + '},';
			if(cartHistory[i].is_discount!='1'){
				hui_jian_price = ((cartHistory[i].price + cartHistory[i].nprice)*cartHistory[i].count)*(1-vip_discount/10)+hui_jian_price*1;
			}else if(cartHistory[i].discount_value > vip_discount){
				let oprice = ((cartHistory[i].price + cartHistory[i].nprice)*cartHistory[i].count)/(cartHistory[i].discount_value/10)
				hui_jian_price = hui_jian_price*1 + oprice*(1-vip_discount/10);

			}



		}

		if(dabaoTotalPrice==0){
			$('.daba-fee').addClass('fn-hide');
		}

		food = food.substr(0, food.length-1);
		food = food + ']';
		$(".huijian_box .h_jian em,.hui_con h3 em").html(hui_jian_price.toFixed(2));  //会员减免费用

		// if(userinfo.level){



		// 	str = '<li class="hui authtxt auth_foodPrice"><img src="'+userinfo.levelIcon+'">商品原价享受'+waimaiDiscount+'折优惠</li>';

		// 	if(str){

		// 		$(".peisong-fee").before(str)

		// 		// $('#manjian').before(str);

		// 	}

		// }





		// 商品总价 && 打包费

		if(dabaoTotalPrice > 0){
			$(".daba-fee .fee_num em").html(dabaoTotalPrice); $("data -fee_num" ).htm
			$(".daba-fee").show();
		}



		// 满减

		var manjianTxt = "";
		if(promotions.length > 0  ){
			for(var i = 0; i < promotions.length; i++){
				// console.log(promotions[i][0]+'=='+foodTotalPrice +'==='+foodTotalPrice)
				if(promotions[i][0] > 0 && promotions[i][0] <= totalno ){
					manjianPrice = promotions[i][1];
				}
			}
		}



		if(manjianPrice > 0){
			$(".on_full").show();
			//$(".rec_box").hide();
			$(".on_full .price-hui em").html(manjianPrice)
		}else{
			$(".rec_box").show();
			$(".on_full").hide();
		}





		// 增值服务

		var addserviceTxt = "", nowt = Number(nowTime.replace(":", ""));
		if(addservice){
			for(var i = 0; i < addservice.length; i++){
				var tit = addservice[i][0], start = Number(addservice[i][1].replace(":", "")), end = Number(addservice[i][2].replace(":", "")), pri = parseFloat(addservice[i][3]);
				if(start < nowt && end > nowt && pri > 0){
					addserviceTxt += '<p><span class="fee_num">'+echoCurrency("symbol")+pri+'</span><span class="dis_tip">'+tit+'</span></p>';
					addservicePrice += pri;
				}
			}
		}

		$(".other-fee").html(addserviceTxt).show();



		//配送费



		//固定起送价、配送费
		if(delivery_fee_mode == 1){
			// console.log(delivery_fee);



			//满额减

			if(delivery_fee_type == 2 && foodTotalPrice >= delivery_fee_value){
				delivery_fee = 0;
				$(".peisong-fee .fee_num em").html(delivery_fee);
				$(".peisong-fee  .od_price").html(echoCurrency("symbol")+delivery_fee);
				if(delivery_fee < yuan_delievery_fee){
					$(".ps_tip").removeClass('fn-hide').find('em').html((yuan_delievery_fee-delivery_fee).toFixed(2))
				}
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

		if(delivery_fee > 0){
			$(".peisong-fee .fee_num em").html(delivery_fee);
			$(".peisong-fee .fee_num").attr('data-delivery',delivery_fee);
			$(".peisong-fee  .od_price").html(echoCurrency("symbol")+delivery_fee);
			if(delivery_fee < yuan_delievery_fee){
				$(".ps_tip").removeClass('fn-hide').find('em').html((yuan_delievery_fee-delivery_fee).toFixed(2))
			}
		}else{
           $(".hui_ps").hide();  //没有配送次数则隐藏会员优惠
        }







		//起送验证

		if(foodTotalPrice < basicprice){
			$(".bottom_box button").html(langData['waimai'][2][96]+basicprice+echoCurrency("short")+"（"+langData['waimai'][2][97]+(basicprice - foodTotalPrice)+echoCurrency("short")).attr("disabled", true);
		}else{
			if(instorestatus == 1 && underpay ==1){
				$('.bottom_box button').html(langData['waimai'][3][33])
			}else{
				$(".bottom_box button").html(langData['waimai'][2][40]).removeAttr("disabled");
			}

		}





		// 非普通会员计算优惠信息
		var auth_waimai_price = 0, auth_delivery_price = 0;	// 优惠金额
		if(userinfovip.level){
			// 减去会员折扣
			var auth = {}, str = '', newAmount = 0;

			if(str == ''){
				var newfoodTotalPrice = foodTotalPrice
				// waimaiDiscount = checkAuth('waimai');
				if(waimaiDiscount){
					if(is_discount == 1){
						newfoodTotalPrice-=zkprice;
					}
					auth_waimai_price = (newfoodTotalPrice  * (1 - waimaiDiscount / 10));
					// str = '<li class="hui authtxt auth_foodPrice"><img src="'+userinfovip.levelIcon+'">商品原价享受'+waimaiDiscount+'折优惠</li>';
				}
			}

			if(str){
				$(".peisong-fee").before(str)
				// $('#manjian').before(str);

			}



			// 配送费
			if(delivery_fee > 0){
				str = '';
				newAmount = 0;
				auth = checkAuth('delivery');
				str = '享受'+auth[0].val+'折优惠';

				// 打折
				if(auth[0].type == 'discount'){
					if(auth[0].val > 0 && auth[0].val < 10){
						auth_delivery_price = (delivery_fee * (1 - auth[0].val / 10));
						newAmount = delivery_fee - auth_delivery_price;
						$(".ps_tip").removeClass('fn-hide').find('em').html((delivery_fee*(1 - auth[0].val / 10)).toFixed(2))
					}else{
						str = '';
                        // $(".hui_ps").hide();  //没有配送次数则隐藏会员优惠
					}

				// 计次

				}else if(auth[0].type == 'count'){
					str = '会员享受免费配送服务';
					// 限次数
					if(auth[0].val > 0){
						if(userinfovip.delivery_count == 0){
							str = '';
                            $(".hui_ps").hide();  //没有配送次数则隐藏会员优惠

						}else{
							auth_delivery_price = delivery_fee > 0 ? delivery_fee : 0 ;
							newAmount = delivery_fee - auth_delivery_price;
							//str = '享受'+(delivery_fee > 3 ? '免3元配送费服务' : '免费配送服务')+'（剩余次数：'+userinfovip.delivery_count+'次）';
                          str = '免配送费'+'（剩余：'+userinfovip.delivery_count+'次）';
						  $(".ps_tip").removeClass('fn-hide').find('em').html(delivery_fee)
						}
					}else{
						str = '';
						$(".hui_ps").hide();  //没有配送次数则隐藏会员优惠
						auth_delivery_price = delivery_fee;
					}

				}

				if(str){ //alert(newAmount)
					$(".peisong-fee .fee_num em").html(newAmount.toFixed(2));
					$(".peisong-fee .v_tip").html(str)
					// $('#peisong').after(str);
				}else{
					$(".hui_ps").hide();  //没有配送次数则隐藏会员优惠
                }

			}









		}

		//总费用

		//商品总价 * 打折 - 满减 + 打包费 + 配送费 + 增值服务费 - 首单减免
		
		var youhuid = manjianPrice + first_discount + auth_delivery_price + (userinfovip.level?hui_jian_price:0) ;
		totalPrice = (foodTotalPrice  - manjianPrice + dabaoTotalPrice + delivery_fee + addservicePrice - first_discount-auth_waimai_price-auth_delivery_price ).toFixed(2);
		totalPrice = totalPrice < 0 ? 0 : totalPrice;
		qtotalPrice = totalPrice;


		$(".b_txt").attr('data-count',youhuid)


		// 以下注释 原因：多次改变显示的计算价格
		// $(".r_count em").html((totalPrice * 1).toFixed(2));
		$('.count_fee em').html(totalPrice);
		$('.ontime_box .tprice em').html((totalPrice  * 1* zsbproportion/100).toFixed(2));
		$(".ontime_box p em").each(function(){
			var t = $(this);
			var p = t.text()*1/100;
			t.text(echoCurrency("symbol")+(totalPrice*p).toFixed(2));
		})


		$(".b_txt em").text((youhuid+intergal_jian).toFixed(2));
		$('.hui_count em').html(echoCurrency("symbol")+(youhuid+intergal_jian).toFixed(2));
		$(".cart_con").html(list.join(""));


	}



	if(quanid){
		checkQuan('',totalPrice,delivery_fee)
	}

	if(shopin){
		$(".integral").hide()
	}


	$(".integral .gou").click(function(){
		var t = $(this);
		t.toggleClass('hasgou');
		countPrice(hui_click)

	})
	// 验证优惠券

	function checkQuan(a,total,delivery_feeprice){
		var data = [];
		var afood;
		data.push('shop='+shopid);

		if(food != '['){
		   afood = JSON.parse(food);
		}else{
		  afood = [];
		}

		afood.push.apply(afood,rfood);
		data.push('food='+JSON.stringify(afood));
		if(a){
			data.push('openlevel=1');
		}

		// 计算准时宝的价格

      $(".ontime_box .tprice em").text((zsbproportion*total/100).toFixed(2))
      for(let zs=0; zs<zsbspe.length; zs++){
        if(zsbspe[zs].time !=0 ){
          $(".ontime_box p em").eq(zs).text(echoCurrency("symbol") + (zsbspe[zs].proportion/100*total).toFixed(2));
        }

      }

      	delivery_feeprice = $('.peisong_price .fee_num em').text() * 1
		quan = 0;
        if(!shopin){
		$.ajax({

			url: '/include/ajax.php?service=waimai&action=quanList',
			type: 'post',
			data : data.join("&"),
			// async:false,
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var list = data.info.list, len = list==null?0:list.length;
					var txt = '', cls = '';
					if(len == 0){
						quanid = 0;
						txt = langData['waimai'][2][37];
						var zs_fee = $(".zs_btn").hasClass("click")?(zsbproportion*(total*1 + ptprofitprice)/100):0;
						check_intergal(total+(a?vip_price:0) + zs_fee,$('.b_txt em').text())
					}else{
						if(quanid > 0){
							var yh = youhuid
							for(var i = 0; i < len; i++){
								var obj = list[i];
								if(obj.id == quanid){
									var quanmoney = obj.money;
									quan = obj.money;
									if(obj.quantype){
										quantype = obj.quantype
									}else{
										quantype = 0
									}

									txt = quanmoney+echoCurrency("short")+langData['waimai'][2][98];
									total = total - quanmoney;
									total = total < 0 ? 0 : total;
									yh = yh*1 + quanmoney*1;
									cls = 'auto_chose';

									// $(".count_fee em,.ac_show span em").html(total.toFixed(2))
									var ptprofitprice = 0;
									if(ptprofit * 1 !=0){
										ptprofitprice = ((total - delivery_feeprice*1) * ptprofit / 100) * 1;
										ptprofitprice = ptprofitprice > 0 ? ptprofitprice:0
										$('.ptshouyi span').html(ptprofitprice.toFixed(2));

									}

									// total = (total* 1 + ptprofitprice).toFixed(2);
                                  // 计算准时宝的价格
									var intergalCount = 0;
									$(".ontime_box .tprice em").text((zsbproportion*(total*1+ptprofitprice)/100).toFixed(2));

                  if($(".zs_btn").hasClass('click')){
									//   $(".count_fee em,.ac_show span em").html((total*1 +ptprofitprice + zsbproportion*(total*1+ptprofitprice)/100 + (a?vip_price:0)).toFixed(2) );
										intergalCount = total*1 +ptprofitprice + zsbproportion*(total*1+ptprofitprice)/100 + (a?vip_price:0)
								  }else{

								  	//   $(".count_fee em,.ac_show span em").html((total*1 +ptprofitprice + (a?vip_price:0)).toFixed(2));
											intergalCount = total*1 +ptprofitprice + (a?vip_price:0)
								  }
								//   $(".count_fee em,.ac_show span em").html((total*1 + zsbproportion*(total*1+ptprofitprice)/100 + (a?vip_price:0)).toFixed(2))
									check_intergal(intergalCount,yh)
                                  for(let zs=0; zs<zsbspe.length; zs++){
                                    if(zsbspe[zs].time !=0 ){
                                      $(".ontime_box p em").eq(zs).text(echoCurrency("symbol") + (zsbspe[zs].proportion/100*(total*1+ptprofitprice)).toFixed(2));

                                    }

                                  }

									break;

								}


							}

							var url = $('.coupon_chose>a').attr("data-url");
							$('.coupon_chose>a').attr("href",url+"&quan="+quanid);

						}else if(quanid<0){

							var ptprofitprice = 0;

							if(ptprofit * 1 !=0){
								ptprofitprice = ((total- delivery_feeprice*1) * ptprofit / 100) * 1;
								ptprofitprice = ptprofitprice > 0 ? ptprofitprice:0
								$('.ptshouyi span').html(ptprofitprice.toFixed(2));

							}
							var intergalCount = 0;
							$(".ontime_box .tprice em").text((zsbproportion*(total*1 + ptprofitprice)/100).toFixed(2));
							if($(".zs_btn").hasClass('click')){
								// $(".count_fee em,.ac_show span em").html((total*1 + ptprofitprice + zsbproportion*(total*1 + ptprofitprice)/100 + (a?vip_price:0)).toFixed(2));
								intergalCount = total*1 + ptprofitprice + zsbproportion*(total*1 + ptprofitprice)/100 + (a?vip_price:0)

							}else{
								// $(".count_fee em,.ac_show span em").html(total*1+ ptprofitprice + (a?vip_price:0));
								intergalCount = total*1+ ptprofitprice + (a?vip_price:0);
							}
							for(let zs=0; zs<zsbspe.length; zs++){
								if(zsbspe[zs].time !=0 ){
									$(".ontime_box p em").eq(zs).text(echoCurrency("symbol") + (zsbspe[zs].proportion/100*(total*1+ptprofitprice)).toFixed(2));
								}
							}
							check_intergal(intergalCount,$('.b_txt em').text())
						}
						if(txt == ''){
							var intergalCount = 0;
							quanid = quanid == -1 ? - 1 : 0;
							if(data.info.yes == 0){
								txt = langData['waimai'][2][37];   //暂无优惠券

								var ptprofitprice = 0;
								if(ptprofit * 1 !=0){
									ptprofitprice = ((total- delivery_feeprice*1) * ptprofit / 100) * 1;
									ptprofitprice = ptprofitprice > 0 ? ptprofitprice:0
									$('.ptshouyi span').html(ptprofitprice.toFixed(2));

								}

								$(".ontime_box .tprice em").text((zsbproportion*(total*1 + ptprofitprice)/100).toFixed(2));
								if($(".zs_btn").hasClass('click')){
									// $(".count_fee em,.ac_show span em").html((total*1 + ptprofitprice + zsbproportion*(total*1 + ptprofitprice)/100 + (a?vip_price:0)).toFixed(2));

									intergalCount = total*1 + ptprofitprice + zsbproportion*(total*1 + ptprofitprice)/100 + (a?vip_price:0);  //积分计算前
								}else{
									// $(".count_fee em,.ac_show span em").html((total*1+ ptprofitprice + (a?vip_price:0)).toFixed(2));
									intergalCount = total*1+ ptprofitprice + (a?vip_price:0);
								}

								check_intergal(intergalCount,$('.b_txt em').text())
								for(let zs=0; zs<zsbspe.length; zs++){
									if(zsbspe[zs].time !=0 ){
										$(".ontime_box p em").eq(zs).text(echoCurrency("symbol") + (zsbspe[zs].proportion/100*(total*1+ptprofitprice)).toFixed(2));
									}
								}

							}else{
								txt = langData['waimai'][2][99].replace('1', data.info.yes);  //1张可用
								cls = 'coupon_num';
							}

						}





					}





					if(autoSelectQun && cls == 'coupon_num' && quanid == 0){
						autoSelectQun = false;
						quanid = data.info.good;
						$('.coupon_chose span').text('-'+echoCurrency("symbol")+list[0].money).addClass('auto_chose');
						total = total - list[0].money;
						total = total < 0 ? 0 : total;
						quan = list[0].money;
						var yh = youhuid + (hui_click?hui_jian_price*1:0);
                      	if(yh==0){
                          yh = quan*1;
                          $('.hui_count em').html(echoCurrency("symbol")+yh.toFixed(2));
                          $(".fee_info .b_txt em").html((yh+intergal_jian).toFixed(2));
                        }else{
                        	yh = yh*1 +quan*1 ;
                        	$('.hui_count em').html(echoCurrency("symbol")+(yh*1+intergal_jian).toFixed(2));
                            $(".fee_info .b_txt em").html((yh*1+intergal_jian).toFixed(2));
                        }

						if(list[0].quantype){
							quantype = list[0].quantype
						}else{
							quantype = 0
						}

						var ptprofitprice = 0;
						if(ptprofit * 1 !=0){
							ptprofitprice = ((total- delivery_feeprice*1) * ptprofit / 100) * 1;
							ptprofitprice = ptprofitprice > 0 ? ptprofitprice:0
							$('.ptshouyi span').html(ptprofitprice.toFixed(2));

						}

						// total = (total* 1 + ptprofitprice).toFixed(2);

						var intergalCount = 0;
						 // 计算准时宝的价格

                      $(".ontime_box .tprice em").text((zsbproportion*(total*1 + ptprofitprice)/100).toFixed(2))
                      for(let zs=0; zs<zsbspe.length; zs++){
                        if(zsbspe[zs].time !=0 ){
                          $(".ontime_box p em").eq(zs).text(echoCurrency("symbol") + (zsbspe[zs].proportion/100*(total*1 + ptprofitprice)).toFixed(2));
                        }
                      }

                      var zs_fee = $(".zs_btn").hasClass("click")?(zsbproportion*(total*1 + ptprofitprice)/100):0;
						total = total*1
						if(!a){
							// $(".r_count em").html((total + zs_fee + ptprofitprice).toFixed(2));
							$('.count_fee em').html((total + ptprofitprice).toFixed(2));
							intergalCount = total + zs_fee  + ptprofitprice+ (a?vip_price:0);
						}else{
							// $(".r_count em").html((total+vip_price +zs_fee+ ptprofitprice).toFixed(2));
							intergalCount = total+vip_price +zs_fee+ ptprofitprice+ (a?vip_price:0);
						}

						// console.log(quan,total)
						check_intergal(intergalCount,yh)
					}else{
						$('.coupon_chose span').text(txt).addClass(cls);
						// $('.hui_count em').html(echoCurrency("symbol")+(youhuid*1).toFixed(2));
						// $(".fee_info .b_txt em").html((youhuid*1).toFixed(2));
					}

				}else{

					 var ptprofitprice = 0;
					 if(ptprofit * 1 !=0){

						ptprofitprice = ((total- delivery_feeprice*1) * ptprofit / 100) * 1;
						ptprofitprice = ptprofitprice > 0 ? ptprofitprice:0
						$('.ptshouyi span').html(ptprofitprice.toFixed(2));

					  }
					  var zs_fee = $(".zs_btn").hasClass("click")?(zsbproportion*(total*1 + ptprofitprice)/100):0;
						$('.hui_count em').html(echoCurrency("symbol")+(youhuid*1).toFixed(2));
						$(".fee_info .b_txt em").html((youhuid*1).toFixed(2));
						$('.coupon_chose span').text(langData['waimai'][2][37]);
						$('.coupon_chose').addClass('hide_arr');
						// $(".r_count em").html((total*1 + ptprofitprice).toFixed(2));
						// $(".count_fee em").html((total*1 + ptprofitprice).toFixed(2));
						var intergalCount = total*1 + ptprofitprice+ (a?vip_price:0) + zs_fee;
						check_intergal(intergalCount,$('.b_txt em').text())
				}

			}

		})

        }else{
        	quan = -1



        }

	}

	var autoSelectQun = true;







	// 餐具选择显示

	$('.extra li').click(function(){
		var t = $(this);
		var id = t.attr('data-id')
		if(id!=undefined){
			$('.tware_chose').animate({'bottom':'0'},200);
			$('.mask_tableware').show();
			$('.tb_box[data-id="'+id+'"]').removeClass('fn-hide').addClass('show')
		}

	});



	// 关闭餐具选择

	$('.mask_tableware,.close_tware,.close_payway').on('click',function(){
		$('.mask_tableware').hide();
		$('.tb_box').addClass('fn-hide').removeClass('show')
		$('.tware_chose').animate({'bottom':'-5.6rem'},200);
		$('.payway_chose').animate({'bottom':'-2.8rem'},200);
	});



	// 付款方式显示

	$('.payway_chose dd').click(function(){
		var t = $(this),type = t.attr('data-type'),txt = t.html();
		$('.pay_way').html(txt);
		$('#paytype').val(txt);
		if(type==1){
			$('.bottom_box button').html('提交订单')
		}else{
			$('.bottom_box button').html('去支付')
		}

		$('.mask_tableware').click();  //关闭遮罩

	});



	// 付款方式

	$('.pay_way').click(function(){
		// console.log(totalPrice)
		if(totalPrice <= pay_offline_limit){
			$('.payway_chose').animate({'bottom':'0'},200);
			$('.mask_tableware').show();
		}else if(totalPrice>pay_offline_limit){
			$('.payway_null').addClass('show');
			$('.mask_tip').show();
		}

	});



	$('.mask_tip,.close_tip').click(function(){
		$('.mask_tip').hide();
		$('.payway_null').removeClass('show')
	})



	// 餐具选择

	$('.tware_chose li').click(function(){
		var t = $(this),num = t.attr('data-num'),txt = t.text();
		// console.log(num)
		// $('#fork_num').val(txt).attr('data-val',num)
		var id = $('.tware_chose .tb_box.show').attr('data-id');
		$('#extra'+id).val(txt)
		$('.mask_tableware').click();  //关闭遮罩

	});





	// 添加备注

	$('#note').click(function(){
		var val = $('#note').val();
		$('#txtarea').html(val);
		$('.remark_page').animate({"right":0},100);
	});



	$('.btn_remark').click(function(){
		var txt = $('#txtarea').text();
		// console.log(txt)

		$('#note').val(txt);
		$('.remark_page').animate({"right":"-100%"},100);

	});



	$('.remark_page .goBack').click(function(){
		$('.remark_page').animate({"right":"-100%"},100);
	})

	var oldDelivery_fee = delivery_fee;//保存初始配送费

	// 自取、外卖切换

	$('.addr_box .tab_li').click(function(){
		var t = $(this), index = t.index();
		t.addClass('active_li').siblings('.tab_li').removeClass('active_li');
		$('.tabcon_box .tab_con').eq(index).show().siblings('.tab_con').hide();
		if(index==1){
			delivery_fee = 0;//自提时配送费为0
			countPrice(hui_click);
          $('.ontime_box').hide();//准时宝
			// 百度地图

			if (site_map == "baidu") {
			  var map = new BMap.Map("map");
			  var mPoint = new BMap.Point(shop_lng, shop_lat);
			  var marker = new BMap.Marker(mPoint);
			  map.disableDragging();
			  setTimeout(function(){
			    map.centerAndZoom(mPoint, 16);
			    // map.addOverlay(marker);
			  }, 500);
			var labelHtml = '<div class="label-container"><div class="label-wrapper bounce "><div class="self-label">'+langData["waimai"][7][148]+ juli +'km</div><i class="label-bottom-icon"></i></div></div>';
			//气泡样式

			var labelStyle = {
			  color: "#fff",
			  borderWidth: "0",
			  padding: "0",
			  zIndex: "2",
			  backgroundColor: "transparent",
			  textAlign: "center",
			  fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'

			}



			var style = {
				transform:"translate(-50%,-100%)",
				background: "transparent",
				border: "none"
			};
			var opts = {
				position: new BMap.Point(shop_lng, shop_lat)
			};
			addLabel(labelHtml, opts, style, i);



			// 谷歌地图

			}else if (site_map == "google") {
			  var geocoder, marker,
			    mapOptions = {
			      zoom: 14,
			      center: new google.maps.LatLng(shop_lat, shop_lng),
			      zoomControl: false,
			      mapTypeControl: false,
			      streetViewControl: false,
			      fullscreenControl: false
			    }



			    $('.mapcenter').remove();
			    map = new google.maps.Map(document.getElementById('map'), mapOptions);



			    marker = new google.maps.Marker({
				    position: mapOptions.center,
				    map: map,
				    draggable:true,
				    animation: google.maps.Animation.DROP
				});

			    marker.setMap(map);

				var info = [];
		        info.push('<p>'+langData["waimai"][7][148]+ juli +'km</p>');
			    var infowindow = new google.maps.InfoWindow({
				  content:info.join("")
				  });

				infowindow.open(map,marker);

			}else if(site_map == 'amap'){//高德地图

		        var map = new AMap.Map('map', {
		                center: [shop_lng, shop_lat],
		                zoom: 15,
		            });
		        // 构造点标记
		        var marker = new AMap.Marker({
		            icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
		            position: [shop_lng, shop_lat]
		        });
		        map.add(marker);
		        //构建信息窗体中显示的内容
		        var info = [];
		        info.push('<p class="input-item">'+langData["waimai"][7][148]+ juli +'km</p>');
		        infoWindow = new AMap.InfoWindow({
		            content: info.join("")  //使用默认信息窗体框样式，显示信息内容
		        });
				// 打开信息窗体
				infoWindow.open(map,map.getCenter());
		    }






			function addLabel(labelHtml, labelOpts, style, index) {
				var label = new BMap.Label(labelHtml, labelOpts);
				label.setStyle(style);
				label.setZIndex(index);
				map.addOverlay(label)
			}

		}else{
			delivery_fee = oldDelivery_fee;
			countPrice(hui_click);
          $('.ontime_box').show();//准时宝
		}

	});

	formatTime(); //到点取货时间选择



	// 提交订单

	$('.bottom_box button,.btn_toPay').click(function(){
		var t = $(this);
		var psType = $('.tab_ul .active_li').attr('data-id');//配送方式
		var ztTime = $('.info_detail li.time').attr('data-time');//配送时间
		var phone  = $('#phone').val();
      	if(!psType){//非自提时 需要选择送餐地址
          if(!cart_address_id && !shopin){
              showErr(langData['waimai'][3][74]);
              return false;
          }
        }



		if(!order_content ){
			showErr(langData['siteConfig'][20][450]);//购物车是空的，请选择商品后再提交！
			return false;
		}

		if(psType ==1 && !ztTime){
			showErr(langData['waimai'][10][130]);//请选择自提时间
			return false;
		}

		if(psType ==1 && !phone){
			showErr(langData['waimai'][3][84]);//请填写手机号
			return false;
		}

		// if(psType ==1 &&!/1[0-9]{10}/.test(phone)){

		// 	alert(langData['siteConfig'][21][98]);   //请填写正确手机号

		// 	return false;

		// }

		var preset = [];
		$(".extra li").each(function(){
			var p = $(this), tit = p.find("label").text(), val = p.find("input").val();
			preset.push({"title": tit, "value": val});
		});



		var tprice = '';

		if($(".zs_btn").hasClass('click')){
			tprice = $('.ontime_box .tprice em').text()*1
		}else{
			tprice = ''

		}





		var note = $("#note").val();
		var paytype =  $('#paytype').val();
		order_content.push.apply(order_content,rec_food); //推荐商品优惠添加进数组



		t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");
		var openlevel = 0,level='';
		if($(".c_span").hasClass('click')){
			openlevel = 1;
			level = vlevel
		}



		if(!shopin){
			var peerpay = $(this).attr('data-paytype')
			if(psType == 1){	//自提
				$.ajax({
			        url: '/include/ajax.php?service=waimai&action=deal',
			        data: {
			            shop: shopid,
			            order_content: JSON.stringify(order_content),
			            preset: JSON.stringify(preset),
			            note: note,
			            quanid: quanid,
						paytype:paytype,
						tprice:tprice,
						quantype:quantype,
						openlevel:openlevel,
						level:level,
						desk:desk,
						peitype:psType,
						selftime:ztTime,
						phone:phone,
						peerpay:peerpay,
						usePinput:($('.integral .gou').hasClass('hasgou')?'1':'0')

					},
			        type: 'post',
			        dataType: 'json',
			        success: function(data){
						if(data && data.state == 100){
							setCookie("memeber","",-1);
							orderurl = data.info.orderurl;
			                if(device.indexOf('huoniao') > -1) {
			                    // setupWebViewJavascriptBridge(function (bridge) {
			                    //     bridge.callHandler('pageClose', {}, function (responseData) {
			                    //     });
			                    // });
			                }
			                if(data.info == '00000000000000000000000000'){
			                	showErr('点餐成功');
			                	//location.href = masterDomain+'/'+channelDomain;
			                }else{
								location.href = payUrl.replace("#ordernum", data.info);
			                }
						}else{
							showErr(data.info);
							t.removeAttr("disabled").html(langData['waimai'][2][40]);
						}
					},

					error: function(){
						showErr(langData['siteConfig'][20][181]);
						t.removeAttr("disabled").html(langData['waimai'][2][40]);
					}

				});

			}else{
				$(".mask_alert").show();
				var addr = $(".addr_info h2").text();
				$(".alertbox .alert_con h3").html(langData['waimai'][3][75]+"<br/>"+$(".addr_info h2").text())
				$(".alertbox").show();
				$(".alertbox .btns .sure").click(function(){
					$.ajax({
				        url: '/include/ajax.php?service=waimai&action=deal',
				        data: {
				            shop: shopid,
				            address: cart_address_id,
				            order_content: JSON.stringify(order_content),
				            preset: JSON.stringify(preset),
				            note: note,
				            quanid: quanid,
							paytype:paytype,
							tprice:tprice,
							quantype:quantype,
							openlevel:openlevel,
							level:level,
							desk:desk,
							peitype:psType,
							peerpay:peerpay,
							usePinput:($('.integral .gou').hasClass('hasgou')?'1':'0')


						},
				        type: 'post',
				        dataType: 'json',
				        success: function(data){
							if(data && data.state == 100){
								// setCookie("memeber","",-1);
								// orderurl = data.info.orderurl;
				                // if(device.indexOf('huoniao') > -1) {
				                //     // setupWebViewJavascriptBridge(function (bridge) {
				                //     //     bridge.callHandler('pageClose', {}, function (responseData) {
				                //     //     });
				                //     // });
								//
				                // }
				                orderurl = data.info.orderurl;

								if (typeof (data.info) == 'object') {

									info = data.info;
									$(".mask_alert").click();
									$("#amout").text(info.order_amount);
									$('.payMask').show();
									$('.payPop').css('transform','translateY(0)');

									// if(usermoney*1 < info.order_amount *1){
									//
									// 	$("#moneyinfo").text('余额不足，');
									// }
									if (usermoney * 1 < info.order_amount * 1) {

										$("#moneyinfo").text('余额不足，');
										$("#moneyinfo").closest('.check-item').addClass('disabled_pay')

										$('#balance').hide();
									}

									if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
										$("#bonusinfo").text('额度不足，');
										$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
									}else if( bonus * 1 < info.order_amount * 1){
										$("#bonusinfo").text('余额不足，');
										$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
									}else{
										$("#bonusinfo").text('');
										$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
									}

									ordernum     = info.ordernum;
									order_amount = info.order_amount;

									payCutDown('',info.timeout,info);

								}else {

									if( data.info.indexOf('|') > 0) {
										var arr = data.info.split("|");
										if (arr[0] == "ok" || arr[0] == 'peerpay') {

											location.replace(arr[1]);
										}else{

											location.href = payUrl.replace("#ordernum", data.info);

										}
									} else{

										if (data.info == '00000000000000000000000000') {
											showErr('点餐成功');
											//location.href = masterDomain+'/'+channelDomain;
										} else {
											location.href = data.info;

										}
									}
								}
							}else{
								showErr(data.info);
								t.removeAttr("disabled").html(langData['waimai'][2][40]);
							}

						},

						error: function(){
							showErr(langData['siteConfig'][20][181]);
							t.removeAttr("disabled").html(langData['waimai'][2][40]);
							$(".mask_alert").click();

						}

					});

				})

				$(".alertbox .btns .reset,.mask_alert").click(function(){
					t.removeAttr("disabled").html(langData['waimai'][2][40]);
					$(".mask_alert").hide();
					$(".alertbox").hide();
				})

				// if(confirm(langData['waimai'][3][75]+"\n"+$(".addr_info h2").text())){

				// 	$.ajax({

				//         url: '/include/ajax.php?service=waimai&action=deal',

				//         data: {

				//             shop: shopid,

				//             address: cart_address_id,

				//             order_content: JSON.stringify(order_content),

				//             preset: JSON.stringify(preset),

				//             note: note,

				//             quanid: quanid,

				// 			paytype:paytype,

				// 			tprice:tprice,

				// 			quantype:quantype,

				// 			openlevel:openlevel,

				// 			level:level,

				// 			desk:desk,

				// 			peitype:psType



				//         },

				//         type: 'post',

				//         dataType: 'json',

				//         success: function(data){

				// 			if(data && data.state == 100){

				// 				setCookie("memeber","",-1);

				//                 if(device.indexOf('huoniao') > -1) {

				//                     setupWebViewJavascriptBridge(function (bridge) {

				//                         bridge.callHandler('pageClose', {}, function (responseData) {

				//                         });

				//                     });

				//                 }

				//                 if(data.info == '00000000000000000000000000'){

				//                 	alert('点餐成功');

				//                 	//location.href = masterDomain+'/'+channelDomain;

				//                 }else{



				// 				location.href = payUrl.replace("#ordernum", data.info);

				//                 }

				// 			}else{

				// 				alert(data.info);

				// 				t.removeAttr("disabled").html(langData['waimai'][2][40]);

				// 			}

				// 		},

				// 		error: function(){

				// 			alert(langData['siteConfig'][20][181]);

				// 			t.removeAttr("disabled").html(langData['waimai'][2][40]);

				// 		}

				// 	});

				// }else{

				// 	t.removeAttr("disabled").html(langData['waimai'][2][40]);

				// }

			}



		}else{
			$.ajax({
			        url: '/include/ajax.php?service=waimai&action=deal',
			        data: {
			            shop: shopid,
			            order_content: JSON.stringify(order_content),
			            preset: JSON.stringify(preset),
			            note: note,
			            quanid: quanid,
						paytype:paytype,
						tprice:tprice,
						quantype:quantype,
						level:level,
						desk:desk,
						lng:lng,
						lat:lat,

			        },

			        type: 'post',
			        dataType: 'json',
			        success: function(data){
						if(data && data.state == 100){
							setCookie("memeber","",-1);


							if (typeof (data.info) == 'object') {

								info = data.info;
								$("#amout").text(info.order_amount);
								$('.payMask').show();
								$('.payPop').css('transform','translateY(0)');
								//
								// if(usermoney*1 < info.order_amount *1){
								//
								// 	$("#moneyinfo").text('余额不足，');
								// }
								if (usermoney * 1 < info.order_amount * 1) {

									$("#moneyinfo").text('余额不足，');
									$("#moneyinfo").closest('.check-item').addClass('disabled_pay')

									$('#balance').hide();
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


								ordernum     = info.ordernum;
								order_amount = info.order_amount;

								payCutDown('',info.timeout,info);

							}else {
								if(device.indexOf('huoniao') > -1) {
									orderurl = data.info.orderurl;
									// setupWebViewJavascriptBridge(function (bridge) {
									//     bridge.callHandler('pageClose', {}, function (responseData) {

									//     });

									// });

								}

								location.href = payUrl.replace("#ordernum", data.info);
							}

						}else{
							showErr(data.info);
							t.removeAttr("disabled").html(langData['waimai'][2][40]);

						}

					},

					error: function(){
						showErr(langData['siteConfig'][20][181]);
						t.removeAttr("disabled").html(langData['waimai'][2][40]);
					}

				});

		}





	});



	// 选择提货时间

	$('.info_detail .time').click(function(){
		$('.mask_timechose').show();
		$('.time_chose').animate({"bottom":0},150)
	});



	$('.close_time,.mask_timechose').click(function(){
		$('.time_chose').animate({"bottom":"-5.6rem"},150);
		$('.mask_timechose').hide();
	});



	$('.left_day').delegate('li','click',function(){
		var t = $(this),today = t.attr('data-today');
		t.addClass('on_chose').siblings('li').removeClass('on_chose');
		if(today=='1'){
			$('.right_time li.hide').hide();
		}else{
			$('.right_time li.hide').show();
		}

	});

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

	$('.right_time').delegate('li','click',function(){
		var t = $(this);
		var date = $('.left_day .on_chose').text();
		$('#time').val(date+'  '+t.text());
		$('.mask_timechose').click();
		var ymd = $('.left_day li.on_chose').attr('data-date')+' '+t.text()+':00';
		var ymd2 = DateToUnix(ymd);
		$('.info_detail .time').attr('data-time',ymd2);

	});





	// 20200309新增vip功能



	//初始自动选择
	// console.log(totalPrice)
	checkQuan('',totalPrice,delivery_fee);



	$(".btn_agree2 span").click(function(){
		$('.mask_gz').show();
		$('.pop_box[data-xy="vip"]').animate({"bottom":"0"},300)
	})



	// 20200316修改

	var rec_food = [];
	var rfood = [];
	var quan = 0;



	function countPrice(gou){    //gou表示是否勾选买会员
		var ftotalPrice = 0 ; // 商品原总价-------未计算优惠价
		var fctotalPrice = 0;  // 总价1  ------ 未勾选买会员
		var fmtPrice = 0;  //总价2--------勾选会员
		var cartPrice = 0; //购物车内的商品价格
		var cartHistory = utils.getStorage("wm_cart_"+shopid);
		var allcountTotalPrice = 0;
		var db_fee = 0;   //打包费统计
		var mjPrice = 0 , mjTxt = ''; //计算满减
		var ifdiscount = 0; //是否有商品打折
		var ps_now = delivery_fee;
		var recPrice = 0; //选中的推荐商品的价格
		var ftotalno = totalno;

		rec_food = []; //选中的推荐商品
		rfood = [];

		// 计算配送费

		var delievery = vlevel?(vlevel.privilege?vlevel.privilege.delivery[0]:delivery_fee):(privilege!=''?privilege.delivery[0]:"");
		var delievery_type = delievery?delievery.type:0;
		var delievery_val  = delievery?delievery.val:0;

		if(gou){
			if(delievery_type=="discount"){
				ps_now = delivery_fee * delievery_val /10;
				$(".ps_tip").removeClass('fn-hide').find('em').html((yuan_delievery_fee-ps_now).toFixed(2))

			}else if(delievery_type=="count"){
                //delievery_val = userinfovip.delivery_count;
				if(delievery_val>0){
					ps_now =  0 ;
					$(".ps_tip").removeClass('fn-hide').find('em').html((yuan_delievery_fee-ps_now).toFixed(2))
				}

			}

		}else if(userinfovip['level']){
			if(delievery_type=="discount"){
				ps_now = delivery_fee * delievery_val /10;
				// $(".ps_tip").removeClass('fn-hide').find('em').html((yuan_delievery_fee-ps_now).toFixed(2))

				$(".ps_tip").removeClass('fn-hide').find('em').html((delivery_fee - ps_now).toFixed(2))

			}else if(delievery_type=="count"){
                delievery_val = userinfovip.delivery_count;
				if(delievery_val>0){
					ps_now = 0 ;
					// $(".ps_tip").removeClass('fn-hide').find('em').html((yuan_delievery_fee-ps_now).toFixed(2))
					$(".ps_tip").removeClass('fn-hide').find('em').html((delivery_fee-ps_now).toFixed(2))
				}

			}else{
				ps_now = $(".peisong_price .fee_num em").text()*1;
				if(delivery_fee > ps_now){
				// if(yuan_delievery_fee > ps_now){
					// $(".ps_tip").removeClass('fn-hide').find('em').html((yuan_delievery_fee-ps_now).toFixed(2));
					$(".ps_tip").removeClass('fn-hide').find('em').html((delivery_fee-ps_now).toFixed(2));
				}else{
					$(".ps_tip").addClass('fn-hide')
				}

			}


		}else{
			// ps_now = $(".peisong_price .fee_num em").text()*1;
			ps_now = $(".peisong_price .fee_num").attr('data-delivery');
			ps_now = Number(ps_now)
			if(delivery_fee>ps_now){
			// if(yuan_delievery_fee>ps_now){
				// $(".ps_tip").removeClass('fn-hide').find('em').html(yuan_delievery_fee-ps_now);
				$(".ps_tip").removeClass('fn-hide').find('em').html((delivery_fee-ps_now).toFixed(2));
			}else{

				$(".ps_tip").addClass('fn-hide')

			}

		}

		var psType = $('.tab_ul .active_li').attr('data-id');//配送方式
		if(psType){
			ps_now = 0;
		}





		if(cartHistory){  //计算购物车内的价格

			for(let i = 0; i < cartHistory.length ; i++){

				var price_y = cartHistory[i].is_discount=="1"?(cartHistory[i].price + cartHistory[i].nprice)/(cartHistory[i].discount_value/10):(cartHistory[i].price + cartHistory[i].nprice);  //商品原价；

				ftotalPrice = price_y * cartHistory[i].count + ftotalPrice; //商品未打折之前的总价；

				fctotalPrice = (cartHistory[i].price + cartHistory[i].nprice) * cartHistory[i].count +  fctotalPrice ;  //未勾选买会员之前的价格

				db_fee = db_fee +   cartHistory[i].dabao * cartHistory[i].count; //计算购物车内的打包费

				var dis_value = cartHistory[i].is_discount=="1"?cartHistory[i].discount_value:0;

				if(gou){

					/*

					  勾选会员折后，未打折商品暗会员折扣计算

					  打折商品按会员优惠

					*/

				    var price_z = cartHistory[i].is_discount=="0" ? ((cartHistory[i].price + cartHistory[i].nprice)*vip_discount/10) :(cartHistory[i].discount_value > vip_discount?(price_y*vip_discount/10):(cartHistory[i].price + cartHistory[i].nprice));   //折后价
                    price_z = parseFloat(price_z.toFixed(2));

					fmtPrice =  price_z * cartHistory[i].count + fmtPrice;

				}else {
					if(userinfovip['level']){

						var price_z = cartHistory[i].is_discount=="0" ? ((cartHistory[i].price + cartHistory[i].nprice)*vip_discount/10) :(cartHistory[i].discount_value > vip_discount?(price_y*vip_discount/10):(cartHistory[i].price + cartHistory[i].nprice));   //折后价
                        price_z = parseFloat(price_z.toFixed(2));

						fmtPrice =  price_z * cartHistory[i].count + fmtPrice;

					}else{
						fmtPrice = fctotalPrice ; //未勾选购会员
					}

				}
				if(cartHistory[i].discount_value <= vip_discount && cartHistory[i].is_discount=="1"){
					// console.log(cartHistory[i].discount_value,vip_discount)
						ifdiscount = 1;

				}
                fmtPrice = parseFloat(fmtPrice.toFixed(2));
				cartPrice = fmtPrice;

			}
		}

		// 计算推荐商品的价格
		var tjprice = 0;
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
				var discount_value = r.attr('data-discount_value'); // 商品折扣
				var ntitle 		= r.attr('data-ntitle') ;
				var nprice 		= Number(r.attr('data-price')) ;  //现在的价格
				var unit 		= r.attr('data-unit') ;
				var price_y 	= Number(r.attr('data-oprice'));  //原价
				var id_dabao 	= Number(r.attr('data-isdabao'));  //开启打包费


				db_fee = db_fee + dabao*1 ;  //打包费



				if(gou){
					if(discount_value*1 > vip_discount){
						nprice = price_y * vip_discount / 10  //会员优惠大，使用会员优惠
						ftotalno +=  price_y;
					}

				}else{

					if((discount_value >= waimaiDiscount && waimaiDiscount!=0) && userinfovip['level']){
					    nprice = (price_y*waimaiDiscount/10);
					    ftotalno +=  price_y;
					}



				}

				if(discount_value*1 <= vip_discount){
						ifdiscount = 1;
				}

				rec_food.push({
					'title' : title,
					'pic' : pic,
					'count' : count,
					'price' : price,
					'id' : id,
					'dabao' : dabao,
					'is_discount' : is_discount,
					'ntitle' : ntitle,
					'nprice' : nprice,
					'unit' : unit,
					'count':1,

				});



				r.attr('data-hui',nprice);

				// console.log(fmtPrice ,nprice)

				fmtPrice =  fmtPrice + nprice ;



				fctotalPrice = fctotalPrice + Number(r.attr('data-price'));
				ftotalPrice  = ftotalPrice + Number(r.attr('data-oprice'));
				recPrice = recPrice + nprice + dabao*1;

				rfood.push({
					"id"    : id,
					"price" : nprice
				});

			});

			$('.rec_box .rec_count em').text(recPrice.toFixed(2));



		}else{

			recPrice = 0;
			$('.rec_box .rec_count').hide();
			$('.rec_box .rec_count em').text(recPrice.toFixed(2));

		}





		// 计算满减

		if(promotions.length > 0  ){
			for(var i = 0; i < promotions.length; i++){
				if(promotions[i][0] > 0 && promotions[i][0] <= ftotalno ){
					mjPrice = promotions[i][1];
					// console.log("满"+promotions[i][0]+"减"+promotions[i][1])

				}
			}
		}



		if(mjPrice>0){

			$(".on_full").show().find(".price-hui em").text(mjPrice)

		}else{

			$(".on_full").hide()

		}



		db_fee = shopin?0:db_fee;



		// allcountTotalPrice =  fmtPrice + db_fee + ps_now - mjPrice + addservicePrice - first_discount;
		allcountTotalPrice =  fmtPrice + db_fee  - mjPrice + addservicePrice - first_discount;


		if (delivery_fee_mode == 1 && delivery_fee_type == 2 && allcountTotalPrice >= delivery_fee_value) {
			ps_now = 0;
		}
		allcountTotalPrice += ps_now;
		// quanid = 0;

		$(".peisong_price .fee_num em").text(ps_now.toFixed(2))
		// 计算优惠券价格

		if(quanid!=-1){

			autoSelectQun = true,quanid = 0;

		}
		var zs_fee = $(".ontime_box .tprice em").text()

		// var ptprofitprice = 0;

		var zhifuprice = allcountTotalPrice + (gou?vip_price:0);




		checkQuan(gou,allcountTotalPrice,ps_now)






		// console.log(allcountTotalPrice,zhifuprice,ptprofitprice);



		// $(".ac_show em").text((allcountTotalPrice + (gou?vip_price:0) +($(".zs_btn").hasClass("click")?(zs_fee*1):0)).toFixed(2));  //底部价格总计



		$(".count_fee em").text((cartPrice*1 + ps_now - mjPrice - first_discount + dabaoTotalPrice ).toFixed(2));  //购物车价格总计
		console.log((cartPrice*1 + ps_now - mjPrice - first_discount + dabaoTotalPrice))


	}



// 显示远距离配送费明细
$(".peisong_distance .dis_tip s").click(function(){
	$(".orTopMask").show();
	$(".orTop").css('transform','translateY(0)')
})

// y隐藏配送明细
$(".orTopMask,.cancelRules").click(function(){
	$(".orTopMask").hide();
	$(".orTop").css('transform','translateY(100%)')
})




  	//countPrice(); //初次进入计算价格

	$(".hui_box").click(function(){
		var t = $(this);
		if(t.find(".c_span").hasClass("click")){
			t.find(".c_span").removeClass("click");
			$(".btn_agree2").removeClass('click');
			$(".hp_show").hide();
            $(".huijian_box").addClass("fn-hide")
			hui_click = 0 ;
			 $(".huijian_box").addClass("fn-hide")
			$(".peisong_price .hui_ps").addClass('fn-hide');
			setCookie('huiyuan', 1, 2); //设置两分钟的cookie
		}else{
			t.find(".c_span").addClass("click");
			$(".btn_agree2").addClass('click');
			$(".hp_show").show();
			hui_click = 1;
      $(".huijian_box").removeClass("fn-hide")
			$(".peisong_price .hui_ps").removeClass('fn-hide');
			setCookie('huiyuan', '', -1); //设置两分钟的cookie

		}

		countPrice(hui_click);

	});



	$(".btn_agree2").click(function(){
		$(".hui_box").click()
	})



	// 勾选推荐商品

	$(".rec_box").delegate("li",'click',function(){
		var t = $(this);
		t.toggleClass("click");
		$(".rec_count").show();

		countPrice(hui_click);

	});



	// 准时宝

	$('.zs_btn').click(function(){
		var t = $(this);
		t.toggleClass('click');
    $(".ontime_box .btn_agree").toggleClass('click')
		countPrice(hui_click);

	});

	$(".btn_agree i").click(function(){
		$('.zs_btn').click()
	});



  //弹窗显示隐藏

  $(".open_tip").click(function(){
		$(".mask_right,.aright_box").show();
	});

	$(".mask_right,.btn_close").click(function(){
		$(".mask_right,.aright_box").hide();
	})



});

























var dates={



//获取日期

    FunGetDateStr: function (p_count) {

        var dd = new Date();

        dd.setDate(dd.getDate() + p_count);//获取p_count天后的日期

        var y = dd.getFullYear();

        var m = dd.getMonth() + 1;//获取当前月份的日期

        var d = dd.getDate();

		var w = dd.getDay();

		var dayTo = ''

		if(w==0){

			dayTo ='('+langData['siteConfig'][34][5][0]+')';         /* 周一*/

		}else if(w==1){

			dayTo ='('+langData['siteConfig'][34][5][1]+')';        /* 周二 */

		}else if(w==2){

			dayTo ='('+langData['siteConfig'][34][5][2]+')';        /* 周三 */

		}else if(w==3){

			dayTo ='('+langData['siteConfig'][34][5][3]+')';        /* 周四 */

		}else if(w==4){

			dayTo ='('+langData['siteConfig'][34][5][4]+')';         /* 周五 */

		}else if(w==5){

			dayTo ='('+langData['siteConfig'][34][5][5]+')';        /* 周六 */

		}else if(w==6){

			dayTo ='('+langData['siteConfig'][34][5][6]+')';        /* 周日 */

		}

		var dateData = {

			y : dd.getFullYear(),

			m : dd.getMonth() + 1,//获取当前月份的日期

			d : dd.getDate(),

			w : dayTo,

		}

        return dateData;

    },

	FunGetTimeStr:function(start,p_time,end){

		var dd = new Date(start);

		dd.setDate(dd.getMinutes()() + p_time);//获取p_time分钟后的时间

		var y = dd.getFullYear();

		var m = dd.getMonth() + 1;//获取当前月份的日期

		var d = dd.getDate();

		var w = dd.getDay();

	},



    //获取当前时间

    FunGetDate: function () {

        var date = new Date(); //日期对象

        var now = "";

        now = date.getFullYear() + "-";

        now = now + (date.getMonth() + 1) + "-";//取月的时候取的是当前月-1如果想取当前月+1就可以了

        now = now + date.getDate() + " ";

        now = now + date.getHours() + ":";

        now = now + date.getMinutes() + ":";

        now = now + date.getSeconds() + "";

        return now;

    },





}







 var Today = dates.FunGetDate();

 var days = 3;



 function formatTime(){

	 var list_left = [],list_right = [];

	 var right_ul = [];

	 // 左侧日期

	 for(var i = 0; i<days; i++){

		var dayD = dates.FunGetDateStr(+i);

		var daytxt='',dayId=dayD.y+'-'+dayD.m+'-'+dayD.d;

		if(i==0){

			daytxt = '今天'+dayD.w;



		}else if(i==1){

			daytxt = '明天'+dayD.w;

		}else{

			daytxt = dayD.m+'月'+dayD.d+'日'+dayD.w

		}

		list_left.push('<li class="'+(i?"":"on_chose")+'"  data-today="'+(i?0:1)+'" data-date= "'+dayId+'">'+daytxt+'</li>');

	 }

	 // 右侧时间

	 var nowDate = new Date();

	 var h = nowDate.getHours();

	 var nowmin = nowDate.getMinutes();
	 for(var i=0; i<24; i++){
		 for(var m=0; m<(60/20); m++){//20分钟一间隔
			 var min = m?((m*20==60?(m*20-1):m*20)):"00";
			 var cls = "";
			 if(i<h  ||(i==h && nowmin>(min*1))){
				cls = "hide" ;
			 }

			 right_ul.push('<li class="'+cls+'">'+i+':'+min+'</li>');

		 }

	 }

	 $('.left_day ul').html(list_left.join(''));
	 $('.right_time ul').html(right_ul.join(''));







 }



 function checkAuth(type){

	var type = type == undefined ? 'discount' : type;
	var r = 10;  //没有折扣
	for(var i in privilege){
		if(i == type){
			r = privilege[i];
			break;
		}

	}

	return r;

}











 /**

      * 设置cookie

      * @param name cookie的名称

      * @param value cookie的值

      * @param day cookie的过期时间

      */

    function setCookie(name, value, min) {
       if(min !== 0){     //当设置的时间等于0时，不设置expires属性，cookie在浏览器关闭后删除
         var expires = 5 *  60 * 1000;
         var date = new Date(+new Date()+expires);
         document.cookie = name + "=" + escape(value) + ";expires=" + date.toUTCString();

       }else{

         document.cookie = name + "=" + escape(value);

       }

     };







var showErrTimer;

function showErr(data) {
	showErrTimer && clearTimeout(showErrTimer);
	$(".popErr").remove();
	$("body").append('<div class="popErr"><p>' + data + '</p></div>');
	$(".popErr p").css({
		"margin-left": -$(".popErr p").width() / 2,
		"left": "50%"
	});

	$(".popErr").css({
		"visibility": "visible"
	});

	showErrTimer = setTimeout(function() {
		$(".popErr").fadeOut(300, function() {
			$(this).remove();
		});

	}, 1500);

 }

function check_intergal(priceAll,huiCount){
	
	if(hasPoint <= 0) {
		$('.ac_show em').html(parseFloat(priceAll.toFixed(2)));
		return false
	};
	var gou = $(".integral .gou").hasClass('hasgou');
  	huiCount = $(".b_txt").attr('data-count')
	huiCount = Number(huiCount);
	jifen_di = parseInt(jifen_ * priceAll  * pointRatio / 100);
	jifen_di = hasPoint <= jifen_di ? hasPoint : jifen_di;
	jian = parseFloat((jifen_di/pointRatio).toFixed(2));
	// jian = gou?jian:0;
	jifen_di = Number(jifen_di);
	$(".integral .jifen").html(parseFloat(jifen_di.toFixed(2))) ;
	$(".integral .jian").html(parseFloat(jian.toFixed(2))) ;
	if(jifen_di == 0 || jian == 0){
		$('.integral').hide();
	}
	$(".hui_count em").html(echoCurrency('symbol') + parseFloat((huiCount + (gou?jian:0)).toFixed(2)))
	$(".b_txt em").html(parseFloat((huiCount + (gou?jian:0)).toFixed(2)))
	if($(".integral .gou").hasClass('hasgou')){
		$('.ac_show em').html(parseFloat((priceAll-jian).toFixed(2)));
		$('.count_fee em').html(parseFloat((priceAll-jian).toFixed(2)));
	}else{
		$('.ac_show em').html(parseFloat(priceAll.toFixed(2)));
		// $('.ac_show em').html(parseFloat(priceAll.toFixed(2)));
	}

	if((priceAll-jian).toFixed(2) == 0){
		$(".bottom_box button").html(langData['siteConfig'][23][113]); //立即支付
	}
}
