$(function () {

  function getParam(paramName) {
      paramValue = "", isFound = !1;
      if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
          arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
          while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
      }
      return paramValue == "" && (paramValue = null), paramValue
  }


  if(getParam('pagetype')){
    pagetype = getParam('pagetype')

  }

   if($(window).scrollTop() > 0){
      $('.banner_wrap .header').addClass('fixed');
    }
    // banner轮播图
  new Swiper('.banner .swiper-container', {
    pagination:{ el: '.banner .pagination'} ,
    slideClass:'slideshow-item',
    autoplay: true,
    loop: true,
    slidesPerView : 1.2,
    // spaceBetween : 28,
    loopedSlides: 3,
    centeredSlides : true,
    on:{
      init:function(){
        $('.banner').removeClass('initBanner')
      }
    }
  });

  var device = navigator.userAgent;
  if(device.indexOf('huoniao') > -1){
    // $('.areachose').bind('click', function(e){
    //   setupWebViewJavascriptBridge(function(bridge) {
    //     bridge.callHandler('goToCity', {'module': 'shop'}, function(){});
    //   });
    //   return false;
    // });
  }else{
    $('.areachose').bind('click', function(){
        location.href = $(this).data('url');
    });
  }

  // 广告位2
  new Swiper('.advBox1 .swiper-container', {slideClass:'slideshow-item',loop: true,grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,}});
  
  //获取要定位元素距离浏览器顶部的距离
  var searchDom = $(".inp_wrap").html();
  $('.pageIndex .header .header-address').append('<div class="searchInp inpbox inp_wrap"> '+searchDom+'<a href="javascript:;" class="imgsearch-btn1"></a></div>')





   // 搜索框轮播
   new Swiper('.hotSearch', {slideClass:'swiper-slide',loop: true, grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,disableOnInteraction: false,},direction:'vertical'});

    // 滑动导航
  new Swiper('.swiper-nav .swiper-container', {pagination: {el:'.swiper-nav .pagination',},loop: true,grabCursor: true,paginationClickable: true}); 
  
  
    // 显示优惠券弹窗
    $.ajax({
        url: "/include/ajax.php?service=shop&action=quanList&lingquancenter=1&quantype=1&pageSize=3",
        type:'GET',
        dataType:'json',
        success:function (data) {
            if(data.state == 100) {
                var list = data.info.list;
                var quanlist = [];
                for(var i = 0; i < list.length; i++){

                    var quanmoney = '';
                    var promotio = list[i].promotio.replace(/(?:\.0*|(\.\d+?)0+)$/,'$1');
                    if(list[i].promotiotype ==0){
                        quanmoney = echoCurrency("symbol")+'<b>'+promotio+'</b>';
                    }else{
                        quanmoney = '<b>'+promotio+'</b>折';
                    }
                    quanlist.push('<li><div class="quan_amount">'+quanmoney+'</div>');
                    quanlist.push('<div class="quan_info"><h4>'+list[i].name+'</h4>');
                    quanlist.push('<p>'+list[i].ymdetime+'过期</p>');

                    if(list[i].is_lingqu ==1){

                        quanlist.push('<a href="'+(list[i].url?list[i].url:'javascript:;')+'" class="touse btn">去使用</a></div></li>')
                    }else{

                        quanlist.push('<a href="javascript:;" class="toget btn" data-id="'+list[i].id+'">领取</a></div></li>')
                    }
                }
                if(quanlist.length > 0){
                    $('.popquan_list').append(quanlist.join(''));
                    $(".quan_mask,.quan_pop").show();
                }
            }
        },
        error:function () {

        }
    })





    

  $('.close_pop').click(function(){
    $(".quan_mask,.quan_pop").hide();

  })

  $("body").delegate('.touse','click',function(){
     $(".quan_mask,.quan_pop").hide();
  })

  $('.popquan_list').delegate('.toget','click',function () {
      if(userid == null || userid == ""){
          window.location.href = masterDomain+'/login.html';
          return false;
      }
      var qid = $(this).attr('data-id');
      $.ajax({
          url: "/include/ajax.php?service=shop&action=getQuan&qid="+qid,
          type:'POST',
          dataType: "json",
          success:function (data) {
              if(data.state ==100){

                  showErrAlert(data.info)
                  $(".quan_mask,.quan_pop").hide();
              }else{
                  showErrAlert(data.info)
                  $(".quan_mask,.quan_pop").hide();
              }
          },
          error:function () {

          }
      });
  });

  // 搜图弹窗显示
  $(".imgsearch-btn").click(function(){
    $(".mask_upfile").show();
    $(".upfile_box").css('transform',"translateY(0)")
  });


  $('body').delegate('.imgsearch-btn1','click',function(e){
    $(".imgsearch .imgsearch-btn").click();
    // e.stopPropagation()
    return false;
  })

