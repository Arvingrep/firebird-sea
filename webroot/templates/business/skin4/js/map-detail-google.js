$(function () {
	$('.map_box img').click(function(){
		$('html').addClass('noscroll');
		$('.mask').show();
		$('.map-popup').show();
		
		$('.map-popup .close img').click(function(){
			$('.mask').hide();
			$('.map-popup').hide();
			$('html').removeClass('noscroll');
		})
	});
	   
    // 初始化地图
    init();
    function init(){
        centerPoint = new google.maps.LatLng(parseFloat(pageDetail.lat), parseFloat(pageDetail.lng));

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
        addcenMarker();
    }

    var centerwindow = new google.maps.InfoWindow({
        content: '<div style="font-weight: 700; font-size: 16px;">' + pageDetail.panName + '</div>' + '<p style="line-height: 3em;">详细地址：' + pageDetail.address + '</p>'
    });
    // 添加中心点
    function addcenMarker() {
        var marker = new google.maps.Marker({
            position: centerPoint,
            map: map,
            title: pageDetail.panName,
            icon: cenicon,
        });

        // 中心点点击事件
        marker.addListener('click', function() {
            centerwindow.open(map, marker);
        });


    }
	
	
	
	
	
});