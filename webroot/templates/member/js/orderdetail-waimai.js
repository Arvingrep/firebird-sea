$(function(){

	//样式
	$('.right-con ul li:last-child').css('margin-bottom','0');
	$('.car_list .car_t2 li:last-child').css('margin-bottom','0');
	$('.car_list .car_t3 li:last-child').css('margin-bottom','0');
	$('.car_list .car_t4 li:last-child').css('margin-bottom','0');
	
	
	
	if($('.car_t2 ul li').length == 0){
		$('.car_t2').css('padding','0')
		$('.car_t2').css('border-bottom','0')
	}
	if($('.car_t3 ul li').length == 0){
		$('.car_t3').css('padding','0')
		$('.car_t3').css('border-bottom','0')
	}
	if($('.car_t4 ul li').length == 0){
		$('.car_t4').css('padding','0')
		$('.car_t4').css('border-bottom','0')
	}
	var lHeight=$('.left_order').height();
	var rHeight=$('.right-con').height();
	if(lHeight > rHeight){
		 $('.right-con').css('height',lHeight)
	}
	if(rHeight > lHeight){
		 $('.left_order').css('height',rHeight)
	}

	    //收藏
    $(".store-btn").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = "已收藏",id=t.data('id');

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        if(!t.hasClass("curr")){
            t.addClass("curr");
        }else{
            type = "del";
            t.removeClass("curr");
            oper = "-1";
            txt = "收藏";
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
            $i.remove();
        });

        t.children('button').html("<em></em><span>"+txt+"</span>");

        $.post("/include/ajax.php?service=member&action=collect&module=waimai&temp=shop&type="+type+"&id="+id);

    });

	// 取消订单
	$('.btn_group .cancel_btn').click(function() {
		var t = $(this);
		if (id) {
			if(confirm(langData['siteConfig'][20][186])){//确定取消该订单？

				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=waimai&action=cancelOrder&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//取消成功后移除信息层并异步获取最新列表
							location.reload();
						}else{
							alert(data.info);

							t.removeClass("load");
						}
					},
					error: function(){
						alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
						t.removeClass("load");
					}
				});
			};
		
		}
	});

	// 显示订单跟踪
	$('.info-section .info-title').click(function() {
		$('.mask_pop,.pop_page').show();
	});
	// 隐藏订单跟踪
	$('.mask_pop,.pop_page s.cha').click(function() {
		$('.mask_pop,.pop_page').hide();
	});
	mapShow(shop,ps,person,detailID,state,pspath);
	function mapShow(x,y,z,id,state,path){	//x 店铺坐标 y 配送员坐标 z 收货人坐标 path 配送路径
		
		// 百度地图
		if (site_map == "baidu") {
		    var map = new BMapGL.Map('map', {
                displayOptions: {
                    building: false  // 不显示建筑物
                }
            });//小地图
		    
		    var labelStyle = {
			   color: "#fff",
			   borderWidth: "0",
			   padding: "0",
			   zIndex: "2",
			   backgroundColor: "transparent",
			   textAlign: "center",
			   fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
			 }
		    if(state==3){//待配送时(等待骑手接单)  只有商家坐标 
		    	//店铺坐标
		      	var pointShop = new BMapGL.Point(x.lng, x.lat);
		      	var bubbleLabelShop = new BMapGL.Label('<p class="bubble-3 bubble shop"><span>商家备货完成</span></p>', {
			        position: pointShop,
			        offset: new BMapGL.Size(-20, -45)
			      });
		      	

		        bubbleLabelShop.setStyle(labelStyle);
		        map.addOverlay(bubbleLabelShop);
		        map.centerAndZoom(pointShop, 14);

		    }else if(state==4){//骑手接单 无路径  只有商家坐标 骑手坐标
		    	var pointShop = new BMapGL.Point(x.lng,x.lat);
				var pointCourier = new BMapGL.Point(y.lng,y.lat);
				console.log(pointShop)
				var bubbleLabel = new BMapGL.Label('<p class="bubble-3 bubble shop"></p>', {
				   position: pointShop,
				   offset: new BMapGL.Size(-20, -45)
				});
				var bubbleLabel2 = new BMapGL.Label('<p class="bubble-3 bubble courier"><span>骑手已接单</span></p>', {
				   position: pointCourier,
				   offset: new BMapGL.Size(-20, -45)
				});
				bubbleLabel.setStyle(labelStyle);
				bubbleLabel2.setStyle(labelStyle);
				map.addOverlay(bubbleLabel);
				map.addOverlay(bubbleLabel2);
				map.centerAndZoom(pointCourier, 14);

		    }else if(state==5){//配送中 路径 骑手坐标 商家坐标
		     //派送员路径
		      var pointArr = [];

		      //店铺坐标
		      var pointShop = new BMapGL.Point(x.lng, x.lat);
		      var bubbleLabelShop = new BMapGL.Label('<p class="bubble-3 bubble shop"></p>', {
		        position: pointShop,
		        offset: new BMapGL.Size(-20, -45)
		      });
		      bubbleLabelShop.setStyle(labelStyle);
		      map.addOverlay(bubbleLabelShop);
		      pointArr.push(pointShop);

		      //终点坐标
		      var pointPerson = new BMapGL.Point(z.lng, z.lat);
		      var bubbleLabelPerson = new BMapGL.Label('<p class="bubble-3 bubble person"></p>', {
		        position: pointPerson,
		        offset: new BMapGL.Size(-15, -15)
		      });
		      bubbleLabelPerson.setStyle(labelStyle);
		      map.addOverlay(bubbleLabelPerson);
		      pointArr.push(pointPerson);

		      //更新骑手位置 & 画线
		      updateCourierLocation(path);

		      //设置中心点
		      pointArr.push(new BMapGL.Point(y.lng, y.lat));
		      map.setViewport(pointArr);
		      map.setZoom(map.getZoom() - 1);
		      //骑手位置 & 画线
		        var bubbleLabelCourier, polylineCourier;
			    function updateCourierLocation(pathData){
			
			      if(!pathData || pathData == "") return false;
			
			      if(bubbleLabelCourier){
			          map.removeOverlay(bubbleLabelCourier);
			      }
			
			      //获取骑手最新位置
			      var psData = pathData.split(";");
			      psData = psData[psData.length-1].split(",");
			
			      //骑手坐标
			      var pointCourier = new BMapGL.Point(psData[0], psData[1]);
			      bubbleLabelCourier = new BMapGL.Label('<p class="bubble-3 bubble courier"><span class="long-span">骑手正在送货中</span></p>', {
			        position: pointCourier,
			        offset: new BMapGL.Size(-20, -45)
			      });
			      bubbleLabelCourier.setStyle(labelStyle);
			      map.addOverlay(bubbleLabelCourier);
			      //画折线
			      if(pathData){
			
			        if(polylineCourier){
			            map.removeOverlay(polylineCourier);
			        }
			
			        var pathsArr = [];
			        pathArr = pathData.split(";");
			        for(var i = 0; i < pathArr.length; i++){
			          var p = pathArr[i].split(",");
			          pathsArr.push(new BMapGL.Point(p[0],p[1]));
			        }
			        polylineCourier = new BMapGL.Polyline(pathsArr, {strokeColor:"green", strokeTexture: {url: '/static/images/icon_road_green_arrow.png', width: 16, height: 64}, strokeWeight:8, strokeOpacity:.9, strokeStyle:'dashed'});
			        map.addOverlay(polylineCourier);
			      }
			    }  


		      
		    }	
		    //正在配送中的 有大地图路径
			$(".sub-map").bind("click", function(){
			    $(".mapPath").show();
			    var mapPath = new BMapGL.Map('mapPath', {
                    displayOptions: {
                        building: false  // 不显示建筑物
                    }
                });//大地图
                mapPath.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
			    //派送员路径
			      var pointArr = [];

			      //店铺坐标
			      var pointShop = new BMapGL.Point(x.lng, x.lat);
			      var bubbleLabelShop = new BMapGL.Label('<p class="bubble-3 bubble shop"></p>', {
			        position: pointShop,
			        offset: new BMapGL.Size(-20, -45)
			      });
			      bubbleLabelShop.setStyle(labelStyle);
			      mapPath.addOverlay(bubbleLabelShop);
			      pointArr.push(pointShop);

			      //终点坐标
			      var pointPerson = new BMapGL.Point(z.lng, z.lat);
			      var bubbleLabelPerson = new BMapGL.Label('<p class="bubble-3 bubble person"></p>', {
			        position: pointPerson,
			        offset: new BMapGL.Size(-15, -15)
			      });
			      bubbleLabelPerson.setStyle(labelStyle);
			      mapPath.addOverlay(bubbleLabelPerson);
			      pointArr.push(pointPerson);

			      //更新骑手位置 & 画线
			      bigupdateCourierLocation(path);

			      //设置中心点
			      pointArr.push(new BMapGL.Point(y.lng, y.lat));
			      mapPath.setViewport(pointArr);
			      //mapPath.setZoom(mapPath.getZoom() - 1);
			    //骑手位置 & 画线
		        var bubbleLabelCourier, polylineCourier;
			    function bigupdateCourierLocation(pathData){
			      if(!pathData || pathData == "") return false;
		
			      if(bubbleLabelCourier){
			          mapPath.removeOverlay(bubbleLabelCourier);
			      }
			
			      //获取骑手最新位置
			      var psData = pathData.split(";");
			      psData = psData[psData.length-1].split(",");
					
			      //骑手坐标
			      var pointCourier = new BMapGL.Point(psData[0], psData[1]);
			      bubbleLabelCourier = new BMapGL.Label('<p class="bubble-3 bubble courier"><span class="long-span">骑手正在送货中</span></p>', {
			        position: pointCourier,
			        offset: new BMapGL.Size(-20, -45)
			      });
			      bubbleLabelCourier.setStyle(labelStyle);
			      mapPath.addOverlay(bubbleLabelCourier);
			      //画折线
			      if(pathData){
			
			        if(polylineCourier){
			            mapPath.removeOverlay(polylineCourier);
			        }
			
			        var pathsArr = [];
			        pathArr = pathData.split(";");
			        for(var i = 0; i < pathArr.length; i++){
			          var p = pathArr[i].split(",");
			          pathsArr.push(new BMapGL.Point(p[0],p[1]));
			        }
			        polylineCourier = new BMapGL.Polyline(pathsArr, {strokeColor:"green", strokeTexture: {url: '/static/images/icon_road_green_arrow.png', width: 16, height: 64}, strokeWeight:8, strokeOpacity:.9, strokeStyle:'dashed'});
			        mapPath.addOverlay(polylineCourier);
			      }
			    }
			     //刷新骑手位置
				$("#refreshMap").unbind().bind("click", function(){
					$.ajax({
					  url: "/include/ajax.php",
					  type: "post",
					  data: {service: "waimai", action: "getCourierLocation", orderid: id},
					  dataType: "json",
					  success: function(res){
					    if(res.state == 100){
					      peisongpath = res.info;
					      bigupdateCourierLocation(peisongpath);
					    }
					  }
					})
				}); 

			})	

			

		  // 谷歌地图
		}else if (site_map == "google") {

		     var marker,maker1,mapOptions,map;
		     
		     if(state==3){//待配送时 商家已确认订单(等待骑手接单)  只有商家坐标 
	 			mapOptions = {
				   zoom: 14,
				   center: new google.maps.LatLng(x.lat,x.lng),
				   zoomControl: false,
				   mapTypeControl: false,
				   streetViewControl: false,
				   fullscreenControl: false,
				 }
				 map = new google.maps.Map(document.getElementById('map'), mapOptions);
			 	 // 店铺坐标
			 	 marker = new google.maps.Marker({
			 	   position: new google.maps.LatLng(x.lat,x.lng),
			 	   map: map,
			 	   icon: "/static/images/shop_local_google.png?v=1"
			 	 });
		    }else if(state==4){//骑手接单 无路径  只有商家坐标 骑手坐标
		      	mapOptions = {
				   zoom: 14,
				   center: new google.maps.LatLng(x.lat,x.lng),
				   zoomControl: false,
				   mapTypeControl: false,
				   streetViewControl: false,
				   fullscreenControl: false
				 }
				 map = new google.maps.Map(document.getElementById('map'), mapOptions);
			 	// 店铺坐标
			 	marker = new google.maps.Marker({
			 	  position: new google.maps.LatLng(x.lat,x.lng),
			 	  map: map,
			 	  icon: "/static/images/shop_local_google.png?v=1"
			 	});
			 	
			 	// 骑手坐标
			 	marker1 = new google.maps.Marker({
			 	  position: new google.maps.LatLng(y.lat,x.lng),
			 	  map: map,
			 	  icon: "/static/images/courier_local_google.png?v=1"
			 	});
			}else if(state==5){//配送中 路径 骑手坐标 商家坐标
			 	var shop_marker, person_marker, LatLngList = [];
			 	mapOptions = {
		          zoom: 14,
		          center: new google.maps.LatLng(y.lat, y.lng),
		          zoomControl: false,
		          mapTypeControl: false,
		          streetViewControl: false,
		          fullscreenControl: false
		        }
		        map = new google.maps.Map(document.getElementById('map'), mapOptions);
		        // 店铺坐标
			     shop_marker = new google.maps.Marker({
			        position: new google.maps.LatLng(x.lat, x.lng),
			        map: map,
			        icon: "/static/images/shop_local_google.png?v=1"
			     });
			     LatLngList.push(new google.maps.LatLng(x.lat, x.lng))
			
			    // 终点坐标
			    person_marker = new google.maps.Marker({
			        position: new google.maps.LatLng(z.lat, z.lng),
			        map: map,
			        icon: "/static/images/person_local_google.png?v=1"
			    });
			    LatLngList.push(new google.maps.LatLng(z.lat, z.lng))
			
			      //更新骑手位置 & 画线
			      updateCourierLocation(path);
			
			      // 调整到合适的视野
			    var bounds = new google.maps.LatLngBounds ();
			      for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
			        bounds.extend (LatLngList[i]);
			    }
			    map.fitBounds (bounds);

			    //骑手位置 & 画线  
			    var courier_marker, trackPath;
			    function updateCourierLocation(pathData){
			
			      if(!pathData || pathData == "") return false;
			
			      if(courier_marker){
			        courier_marker.setMap(null);
			      }
			
			      //获取骑手最新位置
			      var psData = pathData.split(";");
			      psData = psData[psData.length-1].split(",");
			
			      // 骑手坐标
			      courier_marker = new google.maps.Marker({
			        position: new google.maps.LatLng(psData[1], psData[0]),
			        map: map,
			        icon: "/static/images/courier_local_google.png?v=1"
			      });
			
			      courier_marker.setMap(map);
			
			      //画折线
			      if(pathData){
			
			        if(trackPath){
			          trackPath.setMap(null);
			        }
			
			        var pathsArr = [];
			        pathArr = pathData.split(";");
			        for(var i = 0; i < pathArr.length; i++){
			          var p = pathArr[i].split(",");
			          pathsArr.push(new google.maps.LatLng(p[1],p[0]));
			        }
			
			        trackPath = new google.maps.Polyline({
			            path: pathsArr,
			            strokeColor: "blue", // 线条颜色
			            strokeOpacity: 0.9, // 线条透明度
			            strokeWeight: 2 // 线条粗细
			        });
			
			        trackPath.setMap(map);
			
			      }
			    }
		    }
		     
		}
		 
	}
	
	//关闭大地图
	$("#closeMap").bind("click", function(){
		$(".mapPath").hide();
	});


	$('body').delegate(".popPay", "click", function(){

		var ordernum1 = $(this).attr('data-ordernum');

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=waimai&action=pay",
			type: 'post',
			data: {'ordernum':ordernum1,'orderfinal':1},
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){

					info = data.info;
					cutDown = setInterval(function () {
						$(".payCutDown").html(payCutDown(info.timeout));
					}, 1000)

					var datainfo = [];
					for (var k in info) {
						datainfo.push(k + '=' + info[k]);
					}
					$("#amout").text(info.order_amount);
					$('.payMask').show();
					$('.payPop').show();


					if (usermoney * 1 < info.order_amount * 1) {

						$("#moneyinfo").text('余额不足，');
						$("#moneyinfo").closest('.pay_item').addClass('disabled_pay')
					}else{
						$("#moneyinfo").text('可用');
						$("#moneyinfo").closest('.pay_item').removeClass('disabled_pay')
					}

					if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
						$("#bonusinfo").text('额度不足，可用');
						$("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
					}else if( bonus * 1 < info.order_amount * 1){
						$("#bonusinfo").text('余额不足，可用');
						$("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
					}else{
						$("#bonusinfo").text('可用');
						$("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
					}

					ordernum  = info.ordernum;
					order_amount = info.order_amount;

					$("#ordertype").val('');
					$("#service").val('waimai');
					service = 'waimai';
					var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
					$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
				}
			},
			error: function(){
				alert('网络错误，请重试！');
			}
		})
	});


});
