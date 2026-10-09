$(function () {
    $('head').append('<style class="text/css">.tabBox{left: 18px;}.aroundMap{margin-left: 0;}.tabBox .aroundList{padding-top: 0;}.aroundList .item{display: block;padding: 10px 23px;border-bottom: 1px solid #eee;}.aroundList .item:hover{background: rgb(246,246,246);}.aroundList .item i{display: block;width: 30px;height: 30px;overflow: hidden;float: left}.aroundList .item i img{width: 16px;margin: 10px 0 0 0;}.aroundList .poi-name{color: #101d37;font-size: 14px;overflow: hidden;font-weight: bold;}.aroundList .poi-addr{color: #9399a5;font-size: 14px;text-align: justify;overflow: hidden;word-break: break-all;word-wrap: break-word;white-space: normal;}.tabBox .aroundList::-webkit-scrollbar {width: 4px;height: 13px;background: #eee;}.tabBox .aroundList::-webkit-scrollbar-thumb {border-radius: 5px;-webkit-box-shadow: inset 0 0 5px #a0a0a0;background: #a0a0a0;}.tabBox .aroundList::-webkit-scrollbar-track {background: none;}.aroundList .load{text-align: center;width: 100%;position: absolute;top: 50%;margin-top: -17px;color: #9399a5;font-size: 14px;}</style>');
    var map,centerPoint,service,infowindow,marker;
    var c = "", d = "",u = "",i = $(".aroundType li"), r = i.first().data("key"), s = i.first().data("index"),l = i.first().data("length"),o = $("#mapListContainer");
    var flag = true;
    var markers = [];

    // 初始化地图
    init();
    function init(){
        centerPoint = new google.maps.LatLng(parseFloat(pageData_.lat), parseFloat(pageData_.lng));

        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: centerPoint,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
            }
        });
        addcenMarker();
    }


    var centerwindow = new google.maps.InfoWindow({
        content: '<div style="font-weight: 700; font-size: 16px;">' + pageData_.panName + '</div>' + '<p style="line-height: 3em;">详细地址：' + pageData_.address + '</p>'
    });
    // 添加中心点
    function addcenMarker() {
        var marker = new google.maps.Marker({
            position: centerPoint,
            map: map,
            title: pageData_.panName,
            icon: cenicon,
        });
        // centerwindow.open(map, marker);
        // 中心点点击事件
        marker.addListener('click', function() {
            centerwindow.open(map, marker);
        });
    }

    infowindow = new google.maps.InfoWindow();


    //加载二级类别
    renderTagBox();
    function renderTagBox() {
        var e = r.split(",")
            , t = s.split(",")
            , n = l.split(",")
            , a = "";
        $.each(e, function(e, i) {
            a += '<div class="tagStyle LOGCLICK" data-bl="' + t[e] + '" data-log_evtid="10242" data-index="' + t[e] + '" data-length="' + n[e] + '">' + i + "</div>"

        }),
            $(".itemTagBox").html(a),
        nearBySearch(t[0])
        liClick();
    }
    //类别点击事件
    function liClick() {
        i.on("click", function() {
            $(this).siblings().removeClass("selectTag");
            $(this).hasClass("selectTag") || (r = $(this).data("key"),
                s = $(this).data("index"),
                l = $(this).data("length"),
                $(this).parent().find(".selectTag").removeClass("selectTag"),
                $(this).addClass("selectTag"),
                renderTagBox(),
                $('.tagStyle').eq(0).click()
                // $(".tagStyle").first().trigger("click")
            )
        }),
            $(".tagStyle").on("click", function() {
                d =  $(this).attr('data-index')  ,
                    c = $(this).data("index"),
                    u = $(this).data("length"),
                    $("#mapListContainer").html(""),
                    $(".loading").show(),
                $(this).hasClass("select") || ($(this).parent().find(".select").removeClass("select"),
                        $(this).addClass("select"),
                        nearBySearch(d)
                )
            })
    }
    //周边查找
    function nearBySearch(type) {

        deleteMarkers();
        var request = {
            location: centerPoint,
            radius: '2000',
            keyword:type,
            type:type,
        };

        console.log(type)
        service = new google.maps.places.PlacesService(map);

        service.nearbySearch(request, function(results, status) {
            addcenMarker();
            // console.log(results);
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                $("#mapListContainer").html('')
                for (var i = 0; i < results.length; i++) {
                    createMarker(results[i]);
                    $("#mapListContainer").append('<div id="a' + i + '" href="javascript:void(0)" class="item"><i><img src="' + results[i].icon + '" alt=""></i><div class="item_box"><h3 class="poi-name">' + results[i].name + '</h3><div class="poi-addr">地址:' + results[i].vicinity + '</div></div></div>');
                }
                $('.loading').hide();
                map.setCenter(results[0].geometry.location);
                $('.aroundList .item').on('click', function () {
                });
            }
            if($("#mapListContainer").html()==''){
                $('.loading').hide();
                    $("#mapListContainer").append('<div class="load">很抱歉，该配套下无相关内容，请查看其它配套</div>');
            }
            // }else {
            //     $('.loading').hide();
            //     $("#mapListContainer").append('<div class="load">很抱歉，该配套下无相关内容，请查看其它配套</div>');
            // }

            if(flag){
                $('.aroundType li').eq(0).click();
                flag = false;
            }
        });
    }
    //创建周边标记点
    function createMarker(place) {
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon:iconimg,
        });
        markers.push(marker);
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent( place.name);
            infowindow.open(map, this);
        });
    }

    function setMapOnAll(map){
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }
    function clearMarkers() {
        setMapOnAll(null);
    }
    function deleteMarkers() {
        clearMarkers();
        markers = [];
    }

});