$(function(){
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
          $("#photo").val(m.url);

        } else {
          uploadError(m.state, id, uploadHolder);
        }
      },
      error: function() {
        uploadError(langData['siteConfig'][6][203], id, uploadHolder);//网络错误，请重试！
      }
    });

  }

  function uploadError(info, id, uploadHolder){
    alert(info);
    uploadHolder.removeClass('disabled').text(langData['siteConfig'][6][50]);//上传图片
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

  $("#Filedata").change(function(){
    if ($(this).val() == '') return;
    mysub($(this).attr("id"));
  })

  // 删除头像
  $('.up_img').delegate('.del', 'click', function(){
    var t = $(this), img = $('#photo').val(), p = t.closest('.up_img');
    delAtlasPic(img);
    $('#photo').val('');
    p.removeClass('has').find('.up_has').html('');
  })

  $('#subForm').submit(function(e){
    e.preventDefault();
  })
  $('.submit').click(function(){
    var t = $(this), f = $('#subForm');
    if(t.hasClass('disabled')) return;

    var nickname = $('#nickname').val();
    if(nickname == ""){
      alert(langData['siteConfig'][20][330]);//请输入姓名
      return false;
    }

    t.addClass('disabled');

    $.ajax({
      url: '/include/ajax.php?service=house&action=configZjUserGroup',
      type: 'post',
      data: f.serialize(),
      dataType: 'json',
      success: function(data){
        if(data && data.state == 100){
          alert(data.info);
          t.removeClass('disabled');
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
