$(function(){

  var mold_ = mold;

  $('body').append($('#model_html').html());
  function changeItem(id, init){
    // not('[name="imglist"], [name="body"], [name="mbody"]')
    $('.variable').hide().find('input, textarea, select').filter('[name=video]').prop('disabled', true);
    $('.variable-'+id).show().find('input, textarea, select').prop('disabled', false);
    if(mold == 2 && mold_ == 2){
      $("#videoSource_choose .tab-nav label").eq(detail.videotype).click();
    }
    var dropdown = $('.variable-'+mold+' .dropdown');
    dropdown.length && !dropdown.hasClass('arrow-down') && dropdown.click();

    if(init != true){
      $('.gz-addr-seladdr').attr({'data-param':'&mold='+mold, 'data-id':null, 'data-ids':null})
        .find('.selgroup').html('<p><font style="color: #aaa;">'+langData['siteConfig'][7][2]+'</font></p>')
        .next('input').val(0);//请选择
      $('.gz-sel-addr-nav, .gz-sel-addr-list').html('');
    }

    $('#mold').val(mold);
  }
  //切换类型
  $('.choose_mold li').click(function(){
    var t = $(this), val = t.data('id');
    if(t.hasClass('curr')) return;
    // if(val===3) return;
    // if(val == 3 || mold == 3){
    //  $.dialog.alert(mold == 3 ? "短视频不支持更改类型" : "短视频类型仅支持在APP端上传并发布");
    //  setTimeout(function(){
    //    t.siblings('[data-id='+mold+']').addClass('curr').siblings().removeClass('curr');
    //    $("#mold").val(mold);
    //  }, 300)
    //  return;
    // }
    mold = val;
    changeItem(val);
    t.addClass('curr').siblings().removeClass('curr');
  })

  // 展开下拉式选项
  $(".dropdown").click(function(){
    var t = $(this), box = $("#"+t.attr("data-drop"));
    if(t.hasClass("arrow-down")){
      t.removeClass("arrow-down");
      box.removeClass("fade-in");
    }else{
      t.addClass("arrow-down");
      box.addClass("fade-in");
      box.trigger('dropdown');
    }
  })

  // 切换原创
  $(".propBox input[name='article_prop']").change(function(){
    var article_prop = $(this).val();
    if(article_prop == '1'){
      $(".forSource").removeClass('fn-hide')
      $('#source,#sourceurl').val('')
    }else{
      $(".forSource").addClass('fn-hide')
    }
  })


  // 切换全景类型
  $(".tab-nav label").click(function(){
    var t = $(this), index = t.index(), box = t.parent().next('.tab-body');
    box.children('div').eq(index).fadeIn(100).siblings().hide();
  })

  //下拉菜单
  $('.demo-test-select').scroller(
    $.extend({preset: 'select'})
  );


  changeItem(mold, true);

  var upObj = [];

  var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
  if (ua.match(/MicroMessenger/i) == "micromessenger") {
    var atlasMax = 1;
    var modelType = 'article';

    // var fileCount = 0;
      // 添加一个loading
     $("body").append('<div id="loadingimg"> <div class="mask_transparent"></div> <div class="toast"> <i class="loading icon_toast"></i> <p class="toast__content">图片上传中</p> </div> </div>')

    wx.config({
      debug: false,
      appId: wxconfig.appId,
      timestamp: wxconfig.timestamp,
      nonceStr: wxconfig.nonceStr,
      signature: wxconfig.signature,
      jsApiList: ['chooseImage', 'previewImage', 'uploadImage', 'downloadImage','startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice']
    });
    //微信上传图片
    wx.ready(function() {
      $('.up').each(function(i){
        var t = $(this), dt = t.find('dt');
        if(t.data('file') == 'video'){
          webupload(t, i);
        }else{
          var btnwrap = dt.children('.btnwrap');
          var id = 'up_' + i;
          if(!btnwrap.length){
            dt.append('<div class="btnwrap" style="width:'+dt.css('width')+';height:'+dt.css('height')+'" id="'+id+'"></div>');
          }
        }
      })
      $('.up .btnwrap, .up .bindbtn').unbind().bind('click', function(){
        var o = $(this), t = o.closest('.up');
        if(t.data('file') == 'video'){
          return;
        }

        var dt = t.children('dt'), dd = dt.siblings('dd'), type = t.data('type'), count = t.data('count') ? t.data('count') : 1;
        var thiscount = count - t.siblings('.pic').length;
        var localIds = [];
        wx.chooseImage({
          count: thiscount > 9 ? 9 : thiscount,
          success: function (res) {
            localIds = res.localIds;
            
            syncUpload(dd);

          },
          fail: function(err){
          },
          complete: function(){
          }
        });

        function syncUpload(dd) {
          var par = dd.parent();
          var dt = dd.siblings('dt');
          if (!localIds.length) {
            // alert('上传成功!');
            //$("#loadingimg").removeClass("show");
          } else {
             
            for(var i = 0; i < localIds.length; i++){
              var localId = localIds[i];
              wx.uploadImage({
                localId: localId,
                success: function(res) {
                  var serverId = res.serverId;
                 $("#loadingimg").addClass("show");
                  $.ajax({
                    url: '/api/weixinImageUpload.php',
                    type: 'POST',
                    data: {"service": "siteConfig", "action": "uploadWeixinImage", "module": modelType, "media_id": serverId},
                    dataType: "json",
                    async: false,
                    success: function (data) {
                      $("#loadingimg").removeClass("show");
                      if (data.state == 100) {
                        var fid = data.fid, url = data.url, turl = data.turl, time = new Date().getTime(), id = "wx_upload" + time;

                        if(count == 1){
                          dt.find('.remove').addClass('force').click();
                          dd.children("input").val(fid);

                          if(t.data('file') == 'video'){
                            if(data.poster){
                              dt.append('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><video src="'+turl+'" class="video" data-val="'+fid+'" poster="'+data.poster+'"></video><a href="javascript:;" class="remove"></a></div>')
                            }else{
                              dt.append('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><p class="video" data-val="'+fid+'">'+langData['siteConfig'][39][93]+'</p><a href="javascript:;" class="remove"></a></div>')//无法预览
                            }
                          }else{
                            dt.append('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><img src="'+turl+'" data-val="'+fid+'"><a href="javascript:;" class="remove"></a></div>')
                          }

                          dt.append('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><img src="'+turl+'" data-val="'+fid+'"><a href="javascript:;" class="remove"></a></div>')
                          bindbtn.length && bindbtn.addClass('edit').html('<span></span>'+bindbtn.data('edit-title'));
                        }else{
                          par.before('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><img src="'+turl+'" data-val="'+fid+'"><a href="javascript:;" class="remove"></a></div>');
                          var len = par.siblings('.pic').length;
                          par.find('.tit').text(len+'/'+count)
                          if(count == len){
                            par.append('<div class="stopup" style="width:'+dt.css('width')+';height:'+dt.css('height')+'" id="'+id+'"></div>');
                          }

                          var pics = [];
                          par.siblings('.pic').each(function(){
                            var img = $(this).children('img');
                            var src = img.attr('data-val');
                            var des = img.data('des') ? img.data('des') : ''
                            pics.push(src+'|'+des);
                          })
                          dd.children("input").val(pics.join(','));
                        }
                        //alert("33")
                      }else {
                        //alert("111")
                       $("#loadingimg").removeClass("show");
                        showMsg(data.info);
                      }

                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                      //alert("222")
                      $("#loadingimg").removeClass("show");
                      showMsg(XMLHttpRequest.status);
                      showMsg(XMLHttpRequest.readyState);
                      showMsg(textStatus);
                    }
                  });

                  // fileCount++;
                  // updateStatus();

                  // syncUpload();
                },
              });
            }
          }
        }
      });

    });
  }else{

    $('.up').each(function(i){
      webupload($(this), i);
    })
  }

  function webupload(obj, i){
    var t = obj, dt = t.find('dt'), dd = t.children('dd'), type = t.data('type'), bindbtn = t.find('.bindbtn'), bindcss = '', count = t.data('count') ? t.data('count') : 1, file = t.data('file');
    var title = filetype = '';
    if(file == 'video'){
      title = 'Video';
      filetype = 'video';
    }else{
      title = 'Image';
    }
    var btnwrap = dt.children('.btnwrap');
    var id = 'up_' + i;
    if(!btnwrap.length){
      var extensions = t.data('extensions') ? 'data-extensions="'+t.data('extensions')+'"' : '', mimeTypes = t.attr('data-mimeTypes') ? 'data-mimeTypes="'+t.attr('data-mimeTypes')+'"' : '';
      dt.append('<div class="btnwrap" style="width:'+dt.css('width')+';height:'+dt.css('height')+'" id="'+id+'" '+extensions+' '+mimeTypes+'></div>');
    }
    if(bindbtn.length){
      bindcss = 'bindbtn-up-'+i;
      bindbtn.addClass(bindcss);
      bindcss = '.'+bindcss;
    }
    t.attr('data-index', i);
    var replace = count == 1 ? true : false;

    upObj[i] = new Upload({
      btn: '#'+id,
      bindBtn: bindcss,
      title: title,
      mod: 'article',
      params: 'type='+type+'&filetype='+filetype,
      atlasMax: count,
      deltype: 'del'+type,
      replace: replace,
      fileQueued: function(file){
        dt.append('<div class="pic" id="'+file.id+'"></div>');
      },
      uploadSuccess: function(file, response){
        dt.find('#'+file.id).remove();
        if(response.state == "SUCCESS"){


          // var con = dd.children('.pic');
          // if(con.length == 0) dd.append('<div class="pic"></div>');
          // dd.children('.pic').show().html('<img src="'+response.turl+'" data-val="'+response.url+'"><a href="javascript:;" class="remove"></a>').siblings('div').hide();
          if(count == 1){
            dt.find('.remove').addClass('force').click();
            dd.children("input").val(response.url)

            if(t.data('file') == 'video'){
              if(response.poster){
                dt.append('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><video class="video" data-val="'+response.url+'" poster="'+response.poster+'"></video><a href="javascript:;" class="remove"></a></div>')
              }else{
                dt.append('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><p class="video" data-val="'+response.url+'">'+langData['siteConfig'][39][93]+'</p><a href="javascript:;" class="remove"></a></div>')//无法预览
              }
            }else{
              dt.append('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><img src="'+response.turl+'" data-val="'+response.url+'"><a href="javascript:;" class="remove"></a></div>')
            }
            bindbtn.length && bindbtn.addClass('edit').html('<span></span>'+bindbtn.data('edit-title'));
          }else{
            t.before('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><img src="'+response.turl+'" data-val="'+response.url+'"><a href="javascript:;" class="remove"></a></div>');
            var len = t.siblings('.pic').length;
            t.find('.tit').text(len+'/'+count)
            if(count == len){
              t.append('<div class="stopup" style="width:'+dt.css('width')+';height:'+dt.css('height')+'" id="'+id+'"></div>');
            }
            var pics = [];
            t.siblings('.pic').each(function(){
              var img = $(this).children('img');
              var src = img.attr('data-val');
              var des = img.data('des') ? img.data('des') : ''
              pics.push(src+'|'+des);
            })
            dd.children("input").val(pics.join(','));
          }
        }
      },
      showErr: function(info){
        showMsg(info);
      }
    });
  }

  $('.upbox').delegate('.remove', 'click', function(e){
    e.stopPropagation();
    var t = $(this);
    if(t.hasClass('force')){
      delFile(t);
    }else{
      showMsg2(langData['siteConfig'][44][66], function(){//确定要删除该文件？
        delFile(t);
      })
    }
  })

  //提交发布
  $("#submit").bind("click", function(event){

    var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

    event.preventDefault();

    var t           = $(this),
				title       = $("#title"),
				cityid      = $("#cityid").val(),
				// typeid      = $("#typeid").val(),
				writer      = $("#writer").val(),
				source      = $("#source"),
				textarea    = $("#textarea"),
        sourceurl   = $("#sourceurl"),
        error       = $(".error"),
        text        = error.find('p');

    var typeid = $("#typeid").parent("dl").attr("data-id");

    if(typeid == undefined || typeid == ''){
      typeid = 0;
    }
    $("#typeid").val(typeid);


    if(t.hasClass("disabled")) return;

    var titleRegex = '.{2,50}';
    var exp = new RegExp("^" + titleRegex + "$", "img");


    if(!exp.test(title.val())){
      showMsg(langData['siteConfig'][20][343]);
      return false;
    }
    else if(cityid == 0 || cityid == ''){
      showMsg(langData['siteConfig'][20][585]);
      return false;
    }
    else if(typeid == 0 || typeid == ''){
      showMsg(langData['siteConfig'][20][367]);
      return false;
    }
    else if(textarea.val() == "" || textarea.val() == 0){
      if(mold == 0){
        showMsg(langData['siteConfig'][20][368]);
        return false;
      }
    }

    var personRegex = '.{2,15}';
    var exp = new RegExp("^" + personRegex + "$", "img");
    // if(!exp.test(writer)){
    //   showMsg(langData['siteConfig'][20][369]);
    //   return false;
    // }
    // else 
    if((source.val() == "" || source.val() == 0) && $("input[name='article_prop']").val() == '1'){
      showMsg(langData['siteConfig'][20][39]);
      return false;
    }


    if(!tj) return;

    data = form.serialize();

    var imglist = [], imgli = $("#tuji_box .upbox .pic");

    imgli.each(function(index){
      var t = $(this), val = t.find("img").attr("data-val");
      if(val != ''){
        var img = $(this).find("img"), val = img.attr("data-val"), des = img.attr("data-des") ? img.attr("data-des") : '';
        if(val != ""){
          imglist.push(val+"|"+des);
        }
      }
    })

    data = form.serialize();
    if(imglist){
      data += "&imglist="+imglist.join(",");
    }

    data += "&body=" + encodeURIComponent($('.textarea').html());

    t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

    $.ajax({
      url: action,
      data: data,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data && data.state == 100){

          fabuPay.check(data, url, t);

        }else{
          alert(data.info)
          t.removeClass("disabled").html(langData['siteConfig'][11][19]);
        }
      },
      error: function(){
        alert(langData['siteConfig'][20][183]);
        t.removeClass("disabled").html(langData['siteConfig'][11][19]);
      }
    });


  });

  function delFile(t){
    var type = 0;
    var par = t.parent().parent();
    if(par.hasClass('up-group')){
      type = 1;
      var p = par.find('.up');
    }else{
      var p = t.closest('.up'), bindbtn = p.find('.bindbtn');
    }
    var obj = t.siblings('img'), deltype = '';
    if(!obj.length){
      obj = t.siblings('.video');
      deltype = 'delVideo';
    }else{
      deltype = p.data('type') ? 'del'+p.data('type') : 'delatlas';
    }
    var path = obj.attr('data-val')
    var index = p.attr('data-index');
    var count = p.data('count') ? p.data('count') : 1;
    var bindbtn = p.find('.bindbtn');
    delAtlasPic(path, deltype);
    t.parent().remove();
    if(count == 1){
      p.find('dd input').val('');
    }else{
      var pics = [];
      var len = 0;
      par.children('.pic').each(function(){
        len++;
        var img = $(this).children('img');
        var src = img.attr('src');
        var des = img.data('des') ? img.data('des') : ''
        pics.push(src+'|'+des);
      })
      p.find('dd input').val(pics.join(","));
      if(type == 1){
        p.find('.stopup').remove();
        var tit = p.find('.tit'), s = tit.data('title') ? tit.data('title') : langData['siteConfig'][6][78];//上传照片
        tit.text(len == 0 ? s : len+'/'+count);
      }
    }
    bindbtn.length && bindbtn.removeClass('edit').html('<span></span>'+bindbtn.data('up-title'));
  }

  //删除已上传图片
  var delAtlasPic = function(b, t){
    var t = t ? t : 'delatlas';
    var g = {
      mod: "article",
      type: t,
      picpath: b,
      randoms: Math.random()
    };
    $.ajax({
      type: "POST",
      url: "/include/upload.inc.php",
      data: $.param(g)
    })
  };
  function showMsg2(title, ok, cancel, type){
    $('.model_title').html(title);
    if(type == null){
      $('.model_btns').html('');
    }if(type == 'ok'){
      $('.model_btns').html('<a href="javascript:;" class="ok">'+langData['siteConfig'][6][1]+'</a>');//确定
    }else{
      $('.model_btns').html('<a href="javascript:;" class="cancel">'+langData['siteConfig'][6][12]+'</a><a href="javascript:;" class="ok">'+langData['siteConfig'][6][1]+'</a>');//取消 -- 确定
    }
    $('.model_del').show();
    $('.desk').addClass('show');
    $('.model_del .ok').click(function(){
      $('.model_del').hide();
      $('.desk').removeClass('show');
      ok && ok();
    })
    $('.model_del .cancel').click(function(){
      $('.model_del').hide();
      $('.desk').removeClass('show');
      cancel && cancel();
    })
    $('.desk, .model_del .close').click(function(){
      $('.model_del').hide();
      $('.desk').removeClass('show');
    })
  }
})
