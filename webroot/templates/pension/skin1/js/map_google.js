$(function(){

	var map, filterData, infoWindow, isload, markersArr = [], list = $(".yl_list"), init = {

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

            if(isload) return;
            isload = true;

			//收起/展开侧栏
			$(".map-os").bind("click", function(){
				var t = $(this), sidebar = $(".sidebar");
				t.hasClass("open") ? (sidebar.stop().animate({"left": 0}, 150), t.attr("title", "收起左栏"), t.removeClass("open"), $("#"+g_conf.mapWrapper).animate({"left": "325px"}, 150)) : (sidebar.stop().animate({"left": "-324px"}, 150), t.attr("title", "展开左栏"), t.addClass("open"), $("#"+g_conf.mapWrapper).animate({"left": "0"}, 150));
			});

			//加载区域和类型
			init.sortby();
			init.placeby();

			init.getLoupanData();

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

			var data = "&catid="+g_conf.orderby+"&addrid="+g_conf.placeby;

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

							var poi = new google.maps.LatLng(parseFloat(list[i].lat), parseFloat(list[i].lng));
							var marker = new google.maps.Marker({
								position: poi,
								map: map,
								title: list[i].title,
								longitude: list[i].lng,
								latitude: list[i].lat,
								address: list[i].address,
								ptype: list[i].ptype,
								store_tel: list[i].tel,
								cover_pic: list[i].litpic,
								average_price: list[i].price,
								url: list[i].url
							});

							markersArr.push(marker);

							marker.addListener('click', function() {
								var infowincontent = '<div class="bubble-wrap"><div class="bubble-inner"><div class="num fn-clear"><div class="map_img2"><a href="' + this.url + '"target="_blank"><img src="' + this.cover_pic + '"/></a></div>';
								infowincontent += '<div class="map2_con"><p class="map2_tit"><a href="' + this.url + '"target="_blank">' + this.title + '</a></p><p class="map2_info">' + this.address + '</p><p class="price">'+echoCurrency('symbol')+'<strong>' + this.average_price + '</strong>起</p></div></div></div><i class="arrow"><i class="arrow-i"></i></i></div>';
								infowincontent += '<p class="cycle"></p>';
								infoWindow.setContent(infowincontent);
								infoWindow.open(map, this);
							});


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


	//列表模板
	var listTemplate = {

			//养老列表1 最开始左侧边栏
			building: '<dl class="fn-clear"data-id="${id}"data-lng="${longitude}"data-lat="${latitude}"title="${resblock_name}"><dt><a href="${url}"target="_blank"><img src="${cover_pic}"/></a></dt><dd><h2><a href="${url}"target="_blank">${resblock_name}</a></h2><p>${loupan_addr}</p><p>${store_tel}</p><p class="price">'+echoCurrency('symbol')+'${priceTpl}</p></dd></dl>',

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
