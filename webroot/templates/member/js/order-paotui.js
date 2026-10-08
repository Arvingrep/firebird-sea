/**
 * 会员中心商城订单列表
 * by guozi at: 20151130
 */

var objId = $("#list");
var iscomment = '';

$(function(){

	$(".main-sub-tab li[data-id='"+state+"']").addClass("curr");

	//状态切换
	$(".main-sub-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("sel")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});

	getList(1);

	// 删除
	objId.delegate(".delete", "click", function(){
		var t = $(this), par = t.closest(".waimai-item"), id = par.attr("data-id");
		if(id){
			if(confirm(langData['siteConfig'][20][182])){//确定删除订单？删除后本订单将从订单列表消失，且不能恢复。
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=waimai&action=delOrder&type=paotui&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							location.reload();
						}else{
							alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						alert(langData['siteConfig'][20][183]);
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			};
		}
	});

	// 取消
	objId.delegate(".cancel", "click", function(){
		var t = $(this), par = t.closest(".waimai-item"), id = par.attr("data-id");
		if(id){
			if(confirm(langData['siteConfig'][20][186])){//确定取消该订单？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=waimai&action=cancelOrder&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//取消成功后移除信息层并异步获取最新列表
							location.reload();
						}else{
							alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						alert(langData['siteConfig'][20][183]);
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			};
		}
	});

});
var	wTime = {

	//转换PHP时间戳
	transTimes: function(timestamp, n){
		update = new Date(timestamp*1000);//时间戳要乘1000
		year   = update.getFullYear();
		month  = (update.getMonth()+1<10)?('0'+(update.getMonth()+1)):(update.getMonth()+1);
		day    = (update.getDate()<10)?('0'+update.getDate()):(update.getDate());
		hour   = (update.getHours()<10)?('0'+update.getHours()):(update.getHours());
		minute = (update.getMinutes()<10)?('0'+update.getMinutes()):(update.getMinutes());
		second = (update.getSeconds()<10)?('0'+update.getSeconds()):(update.getSeconds());
		if(n == 1){
			return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
		}else if(n == 2){
			return (year+'-'+month+'-'+day);
		}else if(n == 3){
			return (month+'-'+day);
		}else if(n == 4){
			return (hour+':'+minute);
		}else{
			return 0;
		}
	}
}
function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');//加载中，请稍候
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=waimai&action=paotuiOrder&userid="+userid+"&state="+state+"&page="+atpage+"&pageSize="+pageSize+"&iscomment="+iscomment,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$(".main-sub-tab, .oh").hide();
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [], durl = $(".main-sub-tab").data("url"), cUrl = $(".main-sub-tab").data("comment");
					var detailUrl = durl;
					detailUrl = detailUrl.replace("waimai", 'paotui')
					console.log(pageInfo)

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item     = [],
								amount   = list[i].amount,
								id       = list[i].id,
								ordernum = list[i].ordernumstore ? list[i].ordernumstore : list[i].ordernum,
								paytype  = list[i].paytype,
								pubdate  = huoniao.transTimes(list[i].pubdate, 1),
								paydate  = huoniao.transTimes(list[i].paydate, 1),
								shop     = list[i].shop,
								type     = list[i].type,
								state    = list[i].state,
								uid      = list[i].uid,
								username = list[i].username,
								address = list[i].address,
								buyaddress = list[i].buyaddress,
								payurl   = list[i].payurl;

						  var stateInfo = btn = "";
						  switch(state){
							case "0":
							  stateInfo = '<span>'+langData['siteConfig'][9][22]+'</span>';
							  btn = '<a href="javascript:;" class="btn-nobg gray cancel">'+langData['siteConfig'][6][65]+'</a><a href="'+payurl+'" class="btn-bg yellow">'+langData['siteConfig'][6][64]+'</a>';
							  break;
							case "1":
							  stateInfo = '<span>'+langData['siteConfig'][6][3]+'</span>';
							   btn = '';
							  // btn = '<a href="javascript:;" class="btn-nobg gray delete fn-hide">'+langData['siteConfig'][6][8]+'</a>';
							  break;
							case "2":
							  stateInfo = '<span>'+langData['siteConfig'][9][11]+'</span>';
							  btn = '<a href="javascript:;" class="btn-nobg gray cancel">'+langData['siteConfig'][6][65]+'</a>';
							  break;
							case "3":
							  stateInfo = '<span>'+langData['siteConfig'][9][46]+'</span>';
							  btn = '<a href="javascript:;" class="btn-nobg gray delete">'+langData['siteConfig'][6][8]+'</a>';
							  break;
							case "4":
							  stateInfo = '<span>'+langData['siteConfig'][16][114]+'</span>';
							  btn = '<a href="javascript:;" class="btn-nobg gray delete">'+langData['siteConfig'][6][8]+'</a>';
							  break;
							case "5":
							  stateInfo = '<span>'+langData['siteConfig'][16][115]+'</span>';
							  btn = '<a href="javascript:;" class="btn-nobg gray delete">'+langData['siteConfig'][6][8]+'</a>';
							  break;
							case "6":
							  stateInfo = '<span>'+langData['siteConfig'][6][112]+'</span>';
							  btn = '<a href="javascript:;" class="btn-nobg gray delete">'+langData['siteConfig'][6][8]+'</a>';
							  break;
							case "7":
							  stateInfo = '<span>'+langData['siteConfig'][9][47]+'</span>';
							  btn = '<a href="javascript:;" class="btn-nobg gray delete">'+langData['siteConfig'][6][8]+'</a>';
							  break;
						  }
							html.push('<div class="waimai-item" data-id="'+id+'">');
							html.push('<div class="item_wrap fn-clear">');
							html.push('<div class="wGood">');
							html.push('<div class="wleft_img"><img src="'+templets_skin+'/images/icon.jpg" alt=""></div>');
							html.push('<div class="wdesp">');
							html.push('<h2 class="wStore">'+shop+'</h2>');
							html.push('<p class="wTitle">提货位置:'+buyaddress+'</p>');//菜品加单位
							html.push('<p class="wNum">送货位置:'+address+'</p>');//菜品数量
							html.push('</div>');
							html.push('</div>');
							html.push('<div class="wOrdertime">');
							html.push('<span>'+pubdate+'</span>');
							html.push('</div>');
							html.push('<div class="wPrice">'+echoCurrency('symbol')+amount+'</div>');
							html.push('<div class="wState"><div class="wState_div">'+stateInfo+'</div></div>');
							html.push('<div class="wDetail">');
							html.push('<a href="'+detailUrl.replace("%id%", id)+'" class="woDet wa1">'+langData['waimai'][8][64]+'</a>'+btn);//订单详情
							html.push('</div>');
							html.push('</div>');
							
							html.push('</div>');

						}

						objId.append(html.join(""));
						$('.no-data').hide();
						$('.loading').remove();
									isload = false;
									
					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
					}
					//全部 待付款 评价
					switch(state){
						case "":
							totalCount = pageInfo.totalCount;
							break;
						case "0":
							totalCount = pageInfo.unpaid;
							break;
						case "5":
							totalCount = pageInfo.rates;
							break;
					}


					$("#total").html(pageInfo.totalCount);

					if(pageInfo.state0 == 0){
						$("#unpaid").parent().parent().hide();
					}else{
						$("#unpaid").parent().parent().show();
						$("#unpaid").html(pageInfo.state0);
					}

					if(pageInfo.noiscomment == 0){
						$("#rates").parent().parent().hide();
					}else{
						$("#rates").parent().parent().show();
						$("#rates").html(pageInfo.noiscomment);
					}

					showPageInfo();//打印分页
				}
			}else{
				$(".main-sub-tab, .oh").hide();
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
			}
		}
	});
}

