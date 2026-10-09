$(function(){

	/*
	 * 验证逻辑
	 * 1.首先验证坐标值，如果坐标值都不为0，则就以些坐标在地图上标注;
	 * 2.如果详细地址不为空，则解析此地址，如果解析成功，则以此地址作为中心点;
	 * 3.如果详细地址解析不成功，则解析城市名，如果解析成功，以城市名为中心点;
	 * 4.如果都不成功，则IP定位当前城市；
	 */

	var city = $("#city").val();
	var addr = $("#addr").val();
	var map_default_lng = $("#lng").val();
	var map_default_lat = $("#lat").val();
	var map_tmp_lng = 0;
	var map_tmp_lat = 0;
	var windowsArr = new Array();
  var parWinAddr = $(window.parent.document).find('#currAddr');
  var parWinAddrs = $(window.parent.document).find('.addrBtn');
  var addrArr = $(window.parent.document).find('#addrArr');
	var mapObj,toolBar,MGeocoder,mar;

	//初始化地图对象，加载地图
	mapObj = new AMap.Map("map",{
        //二维地图显示视口
        view: new AMap.View2D({
            center: new AMap.LngLat(map_default_lng,map_default_lat),//地图中心点
            zoom: 13 //地图显示的缩放级别
        })
    });

    //在地图中添加ToolBar插件
    mapObj.plugin(["AMap.ToolBar"],function(){
        toolBar = new AMap.ToolBar({position: 'RB'});
        toolBar.show();
        toolBar.showDirection();
        toolBar.hideRuler();
        mapObj.addControl(toolBar);
    });

    //添加地图类型切换插件
	mapObj.plugin(["AMap.MapType"], function () {
		//地图类型切换
		var mapType = new AMap.MapType({
			defaultType: 0//默认显示地图
		});
		mapObj.addControl(mapType);
	});

	//配置marker图标
    var markerOption = {
    	map: mapObj,
        draggable:true,   //点标记可拖拽
        cursor:'move',    //鼠标悬停点标记时的鼠标样式
        raiseOnDrag:true, //鼠标拖拽点标记时开启点标记离开地图的效果
        offset:new AMap.Pixel(-32,-64), //标记显示位置偏移量

	    icon:new AMap.Icon({  //复杂图标
	            size:new AMap.Size(64,64),  //图标大小
	            image:"/static/images/mark_ditu.png" //图标地址
	        })
    };

	//自定义地图配置
	//如果经、纬度都为0则设置城市名为中心点
	if(map_default_lng == 0 && map_default_lat == 0){

		//根据地址解析
		if(city != ""){
			var address = city;
			if(addr != "") address = addr;

			//加载地理编码插件
			mapObj.plugin(["AMap.Geocoder"], function () {
				MGeocoder = new AMap.Geocoder({
					city: city
				});
				//返回地理编码结果
				AMap.event.addListener(MGeocoder, "complete", geocoder_CallBack);
				//返回地理编码结果
				AMap.event.addListener(MGeocoder, "error", geocoder_errorCallBack);
				//地理编码
				MGeocoder.getLocation(address);
			});

		//如果城市为空，地图默认显示用户当前城市范围
		}else{
			mapObj = new AMap.Map("map");
			markerOption = {
		    	map: mapObj,
		        draggable:true,   //点标记可拖拽
		        cursor:'move',    //鼠标悬停点标记时的鼠标样式
		        raiseOnDrag:true, //鼠标拖拽点标记时开启点标记离开地图的效果
		        offset:new AMap.Pixel(-32,-64), //标记显示位置偏移量

			    icon:new AMap.Icon({  //复杂图标
			            size:new AMap.Size(64,64),  //图标大小
			            image:"/static/images/mark_ditu.png" //图标地址
			        })
		    };
		}

	}else{
		addmarker(map_default_lng, map_default_lat);
	}

    
	function addmarker(lngX, latY) {
		mar ? mar.setMap(null) : "";  //清除地图上已有的marker
	    markerOption.position = new AMap.LngLat(lngX, latY); //设置marker的坐标位置
	    mar = new AMap.Marker(markerOption);   //向地图添加marker
	    new AMap.LngLat(lngX, latY);
	    mapObj.setZoom(14);
	    listener();

	    getAddress(markerOption.position);
	}

	//监听点击事件
	AMap.event.addListener(mapObj, "click", function(e){
		addmarker(e.lnglat.lng, e.lnglat.lat);
		getAddress(e.lnglat);
	});

	//监听拖动事件
	function listener(){
		AMap.event.addListener(mar, "dragend", function(e){
			getAddress(e.lnglat);
		});
	}

	//地理编码返回结果展示
	function geocoder_CallBack(data){
	    //地理编码结果数组
	    var geocode = new Array();
	    geocode = data.geocodes;
	    for (var i = 0; i < geocode.length; i++) {
	    	var lngX = geocode[i].location.getLng(),
	    		latY = geocode[i].location.getLat();
	        addmarker(lngX, latY);
	    }
	    mapObj.setFitView();
	}

	//地理编码返回结果展示
	function geocoder_errorCallBack(data){
	    var lnglat = new AMap.LngLat(116.397428, 39.90923);
	    mapObj.setCenter(lnglat);
	}

	//根据坐标获取详细地址
	function getAddress(lnglat){
		lngX = lnglat.lng;
		latY = lnglat.lat;
		mapObj.setCenter(lnglat);  //设置地图中心点
		// console.log(lnglat)
		//addmarker(lngX, latY);  //添加新的marker

		$("#lng").val(lngX);
		$("#lat").val(latY);

		var lnglatXY = new AMap.LngLat(lngX, latY);
		//加载地理编码插件
	    mapObj.plugin(["AMap.Geocoder"], function() {
	        MGeocoder = new AMap.Geocoder({
	            radius: 1000,
	            extensions: "all"
	        });
	        //返回地理编码结果
	        AMap.event.addListener(MGeocoder, "complete", function(e){
	        	var addComp = e.regeocode.addressComponent;
						console.log(addComp)
	        	$("#addr").val(addComp.district + addComp.street + ((addComp.streetNumber != "" && addComp.streetNumber != "NaN") ?  addComp.streetNumber + (addComp.streetNumber.indexOf("号") > -1 ? "" : "号") : ""));
						if(!parWinAddr.val()){
							parWinAddr.val($("#addr").val())
						}
						parWinAddrs.text(addComp.city+'/'+addComp.district)
						addrArr.val(addComp.city+' '+addComp.district)
	        });
	        //逆地理编码
	        MGeocoder.getAddress(lnglatXY);
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
		if($.trim(keyword.val()) != ""){

			//加载地理编码插件
		    mapObj.plugin(["AMap.Geocoder"], function() {       
		        MGeocoder = new AMap.Geocoder({
		//             city: city
		        });
		        //返回地理编码结果
		        AMap.event.addListener(MGeocoder, "complete", geocoder_CallBack);
		        //地理编码
		        MGeocoder.getLocation(keyword.val());
		    });

		}else{
			keyword.focus();
		}
	});

    //输入提示
    var auto = new AMap.Autocomplete({
        input: "keyword"
    });
    auto.on("select", function(e){
        addmarker(e.poi.location.lng, e.poi.location.lat);
    });

    //输入提示
    // var autoOptions = {
    //     input: "keyword"
    // };

    // AMap.plugin(['AMap.PlaceSearch','AMap.AutoComplete'], function(){
    //     var auto = new AMap.AutoComplete(autoOptions);
    //     var placeSearch = new AMap.PlaceSearch({
    //         map: mapObj
    //     });  //构造地点查询类
    //     auto.on("select", select);//注册监听，当选中某条记录时会触发
    //     function select(e) {

    //         console.log(e);
    //         placeSearch.setCity(e.poi.adcode);
    //         placeSearch.search(e.poi.name);  //关键字查询查询
    //     }
    // });

});
