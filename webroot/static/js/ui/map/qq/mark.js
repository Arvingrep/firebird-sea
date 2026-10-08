$(function(){
	/*
	 * 验证逻辑
	 * 1.首先验证坐标值，如果坐标值都不为0，则就以些坐标在地图上标注;
	 * 2.如果详细地址不为空，则解析此地址，如果解析成功，则以此地址作为中心点;
	 * 3.如果详细地址解析不成功，则解析城市名，如果解析成功，以城市名为中心点;
	 * 4.如果都不成功，则IP定位当前城市；
	 */

	//初始化变量
	var city = $("#city").val(),
		addr = $("#addr").val(),
		map_default_lng  = $("#lng").val(),
		map_default_lat  = $("#lat").val();

	var mapOptions = {
			zoom: 14,
			center: new qq.maps.LatLng(map_default_lat, map_default_lng),
			zoomControl: true,
			zoomControlOptions: {
				style: qq.maps.ZoomControlStyle.SMALL,
				position: qq.maps.ControlPosition.RIGHT_BOTTOM
			},
			panControlOptions: {
				position: qq.maps.ControlPosition.RIGHT_BOTTOM
			}
		};

	var map = new qq.maps.Map(document.getElementById("map"), mapOptions);
	var anchor = new qq.maps.Point(32, 64);
    var size = new qq.maps.Size(64, 64);
    var origin = new qq.maps.Point(0, 0);
    var myIcon = new qq.maps.MarkerImage('/static/images/mark_ditu.png', size, origin, anchor);
	var marker = new qq.maps.Marker({
		icon: myIcon,
		position: mapOptions.center,
		animation: qq.maps.MarkerAnimation.DROP,
		map: map,
		draggable: true
	});

	function initialize() {

		//如果经、纬度都为0则设置城市名为中心点
		if(map_default_lng == 0 && map_default_lat == 0){

			//根据地址解析
			if(city != ""){
				var address = city;
				if(addr != "") address = address + addr;
				var geocoder = new qq.maps.Geocoder({
					complete : function(result){
						var location = result.detail.location;
						city = result.detail.name;
						map.setCenter(location);
						mapOptions.center = new qq.maps.LatLng(location.lat, location.lng);
						setMark();
					}
				});
				geocoder.getLocation(address);

			//如果城市为空，则定位当前城市
			}else{
				var citylocation = new qq.maps.CityService({
					complete : function(result){
						var location = result.detail.latLng;
						map.setCenter(location);
						mapOptions.center = new qq.maps.LatLng(location.lat, location.lng);
						setMark();
					}
				});
				citylocation.searchLocalCity();
			}

		}else{
			setMark();
		}

	}

	//设置标注
	function setMark(){
		marker.setMap(null); //清除标注
		marker = new qq.maps.Marker({
			icon: myIcon,
			position: mapOptions.center,
			animation: qq.maps.MarkerAnimation.DROP,
			map: map,
			draggable: true
		});

		//点击
		qq.maps.event.addListener(map, 'click', function(event) {
			marker.setMap(null); //清除标注

			var lng = event.latLng.getLng(), lat = event.latLng.getLat();
			mapOptions.center = new qq.maps.LatLng(lat, lng);

			marker = new qq.maps.Marker({
				icon: myIcon,
				position: mapOptions.center,
				animation: qq.maps.MarkerAnimation.DROP,
				map: map,
				draggable: true
			});

			$("#lng").val(lng);
			$("#lat").val(lat);

			var address = "", geocoder = new qq.maps.Geocoder({
					complete : function(result){
						var address = result.detail.addressComponents;
						$("#addr").val(address.district+address.streetNumber);
					}
				});
			geocoder.getAddress(mapOptions.center);

			listener();
		});

		listener();

	}

	//监听拖动
	function listener(){
		qq.maps.event.addListener(marker, 'dragend', function(event) {
			var lng = event.latLng.lng, lat = event.latLng.lat;
			mapOptions.center = new qq.maps.LatLng(lat, lng);
			$("#lng").val(lng);
			$("#lat").val(lat);
			var address = "", geocoder = new qq.maps.Geocoder({
					complete : function(result){
						var address = result.detail.addressComponents;
						$("#addr").val(address.district+address.streetNumber);
					}
				});
			geocoder.getAddress(mapOptions.center);
		});
	}

	//搜索回车提交
    $("#keyword").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#search").click();
        }
    });

	//关键字搜索
	$("#search").bind("click", function(){
		var address = document.getElementById('keyword').value;
		if(address != ""){
			geocoder = new qq.maps.Geocoder({
				complete : function(result){
					var location = result.detail.location;
					map.setCenter(location);
					mapOptions.center = new qq.maps.LatLng(location.lat, location.lng);
					setMark();

					$("#lng").val(location.lng);
					$("#lat").val(location.lat);
					var address = "", geocoder = new qq.maps.Geocoder({
							complete : function(result){
								var address = result.detail.addressComponents;
								$("#addr").val(address.district+address.streetNumber);
							}
						});
					geocoder.getAddress(mapOptions.center);
				}
			});
			geocoder.getLocation(city+address);

		}else{
			document.getElementById('address').focus();
		}
	});

	initialize();
});
