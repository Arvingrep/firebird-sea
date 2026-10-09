$(function(){
	var url = window.location.href;
	var choseid;
	if(url.indexOf('quan=')>-1){
		choseid = url.substring((url.indexOf('quan=')+5));
	}
	
	if(url.indexOf('openlevel=')>-1){
		openlevel = 1;
	}else{
		openlevel = 0;
	}
	
	// 如果从个人中心进来
	if(url.indexOf('type=no')>-1){
		$(".cancel ").remove();
	}


	//加载购物车内容
	var cartHistory = utils.getStorage("wm_cart_"+shopid), food = '[';
	if(cartHistory){

		order_content = cartHistory;

		var list = [];
		for(var i = 0; i < cartHistory.length; i++){

			var price_price = cartHistory[i].price + cartHistory[i].nprice;
			food = food + '{"id": "'+cartHistory[i].id+'", "price": '+price_price * cartHistory[i].count + '},';

		}

		food = food.substr(0, food.length-1);
	}

	food = food + ']';
	
	function getList(){
		var data = [];
		data.push('shop='+shopid);
		data.push('food='+food);
		$.ajax({
			url: '/include/ajax.php?service=waimai&action=quanList',
			type: 'post',
			data : data.join("&"),
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var list = data.info.list, len = list.length, html = [];
					choseid = choseid?choseid:data.info.good;
					choseid = url.indexOf('type=no')>-1?0:choseid;
					for(var i = 0; i < len; i++){
						var obj = list[i], item = [];
						var shopList = obj.shopList, foodList = obj.foodList;

						var limit = [];
						var quanToUrl = url.indexOf('type=no')>-1?waimaiUrl:( obj.fail == 1 ? 'javascript:;' : cartUrl.replace('#quan', obj.id) )
		
						if(shopList.length > 0){
							if(shopList.length > 3){
								limit.push(langData['waimai'][2][110].replace('1', shopList[0]).replace('2', shopList.length));   /* 限1等2家店铺使用*/
							}else{
								limit.push(langData['waimai'][2][111].replace('1', shopList.join("、")));   /* 限1使用*/
							}
						}
						if(foodList.length > 0){
							if(foodList.length > 3){
								limit.push(langData['waimai'][2][112].replace('1', foodList[0]).replace('2', foodList.length));    /* 限1等2件商品使用*/   
							}else{
								limit.push(langData['waimai'][2][111].replace('1', foodList.join("、")));   /* 限1使用*/
							}
						}

						limit.push(langData['waimai'][2][111].replace('1', obj.username));

						item.push('<li data-id="'+obj.id+'" class="li_list '+( obj.fail == 1 ? ' no_chose' : '')+((choseid==obj.id?"chosed":""))+'"><a href="'+quanToUrl+'" class="fn-clear">');    //选择的class名chosed
						item.push('<div class="left_num"><h3>' + echoCurrency("symbol") + '<em>'+(obj.money/1)+'</em></h3><p>'+langData['waimai'][2][114].replace('1', obj.basic_price/1)+'</p></div>');
						if(url.indexOf('type=no')<=-1){

							item.push('<p class="right_btn">'+langData['waimai'][7][142]+'</p>');   /*  立<br />即<br />使<br />用 */
						}
						item.push('<div class="coupon_info"><h2><span>'+obj.name+'</span> </h2><p class="dead_tip">'+langData['waimai'][7][143]+'<em>'+obj.deadline+'</em></p></div>');  /*有效期至 */
						if(obj.fail == 1){
							item.push('<div class="no_tip">'+obj.failnote+'</div>');
							
						}
						item.push('</a></li>');

						html.push(item.join(""));
						$(".loading").remove()	
					}
					$(".coupon_list ul").html(html.join(""));
					$(".coupon_list ul").prepend($(".coupon_list ul .li_list.chosed"))
				}else{
					$(".loading").text(langData['waimai'][2][117]);  /* 暂无优惠券 */
				}
			}
		})
	}
	getList();
	
	// 点击不可用的优惠券
	$(".coupon_list ul").delegate(".no_chose a", "click", function(){
		alert(langData['waimai'][2][118]);    /* 该优惠券不可用 */
	});
	

})
