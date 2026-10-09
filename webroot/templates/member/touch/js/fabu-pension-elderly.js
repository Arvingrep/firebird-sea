$(function () {

    //照护对象
    function getType() {
        //照护对象
        $.ajax({
            type: "POST",
            url: masterDomain + "/include/ajax.php?service=pension&action=pensionitem&type=1&value=1",
            dataType: "jsonp",
            success: function (res) {
                if (res.state == 100 && res.info) {
                    var eduSelect = new MobileSelect({
                        trigger: '.targetcare',
                        title: '',
                        wheels: [
                            { data: res.info }
                        ],
                        position: [0, 0],
                        callback: function (indexArr, data) {
                            $('#targetcarename').val(data[0]['value']);
                            $('#targetcare').val(data[0]['id']);
                            $('.targetcare .choose span').hide();
                        }
                        , triggerDisplayData: false,
                    });
                }
            }
        });
        //养老形式
        $.ajax({
            type: "POST",
            url: masterDomain + "/include/ajax.php?service=pension&action=catid_type&value=1",
            dataType: "jsonp",
            success: function (res) {
                if (res.state == 100 && res.info) {
                    var ageSelect = new MobileSelect({
                        trigger: '.catid',
                        title: '',
                        wheels: [
                            { data: res.info }
                        ],
                        position: [0, 0],
                        callback: function (indexArr, data) {
                            $('#catname').val(data[0]['value']);
                            $('#catid').val(data[0]['id']);
                            $('.catid .choose span').hide();
                        }
                        , triggerDisplayData: false,
                    });
                }
            }
        });
    }

    getType();

    //性别
    $('body').on('click', '.user_sex .active', function () {
        $(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
        $('#sex').val($(this).find('a').data('id'));
    });
    //入住形式
    $('body').on('click', '.user_ru .active', function () {
        $(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
        $('#accommodation').val($(this).find('a').data('id'));
    });

    $('body').bind('click', '.user_switch .active', function () {
        $(this).addClass('chose_btn').siblings('.active').removeClass('chose_btn');
        $('#switch').val($(this).find('a').data('id'));
    });
    //国际手机号获取
    getNationalPhone();
    function getNationalPhone() {
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function (data) {
                if (data && data.state == 100) {
                    var phoneList = [], list = data.info;
                    var listLen = list.length;
                    var codeArea = list[0].code;
                    if (listLen == 1 && codeArea == 86) {//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').closest('li').hide();
                        return false;
                    }
                    for (var i = 0; i < list.length; i++) {
                        phoneList.push('<li><span>' + list[i].name + '</span><em class="fn-right">+' + list[i].code + '</em></li>');
                    }
                    $('.layer_list ul').append(phoneList.join(''));
                } else {
                    $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                }
            },
            error: function () {
                $('.layer_list ul').html('<div class="loading">加载失败！</div>');
            }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function () {
        $('.layer_code').show();
        $('.mask-code').addClass('show');

    })
    // 选中区域
    $('.layer_list').delegate('li', 'click', function () {
        var t = $(this), txt = t.find('em').text();
        console.log(txt)
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+", ""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function () {
        $('.layer_code, #popupReg-captcha-mobile').hide();
        $('.mask-code').removeClass('show');
    })

    var showErrTimer;
    function showErr(txt) {
        showErrTimer && clearTimeout(showErrTimer);
        $(".popErr").remove();
        $("body").append('<div class="popErr"><p>' + txt + '</p></div>');
        $(".popErr p").css({ "margin-left": -$(".popErr p").width() / 2, "left": "50%" });
        $(".popErr").css({ "visibility": "visible" });
        showErrTimer = setTimeout(function () {
            $(".popErr").fadeOut(300, function () {
                $(this).remove();
            });
        }, 1500);
    }

    // 上传头像
    var upqjShow3 = new Upload({
        btn: '#up_logo',
        bindBtn: '#logoshow_box .addbtn_more',
        multiple: false,
        title: 'Images',
        mod: 'pension',
        params: 'type=thumb',
        atlasMax: 2,
        deltype: 'delthumb',
        replace: false,
        fileQueued: function (file, activeBtn) {
            var btn = activeBtn ? activeBtn : $("#up_logo");
            var p = btn.parent(), index = p.index();
            $("#logoshow_box li").each(function (i) {
                if (i >= index) {
                    var li = $(this), t = li.children('.img_show'), img = li.children('.img');
                    if (img.length == 0) {
                        t.after('<div class="img" id="' + file.id + '"></div><i class="del_btn">+</i>');
                        return false;
                    }

                }
            })
        },
        uploadSuccess: function (file, response, btn) {
            if (response.state == "SUCCESS") {
                $('#' + file.id).html('<img src="' + response.turl + '" data-url="' + response.url + '" />');

            }
        },
        uploadFinished: function () {
            if (this.sucCount == this.totalCount) {
                // showErr('所有图片上传成功');
            } else {
                showErr((this.totalCount - this.sucCount) + (langData['siteConfig'][44][19].replace('1', '')));//1张图片上传失败
            }


        },
        uploadError: function () {

        },
        showErr: function (info) {
            showErr(info);
        }
    });
    $('body').on('click', '.del_btn', function () {
        var t = $(this), val = t.siblings('img').attr('data-url');
        upqjShow3.del(val);
        t.siblings('.img').remove();
        t.remove();

    })

    var lng = "", lat = "";

    $("#map .lead p").bind("click", function () {
        $(".pageitem").hide();
    });


    if ($("#lnglat").val() != "") {
        var lnglat = $("#lnglat").val().split(",");
        lng = lnglat[0];
        lat = lnglat[1];
    } else {
        //第一次进入自动获取当前位置
        HN_Location.init(function (data) {
            if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
                //   alert(langData['siteConfig'][27][137])   /* 定位失败，请重新刷新页面！ */ 
                lng = siteCityInfo_lng;
                lat = siteCityInfo_lat;

            } else {
                lng = data.lng;
                lat = data.lat;

            }
        }, device.indexOf('huoniao') > -1 ? false : true);
    }
    // 2023.12.21修改
    let infoData = JSON.parse(localStorage.getItem('infoData'));
    let newData = {};
    if (infoData) {
        infoData.forEach(function (val) {
            newData[val.name] = val.value
        })
        if (newData.lnglat) {
            $('#address').val(`${newData.address} ${newData.street}`);
            $('#address').html(`${newData.address} ${newData.street}`);
            $("#lnglat").val(newData.lnglat);
        }
        localStorage.removeItem('infoData');
    }
    let formData_infoData = JSON.parse(localStorage.getItem('formData_infoData')); //表单数据
    if (formData_infoData) {
        for (let key in formData_infoData) {
            let value = formData_infoData[key];
            let newKey = key.replace(/_val([\s\S]*)/gi, '').replace(/_html([\s\S]*)/gi, '').replace(/_attr([\s\S]*)/gi, ''); //key用于判断，newkey用于赋值
            if (key.includes('_val')) { //.val()操作
                switch (newKey) {
                    case '#targetcarename': {
                        if (value) {
                            $('.com-box .choose .text').eq(0).hide();
                        }
                        break;
                    }
                    case '#catname': {
                        if (value) {
                            $('.com-box .choose .text').eq(1).hide();
                        }
                        break;
                    }
                }
                $(newKey).val(value);
            } else if (key.includes('_html')) { //.html操作
                switch (newKey) {
                    case '#logoshow_box .img': {
                        $('#up_logo').siblings('.img').remove();
                        let length = value.length;
                        if (length == 0) {
                            $('.del_btn').remove();
                            break;
                        }
                        let eleLength = $(newKey).length;
                        for (let i = 0; i < length; i++) {
                            if (i <= eleLength - 1) {
                                $(newKey).eq(i).html(value[i]);
                            } else {
                                let html = `<div id="WU_FILE__${i - eleLength}" class="img">${value[i]}</div>`;
                                $('#up_logo').after(html);
                            }
                        }
                        break;
                    }
                    default: {
                        $(newKey).html(value);
                    }
                }
            } else if (key.includes('_attr')) {
                switch (newKey) {
                    case '.gz-addr-seladdr': {
                        $(newKey).attr('data-ids', value);
                        $(newKey).attr('data-id', $('#addrid').val());
                    }
                }
            }
        }
        localStorage.removeItem('formData_infoData');
    }
    $(".LoTitle").bind("click", function () {
        // 2023.12.21修改
        let formData = {
            '#elderlyname_val': $('#elderlyname').val(),
            '.user_sex_html': $('.user_sex').html(),
            '.user_switch_html': $('.user_switch').html(),
            '#age_val': $('#age').val(),
            '#logoshow_box .img_html': [],
            '.user_ru_html': $('.user_ru').html(),
            '.gz-addr-seladdr_html': $('.gz-addr-seladdr').html(),
            '.gz-addr-seladdr_attr': $('.gz-addr-seladdr').attr('data-ids'),
            '#rzminprice_val': $('#rzminprice').val(),
            '#rzmaxprice_val': $('#rzmaxprice').val(),
            '#monthminprice_val': $('#monthminprice').val(),
            '#monthmaxprice_val': $('#monthmaxprice').val(),
            '#people_val': $('#people').val(),
            '#areaCode_val': $('#areaCode').val(),
            '.areacode_span_html': $('.areacode_span').html(),
            '#tel_val': $("#tel").val(),
            '#wx_val': $('#wx').val(),
            '#email_val': $('#email').val(),
            '#relationship_val': $('#relationship').val(),
            '#targetcare_val': $('#targetcare').val(),
            '#targetcarename_val': $('#targetcarename').val(),
            '#catid_val': $('#catid').val(),
            '#catname_val': $('#catname').val(),
            '#level_val': $('#level').val(),
            '#personalsituation_val': $("#personalsituation").val(),
            '#situation_val': $("#situation").val(),
            "#desc_val": $("#desc").val(),
        }
        for (let i = 0; i < $('#logoshow_box .img').length; i++) {
            let text = $('#logoshow_box .img').eq(i).html();
            formData['#logoshow_box .img_html'].push(text);
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
        localStorage.setItem('infoData', JSON.stringify(arrData));
        localStorage.setItem('formData_infoData', JSON.stringify(formData));
        location.href = addAddress;
        return false
        $(".pageitem").hide();
        $('#map').show();

        //百度
        if (site_map == 'baidu') {
            var myGeo = new BMap.Geocoder();

            if (lng != '' && lat != '') {
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
                                    $("#local strong").html(_value.business);
                                    $("#lnglat").val(lng + ',' + lat);
                                    $(".pageitem").hide();
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

            var map = new AMap.Map('mapdiv');

            if (lng != '' && lat != '') {
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

                    $("#local strong").html(r);
                    $("#lnglat").val(lng + ',' + lat);
                    $(".pageitem").hide();
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

            //谷歌    
        } else if (site_map == 'google') {
            if ($("#lnglat").val() != "") {
                var lnglat = $("#lnglat").val().split(",");
                lng = lnglat[0];
                lat = lnglat[1];
            }
            businessgooleMap(lng, lat);//公共touchScale中
        }

    });


    //点击检索结果
    $(".mapresults").delegate("li", "click", function () {
        var t = $(this), title = t.find("h5").text(), title1 = t.find("p").text();
        lng = t.attr("data-lng");
        lat = t.attr("data-lat");
        $("#address").val("" + title1 + "" + title + "");
        $("#lnglat").val("" + lng + "," + lat + "")
        $('.pageitem').hide();
    });



    // 信息提示框
    // 错误提示
    function showMsg(str) {
        var o = $(".error");
        o.html('<p>' + str + '</p>').show();
        setTimeout(function () { o.hide() }, 1000);
    }

    //表单验证
    function isPhoneNo(p) {
        var areaCode = parseInt($("#areaCode").val());
        if(areaCode == 86){
            var pattern = /^1[23456789]\d{9}$/;
            return pattern.test(p);
        }
        return true;
    }
    $('#submit').click(function (e) {
        e.preventDefault();

        var t = $("#fabuForm"), action = t.attr('action');
        var addrid = 0, cityid = 0, r = true;

        var elderlyname = $('#elderlyname').val();//姓名
        var addrid = $('#addrid').val();//所在地区
        var people = $('#people').val();//学历
        var tel = $('#tel').val();//院校
        var relationship = $('#relationship').val();//教龄


        if (!elderlyname) {
            r = false;
            showMsg(langData['siteConfig'][38][64]); //请输入老人姓名
            return;
        } else if (!people) {
            r = false;
            showMsg(langData['siteConfig'][27][138]);  //请输入联系人
            return;
        } else if (!tel) {
            r = false;
            showMsg(langData['siteConfig'][20][412]);  //请输入联系方式
            return;
        } else if (!relationship) {
            r = false;
            showMsg(langData['siteConfig'][38][72]);  //请输入亲属关系
            return;
        }

        var ids = $('.gz-addr-seladdr').attr("data-ids");
        if (ids != undefined && ids != '') {
            addrid = $('.gz-addr-seladdr').attr("data-id");
            ids = ids.split(' ');
            cityid = ids[0];
        } else {
            r = false;
            showMsg(langData['siteConfig'][44][89]);  //请选择养老区域
            return;
        }
        $('#addrid').val(addrid);
        $('#cityid').val(cityid);

        var photo = $("#logoshow_box").find('img').data('url');
        $('#photo').val(photo == undefined && photo == '' ? '' : photo);

        if (!r) {
            return;
        }

        $("#submit").addClass("disabled").html(langData['siteConfig'][6][35] + "...");	//提交中

        $.ajax({
            url: action,
            data: t.serialize(),
            type: 'post',
            dataType: 'json',
            success: function (data) {
                if (data && data.state == 100) {
                    var tip = langData['siteConfig'][20][341];//发布成功
                    if (id != undefined && id != "" && id != 0) {
                        tip = langData['siteConfig'][20][229];//修改成功！
                    }
                    $("#submit").removeClass("disabled").html(langData['siteConfig'][11][19]);		//立即发布
                    showMsg(tip);
                } else {
                    showMsg(data.info);
                    $("#submit").removeClass("disabled").html(langData['siteConfig'][11][19]);		//立即发布
                }
            },
            error: function () {
                showMsg(langData['siteConfig'][39][56]); //提交审核
            }
        })




    });


});