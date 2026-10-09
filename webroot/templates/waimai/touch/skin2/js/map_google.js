

	var infoWindow,infowincontent = '' ,isload, markersArr = [],markersArr2 = [],allLoad = false, init = {

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

			var mapOptions = {
	            zoom: 14,
	            center: new google.maps.LatLng(oldPointLat, oldPointLng),
	            zoomControl: true,
	            mapTypeControl: false,
	            streetViewControl: false,
	            zoomControlOptions: {
	              style: google.maps.ZoomControlStyle.SMALL
	            }
	        }
			map = new google.maps.Map(document.getElementById('topMap'), mapOptions);
			google.maps.event.addListener(map, "tilesloaded", init.tilesloaded); //地图加载完毕执行

		}

		//地图加载完毕添加地图比例尺控件/自定义缩放
		,tilesloaded: function(){
            if(isload) return;
            isload = true;
            //加载骑手数据
			init.getBusinessData();
			init.dragListen();		

		}
		//监听拖拽
		,dragListen:function(){
			google.maps.event.addListener(map,"zoom_changed", function(event) {
                var location = map.getCenter();
				var pos = {
		            lat: location.lat(),
		            lng: location.lng()
		        };
		        init.updateOverlays("zoom",pos);
            });

            google.maps.event.addListener(map,"dragend", function(event) {
            	var location = map.getCenter();
				var pos = {
		            lat: location.lat(),
		            lng: location.lng()
		        };
		        init.updateOverlays("drag",pos);

			});

			google.maps.event.addListener(map,"dragstart", function() {
				$('.shoptype .qhAddress').text('正在定位中...');
			});
		}



		//获取商家，区域信息
		,getBusinessData: function(type){
			//清空之前画的marker
			if(markersArr){
				for (var i = 0; i < markersArr.length; i++) {
					markersArr[i].setMap(null);
				}
				markersArr.length = 0;
			}
			var visBounds = init.getBounds();
			var boundsArr = [];
			boundsArr.push('min_latitude='+visBounds['min_latitude']);
			boundsArr.push('max_latitude='+visBounds['max_latitude']);
			boundsArr.push('min_longitude='+visBounds['min_longitude']);
			boundsArr.push('max_longitude='+visBounds['max_longitude']);
            var data = boundsArr.join("&")+"&page=1&pageSize=99";
            
            $.ajax({
                "url": "/include/ajax.php?service=business&action=blist",
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
                            districtData[i]['longitude'] = lists[i].lat;//接口中数据取反了 需处理
                            districtData[i]['latitude'] = lists[i].lng;

							var poi = new google.maps.LatLng(parseFloat(lists[i].lng), parseFloat(lists[i].lat));
							marker = new MarkerWithLabel({
							   position: poi,
							   draggable: true,
							   map: map,
							   labelAnchor: new google.maps.Point(16, 28),
							   labelContent: '<div class="bubble bubble-1"></div>',
							   icon:'/static/images/blank.gif',
							 });

							markersArr.push(marker);

						}

					}

					data = init.getVisarea(districtData);

				    if(data.length>0){
		        		$('.qsNum').html('附近有<strong>'+data.length+'</strong>名骑手');
		        	}else{
		        		$('.qsNum').html('附近暂无骑手');
		        	}

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
            	getLocation(ePoint);
            	

            	function getLocation(ePoint){
            		var geocoder = new google.maps.Geocoder();
            		geocoder.geocode({
					    'location': ePoint
					}, function(results, status) {
					    if (status === 'OK') {
					      if (results[0]) {

					        //This is yout formatted address
					       	$('.shoptype .qhAddress').text(results[0].formatted_address);
	            			$('.gz-addr-seladdr').find('#addr').val(results[0].formatted_address);

					      } else {
					        window.alert('No results found');
					      }
					    } else {
					      window.alert('Geocoder failed due to: ' + status);
					    }
					});	
		        }

            }

            
       
        }
		//获取地图可视区域范围
        ,getBounds: function(){
            var e = map.getBounds();
            var eBounds =  JSON.parse(JSON.stringify(e));
            var swLat = eBounds.south,
            nrLat = eBounds.north,
            swLng = eBounds.west,
            nrLng = eBounds.east;
            
            return {
                min_longitude: swLng,
                max_longitude: nrLng,
                min_latitude: swLat,
                max_latitude: nrLat
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

	}




	// 地图被拖拽之后重新定位
    $('.zoom-local').click(function(){   
 	    
        if(oldPointLng && oldPointLat){//定位成功 绘制当前位置

	        map.setCenter(new google.maps.LatLng(stLat,stLng));
	        $('.shoptype .qhAddress').html(stAdress);
	        //回到当前位置时显示当前位置所有商家
        	init.getBusinessData(); 
        }     

    })

