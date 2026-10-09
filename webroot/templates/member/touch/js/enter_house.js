var atpage = 1, pageSize = 10, totalCount = 0, container = $("#list"), isload = false;
$(function(){

  //APP端取消下拉刷新
  toggleDragRefresh('off');

  var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
  if (ua.match(/MicroMessenger/i) == "micromessenger") {
    var atlasMax = 1;
    var modelType = 'house';

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

      $('.up dt').unbind().bind('click', function(){
        var dt = $(this), dd = dt.siblings('dd');

        var localIds = [];
        wx.chooseImage({
          count: atlasMax,
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
                        var img = dd.find('img');
                        if(img.length){
                          var old = img.attr('data-url');
                          delAtlas(old);
                        }
                        dd.children("input").val(fid)
                        var con = dd.children('.pic');
                        if(con.length == 0) dd.append('<div class="pic"></div>');
                        dd.children('.pic').show().html('<img src="'+turl+'" data-val="'+fid+'"><a href="javascript:;" class="remove"></a>').siblings('div').hide();

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

                  // fileCount++;
                  updateStatus();

                  syncUpload();
                },
              });
            }
          }
        }
      });


      $('.up').delegate('.remove', 'click', function(){
        var t = $(this), index = t.closest('.up').attr('data-index'), path = t.siblings('img').attr('data-val');
        showMsg(langData['siteConfig'][44][45], function(){//确定要删除这张图？
          delAtlasPic(path);
          t.parent().remove().siblings('div').show().siblings('input').val('');
        })
      })

      //删除已上传图片
      var delAtlasPic = function(b){
        var g = {
          mod: "house",
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
      var t = $(this), dt = t.children('dt'), dd = t.children('dd'), id = dt.attr('data-id'), type = t.data('type');
      if(id == undefined) id = 'up_' + i;
      dt.attr('id', id);
      t.attr('data-index', i);

      upObj[i] = new Upload({
        btn: '#'+id,
        bindBtn: '',
        title: 'Images',
        mod: 'house',
        params: 'type='+type,
        atlasMax: 1,
        deltype: 'del'+type,
        replace: true,
        fileQueued: function(file){
          
        },
        uploadSuccess: function(file, response){
          if(response.state == "SUCCESS"){
            var img = dd.find('img');
            if(img.length){
              var old = img.attr('data-url');
              upObj[i].del(old);
            }
            dd.children("input").val(response.url)
            var con = dd.children('.pic');
            if(con.length == 0) dd.append('<div class="pic"></div>');
            dd.children('.pic').show().html('<img src="'+response.turl+'" data-val="'+response.url+'"><a href="javascript:;" class="remove"></a>').siblings('div').hide();
          }
        },
        showErr: function(info){
          showErr(info);
        }
      });
    })
    $('.up').delegate('.remove', 'click', function(){
      var t = $(this), index = t.closest('.up').attr('data-index'), path = t.siblings('img').attr('data-val');
      showMsg(langData['siteConfig'][44][45], function(){//确定要删除这张图？
        upObj[index].del(path);
        t.parent().remove().siblings('div').show().siblings('input').val('');
      })
    })
  }

  var dopost = 'configZjUser';

  // 搜索
  $("#searchForm").submit(function(e){
    e.preventDefault();
    var t = $(".seabox .title"), title = $.trim(t.val());
    atpage = 1;
    dopost = 'configZjUser';
    $('#list').html('');
    getList();
  })

  // 选中公司 加入公司
  $("body").delegate("#list .join, .seabox li", "click", function(){

    if(enter_zjuser){
      showMsg(langData['siteConfig'][30][44], function(){//您已经入驻经纪人，查看资料？
        location.href = zjuser_url;
      })
      return;
    }

    var t = $(this), id = t.attr("data-id"), title = t.attr("data-title"), logo = t.attr("data-logo"), tel = t.attr("data-tel"), address = t.attr("data-address"), url = t.attr("data-comurl");

    // 选中公司信息
    $(".activeStore .logo").attr("href", url).html('<img src="'+logo+'" alt="">');
    $(".activeStore .name").attr("href", url).html(title);
    $(".activeStore .dd p").html(address);
    $(".activeStore .tel").attr('href', 'tel:'+tel).html('<i></i>'+tel);
    $('#alone').val(0);
    $('#zjcom').val(id);


    $('.dotype label:eq(0)').click(); //恢复为非独立经纪人
    $('.step2 .topOpera').hide();
    $('#companyInfo').hide();
    $('.activeStore, #zjuserInfo').show();


    $('.step1').hide();
    $('.step2').show();

    changeHead(langData['siteConfig'][30][48], function(){//申请加入
      $('.choseAgain').click();
    })

    dopost = 'configZjUser';

    $('body').removeClass().addClass(dopost);

  })

  // 重新选择公司
  $(".activeStore").delegate(".choseAgain", "click", function(){
    $('.step1').show();
    $('.step2').hide();
    $('body').removeClass();
    $('.header_temp').remove();
    $('.header').removeClass('fn-hide');
  })

  // 展开收起详细资料
  $(".toggleMore").click(function(){
    var t = $(this);
    if(t.hasClass('open')){
      $('.moreinfo').hide();
      t.removeClass('open');
    }else{
      t.addClass('open');
      $('.moreinfo').show();
    }
  })

  // 创建公司
  $(".creatStore").click(function(){
    if(enter_zjcom){
      showMsg(langData['siteConfig'][30][45], function(){//您已经入驻经纪公司，查看资料？
        location.href = zjcom_url;
      })
      return;
    }
    dopost = 'storeConfig';

    $('.dotype label:eq(0)').click(); //恢复为非独立经纪人
    $('.step2 .topOpera').show();
    $("#companyInfo").show();
    $(".activeStore, #zjuserInfo").hide();

    $('.step1').hide();
    $('.step2').show();


    $('body').removeClass().addClass(dopost);

    changeHead(langData['siteConfig'][30][5], function(){//创建公司
      $('.step1').show();
      $('.step2').hide();
    })
  })

  // 独立经纪人
  $('body').delegate('.dotype .disabled', 'click', function(){
    var t = $(this), index = t.index();
    if(index == 1){
      showMsg(langData['siteConfig'][30][45], function(){//您已经入驻经纪公司，查看资料？
        location.href = zjuser_url;
      })
      return;
    }
  })
  $('body').delegate('.dotype input', 'change', function(){
    var v = $('.dotype input:checked').val();
    // 切换为独立经纪人
    if(v == 1){
      $('#companyInfo').hide();
      $('#zjuserInfo').show();
      $('.step2').addClass('zjuser').removeClass('zjcom');

      var dotype_obj = $('.dotype').clone();
      $('.dotype').remove();
      $('.step2 .topOpera').hide();
      $('#zjuserInfo .base').before(dotype_obj);

      dopost = 'configZjUser';
      $('#alone').val(1);
      $('#zjcom').val(0);


    }else{
      $('#companyInfo').show();
      $('#zjuserInfo').hide();
      $('.step2').addClass('zjcom').removeClass('zjuser');

      var dotype_obj = $('.dotype').clone();
      $('.dotype').remove();
      $('.step2 .topOpera').prepend(dotype_obj).show();

      dopost = 'storeConfig';

    }
  })

  // 经纪人---------------------------

  function checkName(id){
    var t = $(id), val = $.trim(t.val());
    var writerRegex = '.{2,20}', writerErrTip = langData['siteConfig'][20][37];
    var exp = new RegExp("^" + writerRegex + "$", "img");
    if(!exp.test(val)){
      t.siblings('.tip-inline').addClass('error').removeClass('success').html('<s></s>');
      return false;
    }else{
      t.siblings('.tip-inline').addClass('success').removeClass('error').html('<s></s>');
      return true;
    }
  }
  function checkPhone(id){
    var t = $(id), val = $.trim(t.val()), old = t.data("val"), areaCode = $('#areaCode').val();
    var telErrTip = langData['siteConfig'][20][525];
    if(areaCode == '86'){
      var telRegex = '(13|14|15|17|18)[0-9]{9}';
    }else{
      var telRegex = '[0-9]{4,15}';
    }
    var exp = new RegExp("^" + telRegex + "$", "img");
    //if(!exp.test(val)){
      // if(id == "#phone"){
      //   $('.sendcode').addClass("disabled");
      // }
      // return false;
    //}else{
      if(id == "#phone"){
        if(old == '' || val != old || !userinfo.phoneCheck){
          $('.sendcode').removeClass("disabled").show();
          $('#vdimgckInfo').show();
        }else{
          $('.sendcode').addClass("disabled").hide();
          $('#vdimgckInfo').hide();
        }
      }
      return true;
    //}
  }
  // 姓名
  $("#nickname").bind("input, blur", function(){
    checkName("#nickname");
  })
  // 电话号码
  $("#phone").on("input propertychange, blur",function(){
    checkPhone("#phone");
  })

  var sendSmsData = [];

  if(geetest){
    //极验验证
    // var handlerPopupFpwd = function (captchaObjFpwd){
    //   captchaObjFpwd.onSuccess(function (){
    //     var validate = captchaObjFpwd.getValidate();
    //     sendSmsData.push('geetest_challenge='+validate.geetest_challenge);
    //     sendSmsData.push('geetest_validate='+validate.geetest_validate);
    //     sendSmsData.push('geetest_seccode='+validate.geetest_seccode);
    //     $("#vercode").focus();
    //     sendSmsFunc();
    //   });

    //   $('.sendcode').bind("click", function (){
    //     if($(this).hasClass('disabled')) return false;
    //     if($("#phone").val() == ''){
    //       $('.senderror').text(langData['siteConfig'][20][463]).show();//请输入手机号码
    //       $("#phone").focus();
    //       return false;
    //     }
    //     //弹出验证码
    //     captchaObjFpwd.verify();
    //   })
    // };
    captchaVerifyFun.initCaptcha('h5','#codeButton',sendSmsFunc)	
    $('.sendcode').bind("click", function (){
      if($(this).hasClass('disabled')) return false;
      if($("#phone").val() == ''){
        $('.senderror').text(langData['siteConfig'][20][463]).show();//请输入手机号码
        $("#phone").focus();
        return false;
      }
        //弹出验证码
				if (geetest == 1) {
					captchaVerifyFun.config.captchaObjReg.verify();
				} else {
					$('#codeButton').click()
				}
    })
  }else{
    $(".sendcode").bind("click", function (){
      if($(this).hasClass('disabled')) return false;
      if($("#phone").val() == ''){
        $('.senderror').text(langData['siteConfig'][20][463]).show();//请输入手机号码
        $("#phone").focus();
        return false;
      }
      $("#vercode").focus();
      sendSmsFunc();
    })
  }

  //发送验证码
  function sendSmsFunc(captchaVerifyParam,callback){
    var tel = $("#phone").val();
    var areaCode = $("#areaCode").val().replace('+', '');
    var sendSmsUrl = "/include/ajax.php?service=siteConfig&action=getPhoneVerify";

    sendSmsData = []
    sendSmsData.push('type=verify');
    sendSmsData.push('areaCode=' + areaCode);
    sendSmsData.push('phone=' + tel);
    let param = sendSmsData.join('&')
    if(captchaVerifyParam && geetest == 2){
      param = param + '&geetest_challenge=' + captchaVerifyParam
    }else if(geetest == 1 && captchaVerifyParam){
      param = param +  captchaVerifyParam
    }

    $('.senderror').text('');
    $.ajax({
      url: sendSmsUrl,
      data:param,
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        if(callback){
          callback(res)
        }
        if (res.state == 101) {
          $('.senderror').text(res.info);
        }else{
          countDown(60, $('.sendcode'));
        }
      }
    })
  }

  //倒计时
  function countDown(time, obj){
    obj.html(time+(langData['siteConfig'][44][1].replace('1',''))).addClass('disabled');//1秒后重发
    mtimer = setInterval(function(){
      obj.html((--time)+(langData['siteConfig'][44][1].replace('1',''))).addClass('disabled');//1秒后重发
      if(time <= 0) {
        clearInterval(mtimer);
        obj.html(langData['siteConfig'][6][55]).removeClass('disabled');//重新发送
      }
    }, 1000);
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
                        $('.f-g input#tel').css({'padding-left':'.22rem','width':'100%'});
                        $('.f-g input#phone').css({'padding-left':'.22rem'});
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
        $('.areacode_span').removeClass('checked')
        $('.layer_code').show();
        $('.mask-code').addClass('show');
        $(this).addClass('checked')
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        $(".areacode_span.checked em").text(txt);
        var parForm=$(".areacode_span.checked").closest('form');

        parForm.find("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

  // 公司-------------------
  // 公司名
  $("#title").bind("input, blur", function(){
    checkName("#title");
  })

  $('.submit').click(function(){
    if(dopost == 'configZjUser'){
      $('#fabuForm_zjuser').submit();
    }else{
      $('#fabuForm_zjcom').submit();
    }
  })

  // 提交表单
  // 经纪人
  $("#fabuForm_zjuser").submit(function(e){
    e.preventDefault();
    var t = $(this), btn = $('#submit'), url = t.attr('action'), gourl = '';

    t.find('.up').each(function(){
      var up = $(this), pic = up.find('.pic');
      var img = '';
      if(pic.length){
        img = pic.find('img').attr('data-val');
      }
      up.find('dd > input').val(img);
    })

    // 入驻经纪人
    gourl = zjuser_url;

    var nickname = $('#nickname').val(),
        phone = $('#phone').val(),
        phone_ = $('#phone').data("val"),
        vdimgck = $('#vdimgck').val(),
        zjcom = $('#zjcom').val(),
        alone = $('#alone').val();


    if(!checkName("#nickname")){
      $("#nickname").focus();
      return;
    }
    if(!checkPhone("#phone")){
      $("#phone").focus();
      return;
    }
    if((phone != phone_ || phone_ == "") && vdimgck == ""){
      $('#vdimgck').focus();
      return;
    }

    if(alone == "0" && zjcom == "0"){
      alert('操作错误！');
      return;
    }

    btn.prop('disabled', true);

    $.ajax({
      url: url,
      data: t.serialize(),
      type: 'post',
      dataType: 'json',
      success: function(data){
        if(data && data.state == 100){
          // showMsg(data.info, function(){
          //   location.href = gourl;
          // }, function(){
          //   location.href = gourl;
          // })
          $('.sub_res').show().children('p').html(data.info);
          setTimeout(function(){
            location.href = gourl;
          }, 2000)
        }else{
          showMsg(data.info, '', '', 'ok');
          btn.prop('disabled', false);
        }
      },
      error: function(){
        btn.prop('disabled', false);
        showMsg(langData['siteConfig'][44][23], '', '', 'ok')//网络错误，请重试
      }
    })

  })
  
  // 中介公司
  $("#fabuForm_zjcom").submit(function(e){
    e.preventDefault();
    var t = $(this), btn = $('#submit'), url = t.attr('action'), gourl = '';

    t.find('.up').each(function(){
      var up = $(this), pic = up.find('.pic');
      var img = '';
      if(pic.length){
        img = pic.find('img').attr('data-val');
      }
      up.find('dd > input').val(img);
    })

    gourl = zjcom_url;

    var title = $('#title').val(),
          logo = $('#logo').val(),
          addrid = 0,
          cityid = 0,
          address = $('#address').val(),
          tel = $('#tel').val(),
          r = true;

    if(!checkName("#title")){
      $('#title').focus();
      return;
      r = false;
    }

    var ids = $('.gz-addr-seladdr').attr("data-ids");
    if(ids != undefined && ids != ''){
      addrid = $('.gz-addr-seladdr').attr("data-id");
      ids = ids.split(' ');
      cityid = ids[0];
    }else{
      alert(langData['siteConfig'][28][63]);//请选择所在地
      return;
      r = false;
    }
    $('#addr').val(addrid);
    $('#cityid').val(cityid);

    if(address == ''){
      $('#address').focus();
      return;
      r = false;
    }

    if(!checkPhone("#tel")){
      $('#tel').focus();
      return;
      r = false;
    }


    if(logo == ''){
      alert('请上传公司logo');
      return;
      r = false;
    }
    if(!r){
      return;
    }

    btn.prop('disabled', true);

    $.ajax({
      url: url,
      data: t.serialize(),
      type: 'post',
      dataType: 'json',
      success: function(data){
        if(data && data.state == 100){
          // showMsg(data.info, function(){
          //   location.href = gourl;
          // }, function(){
          //   location.href = gourl;
          // })
          $('.sub_res').show().children('p').html(data.info);
          setTimeout(function(){
            location.href = gourl;
          }, 2000)
        }else{
          showMsg(data.info, '', '', 'ok');
          btn.prop('disabled', false);
        }
      },
      error: function(){
        btn.prop('disabled', false);
        showMsg(langData['siteConfig'][44][23], '', '', 'ok')//网络错误，请重试
      }
    })

  })
  
  
  // 修改头部
  function changeHead(title, callback){
    $('.header_temp').remove();
    var clone = $('.header').clone();
    clone.addClass('header_temp').removeClass('fn-hide').find('a').removeClass().attr('onclick', null);
    clone.find('.header-c').html(title);
    $('.header').addClass('fn-hide').after(clone);
    $(window).scrollTop(0);

    clone.find('a').click(function(){
      $('.header_temp').remove();
      $('.header').removeClass('fn-hide');
      $('body').removeClass();
      callback && callback();
    })
  }

  function showMsg(title, ok, cancel, type){
    $('.model_title').html(title);
    if(type == 'ok'){
      $('.model_btns').html('<a href="javascript:;" class="ok">'+langData['siteConfig'][6][1]+'</a>');//确定
    }else{
      $('.model_btns').html('<a href="javascript:;" class="cancel">'+langData['siteConfig'][6][12]+'</a><a href="javascript:;" class="ok">'+langData['siteConfig'][6][1]+'</a>');//取消 -- 确定
    }
    $('.model_del, .desk').show();
    $('.model_del .ok').click(function(){
      $('.model_del, .desk').hide();
      ok && ok();
    })
    $('.model_del .cancel').click(function(){
      $('.model_del, .desk').hide();
      cancel && cancel();
    })
    $('.desk, .model_del .close').click(function(){
      $('.model_del, .desk').hide();
    })
  }

  $(window).scroll(function(){
    if(!isload && !$('body').hasClass('storeConfig') && !$('body').hasClass('configZjUser')){
      var sct = $(window).scrollTop();
      var last = $('#list li:last-child');
      if(last.length){
        var top = last.offset().top;
        var winh = $(window).height();
        if(sct + winh >= top){
          atpage++;
          getList();
        }
      }
    }
  })

  getList();

})

