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
			
			// 谷歌地图
			centerPoint = new google.maps.LatLng(parseFloat(data.lat), parseFloat(data.lng));
			
			map = new google.maps.Map(document.getElementById('allmap'), {
			    zoom: 14,
			    center: centerPoint,
			    zoomControl: true,
			    mapTypeControl: false,
			    streetViewControl: false,
			    zoomControlOptions: {
			        style: google.maps.ZoomControlStyle.SMALL
			    }
			});
			addcenMarker_list(data)
			
			
			
			$('.map-popup .close img').click(function(){
				$('.mask').hide();
				$('.map-popup').hide();
				$('html').removeClass('noscroll');
			})
	});

	
	// 添加中心点
	function addcenMarker_list(data) {
	    var marker = new google.maps.Marker({
	        position: centerPoint,
	        map: map,
	        title: data.title,
	        icon: cenicon,
	    });
		var centerwindow = new google.maps.InfoWindow({
			content: '<div style="font-weight: 700; font-size: 16px;">' + data.title + '</div>' + '<p style="line-height: 3em;">' + data.address + '</p>'
		});
	    // 中心点点击事件
	    marker.addListener('click', function() {
	        centerwindow.open(map, marker);
	    });
	
	
	}
});