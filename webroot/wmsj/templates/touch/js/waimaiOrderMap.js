
	function GetRequest() {  
	   var url = decodeURI(location.search); //获取url中"?"符后的字串  
	   var theRequest = new Object();  
	   if (url.indexOf("?") != -1) {  
	      var str = url.substr(1);  
	      strs = str.split("&");  
	      for(var i = 0; i < strs.length; i ++) {  
	         theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);  
	      }  
	   }  
	   return theRequest;  
	}  
	
	
	var detailInfo = JSON.parse(GetRequest().datainfo);
	var lnglat,slnglat,qslnglat,address,tel,custom,juliuser;
	var merchant_deliver = detailInfo.merchant_deliver;
	custom = detailInfo.username;  //顾客姓名
	address = detailInfo.address;  //顾客地址
	tel = detailInfo.tel;  //顾客地址
	lnglat = detailInfo.lnglat; //顾客坐标
	slnglat = detailInfo.slnglat; //店铺坐标
	juliuser =  detailInfo.juliuser; //店铺距离
	slng = slnglat.split(',')[0]
	slat = slnglat.split(',')[1]
	
	
	
	
	// 填入数据
	$(".bottomPop .topHead h2").html(custom+' <span> 尾号<em>'+tel.substr(tel.length-4)+'</em></span>');
	$(".bottomPop .topHead a").attr('href','tel:'+tel);
	$(".addrbox .address").html(address.split(' ')[0]);
	$(".addrbox p").html(address.split(' ')[1]);
	$(".addrbox .juli").html(juliuser);
	$(".toDaohang").attr('data-lnglat',lnglat)
	if(merchant_deliver == '0'){  //不是商家配送
		qslnglat = detailInfo.qslnglat; //骑手坐标	
	}else{
		setTimeout(function() {
			$(".bottomPop").addClass('showPop');
		},1000)
		qslnglat = '';
	}
	
	
	
	
	setTimeout(function(){
		if(site_map=='baidu'){
			baiduMap();
		}else if(site_map == 'amap'){
			console.log(slng)
			amapMap();
		}else if(site_map == 'google'){
			googleMap()
		}
	},500)
	
	$(".toDaohang").click(function(){
		daohang(lnglat.split(',')[0],lnglat.split(',')[1],custom,address)
	})
	
	// 显示百度地图
	function baiduMap(){
		map = new BMap.Map('map');
		map.clearOverlays();
		var labelStyle = {
			color: "#fff",
			borderWidth: "0",
			padding: "0",
			zIndex: "2",
			backgroundColor: "transparent",
			textAlign: "center",
			fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
		};
		map.centerAndZoom(new BMap.Point(slng, slat), 12);  //设置中心坐标
		var store = new BMap.Point(slng, slat);
		console.log(slng, slat)
		var bpoints = [];
		bpoints.push(store);
		function setZoom (bPoints) {
		     var view = map.getViewport(eval(bPoints));  
		        var mapZoom = view.zoom;   
		        var centerPoint = view.center;   
		        map.centerAndZoom(centerPoint,mapZoom);  
		}
		if(lnglat!=','&& lnglat!=''){
			var user = new BMap.Point(lnglat.split(',')[0], lnglat.split(',')[1]);
			var bLabel1 = new BMap.Label('<div  class="bubble wmshop"><div class="txt">顾客</div></div>', {
				  position: user,
				  offset: new BMap.Size(-30, -50)
				});
				bLabel1.setStyle(labelStyle);
				bLabel1.setZIndex(2);
				map.addOverlay(bLabel1);
				bpoints.push(user);
		}
		var bLabel2 = new BMap.Label('<div  class="bubble wmshop"><div class="txt">店铺</div></div>', {
			  position: store,
			  offset: new BMap.Size(-30, -50)
			});
			bLabel2.setStyle(labelStyle);
			bLabel2.setZIndex(2);
			map.addOverlay(bLabel2);
		if(qslnglat != ''){
			var courier = new BMap.Point(qslnglat.split(',')[1], qslnglat.split(',')[0]);
			bpoints.push(courier);
			var bLabel3 = new BMap.Label('<div  class="bubble wmshop"><div class="txt">骑手</div></div>', {
				  position: courier,
				  offset: new BMap.Size(-30, -50)
				});
				bLabel3.setStyle(labelStyle);
				bLabel3.setZIndex(2);
				map.addOverlay(bLabel3);
		}
		setTimeout(function(){
			setZoom(bpoints);
		}, 1000)
	}
	
	// 显示高德地图
	function amapMap(){
		 // 初始化地图
		 var bpoints = []
		map = new AMap.Map("map", {
			center: [slng, slat],
			zoom: 14
		});
		
		shopIcon = new AMap.Marker({
			position: [slng, slat],
			content: '<div  class="bubble wmshop"><div class="txt">店铺</div></div>',
			offset: new AMap.Pixel(-30, -50),
			map: map
		});
		bpoints.push(shopIcon)
		if(lnglat!=','&& lnglat!=''){
			userIcon = new AMap.Marker({
				position: [lnglat.split(',')[0]*1, lnglat.split(',')[1]*1],
				content: '<div  class="bubble wmshop"><div class="txt">顾客</div></div>',
				offset: new AMap.Pixel(-30, -50),
				map: map
			});
			bpoints.push(userIcon)
		}
		if(qslnglat!=''){
			qishouIcon = new AMap.Marker({
				position: [qslnglat.split(',')[1]*1, qslnglat.split(',')[0]*1],
				content: '<div  class="bubble wmshop"><div class="txt">骑手</div></div>',
				offset: new AMap.Pixel(-30, -50),
				map: map,
			});
			bpoints.push(qishouIcon)
			
		}
		map.setFitView(bpoints)
	}
	
	
	
	// 显示google地图
	function googleMap(){
	 	 
	 var map = new google.maps.Map(document.getElementById("map"), {
				zoom: 14,
				center: {
					lat: Number(slat),
					lng:  Number(slng)
				},
			   zoomControl: false,
			   mapTypeControl: false,
			   streetViewControl: false,
			   fullscreenControl: false
		   });
		var markers = [];
		var sposition = new google.maps.LatLng(Number(slat),Number(slng));
		var marker_shop  = new MarkerWithLabel({
		   position: sposition,
		   draggable: true,
		   map: map,
		   labelAnchor: new google.maps.Point(40, 50),
		   labelContent: '<div  class="bubble wmshop"><div class="txt">店铺</div></div>',//分钟内送达
		   icon:'/static/images/blank.gif',
		 });
		markers.push(marker_shop);
		if(lnglat!=',' && lnglat!=''){
			 var uposition = new google.maps.LatLng(Number(lnglat.split(',')[1]),Number(lnglat.split(',')[0]));
			 var marker_user  = new MarkerWithLabel({
			    position: uposition,
			    map: map,
			    labelAnchor: new google.maps.Point(28, 48),
			    labelContent: '<div  class="bubble wmshop"><div class="txt">顾客</div></div>',//分钟内送达
		        icon:'/static/images/blank.gif',
			    draggable: true,
			  });
			markers.push(marker_user)
		}
		  if(qslnglat!=''){
			  var cposition = new google.maps.LatLng(Number(qslnglat.split(',')[0]),Number(qslnglat.split(',')[1]));
			  var marker_qs  = new MarkerWithLabel({
			     position: cposition,
			     draggable: true,
			     map: map,
			     labelAnchor: new google.maps.Point(28, 48),
			     labelContent: '<div class="bubble wmshop"><div class="txt">骑手</div></div>',//分钟内送达
			     icon:'/static/images/blank.gif',
			   });
			  markers.push(marker_qs)
		  }

		  setVeiwPort();
		  function setVeiwPort() {
				var bounds = new google.maps.LatLngBounds();
				//读取标注点的位置坐标，加入LatLngBounds
				for(var i = 0;i < markers.length;i++){
					bounds.extend(markers[i].getPosition());
				}
				//调整map，使其适应LatLngBounds,实现展示最佳视野的功能
				map.fitBounds(bounds);
			};

	}
	
	// 导航
	function daohang(lng,lat,person,address){
		console.log(lng,lat,person,address)
		if (device.indexOf('huoniao_Android') > -1 || device.indexOf('huoniao_iOS') > -1) {
			setupWebViewJavascriptBridge(function(bridge) {
				 bridge.callHandler("skipAppDaohang", {
					"lat": lat,
					"lng": lng,
					"addrTitle": person,
					"addrDetail": address
				}, function(responseData) {});
			})
		}
	}