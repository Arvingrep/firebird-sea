/**
 * 会员中心商城订单列表
 * by guozi at: 20151130
 */

var objId = $("#list");
var iscomment = '';
$(function(){

	var device = navigator.userAgent;
	  if (device.indexOf('huoniao_iOS') > -1) {
	    $('body').addClass('huoniao_iOS');
	  }

      function getParam(paramName) {
	    paramValue = "", isFound = !1;
	    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
	        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
	        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
	    }
	    return paramValue == "" && (paramValue = null), paramValue
	  }

	  // 选择模块
	  $('.orderbtn').click(function(){
	    var t = $(this);
	    if (!t.hasClass('on')) {
	      if (device.indexOf('huoniao_iOS') > -1) {
	    		$('.orderbox').css("top", "calc(.9rem + 20px)");
	    	}else {
	        $('.orderbox').animate({"top":".9rem"},200);
	    	}
	      $('.mask').show().animate({"opacity":"1"},200);
	      $('body').addClass('fixed');
	      t.addClass('on');
	    }else {
	      hideMask();
	    }
	  })

	  $('.mask').click(function(){
	    hideMask();
	  })


	//状态切换
	$(".tab_box ul li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("on_tab") && !t.hasClass("sel")){
			state = id;
			if(id == 1){
				iscomment = 0;
			}else{
				iscomment = '';
			}
			atpage = 1;
			t.addClass("on_tab").siblings("li").removeClass("on_tab");
      		objId.html('');
			getList();
		}
	});
      
    var urlState = getParam('state');
  if(urlState){
      objId.html('');
      $(".tab_box ul li[data-id='"+urlState+"']").click()
  }else{
      getList(1);
  }

	// 隐藏下拉框跟遮罩层
	function hideMask(){
	    $('body').removeClass('fixed');
	    $('.orderbtn').removeClass('on');
	    $('.orderbox').animate({"top":"-100%"},200);
	    $('.mask').hide().animate({"opacity":"0"},200);
	}

  // 下拉加载
  $(window).scroll(function() {
    var h = $('.list_li').height();
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - w - h;
    if ($(window).scrollTop() > scroll && !isload) {
      atpage++;
      getList();
    };
  });

	

	// 删除
	objId.delegate(".del_order", "click", function(){
		var t = $(this), par = t.closest(".list_li"), id = par.attr("data-id");
		if(id){
			if(confirm(langData['siteConfig'][20][182])){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: "/include/ajax.php?service=waimai&action=delOrder&id="+id,
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
						alert(langData['siteConfig'][20][183]);    /* 网络错误，请稍候重试！*/
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			};
		}
	});

	// 取消
	// objId.delegate(".cancel", "click", function(){
	// 	var t = $(this), par = t.closest(".list_li"), id = par.attr("data-id");
	// 	if(id){
	// 		if(confirm(langData['siteConfig'][20][186])){
	// 			t.siblings("a").hide();
	// 			t.addClass("load");

	// 			$.ajax({
	// 				url: "/include/ajax.php?service=waimai&action=cancelOrder&id="+id,
	// 				type: "GET",
	// 				dataType: "json",
	// 				success: function (data) {
	// 					if(data && data.state == 100){

	// 						//取消成功后移除信息层并异步获取最新列表
	// 						location.reload();
	// 					}else{
	// 						alert(data.info);
	// 						t.siblings("a").show();
	// 						t.removeClass("load");
	// 					}
	// 				},
	// 				error: function(){
	// 					alert(langData['siteConfig'][20][183]);
	// 					t.siblings("a").show();
	// 					t.removeClass("load");
	// 				}
	// 			});
	// 		};
	// 	}
	// });

	// 取消订单
	objId.delegate(".cancel", "click", function(){
		var t = $(this), par = t.closest(".list_li"), id = par.attr("data-id");
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
                            alert(data.info);
                            objId.html('');
                            getList();
						} else {
							alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
                            objId.html('');
                            getList();
						}
					},
					error: function() {
						alert(langData['siteConfig'][20][183]);    /* 网络错误，请稍候重试！*/
						t.siblings("a").show();
						t.removeClass("load");
                        objId.html('');
                        getList();
					}
				});
				$('.pop_confirm').removeClass('show');
				$('.mask_pop').hide();
			})

		}
	});




});

