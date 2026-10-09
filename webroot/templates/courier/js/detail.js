var map;  //地图
var qishouIcon,shopIcon,userIcon;  //骑手坐标  店铺图标   顾客坐标

var directionsService,directionsService1,directionsRenderer,directionsRenderer1; //谷歌地图规划路线专用

var labelStyle = {
	   color: "#fff",
	   borderWidth: "0",
	   padding: "0",
	   zIndex: "2",
	   backgroundColor: "transparent",
	   textAlign: "center",
	   fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
	 }
var riding1,riding2; //两条线路
 var routeLine, routeLine1; //高德地图专用
var xhtime = 5000; //循环时间
var interval;  //设置循环变量
$.fn.scrollTo =function(options){
        var defaults = {
            toT : 0, //滚动目标位置
            durTime : 0, //过渡动画时间
            delay : 30, //定时器时间
            callback:null //回调函数
        };
        var opts = $.extend(defaults,options),
            timer = null,
            _this = this,
            curTop = _this.scrollTop(),//滚动条当前的位置
            subTop = opts.toT - curTop, //滚动条目标位置和当前位置的差值
            index = 0,
            dur = Math.round(opts.durTime / opts.delay),
            smoothScroll = function(t){
                index++;
                var per = Math.round(subTop/dur);
                if(index >= dur){
                    _this.scrollTop(t);
                    window.clearInterval(timer);
                    if(opts.callback && typeof opts.callback == 'function'){
                        opts.callback();
                    }
                    return;
                }else{
                    _this.scrollTop(curTop + index*per);
                }
            };
        timer = window.setInterval(function(){
            smoothScroll(opts.toT);
        }, opts.delay);
        return _this;
    };
orderFinished = Number(orderFinished)
order_chaoshi = Number(order_chaoshi)
var alertmodel = {
	props:['msg','tit','btn'],
	template:`
	<div class="alertbox">
		<div :class="['alert_con',{'more_h':$root.ifinp}]">
			<h3 v-html="tit" v-if="tit"></h3>
			<p :class="$root.alerttip">{{msg}}</p>
			<div class="inpbox" v-if="$root.ifinp"><input id="code" placeholder="输入收货码" type="text"></div>
		</div>
		<div class="btns"><button v-for="b in btn" type="button" :data-type="b.type" :class="b.type" @click="btn_click" :data-state="b.state">{{b.cn}}</button></div>
	</div>
	`,
	created(){
	},
	methods:{
		btn_click:function(){
			var el = event.currentTarget;
			var type = $(el).attr('data-type');
			if(type=="sure"){
				if($("#code").val()==''){
					showErr('请输入收货码');
					return false;
				}
				this.$root.quhuo_sure($("#code").val());
			}else if(type="reset" || type=='cancel'){
				this.$root.mash_show = !this.$root.mash_show ;
			}
		}
	}
}






