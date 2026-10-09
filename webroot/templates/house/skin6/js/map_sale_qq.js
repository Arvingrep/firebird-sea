$(function(){

	//文本框placeholder
	$("html input").placeholder();

	var map, filterData, isload, markersArr = [], list = $(".list"), ids = 0, init = {

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
				zoom: 11,
				center: new qq.maps.LatLng(39.916527,116.397128),
				minZoom: 11,
				zoomControl: true,
				zoomControlOptions: {
					style: qq.maps.ZoomControlStyle.SMALL,
					position: qq.maps.ControlPosition.RIGHT_BOTTOM
				},
				panControlOptions: {
					position: qq.maps.ControlPosition.RIGHT_BOTTOM
				}
			};

			map = new qq.maps.Map(document.getElementById("map"), mapOptions);

			function initialize() {

				//如果经、纬度都为0则设置城市名为中心点
				if(g_conf.cityName != ""){
					var address = g_conf.cityName;
					var geocoder = new qq.maps.Geocoder({
						complete : function(result){
							var location = result.detail.location;
							map.setCenter(location);
							mapOptions.center = new qq.maps.LatLng(location.lat, location.lng);
						}
					});
					geocoder.getLocation(address);

				//如果城市为空，则定位当前城市
				}else{
					var citylocation = new qq.maps.CityService({
						complete : function(result){
							var location = result.detail.latLng;
							map.setCenter(location);
							mapOptions.center = new qq.maps.LatLng(location.lat, location.lng);
							setMark();
						}
					});
					citylocation.searchLocalCity();
				}

			}

			initialize();

      qq.maps.event.addListener(map, 'tilesloaded', init.tilesloaded);   //地图加载完毕执行

    }

		//地图加载完毕添加地图比例尺控件/自定义缩放/收起/展开侧栏
		,tilesloaded: function(){

      if(isload) return;
      isload = true;

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

			init.getSaleData();

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
    ,getSaleData: function(type){

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

      var data = boundsArr.join("&")+"&keywords="+encodeURIComponent(g_conf.keywords)+(g_conf.filter.length > 0 ? "&"+g_conf.filter.join("&") : "")+"&orderby="+g_conf.orderby;

      $.ajax({
        "url": g_conf.urlPath[3],
        "data": data,
        "dataType": "JSONP",
        "async": false,
        "success": function(data){

          var saleData = [];
          if(data && data.state == 100){

            var list = data.info;

						var infoWindow = new qq.maps.InfoWindow({
					      map: map
					  });

            for(var i = 0; i < list.length; i++){
              (function(n){
                saleData[i] = [];
                saleData[i]['id'] = list[i].id;
                saleData[i]['name'] = list[i].title;
                saleData[i]['longitude'] = list[i].longitude;
                saleData[i]['latitude'] = list[i].latitude;
                saleData[i]['house_count'] = list[i].count;
                saleData[i]['min_price_total'] = list[i].price;
                saleData[i]['avg_unit_price'] = list[i].unitprice;
                saleData[i]['href'] = list[i].url;

                var center = new qq.maps.LatLng(list[n].latitude, list[n].longitude);
  							marker = new qq.maps.Marker({
  								map: map,
  								position: center,
                  title: list[i].title,
  								house_count: list[i].count,
  								min_price_total: list[i].price,
  								avg_unit_price: list[i].unitprice,
  								url: list[i].url
  							});

                markersArr.push(marker);

                qq.maps.event.addListener(marker, 'click', function() {
                  var infowincontent = '<div style="font-weight: 700; line-height: 2.5em; font-size: 16px;">' + this.title + '&nbsp;&nbsp;<a style="font-size: 12px; color: #de1e30; font-weight: 500;" href="' + this.url + '" target="_blank">详细>></a></div>';
                  infowincontent += '<p style="line-height: 1.8em;">均价：' + this.min_price_total + '万' + echoCurrency('short') + '&nbsp;&nbsp;&nbsp;&nbsp;单价：' + this.avg_unit_price + echoCurrency('short') + '/'+echoCurrency('areasymbol')+'</p>';
                  infowincontent += '<p style="line-height: 1.8em;">房源数量：' + this.house_count + '套</p>';
                  infoWindow.setContent(infowincontent);
                  infoWindow.open(map, this);
  								infoWindow.setPosition(center);
                });
              })(i);

            }

          }

          init.mosaicSaleList();

        }
      });

    }


		//拼接楼盘列表
		,mosaicSaleList: function(data){

      isNewList = true;
			salePage = 1;

			init.getSalePageList();

		}


    //获取指定分页的房源列表
		,getSalePageList: function(){


			if(isNewList){
				$(".sale-list").html('<p class="loading">加载中...</p>');
			}else{
				$(".sale-list").append('<p class="loading-min">加载中...</p>');
			}
			list.mCustomScrollbar("update");

			var visBounds = init.getBounds();
			var boundsArr = [];
			boundsArr.push('min_latitude='+visBounds['min_latitude']);
			boundsArr.push('max_latitude='+visBounds['max_latitude']);
			boundsArr.push('min_longitude='+visBounds['min_longitude']);
			boundsArr.push('max_longitude='+visBounds['max_longitude']);

			var data = boundsArr.join("&")+"&keywords="+encodeURIComponent(g_conf.keywords)+(g_conf.filter.length > 0 ? "&"+g_conf.filter.join("&") : "")+"&orderby="+g_conf.orderby+"&community="+ids+"&page="+salePage+"&pageSize=10";
			var total_count = 0, datalist = [];

			$.ajax({
				"url": g_conf.urlPath[5],
				"data": data,
				"dataType": "JSONP",
				"async": false,
				"success": function(data){
					var saleData = [];
					if(data && data.state == 100){
						total_count = data.info.pageInfo.totalCount;
						var _list = data.info.list;
						for(var i = 0; i < _list.length; i++){
							datalist[i] = [];
							datalist[i]['id'] = _list[i].id;
							datalist[i]['title'] = _list[i].title;
							datalist[i]['frame_room'] = _list[i].room;
							datalist[i]['frame_orientation'] = _list[i].direction;
							datalist[i]['house_area'] = _list[i].area;
							datalist[i]['price_total'] = _list[i].price;
							datalist[i]['tags'] = _list[i].flags;
							datalist[i]['list_picture_url'] = _list[i].litpic;
							datalist[i]['community_id'] = _list[i].communityid;
							datalist[i]['community_name'] = _list[i].community;
							datalist[i]['href'] = _list[i].url;
							datalist[i]['house_picture_count'] = _list[i].imgCount;
						}

						var index = salePage * 10;
						var allPage = Math.ceil(total_count/10);
						var prevIndex = (salePage - 1) * 10;

						$(".sale-list .loading, .sale-list .loading-min").remove();
						list.mCustomScrollbar("update");

						//可视区域内房源数量
						$(".lcount strong").html(total_count);

						if(total_count == 0){
							$(".sale-list").html('<p class="empty">很抱歉，没有找到合适的房源，请重新查找</p>');
							list.mCustomScrollbar("update");
							return;
						}

						//到达最后一页中止
						if(salePage > allPage){
							salePage--;
							return;
						}

						var saleList = [];
						$.each(datalist, function(i, d){

							//标签
							var tags = [];
							$.each(d.tags, function(index, tag){
								if(index < 3){
									tags.push('<span class="tag'+index+'">'+tag+'</span>');
								}
							});
							d.tagsContent = tags.join("");

							saleList.push(init.replaceTpl(listTemplate.roomlist, d));
						});


						if(isNewList){
							list.mCustomScrollbar("scrollTo","top");
							$(".sale-list").html(saleList.join(""));
						}else{
							$(".sale-list").append(saleList.join(""));
						}

						list.mCustomScrollbar("update");

					//没有数据
					}else{
						$(".lcount strong").html(0);
						$(".sale-list").html('<p class="empty">很抱歉，没有找到合适的房源，请重新查找</p>');
						list.mCustomScrollbar("update");
					}
				}
			});


		}


		//获取地图可视区域范围
		,getBounds: function(){
			var e = map.getBounds(),
			t = e.getSouthWest(),
			a = e.getNorthEast();
			return {
				min_longitude: t.getLng(),
				max_longitude: a.getLng(),
				min_latitude: t.getLat(),
				max_latitude: a.getLat()
			}
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
					init.getSaleData();
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
				init.getSaleData();
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
			$(".filter-clean").before(filterHtml);

			//售价滑块
			$("#sjObj").slider({
				range: true,
				step: 10,
				min: g_conf.sjMin,
				max: g_conf.sjMax,
				values: [g_conf.sjMin, g_conf.sjMax],
				slide: function(event, ui) {
					init.setSjRange(ui.values);
				}
			});
			init.setSjRange([g_conf.sjMin, g_conf.sjMax]);

			//面积滑块
			$("#mjObj").slider({
				range: true,
				step: 10,
				min: g_conf.mjMin,
				max: g_conf.mjMax,
				values: [g_conf.mjMin, g_conf.mjMax],
				slide: function(event, ui) {
					init.setMjRange(ui.values);
				}
			});
			init.setMjRange([g_conf.mjMin, g_conf.mjMax]);


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

		//设置售价范围
		,setSjRange: function(val){
			var minTxt = maxTxt = "万", min = val[0], max = val[1];

			$("#sjObj").slider({values: [min, max]});

			minTxt = min == g_conf.sjMin ? "" : minTxt;
			maxTxt = max == 0 ? "" : (max == g_conf.sjMax ? maxTxt + "以上" : maxTxt);
			$("#sjTxt").text(min + minTxt + " - " + max + maxTxt);
		}

		//设置面积范围
		,setMjRange: function(val){
			var minTxt = maxTxt = echoCurrency('areaname'), min = val[0], max = val[1];

			$("#mjObj").slider({values: [min, max]});

			minTxt = min == g_conf.mjMin ? "" : minTxt;
			maxTxt = max == 0 ? "" : (max == g_conf.mjMax ? maxTxt + "以上" : maxTxt);
			$("#mjTxt").text(min + minTxt + " - " + max + maxTxt);
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

				init.setSjRange([g_conf.sjMin, g_conf.sjMax]);
				init.setMjRange([g_conf.mjMin, g_conf.mjMax]);
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

				var sjMin = $("#sjObj").slider("values", 0), sjMax = $("#sjObj").slider("values", 1);
				if(sjMin != 0 || sjMax != g_conf.sjMax){
					filterTitle.push(sjMin + "-" + sjMax + "万");
				}
				filterData['price'] = [sjMin, sjMax];
				if(sjMin != 0 || sjMax != g_conf.sjMax){
					filter.push('price'+"="+(sjMin == 0 ? 0 : sjMin)+","+(sjMax == g_conf.sjMax ? "": sjMax));
				}

				var mjMin = $("#mjObj").slider("values", 0), mjMax = $("#mjObj").slider("values", 1);
				if(mjMin != 0 || mjMax != g_conf.mjMax){
					filterTitle.push(mjMin + "-" + mjMax + echoCurrency('areaname'));
				}
				filterData['area'] = [mjMin, mjMax];
				if(mjMin != 0 || mjMax != g_conf.mjMax){
					filter.push('area'+"="+(mjMin == 0 ? 0 : mjMin)+","+(mjMax == g_conf.mjMax ? "": mjMax));
				}
				//filter.push('area'+"="+mjMin+","+mjMax);

				$(".filter dl").each(function(i){
					var t = $(this);
					if(!t.hasClass("sj") && !t.hasClass("mj")){
						var type = t.attr("data-type"), val = t.find(".on").attr("data-val"), txt = t.find(".on").text();
						filterData['filter'][i-2] = [type, val];

						filter.push(type+"="+val);

						if(txt != "不限" && val != 0){
							filterTitle.push(txt);
						}
					}
				});

				//筛选条件title
				var obj = $(".f-o li:eq(0)");
				if(filterTitle.length > 0){
					obj.addClass("curr").find("span").html(filterTitle.join("/")).attr("title", filterTitle.join("/"));
				}else{
					obj.removeClass("curr").find("span").html("筛选条件").attr("title", "筛选条件");
				}

				g_conf.filter = filter;
				obj.click();

				init.getSaleData();

			});

		}

		//取消筛选
		,cancelFilter: function(){

			$(".filter-cancel").bind("click", function(){

				//填充最后一次的筛选条件
				if(filterData != undefined){

					var i = 0, filter = filterData['filter'], price = filterData['price'], area = filterData['area'];
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

					init.setSjRange([price[0], price[1]]);
					init.setMjRange([area[0], area[1]]);

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

				init.getSaleData();

			});

		}

	}


		//列表模板
		var listTemplate = {

      //二手房列表
			roomlist: '<div class="list-item"><a href="${href}" target="_blank" title="${title}" data-community="${community_id}"><div class="item-aside"><img src="${list_picture_url}"><div class="item-btm"><span class="item-img-icon"><i class="i-icon-arrow"></i><i class="i-icon-dot"></i></span><span>${house_picture_count}</span></div></div><div class="item-main"><p class="item-tle">${title}</p><p class="item-des"><span>${frame_room}</span><span data-origin="${house_area}">${house_area}'+echoCurrency('areasymbol')+'</span><span>朝${frame_orientation}</span><span class="item-side">${price_total}<span>万</span></span></p><p class="item-community"><span class="item-exact-com">${community_name}</span></p><p class="item-tag-wrap">${tagsContent}</p></div></a></div>'

		}

		,isClickHx = false   //是否点击了户型
		,isNewList = false   //是否为新列表
		,loupanPage = 1      //楼盘数据当前页
		,loupanChooseData    //查看户型的楼盘数据
		,loupanpageData_;     //当前可视范围内的楼盘

	g_conf.districtData = [];
	g_conf.loupanData = [];

	init.createMap();

});
