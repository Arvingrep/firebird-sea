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
     
      	if(qhLng == sqLng && qhLat == sqLat){//取送货地址相同时 弹出提示
			$('.pop_confirm').addClass('show');
		    $('.mask_pop').show();
		    $('.pop_confirm .cancle_btn').click(function(e){
		        $('.pop_confirm').removeClass('show');
		        $('.mask_pop').hide();
		        e.stopImmediatePropagation();   //阻止事件继续执行
		    });

		    $('.pop_confirm .sure_btn').off('click').click(function(e){
			    $('.pop_confirm').removeClass('show');
		        $('.mask_pop').hide();
		    })
		    $('.mask_pop').click(function() {
			    $('.mask_pop').hide();
			    $('.pop_confirm').removeClass('show');
			});
		}
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
				var userIcon = new BMap.Label('<div class="orderbubble user"><p>0km，预计00:00送达</p></div>', {
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
				content: '<div class="orderbubble user"><p>0km，预计00:00送达</p></div>',
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
			var infowincontent = '<p>0km，预计00:00送达</p>';
			infoWindow.setContent(infowincontent);

			infoWindow.open(map, userIcon);

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
					   $(".user p").html((info.juli*1000)+'m,预计'+info.time+'送达');
					   $('.distance span').html((info.juli*1000)+'m').attr('data-juli',info.juli);;
					}else{
					   $(".user p").html(info.juli.toFixed(2)+'km,预计'+info.time+'送达');
					   $('.distance span').html(info.juli.toFixed(2)+'km').attr('data-juli',info.juli);
					}
					
					$("#sdtime").val(info.time);
					$('.distance em').html("（预计"+info.time+"送达）");
                    $('#sdtimeC').val(info.yjtime);
                  	pathInit.sdTimeCalc();
                  if(!jFlag){
                    pathInit.getMoney();
                    jFlag = true;
                  }
                    
				}
			}
		});
	}
    //计算送达时间
    ,sdTimeCalc:function(){
      var ymd2 = $('.qjTime').attr('data-time');
      if(ymd2){//取件时间
        var dis = $('.distance span').attr('data-juli');    
        var sdt = $('#sdtimeC').val()*1 +ymd2*1;
        var stime = timeTrans(sdt);
        $('.orderbubble.user p').html((dis*1).toFixed(2)+'km,预计'+stime+'送达');
        $('.distance em').text('预计'+stime+'送达');
        $('#sdtime').val(stime);
      }
      
    }
	//计算价格
	,getMoney:function () {
		var tipPrice = 0;
		var hb = 0;
		if($('#tipPrice').val() > 0){//小费
			tipPrice = $('#tipPrice').val();
			$('.priceBox .xfPrice').addClass('show');
			$('.priceBox .xfPrice em').text(tipPrice);
		}else{
			$('.priceBox .xfPrice').removeClass('show');
		}
		if($('.hasQuan em').text() > 0){//优惠
			hb = $('.hasQuan em').text();
			$('.priceBox .hbPrice').addClass('show');
			$('.priceBox .hbPrice em').text(hb);
		}else{
			$('.priceBox .hbPrice').removeClass('show');
		}
		//距离价格计算
		var juliFee = 0,juliTxt = '';
		var psjuli = $('.distance span').attr('data-juli');//公里数
		// if(juliCalc){
		// 	juliCalc.reverse();
		// 	console.log(juliCalc)
		// 	for(var i = 0; i < juliCalc.length; i++){
		// 		var sj = parseFloat(juliCalc[i][0]),  //上限
		// 			ej = parseFloat(juliCalc[i][1]), //下限
		// 			ps = parseFloat(juliCalc[i][2]);  //单价
		// 		if(sj <= psjuli * 1 && ej >= psjuli * 1){
		// 			juliFee = ps;
		// 		}

		// 		juliTxt += '<p><span>'+sj+'-'+ej+'公里时</span><em>+'+ps+echoCurrency("short")+'</em></p>';
		// 		$(".juliAdd dd").html(juliTxt)
		// 		$('.ruleBox dl.juliAdd').addClass('show');
		// 	}
		// }

		if(juliCalc){

			juliCalc.forEach(function(val,index){
				var sj = parseFloat(val[0]),  //上限
					ej = parseFloat(val[1]), //下限
					ps = parseFloat(val[2]);  //单价
				if (sj <= psjuli && ej <= psjuli) {
                    juliFee += ps * (ej-sj);
                    juliTxt += '<p><span>'+sj+'-'+ej+'公里时</span><em>每公里+'+ps+echoCurrency("short")+'</em></p>';
                }else if(sj <= psjuli && ej >= psjuli){
                    juliFee += (psjuli - sj) * ps;
                    juliTxt += '<p><span>'+sj+'-'+ej+'公里时</span><em>每公里+'+ps+echoCurrency("short")+'</em></p>';
                }
                if(ej < psjuli && index == (juliCalc.length-1)){
                    juliFee += (psjuli - ej) * ps;
                    juliTxt += '<p><span>'+sj+'公里以上时</span><em>每公里+'+ps+echoCurrency("short")+'</em></p>';
                }
			});
			
			$(".juliAdd dd").html(juliTxt);
			$('.ruleBox dl.juliAdd').addClass('show');
		}

		if(juliFee > 0){
			$('.priceBox .juliPrice').addClass('show');
			$('.priceBox .juliPrice em').text(juliFee.toFixed(2));
		}else{
			$('.priceBox .juliPrice').removeClass('show');
		}

		//特殊时段
		var addservicePrice = 0;
		var addserviceTxt = "" ;
		var choseTime = $('.right_time li.active span').text();
		if(speTimeCalc){
			for(var i = 0; i < speTimeCalc.length; i++){
				var start = Number(speTimeCalc[i][0].replace(":", "")), end = Number(speTimeCalc[i][1].replace(":", "")), pri = parseFloat(speTimeCalc[i][2]);
				if(choseTime){
					var choset = Number(choseTime.replace(":", ""));
					if(start < choset && end > choset && pri > 0){
						addservicePrice += pri;
					}
				}

				if(end > start){//计价规则填充
					addserviceTxt += '<p><span>'+speTimeCalc[i][0]+'-'+speTimeCalc[i][1]+'</span><em>+'+pri+echoCurrency("short")+'</em></p>';
				}

			}
			$(".speAdd dd").html(addserviceTxt)
			$('.ruleBox dl.speAdd').addClass('show');
		}
		if(addservicePrice > 0){
			$('.priceBox .spePrice').addClass('show');
			$('.priceBox .spePrice em').text(addservicePrice);
		}else{
			$('.priceBox .spePrice').removeClass('show');
		}

		//重量加价
		var zlPrice = 0,zlTxt='';
		var relweight = ($('.realWeight #weight').text())*1;
		if(weightCalc){
			//min-max 之间是price  然后每增加zjweight 费用增加fjprice;
			var minweight = weightCalc.minweight*1,
				maxweight = weightCalc.maxweight*1,
				weprice = weightCalc.price*1,
				zjweight = weightCalc.zjweight*1,
				fjprice = weightCalc.fjprice*1;
			if((relweight >=minweight) && (relweight <=maxweight)){//在min-max之间未超出
				zlPrice = weprice;
			}else if(relweight > maxweight){
				var overPrice = 0;
				if(zjweight>0){
				  overPrice = (((relweight - maxweight)/zjweight).toFixed(2)*fjprice).toFixed(2);
				}
				zlPrice = overPrice*1 + weprice;
			}
			zlTxt += '<p><span>'+minweight+'-'+maxweight+'公斤</span><em>+'+weprice+echoCurrency('short')+'</em></p>';
			zlTxt += '<p><span>'+maxweight+'-'+maxxWeight+'公斤部分</span><em>每'+(zjweight>1?zjweight:'')+'公斤+'+fjprice+echoCurrency('short')+'</em></p>';
			$(".weightAdd dd").html(zlTxt)
			$('.ruleBox dl.weightAdd').addClass('show');

		}

		if(zlPrice > 0){
			$('.priceBox .wePrice').addClass('show');
			$('.priceBox .wePrice em').text(zlPrice);
		}else{
			$('.priceBox .wePrice').removeClass('show');
		}

		var totalAmount = totalPrice + zlPrice + juliFee + addservicePrice + tipPrice*1 - hb*1;
		if(hasPoint > 0){
	      pathInit.check_integral(totalAmount);
	    }else{
	      $(".orderPrice strong").html(totalAmount.toFixed(2));
	    }



	}
	//积分抵扣
	,check_integral:function(allprice){

	    jifen_di = parseInt(jifen_ * allprice * pointRatio / 100 );
	    jifen_di = hasPoint <= jifen_di ? hasPoint * 1  : jifen_di;
	    jifen_di = Number(jifen_di);
	    jian = parseFloat((jifen_di / pointRatio ).toFixed(2));
	    $(".jfchose .jifen").html(parseFloat(jifen_di.toFixed(2))) ;
	    $(".jfchose .jian").html(parseFloat(jian.toFixed(2))) ;
	    $(".priceBox .jfPrice em").html(parseFloat(jian.toFixed(2))) ;

	    if(jifen_di == 0 || jian == 0){
	      $(".jfchose").hide()
	    }else{
            $(".jfchose").show()
        }
	    if($(".jfchose .jscheck").hasClass('hasgou')){
	    	$('#usePinput').val(1);
	      $(".orderPrice strong").html(parseFloat((allprice-jian).toFixed(2)));
	    }else{
	    	$('#usePinput').val(0);
	      $(".orderPrice strong").html(allprice.toFixed(2));

	    }
	}
}	

var paotui_songAddress = 'paotui_songAddress';
var songList = utils.getStorage(paotui_songAddress);
if(songList !=''){
	qhLng = songList.sQdrr.qhLng;
	qhLat = songList.sQdrr.qhLat;
	sqLng = songList.sAdrr.sqLng;
	sqLat = songList.sAdrr.sqLat;

	qhAdr = songList.sQdrr.qhAdr;
	qhDetail = songList.sQdrr.qhDetail;
	sqAdr = songList.sAdrr.sqAdr;
	sqDetail = songList.sAdrr.sqDetail;
	$('.shoptype .qhAddress').html(qhAdr);
    $('.shoptype .qhInfo').html(qhDetail);
    $('.shoptype .sqAddress').html(sqAdr);
    $('.shoptype .sqInfo').html(sqDetail);

}

if(qhLng && qhLat && sqLng && sqLat){

	pathInit.drawPath();
	
}

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