new Vue({
	el:'#pagebox',
	data:{
		bottomfixed:false,  //底部
		top_fixed:false,
		order_finished: orderFinished , //订单结束
		order_chaoshi:order_chaoshi,
		orderTop:orderTop*1, //没有地图
		order_note: ordernote?true:false,
		ps_lnglat:{'lng':'','lat':''},  //配送员坐标
		mash_show:false,
		alertit:'',
		alertmsg:'',
		alerttip:'',
		btns:'',
		ifinp:'',
		orderNum:ordernum.split("-")[1],
		tostoredate:tostoredate,
		rotation:0 ,//旋转角度
		mapshow:1  ,//是否是第一次打开地图
		detailstate : state,
		psIncome:psIncome, // 配送费
		addition:addition,  //加成
	},
	created(){
		if(!this.order_finished && this.orderTop){
			this.bottomfixed = true;
			this.top_fixed = false;
		}else{
			this.bottomfixed = false;
			this.top_fixed = true;
		}
		if(!this.order_finished && this.orderTop){
			this.rechange();
		}
	},
	components:{
		'alert-model':alertmodel,

	},
	mounted(){
		
		if(!this.order_finished && this.orderTop){
			var tt = this;

			$(".page_detail").css('margin-top',($(".btn_box").offset().top-$(".order_head").height()) - $(".addTip").height() +'px');

			// var toT = $(window).height()-$(".page_detail").offset().top + $(".btn_box").height() - $(".addTip").height()*2;

			var toT = $(".orderInfo").height() - $(".btn_box").height();
			$("html,body").scrollTo({toT})
			// var hh = ($(".top_show").height()-$(".reset_map").height())+20;
			var hh = ($(".top_show").height())+20;
			var bh = $(".bottom_group").height();
			var wh =  $(window).height()
			var tt = this;
			var resetBoxH = $(".top_show").height()
			$('body').append('<div class="mapbtnbox"></div>');
			$('body').scroll(function(){
				// console.log($(".resetBox").offset().top)
				if($(".reset_map").length > 0 ){
					if($(".orderInfo").offset().top <= 400){
					  var oft = $(".orderInfo").offset().top;
						if($(".mapbtnbox .reset_map").length == 0){
							$(".mapbtnbox").html($(".reset_map"))
										   .css({
										   		'position':'fixed',
										   		'top':(oft - resetBoxH)+'px',
										   		'left':'.15rem',
										   		'z-index':1,
											})
						}else{
							$(".resetBox").html('')
						}
					}else{
						if($(".resetBox .reset_map").length == 0){
							$(".resetBox").html($(".reset_map"))
						}else{
							$(".mapbtnbox").html('')
						}
					}


				}

				if(!tt.order_finished && tt.orderTop){
					var ofTop = $(".page_detail").offset().top;
					if(ofTop <= (hh+10) ){
						tt.top_fixed = true;
					}else{
						tt.top_fixed = false;
					}
					if(ofTop+bh+10 >= wh){
						tt.bottomfixed = true;
					}else{
						tt.bottomfixed = false;
					}

				}

			});
			// 监听app传到变量
			setupWebViewJavascriptBridge(function(bridge) {
				  //获取方向
				 bridge.registerHandler("updateCourierLocation", function(data, responseCallback) {
					 var data = JSON.parse(data);
					 tt.rotation = data.rotation;
					 tt.ps_lnglat = {'lng':data.lng,'lat':data.lat}
					 if(tt.mapshow){

					 	tt.map_show(shoplnglat,userlnglat,tt.ps_lnglat);  //首次进入地图时
					 }else{

						 tt.change_direction(); //更改骑手坐标
					 }
				 });
			})
		}

	},
	methods:{
		change_fixed:function(){
			 this.bottomfixed = false;
		},
		map_show:function(slnglat,ulnglat,pslnglat){ //店铺坐标  用户坐标  骑手坐标
			var qishou = {"lng":pslnglat.lng,"lat":pslnglat.lat} ;  //骑手坐标
			 slnglat = {"lng":Number(slnglat.lng),"lat":Number(slnglat.lat)}
			 ulnglat = {"lng":Number(ulnglat.lng),"lat":Number(ulnglat.lat)}
			var tt = this;
			if (site_map == "baidu") {
				map = new BMap.Map('map');
				// map.centerAndZoom(new BMap.Point(pslnglat.lng, pslnglat.lat), 14);
				// qishouIcon = new BMap.Label('<div class="courier" ><div class="bubble_tip"><div class="juli_tip">距取货点1.1km</div></div><span style="transform:rotate('+tt.rotation+'deg)"></span></div>', {
				//    position: qishou,
				//    offset: new BMap.Size(-20, -30)
				// });
				var myIcon = new BMap.Icon(templets+"images/arr2.png", new BMap.Size(50,50));
				qishouIcon = new BMap.Marker(qishou,{icon:myIcon});  // 创建标注
				shopIcon = new BMap.Label('<div class="bubble shop"><span class="bg_bub"><em>取</em></span></div>', {
				  position: slnglat,
				  offset: new BMap.Size(-20, -50),
				});
				userIcon = new BMap.Label('<div class="bubble user"><span class="bg_bub"><em>收</em></span></div>', {
				  position: ulnglat,
				  offset: new BMap.Size(-20, -50),
				});
				// 图标中只有骑手坐标会改变 可能需要重画
				//qishouIcon.setStyle(labelStyle);
				shopIcon.setStyle(labelStyle);
				userIcon.setStyle(labelStyle);
				map.addOverlay(userIcon);
				map.addOverlay(qishouIcon);
				qishouIcon.setRotation(tt.rotation)
				map.addOverlay(shopIcon);
				map.centerAndZoom(new BMap.Point(qishou.lng, qishou.lat),14);

				setupWebViewJavascriptBridge(function(bridge) {
					shopIcon.addEventListener('click',function(ev){
						bridge.callHandler("skipAppDaohang", {
							"lat": shopainfo.lat,
							"lng": shopainfo.lng,
							"addrTitle": shopainfo.title,
							"addrDetail": shopainfo.address
						}, function(responseData) {});
					})
					userIcon.addEventListener('click',function(ev){
						bridge.callHandler("skipAppDaohang", {
							"lat": userainfo.lat,
							"lng": userainfo.lng,
							"addrTitle": userainfo.title,
							"addrDetail": userainfo.address
						}, function(responseData) {});
					});

					$('.order_start,.order_end').click(function(e){
						var t = $(this);
						if(e.target._prevClass != 'telPhone'){
							if(t.hasClass('order_start')){
								bridge.callHandler("skipAppDaohang", {
									"lat": shopainfo.lat,
									"lng": shopainfo.lng,
									"addrTitle": shopainfo.title,
									"addrDetail": shopainfo.address
								}, function(responseData) {});
							}else{
								bridge.callHandler("skipAppDaohang", {
									"lat": userainfo.lat,
									"lng": userainfo.lng,
									"addrTitle": userainfo.title || userainfo.address ,
									"addrDetail": userainfo.address
								}, function(responseData) {});
							}
						}
					})
				});
				// 开始划线
				qs = new BMap.Point(qishou.lng, qishou.lat);
				shop = new BMap.Point(slnglat.lng, slnglat.lat);  //店铺坐标
				user = new BMap.Point(ulnglat.lng, ulnglat.lat);  //顾客坐标
				riding1 = new BMap.RidingRoute(map, {
				    renderOptions: {
				        map: map,
				        autoViewport: tt.mapshow,  //只有第一次需要调整最适合的视野
				    },
					onPolylinesSet:function(Route){
					  //当线条添加完成时调用
					  for(var i=0;i<Route.length;i++){
					  var polyline = Route[i].getPolyline();//获取线条遮挡物
						  polyline.setStrokeColor("#F5B120");//设置颜色
						  polyline.setStrokeWeight(3);//设置宽度
						  polyline.setStrokeOpacity(1);//设置透明度
						  // console.log(Route[i])
					  }
					},
					onMarkersSet:function(routes) {
						 for (var i = 0; i <routes.length; i++) {
							// 判断是否是途经点
							if(typeof(routes[i].Km)=="undefined"){
									map.removeOverlay(routes[i].marker); //删除起始默认图标
							}
							// console.log(routes)
						}
					}
				});
				riding2 = new BMap.RidingRoute(map, {
					renderOptions: {
						map: map,
						autoViewport: tt.mapshow,
					},
					onPolylinesSet:function(Route){
					  //当线条添加完成时调用
					  for(var i=0;i<Route.length;i++){
					  var polyline = Route[i].getPolyline();//获取线条遮挡物
						  polyline.setStrokeColor("#027CFF");//设置颜色
						  polyline.setStrokeWeight(3);//设置宽度
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
				if(state==4 && (slnglat.lng != '' || slnglat.lat != '')){
					console.log('取货状态,有店铺坐标')
					riding1.search(shop,user);  //店铺~顾客
					riding2.search(qs,shop);  //店铺~顾客
				}else{
					console.log('配送状态,没有店铺坐标')
					riding1.search(qs,user);  //店铺~顾客
				}

				map.addEventListener("dragstart", function(evt){
					clearInterval(interval);
					xhtime = 10000;
					interval = setInterval(function(){
						tt.change_qishou(slnglat,ulnglat,tt.ps_lnglat)
					},xhtime);
				});

				map.addEventListener("dragend", function(evt){
					clearInterval(interval);
					xhtime = 5000;
					interval = setInterval(function(){
						tt.change_qishou(slnglat,ulnglat,tt.ps_lnglat)
					},xhtime);
				});
			 } else if(site_map =='amap'){
				 // 初始化地图
				map = new AMap.Map("map", {
					center: [qishou.lng, qishou.lat],
					zoom: 14
				});
				qishouIcon = new AMap.Marker({
					position: [pslnglat.lng,pslnglat.lat],
					content: '<div class="courier"><span style="transform:rotate('+tt.rotation+'deg)"></span></div>',
					offset: new AMap.Pixel(-20, -30),
					map: map,
					angle:tt.rotation,
				});

				shopIcon = new AMap.Marker({
					position: [slnglat.lng,slnglat.lat],
					content: '<div class="bubble shop"><span class="bg_bub"><em>取</em></span></div>',
					offset: new AMap.Pixel(-15, -50),
					map: map
				});
				userIcon = new AMap.Marker({
					position: [ulnglat.lng,ulnglat.lat],
					content: '<div class="bubble user"><span class="bg_bub"><em>收</em></span></div>',
					offset: new AMap.Pixel(-15, -50),
					map: map
				});

				setupWebViewJavascriptBridge(function(bridge) {
					shopIcon.on('click',function(ev){

						bridge.callHandler("skipAppDaohang", {
							"lat": shopainfo.lat,
							"lng": shopainfo.lng,
							"addrTitle": shopainfo.title,
							"addrDetail": shopainfo.address
						}, function(responseData) {});
					})
					userIcon.on('click',function(ev){

						bridge.callHandler("skipAppDaohang", {
							"lat": userainfo.lat,
							"lng": userainfo.lng,
							"addrTitle": userainfo.title,
							"addrDetail": userainfo.address
						}, function(responseData) {});
					});
				});

				var ridingOption = {
						policy: 1
					}
				if(state == 4 && (slnglat.lng != '' || slnglat.lat != '')){ //没取货，有店铺坐标
					riding1 = new AMap.Riding(ridingOption);
					riding2 = new AMap.Riding(ridingOption);
					riding1.search([qishou.lng, qishou.lat],[slnglat.lng, slnglat.lat], function(status, result) {
						if (status === 'complete') {
							if (result.routes && result.routes.length) {
								drawRoute("",result.routes[0])
								// log.success('绘制骑行路线完成')
							}
						}
					});
					riding2.search([slnglat.lng, slnglat.lat],[ulnglat.lng, ulnglat.lat], function(status, result) {
						if (status === 'complete') {
							if (result.routes && result.routes.length) {
								drawRoute("1",result.routes[0])
								// log.success('绘制骑行路线完成')
							}
						}
					});
				}else{
					riding2 = new AMap.Riding(ridingOption);
					riding2.search([qishou.lng, qishou.lat],[ulnglat.lng, ulnglat.lat], function(status, result) {
						if (status === 'complete') {
							if (result.routes && result.routes.length) {
								drawRoute("",result.routes[0])
							}
						}
					});
				}
				 map.on('dragstart', function(){
					 clearInterval(interval);
					 xhtime = 10000;
					 interval = setInterval(function(){
					 	tt.change_qishou(slnglat,ulnglat,tt.ps_lnglat)
					 },xhtime);
				 });
				 map.on('dragend', function(){
					 clearInterval(interval);
					 xhtime = 5000;
					 interval = setInterval(function(){
						tt.change_qishou(slnglat,ulnglat,tt.ps_lnglat)
					 },xhtime);
				 });

			 }else if(site_map=='google'){
				 // 初始化地图
				 map = new google.maps.Map(document.getElementById("map"), {
					   zoom: 14,
					   center: {
						 lat: qishou.lat,
						 lng: qishou.lng
					   },
					   zoomControl: false,
					   mapTypeControl: false,
					   streetViewControl: false,
					   fullscreenControl: false
				});
				sposition = new google.maps.LatLng(Number(slnglat.lat),Number(slnglat.lng));
				uposition = new google.maps.LatLng(Number(ulnglat.lat),Number(ulnglat.lng));
				cposition = new google.maps.LatLng(Number(qishou.lat),Number(qishou.lng));

				directionsService = new google.maps.DirectionsService();
				directionsService1 = new google.maps.DirectionsService();
				directionsRenderer = new google.maps.DirectionsRenderer({
					suppressMarkers:true  ,
				});
				directionsRenderer1 = new google.maps.DirectionsRenderer({
					suppressMarkers:true  ,
				});
				shopIcon  = new MarkerWithLabel({
				   position: sposition,
				   draggable: true,
				   map: map,
				   labelAnchor: new google.maps.Point(20, 52),
				   labelContent: '<div class="bubble shop"><span class="bg_bub"><em>取</em></span></div>',
					icon:'/static/images/blank.gif',
				 });
				userIcon = new MarkerWithLabel({
					position: uposition,
					draggable: true,
					map: map,
					labelAnchor: new google.maps.Point(20, 52),
					labelContent: '<div class="bubble user"><span class="bg_bub"><em>收</em></span></div>',
					icon:'/static/images/blank.gif',
				  });
				qishouIcon = new MarkerWithLabel({
				   position: cposition,
				   draggable: true,
				   map: map,
				   labelAnchor: new google.maps.Point(16, 28),
				   labelContent: '<div class="courier"><span style="transform:rotate('+tt.rotation+'deg)"></span></div>',
				   icon:'/static/images/blank.gif',
				 });


				 if(state==4 && (slnglat.lng!='' ||slnglat.latg!='')){
					 directionsRenderer.setOptions({
						polylineOptions: {
						  strokeColor: '#F5B120'
						}
					});
					directionsRenderer1.setOptions({
						polylineOptions: {
						   strokeColor: '#027CFF'
						},
					});

					directionsRenderer.setMap(map);
					calculateAndDisplayRoute(directionsService, directionsRenderer,slnglat,ulnglat);
					directionsRenderer1.setMap(map);
					calculateAndDisplayRoute(directionsService1, directionsRenderer1,qishou,slnglat);
				 }else{
					 directionsRenderer.setOptions({
					 	polylineOptions: {
					 	  strokeColor: '#F5B120'
					 	}
					 });
					 directionsRenderer.setMap(map);
					 calculateAndDisplayRoute(directionsService, directionsRenderer,qishou,ulnglat);
				 }

				google.maps.event.addListener(map,"dragstart",function(event){
				    clearInterval(interval);
					xhtime = 10000;
					interval = setInterval(function(){
						tt.change_qishou(slnglat,ulnglat,tt.ps_lnglat)
					},xhtime)
				});
				google.maps.event.addListener(map,"dragend",function(event){
				    clearInterval(interval);
					xhtime = 5000;
					interval = setInterval(function(){
						tt.change_qishou(slnglat,ulnglat,tt.ps_lnglat)
					},xhtime);
				});

				setupWebViewJavascriptBridge(function(bridge) {
					google.maps.event.addListener(shopIcon,'click',function(ev){

						bridge.callHandler("skipAppDaohang", {
							"lat": shopainfo.lat,
							"lng": shopainfo.lng,
							"addrTitle": shopainfo.title,
							"addrDetail": shopainfo.address
						}, function(responseData) {});
					})
					google.maps.event.addListener(userIcon,'click',function(ev){

						bridge.callHandler("skipAppDaohang", {
							"lat": userainfo.lat,
							"lng": userainfo.lng,
							"addrTitle": userainfo.title,
							"addrDetail": userainfo.address
						}, function(responseData) {});
					});
				});
			 }
			tt.mapshow = 0;
			interval = setInterval(function(){
				tt.change_qishou(slnglat,ulnglat,tt.ps_lnglat)
			},xhtime);
		},
		change_qishou:function(slnglat,ulnglat,pslnglat){  //更改路线
			var tt = this;
			if(site_map =='baidu'){
				var qs = new BMap.Point(pslnglat.lng, pslnglat.lat);
				var shop = new BMap.Point(slnglat.lng, slnglat.lat);  //店铺坐标
				var user = new BMap.Point(ulnglat.lng, ulnglat.lat);  //顾客坐标
				if(state==4 && (slnglat.lng != '' || slnglat.lat != '')){
					riding1.disableAutoViewport();
					riding1.clearResults();
					riding1.search(shop,user);  //店铺~顾客

					riding2.disableAutoViewport()
					riding2.clearResults();
				    riding2.search(qs,shop);  //店铺~顾客

				}else{
					riding1.disableAutoViewport()
					riding1.clearResults();
					riding1.search(qs,user);  //店铺~顾客
				}
				map.removeOverlay(qishouIcon);
				// qishouIcon = new BMap.Label('<div class="courier" ><div class="bubble_tip"><div class="juli_tip">距取货点1.1km</div></div><span style="transform:rotate('+tt.rotation+'deg)"></span></div>', {
				//    position: pslnglat,
				//    offset: new BMap.Size(-20, -30)
				// });
				// qishouIcon.setStyle(labelStyle);
				var myIcon = new BMap.Icon(templets+"images/arr2.png", new BMap.Size(50,50));
				qishouIcon = new BMap.Marker(pslnglat,{icon:myIcon});  // 创建标注
				map.addOverlay(qishouIcon);
				qishouIcon.setRotation(tt.rotation)
				map.panTo(new BMap.Point(pslnglat.lng, pslnglat.lat));

			}else if(site_map=='amap'){
				map.remove(qishouIcon);
				qs = new AMap.LngLat(pslnglat.lng, pslnglat.lat);
				// style="transform:rotate('+tt.rotation+'deg)
				qishouIcon = new AMap.Marker({
					position: [pslnglat.lng,pslnglat.lat],
					content: '<div class="courier"><span></span></div>',
					offset: new AMap.Pixel(-20, -30),
					map: map,
					angle:tt.rotation,
				});
				var ridingOption = {
					policy: 1  ,
					autoFitView:0,
				}
				if(state==4 && (slnglat.lng != '' || slnglat.lat != '')){
					riding1.search([pslnglat.lng, pslnglat.lat],[slnglat.lng, slnglat.lat], function(status, result) {
						if (status === 'complete') {
							if (result.routes && result.routes.length) {
								drawRoute("",result.routes[0])
								// log.success('绘制骑行路线完成')
							}
						}
					});

				}else{
					riding2.search([pslnglat.lng, pslnglat.lat],[ulnglat.lng, ulnglat.lat], function(status, result) {
						if (status === 'complete') {
							if (result.routes && result.routes.length) {
								drawRoute("",result.routes[0])
								// log.success('绘制骑行路线完成')
							}
						}
					});
				}
				map.setCenter(qs);
			}else if(site_map == 'google'){
				cposition = new google.maps.LatLng(Number(pslnglat.lat),Number(pslnglat.lng));
				qishouIcon.setMap(null);
				qishouIcon = new MarkerWithLabel({
				   position: cposition,
				   draggable: true,
				   map: map,
				   labelAnchor: new google.maps.Point(16, 28),
				   labelContent: '<div class="courier"><span style="transform:rotate('+tt.rotation+'deg)"></span></div>',
				   icon:'/static/images/blank.gif',
				 });

				 if(state==4 && (slnglat.lng != '' || slnglat.lat != '')){
					directionsRenderer1.setMap(null);
					directionsRenderer1 = new google.maps.DirectionsRenderer({
						suppressMarkers:true  ,
					});
				 	directionsRenderer1.setOptions({
				 		polylineOptions: {
				 		   strokeColor: '#027CFF'
				 		},
				 	});
				 	directionsRenderer1.setMap(map);
				 	calculateAndDisplayRoute(directionsService1, directionsRenderer1,pslnglat,slnglat);
				 }else{
				 	directionsRenderer.setMap(null);
				 	directionsRenderer = new google.maps.DirectionsRenderer({
				 		suppressMarkers:true  ,
				 	});
				 	directionsRenderer.setOptions({
				 		polylineOptions: {
				 		   strokeColor: '#F5B120'
				 		},
				 	});
				 	directionsRenderer1.setMap(map);
				 	calculateAndDisplayRoute(directionsService1, directionsRenderer1,pslnglat,ulnglat);
				 }
			}
		},
		change_direction:function(){
			var tt = this;
			if(site_map=='baidu'){
				// map.removeOverlay(qishouIcon);
				// qishouIcon = new BMap.Label('<div class="courier" ><div class="bubble_tip"><div class="juli_tip">距取货点1.1km</div></div><span style="transform:rotate('+tt.rotation+'deg)"></span></div>', {
				//    position: pslnglat,
				//    offset: new BMap.Size(-20, -30)
				// });
				// qishouIcon.setStyle(labelStyle);
				// map.addOverlay(qishouIcon);
				qishouIcon.setRotation(tt.rotation)
				// map.panTo(new BMap.Point(tt.ps_lnglat.lng, tt.ps_lnglat.lat));
			}else if(site_map=='amap'){
				// var qs = new AMap.LngLat(tt.ps_lnglat.lng, tt.ps_lnglat.lat);
				qishouIcon.setAngle(tt.rotation)
				// map.setCenter(qs);
			}else if(site_map == 'google'){
				cposition = new google.maps.LatLng(Number(tt.ps_lnglat.lat),Number(tt.ps_lnglat.lng));
				qishouIcon.setMap(null);
				qishouIcon = new MarkerWithLabel({
				   position: cposition,
				   draggable: true,
				   map: map,
				   labelAnchor: new google.maps.Point(16, 28),
				   labelContent: '<div class="courier"><span style="transform:rotate('+tt.rotation+'deg)"></span></div>',
				   icon:'/static/images/blank.gif',
				 });
			}
		},
		rechange:function(){
			var tt = this;
			setupWebViewJavascriptBridge(function(bridge) {
			    bridge.callHandler("getGeocoder", {}, function(responseData){
					var data = JSON.parse(responseData)
					tt.ps_lnglat = {'lng':data.lng,'lat':data.lat};
					tt.rotation = data.rotation;
					if(tt.mapshow){
						tt.map_show(shoplnglat,userlnglat,tt.ps_lnglat)
					}else{
						map.panTo(new BMap.Point(tt.ps_lnglat.lng, tt.ps_lnglat.lat));
					}
					let param = new URLSearchParams();
						param.append('lng', data.lng)
						param.append('lat', data.lat)
						param.append('rotation', data.rotation)
						param.append('uid', $.cookie("HN_courier"));

					axios({
						method: 'post',
						url: '/include/ajax.php?service=waimai&action=updateCourierLocation',
						data: param,
					})
					.then((response)=>{
						console.log(response)
					});
			    });
			});

		},
		quhuo_sure:function(code){
			var tt = this;
			var el = event.currentTarget;
			var tstate = $(el).attr('data-state');
			var otype = $(el).attr('data-type');  //订单类型
			// alert(JSON.stringify(tt.ps_lnglat))
			console.log(state)
			if(otype=='paotui' && state==5){ //帮买和帮送
				var ttype = $(el).attr('data-pt');  //1 帮买   2帮送
				tt.mash_show = true;
				if(ttype == '1' || (customIsopencode!='1' && ttype == '2')){
					tt.alertit = '请先确保买家已将货款结清</br>再确认送达';
					tt.btns=[{'type':'reset','state':0,'cn':langData['waimai'][2][43]},{'type':'sure','state':'1','cn':'确认送达'}];
				}else{
					tt.alertmsg = '请向收货人索要收货码以确认送达';
					tt.ifinp = true;
					tt.alerttip = 'showtip'
					tt.btns=[{'type':'reset','state':0,'cn':langData['waimai'][2][43]},{'type':'sure','state':'1','cn':'确认送达'}];
				}
				return false;
			}

			if($(el).hasClass("disabled") || !id) return false;
			$(el).addClass("disabled");
			url = '/include/ajax.php?service=waimai&action=peisong&ordertype='+ordertype;
			let param = new URLSearchParams();
			param.append('id',id);
			param.append('state',tstate);
			param.append('courier',JSON.stringify(tt.ps_lnglat));
			// alert(JSON.stringify(tt.ps_lnglat))  //需要定位成功之后才能获取骑手坐标
			if(tt.ifinp){
				param.append('paotuicode',code);
			}
			axios({
				method: 'post',
				url: url,
				data:param
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					showErr(data.info);
					if(ordertype == 'paotui' && state == 5){
						tt.mash_show = false;
					}
					if(ordertype == 'paotui' && state == 4){
						state = 5;
					}


					if(tstate=='99'){
						window.location = '?service=waimai&do=courier&ordertype=waimai&currentPageOpen=1';
					}else{
						if(tstate == '1'){
							tt.orderTop = 1; //订单完成
							tt.order_finished = 1; //订单结束
							tt.bottomfixed = false;
							tt.top_fixed = true;
							tt.detailstate = 1;
							$('body').scrollTop(0)
						}else{
							tt.detailstate = 5
						}

					}
				}else{

					if(tt.mash_show && tt.ifinp){
						tt.alerttip = 'errtip'
						tt.alertmsg = '收货码错误，请重新填写'
					}else{

						var popOptions = {
							btnCancel:'我知道了',
					      	title:data.info,
					      	btnCancelColor:'#FFAE00',
					      	noSure:true,
					      	isShow:true
					    }
						confirmPop(popOptions);
						tt.mash_show = false;
					}
				}
				$(el).removeClass("disabled");

			});
		},
		zhuan_sure:function(){
			this.alertit=langData['waimai'][10][96];  //确认转单？
			this.alertmsg=langData['waimai'][10][97]; //一经转单不可恢复
			this.btns=[{'type':'reset','state':0,'cn':langData['waimai'][2][43]},{'type':'sure','state':'99','cn':langData['waimai'][10][98]}];
			this.mash_show = true;
		},

		changeState:function(){  //更待到点状态

			var el = event.currentTarget;
			$(el).html('<div class="loader10"></div>').addClass('loading');
			var tt = this;
			axios({
				method: 'post',
				url: '/include/ajax.php?service=waimai&action=peisong&id='+id+'&state=98',
				// data:param
			})
			.then((response)=>{
				var data = response.data;
				if(data.state==100){
					tt.tostoredate = data.info
					$(el).closest('.change_state').remove();
					$('.change_state').find('em').html(data.info);
					$('.timelist li').eq(1).find('h3').html(data.info);
					location.reload();
					}else{
					tt.alertit=data.info;
					tt.alertmsg=langData['waimai'][10][99];//'需要在店铺50米范围内';
					tt.btns=[{'type':'cancel','cn':langData['waimai'][10][100]}];  //我知道了
					tt.mash_show = true;
				}
			});
		},

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
	var tt = this
 	var path = parseRouteToPath(route)
 	var startMarker,endMarker;
 	startMarker = new AMap.Marker({
 		position: path[0],
 		content: '<div></div>',
 		offset: new AMap.Pixel(-15, -50),
 		map: map
 	});
 	endMarker = new AMap.Marker({
 		position: path[path.length - 1],
 		content: '<div></div>',
 		// 以 icon 的 [center bottom] 为原点
 		offset: new AMap.Pixel(-15, -50),
 		map: map
 	})

	if(type=="1"){
		if(routeLine){
			map.remove(routeLine)
		}
 	    routeLine = new AMap.Polyline({
 			path: path,
 			strokeWeight: 5,
 			strokeColor: (type=="1"?'#F5B120':'#027CFF'),
 			lineJoin: 'round'
 		})
 		routeLine.setMap(map)
 		// 调整视野达到最佳显示区域
 		if(tt.mapshow){
 			map.setFitView([ startMarker, endMarker, routeLine ])
 		}

 	}else{
		if(routeLine1){
			map.remove(routeLine1)
		}
 		routeLine1 = new AMap.Polyline({
 			path: path,
 			strokeWeight: 5,
 			strokeColor: (type=="1"?'#F5B120':'#027CFF'),
 			lineJoin: 'round'
 		})
 		routeLine1.setMap(map)
 		// 调整视野达到最佳显示区域
 		if(tt.mapshow){
 			map.setFitView([ startMarker, endMarker, routeLine ])
 		}

 	}



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
