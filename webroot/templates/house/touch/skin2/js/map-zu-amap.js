$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

  var mask = $('.mask'), moreFilter = [];
  var map, list = $(".list");
  var windowHeight = $(window).height(), headHeight = $('.header').height(), tabHeight = $(".choose-tab").height(), mapHeight = windowHeight - headHeight - tabHeight;
  $('#map').height(mapHeight);

  // 右上角导航
  $('.h-menu').on('click', function() {
    if ($('.nav,.mask').css("display") == "none") {
      $('.nav,.mask').show();
    } else {
      $('.nav,.mask').hide();
    }
  })

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

			init.getSaleData();

			AMap.event.addListener(map, 'zoomend', function() {
				init.updateOverlays("zoom");
			});
			AMap.event.addListener(map, 'dragend', function() {
				init.updateOverlays("drag");
			});

			//气泡点击  区域
			$("#"+g_conf.mapWrapper).on("touchend", ".bubble-1", function() {

				var t = $(this), zoom = map.getZoom(),
				newView = {
					lng: parseFloat(t.attr("data-longitude")),
					lat: parseFloat(t.attr("data-latitude")),
					typ: zoom + 3
				};
				newView.lng && newView.lat ?  map.setZoomAndCenter((newView.typ + 1), [newView.lng, newView.lat]) : map.setZoom(newView.typ);

        //气泡点击  商圈
      }).on("touchend", ".bubble-2", function(){

  				var t = $(this),
  				newView = {
  					lng: parseFloat(t.attr("data-longitude")),
  					lat: parseFloat(t.attr("data-latitude")),
  					typ: g_conf.minZoom + 4
  				};
  				newView.lng && newView.lat ? map.centerAndZoom(new BMap.Point(newView.lng, newView.lat), newView.typ) : map.setZoom(newView.typ);

  				init.getSaleData("community");


  			//气泡点击 小区
      }).on("touchend", ".bubble-3", function(e) {

          var t = $(this).find("a"), url = t.attr("href");
          location.href = url;

  		});

      // 筛选框点击切换
      $('.choose-tab li').click(function(){
        $('body').addClass('fixed');

        var t = $(this), index = t.index(), box = $('.choose-box .choose-item').eq(index);
        if (box.css('display') == "none") {
          t.addClass('active').siblings('li').removeClass('active')
          box.show().siblings().hide();mask.show();
        }
        else {
          $('body').removeClass('fixed');
          t.removeClass('active');
          box.hide();mask.hide();
        }

      })

      //筛选框点击内容
      $('.choose-ul li').click(function(){
        var t = $(this), val = t.find('a').text(), parent = t.closest('.choose-ul'), index = parent.index()  ,ul = t.closest('.choose-ul');
        t.addClass('active').siblings('li').removeClass('active');
        $('.choose-tab li').eq(index).find('span').html(val);
        mask.hide();
        $('.choose-ul').hide();
        $('.choose-tab li').removeClass('active');
        if(!ul.hasClass("link_ul")){
		   init.confirmFilter();
		}
      })

      // 更多内容点击
      $('.choose-more-item li').click(function(){
        $(this).addClass('active').siblings('li').removeClass('active');
      })
      // 更多内容 重置
      $('.choose-more .reset').click(function(){
        $('.choose-more li').removeClass('active');
        moreFilter = [];
        init.getSaleData();
      })
      // 更多内容 确认
      $('.choose-more .confirm').click(function(){
        $('.choose-tab li').removeClass('active');
        moreFilter = [];
        $(".choose-box .choose-more-item").each(function(){
          var t = $(this);
          var type = t.attr("data-type"), val = t.find(".active a").attr("data-val"), txt = t.find(".active a").text();
          if(val != undefined){
            moreFilter.push(type+"="+val);
          }
		  if(type=='price'){
		  	 moreFilter.push(type+"="+($(".p1").val()/100+','+$(".p2").val()/100));
		  }
        });
        init.getSaleData();
        mask.hide();$('.choose-more').hide();
      })

      // 点击遮罩层
      $('.mask').on('touchstart',function(){
        mask.hide();
        $('.choose-item, .nav').hide();
        $('.choose-tab li').removeClass('active');

      })

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
		}


    //获取区域及楼盘信息
		,getSaleData: function(type){

			var visBounds = init.getBounds();
			var boundsArr = [];
			boundsArr.push('min_latitude='+visBounds['min_latitude']);
			boundsArr.push('max_latitude='+visBounds['max_latitude']);
			boundsArr.push('min_longitude='+visBounds['min_longitude']);
			boundsArr.push('max_longitude='+visBounds['max_longitude']);

			var data = boundsArr.join("&")+(g_conf.filter.length > 0 ? "&"+g_conf.filter.join("&") : "");
      data = data + (data != "" ? "&" : "") + moreFilter.join("&");

			//页面打开就请求获取区域数据
			if(!type || type == "tilesloaded" || type == ""){

				$.ajax({
					"url": g_conf.urlPath[1],
					"data": data,
					"dataType": "jsonp",
					"async": false,
					"success": function(data){

						var districtData = [];
						if(data && data.state == 100){

							var list = data.info;
							for(var i = 0; i < list.length; i++){
								districtData[i] = [];
								districtData[i]['id'] = list[i].id;
								districtData[i]['name'] = list[i].addrname;
								districtData[i]['longitude'] = list[i].longitude;
								districtData[i]['latitude'] = list[i].latitude;
								districtData[i]['house_count'] = list[i].count;
								districtData[i]['avg_unit_price'] = list[i].price;

							}

						}



						g_conf.districtData = districtData;
						init.updateOverlays(type);

					}
				});

			//type为bizcircle(商圈)时，请求商圈信息
			}else if(type == "bizcircle"){

				if(g_conf.bizcircle.length == 0){
					$.ajax({
						"url": g_conf.urlPath[2],
						"data": data,
						"dataType": "jsonp",
						"async": false,
						"success": function(data){

							var bizcircleData = [];
							if(data && data.state == 100){

								var list = data.info;
								for(var i = 0; i < list.length; i++){
									bizcircleData[i] = [];
									bizcircleData[i]['id'] = list[i].id;
									bizcircleData[i]['name'] = list[i].addrname;
									bizcircleData[i]['longitude'] = list[i].longitude;
									bizcircleData[i]['latitude'] = list[i].latitude;
									bizcircleData[i]['house_count'] = list[i].count;
									bizcircleData[i]['avg_unit_price'] = list[i].price;
								}

							}



							g_conf.bizcircle = bizcircleData;
							data = init.getVisarea(g_conf.bizcircle);
							init.createBubble(data, bubbleTemplate[2], 2);

						}
					});
				}else{
					data = init.getVisarea(g_conf.bizcircle);
					init.createBubble(data, bubbleTemplate[2], 2);
				}

			//type为community(小区)时间，请求小区信息，根据地图当前可视范围进行筛选
			}else if(type == "community"){

				$.ajax({
					"url": g_conf.urlPath[3],
					"data": data,
					"dataType": "jsonp",
					"async": false,
					"success": function(data){

						var saleData = [];
						if(data && data.state == 100){

							var list = data.info;
							for(var i = 0; i < list.length; i++){
								saleData[i] = [];
								saleData[i]['id'] = list[i].id;
								saleData[i]['name'] = list[i].title;
								saleData[i]['longitude'] = list[i].longitude;
								saleData[i]['latitude'] = list[i].latitude;
								saleData[i]['house_count'] = list[i].count;
								saleData[i]['avg_unit_price'] = list[i].price;
								saleData[i]['href'] = list[i].url;
							}

						}



						g_conf.saleData = saleData;
						data = init.getVisarea(g_conf.saleData);
						init.createBubble(data, bubbleTemplate[3], 2);

					}
				});

			}

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
		            city: g_conf.cityName
		        });
		        //返回地理编码结果
		        AMap.event.addListener(MGeocoder, "complete", init.geocoder_CallBack);
		        //地理编码
		        MGeocoder.getLocation(g_conf.cityName);
		    });
			}

			var zoom = map.getZoom(), data = [];

			//区域集合
			if(zoom - g_conf.minZoom <= 2){

				data = init.getVisarea(g_conf.districtData);
				init.createBubble(data, bubbleTemplate[1], 1);

			}else{

				//商圈集合
				if(zoom - g_conf.minZoom <= 4){

					init.getSaleData("bizcircle");

				//小区集合
				}else if(zoom - g_conf.minZoom > 4){

					init.getSaleData("community");

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

      ids = 0;

      $.each(data,	function(e, o) {
				var bubbleLabel, r = [];
				o.avg_price = (o.avg_unit_price/1).toFixed(0);

				$("#"+g_conf.mapWrapper).on("mouseover", ".amap-marker", function() {
					var t = $(this);
					this.style.zIndex = 104;
				})

				$("#"+g_conf.mapWrapper).on("mouseout", ".amap-marker", function() {
					var t = $(this);
					this.style.zIndex = 100;
				})

				bubbleLabel = init.replaceTpl(temp, o);
				marker = new AMap.Marker({
					content: bubbleLabel,
					position: [o.longitude, o.latitude]
				});
				marker.setMap(map);

				markersArr.push(marker);

        // 统计可视区域内的数量
        ids += Number(o.house_count);

			});

      $(".lcount strong").html(ids);

		}

		//删除地图气泡
		,cleanBubble: function(){
			map.remove(markersArr);
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

				var filter = [];

				//填充条件
				filterTitle = [];
				filterData = [];
				filterData['filter'] = [];

				$(".choose-box .choose-ul").each(function(i){
					var t = $(this);
					var type = t.attr("data-type"), val = t.find(".active a").attr("data-val"), txt = t.find(".active a").text();
					filterData['filter'][i-2] = [type, val];

					if(type!='' && type!='undefined' && type!=null){
						filter.push(type+"="+val);
					}

				});

        g_conf.filter = filter;
				init.getSaleData();

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
			1 : '<div class="bubble bubble-1" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${id}"><p class="name" title="${name}区">${name}区</p><p class="num">${avg_price}'+echoCurrency('short')+'/月</p><p><span class="count">${house_count}</span>套</p></div>',

			//区域
			2 : '<div class="bubble bubble-1 bubble-2" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${id}"><p class="name" title="${name}区">${name}区</p><p class="num">${avg_price}'+echoCurrency('short')+'/月</p><p><span class="count">${house_count}</span>套</p></div>',

			//小区
			3 : '<p class="bubble-3 bubble" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${id}"><i class="num">${house_count}套</i><span class="name"><i class="name-des"><a href="${href}" target="_blank">${name}</a></i></span><i class="arrow-up"><i class="arrow"></i><i></p>'

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
		,loupanPageData;     //当前可视范围内的楼盘

  g_conf.districtData = [];
  g_conf.bizcircle = [];
  g_conf.saleData = [];

	init.createMap();

});
