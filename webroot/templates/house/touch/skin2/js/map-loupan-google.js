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

				}
			});

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
            };
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

  						var list = data.info.list;
  						var LatLngList = [];
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

                            var poi = new google.maps.LatLng(parseFloat(list[i].latitude), parseFloat(list[i].longitude));
                            
                            if(list[i].latitude && list[i].longitude){
    		                    LatLngList.push(poi)
    							var marker = new google.maps.Marker({
    								position: poi,
    								map: map,
    								title: list[i].title,
    								address: list[i].address,
    								ptype: list[i].ptype,
    								house_type: list[i].protype,
    								average_price: list[i].price,
    								url: list[i].url
    							});
    
    							markersArr.push(marker);
    
    							marker.addListener('click', function() {
    								var infowincontent = '<div style="font-weight: 700; line-height: 2.5em; font-size: 16px;">' + this.title + '&nbsp;&nbsp;<a style="font-size: 12px; color: #de1e30; font-weight: 500;" href="' + this.url + '" target="_blank">详细>></a></div>';
    								infowincontent += '<p style="line-height: 1.8em;">类型：' + this.house_type + '&nbsp;&nbsp;&nbsp;&nbsp;均价：';
    								infowincontent += this.average_price ? (this.average_price + '</span>' + (this.ptype == 1 ? echoCurrency('short')+'/m²' : ('万'+echoCurrency('short')+'/套'))) : '价格待定</p>';
    								infowincontent += '<p style="line-height: 1.8em;">详细地址：' + this.address + '</p>';
    								infoWindow.setContent(infowincontent);
    								infoWindow.open(map, this);
    							});
                            }

  						}
  						
  						// 调整到合适的视野
            		    var bounds = new google.maps.LatLngBounds ();
            		    for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
            		        bounds.extend (LatLngList[i]);
            		    }
            		    map.fitBounds (bounds);

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
  	g_conf.loupanData = [];

  	init.createMap();



})
