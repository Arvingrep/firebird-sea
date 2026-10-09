$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

  var mask = $('.mask'), markersArr = [], moreFilter = [];
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


	var init = {

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

			var geocoder = new google.maps.Geocoder();
			geocoder.geocode({'address': g_conf.cityName}, function(results, status) {
				//如果解析成功，则重置经、纬度
				if(status == google.maps.GeocoderStatus.OK) {

					var location = results[0].geometry.location;

					map = new google.maps.Map(document.getElementById('map'), {
						zoom: 14,
						center: new google.maps.LatLng(location.lat(), location.lng()),
						zoomControl: true,
						mapTypeControl: false,
						streetViewControl: false
					});

					infoWindow = new google.maps.InfoWindow;
					google.maps.event.addListener(map, "tilesloaded", init.tilesloaded); //地图加载完毕执行
					google.maps.event.addListener(map, "dragend", init.getSaleData); //地图加载完毕执行

				}
			});

		}

		//地图加载完毕添加地图比例尺控件/自定义缩放/收起/展开侧栏
		,tilesloaded: function(){

			//初始加载
			init.getSaleData();

			init.updateLoupanListDiv();
			$(window).resize(function(){
				init.updateLoupanListDiv();
			});

    // 筛选框点击切换
    $('.choose-tab li').click(function(){
      $('body').addClass('fixed');

      var t = $(this), index = t.index(), box = $('.choose-box .choose-item').eq(index);
      if (box.css('display') == "none") {
        t.addClass('active').siblings('li').removeClass('active')
        box.show().siblings().hide();mask.show();

        if(t.hasClass('tab-more')){
          $('.reset, .confirm').show();
        }
      }
      else {
        $('body').removeClass('fixed');
        t.removeClass('active');
        box.hide();mask.hide();

        if(t.hasClass('tab-more')){
          $('.reset, .confirm').hide();
        }
      }

    })

    //筛选框点击内容
    $('.choose-ul li').click(function(){
      var t = $(this), val = t.find('a').text(), parent = t.closest('.choose-ul'), index = parent.index() ,ul = t.closest('.choose-ul');
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
    $('.reset').click(function(){
      $('.choose-more li').removeClass('active');
      moreFilter = [];
      init.getSaleData();
    })
    // 更多内容 确认
    $('.confirm').click(function(){
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
      init.getSaleData();
      mask.hide();$('.choose-more').hide();

      $('.reset, .confirm').hide();
    })

    // 点击遮罩层
    $('.mask').on('touchstart',function(){
      mask.hide();
      $('.choose-item, .nav').hide();
      $('.choose-tab li').removeClass('active');
      $('.reset, .confirm').hide();

    })


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

			var data = boundsArr.join("&")+(g_conf.filter.length > 0 ? "&"+g_conf.filter.join("&") : "");
            data = data + (data != "" ? "&" : "") + moreFilter.join("&");

			$.ajax({
				"url": g_conf.urlPath[3],
				"data": data,
				"dataType": "jsonp",
				"async": false,
				"success": function(data){

					var saleData = [];
					if(data && data.state == 100){

						var list = data.info, totalCount = 0;
						for(var i = 0; i < list.length; i++){
							saleData[i] = [];
							saleData[i]['id'] = list[i].id;
							saleData[i]['name'] = list[i].title;
							saleData[i]['longitude'] = list[i].longitude;
							saleData[i]['latitude'] = list[i].latitude;
							saleData[i]['house_count'] = list[i].count;
							saleData[i]['min_price_total'] = list[i].price;
							saleData[i]['avg_unit_price'] = list[i].unitprice;
							saleData[i]['href'] = list[i].url;

                            totalCount += parseInt(list[i].count);

							var poi = new google.maps.LatLng(parseFloat(list[i].latitude), parseFloat(list[i].longitude));
							var marker = new google.maps.Marker({
								position: poi,
								map: map,
								title: list[i].title,
								house_count: list[i].count,
								min_price_total: list[i].price,
								avg_unit_price: list[i].unitprice,
								url: list[i].url
							});

							markersArr.push(marker);

							marker.addListener('click', function() {
								var infowincontent = '<div style="font-weight: 700; line-height: 2.5em; font-size: 16px;">' + this.title + '&nbsp;&nbsp;<a style="font-size: 12px; color: #de1e30; font-weight: 500;" href="' + this.url + '" target="_blank">详细>></a></div>';
								infowincontent += '<p style="line-height: 1.8em;">均价：' + this.min_price_total + '万' + echoCurrency('short') + '&nbsp;&nbsp;&nbsp;&nbsp;单价：' + this.avg_unit_price + echoCurrency('short') + '/㎡</p>';
								infowincontent += '<p style="line-height: 1.8em;">房源数量：' + this.house_count + '套</p>';
								infoWindow.setContent(infowincontent);
								infoWindow.open(map, this);
							});
						}

                        $(".lcount strong").html(totalCount);

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
				min_longitude: t.lng(),
				max_longitude: a.lng(),
				min_latitude: t.lat(),
				max_latitude: a.lat()
			}
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
				return new BMap.Size(-46, -46)
			},
			2 : function() {
				return new BMap.Size(-1, 10)
			},
			3 : function() {
				return new BMap.Size(-1, 10)
			},
			4 : function() {
				return new BMap.Size(-9, -9)
			}
		}

		//气泡模板
		,bubbleTemplate = {

			//区域
			1 : '<div class="bubble bubble-1" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${id}"><p class="name" title="${name}区">${name}区</p><p class="num">${avg_price}万</p><p><span class="count">${house_count}</span>套</p></div>',

			//区域
			2 : '<div class="bubble bubble-1 bubble-2" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${id}"><p class="name" title="${name}区">${name}区</p><p class="num">${avg_price}万</p><p><span class="count">${house_count}</span>套</p></div>',

			//小区
			3 : '<p class="bubble-3 bubble" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${id}"><i class="num">${avg_price}万</i><span class="name"><i class="name-des"><a href="${href}" target="_blank">${name}&nbsp;&nbsp;${house_count}套</a></i></span><i class="arrow-up"><i class="arrow"></i><i></p>'

		}

		//列表模板
		,listTemplate = {

			//楼盘列表
			roomlist: '<div class="list-item"><a href="${href}" target="_blank" title="${title}" data-community="${community_id}"><div class="item-aside"><img src="${list_picture_url}"><div class="item-btm"><span class="item-img-icon"><i class="i-icon-arrow"></i><i class="i-icon-dot"></i></span><span>${house_picture_count}</span></div></div><div class="item-main"><p class="item-tle">${title}</p><p class="item-des"><span>${frame_room}</span><span data-origin="${house_area}">${house_area}㎡</span><span>朝${frame_orientation}</span><span class="item-side">${price_total}<span>万</span></span></p><p class="item-community"><span class="item-exact-com">${community_name}</span></p><p class="item-tag-wrap">${tagsContent}</p></div></a></div>'

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

		,isNewList = false   //是否为新列表
		,salePage = 1        //楼盘数据当前页
		,saleChooseData;     //查看户型的楼盘数据

	g_conf.districtData = [];
	g_conf.bizcircle = [];
	g_conf.saleData = [];

	init.createMap();


});
