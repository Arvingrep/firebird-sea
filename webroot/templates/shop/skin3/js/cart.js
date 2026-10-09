
$(function () {
	//底部结算固定
	var stopH = $('.sum').position().top;
	var wH = $(window).height();
	if (stopH > wH) { //超出页面
		$('.sum').addClass('fixed');
	}

	$(window).scroll(function () {
		var sctop = $(this).scrollTop();
		if (sctop >= (stopH - wH)) {
			$('.sum').removeClass('fixed');
		} else {
			$('.sum').addClass('fixed');
		}
	});

	// 将没有数据的店铺隐藏
	$(".sj ").each(function () {
		var pro = $(this).find('.proList ul')
		if (pro.length == 0) {
			$(this).hide()
		}
	})

    $('.cartTab li:eq(0)').addClass('active');
    $('.buyWrap .canbuy:eq(0)').addClass('canshow');



	//全部商品弹窗--显示
	$('.sum .right .hasChose').click(function () {
		var choseNum = $('.sum .choseNum').text();
		if (choseNum * 1 == 0) return false; //没有商品时不显示
		//已选商品
		var choseHtml = [];
		$(".canbuy.canshow .proList .sp .name-circle.on").each(function () {
			var t = $(this),
				par = t.closest('.sp');
			var tid = par.data('id'),
				src = par.find('.goodImg img').attr('src');
			choseHtml.push('<li data-id="' + tid + '">');
			choseHtml.push('	<a href="javascript:;" class="cancelCho">取消选择</a>');
			choseHtml.push('	<div><img src="' + src + '" alt="" ></div>');
			choseHtml.push('</li>');

		})
		$('.choseList ul').html(choseHtml.join(''));
		$('.sum .wrap2').toggleClass('show');

	})
	//全部商品弹窗 滚动
	$(".picScroll-left").slide({
		titCell: ".hd ul",
		mainCell: ".bd ul",
		autoPage: true,
		effect: "left",
		autoPlay: false,
		vis: 11,
		trigger: "click"
	});
	//全部商品弹窗 取消选择
	$('.choseList').delegate('.cancelCho', 'click', function () {

		var par = $(this).closest('li'),
			tid = par.attr('data-id');
		par.remove();
		$('.canbuy.canshow .proList .sp[data-id="' + tid + '"]').find('.name-circle').click();
		var chosLen = $('.choseList li').length;
		if (chosLen == 0) {
			$('.sum .wrap2').removeClass('show');
		}
		getAllChose();
		getTotalPrice();

	})

	//导航全部分类
	$(".lnav").find('.category-popup').hide();

	$(".lnav").hover(function () {
		$(this).find(".category-popup").show();
	}, function () {
		$(this).find(".category-popup").hide();
	});


    $('#confirmType').val($('.cartTab li.active').attr('data-type'));

	//到店优惠--送到家 切换
	$('.cartTab li').click(function () {

		if (!$(this).hasClass('active')) {
			$(this).addClass('active').siblings('li').removeClass('active');
			var tindex = $(this).index();
			var ttype = $(this).attr('data-type');
			$('#confirmType').val(ttype);


			$('.canbuy').eq(tindex).addClass('canshow').siblings('.canbuy').removeClass('canshow');
			if($('.canbuy').eq(tindex).find('.sj')[0]){ //非空
				$('.have.wrap').show();
				$('.null').hide();
			}else{ //空状态
				$('.have.wrap').hide();
				$('.null').show();
			}
			if (tindex == 0) {
				$('.buyWrap .canbuy').eq(0).addClass('canshow');
				var ddcount = $('.buyWrap .canbuy.canshow .sp').length;
				if (ddcount > 0) {
					$(".null").hide();
					$(".have").show();
				} else {
					$(".null").show();
					$(".have").hide();
				}
				//到店 没有运费
				$('.yftxt').text('总价（不含运费）')

			} else if (tindex == 2) {
				$('.buyWrap .canbuy').eq(1).addClass('canshow');
				var ddcount = $('.buyWrap .canbuy.canshow .sp').length;
				if (ddcount > 0) {
					$(".null").hide();
					$(".have").show();
				} else {
					$(".null").show();
					$(".have").hide();
				}
				//送到家 有运费
				// $('.yftxt').text('总价（含运费）')
			}
			getAllChose();
			djslist();
			getTotalPrice();
		}

		stopH = $('.sum').offset().top;
		if (stopH > wH) { //超出页面
			$('.sum').addClass('fixed');
		}
	})

	if ($(".daodUl div").length == 0) {
		$(".cartTab li").eq(2).click()
	}

	//购物车数量
	// var cartCount = $(".sum .right em").html().replace('件商品', '');
	// $(".state .left i").html(cartCount);

	// if(cartCount == 0){
	// 	$(".null").show();
	// 	$(".have").remove();
	// }else{
	// 	$(".numm").remove();
	// }
	var emptyCount = $(".goods .sp").length;
	var ccount = $(".canbuy.canshow  .sj").length;
	if (emptyCount == 0) { //购物车没有东西 以及没有失效的东西
		$(".null").show();
		$(".have").hide();
	} else if (ccount == 0) { //没有到店商品
		$(".null").show();
		$(".have").hide();
	}
	//刚进页面统计可买的数量
	var canbuycount = $(".canbuy.canshow .proList .name-circle.on").length;
	$(".sum .right em").html(canbuycount);


	//数量错误提示
	var errmsgtime;

	function errmsg(div, type, num, nunm, detunit) {
		$('#errmsg').remove();
		clearTimeout(errmsgtime);
		var str = type == 'max' ? '最多购买' + num + detunit : '最少购买' + num + detunit;
		var obj = div.find('.t5 div');
		var top = obj.offset().top - 36;
		var left = obj.offset().left - 20;

		var msgbox = '<div id="errmsg" style="position:absolute;top:' + top + 'px;left:' + left + 'px;width:150px;height:36px;line-height:36px;text-align:center;color:#f76120;font-size:14px;display:none;">' + str + '</div>';
		$('body').append(msgbox);
		$('#errmsg').fadeIn();
		errmsgtime = setTimeout(function () {
			$('#errmsg').remove();
		}, 1500);
	};


	//数量增加、减少
	$(".have").delegate(".t5 a", "click", function () {
		var t = $(this).closest("ul"),
			type = $(this).attr("class"),
			inp = t.find("input"),
			val = Number(inp.val());
		//商品不可买时 不操作
		//var par = $(this).closest('.sp')
		if ($(this).hasClass('disabled')) {
			return false;
		}

		//2021-9-13 增加最小起订量和每次装箱数量
		//每次装箱数量
		var eachcout = t.attr('data-eachcout');
		var mincout = t.attr('data-mincout'); //最小起订量
		//减少
		if (type == "minus") {
			inp.val(val - eachcout * 1);
			t.find('.plus').removeClass('disabled');
			checkCount(t);

			//增加
		} else if (type == "plus") {
			inp.val(val + eachcout * 1);
			t.find('.minus').removeClass('disabled');
			checkCount(t, 1);
		}
	});


	//数量输入变化
	$(".have").delegate(".t5 input", "keyup", function () {
		checkCount($(this).closest("ul"));
	});


	//验证数量
	function checkCount(obj, t) {
		var count = obj.find("input"),
			val = Number(count.val());

		var id = obj.data("id"),
			specation = obj.data("specation"),
			price = Number(obj.data("price")),
			bearfreight = Number(obj.data("bearfreight")),
			valuation = Number(obj.data("valuation")),
			express_start = Number(obj.data("express_start")),
			express_postage = Number(obj.data("express_postage")),
			express_plus = Number(obj.data("express_plus")),
			express_postageplus = Number(obj.data("express_postageplus")),
			preferentialstandard = Number(obj.data("preferentialstandard")),
			preferentialmoney = Number(obj.data("preferentialmoney")),
			weight = Number(obj.data("weight")),
			volume = Number(obj.data("volume")),
			maxCount = Number(obj.data("limit")),
			inventor = Number(obj.data("inventor")),
			mincout = Number(obj.data("mincout")),
			eachcout = Number(obj.data("eachcout")),
			shopunit = obj.data("shopunit");
		if (maxCount == 0) { //限购为0 则表示不限购
			var canbuycount = inventor;
		} else {
			var canbuycount = Math.min.apply(null, [inventor, maxCount]); //库存和限购的最小值为 最大购买数量
		}

		if (val <= mincout) { //最小
			obj.find('.minus').addClass('disabled');
		} else if (val >= canbuycount) { //最大
			obj.find('.plus').addClass('disabled');
		}

		//同步更新购物车数量
		cartlist.find("li[data-id=" + id + "][data-specation=" + specation + "]").attr("data-count", val);
		shopInit.update();


		//运费
		var logistic = getLogisticPrice(bearfreight, valuation, express_start, express_postage, express_plus, express_postageplus, preferentialstandard, preferentialmoney, weight, volume, price, val);
		obj.find(".t6 small").html((logistic == 0 ? langData['shop'][3][2] : langData['shop'][5][9] + "：" + logistic));

		//计算价格
		obj.find(".t6 span").html(echoCurrency('symbol') + (price * val).toFixed(2));

		getTotalPrice();
	}


	//计算总价
	function getTotalPrice() {
		var totalPrice = totalCount = totalAllPrice = 0;

		$(".canbuy.canshow .proList .sp").each(function () {
			var t = $(this);
			if (t.find(".name-circle").hasClass("on")) {
				var count = t.find(".t5 input"),
					val = Number(count.val()),
					id = t.data("id"),
					price = Number(t.data("price")),
					bearfreight = Number(t.data("bearfreight")),
					valuation = Number(t.data("valuation")),
					express_start = Number(t.data("express_start")),
					express_postage = Number(t.data("express_postage")),
					express_plus = Number(t.data("express_plus")),
					express_postageplus = Number(t.data("express_postageplus")),
					preferentialstandard = Number(t.data("preferentialstandard")),
					preferentialmoney = Number(t.data("preferentialmoney")),
					weight = Number(t.data("weight")),
					volume = Number(t.data("volume")),
					maxCount = Number(t.data("limit")),
					inventor = Number(t.data("inventor"));

				//运费
				// var logistic = getLogisticPrice(bearfreight, valuation, express_start, express_postage, express_plus, express_postageplus, preferentialstandard, preferentialmoney, weight, volume, price, val);
				// console.log(logistic)
				totalCount += val;
				//不含运费
				totalPrice += price * val;
				//含运费
				// totalAllPrice += (price+logistic) * val;
				totalAllPrice += (price) * val;
			}
		});

		var buycount = $(".canbuy.canshow .proList .name-circle.on").length;
		$(".sum .right em").html(buycount);
		$(".sum .right strong").html(totalAllPrice.toFixed(2));
		//头部含运费
		$(".tpSettle .tpMoney").html(totalPrice.toFixed(2));

		if (buycount > 0) {
			$("#js,.jiesuan").removeClass("disabled");
			$('.cartTab .tpSettle').addClass('has');
		} else {
			$("#js,.jiesuan").addClass("disabled");
			$('.cartTab .tpSettle').removeClass('has');
		}
	}


	//单个商品删除
	var ds = 1;
	$(".goods li.t7 .deletOne").on("click", function () {
		var t = $(this);
		$('.delAlert').removeClass('show');
		t.siblings('.delAlert').addClass('show');

	});
	//取消删除
	$(".delAlert .cancelDel").on("click", function () {
		$('.delAlert').removeClass('show');
	})
	//确定删除
	$(".delAlert .sureDel").on("click", function () {
		var $delete = $(this),
			allMoney;
		if ($delete.closest(".sj").find("ul").length == 1) {
			$delete.closest(".sj").remove();
		}

		var id = $delete.parents(".sp").attr("data-id");
		var spe = $delete.parents(".sp").attr("data-specation");

		if ($delete.closest(".sj").hasClass('nobuy')) { //删除失效商品
			$delete.parents(".sp").remove();

		} else { //删除相应的购物车中商品
			cartlist.find("li[data-id=" + id + "][data-specation=" + spe + "]").remove();
			shopInit.update();
			$delete.parents(".sp").remove();
			getTotalPrice();
		}

		var num = $(".canbuy.canshow .sj").find(".sp").length;
		if (num == 0) {
			$(".null").show();
			$(".have").hide();
		}


	})


	//删除选中的商品
	$("#deleteAll").bind("click", function () {
		var checkCount = 0;
		$(".canbuy.canshow .sp").each(function () {
			if ($(this).find(".t0 i").hasClass("on")) {
				checkCount++;
			}
		});
		if (checkCount == 0) return false;
		if (confirm(langData['siteConfig'][20][211])) {
			ds = 0;
			$(".canbuy.canshow .sp").each(function () {
				var $delete = $(this);
				if ($(this).find(".t0 i").hasClass("on")) {
					var id = $delete.attr("data-id");
					var spe = $delete.attr("data-specation");
					cartlist.find("li[data-id=" + id + "][data-specation=" + spe + "]").remove();
					shopInit.update();
					$delete.remove();
					getTotalPrice();
					var num = $(".canbuy.canshow .sj").find(".sp").length;
					if (num == 0) {
						$(".null").show();
						$(".have").hide();
					}
				}
			});
			ds = 1;
		};
	});
	//删除全部失效的商品
	$("#deleteNobuy").bind("click", function () {
		var checkCount = $('.canbuy.canshow .nobuy .sp').length;
		if (checkCount == 0) return false;
		$(".canbuy.canshow .nobuy .sp").each(function () {
			var $delete = $(this);
			var id = $delete.attr("data-id");
			var spe = $delete.attr("data-specation");
			$delete.remove();
			var num = $(".canbuy.canshow .sj").find(".sp").length;
			if (num == 0) {
				$(".null").show();
				$(".have").hide();
			}
		});

	});

	//全选
	$(".goods ul.title .name-circle").on("click", function () {
		var $allSel = $(this),
			$allSelD = $(".sum .name-circle"),
			$sjSel = $(".sj .name-circle");
		var par = $('.canbuy.canshow');
		if ($allSel.hasClass("on")) {
			par.find(".name-circle").removeClass("on");
			$allSelD.removeClass("on");
		} else {
			par.find(".name-circle:not('.disabled')").addClass("on");
			$allSelD.addClass("on");
		}
		$allSel.toggleClass('on');
		getTotalPrice();
	});

	$(".sum .name-circle").on("click", function () {
		var $allSel = $(this),
			$allSelD = $(".goods ul.title .name-circle"),
			$sjSel = $(".sj .name-circle");
		var par = $('.canbuy.canshow');
		if ($allSel.hasClass("on")) {
			par.find(".name-circle").removeClass("on");
			$allSelD.removeClass("on");
		} else {
			par.find(".name-circle:not('.disabled')").addClass("on");
			$allSelD.addClass("on");
		}
		$allSel.toggleClass('on');
		getTotalPrice();
	});

	//店铺选择
	$(".name .name-circle").on("click", function () {
		if ($(this).hasClass('disabled')) return;
		var $nameSel = $(this);
		var par = $nameSel.closest('.sj');
		if ($nameSel.hasClass("on")) {
			par.find(".name-circle").removeClass("on");
		} else {
			par.find(".name-circle").addClass("on");
		}

		getAllChose();
		getTotalPrice();

	});

	//单个选择
	$(".sj ul .name-circle").on("click", function () {
		if ($(this).hasClass('disabled')) return;
		var $singleSel = $(this),
			par = $singleSel.closest(".sj"),
			$t = par.find(".name .name-circle");
		$singleSel.toggleClass('on');

		//店铺
		var mlen = par.find(".proList .name-circle:not('.disabled')").length;
		var prolen = par.find(".proList .name-circle.on").length;
		if (prolen == mlen) {
			$t.addClass("on");
		} else {
			$t.removeClass("on");
		}

		getAllChose();

		getTotalPrice();
	});

	//判断是否全选
	function getAllChose() {

		//全选
		var nlen = $(".canbuy.canshow .sj .name .name-circle:not('.disabled')").length; //可选店铺个数
		var clen = $(".canbuy.canshow .sj .name .name-circle.on").length;

		if (nlen > 0 && clen == nlen) {
			$(".goods ul.title .name-circle,.sum .name-circle").addClass("on");
		} else {
			$(".goods ul.title .name-circle,.sum .name-circle").removeClass("on");
		}
	}



	//结算
	$("#js,.jiesuan").bind("click", function () {
		var t = $(this);
		if (!t.hasClass("disabled")) {

			//验证登录
			var userid = $.cookie(cookiePre + "login_user");
			if (userid == null || userid == "") {
				huoniao.login();
				return false;
			}

			//提交
			var data = [],
				pros = [],
				fm = t.closest("form"),
				url = fm.data("action"),
				action = fm.attr("action");
			$(".sj .sp").each(function () {
				var t = $(this),
					id = t.data("id"),
					specation = t.data("specation"),
					count = t.find(".t5 input").val();
				if (t.find(".t0 i").hasClass("on")) {
					data.push('pros[]=' + id + "," + specation + "," + count);
					pros.push('<input type="hidden" name="pros[]" value="' + id + "," + specation + "," + count + '" />');
				}
			});

			t.addClass("disabled").html(langData['siteConfig'][6][35] + "...");

			$.ajax({
				url: url,
				data: data.join("&"),
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if (data && data.state == 100) {

						fm.append(pros.join(""));
						fm.submit();

					} else {
						alert(data.info);
						t.removeClass("disabled").html(langData['shop'][1][6]);
					}
				},
				error: function () {
					alert(langData['siteConfig'][20][183]);
					t.removeClass("disabled").html(langData['shop'][1][6]);
				}
			});

		}
	});

	//点击list中的聊天
	var userid = typeof cookiePre == "undefined" ? null : $.cookie(cookiePre + "login_user");
	$('.goods').delegate('.online_contact', 'click', function () {
		if (userid == null || userid == undefined) {
			huoniao.login();
			return false;
		}

		var chatid = $(this).attr('data-id');
		var type = $(this).attr('data-type');
		var mod = 'shop';
		imconfig = {
			'mod': 'shop',
			'chatid': chatid,
		}
		sendLink(type);
		setTimeout(function () {
			$(".im-textarea").focus();
		}, 4000)
	});
	djslist();
	//引入倒计时效果
	function djslist() {
		$('.sj:not(".nobuy")').each(function () {

			var t = $(this);

			var shoplistli = $(this).find('.sp');
			if (shoplistli.size() > 0) {
				var num = 0;
				shoplistli.each(function () {
					var t = $(this).find('.jsTime');
					var stimes = t.attr('data-time');
					var shtml = [];
					setInterval(function () {
						shtml = cutDownTime(serviceTime, stimes)
						if (shtml[0] > 0) {
							t.find('.day').text(shtml[0]);
						} else {
							t.find('.day').hide();
							t.find('.dayem').hide();
						}

						t.find('.hour').text(shtml[1]);
						t.find('.minute').text(shtml[2]);
						t.find('.second').text(shtml[3]);
					}, 1000);

					if ($(this).find('.name-circle').hasClass('disabled')) {
						num++
					}

				})
				if (num == shoplistli.length) {
					t.find('.name .name-circle').removeClass().addClass('name-circle disabled');
				}
			}
		});
	}

	//倒计时
	function cutDownTime(setime, datatime) {
		var eday = 3;
		var jsTime = parseInt((new Date()).valueOf() / 1000);
		var timeOffset = parseInt(jsTime - setime);
		var end = datatime * 1000; //点击的结束抢购时间的毫秒数
		var newTime = Date.parse(new Date()) - timeOffset; //当前时间的毫秒数
		var youtime = end - newTime; //还有多久时间结束的毫秒数
		var timeArr = [];
		if (youtime <= 0) {
			timeArr = ['00', '00', '00', '00'];
			return timeArr;
			return false;
		}
		var seconds = youtime / 1000; //秒
		var minutes = Math.floor(seconds / 60); //分
		var hours = Math.floor(minutes / 60); //小时
		var days = Math.floor(hours / 24); //天

		var CDay = days;
		var CHour = hours % 24;
		if (CDay <= eday) { //3天之内的只要小时 不要天
			CHour = CHour + CDay * 24;
			CDay = 0;
		}
		var CMinute = minutes % 60;
		var CSecond = Math.floor(seconds % 60); //"%"是取余运算，可以理解为60进一后取余数
		var c = new Date(Date.parse(new Date()) - timeOffset);
		var millseconds = c.getMilliseconds();
		var Cmillseconds = Math.floor(millseconds % 100);
		if (CSecond < 10) { //如果秒数为单数，则前面补零
			CSecond = "0" + CSecond;
		}
		if (CMinute < 10) { //如果分钟数为单数，则前面补零
			CMinute = "0" + CMinute;
		}
		if (CHour < 10) { //如果小时数为单数，则前面补零
			CHour = "0" + CHour;
		}
		if (CDay < 10) { //如果天数为单数，则前面补零
			CDay = "0" + CDay;
		}
		if (Cmillseconds < 10) { //如果毫秒数为单数，则前面补零
			Cmillseconds = "0" + Cmillseconds;
		}
		if (CDay > 0) {
			timeArr = [CDay, CHour, CMinute, CSecond];
			return timeArr;
		} else {
			timeArr = ['00', CHour, CMinute, CSecond];
			return timeArr;
		}
	}

$('body').delegate('.sku', 'click', function () {
		console.log(SKUResult)

		var self = $(this);
		if (self.hasClass(disabled)) return;

		//选中自己，兄弟节点取消选中
		self.addClass(selected).siblings("a").removeClass(selected);
		var spValue = parseInt($(".size-box .count b").text()),
			inputValue;

		//已经选择的节点
		var selectedObjs = $('.sp.chooseli').find('.' + selected);

		if (selectedObjs.length) {
			//获得组合key价格
			var selectedIds = [];
			selectedObjs.each(function () {
				selectedIds.push($(this).attr('attr_id'));
			});
			selectedIds.sort(arrSortMinToMax);
			var len = selectedIds.length;
			// var prices = SKUResult[selectedIds.join(';')].prices;
			// var maxPrice = Math.max.apply(Math, prices);
			// var minPrice = Math.min.apply(Math, prices);
			// var maxP = maxPrice.toFixed(2).split('.')[0] + "<em>." + maxPrice.toFixed(2).split('.')[1] + "</em>";
			// var minP = minPrice.toFixed(2).split('.')[0] + "<em>." + minPrice.toFixed(2).split('.')[1] + "</em>";
			var currStock = 0;
			var priceArr = [],mpriceArr = [];
			for(var item in SKUResult){
				var testIds = item.split(',');
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
						// console.log(testAttrIds)
						// if(SKUResult[testAttrIds.join(',')] && SKUResult[testAttrIds.join(',')].stock == 0){
						// 	$(this).addClass('disabled').removeClass(selected)
						// }else{
						// 	$(this).removeClass('disabled')
						// }
						var stockFlag = 0; 
						for(var iitem in SKUResult){
							var flag = 0;
							for(var mm = 0; mm < testAttrIds.length; mm++){
								if(!iitem.split(',').includes(testAttrIds[mm])){
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
						mpriceArr.push(SKUResult[item].mprices[0])
					}
				}
			}
			var min_price = Math.min.apply(null,priceArr);
			var max_price = Math.max.apply(null,priceArr);
			var min_mprice = Math.min.apply(null,mpriceArr);
			var max_mprice = Math.max.apply(null,mpriceArr);
			priceObj.text(min_price == max_price ? min_price : (min_price + '-' + max_price)); //价格填入
			mpriceObj.text(min_mprice == max_mprice ? min_mprice : (min_mprice + '-' + max_mprice))


			stockObj.text(currStock);
			$('.sp.chooseli .speAlert').attr('data-stock', currStock)
			console.log(currStock)
			// //用已选中的节点验证待测试节点 underTestObjs
			// $(".sku").not(selectedObjs).not(self).each(function () {
			// 	var siblingsSelectedObj = $(this).siblings('.' + selected);
			// 	var testAttrIds = []; //从选中节点中去掉选中的兄弟节点
			// 	if (siblingsSelectedObj.length) {
			// 		var siblingsSelectedObjId = siblingsSelectedObj.attr('attr_id');
			// 		for (var i = 0; i < len; i++) {
			// 			(selectedIds[i] != siblingsSelectedObjId && selectedIds[i] != undefined) && testAttrIds.push(selectedIds[i]);
			// 		}
			// 	} else {
			// 		testAttrIds = selectedIds.concat();
			// 	}
			// 	testAttrIds = testAttrIds.concat($(this).attr('attr_id'));
			// 	testAttrIds.sort(arrSortMinToMax);
			// 	//点击某一个属性时 搭配的属性如果没有库存时 则不可点 disabled
			// 	var defineArr = SKUResult[testAttrIds.join(';')]
			// 	// var stockArr = defineArr.stock*1;
			// 	if (!defineArr || defineArr.stock == 0) {
			// 		$(this).addClass(disabled).removeClass(selected);
			// 	} else {
			// 		$(this).removeClass(disabled);
			// 	}
			// });
		} else {
			init.defautx();
		}
	});

	//商品属性选择
	var SKUResult = {}; //保存组合结果
	var mpriceArr = []; //市场价格集合
	var priceArr = []; //现价集合
	var totalStock = 0; //总库存
	var skuObj = $(".singleGoods dd.info li.count"),
		mpriceObj = $(".singleGoods dd.info li.price s"), //原价
		priceObj = $(".singleGoods dd.info li.price .moneyTxt b"), //现价
		stockObj = $(".singleGoods .count var b"), //库存
		disabled = "disabled", //不可选
		selected = "selected"; //已选

	var init = {

		//拼接HTML代码
		start: function (id) {
				var li = $('.sp[data-id="' + id + '"]'),
					tprotype = li.attr('data-protype'), //是否团购商品
					specationArr = li.attr('data-specationarr'); //自带的全部属性
				// console.log(specationArr)
				//绘制出 商品全部属性
				var spArr = JSON.parse(specationArr),
					sizeHtml = [];
				if (tprotype == '1') { //是否团购商品
					var tcSparr = [];
					var tcArr = [];
					for (var t = 0; t < spArr.length; t++) {
						tcArr = tcArr.concat(spArr[t].item);
					}
					tcSparr.push({
						'typename': '套餐多规格',
						'item': tcArr
					});
					spArr = tcSparr;
				}

				for (var i = 0; i < spArr.length; i++) {
					sizeHtml.push('<dl class="sys_item"><dt>' + spArr[i].typename + '</dt>');
					var itemArr = spArr[i].item;
					sizeHtml.push('<dd>');
					for (var j = 0; j < itemArr.length; j++) {
						if (itemArr[j] && itemArr[j].pic) {
							sizeHtml.push('<a href="javascript:;" class="sku disabled" attr_id="' + itemArr[j].id + '"><b><img src="' + itemArr[j].pic + '"></b>' + itemArr[j].name + '</a>');
						} else {
							sizeHtml.push('<a href="javascript:;" class="sku  disabled" attr_id="' + itemArr[j].id + '"><b></b>' + itemArr[j].name + '</a>');
						}

					}
					sizeHtml.push('</dd>');
					sizeHtml.push('</dl>');
				}
				li.find('.speAlert').attr('data-id', id)
				li.find('.size-html').html(sizeHtml.join(""));

				init.initSKU(id);
			}

			//获得对象的key
			,
		getObjKeys: function (obj) {
				if (obj !== Object(obj)) throw new TypeError('Invalid object');
				var keys = [];
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) {
						keys[keys.length] = key;
					}
				}
				return keys;
			}


			//默认值
			,
		defautx: function () {

				//市场价范围
				var maxPrice = Math.max.apply(Math, mpriceArr);
				var minPrice = Math.min.apply(Math, mpriceArr);
				mpriceObj.html((echoCurrency('symbol')) + (maxPrice > minPrice ? minPrice.toFixed(2) + "-" + maxPrice.toFixed(2) : maxPrice.toFixed(2)));

				//现价范围
				var maxPrice = Math.max.apply(Math, priceArr);
				var minPrice = Math.min.apply(Math, priceArr);
				priceObj.html((maxPrice > minPrice ? minPrice.toFixed(2) + "-" + maxPrice.toFixed(2) : maxPrice.toFixed(2)));

				//总库存

				stockObj.text(totalStock);

				//设置属性状态
				$('.sku').each(function () {
					// SKUResult[$(this).attr('attr_id')] ? $(this).removeClass(disabled) : $(this).addClass(disabled).removeClass(selected);
					var attr_id = $(this).attr('attr_id')
					for(var item in SKUResult){
						if(SKUResult[item].id == $('.chooseli').attr('data-specation') && item.indexOf(attr_id) > -1){
							// $(this).addClass('selected');
							$(this).click();
						}
						if(item.indexOf(attr_id) > -1 && SKUResult[item].stock > 0){ //有该选项的商品 并且库存不为0
							$(this).removeClass(disabled);
						}
					}
				})


			}

			//初始化得到结果集
			,
		initSKU: function (id) {
				var csp = $('.sp[data-id="' + id + '"]');
				var i, j, skuKeys = JSON.parse(csp.attr('data-specification'));

				for (i = 0; i < skuKeys.length; i++) {
					var _skuKey = skuKeys[i].spe.split("-"); //一条SKU信息value
					var skuKey = _skuKey.join(";"); //一条SKU信息key
					var sku = skuKeys[i].price; //一条SKU信息value
					var skuKeyAttrs = skuKey.split(";"); //SKU信息key属性值数组
					var len = skuKeyAttrs.length;

					//对每个SKU信息key属性值进行拆分组合
					var combArr = init.arrayCombine(skuKeyAttrs);

					for (j = 0; j < combArr.length; j++) {
						init.add2SKUResult(combArr[j], sku);
					}

					mpriceArr.push(sku[0]);
					priceArr.push(sku[1]);
					totalStock += parseInt(sku[2]);
					//结果集接放入SKUResult
					SKUResult[skuKey] = {
						id:skuKeys[i].id,
						stock: sku[2],
						prices: [sku[1]],
						mprices: [sku[0]]
					}
				}
				init.defautx();
			}

			//把组合的key放入结果集SKUResult
			,
		add2SKUResult: function (combArrItem, sku) {
				var key = combArrItem.join(";");
				//SKU信息key属性
				if (SKUResult[key]) {
					SKUResult[key].stock = parseInt(SKUResult[key].stock) + parseInt(sku[2]);
					SKUResult[key].prices.push(sku[1]);
					SKUResult[key].mprices.push(sku[0]);
				} else {
					SKUResult[key] = {
						stock: sku[2],
						prices: [sku[1]],
						mprices: [sku[0]]
					};
				}
			}

			//从数组中生成指定长度的组合
			,
		arrayCombine: function (targetArr) {
				if (!targetArr || !targetArr.length) {
					return [];
				}

				var len = targetArr.length;
				var resultArrs = [];

				// 所有组合
				for (var n = 1; n < len; n++) {
					var flagArrs = init.getFlagArrs(len, n);
					while (flagArrs.length) {
						var flagArr = flagArrs.shift();
						var combArr = [];
						for (var i = 0; i < len; i++) {
							flagArr[i] && combArr.push(targetArr[i]);
						}
						resultArrs.push(combArr);
					}
				}

				return resultArrs;
			}

			//获得从m中取n的所有组合
			,
		getFlagArrs: function (m, n) {
			if (!n || n < 1) {
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
					if (flagArr[i] == 1 && flagArr[i + 1] == 0) {
						for (j = 0; j < i; j++) {
							flagArr[j] = j < leftCnt ? 1 : 0;
						}
						flagArr[i] = 0;
						flagArr[i + 1] = 1;
						var aTmp = flagArr.concat();
						resultArrs.push(aTmp);
						if (aTmp.slice(-n).join("").indexOf('0') == -1) {
							isEnd = true;
						}
						break;
					}
					flagArr[i] == 1 && leftCnt++;
				}
			}
			return resultArrs;
		}

	}

	//点击事件
	$('.sku').each(function () {
		var self = $(this);
		var attr_id = self.attr('attr_id');
		if (!SKUResult[attr_id]) {
			self.addClass(disabled);
		} else {
			//无库存也不可选
			if (SKUResult[attr_id].stock == 0) {
				self.addClass(disabled);
			}
		}
	})
	

	//修改属性 
	$('.proList .hasSpe').hover(function () {
		var t = $(this);
		t.addClass('show');
	}, function () {
		var t = $(this),
			speAlert = t.find('.speAlert');
		if (!speAlert.hasClass('show')) {
			t.removeClass('show');
		}
	})
	var skflag = stflag = 1;
	//属性弹窗显示
	$('.proList .changeSpe').click(function () {
		var t = $(this),
			par = t.closest('.hasSpe');
		$('.speAlert').removeClass('show');
		par.find('.speAlert').addClass('show');
		var li = t.closest('.sp'),
			cid = li.attr('data-id'),
			specation = li.attr('data-specation');
		$('.sp').removeClass('chooseli');
		li.addClass('chooseli');
		init.start(cid)


		//画出已选择的属性
		var skArr = specation.split('-');

		//此规格有库存则画出已选择的属性 如果没有 则不可选
		for (var k = 0; k < skArr.length; k++) {
			var hasSku = skArr[k];
			par.find('.size-html .sku').each(function () {
				var atId = $(this).attr('attr_id');
				if (hasSku == atId) { //已选

					if (t.hasClass('choseNow')) { //之前规格无库存 需要重选
						$(this).addClass('disabled');
					} else {
						$(this).click();
					}
				}
			})

		}
		var sheight = par.find('.size-html').height();
		if (sheight > 90) {
			par.find('.moreSpe').show();
		}


	})
	//关闭属性弹窗
	$('.speAlert .closeAlert,.speAlert .cancelSpe').click(function () {
		$('.sp').removeClass('chooseli');
		$(this).closest('.speAlert').removeClass('show');
	})
	//属性--更多
	$('.proList .moreSpe').click(function () {
		var t = $(this),
			par = t.closest('.hasSpe');
		var sheight = par.find('.size-html').height();
		if (!t.hasClass('cl')) {
			t.addClass('cl');
			par.find('.spelist').css('height', sheight + 'px');
			t.html('收起<b></b>')
		} else {
			t.removeClass('cl');
			par.find('.spelist').css('height', '80px');
			t.html('更多<b></b>')
		}
	})

	//确定修改属性
	$('.sureSpe').click(function () {
		var csp = $(this).closest('.sp');
		var cid = csp.attr('data-id'),
			ctit = csp.find('.goodTitle').text(),
			curl = csp.find('.goodTitle').attr('href'),
			shopunit = csp.attr('data-shopunit');
		var t = ''; //该商品的属性编码 以“-”链接个属性
		csp.find(".sys_item").each(function () {
			var $t = $(this),
				y = $t.find(".sku.selected").attr("attr_id");
			t = t + "-" + y;
		})
		t = t.substr(1);
		var num = parseInt(csp.find(".t5 input").val());
		var stock = parseInt(csp.find('.speAlert').attr('data-stock'));
		if (num > stock) {
			csp.find('.speAlert .errTip').html('此规格最多可买' + stock + shopunit).addClass('show');
			setTimeout(function () {
				csp.find('.speAlert .errTip').removeClass('show');
			}, 1000)
			return false;

		}
		var tArr = t.split('-').sort();
		var paramId = SKUResult[tArr.join(',')] ? SKUResult[tArr.join(',')].id : '';
		//操作购物车
		var data = [];
		data.id = cid;
		data.specation = paramId;
		data.count = num;
		data.title = ctit;
		data.url = curl;
		//重选规格后要删除购物车中相应的商品
		var sid = $('.canbuy.canshow .sp.chooseli').attr('data-id');
		var sdpe = $('.canbuy.canshow .sp.chooseli').attr('data-specation');
		cartlist.find("li[data-id=" + sid + "][data-specation=" + sdpe + "]").remove();
		shopInit.update();
		shopInit.add(data);
		$('.proList .speAlert').removeClass('show');
		setTimeout(function () {
			location.reload();
		}, 500);
	})




});
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
		var sa = a.substr(0, 1),
			sb = b.substr(0, 1);
		var saArr = a.split(''),
			sbArr = b.split(''); //英文加中文时  首字母相同时
		var sflg = false,
			noSame = [];
		var blen = saArr.length > sbArr.length ? saArr.length : sbArr.length;
		for (var mm = 0; mm < blen; mm++) {
			if (saArr[mm] != sbArr[mm]) {
				noSame.push(saArr[mm])
				noSame.push(sbArr[mm])
				sflg = true;
				break;
			}
		}
		if ((/^[A-Za-z]+$/).test(sa) && (/^[A-Za-z]+$/).test(sb)) { //首字母全为英文
			if (sa == sb) { //首字母相同时 比较出不一样的元素
				var ssa = noSame[0],
					ssb = noSame[1];
				if (ssa != undefined) {
					if (ssb == undefined) { //a短b长
						rvalue = 1;
					} else {
						if ((/^[A-Za-z]+$/).test(ssa)) { //英文
							if ((/^[A-Z][A-z0-9]*$/).test(ssa)) { //大写
								if ((/^\d+/.test(ssb))) { //数字
									rvalue = 1;
								} else if ((/^[A-Za-z]+$/).test(ssb)) { //字母
									if ((/^[A-Z][A-z0-9]*$/).test(ssb)) {
										rvalue = ssa.localeCompare(ssb, 'en');
									} else { //大写排小写前面
										rvalue = -1;
									}

								} else { //汉字
									rvalue = -1;
								}

							} else { //小写
								if ((/^\d+/.test(ssb))) { //数字 排前面
									rvalue = 1;
								} else if ((/^[A-Za-z]+$/).test(ssb)) { //字母
									if ((/^[A-Z][A-z0-9]*$/).test(ssb)) { //大写 排前面
										rvalue = 1;
									} else { //小写
										rvalue = ssa.localeCompare(ssb, 'en');
									}

								} else { //汉字
									rvalue = -1;
								}
							}
						} else if ((/^\d+/.test(ssa))) { //数字
							if ((/^\d+/.test(ssb))) { //数字
								if (ssa > ssb) {
									rvalue = 1;
								} else {
									rvalue = -1;
								}

							} else {
								rvalue = -1;
							}
						} else { //汉字
							if ((/^\d+/.test(ssb)) || (/^[A-Za-z]+$/).test(ssb)) { //数字或字母
								rvalue = 1;
							} else { //汉字
								rvalue = ssa.localeCompare(ssb, 'zh-CN');
							}
						}
					}
				} else { //a长b短
					rvalue = -1;
				}


			} else {
				if ((/^[A-Z][A-z0-9]*$/).test(sa) && (!(/^[A-Z][A-z0-9]*$/).test(sb))) { //大写和小写
					rvalue = -1;
				} else if ((/^[A-Z][A-z0-9]*$/).test(sb) && (!(/^[A-Z][A-z0-9]*$/).test(sa))) { //大写和小写
					rvalue = 1;
				}
			}

		} else { //首字母英文和中文时

			if ((/^[A-Za-z]+$/).test(sa) && (!((/^[A-Za-z]+$/).test(sb)) && !(/^\d+/.test(sb)))) { //英文和中文
				rvalue = -1;
			} else if ((/^[A-Za-z]+$/).test(sb) && (!((/^[A-Za-z]+$/).test(sa)) && !(/^\d+/.test(sa)))) {
				rvalue = 1;
			} else {
				rvalue = a.localeCompare(b, 'zh-CN');
			}

		}
		return rvalue;
	} else {
		var rvalue;
		//a/b为大写字母开头 且b/a不为数字 是小写
		var sa = a.substr(0, 1),
			sb = b.substr(0, 1);
		if ((/^[A-Z][A-z0-9]*$/).test(sa) && (!(/^[A-Z][A-z0-9]*$/).test(sb) && !(/^\d+/.test(sb)))) {
			rvalue = -1;
		} else if ((/^[A-Z][A-z0-9]*$/).test(sb) && (!(/^[A-Z][A-z0-9]*$/).test(sa) && !(/^\d+/.test(sa)))) {
			rvalue = 1;
		} else {
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