$(function(){

	if(site_map == "baidu"){
		// 百度地图API功能
      var dlnglat = detPoint.split(',');
	    var map = new BMap.Map("allmap");
	    var point = new BMap.Point(dlnglat[0],dlnglat[1]);
	    var marker = new BMap.Marker(point);  // 创建标注
	    map.addOverlay(marker);              // 将标注添加到地图中
	    map.centerAndZoom(point, 15);
	    var opts = {
	      width : 200,     // 信息窗口宽度
	      height: 50,     // 信息窗口高度
	      title : dTitle , // 信息窗口标题
	      enableMessage:true,//设置允许信息窗发送短息
	      message:""
	    }
	    var infoWindow = new BMap.InfoWindow("地址："+dAddress, opts);  // 创建信息窗口对象 
	    map.openInfoWindow(infoWindow,point); //开启信息窗口
	    marker.addEventListener("click", function(){          
	      map.openInfoWindow(infoWindow,point); //开启信息窗口
	    });
	}else if(site_map == "amap"){

		setTimeout(function(){
			var dlnglat = detPoint.split(',');
			var map = new AMap.Map('allmap', {
			        center: [dlnglat[0],dlnglat[1]],
			        zoom: 15,
			    });
		    AMap.plugin('AMap.ToolBar', function() { //异步加载插件
		        var toolbar = new AMap.ToolBar();
		        map.addControl(toolbar);
		    });

		    // 构造点标记
		    var marker = new AMap.Marker({
		        icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
		        position: [dlnglat[0],dlnglat[1]]
		    });
		    map.add(marker);
		    var content = [
		        '<p style="line-height: 3em;">' + dTitle + '</p>'
		    ];
		    // 创建 infoWindow 实例 
		    var infoWindow = new AMap.InfoWindow({
		       content: content.join("<br>")  //传入 dom 对象，或者 html 字符串
		    });
		    // 打开信息窗体
		    infoWindow.open(map,[dlnglat[0],dlnglat[1]]);
		},500)
	}else{
		var dlnglat = detPoint.split(',');
		// 初始化地图
	    init();
	    function init(){
	        centerPoint = new google.maps.LatLng(parseFloat(dlnglat[1]), parseFloat(dlnglat[0]));

	        map = new google.maps.Map(document.getElementById('allmap'), {
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
	    }

	    var centerwindow = new google.maps.InfoWindow({
	        content: '<div style="font-weight: 700; font-size: 16px;">' + dTitle + '</div>' + '<p style="line-height: 3em;">详细地址：' + dAddress + '</p>'
	    });
	    // 添加中心点
	    function addcenMarker() {
	        var marker = new google.maps.Marker({
	            position: centerPoint,
	            map: map,
	            title: dTitle,
	            icon: cenicon,
	        });

	        // 中心点点击事件
	        marker.addListener('click', function() {
	            centerwindow.open(map, marker);
	        });


	    }
	}

})
