var history_local = 'wm_history_local';
var map;

if(site_map === "baidu"){
    map = new BMap.Map("map");
}

$(".inpbox").width($(window).width()-$(".location_input .currCity").width()-14)
//提交搜索
function check(){
    var keywords = $.trim($("#keywords").val());

    //记录搜索历史
    var history = utils.getStorage(history_local);
    console.log(history)

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

    if (site_map == "baidu") {

        var options = {
            onSearchComplete: function(results){
                // 判断状态是否正确
                if (local.getStatus() == BMAP_STATUS_SUCCESS){
                    var point = results.getPoi(0).point;
                    var time = Date.parse(new Date());
                    utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': point.lng, 'lat': point.lat, 'address': keywords}));
                    //历史搜索存储
                    history.push({'lng': point.lng, 'lat': point.lat, 'keywords': keywords})
                    utils.setStorage(history_local, JSON.stringify(history));

                    location.href = 'index.html?local=manual&currentPageOpen=1';
                }else{
                    alert(langData['siteConfig'][20][431]);
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
                    //历史搜索存储
                    history.push({'lng': lng, 'lat': lat, 'keywords': keywords})
                    utils.setStorage(history_local, JSON.stringify(history));

                    location.href = 'index.html?local=manual&currentPageOpen=1';

                }else{
                    alert(langData['siteConfig'][20][431]);
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
                    //历史搜索存储
                    history.push({'lng': lng, 'lat': lat, 'keywords': keywords})
                    utils.setStorage(history_local, JSON.stringify(history));

                    location.href = 'index.html?local=manual&currentPageOpen=1';
                }else{
                    alert(langData['siteConfig'][20][431]);  /* 您选择地址没有解析到结果*/
                }
            });
        });



    }


}


$(function(){

    //加载历史记录
    var hlist = [];
    var history = utils.getStorage(history_local);
    if(history){
        history.reverse();
        for(var i = 0; i < history.length; i++){
            if(history[i].lng){
                hlist.push('<li><a href="javascript:;" data-lng="'+history[i].lng+'"  data-lat="'+history[i].lat+'">'+history[i].keywords+'</a></li>');
            }
            
        }
        $('.history ul').html(hlist.join(''));
        $('.all_shan, .history').show();
    }

    //点击历史记录
    $('.history a').bind('click', function(){
        var t = $(this), txt = t.text();
       // $('#keywords').val(txt);
        var hlng = $(this).attr('data-lng');
        var hlat = $(this).attr('data-lat');
        if(hlng && hlat){
            selfCheck(hlng,hlat,txt);
        }
        utils.setStorage('localin', 1);   
    });

    //清空
    $('.all_shan').bind('click', function(){
        utils.removeStorage(history_local);
        $('.all_shan, .history').hide();
        $('.history ul').html('');
    });

    // 点击当前位置记录历史记录
    $(".relocal a").click(function(){
        var txt = $(this).text();
        //$('#keywords').val(txt);
        var alng = $(this).attr('data-lng');
        var alat = $(this).attr('data-lat');
        if(alng && alat){
            selfCheck(alng,alat,txt);
        }
    })
    function selfCheck(sLng,sLat,sKeywords){
        var time = Date.parse(new Date());
        utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': sLng, 'lat': sLat, 'address': sKeywords}));
        window.location.href = 'index.html?local=manual&currentPageOpen=1';
    }


    //定位当前位置
    $('.click').bind('click', function(){
        location();
    });

    location();

    function location(){
        $('.relocal a').text(langData['siteConfig'][7][4]+'..');  /* 定位中 */
        utils.setStorage('localin', 1);   
        HN_Location.init(function(data){
            if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
                $('.relocal a').html(''+langData['siteConfig'][27][136]+'');   /* 定位失败*/
                $('.loading').html(''+langData['siteConfig'][27][137]+'').show();   /* 定位失败，请重新刷新页面！ */
            }else{
                var lng = data.lng, lat = data.lat, name = data.name, page = 1;
                var time = Date.parse(new Date());
                $('.relocal a').html(name);
                $('.relocal a').attr('data-lng',lng);
                $('.relocal a').attr('data-lat',lat);
                utils.setStorage('waimai_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address':name}));
            }
        }, device.indexOf('huoniao') > -1 ? false : true);
        
    }

    if (site_map == "baidu") {
        var autocomplete = new BMap.Autocomplete({input: "keywords"});
        autocomplete.addEventListener("onconfirm", function(e) {
            console.log(e)
            var _value = e.item.value;
            myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business;
            $('#keywords').val(myValue);
            check();
        });
    }else if (site_map == "google") {

        var input = document.getElementById('keywords');
        var places = new google.maps.places.Autocomplete(input, {placeIdOnly: true});

        google.maps.event.addListener(places, 'place_changed', function () {
            var address = places.getPlace().name;
            $('#keywords').val(address);
            check();
        });

    }else if (site_map == "qq") {

    }else if (site_map == "amap") {
        AMap.plugin('AMap.Autocomplete',function(){//回调函数
            var autoOptions = {
                city: "", //城市，默认全国
                input: "keywords"//使用联想输入的input的id
            };
            var autocomplete= new AMap.Autocomplete(autoOptions);

            AMap.event.addListener(autocomplete, "select", function(data){
                $('#keywords').val(data.poi.district + data.poi.name);
                check();
            });
        });
    }

});
