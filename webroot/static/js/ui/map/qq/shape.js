$(function(){

    var map_default_lng  = $("#lng").val(),
        map_default_lat  = $("#lat").val();

	//初始化变量
	var mapOptions = {
			zoom: 14,
			center: new qq.maps.LatLng(map_default_lat, map_default_lng),
			mapTypeControl:false,
			zoomControl: true,
			zoomControlOptions: {
				style: qq.maps.ZoomControlStyle.SMALL
			}
		};

    var editable = $("#type").val() == "" ? true : false;

	//覆盖物样式
    var styleOptions = {
        strokeColor: new qq.maps.Color(38, 145, 234),
        fillColor: new qq.maps.Color(38, 145, 234, 0.3),
        strokeWeight: 3,
        strokeDashStyle: 'dash',
        editable: editable
    }
	
	var map = new qq.maps.Map(document.getElementById("map"), mapOptions);

    var marker = new qq.maps.Marker({
        position: mapOptions.center,
        map: map
    });

    if($("#type").val() == ""){
    	var drawingManager = new qq.maps.drawing.DrawingManager({
            drawingMode: "polygon",
            drawingControl: false,
            drawingControlOptions: {
                position: qq.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                    qq.maps.drawing.OverlayType.POLYGON
                ]
            },
            polygonOptions: styleOptions
        });
        drawingManager.setMap(map);
    }

    //回调获得覆盖物信息
    var overlays = [];
    var overlaycomplete = function(e){
        if(e){
            var path = e.getPath();
            var pathArr = [];
            for(var p = 0; p < path.length; p++){
                pathArr.push(new qq.maps.LatLng(path.elems[p].lat, path.elems[p].lng));
            }
            overlays.push(e);

            $("#hand_b").click();

            if($("#type").val() == ""){
                qq.maps.event.addListener(drawingManager, 'path_changed', function(){
                	alert(1);
                })
            }
        }

        var overlayArr = [];
        for(var i = 0; i < overlays.length; i++){
            var path = overlays[i].getPath();
            var pathArr = [];
            for(var p = 0; p < path.length; p++){
                pathArr.push(path.elems[p].lat+","+path.elems[p].lng);
            }
            overlayArr.push(pathArr.join("|"));
        };
        $("#overlays").val(overlayArr.join("$$"));
    };

    if($("#type").val() == ""){
        //添加鼠标绘制工具监听事件，用于获取绘制结果
        qq.maps.event.addListener(drawingManager, 'polygoncomplete', overlaycomplete);
    }

	//拖动地图
    $("#hand_b").bind("click", function(){
    	$(".toolbar .selected").removeClass();
    	$(this).addClass("selected");
        drawingManager.drawingMode = "none";
        drawingManager.setMap(map);

        overlaycomplete();
    });

    //画多边形
    $("#shape_b").bind("click", function(){
    	$(".toolbar .selected").removeClass();
    	$(this).addClass("selected");
        drawingManager.drawingMode = "polygon";
        drawingManager.setMap(map);
    });

    //删除
    $(".del").bind("click", function(){
    	if(overlays){
    		for (i in overlays) {
	            overlays[i].setMap(null);
	        }
	        overlays.length = 0;
	        $("#overlays").val("");
	    }
    });

    //初始增加覆盖物
    var overlayVal = $("#overlays").val();
    if(overlayVal != ""){
        overlayVal = overlayVal.split("$$");
        var latlngBounds = new qq.maps.LatLngBounds()
        for(var i = 0; i < overlayVal.length; i++){
            var points = [];
            var overlayArr = overlayVal[i].split("|");
            for(var o = 0; o < overlayArr.length; o++){
                var overlayItem = overlayArr[o].split(",");
                points.push(new qq.maps.LatLng(overlayItem[0], overlayItem[1]));
                latlngBounds.extend(new qq.maps.LatLng(overlayItem[0], overlayItem[1]));
            }
            var polygon = new qq.maps.Polygon(styleOptions);
            polygon.setPath(points);
            polygon.setMap(map);
            overlays.push(polygon);
        }
        //map.fitBounds(latlngBounds);
        $("#hand_b").click();
    }else{
    	$("#shape_b").click();
    }

});