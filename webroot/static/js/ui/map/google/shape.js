$(function(){

    var overlays = [];
    var map_default_lng = $("#lng").val();
    var map_default_lat = $("#lat").val();

    //地图默认配置
    var mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(map_default_lat, map_default_lng),
        mapTypeControl:false,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL//LARGE
        }
    };

    //覆盖物样式
    var styleOptions = {
        strokeColor:"#2691ea", //边线颜色。
        fillColor:"#2691ea",   //填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 3,       //边线的宽度，以像素为单位。
        strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
        fillOpacity: 0.4       //填充的透明度，取值范围0 - 1。
    }

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);

    var marker = new google.maps.Marker({
            position: mapOptions.center,
            map: map
        });

    var MapToolbar = {

        //当前选中
        currentFeature: null,

        shapeCounter: 0,

        addPoint: function(e, poly, index) {
            var e = (typeof e.latLng != "undefined") ? e.latLng: e,
            path = poly.getPath(),
            index = (typeof index != "undefined") ? index: path.length;
            path.insertAt(index, e);
        },

        buttons: {
            $hand: null,
            $shape: null
        },

        polyClickEvent: null,

        Feature: function(type) {
            if (type == "shape") {
                this['poly'](type);
            } else {
                this[type]();
            }
        },

        features: {
            shapeTab: {},
            overlayTab: {}
        },

        initFeature: function(type) {
            new MapToolbar.Feature(type);
        },

        isSelected: function(el) {
            return (el.className == "selected");
        },

        select: function(buttonId) {
            if($("#type").val() == ""){
                MapToolbar.buttons.$hand.className = "";
                MapToolbar.buttons.$shape.className = "";
                document.getElementById(buttonId).className = "selected";
            }
        },

        removeFeature : function(type){
            for(var i = 1; i <= overlays.length; i++){
                var feature = MapToolbar.features[type+'Tab']['shape_'+i];
                feature.setMap(null);
            }
            MapToolbar.features[type+'Tab'] = {};
            overlays = [];
            MapToolbar.select('hand_b');
            MapToolbar.shapeCounter = 0;
            updateLatlng();
        },

        stopEditing: function(status) {
            !status ? this.select("hand_b") : null;

            if(MapToolbar.currentFeature){
                var id = MapToolbar.currentFeature.id, isHas = false;
                for(var o = 0; o < overlays.length; o++){
                    if(overlays[o].id == id){
                        overlays[o] = MapToolbar.currentFeature;
                        isHas = true;
                    }
                }

                if(!isHas){
                    var path = MapToolbar.currentFeature.getPath();
                    var pathArray = path.getArray();
                    var pathArr = [];
                    for(var p = 0; p < pathArray.length; p++){
                        pathArr.push(new google.maps.LatLng(pathArray[p].lat(), pathArray[p].lng()));
                    }
                    overlays.push(MapToolbar.currentFeature);
                }

                updateLatlng();

                //监听覆盖拖动，更新坐标
                google.maps.event.addListener(MapToolbar.currentFeature, "dragend", function(event) {
                    var id = this.id;
                    for(var o = 0; o < overlays.length; o++){
                        if(overlays[o].id == id){
                            overlays[o] = this;
                        }
                    }
                    updateLatlng();
                });
            }

        }
    }

    MapToolbar.Feature.prototype.poly = function(type) {
        var path = new google.maps.MVCArray,
            poly,
            self = this,
            el = type + "_b";

        if (type == "shape") {
            poly = self.createShape(styleOptions, path);

            google.maps.event.addListener(path, 'insert_at', function(){
              MapToolbar.stopEditing(1);
            });

            google.maps.event.addListener(path, 'remove_at', function(){
              MapToolbar.stopEditing(1);
            });

            google.maps.event.addListener(path, 'set_at', function(){
              MapToolbar.stopEditing(1);
            });
        }

        if($("#type").val() == ""){
            poly.markers = new google.maps.MVCArray;

            if (MapToolbar.isSelected(document.getElementById(el))) return;
            MapToolbar.select(el);
            MapToolbar.currentFeature = poly;
            poly.setMap(map);
            if (!poly.$el) {++MapToolbar[type + "Counter"];
                poly.id = type + '_' + MapToolbar[type + "Counter"];
                MapToolbar.features[type + "Tab"][poly.id] = poly;
            }
        }
    }

    MapToolbar.Feature.prototype.createShape = function(opts, path) {
        var poly;
        poly = new google.maps.Polygon(opts);
        poly.setPaths(new google.maps.MVCArray([path]));
        poly.setEditable(true);
        poly.setDraggable(true);

        return poly;
    }

    function updateLatlng(){
        var overlayArr = [];
        for(var i = 0; i < overlays.length; i++){
            var path = overlays[i].getPath();
            var pathArray = path.getArray();
            var pathArr = [];
            for(var p = 0; p < pathArray.length; p++){
                pathArr.push(pathArray[p].lat()+","+pathArray[p].lng());
            }
            overlayArr.push(pathArr.join("|"));
        };
        $("#overlays").val(overlayArr.join("$$"));
    }

    function initialize(container) {
        if($("#type").val() == ""){
            with(MapToolbar) {
                with(buttons) {
                    $hand = document.getElementById("hand_b");
                    $shape = document.getElementById("shape_b");
                }
                $featureTable = document.getElementById("featuretbody");
                select("hand_b");
            }

            MapToolbar.polyClickEvent = google.maps.event.addListener(map, 'click', function(event) {
                if (!MapToolbar.isSelected(MapToolbar.buttons.$shape)) return;
                if (MapToolbar.currentFeature) {
                    MapToolbar.addPoint(event, MapToolbar.currentFeature);
                }
            });
        }

        //初始增加覆盖物
        var overlayVal = $("#overlays").val();
        if(overlayVal != ""){
            overlayVal = overlayVal.split("$$");
            var bounds = new google.maps.LatLngBounds();
            for(var i = 0; i < overlayVal.length; i++){
                var points = [];
                var overlayArr = overlayVal[i].split("|");
                for(var o = 0; o < overlayArr.length; o++){
                    var overlayItem = overlayArr[o].split(",");
                    points.push(new google.maps.LatLng(overlayItem[0], overlayItem[1]));
                    bounds.extend(new google.maps.LatLng(overlayItem[0], overlayItem[1]));
                }
                var polygon = new google.maps.Polygon(styleOptions);
                polygon.setPaths(points);

                if($("#type").val() == ""){
                    polygon.setEditable(true);
                    polygon.setDraggable(true);
                }

                polygon.setMap(map);
                ++MapToolbar["shapeCounter"];
                polygon.id = 'shape_' + MapToolbar["shapeCounter"];
                overlays.push(polygon);

                polygon.markers = new google.maps.MVCArray;

                MapToolbar.features.shapeTab[polygon.id] = polygon;

                //监听覆盖拖动，更新坐标
                google.maps.event.addListener(polygon, "dragend", function(event) {
                    var id = this.id;
                    for(var o = 0; o < overlays.length; o++){
                        if(overlays[o].id == id){
                            overlays[o] = this;
                        }
                    }
                    updateLatlng();
                });

            }
            //map.fitBounds(bounds);

        }else{
            MapToolbar.initFeature('shape');
        }
    }

    initialize();

    //拖动地图
    $("#hand_b").bind("click", function(){
        MapToolbar.stopEditing();
    });

    //画多边形
    $("#shape_b").bind("click", function(){
        MapToolbar.initFeature('shape');
    });

    //删除
    $(".del").bind("click", function(){
        MapToolbar.removeFeature('shape');
    });

});
