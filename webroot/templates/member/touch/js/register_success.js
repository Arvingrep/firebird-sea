$(function(){
	countDown(5, $(".tip"))
	function countDown(time, obj, func){
		times = obj;
		
		mtimer = setInterval(function(){
			obj.find("em").text((--time));
			if(time <= 0) {
				clearInterval(mtimer);
				$(".btn_link").click()
			}
		}, 1000);
	}
})