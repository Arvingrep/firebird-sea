$(function(){

	var container = $(".pai_con");

	var juli = 0;

	// 开启排队
	if(state){

		getPaiduiInfo(function(status){

			checkMyOrder();

			if(status == 100){

				$(".now, .tips").removeClass("fn-hide");

				if(lat > 0 && lng > 0){
					getLocation(function(data){
						if(data){
							juli = GetDistance(data.lat, data.lng, lat, lng);
							$("#juli").text(juli+'km');
						}else{
							$("#juli").text(langData['siteConfig'][21][67]);
						}
						$(".now, .tips").removeClass("fn-hide");
						checkMyOrder();
					});
				}else{
					getLocation(function(data){
						if(data){
							getPoint(address, function(dataStore){
								if(data){
									juli = GetDistance(data.lat, data.lng, dataStore.lat, dataStore.lng);
									$("#juli").text(juli+'km');
								}else{
									$("#juli").text(langData['siteConfig'][21][67]);
								}
								$(".now, .tips").removeClass("fn-hide");
							})
						}else{
							$("#juli").text(langData['siteConfig'][21][67]);
							$(".now, .tips").removeClass("fn-hide");
						}
						checkMyOrder();
					})
				}

			}

		});



	}else{

		checkMyOrder();

	}

	// 取号-选择人数
	$('.now_btn').click(function(){
		if(juli > juliLimit){
			alert(langData['siteConfig'][22][99].replace('1', juliLimit));
			return;
		}
		// getTableConfig();
		$(".Choice_Num").show();
		$(".disk").show();
	})
	$(".Choice_Num .num_box ul li").click(function(){
		var x = $(this);
		x.addClass('nb_bc').siblings().removeClass('nb_bc');
	})
	$('.cancle').click(function(){
		$(".Choice_Num").hide();
		$(".disk").hide();
	})
	// 确定
	$('.sure').click(function(){

		var userid = $.cookie(cookiePre+'login_user');
		if(userid == undefined || userid == '' || userid == 0){
			location.href = '/login.html';
			return;
		}


		$(".Choice_Num").hide();
		$(".disk").hide();

		var t = $(this);
		if(t.hasClass("disabled")) return;

		var people = parseInt($(".num_box li.nb_bc").text());
		t.addClass("disabled");
		$.ajax({
			url: '/include/ajax.php?service=business&action=paiduiDeal',
			type: 'post',
			data: {
				store  : shopid,
				people : people
			},
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var url = retUrl.replace('%ordernum%', data.info);
					location.href = retUrl.replace('%ordernum%', data.info);
				}else{
					alert(data.info);
					t.removeClass('disabled');
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
				t.removeClass('disabled');
			}
		})

	})

	// 取消排队
	$(".waitCon").delegate(".wait_btn", "click", function(){
		var id = $(this).closest(".wait").attr("data-id");
		if(confirm(langData['siteConfig'][22][98])){
			$.ajax({
				url: '/include/ajax.php?service=business&action=paiduiUpdateState&state=2&id='+id,
				type: 'post',
				dataType: 'json',
				success: function(data){
					if(data && data.state == 100){
						location.reload();
					}else{
						alert(data.info);
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);
				}
			})
		}
	})

	// 查询桌位人数配置
	function getTableConfig(){
		$.ajax({
			url: '/include/ajax.php?service=business&action=serviceGetTable&store='+shopid,
			type: 'post',
			dataType: 'json',
			success: function(data){

			},
			error: function(){

			}
		})
	}


	// 检查我的排队
	function checkMyOrder(){
		$.ajax({
			url: '/include/ajax.php?service=business&action=paiduiGetMyorder&store='+shopid,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var list = data.info, html = [];
					for(var i = 0; i < list.length; i++){
						html.push('<div class="wait fn-clear" data-id="'+list[i].id+'">');
						html.push('	<ul>');
						html.push('		<li><p>'+langData['siteConfig'][19][308]+'</p><span>'+list[i].table+'</span></li>');
						html.push('		<li><p>'+langData['siteConfig'][22][79]+'</p><p><span>'+list[i].before+'</span> '+langData['siteConfig'][13][40]+'</p></li>');
						html.push('		<li><p>'+langData['siteConfig'][22][77]+'</p><p>'+ (oncetime * list[i].before)+langData['siteConfig'][22][39]+'</p></li>');
						html.push('	</ul>');
						html.push('	<div class="wait_btn">'+langData['siteConfig'][22][80]+'</div>');
						html.push('</div>');
					}

					$(".waitCon").html(html.join(""));
				}
			},
			error: function(){

			}
		})
	}

	function getPaiduiInfo(callback){
		$.ajax({
			url: '/include/ajax.php?service=business&action=paiduiSelect&store='+shopid,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					var list = data.info, html = [];
					for(var i = 0; i < list.length; i++){
						html.push('<ul class="fn-clear">');
						html.push('	<li><p>'+list[i].typename+'</p><span>'+list[i].min+'-'+list[i].max+langData['siteConfig'][13][32]+'</span></li>');
						html.push('	<li class="zhuo last"><em>'+list[i].count+'</em> '+langData['siteConfig'][13][40]+'</li>');
						html.push('	<li class="zhuo"><em>'+(list[i].count * oncetime)+'</em> '+langData['siteConfig'][13][39]+'</li>');
						html.push('</ul>');
					}
					container.html(html.join(""));
				}else{
					container.html('<div class="loading">'+data.info+'</div>');
				}
				if(typeof callback == 'function'){
					callback(data.state);
				}
			},
			error: function(){

			}
		})
	}

})

