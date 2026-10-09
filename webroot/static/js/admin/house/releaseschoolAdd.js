var ue = UE.getEditor('body');
var $lnglat = $("#lnglat").val().split(',');
	var cordY = $lnglat[0];
	var cordX = $lnglat[1];
$(function(){

	huoniao.parentHideTip();

	var thisURL   = window.location.pathname;
		tmpUPage  = thisURL.split( "/" );
		thisUPage = tmpUPage[ tmpUPage.length-1 ];
		thisPath  = thisURL.split(thisUPage)[0];

	var init = {
		//提示信息
		showTip: function(type, message){
			var obj = $("#infoTip");
			obj.html('<span class="msg '+type+'">'+message+'</span>').show();

			setTimeout(function(){
				obj.fadeOut();
			}, 5000);
		},

		//树形递归分类
		treeTypeList: function(){
			var typeList = [], cl = "";
			var l=addrListArr;
			typeList.push('<option value="0">请选择</option>');
			for(var i = 0; i < l.length; i++){
				(function(){
					var jsonArray =arguments[0], jArray = jsonArray.lower, selected = "";
					if(addrid == jsonArray["id"]){
						selected = " selected";
					}
					typeList.push('<option value="'+jsonArray["id"]+'"'+selected+'>'+cl+"|--"+jsonArray["typename"]+'</option>');
					for(var k = 0; k < jArray.length; k++){
						cl += '    ';
						var selected = "";
						if(addrid == jArray[k]["id"]){
							selected = " selected";
						}
						if(jArray[k]['lower'] != ""){
							arguments.callee(jArray[k]);
						}else{
							typeList.push('<option value="'+jArray[k]["id"]+'"'+selected+'>'+cl+"|--"+jArray[k]["typename"]+'</option>');
						}
						if(jsonArray["lower"] == null){
							cl = "";
						}else{
							cl = cl.replace("    ", "");
						}
					}
				})(l[i]);
			}
			return typeList.join("");
		}
	};

	//填充区域
	$("#addrid").html(init.treeTypeList());

    var mapFlag = 0;
	//头部导航切换
	$(".config-nav button").bind("click", function(){
		var index = $(this).index(), type = $(this).attr("data-type");
		if(!$(this).hasClass("active")){
			$(".item").hide();
			$(".item:eq("+index+")").fadeIn();
			if(index == 1 && !mapFlag){//mapFlag 控制地图只执行一次
                mapFlag = 1; 
				mapDraw();
			}
		}
	});
	//获取指定index的颜色值
	  function getColor(index){
	    var color = "2691ea";
	    if(index == 0){
	        color = "0f5bb0";
	    }else if(index == 1){
	        color = "90c738";
	    }else if(index == 2){
	        color = "05944b";
	    }else if(index == 3){
	        color = "9a6b38";
	    }else if(index == 4){
	        color = "6c553c";
	    }else if(index == 5){
	        color = "4788ee";
	    }else if(index == 6){
	        color = "b56fe7";
	    }else if(index == 7){
	        color = "fa96cc";
	    }else if(index == 8){
	        color = "ee4565";
	    }else if(index == 9){
	        color = "e90000";
	    }
	    return "#" + color;
	  }
	var mapview, drawType = "poly", defaultPolygon = [], editArea = 0;
	
	function mapDraw(){
		//覆盖物样式
	    var styleOptions = {
	          strokeColor:"#2691ea", //边线颜色。
	          fillColor:"#2691ea",   //填充颜色。当参数为空时，圆形将没有填充效果。
	          strokeWeight: 3,       //边线的宽度，以像素为单位。
	          strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
	          fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
	          strokeStyle: 'solid' //边线的样式，solid或dashed。
	    };
	    $lnglat = $("#lnglat").val().split(',');
	    cordY = $lnglat[0];
	    cordX = $lnglat[1];

        // 百度地图
        if (site_map == "baidu") {

            var overlays = [], drawingManager;
            mapview = new BMap.Map("mapview", {enableMapClick: false});
            var mPoint = new BMap.Point(cordY, cordX);
            var marker = new BMap.Marker(mPoint);
            mapview.centerAndZoom(mPoint, 14);
            mapview.addOverlay(marker);

            var bottom_right_control = new BMap.NavigationControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT, type: BMAP_NAVIGATION_CONTROL_SMALL});
            mapview.addControl(bottom_right_control);
            mapview.enableScrollWheelZoom(true);


            //初始加载已有区域
            $(".mapview").find(".area").each(function(index){
                var t = $(this), points = t.attr("data-points"), leix = t.attr("data-leix"), range = t.attr("data-teach");

                if(points != "" && points != undefined){
                    var pointsArr = [];
                    var paths = points.split("|");
                    for(var p = 0; p < paths.length; p++){
                        var path = paths[p].split(",");
                        pointsArr.push(new BMap.Point(path[0], path[1]));
                    }

                    var options = {
                        strokeColor:getColor(index), //边线颜色。
                        fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。
                        strokeWeight: 3,       //边线的宽度，以像素为单位。
                        strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                        fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                        strokeStyle: 'dashed' //边线的样式，solid或dashed。
                    };

                    var polygon = new BMap.Polygon(pointsArr, options);
                    mapview.addOverlay(polygon);

                    defaultPolygon[index] = [];
                    defaultPolygon[index]['leix'] = leix;
                    defaultPolygon[index]['range'] = range;
                    defaultPolygon[index]['polygon'] = polygon;
                }
            });


            //回调获得覆盖物信息
            var overlaycomplete = function(e){
                if(e){
                    var path = e.getPath();//获取多边形轮廓线节点数组 其中lat和lng是经纬度参数。
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

            };

            //停止拖拽地图时重新绘制
            var drawEnd = function(){
                if(overlays.length > 0){
                    mapview.removeOverlay(overlays[0]);
                    var points = [];
                    var path = overlays[0].getPath();
                    for(var p = 0; p < path.length; p++){
                        points.push(new BMap.Point(path[p].lng, path[p].lat));
                    }

                    var polygon = new BMap.Polygon(points, styleOptions);
                    mapview.addOverlay(polygon);
                    polygon.enableEditing();
                    overlays[0] = polygon;

                    polygon.addEventListener("lineupdate",function(ea){
                        var target = ea.currentTarget;
                        for(var o = 0; o < overlays.length; o++){
                            if(target.K == overlays[o].K){
                                overlays[o] = target;
                            }
                        }
                        overlaycomplete();
                    });
                }
            };

            //监听地图拖拽事件
            mapview.addEventListener('dragend', drawEnd);

            //实例化鼠标绘制工具
            drawingManager = new BMapLib.DrawingManager(mapview, {
                isOpen: false,
                drawingType: BMAP_DRAWING_POLYGON,
                enableDrawingTool: false,
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


            //新增施教范围
            $(".add-area").bind("click", function(){
                var t = $(this);
                var template = $("#addNewArea").html();
                var count = $(".mapview").find(".area").length;

                editArea = 0;

                var color = getColor(count);
                styleOptions['strokeColor'] = color;
                styleOptions['fillColor'] = color;

                if(!t.hasClass("add-area-disabled")){
                    t.addClass("add-area-disabled");
                    $(".mapview").find(".edit-opr").addClass("hide");

                    template = template.replace("areaCount", "area"+(count+1));

                    t.before(template);
                    drawingManager.open();


                }
            });


            //删除新增未保存的区域
            $(".mapview").off('click').delegate(".J-remove", "click", function(){
                var t = $(this);

                if(confirm("退出编辑后，此次修改将不会生效，是否确定退出？")){
                    $(".mapview").find(".edit-opr").removeClass("hide");
                    $(".add-area").removeClass("add-area-disabled");
                    mapview.removeOverlay(overlays[0]);
                    overlays = [];
                    drawingManager.close();
                    drawType = "poly";

                    if(editArea){

                        var data = defaultPolygon[editArea-1];
                        var points = data['polygon'].getPath();
                        var pointsArr = [], pointsList = [];
                        if(points){
                            for (var i = 0; i < points.length; i++) {
                                pointsArr.push(points[i].lng+","+points[i].lat);
                                pointsList.push(new BMap.Point(points[i].lng, points[i].lat));
                            }
                        }
                        var shijiaoTxt = $(".min-price .shijiao option[value="+data['leix']+"]").text(); 

                        var newArea = '<div class="area area'+editArea+'" data-index="'+editArea+'" data-points="'+pointsArr.join("|")+'" data-leix="'+data['leix']+'" data-teach="'+data['range']+'">';
                            newArea += '<div class="area-boder">';
                            newArea += '        <div class="clearfix">';
                            newArea += '            <span class="item-title pull-left">施教范围</span>';
                            newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                            newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                            newArea += '                <i class="c-gray"> / </i>';
                            newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                            newArea += '            </span>';
                            newArea += '        </div>';
                            newArea += '        <div class="J-min-price min-price">';
                            newArea += '            <span>学校类型 </span>';
                            newArea += '            <span class="fr J-value"><i>'+shijiaoTxt+'</i></span>';
                            newArea += '        </div>';
                            newArea += '        <div class="J-shipping-fee shipping-fee">';
                            newArea += '            <span class="shipping-fee-text">施教区 </span>';
                            newArea += '            <span class="fr J-value"><i>'+data['range']+'</i></span>';
                            newArea += '        </div>';
                            newArea += '    </div>';
                            newArea += '</div>';


                        var options = {
                            strokeColor:getColor((editArea-1)), //边线颜色。
                            fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。
                            strokeWeight: 3,       //边线的宽度，以像素为单位。
                            strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                            fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                            strokeStyle: 'dashed' //边线的样式，solid或dashed。
                        };

                        var polygon = new BMap.Polygon(pointsList, options);
                        mapview.addOverlay(polygon);
                        defaultPolygon[editArea-1]['polygon'] = polygon;
                        t.closest(".area").before(newArea);
                    }

                    t.closest(".area").remove();

                }
            });


            //保存新增的区域
            $(".mapview").delegate(".J-save", "click", function(){
                var t = $(this);

                if(overlays[0]){

                    var path = overlays[0].getPath();
                    var pathArr = [];
                    var pointsArr = [];
                    for(var p = 0; p < path.length; p++){
                        pathArr.push(path[p].lng+","+path[p].lat);
                        pointsArr.push(new BMap.Point(path[p].lng, path[p].lat));
                    }

                    var count = editArea ? editArea : $(".mapview").find(".area").length;
                    var shijiao = t.closest(".area").find(".min-price .shijiao").val();
                    var teachQy = t.closest(".area").find(".shipping-fee .teachArea").text();
                    var shijiaoTxt = t.closest(".area").find(".min-price option:selected").text();           
                    if(shijiao == ''){
                    	alert('请选择学校类型');
                    	return false;
                    }
                    if(teachQy == ''){
                    	alert('请输入施教区');
                    	return false;
                    }
                    if(count > 10){
                        alert("最多设置10个配送区域！");
                        return false;
                    }

                    var newArea = '<div class="area area'+count+'" data-index="'+count+'" data-points="'+pathArr.join("|")+'" data-leix="'+shijiao+'" data-teach="'+teachQy+'">';
                        newArea += '<div class="area-boder">';
                        newArea += '        <div class="clearfix">';
                        newArea += '            <span class="item-title pull-left">施教范围</span>';
                        newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                        newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                        newArea += '                <i class="c-gray"> / </i>';
                        newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                        newArea += '            </span>';
                        newArea += '        </div>';
                        newArea += '        <div class="J-min-price min-price">';
                        newArea += '            <span>学校类型 </span>';
                        newArea += '            <span class="fr J-value"><i>'+shijiaoTxt+'</i></span>';
                        newArea += '        </div>';
                        newArea += '        <div class="J-shipping-fee shipping-fee">';
                        newArea += '            <span class="shipping-fee-text">施教区 </span>';
                        newArea += '            <span class="fr J-value"><i>'+teachQy+'</i></span>';
                        newArea += '        </div>';
                        newArea += '    </div>';
                        newArea += '</div>';


                    var options = {
                        strokeColor:getColor((count-1)), //边线颜色。
                        fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。
                        strokeWeight: 3,       //边线的宽度，以像素为单位。
                        strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                        fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                        strokeStyle: 'dashed' //边线的样式，solid或dashed。
                    };

                    var polygon = new BMap.Polygon(pointsArr, options);
                    mapview.addOverlay(polygon);

                    if(editArea){
                        t.closest(".area").before(newArea);
                        t.closest(".area").remove();
                    }else{
                        $(".mapview .area:last").remove();
                        $(".add-area").before(newArea);
                    }

                    $(".mapview").find(".edit-opr").removeClass("hide");
                    $(".add-area").removeClass("add-area-disabled");
                    mapview.removeOverlay(overlays[0]);
                    overlays = [];
                    drawingManager.close();
                    drawType = "poly";

                    defaultPolygon[count-1] = [];
                    defaultPolygon[count-1]['leix'] = shijiao;
                    defaultPolygon[count-1]['range'] = teachQy;
                    defaultPolygon[count-1]['polygon'] = polygon;

                    if(count >= 10){
                        $(".add-area").addClass("add-area-disabled");
                    }

                    editArea = 0;

                }else{
                    alert("请先绘制配送范围！");
                }
            });


            //编辑区域
            $(".mapview").delegate(".J-edit", "click", function(){
                var t = $(this), index = t.closest(".area").index(), ltype = t.closest(".area").attr("data-leix"), range = t.closest(".area").attr("data-teach"), points = t.closest(".area").attr("data-points");
                editArea = index + 1;
                mapview.removeOverlay(defaultPolygon[index]['polygon']);

                var pointsList = [];
                var pointsArr = points.split("|");
                for(var p = 0; p < pointsArr.length; p++){
                    var point = pointsArr[p].split(",");
                    pointsList.push(new BMap.Point(point[0], point[1]));
                }

                var color = getColor(index);
                styleOptions['strokeColor'] = color;
                styleOptions['fillColor'] = color;

                var polygon = new BMap.Polygon(pointsList, styleOptions);
                mapview.addOverlay(polygon);
                polygon.enableEditing();

                overlays[0] = polygon;

                var btn = $(".add-area");
                var template = $("#addNewArea").html();
                btn.addClass("add-area-disabled");
                $(".mapview").find(".edit-opr").addClass("hide");
                template = template.replace("areaCount", "area"+(index+1));
                template = template.replace("删除", "取消");

                t.closest(".area").before(template);
                $(".min-price .shijiao").val(ltype);
                $(".shipping-fee .teachArea").text(range);
                t.closest(".area").remove();

            });


            //删除区域 已经画完的
            $(".mapview").delegate(".J-del", "click", function(){

                var t =  $(this), index = Number(t.closest(".area").attr("data-index"));

                if(confirm("确认要删除吗？")){

                    //先删除地图上已有的多边形
                    for (var i = 0; i < defaultPolygon.length; i++) {
                        var polygon = defaultPolygon[i]['polygon'];
                        mapview.removeOverlay(polygon);
                    }

                    defaultPolygon.splice((index-1), 1);//删除 index-1 开始的一个 就是删除本身
                    $(".mapview .area").remove();

                    var newDefaultPolygon = [];
                    //循环画出剩下的图形 和 内容
                    for (var i = 0; i < defaultPolygon.length; i++) {
                        var polygon = defaultPolygon[i]['polygon'], leix = defaultPolygon[i]['leix'], range = defaultPolygon[i]['range'];

                        if(polygon){
                            var pointsArr = [], pointsList = [];
                            var paths = polygon.getPath();
                            for(var p = 0; p < paths.length; p++){
                                pointsArr.push(new BMap.Point(paths[p].lng, paths[p].lat));
                                pointsList.push(paths[p].lng + "," + paths[p].lat);
                            }

                            var options = {
                                strokeColor:getColor(i), //边线颜色。
                                fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。
                                strokeWeight: 3,       //边线的宽度，以像素为单位。
                                strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                                fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                                strokeStyle: 'dashed' //边线的样式，solid或dashed。
                            };

                            var polygon = new BMap.Polygon(pointsArr, options);
                            mapview.addOverlay(polygon);

                            newDefaultPolygon[i] = [];
                            newDefaultPolygon[i]['leix'] = leix;
                            newDefaultPolygon[i]['range'] = range;
                            newDefaultPolygon[i]['polygon'] = polygon;

                            var shijiaoTxt = $(".min-price .shijiao option[value="+leix+"]").text(); 

                            var newArea = '<div class="area area'+(i+1)+'" data-index="'+(i+1)+'" data-points="'+pointsList.join("|")+'" data-leix="'+leix+'" data-teach="'+range+'">';
                                newArea += '<div class="area-boder">';
                                newArea += '        <div class="clearfix">';
                                newArea += '            <span class="item-title pull-left">施教范围</span>';
                                newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                                newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                                newArea += '                <i class="c-gray"> / </i>';
                                newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                                newArea += '            </span>';
                                newArea += '        </div>';
                                newArea += '        <div class="J-min-price min-price">';
                                newArea += '            <span>学校类型 </span>';
                                newArea += '            <span class="fr J-value"><i>'+shijiaoTxt+'</i></span>';
                                newArea += '        </div>';
                                newArea += '        <div class="J-shipping-fee shipping-fee">';
                                newArea += '            <span class="shipping-fee-text">施教区 </span>';
                                newArea += '            <span class="fr J-value"><i>'+range+'</i></span>';
                                newArea += '        </div>';
                                newArea += '    </div>';
                                newArea += '</div>';

                            $(".add-area").before(newArea);
                        }
                    }

                    defaultPolygon = newDefaultPolygon;

                };

            });

        // 高德地图
        }else if(site_map == "amap"){

        	var overlays = [];
        	var mapview = new AMap.Map("mapview", {
		        center: [cordY, cordX],
		        zoom: 14
		    });
		    // 构造点标记
			var marker = new AMap.Marker({
			    icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
			    position: [cordY, cordX]
			});
		    mapview.add(marker);
		    //初始加载已有区域
            $(".mapview").find(".area").each(function(index){
                var t = $(this), points = t.attr("data-points"), leix = t.attr("data-leix"), range = t.attr("data-teach");

                if(points != "" && points != undefined){
                    var pointsArr = [];
                    var paths = points.split("|");
                    for(var p = 0; p < paths.length; p++){
                        var path = paths[p].split(",");
                        pointsArr.push(path);
                    }

                    var polygon = new AMap.Polygon({
                    	path:pointsArr,
                        strokeColor:getColor(index), //边线颜色。
                        fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。
                        strokeWeight: 3,       //边线的宽度，以像素为单位。
                        strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                        fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                        strokeStyle: 'dashed' //边线的样式，solid或dashed。
                    });

                    mapview.add(polygon);

                    defaultPolygon[index] = [];
                    defaultPolygon[index]['leix'] = leix;
                    defaultPolygon[index]['range'] = range;
                    defaultPolygon[index]['polygon'] = polygon;
                }
            });
		    var polyEditor,mouseTool;
		    
			function drawingManager(tr){//鼠标绘制多边形	
				AMap.plugin(["AMap.MouseTool"],function () {
				    mouseTool = new AMap.MouseTool(mapview);
				});
				mouseTool.on('draw',function(e){//绘制结束
				    overlays.push(e.obj);				    
				    mouseTool.close()//关闭 一次只绘制一个
				    AMap.plugin(["AMap.PolyEditor"],function () {
				        polyEditor = new AMap.PolyEditor(mapview,e.obj);
				    });		    
				    polyEditor.open();//打开编辑	
				    
				   						    
				})  
				mouseTool.polygon({
	              fillColor:styleOptions['fillColor'],
	              strokeColor: styleOptions['strokeColor']
	            });
			}		    

		    //新增施教范围
            $(".add-area").bind("click", function(){
                var t = $(this);
                var template = $("#addNewArea").html();
                var count = $(".mapview").find(".area").length;

                editArea = 0;

                var color = getColor(count);
                styleOptions['strokeColor'] = color;
                styleOptions['fillColor'] = color;

                if(!t.hasClass("add-area-disabled")){
                    t.addClass("add-area-disabled");
                    $(".mapview").find(".edit-opr").addClass("hide");

                    template = template.replace("areaCount", "area"+(count+1));

                    t.before(template);
                    drawingManager();
                }
            });

            //删除新增未保存的区域
            $(".mapview").off('click').delegate(".J-remove", "click", function(){
                var t = $(this);

                if(confirm("退出编辑后，此次修改将不会生效，是否确定退出？")){
                    $(".mapview").find(".edit-opr").removeClass("hide");
                    $(".add-area").removeClass("add-area-disabled");

                    if(overlays !=''){
                        mapview.remove(overlays[0]);    
                        polyEditor.close();
                    }

                    mouseTool.close();
                    overlays = [];
                    

                    if(editArea){

                        var data = defaultPolygon[editArea-1];
                        var points = data['polygon'].getPath();
                        var pointsArr = [], pointsList = [];
                        if(points){
                            for (var i = 0; i < points.length; i++) {
                                pointsArr.push(points[i].lng+","+points[i].lat);
                                var ePath = [];
                                ePath.push(points[p].lng, points[p].lat);
                                pointsList.push(ePath);
                            }
                        }
                        var shijiaoTxt = $(".min-price .shijiao option[value="+data['leix']+"]").text(); 

                        var newArea = '<div class="area area'+editArea+'" data-index="'+editArea+'" data-points="'+pointsArr.join("|")+'" data-leix="'+data['leix']+'" data-teach="'+data['range']+'">';
                            newArea += '<div class="area-boder">';
                            newArea += '        <div class="clearfix">';
                            newArea += '            <span class="item-title pull-left">施教范围</span>';
                            newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                            newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                            newArea += '                <i class="c-gray"> / </i>';
                            newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                            newArea += '            </span>';
                            newArea += '        </div>';
                            newArea += '        <div class="J-min-price min-price">';
                            newArea += '            <span>学校类型 </span>';
                            newArea += '            <span class="fr J-value"><i>'+shijiaoTxt+'</i></span>';
                            newArea += '        </div>';
                            newArea += '        <div class="J-shipping-fee shipping-fee">';
                            newArea += '            <span class="shipping-fee-text">施教区 </span>';
                            newArea += '            <span class="fr J-value"><i>'+data['range']+'</i></span>';
                            newArea += '        </div>';
                            newArea += '    </div>';
                            newArea += '</div>';


                        var polygon = new AMap.Polygon({
                            path:pointsList,
                            strokeColor:getColor((editArea-1)), //边线颜色。
                            fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。
                            strokeWeight: 3,       //边线的宽度，以像素为单位。
                            strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                            fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                            strokeStyle: 'dashed' //边线的样式，solid或dashed。
                        });

                        mapview.add(polygon);

                        defaultPolygon[editArea-1]['polygon'] = polygon;
                        t.closest(".area").before(newArea);
                    }
                    t.closest(".area").remove();                   

                }
            });

            //保存新增的区域
            $(".mapview").delegate(".J-save", "click", function(){
                var t = $(this);

                if(overlays[0]){

                    var path = overlays[0].getPath();
                    var pathArr = [];
                    var pointsArr = [];
                    for(var p = 0; p < path.length; p++){
                        pathArr.push(path[p].lng+","+path[p].lat);
                        var ePath = [];
                        ePath.push(path[p].lng, path[p].lat);
                        pointsArr.push(ePath);
                    }

                    var count = editArea ? editArea : $(".mapview").find(".area").length;
                    var shijiao = t.closest(".area").find(".min-price .shijiao").val();
                    var teachQy = t.closest(".area").find(".shipping-fee .teachArea").text();
                    var shijiaoTxt = t.closest(".area").find(".min-price option:selected").text();           
                    if(shijiao == ''){
                    	alert('请选择学校类型');
                    	return false;
                    }
                    if(teachQy == ''){
                    	alert('请输入施教区');
                    	return false;
                    }
                    if(count > 10){
                        alert("最多设置10个配送区域！");
                        return false;
                    }

                    var newArea = '<div class="area area'+count+'" data-index="'+count+'" data-points="'+pathArr.join("|")+'" data-leix="'+shijiao+'" data-teach="'+teachQy+'">';
                        newArea += '<div class="area-boder">';
                        newArea += '        <div class="clearfix">';
                        newArea += '            <span class="item-title pull-left">施教范围</span>';
                        newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                        newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                        newArea += '                <i class="c-gray"> / </i>';
                        newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                        newArea += '            </span>';
                        newArea += '        </div>';
                        newArea += '        <div class="J-min-price min-price">';
                        newArea += '            <span>学校类型 </span>';
                        newArea += '            <span class="fr J-value"><i>'+shijiaoTxt+'</i></span>';
                        newArea += '        </div>';
                        newArea += '        <div class="J-shipping-fee shipping-fee">';
                        newArea += '            <span class="shipping-fee-text">施教区 </span>';
                        newArea += '            <span class="fr J-value"><i>'+teachQy+'</i></span>';
                        newArea += '        </div>';
                        newArea += '    </div>';
                        newArea += '</div>';


                    var polygon = new AMap.Polygon({
       					path:pointsArr,
                        strokeColor:getColor((count-1)), //边线颜色。
                        fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。
                        strokeWeight: 3,       //边线的宽度，以像素为单位。
                        strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                        fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                        strokeStyle: 'dashed' //边线的样式，solid或dashed。
                    });
                    mapview.add(polygon); //保存绘制自定的多边形
                    
                    if(editArea){
                        t.closest(".area").before(newArea);
                        t.closest(".area").remove();
                    }else{
                        $(".mapview .area:last").remove();
                        $(".add-area").before(newArea);
                    }

                    $(".mapview").find(".edit-opr").removeClass("hide");
                    $(".add-area").removeClass("add-area-disabled");
                    mapview.remove(overlays[0]);
                    overlays = [];
                    polyEditor.close();//关闭编辑状态
                    defaultPolygon[count-1] = [];
                    defaultPolygon[count-1]['leix'] = shijiao;
                    defaultPolygon[count-1]['range'] = teachQy;
                    defaultPolygon[count-1]['polygon'] = polygon;

                    if(count >= 10){
                        $(".add-area").addClass("add-area-disabled");
                    }

                    editArea = 0;

                }else{
                    alert("请先绘制配送范围！");
                }
            });

			//编辑区域
            $(".mapview").delegate(".J-edit", "click", function(){
                var t = $(this), index = t.closest(".area").index(), ltype = t.closest(".area").attr("data-leix"), range = t.closest(".area").attr("data-teach"), points = t.closest(".area").attr("data-points");
                editArea = index + 1;
                mapview.remove(defaultPolygon[index]['polygon']);

                var pointsList = [];
                var pointsArr = points.split("|");
                for(var p = 0; p < pointsArr.length; p++){
                    var point = pointsArr[p].split(",");
                    pointsList.push(point);
                }
                
                var color = getColor(index);
                styleOptions['strokeColor'] = color;
                styleOptions['fillColor'] = color;

                var polygonE = new AMap.Polygon({
   					path:pointsList,
                    fillColor:styleOptions['fillColor'],
                    fillOpacity:.4,
	              	strokeColor: styleOptions['strokeColor']
                });
                mapview.add(polygonE); //保存绘制自定的多边形
                AMap.plugin(["AMap.PolyEditor"],function () {
			        polyEditor = new AMap.PolyEditor(mapview,polygonE);
			    });
                polyEditor.open();

                overlays[0] = polygonE;

                var btn = $(".add-area");
                var template = $("#addNewArea").html();
                btn.addClass("add-area-disabled");
                $(".mapview").find(".edit-opr").addClass("hide");
                template = template.replace("areaCount", "area"+(index+1));
                template = template.replace("删除", "取消");

                t.closest(".area").before(template);
                $(".min-price .shijiao").val(ltype);
                $(".shipping-fee .teachArea").text(range);
                t.closest(".area").remove();

            });

            

            //删除区域 已经画完的
            $(".mapview").delegate(".J-del", "click", function(){

                var t =  $(this), index = Number(t.closest(".area").attr("data-index"));

                if(confirm("确认要删除吗？")){

                    //先删除地图上已有的多边形
                    for (var i = 0; i < defaultPolygon.length; i++) {
                        var polygon = defaultPolygon[i]['polygon'];
                        mapview.remove(polygon);
                    }

                    defaultPolygon.splice((index-1), 1);//删除 index-1 开始的一个 就是删除本身
                    $(".mapview .area").remove();

                    var newDefaultPolygon = [];
                    //循环画出剩下的图形 和 内容
                    for (var i = 0; i < defaultPolygon.length; i++) {
                        var polygon = defaultPolygon[i]['polygon'], leix = defaultPolygon[i]['leix'], range = defaultPolygon[i]['range'];

                        if(polygon){
                            var pointsArr = [], pointsList = [];
                            var paths = polygon.getPath();
                            for(var p = 0; p < paths.length; p++){
                                pointsList.push(paths[p].lng + "," + paths[p].lat);
                                var ePath = [];
		                        ePath.push(paths[p].lng, paths[p].lat);
		                        pointsArr.push(ePath);
                            }

                            var polygon = new AMap.Polygon({
                            	path:pointsArr,
                                strokeColor:getColor(i), //边线颜色。
                                fillColor:"",          //填充颜色。当参数为空时，圆形将没有填充效果。
                                strokeWeight: 3,       //边线的宽度，以像素为单位。
                                strokeOpacity: 1,      //边线透明度，取值范围0 - 1。
                                fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                                strokeStyle: 'dashed' //边线的样式，solid或dashed。
                            });

                            mapview.add(polygon);

                            newDefaultPolygon[i] = [];
                            newDefaultPolygon[i]['leix'] = leix;
                            newDefaultPolygon[i]['range'] = range;
                            newDefaultPolygon[i]['polygon'] = polygon;

                            var shijiaoTxt = $(".min-price .shijiao option[value="+leix+"]").text(); 

                            var newArea = '<div class="area area'+(i+1)+'" data-index="'+(i+1)+'" data-points="'+pointsList.join("|")+'" data-leix="'+leix+'" data-teach="'+range+'">';
                                newArea += '<div class="area-boder">';
                                newArea += '        <div class="clearfix">';
                                newArea += '            <span class="item-title pull-left">施教范围</span>';
                                newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                                newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                                newArea += '                <i class="c-gray"> / </i>';
                                newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                                newArea += '            </span>';
                                newArea += '        </div>';
                                newArea += '        <div class="J-min-price min-price">';
                                newArea += '            <span>学校类型 </span>';
                                newArea += '            <span class="fr J-value"><i>'+shijiaoTxt+'</i></span>';
                                newArea += '        </div>';
                                newArea += '        <div class="J-shipping-fee shipping-fee">';
                                newArea += '            <span class="shipping-fee-text">施教区 </span>';
                                newArea += '            <span class="fr J-value"><i>'+range+'</i></span>';
                                newArea += '        </div>';
                                newArea += '    </div>';
                                newArea += '</div>';

                            $(".add-area").before(newArea);
                        }
                    }

                    defaultPolygon = newDefaultPolygon;

                };

            });


        //天地图
        }else if(site_map == 'tmap'){

            var overlays = [], drawingManager, hasDrawing = false;
            mapview = new T.Map("mapview", {enableMapClick: false});
            var mPoint = new T.LngLat(cordY, cordX);
            var marker = new T.Marker(mPoint);
            mapview.centerAndZoom(mPoint, 14);
            mapview.addOverLay(marker);

            //创建缩放平移控件对象
            var control = new T.Control.Zoom();
            control.setPosition(T_ANCHOR_BOTTOM_RIGHT);
            //添加缩放平移控件
            mapview.addControl(control);


            //初始加载已有区域
            $(".mapview").find(".area").each(function(index){
                var t = $(this), points = t.attr("data-points"), leix = t.attr("data-leix"), range = t.attr("data-teach");

                if(points != "" && points != undefined){
                    var pointsArr = [];
                    var paths = points.split("|");
                    for(var p = 0; p < paths.length; p++){
                        var path = paths[p].split(",");
                        pointsArr.push(new T.LngLat(path[0], path[1]));
                    }

                    var options = {
                        color: getColor(index), //边线颜色。
                        fillColor: "transparent",          //填充颜色。当参数为空时，圆形将没有填充效果。
                        weight: 3,       //边线的宽度，以像素为单位。
                        opacity: 1,      //边线透明度，取值范围0 - 1。
                        fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                        lineStyle: 'dashed' //边线的样式，solid或dashed。
                    };

                    var polygon = new T.Polygon(pointsArr, options);
                    mapview.addOverLay(polygon);

                    defaultPolygon[index] = [];
                    defaultPolygon[index]['leix'] = leix;
                    defaultPolygon[index]['range'] = range;
                    defaultPolygon[index]['polygon'] = polygon;
                }
            });


            //回调获得覆盖物信息
            var overlaycomplete = function(e){
                if(e){
                    var path = e.currentLnglats;//获取多边形轮廓线节点数组 其中lat和lng是经纬度参数。
                    var pathArr = [];
                    for(var p = 0; p < path.length; p++){
                        pathArr.push(new T.LngLat(path[p].lng, path[p].lat));
                    }
                    overlays.push(e);
                    e.currentPolygon.enableEdit();

                    e.currentPolygon.addEventListener("lineupdate",function(ea){
                        var target = ea.currentTarget;
                        for(var o = 0; o < overlays.length; o++){
                            if(target.K == overlays[o].K){
                                overlays[o] = target;
                            }
                        }
                        overlaycomplete();
                    });
                }

            };


            //新增施教范围
            $(".add-area").bind("click", function(){
                var t = $(this);
                var template = $("#addNewArea").html();
                var count = $(".mapview").find(".area").length;

                if(hasDrawing) return;

                editArea = 0;

                var color = getColor(count);
                styleOptions['color'] = color;
                styleOptions['opacity'] = 1;
                styleOptions['fillColor'] = color;
                styleOptions['fillOpacity'] = 0.5;

                hasDrawing = true;

                //实例化鼠标绘制工具
                drawingManager = new T.PolygonTool(mapview, styleOptions);

                //添加鼠标绘制工具监听事件，用于获取绘制结果
                drawingManager.addEventListener('draw', overlaycomplete);

                if(!t.hasClass("add-area-disabled")){
                    t.addClass("add-area-disabled");
                    $(".mapview").find(".edit-opr").addClass("hide");

                    template = template.replace("areaCount", "area"+(count+1));

                    t.before(template);
                    drawingManager.open();


                }
            });


            //删除新增未保存的区域
            $(".mapview").off('click').delegate(".J-remove", "click", function(){
                var t = $(this);

                if(confirm("退出编辑后，此次修改将不会生效，是否确定退出？")){
                    $(".mapview").find(".edit-opr").removeClass("hide");
                    $(".add-area").removeClass("add-area-disabled");
                    if(drawingManager != undefined){
                        drawingManager.close();
                    }
                    mapview.removeOverLay(overlays[0].currentPolygon != undefined ? overlays[0].currentPolygon : overlays[0]);
                    overlays = [];
                    hasDrawing = false;
                    drawType = "poly";

                    if(editArea){

                        var data = defaultPolygon[editArea-1];
                        var points = data['polygon'].currentLnglats;
                        var points = points == undefined ? data['polygon'].getLngLats()[0] : points;
                        var pointsArr = [], pointsList = [];
                        if(points){
                            for (var i = 0; i < points.length; i++) {
                                pointsArr.push(points[i].lng+","+points[i].lat);
                                pointsList.push(new T.LngLat(points[i].lng, points[i].lat));
                            }
                        }
                        var shijiaoTxt = $(".min-price .shijiao option[value="+data['leix']+"]").text(); 

                        var newArea = '<div class="area area'+editArea+'" data-index="'+editArea+'" data-points="'+pointsArr.join("|")+'" data-leix="'+data['leix']+'" data-teach="'+data['range']+'">';
                            newArea += '<div class="area-boder">';
                            newArea += '        <div class="clearfix">';
                            newArea += '            <span class="item-title pull-left">施教范围</span>';
                            newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                            newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                            newArea += '                <i class="c-gray"> / </i>';
                            newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                            newArea += '            </span>';
                            newArea += '        </div>';
                            newArea += '        <div class="J-min-price min-price">';
                            newArea += '            <span>学校类型 </span>';
                            newArea += '            <span class="fr J-value"><i>'+shijiaoTxt+'</i></span>';
                            newArea += '        </div>';
                            newArea += '        <div class="J-shipping-fee shipping-fee">';
                            newArea += '            <span class="shipping-fee-text">施教区 </span>';
                            newArea += '            <span class="fr J-value"><i>'+data['range']+'</i></span>';
                            newArea += '        </div>';
                            newArea += '    </div>';
                            newArea += '</div>';


                        var options = {
                            color: getColor(editArea-1), //边线颜色。
                            fillColor: "transparent",          //填充颜色。当参数为空时，圆形将没有填充效果。
                            weight: 3,       //边线的宽度，以像素为单位。
                            opacity: 1,      //边线透明度，取值范围0 - 1。
                            fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                            lineStyle: 'dashed' //边线的样式，solid或dashed。
                        };

                        var polygon = new T.Polygon(pointsList, options);
                        mapview.addOverLay(polygon);
                        defaultPolygon[editArea-1]['polygon'] = polygon;
                        t.closest(".area").before(newArea);
                    }

                    t.closest(".area").remove();

                }
            });


            //保存新增的区域
            $(".mapview").delegate(".J-save", "click", function(){
                var t = $(this);

                if(overlays[0]){

                    var path = overlays[0].currentLnglats != undefined ? overlays[0].currentLnglats : overlays[0].getLngLats()[0];
                    var pathArr = [];
                    var pointsArr = [];
                    for(var p = 0; p < path.length; p++){
                        pathArr.push(path[p].lng+","+path[p].lat);
                        pointsArr.push(new T.LngLat(path[p].lng, path[p].lat));
                    }

                    var count = editArea ? editArea : $(".mapview").find(".area").length;
                    var shijiao = t.closest(".area").find(".min-price .shijiao").val();
                    var teachQy = t.closest(".area").find(".shipping-fee .teachArea").text();
                    var shijiaoTxt = t.closest(".area").find(".min-price option:selected").text();           
                    if(shijiao == ''){
                    	alert('请选择学校类型');
                    	return false;
                    }
                    if(teachQy == ''){
                    	alert('请输入施教区');
                    	return false;
                    }
                    if(count > 10){
                        alert("最多设置10个配送区域！");
                        return false;
                    }

                    var newArea = '<div class="area area'+count+'" data-index="'+count+'" data-points="'+pathArr.join("|")+'" data-leix="'+shijiao+'" data-teach="'+teachQy+'">';
                        newArea += '<div class="area-boder">';
                        newArea += '        <div class="clearfix">';
                        newArea += '            <span class="item-title pull-left">施教范围</span>';
                        newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                        newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                        newArea += '                <i class="c-gray"> / </i>';
                        newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                        newArea += '            </span>';
                        newArea += '        </div>';
                        newArea += '        <div class="J-min-price min-price">';
                        newArea += '            <span>学校类型 </span>';
                        newArea += '            <span class="fr J-value"><i>'+shijiaoTxt+'</i></span>';
                        newArea += '        </div>';
                        newArea += '        <div class="J-shipping-fee shipping-fee">';
                        newArea += '            <span class="shipping-fee-text">施教区 </span>';
                        newArea += '            <span class="fr J-value"><i>'+teachQy+'</i></span>';
                        newArea += '        </div>';
                        newArea += '    </div>';
                        newArea += '</div>';


                    var options = {
                        color: getColor(count-1), //边线颜色。
                        fillColor: "transparent",          //填充颜色。当参数为空时，圆形将没有填充效果。
                        weight: 3,       //边线的宽度，以像素为单位。
                        opacity: 1,      //边线透明度，取值范围0 - 1。
                        fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                        lineStyle: 'dashed' //边线的样式，solid或dashed。
                    };

                    mapview.removeOverLay(overlays[0].currentPolygon != undefined ? overlays[0].currentPolygon : overlays[0]);
                    overlays = [];

                    var polygon = new T.Polygon(pointsArr, options);
                    mapview.addOverLay(polygon);

                    if(editArea){
                        t.closest(".area").before(newArea);
                        t.closest(".area").remove();
                    }else{
                        $(".mapview .area:last").remove();
                        $(".add-area").before(newArea);
                    }

                    $(".mapview").find(".edit-opr").removeClass("hide");
                    $(".add-area").removeClass("add-area-disabled");
                    drawingManager.close();
                    hasDrawing = false;
                    drawType = "poly";

                    defaultPolygon[count-1] = [];
                    defaultPolygon[count-1]['leix'] = shijiao;
                    defaultPolygon[count-1]['range'] = teachQy;
                    defaultPolygon[count-1]['polygon'] = polygon;

                    if(count >= 10){
                        $(".add-area").addClass("add-area-disabled");
                    }

                    editArea = 0;

                }else{
                    alert("请先绘制配送范围！");
                }
            });


            //编辑区域
            $(".mapview").delegate(".J-edit", "click", function(){

                if(hasDrawing){
                    alert('请先保存或删除当前的绘制！')
                    return;
                }

                hasDrawing = true;

                var t = $(this), index = t.closest(".area").index(), ltype = t.closest(".area").attr("data-leix"), range = t.closest(".area").attr("data-teach"), points = t.closest(".area").attr("data-points");
                editArea = index + 1;
                mapview.removeOverLay(defaultPolygon[index]['polygon']);

                var pointsList = [];
                var pointsArr = points.split("|");
                for(var p = 0; p < pointsArr.length; p++){
                    var point = pointsArr[p].split(",");
                    pointsList.push(new T.LngLat(point[0], point[1]));
                }

                var color = getColor(index);
                styleOptions['color'] = color;
                styleOptions['fillColor'] = color;

                var polygon = new T.Polygon(pointsList, styleOptions);
                mapview.addOverLay(polygon);
                polygon.enableEdit();

                overlays[0] = polygon;

                var btn = $(".add-area");
                var template = $("#addNewArea").html();
                btn.addClass("add-area-disabled");
                $(".mapview").find(".edit-opr").addClass("hide");
                template = template.replace("areaCount", "area"+(index+1));
                template = template.replace("删除", "取消");

                t.closest(".area").before(template);
                $(".min-price .shijiao").val(ltype);
                $(".shipping-fee .teachArea").text(range);
                t.closest(".area").remove();

            });


            //删除区域 已经画完的
            $(".mapview").delegate(".J-del", "click", function(){

                var t =  $(this), index = Number(t.closest(".area").attr("data-index"));

                if(hasDrawing){
                    alert('请先保存或删除当前的绘制！')
                    return;
                }

                if(confirm("确认要删除吗？")){

                    //先删除地图上已有的多边形
                    for (var i = 0; i < defaultPolygon.length; i++) {
                        var polygon = defaultPolygon[i]['polygon'];
                        mapview.removeOverLay(polygon);
                    }

                    defaultPolygon.splice((index-1), 1);//删除 index-1 开始的一个 就是删除本身
                    $(".mapview .area").remove();

                    var newDefaultPolygon = [];
                    //循环画出剩下的图形 和 内容
                    for (var i = 0; i < defaultPolygon.length; i++) {
                        var polygon = defaultPolygon[i]['polygon'], leix = defaultPolygon[i]['leix'], range = defaultPolygon[i]['range'];

                        if(polygon){
                            var pointsArr = [], pointsList = [];
                            var paths = polygon.currentLnglats != undefined ? polygon.currentLnglats : polygon.getLngLats()[0];
                            for(var p = 0; p < paths.length; p++){
                                pointsArr.push(new T.LngLat(paths[p].lng, paths[p].lat));
                                pointsList.push(paths[p].lng + "," + paths[p].lat);
                            }
                           
                            var options = {
                                color: getColor(i), //边线颜色。
                                fillColor: "transparent",          //填充颜色。当参数为空时，圆形将没有填充效果。
                                weight: 3,       //边线的宽度，以像素为单位。
                                opacity: 1,      //边线透明度，取值范围0 - 1。
                                fillOpacity: 0.4,      //填充的透明度，取值范围0 - 1。
                                lineStyle: 'dashed' //边线的样式，solid或dashed。
                            };

                            var polygon = new T.Polygon(pointsArr, options);
                            mapview.addOverLay(polygon);

                            newDefaultPolygon[i] = [];
                            newDefaultPolygon[i]['leix'] = leix;
                            newDefaultPolygon[i]['range'] = range;
                            newDefaultPolygon[i]['polygon'] = polygon;

                            var shijiaoTxt = $(".min-price .shijiao option[value="+leix+"]").text(); 

                            var newArea = '<div class="area area'+(i+1)+'" data-index="'+(i+1)+'" data-points="'+pointsList.join("|")+'" data-leix="'+leix+'" data-teach="'+range+'">';
                                newArea += '<div class="area-boder">';
                                newArea += '        <div class="clearfix">';
                                newArea += '            <span class="item-title pull-left">施教范围</span>';
                                newArea += '            <span class="hover-opr edit-opr J-opr pull-right">';
                                newArea += '                <a class="save J-del ubl" href="javascript:;">删除</a>';
                                newArea += '                <i class="c-gray"> / </i>';
                                newArea += '                <a class="quit J-edit c-gray" href="javascript:;">编辑</a>';
                                newArea += '            </span>';
                                newArea += '        </div>';
                                newArea += '        <div class="J-min-price min-price">';
                                newArea += '            <span>学校类型 </span>';
                                newArea += '            <span class="fr J-value"><i>'+shijiaoTxt+'</i></span>';
                                newArea += '        </div>';
                                newArea += '        <div class="J-shipping-fee shipping-fee">';
                                newArea += '            <span class="shipping-fee-text">施教区 </span>';
                                newArea += '            <span class="fr J-value"><i>'+range+'</i></span>';
                                newArea += '        </div>';
                                newArea += '    </div>';
                                newArea += '</div>';

                            $(".add-area").before(newArea);
                        }
                    }

                    defaultPolygon = newDefaultPolygon;

                };

            });

        }
	}

	//标注地图
	$("#mark").bind("click", function(){
		$.dialog({
			id: "markDitu",
			title: "标注地图位置<small>（请点击/拖动图标到正确的位置，再点击底部确定按钮。）</small>",
			content: 'url:'+adminPath+'../api/map/mark.php?mod=house&lnglat='+$("#lnglat").val()+"&city="+mapCity+"&addr="+$("#addr").val(),
			width: 800,
			height: 500,
			max: true,
			ok: function(){

				var doc = $(window.parent.frames["markDitu"].document),
					lng = doc.find("#lng").val(),
					lat = doc.find("#lat").val(),
					addr = doc.find("#address").val();
					console.log(doc)
				$("#lnglat").val(lng+","+lat);
				if($("#addr").val() == ""){
					$("#addr").val(addr);
				}
				huoniao.regex($("#address"));
			},
			cancel: true
		});
	});

	//选择附近地铁站
	$(".chooseData").bind("click", function(){
		var addrids = $('.addrBtn').attr('data-ids').split(' ');
		var cityid = addrids[0];
		if(cityid == 0 || cityid == "" || cityid == undefined){
			$.dialog.alert("请先选择区域板块！");
			return false;
		}
		var type = $(this).prev("input").attr("id"), input = $(this).prev("input"), valArr = input.val().split(",");
		huoniao.showTip("loading", "数据读取中，请稍候...");
		huoniao.operaJson("../siteConfig/siteSubway.php?dopost=getSubway", "addrids="+addrids.join(","), function(data){
			huoniao.hideTip();
			if(data && data.state == 100){

				var data = data.info;

				var content = [], selected = [];
				content.push('<div class="selectedTags">已选：</div>');
				content.push('<ul class="nav nav-tabs" style="margin-bottom:5px;">');
				for(var i = 0; i < data.length; i++){
					content.push('<li'+ (i == 0 ? ' class="active"' : "") +'><a href="#tab'+i+'">'+data[i].title+'</a></li>');
				}
				content.push('</ul><div class="tagsList">');
				for(var i = 0; i < data.length; i++){
					content.push('<div class="tag-list'+(i == 0 ? "" : " hide")+'" id="tab'+i+'">')
					for(var l = 0; l < data[i].lower.length; l++){
						var id = data[i].lower[l].id, name = data[i].lower[l].title;
						if($.inArray(id, valArr) > -1){
							selected.push('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
						}
						content.push('<span'+($.inArray(id, valArr) > -1 ? " class='checked'" : "")+' data-id="'+id+'">'+name+'<a href="javascript:;">+</a></span>');
					}
					content.push('</div>');
				}
				content.push('</div>');

				$.dialog({
					id: "subwayInfo",
					fixed: false,
					title: "选择附近地铁站",
					content: '<div class="selectTags">'+content.join("")+'</div>',
					width: 1000,
					okVal: "确定",
					ok: function(){

						//确定选择结果
						var html = parent.$(".selectedTags").html().replace("已选：", ""), ids = [];
						parent.$(".selectedTags").find("span").each(function(){
							var id = $(this).attr("data-id");
							if(id){
								ids.push(id);
							}
						});
						input.val(ids.join(","));
						input.prev(".selectedTags").html(html);

					},
					cancelVal: "关闭",
					cancel: true
				});

				var selectedObj = parent.$(".selectedTags");
				//填充已选
				selectedObj.append(selected.join(""));

				//TAB切换
				parent.$('.nav-tabs a').click(function (e) {
					e.preventDefault();
					var obj = $(this).attr("href").replace("#", "");
					if(!$(this).parent().hasClass("active")){
						$(this).parent().siblings("li").removeClass("active");
						$(this).parent().addClass("active");

						$(this).parent().parent().next(".tagsList").find("div").hide();
						parent.$("#"+obj).show();
					}
				});

				//选择标签
				parent.$(".tag-list span").click(function(){
					if(!$(this).hasClass("checked")){
						var length = selectedObj.find("span").length;
						if(type == "tags" && length >= tagsLength){
							alert("交友标签最多可选择 "+tagsLength+" 个，可在模块设置中配置！");
							return false;
						}
						if(type == "grasp" && length >= graspLength){
							alert("会的技能最多可选择 "+graspLength+" 个，可在模块设置中配置！");
							return false;
						}
						if(type == "learn" && length >= learnLength){
							alert("想学技能最多可选择 "+learnLength+" 个，可在模块设置中配置！");
							return false;
						}

						var id = $(this).attr("data-id"), name = $(this).text().replace("+", "");
						$(this).addClass("checked");
						selectedObj.append('<span data-id="'+id+'">'+name+'<a href="javascript:;">&times;</a></span>');
					}
				});

				//取消已选
				selectedObj.delegate("a", "click", function(){
					var pp = $(this).parent(), id = pp.attr("data-id");

					parent.$(".tagsList").find("span").each(function(index, element) {
                        if($(this).attr("data-id") == id){
							$(this).removeClass("checked");
						}
                    });

					pp.remove();
				});

			}
		});
	});

    $("#previewQj").bind("click", function(){
        if($("#listSection2").find("li").length == 6){

            event.preventDefault();
            var href = $(this).attr("href");

            pics = [];
            $("#listSection2").find("img").each(function(index, element) {
                pics.push($(this).attr("data-val"));
            });

            window.open(href+pics.join(","), "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");

        }else{
            $.dialog.alert("请上传6张完整的全景图片！");
        }
    });

	//表单验证
	$("#editform").delegate("input,textarea", "focus", function(){
		var tip = $(this).siblings(".input-tips");
		if(tip.html() != undefined){
			tip.removeClass().addClass("input-tips input-focus").attr("style", "display:inline-block");
		}
	});

	$("#editform").delegate("input,textarea", "blur", function(){
		var obj = $(this);
		huoniao.regex(obj);
	});

	$("#editform").delegate("select", "change", function(){
		if($(this).parent().siblings(".input-tips").html() != undefined){
			if($(this).val() == 0){
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			}else{
				$(this).parent().siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
			}
		}
	});
	$("#userList").delegate("li", "click", function(){
		var name = $(this).text(), id = $(this).attr("data-id");
		$("#user").val(name);
		$("#userid").val(id);
		$("#userList").html("").hide();
		$("#user").siblings(".input-tips").removeClass().addClass("input-tips input-ok");
        checkZjUser($("#user"),name);
		return false;
	});

	// $(document).click(function (e) {
 //      var s = e.target;
 //      if (!jQuery.contains($("#userList").get(0), s)) {
 //          if (jQuery.inArray(s.id, "user") < 0) {
 //              $("#userList").hide();
 //          }
 //      }
 //  });

	$("#user").bind("blur", function(){
		var t = $(this), val = t.val(), flag = false;
		if(val != ""){
            checkZjUser(t, val);
		}else{
			t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
		}
	});

	function checkZjUser(t, val){
        t.addClass("input-loading");
        huoniao.operaJson("../inc/json.php?action=checkZjUser", "key="+val, function(data){
            t.removeClass("input-loading");
            if(data) {
                for(var i = 0; i < data.length; i++){
                    if(data[i].username == val){
                        flag = true;
                        $("#userid").val(data[i].id);
                    }
                }
            }
            if(flag){
                t.siblings(".input-tips").removeClass().addClass("input-tips input-ok");
            }else{
                t.siblings(".input-tips").removeClass().addClass("input-tips input-error");
            }
        });
	}

	$(".item").delegate(".icon-trash", "click", function(){
		$(this).closest("dl").remove();
	});

	//表单提交
	$("#btnSubmit").bind("click", function(event){
		event.preventDefault();
		//获取施教范围
	    var service_area_data = [];
	    $(".mapview").find(".area").each(function(){
	        var t = $(this), leix = t.attr("data-leix"), teach = t.attr("data-teach"), points = t.attr('data-points');
	        if(leix && teach && points){
	            service_area_data.push('{"teach": "'+teach+'", "leix": "'+leix+'", "points": "'+points+'"}');
	        }
	    });
	    if(service_area_data){
	        $("#service_area_data").val('['+service_area_data.join(",")+']');
	    }
		$('#addrid').val($('.addrBtn').attr('data-id'));
        var addrids = $('.addrBtn').attr('data-ids').split(' ');
        $('#cityid').val(addrids[0]);
		var t            = $(this),
			id           = $("#id").val(),
			title        = $("#title"),
			addrid       = $("#addrid"),
			addrress     = $("#address").val(),
			lnglat       = $("#lnglat").val(),
			logo         = $("#logo").val();

		if(!huoniao.regex(title)){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			return false;
		};

		if(addrid == "" || addrid == 0){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-error").attr("style", "display:inline-block");
			return false;
		}else{
			$("#addrList").siblings(".input-tips").removeClass().addClass("input-tips input-ok").attr("style", "display:inline-block");
		}
		if(addrress == ""){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			init.showTip("error", "请填写学校地址", "auto");
			return false;
		};
		if(lnglat  ==""){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			init.showTip("error", "请选择学校经纬度", "auto");
			return false;
		}

		if(logo == ""){
			huoniao.goTop();
			$(".config-nav button:eq(0)").click();
			init.showTip("error", "请上传学校LOGO！", "auto");
			return false;
		};

		t.attr("disabled", true);
		//异步提交
		huoniao.operaJson("releaseschoolAdd.php", $("#editform").serialize() + "&token="+$("#token").val() + "&submit="+encodeURI("提交"), function(data){
			if(data.state == 100){
				if($("#dopost").val() == "save"){
					huoniao.parentTip("success", "学校发布成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					huoniao.goTop();
					location.reload();
				}else{
					huoniao.parentTip("success", "学校修改成功！<a href='"+data.url+"' target='_blank'>"+data.url+"</a>");
					t.attr("disabled", false);
				}
			}else{
				$.dialog.alert(data.info);
				t.attr("disabled", false);
			};
		});
	});

		//视频预览
	$("#videoPreview").delegate("a", "click", function(event){
		event.preventDefault();
		var href = $(this).attr("href"),
			id   = $(this).attr("data-id");

		window.open(href+id, "videoPreview", "height=500, width=650, top="+(screen.height-500)/2+", left="+(screen.width-650)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	});
	
	//全景类型切换
	$("input[name='typeidArr']").bind("click", function(){
		$("#qj_type0, #qj_type1").hide();
		$("#qj_type"+$(this).val()).show();
	});

	//全景预览
	// $("#licenseFiles a").bind("click", function(event){
	// 	event.preventDefault();
	// 	var id   = $(this).attr("data-id");

	// 	window.open(cfg_attachment+id, "videoPreview", "height=600, width=650, top="+(screen.height-600)/2+", left="+(screen.width-600)/2+", toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no");
	// });

	//删除文件
	$(".spic .reupload").bind("click", function(){
		var t = $(this), parent = t.parent(), input = parent.prev("input"), iframe = parent.next("iframe"), src = iframe.attr("src");
		delFile(input.val(), false, function(){
			input.val("");
			input.val("");
			t.prev(".sholder").html('');
			parent.hide();
			iframe.attr("src", src).show();
		});
	});

	$('body').delegate('.sametitle a', 'click', function(e){
		e.preventDefault();
		var t = $(this), title = t.text(), id = t.attr('data-id');
		var href = "communityAdd.php?dopost=edit&id="+id;
		try {
			event.preventDefault();
			parent.addPage("communityEdit"+id, "house", title, "house/"+href);
		} catch(e) {}
	})
	var checkTitleTime;
	$("#title").on("input propertychange", function(){
		var t = $(this), val = $.trim(t.val()), par = t.closest('dl');
		clearTimeout(checkTitleTime);
		$('.sametitle').remove();
		if(val){
			checkTitleTime = setTimeout(function(){
				$.post('?action=checkTitle', 'id='+infoid+'&title='+val, function(aid){
					if(aid > 0){
						par.after('<dl class="clearfix sametitle" style="color:#666;"><dt><label for="">&nbsp;</label></dt><dd>已存在相同标题的信息：<a href="javascript:;" data-id="'+aid+'">'+val+'</a></dd></dl>');
					}
				})
			}, 200)
		}
	})


});

//上传成功接收
function uploadSuccess(obj, file, filetype, fileurl){
	$("#"+obj).val(file);
	var media = "";
	if(filetype == "swf" || file.split(".")[1] == "swf"){
		media = '<embed src="'+fileurl+'" type="application/x-shockwave-flash" quality="high" wmode="transparent">';
	}else if(obj == "video"){
		media = '<video src="'+cfg_attachment+file+'"></video>';
	}else{
		media = '<img src="'+cfg_attachment+file+'" />';
	}
	$("#"+obj).siblings(".spic").find(".sholder").html(media);
	$("#"+obj).siblings(".spic").find(".reupload").attr("style", "display: inline;");
	$("#"+obj).siblings(".spic").show();
	$("#"+obj).siblings("iframe").hide();
}

//删除已上传的文件
function delFile(b, d, c) {
	var g = {
		mod: "house",
		type: "delThumb",
		picpath: b,
		randoms: Math.random()
	};
	$.ajax({
		type: "POST",
		cache: false,
		async: d,
		url: "/include/upload.inc.php",
		dataType: "json",
		data: $.param(g),
		success: function(a) {
			try {
				c(a)
			} catch(b) {}
		}
	})
}

// 定位
// 百度地图
if(cordX == "" && cordY == ""){
  if (site_map == "baidu") {
      var geolocation = new BMap.Geolocation();
      geolocation.getCurrentPosition(function(r){
      	if(this.getStatus() == BMAP_STATUS_SUCCESS){
      		$("#lnglat").val(r.point.lng+','+r.point.lat);
      	}
      	else {
      		alert('failed'+this.getStatus());
      	}
      },{enableHighAccuracy: true})

  // 高德地图
  }else if (site_map == "amap") {

 	// var map = new AMap.Map('container', {
  //       resizeEnable: true
  //   });
    AMap.plugin('AMap.Geolocation', function() {
        var geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 10000,          //超过10秒后停止定位，默认：5s
            buttonPosition:'RB',    //定位按钮的停靠位置
            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点

        });
        //map.addControl(geolocation);
        geolocation.getCurrentPosition(function(status,result){
            if(status=='complete'){
                $("#lnglat").val(result.position);
            }else{
                alert('定位失败')
            }
        });
    });

  }
}
