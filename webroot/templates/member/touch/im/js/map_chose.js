var lnglat = '';
var lng = lat = "";
$(function(){

// 地图坐标 ------------------------- s
$("#im-map .im-lead p").bind("tap", function() {
  $(".im-pageitem").hide();
  $('.im-gz-address').show();
});
$('.im-myposition').click(function(){
  rePosi()
})
// 重新定位
function rePosi(){
  HN_Location.init(function(data){
    if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
        lng = siteCityInfo_lng;
        lat = siteCityInfo_lat;
    }else{
      lng = data.lng || data.longitude;
      lat = data.lat || data.latitude;
      //定位地图
      // if(site_map == "baidu"){
      //   map = new BMap.Map("im-mapdiv");
      //   var mPoint = new BMap.Point(lng, lat);
      //   map.centerAndZoom(mPoint, 16);
      //   map.addControl(new BMap.GeolocationControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,isOpen:true}));
      //   var circle = new BMap.Circle(mPoint,500,{strokeColor:"rgb(83,128,255)", strokeWeight:2, fillColor:"rgb(83,128,255)",fillOpacity:.3, strokeOpacity:0.03}); //创建圆
      //   map.addOverlay(circle);
      //   getLocation(mPoint);

      //   map.addEventListener("dragend", function(e){
      //     getLocation(e.point);
      //   });
      // }
      drawMap(lng,lat)
    }
  })
}

$('body').delegate('.im-btn_posi','tap',function(){
  $('#im-map').show();
 
//  console.log('看看'+)
  //第一次进入自动获取当前位置
 
  if(lnglat == "" && lnglat != ","){
    rePosi()
  }else{

      
      if(typeof(lnglat)=='string' && lnglat.indexOf(',')>-1){
        var lnglat_ = lnglat.split(',');
        var lng = lnglat_[0];
        var lat = lnglat_[1];
      }else{
        lng = lnglat.lng;
        lat = lnglat.lat;
      }
      //定位地图
      if(site_map == "baidu"){
        map = new BMap.Map("im-mapdiv");
          var mPoint = new BMap.Point(lng, lat);
          map.centerAndZoom(mPoint, 16);
          getLocation(mPoint);

          map.addEventListener("dragend", function(e){
            getLocation(e.point);
          });
      }

      drawMap(lng,lat)
  }
});
// 地图
//关键字搜索
function drawMap(lng,lat){
  if(site_map == "baidu"){
    var myGeo = new BMap.Geocoder();
    
      map = new BMap.Map("im-mapdiv");
    var mPoint = new BMap.Point(lng, lat);
    map.centerAndZoom(mPoint, 16);
    map.addControl(new BMap.GeolocationControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,isOpen:true}));
    var circle = new BMap.Circle(mPoint,500,{strokeColor:"rgb(83,128,255)", strokeWeight:2, fillColor:"rgb(83,128,255)",fillOpacity:.3, strokeOpacity:0.03}); //创建圆
    map.addOverlay(circle);
    getLocation(mPoint);

    map.addEventListener("dragend", function(e){
      getLocation(e.point);
    });
    var autocomplete = new BMap.Autocomplete({input: "searchAddr"});
    autocomplete.addEventListener("onconfirm", function(e) {
      var _value = e.item.value;
      myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
  
      var options = {
        onSearchComplete: function(results){
          // 判断状态是否正确
          if (local.getStatus() == BMAP_STATUS_SUCCESS){
            var s = [];
            for (var i = 0; i < results.getCurrentNumPois(); i ++){
              if(i == 0){
                var lng = results.getPoi(i).point.lng;
                var lat = results.getPoi(i).point.lat;
  //              此处为点击匹配搜索的结果之后执行的操作   tangram-suggestion-main
                console.log(lng+'===='+lat);
                theLocation(lng,lat);
                
                
              }
            }
          }else{
            alert(langData['siteConfig'][20][431]);
          }
        }
      };
      var local = new BMap.LocalSearch(map, options);
      local.search(myValue);
  
    });
  
    //周边检索
  function getLocation(point){
      myGeo.getLocation(point, function mCallback(rs){
          var allPois = rs.surroundingPois;
          var reg1 =rs.addressComponents.city;
          var reg2 =rs.addressComponents.district;
          var reg3 =rs.addressComponents.province;
          console.log(rs)
       
          if(allPois == null || allPois == ""){
              return;
          }
          var list = [];
          for(var i = 0; i < allPois.length; i++){
              var cur = '';
              if(i==0){
                cur='im-onchose'
              }
              list.push('<li class="'+cur+'" data-lng="'+allPois[i].point.lng+'" data-lat="'+allPois[i].point.lat+'"><h5>'+allPois[i].title+'</h5><p>'+allPois[i].address.replace(reg1,'').replace(reg2,'').replace(reg3,'')+'</p></li>');
          }
          if(list.length > 0){
            $(".im-mapresults ul").html(list.join(""));
          }
  
      }, {
          poiRadius: 5000,  //半径一公里
          numPois: 50
      });
    }
    
    //重新定位
    function theLocation(lng,lat){
          var new_point = new BMap.Point(lng,lat);
          getLocation(new_point);
          map.centerAndZoom(new_point, 16);
    
      }
  
  }else if(site_map == 'amap'){
    var map = new AMap.Map('im-mapdiv');
    console.log(lng, lat)
    if(lng != '' && lat != ''){
      map.setZoomAndCenter(14, [lng, lat]);
    }
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
  
        if(lng=='' && lat==''){
          map.setZoomAndCenter(14, [lnglat['lng'], lnglat['lat']]);	
        }else{
          map.setZoomAndCenter(14, [lng, lat]);
        }
        lng = lnglat['lng'];
        lat = lnglat['lat'];
        $("#lnglat").val(lng+','+lat);
        console.log(lnglat);
        s();
      });
      AMap.event.addListener(map ,"dragend", function(status, result){
        lnglat = map.getCenter();
        lng = lnglat['lng'];
        lat = lnglat['lat'];
        // $("#lnglat").val(lng+','+lat);
        console.log(lnglat);
        s();
      });
  
    })
  
    function callback(results, status) {
      if (status === 'complete' && results.info === 'OK') {
        var list = [];
        var allPois = results.poiList.pois;
        for(var i = 0; i < allPois.length; i++){
          list.push('<li data-lng="'+allPois[i].location.lng+'" data-lat="'+allPois[i].location.lat+'"><h5>'+allPois[i].name+'</h5><p>'+allPois[i].address+'</p></li>');
        }
        if(list.length > 0){
          $(".im-mapresults ul").html(list.join(""));
          $(".im-mapresults").show();
        }
      }else{
        $(".im-mapresults ul").html('');
      }
    }
  
    map.plugin('AMap.Autocomplete', function () {
      console.log('Autocomplete loading...')
      autocomplete = new AMap.Autocomplete({
        input: "searchAddr"
      });
      // 选中地址
      AMap.event.addListener(autocomplete, 'select', function(result){
        lng = result.poi.location.lng;
        lat = result.poi.location.lat;
        var r = result.poi.name ? result.poi.name : (result.poi.address ? result.poi.address : result.poi.district);
  
        $("#local strong").html(r);
        $("#lnglat").val(lng + ',' + lat);
        $(".pageitem").hide();
      });
    });
        
    //天地图
    }else if(site_map == 'tmap'){
    
            var myGeo = new T.Geocoder();
  
            if(!lng && !lat){
                lng = siteCityInfo_lng;
                lat = siteCityInfo_lat;
            }
    
            if(lng&&lat && $('#im-mapdiv').html() == ''){
                //定位地图
                map = new T.Map("im-mapdiv");
                var mPoint = new T.LngLat(lng, lat);
                map.centerAndZoom(mPoint, 16);
                getLocation(mPoint);
    
                map.addEventListener("dragend", function (e) {
                    getLocation(e.target.getCenter());
                });
            }
    
            var options = {
                pageCapacity: 10,
                onSearchComplete: function(result){
                    var list = [];
                    if(result.getPois().length > 0){
                        for(var i = 0; i < result.getPois().length; i++){
                            var lonlat = result.getPois()[i].lonlat.split(' ');
                            list.push('<li data-lng="'+lonlat[0]+'" data-lat="'+lonlat[1]+'"><h5>'+result.getPois()[i].name+'</h5><p>'+result.getPois()[i].address+'</p></li>');
                        }
                    }
                    if(list.length > 0){
                        $(".im-mapresults ul").html(list.join(""));
                        $(".im-mapresults").show();
                    }else{
                        $(".im-mapresults ul").html('');
                    }
                }
            };
            var local = new T.LocalSearch(map, options);
            cityInfo = JSON.parse(cfg_cityInfo);
    
            $("#searchAddr").bind('input', function(){
                local.search(cityInfo.name + $.trim($(this).val()), 1);
            })
    
            //周边检索
            function getLocation(point){
                myGeo.getLocation(point, function mCallback(rs) {
                    
                    var list = [];
                    list.push('<li data-lng="' + rs.location.lon + '" data-lat="' + rs.location.lat + '"><h5>' + rs.addressComponent.poi + '</h5><p>' + rs.addressComponent.address + '</p></li>');
    
                    if (list.length > 0) {
                        $(".im-mapresults ul").html(list.join(""));
                        $(".im-mapresults").show();
                    }
    
                });
            }
  
  //谷歌    
  }else if(site_map == 'google'){
    if (lnglat != "" && lnglat.indexOf(',')>-1) {
      lnglat = lnglat.split(",");
      lng = lnglat[0];
      lat = lnglat[1];
      chatgoogleMap(lng,lat);
    }else{
      navigator.geolocation.getCurrentPosition(function(position) {
            var coords = position.coords;
            lat = coords.latitude;
            lng = coords.longitude;
      console.log(lat,lng)
            //指定一个google地图上的坐标点，同时指定该坐标点的横坐标和纵坐标
            var latlng = new google.maps.LatLng(lat, lng);
            var geocoder = new google.maps.Geocoder();
            chatgoogleMap(lng,lat);
         })
    }         
   
  }
}