function getList(){
  var keywords = $.trim($(".seabox .title").val());
  var data = [];
  data.push('keywords='+keywords);
  data.push('page='+atpage);
  data.push('pageSize='+pageSize);

  $('.loading').html(langData['siteConfig'][44][65]).show();//正在加载，请稍后

  isload = true;

  $.ajax({
    url: '/include/ajax.php?service=house&action=zjComList',
    type: 'get',
    data: data.join("&"),
    dataType: 'jsonp',
    success: function(data){
      if(data.state == 100){
        var html = [];
        totalCount = data.info.pageInfo.totalCount;

        for(var i = 0; i < data.info.list.length; i++){
          var d = data.info.list[i];
          html.push('<li class="fn-clear" data-id="'+d.id+'">');
          html.push(' <a href="'+d.url+'" class="logo"><img src="'+d.litpic+'" alt="'+d.id+'"></a>');
          html.push(' <div class="txt">');
          html.push('   <a href="'+d.url+'" class="name">'+d.title+'</a>');
          html.push('   <p>'+d.city+'<span>'+d.address+'</span></p>');
          html.push(' </div>');
          html.push(' <a href="javascript:;" class="join" data-id="'+d.id+'" data-title="'+d.title+'" data-logo="'+d.litpic+'" data-tel="'+d.tel+'" data-address="'+d.address+'" data-comurl="'+d.url+'">'+langData['siteConfig'][30][48]+'</a>');//申请加入
          html.push('</li>');
        }
        $('#list').append(html.join(""));

        if(atpage == data.info.pageInfo.totalPage){
          $('.loading').text(langData['siteConfig'][20][429]).show();//已加载全部数据
        }else{
          isload = false;
        }

      }else{
        $('#list').html('');

        $('.loading').html(atpage == 1 ? langData['siteConfig'][30][49] : langData['siteConfig'][20][429]).show();//暂无相关中介公司--已加载全部数据
      }
    },
    error: function(){
      $('.loading').text(langData['siteConfig'][6][203]);//网络错误，请刷新重试！
    }
  })

}