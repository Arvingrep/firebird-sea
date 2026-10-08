$(function () {

    //APP端取消下拉刷新
    toggleDragRefresh('off');

    var lng_ = lat_ = 0;
    if (!lng || !lat) {
        var address = $('#address').val();

        setTimeout(function () {
            HN_Location.init(function (data) {
                if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
                    // getLocation(address);
                    lng = siteCityInfo_lng;
                    lat = siteCityInfo_lat;
                    setMap();
                } else {
                    lng = data.lng, lat = data.lat;
                    setMap();
                }
            })
        }, 1000);

    } else {
        setMap();
    }

    function getLocation(addr) {
        if (addr == '') {
            //if(isManager){
            setMap();
            //}
            return;
        }
        if (site_map == "baidu") {
            var myGeo = new BMap.Geocoder();
            // 将地址解析结果显示在地图上,并调整地图视野
            myGeo.getPoint(addr, function (point) {
                if (point) {
                    lng = point.lng;
                    lat = point.lat;
                    setMap();
                } else {
                    //if(isManager){
                    setMap();
                    //showMsg.alert('地址解析失败', 1000);
                    //}
                }
            }, "");
        }
    }

    $("#address").on('input propertychange', function () {
        var v = $(this).val();
        $("#address_temp").val(v);
    })

    function setMap() {
        $('.mapwrap').removeClass('fn-hide');
        var objTop = $('.mapwrap').offset().top;
        var winh = $(window).height();
        $("#mapdiv, .mapwrap").height(winh - objTop - $('.fabuBtn').height());

        var address = $("#address"), address_ = address.attr("data-val");

        // 百度地图
        if (site_map == "baidu") {

            var myGeo = new BMap.Geocoder();
            map = new BMap.Map("mapdiv");
            var mPoint = new BMap.Point(lng, lat);
            map.centerAndZoom(mPoint, 18);

            map.addEventListener("dragstart", function (e) {

            });
            map.addEventListener("dragend", function (e) {
                var t = new Date().getTime();
                var center = map.getCenter();
                lng = center.lng;
                lat = center.lat;
            });

            //关键字搜索
            var autocomplete = new BMap.Autocomplete({ input: "address_temp" });
            autocomplete.addEventListener("onconfirm", function (e) {
                var _value = e.item.value;
                myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
                var options = {
                    onSearchComplete: function (results) {
                        // 判断状态是否正确
                        if (local.getStatus() == BMAP_STATUS_SUCCESS) {
                            var s = [];
                            for (var i = 0; i < results.getCurrentNumPois(); i++) {
                                if (i == 0) {
                                    $("#address").val(_value.business);
                                    lng = results.getPoi(i).point.lng;
                                    lat = results.getPoi(i).point.lat;
                                    map.panTo(new BMap.Point(lng, lat));
                                }
                            }
                        } else {
                            alert(langData['siteConfig'][20][431] + "!");//您选择地址没有解析到结果
                        }
                    }
                };
                var local = new BMap.LocalSearch(map, options);
                local.search(myValue);

            });
            address.val(address_);


            // 谷歌地图
        } else if (site_map == "google") {

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
                draggable: true,
                animation: google.maps.Animation.DROP
            });

            // getLocation(mapOptions.center);

            google.maps.event.addListener(marker, 'dragend', function (event) {
                var location = event.latLng;
                lng = location.lng();
                lat = location.lat();
                var pos = {
                    lat: location.lat(),
                    lng: location.lng()
                };
            })

            var input = document.getElementById('address');
            var places = new google.maps.places.Autocomplete(input, { placeIdOnly: true });

            google.maps.event.addListener(places, 'place_changed', function () {
                var address = places.getPlace().name;

                geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address': address }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var locations = results[0].geometry.location;
                        lng = locations.lng(), lat = locations.lat();
                        if (lng && lat) {
                            $("#address").val(results[0].formatted_address);

                        } else {
                            alert(langData['siteConfig'][20][431] + "!");//您选择地址没有解析到结果
                        }
                    }
                });

            });

            // 高德地图
        } else if (site_map == 'amap') {

            var map = new AMap.Map('mapdiv', { zoom: 18 });

            AMap.service('AMap.PlaceSearch', function () {//回调函数
                var placeSearch = new AMap.PlaceSearch();

                var s = function () {
                    if (lng != '' && lat != '') {
                        placeSearch.searchNearBy("", [lng, lat], 500, function (status, result) {
                            callback(result, status);
                        });
                    } else {
                        setTimeout(s, 1000)
                    }
                }
                s();

                AMap.event.addListener(map, "dragend", function (status, result) {
                    lnglat = map.getCenter();
                    lng = lnglat['lng'];
                    lat = lnglat['lat'];
                    s();
                });

            })

            function callback(results, status) {
                if (status === 'complete' && results.info === 'OK') {
                    var list = [];
                    var allPois = results.poiList.pois;
                    for (var i = 0; i < allPois.length; i++) {
                        list.push('<li data-lng="' + allPois[i].location.lng + '" data-lat="' + allPois[i].location.lat + '"><h5>' + allPois[i].name + '</h5><p>' + allPois[i].address + '</p></li>');
                    }
                    if (list.length > 0) {
                        $(".mapresults ul").html(list.join(""));
                        $(".mapresults").show();
                    }
                } else {
                    $(".mapresults").hide();
                }
            }

            map.plugin('AMap.Autocomplete', function () {
                console.log('Autocomplete loading...')
                autocomplete = new AMap.Autocomplete({
                    input: "address"
                });
                var keywords = $('#address').val();
                // autocomplete.search(keywords, function(status, result){
                //  callback && callback(status, result);
                // })
                // 选中地址
                AMap.event.addListener(autocomplete, 'select', function (result) {
                    lng = result.poi.location.lng;
                    lat = result.poi.location.lat;
                    var r = result.poi.name ? result.poi.name : (result.poi.address ? result.poi.address : result.poi.district);
                    $("#address").val(r);

                    map.panTo([lng, lat]);
                });
            });

            //天地图
        } else if (site_map == 'tmap') {

            var myGeo = new T.Geocoder();

            if (lng && lat && $('#mapdiv').html() == '') {
                //定位地图
                map = new T.Map("mapdiv");
                var mPoint = new T.LngLat(lng, lat);
                map.centerAndZoom(mPoint, 16);
                getLocation(mPoint);

                map.addEventListener("dragend", function (e) {
                    getLocation(e.target.getCenter());
                });
            }

            var options = {
                pageCapacity: 10,
                onSearchComplete: function (result) {
                    var list = [];
                    if (result.getPois().length > 0) {
                        for (var i = 0; i < result.getPois().length; i++) {
                            var lonlat = result.getPois()[i].lonlat.split(' ');
                            list.push('<li data-lng="' + lonlat[0] + '" data-lat="' + lonlat[1] + '"><h5>' + result.getPois()[i].name + '</h5><p>' + result.getPois()[i].address + '</p></li>');
                        }
                    }
                    if (list.length > 0) {
                        $(".mapresults ul").html(list.join(""));
                        $(".mapresults").show();
                    } else {
                        $(".mapresults ul").html('');
                    }
                }
            };
            var local = new T.LocalSearch(map, options);
            cityInfo = JSON.parse(cfg_cityInfo);

            $("#searchAddr").bind('input', function () {
                local.search(cityInfo.name + $.trim($(this).val()), 1);
            })

            //周边检索
            function getLocation(point) {
                myGeo.getLocation(point, function mCallback(rs) {

                    var list = [];
                    list.push('<li data-lng="' + rs.location.lon + '" data-lat="' + rs.location.lat + '"><h5>' + rs.addressComponent.poi + '</h5><p>' + rs.addressComponent.address + '</p></li>');

                    if (list.length > 0) {
                        $(".mapresults ul").html(list.join(""));
                        $(".mapresults").show();
                    }

                });
            }

            // 腾讯地图
        } else if (site_map == "qq") {

            function operation() {
                if (lng == '' || lat == '') {
                    setTimeout(function () {
                        operation();
                    }, 100)
                } else {
                    var map = new qq.maps.Map(document.getElementById('mapdiv'), { center: new qq.maps.LatLng(lat, lng), zoom: 16, draggable: true });

                    var searchService = new qq.maps.SearchService({
                        pageCapacity: 10,
                        //检索成功的回调函数
                        complete: function (results) {
                            // var len = results.detail.pois.length;
                            // if(len){
                            //   for(var i = 0; i < len; i++){
                            //     var str = results.detail.pois[i].latLng.lng+','+results.detail.pois[i].latLng.lat;
                            //     if(!in_array(has, str)){
                            //       has.push(str);
                            //       list.push(results.detail.pois[i]);
                            //     }
                            //   }
                            // }

                            // if(idx < keywrodsArr.length - 1){
                            //   idx++;
                            //   searchService.searchNearBy(keywrodsArr[idx], new qq.maps.LatLng(lat, lng) , 1000);
                            //   return;
                            // }else{
                            //   if(list.length){
                            //     list.sort(function(x, y){
                            //       return x.dist - y.dist;
                            //     });
                            //     var html = [];
                            //     for(var i = 0; i < list.length; i++){
                            //       html.push('<li data-lng="'+list[i].latLng.lng+'" data-lat="'+list[i].latLng.lat+'"><h5>'+list[i].name+'</h5><p>'+list[i].address+'</p></li>');
                            //     }
                            //     $(".mapresults ul").html(html.join(""));
                            //     $(".mapresults").show();
                            //   }else{
                            //     $(".mapresults").hide();
                            //   }
                            // }
                        },
                        //若服务请求失败，则运行以下函数
                        error: function (error) {
                            console.log(error)
                        }
                    })


                    var keywrodsArr = ['住宅', '写字楼', '商业', '地铁站', '码头', '机场', '公交站', '车站', '学校', '培训机构', '医院', '诊所', '药店', '娱乐', '购物', '餐饮', '银行'], idx = 0, list = [], has = [];
                    searchService.searchNearBy(keywrodsArr[idx], new qq.maps.LatLng(lat, lng), 1000);

                    // var autocomplete = new qq.maps.place.Autocomplete(document.getElementById('address'), {});
                    var keyObj = $("#address");
                    var searchBox = { top: keyObj.height() + keyObj.offset().top, left: keyObj.offset().left, width: keyObj.width() };
                    var searchServiceInput = new qq.maps.SearchService({
                        pageCapacity: 10,
                        //检索成功的回调函数
                        complete: function (results) {
                            if ($(".qqmap_autocomplete").length == 0) {
                                var style = '.qqmap_autocomplete{position:absolute;display:none;left:' + searchBox.left + 'px;top:' + searchBox.top + 'px;width:' + searchBox.width + 'px;z-index:100;}.tangram-suggestion{border:1px solid #e4e6e7;font-family:Arial,Helvetica,"Microsoft YaHei",sans-serif;background:#fff;cursor:default;}.tangram-suggestion table{width:100%;font-size:12px;cursor:default;}.tangram-suggestion table tr td{overflow:hidden;height:32px;padding:0 10px;font-style:normal;line-height:32px;text-decoration:none;color:#666;cursor:pointer;}.tangram-suggestion .route-icon{overflow:hidden;padding-left:20px;font-style:normal;background:url(http://webmap1.map.bdstatic.com/wolfman/static/common/images/ui3/tools/suggestion-icon_013979b.png) no-repeat 0 -14px;}.tangram-suggestion-current{background:#ebebeb;}.tangram-suggestion-prepend{padding:2px;font:12px verdana;color:#c0c0c0;}.tangram-suggestion-append{padding:2px;font:12px verdana;text-align:right;color:#c0c0c0;}.tangram-suggestion-grey{color:#c0c0c0;}';
                                style = '<style>' + style + '</style>';
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
                            if (results.type == "POI_LIST") {
                                for (var i = 0; i < results.detail.pois.length; i++) {
                                    var d = results.detail.pois[i];
                                    data.push('<tr data-lng="' + d.latLng.lng + '" data-lat="' + d.latLng.lat + '"><td><i class="route-icon">' + d.name + '</td></tr>')
                                }
                            }
                            if (data.length) {
                                box.show().find("tbody").html(data.join(""));
                            } else {
                                box.hide();
                            }

                        },
                        error: function (err) {
                            var box = $(".qqmap_autocomplete");
                            box.hide();
                        }
                    })
                    $("#address").keyup(function () {
                        var t = $(this), v = t.val();
                        if (v) {
                            v = v.replace("号", "");
                            searchServiceInput.search(v);
                        }
                    })

                    $("body").delegate("#qqmapSearch tbody tr", "click", function (e) {
                        e.stopPropagation();
                        var t = $(this);
                        lng = t.attr("data-lng");
                        lat = t.attr("data-lat");
                        $("#address").val(t.text());
                        $("#qqmapSearch").hide();

                        map.panTo(new qq.maps.LatLng(lat, lng));

                    }).on("click", function (e) {
                        $("#qqmapSearch").hide();
                    })

                    qq.maps.event.addListener(map, "bounds_changed", function (latLng) {
                        var lnglat = map.getCenter();
                        lng = lnglat.lng;
                        lat = lnglat.lat;

                        list = [];
                        has = [];
                        idx = 0;
                    })

                    function in_array(arr, hack) {
                        for (var i in arr) {
                            if (arr[i] == hack) {
                                return true;
                            }
                        }
                        return false;
                    }

                }

            }
            operation();
        }

    }

    $(".fabuBtn").click(function () {
        var t = $(this);
        var addrid = $("#addrid").val();
        var addrIds = $(".gz-addr-seladdr").attr("data-ids");
        var address = $("#address").val();
        var landmark = $("#landmark").val();
        var cityid = 0;

        if (t.hasClass('disabled')) return;

        if (addrid == "0" || addrid == "") {
            alert(langData['siteConfig'][44][40]);//请选择省市区
            return;
        }

        cityid = addrIds.split(" ")[0];

        if (address == "") {
            alert(langData['siteConfig'][38][81]);//请填写详细地址
            return;
        }

        if (lng == 0 || lat == 0) {
            alert(langData['siteConfig'][44][39]);//请选择坐标
            return;
        }

        t.addClass('disabled');

        $.ajax({
            url: masterDomain + '/include/ajax.php?service=' + service + '&action=' + action + '&cityid=' + cityid + '&addrid=' + addrid + '&lng=' + lng + '&lat=' + lat + '&address=' + address + '&landmark=' + landmark,
            type: 'get',
            dataType: 'jsonp',
            success: function (data) {
                if (data && data.state == 100) {
                    alert(langData['siteConfig'][6][39]);//保存成功
                    if (device.indexOf('huoniao') > -1) {
                        setupWebViewJavascriptBridge(function (bridge) {
                            bridge.callHandler("goBack", {}, function (responseData) {
                            });
                        });
                    } else {
                        window.location.href = document.referrer;
                    }
                } else {
                    t.removeClass('disabled');
                    alert(data.info);
                }
            },
            error: function () {
                t.removeClass('disabled');
                alert(langData['siteConfig'][44][23]);//网络错误，请重试
            }
        })

    })

})
