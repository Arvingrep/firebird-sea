
var tp_ajax	, sp_ajax , pl_alax ;

var click_flag = false;  //判断是否点击的标识符

$(function() {

  //APP端取消下拉刷新
    toggleDragRefresh('off');

	try {
		var upType1 = upType;
	} catch (e) {
		var upType1 = 'atlas';
	}

	if(device.indexOf('huoniao') > -1&&upVideo==1){
		$('.up_btngtoup').hide();
		$('.up_btngtoup.app_group').show();
	}

	var userid = $.cookie(cookiePre + "login_user");
	if (userid == null || userid == "") {
		window.location.href = masterDomain + '/login.html';
		return false;
	}

	//错误提示
	var showErrTimer;
	function showErr(txt) {
		showErrTimer && clearTimeout(showErrTimer);
		$(".popErr").remove();
		$("body").append('<div class="popErr"><p>' + txt + '</p></div>');
		$(".popErr p").css({
			"margin-left": -$(".popErr p").width() / 2,
			"left": "50%"
		});
		$(".popErr").css({
			"visibility": "visible"
		});
		showErrTimer = setTimeout(function() {
			$(".popErr").fadeOut(300, function() {
				$(this).remove();
			});
		}, 1500);
	}
	/*==============================选择话题 相关=====================================*/
	var tpage =1, tload=0;
	// show选择话题对话框
	$('.choseBox.tp_chose').click(function() {
		$('.mask_topic').show(); //显示背景遮罩
		$('.topic_box').animate({
			'bottom': "0"
		}, 200);
		$('html').addClass('noscroll'); //禁止遮罩背景滚动
		getTpslist();
	});

	// 隐藏选择话题对话框
	$('.mask_topic,.topic_box .cancel_btn').click(function() {
		$('.mask_topic').hide(); //隐藏背景遮罩
		$('.topic_box').animate({
			'bottom': "-90%"
		}, 200);
		$('html').removeClass('noscroll'); //去除禁止遮罩背景滚动

	});

	// 选择话题
	$('.topic_rec').delegate('.tp_li', 'click', function() {
		var t = $(this);
		var tp_name = $(this).find('h2 span').text();
		$('#topicname').val(tp_name);
		if (!t.hasClass('create_li')) { //当点击的是推荐的话题时
			var tpid = t.attr('data-id'); //获取话题id
			t.addClass('chosed').siblings('.tp_li').removeClass('chosed');
		} else {
			$('.tp_chose .add_tp').html(tp_name);
			$('.mask_topic').click();
            $('#topic').val('');
			$('#topicname').val(tp_name);
			//$.ajax({
			//	url:"/include/ajax.php?service=circle&action=topicAdd",
			//	type: "POST",
			//	data:{'title':tp_name},
			//	dataType: "json", //指定服务器返回的数据类型
			//	success: function(data) {
			//		if(data.state == 100){
			//			alert("新增话题成功");
			//			$('#topic').val(data.info.info);
			//			$('#topicname').val(tp_name);
			//		}else{
			//			alert(data.info)
			//		}
			//	},
			//	error:function(){

			//	}
			//});



	}

		$('.topic_box h1 a').show();
		$('.topic_box .cancel_btn').hide();
	});




	// 确定选择话题
	$('.topic_box .sure_btn').click(function() {
		var t = $('.topic_rec .chosed');
		var tp_name = t.find('h2 span').text();
		var tpid = t.attr('data-id');
		$('.tp_chose .add_tp').html(tp_name);
		$('#topic').val(tpid);
		// 选择之后固定动作
		$('.mask_topic').click();
	});

	// 点击不带话题
	$('.topic_box .no_btn').click(function() {
		$('.mask_topic').click();

		$('.topic_box h1 a').hide();
		$('.topic_box .cancel_btn').show();
		$('.topic_box .tp_li').removeClass('chosed');
		$('.tp_chose .add_tp').html(langData['circle'][2][4]);   /* 添加话题<em>（更多人看见哦）</em>*/
		$('#search_topic,#topic').val(''); //清空数据
		$('.topic_box .rec_ul').show().siblings('.topic_box .search_ul').hide();
	});

	var chineseIn = false; //是否是中文输入

	$('#search_topic').bind('compositionstart', function() {
		console.log(1)
		chineseIn = true
	})

	$('#search_topic').bind('compositionend', function() {
		chineseIn = false;
		let t = $(this)
		var s_val = t.val();
		console.log(2)
		if (s_val != '') {
			$('.topic_box .search_box .clear').show();
			$('.create_li').show().find('h2 span').text(s_val);
			$('.search_ul').show().siblings('.rec_ul').hide();
			$('.topic_box h3').show();
			getTplist();
			// var timer = setTimeout(function() {
			// 	// if(!tload){
			// 		getTplist();
			// 	// }
			// }, 1000); //匹配搜索
		} else {
			$('.topic_box .search_box .clear').hide();
			$('.create_li,.topic_box h3').hide();
			$('.search_ul').hide().siblings('.rec_ul').show();
			$('.topic_box h1 a').hide();
			$('.topic_box .cancel_btn').show();
		}
	})

	// 搜索话题
	$('#search_topic').bind('input propertychange', function() {
		var t = $(this);
		if(chineseIn) return false;
		console.log(3)
		var s_val = t.val();
		if (s_val != '') {
			$('.topic_box .search_box .clear').show();
			$('.create_li').show().find('h2 span').text(s_val);
			$('.search_ul').show().siblings('.rec_ul').hide();
			$('.topic_box h3').show();
			getTplist();
			// var timer = setTimeout(function() {
			// 	// if(!tload){
			// 		getTplist();
			// 	// }
			// }, 1000); //匹配搜索
		} else {
			$('.topic_box .search_box .clear').hide();
			$('.create_li,.topic_box h3').hide();
			$('.search_ul').hide().siblings('.rec_ul').show();
			$('.topic_box h1 a').hide();
			$('.topic_box .cancel_btn').show();
		}

	});



    // $('#search_topic').blur(function())
	// 所有搜索框的清空
	$('.topic_box .search_box .clear').click(function() {
		$(this).siblings('input').val('');
		$('.topic_box .search_box .clear').hide();
		$('.create_li,.topic_box h3').hide();
		$('.search_ul').hide().siblings('.rec_ul').show();
		$('.topic_box h1 a').hide();
		$('.topic_box .cancel_btn').show();
	});

	// 匹配话题
	function getTplist() {
		// 如果已经在进行ajax请求，终止之前的请求
		if(tp_ajax){
			tp_ajax.abort();
		}
		var val = $('#search_topic').val();   //搜索关键字
		data = {
			'page': '1',
			'pageSize': 40,
		}
		// $('.search_ul').append('<div class="loading">加载中~</div>');
		$('.topic_rec h3').show();
		tp_ajax = $.ajax({
			url: '/include/ajax.php?service=tieba&action=tlist&keywords='+val,
			type: "GET",
			data: data,
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [];
					for (var i = 0; i < data.info.list.length; i++) {
						var d = data.info.list[i];
						var d_tit = d.title;
						list.push('<li class="tp_li" data-id="'+d.id+'">');
						list.push('<div class="l_img"><img src="'+templets_skin+"/images/f_topic1.png"+'" data-url="'+(d.imgGroup[0]?d.imgGroup[0]:templets_skin+"/images/f_topic1.png")+'"></div>');
						list.push('<div class="r_info">');
						list.push('<h2><span>'+d.title+'</span> </h2>');
						list.push('<p>6522'+langData['circle'][0][60]+'</p>');  /* 人参与*/
						list.push('</div></li>');
						if(d_tit == val){
							$('.create_li').hide();
						}
					}
					$('.search_ul .loading').remove();
					$('.search_ul').html(list.join(''));
					 $("img").scrollLoading(); //懒加载
				} else {
					$('.topic_rec h3').hide();
					$('.search_ul').html('')
					$('.search_ul').append('<div class="noData loading"><img src="'+templets_skin+'images/f_null.png"><p>'+langData['circle'][2][30]+'</p></div>');   /* 暂无相关话题哦*/
				}
			},
			error: function(err) {
				console.log('fail');

			}
		});

	}



	/*=================================定位相关=====================================*/

	// show选择定位对话框
	$('.choseBox.ps_chose').click(function() {
		$('.mask_posi').show(); //显示背景遮罩
		$('.posi_box').animate({
			'bottom': "0"
		}, 200);
		$('html').addClass('noscroll'); //禁止遮罩背景滚动
	});

	// 隐藏选择定位对话框
	$('.mask_posi').click(function() {
		$('.mask_posi').hide(); //隐藏背景遮罩
		$('.posi_box').animate({
			'bottom': "-90%"
		}, 200);
		$('html').removeClass('noscroll'); //去除禁止遮罩背景滚动
	});

	// 不显示定位
	$('.posi_box .no_btn').click(function() {
		$('.mask_posi').click();
		$('.add_ps').html(langData['circle'][2][6]);  /* 隐藏定位*/
		$('#posi,#search_posi').val('');
		$('.posi_li').removeClass('chosed');
		$('#posiname').val('');  //清空定位
	});

	// 确定选择定位
	$('.posi_box .sure_btn').click(function() {
		if($('.posi_li.chosed').size()!=0){
			var p_chose = $('.posi_li.chosed').find('h2').text();
			var lnglat = $('.posi_li.chosed').attr('data-lng')+','+$('.posi_li.chosed').attr('data-lat');
			$('.add_ps').html(p_chose);
			$('#posiname').val(p_chose);
			$('#posi').val(lnglat);
		}
		$('.mask_posi').click();
	});

	// 选择定位
	$('.posi_box').delegate('.posi_li','click',function(){
		var t = $(this);
		t.addClass('chosed').siblings('li').removeClass('chosed');
	})

	HN_Location.init(function (data) {
	    if (data == undefined || data.address == "" || data.lat == "" || data.lng == "") {
			console.log('定位获取失败');
            lat = siteCityInfo_lat;
            lng = siteCityInfo_lng;
	     } else {
	            lat = data.lat;
	            lng = data.lng;
	            address = data.address instanceof Array ? data.address[0] : data.address;
				console.log(data)
				if(data.name){
					 $('.add_ps').html(data.name);
					 $('#posiname').val(data.name)
				}
				$('#posi').val(data.lng+','+data.lat)
				$('.choseBox.ps_chose').attr("data-lng",data.lng).attr("data-lat",data.lat)

	    }
	 })
	// 选择所在区域
	$('.choseBox.ps_chose').bind("click", function(){

	  var t = $(this);
	  lng = t.attr("data-lng") == null ? lng : t.attr("data-lng");
	  lat = t.attr("data-lat") == null ? lat : t.attr("data-lat");

	  //定位地图
	  // 百度地图
	  if (site_map == "baidu") {
	        var myGeo = new BMap.Geocoder();
			var mPoint = new BMap.Point(lng, lat);
	        getLocation(mPoint);
			//周边检索
			function getLocation(point){
			    myGeo.getLocation(point, function mCallback(rs){
			        var allPois = rs.surroundingPois;
					console.log(rs)
			        if(allPois == null || allPois == ""){
			            return;
			        }
					var list = [];
					for(var i = 0; i < allPois.length; i++){
						list.push('<li class="posi_li"  data-lng="'+allPois[i].point.lng+'" data-lat="'+allPois[i].point.lat+'"><h2>'+allPois[i].title+'</h2><div class="detail_posi fn-clear"><span>'+mapDistance(lng,lat,allPois[i].point.lng,allPois[i].point.lat)+'</span><p>'+allPois[i].address+'</p></div></li>')
					}
					if(list.length > 0){
						$("ul.rec_posi").html(list.join(""));
					}

			    }, {
			        poiRadius: 5000,  //半径一公里
			        numPois: 100
			    });
			}




	  // 谷歌地图
	  }else if (site_map == "google") {

	    var map, geocoder, marker,
	  		mapOptions = {
	  			zoom: 14,
	  			center: new google.maps.LatLng(lat, lng),
	  			zoomControl: true,
	  			mapTypeControl: false,
	  			streetViewControl: false,
	  			zoomControlOptions: {
	  				style: google.maps.ZoomControlStyle.SMALL
	  			}
	  		}

	    $('.mapcenter').remove();
	    map = new google.maps.Map(document.getElementById('mapdiv'), mapOptions);

	//     marker = new google.maps.Marker({
	// 			position: mapOptions.center,
	// 			map: map,
	// 			draggable:true,
	// 			animation: google.maps.Animation.DROP
	// 		});

	    getLocation(mapOptions.center);

	//     google.maps.event.addListener(marker, 'dragend', function(event) {
	//       var location = event.latLng;
	// 			$("#lng").val(location.lng());
	// 			$("#lat").val(location.lat());

	// 			var pos = {
	// 				lat: location.lat(),
	// 				lng: location.lng()
	// 			};
	//       getLocation(pos);
	//     })

	    function getLocation(pos){
	      var service = new google.maps.places.PlacesService(map);
	      service.nearbySearch({
	        location: pos,
	        radius: 500
	      }, callback);

	      var list = [];
	      function callback(results, status) {
	        if (status === google.maps.places.PlacesServiceStatus.OK) {
	          for (var i = 0; i < results.length; i++) {
	            // list.push('<li data-lng="'+results[i].geometry.location.lng()+'" data-lat="'+results[i].geometry.location.lat()+'"><h5>'+results[i].name+'</h5><p>'+results[i].vicinity+'</p></li>');
				list.push('<li class="posi_li"  data-lng="'+results[i].geometry.location.lng()+'" data-lat="'+results[i].geometry.location.lat()+'"><h2>'+results[i].name+'</h2><div class="detail_posi fn-clear"><span>'+mapDistance(lng,lat,results[i].geometry.location.lng(),results[i].geometry.location.lat())+'</span><p>'+results[i].vicinity+'</p></div></li>')
	          }
	          if(list.length > 0){
	            $(".rec_posi").html(list.join(""));
	            // $(".mapresults").show();
	          }
	        }
	      }
	    }

	//     var input = document.getElementById('searchAddr');
	//     var places = new google.maps.places.Autocomplete(input, {placeIdOnly: true});

	// 		google.maps.event.addListener(places, 'place_changed', function () {
	//         var address = places.getPlace().name;
	// 				$('#searchAddr').val(address);

	//         geocoder = new google.maps.Geocoder();
	//     		geocoder.geocode({'address': address}, function(results, status) {
	//     			if (status == google.maps.GeocoderStatus.OK) {
	//     				var locations = results[0].geometry.location;
	//     				lng = locations.lng(), lat = locations.lat();
	//     				if (lng && lat) {
	//               gzAddrSeladdr.attr('data-lng', lng).attr('data-lat', lat);
	//               gzAddrSeladdr.find("input#addr").val(results[0].formatted_address);
	//               gzAddrMap.hide();
	//               gzAddress.show();

	//     				}else{
	//     					alert(langData["waimai"][7][132]);   /* 您选择地址没有解析到结果! */
	//     				}
	//     			}
	//     		});

	//     });

	  // 高德地图
	  }else if (site_map == "amap"){
	    // var map = new AMap.Map('mapdiv', {zoom:14});

	    // if(lng != '' && lat != ''){
	    //     map.setZoomAndCenter(14, [lng, lat]);
	    // }

	    AMap.service('AMap.PlaceSearch',function(){//回调函数
	      var placeSearch= new AMap.PlaceSearch();

	      var s = function(){
	        if(lng != '' && lat != ''){
	          placeSearch.searchNearBy("", [lng, lat], 500, function(status, result) {
	            callback(result, status);
	          });
	        }else{
	          setTimeout(s,1000)
	        }
	      }
          s();

	    })

	    function callback(results, status) {
	      if (status === 'complete' && results.info === 'OK') {
	        var list = [];
	        var allPois = results.poiList.pois;
	        for(var i = 0; i < allPois.length; i++){
	          // list.push('<li data-lng="'+allPois[i].location.lng+'" data-lat="'+allPois[i].location.lat+'"><h5>'+allPois[i].name+'</h5><p>'+allPois[i].address+'</p></li>');
			  list.push('<li class="posi_li"  data-lng="'+allPois[i].location.lng+'" data-lat="'+allPois[i].location.lat+'"><h2>'+allPois[i].name+'</h2><div class="detail_posi fn-clear"><span>'+mapDistance(lng,lat,allPois[i].location.lng,allPois[i].location.lat)+'</span><p>'+allPois[i].address+'</p></div></li>')
	        }
	        if(list.length > 0){
	          $(".rec_posi").html(list.join(""));
	          // $(".mapresults").show();
	        }
	      }else{
	        // $(".mapresults").hide();
	      }
	    }

	    // map.plugin('AMap.Autocomplete', function () {
	    //   console.log('Autocomplete loading...')
	    //     autocomplete = new AMap.Autocomplete({
	    //         input: "searchAddr"
	    //     });
	    //     var keywords = $('#searchAddr').val();
	    //     // autocomplete.search(keywords, function(status, result){
	    //     //  callback && callback(status, result);
	    //     // })
	    //     // 选中地址
	    //     AMap.event.addListener(autocomplete, 'select', function(result){
	    //       lng = result.poi.location.lng;
	    //       lat = result.poi.location.lat;
	    //       var r = result.poi.name ? result.poi.name : (result.poi.address ? result.poi.address : result.poi.district);
	    //       gzAddrSeladdr.find("input#addr").val(r);
	    //       gzAddrMap.hide();
	    //       gzAddress.show();
	    //     });
	    // });

	  // 腾讯地图
	  }else if (site_map == "qq"){

	    function operation(){
	      if(lng == '' || lat == ''){
	        setTimeout(function(){
	          operation();
	        },100)
	      }else{
	        var map = new qq.maps.Map(document.getElementById('mapdiv'), {center: new qq.maps.LatLng(lat, lng), zoom: 18, draggable:true});

	        var searchService = new qq.maps.SearchService({
	          pageCapacity:10,
	          //检索成功的回调函数
	          complete: function(results) {
	            var len = results.detail.pois.length;
	            if(len){
	              for(var i = 0; i < len; i++){
	                var str = results.detail.pois[i].latLng.lng+','+results.detail.pois[i].latLng.lat;
	                if(!in_array(has, str)){
	                  has.push(str);
	                  list.push(results.detail.pois[i]);
	                }
	              }
	            }


	            if(idx < keywrodsArr.length - 1){
	              idx++;
	              searchService.searchNearBy(keywrodsArr[idx], new qq.maps.LatLng(lat, lng) , 1000);
	              return;
	            }else{
	              if(list.length){
	                list.sort(function(x, y){
	                  return x.dist - y.dist;
	                });
	                var html = [];
	                for(var i = 0; i < list.length; i++){
	                  // html.push('<li data-lng="'+list[i].latLng.lng+'" data-lat="'+list[i].latLng.lat+'"><h5>'+list[i].name+'</h5><p>'+list[i].address+'</p></li>');
					  html.push('<li class="posi_li"  data-lng="'+list[i].latLng.lng+'" data-lat="'+list[i].latLng.lat+'"><h2>'+list[i].name+'</h2><div class="detail_posi fn-clear"><span>'+mapDistance(lng,lat,list[i].latLng.lng,list[i].latLng.lat)+'</span><p>'+list[i].address+'</p></div></li>')
	                }
	                $(".rec_posi").html(html.join(""));
	                // $(".mapresults").show();
	              }else{
	                // $(".mapresults").hide();
	              }
	            }
	          },
	          //若服务请求失败，则运行以下函数
	          error: function(error) {
	              console.log(error)
	          }
	        })


	//         var keywrodsArr = ['住宅','写字楼','商业','地铁站','码头','机场','公交站','车站','学校','培训机构','医院','诊所','药店','娱乐','购物','餐饮','银行'], idx = 0, list = [], has = [];
	//         searchService.searchNearBy(keywrodsArr[idx], new qq.maps.LatLng(lat, lng) , 1000);

	//         // var autocomplete = new qq.maps.place.Autocomplete(document.getElementById('searchAddr'), {});
	//         var keyObj = $("#searchAddr");
	//         var searchBox = {top : keyObj.height() + keyObj.offset().top, left: keyObj.offset().left, width: keyObj.width()};
	//         var searchServiceInput = new qq.maps.SearchService({
	//           pageCapacity:10,
	//           //检索成功的回调函数
	//           complete: function(results) {
	//             if($(".qqmap_autocomplete").length == 0){
	//               var style = '.qqmap_autocomplete{position:absolute;display:none;left:'+searchBox.left+'px;top:'+searchBox.top+'px;width:'+searchBox.width+'px;}.tangram-suggestion{border:1px solid #e4e6e7;font-family:Arial,Helvetica,"Microsoft YaHei",sans-serif;background:#fff;cursor:default;}.tangram-suggestion table{width:100%;font-size:12px;cursor:default;}.tangram-suggestion table tr td{overflow:hidden;height:32px;padding:0 10px;font-style:normal;line-height:32px;text-decoration:none;color:#666;cursor:pointer;}.tangram-suggestion .route-icon{overflow:hidden;padding-left:20px;font-style:normal;background:url(http://webmap1.map.bdstatic.com/wolfman/static/common/images/ui3/tools/suggestion-icon_013979b.png) no-repeat 0 -14px;}.tangram-suggestion-current{background:#ebebeb;}.tangram-suggestion-prepend{padding:2px;font:12px verdana;color:#c0c0c0;}.tangram-suggestion-append{padding:2px;font:12px verdana;text-align:right;color:#c0c0c0;}.tangram-suggestion-grey{color:#c0c0c0;}';
	//               style = '<style>'+style+'</style>';
	//               var html = '';
	//               html += '<div class="qqmap_autocomplete" id="qqmapSearch">';
	//               html += ' <div class="tangram-suggestion">';
	//               html += '  <table>';
	//               html += '   <tbody>';
	//               html += '    </tbody>';
	//               html += '   </table>';
	//               html += ' </div>';
	//               html += '</div>';
	//               $("body").append(style + html);
	//             }

	//             var box = $("#qqmapSearch");
	//             var data = [];
	//             if(results.type == "POI_LIST"){
	//               for(var i = 0; i < results.detail.pois.length; i++){
	//                 var d = results.detail.pois[i];
	//                 data.push('<tr data-lng="'+d.latLng.lng+'" data-lat="'+d.latLng.lat+'"><td><i class="route-icon">'+d.name+'</td></tr>')
	//               }
	//             }
	//             if(data.length){
	//               box.show().find("tbody").html(data.join(""));
	//             }else{
	//               box.hide();
	//             }

	//           },
	//           error: function(err){
	//             var box = $(".qqmap_autocomplete");
	//             box.hide();
	//           }
	//         })
	        // $("#searchAddr").keyup(function(){
	        //   var t = $(this), v = t.val();
	        //   if(v){
	        //     v = v.replace("号", "");
	        //     searchServiceInput.search(v);
	        //   }
	        // })

	        // $("body").delegate("#qqmapSearch tbody tr", "click", function(e){
	        //   e.stopPropagation();
	        //   var t = $(this);
	        //   lng = t.attr("data-lng");
	        //   lat = t.attr("data-lat");
	        //   gzAddrSeladdr.find("input#addr").val(t.text());
	        //   gzAddrMap.hide();
	        //   gzAddress.show();
	        //   $("#qqmapSearch").hide();
	        // }).on("click", function(e){
	        //   $("#qqmapSearch").hide();
	        // })

	//         qq.maps.event.addListener(map ,"bounds_changed", function(latLng){
	//           var lnglat = map.getCenter();
	//           lng = lnglat.lng;
	//           lat = lnglat.lat;

	//           list = [];
	//           has = [];
	//           idx = 0;
	//           searchService.searchNearBy(keywrodsArr[idx], new qq.maps.LatLng(lat, lng) , 1000);
	//         })

	        // function in_array(arr, hack){
	        //   for(var i in arr){
	        //     if(arr[i] == hack){
	        //       return true;
	        //     }
	        //   }
	        //   return false;
	        // }

	      }

	    }
	    operation();
	  }

	})

	// 搜索匹配地址
	var page = 0,  totalPage = 0, totalCount = 0, isload = false, pagetoken = '';
	// directory = getQueryString('directory');
	// document.title = directory;
	// wxconfig.title = directory;
	// wxconfig.link = location.href;

	var typing = false;
    $('#search_posi').on('compositionstart',function(){
        typing = true;
    })
    $('#search_posi').on('compositionend',function(){
        typing = false;
    })
	$('#search_posi').on('keyup',function(){
		var t = $(this);
		directory = t.val()
		//console.log(typing)
		page = 1;
		if(!typing){
          if(t.val()!=''){
            getSearch_posi();
			$('.src_rec').hide();
			$('.src_search').show();
			$('.search_box .clear').show();
		  }else{
			$('.src_rec').show();
			$('.src_search').hide();
			$('.search_box .clear').hide();
		  }
       }

	});
	$('.search_box .clear').click(function(){
		$('#search_posi').val('');
		$('.src_rec').show();
		$('.src_search').hide();
	});

	// 下拉加载
	$('.src_search').scroll(function(){
		 if ($('.src_search').scrollTop() >= $('.src_search>ul').height() - $('.src_search').height() - 80 && !isload && page < totalPage) 			{
			 page++;
			 getSearch_posi();
		 }
	})

	function getSearch_posi(pagetokentmp){
		if(sp_ajax){
			sp_ajax.abort();
		};

		pagetokentmp = pagetokentmp == '' || pagetokentmp == undefined ? '' : pagetokentmp;
				isload = true;
				$('.search_posi .loading').remove();
				$('.search_posi').append('<div class="loading"><span>'+langData['circle'][0][17]+'</span></div>');  /* 加载中~*/
	      sp_ajax = $.ajax({
					url: '/include/ajax.php?service=siteConfig&action=get114ConveniencePoiList&pageSize=20&page='+page+'&lng='+lng+'&lat='+lat+'&directory='+directory+'&radius='+radius+"&pagetoken="+pagetoken,
					dataType: 'jsonp',
					success: function(data){
						isload = false;
						$('.loading').remove();
						if(data.state == 100){
							totalPage = data.info.totalPage;
							totalCount = data.info.totalCount;
							pagetoken = data.info.pagetoken == '' || data.info.pagetoken == null ? '' : data.info.pagetoken;
							var list = data.info.list;
							if(list.length > 0){
								var tmp = [];
								$.each(list, function (i, n) {
									 tmp.push( ' <li class="posi_li" data-lng = '+n.lng+' data-lat = '+n.lat+'>      ');
									 tmp.push( ' <h2>'+n.name+'</h2>                           ');
									 tmp.push( ' <div class="detail_posi fn-clear">                    ');
									 tmp.push( ' <span>'+mapDistance(Number(lat), Number(lng), Number(n.lat), Number(n.lng))+'</span> ');
									 tmp.push( ' <p>'+n.address+'</p>     ');
									 tmp.push( ' </div>                                                ');
									 tmp.push( ' </li>                                                 ');

								});
								if(page==1){
									$('.search_posi').html(tmp.join(''));
								}else{
									$('.search_posi').append(tmp.join(''));
								}

							}else{
								if(totalPage < page && page > 1){
									//console.log('ddddd')
								}else{
									//console.log('hehehe')
									$('.scrBox .search_posi').html('<div class="noData loading"><img src="'+templets_skin+'images/f_null.png"><p>'+langData['circle'][2][31]+'</p></div>');  /* 没有找到您的位置~*/
								}
							}

						}else{
							console.log('hahaha')
							$('.scrBox .search_posi').html('<div class="noData loading"><img src="'+templets_skin+'images/f_null.png"><p>'+langData['circle'][2][31]+'</p></div>');   /* 没有找到您的位置~*/
						}
					},
					error: function(){
						isload = false;
						$('.loading').remove();
						//showErr(langData['circle'][2][32]);  /* 网络错误，加载失败！*/
					}
				});
	}


	//获取url中的参数
	function getQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", 'i'); // 匹配目标参数
		var result = window.location.search.substr(1).match(reg); // 对querystring匹配目标参数
		if (result != null) {
			return decodeURIComponent(result[2]);
		} else {
			return null;
		}
	}

	//计算距离
	var mapDistance=function(lat_a,lng_a,lat_b,lng_b){
			var pk = 180 / 3.14169;
			var a1 = lat_a / pk;
			var a2 = lng_a / pk;
			var b1 = lat_b / pk;
			var b2 = lng_b / pk;
			var t1 = Math.cos(a1) * Math.cos(a2) * Math.cos(b1) * Math.cos(b2);
			var t2 = Math.cos(a1) * Math.sin(a2) * Math.cos(b1) * Math.sin(b2);
			var t3 = Math.sin(a1) * Math.sin(b1);
			var tt = Math.acos(t1 + t2 + t3);


			var km = 6366000 * tt / 1000;
			if(km<1){
				km = (km*1000).toFixed(0)+'m'
			}else{
				km = km.toFixed(2)+'km';
			}

			return km;
	};







	/*=================================商品链接选择 相关=====================================*/
	var lpage = 0,  ltotalPage = 0, ltotalCount = 0, lload = false ;
	// 显示选择框
	$('.linkBox h1').click(function() {
		$('.mask_link').show();
		$('.link_box').animate({
			'bottom': 0
		}, 150);
		$('html').addClass('noscroll');
	});
	// 隐藏选择框
	$('.mask_link,.link_box .cancel_btn').click(function() {
		$('.mask_link').hide();
		$('.link_box').animate({
			'bottom': '-4.1rem'
		}, 150);
		$('html').removeClass('noscroll');
	});

	// 链接选择
	$('.link_opt .li_opt').click(function() {
		var t = $(this);
		var type = t.attr('data-type');
		$('.mask_pl').show();
		$('.mask_link').click();
		if (type == 0) {
			$('.link_pro').animate({
				'bottom': '0'
			}, 200);
			if($('.pro_box .show').find('li').size()==0){
				lpage = 1
				get_prolist()
			}

		} else {
			$('.link_in').animate({
				'bottom': '0'
			}, 150);
		}
		$('html').addClass('noscroll');
	});

	// 隐藏
	$('.mask_pl,.link_pro .cancel_btn,.link_in .cancel_btn').click(function() {
		$('.mask_pl').hide();
		$('.link_in').animate({
			'bottom': '-6.2rem'
		}, 150);
		$('.link_pro').animate({
			'bottom': '-90%'
		}, 200);
		$('html').removeClass('noscroll');
	});

	// 关联商品导航切换
	$('.sort_nav li').click(function() {
		var t = $(this);
		var type = t.attr('data-type');
		var index = t.index();
		t.addClass('active').siblings('li').removeClass('active');
		$('.pro_box ul').eq(index).addClass('show').siblings('ul').removeClass('show');
		if($('.pro_box .show').find('li').size()==0 || $('#search_pro').val()!=''){
			lpage = 1;
			get_prolist(type)
		}

	});

	// 选择关联商品

	$('.pro_box').delegate('.pro_li', 'click', function() {
		var t = $(this)
		if (!t.hasClass('chosed')) {
			t.addClass('chosed');
			$('.link_pro h1 a').hide();
			$('.link_pro h1 a.sure_btn').show();
		} else {
			t.removeClass('chosed');
			if ($('.pro_li.chosed').size() == 0) {
				$('.link_pro h1 a').hide();
				$('.link_pro h1 a.cancel_btn').show();
			}
		}
	});

	// 点击关联商品确定按钮
	$('.link_pro .sure_btn').click(function() {
		var prolist = [];
		$('.pro_li').each(function() {
			var pro = {};
			var t = $(this);
			var p_name = t.find('.right_info h2').text(); //商品名称
			var p_id = t.attr('data-id'); //商品id
			var p_price = t.find('.right_info .price').text(); //商品价格
			var p_url = t.find('.left_proimg').attr('href'); //商品链接
			var p_img = t.find('.left_proimg img').attr('src');
			var p_type = t.parents('ul').attr('data-type')
			if (t.hasClass('chosed')) {
				pro = {
					"id": p_id,
					"name": p_name,
					"price": p_price,
					"url": p_url,
					"litpic": p_img,
					'type' : p_type
				}
				if ($('.li_show[data-id="' + p_id + '"][data-link="'+p_type+'"]').size() == 0) {
					// 新增未添加的商品
					prolist.push('<li class="li_show fn-clear" data-litpic="' + p_img + '" data-link="'+p_type+'" data-type="pro" data-url="' + p_url + '" data-id="' + p_id + '" data-title="' + p_name + '" data-price="' + p_price + '">');
					prolist.push('<div class="l_img"><img src="' + p_img + '" /></div>');
					prolist.push('<div class="r_info"><h2> ' + p_name + ' </h2>');
					prolist.push('<p>' + p_price + '</p></div><i class="clear"></i></li>');
				}

			}

		})
		$('.pro_show ul').append(prolist.join(''));
		$('.mask_pl').click();
	});

	// 链接
	$('.l_inbox').focus(function() {
		$('.l_inbox').find('span').remove();
	});

	$('.l_inbox').blur(function() {
		if($('.l_inbox').text()==''){
			$('.l_inbox').append('<span class="tip">'+langData['circle'][2][19]+'</span>'); /* 在这里粘贴链接*/
		}
	});

	$('.l_inbox').bind('input propertychange', function() {
		var url = $('.l_inbox').text();
		if (url != '') {
			$('.link_in h1 a').hide();
			$('.link_in h1 a.sure_btn').show();
		} else {
			$('.link_in h1 a').hide();
			$('.link_in h1 a.cancel_btn').show();
		}
	});

	// 链接确定点击
	$('.link_in h1 a.sure_btn').click(function() {
		var uText = $('.l_inbox').text().replace(/(^\s*)|(\s*$)/g, "");
		var reg = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
		var title = $('.l_title').val();
		var li_litpic = $('.link_info .liimg').attr('data-url');
		if(reg.test(uText)){
			$('.mask_pl').click();
			var src = li_litpic?'/include/attachment.php?f='+li_litpic:templets_skin+'images/link_icon.png';
			$('.pro_show ul').append(
				'<li class="li_show fn-clear" data-type="link" data-title="'+title+'" data-url="'+uText+'"><div class="l_img"><img src="'+src+'"></div><div class="r_info"><h2> '+title+' </h2></div><i class="clear"></i></li>');
		}else{
			showErr(langData['circle'][2][32]) ; /* 这不是正确的链接*/
		}

	});

	// 到底加载
	$('.pro_box').scroll(function(){
		var type = $('.pro_box>ul.show').attr('data-type');
		if ($('.pro_box').scrollTop() >= $('.pro_box>ul.show').height() - $('.pro_box').height() - 80 && !lload && lpage < ltotalPage)
		{
			lpage++;
			get_prolist();
		}
	});

	// 搜索
	$('#search_pro').bind('input propertychange',function(){
		var t = $(this);
		if($('#search_pro').val()!=''){
			$('.link_pro .clear').show();
		}else{
			$('.link_pro .clear').hide();
		};
		lpage = 1 ;
		get_prolist();
	});

	// 清空搜索框
	$('.link_pro .clear').click(function(){
		$('#search_pro').val('');
		lpage = 1 ;
		get_prolist();
	});

	function get_prolist(){
		if(pl_alax){
			pl_alax.abort();
		}
		var type = $('.pro_box ul.show').attr('data-type');

		lload = true;
		keywords = $('#search_pro').val();
		var data = [];
		data.push('page='+lpage);
		data.push('keywords='+keywords);
		url = '/include/ajax.php?service=shop&action=slist&pageSize=20&'+data.join('&');
		$('.pro_box .show .loading').remove();
		$('.pro_box .show').append('<div class="loading"><span>加载中~</span></div>');

		pl_alax = $.ajax({
			url: url,
			type: "GET",
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				lload = false;
				$('.pro_box .show .loading').remove();
				if (data.state == 100) {
					var list = [],item = data.info.list;
					ltotalPage = data.info.pageInfo.totalPage;
					ltotalCount = data.info.pageInfo.totalCount;
					var label = $('.pro_box .show').attr('data-name');
					if(item.length>0){

						for(var i = 0; i<item.length; i++){
							var chosed = '';
							$('.pro_show li').each(function(){
								var t = $(this);
								if(t.attr('data-link') == type && t.attr('data-id') == item[i].id){
									chosed = "chosed";
								}
							});
							list.push('<li class="pro_li '+chosed+'" data-id="'+item[i].id+'" >');
							list.push('<a href="'+item[i].url+'" class="left_proimg">');
							//list.push('<i>'+label+'</i>');
							// list.push('<img data-url="'+item[i].litpic+'" src="/static/images/blank.gif" />');
							list.push('<img data-url="'+item[i].litpic+'" src="'+item[i].litpic+'" />');
							list.push('</a>');
							list.push('<div class="right_info">');
							list.push('<h2>'+item[i].title+'</h2>');
							if(item[i].price){
								list.push('<p class="price"><em>'+echoCurrency('symbol')+'</em>'+item[i].price+'</p>');
							}else{
								list.push('<p class="price"><em>'+echoCurrency('symbol')+'</em>'+item[i].price+'</p>');
							}

							list.push('</div>');
							list.push('</li>');

						}
						if(lpage==1){
							 $('.pro_box .show').html(list.join(''));
						}else{
							 $('.pro_box .show').append(list.join(''));
						}

						// $('.pro_box .show img').scrollLoading(); //懒加载
					}else{
						if(ltotalPage < lpage && lpage > 0){
							showErr(langData['circle'][2][33]);  /* 已经到底啦！*/
						}else{
							$('.pro_box .show').html('<div class="noData loading"><img src="'+templets_skin+'images/f_null.png"><p>'+langData['circle'][2][34]+'</p></div>')   /* 暂无符合条件的商品哦~*/
						}
					}

				} else {
					$('.pro_box .show').html('<div class="noData loading"><img src="'+templets_skin+'images/f_null.png"><p></p>'+langData['circle'][2][34]+'</div>')  /* 暂无符合条件的商品哦~*/
				}
			},
			error: function(err) {
				console.log('fail');

			}
		});

	}

	// 删除已关联商品
	$('.pro_show').delegate('.clear','tap',function(){
		var t = $(this);
		t.parents('.li_show').remove();
	})




	/* =============================文件上传=========================== */

	$('.upload_btn').click(function(){
		var t = $(this);
		if(t.siblings('li').size()>0){
			//此处需要遍历li来获取
			var len = 9-$('.thumbnail.imgshow_box').length; //已经上传的图片
			if(device.indexOf('huoniao') > -1){  //如果是app
				setupWebViewJavascriptBridge(function(bridge) {
				   bridge.callHandler('chooseAlbum', {"value":len,"filetype":"image"}, function callback(DataInfo){
					   if(DataInfo){
							$('.mask_upfile').click();
							var data = JSON.parse(DataInfo);
							for(var i=0 ; i<data.length; i++){
								$('#fileList .upload_btn').before('<li class="thumbnail imgshow_box litpic"><div class="img_show"><img src="' + data[i].turl + '" data-url="' + data[i].url + '" /></div><i class="del_img"></i></li>');
								$('.upload_btn').find('p').text(langData['circle'][2][41])  /* 继续上传*/
							}
							if(data.length==len){
								 $('.upload_btn').hide();
							}
					   }
				   });
				 });
			}else if(device.toLowerCase().match(/MicroMessenger/i) == "micromessenger"){
				$("#filePicker").click()
			}else{

				$('#filePicker input').click();
			}

		}else{
			$('.mask_upfile').show();
			$('html').addClass('noscroll');
			$('.upfile_box').animate({"bottom":"0"},150);
		}
	});

	// 关闭上传按钮
	$('.mask_upfile,.upfile_box .cancel_btn').click(function(){
		$('.mask_upfile').hide();
		$('html').removeClass('noscroll');
		$('.upfile_box').animate({"bottom":"-4.2rem"},150);
	})

	// /*视频上传*/
	var upvideoShow = new Upload({
		btn: '.chose_photo.webuploader-container',
		bindBtn: '',
		title: 'Video',
		mod: 'circle',
		msg_maxImg: langData['circle'][2][35],   /*视频数量已达上限 */
		params: 'type=thumb&filetype=video',
		atlasMax: 1,
		deltype: 'delVideo',
		replace: false,
		chunked: true,
		accept: {
			title: 'Video',
			extensions: 'mp4,mov,mkv,rm,rmvb',
			mimeTypes: 'video/*'
		},
		fileQueued: function(file) {
			var has = $("#up_videoShow").siblings('li');

			$(".upload_btn").before('<li class="video_li" id="' + file.id + '"></li>');
			// $(".upload_btn").hide();

			// 隐藏视频/照片选择
			$('.mask_upfile').hide();
			$('html').removeClass('noscroll');
			$('.upfile_box').animate({"bottom":"-4.2rem"},150);
		},
		uploadSuccess: function(file, response) {

			if (response.state == "SUCCESS") {
				console.log(response)
				$('#' + file.id).html('<div class="img_show"><img class="vposter" data-url="'+response.poster+'" src="'+(response.poster.indexOf('http') > -1 ? response.poster : '/include/attachment.php?f=' + response.poster)+'"><video src="' + (response.turl ? response.turl : (response.url.indexOf('http') > -1 ? response.url : '/include/attachment.php?f=' + response.url)) + '" data-poster="'+(response.poster.indexOf('http') > -1 ? response.poster : '/include/attachment.php?f=' + response.poster)+'" data-url="' + response.url +
					'" /></div><i class="del_v"></i>');
				$(".upload_btn").hide();
				$('.header-search a').removeClass('fn-hide');
				$('#videoPoster').val(response.poster)
				if (device.indexOf('huoniao') > -1) {
					// 此处APP端需要隐藏发布按钮
					setupWebViewJavascriptBridge(function(bridge) {
						bridge.callHandler('toggleFabuCircleBtn', {"value":"on"}, function(){});
					});
				}
			}
		},
		uploadFinished: function() {
			if (this.sucCount == this.totalCount) {
				//         showErr('所有图片上传成功');
			} else {
				showErr((this.totalCount - this.sucCount) + langData['circle'][2][36]);  /* 个视频上传失败*/

				// 上传失败时，删除之前生成的video_li
				$(".upload_btn").hide();
				$('.video_li').remove();
			}

			updateVideo();
		},
		uploadError: function() {

		},
		showErr: function(info) {
			showErr(info);
		}
	});

	// /*链接图片上传*/
	var uplinkImg = new Upload({
		btn: '.liup_btn',
		bindBtn: '',
		title: 'Image',
		mod: 'circle',
		msg_maxImg: langData['circle'][2][35],   /*视频数量已达上限 */
		params: 'type=thumb&filetype=image',
		atlasMax: 1,
		deltype: 'delImage',
		replace: false,
		chunked: true,
		accept: {
			title: 'Image',
			extensions: 'jpg,jpeg,bmp,png,gif',
			mimeTypes: 'image/*'
		},
		fileQueued: function(file) {
			 var Orientation = 0;
			 var fileExif = file.source.source;
			 var fileName = fileExif.name;
			 var newFile = null;
			 //图片方向角
			 var rFilter = /^(image\/jpeg|image\/png|image\/jpg|image\/gif|image\/jpe)$/i; // 检查图片格式
			 if (rFilter.test(file.type) && file.source.source !== undefined) {
			 	console.log("旋转开始");
			 	EXIF.getData(file.source.source, function() {
			 		Orientation = EXIF.getTag(this, 'Orientation');
			 		if (fileExif && Orientation > 1) {
			 			//获取照片方向角属性，用户旋转控制
			 			var oReader = new FileReader();
			 			oReader.readAsDataURL(fileExif);
			 			oReader.onload = function(e) {
			 				var image = new Image();
			 				image.src = e.target.result;
			 				image.onload = function() {
			 					var expectWidth = this.naturalWidth;
			 					var expectHeight = this.naturalHeight;

			 					var canvas = document.createElement("canvas");
			 					var ctx = canvas.getContext("2d");
			 					canvas.width = expectWidth;
			 					canvas.height = expectHeight;
			 					ctx.drawImage(this, 0, 0, expectWidth, expectHeight);
			 					var base64 = null;
			 					//修复ios
			 					if (navigator.userAgent.match(/iphone/i)) {
			 						console.log('iphone');
			 						if(Orientation != "" && Orientation != 1){
			 							switch(Orientation){
			 								case 6:
			 									rotateImg(this,'left',canvas);
			 									break;
			 								case 8:
			 									rotateImg(this,'right',canvas);
			 									break;
			 								case 3:
			 									rotateImg(this,'right',canvas);//转两次
			 									rotateImg(this,'right',canvas);
			 									break;
			 							}
			 						}
			 						base64 = canvas.toDataURL(fileExif.type, 1);
			 					}else if (navigator.userAgent.match(/Android/i)) {// 修复android
			 						var encoder = new JPEGEncoder();
			 						base64 = encoder.encode(ctx.getImageData(0, 0, expectWidth, expectHeight), 80);
			 					}else{
			 						if(Orientation != "" && Orientation != 1){
			 							switch(Orientation){
			 								case 6:
			 									rotateImg(this,'left',canvas);
			 									break;
			 								case 8:
			 									rotateImg(this,'right',canvas);
			 									break;
			 								case 3:
			 									rotateImg(this,'right',canvas);//转两次
			 									rotateImg(this,'right',canvas);
			 									break;
			 							}
			 						}
			 						base64 = canvas.toDataURL(fileExif.type, 1);
			 					}
			 					var baseFile = dataURLtoFile(base64, fileName);
			 					newFile = baseFile;
			 					file.source.source = newFile;
			 				};
			 			};
			 		}
			 	});
			 }
		},
		uploadSuccess: function(file, response) {

			if (response.state == "SUCCESS") {


				$('.liup_btn').hide();
				$('.li_r').append('<img class="liimg" src="/include/attachment.php?f='+response.url+'" data-url="' + response.url +'">');
				$('.li_r .del_liimg').show();
			}
		},
		uploadFinished: function() {
			if (this.sucCount == this.totalCount) {
				//         showErr('所有图片上传成功');
			} else {

				// 上传失败时，删除之前生成的video_li
			//	$(".upload_btn").hide();
				$('.li_r .del_liimg').remove();
				$('.liup_btn').show();
			}


		},
		uploadError: function() {

		},
		showErr: function(info) {
			showErr(info);
		}
	});

	$('#fileList').delegate('.del_v', 'click', function() {
		var t = $(this),
			val = t.siblings('video').attr('data-url');
		upvideoShow.del(val);
		t.parent().remove();
		updateVideo();
		$('#videoPoster,#videoTime').val('');
		$(".upload_btn").show();
		$('#filePicker').removeClass('disabled')
		if($('.input_container textarea').val()==''){
			$('.header-search a').addClass('fn-hide');
			if (device.indexOf('huoniao') > -1) {
				// 此处APP端需要隐藏发布按钮
				setupWebViewJavascriptBridge(function(bridge) {
					bridge.callHandler('toggleFabuCircleBtn', {"value":"off"}, function(){});
				});
			}
		}
	});
	$('#fileList').delegate('.del_img', 'click', function() {
		var t = $(this),
		val = t.siblings('img').attr('data-url');
		t.parents('li.imgshow_box').remove();
		$(".upload_btn").show();
		if($('.input_container textarea').val()=='' && $('.imgshow_box').length==0){
			if (device.indexOf('huoniao') > -1) {
				// 此处APP端需要隐藏发布按钮
				setupWebViewJavascriptBridge(function(bridge) {
					bridge.callHandler('toggleFabuCircleBtn', {"value":"off"}, function(){});
				});
			}
		}
	});

	$('.del_liimg').click(function(){
		$('.li_r .liimg').remove();
		$(this).hide();
		$('.liup_btn').show();
		uplinkImg.del($('.li_r .liimg').attr('data-url'));
	})

	function updateVideo() {
		var video = [];
		$('#video').val($('.video_li').find('video').attr("data-url"))

	}

	// 视频预览
	var player;
	$('body').delegate('.video_li .img_show', 'click', function() {
		var src = $(this).find('video').attr('src'), poster = $(this).find('video').attr('data-poster');
		$('.videobox').show();
		player = new Aliplayer({
			"id": "im-video_show",
			"source": src,
			"width": "100%",
			"height": "100%",
			"autoplay": false,
            'cover': poster,
			"rePlay": false,
			"playsinline": true,
			"preload": true,
			"controlBarVisibility": "hover",
			"useH5Prism": true,
			'skinLayout': false
		}, function(player) {
			$('.videobox .v_play').removeClass('fn-hide')
			console.log("创建成功");
		});

		// 监听是否播放结束
		player.on('ended',function(){
			$('.videobox .v_play').removeClass('fn-hide')
		})
	});
	// 播放
	$('.videobox .v_play').click(function(e){
		player.play();
		$('.videobox .v_play').addClass('fn-hide')
	});

	// 返回
	$('.videobox  .close_video').click(function(){
		player.dispose();
		$('.videobox').fadeOut();
	})


	// 删除
	$('.videobox .video_del').click(function(e){
		$('.video_li .del_v').click();
		player.dispose();
		$('.videobox').fadeOut();
	});




	// 图片相关
	//删除已上传图片
	var delAtlasPic = function(b) {
		var g = {
			mod: modelType,
			type: "delAtlas",
			picpath: b,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			url: "/include/upload.inc.php",
			data: $.param(g)
		})
	};

	//上传凭证
	var $list = $('#fileList'),
		uploadbtn = $('#uploadbtn'),
		ratio = window.devicePixelRatio || 1,
		fileCount = 0,
		thumbnailWidth = 100 * ratio, // 缩略图大小
		thumbnailHeight = 100 * ratio, // 缩略图大小
		uploader;

	fileCount = $list.find('li').length;
	fileCount = fileCount - 1;
	var userAgent = navigator.userAgent.toLowerCase();
		if (userAgent.match(/MicroMessenger/i) == "micromessenger") {
			var upoptions = {
				btn: '#filePicker',
				atlasMax:9,
				del_btn:'.del',
		
			}
		   wxUploader(upoptions,
			// 上传成功后触发
			function(data){
				var fid = data.fid, url = data.url, turl = data.turl, time = new Date().getTime(), id = "wx_upload" + time;
						 
				var $li = $('<li id="' + id + '" class="thumbnail imgshow_box litpic"><div class="img_show"><img src="'+turl+'" data-val="'+fid+'" data-url="'+turl+'"></div><i class="del"></i></li>');
					$(".upload_btn").before($li);
					litpicsArr = $('#litpic').val() == '' ? [] : $('#litpic').val().split(',')
					litpicsArr.push(fid);
				$('#litpic').val(litpicsArr.join(','))
		   },function(){
			$(".cancel_btn").click(); //隐藏弹窗
		   })

		}else{
			// 初始化Web Uploader
			uploader = WebUploader.create({
				auto: true,
				swf: staticPath + 'js/webuploader/Uploader.swf',
				server: '/include/upload.inc.php?mod=' + modelType + '&type=' + upType1,
				//'/include/upload.inc.php?mod='+modelType+'&type='+upType1
				pick: {
	                id: '#filePicker',
	                multiple: !isAndroidWxmini() ? true : false
	            },
				fileVal: 'Filedata',
				accept: {
					title: 'Images',
					extensions: 'jpg,jpeg,gif,png',
					mimeTypes: 'image/*'
				},
				compress: {
					width: 8000,
					height: 8000,
					// 图片质量，只有type为`image/jpeg`的时候才有效。
					quality: 90,
					// 是否允许放大，如果想要生成小图的时候不失真，此选项应该设置为false.
					allowMagnify: false,
					// 是否允许裁剪。
					crop: false,
					// 是否保留头部meta信息。
					preserveHeaders: true,
					// 如果发现压缩后文件大小比原来还大，则使用原来图片
					// 此属性可能会影响图片自动纠正功能
					noCompressIfLarger: false,
					// 单位字节，如果图片大小小于此值，不会采用压缩。
					compressSize: 1024 * 200
				},
				fileNumLimit: atlasMax,
				fileSingleSizeLimit: atlasSize,

			});

			// 当有文件添加进来的时候
			uploader.on('fileQueued', function(file) {
				//先判断是否超出限制
				if (fileCount >= atlasMax) {
					showErr(langData['circle'][2][37]);  /*图片数量已达上限 */


					// $(".uploader-btn .utip").html('<font color="ff6600">图片数量已达上限</font>');
					return false;
				}
				fileCount++;
				addFile(file);
				//			$('#uploadbtn').append('<li>1111<li>')
				updateStatus();
				// 隐藏视频/照片选择
				$('.mask_upfile').hide();
				$('html').removeClass('noscroll');
				$('.upfile_box').animate({"bottom":"-4.2rem"},150);


			});

			// 文件上传过程中创建进度条实时显示。
			uploader.on('uploadProgress', function(file, percentage) {
				var $li = $('#' + file.id),
					$percent = $li.find('.progress span');

				// 避免重复创建
				if (!$percent.length) {

					$percent = $('<p class="progress"><span></span></p>')
						.appendTo($li)
						.find('span');

				}
				$percent.css('width', percentage * 100 + '%');
			});

			// 文件上传成功，给item添加成功class, 用样式标记上传成功。
			uploader.on('uploadSuccess', function(file, response) {
				console.log(response)
				var $li = $('#' + file.id);
				if (response.state == "SUCCESS") {
					$li.find("img").attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
					$('.v_btn').addClass('disabled');

					var pics = []
					$('#fileList li.imgshow_box').each(function(){
						var t = $(this);
						pics.push(t.find('img').attr('data-val'));
					})
					$('#litpic').val(pics.join(','));
					$('.header-search a').removeClass('fn-hide');
					if (device.indexOf('huoniao') > -1) {
						// 此处APP端需要隐藏发布按钮
						setupWebViewJavascriptBridge(function(bridge) {
							bridge.callHandler('toggleFabuCircleBtn', {"value":"on"}, function(){});
						});
					}
				} else {
					removeFile(file);
					// showErr(langData['circle'][2][38]);  /*'上传失败！' */
					showErr(response.state);


					// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
				}
			});

			// 文件上传失败，现实上传出错。
			uploader.on('uploadError', function(file) {
				removeFile(file);
				showErr(langData['circle'][2][38]);  /*'上传失败！' */
				// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
			});

			// 完成上传完了，成功或者失败，先删除进度条。
			uploader.on('uploadComplete', function(file) {
				$('#' + file.id).find('.progress').remove();
			});

			//上传失败
			uploader.on('error', function(code) {
				var txt = langData['circle'][2][38];   /*'上传失败！' */
				switch (code) {
					case "Q_EXCEED_NUM_LIMIT":
						txt = langData['circle'][2][36];  /* "图片数量已达上限"*/
						break;
					case "F_EXCEED_SIZE":
						txt = langData['circle'][2][39] + atlasSize / 1024 / 1024 + "MB";  /* "图片大小超出限制，单张图片最大不得超过"*/
						break;
					case "F_DUPLICATE":
						txt = langData['circle'][2][40];  /* 此图片已上传过*/
						break;
				}
				showErr(txt);
				// $(".uploader-btn .utip").html('<font color="ff6600">'+txt+'</font>');
			});
		}

		




	//更新上传状态
	function updateStatus() {

		if (atlasMax > 1 && $list.find('.litpic').length == 0) {
			$list.children('li').eq(0).addClass('litpic');
		}
		if (atlasMax == fileCount) {
			$('.upload_btn').hide();
		} else if (fileCount == 0) {

			$('.upload_btn').find('p').text(upVideo==1?langData['circle'][2][3]:'照片');  /* 照片/视频*/
			$('.v_btn').removeClass('disabled');
			if($('.input_container textarea').val()==''){
				$('.header-search a').addClass('fn-hide');
				if (device.indexOf('huoniao') > -1) {
					// 此处APP端需要隐藏发布按钮
					setupWebViewJavascriptBridge(function(bridge) {
						bridge.callHandler('toggleFabuCircleBtn', {"value":"off"}, function(){});
					});
				}
			}
		} else {
			$('.upload_btn').show();
			$('.upload_btn').find('p').text(langData['circle'][2][41])  /* 继续上传*/
		}
		var nowpic = [];
		$('#fileList li.imgshow_box').each(function(){
			var t = $(this);
			nowpic.push(t.find('img').attr('data-val'));
		})
		$('#litpic').val(nowpic.join(','))

	}

	// 负责view的销毁
	function removeFile(file) {
		var $li = $('#' + file.id);
		fileCount--;
		delAtlasPic($li.find("img").attr("data-val"));
		$li.remove();
		updateStatus();
	}

	//从队列删除
	$list.delegate(".del", "click", function() {
		var t = $(this),
			li = t.closest("li");
		var file = [];
		file['id'] = li.attr("id");
		removeFile(file);
	});

	// 切换litpic
	if (atlasMax > 1) {
		$list.delegate(".item img", "click", function() {
			var t = $(this).parent('.item');
			if (atlasMax > 1 && !t.hasClass('litpic')) {
				t.addClass('litpic').siblings('.item').removeClass('litpic');
			}
		});
	}

	// 当有文件添加进来时执行，负责view的创建
	function addFile(file) {
		var $li = $('<li id="' + file.id + '" class="thumbnail imgshow_box"><div class="img_show"><img></div></li>');
		var $btns = $('<i class="del"></i>').appendTo($li),
			$img = $li.find('img');

		// 创建缩略图
		uploader.makeThumb(file, function(error, src) {
			if (error) {
				$img.replaceWith('<span class="thumb-error">不能预览</span>');
				return;
			}
			$li.find('img').attr('src', src);

		}, thumbnailWidth, thumbnailHeight);

		$btns.on('click', function() {
			uploader.removeFile(file, true);
		});

		$('.upload_btn').before($li);

	}

	// 在app中点击拍摄或者相册
	$('.up_btngtoup.app_group>a').off('click').on('click',function(){
		var t = $(this);
        $('.mask_upfile').click();
		if(t.hasClass('photo_btn')){    //拍摄
			setupWebViewJavascriptBridge(function(bridge) {
			   bridge.callHandler('invokeCircleDynamic', {}, function callback(DataInfo){
				   if(DataInfo){
				   	  var data = JSON.parse(DataInfo);
				   	  // 判断文件类型
				   	  for(var i=0 ; i<data.length; i++){

						 var type = '';
						 type = (data[i].fileType).substring((data[i].fileType.indexOf('.')+1),data[i].fileType.length);
						 type=type.toUpperCase();

						 if(type=="MP4"||type=="MOV"||type=="RMVB"||type=="WMV"||type=="3GP"||type=="M4V"||type=="AVI"||type=="MKV"||type=="FLV"){

							 $('#fileList .upload_btn').before('<li class="video_li"><div class="img_show"><img class="v_poster" data-url="'+data[i].videoPoster+'" src="'+data[i].videoPoster+'" /><video src="' + data[i].turl + '" data-url="' + data[i].url + '" /></div><i class="del_v"></i></li>');
							 $('.mask_upfile').click();
							 $('#fileList .upload_btn').hide();
							  $('#videoPoster').val(data[i].videoPosterUrl ? data[i].videoPosterUrl : data[i].videoPoster);
							  $('#videoTime').val(data[i].videoTime);
                              $('#video').val(data[i].url)
						 }else if(type=="JPG"||type=="JPEG"||type=="GIF"||type=="PNG"){
							  $('#fileList .upload_btn').before('<li class="thumbnail imgshow_box litpic"><div class="img_show"><img src="' + data[i].turl + '" data-url="' + data[i].url + '" /></div><i class="del_img"></i></li>');
							  $('.upload_btn').find('p').text(langData['circle'][2][41])  /* 继续上传*/
						 }

					 }

					 if(data.length==9){
						  $('.upload_btn').hide();
					 }
					  if (device.indexOf('huoniao') > -1) {
					  	// 此处APP端需要隐藏发布按钮
					  	setupWebViewJavascriptBridge(function(bridge) {
					  		bridge.callHandler('toggleFabuCircleBtn', {"value":"on"}, function(){});
					  	});
					  }
				   }
			   });
			 });
		}else if(t.hasClass('chose_photo')){   //相册

			setupWebViewJavascriptBridge(function(bridge) {
			   bridge.callHandler('chooseAlbum', {"value":"9"}, function callback(DataInfo){
				   if(DataInfo){
					 $('.mask_upfile').click();
					 var data = JSON.parse(DataInfo);
					 //alert(DataInfo)
					 for(var i=0 ; i<data.length; i++){

						 var type = '';
						 type = (data[i].fileType).substring((data[i].fileType.indexOf('.')+1),data[i].fileType.length);
						 type=type.toUpperCase();

						 if(type=="MP4"||type=="MOV"||type=="RMVB"||type=="WMV"||type=="3GP"||type=="M4V"||type=="AVI"||type=="MKV"||type=="FLV"){

							 $('#fileList .upload_btn').before('<li class="video_li"><div class="img_show"><img class="v_poster" data-url="'+data[i].videoPoster+'" src="'+data[i].videoPoster+'" /><video src="' + data[i].turl + '" data-url="' + data[i].url + '" /></div><i class="del_v"></i></li>');
							 $('.mask_upfile').click();
							 $('#fileList .upload_btn').hide();
							 $('#videoPoster').val(data[i].videoPosterUrl ? data[i].videoPosterUrl : data[i].videoPoster);
							 $('#videoTime').val(data[i].videoTime);
                             $('#video').val(data[i].url)
						 }else if(type=="JPG"||type=="JPEG"||type=="GIF"||type=="PNG"){
							  $('#fileList .upload_btn').before('<li class="thumbnail imgshow_box litpic"><div class="img_show"><img src="' + data[i].turl + '" data-url="' + data[i].url + '" /></div><i class="del_img"></i></li>');
							  $('.upload_btn').find('p').text(langData['circle'][2][41])  /* 继续上传*/
						 }

					 }

					 if(data.length==9){
						  $('.upload_btn').hide();
					 }
					 if (device.indexOf('huoniao') > -1) {
					 	// 此处APP端需要隐藏发布按钮
					 	setupWebViewJavascriptBridge(function(bridge) {
					 		bridge.callHandler('toggleFabuCircleBtn', {"value":"on"}, function(){});
					 	});
					 }
				   }
			   });
			 });
		}
	});


	  // 图片放大
	  var videoSwiper = new Swiper('.videoModal .swiper-container', {pagination: {el:'.videoModal .swiper-pagination',type: 'fraction',},loop: false})
	    $("#fileList").delegate('.imgshow_box .img_show', 'click', function() {
			if(device.indexOf('huoniao') > -1) return fasle;
	        var imgBox = $("#fileList .imgshow_box");
	        var i = $(this).parents('.imgshow_box').index();
	        $(".videoModal .swiper-wrapper").html("");
	        for(var j = 0 ,c = imgBox.length; j < c ;j++){
	            if(j==0){
					$(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><img data-val="' + imgBox.eq(j).find("img").attr("data-val") + '" src="' + imgBox.eq(j).find("img").attr("data-url") + '" / ></div>');
	             }else{
	                $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><img data-val="' + imgBox.eq(j).find("img").attr("data-val") + '" src="' + imgBox.eq(j).find("img").attr("data-url") + '" / ></div>');
	             }

	        }
	        videoSwiper.update();
	        $(".videoModal").addClass('vshow');
	        $('.markBox').toggleClass('show');
	        videoSwiper.slideTo(i, 0, false);
	        return false;
	    });

	    $(".videoModal").delegate('.img_del', 'click', function() {
	       var index = $('.videoModal .swiper-slide-active').index();
		   $('#fileList li.imgshow_box').eq(index).find('.del').click();
		   $(".videoModal").removeClass('vshow');
	    });

		$('.close_img').click(function(){
			 $(".videoModal").removeClass('vshow');
			 $(".videobox").hide();
		});


	// 发布按钮的显示与隐藏
	$('.input_container .inbox').bind('input propertychange',function(){
		var t = $(this);
		var con = t.val().replace(/[\r\n]/g,"");
		if(con=='' && $('.imgshow_box').length==0 && $('.video_li').length==0){
			$('.header-search a').addClass('fn-hide');
			if (device.indexOf('huoniao') > -1) {
				// 此处APP端需要显示发布按钮
				setupWebViewJavascriptBridge(function(bridge) {
					bridge.callHandler('toggleFabuCircleBtn', {"value":"off"}, function(){});
				});
			}

		}else{
			$('.header-search a').removeClass('fn-hide');
			if (device.indexOf('huoniao') > -1) {
				// 此处APP端需要隐藏发布按钮
				setupWebViewJavascriptBridge(function(bridge) {
					bridge.callHandler('toggleFabuCircleBtn', {"value":"on"}, function(){});
				});
			}
		}
	});


	setupWebViewJavascriptBridge(function(bridge) {
	 //app点击发布按钮
		bridge.registerHandler("clickFabuCircleBtn", function(data, responseCallback) {
          	var imglist = []
			$(".imgshow_box").each(function(){
				var t = $(this);
				imglist.push(t.find('.img_show img').attr('data-url'))
			});
			$('#litpic').val(imglist.join(','));
			$('.fabu_circle').click();
		});
	});


	// 提交
	$('.fabu_circle,.mini_fabu').click(function(){
		if(click_flag) return false;
		click_flag = true;
		var con = $('.input_container .inbox').val();
		var litpic = $('#litpic').val();
		var video = $("#video").val();
		if(con=='' && litpic=='' && video==''){
			showErr(langData['circle'][3][45]);  //'请输入动态的内容'
			return false;
		}
		// console.log($('.form_box').serialize());
		var data = [] ,proList = [];
		$('.pro_show li').each(function(){
			var t = $(this);
			var pro = {
				'type'  : t.attr('data-link')?t.attr('data-link'):"",
				'url'   : encodeURIComponent(t.attr('data-url')),
				'id'    : t.attr('data-id'),
				'ltype' : t.attr('data-type'),
				'price' : t.attr('data-price')?t.attr('data-price'):"",
				'litpic': t.attr('data-litpic')?t.attr('data-litpic'):t.find('.l_img img').attr('src'),
				'title' : encodeURIComponent(t.attr('data-title')),
			}
			proList.push(pro);
		});

		data.push("commodity="+(JSON.stringify(proList)));
		data.push("con="+con);
		data = data.join('&')+"&"+$('.form_box').serialize();
		var url = "/include/ajax.php?service=circle&action=dynamicAdd";
		

	


		$.ajax({
			url: url,
			type: "POST",
			data: data,
			dataType: "json", //指定服务器返回的数据类型
			success: function(data) {
				if(data.state == 100){
						showErr(langData['circle'][3][46]);  //新增成功
						setTimeout(function(){
							window.location.href = userDomain+"/manage-circle.html";
						},1000)
					}else{
						//showErr(data.info);
                      showErr(langData['circle'][2][38]); //上传失败
                      click_flag = false;
					}
			},
			error:function(){
				click_flag = false;
			}
		});


	});


// 匹配话题
	function getTplist() {
		// 如果已经在进行ajax请求，终止之前的请求
		if(tp_ajax){
			tp_ajax.abort();
		}
		var val = $('#search_topic').val();   //搜索关键字
		data = {
			'page': '1',
			'pageSize': 40,
		}
		$('.topic_rec h3').show();
		tp_ajax = $.ajax({
			url: '/include/ajax.php?service=circle&action=getTopic&keywords='+val,
			type: "GET",
			data: data,
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [];
					for (var i = 0; i < data.info.list.length; i++) {
						var d = data.info.list[i];
						var d_tit = d.title;
						var topicimg = '/include/attachment.php?f='+d.litpic;
						list.push('<li class="tp_li" data-id="'+d.id+'">');
						list.push('<div class="l_img"><img src="'+templets_skin+"/images/f_topic1.png"+'" data-url="'+(d.litpic? topicimg :templets_skin+"/images/f_topic1.png")+'"></div>');
						list.push('<div class="r_info">');
						list.push('<h2><span>'+d.title+'</span> </h2>');
						list.push('<p>'+d.topiccount+langData['circle'][0][60]+'</p>');  /* 人参与*/
						list.push('</div></li>');
						if(d_tit == val){
							$('.create_li').hide();
						}
					}
					$('.search_ul .loading').remove();
					$('.search_ul').html(list.join(''));
					 $("img").scrollLoading(); //懒加载
				} else {
					$('.topic_rec h3').hide();
					$('.search_ul').html('')
					$('.search_ul').append('<div class="noData loading"><img src="'+templets_skin+'images/f_null.png"><p>'+langData['circle'][2][30]+'</p></div>');   /* 暂无相关话题哦*/
				}
			},
			error: function(err) {
				console.log('fail');

			}
		});

	}

	// 话题首次加载

	function getTpslist() {
		tload = 1;
		data = {
			'page': tpage,
			'pageSize': 10,
		}
		$('.topic_rec h3').hide();
		tp_ajax = $.ajax({
			url: '/include/ajax.php?service=circle&action=getTopic',
			type: "GET",
			data: data,
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [];
					var totalPage = data.info.pageInfo.totalPage;
					for (var i = 0; i < data.info.list.length; i++) {
						var d = data.info.list[i];

						var d_tit = d.title;
						var join = (d.join==1?"<em>我参与的</em>":"")
						var topicimg = '/include/attachment.php?f='+d.litpic;
						list.push('<li class="tp_li" data-id="'+d.id+'">');
						list.push('<div class="l_img"><img src="'+(d.litpic? topicimg:templets_skin+"/images/f_topic1.png")+'" data-url="'+(d.litpic? topicimg :templets_skin+"/images/f_topic1.png")+'"></div>');
						list.push('<div class="r_info">');
						list.push('<h2><span>'+d.title+'</span>'+join+'</h2>');
						list.push('<p>'+d.topiccount+langData['circle'][0][60]+'</p>');  /* 人参与*/
						list.push('</div></li>');

					}
					$('.rec_ul .loading').remove();
					if(tpage==1){
						$('.rec_ul').html(list.join(''));
					}else{
						$('.rec_ul').append(list.join(''));
					}

					 $(".l_img img").scrollLoading(); //懒加载

					 tpage++;
					 tload = 0;
					 if(tpage>totalPage){
						  tload = 1;
					 }
				} else {
					$('.topic_rec h3').hide();
					$('.rec_ul').html('')
					$('.rec_ul').append('<div class="noData loading"><img src="'+templets_skin+'images/f_null.png"><p>'+langData['circle'][2][30]+'</p></div>');   /* 暂无相关话题哦*/
				}
			},
			error: function(err) {
				console.log('fail');

			}
		});

	}

	$('.topic_rec').scroll(function(){
		if ($('.topic_rec').scrollTop() >= $('.topic_rec>ul.rec_ul').height() - $('.topic_rec').height() - 80 && !tload )
		{
			getTpslist();
		}
	})

	function dataURLtoFile(dataurl, filename) { //将base64转换为文件
		var arr = dataurl.split(','),
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename,{
			type: mime
		});
	}

	function rotateImg(img, direction,canvas) {
		//alert(img);
		//最小与最大旋转方向，图片旋转4次后回到原方向
		var min_step = 0;
		var max_step = 3;
		//var img = document.getElementById(pid);
		if (img == null)return;
		//img的高度和宽度不能在img元素隐藏后获取，否则会出错
		var height = img.height;
		var width = img.width;
		//var step = img.getAttribute('step');
		var step = 2;
		if (step == null) {
			step = min_step;
		}
		if (direction == 'right') {
			step++;
			//旋转到原位置，即超过最大值
			step > max_step && (step = min_step);
		} else {
			step--;
			step < min_step && (step = max_step);
		}
		//旋转角度以弧度值为参数
		var degree = step * 90 * Math.PI / 180;
		var ctx = canvas.getContext('2d');
		switch (step) {
			case 0:
				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0);
				break;
			case 1:
				canvas.width = height;
				canvas.height = width;
				ctx.rotate(degree);
				ctx.drawImage(img, 0, -height);
				break;
			case 2:
				canvas.width = width;
				canvas.height = height;
				ctx.rotate(degree);
				ctx.drawImage(img, -width, -height);
				break;
			case 3:
				canvas.width = height;
				canvas.height = width;
				ctx.rotate(degree);
				ctx.drawImage(img, -width, 0);
				break;
		}
	}


