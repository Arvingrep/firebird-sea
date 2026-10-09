$(function () {

    lat = getQueryString('lat');
    lng = getQueryString('lng');
    name = getQueryString('name');
    address = getQueryString('address');
    tel = getQueryString('tel');

    wxconfig.title = name;
    wxconfig.description = address;
    wxconfig.link = location.href;

    $('.head-content .text-c').html(name.substring(0, 1));

    $('.head-t').html(name);
    $('.head-address span').html(address);
    if (tel) {
        $('.item-tel').show();
        $('.item-tel .item-text').html(tel);
        $('.item-tel .tel').attr('data-tel', tel);
    }

    HN_Location.init(function (data) {
        if (data == undefined || data.address == "" || data.lat == "" || data.lng == "") {
            // msg('定位获取失败');
        } else {
            $('.item-route').show();
            $('#_km').html((mapDistance(Number(lat), Number(lng), Number(data.lat), Number(data.lng)) / 1000).toFixed(2) + 'km');

            var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
            var x = lng - 0.0065;
            var y = lat - 0.006;
            var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
            var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);

            pageData.lng = z * Math.cos(theta);
            pageData.lat = z * Math.sin(theta);

            pageData.mapType = site_map;
            pageData.title = name;
            pageData.address = address;

            $('.appMapBtn').attr('data-href', OpenMap_URL);

        }
    });

    if (site_map == 'baidu') {
        var map = new BMap.Map("allmap");          // 创建地图实例
        var point = new BMap.Point(lng, lat);
        map.centerAndZoom(point, 18);
        map.disableDragging();
        map.addControl(new BMap.NavigationControl({
            anchor: BMAP_ANCHOR_BOTTOM_RIGHT,
            type: BMAP_NAVIGATION_CONTROL_SMALL
        }));

    } else if (site_map == 'amap') {
        var map = new AMap.Map("allmap", {
            //二维地图显示视口
            view: new AMap.View2D({
                center: new AMap.LngLat(lng, lat),//地图中心点
                zoom: 18 //地图显示的缩放级别
            }),
            dragEnable: false
        });
        AMap.plugin([
            'AMap.ToolBar'
        ], function () {
            map.addControl(new AMap.ToolBar());
        });
    } else if (site_map == 'google') {
        var map_default_lng = parseFloat(lat), map_default_lat = parseFloat(lng);
        var uluru = { lat: map_default_lng, lng: map_default_lat };
        setMap();
        function setMap() {
            var map = new google.maps.Map(document.getElementById('allmap'), {
                center: uluru,
                zoom: 18,
                gestureHandling: 'none',
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL
                }
            });
        }

        //天地图
    } else if (site_map == 'tmap') {
        var map = new T.Map("allmap");          // 创建地图实例
        var point = new T.LngLat(lng, lat);
        map.centerAndZoom(point, 18);
        map.disableDrag();
        map.disableScrollWheelZoom();
        map.disableDoubleClickZoom();
        //创建缩放平移控件对象
        var control = new T.Control.Zoom();
        control.setPosition(T_ANCHOR_BOTTOM_RIGHT);
        //添加缩放平移控件
        map.addControl(control);
    }


    //电话
    $('.tel').bind('click', function () {
        showcall($(this).attr('data-tel'));
    });

    //打电话
    function showcall(phone) {
        var tmp = '<div class="callPop" style="display: block;">' +
            '<div class="call-center">' +
            '<div class="call-ts">提示</div>' +
            '<div class="call-hint">联系我时请说明是在' + webname + '上看到的，谢谢！ </div>' +
            '<div class="call-sure">确定拨打电话：<span>' + phone + '</span>吗？ </div>' +
            '<div class="call-btn">' +
            '<a href="tel:' + phone + '">确定</a>' +
            '<a onclick="this.parentNode.parentNode.parentNode.remove();">取消</a>' +
            '</div>' +
            '</div>' +
            '</div>';
        $('body').append(tmp);
    }


    //获取url中的参数
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", 'i'); // 匹配目标参数
        var result = window.location.search.substr(1).match(reg); // 对querystring匹配目标参数
        if (result != null) {
            return decodeURIComponent(result[2]);
        } else {
            return null;
        }
    }

    //计算距离
    var mapDistance = function (lat_a, lng_a, lat_b, lng_b) {
        var pk = 180 / 3.14169;
        var a1 = lat_a / pk;
        var a2 = lng_a / pk;
        var b1 = lat_b / pk;
        var b2 = lng_b / pk;
        var t1 = Math.cos(a1) * Math.cos(a2) * Math.cos(b1) * Math.cos(b2);
        var t2 = Math.cos(a1) * Math.sin(a2) * Math.cos(b1) * Math.sin(b2);
        var t3 = Math.sin(a1) * Math.sin(b1);
        var tt = Math.acos(t1 + t2 + t3);
        return 6366000 * tt;
    };
});