function getList(is){

  isload = true;

	// if(is != 1){
	// 	// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	// }
	// {#* 加载中，请稍候 *#}
	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');   /* 加载中，请稍候*/
	$(".pagination").hide();

	var num = $('.tab li.on_tab em').text();
	// {#* 暂无相关信息！: 已加载完全部信息！*#}
	var msg = num == '0' ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];   /* 暂无相关信息！ ---- 已加载完全部信息！*/

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=waimai&action=order&userid="+userid+"&state="+state+"&page="+atpage+"&pageSize="+pageSize+"&iscomment="+iscomment,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$('.loading').remove();
						if(num==0 && atpage==1){
							$('.no-data').show();
						}else{
							objId.append("<p class='loading'>"+msg+"</p>");
						}
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					$('.no-data').hide();
					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item        = [],
								amount      = list[i].amount,
								food        = list[i].food,
								id          = list[i].id,
								ordernum    = list[i].ordernumstore ? list[i].ordernumstore : list[i].ordernum,
								paytype     = list[i].paytype,
								pubdate     = huoniao.transTimes(list[i].pubdate, 1),
								paydate     = huoniao.transTimes(list[i].paydate, 1),
								shopname    = list[i].shopname,
								sid         = list[i].sid,
								state       = list[i].state,
								uid         = list[i].uid,
								username    = list[i].username,
								iscomment   = list[i].iscomment,
								payurl      = list[i].payurl,
								logo        = list[i].shop_logo,
								foodCount   = list[i].foodCount,
								peisongpath_lat = list[i].peisongpath_lat,
								peisongpath_lng = list[i].peisongpath_lng,
								shop_coordX = list[i].shop_coordX,
								shop_coordY = list[i].shop_coordY,
								ordertype   = list[i].ordertype,
							    selftime   = list[i].selftime;
		                  var stateInfo = btn = map = "";
		                  switch(state){
		                    case "0":
		                      stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][22]+'</span></p>';   /* 未付款*/
		                      btn = '<a href="javascript:;" class="cancel danger_btn ">'+langData['siteConfig'][6][65]+'</a><a href="javascript:;" class="btn-bg yellow popPay" data-ordernum ="'+list[i].ordernum+'">'+langData['siteConfig'][6][64]+'</a>';                    /* 删除订单----立即付款*/
		                      break;
		                    case "1":
								stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][6][3]+'</span></p>';  //完成
								var commenturl = commentUrl.replace("%id%", id);
								if(iscomment==1){
		                      	btn = '<a href="'+commenturl+'" class="com_order">'+langData['siteConfig'][8][2]+'</a>'; //删除  //修改评价
													}else{
		                      	btn = '<a href="'+commenturl+'" class="com_order">'+langData['siteConfig'][19][365]+'</a>'; //删除  //评价
													}
														break;
		                    case "2":
		                      stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][11]+'</span></p>';  //待确认
							    btn = '<a href="'+detailUrl.replace("%id%", id)+'" class="">'+langData['siteConfig'][6][113]+'</a>';  /* 取消订单----查看详情*/
		                      break;
		                    case "3":
		                    	if(selftime ==0){

									stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][46]+'</span></p>';   //代配送
								}else{
									stateInfo = '<p class="order-state"><span>'+langData['waimai'][0][31]+'</span></p>';   //代配送
								}

								if(typeof(peisongpath_lng)!="undefined" && typeof(peisongpath_lat)!="undefined"){
									map = '<div class="map_show" data-state="' + state + '" data-type="shop" data-id="' + id + '" data-lng="' + shop_coordY + '" data-lat="' + shop_coordX + '" data-pslng="' + peisongpath_lng + '" data-pslat="' + peisongpath_lat + '"><div id="map' + id + '"></div></div>';
								}else{
		                    		map = '';
								}
								  btn = '<a href="javascript:;" class="cancel fn-hide">'+langData['siteConfig'][6][65]+'</a><a href="'+detailUrl.replace("%id%", id)+'" class="">'+langData['siteConfig'][6][113]+'</a>';  /* 取消订单----查看详情*/
		                      break;
		                    case "4":
		                      stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][16][114]+'</span></p>';  //已接单
								if(typeof(peisongpath_lng)!="undefined" && typeof(peisongpath_lat)!="undefined"){
									map = '<div class="map_show" data-pslng="' + peisongpath_lng + '" data-pslat="' + peisongpath_lat + '" data-state="' + state + '" data-type="shop" data-id="' + id + '" data-lng="' + shop_coordY + '" data-lat="' + shop_coordX + '"><div id="map' + id + '"></div></div>';
								}else{
									map ='';
								}
		                      break;
		                    case "5":
		                      stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][16][115]+'</span></p>'; //配送中

		                      if(typeof(peisongpath_lng)!="undefined" && typeof(peisongpath_lat)!="undefined"){
 									map = '<div class="map_show" data-state="'+state+'" data-type="courier" data-id="'+id+'" data-pslat="'+peisongpath_lng+'" data-pslng="'+peisongpath_lat+'"><div id="map'+id+'"></div></div>';
		                      }else{
		                      		map = '';
		                      }

							    btn = '<a href="javascript:;" class="cancel fn-hide">'+langData['siteConfig'][6][65]+'</a><a href="'+detailUrl.replace("%id%", id)+'" class="">'+langData['siteConfig'][6][113]+'</a>'
		                      break;
		                    case "6":
		                      stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][13]+'</span></p>';  //已取消
		                      btn = '<a href="'+detailUrl.replace("%id%", id)+'" class="to_odetail">'+langData['siteConfig'][6][113]+'</a>';   /* 查看详情  --   删除  <a href="javascript:;" class="del_order danger_btn">'+langData['waimai'][2][42]+'</a>*/
		                      break;
		                    case "7":
		                      stateInfo = '<p class="order-state"><span>'+langData['siteConfig'][9][47]+'</span></p>';  //交易失败
		                      btn = '<a href="'+detailUrl.replace("%id%", id)+'" class="to_odetail">'+langData['siteConfig'][6][113]+'</a>';  //查看详情  删除<a href="javascript:;" class="del_order danger_btn">'+langData['waimai'][2][42]+'</a>
		                      break;
		                  }


							var num_amount = '';
		                    if(amount.toString().indexOf('.') > -1){
								num_amount = (amount.toString()).substring(amount.toString().indexOf('.'),amount.length);
							}
							html.push('<li class="list_li fn-clear" data-id="'+id+'" data-sid="'+sid+'">');
							// html.push('<a style="display:block" href="'+detailUrl.replace("%id%", id)+'">')
							html.push('<div class="order_state"><h5>'+stateInfo+'</h5></div>');
							html.push('<div class="shop_box"><a style="display:block" href="'+detailUrl.replace("%id%", id)+'">');
							// '+templets_skin+'images/orderimag/icon.jpg
							html.push('<div class="left_logo"><span class="url_add fn-clear" data-url="'+shopUrl.replace("%id%", sid)+'"><img src="'+(logo?logo:templets_skin+"images/orderimag/icon.jpg")+'" /></span></div>');
							html.push('<div class="shop_info"><span class="url_add fn-clear" data-url="'+shopUrl.replace("%id%", sid)+'"><h2>'+shopname+'</h2>');
							html.push('<p class="order_time">'+pubdate+'</p></span>');
							// console.log(amount,amount.indexOf('.'))
							html.push('<div class="order_info"><span class="url_add fn-clear" data-url="'+detailUrl.replace("%id%", id)+'"><h3>'+echoCurrency('symbol')+'<em>'+Math.floor(amount)+'</em>'+num_amount+'</h3>');
							html.push('<p class="order_detail"><span class="food_show">');
							html.push('<em>'+food.replace(/，/mg, "</em><em>")+'</em>');
							html.push('</span> '+langData['waimai'][7][147].replace('1',foodCount)+'</p></span>');  /* 等<span class="num_show">1</span>件商品*/
							html.push('</div></div>');
							if(ordertype!=1){

								html.push(map);
							}
							html.push('</a>')
							html.push('<div class="btn_group">'+btn+'</div>')
							html.push('</li>');


  							// 距支付时间30秒内打开此页，清除购物车相关内容
							if((state == 2 || state == 3 || state == 4) && nowdate - list[i].paydate < 30){
							  	utils.removeStorage("wm_cart_"+sid);
							}

						}

						objId.append(html.join(""));
						$('.map_show').each(function(){
							var t = $(this),
							type = t.attr('data-type'),
							state = t.attr('data-state'),
							id = t.attr('data-id'),
							lng = t.attr('data-lng'),
							lat = t.attr('data-lat');
							pslat = t.attr('data-pslat')
							pslng = t.attr('data-pslng');
							var shop = {"lng":lng,"lat":lat};
							var ps = {"lng":pslng,"lat":pslat};
							if(state != '4'){
								mapShow(shop,ps,id,state);
							}else if(pslat!= 'undefined' || pslng!='undefined'){
								mapShow(shop,ps,id,state);
							}else{
								t.remove();
							}

						})
			            $('.loading').remove();
			            isload = false;

					}else{
            			$('.loading').remove();
						objId.append("<p class='loading'>"+msg+"</p>");
					}
					// if(is){
						$("#total").html(pageInfo.totalCount);
						$("#unpaid").html(pageInfo.state0);
						$("#rates").html(pageInfo.noiscomment);
					// }


				}
			}else{
				$('.loading').remove();
				objId.append("<p class='loading'>"+msg+"</p>");
			}
		}
	});
}


