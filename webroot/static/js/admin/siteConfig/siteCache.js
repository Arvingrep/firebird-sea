$(function(){
  var needCheck = false;

  $('#editform input').on('input propertychange', function(){
    $('#checkRedis').text('点击检测是否可用');
    needCheck = true;
    var t = $(this), val = t.val(), type = t.attr('type');
    if(type == 'ip'){
      var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
      reg.test(val);
      t.val(val);
    }
  })
  $('#checkRedis').click(function(){
    var t = $(this);
    if (t.text() == "正在连接...") return false;
    var server = $('#server').val(),
        port = $('#port').val(),
        requirepass = $('#requirepass').val();
    if(server == '' || port == ''){
      $.dialog.alert('请填写完整');
    }
    var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    if(!reg.test(server)){
      $.dialog.alert('redis服务器地址不正确');
      return false;
    }

    t.html("<font class='muted'>正在连接...</font>");
    huoniao.operaJson("?action=check&type=redis", $('#editform').serialize(), function (val) {
        if (!val) t.html("点击检测是否可用");
        var info = val.info;
        if (val.state == 100) {
            info = '<font class="text-success">' + info + '</font>';
            needCheck = false;
        } else {
            info = '<font class="text-error">' + info + '</font>';
        }
        t.html(info + "&nbsp;&nbsp;<font size='1'>返回重试</font>");
    });
  })

  $('#editform').submit(function(e){
    e.preventDefault();
    if($('[name="redis[state]"]:checked').val() == 1 && needCheck){
      $.dialog.alert('请检测配置是否可用');
      return;
    }
    huoniao.operaJson("?action=save&type=redis", $('#editform').serialize(), function (val) {
      var info = val.info;
      if (val.state == 100) {
          huoniao.showTip('success', info);
          setTimeout(function(){
            location.reload();
          }, 1000)
      } else {
          huoniao.showTips('error', info, 1000);
      }
    });
  })

})