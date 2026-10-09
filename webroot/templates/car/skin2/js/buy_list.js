/**
 * Created by Administrator on 2018/5/18.
 */
$(function(){
    // 判断浏览器是否是ie8
     if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.app-con .down .con-box:last-child').css('margin-right','0');
        $('.wx-con .c-box:last-child').css('margin-right','0');
        $('.module-con .box-con:last-child').css('margin-right','0');
        $('.list_left .list_ul li:nth-child(4n)').css('margin-right','0');

    }

 
	$('#moreChoose .item').each(function(){
		var aTxt = $(this).find('a.curr').text();
  		if(aTxt){
          $(this).find('.more_span').text(aTxt);
        }
		
	})







})
