$(function(){
  //APP端取消下拉刷新
  toggleDragRefresh('off');

  // 已入住
  if(detail.id){
    $('.variable').not('.variable-'+detail.type).remove();
    $('#group-op-title em').text(detail.type == 1 ? langData['siteConfig'][28][37] : langData['siteConfig'][28][61]);//运营者联系信息 --授权运营者联系信息
  }

  //下拉菜单 选择领域
  $('.demo-test-select').scroller(
    $.extend({preset: 'select'})
  );

  $('.f-g select').change(function(){
    var t = $(this), val = t.val();
    if(val != 0 && val != ''){
      t.prev('input').addClass('has');
    }else{
      t.prev('input').removeClass('has');
    }
  }).each(function(){
    $(this).val() && $(this).val() != 0 && $(this).prev().addClass('has');
  });

  // 切换类型
  $('.moldbox li').click(function(){
    var t = $(this), index = t.index(), id = t.data('id');
    t.addClass('active').siblings().removeClass('active');
    $('.molddes p').eq(index).show().siblings().hide();

    $('#type').val(id);
    $('.variable').hide().find('input, textarea, select').prop('disabled', true);
    $('.variable-'+id).each(function(){
      var o = b = $(this);
      if(b.find('.variable-'+id).length){
        o = b.find('.variable-'+id);
      }
      b.show();
      o.find('input, textarea, select').prop('disabled', false);
    })

    $('#group-op-title em').text(id == 1 ? langData['siteConfig'][28][37] : langData['siteConfig'][28][61]);//运营者联系信息 --授权运营者联系信息
    $('#mb_type_2 li:eq(0)').find('input').prop('checked', true);
  }).eq(0).click();

  // 进入下一步
  $('.next').click(function(){
    $('.step1').hide().siblings().show();
    $('.next').hide();
  })

  // 机构授权书扫描件 示例、模板
  $('.exp a').click(function(){
    var t = $(this);
    if(t.hasClass('img')){
      $('.expmodel .img').removeClass('fn-hide').siblings().addClass('fn-hide');
      $('.expmodel, .desk').addClass('show');
      var top = $('.expmodel img').offset().top - $(window).scrollTop();
      var close = $('.expmodel .img .close');
      close.css({'top': (top-close.width()*1.5)+'px'});
    }else{
      $('.expmodel .tpl').removeClass('fn-hide').siblings().addClass('fn-hide');
      $('.expmodel, .desk').addClass('show');
    }
  })
  $('.expmodel .close').click(function(){
    $('.expmodel, .desk').removeClass('show');
  })
  // 保存链接
  $('.expmodel .tpl .btn').click(function(){
    document.getElementById('tplurl').select();
    document.execCommand("Copy");
    var t = $(this);
    t.text(langData['siteConfig'][44][43]);//已复制到剪切板
    setTimeout(function(){
      t.text(langData['siteConfig'][44][44]);//复制下载链接
      $('.expmodel .close').click();
    }, 1000)
  })

  var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
  if (ua.match(/MicroMessenger/i) == "micromessenger") {
    var atlasMax = 1;
    var modelType = 'article';

    // var fileCount = 0;

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
        var btnwrap = dt.children('.btnwrap');
        var id = 'up_' + i;
        if(!btnwrap.length){
          dt.append('<div class="btnwrap" style="width:'+dt.css('width')+';height:'+dt.css('height')+'" id="'+id+'"></div>');
        }
      })
      $('.up .btnwrap, .up .bindbtn').unbind().bind('click', function(){
        var o = $(this), t = o.closest('.up');
        
        var dt = t.children('dt'), dd = dt.siblings('dd'), type = t.data('type'), count = t.data('count') ? t.data('count') : 1;
        var thiscount = count - t.siblings('.pic').length;
        var localIds = [];
        wx.chooseImage({
          count: thiscount,
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
          } else {
            for(var i = 0; i < localIds.length; i++){
              var localId = localIds[i];
              wx.uploadImage({
                localId: localId,
                success: function(res) {
                  var serverId = res.serverId;

                  $.ajax({
                    url: '/api/weixinImageUpload.php',
                    type: 'POST',
                    data: {"service": "siteConfig", "action": "uploadWeixinImage", "module": modelType, "media_id": serverId},
                    dataType: "json",
                    async: false,
                    success: function (data) {
                      if (data.state == 100) {
                        var fid = data.fid, url = data.url, turl = data.turl, time = new Date().getTime(), id = "wx_upload" + time;

                        if(count == 1){
                          dt.find('.remove').addClass('force').click();
                          dd.children("input").val(fid)
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

                      }else {
                        showErr(data.info);
                      }
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                      showErr(XMLHttpRequest.status);
                      showErr(XMLHttpRequest.readyState);
                      showErr(textStatus);
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


      $('#submitForm').delegate('.remove', 'click', function(e){
        e.stopPropagation();
        var t = $(this);
        if(t.hasClass('force')){
          delFile(t);
        }else{
          showMsg(langData['siteConfig'][44][45], function(){//确定要删除这张图？
            delFile(t);
          })
        }
      })

      function delFile(t){
        var type = 0;
        var par = t.parent().parent();
        if(par.hasClass('up-group')){
          type = 1;
          var p = par.find('.up');
        }else{
          var p = t.closest('.up'), bindbtn = p.find('.bindbtn');
        }
        var path = t.siblings('img').attr('data-val')
        var index = p.attr('data-index');
        var count = p.data('count') ? p.data('count') : 1;
        var bindbtn = p.find('.bindbtn');
        delAtlasPic(path);
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
            var tit = p.find('.tit'), s = tit.data('title') ? tit.data('title') : '上传照片';
            tit.text(len == 0 ? s : len+'/'+count);
          }
        }
        bindbtn.length && bindbtn.removeClass('edit').html('<span></span>'+bindbtn.data('up-title'));
      }

      //删除已上传图片
      var delAtlasPic = function(b){
        var g = {
          mod: "article",
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

    });
  }else{

    var upObj = [];
    $('.up').each(function(i){
      var t = $(this), dt = t.find('dt'), dd = t.children('dd'), type = t.data('type'), bindbtn = t.find('.bindbtn'), bindcss = '', count = t.data('count') ? t.data('count') : 1;
      var btnwrap = dt.children('.btnwrap');
      var id = 'up_' + i;
      if(!btnwrap.length){
        dt.append('<div class="btnwrap" style="width:'+dt.css('width')+';height:'+dt.css('height')+'" id="'+id+'"></div>');
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
        title: 'Images',
        mod: 'article',
        params: 'type='+type,
        atlasMax: count,
        deltype: 'del'+type,
        replace: replace,
        fileQueued: function(file){
          
        },
        uploadSuccess: function(file, response){
          if(response.state == "SUCCESS"){
            
            
            // var con = dd.children('.pic');
            // if(con.length == 0) dd.append('<div class="pic"></div>');
            // dd.children('.pic').show().html('<img src="'+response.turl+'" data-val="'+response.url+'"><a href="javascript:;" class="remove"></a>').siblings('div').hide();
            if(count == 1){
              dt.find('.remove').addClass('force').click();
              dd.children("input").val(response.url)
              dt.append('<div class="pic" style="width:'+dt.css('width')+';height:'+dt.css('height')+'"><img src="'+response.turl+'" data-val="'+response.url+'"><a href="javascript:;" class="remove"></a></div>')
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
    })
    function delFile(t){
      var type = 0;
      var par = t.parent().parent();
      if(par.hasClass('up-group')){
        type = 1;
        var p = par.find('.up');
      }else{
        var p = t.closest('.up'), bindbtn = p.find('.bindbtn');
      }
      var path = t.siblings('img').attr('data-val')
      var index = p.attr('data-index');
      var count = p.data('count') ? p.data('count') : 1;
      var bindbtn = p.find('.bindbtn');
      upObj[index].del(path);
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
          var tit = p.find('.tit'), s = tit.data('title') ? tit.data('title') : '上传照片';
          tit.text(len == 0 ? s : len+'/'+count);
        }
      }
      bindbtn.length && bindbtn.removeClass('edit').html('<span></span>'+bindbtn.data('up-title'));
    }
    $('.step2').delegate('.remove', 'click', function(e){
      e.stopPropagation();
      var t = $(this);
      if(t.hasClass('force')){
        delFile(t);
      }else{
        showMsg(langData['siteConfig'][44][45], function(){//确定要删除这张图？
          delFile(t);
        })
      }
    })
  }

  function showMsg(title, ok, cancel, type){
    $('.model_title').html(title);
    if(type == null){
      $('.model_btns').html('');
    }if(type == 'ok'){
      $('.model_btns').html('<a href="javascript:;" class="ok">'+langData['siteConfig'][6][1]+'</a>');//确定
    }else{
      $('.model_btns').html('<a href="javascript:;" class="cancel">'+langData['siteConfig'][6][12]+'</a><a href="javascript:;" class="ok">'+langData['siteConfig'][6][1]+'</a>');//取消--确定
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
  var timer = null;
  function showErr(title, obj){
    timer && clearTimeout(timer);
    $('.msgmodel').remove();
    $('body').append('<div class="msgmodel" style="position:fixed;top:30%;left:50%;margin-left:-2.2rem;width:3.6rem;padding:.8rem .4rem;background:rgba(0,0,0,.56);color:#fff;text-align:center;font-size:.28rem;border-radius:10px;z-index:100;">'+title+'</div>');
    timer = setTimeout(function(){
      $('.msgmodel').remove();
    }, 1000)
    if(obj && obj.is("input") && obj.attr('type') == 'text'){
      obj.focus();
      return;
    } 
    obj && $(window).scrollTop((function(){
      var p = obj.closest('.f-g');
      if(!p.length) p = obj.closest('dl');
      $(window).scrollTop(p.offset().top);
    })());
  }
  //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').hide();
                        $('.f-g input#op_phone').css({'padding-left':'.22rem'});
                        return false;
                   }
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })
    

  $('.submit').click(function(){
    $('#submitForm').submit();  
  })
  $('#submitForm').submit(function(e){
    e.preventDefault();

    var t            = $(this),
        id           = $("#id").val(),
        typeid       = $("#type").val(),
        ac_name      = $("#ac_name"),
        ac_profile   = $("#ac_profile"),
        ac_field     = $("#ac_field"),
        ac_photo     = $("#ac_photo"),
        op_name      = $("#op_name").val(),
        op_phone     = $("#op_phone").val(),
        op_email     = $("#op_email").val(),
        offsetTop    = 0,
        btn          = $('.submit'),
        // agree        = $('.agreement i').hasClass('active'),
        tj           = true;

    if(btn.hasClass('disabled')) return;

    // 前台只验证账号信息
    //标题
    if(ac_name.val() == ''){
      showErr(langData['siteConfig'][44][46]);//请填写自媒体名称
      ac_name.focus();
      return;
    };

    //介绍
    if(ac_profile.val() == ''){
      showErr(langData['siteConfig'][44][47]);//请填写自媒体介绍
      ac_profile.focus();
      return;
    };

    // 领域
    if(ac_field.val() == "" || ac_field.val() == 0){
      showErr(langData['siteConfig'][28][22], ac_field);//请选择自媒体领域
      return;
    }

    var ac_addrid = $('.gz-addr-seladdr').attr('data-id'), ids = $('.gz-addr-seladdr').attr('data-ids');
    var cityid = 0;
    if(ac_addrid){
      cityid = ids.split(' ')[0];
      $('#ac_addrid').val(ac_addrid);
      $('#cityid').val(cityid);
    }
    //区域
    if((ac_addrid == '' || ac_addrid == 0) ){
        showErr(langData['siteConfig'][28][63], $('#ac_addrid'));//请选择所在地
        return;
    };

    // 头像
    if(ac_photo.val() == ''){
      showErr(langData['siteConfig'][28][62], ac_photo);//请上传自媒体头像
      return;
    }

    if(typeid != 1 && typeid != 5){
        var mb_name = $('#mb_name_'+typeid);
        if(mb_name.val() == ''){
          showErr((function(){
            return typeid == 2 ? langData['siteConfig'][44][50] : (typeid == 3 ? langData['siteConfig'][44][49] : langData['siteConfig'][44][48]);
          })(), mb_name)//请填写媒体名称----请填写企业名称 ---请填写机构名称
          return;
        }
        // 政府机构
        if(typeid == 4){
            var mb_level = $('#mb_level');
            if(mb_level.val() == '' || mb_level.val() == 0){
              showErr(langData['siteConfig'][28][29], mb_level);//请选择机构级别
              return;
            }
            var mb_type = $('#mb_type_4');
            if(mb_type.val() == '' || mb_type.val() == 0){
              showErr(langData['siteConfig'][28][31], mb_type);//请选择机构类型
              return;
            }
        }
        var mb_code = $('#mb_code');
        if(mb_code.val() == ''){
          showErr(langData['siteConfig'][44][51], mb_code);//请填写统一社会信用代码
          return;
        }
        var mb_license = $('#mb_license');
        if(mb_license.val() == ''){
          showErr((function(){
            return typeid == 4 ? langData['siteConfig'][44][52] : langData['siteConfig'][44][53];//请上传统一社会信用代码证书或事业单位法人证书扫描件 -- 请上传营业执照或事业单位法人证书副本扫描件
          })(), mb_license)
          return;
        }

    }
    if(typeid != 1){
        var op_name = $('#op_name');
        if(op_name.val() == ''){
          showErr(langData['siteConfig'][44][54], op_name);//请填写运营者姓名
          return;
        }
        var op_idcard = $('#op_idcard');
        if(op_idcard.val() == ''){
          showErr(langData['siteConfig'][44][55], op_idcard);//
          return;
        }
        var op_idcardfront = $('#op_idcardfront');
        if(op_idcardfront.val() == ''){
          showErr(langData['siteConfig'][44][56], op_idcardfront);//请上传运营者手持身份证照片
          return;
        }
    }

    var op_phone = $('#op_phone');
    if(op_phone.val() == ''){
      showErr(langData['siteConfig'][44][57], op_phone);//请填写运营者联系手机
      return;
    }

    var op_email = $('#op_email');
    if(op_email.val() == ''){
      showErr(langData['siteConfig'][44][58], op_email);//请填写运营者联系邮箱
      return;
    }

    if(!/^[a-z0-9]+([\+_\-\.]?[a-z0-9]+)*@([a-z0-9]+\.)+[a-z]{2,6}$/i.test(op_email.val())){
      showErr(langData['siteConfig'][44][59], op_email);//请填写正确的邮箱
      return;
    }


    if(typeid != 1){
      var op_authorize = $('#op_authorize');
      if(op_authorize.val() == ''){
        showErr(langData['siteConfig'][44][60], op_authorize);//请上传机构授权书扫描件
        return;
      }
    }

    // 媒体
    if(typeid == 2){
      var org_major_license_type = $('#org_major_license_type');
      if(org_major_license_type.val() == '' || org_major_license_type.val() == 0){
        showErr(langData['siteConfig'][44][61], org_major_license_type);//请选择资质类型
        return;
      }
      var org_major_license = $('#org_major_license');
      if(org_major_license.val() == ''){
        showErr(langData['siteConfig'][44][62], org_major_license);//请上传资质类型证明
        return;
      }
    }

    btn.addClass("disabled");
    var data = t.serialize(); 
    if(tj){
      $.ajax({
        url: '/include/ajax.php?service=article&action=selfmediaConfig',
        type: 'post',
        data: data,
        dataType: 'json',
        success: function(data){
          if(data && data.state == 100){
            $(window).scrollTop(0);
            $('.step2 .progress li').addClass('active');
            $('.step2 .res').remove();
            $('#submitForm').hide().next().show();
          }else{
            btn.removeClass('disabled');
            showErr(data.info, data.name);
          }
        },
        error: function(){
          btn.removeClass('disabled');
          showErr(langData['siteConfig'][44][23]);//网络错误，请重试
        }
      })
    }
  })

})