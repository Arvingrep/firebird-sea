$(function () {
    $('head').append('<style type="text/css">.tabBox .aroundList::-webkit-scrollbar {width: 4px;height: 13px;background: #eee;}.tabBox .aroundList::-webkit-scrollbar-thumb {border-radius: 5px;-webkit-box-shadow: inset 0 0 5px #a0a0a0;background: #a0a0a0;}.tabBox .aroundList::-webkit-scrollbar-track {background: none;}\n.aroundMap{margin-left: 0}.amap_lib_placeSearch{border: 0;}p.amap_lib_placeSearch{text-align: center;width: 100%;position: absolute;top: 50%;margin-top: -17px;color: #9399a5;font-size: 14px;border: 0;}</style>\n');
    //位置周边
    var it= {
        initMap:function () {
            var title = "";

            var map,c = "", d = "",u = "",centerPoint,marker,i = $(".aroundType li"), r = i.first().data("key"), s = i.first().data("index"),l = i.first().data("length"),o = $("#mapListContainer");
             var flag = true;
            //初始化地图
            init();
            function init() {
                centerPoint = [longitude||0,latitude||0];//中心点坐标
                map = new AMap.Map('map', {
                    resizeEnable: true, //是否监控地图容器尺寸变化
                    zoom:15, //初始化地图层级
                    center: centerPoint//初始化地图中心点
                });
                addMarker();
                map.plugin(["AMap.ToolBar"],function(){   //在地图中添加ToolBar插件
                    toolBar = new AMap.ToolBar();
                    map.addControl(toolBar);

                });

            }
            var content = "<div class='name'>" + pageData_.panName + "</div>"

            // 实例化点标记
            function addMarker() {
                marker = new AMap.Marker({
                    icon: "",
                    position: centerPoint ,
                    offset: new AMap.Pixel(-13, -30)// // 设置了 icon 以后，设置 icon 的偏移量，以 icon 的 [center bottom] 为原点
                });
                // 设置label标签
                // label默认蓝框白底左上角显示，样式className为：amap-marker-label
                marker.setLabel({
                    //修改label相对于maker的位置
                    offset: new AMap.Pixel(-50, -20),
                    content: content
                });
                marker.setMap(map);
            }
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
                    search(t[0])
                    liClick()


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
                        $(".tagStyle").first().trigger("click"))
                }),
                    $(".tagStyle").on("click", function() {
                            d = $(this).text(),
                            c = $(this).data("index"),
                            u = $(this).data("length"),
                            $("#mapListContainer").html(""),
                            $(".loading").show(),
                        $(this).hasClass("select") || ($(this).parent().find(".select").removeClass("select"),
                            $(this).addClass("select"),
                            search(d)
                          )
                    })
            }

            // 周边搜索
            function search(type) {
                map.clearMap();
                AMap.service(["AMap.PlaceSearch"], function() {
                    //构造地点查询类
                    var placeSearch = new AMap.PlaceSearch({
                        type: type, // 兴趣点类别
                        pageSize: 10, // 单页显示结果条数
                        pageIndex: 1, // 页码
                        city: "", // 兴趣点城市
                        citylimit: true,  //是否强制限制在设置的城市内搜索
                        map: map, // 展现结果的地图实例
                        panel: "mapListContainer", // 结果列表将在此容器中进行展示。
                        autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
                    });
                    placeSearch.searchNearBy('', centerPoint, 2000, function(status, result) {
                        if(result.info =='OK'){
                            var count = result.poiList.count;
                            if(count<=10){
                                $('.amap_lib_placeSearch_page').hide();
                            }
                        }
                        addMarker();
                        $('.loading').remove();

                        if(flag){
                            $('.aroundType li').eq(0).click();
                            flag = false;
                        }
                    });
                });
            }

        }
    };
    it.initMap();
});