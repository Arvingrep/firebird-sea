$(function(){
/*开始*/
//倒计时(判断订单状态如果是待支付)
var timer = setInterval("CountDown();",1000);


	
/*结束*/	
});
var maxTime = 15 * 60;
function CountDown(){
	if(maxTime>0){
		min =  Math.floor(maxTime / 60);
		sec =  Math.floor(maxTime % 60);
		if(min<10){
			min = '0'+min
		}
		if(sec<10){sec = '0'+sec}
		msg = min+":"+sec;
		$('.cdown em').html(msg)
		--maxTime;
	}else{
		//倒计时结束后，改变订单状态
	}
}