// 地图更新
	function mapShow(x,y,id,state){
		 if (site_map == "baidu") {
			 var mapPath = new BMap.Map('map'+id);
			 var labelStyle = {
			   color: "#fff",
			   borderWidth: "0",
			   padding: "0",
			   zIndex: "2",
			   backgroundColor: "transparent",
			   textAlign: "center",
			   fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
			 }
			 if(state==4){
				 var point = new BMap.Point(x.lng,x.lat);
				 var point2 = new BMap.Point(y.lng,y.lat);
				 var bubbleLabel = new BMap.Label('<p class="bubble-3 bubble shop"></p>', {
				   position: point,
				   offset: new BMap.Size(-20, -45)
				 });
				 var bubbleLabel2 = new BMap.Label('<p class="bubble-3 bubble courier"></p>', {
				   position: point2,
				   offset: new BMap.Size(-20, -45)
				 });
				 bubbleLabel.setStyle(labelStyle);
				 bubbleLabel2.setStyle(labelStyle);
				 mapPath.addOverlay(bubbleLabel);
				 mapPath.addOverlay(bubbleLabel2);
				 mapPath.centerAndZoom(point2, 14);
			 }else if(state==3){
				  var point = new BMap.Point(x.lng,x.lat);
				  var bubbleLabel = new BMap.Label('<p class="bubble-3 bubble shop"></p>', {
				    position: point,
				    offset: new BMap.Size(-20, -45)
				  });
				   bubbleLabel.setStyle(labelStyle);
				   mapPath.addOverlay(bubbleLabel);
				   mapPath.centerAndZoom(point, 14);
			 }else if(state==5 ){
				  var point = new BMap.Point(y.lat,y.lng);
				  var bubbleLabel = new BMap.Label('<p class="bubble-3 bubble courier"></p>', {
				    position: point,
				    offset: new BMap.Size(-20, -45)
				  });
				   bubbleLabel.setStyle(labelStyle);
				   mapPath.addOverlay(bubbleLabel);
				   mapPath.centerAndZoom(point, 14);
			 }



		 }else if(site_map == "google"){
			var marker,maker1,mapOptions;
		 if(state==4){
			 mapOptions = {
			   zoom: 14,
			   center: new google.maps.LatLng(x.lat,x.lng),
			   zoomControl: false,
			   mapTypeControl: false,
			   streetViewControl: false,
			   fullscreenControl: false
			 }

		 	// 店铺坐标
		 	marker = new google.maps.Marker({
		 	  position: new google.maps.LatLng(x.lat,x.lng),
		 	  map: mapPath,
		 	  icon: "/static/images/shop_local_google.png?v=1"
		 	});

		 	// 骑手坐标
		 	marker1 = new google.maps.Marker({
		 	  position: new google.maps.LatLng(y.lat,y.lng),
		 	  map: mapPath,
		 	  icon: "/static/images/courier_local_google.png?v=1"
		 	});
		 }else if(state==3){
			 mapOptions = {
			   zoom: 14,
			   center: new google.maps.LatLng(x.lat,x.lng),
			   zoomControl: false,
			   mapTypeControl: false,
			   streetViewControl: false,
			   fullscreenControl: false
			 }
		 	 // 店铺坐标
		 	 marker = new google.maps.Marker({
		 	   position: new google.maps.LatLng(x.lat,x.lng),
		 	   map: mapPath,
		 	   icon: "/static/images/shop_local_google.png?v=1"
		 	 });

		 }else if(state==5){
			 mapOptions = {
			   zoom: 14,
			   center: new google.maps.LatLng(y.lat,y.lng),
			   zoomControl: false,
			   mapTypeControl: false,
			   streetViewControl: false,
			   fullscreenControl: false
			 }
		 	// 骑手坐标
		 	marker1 = new google.maps.Marker({
		 	  position: new google.maps.LatLng(y.lat,y.lng),
		 	  map: mapPath,
		 	  icon: "/static/images/courier_local_google.png?v=1"
		 	});
		 }
		  mapPath = new google.maps.Map(document.getElementById('map'+id), mapOptions);
		 }else if(site_map == "amap"){
		 	var marker1,marker2,amap



		 	if(state==5){
		 		console.log(y)


			   if(y.lat != "undefined" && y.lat != "undefined"){
					amap = new AMap.Map('map'+id, {
				       center:[y.lat,y.lng],
				       zoom:14
				    });
			 		marker2 = new AMap.Marker({
	                     map: amap,
	                     icon: '/static/images/courier_local_google.png?v=1',
	                     position: [y.lat, y.lng], //此处填写点标记的经纬度
	                     offset: new AMap.Pixel(-13, -22)
	               });
		 		}

		 	}else if(state==4){
		 		amap = new AMap.Map('map'+id, {
			       center:[x.lng,x.lat],
			       zoom:14
			    });

			     marker1 = new AMap.Marker({
                     map: amap,
                     icon: '/static/images/shop_local_google.png?v=1',
                     position: [x.lng,x.lat], //此处填写点标记的经纬度
                     offset: new AMap.Pixel(-13, -22)
                 });

			     if(y.lng!='undefined' && y.lat !='undefined'){
			     	 marker2 = new AMap.Marker({
		                     map: amap,
		                     icon: '/static/images/courier_local_google.png?v=1',
		                     position: [y.lat, y.lng], //此处填写点标记的经纬度
		                     offset: new AMap.Pixel(-13, -22)
		               });
			     }


		 	}else if(state==3){
		 		amap = new AMap.Map('map'+id, {
			       center:[x.lng,x.lat],
			       zoom:14
			    });
			    if(x.lat=="undefined" || x.lat=="undefined"){
		 			return false;
		 		}
			     marker1 = new AMap.Marker({
                     map: amap,
                     icon: '/static/images/shop_local_google.png?v=1',
                     position: [x.lng,x.lat], //此处填写点标记的经纬度
                     offset: new AMap.Pixel(-13, -22)
                 });
		 	}

		 }
	}

