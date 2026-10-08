if(!state){
	setTimeout(function(){
		alert(langData['siteConfig'][22][19]);
	},1000)
	$(".ok a").attr("href", "javascript:;").click(function(){
		alert(langData['siteConfig'][22][19]);
	});
}
var natureConfig = {
	id: 0, title: "", pic: "", unit: "", unitPrice: 0, dabao: 0, selectNature: "", selectPrice: 0, names: [], prices: []
};

$(function(){

	var firstLoad = true, page = 1, isload = false, loading = $('.loading');

	//点菜、商家切换
    $('.menu-tab li').click(function() {
        var index = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $('.menu-con').eq(index).show().siblings().hide();

        if(index == 1 && firstLoad){
        	firstLoad = false;
        	getList(true);
        }
    })


	// 点菜左边切换
    $('.main_left li').on('touchend',function() {
        var index = $(this).index();
        $(this).addClass('ml_bac').siblings().removeClass('ml_bac');
        $(".main_right").scrollTop($(".main_item:eq("+index+")").position().top);
    })

    var position = [];
    $('.main_right .main_item').each(function(){
    	var distant = $(this).position().top;
    	position.push(distant);
    })

    $('.main_right').scroll(function(){
    	var scroll = $(this).scrollTop();
    	for (var i = 0; i <= position.length; i++) {
    		if (scroll >= position[i] - 1) {
    			$('.main_left li').eq(i).addClass('ml_bac').siblings().removeClass('ml_bac');
    		}
    	}
    })


	$('.shop-txt-store').click(function(){
		if ($('.shop-txt-store').hasClass('shou')) {
			$('.shop-txt-store').removeClass('shou');

			$.post("/include/ajax.php?service=member&action=collect&module=waimai&temp=shop&type=del&id="+id);
		}else{
			$('.shop-txt-store').addClass('shou');

			$.post("/include/ajax.php?service=member&action=collect&module=waimai&temp=shop&type=add&id="+id);
		};
	})



	$('#menu-comment').scroll(function(){
		var sct = $('#menu-comment').scrollTop(), comHeight = $(".comment").height();
		if(!isload && sct + $('#menu-comment').height() + 100 > comHeight){
			page++;
			getList();
		}
	})



	function auto_data_size(){
		var imgss= $("figure img");
		$("figure a").each(function() {
			var t = $(this);
			var imgs = new Image();
			imgs.src = t.attr("href");

			if (imgs.complete) {
				t.attr("data-size","").attr("data-size",imgs.width+"x"+imgs.height);
		    } else {
		        imgs.onload = function () {
					t.attr("data-size","").attr("data-size",imgs.width+"x"+imgs.height);
		            imgs.onload = null;
		        };
		    };

		})
	};


	function getList(first){

		isload = true;

		var data = [];
		data.push('sid='+shopid);

		loading.show();
		$.ajax({
			url: masterDomain + '/include/ajax.php?service=waimai&action=common&page='+page+'&pageSize=10',
			type: 'get',
			data: data.join("&"),
			dataType: 'jsonp',
			success: function(data){
				if(data && data.state == 100){

					var list = data.info.list, html = [];

					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var obj = list[i], item = [];

							item.push('<div class="comment-list">');
							item.push('	<div class="comment-user">');
							item.push('		<img src="'+(obj.photo ? obj.photo : '/static/images/default_user.jpg')+'" alt="">');
							item.push('	</div>');
							item.push('	<div class="comment-info">');
							item.push('		<h3>'+obj.user+'<em>'+obj.pubdatef+'</em></h3>');
							item.push('		<div class="judge-box">');
							item.push('			<div class="judge-star l"><s style="width:'+obj.star/5*100+'%;"></s></div>');
							item.push('			<span class="sale-time">'+obj.time+langData['siteConfig'][22][93]+'</span>');
							item.push('			<div class="clear"></div>');
							item.push('		</div>');
							item.push('		<div class="comment-txt">'+obj.content+'</div>');
							if(obj.pics != ''){
								item.push('		<div class="my-gallery" itemscope="" itemtype="" data-pswp-uid="1">');
								for(var m = 0; m < obj.pics.length; m++){
									var pic = obj.pics[m];
									item.push('			<figure itemprop="associatedMedia">');
									item.push('				<a href="'+pic+'" itemprop="contentUrl" data-size="400x300">');
									item.push('					<img src="'+pic+'" itemprop="thumbnail" alt="Image description">');
									item.push('				</a>');
									item.push('			</figure>');
								}
								item.push('		</div>');
							}
							if(obj.reply != "" && obj.replaydate != 0){
								item.push('<div class="reply">');
								item.push('<p>'+langData['siteConfig'][16][67]+obj.reply+'<span>'+obj.replydatef+'</span></p>');
								item.push('</div>');
							}
							item.push('	</div>');
							item.push('</div>');

							html.push(item.join(""));
						}

						loading.hide().before(html.join(""));
						auto_data_size();

						initPhotoSwipeFromDOM('.my-gallery');

						isload = false;

					}else{
						loading.text(langData['siteConfig'][2][20]);
					}
				}else{
					loading.text(langData['siteConfig'][2][20]);
				}
			},
			error: function(){
				isload = false;
				loading.text(langData['siteConfig'][20][458]);
			}
		})

	}

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
			var cartHistory = utils.getStorage("business_diancan_cart_"+shopid);
			if(cartHistory && foodIds.length > 0){
				var list = [], dabaoPrice = 0;
				for (var i = 0; i < cartHistory.length; i++) {

					// 购物车中商品不在当前页面中跳过
					if(!foodIds.in_array(cartHistory[i].id)){
						continue;
					}

					list.push('<div class="cart-list fn-clear" data-id="'+cartHistory[i].id+'" data-name="'+cartHistory[i].title+'" data-pic="'+cartHistory[i].pic+'" data-unit="'+cartHistory[i].unit+'" data-price="'+cartHistory[i].price+'" data-dabao="'+cartHistory[i].dabao+'" data-ntitle="'+cartHistory[i].ntitle+'" data-nprice="'+cartHistory[i].nprice+'">');
					list.push('<div class="info">');
					list.push('<h3>'+cartHistory[i].title+'</h3>');
					if(cartHistory[i].ntitle){
						list.push('<p>'+cartHistory[i].ntitle+'</p>');
					}
					list.push('</div>');
					list.push('<span class="sale-price">&yen;'+Number(cartHistory[i].price+cartHistory[i].nprice).toFixed(2)+'</span>');
					list.push('<span class="r">');
					list.push('<em class="num-rec">－</em>');
					list.push('<em class="num-account">'+cartHistory[i].count+'</em>');
					list.push('<em class="num-add">＋</em>');
					list.push('</span>');
					list.push('</div>');

					if(cartHistory[i].dabao){
						dabaoPrice += Number(cartHistory[i].dabao) * cartHistory[i].count;
					}

					//更新页面已选数量
					var numAccount = $("#food"+cartHistory[i].id).find(".num-account");
					var foodCount = Number(numAccount.text());
					numAccount.html(foodCount + cartHistory[i].count);
					cartInit.updateTypeSelectCount(numAccount);
				}

				//打包费用
				if(dabaoPrice > 0){
					list.push('<div class="cart-list dabao fn-clear">');
					list.push('<div class="info">');
					list.push('<h3>'+langData['siteConfig'][19][890]+'</h3>');
					list.push('</div>');
					list.push('<span class="sale-price">&yen;'+dabaoPrice.toFixed(2)+'</span>');
					list.push('</div>');
				}

				$(".cart-box .con").html(list.join(""));

				cartInit.statistic();
			}

			//点击购物车图标，显示购物车
			$(".price .gou").bind("click", function(){
				if($(".cart-box").is(":visible")){
					cartInit.hide();
				}else{
					cartInit.show();
				}
			});

			//点击购物车图标，显示购物车
			$(".mask_cart").bind("click", function(){
				cartInit.hide();
			});

			//页面加
			$(".main_item .plus").bind("click", function(){
				cartInit.plusORreduce("plus", this);
			});

			//购物车加
			$(".cart-box").delegate(".num-add", "click", function(){
				var t = $(this), par = t.closest(".cart-list"), id = par.attr("data-id"), title = par.attr("data-title"), price = par.attr("data-price"), dabao = par.attr("data-dabao"), ntitle = par.attr("data-ntitle"), nprice = par.attr("data-nprice");
				if(ntitle == ""){
					$("#food"+id).find(".plus").click();
				}else{
					//多规格商品在购物车中增加数量
					var listAccount = $("#food"+id).find(".num-account"), newListAccount = Number(listAccount.text()) + 1;
					listAccount.html(newListAccount);
					cartInit.updateFood("plus", $("#food"+id).find(".plus"), id, title, "", "", parseFloat(price), parseFloat(dabao), ntitle, parseFloat(nprice));
				}
			});

			//页面减
			$(".main_item .reduce").bind("click", function(){
				cartInit.plusORreduce("reduce", this);
			});

			//购物车减
			$(".cart-box").delegate(".num-rec", "click", function(){
				var t = $(this), par = t.closest(".cart-list"), id = par.attr("data-id"), title = par.attr("data-title"), price = par.attr("data-price"), dabao = par.attr("data-dabao"), ntitle = par.attr("data-ntitle"), nprice = par.attr("data-nprice");
				if(ntitle == ""){
					$("#food"+id).find(".reduce").click();
				}else{

					//多规格商品在购物车中减少数量
					var listAccount = $("#food"+id).find(".num-account"), newListAccount = Number(listAccount.text()) - 1;
					listAccount.html(newListAccount);
					cartInit.updateFood("reduce", $("#food"+id).find(".plus"), id, title, "", "", parseFloat(price), parseFloat(dabao), ntitle, parseFloat(nprice));

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
							itemSel.push($(this).text());
						})
						selectArr.push(itemSel.join("#"));
					}
				});

				var selectNames = selectArr.join("/");

				if(is){
					$(".nature .confirm").removeAttr("disabled");

					var only = false;

					for(var i = 0; i < natureConfig.names.length; i++){
						if(selectNames == natureConfig.names[i].join("/")){

							only = true;

							var selectPrice = 0;

							for(var p = 0; p < natureConfig.prices[i].length; p++){
								selectPrice += parseFloat(natureConfig.prices[i][p]);
							}

							natureConfig.selectNature = selectNames;
							natureConfig.selectPrice = selectPrice;
							$(".nature .fot span strong").html((natureConfig.unitPrice+selectPrice).toFixed(2));

						}
					}

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
				countObj.html(count+1);
				cartInit.updateFood("plus", btn, natureConfig.id, natureConfig.title, natureConfig.pic, natureConfig.unit, natureConfig.unitPrice, natureConfig.dabao, natureConfig.selectNature, natureConfig.selectPrice);
				cartInit.hideNature();
			});

		}

		//显示
		,show: function(){
			if($(".cart-box").find(".cart-list").length > 0){
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

		//统计汇总
		,statistic: function(){

			var totalCount = 0, totalPrice = 0.00;
			if($(".cart-box").find(".cart-list").length > 0){
				var data = [];
				$(".cart-box").find(".cart-list").each(function(i){
					var t = $(this), id = t.attr("data-id"), title = t.attr("data-name"), pic = t.attr("data-pic"), unit = t.attr("data-unit"), price = parseFloat(t.attr("data-price")), count = Number(t.find(".num-account").text()), dabao = parseFloat(t.attr("data-dabao")), ntitle = t.attr("data-ntitle"), nprice = parseFloat(t.attr("data-nprice"));
					if(!t.hasClass("dabao")){
						totalCount += count;
						totalPrice += (price + nprice) * count + count * dabao;

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
							"nprice": nprice
						};
					}
				});

				utils.setStorage("business_diancan_cart_"+shopid, JSON.stringify(data));
			}else{
				cartInit.hide();
				utils.removeStorage("business_diancan_cart_"+shopid);
			}
			$(".price .gou b").html(totalCount);
			$(".price .zong_p strong").html(totalPrice.toFixed(2));

		}

		//选择多规格
		//btn: 按钮，id：商品ID，title：商品名，nature：属性json，price：单价，dabao：打包费
		,naturePopup: function(btn, id, title, nature, price, dabao){

			var list = [], skuDataNames = [], skuDataPrices = [];
			if(nature && nature.length > 0){
				for(var i = 0; i < nature.length; i++){
					list.push('<dl data-maxchoose="'+(nature[i].maxchoose ? nature[i].maxchoose : 1)+'"><dt>'+nature[i].name+'</dt><dd class="fn-clear">');
					var data = nature[i].data;
					skuDataNames[i] = [];
					skuDataPrices[i] = [];
					for(var d = 0; d < data.length; d++){
						skuDataNames[i].push(data[d].value);
						skuDataPrices[i].push(data[d].price);
						var cls = data[d].is_open == undefined || data[d].is_open == 0 ? '' : ' class="disabled"';
						list.push('<a href="javascript:;"'+cls+'>'+data[d].value+'</a>');
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
		,updateFood: function(type, btn, id, title, pic, unit, price, dabao, ntitle, nprice){

			//先删除打包费
			$(".cart-box").find(".dabao").remove();

			//先验证购物车中是否已经存在
			var has, dabaoPrice = 0, dabao = parseFloat(dabao);
			$(".cart-box").find(".cart-list").each(function(){
				var lb = $(this), lid = Number(lb.attr("data-id")), lntitle = lb.attr("data-ntitle");
				var dabao_ = parseFloat(lb.attr("data-dabao"));
				var accountObj = lb.find(".num-account"), account = Number(accountObj.text());
				if(!lb.hasClass("dabao")){
					if(lid == id && lntitle == ntitle){
						has = true;

						//如果是减少则删除当前商品在购物车的内容
						if(account == 0 || (type == "reduce" && account == 1)){
							dabao_ = 0;
							lb.remove();
						}else{
							account = type == "plus" ? account + 1 : account - 1;
							accountObj.html(account);
							lb.find(".sale-price").html("&yen;"+ Number((account * Number(nprice + price))).toFixed(2));
						}

					}

					if(dabao_){
						dabaoPrice += dabao_ * account;
					}
				}
			});

			if(!has && type == "plus"){
				var list = [];
				list.push('<div class="cart-list fn-clear" data-id="'+id+'" data-name="'+title+'" data-pic="'+pic+'" data-unit="'+unit+'" data-price="'+price+'" data-dabao="'+dabao+'" data-ntitle="'+ntitle+'" data-nprice="'+nprice+'">');
				list.push('<div class="info">');
				list.push('<h3>'+title+'</h3>');
				if(ntitle){
					list.push('<p>'+ntitle+'</p>');
				}
				list.push('</div>');
				list.push('<span class="sale-price">&yen;'+Number(price+nprice).toFixed(2)+'</span>');
				list.push('<span class="r">');
				list.push('<em class="num-rec">－</em>');
				list.push('<em class="num-account">1</em>');
				list.push('<em class="num-add">＋</em>');
				list.push('</span>');
				list.push('</div>');

				$(".cart-box .con").append(list.join(""));

				if(dabao){
					dabaoPrice += dabao;
				}
			}


			//打包费用
			if(dabaoPrice > 0){
				var list = [];
				list.push('<div class="cart-list dabao fn-clear">');
				list.push('<div class="info">');
				list.push('<h3>'+langData['siteConfig'][19][890]+'</h3>');
				list.push('</div>');
				list.push('<span class="sale-price">&yen;'+dabaoPrice.toFixed(2)+'</span>');
				list.push('</div>');
				$(".cart-box .con").append(list.join(""));
			}

			cartInit.updateTypeSelectCount(btn);

			//统计汇总
			cartInit.statistic();

			// 购物车效果
			if(type == "plus" && !$(".cart-box").is(":visible")){
				var offset = $(".price .gou").offset();
				var t = btn.offset();
				var scH = $(window).scrollTop();
				var img = btn.closest(".car_t1").find('img').attr('src'); //获取当前点击图片链接
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
						$('.price .gou').addClass('swing');

						setTimeout(function(){$('.price .gou').removeClass('swing')},300);
					}
				});
			}

		}

		//统计分类已选数量
		,updateTypeSelectCount: function(btn){
			var mainItem = btn.closest(".main_item"), mainId = Number(mainItem.attr("id").replace("item", "")), mainCount = 0;
			mainItem.find(".num-account").each(function(){
				mainCount += Number($(this).text());
			});

			//更新侧栏已点数量
			$(".main_left li").each(function(){
				var mli = $(this), mlid = mli.data("id"), mi = mli.find("i");
				if(mlid == mainId){
					if(mainCount == 0){
						mi.remove();
					}else{
						if(mi.size() > 0){
							mi.html(mainCount);
						}else{
							mli.append("<i>"+mainCount+"</i>");
						}
					}
				}
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
				times = par.data("times");  //限购时间段  [["06:00","10:00"],["10:00","14:00"],["14:00","17:00"],["00:00","00:00"],["00:00","00:00"],["00:00","00:00"]]

			dabao = dabao ? dabao : 0;

			var count = Number(par.find(".num-account").text());

			//增加
			if(type == "plus"){
				count++;

			//减少
			}else{

				//如果是多规格，需要在购物车中操作减少
				if(count > 0 && nature && nature.length > 0){
					alert(langData['siteConfig'][20][445]);
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

				if(foodnum < count && stime < nowDate && etime > nowDate){
					alert(langData['siteConfig'][20][447]);
					return false;
				}
			}

			//库存验证
			if(stock != "" && (stock == 0 || stock - count < 0)){
				alert(langData['siteConfig'][20][448]);

				//如果购物车数量超出库存，将购物车数量更新为库存的量
				if(stock - count < 0){
					par.find(".num-account").html(stock);
				}
			}else{

				//如果是添加多规格的商品，需要在浮动层中选择
				if(type == "plus" && nature){
					cartInit.naturePopup(t, id, title, nature, price, dabao);
					return false;
				}

				par.find(".num-account").html(count);
			}

			//更新购物车商品
			cartInit.updateFood(type, t, id, title, src, unit, price, dabao, "", 0);

		}

		//清空购物车
		,clean: function(){
			if(confirm(langData['siteConfig'][20][449])){
				$(".cart-box .con").html("");
				$(".main_left i").remove();
				$(".main_right .num-account").html(0);
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

})

Array.prototype.in_array = function(e){
	for(i=0;i<this.length && this[i]!=e;i++);
	return !(i==this.length);
}
