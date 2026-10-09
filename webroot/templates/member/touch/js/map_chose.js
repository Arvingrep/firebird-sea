// 地图坐标 ------------------------- s
$("#map .lead p").bind("click", function () {
    $(".pageitem").hide();
    $('.gz-address').show();
});

// 2023.12.21修改
let infoData = JSON.parse(localStorage.getItem('infoData'));
let newData = {};
if (infoData) {
    infoData.forEach(function (val) {
        newData[val.name] = val.value
    })
    if (newData.lnglat) {
        $('#address').val(`${newData.address} ${newData.street}`);
        $("#lnglat").val(newData.lnglat);
    }
    localStorage.removeItem('infoData');
}
let formData_infoData = localStorage.getItem('formData_infoData'); //表单数据
if (formData_infoData != 'undefined' && formData_infoData) {
    let url = location.href;
    formData_infoData = JSON.parse(formData_infoData);
    if (url.includes(formData_infoData.page)) { //是当前页面的数据，再执行下面的
        for (let key in formData_infoData) {
            if (key == 'page') { //跳过此次循环
                continue;
            }
            let value = formData_infoData[key];
            let newKey = key.replace(/_val([\s\S]*)/gi, '').replace(/_html([\s\S]*)/gi, '').replace(/_css([\s\S]*)/gi, ''); //key用于判断，newkey用于赋值
            if (key.includes('_val')) { //.val()操作
                if (newKey == '#qj_type') {
                    if (value.length > 0) {
                        $('.more_info').show();
                        $('.more_btn').hide();
                    }
                    $('.qj_title .active').eq(value).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
                    if (value == 1) {
                        $('.url_box').show();
                        $('#qjshow_box').hide();
                    } else {
                        $('.url_box').hide();
                        $('#qjshow_box').show();
                    }
                } else if ((newKey == '#note' || newKey == '#qj_url') && value) {
                    $('.more_info').show();
                    $('.more_btn').hide();
                }
                $(newKey).val(value);
            } else if (key.includes('_html')) { //.html操作
                switch (newKey) {
                    case '#fileList .thumbnail': {
                        $('#fileList .uploadbtn').siblings('.thumbnail').remove()
                        let length = value.length;
                        let eleLength = $(newKey).length;
                        for (let i = 0; i < length; i++) {
                            if (i <= eleLength - 1) {
                                $(newKey).eq(i).html(value[i]);
                            } else {
                                let html = `<li id="WU_FILE__${i - eleLength}" class="thumbnail imgshow_box litpic">${value[i]}</li>`;
                                $('#fileList #uploadbtn').before(html);
                            }
                        }
                        break;
                    }
                    case '#qjshow_box li': {
                        let bool = true;
                        for (let i = 0; i < value.length; i++) {
                            if (value[i]) {
                                if (bool) {
                                    bool = false;
                                    $('.more_info').show();
                                    $('.more_btn').hide();
                                }
                                let html = `<div id="${parseInt(Math.random() * 10000)}" class="img">${value[i]}</div><i class="del_btn">+</i>`;
                                $('#qjshow_box .addbtn').eq(i).after(html);
                            }
                        }
                        break;
                    }
                    case '.video_li': {
                        if (value) {
                            $('.more_info').show();
                            $('.more_btn').hide();
                            $('#up_videoShow').hide();
                            let html = `<li id="${parseInt(Math.random() * 10000)}" class="video_li">${value}</li>`;
                            $('#up_videoShow').before(html);
                        }
                        break;
                    }
                    case 'fabu-category':case '.fabu-category': {
                        setTimeout(function(){
                            $('.fabu-category .on').click();
                        }, 500);
                    }
                    case 'fabu_category':case '.fabu_category': {
                        setTimeout(function(){
                            $('.fabu_category .on').click();
                        }, 500);
                    }
                    case 'room_category':case '.room_category': {
                        setTimeout(function(){
                            $('.room_category .on').click();
                        }, 500);
                    }
                    case 'room-category':case '.room-category': {
                        setTimeout(function(){
                            $('.room-category .on').click();
                        }, 500);
                    }
                    default: {
                        $(newKey).html(value);
                    }
                }
            } else if (key.includes('_css')) { //.css操作
                switch (newKey) {
                    default: {
                        let cssName = key.split('_').reverse()[0];
                        $(newKey).css(cssName, value);
                        break;
                    }
                }
            }
        }
        if (url.match(/fabu-house-([cf|sale|zu|xzl|sp|cw]*).html/)) {
            $('.alertbox,.mpop_tip').hide();
            $('.gz-address').css('z-index', 9);
            $('.input_info').hide();
        }
    }
    localStorage.removeItem('formData_infoData');
}
var lng, lat;
$(".location .chose_val").bind("click", function () {
    // 2023.12.21修改
    let formData;
    let url = location.href;
    if (url.includes('fabu-house-cf.html')) { //厂房
        formData = {
            '.fabu-category_html': $('.fabu-category').html(),
            '.chose_house .area_html': $('.chose_house .area').html(),
            '.room-category_html': $('.room-category').html(),
            '#fileList .thumbnail_html': [],
            '#detail_addr_val': $('#detail_addr').val(),
            '#louceng_html': $('#louceng').html(),
            '#cf_space_val': $('#cf_space').val(),
            '#floor_height_val': $('#floor_height').val(),
            '#price_val': $('#price').val(),
            '#wuye_price_val': $('#wuye_price').val(),
            '#pricein_wuye_html': $('#pricein_wuye').html(),
            '.pay_box_html': $('.pay_box').html(),
            '#payway_type_val': $('#payway_type').val(),
            '#rent_time_val': $('#rent_time').val(),
            '#house_title_val': $('#house_title').val(),
            '.ways_contact_html': $('.ways_contact').html(),
            '#contact_val': $('#contact').val(),
            '#person_val': $('#person').val(),
            '.area_html': $('.area').html(),
            '#house_chosed_val': $('#house_chosed').val(),
            '#vercode_val': $('#vercode').val(),
            '.video_li_html': $('.video_li').html(),
            '#qjshow_box li_html': [],
            '#qj_type_val': $('#qj_type').val(),
            '#note_val': $('#note').val(),
            '#qj_url_val': $('#qj_url').val(),
            page: 'fabu-house-cf.html', //对应页面
        }
    } else if (url.includes('fabu-house-sale.html')) { //租房
        formData = {
            '#house_name_val': $('#house_name').val(),
            '.chose_house .area_html': $('.chose_house .area').html(),
            '.chose_house_css_display': $('.chose_house').css('display'),
            '#fileList .thumbnail_html': [],
            '#huxin_html': $('#huxin').html(),
            '#dong_val': $('#dong').val(),
            '#danyuan_val': $('#danyuan').val(),
            '#shi_val': $('#shi').val(),
            '#louceng_html': $('#louceng').html(),
            '#space_val': $('#space').val(),
            '#price_val': $('#price').val(),
            '#paytax_way_html': $('#paytax_way').html(),
            '#chanquan_html': $('#chanquan').html(),
            '#zxiu_val': $('#zxiu').val(),
            '#floor_to_val': $('#floor_to').val(),
            '#wuyetype_val': $('#wuyetype').val(),
            '#build_years_val': $('#build_years').val(),
            '#lift_val': $('#lift').val(),
            '#house_title_val': $('#house_title').val(),
            '.ways_contact_html': $('.ways_contact').html(),
            '#person_val': $('#person').val(),
            '#contact_val': $('#contact').val(),
            '#sourceid_val': $('#sourceid').val(),
            '.sale_feature_html': $('.sale_feature').html(),
            '#house_chosed_val': $('#house_chosed').val(),
            '.video_li_html': $('.video_li').html(),
            '#qjshow_box li_html': [],
            '#qj_type_val': $('#qj_type').val(),
            '#note_val': $('#note').val(),
            '#qj_url_val': $('#qj_url').val(),
            page: 'fabu-house-sale.html', //对应页面
        }
    } else if (url.includes('fabu-house-zu.html')) { //出租
        formData = {
            '.zu-way_html': $('.zu-way').html(),
            '.sharetype_css_display': $('.sharetype').css('display'),
            '#house_name_val': $('#house_name').val(),
            '.chose_house .area_html': $('.chose_house .area').html(),
            '.chose_house_css_display': $('.chose_house').css('display'),
            '.sharetype_html': $('.sharetype').html(),
            '#fileList .thumbnail_html': [],
            '#huxin_html': $('#huxin').html(),
            '#dong_val': $('#dong').val(),
            '#danyuan_val': $('#danyuan').val(),
            '#shi_val': $('#shi').val(),
            '#louceng_html': $('#louceng').html(),
            '#space_val': $('#space').val(),
            '#price_val': $('#price').val(),
            '#buildage_val': $("#buildage").val(),
            '#zxiu_val': $('#zxiu').val(),
            '#pay_way_val': $('#pay_way').val(),
            '#floor_to_val': $('#floor_to').val(),
            '#hconfig_html': $('#hconfig').html(),
            '#house_title_val': $('#house_title').val(),
            '.ways_contact_html': $('.ways_contact').html(),
            '#person_val': $('#person').val(),
            '#contact_val': $('#contact').val(),
            '#wuyetype_val': $('#wuyetype').val(),
            '#lift_if_val': $('#lift_if').val(),
            '#limit_sex_val': $('#limit_sex').val(),
            '.feature_box_html': $('.feature_box').html(),
            '#house_chosed_val': $('#house_chosed').val(),
            '.video_li_html': $('.video_li').html(),
            '#qjshow_box li_html': [],
            '#qj_type_val': $('#qj_type').val(),
            '#note_val': $('#note').val(),
            '#qj_url_val': $('#qj_url').val(),
            page: 'fabu-house-zu.html', //对应页面
        }
    } else if (url.includes('fabu-house-xzl.html')) { //写字楼
        formData = {
            '#house_name_val': $('#house_name').val(),
            '.chose_house .area_html': $('.chose_house .area').html(),
            '.chose_house_css_display': $('.chose_house').css('display'),
            '.fabu-category_html': $('.fabu-category').html(),
            '#fileList .thumbnail_html': [],
            '#house_chosed_val': $('#house_chosed').val(),
            '#louceng_html': $('#louceng').html(),
            '#space_val': $('#space').val(),
            '#price_val': $('#price').val(),
            '#wuye_price_val': $('#wuye_price').val(),
            '#pricein_wuye_html': $('#pricein_wuye').html(),
            '#fenge_html': $('#fenge').html(),
            '#wuye_protype_val': $('#wuye_protype').val(),
            '#zxiu_val': $('#zxiu').val(),
            '#level_val': $('#level').val(),
            '#house_title_val': $('#house_title').val(),
            '.ways_contact_html': $('.ways_contact').html(),
            '#person_val': $('#person').val(),
            '#contact_val': $('#contact').val(),
            '.xzl_feature_html': $('.xzl_feature').html(),
            '.video_li_html': $('.video_li').html(),
            '#qjshow_box li_html': [],
            '#qj_type_val': $('#qj_type').val(),
            '#note_val': $('#note').val(),
            '#qj_url_val': $('#qj_url').val(),
            page: 'fabu-house-xzl.html', //对应页面
        }
    } else if (url.includes('fabu-house-sp.html')) { //商铺
        formData = {
            '#house_name_val': $('#house_name').val(),
            '.chose_house .area_html': $('.chose_house .area').html(),
            '.chose_house_css_display': $('.chose_house').css('display'),
            '.fabu-category_html': $('.fabu-category').html(),
            '#fileList .thumbnail_html': [],
            '#house_chosed_val': $('#house_chosed').val(),
            '#louceng_html': $('#louceng').html(),
            '#space_val': $('#space').val(),
            '#sp_w_val': $('#sp_w').val(),
            '#sp_d_val': $('#sp_d').val(),
            '#sp_h_val': $('#sp_h').val(),
            '#rent_price_val': $('#rent_price').val(),
            '#transfer_price_val': $('#transfer_price').val(),
            '#price_val': $('#price').val(),
            '#wuye_price_val': $('#wuye_price').val(),
            '#pricein_wuye_html': $('#pricein_wuye').html(),
            '#curr_run_val': $('#curr_run').val(),
            '#run_state_val': $('#run_state').val(),
            '#sp_category_val': $('#sp_category').val(),
            '#zxiu_val': $('#zxiu').val(),
            '#pay_way_val': $('#pay_way').val(),
            '#spConfig_html': $('#spConfig').html(),
            '#house_title_val': $('#house_title').val(),
            '.ways_contact_html': $('.ways_contact').html(),
            '#person_val': $('#person').val(),
            '#contact_val': $('#contact').val(),
            '.industry_box_html': $('.industry_box').html(),
            '.feature_box_html': $('.feature_box').html(),
            '.video_li_html': $('.video_li').html(),
            '#qjshow_box li_html': [],
            '#qj_type_val': $('#qj_type').val(),
            '#note_val': $('#note').val(),
            '#qj_url_val': $('#qj_url').val(),
            page: 'fabu-house-sp.html', //对应页面
        }
    } else if (url.includes('fabu-house-cw.html')) { //车位
        formData = {
            '#house_name_val': $('#house_name').val(),
            '.chose_house .area_html': $('.chose_house .area').html(),
            '.chose_house_css_display': $('.chose_house').css('display'),
            '.fabu_category_html': $('.fabu_category').html(),
            '#fileList .thumbnail_html': [],
            '#house_chosed_val': $('#house_chosed').val(),
            '#space_val': $('#space').val(),
            '#transfer_price_val': $('#transfer_price').val(),
            '#price_val': $('#price').val(),
            '#wuye_price_val': $('#wuye_price').val(),
            '#pricein_wuye_html': $('#pricein_wuye').html(),
            '#payway_type_val': $('#payway_type').val(),
            '#rent_time_val': $('#rent_time').val(),
            '#house_title_val': $('#house_title').val(),
            '.ways_contact_html': $('.ways_contact').html(),
            '#person_val': $('#person').val(),
            '#contact_val': $('#contact').val(),
            '.video_li_html': $('.video_li').html(),
            '#qjshow_box li_html': [],
            '#qj_type_val': $('#qj_type').val(),
            '#note_val': $('#note').val(),
            '#qj_url_val': $('#qj_url').val(),
            page: 'fabu-house-cw.html', //对应页面
        }
    }
    for (let i = 0; i < $('#fileList .thumbnail').length; i++) {
        let text = $('#fileList .thumbnail').eq(i).html();
        if(text.includes('data:image/jpeg;base64')){
            let src = text.match(/data-url="([^"]*)"/)[1]; //截取展示地址
            text = text.replace(/src="([^"]*)"/, `src="${src}"`); //赋值
        }
        formData['#fileList .thumbnail_html'].push(text);
    }
    for (let i = 0; i < $('#qjshow_box li').length; i++) {
        let text = $('#qjshow_box li').eq(i).find('.img').html();
        formData['#qjshow_box li_html'].push(text);
    }
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
    var lnglat = $('#lnglat').val();
    //第一次进入自动获取当前位置
    if (lnglat == "" && lnglat != ",") {
        HN_Location.init(function (data) {
            if (data == undefined || data.address == "" || data.lat == "" || data.lng == "") {
                lng = siteCityInfo_lng;
                lat = siteCityInfo_lat;
                mapdraw()
            } else {
                lng = data.lng;
                lat = data.lat;
                mapdraw()
            }
        })
    } else {
        var lnglat_ = lnglat.split(',');
        lng = lnglat_[0];
        lat = lnglat_[1];
        if (site_map == 'baidu') {
            map = new BMap.Map("mapdiv");
            var mPoint = new BMap.Point(lng, lat);
            map.centerAndZoom(mPoint, 16);
            getLocation(mPoint);

            map.addEventListener("dragend", function (e) {
                getLocation(e.point);
            });
        }
        mapdraw()
    }
});


