//取货送货路径

var labelStyle = {
   color: "#fff",
   borderWidth: "0",
   padding: "0",
   zIndex: "2",
   backgroundColor: "transparent",
   textAlign: "center",
   fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
}
var jFlag = false;
var ordermap;
var routeLine; //高德地图专用
var pathInit = {
	drawPath:function(){
		if(site_map == 'baidu'){
		 	ordermap = new BMap.Map('orderMap');
		 	ordermap.centerAndZoom(new BMap.Point(sqLng, sqLat),14);
		 	ordermap.addEventListener("tilesloaded", tilesloadedfun);
		 	function tilesloadedfun(){
		 		ordermap.removeEventListener("tilesloaded", tilesloadedfun);
			 	var slnglat = {"lng":Number(qhLng),"lat":Number(qhLat)}, //取货坐标
					ulnglat = {"lng":Number(sqLng),"lat":Number(sqLat)}; //收货坐标
					//alert(slnglat,ulnglat)
				var shopIcon = new BMap.Label('<div class="orderbubble shop"></div>', {
						  position: slnglat,
						  offset: new BMap.Size(-15, -33),
						});
				var userIcon = new BMap.Label('<div class="orderbubble user"></div>', {
						  position: ulnglat,
						  offset: new BMap.Size(-15, -33),
						});
				shopIcon.setStyle(labelStyle);
				userIcon.setStyle(labelStyle);
				//map.clearOverlays();
				ordermap.addOverlay(shopIcon);
				ordermap.addOverlay(userIcon);
				
				ordermap.enableDragging(); 
				// 开始划线
				var shop = new BMap.Point(qhLng, qhLat);  //取货坐标
				var user = new BMap.Point(sqLng, sqLat);  //收货坐标
				var riding1 = new BMap.RidingRoute(ordermap, {
				    renderOptions: { 
				        map: ordermap,
				        autoViewport: true 
				       
				    },
					onPolylinesSet:function(Route){
					  //当线条添加完成时调用
					  for(var i=0;i<Route.length;i++){
					  var polyline = Route[i].getPolyline();//获取线条遮挡物
						  polyline.setStrokeColor("#307CFC");//设置颜色
						  polyline.setStrokeWeight(3);//设置宽度
						  polyline.setStrokeOpacity(1);//设置透明度
						  // console.log(Route[i])
					  }
					},
					onMarkersSet:function(routes) {           
						 for (var i = 0; i <routes.length; i++) {
							// 判断是否是途经点
							if(typeof(routes[i].Km)=="undefined"){
									ordermap.removeOverlay(routes[i].marker); //删除起始默认图标
							}
							// console.log(routes)
						}
					}
				});

				riding1.search(shop,user);  //店铺~顾客
				pathInit.calcTime(qhLng,qhLat,sqLng,sqLat);

		 	}			
		}else if(site_map == 'amap'){
			// 初始化地图
			ordermap = new AMap.Map("orderMap", {
				center: [sqLng, sqLat],
				zoom: 14
			});
			shopIcon = new AMap.Marker({
				position: [qhLng,qhLat],
				content: '<div class="orderbubble shop"></div>',
				offset: new AMap.Pixel(-15, -33),
				map: ordermap
			});
			userIcon = new AMap.Marker({
				position: [sqLng,sqLat],
				content: '<div class="orderbubble user"></div>',
				offset: new AMap.Pixel(-15, -33),
				map: ordermap
			});
			var ridingOption = {
				policy: 1  
			}
			var riding1 = new AMap.Riding(ridingOption);

			riding1.search([qhLng, qhLat],[sqLng, sqLat], function(status, result) {
				if (status === 'complete') {
					if (result.routes && result.routes.length) {
						drawRoute("1",result.routes[0])
						// log.success('绘制骑行路线完成')
					}
				}
			});
			pathInit.calcTime(qhLng,qhLat,sqLng,sqLat);
		}else if(site_map == 'google'){
			var infoWindow = new google.maps.InfoWindow;
			var slnglat = {"lng":Number(qhLng),"lat":Number(qhLat)}; //取货坐标
			var ulnglat = {"lng":Number(sqLng),"lat":Number(sqLat)}; //收货坐标
			// 初始化地图
			ordermap = new google.maps.Map(document.getElementById("orderMap"), {
			   	zoom: 14,
			   	center: {
				 lat: parseFloat(sqLat),
				 lng: parseFloat(sqLng)
			   	},
			   	zoomControl: true,
	            mapTypeControl: false,
	            streetViewControl: false,
	            zoomControlOptions: {
	              style: google.maps.ZoomControlStyle.SMALL
	            }
			});
			var sposition = new google.maps.LatLng(parseFloat(qhLat),parseFloat(qhLng));
			var uposition = new google.maps.LatLng(parseFloat(sqLat),parseFloat(sqLng));
			var shopIcon  = new MarkerWithLabel({
			   position: sposition,
			   draggable: true,
			   map: ordermap,
			   labelAnchor: new google.maps.Point(15, 33),
			   labelContent: '<div class="orderbubble shop"></div>',
				icon:'/static/images/blank.gif',
			 });
			var userIcon = new MarkerWithLabel({
				position: uposition,
				draggable: true,
				map: ordermap,
				labelAnchor: new google.maps.Point(15, 33),
				labelContent: '<div class="orderbubble user"></div>',
				icon:'/static/images/blank.gif',
			});


			directionsService = new google.maps.DirectionsService();
			directionsRenderer = new google.maps.DirectionsRenderer({
				suppressMarkers:true  ,
			});
			directionsRenderer.setOptions({
				polylineOptions: {
				  strokeColor: '#027CFF'
				}
			});
			directionsRenderer.setMap(ordermap);
			calculateAndDisplayRoute(directionsService, directionsRenderer,slnglat,ulnglat);
			pathInit.calcTime(qhLng,qhLat,sqLng,sqLat);
		}
		 
		
	}
	//计算距离和送达时间
	,calcTime:function (qhLng,qhLat,sqLng,sqLat) {
		$.ajax({
			"url": "/include/ajax.php?service=waimai&action=getroutetime&originlng="+qhLng+"&originlat="+qhLat+"&destinationlng="+sqLng+"&destinationlat="+sqLat,
			"data": '',
			"dataType": "json",
			"success": function(data){
				if(data && data.state == 100){
					var info = data.info;
					if(info.juli<1 && info.juli>=0){
					   $(".busjuli").html((info.juli*1000)+'m');
					   $('.busTop .busTxt p').show();
					}else{
					   $(".busjuli").html(info.juli.toFixed(2)+'km');
					   $('.busTop .busTxt p').show();
					}
					
                  if(!jFlag){
                    jFlag = true;
                  }
                    
				}
			}
		});
	}


}	
//页面定位失败时 取默认坐标
var ulocal = utils.getStorage('user_local');
HN_Location.init(function(data){

    if (data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
        //showErrAlert('定位失败，请刷新页面');
        if(ulocal){
          	qhLng = ulocal.lng;
          	qhLat = ulocal.lat;
          	if(qhLng !='' && qhLat !='' && sqLng !='' && sqLat!=''){
          		pathInit.drawPath();
          		$('#orderMap').show();
          	}
          	
        }
    }else{
    	//起点
      	qhLng = data.lng;
      	qhLat = data.lat;
      	if(qhLng !='' && qhLat !='' && sqLng !='' && sqLat!=''){
      		pathInit.drawPath();
      		$('#orderMap').show();
      	}


    }
})

