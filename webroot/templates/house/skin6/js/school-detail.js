$(function() {

	 // 展开更多
    var slideHeight = 300; 
  
  	setTimeout(function(){
        var  defHeight = $('.introBox').height();
       	getZhan(defHeight);
    },500);
 
  	function getZhan(defHeight){
        if(defHeight >= slideHeight){
	        $('.introBox').css('height' , slideHeight + 'px');
	        $('.readMore').append('<a href="javascript:;">'+langData['siteConfig'][16][3]+'<i class="rmDown"></i><span></span></a>'); //查看全部
	        $('.readMore a').click(function(){
	            var curHeight = $('.introBox').height();
	            if(curHeight == slideHeight){
	                $('.introBox').animate({height: defHeight}, "normal");
	                $('.readMore a').html(langData['siteConfig'][41][41]+'<i class="rmUp"></i>');//全部收起
	            }else{
	                $('.introBox').animate({height: slideHeight}, "normal");
	                $('.readMore a').html(langData['siteConfig'][16][3]+'<i class="rmDown"></i><span></span>');//查看全部
	            }
	            return false;
	        });
	    }
    }

    //初中 小学 幼儿园 切换
	$('.zs_btn i.tbg').css({
		"top": $(".zs_btn .tb li.curr").position().top
	});
	var isClick = 0;
	$(".zs_btn li").click(function() {
		var t = $(this),
			type = t.attr('data-type'),
			pointArr = t.attr('data-point');
		
		if(!t.hasClass('curr')){
			t.addClass("curr").siblings("li").removeClass("curr");
			isClick = 1;
             rangDraw(type,pointArr);          		
		}
		
		$('.zs_btn i.tbg').css({
			"top": t.position().top
		});
		
	});


	var orType = $('.zs_btn li.curr').attr('data-type');
	var orP = $('.zs_btn li.curr').attr('data-point');
    rangDraw(orType,orP);//初始绘制
 
	function rangDraw(sch,parr){//sch 表示初中 小学 幼儿园 parr 路径集合
		//施教范围画图
		if(site_map == 'baidu'){
			var map = new BMap.Map("smap");          
			var point = new BMap.Point(dLng, dLat);
			map.centerAndZoom(point, 15);
			var myIcon = new BMap.Icon(templatePath+"/images/school/mapIcon.png", new BMap.Size(32,43));
	    	var marker2 = new BMap.Marker(point,{icon:myIcon});  // 创建标注
	    	map.addOverlay(marker2); 
          	var top_right_navigation = new BMap.NavigationControl({anchor: BMAP_ANCHOR_TOP_LEFT , type: BMAP_NAVIGATION_CONTROL_SMALL}); //右上角，仅包含平移和缩放按钮
          	map.addControl(top_right_navigation);
         	//画出一个幼儿园的多个区域
          	var ePath = parr.split('/');
            for(var j = 0; j < ePath.length; j++){
             	var pathsArr = [];
                var pathArr = ePath[j].split("|");
                for(var i = 0; i < pathArr.length; i++){
                  var p = pathArr[i].split(",");
                  pathsArr.push(new BMap.Point(p[0],p[1]));
                }

                if(sch == 'yr'){//幼儿园
                    var polygon = new BMap.Polygon(pathsArr, {strokeColor:"rgba(56,117,255,1)", strokeWeight:2, strokeOpacity:1,fillColor:"rgba(56,117,255,0.2)"});  //创建多边形
                    map.addOverlay(polygon);           //增加多边形

                }else if(sch == 'xx'){//小学
                    var polygon = new BMap.Polygon(pathsArr, {strokeColor:"rgba(255,43,43,1)", strokeWeight:2, strokeOpacity:1,fillColor:"rgba(255,43,43,0.2)"});  //创建多边形
                    map.addOverlay(polygon);           //增加多边形

                }else{//初中
                    var polygon = new BMap.Polygon(pathsArr, {strokeColor:"rgba(253,126,34,1)", strokeWeight:2, strokeOpacity:1,fillColor:"rgba(253,125,34,0.2)"});  //创建多边形
                    map.addOverlay(polygon);           //增加多边形
                }
           }
	    	
	    	

		}else if(site_map == 'amap'){//高德地图
			var map = new AMap.Map("smap", {
               	resizeEnable: true,
		        center: [dLng, dLat],
		        zoom: 15
		    });
			// 构造点标记
	        var marker = new AMap.Marker({
	            icon: templatePath+"/images/school/mapIcon.png",
	            position: [dLng, dLat]
	        });
	        map.add(marker);
          	AMap.plugin(["AMap.ToolBar"],function(){   //在地图中添加ToolBar插件
               toolBar = new AMap.ToolBar();
               map.addControl(toolBar);

          	});
			//画出一个幼儿园的多个区域
          	var ePath = parr.split('/');
            for(var j = 0; j < ePath.length; j++){	        
                var pathArr = ePath[j].split("|");
                var pathsArr = [];
                for(var i = 0; i < pathArr.length; i++){
                  var p = pathArr[i].split(",");
                  pathsArr.push(p);
                }

              if(sch == 'yr'){//幼儿园
                  var polygon = new AMap.Polygon({
                      path: pathsArr,
                      strokeColor: "#3875FF", // 线的颜色
                      strokeWeight: 2, // 线的宽度
                      strokeOpacity: 1, // 线的透明度
                      fillOpacity: 0.2, // 面的透明度
                      fillColor: '#3875FF', // 面的颜色
                      zIndex: 50,
                  })
                  map.add(polygon);
              }else if(sch == 'xx'){//小学
                  var polygon = new AMap.Polygon({
                      path: pathsArr,
                      strokeColor: "#FF2B2B", // 线的颜色
                      strokeWeight: 2, // 线的宽度
                      strokeOpacity: 1, // 线的透明度
                      fillOpacity: 0.2, // 面的透明度
                      fillColor: '#FF2B2B', // 面的颜色
                      zIndex: 50,
                  })
                  map.add(polygon);
              }else{//初中
                  var polygon = new AMap.Polygon({
                      path: pathsArr,
                      strokeColor: "#FD7E22", // 线的颜色
                      strokeWeight: 2, // 线的宽度
                      strokeOpacity: 1, // 线的透明度
                      fillOpacity: 0.2, // 面的透明度
                      fillColor: '#FD7D22', // 面的颜色
                      zIndex: 50,
                  })
                  map.add(polygon);
              }
            }
		}else if(site_map == 'google'){//谷歌地图

			var centerPoint =new google.maps.LatLng(dLat, dLng);
         	
			function initialize(){		
             	var mapProp = {
				  center:centerPoint,
				  zoom:14,
				  mapTypeId: google.maps.MapTypeId.ROADMAP
				  };
				  
                var map=new google.maps.Map(document.getElementById("smap"),mapProp);
                var marker=new google.maps.Marker({
                      position:centerPoint,
                      icon: cenicon,
                });
                //绘制中心点图标
                marker.setMap(map);              
              	
				//画出一个幼儿园的多个区域
          		var ePath = parr.split('/');
            	for(var j = 0; j < ePath.length; j++){	        
                  var pathArr = ePath[j].split("|");
                  var pathsArr = [];
                  for(var o = 0; o < pathArr.length; o++){
                      var p = pathArr[o].split(",");
                      pathsArr.push(new google.maps.LatLng(p[1], p[0]));
                  }
                  //绘制多边形覆盖
                  if(sch == 'yr'){//幼儿园
                      var flightPath=new google.maps.Polygon({
                          path: pathsArr,
                          strokeColor: "#3875FF", 
                          strokeWeight: 2, 
                          strokeOpacity: 1,
                          fillOpacity: 0.2,
                          fillColor: '#3875FF',

                      })
                      flightPath.setMap(map);
                  }else if(sch == 'xx'){//小学
                      var flightPath=new google.maps.Polygon({
                          path: pathsArr,
                          strokeColor: "#FF2B2B", 
                          strokeWeight: 2, 
                          strokeOpacity: 1,
                          fillOpacity: 0.2,
                          fillColor: '#FF2B2B',

                      })
                      flightPath.setMap(map);
                  }else{//初中
                      var flightPath=new google.maps.Polygon({
                          path: pathsArr,
                          strokeColor: "#FD7E22", 
                          strokeWeight: 2, 
                          strokeOpacity: 1,
                          fillOpacity: 0.2,
                          fillColor: '#FD7D22',

                      })
                      flightPath.setMap(map);
                  }
                }
			}


			google.maps.event.addDomListener(window, 'load', initialize);
			if(isClick == 1){//判断点击的时候 重新加载一次绘制
				initialize();
			}

        //天地图
        }else if(site_map == 'tmap'){
			var map = new T.Map("smap");          
			var point = new T.LngLat(dLng, dLat);
			map.centerAndZoom(point, 15);

            //创建个人图标
            var myIcon = new T.Icon({
                "iconUrl": templatePath+"images/school/mapIcon.png",
                "iconSize": new T.Point(32, 43),
            });
            var marker2 = new T.Marker(point,{icon:myIcon});  // 创建标注
	        map.addOverLay(marker2);     // 将标注添加到地图中


	    	map.addOverLay(marker2); 

            //创建缩放平移控件对象
            var control = new T.Control.Zoom();
            control.setPosition(T_ANCHOR_TOP_LEFT);
            //添加缩放平移控件
            map.addControl(control);
            
         	//画出一个幼儿园的多个区域
          	var ePath = parr.split('/');
            for(var j = 0; j < ePath.length; j++){
             	var pathsArr = [];
                var pathArr = ePath[j].split("|");
                for(var i = 0; i < pathArr.length; i++){
                  var p = pathArr[i].split(",");
                  pathsArr.push(new T.LngLat(p[0],p[1]));
                }

                if(sch == 'yr'){//幼儿园
                    var polygon = new T.Polygon(pathsArr, {color:"rgba(56,117,255,1)", weight:2, opacity:1,fillColor:"rgba(56,117,255)",fillOpacity:0.2});  //创建多边形
                    map.addOverLay(polygon);           //增加多边形

                }else if(sch == 'xx'){//小学
                    var polygon = new T.Polygon(pathsArr, {color:"rgba(255,43,43,1)", weight:2, opacity:1,fillColor:"rgba(255,43,43)",fillOpacity:0.2});  //创建多边形
                    map.addOverLay(polygon);           //增加多边形

                }else{//初中
                    var polygon = new T.Polygon(pathsArr, {color:"rgba(253,126,34,1)", weight:2, opacity:1,fillColor:"rgba(253,125,34)",fillOpacity:0.2});  //创建多边形
                    map.addOverLay(polygon);           //增加多边形
                }
           }

		}
	}



})
