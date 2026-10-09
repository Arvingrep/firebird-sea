$(function(){

	$('.buss-list li:nth-child(3n)').css('margin-right','0')
	$('.rightBox li:last-child').css('margin-right','0')

    // 鼠标经过切换地址
    $('.switch-addr').hover(function () {
		$('.switch-show').show();
        
    },function () {
        $('.switch-show').hide();
    });
    // 鼠标经过排序
    $('.paixu').hover(function () {
        $('.nav').show();
        
    },function () {
        $('.nav').hide();
    });
    //排序点击
    $('.left-order .paixu a ').click(function(){
        $('.left-order .xiao-a').removeClass('red');
        $('.paixu').removeClass('grey')
        var txt=$(this).text();
        $('.paixu em').text(txt)
        var uid = $(this).data("id");
        orderby = uid;
        spage = 1;
        getList();
    })

    //销量点击
    $('.left-order .xiao-a').click(function(){
        $(this).addClass('red');
        $('.paixu').addClass('grey');
        $('.paixu em').text(langData['waimai'][2][88]);//默认排序
        var uid = $(this).data("id");
        orderby = uid;
        spage = 1;
        getList();
    })

    //商家分类点击
    $('.type_dd a ').click(function(){
        $(this).addClass('curr').siblings('').removeClass('curr');
        var uid = $(this).data("id");
        typeid = uid;
        spage = 1;
        getList();
    })
    //右侧筛选条件点击
    $('.right-choose li').click(function(){
        $(this).toggleClass('active');
        var datachose = [];
        //循环遍历已选中的属性
        $('.right-choose .active').each(function(){
            var typeinfo = $(this).attr("data-type");
            datachose.push(typeinfo+'=1')
        })
        spage = 1;
        getList(datachose.join('&'));

    })

    $('#searchBox .doSearch ').click(function(){
        $('#searchForm').submit();
    })

    var utils = {
        canStorage: function(){
            if (!!window.localStorage){
                return true;
            }
            return false;
        },
        setStorage: function(a, c){
            try{
                if (utils.canStorage()){
                    localStorage.removeItem(a);
                    localStorage.setItem(a, c);
                }
            }catch(b){
                if (b.name == "QUOTA_EXCEEDED_ERR"){
                    alert("您开启了秘密浏览或无痕浏览模式，请关闭");
                }
            }
        },
        getStorage: function(b){
            if (utils.canStorage()){
                var a = localStorage.getItem(b);
                return a ? JSON.parse(localStorage.getItem(b)) : null;
            }
        },
        removeStorage: function(a){
            if (utils.canStorage()){
                localStorage.removeItem(a);
            }
        },
        cleanStorage: function(){
            if (utils.canStorage()){
                localStorage.clear();
            }
        }
    };
    



    var localData = utils.getStorage('waimai_local');
    if(localData){
        lat = localData.lat;
        lng = localData.lng;
        $('.header-address  em').html(localData.address);

        getList();
    }else{
        // 百度地图
        if (site_map == 'baidu') {
            var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function(r){
            if(this.getStatus() == BMAP_STATUS_SUCCESS){
                lat = r.point.lat;
                    lng = r.point.lng;

                    var geoc = new BMap.Geocoder();
                    geoc.getLocation(r.point, function(rs){
                        var rs = rs.addressComponents;
                        $('.header-address em').html(rs.district + rs.street + rs.streetNumber)
                    });

                    getList();
            }
            else {
                alert('failed'+this.getStatus());
            }
        },{enableHighAccuracy: true})

            // 谷歌地图
            }else if (site_map == 'google') {

                if (navigator.geolocation) {

                    //获取当前地理位置
                    navigator.geolocation.getCurrentPosition(function(position) {
                            var coords = position.coords;
                            lat = coords.latitude;
                            lng = coords.longitude;

                            //指定一个google地图上的坐标点，同时指定该坐标点的横坐标和纵坐标
                            var latlng = new google.maps.LatLng(lat, lng);
                            var geocoder = new google.maps.Geocoder();
                            geocoder.geocode( {'location': latlng}, function(results, status) {
                                    if (status == google.maps.GeocoderStatus.OK) {
                                            var time = Date.parse(new Date());
                                            var resultArr = results[0].address_components, address = "";

                                            for (var i = 0; i < resultArr.length; i++) {
                                                var type = resultArr[i].types[0] ? resultArr[i].types[0] : 0;
                                                if (type && type == "street_number") {
                                                    address = resultArr[i].short_name;
                                                }
                                                if (type && type == "route") {
                                                    address += " " + resultArr[i].short_name;
                                                }
                                            }

                                            utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': address}));
                                            $('.header-address  em').html(address);
                                            getList();

                                    } else {
                                        alert('Geocode was not successful for the following reason: ' + status);
                                    }
                            });

                    }, function getError(error){
                            switch(error.code){
                                case error.TIMEOUT:
                                         alert(langData['siteConfig'][22][100]);
                                         break;
                                case error.PERMISSION_DENIED:
                                         alert(langData['siteConfig'][22][101]);
                                         break;
                                case error.POSITION_UNAVAILABLE:
                                         alert(langData['siteConfig'][22][102]);
                                         break;
                                default:
                                         break;
                            }
                 })
             }else {
                alert(langData['waimai'][3][72]);//不支持
             }
            }


    }
    //获取历史搜索地图的记录   
    var addressData = utils.getStorage('wm_history_local');
    console.log(addressData)
    if(addressData){
        var aLen= addressData.length;
        var addressList=[];
        if(aLen<3){

            for(var a = 0; a < aLen; a++){
            addressList.push('<li><a href="javascript:;">'+addressData[a]+'</a></li>'); 
            }
        }else{

            addressList.push('<li><a href="javascript:;">'+addressData[aLen-1]+'</a></li>'); 
            addressList.push('<li><a href="javascript:;">'+addressData[aLen-2]+'</a></li>'); 
            addressList.push('<li><a href="javascript:;">'+addressData[aLen-3]+'</a></li>'); 
        }   
        $('.switch-show ul').append(addressList.join(''));
    }
    

    var history_local = 'wm_history_local';
    var map;

    if(site_map === "baidu"){
        map = new BMap.Map("map");
    }
    //提交搜索
    function check(){
        var keywords = $.trim($(".header-address em").text());

        //记录搜索历史
        var history = utils.getStorage(history_local);
        history = history ? history : [];
        if(history && history.length >= 10 && $.inArray(keywords, history) < 0){
            history = history.slice(1);
        }

        // 判断是否已经搜过
        if($.inArray(keywords, history) > -1){
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
                onSearchComplete: function(results){
                    // 判断状态是否正确
                    if (local.getStatus() == BMAP_STATUS_SUCCESS){
                        var point = results.getPoi(0).point;
                        var time = Date.parse(new Date());
                        utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': point.lng, 'lat': point.lat, 'address': keywords}));
                        location.href = 'list.html?local=manual';
                    }else{
                        alert(langData['siteConfig'][20][431]);//您选择地址没有解析到结果
                    }
                }
            };
            var local = new BMap.LocalSearch(map, options);
            local.search(keywords);

        }else if (site_map == "google") {

            geocoder = new google.maps.Geocoder();
            geocoder.geocode({'address': keywords}, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var locations = results[0].geometry.location;
                    lng = locations.lng(), lat = locations.lat();
                    if (lng && lat) {
                        var time = Date.parse(new Date());
                        utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': keywords}));
                        location.href = 'list.html?local=manual';

                    }else{
                        alert(langData['siteConfig'][20][431]);//您选择地址没有解析到结果
                    }
                }
            });

        }else if (site_map == "qq") {

        }else if (site_map == "amap") {

            AMap.plugin('AMap.Geocoder',function(){//回调函数
                var geocoder = new AMap.Geocoder;
                geocoder.getLocation(keywords, function(status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        var lng = lat = "";
                        //地理编码结果数组
                        var geocode = result.geocodes[0];
                        lng = geocode.location.getLng();
                        lat = geocode.location.getLat();

                        var time = Date.parse(new Date());
                        utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': keywords}));
                        location.href = 'list.html?local=manual';
                    }else{
                        alert(langData['siteConfig'][20][431]);//您选择地址没有解析到结果
                    }
                });
            });



        }


    }
    //点击历史记录
    $('.history a').bind('click', function(){
        var t = $(this), txt = t.text();
        $(".header-address em").text(txt)
        check();
    });

    var isload = false;
        //获取店铺列表
    function getList(a){

        isload = true;

        if(spage == 1){
            $('.main-list .store_ul').html('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');//加载中，请稍候
        }else{
            $('.main-list .store_ul').append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');//加载中，请稍候
        }

        $.ajax({
            url: '/include/ajax.php?service=waimai&action=shopList&'+a,
            data: {
                typeid: typeid,
                orderby: orderby,
                yingye: yingye,
                lng: lng,
                lat: lat,
                page: spage,
                pageSize: pageSize
            },
            type: 'get',
            dataType: 'json',
            success: function(data){

                if(data.state == 100){
                    var list = [],html2=[];
                    $('.main-list .store_ul .loading').remove();

                    if(data.info.pageInfo.totalPage < spage){
                        if(spage == 1){
                          $('.main-list .store_ul').html('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');//暂无相关信息！
                        }else {
                          $('.main-list .store_ul').append('<div class="loading">'+langData['siteConfig'][20][185]+'</div>');//已加载完全部信息！
                        }
                        return false;
                    }

                    var info = data.info.list;
                    for(var i = 0; i < info.length; i++){
                        var d = info[i];

                        // 不是默认排序隐藏休息中的店铺
                        if(orderby != 1 && orderby != '' && d.yingye != 1){
                          continue;
                        }
                        var pin = '';
                        if(d.recBrand ==1){//判断是否是品牌
                            pin = '<i class="icon_pin"></i>';
                        }

                        list.push('<li class="store_li fn-clear">')
                        list.push('<div class="left-pic"><a href="'+d.url+'" target="_blank"><img src="'+d.pic+'" alt="'+d.shopname+'" onerror="this.src=\'/static/images/shop.png\'">'+pin+'</a></div>');
                        list.push('<div class="mid-con fn-left">');
                        list.push('<h3 class="buss-name"><a href="'+d.url+'" target="_blank">'+d.shopname+'</a></h3>');
                        list.push('<p class="rank_star">');
                        if(d.star > 0){                        
                            list.push('<span class="judge-star"><s style="width:'+(d.star/5)*100+'%"></s></span>');
                        }
                        
                        list.push('<span class="score">'+(d.star > 0 ? d.star : langData['waimai'][2][4])+'</span>');//暂无评分
                        list.push('<span class="sale">'+langData['waimai'][2][5].replace('1', d.sale)+'</span>');//已售
                        list.push('</p>');
                        list.push('<div class="move-info">');
                        list.push('<p class="send-info">');
                        if (d.delivery_time=="") {

                            var fz = langData['waimai'][2][119];
                        }else{
                           var fz =  langData['waimai'][2][11];
                        }
                      	
                       var txt = '';
                       if(d.delivery_fee>0){
                          txt = langData['waimai'][2][7]+':'+echoCurrency('symbol')+d.delivery_fee;
                        }else{
                          txt = '免配送费';
                        }
                        list.push('<span>'+langData['waimai'][2][6]+':'+echoCurrency('symbol')+d.basicprice+'</span><span>'+txt+' </span><span class="send-time"><i></i>'+d.delivery_time+fz+'</span>');//起送--配送费--分钟
                        list.push('</p>');

                        list.push('<p class="favorable">');
                        if(d.open_promotion == '1'){
                            list.push('<i class="icon_jian"></i>');
                        }
                        if(d.is_first_discount == '1'){
                            list.push('<i class="icon_shou"></i>');
                        }
                        if(d.zkproduct != '0'){
                            list.push('<i class="icon_zhe"></i>');
                        }
                        
                        if(d.open_fullcoupon == '1'){//判断是否有返现
                            list.push('<i class="icon_fan"></i>');
                        }
                        list.push('</p>');
                        list.push('</div>');

                        if(d.yingye != 1){
                            yingye = '<a href="javascript:;" class="break">'+langData['waimai'][2][102]+'</a>';//休息中
                        }else{
                            yingye = '<a href="'+d.url+'" class="see">'+langData['waimai'][8][77]+'</a>';//进店看看
                        }
                        list.push(yingye);
                        list.push('</div>');
                        list.push('<div class="right-con fn-right">');
                        list.push('<ul class="goods_ul fn-clear" data-url="'+d.url+'">');
                        $.ajax({

                                url: "/include/ajax.php?service=waimai&action=food&shop="+d.id+"",
                                type: "POST",
                                async: false,
                                dataType: "json",
                                success: function (data) {
                                    var html=[];
                                    if(data && data.state == 100){                                                   
                                        var list2 = data.info; 
                                        var len =  (list2.length>3)?3:list2.length;
                                        for(var j = 0; j < len; j++){ 

                                            var pic = list2[j].pics != "" && list2[j].pics != undefined ? huoniao.changeFileSize(list2[j].pics[0], "small") : "/static/images/404.jpg";
                                           
                                            html.push('     <li class="food_li">');
                                            html.push('         <div class="goods-pic"><img src="'+pic+'" alt=""></div>');
                                            html.push('             <p class="goods_title">'+list2[j].title+'</p>');
                                            html.push('     </li>');                                                                                      
                                        }                                                                         
                                    }else{
                                        html=[];
                                    }
                                    html2=html.join(""); 
                                }
                            })
                        list.push(html2);
                        list.push('     </ul>'); 
                        
                        list.push('</div>');
                        list.push('</li>');
                    }

                    if(spage == 1){
                        $('.main-list .store_ul').html(list.join(''));
                    }else{
                        $('.main-list .store_ul').append(list.join(''));
                    }

                    isload = false;
                    spage++;

                }else{
                    $('.main-list .store_ul .loading').html(data.info);
                }

            },
            error: function(){
                $('.main-list .store_ul .loading').html(langData['siteConfig'][20][227]);
            }
        })

    }
    $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var scroll = allh - w - 100;
        if ($(window).scrollTop() > scroll && !isload) {
            getList();
        };
    });

    //菜品点击
    $('.main-list').delegate('.food_li','click',function(){
        t=$(this),storeUrl=t.parent('.goods_ul').data('url');
        location.href=storeUrl;
        return false;
    })


})
