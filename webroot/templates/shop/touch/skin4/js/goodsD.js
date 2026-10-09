
// 排序
function funcOrder(a,b){
	return a-b;
}
$(function() {
	var listArr = [];
	var SKUResult = {};  //保存组合结果
	var mpriceArr = [];  //市场价格集合
	var priceArr = [];   //现价集合
	var totalStock = 0;  //总库存
	var skuObj = $("#skuObj"), priceObj = $("#price"), stockObj = $("#stock"), disabled = "disabled", selected = "active";
	var cartList = utils.getStorage('shopCartList');
	var addFlag = 0;

	if(cartList){
		if(maxCount*1 == 0){//限购为0 则表示不限购
			var canbuycount = detailinventory;
		}else{
			var canbuycount = Math.min.apply(null, [detailinventory,maxCount*1]);//库存和限购的最小值为 最大购买数量
		}

		cartList.forEach(function(cart){
			if(cart.id == detailID && cart.count >= canbuycount*1 && canbuycount*1>0){
				addFlag = 1;
				return false;
			}
		})
	}
	
	var init = {

		//拼接HTML代码
		start: function(){
			var proDataArr = [], data = sku_conf.property;
          if(moduletype == '1'){//团购商品
            data = sku_conf.tuanproperty;
          }
			var guigeArr = [];
			var opt = data[0].options;
			if(opt){
				for(var oj = 0; oj < opt.length; oj++){
					if(opt[oj].pic){
						guigeArr.push('<div class="ggImg"><img src="'+opt[oj].pic+'" alt=""></div>');
					}else{
						guigeArr.push('<span>'+opt[oj].name+'</span>');
					}
				}
				$('.guigeBot .leftIn').html(guigeArr.join(""));
				$('.guigeBot .rIn').html('共'+opt.length+'种'+data[0].name+'分类可选')
			}

			for(var i = 0; i < data.length; i++){
				var colCla = '';
				if(data[i].name == '颜色'){
					colCla = 'speColor';
				}
				proDataArr.push('<div class="color-info-ul sys_item_specpara '+colCla+'"><h3><span>'+data[i].name+'</span></h3><ul class="fn-clear">');
				var options = data[i].options;
				for(var ii = 0; ii < options.length; ii++){
					if(options[ii].pic){
						proDataArr.push('<li class="sku disabled" attr_id="'+options[ii].id+'"><i><img src="'+options[ii].pic+'"></i>'+options[ii].name+'</li>');
					}else{
						proDataArr.push('<li class="sku disabled" attr_id="'+options[ii].id+'"><i></i>'+options[ii].name+'</li>');
					}

				}
				proDataArr.push('</ul></div>');
			}
			skuObj.html(proDataArr.join(""));

			if(huodongid){//活动中的商品
				init.initSKU('fqbuy');
			}else{
				init.initSKU();
			}

		}

		//获得对象的key
		,getObjKeys: function(obj) {
			if (obj !== Object(obj)) throw new TypeError('Invalid object');
			var keys = [];
			for (var key in obj){
				if (Object.prototype.hasOwnProperty.call(obj, key)){
					keys[keys.length] = key;
				}
			}
			return keys;
		}


		//默认值
		,defaultValue: function(){

			//市场价范围
			var maxPrice = detailPrice;
			var minPrice = detailPrice;
			if(mpriceArr.length > 0){
				maxPrice = Math.max.apply(Math, mpriceArr);
				minPrice = Math.min.apply(Math, mpriceArr);
			}
			

			//现价范围
			if(priceArr.length > 0){
				maxPrice = Math.max.apply(Math, priceArr);
				minPrice = Math.min.apply(Math, priceArr);
			}
			priceObj.text(maxPrice > minPrice ? minPrice + "-" + maxPrice : maxPrice);

			//总库存
			stockObj.html(totalStock);

			//设置属性状态
			$('.sku,.mealBox a').each(function() {
				// SKUResult[$(this).attr('attr_id')] ? $(this).removeClass(disabled) : $(this).addClass(disabled).removeClass(selected);
				var attr_id = $(this).attr('attr_id')
				var el = $(this)
				for(var item in SKUResult){
					if(item.indexOf(attr_id) > -1 && SKUResult[item].stock > 0){ //有该选项的商品 并且库存不为0
						// console.log($(this)[0])
						$(this).removeClass('disabled')
						break;
					}
				}
			})

		}

		//初始化得到结果集
		,initSKU: function(prarm) {
			var i, j, skuKeys = init.getObjKeys(sku_conf.data);
			if(sku_conf.data || sku_conf.pindata){
				totalStock = 0 ;
			}
			if(prarm == 'fqbuy' &&  sku_conf.pindata && JSON.stringify(sku_conf.pindata) != "{}"){
				skuKeys = init.getObjKeys(sku_conf.pindata);
			}
			for(i = 0; i < skuKeys.length; i++) {
				var skuKey = skuKeys[i];  //一条SKU信息key
				// if(skuKey.indexOf(';') >-1){
				// 	console.log(skuKey)
				// 	skuKey = skuKey.split(';');
				// 	console.log(skuKey)
				// 	skuKey.sort(arrSortMinToMax);
				// 	console.log(skuKey)
				// 	skuKey = skuKey.join(';')
				// 	console.log(skuKey)
				// }

				var sku = sku_conf.data[skuKey];	//一条SKU信息value
				if(prarm == 'fqbuy' && sku_conf.pindata && sku_conf.pindata[skuKey]){
					sku = sku_conf.pindata[skuKey];
				}
				var skuKeyAttrs = skuKey.split(";");  //SKU信息key属性值数组
				var len = skuKeyAttrs.length;
				//对每个SKU信息key属性值进行拆分组合
				// var combArr = init.arrayCombine(skuKeyAttrs);

				// for(j = 0; j < combArr.length; j++) {
				// 	init.add2SKUResult(combArr[j], sku);
				// }
				mpriceArr.push(sku.mprice);
				priceArr.push(sku.price);
				totalStock += sku.stock * 1;

				//结果集接放入SKUResult
				SKUResult[skuKey] = {
					id:sku.id,
					stock: sku.stock,
					prices: [sku.price],
					mprice: sku.mprice,
				};
			}

			init.defaultValue();
		}

		//把组合的key放入结果集SKUResult
		,add2SKUResult: function(combArrItem, sku) {
			var key = combArrItem.join(";");

			//SKU信息key属性
			if(SKUResult[key]) {
				SKUResult[key].stock = sku.stock;
				SKUResult[key].prices.push(sku.price);
				SKUResult[key].mprice = sku.mprice;
			} else {
				SKUResult[key] = {
					stock: sku.stock,
					prices: [sku.price],
					mprice: sku.mprice,
				};
			}

		}

		//从数组中生成指定长度的组合
		,arrayCombine: function(targetArr) {
			if(!targetArr || !targetArr.length) {
				return [];
			}

			var len = targetArr.length;
			var resultArrs = [];

			// 所有组合
			for(var n = 1; n < len; n++) {
				var flagArrs = init.getFlagArrs(len, n);
				while(flagArrs.length) {
					var flagArr = flagArrs.shift();
					var combArr = [];
					for(var i = 0; i < len; i++) {
						flagArr[i] && combArr.push(targetArr[i]);
					}
					resultArrs.push(combArr);
				}
			}
			return resultArrs;
		}

		//获得从m中取n的所有组合
		,getFlagArrs: function(m, n) {
			if(!n || n < 1) {
				return [];
			}

			var resultArrs = [],
				flagArr = [],
				isEnd = false,
				i, j, leftCnt;

			for (i = 0; i < m; i++) {
				flagArr[i] = i < n ? 1 : 0;
			}

			resultArrs.push(flagArr.concat());

			while (!isEnd) {
				leftCnt = 0;
				for (i = 0; i < m - 1; i++) {
					if (flagArr[i] == 1 && flagArr[i+1] == 0) {
						for(j = 0; j < i; j++) {
							flagArr[j] = j < leftCnt ? 1 : 0;
						}
						flagArr[i] = 0;
						flagArr[i+1] = 1;
						var aTmp = flagArr.concat();
						resultArrs.push(aTmp);
						if(aTmp.slice(-n).join("").indexOf('0') == -1) {
							isEnd = true;
						}
						break;
					}
					flagArr[i] == 1 && leftCnt++;
				}
			}
			return resultArrs;
		}
		// 将已选展示出来
		,getSelected: function(){
			var selectedHtml = [];
			$('.color-main .sys_item_specpara ul').each(function(){
				var t = $(this), selected = t.find('.active').text();
				if (selected) {
					selectedHtml.push('\"'+selected+'\"');
				}
				$('.guige em').text(selectedHtml.join(","));
				$('.inpSelect').val(selectedHtml.join(","));
			})
		}


	}
	if(moduletype == '1'){//团购商品
      if(sku_conf.tuanproperty && sku_conf.tuanproperty.length > 0  && sku_conf.tuanproperty[0].options.length > 0){
		init.start();
		}
    }else{
      if(sku_conf.property.length > 0){
		init.start();
		}
    }
    var mealFlag = false;
	//选择套餐
    if($('.mealBox').size() > 0){//团购商品

        $('.mealBox a').click(function(){
            var tid = $(this).attr('data-id');
            if($(this).hasClass('disabled')){
                var popOptions = {
                    btnCancel:'确定',
                    title:langData['shop'][2][23],
                    btnColor:'#222',
                    noSure:true,
                    isShow:true
                }
                confirmPop(popOptions);
            }else{
                $(this).addClass('curr').siblings('a').removeClass('curr');
                $('#skuObj .sku[attr_id="'+tid+'"]').click();
            }           
        })
        
        
    }
	//点击事件	
	skuObj.delegate('.sku','click',function(){

		// console.log(444)
		var self = $(this);
		if(self.hasClass(disabled)) return;

		//选中自己，兄弟节点取消选中

		if(moduletype == '1'){//团购商品
			self.addClass(selected).siblings().removeClass(selected);
		}else{
			self.toggleClass(selected).siblings().removeClass(selected);
		}
		if(self.find("img").size()>0){
			$(".color-info-img img").attr("src",self.find("img").attr("src"))
		}else if(self.parents("ul").prev("h3").find('span').text()=="颜色：" || self.parents("ul").prev("h3").find('span').text()=="颜色"){
			$(".color-info-img img").attr("src",$(".color-info-img img").attr("data-src"))
		}
		var spValue=parseInt($("#stock").text()),
			inputValue=parseInt($(".count").html());
			inputValue = inputValue ? inputValue : parseInt($(".count").val())
		var n=$(".sys_item_specpara").length;

		if($(".color-info-ul").find("li."+selected).length==n && inputValue<spValue){
			skuObj.removeClass("on");
			$('.sys_item_specpara h3 em').remove();
		}else{
			var sizePar = $(this).closest('.sys_item_specpara').find('h3');
			sizePar.find('em').remove();
		}

		//已经选择的节点
		var selectedObjs = $('#skuObj .'+selected);
		init.getSelected();

		if(selectedObjs.length) {
			//获得组合key价格
			var selectedIds = [];
			selectedObjs.each(function() {
				selectedIds.push($(this).attr('attr_id'));
			});
			selectedIds.sort();
			var len = selectedIds.length;
			// var prices = SKUResult[selectedIds.join(';')].prices;
			// var mprice = SKUResult[selectedIds.join(';')].mprice?SKUResult[selectedIds.join(';')].mprice:0; //原价
			// var maxPrice = Math.max.apply(Math, prices);
			// var minPrice = Math.min.apply(Math, prices);
			// // console.log(minPrice,maxPrice)
			// priceObj.html((maxPrice > minPrice ? minPrice.toFixed(2) + "-" + maxPrice.toFixed(2) : maxPrice.toFixed(2)));

			var currStock = 0;
			var priceArr = [],mpriceArr = [];
			for(var item in SKUResult){
				var testIds = item.split(';');
				var includeArr = selectedIds.filter(val => {
					return testIds.includes(val)
				})
				
				if(includeArr.length == selectedIds.length){
					testIdsArr = testIds.filter(val => {
						return !selectedIds.includes(val);
					});
					// 判断当前节点是否有库存
					$(".sku").not(selectedObjs).not(self).each(function () {
						var siblingsSelectedObj = $(this).siblings('.' + selected);
						var testAttrIds = []; //从选中节点中去掉选中的兄弟节点
						if (siblingsSelectedObj.length) {
							var siblingsSelectedObjId = siblingsSelectedObj.attr('attr_id');
							for (var i = 0; i < len; i++) {
								(selectedIds[i] != siblingsSelectedObjId) && testAttrIds.push(selectedIds[i]);
							}
						} else {
							testAttrIds = selectedIds.concat();
						}
						testAttrIds = testAttrIds.concat($(this).attr('attr_id'));
						testAttrIds.sort();

						var stockFlag = 0; 
						for(var iitem in SKUResult){
							var flag = 0;
							for(var mm = 0; mm < testAttrIds.length; mm++){
								if(!iitem.split(';').includes(testAttrIds[mm])){
									flag = 1;
									break;
								}
							}
							if(flag == 0 && SKUResult[iitem].stock != 0){
								stockFlag = 1;
							}
						}

						if(!stockFlag){
							$(this).addClass('disabled').removeClass(selected)
						}else{
							$(this).removeClass('disabled')
						}
					})
					if(SKUResult[item].stock == 0){ //没有库存
						// 没有库存
					}else{
						currStock = SKUResult[item].stock * 1 + currStock;
						priceArr.push(SKUResult[item].prices[0])
						mpriceArr.push(SKUResult[item].mprice)
					}
				}
			}
			var min_price = Math.min.apply(null,priceArr);
			var max_price = Math.max.apply(null,priceArr);
			var min_mprice = Math.min.apply(null,mpriceArr);
			var max_mprice = Math.max.apply(null,mpriceArr);
			priceObj.text(min_price == max_price ? min_price : (min_price + '-' + max_price)); //价格填入
			// mpriceObj.text(min_mprice == max_mprice ? min_mprice : (min_mprice + '-' + max_mprice))
			var mprice = min_mprice == max_mprice ? min_mprice : (min_mprice + '-' + max_mprice)
			stockObj.text(currStock);




          if(moduletype == '1'){//团购商品
          	var btnprice = ((max_price > min_price ? min_price.toFixed(2) + "-" + max_price.toFixed(2) : max_price.toFixed(2)));
          	btnprice = parseFloat(btnprice * 1)
			$('.nprice').html('<em>'+echoCurrency('symbol')+'</em>'+btnprice)
			if(mprice){
				$(".shopInfo .yprice").text(echoCurrency('symbol') + mprice)
			}
			
			if(btnprice <= 100000){
				btnprice = btnprice.toString();
				var btnPriceArr = btnprice.split('.')
				var emprice = btnPriceArr.length > 1 ? '<em>.'+btnPriceArr[1]+'</em>' : '';
				$('.nrpice').html('<em>'+echoCurrency('symbol')+'</em><b>'+btnPriceArr[0]+emprice+'</b>')
			}else{
				$('.nrpice').html('')
			}
			

			
          }
          	if($(".pinbuy").length){
          		var priceShow = max_price.toFixed(2);
          		var mpriceShow = min_mprice.toFixed(2)
          		$(".pinbuy p").html(echoCurrency("symbol") +'<strong>'+priceShow.split('.')[0]+'</strong>.'+ priceShow.split('.')[1]);
          		$(".pindan[data-name='zjbuy'] p").html(echoCurrency("symbol") +'<strong>'+mpriceShow.split('.')[0]+'</strong>.'+ mpriceShow.split('.')[1])

          	}
			// var mprices = SKUResult[selectedIds.join(';')].mprices;
			// var maxPrice = Math.max.apply(Math, mprices);
			// var minPrice = Math.min.apply(Math, mprices);


			// stockObj.text(SKUResult[selectedIds.join(';')].stock);

			//获取input的值
			var inputValue=parseInt($(".count").val());
			// var inputTip=$(".singleGoods dd cite");

			if(inputValue > currStock){
				var popOptions = {
					btnCancel:'确定',
					title:langData['shop'][2][23],
					btnColor:'#222',
					noSure:true,
					isShow:true
				}
				confirmPop(popOptions);
			}else{
			}


			//用已选中的节点验证待测试节点 underTestObjs
			// $(".sku").not(selectedObjs).not(self).each(function() {
			// 	var siblingsSelectedObj = $(this).siblings('.'+selected);
			// 	var testAttrIds = [];//从选中节点中去掉选中的兄弟节点
			// 	if(siblingsSelectedObj.length) {
			// 		var siblingsSelectedObjId = siblingsSelectedObj.attr('attr_id');
			// 		for(var i = 0; i < len; i++) {
			// 			(selectedIds[i] != siblingsSelectedObjId) && testAttrIds.push(selectedIds[i]);
			// 		}
			// 	} else {
			// 		testAttrIds = selectedIds.concat();
			// 	}
			// 	testAttrIds = testAttrIds.concat($(this).attr('attr_id'));
			// 	testAttrIds.sort(arrSortMinToMax);
			// 	if(!SKUResult[testAttrIds.join(';')]) {
			// 		console.log($(this).attr('attr_id'))
			// 		$(this).addClass(disabled).removeClass(selected);
			// 	} else {
			// 		$(this).removeClass(disabled);
			// 	}
			// });
		} else {

			init.defautx();

		}
	});
    $('.sku').each(function() {
		var self = $(this);
		var attr_id = self.attr('attr_id');
		// if(!SKUResult[attr_id]) {
		// 	self.addClass(disabled);
		// }else{
		// 	if(moduletype == 1 && SKUResult[attr_id].stock == 0){//团购商品 无库存也不可选
		// 		self.addClass(disabled);
		// 		$('.mealBox a[data-id="'+attr_id+'"]').addClass(disabled);	
		// 	}
		// }
		var self = $(this);
		var attr_id = self.attr('attr_id');
		var skuData = prohuodongtype == 4 ? sku_conf.pindata : sku_conf.data;
		for(var item in skuData){
			if(item.indexOf(attr_id) > -1 && skuData[item].stock > 0){ //有该选项的商品 并且库存不为0
				self.removeClass(disabled);
				break;
			}
		}
		if(self.index() == $('.sku').length-1){//循环结束
			mealFlag = true;
			$('.mealBox a').each(function(){
	            if(!$(this).hasClass('disabled')){
	                $(this).click();
	                return false;
	            }
	        })
		}

		if(moduletype == '1' && SKUResult[attr_id] && SKUResult[attr_id].stock!=0 && $('.sku.active').length == 0){//团购商品 默认选中第一个套餐
			// self.addClass('active');
			var smprice = SKUResult[attr_id].prices;
			var smprice1 = parseFloat(smprice).toString()
			var priArr = smprice1.split('.');
			$('.nprice').html('<em>'+echoCurrency('symbol')+'</em>'+smprice1)
			if(priArr.length > 1){
				$('.nrpice b').html(priArr[0] + "<em>."+priArr[1]+"</em>")
			}else{
				$('.nrpice b').html(priArr[0])
			}
            self.click();
			
		}
		
	})


	

	//商品详情页--数量的加减

	//加
	$('.add').on("click",function(){
		var stockx = parseInt($(".color-info-txt #stock").text()),n=$(".sys_item_specpara").length;
		if(maxCount*1 == 0){//限购为0 则表示不限购
			var canbuycount = stockx
		}else{
			var canbuycount = Math.min.apply(null, [stockx,maxCount*1]);//库存和限购的最小值为 最大购买数量
		}
		var value;
		value=parseInt($('.add').siblings(".count").val());
		if(value<canbuycount){
			//2021-9-13 增加最小起订量和每次装箱数量
			//每次装箱数量
			var eachcout = $('.buy_mincount .mincoutTip').attr('data-eachcout');
			value=value+eachcout*1;
			$('.add').siblings(".count").val(value);
			var spValue=parseInt($(".color-info-txt #stock").text()),
				inputValue=parseInt($(".count").val());
			if($(".color-info-ul ul").find("li.active").length==n && inputValue<spValue){
				// $(".singleGoods dd.info ul").removeClass("on");
			}

		}else{
			var popOptions = {
				btnCancel:'确定',
				title:langData['shop'][2][23],
				btnColor:'#222',
				noSure:true,
				isShow:true
			}
			if(value == maxCount*1){
				popOptions.title = '限购'+maxCount*1+detailShopunit+'!'
			}
			confirmPop(popOptions);
		}
	})

	//减
	$(".reduce").on("click",function(){
		var stockx = parseInt($(".color-info-txt #stock").text()),n=$(".sys_item_specpara").length;
		var value;
		value=parseInt($('.add').siblings(".count").val());
		//2021-9-13 增加最小起订量和每次装箱数量
		//每次装箱数量
		var eachcout = $('.buy_mincount .mincoutTip').attr('data-eachcout');
		var mincout = $('.buy_mincount .mincoutTip').attr('data-mincout');//最小起订量
		if(value>mincout*1){

			value=value-eachcout*1;
			$('.add').siblings(".count").val(value);
			var spValue=parseInt($(".color-info-txt #stock").text()),
				inputValue=parseInt($(".count").val());
			if($(".color-info-ul ul").find("li.active").length==n && inputValue<=spValue){
			}
		}else{
			var popOptions = {
				btnCancel:'确定',
				title:'最少'+(mincout*1)+detailShopunit+'起拍哦！',
				btnColor:'#222',
				noSure:true,
				isShow:true
			}
			confirmPop(popOptions);
		}
	})

	// 加入购物车 或 立即购买
	$('body').delegate('.addCart,.gobuy,.add-cart,.buy-cart', 'click', function() {
		var hid = $('#hid').val();
		var $btn=$(this),
			$li=$(".sys_item_specpara"),
			// $ul=$(".singleGoods dd.info ul"),
			n=$li.length;
		if(userStatus == '1'){
			var popOptions = {
				btnCancel:'确定',
				title:'企业用户不能购买自己店铺的商品',
				btnColor:'#222',
				noSure:true,
				isShow:true
			}
			confirmPop(popOptions,function(){
				return false;
			});
			return false;
		}
		if($btn.hasClass("disabled") || $btn.hasClass("doing")) return false;
		//$btn.addClass('doing');
		var spValue=parseInt($("#stock").text()),	// 库存
			inputValue=parseInt($(".color-info-account .count").val());	// 购买数量
		var isBtnCar = $btn.hasClass('addCart');//页面里的加入购物车
		var isBtnBuy = $btn.hasClass('gobuy');//页面里的立即购买
		var isBtnCar2 = $btn.hasClass('add-cart');//弹窗里的加入购物车
		var isBtnBuy2 = $btn.hasClass('buy-cart');//弹窗里的立即购买
		if(maxCount*1 == 0){//限购为0 则表示不限购
			var canbuycount = spValue;
		}else{
			var canbuycount = Math.min.apply(null, [spValue,maxCount*1]);//库存和限购的最小值为 最大购买数量
		}
		console.log(canbuycount)

		//购物车中有此商品 并且达到限购数量
		var goucartNum =($('.cartlist li[data-id="'+detailID+'"]').attr('data-count'))*1;
		if(!$btn.hasClass('addCart')){
			goucartNum = 0
		}

        //不注释时，会出现在详情页购买时，手动输入超出库存的数量，不会提示库存不足，也不会跳转到下个页面
		// if($('.cartlist li[data-id="'+detailID+'"]').size() > 0 && (goucartNum+inputValue) > canbuycount*1){
        if((goucartNum+inputValue) > canbuycount*1){
			var popOptions = {
				btnCancel:'确定',
				title:langData['shop'][2][23],
				btnColor:'#222',
				noSure:true,
				isShow:true
			}
			if(canbuycount == maxCount*1){
				popOptions.title = '此商品限购'+canbuycount+detailShopunit;
			}
			confirmPop(popOptions);
			return false;
		}

		if(addFlag && (isBtnCar ||isBtnCar2)){

			var popOptions = {
				btnCancel:'确定',
				title:'此商品限购'+canbuycount+detailShopunit,
				btnColor:'#222',
				noSure:true,
				isShow:true
			}
			confirmPop(popOptions);
			return false;
		}


		//if($btn.hasClass("disabled") || $btn.hasClass("doing")) return false;

		// $btn.addClass('doing');
		// setTimeout(function(){
		// 	$btn.removeClass('doing');
		// }, 3000)

		//验证登录
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = '/login.html';
			return false;
		}

		

		if($(this).hasClass('pindan')){//拼团有两个价格
			var pindanPrice = $(this).attr('data-price');
			$('.color-info-txt .color-info-price #price').text(pindanPrice);
			if($(this).attr('data-name') == 'zjbuy'){//直接购买、
				$('#buytype').val('');

			}
			$('.color-footer-once .buy-cart').attr('data-name',$(this).attr('data-name'));
		}

		if($li.length > 0 && moduletype !='1'){//非团购商品 并且有多规格时
            toggleDragRefresh('off');  //取消下拉刷新
			$('.mask').css({'opacity':'1','z-index':'100000'});
			$('.color-box').addClass('sizeShow');
			$('.closed').removeClass('sizeHide');
		}



		if(spValue <= 0){
			// var popOptions = {
			// 	btnCancel:'确定',
			// 	title:'该商品已售完！',
			// 	btnColor:'#222',
			// 	noSure:true,
			// 	isShow:true
			// }
			// confirmPop(popOptions);
			showErrAlert('商品库存不足，补货中')
			return false;
		}
		if(isBtnCar || isBtnBuy){//页面里面的加入购物车和立即购买
			if(moduletype !='1'){//团购商品不用清空所选
				if($(".sys_item_specpara").find(".sku."+selected).length==n){//全选时 要清空所选
					$(".sys_item_specpara").find(".sku").removeClass(selected);
				}
			}
			
		}

		if($(".sys_item_specpara").find(".sku."+selected).length==n && inputValue<=spValue){//规格已选完 

			skuObj.removeClass('on');
			// 规格窗口 加入购物车
			$('.mask').css({'opacity':'0','z-index':'-1'});
			$('.color-box').removeClass('sizeShow');
            toggleDragRefresh('on');  //启用下拉刷新

			var info = [];
			var t=''; //该商品的属性编码 以“-”链接个属性
			$(".sys_item_specpara li.active").each(function(){
				info.push($(this).text());
				var y=$(this).attr("attr_id");
				t=t+"-"+y;
			})
			var t=t.substr(1);
			var tArr = t.split('-').sort();
			var paramData = sku_conf.data;
			if(prohuodongtype == 4){
				paramData = sku_conf.pindata;
			}
			var paramId = paramData && paramData[tArr.join(';')] ? paramData[tArr.join(';')].id : '';
			if(isBtnCar || isBtnCar2){
				var num = parseInt($('.cart').text());
				$b = $('<b>+'+inputValue+'</b>');
				$('.gocart').append($b);
				$('.cart').text(inputValue+num);
				$b.animate({
					top:'-.4rem'
				},500,function(){
					setTimeout(function(){
						$b.remove();
					},500)
				})

				var num=parseInt($(".count").val());
				
				//操作购物车
				var data = [];
				data.id = detailID;
				data.specation = paramId;
				data.count = num;
				data.title = detailTitle;
				data.url = detailUrl;
				data.hid = hid;
				shopInit.add(data);
				setTimeout(function(){showErrAlert('成功加入购物车<br>'+info.join(" "));},500)

			}
			// 直接购买
			else{
				var userid = $.cookie(cookiePre+"login_user");
				if(userid == null || userid == ""){
					location.href = masterDomain + '/login.html';
					return false;
				}else{
					$("#pros").val(detailID+","+paramId+","+inputValue);
					$("#ordertype").val($(this).attr('data-name'));

                    //砍价原价购买
                    if($(this).hasClass('originbuy')){
                        $('#hid, #buytype').val('');
                    }

					if(prohuodongtype ==3){
						$("#buytype").val('');
					}
					$("#buyForm").submit();
				}
			}

		}else{//规格还有未选的

			if(isBtnCar || isBtnBuy){//页面的加入购物车和立即购买
				$('.btn-guige').click();
				if(isBtnCar){
					$('.color-footer-cart').removeClass('dn').siblings().addClass('dn');
				}else{
					$('.color-footer-once').removeClass('dn').siblings().addClass('dn');
				}
			}

			skuObj.addClass('on');
			if(isBtnCar2 || isBtnBuy2){//规格弹窗中加入购物车

				$li.each(function(){
					var $dt = $(this).find('h3');
					var dtTxt = $dt.find('span').text();
					if($(this).find('li.active').length == 0){
						$dt.html('<span>'+dtTxt+'</span><em>请选择'+dtTxt+'</em>')
					}
				})
			}
		}
	})


	$(".tobuy").click(function(){
		$('.gobuy').click()
	})


});
var timer;
function showMsg(str){
	$(".errorMsg").remove();
	var o = $('<div class="errorMsg" style="width: 4rem;  background-color: rgba(0,0,0,.67); position: fixed; top: 30%; color: #fff; left: 50%; margin-left: -2rem;border-radius: .1rem; display:none;font-size: .3rem; text-align: center; padding: .3rem .2rem;z-index:10000;animation: topFadeIn .3s ease-out;"></div>')
	$('body').append(o);

	o.html(str).css('display','block');
	clearTimeout(timer);
	timer = setTimeout(function(){o.hide()},1500);
}

