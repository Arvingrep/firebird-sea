/**
 * Created by Administrator on 2018/4/26.
 */
var if_change = 0,change_item = '';   //0 表示上传  1表示修改
var tp_ajax	, sp_ajax , pl_alax ;
$(function() {
	var lng = "",
		lat = "";


// 选择分类
$(".fenlei_box li").click(function(){
	var t = $(this),typeid = t.attr('data-id'),typename = t.find('.fenlei_name').text() ;
	$("#typename").val(typename);
	$(".typename").text(typename);
	$("#typeid").val(typeid);
	$(".fenlei_page").addClass("tohide");
	$('html').removeClass("noscroll");
});

$(".typename").click(function(){
	if(!$(".fenlei_page").hasClass('fn-hide')){
		$(".fenlei_page").removeClass("tohide");
		$('html').addClass("noscroll");
	}
});


 //选择具体时间
 // var clockList = [];
 //     var join=[];
	//  for(var s = 0; s < 60; s++){//分钟 五分钟一个间隔
	//      	var e = (s<10)?('0'+s):s;
	//  	    join.push({
	//  	      id: e,
	//  	      value: e+langData['sfcar'][0][73],//分
	//  	    })
	//  	    s=s++;
	//      }

	//      for(var i = 0; i < 24; i++){
	//  		var n = (i<10)?('0'+i):i;
	//      	clockList.push({
	//  	      id: n,
	//  	      value: n+'时',//时
	//  	    })
	//      }
 //    var clockSelect = new MobileSelect({
	//     trigger: '#clockChose',
	//     title: '请选择时间',//请选择时间
	//     cancelBtnText: '取消',//不选择
	//     wheels: [
	//     	{data : clockList},
	//     	{data : join}
	//     ],
	//     transitionEnd:function(indexArr, data){
	//     	var fir = indexArr[0];
	//     	var sec = indexArr[1];
	//     	$('.selectContainer').find('li').removeClass('onchose')
	// 		var firWheel =$('.wheels .wheel:first-child').find('.selectContainer');
	// 		var secWheel =$('.wheels .wheel:last-child').find('.selectContainer');
	// 		firWheel.find('li').eq(fir).addClass('onchose');
	// 		secWheel.find('li').eq(sec).addClass('onchose');

	//     },
	//     callback:function(indexArr, data){
	//     	$('#clockChose').val(data[data.length-2].id+':'+data[data.length-1].id)
	//         console.log(data); //返回选中的json数据

	//     }
	//     ,triggerDisplayData:false
	// });

/*=================================定位相关=====================================*/

	// show选择定位对话框
	$('.posi_show').click(function() {
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
		// $('.add_ps').html(langData['circle'][2][6]);  /* 隐藏定位*/
		$('#lnglat,#search_posi').val('');
		$('.posi_li').removeClass('chosed');
		$('#location').val('');  //清空定位
	});

	// 确定选择定位
	$('.posi_box .sure_btn').click(function() {
		if($('.posi_li.chosed').size()!=0){
			var p_chose = $('.posi_li.chosed').find('h2').text();
			var lnglat = $('.posi_li.chosed').attr('data-lng')+','+$('.posi_li.chosed').attr('data-lat');
			$('.add_ps').html(p_chose);
			$('#location').val(p_chose);
			$('#lnglat').val(lnglat);
		}
		$('.mask_posi').click();
	});

	// 选择定位
	$('.posi_box').delegate('.posi_li','click',function(){
		var t = $(this);
		t.addClass('chosed').siblings('li').removeClass('chosed');
	})
	//第一次进入自动获取当前位置
	if ($("#lnglat").val() != "") {
		var lnglat = $("#lnglat").val().split(",");
		lng = lnglat[0];
		lat = lnglat[1];
	} else {
		HN_Location.init(function(data) {
			if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
				console.log('定位获取失败');
                lat = siteCityInfo_lat;
                lng = siteCityInfo_lng;
			} else {
				lng = data.lng;
				lat = data.lat;
				$("#location").val(data.name);
				$("#lnglat").val(lng+','+lat);
			}
		}, device.indexOf('huoniao') > -1 ? false : true);
	}

	// 选择所在区域
	$('.posi_show').bind("click", function(){

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


	    getLocation(mapOptions.center);



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

				list.push('<li class="posi_li"  data-lng="'+results[i].geometry.location.lng()+'" data-lat="'+results[i].geometry.location.lat()+'"><h2>'+results[i].name+'</h2><div class="detail_posi fn-clear"><span>'+mapDistance(lng,lat,results[i].geometry.location.lng(),results[i].geometry.location.lat())+'</span><p>'+results[i].vicinity+'</p></div></li>')
	          }
	          if(list.length > 0){
	            $(".rec_posi").html(list.join(""));
	            // $(".mapresults").show();
	          }
	        }
	      }
	    }



	  // 高德地图
	  }else if (site_map == "amap"){


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

	        AMap.event.addListener(map ,"complete", function(status, result){
	            lnglat = map.getCenter();
	            lng = lnglat['lng'];
	            lat = lnglat['lat'];
	            console.log(lnglat);
	            s();
	        });

	      AMap.event.addListener(map ,"dragend", function(status, result){
	        lnglat = map.getCenter();
	        lng = lnglat['lng'];
	        lat = lnglat['lat'];
	        console.log(lnglat);
	        s();
	      });

	    })

	    function callback(results, status) {
	      if (status === 'complete' && results.info === 'OK') {
	        var list = [];
	        var allPois = results.poiList.pois;
	        for(var i = 0; i < allPois.length; i++){

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




	      }

	    }
	    operation();
	  }

	})

	// 搜索匹配地址
	var page = 0,  totalPage = 0, totalCount = 0, isload = false, pagetoken = '';


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













	//APP端取消下拉刷新
	toggleDragRefresh('off');



	//首页导航
	$(".menu_list a").click(function() {
		var index = $(this).index();
		$(this).addClass("active").siblings().removeClass("active");
	});

	var distance = 100;
	$('.nav_more').on('click', function() {
		$('.menu_list').scrollLeft(distance);
		distance += 100;
	});




});