var utils = {
    canStorage: function(){
        if (!!window.localStorage){
            return true;
        }
        return false;
    },
    setStorage: function(a, c){
        try{
            if (utils.canStorage()){
                localStorage.removeItem(a);
                localStorage.setItem(a, c);
            }
        }catch(b){
            if (b.name == "QUOTA_EXCEEDED_ERR"){
                alert(langData['siteConfig'][20][187]);
            }
        }
    },
    getStorage: function(b){
        if (utils.canStorage()){
            var a = localStorage.getItem(b);
            return a ? JSON.parse(localStorage.getItem(b)) : null;
        }
    },
    removeStorage: function(a){
        if (utils.canStorage()){
            localStorage.removeItem(a);
        }
    },
    cleanStorage: function(){
        if (utils.canStorage()){
            localStorage.clear();
        }
    }
};

$('body').delegate(".popPay", "click", function(){

	var ordernum1 = $(this).attr('data-ordernum');
	shopid = $(this).closest('.list_li').attr('data-sid');
	$.ajax({
		url: masterDomain+"/include/ajax.php?service=waimai&action=pay",
		type: 'post',
		data: {'ordernum':ordernum1,'orderfinal':1},
		dataType: 'json',
		success: function(data){
			if(data && data.state == 100){

				sinfo = data.info;
				service   = 'waimai';
				$('#ordernum').val(sinfo.ordernum);
				$('#action').val('pay');

				$('#pfinal').val('1');
				$("#amout").text(sinfo.order_amount);
				$('.payMask').show();
				$('.payPop').css('transform', 'translateY(0)');

				// if (totalBalance * 1 < sinfo.order_amount * 1) {
				//
				// 	$("#moneyinfo").text('余额不足，');
				//
				// 	$('#balance').hide();
				// }
				if (totalBalance * 1 < sinfo.order_amount * 1) {

					$("#moneyinfo").text('余额不足，');
					$("#moneyinfo").closest('.check-item').addClass('disabled_pay')

					$('#balance').hide();
				}


		        if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
		          $("#bonusinfo").text('额度不足，');
		          $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
		        }else if( bonus * 1 < sinfo.order_amount * 1){
		          $("#bonusinfo").text('余额不足，');
		          $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
		        }else{
		          $("#bonusinfo").text('');
		          $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
		        }


				ordernum = sinfo.ordernum;
				order_amount = sinfo.order_amount;

				payCutDown('', sinfo.timeout, sinfo);
			}else{
				alert(data.info);
			}
		},
		error: function(){
			alert('网络错误，请重试！');
			t.removeClass('disabled');
		}
	})
});
