$(function () {

    var history_local = 'wm_history_local';
    var map;

    if (site_map === "baidu") {
        map = new BMap.Map("map");
    } else if (site_map === "tmap") {
        map = new T.Map("map");
        map.centerAndZoom(new T.LngLat(116.40969, 39.89945), 12);
    }

    var utils = {
        canStorage: function () {
            if (!!window.localStorage) {
                return true;
            }
            return false;
        },
        setStorage: function (a, c) {
            try {
                if (utils.canStorage()) {
                    localStorage.removeItem(a);
                    localStorage.setItem(a, c);
                }
            } catch (b) {
                if (b.name == "QUOTA_EXCEEDED_ERR") {
                    alert("您开启了秘密浏览或无痕浏览模式，请关闭");
                }
            }
        },
        getStorage: function (b) {
            if (utils.canStorage()) {
                var a = localStorage.getItem(b);
                return a ? JSON.parse(localStorage.getItem(b)) : null;
            }
        },
        removeStorage: function (a) {
            if (utils.canStorage()) {
                localStorage.removeItem(a);
            }
        },
        cleanStorage: function () {
            if (utils.canStorage()) {
                localStorage.clear();
            }
        }
    };

    //提交搜索
    function check() {
        var keywords = $.trim($("#keywords").val());

        //记录搜索历史
        var history = utils.getStorage(history_local);
        history = history ? history : [];
        if (history && history.length >= 10 && $.inArray(keywords, history) < 0) {
            history = history.slice(1);
        }

        // 判断是否已经搜过
        if ($.inArray(keywords, history) > -1) {
            for (var i = 0; i < history.length; i++) {
                if (history[i] === keywords) {
                    history.splice(i, 1);
                    break;
                }
            }
        }
        history.push(keywords);
        utils.setStorage(history_local, JSON.stringify(history));

        if (site_map == "baidu") {

            var options = {
                onSearchComplete: function (results) {
                    // 判断状态是否正确
                    if (local.getStatus() == BMAP_STATUS_SUCCESS) {
                        var point = results.getPoi(0).point;
                        var time = Date.parse(new Date());
                        utils.setStorage('waimai_local', JSON.stringify({ 'time': time, 'lng': point.lng, 'lat': point.lat, 'address': keywords }));
                        window.location.href = channelDomain + "/list.html?local=manual";
                        window.event.returnValue=false;
                    } else {
                        alert(langData['siteConfig'][20][431]);
                    }
                }
            };
            var local = new BMap.LocalSearch(map, options);
            local.search(keywords);

        } else if (site_map == "google") {

            geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'address': keywords }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var locations = results[0].geometry.location;
                    lng = locations.lng(), lat = locations.lat();
                    if (lng && lat) {
                        var time = Date.parse(new Date());
                        utils.setStorage('waimai_local', JSON.stringify({ 'time': time, 'lng': lng, 'lat': lat, 'address': keywords }));
                        window.location.href = channelDomain + "/list.html?local=manual";
                        window.event.returnValue=false;

                    } else {
                        alert(langData['siteConfig'][20][431]);
                    }
                }
            });

        } else if (site_map == "qq") {

        } else if (site_map == "amap") {

            AMap.plugin('AMap.Geocoder', function () {//回调函数
                var geocoder = new AMap.Geocoder;
                geocoder.getLocation(keywords, function (status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        var lng = lat = "";
                        //地理编码结果数组
                        var geocode = result.geocodes[0];
                        lng = geocode.location.getLng();
                        lat = geocode.location.getLat();

                        var time = Date.parse(new Date());
                        utils.setStorage('waimai_local', JSON.stringify({ 'time': time, 'lng': lng, 'lat': lat, 'address': keywords }));
                        window.location.href = channelDomain + "/list.html?local=manual";
                        window.event.returnValue=false;
                    } else {
                        alert(langData['siteConfig'][20][431]);
                    }
                });
            });

        } else if (site_map == "tmap") {

            var options = {
                pageCapacity: 10,
                onSearchComplete: tmapLocalSearchResult
            };
            var local = new T.LocalSearch(map, options);
		    cityInfo = JSON.parse(cfg_cityInfo);
            local.search(cityInfo.name + keywords, 1);

        }


    }

    
    function tmapLocalSearchResult(result){
        if(result.getPois().length > 0){
            var point = result.getPois()[0].lonlat.split(' ');
            var time = Date.parse(new Date());
            utils.setStorage('waimai_local', JSON.stringify({ 'time': time, 'lng': point[0], 'lat': point[1], 'address': $.trim($("#keywords").val()) }));
            window.location.href = channelDomain + "/list.html?local=manual";
            window.event.returnValue=false;
        } else {
            alert(langData['siteConfig'][20][431]);
        }
    }

    //加载历史记录

    var history = utils.getStorage(history_local);
    location();

    function location(force) {

        HN_Location.init(function (data) {
            if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
                $('.loading').html('' + langData['siteConfig'][27][137] + '').show();
            } else {
                var lng = data.lng, lat = data.lat, name = data.name, page = 1;
                var time = Date.parse(new Date());

                utils.setStorage('waimai_local', JSON.stringify({ 'time': time, 'lng': lng, 'lat': lat, 'address': name }));
            }
        }, force);
    }

    if (site_map == "baidu") {
        var autocomplete = new BMap.Autocomplete({ input: "keywords" });
        autocomplete.addEventListener("onconfirm", function (e) {
            console.log(e)
            var _value = e.item.value;
            myValue = _value.province + _value.city + _value.district + _value.street + _value.business;
            $('#keywords').val(myValue);
            check();
        });
    } else if (site_map == "google") {

        var input = document.getElementById('keywords');
        var places = new google.maps.places.Autocomplete(input, { placeIdOnly: true });

        google.maps.event.addListener(places, 'place_changed', function () {
            var address = places.getPlace().name;
            $('#keywords').val(address);
            check();
        });

    } else if (site_map == "qq") {

    } else if (site_map == "amap") {
        AMap.plugin('AMap.Autocomplete', function () {//回调函数
            var autoOptions = {
                city: "", //城市，默认全国
                input: "keywords"//使用联想输入的input的id
            };
            var autocomplete = new AMap.Autocomplete(autoOptions);

            AMap.event.addListener(autocomplete, "select", function (data) {
                $('#keywords').val(data.poi.district + data.poi.name);
                check();
            });
        });

    }else if (site_map == 'tmap'){

        $("#keywords").autocomplete({
            source: function(request, response) {

                var options = {
                    pageCapacity: 10,
                    onSearchComplete: function(result){
                        if(result.getPois().length > 0){
                            response($.map(result.getPois(), function(item, index) {
                                return {
                                    value: item.name,
                                    label: item.name
                                }
                            }));
                        }else{
                            response([])
                        }
                    }
                };
                var local = new T.LocalSearch(map, options);
                cityInfo = JSON.parse(cfg_cityInfo);
                local.search(cityInfo.name + $.trim($("#keywords").val()), 1);

            },
            minLength: 1,
            select: function(event, ui) {
                $('#keywords').val(ui.item.value);
                check();
            }
        }).autocomplete("instance")._renderItem = function(ul, item) {
            return $("<li>")
                .append(item.label)
                .appendTo(ul);
        };

    }



    $('.searchBtn').click(function () {
        check()
        window.location.href = channelDomain + "/list.html?local=manual";
        window.event.returnValue=false;
    })

});
