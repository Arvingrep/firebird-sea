(function (_) {
    _.fn.bigImage = function (options) {
        _('body').append('<style type="text/css">  #bigImg-box{display: none;}</style>');


        var artMainCon = options.artMainCon;

        var t_img; // 定时器
        var isLoad = true; // 控制变量
        var div = _('#bigImg-box');

        let device=navigator.userAgent.toLowerCase();
        var sources;
        // 小程序/App图片预览处理
        if (device.match(/micromessenger/)||device.includes("toutiaomicroapp")||device.indexOf('huoniao')!=-1) {
            sources = []; //预览的媒体文件
            let len = _(artMainCon).find('img').length;
            for (let i = 0; i < len; i++) {
                _(artMainCon).find('img').eq(i).attr('data-index', i); //添加下标
                let imgSrc = _(artMainCon).find('img').eq(i).attr('src'); //图片src
                if (imgSrc) {
                    sources.push(imgSrc.indexOf('http')!=-1?imgSrc:masterDomain+imgSrc);
                }
            }
        }
        else{
            // 判断图片加载状况，加载完成后回调
            isImgLoad(async function(){
                // 加载完成
                var len= _(artMainCon).find('img').length;
    
                for(let i=0 ;i<len; i++){
                    var src = _(artMainCon).find('img').eq(i).attr('src');
                    var url = _(artMainCon).find('img').eq(i).attr('data-url');
                    var imgs = new Image();
                    imgs.src = src;
                    imgs.url = url != undefined ? url : '';
                    var promise=new Promise(resolve=>{
                        imgs.onload = function(){
                            resolve(this);
                        }
                    });
                    await promise; //异步请求同步化，使图片加载顺序不乱
                    promise.then(res=>{
                        var w = res.width, h = res.height;
                        div.append('<a href='+res.src+' data-size="'+(w*4)+'x'+(h*4)+'" data-id="'+i+'" data-med="'+res.src+'" data-url="'+res.url+'" data-med-size="'+(w*1.5)+'x'+(h*1.5)+'"><img src='+res.src+' alt="" /></a>');
                    });
                }
            });
            // 判断图片加载的函数
            function isImgLoad(callback){
                // 注意我的图片类名都是cover，因为我只需要处理cover。其它图片可以不管。
                // 查找所有封面图，迭代处理
                _(artMainCon).find('img').each(function(){
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
        }

        _(artMainCon).delegate('img', 'click', function () {
            // 微信小程序
            if (device.match(/micromessenger/)) {
                wx.previewImage({
                    urls: sources,
                    current:sources[$(this).attr('data-index')]
                });
            }
            else if(device.includes("toutiaomicroapp")){ //抖音小程序
                tt.miniProgram.previewImage({
                    urls: sources,
                    current:sources[$(this).attr('data-index')]
                });
            }
            else if(device.indexOf('huoniao')!=-1){ //APP
                let url=sources[$(this).attr('data-index')];
                setupWebViewJavascriptBridge(function (bridge) {
                    bridge.callHandler(
                        'previewImage',
                        { 
                            'urls': sources,
                            'current':url
                        },
                        function (responseData) {}
                    );
                });
            }
            else{ //H5
                var w = _(this).width(), h = _(this).height();
                var src = _(this).attr('data-src') ? _(this).attr('data-src') : _(this).attr('src');
                var url = _(this).attr('data-url');
                url = url != undefined ? url : '';
                for(var m=0;m<div.find('a').length; m++){
                    var med = div.find('a').eq(m).attr('data-med');
                    var _url = div.find('a').eq(m).attr('data-url');
                    if(med.indexOf(src) > -1 || (med.indexOf(url) > -1 && url != '') || (src.indexOf(url) > -1 && url != '') || (_url.indexOf(url) > -1 && url != '' && _url != '') || (url.indexOf(_url) > -1 && url != '' && _url != '')){
                        div.find('a').eq(m).click();
                        return false;
                    }
    
                }
            }
        });
    }
})($)
