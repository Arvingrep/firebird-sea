
	var isload, markersArr = [], init = {

		//替换模板关键字
		replaceTpl: function(template, data, allowEmpty, chats){
			var regExp;
			chats = chats || ['\\$\\{', '\\}'];
			regExp = [chats[0], '([_\\w]+[\\w\\d_]?)', chats[1]].join('');
			regExp = new RegExp(regExp, 'g');
			return template.replace(regExp,	function (s, s1) {
				if (data[s1] != null && data[s1] != undefined) {
					return data[s1];
				} else {
					return allowEmpty ? '' : s;
				}
			});
		},

		//创建地图
	    createMap: function(){

	      	var toolBar,MGeocoder,mar;

	      	//初始化地图对象，加载地图
	     	map = new AMap.Map("topMap",{
	     		center: [oldPointLng, oldPointLat],
		        //二维地图显示视口
		        view: new AMap.View2D({
		            zoom: 14 //地图显示的缩放级别
		        })
	      	});

	      	//在地图中添加ToolBar插件
		    map.plugin(["AMap.ToolBar"],function(){
		        toolBar = new AMap.ToolBar({position: 'RB'});
		        toolBar.show();
		        toolBar.showDirection();
		        toolBar.hideRuler();
		        map.addControl(toolBar);
		    });

	      AMap.event.addListener(map, "tilesloaded", init.tilesloaded()); //地图加载完毕执行

	    }

		//地图加载完毕添加地图比例尺控件/自定义缩放/收起/展开侧栏
		,tilesloaded: function(){

	      	if(isload) return;
	      	isload = true;
			//加载骑手数据
			init.getBusinessData();

			AMap.event.addListener(map, 'zoomend', function() {
				var center = map.getCenter()
                init.updateOverlays("zoom",center);
			});
			AMap.event.addListener(map ,"dragend", function(){
				var center = map.getCenter()
                init.updateOverlays("drag",center);
			});

			AMap.event.addListener(map, 'dragging', function() {
				$('.shoptype .qhAddress').text('正在定位中...');
			});


		}

		//获取区域及楼盘信息
		,getBusinessData: function(type){
			//清空之前画的marker
			if(markersArr){
				for (var i = 0; i < markersArr.length; i++) {
					markersArr[i].setMap(null);
				}
			}

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
				"dataType": "JSONP",
				"async": false,
				"success": function(data){
					data = JSON.parse(data);
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
						
			
			//如果拖拽，则更新地图
            if(type == 'drag' || type == 'zoom'){
				newLng = ePoint.lng;
	            newLat = ePoint.lat;
	        	$('.gz-addr-seladdr').attr('data-lng',newLng);
	            $('.gz-addr-seladdr').attr('data-lat',newLat);
            	init.getBusinessData();

            	AMap.plugin('AMap.Geocoder', function() {
				  	var geocoder = new AMap.Geocoder({
				    city: mapCity
				  	})
				 
				  	var lnglat = [ePoint.lng, ePoint.lat]

				  	geocoder.getAddress(lnglat, function(status, result) {
				    if (status === 'complete' && result.info === 'OK') {
				        // result为对应的地理位置详细信息
				        var district = result.regeocode.addressComponent.district;
				        var street = result.regeocode.addressComponent.street;
				        var township = result.regeocode.addressComponent.township;
				        $('.shoptype .qhAddress').text(district+street+township);
            			$('.gz-addr-seladdr').find('#addr').val(district+street+township);
				    }
				  	})
				})

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
            $.each(data,    function(e, o) {
                var bubbleLabel;
                bubbleLabel = init.replaceTpl(temp, o);
				marker = new AMap.Marker({
					content: bubbleLabel,
					position: [o.longitude, o.latitude]
				});
				marker.setMap(map);

				markersArr.push(marker);

            });          

		}

		//删除地图气泡
		,cleanBubble: function(){
			map.remove(markersArr);
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
			textAlign: "center",
			fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
		}

    
    // 地图被拖拽之后重新定位
    $('.zoom-local').click(function(){   
 	    
        if(stLng && stLat){//定位成功 绘制当前位置
	      	map.setCenter([stLng, stLat]); //设置地图中心点
          	$('.shoptype .qhAddress').html(stAdress);
	      	//回到当前位置时显示当前位置所有商家
        	init.getBusinessData(); 
        }  
    })


