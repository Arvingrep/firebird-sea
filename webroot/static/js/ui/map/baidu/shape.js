$(function(){
    var map = new BMap.Map('map', {enableMapClick: false});
    var map_default_lng = $("#lng").val();
    var map_default_lat = $("#lat").val();

    //回调获得覆盖物信息
    var overlays = [];
    var overlaycomplete = function(e){
        if(e){
            var path = e.getPath();
            var pathArr = [];
            for(var p = 0; p < path.length; p++){
                pathArr.push(new BMap.Point(path[p].lng, path[p].lat));
            }
            overlays.push(e);
            e.enableEditing();

            e.addEventListener("lineupdate",function(ea){
                var target = ea.currentTarget;
                for(var o = 0; o < overlays.length; o++){
                    if(target.K == overlays[o].K){
                        overlays[o] = target;
                    }
                }
                overlaycomplete();
            });
        }

        var overlayArr = [];
        for(var i = 0; i < overlays.length; i++){
            var path = overlays[i].getPath();
            var pathArr = [];
            for(var p = 0; p < path.length; p++){
                pathArr.push(path[p].lng+","+path[p].lat);
            }
            overlayArr.push(pathArr.join("|"));
        };
        $("#overlays").val(overlayArr.join("$$"));
    };

    //覆盖物样式
    var styleOptions = {
        strokeColor:"#2691ea", //边线颜色。
        fillColor:"#2691ea",   //填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 3,       //边线的宽度，以像素为单位。
        strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
        fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
        strokeStyle: 'dashed' //边线的样式，solid或dashed。
    }

    if($("#type").val() == ""){
        //实例化鼠标绘制工具
        var drawingManager = new BMapLib.DrawingManager(map, {
            isOpen: true,
            drawingType: BMAP_DRAWING_POLYGON,
            enableDrawingTool: true,
            drawingToolOptions: {
                anchor: BMAP_ANCHOR_TOP_RIGHT,
                offset: new BMap.Size(-14, 5),
                scale: 0.8,
                drawingTypes: [
                    BMAP_DRAWING_POLYGON
                ]
            },
            polygonOptions: styleOptions
        });

        //设置多边形为默认
        drawingManager.setDrawingMode(BMAP_DRAWING_POLYGON);

        //添加鼠标绘制工具监听事件，用于获取绘制结果
        drawingManager.addEventListener('polygoncomplete', overlaycomplete);
    }

    //删除其它功能DOM
    $(".BMapLib_Drawing_panel a").each(function(){
        var cla = $(this).attr("drawingtype");
        if(cla != "hander" && cla != "polygon"){
            $(this).remove();
        }
    });

    //增加删除按钮
    $(".BMapLib_Drawing_panel").append('<a class="BMapLib_box BMapLib_del BMapLib_last" drawingtype="del" href="javascript:void(0)" title="删除重画" onfocus="this.blur()"></a>');

    $(".BMapLib_Drawing_panel a").click(function(){
        var cla = $(this).attr("drawingtype");
        if(cla == "del"){
            clearAll();
            return false;
        }
    })

    //清除覆盖物
    function clearAll() {
        overlays.length = 0;
        map.clearOverlays();
        $("#overlays").val("");
    }


    //延迟加载，解决地图在浮动层内时，中心点不在正中心位置
    setTimeout(function(){
        var poi = new BMap.Point(map_default_lng, map_default_lat);
        map.addControl(new BMap.NavigationControl());
        map.centerAndZoom(poi, 15);
        map.enableScrollWheelZoom(true);

        marker = new BMap.Marker(poi);  //自定义标注
        map.addOverlay(marker);


        //初始增加覆盖物
        var overlayVal = $("#overlays").val();
        if(overlayVal != ""){
            overlayVal = overlayVal.split("$$");
            var pointsArr = [];
            for(var i = 0; i < overlayVal.length; i++){
                var points = [];
                var overlayArr = overlayVal[i].split("|");
                for(var o = 0; o < overlayArr.length; o++){
                    var overlayItem = overlayArr[o].split(",");
                    points.push(new BMap.Point(overlayItem[0], overlayItem[1]));
                    pointsArr.push(new BMap.Point(overlayItem[0], overlayItem[1]));
                }
                var polygon = new BMap.Polygon(points, styleOptions);
                overlays.push(polygon);

                map.addOverlay(polygon);

                if($("#type").val() == ""){
                    polygon.enableEditing();
                    drawingManager.close();

                    polygon.addEventListener("lineupdate",function(e){
                        var target = e.currentTarget;
                        for(var o = 0; o < overlays.length; o++){
                            if(target.K == overlays[o].K){
                                overlays[o] = target;
                            }
                        }
                        overlaycomplete();
                    });
                }
            }
            //map.setViewport(pointsArr);
        }
    }, 100);


});
