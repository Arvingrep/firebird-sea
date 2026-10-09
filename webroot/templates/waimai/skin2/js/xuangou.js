var natureConfig = {
	id: 0, title: "", pic: "", unit: "", unitPrice: 0, dabao: 0, selectNature: "", selectPrice: 0, names: [], prices: []
};

$(function(){

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

	//购物车相关功能集合
	var cartInit = {

		//加载
		init: function(){

			// 读取当前所有商品id
			var foodIds = [];
			$(".car_t1").each(function(){
				foodIds.push($(this).attr("data-id"));
			})

			//加载历史已选记录
			var cartHistory = utils.getStorage("wm_cart_"+shopid);
			if(cartHistory && foodIds.length > 0){
				var list = [], dabaoPrice = 0,deliveryPrice = 0;
				for (var i = 0; i < cartHistory.length; i++) {
					// 购物车中商品不在当前页面中跳过
					if(!foodIds.in_array(cartHistory[i].id)){
						continue;
					}

					list.push('<div class="cart-item fn-clear" data-id="'+cartHistory[i].id+'" data-name="'+cartHistory[i].title+'" data-pic="'+cartHistory[i].pic+'" data-unit="'+cartHistory[i].unit+'" data-price="'+cartHistory[i].price+'" data-dabao="'+cartHistory[i].dabao+'" data-ntitle="'+cartHistory[i].ntitle+'" data-nprice="'+cartHistory[i].nprice+'"  data-delivery="'+cartHistory[i].delivery+'" data-is_discount ="'+cartHistory[i].is_discount+'" data-discount_value ="'+cartHistory[i].discount_value+'" >');

					list.push('<span class="info">'+cartHistory[i].title+'</span> ');
					if(cartHistory[i].ntitle){
						list.push('<span class="guige">'+cartHistory[i].ntitle+'</span>');
					}
					list.push('<span class="num">');
					list.push('<em class="num-rec">－</em>');
					list.push('<em class="num-account">'+cartHistory[i].count+'</em>');
					list.push('<em class="num-add">＋</em>');
					list.push('</span>');
					list.push('<span class="sale-price fn-right">'+echoCurrency("symbol")+Number((cartHistory[i].count*Number(cartHistory[i].price+cartHistory[i].nprice))).toFixed(2)+'</span>');
					list.push('</div>');



					//更新页面已选数量
					var numAccount = $("#food"+cartHistory[i].id).find(".num-account");
					var foodCount = Number(numAccount.text());
					var parsentCount = foodCount + cartHistory[i].count;
					numAccount.html(parsentCount).addClass('show');
					cartInit.updateTypeSelectCount(numAccount);
					//打包费
					if(cartHistory[i].dabao){
						dabaoPrice += Number(cartHistory[i].dabao) * cartHistory[i].count;
					}
					//配送费
					if(cartHistory[i].delivery){
						deliveryPrice=Number(cartHistory[0].delivery);
					}
				}
				if(dabaoPrice>0){
				list.push('<div class="baozhuang price-item cart-item"><span>'+langData['waimai'][8][81]+'</span><span class="bao-price">'+echoCurrency("symbol")+dabaoPrice.toFixed(2)+'</span></div>');//包装费
				}
				if(deliveryPrice>0){
					list.push('<div class="peisong price-item"><span>'+langData['waimai'][2][7]+'</span><span class="pei-price">'+echoCurrency("symbol")+deliveryPrice+'</span></div></div>');//配送费
				}

				list.push('<div class="all-price fn-clear">');
				list.push('<span class="car-price">'+echoCurrency('symbol')+'<em>0</em></span>');
				list.push('<span class="car_button"><button class="'+(ifbuy?"":"disabled")+'" id="gopay"><a href="javascript:;">'+langData['waimai'][2][40]+'</a></button></span>');//去支付
				list.push('</div>');
				$(".cart-box .con").html(list.join(""));
				cartInit.statistic();
			}else{
				var kong=[];
				kong.push('<div class="cart_kong">');
				kong.push('<div class="kong_top">');
				kong.push('<div class="kong_img"><img src="'+templatePath+'images/kong.png" alt=""></div>');
				kong.push('<h2>'+langData['waimai'][8][82]+'</h2>');//购物车空空如也
				kong.push('<p>'+langData['waimai'][8][83]+'</p>');//快去订餐吧，总有你心仪的美食
				kong.push('</div>');
				kong.push('</div>');
				$(".cart-box").append(kong.join(""));
			}

			//页面加 列表加
			$(".right_b em").bind("click", function(){
				if($(this).hasClass('disabled')) return false;

				if($(this).hasClass('carAdd')){//列表加号为加
					cartInit.addORreduce("plus", this);
					$(this).hide();
					$(this).siblings('.cart-num').addClass('show');
				}else if($(this).hasClass('nature_')){//列表中的选规格
					cartInit.plusORreduce("plus", this);
				}

			});

			//加入购物车后 列表里加减号里的加
			$(".cart-num .plus").bind("click", function(){

				cartInit.plusORreduce("plus", this);
			});

			//食物弹窗里加入购物车
			$(".food_cont .addcar").bind("click", function(){
				if($(this).hasClass('disabled'))return false;
				cartInit.plusORreduce("plus", this);
				cartInit.hideFood();
			});
			//关闭食物弹窗
			$(".food_alert .cha,.mask_food").bind("click", function(){
				cartInit.hideFood();
			})

			//关闭库存不足弹窗
			$(".stockPop,.stock_alert .see_out").bind("click", function(){
				cartInit.hideStock();
			})

			//购物车加
			$(".cart-box").delegate(".num-add", "click", function(){
				var t = $(this), par = t.closest(".cart-item"), id = par.attr("data-id"), title = par.attr("data-title"), price = par.attr("data-price"), dabao = par.attr("data-dabao"), ntitle = par.attr("data-ntitle"), nprice = par.attr("data-nprice"),is_discount = par.attr("data-is_discount"),discount_value = t.attr("data-discount_value");
				if(ntitle == ""){
					$("#food"+id).find(".plus").click();
				}else{
					//多规格商品在购物车中增加数量
					var listAccount = $("#food"+id).find(".num-account"), newListAccount = Number(listAccount.text()) + 1;
					listAccount.html(newListAccount).show();
					var nowCart = Number(par.find(".num .num-account").text());
					if($("#food" + id).data('limitfood') && nowCart>=Number($("#food" + id).data('foodnum'))){
						alert(langData['siteConfig'][20][447]);    /* 已达到该商品的购买数量上限！*/
						return false;
					};
					cartInit.updateFood("plus", $("#food"+id).find(".plus"), id, title, "", "", parseFloat(price), parseFloat(dabao), ntitle, parseFloat(nprice), is_discount,discount_value);
				}
			});

			//页面减
			$(".main_item .reduce").bind("click", function(){
				cartInit.plusORreduce("reduce", this);
			});

			//购物车减
			$(".cart-box").delegate(".num-rec", "click", function(){
				var t = $(this), par = t.closest(".cart-item"), id = par.attr("data-id"), title = par.attr("data-title"), price = par.attr("data-price"), dabao = par.attr("data-dabao"), ntitle = par.attr("data-ntitle"), nprice = par.attr("data-nprice"),is_discount = par.attr("data-is_discount"),discount_value = t.attr("data-discount_value");
				if(ntitle == ""){
					if($("#food" + id).find(".reduce").size() > 0){
						$("#food" + id).find(".reduce").click();
					}else{
						cartInit.plusORreduce("reduce", $("#food" + id).find(".right_b"));
					}
				}else{

					//多规格商品在购物车中减少数量
					var listAccount = $("#food"+id).find(".num-account"), newListAccount = Number(listAccount.text()) - 1;
					if (newListAccount == 0) {
						listAccount.hide();
					}
					listAccount.html(newListAccount);
					cartInit.updateFood("reduce", $("#food"+id).find(".plus"), id, title, "", "", parseFloat(price), parseFloat(dabao), ntitle, parseFloat(nprice),is_discount,discount_value);

				}
			});

			//清空购物车
			$(".cart-box .title .right").bind("click", function(){
				cartInit.clean();
			});

			//关闭多规格浮动层
			$(".mask_nature, .nature h2 s").bind("click", function(){
				cartInit.hideNature();
			});
			//点击去支付
			$('.cart-box ').delegate('#gopay a','click',function(){
				var parBtn = $(this).parents('.car_button');
				if(parBtn.hasClass('no_base')){
					return false;
				}else{
					location.href=orderUrl;
				}
			})

			//选择多规格商品
			$(".nature .con").delegate("a", "click", function(){
				var t = $(this);
				if(t.hasClass("disabled")){
					return;
				}

				var maxchoose = parseInt(t.closest('dl').attr('data-maxchoose'));
				var nowchoose = t.parent().children('a.curr').length;


				if(t.hasClass("curr")){
					t.removeClass("curr");
				}else{
					if(nowchoose == maxchoose){
						t.parent().children("a.curr:eq(0)").removeClass("curr");
					}
					t.addClass("curr");
				}

				//计算已选的价格
				var is = 1, selectArr = [];
				$(".nature .con").find("dl").each(function(){
					var curr = $(this).find(".curr");
					if(curr.length <= 0){
						is = 0;
					}else{
						var itemSel = [];
						curr.each(function(){
							itemSel.push($(this).find(".foodname").text());
						})
						selectArr.push(itemSel.join("#"));
					}
				});
				//已选的商品属性
				var haschoose = selectArr.join(",");
				$('.has-choose span').text(haschoose);

				var selectNames = selectArr.join("/");

				if(is){
					$(".nature .confirm").removeAttr("disabled");

					var only = false;
					var selectPrice = 0;
					$('.nature .con dl .curr').each(function(){
						only = true;
						var unat = $(this).attr('data-natprice');
						selectPrice += parseFloat(unat);
					})
					natureConfig.selectNature = selectNames;
					natureConfig.selectPrice = selectPrice;
					$(".nature .fot span strong").html((natureConfig.unitPrice+selectPrice).toFixed(2));

					if(!only){
						natureConfig.selectNature = selectNames;
					}


				}else{
					$(".nature .confirm").attr("disabled", true);
					$(".nature .fot span strong").html(natureConfig.unitPrice.toFixed(2));
				}

			});


			//确认已选规格
			$(".nature .confirm").bind("click", function(){
				var btn = $("#food"+natureConfig.id).find(".plus");
				var countObj = btn.prev(".num-account"), count = Number(countObj.text());
				countObj.html(count+1).show();
				cartInit.updateFood("plus", btn, natureConfig.id, natureConfig.title, natureConfig.pic, natureConfig.unit, natureConfig.unitPrice, natureConfig.dabao, natureConfig.selectNature, natureConfig.selectPrice);
				cartInit.hideNature();
			});
			//关闭规格弹窗
			$(".nature .cha").bind("click", function(){
				cartInit.hideNature();
			})

		}

		//显示
		,show: function(){
			if($(".cart-box").find(".cart-item").length > 0){
				$(".cart-box, .mask_cart").attr("style", "display: block");
			}
		}

		//隐藏
		,hide: function(){
			$(".cart-box, .mask_cart").attr("style", "display: none");
		}

		//隐藏
		,hideNature: function(){
			$(".nature, .mask_nature").attr("style", "display: none");
		}
		//隐藏 食物弹窗
		,hideFood: function(){
			$(".food_alert, .mask_food").attr("style", "display: none");
		}
		//隐藏 库存不足弹窗
		,hideStock: function(){
			$(".stock_alert, .stockPop").attr("style", "display: none");
		}

		//统计汇总
		,statistic: function(){
			var totalCount = 0, totalPrice = 0.00;
			if($(".cart-box").find(".cart-item").length > 0){
				var data = [];
				$(".cart-box").find(".cart-item").each(function(i){
					var t = $(this), id = t.attr("data-id"), title = t.attr("data-name"), pic = t.attr("data-pic"), unit = t.attr("data-unit"), price = parseFloat(t.attr("data-price")), count = Number(t.find(".num-account").text()), dabao = parseFloat(t.attr("data-dabao")), ntitle = t.attr("data-ntitle"), nprice = parseFloat(t.attr("data-nprice")),delivery_fee=parseFloat(t.attr("data-delivery")),is_discount = t.attr("data-is_discount"),discount_value = t.attr("data-discount_value");

					if(!t.hasClass("baozhuang")){

						totalCount += count;
						totalPrice += ((price + nprice) * count) + (count * dabao)  ;//总费用+打包费+配送费

						//将数据保存至
						data[i] = {
							"id": id,
							"title": title,
							"pic": pic,
							"unit": unit,
							"price": price,
							"count": count,
							"dabao": dabao,
							"ntitle": ntitle,
							"nprice": nprice,
							"is_discount":is_discount,
							"discount_value":discount_value,
							"delivery":delivery_fee
						};


					}
				});

				utils.setStorage("wm_cart_"+shopid, JSON.stringify(data));
			}else{
				//cartInit.hide();
				utils.removeStorage("wm_cart_"+shopid);
				$('#gopay a').html(echoCurrency('symbol')+(Number(baseprice))+langData['waimai'][7][154]);  //多少起送
			}
			//totalPrice =parseFloat(totalPrice)+ parseFloat(delivery_fee);//总费用+打包费

			$(".cart-wrap .left-side .cartNum").html(totalCount);
			totalPrice =parseFloat(totalPrice)
			if (totalPrice < Number(baseprice)) {
				$('#gopay a').html(langData['waimai'][7][153]+'<em>'+echoCurrency('symbol')+(Number(baseprice)-totalPrice)+'</em> '+langData['waimai'][7][154]);   //还差多少起送
				$('.car_button').addClass('no_base');
			}else{
				$('.car_button').removeClass('no_base');
				$('#gopay a').html(langData['waimai'][3][51]);//去支付
			}
			$(".cart-box .all-price .car-price em").html(totalPrice.toFixed(2));
			//购物车空时
			if(totalCount == 0){
				//$('.cart_kong').css('display','block');
				var kong=[];
				kong.push('<div class="cart_kong">');
				kong.push('<div class="kong_top">');
				kong.push('<div class="kong_img"><img src="'+templatePath+'images/kong.png" alt=""></div>');
				kong.push('<h2>'+langData['waimai'][8][82]+'</h2>');//购物车空空如也
				kong.push('<p>'+langData['waimai'][8][83]+'</p>');//快去订餐吧，总有你心仪的美食
				kong.push('</div>');
				kong.push('</div>');
				$(".cart-box").append(kong.join(""));
			}

		}

		//选择多规格
		//btn: 按钮，id：商品ID，title：商品名，nature：属性json，price：单价，dabao：打包费
		,naturePopup: function(btn, id, title, nature, price, dabao){
			var list = [], skuDataNames = [], skuDataPrices = [];
			if(nature && nature.length > 0){
				for(var i = 0; i < nature.length; i++){
					var ifnoAddFee = nature[i].data.every(function(feature){
						return (feature.price == '0')
					})
					var clsName = nature.length == 1 && nature[i].maxchoose == 1 && !ifnoAddFee ? 'oneFeature' : ''
					list.push('<dl data-maxchoose="'+(nature[i].maxchoose ? nature[i].maxchoose : 1)+'" class="'+clsName+'"><dt>'+nature[i].name+'</dt><dd class="fn-clear">');

					var data = nature[i].data;

					console.log(data);
					skuDataNames[i] = [];
					skuDataPrices[i] = [];
					for(var d = 0; d < data.length; d++){
						skuDataNames[i].push(data[d].value);
						skuDataPrices[i].push(data[d].price);
						var cls = data[d].is_open == undefined || data[d].is_open == 0 ? '' : ' class="disabled"';
						var currPrice = (Number(data[d].price) + Number(price) + Number(dabao)).toFixed(2)
						list.push('<a href="javascript:;"'+cls+' data-natPrice="'+data[d].price+'"><span class="foodname">'+data[d].value+'</span><span class="feature_price">'+echoCurrency("symbol")+'<b>'+parseFloat(currPrice)+'</b></span></a>');
					}
					list.push('</dd></dl>');
				}
			}
			if(list){
				$(".nature h2 strong").html(title);
				$(".nature .con").html(list.join(""));
				$(".nature .fot span strong").html(price.toFixed(2));
			}

			$(".nature, .mask_nature").attr("style", "display: block");
			$(".nature .confirm").attr("disabled", true);

			var pic = btn.closest(".car_t1").data("src"), unit = btn.closest(".car_t1").data("unit");

			natureConfig.id = id;
			natureConfig.title = title;
			natureConfig.pic = pic;
			natureConfig.unit = unit;
			natureConfig.unitPrice = price;
			natureConfig.dabao = dabao;
			natureConfig.names = cartInit.descartes(skuDataNames);
			natureConfig.prices = cartInit.descartes(skuDataPrices);

		}

		//更新购物车商品
		,updateFood: function(type, btn, id, title, pic, unit, price, dabao, ntitle, nprice,is_discount,discount_value){


			//先删除打包费
			$(".cart-box").find(".baozhuang").remove();
			//先删除配送费
			$(".cart-box").find(".peisong").remove();
			//先删总送费
			$(".cart-box").find(".all-price").remove();

			//先验证购物车中是否已经存在
			var has, dabaoPrice = 0, dabao = parseFloat(dabao);
			$(".cart-box").find(".cart-item").each(function(){
				var lb = $(this), lid = Number(lb.attr("data-id")), lntitle = lb.attr("data-ntitle");
				var dabao_ = parseFloat(lb.attr("data-dabao"));
				var accountObj = lb.find(".num-account"), account = Number(accountObj.text());
				if(!lb.hasClass("baozhuang")){

					if(lid == id && lntitle == ntitle){
						has = true;

						//如果是减少则删除当前商品在购物车的内容
						if(account == 0 || (type == "reduce" && account == 1)){
							dabao_ = 0;
							lb.remove();
						}else{
							account = type == "plus" ? account + 1 : account - 1;
							accountObj.html(account).show();
							lb.find(".sale-price").html(echoCurrency("symbol")+ Number((account * Number(nprice + price))).toFixed(2));
						}

					}

					if(dabao_){

						dabaoPrice += dabao_ * account;

					}
				}
			});

			if(!has && type == "plus"){
				$('.cart-box .cart_kong').hide();
				var list = [];
				list.push('<div class="cart-item fn-clear" data-id="'+id+'" data-name="'+title+'" data-pic="'+pic+'" data-unit="'+unit+'" data-price="'+price+'" data-dabao="'+dabao+'" data-ntitle="'+ntitle+'" data-nprice="'+nprice+'" data-delivery="'+delivery_fee+'" data-is_discount="'+is_discount+'" data-discount_value="'+discount_value+'">');
				list.push('<span class="info">'+title+'</span> ');
				if(ntitle){
					list.push('<span class="guige">'+ntitle+'</span>');
				}
				list.push('<span class="num">');
				list.push('<em class="num-rec">－</em>');
				list.push('<em class="num-account">1</em>');
				list.push('<em class="num-add">＋</em>');
				list.push('</span>');
				list.push('<span class="sale-price fn-right">'+echoCurrency("symbol")+Number(price + nprice).toFixed(2)+'</span>');
				list.push('</div>');

				$(".cart-box .con").append(list.join(""));

				if(dabao){
					dabaoPrice += dabao;
				}
			}

			//打包费用
			if(dabaoPrice > 0){
				var list = [];
				list.push('<div class="baozhuang price-item cart-item"><span>'+langData['waimai'][8][81]+'</span><span class="bao-price">'+echoCurrency("symbol")+dabaoPrice.toFixed(2)+'</span></div>');//包装费
				$(".cart-box .con").append(list.join(""));
			}
			var deliveryFee = delivery_fee;
			//配送费用
			if(deliveryFee > 0){
				var list = [];
				list.push('<div class="peisong price-item"><span>'+langData['waimai'][2][7]+'</span><span class="pei-price">'+echoCurrency("symbol")+deliveryFee+'</span></div></div>');//配送费
				$(".cart-box .con").append(list.join(""));
			}
			//总费用
			if(price>0){
				var list = [];
				list.push('<div class="all-price fn-clear">');
				list.push('<span class="car-price">'+echoCurrency('symbol')+'<em>0</em></span>');
				list.push('<span class="car_button"><button id="gopay"><a href="javascript:;">'+langData['waimai'][2][40]+'</a></button></span>');//去支付
				list.push('</div>');
				$(".cart-box .con").append(list.join(""));
			}
			cartInit.updateTypeSelectCount(btn);

			//统计汇总
			cartInit.statistic();

			// 购物车效果
			if(type == "plus"){
				var offset = $(".cart .cart-icon").offset();//匹配元素相对于文档的偏移（位置）
				var t = btn.offset();
				var scH = $(window).scrollTop();
				var img = btn.closest(".main_item").find('img').attr('src'); //获取当前点击图片链接
				var flyer = $('<img class="flyer-img" src="' + img + '">'); //抛物体对象
				flyer.fly({
					start: {
						left: t.left - 50, //抛物体起点横坐标
						top: t.top - scH - 30 //抛物体起点纵坐标
					},
					end: {
						left: offset.left + 15, //抛物体终点横坐标
						top: offset.top - scH, //抛物体终点纵坐标
						width: 15,
						height: 15

					},
					onEnd: function() {
						this.destroy(); //销毁抛物体
						$('.cart .cart-icon').addClass('swing');

						setTimeout(function(){$('.cart .cart-icon').removeClass('swing')},300);
					}
				});

			}

		}

		//统计分类已选数量
		,updateTypeSelectCount: function(btn){
			var mainItem = btn.closest(".main_item"), mainCount = 0;
			mainItem.find(".num-account").each(function(){
				mainCount += Number($(this).text());
			});

		}

		//增加或减少
		,plusORreduce: function(type, btn){
			var t = $(btn), par = t.closest(".car_t1"),
				id = par.data("id"),    //商品ID
				title = par.data("title"),  //商品名称
				src = par.data("src"),  //商品图片
				price = parseFloat(par.data("price")),  //商品单价
				unit = par.data("unit"),  //商品单位
				dabao = par.data("dabao"),  //打包费
				stock = par.data("stock"),  //商品库存
				nature = par.data("nature"),  //商品自定义属性  [{"name":"类型","data":[{"value":"大杯","price":"2"},{"value":"中杯","price":"1"},{"value":"小杯","price":"0"}]},{"name":"辣度","data":[{"value":"微辣","price":"0"},{"value":"中辣","price":"0"},{"value":"特辣","price":"0"}]}]
				limitfood = Number(par.data("limitfood")),  //是否限购
				foodnum = Number(par.data("foodnum")),  //限购数量
				stime = par.data("stime"),  //限购开始日期
				etime = par.data("etime")+86400,  //限购结束日期
				times = par.data("times"), //限购时间段  [["06:00","10:00"],["10:00","14:00"],["14:00","17:00"],["00:00","00:00"],["00:00","00:00"],["00:00","00:00"]]
				isDiscount = par.data("is_discount");  //单个商品是否开启折扣
				discount_value = par.data("discount_value");  //单个商品是否开启折扣
			dabao = dabao ? dabao : 0;

			var count = Number(par.find(".num-account").text());

			//增加
			if(type == "plus"){
				count++;
				if (nature && nature.length > 0 && limitfood) {
					$(".cart-wrap .cart-item[data-id='"+id+"']").each(function(){
						var dd = $(this),num = Number(dd.find('.num-account').text());
						count += num;
					});
				}
			//减少
			}else{

				//如果是多规格，需要在购物车中操作减少
				if(count > 0 && nature && nature.length > 0){
					alert(langData['siteConfig'][20][445]);//多规格商品只能去购物车中删除哦
					return false;
				}
				count = count > 1 ? count-1 : 0;

			}

			//最多限制99个
			count = count > 99 ? 99 : count;

			//限购验证
			if(limitfood){

				//时间段
				var inTime;
				for(var i = 0; i < times.length; i++){
					var start = times[i][0], end = times[i][1];
					if(start != "" && start != "00:00" && end != "" && end != "00:00"){
						start = Number(start.replace(":", ""));
						end = Number(end.replace(":", ""));
						ntime = Number(nowTime.replace(":", ""));

						if(start < ntime && end > ntime){
							inTime = 1;
						}
					}
				}

				if(!inTime){
					alert(langData['siteConfig'][20][446]);
					return false;
				}
				console.log(foodnum , count )
				if(foodnum < count && stime < nowDate && etime > nowDate){
					alert(langData['siteConfig'][20][447]);
					return false;
				}
			}

			//库存验证
			if(stock != "" && (stock == 0 || stock - count < 0)){
				$('.stockPop,.stock_alert').show();return false;

				//如果购物车数量超出库存，将购物车数量更新为库存的量
				if(stock - count < 0){
					par.find(".num-account").html(stock).show();
					par.find('.cart-num').addClass('show');
					par.find('.carAdd').hide();

				}
			}else{

				//如果是添加多规格的商品，需要在浮动层中选择
				if(type == "plus" && nature){
					cartInit.naturePopup(t, id, title, nature, price, dabao);
					return false;
				}

				par.find(".num-account").html(count).addClass('show');
				if (count != 0) {
					par.find('.cart-num').addClass('show');
					par.find('.carAdd').hide();
				}else {
					par.find('.cart-num').removeClass('show');
					par.find('.num-account').removeClass('show');
					par.find('.carAdd').show();
				}
			}
			//更新购物车商品
			cartInit.updateFood(type, t, id, title, src, unit, price, dabao, "", 0,isDiscount,discount_value);

		}
		//增加或减少
		,addORreduce: function(type, btn){
			var t = $(btn), par = t.closest(".car_t1"),
				id = par.data("id"),    //商品ID
				title = par.data("title"),  //商品名称
				src = par.data("src"),  //商品图片
				price = parseFloat(par.data("price")),  //商品单价
				unit = par.data("unit"),  //商品单位
				dabao = par.data("dabao"),  //打包费
				stock = par.data("stock"),  //商品库存
				nature = par.data("nature"),  //商品自定义属性  [{"name":"类型","data":[{"value":"大杯","price":"2"},{"value":"中杯","price":"1"},{"value":"小杯","price":"0"}]},{"name":"辣度","data":[{"value":"微辣","price":"0"},{"value":"中辣","price":"0"},{"value":"特辣","price":"0"}]}]
				limitfood = Number(par.data("limitfood")),  //是否限购
				foodnum = Number(par.data("foodnum")),  //限购数量
				stime = par.data("stime"),  //限购开始日期
				etime = par.data("etime")+86400,  //限购结束日期
				times = par.data("times"), //限购时间段  [["06:00","10:00"],["10:00","14:00"],["14:00","17:00"],["00:00","00:00"],["00:00","00:00"],["00:00","00:00"]]
				isDiscount = par.data("is_discount");  //单个商品是否开启折扣
				discount_value = par.data("discount_value");  //单个商品是否开启折扣
			dabao = dabao ? dabao : 0;

			var count = Number(par.find(".num-account").text());

			//增加

			count++;



			//最多限制99个
			count = count > 99 ? 99 : count;

			//限购验证
			if(limitfood){

				//时间段
				var inTime;
				for(var i = 0; i < times.length; i++){
					var start = times[i][0], end = times[i][1];
					if(start != "" && start != "00:00" && end != "" && end != "00:00"){
						start = Number(start.replace(":", ""));
						end = Number(end.replace(":", ""));
						ntime = Number(nowTime.replace(":", ""));

						if(start < ntime && end > ntime){
							inTime = 1;
						}
					}
				}

				if(!inTime){
					alert(langData['siteConfig'][20][446]);
					return false;
				}

				if(foodnum < count && stime < nowDate && etime > nowDate){
					alert(langData['siteConfig'][20][447]);
					return false;
				}
			}

			//库存验证
			if(stock != "" && (stock == 0 || stock - count < 0)){
				$('.stockPop,.stock_alert').show();return false;//库存不足弹窗

				//如果购物车数量超出库存，将购物车数量更新为库存的量
				if(stock - count < 0){
					par.find(".num-account").html(stock).show();
					par.find('.cart-num').addClass('show');
					par.find('.carAdd').hide();

				}
			}else{

				//如果是添加多规格的商品，需要在浮动层中选择
				if(type == "plus" && nature){
					cartInit.naturePopup(t, id, title, nature, price, dabao);
					return false;
				}

				par.find(".num-account").html(count).addClass('show');
				if (count == 0) {
					// par.find('.cart-num').addClass('show');
					// par.find('.carAdd').hide();

					par.find('.cart-num').removeClass('show');
					par.find('.num-account').removeClass('show');
					par.find('.carAdd').show();
				}
			}

			//更新购物车商品
			cartInit.updateFood(type, t, id, title, src, unit, price, dabao, "", 0,isDiscount,discount_value);

		}


		//清空购物车
		,clean: function(){
			if(confirm(langData['siteConfig'][20][449])){//确认要清空吗？
				$(".cart-box .con").html("");
				$(".main_left i").remove();
				$(".main_right .num-account").html(0);
				$('.num-account, .cart-num').removeClass('show');
				cartInit.statistic();
			}
		}

		//笛卡儿积组合
		,descartes: function(list){
			//parent上一级索引;count指针计数
			var point = {};
			var result = [];
			var pIndex = null;
			var tempCount = 0;
			var temp  = [];
			//根据参数列生成指针对象

			for(var index in list){
				if(index != 'in_array' && typeof list[index] == 'object'){
					point[index] = {'parent':pIndex,'count':0}
					pIndex = index;
				}
			}
			//单维度数据结构直接返回
			if(pIndex == null){
				return list;
			}
			//动态生成笛卡尔积
			while(true){
				var index_ = null;
				for(var index in list){
					if(index != 'in_array'){
						tempCount = point[index]['count'];
						temp.push(list[index][tempCount]);
						index_ = index;
					}
				}
				index = index_;
				//压入结果数组
				result.push(temp);
				temp = [];
				//检查指针最大值问题
				while(true){
					if(point[index]['count']+1 >= list[index].length){
						point[index]['count'] = 0;
						pIndex = point[index]['parent'];
						if(pIndex == null){
							return result;
						}
						//赋值parent进行再次检查
						index = pIndex;
					}else{
						point[index]['count']++;
						break;
					}
				}
			}
		}
	}

	cartInit.init();

	var localData = utils.getStorage('waimai_local');
	if(localData){
		var last = localData.time;
	    var time = Date.parse(new Date());
	    // console.log(time - last < 60*10*1000);
	    // if(time - last < 60*10*1000){
	    	lat = localData.lat;
	    	lng = localData.lng;
			$.cookie(cookiePre + "waimai_useraddr", lat+','+lng);
	    // }
	}

})

Array.prototype.in_array = function(e){
	for(i=0;i<this.length && this[i]!=e;i++);
	return !(i==this.length);
}
