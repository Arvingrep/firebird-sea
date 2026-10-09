$(function(){
	// ----------------------- 产品详细页
	
	$("img").scrollLoading();

	//展示图片轮播
	jQuery(".detailPage .picFocus").slide({ mainCell:".picbd ul",effect:"left",autoPlay:true });


	var addCartLock = false ; 
	$('.buynum').on("input propertychange",function(){
		var me = $(this);
		var val = me.val();
		me.val(val.replace(/\b(0+)/gi,""))
		if(isNaN(val)) {
			me.val(val.replace(/\D+/ig,''))
		}
		addCartLock = false;
		if(val<1){
			numErrMsg('至少买一件吧');
			addCartLock = true;
		}
		if(val>maxCount){
			numErrMsg('库存没有那么多哦');
			addCartLock = true;
		}
		if(val<=1){me.siblings('.btn-dec').addClass('cannot')}
		if(val>1){me.siblings('.btn-dec').removeClass('cannot')}
		if(val>=maxCount){me.siblings('.btn-add').addClass('cannot')}
		if(val<maxCount){me.siblings('.btn-add').removeClass('cannot')}
	})
	var msgTime;
	function numErrMsg(str){
		clearTimeout(msgTime);
		if(str == undefined){str = $('.errmsg').text();}
		$('.errmsg').text(str).fadeIn();
		msgTime = setTimeout(function(){$('.errmsg').fadeOut()},2000);
	}

	//加入购物车
	$('.addcart').click(function(){
		if(addCartLock){
			numErrMsg();
			return;
		}
		else{
		  $('.addCartAlert').modalConten({'position':'auto','obj':$(this),'scrollClose':true,'resizeClose':true})
		}
	})

	// 立刻购买
	$('.buy').click(function(){
		var t = $(this), url = t.attr('data-url'), count = $('.buynum').val();
		count = count == '' ? 0 : parseInt(count);
		if(maxCount <= 0){
			alert('抱歉，该商品库存不足');
			return;
		}
		if(count <= 0){
			alert('请选择商品数量');
			return;
		}
		url = url.replace('#count', count);
		location.href = url;
	})

	$('.prod_detail .btn-add').click(function(){
		var $this = $(this);
		if($this.hasClass('cannot')){
			$('.errmsg').text('已达到库存最大数目').fadeIn();
			setTimeout(function(){$('.errmsg').fadeOut()},2000)
			return;
		}
		addCartLock = false ;
		var $dec = $('.prod_detail .btn-dec');
		
		var now = $('.prod_detail .buynum').val();
		if(now>=maxCount){
			return;
		}else{
			$('.prod_detail .buynum').val(++now);
			if($dec.hasClass('cannot') && now>1){
				$dec.removeClass('cannot');
			}
			if(now>=maxCount){$this.addClass('cannot');}
		}
	})
	$('.prod_detail .btn-dec').click(function(){
		var $this = $(this);
		if($this.hasClass('cannot')){
			$('.errmsg').text('最少 1 件起售').fadeIn();
			setTimeout(function(){$('.errmsg').fadeOut()},2000)
			return;
		}
		if(addCartLock){
			$('.buynum').val(maxCount);
			addCartLock=false;
			return;
		}
		var $add = $('.prod_detail .btn-add');
		var now = $('.prod_detail .buynum').val();
		if(now<=1){
			return;
		}else{
			$('.prod_detail .buynum').val(--now);
			if($add.hasClass('cannot') && now<maxCount){
				$add.removeClass('cannot');
			}
			if(now<=1){$this.addClass('cannot');}
		}
	})
	//收藏
	$('.detailPage .collect').click(function(){
		var $span = $(this).children('span');
		var num = parseInt($span.text());
		if($(this).hasClass('checked')){
			$span.text(--num);
		}else{
			$span.text(++num);
		}
		$(this).toggleClass('checked');
	})
	//显示分享按钮
	var shareboxtime;
	$('.detailPage .otherdo .share').hover(function(){
		clearTimeout(shareboxtime);
		$(this).children('.sharebox').show();
	},function(){
		var $this = $(this);
		shareboxtime = setTimeout(function(){$this.children('.sharebox').hide();},500)
	})
	//tab标签切换
	$('.tab-nav li a').click(function(){
		var $li = $(this).parent('li');
		$li.parents('.nav').addClass('click-ing');
		$li.addClass('active').siblings().removeClass('active');
		var no = $li.index();
		var link = $(this).attr('data-link');
		var bc = no==0?55:35
		var scroll = $(link).offset().top - bc;
		$('body,html').stop(true,true).animate({
			'scrollTop':scroll+'px'
		},300,function(){
			$li.parents('.nav').removeClass('click-ing');
		})
	})
	//礼品评价显示排序
	$('.appraise-title .right a').click(function(){
		$(this).children('i').addClass('on');
		$(this).siblings().children('i').removeClass('on');
	})
	//礼品评价 显示大图
	$('.detailPage .appraise-list .piclist li').click(function(){
		var $this = $(this);
		var $big = $this.parent('ul').siblings('.big-img');

		if($this.hasClass('c')){
			$big.slideUp(200,function(){$this.removeClass('c')});
		}else{
			$big.slideDown();
			$this.addClass('c').siblings('li').removeClass('c')
		}

		var bigImgSrc = $this.find('img').attr('data-big');
		$big.find('img').attr('src',bigImgSrc);
	})

	//根据评分定位评分背景图
	var detail_rank = parseFloat($('#rankbg span').text());
	$('#rankbg i b').css('width',60*detail_rank/5+'px');

	$('.ranktyplist li').each(function(){
	var rank = parseFloat($(this).children('.rankcode').text().substr(0,3));

	$(this).find('b').width(85*rank/5+'px');
	})

	//tab标签固定
	$('.pinned').pined({'parents':'.mainbox-content'});

	//全部评价/有图
	$('#allappraise').click(function(){
		$(this).addClass('on');
		$('#picappraise').removeClass('on');
	})
	$('#picappraise').click(function(){
		$(this).addClass('on');
		$('#allappraise').removeClass('on');
	})


})

//固定菜单
+(function ($) {
	$.fn.pined = function(options){
		var defaults = {'topBC':0,'parents':'','parTopBC':0,'WinMinHeight':480};
		var setting = $.extend({},defaults,options);

		var $this = $(this);
        var Height = $this.outerHeight();
        var objTop = $this.offset().top ;
       
		$this.wrapAll('<div class="pinedBox" style="height:' + Height + 'px;">')

		var navScrollTop = [];
		var $li = $this.find('.nav').children('li');
		$li.each(function(i){
			var goal = $(this).children('a').attr('data-link')
			navScrollTop[i] = $(goal).offset().top - Height ;
		})
		var navpos=0 , navLen = $li.length;

		$(window).scroll(function(){
            if($(window).height()<setting.WinMinHeight){$(this).removeClass('fixed_s').css('top',0);return;}
            var objMaxTop = setting.parents!='' ? $(setting.parents).offset().top + $(setting.parents).outerHeight() : 99999 ;
			var scrollTop = $(document).scrollTop();
			if(scrollTop < objTop || scrollTop > objMaxTop){
				$this.removeClass("fixed_s");
			}
			if(scrollTop > objTop && scrollTop < objMaxTop){
				$this.addClass("fixed_s").css('top',setting.topBC+'px');
				for(var i in navScrollTop){
					if(scrollTop > navScrollTop[i]){
						navpos = i ;
					}
				}
				if(!$li.find('.nav').hasClass('click-ing')) {
					$li.eq(navpos).addClass('active').siblings().removeClass('active');
				}
			}
		})
	}
})(jQuery);