$(function(){

	// 判断浏览器是否是ie8
  if($.browser.msie && parseInt($.browser.version) >= 8){
    $('.app-con .down .con-box:last-child').css('margin-right','0');
    $('.wx-con .c-box:last-child').css('margin-right','0');
    $('.door-maker .member-list:nth-child(5n)').css('margin-right','0');
      
  }

  //添加标签
  var store_tags = $('#tags_res').val();
  if(store_tags){
    var store_tagsArr = store_tags.split(',');
    var html = '';
    for(var i = 0; i < store_tagsArr.length; i++){
      html += '<span class="tag" data-title="'+ store_tagsArr[i] +'">' + store_tagsArr[i] + '<button class="close" type="button">×</button></span>';
    }
    $("#form-field-tags").before(html);
  }
  $(".tags_enter").blur(function() { //焦点失去触发 
    var txtvalue=$(this).val().trim();
    if(txtvalue!=''){
      addTag($(this));
      $(this).parents(".tags").css({"border-color": "#d5d5d5"})
    }
  }).keydown(function(event) {
    var key_code = event.keyCode;
    var txtvalue=$(this).val().trim(); 
    if (key_code == 13&& txtvalue != '') { //enter
      addTag($(this));
    }
    if (key_code == 32 && txtvalue!='') { //space
      addTag($(this));
    }
  });
  $(".close").live("click", function() {
    $(this).parent(".tag").remove();
  });
  $(".tags").click(function() {
    $(this).css({"border-color": "#f59942"});
    $('.tags_enter').focus();
  }).blur(function() {
    $(this).css({"border-color": "#d5d5d5"})
  })
  checkInfo = function(event,self){
    if (event.keyCode == 13) {
      event.cancleBubble = true;
      event.returnValue = false;
      return false;
    }
  }
  function removeWarning() {
    $(".tag-warning").removeClass("tag-warning");
  }
  function addTag(obj) {
  var tag = obj.val();
    if (tag != '') {
      var i = 0;
      $(".tag").each(function() {
        if ($(this).text() == tag + "×") {
          $(this).addClass("tag-warning");
          setTimeout(removeWarning, 400);
          i++;
        }
      })
      obj.val('');
      if (i > 0) { //说明有重复
        return false;
      }
      $("#form-field-tags").before("<span class='tag' data-title='"+tag+"'>" + tag + "<button class='close' type='button'>×</button></span>"); //添加标签
    }
  }
  


  // 门店红娘sss
  // $('.door-maker .member-list .delete-img').click(function(){
  //   $(this).parents().closest('.member-list').remove();
  // })
  $('.door-maker .member-list .delete-img').click(function(){
    var t = $(this);
    $('.desk').show();
    $('.hello-popup').show();
      $('.hello-btn .sure').click(function(){
          t.closest('.member-list').remove();
          $('.desk').hide();
          $('.hello-popup').hide();
      })
      $('.hello-btn .cancel').click(function(){
          $('.desk').hide();
          $('.hello-popup').hide();
      })
  })
  $('.hello-popup-delete').click(function(){
    $('.desk').hide();
    $('.hello-popup').hide();
  })
  // 门店红娘eee

  // 会员申请sss
  $('.member-list .mem-state .sign').click(function(){
    $(this).hide();
    $(this).next('a').show();
  })

  $('#selectTypeMenu').hover(function(){
    $(this).show();
    $(this).closest('selectType').addClass('hover');
  }, function(){
    $(this).hide();
    $(this).closest('selectType').removeClass('hover');
  });

  $("#selectTypeText").hover(function () {
    $(this).next("span").slideDown(200);
    $(this).closest('selectType').addClass('hover');
  },function(){
    $(this).next("span").hide();
    $(this).closest('selectType').removeClass('hover');
  });
  
  $("#selectTypeMenu>a").click(function () {
    $("#selectTypeText").text($(this).text());
    $("#selectTypeText").attr("value", $(this).attr("rel"));
    $(this).parent().hide();
    $('selectType').removeClass('hover');
  });
  // 会员申请eee

  //标注地图
  $("#mark").bind("click", function(){
    $.dialog({
      id: "markDitu",
      title: langData['siteConfig'][6][92]+"<small>（"+langData['siteConfig'][23][102]+"）</small>",   //标注地图位置--请点击/拖动图标到正确的位置，再点击底部确定按钮。
      content: 'url:'+masterDomain + '/api/map/mark.php?mod='+modelType+'&lnglat='+$("#lnglat").val()+"&city="+map_city+"&addr="+$("#address").val(),
      width: 800,
      height: 500,
      max: true,
      ok: function(){
        var doc = $(window.parent.frames["markDitu"].document),
          lng = doc.find("#lng").val(),
          lat = doc.find("#lat").val(),
          addr = doc.find("#addr").val();
        $("#lnglat").val(lng+","+lat);
        if($("#addr").val() == ""){
          $("#addr").val(addr);
        }
      },
      cancel: true
    });
  });

  // 提交门店信息
  $('#storeForm').submit(function(e){
    e.preventDefault();
    var form = $(this),
        nickname = $('#nickname'),
        profile = $('#profile'),
        address = $('#address'),
        lnglat = $('#lnglat'),
        tel = $('#tel'),
        photo = $('#photo'),
        t = $('.door-submit');

    if(nickname.val() == ''){
      $.dialog.alert(langData['siteConfig'][29][145]);    //请填写门店名称
      return;
    }
    if(profile.val() == ''){
      $.dialog.alert(langData['siteConfig'][29][146]);    //请填写门店简介
      return;
    }
    if(address.val() == ''){
      $.dialog.alert(langData['siteConfig'][29][147]);    //请填写门店地址
      return;
    }
    if(lnglat.val() == '' || lnglat.val() == ','){
      $.dialog.alert(langData['siteConfig'][29][148]);    //请选择门店坐标
      return;
    }
    if(tel.val() == ''){
      $.dialog.alert(langData['siteConfig'][29][149]);    //请填写门店电话
      return;
    }
    if(photo.val() == ''){
      $.dialog.alert(langData['siteConfig'][29][129]);   //请上传门店代表图
      return;
    }

    var tags = [];
    $('#tags .tag').each(function(){
      var t = $(this).attr('data-title');
      tags.push(t);
    })
    $('#tags_res').val(tags.join(','));

    t.attr('disabled', true);
    $.ajax({
      url: '/include/ajax.php?service=dating&action=updateProfile_store',
      type: 'post',
      data: form.serialize(),
      dataType: 'json',
      success: function(data){
        t.attr('disabled', false);
        if(data && data.state == 100){
          $.dialog({
            title: langData['siteConfig'][22][72],      //提示信息
            icon: 'success.png',
            content: langData['siteConfig'][22][312],    //提交成功
            ok: function(){
              location.reload();
            }
          });
        }else{
          $.dialog.alert(data.info);
        }
      },
      error: function(){
        t.attr('disabled', false).val(langData['siteConfig'][6][151]);   //提交
        $.dialog.alert(langData['siteConfig'][6][203]);   //网络错误，请重试
      }
    })

  })

})
