toggleDragRefresh('off');
var totalPage,totalCount,page,isload = false, pagetoken = '';
var ajaxIng = false;
var map;
var lng = lat = '';
var cityid = 0;
var city = '',fromPage='';
if(window.location.href.indexOf('?')>-1){
  prarmsArr = window.location.href.split('?')[1].split('&');
  prarmsArr.forEach(function(param){
    if(param.split('=')[0] == 'city'){
      city = decodeURI(param.split('=')[1])
    }
    if(param.split('=')[0] == 'cityid'){
      cityid = param.split('=')[1]
    }
    if(param.split('=')[0] == 'from'){
      fromPage = param.split('=')[1];
    }
  })
}

var pagePosi = new Vue({
  el:'#pageMap',
  data:{
    lng:'0',
    lat:'0',
    city:city,
    address:'',
    addrArr:'',
    waimaiData:[],
    districtText:'定位中...',
    addr:'',  //地址标题
    detailAddr:'',  //详细定位
    from:fromPage,
    cityInfo:JSON.parse(siteCityInfoCurr), //当前城市分站
    cityid:cityid, //当前选择的城市,
    changeCity:false,
  },
  mounted(){
    var tt = this;
    var posiCity = ''
    tt.waimaiData = localStorage.getItem('waimaiData');

    if(tt.waimaiData){
      tt.waimaiData = JSON.parse(localStorage.getItem('waimaiData'));
      tt.waimaiData.forEach(function(val){
        if(val.name == 'addr' || val.name == 'detailAddr' || val.name=='lnglat'){
            tt[val.name] = val.value;
        }
      });
    }

    // 地图loading显示
    $(".loadImg").show()
    HN_Location.init(function(data){
      if (data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
        console.log('定位失败，请刷新页面');
        tt.drawMap()
      }else{
        var name = data.name ==''?data.address:data.name;
        tt.lng = data.lng;
        tt.lat = data.lat;
        posiCity = data.city;
        tt.districtText = data.city + data.district;
        $(".districtText").text(data.city + data.district)
        if(tt.city == ''){
          tt.city = posiCity;
        }

        // 生成地图
        tt.drawMap(data)
      }
    });



    // $("#addrid").change(function(){
    //   console.log($(this).val())
    // })
    var valueInterVal = null;
    $(".districtText").click(function(){
      $("#addrid").val('');
      valueInterVal = setInterval(function(){
        if($("#addrid").val()){
          clearInterval(valueInterVal);
          var addr = $(".districtText").text();
          tt.addrToLnglat(addr)
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

      if(tt.from != 'index'){
        if(tt.waimaiData){

          if($('.gz-addr-seladdr').attr('data-ids')){
            var idArr = $('.gz-addr-seladdr').attr('data-ids').split(' ');
            cityid = idArr[0]
          }
          var urlTo = '';

          tt.waimaiData.forEach(function(val){
            switch(val.name)
            {
              case 'lnglat':
              val.value = tt['lng']+','+tt['lat'];break;
              case 'addr':
              val.value = address;break;
              case 'detailAddr':
              val.value = $(".gz-addr-seladdr p").text();break;
              case 'addrArr':
              val.value = $(".gz-addr-seladdr p").text();break;
              case 'addrid':
              val.value = $(".gz-addr-seladdr").attr('data-id');break;
              case 'city':
              val.value = (city?city:tt.city);break;
              case 'cityid':
              val.value = cityid;break;
              case 'returnUrl':
              urlTo = val.value;break;
              // $(el).attr('href',val.value);break;
              default:
              console.log(val.name)

            }

          })
          window.location.href = urlTo;
        }else{

          tt.waimaiData['lnglat'] = tt['lng']+','+tt['lat'];
          tt.waimaiData['address'] = address;
        }

        localStorage.setItem('waimaiData', JSON.stringify(tt.waimaiData));
      }else{

        var time =  Date.parse(new Date());

        var waimai_local = {'time': time/1000, 'lng': tt['lng'], 'lat': tt['lat'], 'address': address, 'cityid':tt.cityInfo.cityid , 'cityname':tt.cityInfo.name};
        localStorage.setItem('waimai_local', JSON.stringify(waimai_local));
        if(wx_miniprogram){
          wx.miniProgram.redirectTo({
            url:'/pages/packages/waimai/index/index?waimai_local='+JSON.stringify(waimai_local)
          })
        }else{
          window.location.replace(masterDomain+'/waimai?currentPageOpen=1');
        }
      }
    },
    // 地图汇总
    drawMap(data,type){ //type表示重新定位
      var tt = this;
      var lnglat = '';
      // if(data && !type){
      //   lnglat = [data.lng,data.lat]
      //   tt.checkCity(data)
      // }else{
      //   if(site_map == 'baidu'){
      //     tt.draw_baidu(lnglat)
      //   }else if(site_map == 'google'){
      //     tt.draw_google(lnglat)
      //   }else if(site_map == 'amap'){
      //     tt.draw_Amap(lnglat)
      //   }
      // }

      if(type || !data){
        if(data){
          lnglat = [data.lng,data.lat]
        }
        if(site_map == 'baidu'){
          tt.draw_baidu(lnglat)
        }else if(site_map == 'google'){
          tt.draw_google(lnglat)
        }else if(site_map == 'amap'){
          tt.draw_Amap(lnglat)
        }
      }else{
        tt.checkCity(data)
      }



    },

    // 百度地图
    draw_baidu(lnglat,city){
      var tt = this;
      map = new BMap.Map("mapdiv");
      if(city){
        map.centerAndZoom(city,14);
        setTimeout(function(){
          lnglat = map.getCenter();
          tt.lng = lnglat.lng;
          tt.lat = lnglat.lat;
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
      $(".loadImg").hide()
    },
    // 高德地图
    draw_Amap(lnglat,city){
      var tt = this;
      map = new AMap.Map('mapdiv');
      if(lnglat){
        lng = lnglat[0],lat = lnglat[1];
  			map.setZoomAndCenter(14, lnglat);
  		}else if(city){
        map.setCity(tt.city);

      } 

      setTimeout(function(){
        var point = map.getCenter();
        tt.lng = point.lng
        tt.lat = point.lat
        map.setZoomAndCenter(14, point);
        tt.getLocationAmap(point);
      },200)
      $(".loadImg").hide()
    },

    // 谷歌地图
    draw_google(lnglat,city){
      var gLat = lnglat[0],gLng = lnglat[1],
      mapOptions = {
        zoom: 14,
        center: new google.maps.LatLng(gLat, gLng),
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL
        }
      }
       map = new google.maps.Map(document.getElementById('mapdiv'), mapOptions);
       $(".loadImg").hide()
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
          tt.districtText = rs.addressComponents.city + rs.addressComponents.district;
          $(".districtText").text(tt.districtText)
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
    },

    // 重新定位
    rePosi(){
    	var tt = this;
    	$('.loadImg').css({
    		'display':'flex'
    	})
      $(".districtText").removeAttr('data-ids').removeAttr('data-id')
    	 HN_Location.init(function(data){
		      if (data == undefined || (data.address == "" && data.name == "") || data.lat == "" || data.lng == "") {
		        tt.drawMap('',1)
		      }else{
		        var name = data.name ==''?data.address:data.name;
		        tt.lng = data.lng;
		        tt.lat = data.lat;
		        // tt.city = data.city;
		        posiCity = data.city;
		        // tt.districtText = data.city + data.district;
		        if(tt.city == ''){
		          tt.city = posiCity;
		        }
            console.log(data)
		        // 生成地图
		        tt.drawMap(data,'1');

		      }
		     $('.loadImg').css({
	    		'display':'none'
	    	})
		    });
    },

    // 获取城市id
    checkCity(dataStr){
      var tt = this;
      var province = dataStr.province,city = dataStr.city,district = dataStr.district,town = dataStr.town;
      $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=verifyCity&region="+province+"&city="+city+"&district="+district+"&module=waimai"+"&town="+town,
            type: "POST",
            dataType: "json",
            success: function(data){
              if(data && data.state == 100){
                var siteCityInfo_ = JSON.parse(siteCityInfoCurr);
                var cityid = tt.cityid ? tt.cityid : (siteCityInfo_ ? siteCityInfo_.cityid : 0);  //是否携带城市id ； 此步骤
                var nowCityInfo = data.info;
                tt.cityInfo = data.info; // 城市分站
                if( cityid > 0 && cityid != nowCityInfo.cityid){
                  tt.changeCity = true;
                  var lnglat = [dataStr.lng,dataStr.lat];
                  if(site_map == 'baidu'){
                    tt.draw_baidu(lnglat,tt.city)
                  }else if(site_map == 'google'){
                    tt.draw_google(lnglat,tt.city)
                  }else if(site_map == 'amap'){
                    tt.draw_Amap(lnglat,tt.city)
                  }

                }else{
                  var lnglat = [dataStr.lng,dataStr.lat];
                  console.log(lnglat)
                  if(site_map == 'baidu'){
                    tt.draw_baidu(lnglat)
                  }else if(site_map == 'google'){
                    tt.draw_google(lnglat)
                  }else if(site_map == 'amap'){
                    tt.draw_Amap(lnglat)
                  }
                }
              }
            }
        })
    },

    // 逆解析地址
    addrToLnglat(addr){
      var map = new BMapGL.Map('mapdiv');
      var myGeo = new BMapGL.Geocoder();
      console.log(map)
        // 将地址解析结果显示在地图上，并调整地图视野
        myGeo.getPoint(addr, function(point){
          console.log(myGeo)
            if(point){
                map.centerAndZoom(point, 14);
            }else{
                alert('您选择的地址没有解析到结果！');
            }
        })
    }

  },

  watch:{


  }
})
