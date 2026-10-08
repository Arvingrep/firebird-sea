$(function () {
	var hasShow = 0;
	
	$('.map_box img').click(function(){
		$('html').addClass('noscroll');
		$('.mask').show();
		$('.map-popup').show();
		
		if(!hasShow){
			setTimeout(function(){
				// 百度地图API功能
				var map = new BMap.Map("allmap");    // 创建Map实例
				//添加地图类型控件
				map.addControl(new BMap.MapTypeControl({
				    mapTypes:[
				        BMAP_NORMAL_MAP,
				        BMAP_HYBRID_MAP
				    ]}));
				map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
				// 百度地图API功能
				var sContent =pageDetail.address;
				var point = new BMap.Point(pageDetail.lng, pageDetail.lat);
				map.centerAndZoom(point, 15);
				var infoWindow = new BMap.InfoWindow(sContent);  // 创建信息窗口对象
				map.openInfoWindow(infoWindow,point); //开启信息窗口
				
				var marker = new BMap.Marker(point);  // 创建标注
				map.addOverlay(marker);
				hasShow =1
			},500)
		}
		
		$('.map-popup .close img').click(function(){
			$('.mask').hide();
			$('.map-popup').hide();
			$('html').removeClass('noscroll');
		})
	});
   
  
   
});