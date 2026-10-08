$(function(){

  //APP端取消下拉刷新
  toggleDragRefresh('off');

    //上传单张图片
  function mysub(id){
    var t = $("#"+id), p = t.closest('.up_img'), img = t.parent().children(".img");

    p.addClass('has').find('.up_has').html('<div class="ing"></div>');

    var data = [];
    data['mod'] = 'house';
    data['filetype'] = 'image';
    data['type'] = 'altas';

    $.ajaxFileUpload({
      url: "/include/upload.inc.php",
      fileElementId: id,
      dataType: "json",
      data: data,
      success: function(m, l) {
        if (m.state == "SUCCESS") {
          if(img.length > 0){
            img.attr('src', m.turl);

            delAtlasPic(p.children("input").val());
          }else{
            p.find('.up_has').html('<img src="'+m.turl+'" alt="" class="img"><span class="del"><em></em><font>×</font></span>');
          }
          p.children("input").val(m.url);

        } else {
          uploadError(m.state, id, uploadHolder);
        }
      },
      error: function() {
        uploadError(langData['siteConfig'][6][203], id, uploadHolder);//网络错误，请重试！
        p.removeClass('has');
      }
    });

  }

  function uploadError(info, id, uploadHolder){
    alert(info);
    uploadHolder.removeClass('disabled');
  }

  //删除已上传图片
  var delAtlasPic = function(picpath){
    var g = {
      mod: "house",
      type: "delAltas",
      picpath: picpath,
      randoms: Math.random()
    };
    $.ajax({
      type: "POST",
      url: "/include/upload.inc.php",
      data: $.param(g)
    })
  };

  $(".Filedata").change(function(){
    if ($(this).val() == '') return;
    mysub($(this).attr("id"));
  })

  // 删除照片
  $('.up_img').delegate('.del', 'click', function(){
    var t = $(this), p = t.closest('.up_img');
    var inp = p.children('input'), img = inp.val();
    delAtlasPic(img);
    inp.val('');
    p.removeClass('has').find('.up_has').html('');
  })

  $('#storeSwitch').change(function(){
    var t = $(this), v = t.is(':checked');
    // if(v == false){
    //   $('.switch h4').html('<p>关闭后会员中心首页将同时隐藏模块内容<br>如果需要开启，请到管理中心开启模块</p>');
    // }else{
    //   $('.switch h4').html('');
    // }
  })

  $('.submit').click(function(){
    var t = $(this),
        title = $('#title').val(),
        address_ = $('#address_').text(),
        tel = $('#tel').val(),
        storeSwitch = $('#storeSwitch').is(":checked") ? 1 : 0;
    if(t.hasClass('disabled')) return;

    if(title == ''){
      alert(langData['siteConfig'][20][274]);//请填写公司名称
      return;
    }
    if(address_ == ''){
      alert(langData['siteConfig'][45][94]);//请选择公司地址
      return;
    }

    if(tel == ''){
      alert(langData['siteConfig'][45][95]);//请填写公司电话
      return;
    }

    var data = [];
    data.push('title='+title);
    data.push('tel='+tel);
    data.push('store_switch='+storeSwitch);

    t.addClass('disabled');
    $.ajax({
      url: masterDomain + '/include/ajax.php?service=house&action=storeConfigGroup',
      type: 'GET',
      data: data.join('&'),
      dataType: 'jsonp',
      success: function(data){
        if(data && data.state == 100){
          alert(data.info);
          if(device.indexOf('huoniao') > -1) {
            setupWebViewJavascriptBridge(function (bridge) {
              bridge.callHandler("goBack", {}, function (responseData) {
              });
            });
          }else{
            $('.goBack').click();
          }
        }else{
          alert(data.info);
          t.removeClass('disabled');
        }
      },
      error: function(){
        alert(langData['siteConfig'][6][203]);//网络错误，请重试！
        t.removeClass('disabled');
      }
    })
  })

})