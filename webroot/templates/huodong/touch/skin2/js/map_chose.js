$(function () {
    // 地图坐标 ------------------------- s
    //页面定位失败时 取默认坐标
    var ulocal = utils.getStorage('user_local');

    $("#map .lead p").bind("click", function () {
        $(".pageitem").hide();
        $('.gz-address').show();
    });
    var lng, lat;
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
    let formData_infoData = JSON.parse(localStorage.getItem('formData_infoData')); //表单数据
    if (formData_infoData) {
        console.log(formData_infoData)
        for (let key in formData_infoData) {
            let value = formData_infoData[key];
            let newKey = key.replace(/_val([\s\S]*)/gi, '').replace(/_html([\s\S]*)/gi, ''); //key用于判断，newkey用于赋值
            if (key.includes('_val')) { //.val()操作
                switch (newKey) {
                    case '#baoming': {
                        $('.formwrap .turn').attr('class', `turn ${value == 1 ? 'open' : 'close'}`);
                        $('.baomingend').hide();
                        break;
                    }
                    case "#sign": {
                        $('.inpbox dd .radioBox').eq(0).find('label').eq(!Number(value)).find('input').prop('checked', true);
                        $(newKey).val(value);
                        break;
                    }
                    case '#fee': {
                        if (value == 1) {
                            $('.inpbox dd .radioBox').eq(1).find('label').eq(0).find('input').prop('checked', true);
                            $('.ml4r.bbottom.max').addClass('fn-hide');
                            $('.fee_body').removeClass('fn-hide');
                        }
                        $(newKey).val(value);
                        break;
                    }
                    case ".fee_body input": {
                        let length = value.length; //inpt个数，除以3就是行数
                        let newLength = (length / 3) - $(".fee_item").length;
                        for (let i = 0; i < newLength; i++) {
                            $('#feeAdd').click();
                        }
                        for (let i = 0; i < length; i++) {
                            $(newKey).eq(i).val(value[i]);
                        }
                        break;
                    }
                    case ".check-left input[type=checkbox]": {
                        let length = value.length; //inpt个数，除以3就是行数
                        for (let i = 0; i < length; i++) {
                            $(newKey).eq(i).prop('checked', value[i]);
                        }
                        break;
                    }
                    case '#join_ol .inpbox dt input': {
                        let length = value.length; //inpt个数，除以3就是行数
                        for (let i = 0; i < length; i++) {
                            $(newKey).eq(i).val(value[i]);
                        }
                        break;
                    }
                    default: {
                        $(newKey).val(value);
                    }
                }
            } else if (key.includes('_html')) { //.html操作
                switch (newKey) {
                    case '.thumbnail': {
                        if (value) {
                            fileCount = 1;
                            updateStatus();
                            let html = `<li id="WU_FILE_0" class="thumbnail">${value}</li>`;
                            $('#fileList').append(html);
                            $('#litpic').val($(`${newKey} img`).attr('data-val'));
                        }
                        break;
                    }
                    default: {
                        $(newKey).html(value);
                    }
                }
            }
        }
        localStorage.removeItem('formData_infoData');
    }
    $(".detail_addr").click(function () {
        // 2023.12.21修改
        let formData = { //表单数据
            //属性名字规则:jq元素+操作名字。如$('.a .b').eq()=>.a .b(元素名)_eq(类名和操作名) 
            //采用以上命名规则是为了还原操作方便
            '.thumbnail_html': $('.thumbnail').html(),
            '#typeid_dummy_val': $('#typeid_dummy').val(),
            '#title_val': $('#title').val(),
            '#began_val': $('#began').val(),
            '#end_val': $('#end').val(),
            '#baoming_val': $('#baoming').val(),
            '#baomingend_val': $('#baomingend').val(),
            '.selgroup p_html': $('.selgroup p').html(),
            '#addrid_val': $('#addrid').val(),
            '#body_val': $('#body').val(),
            '#sign_val': $('#sign').val(),
            '#fee_val': $('#fee').val(),
            '.fee_body input_val': [],
            '#max_val': $('#max').val(),
            '#join_ol_html': $('#join_ol').html(),
            ".check-left input[type=checkbox]_val": [],
            "#join_ol .inpbox dt input_val": [],
            '.code_label_html': $('.code_label').html(),
            '#areaCode_val': $('#areaCode').val(),
            '#contact_val': $('#contact').val()
        };
        for (let i = 0; i < $('.fee_body input').length; i++) {
            let value = $('.fee_body input').eq(i).val();
            formData['.fee_body input_val'].push(value);
        }
        for (let i = 0; i < $('.check-left input[type=checkbox]').length; i++) {
            let value = $('.check-left input[type=checkbox]').eq(i).is(':checked');
            formData['.check-left input[type=checkbox]_val'].push(value);
        }
        for (let i = 0; i < $('#join_ol .inpbox dt input').length; i++) {
            let value = $('#join_ol .inpbox dt input').eq(i).val();
            formData['#join_ol .inpbox dt input_val'].push(value);
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
        localStorage.setItem('formData_infoData', JSON.stringify(formData));
        localStorage.setItem('infoData', JSON.stringify(arrData));
        location.href = addAddress.replace(masterDomain,'');
        return false
        $(this).parents('.gz-address').hide();
        if ($("#lnglat").val() != "") {
            var lnglat = $("#lnglat").val().split(",");
            lng = lnglat[0];
            lat = lnglat[1];
            mapdraw()
        } else {
            //第一次进入自动获取当前位置
            HN_Location.init(function (data) {
                console.log(data)
                if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
                    //alert(langData['siteConfig'][27][137])   /* 定位失败，请重新刷新页面！ */
                    if (ulocal) {
                        lng = ulocal.lng;
                        lat = ulocal.lat;
                        mapdraw()
                    } else {
                        lng = siteCityInfo_lng;
                        lat = siteCityInfo_lat;
                        mapdraw()
                    }

                } else {
                    lng = data.lng;
                    lat = data.lat;
                    mapdraw()

                }
            });
        }
        $(".pageitem").hide();
        $('#map').show();


    });
    function mapdraw() {
        //百度
        if (site_map == 'baidu') {
            var myGeo = new BMap.Geocoder();

            if (lng && lat) {
                //定位地图
                map = new BMap.Map("mapdiv");
                var mPoint = new BMap.Point(lng, lat);
                map.centerAndZoom(mPoint, 16);
                getLocation(mPoint);

                map.addEventListener("dragend", function (e) {
                    getLocation(e.point);
                });
            }

            //关键字搜索
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
                                    lng = results.getPoi(i).point.lng;
                                    lat = results.getPoi(i).point.lat;
                                    //$("#local strong").html(_value.business);
                                    $("#lnglat").val(lng + ',' + lat);
                                    $(".pageitem").hide();
                                    $('.gz-address').show();
                                    $('#address').val(_value.business);
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
                    if (allPois == null || allPois == "") {
                        return;
                    }
                    var list = [];
                    for (var i = 0; i < allPois.length; i++) {
                        list.push('<li data-lng="' + allPois[i].point.lng + '" data-lat="' + allPois[i].point.lat + '"><h5>' + allPois[i].title + '</h5><p>' + allPois[i].address + '</p></li>');
                    }

                    if (list.length > 0) {
                        $(".mapresults ul").html(list.join(""));
                        $(".mapresults").show();
                    }

                }, {
                    poiRadius: 1000,  //半径一公里
                    numPois: 50
                });
            }
            //高德
        } else if (site_map == 'amap') {

            var map = new AMap.Map('mapdiv', { zoom: 14 });
            console.log(lng, lat)
            if (lng && lat) {
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
                    lng = lnglat['lng'];
                    lat = lnglat['lat'];
                    console.log(lnglat);
                    s();
                });

                AMap.event.addListener(map, "dragend", function (status, result) {
                    lnglat = map.getCenter();
                    lng = lnglat['lng'];
                    lat = lnglat['lat'];
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

                    //$("#local strong").html(r);
                    $("#lnglat").val(lng + ',' + lat);
                    $(".pageitem").hide();
                    $('.gz-address').show();
                    $('#address').val(r);
                });
            });
            //天地图
        } else if (site_map == 'tmap') {

            var myGeo = new T.Geocoder();

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

            // 谷歌地图
        } else if (site_map == "google") {
            if ($("#lnglat").val() != "") {
                var lnglat = $("#lnglat").val().split(",");
                lng = lnglat[0];
                lat = lnglat[1];
            }
            if (lng && lat) {
                businessgooleMap(lng, lat);
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

});
