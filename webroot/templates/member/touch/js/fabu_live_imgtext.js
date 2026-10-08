$(function(){
  var atlasMax_ = atlasMax;
  $('#fabuForm').submit(function(){
    var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;

    event.preventDefault();

    var t    = $('#submit'),
        text = $.trim($("#text").val()),
        data = [];
    if(t.hasClass('disabled')) return;

    if(text){
      data.push('text='+text);
    }
    var imglist = [], imgli = $("#fileList1 li.thumbnail");
    imgli.each(function(index){
      var t = $(this), val = t.find("img").attr("data-val");
      if(val != ''){
        var val = $(this).find("img").attr("data-val");
        if(val != ""){
          imglist.push(val);
        }
      }
    })
    if(imglist){
      data.push('imglist='+imglist.join(","));
    }

    if(!data.length){
      alert(langData['siteConfig'][44][90]);//请上传图片或输入文字内容
      return false;
    }
    t.addClass('disabled');
    $.ajax({
      url: action,
      type: 'post',
      data: data.join("&"),
      dataType: 'json',
      success: function(res){
        t.removeClass('disabled');
        if(res && res.state == 100){
          alert(res.info);
          location.reload();
        }else{
          alert(res.info);
        }
      },
      error: function(){
        alert(langData['siteConfig'][6][203]);//网络错误，请重试！
        t.removeClass('disabled');
      }
    })

  })

  $('#submit').click(function(){
    $('#fabuForm').submit();
  })
})