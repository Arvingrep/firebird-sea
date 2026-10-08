/**
 * Created by Administrator on 2018/5/18.
 */
$(function(){
    // 判断浏览器是否是ie8
     if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.app-con .down .con-box:last-child').css('margin-right','0');
        $('.wx-con .c-box:last-child').css('margin-right','0');
        $('.module-con .box-con:last-child').css('margin-right','0');
        $('.wrap3 ul li:nth-child(4n)').css('margin-right','0');
        $('.wrap4 ul li:nth-child(4n)').css('margin-right','0');

     }
	 
     // 手机端、微信端
     $('.app-con .icon-box.app').hover(function(){
        $('.app-down').show();
     },function(){
        $('.app-down').hide();
     });
     $('.app-con .icon-box.wx').hover(function(){
        $('.wx-down').show();
     },function(){
        $('.wx-down').hide();
     })

	 $(".slideContainer").slide({mainCell:".bd",effect:"leftLoop",prevCell:".prev1",nextCell:".next1",vis:3});
    
	 var swiperNav = [], mainNavLi = $('.slideBox2 .bd').find('li');
	    for (var i = 0; i < mainNavLi.length; i++) {
	        swiperNav.push($('.slideBox2 .bd').find('li:eq('+i+')').html());
	    }
	 var liArr = [];
	 for(var i = 0; i < swiperNav.length; i++){
	     liArr.push(swiperNav.slice(i, i + 6).join(""));
	     i += 5;
	 }
	  console.log(swiperNav.length)
	 $('.slideBox2').find('ul.bd').html('<li>'+liArr.join('</li><li>')+'</li>');
	 $(".slideBox2").slide({ mainCell:".bd",effect:"leftLoop",prevCell:".prev2",nextCell:".next2",});
	
	$('.adv_youhui .close_btn').click(function(){
		$('.adv_youhui').remove();
	})
	//jQuery(".txtMarquee-left").slide({mainCell:".bd ul",autoPlay:true,effect:"leftMarquee",interTime:50,trigger:"click"});
})
