$(function () {
    // //添加主持人作品
    $('.upload_btn').click(function () {
        $('.upvideo-bg').removeClass('upvideo-box-hide');
        $('.upvideo-box').removeClass('upvideo-box-hide');
    });
    
    $('.upvideo-bg').click(function () {
        $('.upvideo-bg').addClass('upvideo-box-hide');
        $('.upvideo-box').addClass('upvideo-box-hide');
    });

    $('.cancel_btn').click(function () {
        $('.upvideo-bg').addClass('upvideo-box-hide');
        $('.upvideo-box').addClass('upvideo-box-hide');
    });

    $("#fileList").delegate("li", "click", function(e){
        var target = $(e.target);
        $("#title_text").val('');
        $('.video-box dt .pic').remove();
        $("#fileList2").html('');
        $("#isedit").val('');
        if(target.closest(".del_btn").length == 0){//点击id为sibader之外的地方触发
            $('.upvideo-bg').removeClass('upvideo-box-hide');
            $('.upvideo-box').removeClass('upvideo-box-hide');
            var t = $(this), id = t.attr('id'), title = t.attr('data-title'), litpic = t.attr('data-img'), video = t.attr('data-video');
            if(title){
                $("#title_text").val(title);
            }
            if(litpic){
                var imgpath = '<div class="pic" style="width:165.594px;height:114.813px;"><img src="'+cfg_attachment+litpic+'" data-val="'+litpic+'"><a href="javascript:;" class="remove"></a></div>';
                $(".video-box .up dt").append(imgpath);
            }
            if(video){
                var videopath = '<li id="WU_FILE_0" class="thumbnail complete"><video class="video-js" id="video_WU_FILE_0" src="'+cfg_attachment+video+'" data-val="'+video+'" poster=""><source src="'+cfg_attachment+video+'" type="video/mp4" data-val="'+video+'"></video><div class="file-panel"><span class="cancel"></span></div><span class="player"></span><p class="info">上传成功<span class="time"></span></p></li>';
                $("#fileList2 ").html(videopath);
            }
            if(target.closest("#uploadbtn").length == 0){
                $("#isedit").val(id);
            }
        }
    });

    var datas=[];
    $('.sure_btn').click(function () {
        var editBtn = $("#isedit").val();
        if(editBtn!=''){
            $('#'+editBtn).remove();
        }
        if(!$('#title_text').val()){
            showErr(''+langData['marry'][4][41]+''); //作品标题不能为空！
        }else if($('.video-box dt .pic').length == 0){
            showErr(''+langData['marry'][4][42]+''); //请上传视频封面图
        }else if($('#fileList2 li').length == 0){
            showErr(''+langData['marry'][4][43]+''); //请上传视频
        }else{
            var tit = $('#title_text').val();
            var img = $('.video-box dt .pic img').attr('src');
            var imgSource = $('.video-box dt .pic img').attr('data-val');
            var vid = $('#fileList2 li video').attr('id');
            var videoSource = $('#fileList2 li video').attr('data-val')

            var data = {};
            data["tit"] = tit;
            data["img"] = img;
            data["vid"] = vid;
            data["imgSource"]   = imgSource;
            data["videoSource"] = videoSource;
            datas.push(data);

            $('.upvideo-bg').addClass('upvideo-box-hide');
            $('.upvideo-box').addClass('upvideo-box-hide');
            $('#title_text').val("");
            $('.video-box dt .pic').remove();

            var vidoid =  $('#fileList2 li').attr('id');

            $('#fileList2').html("");

            for (var i=0;i<datas.length;i++){
                var list = '<li data-title="'+datas[i].tit+'" data-img="'+datas[i].imgSource+'" data-video="'+datas[i].videoSource+'" id="'+vidoid+'"><div class="img-box"><img src="'+datas[i].img+'" alt=""></div><i class="play_btn"></i><span class="del_btn">+</span><div class="title">'+datas[i].tit+'</div></li>';
            }

            $('#fileList').prepend(list);


        }
    });


    // 删除视频
    $('.uploader-list').delegate('.del_btn','click',function () {
        delAtlasPic($(this).parent().attr('data-img'));
        delAtlasVideo($(this).parent().attr('data-video'));
        $(this).parent().remove();
        var i = $(this).parent().attr('id');
        datas.splice(i,1);
        var file = [];
        file['id'] = $(this).parent().attr('id');
        createUploader(2);
    })



    // 表单验证
    function isPhoneNo(p) {
        var areaCode = parseInt($("#areaCode").val());
        if(areaCode == 86){
            var pattern = /^1[23456789]\d{9}$/;
            return pattern.test(p);
        }
        return true;
    }
    $('.fabu_btn .btn').click(function () {
        var t = $(this);
        var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

        if($('#comname').val() == ''){
            showErr(''+langData['marry'][4][25]+'');//请输入姓名！
            tj = false;
        }else if($('#price').val() == '' && $('#price').val() < 0){
            showErr(''+langData['marry'][4][14]+'');//请输入价格！
            tj = false;
        }else if($('#phone').val() == ''){
            showErr(''+langData['marry'][4][12]+'');//请输入手机号！
            tj = false;
        }else if(isPhoneNo($.trim($('#phone').val())) == false){
            showErr(''+langData['marry'][4][13]+'');//请输入正确的手机号！
            tj = false;
        }

        var worksItem = [];
        $("#fileList").find("li").each(function(i){
            var title = $(this).attr('data-title'), litpic = $(this).attr('data-img'), video = $(this).attr('data-video');
            if(title != undefined && litpic != undefined && video != undefined){
                worksItem.push(title+"$$$"+litpic+"$$$"+video);
            }
        });

        if(!tj) return;

        $('.fabu_btn .btn').addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中

        $.ajax({
	        url: action,
	        data: form.serialize()+ "&worksItem="+worksItem.join("|||"),
	        type: "POST",
	        dataType: "json",
	        success: function (data) {
	            if(data && data.state == 100){
	            	var tip = langData['siteConfig'][20][341];
                    if(id != undefined && id != "" && id != 0){
                        tip = langData['siteConfig'][20][229];
                    }
                    location.href = url;
	            }else{
					showErr(data.info);
	            	t.removeClass("disabled").html(langData['marry'][2][58]);		//立即发布
	            }
	        },
	        error: function(){
				showErr(langData['siteConfig'][20][183]);
	            t.removeClass("disabled").html(langData['marry'][2][58]);		//立即发布
	        }
        });

    });


    //错误提示
    var showErrTimer;
    function showErr(txt){
        showErrTimer && clearTimeout(showErrTimer);
        $(".popErr").remove();
        $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
        // $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
        $(".popErr").css({"visibility": "visible"});
        showErrTimer = setTimeout(function(){
            $(".popErr").fadeOut(300, function(){
                $(this).remove();
            });
        }, 1500);
    }

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

    //删除已上传视频
    var delAtlasVideo = function(b){
        var g = {
            mod: modelType,
            type: "delVideo",
            picpath: b,
            randoms: Math.random()
        };
        $.ajax({
            type: "POST",
            url: "/include/upload.inc.php",
            data: $.param(g)
        })
    };

    //上传凭证
    var $list = $('#fileList'),
        uploadbtn = $('.uploadbtn'),
        ratio = window.devicePixelRatio || 1,
        fileCount = 0,
        thumbnailWidth = 100 * ratio,   // 缩略图大小
        thumbnailHeight = 100 * ratio,  // 缩略图大小
        uploader;

    fileCount = $list.find("li.item").length;


    var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
        //atlasMax = atlasMax > 9 ? 9 : atlasMax;

        //微信上传图片
        wx.config({
            debug: false,
            appId: wxconfig.appId,
            timestamp: wxconfig.timestamp,
            nonceStr: wxconfig.nonceStr,
            signature: wxconfig.signature,
            jsApiList: ['chooseImage', 'previewImage', 'uploadImage', 'downloadImage']
        });
        wx.ready(function() {
            $('#filePicker1').bind('click', function(){

                var localIds = [];
                wx.chooseImage({
                    count: atlasMax > 9 ? 9 : atlasMax,
                    success: function (res) {
                        localIds = res.localIds;
                        localIds = localIds.reverse();
                        syncUpload();
                    }
                });

                function syncUpload() {
                    if (!localIds.length) {
                        // alert('上传成功!');
                    } else {
                        var localId = localIds.pop();
                        wx.uploadImage({
                            localId: localId,
                            success: function(res) {
                                var serverId = res.serverId;

                                //先判断是否超出限制
                                if(fileCount >= atlasMax){
                                    showErr(langData['siteConfig'][20][305]);//图片数量已达上限
                                    return false;
                                }

                                $.ajax({
                                    url: '/api/weixinImageUpload.php',
                                    type: 'POST',
                                    data: {"service": "siteConfig", "action": "uploadWeixinImage", "module": modelType, "media_id": serverId},
                                    dataType: "json",
                                    async: false,
                                    success: function (data) {
                                        if (data.state == 100) {
                                            var fid = data.fid, url = data.url, turl = data.turl, time = new Date().getTime(), id = "wx_upload" + time;
                                            uploadbtn.after('<li id="' + id + '" class="thumbnail"><img src="'+turl+'" data-val="'+fid+'"><div class="file-panel"><span class="cancel"></span></div></li>');
                                        }else {
                                            alert(data.info);
                                        }
                                    },
                                    error: function(XMLHttpRequest, textStatus, errorThrown){
                                        alert(XMLHttpRequest.status);
                                        alert(XMLHttpRequest.readyState);
                                        alert(textStatus);
                                    }
                                });

                                fileCount++;
                                $('.imgtip').hide();
                                //updateStatus();

                                syncUpload();
                            }
                        });
                    }
                }
            });

            //从队列删除
            $('#fileList1').delegate(".cancel", "click", function(){
                var t = $(this), li = t.closest("li");
                delAtlasPic(li.find("img").attr("data-val"));
                li.remove();
            });
        });


        createUploader(2);

        //默认上传
    }else{

        createUploader(1);
        setTimeout(function(){
            if (appInfo.device == "") {
                createUploader(2);
            }
        }, 300)

    }


    // 上传设置
    function createUploader(id) {
        var extension = $('#filePicker'+id).attr('data-extensions'), title, mimeTypes = $('#filePicker'+id).attr('data-mimeTypes');
        //上传凭证
        var $list = $('#fileList'+id), uploadbtn = $('.uploadbtn'),
            ratio = window.devicePixelRatio || 1,
            fileCount = $list.children("li").not(".uploadbtn").length,
            thumbnailWidth = 100 * ratio,   // 缩略图大小
            thumbnailHeight = 100 * ratio,  // 缩略图大小
            uploader,
            serverUrl;

        if (id == "1") {
            title = 'Images';
            serverUrl = 'type=atlas';
        }else {
            title = 'Video';
            serverUrl = 'type=thumb&filetype=video';
        }

        // 初始化Web Uploader
        uploader = WebUploader.create({
            auto: true,
            swf: staticPath + 'js/webuploader/Uploader.swf',
            server: '/include/upload.inc.php?mod='+modelType+'&'+serverUrl,
            pick: '#filePicker'+id,
            fileVal: 'Filedata',
            accept: {
                title: title,
                extensions: extension,
                mimeTypes: mimeTypes
            },
            compress: {
                width: 750,
                height: 750,
                // 图片质量，只有type为`image/jpeg`的时候才有效。
                quality: 90,
                // 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
                allowMagnify: false,
                // 是否允许裁剪。
                crop: false,
                // 是否保留头部meta信息。
                preserveHeaders: true,
                // 如果发现压缩后文件大小比原来还大，则使用原来图片
                // 此属性可能会影响图片自动纠正功能
                noCompressIfLarger: false,
                // 单位字节，如果图片大小小于此值，不会采用压缩。
                compressSize: 1024*200
            }
            // fileNumLimit: atlasMax,
            // fileSingleSizeLimit: atlasSize
        });

        // 负责view的销毁
        function removeFile(file) {
            var $li = $('#'+file.id);
            fileCount--;
            if (id == "1") {
                delAtlasPic($li.find("img").attr("data-val"));
            }else {
                delAtlasVideo($li.find("source").attr("data-val"));
            }
            $li.remove();
            window.removeFile && window.removeFile();
        }

        //从队列删除
        $list.delegate(".cancel", "click", function(){
            var t = $(this), li = t.closest(".thumbnail"), inpItem = li.next('.inp-item');
            var file = [];
            file['id'] = li.attr("id");
            if (inpItem.html() == "") {
                inpItem.remove();
            }
            console.log(file);
            removeFile(file);
        });


        //播放、暂停视频
        $list.delegate(".player", "click", function(){
            var t = $(this), video_ = t.siblings("video")[0];
            if(t.hasClass("ing")){
                video_.pause();
                t.removeClass("ing");
                t.next(".info").show();
            }else{
                video_.play();
                t.addClass("ing");
                t.next(".info").hide();
            }
            // 播放结束
            video_.addEventListener("ended", function(){
                t.removeClass("ing");
                t.next(".info").show();
            })
        });

        // 当有文件添加进来时执行，负责view的创建
        function addFile(file) {
            if (id == "1") {
                var $li   = $('<li id="' + file.id + '" class="thumbnail"><img></li>'),
                    $btns = $('<div class="file-panel"><span class="cancel"></span></div>').appendTo($li),
                    $img = $li.find('img');
                $li.after('<div contenteditable="true" class="inp-item placeholder"></div>');
                // 创建缩略图
                uploader.makeThumb(file, function(error, src) {
                    if(error){
                        $img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][20][304]+'</span>');//不能预览
                        return;
                    }
                    // $('#content .textarea').css('height','auto');
                    $img.attr('src', src);
                }, thumbnailWidth, thumbnailHeight);
            }else {
                // var $li   = $('<div id="' + file.id + '" class="thumbnail"><video poster="" webkit-playsinline="true" preload="auto" playsinline x5-video-player-type="h5" x5-video-player-fullscreen="true" x5-video-ignore-metadata="true" controls><source src="" type="video/mp4"></video></div>'),
                // $btns = $('<div class="file-panel"><span class="cancel"></span></div>').appendTo($li),
                //     $img = $li.find('video');

                var $li = $('<li id="' + file.id + '" class="thumbnail"> <video class="video-js" src="" data-val="" poster="' + file.poster + '"><source src="" type="video/mp4"></video></li>')
                $btns = $('<div class="file-panel"><span class="cancel"></span></div>').appendTo($li);
                $img = $li.find('video');
            }

            $btns.bind('click', '.cancel', function(){
                uploader.removeFile(file, true);
            });

            $list.append($li);
            $('.imgtip').hide();
        }



        // 当有文件添加进来的时候
        uploader.on('fileQueued', function(file) {
            //先判断是否超出限制
            console.log(file.source.type.substr(0, 5))
            var atlasMax_ = file.source.type.substr(0, 5) == "video" ? 5 : atlasMax;
            if(fileCount == atlasMax_){
                showErr(langData['siteConfig'][38][24]);//文件数量已达上限
                uploader.cancelFile( file );
                return false;
            }

            fileCount++;
            addFile(file);
        });

        // 文件上传过程中创建进度条实时显示。
        uploader.on('uploadProgress', function(file, percentage){
            var $li = $('#'+file.id),
                $percent = $li.find('.progress span');

            // 避免重复创建
            if (!$percent.length) {
                $percent = $('<p class="progress"><span></span></p>')
                    .appendTo($li)
                    .find('span');
            }
            $percent.css('width', percentage * 100 + '%');
        });

        // 文件上传成功，给item添加成功class, 用样式标记上传成功。
        uploader.on('uploadSuccess', function(file, response){
            var $li = $('#'+file.id);
            $li.addClass("complete");
            if(response.state == "SUCCESS"){
                $li.find("img").attr("data-val", response.url).attr("src", "/include/attachment.php?f="+response.url);

                var video = [];
                if (id == "2") {
                    var $li   = $('#'+file.id);



                    $li.html('<video class="video-js" id="video_'+file.id+'" src="/include/attachment.php?f='+response.url+'" data-val="'+response.url+'" poster="'+response.poster+'"><source src="/include/attachment.php?f='+response.url+'" type="video/mp4" data-val="'+response.url+'"></video>');

                    var $btns = $('<div class="file-panel"><span class="cancel"></span></div>').appendTo($li);
                    $player = $('<span class="player"></span>').appendTo($li);
                    $info = $('<p class="info">'+langData['siteConfig'][38][26]+'<span class="time">00:00</span></p>').appendTo($li);//上传成功
                    // $li.after('<div contenteditable="true" class="inp-item placeholder"></div>');

                    var video_ = document.getElementById('video_'+file.id);
                    video_.addEventListener("loadedmetadata", function(){
                        var seconde = parseInt(video_.duration);
                        var time = "";
                        if(seconde > 3600){
                            var h = seconde % 3600,
                                m = ( seconde - h * 3600 ) % 60,
                                s = seconde - h * 3600 - m * 60;
                            h = h < 10 ? '0' + h : h;
                            m = m < 10 ? '0' + m : m;
                            s = s < 10 ? '0' + s : s;
                            time = h + ':' + m + ':' + s;
                        }else if(seconde > 60){
                            var m = seconde % 60,
                                s = seconde - m * 60;
                            m = m < 10 ? '0' + m : m;
                            s = s < 10 ? '0' + s : s;
                            time = m + ':' + s;
                        }else{
                            var s = seconde < 10 ? '0' + seconde : seconde;
                            time = '00:' + s;
                        }
                        $info.find("span").text(time);
                    })

                    $btns.on('click', '.cancel', function(){
                        uploader.cancelFile( file );
                        uploader.removeFile(file, true);
                    });

                    // $player.on('click', function(){
                    //  var t = $(this);
                    //  if(t.hasClass("ing")){
                    //    video_.pause();
                    //    t.removeClass("ing");
                    //  }else{
                    //    video_.play();
                    //    t.addClass("ing");
                    //  }
                    // });
                }
                window.uploaderSuccess && window.uploaderSuccess();
            }else{
                removeFile(file);
                showErr(response.state);
            }
        });

        // 文件上传失败，显示上传出错。
        uploader.on('uploadError', function(file){
            removeFile(file);
            showErr(langData['siteConfig'][20][306]);//上传失败
        });

        // 完成上传完了，成功或者失败，先删除进度条。
        uploader.on('uploadComplete', function(file){
            $('#'+file.id).find('.progress').remove();
        });

        //上传失败
        uploader.on('error', function(code){
            var txt = langData['siteConfig'][44][30];//请上传正确的文件格式
            switch(code){
                case "Q_EXCEED_NUM_LIMIT":
                    txt = langData['siteConfig'][38][24];//文件数量已达上限
                    break;
                case "F_EXCEED_SIZE":
                    txt = langData['siteConfig'][9][61].replace('1',(atlasSize/1024/1024));//大小超出限制，单张文件最大不得超过1MB
                    break;
                case "F_DUPLICATE":
                    txt = langData['siteConfig'][44][41];//此文件已上传过
                    break;
            }
            showErr(txt);
        });

    }



});