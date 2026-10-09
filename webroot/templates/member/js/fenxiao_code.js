
var utils = {
    canStorage: function(){
        if (!!window.localStorage){
            return true;
        }
        return false;
    },
    setStorage: function(a, c){
        try{
            if (utils.canStorage()){
                localStorage.removeItem(a);
                localStorage.setItem(a, c);
            }
        }catch(b){
            if (b.name == "QUOTA_EXCEEDED_ERR"){
                alert("您开启了秘密浏览或无痕浏览模式，请关闭");
            }
        }
    },
    getStorage: function(b){
        if (utils.canStorage()){
            var a = localStorage.getItem(b);
            return a ? JSON.parse(localStorage.getItem(b)) : null;
        }
    },
    removeStorage: function(a){
        if (utils.canStorage()){
            localStorage.removeItem(a);
        }
    },
    cleanStorage: function(){
        if (utils.canStorage()){
            localStorage.clear();
        }
    }
};

$(function(){

    function BrowseFolder(data, index) {  
        var eventPayload = {
            "content": data,
            //图片base64格式太多，此处省略。不包含前缀：data:image/png;base64,
            "fileName": "专属海报"+index+".png",
            "imageType": "png"
        };
        
        var content = eventPayload.content;
        var imageType = eventPayload.imageType;
        var fileName = eventPayload.fileName;

        if(content){ // 接口返回的数据部分
            // 解析图片
            // 因接口直接返回了base64代码部分，所以不需要截取，如果含"data:image/png;base64," 则需要自己做截取处理
            var raw = window.atob(content);
            var rawLength = raw.length;
            var uInt8Array = new Uint8Array(rawLength);
            for(var i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            var blob = new Blob([uInt8Array], {type:'image/'+imageType}); 
            //保存图片
            var aLink = document.createElement('a');
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("click", true, true);
            aLink.download = fileName;
            aLink.href = URL.createObjectURL(blob);
            aLink.click();
        } else{
            console.log('没有base64代码');
        }
    }

    //弹出海报
    var flag = 0,slen = $('.slideBox .bd li').length, slideIndex = 1;
    var hasFlag = true;//后台海报
    if($('.slideBox .bd li:first-child').hasClass('noLi')){
        hasFlag = false;//默认海报
    }
    $('.btn-box .btn').click(function(){
        $('.hbMask,.caseBox').show();
        if(flag == 0){
            $(".slideBox").slide({
                titCell:".hd ul",mainCell:".bd ul",effect:"leftLoop",autoPage:"<li></li>",prevCell:".prev",nextCell:".next",
                startFun:function(i,c){
                    $('.slideBox').find('.bd li:not(".clone")').eq(i).addClass('curr').siblings('li').removeClass('curr');
                    if(flag == 0 && hasFlag){
                        codePosition();//绘制一次即可
                    }
                    slideIndex = i+1;
                    downImgs();

                },
            });
            flag =1
            if(!hasFlag){
                getImg();
            }

        }

    })

    $('.hbMask,.closeHx').click(function(){
         $('.hbMask,.caseBox').hide();
    })

    function codePosition(){
        var ss = 0,len = $('.slideBox .bd li').length;
        $('.slideBox .bd li').each(function(){
            var x = parseInt($(this).attr('data-xAxis')),
                y = parseInt($(this).attr('data-yAxis')),
                codewidth = parseInt($(this).attr('data-codewidth')),//二维码宽度
                codeheight = parseInt($(this).attr('data-codeheight')),//二维码高度
                cropwidth = parseInt($(this).width()),//图片裁剪后宽度--就是这个slide
                imgwidth = parseInt($(this).attr('data-imgwidth')),//原图宽度
                imgheight = parseInt($(this).attr('data-imgheight')),//原图高度
                url = $(this).attr('data-url');//自定义链接
            var ratio1 = imgwidth/cropwidth;
            var sh = Math.round(codewidth/ratio1);
            var st = Math.round(codeheight/ratio1);
            var sx = Math.round(x/ratio1);
            var sy = Math.round(y/ratio1);
            $(this).find('.code-img').css({'display':'block','left':sx+'px','top':sy+'px','width':sh+'px','height':st+'px'})
            ss++;

            getImg($(this), url);
        })
        if(ss == len){
            // getImg($(this), url);
        }


    }
    //推广二维码
    function getImg(t, url = ''){
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
                link: url != '' && url != undefined ? url : postConfig.link
            },
            async: false,
            dataType: "json",
            success: function (response) {
                if(response.state == 100){
                    // $('.code-img img').attr('src', '/include/qrcode.php?data=' + response.info);
                    var codeimg = $('.code-img img');
                    if(t && url){
                        codeimg = t.find('.code-img img');
                    }
                    codeimg.attr('src', response.info.indexOf('http') > -1 && response.info.indexOf('weixin.qq.com') < 0 ? response.info : '/include/qrcode.php?type=fenxiao&data=' + response.info);
                }

                var i=1;
                for(i=1;i<=slen;i++){
                    getCavas(i);
                }
            },
            error: function (xhr, status, error) {
                var i=1;
                for(i=1;i<=slen;i++){
                    getCavas(i);
                }
            }
        });
    }




    function getCavas(i){
        //生成图片
        html2canvas(document.querySelector(".imgBox"+i+""), {
            'backgroundColor':null,
            'useCORS':true,
            'taintTest':false,

        }).then(canvas => {
            var a = canvasToImage(canvas);
            $('.drawImg'+i+'').show();
            $('.drawImg'+i+'').html(a);
            $('.imgBox'+i+'').hide();
            // console.log(imgw)
            if(i == slen){
                //下载图片
                downImgs();
            }
        });
        function canvasToImage(canvas) {
            var image = new Image();
            var imageBase64 = canvas.toDataURL("image/jpeg",1);
            image.src = imageBase64;  //把canvas转换成base64图像保存
            utils.setStorage("huoniao_poster" , imageBase64);
            return image;
        }



    }


    //判断是否为Trident内核浏览器(IE等)函数
    function browserIsIe() {
        if (!!window.ActiveXObject || "ActiveXObject" in window){
            return true;
        }
        else{
            return false;
        }
    }
    //创建iframe并赋值的函数,传入参数为图片的src属性值.
    function createIframe(imgSrc) {
        //如果隐藏的iframe不存在则创建
        if ($("#IframeReportImg").length === 0){
            $('<iframe style="display:none;" id="IframeReportImg" name="IframeReportImg" onload="downloadImg();" width="0" height="0" src="about:blank"></iframe>').appendTo("body");
        }
        //iframe的src属性如不指向图片地址,则手动修改,加载图片
        if ($('#IframeReportImg').attr("src") != imgSrc) {
            $('#IframeReportImg').attr("src",imgSrc);
        } else {
            //如指向图片地址,直接调用下载方法
            downloadImg();
        }
    }
    //下载图片的函数
    function downloadImg() {
        //iframe的src属性不为空,调用execCommand(),保存图片
        if ($('#IframeReportImg').src != "about:blank") {
            window.frames["IframeReportImg"].document.execCommand("SaveAs");
        }
    }
    //接下来进行事件绑定
    function downImgs(){

        return;
        var aBtn = $(".xzPoster .downPoster");
        if (browserIsIe()) {
            //是ie等,绑定事件
            aBtn.on("click", function() {
                var imgSrc = $(".slideBox li.curr .drawImg").find('img').attr('src');
                //调用创建iframe的函数
                createIframe(imgSrc);
            });
        } else {
            //支持download,添加属性.
            // aBtn.attr("download",imgSrc);
            // aBtn.attr("href",imgSrc);
            aBtn.on("click", function(){
                var imgSrc = $(".slideBox li.curr .drawImg").find('img').attr('src');
                BrowseFolder(imgSrc.replace('data:image/jpeg;base64,', ''), slideIndex);
            })


        }
    }

    var aBtn = $(".xzPoster .downPoster");
    aBtn.on("click", function(){
        var imgSrc = $(".slideBox li.curr .drawImg").find('img').attr('src');
        BrowseFolder(imgSrc.replace('data:image/jpeg;base64,', ''), slideIndex);
    })


})
