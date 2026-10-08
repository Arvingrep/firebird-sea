var cityid_chose = 0;
var idArr = []
$(function () {

  // 获取url参数
  function getParam(paramName) {
    paramValue = "", isFound = !1;
    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
      arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
      while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
    }
    return paramValue == "" && (paramValue = null), paramValue
  }

  $(".table-city").on('touchstart', function () {
    $(".search-box input").blur();
  })


  $('a').bind('contextmenu', function (e) {
    e.preventDefault();
  })

  var sortBy = function (prop) {
    return function (obj1, obj2) {
      var val1 = obj1[prop];
      var val2 = obj2[prop];
      if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
        val1 = Number(val1);
        val2 = Number(val2);
      }
      if (val1 < val2) {
        return -1;
      } else if (val1 > val2) {
        return 1;
      } else {
        return 0;
      }
    }
  }

  // 获取城市/省列表
  getCityList();

  if (site_city_grouptype) {
    getSearchCityList()
  }


  function getCityList() {
    var url = "/include/ajax.php?service=siteConfig&action=siteCity&module=" + backModule;
    if (site_city_grouptype == '1') {
      url = '/include/ajax.php?service=siteConfig&action=siteCityFirst&module=' + backModule
    }
    // 获取城市列表
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      success: function (data) {
        if (data.state != 100) return false;
        var list = data.info, cityArr = new Array(), html = [], html1 = [], hotCityHtml = [];
        for (var i = 0; i < list.length; i++) {
          var pinyin = list[i].pinyin.substr(0, 1), tableList = $('.table-list-' + pinyin);

          if (cityArr[pinyin] == undefined) {
            cityArr[pinyin] = [];
          }
          //
          // var lArr = [];
          // lArr.name = list[i].name;
          // lArr.url = list[i].url;

          cityArr[pinyin].push(list[i]);
        }


        var szmArr = [];
        for (var key in cityArr) {
          var szm = key;
          // 右侧字母数组
          szmArr.push(key);

        }

        // 右侧字母填充
        szmArr.sort();
        for (var i = 0; i < szmArr.length; i++) {
          html1.push('<li><a href="javascript:;" data-id="' + szmArr[i] + '">' + szmArr[i] + '</a></li>');

          cityArr[szmArr[i]].sort(sortBy('cityid'));
          // 左侧城市填充
          html.push('<p class="table-tit table-tit-' + szmArr[i] + '" id="' + szmArr[i] + '">' + szmArr[i] + '</p>');
          html.push('<ul class="table-list " id="' + szmArr[i] + '_list">');
          for (var j = 0; j < cityArr[szmArr[i]].length; j++) {
            let item=cityArr[szmArr[i]][j]
            html.push(`<li><a  href=${item.url}?currentPageOpen=1 data-domain=${JSON.stringify(item)}>${item.name}</a></li>`);
            if (item.hot == 1) {
              hotCityHtml.push(`<li><a href=${item.url}?currentPageOpen=1 data-domain=${JSON.stringify(item)}>${item.name}</a></li>`);
            }
          }
          html.push('</ul>');

        }
        var hotHtml = '';
        if (hotCityHtml.length > 0 && site_city_grouptype != 1) {
          // hotHtml = '<p class="table-tit table-tit-hot" id="hot">'+langData['siteConfig'][37][98]+'</p>';//热门城市
          hotHtml = '<p class="table-tit table-tit-hot" id="hot">' + langData['siteConfig'][37][98] + '</p>';//热门城市
          hotHtml += '<ul class="table-list table-list-hot fn-clear" id="hot_list">' + hotCityHtml.join('') + '</ul>';

          // html1.unshift('<li><a href="javascript:;" data-id="hot">'+langData['siteConfig'][37][79]+'</a></li>');//热门
          html1.unshift('<li><a href="javascript:;" data-id="hot">#</a></li>');//热门
        }

        html1 = '<ul>' + html1.join('') + '</ul>';

        $('.table-city').html(hotHtml + html.join(''));
        $(".table-city .table-list").each(function () {
          $(this).attr('data-top', $(this).offset().top)
        })
        $('.jump-ul').html(html1);

      }
    })
  }
  function getSearchCityList() {
    var url = "/include/ajax.php?service=siteConfig&action=siteCity&module=" + backModule;

    // 获取城市列表
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      success: function (data) {
        if (data.state != 100) return false;
        var list = data.info, cityArr = new Array(), html = [], html1 = [], hotCityHtml = [];
        for (var i = 0; i < list.length; i++) {
          var pinyin = list[i].pinyin.substr(0, 1), tableList = $('.table-list-' + pinyin);

          if (cityArr[pinyin] == undefined) {
            cityArr[pinyin] = [];
          }
          //
          // var lArr = [];
          // lArr.name = list[i].name;
          // lArr.url = list[i].url;

          cityArr[pinyin].push(list[i]);
        }
        // compositionstart


        $('.search-box input').bind('input propertychange', function () {
          var t = $(this), val = t.val(), searchHtml = [];
          if (val != "") {
            $('body').addClass('fixed');
            $('.search-list, .search-box .close').show();

            for (var m = 0; m < list.length; m++) {
              var name = list[m].name, pinyin = list[m].pinyin;
              if (name.indexOf(val) >= 0 || pinyin.indexOf(val) >= 0) {
                searchHtml.push('<li><a href="' + list[m].url + '?currentPageOpen=1" data-domain=\'' + JSON.stringify(list[m]) + '\'>' + list[m].name + '</a></li>');
              } else {
                $('.search-list ul').html('');
              }
            }

            $('.search-list ul').html('');
            $('.search-list ul').html(searchHtml.join(''));

          } else {
            $('body').removeClass('fixed');
            $('.search-list, .search-box .close').hide();
          }
        })



      }
    })
  }



  // 关闭搜索框
  $('.search-box .close').click(function () {
    $('.search-box input').val('');
    $('body').removeClass('fixed');
    $('.search-list, .search-box .close').hide();
  })

  var navBar = $(".navbar");
  navBar.on("touchstart", function (e) {
    $(this).addClass("active");
    $('.letter').html($(e.target).html()).show();
    var width = navBar.find("li").width();
    var height = navBar.find("li").height();
    var touch = e.touches[0];
    var pos = { "x": touch.pageX, "y": touch.pageY };
    var x = pos.x, y = pos.y;
    $(this).find("li").each(function (i, item) {
      var offset = $(item).offset();
      var left = offset.left, top = offset.top;
      if (x > left && x < (left + width) && y > top && y < (top + height)) {
        var id = $(item).find('a').attr('data-id');
        var oftop = $('#' + id + '_list').attr('data-top') - $("#" + id).height();
        if (!oftop) {
          oftop = $('#' + id + '_list').offset().top
          $('#' + id + '_list').attr('data-top', oftop);
        }
        console.log(oftop)
        var cityHeight = oftop - ($(".header ").height() + $(".search-box").height());
        $('body, html').scrollTop(cityHeight);
        $('.letter').html($(item).html()).show();
      }
    });
    return false
  });

  navBar.on("touchmove", function (e) {
    e.preventDefault();
    var width = navBar.find("li").width();
    var height = navBar.find("li").height();
    var touch = e.touches[0];
    var pos = { "x": touch.pageX, "y": touch.pageY };
    var x = pos.x, y = pos.y;
    $(this).find("li").each(function (i, item) {
      var offset = $(item).offset();
      var left = offset.left, top = offset.top;
      if (x > left && x < (left + width) && y > top && y < (top + height)) {
        var id = $(item).find('a').attr('data-id');
        var cityHeight = $('#' + id).offset().top;
        $('body, html').scrollTop(cityHeight);
        $('.letter').html($(item).html()).show();
      }
    });
  });


  navBar.on("touchend", function (e) {
    $(this).removeClass("active");
    $(".letter").hide();
    return false
  })

  // 清除列表cookie
  $('.nav li').click(function () {
    window.sessionStorage.removeItem('house-list');
    window.sessionStorage.removeItem('maincontent');
    window.sessionStorage.removeItem('detailList');
    window.sessionStorage.removeItem('video_list');
  })

  // 重新定位
  $('.localBtn').click(function () {
    getCity(true);
  })
  getCity();

  // tab选择
  $(".tabBox span").click(function () {
    var t = $(this), index = t.index();
    var pid = t.prev('span').attr('data-id')
    var id = t.attr('data-id')
    if (pid || index == 0) {
      $(".cityListBox .cityList").addClass('fn-hide').removeClass('parentUl currOnUl ');
      $(".cityListBox .cityList").eq(index).removeClass('fn-hide ')
      if (index > 0) {
        $(".cityListBox .cityList").eq(index).prev().addClass('parentUl')
        $(".cityListBox .cityList").eq(index).addClass('currOnUl')
      }

      $(this).addClass('on_chose').siblings('span').removeClass('on_chose');
      var left = $(this).offset().left + $(this).width() / 2 - $(".cityScrollBox .tabBox s").width() / 2;
      $(".cityScrollBox .tabBox s").css('transform', 'translateX(' + left + 'px)')
    }


  });
  
  //选择城市写入cookie
  $('.main,.search-list,.cityList').delegate('a', 'click', function (e) {
    e.preventDefault();
    var t = $(this),backUrl= t.attr('href'), domain = t.attr('data-domain');
    var JS_domain = domain ? JSON.parse(domain) : '';
    if (site_city_grouptype == '1' && JS_domain.son && JS_domain.son >= 1) {
      var par = t.closest('.cityList');
      var ul_index = par.index()
      var li = t.closest('li')
      if (par.length) { //点击弹窗里的城市
        par.find('li').removeClass('active').removeClass('prev').removeClass('next')
        if (cityid_chose != (JS_domain.id ? JS_domain.id : JS_domain.cityid)) {
          idArr.splice((ul_index + 1), (idArr.length - ul_index))

        }
        li.addClass('active');
        li.prev().addClass('prev');
        li.next().addClass('next');
        $(".tabBox span").eq(ul_index).text(JS_domain.name).attr('data-id', JS_domain.id ? JS_domain.id : JS_domain.cityid)
        $(".tabBox span").eq(ul_index + 1).click();
        for (var i = 0; i < $(".tabBox span").length; i++) {
          var _tt = $(".tabBox span").eq(i);
          if (ul_index < i) {
            _tt.text(_tt.attr('data-name'))
          }
        }
        getlower(JS_domain.id ? JS_domain.id : JS_domain.cityid)
      } else {
        $(".tabBox span").eq(0).click();
        $(".tabBox span").removeAttr('data-id')
        idArr = [];
        if (JS_domain.parent && JS_domain.parent.ids && JS_domain.parent.ids.length) { //有父级
          idArr = JS_domain.parent.ids;
          console.log(idArr)
          for (var i = 0; i < JS_domain.parent.ids.length; i++) {
            var cid = JS_domain.parent.ids[i + 1] ? JS_domain.parent.ids[i + 1] : ''
            getlower(JS_domain.parent.ids[i], i, cid);
          }

        } else {
          getlower(JS_domain.id ? JS_domain.id : JS_domain.cityid)
        }
      }

      showPop()
      return false;
    }

    var channelDomainClean = typeof channelDomain != 'undefined' ? channelDomain.replace("http://", "").replace("https://", "") : window.location.host;
    var channelDomain_1 = channelDomainClean.split('.');
    var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0] + ".", "");

    channelDomain_ = channelDomainClean.split("/")[0];
    channelDomain_1_ = channelDomain_1_.split("/")[0];

    $.cookie(cookiePre + 'siteCityInfo', domain, { expires: 7, domain: channelDomainClean, path: '/' });
    $.cookie(cookiePre + 'siteCityInfo', domain, { expires: 7, domain: channelDomain_1_, path: '/' });
    $.cookie(cookiePre + 'siteCityInfo', domain, { expires: 7, path: '/', domain: '.' + cfg_clihost });

    if (window.navigator.userAgent.indexOf('huoniao_iOS') > -1 && window.navigator.userAgent.indexOf('huoniao_Android') <= -1) {
        $.cookie(cookiePre + 'siteCityInfo_iOS_APP', domain, { expires: 7, domain: channelDomainClean, path: '/' });
        $.cookie(cookiePre + 'siteCityInfo_iOS_APP', domain, { expires: 7, domain: channelDomain_1_, path: '/' });
        $.cookie(cookiePre + 'siteCityInfo_iOS_APP', domain, { expires: 7, path: '/', domain: '.' + cfg_clihost });
    }

    var nedomain = JSON.parse(domain);
    var tuanname = nedomain ? nedomain.name : '';
    var tuancityid = nedomain ? nedomain.cityid : '';
    //return false
    //抖音小程序 团购页面时
    var isBytemini = device.toLowerCase().includes("toutiaomicroapp");

    if (isBytemini && backModule == 'tuan') {
      tt.miniProgram.reLaunch({ url: '/pages/packages/tuan/index/index?cityid=' + tuancityid + '&cityname=' + tuanname });
      return false;
    } else if (wx_miniprogram && backModule == 'info' && getParam('fromOriginal') == '1') {
      wx.miniProgram.redirectTo({ url: '/pages/packages/info/index/index?cityid=' + tuancityid + '&cityname=' + tuanname });
    } else if(window.navigator.userAgent.indexOf('huoniao_iOS') > -1 && window.navigator.userAgent.indexOf('huoniao_Android') <= -1){
      let cityInfo = $.cookie('HN_siteCityInfo')
      localStorage.setItem('cityHasChange',backUrl); //表示正在改变城市分站
      let cityHasChange = localStorage.getItem('cityHasChange')
      setupWebViewJavascriptBridge(function (bridge) {  //苹果端返回上一页
        bridge.callHandler("goBack", {}, function (responseData) { 
          location.reload()
        });
        bridge.callHandler('pageReload', {}, function (responseData) {
          location.reload()

         });

      })
      return false;
    }else{
      location.href = t.attr('href');

    }
    // 切换完之后不再弹出切换城市提醒
    localStorage.setItem('manualChange',true);
  });

  // 定位
  function getCity(force) {
    $('.local p').html(langData['siteConfig'][27][135]);
    HN_Location.init(function (data) {
      if (!data || data == undefined || data.province == "") {
        $('.local p').html(langData['siteConfig'][27][136]);
      } else {
        var province = data.province, city = data.city, district = data.district, town = data.town, page = 1;
        var time = Date.parse(new Date());
        selectCity(province, city, district, town);
      }
    }, device.indexOf('huoniao') > -1 ? false : true, force);
  }


  // 根据定位城市查询本站数据
  function selectCity(province, city, district, town) {
    $.ajax({
      url: "/include/ajax.php?service=siteConfig&action=verifyCity&region=" + province + "&city=" + city + "&district=" + district + "&town=" + town + "&module=" + backModule,
      type: "POST",
      dataType: "jsonp",
      success: function (data) {
        if (data && data.state == 100) {
          $('.local p').html('<a href="' + data.info.url + '?currentPageOpen=1" data-domain=\'' + JSON.stringify(data.info) + '\'>' + data.info.name + '</a>');
          if (site_city_grouptype == '1') {
            getZB_list(data.info)
          }
        } else {
          $('.local p').html(data.info);
        }
      },
      error: function () {
        alert(langData['siteConfig'][6][203]);//网络错误，请重试
      }
    })
  }


  // 获取我的周边
  function getZB_list(posiInfo) {
    var url = '/include/ajax.php?service=siteConfig&action=nearbyCity&lat=' + posiInfo.lat + '&lng=' + posiInfo.lng + '&cityid=' + posiInfo.cityid
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      success: function (data) {
        if (data.state == 100) {
          var hotHtml = []
          hotHtml.push('<p class="table-tit table-tit-hot" id="hot">我的周边</p>');//热门城市
          hotHtml.push('<ul class="table-list table-list-hot fn-clear" id="hot_list">');//热门城市
          var list = data.info
          for (var i = 0; i < list.length; i++) {
            hotHtml.push('<li><a href="' + list[i].url + '?currentPageOpen=1" data-domain=\'' + JSON.stringify(list[i]) + '\'>' + list[i].name + '</a></li>')
          }
          hotHtml.push('</ul>');
          $("#hot,#hot_list").remove()
          $(".table-city").prepend(hotHtml.join(''))

          $(".table-city .table-list").each(function () {
            $(this).attr('data-top', $(this).offset().top)
          })
        }
      },
      error: function () { },
    })
  }

  function getlower(id, type, cid) {
    var url = '/include/ajax.php?service=siteConfig&action=siteCityById&id=' + id
    // return false;
    if (cityid_chose == id) return false;
    cityid_chose = id;
    $(".loadBox").addClass('show')
    $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      success: function (data) {
        $(".loadBox").removeClass('show')
        if (data.state == 100) {
          var html = []
          for (var i = 0; i < data.info.length; i++) {
            var item = data.info[i]
            var clsName = (cid && cid == item.id) ? 'active' : '';
            html.push('<li class="' + clsName + '" data-id="' + item.id + '"><a href="' + item.url + '?currentPageOpen=1" data-domain=\'' + JSON.stringify(item) + '\'>' + item.name + '</a></li>')
          }
          $(".cityListBox .cityList").addClass('fn-hide').removeClass('currOnUl parentUl')
          if (type != undefined) {
            $(".cityListBox .cityList").eq(type).html(html.join("")).removeClass('fn-hide');
            if (idArr.length) {
              $(".cityListBox .cityList").eq(type).addClass('currOnUl').prev('ul').addClass('parentUl')
            }
            $(".cityListBox .cityList li[data-id='" + cid + "'] a").click()

          } else {
            $(".cityListBox .cityList").eq(idArr.length).html(html.join("")).removeClass('fn-hide');

            if (idArr.length) {
              $(".cityListBox .cityList").eq(idArr.length).addClass('currOnUl').prev('ul').addClass('parentUl')
            }
            idArr.push(id);
          }
          // $(".tabBox span").eq(idArr.length).click()

        }
      },
      error: function () {
        $(".loadBox").removeClass('show')
      },
    })
  }


  // 显示弹窗
  function showPop() {
    $(".cityMask").show()
    $(".cityScrollBox").css('transform', 'translateY(0)')
  }
  // 隐藏
  function hidePop() {
    $(".cityMask").hide()
    $(".cityScrollBox").css('transform', 'translateY(100%)');
    $(".tabBox span").each(function () {
      //   var t = $(this), ind = t.index();
      $(this).text($(this).attr('data-name')).removeAttr('data-id')
    })
  }



  $(".cityScrollBox .close_pop,.cityMask").click(function () {
    hidePop()
  })


})