// if(qhLng && qhLat && sqLng && sqLat){

	
	
// }

//转换PHP时间戳
function timeTrans(timestamp){
        
    const dateFormatter = huoniao.dateFormatter(timestamp);
    const year = dateFormatter.year;
    const month = dateFormatter.month;
    const day = dateFormatter.day;
    const hour = dateFormatter.hour;
    const minute = dateFormatter.minute;
    const second = dateFormatter.second;
    
  return (hour+':'+minute+':'+second);		
}

// 高德地图划线
// 开始规划路线
function parseRouteToPath(route){
 	// 解析RidingRoute对象，构造成AMap.Polyline的path参数需要的格式
 	// RidingResult对象结构参考文档 https://lbs.amap.com/api/javascript-api/reference/route-search#m_RideRoute
 	var path = []
 	for (var i = 0, l = route.rides.length; i < l; i++) {
 		var step = route.rides[i]
 		for (var j = 0, n = step.path.length; j < n; j++) {
 		  path.push(step.path[j])
 		}
 	}
 	return path
}

function drawRoute(type,route){
 	var path = parseRouteToPath(route)
 	var startMarker,endMarker;
 	startMarker = new AMap.Marker({
 		position: path[0],
 		content: '<div></div>',
 		offset: new AMap.Pixel(-15, -50),
 		map: ordermap
 	});
 	endMarker = new AMap.Marker({
 		position: path[path.length - 1],
 		content: '<div></div>',
 		// 以 icon 的 [center bottom] 为原点
 		offset: new AMap.Pixel(-15, -50),
 		map: ordermap
 	}) 	
	
	if(routeLine){
		ordermap.remove(routeLine)
	}
    routeLine = new AMap.Polyline({
		path: path,
		strokeWeight: 5,
		strokeColor: '#027CFF',
		lineJoin: 'round'
	})
	routeLine.setMap(ordermap)
	// 调整视野达到最佳显示区域	
	ordermap.setFitView([ startMarker, endMarker, routeLine ])
							
}
// 谷歌地图规划路线
 function calculateAndDisplayRoute(directionsService, directionsRenderer,start,end) {
  directionsService.route(
	{
	   origin: { lat: Number(start.lat), lng: Number(start.lng) },
	   destination: { lat: Number(end.lat), lng: Number(end.lng) },
	   travelMode: 'WALKING'
	},
	(response, status) => {
	  if (status === "OK") {
		directionsRenderer.setDirections(response);
	  } else {
		window.alert("Directions request failed due to " + status);
	  }
	}
  );
}
