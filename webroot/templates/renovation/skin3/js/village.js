$(function(){

  function mapHui(lng,lat,listcompany,listaddress){
    

    //标注点数组 坐标位置 相关信息
    var markerArr = {
      title:listcompany,
      content:listaddress,
      pointLng:lng,
      pointLat:lat

    }; 
    //创建和初始化地图函数：
    function initMap(){

        if(site_map == 'baidu'){
          var map = new BMap.Map("dituContent");    // 创建Map实例
          //添加地图类型控件
          var top_left_navigation = new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_LEFT , type: BMAP_NAVIGATION_CONTROL_SMALL}); //左上角，仅包含平移和缩放按钮
          map.addControl(top_left_navigation);
          map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
          // 百度地图API功能
          var sContent =markerArr.title;
          var point = new BMap.Point(markerArr.pointLng, markerArr.pointLat);
          map.centerAndZoom(point, 15);
          var infoWindow = new BMap.InfoWindow(sContent);  // 创建信息窗口对象
          map.openInfoWindow(infoWindow,point); //开启信息窗口          
          var marker = new BMap.Marker(point);  // 创建标注
          map.addOverlay(marker);
        }else if(site_map == 'amap'){//高德地图
          var sContent =markerArr.title;
          var map = new AMap.Map('dituContent', {
                center: [markerArr.pointLng, markerArr.pointLat],
                zoom: 15,
            });
            AMap.plugin('AMap.ToolBar', function() { //异步加载插件
                var toolbar = new AMap.ToolBar();
                map.addControl(toolbar);
            });
            // 构造点标记
            var marker = new AMap.Marker({
                icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                position: [markerArr.pointLng, markerArr.pointLat]
            });
            map.add(marker);
            var content = [
                '<p style="line-height: 3em;">' + sContent + '</p>'
            ];
            // 创建 infoWindow 实例 
            var infoWindow = new AMap.InfoWindow({
               content: content.join("<br>")  //传入 dom 对象，或者 html 字符串
            });
            // 打开信息窗体
            infoWindow.open(map,[markerArr.pointLng, markerArr.pointLat]);
        }else if(site_map == 'google'){//谷歌地图
          var centerPoint = new google.maps.LatLng(parseFloat(markerArr.pointLat), parseFloat(markerArr.pointLng));

          var map = new google.maps.Map(document.getElementById('dituContent'), {
              zoom: 14,
              center: centerPoint,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              zoomControlOptions: {
                  style: google.maps.ZoomControlStyle.SMALL
              }
          });
          addcenMarker();
          var centerwindow = new google.maps.InfoWindow({
              content: '<div style="font-weight: 700; font-size: 16px;">' + markerArr.title + '</div>' + '<p style="line-height: 3em;">详细地址：' + markerArr.content + '</p>'
          });
          // 添加中心点
          function addcenMarker() {
              var marker = new google.maps.Marker({
                  position: centerPoint,
                  map: map,
                  title: markerArr.title
              });

              // 中心点点击事件
              marker.addListener('click', function() {
                  centerwindow.open(map, marker);
              });


          }
        }

    }
     // initMap();//创建和初始化地图
     setTimeout(function(){
      initMap();
     },510)

     $('.map_mask').show();

  }

  

  $('.village_list .place i').click(function(){
    var lnglat = $(this).data('lnglat').split(',');
    var vill_name = $(this).data('company');
    var vill_addr = $(this).data('address');

    $('.vill_name').text(vill_name);
    $('.vill_addr').text(vill_addr);
    mapHui(lnglat[0],lnglat[1],vill_name,vill_addr)
  })

})