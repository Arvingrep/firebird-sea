$(function(){
	var page = 1,shop_load = 0;
	var str = window.location.search;
	var URLArrary = str.split('=');
	var strArrary = str.split('?');
	var id = URLArrary[1]  ? URLArrary[1] : 0;


    var orderby = 1;
      $('.mask').bind('touchmove',function(e){
      	e.preventDefault();
      });
      //综合排序
      $('.composite.px_li').click(function(){
      	var t = $(this);
      	$('.px_box').toggle();
      	$('.right_saixuan').hide();
      	$('.right_btn').removeClass('slideUp');
      	if(!t.hasClass('slideUp')){
      		$('.pxBox').addClass('fixedtop');
      		$(this).addClass('slideUp');
      		$('.mask').show();
      	}else{
      		$(this).removeClass('slideUp');
      		$('.pxBox').removeClass('fixedtop');
      		$('.mask').hide();
      	}
      });


       $('.dt_box .right_btn').click(function(){
    	var t = $(this);
      	if(!t.hasClass('slideUp')){
      		$('.pxBox').addClass('fixedtop');
      		$(this).addClass('slideUp');
      		$('.mask').show();
      	}else{
      		$(this).removeClass('slideUp');
      		$('.pxBox').removeClass('fixedtop');
      		$('.mask').hide();
      	}
    	$('.right_saixuan').toggle();
    	$('.px_box').hide();
    	$('.composite.px_li').removeClass('slideUp');
    });
      //价格区间
      $("#price_u").ionRangeSlider({
        skin: "big",
        type: "double",
        min: 0,
        max: 120,
        from: 0,
        to: 121,
        grid: true,
        step: 1,
        from_fixed: false,  // fix position of FROM handle
        to_fixed: false     // fix position of TO handle
	});

	var slider = $("#price_u").data("ionRangeSlider");
	$("#price_u").on("change", function () {
	       var $inp = $(this);
	       var v = $inp.prop("value");     // input value in format FROM;TO
	       var from = $inp.data("from");   // input data-from attribute
	       var to = $inp.data("to");       // input data-to attribute

	       if(to==120){
		   $("#pricetemp").val(from + ',' + '120');
	       }else{
			$("#pricetemp").val(from + ',' + to);
		}


	});






     var localData = utils.getStorage('waimai_local');
	 if(getParam('lat') && getParam('lng')){ //携带的坐标
		lng = getParam('lng'),lat = getParam('lat')
		getlist();
	}else if(localData){
		lat = localData.lat;
		lng = localData.lng;
		// console.log("本地存储："+localData.address);
		getlist();
	}else {
		// 百度地图
		if (site_map == 'baidu') {
			var geolocation = new BMap.Geolocation();
	    geolocation.getCurrentPosition(function(r){
	    	if(this.getStatus() == BMAP_STATUS_SUCCESS){
	    		lat = r.point.lat;
					lng = r.point.lng;

					var geoc = new BMap.Geocoder();
					geoc.getLocation(r.point, function(rs){
						var rs = rs.addressComponents;
						$('.posi em').html(rs.district + rs.street + rs.streetNumber)
					});
					getlist();
	    	}
	    	else {
	    		alert('failed'+this.getStatus());
	    	}
	    },{enableHighAccuracy: true})

			// 谷歌地图
			}else if (site_map == 'google') {

				if (navigator.geolocation) {

					//获取当前地理位置
					navigator.geolocation.getCurrentPosition(function(position) {
							var coords = position.coords;
							lat = coords.latitude;
							lng = coords.longitude;

							//指定一个google地图上的坐标点，同时指定该坐标点的横坐标和纵坐标
							var latlng = new google.maps.LatLng(lat, lng);
							var geocoder = new google.maps.Geocoder();
							geocoder.geocode( {'location': latlng}, function(results, status) {
									if (status == google.maps.GeocoderStatus.OK) {
											var time = Date.parse(new Date());
											var resultArr = results[0].address_components, address = "";

											for (var i = 0; i < resultArr.length; i++) {
												var type = resultArr[i].types[0] ? resultArr[i].types[0] : 0;
												if (type && type == "street_number") {
													address = resultArr[i].short_name;
												}
												if (type && type == "route") {
													address += " " + resultArr[i].short_name;
												}
											}

											utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': address,site_map:site_map}));
											console.log(address);
											getlist();

									} else {
										alert('Geocode was not successful for the following reason: ' + status);
									}
							});

					}, function getError(error){
							switch(error.code){
								case error.TIMEOUT:
										 alert(langData['siteConfig'][22][100]);  /* 超时 */
										 break;
								case error.PERMISSION_DENIED:
										 alert(langData['siteConfig'][22][101]);      /* 用户拒绝提供地理位置 */
										 break;
								case error.POSITION_UNAVAILABLE:
										 alert(langData['siteConfig'][22][102]);    /* 地理位置不可用 */
										 break;
								default:
										 break;
							}
				 })
			 }else {
				alert(langData['waimai'][3][72])    /* 不支持 */
			 }
			}


	}

  //滚动定位
   var p = 0, t = 0;
   $(window).scroll(function(){
   		p = $(this).scrollTop();
   		var ul_t = $('.pxBox').offset().top-60;
   		if(p>=ul_t){
   			$('.shaixuan').addClass('fixedtop');
   		}else{
   			$('.shaixuan').removeClass('fixedtop');
   		}

   		var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w;

        if ($(window).scrollTop() >= scroll && !shop_load) {
        	page++;
        	getlist();

        }

   });


  //快捷筛选
  $('.fast_screen li').click(function(){
  	var selecttype = $(this).attr('data-type');
  	page = 1;
  	$(this).addClass('fast_active').siblings('li').removeClass('fast_active');
	// $('.right_saixuan dd[data-type='+selecttype+']').addClass('dd_chose');
  	getlist('&'+selecttype+'='+selecttype)
  });
    //排序
   $('.px_box li').click(function(){
		orderby = $(this).attr('data-id');
		$('#orderby').val(orderby);
		$(this).addClass('li_click').siblings('li').removeClass('li_click');
		page = 1;
		getlist();
		$('.composite.px_li a').text($(this).text())
		$('.mask,.px_box').hide();
		$('.composite.px_li').removeClass('slideUp');
		$('.pxBox').removeClass('fixedtop');
   });

    $('.px_li').click(function(){
    	if($(this).hasClass('distance')){
    		$('.px_box li[data-id=1]').click();
    		$(this).addClass('li_click').siblings('li').removeClass('li_click');
    	}else if($(this).hasClass('saleCount')){
    		$('.px_box li[data-id=2]').click();
    		$(this).addClass('li_click').siblings('li').removeClass('li_click');
    	}else{
    		$(this).siblings('li').removeClass('li_click');
    	}
    });

	// 筛选
	var sxData = {}
	$('.right_saixuan dd').click(function(){
		var t = $(this);
		t.toggleClass('dd_chose');
	});

	// 重置
	$('.right_saixuan .reset_btn').click(function(){
		$('.right_saixuan dd').removeClass('dd_chose');  //清除所有选项
		slider.reset();
	});

	// 确定
	$('.btn_group .sure_btn').click(function(){
		var sxData =[] ;
		if($('#pricetemp').val()!=""){
			var val = $("#pricetemp").val()
			sxData.push('&pricetemp='+val)
		}
		$('.right_saixuan dd').each(function(){
			var t = $(this),datatype = t.attr('data-type');
			if(t.hasClass('dd_chose')){
				sxData.push('&'+datatype+'='+datatype)
			}
		});
		$('.mask').click();
		if(sxData.length==0) return false;
		page = 1;
		getlist(sxData.join(''));
		console.log(sxData)

	})
	// 点击遮罩层
	$('.mask').click(function(){
		$(this).hide();

		$('.right_saixuan,.px_box').hide();
		$('.right_btn,.composite.px_li').removeClass('slideUp');
		$('dt.order_box,.pxBox').removeClass('fixedtop');
	});

	// 点击搜索按钮


    function getlist(selecttype){
    	if(!lat || !lng) return;
		var sx = '';
		if(selecttype){
			sx = selecttype;
		}
	    shop_load = 1;

		if(page == 1){
			$('.ul_box').html('');
		}
		$('.ul_box').append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');    /* 加载中请稍后 */

		// yingye:1,

		if(keywords){
			var history = utils.getStorage('wm_history_search');
			history = history ? history : [];
			if(history && history.length >= 10 && $.inArray(keywords, history) < 0){
          history = history.slice(1);
      }

			// 判断是否已经搜过
      if($.inArray(keywords, history) > -1){
        for (var i = 0; i < history.length; i++) {
          if (history[i] === keywords) {
            history.splice(i, 1);
            break;
          }
        }
      }
      history.push(keywords);
      utils.setStorage('wm_history_search', JSON.stringify(history));
		}
		
		$.ajax({
            url: '/include/ajax.php?service=waimai&action=shopList&'+sx,
            data: {
                lng: lng,
                lat: lat,
                page: page,
				keywords:keywords,
                pageSize: 10
            },
            type: 'get',
            dataType: 'json',
            success: function(data){
                if(data.state == 100){
                    var list = [];
                    $('.ul_box .loading').remove();
                    var info = data.info.list;
                    $('.tab_li.li_active').attr('data-total',data.info.pageInfo.totalPage)
                    for(var i = 0; i < info.length; i++){
                        var d = info[i];
                        var hideClass="";
                        list.push('<li class="li_box brand_shop"><a class="fn-clear " href="'+d.url+'">');
                         var  xx = '';
						if(d.yingye=='1'){
							xx = ""
						}else{
							xx = "<i>休息中</i>";
						}
                        list.push('<div class="left_logo"><img src="'+d.pic+'" alt="'+d.shopname+'"  onerror="this.src=\'/static/images/shop.png\'"/>'+xx+'</div>')
						var text = d.delivery_fee==0?"免配送费":(langData['waimai'][2][7]+"<em>"+echoCurrency('symbol')+d.delivery_fee+"</em>");
						list.push('<div class="right_detail"><h3>'+d.shopname+'</h3>');
						list.push('<div class="shop_info fn-clear"><p class="left_info "><span class="fen '+(d.star>0?"":"no_com")+'"><em>'+(d.star>0?d.star:langData['waimai'][2][4])+'</em></span><span class="shop_sale">'+langData['waimai'][7][84]+' <em> '+d.sale+'</em></span></p><p class="right_info"><span class="time">'+(d.delivery_time?d.delivery_time:0)+langData['waimai'][2][11]+'</span><span class="shop_distance">'+d.juli+'</span></p></div>');  /*暂无评分 - - 已售  --分钟 */
						list.push('<div class="ps_info fn-clear"><p class="left_ps"><span class="start_ps">'+langData['waimai'][2][6]+'<em>'+echoCurrency('symbol')+d.basicprice+'</em></span><span class="start_ps">'+text+'</span></p>'+(d.delivery_service?"<p class='ps_name'>"+d.delivery_service+"</p>":"")+'</div>');    /* 起送 --- 配送 */

						if(d.promotions){
							list.push('<p class="hui_info">');
							for(var m=0; m<d.promotions.length; m++){
								if(d.promotions[m][0]!=0){
									list.push('<span>'+d.promotions[m].join(langData['waimai'][2][93])+'</span>');    /* 减 */
								}

							}
							list.push('</p>')
						}
						if(d.is_first_discount=='1'){
							list.push('<p class="first_tip"><i>'+langData['waimai'][7][137]+'</i>'+langData['waimai'][2][8].replace('1', d.first_discount)+'</p>');   //首单   --首单立减
						}
						if(d.is_discount=='1'){
							list.push('<p class="discount_tip"><i>'+langData['waimai'][7][138]+'</i>'+langData['waimai'][2][90].replace('1', d.discount_value)+'</p>');   //折扣 --- 本店开启了1折优惠活动
						}
						list.push('<ul class="pro_show">');
						      for(var m=0;m<d.foodList.length;m++){
						       list.push('<li class="pro_li" data-id="'+d.foodList[m].id+'" data-typeid="'+d.foodList[m].typeid+'"><div class="pro_img"><img src="'+(d.foodList[m].pics[0])+'"></div><div class="pro_info"><h4>'+d.foodList[m].title+'</h4><p><em>'+echoCurrency('symbol')+'</em>'+d.foodList[m].price+'</p></div></li>');
						      }
						list.push('</ul>');
                        list.push('</div></a></li>');
                    }

                    if(page == 1){
                    	$('.ul_box').html('');
                		$('.ul_box').append(list.join(''));
                	}else{
                		$('.ul_box').append(list.join(''));
                	}

                	setTimeout(function(){
                		 shop_load = 0;
                		 if(data.info.pageInfo.totalPage <= page){
	                        $('.ul_box').append('<div class="loading">'+langData['siteConfig'][20][185]+'</div>');   /* 已加载完全部信息！*/
	                        shop_load = 1;
	                        return false;
	                    }
                	},500)


                }else{
                    $('.ul_box .loading').html(data.info);
                }

            },
            error: function(){
                $('.ul_box.loading').html(langData['siteConfig'][20][227]);   /* 网络错误，加载失败！*/
            }
        })
    };


	// 点击商品
	$('body').delegate('.pro_li',"click",function(e){
		var t = $(this),id=t.attr('data-id'),typeid=t.attr('data-typeid');
		var a = t.closest('a') ,href = a.attr('href');
		a.attr('href',href+'?foodid='+id+'&typeid='+typeid)
	})


	function getParam(paramName) {
	    paramValue = "", isFound = !1;
	    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
	        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
	        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
	    }
	    return paramValue == "" && (paramValue = null), paramValue
	}

});