// 数字字母中文混合排序


function arrSortMinToMax(a, b) {
	// 判断是否为数字开始; 为啥要判断?看上图源数据
	if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
		// 提取起始数字, 然后比较返回
		return /^\d+$/.exec(a) - /^\d+$/.exec(b);
		// 如包含中文, 按照中文拼音排序
	} else if (isChinese(a) && a.indexOf('custom_') < 0 && isChinese(b) && b.indexOf('custom_') < 0) {
		// 按照中文拼音, 比较字符串 (英文加汉字混合时 中文加英文加汉字混合)
		var rvalue;
		var sa = a.substr(0,1),sb = b.substr(0,1);
		var saArr = a.split(''),sbArr = b.split('');//英文加中文时  首字母相同时
		var sflg =false,noSame = [];
		var blen = saArr.length>sbArr.length?saArr.length:sbArr.length;
		for(var mm = 0;mm<blen;mm++){
			if(saArr[mm] != sbArr[mm]){
				noSame.push(saArr[mm])
				noSame.push(sbArr[mm])
				sflg = true;
				break;
			}
		}
		if((/^[A-Za-z]+$/).test(sa) && (/^[A-Za-z]+$/).test(sb)){//首字母全为英文
			if(sa==sb){//首字母相同时 比较出不一样的元素
				var ssa = noSame[0],ssb = noSame[1];
				if(ssa != undefined){
					if(ssb == undefined){//a短b长
						rvalue = 1;
					}else{
						if((/^[A-Za-z]+$/).test(ssa)){//英文
							if((/^[A-Z][A-z0-9]*$/).test(ssa)){//大写
								if((/^\d+/.test(ssb))){//数字
									rvalue = 1;
								}else if((/^[A-Za-z]+$/).test(ssb)){//字母
									if((/^[A-Z][A-z0-9]*$/).test(ssb)){
										rvalue = ssa.localeCompare(ssb, 'en');
									}else{//大写排小写前面
										rvalue = -1;
									}

								}else {//汉字
									rvalue = -1;
								}

							}else{//小写
								if((/^\d+/.test(ssb))){//数字 排前面
									rvalue = 1;
								}else if((/^[A-Za-z]+$/).test(ssb)){//字母
									if((/^[A-Z][A-z0-9]*$/).test(ssb)){//大写 排前面
										rvalue = 1;
									}else{//小写
										rvalue = ssa.localeCompare(ssb, 'en');
									}

								}else{//汉字
									rvalue = -1;
								}
							}
						}else if((/^\d+/.test(ssa))){//数字
							if((/^\d+/.test(ssb))){//数字
								if(ssa > ssb){
									rvalue = 1;
								}else{
									rvalue = -1;
								}

							}else {
								rvalue = -1;
							}
						}else{//汉字
							if((/^\d+/.test(ssb)) || (/^[A-Za-z]+$/).test(ssb)){//数字或字母
								rvalue = 1;
							}else{//汉字
								rvalue = ssa.localeCompare(ssb, 'zh-CN');
							}
						}
					}
				}else{//a长b短
					rvalue = -1;
				}


			}else{
				if((/^[A-Z][A-z0-9]*$/).test(sa) && (!(/^[A-Z][A-z0-9]*$/).test(sb))){//大写和小写
					rvalue = -1;
				}else if((/^[A-Z][A-z0-9]*$/).test(sb) && (!(/^[A-Z][A-z0-9]*$/).test(sa))){//大写和小写
					rvalue = 1;
				}
			}

		}else{//首字母英文和中文时

			if((/^[A-Za-z]+$/).test(sa) && (!((/^[A-Za-z]+$/).test(sb)) && !(/^\d+/.test(sb)))){//英文和中文
				rvalue = -1;
			}else if((/^[A-Za-z]+$/).test(sb) && (!((/^[A-Za-z]+$/).test(sa)) && !(/^\d+/.test(sa)))){
				rvalue = 1;
			}else{
				rvalue = a.localeCompare(b, 'zh-CN');
			}

		}
		return rvalue;
	} else {
		var rvalue;
		//a/b为大写字母开头 且b/a不为数字 是小写
		var sa = a.substr(0,1),sb = b.substr(0,1);
		if((/^[A-Z][A-z0-9]*$/).test(sa) && (!(/^[A-Z][A-z0-9]*$/).test(sb) && !(/^\d+/.test(sb)))){
			rvalue = -1;
		}else if((/^[A-Z][A-z0-9]*$/).test(sb)  && (!(/^[A-Z][A-z0-9]*$/).test(sa) && !(/^\d+/.test(sa)))){
			rvalue = 1;
		}else{
			rvalue = a.localeCompare(b, 'en');
		}
		// 排序数字和字母
		return rvalue;
	}
}

// 检测是否为中文，true表示是中文，false表示非中文
function isChinese(str) {
	// 中文万国码正则
	if (/[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/.test(str)) {
		return true;
	} else {
		return false;
	}
}
