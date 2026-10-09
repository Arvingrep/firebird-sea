function couplet(leftfile, rightfile, bwidth, width, height, theight){
	var lastScrollY = 0;
	var screenwidth = $(window).width();
	//var minwidth = (screenwidth - bwidth) / 2 - width - 10;
	//minwidth = minwidth < 0 ? 0 : minwidth;

	var couplet = [], hack = "position:fixed;top:"+theight+"px;";
	if(navigator.userAgent.indexOf("MSIE 6.0") > 0){
		hack = "_position:absolute;_top:expression(eval(document.documentElement.scrollTop+"+theight+"));";
	}
	if(leftfile != ""){
		couplet.push('<div class="couplet" style="'+hack+'left:20px;z-index:150;">'+leftfile+'<a style="display:block;padding:2px;font-size:12px;color:#999;background:#f1f1f1;" href="javascript:;">&nbsp;关闭</a></div>');
	}
	if(rightfile != ""){
		couplet.push('<div class="couplet" style="'+hack+'right:20px;z-index:150;">'+rightfile+'<a style="text-align:right;display:block;padding:2px;font-size:12px;color:#999;background:#f1f1f1;" href="javascript:;">关闭&nbsp;</a></div>');
	}

	if(couplet.length > 0){
		$(couplet.join("")).appendTo("body");
	}

	//如果页面宽度小于内容宽度则隐藏广告
	if(screenwidth < bwidth + (width*2) + 40){
		$(".couplet").css({"visibility": "hidden"});
	}else{
		$(".couplet").css({"visibility": "visible"});
	}

	//关闭广告
	$(".couplet a").click(function(){
		$(".couplet").remove();
	});

	//动态调整广告位置
	$(window).resize(function(){
		var screenwidth = $(window).width();
		//var minwidth = (screenwidth - bwidth) / 2 - width - 10;
		//minwidth = minwidth < 0 ? 0 : minwidth;
		//$(".couplet:eq(0)").css("left", minwidth + "px");
		//$(".couplet:eq(1)").css("right", minwidth + "px");

		//如果页面宽度小于内容宽度则隐藏广告
		if(screenwidth < bwidth + (width*2) + 40){
			$(".couplet").css({"visibility": "hidden"});
		}else{
			$(".couplet").css({"visibility": "visible"});
		}
	});
}