var totalPage,totalCount,page,isload = false, pagetoken = '';
var ajaxIng = false;
var map;
var lng = lat = '';
var cityid = 0;
var city = '';
var tt;
if(window.location.href.indexOf('?')>-1){
  prarmsArr = window.location.href.split('?')[1].split('&')
  prarmsArr.forEach(function(param){
    if(param.split('=')[0] == 'city'){
      city = decodeURI(param.split('=')[1])
    }
    if(param.split('=')[0] == 'cityid'){
      cityid = param.split('=')[1]
    }
  })
}

toggleDragRefresh('off');

var pagePosi = new Vue({
  el:'#pageMap',
  data:{
    lng:'0',
    lat:'0',
    city:city,
    address:'',
    addrArr:'',
    infoData:[],
    district:'',
    surroundingPois:[],
  },
  mounted(){
    tt = this;
    var posiCity = '';
    // var offTop = $(".topMap").offset().top;
    // $(".topMap").css({
    //   "height":($(window).height() - offTop)+"px"
    // })
    tt.infoData = localStorage.getItem('infoData');

    if(tt.infoData){
      tt.infoData = JSON.parse(localStorage.getItem('infoData'));
      tt.infoData.forEach(function(info){
        if(info.name == 'cityid' || info.name == 'city' || info.name=='lnglat' || info.name=='district' || info.name=='currArr'){
          // if(info.name == 'cityid' ){
            tt[info.name] = info.value;

          }
      });
      if(tt.district){
        tt.district = JSON.parse(tt.district);
        if(tt.district && tt.district != ""){
          $(".gz-addr-seladdr p").text(tt.district.address)
        }
      }else{
        $(".gz-addr-seladdr p").text(tt.city)
      }

    }
    // 定位
    if(tt.district){
      var data={
        'lng':tt.district.point.lng,
        'lat':tt.district.point.lat,
      }

      console.log(data);

      // HN_Location.lnglatGetTown(data,function(res){
      //   console.log(res)
      // })
      setTimeout(function(){

        tt.drawMap(data)
      },1000)
    }else{
      HN_Location.init(function(data){
        if (data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
          console.log('定位失败，请刷新页面');
          tt.lng = siteCityInfo_lng;
          tt.lat = siteCityInfo_lat;
          tt.drawMap({ "lng": siteCityInfo_lng, "lat": siteCityInfo_lat })
        }else{
          var name = data.name ==''?data.address:data.name;
          tt.lng = data.lng;
          tt.lat = data.lat;
          // tt.city = data.city;
          posiCity = data.city;
          if(tt.city == ''){
            tt.city = posiCity;
          }
          // 生成地图
          tt.drawMap(data)
        }
      });
    }


    var valueInterVal = null;
    $(".districtText").click(function(){
      $("#addrid").val('');
      valueInterVal = setInterval(function(){
        if($("#addrid").val()){
          clearInterval(valueInterVal);
          var addr = $(".districtText").text();
            console.log(addr)
            // tt.addrToLnglat(addr)
        }
      },1000)
    })




  },

  methods:{
    // 返回发布页
    goFabu(){
      var tt = this;
      var el = event.currentTarget;
      var address = $(".inpBox .inp").text();
      if(address.replace(/\s+/g) == ''){
        showErrAlert('请填写详细地址');
        return false;
      }
      var urlTo = '';
      
      if(tt.infoData){
        if(tt.lng == '0' || tt.lat == '0'){
          tt.lng = tt.district.point.lng
          tt.lat = tt.district.point.lat
        }
        if($('.gz-addr-seladdr').attr('data-ids')){
          var idArr = $('.gz-addr-seladdr').attr('data-ids').split(' ');
          cityid = idArr[0]
        }
        tt.infoData.forEach(function(val){
          switch(val.name)
          {
            case 'lnglat':
            val.value = tt['lng']+','+tt['lat'];break;
            case 'address':
            val.value = address;break;
            case 'addrArr':
            val.value = $(".gz-addr-seladdr p").text();break;
            case 'addrid':
            val.value = $(".gz-addr-seladdr").attr('data-id');break;
            case 'city':
            val.value = (city?city:tt.city);break;
            case 'cityid':
            val.value = cityid;break;
            case 'districtDetail':
            val.value = tt.district;break;
            case 'returnUrl':
            urlTo = val.value;break;
            case 'lng':
              val.value = tt.district && tt.district.point.lng || tt.lng;break;
            case 'lat':
              val.value = tt.district && tt.district.point.lat || tt.lat  ;break;
            // $(el).attr('href',val.value);break;
            default:
            console.log(val.name)

          }

        })
    
      }else{
        tt.infoData['lnglat'] = tt['lng']+','+tt['lat'];
        tt.infoData['address'] = address;
      }

       localStorage.setItem('infoData', JSON.stringify(tt.infoData));
       if(urlTo){
        window.location.href = urlTo;
       }
    },
    // 地图汇总
    drawMap(data){
      var tt = this;
      var lnglat = '';
      if(data){
        lnglat = [data.lng,data.lat]
      }
      if(site_map == 'baidu'){
        tt.draw_baidu(lnglat)
      }else if(site_map == 'google'){
        tt.draw_google(lnglat)
      }else if(site_map == 'amap'){
        tt.draw_amap(lnglat)
      }else if(site_map == 'tmap'){
      tt.draw_tmap(lnglat)
      }

    },

    // 百度地图
    draw_baidu(lnglat){
      var tt = this;
      map = new BMap.Map("mapdiv");
      if(tt.city != city ){
        map.centerAndZoom(tt.city,14);
        setTimeout(function(){
          lnglat = map.getCenter();
          tt.lng = lnglat.lng;
          tt.lat = lnglat.lat;
          console.log(tt.lng )
          var mPoint = new BMap.Point(lnglat.lng, lnglat.lat);
          tt.getLocation(mPoint);
        },500)
      }else{
        var mPoint = new BMap.Point(lnglat[0], lnglat[1]);
        map.centerAndZoom(mPoint, 16);
        tt.getLocation(mPoint);
      }

		  map.addEventListener("dragend", function(e){
        $('.mapcenter').addClass('animateOn');
        setTimeout(function(){
          $('.mapcenter').removeClass('animateOn');
        },600)
         tt.getLocation(e.point);
         tt.lng = e.point.lng;
         tt.lat = e.point.lat;
		  });
    },
    // 高德地图
    draw_amap(lnglat){
      var tt = this;
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
        tt.getLocationAmap(point);
      },200)

    },

    // 天地图
    draw_tmap(lnglat){
      var tt = this;

      map = new T.Map("mapdiv");
        var mPoint = new T.LngLat(lnglat[0], lnglat[1]);
        map.centerAndZoom(mPoint, 16);
        tt.getLocation(mPoint);

		  map.addEventListener("dragend", function(e){
        $('.mapcenter').addClass('animateOn');
        setTimeout(function(){
          $('.mapcenter').removeClass('animateOn');
        },600)
         tt.getLocation(e.target.getCenter());
         tt.lng = e.target.getCenter().lng;
         tt.lat = e.target.getCenter().lat;
		  });
    },

    // 谷歌地图
    draw_google(lnglat){
      var gLat = lnglat[0],gLng = lnglat[1],
      mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(gLng, gLat),
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL
        }
      }
      $('.mapcenter').hide();
       map = new google.maps.Map(document.getElementById('mapdiv'), mapOptions);
       marker = new google.maps.Marker({
            position: mapOptions.center,
            map: map,
            draggable:true,
            animation: google.maps.Animation.DROP
          });

          getLocation(mapOptions.center);

          google.maps.event.addListener(marker, 'dragend', function(event) {
            var location = event.latLng;
            var pos = {
              lat: location.lat(),
              lng: location.lng()
            };
            tt.lng = location.lng();
            tt.lat = location.lat();
            getLocation(pos);
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
              tt.surroundingPois.map(function(val){
                return {
                    address:val.vicinity, //详细地址
                    title:val.name, //标题
                    point:{
                      lng:val.geometry.location.lng(),
                      lat:val.geometry.location.lat()
                    }
                }
              })
            }
          }
        }
    },

    // 百度获取周边
    getLocation(point){
      var tt = this;
      if(site_map == 'baidu'){
        var myGeo = new BMap.Geocoder();
        myGeo.getLocation(point, function mCallback(rs){
          var allPois = rs.surroundingPois;
          var district = {
            point:rs.point,
            title:rs.addressComponents.district,
            address:rs.addressComponents.city + rs.addressComponents.district,
            noDistance:true,
          }
          tt.district = district;
          tt.areaInfo = tt.district;

          tt.surroundingPois = [district,...rs.surroundingPois]
          var reg1 =rs.addressComponents.city;
          var reg2 =rs.addressComponents.district;
          var reg3 =rs.addressComponents.province;
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
          tt.lng = lnglat['lng'];
          tt.lat = lnglat['lat'];

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
        // console.log(results)
        // var district = {
        //   point:rs.point,
        //   title:rs.addressComponents.district,
        //   address:rs.addressComponents.city + rs.addressComponents.district
        // }
        // tt.surroundingPois = [district,...rs.surroundingPois]

			}
		},

    onFocusInp:function(){
      var tt = this;
      var el = event.currentTarget;
      var txt  = $(el).text();
      if(txt == ''){
        $(el).text(tt.district.address);
        $(el).focus()
      }
    }




  },

  watch:{


  }
})
