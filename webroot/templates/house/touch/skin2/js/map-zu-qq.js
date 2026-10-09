$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

  var mask = $('.mask'), moreFilter = [], markersArr = [], isload;
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

        var mapOptions = {
  				zoom: 11,
  				center: new qq.maps.LatLng(39.916527,116.397128),
  				minZoom: 11,
  				zoomControl: false
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

  			//初始加载
  			init.getSaleData();

  			init.updateLoupanListDiv();
  			$(window).resize(function(){
  				init.updateLoupanListDiv();
  			});

  			//自定义缩放
  			$(".zoom-ctrl span").on("click", function(){
  				var zoom = map.getZoom();
  				$(this).hasClass("zoom-plus") ? map.setZoom(zoom + 1) : map.setZoom(zoom - 1);
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
          var t = $(this), val = t.find('a').text(), parent = t.closest('.choose-ul'), index = parent.index() ,ul = t.closest('.choose-ul');
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

              var infoWindow = new qq.maps.InfoWindow({
  					      map: map
  					  });

              var list = data.info, totalCount = 0;
  						for(var i = 0; i < list.length; i++){
                (function(n){
    							saleData[i] = [];
    							saleData[i]['id'] = list[i].id;
    							saleData[i]['name'] = list[i].title;
    							saleData[i]['longitude'] = list[i].longitude;
    							saleData[i]['latitude'] = list[i].latitude;
    							saleData[i]['house_count'] = list[i].count;
    							saleData[i]['avg_unit_price'] = list[i].price;
    							saleData[i]['href'] = list[i].url;

                  totalCount += parseInt(list[i].count);

                  var center = new qq.maps.LatLng(list[n].latitude, list[n].longitude);
    							marker = new qq.maps.Marker({
    								map: map,
    								position: center,
                    title: list[i].title,
    								house_count: list[i].count,
    								price: list[i].price,
    								url: list[i].url
    							});

    							markersArr.push(marker);

                  qq.maps.event.addListener(marker, 'click', function() {
                    var infowincontent = '<div style="font-weight: 700; line-height: 2.5em; font-size: 16px;">' + this.title + '&nbsp;&nbsp;<a style="font-size: 12px; color: #de1e30; font-weight: 500;" href="' + this.url + '" target="_blank">详细>></a></div>';
    								infowincontent += '<p style="line-height: 1.8em;">均价：' + this.price + echoCurrency('short') + '/月</p>';
    								infowincontent += '<p style="line-height: 1.8em;">房源数量：' + this.house_count + '套</p>';
                    infoWindow.setContent(infowincontent);
                    infoWindow.open(map, this);
    								infoWindow.setPosition(center);
                  });
                })(i);

  						}

              $(".lcount strong").html(totalCount);

  					}else {
              $(".lcount strong").html(0);
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
  				min_longitude: t.lng,
  				max_longitude: a.lng,
  				min_latitude: t.lat,
  				max_latitude: a.lat
  			}
  		}


  		//拼接楼盘列表
  		,mosaicLoupanList: function(data){

  			//可视区域内楼盘数量
  			$(".lcount strong").html(data.length);

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


    //列表模板
		var listTemplate = {

      //楼盘列表
      roomlist: '<div class="list-item"><a href="${href}" target="_blank" title="${title}" data-community="${community_id}"><div class="item-aside"><img src="${list_picture_url}"><div class="item-btm"><span class="item-img-icon"><i class="i-icon-arrow"></i><i class="i-icon-dot"></i></span><span>${house_picture_count}</span></div></div><div class="item-main"><p class="item-tle">${title}</p><p class="item-des"><span>${frame_room}</span><span data-origin="${house_area}">${house_area}'+echoCurrency('areasymbol')+'</span><span>朝${frame_orientation}</span><span class="item-side">${price_total}<span>万</span></span></p><p class="item-community"><span class="item-exact-com">${community_name}</span></p><p class="item-tag-wrap">${tagsContent}</p></div></a></div>'

		}

  		,isClickHx = false   //是否点击了户型
  		,isNewList = false   //是否为新列表
  		,loupanPage = 1      //楼盘数据当前页
  		,loupanChooseData    //查看户型的楼盘数据
  		,loupanPageData;     //当前可视范围内的楼盘

  	g_conf.districtData = [];
  	g_conf.loupanData = [];

  	init.createMap();



})
