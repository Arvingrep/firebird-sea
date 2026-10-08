$(function(){

    var map = new BMap.Map("map", {enableMapClick: false});
    // map.centerAndZoom(mapCity, 13);
    map.enableScrollWheelZoom(); //启用滚轮放大缩小
    map.disableInertialDragging(); //禁用惯性拖拽

    var points = [];
    $.each(list, function(e, o) {
        var bubbleLabel, r = [];

        var state = "";
        if(o.state == 0){
            state = " closed";
        }

        bubbleLabel = new BMap.Label('<p class="bubble-3 bubble'+state+'"><i class="num">'+o.name+'</i><i class="arrow-up"><i class="arrow"></i><i></p>', {
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

        points.push(new BMap.Point(o.lat, o.lng));

    });

    //最佳视野显示所有配送员
    map.setViewport(points);

});
