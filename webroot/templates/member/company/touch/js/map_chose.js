// 地图坐标 ------------------------- s
$("#map .lead p").bind("click", function () {
    $(".pageitem").hide();
    $('.gz-address').show();
});
var lng = lat = "";
if ($("#lnglat").val() != "") {
    var lnglat = $("#lnglat").val().split(",");
    lng = lnglat[0];
    lat = lnglat[1];
} else {
    //第一次进入自动获取当前位置
    HN_Location.init(function (data) {
        if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
            lng = siteCityInfo_lng;
            lat = siteCityInfo_lat;
        } else {
            lng = data.lng;
            lat = data.lat;

        }
    }, device.indexOf('huoniao') > -1 ? false : true);
}
// 2023.12.21修改
let infoData = JSON.parse(localStorage.getItem('infoData'));
let newData = {};
if (infoData) {
    infoData.forEach(function (val) {
        newData[val.name] = val.value
    })
    if (newData.lnglat) {
        $('#address').val(`${newData.address} ${newData.street}`);
        $('#address').html(`${newData.address} ${newData.street}`);
        $("#lnglat").val(newData.lnglat);
    }
    localStorage.removeItem('infoData');
}
let formData_infoData = JSON.parse(localStorage.getItem('formData_infoData')); //表单数据
if (formData_infoData) {
    for (let key in formData_infoData) {
        let value = formData_infoData[key];
        let newKey = key.replace(/_val([\s\S]*)/gi, '').replace(/_html([\s\S]*)/gi, '').replace(/_prop([\s\S]*)/gi, ''); //key用于判断，newkey用于赋值
        if (key.includes('_val')) { //.val()操作
            $(newKey).val(value);
        } else if (key.includes('_html')) { //.html操作
            switch (newKey) {
                case '.thumbnail': { //包含的页面（省略了config-）homemaking
                    let length = value.length;
                    let eleLength = $(newKey).length;
                    for (let i = 0; i < length; i++) {
                        let src = value[i].match(/data-url="([^"]*)"/)[1]; //截取展示地址
                        value[i] = value[i].replace(/src="([^"]*)"/, `src="${src}"`); //赋值
                        if (i <= eleLength - 1) {
                            $(newKey).eq(i).html(value[i]);
                        } else {
                            let html = `<li id="WU_FILE__${i - eleLength}" class="thumbnail imgshow_box">${value[i]}</li>`;
                            $('#fileList #uploadbtn').before(html);
                        }
                    }
                    break;
                }
                case '.time-box': { //包含页面hommaking
                    $(newKey).html(value);
                    if ($('#openStart').val() && $('#openEnd').val()) {
                        let start = $('#openStart').val().split(':');
                        let end = $('#openEnd').val().split(':');
                        $('#open-time').val(`${start[0]}时 ${start[1]}分-${end[0]}时 ${end[1]}分`);
                    }
                    break;
                }
                default: {
                    $(newKey).html(value);
                }
            }
        } else if (key.includes('prop')) { //.prop操作
            $(newKey).prop('checked', value);
        }
    }
    localStorage.removeItem('formData_infoData');
}
$(".chose_posi").click(function () {
    let formData;
    let url = location.href;
    if (url.includes('config-homemaking.html')) {
        formData = { //表单数据
            //属性名字规则:jq元素+操作名字。如$('.a .b').eq()=>.a .b(元素名)_eq(类名和操作名) 
            //采用以上命名规则是为了还原操作方便
            '#comname_val': $('#comname').val(),
            '.position_box_html': $('.position_box').html(),
            '.com-box_html': $('.com-box').html(),
            '#com_origin_val': $('#com_origin').val(),
            '.areacode_span_html': $('.areacode_span').html(),
            '#areaCode_val': $('#areaCode').val(),
            '#phone_val': $('#phone').val(),
            '.service-box_html': $('.service-box').html(),
            '.time-box_html': $('.time-box').html(),
            '.thumbnail_html': [],
            '#qdint_prop': $('#qdint').is(':checked'),
            '.service_input_val': $('.service_input').val()
        };
        for (let i = 0; i < $('.thumbnail').length; i++) {
            let text = $('.thumbnail').eq(i).html();
            text = text.replace(/src="([^"]*)"/, 'src=""'); //去除base64地址
            formData['.thumbnail_html'].push(text);
        }
    }
    // 2023.12.21修改
    let arrData = [{
        name: 'lnglat',
        value: newData.lnglat || ''
    }, {
        name: 'address',
        value: newData.address || ''
    }, {
        name: 'district',
        value: newData.district || ''
    }, {
        name: 'street',
        value: newData.street || ''
    }, {
        name: 'returnUrl',
        value: location.href
    }];
    localStorage.setItem('infoData', JSON.stringify(arrData));
    localStorage.setItem('formData_infoData', JSON.stringify(formData));
    location.href = addAddress;
    return false
    $(this).parents('.gz-address').hide();
    $(".pageitem").hide();
    $('#map').show();
    //百度
    if (site_map == 'baidu') {
        var myGeo = new BMap.Geocoder();

        if (lng != '' && lat != '') {
            //定位地图
            map = new BMap.Map("mapdiv");
            var mPoint = new BMap.Point(lng, lat);
            map.centerAndZoom(mPoint, 16);
            getLocation(mPoint);

            map.addEventListener("dragend", function (e) {
                getLocation(e.point);
            });
        }

        //关键字搜索
        var autocomplete = new BMap.Autocomplete({ input: "searchAddr" });
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
                                lng = results.getPoi(i).point.lng;
                                lat = results.getPoi(i).point.lat;
                                $("#local strong").html(_value.business);
                                $("#lnglat").val(lng + ',' + lat);
                                $(".pageitem").hide();
                            }
                        }
                    } else {
                        alert(langData['siteConfig'][20][431]);
                    }
                }
            };
            var local = new BMap.LocalSearch(map, options);
            local.search(myValue);

        });

        //周边检索
        function getLocation(point) {
            myGeo.getLocation(point, function mCallback(rs) {
                var allPois = rs.surroundingPois;
                if (allPois == null || allPois == "") {
                    return;
                }
                var list = [];
                for (var i = 0; i < allPois.length; i++) {
                    list.push('<li data-lng="' + allPois[i].point.lng + '" data-lat="' + allPois[i].point.lat + '"><h5>' + allPois[i].title + '</h5><p>' + allPois[i].address + '</p></li>');
                }

                if (list.length > 0) {
                    $(".mapresults ul").html(list.join(""));
                    $(".mapresults").show();
                }

            }, {
                poiRadius: 1000,  //半径一公里
                numPois: 50
            });
        }


        //高德
    } else if (site_map == 'amap') {

        var map = new AMap.Map('mapdiv');

        if (lng != '' && lat != '') {
            map.setZoomAndCenter(14, [lng, lat]);
        }

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

            AMap.event.addListener(map, "complete", function (status, result) {
                lnglat = map.getCenter();
                lng = lnglat['lng'];
                lat = lnglat['lat'];
                console.log(lnglat);
                s();
            });

            AMap.event.addListener(map, "dragend", function (status, result) {
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
                for (var i = 0; i < allPois.length; i++) {
                    list.push('<li data-lng="' + allPois[i].location.lng + '" data-lat="' + allPois[i].location.lat + '"><h5>' + allPois[i].name + '</h5><p>' + allPois[i].address + '</p></li>');
                }
                if (list.length > 0) {
                    $(".mapresults ul").html(list.join(""));
                    $(".mapresults").show();
                }
            } else {
                $(".mapresults ul").html('');
            }
        }

        map.plugin('AMap.Autocomplete', function () {
            console.log('Autocomplete loading...')
            autocomplete = new AMap.Autocomplete({
                input: "searchAddr"
            });
            // 选中地址
            AMap.event.addListener(autocomplete, 'select', function (result) {
                lng = result.poi.location.lng;
                lat = result.poi.location.lat;
                var r = result.poi.name ? result.poi.name : (result.poi.address ? result.poi.address : result.poi.district);

                $("#local strong").html(r);
                $("#lnglat").val(lng + ',' + lat);
                $(".pageitem").hide();
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

        //谷歌    
    } else if (site_map == 'google') {
        if ($("#lnglat").val() != "") {
            var lnglat = $("#lnglat").val().split(",");
            lng = lnglat[0];
            lat = lnglat[1];
        }

        businessgooleMap(lng, lat);//公共touchScale中
    }
});

//点击确认按钮
$('.btn_sure').bind('click', function () {
    var name2 = $('#house_chosed').val(), str = $('#house_title').val();
    var detail_address = $('.chose_val input[type="text"]').val();
    var address_lnglat = $('#lnglat').val();
    var chosed = $('#house_name').val();
    var cityid = $('.gz-addr-seladdr').data('ids');
    $('#detail_addr').val(detail_address);
    $('#addr_lnglat').val(address_lnglat);
    $('#house_chosed').val(chosed);
    $('.gz-address').hide();
    $('.house_address').show()
    $('.input_info').show();
    $('#houseid').val(0);

    //选择的小区名整合到标题中
    var house_name = chosed;
    if ($('#house_title').val() != '') {
        if (house_name != name2) {
            $('#house_title').val(str.replace(name2, house_name));
        }
    } else {
        $('#house_title').val(house_name);
    }

    if (window.type && window.type == 'cf') {
        $('#house_chosed').val($('.chose_house .selgroup p').text());
    }

})
//点击检索结果
$(".mapresults").delegate("li", "click", function () {
    var t = $(this), title = t.find("h5").text(), title1 = t.find("p").text();
    var lng = t.attr("data-lng");
    var lat = t.attr("data-lat");
    $("#address").val("" + title1 + "" + title + "");
    $("#lnglat").val("" + lng + "," + lat + "")
    $('.pageitem').hide();
    $('#house_name').val(title); //赋值给表单页
    $('.gz-address').show()
});

// 地图坐标 ------------------------- e

