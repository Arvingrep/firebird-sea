	//文字横向滚动
    function ScrollImgLeft(){
        var speed=50;//初始化速度 也就是字体的整体滚动速度
        var MyMar = null;//初始化一个变量为空 用来存放获取到的文本内容
        var scroll_begin = document.getElementById("scroll_begin");//获取滚动的开头id
        var scroll_end = document.getElementById("scroll_end");//获取滚动的结束id
        var scroll_div = document.getElementById("scroll_div");//获取整体的开头id
        scroll_end.innerHTML=scroll_begin.innerHTML;//滚动的是html内部的内容,原生知识!
		//定义一个方法
        function Marquee(){
            if(scroll_end.offsetWidth-scroll_div.scrollLeft<=0)
                scroll_div.scrollLeft-=scroll_begin.offsetWidth;
            else
                scroll_div.scrollLeft++;
        }
        MyMar=setInterval(Marquee,speed);//给上面的方法设置时间  setInterval
		//鼠标点击这条公告栏的时候,清除上面的方法,让公告栏暂停
        scroll_div.onmouseover = function(){
            clearInterval(MyMar);
        }
		//鼠标点击其他地方的时候,公告栏继续运动
        scroll_div.onmouseout = function(){
            MyMar = setInterval(Marquee,speed);
        }
    }
    ScrollImgLeft();

$(function(){
	var swiper1 = new Swiper('.swiper-container.all_tc', {
	      slidesPerView: 2,
		  centeredSlides: true,
		  spaceBetween: 8,
		  loop: true,
		  on:{
		      slideChangeTransitionEnd: function(){
				  $('.expBox .exp_text').eq(this.activeIndex-2).show().siblings('.exp_text').hide();
				  console.log(this.activeIndex)
		      },
		  },
	});
	
	var swiper2 = new Swiper('.swiper-container.single_tc', {
	      slidesPerView: 2,
	      slidesPerColumn: 2,
	      spaceBetween: 4,
		  navigation: {
			  nextEl: '.next',
			  prevEl: '.prev',
		  },
	    });
		
	
	$(window).scroll(function(){
		if(60<=$(window).scrollTop()){
			$('.posi_box').addClass('fixedTop');
		}else if($(window).scrollTop()<60){
			$('.posi_box').removeClass('fixedTop');
		}
	});	
		
});