//关注切换
$(function() {
	$(".btn_care").click(function() {
		$(".btn_care").removeClass('btn_care').addClass('btn_care1').text(langData['siteConfig'][19][845]); //已关注
	});
	$(".btnCare").click(function() {
		$(".btnCare").removeClass('btnCare').addClass('btnCare1').text(langData['siteConfig'][19][845]); //已关注
	});
});


//直播详情--刷新页面
$(function() {
	$("#v_refresh").click(function() {
		window.location.reload();
	});

	$("#refresh").click(function() {
		window.location.reload();
	});

});


//发起直播
$(function() {

	$('.demo-test-time').scroller(
		$.extend({
			preset: 'time',
			dateFormat: 'yy-mm-dd'
		})
	);
	// 选择日期 年月日
	 $(".demo-test-date").hotelDate();

	$(".type_fee input[type=text]").on("input",function(){
		var t = $(this),name = t.attr("name");
		var val = t.val();
		var nowval = val.replace(/[^\d\.]/g,'')
		 t.val(nowval)

	});
	$(".type_fee input[type=text]").on("blur",function(){
		var t = $(this),name = t.attr("name");
		var val = t.val();
		if(val!=''){
			t.val(Number(val).toFixed(2))
		}

	});
	//选择横竖屏
	$(".h_live").click(function() {
		$("#h_screen").addClass("active");
		$("#v_screen").removeClass("active");
	});
	$(".v_live").click(function() {
		$("#v_screen").addClass("active");
		$("#h_screen").removeClass("active");
	});

	$('#live_style').change(function() {
		var options = $("#live_style option:selected"); //获取选中的项
		if (options.text() == langData['siteConfig'][31][57]) { //加密
			$(".li_collect").css("display", "none");
			$(".li_pass").css("display", "block");
		} else if (options.text() == langData['siteConfig'][19][889]) { //收费
			$(".li_pass").css("display", "none");
			$(".li_collect").css("display", "block");
		} else {
			$(".li_pass").css("display", "none");
			$(".li_collect").css("display", "none");
		}
	});


});

