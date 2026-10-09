var totalPage,totalCount,page,isload = false, pagetoken = '';
var ajaxIng = false;
var map,circle;
var lng = lat = '';
var tt;
var tmap_search = null
toggleDragRefresh('off');
var pagePosi = new Vue({
  el:'#pageMap',
  data:{
    lng:'0',
    lat:'0',
    city:city,
    cityid:0,
    surroundingPois:[], //地图定位
    searchList:[], //搜索
    loadEnd:false,  //是否加载结束
    search_key:'',
    typing:false, //是否正在输入
    loading:false,  //loading图标
    loadingb:true, //地址列表加载文本显隐
    infoData:[],
    cityList:[], //城市列表
    szmArr:[],
    hotCity:[],  //热门城市
    cityArr:[],
    areaInfo:'',
    districtDetail:'', //乡镇，不显示定位时选择
    district:'', //乡镇，不显示定位时选择
    returnUrl:'javascript:;',  //返回路径
    ofTop:0,
    addrArr:'',
    noPosi_val:0,
    modelType:'', //当前模块 模块是分类信息时 会限制坐标
	  fabuMapDisplayLocation:fabuMapDisplayLocation, //发布信息时不显示位置选项  0显示  1隐藏
    posi_center:{lat:0,lng:0}, //地图中心点 当前地图定位  实际应该是定位点 当定位不成功或者切换城市时使用
    cityInfo:{}, //当前用户定位坐标城市信息
    myPosi:{lng:0,lat:0},
    posiFinish:false, //手动定位是否成功
  },
  mounted(){
    tt = this;
    var posiCity = '';
    /******此处20220316新增 s******/
    // 获取Url 判断是否需要 不显示位置的按钮
    if(window.location.href.indexOf('noPosi=1') > -1){
      tt.noPosi_val = 1;
    }

    /******此处20220316新增 e******/

    tt.infoData = localStorage.getItem('infoData') && localStorage.getItem('infoData') !=  'undefined'? JSON.parse(localStorage.getItem('infoData')) : [];

    if(tt.infoData){
      let currentData={ //上个页面选中的地址信息
        address: '',
        location: {
          lat: '',
          lng: ''
        },
        point: {
          lat: '',
          lng: ''
        },
        name: '',
        title:'',
        vicinity:'',
        bool:false, //是否执行后面的push操作
      };
      tt.infoData.forEach(function(info){
        if(info.name == 'cityid' || info.name == 'city' || info.name=='lnglat' || info.name=='returnUrl' || info.name == 'districtDetail'){
          // if(info.name == 'cityid' ){
            tt[info.name] = info.value;
          }
          if(info.name == 'cityid' || info.name == 'city'){
            tt.cityInfo = {cityid:info.value,name:info.name}
          }
          if(info.name=="address"){
            currentData.name=info.value;
            currentData.title=info.value;
            currentData.vicinity=info.value;
          }else if(info.name=='lnglat' && info.value){
            let lnglatArr = info.name=="lnglat"&&(info.value.split(','));
            currentData.location.lat = Number(lnglatArr[1]);
            currentData.location.lng = Number(lnglatArr[0]);
            currentData.point = currentData.location;
            currentData.bool = true;
          }else if(info.name=='street'){
            currentData.address=info.value;
          }else if(info.name == 'modelType'){
            tt.modelType = info.value;
          }
      });
      if(currentData.bool){
        tt.surroundingPois.push(currentData);
      }
      if(tt.districtDetail){
        while(typeof tt.districtDetail=='string' && tt.districtDetail.includes('{') && tt.districtDetail.includes(')')){
          tt.districtDetail = JSON.parse(tt.districtDetail)
        }
        if(typeof(tt.districtDetail) == 'object'){
            tt.district = {
              point:{lng:tt.districtDetail.lng,lat:tt.districtDetail.lat},
              title:tt.districtDetail.city+' '+tt.districtDetail.district,
              address:tt.districtDetail.city+' '+tt.districtDetail.district,
              noDistance:true,
            }
        }
      }


    }else{
      tt.infoData = [];
    }

    $(".loadImg").show()
    // 定位
    if(tt.city && tt.lnglat && tt.lnglat != ','){
      var data={
        'lng':tt.lnglat.split(',')[0],
        'lat':tt.lnglat.split(',')[1],
      }
      tt.lng = tt.lnglat.split(',')[0];
      tt.lat = tt.lnglat.split(',')[1];
      // tt.myPosi = data; //当前实际定位

      if(tt.modelType == 'info' && fabuMapConfig){
        // 需要重新验证
        HN_Location.init(function(cdata){
          if (!cdata || cdata == undefined || (cdata.address == "" && cdata.name == "") || cdata.lat == "" || cdata.lng == ""){
            tt.cityInfo = {}
            tt.myPosi = {}
            tt.drawMap(data)

          }else{
            tt.myPosi = {lat:cdata.lat,lng:cdata.lng}; //当前实际定位
            // let distance  = tt.mapDistance(cdata.lat,cdata.lng,data.lat,data.lng,1)
            // if(distance > 2000){
            //   tt.cityInfo = {}
            //   tt.myPosi = {}
            // }
            tt.posi_center = {"lng":cdata.lng,"lat":cdata.lat}
            tt.drawMap(data,cdata)
            tt.checkCity(cdata)
          }
        })
      }else{
        tt.drawMap(data)
      }
    }else{
      let isApp = navigator.userAgent.indexOf('huoniao') > -1 ? 1 : 0
      HN_Location.init(function(data){
        if (!data || data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
          // 定位失败
          console.log('定位失败：' + data); //没法验证分站
          tt.cityInfo = {}
          tt.drawMap()
        }else{
          // 生成地图
          if(!fabuMapConfig || tt.modelType != 'info'){
            var name = data.name ==''?data.address:data.name;
            tt.lng = data.lng;
            tt.lat = data.lat;
            posiCity = data.city;
            if(tt.city == ''){
              tt.city = posiCity;
            }
            tt.addrArr = data.city +' '+ data.district
            tt.posi_center = {"lng":data.lng,"lat":data.lat}
            tt.drawMap(data)

          }else{
            tt.myPosi = {lng:data.lng,lat:data.lat}; //当前实际定位  
            tt.checkCity(data)
          }
          
        }
      },!isApp);
    }






    // 滚动加载更多
    $('.searchList').scroll(function(){
      var wh = $(this).height();
      var ws = $(this).scrollTop();
      var bh = $('.searchList ul').height() - 50;

       if((ws + wh) >= bh && !isload){
         tt.getList(tt.search_key)
       }
    })


    tt.getCityList();




  },
  computed:{
    // 计算距离
    mapDistance(){
      return function(lat_a,lng_a,lat_b,lng_b,isNum){
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
        if(isNum){
          km = (6366000 * tt).toFixed(0)
        }else if(km<1){
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
    showList(){
      $(".addrListBox ").addClass('moreHeight');
    },
    hideList(){
      var tt = this;
      var el = event.currentTarget;
      if($(el).val() == ''){
        $(".addrListBox ").removeClass('moreHeight');
        tt.searchList = [];
      }
    },
    // 地图汇总,cdata => 当前定位中心圈
    drawMap(data,cdata){
      var tt = this;
      var lnglat = '';
      if(data){
        lnglat = [data.lng,data.lat]
      }

      if(site_map == 'baidu'){
        tt.draw_baidu(lnglat,cdata)
      }else if(site_map == 'google'){
        tt.draw_google(lnglat,cdata)
      }else if(site_map == 'amap'){
        tt.draw_Amap(lnglat,cdata)
      }else if(site_map == 'tmap'){
        tt.draw_tmap(lnglat,cdata)
      }
      setTimeout(() => {
        tt.loadingb = false
      }, 1500);

    },

    // 百度地图
    draw_baidu(lnglat,cdata){
      var tt = this;
      if(map){
        let mPoint = new BMap.Point(lnglat[0], lnglat[1]);
        map.centerAndZoom(mPoint, 14);
        return false;
      }
      map = new BMap.Map("mapdiv");
      map.clearOverlays()

      if(tt.city != city && !lnglat){
        map.centerAndZoom(tt.city,14);
        setTimeout(function(){
          lnglat = map.getCenter();
          tt.lng = lnglat.lng;
          tt.lat = lnglat.lat;
          var mPoint = new BMap.Point(lnglat.lng, lnglat.lat);
          let cPoint = new BMap.Point(lnglat.lng, lnglat.lat);
          if(cdata){
            cPoint = new BMap.Point(cdata.lng, cdata.lat);
          }
          if(tt.modelType == 'info' && fabuMapConfig > 0 && tt.cityInfo.cityid == tt.cityid){ //在定位城市时显示2km范围
            circle = new BMap.Circle(cPoint,2000,{fillColor:"blue", strokeWeight: 1 ,fillOpacity: 0.1, strokeOpacity: 0.3});
            map.addOverlay(circle);
          }
          tt.getLocation(mPoint);
        },500)
      }else{
        var mPoint = new BMap.Point(lnglat[0], lnglat[1]);
        let cPoint = new BMap.Point(lnglat[0], lnglat[1]);
        if(cdata){
          cPoint = new BMap.Point(cdata.lng, cdata.lat);
        }
        if(tt.modelType == 'info' && fabuMapConfig > 0  && tt.cityInfo.cityid == tt.cityid){
          circle = new BMap.Circle(cPoint,2000,{fillColor:"blue", strokeWeight: 1 ,fillOpacity: 0.1, strokeOpacity: 0.3});
          map.addOverlay(circle);
        }
        setTimeout(() => {
          map.centerAndZoom(mPoint, 14);
          tt.getLocation(mPoint);
        }, 300);
      }
      $('.mapcenter').addClass('animateOn');
      setTimeout(function(){
        $('.mapcenter').removeClass('animateOn');
      },600)
		  map.addEventListener("dragend", function(e){
         $('.mapcenter').addClass('animateOn');
         setTimeout(function(){
           $('.mapcenter').removeClass('animateOn');
         },600)
         let newPoint = map.getCenter()
         tt.lng = newPoint.lng
         tt.lat = newPoint.lat
			   tt.getLocation(newPoint);
         let nlnglat = map.getCenter();
        if(tt.modelType == 'info' && fabuMapConfig > 0  && tt.cityInfo.cityid == tt.cityid){
          let distance  = tt.mapDistance(nlnglat.lat,nlnglat.lng,tt.myPosi.lat,tt.myPosi.lng,1)
          if(distance > 2000){
            alert('您当前选中的位置超出2km，请重新选择')
            let myPoint = new BMap.Point(tt.myPosi.lng, tt.myPosi.lat)
            map.centerAndZoom(myPoint,14)
            tt.getLocation(myPoint);
          }
        }
         
		  });
      $(".loadImg").hide()
    },
    // 高德地图
    draw_Amap(lnglat,cdata){
      var tt = this;
      if(map){
        map.setZoomAndCenter(14, lnglat);
        return false;
      }
      map = new AMap.Map('mapdiv');
      if(lnglat){
        lng = lnglat[0],lat = lnglat[1];
  			map.setZoomAndCenter(14, lnglat);
  		}else if(tt.city){
        map.setCity(tt.city);
      }   

      setTimeout(function(){
        var point = map.getCenter();
        tt.lng = point.lng
        tt.lat = point.lat
        map.setZoomAndCenter(14, point);
        if(tt.modelType == 'info' && fabuMapConfig > 0  && tt.cityInfo.cityid == tt.cityid){
          let cPoint = cdata || point
          
          // 构造矢量圆形
          if(circle){
            map.remove(circle);
          }
          circle = new AMap.Circle({
            center: cPoint, // 圆心位置
            radius: 2000,  //半径
            strokeColor: "blue",  //线颜色
            strokeOpacity: .3,  //线透明度
            strokeWeight: 1,  //线粗细度
            fillColor: "blue",  //填充颜色
            fillOpacity: 0.1 //填充透明度
          });
          map.add(circle);
        }
        tt.getLocationAmap(point);
      },0)
      $(".loadImg").hide()

    },

    draw_tmap(lnglat,cdata) {
      var that = this;
      if(map){
        map.centerAndZoom(new T.LngLat(lnglat[0], lnglat[1]), 13);
        return false;
      }
      //初始化地图对象
      map = new T.Map("mapdiv");
      if(lnglat){
        //设置显示地图的中心点和级别
      }else{
        lnglat = [siteCityInfo_lng, siteCityInfo_lat]
      }
      map.centerAndZoom(new T.LngLat(lnglat[0], lnglat[1]), 13);
      tt.posi_center = {lng:lnglat[0],lat:lnglat[1]}
      $(".loadImg").hide()
      var point = map.getCenter();
      that.getLocationTmap(point);
      var config = {
        color: "blue", //折线颜色
        fillColor: "blue",    //填充颜色。当参数为空时，折线覆盖物将没有填充效果
        weight: "1", //折线的宽度，以像素为单位
        opacity: 0.3,    //折线的透明度，取值范围0 - 1
        fillOpacity: 0.1,
        lineStyle: "solid" //折线的样式，solid或dashed
    };
      //定义该矩形的显示区域
      let cPoint = new T.LngLat(lnglat[0], lnglat[1]) ;
      if(cdata && cdata.lng && cdata.lat){
        cPoint = new T.LngLat(cdata.lng, cdata.lat)
      }
      if(tt.modelType == 'info' && fabuMapConfig > 0  && tt.cityInfo.cityid == tt.cityid){
        var circle = new T.Circle(cPoint, 2000, config);
        map.addOverLay(circle);
      }

      map.addEventListener("moveend", function(e){
        var point = {lng:e.target.getCenter().getLng(),lat: e.target.getCenter().getLat()};
        that.getLocationTmap(point); //获取当前位置
        if(tt.modelType == 'info' && fabuMapConfig > 0  && tt.cityInfo.cityid == tt.cityid){
          let distance  = tt.mapDistance(point.lat,point.lng,tt.myPosi.lat,tt.myPosi.lng,1)
          if(distance > 2000){
            alert('您当前选中的位置超出2km，请重新选择')
            map.centerAndZoom(new T.LngLat(tt.myPosi.lng,tt.myPosi.lat), 13);
          }
        }

      });
    },

    getLocationTmap(point) { 
      const tt = this;
      tt.lng = point.lng;
      tt.lat = point.lat;
      // let lnglat = point.lng + ',' + point.lat;
      if(tmap_search){
        tmap_search.abort();
      }

      tmap_search = $.ajax({
          url: "/include/ajax.php?service=siteConfig&action=getLocationByGeocoding&module=info&location=" + point.lat + "," + point.lng,
          dataType: 'json',
          success: function(data){
              if(data.state == 100){
                tt.surroundingPois = [{
                  ...data.info,
                  title: data.info.name,
                }]
                tt.areaInfo = tt.surroundingPois[0];
              }
          }
        })
    },

    // 谷歌地图
    draw_google(lnglat){
      var gLat = lnglat[0],gLng = lnglat[1],
      mapOptions = {
        zoom: 18,
        center: new google.maps.LatLng(gLng, gLat),
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL,
          position: google.maps.ControlPosition.RIGHT_CENTER,
        }
      }
      $(".loadImg").hide();
      $('.mapcenter').hide();
       map = new google.maps.Map(document.getElementById('mapdiv'), mapOptions);
       marker = new google.maps.Marker({
            position: mapOptions.center,
            map: map,
            draggable:true,
            animation: google.maps.Animation.DROP
          });

          getLocation(mapOptions.center);
          const cityCircle = new google.maps.Circle({
            strokeColor: "blue",
            strokeOpacity: 0.3,
            strokeWeight: 1,
            fillColor: "blue",
            fillOpacity: 0.1,
            map,
            center:  mapOptions.center,
            radius: 2000,
          });
          google.maps.event.addListener(marker, 'dragend', function(event) {
            var location = event.latLng;
            var pos = {
              lat: location.lat(),
              lng: location.lng()
            };
            
            getLocation(pos);
            if(tt.modelType == 'info' && fabuMapConfig > 0  && tt.cityInfo.cityid == tt.cityid){
              let distance  = tt.mapDistance(location.lat(),location.lng(),tt.myPosi.lat,tt.myPosi.lng,1)
              if(distance > 2000){
                alert('您当前选中的位置超出2km，请重新选择')
              }
            }
          })
        function getLocation(pos){

          var service = new google.maps.places.PlacesService(map);
          service.nearbySearch({
            location: pos,
            radius: 500
          }, callback);

          var list = [];
          function callback(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              let cacheData=tt.surroundingPois[0];
              if(cacheData&&cacheData.name){
                for(let i=0;i<results.length;i++){
                  let item=results[i];
                  if(item.name==cacheData.name){
                    results.splice(i,1);
                    break;
                  }   
                }
              }
              tt.surroundingPois = results.map(function(val){
                return {
                    address:val.vicinity, //详细地址
                    title:val.name, //标题
                    point:{
                      lng:val.location?val.location.lng:val.geometry.location.lng(),
                      lat:val.location?val.location.lat:val.geometry.location.lat()
                    }
                }
              });
            }
            tt.loadingb=false;
          }
        }
    },

    // 百度获取周边
    getLocation(point){
      var tt = this;
      if(site_map == 'baidu'){
        var myGeo = new BMap.Geocoder();
        myGeo.getLocation(point, function(rs){
          var allPois = rs.surroundingPois;
          var district = {
            point:rs.point,
            title: rs.addressComponents.district||'附近',
            address:rs.addressComponents.city +' '+ rs.addressComponents.district,
            noDistance:true,
          }
          tt.district = district;
          tt.addrArr = tt.district.title
          for(var i = 0; i<tt.infoData.length; i++){
            if(tt.infoData[i]['name'] == 'district'){
              tt.infoData.splice(i,1)
              break;
            }
          }
          tt.infoData.push({name:'district','value':JSON.stringify(tt.district)})
          localStorage.setItem('infoData', JSON.stringify(tt.infoData));
          let cacheData=tt.surroundingPois[0];
          if(cacheData&&cacheData.name){ //如果已经有选中的地址了 2024.1.11
            let length=rs.surroundingPois.length;
            for(let i=0;i<length;i++){
              let item=rs.surroundingPois[i];
              if(item.title==cacheData.title){ //如果已经有选中的直接替换，没有则不管
                rs.surroundingPois.splice(i,1);
                break;
              }
            }
          }
          tt.surroundingPois = [...rs.surroundingPois];
          // tt.surroundingPois = [...tt.surroundingPois,district,...rs.surroundingPois];
          // tt.areaInfo = tt.district;
          tt.areaInfo = tt.surroundingPois[0];
          tt.loadEnd = true;
          var reg1 =rs.addressComponents.city;
          var reg2 =rs.addressComponents.district;
          var reg3 =rs.addressComponents.province;
          tt.loadingb=false;
        }, {
          poiRadius: 5000,  //半径一公里
          numPois: 50
        });

      }//百度地图


    },

    // 高德获取周边
    getLocationAmap(point){
      var tt = this;
      lng = point.lng;
      lat = point.lat;
      tt.district = {
          point:{
            lng:lng,
            lat:lat
          }
        }
        // for(var i = 0; i<tt.infoData.length; i++){
        //   if(tt.infoData[i]['name'] == 'district'){
        //     tt.infoData.splice(i,1)
        //     break;
        //   }
        // }
      // tt.infoData.push({name:'district','value':JSON.stringify(tt.district)})
          localStorage.setItem('infoData', JSON.stringify(tt.infoData));
      AMap.service('AMap.PlaceSearch',function(){//回调函数
        var placeSearch= new AMap.PlaceSearch({
          pageSize:20
        });
        var s = function(){
          if(lng != '' && lat != ''){
            placeSearch.searchNearBy("", [lng, lat], 500, function(status, result) {
              tt.ampCallback(result, status);
            });
          }else{
            setTimeout(s,1000)
          }
        }
        AMap.event.addListener(map ,"complete", function(status, result){
          lnglat = map.getCenter();
          if(lng=='' && lat==''){
            map.setZoomAndCenter(14, [lnglat['lng'], lnglat['lat']]);
          }
          lng = tt.lng = lnglat['lng'];
          lat = tt.lat = lnglat['lat'];

          s();
        });
        AMap.event.addListener(map ,"dragend", function(status, result){
          
          lnglat = map.getCenter();
          lng = lnglat['lng'];
          lat = lnglat['lat'];
          // console.log(lnglat.lat,lnglat.lng,tt.posi_center.lat,tt.posi_center.lng)
          // console.log(distance)
          if(tt.modelType == 'info' && fabuMapConfig > 0  && tt.cityInfo.cityid == tt.cityid){
            let distance  = tt.mapDistance(lnglat.lat,lnglat.lng,tt.myPosi.lat,tt.myPosi.lng,1)
            if(distance > 2000){
              alert('您当前选中的位置超出2km，请重新选择')
              map.setZoomAndCenter(14, [tt.posi_center.lng,tt.posi_center.lat]);
            }else{
              s();
            }
          }else{
            s();
          }
        });
      })
    },
    ampCallback(results, status) {
      var tt = this;
      // alert(JSON.stringify(results))
      tt.loadingb=false;
			if (status === 'complete' && results.info === 'OK') {
        let cacheData=tt.surroundingPois[0];
        let topData=results.poiList.pois[0]; //已经被选中的会被提上来
        if(cacheData&& topData.address == cacheData.address && topData.name == cacheData.name){ //如果没有被选中的就合并
          var allPois = results.poiList.pois;
        }else{ //否则直接赋值
          var allPois = results.poiList.pois;
          // var allPois = [...tt.surroundingPois,...results.poiList.pois];
        }
        tt.surroundingPois = allPois.map(function(val){
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
    getList(directory){
      var tt = this;
      if(ajaxIng){
        ajaxIng.abort();
      }
      directory = directory.replace(/\s*/g,"");
      if(isload) return false;
      isload = true;
      tt.loading = true;

      console.log(tt.lng,tt.lat)
      ajaxIng = $.ajax({
					// url: '/include/ajax.php?service=siteConfig&action=get114ConveniencePoiList&pageSize=20&page='+page+'&lng='+tt.lng+'&lat='+tt.lat+'&directory='+directory+'&radius='+radius+"&pagetoken="+pagetoken,
          url: '/include/ajax.php?action=getMapSuggestion&cityid='+tt.cityid+'&lat='+tt.lat+'&lng='+tt.lng+'&query='+directory+'&region='+tt.city+'&service=siteConfig',
					dataType: 'json',
					success: function(data){
						isload = false;
            tt.loading = false;
						if(data.state == 100){
              tt.loadEnd = true;
							totalPage = 1;
							// totalCount = data.info.totalCount;
							// pagetoken = data.info.pagetoken == '' || data.info.pagetoken == null ? '' : data.info.pagetoken;
							var list = data.info;

							if(list.length > 0){
                if(page == 1){
                  tt.searchList = list;
                }else{
                  tt.searchList = [...tt.searchList,...list];
                }
                page ++;
                if(page > totalPage){
                  isload = true;
                }
              }else if(page == 1){
                tt.searchList = [];
              }else{
                page ++;
                tt.loading = false;
                tt.loadEnd = true;
              }

						}else{
              tt.loading = false;
              tt.loadEnd = true;
              isload = false;
              tt.searchList = [];
						}
					},
					error: function(){
            isload = false;
            tt.loading = false;
						//showErr(langData['circle'][2][32]);  /* 网络错误，加载失败！*/
					}
				});
    },


    // 选择地址
    choseAddr(item){
      var tt = this;
      var el = event.currentTarget;

      $(".addrList li").removeClass('chosed');
      $(el).addClass('chosed').siblings('li').removeClass('chosed');

      if($(el).closest('.searchList').length > 0){  //直接跳转
        tt.infoData.forEach(function(val){
          if(val.name == 'lnglat'){
            val.value = item.lng+','+ item.lat
          }
          if(val.name == 'address'){
            val.value = item.name;
          }

          if(val.name == 'addrArr'){
            val.value = item.name;
          }
          if(val.name == 'city'){
            val.value = tt['city'];
          }
          if(val.name == 'cityid'){
            val.value = tt['cityid'];
          }
          if(val.name == 'returnUrl'){
            $(el).find('a').attr('data-href',val.value)
          }
        })
       localStorage.setItem('infoData', JSON.stringify(tt.infoData));
       $(el).find('a').attr('href',$(el).find('a').attr('data-href'))
      }else{
        tt.areaInfo = item;
        $('.addrTit .sure').click();
      }
    },

    // 隐藏定位
    noPosi(){
      var tt = this;
      var el = event.currentTarget;
      console.log(tt.infoData,tt['city'])

      tt.infoData.push({
        'name':'noPosi',
        'value':'true'
      })

      // onclick="self.location=document.referrer;"
      tt.infoData.forEach(function(val){
        if(val.name == 'lnglat'){
          val.value = tt.district.point.lng+','+ tt.district.point.lat
        }
        if(val.name == 'address'){
          val.value = tt.city +' '+ (tt.district.title != undefined ? tt.district.title : '');
        }
        if(val.name == 'addrArr'){
          val.value = tt.city +' '+ (tt.district.title != undefined ? tt.district.title : '');
        }
        if(val.name == 'city'){
          val.value = tt['city'];
        }
        if(val.name == 'cityid'){
          val.value = tt['cityid'];

        }
        if(val.name == 'returnUrl'){
          $(el).attr('href',val.value)
        }
      })

      localStorage.setItem('infoData', JSON.stringify(tt.infoData));

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
    },// 点击左侧字母
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
    chose_city(city){
      var tt = this;
      var el = event.currentTarget;
      tt.city = city.name;
      tt.cityid = city.cityid;
      tt.currCityid = tt.cityid

      tt.hideCity();
      if(!map){
        tt.lng = city.lng;
        tt.lat = city.lat;
        tt.drawMap({lng:city.lng,lat:city.lat})
        return false;
      }
      if(site_map == 'baidu'){
        map.centerAndZoom(tt.city,14);
        let lnglat = map.getCenter();
        tt.posi_center = {lng:lnglat.lng,lat:lnglat.lat}
        setTimeout(function(){
          lnglat = map.getCenter();
          tt.lng = lnglat.lng;
          tt.lat = lnglat.lat;
          var mPoint = new BMap.Point(lnglat.lng, lnglat.lat);
          if(tt.modelType == 'info' && fabuMapConfig > 0  && tt.cityInfo.cityid == tt.cityid){

            circle = new BMap.Circle(lnglat,2000,{fillColor:"blue", strokeWeight: 1 ,fillOpacity: 0.1, strokeOpacity: 0.3});
            map.clearOverlays()
            map.addOverlay(circle);
          }
          tt.getLocation(mPoint);
        },1500)

      }else if(site_map == 'amap'){
       
        tt.$nextTick(() => {
          map.setCenter([Number(city.lng),Number(city.lat)])
          
          setTimeout(function(){
            var point = map.getCenter();
            tt.lng = point.lng;
            tt.lat = point.lat;
            map.setZoomAndCenter(14, point);
            tt.getLocationAmap(point)

            // 分类信息 发布设置选项1和2时，且当前定位城市 是分站时 显示定位周边2公里以内（显示圆形）
            if(tt.modelType == 'info' && fabuMapConfig > 0  && tt.cityInfo.cityid == tt.cityid){
              if(circle){
                map.remove(circle)
              }
              circle = new AMap.Circle({
                center: point, // 圆心位置
                radius: 2000,  //半径
                strokeColor: "blue",  //线颜色
                strokeOpacity: .3,  //线透明度
                strokeWeight: 1,  //线粗细度
                fillColor: "blue",  //填充颜色
                fillOpacity: 0.1 //填充透明度
              });
              map.add(circle);
            }

          },200)
        })
      }else if(site_map == 'tmap'){
        map.centerAndZoom(new T.LngLat(city.lng, city.lat), 13);
        setTimeout(() => {
          tt.posi_center = {lng:city.lng,lat:city.lat}
          $(".loadImg").hide()
          var point = map.getCenter();
          tt.getLocationTmap(point);
          var config = {
            color: "blue", //折线颜色
            fillColor: "blue",    //填充颜色。当参数为空时，折线覆盖物将没有填充效果
            weight: "1", //折线的宽度，以像素为单位
            opacity: 0.3,    //折线的透明度，取值范围0 - 1
            fillOpacity: 0.1,
            lineStyle: "solid" //折线的样式，solid或dashed
        };
          //定义该矩形的显示区域
          if(tt.modelType == 'info' && fabuMapConfig > 0  && tt.cityInfo.cityid == tt.cityid){
            var circle = new T.Circle(point, 2000, config);
            map.addOverLay(circle);
          }
        }, 200);
      }

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

    // 选择定位
    async choseArea(){
      var tt = this;
      var el = event.currentTarget;
      tt.areaInfo = tt.areaInfo || tt.surroundingPois[0]
      var address = tt.areaInfo['title']
      if(tt.areaInfo.noDistance){
        address = '';
      }
      if(tt.modelType == 'info' && fabuMapConfig == 2 ){
        if(tt.areaInfo.point){
          tt.areaInfo.lng = tt.areaInfo.point.lng;
          tt.areaInfo.lat = tt.areaInfo.point.lat;
        }
        HN_Location.lnglatGetTown(tt.areaInfo,function(data){
          tt.checkCity(data,1,function(){
            tt.sureArea(el)
          }); //验证当前所选定位是否在当前分站内
        })
        
      }else{
        tt.posiFinish = true; //其他模块不需要要在
      }

      if(!tt.posiFinish) return false;
      tt.sureArea(el)
    },


    sureArea(el){
      const that = this,tt = this;
      tt.areaInfo = tt.areaInfo || tt.surroundingPois[0]
      var address = tt.areaInfo['title']
      if(tt.areaInfo.noDistance){
        address = '';
      }
      if($(el).hasClass('sure') && $(".addrList li.chosed").length>0){
          var urlTo = '';
          var district = false;
          tt.infoData.forEach(function(val){
            switch(val.name)
            {
              case 'lnglat':
                if(tt.areaInfo && tt.areaInfo['point']){
                  val.value = tt.areaInfo['point']['lng']+','+tt.areaInfo['point']['lat'];
                }else if(tt.areaInfo.lng && tt.areaInfo.lat){
                  val.value = tt.areaInfo['lng']+','+tt.areaInfo['lat'];
                }
                break;
              case 'address':
              val.value = address;break;
              case 'addrArr':
              val.value = tt.city +' ' + (tt.district.title != undefined ? tt.district.title : '');break;
              case 'city':
              val.value = tt.city;break;
              case 'cityid':
              val.value = tt.cityid;break;
              case 'district':
              val.value = JSON.stringify(tt.district);
              district = true;
              break;
              case 'street':
              val.value=tt.areaInfo.address;
              break;
              case 'returnUrl':
              // $(el).attr('href',val.value);break;
              urlTo = val.value; break;
              default:
              console.log(val.name)

            }

          })
          if (!district) {

            tt.infoData.push({
              name: 'district',
              value: JSON.stringify(tt.district)
            })
          }
         localStorage.setItem('infoData', JSON.stringify(tt.infoData));
         window.location.href = (urlTo.indexOf('currentPageOpen=1') > -1 ? urlTo : (urlTo + (urlTo.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1'));
       }else{
         showErrAlert(langData['info'][4][26]);  //'请选择地址'
       }
    },

    // 重新定位
    rePosi(){
    	var tt = this;
    	tt.loading = true;
      $(".loadImg").show()
    	HN_Location.init(function(data){
        if (!data ||data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
          // showErrAlert('定位失败');
          tt.drawMap()
          tt.cityInfo = {}; // 清空城市信息
        }else{
          // 生成地图
          if(!fabuMapConfig || tt.modelType != 'info'){
            var name = data.name ==''?data.address:data.name;
            tt.lng = data.lng;
            tt.lat = data.lat;
            posiCity = data.city;
            if(tt.city == ''){
              tt.city = posiCity;
            }
            tt.addrArr = data.city +' '+ data.district
            tt.drawMap(data)
            tt.posi_center = {"lng":data.lng,"lat":data.lat}

          }else{
            tt.myPosi = {lng:data.lng,lat:data.lat}; //当前实际定位
            tt.posi_center = {"lng":data.lng,"lat":data.lat}
            tt.checkCity(data)
          }
          
        }
        tt.loading = false;
      });
    },


    /***********新增验证当前定位是否是城市分站*************/
		// 验证是否开通城市分站  posiData => 定位信息  isChosed => 当前选择
		checkCity:function(posiData,isChosed = 0,func){
			const that = this;
      tt.loading = true;
			$.ajax({
			    url: "/include/ajax.php?service=siteConfig&action=verifyCity&region="+posiData.province+"&city="+posiData.city+"&district="+posiData.district+"&town="+posiData.town || '',
			    type: "POST",
          // async: isChosed ? false : true,
			    dataType: "json",
			    success: function(data){
            tt.loading = false;
            if(data.state == 100){ //城市分站已开通
              let cityInfo = data.info;
              if(!isChosed){ //初始定位
                that.cityInfo = cityInfo;
                that.city = cityInfo.name;
                that.cityid = cityInfo.cityid;
                tt.$set(tt.myPosi, 'cityid', cityInfo.cityid); //定位城市的分站
                // 已开通分站
                var name = posiData.name ==''?posiData.address:posiData.name;
                that.lng = posiData.lng;
                that.lat = posiData.lat;
                posiCity = posiData.city;
                if(that.city == ''){
                  that.city = posiCity;
                }
                that.addrArr = posiData.city +' '+ posiData.district
                that.drawMap(posiData)
                that.posi_center = {"lng":posiData.lng,"lat":posiData.lat}
              }else{
                //最终选定的定位 是否是当前分站
                if(cityInfo.cityid != siteCityInfo_cityid && tt.myPosi.cityid != cityInfo.cityid){
                  let popOptions = {
                    title: '温馨提示', //'确定删除信息？', //提示文字
                    btnCancelColor: '#407fff',
                    isShow:true,
                    confirmHtml: '<p style="margin-top:.2rem;">请在【'+siteCityInfo_name+'】范围内选择位置</p>' , //'一经删除不可恢复', //副标题
                    btnSure: '确定',
                  }
                  confirmPop(popOptions,function(){
                    if(that.cityList.length){
                      let cityObj = that.cityList.find(obj => {
                        return siteCityInfo_cityid == obj.cityid
                      })
                      if(cityObj){
                        that.chose_city(cityObj)
                      }
                    }
                  },function(){
                    location.replace(chanelIndex)
                  })
                  tt.posiFinish = false;
                }else{
                  tt.posiFinish = true; //允许提交
                  if(func){
                    func()
                  }
                }
              }
              

            }else{ //当前定位未开通分站
              if(!isChosed){//初始定位
                if(fabuMapConfig == 1){
                  showErrAlert('当前定位未开通分站');
                  setTimeout(() => {
                    location.replace(chanelIndex)
                  },1500)
                  return false;
                }
                tt.cityInfo = {}; //没有获取到当前城市分站 不需要距离限制
                let pdata = {
                  lng:siteCityInfo_lng, 
                  lat:siteCityInfo_lat
                }
                that.posi_center = {"lng":siteCityInfo_lng,"lat":siteCityInfo_lat}
                if(fabuMapConfig){
                  if(that.cityList.length){
                    let cityObj = that.cityList.find(obj => {
                      return siteCityInfo_cityid == obj.cityid
                    })
                    if(cityObj){
                      that.chose_city(cityObj)
                    }
                  }
                  
                }

              }else{
                let popOptions = {
                  title: '温馨提示', //'确定删除信息？', //提示文字
                  btnCancelColor: '#407fff',
                  isShow:true,
                  confirmHtml: '<p style="margin-top:.2rem;">当前定位未开通分站<br/>请重新在【'+siteCityInfo_name+'】范围内选择位置</p>' , //'一经删除不可恢复', //副标题
                  btnSure: '确定',
                }
                confirmPop(popOptions,function(){
                  if(that.cityList.length){
                    let cityObj = that.cityList.find(obj => {
                      return siteCityInfo_cityid == obj.cityid
                    })
                    if(cityObj){
                      that.chose_city(cityObj)
                    }
                  }
                },function(){
                  location.replace(chanelIndex)
                })

                tt.posiFinish = false;
              }
            }
          },
          error: function(xhr, type){
            tt.loading = false;
          }
			})
		},
  },

  watch:{
    // 关键字
    search_key(){
      var tt = this;
      if(tt.search_key){
        tt.loadEnd = false;
        isload=false;
        page = 1;
        tt.getList(tt.search_key)
      }else{

        if(document.activeElement.id == 'searchInp'){
          tt.typing = true;
        }else{
          tt.typing = false;
        }
        tt.searchList = [];
      }
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

              cityArr[szmArr.indexOf(city.pinyin.substr(0,1).toUpperCase())]['arr'].push(city)

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

    // 搜索列表
    searchList(val){
      var wh = $(window).height(); //视窗高度
      var offTop = 0;
      setTimeout(function(){
        offTop = $(".searchList .toDefine").offset().top;
        h = $(".searchList .toDefine").height();
        if(page <= 2){
          if(wh - h < offTop ){
            $(".searchList .toDefine").addClass('fixedBottom')
          }else{
            $(".searchList .toDefine").removeClass('fixedBottom')
          }
        }
      },500)
    },




  }
})
