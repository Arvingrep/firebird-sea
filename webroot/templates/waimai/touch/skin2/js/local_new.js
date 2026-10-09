var ajaxIng = false, pagetoken = '';
new Vue({
  el:'#page',
  data:{
    search_key:'', //搜索关键字
    city:cityname, //城市分站
    currCityLat:cityLat, //城市分站的坐标 纬度
    currCityLng:cityLng, //城市分站的坐标 经度
    currCityInfo:JSON.parse(currCityInfo), //当前选择的城市
    searchList:[], //搜索列表
    islocal:false,
    cityid:cityid,
    lng:0,
    lat:0,
    address:'正在定位...', //当前定位地址
    posiEnd:true, //是否正在定位
    userid:userid, //当前登录用户
    myAddrList:[], //我的地址
    surroundingPois:[], //周边
    loadEnd:false,  //搜索结束
    searchPage:1, // 搜索页码
    isload:false, //
    loading:false,
    returnUrl:'javascript:;',  //返回路径,
    from:'index', //默认页面来自外卖首页
    cityList:[], //城市列表
    szmArr:[],
    hotCity:[],  //热门城市
    cityArr:[], //城市列表排序
    areaInfo:[],//默认选择的城市
    currPosiCity:{}, //当前定位城市
    currCityid:cityid, //当前所选城市的cityid  暂定
  },
  mounted(){
    var tt = this;

    // 获取定位
    tt.getLnglat();
    if(tt.userid){
      tt.getMyAddrList()
    };


  // 页面来自
    tt.from = tt.getParam('from');

    // 获取城市分站列表
    tt.getCityList();




  },
  computed:{
    // 计算距离
    mapDistance(){
      return function(lat_a,lng_a,lat_b,lng_b){
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
          km = km.toFixed(1)+'km';
        }
        return km;
      }
	  },

    // 字母排序
    orderBy(){
      return function(szm){
        var tt = this;
        var citys;
        tt.cityArr.forEach(function(city){
          if(city.key == szm){
            citys = city.arr
          }
        })

        return citys;
      }
    },
  },
  methods:{

    // 搜索关键字
    searchInpChange(){
      var tt = this;
      var el = event.currentTarget;
      if(tt.search_key){
        tt.searchPage = 1;
        tt.isload = false;
        tt.searchList = [];
        tt.loadEnd = false;
        tt.getList(tt.search_key);

      }
    },

    // 搜索列表
    getList(directory){
      var tt = this;
      if(ajaxIng){
        ajaxIng.abort();
      }
      directory = directory.replace(/\s*/g,"");
      if(tt.isload) return false;
      tt.isload = true;
      tt.loading = true;
      ajaxIng = $.ajax({
					// url: '/include/ajax.php?service=siteConfig&action=get114ConveniencePoiList&pageSize=20&page='+tt.searchPage+'&lng='+tt.currCityLng+'&lat='+tt.currCityLat+'&directory='+directory+'&radius='+radius+"&pagetoken="+pagetoken,
					url: '/include/ajax.php?action=getMapSuggestion&cityid='+tt.currCityInfo.cityid+'&lat='+tt.currCityLat+'&lng='+tt.currCityLng+'&query='+directory+'&region='+tt.currCityInfo.name+'&service=siteConfig',
					dataType: 'json',
					success: function(data){
						tt.isload = false;
            tt.loading = false;
						if(data.state == 100){
              tt.loadEnd = true;
							totalPage = 1;
							var list = data.info;

							if(list.length > 0){
                if(tt.searchPage == 1){
                  tt.searchList = list;
                }else{
                  tt.searchList = [...tt.searchList,...list];
                }
                tt.searchPage ++;
                if(tt.searchPage > totalPage){
                  tt.isload = true;
                }
              }else if(tt.searchPage == 1){
                tt.searchList = [];
              }else{
                tt.searchPage ++;
                tt.loading = false;
                tt.loadEnd = true;
              }

						}else{
              tt.loading = true;
              tt.loadEnd = true;
              tt.isload = true;
              tt.searchList = [];
						}
					},
					error: function(){
            tt.isload = false;
            tt.loading = false;
						//showErr(langData['circle'][2][32]);  /* 网络错误，加载失败！*/
					}
				});
    },

    // 跳转链接
    goLink(addr,type){
      var tt = this;
      var time = Date.parse(new Date())/1000;
      var cityid = addr.cityid ? addr.cityid : tt.currCityInfo.cityid;
      var cityname = addr.cityname ? addr.cityname : tt.currCityInfo.name;
      if(type == 1){
        utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': addr.lng, 'lat': addr.lat, 'address':addr.name,'cityid': cityid,'cityname': cityname,site_map:site_map}));
      }else if(type == 2){
        

        utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': addr.lng, 'lat': addr.lat, 'address':addr.address,'cityid': cityid,'cityname': cityname,site_map:site_map }));
      }else{
        utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': addr.point.lng, 'lat': addr.point.lat, 'address':addr.title,'cityid': cityid,'cityname': cityname,site_map:site_map }));
      }
     
      if(type != 1){
        var lng = type == 2 ? addr.lng : addr.point.lng;
        var lat = type == 2 ? addr.lat : addr.point.lat;

        $.ajax({
  				url: '/include/ajax.php?service=siteConfig&action=getLocationByGeocoding&location='+lat+','+lng,
  				type: "POST",
  				dataType: "json",
  				success: function (data) {
  					if(data.state == 100){
              var province = data.info.province, city = data.info.city, district = data.info.district, town = data.info.town;
              console.log(data.info)
      				$.ajax({
      				    url: "/include/ajax.php?service=siteConfig&action=verifyCity&region="+province+"&city="+city+"&district="+district+"&module=waimai"+"&town="+town,
      				    type: "POST",
      				    dataType: "json",
      				    success: function(data){
      				      if(data && data.state == 100){
                      // 说明当前定位开通了分站
                      var nowCityInfo = data.info;
                      if(device.toLowerCase().indexOf('huoniao') > -1 &&  device.toLowerCase().indexOf('android') > -1){
                          setupWebViewJavascriptBridge(function(bridge) {
                              bridge.callHandler('changeCity', JSON.stringify(nowCityInfo), function(){
                              // location.href = nowCityInfo.url + '?currentPageOpen=1' + (device.indexOf('huoniao') > -1 ? '&appIndex=1&appFullScreen' : '');
                            });
                          });
                        }else{

                          var channelDomainClean = typeof masterDomain != 'undefined' ? masterDomain.replace("http://", "").replace("https://", "") : window.location.host;
                          var channelDomain_1 = channelDomainClean.split('.');
                          var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

                          channelDomain_ = channelDomainClean.split("/")[0];
                          channelDomain_1_ = channelDomain_1_.split("/")[0];

                          $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomainClean, path: '/'});
                          $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomain_1_, path: '/'});

                       }
                      if(tt.from == 'index'){
                        location.replace(wmIndex.replace('/'+(JSON.parse(currCityInfo).domain),''))
                      }
                    }else{
                      console.log(data)
                      showErrAlert('此位置暂未开通服务，敬请期待！')
                    }
                  },
              })
            }
  				},
  				error: function(){}
  			});




      }else{
        if(tt.from == 'index'){
          location.replace(wmIndex.replace('/'+(JSON.parse(currCityInfo).domain),''))
        }
      }





    },

    // 点击当前定位
    goCurrPosi(){
      var tt = this;
      var addr = {
        name:tt.address,
        lng:tt.lng,
        lat:tt.lat,
      }

      if(tt.currPosiCity && tt.cityid != tt.currPosiCity.cityid){
        var nowCityInfo = tt.currPosiCity;
        if(device.toLowerCase().indexOf('huoniao') > -1 &&  device.toLowerCase().indexOf('android') > -1){
            setupWebViewJavascriptBridge(function(bridge) {
                bridge.callHandler('changeCity', JSON.stringify(nowCityInfo), function(){
                // location.href = nowCityInfo.url + '?currentPageOpen=1' + (device.indexOf('huoniao') > -1 ? '&appIndex=1&appFullScreen' : '');
              });
            });
          }else{

            var channelDomainClean = typeof masterDomain != 'undefined' ? masterDomain.replace("http://", "").replace("https://", "") : window.location.host;
            var channelDomain_1 = channelDomainClean.split('.');
            var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

            channelDomain_ = channelDomainClean.split("/")[0];
            channelDomain_1_ = channelDomain_1_.split("/")[0];

            $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomainClean, path: '/'});
            $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomain_1_, path: '/'});

         }
      }

      tt.goLink(addr,1)
    },


    // 获取坐标
    getLnglat(posi){
      var tt = this;
      var localData = utils.getStorage('waimai_local');
      if(posi){
        tt.posiEnd = false;
        tt.address = '定位中...'
      }
      // 默认显示本地存储的坐标
      if(!posi && localData){
        if(localData != null && localData.address && localData.lng && localData.lat){
          var last = localData.time;
        }else{
          var last = 0;
        }
        var time = Date.parse(new Date())/1000;
        if((local == 'manual' || (time - last < 60*10))&&localData.site_map==site_map){ //地图类型要保持一致
          tt.islocal = true;
          // $('.posiChose span').html(localData.address);
          tt.lat = localData.lat;
          tt.lng = localData.lng;
          tt.address = localData.address;
          utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': tt.lng, 'lat': tt.lat, 'address': localData.address,site_map:site_map}));
          HN_Location.lnglatGetTown({lat:localData.lat,lng:localData.lng,name:localData.address},function(data){
            tt.getPosiCity(data)
          })
          if(site_map == 'baidu'){
            tt.getLocation(tt.lng, tt.lat)
          }else{
            tt.getLocationAmap(tt.lng, tt.lat)
          }
        }else{
          tt.getLnglat(1)
        }
      }
      if(localData == null || posi){

        var time = Date.parse(new Date())/1000;
        HN_Location.init(function(data){
          tt.posiEnd = true;
          if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
            tt.address = langData['siteConfig'][27][136];
            // $('.posiChose span').html(langData['siteConfig'][27][136]);    /* 定位失败 */
            $('.loading').html(langData['siteConfig'][27][137]).show();    /* 定位失败，请重新刷新页面！ */
          }else{

            if(!tt.islocal || posi){

              tt.lng = data.lng;
              tt.lat = data.lat;
              tt.address = data.name;
              // utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': tt.lng, 'lat': tt.lat, 'address':data.name}));
              tt.getPosiCity(data);
              if(site_map == 'baidu'){
                tt.getLocation(tt.lng, tt.lat)
              }else{
                tt.getLocationAmap(tt.lng, tt.lat)
              }
            }
          }

          if(posi&&localData.site_map==site_map){ //地图类型不一致，只执行定位操作，不执行跳转操作
            $(".currPosi dd").click()
          }
        }, device.indexOf('huoniao') > -1 ? false : true);
      }

    },

    // 选择地址
    choseAddr(item){
      var tt = this;
      // 此处需要更新siteCityInfo
      var nowCityInfo = tt.currCityInfo;
      if(device.toLowerCase().indexOf('huoniao') > -1 &&  device.toLowerCase().indexOf('android') > -1){
          setupWebViewJavascriptBridge(function(bridge) {
              bridge.callHandler('changeCity', JSON.stringify(nowCityInfo), function(){
              // location.href = nowCityInfo.url + '?currentPageOpen=1' + (device.indexOf('huoniao') > -1 ? '&appIndex=1&appFullScreen' : '');
            });
          });
        }else{

          var channelDomainClean = typeof masterDomain != 'undefined' ? masterDomain.replace("http://", "").replace("https://", "") : window.location.host;
          var channelDomain_1 = channelDomainClean.split('.');
          var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

          channelDomain_ = channelDomainClean.split("/")[0];
          channelDomain_1_ = channelDomain_1_.split("/")[0];

          $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomainClean, path: '/'});
          $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomain_1_, path: '/'});

       }
       tt.goLink(item,1);


    },

    // 获取我的地址
    getMyAddrList(cityid){
      var tt = this;
      cityid = cityid ?　cityid　: tt.cityid
      $.ajax({
        url: '/include/ajax.php?service=waimai&action=getMemberAddress&cityid='+cityid,
        type: "POST",
        dataType: "json",
        success: function (data) {
          if(data.state == 100 ){
            tt.myAddrList = data.info;
            setTimeout(function(){
                $(".nearbyList").removeClass('opacityDiv');
            },500)
          }
        },
        error: function(){}
      });
    },

    // 展开/收起我的地址
    openAddrList(){
      var el = event.currentTarget;
      var len = $('.allDD').attr('data-len');
      var dh = $('.allDD').attr('data-dh');
      if($(el).hasClass('noMore')){
        $(el).text('展开更多地址');
        $(el).removeClass('noMore');
        $('.allDD').attr('style','');
        $(window).scrollTop();
      }else{
        $(el).text('收起');
        $(el).addClass('noMore');
        $('.allDD').css({
          height:dh * len,
          'max-height':'none'
        })
      }

    },

    // 百度获取周边
    async getLocation(lng,lat){
      let data = {
        service: 'siteConfig',
        action: 'getLocationByGeocoding',
        location: `${lat},${lng}`,
        module: 'waimai',
        coordtype: 'wgs84',
        pois: 1, //是否需要周边位置信息
      }
      let result = await ajax(data,{dataType:'json'});
      if (result.state == 100) {
          localStorage.setItem('infoData', JSON.stringify(this.infoData));
          this.surroundingPois = result.info.pois;
          if(this.surroundingPois.length > 0){
            $(".nearbyList").removeClass('opacityDiv');
          }else{
            $(".nearbyList").addClass('opacityDiv');
          }
      }
      return false
      var point = new BMap.Point(lng, lat);
      var tt = this;
      if(site_map == 'baidu'){
        var myGeo = new BMap.Geocoder();
        myGeo.getLocation(point, function mCallback(rs){
          var allPois = rs.surroundingPois;
          localStorage.setItem('infoData', JSON.stringify(tt.infoData));
          tt.surroundingPois = rs.surroundingPois;

          if(tt.surroundingPois.length > 0){
            $(".nearbyList").removeClass('opacityDiv');
          }else{
            $(".nearbyList").addClass('opacityDiv');
          }
        }, {
          poiRadius: 5000,  //半径一公里
          numPois: 50
        });

      }//百度地图


    },

    // 高德获取周边
    getLocationAmap(lng,lat){
      this.getLocation(lng,lat);
      return false
      var tt = this;
      AMap.service('AMap.PlaceSearch',function(){//回调函数
        var placeSearch= new AMap.PlaceSearch();
        var s = function(){
          if(lng != '' && lat != ''){
            placeSearch.searchNearBy("", [lng, lat], 500, function(status, result) {
              tt.ampCallback(result, status);
            });
          }else{
            setTimeout(s,1000)
          }
        }
        setTimeout(s,1000);
        AMap.event.addListener(map ,"complete", function(status, result){
          lnglat = map.getCenter();
          if(lng=='' && lat==''){
            map.setZoomAndCenter(18, [lnglat['lng'], lnglat['lat']]);
          }
          lng = tt.lng = lnglat['lng'];
          lat = tt.lat = lnglat['lat'];

          s();
        });
        AMap.event.addListener(map ,"dragend", function(status, result){
          lnglat = map.getCenter();
          lng = lnglat['lng'];
          lat = lnglat['lat'];
          s();
        });

      })
    },
    ampCallback(results, status) {
      var tt = this;
			if (status === 'complete' && results.info === 'OK') {
				var list = [];
				var allPois = results.poiList.pois;
        tt.surroundingPois = allPois.map(function(val){
            return {
                address:val.address, //详细地址
                title:val.name, //标题
                point:{
                  lng:val.location.lng,
                  lat:val.location.lat
                }
            }
        });
        tt.loadEnd = true; //加载结束

			}
		},

    // 获取url参数
    getParam(paramName){
		paramValue = "", isFound = !1;
		if (window.location.search.indexOf("?") == 0 && window.location.search.indexOf("=") > 1) {
			arrSource = unescape(window.location.search).substring(1, window.location.search.length).split("&"), i = 0;
			while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
		}
		return paramValue == "" && (paramValue = null), paramValue
	},

   // 显示城市选择
    showCity(){
      $('.cityMask').show();
      $('.siteCityListBox').css('transform','translateY(0)')
    },
    // 隐藏城市选择
    hideCity(){
      $('.cityMask').hide();
      $('.siteCityListBox').css('transform','translateY(100%)')
    },

     // 点击左侧字母
    go_szm(ind){
      var el = event.currentTarget
      var sct = $('.cityList dl').eq(ind).position().top;
      var wh = $('.cityList').height();
      var wt = $('.cityList').scrollTop();
      var bh = $('.cityUl').height();
      $('.cityList').scrollTop(sct + wt);
      $('.jump_szm').html($(el).html()).show();
      var tot = null;
      if(tot){
        clearTimeout(tot)
      }
      tot = setTimeout(function(){
        $('.jump_szm').hide()
      },3000)
    },

    // 城市选择
    chose_city(city){  //不需要修改siteCityInfo
      var tt = this;
      var el = event.currentTarget;
      tt.city = city.name;
      tt.cityid = city.cityid;
      tt.currCityid = tt.cityid;
      tt.currCityLat = city.lat;
      tt.currCityLng = city.lng;
      tt.currCityInfo = city;
      tt.hideCity();
      tt.getMyAddrList(tt.cityid);
      if(site_map == 'baidu'){
        tt.getLocation(city.lng,city.lat)
      }else{
        tt.getLocationAmap(city.lng,city.lat)
      }


    },
    // 获取城市列表
   getCityList(){
     var tt = this;
     $.ajax({
       url: '/include/ajax.php?service=siteConfig&action=siteCity',
       type: "POST",
       dataType: "json",
       success: function (data) {
         if(data.state == 100){
           tt.cityList = data.info;
         }
       },
       error: function(){}
     });
   },

   // 获取当前定位地址的城市信息
   getPosiCity(data){
      var tt = this;
      var province = data.province, city = data.city, district = data.district, town = data.town;
  		$.ajax({
  		    url: "/include/ajax.php?service=siteConfig&action=verifyCity&region="+province+"&city="+city+"&district="+district+"&module=waimai"+"&town="+town,
  		    type: "POST",
  		    dataType: "json",
  		    success: function(data){
  		      if(data && data.state == 100){
              tt.currPosiCity = data.info;
              // 需要重新获取一下我的地址
              if(data.info.cityid != tt.cityid){
                tt.getMyAddrList(data.info.cityid)
              }
            }
          },
          error:function(){},
        });
   },

   // 根据经纬度坐标 获取城市信息


  },

  watch:{
    myAddrList:function(val){
      if(val){
        setTimeout(function(){
            var dh = $(".allDD dd").height();
            // $('.allDD').css({
            //   'height': '4.88rem'
            // })
            $('.allDD').attr('data-dh',dh)
                       .attr('data-len',val.length);

        },500);
      }
    },
    // 搜索列表
    searchList(val){
      var tt = this;
      var wh = $(window).height(); //视窗高度
      var offTop = 0;
      setTimeout(function(){
        offTop = $(".searchDlList .toDefine").offset().top;
        h = $(".searchDlList .toDefine").height();
        if(tt.searchPage <= 2){
          if(wh - h < offTop ){
            $(".searchDlList .toDefine").addClass('fixedBottom')
          }else{
            $(".searchDlList .toDefine").removeClass('fixedBottom')
          }
        }
      },500)
    },

    // 城市列表
    cityList(){
     var  tt = this;
     var szmArr = []; //首字母
     var hotArr = []; //热门城市
     var cityArr = [];


     if(tt.cityList.length > 0){
       tt.cityList.forEach(function(city){
         if(szmArr.indexOf(city.pinyin.substr(0,1).toUpperCase()) <= -1){
           szmArr.push(city.pinyin.substr(0,1).toUpperCase());
           cityArr.push({
             key:city.pinyin.substr(0,1).toUpperCase(),
             arr:[city]
           })
         }else{
             cityArr[szmArr.indexOf(city.pinyin.substr(0,1).toUpperCase())]['arr'].push(city);
         }

         if(city.hot == '1'){
           hotArr.push(city)
         }


       });


       tt.cityArr = cityArr;
       tt.hotCity = hotArr;
       tt.szmArr = szmArr.sort();

     }
   },
  }
})
