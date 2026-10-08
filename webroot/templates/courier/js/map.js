var route = 0; //首次进入渲染第一条路线
var map,blbale3 ;
var xhtime = 5000; //循环时间	
var interval;  //设置循环变量
var pageVue = new Vue({
	el: "#page",
	data:{
		btabs:[  
			{'name':'map_1','cn':langData['waimai'][10][27],'url':'/?service=waimai&do=courier&template=map&currentPageOpen=1'},   //'地图'
			{'name':'order','cn':langData['waimai'][2][54],'url':'/?service=waimai&do=courier&template=index&currentPageOpen=1'},  //'订单'
			{'name':'tongji','cn':langData['waimai'][10][29],'url':'/?service=waimai&do=courier&template=statistics&currentPageOpen=1'}, //'统计'
		],  //底部
		curTtab:'all',  //当前选中的订单类型
		ttabs:[
			{'cn':langData['waimai'][7][78],'name':"all"},    //全部
			{'cn':langData['waimai'][1][262],'name':"waimai"},    //外卖
			{'cn':langData['waimai'][2][53],'name':"paotui"},    //跑腿
			{'cn':langData['waimai'][10][37],'name':"shop"},    //商城
		],  //订单分类
		myPosition:{'lng':'','lat':''},
		posiArray:[],
		currRoute:route,
		rotation:0,
		firstLoad:1,
		loading:true,
	},
	
	
	mounted(){
		if(moduleList.indexOf('shop')==-1){
			$("#mapbox .tab_all li[data-type=shop]").remove()
		}
		if(moduleList.indexOf('waimai')==-1){
			$("#mapbox .tab_all li[data-type=waimai],#mapbox .tab_all li[data-type=paotui]").remove();
		}
		var tt = this;
		// 监听app传到变量
		setupWebViewJavascriptBridge(function(bridge) {
			  //获取方向
			 bridge.registerHandler("updateCourierLocation", function(data, responseCallback) {
				 var data = JSON.parse(data);
				 tt.rotation = data.rotation;
				 tt.myPosition = {'lng':data.lng,'lat':data.lat}
				 tt.changePosi()
			 });
			setTimeout(function(){
				tt.loading = false;
				tt.getList();
			},100)
		})
		
		
		if(site_map=='amap'){ 
			$('#mapbox').delegate('.bubble','click',function(){
				var t = $(this);
				var ii = t.attr('data-index');
				tt.amapMap(tt.myPosition,tt.posiArray,ii,tt.curTtab)
			})
		}


		// $("#map").on('touchstart',function(){
		// 	alert(111)
		// 	$("#page header").css({
		// 		'top':"-.72rem"
		// 	})
		// });
		// $("#map").on('touchend',function(){
		// 	$("#page header").css({
		// 		'top':".8rem"
		// 	})
		// })
		
	},
	methods:{
		baidu_Map:function(ps,arr,num,type){
			var tt = this;
			/* ps是骑手坐标  arr坐标数据 */
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
			map.centerAndZoom(new BMap.Point(ps.lng, ps.lat), 12);  //设置中心坐标
			$('.BMap_cpyCtrl').html('审图号GS(2023)3206号')
			setTimeout(() => {
				$('.BMap_cpyCtrl').html('审图号GS(2023)3206号')
			}, 200);
			var psmarker = new BMap.Point(ps.lng, ps.lat);
			var points = [];
			if(arr.length == 0) return false;
			arr.forEach(function(a,index){
				var clsshow = index==num?"show":"";
				var opciaty_ = index==num?"":"opciaty";
				var cls = a.state=='5'?"grey":"";  //已取订单加类名grey

				if(a.cattype=='waimai'){
					if(tt.curTtab=='all' || tt.curTtab == a.cattype){
						var shop = new BMap.Point(a.coordY, a.coordX);
						var user = new BMap.Point(a.lng, a.lat);
						points.push(shop);
						points.push(user);
						var txt1 = (index==num && a.state!='5')?'<em>'+langData['waimai'][10][53]+'</em>':a.state=='5'?"<em>"+langData['waimai'][10][54]+"</em>":"";// 待取  已取
						var txt2 = index==num?'<em>'+langData['waimai'][10][55]+'</em>':"";// 待收
						
						var bLabel = new BMap.Label('<div data-index="'+index+'" class="bubble wmshop '+opciaty_+' '+cls+'"><div class="txt">'+(index+1)+txt1+'</div><div class="bubble_tip "><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div></div>', {
						  position: shop,
						  offset: new BMap.Size(-35, -50)
						});
						var bLabel1 = new BMap.Label('<div data-index="'+index+'" class="bubble wmuser '+opciaty_+' "><div class="txt">'+(index+1)+txt2+'</div><div class="bubble_tip '+clsshow+'"><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div></div>', {
						  position: user,
						  offset: new BMap.Size(-35, -50)
						});
						bLabel.setStyle(labelStyle);
						map.addOverlay(bLabel);
						bLabel1.setStyle(labelStyle);
						map.addOverlay(bLabel1);
						bLabel.setZIndex(3)
						bLabel1.setZIndex(3)
						if(index == num){
							var riding2 = new BMap.RidingRoute(map, {
							    renderOptions: { 
							        map: map, 
							        autoViewport: true 
							    },
								onPolylinesSet:function(Route){
								  //当线条添加完成时调用
								  for(var i=0;i<Route.length;i++){
								  var polyline = Route[i].getPolyline();//获取线条遮挡物
									  polyline.setStrokeColor("#027CFF");//设置颜色
									  polyline.setStrokeWeight(5);//设置宽度
									  polyline.setStrokeOpacity(1);//设置透明度
									  // console.log(Route[i])
								  }
								},
								onMarkersSet:function(routes) {           
									 for (var i = 0; i <routes.length; i++) {
										//判断是否是途经点
										if(typeof(routes[i].Km)=="undefined"){
												map.removeOverlay(routes[i].marker); //删除起始默认图标
										}
									}
								}
							});
							
							riding2.search(shop,user);  //店铺
							bLabel.setZIndex(4)
							bLabel1.setZIndex(4) 
						}
						bLabel.addEventListener('click',function(ev){
							var t = $(ev.currentTarget.content)
							var ii =  t.attr('data-index')*1; //选择哪个订单
							tt.baidu_Map(tt.myPosition,tt.posiArray,ii,tt.curTtab)
						})
						bLabel1.addEventListener('click',function(ev){
							var t = $(ev.currentTarget.content)
							var ii =  t.attr('data-index')*1; //选择哪个订单
							
							//tt.baiduMap(tt.myPosition,tt.posiArray,ii)
							tt.baidu_Map(tt.myPosition,tt.posiArray,ii,tt.curTtab)
						})
						
					}
					
				}else if(a.cattype=='paotui'){
					if(tt.curTtab=='all' || tt.curTtab == a.cattype){
						var user = new BMap.Point(a.lng, a.lat);
						points.push(user);
						var html = a.delivery_time?'<div class="bubble_tip  '+opciaty_+'  '+clsshow+'"><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div>':'';
						var bLabel = new BMap.Label('<div data-index="'+index+'" class="bubble wmshop  '+opciaty_+'  '+cls+'"><div class="txt">'+(index+1)+(a.address1?a.address1:"")+'</div>'+html+'</div>', {
						  position: user,
						  offset: new BMap.Size(-30, -50)
						});
						bLabel.setStyle(labelStyle);
						bLabel.setZIndex(2);
						map.addOverlay(bLabel);
						if(index==num){
							var riding2 = new BMap.RidingRoute(map, {
							    renderOptions: { 
							        map: map, 
							        autoViewport: true 
							    },
								onPolylinesSet:function(Route){
								  //当线条添加完成时调用
								  for(var i=0;i<Route.length;i++){
								  var polyline = Route[i].getPolyline();//获取线条遮挡物
									  polyline.setStrokeColor("#027CFF");//设置颜色
									  polyline.setStrokeWeight(5);//设置宽度
									  polyline.setStrokeOpacity(1);//设置透明度
									  // console.log(Route[i])
								  }
								},
								onMarkersSet:function(routes) {           
									 for (var i = 0; i <routes.length; i++) {
										//判断是否是途经点
										if(typeof(routes[i].Km)=="undefined"){
												map.removeOverlay(routes[i].marker); //删除起始默认图标
										}
									}
								}
							});
						//	riding2.search(psmarker,user);  //店铺
							bLabel.setZIndex(4);
						}
						bLabel.addEventListener('click',function(ev){
							var t = $(ev.currentTarget.content)
							var ii =  t.attr('data-index')*1; //选择哪个订单
							tt.baidu_Map(tt.myPosition,tt.posiArray,ii,tt.curTtab)
						})
						
					}
					
				}else if(a.cattype=='shop'){
					if(tt.curTtab=='all' || tt.curTtab == a.cattype){
						var user = new BMap.Point(a.lng, a.lat);
						points.push(user);
						var html = a.delivery_time?'<div class="bubble_tip '+clsshow+'"><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div>':'';
						var bLabel = new BMap.Label('<div data-index="'+index+'" class="bubble shop  '+opciaty_+' '+cls+'"><div class="txt">'+(index+1)+langData['waimai'][10][37]+'</div>'+html+'</div>', {
						  position: user,
						  offset: new BMap.Size(-30, -50)
						});
						bLabel.setStyle(labelStyle);
						bLabel.setZIndex(2);
						map.addOverlay(bLabel);
						if(index==num){
							var riding2 = new BMap.RidingRoute(map, {
							    renderOptions: { 
							        map: map, 
							        autoViewport: true 
							    },
								onPolylinesSet:function(Route){
								  //当线条添加完成时调用
								  for(var i=0;i<Route.length;i++){
								  var polyline = Route[i].getPolyline();//获取线条遮挡物
									  polyline.setStrokeColor("#027CFF");//设置颜色
									  polyline.setStrokeWeight(5);//设置宽度
									  polyline.setStrokeOpacity(1);//设置透明度
									  // console.log(Route[i])
								  }
								},
								onMarkersSet:function(routes) {           
									 for (var i = 0; i <routes.length; i++) {
										//判断是否是途经点
										if(typeof(routes[i].Km)=="undefined"){
												map.removeOverlay(routes[i].marker); //删除起始默认图标
										}
									}
								}
							});
						//	riding2.search(psmarker,user);  //店铺
							bLabel.setZIndex(4);
						}
						bLabel.addEventListener('click',function(ev){
							var t = $(ev.currentTarget.content)
							var ii =  t.attr('data-index')*1; //选择哪个订单
							tt.baidu_Map(tt.myPosition,tt.posiArray,ii,tt.curTtab)
						})
						
					}

					
				}

			})
			
			var myIcon = new BMap.Icon(templets+"images/arr2.png", new BMap.Size(50,50));
			blbale3 = new BMap.Marker(ps,{icon:myIcon});  // 创建标注
			points.push(blbale3)
			map.addOverlay(blbale3);
			blbale3.setZIndex(1000);
			blbale3.setRotation(tt.rotation)
			// map.setviewportview(points);
			
		},
		// 定位
		// myLocation:function(){
		// 	var tt = this;
		// 	var localData = utils.getStorage('waimai_local');
		// 	if(localData != null){
		// 		var last = localData.time;
		// 	}else{
		// 		var last = 0;
		// 	}
		// 	var time = Date.parse(new Date());
		// 	HN_Location.init(function(data){
		// 		if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
		// 			alert('定位失败')
		// 		}else{
		// 			lng = data.lng;
		// 			lat = data.lat;
		// 			tt.myPosition = {'lng': lng,'lat':lat}
		// 			//精选品牌
		// 			utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address':name}));
		// 			// console.log(this.myPosition)
		// 		}
		// 	}, device.indexOf('huoniao') > -1 ? false : true);
			
		// },
		golink:function(){
			var el = event.currentTarget;
			var url =  $(el).attr('data-url');
			location.href = url;
		},
		getList:function(){
			var tt = this;
			if(tt.loading) return false;
			tt.loading = true;
			axios({
				method: 'post',
				url: '/include/ajax.php?service=waimai&action=mapOrder',
			})
			.then((response)=>{
				var data = response.data;
				tt.loading = false;	
				if(data.state == 100){
					tt.posiArray = data.info;
					if(site_map == 'baidu'){
						tt.baidu_Map(tt.myPosition,tt.posiArray,0);
					}else if(site_map == 'amap'){
						tt.amapMap(tt.myPosition,tt.posiArray,0);
					}else if(site_map == 'google'){
						tt.google_map(tt.myPosition,tt.posiArray,0);
					}
					if(tt.myPosition.lng == '' || tt.myPosition.lat == ''){
						tt.loading = true;
						tt.changecenter();
					}
					tt.changePosi();
					interval = setInterval(function(){
						if(tt.myPosition.lng != '' && tt.myPosition.lat != ''){
							tt.loading = false;
						}
						tt.changecenter()
					},xhtime);
					
				}else{
					tt.posiArray = [];
					if(tt.posiArray.length==0 && tt.firstLoad){
						showErr('您还没有订单，赶紧去抢单吧')
						tt.firstLoad = 0;
					}
					if(site_map == 'baidu'){
						tt.baidu_Map(tt.myPosition,tt.posiArray,0);
					}else if(site_map == 'amap'){
						tt.amapMap(tt.myPosition,tt.posiArray,0);
					}else if(site_map == 'google'){
						tt.google_map(tt.myPosition,tt.posiArray,0);
					}
					tt.changePosi();
					interval = setInterval(function(){
						// alert('444')
						tt.changecenter()
					},xhtime);
					tt.loading = false;
				}
			});
		},
		redraw:function(){
			var el = event.currentTarget;
			if(this.curTtab != $(el).attr('data-type')){
				var oftop =  $(el).position().top;
				$(el).parents('.type_tab').find('em').css('top',oftop)
				this.curTtab = $(el).attr('data-type');
				// this.myLocation();
				this.getList();
			}
		},
		changecenter:function(){
			var tt = this;
			if(site_map=="baidu"){
				map.removeOverlay(blbale3);
				var myIcon = new BMap.Icon(templets+"images/arr2.png", new BMap.Size(50,50));
				blbale3 = new BMap.Marker(tt.myPosition,{icon:myIcon});  // 创建标注
				map.addOverlay(blbale3);
				blbale3.setZIndex(1000);
				blbale3.setRotation(tt.rotation);
				map.panTo(new BMap.Point(tt.myPosition.lng, tt.myPosition.lat));
			}else if(site_map=="amap"){
				map.clearMap(blbale3)
				var html = '<div class="courier" ><span></span>';
				blbale3 = new AMap.Marker({
					position: [tt.myPosition.lng,tt.myPosition.lat],
					content: html,
					offset: new AMap.Pixel(-20, -38),
					map: map,
					zIndex:101,
					angle:tt.rotation,
				})
				 map.setCenter([tt.myPosition.lng,tt.myPosition.lat]); //设置地图中心点
			}else if(site_map=="google"){
				var cposition = new google.maps.LatLng(Number(tt.myPosition.lat),Number(tt.myPosition.lng));
				if(blbale3){blbale3.setMap(null);}
				blbale3  = new MarkerWithLabel({
				   position: cposition,
				   draggable: true,
				   map: map,
				   labelAnchor: new google.maps.Point(16, 28),
				   labelContent: html,
				   icon:'/static/images/blank.gif',
				   draggable: true,
				 });
				 map.setCenter(cposition); //设置地图中心点
			}
		},
		amapMap:function(ps,arr,num,type){
			var tt = this;
			map = new AMap.Map("map", {
				 center: [ps.lng, ps.lat],
				 zoom: 14
			});
			 
			if(arr.length == 0) return false;
			arr.forEach(function(a,index){
				var clsshow = index==num?"show":"";
				var ridingOption = {
					 policy: 1  
				};
				if(a.cattype=='waimai'){
					
					if(tt.curTtab=='all' || tt.curTtab == a.cattype){
						var cls = a.state=='5'?"grey":"";  //已取订单加类名grey
						var txt1 = (num==index && a.state!='5')?'<em>'+langData['waimai'][10][53]+'</em>':a.state=='5'?"<em>"+langData['waimai'][10][54]+"</em>":"";//待取   已取
						var txt2 = num==index ?'<em>'+langData['waimai'][10][55]+'</em>':"";//待收
						var markerContent1 = '<div data-index="'+index+'" class="bubble wmshop '+cls+'"><div class="txt">'+(index+1)+txt1+'</div><div class="bubble_tip "><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div></div>';//分钟内送达
						var markerContent2 = '<div data-index="'+index+'" class="bubble wmuser"><div class="txt">'+(index+1)+txt2+'</div><div class="bubble_tip '+clsshow+'"><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div></div>';//分钟内送达
						var riding1 = new AMap.Riding(ridingOption)
					
						if(index==num){
							riding1.search([a.coordY,a.coordX],[a.lng, a.lat], function(status, result) {
								 if (status === 'complete') {
									 if (result.routes && result.routes.length) {
										drawRoute(result.routes[0])
										  // log.success('绘制骑行路线完成')
									 }
								 }
							});
							function drawRoute(route){
								var path = parseRouteToPath(route)
								var startMarker,endMarker;
								startMarker = new AMap.Marker({
									position: path[0],
									content: markerContent1,
									// 以 icon 的 [center bottom] 为原点
									offset: new AMap.Pixel(-35, -48),
									map: map
								});
								endMarker = new AMap.Marker({
									position: path[path.length - 1],
									content: markerContent2,
									// 以 icon 的 [center bottom] 为原点
									offset: new AMap.Pixel(-35, -48),
									map: map
								})
								var routeLine = new AMap.Polyline({
									path: path,
									strokeWeight: 5,
									strokeColor: (type=="1"?'#F5B120':'#027CFF'),
									lineJoin: 'round'
								})
								routeLine.setMap(map)
								// 调整视野达到最佳显示区域
								map.setFitView([ startMarker, endMarker, routeLine ])
							}
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
						}else{
							var blabel1 = new AMap.Marker({
			                     map: map,
			                     content: '<div data-index="'+index+'" id="opciaty" class="bubble opciaty wmshop '+cls+'"><div class="txt">'+(index+1)+txt1+'</div><div class="bubble_tip "><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div></div>',//分钟内送达
			                     position: [a.coordY,a.coordX], //此处填写点标记的经纬度
			                     offset: new AMap.Pixel(-13, -22),
								 clickable: true
			               });
							var blabel2 = new AMap.Marker({
			                     map: map,
			                     content: '<div data-index="'+index+'" class="bubble opciaty wmuser"><div class="txt">'+(index+1)+txt2+'</div><div class="bubble_tip '+clsshow+'"><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div></div>',//分钟内送达
			                     position: [a.lng, a.lat], //此处填写点标记的经纬度
			                     offset: new AMap.Pixel(-13, -22),
								 clickable: true
			               });
						}
					}
				}else if(a.cattype=='paotui'){
					if(tt.curTtab=='all' || tt.curTtab == a.cattype){
						var cls = a.state=='5'?"grey":"";  //已取订单加类名grey
						var html = a.delivery_time?'<div class="bubble_tip '+clsshow+'"><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div>':'';//分钟内送达
						var markerContent1 = '<div data-index="'+index+'" class="bubble wmshop '+cls+'"><div class="txt">'+(index+1)+(a.address1?a.address1:"")+'</div>'+html+'</div>';
						var riding1 = new AMap.Riding(ridingOption);
						if(index==num){
							// riding1.search([tt.myPosition.lng,tt.myPosition.lat],[a.lng, a.lat], function(status, result) {
							// 	 if (status === 'complete') {
							// 		 if (result.routes && result.routes.length) {
							// 			drawRoute(result.routes[0])
							// 			  // log.success('绘制骑行路线完成')
							// 		 }
							// 	 }
							// });
							function drawRoute(route){
								var path = parseRouteToPath(route)
								var startMarker,endMarker;
								startMarker = new AMap.Marker({
									position: path[0],
									content: '<div></div>',
									// 以 icon 的 [center bottom] 为原点
									offset: new AMap.Pixel(-35, -48),
									map: map
								});
								endMarker = new AMap.Marker({
									position: path[path.length - 1],
									content: markerContent1,
									// 以 icon 的 [center bottom] 为原点
									offset: new AMap.Pixel(-35, -48),
									map: map
								})
								var routeLine = new AMap.Polyline({
									path: path,
									strokeWeight: 5,
									strokeColor: (type=="1"?'#F5B120':'#027CFF'),
									lineJoin: 'round'
								})
								routeLine.setMap(map)
								// 调整视野达到最佳显示区域
								map.setFitView([ startMarker, endMarker, routeLine ])
							}
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
						}else{
							var blabel2 = new AMap.Marker({
			                     map: map,
			                     content: '<div data-index="'+index+'" class="bubble opciaty wmuser"><div class="txt">'+(index+1)+'</div><div class="bubble_tip '+clsshow+'"><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div></div>',//分钟内  送达  
			                     position: [a.lng, a.lat], //此处填写点标记的经纬度
			                     offset: new AMap.Pixel(-13, -22),
								 clickable: true
			               });
						}
					}
				}else if(a.cattype=='shop'){
					if(tt.curTtab=='all' || tt.curTtab == a.cattype){
						var cls = a.state=='5'?"grey":"";  //已取订单加类名grey
						var html = a.delivery_time?'<div class="bubble_tip '+clsshow+'"><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div>':'';  //送达
						var markerContent1 = '<div data-index="'+index+'" class="bubble shop '+cls+'"><div class="txt">'+langData['waimai'][10][37]+'</div>'+html+'</div>';//商城
						var riding1 = new AMap.Riding(ridingOption);
						if(index==num){
							// riding1.search([tt.myPosition.lng,tt.myPosition.lat],[a.lng, a.lat], function(status, result) {
							// 	 if (status === 'complete') {
							// 		 if (result.routes && result.routes.length) {
							// 			drawRoute(result.routes[0])
							// 			  // log.success('绘制骑行路线完成')
							// 		 }
							// 	 }
							// });
							function drawRoute(route){
								var path = parseRouteToPath(route)
								var startMarker,endMarker;
								startMarker = new AMap.Marker({
									position: path[0],
									content: '<div class="courier"><span></span></div>',
									// 以 icon 的 [center bottom] 为原点
									offset: new AMap.Pixel(-35, -48),
									map: map
								});
								endMarker = new AMap.Marker({
									position: path[path.length - 1],
									content: markerContent1,
									// 以 icon 的 [center bottom] 为原点
									offset: new AMap.Pixel(-35, -48),
									map: map
								})
								var routeLine = new AMap.Polyline({
									path: path,
									strokeWeight: 5,
									strokeColor: (type=="1"?'#F5B120':'#027CFF'),
									lineJoin: 'round'
								})
								routeLine.setMap(map)
								// 调整视野达到最佳显示区域
								map.setFitView([ startMarker, endMarker, routeLine ])
							}
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
						}else{
							var blabel2 = new AMap.Marker({
			                     map: map,
			                     content: '<div data-index="'+index+'" class="bubble opciaty wmuser"><div class="txt">'+(index+1)+txt2+'</div><div class="bubble_tip '+clsshow+'"><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div></div>',//分钟内送达
			                     position: [a.lng, a.lat], //此处填写点标记的经纬度
			                     offset: new AMap.Pixel(-13, -22),
								 clickable: true
			               });
						}
					}
				}
			});
			map.clearMap(blbale3)
			var html = '<div class="courier" ><span></span>';
			blbale3 = new AMap.Marker({
				position: [tt.myPosition.lng,tt.myPosition.lat],
				content: html,
				offset: new AMap.Pixel(-20, -38),
				map: map,
				zIndex:101,
				angle:tt.rotation,
			})
			 map.setCenter([tt.myPosition.lng,tt.myPosition.lat]); //设置地图中心点
		},
		changePosi:function(){
			var tt = this;
			var html = '<div class="courier" ><span style="transform:rotate('+tt.rotation+'deg)"></span></div>';
			if(site_map == 'baidu'){
				var psmarker = new BMap.Point(tt.myPosition.lng, tt.myPosition.lat);
				if(blbale3){
					blbale3.setRotation(tt.rotation) 
				}else{
					var myIcon = new BMap.Icon(templets+"images/arr2.png", new BMap.Size(50,50));
					blbale3 = new BMap.Marker(tt.myPosition,{icon:myIcon});  // 创建标注
					// points.push(blbale3)
					map.addOverlay(blbale3);
					blbale3.setZIndex(1000);
					blbale3.setRotation(tt.rotation)
				}
				// map.panTo(new BMap.Point(tt.myPosition.lng, tt.myPosition.lat));
			}else if(site_map=='amap'){
				blbale3.setAngle(tt.rotation);
			}else if(site_map=='google'){
				var cposition = new google.maps.LatLng(Number(tt.myPosition.lat),Number(tt.myPosition.lng));
				if(blbale3){blbale3.setMap(null);}
				blbale3  = new MarkerWithLabel({
				   position: cposition,
				   draggable: true,
				   map: map,
				   labelAnchor: new google.maps.Point(16, 28),
				   labelContent: html,
				   icon:'/static/images/blank.gif',
				   draggable: true,
				 });
				// map.setCenter(cposition); //设置地图中心点
			}
		},
		google_map:function(ps,arr,num,type){
		   var tt = this;
		   map = new google.maps.Map(document.getElementById("map"), {
				zoom: 14,
				center: {
				lat: ps.lat,
				lng:  ps.lng
			},
		   zoomControl: false,
		   mapTypeControl: false,
		   streetViewControl: false,
		   fullscreenControl: false
		   });

		   if(arr.length == 0) return false;
		  arr.forEach(function(a,index){
			  var clsshow = index==num?"show":"";
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
			  if(a.cattype=='waimai'){
				  var sposition = new google.maps.LatLng(Number(a.coordX),Number(a.coordY));
				  var uposition = new google.maps.LatLng(Number(a.lat),Number(a.lng));
				  var cposition = new google.maps.LatLng(Number(ps.lat),Number(ps.lng));
				  var slnglat = {'lng':a.coordY,'lat':a.coordX};
				  var ulnglat = {'lng':a.lng,'lat':a.lat}
				if(tt.curTtab=='all' || tt.curTtab == a.cattype){
					var cls = a.state=='5'?"grey":"";  //已取订单加类名grey
					var txt1 = (num==index && a.state!='5')?'<em>'+langData['waimai'][10][53]+'</em>':a.state=='5'?"<em>"+langData['waimai'][10][54]+"</em>":"";//待取  已取
					var txt2 = num==index ?'<em>'+langData['waimai'][10][55]+'</em>':"";//待收
					var marker_get  = new MarkerWithLabel({
					   position: sposition,
					   draggable: true,
					   map: map,
					   labelAnchor: new google.maps.Point(40, 50),
					   labelContent: '<div data-index="'+index+'" class="bubble wmshop '+(index == num?"":"opciaty")+' '+cls+'"><div class="txt">'+(index+1)+txt1+'</div><div class="bubble_tip "><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div></div>',//分钟内送达
					    icon:'/static/images/blank.gif',
						 draggable: true,
					 });
					 var marker_send  = new MarkerWithLabel({
					    position: uposition,
					    draggable: true,
					    map: map,
					    labelAnchor: new google.maps.Point(28, 48),
					    labelContent: '<div data-index="'+index+'" class="bubble wmuser '+(index == num?"":"opciaty")+'"><div class="txt">'+(index+1)+txt2+'</div><div class="bubble_tip '+clsshow+'"><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div></div>',//分钟内送达
					      icon:'/static/images/blank.gif',
						  draggable: true,
					  });
					   const directionsService = new google.maps.DirectionsService();
					   const directionsRenderer = new google.maps.DirectionsRenderer();
					  if(index == num){
						  
						directionsRenderer.setOptions({
						    polylineOptions: {
						      strokeColor: '#027CFF'
						    },
						});
						 directionsRenderer.setMap(map);
						 calculateAndDisplayRoute(directionsService, directionsRenderer,slnglat,ulnglat);
						 
					  }else{
						 
						  google.maps.event.addListener(marker_send, "click", function () {
							ii = index;
						  	tt.google_map(tt.myPosition,tt.posiArray,ii,tt.curTtab)					   
						  })
						  google.maps.event.addListener(marker_get, "click", function () {
							  ii = index;
						  	tt.google_map(tt.myPosition,tt.posiArray,ii,tt.curTtab)					   
						  })
					  }
					  
				}
			  }else if(a.cattype=='paotui'){
				  var uposition = new google.maps.LatLng(Number(a.lat),Number(a.lng));
				  if(tt.curTtab=='all' || tt.curTtab == a.cattype){
					 var cls = a.state=='5'?"grey":"";  //已取订单加类名grey
					 var html = a.delivery_time?'<div class="bubble_tip '+clsshow+'"><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div>':'';//分钟内送达
					 var ulnglat = {'lng':a.lng,'lat':a.lat}
					 var marker_send  = new MarkerWithLabel({
					    position: uposition,
					    draggable: true,
					    map: map,
					    labelAnchor: new google.maps.Point(28, 48),
					    labelContent: '<div data-index="'+index+'" class="bubble wmshop '+(index == num?"":"opciaty")+' '+cls+'"><div class="txt">'+(index+1)+(a.address1?a.address1:"")+'</div>'+html+'</div>',
					     icon:'/static/images/blank.gif',
					 	  draggable: true,
					  });
					  const directionsService = new google.maps.DirectionsService();
					   const directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers:true  });
					  if(index == num){
						directionsRenderer.setOptions({
							polylineOptions: {
							  strokeColor: '#027CFF'
							},
						});
						// directionsRenderer.setMap(map);
						// calculateAndDisplayRoute(directionsService, directionsRenderer,tt.myposition,ulnglat);
					  						 
					  }else{
						  ii = index;
						  google.maps.event.addListener(marker_send, "click", function () {
							tt.google_map(tt.myPosition,tt.posiArray,ii,tt.curTtab)					   
						  })
						 //  google.maps.event.addListener(marker_get, "click", function () {
							// tt.google_map(tt.myPosition,tt.posiArray,ii,tt.curTtab)					   
						 //  })
					  }
				  }
			  }else if(a.cattype=='shop'){
				 if(tt.curTtab=='all' || tt.curTtab == a.cattype){
						 var cls = a.state=='5'?"grey":"";  //已取订单加类名grey
						 var html = a.delivery_time?'<div class="bubble_tip '+clsshow+'"><div class="bubble_time"><b>'+a.delivery_time+langData['waimai'][10][12]+' </b>'+langData['waimai'][10][13]+'</div></div>':'';//分钟内送达
						 var ulnglat = {'lng':a.lng,'lat':a.lat}
						 var marker_send  = new MarkerWithLabel({
							position: uposition,
							draggable: true,
							map: map,
							labelAnchor: new google.maps.Point(28, 48),
							labelContent: '<div data-index="'+index+'" class="bubble shop '+(index == num?"":"opciaty")+' '+cls+'"><div class="txt">'+(index+1)+'商城</div>'+html+'</div>',
							 icon:'/static/images/blank.gif',
							  draggable: true,
						  });
						  const directionsService = new google.maps.DirectionsService();
						   const directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers:true  });
						  if(index == num){
							directionsRenderer.setOptions({
								polylineOptions: {
								  strokeColor: '#027CFF'
								},
							});
							// directionsRenderer.setMap(map);
						//	 calculateAndDisplayRoute(directionsService, directionsRenderer,tt.myposition,ulnglat);
												 
						  }else{
							  ii = index;
							  google.maps.event.addListener(marker_send, "click", function () {
								tt.google_map(tt.myPosition,tt.posiArray,ii,tt.curTtab)					   
							  })
							 //  google.maps.event.addListener(marker_get, "click", function () {
								// tt.google_map(tt.myPosition,tt.posiArray,ii,tt.curTtab)					   
							 //  })
						  }
	 }
			  }
		  })
			
		},
	},
	watch:{
		currRoute:function(){
			console.log(this.currRoute)
		}
	}
		
	
	
});




var showErrTimer;
function showErr(data) {
	showErrTimer && clearTimeout(showErrTimer);
	$(".popErr").remove();
	$("body").append('<div class="popErr"><p>' + data + '</p></div>');
	$(".popErr p").css({
		"margin-left": -$(".popErr p").width() / 2,
		"left": "50%"
	});
	$(".popErr").css({
		"visibility": "visible"
	});
	showErrTimer = setTimeout(function() {
		$(".popErr").fadeOut(300, function() {
			$(this).remove();
		});
	}, 1500);
 }