function mapdraw() {
    // 地图
    //关键字搜索
    if (site_map == "baidu") {

        var myGeo = new BMap.Geocoder();

        map = new BMap.Map("mapdiv");
        var mPoint = new BMap.Point(lng, lat);
        map.centerAndZoom(mPoint, 16);
        getLocation(mPoint);

        map.addEventListener("dragend", function (e) {
            getLocation(e.point);
        });

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
                                var lng = results.getPoi(i).point.lng;
                                var lat = results.getPoi(i).point.lat;
                                $("#address").val(_value.business);
                                $('#house_name').val(_value.business)
                                $("#lnglat").val(lng + ',' + lat);
                                $(".pageitem").hide();
                                $('.gz-address').show()
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
                var reg1 = rs.addressComponents.city;
                var reg2 = rs.addressComponents.district;
                var reg3 = rs.addressComponents.province;
                console.log(rs)
                if (allPois == null || allPois == "") {
                    return;
                }
                var list = [];
                for (var i = 0; i < allPois.length; i++) {
                    list.push('<li data-lng="' + allPois[i].point.lng + '" data-lat="' + allPois[i].point.lat + '"><h5>' + allPois[i].title + '</h5><p>' + allPois[i].address.replace(reg1, '').replace(reg2, '').replace(reg3, '') + '</p></li>');
                }
                if (list.length > 0) {
                    $(".mapresults ul").html(list.join(""));
                }

            }, {
                poiRadius: 5000,  //半径一公里
                numPois: 50
            });
        }
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
                if (lng == '' && lat == '') {
                    map.setZoomAndCenter(14, [lnglat['lng'], lnglat['lat']]);
                }
                lng = lnglat['lng'];
                lat = lnglat['lat'];
                $("#lnglat").val(lng + ',' + lat);
                console.log(lnglat);
                s();
            });
            AMap.event.addListener(map, "dragend", function (status, result) {
                lnglat = map.getCenter();
                lng = lnglat['lng'];
                lat = lnglat['lat'];
                $("#lnglat").val(lng + ',' + lat);
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
                $("#address").val(r);
                $('#house_name').val(r)
                $("#lnglat").val(lng + ',' + lat);
                $(".pageitem").hide();
                $('.gz-address').show()
            });
        });

        //天地图
    } else if (site_map == 'tmap') {

        var myGeo = new T.Geocoder();

        if (!lng && !lat) {
            lng = siteCityInfo_lng;
            lat = siteCityInfo_lat;
        }

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
            businessgooleMap(lng, lat);//公共touchScale中
        } else {
            navigator.geolocation.getCurrentPosition(function (position) {
                var coords = position.coords;
                lat = coords.latitude;
                lng = coords.longitude;
                console.log(lat, lng)
                //指定一个google地图上的坐标点，同时指定该坐标点的横坐标和纵坐标
                var latlng = new google.maps.LatLng(lat, lng);
                var geocoder = new google.maps.Geocoder();
                businessgooleMap(lng, lat);//公共touchScale中
            })
        }

    }
}
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

