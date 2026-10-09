$(function () {
    var objId =$('.topSwiper .swiper-wrapper')
    //海报列表
    getPosterList();
    function getPosterList(){
        $.ajax({
            url: "/include/ajax.php?service=member&action=getFenxiaoPosterpic&page=1&pageSize=999",
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state ==100){//后台设定海报
                    var list = data.info, html = [];
                    var listLen = list.length;
                    for(var i = 0; i < listLen; i++){
                        var item        = [],
                                id          = list[i].id,
                                url         = list[i].url,
                                xAxis       = list[i].xAxis,
                                yAxis       = list[i].yAxis,
                                codewidth   = list[i].codewidth,
                                codeheight  = list[i].codeheight,
                                imgwidth    = list[i].imgwidth,
                                imgheight   = list[i].imgheight,
                                litpicpath  = list[i].litpicpath;
                        var loadingPng = templets_skin+"images/loading.gif";

                        html.push('<div class="swiper-slide hasLi" data-xAxis="'+xAxis+'" data-yAxis="'+yAxis+'" data-codewidth="'+codewidth+'" data-codeheight="'+codeheight+'" data-imgwidth="'+imgwidth+'" data-imgheight="'+imgheight+'" data-url="'+url+'">');
                        html.push('<div class="drawImg drawImg'+(i+1)+'" >');
                        html.push('<img class="loading" src="'+loadingPng+'">');
                        html.push('<p>'+langData['siteConfig'][35][21]+'</p>');//生成中
                        html.push('</div>');

                        html.push('<div class="imgBox imgBox'+(i+1)+'">');//浏览--预定
                        html.push('<div class="code-img"><img src="/include/qrcode.php?type=fenxiao&data='+url+'" alt=""></div>');
                        html.push('<div class="pimg" data-src="'+litpicpath+'">');
                        if(i == 0 || i == 1 || i == listLen-1){//其余图片滑动加载
                            html.push('<img src="'+litpicpath+'" alt="" class="realImg"> ');
                        }
                        html.push('</div>');
                        html.push('</div>');
                        html.push('</div>');

                    }
                    objId.html(html.join(""));
                    swiperSetOk(1);

                }else{//默认海报
                    noPosterList();
                }

            },
            error: function(){
                noPosterList()

            }
        });
    }

    function noPosterList(){
        var noHtml = [];
        for(var k = 0; k < 5; k++){

            var loadingPng = templets_skin+"images/loading.gif";
            var litpicpath = templets_skin+'upfile/bg_'+(k+1)+'.png';
            noHtml.push('<div class="swiper-slide noLi">');
            noHtml.push('<div class="drawImg drawImg'+(k+1)+'" >');
            noHtml.push('<img class="loading" src="'+loadingPng+'">');
            noHtml.push('<p>'+langData['siteConfig'][35][21]+'</p>');//生成中
            noHtml.push('</div>');

            noHtml.push('<div class="imgBox imgBox'+(k+1)+'">');
            noHtml.push('<div class="code-img"><img src="/include/qrcode.php?type=fenxiao&data='+baseHost+'/register.html?fromShare='+uid+'" alt=""></div>');
            noHtml.push('<div class="pimg" data-src="'+litpicpath+'">');
            if(k == 0 || k == 1 || k == 4){//其余图片滑动加载
                noHtml.push('<img src="'+litpicpath+'" alt="" class="realImg"> ');
            }
            noHtml.push('</div>');
            noHtml.push('</div>');
            noHtml.push('</div>');

        }
        objId.html(noHtml.join(""));
        swiperSetOk();
    }

    var t_img; // 定时器
    var isLoad = true; // 控制变量
    function swiperSetOk(tr){
        var topSwiper = new Swiper('.topSwiper .swiper-container', {
            pagination: {el: '.topSwiper .pagination'} ,
            slideClass:'swiper-slide',
            loop: true,
            grabCursor: true,
            paginationClickable: true,
            slidesPerView :1.4,
            spaceBetween : 35,
            centeredSlides : true,
            on: {
                init: function(swiper){
                    this.emit('transitionEnd');
                },
                slideChangeTransitionEnd: function(){
                    //滑动到哪个 生成哪个
                    var acindex = this.realIndex+1;
                    var clopar = $('.swiper-slide-active').find('.pimg')
                     if(clopar.find('img').size() == 0){
                         var realSrc = clopar.attr('data-src');
                         clopar.append('<img src="'+realSrc+'" alt="" class="realImg" id="realImg'+acindex+'"> ');
                       // clopar.find('img').removeClass('loading').addClass('realImg').attr('src',realSrc)
                     }

                    if(!$('.drawImg'+acindex).hasClass('hasOk')){//未生成
                        $('.loasMask').show();
                        // 判断图片加载状况，加载完成后回调
                        isImgLoad(function(){
                            // 加载完成
                            if(tr){//后台设置海报
                                setTimeout(function(){
                                    codePosition(acindex);
                                },200)
                            }else{//默认海报
                                setTimeout(function(){
                                    posterMake(acindex);
                                },500)
                            }
                        });

                    }

                },

              },

        });
    }




    // 判断图片加载的函数
    function isImgLoad(callback){
        // 查找所有需要判断的图，迭代处理
        $('.realImg').each(function(){
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
            },500); // 我这里设置的是500毫秒就扫描一次，可以自己调整
        }
    }

    //如果没有菜单内容，则隐藏APP端右上角菜单
    if (device.indexOf('huoniao') > -1 && ($('.dropnav').size() == 0 || $('#navlist').size() == 0)) {
        setTimeout(function(){
            setupWebViewJavascriptBridge(function(bridge) {
                bridge.callHandler('hideAppMenu', {}, function(){});
            });
        }, 500);
    }

    //后台设置的海报 定位二维码的位置
    function codePosition(indexS){
        var t = $('.swiper-slide-active');
        var x = parseInt(t.attr('data-xAxis')),
            y = parseInt(t.attr('data-yAxis')),
            codewidth = parseInt(t.attr('data-codewidth')),//二维码宽度
            codeheight = parseInt(t.attr('data-codeheight')),//二维码高度
            cropwidth = parseInt(t.width()),//图片裁剪后宽度--就是这个slide
            imgwidth = parseInt(t.attr('data-imgwidth')),//原图宽度
            imgheight = parseInt(t.attr('data-imgheight')),//原图高度
            url = t.attr('data-url');//自定义跳转链接
        var ratio1 = imgwidth/cropwidth;
        var sh = (codewidth/ratio1).toFixed(2);
        var st = (codeheight/ratio1).toFixed(2);
        var sx = (x/ratio1).toFixed(2);
        var sy = (y/ratio1).toFixed(2);
        t.find('.code-img').css({'display':'block','left':sx+'px','top':sy+'px','width':sh+'px','height':st+'px'})

        setTimeout(function(){
            posterMake(indexS,url);
        },300)


    }

    function posterMake(trindex,url=''){
        $.ajax({
            url: "/include/ajax.php",
            type: "POST",
            data: {
                service: 'siteConfig',
                action: 'getWeixinQrPost',
                module: 'siteConfig',
                type: 'fenxiao',
                aid: '0',
                title: postConfig.title,
                description: postConfig.description,
                imgUrl: postConfig.imgUrl,
                link: url ? url : postConfig.link
            },
            async: false,
            dataType: "json",
            success: function (response) {
                if(response.state == 100){
                    $('.code-img img').attr('src', response.info.indexOf('http') > -1 && response.info.indexOf('weixin.qq.com') < 0 ? response.info : '/include/qrcode.php?type=fenxiao&data=' + response.info);
                }

                getCavas(trindex);
            },
            error: function (xhr, status, error) {
                getCavas(trindex);
            }
        });
    }




    var time1;
   function getCavas(i){

       var htmlDom = document.querySelector(".swiper-slide-active .imgBox"+i);

        time1 = setInterval(function(){//第一次未生成时  继续循环 直到生成为止 生成之后清除掉定时器
            //生成图片
            html2canvas(htmlDom, {
                'backgroundColor':null,
                'useCORS':true,
                'taintTest':true,

            }).then(canvas => {
                var a = canvasToImage(canvas);
                $('.drawImg'+i).show();
                $('.drawImg'+i).html(a);
                $('.imgBox'+i).hide();
                //海报全部加载完成 去掉loading
                $('.drawImg'+i).addClass('hasOk')
                $('.loasMask').hide();

            });
        },2000)


        function canvasToImage(canvas) {

            clearInterval(time1);//清楚定时器
            var image = new Image();
            image.setAttribute("crossOrigin",'anonymous')
            var imageBase64 = canvas.toDataURL("image/png",1);
            image.src = imageBase64;  //把canvas转换成base64图像保存
            utils.setStorage("huoniao_poster" , imageBase64);
            return image;
        }
    }


    //长按
    var flag=1  //设置长按标识符
    var timeOutEvent=0;
    $('body').delegate('.drawImg','touchstart',function(e){
        if(flag){
            clearTimeout(timeOutEvent);
            timeOutEvent = setTimeout("longPress()",800);
        }
    })
    $('body').delegate('.drawImg','touchmove',function(e){
        clearTimeout(timeOutEvent);
            timeOutEvent = 0;
    })
    $('body').delegate('.drawImg','touchend',function(e){
        flag=1;
    })


});


//长按执行的方法
function longPress(){
    var imgsrc = $(".swiper-slide-active .drawImg").find('img').attr('src');
    if(imgsrc==''||imgsrc==undefined){
        alert(langData['siteConfig'][44][94]);//下载失败，请重试
        return 0
    }
    //还在生成中时，直接返回
    if($('.loasMask').is(':visible')){
        return 0;
    }
    flag=0;

    utils.setStorage("huoniao_poster" , imgsrc);
    setupWebViewJavascriptBridge(function(bridge) {
        bridge.callHandler(
            'saveImage',
            {'value': 'huoniao_poster'},
            function(responseData){
                if(responseData == "success"){
                    setTimeout(function(){
                        flag=1;
                    }, 200)
                }

            },

        );
    });
}
