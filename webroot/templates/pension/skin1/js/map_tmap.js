$(function(){



	var map, filterData, list = $(".yl_list"), init = {

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

            map = new T.Map(g_conf.mapWrapper, {enableMapClick: false, minZoom: g_conf.minZoom});

            var myGeo = new T.Geocoder();
            myGeo.getPoint(g_conf.cityName, function (address) {
                //如果解析成功
                if (address) {

                    map.centerAndZoom(new T.LngLat(address.location.lon, address.location.lat), g_conf.minZoom);
                    init.tilesloaded(); //地图加载完毕执行

                }
            }, g_conf.cityName);

		}

		//地图加载完毕添加地图比例尺控件/自定义缩放/收起/展开侧栏
		,tilesloaded: function(){

			//自定义缩放
			$(".zoom-ctrl span").on("click", function(){
				$(this).hasClass("zoom-plus") ? map.zoomIn() : map.zoomOut();
			});

			//收起/展开侧栏
			$(".map-os").bind("click", function(){
				var t = $(this), sidebar = $(".sidebar");
				t.hasClass("open") ? (sidebar.stop().animate({"left": 0}, 150), t.attr("title", "收起左栏"), t.removeClass("open"), $("#"+g_conf.mapWrapper).animate({"left": "325px"}, 150)) : (sidebar.stop().animate({"left": "-324px"}, 150), t.attr("title", "展开左栏"), t.addClass("open"), $("#"+g_conf.mapWrapper).animate({"left": "0"}, 150));
			});

			//加载区域和类型
			init.sortby();
			init.placeby();


			//初始加载
			init.getLoupanData("tilesloaded");


			map.addEventListener("zoomend", function() {
				init.updateOverlays("zoom");
			});
			map.addEventListener("dragend", function() {
				init.updateOverlays("drag");
			});


			//气泡点击  区域
			$("#"+g_conf.mapWrapper).on("click", ".bubble-1", function() {

				var t = $(this), zoom = map.getZoom(),
				newView = {
					lng: parseFloat(t.attr("data-longitude")),
					lat: parseFloat(t.attr("data-latitude")),
					//typ: zoom + 1
					typ: 15
				};
				newView.lng && newView.lat ? map.centerAndZoom(new T.LngLat(newView.lng, newView.lat), newView.typ) : map.setZoom(newView.typ);


			})



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
						init.getLoupanPageList(loupanPageData);
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

			var data = "&catid="+g_conf.orderby+"&addrid="+g_conf.placeby;

			$.ajax({
				"url": "/include/ajax.php?service=pension&action=storeDistrict",
				"data": data,
				"dataType": "JSON",
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


			$.ajax({
				"url":"/include/ajax.php?service=pension&action=storeList&pageSize=99999",
				"data": data,
				"dataType": "JSON",
				"async": false,
				"success": function(data){

					var loupanData = [];
					if(data && data.state == 100){

						var list = data.info.list;
						for(var i = 0; i < list.length; i++){
							loupanData[i] = [];
							loupanData[i]['id'] = list[i].id;
							loupanData[i]['longitude'] = list[i].lng;
							loupanData[i]['latitude'] = list[i].lat;
							loupanData[i]['resblock_name'] = list[i].title;
							loupanData[i]['loupan_addr'] = list[i].address;
							loupanData[i]['ptype'] = list[i].ptype;
							loupanData[i]['average_price'] = list[i].price;
							loupanData[i]['cover_pic'] = list[i].litpic;
							loupanData[i]['store_tel'] = list[i].tel;
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

		//更新地图状态
		,updateOverlays: function(type){

			//如果是点击的楼盘列表，则不更新地图
			if(isClickHx) return false;

			var zoom = map.getZoom(), data = [];
			//区域集合
			if(zoom - g_conf.minZoom <= 2){

				data = init.getVisarea(g_conf.districtData);
				init.createBubble(data, bubbleTemplate[1], 1);

			}else{

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

					o.priceTpl = '<span class="price">' + o.average_price ? (o.average_price + '</span>') : "价格待定</span>";
					o.moreTpl = init.replaceTpl(more, o);

				}

                bubbleLabel = new T.Label({
                    text: init.replaceTpl(temp, o),
                    position: new T.LngLat(o.longitude, o.latitude),
                    offset: bubbleMapSize[resize]()
                });

				bubbleLabel.addEventListener("mouseover", function() {
					this.setZindex(4);
				});

				bubbleLabel.addEventListener("mouseout", function() {
					this.setZindex(2);
				});

                bubbleLabel.setFontColor(bubbleStyle.color);
                bubbleLabel.setBorderLine(bubbleStyle.borderWidth);
                bubbleLabel.setBackgroundColor(bubbleStyle.backgroundColor);

				map.addOverLay(bubbleLabel);

			});

			//区域集合时统计数据为楼盘的数量
			data = resize == 1 ? init.getVisarea(g_conf.loupanData) : data;

			init.mosaicLoupanList(data);

		}

		//删除地图气泡
		,cleanBubble: function(){
			map.clearOverLays();
		}


		//拼接楼盘列表
		,mosaicLoupanList: function(data){

			//如果是点击的楼盘列表，则不更新楼盘列表内容
			if(isClickHx) return false;

			//可视区域内楼盘数量
			$(".lcount strong").html(data.length);

			if(data.length == 0){
				$(".loupan-list").html('<p class="empty">很抱歉，没有找到合适的养老机构，请重新查找</p>');
				return;
			}

			isNewList = true;
			loupanPage = 1;

			init.getLoupanPageList(data);

			//鼠标经过
			list.delegate("dl", "mouseover", function(){

				var t = $(this), id = t.attr("data-id");
				if(id){
					var bubble = $(".bubble[data-id='" + id + "']");
					bubble.parent().css({zIndex: 4});
					bubble.addClass("hover");
				}

			});
			list.delegate("dl", "mouseout", function(){

				var t = $(this), id = t.attr("data-id");
				if(id){
					var bubble = $(".bubble[data-id='" + id + "']");
					bubble.parent().css({zIndex: 2});
					bubble.removeClass("hover");
				}

			});

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
					d.priceTpl = d.average_price ? '<strong>'+d.average_price+'</strong>起' : '<strong>价格待定</strong>';
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

		//加载区域
		,placeby: function(){


			//显示区域
			$(".placeby_li").hover(function(){
				var t = $(this);
				t.addClass("on");
				t.find(".placeby").show();
			}, function(){
				var t = $(this);
				t.removeClass("on");
				t.find(".placeby").hide();
			});

			// 区域二级

	        $('#choose-area li').click(function(){
	            var t = $(this), index = t.index(), id = t.attr("data-id"), localIndex = t.closest('.choose-item').index();
	            if (index == 0) {
	                $('#area-box .choose-stage-l').removeClass('choose-stage-l-short');
	                t.addClass('on').siblings().removeClass('on');
	                t.closest('.choose-item').hide();
	                $('.placeby_li').find('span').text("不限");
                    $('.placeby_li').addClass("curr");
                    g_conf.placeby = 0;
                    init.getLoupanData();
                   $('.choose-stage-r').hide();

	            }else{
	                t.siblings().removeClass('on');
	                t.addClass('on').siblings().removeClass('on');
	                $('#area-box .choose-stage-l').addClass('choose-stage-l-short');
	                $('.choose-stage-r').show();


	                $.ajax({
	                    url: masterDomain + "/include/ajax.php?service=pension&action=addr&type="+id,
	                    type: "GET",
	                    dataType: "jsonp",
	                    success: function (data) {
	                        if(data && data.state == 100){
	                            var html = [], list = data.info;
	                            html.push('<li data-id="'+id+'">不限</li>');//不限
	                            for (var i = 0; i < list.length; i++) {
	                                html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
	                            }
	                            $("#choose-area-second").html('<ul>'+html.join("")+'</ul>');
	                        }else if(data.state == 102){
	                            $("#choose-area-second").html('<ul><li data-id="'+id+'">不限</li></ul>');//不限
	                        }else{
	                            $("#choose-area-second").html('<ul><li class="load">'+data.info+'</li></ul>');
	                        }
	                    },
	                    error: function(){
	                        //网络错误，加载失败！
	                        $("#choose-area-second").html('<ul><li class="load">网络错误，加载失败！</li></ul>');
	                    }
	                });
	            }
	        })
	        //二级地址选择
	        $('#choose-area-second').delegate("li", "click", function(){
	              var $t = $(this), id = $t.attr("data-id"), val = $t.html(), local = $t.closest('.choose-item'), index = local.index();
	              var addrid;var parent = $(".placeby").parent()
	              //$t.addClass('on').siblings().removeClass('on');
                  $t.addClass("on").parent().siblings("li").removeClass("on");
                   parent.removeClass("on");
                  parent.addClass("curr");
	              $('.placeby_li').find('span').text(val);
             
	              local.hide();

	             g_conf.placeby = id;

				init.getLoupanData();

	        })


		}
		//加载类型
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

			//显示类型
			$(".orderby_li").hover(function(){
				var t = $(this);
				t.addClass("on");
				t.find(".orderby").show();
			}, function(){
				var t = $(this);
				t.removeClass("on");
				t.find(".orderby").hide();
			});

			//类型选中
			orderby.delegate("a", "click", function(){
				var parent = orderby.parent(), t = $(this);
				t.addClass("on").parent().siblings("li").find("a").removeClass("on");
				parent.removeClass("on");
				orderby.hide();
				var text = t.text(), val = t.attr('data-val');
				parent.addClass("curr");
				parent.find("span").html(text);
				g_conf.orderby = val;

				init.getLoupanData();

			});

		}


	}


	//气泡偏移
	var bubbleMapSize = {
			1 : function() {
				return new T.Point(-46, -46)
			},
			2 : function() {
				return new T.Point(-15, 20)
			},
			3 : function() {
				return new T.Point(-1, 10)
			},
			4 : function() {
				return new T.Point(-15, 20)
			}
		}

		//气泡模板
		,bubbleTemplate = {

			//区域
			1 : '<div style="text-align: center;" class="bubble bubble-1" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${id}"><p class="name" title="${district_name}区">${district_name}区</p><p><span class="count">${count}</span>个养老</p></div>',

			//只显示楼盘
			2 : '<div class="bubble bubble-2" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${id}"><div class="bubble-wrap"><div class="bubble-inner"><p class="name" title="${resblock_name}">${resblock_name}</p>${moreTpl}</div><i class="arrow"><i class="arrow-i"></i></i></div><p class="cycle"></p></div>',

			//养老二级 内容
			3 : '<div class="bubble bubble-2 bubble-3 fn-clear" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${id}"><div class="bubble-wrap"><div class="bubble-inner">${moreTpl}</div><i class="arrow"><i class="arrow-i"></i></i></div><p class="cycle"></p></div>',

			//周边信息
			4 : '<div class="bubble bubble-4"data-disabled="1"data-longitude="${longitude}"data-latitude="${latitude}"data-id="${id}"><span class="close">&times;</span><a href="${url}"target="_blank"><div class="bubble-inner clear"><p class="tle">周边信息</p><i class="arrow"><i class="arrow-i"></i></i></div></a><p class="cycle"></p></div>',

			//养老二级 内容
			moreTpl: '<div class="num fn-clear"><div class="map_img2"><a href="${url}"target="_blank"><img onerror="this.src=\'/static/images/404.jpg\'" src="${cover_pic}"/></a></div><div class="map2_con"><p class="map2_tit"><a href="${url}"target="_blank">${resblock_name}</a></p><p class="map2_info">${loupan_addr}</p><p class="price">'+echoCurrency('symbol')+'<strong>${priceTpl}</strong>起</p></div></div>'
		}

		//列表模板
		,listTemplate = {

			//养老列表1 最开始左侧边栏
			building: '<dl class="fn-clear"data-id="${id}"data-lng="${longitude}"data-lat="${latitude}"title="${resblock_name}"><dt><a href="${url}"target="_blank"><img onerror="this.src=\'/static/images/404.jpg\'" src="${cover_pic}"/></a></dt><dd><h2><a href="${url}"target="_blank">${resblock_name}</a></h2><p>${loupan_addr}</p><p>${store_tel}</p><p class="price">'+echoCurrency('symbol')+'${priceTpl}</p></dd></dl>',
			
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
	g_conf.loupanData = [];

	init.createMap();


});