// 隐藏搜ST弹窗
  $(".cancelUpFile,.mask_upfile").click(function(){
    $(".mask_upfile").hide();
    $(".upfile_box").css('transform',"translateY(100%)")
  })


  //上传单张图片
  var uploadHolder;
    function mysub(id){
        var t = $("#"+id), p = t.parent();
        //uploadHolder = t.siblings('.selfimgbtn');
        uploadHolder = t.siblings('.imgsearch-btn');
        $(".cancelUpFile").click()
        var data = [];
        data['mod'] = 'shop';
        data['filetype'] = 'image';
        data['type'] = 'single';
        $.ajaxFileUpload({
          url: "/include/upload.inc.php",
          fileElementId: id,
          dataType: "json",
          data: data,
          success: function(m, l) {
            if (m.state == "SUCCESS") {
                var action = $('.imgsearch').attr('data-action');
                location.href = action + '?image=' + m.url;
                $('.soutu').hide();
            } else {
              uploadError(m.state, id, uploadHolder);
            }
          },
          error: function() {
            uploadError(langData['siteConfig'][6][203], id, uploadHolder);//网络错误，请重试！
          }
        });

    }

    function uploadError(info, id, uploadHolder){
        uploadHolder.removeClass('disabled');
    $('.soutu').html(info);
    setTimeout(function(){
      $('.soutu').hide();
    },1000)
    }

    $(".imgsearch-btn").bind("click", function(){
        var t = $(this), inp = t.siblings("input");
        if(t.hasClass("disabled")) return;
        inp.click();
    })

    $(".file_ImgUp").bind("change", function(){
        if ($(this).val() == '') return;
        $(this).siblings('.imgsearch-btn').addClass('disabled');
        mysub($(this).attr("id"));
      $('.soutu').html('<i></i><span>'+langData['shop'][6][34]+'</span>').show();//正在搜图
    })

  //搜图--取消
  $('.upfile_box .cancelUpFile').click(function(){
    $('.mask_upfile').hide();
    $('.upfile_box').removeClass('upshow')
  })

  //拍照传图结束
  $(".selfcamera").bind("change", function(){
    if ($(this).val() == '') return;
    console.log()
    mysub($(this).attr("id"));
    $('.soutu').html('<i></i><span>'+langData['shop'][6][34]+'</span>').show();//正在搜图

  })


    
  $('.search-form .type').click(function(event) {
        var par =$(this).closest('.search-form');
        par.find('.typelist').toggleClass('show');
  });

   $(".inp").delegate('#search', 'click', function(event) {
     if($(".header").hasClass('fixed')){
      $("#keywords").val($(".header .hotSearch .swiper-slide-active").text())
     }else{
      $("#keywords").val($(".search-form .hotSearch .swiper-slide-active").text())
     }
    $(this).closest('#sform2').submit();
   });
   //监听input输入
    $(".search-fixForm #topkeywords").bind('input propertychange', function () {
        var term = $(this).val();
        $('#botkeywords').val(term);
        if (term=='') {
              $('.search-form .imgsearch').show();
              $('.search-form .clear_inp').hide();
        }else{
            $('.search-form .imgsearch').hide();
            $('.search-form .clear_inp').show()
        }

    });

    $(".search-form #botkeywords").bind('input propertychange', function () {
        var term = $(this).val();
        $('#topkeywords').val(term);
        if (term!='') {
          $('.search-form .imgsearch').hide();
          $('.search-form .clear_inp').show();
        }else{
          $('.search-form .imgsearch').show();
          $('.search-form .clear_inp').hide();
        }

    });

  //清除头部input
  $(".search-form").delegate('.clear_inp', 'click', function(event) {
    $(".search-form .keys").val('');
    $('.clear_inp').hide();
    $('.search-form .imgsearch').show();

   });

  //点击头部搜索
  $(".header").delegate('.header-sou', 'click', function(event) {
    // window.location.href = searchUrl;
    // $('.pageIndex').addClass('fn-hide');
    // $(".searchPage").addClass('showPage');
    // $(".formbox input.searchInp").focus();
    $("#search").click()
  });

  $(".formbox").submit(function(){
    var action = $(".formbox").attr('action')
    var keywords = $(this).find('input.searchInp').val();
    if(keywords.trim() == ''){
      // $(this).find('input').val($(this).find('input').attr('placeholder'))
      keywords = $(this).find('input.searchInp').attr('placeholder')
    }
   $("#kws").val(keywords);
  })

  $('.banner_wrap .header').append('<i class="header-sou"></i>')

  // input置顶
 



    $(window).scroll(function(){
        var isFocus=$("#botkeywords").is(":focus");
        if(true==isFocus){
          $("#botkeywords").blur();
        }

        




        var tabH = $(".good_wrap").offset().top -48;
        //获取滚动条的滑动距离
        var scroH = $(this).scrollTop();
          if(scroH >= $(".banner_wrap .header").height()){
              $('.banner_wrap .header').addClass('fixed');

          }else{
              $('.banner_wrap .header').removeClass('fixed');

          }


        if(tabH < scroH){
            $('.blackFix .good_tab').addClass('active');
            $('.blackFix').addClass('show');
            if($('.blackFix .good_tab').size() == 0){
              $('.blackFix ').append($('.good_wrap .good_tab ul'));
            }
        }else{
            $('.blackFix .good_tab').removeClass('active');
            $('.blackFix').removeClass('show');
            if($('.good_wrap .good_tab ul').size() == 0){
              $('.good_wrap .good_tab').append($('.blackFix ul'));
            }
        }
        var sh = $('.goodlist li').height();
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - sh - w;
        var tload = $('.tab_ul li.curr').attr('data-isload');

        if ($(window).scrollTop() > s_scroll && tload == '0') {
            var page = parseInt($('.tab_ul .curr').attr('data-page')),
                totalPage = parseInt($('.tab_ul .curr').attr('data-totalPage'));
            if (page < totalPage) {
                ++page;
                $('.tab_ul .curr').attr('data-page', page);
                getList();
            }
      };

    })


    // 滑动导航
    var t = $('.tcInfo .swiper-wrapper');
    var swiperNav = [], mainNavLi = t.find('li');
    for (var i = 0; i < mainNavLi.length; i++) {
        swiperNav.push('<li>'+t.find('li:eq('+i+')').html()+'</li>');
    }

    var liArr = [];
    for(var i = 0; i < swiperNav.length; i++){
        liArr.push(swiperNav.slice(i, i + 10).join(""));
        i += 9;
    }

    t.html('<div class="swiper-slide"><ul class="fn-clear">'+liArr.join('</ul></div><div class="swiper-slide"><ul class="fn-clear">')+'</ul></div>');
    new Swiper('.tcInfo .swiper-container', {pagination: {el:'.tcInfo .pagination',}, loop: false, grabCursor: true, paginationClickable: true});


    getHuodong()

    function getHuodong(){

       $.ajax({
          url: "/include/ajax.php?service=shop&action=huodongOpen&pagetype="+pagetype,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data.state == 100){
                var list = data.info.list;
                // 限时抢购
                if(Boolean(list['1']) && list['1'] != 'undefined'){
                  gettime();
                //   $('.qgou').show();
                }else{
                  $('.qgou').hide();
                }

                // 准点秒杀
                if(Boolean(list['2'])  && list['2'] != 'undefined' && list['2'].length >= 3){ 
                  mshaList(list['2']);  
                  $(".public.msha #miaoshacount").text(data.info.pageinfo.miaoCount);
                  $('.msha').show();
                }else{
                   $(".public.msha").addClass('fn-hide');
                   $('.msha .puBox').html('<div class="nodata">暂无数据!</div>');
                   $('.msha').hide();
                }

                // 砍价狂欢
                if(Boolean(list['3']) && list['3'] != 'undefined' && list['3'].length > 0){
                    kanjiaList(list['3'])
                    $('.kanWrap').show();
                }else{
                    $('.kanWrap').hide();
                }

                // 热门团购
                if(Boolean(list['4']) && list['4'] != 'undefined' && list['4'].length >= 3 && pagetype != '2'){
                  hotpinList(list['4']);
                  $(".hotTuan").show()
                }else if(Boolean(list['6'])  && list['6'] != 'undefined' && list['6'].length >= 3 && pagetype != '1'){
                  $(".hotTuan .tuan_title").addClass('fn-hide')
                  $(".hotTuan .shop_title").removeClass('fn-hide');
                  hotpinList(list['6']);
                  $(".hotTuan").show()
                }else{
                  $(".hotTuan").hide()
                }

                // 拼团特惠
                if(Boolean(list['5']) && list['5'] != 'undefined' && list['5'].length > 3){
                  pinList(list['5'])
                  $(".pinTuan").show()
                }else{
                  $(".pinTuan").hide()
                }


            }else{
                $('.qgou, .public.msha, .kanWrap, .hotTuan, .pinTuan').hide();

            }
          },
          error:function(){},
        })


    }





  //倒计时
  function cutDownTime(setime,datatime){
    var eday = 3;
    var jsTime = parseInt((new Date()).valueOf()/1000);
    var timeOffset = parseInt(jsTime - setime);
      var end = datatime*1000;  //点击的结束抢购时间的毫秒数
      var newTime = Date.parse(new Date()) - timeOffset;  //当前时间的毫秒数
      var youtime = end - newTime; //还有多久时间结束的毫秒数
      var timeArr = [];
      if(youtime <= 0){
        timeArr = ['00','00','00','00'];
        return timeArr;
        return false;
      }
      var seconds = youtime/1000;//秒
      var minutes = Math.floor(seconds/60);//分
      var hours = Math.floor(minutes/60);//小时
      var days = Math.floor(hours/24);//天

      var CDay= days ;
      var CHour= hours % 24 ;
      if(CDay <= eday){//3天之内的只要小时 不要天
          CHour = CHour + CDay*24;
          CDay = 0;
      }
      var CMinute= minutes % 60;
      var CSecond= Math.floor(seconds%60);//"%"是取余运算，可以理解为60进一后取余数
      var c = new Date(Date.parse(new Date()) - timeOffset);
      var millseconds=c.getMilliseconds();
      var Cmillseconds=Math.floor(millseconds %100);
      if(CSecond<10){//如果秒数为单数，则前面补零
        CSecond="0"+CSecond;
      }
      if(CMinute<10){ //如果分钟数为单数，则前面补零
        CMinute="0"+CMinute;
      }
      if(CHour<10){//如果小时数为单数，则前面补零
        CHour="0"+CHour;
      }
      if(CDay<10){//如果天数为单数，则前面补零
        CDay="0"+CDay;
      }
      if(Cmillseconds<10) {//如果毫秒数为单数，则前面补零
        Cmillseconds="0"+Cmillseconds;
      }
      if(CDay > 0){
        timeArr = [CDay,CHour,CMinute,CSecond];
        return timeArr;
      }else{
        timeArr = ['00',CHour,CMinute,CSecond];
        return timeArr;
      }
  }
    
  function gettime(){
        $.ajax({
            url: "/include/ajax.php?service=shop&action=getConfigtime&gettype=1",
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            if(data.state == 100){
              var list = data.info, nextHour = data.info.nextHour,times;

              var now = list[0].now;
              times = list[0].etimestr;
              nextHour = list[0].changci;
            if(now >= list[0].ktimestr && now <= list[0].etimestr){
              $('.qgTime').text(list[0].title)
              changeImg(nextHour);
              var shtml = [];
              setInterval(function(){
                shtml = cutDownTime(serviceTime,times)
                $('#timeCounter .hour').text(shtml[1])
                $('#timeCounter .minute').text(shtml[2])
                $('#timeCounter .second').text(shtml[3])
              },1000) ;
              
              $('.qgou').find('#timeCounter').attr('data-time',times);
            }else{
              $('.qgou').hide();
            }


            }
          }
        });
    }
  function changeImg(nextHour){
    $.ajax({
      url: "/include/ajax.php?service=shop&action=proHuodongList&huodongstate=1&huodongtype=1&pagetype="+pagetype+"&changci="+nextHour+"&pageSize=10",
      type: "GET",
      dataType: "jsonp",
      success: function (data) {
        if(data.state == 100){
            var list = data.info.list,html=[];
            if(list.length >= 3){
              for(var i = 0; i < list.length; i++){
                var pic = list[i].litpic == false || list[i].litpic == '' ? '/static/images/blank.gif' : list[i].litpic;
                html.push('<div class="swiper-slide act"><a href="'+list[i].url+'">');
                html.push('  <div class="qg_img"><img src="'+pic+'" alt="">');
                if(list[i].is_daodian == 1){
                  html.push('    <span class="daodian">到店</span>');
                }
                html.push('      </div>');
                html.push('  <div class="qgInfo">');
                html.push('    <h3>'+list[i].title+'</h3>');
                var str = '';
                if(list[i].huodongsales > 0){
                  str = '<span>已售'+list[i].huodongsales+'件</span>'
                }
                html.push('    <p class="qgSale"><i style="width:'+(list[i].huodongsales/list[i].huodonginventory*100)+'%"></i><label style="width:'+(list[i].sales/list[i].huodonginventory*100)+'%"></label>'+ str +'</p>');//还有 仅剩8件
                html.push('    <div class="qgOther">');
                html.push('      <div class="qgPrice">');
                var sPrice = parseFloat(list[i].huodongprice);
                sPrice = sPrice.toString().split('.');
                if(sPrice.length > 1){
                  html.push('        <span>'+echoCurrency('symbol')+'<strong>'+sPrice[0]+'</strong>.'+sPrice[1]+'</span>');
                }else{
                  html.push('        <span>'+echoCurrency('symbol')+'<strong>'+sPrice[0]+'</strong></span>');
                }
                
                html.push('        <s>'+echoCurrency('symbol')+parseFloat(list[i].mprice)+'</s>');
                html.push('      </div>');
                html.push('      <span class="jiagou"></span>');
                html.push('    </div>');
                html.push('  </div>');
                html.push('</a></div>');

              }
              $('.tc-activity').html(html.join(''))
              $('.qgou').show();
              //活动滚动
              var swiper = new Swiper('.boxCon .swiper-container', {
                  slidesPerView: 'auto',

              });
            }else{
              $('.qgou').hide();
            }

        }else{
             $('.qgou').hide();
        }
      }
    });

  }
  //热门团购
  // hotpinList();
  function hotpinList(list){
    var html = [];
    for(var i = 0; i < 3; i++){
      var pic = list[i].litpic == false || list[i].litpic == '' ? '/static/images/404.jpg' : list[i].litpic;
      // var detailurl = detailUrl.replace('%id%',list[i].id)
      var detailurl = list[i].url;
      html.push('<li><a href="'+detailurl+'">');
      html.push('  <div class="topImg"><img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
      if(list[i].is_daodian == 1){
        html.push('    <span class="daodian">到店</span>');
      }
      html.push('    </div>');
      html.push('  <div class="hottuanInfo">');
      html.push('    <h2>'+list[i].title+'</h2>');
      html.push('    <h3>'+list[i].storeTitle+'</h3>');
      html.push('    <p class="htuanPrice">');
      //   var sPrice = list[i].price.split('.');
      // html.push('      <span>'+echoCurrency('symbol')+'<strong>'+sPrice[0]+'</strong>.'+sPrice[1]+'</span>');



      var sPrice = parseFloat(list[i].price);
          sPrice = sPrice.toString().split('.');
      if(sPrice.length > 1){
        html.push('        <span>'+echoCurrency('symbol')+'<strong>'+sPrice[0]+'</strong>.'+sPrice[1]+'</span>');
      }else{
        html.push('        <span>'+echoCurrency('symbol')+'<strong>'+sPrice[0]+'</strong></span>');
      }



      html.push('      <s>'+echoCurrency('symbol')+parseFloat(list[i].mprice)+'</s>');
      html.push('    </p>');
      html.push('    <div class="htSale">');
      if(list.sales > 0){
        html.push('      <em>已售'+list[i].sales+'</em>');
      }else{
        html.push('      <em>热售中</em>');
      }
      
      html.push('      <span>抢购</span>');
      html.push('    </div>');
      html.push('  </div>');
      html.push('</a></li>');
    }
    $('.hottuanlist ul').html(html.join(''))

  }
  
  //拼团列表
  // pinList();
  function pinList(list){
    var html = [];
    for(var i = 0; i < list.length; i++){
      var pic = list[i].litpic == false || list[i].litpic == '' ? '/static/images/404.jpg' : list[i].litpic;
      var detailurl = detailUrl.replace('%id%',list[i].id)
      html.push('<div class="swiper-slide"><a href="'+detailurl+'">');
      html.push('  <div class="top_img">');
      html.push('    <img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
      if(list[i].is_daodian == 1){
        html.push('    <span class="daodian">到店</span>');
      }
      
      html.push('    <p>'+list[i].huodongnumber+'人团</p>');
      html.push('  </div>');
      html.push('  <div class="ptInfo">');
      // var sPrice = list[i].huodongprice.split('.');
      // html.push('    <p class="ptPrice"><span>'+echoCurrency('symbol')+'<strong>'+sPrice[0]+'</strong>.'+sPrice[1]+'</span><s>'+echoCurrency('symbol')+list[i].mprice+'</s></p>');

       var sPrice = parseFloat(list[i].huodongprice);
          sPrice = sPrice.toString().split('.');
      if(sPrice.length > 1){
        html.push('    <p class="ptPrice"><span>'+echoCurrency('symbol')+'<strong>'+sPrice[0]+'</strong>.'+sPrice[1]+'</span><s>'+echoCurrency('symbol')+parseFloat(list[i].mprice)+'</s></p>')
      }else{
        html.push('    <p class="ptPrice"><span>'+echoCurrency('symbol')+'<strong>'+sPrice[0]+'</strong></span><s>'+echoCurrency('symbol')+parseFloat(list[i].mprice)+'</s></p>')
      }


      if(list[i].huodongsales > 0){

         html.push('    <span class="ptSale">已拼'+list[i].huodongsales+'件</span>');
      }else{
        html.push('    <span class="ptSale">热拼中</span>');
      }
      html.push('  </div>');
      html.push('</a></div>');
    }
    $('.pintuanlist .swiper-wrapper').html(html.join(''))
    var ptswiper = new Swiper('.pintuanlist .swiper-container', {
        slidesPerView: 'auto',
    });

  }
  //砍价列表
  // kanjiaList();
  var rzSw = new Swiper('.kantit .swiper-container', 
      { direction : 'vertical',loop: true,
      autoplay:{delay: 1500}
      });
  function kanjiaList(list){
    var html = [];
    for(var i = 0; i < list.length; i++){
      var pic = list[i].litpic == false || list[i].litpic == '' ? '/static/images/blank.gif' : list[i].litpic;
      var kanDet = kanUrl.replace('%id%',list[i].id)
      html.push('<div class="swiper-slide "><a href="'+kanDet+'">');
      html.push('  <div class="kanImg"><img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
      html.push('  <div class="kanInfo">');
      html.push('    <h3>'+list[i].title+'</h3>');
      html.push('    <p class="mPrice">'+echoCurrency('symbol')+'<span>'+list[i].price+'</span></p>');
      html.push('    <p class="nPrice">');
      var npriceArr = list[i].floorprice.split('.');
      html.push('      <span>'+echoCurrency('symbol')+'<strong>'+npriceArr[0]+'</strong><em>.'+npriceArr[1]+'</em></span>');
      html.push('      <b>砍</b>');
      html.push('    </p>');
      html.push('  </div>');
      html.push('</a></div>');
    }
    if(list.length == 1){
      $('.kanCon .swiper-wrapper').addClass('widthAll')
    }
    
    $('.kanCon .swiper-wrapper').html(html.join(''))
    $('.kanWrap').show();
    //砍价滚动
    var kanSwiper = new Swiper('.kanCon .swiper-container', {
        slidesPerView: 'auto',
    });

  }

  //准点秒杀
  // 
  function mshaList(list){
    var html = [];
    for(var i = 0; i < 3; i++){
        var pic = list[i].litpic == false || list[i].litpic == '' ? '/static/images/404.jpg' : list[i].litpic;
        html.push('<div class="goodbox">');
        html.push('  <a href="'+list[i].url+'">');
        html.push('  <div class="boxImg">');
        html.push('    <img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';">');
        if(list[i].is_daodian == 1){
          html.push('    <span class="daodian">到店</span>');
        }
        
        html.push('    <div class="boxText">');
        html.push('      <div class="msleft">');
        //var sPrice = list[i].huodongprice.split('.');
        var sPrice = list[i].huodongprice.split('.');
        var ssprice = sPrice[1]>0?'.'+sPrice[1]:'';
        html.push('        <p class="msPrice">'+echoCurrency('symbol')+'<strong>'+sPrice[0]+ssprice+'</strong></p>');
        //开始 或者 仅剩
        var timestamp = Date.parse(new Date());
        if (timestamp > list[i].ktimestr) {
            html.push('        <div class="msTime" data-kstime="'+list[i].etimestr+'"><span class="kspan">仅剩</span>');
        } else {

            html.push('        <div class="msTime" data-kstime="'+list[i].ktimestr+'"><span class="kspan">开始</span>');
        }
        html.push('         <span class="hour">00</span><em>:</em>');
        html.push('        <span class="minute">00</span><em>:</em>');
        html.push('         <span class="second">00</span>');
        html.push('      </div>');
        html.push('      </div>');
        html.push('      <b>抢</b>');                       
        html.push('    </div>');
        html.push('  </div>');
        html.push('  <h2 class="msTitle">'+list[i].title+'</h2>   ');       
        html.push('  </a>');
        html.push('</div>');
      }
      $('.msha .puBox').html(html.join(''))
      $('.msha .puBox').find('.msTime').each(function(){
        var t = $(this),inx = t.index();
        var stimes =t.attr('data-kstime');
        var shtml = [];
        setInterval(function(){
          shtml = cutDownTime(serviceTime,stimes);
          let hours=Number(shtml[0])*24+Number(shtml[1]);
          t.find('.hour').text(hours);
          t.find('.minute').text(shtml[2]);
          t.find('.second').text(shtml[3]);
        },1000) ;
      })

  }
  


  var orderType,tid;

  //获取准点秒杀是否即将开始
  var now = Date.parse(new Date())/1000;  //当前时间的毫秒数
  $('.goodbox').each(function(){
    var kstime = $(this).data('kstime');
    if(kstime>now){
      $(this).addClass('mnostart');
      $(this).append('<span class="ks_span">'+langData['shop'][6][16]+'</span>');//即将开始
    }
  })
  //左右导航切换
  var tabsSwiper = new Swiper('#tabs-container', {
    speed: 350,
    touchAngle: 35,
    observer: true,
    observeParents: true,
    freeMode: false,
    longSwipesRatio: 0.1,
    autoHeight: true,
    on: {
        slideChangeTransitionStart: function() {
            $(".tab_ul .curr").removeClass('curr');
            $(".tab_ul li").eq(tabsSwiper.activeIndex).addClass('curr');
            var len = $("#tabs-container .swiper-slide").eq(tabsSwiper.activeIndex).find('li').length;
            var len2 = $("#tabs-container .swiper-slide").eq(tabsSwiper.activeIndex).find('.empty').length;
            if(len != 0 || len2 != 0){
            }else{
              getList();
            }
            
        },
    },
  })
  $('.tab_ul li').click(function() {
      var i = $(this).index();
      if (!$(this).hasClass('curr')) {
          $(this).addClass('curr').siblings().removeClass('curr');
          tabsSwiper.slideTo($(this).index());
      }
      if($(".blackFix").hasClass("show")){
        $(window).scrollTop($(".good_wrap .good_tab").offset().top - $(".blackFix").height())
      }

  })

  if(pagetype == 2){
    $('.tab_ul li').eq(1).click()
    setTimeout(function(){
       $(".goodlist .swiper-container").addClass('swiper-no-swiping')
    })
  }
    // 定位
    var localData = utils.getStorage('user_local');
    var userLat = userLng = '';
    var local = false
    if(localData){
      var time = Date.parse(new Date());
      time_ = localData.time;
      // 缓存1小时
      if(time - time_ < 3600 * 1000){
          lat = localData.lat;
          lng = localData.lng;
          local = true;
      }

  }

    var tindex = parseInt($('.tab_ul li.curr').attr('data-action'));
    if(tindex == 2){
        getList();
    }
    if(local && tindex == 1){ //本地存储有定位数据
        userLat = localData.lat;
        userLng = localData.lng;
        getList();
    }else{ //没有数据 需要定位
        var objId = $('#tabs-container .swiper-slide-active .comList')

        if(tindex == 1){
            objId.find('.loading').remove();
            objId.append('<div class="loading">定位中</div>');
        }
        HN_Location.init(function(data){
            if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
                if(tindex == 1){
                    showErrAlert(langData['siteConfig'][27][136]);
                    getList();
                }
            }else{
                userLng = data.lng;
                userLat = data.lat;
                var time = Date.parse(new Date());
                utils.setStorage('user_local', JSON.stringify({'time': time, 'lng': userLng, 'lat': userLat, 'address': data.address}));
                if(tindex == 1){
                    getList();
                }
            }
        })
    }
    

    // var storeListArr = [];
    // function getStoreList(){
    //     console.log(222)
    //     $.ajax({
    //         url: "/include/ajax.php?service=shop&action=store&rec=1&page=1&pageSize=5&lng="+userLng+'&lat='+userLat,
    //         type: "GET",
    //         dataType: "jsonp",
    //         success: function (data) {
    //             var list = data.info.list,html=[];
    //             if(data && data.state == 100){
    //                 storeListArr = list;
    //                 //初始加载
    //                 getList();
    //             }else{
    //                getList();
    //             }
    //         },
    //         error:function(){
    //             //初始加载
    //             getList();
    //         }
    //     });
    // }
    

  var isload = false;

  //数据列表
  function getList(){
    var tload = $('.tab_ul li.curr').attr('data-isload'); 
    if (tload == '1'){
      return false;
    }
    $('.tab_ul li.curr').attr('data-isload','1');
    var tindex = parseInt($('.tab_ul li.curr').attr('data-action'));

    var objId = $('#tabs-container .swiper-slide-active .comList')
    objId.find('.loading').remove();
    objId.append('<div class="loading">加载中</div>');
    var spage = $('.tab_ul li.curr').attr('data-page');
    //请求数据
    var data = [];
    data.push("pageSize=15");
    data.push("page="+spage);
    var url ='';
    if(tindex == 1){//本地团购
    //   url=  "/include/ajax.php?service=shop&action=tuanSlist&pagetype=1&moduletype=1&rec=1&userlng="+userLng+'&userlat='+userLat;
      url=  "/include/ajax.php?service=shop&action=tuanSlist&pagetype=1&rec=1&userlng="+userLng+'&userlat='+userLat;
    }else{//精选商品
    //   url=  "/include/ajax.php?service=shop&action=slist&moduletype=2&pagetype=2";
      url=  "/include/ajax.php?service=shop&action=slist&moduletype=2";
    }



    $.ajax({
      url:  url,
      data: data.join("&"),
      type: "GET",
      dataType: "jsonp",
      success: function (data) {   
        if(data && data.state == 100){
          var list = data.info.list, pageinfo = data.info.pageInfo,totalPage = pageinfo.totalPage, lr;
          $('.tab_ul li.curr').attr('data-totalpage',totalPage);
          var html1 = [], html2=[];
          //2,5,10,15,20的位置 把商家的数据塞进来
          
          
          // console.log(list)
          if(list.length > 0){
            objId.find('.loading').remove()
            for(var i = 0; i < list.length; i++){
                var html = [],hhtml = [];
              lr = list[i];
              var pic = lr.litpic == false || lr.litpic == '' ? '/static/images/404.jpg' : lr.litpic;
              if(tindex == 1){//本地团购
                    
                  var cla = '',julitxt = '',picTxt = '';
                  if(!lr.store){//商家
                    cla='storeLi';
                    pic = lr.logo == false || lr.logo == '' ? '/static/images/404.jpg' : lr.logo;
                    if(lr.shoptype=='1'){
                      julitxt = '  <span class="juli">'+lr.distance+'</span>';
                    }
                    
                    picTxt ='<img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/shop.png\';">'
                  }else{
                     picTxt ='<img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';">'
                  }
                  html.push('<li class="'+cla+'"><a href="'+lr.url+'">');
                  html.push('  <div class="goodImg">');                 
                  html.push(julitxt);                
                  html.push(picTxt+'  </div>');
                  html.push('  <div class="goodInfo"> ');                                                 
                  html.push('    <h2 class="goodTitle">'+lr.title+'</h2>');
                  if(!lr.store){//商家
                    html.push('  <div class="storeAdr">'+lr.address+'</div>');
                    html.push('<div>');    
                    var chaPrice = parseInt(lr.xlpromprice - lr.xlproprice);
                      var zhePrice = parseFloat(((lr.zkproprice/lr.zkpromprice)*10).toFixed(1));  
                    if(Number(lr.xlpromprice) > Number(lr.xlproprice))   {

                      html.push('  <div class="goodHui">');
                      
                      if(chaPrice){
                        html.push('    <p class="hui"><em>惠</em><span>立省'+chaPrice+'</span></p>');
                      }
                      
                      if(lr.xlprotitle){
                        html.push('    <p class="huiInfo">'+lr.xlprotitle+'</p>');
                      }
                      
                      html.push('  </div>');
                    }     

                    if(zhePrice > 0 && zhePrice < 10 || lr.zkprotitle){
                      
                      html.push('  <div class="goodHui">');
                      if(zhePrice > 0 && zhePrice < 10){
                        html.push('    <p class="hui"><em>惠</em><span>'+zhePrice+'折</span></p>');
                      }
                      
                      if(lr.zkprotitle){
                        html.push('    <p class="huiInfo">'+lr.zkprotitle+'</p>');
                      }
                      html.push('  </div>  ');
                    }
                    html.push('</div>');
                    html.push('  </div>');
                  }else{
                    html.push('    <div class="goodSale">');
                    if(lr.sales > 0){
                      html.push('      <span>已售'+lr.sales+'</span>');
                      html.push('      <em></em>');
                    }
                    
                    var juli = parseFloat(lr.julishop.toFixed(1)) > 1 ? (parseFloat(lr.julishop.toFixed(1)) + 'km') : (parseFloat(lr.julishop.toFixed(1)) * 1000) + 'm'
                    html.push('      <span>'+juli+'</span>');
                    html.push('    </div>');
                    html.push('    <div class="goodPrice">');
                    var priArr = parseFloat(lr.price).toString().split('.');
                    var smallPoint = priArr.length >　1 ?　'<em>.'+priArr[1]+'</em>' : ''
                    html.push('      <span class="newPrice">'+echoCurrency('symbol')+'<strong>'+priArr[0]+'</strong>'+smallPoint+'</span>');
                    html.push('      <span class="oldPrice">'+echoCurrency('symbol')+'<em>'+parseFloat(lr.mprice)+'</em></span>');
                    html.push('    </div>  ');   
                    html.push('  </div>');
                    html.push('  <div class="goodStore">'+lr.storeTitle+'</div>');
                  }
                  html.push('</a></li>');
                if(i % 2 == 0){
                  if(spage%2 == 1){
                    html1.push(html.join(""))
                  }else{
                    html2.push(html.join(""))
                  }
                }else{
                    if(spage%2 == 1){
                      html2.push(html.join(""))
                    }else{
                      html1.push(html.join(""))
                    }
                    
                }
              }else{//精选商品

                
                  var cla = 'comLi';
                  if(lr.huodongarr==1 || lr.huodongarr==4){
                    cla='';
                  }
                  html.push('<li class="'+cla+'"><a href="'+lr.url+'">');
                  html.push('  <div class="goodImg"><img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"></div>');
                  html.push('  <div class="goodInfo">');  
                  var qtxt = '';
                  if(lr.huodongarr==1){//准点抢购特有
                    qtxt='<span class="xianshi">限时抢</span>';
                  }                    
                  html.push('    <h2 class="goodTitle">'+qtxt+lr.title+'</h2>');
                  var scla = '';
                  if(lr.huodongarr==1 || lr.huodongarr==4){//拼团 准点抢购特有
                    scla = 'tesPrice';
                  }
                  html.push('    <div class="choicePrice '+scla+'">');
                  if(lr.huodongarr==1 || lr.huodongarr==4){//拼团 准点抢购特有
                    html.push('      <p class="spePrice">');
                    var priArr = parseFloat(lr.huodongprice).toString().split('.');
                    var smallPoint = priArr.length >　1 ?　'<em>.'+priArr[1]+'</em>' : ''
                    html.push('      <span class="newPrice">'+echoCurrency('symbol')+'<strong>'+priArr[0]+'</strong>'+smallPoint+'</span>');
                    html.push('        <s class="oldPrice">'+echoCurrency('symbol')+parseFloat(lr.mprice)+'</s>');

                    html.push('      </p>');
                    html.push('      <s class="pr-bg"></s>');
                    var pstxt = '';
                    if(lr.huodongarr==1){//准点抢购
                      pstxt = lr.changciname;
                      var ktime = list[i].huodongktime * 1000;
                      var hour = new Date(ktime).getHours()
                      pstxt = hour + '点场';
                    }else{
                      pstxt = lr.huodongnumber+'人拼'
                    }
                    html.push('      <span class="psPan">'+pstxt+'</span>');    
                  } else{
                    var priArr = parseFloat(lr.price).toString().split('.');
                    var smallPoint = priArr.length >　1 ?　'<em>.'+priArr[1]+'</em>' : ''
                    html.push('      <span class="newPrice">'+echoCurrency('symbol')+'<strong>'+priArr[0]+'</strong>'+smallPoint+'</span>');
                    if(lr.quanhave ==1){
                      html.push('<span class="quanspan">券</span>');
                    }
                  }                  
                  html.push('   </div>');

                  html.push('    <div class="choiceSale">');
                  if(lr.huodongarr==1){//准点抢购特有
                    var djstime = $('#timeCounter').attr('data-time');
                    if(serviceTime <= list[i].huodongktime){
                      html.push('      <div class="tsTime" data-time="'+list[i].huodongktime+'"><i></i>');
                    }else if(serviceTime > list[i].huodongktime && serviceTime <= list[i].huodongetime){
                      html.push('      <div class="tsTime" data-time="'+list[i].huodongetime+'"><i></i>');
                    }else{
                       html.push('      <div class="tsTime" data-time="'+list[i].djstime+'"><i></i>');
                    }
                    
                    html.push('         <span class="hour">00</span><em>:</em>');
                    html.push('        <span class="minute">00</span><em>:</em>');
                    html.push('         <span class="second">00</span>');
                    html.push('       </div>');
                  }
                  var saleTxt = lr.huodongarr==4?'已拼':'已售';
                  if(lr.sales > 0){
                    html.push('      <p class="hasSale">'+saleTxt+lr.sales+'</p>');
                  }
                  
                  html.push('    </div>');
                  html.push('  </div>');
                  html.push('</a></li>');
                  if(i % 2 == 0){
                    if(spage%2 == 1){
                      html1.push(html.join(""))
                    }else{
                      html2.push(html.join(""))
                    }
                  }else{
                      if(spage%2 == 1){
                        html2.push(html.join(""))
                      }else{
                        html1.push(html.join(""))
                      }
                      
                  }
                
              }
              
            }

            if(spage == 1){
              objId.find('.list_ul1').html(html1.join(""));
              objId.find('.list_ul2').html(html2.join(""));
            }else{
              objId.find('.list_ul1').append(html1.join(""));
              objId.find('.list_ul2').append(html2.join(""));
            }
            objId.find('.tsTime').each(function(){
              var t = $(this),inx = t.index();
              var stimes =t.attr('data-time');
              var shtml = [];
              setInterval(function(){
                shtml = cutDownTime(serviceTime,stimes)
                t.find('.hour').text(shtml[1]);
                t.find('.minute').text(shtml[2]);
                t.find('.second').text(shtml[3]);
              },1000) ;
            })
            
            tload = '0';
            $('.tab_ul li.curr').attr('data-isload',tload);
            if(spage >= totalPage){
                tload = '1';
                $('.tab_ul li.curr').attr('data-isload',tload);
                objId.append('<div class="loading">没有更多了</div>');//没有更多了
            }

          //没有数据
          }else{
            tload = '1';
            $('.tab_ul li.curr').attr('data-isload',tload);
            objId.find('.loading').html('<div class="empty"></div><p>暂无数据!</p>');
            // $('.good_wrap .good_tab').addClass('fn-hide');
            // $(".goodlist .swiper-container").addClass('swiper-no-swiping')
            // $('.blackFix').remove();
            // if(tindex == 0){
            //   $(".tab_ul li").eq(1).click();
            // }else{
            // 	 if($(".localList li").length == 0){
            //   		$('.good_wrap').addClass('fn-hide');

            // 	 }else{
            // 	 	$(".tab_ul li").eq(0).click();
            // 	 }
            // }
          }

        //请求失败
        }else{
          // $('.good_wrap .good_tab').addClass('fn-hide');
          // $(".goodlist .swiper-container").addClass('swiper-no-swiping')
          // $('.blackFix').remove();
          // if(tindex == 0){ //本地团购没有数据
          //     $(".tab_ul li").eq(1).click();
          // }else {
          // 	 if($(".localList li").length == 0){
          // 		$('.good_wrap').addClass('fn-hide');

        	 // }else{
        	 // 	$(".tab_ul li").eq(0).click();
        	 // }
          // }
          tload = '0';
          $('.tab_ul li.curr').attr('data-isload',tload);
          objId.find('.loading').html('<div class="empty"></div><p>'+data.info+'</p>');
        }
        tabsSwiper.updateAutoHeight(100);
        
      },
      error: function(){
        tload = '0';
        //网络错误，加载失败
        objId.find('.loading').html('网络错误，加载失败'); // 网络错误，加载失败
        $('.tab_ul li.curr').attr('data-isload',tload);
      }
     });
  }

  // 搜索页
  var keywords = '';
  // 显示搜索页
  $(".inp_wrap").click(function(e){
    if(e.target != $(".imgsearch-btn1")[0]) {
      $('.pageIndex').addClass('fn-hide');
      $(".searchPage").addClass('showPage');
      keywords = $(e.target).text();
      if(keywords && !$(e.target).hasClass('toSearch')){
        // $(".formbox input.searchInp").val(keywords).siblings('.clear_inp').removeClass('fn-hide')
        $(".formbox input.searchInp").attr('placeholder',keywords)
      }
      $(".formbox input.searchInp").focus();
    }
    
  })

  // 隐藏搜索页
  $(".searchPage .goback,.back_index").click(function(){
    $('.pageIndex').removeClass('fn-hide');
    $(".searchPage").removeClass('showPage');
    $(".formbox input.searchInp").val('').siblings('.clear_inp').addClass('fn-hide')
    $(".blackFix ").removeClass('show')
  });

  // 清空
  $(".searchPage .clear_inp").click(function(){
    $(this).addClass('fn-hide')
    $(".formbox input.searchInp").val('');
    $(".formbox input.searchInp").focus();
  });

  // 输入框
  $(".formbox input.searchInp").on('input',function(){
    var t = $(this);
    var keywords = t.val().trim()
    if(t.val()!=""){
      t.siblings('.clear_inp').removeClass('fn-hide');
    }else{
      t.siblings('.clear_inp').addClass('fn-hide')
    }
  });


  var history = utils.getStorage('history_search_shop');
  if(history){
    history = history.reverse();
    checkHistory(history)
  }

  // 删除搜索记录
  $(".del_btn").click(function(){
    var history = []
    utils.setStorage('history_search_shop', JSON.stringify(history));
    showErrAlert('清除成功'); //'清除成功'
    checkHistory(history)
  })

  function checkHistory(history){
    var html = [];
    for(var i = 0; i < history.length; i++){
      html.push('<dd ><a href="'+searchToUrl+'?keywords='+history[i]+'" class="toMini" data-temp="list" data-module="shop" data-keyword="'+history[i]+'">'+history[i]+'</a></dd>')
    }
    if(html.length == 0){
      $(".searchpage .history").addClass("fn-hide")
    }else{
      $(".searchpage .history").removeClass("fn-hide")
      $(".searchpage .history dd").remove();
      $(".searchpage .history").append(html.join(''));
    }
    
  }

});


