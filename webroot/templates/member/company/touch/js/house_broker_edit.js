/**
 * 会员中心——新增、修改经纪人
 * by guozi at: 20150627
 */

$(function(){
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
                        $('.areacode_span').closest('li').hide();
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
  var detail = {};
  if(id != 0){
    getDetail();
  }
  function getDetail(){
    $.ajax({
      url: masterDomain+'/include/ajax.php?service=house&action=zjUserList&userid='+id,
      type: 'get',
      dataType: 'jsonp',
      success: function(data){
        if(data && data.state == 100 && data.info.list.length){
          detail = data.info.list[0];
          if(detail.photoSource != ''){
            var up_img = $('.up_img');
            up_img.addClass('has')
                        .children('input').val(detail.photoSource)
            up_img.find('.up_has').html('<img src="'+detail.photo+'" class="img" /><span class="del"><em></em><font>×</font></span>');
          }
          $('#nickname').val(detail.nickname);
          $('#phone').val(detail.phone);
          
        }
      },
      error: function(){

      }
    })
  }

    //上传单张图片
  function mysub(id){
    var t = $("#"+id), p = t.closest('.up_img'), img = t.parent().children(".img");

    p.addClass('has').find('.up_has').html('<div class="ing"></div>');

    var data = [];
    data['mod'] = 'member';
    data['filetype'] = 'image';
    data['type'] = 'photo';

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
      mod: "member",
      type: "delPhoto",
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


  $('.submit').click(function(){
    var t = $(this),
        photo = $('#photo').val(),
        userid = id,
        nickname = $('#nickname').val(),
        phone = $('#phone').val(),
        areaCode = $('#areaCode').val(),
        password = $('#password').val();
    if(t.hasClass('disabled')) return;

    if(photo == ''){
      alert(langData['siteConfig'][44][16]);//请上传头像
      return;
    }
    if(nickname == ''){
      alert(langData['siteConfig'][20][268]);//请填写姓名
      return;
    }
    if(phone == ''){
      alert(langData['siteConfig'][21][185]);//请填写手机号
      return;
    }
    if(userid == 0){
      if(password == ''){
        alert(langData['siteConfig'][20][542]);//请填写登陆密码
        return;
      }
    }
    var action = userid == 0 ? 'addZjUser' : 'operZjUser&type=update';

    var data = [];
    data.push('id='+userid);
    data.push('nickname='+nickname);
    data.push('photo='+photo);
    data.push('phone='+phone);
    data.push('areaCode='+areaCode);
    data.push('password='+password);

    t.attr('disabled', true);
    $.ajax({
      url: masterDomain + '/include/ajax.php?service=house&action='+action,
      type: 'GET',
      data: data.join('&'),
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
          alert(data.info);
          t.attr('disabled', false);
        }
      },
      error: function(){
        alert(langData['siteConfig'][6][203]);//网络错误，请重试！
        t.attr('disabled', false);
      }
    })
  })

})