
$(function(){
	// 搜索框焦点
	$('.header .keywords').focus(function(){
		$(this).closest('.search').addClass('focus');
	})
	$('.header .keywords').blur(function(){
		$(this).closest('.search').removeClass('focus');
	})

	// 主导航自动隐藏超出部分
	var headNavCon = $('.head-nav'), headNav = headNavCon.find('.nav').children('li');
	var headNavLen = headNav.length;
	var more_btn = $('.head-nav .more'), m_btnw = 72;

	// 窗口调整
	var win = $(window), resizeTime = 0;
	win.resize(function(){
		headNavCon.addClass('resize-ing');
		clearTimeout(resizeTime);
		resizeTime = setTimeout(function(){
			var moreNav = $('.more_nav').children();
			more_btn.before(moreNav);
			var more = false, morehtml = null;
			for(var i = 7; i < headNavLen - 1; i++){
				var o = headNav.eq(i), left = o.position().left, w = o.width();
				if(left + w + m_btnw + 30 > winSize[winSizeLevel]){
					morehtml = headNav.slice(i,headNavLen-1);
					more = true;
					break;
				}
			}
			if(more && morehtml != null){
				more_btn.css('visibility','visible').children('.more_nav').html(morehtml.show());
			}else{
				more_btn.css('visibility','hidden');
			}
			headNavCon.removeClass('resize-ing');
		},200)
	})

})