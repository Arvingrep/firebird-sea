$(function(){
	/*
	 * 验证逻辑
	 * 1.首先验证坐标值，如果坐标值都不为0，则就以些坐标在地图上标注;
	 * 2.如果详细地址不为空，则解析此地址，如果解析成功，则以此地址作为中心点;
	 * 3.如果详细地址解析不成功，则解析城市名，如果解析成功，以城市名为中心点;
	 * 4.如果都不成功，则IP定位当前城市；
	 */
	 var parWinAddr = $(window.parent.document).find('#currAddr');
	 var parWinAddrs = $(window.parent.document).find('.addrBtn');
	 var addrArr = $(window.parent.document).find('#addrArr');
	var city = $("#city").val();
	var addr = $("#addr").val();
	var map_default_lng = $("#lng").val();
	var map_default_lat = $("#lat").val();
	var map_tmp_lng = 0;
	var map_tmp_lat = 0;

    if(addr && city == '' && map_default_lng == 0 && map_default_lat == 0){
        setTimeout(function(){
            $('#keyword').val(addr);
        }, 1000);
    }

	var map = new BMap.Map("map", {enableMapClick: false});
	var point = new BMap.Point(map_default_lng, map_default_lat);

	setTimeout(function(){
		map.centerAndZoom(point, 13);
	}, 500);
	var myIcon = new BMap.Icon("/static/images/mark_ditu.png?v=1", new BMap.Size(64, 64), {anchor: new BMap.Size(32,64)});
	var marker = new BMap.Marker(point, {icon: myIcon});  //自定义标注

	var myGeo = new BMap.Geocoder();

	//如果经、纬度都为0则设置城市名为中心点
	if(map_default_lng == 0 && map_default_lat == 0){
		//根据地址解析
		if(city != ""){
			var address = city;
			if(addr != "") address = addr;
			myGeo.getPoint(address, function(address){
				//如果解析成功
				if(address){
					setMark(address, 0);

					$("#lng").val(address.lng);
					$("#lat").val(address.lat);

					myGeo.getLocation(address, function(rs){
						var addComp = rs.addressComponents;
						var surroundingPois = rs.surroundingPois;
						var addr = addComp.street + addComp.streetNumber;
						var tit = "";
						if(surroundingPois.length > 0){
							if(addComp.street == "" || addComp.streetNumber == ""){
								addr = surroundingPois[0]['address'];
							}
							tit = surroundingPois[0]['title'];
						}
						parWinAddrs.text(addComp.city+'/'+addComp.district);
						addrArr.val(addComp.city+' '+addComp.district)
						$("#addr").val(addr + tit);
						if(!parWinAddr.val()){
							parWinAddr.val(addr + tit)
						}
					}, {
		    	        poiRadius: 1000,  //半径一公里
		    	        numPois: 1
		    	    });

				//不成功则以城市为中心点
				}else{
                    myGeo.getPoint(city, function(address){
                        //如果解析成功
                        if(address){
                            setMark(address, 0);

                            $("#lng").val(address.lng);
                            $("#lat").val(address.lat);

                            myGeo.getLocation(address, function(rs){
                                var addComp = rs.addressComponents;
                                var surroundingPois = rs.surroundingPois;
                                var addr = addComp.street + addComp.streetNumber;
                                var tit = "";
                                if(surroundingPois.length > 0){
                                    if(addComp.street == "" || addComp.streetNumber == ""){
                                        addr = surroundingPois[0]['address'];
                                    }
                                    tit = surroundingPois[0]['title'];
                                }
																parWinAddrs.text(addComp.city+'/'+addComp.district)
																addrArr.val(addComp.city+' '+addComp.district)
																$("#addr").val(addr + tit);
																parWinAddr.val(addr + tit)
																console.log(addr + tit)
                            }, {
                                poiRadius: 1000,  //半径一公里
                                numPois: 1
                            });

                            //不成功则以城市为中心点
                        }else{
                            setMark(city, 1);
                        }
                    }, city);
				}
			}, city);

		//如果城市为空，则浏览器定位当前位置
		}else{
			var geolocation = new BMap.Geolocation();
			geolocation.getCurrentPosition(function(r){
				if(this.getStatus() == BMAP_STATUS_SUCCESS){

					setMark(r.point, 0);

					$("#lng").val(r.point.lng);
					$("#lat").val(r.point.lat);

					myGeo.getLocation(r.point, function(rs){
						var addComp = rs.addressComponents;
						var surroundingPois = rs.surroundingPois;
						var addr = addComp.street + addComp.streetNumber;
						var tit = "";
						if(surroundingPois.length > 0){
							if(addComp.street == "" || addComp.streetNumber == ""){
								addr = surroundingPois[0]['address'];
							}
							tit = surroundingPois[0]['title'];
						}
						parWinAddrs.text(addComp.city+'/'+addComp.district)
						addrArr.val(addComp.city+' '+addComp.district)
						$("#addr").val(addr + tit);

						if(!parWinAddr.val()){
							parWinAddr.val(addr + tit)
						}
					}, {
						poiRadius: 1000,  //半径一公里
						numPois: 1
					});

				}
				else {
					alert('failed'+this.getStatus());
				}
			},{enableHighAccuracy: true})
		}

	}else{
		marker = new BMap.Marker(point, {icon: myIcon});  //自定义标注
		map.addOverlay(marker);
		marker.enableDragging();
		listener();

		myGeo.getLocation(point, function(rs){
			var addComp = rs.addressComponents;
			var surroundingPois = rs.surroundingPois;
			var addr = addComp.street + addComp.streetNumber;
			var tit = "";
			if(surroundingPois.length > 0){
				if(addComp.street == "" || addComp.streetNumber == ""){
					addr = surroundingPois[0]['address'];
				}
				tit = surroundingPois[0]['title'];
			}
			parWinAddrs.text(addComp.city+'/'+addComp.district)
			addrArr.val(addComp.city+' '+addComp.district)
			$("#addr").val(addr + tit);
			parWinAddr.val(addr + tit)
			console.log(addr + tit)
		}, {
			poiRadius: 1000,  //半径一公里
			numPois: 1
		});
	}

	map.enableScrollWheelZoom();
	map.enableKeyboard();
	map.addControl(new BMap.NavigationControl({anchor: BMAP_ANCHOR_BOTTOM_RIGHT, type: BMAP_NAVIGATION_CONTROL_ZOOM}));
	// map.addControl(new BMap.MapTypeControl({mapTypes: [BMAP_NORMAL_MAP,BMAP_HYBRID_MAP]}));     //2D图，卫星图

	//设置中心点并添加标注
	function setMark(address, type){
		map.clearOverlays();
		// map.setCenter(address);
        map.centerAndZoom(address, 18);
		if(type == 0){
			point = new BMap.Point(address.lng, address.lat);
			marker = new BMap.Marker(point, {icon: myIcon});  //自定义标注
		}
		map.addOverlay(marker);
		marker.enableDragging();

		listener();
	}

	//监听事件
	function listener(){
		//点击
		map.addEventListener("click", function(e){
			marker.setPosition(e.point);
			$("#lng").val(e.point.lng);
			$("#lat").val(e.point.lat);
			myGeo.getLocation(e.point, function(rs){
				var addComp = rs.addressComponents;
				var surroundingPois = rs.surroundingPois;
				var addr = addComp.street + addComp.streetNumber;
				var tit = "";
				if(surroundingPois.length > 0){
					if(addComp.street == "" || addComp.streetNumber == ""){
						addr = surroundingPois[0]['address'];
					}
					tit = surroundingPois[0]['title'];
				}
				parWinAddrs.text(addComp.city+'/'+addComp.district)
				addrArr.val(addComp.city+' '+addComp.district)
				$("#addr").val(addr + tit);
				parWinAddr.val(addr + tit)
				console.log(addr + tit)
			}, {
    	        poiRadius: 1000,  //半径一公里
    	        numPois: 1
    	    });
		});

		//拖动
		marker.addEventListener("dragend", function(e){
			$("#lng").val(e.point.lng);
			$("#lat").val(e.point.lat);
			myGeo.getLocation(e.point, function(rs){
				var addComp = rs.addressComponents;
				var surroundingPois = rs.surroundingPois;
				var addr = addComp.street + addComp.streetNumber;
				var tit = "";
				if(surroundingPois.length > 0){
					if(addComp.street == "" || addComp.streetNumber == ""){
						addr = surroundingPois[0]['address'];
					}
					tit = surroundingPois[0]['title'];
				}
				parWinAddrs.text(addComp.city+'/'+addComp.district)
				addrArr.val(addComp.city+' '+addComp.district)
				$("#addr").val(addr + tit);
				parWinAddr.val(addr + tit)
				console.log(addr + tit)
			}, {
    	        poiRadius: 1000,  //半径一公里
    	        numPois: 1
    	    });
		});
	}

	//搜索回车提交
    $("#keyword").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#search").click();
        }
    });

	//关键字搜索
	$("#search").bind("click", function(){
		var keyword = $("#keyword");
		console.log(111)
		if($.trim(keyword.val()) != ""){

			var ls = new BMap.LocalSearch(map);
			ls.setSearchCompleteCallback(function(rs) {
				if (ls.getStatus() == BMAP_STATUS_SUCCESS) {
					var poi = rs.getPoi(0);
					if (poi) {
						setMark(poi.point, 0);

						$("#lng").val(poi.point.lng);
						$("#lat").val(poi.point.lat);

						myGeo.getLocation(poi.point, function(rs){
							var addComp = rs.addressComponents;
							var surroundingPois = rs.surroundingPois;
							var addr = addComp.street + addComp.streetNumber;
							var tit = "";
							if(surroundingPois.length > 0){
								if(addComp.street == "" || addComp.streetNumber == ""){
									addr = surroundingPois[0]['address'];
								}
								tit = surroundingPois[0]['title'];
							}
							parWinAddrs.text(addComp.city+'/'+addComp.district)
							addrArr.val(addComp.city+' '+addComp.district)
							$("#addr").val(addr + tit);
							parWinAddr.val(keyword.val())
							console.log(addr + tit)
						}, {
			    	        poiRadius: 1000,  //半径一公里
			    	        numPois: 1
			    	    });

					}
				}
			});
			ls.search(keyword.val());

		}else{
			keyword.focus();
		}
	});

	var autocomplete = new BMap.Autocomplete({
		input: "keyword",
		location: $("#city").val()
	});

	$("#keyword").change(function(){
		setTimeout(function(){
			$("#search").click();
		},200)
	})

});
