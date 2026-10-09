$(function(){

    var map, markersArr = [];

    if (site_map == "baidu") {

      map = new BMap.Map("map", {enableMapClick: false});
      // map.centerAndZoom(mapCity, 13);
      map.enableScrollWheelZoom(); //启用滚轮放大缩小
      map.disableInertialDragging(); //禁用惯性拖拽

      var points = [];
      $.each(courier, function(e, o) {
          var bubbleLabel, r = [];

          bubbleLabel = new BMap.Label('<p class="bubble-3 bubble courier" data-id="'+o.id+'"><i class="num">骑手：'+o.name+'（'+o.count+'单）</i><i class="arrow-up"><i class="arrow"></i><i></p>', {
              position: new BMap.Point(o.lat, o.lng),
              offset: new BMap.Size(-46, -46)
          });

          bubbleLabel.setStyle({
      			color: "#fff",
      			borderWidth: "0",
      			padding: "0",
      			zIndex: "2",
      			backgroundColor: "transparent",
      			textAlign: "center",
      			fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
      		});
          map.addOverlay(bubbleLabel);

          //最佳视野显示所有配送员
          points.push(new BMap.Point(o.lat, o.lng));
          map.setViewport(points);

      });

    // 谷歌地图
    }else if (site_map == "google") {

      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: new google.maps.LatLng(30, 120),
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false
      });

      var points = [], LatLngList = [];
      $.each(courier, function(e, o) {
          var bubbleLabel, r = [];

          var state = "";
          if(o.state == 0){
              state = " closed";
          }

          var poi = new google.maps.LatLng(o.lng, o.lat);
          var marker = new google.maps.Marker({
            position: poi,
            map: map
          });

          markersArr.push(marker);

          var infoWindow = new google.maps.InfoWindow({
            content: '<p data-id="'+o.id+'" class="courier"><i class="num">骑手：'+o.name+'（'+o.count+'单）</i></p>'
          });
          infoWindow.open(map, marker);

          LatLngList.push(new google.maps.LatLng(o.lng, o.lat))


          marker.addListener('click', function() {
            var id = o.id;
            ConfirmPerson(id);
					});

      });

      //最佳视野显示所有配送员
      var bounds = new google.maps.LatLngBounds ();
      for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
        bounds.extend (LatLngList[i]);
      }
      map.fitBounds (bounds);

    }else if (site_map == "amap"){
      var map = new AMap.Map("map",{
        jogEnable: false,   //禁用缓动
        zoom: 14,
    });

    var points = [], pointsLng = [], pointsLat = [];
    $.each(courier, function(e, o) {
        var bubbleLabel, r = [];

        points.push(new AMap.LngLat(o.lat, o.lng));
        pointsLng.push(parseFloat(o.lng));
        pointsLat.push(parseFloat(o.lat));

        bubbleLabel = new AMap.Marker({
            position: ([o.lat, o.lng]),
            draggable: true,    // 允许拖动
            raiseOnDrag: true,  // 拖动时动画效果
            content: '<p class="bubble-3 bubble courier" data-id="'+o.id+'" style="color:#fff;background:transparent;font-family:\'microsoft yahei\';white-space:nowrap;"><i class="num">骑手：'+o.name+'（'+o.count+'单）</i><i class="arrow-up"><i class="arrow"></i><i></p>',
            offset: new AMap.Pixel(-46,-46)
        });
        bubbleLabel.setMap(map);

        AMap.event.addListener(bubbleLabel, "dragend",function(ea){
            bubbleLabel.setContent('<p class="bubble-3 bubble courier disabled" data-id="'+o.id+'" style="color:#fff;background:transparent;font-family:\'microsoft yahei\';white-space:nowrap;"><i class="num">骑手：'+o.name+'（'+o.count+'单）【10秒后回到实际位置】</i><i class="arrow-up"><i class="arrow"></i><i></p>');
            setTimeout(function(){
                bubbleLabel.show();
                bubbleLabel.moveTo(new AMap.LngLat(o.lat, o.lng), 100000);
                bubbleLabel.setContent('<p class="bubble-3 bubble courier" data-id="'+o.id+'" style="color:#fff;background:transparent;font-family:\'microsoft yahei\';white-space:nowrap;"><i class="num">骑手：'+o.name+'（'+o.count+'单）</i><i class="arrow-up"><i class="arrow"></i><i></p>');
            },10000)
        })

    });

    //最佳视野显示所有配送员
    setCenter();
// 中心点
    function setCenter(){
        pointsLng = pointsLng.sort();
        pointsLat = pointsLat.sort();
        map.setCenter([(pointsLat[pointsLat.length-1] + pointsLat[0])/2, (pointsLng[pointsLng.length-1] + pointsLng[0])/2]);
    }
    function autoResize(level){
        map.setZoom(level);
        setTimeout(function(){
            var area = map.getBounds();
            var out = false;
            for(var n = 0; n < points.length; n++){
                if(!area.contains(points[n])){
                    out = true;
                    break;
                }
            }
            if(out && level > 3){
                autoResize(--level);
            }
        },200)
    }
    autoResize(14);

    }



    var page = 1, pageSize = 10;
    $("#total").html(order.length);

    //分页
    if(order.length > pageSize){
        var totalPage = Math.ceil(order.length / pageSize);
        var p = [];
        for (var i = 0; i < totalPage; i++) {
            p.push('<option value="'+(i+1)+'">第'+(i+1)+'页</option>');
        }
        $("#page").html(p.join("")).removeClass("hide");
    }

    $("#page").change(function(){
        page = $(this).val();
        printOrderList();
    });

    printOrderList();

    //拼接订单列表
    function printOrderList(){
        var list = [];
        var offset = (page - 1) * pageSize;
        orderData = (offset + pageSize >= order.length) ? order.slice(offset, order.length) : order.slice(offset, offset + pageSize);

        if(orderData){
            for (var i = 0; i < orderData.length; i++) {
                var data = orderData[i];
                list.push('<div class="item" data-id="'+data.id+'" data-shopname="'+data.shopname+'" data-lng="'+data.lng+'" data-lat="'+data.lat+'" data-coordX="'+data.coordX+'" data-coordY="'+data.coordY+'">');
                list.push('<div class="tit">订单号：'+data.ordernum+'</div>');
                list.push('<dl class="clearfix">');
                list.push('<dt><img src="/static/images/customer_default.png" /></dt>');
                list.push('<dd>'+data.person+'  '+data.tel+'<br />'+data.address+'</dd>');
                list.push('</dl>');
                list.push('<dl class="clearfix">');
                list.push('<dt><img src="/static/images/shop_default.png" /></dt>');
                list.push('<dd>'+data.shopname+'<br />'+data.address1+'</dd>');
                list.push('</dl>');
                list.push('<div class="fot clearfix">');
                list.push('<input type="checkbox" value="'+data.id+'" />');
                list.push('<span class="time">'+data.confirmdate+'</span>');
                list.push('<a href="javascript:;" class="btn no-border btn-success">订单详情</a>');
                list.push('</div>');
                list.push('</div>');
            }
        }

        $(".slide .list").html(list.join(""));
    }


    //点击订单
    $(".slide .list").delegate(".item", "click", function(){
        var t = $(this), shopname = t.attr("data-shopname"), lng = t.attr("data-lng"), lat = t.attr("data-lat"), coordX = t.attr("data-coordX"), coordY = t.attr("data-coordY");
        t.addClass("curr").siblings(".item").removeClass("curr");
        addShopMarket(shopname, lng, lat, coordX, coordY);
    });


    var shopMarket, personMarket;
    function addShopMarket(shopname, lng, lat, coordX, coordY){
      if (site_map == "baidu") {

        if(shopMarket){
            map.removeOverlay(shopMarket);
        }
        if(personMarket){
            map.removeOverlay(personMarket);
        }

        shopMarket = new BMap.Label('<p class="bubble-3 bubble shop"><i class="num">店铺：'+shopname+'</i><i class="arrow-up"><i class="arrow"></i><i></p>', {
            position: new BMap.Point(coordY, coordX),
            offset: new BMap.Size(-46, -46)
        });

        shopMarket.setStyle({
    			color: "#fff",
    			borderWidth: "0",
    			padding: "0",
    			zIndex: "2",
    			backgroundColor: "transparent",
    			textAlign: "center",
    			fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
    		});
        map.addOverlay(shopMarket);


        personMarket = new BMap.Label('<p class="bubble-3 bubble person"><i class="num">终点</i><i class="arrow-up"><i class="arrow"></i><i></p>', {
            position: new BMap.Point(lng, lat),
            offset: new BMap.Size(-46, -46)
        });

        personMarket.setStyle({
    			color: "#fff",
    			borderWidth: "0",
    			padding: "0",
    			zIndex: "2",
    			backgroundColor: "transparent",
    			textAlign: "center",
    			fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
    		});
        map.addOverlay(personMarket);

        var points = [];
        points.push(new BMap.Point(coordY, coordX));
        points.push(new BMap.Point(lng, lat));
        map.setViewport(points);

      // 谷歌地图
      }else if (site_map == "google") {

        if(shopMarket){
					shopMarket.setMap(null);
  			}
        if(personMarket){
					personMarket.setMap(null);
        }

        shopMarket = new google.maps.Marker({
          position: new google.maps.LatLng(coordX, coordY),
          map: map
        });
        var infoWindow = new google.maps.InfoWindow({
          content: '<p><i class="num">店铺：'+shopname+'</i></p>'
        });
        infoWindow.open(map, shopMarket);

        personMarket = new google.maps.Marker({
          position: new google.maps.LatLng(lat, lng),
          map: map
        });
        var infoWindow = new google.maps.InfoWindow({
          content: '<p><i class="num">终点</i></p>'
        });
        infoWindow.open(map, personMarket);

        var points = [];
        points.push(new google.maps.LatLng(coordX, coordY));
        points.push(new google.maps.LatLng(lat, lng));
        var bounds = new google.maps.LatLngBounds ();
        for (var i = 0, LtLgLen = points.length; i < LtLgLen; i++) {
          bounds.extend (points[i]);
        }
        map.fitBounds (bounds);

      }else if(site_map == "amap"){
		  if(shopMarket){
		  		shopMarket.setMap(null);
		  }
		  if(personMarket){
		  		personMarket.setMap(null);
		  }
		   shopMarket = new AMap.Marker({
		       position: ([coordY, coordX]),
		       draggable: true,    // 允许拖动
		       raiseOnDrag: true,  // 拖动时动画效果
		       content: '<p class="bubble-3 bubble shop" style="white-space:nowrap;"><i class="num">店铺：'+shopname+'</i><i class="arrow-up"><i class="arrow"></i><i></p>',
		       offset: new AMap.Pixel(-46,-46)
		   });
		   shopMarket.setMap(map);
		   console.log(lng, lat+"==="+coordY, coordX)
		   personMarket = new AMap.Marker({
		       position: ([lng, lat]),
		       draggable: true,    // 允许拖动
		       raiseOnDrag: true,  // 拖动时动画效果
		       content: '<p class="bubble-3 bubble person"><i class="num">终点</i><i class="arrow-up"><i class="arrow"></i><i></p>',
		       offset: new AMap.Pixel(-46,-46)
		   });
		   map.setZoomAndCenter(12,[(coordY*1+lng*1)/2, (coordX*1+lat*1)/2])
		   personMarket.setMap(map);
	  }
    
    }


    //订单详情
    $(".slide .list").delegate(".btn", "click", function(){
        var t = $(this), id = t.closest(".item").attr("data-id");
        if(id){
            $.dialog({
    			id: "markDitu",
    			title: "订单详情",
    			content: 'url:waimai/waimaiOrderDetail.php?id='+id,
    			width: 1000,
    			height: 600,
    			max: true,
    			ok: function(){

    			},
    			cancel: true
    		});
        }
    });


    //点击配送员
    //气泡点击  区域
    $("#map").on("click", ".courier", function() {
      var id = $(this).attr("data-id");
      ConfirmPerson(id);
    });

    function ConfirmPerson(id){
      var courier_id = id;
      var orderids = [];
      $(".slide .list").find("input").each(function(){
          var t = $(this), id = t.val();
          if(t.is(":checked")){
              orderids.push(id);
          }
      });

      if(orderids.length > 0){
          $.dialog.confirm("确认配送？", function(){

              $.ajax({
                  url: "waimaiOrder.php",
                  type: "post",
                  data: {action: "setCourier", id: orderids.join(","), courier: courier_id},
                  dataType: "json",
                  success: function(res){
                      if(res.state != 100){
                          $.dialog.alert(res.info);
                      }else{
                          location.reload();
                      }
                  },
                  error: function(){
                      $.dialog.alert("网络错误，操作失败！");
                  }
              })

          });
      }
    }

});
