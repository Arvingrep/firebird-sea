
$(function(){
    if($('.jl-description').height()<500){
        $('.jl-unfold').hide()
    }
    // 展开全部
    $('.jl-unfold').click(function(){
        $('.jl-description').css({
            'max-height':'none'
        })
        $('.jl-unfold').hide()
    });
    // 举报
    $(".jt-right .report,.jc-warn1 .report").bind("click", function () {
        $.dialog({
            fixed: true,
            title: "信息举报",
            content: 'url:' + masterDomain + '/complain-job-pgzg-' + id + '.html',
            width: 460,
            height: 300
        });
    });
    //你可能感兴趣隐藏
    if(!$('.i-item li')[0]){
        $('.interest').hide();
    }
    // 地图
    let maptimer;
    let mapurl = OpenMap_URL;
    $('.cld-address .text').attr('href', mapurl);
    // 渲染地图
    drawMap()

    function drawMap(){
        if(site_map == 'baidu'){
            drawMap_baidu()
        }else if(site_map == 'amap'){
            drawMap_amap()
        }else if(site_map == 'tmap'){
            drawMap_tmap()
        }else if(site_map == 'google'){
            drawMap_google()
        }
    }

    // 百度
    function drawMap_baidu(){

        let map = new BMap.Map('map'); // 创建Map实例
        map.enableScrollWheelZoom(true);//开启鼠标滚轮缩放
        let point = new BMap.Point(pageData.lng, pageData.lat);  // 创建点坐标 
        map.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别
        let bLabel = new BMap.Label(`<div class="markerBox"><a class="address" href="${mapurl}" target="_blank"><span>${pageData.address}</span></a><div class="marker_customn"></div></div>`, {
            position: point,
            // offset: new BMap.Size(-65, -50)
        });
        map.addEventListener('movestart', function () {
            clearTimeout(maptimer)
            $('.markerBox .address').css({ 'transform': 'scale(0)' });
        });
        map.addEventListener('moveend', function () {
            $('.markerBox .address').css('transform', '');
            clearTimeout(maptimer);
            maptimer = setTimeout(() => { //归位
                $('.markerBox .address').css({ 'transform': 'scale(0)' });
                setTimeout(res => { //地址动画
                    map.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别
                    $('.markerBox .address').css('transform', '');
                }, 50)
            }, 5000);
        });
        map.addEventListener('zoomend', function () {
            $('.markerBox .address').css({ 'transform': 'scale(0)' });
            setTimeout(() => {
                $('.markerBox .address').css('transform', '');
            }, 200);
            //归位
            clearTimeout(maptimer);
            maptimer = setTimeout(() => {
                $('.markerBox .address').css({ 'transform': 'scale(0)' });
                setTimeout(res => { //地址动画
                    map.centerAndZoom(point, 15); // 初始化地图，设置中心点坐标和地图级别
                    $('.markerBox .address').css('transform', '');
                }, 50)
            }, 5000);
        });
        map.addOverlay(bLabel);
    }

    // 高德
    function drawMap_amap(){
        let map = new AMap.Map("map", {
            viewMode: '2D', //默认使用 2D 模式
            zoom: 14, //地图级别
            center: [pageData.lng, pageData.lat], //地图中心点
        });

         // 构造点标记
        let marker = new AMap.Marker({
            content: `<div class="markerBox"><a class="address" href="${mapurl}" target="_blank"><span>${pageData.address}</span></a><div class="marker_customn"></div></div>`,
            position: [+pageData.lng, +pageData.lat],
            map:map,
            draggable:false, //是否可拖拽
        });
        // map.setFitView(marker);
    }

    // 天地图
    function drawMap_tmap(){
        let map = new T.Map('map',{ projection: 'EPSG:4326'});
        let center = new T.LngLat(+pageData.lng, +pageData.lat)
            map.centerAndZoom(center, 14);

            var label = new T.Label({
                text: `<div class="markerBox"><a class="address" href="${mapurl}" target="_blank"><span>${pageData.address}</span></a><div class="marker_customn"></div></div>`,
                position: center,
                // offset: new T.Point(-9, 0)
            });
            //创建地图文本对象
            map.addOverLay(label);
    }

    // 谷歌地图
    async function drawMap_google(){
        const { Map } = await google.maps.importLibrary("maps");
        map = new Map(document.getElementById("map"), {
            center: { lat: +pageData.lat, lng: +pageData.lng },
            zoom: 14,
            disableDefaultUI:true
        });
        var marker_posi = new google.maps.LatLng(Number(pageData.lat),Number(pageData.lng));
        var marker  = new MarkerWithLabel({
            position: marker_posi,
            draggable: true,
            map: map,
            labelAnchor: new google.maps.Point(40, 50),
            labelContent: `<div class="markerBox"><a class="address" href="${mapurl}" target="_blank"><span>${pageData.address}</span></a><div class="marker_customn"></div></div>`,
            icon:'/static/images/blank.gif',
            
        });
    }


})