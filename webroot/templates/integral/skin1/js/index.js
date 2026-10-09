$(function(){
	
	$("img").scrollLoading();

	var isWin1200 = false;
	if($('html').hasClass('w1200')){
		isWin1200 = true;
	}
	var jingpin_show_num = isWin1200?5:4;	//精品推荐显示几张图片

	if(supportCss3('transition')){
		$('.product-item').addClass('product-item-c3')
		$('.left-ad li ,li .inner').addClass('product-time-c3')
	}
	!isIE7 && $('#innerSlide .control').addClass('control-H7')
	

	//顶部图片轮播
	jQuery(".slideBox").slide({mainCell:".bd ul",effect:"left",autoPlay:true, autoPage:'<li></li>', titCell: '.hd ul'});
	//精品推荐图片轮播
	jQuery(".recommend").slide({titCell:".top-bt ul",mainCell:".bd ul",autoPage:true,effect:"left",autoPlay:true,vis:jingpin_show_num});
	//积分新品图片轮播
	jQuery("#innerSlide .inner").slide({titCell:".hd ul",mainCell:".bd dl",autoPage:true,effect:"left",autoPlay:false});

	integralHd();
	//积分新品 切换按钮
	function integralHd(){
		$('.xm-pagers').each(function(){
			var $li = $(this).children('li');
			var len = $li.length;
			for(var i=0;i<len;i++){
				var n = i+1;
				var str = '<span class="dot">' + n + '</span>' ;
				$li.eq(i).html(str);
			}
		})
	}

	var resizeTime;
	$(window).resize(function(){
		clearTimeout(resizeTime);
		//调整窗口大小时取消CSS3过渡效果
		$('.product-item').removeClass('product-item-c3')
		$('.left-ad li ,li .inner').removeClass('product-time-c3')
		resizeTime = setTimeout(function(){
			$('.product-item').addClass('product-item-c3')
			$('.left-ad li ,li .inner').addClass('product-time-c3')
			//切换 精品推荐-为你推荐 显示书目
			if($('html').hasClass('w1200') && isWin1200 || !$('html').hasClass('w1200') && !isWin1200){
			}else{
				if($('html').hasClass('w1200')){
					isWin1200 = true;
				}else{
					isWin1200 = false;
				}
				jingpin_show_num = isWin1200?5:4;
				slideResult('.recommend',jingpin_show_num);
				integralReset('#innerSlide .inner');
			}
		},200)
	})
	

//推荐产品轮播--重新确定展示数目
function slideResult(objstr,num){
	$(objstr).each(function(){
		var listr = $(this).find('ul').html();
		var ulstr = '<ul>' + listr + '</ul>';
		$(this).find('.bd').html(ulstr);
		$(this).slide({titCell:".top-bt ul",mainCell:".bd ul",autoPage:true,effect:"left",autoPlay:true,vis:num});
	 })
}

//积分新品轮播--调整尺寸
function integralReset(objstr){
	var len = $(objstr).length;
	$(objstr).each(function(i){
		var ddstr = $(this).find('dl').html();		
		ddstr = ddstr.replace(/width: 242px;/g,'').replace(/width: 288px;/g,'');
		var dlstr = '<dl>' + ddstr + '</dl>';
		$(this).find('.bd').html(dlstr);
		$(this).slide({titCell:".hd ul",mainCell:".bd dl",autoPage:true,effect:"left",autoPlay:false});
		i+1==len&&integralHd()
	 })
}



})
