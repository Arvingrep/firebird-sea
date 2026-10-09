$(function(){

	/*
	 * 验证逻辑
	 * 1.首先验证坐标值，如果坐标值都不为0，则就以些坐标在地图上标注;
	 * 2.如果详细地址不为空，则解析此地址，如果解析成功，则以此地址作为中心点;
	 * 3.如果详细地址解析不成功，则解析城市名，如果解析成功，以城市名为中心点;
	 */

	//初始化变量
	var parWinAddr = $(window.parent.document).find('#currAddr');
	 var parWinAddrs = $(window.parent.document).find('.addrBtn');
	 var addrArr = $(window.parent.document).find('#addrArr');
	var city = $("#city").val(),
		addr = $("#addr").val(),
		map_default_lng  = parseFloat($("#lng").val()),
		map_default_lat  = parseFloat($("#lat").val());

	var map, geocoder, marker,
		mapOptions = {
			zoom: 14,
			center: new google.maps.LatLng(map_default_lat, map_default_lng),
			zoomControl: true,
			mapTypeControl: false,
			streetViewControl: false,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL
			}
		},
		image = '/static/images/mark_ditu.png';

	//加载地图事件
	function initialize() {

		//如果经、纬度都为0则设置城市名为中心点
		if(map_default_lng == 0 && map_default_lat == 0){

			//根据地址解析
			if(city != ""){
				var address = city;
				if(addr != "") address = address + " " + addr;
				geocoder = new google.maps.Geocoder();
				geocoder.geocode({'address': address}, function(results, status) {
					//如果解析成功，则重置经、纬度
					if(status == google.maps.GeocoderStatus.OK) {
						var location = results[0].geometry.location;
						mapOptions.center = new google.maps.LatLng(location.lat(), location.lng());

						var pos = {
							lat: location.lat(),
							lng: location.lng()
						};
						geocoder.geocode({'location': pos}, function(results, status) {
							if (status === 'OK') {
								if (results[0]) {
									var formatted_address = results[0].formatted_address;
									$("#addr").val(formatAddress(formatted_address));
									getAddress(results[0])
									if(!parWinAddr.val()){
										parWinAddr.val(formatted_address.split(' ')[0])
									}
								}
							}
						});

						$("#lng").val(location.lng());
						$("#lat").val(location.lat());

						setMark();
					}
				});

			//如果城市为空，则浏览器定位当前位置
			}else{

				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(function(position) {
						var pos = {
							lat: position.coords.latitude,
							lng: position.coords.longitude
						};
						geocoder = new google.maps.Geocoder();
						geocoder.geocode({'location': pos}, function(results, status) {
							if (status === 'OK') {
								if (results[0]) {
									var location = results[0].geometry.location;
									mapOptions.center = new google.maps.LatLng(location.lat(), location.lng());

									var formatted_address = results[0].formatted_address;
									$("#addr").val(formatAddress(formatted_address));
									getAddress(results[0])
									if(!parWinAddr.val()){
										parWinAddr.val(formatted_address.split(' ')[0])
									}
									$("#lng").val(location.lng());
									$("#lat").val(location.lat());

									setMark();
								}
							}
						});

					}, function() {
						alert("浏览器定位失败，请设置默认城市后重试！");
					});
				} else {
					alert("请开启浏览器定位，请设置默认城市后重试！");
				}

			}

		}else{

			var pos = {
				lat: map_default_lat,
				lng: map_default_lng
			};
			geocoder = new google.maps.Geocoder();
			geocoder.geocode({'location': pos}, function(results, status) {
				if (status === 'OK') {
					if (results[0]) {
						var formatted_address = results[0].formatted_address;
						$("#addr").val(formatAddress(formatted_address));
						getAddress(results[0])
						parWinAddr.val(formatted_address.split(' ')[0])
					}
				}
			});

			setMark();
		}

	}

	//设置标注
	function setMark(){
		map = new google.maps.Map(document.getElementById('map'), mapOptions);

		var input = document.getElementById('keyword');
    var autocomplete = new google.maps.places.Autocomplete(input, {placeIdOnly: true});
	    // autocomplete.bindTo('bounds', map);

		//增加标注
		marker = new google.maps.Marker({
			position: mapOptions.center,
			map: map,
			icon: image,
			draggable:true,
			animation: google.maps.Animation.DROP
		});

		//点击
		google.maps.event.addListener(map, 'click', function(event) {
			marker.setMap(); //清除标注
			var location = event.latLng;
			var newCenter = new google.maps.LatLng(location.lat(), location.lng());
			// map.setCenter(newCenter);

			//添加新的标注
			marker = new google.maps.Marker({
				position: newCenter,
				map: map,
				icon: image,
				draggable:true,
				animation: google.maps.Animation.DROP
			});

			$("#lng").val(location.lng());
			$("#lat").val(location.lat());

			var pos = {
				lat: location.lat(),
				lng: location.lng()
			};

			geocoder.geocode({'location': pos}, function(results, status) {
				if (status === 'OK') {
					if (results[0]) {
						var formatted_address = results[0].formatted_address;
						$("#addr").val(formatAddress(formatted_address));
						getAddress(results[0])
						parWinAddr.val(formatted_address.split(' ')[0])
					}
				}
			});

			listener();
		});

		listener();
	}

	//监听拖动
	function listener(){
		google.maps.event.addListener(marker, 'dragend', function(event) {
			var location = event.latLng;
			$("#lng").val(location.lng());
			$("#lat").val(location.lat());

			var pos = {
				lat: location.lat(),
				lng: location.lng()
			};

			geocoder.geocode({'location': pos}, function(results, status) {
				if (status === 'OK') {
					if (results[0]) {
						var formatted_address = results[0].formatted_address;
						$("#addr").val(formatAddress(formatted_address));
						getAddress(results[0])
						parWinAddr.val(formatted_address.split(' ')[0])
					}
				}
			});
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
			geocoder = new google.maps.Geocoder();
			geocoder.geocode({'address': city + " " + address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					var location = results[0].geometry.location;
					mapOptions.center = new google.maps.LatLng(location.lat(), location.lng());
					setMark();

					var formatted_address = results[0].formatted_address;
					$("#addr").val(formatAddress(formatted_address));

					$("#lng").val(location.lng());
					$("#lat").val(location.lat());
					getAddress(results[0])
					parWinAddr.val(address)
				}
			});
		}else{
			document.getElementById('address').focus();
		}
	});

	google.maps.event.addDomListener(window, 'load', initialize);


	//格式化详细地址
	function formatAddress(address){
		var addr = address.split(city+"市");
		if(addr.length == 1){
			addr = address.split(city);
		}
		addr = addr.splice(1, addr.length);
		address = addr.join("");

		if(address.indexOf("邮政编码") > -1){
			addr = address.split("邮政编码");
			address = addr[0];
		}
		return $.trim(address.replace("中国", ""));
	}


	function getAddress(obj){
		let addrComps = obj.address_components;
		if(addrComps.length > 0){
			let country = '', prov = '',city_n = '',district_n = ''
			for(let i = 0; i < addrComps.length; i++){
				let addrComp = addrComps[i]
				if(addrComp.types.includes('locality')){
					city_n = addrComp['long_name'] || addrComp['short_name']
				}else if(addrComp.types.includes('sublocality') || addrComp.types.includes('sublocality_level_1')){
					district_n = addrComp['long_name'] || addrComp['short_name']
				}else if(addrComp.types.includes('administrative_area_level_1')){
					prov = addrComp['long_name'] || addrComp['short_name']
				}else if(addrComp.types.includes('country')){
					country = addrComp['long_name'] || addrComp['short_name']
					if(['HK','MO','TW'].includes(addrComp['short_name'])){
						city_n = addrComp['long_name']
					}
				}
			}

			if(!city_n){
				city_n = prov || country
			}

			parWinAddrs.text(city_n+'/'+district_n)
			addrArr.val(city_n+' '+district_n)
		}
	}
});
