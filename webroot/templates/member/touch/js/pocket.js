$(function(){
	//横向滚动
    var swiper = new Swiper('.navCon .swiper-container', {
      	on:{
      		slideChangeTransitionStart: function(){
		      	if(this.activeIndex == 1){
	    			$('.navCon .swiper-slide.myYe').addClass('speC');
	    		}else if(this.activeIndex == 2){
	    			$('.navCon .swiper-slide.myYe').removeClass('speC');
	    		}
		    },
	    	slideChangeTransitionEnd: function(){
		      	$('.bgBox').toggleClass('active');
		      	$('.navTab .moneyYe, .navTab .jfye').toggleClass('curr');
		    },
		}
    });

	//slide到积分或者账户
	//获取url中的参数
    function getUrlParam(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if ( r != null ){
         return decodeURI(r[2]);
      }else{
         return null;
      }
    }

    if($(".bgBox .navTab li").length){
 		var dtype = decodeURI(getUrlParam('dtype'));
	    if(dtype && dtype != null && dtype != 'null'){
	    	swiper.slideTo(dtype);
	    }
    }
    
    
	$('.navTab li').click(function(){
		var i = $(this).index();
        if(i < 2){
		    swiper.slideTo(i);
        }
	})

	
	


})
