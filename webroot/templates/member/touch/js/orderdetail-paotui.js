$(function(){

  //取送货/购买----详情
  var sh = $('.goodbox .ptinfo').height();
  if(sh > 30){
    $('.goodbox i.moreTit').show();
  }
  $('.goodbox i.moreTit').click(function(){
    var par = $(this).closest('.goodbox');
    if(!$(this).hasClass('up')){
      $(this).addClass('up');
      par.find('.infobox').animate({'height':sh+'px'},200);
    }else{
      $(this).removeClass('up');
      par.find('.infobox').animate({'height':'.4rem'},200);
    }

  })

  //取送货/购买---价格详情
  var sh = $('.goodbox .priceDiv').innerHeight();
  $('.goodbox .pay_btn').click(function(){
    var par = $(this).closest('.goodbox');

    var moreMoney = $(this).find('.moreMoney');
    if(!moreMoney.hasClass('up')){
      moreMoney.addClass('up');
      par.find('.priceInfo').animate({'height':sh+'px'},200);
    }else{
      moreMoney.removeClass('up');
      par.find('.priceInfo').animate({'height':0},200);
    }

  })

  //复制功能
  var clipboardCopy;
  if(!clipboardCopy){
      clipboardCopy = new ClipboardJS('.copyCode');
      clipboardCopy.on('success', function(e) {
          showMsg(langData['siteConfig'][46][101]);  //复制成功
      });

      clipboardCopy.on('error', function(e) {
          showMsg(langData['siteConfig'][46][102]); //复制失败
      });
  }


  // 显示订单跟踪
  $('.order_state.show h2').click(function() {
    $('.mask_pop').show();
    $('.pop_page').animate({
      "bottom": 0
    }, 150);
  });
  // 隐藏订单跟踪
  $('.mask_pop,.pop_page .close_btn').click(function() {
    $('.mask_pop').hide();
    $('.pop_confirm').removeClass('show');
    $('.pop_page').animate({
      "bottom": "-100%"
    }, 150);
  });
  function caTime(time1,time2){
    var begin1=time1.substr(0,10).split("-");
    var end1=time2.substr(0,10).split("-");
    var date1=new Date(begin1[1] + - + begin1[2] + - + begin1[0]);
    var date2=new Date(end1[1] + - + end1[2] + - + end1[0]);
    var m=parseInt(Math.abs(date2-date1)/1000/60);
    var min1=parseInt(time1.substr(11,2))*60+parseInt(time1.substr(14,2));
    var min2=parseInt(time2.substr(11,2))*60+parseInt(time2.substr(14,2));
    var n=min2-min1;
    var minutes=m+n;
    return minutes;

  }

  // 取消订单
  $('.btn_group .cancel_btn').click(function() {
    var t = $(this);
    if (id) {
      $('.pop_confirm').addClass('show');
      $('.mask_pop').show();
      if(state == 3 || state == 0){//未付款/等待接单 可直接取消
        $('.pop_confirm .pop_tip p').text('订单一旦取消不可恢复');
      }else{
        if(csprice > 0){
          var kouPrice = (amount*(csprice/100)).toFixed(2);
          if(cstime > 0){//多少分钟免费
            var calcTime = caTime(paydate,noww);//计算是否在免费时间内
            if(calcTime > cstime){
              $('.pop_confirm .pop_tip p').text('取消订单将扣除'+kouPrice+echoCurrency('short'));
            }else{
              $('.pop_confirm .pop_tip p').text('订单一旦取消不可恢复');
            }

          }else{
            $('.pop_confirm .pop_tip p').text('取消订单将扣除'+kouPrice+echoCurrency('short'));
          }


        }else{
          $('.pop_confirm .pop_tip p').text('订单一旦取消不可恢复');
        }
      }
      $('.cancle_btn').click(function(e){
        $('.pop_confirm').removeClass('show');
        $('.mask_pop').hide();
        e.stopImmediatePropagation();   //阻止事件继续执行
      });
      $('.sure_btn').off('click').click(function(e){
        $.ajax({
          url: "/include/ajax.php?service=waimai&action=cancelPaotuiOrder&id=" + id,
          type: "GET",
          dataType: "json",
          success: function(data) {
            if (data && data.state == 100) {

              //取消成功后移除信息层并异步获取最新列表
              location.reload();
            } else {
              alert(data.info);
              t.siblings("a").show();
              t.removeClass("load");
            }
          },
          error: function() {
            alert(langData['siteConfig'][20][183]);    /* 网络错误，请稍候重试！*/
            t.siblings("a").show();
            t.removeClass("load");
          }
        });
        $('.pop_confirm').removeClass('show');
        $('.mask_pop').hide();
      })

    }
  });


  // 错误提示
  function showMsg(str){
    var o = $(".error");
    o.html(str).css('display','inline-block');
    setTimeout(function(){o.css('display','none')},1000);
  }



  //骑手配送地图
  //state -- detail_type(1 帮我买 否则 取送件) -- buyfrom(0为指定地址购买 1为骑手就近购买)
  //1.取送货等待接单---画取送货路线 ok1
  //2.帮我买等待接单(固定地址) -- 画取送货路线 ok1
  //2.帮我买等待接单(骑手购买) -- 不画地图

  //3.取送货骑手已接单 -- 画取货-骑手-收货 两道路线 ok1
  //4.帮我买骑手已接单(固定地址) -- 画商家-骑手-收货 两道路线 ok1
  //4.帮我买骑手已接单(骑手购买) -- 画骑手坐标 正在购买

  //5.取送货配送中 -- 画取货-骑手-收货 两道路线 ok1
  //6.帮我买骑手配送中(固定地址) -- 画商家-骑手-收货 两道路线 ok1
  //6.帮我买骑手配送中(骑手购买)-- 骑手-收货 路线

  var labelStyle = {
     color: "#fff",
     borderWidth: "0",
     padding: "0",
     zIndex: "2",
     backgroundColor: "transparent",
     textAlign: "center",
     fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
  }
  var smallMap,bubbleLabel,bubbleLabel2,mapPath,sCont = '',infoWindow,infoWindow1;
  var directionsService,directionsService1,directionsService2,directionsService3;//谷歌地图规划路线专用
  var directionsRenderer,directionsRenderer1,directionsRenderer2,directionsRenderer3; //谷歌地图规划路线专用
  var markersArr = [];
  //地图存在时 配送中 /取送货等待接单 / 帮我买指定地址购买等待接单
  if(state == 4 || state == 5 || (state == 3 && detail_type == 2) || (state == 3 && detail_type == 1 && buyfrom == 0)){
    if(site_map == 'baidu'){
      smallMap = new BMap.Map('map');//小地图

    }else if (site_map == "google"){
      var centerPoint = new google.maps.LatLng(parseFloat(userlat), parseFloat(userlng));
      if(detail_type == 1 && state == 4 && buyfrom == 1){//骑手就近购买商品--中心点为骑手
        centerPoint = new google.maps.LatLng(parseFloat(pslat), parseFloat(pslng));
      }
      smallMap = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: centerPoint,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        }
      });

      infoWindow = new google.maps.InfoWindow;
      infoWindow1 = new google.maps.InfoWindow;
      //划线 小地图两条线 大地图两条线
      directionsService = new google.maps.DirectionsService();
      directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers:true  ,
      });
      directionsRenderer.setOptions({
        polylineOptions: {
          strokeColor: '#027CFF'
        }
      });

      directionsService1 = new google.maps.DirectionsService();
      directionsRenderer1 = new google.maps.DirectionsRenderer({
        suppressMarkers:true  ,
      });
      directionsRenderer1.setOptions({
        polylineOptions: {
          strokeColor: '#027CFF'
        }
      });
      directionsService2 = new google.maps.DirectionsService();
      directionsRenderer2 = new google.maps.DirectionsRenderer({
        suppressMarkers:true  ,
      });
      directionsRenderer2.setOptions({
        polylineOptions: {
          strokeColor: '#027CFF'
        }
      });
      directionsService3 = new google.maps.DirectionsService();
      directionsRenderer3 = new google.maps.DirectionsRenderer({
        suppressMarkers:true  ,
      });
      directionsRenderer3.setOptions({
        polylineOptions: {
          strokeColor: '#027CFF'
        }
      });



    }else if (site_map == "amap"){
      var centerP = [userlng, userlat];
      if(detail_type == 1 && state == 4 && buyfrom == 1){//骑手就近购买商品--中心点为骑手
        centerP = [pslng, pslat];
      }
      smallMap = new AMap.Map('map', {
          center: centerP,
          zoom: 15,
      });

    }
  }

  function intMap(mapId,type){
    if(site_map == 'baidu'){
      mapId.clearOverlays();
      var centerPoint = new BMap.Point(userlng, userlat);
      if(detail_type == 1 && state == 4 && buyfrom == 1){//骑手就近购买商品--中心点为骑手
        centerPoint = new BMap.Point(pslng, pslat);
      }
      mapId.centerAndZoom(centerPoint,14);
      mapId.addEventListener("tilesloaded", tilesloadedfun);
      if(type == 1){
        mapId.disableDragging();
      }

      function tilesloadedfun(){
        mapId.removeEventListener("tilesloaded", tilesloadedfun);

        if(state == 4 || state == 5){//有骑手
          qsPoint(pslng,pslat);
        }
        drawComMap(mapId);
      }

    }else if(site_map == 'amap'){
      mapId.clearMap();
      mapId.on("complete", tilesloadedfun);
      if(type == 1){
        //mapId.disableDragging();
      }
      function tilesloadedfun(){
        if(state == 4 || state == 5){//有骑手
          qsPoint(pslng,pslat);
        }
        drawComMap(mapId);
      }

    }else if(site_map == 'google'){

      if(state == 4 || state == 5){//有骑手
        qsPoint(pslng,pslat);
      }
      if(type == 1){
        drawComMap(mapId,directionsService,directionsRenderer,directionsService1,directionsRenderer1);
      }else{
        drawComMap(mapId,directionsService2,directionsRenderer2,directionsService3,directionsRenderer3);
      }

    }
  }
  //地图存在时 配送中 /取送货等待接单 / 帮我买指定地址购买等待接单
  if(state == 4 || state == 5 || (state == 3 && detail_type == 2) || (state == 3 && detail_type == 1 && buyfrom == 0)){
    intMap(smallMap,1);
  }
  //送达时间
  var xdTime = toTime;
  //绘制小地图 收取货坐标 ---骑手坐标单独画
  function drawComMap(comMap,dirS,dirR,dirS1,dirR1){//dirS,dirR,dirS1,dirR1 谷歌地图两条线专用

    if(site_map == 'baidu'){

      if(state ==4  || state == 5){//有骑手
        var qs = new BMap.Point(pslng,pslat);  //骑手坐标
      }
      var user = new BMap.Point(userlng,userlat);  //收货坐标

      // 划线方法 --店铺~骑手
      var riding1 = new BMap.RidingRoute(smallMap, {
        renderOptions: {
          map: comMap,
          autoViewport: true

        },
        onPolylinesSet:function(Route){
          //当线条添加完成时调用
          for(var i=0;i<Route.length;i++){
          var polyline = Route[i].getPolyline();//获取线条遮挡物
            polyline.setStrokeColor("#307CFC");//设置颜色
            polyline.setStrokeWeight(3);//设置宽度
            polyline.setStrokeOpacity(1);//设置透明度
          }
        },
        onMarkersSet:function(routes) {
           for (var i = 0; i <routes.length; i++) {
            // 判断是否是途经点
            if(typeof(routes[i].Km)=="undefined"){
                comMap.removeOverlay(routes[i].marker); //删除起始默认图标
            }
          }
        }
      });
      // 划线方法 --骑手~收货人
      var riding2 = new BMap.RidingRoute(comMap, {
        renderOptions: {
          map: comMap,
          autoViewport: true

        },
        onPolylinesSet:function(Route){
          //当线条添加完成时调用
          for(var i=0;i<Route.length;i++){
          var polyline = Route[i].getPolyline();//获取线条遮挡物
            polyline.setStrokeColor("#307CFC");//设置颜色
            polyline.setStrokeWeight(3);//设置宽度
            polyline.setStrokeOpacity(1);//设置透明度
          }
        },
        onMarkersSet:function(routes) {
           for (var i = 0; i <routes.length; i++) {
            // 判断是否是途经点
            if(typeof(routes[i].Km)=="undefined"){
                comMap.removeOverlay(routes[i].marker); //删除起始默认图标
            }
          }
        }
      });

      //绘制取货地点/指定地址购买点
      if((detail_type == 2) ||(detail_type == 1 && buyfrom == 0)){//取送货/帮我买去指定地址购买
        var shop = new BMap.Point(shoplng,shoplat);  //取货坐标
        if(detail_type == 1){
          var shopIcon = new BMap.Label('<div class="bubble buy"></div>', {
            position: shop,
            offset: new BMap.Size(-15, -33),
          });
        }else{
          var shopIcon = new BMap.Label('<div class="bubble shop"></div>', {
            position: shop,
            offset: new BMap.Size(-15, -33),
          });
        }


        shopIcon.setStyle(labelStyle);
        comMap.addOverlay(shopIcon);
        if(state == 3){//只画取送货路线
          riding1.search(shop,user);  //店铺~顾客
        }else{//配送中 --加上骑手 两条线
          riding1.search(shop,qs);  //店铺~骑手
          riding2.search(qs,user);  //骑手~顾客
        }

      }
      if((detail_type == 1 && buyfrom == 1) && state == 5){//骑手就近购买好商品 配送中
        riding2.search(qs,user);  //骑手~顾客
      }
      var usCont = '';
      if(state == 3){
        usCont = '<p>预计'+xdTime+'送达</p>';
      }

      var userIcon = new BMap.Label('<div class="bubble person">'+usCont+'</div>', {
        position: user,
        offset: new BMap.Size(-15, -33),
      });
      //画收货
      userIcon.setStyle(labelStyle);
      comMap.addOverlay(userIcon);



    }else if(site_map == 'amap'){
      var usCont = '';
      if(state == 3){
        usCont = '<p>预计'+xdTime+'送达</p>';
      }
      userIcon = new AMap.Marker({
        position: [userlng,userlat],
        content: '<div class="bubble person">'+usCont+'</div>',
        offset: new AMap.Pixel(-15, -33),
        map: comMap
      });
      var ridingOption = {
        policy: 1
      }
      var riding1 = new AMap.Riding(ridingOption);
      var riding2 = new AMap.Riding(ridingOption);

      //绘制取货地点/指定地址购买点
      if((detail_type == 2) ||(detail_type == 1 && buyfrom == 0)){//取送货/帮我买去指定地址购买
        if(detail_type == 1){
          shopIcon = new AMap.Marker({
            position: [shoplng,shoplat],
            content: '<div class="bubble buy"></div>',
            offset: new AMap.Pixel(-15, -33),
            map: comMap
          });
        }else{
          shopIcon = new AMap.Marker({
            position: [shoplng,shoplat],
            content: '<div class="bubble shop"></div>',
            offset: new AMap.Pixel(-15, -33),
            map: comMap
          });
        }
        console.log(pslng,pslat)
        if(state == 3){//只画取送货路线
          riding1.search([shoplng, shoplat],[userlng, userlat], function(status, result) {
            if (status === 'complete') {
              if (result.routes && result.routes.length) {
                drawRoute("1",result.routes[0],comMap)
                // log.success('绘制骑行路线完成')
              }
            }
          });

        }else{//配送中 --加上骑手 两条线
          riding1.search([shoplng, shoplat],[pslng, pslat], function(status, result) {
            if (status === 'complete') {
              if (result.routes && result.routes.length) {
                drawRoute("1",result.routes[0],comMap)
                // log.success('绘制骑行路线完成')
              }
            }
          });

          riding2.search([pslng, pslat],[userlng, userlat], function(status, result) {
            if (status === 'complete') {
              if (result.routes && result.routes.length) {
                drawRoute("1",result.routes[0],comMap)
                // log.success('绘制骑行路线完成')
              }
            }
          });
        }

      }

      if((detail_type == 1 && buyfrom == 1) && state == 5){//骑手就近购买好商品 配送中
        riding1.search([pslng, pslat],[userlng, userlat], function(status, result) {
            if (status === 'complete') {
              if (result.routes && result.routes.length) {
                drawRoute("1",result.routes[0],comMap)
                // log.success('绘制骑行路线完成')
              }
            }
          });
      }


    }else if(site_map == 'google'){


      //收货坐标 --label绘制
      var ulnglat = {"lng":Number(userlng),"lat":Number(userlat)};
      var uposition = new google.maps.LatLng(parseFloat(userlat),parseFloat(userlng));
      userIcon = new MarkerWithLabel({
        position: uposition,
        draggable: true,
        map: comMap,
        labelAnchor: new google.maps.Point(15, 33),
        labelContent: '<div class="bubble person"></div>',
        icon:'/static/images/blank.gif',
      });
      markersArr.push(userIcon);

      if(state == 3){
        var infowincontent = '<p>预计'+xdTime+'送达</p>';
        infoWindow.setContent(infowincontent);
        infoWindow.open(comMap, userIcon);
      }
      //划线
      if(dirR){
        dirR.setMap(null);
      }


      dirR.setMap(comMap);

      //绘制取货地点/指定地址购买点
      if((detail_type == 2) ||(detail_type == 1 && buyfrom == 0)){//取送货/帮我买去指定地址购买
        var slnglat = {"lng":Number(shoplng),"lat":Number(shoplat)}; //取货坐标
        var qlnglat = {"lng":Number(pslng),"lat":Number(pslat)}; //骑手坐标
        var sposition = new google.maps.LatLng(parseFloat(shoplat),parseFloat(shoplng));
        shopIcon  = new MarkerWithLabel({
           position: sposition,
           draggable: true,
           map: comMap,
           labelAnchor: new google.maps.Point(15, 33),
           labelContent: '<div class="bubble shop"></div>',
          icon:'/static/images/blank.gif',
        });
        markersArr.push(shopIcon);
        if(state == 3){//只画取送货路线
          calculateAndDisplayRoute(dirS, dirR,slnglat,ulnglat);
        }else{//配送中 --加上骑手 两条线
          if(dirR1){
            dirR1.setMap(null);
          }

          dirR1.setMap(comMap);
          calculateAndDisplayRoute(dirS, dirR,slnglat,qlnglat);
          calculateAndDisplayRoute(dirS1, dirR1,qlnglat,ulnglat);
        }

      }

      if((detail_type == 1 && buyfrom == 1) && state == 5){//骑手就近购买好商品 配送中
        var qlnglat = {"lng":Number(pslng),"lat":Number(pslat)}; //骑手坐标
        calculateAndDisplayRoute(dirS, dirR,qlnglat,ulnglat);
      }

    }

  }

  //点击小地图查看大地图
  var bigFlag = false;//点击大地图 只画一次
  $(".map").bind("click", function(){
    if(state == 4 || state == 5){
      $(".mapPath").show();
      if(!bigFlag){
        bigFlag = true;
        if(site_map == 'baidu'){
          mapPath = new BMap.Map('mapPath');//大地图

        }else if (site_map == "google"){
          var centerPoint = new google.maps.LatLng(parseFloat(userlat), parseFloat(userlng));
          if(detail_type == 1 && state == 4 && buyfrom == 1){//骑手就近购买商品--中心点为骑手
            centerPoint = new google.maps.LatLng(parseFloat(pslat), parseFloat(pslng));
          }
          mapPath = new google.maps.Map(document.getElementById('mapPath'), {
            zoom: 12,
            center: centerPoint,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
            }
          });
          infoWindow = new google.maps.InfoWindow;
          infoWindow1 = new google.maps.InfoWindow;

        }else if (site_map == "amap"){
          var centerP = [userlng, userlat];
          if(detail_type == 1 && state == 4 && buyfrom == 1){//骑手就近购买商品--中心点为骑手
            centerP = [pslng, pslat];
          }
          mapPath = new AMap.Map('mapPath', {
              center: centerP,
              zoom: 15,
          });



        }
        intMap(mapPath,2);
      }
    }

  })

  //关闭大地图
  $("#closeMap").bind("click", function(){
    $(".mapPath").hide();
  });

  //刷新骑手位置
  $("#refreshMap").bind("click", function(){

   $.ajax({
      url: "/include/ajax.php",
      type: "post",
      data: {service: "waimai", action: "getpaotuiCourierLocation", courierid: courierid},
      dataType: "json",
      success: function(res){
        if(res.state == 100){
          //此处返回骑手坐标
          qsPoint(res.info.lng,res.info.lat,1);
        }
      }
    })
  })

  function qsPoint(x,y,clear){//骑手的lng 和lat clear--点击刷新
    pslng = x;
    pslat = y;
    if(state == 4){//取货中
      if(detail_type ==1){//帮我买
        if(buyfrom == 1){//就近购买
          sCont = '<p>骑手正在附近为您购买商品</p>';
        }else{
          sCont = '<p>骑手正赶往商店采购</p>';
        }

      }else{//取送
        sCont = '<p>骑手正赶往取货地址</p>'
      }

    }else{//配送中

      if(detail_type ==1){//帮我买
        sCont = '<p>商品已购买，预计'+xdTime+'送达</p>';
      }else{//取送
        sCont = '<p>骑手正在配送，预计'+xdTime+'送达</p>';
      }
    }

    if(site_map == 'baidu'){
      if(clear){//
        smallMap.clearOverlays();
        mapPath.clearOverlays();
      }

      var courier = new BMap.Point(x,y);  //骑手坐标
      bubbleLabel = new BMap.Label('<div class="bubble courier">'+sCont+'</div>', {
          position: courier,
          offset: new BMap.Size(-20, -45)
      });
      bubbleLabel2 = new BMap.Label('<div class="bubble courier">'+sCont+'</div>', {
          position: courier,
          offset: new BMap.Size(-20, -45)
      });
      bubbleLabel.setStyle(labelStyle);
      bubbleLabel2.setStyle(labelStyle);
      smallMap.addOverlay(bubbleLabel);
      if(bigFlag){
      mapPath.addOverlay(bubbleLabel2);
      }
      if(clear){//刷新时 重画路线 overlay
        drawComMap(smallMap);
        drawComMap(mapPath);
      }

    }else if(site_map == "amap"){
      if(clear){//
        smallMap.clearMap();
        mapPath.clearMap();
      }

      qsIcon = new AMap.Marker({
        position: [x,y],
        content: '<div class="bubble courier">'+sCont+'</div>',
        offset: new AMap.Pixel(-15, -33),
        map: smallMap
      });
      if(bigFlag){
        qsIcon2 = new AMap.Marker({
          position: [x,y],
          content: '<div class="bubble courier">'+sCont+'</div>',
          offset: new AMap.Pixel(-15, -33),
          map: mapPath
        });
      }
      if(clear){//刷新时 重画路线 overlay
        drawComMap(smallMap);
        drawComMap(mapPath);
      }
    }else if(site_map == "google"){
      if(clear){//刷新时 重画路线 overlay
        //清空之前画的marker
        if(markersArr){
          for (var i = 0; i < markersArr.length; i++) {
            markersArr[i].setMap(null);
          }
          markersArr.length = 0;
        }
      }
      var qposition = new google.maps.LatLng(parseFloat(y),parseFloat(x));
      qsIcon  = new MarkerWithLabel({
         position: qposition,
         draggable: true,
         map: smallMap,
         labelAnchor: new google.maps.Point(15, 50),
         labelContent: '<div class="bubble courier"></div>',
        icon:'/static/images/blank.gif',
      });

      infoWindow.setContent(sCont);
      infoWindow.open(smallMap, qsIcon);
      markersArr.push(qsIcon);
      if(bigFlag){
        qsIcon2  = new MarkerWithLabel({
           position: qposition,
           draggable: true,
           map: mapPath,
           labelAnchor: new google.maps.Point(15, 50),
           labelContent: '<div class="bubble courier"></div>',
          icon:'/static/images/blank.gif',
        });
        infoWindow1.setContent(sCont);
        infoWindow1.open(mapPath, qsIcon2);
        markersArr.push(qsIcon2);
      }


      if(clear){//刷新时 重画路线 overlay
        drawComMap(smallMap,directionsService,directionsRenderer,directionsService1,directionsRenderer1);
        drawComMap(mapPath,directionsService2,directionsRenderer2,directionsService3,directionsRenderer3);
      }

    }


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

function drawRoute(type,route,smapPath){//多条线 需传对应的地图
  var path = parseRouteToPath(route)
  var startMarker,endMarker;
  startMarker = new AMap.Marker({
    position: path[0],
    content: '<div></div>',
    offset: new AMap.Pixel(-15, -50),
    map: smapPath
  });
  endMarker = new AMap.Marker({
    position: path[path.length - 1],
    content: '<div></div>',
    // 以 icon 的 [center bottom] 为原点
    offset: new AMap.Pixel(-15, -50),
    map: smapPath
  })

    routeLine = new AMap.Polyline({
    path: path,
    strokeWeight: 5,
    strokeColor: '#027CFF',
    lineJoin: 'round'
  })
  routeLine.setMap(smapPath)
  // 调整视野达到最佳显示区域
  smapPath.setFitView([ startMarker, endMarker, routeLine ])

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


  $('body').delegate(".popPay", "click", function(){

    var ordernum1 = $(this).attr('data-ordernum');

    $.ajax({
      url: masterDomain+"/include/ajax.php?service=waimai&action=paotuiDeal",
      type: 'post',
      data: {'ordernum':ordernum1,'orderfinal':1},
      dataType: 'json',
      success: function(data){
        if(data && data.state == 100){

          sinfo = data.info;
          service   = 'waimai';
          $('#ordernum').val(sinfo.ordernum);
          $('#action').val('paotuipay');

          $("#pordertype").val('paotui');
          $('#pfinal').val('1');
          $("#amout").text(sinfo.order_amount);
          $('.payMask').show();
          $('.payPop').css('transform', 'translateY(0)');

          // if (totalBalance * 1 < sinfo.order_amount * 1) {
          //
          //   $("#moneyinfo").text('余额不足，');
          //
          //   $('#balance').hide();
          // }
          if (totalBalance * 1 < sinfo.order_amount * 1) {

            $("#moneyinfo").text('余额不足，');
            $("#moneyinfo").closest('.check-item').addClass('disabled_pay')

            $('#balance').hide();
          }


          if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
            $("#bonusinfo").text('额度不足，');
            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
          }else if( bonus * 1 < sinfo.order_amount * 1){
            $("#bonusinfo").text('余额不足，');
            $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
          }else{
            $("#bonusinfo").text('');
            $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
          }

          ordernum = sinfo.ordernum;
          order_amount = sinfo.order_amount;

          payCutDown('', sinfo.timeout, sinfo);
        }else{
          alert(data.info);
        }
      },
      error: function(){
        alert('网络错误，请重试！');
      }
    })
  });

})