// 20200514图片旋转
$(".rotate_img").click(function(){
	$(".canvasBox").show();
	$(".btn_groups").hide();
	$(".btn_group1").show();
	var  imgSrc = $(".swiper-slide.swiper-slide-active img").attr('src');
	var  val = $(".swiper-slide.swiper-slide-active img").attr('data-val');
	$(".canvasBox img").attr('src',imgSrc).attr('data-val',val);
	rotate_img(imgSrc)

})

$(".rotate2").click(function(){
	var imgSrc = $(".canvasBox img").attr('src');
	 rotate_img(imgSrc)
});

$(".cancel_btn").click(function(){
	$(".btn_groups").show();
	$(".btn_group1,.canvasBox").hide();

});

$(".sure_btn").click(function(){
	$(".canvasBox .loading").show();
	var imageBase64 = $("#image").attr('src');
	$(".swiper-slide.swiper-slide-active img").attr('src',imageBase64)
	var val = $("#image").attr('data-val');
	imageBase64 = imageBase64.replace('data:image/png;base64,', '');

	setTimeout(function(){
		$.ajax({
			url: "/include/upload.inc.php",
			type: "POST",
			data: {
				mod: 'circle',
				type: 'img',
				base64: 'base64',
				Filedata: imageBase64,
				randoms: Math.random()
			},
			dataType: "json",
			success: function (response) {
				var random_num = hideFileUrl == 1 ? ("&v="+Math.random()) : ("?v="+Math.random())
				$(".swiper-slide.swiper-slide-active img").attr('src',response.turl+random_num).attr('data-val',response.url+random_num);
				var img  = $("#fileList .img_show img[data-val='"+val+"']");
				img.after("<img src='"+(response.turl + random_num)+"' data-val='"+response.url+"' data-url='"+(response.turl + random_num)+"'>");
				delAtlasPic(val);
				$(".btn_group1,.canvasBox").hide();
				$(".btn_groups").show();
				$(".canvasBox .loading").hide();
				img.remove();
				var pics = []
				$('#fileList li.imgshow_box').each(function(){
					var t = $(this);
					pics.push(t.find('img').attr('data-val'));
				})
				$('#litpic').val(pics.join(','));
			},
			error: function (xhr, status, error) {

			}
		})
	},500)


})

function rotate_img(imgSrc){
	var image = new Image();
	image.setAttribute("crossOrigin",'Anonymous');
	image.src = imgSrc;
	image.onload = function() {
		var expectWidth = this.naturalWidth;
		var expectHeight = this.naturalHeight;
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		canvas.width = expectWidth;
		canvas.height = expectHeight;
		ctx.drawImage(this, 0, 0, expectWidth, expectHeight);
		var base64 = null;
		rotateImg(this,'left',canvas);
		base64 = canvas.toDataURL('image/png', 1);
		var baseFile = dataURLtoFile(base64, '1');
		$(".canvasBox img").attr('src',base64);

	}
}

});
