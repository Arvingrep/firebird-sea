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

			init.getLoupanData();

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
					typ: zoom + 1
				};
				newView.lng && newView.lat ?  map.setZoomAndCenter((newView.typ), [newView.lng, newView.lat]) : map.setZoom(newView.typ);

			//户型
			}).on("touchend", ".bubble-2 .bubble-inner", function(){

        var t = $(this).find("a"), url = t.attr("href");
        location.href = url;


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


			//关闭户型信息
			$(".hxlist").delegate(".closehx", "click", function(){
				init.closeHx();
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
        var t = $(this), val = t.find('a').text(), parent = t.closest('.choose-ul'), index = parent.index(),ul = t.closest('.choose-ul');
        t.addClass('active').siblings('li').removeClass('active');
        t.find('a').addClass('on');
        t.siblings('li').find('a').removeClass('on');
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
        init.getLoupanData();
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
		  	 moreFilter.push(type+"="+($(".p1").val()*10+','+$(".p2").val()*10));
		  }
        });
        init.getLoupanData();
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
		,getLoupanData: function(type){

      var data = g_conf.filter.length > 0 ? "&"+g_conf.filter.join("&") : "";
      data = data + (data != "" ? "&" : "") + moreFilter.join("&");

			$.ajax({
				"url": masterDomain+"/include/ajax.php?service=house&action=loupanDistrict",
				"data": data,
				"dataType": "jsonp",
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
				"dataType": "jsonp",
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
				"dataType": "jsonp",
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
				"dataType": "jsonp",
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

			loupanPageData = data;

			var index = loupanPage * 10;
			var allPage = Math.ceil(loupanPageData.length/10);
			var prevIndex = (loupanPage - 1) * 10;

			//到达最后一页中止
			if(loupanPage > allPage){
				loupanPage--;
				return;
			}

			var loupanList = [];
			var newData = loupanPageData.slice(prevIndex, prevIndex + 10);
			$.each(newData, function(i, d){
					d.priceTpl = d.average_price ? '<strong>'+d.average_price+'</strong>'+(d.ptype == 1 ? ''+echoCurrency('short')+'/m²' : '万'+echoCurrency('short')+'/套') : '<strong>价格待定</strong>';
			});


			if(isNewList){
				$(".loupan-list").html(loupanList.join(""));
			}else{
				$(".loupan-list").append(loupanList.join(""));
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
					init.createBubble(data, bubbleTemplate[2], 2, bubbleTemplate.moreTpl);

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

      //物业、装修、价格
      $(".choose-box .choose-ul").each(function(){
        var t = $(this);
        var type = t.attr("data-type"), val = t.find(".on").attr("data-val"), txt = t.find(".on").text();

        if(type!='' && type!='undefined' && type!=null){
        	filter.push(type+"="+val);
        }
      });

      g_conf.filter = filter;
      init.getLoupanData();

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


      //楼盘、价格及类型
      2 : '<div class="bubble bubble-2 bubble-3" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${loupan_id}"><div class="bubble-wrap"><div class="bubble-inner"><a href="${url}" target="_blank"><p class="name" title="${resblock_name}">${resblock_name}</p>${moreTpl}</a></div><i class="arrow"><i class="arrow-i"></i></i></div><p class="cycle"></p></div>',

      //楼盘价格
      moreTpl: '<p class="num"><span class="house-type">${house_type}</span>均价${priceTpl}<span class="gt">&gt;</span></p>'

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
	g_conf.districtData3 = [];
	g_conf.loupanData = [];

	init.createMap();

});
