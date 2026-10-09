$(function () {
    /*
     * 验证逻辑
     * 1.首先验证坐标值，如果坐标值都不为0，则就以些坐标在地图上标注;
     * 2.如果详细地址不为空，则解析此地址，如果解析成功，则以此地址作为中心点;
     * 3.如果详细地址解析不成功，则解析城市名，如果解析成功，以城市名为中心点;
     * 4.如果都不成功，则IP定位当前城市；
     */
    var parWinAddr = $(window.parent.document).find('#currAddr');
    var parWinAddrs = $(window.parent.document).find('.addrBtn');
    var addrArr = $(window.parent.document).find('#addrArr');
    var city = $("#city").val();
    var addr = $("#addr").val();
    var map_default_lng = $("#lng").val();
    var map_default_lat = $("#lat").val();
    var map_tmp_lng = 0;
    var map_tmp_lat = 0;

    var map = new T.Map("map");
    var point = new T.LngLat(map_default_lng, map_default_lat);

    setTimeout(function () {
        map.centerAndZoom(point, 13);
    }, 500);
    var myIcon = new T.Icon({
        "iconUrl": "/static/images/mark_ditu.png?v=1",
        "iconSize": new T.Point(64, 64),
        "iconAnchor": new T.Point(32, 64)
    });
    var marker = new T.Marker(point, { icon: myIcon });  //自定义标注

    var myGeo = new T.Geocoder();

    //如果经、纬度都为0则设置城市名为中心点
    if (map_default_lng == 0 && map_default_lat == 0) {
        //根据地址解析
        if (city != "") {
            var address = city;
            if (addr != "") address = addr;
            myGeo.getPoint(address, function (address) {
                //如果解析成功
                if (address) {
                    var data = {
                        'lng': address.location.lon,
                        'lat': address.location.lat
                    }
                    setMark(data, 0);

                    $("#lng").val(data.lng);
                    $("#lat").val(data.lat);

                    myGeo.getLocation(new T.LngLat(data.lng, data.lat), function (rs) {
                        var addComp = rs.addressComponent;
                        var addr = addComp.address;
                        var tit = addr == addComp.poi ? '' : addComp.poi;
                        parWinAddrs.text(addComp.city + '/' + addComp.county);
                        addrArr.val(addComp.city + ' ' + addComp.county)
                        $("#city").val(addComp.city);
                        $("#addr").val(addr + tit);
                        if (!parWinAddr.val()) {
                            parWinAddr.val(addr + tit)
                        }
                    }, {
                        poiRadius: 1000,  //半径一公里
                        numPois: 1
                    });
                }
            }, city);

        }

    } else {
        marker = new T.Marker(point, { icon: myIcon });  //自定义标注
        map.addOverLay(marker);
        listener();

        myGeo.getLocation(point, function (rs) {
            var addComp = rs.addressComponent;
            var addr = addComp.address;
            var tit = addr == addComp.poi ? '' : addComp.poi;
            parWinAddrs.text(addComp.city + '/' + addComp.county);
            addrArr.val(addComp.city + ' ' + addComp.county)
            $("#city").val(addComp.city);
            $("#addr").val(addr + tit);
            if (!parWinAddr.val()) {
                parWinAddr.val(addr + tit)
            }
        }, {
            poiRadius: 1000,  //半径一公里
            numPois: 1
        });
    }

    map.addControl(new T.Control.Zoom({ position: T_ANCHOR_BOTTOM_RIGHT }));

    //设置中心点并添加标注
    function setMark(address, type) {
        map.clearOverLays();
        map.centerAndZoom(new T.LngLat(address.lng, address.lat), 13);
        if (type == 0) {
            point = new T.LngLat(address.lng, address.lat);
            marker = new T.Marker(point, { icon: myIcon });  //自定义标注
        }
        map.addOverLay(marker);
        marker.enableDragging();

        listener();
    }

    //监听事件
    function listener() {
        //点击
        map.addEventListener("click", function (e) {
            marker.setLngLat(e.lnglat);
            $("#lng").val(e.lnglat.lng);
            $("#lat").val(e.lnglat.lat);
            myGeo.getLocation(e.lnglat, function (rs) {
                var addComp = rs.addressComponent;
                var addr = addComp.address;
                var tit = addr == addComp.poi ? '' : addComp.poi;
                parWinAddrs.text(addComp.city + '/' + addComp.county)
                addrArr.val(addComp.city + ' ' + addComp.county)
                $("#city").val(addComp.city);
                $("#addr").val(addr + tit);
                parWinAddr.val(addr + tit)
                console.log(addr + tit)
            }, {
                poiRadius: 1000,  //半径一公里
                numPois: 1
            });
        });

        //拖动
        marker.addEventListener("dragend", function (e) {
            $("#lng").val(e.lnglat.lng);
            $("#lat").val(e.lnglat.lat);
            myGeo.getLocation(e.lnglat, function (rs) {
                var addComp = rs.addressComponent;
                var addr = addComp.address;
                var tit = addr == addComp.poi ? '' : addComp.poi;
                parWinAddrs.text(addComp.city + '/' + addComp.county)
                addrArr.val(addComp.city + ' ' + addComp.county)
                $("#city").val(addComp.city);
                $("#addr").val(addr + tit);
                parWinAddr.val(addr + tit)
                console.log(addr + tit)
            }, {
                poiRadius: 1000,  //半径一公里
                numPois: 1
            });
        });
    }

    //搜索回车提交
    $("#keyword").keyup(function (e) {
        if (!e) {
            var e = window.event;
        }
        if (e.keyCode) {
            code = e.keyCode;
        }
        else if (e.which) {
            code = e.which;
        }
        if (code === 13) {
            $("#search").click();
        }
    });

    //关键字搜索
    $("#search").bind("click", function () {
        var keyword = $("#keyword");
        console.log(111)
        if ($.trim(keyword.val()) != "") {

            var ls = new T.LocalSearch(map);
            ls.setSearchCompleteCallback(function (rs) {
                var poi = rs.getPois();
                if (poi) {
                    poi = poi[0];
                    var lonlat = poi.lonlat;
                    var lonlatArr = lonlat.split(' ');
                    var data = {
                        'lng': lonlatArr[0],
                        'lat': lonlatArr[1]
                    }

                    setMark(data, 0);

                    $("#lng").val(lonlatArr[0]);
                    $("#lat").val(lonlatArr[1]);

                    myGeo.getLocation(new T.LngLat(lonlatArr[0], lonlatArr[1]), function (rs) {
                        var addComp = rs.addressComponent;
                        var addr = addComp.address;
                        var tit = addr == addComp.poi ? '' : addComp.poi;
                        parWinAddrs.text(addComp.city + '/' + addComp.county)
                        addrArr.val(addComp.city + ' ' + addComp.county)
                        $("#city").val(addComp.city);
                        $("#addr").val(addr + tit);
                        parWinAddr.val(addr + tit)
                        console.log(addr + tit)
                    }, {
                        poiRadius: 1000,  //半径一公里
                        numPois: 1
                    });

                }
            });
            ls.search(keyword.val());

        } else {
            keyword.focus();
        }
    });

    // var autocomplete = new T.Autocomplete({
    //     input: "keyword",
    //     location: $("#city").val()
    // });

    $("#keyword").change(function () {
        setTimeout(function () {
            $("#search").click();
        }, 200)
    })

});
