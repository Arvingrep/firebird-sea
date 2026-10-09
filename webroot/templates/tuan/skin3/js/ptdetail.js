$(function(){
    /* 内层图片滚动切换 */
    $(".slideGroup .slideBox").slide({ mainCell:"ul",vis:5,prevCell:".sPrev",nextCell:".sNext",effect:"leftLoop"});


    $("img").scrollLoading();

    // //生成二维码
    // $("#qrcode,.qrcode").qrcode({
    //     render: window.applicationCache ? "canvas" : "table",
    //     width: 105,
    //     height: 105,
    //     text: huoniao.toUtf8(window.location.href)
    // });

	//导航全部分类
	$(".lnav").hover(function(){
		$(this).find(".category-popup").show();
	}, function(){
		$(this).find(".category-popup").hide();
	});

	//图集幻灯
    //大图切换
    $(".game163").slide({ titCell:".smallImg li", mainCell:".bigImg", switchLoad: "_src",effect:"fold", autoPlay:true,delayTime:200});
    //小图左滚动切换
    $(".game163 .smallScroll").slide({ mainCell:"ul",delayTime:100,vis:4,effect:"left",autoPage:true,prevCell:".sPrev",nextCell:".sNext" });

	//跳至评价区域
	$(".summary .comments").bind("click", function(){
		$(".fixnav li:last a").click();
	});
    // $(".l .imgctrl").slide({ mainCell:"ul",vis:4,prevCell:".prevctrl",nextCell:".nextctrl",effect:"leftLoop"});

	//倒计时
	var now = date[0], stime = date[1], etime = date[2], state = 1, summary = $(".summary"), btns = summary.find(".btns"), expiry = summary.find(".expiry");
	//还未开始
	if(now < stime){
		state = 2;
		btns.find(".link-buy").html("还未开始");
		btns.find(".link-open").hide();
	//已结束
	}else if(now > etime){
		state = 3;
		btns.find(".link-buy").html("已结束");
		btns.find(".link-open").hide();
	}
	if(state > 1)	btns.find("a").addClass("disabled"),btns.find(".link-add").hide();
    if(state > 1)	btns.find("a").addClass("disabled"),btns.find(".link-open").hide();

	var timeCompute = function (a, b) {
		if (this.time = a, !(0 >= a)) {
			for (var c = [86400 / b, 3600 / b, 60 / b, 1 / b], d = .1 === b ? 1 : .01 === b ? 2 : .001 === b ? 3 : 0, e = 0; d > e; e++) c.push(b * Math.pow(10, d - e));
			for (var f, g = [], e = 0; e < c.length; e++) f = Math.floor(a / c[e]),
			g.push(f),
			a -= f * c[e];
			return g
		}
	}
	,CountDown =	function(a) {
		this.time = a,
		this.countTimer = null,
		this.run = function(a) {
			var b, c = this;
			this.countTimer = setInterval(function() {
				b = timeCompute.call(c, c.time - 1, 1);
				b || (clearInterval(c.countTimer), c.countTimer = null);
				"function" == typeof a && a(b || [0, 0, 0, 0, 0], !c.countTimer)
			}, 1000);
		}
	};

	var begin = stime - now;
	var end   = etime - now;
	var time  = begin > 0 ? begin : end > 0 ? end : 0;

	var timeTypeText = '距开始';
	if(begin < 0 && end < 0 ){
		timeTypeText = '距离结束';
	}else if (begin > 0 && end > 0) {
		timeTypeText = '距开始';
	} else if(begin < 0 && end > 0) {
		timeTypeText = '距离结束';
	}
	var countDown = new CountDown(time);
	countDownRun();

	function countDownRun(time) {
		time && (countDown.time = time);
		countDown.run(function(times, complete) {
			var html = '<span>'+timeTypeText+'</span>'+'<em>'+times[1] +
			'</em><em>' + times[2] +
			'</em><em>' + times[3] + '</em>';
			expiry.html(html);
			if (complete) {
				if(begin < 0 && end < 0 ){
					btns.find("a").addClass("disabled"),btns.find(".link-add").hide();
					btns.find(".link-buy").html("已结束");
					btns.find(".link-open").hide();
				}else if (begin > 0) {
					btns.find("a").removeClass("disabled"),btns.find(".link-add").show();
					btns.find(".link-buy").html("立即抢购");
					btns.find(".link-open").show();
					timeTypeText = '距离结束';
					countDownRun(etime - stime);
					begin = null;
				} else {
					btns.find("a").addClass("disabled"),btns.find(".link-add").hide();
					if( begin === null || begin <= 0 ){
						btns.find(".link-buy").html("已结束");
						btns.find(".link-open").hide();
					}else{
						btns.find(".link-buy").html("还未开始");
						btns.find(".link-open").hide();
					}
				}
			}
		});
	}



	//数量增加、减少
	var timout = null;
	$(".counter button").bind("click", function(){
		var type = $(this).attr("class"), inp = $("#count"), val = Number(inp.val()), tips = $(".counter .tips");

		//减少
		if(type == "minus"){
			if(val <= 1){
				tips.html("最少 1 件起售").show();
				setTimeout(function(){
					tips.fadeOut(300, function(){
						tips.html("");
					});
				}, 5000);
				return false;
			}
			inp.val(val-1);


		//增加
		}else if(type == "add"){
			if(val > maxCount){
				tips.html("每人最多只能购买 "+maxCount+" 单").show();
				timout != null ? clearTimeout(timout) : "";
				timout = setTimeout(function(){
					tips.fadeOut(300, function(){
						tips.html("");
					});
				}, 5000);
				return false;
			}
			inp.val(val+1);

		}
	});

	$("#count").bind("input", function(){
		checkCount();
	});


	//验证数量
	function checkCount(){
		var count = $("#count"), val = Number(count.val()), tips = $(".counter .tips");

		//最小
		if(val < 1){
			tips.html("最少 1 件起售").show();
			timout != null ? clearTimeout(timout) : "";
			timout = setTimeout(function(){
				tips.fadeOut(300, function(){
					tips.html("");
				});
			}, 5000);
			return false;

		//最大
		}else if(val > maxCount){
			tips.html("每人最多只能购买 "+maxCount+" 单").show();
			timout != null ? clearTimeout(timout) : "";
			timout = setTimeout(function(){
				tips.fadeOut(300, function(){
					tips.html("");
				});
			}, 5000);
			return false;

		}else{
			return true;
		}
	}

	//立即抢购
	$(".link-buy").bind("click", function(event){
		if($(this).hasClass("disabled")) return false;
		if(!checkCount()){
			event.preventDefault();
			return false;
		}
		var url = $(this).data("url");
		if(url && url != undefined){
			url = url.replace("%count%", $("#count").val());
			location.href = url;
		}
	});

	//我要开团
	$(".link-open").bind("click", function(event){
		if($(this).hasClass("disabled")) return false;
		if(!checkCount()){
			event.preventDefault();
			return false;
		}
		var url = $(this).data("url");
		if(url && url != undefined){
			url = url.replace("%count%", $("#count").val());
			location.href = url;
		}
	});

	//加入购物车
	$(".link-add").bind("click", function(event){
		// 登陆验证
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain + '/login.html';
			return false;
		}

		if($(this).hasClass("disabled")) return false;
		if(!checkCount()){
			event.preventDefault();
			return false;
		}
		var t = $(this).offset(),
				scH = $(window).scrollTop(),
				offset = $('#glocart .cartpop b').offset(),
				flyer = $('<img class="cartflyer" src="'+detailThumb+'" />');
		flyer.fly({
			start: {
				left: t.left + 70,
				top: t.top - scH - 15
			},
			end: {
				left: offset.left,
				top: offset.top - scH,
				width: 20,
				height: 20
			},
			onEnd: function(){

				var $i = $("<b class='flyend'>").text("1");
				var x = offset.left, y = offset.top;
				$i.css({top: y - 10, left: x});

				setTimeout(function(){
					$("body").append($i);
					$i.animate({top: y - 50, opacity: 0}, 1500, function(){
						$i.remove();
					});
				}, 300);

				this.destroy();

				//操作购物车
				var data = [];
				data.id = detailID;
				data.title = detailTitle;
				data.thumb = detailThumb;
				data.price = detailPrice;
				data.count = $("#count").val();
				data.url   = detailUrl;
				tuanInit.add(data);
			}
		});
		return false;
	});

	//收藏
	$(".favorite").bind("click", function(){
		var t = $(this), type = "add", oper = "+1", txt = "已收藏";

		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}

		if(!t.hasClass("curr")){
			t.addClass("curr");
		}else{
			type = "del";
			t.removeClass("curr");
			oper = "-1";
			txt = "收藏";
		}

		var $i = $("<b>").text(oper);
		var x = t.offset().left, y = t.offset().top;
		$i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
		$("body").append($i);
		$i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 2000, function(){
			$i.remove();
		});

		t.html("<s></s>"+txt);

		$.post("/include/ajax.php?service=member&action=collect&module=tuan&temp=detail&type="+type+"&id="+detailID);

	});


	//二维码效果
	$(".summary .morder").hover(function(){
		$(this).addClass("hide");
	}, function(){
		$(this).removeClass("hide");
	});

	//二维码
	$("#qrcode").qrcode({
		render: window.applicationCache ? "canvas" : "table",
		width: 115,
		height: 115,
		text: huoniao.toUtf8(window.location.href)
	});


	//其他团购
	$(".other-biz li").length > 0 ? $(".other-biz").show() : "";

	//内容导航
	var win = $(window), modList = $(".container"), fixnav = modList.find(".con-nav");
	$(window).scroll(function() {
		var stop = win.scrollTop();
		stop > modList.offset().top && stop < modList.offset().top + modList.height() - 100 ? fixnav.addClass("fixed") : fixnav.removeClass("fixed");
	});

	//地图
	var lnglat = $("#map").data("lnglat").split(",");

	if(site_map == "baidu"){
		var map = new BMap.Map("map", {enableMapClick: false});
		map.addControl(new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_LEFT, type: BMAP_NAVIGATION_CONTROL_ZOOM}));
		map.disableScrollWheelZoom();  //禁用滚轮放大缩小
		var point = new BMap.Point(lnglat[0],lnglat[1]);
		map.centerAndZoom(point, 16);
		var marker = new BMap.Marker(point);
		marker.addEventListener("click", showIntactMap); //点击坐标点
		map.addOverlay(marker);

	}else if(site_map == "google"){
		//加载地图事件
		function initialize() {
			var map = new google.maps.Map(document.getElementById('map'), {
				zoom: 14,
				center: new google.maps.LatLng(parseFloat(lnglat[1]), parseFloat(lnglat[0])),
				zoomControl: true,
				mapTypeControl: false,
				streetViewControl: false,
				zoomControlOptions: {
					style: google.maps.ZoomControlStyle.SMALL
				}
			});

			var infowindow = new google.maps.InfoWindow({
	          content: '<div style="font-weight: 700; font-size: 16px;">' + detailTitle + '</div>'
	        });

			var marker = new google.maps.Marker({
				position: {lat: parseFloat(lnglat[1]), lng: parseFloat(lnglat[0])},
				map: map,
				title: detailTitle
			});
			marker.addListener('click', function() {
				infowindow.open(map, marker);
			});
		}

		google.maps.event.addDomListener(window, 'load', initialize);
	}else if (site_map == "amap") {

		var mapObj,toolBar,MGeocoder,mar;

		//初始化地图对象，加载地图
		mapObj = new AMap.Map("map",{
	      //二维地图显示视口
	      view: new AMap.View2D({
	          center: new AMap.LngLat(lnglat[0],lnglat[1]),//地图中心点
	          zoom: 13 //地图显示的缩放级别
	      })
	  });

		//在地图中添加ToolBar插件
		mapObj.plugin(["AMap.ToolBar"],function(){
				toolBar = new AMap.ToolBar({position: 'RB'});
				toolBar.show();
				toolBar.showDirection();
				toolBar.hideRuler();
				mapObj.addControl(toolBar);
		});

		//添加地图类型切换插件
	    mapObj.plugin(["AMap.MapType"],function(){
	        //地图类型切换
	        var mapType= new AMap.MapType({
	            defaultType:0//默认显示地图
	        });
	        mapObj.addControl(mapType);
	    });

		//配置marker图标
		var markerOption = {
			map: mapObj,
				draggable:true,   //点标记可拖拽
				cursor:'move',    //鼠标悬停点标记时的鼠标样式
				raiseOnDrag:true, //鼠标拖拽点标记时开启点标记离开地图的效果
				offset:new AMap.Pixel(-32,-64), //标记显示位置偏移量

			icon:new AMap.Icon({  //复杂图标
							size:new AMap.Size(64,64),  //图标大小
							image:"/static/images/mark_ditu.png" //图标地址
					})
		};

		//自定义地图配置
		//如果经、纬度都为0则设置城市名为中心点
		if(lnglat[0] == 0 && lnglat[1] == 0){

			//根据地址解析
			if(city != ""){
				var address = city;
				if(addr != "") address = addr;

				//加载地理编码插件
			    mapObj.plugin(["AMap.Geocoder"], function() {       
			        MGeocoder = new AMap.Geocoder({
			            city: city
			        });
			        //返回地理编码结果
			        AMap.event.addListener(MGeocoder, "complete", geocoder_CallBack);
			        //地理编码
			        MGeocoder.getLocation(address);
			    });

			//如果城市为空，地图默认显示用户当前城市范围
			}else{
				mapObj = new AMap.Map("map");

			}

		}else{
			addmarker(lnglat[0], lnglat[1]);
		}

	    
		function addmarker(lngX, latY) {
			mar ? mar.setMap(null) : "";  //清除地图上已有的marker
				markerOption.position = new AMap.LngLat(lngX, latY); //设置marker的坐标位置
				mar = new AMap.Marker(markerOption);   //向地图添加marker
				new AMap.LngLat(lngX, latY);
				//mapObj.setZoom(14);
		}

	}else if (site_map == "qq") {

		var mapOptions = {
			zoom: 14,
			center: new qq.maps.LatLng(lnglat[1], lnglat[0]),
			zoomControl: true,
			zoomControlOptions: {
				style: qq.maps.ZoomControlStyle.SMALL,
				position: qq.maps.ControlPosition.RIGHT_BOTTOM
			},
			panControlOptions: {
				position: qq.maps.ControlPosition.RIGHT_BOTTOM
			}
		};

		var map = new qq.maps.Map(document.getElementById("map"), mapOptions);
		var anchor = new qq.maps.Point(32, 64);
		var size = new qq.maps.Size(64, 64);
		var origin = new qq.maps.Point(0, 0);
		var myIcon = new qq.maps.MarkerImage('/static/images/mark_ditu.png', size, origin, anchor);

		var marker = new qq.maps.Marker({
			icon: myIcon,
			position: mapOptions.center,
			animation: qq.maps.MarkerAnimation.DROP,
			map: map
		});

		function initialize() {

			//如果经、纬度都为0则设置城市名为中心点
			if(lnglat[0] == 0 && lnglat[1] == 0){

				//根据地址解析
				if(city != ""){
					var address = city;
					if(addr != "") address = address + addr;
					var geocoder = new qq.maps.Geocoder({
						complete : function(result){
							var location = result.detail.location;
							map.setCenter(location);
							mapOptions.center = new qq.maps.LatLng(location.lat, location.lng);
							setMark();
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

			}else{
				// setMark();
			}

		}

		initialize();

	}

	//点击显示完整地图
	var sinfo = null;
	$(".showbig").bind("click", function(){
		if($(this).text().indexOf("公交") > -1){
			sinfo = 1;
		}else{
			sinfo = null;
		}
		showIntactMap();
	});

	//显示完整地图
	var intactMap = null;
	function showIntactMap(){

		var storeObj = $(".bus-addr .r"),
				stitle   = storeObj.find("h3").html(),
				scontent = [];
		storeObj.find(".r1").each(function(){
			scontent.push('<p>'+$(this).html()+'</p>');
		});

		intactMap != null ? intactMap.show() : intactMap = $.dialog({
			id: "showIntactMap",
			fixed: true,
			title: "查看完整地图",
			content: '<div class="showIntactMap" id="intactMap"></div><div class="j-search-result"></div>',
			width: 1000,
			close: function () {
				this.hide();
				return false;
			}
		});

		var bigmap = new BMap.Map("intactMap");
		bigmap.centerAndZoom(point, 16);
		var bigmarker = new BMap.Marker(point);
		bigmap.addOverlay(bigmarker);

		var content = scontent.join("");

    //创建检索信息窗口对象
    var searchInfoWindow = null;
		searchInfoWindow = new BMapLib.SearchInfoWindow(bigmap, content, {
				title  : stitle,      //标题
				width  : 350,             //宽度
				height : 125,              //高度
				panel  : "j-search-result",         //检索结果面板
				enableAutoPan : true,     //自动平移
				enableSendToPhone: false, //隐藏发送到手机按钮
				searchTypes   :[
					BMAPLIB_TAB_TO_HERE,  //到这里去
					BMAPLIB_TAB_FROM_HERE, //从这里出发
					BMAPLIB_TAB_SEARCH   //周边检索
				]
			});

		bigmarker.addEventListener("click", function(e){
	    searchInfoWindow.open(bigmarker);
    });

		//如果是点击公交、驾车链接则自动打开信息窗口
		sinfo != null ? searchInfoWindow.open(bigmarker) : "";
	}



	var isClick = 0; //是否点击跳转至锚点，如果是则不监听滚动
	//左侧导航点击
	$(".fixnav a").bind("click", function(){
		isClick = 1; //关闭滚动监听
		var t = $(this), parent = t.parent(), index = parent.index(), theadTop = $(".con-tit:eq("+index+")").offset().top - 15;
		parent.addClass("current").siblings("li").removeClass("current");
		$('html, body').animate({
         	scrollTop: theadTop
     	}, 300, function(){
     		isClick = 0; //开启滚动监听
     	});
	});

	//滚动监听
	$(window).scroll(function(){
		if(isClick) return false;  //判断是否点击中转中...
		var scroH = $(this).scrollTop();
		var theadLength = $(".con-tit").length;
		$(".fixnav li").removeClass("current");

		$(".con-tit").each(function(index, element){
			var offsetTop = $(this).offset().top;
			if(index != theadLength-1){
				var offsetNextTop = $(".con-tit:eq("+(index+1)+")").offset().top - 30;
				if(scroH < offsetNextTop){
					$(".fixnav li:eq("+index+")").addClass("current");
					return false;
				}
			}else{
				$(".fixnav li:last").addClass("current");
				return false;
			}
		});
	});

	//初始点击定位当前位置
	$("html").delegate(".carousel .thumb li", "click", function(){
		var t = $(this), carousel = t.closest(".carousel"), album = carousel.find(".album");
		if(album.is(":hidden")){
			t.addClass("on");
			$('html, body').animate({scrollTop: carousel.offset().top - 45}, 300);
			album.show();
		}
	});

	//收起图集
	$("html").delegate(".carousel .close", "click", function(){
		var t = $(this), carousel = t.closest(".carousel"), thumb = carousel.find(".thumb"), album = carousel.find(".album");
		album.hide();
		thumb.find(".on").removeClass("on");
	});


	var isLoad = 0;

	//页面打开时默认不加载，当滚动条到达评论区域的时候再加载
	$(window).scroll(function(){
		var commentStop = $(".rating-review").offset().top;
		var windowStop = $(window).scrollTop();
		var windowHeight = $(window).height();
		if(windowStop + windowHeight >= commentStop && !isLoad){
			isLoad = 1;
			getComments();
		}
	});


	var atpage = 1, totalCount = 0, pageSize = 10;
	var ratelist = $(".ratelist"), loading = ratelist.find(".loading"), ul = $("#rateList");


	//筛选
	$(".review-list .filter li").bind("click", function(){
		var t = $(this);
		if(!t.hasClass("fn-right")){
			t.addClass("current").siblings("li").removeClass("current");
			atpage = 1;
			getComments();
		}
	});

	//排序
	$(".review-list .filter select").bind("change", function(){
			atpage = 1;
			getComments();
	});


	//获取评价
	function getComments(){
		loading.show();
		ul.html("");

		var data = [];
		data.push('id='+detailID);
		data.push('page='+atpage);
		data.push('pageSize='+pageSize);
		data.push('filter='+$(".review-list .filter .current").data("filter"));
		data.push('orderby='+$(".review-list .filter select").val());

		$.ajax({
			url: masterDomain+"/include/ajax.php?service=tuan&action=common",
			data: data.join("&"),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {
				loading.hide();
				if(data && data.state == 100){

					var list = data.info.list,
							pageinfo = data.info.pageInfo,
							html = [];

					totalCount = pageinfo.totalCount;
					for(var i = 0; i < list.length; i++){
						html.push('<li class="rate-item fn-clear">');
						html.push('<div class="user-info">');

						var photo = list[i].user.photo == "" ? staticPath+'images/noPhoto_40.jpg' : list[i].user.photo;

						html.push('<a href="'+masterDomain+'/user/'+list[i].user.id+'"><img class="avatar" src="'+photo+'" /></a>');
						html.push('<p><a href="'+masterDomain+'/user/'+list[i].user.id+'">'+list[i].user.nickname+'</a></p>');
						html.push('</div>');
						html.push('<div class="review">');
						html.push('<div class="info">');
						html.push('<s><i style="width: '+(list[i].rating * 20)+'%;"></i></s>');
						html.push('<span class="time">'+huoniao.transTimes(list[i].dtime, 2)+'</span>');
						html.push('</div>');
						html.push('<div class="view">');
						html.push('<p>'+list[i].content+'</p>');

						//图集
						var pics = list[i].pics;
						if(pics.length > 0){
							var thumbArr = [], albumArr = [];
							for(var p = 0; p < pics.length; p++){
								thumbArr.push('<li><a href="javascript:;"><img src="'+pics[p]+'" /></a></li>');
								albumArr.push('<div class="aitem"><i></i><img src="'+pics[p]+'" /></div>');
							}

							html.push('<div class="carousel">');
							html.push('<div class="thumb">');
							html.push('<div class="plist">');
							html.push('<ul>'+thumbArr.join("")+'<ul>');
							html.push('</div>');

							if(pics.length > 7){
								html.push('<a href="javascript:;" class="sprev"><i></i></a>');
								html.push('<a href="javascript:;" class="snext"><i></i></a>');
							}
							html.push('</div>');
							html.push('<div class="album">');
							html.push('<a href="javascript:;" hidefocus="true" class="prev"></a>');
							html.push('<a href="javascript:;" hidefocus="true" class="close"></a>');
							html.push('<a href="javascript:;" hidefocus="true" class="next"></a>');
							html.push('<div class="albumlist">'+albumArr.join("")+'</div>');
							html.push('</div>');
							html.push('</div>');
						}

						html.push('</div>');
						html.push('</div>');
						html.push('</li>');
					}

					ul.html(html.join(""));
					showPageInfo();

					//切换效果
					$(".ratelist").find(".carousel").each(function(){
						var t = $(this), album = t.find(".album");
						//大图切换
						t.slide({
							titCell: ".plist li",
							mainCell: ".albumlist",
							trigger:"click",
							autoPlay: false,
							delayTime: 0,
							startFun: function(i, p) {
								if (i == 0) {
									t.find(".sprev").click()
								} else if (i % 8 == 0) {
									t.find(".snext").click()
								}
							}
						});
						//小图左滚动切换
						t.find(".thumb").slide({
							mainCell: "ul",
							delayTime: 300,
							vis: 10,
							scroll: 8,
							effect: "left",
							autoPage: true,
							prevCell: ".sprev",
							nextCell: ".snext",
							pnLoop: false
						});
					});
					$(".carousel .thumb li.on").removeClass("on");

				}else{
					ul.html('<li class="empty">'+data.info+'</li>');
				}
			},
			error: function(){
				loading.hide();
				ul.html('<li class="empty">网络错误，加载失败！</li>');
			}
		});
	}


	//打印分页
	function showPageInfo() {
		var info = $(".ratelist .pagination");
		var nowPageNum = atpage;
		var allPageNum = Math.ceil(totalCount/pageSize);
		var pageArr = [];

		info.html("").hide();

		var pages = document.createElement("div");
		pages.className = "pagination-pages fn-clear";
		info.append(pages);

		//拼接所有分页
		if (allPageNum > 1) {

			//上一页
			if (nowPageNum > 1) {
				var prev = document.createElement("a");
				prev.className = "prev";
				prev.innerHTML = '上一页';
				prev.onclick = function () {
					atpage = nowPageNum - 1;
					getComments();
				}
				info.find(".pagination-pages").append(prev);
			}

			//分页列表
			if (allPageNum - 2 < 1) {
				for (var i = 1; i <= allPageNum; i++) {
					if (nowPageNum == i) {
						var page = document.createElement("span");
						page.className = "curr";
						page.innerHTML = i;
					} else {
						var page = document.createElement("a");
						page.innerHTML = i;
						page.onclick = function () {
							atpage = Number($(this).text());
							getComments();
						}
					}
					info.find(".pagination-pages").append(page);
				}
			} else {
				for (var i = 1; i <= 2; i++) {
					if (nowPageNum == i) {
						var page = document.createElement("span");
						page.className = "curr";
						page.innerHTML = i;
					}
					else {
						var page = document.createElement("a");
						page.innerHTML = i;
						page.onclick = function () {
							atpage = Number($(this).text());
							getComments();
						}
					}
					info.find(".pagination-pages").append(page);
				}
				var addNum = nowPageNum - 4;
				if (addNum > 0) {
					var em = document.createElement("span");
					em.className = "interim";
					em.innerHTML = "...";
					info.find(".pagination-pages").append(em);
				}
				for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
					if (i > allPageNum) {
						break;
					}
					else {
						if (i <= 2) {
							continue;
						}
						else {
							if (nowPageNum == i) {
								var page = document.createElement("span");
								page.className = "curr";
								page.innerHTML = i;
							}
							else {
								var page = document.createElement("a");
								page.innerHTML = i;
								page.onclick = function () {
									atpage = Number($(this).text());
									getComments();
								}
							}
							info.find(".pagination-pages").append(page);
						}
					}
				}
				var addNum = nowPageNum + 2;
				if (addNum < allPageNum - 1) {
					var em = document.createElement("span");
					em.className = "interim";
					em.innerHTML = "...";
					info.find(".pagination-pages").append(em);
				}
				for (var i = allPageNum - 1; i <= allPageNum; i++) {
					if (i <= nowPageNum + 1) {
						continue;
					}
					else {
						var page = document.createElement("a");
						page.innerHTML = i;
						page.onclick = function () {
							atpage = Number($(this).text());
							getComments();
						}
						info.find(".pagination-pages").append(page);
					}
				}
			}

			//下一页
			if (nowPageNum < allPageNum) {
				var next = document.createElement("a");
				next.className = "next";
				next.innerHTML = '下一页';
				next.onclick = function () {
					atpage = nowPageNum + 1;
					getComments();
				}
				info.find(".pagination-pages").append(next);
			}

			//输入跳转
			var insertNum = Number(nowPageNum + 1);
			if (insertNum >= Number(allPageNum)) {
				insertNum = Number(allPageNum);
			}

			var redirect = document.createElement("div");
			redirect.className = "redirect";
			redirect.innerHTML = '<i>到</i><input id="prependedInput" type="number" placeholder="页码" min="1" max="'+allPageNum+'" maxlength="4"><i>页</i><button type="button" id="pageSubmit">确定</button>';
			info.find(".pagination-pages").append(redirect);

			//分页跳转
			info.find("#pageSubmit").bind("click", function(){
				var pageNum = $("#prependedInput").val();
				if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
					atpage = Number(pageNum);
					getComments();
				} else {
					$("#prependedInput").focus();
				}
			});

			info.show();

		}else{
			info.hide();
		}
	}


});