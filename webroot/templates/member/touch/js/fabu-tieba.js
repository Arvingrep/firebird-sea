$(function () {
  //APP端取消下拉刷新
  toggleDragRefresh('off');

  var userAgent = navigator.userAgent.toLowerCase();

  wx.config({
    debug: false,
    appId: wxconfig.appId,
    timestamp: wxconfig.timestamp,
    nonceStr: wxconfig.nonceStr,
    signature: wxconfig.signature,
    jsApiList: ['chooseImage', 'previewImage', 'uploadImage', 'downloadImage', 'startRecord', 'stopRecord', 'onVoiceRecordEnd', 'playVoice', 'pauseVoice', 'stopVoice', 'onVoicePlayEnd', 'uploadVoice', 'downloadVoice']
  });

  function pj(obj) {
    var str = [];
    for (var i in obj) {
      str.push(i + "=" + obj[i]);
    }
    return str.join("&");
  }
  if (userAgent.match(/MicroMessenger/i) == "micromessenger") {
    //atlasMax = atlasMax > 9 ? 9 : atlasMax;

    var fileCount = 0;

    //微信上传图片
    wx.ready(function () {

      $('#filePicker1').unbind().unbind().bind('click', function () {

        var localIds = [];
        wx.chooseImage({
          count: atlasMax > 9 ? 9 : atlasMax,
          success: function (res) {
            localIds = res.localIds;
            syncUpload();
          },
          fail: function (err) {
          },
          complete: function () {
          }
        });

        function syncUpload() {
          if (!localIds.length) {
            // alert('上传成功!');
          } else {

            var localId = localIds.pop()

            // for(var n = 0; n < localIds.length; n++){
            //   var localId = localIds[n];
            wx.uploadImage({
              localId: localId,
              isShowProgressTips: 1,
              success: function (res) {
                var serverId = res.serverId;

                //先判断是否超出限制
                if (fileCount >= atlasMax) {
                  showErr('图片数量已达上限');
                  return false;
                }

                $.ajax({
                  url: '/api/weixinImageUpload.php',
                  type: 'POST',
                  data: { "service": "siteConfig", "action": "uploadWeixinImage", "module": modelType, "media_id": serverId },
                  dataType: "json",
                  // async: false,
                  success: function (data) {
                    if (data.state == 100) {
                      var fid = data.fid, url = data.url, turl = data.turl, time = new Date().getTime(), id = "wx_upload" + time;
                      // uploadbtn.after('<li id="' + id + '" class="thumbnail"><img src="'+turl+'" data-val="'+fid+'"><div class="file-panel"><span class="cancel"></span></div></li>');
                      var html = '<div id="' + id + '" class="thumbnail">';
                      html += '<img src="' + url + '">';
                      html += '<div class="file-panel"><span class="cancel"></span></div>';
                      html += '</div>';
                      html += '<div contenteditable="true" class="inp-item placeholder"><font class="txt-gray">帖子内容</font></div>';

                      $('#content').append(html);

                    } else {
                      alert(data.info);
                    }
                  },
                  error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert('网络错误，上传失败，请重试！');
                  }
                });

                fileCount++;
                //updateStatus();

                syncUpload();
              },
            });
            // }
          }
        }
      });

      $("#content").delegate(".cancel", "click", function () {
        var p = $(this).closest(".thumbnail"), img = p.find("img").attr("data-val");
        delAtlasPic(img);
        p.remove();
        fileCount--;
      })

    });

    $('.editor .video').show();
    createUploader(2);

    //默认上传
  } else {

    createUploader(1);
    createUploader(2);

  }




  var iswechat = false;
  $(document).click(function () {
    $('.editor, .anotherbox').removeClass('emotion');
    $('.emotion.item').removeClass('on');
    $('.emotion-box').hide();
    $('.content').css({ 'padding-bottom': '1.4rem' });
  })

  $('.content').click(function (e) {
    if ($(e.target).hasClass('content')) {
      set_focus($('.placeholder:last'));
    }
  })

  $('.textarea').focus(function () {
    var t = $(this), txtGray = t.find('.txt-gray');
    if (txtGray.length > 0) {
      t.html('');
    }
  })

  $('.textarea').blur(function () {
    var t = $(this), txtGray = t.find('.txt-gray');
    if (t.html() == "") {
      t.html('<font class="txt-gray">帖子内容</font>');
    }
  })

  $('#content').delegate('.inp-item', 'focus', function () {
    var t = $(this), txtGray = t.find('.txt-gray');
    if (txtGray.length > 0) {
      t.html('');
    }
  })

  $('#content').delegate('.inp-item', 'blur', function () {
    var t = $(this), txtGray = t.find('.txt-gray');
    if (t.html() == "") {
      t.html('<font class="txt-gray">帖子内容</font>');
    }
  })

  $('body').delegate('.placeholder', 'click', function () {
    var t = $(this);
    //set_focus(t);
    $('.editor, .anotherbox').removeClass('emotion');
    $('.emotion.item').removeClass('on');
    $('.emotion-box').hide();
    $('.content').css({ 'padding-bottom': '1.4rem' });
    return false;
  })

  $('.content').height($(window).height() - $('.header').height() - $('.city').height() - $('.title').height() * 3 - $('.editor').height());

  //微信分享

  wx.ready(function () {
    // alert('aa');
    iswechat = true;
    $('.editor .audio').show();
    wx.error(function (res) {
      // alert(res);
    });
    wx.onVoicePlayEnd({
      success: function (res) {
        $('.second').removeClass('pause');
        $('.nolock .audioBtn span').removeClass('pause');
        $('.nolock').removeClass('swiper-no-swiping');
        $('.nolock .tips').text('播放完成').show;
        $('.audio-panel').removeClass('play');
        stopWave();
      }
    });
  });


  //计时器（开始时间、结束时间、显示容器）
  var mtimer, audioTime;
  function countDown(time, obj) {
    var active = $('.swiper-slide-active');
    obj.text(time);
    mtimer = setInterval(function () {
      obj.text(++time);
      if (time >= 60) {
        clearInterval(mtimer);
        audioTime = 60;

        if (active.hasClass('nolock')) {
          var t = $('.nolock .audioBtn span'), btn = t.closest('.audioBtn'), tips = btn.siblings('.tips');
          $('.second').removeClass('pause').addClass('stop');
          t.removeClass('pause').addClass('stop');
          clearTimeout(recordTimer1);
          tips.text('录音完成，点击播放').show();
          $('.nolock').removeClass('swiper-no-swiping');

          wx.stopRecord({
            success: function (res) {
              voiceId = res.localId;
              // alert(voiceId);

            },
            fail: function (res) {
              //alert(JSON.stringify(res));
            }
          });
        } else {
          var t = $('.lock .audioBtn span'), timeObj = t.closest('.audioBtn').siblings('.second');
          t.removeClass('pause');
          $('.second').removeClass('pause');

          timeObj.text('0');

          event.preventDefault();
          wx.stopRecord({
            success: function (res) {
              voiceId = res.localId;
              uploadVoice(1);
            },
            fail: function (res) {
              //alert(JSON.stringify(res));
            }
          });

        }

      }
    }, 1000);
  }

  var voiceId, recordTimer1;
  // 点击开始录音
  $('.nolock .audioBtn span').click(function () {
    var t = $(this), btn = t.closest('.audioBtn'), tips = btn.siblings('.tips'), timeObj = btn.siblings('.second');
    if (!t.hasClass('stop')) {
      if (!t.hasClass('pause')) {
        START = new Date().getTime();
        countDown(0, timeObj);
        recordTimer1 = setTimeout(function () {
          // alert(voiceId);
          wx.startRecord({
            success: function () {
              // localStorage.rainAllowRecord = 'true';
              $('.nolock').addClass('swiper-no-swiping');

              $('.second').addClass('pause');
              t.addClass('pause');
              tips.text('正在录音，点击停止录音').hide();
            },
            cancel: function () {
              alert('用户拒绝授权录音');
            }
          });
        }, 300);
      } else {
        END = new Date().getTime();
        clearInterval(mtimer);
        // alert(voiceId);
        audioTime = timeObj.text();

        $('.second').removeClass('pause').addClass('stop');
        t.removeClass('pause').addClass('stop');
        clearTimeout(recordTimer1);
        tips.text('录音完成，点击播放').show();
        $('.nolock').removeClass('swiper-no-swiping');

        if ((END - START) < 300) {
          END = 0;
          START = 0;
        } else {
          wx.stopRecord({
            success: function (res) {
              voiceId = res.localId;
            },
            fail: function (res) {
              //alert(JSON.stringify(res));
            }
          });
        }
      }
    } else {
      if (t.hasClass('pause')) {
        t.removeClass('pause');
        $('.second').removeClass('pause');
        wx.stopVoice({
          localId: voiceId, // 需要停止的音频的本地ID，由stopRecord接口获得
          success: function (res) {
            $('.nolock').removeClass('swiper-no-swiping');
            tips.text('停止播放');
          },
          fail: function (res) {
            //alert(JSON.stringify(res));
          }
        });
      } else {
        t.addClass('pause');
        wx.playVoice({
          localId: voiceId, // 需要播放的音频的本地ID，由stopRecord接口获得
          success: function (res) {
            $('.nolock').addClass('swiper-no-swiping');
            tips.text('正在播放');
          },
          fail: function (res) {
            //alert(JSON.stringify(res));
          }
        });
      }
    }
  });


  var recordTimer;
  // 按住录音
  $('.lock .audioBtn span').on('touchstart', function () {
    var t = $(this), timeObj = t.closest('.audioBtn').siblings('.second');
    START = new Date().getTime();
    if (iswechat) {
      event.preventDefault();
      recordTimer = setTimeout(function () {
        wx.startRecord({
          success: function () {
            // localStorage.rainAllowRecord = 'true';
            t.closest('.swiper-slide-active').find('.tips').text('正在录音，松手停止录音').hide();
            $('.lock .audioBtn').removeClass('stop');
            t.removeClass('stop').addClass('pause');
            $('.second').removeClass('stop').addClass('pause');
            countDown(0, timeObj);
          },
          cancel: function () {
            alert('用户拒绝授权录音');
          }
        });
      }, 300);
    }
  });

  $('.lock .audioBtn span').on('touchend', function (event) {
    var t = $(this), timeObj = t.closest('.audioBtn').siblings('.second');
    END = new Date().getTime();
    clearInterval(mtimer);

    t.closest('.swiper-slide-active').find('.tips').text('按住按钮开始录音').show();
    clearTimeout(recordTimer);
    t.removeClass('pause');
    $('.second').removeClass('pause');
    audioTime = timeObj.text();
    timeObj.text('0');

    if (iswechat) {
      event.preventDefault();
      if ((END - START) < 300) {
        END = 0;
        START = 0;
      } else {
        wx.stopRecord({
          success: function (res) {
            voiceId = res.localId;
            uploadVoice(1);
          },
          fail: function (res) {
            // alert(JSON.stringify(res));
          }
        });
      }
    }
  });

  var tabsSwiper = null;

  // 打开录音窗口
  $('.audio').click(function () {
    $('.audiobox, .mask').show();
    $('.second').text('0');
    $('body').bind('touchmove', function (e) { e.preventDefault(); })
    $('.nolock .second').text('0');
    $('.nolock .tips').text('点击开始录音');

    if (!tabsSwiper) {
      tabsSwiper = new Swiper('.swiper-audio', {
        speed: 500,
        paginationClickable: false,
        onSlideChangeStart: function () {
          $(".swiper-tab .active-nav").removeClass('active-nav');
          $(".swiper-tab .swiper-slide").eq(tabsSwiper.activeIndex).addClass('active-nav');
          $(window).scrollTop(0);
        },
        onSliderMove: function () {
          isload = true;
        },
        onSlideChangeEnd: function () {
          $('.nolock .second').text('0');
          $('.nolock .tips').text('点击开始录音');
          $('.swiper-slide-active .swiper-no-swiping').removeClass('start');
          $('.swiper-slide-active .swiper-no-swiping').removeClass('stop');
          $('.swiper-slide-active .swiper-no-swiping').removeClass('pause');
          isload = false;
        }
      })
    }

  })

  // 重新录音
  $('.audiobox .reset').click(function () {
    $('.swiper-slide-active .second').text('0');
    $('.lock .tips').text('按住按钮开始录音').show();
    $('.nolock .tips').text('点击开始录音').show();
    $('.second').removeClass('pause');
    $('.second').removeClass('stop');
    $('.swiper-slide-active .audioBtn span').removeClass('start');
    $('.swiper-slide-active .audioBtn span').removeClass('stop');
    $('.swiper-slide-active .audioBtn span').removeClass('pause');
    $('.swiper-slide-active.swiper-no-swiping').removeClass('swiper-no-swiping');
    $('body').unbind('touchmove');
    clearInterval(mtimer);
    clearTimeout(recordTimer);
    clearTimeout(recordTimer1);

    // 停止录音
    wx.stopRecord({
      success: function (res) {
        voiceId = res.localId;
      },
      fail: function (res) {
        // alert(JSON.stringify(res));
      }
    });

  })

  $('.content').delegate('.audio-panel', 'click', function () {
    var t = $(this), id = t.attr('data-id');
    if (t.hasClass('play')) {
      t.removeClass('play');
      wx.stopVoice({
        localId: id,
        success: function (res) { },
        fail: function (res) {
          alert(JSON.stringify(res));
        }
      });
    } else {
      $('.audio-panel').removeClass('play');
      t.addClass('play');
      wx.playVoice({
        localId: id,
        success: function (res) { },
        fail: function (res) {
          alert(JSON.stringify(res));
        }
      });
    }
    return false;
  })

  //上传录音
  function uploadVoice(dom) {
    //调用微信的上传录音接口把本地录音先上传到微信的服务器
    if (dom == "1") {
      $('.lock .tips').text('按住按钮开始录音');
    } else {
      $('.nolock .tips').text('点击开始录音');
    }

    wx.uploadVoice({
      localId: voiceId, // 需要上传的音频的本地ID，由stopRecord接口获得
      isShowProgressTips: 1, // 默认为1，显示进度提示
      success: function (res) {
        //把录音在微信服务器上的id（res.serverId）发送到自己的服务器供下载。
        // alert(res.serverId);

        $.ajax({
          url: '/api/weixinAudioUpload.php',
          type: 'POST',
          data: { "service": "siteConfig", "action": "uploadWeixinAudio", "module": "tieba", "media_id": res.serverId },
          dataType: "json",
          success: function (data) {
            var audioWidth = (2.5 + (audioTime / 30)) + 'rem';
            var textIndent = (2.9 + (audioTime / 30)) + 'rem';
            if (data.info == '云端下载失败！') {
              alert('云端下载失败！');
            } else {
              if (dom == "1") {
                $('#content').append('<div class="audio-panel" data-id="' + voiceId + '" style="width: ' + audioWidth + '"><i class="audio_arrow"></i><div class="audio_item" style="text-indent:' + textIndent + '">' + audioTime + 's</div><span class="cancel"></span><audio controls="" src="' + data.info + '"></audio></div>');
                $('#content').append('<div contenteditable="true" class="inp-item placeholder"><font class="txt-gray">帖子内容</font></div>');
                hideAudioBox();
              } else {
                $('#content').append('<div class="audio-panel" data-id="' + voiceId + '" style="width: ' + audioWidth + '"><i class="audio_arrow"></i><div class="audio_item" style="text-indent:' + textIndent + '">' + audioTime + 's</div><span class="cancel"></span><audio controls="" src="' + data.info + '"></audio></div>');
                $('#content').append('<div contenteditable="true" class="inp-item placeholder"><font class="txt-gray">帖子内容</font></div>');
              }
            }
          },
          error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(XMLHttpRequest.status);
            alert(XMLHttpRequest.readyState);
            alert(textStatus);
          }
        });

      },
      fail: function (res) {
        alert(JSON.stringify(res));
      }
    });
  }

  // 录音完成
  $('.audiobox .finish').click(function () {
    var active = $('.swiper-slide-active'), btn = active.find('.audioBtn span');
    if (!btn.hasClass('pause')) {
      $('#audio .unlock_audio').show();
      hideAudioBox();
    }
  })

  // 隐藏录音弹出层
  function hideAudioBox() {
    var active = $('.swiper-slide-active'), noSwiper = active.find('.audioBtn span');
    if (active.hasClass('nolock') && noSwiper.hasClass('stop')) {
      uploadVoice();
    }
    $('.second').text('0');
    $('.audioBtn span').removeClass('pause');
    $('.audioBtn span').removeClass('stop');
    $('.second').removeClass('stop');
    $('.lock .tips').text('按住按钮开始录音');
    $('.unlock .tips').text('点击开始录音');
    $('.mask, .audiobox').hide();
    $('body').unbind('touchmove');
  }

  // 删除录音
  $('.content').delegate('.audio-panel .cancel', 'click', function () {
    var t = $(this), parent = t.closest('.audio-panel'), inpItem = parent.next('.inp-item');
    if (inpItem.html() == "") {
      inpItem.remove();
    }
    parent.remove();
    return false;
  })

  // 悬赏窗口
  var reward = $('#reward');
  $('.reward').click(function () {
    $('.rewardbox, .mask').show();
    reward.val('');
  })

  // 关闭悬赏窗口
  $('.rewardbox .reset').click(function () {
    $('.rewardbox, .mask').hide();
  })

  // 确定悬赏
  $('.confirm').click(function () {
    var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
    var re = new RegExp(regu), rewardVal = reward.val();
    if (rewardVal == "") {
      alert('请输入悬赏金额');
    } else if (!re.test(rewardVal)) {
      alert('悬赏金额格式错误');
    } else {
      $('.rewardbox, .mask').hide();
    }
  })

  // 添加视频地址
  $('.editor .alink').click(function () {
    $('.linkbox, .mask').show();
    $('#txtvideourl').val('');
    $('.mask').bind('touchmove', function (e) { e.preventDefault(); })
  })

  // 上传视频地址
  $('.link-upload').click(function () {
    var linkVal = encodeURIComponent($('#txtvideourl').val());
    console.log(linkVal);
    $.ajax({
      url: "/include/videoUrl.php?url=" + linkVal,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if (data && data.state == "success") {
          var c = data.url;
          $('#content').append('<div class="iframe"><div class="iframe_bg"></div><iframe src="' + c + '" frameborder="0" width="640" height="498" allowfullscreen id="link_"></iframe><div class="file-panel"><span class="cancel"></span></div></div>');
          $('#content').append('<div contenteditable="true" class="inp-item placeholder"><font class="txt-gray">帖子内容</font></div>');
          $('.linkbox, .mask').hide();
        } else {
          alert(data.info);
        }
      },
      error: function () {
        alert("网络错误，发表失败，请稍候重试！");
      }
    });
  })

  // 取消添加
  $('.linkbox .reset').click(function () {
    $('.linkbox, .mask').hide();
    $('.mask').unbind('touchmove');
  })

  // 删除视频
  $('#content').delegate('.iframe .file-panel', 'click', function () {
    var t = $(this), iframe = t.closest('.iframe'), inpItem = iframe.next('.inp-item');
    if (inpItem.html() == "") {
      inpItem.remove();
    }
    iframe.remove();
  })

  //错误提示
  var showErrTimer;
  function showErr(txt) {
    showErrTimer && clearTimeout(showErrTimer);
    $(".popErr").remove();
    $("body").append('<div class="popErr"><p>' + txt + '</p></div>');
    $(".popErr p").css({ "margin-left": -$(".popErr p").width() / 2, "left": "50%" });
    $(".popErr").css({ "visibility": "visible" });
    showErrTimer = setTimeout(function () {
      $(".popErr").fadeOut(300, function () {
        $(this).remove();
      });
    }, 1500);
  }

  $("#content").focus(function () {
    var t = $(this), con = t.html();
    if (con == "帖子内容") {
      t.removeClass("placeholder").html("");
    }
  });

  $("#content").blur(function () {
    var t = $(this), con = t.html();
    if (con == "") {
      t.addClass("placeholder").html("帖子内容");
    }
  });

  // 选择表情
  var memerySelection;
  $('.editor .emotion').click(function () {
    var t = $(this), box = $('.emotion-box'), editor = $('.editor').height(), emotionBox = $('.emotion-box').height(),
      windowHeight = $(window).height(), bodyHeight = $('body').height();
    memerySelection = window.getSelection();

    if (box.css('display') == 'none') {
      $('.emotion-box').show().siblings().hide();
      $('.content').css({ 'padding-bottom': '1.4rem' });
      t.addClass('on');
      $('.editor, .anotherbox').addClass('emotion');
      $(".editor .img").removeClass("on");

      if ((bodyHeight + emotionBox) > windowHeight) {
        $('.content').css({ 'bottom': '4rem', 'padding-bottom': '6rem' });
      }

      return false;
    } else {
      box.hide();
      $('.editor, .anotherbox').removeClass('emotion');
      t.removeClass('on');
    }
  })

  // 表情区域禁止滑动
  $('.emotion-box, .linkbox').bind('touchmove', function (e) {
    e.preventDefault();
  })

  var textarea = $('.textarea');
  $('.emotion-box li').click(function () {
    var t = $(this).find('img');
    $('.textarea').find('.txt-gray').remove();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      $('.textarea').append('<img src="' + t.attr("src") + '" class="emotion-img" />');
      return false;
    } else {
      pasteHtmlAtCaret('<img src="' + t.attr("src") + '" class="emotion-img" />');
    }
    document.activeElement.blur();
    return false;
  })

  //根据光标位置插入指定内容
  function pasteHtmlAtCaret(html) {
    var sel, range;

    if (window.getSelection) {
      sel = memerySelection;

      if (sel.anchorNode == null) { return; }

      if (sel.anchorNode.className != undefined && sel.anchorNode.className.indexOf('placeholder') > -1 || sel.anchorNode.parentNode.className != undefined && sel.anchorNode.parentNode.className.indexOf('placeholder') > -1) {

        if (sel.getRangeAt && sel.rangeCount) {
          range = sel.getRangeAt(0);
          range.deleteContents();
          var el = document.createElement("div");
          el.innerHTML = html;
          var frag = document.createDocumentFragment(), node, lastNode;
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);
          if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }
    } else if (document.selection && document.selection.type != "Control") {
      document.selection.createRange().pasteHTML(html);
    }
  }

  //光标定位到最后
  function set_focus(el) {
    el = el[0];
    el.focus();
    if ($.browser.msie) {
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
    } else {
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }



  // 上传设置
  function createUploader(id) {
    var extension = $('#filePicker' + id).attr('data-extensions'), title, mimeTypes = $('#filePicker' + id).attr('data-mimeTypes');
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
    } else {
      title = 'Video';
      serverUrl = 'type=thumb&filetype=video';
    }

    // 初始化Web Uploader
    uploader = WebUploader.create({
      auto: true,
      swf: staticPath + 'js/webuploader/Uploader.swf',
      server: '/include/upload.inc.php?mod=tieba&' + serverUrl,
      pick: {
        id: '#filePicker' + id,
        multiple: false
      },
      fileVal: 'Filedata',
      accept: {
        title: title,
        extensions: extension,
        mimeTypes: mimeTypes
      },
      compress: {
        // width: 750,
        // height: 750,
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
        compressSize: 1024 * 200
      }
      // fileNumLimit: atlasMax,
      // fileSingleSizeLimit: atlasSize
    });

    //删除已上传视频
    var delAtlasVideo = function (b) {
      var g = {
        mod: "tieba",
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
      var $li = $('#' + file.id);
      fileCount--;
      if (id == "1") {
        delAtlasPic($li.find("img").attr("data-val"));
      } else {
        delAtlasVideo($li.find("source").attr("data-val"));
      }
      $li.off().find('.file-panel').off().end().remove();
    }

    //从队列删除
    $list.delegate(".cancel", "click", function () {
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
        var $li = $('<div id="' + file.id + '" class="thumbnail"><img></div>'),
          $btns = $('<div class="file-panel"><span class="cancel"></span></div>').appendTo($li),
          $img = $li.find('img');
        $li.after('<div contenteditable="true" class="inp-item placeholder"><font class="txt-gray">帖子内容</font></div>');
        // 创建缩略图
        uploader.makeThumb(file, function (error, src) {
          if (error) {
            $img.replaceWith('<span class="thumb-error">不能预览</span>');
            return;
          }
          // $('#content .textarea').css('height','auto');
          $img.attr('src', src);
        }, thumbnailWidth, thumbnailHeight);
      } else {
        var $li = $('<div id="' + file.id + '" class="thumbnail"><video poster="" webkit-playsinline="true" preload="auto" playsinline x5-video-player-type="h5" x5-video-player-fullscreen="true" x5-video-ignore-metadata="true" controls><source src="" type="video/mp4"></video></div>'),
          $btns = $('<div class="file-panel"><span class="cancel"></span></div>').appendTo($li),
          $img = $li.find('video');
      }

      $btns.bind('click', '.cancel', function () {
        uploader.removeFile(file, true);
      });

      $list.append($li);
    }

    // 当有文件添加进来的时候
    uploader.on('fileQueued', function (file) {

      //先判断是否超出限制
      if (fileCount == atlasMax) {
        showErr('图片数量已达上限');
        return false;
      }

      fileCount++;
      addFile(file);
    });

    // 文件上传过程中创建进度条实时显示。
    uploader.on('uploadProgress', function (file, percentage) {
      var $li = $('#' + file.id),
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
    uploader.on('uploadSuccess', function (file, response) {
      var $li = $('#' + file.id);
      if (response.state == "SUCCESS") {
        var src = response.url.indexOf('http') > -1 ? response.url : "/include/attachment.php?f=" + response.url;
        $li.find("img").attr("data-val", response.url).attr("src", src);

        var video = [];
        if (id == "2") {
          var $li = $('#' + file.id);
          var src = response.url.indexOf('http') > -1 ? response.url : "/include/attachment.php?f=" + response.url;
          $li.html('<video class="video-js" data-setup="{}" controls src="' + src + '" data-val="' + response.url + '" webkit-playsinline="true" preload="auto" playsinline x5-video-player-type="h5" x5-video-player-fullscreen="true" x5-video-ignore-metadata="true" poster="' + response.poster + '"><source src="' + src + '"></source></video></div>');
          var $btns = $('<div class="file-panel"><span class="cancel"></span></div>').appendTo($li);
          $li.after('<div contenteditable="true" class="inp-item placeholder"><font class="txt-gray">帖子内容</font></div>');
          $btns.on('click', '.cancel', function () {
            uploader.removeFile(file, true);
          });
        }
      } else {
        removeFile(file);
        showErr(response.state);
      }
    });

    // 文件上传失败，显示上传出错。
    uploader.on('uploadError', function (file) {
      removeFile(file);
      showErr('上传失败2');
    });

    // 完成上传完了，成功或者失败，先删除进度条。
    uploader.on('uploadComplete', function (file) {
      $('#' + file.id).find('.progress').remove();
    });

    //上传失败
    uploader.on('error', function (code, file) {
      var txt = "请上传正确的文件格式";
      switch (code) {
        case "Q_EXCEED_NUM_LIMIT":
          txt = "图片数量已达上限";
          break;
        case "F_EXCEED_SIZE":
          txt = "大小超出限制，单张图片最大不得超过" + atlasSize / 1024 / 1024 + "MB";
          break;
        case "F_DUPLICATE":
          txt = "此图片已上传过";
          break;
      }
      showErr(txt + '-' + code);
    });

  }
  // 选择地址
  var areaLayer = $('.layer-area');
  $('.anotherbox .area').click(function () {
    areaLayer.css('left', '0');
    $('#inp_address').val('');
  })
  //自动获取附近地址
  var lng = '', lat = '';
  HN_Location.init(function (data) {
    if (data == undefined || data.address == "" || data.lat == "" || data.lng == "") {
      lng = lat = -1;
    } else {
      lng = data.lng;
      lat = data.lat;
    }
  })
  var address = $(".area-list").val();
  if (site_map == 'baidu') {
    var coords = $().coords();
    //搜索联想
    var autocomplete = new BMap.Autocomplete({
      input: "inp_address"
    });
    autocomplete.addEventListener("onconfirm", function (e) {
      var _value = e.item.value;
      myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
      $('#keywords').val(myValue);
      $('.anotherbox .area').text($('#inp_address').val());
      $('.area-list .active').removeClass('active');
      areaLayer.css('left', '200%');
      set_focus($('.placeholder:last'));
    });
    var s = function () {
      if (lng != '' && lat != '' && lng != -1 && lat != -1) {
        getlocalList()
      } else {
        setTimeout(s, 1000)
      }
    }
    // //定位当前附近位置
    HN_Location.init(function (data) {
      console.log(data)
      if (data == undefined || data.address == "" || data.lat == "" || data.lng == "") {
        lng = lat = -1;

      } else {
        lng = data.lng;
        lat = data.lat;
        //百度
        console.log(data)
      }
    });
    s();





    function getlocalList() {
      var myGeo = new BMap.Geocoder();
      myGeo.getLocation(new BMap.Point(lng, lat), function mCallback(rs) {
        var allPois = rs.surroundingPois;
        var rs = rs.addressComponents;
        if (allPois == null || allPois == "") {
          alert('定位失败');
          $(this).find("span").html("重新定位");
          return;
        } else {
          var areaArr = [];
          for (i = 0; i < allPois.length; ++i) {
            areaArr.push("<li>");
            areaArr.push("<p class='tit'>" + allPois[i].title + "</p>");
            areaArr.push("<p>" + allPois[i].address + "</p>");
            areaArr.push("</li>");
          }
          $('.area-list').html(areaArr.join(''));
        }
      }, {
        poiRadius: 1000,  //半径一公里
        numPois: 50
      });
    }

  } else if (site_map == 'amap') {

    var map = new AMap.Map('container', { resizeEnable: true })

    // 高德地图查询周边
    AMap.service(["AMap.PlaceSearch"], function () {
      var placeSearch = new AMap.PlaceSearch();

      var s = function () {
        if (lng != '' && lat != '') {
          placeSearch.searchNearBy("", [lng, lat], 500, function (status, result) {
            callback(result, status);
          });
        } else {
          setTimeout(s, 1000)
        }
      }

      AMap.event.addListener(map, "complete", function (status, result) {
        lnglat = map.getCenter();
        lng = lnglat['lng'];
        lat = lnglat['lat'];
        console.log(lnglat);
        s();
      });

      AMap.event.addListener(map, "dragend", function (status, result) {
        lnglat = map.getCenter();
        lng = lnglat['lng'];
        lat = lnglat['lat'];
        console.log(lnglat);
        s();
      });
    });

    function callback(results, status) {
      if (status === 'complete' && results.info === 'OK') {
        var list = [];
        var allPois = results.poiList.pois;
        console.log(results)
        for (var i = 0; i < allPois.length; i++) {
          list.push("<li>");
          list.push("<p class='tit'>" + allPois[i].name + "</p>");
          list.push("<p>" + allPois[i].address + "</p>");
          list.push("</li>");
        }
        if (list.length > 0) {
          $('.area-list').html(list.join(''));
        }
      } else {
        $(".area-list").html('');
      }
    }

    map.plugin('AMap.Autocomplete', function () {
      console.log('Autocomplete loading...')
      autocomplete = new AMap.Autocomplete({
        input: "inp_address"
      });
      // 选中地址
      AMap.event.addListener(autocomplete, 'select', function (result) {

        var r = result.poi.name ? result.poi.name : (result.poi.address ? result.poi.address : result.poi.district);

        $("#keywords").html(r);
        $('.anotherbox .area').text(r);
        $('.area-list .active').removeClass('active');
        $('.layer-area').css('left', '200%');
      });
    });

    //天地图
  } else if (site_map == 'tmap') {

    var map = new T.Map('container');
    map.centerAndZoom(new T.LngLat(116.40969, 39.89945), 16);

    var options = {
      pageCapacity: 10,
      onSearchComplete: function (result) {
        var list = [];
        if (result.getPois().length > 0) {
          for (var i = 0; i < result.getPois().length; i++) {
            list.push("<li>");
            list.push("<p class='tit'>" + result.getPois()[i].name + "</p>");
            list.push("<p>" + result.getPois()[i].address + "</p>");
            list.push("</li>");
          }
        }
        if (list.length > 0) {
          $('.area-list').html(list.join(''));
        } else {
          $(".area-list").html('');
        }
      }
    };
    var local = new T.LocalSearch(map, options);
    cityInfo = JSON.parse(cfg_cityInfo);

    $("#inp_address").bind('input', function () {
      local.search(cityInfo.name + $.trim($(this).val()), 1);
    })

  } else if (site_map == 'google') {
    var map, geocoder, marker;
    var s = function () {
      if (lng != '' && lat != '') {
        mapOptions = {
          zoom: 14,
          center: new google.maps.LatLng(lat, lng),
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
          }
        }
        map = new google.maps.Map(document.getElementById('container'), mapOptions);
        getLocation(mapOptions.center, map)
      } else {
        setTimeout(s, 1000)
      }
    }
    s();
    function getLocation(pos, map) {
      var service = new google.maps.places.PlacesService(map);
      service.nearbySearch({
        location: pos,
        radius: 500
      }, callback);

      var list = [];
      function callback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            list.push("<li>");
            list.push("<p class='tit'>" + results[i].name + "</p>");
            list.push("<p>" + results[i].vicinity + "</p>");
            list.push("</li>");
          }
          if (list.length > 0) {
            $('.area-list').html(list.join(''));
          }
        } else {
          $(".area-list").html('');
        }
      }
    }

    var input = document.getElementById('inp_address');
    var places = new google.maps.places.Autocomplete(input, { placeIdOnly: true });

    google.maps.event.addListener(places, 'place_changed', function () {
      var address = places.getPlace().name;
      $('#inp_address').val(address);

      geocoder = new google.maps.Geocoder();
      geocoder.geocode({ 'address': address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var locations = results[0].geometry.location;
          lng = locations.lng(), lat = locations.lat();
          if (lng && lat) {
            $("#keywords").html(results[0].formatted_address);
            $('.anotherbox .area').text(results[0].formatted_address);
            $('.area-list .active').removeClass('active');
            $('.layer-area').css('left', '200%');

          } else {
            alert(langData["waimai"][7][132]);   /* 您选择地址没有解析到结果! */
          }
        }
      });

    });
  }



  $('.area-list').delegate('li', 'click', function () {
    var t = $(this);
    t.addClass('active').siblings('li').removeClass('active');
    $('.anotherbox .area').text(t.find('.tit').text());
    areaLayer.css('left', '200%');
  })

  $('.layer-area .header-l').click(function () {
    areaLayer.css('left', '200%');
  })

  $('.tangram-suggestion-main').bind('touchmove', function (e) {
    e.preventDefault();
  })

  // 选择分类弹出层
  $('.anotherbox .typeBtn').click(function () {
    $('.type-layer').show();
  })

  // 关闭分类弹出层
  $('.type-header-l').click(function () {
    $('.type-layer').hide();
  })

  // 选择帖子分类
  $('#typeClass').delegate('dt','click',function () {
    var t = $(this), dl = t.closest('dl');
    if (dl.hasClass('active')) {
      dl.removeClass('active');
    } else {
      $('.type-item.active').removeClass('active');
      dl.addClass('active');
    }
  })

  $('#typeClass').delegate('dd a','click',function () {
    var t = $(this), id = t.attr('data-id'), txt = t.text();
    $('.type-item dd a').removeClass('curr');
    t.addClass('curr');
    $('#typeid').val(id);
    $('.typeBtn').text(txt);
    $('.type-layer').hide();
  })

  //发表帖子/评论
  $(".fabuBtn").click(function () {
    var userid = $.cookie(cookiePre + "login_user");
    if (userid == null || userid == "") {
      location.href = masterDomain + '/login.html';
      return false;
    }

    var t = $(this);
    if (t.hasClass("disabled")) return false;

    var cityid = $('#cityid').val();
    if (cityid == 0) {
      alert("请选择城市！");
      return false;
    }

    var typeid = $('#typeid').val();
    if (!typeid) {
      alert("请选择板块分类！");
      return false;
    }

    var title = $("#title").val();
    if (title == "") {
      alert("请填写标题！");
      return false;
    }

    $(".content").find('.placeholder').removeAttr('contenteditable');
    $(".content").find('.inp-item').removeAttr('contenteditable');
    var content = $("#content").html();

    if (content == "") {
      alert("请填写内容！");
      return false;
    }


    t.addClass("disabled");
    $.ajax({
      url: "/include/ajax.php?service=tieba&action=sendPublish",
      data: "typeid=" + typeid + "&title=" + encodeURIComponent(title) + "&content=" + encodeURIComponent(content) + "&cityid=" + cityid,
      type: "POST",
      dataType: "json",
      success: function (data) {
        if (data && data.state == 100) {

          fabuPay.check(data, channelDomain, t);

        } else {
          alert(data.info);
          t.removeClass("disabled");
        }
      },
      error: function () {
        alert("网络错误，发表失败，请稍候重试！");
        t.removeClass("disabled");
      }
    });


  });

  //删除已上传图片
  var delAtlasPic = function (b) {
    var g = {
      mod: "tieba",
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
  let data = {
    service: 'tieba',
    action: 'city'
  }
  //地址
  ajax(data).then(res => {
    if (res.state == 100) {
      let str = '<option selected="" value="0">请选择城市</option>';
      for (let i = 0; i < res.info.length; i++) {
        let item = res.info[i];
        str += `<option value="${item.id}">${item.name}</option>`;
      }
      $('#cityid').html(str);
    }
  });
  //分类
  typeClass();
  async function typeClass() {
    let data = {
      service: 'tieba',
      action: 'type'
    }
    let res = await ajax(data);
    if (res.state == 100) {
      let str = '';
      for (let i = 0; i < res.info.length; i++) {
        let item = res.info[i];
        if (item.redirect == '') {
          data = {
            service: 'tieba',
            action: 'type',
            type: item.id
          }
          let res2 = await ajax(data);
          let str2 = '';
          if (res2.state == 100) {
            for (let j = 0; j < res2.info.length; j++) {
              let citem = res2.info[j];
              if (citem.redirect == '') {
                str2 += `<a href="javascript:;" data-id="${citem.id}">${citem.typename}</a>`;
              }
            }
          }
          str += `<dl class="type-item">
                      <dt data-id="${item.id}">${item.typename}<span class="arrow"></span></dt>
                      <dd class="fn-clear">${str2}</dd>
                    </dl>`;
        }
      }
      $('#typeClass').html(str)
    }
  }
})
