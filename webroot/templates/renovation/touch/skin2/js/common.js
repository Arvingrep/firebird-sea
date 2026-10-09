

$(function(){

    $.fn.scrollTo =function(options){
        var defaults = {
            toT : 0, //滚动目标位置
            durTime : 500, //过渡动画时间
            delay : 30, //定时器时间
            callback:null //回调函数
        };
        var opts = $.extend(defaults,options),
            timer = null,
            _this = this,
            curTop = _this.scrollTop(),//滚动条当前的位置
            subTop = opts.toT - curTop, //滚动条目标位置和当前位置的差值
            index = 0,
            dur = Math.round(opts.durTime / opts.delay),
            smoothScroll = function(t){
                index++;
                var per = Math.round(subTop/dur);
                if(index >= dur){
                    _this.scrollTop(t);
                    window.clearInterval(timer);
                    if(opts.callback && typeof opts.callback == 'function'){
                        opts.callback();
                    }
                    return;
                }else{
                    _this.scrollTop(curTop + index*per);
                }
            };
        timer = window.setInterval(function(){
            smoothScroll(opts.toT);
        }, opts.delay);
        return _this;
    };

    
    // 关闭
    $(".modal-public .modal-main .close").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
        return false;
     })
    $(".bgCover").on("click",function(){
        $("html, .modal-public").removeClass('curr nos');
    })

	
	//微信引导关注
    $('.mIcon.wx').bind('click', function(){
        $('.wechat-popup').css("visibility","visible");
    });

    $('.wechat-popup .close').bind('click', function(){
        $('.wechat-popup').css("visibility","hidden");
    });



   //回到顶部
	$('.gotop').click(function(){
		console.log(1)
		var dealTop = $("body").offset().top;
        $("html,body").scrollTo({toT:dealTop})
		$('.gotop').hide();
	})

	   // 回到顶部
	$('.gt i').click(function(){
		console.log(1)
		var dealTop = $("body").offset().top;
        $("html,body").scrollTo({toT:dealTop})
		$('.gt').hide();
	})
    // 返回上一页
    $('.goback').click(function(){
    	history.go(-1);
    })
    
	// 返回顶部
	 var windowTop=0;
    $(window).on("scroll", function(){
            var scrolls = $(window).scrollTop();//获取当前可视区域距离页面顶端的距离
            if(scrolls>=windowTop){//当B>A时，表示页面在向上滑动
                //需要执行的操作
                windowTop=scrolls;
                $('.gotop').hide();
                $('.wechat-fix').hide();

            }else{//当B<a 表示手势往下滑动
                //需要执行的操作
                windowTop=scrolls;
                $('.gotop').show();
                $('.wechat-fix').show();
            }
            if(scrolls==0){
            	$('.gotop').hide();
                $('.wechat-fix').hide();
            }
     });

   

})

