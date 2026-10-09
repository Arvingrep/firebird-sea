$(function(){

    var map_default_lng = $("#lng").val();
    var map_default_lat = $("#lat").val();

	//初始化变量
	var mapOptions = {
			zoom: 13,
			center: new AMap.LngLat(map_default_lng, map_default_lat)
		};

    var overlays = [], tools = [];

	//覆盖物样式
    var styleOptions = {
        strokeColor:"#2691ea", //边线颜色。
        fillColor:"#2691ea",   //填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 3,       //边线的宽度，以像素为单位。
        strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
        fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
        strokeStyle: 'dashed' //边线的样式，solid或dashed。
    }
	
	var map = new AMap.Map("map", {view: new AMap.View2D(mapOptions)});

	//在地图中添加ToolBar插件
    map.plugin(["AMap.ToolBar"],function(){     
        toolBar = new AMap.ToolBar();
        toolBar.show();
        toolBar.showDirection();
        toolBar.hideRuler();
        map.addControl(toolBar);    
    });

    if($("#type").val() == ""){
        //在地图中添加MouseTool插件
    	map.plugin(["AMap.MouseTool"],function(){ 
    		mouseTool = new AMap.MouseTool(map); 
    		mouseTool.polygon(styleOptions);   //使用鼠标工具绘制多边形
        
            AMap.event.addListener(mouseTool,"draw",function(e){
                var drawObj = e.obj;  //obj属性就是绘制完成的覆盖物对象。
                var path = drawObj.getPath();
                drawObj.setMap(null);

                var polygon = new AMap.Polygon({
                    map: map,
                    path: path,
                    strokeColor: styleOptions.strokeColor,
                    strokeOpacity: styleOptions.strokeOpacity,
                    strokeWeight: styleOptions.strokeWeight,
                    fillColor: styleOptions.fillColor,
                    fillOpacity: styleOptions.fillOpacity,
                    strokeStyle: styleOptions.strokeStyle
                });

                overlays.push(polygon);
                updateLatlng();
                
                //添加编辑控件
                map.plugin(["AMap.PolyEditor"], function(a) {
                    editorTool = new AMap.PolyEditor(map, polygon);
                    editorTool.open();
                    tools.push(editorTool);
                });
            });
    	});
    }

    //配置marker图标
    var markerOption = {
        map: map,
        position: map.getCenter()
    };

    mar = new AMap.Marker(markerOption);

    //更新节点数据
    function updateLatlng(){
        var overlayArr = [];
        for(var i = 0; i < overlays.length; i++){
            var path = overlays[i].getPath();
            var pathArr = [];
            for(var p = 0; p < path.length; p++){
                pathArr.push(path[p].A+","+path[p].D);
            }
            overlayArr.push(pathArr.join("|"));
        };
        $("#overlays").val(overlayArr.join("$$"));
    };

	//拖动地图
    $(".ok").bind("click", function(){
    	$(".toolbar .selected").removeClass();
    	$(this).addClass("selected");
        updateLatlng();
    });

    //删除
    $(".del").bind("click", function(){
    	if(overlays){
    		for (i in overlays) {
	            overlays[i].setMap(null);
                tools[i].close();
	        }
            tools.length = 0;
	        overlays.length = 0;
	        $("#overlays").val("");
	    }
    });

    //初始增加覆盖物
    var overlayVal = $("#overlays").val();
    if(overlayVal != ""){
        overlayVal = overlayVal.split("$$");
        for(var i = 0; i < overlayVal.length; i++){
            var points = [];
            var overlayArr = overlayVal[i].split("|");
            for(var o = 0; o < overlayArr.length; o++){
                var overlayItem = overlayArr[o].split(",");
                points.push(new AMap.LngLat(overlayItem[0], overlayItem[1]));
            }

            var polygon = new AMap.Polygon({
                map: map,
                path: points,
                strokeColor: styleOptions.strokeColor,
                strokeOpacity: styleOptions.strokeOpacity,
                strokeWeight: styleOptions.strokeWeight,
                fillColor: styleOptions.fillColor,
                fillOpacity: styleOptions.fillOpacity,
                strokeStyle: styleOptions.strokeStyle
            });
            overlays.push(polygon);

            if($("#type").val() == ""){
                //添加编辑控件
                map.plugin(["AMap.PolyEditor"], function(a) {
                    editorTool = new AMap.PolyEditor(map, polygon);
                    editorTool.open();  //编辑功能
                    tools.push(editorTool);
                });
            }
        }
        //map.setFitView();  //使地图自适应显示到合适的范围
    }

});