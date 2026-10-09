$(function(){
	//APP端取消下拉刷新
    toggleDragRefresh('off');

	var device = navigator.userAgent;
  	// if(device.indexOf('huoniao') > -1){
    //     $('.area a').bind('click', function(e){
    //         e.preventDefault();
    //         setupWebViewJavascriptBridge(function(bridge) {
    //             bridge.callHandler('goToCity', {'module': 'tuan'}, function(){});
    //         });
    //     });
    // }


  // 地图
  var markerArr = [] , map ='';
  var atpage = 1, isload = false, lng='',lat='';
  HN_Location.init(function(data){
	if (data == undefined || data.lat == "" || data.lng == "") {
	   map = new BMap.Map("map");
  	  var point = new BMap.Point(longitude, latitude);  // 创建点坐标
      map.centerAndZoom(point, 15);
      map.enableScrollWheelZoom(true);
      //onefindList();
      $(".list").append('<div class="loading">定位失败,请重新刷新页面！</div>');
  	}else{
	  lng = data.lng, lat = data.lat;

	  map = new BMap.Map("map");
  	  var point = new BMap.Point(lng, lat);  // 创建点坐标
      map.centerAndZoom(point, 15);
      map.enableScrollWheelZoom(true);

      onefindList(1);
  	}
  	window.addEventListener("mousewheel", (e) => {
	   if (e.deltaY === 1) {
	     e.preventDefault();
	   }
	 });
  });



  $('.info_txt').click(function(){
    var t = $(this);
    if(t.hasClass('active')){
      $('.info').addClass('listHide');
      $('.info').removeClass('listShow');
      t.removeClass('active');
      $('.info .info_txt em').removeClass('txt_top');
    }else{
      $('.info').addClass('listShow');
      $('.info').removeClass('listHide');
      t.addClass('active');
      $('.info .info_txt em').addClass('txt_top');
    }
  });

  $('.inp').delegate('#search', 'click', function(){
    map.clearOverlays();
  	onefindList(1);
  });

  var points = [];
  function onefindList(tr){
  	if(tr){
		atpage = 1;
		$(".list ul").html("");
  	}
  	isload = true;

   	var data = [];
   	if($("#keywords").val() != ''){
		data.push("search="+$("#keywords").val());
	}
	data.push("page="+atpage);
	$.ajax({
		url: "/include/ajax.php?service=tuan&action=storeList&pageSize=10"+'&lng='+lng+'&lat='+lat,
		data: data.join("&"),
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data){
				if(data.state == 100){
					$(".list .loading").remove();
					var list = data.info.list, html = [];
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							html.push('<li class="fn-clear">');
							html.push('<a href="'+list[i].url+'">');
					        html.push('   <div class="s_img"><img src="'+list[i].litpic+'"></div>');
					        html.push('  <div class="s_title">');
					        html.push('     <div class="bus_txt fn-clear"><span class="bus_txt_title business-txt">'+list[i].company+'</span></div>');
					        html.push('      <p class="tuan"><span>发布团购<em>'+list[i].tuannum+'</em></span><span>综合评分<em>'+list[i].rating+'分</em></span></p>');
					        if(list[i].vouchers!=''){
					        	html.push('      <div class="quan fn-clear"><span>券</span><span>'+list[i].vouchers+'</span></div>');
					        }
					        html.push('     <div class="addr fn-clear"><span><em>'+list[i].shortaddress+'</em>&nbsp;<em>'+list[i].distance+'</em></span><div class="aa">进入店铺</div></div>');
					        html.push('   </div>');
					        html.push('   </div>');
					        html.push('</a>');
					        html.push('</li>');

					        markerArr[i]={ title: list[i].company, point: list[i].lnglat, address: list[i].address, url: list[i].url};

						}


						for (var i = 0; i < markerArr.length; i++) {
						      var p0 = markerArr[i].point.split(",")[0];
						      var p1 = markerArr[i].point.split(",")[1];
                          	  var point = new window.BMap.Point(p0, p1);
                          	  points.push(point);
						      var maker = addMarker(point, i, markerArr[i].url);
						}
						// 添加标注
						function addMarker(point, index, url) {
						    var myIcon = new BMap.Icon("http://api.map.baidu.com/img/markers.png",
						        new BMap.Size(23, 25), {
						            offset: new BMap.Size(10, 25),
						            imageOffset: new BMap.Size(0, 0 - index * 25)
						        });
						    var marker = new BMap.Marker(point, { icon: myIcon });
						    map.addOverlay(marker);
                          	marker.addEventListener("click", function(){
                            	location.href = url;
                            })
						    return marker;
						}
						$(".list ul").append(html.join(""));

                        map.setViewport(points);

						isload = false;
						//最后一页
						$('.info_txt').html('为您找到附近'+data.info.pageInfo.totalCount+'家商店<em class="txt_top"></em>');
						if(atpage >= data.info.pageInfo.totalPage){
							isload = true;
							$(".list").append('<div class="loading">已经到最后一页了</div>');
						}
					}else{
						isload = true;
						$('.info_txt').html('未找到附近商店<em class="txt_top"></em>');
						$(".list").append('<div class="loading">暂无相关信息</div>');
					}
				}else{
				    $('.info_txt').html('未找到附近商店<em class="txt_top"></em>');
					$(".list").append('<div class="loading"></div>');
					$(".list .loading").html(data.info);
				}
			}else{
				$(".list").html('<div class="loading">加载失败</div>');
			}
		},
		error: function(){
			isload = false;
			$(".list").html('<div class="loading">网络错误，加载失败！</div>');
		}
	});
  }




  $(".list").scroll(function() {
  	var allh = $('.info').height();
    var w = $(".list").height();
    var scroll = allh - w;
    if ($(".list").scrollTop() >= w&& !isload) {
		atpage++;
	  	isload = true;
      	onefindList();
    }
  });


});
