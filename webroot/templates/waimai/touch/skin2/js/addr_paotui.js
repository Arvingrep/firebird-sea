$(function(){
  var city = '';

  //APP端取消下拉刷新
  toggleDragRefresh('off');
  // 区号弹出
  $(".acode_show").click(function(){
    $(".popl_mask").show();
    $(".popl_box").animate({"bottom":"0"},300,"swing");
  });

  // 选择区号
  $("#areaList li").click(function(){
    var t = $(this);
    var code = t.attr("data-code");
    var area = t.attr("data-cn");
    $(".acode_show").html(code);
    $("#areaCode").val(code);
    t.addClass('achose').siblings('li').removeClass('achose');
    $(".popl_box.anum_box .back").click();

  })

  // 取消选择区号
  $(".popl_box.anum_box .back,.popl_mask").click(function(){
    $(".popl_mask").hide();
    $(".popl_box").animate({"bottom":"-9rem"},300,"swing");
  })


    var gzAddress         = $(".choseWrap"),  //新增-选择地址页
        gzAddrList        = $("#gzAddrList"),    //选择收货地址页
        gzAddrListObj     = $(".have .addresslist"),  //地址列表
        gzAddNewAddrBtn   = $("#gzAddNewAddrBtn"),  //新增地址按钮
        gzAddNewObj       = $("#gzAddNewObj"),   //新增地址页
        gzAddrSeladdr     = $(".gz-addr-seladdr"),  //选择所在地区按钮
        gzSafeNewAddrBtn  = $(".save_btn"),  //保存新增地址
        gzBackClass       = ".goPrev, .gz-addr-header-back",  //后退按钮样式名
        gzAddrMap         = $("#map"),  //后退按钮样式名
        showErrTimer      = null,
        gzAddrEditId      = 0,   //修改地址ID
        gzAddrInit = {

            //错误提示
            showErr: function(txt){
                var o = $(".error");
              	o.html(txt).css('display','inline-block');
              	setTimeout(function(){o.css('display','none')},1000);
            }

            //显示选择地址页
            ,showChooseAddr: function(){
                $("html").addClass("fixed");
                gzAddress.show();
                if(gzAddrList.find(".address_li").length == 0){
                    gzAddrInit.getAddrList();
                }
            }

            //获取地址列表
            ,getAddrList: function(){

              $.ajax({
                  url:'/include/ajax.php?service=waimai&action=getMemberAddress',
                  dataType: "json",
                  success: function (data) {
                      if(data){
                          var list = data.info, addrList = [];
                          if(data.state == 100 && list.length > 0){

                              for (var i = 0, addr, contact; i < list.length; i++) {
                                  addr = list[i];
                                addrList.push('<div class="item address_li" data-areacode="'+addr.areaCode+'" data-id="'+addr.id+'" data-people="'+addr.person+'" data-contact="'+addr.tel+'" data-lng="'+addr.lng+'" data-lat="'+addr.lat+'" data-street="'+addr.street+'" data-address="'+addr.address+'" data-juli ="'+addr.juli+'">');
                                addrList.push('<a href="javascript:;" class="a_set_addr">')
                                addrList.push('<p class="myAdr">'+addr.street+'&nbsp;&nbsp;'+addr.address+'</p>')
                                addrList.push('<p class="myTel"><span>'+addr.person+'</span><span class="tel_num">'+(addr.areaCode != '' && addr.areaCode != '86' ? '+' + addr.areaCode + addr.tel : addr.tel)+'</span></p>')

                                addrList.push('</a>');
                                addrList.push('<div class="edit edit_btn edit_addr"></div>');
                                addrList.push('</div>');
                              }
                              gzAddrListObj.html(addrList.join(""));

                          }else{
                              if(list && list.length == 0){
                                  gzAddrListObj.html('<div class="empty">'+langData["siteConfig"][20][226]+'</empty>');    /*您尚未添加收货地址 */
                              }else{
                                  gzAddrListObj.html('<div class="empty">'+data.info+'</empty>');
                              }
                          }

                      }else{
                          gzAddrListObj.html('<div class="empty">'+langData["siteConfig"][20][228]+'</empty>');   /* 获取失败！ */
                      }
                  },
                  error: function(){
                      gzAddrListObj.html('<div class="empty">'+langData["siteConfig"][20][227]+'</empty>');    /* 网络错误，加载失败！ */
                  }
              });

            }

            //删除地址
            ,delAddr: function(id, obj){
                $.ajax({
                    url: masterDomain + "/include/ajax.php?service=waimai&action=delAddress",
                    data: {
                        id: id
                    },
                    type: "GET",
                    dataType: "jsonp",
                    success: function (data) {
                        if(data && data.state == 100){
                          $('.gz-addr-header-back').click();
                          obj.hide(300, function(){
                              obj.remove();
                              if(gzAddrListObj.find(".address_li").length == 0){
                                  gzAddrListObj.html('<div class="empty">'+langData["siteConfig"][20][226]+'</empty>');  /* 暂未添加地址 */
                              }
                          });
                        }else{
                            alert(data.info);
                        }
                    },
                    error: function(){
                       alert(langData["siteConfig"][6][203]);    /*网络错误，请重试！ */
                    }
                });
            }

        }




    //点击检索结果
    $(".mapresults").delegate("li", "click", function(){
      var t = $(this), title = t.find("h5").text();
      lng = t.attr("data-lng");
      lat = t.attr("data-lat");
      gzAddrSeladdr.attr('data-lng', lng).attr('data-lat', lat);
      gzAddrSeladdr.find("input#addr").val(title);
      gzAddrMap.hide();
      gzAddress.show();
    });

  //首页选择去送货地址
  $('.container .song li,.orderCon .shoptype li').click(function(){
    if($(this).hasClass('qh')){//取货地址选择
      adrFlag = false;
      $('.choseWrap').find('.header-address').text('取货地址');
    }else{//收货地址
      adrFlag = true;
      $('.choseWrap').find('.header-address').text('收货地址');
      var oldName = $('.choseWrap').attr('data-address'),oldlng = $('.choseWrap').attr('data-lng'),oldlat = $('.choseWrap').attr('data-lat');
      gzAddrSeladdr.find("input#addr").val(oldName);
      gzAddrSeladdr.attr('data-lng',oldlng);
      gzAddrSeladdr.attr('data-lat',oldlat);
    }
    //重置表单
    $("#people").val("");
    $("#mobile").val("");
    $("#address").val("");
    $("#areaCode").val("");
    gzAddrEditId = 0;
    $('.formBox .del_addr').hide();


    gzAddress.show();
    if(indexFlag){//首页选择取送货地址
      $('#p1').addClass("fn-hide");
    }else{//paotui-song
      $('.orderWrap').addClass("fn-hide");
    }

  })

    //选择地址
    gzAddrList.delegate(".address_li .a_set_addr", "click", function(){
      var t = $(this), par = t.parents('.address_li'), id = par.attr("data-id"), people = par.attr("data-people"), contact = par.attr("data-contact"), lng = par.attr("data-lng"), lat = par.attr("data-lat"), street = par.attr("data-street"), address = par.attr("data-address"), code = par.attr("data-areacode");
      par.addClass('curr').siblings('.address_li').removeClass('curr');
      if(indexFlag){
        if(lng && lat){//定位成功 绘制当前位置
          if(site_map == 'baidu'){
            var mPoint2 = new BMap.Point(lng, lat)
            map.centerAndZoom(mPoint2, 15);

          }else if(site_map == 'amap'){
            map.setCenter([lng, lat]);
          }else if(site_map == 'google'){
            map.setCenter(new google.maps.LatLng(lat,lng));
          }
          //回到当前位置时显示当前位置所有骑手
          init.getBusinessData();
        }
      }


      if(!adrFlag){// 取货地址
        $('.shoptype .qhAddress').html(street+address);
        $('.shoptype .qhInfo').html('<s>'+people+'</s><em>'+(code!='' &&code !='86'?'+'+code:'')+contact+'</em>');
        qhLng = lng;
        qhLat = lat;
        $('.choseWrap').hide();
        if(indexFlag){//首页选择取送货地址
          $('#p1').removeClass('fn-hide');
        }else{//paotui-song
          $('.orderWrap').removeClass('fn-hide');
          saveLocation();
          pathInit.drawPath();
        }

      }else{// 收货地址
        $('.shoptype .sqAddress').html(street+address);
        $('.shoptype .sqInfo').html('<s>'+people+'</s><em>'+(code!='' &&code !='86'?'+'+code:'')+contact+'</em>');
        sqLng = lng;
        sqLat = lat;
        saveLocation();
        if(indexFlag){//首页选择取送货地址
          setTimeout(function(){
            window.location.href = songUrl;
          },200)
        }else{
          $('.choseWrap').hide();
          $('.orderWrap').removeClass('fn-hide');
          saveLocation();
          pathInit.drawPath();
        }

      }




    });
    function saveLocation(){
      //取送货信息 传送至订单页面
      var qhAdr = $('.shoptype .qhAddress').html();
      var qhDetail = $('.shoptype .qhInfo').html();
      var sqAdr = $('.shoptype .sqAddress').html();
      var sqDetail = $('.shoptype .sqInfo').html();
      //显示订单页面
      var sAdrr = {'sqLng': sqLng, 'sqLat': sqLat,'sqAdr':sqAdr,'sqDetail':sqDetail}
      var sQdrr = {'qhLng': qhLng, 'qhLat': qhLat,'qhAdr':qhAdr,'qhDetail':qhDetail}
      var allAdr = {'sAdrr':sAdrr,'sQdrr':sQdrr};
      utils.setStorage('paotui_songAddress', JSON.stringify(allAdr));
    }

    //编辑
    gzAddrList.delegate(".edit_addr", "click", function(){
        var t = $(this), par = t.closest(".address_li"), id = par.attr("data-id"), people = par.attr("data-people"), contact = par.attr("data-contact"), lng = par.attr("data-lng"), lat = par.attr("data-lat"), street = par.attr("data-street"), address = par.attr("data-address"),areaCode = par.attr('data-areacode');
        $('.formBox .del_addr').show();
        if(id){

            gzAddrEditId = id;
            $("#people").val(people);
            $("#mobile").val(contact);
            gzAddrSeladdr.removeClass("gz-no-sel").attr("data-lng", lng).attr("data-lat", lat).find("input#addr").val(street);
            $("#address").val(address);
			      $("#areaCode").val(areaCode);

			      $(".acode_show").text((areaCode!='undefined'  && areaCode!='')?areaCode:86);
			      $('.formBox .del_addr').attr('data-id',id);
            gzAddrList.addClass("fn-hide");
            gzAddNewObj.removeClass("fn-hide");

            $('.choseWrap').find('.header-address').text('地址编辑');
            $('.choseWrap').find('.gz-addr-header-back').addClass('editBack');
        }
    });


    //删除
    $('.formBox').delegate(".del_addr", "click", function(){
        var t = $(this), id = t.attr("data-id"), par = $('.addresslist').find('.address_li[data-id="'+id+'"]');
        if(id && confirm(langData["waimai"][7][131])){    /* 确定要删除吗？ */
            gzAddrInit.delAddr(id, par);
        }
    });

    // 选择所在区域
    gzAddrSeladdr.bind("click", function(){
      gzAddrMap.show();
      gzAddress.hide();

      var t = $(this);
      lng = t.attr("data-lng") == null ? lng : t.attr("data-lng");
      lat = t.attr("data-lat") == null ? lat : t.attr("data-lat");

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
                  gzAddrSeladdr.attr('data-lng',lng).attr('data-lat',lat);
                      gzAddrSeladdr.find("input#addr").val(_value.business);
                  gzAddrMap.hide();
                  gzAddress.show();
                    }
                  }
                }else{
                  alert("您选择地址没有解析到结果!");
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
          console.log(333)
            var address = places.getPlace().name;
            $('#searchAddr').val(address);

            geocoder = new google.maps.Geocoder();
            console.log(geocoder)
            geocoder.geocode({'address': address}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                var locations = results[0].geometry.location;
                lng = locations.lng(), lat = locations.lat();
                if (lng && lat) {
                  gzAddrSeladdr.attr('data-lng', lng).attr('data-lat', lat);
                  gzAddrSeladdr.find("input#addr").val(results[0].formatted_address);
                  gzAddrMap.hide();
                  gzAddress.show();

                }else{
                  alert(langData["waimai"][7][132]);   /* 您选择地址没有解析到结果! */
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
          console.log('Autocomplete loading...')
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
              gzAddrSeladdr.find("input#addr").val(r);
              gzAddrSeladdr.attr('data-lng',lng).attr('data-lat',lat);
              gzAddrMap.hide();
              gzAddress.show();
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
              gzAddrSeladdr.find("input#addr").val(t.text());
              gzAddrMap.hide();
              gzAddress.show();
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

    })

    // 选择地址--地图返回
    $('.lead p').bind("click", function(){
      gzAddress.show();
      gzAddrMap.hide();
    })


    //地址返回
    $('.choseWrap').find(gzBackClass).bind("click", function(){
      if($(this).hasClass('editBack')){//编辑返回
        $(this).removeClass('editBack');
        gzAddrList.removeClass("fn-hide");
        if(adrFlag == true){
          $('.choseWrap').find('.header-address').text('收货地址');
        }else{
          $('.choseWrap').find('.header-address').text('取货地址');
        }

        //重置表单
        $("#people").val("");
        $("#mobile").val("");
        $("#address").val("");
        $("#areaCode").val("");
        gzAddrEditId = 0;
        $('.formBox .del_addr').hide();
        var oldName = $('.choseWrap').attr('data-address'),oldlng = $('.choseWrap').attr('data-lng'),oldlat = $('.choseWrap').attr('data-lat');
        gzAddrSeladdr.find("input#addr").val(oldName);
        gzAddrSeladdr.attr('data-lng',oldlng);
        gzAddrSeladdr.attr('data-lat',oldlat);


      }else{
        gzAddress.hide();
        if(indexFlag){
          $('#p1').removeClass("fn-hide");
        }else{
          $('.orderWrap').removeClass("fn-hide");
        }

      }

    });

    //保存新增地址/编辑地址
    gzSafeNewAddrBtn.bind("click", function(){

      var t = $(this),
          people = $.trim($("#people").val()),
          tel = $.trim($("#mobile").val()),
          street = gzAddrSeladdr.find("input#addr").val(),
          address = $.trim($("#address").val()),
		      areaCode = $("#areaCode").val();
		      lng = $('.form_li.gz-addr-seladdr').attr('data-lng');
		      lat = $('.form_li.gz-addr-seladdr').attr('data-lat');
      if(street == "" || lng == "" || lat == ""){
        gzAddrInit.showErr(langData['waimai'][7][135]);    /* 请选择街道/小区/建筑！*/
        return false;
      }

      if(address == ""){
        gzAddrInit.showErr(langData['waimai'][7][136]);         /* 请填写详细地址信息！*/
        return false;
      }

			if(people == ""){
				gzAddrInit.showErr(langData['waimai'][7][133]);   /* 请填写您的姓名！*/
				return false;
			}

			if(tel == ""){
				gzAddrInit.showErr(langData['waimai'][7][134]);      /* 请填写您的手机号码！*/
				return false;
			}
        var data = [];
        data.push('id='+gzAddrEditId);
        data.push('lng='+lng);
        data.push('lat='+lat);
        data.push('street='+street);
        data.push('address='+encodeURIComponent(address));
        data.push('person='+encodeURIComponent(people));
        data.push('tel='+encodeURIComponent(tel));
        data.push('areaCode='+(areaCode));
        t.attr("disabled", true).html(langData['siteConfig'][7][9]);   /* 保存中*/

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

                    if(adrFlag){//收货

                      $('.shoptype .sqAddress').html(street+address);
                      $('.shoptype .sqInfo').html('<s>'+people+'</s><em>'+(areaCode!='' &&areaCode !='86'?'+'+areaCode:'')+tel+'</em>');
                      sqLng = lng;
                      sqLat = lat;
                      //取送货信息 传送至订单页面
                      saveLocation();
                      if(indexFlag){//首页选择取送货地址
                        setTimeout(function(){
                          window.location.href = songUrl;
                        },200)
                      }else{
                        $('.choseWrap').hide();
                        $('.orderWrap').removeClass('fn-hide');
                        pathInit.drawPath();
                      }

                    }else{//取货
                      qhLng = lng;
                      qhLat = lat;
                      if(indexFlag){
                        if(lng && lat){//定位成功 绘制当前位置
                          if(site_map == 'baidu'){
                            var mPoint2 = new BMap.Point(lng, lat)
                            map.centerAndZoom(mPoint2, 15);

                          }else if(site_map == 'amap'){
                            map.setCenter([lng, lat]);
                          }else if(site_map == 'google'){
                            map.setCenter(new google.maps.LatLng(lat,lng));
                          }
                          //回到当前位置时显示当前位置所有骑手
                          init.getBusinessData();
                        }



                      }

                      $('.shoptype .qhAddress').html(street+address);
                      $('.shoptype .qhInfo').html('<s>'+people+'</s><em>'+(areaCode!='' &&areaCode !='86'?'+'+areaCode:'')+tel+'</em>');
                      $('.choseWrap').hide();
                      if(indexFlag){//首页选择取送货地址
                        $('#p1').removeClass('fn-hide');
                      }else{
                        $('.orderWrap').removeClass('fn-hide');
                        saveLocation();
                        pathInit.drawPath();
                      }

                    }
                    gzAddrList.removeClass("fn-hide");
                    gzAddrInit.getAddrList();
                }else{
                    gzAddrInit.showErr(data.info);
                }
                t.removeAttr("disabled").html(langData['waimai'][2][52]);          /* 保存*/
            },
            error: function(){
                t.removeAttr("disabled").html(langData['waimai'][2][52]);            /* 保存*/
                gzAddrInit.showErr(langData['siteConfig'][20][253]);        /* 网络错误，保存失败！*/
            }
        });

    });





});



// 扩展zepto
$.fn.prevAll = function(selector){
    var prevEls = [];
    var el = this[0];
    if(!el) return $([]);
    while (el.previousElementSibling) {
        var prev = el.previousElementSibling;
        if (selector) {
            if($(prev).is(selector)) prevEls.push(prev);
        }
        else prevEls.push(prev);
        el = prev;
    }
    return $(prevEls);
};

$.fn.nextAll = function (selector) {
    var nextEls = [];
    var el = this[0];
    if (!el) return $([]);
    while (el.nextElementSibling) {
        var next = el.nextElementSibling;
        if (selector) {
            if($(next).is(selector)) nextEls.push(next);
        }
        else nextEls.push(next);
        el = next;
    }
    return $(nextEls);
};
