$(function() {
	/*开始*/
	//倒计时(判断订单状态如果是待支付)
	// var timer = setInterval("CountDown();",1000);
	/*结束*/

	// 显示订单跟踪
	$('.order_state.show h2').click(function() {
		$('.mask_pop').show();
		$('.pop_page').animate({
			"bottom": 0
		}, 150);
	});
	// 隐藏订单跟踪
	$('.mask_pop,.pop_page .close_btn').click(function() {
		$('.mask_pop').hide();
		$('.pop_page').animate({
			"bottom": "-7.56rem"
		}, 150);
	});

});
if(state==3 ){
	mapShow(lat,lng)
}else if(state==4){
	if(pslat||pslng){
		mapShow(pslat,pslng)
	}else{
		$(".map_show").remove();
	}
	
}else if(state==5){
	if(pslat||pslng){
		mapShow(pslat,pslng)
	}else{
		$(".map_show").remove();
	}
}
// 地图更新
	function mapShow(x,y){
		 if (site_map == "baidu") {
			 var mapPath = new BMapGL.Map('map');
			 var point = new BMapGL.Point(y, x);
			 console.log(point)
			 var labelStyle = {
			   color: "#fff",
			   borderWidth: "0",
			   padding: "0",
			   zIndex: "2",
			   backgroundColor: "transparent",
			   textAlign: "center",
			   fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
			 }
			 let cls = '';
			  if(state==3){
				 cls = "shop";
			 }else if(state==4){
				 cls = 'courier';
			 }
			 var bubbleLabel = new BMapGL.Label('<p class="bubble-3 bubble '+cls+'"></p>', {
			   position: point,
			   // offset: new BMapGL.Size(-20, -45)
			 });
			 bubbleLabel.setStyle(labelStyle);
			 mapPath.addOverlay(bubbleLabel);
			 mapPath.centerAndZoom(point, 14);
		 }else if(site_map == "google"){
			var marker,
			   mapOptions = {
			     zoom: 14,
			     center: new google.maps.LatLng(x, y),
			     zoomControl: false,
			     mapTypeControl: false,
			     streetViewControl: false,
			     fullscreenControl: false
			   };
			 	var icon = '';
			 if(state==3){
				 icon = "/static/images/shop_local_google.png?v=2";
			 }else if(state==4){
				 icon = '/static/images/courier_local_google.png?v=2';
			 }
			 mapPath = new google.maps.Map(document.getElementById('map'), mapOptions);
			 	
			 // 店铺坐标
			 marker = new google.maps.Marker({
			   position: new google.maps.LatLng(x, y),
			   map: mapPath,
			   icon: icon
			 });
		 }else if(site_map == "amap"){
		 	var marker;
			var icon = '';
			 if(state==3){
				 icon = "/static/images/shop_local_google.png?v=2";
			 }else if(state==4){
				 icon = '/static/images/courier_local_google.png?v=2';
			 }
		 	var amap = new AMap.Map('map', {
		       center:[y,x],
		       zoom:14
		    });	
		     marker1 = new AMap.Marker({
                     map: amap,
                     icon: icon,
                     position: [y, x], //此处填写点标记的经纬度
                     offset: new AMap.Pixel(-13, -22)
                 });
		 }
	}

// 取消订单
$('.btn_group .cancel_btn').click(function() {
	var t = $(this);
	if (id) {
		$('.pop_confirm').addClass('show');
		$('.mask_pop').show();
		$('.cancle_btn').click(function(e){
			$('.pop_confirm').removeClass('show');
			$('.mask_pop').hide();
			e.stopImmediatePropagation();   //阻止事件继续执行
		});
		$('.sure_btn').off('click').click(function(e){
			$.ajax({
				url: "/include/ajax.php?service=waimai&action=cancelOrder&id=" + id,
				type: "GET",
				dataType: "json",
				success: function(data) {
					if (data && data.state == 100) {
			
						//取消成功后移除信息层并异步获取最新列表
						location.reload();
					} else {
						alert(data.info);
						t.siblings("a").show();
						t.removeClass("load");
					}
				},
				error: function() {
					alert(langData['siteConfig'][20][183]);    /* 网络错误，请稍候重试！*/
					t.siblings("a").show();
					t.removeClass("load");
				}
			});
			$('.pop_confirm').removeClass('show');
			$('.mask_pop').hide();
		})
	
	}
});

$('.mask_pop,.pop_confirm').on('touchmove',function(e){
	e.preventDefault()
});

var interCheckPay = null
if(state == '0' || state == 0){
	interCheckPay = setInterval(function(){
		checkPayState()
	},5000)
}
var maxTime = 30 * 60;

function CountDown() {
	if (maxTime > 0) {
		min = Math.floor(maxTime / 60);
		sec = Math.floor(maxTime % 60);
		if (min < 10) {
			min = '0' + min
		}
		if (sec < 10) {
			sec = '0' + sec
		}
		msg = min + ":" + sec;
		$('.cdown em').html(msg)
			--maxTime;
	} else {
		//倒计时结束后，改变订单状态
	}
}

function checkPayState(){
	$.ajax({
	  url: '/include/ajax.php?service=member&action=tradePayResult&order='+ordernum,
	  type: "POST",
	  dataType: "json",
	  success: function (data) {
		  if(data.state == 100){
			  clearInterval(interCheckPay);
			  var location = window.location.href
			  window.location.href = location + (location.indexOf('?') > -1 ? '&currentPageOpen=1':'?currentPageOpen=1')
		  }
	  },
	  error: function () { }
  });
}