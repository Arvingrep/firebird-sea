$(function(){


    //购物车
	$('.left-side .cart ').click(function(){

        $('.right-side').addClass('show');
        $(this).addClass('orange').siblings().removeClass('orange');
				$(".cart-box").show().siblings('.quan-box').hide();
    })
    $('.right-side .close-cart ').click(function(){
        $('.right-side ').removeClass('show');
        $('.left-side .cart ').removeClass('orange');
    })

		// 显示券
		$('.left-side .quanGet-icon ').click(function(){

	        $('.right-side').addClass('show');
	        $(this).addClass('orange').siblings().removeClass('orange');
					$(".quan-box").show().siblings('.cart-box').hide();
	    })
	    $('.right-side .close-quan ').click(function(){
	        $('.right-side ').removeClass('show');
	        $('.left-side .quanGet-icon ').removeClass('orange');
	    })

    $('.right-side').delegate('.clear','click',function(){
        $(this).parents('.shop').remove();
    })

    $('.tohid').click(function () {
        $('.right-side .close-quan ').click();
    })
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
    // 回到顶部
    $('.go-top').bind('click', function(){
        $("html,body").scrollTo({toT:0})
    })

    $('.left-side .go-top').hover(function () {
        $(this).addClass('sshow');
    },function () {
        $(this).removeClass('sshow');
    });

      //右侧手机查看
    $('.left-side .erwei').hover(function () {
        $('.hide_code').addClass('show');
    },function () {
        $('.hide_code').removeClass('show');
    });
    //订单hover
    $('.left-side .order-icon').hover(function () {
        $(this).addClass('sshow');
    },function () {
        $(this).removeClass('sshow');
    });

    $(".toGet").click(function () {
        var qid = $(this).attr('data-id');
      var dd = $(this).closest('dd');
      var li = $(this).closest('li');
        if(li.hasClass('has_get')){
            alert('该优惠券已被领取');
            return false;
        }
        $.ajax({
            url: "/include/ajax.php?service=waimai&action=getWaimaiQuan&qid="+qid,
            type:'POST',
            dataType: "json",
            success:function (data) {
                if(data.state ==100){
					dd.removeClass('no_has');
                    alert(data.info)
                  
                }else{
                    alert(data.info)
                }
            },
            error:function () {

            }
        });
    });



})
