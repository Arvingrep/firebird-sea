$(function(){
	var FestivalAD_Background = $.cookie(""+cookiePre+"FestivalAD");
	var docHeight = document.body.scrollHeight;
	var WhiteHeight = Number(docHeight) - 50;
    var ADwhite_Height = Number(FestivalAD_hdeight) + 30;

	$("body").append('<style>.Background_Advertising{background:url('+Background_Url+') no-repeat center 35px;z-index:-1;width:100%;position:absolute;top:0;left:0;right:0;z-index:-2;}#Background_closed{background:url(/static/images/close.png) no-repeat;width:50px;height:22px;padding:0;position:absolute;right:0px;bottom:35px;cursor:pointer;display:block;z-index:2;top:20px;}.FestivalAD_link{position:absolute;top:35px;left:50%;height:'+FestivalAD_hdeight +'px;}.FestivalAD_link a{display:block;width:100%;height:100%;}#Background_closed:hover{background-image:url(/static/images/close_hover_03.png)}.WthiteBox_Left{position:absolute;left:50%;background:#fff;z-index:-1;}</style><div class="Background_Advertising"></div><div class="FestivalAD_link"><a href="'+Background_Href+'" target="_blank"></a><div id="Background_closed"></div></div><div class="WthiteBox_Left"></div>')
	if (FestivalAD_Background == 1) {
		$("#Background_closed").hide();
		$(".WthiteBox_Left").remove();
		$(".Background_Advertising").remove();
		$(".FestivalAD_link").remove();
	}else{
		$(".Background_Advertising").css("height",docHeight);
		$(".WthiteBox_Left").css("height",""+WhiteHeight+"px");
		$(".FestivalAD_header").css("margin-top",""+ FestivalAD_hdeight +"px");
        $(".WthiteBox_Left").css("top",""+ADwhite_Height+"px");
	}

	$("#Background_closed").click(function(){
		$("#Background_closed").hide();
		$(".FestivalAD_header").animate({"margin-top":"10px"},600);
		$(".Background_Advertising").remove();
		$(".WthiteBox_Left").remove();
		$(".FestivalAD_link").remove();
		document.cookie=""+cookiePre+"FestivalAD = 1";
	})

	//加载页面时执行一次
	if (Skin_Num == "") {
		changeMargin();
	}else{
		$(".WthiteBox_Left").css({"width":"1220px","margin-left":"-610px"});
		$(".FestivalAD_link").css({"width":"1220px","margin-left":"-610px"});
	}
    //监听浏览器宽度的改变
    window.onresize = function(){
		if (Skin_Num == "") {
			changeMargin();
		}else{
			$(".WthiteBox_Left").css({"width":"1220px","margin-left":"-610px"});
			$(".FestivalAD_link").css({"width":"1220px","margin-left":"-610px"});
		}
    };
    function changeMargin(){
        //获取网页可见区域宽度
		var docWidth = document.body.clientWidth;
        var screenwidth = window.innerWidth || document.body.clientWidth;
		var criticalPoint = criticalPoint != undefined ? criticalPoint : 1240;
		if(screenwidth < criticalPoint){
			$(".WthiteBox_Left").css({"width":"1020px","margin-left":"-510px"});
			$(".FestivalAD_link").css({"width":"1020px","margin-left":"-510px"});
        }else{
			$(".WthiteBox_Left").css({"width":"1220px","margin-left":"-610px"});
			$(".FestivalAD_link").css({"width":"1220px","margin-left":"-610px"});
		}
    }
})
