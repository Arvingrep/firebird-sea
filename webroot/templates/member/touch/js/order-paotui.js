/**
 * 会员中心商城订单列表
 * by guozi at: 20151130
 */

var objId = $("#list");
detailUrl = detailUrl.replace("waimai", 'paotui')
$(function(){



    function getParam(paramName) {
	    paramValue = "", isFound = !1;
	    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
	        arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
	        while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
	    }
	    return paramValue == "" && (paramValue = null), paramValue
	  }

	//状态切换
	$(".tab ul li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("sel")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
      		objId.html('');
			getList();
		}
	});
      
    var urlState = getParam('state');
  if(urlState){
      $(".tab ul li[data-id='"+urlState+"']").click()
  }

  // 下拉加载
  $(window).scroll(function() {
    var h = $('.myitem').height();
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - w - h;
    if ($(window).scrollTop() > scroll && !isload) {
      atpage++;
      getList();
    };
  });
    function caTime(time1,time2){
      var begin1=time1.substr(0,10).split("-");
	  var end1=time2.substr(0,10).split("-");
      var date1=new Date(begin1[1] + - + begin1[2] + - + begin1[0]);
	  var date2=new Date(end1[1] + - + end1[2] + - + end1[0]);
      var m=parseInt(Math.abs(date2-date1)/1000/60);
      var min1=parseInt(time1.substr(11,2))*60+parseInt(time1.substr(14,2));
	  var min2=parseInt(time2.substr(11,2))*60+parseInt(time2.substr(14,2));
      var n=min2-min1;
      var minutes=m+n;
      return minutes;

  }

	// 删除
	objId.delegate(".delete", "click", function(){
		var t = $(this), par = t.closest(".myitem"), id = par.attr("data-id");
		if (id) {
	      $('.del_confirm').addClass('show');
	      $('.mask_pop').show();
	      $('.del_btn').click(function(e){
	        $('.del_confirm').removeClass('show');
	        $('.mask_pop').hide();
	        e.stopImmediatePropagation();   //阻止事件继续执行
	      });
	      $('.suredel_btn').off('click').click(function(e){
	        $.ajax({
	          url: "/include/ajax.php?service=waimai&action=delOrder&type=paotui&id=" + id,
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
	        $('.del_confirm').removeClass('show');
	        $('.mask_pop').hide();
	      })

	    }
	});

	// 取消
	objId.delegate(".cancel", "click", function(){
		var t = $(this), par = t.closest(".myitem"), id = par.attr("data-id"),amount = par.attr("data-amount"),paydate = par.attr("data-paydate"),pstate = par.attr("data-state");
		if (id) {
	      $('.pop_confirm').addClass('show');
	      $('.mask_pop').show();
          if(pstate == 3 || pstate == 0){//未付款/等待接单 可直接取消
            $('.pop_confirm .pop_tip p').text('订单一旦取消不可恢复');
          }else{
             if(csprice > 0){
              var kouPrice = (amount*(csprice/100)).toFixed(2);
              if(cstime > 0){//多少分钟免费
                var calcTime = caTime(paydate,noww);//计算是否在免费时间内
                if(calcTime > cstime){
                  $('.pop_confirm .pop_tip p').text('取消订单将扣除'+kouPrice+echoCurrency('short'));
                }else{
                  $('.pop_confirm .pop_tip p').text('订单一旦取消不可恢复');
                }

              }else{
                $('.pop_confirm .pop_tip p').text('取消订单将扣除'+kouPrice+echoCurrency('short'));
              }


            }else{
              $('.pop_confirm .pop_tip p').text('订单一旦取消不可恢复');
            }
          }

	      $('.cancle_btn').click(function(e){
	        $('.pop_confirm').removeClass('show');
	        $('.mask_pop').hide();
	        e.stopImmediatePropagation();   //阻止事件继续执行
	      });
	      $('.sure_btn').off('click').click(function(e){
	        $.ajax({
	          url: "/include/ajax.php?service=waimai&action=cancelPaotuiOrder&id=" + id,
	          type: "GET",
	          dataType: "json",
	          success: function(data) {
	            if (data && data.state == 100) {

	              //取消成功后移除信息层并异步获取最新列表
					alert('取消成功')
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

	$('.mask_pop').click(function() {
	    $('.mask_pop').hide();
	    $('.del_confirm').removeClass('show');
	    $('.pop_confirm').removeClass('show');
	  });


});

function getList(is){

  isload = true;

	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();
	$.ajax({
		url: masterDomain+"/include/ajax.php?service=waimai&action=paotuiOrder&userid="+userid+"&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {

			if(data && data.state != 200){
				if(data.state == 101){
					$('.loading').remove();
					$('.no-data').show();

				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					var totalPage = pageInfo.totalPage;

                    $('#totalCount').html(pageInfo.totalCount);
                    $('#state0').html(pageInfo.state0);
                    $('#state1').html(pageInfo.state1);
                    $('#state3').html(pageInfo.state3);
                    $('#state4').html(pageInfo.state4);
                    $('#state5').html(pageInfo.state5);

					var psmap = '';
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
								orderstate    = list[i].state,
								uid      = list[i].uid,
								username = list[i].username,
								address = list[i].address,
								buyaddress = list[i].buyaddress,
								buyform = list[i].buyform,//0为指定地址购买 1为骑手就近购买
								payurl   = list[i].payurl,
							    buylng   = list[i].buylng,
								buylat   = list[i].buylat,
								lng   	 = list[i].lng,
								lat   	 = list[i].lat,
                                peilng   	 = list[i].pslng,
								peilat   	 = list[i].pslat,
                          		gettime   	 = list[i].gettime,
								totime   	 = list[i].totime,
								iscomment 	 = list[i].iscomment,
								username 	 = list[i].username,
								gettel 	 	 = list[i].gettel,
								getname 	 = list[i].getperson,
								tel 	 	 = list[i].tel;

						  cstime = list[0].cstime;
                          csprice = list[0].csprice;

		                  var stateInfo = btn  = "";
		                  var timeInfo = '<span class="xdTime">'+pubdate+'</span>';
		                  var agurl = '';
		                  if(type == 1){
							  agurl = buyurl;
						  }else{
							  agurl = songurl;
						  }
		                  switch(orderstate){
		                    case "0"://未付款
		                      stateInfo = '<em class="state fn-right">'+langData['siteConfig'][9][23]+'</em>';//待付款
		                      btn = '<a href="javascript:;" class="btn-nobg gray cancel">'+langData['siteConfig'][6][65]+'</a><a href="javascript:;" class="btn-bg yellow popPay" data-ordernum ="'+list[i].ordernum+'">'+langData['siteConfig'][23][113]+'</a>';//取消订单 -- 立即支付

		                      timeInfo ='<p class="zfPrice">需支付<span>'+echoCurrency('symbol')+amount+'</span></p>'
		                      break;
		                    case "1"://已送达

								if(iscomment == 0){
									var commenturl = commentUrl.replace("%id%", id);
									stateInfo = '<em class="state fn-right">已送达</em>';//已送达
									btn = '<a href="'+commenturl+'" class="btn-nobg gray com_order">'+langData['siteConfig'][6][116]+'</a>';//去评价
								}else{

									stateInfo = '<em class="state fn-right">'+langData['siteConfig'][16][116]+'</em>';//已完成
									btn = '<a href="'+agurl+'" class="btn-nobg gray newAgain">再来一单</a>';//再来一单
								}


		                      break;
		                    case "3"://已付款
		                      stateInfo = '<em class="state fn-right">等待接单</em>';//等待接单
		                      btn = '<a href="javascript:;" class="btn-nobg gray cancel">'+langData['siteConfig'][6][65]+'</a>';//取消订单
		                      if(type==2||(type == 1 && buyform == 0)){//取送货或者指定地址购买
								psmap = '<div class="map_show" data-id="'+id+'" data-pslat="" data-pslng="" data-shopLng="'+buylng+'" data-shopLat="'+buylat+'" data-userLng="'+lng+'" data-userLat="'+lat+'" data-type="'+type+'" data-state="'+orderstate+'" data-buyform="'+buyform+'" data-gettime ="'+gettime+'" data-totime ="'+totime+'"><div id="map'+id+'"></div></div>';
		                      }
		                      break;
		                    case "4"://已接单
		                      stateInfo = '<em class="state fn-right">'+langData['waimai'][7][114]+'</em>';//骑手已接单
		                      btn = '<a href="javascript:;" class="btn-nobg gray cancel">'+langData['siteConfig'][6][65]+'</a>';//取消订单
		                      if(type==2||(type == 1 && buyform == 0)){//取送货或者指定地址购买
								psmap = '<div class="map_show" data-id="'+id+'" data-pslat="'+peilat+'" data-pslng="'+peilng+'" data-shopLng="'+buylng+'" data-shopLat="'+buylat+'" data-userLng="'+lng+'" data-userLat="'+lat+'" data-type="'+type+'" data-state="'+orderstate+'" data-buyform="'+buyform+'" data-gettime ="'+gettime+'" data-totime ="'+totime+'"><div id="map'+id+'"></div></div>';
		                      }else{//骑手就近购买
		                      	psmap = '<div class="map_show" data-id="'+id+'" data-pslat="'+peilat+'" data-pslng="'+peilng+'" data-shopLng="'+buylng+'" data-shopLat="'+buylat+'" data-userLng="'+lng+'" data-userLat="'+lat+'" data-type="'+type+'" data-state="'+orderstate+'" data-buyform="'+buyform+'" data-gettime ="'+gettime+'" data-totime ="'+totime+'"><div id="map'+id+'"></div></div>';
		                      }


		                    	break;

		                    case "2"://待确认
		                      stateInfo = '<em class="state fn-right">待确认</em>';//待确认
								btn = '<a href="javascript:;" class="btn-nobg gray cancel">'+langData['siteConfig'][6][65]+'</a>';//取消订单
		                      break;
		                    case "5"://配送中
		                      	stateInfo = '<em class="state fn-right">'+langData['siteConfig'][16][115]+'</em>';//配送中
		                      	btn = '<a href="'+detailUrl.replace("%id%", id)+'" class="btn-nobg gray">订单详情</a>';//联系骑手

	 							psmap = '<div class="map_show" data-id="'+id+'" data-pslat="'+peilat+'" data-pslng="'+peilng+'" data-shopLng="'+buylng+'" data-shopLat="'+buylat+'" data-userLng="'+lng+'" data-userLat="'+lat+'" data-type="'+type+'" data-state="'+orderstate+'" data-buyform="'+buyform+'" data-gettime ="'+gettime+'" data-totime ="'+totime+'"><div id="map'+id+'"></div></div>';

		                      break;

		                    case "6":
		                      stateInfo = '<em class="state fn-right">'+langData['siteConfig'][9][13]+'</em>';//已取消
		                      btn = '<a href="'+agurl+'" class="btn-nobg gray newAgain">重新下单</a><a href="javascript:;" class="btn-nobg gray delete">'+langData['siteConfig'][6][8]+'</a>';//重新下单--删除
		                      break;

		                    case "7":
		                      stateInfo = '<em class="state fn-right">'+langData['siteConfig'][9][47]+'</em>';
		                      btn = '<a href="javascript:;" class="btn-nobg gray delete">'+langData['siteConfig'][6][8]+'</a>';
		                      break;

		                  }
		                  	var speCla = '',speCla2='';
							if(orderstate==5 || orderstate==4 || (orderstate==3 && buyform == 0)){//显示地图
								speCla='ptmap';
								speCla2 = 'ptdl';
							}


							html.push('<dl class="myitem '+speCla2+'" data-id="'+id+'" data-amount="'+amount+'" data-state="'+orderstate+'" data-paydate="'+(orderstate == 0?'':paydate)+'">');
							html.push('<dt class="pttitle">');
							html.push('<div class="infobox">');
							if(type == 1){//帮我买
								html.push('<span class="ptype buy">帮我买</span>');
							}else{//帮我送
								html.push('<span class="ptype">取送件</span>');
							}
							html.push('<p class="ptinfo">'+shop+'</p>');
							html.push('</div>');
							html.push('<p class="order-state"><span>'+stateInfo+'</span></p>');
							html.push('</dt>');
							html.push('<dd class="ptcontent">')

							html.push('<a href="'+detailUrl.replace("%id%", id)+'" class="'+speCla+'">');
							if(orderstate==5 || orderstate==4 || (orderstate==3 && buyform == 0)){//显示地图
								html.push(psmap)
							}else{
								html.push('<ul class="shoptype">');
								html.push('	<li class="qh">');
								html.push('		<span>'+((type == 1)?'买':'取')+'</span>');
								html.push('		<div class="qCon">');
								html.push('			<h3>'+buyaddress+'</h3>');
								if(type == 2){
								html.push('			<p>'+username+'<em>'+tel+'</em></p>');
								}

								html.push('		</div>');
								html.push('	</li>');
								html.push('	<li class="qh">');
								html.push('		<span>收</span>');
								html.push('		<div class="qCon">');
								html.push('			<h3>'+address+'</h3>');
								html.push('			<p>'+getname+'<em>'+gettel+'</em></p>');
								html.push('		</div>');
								html.push('	</li>');
								html.push('</ul>');
							}

							html.push('</a>');

							html.push('<div class="detInfo fn-clear">')
							html.push(timeInfo);
							html.push('<div class="ptBtn" data-action="paotui">'+btn+'</div>')
							html.push('</div>');

							html.push('</dd>');
							html.push('</dl>');

						}

						objId.append(html.join(""));
						$('.map_show').each(function(){

							var t = $(this),
							type = t.attr('data-type'),
							id = t.attr('data-id'),
							state = t.attr('data-state'),
							buyform = t.attr('data-buyform'),//指定地址购买/骑手就近购买
							shopLng = t.attr('data-shopLng'),
							shopLat = t.attr('data-shopLat'),
                            gettime = t.attr('data-gettime'),
							totime = t.attr('data-totime'),
							userLng = t.attr('data-userLng'),
							userLat = t.attr('data-userLat'),
							pslat = t.attr('data-pslat')
							pslng = t.attr('data-pslng');
							var shop = {"lng":shopLng,"lat":shopLat};
							var ps = {"lng":pslng,"lat":pslat};
							var user = {"lng":userLng,"lat":userLat};
							mapShow(shop,ps,user,id,type,state,buyform,totime);


						})
						$('.no-data').hide();
			            $('.loading').remove();
						isload = false;
						if(atpage >= totalPage){
							isload = true;
							objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");//已加载完全部信息！
						}

					}else{
            			$('.loading').remove();
						objId.append("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
					}
				}
			}else{
				$('.loading').remove();
				objId.append("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
			}
		}
	});
}


//x 店铺 y 配送员 z 收货 ortype 帮我买/取送货 ostate状态 obuyfrom 指定地址购买/骑手就近购买 ttime 送达时间
function mapShow(x,y,z,id,ortype,ostate,obuyfrom,ttime){
	var sCont = '',xdTime;
     xdTime = ttime;

	if(ostate == 4){//取货中
      if(ortype ==1){//帮我买
        if(obuyfrom == 1){//就近购买
          sCont = '<p>骑手正在附近为您购买商品</p>';
        }else{
          sCont = '<p>骑手正赶往商店采购</p>';
        }

      }else{//取送
        sCont = '<p>骑手正赶往取货地址</p>'
      }

    }else{//配送中

      if(ortype ==1){//帮我买
        sCont = '<p>商品已购买，预计'+xdTime+'送达</p>';
      }else{//取送
        sCont = '<p>骑手正在配送，预计'+xdTime+'送达</p>';
      }
    }

	var mapPath;
	if (site_map == "baidu") {
	 	mapPath = new BMap.Map('map'+id);
	 	var labelStyle = {
		   color: "#fff",
		   borderWidth: "0",
		   padding: "0",
		   zIndex: "2",
		   backgroundColor: "transparent",
		   textAlign: "center",
		   fontFamily: '"Hiragino Sans GB", "Microsoft Yahei UI", "Microsoft Yahei", "微软雅黑", "Segoe UI", Tahoma, "宋体b8bf53", SimSun, sans-serif'
		}


		var usCont = '',shopIcon,courier;
		var user = new BMap.Point(z.lng,z.lat);  //收货坐标
		if(ostate == 3){//等待接单
		    usCont = '<p>预计'+xdTime+'送达</p>';

		}else{
			courier = new BMap.Point(y.lng,y.lat);  //骑手坐标
		}

		var userIcon = new BMap.Label('<div class="bubble person">'+usCont+'</div>', {
		  position: user,
		  offset: new BMap.Size(-15, -33),
		});
		userIcon.setStyle(labelStyle);

		mapPath.addOverlay(userIcon);
		var centerPoint = new BMap.Point(z.lng, z.lat);
		//画中心点
		// if(ostate == 3){//无骑手时中心点为用户
		// 	centerPoint = new BMap.Point(z.lng, z.lat);
		// }
		mapPath.centerAndZoom(centerPoint, 14);

		//开始划线
		var riding1 = new BMap.RidingRoute(mapPath, {
		    renderOptions: {
		        map: mapPath,
		        autoViewport: true

		    },
			onPolylinesSet:function(Route){
			  //当线条添加完成时调用
			  for(var i=0;i<Route.length;i++){
			  var polyline = Route[i].getPolyline();//获取线条遮挡物
				  polyline.setStrokeColor("#307CFC");//设置颜色
				  polyline.setStrokeWeight(3);//设置宽度
				  polyline.setStrokeOpacity(1);//设置透明度
			  }
			},
			onMarkersSet:function(routes) {
				 for (var i = 0; i <routes.length; i++) {
					// 判断是否是途经点
					if(typeof(routes[i].Km)=="undefined"){
							mapPath.removeOverlay(routes[i].marker); //删除起始默认图标
					}
				}
			}
		});
		//开始划线
		var riding2 = new BMap.RidingRoute(mapPath, {
		    renderOptions: {
		        map: mapPath,
		        autoViewport: true

		    },
			onPolylinesSet:function(Route){
			  //当线条添加完成时调用
			  for(var i=0;i<Route.length;i++){
			  var polyline = Route[i].getPolyline();//获取线条遮挡物
				  polyline.setStrokeColor("#307CFC");//设置颜色
				  polyline.setStrokeWeight(3);//设置宽度
				  polyline.setStrokeOpacity(1);//设置透明度
			  }
			},
			onMarkersSet:function(routes) {
				 for (var i = 0; i <routes.length; i++) {
					// 判断是否是途经点
					if(typeof(routes[i].Km)=="undefined"){
							mapPath.removeOverlay(routes[i].marker); //删除起始默认图标
					}
				}
			}
		});


		if((ortype == 2) ||(ortype == 1 && obuyfrom == 0)){//取送货/帮我买去指定地址购买
			var shop = new BMap.Point(x.lng,x.lat);  //取货坐标
			if(ortype ==2){//取送货

				shopIcon = new BMap.Label('<div class="bubble shop"></div>', {
				  position: shop,
				  offset: new BMap.Size(-15, -33),
				});
			}else{
				shopIcon = new BMap.Label('<div class="bubble buy"></div>', {
				  position: shop,
				  offset: new BMap.Size(-15, -33),
				});
			}
			shopIcon.setStyle(labelStyle);
			mapPath.addOverlay(shopIcon);
			if(ostate == 3){//只画取送货路线
	          riding1.search(shop,user);  //店铺~顾客
	        }else{//配送中 --加上骑手 两条线

	          riding1.search(shop,courier);  //店铺~骑手
	          riding2.search(courier,user);  //骑手~顾客

	        }

		}

		if((ortype == 1 && obuyfrom == 1) && ostate == 5){//骑手就近购买好商品 配送中
	       riding2.search(courier,user);  //骑手~顾客
	    }

	    if(ostate == 4 || ostate == 5){
	    	var bubbleLabel = new BMap.Label('<div class="bubble courier">'+sCont+'</div>', {
			    position: courier,
			    offset: new BMap.Size(-25, -45)
			});
			//画骑手坐标
			bubbleLabel.setStyle(labelStyle);
			bubbleLabel.zIndex = 4;
			mapPath.addOverlay(bubbleLabel);
	    }





	}else if(site_map == 'amap'){
		var routeLine; //高德地图专用
		var centerP = [z.lng, z.lat];
	    if(ortype == 1 && ostate == 4 && obuyfrom == 1){//骑手就近购买商品--中心点为骑手
	        centerP = [y.lng, y.lat];
	    }
      console.log(centerP);
      console.log(id)
		// 初始化地图
		mapPath = new AMap.Map('map'+id, {
			center: centerP,
			zoom: 14
		});
		var usCont = '';
	    if(ostate == 3){
	       usCont = '<p>预计'+xdTime+'送达</p>';
	    }
		userIcon = new AMap.Marker({
			position: [z.lng,z.lat],
			content: '<div class="bubble person">'+usCont+'</div>',
			offset: new AMap.Pixel(-15, -33),
			map: mapPath
		});
		if(ostate == 4 || ostate == 5){
			qsIcon = new AMap.Marker({
				position: [y.lng,y.lat],
				content: '<div class="bubble courier">'+sCont+'</div>',
				offset: new AMap.Pixel(-15, -33),
				map: mapPath
			});
		}
		var ridingOption = {
			policy: 1
		}
		var riding1 = new AMap.Riding(ridingOption);
		var riding2 = new AMap.Riding(ridingOption);
		//绘制取货地点/指定地址购买点
      	if((ortype == 2) ||(ortype == 1 && obuyfrom == 0)){//取送货/帮我买去指定地址购买
      		if(ortype == 1){
	          shopIcon = new AMap.Marker({
	            position: [x.lng,x.lat],
	            content: '<div class="bubble buy"></div>',
	            offset: new AMap.Pixel(-15, -33),
	            map: mapPath
	          });
	        }else{
	          shopIcon = new AMap.Marker({
	            position: [x.lng,x.lat],
	            content: '<div class="bubble shop"></div>',
	            offset: new AMap.Pixel(-15, -33),
	            map: mapPath
	          });
	        }
	        if(ostate == 3){//只画取送货路线
	          riding1.search([x.lng, x.lat],[z.lng, z.lat], function(status, result) {
	            if (status === 'complete') {
	              if (result.routes && result.routes.length) {
	                drawRoute("1",result.routes[0],mapPath)
	                // log.success('绘制骑行路线完成')
	              }
	            }
	          });

	        }else{//配送中 --加上骑手 两条线
	          riding1.search([x.lng, x.lat],[y.lng, y.lat], function(status, result) {
	            if (status === 'complete') {
	              if (result.routes && result.routes.length) {
	                drawRoute("1",result.routes[0],mapPath)
	                // log.success('绘制骑行路线完成')
	              }
	            }
	          });

	          riding2.search([y.lng, y.lat],[z.lng, z.lat], function(status, result) {
	            if (status === 'complete') {
	              if (result.routes && result.routes.length) {
	                drawRoute("1",result.routes[0],mapPath)
	                // log.success('绘制骑行路线完成')
	              }
	            }
	          });
	        }
      	}


		if((ortype == 1 && obuyfrom == 1) && ostate == 5){//骑手就近购买好商品 配送中
	        riding1.search([y.lng, y.lat],[z.lng, z.lat], function(status, result) {
	            if (status === 'complete') {
	              if (result.routes && result.routes.length) {
	                drawRoute("1",result.routes[0],mapPath)
	                // log.success('绘制骑行路线完成')
	              }
	            }
	          });
	    }



	}else if(site_map == 'google'){
		var directionsService,directionsRenderer,directionsService1,directionsRenderer1;
		var infoWindow = new google.maps.InfoWindow;
		var centerPoint = new google.maps.LatLng(parseFloat(z.lat), parseFloat(z.lng));
	    if(ortype == 1 && ostate == 4 && obuyfrom == 1){//骑手就近购买商品--中心点为骑手
	        centerPoint = new google.maps.LatLng(parseFloat(y.lat), parseFloat(y.lng));
	    }
		// 初始化地图
		mapPath = new google.maps.Map(document.getElementById('map'+id), {
		   	zoom: 14,
		   	center: centerPoint,
		   	zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControlOptions: {
              style: google.maps.ZoomControlStyle.SMALL
            }
		});
		var uposition = new google.maps.LatLng(parseFloat(z.lat),parseFloat(z.lng));
	    userIcon = new MarkerWithLabel({
	        position: uposition,
	        draggable: true,
	        map: mapPath,
	        labelAnchor: new google.maps.Point(15, 33),
	        labelContent: '<div class="bubble person"></div>',
	        icon:'/static/images/blank.gif',
	    });

		if(ostate == 3){
	        var infowincontent = '<p>预计'+xdTime+'送达</p>';
	        infoWindow.setContent(infowincontent);
	        infoWindow.open(mapPath, userIcon);
	    }

	    directionsService = new google.maps.DirectionsService();
	    directionsRenderer = new google.maps.DirectionsRenderer({
	        suppressMarkers:true  ,
	    });
	    directionsRenderer.setOptions({
	        polylineOptions: {
	          strokeColor: '#027CFF'
	        }
	    });
	    directionsRenderer.setMap(mapPath);
	    var qlnglat,slnglat,ulnglat;
	    if(ostate == 4 || ostate == 5){
		  	qlnglat = {"lng":Number(y.lng),"lat":Number(y.lat)}; //骑手坐标
		  	var qposition = new google.maps.LatLng(parseFloat(y.lat),parseFloat(y.lng));
		  	qsIcon  = new MarkerWithLabel({
		        position: qposition,
		        draggable: true,
		        map: mapPath,
		        labelAnchor: new google.maps.Point(24, 40),
		        labelContent: '<div class="bubble courier"></div>',
		        icon:'/static/images/blank.gif',
	      	});
	      	infoWindow.setContent(sCont);
      		infoWindow.open(mapPath, qsIcon);
	    }
	    ulnglat = {"lng":Number(z.lng),"lat":Number(z.lat)}; //收货坐标
		//绘制取货地点/指定地址购买点
      	if((ortype == 2) ||(ortype == 1 && obuyfrom == 0)){//取送货/帮我买去指定地址购买
      		slnglat = {"lng":Number(x.lng),"lat":Number(x.lat)}; //取货坐标

			var sposition = new google.maps.LatLng(parseFloat(x.lat),parseFloat(x.lng));
			shopIcon  = new MarkerWithLabel({
	           position: sposition,
	           draggable: true,
	           map: mapPath,
	           labelAnchor: new google.maps.Point(15, 33),
	           labelContent: '<div class="bubble shop"></div>',
	          icon:'/static/images/blank.gif',
	        });

	        if(ostate == 3){//只画取送货路线
	          calculateAndDisplayRoute(directionsService, directionsRenderer,slnglat,ulnglat);
	        }else{//配送中 --加上骑手 两条线
	          directionsService1 = new google.maps.DirectionsService();
	          directionsRenderer1 = new google.maps.DirectionsRenderer({
	            suppressMarkers:true  ,
	          });
	          directionsRenderer1.setOptions({
	            polylineOptions: {
	              strokeColor: '#027CFF'
	            }
	          });
	          directionsRenderer1.setMap(mapPath);
	          calculateAndDisplayRoute(directionsService, directionsRenderer,slnglat,qlnglat);
	          calculateAndDisplayRoute(directionsService1, directionsRenderer1,qlnglat,ulnglat);
	        }

      	}

      	if((ortype == 1 && obuyfrom == 1) && ostate == 5){//骑手就近购买好商品 配送中
	        calculateAndDisplayRoute(directionsService, directionsRenderer,qlnglat,ulnglat);
	    }


	}
}
$('body').delegate(".popPay", "click", function(){

	var ordernum1 = $(this).attr('data-ordernum');

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=waimai&action=paotuiDeal",
		type: 'post',
		data: {'ordernum':ordernum1,'orderfinal':1},
		dataType: 'json',
		success: function(data){
			if(data && data.state == 100){

				sinfo = data.info;
				service   = 'waimai';
				$('#ordernum').val(sinfo.ordernum);
				$('#paction').val('paotuipay');

				$("#pordertype").val('paotui');
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
					$("#bonusinfo").text('额度不足，可用');
					$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
				}else if( bonus * 1 < sinfo.order_amount * 1){
					$("#bonusinfo").text('余额不足，可用');
					$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
				}else{
					$("#bonusinfo").text('可用');
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
		}
	})
});

// 高德地图划线
// 开始规划路线
function parseRouteToPath(route){
 	// 解析RidingRoute对象，构造成AMap.Polyline的path参数需要的格式
 	// RidingResult对象结构参考文档 https://lbs.amap.com/api/javascript-api/reference/route-search#m_RideRoute
 	var path = []
 	for (var i = 0, l = route.rides.length; i < l; i++) {
 		var step = route.rides[i]
 		for (var j = 0, n = step.path.length; j < n; j++) {
 		  path.push(step.path[j])
 		}
 	}
 	return path
}

function drawRoute(type,route,smapPath){//多条线 需传对应的地图
 	var path = parseRouteToPath(route)
 	var startMarker,endMarker;
 	startMarker = new AMap.Marker({
 		position: path[0],
 		content: '<div></div>',
 		offset: new AMap.Pixel(-15, -50),
 		map: smapPath
 	});
 	endMarker = new AMap.Marker({
 		position: path[path.length - 1],
 		content: '<div></div>',
 		// 以 icon 的 [center bottom] 为原点
 		offset: new AMap.Pixel(-15, -50),
 		map: smapPath
 	})

    routeLine = new AMap.Polyline({
		path: path,
		strokeWeight: 5,
		strokeColor: '#027CFF',
		lineJoin: 'round'
	})
	routeLine.setMap(smapPath)
	// 调整视野达到最佳显示区域
	smapPath.setFitView([ startMarker, endMarker, routeLine ])

}
// 谷歌地图规划路线
 function calculateAndDisplayRoute(directionsService, directionsRenderer,start,end) {
  directionsService.route(
	{
	   origin: { lat: Number(start.lat), lng: Number(start.lng) },
	   destination: { lat: Number(end.lat), lng: Number(end.lng) },
	   travelMode: 'WALKING'
	},
	(response, status) => {
	  if (status === "OK") {
		directionsRenderer.setDirections(response);
	  } else {
		window.alert("Directions request failed due to " + status);
	  }
	}
  );
}
