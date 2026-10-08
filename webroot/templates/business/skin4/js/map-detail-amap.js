$(function () {
    //高德地图api功能
	var hasShow = 0;
	$('.map_box img').click(function(){
		$('html').addClass('noscroll');
		$('.mask').show();
		$('.map-popup').show();
		
		if(!hasShow){
			setTimeout(function(){
				var sContent =pageDetail.address;
				var map = new AMap.Map('allmap', {
				        center: [pageDetail.lng, pageDetail.lat],
				        zoom: 15,
				    });
				    AMap.plugin('AMap.ToolBar', function() { //异步加载插件
				        var toolbar = new AMap.ToolBar();
				        map.addControl(toolbar);
				    });
				    // 构造点标记
				    var marker = new AMap.Marker({
				        icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
				        position: [pageDetail.lng, pageDetail.lat]
				    });
				    map.add(marker);
				    var content = [
				        '<p style="line-height: 3em;">' + sContent + '</p>'
				    ];
				    // 创建 infoWindow 实例 
				    var infoWindow = new AMap.InfoWindow({
				       content: content.join("<br>")  //传入 dom 对象，或者 html 字符串
				    });
				    // 打开信息窗体
				    infoWindow.open(map,[pageDetail.lng, pageDetail.lat]);
			},500)
		}
		$('.map-popup .close img').click(function(){
			$('.mask').hide();
			$('.map-popup').hide();
			$('html').removeClass('noscroll');
		})
   })
})