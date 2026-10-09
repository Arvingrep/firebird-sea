$(function(){
	function getParam(paramName) {
      paramValue = "", isFound = !1;
      if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
          arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
          while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
      }
      return paramValue == "" && (paramValue = null), paramValue
  }


  if(getParam('pagetype')){
    pagetype = getParam('pagetype')

  }
	var device = navigator.userAgent;
	if (device.indexOf('huoniao_iOS') > -1) {
		$('.header').addClass('padTop20');
       if(device.indexOf('Android') > -1 || device.indexOf('Linux') > -1){//在安卓app上
         $('.foot_wrap .footer,.size-confirm').addClass('spe')
      }
	}
	if(appIndex=='1'){
		$('body').append('<div class="shopgocart" style="opacity:0; position:fixed; bottom:0; left:0; right:0; margin:auto; "></div>')
	}
	//引入倒计时效果
	$('.cart-list').each(function() {
		var t = $(this);

		var shoplistli = $(this).find('.shop-list-li');

		if(shoplistli.size() >0){
			var num = 0;
			shoplistli.each(function(){
				var thisYs = $(this).find('.jsTime');
				countDown(thisYs);
				if($(this).find('.shop-name-circle').hasClass('disabled')){
					num++
				}

			})
			if(num == shoplistli.length){
				t.find('.shop-name .shop-name-circle').addClass('disabled');
			}
		}
	});




	// 倒计时
	function countDown(thisYs){

		timer = setInterval(function(){
	        var end = thisYs.attr("data-time")*1000;  //点击的结束抢购时间的毫秒数
	        var newTime = Date.parse(new Date());  //当前时间的毫秒数
	        var youtime = end - newTime; //还有多久时间结束的毫秒数
	        var seconds = youtime/1000;//秒
	        var minutes = Math.floor(seconds/60);//分
	        var hours = Math.floor(minutes/60);//小时
	        var days = Math.floor(hours/24);//天
	        var CDay= days ;
	        var CHour= hours % 24 ;
	        var CMinute= minutes % 60;
	        var CSecond= Math.floor(seconds%60);//"%"是取余运算，可以理解为60进一后取余数
	        var c=new Date();
	        var millseconds=c.getMilliseconds();
	        var Cmillseconds=Math.floor(millseconds %100);
	        if(CSecond<10){//如果秒数为单数，则前面补零
	          CSecond="0"+CSecond;
	        }
	        if(CMinute<10){ //如果分钟数为单数，则前面补零
	          CMinute="0"+CMinute;
	        }
	        if(CHour<10){//如果小时数为单数，则前面补零
	          CHour="0"+CHour;
	        }
	        if(CDay<10){//如果天数为单数，则前面补零
	          CDay="0"+CDay;
	        }
	        if(Cmillseconds<10) {//如果毫秒数为单数，则前面补零
	          Cmillseconds="0"+Cmillseconds;
	        }
	        if(CDay >0){
	        	thisYs.find("span.day").html(CDay);
	        }else{
	        	thisYs.find("span.day").hide();
	        	thisYs.find("em.dayem").hide();
	        }

	        thisYs.find("span.hour").html(CHour);
	        thisYs.find("span.minute").html(CMinute);
	        thisYs.find("span.second").html(CSecond);

		}, 1000);
	}

	var speCart = $('.speCart')

	//购物车数量
	var cartCount = $(".cart-main ul.canbuy li.cart-list").length;
	if(cartCount == 0){

		$(".footer").remove();
		// $(".cart-main ,.footer").remove();
		$('.command-list').addClass('empty-list');
	}

	var dflag =1;
	//数量增加、减少
	$('.rec').click(function(){

		if($(this).hasClass('unclick')){
			return false;
		}
		if($(this).hasClass('disabled')){

			showMsg(langData['shop'][6][28]);
			return false;
		}
		var t = $(this).closest('li');
		t.find('.append').removeClass('disabled');
		//2021-9-13 增加最小起订量和每次装箱数量
		//每次装箱数量
		var eachcout = $(this).closest('.shop-info-num').attr('data-eachcout');
		var mincout = $(this).closest('.shop-info-num').attr('data-mincout');//最小起订量

		var val = Number($(this).siblings('.num').find('em').html());
		val = (val-eachcout*1)<mincout?mincout:(val-eachcout*1);
		$(this).siblings('.num').find('em').html(val);
		checkCount(t);
		//操作相应的商品
		if(dflag){
			console.log(333)
			var id=t.attr("data-id");
			var spe=t.attr("data-specation");
			speCart.find('li').each(function(){
				var tl = $(this), tid = tl.attr('data-id'), tspe = tl.attr('data-specation');
				if(tid == id && tspe == spe){
					tl.attr("data-count", val);
				}
			})
			shopInit.update();
		}

	})
	var flag =1;
	$('.append').click(function(){
		var t = $(this).closest('li');
		if($(this).hasClass('disabled')){
			showMsg(langData['shop'][2][13]);//不能再多啦
			return false;
		}
		var t = $(this).closest('li');
		t.find('.rec').removeClass('disabled');
		//2021-9-13 增加最小起订量和每次装箱数量
		//每次装箱数量
		var eachcout = $(this).closest('.shop-info-num').attr('data-eachcout');
		var mincout = $(this).closest('.shop-info-num').attr('data-mincout');//最小起订量

		var val = Number($(this).siblings('.num').find('em').html());
		val = val+eachcout*1;
		$(this).siblings('.num').find('em').html(val);
		checkCount(t,1);

		//操作相应的商品
		if(flag){
			val = Number($(this).siblings('.num').find('em').html());
			var id=t.attr("data-id");
			var spe=t.attr("data-specation");
			speCart.find('li').each(function(){
				var tl = $(this), tid = tl.attr('data-id'), tspe = tl.attr('data-specation');
				if(tid == id && tspe == spe){
					tl.attr("data-count", val);
				}
			})
			shopInit.update();
		}

	})

	//全选
	$(".footer .shop-name-circle").on("click",function(){

		var $allSel=$(this),
		$allSelD=$(".footer .shop-name-circle"),
		$sjSel=$(".canbuy .shop-name-circle:not(.disabled)");
		$allSel.hasClass("active") ? ($allSel.removeClass("active"), $allSelD.removeClass("active"), $sjSel.removeClass("active")) : ($allSel.addClass("active"), $allSelD.addClass("active"), $sjSel.addClass("active"));
		getTotalPrice();
	});



	//店铺选择
	$(".shop-name .shop-name-circle").on("click",function(){
		if($(this).hasClass('disabled')){
			return false;
		}
		var $nameSel=$(this);
		$nameSel.hasClass("active") ? ($nameSel.removeClass("active"), $nameSel.parents(".shop-name").siblings(".shop-list").find(".shop-name-circle:not(.disabled)").removeClass("active")) : ($nameSel.addClass("active"), $nameSel.parents(".shop-name").siblings(".shop-list").find(".shop-name-circle:not(.disabled)").addClass("active"));

		//全选
		var n=$(".cart-list").length;
		if($(".shop-name .active").length==n){
			$(".footer .shop-name-circle").addClass("active");
		}else{
			$(".footer .shop-name-circle").removeClass("active");
		}

		getTotalPrice();

	});

	//单个选择
	$(".shop-list-li .shop-name-circle").on("click",function(){
		if($(this).hasClass('disabled')){
			return false;
		}
		var $singleSel=$(this),$t=$singleSel.closest(".shop-list").siblings(".shop-name").find(".shop-name-circle");

		$singleSel.hasClass("active") ? $singleSel.removeClass("active") : $singleSel.addClass("active");

		//店铺
		var m=$singleSel.parents('.shop-list').find(".shop-list-li").length;
		if($singleSel.parents(".shop-list").find("ul .active").length==m){
			$t.addClass("active");
		}else{
			$t.removeClass("active");
		}

		//全选
		var n=$(".cart-list").length;
		if($(".shop-name .active").length==n){
			$(".footer .shop-name-circle").addClass("active");
		}else{
			$(".footer .shop-name-circle").removeClass("active");
		}

		getTotalPrice();
	});
	//左滑删除 按钮显示
	var lines = $(".cart-list .shop-list .shop-list-li"); //左滑对象
	var len = lines.length;
	var lastXForMobile; //上一点位置
	var pressedObj; // 当前左滑的对象
	var lastLeftObj; // 上一个左滑的对象
	var start; //起点位置
	for (var i = 0; i < len; i++) {
		$(".cart-list").delegate('.shop-list-li', 'touchstart', function(e) {

			lastXForMobile = e.changedTouches[0].pageX;
			pressedObj = this; // 记录被按下的对象
			// 记录开始按下时的点
			var touches = event.touches[0];
			start = {
				x: touches.pageX, // 横坐标
				y: touches.pageY // 纵坐标
			};
		});
		$(".cart-list").delegate('.shop-list-li', 'touchmove', function(e) {
			$(this).find('.del_btn').show() //显示删除按钮
			$(this).siblings().find('.del_btn').hide(); //隐藏删除按钮

			// 计算划动过程中x和y的变化量
			var touches = event.touches[0];
			delta = {
				x: touches.pageX - start.x,
				y: touches.pageY - start.y
			};
			// 横向位移大于纵向位移，阻止纵向滚动
			if (Math.abs(delta.x) > Math.abs(delta.y)) {
				event.preventDefault();
			}
			if (lastLeftObj && pressedObj != lastLeftObj) { // 点击除当前左滑对象之外的任意其他位置
				$(lastLeftObj).animate({
					'transform': 'translateX(0px)'
				}, 100); // 右滑
				lastLeftObj = null; // 清空上一个左滑的对象
			}
			var diffX = e.changedTouches[0].pageX - lastXForMobile;
			//$('.cart-list .shop-list-li .del_btn').text(langData['waimai'][2][42]); /* 删除 */
			if (diffX < -50) {
				$(pressedObj).animate({
					'transform': 'translateX(-1.34rem) '
				}, 100).siblings('li').animate({
					'transform': 'translateX(0px)'
				}); // 左滑
				lastLeftObj = pressedObj; // 记录上一个左滑的对象
			} else if (diffX > 50) {
				if (pressedObj == lastLeftObj) {
					$(pressedObj).animate({
						'transform': 'translateX(0px)'
					}, 100); // 右滑
					lastLeftObj = null; // 清空上一个左滑的对象
				}
			}
		});

		$(".cart-list").delegate('.shop-list-li', 'touchend', function(e) {

		});

	}
	//单个商品删除
	var ds = 1;
	$(".del_btn").on("click",function(){
		var $delete=$(this),allMoney;

		if($delete.closest(".shop-list").find(".shop-list-li").length == 1){
			$delete.closest(".cart-list").remove();
		}

		//删除相应的商品
		var id=$delete.parents("li").attr("data-id");
		var spe=$delete.parents("li").attr("data-specation");
		speCart.find('li').each(function(){
			var t = $(this), tid = t.attr('data-id'), tspe = t.attr('data-specation');
			if(tid == id && tspe == spe){
				t.remove();
				return false;
			}
		})
		shopInit.update();

		$delete.closest(".shop-list-li").remove();

		var num=$(".canshow .cart-list").length;
		if(num == 0){
			$(".empty").show();
			// $(".cart-main").remove();
		}

		getTotalPrice();


	});
	$('.nobuy .cart-list').each(function(){
		var shopL =$(this).find('.shop-list');
		var shopLi = shopL.find('li');
		if(shopLi.length==0){
			$(this).remove();
		}

	})
    var noLen = $(".nobuy .cart-list").length
	if(noLen == 0){
		$(".nobuy").remove();
	}else if(noLen > 0){
      $(".nobuy").removeClass('fn-hide');
    }

    var emptyCount = $(".cart-main ul li").length;
  	if(emptyCount == 0){//购物车没有东西 以及没有失效的东西
    	$(".empty").show();
  	}

	// 清空失效
	var clAll =1;
	$(".clearAll span,clearAll i").on("click",function(){

		var confir = clAll ? confirm(langData['siteConfig'][20][211]) : 1;
		if(confir){
			$('.shop-list-li.under').each(function(){
				//删除相应的商品
				var id=$(this).attr("data-id");
				var spe=$(this).attr("data-specation");

				speCart.find('li').each(function(){
					var t = $(this), tid = t.attr('data-id'), tspe = t.attr('data-specation');
					if(tid == id && tspe == spe){
						t.remove();
						return false;
					}
				})

			})
			shopInit.update();
			var num=$(".nobuy .cart-list").length;
			if(num == 0){
				$(".nobuy").remove();
			}

			getTotalPrice();
			$('.nobuy').remove();
		}
	})
	// 错误提示
	function showMsg(str){
	  var o = $(".error");
	  o.html('<p>'+str+'</p>').css('display','block');
	  setTimeout(function(){o.css('display','none')},1000);
	}
	//验证数量
	function checkCount(obj, t){
		flag = 1;
		var count = obj.find(".num em"), val = Number(count.html());
		var plus = obj.find('.append'),desc = obj.find('.rec');

		//2021-9-13 增加最小起订量和每次装箱数量
		//每次装箱数量
		var eachcout = obj.find('.shop-info-num').attr('data-eachcout');
		var mincout = obj.find('.shop-info-num').attr('data-mincout');//最小起订量

		var id = obj.data("id"),
			price = Number(obj.data("price")),
			maxCount = Number(obj.data("limit"));
			inventor = Number(obj.data("inventor"));
			console.log(val)
		//数量是最小起订量 时就变灰
		if(val < (mincout*1 + eachcout*1)){
			if(val == mincout*1){
				desc.addClass('disabled');
			}

			//最小
			if(val<mincout*1){
				count.html(mincout*1);
				val = mincout*1;
				dflag = 0;

			}
		//最大
		}else if(val > maxCount && maxCount != 0){
			count.html(maxCount);
			val = maxCount;
			showMsg(langData['shop'][2][13]);//不能再多啦
			plus.addClass('disabled');
			//flag = 0;


		//超出库存
		}else if((val >= inventor && !t) || (val > inventor && t)){

			count.html(inventor);
			val = inventor;
			alert(langData['shop'][2][13]);

		}else{
			// $('#errmsg').remove();
		}


		//运费
		console.log(111)
		//计算价格
		var priceArr = (price * val).toFixed(2).split('.')
		obj.find(".total-num strong").html(priceArr[0]);
		obj.find(".total-num em").html('.'+priceArr[1]);

		getTotalPrice();
	}


	//计算总价
	function getTotalPrice(){
		var totalPrice = totalCount = 0;

		$(".canbuy.canshow .shop-list-li").each(function(){

			var t = $(this);
			if(t.find(".shop-name-circle").hasClass("active")){
				var count = t.find(".num em"),
					val = Number(count.html()),
					id = t.data("id"),
					price = Number(t.data("price")),
					express_postage = Number(t.data("express_postage"));

				//运费

				totalCount += val;
				totalPrice += price * val;
			}
		});

		$(".account-btn em").html(totalCount);
		var priceArr2 = totalPrice.toFixed(2).split('.')
		$(".total-num strong").html(priceArr2[0]);
		$(".total-num em").html('.'+priceArr2[1]);

		if(totalCount > 0){
			$(".account-btn a").removeClass("disabled");
		}else{
			$(".account-btn a").addClass("disabled");
		}
	}

	//结算
	$("#js").off('click').bind("click", function(){
		var t = $(this);
		if(!t.hasClass("disabled")){

			//验证登录
			var userid = $.cookie(cookiePre+"login_user");
			if(userid == null || userid == ""){
				location.href = masterDomain + '/login.html';
				return false;			}

			//提交
			var data = [], pros = [], fm = $(".cart-main form"), url = fm.data("action");
			$(".canshow .shop-list-li").each(function(){
				var dd = $(this), id = dd.data("id"), specation = dd.data("specation"), count = dd.find(".num em").text();
				if(dd.find(".shop-name-circle").hasClass("active")){
					data.push('pros[]='+id+","+specation+","+count);
					pros.push('<input id="pros" type="hidden" name="pros[]" value="'+id+","+specation+","+count+'" />');
				}
			});
			t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");
			$.ajax({
				url: url,
				data: data.join("&"),
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						$("input[name='pros[]']").remove();
						fm.append(pros.join(""));
						fm.submit();
                        setTimeout(function(){
                            $('#pros').remove();
                            t.removeClass("disabled").html(langData['shop'][1][6]);
                        }, 500);

					}else{
						t.removeClass("disabled").html(langData['shop'][1][6]);
						alert(data.info);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183])
					t.removeClass("disabled").html(langData['shop'][1][6]);
				}
			});

		}
	});

	$('img').scrollLoading();

	//2021-9-16新增
	//到店优惠--送到家 切换
	$('.cartTab li').click(function(){
		if(!$(this).hasClass('active')){
			$(this).addClass('active').siblings('li').removeClass('active');
			var tindex = $(this).index();
			var ttype = $(this).attr('data-type');
			$('.buyWrap .canbuy').eq(tindex).addClass('canshow').siblings('.canbuy').removeClass('canshow');
			$('#confirmType').val(ttype);
			$(".command-list-con .listbox").eq(tindex).removeClass('fn-hide').siblings('.listbox').addClass('fn-hide')
			getTotalPrice();
		}

	})

	var cartActive = 0;
	// 购物车是否有数据
	$(".canbuy").each(function(){
		var index = $(this).index();
		if($(this).find('li').length == 0){
			$(this).find('.empty').show()
		}else{
			$(this).find('.empty').hide();
			if(!cartActive && pagetype == '0'){
				$(".cartTab li").eq(index).click();
				cartActive = 1;
			}else{
				if(!cartActive){
					$(".cartTab li").eq(pagetype - 1).click();
				}
			}
		}
	})

	//编辑购物车
	$('.cartEdit').click(function(){
		if(!$(this).hasClass('active')){
			$(this).addClass('active');
			$(this).html('完成');
			$('.footer .account-btn,.footer .total-num').hide();
			$('.footer .cartDel').show();
		}else{
			$(this).removeClass('active');
			$(this).html('<i></i>编辑');
			$('.footer .account-btn,.footer .total-num').show();
			$('.footer .cartDel').hide();
			if($('.shop-name-circle').hasClass('active')){
				$('.shop-name-circle').click();
			}
		}

	})

	//编辑购物车 -- 删除
	$('.footer .cartDel').click(function(){
		var len = $('.cart-main .shop-list-li .shop-name-circle.active').length;
		if(len > 0){
			var popOptions = {
					isShow:true,
		      title:'确定删除这<strong>'+len+'</strong>件商品吗？',
		      btnColor:'#F72A34',
		      btnCancel:'我再想想',
		    }
		    confirmPop(popOptions,function(){
					$('.cart-main .shop-list-li .shop-name-circle.active').each(function(){
						var circle = $(this),shop_circle = circle.closest('.cart-list').find('.shop-name .shop-name-circle');
						var shoplist = circle.closest('.shop-list-li'),carlist = circle.closest('.cart-list')
						if(shop_circle.hasClass('active')){
							carlist.remove()
						}else{
							shoplist.remove()
						}

						var id = circle.parents("li").attr("data-id");
						var spe = circle.parents("li").attr("data-specation");
						speCart.find('li').each(function(){
							var t = $(this), tid = t.attr('data-id'), tspe = t.attr('data-specation');
							if(tid == id && tspe == spe){
								t.remove();
								return false;
							}
						})
					})
					shopInit.update();
		    })
		}



	})

})
