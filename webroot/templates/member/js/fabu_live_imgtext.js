$(function(){
  $("#submit").bind("click", function(event){

    event.preventDefault();

    var t       = $(this),
        form    = $('#fabuForm'),
        url     = form.attr('action'),
        text    = $.trim($('#text').val()),
        imglist = $('.imglist-hidden').val();

    if(t.hasClass("disabled")) return;

    if(text == '' && (imglist == undefined || imglist == '')){
      $.dialog.alert(langData['siteConfig'][38][45]);//请填写文字消息或上传图片
      return;
    }

    t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");  //提交中

    $.ajax({
      url: url,
      type: 'post',
      data: form.serialize(),
      dataType: 'json',
      success: function(res){
        if(res && res.state == 100){
          $.dialog.confirm(res.info, function(){
            location.reload();
          }, function(){
            location.reload();
          })
        }else{
          $.dialog.alert(res.info);
          t.removeClass("disabled").html(langData['siteConfig'][11][19]);   //立即投稿
        }
      },
      error: function(){
        $.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
        t.removeClass("disabled").html(langData['siteConfig'][11][19]); //立即投稿
      }
    })

  })

})