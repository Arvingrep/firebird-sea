$(function(){
	// 区域筛选
    $('.sidebar .f-o>li').click(function () {
        $(this).toggleClass('tran');
    });
    $('.qu_btn').click(function () {
        $('.filter').toggleClass('show');
    });

    // 分类列表切换
    $('.category ul li').click(function () {
        $(this).addClass('active');
        $(this).siblings().removeClass('active');
        var  i = $(this).index();
        $('.filter  .catelist .catelist-item').eq(i).addClass('show').siblings().removeClass('show');
    });

	var map, filterData, infoWindow, isload, markersArr = [],markersArr2 = [],allLoad = false, list = $(".listes"), init = {

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
					// google.maps.event.addListener(map, "dragend", init.getBusinessData); //地图加载完毕执行

				}
			});

		}

		//地图加载完毕添加地图比例尺控件/自定义缩放/收起/展开侧栏
		,tilesloaded: function(){

            if(isload) return;
            isload = true;

			//收起/展开侧栏
			$(".map-os").bind("click", function(){
				var t = $(this), sidebar = $(".sidebar");
				t.hasClass("open") ? (sidebar.stop().animate({"left": 0}, 150), t.attr("title", "收起左栏"), t.removeClass("open"), $("#"+g_conf.mapWrapper).animate({"left": "325px"}, 150)) : (sidebar.stop().animate({"left": "-324px"}, 150), t.attr("title", "展开左栏"), t.addClass("open"), $("#"+g_conf.mapWrapper).animate({"left": "0"}, 150));
			});

			//加载搜索&分类
			init.search();
			init.classified();

			init.getBusinessData();

			google.maps.event.addListener(map,"zoom_changed", function() {
                init.updateOverlays("zoom");
            });

            google.maps.event.addListener(map,"dragend", function() {
				init.updateOverlays("drag");
			});
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
						if(!allLoad){//最后一页时则不用再加载
							loupanPage++;
							isNewList = false;
							init.getBusinessPageList();
						}
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
				searchHeight = $(".search-box").height() + 2,
				lcountHeight = $(".lcount").height();

			list.css({"height": sidebarHeight - searchHeight - foHeight  + "px"});
			list.mCustomScrollbar("update");
		}


		//获取商家，区域信息
		,getBusinessData: function(type){
			markersArr2 = [];//清空infowindow
			//清空之前画的marker
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
            var data = boundsArr.join("&")+"&keywords="+encodeURIComponent(g_conf.keywords)+(g_conf.filter.length > 0 ? "&"+g_conf.filter.join("&") : "")+"&orderby="+g_conf.orderby+"&typeid="+g_conf.typeid+"&pageSize=10";
            
            $.ajax({
                "url": masterDomain + "/include/ajax.php?service=business&action=blist",
                "data": data,
                "dataType": "JSONP",
                "async": false,
				"success": function(data){

					var districtData = [];
                    if(data && data.state == 100){

                        var lists = data.info.list;
                        for(var i = 0; i < lists.length; i++){
                            districtData[i] = [];
                            districtData[i]['business_id'] = lists[i].id;
                            districtData[i]['longitude'] = lists[i].lng;
                            districtData[i]['latitude'] = lists[i].lat;
                            districtData[i]['title'] = lists[i].title;
                            districtData[i]['address'] = lists[i].address;
                            districtData[i]['tel'] = lists[i].tel;
                            districtData[i]['url'] = lists[i].url;
                            districtData[i]['cover_pic'] = lists[i].logo;

							var poi = new google.maps.LatLng(parseFloat(lists[i].lat), parseFloat(lists[i].lng));
							var marker = new google.maps.Marker({
								position: poi,
								map: map,
								business_id: lists[i].id,
								title: lists[i].title,
								address: lists[i].address,
								cover_pic: lists[i].logo,
								tel: lists[i].tel,
								url: lists[i].url
							});

							markersArr.push(marker);
							markersArr2.push(marker);
							
							marker.addListener('click', function() {
								var infowincontent = '<div class="goBubble" data-id="' + this.business_id + '"><div class="bubble-wrap"><a target="_blank" href="' + this.url + '"><div class="bubble-inner"><div class="img"><img src="' + this.cover_pic + '"></div><div class="info"> <p class="name">' + this.title + '</p><p class="tel"><i></i>' + this.tel + '</p><p class="dres">地址：' + this.address + '</p></div><span class="btn">商家店铺</span></div></a><i class="arrow"></i></div></div>';
								infoWindow.setContent(infowincontent);

								infoWindow.open(map, this);
							});


						}

					}

					g_conf.districtData = districtData;
					data = init.getVisarea(g_conf.districtData);
					init.mosaicLoupanList(data);

				}
			});
            //markersArr2 用来接收infowindow的数组
			//鼠标经过
			list.delegate(".list-item", "mouseenter", function(){
				var t = $(this), index = t.index();
				var infowincontent = '<div class="goBubble" data-id="' + markersArr2[index].business_id + '"><div class="bubble-wrap"><a target="_blank" href="' + markersArr2[index].url + '"><div class="bubble-inner"><div class="img"><img src="' + markersArr2[index].cover_pic + '"></div><div class="info"> <p class="name">' + markersArr2[index].title + '</p><p class="tel"><i></i>' + markersArr2[index].tel + '</p><p class="dres">地址：' + markersArr2[index].address + '</p></div><span class="btn">商家店铺</span></div></a><i class="arrow"></i></div></div>';
				infoWindow.setContent(infowincontent);				
				infoWindow.open(map, markersArr2[index]);				

            });
            //鼠标滑出
			list.delegate(".list-item", "mouseleave", function(){
				var t = $(this), index = t.index();
				var infowincontent = '<div class="goBubble" data-id="' + markersArr2[index].business_id + '"><div class="bubble-wrap"><a target="_blank" href="' + markersArr2[index].url + '"><div class="bubble-inner"><div class="img"><img src="' + markersArr2[index].cover_pic + '"></div><div class="info"> <p class="name">' + markersArr2[index].title + '</p><p class="tel"><i></i>' + markersArr2[index].tel + '</p><p class="dres">地址：' + markersArr2[index].address + '</p></div><span class="btn">商家店铺</span></div></a><i class="arrow"></i></div></div>';
				infoWindow.setContent(infowincontent);				
				infoWindow.close();				

            });
		}


		//拼接楼盘列表
		,mosaicLoupanList: function(data){

			//如果是点击的楼盘列表，则不更新楼盘列表内容
			//if(isClickHx) return false;


			if(data.length == 0){
				$(".business-list").html('<p class="empty">很抱歉，没有找到合适的商家，请重新查找</p>');
				return;
			}
			var loupanList = [];
            $.each(data, function(i, d){
                loupanList.push(init.replaceTpl(listTemplate.building, d));
            });
            $(".business-list").html(loupanList.join(""));



		}


		//获取指定分页的楼盘列表
		,getBusinessPageList: function(){
			allLoad = false;
			if(isNewList){
				markersArr2 = [];//清空infowindow
			}
			
			//清空之前画的marker 第一页时
			if(markersArr && isNewList){
				for (var i = 0; i < markersArr.length; i++) {
					markersArr[i].setMap(null);
				}
			}
			
			if(isNewList){
				$(".business-list").html('<p class="loading">加载中...</p>');
			}else{
				$(".business-list").append('<p class="loading-min">加载中...</p>');
			}
            list.mCustomScrollbar("update");
            
            var visBounds = init.getBounds();
			var boundsArr = [];
			boundsArr.push('min_latitude='+visBounds['min_latitude']);
			boundsArr.push('max_latitude='+visBounds['max_latitude']);
			boundsArr.push('min_longitude='+visBounds['min_longitude']);
            boundsArr.push('max_longitude='+visBounds['max_longitude']);

            var total_count = 0, datalist = [];
            var data = boundsArr.join("&")+"&keywords="+encodeURIComponent(g_conf.keywords)+(g_conf.filter.length > 0 ? "&"+g_conf.filter.join("&") : "")+"&orderby="+g_conf.orderby+"&typeid="+g_conf.typeid+"&page="+loupanPage+"&pageSize=10";

            $.ajax({
                "url": "/include/ajax.php?service=business&action=blist",
                "data": data,
                "dataType": "JSONP",
                "async": false,
                "success": function(data){
                    if(data && data.state == 100){
                        total_count = data.info.pageInfo.totalCount;
                        var _list = data.info.list;
                        for(var i = 0; i < _list.length; i++){
                            datalist[i] = [];
                            datalist[i]['business_id'] = _list[i].id;
                            datalist[i]['longitude'] = _list[i].lng;
                            datalist[i]['latitude'] = _list[i].lat;
                            datalist[i]['title'] = _list[i].title;
                            datalist[i]['address'] = _list[i].address;
                            datalist[i]['tel'] = _list[i].tel;
                            datalist[i]['url'] = _list[i].url;
                            datalist[i]['cover_pic'] = _list[i].logo;

                            var poi = new google.maps.LatLng(parseFloat(_list[i].lat), parseFloat(_list[i].lng));
							var marker = new google.maps.Marker({
								position: poi,
								map: map,
								business_id: _list[i].id,
								title: _list[i].title,
								address: _list[i].address,
								cover_pic: _list[i].logo,
								tel: _list[i].tel,
								url: _list[i].url
							});

							markersArr.push(marker);
							markersArr2.push(marker);
							
							marker.addListener('click', function() {
								var infowincontent = '<div class="goBubble" data-id="' + this.business_id + '"><div class="bubble-wrap"><a target="_blank" href="' + this.url + '"><div class="bubble-inner"><div class="img"><img src="' + this.cover_pic + '"></div><div class="info"> <p class="name">' + this.title + '</p><p class="tel"><i></i>' + this.tel + '</p><p class="dres">地址：' + this.address + '</p></div><span class="btn">商家店铺</span></div></a><i class="arrow"></i></div></div>';
								infoWindow.setContent(infowincontent);

								infoWindow.open(map, this);
							});
                        }

                        var allPage = data.info.pageInfo.totalPage;
                        
                        $(".business-list .loading, .business-list .loading-min").remove();
                        list.mCustomScrollbar("update");
                        
                        if(total_count == 0){
							$(".business-list").html('<p class="empty">很抱歉，没有找到合适的商家，请重新查找</p>');
							list.mCustomScrollbar("update");
							return;
                        }

                        
                        //到达最后一页中止
						if(loupanPage == allPage){
							allLoad = true;
							//return;
						}

						var loupanPageList = [];
						$.each(datalist, function(i, d){
							loupanPageList.push(init.replaceTpl(listTemplate.building, d));
						});


						if(isNewList){
                            g_conf.districtData = datalist;
                            data = init.getVisarea(g_conf.districtData);
							list.mCustomScrollbar("scrollTo","top");
                            $(".business-list").html(loupanPageList.join(""));
						}else{
                            g_conf.districtData = datalist;
                            data = init.getVisarea(g_conf.districtData);
                            $(".business-list").append(loupanPageList.join(""));
						}

						list.mCustomScrollbar("update");


                    }else{
                        $(".business-list").html('<p class="empty">很抱歉，没有找到合适的商家，请重新查找</p>');
						list.mCustomScrollbar("update");
					}
                }
            });

            //markersArr2 用来接收infowindow的数组
			//鼠标经过
			list.delegate(".list-item", "mouseenter", function(){
				var t = $(this), index = t.index();
				var infowincontent = '<div class="goBubble" data-id="' + markersArr2[index].business_id + '"><div class="bubble-wrap"><a target="_blank" href="' + markersArr2[index].url + '"><div class="bubble-inner"><div class="img"><img src="' + markersArr2[index].cover_pic + '"></div><div class="info"> <p class="name">' + markersArr2[index].title + '</p><p class="tel"><i></i>' + markersArr2[index].tel + '</p><p class="dres">地址：' + markersArr2[index].address + '</p></div><span class="btn">商家店铺</span></div></a><i class="arrow"></i></div></div>';
				infoWindow.setContent(infowincontent);				
				infoWindow.open(map, markersArr2[index]);				

            });
            //鼠标滑出
			list.delegate(".list-item", "mouseleave", function(){
				var t = $(this), index = t.index();
				var infowincontent = '<div class="goBubble" data-id="' + markersArr2[index].business_id + '"><div class="bubble-wrap"><a target="_blank" href="' + markersArr2[index].url + '"><div class="bubble-inner"><div class="img"><img src="' + markersArr2[index].cover_pic + '"></div><div class="info"> <p class="name">' + markersArr2[index].title + '</p><p class="tel"><i></i>' + markersArr2[index].tel + '</p><p class="dres">地址：' + markersArr2[index].address + '</p></div><span class="btn">商家店铺</span></div></a><i class="arrow"></i></div></div>';
				infoWindow.setContent(infowincontent);				
				infoWindow.close();				

            });			

		}
		//更新地图状态
        ,updateOverlays: function(type){

            //如果拖拽，则更新地图
            if(type == 'drag' || type == 'zoom'){
            	loupanPage=1;
            	isNewList = true;
            	init.getBusinessPageList();
            }

            
       
        }
		//获取地图可视区域范围
        ,getBounds: function(){
            var e = map.getBounds();
            var eBounds =  JSON.parse(JSON.stringify(e));
            var swLat = eBounds.south,
            nrLat = eBounds.north,
            swLng = eBounds.west,
            nrLng = eBounds.east;
            return {
                min_longitude: swLng,
                max_longitude: nrLng,
                min_latitude: swLat,
                max_latitude: nrLat
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
						url: "/include/ajax.php?service=business&action=blist",
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
					init.getBusinessPageList();
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
				g_conf.keywords = val;
                loupanPage=1;
                isNewList = true;
				init.getBusinessPageList();
			});

		}

		//加载分类
		,classified: function(){
            $('.qu li').click(function(){
                var id = $(this).attr('data-id');
                var catname = $(this).text();
                if(id==''){
                    $('.qu_btn span').html(catname);
                    $('.filter').toggleClass('show');
                    g_conf.typeid = '';
                    loupanPage=1;
                    isNewList = true;
				    init.getBusinessPageList();
                }else{
                    g_conf.typeid = id;
                    loupanPage=1;
                    isNewList = true;
                    init.getBusinessPageList();
                    $.ajax({
                        url: masterDomain+"/include/ajax.php?service=business&action=type",
                        dataType: "jsonp",
                        data:{
                            type: id
                        },
                        success: function(data) {
                            if(data && data.state == 100){
                                var list = data.info, html = [];
                                html.push('<li data-id="'+id+'">全部</li>');
                                for(var i=0; i<list.length; i++){
                                    html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
                                }
                                $('.catelist-item').html(html.join(''));
                            }else{
                                $('.qu_btn span').html(catname);
                                $('.filter').toggleClass('show');
                                g_conf.typeid = id;
                                loupanPage=1;
                                isNewList = true;
                                init.getBusinessPageList();
                            }
                        }
                    });
                }
            });

            //二级分类
            $(".catelist-item").delegate("li","click",function(){
              	$(this).addClass('clik');
                $(this).siblings().removeClass('clik');
                $('.filter').toggleClass('show');
                var catname = $(this).text();
                $('.qu_btn span').html(catname);
                var id = $(this).attr('data-id');
                g_conf.typeid = id;
                loupanPage=1;
                isNewList = true;
                init.getBusinessPageList();
            });
        }


	}


	//列表模板
	var listTemplate = {

			//楼盘列表
			building: '<div data-id="${business_id}" class="list-item fn-clear"><a target="_blank" href="${url}"><div class="img"><img src="${cover_pic}" alt=""></div><div class="info"><p class="name">${title}</p><p class="dres">地址：${address}</p></div></a></div>',

			//户型楼盘信息
			longpanOnly: '<a href="javascript:;"class="closehx"title="关闭户型">&times;</a><dl class="loupan fn-clear"title="${resblock_name}"><a href="${url}"target="_blank"><dt><img src="${cover_pic}"></dt><dd><h2>${resblock_name}</h2><p>${loupan_addr}</p><p>${house_type}</p><p class="price">均价${priceTpl}</p></dd></a></dl><p class="hcount">共有<strong>${hxcount}</strong>个户型</p><div class="con"><div class="hx-list">${hx}</div></div>',

			//户型列表
			hxlist: '<dl class="fn-clear"><a href="${url}"target="_blank"><dt><img src="${frame_pic}"/><span>${frame_name}</span></dt><dd><h3>${room_num} ${build_area}㎡ 朝${direction}</h3><p>${note}</p></dd></a></dl>'
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
