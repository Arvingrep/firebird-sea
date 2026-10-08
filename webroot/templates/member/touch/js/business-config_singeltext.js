$(function(){
  $(".fabuBtn").click(function(){
    var t = $(this);
    var inp = $(".content input");
    var name = inp.attr("name");
    var tit = inp.attr("placeholder");
    var val = $.trim(inp.val());

    if(val == ''){
      alert(tit);
      return;
    }

    if(t.hasClass('disabled')) return;

    t.addClass('disabled');

    $.ajax({
      url: masterDomain + '/include/ajax.php?service=business&action=updateStoreConfig&'+name+'='+val,
      type: 'get',
      dataType: 'jsonp',
      success: function(data){
        if(data && data.state == 100){
            alert(langData['siteConfig'][6][39]);//保存成功
            if(device.indexOf('huoniao') > -1) {
                setupWebViewJavascriptBridge(function (bridge) {
                    bridge.callHandler("goBack", {}, function (responseData) {
                    });
                });
            }else{
                window.location.href = document.referrer;
            }
        }else{
          t.removeClass('disabled');
          alert(data.info);
        }
      },
      error: function(){
        t.removeClass('disabled');
        alert(langData['siteConfig'][44][23]);//网络错误，请重试
      }
    })

  })
})