// 定位
function getLocation(callback){

	// 百度地图
	if (site_map == "baidu") {
		var map = new BMap.Map("container");
  	var geolocation = new BMap.Geolocation();
		geolocation.getCurrentPosition(function(r){
	    	var lat = lng = 0;
      	if(this.getStatus() == BMAP_STATUS_SUCCESS){
          	lat = r.point.lat;
          	lng = r.point.lng;
      	}else{
      		callback('');
      	}
      	callback({"lat":lat, "lng":lng});
    },{enableHighAccuracy: true})

	// 谷歌地图
	}else if (site_map == "google") {
		if (navigator.geolocation) {
			//获取当前地理位置
			navigator.geolocation.getCurrentPosition(function(position) {

					var coords = position.coords, lat = lng = 0;
					lat = coords.latitude;
					lng = coords.longitude;

					callback({"lat":lat, "lng":lng});

			}, function getError(error){
					switch(error.code){
							 case error.TIMEOUT:
										alert(langData['siteConfig'][22][100]);
										break;
							 case error.PERMISSION_DENIED:
										alert(langData['siteConfig'][22][101]);
										break;
							 case error.POSITION_UNAVAILABLE:
										alert(langData['siteConfig'][22][102]);
										break;
							 default:
										break;
					}
		 })
	 }
	}
}
// 搜索定位
function getPoint(keyword, callback){

	// 百度地图
	if (site_map == "baidu") {
		var map = new BMap.Map("container");
		var localSearch = new BMap.LocalSearch(map);
		localSearch.setSearchCompleteCallback(function (searchResult) {
	　　	var poi = searchResult.getPoi(0);
	      	callback(poi ? poi.point : '');
	　});
		localSearch.search(keyword);

	// 谷歌地图
	}else if (site_map == "google") {
		geocoder = new google.maps.Geocoder();
		geocoder.geocode({'address': keyword}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				var locations = results[0].geometry.location;
				lng = locations.lng(), lat = locations.lat();
				if (lng && lat) {
					callback({"lat":lat, "lng":lng});
				}
			}
		});
	}

}
//计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
function GetDistance(lat1,lng1,lat2,lng2){

    var earthRadius = 6367000;

    lat1 = (lat1 * Math.PI ) / 180;
    lng1 = (lng1 * Math.PI ) / 180;

    lat2 = (lat2 * Math.PI ) / 180;
    lng2 = (lng2 * Math.PI ) / 180;

    var calcLongitude = lng2 - lng1;
    var calcLatitude = lat2 - lat1;
    var stepOne = Math.pow(Math.sin(calcLatitude / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(calcLongitude / 2), 2);
    var stepTwo = 2 * Math.asin(Math.min(1, Math.sqrt(stepOne)));
    var calculatedDistance = earthRadius * stepTwo;

    var m = Math.round(calculatedDistance);

    return Math.round(m/1000);

}
