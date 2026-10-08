$(function () {
	
   
   
   // 列表地图
   $('.sp_list').delegate('.shop_li .addr a','click',function(){
	   var t = $(this), pli = t.parents('.shop_li');
		$('html').addClass('noscroll');
		$('.mask').show();
		$('.map-popup').show();
		
		var data = {
			'address' : pli.find('.addr').text(),
			'lng': t.attr('data-lng'),
			'lat': t.attr('data-lat'),
			'title':pli.find('.top_a h2').text(),
		};
		$(".map-popup .name").text(data.title);
		$(".map-popup .location").text(data.address)
		
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
			var sContent =data.address;
			var point = new BMap.Point(data.lng, data.lat);
			map.centerAndZoom(point, 15);
			var infoWindow = new BMap.InfoWindow(sContent);  // 创建信息窗口对象
			map.openInfoWindow(infoWindow,point); //开启信息窗口
			
			var marker = new BMap.Marker(point);  // 创建标注
			map.addOverlay(marker);
			hasShow =1
		},500)
		
		
		$('.map-popup .close img').click(function(){
			$('.mask').hide();
			$('.map-popup').hide();
			$('html').removeClass('noscroll');
		})
   });
   
});