//点击检索结果
$(".im-mapresults").delegate("li", "tap", function(){
  var t = $(this), title = t.find("h5").text() ,title1 = t.find("p").text();
  var lng = t.attr("data-lng");
  var lat = t.attr("data-lat");
  t.addClass('im-onchose').siblings('li').removeClass('im-onchose');
  
});

//取消定位
$('body').delegate('.im-map_cancel','tap',function(){
 $('#im-map').hide();
});


function chatgoogleMap(gLng,gLat){
$('body').addClass('googleBody');//自动检索弹窗加样式
  var map, geocoder, marker,
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

        $('.im-mapcenter').remove();
        map = new google.maps.Map(document.getElementById('im-mapdiv'), mapOptions);

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
              for (var i = 0; i < results.length; i++) {
                list.push('<li data-lng="'+results[i].geometry.location.lng()+'" data-lat="'+results[i].geometry.location.lat()+'"><h5>'+results[i].name+'</h5><p>'+results[i].vicinity+'</p></li>');
              }
              if(list.length > 0){
                $(".im-mapresults ul").html(list.join(""));
                $(".im-mapresults").show();
              }
            }
          }
        }

        var input = document.getElementById('searchAddr');
        var places = new google.maps.places.Autocomplete(input, {placeIdOnly: true});

        google.maps.event.addListener(places, 'place_changed', function () {
            var address = places.getPlace().name;
            $('#searchAddr').val(address);
            geocoder = new google.maps.Geocoder();
            geocoder.geocode({'address': address}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                var locations = results[0].geometry.location;
                lng = locations.lng(), lat = locations.lat();
                if (lng && lat) {

                  //$("#local strong").html(results[0].formatted_address);
                  // $("#lnglat").val(lng + ',' + lat);
                  // $(".pageitem").hide();
                  // $(".page.gz-address").show();
                  // $(".chose_val #address").val(address);
                }else{
                  alert(langData["waimai"][7][132]);   /* 您选择地址没有解析到结果! */
                }
              }
            });

        });
}


// 地图坐标 ------------------------- e
});
