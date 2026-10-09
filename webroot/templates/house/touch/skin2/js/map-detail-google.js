$(function () {
    var searchList = [
        {name: "公交", order: "1", key:'bus'},
        {name: "地铁", order: "6", key:'subway'},
        {name: "教育", order: "4", key:'kindergarten,primary-school,middle-school,University'},
        {name: "医院", order: "2", key:'hospital,pharmacy'},
        {name: "银行", order: "9", key:'bank'},
        {name: "美食", order: "5", key:'restaurant'},
        {name: "休闲", order: "7", key:'park,cinema'},
        {name: "购物", order: "3", key:'mall,supermarket,market'},
        {name: "健身", order: "8", key:'gym'}
];
    var map,centerPoint;
    var markers = [];

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



    init();
    function init(){
        centerPoint = new google.maps.LatLng(parseFloat(pageData.lat), parseFloat(pageData.lng));

        map = new google.maps.Map(document.getElementById('map-wrapper'), {
            zoom: 14,
            center: centerPoint,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL
            }
        });

        initNav(searchList);
        addcenMarker();
    }

    var centerwindow = new google.maps.InfoWindow({
        content: '<div style="font-weight: 700; font-size: 16px;">' + pageData.title + '</div>' + '<p style="line-height: 3em;">详细地址：' + pageData.address + '</p>'
    });
    // 添加中心点
    function addcenMarker() {
        var marker = new google.maps.Marker({
            position: centerPoint,
            map: map,
            title: pageData.panName,
            icon: cenicon,
        });
        // centerwindow.open(map, marker);
        // 中心点点击事件
        marker.addListener('click', function() {
            centerwindow.open(map, marker);
        });
    }

    infowindow = new google.maps.InfoWindow();

    //添加分类列表
    function initNav(arr) {
        var projectName = $(".periphery").attr("data-project");
        arr.forEach(function(item, index) {
            var value = item.name;
            var key = item.key
            var order = item.order;

            var curr = index == 0 ? ' active' : '';
            $(".periphery .nav-wrapper").append('<li class="nav-item post_ulog'+curr+'" data-evtid="10184" data-ulog="xinfangm_click=10158_' + order + '" data-type="' + value + '" data-index="' + index + '" data-key="'+ key +'">' + value + "<span></span></li>");
            nearBySearch(value, index, 0, key);
        });
    }

    $('.nav-wrapper').on('click', '.nav-item',function () {
        $(this).addClass("active");
        $(this).siblings().removeClass("active");
        var type = $(this).data('type');
        var key = $(this).data('key')
        nearBySearch(type, $(this).index(), 1,key);
    });
    // 创建标记点
    function createMarker(place) {
        // console.log(place);
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon:iconimg,
        });
        markers.push(marker);
        var infowindow = new google.maps.InfoWindow();
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

    //周边查找
    function nearBySearch(type,index,view,key) {
        deleteMarkers();
        var request = {
            location: centerPoint,
            radius: '2000',
            name:type,
            keyword:key
        };

        service = new google.maps.places.PlacesService(map);

        service.nearbySearch(request, function(results, status) {

            var li = $(".periphery .nav-wrapper").find('li:eq(' + index + ')');
            // console.log(li);
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    // console.log(results[i]);
                    if(index == 0 || view == 1) {
                        createMarker(results[i]);
                    }
                }
                var count = results.length;  //判断类别导航，如果有数据则添加数量，如果没有数据则隐藏该类别
                    if (count > 0) {
                        // li.find('span').html('(' + count + ')');
                    } else {
                        li.hide();
                    }


            }else {
                li.hide();
                $('.loading').hide();
                $("#mapListContainer").append('<div class="load">很抱歉，该配套下无相关内容，请查看其它配套</div>');
            }
        });
    }

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
	    var t = $(this), phone = t.data('phone');
	    if(phone){
	        $('.phone_frame p').text(phone).next('a').attr('href', 'tel:'+phone);
	    }
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

});
