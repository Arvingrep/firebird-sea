/****
 * 20220630 --微信上传图片
 * 
 * 
 * 
 * 
 * ****/ 






// var wxconfig = {
//     "appId": '{#$wxjssdk_appId#}',
//     "timestamp": '{#$wxjssdk_timestamp#}',
//     "nonceStr": '{#$wxjssdk_nonceStr#}',
//     "signature": '{#$wxjssdk_signature#}',
// };

// wxconfig必须配置的
var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
var loadingFc = {
    show:function(text,icon){
        $('.upLoading').remove()
        var txt = text ? text : '加载中';
        var licon = icon ? icon : '/static/images/loading.png';
        var div = document.createElement('div');
        div.innerHTML = '<div class="upLoading"><div class="loadingIcon"><img src="'+licon+'"></div><p>'+txt+'</p></div>'
        window.document.body.appendChild(div);
        
    },
    hide:function(){
        $('.upLoading').hide();
        setTimeout(() => {
            $('.upLoading').remove()
        }, 1500);
    }
}
function wxUploader(options,callback1,callback2){  //callback1是 上传成功之后展示的方法， callback2是点击事件触发的方法
    var uploadbtn = options.btn,   //触发上传功能的按钮,必须传
        atlasMax = options.atlasMax ? options.atlasMax : 1, //上传数量
        fileType = options.fileType ? 'img' : 1, //上传数量
        loadingIcon = options.loadingIcon ? options.loadingIcon : '', //loading的div
        del_btn = options.del_btn ? options.del_btn : '',  //删除按钮
        imgshow_box = options.imgShowBox ?  options.imgShowBox : '';  //上传之后图片展示的div,不配置的话则默认返回 图片数组
        var fileCount = $(uploadbtn).attr('data-fileCount') ? $(uploadbtn).attr('data-fileCount') : 0;
        if (ua.match(/MicroMessenger/i) == "micromessenger") {  //必须在微信环境下
            
            //微信上传图片
            wx.config({
                debug: false,  //页面调试
                appId: wxconfig.appId,
                timestamp: wxconfig.timestamp,
                nonceStr: wxconfig.nonceStr,
                signature: wxconfig.signature,
                jsApiList: ['chooseImage', 'previewImage', 'uploadImage', 'downloadImage']
            });


            wx.ready(function() {
            	 
                $('body').undelegate(uploadbtn,'click').delegate(uploadbtn,'click',function(){
                    if(callback2){
                        callback2()
                    }
                    wx.chooseImage({
                        count: atlasMax > 9 ? 9 : atlasMax,
                        success: function (res) {
                            localIds = res.localIds.reverse();
                            syncUpload();
                        }
                    });
                })


                 // 具体上传执行的方法
                 function syncUpload() {
                    if (!localIds.length) {
                        // alert('上传成功!');
                        // loadingFc.hide()
                        //$("#loadingimg").removeClass("show");
                    } else {
                        var localId = localIds.pop();
                        wx.uploadImage({
                            localId: localId,
                            isShowProgressTips: 1,
                            success: function(res) {
                                
                                var serverId = res.serverId;
                                //先判断是否超出限制
                                if(fileCount >= atlasMax){
                                    $("#loadingimg").removeClass("show");
                                    showErrAlert(langData['siteConfig'][20][305]);//图片数量已达上限
                                    return false;
                                }
                                loadingFc.show('上传中')
                              
                                $.ajax({
                                    url: '/api/weixinImageUpload.php',
                                    type: 'POST',
                                    data: {"service": "siteConfig", "action": "uploadWeixinImage", "module": modelType, "media_id": serverId},
                                    dataType: "json",
                                    async: false,
                                    success: function (data) {
                                        loadingFc.hide()
                                        if (data.state == 100) {
                                            fileCount++;
                                            if(!callback1){
                                                var fid = data.fid, url = data.url, turl = data.turl, time = new Date().getTime(), id = "wx_upload" + time;
                                                $(uploadbtn).before('<li id="' + id + '" class="thumbnail imgshow_box"><div class="img_show"><img src="'+turl+'" data-val="'+fid+'"></div><i class="del_btn">+</i></li>');
                                                $("#loadingimg").removeClass("show");
                                            }else{
                                                callback1(data); //手动执行添加预览图片
                                            }
                                        }else {
                                            alert(data.info);
                                            $("#loadingimg").removeClass("show");
                                        }
                                        syncUpload();  //循环执行该方法
                                    },
                                    error: function(XMLHttpRequest, textStatus, errorThrown){
                                        $("#loadingimg").removeClass("show");
                                        alert(XMLHttpRequest.status);
                                        alert(XMLHttpRequest.readyState);
                                        alert(textStatus);
                                        syncUpload();
                                        loadingFc.hide()
                                        // fileCount--;
                                    }
                                });

                                
                                $(uploadbtn).attr('data-fileCount',fileCount);
                                // if(fileCount >= atlasMax){
                                //     $(uploadbtn).hide()
                                // }
                                // updateStatus();

                            }
                        });
                    }
                }


                //从队列删除
                $('body').undelegate(del_btn,'click').delegate(del_btn, "click", function(){
                    var t = $(this), li = t.closest(".thumbnail");
                    li = li && li.length ? li : t.closest('li')
                    delAtlasPic(li.find("img").attr("data-val"));
                    li.remove();
                    fileCount = fileCount - 1;
                    $(uploadbtn).attr('data-fileCount',fileCount);

                    //alert(langData['siteConfig'][45][66])//点我删除
                });


                	//删除已上传图片
                var delAtlasPic = function(b){
                    var g = {
                        mod: modelType,
                        type: "delAtlas",
                        picpath: b,
                        randoms: Math.random()
                    };
                    $.ajax({
                        type: "POST",
                        url: "/include/upload.inc.php",
                        data: $.param(g)
                    })
                };

                
            })






        }





    
}



//判断是否加载过文件 
function isInclude(name){
    var js= /js$/i.test(name);
    var es=document.getElementsByTagName(js?'script':'link');
    for(var i=0;i<es.length;i++)
        if(es[i][js?'src':'href'].indexOf(name)!=-1)return true;
    return false;

}