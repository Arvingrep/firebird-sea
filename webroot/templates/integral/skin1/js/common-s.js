	var isIE=!!window.ActiveXObject;
	var isIE6=isIE&&!window.XMLHttpRequest;
	var isIE8=isIE&&!!document.documentMode;
	var isIE7=isIE&&!isIE6&&!isIE8;
$(function(){


	//产品分类
	var cateTime;
	$('.category li').hover(function(){
		if($(this).attr('data-load')!='load'){
			var $box = $(this).find('.sub_category_box');
			var $dd = $box.find('dd');
			var num = $dd.length;
			var col = Math.ceil(num/11);
			$box.width(col*140+10+'px');
			var colNum = 11;
			var dlStr='';
			for(var i=0;i<col;i++){
				var ddStr = ''
				for(var t=i*colNum;t<i*colNum+colNum&&t<num;t++){
					ddStr += '<dd>' + $dd.eq(t).html() + '</dd>';
				}
				dlStr += '<dl class="sub_category sub_' + i + '">' + ddStr + '</dl>';
			}
			$box.html('').append(dlStr);
			$(this).attr('data-load','load')
		}
		clearTimeout(cateTime)
		$(this).addClass('active').siblings('li').removeClass('active')
	},function(){
		var $this = $(this)
		cateTime = setTimeout(function(){
			$this.removeClass('active')
		},200)
	})

	//-----默认隐藏的产品分类
	var category_hide_time;
	var IE7leaveTime;
	$('#allcategory-hover').hover(function(){
		clearTimeout(category_hide_time);
		$('.defaulthide #nav_category').show();
	},function(){
		category_hide_time = setTimeout(function(){
			$('.defaulthide #nav_category').hide();
		},1500)
	})
	$('.defaulthide #nav_category').hover(function(){
		clearTimeout(category_hide_time);
		clearTimeout(IE7leaveTime)
	},function(){
	//	if(isIE7){}
		IE7leaveTime = setTimeout(function(){
			$('.defaulthide #nav_category').hide();
		},500)
	})
	
});
$(function(){
	$('[data-type="NaN"]').each(function(){
		var me = $(this);
		var old = me.val();
		var maxCount = maxCount ? maxCount :100 ;
		me.on("input propertychange",function(){
			var val = me.val();
			if(isNaN(val)) {
				me.val(val.replace(/\D+/ig,''))
			}
			old = val;
			if(val<1){
				$('.errmsg').text('亲 , 至少买一件吧').fadeIn();
				setTimeout(function(){$('.errmsg').fadeOut()},2000)
			}
			if(val>maxCount){
				$('.errmsg').text('库存没有那么多哦').fadeIn();
				setTimeout(function(){$('.errmsg').fadeOut()},2000)
			} 
			
			if(val<=1){me.siblings('.btn-dec').addClass('cannot')}
			if(val>1){me.siblings('.btn-dec').removeClass('cannot')}
			if(val>=maxCount){me.siblings('.btn-add').addClass('cannot')}
			if(val<maxCount){me.siblings('.btn-add').removeClass('cannot')}
		})
	})
});
//是否支持CSS3属性  transform 
function supportCss3(style) {
    var prefix = ['webkit', 'Moz', 'ms', 'o'],
    i,
    humpString = [],
    htmlStyle = document.documentElement.style,
    _toHumb = function(string) {
        return string.replace(/-(\w)/g,
        function($0, $1) {
            return $1.toUpperCase();
        });
    };
    for (i in prefix) humpString.push(_toHumb(prefix[i] + '-' + style));
    humpString.push(_toHumb(style));
    for (i in humpString) if (humpString[i] in htmlStyle) return true;
    return false;
};

//遮罩层
+(function ($) {
	$.fn.modalConten = function(options){
		var $this = $(this);
		var defaults = {'background':'none','bodyScroll':true,'position':'auto','obj':'','scrollClose':false,'resizeClose':false};
		var setting = $.extend({},defaults,options);
		if($('.modal-box').length>0){
		}else{
			var bgStr = '<div class="modal-box" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:1000;display:none;">' + 
						'<div class="modal-bg" style="position:absolute;left:0;top:0;width:100%;height:100%;background:' + setting.background + ';opacity:0.6;"></div>' +
						'</div>'
		
			$('body').append(bgStr)
		}
		$('.modal-box').fadeIn();
		var scrollShow = $(document).scrollTop();

		var _ctop = setting.obj.offset().top
		var _cleft = setting.obj.offset().left
		var h = $this.outerHeight();
		var hh = $(window).height();
		var ww = $(window).width();

		if(setting.position == 'auto'){
			_ctop -= $(document).scrollTop();
			_cleft -= $(document).scrollLeft();
			$this.css({'opacity':1}).attr('data-sct',scrollShow).show();
			if(_ctop < (h-50)/2){
				$this.css('top',_ctop + 50 + 'px')
			}else{
				$this.css('top',_ctop - 75 + 'px')
			}
			$this.css('left',_cleft - 252 + 'px')
		}
		if(setting.position == 'auto2'){
			_ctop = _ctop<0 ? 20 : _ctop
			_cleft = ww-_cleft<340 ? ww-340 : _cleft

			$this.css({'top':_ctop+'px','left':_cleft + 'px'})
		}
		$this.fadeIn(200,function(){
			$this.css('z-index',1002).fadeIn(100)
		})

		$('.modal-box').click(function(event){
			$this.fadeOut(200,function(){
				$('.modal-box').hide()
			})
		})

		$this.hover(function(){
			$this.addClass('hoverOp1')
		},function(){
			$this.removeClass('hoverOp1')
		})

		if(setting.scrollClose){
			$(document).on('scroll',function(){
				var stop = parseInt($this.attr('data-sct'))
				var scrt = $(document).scrollTop()
				var move = Math.abs(scrt - stop);
				var op = 1-move/300;
				$this.css('opacity',op)
				if(move > 280){
					$('.modal-box').click()
				}
			})
		}
		if(setting.resizeClose){
			$(window).on('resize',function(){
				$('.modal-box').click()
			})
		}
	}
})(jQuery);