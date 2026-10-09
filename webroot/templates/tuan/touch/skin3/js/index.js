$(function () {
  var device = navigator.userAgent;
if(device.indexOf('huoniao') > -1){
  // $('.areaChose').bind('click', function(e){
  //   e.preventDefault();
  //   setupWebViewJavascriptBridge(function(bridge) {
  //     bridge.callHandler('goToCity', {'module': 'tuan'}, function(){});
  //   });
  // });
}

  // banner轮播图
  new Swiper('.banner .swiper-container', {
    pagination:{ el: '.banner .pagination'} ,
    slideClass:'slideshow-item',
    autoplay: true,
    loop: true,
    slidesPerView : 1.22,
    spaceBetween : 25,
    centeredSlides : true,
  });


  // 最新入驻
  new Swiper('.ttNews .swiper-container', {direction: 'vertical', autoplay:{delay: 2000,},});
  // 滑动导航
  new Swiper('.swiper-nav .swiper-container', {pagination: {el:'.swiper-nav .pagination',},loop: true,grabCursor: true,paginationClickable: true});

  //点击显示输入框
  $('.fake-input').click(function(){
    $(this).hide();
    $(this).siblings('.inp_wrap').show();
  })

   $(".inp").delegate('#search', 'click', function(event) {
    $(this).closest('#sform2').submit();
   });
   //监听input输入
    $(".search-fixForm #topkeywords").bind('input propertychange', function () {
        var term = $(this).val();
        $('#botkeywords').val(term);
        if (term=='') {
              $('.search-form .clear_inp').hide();
        }else{
            $('.search-form .clear_inp').show()
        }

    });

    $(".search-form #botkeywords").bind('input propertychange', function () {
        var term = $(this).val();
        $('#topkeywords').val(term);
        if (term!='') {
          $('.search-form .clear_inp').show();
        }else{
          $('.search-form .clear_inp').hide();
        }

    });

  //清除头部input
  $(".search-form").delegate('.clear_inp', 'click', function(event) {
    $(".search-form .keys").val('');
    $('.clear_inp').hide();
   });

  //点击头部搜索
  $(".header").delegate('.header-sou', 'click', function(event) {
    $(".serach_cover").addClass('show');
    $('.fir-form').removeClass('curr');
    $('.search-fixForm').addClass('curr');

  });

  //取消搜索
  $(".serach_cover .cancel_serach").click(function(event) {
    $(".serach_cover").removeClass('show');
    $('.fir-form').addClass('curr');
    $('.search-fixForm').removeClass('curr');
  });
  var history_search = 'tuan_history_search';
    //加载历史记录
  var hlist = [];
  var history = utils.getStorage(history_search);
  if(history){
    history.reverse();//颠倒其元素的顺序
    for(var i = 0; i < history.length; i++){
      if(history[i]){
        hlist.push('<a href="javascript:;">'+history[i]+'</a>');
      }

    }
    $('.histroy-div').html(hlist.join(''));
    $('.story-search').show();
  }

  //清空搜索历史
  var clearHistory =1;
  $('.del-histroy').bind('click', function(){
    var confir = clearHistory ? confirm(langData['siteConfig'][20][211]) : 1;
    if(confir){
      utils.removeStorage(history_search);
      $('.story-search').hide();
      $('.histroy-div').html('');
    }

  });
  //点击搜索记录时搜索
  $('.histroy-div').delegate('a','click',function(){
    var keywords= $(this).text();
    $('#topkeywords').val(keywords);
    $('#sform1').submit();

  })

  //提交时记录搜索历史
  $('.sform').submit(function(e){
    var keywords = $(this).find('.keys').val();
    //记录搜索历史
    var history = utils.getStorage(history_search);
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
    utils.setStorage(history_search, JSON.stringify(history));
  })



  $('.banner_wrap .header').append('<i class="header-sou"></i>')
  var ptLoad=false,recomLoad=false;
  // input置顶
    //获取要定位元素距离浏览器顶部的距离
    $(window).scroll(function(){
        var isFocus=$("#botkeywords").is(":focus");
        if(true==isFocus){
          $("#botkeywords").blur();
        }

        //获取滚动条的滑动距离
        var scroH = $(this).scrollTop();
        if(scroH>0){
            $('.banner_wrap .header').addClass('fixed');

        }else{
            $('.banner_wrap .header').removeClass('fixed');

        }
        var t=$(window).scrollTop();
        var h=$(window).height();
        var th =t + h;
        //火热拼团
        if($('.pintuan').size()>0){
            var a3 = $(".pintuan").offset().top - 100;
            var p3 = $(".pintuan").height();
            var tp3=a3 + p3;
            if (tp3 > t && a3 < th && !ptLoad) {
                //console.log('火热拼团开始')
                ptList();
            }
        }

        //推荐团购
        if($('.recomTuan').size()>0){
            var a3 = $(".recomTuan").offset().top - 100;
            var p3 = $(".recomTuan").height();
            var tp3=a3 + p3;
            if (tp3 > t && a3 < th && !recomLoad) {
                //console.log('推荐团购开始')
                recomList();
            }
        }

    })


    // 滑动导航
    var swiper = new Swiper('.tcInfo .swiper-container', {
        slidesPerGroup: 5,
          slidesPerView: 5,
          slidesPerColumn: 1,
          pagination: {
            el: '.tcInfo .pagination',
            clickable: true,
          },
        });

  //倒计时
    var countDown = function(times){
      var now = Date.parse(new Date())/1000;
      var end = times;
      var ytime = end-now;
      var timer = setInterval(function(){
        if (ytime > 0) {
          ytime--;
          clearTime = timer;
          var hour = Math.floor((ytime / 3600000) % 24);
          var minute = Math.floor((ytime / 60) % 60);
          var second = Math.floor(ytime % 60);

          $(".jsTime").find("span.hour").text(hour < 10 ? "0" + hour : hour);
          $(".jsTime").find("span.minute").text(minute < 10 ? "0" + minute : minute);
          $(".jsTime").find("span.second").text(second < 10 ? "0" + second : second);
        } else {
          //gettime()
          countDown(times);
          clearInterval(timer);
          changeImg(times);
        }
      }, 1000);
    };

	gettime();
    function gettime(){
	    $.ajax({
	      url: "/include/ajax.php?service=tuan&action=systemTime",
	      type: "GET",
	      dataType: "jsonp",
	      success: function (data) {
	        if(data.state == 100){
	          var list = data.info.list, nextHour = data.info.nextHour,times;
            var now = data.info.now;
	          times = list[0].nextHour;
	          nextHour = list[0].nextHour;
            $('.qgTime em').text(now)
	          changeImg(nextHour);
	          countDown(times)
	          $('.qgou').find('#timeCounter').attr('data-time',times);

	        }
	      }
	    });
	}
  function changeImg(nextHour){

    $.ajax({
      url: "/include/ajax.php?service=tuan&action=tlist&iscity=1&hourly=1&time="+nextHour+"&pageSize=6",
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(data.state == 100 && data.info.list.length > 0){
            var list = data.info.list,html=[];

            for(var i = 0; i < list.length; i++){
              var pic = list[i].litpic == false || list[i].litpic == '' ? '/static/images/blank.gif' : list[i].litpic;
              html.push('<div class="act swiper-slide">');
              html.push('<a href="'+list[i].url+'">');
              html.push('<div class="qg_img" >');
              html.push('<img src="'+pic+'"/>');
              html.push('</div>');
              html.push('<div class="qgInfo">');
              html.push('<h3>'+list[i].title+'</h3>');
              html.push('<div class="qgPrice">');
              html.push('<span>'+echoCurrency('symbol')+'<strong>'+list[i].price+'</strong></span><del>'+echoCurrency('symbol')+list[i].market+'</del>');
              html.push('</div>');
              html.push('</div>');
              html.push('</a>');
              html.push('</div>');
            }
            html.push('<div class="act viewMore swiper-slide">');
            html.push('<a href="'+channelDomain+'/secKill.html">');
            html.push('<h2>'+langData['siteConfig'][6][52]+'</h2>');//查看更多
            html.push('<h3>View more</h3>');
            html.push('<p><span>'+langData['tuan'][0][11]+'</span><i class="viewIcon"></i></p>');//点击前往
            html.push('</a>');
            html.push('</div>');
            $('.tc-activity').html(html.join(''));
            //活动滚动
            var swiper = new Swiper('.boxCon .swiper-container', {
                slidesPerView: 'auto',

            });

        }else{
      		 $('.qgou .boxCon').html('<div class="loading">'+langData['tuan'][0][12]+'</div>');//暂无抢购商品
        }
      }
    });

  }

  //推荐商家
  var lng = '', lat = '', clearTime='';
  var isload = false;
  HN_Location.init(function(data){
    if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
      $('#store ul').html('<div class="loading" style="text-align:center;">'+langData['tuan'][0][21]+'</div>');//定位失败，请刷新页面
    }else{
      lng = data.lng, lat = data.lat;
      getList();


      //判断当前城市
      var siteCityInfo = $.cookie("HN_siteCityInfo");
      var province = data.province, city = data.city, district = data.district, town = data.town;
      $.ajax({
          url: "/include/ajax.php?service=siteConfig&action=verifyCity&region="+province+"&city="+city+"&district="+district+"&module=tuan"+"&town="+town,
          type: "POST",
          dataType: "json",
          success: function(data){
            if(data && data.state == 100){
              var siteCityInfo_ = JSON.parse(siteCityInfo);
              var nowCityInfo = data.info;
              if(siteCityInfo_.cityid != nowCityInfo.cityid && cfg_auto_location == '1'){
                  // $.cookie("HN_changAutoCity", '1', {expires: 1, path: '/'});

                  changeAutoCity = $.dialog({
                    width: 250,
                    buttons: {
                      "取消": function() {
                        this.close();
                      },
                      "确定": function() {

                        if(device.toLowerCase().indexOf('huoniao') > -1 && device.toLowerCase().indexOf('android') > -1){
                            setupWebViewJavascriptBridge(function(bridge) {
                                bridge.callHandler('changeCity', JSON.stringify(nowCityInfo), function(){
                                    location.href = nowCityInfo.url + '?currentPageOpen=1' + (device.indexOf('huoniao') > -1 ? '&appIndex=1&appFullScreen' : '');
                                });
                            });
                        }else{
                            var channelDomainClean = typeof masterDomain != 'undefined' ? masterDomain.replace("http://", "").replace("https://", "") : window.location.host;
                            var channelDomain_1 = channelDomainClean.split('.');
                            var channelDomain_1_ = channelDomainClean.replace(channelDomain_1[0]+".", "");

                            channelDomain_ = channelDomainClean.split("/")[0];
                            channelDomain_1_ = channelDomain_1_.split("/")[0];

                            $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomainClean, path: '/'});
                            $.cookie(cookiePre + 'siteCityInfo', JSON.stringify(nowCityInfo), {expires: 7, domain: channelDomain_1_, path: '/'});

                            location.href = nowCityInfo.url + '?currentPageOpen=1' + (device.indexOf('huoniao') > -1 ? '&appIndex=1&appFullScreen' : '');
                        }

                      }
                    },
                    content: '<div style="text-align: center"> '+langData['siteConfig'][53][22]+'<div style="font-size: .5rem; color: #ff6600; padding: .1rem 0;"><strong>' + nowCityInfo.name + '</strong></div>'+langData['siteConfig'][53][23]+' </div>'//检测到你目前的城市为 是否切换
                  }).open();

              }
            }
          }
      })
    }
  });
  function getList(){
    if(isload) return false;
    isload = true;
    $.ajax({
        url: masterDomain + '/include/ajax.php?service=tuan&action=storeList&pageSize=3&orderby=2&voucher=1&page=1'+'&lng='+lng+'&lat='+lat,
        dataType: 'jsonp',
        success: function(data){
        if(data.state == 100){
              var list = data.info.list, html = [];
              for(var i = 0; i < list.length; i++){
                  html.push('<li class="fn-clear">');
                  html.push('<a href="'+list[i].url+'">');
                  html.push('<div class="s_img"><img src="'+list[i].litpic+'"></div>');
                  html.push('<div class="s_txt">');
                  html.push('<h2 class="s_title">'+list[i].company+'</h2>');
                  html.push('<p class="tuan">');

                  if(list[i].rating>0){
                    html.push('<span class="star_span"><em style="width: '+list[i].rating / 5 * 100+'%;"></em></span>')
                    html.push('<span class="tuan_num">'+langData['tuan'][0][13].replace('1',list[i].tuannum)+'</span></p>');//1条团购
                  }else{
                    html.push('<span class="star_no">'+langData['tuan'][0][14]+'</span>');//暂无评分
                    html.push('<span class="tuan_num tuan_num2">'+langData['tuan'][0][13].replace('1',list[i].tuannum)+'</span></p>');//1条团购
                  }


                  if(list[i].voucheArr!=''){
                    html.push('<div class="quan"><span>'+langData['tuan'][0][15]+'</span><em>'+list[i].voucheArr[0].price+'代'+list[i].voucheArr[0].market+echoCurrency('short')+'</em></div>');//券
                  }
                  html.push('<div class="addr fn-clear"><span>'+list[i].address+'</span><em>'+list[i].distance+'</em></div>');
                  html.push('</div>');
                  html.push('</a>');
                  html.push('</li>');
              }
              $('#store ul').html(html.join(''));
          }else{
          $('#store ul').html('<div class="loading">'+data.info+'</div>');
          }
        },
        error: function(){
            $('.loading').show();
        $('#store ul').html('<div class="loading">'+langData['siteConfig'][6][203]+'</div>');//网络错误，请重试！
        }
    });
  }
  //火热拼团
  function ptList(){
    ptLoad = true;
    $.ajax({
        url: masterDomain + '/include/ajax.php?service=tuan&action=tlist&iscity=1&pin=1&orderby=1&page=1&pageSize=5',
        dataType: 'jsonp',
        success: function(data){
          if(data.state == 100){
                var list = data.info.list, html = [];
                for(var i = 0; i < list.length; i++){
                  var cla=''
                  if(i==0){
                    cla='topLi'
                  }else{
                    cla='comLi'
                  }
                  html.push('<li class="fn-clear '+cla+'">');
                  html.push('<a href="'+list[i].url+'">');
                  html.push('<div class="s_img"><img src="'+list[i].litpic+'"></div>');
                  html.push('<div class="s_txt">');
                  html.push('<h2 class="ptTile">'+list[i].title+'</h2>');
                  html.push('<div class="pt_money"><span>'+echoCurrency('symbol')+'<strong>'+list[i].pinprice+'</strong></span><del>'+echoCurrency('symbol')+list[i].price+'</del></div>');
                  html.push('<div class="ptInfo">');
                  var pl = list[i].pinList;
                  if(i==0 && pl!=''){
                    var len = pl.length>2?2:pl.length;
                    var clal= pl.length>2?'ptImg2':'';
                    html.push('<div class="ptImg '+clal+'">');
                    for(var j = 0;j<len;j++){
                      html.push('<img src="'+pl[j].photo+'">')
                    }
                    html.push('</div>');
                  }

                  html.push('<span class="pin_num">'+langData['tuan'][0][16].replace('1',list[i].pinnum)+'</span>');//1人在拼团
                  html.push('</div>');
                  var ptState='';
                  if(list[i].state == 1){
                    ptState = langData['siteConfig'][19][507];//已结束
                  }else if(list[i].state == 2){
                    ptState = langData['tuan'][0][18];//已抢完
                  }else if(list[i].state == 3){
                    ptState = langData['tuan'][0][17];//开团
                  }
                  html.push('<span class="ptState">'+ptState+'</span>');
                  html.push('</div>');
                  html.push('</a>');
                  html.push('</li>');
                }
                $('.ptList ul').html(html.join(''));
          }else{
          $('.ptList ul').html('<div class="loading">'+data.info+'</div>');
          }
        },
        error: function(){
            $('.loading').show();
        $('.ptList ul').html('<div class="loading">'+langData['siteConfig'][6][203]+'</div>');//网络错误，请重试！
        }
    });
  }

  //推荐团购
  function recomList(){
    recomLoad = true;
    $.ajax({
        url: masterDomain + '/include/ajax.php?service=tuan&action=tlist&iscity=1&rec=1&orderby=1&page=1&pageSize=5',
        dataType: 'jsonp',
        success: function(data){
          if(data.state == 100){
                var list = data.info.list, html = [];
                for(var i = 0; i < list.length; i++){
                  var cla=''
                  if(i==0){
                    cla='topLi'
                  }else{
                    cla='comLi'
                  }
                  html.push('<li class="fn-clear '+cla+'">');
                  html.push('<a href="'+list[i].url+'">');
                  html.push('<div class="s_img"><img src="'+list[i].litpic+'"></div>');
                  html.push('<div class="s_txt">');
                  html.push('<h2 class="ptTile">'+list[i].title+'</h2>');
                  html.push('<div class="pt_money"><span>'+echoCurrency('symbol')+'<strong>'+list[i].price+'</strong></span><del>'+echoCurrency('symbol')+list[i].market+'</del></div>');
                  html.push('<div class="ptInfo">');
                  html.push('<span class="pin_num">'+langData['tuan'][0][16].replace('1',list[i].sale)+'</span>');//1人已团
                  html.push('</div>');
                  var ptState='';
                  if(list[i].state == 1){
                    ptState = langData['siteConfig'][19][507];//已结束
                  }else if(list[i].state == 2){
                    ptState = langData['tuan'][0][18];//已抢完
                  }else if(list[i].state == 3){
                    ptState = langData['tuan'][0][19];//去抢购
                  }
                  html.push('<span class="ptState">'+ptState+'</span>');
                  html.push('</div>');
                  html.push('</a>');
                  html.push('</li>');
                }
                $('.tuanList ul').html(html.join(''));
          }else{
          $('.tuanList ul').html('<div class="loading">'+data.info+'</div>');
          }
        },
        error: function(){
            $('.loading').show();
        $('.tuanList ul').html('<div class="loading">'+langData['siteConfig'][6][203]+'</div>');//网络错误，请重试！
        }
    });
  }
  //订单 发布
  $('.jia').click(function(){
    var t = $(this);

    if( $('.dindan').hasClass('dindan_show') || $('.dindan').hasClass('dindan_hide') ){
      if(t.hasClass('active')){
        $('.mask').hide();
        $('.dindan').removeClass('dindan_show');
        $('.fabu_t').removeClass('fabu_t_show');
        $('.dindan').addClass('dindan_hide');
        $('.fabu_t').addClass('fabu_t_hide');
        t.removeClass('jia_x');
        t.addClass('jia_y');
        t.removeClass('active');
      }else{
        $('.mask').show();
        $('.dindan').removeClass('dindan_hide');
        $('.fabu_t').removeClass('fabu_t_hide');
        $('.dindan').addClass('dindan_show');
        $('.fabu_t').addClass('fabu_t_show');
         t.addClass('jia_x');
         t.removeClass('jia_y');
        t.addClass('active');
      }
    }else{
      $('.mask').show();
        $('.dindan').removeClass('dindan_hide');
        $('.fabu_t').removeClass('fabu_t_hide');
        $('.dindan').addClass('dindan_show');
        $('.fabu_t').addClass('fabu_t_show');
         t.addClass('jia_x');
        t.addClass('active');
    }
   });



})
