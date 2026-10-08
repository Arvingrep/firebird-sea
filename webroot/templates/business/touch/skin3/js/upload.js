  function Upload(option){
    var upBtn = $(option.btn);
    var ratio = window.devicePixelRatio || 1;

    var def = {
      deltype: 'delImage',
      msg_maxImg: '图片数量已达上限',
      replace: false, //上传单张图片时可以继续上传以便替换 atlasMax = 1
      extensions : upBtn.attr('data-extensions'),
      mimeTypes : upBtn.attr('data-mimeTypes'),
      thumbnailWidth : 100,
      thumbnailHeight : 100,
      has : 0,
      atlasMax : window.atlasMax ? atlasMax : 1,
      fileQueued: function(file){},
      filesQueued: function(files){},
      uploadStart: function(files){},
      uploadError: function(){},
      uploadComplete: function(){},
      uploadFinished: function(){},
      uploadProgress: function(file, percentage){
        var $li = $('#'+file.id),
        $percent = $li.find('.progress span');

        // 避免重复创建
        if (!$percent.length) {
          $percent = $('<p class="progress"><span></span></p>')
            .appendTo($li)
            .find('span');
        }
        $percent.css('width', percentage * 100 + '%');
      },
      uploadSuccess: function(file, response, activeBtn){
        var $li = $('#'+file.id);
        if(response.state == "SUCCESS"){
          $li.find("img").attr("data-val", response.url).attr("src", "/include/attachment.php?f="+response.url);
        }
      },
      showErr: function(info){
        alert(info);
      }
    }
    var config = $.extend(true, {}, def, option);

    this.activeBtn = null;
    this.config = config;
    this.uploader = null;
    this.fileCount = config.has;
    this.init(config);
  }

  Upload.prototype = {
    // 初始化
    init: function(config){
      var that_ = this;
      that_.uploader = WebUploader.create({
        auto: true,
        swf: staticPath + 'js/webuploader/Uploader.swf',
        server: '/include/upload.inc.php?mod='+config.mod+'&'+config.params,
        pick: config.btn,
        fileVal: 'Filedata',
        accept: {
          title: config.title,
          extensions: config.extensions,
          mimeTypes: config.mimeTypes
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
        },
        // fileNumLimit: (config.atlasMax ? config.atlasMax : atlasMax),
        // fileSingleSizeLimit: atlasSize
      });
      // 当有文件添加进来的时候
      that_.uploader.on('fileQueued', function(file) {
        //先判断是否超出限制
        if(that_.fileCount >= config.atlasMax){
          that_.uploader.cancelFile( file );

          that_.config.showErr(config.msg_maxImg, 1000);
          return false;
        }
        if(config.atlasMax > 1 || !config.replace){
          that_.fileCount++;
        }
        config.fileQueued(file, that_.activeBtn);
      });
      // 当有文件添加进来的时候
      that_.uploader.on('filesQueued', function(files) {
        config.filesQueued(files, that_.activeBtn);
      });
      // 某个文件开始的时候
      that_.uploader.on('uploadStart', function(file) {
        config.uploadStart(file);
      });
      // 文件上传过程中创建进度条实时显示。
      that_.uploader.on('uploadProgress', function(file, percentage){
        config.uploadProgress(file, percentage);
      });

      // 文件上传成功，给item添加成功class, 用样式标记上传成功。
      that_.uploader.on('uploadSuccess', function(file, response){
        // config.uploadSuccess(file, response, that_.activeBtn);
        config.uploadSuccess.call(that_, file, response, that_.activeBtn);
        if(response.state != "SUCCESS"){
          $("#"+file.id).remove();
          that_.fileCount--;
          that_.config.showErr(response.state, 1000);
        }
      });

      // 文件上传失败，显示上传出错。
      that_.uploader.on('uploadError', function(file){
        config.uploadError();
        that_config.showErr(langData['siteConfig'][20][306]);
      });

      // 完成上传完了，成功或者失败，先删除进度条。
      that_.uploader.on('uploadComplete', function(file){
        //清空队列
        //  that_.uploader.reset();
        config.uploadComplete();
      });

      // 所有文件上传成功后调用
      that_.uploader.on('uploadFinished', function () {
        //清空队列
        that_.uploader.reset();
        config.uploadFinished();
      });

      if(config.bindBtn){
        $(document).delegate(config.bindBtn, "click", function(){
          that_.activeBtn = $(this);
          $(config.btn + ' label').click();
        })
      }
    },
    del: function(path){
      var g = {
        mod: this.config.mod,
        type: this.config.deltype,
        picpath: path,
        randoms: Math.random()
      };
      $.ajax({
        type: "POST",
        cache: false,
        async: false,
        url: "/include/upload.inc.php",
        dataType: "json",
        data: $.param(g),
        success: function() {}
      });
      this.fileCount--;
    }
  }