var shareflag=1  //设置长按标识符
var sharetimeOutEvent=0;
  //长按执行的方法
function slongPressPoster(){
    var imgsrc = $(".poster_box").find('img').attr('src');
    if(imgsrc==''||imgsrc==undefined){
        alert(langData['siteConfig'][44][94]);//下载失败，请重试
        return 0
    }
    shareflag=0;
    setupWebViewJavascriptBridge(function(bridge) {
        bridge.callHandler(
            'saveImage',
            {'value': 'huoniao_poster'},
            function(responseData){
                if(responseData == "success"){
                    setTimeout(function(){
                        shareflag=1;
                    }, 200)
                }
            }
        );
    });
}


$(function(){
	$.cookie('downloadAppTips', 1, {expires: 1}); //隐藏下载app按钮
	$(".btns .poster_btn").click(function(){
		$('html').addClass('noscroll');
		getdetail_poster();
	});

	$(".pop_box .close_btn,.html2_mask").click(function(){
		$(".pop_box").removeClass('show');
		$('.html2_mask').hide();
		$('html').removeClass('noscroll')
	})
	function getdetail_poster(){
		$(".html2_mask").show();
		if($('.html2ImgBox').size() > 0){

			var html2canvas_fixed = $('.pop_box'), html2canvas_fixed_img = $('.pop_box .poster_box img');

			//生成带参数的微信二维码
			if(html2canvas_fixed_img.size() == 0){
				//生成图片
				const shareContent = document.getElementById('html2_node')
				const rect = shareContent.getBoundingClientRect() // 获取元素相对于视口的
				const scrollTop = document.documentElement.scrollTop || document.body.scrollTop // 获取滚动轴滚动的长度
				var width = shareContent.offsetWidth;//dom宽
				var height = shareContent.offsetHeight;//dom高 获取滚动轴滚动的长度
				html2canvas(document.querySelector("#html2_node"), {
				   //'backgroundColor':'#fff',
				   'backgroundColor':'transparent',
				   'useCORS':true,
				   'dpi': window.devicePixelRatio * 2,
				   'scale': 2,
				   // 'x': rect.left, // 绘制的dom元素相对于视口的位置
				   // 'y': rect.top,
				   'width':width,
				   'heoght':height,
				   'scrollY': 0,
				   'scrollX': 0,
				   'taintTest':true,
				   // 'timeout': 500 // 加载延时
				}).then(function(canvas){
					var a = canvasToImage(canvas);
					$('.pop_box .poster_box').html(a);
					$(".html2_mask img").hide();
					$('.pop_box').addClass('show');
					$(".html2ImgBox").hide();
				});
				function canvasToImage(canvas) {
					var image = new Image();
					image.setAttribute("crossOrigin",'anonymous')
					var imageBase64 = canvas.toDataURL("image/png",1);
					image.src = imageBase64;
					utils.setStorage("huoniao_poster" , imageBase64);
					return image;
				}
			}else{
				$('.pop_box').addClass('show');
			}
		}
		return false;
	}

	if($(".gzh_box").size()>0){
		setTimeout(function(){
			getdetail_poster();
		},2000)
	}



    $(".poster_box").on({
        touchstart: function(e){
            if(shareflag){
                clearTimeout(sharetimeOutEvent);
                sharetimeOutEvent = setTimeout("slongPressPoster()",800);
            }
            // e.preventDefault();
        },
        touchmove:function () {
            clearTimeout(sharetimeOutEvent);
            sharetimeOutEvent = 0;
        },
        touchend:function () {
            shareflag = 1;
        }

    });



})
