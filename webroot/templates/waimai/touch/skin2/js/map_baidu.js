//$(function(){
	var init = {
		//替换模板关键字
        replaceTpl: function(template, data, allowEmpty, chats){
            var regExp;
            chats = chats || ['\\$\\{', '\\}'];
            regExp = [chats[0], '([_\\w]+[\\w\\d_]?)', chats[1]].join('');
            regExp = new RegExp(regExp, 'g');
            return template.replace(regExp, function (s, s1) {
                if (data[s1] != null && data[s1] != undefined) {
                    return data[s1];
                } else {
                    return allowEmpty ? '' : s;
                }
            });
        },
		//创建地图
        createMap: function(){
            map = new BMap.Map('topMap', {enableMapClick: false, minZoom: 16});
            map.centerAndZoom(new BMap.Point(oldPointLng, oldPointLat), 16);
            map.addEventListener("tilesloaded", init.tilesloaded); //地图加载完毕执行
        }
        //地图加载完毕添加地图比例尺控件/自定义缩放/收起/展开侧栏
        ,tilesloaded: function(){
        	map.removeEventListener("tilesloaded", init.tilesloaded);
        	//初始加载
        	init.getBusinessData();
        	map.addEventListener("zoomend", function(e) {
        		var ePoint = map.getCenter();
                init.updateOverlays("zoom",ePoint);

            });
            map.addEventListener("dragend", function(e) {
            	var ePoint = map.getCenter();
                init.updateOverlays("drag",ePoint);

            });
            map.addEventListener("dragging", function() {
            	$('.shoptype .qhAddress').text('正在定位中...');

            });

        }
        //获取商家，区域信息
        ,getBusinessData: function(type){

            var visBounds = init.getBounds();
			var boundsArr = [];
			boundsArr.push('min_latitude='+visBounds['min_latitude']);
			boundsArr.push('max_latitude='+visBounds['max_latitude']);
			boundsArr.push('min_longitude='+visBounds['min_longitude']);
			boundsArr.push('max_longitude='+visBounds['max_longitude']);

            var data = boundsArr.join("&")+"&page=1&pageSize=99";

            $.ajax({
                "url": "/include/ajax.php?service=waimai&action=courierList",
                "data": data,
                "dataType": "json",
                "success": function(data){
                    var districtData = [];
                    if(data && data.state == 100){

                        var lists = data.info.list;
                        for(var i = 0; i < lists.length; i++){
                            districtData[i] = [];
                            districtData[i]['longitude'] = lists[i].lat;
                            districtData[i]['latitude'] = lists[i].lng;

                        }


                    }
                    data = init.getVisarea(districtData);
                    init.createBubble(data, bubbleTemplate[1], 1);



                }
            });
        }
        //更新地图状态
        ,updateOverlays: function(type,ePoint){
        	newLng = ePoint.lng;
            newLat = ePoint.lat;
        	$('.gz-addr-seladdr').attr('data-lng',newLng);
            $('.gz-addr-seladdr').attr('data-lat',newLat);

            var myGeo = new BMap.Geocoder();
           	myGeo.getLocation(ePoint, function mCallback(rs){
            	$('.shoptype .qhAddress').text(rs.address);
            	$('.gz-addr-seladdr').find('#addr').val(rs.address);
            })



            //如果拖拽，则更新地图
            if(type == 'drag' || type == 'zoom'){
                init.getBusinessData();
            }


        }
        //获取地图可视区域范围
        ,getBounds: function(){
            var e = map.getBounds(),
            t = e.getSouthWest(),
            a = e.getNorthEast();
            return {
                min_longitude: t.lng,
                max_longitude: a.lng,
                min_latitude: t.lat,
                max_latitude: a.lat
            }
        }


        //提取可视区域内的数据
        ,getVisarea: function(data){
            data = data || [];
            var areaData = [],
                    visBounds = init.getBounds(),
                    n = {
                        min_longitude: parseFloat(visBounds.min_longitude),
                        max_longitude: parseFloat(visBounds.max_longitude),
                        min_latitude: parseFloat(visBounds.min_latitude),
                        max_latitude: parseFloat(visBounds.max_latitude)
                    };

            $.each(data, function(e, a) {
                var i = a.length ? a[0] : a,
                l = parseFloat(i.longitude),
                r = parseFloat(i.latitude);
                l <= n.max_longitude && l >= n.min_longitude && r <= n.max_latitude && r >= n.min_latitude && areaData.push(a)
            });

            return areaData;
        }
        //创建地图气泡
        ,createBubble: function(data, temp, resize, more){
        	init.cleanBubble();
        	//统计骑手数量
        	if(data.length>0){
        		$('.qsNum').html('附近有<strong>'+data.length+'</strong>名骑手');
        	}else{
        		$('.qsNum').html('附近暂无骑手');
        	}
            $.each(data,function(e, o) {
                var bubbleLabel;
                bubbleLabel = new BMap.Label(init.replaceTpl(temp, o), {
                    position: new BMap.Point(o.longitude, o.latitude),
                    offset: bubbleMapSize[resize]()
                });

                map.addOverlay(bubbleLabel);

            });

        }

        //删除地图气泡
        ,cleanBubble: function(){
            map.clearOverlays();
        }

	}
	//气泡偏移
    var bubbleMapSize = {
            1 : function() {
                return new BMap.Size(-30, -30)
            }
        }
        //气泡模板
        ,bubbleTemplate = {

            //区域
            1 : '<div class="bubble bubble-1"></div>',

        }

        //气泡样式
        ,bubbleStyle = {
            color: "#fff",
            borderWidth: "0",
            padding: "0",
            zIndex: "2",
            backgroundColor: "transparent",
            fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
        }

       ;


    // 地图被拖拽之后重新定位
    $('.zoom-local').click(function(){
        var mPoint = new BMap.Point(stLng, stLat)
        if(stLng && stLat){//定位成功 绘制当前位置
          map.centerAndZoom(mPoint, 15);
        }
        $('.shoptype .qhAddress').html(stAdress);
        //回到当前位置时显示当前位置所有商家
        init.getBusinessData();
    })
//});
