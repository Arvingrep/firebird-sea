$(function(){
  $(".addr-article").each(function(){
    var t=$(this);
    var aId=t.data('id');
    var pjuli = t.data('juli')
    if(!t.hasClass('disabled')){
      if(cart_address_id == aId){
        t.addClass('checked').siblings().removeClass('checked')
      }
    }

    if(shop_delivery_radius != 0 && shop_delivery_radius < pjuli){
      t.addClass('disabled');
      t.append('<span class="addr_tip">'+langData['waimai'][8][76]+'</span>');//该地址超出配送范围
    }



  });

  // 选择区号
    $(".areacode").click(function(e){
      $(".arealist").show();
      $(".arealist li").click(function(){
        var t = $(this);
        var code = t.attr('data-code');
        $(".areacode").attr('data-val',code).find('em').text(code);
      $("#areacode").val(code);

      })
      $(document).one('click',function(){
        $(".arealist").hide();
      });
       e.stopPropagation();  //停止事件传播
    });


  var gzAddrListObj     = $(".gz-addr-list"),  //地址列表
      gzAddNewAddrBtn   = $("#gzAddNewAddrBtn"),  //新增地址按钮
      gzAddrSeladdr     = $("#searchAddr"),  //选择所在地区按钮
      gzAddrMap         = $("#map"), //后退按钮样式名
      gzSafeNewAddrBtn  = $("#gzSafeNewAddrBtn"),  //保存新增地址
      gzAddrEditId      = 0;  //修改地址ID
      showErrTimer      = null,
      gzAddrInit = {

          //错误提示
          showErr: function(txt){
              showErrTimer && clearTimeout(showErrTimer);
              $(".gzAddrErr").remove();
              $("body").append('<div class="gzAddrErr"><p>'+txt+'</p></div>');
              $(".gzAddrErr p").css({"margin-left": -$(".gzAddrErr p").width()/2, "left": "50%"});
              $(".gzAddrErr").css({"visibility": "visible"});
              showErrTimer = setTimeout(function(){
                $(".gzAddrErr").fadeOut(300, function(){
                  $(this).remove();
                });
              }, 1500);
          }
      }
  //编辑
  gzAddrListObj.delegate(".gz-rbtn-edit", "click", function(){
      var t = $(this), par = t.closest("article"), id = par.attr("data-id"), people = par.attr("data-people"), contact = par.attr("data-contact"), lng = par.attr("data-lng"), lat = par.attr("data-lat"), street = par.attr("data-street"), address = par.attr("data-address"),areaCode = par.attr("data-areacode");
      $('.gz-addr-addnew,.popup').show();
	  $("#areacode").val(areaCode);
	  $(".areacode").attr('data-val',areaCode).find('em').text((areaCode!='undefined'  && areaCode!='')?areaCode:86);
      $('html').addClass('noscroll');
      if(id){
          gzAddrEditId = id;
          $("#people").val(people);
          $("#mobile").val(contact);
          gzAddrSeladdr.removeClass("gz-no-sel").attr("data-lng", lng).attr("data-lat", lat).val(street);
          $("#address").val(address);


      }
  });
  //新增地址
  gzAddNewAddrBtn.bind("click", function(){
      $('.gz-addr-addnew,.popup').show();
      $('html').addClass('noscroll');

        //重置表单
        $("#people").val("");
        $("#mobile").val("");
        gzAddrSeladdr.removeClass("gz-no-sel").addClass("gz-no-sel").removeAttr("data-lng").removeAttr("data-lat").find("dd").html("<span>"+langData['waimai'][2][67]+"</span>");//选择您的所在地区
        $("#address").val("");

        HN_Location.init(function(data){
              if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
                  $("#local strong").text(langData['siteConfig'][27][136]);

              }else{

                var name = data.name;
                lng = data.lng;
                lat = data.lat;
                city = data.city;
                gzAddrSeladdr.find('dd').text(name);

              }
          })

  });
  // 选择所在区域
  // 选择所在区域
  gzAddrSeladdr.bind("click", function(e){

    gzAddrMap.show();

    var t = $(this);
    lng = t.attr("data-lng") == null ? lng : t.attr("data-lng");
    lat = t.attr("data-lat") == null ? lat : t.attr("data-lat");
    console.log(lng,lat)

    //定位地图
    // 百度地图
    if (site_map == "baidu") {
          var myGeo = new BMap.Geocoder();
      map = new BMap.Map("mapdiv");
      var mPoint = new BMap.Point(lng, lat);
      map.centerAndZoom(mPoint, 16);
          getLocation(mPoint);

      map.addEventListener("dragend", function(e){
          getLocation(e.point);
      });

      //周边检索
      function getLocation(point){
          myGeo.getLocation(point, function mCallback(rs){
              var allPois = rs.surroundingPois;
              if(allPois == null || allPois == ""){
                  return;
              }
          var list = [];
          for(var i = 0; i < allPois.length; i++){
            list.push('<li data-lng="'+allPois[i].point.lng+'" data-lat="'+allPois[i].point.lat+'"><h5>'+allPois[i].title+'</h5><p>'+allPois[i].address+'</p></li>');
          }

          if(list.length > 0){
            $(".mapresults ul").html(list.join(""));
            $(".mapresults").show();
          }

          }, {
              poiRadius: 1000,  //半径一公里
              numPois: 50
          });
      }

          //关键字搜索

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
                      lng = results.getPoi(i).point.lng;
                      lat = results.getPoi(i).point.lat;
                      gzAddrSeladdr.attr('data-lng', lng).attr('data-lat', lat);
                      gzAddrSeladdr.blur();
                      gzAddrMap.hide();

                    }
                  }
                }else{
                  alert(langData['waimai'][7][132]);//您选择地址没有解析到结果!
                }
              }
            };
            var local = new BMap.LocalSearch(map, options);
            local.search(myValue);

          });




    // 谷歌地图
    }else if (site_map == "google") {

      var map, geocoder, marker,
        mapOptions = {
          zoom: 14,
          center: new google.maps.LatLng(lat, lng),
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
          }
        }

      $('.mapcenter').remove();
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
        $("#lng").val(location.lng());
        $("#lat").val(location.lat());

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
              $(".mapresults ul").html(list.join(""));
              $(".mapresults").show();
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
                gzAddrSeladdr.attr('data-lng', lng).attr('data-lat', lat);
                gzAddrSeladdr.val(results[0].formatted_address);
                gzAddrMap.hide();


              }else{
                alert(langData['waimai'][7][132]);//您选择地址没有解析到结果!
              }
            }
          });

      });

    // 高德地图
    }else if (site_map == "amap"){
      var map = new AMap.Map('mapdiv', {zoom:14});

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
              lng = lnglat['lng'];
              lat = lnglat['lat'];
              console.log(lnglat);
              s();
          });

        AMap.event.addListener(map ,"dragend", function(status, result){
          lnglat = map.getCenter();
          lng = lnglat['lng'];
          lat = lnglat['lat'];
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
            $(".mapresults ul").html(list.join(""));
            $(".mapresults").show();
          }
        }else{
          $(".mapresults").hide();
        }
      }

      map.plugin('AMap.Autocomplete', function () {
        console.log('Autocomplete loading...');
          autocomplete = new AMap.Autocomplete({
              input: "searchAddr"
          });
          var keywords = $('#searchAddr').val();
          // autocomplete.search(keywords, function(status, result){
          //  callback && callback(status, result);
          // })
          // 选中地址
          AMap.event.addListener(autocomplete, 'select', function(result){
            lng = result.poi.location.lng;
            lat = result.poi.location.lat;
            var r = result.poi.name ? result.poi.name : (result.poi.address ? result.poi.address : result.poi.district);
            gzAddrSeladdr.val(r);
            gzAddrMap.hide();

          });
      });

    // 腾讯地图
    }else if (site_map == "qq"){

      function operation(){
        if(lng == '' || lat == ''){
          setTimeout(function(){
            operation();
          },100)
        }else{
          var map = new qq.maps.Map(document.getElementById('mapdiv'), {center: new qq.maps.LatLng(lat, lng), zoom: 18, draggable:true});

          var searchService = new qq.maps.SearchService({
            pageCapacity:10,
            //检索成功的回调函数
            complete: function(results) {
              var len = results.detail.pois.length;
              if(len){
                for(var i = 0; i < len; i++){
                  var str = results.detail.pois[i].latLng.lng+','+results.detail.pois[i].latLng.lat;
                  if(!in_array(has, str)){
                    has.push(str);
                    list.push(results.detail.pois[i]);
                  }
                }
              }


              if(idx < keywrodsArr.length - 1){
                idx++;
                searchService.searchNearBy(keywrodsArr[idx], new qq.maps.LatLng(lat, lng) , 1000);
                return;
              }else{
                if(list.length){
                  list.sort(function(x, y){
                    return x.dist - y.dist;
                  });
                  var html = [];
                  for(var i = 0; i < list.length; i++){
                    html.push('<li data-lng="'+list[i].latLng.lng+'" data-lat="'+list[i].latLng.lat+'"><h5>'+list[i].name+'</h5><p>'+list[i].address+'</p></li>');
                  }
                  $(".mapresults ul").html(html.join(""));
                  $(".mapresults").show();
                }else{
                  $(".mapresults").hide();
                }
              }
            },
            //若服务请求失败，则运行以下函数
            error: function(error) {
                console.log(error)
            }
          })


          var keywrodsArr = ['住宅','写字楼','商业','地铁站','码头','机场','公交站','车站','学校','培训机构','医院','诊所','药店','娱乐','购物','餐饮','银行'], idx = 0, list = [], has = [];
          searchService.searchNearBy(keywrodsArr[idx], new qq.maps.LatLng(lat, lng) , 1000);

          // var autocomplete = new qq.maps.place.Autocomplete(document.getElementById('searchAddr'), {});
          var keyObj = $("#searchAddr");
          var searchBox = {top : keyObj.height() + keyObj.offset().top, left: keyObj.offset().left, width: keyObj.width()};
          var searchServiceInput = new qq.maps.SearchService({
            pageCapacity:10,
            //检索成功的回调函数
            complete: function(results) {
              if($(".qqmap_autocomplete").length == 0){
                var style = '.qqmap_autocomplete{position:absolute;display:none;left:'+searchBox.left+'px;top:'+searchBox.top+'px;width:'+searchBox.width+'px;}.tangram-suggestion{border:1px solid #e4e6e7;font-family:Arial,Helvetica,"Microsoft YaHei",sans-serif;background:#fff;cursor:default;}.tangram-suggestion table{width:100%;font-size:12px;cursor:default;}.tangram-suggestion table tr td{overflow:hidden;height:32px;padding:0 10px;font-style:normal;line-height:32px;text-decoration:none;color:#666;cursor:pointer;}.tangram-suggestion .route-icon{overflow:hidden;padding-left:20px;font-style:normal;background:url(http://webmap1.map.bdstatic.com/wolfman/static/common/images/ui3/tools/suggestion-icon_013979b.png) no-repeat 0 -14px;}.tangram-suggestion-current{background:#ebebeb;}.tangram-suggestion-prepend{padding:2px;font:12px verdana;color:#c0c0c0;}.tangram-suggestion-append{padding:2px;font:12px verdana;text-align:right;color:#c0c0c0;}.tangram-suggestion-grey{color:#c0c0c0;}';
                style = '<style>'+style+'</style>';
                var html = '';
                html += '<div class="qqmap_autocomplete" id="qqmapSearch">';
                html += ' <div class="tangram-suggestion">';
                html += '  <table>';
                html += '   <tbody>';
                html += '    </tbody>';
                html += '   </table>';
                html += ' </div>';
                html += '</div>';
                $("body").append(style + html);
              }

              var box = $("#qqmapSearch");
              var data = [];
              if(results.type == "POI_LIST"){
                for(var i = 0; i < results.detail.pois.length; i++){
                  var d = results.detail.pois[i];
                  data.push('<tr data-lng="'+d.latLng.lng+'" data-lat="'+d.latLng.lat+'"><td><i class="route-icon">'+d.name+'</td></tr>')
                }
              }
              if(data.length){
                box.show().find("tbody").html(data.join(""));
              }else{
                box.hide();
              }

            },
            error: function(err){
              var box = $(".qqmap_autocomplete");
              box.hide();
            }
          })
          $("#searchAddr").keyup(function(){
            var t = $(this), v = t.val();
            if(v){
              v = v.replace("号", "");
              searchServiceInput.search(v);
            }
          })

          $("body").delegate("#qqmapSearch tbody tr", "click", function(e){
            e.stopPropagation();
            var t = $(this);
            lng = t.attr("data-lng");
            lat = t.attr("data-lat");
            gzAddrSeladdr.val(t.text());
            gzAddrMap.hide();

            $("#qqmapSearch").hide();
          }).on("click", function(e){
            $("#qqmapSearch").hide();
          })

          qq.maps.event.addListener(map ,"bounds_changed", function(latLng){
            var lnglat = map.getCenter();
            lng = lnglat.lng;
            lat = lnglat.lat;

            list = [];
            has = [];
            idx = 0;
            searchService.searchNearBy(keywrodsArr[idx], new qq.maps.LatLng(lat, lng) , 1000);
          })

          function in_array(arr, hack){
            for(var i in arr){
              if(arr[i] == hack){
                return true;
              }
            }
            return false;
          }

        }

      }
      operation();
    }
    $(document).one('click',function(){
      gzAddrMap.hide();
    })
    e.stopPropagation();

  })
  //选择地址
  gzAddrListObj.delegate(".addr-article .gz-linfo", "click", function(){
      var t = $(this), par = t.parent(), id = par.attr("data-id"), people = par.attr("data-people"), contact = par.attr("data-contact"), lng = par.attr("data-lng"), lat = par.attr("data-lat"), street = par.attr("data-street"), address = par.attr("data-address");
      var data = {
          "id": id,
          "people": people,
          "contact": contact,
          "lng": lng,
          "lat": lat,
          "street": street,
          "address": address
      }
      //业务层需要配合
      // chooseAddressOk(data);
      console.log(id)
      location.href = redirectUrl.replace("#id", id);
  });
  //点击检索结果
  $(".mapresults").delegate("li", "click", function(){
      var t = $(this), title = t.find("h5").text();
      lng = t.attr("data-lng");
      lat = t.attr("data-lat");
      gzAddrSeladdr.attr('data-lng', lng).attr('data-lat', lat);
      gzAddrSeladdr.val(title);
      gzAddrSeladdr.blur();
      $('.mapresults').hide();
  });
  //关闭地址弹窗
  $(".gz-addr-addnew").delegate(".cha", "click", function(){
    $('.popup,.gz-addr-addnew').hide();
    $('html').removeClass('noscroll');
  })
  //取消
  $(".firm_div").delegate(".cancel", "click", function(){
    $('.popup,.gz-addr-addnew').hide();
    $('html').removeClass('noscroll');
  })
  //手机验证
  function isPhoneNo(p) {
	  	if($('#areacode').val() == '86'){
	        var pattern = /^1[23456789]\d{9}$/;
	        return pattern.test(p);
		}
		return true;
    }
  //保存新增地址
  gzSafeNewAddrBtn.bind("click", function(){

        var t = $(this),
            people = $.trim($("#people").val()),
			areaCode = $('#areacode').val(),
            tel = $.trim($("#mobile").val()),
            street = gzAddrSeladdr.val(),
            address = $.trim($("#address").val()),
			lng = gzAddrSeladdr.attr('data-lng'),
			lat = gzAddrSeladdr.attr('data-lat');

        if(people == ""){
          console.log('error')
            gzAddrInit.showErr(langData['siteConfig'][45][61]);//请填写您的姓名！
            return false;
        }


        if(tel == ""){
            gzAddrInit.showErr(langData['siteConfig'][45][62]);//请填写您的手机号码！
            return false;
        }
        if (isPhoneNo(tel) == false) {

           gzAddrInit.showErr(langData['siteConfig'][45][63]);//请填写正确的手机号码！
            return false;
        }

        if(street == "" || lng == "" || lat == ""){
            gzAddrInit.showErr(langData['waimai'][3][73]);//请选择街道/小区/建筑！
            return false;
        }

        if(address == ""){
            gzAddrInit.showErr(langData['siteConfig'][20][252]);//请填写详细地址信息！
            return false;
        }

        var data = [];
        data.push('id='+gzAddrEditId);
        data.push('lng='+lng);
        data.push('lat='+lat);
        data.push('street='+street);
        data.push('address='+address);
        data.push('person='+people);
        data.push('tel='+tel);
        data.push('areaCode='+areaCode);
        t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");//提交中

        var addrName = [];
        $("#addrid").parent().find("select").each(function(){
            addrName.push($(this).find("option:selected").text());
        });

        $.ajax({
            url: masterDomain+"/include/ajax.php?service=waimai&action=operAddress",
            data: data.join("&"),
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){

                    $('.popup,.gz-addr-addnew').hide();
                    $('html').removeClass('noscroll');
                    location.reload();
                }else{
                    gzAddrInit.showErr(data.info);
                }
                t.removeAttr("disabled").html(langData['siteConfig'][6][27]);//保存
            },
            error: function(){
                t.removeAttr("disabled").html(langData['siteConfig'][6][27]);//保存
                gzAddrInit.showErr(langData['siteConfig'][20][253]);//网络错误，保存失败！
            }
        });

  });

})