function mapShow(x,y,z,id,state,path){	//x 店铺坐标 y 配送员坐标 z 收货人坐标 path 配送路径
	console.log(state)
	//小地图
	// 百度地图
	if (site_map == "baidu") {
	    var map = new BMap.Map('listMap'+id);
	     map.disableDragging();
	    var labelStyle = {
		   color: "#fff",
		   borderWidth: "0",
		   padding: "0",
		   zIndex: "2",
		   backgroundColor: "transparent",
		   textAlign: "center",
		   fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
		 }
	    if(state==3){//待配送时(等待骑手接单)  只有商家坐标 
	    	console.log(x)
	    	//店铺坐标
	      	var pointShop = new BMap.Point(x.lng, x.lat);
	      	var bubbleLabelShop = new BMap.Label('<p class="bubble-3 bubble shop"><span>商家备货完成</span></p>', {
		        position: pointShop,
		        offset: new BMap.Size(-20, -45)
		      });
	      	

	        bubbleLabelShop.setStyle(labelStyle);
	        map.addOverlay(bubbleLabelShop);
	        map.centerAndZoom(pointShop, 14);

	    }else if(state==4){//骑手接单 无路径  只有商家坐标 骑手坐标
	    	var pointShop = new BMap.Point(x.lng,x.lat);
			var pointCourier = new BMap.Point(y.lng,y.lat);
			console.log(pointShop)
			var bubbleLabel = new BMap.Label('<p class="bubble-3 bubble shop"></p>', {
			   position: pointShop,
			   offset: new BMap.Size(-20, -45)
			});
			var bubbleLabel2 = new BMap.Label('<p class="bubble-3 bubble courier"><span>骑手已接单</span></p>', {
			   position: pointCourier,
			   offset: new BMap.Size(-20, -45)
			});
			bubbleLabel.setStyle(labelStyle);
			bubbleLabel2.setStyle(labelStyle);
			map.addOverlay(bubbleLabel);
			map.addOverlay(bubbleLabel2);
			map.centerAndZoom(pointCourier, 14);

	    }else if(state==5){//配送中 路径 骑手坐标 商家坐标
	    	//派送员路径
	      var pointArr = [];

	      //店铺坐标
	      var pointShop = new BMap.Point(x.lng, x.lat);
	      var bubbleLabelShop = new BMap.Label('<p class="bubble-3 bubble shop"></p>', {
	        position: pointShop,
	        offset: new BMap.Size(-20, -45)
	      });
	      bubbleLabelShop.setStyle(labelStyle);
	      map.addOverlay(bubbleLabelShop);
	      pointArr.push(pointShop);

	      //终点坐标
	      var pointPerson = new BMap.Point(z.lng, z.lat);
	      var bubbleLabelPerson = new BMap.Label('<p class="bubble-3 bubble person"></p>', {
	        position: pointPerson,
	        offset: new BMap.Size(-15, -15)
	      });
	      bubbleLabelPerson.setStyle(labelStyle);
	      map.addOverlay(bubbleLabelPerson);
	      pointArr.push(pointPerson);

	      //更新骑手位置 & 画线
	      updateCourierLocation(path);

	      //设置中心点
	      pointArr.push(new BMap.Point(y.lng, y.lat));
	      map.setViewport(pointArr);
	      map.setZoom(map.getZoom() - 1);


	      //骑手位置 & 画线
	        var bubbleLabelCourier, polylineCourier;
		    function updateCourierLocation(pathData){
		
		      if(!pathData || pathData == "") return false;
		
		      if(bubbleLabelCourier){
		          map.removeOverlay(bubbleLabelCourier);
		      }
		
		      //获取骑手最新位置
		      var psData = pathData.split(";");
		      psData = psData[psData.length-1].split(",");
		
		      //骑手坐标
		      var pointCourier = new BMap.Point(psData[0], psData[1]);
		      bubbleLabelCourier = new BMap.Label('<p class="bubble-3 bubble courier"><span class="long-span">骑手正在送货中</span></p>', {
		        position: pointCourier,
		        offset: new BMap.Size(-20, -45)
		      });
		      bubbleLabelCourier.setStyle(labelStyle);
		      map.addOverlay(bubbleLabelCourier);
		      //画折线
		      if(pathData){
		
		        if(polylineCourier){
		            map.removeOverlay(polylineCourier);
		        }
		
		        var pathsArr = [];
		        pathArr = pathData.split(";");
		        for(var i = 0; i < pathArr.length; i++){
		          var p = pathArr[i].split(",");
		          pathsArr.push(new BMap.Point(p[0],p[1]));
		        }
		        polylineCourier = new BMap.Polyline(pathsArr, {strokeColor:"blue", strokeWeight:2, strokeOpacity:.9, strokeStyle:'dashed'});
		        map.addOverlay(polylineCourier);
		      }
		    }
	    }	    
	  // 谷歌地图
	}else if (site_map == "google") {

	     var marker,maker1,mapOptions,map;
	     
	     if(state==3){//待配送时 商家已确认订单(等待骑手接单)  只有商家坐标 
 			mapOptions = {
			   zoom: 14,
			   center: new google.maps.LatLng(x.lat,x.lng),
			   zoomControl: false,
			   mapTypeControl: false,
			   streetViewControl: false,
			   fullscreenControl: false,
			 }
			 map = new google.maps.Map(document.getElementById('listMap'+id), mapOptions);
		 	 // 店铺坐标
		 	 marker = new google.maps.Marker({
		 	   position: new google.maps.LatLng(x.lat,x.lng),
		 	   map: map,
		 	   icon: "/static/images/shop_local_google.png?v=1"
		 	 });
	    }else if(state==4){//骑手接单 无路径  只有商家坐标 骑手坐标
	      	mapOptions = {
			   zoom: 14,
			   center: new google.maps.LatLng(x.lat,x.lng),
			   zoomControl: false,
			   mapTypeControl: false,
			   streetViewControl: false,
			   fullscreenControl: false
			 }
			 map = new google.maps.Map(document.getElementById('listMap'+id), mapOptions);
		 	// 店铺坐标
		 	marker = new google.maps.Marker({
		 	  position: new google.maps.LatLng(x.lat,x.lng),
		 	  map: map,
		 	  icon: "/static/images/shop_local_google.png?v=1"
		 	});
		 	
		 	// 骑手坐标
		 	marker1 = new google.maps.Marker({
		 	  position: new google.maps.LatLng(y.lat,x.lng),
		 	  map: map,
		 	  icon: "/static/images/courier_local_google.png?v=1"
		 	});
		}else if(state==5){//配送中 路径 骑手坐标 商家坐标
		 	var shop_marker, person_marker, LatLngList = [];
		 	mapOptions = {
	          zoom: 14,
	          center: new google.maps.LatLng(y.lat, y.lng),
	          zoomControl: false,
	          mapTypeControl: false,
	          streetViewControl: false,
	          fullscreenControl: false
	        }
	        map = new google.maps.Map(document.getElementById('listMap'+id), mapOptions);
	        // 店铺坐标
		     shop_marker = new google.maps.Marker({
		        position: new google.maps.LatLng(x.lat, x.lng),
		        map: map,
		        icon: "/static/images/shop_local_google.png?v=1"
		     });
		     LatLngList.push(new google.maps.LatLng(x.lat, x.lng))
		
		    // 终点坐标
		    person_marker = new google.maps.Marker({
		        position: new google.maps.LatLng(z.lat, z.lng),
		        map: map,
		        icon: "/static/images/person_local_google.png?v=1"
		    });
		    LatLngList.push(new google.maps.LatLng(z.lat, z.lng))
		
		      //更新骑手位置 & 画线
		      updateCourierLocation(path);
		
		      // 调整到合适的视野
		    var bounds = new google.maps.LatLngBounds ();
		      for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
		        bounds.extend (LatLngList[i]);
		    }
		    map.fitBounds (bounds);

		    //骑手位置 & 画线  
		    var courier_marker, trackPath;
		    function updateCourierLocation(pathData){
		
		      if(!pathData || pathData == "") return false;
		
		      if(courier_marker){
		        courier_marker.setMap(null);
		      }
		
		      //获取骑手最新位置
		      var psData = pathData.split(";");
		      psData = psData[psData.length-1].split(",");
		
		      // 骑手坐标
		      courier_marker = new google.maps.Marker({
		        position: new google.maps.LatLng(psData[1], psData[0]),
		        map: map,
		        icon: "/static/images/courier_local_google.png?v=1"
		      });
		
		      courier_marker.setMap(map);
		
		      //画折线
		      if(pathData){
		
		        if(trackPath){
		          trackPath.setMap(null);
		        }
		
		        var pathsArr = [];
		        pathArr = pathData.split(";");
		        for(var i = 0; i < pathArr.length; i++){
		          var p = pathArr[i].split(",");
		          pathsArr.push(new google.maps.LatLng(p[1],p[0]));
		        }
		
		        trackPath = new google.maps.Polyline({
		            path: pathsArr,
		            strokeColor: "blue", // 线条颜色
		            strokeOpacity: 0.9, // 线条透明度
		            strokeWeight: 2 // 线条粗细
		        });
		
		        trackPath.setMap(map);
		
		      }
		    }
	    }
	     
	}	 
}

//点击列表地图跳转到详情
$('#list').delegate('.sub-map','click',function(){
	var par =$(this).closest('.waimai-item');
	var deHref = par.find('.woDet').attr('href');
	location.href=deHref;
})

