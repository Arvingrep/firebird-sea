$(function(){

	//文本框placeholder
	$("html input").placeholder();

	var map, filterData, isload, markersArr = [], list = $(".list"), init = {

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

			init.getLoupanData();

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

			$.ajax({
				"url": masterDomain+"/include/ajax.php?service=house&action=loupanList&pageSize=9999999",
				"data": data,
				"dataType": "JSONP",
				"async": false,
				"success": function(data){

					var loupanData = [];
					if(data && data.state == 100){

						var infoWindow = new qq.maps.InfoWindow({
					      map: map
					  });

						var list = data.info.list;
						for(var i = 0; i < list.length; i++){
							(function(n){
							loupanData[i] = [];
							loupanData[i]['loupan_id'] = list[i].id;
							loupanData[i]['longitude'] = list[i].longitudelongitude;
							loupanData[i]['latitude'] = list[i].latitude;
							loupanData[i]['resblock_name'] = list[i].title;
							loupanData[i]['loupan_addr'] = list[i].address;
							loupanData[i]['ptype'] = list[i].ptype;
							loupanData[i]['average_price'] = list[i].price;
							loupanData[i]['cover_pic'] = list[i].litpic;
							loupanData[i]['house_type'] = list[i].protype;
							loupanData[i]['url'] = list[i].url;

							var center = new qq.maps.LatLng(list[n].latitude, list[n].longitude);
							marker = new qq.maps.Marker({
								map: map,
								position: center,
								title: list[i].title,
								address: list[i].address,
								ptype: list[i].ptype,
								house_type: list[i].protype,
								average_price: list[i].price,
								url: list[i].url
							});

							markersArr.push(marker);

							qq.maps.event.addListener(marker, 'click', function() {
								var infowincontent = '<div style="font-weight: 700; line-height: 2.5em; font-size: 16px;">' + this.title + '&nbsp;&nbsp;<a style="font-size: 12px; color: #de1e30; font-weight: 500;" href="' + this.url + '" target="_blank">详细>></a></div>';
								infowincontent += '<p style="line-height: 1.8em;">类型：' + this.house_type + '&nbsp;&nbsp;&nbsp;&nbsp;均价：';
								infowincontent += this.average_price ? (this.average_price + '</span>' + (this.ptype == 1 ? echoCurrency('short')+'/'+echoCurrency('areasymbol') : ('万'+echoCurrency('short')+'/套'))) : '价格待定</p>';
								infowincontent += '<p style="line-height: 1.8em;">详细地址：' + this.address + '</p>';
								infoWindow.setContent(infowincontent);
								infoWindow.open(map, this);
								infoWindow.setPosition(center);
							});

							})(i);

						}

					}

					g_conf.loupanData = loupanData;
					init.mosaicLoupanList(loupanData);

				}
			});

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
					d.priceTpl = d.average_price ? '<strong>'+d.average_price+'</strong>'+(d.ptype == 1 ? ''+echoCurrency('short')+'/'+echoCurrency('areasymbol') : '万'+echoCurrency('short')+'/套') : '<strong>价格待定</strong>';
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


		//列表模板
		var listTemplate = {

			//楼盘列表
			building: '<a href="${url}" target="_blank"><dl class="fn-clear"data-id="${loupan_id}"data-lng="${longitude}"data-lat="${latitude}"title="${resblock_name}"><dt><img src="${cover_pic}"/></dt><dd><h2>${resblock_name}</h2><p>${loupan_addr}</p><p>${house_type}</p><p class="price">均价${priceTpl}</p></dd></dl></a>',

			//户型楼盘信息
			longpanOnly: '<a href="javascript:;"class="closehx"title="关闭户型">&times;</a><dl class="loupan fn-clear"title="${resblock_name}"><a href="${url}"target="_blank"><dt><img src="${cover_pic}"></dt><dd><h2>${resblock_name}</h2><p>${loupan_addr}</p><p>${house_type}</p><p class="price">均价${priceTpl}</p></dd></a></dl><p class="hcount">共有<strong>${hxcount}</strong>个户型</p><div class="con"><div class="hx-list">${hx}</div></div>',

			//户型列表
			hxlist: '<dl class="fn-clear"><a href="${url}"target="_blank"><dt><img src="${frame_pic}"/><span>${frame_name}</span></dt><dd><h3>${room_num} ${build_area}'+echoCurrency('areasymbol')+' 朝${direction}</h3><p>${note}</p></dd></a></dl>'
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
