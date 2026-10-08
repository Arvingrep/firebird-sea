$(function(){

    //原生APP后退回来刷新页面
    pageBack = function(data) {
        setupWebViewJavascriptBridge(function(bridge) {
            bridge.callHandler("pageRefresh", {}, function(responseData){});
        });
    }

  var device = navigator.userAgent;
	if (device.indexOf('huoniao') > -1) {
		$("#appSetting").attr("style", "display: block");
	}

  function getData(){
    var date = new Date();

    $.ajax({
      url: '/include/ajax.php?service=member&action=statisticsDateRevenue',
      type: 'get',
      dataType: 'json',
      success: function(data){
        var totalAmount = totalCount = 0;
        if(data && data.state == 100){
          var list = data.info, html = [];

          if(list.length == 0){
            $(".order-tab").html('<li class="loading">'+langData['siteConfig'][20][430]+'</li>');
          }
          for(var i = 0; i < list.length; i++){
            var item = [];
            var obj = list[i],
                module = obj.module,
                amount = obj.amount,
                count = obj.count;

            totalAmount += parseFloat(amount)
            totalCount += count;
          }

        }
        $('.account li').eq(0).find('strong').text(totalAmount);
        $('.account li').eq(1).find('strong').text(totalCount);
      },
      error: function(){

      }
    })
  }

  getData();

});
