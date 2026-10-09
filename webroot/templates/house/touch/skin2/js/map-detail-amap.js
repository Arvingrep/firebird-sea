$(function(){
    $('head').append('<style type="text/css">.amap_lib_placeSearch_poi{display: none;}.amap-pls-marker-tip{display: inline-block;box-shadow: 0 0 0.375rem 0 rgba(0,0,0,.2);text-align:center;border-radius: 1.46875rem;padding: 0 16px;}.amap-pls-marker-tip .title{margin: 0;}.amap-pls-marker-tip::after, .amap-pls-marker-tip::before {content: "";position: absolute;top: 125%;left: 50%;width:0;height:0;border-right:7px solid transparent;border-left:7px solid transparent;border-top:8px solid #fff;}</style>');
    // 位置周边
    var it = {
        initMap: function() {
            var searchList = [
                {name: "公交", order: "1"},
                {name: "地铁", order: "6"},
                {name: "教育", order: "4"},
                {name: "医院", order: "2"},
                {name: "银行", order: "9"},
                {name: "美食", order: "5"},
                {name: "休闲", order: "7"},
                {name: "购物", order: "3"},
                {name: "健身", order: "8"}
            ];

            var map, centerPoint, nums,obj;
            init();
            //初始化地图
            function  init() {
                var longitude = $("#map-wrapper").attr("data-lng");
                var latitude = $("#map-wrapper").attr("data-lat");
                map = new AMap.Map("map-wrapper",{
                    resizeEnable: true,
                    zoomEnable:false,
                    dragEnable: false,
                });
                centerPoint = [longitude,latitude];//中心点坐标
                //加载类别
                initNav(searchList);

                //自定义标记点


            }

            var nimarr =[];

            var operCount = 0;
            function initNav(arr) {
                var projectName = $(".periphery").attr("data-project");
                arr.forEach(function(item, index) {
                    var value = item.name;
                    var order = item.order;

                    var curr = index == 0 ? ' active' : '';
                    $(".periphery .nav-wrapper").append('<li class="nav-item post_ulog'+curr+'" data-evtid="10184" data-ulog="xinfangm_click=10158_' + order + '" data-type="' + value + '" data-index="' + index + '">' + value + "<span></span></li>");
                    search(value, index, 0);
                });
            }

            $('.nav-wrapper').on('click', '.nav-item',function () {
                $(this).addClass("active");
                $(this).siblings().removeClass("active");
                var type = $(this).data('type');
                search(type, $(this).index(), 1);
            });

            function search(type, index, view) {
                map.clearMap();
                AMap.service(["AMap.PlaceSearch"], function() {
                    //构造地点查询类
                    var placeSearch = new AMap.PlaceSearch({
                        type: type, // 兴趣点类别
                        pageSize: 10, // 单页显示结果条数
                        pageIndex: 1, // 页码
                        city: " ", // 兴趣点城市
                        citylimit: true,  //是否强制限制在设置的城市内搜索
                        map: map, // 展现结果的地图实例
                        autoFitView: true // 是否自动调整地图视野使绘制的 Marker点都处于视口的可见范围
                    });
                    placeSearch.searchNearBy('', centerPoint, 1000, function(status, result) {

                        operCount++;
                        var li = $(".periphery .nav-wrapper").find('li:eq(' + index + ')');

                        if(result.info == 'OK') {
                            var count = result.poiList.count;
                            if (count > 0) {
                                li.find('span').html('(' + count + ')');
                            } else {
                                li.hide();
                            }
                        }else{
                            li.hide();
                        }

                        //初始化地图时默认选择分类
                        if(searchList.length == operCount){
                            $('.nav-wrapper li:eq(0)').click();
                        }

                    });
                });

            }


        }
    };

    it.initMap();


    $('.markBox').find('a:first-child').addClass('curr');
    var swiper = new Swiper('.topSwiper .swiper-container', {pagination: {el: '.topSwiper .swiper-pagination',type: 'fraction',} ,autoplay: true,loop: true,grabCursor: true,paginationClickable: true,
        on: {
            slideChangeTransitionStart: function(){
                var len = $('.markBox').find('a').length;
                var sindex = this.activeIndex;
                if(len==1){
                    $('.markBox').find('a:first-child').addClass('curr');
                }else if(len==3){
                    if(sindex > 1){
                        $('.pmark').removeClass('curr');
                        $('.picture').addClass('curr');
                    }else if(sindex == 1){
                        $('.pmark').removeClass('curr');
                        $('.video').addClass('curr');
                    }else{
                        $('.pmark').removeClass('curr');
                        $('.panorama').addClass('curr');
                    }
                }else{
                    $('.pmark').removeClass('curr');
                    $('.pmark').eq((sindex > 1 && sindex < this.slides.length-1 ? 1 : 0)).addClass('curr');
                }

            },
        }
    });

	$('.appMapBtn').attr('href', OpenMap_URL);

     // 点击切换
    $(".pmark").click(function(){
        var t = $(this), index = t.index();
        $('.pmark').removeClass('curr');
        t.addClass('curr');
        swiper.slideTo(index+1)
    })

    //如果是安卓腾讯X5内核浏览器，使用腾讯TCPlayer播放器
    var player = document.getElementById('video'), videoWidth = 0, videoHeight = 0, videoCover = '', videoSrc = '', isTcPlayer = false;
    if(device.indexOf('MQQBrowser') > -1 && device.indexOf('Android') > -1 && player){
        videoSrc = player.getAttribute('src');
        videoCover = player.getAttribute('poster');
        var vid = player.getAttribute('id');

        videoWidth = $('#' + vid).width();
        videoHeight = $('#' + vid).height();

        $('#' + vid).after('<div id="tcPlayer"></div>');
        $('#' + vid).remove();
        document.head.appendChild(document.createElement('script')).src = '//imgcache.qq.com/open/qcloud/video/vcplayer/TcPlayer-2.2.2.js';
        isTcPlayer = true;
    }


    // 图片放大
    var videoSwiper = new Swiper('.videoModal .swiper-container', {pagination: {el:'.videoModal .swiper-pagination',type: 'fraction',},loop: false})
    $(".topSwiper").delegate('.topcomm', 'click', function() {
        var imgBox = $('.topSwiper .swiper-slide');
        var i = $(this).index();
        $(".videoModal").addClass('vshow');
        $('.markBox').toggleClass('show');
        videoSwiper.slideTo(i-1, 0, false);

        //安卓腾讯X5兼容
        if(player && isTcPlayer){
            new TcPlayer('tcPlayer', {
                "mp4": videoSrc, //请替换成实际可用的播放地址
                "autoplay" : false,  //iOS下safari浏览器，以及大部分移动端浏览器是不开放视频自动播放这个能力的
                "coverpic" : videoCover,
                "width" :  videoWidth,  //视频的显示宽度，请尽量使用视频分辨率宽度
                "height" : videoHeight  //视频的显示高度，请尽量使用视频分辨率高度
            });
        }

        return false;
    });

    $(".vClose").bind('click', function() {
        var video = $('.videoModal').find('video').attr('id');
        if(player && isTcPlayer){
            $('#tcPlayer').html('');
        }else{
            $(video).trigger('pause');
        }

        $(this).closest('.videoModal').removeClass('vshow');
        $('.videoModal').removeClass('vshow');
        $('.markBox').removeClass('show');
        return false;
    });



    // 点击微信
    $('.im_icon .im_wx').click(function(){
        $('.wx_frame').show();
        $('.desk').show();
    });
    $('.wx_frame .wx_cuo').click(function(){
        $('.wx_frame').hide();
        $('.desk').hide();
    });

    // 点击qq
    $('.im_icon .im_qq').click(function(){
        $('.qq_frame').show();
        $('.desk').show();
    });
    $('.qq_frame .qq_cuo').click(function(){
        $('.qq_frame').hide();
        $('.desk').hide();
    });

    // 点击电话
    $('.im_icon .im_iphone').click(function(){
        $('.phone_frame').show();
        $('.desk').show();
    });
    $('.phone_frame .phone_cuo').click(function(){
        $('.phone_frame').hide();
        $('.desk').hide();
    });

    // 点击收藏
    $('.follow-wrapper').click(function(){

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            location.href = masterDomain + '/login.html';
            return false;
        }

        var t = $(this), type = '';
        if(t.find('.follow-icon').hasClass('active')){
            t.find('.follow-icon').removeClass('active');
            t.find('.text-follow').text('收藏');
            type = 'del';
        }else{
            t.find('.follow-icon').addClass('active');
            t.find('.text-follow').text('已收藏');
            type = 'add';
        }
        $.post("/include/ajax.php?service=member&action=collect&module=house&temp="+page_type+"_detail&type="+type+"&id="+pageData.id);
    });

})
