$(function(){
  
  //APP端取消下拉刷新
  toggleDragRefresh('off');

   //年月日
  $('.demo-test-date').scroller(
    $.extend({preset: 'date', dateFormat: 'yy-mm-dd'})
  );

  //发布商品选择品牌
  $('#designer').scroller(
    $.extend({
      preset: 'select',
      // group: true
    })
  ).change(function(){
    getAlbums($(this).val());
  });

  //异步获取分站及小区
  var community = $('#community').attr('data-id');
  function getCity(){

      $.ajax({
          url: masterDomain + "/include/ajax.php?service=renovation&action=addr&son=1",
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
              if (data && data.info.length > 0) {
                var len = data.info.length;

                for(var i = 0; i < len; i++){
                  var d = data.info[i];
                  var html = [];
                  html.push('<optgroup label="'+d.typename+'" id="addr_g_'+d.id+'"></optgroup>');
                  $('#community').append(html.join(''));
                  getCommunity(d.id, i + 1 == len ? 1 : 0);
                }

              }
          }
      })
  }
  function getCommunity(id, last){
      $.ajax({
          url: masterDomain + "/include/ajax.php?service=renovation&action=community&addrid="+id,
          type: "GET",
          dataType: "jsonp",
          success: function (res) {
              var html2 = [];
              if (res && res.state == 100){
                  for(var m = 0; m < res.info.list.length; m++){
                      var c = res.info.list[m];
                      var sel = c.id == community ? ' selected="selected"' : '';
                      html2.push('<option value="'+c.id+'"'+sel+'>'+c.title+'</option>');
                  }

              }
              if(html2.length) {
                  $('#addr_g_' + id).html(html2.join(''));
              }else{
                  $('#addr_g_' + id).html('<option value="-'+id+'">'+langData['siteConfig'][20][127]+'</option>');
              }
              if(last){
                  $("#community").prop('disabled', false).scroller(
                      $.extend({
                          preset: 'select',
                          group: true
                      })
                  )
              }
          }
      })
  }
  getCity();


  $("#typeObj span").bind("click", function(){
    var t = $(this), id = t.data("id");
    $("#type0, #type1").hide();
    t.addClass('curr').siblings().removeClass('curr');
    $("#type"+id).show();
    $("#type").val(id);
  });

  $('.radio span').click(function(){
    var t = $(this), id = t.data("id");
    t.addClass('curr').siblings('span').removeClass('curr').siblings("input").val(id);
  })

  getAlbums($("#designer").val());

  //获取设计师的设计方案
  function getAlbums(id) {
    if(id != 0 && id != ""){
      $.ajax({
        url: masterDomain+"/include/ajax.php?service=renovation&action=rcase&designer="+id,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
          if(data && data.state == 100){

            var arr = [], list = data.info.list;
            for(var i = 0; i < list.length; i++){
              arr.push('<option  value="'+list[i].id+'">'+list[i].title+'</li>')
            }
            $("#case").html(arr.join(""));
            $("#case").scroller(
              $.extend({
                preset: 'select',
                // group: true
              })
            );

          }else{
            $("#case").html('').prev('input').remove();
          }
        },
        error: function(){
          $("#selCase .sel").html(langData['siteConfig'][20][228]+'<span class="caret"></span>').attr("disabled", true);
        }
      });
    }
  }

  // 上传图片
  $('.input-img').each(function(){
    var t = $(this), id = t.attr('id'), multiple = t.attr("data-multiple") ? true : false;
    //上传凭证
    var $list = t.closest('dl').find('dt'),
      $par = t.closest('.imgbox'),
      uploadbtn = $('.uploadbtn'),
        ratio = window.devicePixelRatio || 1,
        fileCount = 0,
        maxCount = multiple ? atlasMax : 999,
        thumbnailWidth = 100 * ratio,   // 缩略图大小
        thumbnailHeight = 100 * ratio,  // 缩略图大小
        uploader;
    fileCount = $list.find(".thumbnail").length;

    // 初始化Web Uploader
    uploader = WebUploader.create({
      auto: true,
      swf: staticPath + 'js/webuploader/Uploader.swf',
      server: '/include/upload.inc.php?mod=renovation&type=atlas',
      pick: {
        id:'#'+id,
        multiple: multiple
      },
      fileVal: 'Filedata',
      accept: {
        title: 'Images',
        extensions: 'jpg,jpeg,gif,png',
        mimeTypes: 'image/*'
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
      fileNumLimit: maxCount,
      fileSingleSizeLimit: atlasSize
    });

    //删除已上传图片
    var delAtlasPic = function(b){
      var g = {
        mod: 'renovation',
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

    $(".picsWrap .file-panel").click(function () {
        var t = $(this), img = t.siblings('img').attr('data-val'), p = t.closest('.thumbnail');
        delAtlasPic(img);
        p.remove();
    })

    //更新上传状态
    function updateStatus(){
      if(fileCount == 0){
        $('.imgtip').show();
      }else{
        $('.imgtip').hide();
        if(maxCount > 1 && $list.find('.litpic').length == 0){
          $list.children('li').eq(0).addClass('litpic');
        }
      }
      $(".uploader-btn .utip").html(langData['siteConfig'][20][303].replace('1', (maxCount-fileCount)));
    }

    // 负责view的销毁
    function removeFile(file) {
      var $li = $('#'+file.id);
      fileCount--;
      delAtlasPic($li.find("img").attr("data-val"));
      $li.remove();
      updateStatus();
    }


    // 切换litpic
    // if(maxCount > 1){
    //   $list.delegate(".item img", "click", function(){
    //     var t = $(this).parent('.item');
    //     if(maxCount > 1 && !t.hasClass('litpic')){
    //       t.addClass('litpic').siblings('.item').removeClass('litpic');
    //     }
    //   });
    // }

    var fileArr = [];

    // 当有文件添加进来时执行，负责view的创建
    function addFile(file) {
      var $li   = $('<div id="' + file.id + '" class="thumbnail"><img><div class="file-panel"><span class="cancel"></span></div></div>'),
          $del = $li.find('.file-panel'),
          $img = $li.find('img');

      var imgval = $('#'+id.replace('up_', '')).val();
      if (imgval != "") {
        // uploader.removeFile(imgval, true);
        // removeFile(imgval);
      }

      // 创建缩略图
      uploader.makeThumb(file, function(error, src) {
        if(error){
          $img.replaceWith('<span class="thumb-error">'+langData['siteConfig'][20][304]+'</span>');
          return;
        }
        $img.attr('src', src);
      }, thumbnailWidth, thumbnailHeight);


      if($par.hasClass('picsWrap')){
        $list.append($li);
      }else{
        $list.html($li);
      }

      $del.click(function(){
        removeFile(file);
        uploader.removeFile(file, true);
      })
    }

    // 当有文件添加进来的时候
    uploader.on('fileQueued', function(file) {
      //先判断是否超出限制
      if(fileCount == maxCount){

      }

      fileCount++;
      addFile(file);
      updateStatus();
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
      var $li = $('#'+file.id), par = $li.closest('.imgbox');
      if(response.state == "SUCCESS"){
        $li.find("img").attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
        if(par.hasClass('picsWrap')){
          $li.append('<textarea class="des" rows="5" placeholder="'+langData['siteConfig'][20][477]+'"></textarea>');
        }else{
          $('#'+id.replace('up_', '')).val(response.url);
          fileArr = file;
          $li.closest('dl').find('.picker-btn').text(langData['siteConfig'][6][59]);
        }
      }else{
        removeFile(file);
        showErr(langData['siteConfig'][20][306]);
      }
    });

    // 文件上传失败，现实上传出错。
    uploader.on('uploadError', function(file){
      removeFile(file);
      showErr(langData['siteConfig'][20][306]);
    });

    // 完成上传完了，成功或者失败，先删除进度条。
    uploader.on('uploadComplete', function(file){
      $('#'+file.id).find('.progress').remove();
    });

    //上传失败
    uploader.on('error', function(code){
      var txt = langData['siteConfig'][20][306];
      switch(code){
        case "Q_EXCEED_NUM_LIMIT":
          txt = langData['siteConfig'][20][305];
          break;
        case "F_EXCEED_SIZE":
          txt = langData['siteConfig'][20][307].replace('1', atlasSize/1024/1024);
          break;
        case "F_DUPLICATE":
          txt = langData['siteConfig'][20][308];
          break;
      }
      showErr(txt);
    });

  })

  $('.tjBtn').click(function () {
      $("#fabuForm").submit();
  })
  $("#fabuForm").submit(function(e){
    e.preventDefault();
    var t = $('.tjBtn'),
        form = $(this),
        designer = $('#designer'),
        caseid = $('#case'),
        title = $('#title'),
        litpic = $('#litpic');
    if(t.hasClass('disabled')) return;

    if(designer == 0 || designer == ""){
      showErr(langData['siteConfig'][27][3]);
      return;
    }
    if(title.val() == ""){
      showErr(langData['siteConfig'][45][90]);//请输入标题！
      return;
    }
    if(litpic.val() == ""){
      showErr(langData['siteConfig'][27][78]);
      return;
    }

    var pics = [];
    $('.picsWrap .thumbnail').each(function(){
      var g = $(this), val= g.find('img').attr('data-val'), des = g.find('.des').val();
      pics.push(val+'##'+des);
    })
    if(pics.length == 0){
      showErr(langData['siteConfig'][45][91]);//请上传施工现场图！
      return;
    }
    $('#imglist').val(pics.join("||"));

    var data = form.serialize(), action = form.attr('action'), url = form.attr('data-url');
    $.ajax({
          url: action,
          data: data,
          type: "POST",
          dataType: "json",
          success: function (data) {
              if(data && data.state == 100){
                  var tip = langData['siteConfig'][20][341];
                  if(id != undefined && id != "" && id != 0){
                      tip = langData['siteConfig'][20][229];
                  }

                  showErr(tip, 1000, function () {
                      location.href = url;
                  })
              }else{
                  showErr(data.info);
                  t.removeClass("disabled").html('<a href="javascript:;">'+langData['shop'][1][7]+'</a>');
                  $("#verifycode").click();
              }
          },
          error: function(){
              showErr(langData['siteConfig'][20][183]);
              t.removeClass("disabled").html('<a href="javascript:;">'+langData['shop'][1][7]+'</a>');
              $("#verifycode").click();
          }
      });

  })

  //错误提示
  var showErrTimer;
  function showErr(txt, time, callback){
      showErrTimer && clearTimeout(showErrTimer);
      time = time == undefined ? 1000 : time;
      $(".popErr").remove();
      if(txt == '' || txt == undefined) return;
      $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
      $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
      $(".popErr").css({"visibility": "visible"});
      if(time){
        showErrTimer = setTimeout(function(){
            $(".popErr").fadeOut(300, function(){
                $(this).remove();
                callback && callback();
            });
        }, time);
      }
  }

})