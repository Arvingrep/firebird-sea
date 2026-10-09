toggleDragRefresh('off');
var totalPage, totalCount, page, isload = false, pagetoken = '';
var ajaxIng = false;
var map;
var lng = lat = '';
var tt;
var pagePosi = new Vue({
  el: '#pageMap',
  data: {
    lng: '0',
    lat: '0',
    city: city,
    cityid: 0,
    currCityInfo: JSON.parse(currCityInfo), //当前城市信息
    surroundingPois: [], //地图定位
    searchList: [], //搜索
    loadEnd: false,  //是否加载结束
    search_key: '',
    typing: false, //是否正在输入
    loading: false,  //loading图标
    waimaiData: [],
    cityList: [], //城市列表
    szmArr: [],
    hotCity: [],  //热门城市
    cityArr: [],
    areaInfo: [],//默认选择的城市
    // districtDetail:'', //乡镇，不显示定位时选择
    // district:'', //乡镇，不显示定位时选择
    returnUrl: 'javascript:;',  //返回路径
    ofTop: 0,
    addrArr: '',

    // 20220302修改
    cancelBtn: false, // 取消按钮是否显示

  },
  mounted() {
    tt = this;
    var posiCity = '';
    var wmData = localStorage.getItem('waimaiData');

    if (wmData) {
      tt.waimaiData = JSON.parse(localStorage.getItem('waimaiData'));
    } else {
      tt.waimaiData = [];
    }
    // 定位
    tt.loading = true;
    if (tt.city && tt.lnglat && tt.lnglat != ',') {
      var data = {
        'lng': tt.lnglat.split(',')[0],
        'lat': tt.lnglat.split(',')[1],
      }
      tt.lng = tt.lnglat.split(',')[0];
      tt.lat = tt.lnglat.split(',')[1];
      // HN_Location.lnglatGetTown(data,function(res){
      //   console.log(res)
      // })

      tt.drawMap(data)
    } else {
      HN_Location.init(function (data) {
        if (data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
          console.log('定位失败，请刷新页面');
          tt.drawMap()
        } else {
          var name = data.name == '' ? data.address : data.name;
          tt.lng = data.lng;
          tt.lat = data.lat;
          // tt.city = data.city;
          posiCity = data.city;
          if (tt.city == '') {
            tt.city = posiCity;
            tt.currCityInfo = data;
            tt.checkCityInfo(data)
          }
          tt.addrArr = data.city + ' ' + data.district
          // 生成地图
          tt.drawMap(data)
        }
      });
    }






    // 滚动加载更多
    $('.searchList').scroll(function () {
      var wh = $(this).height();
      var ws = $(this).scrollTop();
      var bh = $('.searchList ul').height() - 50;

      if ((ws + wh) >= bh && !isload) {
        tt.getList(tt.search_key)
      }
    })


    tt.getCityList();




  },
  computed: {
    // 计算距离
    mapDistance() {
      return function (lat_a, lng_a, lat_b, lng_b) {
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
        if (km < 1) {
          km = (km * 1000).toFixed(0) + 'm'
        } else {
          km = km.toFixed(1) + 'km';
        }
        return km;
      }
    },

    // 字母排序
    orderBy() {
      return function (szm) {
        var tt = this;
        var citys;
        tt.cityArr.forEach(function (city) {
          if (city.key == szm) {
            citys = city.arr
          }
        })

        return citys;
      }
    },
  },
  methods: {
    showList() {
      var tt = this;
      tt.cancelBtn = true; // 显示取消按钮
      $(".addrListBox ").addClass('moreHeight');
    },
    hideList() {
      var tt = this;
      tt.cancelBtn = false; // 显示取消按钮
      tt.search_key = '';
      tt.searchList = [];

    },
    // 地图汇总
    drawMap(data) {
      var tt = this;
      var lnglat = '';
      if (data) {
        lnglat = [data.lng, data.lat]
      }
      console.log(lnglat)
      if (site_map == 'baidu') {
        tt.draw_baidu(lnglat)
      } else if (site_map == 'google') {
        tt.draw_google(lnglat)
      } else if (site_map == 'amap') {
        tt.draw_Amap(lnglat)
      }
     
    },

    // 百度地图
    draw_baidu(lnglat) {
      var tt = this;
      map = new BMap.Map("mapdiv");
      tt.loading = false;
      if (tt.city != city && !lnglat) {
        map.centerAndZoom(tt.city, 18);
        setTimeout(function () {
          lnglat = map.getCenter();
          tt.lng = lnglat.lng;
          tt.lat = lnglat.lat;
          var mPoint = new BMap.Point(lnglat.lng, lnglat.lat);

          console.log(mPoint)
          tt.getLocation(mPoint);
        }, 500)
      } else {
        var mPoint = new BMap.Point(lnglat[0], lnglat[1]);
        map.centerAndZoom(mPoint, 18);
        tt.getLocation(mPoint);
      }
      $('.mapcenter').addClass('animateOn');
      setTimeout(function () {
        $('.mapcenter').removeClass('animateOn');
      }, 600)
      map.addEventListener("dragend", function (e) {
        $('.mapcenter').addClass('animateOn');
        setTimeout(function () {
          $('.mapcenter').removeClass('animateOn');
        }, 600)
        tt.lng = e.point.lng
        tt.lat = e.point.lat
        tt.getLocation(e.point);
      });
      
    },
    // 高德地图
    draw_Amap(lnglat) {
      var tt = this;
      tt.loading = false;
      map = new AMap.Map('mapdiv');
      if (lnglat) {
        lng = lnglat[0], lat = lnglat[1];
        map.setZoomAndCenter(18, lnglat);
      }else if (tt.city) {
        map.setCity(tt.city);

      }  

      setTimeout(function () {
        var point = map.getCenter();
        tt.lng = point.lng
        tt.lat = point.lat
        map.setZoomAndCenter(18, point);
        tt.getLocationAmap(point);
      }, 200)

    },

    // 谷歌地图
    draw_google(lnglat) {
      $(".loadImg").hide();
      $('.mapcenter').hide();
      var gLat = lnglat[0], gLng = lnglat[1],
        mapOptions = {
          zoom: 18,
          center: new google.maps.LatLng(gLng, gLat),
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
          }
        }
      map = new google.maps.Map(document.getElementById('mapdiv'), mapOptions);
      marker = new google.maps.Marker({
        position: mapOptions.center,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP
      });

      getLocation(mapOptions.center);

      google.maps.event.addListener(marker, 'dragend', function (event) {
        var location = event.latLng;
        var pos = {
          lat: location.lat(),
          lng: location.lng()
        };
        getLocation(pos);
      })
      function getLocation(pos) {

        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: pos,
          radius: 500
        }, callback);

        var list = [];
        function callback(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            tt.surroundingPois.map(function (val) {
              return {
                address: val.vicinity, //详细地址
                title: val.name, //标题
                point: {
                  lng: val.geometry.location.lng(),
                  lat: val.geometry.location.lat()
                }
              }
            })
          }
        }
      }
    },

    // 百度获取周边
    getLocation(point) {
      var tt = this;
      if (site_map == 'baidu') {
        var myGeo = new BMap.Geocoder();
        myGeo.getLocation(point, function mCallback(rs) {
          var allPois = rs.surroundingPois;
          // var district = {
          //   point:rs.point,
          //   title: rs.addressComponents.district,
          //   address:rs.addressComponents.city +' '+ rs.addressComponents.district,
          //   noDistance:true,
          // }
          // tt.district = district;
          // tt.addrArr = tt.district.title
          // for(var i = 0; i<tt.waimaiData.length; i++){
          //   if(tt.waimaiData[i]['name'] == 'district'){
          //     tt.waimaiData.splice(i,1)
          //     break;
          //   }
          // }
          // tt.waimaiData.push({name:'district','value':JSON.stringify(tt.district)})
          localStorage.setItem('waimaiData', JSON.stringify(tt.waimaiData));
          // tt.surroundingPois = [district,...rs.surroundingPois];
          tt.surroundingPois = rs.surroundingPois;
          tt.areaInfo = rs.surroundingPois[0];
          tt.loadEnd = true;
          var reg1 = rs.addressComponents.city;
          var reg2 = rs.addressComponents.district;
          var reg3 = rs.addressComponents.province;
        }, {
          poiRadius: 5000,  //半径一公里
          numPois: 100
        });

      }//百度地图


    },

    // 高德获取周边
    getLocationAmap(point) {
      var tt = this;
      lng = point.lng;
      lat = point.lat;
      AMap.service('AMap.PlaceSearch', function () {//回调函数
        var placeSearch = new AMap.PlaceSearch({
          pageSize:20
        });
        var s = function () {
          if (lng != '' && lat != '') {
            placeSearch.searchNearBy("", [lng, lat], 500, function (status, result) {
              tt.ampCallback(result, status);
            });
          } else {
            setTimeout(s, 1000)
          }
        }
        AMap.event.addListener(map, "complete", function (status, result) {
          lnglat = map.getCenter();
          if (lng == '' && lat == '') {
            map.setZoomAndCenter(18, [lnglat['lng'], lnglat['lat']]);
          }
          lng = tt.lng = lnglat['lng'];
          lat = tt.lat = lnglat['lat'];

          s();
        });
        AMap.event.addListener(map, "dragend", function (status, result) {
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
        tt.surroundingPois = allPois.map(function (val) {
          return {
            address: val.address, //详细地址
            title: val.name, //标题
            point: {
              lng: val.location.lng,
              lat: val.location.lat
            }
          }
        });
        tt.areaInfo = tt.surroundingPois[0];
        tt.loadEnd = true; //加载结束
        // console.log(results)
        // var district = {
        //   point:rs.point,
        //   title:rs.addressComponents.district,
        //   address:rs.addressComponents.city + rs.addressComponents.district
        // }
        // tt.surroundingPois = [district,...rs.surroundingPois]

      }
    },

    // 搜索列表
    getList(directory) {
      var tt = this;
      if (ajaxIng) {
        ajaxIng.abort();
      }
      directory = directory.replace(/\s*/g, "");
      if (isload) return false;
      isload = true;
      tt.loading = true;
      ajaxIng = $.ajax({
        // url: '/include/ajax.php?service=siteConfig&action=get114ConveniencePoiList&pageSize=20&page='+page+'&lng='+tt.lng+'&lat='+tt.lat+'&directory='+directory+'&radius='+radius+"&pagetoken="+pagetoken,
        url: '/include/ajax.php?action=getMapSuggestion&cityid=' + tt.currCityInfo.cityid + '&lat=' + tt.currCityInfo.lat + '&lng=' + tt.currCityInfo.lng + '&query=' + directory + '&region=' + tt.currCityInfo.name + '&service=siteConfig',
        dataType: 'json',
        success: function (data) {
          isload = false;
          tt.loading = false;
          if (data.state == 100) {

            tt.loadEnd = true;
            totalPage = 1;
            // totalCount = data.info.totalCount;
            // pagetoken = data.info.pagetoken == '' || data.info.pagetoken == null ? '' : data.info.pagetoken;
            var list = data.info;

            if (list.length > 0) {
              if (page == 1) {
                tt.searchList = list;
              } else {
                tt.searchList = [...tt.searchList, ...list];
              }
              page++;
              if (page > totalPage) {
                isload = true;
              }
            } else if (page == 1) {
              tt.searchList = [];
            } else {
              page++;
              tt.loading = false;
              tt.loadEnd = true;
            }

          } else {
            tt.loading = false;
            tt.loadEnd = true;
            isload = true;
            tt.searchList = [];
          }
        },
        error: function () {
          isload = false;
          tt.loading = false;
          //showErr(langData['circle'][2][32]);  /* 网络错误，加载失败！*/
        }
      });
    },


    // 选择地址
    choseAddr(item) {
      var tt = this;
      var el = event.currentTarget;

      $(".addrList li").removeClass('chosed');
      $(el).addClass('chosed').siblings('li').removeClass('chosed');

      if ($(el).closest('.searchList').length > 0) {  //直接跳转
        tt.waimaiData.forEach(function (val) {
          if (val.name == 'lnglat') {
            val.value = item.lng + ',' + item.lat
          }
          if (val.name == 'addr') {
            val.value = item.name ? item.name : item.title;
          }

          if (val.name == 'detailAddr') {
            val.value = item.address;
          }
          if (val.name == 'lnglat') {
            val.value = item['lng'] + ',' + item['lat'];
          }
          // if(val.name == 'cityid'){
          //   val.value = tt['cityid'];
          // }
          if (val.name == 'returnUrl') {
            $(el).find('a').attr('data-href', val.value);
            console.log(val.value)
          }
        })
        localStorage.setItem('waimaiData', JSON.stringify(tt.waimaiData));
        $(el).find('a').attr('href', $(el).find('a').attr('data-href'))
      } else {
        tt.areaInfo = item;
        $('.addrTit .sure').click();
      }
    },



    // 获取城市列表
    getCityList() {
      var tt = this;
      $.ajax({
        url: '/include/ajax.php?service=siteConfig&action=siteCity',
        type: "POST",
        dataType: "json",
        success: function (data) {
          if (data.state == 100) {
            tt.cityList = data.info;
          }
        },
        error: function () { }
      });
    },// 点击左侧字母
    go_szm(ind) {
      var el = event.currentTarget
      var sct = $('.cityList dl').eq(ind).position().top;
      var wh = $('.cityList').height();
      var wt = $('.cityList').scrollTop();
      var bh = $('.cityUl').height();
      $('.cityList').scrollTop(sct + wt);
      $('.jump_szm').html($(el).html()).show();
      var tot = null;
      if (tot) {
        clearTimeout(tot)
      }
      tot = setTimeout(function () {
        $('.jump_szm').hide()
      }, 3000)
    },

    // 城市选择
    chose_city(city) {
      var tt = this;
      var el = event.currentTarget;
      tt.city = city.name;
      tt.cityid = city.cityid;
      tt.currCityid = tt.cityid
      tt.currCityInfo = city;
      tt.hideCity();

      if (site_map == 'baidu') {
        map.centerAndZoom(tt.city, 18);
        setTimeout(function () {
          lnglat = map.getCenter();
          tt.lng = lnglat.lng;
          tt.lat = lnglat.lat;
          var mPoint = new BMap.Point(lnglat.lng, lnglat.lat);
          tt.getLocation(mPoint);
        }, 1500)

      } else if (site_map == 'amap') {
        map.setCity(tt.city);
        setTimeout(function () {
          var point = map.getCenter();
          tt.lng = point.lng;
          tt.lat = point.lat;
          map.setZoomAndCenter(18, point);
          tt.getLocationAmap(point)
        }, 200)
      }

    },

    // 显示城市选择
    showCity() {
      $('.cityMask').show();
      $('.siteCityListBox').css('transform', 'translateY(0)')
    },
    // 隐藏城市选择
    hideCity() {
      $('.cityMask').hide();
      $('.siteCityListBox').css('transform', 'translateY(100%)')
    },

    // 选择定位
    choseArea() {
      var tt = this;
      var el = event.currentTarget;
      if ($(el).hasClass('sure') && $(".addrList li.chosed").length > 0) {
        var urlTo = '';
        tt.waimaiData.forEach(function (val) {
          switch (val.name) {
            case 'lnglat':
              val.value = tt.areaInfo['point']['lng'] + ',' + tt.areaInfo['point']['lat']; break;
            case 'addr':
              val.value = tt.areaInfo['title']; break;
            case 'detailAddr':
              val.value = tt.areaInfo['address']; break;
            case 'address':
              val.value = tt.areaInfo['address']; break;
            case 'returnUrl':
              urlTo = val.value; break;
          }
        })

        window.location.href = urlTo;
        localStorage.setItem('waimaiData', JSON.stringify(tt.waimaiData));
      } else {
        showErrAlert(langData['info'][4][26]);  //'请选择地址'
      }
    },

    // 重新定位
    rePosi() {
      var tt = this;
      tt.loading = true;
      HN_Location.init(function (data) {
        if (data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
          console.log('定位失败，请刷新页面');
          tt.drawMap()
        } else {
          var name = data.name == '' ? data.address : data.name;
          tt.lng = data.lng;
          tt.lat = data.lat;
          // tt.city = data.city;
          posiCity = data.city;
          if (tt.city == '') {
            tt.city = posiCity;
          }
          tt.addrArr = data.city + ' ' + data.district
          // 生成地图
          tt.drawMap(data)
        }
        tt.loading = false;
        $('.addrList').scrollTop(0)
      });
    },

    // 设置siteCIty
    setCity() {
      var tt = this;
      var nowCityInfo = tt.currCityInfo;
      if (device.toLowerCase().indexOf('huoniao') > -1 && device.toLowerCase().indexOf('android') > -1) {
        setupWebViewJavascriptBridge(function (bridge) {
          bridge.callHandler('changeCity', JSON.stringify(nowCityInfo), function () {
            // location.href = nowCityInfo.url + '?currentPageOpen=1' + (device.indexOf('huoniao') > -1 ? '&appIndex=1&appFullScreen' : '');
          });
        });
      } else {
        var channelDomainClean = typeof masterDomain != 'undefined' ? masterDomain.replace("http://", "").replace("https://", "") : window.location.host;
        var channelDomain_1 = channelDomainClean.split('.');
        var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0] + ".", "");

        channelDomain_ = channelDomainClean.split("/")[0];
        channelDomain_1_ = channelDomain_1_.split("/")[0];

        $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), { expires: 7, domain: channelDomainClean, path: '/' });
        $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), { expires: 7, domain: channelDomain_1_, path: '/' });
      }
    },

    // 清空
    clearInp() {
      var tt = this;
      tt.search_key = '';
      tt.searchList = [];
      $('#searchInp').focus()
    },


    // 验证城市分站
    checkCityInfo(data){
      var tt = this;
       var province = data.province, city = data.city, district = data.district;
          $.ajax({
              url: "/include/ajax.php?service=siteConfig&action=verifyCityInfo&region="+province+"&city="+city+"&district="+district,
              type: "POST",
              dataType: "jsonp",
              success: function(data){
                  if(data && data.state == 100){
                    tt.currCityInfo.cityid = data.info.ids[0]
                  }
              }
          })
    }
  },

  watch: {
    // 关键字
    search_key() {
      var tt = this;
      if (tt.search_key) {
        tt.loadEnd = false;
        isload = false;
        page = 1;
        tt.getList(tt.search_key)
      } else {

        if (document.activeElement.id == 'searchInp') {
          tt.typing = true;
        } else {
          tt.typing = false;
        }
        tt.searchList = [];
      }
    },

    // 城市列表
    cityList() {
      var tt = this;
      var szmArr = []; //首字母
      var hotArr = []; //热门城市
      var cityArr = [];


      if (tt.cityList.length > 0) {
        tt.cityList.forEach(function (city) {
          if (szmArr.indexOf(city.pinyin.substr(0, 1).toUpperCase()) <= -1) {
            szmArr.push(city.pinyin.substr(0, 1).toUpperCase());
            cityArr.push({
              key: city.pinyin.substr(0, 1).toUpperCase(),
              arr: [city]
            })
          } else {

            cityArr[szmArr.indexOf(city.pinyin.substr(0, 1).toUpperCase())]['arr'].push(city)

          }

          if (city.hot == '1') {
            hotArr.push(city)
          }


        });


        tt.cityArr = cityArr;
        tt.hotCity = hotArr;
        tt.szmArr = szmArr.sort();

      }
    },

    // 搜索列表
    searchList(val) {
      var wh = $(window).height(); //视窗高度
      var offTop = 0;
      setTimeout(function () {
        offTop = $(".searchList .toDefine").offset().top;
        h = $(".searchList .toDefine").height();
        if (page <= 2) {
          if (wh - h < offTop) {
            $(".searchList .toDefine").addClass('fixedBottom')
          } else {
            $(".searchList .toDefine").removeClass('fixedBottom')
          }
        }
      }, 500)
    },


  }
})
