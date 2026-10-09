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
  			init.getLoupanData();

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

  			if(markersArr){
  				for (var i = 0; i < markersArr.length; i++) {
  					markersArr[i].setMap(null);
  				}
  			}

        var data = g_conf.filter.length > 0 ? "&"+g_conf.filter.join("&") : "";
            data = data + (data != "" ? "&" : "") + moreFilter.join("&");

  			$.ajax({
  				"url": masterDomain+"/include/ajax.php?service=house&action=loupanList&pageSize=9999999",
  				"data": data,
  				"dataType": "jsonp",
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

  							qq.maps.event.addListener(marker, 'click', function(t) {
  								var infowincontent = '<div style="font-weight: 700; line-height: 2.5em; font-size: 16px;">' + t.target.title + '&nbsp;&nbsp;<a style="font-size: 12px; color: #de1e30; font-weight: 500;" href="' + t.target.url + '" target="_blank">详细>></a></div>';
  								infowincontent += '<p style="line-height: 1.8em;">类型：' + t.target.house_type + '&nbsp;&nbsp;&nbsp;&nbsp;均价：';
  								infowincontent += t.target.average_price ? (t.target.average_price + '</span>' + (t.target.ptype == 1 ? echoCurrency('short')+'/'+echoCurrency('areasymbol') : ('万'+echoCurrency('short')+'/套'))) : '价格待定</p>';
  								infowincontent += '<p style="line-height: 1.8em;">详细地址：' + t.target.address + '</p>';
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
  		,loupanPageData;     //当前可视范围内的楼盘

  	g_conf.districtData = [];
  	g_conf.loupanData = [];

  	init.createMap();



})
