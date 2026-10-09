$(function(){

  if($('#content .textarea').length == 0){
    var inner = $('#content').children();
    inner.wrap('<div class="textarea placeholder" contenteditable="true"></div>');
  }

  var focusDiv = null;

  var userAgent = navigator.userAgent.toLowerCase();

  wx.config({
    debug: false,
    appId: wxconfig.appId,
    timestamp: wxconfig.timestamp,
    nonceStr: wxconfig.nonceStr,
    signature: wxconfig.signature,
    jsApiList: ['chooseImage', 'previewImage', 'uploadImage', 'downloadImage','startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice']
  });

  function pj(obj){
    var str = [];
    for(var i in obj){
      str.push(i+"="+obj[i]);
    }
    return str.join("&");
  }
  if (userAgent.match(/MicroMessenger/i) == "micromessenger") {
    //atlasMax = atlasMax > 9 ? 9 : atlasMax;

    var fileCount = 0;

    //微信上传图片
    wx.ready(function() {

      $('#filePicker1').bind('click', function(){

        var localIds = [];
        wx.chooseImage({
          count: atlasMax > 9 ? 9 : atlasMax,
          success: function (res) {
            localIds = res.localIds;
            localIds = localIds.reverse();
            syncUpload();
          },
          fail: function(err){
          },
          complete: function(){
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
                      // uploadbtn.after('<li id="' + id + '" class="thumbnail"><img src="'+turl+'" data-val="'+fid+'"><div class="file-panel"><span class="cancel"></span></div></li>');
                      var html = '<div id="' + id + '" class="thumbnail">';
                      html += '<img src="'+turl+'">';
                      html += '<div class="file-panel"><span class="cancel"></span></div>';
                      html += '</div>';
                      html += '<div contenteditable="true" class="inp-item placeholder"></div>';

                      $('#content').append(html);

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
                syncUpload();
              },
            });
          }
        }
      });

      $("#content").delegate(".thumbnail_img .cancel", "click", function(){
        var p = $(this).closest(".thumbnail"), img = p.find("img").attr("data-val");
        delAtlasPic(img);
        p.remove();
        fileCount--;
      })

    });

    $('.editor .video').show();
    createUploader(2);

  //默认上传
  }else{

    createUploader(1);
    createUploader(2);

  }

  $(document).click(function(){
    $('.editor, .anotherbox').removeClass('emotion');
    $('.emotion.item').removeClass('on');
    $('.emotion-box').hide();
  })

  $('.content').click(function(e){
    if($(e.target).hasClass('content')){
      set_focus($('.placeholder:last'));
      focusDiv = null;
    }
  })

  $('.textarea').focus(function(){
    var t = $(this), txtGray = t.find('.txt-gray');
    if (txtGray.length > 0) {
      t.html('');
    }
  })

  $('.textarea').blur(function(){
    var t = $(this), txtGray = t.find('.txt-gray');
    if (t.html() == "") {
      t.html('<font class="txt-gray">'+langData['siteConfig'][39][4]+'</font>');//请输入店铺简介
    }
  })

  $('body').delegate('.placeholder', 'click', function(e){

    focusDiv = $(e.target);

    var t = $(this);
    // set_focus(t);
    $('.editor, .anotherbox').removeClass('emotion');
    $('.emotion.item').removeClass('on');
    $('.emotion-box').hide();
    $('.content').css({'padding-bottom': '1.4rem'});
    return false;
  })

  $('.content').height($(window).height() -$('.header').height() -$('.bar').height() - $('.title').height()*3 - $('.editor').height());


  //光标定位到最后
  function set_focus(el){
    el=el[0];
    el.focus();
    if($.browser.msie){
      var rng;
      el.focus();
      rng = document.selection.createRange();
      rng.moveStart('character', -el.innerText.length);
      var text = rng.text;
      for (var i = 0; i < el.innerText.length; i++) {
        if (el.innerText.substring(0, i + 1) == text.substring(text.length - i - 1, text.length)) {
          result = i + 1;
        }
      }
      return false;
    }else{
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }


  // 删除视频
  $('#content').delegate('.iframe .file-panel', 'click', function(){
    var t = $(this), iframe = t.closest('.iframe'), inpItem = iframe.next('.inp-item');
    if (inpItem.html() == "") {
      inpItem.remove();
    }
    iframe.remove();
  })

  //错误提示
  var showErrTimer;
  function showErr(txt){
      showErrTimer && clearTimeout(showErrTimer);
      $(".popErr").remove();
      $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
      $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
      $(".popErr").css({"visibility": "visible"});
      showErrTimer = setTimeout(function(){
        $(".popErr").fadeOut(300, function(){
          $(this).remove();
        });
      }, 1500);
  }

  $("#content").focus(function(){
    var t = $(this), con = t.html();
    if(con == langData['siteConfig'][39][4]){//请输入店铺简介
      t.removeClass("placeholder").html("");
    }
  });

  $("#content").blur(function(){
    var t = $(this), con = t.html();
    if(con == ""){
      t.addClass("placeholder").html(langData['siteConfig'][39][4]);//请输入店铺简介
    }
  });

  // 上传设置
  function createUploader(id) {
    var extension = $('#filePicker'+id).attr('data-extensions'), title, mimeTypes = $('#filePicker'+id).attr('data-mimeTypes');
    //上传凭证
    var $list = $('#content'), uploadbtn = $('.uploadbtn'),
        ratio = window.devicePixelRatio || 1,
        fileCount = 0,
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
      server: '/include/upload.inc.php?mod=siteConfig&'+serverUrl,
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

    //删除已上传视频
    var delAtlasVideo = function(b){
      var g = {
        mod: "siteConfig",
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

    // 负责view的销毁
    function removeFile(file) {
      var $li = $('#'+file.id);
      fileCount--;
      if ($li.hasClass(".thumbnail_img")) {
        delAtlasPic($li.find("img").attr("data-val"));
      }else {
        var src = $li.find("video").attr("data-val");
        delAtlasVideo(src);
      }
      $li.off().find('.file-panel').off().end().remove();
    }

    //从队列删除
    $list.delegate(".cancel", "click", function(){
      var t = $(this), li = t.closest(".thumbnail"), inpItem = li.next('.inp-item');
      var file = [];
      file['id'] = li.attr("id");
      if (inpItem.html() == "") {
        inpItem.remove();
      }
      removeFile(file);
    });


    // 当有文件添加进来时执行，负责view的创建
    function addFile(file) {
      if (id == "1") {
        var $li   = $('<div id="' + file.id + '" class="thumbnail thumbnail_img"><img></div>'),
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
        var $li   = $('<div id="' + file.id + '" class="thumbnail thumbnail_video"><video poster="" webkit-playsinline="true" preload="auto" playsinline x5-video-player-type="h5" x5-video-player-fullscreen="true" x5-video-ignore-metadata="true" controls><source src="" type="video/mp4"></video></div>'),
            $btns = $('<div class="file-panel"><span class="cancel"></span></div>').appendTo($li),
            $img = $li.find('video');
      }

      $btns.bind('click', '.cancel', function(){
        uploader.removeFile(file, true);
      });

      if(focusDiv){
        focusDiv.after($li);
      }else{
        $list.append($li);
      }
    }

    // 当有文件添加进来的时候
    uploader.on('fileQueued', function(file) {

      //先判断是否超出限制
      if(fileCount == atlasMax){
        showErr(langData['siteConfig'][20][305]);//图片数量已达上限
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
      if(response.state == "SUCCESS"){
        $li.find("img").attr("data-val", response.url).attr("src", "/include/attachment.php?f="+response.url);

        var video = [];
        if (id == "2") {
          var $li   = $('#'+file.id);
          $li.html('<video class="video-js" data-setup="{}" controls src="/include/attachment.php?f='+response.url+'" data-val="'+response.url+'" webkit-playsinline="true" preload="auto" playsinline x5-video-player-type="h5" x5-video-player-fullscreen="true" x5-video-ignore-metadata="true" poster="'+response.poster+'"></video></div>');
          var $btns = $('<div class="file-panel"><span class="cancel"></span></div>').appendTo($li);
          $li.after('<div contenteditable="true" class="inp-item placeholder"></div>');
          $btns.on('click', '.cancel', function(){
            uploader.removeFile(file, true);
          });
        }
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
    uploader.on('error', function(code, file){
      var txt = langData['siteConfig'][44][30];//请上传正确的文件格式
      switch(code){
        case "Q_EXCEED_NUM_LIMIT":
          txt = langData['siteConfig'][20][305];//图片数量已达上限
          break;
        case "F_EXCEED_SIZE":
          txt = langData['siteConfig'][44][31].replace('1',(atlasSize/1024/1024));//大小超出限制，单张图片最大不得超过1MB
          break;
        case "F_DUPLICATE":
          txt = langData['siteConfig'][20][308];//此图片已上传过
          break;
      }
      showErr(txt+'-'+code);
    });

  }

  //删除已上传图片
  var delAtlasPic = function(b){
    var g = {
      mod: "siteConfig",
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


  $(".fabuBtn").click(function(){
    var t = $(this);
    if(t.hasClass('disabled')) return;

    $(".content").find('.placeholder').removeAttr('contenteditable');
    $(".content").find('.inp-item').removeAttr('contenteditable');
    var content = $("#content").html();
    var time = new Date().getTime();
    content = content.replace(/WU_FILE_/g, 'WU_FILE_' + time);

    t.addClass('disabled');
    $.ajax({
      url: masterDomain + '/include/ajax.php?service=house&action=storeConfigGroup&note='+encodeURIComponent(content),
      type: 'get',
      dataType: 'jsonp',
      success: function(data){
        if(data && data.state == 100){
          if(device.indexOf('huoniao') > -1) {
            setupWebViewJavascriptBridge(function (bridge) {
              bridge.callHandler("goBack", {}, function (responseData) {
              });
            });
          }else{
            window.location.href = document.referrer;
          }
        }else{
          t.removeClass('disabled');
          alert(data.info);
        }
      },
      error: function(){
        t.removeClass('disabled');
        alert(langData['siteConfig'][6][203]);//请求出错请刷新重试
      }
    });
  })

})