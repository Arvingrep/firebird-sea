$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

  var mask = $('.mask'), moreFilter = [];
  var map, list = $(".list");
  var windowHeight = $(window).height(), headHeight = $('.header').height(), tabHeight = $(".choose-tab").height(), mapHeight = windowHeight - headHeight - tabHeight;
  $('#map').height(mapHeight);

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
  			map = new BMap.Map(g_conf.mapWrapper, {enableMapClick: false, minZoom: g_conf.minZoom});
  			map.centerAndZoom(g_conf.cityName, g_conf.minZoom);
  			map.enableScrollWheelZoom(); //启用滚轮放大缩小
  			map.disableInertialDragging(); //禁用惯性拖拽
  			map.addEventListener("tilesloaded", init.tilesloaded); //地图加载完毕执行
  		}

  		//地图加载完毕添加地图比例尺控件/自定义缩放/收起/展开侧栏
  		,tilesloaded: function(){
  			map.addControl(new BMap.ScaleControl({
  				anchor: BMAP_ANCHOR_BOTTOM_LEFT,
  				offset: new BMap.Size(380, 4)
  			}));
  			map.removeEventListener("tilesloaded", init.tilesloaded);

  			//自定义缩放
  			$(".zoom-ctrl span").on("click", function(){
  				$(this).hasClass("zoom-plus") ? map.zoomIn() : map.zoomOut();
  			});

  			//初始加载
  			init.getLoupanData("tilesloaded");

  			map.addEventListener("zoomend", function() {
  				init.updateOverlays("zoom");
  			});
  			map.addEventListener("moveend", function() {
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
    				newView.lng && newView.lat ? map.centerAndZoom(new BMap.Point(newView.lng, newView.lat), newView.typ) : map.setZoom(newView.typ);


    			//户型
        }).on("touchend", ".bubble-2 .bubble-inner", function(){

    				var t = $(this).find("a"), url = t.attr("href");
            location.href = url;

        });


  			//楼盘点击事件
  			/* list.delegate("dl", "touchend", function(){
  				var e = $(this),
  						t = {
  							lng: parseFloat(e.attr("data-lng")),
  							lat: parseFloat(e.attr("data-lat")),
  							typ: 15
  						};

  				isClickHx = true;
  				t.lng && t.lat ? map.centerAndZoom(new BMap.Point(t.lng, t.lat), t.typ) : map.setZoom(t.typ);
  				init.getHxData(Number(e.attr("data-id")));

  			}); */


  			//关闭户型信息
  			$(".hxlist").delegate(".closehx", "touchend", function(){
  				init.closeHx();
  			});



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
        // 区域二级
        var chooseAreaSecond = null;
        $('#choose-area li').click(function(){
            var t = $(this), index = t.index(), id = t.attr("data-id"), localIndex = t.closest('.choose-item').index();
            if (index == 0) {
                $('#area-box .choose-stage-l').removeClass('choose-stage-l-short');
                t.addClass('on').siblings().removeClass('active');
                t.closest('.choose-item').hide();
                $('.choose-tab li').eq(localIndex).removeClass('active').attr("data-id", 0).find('span').text("不限");
                mask.hide();
               init.confirmFilter();
            }else{
                t.siblings().removeClass('on');
                t.addClass('active').siblings().removeClass('active');
                $('#area-box .choose-stage-l').addClass('choose-stage-l-short');
                $('.choose-stage-r').show();
                chooseAreaSecond = new iScroll("choose-area-second", {vScrollbar: false,mouseWheel: true,click: true});

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
                            chooseSecond = new iScroll("choose-area-second", {vScrollbar: false,mouseWheel: true,click: true});
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
              var addrid;
              $t.addClass('on').siblings().removeClass('on');
              $('.choose-tab li').eq(index).removeClass('active').attr("data-id", id).find('span').text(val);
              local.hide();
              mask.hide();
              init.confirmFilter();

        })

        //筛选框点击内容
        $('.choose-decorate li').click(function(){
          var t = $(this), val = t.find('a').text(), parent = t.closest('.choose-ul'), index = parent.index();         
          t.addClass('active').siblings('li').removeClass('active');
          t.find('a').addClass('on');
          t.siblings('li').find('a').removeClass('on');
          $('.choose-tab li').eq(index).find('span').html(val);
          mask.hide();
          $('.choose-ul').hide();
      		$('.choose-tab li').removeClass('active');

          init.confirmFilter();
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
  			var data = g_conf.filter.length > 0 ? "&"+g_conf.filter.join("&") : "";
        data = data + (data != "" ? "&" : "") + moreFilter.join("&");

  			$.ajax({
  				"url": masterDomain+"/include/ajax.php?service=pension&action=storeDistrict",
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


  			$.ajax({
  				"url": masterDomain+"/include/ajax.php?service=pension&action=storeList&pageSize=9999999",
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
  							loupanData[i]['longitude'] = list[i].lng;
  							loupanData[i]['latitude'] = list[i].lat;
  							loupanData[i]['resblock_name'] = list[i].title;
  							loupanData[i]['loupan_addr'] = list[i].address;
  							loupanData[i]['ptype'] = list[i].ptype;
  							loupanData[i]['average_price'] = list[i].price;
  							loupanData[i]['cover_pic'] = list[i].litpic;
  							loupanData[i]['house_type'] = list[i].tel;
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

  			if(type == "tilesloaded"){
  				map.centerAndZoom(g_conf.cityName, g_conf.minZoom);
  			}

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

  					o.priceTpl = '<span class="price">' + o.average_price ? (o.average_price + '</span><i>' + (o.ptype == 1 ? echoCurrency('short') : echoCurrency('short')) + '</i>') : "价格待定</span>";
  					o.moreTpl = init.replaceTpl(more, o);

  				}

  				bubbleLabel = new BMap.Label(init.replaceTpl(temp, o), {
  					position: new BMap.Point(o.longitude, o.latitude),
  					offset: bubbleMapSize[resize]()
  				});

  				bubbleLabel.addEventListener("mouseover", function() {
  					this.setStyle({zIndex: "4"});
  				});

  				bubbleLabel.addEventListener("mouseout", function() {
  					this.setStyle({zIndex: "2"});
  				});

  				bubbleLabel.setStyle(bubbleStyle);
  				map.addOverlay(bubbleLabel);

  			});

  			//区域集合时统计数据为楼盘的数量
  			data = resize == 1 ? init.getVisarea(g_conf.loupanData) : data;

  			init.mosaicLoupanList(data);

  		}

  		//删除地图气泡
  		,cleanBubble: function(){
  			map.clearOverlays();
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
					var type = t.attr("data-type"), val = t.find(".on").attr("data-id"), txt = t.find(".on").text();
					if(val!=undefined){
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
  			1 : '<div class="bubble bubble-1" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${loupan_id}"><p class="name" title="${district_name}区">${district_name}区</p><p><span class="count">${count}</span>个养老</p></div>',


  			//楼盘、价格及类型
  			2 : '<div class="bubble bubble-2 bubble-3 fn-clear" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${loupan_id}"><div class="bubble-wrap"><div class="bubble-inner">${moreTpl}</div><i class="arrow"><i class="arrow-i"></i></i></div><p class="cycle"></p></div>',

  			//楼盘价格
  			moreTpl: '<div class="num fn-clear"><div class="map_img2"><a href="${url}"target="_blank"><img src="${cover_pic}"/></a></div><div class="map2_con"><p class="map2_tit"><a href="${url}"target="_blank">${resblock_name}</a></p><p class="map2_info">${loupan_addr}</p><p class="price">'+echoCurrency('symbol')+'<strong>${priceTpl}</strong>起</p></div></div>'
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


   // 定位
    $('.zoom-local').click(function(){
      //获取当前位置
      var oldlng,oldlat;
      HN_Location.init(function(data){
        if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
          alert(''+langData['siteConfig'][27][137]+'')   /* 定位失败，请重新刷新页面！ */ 

        }else{      
          oldlng = data.lng;
          oldlat = data.lat;
          var mPoint = new BMap.Point(oldlng, oldlat)
          var mk = new BMap.Marker(mPoint);           
          map.addOverlay(mk); 
          map.panTo(mPoint);      
        }
      }, device.indexOf('huoniao') > -1 ? false : true);
  })



})
