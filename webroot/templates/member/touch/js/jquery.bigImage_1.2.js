(function ($) {
    $.fn.bigImage = function (options) {
        $('body').append('<style type="text/css">  #bigImg-box{display: none;}</style>');
        var artMainCon = options.artMainCon;
		var show_Con = options.show_Con;
        var t_img; // 定时器
        var isLoad = true; // 控制变量
        var div = $('#bigImg-box');
		
        // 判断图片加载状况，加载完成后回调
        isImgLoad(function(){
            // 加载完成
            var len= $(artMainCon).find(show_Con).length;
            div.html('');
            for(var i=0 ; i<len; i++){
                var src = $(artMainCon+' '+show_Con).eq(i).find('img').attr('src');
                var imgs = new Image(); 
                imgs.src = src;
                imgs.onload = function(){
                    var w = this.width, h = this.height;
                    div.append('<a href='+this.src+' data-size="'+(w*5)+'x'+(h*5)+'"  data-med='+this.src+' data-med-size="'+(w)+'x'+(h)+'"><img src='+this.src+' alt="" /></a>');
                  
                }
            }
        });

        // 判断图片加载的函数
        function isImgLoad(callback){
            // 注意我的图片类名都是cover，因为我只需要处理cover。其它图片可以不管。
            // 查找所有封面图，迭代处理
            $(artMainCon).find(show_Con+' img').each(function(){
                // 找到为0就将isLoad设为false，并退出each
                if(this.height === 0){
                    isLoad = false;
                    return false;
                }
            });
            // 为true，没有发现为0的。加载完毕
            if(isLoad){
                clearTimeout(t_img); // 清除定时器
                // 回调函数
                callback();
                // 为false，因为找到了没有加载完成的图，将调用定时器递归
            }else{
            	
                isLoad = true;
                t_img = setTimeout(function(){
                    isImgLoad(callback); // 递归扫描
                    console.log('测试新加载图片')
                },500); // 我这里设置的是500毫秒就扫描一次，可以自己调整
            }
        }

        $(artMainCon).delegate(show_Con,'click',function(){
            var w =$(this).find('img').width(),h = $(this).find('img').height();
            var src = $(this).find('img').attr('src'),index = $(this).index();
            for(var m=0;m<div.find('a').length; m++){
                if(div.find('a').eq(m).attr('data-med').indexOf(src) > -1){
                    div.find('a').eq(m).click();
                }


            }

        });
        //按下关闭按钮
        $('.pswp__button--close').click(function(){
        	setTimeout(function(){
        		$('.pswp').removeClass('pswp--open pswp--touch pswp--css_animation  pswp--svg  pswp--visible');
        	},500);
        })

    }
})(Zepto)
