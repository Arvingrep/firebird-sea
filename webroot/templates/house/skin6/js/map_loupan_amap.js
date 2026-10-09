$(function(){

	//文本框placeholder
	$("html input").placeholder();

	var map, filterData, infoWindow, isload, markersArr = [], markerHx, list = $(".list"), init = {

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
      map = new AMap.Map("map",{
          //二维地图显示视口
          view: new AMap.View2D({
              zoom: 11 //地图显示的缩放级别
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

      //添加地图类型切换插件
      map.plugin(["AMap.MapType"],function(){
        //地图类型切换
        var mapType= new AMap.MapType({
            defaultType:0//默认显示地图
        });
        map.addControl(mapType);
      });
      AMap.event.addListener(map, "tilesloaded", init.tilesloaded()); //地图加载完毕执行

    }

		//地图加载完毕添加地图比例尺控件/自定义缩放/收起/展开侧栏
		,tilesloaded: function(){

      if(isload) return;
      isload = true;

			init.updateOverlays("tilesloaded");

			//自定义缩放
			$(".zoom-ctrl span").on("click", function(){
				var zoom = map.getZoom();
				$(this).hasClass("zoom-plus") ? map.setZoom(zoom + 1) : map.setZoom(zoom - 1);
			});

			//收起/展开侧栏
			$(".map-os").bind("click", function(){
				var t = $(this), sidebar = $(".sidebar");
				t.hasClass("open") ? (sidebar.stop().animate({"left": 0}, 150), t.attr("title", "收起左栏"), t.removeClass("open"), $("#"+g_conf.mapWrapper).animate({"left": "325px"}, 150)) : (sidebar.stop().animate({"left": "-324px"}, 150), t.attr("title", "展开左栏"), t.addClass("open"), $("#"+g_conf.mapWrapper).animate({"left": "0"}, 150));
			});


			//加载搜索&筛选&排序
			init.search();
			init.filter();
			init.sortby();

			init.getLoupanData();

			AMap.event.addListener(map, 'zoomend', function() {
				init.updateOverlays("zoom");
			});
			AMap.event.addListener(map, 'dragend', function() {
				init.updateOverlays("drag");
			});

			//气泡点击  区域
			$("#"+g_conf.mapWrapper).on("click", ".bubble-1", function() {

				var t = $(this), zoom = map.getZoom(),
				newView = {
					lng: parseFloat(t.attr("data-longitude")),
					lat: parseFloat(t.attr("data-latitude")),
					typ: zoom + 1
				};
				newView.lng && newView.lat ?  map.setZoomAndCenter((newView.typ), [newView.lng, newView.lat]) : map.setZoom(newView.typ);

			//户型
			}).on("click", ".bubble-2 .bubble-inner", function(){

				var t = $(this).closest(".bubble"), id = Number(t.attr("data-id"));
				isClickHx = true;
				init.getHxData(id);
				return false;


			//楼盘
			}).on("click", ".bubble-2", function(e) {

				var t = $(this),
				newView = {
					lng: parseFloat(t.attr("data-longitude")),
					lat: parseFloat(t.attr("data-latitude")),
					typ: 15
				};
				newView.lng && newView.lat ? map.setZoomAndCenter((newView.typ + 1), [newView.lng, newView.lat]) : map.setZoom(newView.typ);


			//关闭周边信息
			}).on("click", ".bubble-4 .close", function(){

				init.closeHx();

			});


			//楼盘点击事件
			list.delegate("dl", "click", function(){
				var e = $(this),
						t = {
							lng: parseFloat(e.attr("data-lng")),
							lat: parseFloat(e.attr("data-lat")),
							typ: 15
						};

				isClickHx = true;
				t.lng && t.lat ? map.setZoomAndCenter((t.typ + 1), [t.lng, t.lat]) : map.setZoom(t.typ);
				init.getHxData(Number(e.attr("data-id")));

			});


			//关闭户型信息
			$(".hxlist").delegate(".closehx", "click", function(){
				init.closeHx();
			});

			//自定义滚动条
			$(".filter").mCustomScrollbar({
				theme: "minimal-dark",
				scrollInertia: 400,
				advanced: {
					updateOnContentResize: true,
					autoExpandHorizontalScroll: true
				}
			});

			//自定义滚动条
			list.mCustomScrollbar({
				theme: "minimal-dark",
				scrollInertia: 400,
				advanced: {
					updateOnContentResize: true,
					autoExpandHorizontalScroll: true
				},
				callbacks: {
					//到达底部加载下一页
					onTotalScroll: function(){
						loupanPage++;
						isNewList = false;
						init.getLoupanPageList(loupanpageData_);
					}
				}
			});

			init.updateLoupanListDiv();
			$(window).resize(function(){
				init.updateLoupanListDiv();
			});

		}


		//更新列表容器高度
		,updateLoupanListDiv: function(){

			var sidebarHeight = $(".sidebar").height(),
				foHeight = $(".f-o").height(),
				lcountHeight = $(".lcount").height();

			list.css({"height": sidebarHeight - foHeight - lcountHeight + "px"});
			list.mCustomScrollbar("update");
		}


		//获取区域及楼盘信息
		,getLoupanData: function(type){

			if(markersArr){
				for (var i = 0; i < markersArr.length; i++) {
					markersArr[i].setMap(null);
				}
			}

			var data = "keywords="+encodeURIComponent(g_conf.keywords)+(g_conf.filter.length > 0 ? "&"+g_conf.filter.join("&") : "")+"&orderby="+g_conf.orderby;

            //二级区域
			$.ajax({
				"url": masterDomain+"/include/ajax.php?service=house&action=loupanDistrict",
				"data": data,
				"dataType": "JSONP",
				"async": false,
				"success": function(data){

					var districtData = [];
					if(data && data.state == 100){

						var list = data.info;
						for(var i = 0; i < list.length; i++){
							districtData[i] = [];
							districtData[i]['district_id'] = list[i].id;
							districtData[i]['district_name'] = list[i].addrname;
							districtData[i]['longitude'] = list[i].longitude;
							districtData[i]['latitude'] = list[i].latitude;
							districtData[i]['count'] = list[i].count;

						}

					}

					g_conf.districtData = districtData;
					init.doNext(type);

				}
			});

            //三级
            $.ajax({
				"url": masterDomain+"/include/ajax.php?service=house&action=loupanDistrict&son=1",
				"data": data,
				"dataType": "JSONP",
				"async": false,
				"success": function(data){

					var districtData = [];
					if(data && data.state == 100){

						var list = data.info;
						for(var i = 0; i < list.length; i++){
							districtData[i] = [];
							districtData[i]['district_id'] = list[i].id;
							districtData[i]['district_name'] = list[i].addrname;
							districtData[i]['longitude'] = list[i].longitude;
							districtData[i]['latitude'] = list[i].latitude;
							districtData[i]['count'] = list[i].count;

						}

					}

					g_conf.districtData3 = districtData;
					// init.doNext(type);

				}
			});

			$.ajax({
				"url": masterDomain+"/include/ajax.php?service=house&action=loupanList&pageSize=9999999",
				"data": data,
				"dataType": "JSONP",
				"async": false,
				"success": function(data){

					var loupanData = [];
					if(data && data.state == 100){

						var list = data.info.list;
						for(var i = 0; i < list.length; i++){
							loupanData[i] = [];
							loupanData[i]['loupan_id'] = list[i].id;
							loupanData[i]['longitude'] = list[i].longitude;
							loupanData[i]['latitude'] = list[i].latitude;
							loupanData[i]['resblock_name'] = list[i].title;
							loupanData[i]['loupan_addr'] = list[i].address;
							loupanData[i]['ptype'] = list[i].ptype;
							loupanData[i]['average_price'] = list[i].price;
							loupanData[i]['cover_pic'] = list[i].litpic;
							loupanData[i]['house_type'] = list[i].protype;
							loupanData[i]['url'] = list[i].url;

						}

					}

					g_conf.loupanData = loupanData;
					init.doNext(type);

				}
			});

		}

		//加载完成执行下一步
		,doNext: function(type){
			if(g_conf.districtData && g_conf.loupanData){
				init.updateOverlays(type);
			}
		}

		//获取户型信息
		,getHxData: function(id){

			//获取点击的楼盘信息
			$.each(g_conf.loupanData, function(d1, d2){
				if(d2.loupan_id == id){
					loupanChooseData = d2;
				}
			});

			var ret = [];

			$.ajax({
				"url": masterDomain+"/include/ajax.php?service=house&action=apartmentList&act=loupan&loupanid="+id,
				"dataType": "JSONP",
				"async": false,
				"success": function(data){

					if(data && data.state == 100){

						var list = data.info.list;
						for(var i = 0; i < list.length; i++){
							ret[i] = [];
							ret[i]['id'] = list[i].id;
							ret[i]['loupan_id'] = id;
							ret[i]['frame_name'] = list[i].title;
							ret[i]['build_area'] = list[i].area;
							ret[i]['direction'] = list[i].direction;
							ret[i]['url'] = list[i].url;
							ret[i]['room_num'] = list[i].room + "室" + list[i].hall + "厅" + list[i].guard + "卫";
							ret[i]['frame_pic'] = list[i].litpic;
							ret[i]['note'] = list[i].note;
						}

						init.loupanNearbyInfo(ret);

					}
                    else{
                        window.open(loupanChooseData.url);
                        init.closeHx();
                    }

				}
			});

		}


		//关闭户型及周边信息
		,closeHx: function(){

			$(".hxlist").stop().animate({"left": "-400px"}, 150, function(){
				$(".hxlist").html("");
			});

			isClickHx = false;
			$(".map-os").show();
			loupanChooseData.longitude && loupanChooseData.latitude ? (map.setZoomAndCenter((14), [loupanChooseData.longitude, loupanChooseData.latitude])) : map.setZoom(14);
			init.updateOverlays();
			map.remove(markerHx);

		}


		//附近信息
		,loupanNearbyInfo: function(hxData){

			//户型列表
			var hxlist = [], hxcount = hxData.length;
			for(var i = 0; i < hxcount; i++){
				hxlist.push(init.replaceTpl(listTemplate.hxlist, hxData[i]));
			}
			loupanChooseData.hxcount = hxcount;
			loupanChooseData.hx = hxlist.join("");

			var left = $(".map-os").hasClass("open") ? "324px" : 0;
			$(".hxlist").html(init.replaceTpl(listTemplate.longpanOnly, loupanChooseData)).stop().animate({"left": left}, 150);
			$(".map-os").hide();


			//自定义滚动条
			$(".hxlist .con").mCustomScrollbar({
				theme: "minimal-dark",
				scrollInertia: 400,
				advanced: {
					updateOnContentResize: true,
					autoExpandHorizontalScroll: true
				}
			});


			//创建周边信息气泡
			var loupanChooseDataArr = [];
			loupanChooseDataArr.push(loupanChooseData);
			map.setZoomAndCenter((15), [loupanChooseData.longitude, loupanChooseData.latitude])

			markerHx = new AMap.Marker({
				position: [loupanChooseData.longitude, loupanChooseData.latitude]
			});
			markerHx.setMap(map);

			init.cleanBubble();

		}



		//拼接楼盘列表
		,mosaicLoupanList: function(data){

			//如果是点击的楼盘列表，则不更新楼盘列表内容
			if(isClickHx) return false;

			//可视区域内楼盘数量
			$(".lcount strong").html(data.length);

			if(data.length == 0){
				$(".loupan-list").html('<p class="empty">很抱歉，没有找到合适的房源，请重新查找</p>');
				return;
			}

			isNewList = true;
			loupanPage = 1;

			init.getLoupanPageList(data);

		}


		//获取指定分页的楼盘列表
		,getLoupanPageList: function(data){

			loupanpageData_ = data;

			var index = loupanPage * 10;
			var allPage = Math.ceil(loupanpageData_.length/10);
			var prevIndex = (loupanPage - 1) * 10;

			//到达最后一页中止
			if(loupanPage > allPage){
				loupanPage--;
				return;
			}

			var loupanList = [];
			var newData = loupanpageData_.slice(prevIndex, prevIndex + 10);
			$.each(newData, function(i, d){
					d.priceTpl = d.average_price ? '<strong>'+d.average_price+'</strong>'+(d.ptype == 1 ? ''+echoCurrency('short')+'/m²' : '万'+echoCurrency('short')+'/套') : '<strong>价格待定</strong>';
					loupanList.push(init.replaceTpl(listTemplate.building, d));
			});


			if(isNewList){
				list.mCustomScrollbar("scrollTo","top");
				$(".loupan-list").html(loupanList.join(""));
			}else{
				$(".loupan-list").append(loupanList.join(""));
			}

			list.mCustomScrollbar("update");

		}

		//地理编码返回结果展示
		, geocoder_CallBack: function(data){
	    //地理编码结果数组
	    var geocode = new Array();
	    geocode = data.geocodes;
	    for (var i = 0; i < geocode.length; i++) {
	    	var lngX = geocode[i].location.getLng(),
	    		latY = geocode[i].location.getLat();
					map.setZoomAndCenter(g_conf.minZoom, [lngX, latY]);
	    }
	    map.setFitView();
		}


		//更新地图状态
		,updateOverlays: function(type){

			if(type == "tilesloaded"){
				map.plugin(["AMap.Geocoder"], function() { 
		        MGeocoder = new AMap.Geocoder({
		            city: '全国'
		        });
		        //返回地理编码结果
		        AMap.event.addListener(MGeocoder, "complete", init.geocoder_CallBack);
		        //地理编码
		        MGeocoder.getLocation(g_conf.cityName, function(status, result) {
                    if (status === 'complete'&&result.geocodes.length) {
                        var lnglat = result.geocodes[0].location
                        map.setZoomAndCenter(g_conf.minZoom, lnglat);
                        init.updateOverlays();
                    }else{
                        alert('获取定位失败，请拖动地图到您的位置进行查看！');
                    }
                });
		    });
			}

			//如果是点击的楼盘列表，则不更新地图
			if(isClickHx) return false;

			var zoom = map.getZoom(), data = [];

			//区域集合
			if(zoom - g_conf.minZoom <= 1){

				data = init.getVisarea(g_conf.districtData);
				init.createBubble(data, bubbleTemplate[1], 1);

			}
            else if(zoom - g_conf.minZoom <= 2){

				data = init.getVisarea(g_conf.districtData3);
				init.createBubble(data, bubbleTemplate[1], 1);

            }
            else{

				//楼盘集合
				if(zoom - g_conf.minZoom == 3){

					data = init.getVisarea(g_conf.loupanData);
					init.createBubble(data, bubbleTemplate[2], 2, bubbleTemplate.moreTpl);

				//只显示楼盘名称
				}else if(zoom - g_conf.minZoom >= 4){

					data = init.getVisarea(g_conf.loupanData);
					init.createBubble(data, bubbleTemplate[3], 2, bubbleTemplate.moreTpl);

					//显示楼盘名称、类型、价格
					zoom >= 16 ? $(".bubble-2").addClass("clicked") : $(".bubble-2").removeClass("clicked");
				}

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

			$.each(data,	function(e, o) {
				var bubbleLabel, r = [];
				if(more){

					o.priceTpl = '<span class="price">' + o.average_price ? (o.average_price + '</span><i>' + (o.ptype == 1 ? echoCurrency('short')+"/m²" : ("万"+echoCurrency('short')+"/套")) + '</i>') : "价格待定</span>";
					o.moreTpl = init.replaceTpl(more, o);

				}

				$("#"+g_conf.mapWrapper).on("mouseover", ".amap-marker", function() {
					var t = $(this);
					this.style.zIndex = 104;
				})

				$("#"+g_conf.mapWrapper).on("mouseout", ".amap-marker", function() {
					var t = $(this);
					this.style.zIndex = 100;
				})

                var zoom = map.getZoom();
                if(zoom > 16){
                    o.clicked = 'clicked';
                }else{
                    o.clicked = '';
                }

				bubbleLabel = init.replaceTpl(temp, o);
				marker = new AMap.Marker({
					content: bubbleLabel,
					position: [o.longitude, o.latitude]
				});
				marker.setMap(map);

				markersArr.push(marker);


			});

			//区域集合时统计数据为楼盘的数量
			data = resize == 1 ? init.getVisarea(g_conf.loupanData) : data;

			init.mosaicLoupanList(data);

		}

		//删除地图气泡
		,cleanBubble: function(){
			map.remove(markersArr);
		}


		//加载搜索
		,search: function(){

			$("#skey").autocomplete({
				source: function(request, response) {
					$.ajax({
						url: "/include/ajax.php?service=house&action=loupanList",
						dataType: "jsonp",
						data:{
							keywords: request.term
						},
						success: function(data) {
							if(data && data.state == 100){
								response($.map(data.info.list, function(item, index) {
									return {
										id: item.id,
										value: item.title,
										label: item.title
									}
								}));
							}else{
								response([])
							}
						}
					});
				},
				minLength: 1,
				select: function(event, ui) {
					g_conf.keywords = ui.item.value;
					init.getLoupanData();
				}
			}).autocomplete("instance")._renderItem = function(ul, item) {
				return $("<li>")
					.append(item.label)
					.appendTo(ul);
			};


			//回车搜索
			$("#skey").keyup(function (e) {
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
					$("#sbtn").click();
				}
			});


			//点击搜索
			$("#sbtn").bind("click", function(){
				var val = $.trim($("#skey").val());

				if($(".hxlist").html() != ""){
					init.closeHx();
				}

				g_conf.keywords = val;
				init.getLoupanData();
			});

		}


		//加载筛选
		,filter: function(){

			//筛选条件
			var filterArr = g_conf.filterConf, filterHtml = "", i = 0;
			if(filterArr != undefined){
				for(i; i < filterArr.length; i++){
					filterHtml += '<dl class="fn-clear" data-type="'+filterArr[i].type+'">';
					filterHtml += '<dt>'+filterArr[i].name+'：</dt>';
					filterHtml += '<dd class="fn-clear">';

					var b = 0, options = filterArr[i].options;
					for(b; b < options.length; b++){
						var cla = b == 0 ? ' class="on"' : '';
						filterHtml += '<a href="javascript:;" title="'+options[b][0]+'" data-val="'+options[b][1]+'" '+cla+'>'+options[b][0]+'</a>';
					}

					filterHtml += '</dd></dl>';
				}
			}
			$(".filter").prepend(filterHtml);

			//均价滑块
			$("#sjObj").slider({
				range: true,
				step: 1000,
				min: g_conf.sjMin,
				max: g_conf.sjMax,
				values: [g_conf.sjMin, g_conf.sjMax],
				slide: function(event, ui) {
					init.setSjTxtRange(ui.values);
				}
			});
			init.setSjRange(g_conf.sjMin, g_conf.sjMax);


			//显示筛选条件
			$(".f-o li:eq(0)").bind("click", function(){
				var t = $(this), filter = $(".filter");
				filter.is(":hidden") ? (filter.show(), t.addClass("on")) : (filter.hide(), t.removeClass("on"));
			});

			//切换选项
			$(".filter").delegate("dd a", "click", function(){
				if(!$(this).hasClass("on")){
					$(this).addClass("on").siblings("a").removeClass("on");
				}
			});


			init.cleanFilter();
			init.confirmFilter();
			init.cancelFilter();

		}

		//设置均价范围
		,setSjRange: function(min, max){
			init.setSjTxtRange([min, max]);
			$("#sjObj").slider({values: [min, max]});
		}

		//设置均价文字内容
		,setSjTxtRange: function(val){
			var min = val[0] < 10000 ? val[0]/1000 : val[0]/10000, max = val[1] < 10000 ? val[1]/1000 : val[1]/10000;
			minTxt = val[0] < 10000 ? "千" : "万";
			minTxt = val[0] == g_conf.sjMin ? "" : minTxt;
			maxTxt = val[1] < 10000 ? "千" : "万";
			maxTxt = val[1] == 0 ? "" : (val[1] == g_conf.sjMax ? maxTxt + "以上" : maxTxt);
			$("#sjTxt").text(min + minTxt + " - " + max + maxTxt);
		}

		//清空所选
		,cleanFilter: function(){

			$(".filter-clean a").bind("click", function(){
				$(".filter dl").each(function(){
					var t = $(this);
					if(!t.hasClass("sj")){
						t.find("dd a").removeClass("on");
						t.find("dd a:eq(0)").addClass("on");
					}
				});

				init.setSjRange(g_conf.sjMin, g_conf.sjMax);
			});

		}

		//确定筛选条件
		,confirmFilter: function(){

			$(".filter-confirm").bind("click", function(){

				var filter = [];

				//填充条件
				filterTitle = [];
				filterData = [];
				filterData['filter'] = [];
				$(".filter dl").each(function(i){
					var t = $(this);
					if(!t.hasClass("sj")){
						var type = t.attr("data-type"), val = t.find(".on").attr("data-val"), txt = t.find(".on").text();
						filterData['filter'][i] = [type, val];

						filter.push(type+"="+val);

						if(txt != "不限" && val != 0){
							filterTitle.push(txt);
						}
					}
				});

				var sjMin = $("#sjObj").slider("values", 0), sjMax = $("#sjObj").slider("values", 1);
				if(sjMin != 0 || sjMax != g_conf.sjMax){
					filterTitle.push(sjMin + "-" + sjMax + "万");
				}
				filterData['price'] = [sjMin, sjMax];

				if(sjMin != 0 || sjMax != g_conf.sjMax){
					filter.push('price'+"="+(sjMin == 0 ? 0 : sjMin/1000)+","+(sjMax == g_conf.sjMax ? "": sjMax/1000));
				}

				//筛选条件title
				var obj = $(".f-o li:eq(0)");
				if(filterTitle.length > 0){
					obj.addClass("curr").find("span").html(filterTitle.join("/")).attr("title", filterTitle.join("/"));
				}else{
					obj.removeClass("curr").find("span").html("筛选条件").attr("title", "筛选条件");
				}

				g_conf.filter = filter;
				obj.click();

				init.getLoupanData();

			});

		}

		//取消筛选
		,cancelFilter: function(){

			$(".filter-cancel").bind("click", function(){

				//填充最后一次的筛选条件
				if(filterData != undefined){

					var i = 0, filter = filterData['filter'], price = filterData['price'];
					for(i; i < filter.length; i++){
						var type = filter[i][0], val = filter[i][1];
						$(".filter dl").each(function(){
							var t = $(this), ty = t.attr('data-type');
							if(type == ty){
								t.find("a").removeClass("on");
								t.find("a[data-val="+val+"]").addClass("on");
							}
						});
					}

					init.setSjRange(price[0], price[1]);

				}

				$(".f-o li:eq(0)").click();

			});

		}

		//加载排序
		,sortby: function(){

			//筛选条件
			var orderby = $(".orderby"), sortArr = g_conf.sortConf, sortHtml = '', i = 0;
			if(sortArr != undefined){
				for(i; i < sortArr.length; i++){
					var cla = i == 0 ? ' class="on"' : '';
					sortHtml += '<li><a href="javascript:;" title="'+sortArr[i][0]+'" data-val="'+sortArr[i][1]+'" '+cla+'>'+sortArr[i][0]+'</a>';
				}
			}
			orderby.html(sortHtml);

			//显示排序
			$(".f-o li:eq(1)").hover(function(){
				var t = $(this);
				t.addClass("on");
				t.find(".orderby").show();
			}, function(){
				var t = $(this);
				t.removeClass("on");
				t.find(".orderby").hide();
			});

			//排序选中
			orderby.delegate("a", "click", function(){
				var parent = orderby.parent(), t = $(this);
				t.addClass("on").parent().siblings("li").find("a").removeClass("on");
				parent.removeClass("on");
				orderby.hide();
				var text = t.text(), val = t.attr('data-val');
				if(text == '默认排序'){
					parent.removeClass("curr");
					parent.find("span").html('默认排序');
				}else{
					parent.addClass("curr");
					parent.find("span").html(text);
				}

				g_conf.orderby = val;

				init.getLoupanData();

			});

		}

	}


	//气泡偏移
	var bubbleMapSize = {
			1 : function() {
				// return new BMap.Size(-46, -46)
			},
			2 : function() {
				// return new BMap.Size(-1, 10)
			},
			3 : function() {
				// return new BMap.Size(-1, 10)
			},
			4 : function() {
				// return new BMap.Size(-9, -9)
			}
		}

		//气泡模板
		,bubbleTemplate = {

			//区域
			1 : '<div class="bubble bubble-1" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${loupan_id}"><p class="name" title="${district_name}区">${district_name}区</p><p><span class="count">${count}</span>个楼盘</p></div>',

			//只显示楼盘
			2 : '<div class="bubble bubble-2" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${loupan_id}"><div class="bubble-wrap"><div class="bubble-inner"><p class="name" title="${resblock_name}">${resblock_name}</p>${moreTpl}</div><i class="arrow"><i class="arrow-i"></i></i></div><p class="cycle"></p></div>',

			//楼盘、价格及类型
			3 : '<div class="bubble bubble-2 bubble-3 ${clicked}" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${loupan_id}"><div class="bubble-wrap"><div class="bubble-inner"><p class="name" title="${resblock_name}">${resblock_name}</p>${moreTpl}</div><i class="arrow"><i class="arrow-i"></i></i></div><p class="cycle"></p></div>',

			//周边信息
			4 : '<div class="bubble bubble-4" data-disabled="1" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${loupan_id}"><span class="close">&times;</span><a href="${url}" target="_blank"><div class="bubble-inner clear"><p class="tle">周边信息</p><div class="around-container"><p class="around-li li-first"  data-type="超市" style="background-position: 0 -2px;">超市：<span>0</span>家</p><p class="around-li" data-type="公交" style="background-position: 0 -56px;">公交：<span>0</span>站</p><p class="around-li"  data-type="学校" style="background-position: 0 -20px;">学校：<span>0</span>所</p><p class="around-li"  data-type="银行" style="background-position: 0 -74px;">银行：<span>0</span>家</p><p class="around-li"  data-type="医院" style="background-position: 0 -38px;">医院：<span>0</span>所</p><p class="around-li li-last"  data-type="休闲" style="background-position: 0 -92px;">休闲：<span>0</span>家</p></div><i class="arrow"><i class="arrow-i"></i></i></div></a><p class="cycle"></p></div>',

			//楼盘价格
			moreTpl: '<p class="num"><span class="house-type">${house_type}</span>均价${priceTpl}<span class="gt">&gt;</span></p>'
		}

		//列表模板
		,listTemplate = {

			//楼盘列表
			building: '<dl class="fn-clear"data-id="${loupan_id}"data-lng="${longitude}"data-lat="${latitude}"title="${resblock_name}"><dt><img src="${cover_pic}"/></dt><dd><h2>${resblock_name}</h2><p>${loupan_addr}</p><p>${house_type}</p><p class="price">均价${priceTpl}</p></dd></dl>',

			//户型楼盘信息
			longpanOnly: '<a href="javascript:;"class="closehx"title="关闭户型">&times;</a><dl class="loupan fn-clear"title="${resblock_name}"><a href="${url}"target="_blank"><dt><img src="${cover_pic}"></dt><dd><h2>${resblock_name}</h2><p>${loupan_addr}</p><p>${house_type}</p><p class="price">均价${priceTpl}</p></dd></a></dl><p class="hcount">共有<strong>${hxcount}</strong>个户型</p><div class="con"><div class="hx-list">${hx}</div></div>',

			//户型列表
			hxlist: '<dl class="fn-clear"><a href="${url}"target="_blank"><dt><img src="${frame_pic}"/><span>${frame_name}</span></dt><dd><h3>${room_num} ${build_area}㎡ 朝${direction}</h3><p>${note}</p></dd></a></dl>'
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

		,isClickHx = false   //是否点击了户型
		,isNewList = false   //是否为新列表
		,loupanPage = 1      //楼盘数据当前页
		,loupanChooseData    //查看户型的楼盘数据
		,loupanpageData_;     //当前可视范围内的楼盘

	g_conf.districtData = [];
	g_conf.districtData3 = [];
	g_conf.loupanData = [];

	init.createMap();

});
