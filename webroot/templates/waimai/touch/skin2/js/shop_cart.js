$(function() {
	//左滑删除
	var lines = $(".Allcart_box .cart_con .li_con"); //左滑对象
	var len = lines.length;
	var lastXForMobile; //上一点位置
	var pressedObj; // 当前左滑的对象
	var lastLeftObj; // 上一个左滑的对象
	var start; //起点位置
	for (var i = 0; i < len; i++) {
		$(".Allcart_box").delegate('.li_con', 'touchstart', function(e) {
			$(this).find('.del_btn').show() //显示删除按钮
			$(this).siblings().find('.del_btn').hide(); //隐藏删除按钮
			//          	console.log(e)
			//                e.preventDefault();//加上这句的话删除按钮就无法点击了
			lastXForMobile = e.changedTouches[0].pageX;
			pressedObj = this; // 记录被按下的对象
			// 记录开始按下时的点
			var touches = event.touches[0];
			start = {
				x: touches.pageX, // 横坐标
				y: touches.pageY // 纵坐标
			};
		});
		$(".Allcart_box").delegate('.li_con', 'touchmove', function(e) {
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
			$('.Allcart_box .cart_con .li_con .del_btn').text(langData['waimai'][2][42]).removeClass('sure_btn'); /* 删除 */
			if (diffX < -50) {
				$(pressedObj).animate({
					'transform': 'translateX(-1.2rem) '
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

		$(".Allcart_box").delegate('.li_con', 'touchend', function(e) {

		});

	}
	//点击删除按钮
	$('body').delegate('.del_btn', 'click', function() {
		var t = $(this),
			p = t.parents('.li_con'),
			del_id = p.attr('data-id'),
			pp = t.parents('ul');
		var len = pp.find('li.li_con').length;
		p.remove();
		if (len == 1) {
			pp.parents('dl.dl_box').remove();
		}

		if ($('dl.dl_box').length == 0) {
			$('.Allcart_box').append('<div class="no_pro">购物车里还没有商品</div>');
		}
	});

	//点击清空按钮
	$('.Allcart_box').delegate('.clear_btn', 'click', function() {
		$(this).parents('.dl_box').remove();

		if ($('dl.dl_box').length == 0) {
			$('.Allcart_box').append('<div class="no_pro">购物车里还没有商品</div>');
		}
	});
})