$(function() {
	//加的效果
	$(".cAdd").click(function() {
		var n = $(this).prev().val();
		var num = Number(n) + 1;
		if (num == -1) {
			return;
		}
		$(this).prev().val(num.toFixed(2));
	});
	//减的效果
	$(".cReduce").click(function() {
		var n = $(this).next().val();
		var num = Number(n) - 1;
		if (num <0) {
			return;
		}
		$(this).next().val(num.toFixed(2));
	});
});

//发起直播
$(function() {
	var changeFileSize = function(url, to, from) {
		if (url == "" || url == undefined) return "";
		if (to == "") return url;
		var from = (from == "" || from == undefined) ? "large" : from;
		var newUrl = "";
		if (hideFileUrl == 1) {
			newUrl = url + "&type=" + to;
		} else {
			newUrl = url.replace(from, to);
		}

		return newUrl;
	}
	//上传凭证
	var $list = $('#fileList'),
		uploadbtn = $('.uploadbtn'),
		ratio = window.devicePixelRatio || 1,
		fileCount = 0,
		thumbnailWidth = 100 * ratio, // 缩略图大小
		thumbnailHeight = 100 * ratio, // 缩略图大小
		uploader;
	fileCount = $list.find("li.item").length;
	// 初始化Web Uploader
	$(".default_tip").css("display", "block");
	uploader = WebUploader.create({
		auto: true,
		swf: staticPath + 'js/webuploader/Uploader.swf',
		server: '/include/upload.inc.php?mod=' + modelType + '&type=thumb',
        pick: {
            id: '#filePicker',
            multiple: false,
        },
		fileVal: 'Filedata',
		accept: {
			title: 'Images',
			extensions: 'jpg,jpeg,gif,png',
			mimeTypes: 'image/*'
		},
		compress: {
			width: 750,
			height: 750,
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
		fileNumLimit: 0,
		fileSingleSizeLimit: 10 * 1024 * 1024 * 1024 //10M
	});

	//删除已上传图片
	var delAtlasPic = function(b) {
		var g = {
			mod: modelType,
			type: "delThumb",
			picpath: b,
			randoms: Math.random()
		};
		$.ajax({
			type: "POST",
			url: "/include/upload.inc.php",
			data: $.param(g)
		})
	};

	//更新上传状态
	function updateStatus() {
		if (fileCount == 0) {
			$('.imgtip').show();
		} else {
			$('.imgtip').hide();
			if (atlasMax > 1 && $list.find('.litpic').length == 0) {
				$list.children('li').eq(0).addClass('litpic');
			}
		}
		$(".uploader-btn .utip").html(langData['siteConfig'][20][303].replace('1', (atlasMax - fileCount))); //还能上传1张图片
	}

	// 负责view的销毁
	function removeFile(file) {
		var $li = $('#' + file.id);
		fileCount--;
		delAtlasPic($li.find("img").attr("data-val"));
		$li.remove();
		updateStatus();
	}
	$(".input_reload").click(function(){
		var li =  $(".live_banner #fileList .thumbnail");
		var file = [];
		file['id'] = li.attr("id");
		removeFile(file);
		updateStatus();
		$("#litpic").val('');
		$(".input_reload").hide();
	})
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
		var $li = $('<li id="' + file.id + '" class="thumbnail"><img></li>'),
			//$btns = $('<div class="file-panel"><span class="cancel"></span></div>').appendTo($li),
			$img = $li.find('img');
			$(".input_reload").show();
			$btns = $(".input_reload");
		// 创建缩略图
		uploader.makeThumb(file, function(error, src) {
			if (error) {
				$img.replaceWith('<span class="thumb-error">' + langData['siteConfig'][20][304] + '</span>'); //不能预览
				return;
			}
			$img.attr('src', src);
		}, thumbnailWidth, thumbnailHeight);



		uploadbtn.after($li);
		$('.input_file').hide();
	}

	// 当有文件添加进来的时候
	uploader.on('fileQueued', function(file) {
		//先判断是否超出限制
		if (fileCount == atlasMax) {
			alert(langData['siteConfig'][20][305]); //图片数量已达上限
			// $(".uploader-btn .utip").html('<font color="ff6600">图片数量已达上限</font>');
			return false;
		}

		fileCount++;
		addFile(file);
		updateStatus();
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
		var $li = $('#' + file.id);

		if (response.state == "SUCCESS") {
			$li.find("img").attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
			$('#litpic').val(response.url);
		} else {
			removeFile(file);
			alert(response.state); //上传失败！
			$('.input_file').show();
			// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
		}
	});

	// 文件上传失败，现实上传出错。
	uploader.on('uploadError', function(file) {
		removeFile(file);
		alert(langData['siteConfig'][44][88]); //上传失败！
		$('.input_file').show();
		// $(".uploader-btn .utip").html('<font color="ff6600">上传失败！</font>');
	});

	// 完成上传完了，成功或者失败，先删除进度条。
	uploader.on('uploadComplete', function(file) {
		$('#' + file.id).find('.progress').remove();
	});

	//上传失败
	uploader.on('error', function(code) {
		var txt = langData['siteConfig'][44][88]; //上传失败！
		switch (code) {
			case "Q_EXCEED_NUM_LIMIT":
				txt = langData['siteConfig'][20][305]; //图片数量已达上限
				break;
			case "F_EXCEED_SIZE":
				txt = langData['siteConfig'][20][307].replace('1', (atlasSize / 1024 / 1024)); //图片大小超出限制，单张图片最大不得超过1MB
				break;
			case "F_DUPLICATE":
				txt = langData['siteConfig'][20][308]; //此图片已上传过
				break;
		}
		var thumbnail = $('.thumbnail');
		errmsg(thumbnail, txt);
		// $(".uploader-btn .utip").html('<font color="ff6600">'+txt+'</font>');
	});
	// 错误提示
	function errmsg(obj, str) {
		var o = $(".error");
		o.html('<p>' + str + '</p>').show();
		if (obj.is('textarea') || (obj.is('input') && obj.is(':visible') && obj.attr('readonly') != "true")) {
			obj.focus();
		} else {
			$('html,body').animate({}, 10);
		}

		obj.closest('label').addClass('haserror');
		setTimeout(function() {
			o.hide()
		}, 1000);
	}
	//--选择封面图
	$(".input_file").click(function() {
		$(".sel_modal").css("display", "block");
	});
	$("#close").click(function() {
		$(".sel_modal").css("display", "none");
	});
	var backgrounds = [
		"/templates/member/images/live/a_banner01.png",
		"/templates/member/images/live/a_banner02.png",
		"/templates/member/images/live/a_banner03.png",
		"/templates/member/images/live/a_banner04.png",
		"/templates/member/images/live/a_banner05.png",
		"/templates/member/images/live/a_banner06.png",
		"/templates/member/images/live/a_banner07.png",
		"/templates/member/images/live/a_banner08.png",
		"/templates/member/images/live/a_banner09.png",
		"/templates/member/images/live/a_banner10.png",
		"/templates/member/images/live/a_banner11.png",
		"/templates/member/images/live/a_banner12.png",
		"/templates/member/images/live/a_banner13.png",
		"/templates/member/images/live/a_banner14.png",
		"/templates/member/images/live/a_banner15.png"
	];
	$(".modal_main ul li").click(function() {
		$(".modal_main ul li").removeClass('active');
		$(this).addClass('active');
		//$(".default_tip").html('');

		if ($(".thumbnail").length > 0) {
			//元素存在时执行的代码
			var li = $(".cancel").closest("li");
			var file = [];
			file['id'] = li.attr("id");
			removeFile(file);
			updateStatus();
		}
		$('#litpic').attr('value', backgrounds[$(this).val()]);
		$(".live_banner").css({
			'background': 'url(' + backgrounds[$(this).val()] + ') no-repeat center',
			'background-size': 'cover'
		});
		$(".sel_modal").css("display", "none");
	});


	//推流地址
	$("#myform").submit(function(e) {
		e.preventDefault();
	});



	$('.btn_create').click(function() {
		var type = $(".live_sel .active").attr("data-id");
		$("#show").val(type);

		var title = $('#title');
		if ($('#title').val() == '') {
			errmsg(title, langData['siteConfig'][31][94]); //请填写直播标题
			$(window).scrollTop(0);
			return false;
		}
		var litpic = $('#litpic');
		var btn = $('.btn_create');
		if (litpic.val() == '') {
			errmsg(litpic, langData['siteConfig'][31][93]); //请上传直播封面
			$(window).scrollTop(0);
			return false;
		}
		var imglist = [],
			imgli = $("#fileList li.thumbnail");
		var val = imgli.find("img").attr("data-val");
		if (val != '') {
			imglist.push(val);
		}
		var valid = $("#valid")
		if($('#clockChose').val()=='' ||$('#valid2').val()==''){
			errmsg(valid, '请选择直播时间'); //请选择直播分类
			return false;
		}else{
			$("#valid").val($('#valid2').val()+' '+$('#clockChose').val());
		}

		var live_class = $('#live_class');
		if ($('#live_class').val() == 0) {
			errmsg(live_class, langData['siteConfig'][31][48]); //请选择直播分类
			$(window).scrollTop(0);
			return false;
		}
		var style = $('#live_style').val();
		var live_style = $('#live_style');
		if (style == 0) {
			//errmsg(litpic,'请选择直播类型');
			//$(window).scrollTop(0);
			//return false;
		} else if (style == 1) {
			if ($('#password').val() == '') {
				errmsg(live_style, langData['siteConfig'][20][502]); //请填写密码
				$(window).scrollTop(0);
				return false;
			}
		} else if (style == 2) {
			if ($('#start_collect').val() == 0 || $('#start_collect').val() == '') {
				errmsg(live_style, langData['siteConfig'][31][95]); //请填写开始收费
				$(window).scrollTop(0);
				return false;
			}
			if ($('#end_collect').val() == 0 || $('#end_collect').val() == '') {
				errmsg(live_style, langData['siteConfig'][31][96]); //请填写结束收费
				$(window).scrollTop(0);
				return false;
			}
		}
		if ($('#live_pulltype').val() == 0) {
			var live_liuchang = $('#live_liuchang');
			if ($('#live_liuchang').val() == 0) {
				errmsg(live_liuchang, langData['siteConfig'][31][97]); //请选择直播流畅度
				$(window).scrollTop(0);
				return false;
			}
		} else {
			var pullurl_pc = $('#pullurl_pc');
			var pullurl_touch = $('#pullurl_touch');
			if (pullurl_pc == '') {
				errmsg(pullurl_pc, langData['siteConfig'][38][52]); //请输入第三方拉流地址
				return false;
			}
			if (pullurl_touch == '') {
				errmsg(pullurl_pc, langData['siteConfig'][38][52]); //请输入第三方拉流地址
				return false;
			}
		}
		var mydata = $("#myform").serialize();
		mydata = mydata
				+"&note="+$(".textarea").html()
				+"&title="+$('#title').val();
		if (imglist) {
			//mydata += "&litpic="+imglist.join(",");
		}



		btn.prop('disabled', true);
		var form = $("#myform"),
			action = form.attr("action");



		$.ajax({
			url: action,
			type: 'post',
			dataType: 'json',
			async: false, //注意：此处是同步，不是异步
			data: mydata,
			success: function(data) {
				if (data && data.state == 100) {
					//getAddress();
					window.location.href = (action.indexOf('edit') > -1 ? detailUrl : userDomain) + '?id=' + data.info.id;
				} else {
					btn.prop('disabled', false);
					alert(data.info)
				}
			},
			error: function() {
				btn.prop('disabled', false);
				alert(langData['siteConfig'][31][98]); //请重新提交表单
			}
		})

	});

	/* 20200619新增 */
		$('.selectbox i.tbg').css({
			"left": $(".selectbox.tab_box li.selected").position().left
		});
		$(".selectbox li").click(function() {
			var t = $(this),
				id = t.attr('data-val');
			t.addClass("selected").siblings("li").removeClass("selected");
			$("#live_style").val(t.attr('data-val'))
			$('.selectbox i.tbg').css({
				"left": t.position().left
			});
			$(".type_box").addClass("fn-hide");
			if (id != '0') {
				$(".type_box[data-val='" + id + "']").removeClass("fn-hide")
			}
		});


		// step1判断是否在微信组

		var userAgent = navigator.userAgent.toLowerCase();
		if (userAgent.match(/MicroMessenger/i) == "micromessenger") {
			var upoptions = {
				btn: '#filePicker1',
				atlasMax:9,
		
			}
		   wxUploader(upoptions,
			// 上传成功后触发
			function(data){
				var fid = data.fid, url = data.url, turl = data.turl, time = new Date().getTime(), id = "wx_upload" + time;
				var $li = $('<div id="con_' + id + '" class="con_thum"><img data-val="'+fid+'" data-url="'+turl+'" src="'+turl+'"></div>'),
					// $btns = $('<div class="btns-group"><span class="btn_change">更换</span><span class="btn_del">删除</span></div>').appendTo($li),
					$img = $li.find('img');
					$txt = '<div class="txtbox"></div>';
					if(if_change){
						$("#"+change_item).after($li);
						delAtlasPic($("#"+change_item).find('img').attr("data-val")); //删除原图
						$("#"+change_item).remove();
						if_change = 0, change_item = '';
					}else{
						$(".instr_box .textarea").append($li).append($txt);
					}
				
		   })

		}else{

			var conuploader = WebUploader.create({
				auto: true,
				swf: staticPath + 'js/webuploader/Uploader.swf',
				server: '/include/upload.inc.php?mod=' + modelType + '&type=thumb',
				pick: {
					id: '#filePicker1',
					multiple: !isAndroidWxmini() ? true : false
				},
				fileVal: 'Filedata',
				accept: {
					title: 'Images',
					extensions: 'jpg,jpeg,gif,png',
					mimeTypes: 'image/*'
				},
				compress: {
					width: 750,
					height: 750,
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
				fileNumLimit: 0,
				fileSingleSizeLimit: 10 * 1024 * 1024 * 1024 //10M
			});
			// 当有文件添加进来的时候
			conuploader.on('fileQueued', function(file) {
				var $li = $('<div id="con_' + file.id + '" class="con_thum"><img></div>'),
					// $btns = $('<div class="btns-group"><span class="btn_change">更换</span><span class="btn_del">删除</span></div>').appendTo($li),
					$img = $li.find('img');
					$txt = '<div class="txtbox"></div>';
					// 创建缩略图
					conuploader.makeThumb(file, function(error, src) {
						if (error) {
							$img.replaceWith('<span class="thumb-error">' + langData['siteConfig'][20][304] + '</span>'); //不能预览
							return;
						}
						$img.attr('src', src);
					});
					if(if_change){
						$("#"+change_item).after($li);
						delAtlasPic($("#"+change_item).find('img').attr("data-val")); //删除原图
						$("#"+change_item).remove();
						if_change = 0, change_item = '';
					}else{
						$(".instr_box .textarea").append($li).append($txt);
					}
	
			});
	
			// 文件上传过程中创建进度条实时显示。
			conuploader.on('uploadProgress', function(file, percentage) {
	
				var $li = $('#con_' + file.id),
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
			conuploader.on('uploadSuccess', function(file, response) {
				var $li = $('#con_' + file.id);
				if (response.state == "SUCCESS") {
					$li.find("img").attr("data-val", response.url).attr("data-url", response.turl).attr("src", response.turl);
				} else {
					alert(response.state); //上传失败！
				}
			});
	
			// 文件上传失败，现实上传出错。
			conuploader.on('uploadError', function(file) {
				alert(langData['siteConfig'][44][88]); //上传失败！
				$('.input_file').show();
			});
	
			// 完成上传完了，成功或者失败，先删除进度条。
			conuploader.on('uploadComplete', function(file) {
				$('#' + file.id).find('.progress').remove();
			});
	
			//上传失败
			conuploader.on('error', function(code) {
				var txt = langData['siteConfig'][44][88]; //上传失败！
				switch (code) {
					case "Q_EXCEED_NUM_LIMIT":
						txt = langData['siteConfig'][20][305]; //图片数量已达上限
						break;
					case "F_EXCEED_SIZE":
						txt = langData['siteConfig'][20][307].replace('1', (atlasSize / 1024 / 1024)); //图片大小超出限制，单张图片最大不得超过1MB
						break;
					case "F_DUPLICATE":
						txt = langData['siteConfig'][20][308]; //此图片已上传过
						break;
				}
				console.log(txt)
			});
			// 完成上传完了，成功或者失败，先删除进度条。
			conuploader.on('uploadComplete', function(file) {
				$('#con_' + file.id).find('.progress').remove();
			});
		}



		// 删除图片按钮显示
		$("body").delegate(".textarea img","click",function(ev){
			var img = $(this),btns;
			$(".btns-group").remove();
			var top = img.position().top+(img.height()/2);

			if(img.parents('.con_thum').size()>0){
				btns = $('<div class="btns-group" style="top:50%; margin-top:-.38rem;"><span class="btn_change">'+langData['live'][5][37]+'</span><span class="btn_del">'+langData['live'][0][36]+'</span></div>');  //更换  删除
			}else{
				btns = $('<div class="btns-group" style="margin-top:-.38rem;"><span class="btn_change">'+langData['live'][5][37]+'</span><span class="btn_del">'+langData['live'][0][36]+'</span></div>');
				btns.css("top",top);
			}

			$(this).after(btns);
			btns.show();
			// 选择删除
			$(".btns-group span").off('click').click(function(ev){
				var t =$(this),par = t.closest(".con_thum");
				if(t.hasClass("btn_del")){
					if(par.size()>0){
						delAtlasPic(img.attr('data-val'));
						par.next('.txtbox').remove();
						par.remove()
					}else{
						img.remove();
					}
				}else{
					if_change = 1;
					change_item = par.attr('id');
					console.log('cesji')
					 $("#filePicker1 input").off('click').click();
				}
			});
			$(document).one("click",function(){
				btns.remove();
			})
			ev.stopPropagation();
		});

		$(".textarea").click(function(){
			if_change = 0;
			change_item ='';
		})

});
//发布直播生成推流地址
function getAddress() {
	$.ajax({
		url: "/include/ajax.php?service=live&action=getPushSteam",
		type: "GET",
		dataType: "json",
		success: function(data) {
			if (data && data.state != 200) {
				var url = data.info.pushurl;
				return true;
			}
		}
	});
}
//直播详情--点击屏幕显示与隐藏
$(function() {
	$('.empty_box').on('click', function() {
		$('.vPer_box').toggle();
		$('.chat_box').toggle();
		$('.live_like').toggle();
	});
});

$(function() {
	// 切换推流地址类型
	$('#live_pulltype').change(function() {
		var v = $(this).val();
		$('#pushtype0, .pulltypeCon').hide();
		if (v == 0) {
			$('#pushtype0').show();
		} else {
			$('.pulltypeCon').show();
		}
	})
});
