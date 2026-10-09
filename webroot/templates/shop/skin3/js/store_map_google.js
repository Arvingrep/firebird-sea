$(function(){

	//文本框placeholder
	$("html input").placeholder();
	//气泡偏移
	var bubbleMapSize = {
			1 : function() {
				return new BMap.Size(-20, -20)
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

			//一级 全部只有商家 和标题
			1 : '<div class="bubble bubble-1" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${store_id}" data-url="${store_url}"><span class="${typeModule} store-click"></span><p class="name" title="${store_name}">${store_name}</p></div>',


			//缩小时 只显示图标
			2 : '<div class="bubble bubble-2" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${store_id}" data-url="${store_url}"><div class="map_win"><s class="arr"></s><div class="shop_detl fn-clear"> <div class="shop_logo"><img src="${store_logo}" onerror="this.src=\'/static/images/404.jpg\'" /></div> <div class="shop_info"> <h4>${store_name}</h4> <p class="starInfo"><span class="shop_star"><s></s>${store_rating}好评率</span> <span class="shop_gz">${store_collectnum}人关注</span></p> <p class="shop_addr"><s></s>${store_address}</p> </div> </div> </div><span class="${typeModule}"><a href="javascript:;" data-url="${store_url}">${store_index}</a></span></div>'

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

	var map, filterData, markersArr =[], markerHx,infoWindow, list = $(".list"), init = {

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
						streetViewControl: false,
						zoomControlOptions: {
							style: google.maps.ZoomControlStyle.SMALL,
							position: google.maps.ControlPosition.TOP_RIGHT
						}
					});

					infoWindow = new google.maps.InfoWindow;
					google.maps.event.addListener(map, "tilesloaded", init.tilesloaded); //地图加载完毕执行

				}
			});
		}

		//地图加载完毕添加地图比例尺控件/自定义缩放/收起/展开侧栏
		,tilesloaded: function(){
			


			

			//收起/展开侧栏
			$(".map-os").bind("click", function(){
				var t = $(this), sidebar = $(".sidebar");
				t.hasClass("open") ? (sidebar.stop().animate({"left": 0}, 150), t.attr("title", "收起左栏"), t.removeClass("open"), $("#"+g_conf.mapWrapper).animate({"left": "325px"}, 150)) : (sidebar.stop().animate({"left": "-360px"}, 150), t.attr("title", "展开左栏"), t.addClass("open"), $("#"+g_conf.mapWrapper).animate({"left": "0"}, 150));
			});

			//加载搜索&筛选&排序
			// init.search();
			// init.filter();
			init.sortby();


			//初始加载
			init.getStoreData();

			var typing = false;
		 $('#search_keyword').on('compositionstart',function(){
				 typing = true;
		 })
		 $('#search_keyword').on('compositionend',function(){
				 typing = false;
		 })
		 //打完字去搜索结果 列表show  如果是提交的话 列表hide
		 $('#search_keyword').on('keyup',function(e){
			 // if(!typing && e.keyCode!=13){
				//  init.getStoreData('change');
			 // }
			 if(e.keyCode==13){
				  init.getStoreData('change');
			 }
			 return false;
		 })

		 $('.search_button').click(function(){
			 init.getStoreData('change');
		 })


			google.maps.event.addListener(map,"zoom_changed", function() {
				init.updateOverlays("zoom");
			});
			google.maps.event.addListener(map,"dragend", function() {
				init.updateOverlays("drag");
			});


			// 选择分类

			$('body').delegate('.type_li,.type_dl','click',function(e){
				var t = $(this),typeid = t.attr('data-id');
				$("#typeid").val(typeid)
				$('.type_li,.type_dl').removeClass('on_chose');
				t.addClass('on_chose');
				var typename = '';
				if(t.hasClass('type_li')){
				 	typename = t.text()
					t.closest('.type_dl').addClass('on_chose')
				}else{
					typename = t.find('.type_dt').text()
				}
				$(".typeBox .li_tit span").text(typename)
				$('.typeList').css({'display':'none'});
				setTimeout(function(){
					$('.typeList').removeAttr('style')
				},500)
				init.getStoreData('change');
				return false;
			})


			// 区域
			$('.areaList').delegate('li','click',function(){
				var t = $(this);
				t.addClass('on_chose').siblings('li').removeClass('on_chose');
				$("#addrid").val(t.attr('data-addrid')?t.attr('data-addrid'):'');
				$(".areaBox .li_tit span").text(t.text())
				init.getStoreData('change');
			})







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
						// loupanPage++;
						isNewList = false;
						// init.getLoupanPageList(loupanpageData_);
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



		//更新地图状态
		,updateOverlays: function(type){

			if(type == "tilesloaded"){
				map.centerAndZoom(g_conf.cityName, g_conf.minZoom);
			}




  			var zoom = map.getZoom(), data = [];

  			//区域集合
        var zoomDiff = zoom - g_conf.minZoom;//当前zoom 和规定的zoom 来判断放大缩小
  			if(zoomDiff >= 2){
  				data = init.getVisarea(g_conf.storeData);
  				init.createBubble(data, bubbleTemplate[2], 1);

  			}else{//只显示商家图标
					data = init.getVisarea(g_conf.storeData);
					init.createBubble(data, bubbleTemplate[2], 2);
  			}
        if(type == "change" || type == "drag" || type == "zoom"){
          data = init.getVisarea(g_conf.storeData);
          init.createBubble(data, bubbleTemplate[2], 2);
          // if(type == "drag"){
          //   $('.showresult').attr('data-type','drag');
          //   $('.showresult').addClass('reshow');
          //   $('#resQuyu').text(data.length);
          //   adrlowerdata = data;
          // }
        }else{
          data = init.getVisarea(g_conf.storeData);
          init.createBubble(data, bubbleTemplate[2], 1);
        }
        console.log(data)



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
				// var icon = {
				// 	url: templets+"/images/posi_2.png",
				// 	scaledSize: new google.maps.Size(34, 34), // size
				// 	origin: new google.maps.Point(0,0), // origin
				// 	anchor: new google.maps.Point(0, 0) // anchor 
				// };
				  var markers= new google.maps.Marker({
					  position:new google.maps.LatLng(parseFloat(o.latitude),parseFloat(o.longitude)),
					//   icon: icon,
				  });
				  google.maps.event.addListener(markers, 'click', function() { 
					var info = data[0];
					var infowincontent = '<div style="font-weight: 700; line-height: 2.5em; font-size: 16px;"><span style="display:inline-block; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align: middle">' + info.store_name + '</span>&nbsp;&nbsp;<a style="font-size: 12px; color: #de1e30; font-weight: 500;" href="' + info.store_url + '" target="_blank">详细>></a></div>';
					infowincontent += '<p style="line-height: 1.8em;">关注：' + info.store_collectnum + '&nbsp;&nbsp;&nbsp;&nbsp;好评：'+info.store_rating;
					infowincontent += '<p style="line-height: 1.8em;">详细地址：' + info.store_address + '</p>';
					
				   
					//   infowincontent += '<p style="line-height: 1.8em;">详细地址：'+data[0].address+'</p>';
					  infoWindow.setContent(infowincontent);
					  infoWindow.open(map, this);
				  }); 
				var posi = new google.maps.LatLng(parseFloat(o.latitude),parseFloat(o.longitude))
				  markersArr.push(markers)
				  markers.setMap(map); 
			});


			//区域集合时统计数据为楼盘的数量
			data = resize == 1 ? init.getVisarea(g_conf.storeData) : data;


		}

		//删除地图气泡
		,cleanBubble: function(){
			for (var i = 0; i < markersArr.length; i++) {
				markersArr[i].setMap(null);
			  }
		}


		//点击气泡
		 ,storeClick: function(e){
			 var tar = e.target.content;
			 $('.fake').html(tar)
			 var url =$('.fake').find('.bubble').attr('data-url');
			 window.open(url)
		 }

		//加载搜索
		,search: function(){

			$("#search_keyword").autocomplete({
				source: function(request, response) {
					$.ajax({
						url: "/include/ajax.php?service=siteConfig&action=store_map&moduletype=shop",
						dataType: "jsonp",
						data:{
							title: request.term
						},
						success: function(data) {
							if(data && data.state == 100){
								console.log(data)
							}else{
								response([])
							}
						}
					});
				},
				minLength: 1,
				select: function(event, ui) {
					g_conf.keywords = ui.item.value;
					init.getStoreData();
				}
			}).autocomplete("instance")._renderItem = function(ul, item) {
				return $("<li>")
					.append(item.label)
					.appendTo(ul);
			};


			//回车搜索
			$("#search_keyword").keyup(function (e) {
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
					$(".search_button").click();
				}
			});


			//点击搜索
			$(".search_button").bind("click", function(){
				var val = $.trim($("#search_keyword").val());

				if($(".hxlist").html() != ""){
					init.closeHx();
				}

				g_conf.keywords = val;
				init.getStoreData();
			});

		}

		//加载完成执行下一步
  		,doNext: function(type){
  			if(g_conf.storeData){
  				init.updateOverlays(type);

  			}
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
			// $(".f-o li:eq(1)").hover(function(){
			// 	var t = $(this);
			// 	t.addClass("on");
			// 	t.find(".orderby").show();
			// }, function(){
			// 	var t = $(this);
			// 	t.removeClass("on");
			// 	t.find(".orderby").hide();
			// });

			//排序选中
			orderby.delegate("a", "click", function(){
				var parent = orderby.parent(), t = $(this);
				t.addClass("on").parent().siblings("li").find("a").removeClass("on");
				parent.removeClass("on");
				orderby.css({'display':'none'});
				setTimeout(function(){
					orderby.removeAttr('style')
				},500)
				var text = t.text(), val = t.attr('data-val');
				if(text == '默认排序'){
					parent.removeClass("curr");
					parent.find("span").html('默认排序');
				}else{
					parent.addClass("curr");
					parent.find("span").html(text);
				}

				g_conf.orderby = val;

				init.getStoreData();

			});

		}

    // 获取数据
    ,getStoreData: function(type){
  			var data = [];
        var keywords = $('#search_keyword').val();
        data.push('title='+keywords);

        var addrid = $('#addrid').val();
        data.push('addrid='+addrid);


        var typeid = $('#typeid').val();
        data.push('industry='+typeid);

        var orderby = g_conf.orderby;
        data.push('orderby='+orderby);

        $('.loading').show()
  			$.ajax({
  				url: "/include/ajax.php?service=siteConfig&action=store_map&moduletype=shop",
  				data: data.join('&'),
  				dataType: "jsonp",
  				async: false,
  				success: function(data){
              if(data.state == 100){
                  var storeData = [];
                	var list = data.info.list;
								if(list.length > 0){
                  adrlowerdata = list;
                  var sfHtml = [];
                	for(var i = 0; i < list.length; i++){
                		storeData[i] = [];
                		storeData[i]['store_id'] = list[i].id;
                		storeData[i]['store_logo'] = list[i].logo;
                		storeData[i]['store_rating'] = list[i].rating;
                		storeData[i]['store_address'] = list[i].address;
                		storeData[i]['store_collectnum'] = list[i].collectnum;
                		storeData[i]['store_name'] = list[i].title;
                    storeData[i]['store_url'] = list[i].url;
                		storeData[i]['longitude'] = list[i].lng;
                		storeData[i]['latitude'] = list[i].lat;
                    storeData[i]['typeModule'] = list[i].moduletype;
                    storeData[i]['store_index'] = (i + 1);

                    sfHtml.push('<li class="shop_li" data-id="'+list[i].id+'">');
                    sfHtml.push('<a href="'+list[i].url+'" target="_blank" class="fn-clear">');
                    sfHtml.push('<span class="orderNum">'+(i+1)+'</span>');
                    sfHtml.push('<div class="shopInfo fn-clear">');
                    sfHtml.push('<div class="shopLogo"><img src="'+(huoniao.changeFileSize(list[i].logo,440,440))+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
                    sfHtml.push('<div class="shopDetail">');
                    sfHtml.push('<h3>'+list[i].title+'</h3>');
                    sfHtml.push('<p><span class="star_num"><s class="star"></s>'+(list[i].score1 ? (parseFloat(list[i].score1).toFixed(1)) : "<span style='font-weight:normal; font-size:12px;'>暂无评分</span>")+'</span> <span class="hui">'+list[i].disresult+'条优惠</span></p>');
                    sfHtml.push('<p class="addr"><s></s>'+list[i].address+'</p>');
                    sfHtml.push('</div> </div> </a> </li>');
                	}
                  $(".shop_ul").html(sfHtml.join(''));
								}else{
										$(".shop_ul").html('<div class="noData"><img src="'+templets_path+'/images/noData.png" /><h4>非常抱歉</h4><p>没有找到相关商家，换个关键词试试吧~</p></div>')
								}
								$('.loading').hide();

              }else{
								$(".shop_ul").html('<div class="noData"><img src="'+templets_path+'/images/noData.png" /><h4>非常抱歉</h4><p>没有找到相关商家，换个关键词试试吧~</p></div>')
							}

  					// if(data && data.state == 100){
            //   var html = [];
  					// 	var list = data.info.list;
            //   adrlowerdata = list;
            //   var sfHtml = [];
  					// 	for(var i = 0; i < list.length; i++){
  					// 		storeData[i] = [];
  					// 		storeData[i]['store_id'] = list[i].id;
  					// 		storeData[i]['store_name'] = list[i].title;
            //     storeData[i]['store_url'] = list[i].url;
  					// 		storeData[i]['longitude'] = list[i].lng;
  					// 		storeData[i]['latitude'] = list[i].lat;
            //     storeData[i]['typeModule'] = list[i].moduletype;
            //
            //
            //
            //
            //
  					// 	}
            //   //搜索结果填充
            //   if(keywords !=""){
            //     if(list.length > 0){
            //       $('.allresult strong').text(keywords);
            //       $('.allresult em').text(list.length);
            //       $('.searchResult .resultList').html(sfHtml.join(''));
            //       $('.searchResult').show();
            //       //按照第一条搜索到的结果定位
            //       var selng = list[0].lng,selat = list[0].lat;
            //       map.centerAndZoom(new BMap.Point(selng, selat), 13);
            //     }else{//若没有搜索到相关店铺 则按地点查询定位
            //       $('.searchResult').hide();
            //       init.getSearch_posi();
            //     }
            //   }else{
            //     $('.searchResult').hide();
            //   }
            //
            //
            //
            //   //底部商家列表填充
            //   if(type == 'tilesloaded'){//刚进页面时  初始加载
            //     $('.total').text(list.length);
            //     $('.storeList .showmore p').attr('data-total',list.length);
            //     init.getList(list);
            //   }else{//有筛选条件
            //     $('.showresult').addClass('reshow');
            //     $('#resQuyu').text(list.length);
            //     $('.showresult').attr('data-type','change')
            //   }
            //
  					// }
            //
  					g_conf.storeData = storeData;
  					init.doNext(type);

  				}
  			});

  		}

      //114搜索查询
    ,getSearch_posi:function(){
      if(sp_ajax){
        sp_ajax.abort();
      };
      var directory = $('#keywords').val();
      sp_ajax = $.ajax({
        url: '/include/ajax.php?service=siteConfig&action=get114ConveniencePoiList&pageSize=2&page=1&lng='+oldlng+'&lat='+oldlat+'&directory='+directory+'&radius=9999',
        dataType: 'jsonp',
        success: function(data){
          console.log(data)
          // if(data.state == 100){
          //   pagetoken = data.info.pagetoken == '' || data.info.pagetoken == null ? '' : data.info.pagetoken;
          //   var list = data.info.list;
          //   if(list.length > 0){
          //     //按照第一条搜索到的结果定位
          //     var selng = list[0].lng,selat = list[0].lat;
          //     map.centerAndZoom(new BMap.Point(selng, selat), 13);
          //
          //   }else{
          //     if(directory !="")
          //     showErrAlert('未找到相关位置');
          //     //没搜到结果 则回到定位的位置
          //     map.centerAndZoom(new BMap.Point(oldlng, oldlat), 13);
          //   }
          //
          // }else{
          //   if(directory !="")
          //   showErrAlert('未找到相关位置');
          //   //没搜到结果 则回到定位的位置
          //   map.centerAndZoom(new BMap.Point(oldlng, oldlat), 13);
          // }
        },
        error: function(){
          if(directory !="")
          showErrAlert('未找到相关位置');
          //没搜到结果 则回到定位的位置
        //   map.centerAndZoom(new BMap.Point(oldlng, oldlat), 13);
        }
      });
    }

	}


	//气泡偏移
	// var bubbleMapSize = {
	// 		1 : function() {
	// 			return new BMap.Size(-46, -46)
	// 		},
	// 		2 : function() {
	// 			return new BMap.Size(-1, 10)
	// 		},
	// 		3 : function() {
	// 			return new BMap.Size(-1, 10)
	// 		},
	// 		4 : function() {
	// 			return new BMap.Size(-9, -9)
	// 		}
	// 	}
  //
	// 	//气泡模板
	// 	,bubbleTemplate = {
  //
	// 		//区域
	// 		1 : '<div class="bubble bubble-1" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${loupan_id}"><p class="name" title="${district_name}区">${district_name}区</p><p><span class="count">${count}</span>个楼盘</p></div>',
  //
	// 		//只显示楼盘
	// 		2 : '<div class="bubble bubble-2" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${loupan_id}"><div class="bubble-wrap"><div class="bubble-inner"><p class="name" title="${resblock_name}">${resblock_name}</p>${moreTpl}</div><i class="arrow"><i class="arrow-i"></i></i></div><p class="cycle"></p></div>',
  //
	// 		//楼盘、价格及类型
	// 		3 : '<div class="bubble bubble-2 bubble-3" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${loupan_id}"><div class="bubble-wrap"><div class="bubble-inner"><p class="name" title="${resblock_name}">${resblock_name}</p>${moreTpl}</div><i class="arrow"><i class="arrow-i"></i></i></div><p class="cycle"></p></div>',
  //
	// 		//周边信息
	// 		4 : '<div class="bubble bubble-4" data-disabled="1" data-longitude="${longitude}" data-latitude="${latitude}" data-id="${loupan_id}"><span class="close">&times;</span><a href="${url}" target="_blank"><div class="bubble-inner clear"><p class="tle">周边信息</p><div class="around-container"><p class="around-li li-first"  data-type="超市" style="background-position: 0 -2px;">超市：<span>0</span>家</p><p class="around-li" data-type="公交" style="background-position: 0 -56px;">公交：<span>0</span>站</p><p class="around-li"  data-type="学校" style="background-position: 0 -20px;">学校：<span>0</span>所</p><p class="around-li"  data-type="银行" style="background-position: 0 -74px;">银行：<span>0</span>家</p><p class="around-li"  data-type="医院" style="background-position: 0 -38px;">医院：<span>0</span>所</p><p class="around-li li-last"  data-type="休闲" style="background-position: 0 -92px;">休闲：<span>0</span>家</p></div><i class="arrow"><i class="arrow-i"></i></i></div></a><p class="cycle"></p></div>',
  //
	// 		//楼盘价格
	// 		moreTpl: '<p class="num"><span class="house-type">${house_type}</span>均价${priceTpl}<span class="gt">&gt;</span></p>'
	// 	}
  //
	// 	//列表模板
	// 	,listTemplate = {
  //
	// 		//楼盘列表
	// 		building: '<dl class="fn-clear"data-id="${loupan_id}"data-lng="${longitude}"data-lat="${latitude}"title="${resblock_name}"><dt><img src="${cover_pic}"/></dt><dd><h2>${resblock_name}</h2><p>${loupan_addr}</p><p>${house_type}</p><p class="price">均价${priceTpl}</p></dd></dl>',
  //
	// 		//户型楼盘信息
	// 		longpanOnly: '<a href="javascript:;"class="closehx"title="关闭户型">&times;</a><dl class="loupan fn-clear"title="${resblock_name}"><a href="${url}"target="_blank"><dt><img src="${cover_pic}"></dt><dd><h2>${resblock_name}</h2><p>${loupan_addr}</p><p>${house_type}</p><p class="price">均价${priceTpl}</p></dd></a></dl><p class="hcount">共有<strong>${hxcount}</strong>个户型</p><div class="con"><div class="hx-list">${hx}</div></div>',
  //
	// 		//户型列表
	// 		hxlist: '<dl class="fn-clear"><a href="${url}"target="_blank"><dt><img src="${frame_pic}"/><span>${frame_name}</span></dt><dd><h3>${room_num} ${build_area}㎡ 朝${direction}</h3><p>${note}</p></dd></a></dl>'
	// 	}
  //
	// 	//气泡样式
	// 	,bubbleStyle = {
	// 		color: "#fff",
	// 		borderWidth: "0",
	// 		padding: "0",
	// 		zIndex: "2",
	// 		backgroundColor: "transparent",
	// 		textAlign: "center",
	// 		fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
	// 	}
  //
	// 	,isClickHx = false   //是否点击了户型
	// 	,isNewList = false   //是否为新列表
	// 	,loupanPage = 1      //楼盘数据当前页
	// 	,loupanChooseData    //查看户型的楼盘数据
	// 	,loupanpageData_;     //当前可视范围内的楼盘
  //
	// g_conf.districtData = [];
	// g_conf.loupanData = [];



	g_conf.storeData = [];

	//开始执行绘制 此处设置time 是因为 要等位置定位好 再绘制
    setTimeout(function(){
      init.createMap();
    },1000)




});
