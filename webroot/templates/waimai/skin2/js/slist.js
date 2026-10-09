$(function(){
	$('.main-slist .store_bottom dl:last-child').css('border-bottom','0');
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
        $('.location a').html(localData.address);
    if (lat != "" && lng != "") {
      getList();
    }

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
                        $('.location a').html(rs.district + rs.street + rs.streetNumber)
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
                                            utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': results[0].formatted_address}));
                                            $('.location a').html(results[0].formatted_address);
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
                alert(langData['waimai'][3][72])
             }
            }
    }
    // getList();
    var isload = false;
    //获取店铺列表
    function getList(){

        isload = true;

        if(spage == 1){
            $('.main-slist ul').html('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');//加载中，请稍候
        }else{
            $('.main-slist ul').append('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');//加载中，请稍候
        }

        $.ajax({
            url: '/include/ajax.php?service=waimai&action=shopList',
            data: {
                orderby: orderby,
                lng: lng,
                lat: lat,
                keywords: keywords,
                page: spage,
                pageSize: pageSize
            },
            type: 'get',
            dataType: 'json',
            success: function(data){

                if(data.state == 100){
                    var list = [],html2=[];
                    $('.main-slist ul .loading').remove();

                    if(data.info.pageInfo.totalPage < spage){
                        if(spage == 1){
                          $('.main-slist ul').html('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');//暂无相关信息！
                        }else {
                          $('.main-slist ul').append('<div class="loading">'+langData['siteConfig'][20][185]+'</div>');//已加载完全部信息！
                        }
                        return false;
                    }

                    var info = data.info.list;
                    for(var i = 0; i < info.length; i++){
                        var d = info[i];

                        list.push('<li>')
                        list.push('<div class="store_top">')
                        list.push('<div class="store_pic"><img src="'+d.pic+'" alt="'+d.shopname+'" onerror="this.src=\'/static/images/shop.png\'"></div>');
                        list.push('<div class="store_con">');
                        list.push('<div class="con_top">');
                        list.push('<h3><a href="'+d.url+'">'+d.shopname+'</a></h3>');
                        list.push('<p class="favorable">');
                        if(d.open_promotion == '1'){
                            list.push('<i class="icon_jian"></i>');
                        }
                        if(d.is_first_discount == '1'){
                            list.push('<i class="icon_shou"></i>');
                        }
                        if(d.is_discount == '1'){
                            list.push('<i class="icon_zhe"></i>');
                        }
                        
                        //if(){//判断是否有返现
                            list.push('<i class="icon_fan"></i>');
                        //}
                        list.push('</p>');
                        list.push('</div>');
                        list.push('<div class="con_bot">');
                        list.push('<p class="rank_star">');
                        list.push('<span class="judge-star"><s style="width:'+(d.star/5)*100+'%"></s></span>');
                        list.push('<span class="score">'+(d.star > 0 ? d.star : langData['waimai'][2][4])+'</span>');//暂无评分
                        list.push('</p>');
                        list.push('<p class="send-info">');
                      if(d.delivery_fee>0){
                          txt = langData['waimai'][2][7]+':'+echoCurrency('symbol')+d.delivery_fee;
                        }else{
                          txt = '免配送费';
                        }
                        list.push('<span>'+langData['waimai'][2][6]+':'+echoCurrency('symbol')+d.basicprice+'</span><span>'+txt+' </span>');//起送--配送费--分钟
                        //list.push('<span>'+langData['waimai'][2][6]+':￥'+d.basicprice+'</span><span>'+langData['waimai'][2][7]+':￥'+d.delivery_fee+' </span>');//起送 -- 配送费
                        list.push('</p>');                        
                        list.push('</div>');
                        list.push('</div>');
                        list.push('</div>');


                        list.push('<div class="store_bottom" data-url="'+d.url+'">');
                        $.ajax({

                                url: "/include/ajax.php?service=waimai&action=food&shop="+d.id+"",
                                type: "POST",
                                async: false,
                                dataType: "json",
                                success: function (data) {
                                    var html=[];
                                    if(data && data.state == 100){                                                   
                                        var list2 = data.info; 
                                        var foodLen =  (list2.length>3)?3:list2.length;
                                        for(var j = 0; j < foodLen; j++){                                           
                                            html.push('<dl class="fn-clear">');
                                            html.push('<dt>'+list2[j].title+'</dt>');
                                            html.push('<dd>');
                                            html.push('<span class="food_price">'+echoCurrency('symbol')+((list2[j].price*1).toFixed(2))+'</span><a href="javascript:;" class="go_buy">'+langData['waimai'][8][79]+'</a><span class="month_sale">'+langData['waimai'][8][80]+'<em>'+list2[j].sale+'</em>'+langData['waimai'][7][41]+'</span>');//去购买 --月售 -- 份 
                                            html.push('</dd>');
                                            html.push('</dl>');
                                       }                                                                               
                                    }else{
                                        html=[];
                                    }
                                    html2=html.join(""); 
                                }
                            })
                        list.push(html2);                     
                        list.push('</div>');
                        list.push('</li>');
                    }

                    if(spage == 1){
                        $('.main-slist ul').html(list.join(''));
                    }else{
                        $('.main-slist ul').append(list.join(''));
                    }

                    isload = false;
                    spage++;

                }else{
                    $('.main-slist ul .loading').html(data.info);
                }

            },
            error: function(){
                $('.main-slist ul .loading').html(langData['siteConfig'][20][227]);
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
    $('.main-slist').delegate('.go_buy','click',function(){
        t=$(this),storeUrl=t.parents('.store_bottom').data('url');
        location.href=storeUrl;
        return false;
    })

    //搜索菜品的字段    
    //获取url中的参数
    function getUrlParam(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = window.location.search.substr(1).match(reg);
      if ( r != null ){
         return decodeURI(r[2]);
      }else{
         return null;
      }
    }
    var foodkeywords = decodeURI(getUrlParam('keywords'));
    if(foodkeywords == '' || foodkeywords == undefined || foodkeywords == null){
        $('.search_result').hide();
    }else{
        $('.search_result em').text(foodkeywords);
    }
    


})
