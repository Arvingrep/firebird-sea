$(function () {

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
    

    var map, filterData,allLoad = false, list = $(".listes"), init = {

        //替换模板关键字
        replaceTpl: function(template, data, allowEmpty, chats){
            var regExp;
            chats = chats || ['\\$\\{', '\\}'];
            regExp = [chats[0], '([_\\w]+[\\w\\d_]?)', chats[1]].join('');
            regExp = new RegExp(regExp, 'g');
            return template.replace(regExp, function (s, s1) {
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

            //收起/展开侧栏
            $(".map-os").bind("click", function(){
                var t = $(this), sidebar = $(".sidebar");
                t.hasClass("tran") ? (sidebar.stop().animate({"left": 0}, 150), t.attr("title", "收起左栏"), t.removeClass("tran"), $("#"+g_conf.mapWrapper).animate({"left": "360px"}, 150)) : (sidebar.stop().animate({"left": "-360px"}, 150), t.attr("title", "展开左栏"), t.addClass("tran"), $("#"+g_conf.mapWrapper).animate({"left": "0"}, 150));
            });

          
            //初始加载
            //init.getBusinessData("tilesloaded");
            init.getBusinessPageList();

            init.search();
            init.classified();


            map.addEventListener("zoomend", function() {
                init.updateOverlays("zoom");
            });

            map.addEventListener("dragend", function() {
				init.updateOverlays("drag");
			});

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
                        }

                    }

                    //g_conf.districtData = districtData;
                    //init.doNext(type);
                    g_conf.districtData = districtData;
                    data = init.getVisarea(g_conf.districtData);
                    init.createBubble(data, bubbleTemplate[1], 1);  

                }
            });


           

        }


        //加载完成执行下一步
        ,doNext: function(type){
            if(g_conf.districtData){
                init.updateOverlays(type);
            }
        }

        //更新地图状态
        ,updateOverlays: function(type){

            if(type == "tilesloaded"){
                map.centerAndZoom(g_conf.cityName, g_conf.minZoom);
            }

 
            //如果拖拽，则更新地图
            if(type == 'drag' || type == 'zoom'){
                loupanPage=1;
                isNewList = true;
                init.getBusinessPageList();
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
        ,createBubble: function(data, temp, resize, more,clear){

            if(!clear){
                init.cleanBubble();
            }
            

            //点击气泡
            $('#map').delegate('.bubble .cycle', 'click', function(){
                $('.bubble-wrap').hide();
                $(this).siblings('.bubble .bubble-wrap').show();
                return false;
            });

            //经过气泡
            $('#map').delegate('.bubble .cycle', 'mouseover', function(e){
                console.log(e);
                
                $('.bubble-wrap').hide();
                $(this).siblings('.bubble .bubble-wrap').show();
                return false;
            });


            //$('#map').delegate('.bubble-wrap', 'click', function(){
                //return false;
            //});

            //点击空白
            $('body').click(function(){
                $('.bubble-wrap').hide();
            });

            $.each(data,    function(e, o) {
                var bubbleLabel, r = [];
                if(more){
                    //o.priceTpl = '<span class="price">' + o.average_price ? (o.average_price + '</span><i>' + (o.ptype == 1 ? echoCurrency('short')+"/m²" : "万"+echoCurrency('short')+"/套") + '</i>') : "价格待定</span>";
                    o.moreTpl = init.replaceTpl(more, o);

                }

                bubbleLabel = new BMap.Label(init.replaceTpl(temp, o), {
                    position: new BMap.Point(o.longitude, o.latitude),
                    offset: bubbleMapSize[resize]()
                });

                /* bubbleLabel.addEventListener("mouseover", function() {
                    this.setStyle({zIndex: "4"});
                });

                bubbleLabel.addEventListener("mouseout", function() {
                    this.setStyle({zIndex: "2"});
                }); */

                bubbleLabel.setStyle(bubbleStyle);
                map.addOverlay(bubbleLabel);

            });

            
            if(!clear){
                init.mosaicBusinessList(data);
            }
        }

        //删除地图气泡
        ,cleanBubble: function(){
            map.clearOverlays();
        }

        //拼接楼盘列表
		,mosaicBusinessList: function(data){

			//如果是点击的楼盘列表，则不更新楼盘列表内容
			//if(isClickHx) return false;


			if(data.length == 0){
				$(".business-list").html('<p class="empty">很抱歉，没有找到合适的商家，请重新查找</p>');
				return;
            }

			isNewList = true;
            loupanPage = 1;
            
            var loupanList = [];
            $.each(data, function(i, d){
                loupanList.push(init.replaceTpl(listTemplate.building, d));
            });

            if(isNewList){
                list.mCustomScrollbar("scrollTo","top");
                $(".business-list").html(loupanList.join(""));
            }else{
                $(".business-list").append(loupanList.join(""));
            }

            //init.getBusinessPageList();
            
            
		}


		//获取指定分页的楼盘列表
        ,getBusinessPageList: function(){//data
            allLoad = false;
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
                            init.createBubble(data, bubbleTemplate[1], 1);

							list.mCustomScrollbar("scrollTo","top");
                            $(".business-list").html(loupanPageList.join(""));
						}else{
                            g_conf.districtData = datalist;
                            data = init.getVisarea(g_conf.districtData);
                            init.createBubble(data, bubbleTemplate[1], 1,'',1);
                            $(".business-list").append(loupanPageList.join(""));
						}

						list.mCustomScrollbar("update");


                    }else{
                        $(".business-list").html('<p class="empty">很抱歉，没有找到合适的商家，请重新查找</p>');
                        init.cleanBubble();
						list.mCustomScrollbar("update");
					}
                }
            });

            //鼠标经过
			list.delegate(".list-item", "mouseenter", function(){

				var t = $(this), id = t.attr("data-id");
				if(id){
                    var bubble = $(".bubble[data-id='" + id + "']");
                    bubble.children('.bubble-wrap').show();
				}

            });
            
			list.delegate(".list-item", "mouseleave", function(){

				var t = $(this), id = t.attr("data-id");
				if(id){
                    var bubble = $(".bubble[data-id='" + id + "']");
                    bubble.children('.bubble-wrap').hide();
				}

			});

			/* loupanPageData = data;

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
					//d.priceTpl = d.average_price ? '<strong>'+d.average_price+'</strong>'+(d.ptype == 1 ? '元/m²' : '万元/套') : '<strong>价格待定</strong>';
				loupanList.push(init.replaceTpl(listTemplate.building, d));
			});


			if(isNewList){
				list.mCustomScrollbar("scrollTo","top");
				$(".business-list").html(loupanList.join(""));
			}else{
				$(".business-list").append(loupanList.join(""));
			}

            list.mCustomScrollbar("update");
            
            //鼠标经过
			list.delegate(".list-item", "mouseover", function(){

				var t = $(this), id = t.attr("data-id");
				if(id){
                    var bubble = $(".bubble[data-id='" + id + "']");
                    bubble.children('.bubble-wrap').show();
					//bubble.parent().css({zIndex: 4});
					//bubble.addClass("hover");
				}

			});
			list.delegate(".list-item", "mouseout", function(){

				var t = $(this), id = t.attr("data-id");
				if(id){
                    var bubble = $(".bubble[data-id='" + id + "']");
                    bubble.children('.bubble-wrap').hide();
					//bubble.parent().css({zIndex: 2});
					//bubble.removeClass("hover");
				}

			}); */

        }
        
        //加载搜索
		,search: function(){

			$("#skey").autocomplete({
				source: function(request, response) {
					$.ajax({
						url: masterDomain+"/include/ajax.php?service=business&action=blist",
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
                    loupanPage=1;
                    isNewList = true;
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


    //气泡偏移
    var bubbleMapSize = {
            1 : function() {
                return new BMap.Size(-46, -46)
            }
        }

        //气泡模板
        ,bubbleTemplate = {

            //区域
            1 : '<div class="bubble bubble-1" data-id="${business_id}"><div class="bubble-wrap"><a target="_blank" href="${url}"><div class="bubble-inner fn-clear"><div class="img"><img src="${cover_pic}"></div><div class="info"> <p class="name">${title}</p><p class="dres">地址：${address}</p></div><span class="btn">商家店铺</span></div></a><i class="arrow"></i></div><p class="cycle"></p></div>',

        }

        //列表模板
        ,listTemplate = {
            //楼盘列表
            building : '<div data-id="${business_id}" class="list-item fn-clear"><a target="_blank" href="${url}"><div class="img"><img src="${cover_pic}" alt=""></div><div class="info"><p class="name">${title}</p><p class="dres">地址：${address}</p></div></a></div>'

        }

        //气泡样式
        ,bubbleStyle = {
            color: "#fff",
            borderWidth: "0",
            padding: "0",
            zIndex: "2",
            backgroundColor: "transparent",
            fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
        }

        ,isClickHx = false   //是否点击了户型
        ,isNewList = false   //是否为新列表
        ,loupanPage = 1      //楼盘数据当前页
        ,loupanChooseData    //查看户型的楼盘数据
       ;     
       g_conf.districtData = [];


    init.createMap();



    


});