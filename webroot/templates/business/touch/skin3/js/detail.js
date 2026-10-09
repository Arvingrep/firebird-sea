$(function(){
    //原生APP后退回来刷新页面
   pageBack = function(data) {
       // setupWebViewJavascriptBridge(function(bridge) {
       //     bridge.callHandler("pageRefresh", {}, function(responseData){
       //     });

       // });
       getComment();
   }



   var miniprogram = false;
   toggleDragRefresh('off');
   if(window.__wxjs_environment == 'miniprogram'){
       miniprogram = true;
   }else{
       if(navigator.userAgent.toLowerCase().match(/micromessenger/)) {
           if(typeof(wx) != 'undefined'){
               wx.miniProgram.getEnv(function (res) {
                   miniprogram = res.miniprogram;
               });
           }
       }
   }

   //小程序不显示其他快捷登录
   var device = navigator.userAgent;
   // 百度小程序、QQ小程序
   var isbaidu = device.indexOf('swan-baiduboxapp') > -1 ; //百度小程序
   var isqq = device.toLowerCase().indexOf('qq') > -1 && device.toLowerCase().indexOf('miniprogram')>-1 ; //QQ小程序

   if(!miniprogram && (isbaidu || isqq)){
       miniprogram = true;
   }

   if($('.module-tab li').length < 2){
       $('.module-tab-wrap').hide();
   }
   if($(".quanjing-box").length>0 && !miniprogram){
       $(".topMain").addClass("highBox");
       $(".playdalog iframe").attr("src",$(".playdalog").attr("data-src"));
   }


   var moduleData = [];
   if(packageData && packageData.modules){
       moduleData['privilege'] = [];
       if(packageData.modules.privilege){
           for (var i = 0; i < packageData.modules.privilege.length; i++) {
               moduleData['privilege'][packageData.modules.privilege[i].name] = packageData.modules.privilege[i];
           }
       }
       moduleData['store'] = [];
       if(packageData.modules.store){
           for (var i = 0; i < packageData.modules.store.length; i++) {
               moduleData['store'][packageData.modules.store[i].name] = packageData.modules.store[i];
           }
       }
   }

    // 轮播
   var slideIndex_img = $(".img_box").index();  //第一张图片的索引
   var slideIndex_video = $(".video-box").index();  //视频的索引
   var swiper = new Swiper('.swiper-main',
                       {
                           pagination: {el: '.swiper-pagination',type: 'fraction',},
                           loop: false,
                           grabCursor: true,
                           paginationClickable: true,
                           //initialSlide:slideIndex_img,
                           on: {
                               slideChangeTransitionStart: function(){
                                  if(this.activeIndex == slideIndex_video){
                                     $(".tab_box .v_btn").addClass("on_chose").siblings('li').removeClass("on_chose");
                                     $(".topMain").removeClass("highBox");
                                 }else{
                                    $(".tab_box .litpic_btn").addClass("on_chose").siblings('li').removeClass("on_chose");
                                    $(".topMain").removeClass("highBox");
                                 }
                               },
                             },
                       });

   if($(".quanjing-box").length>0 && miniprogram){
       $(".quanjing-box").remove();
       $('.tab_box li').eq(1).addClass("on_chose");
       swiper.update();
   }
   $('.video-box').on('click',function(){
       $('.videoModal').css('display','block');
       $('.markBox').toggleClass('show');
       return false;
   });

   // 图片放大
   $('.topMain .swiper-slide img').on('click',function(){
       if($(this).parent().hasClass('video-box')){
           $('.videoModal').css('display','block');
           $('.markBox').toggleClass('show');
           return false;
       }else{
           $(this).closest('.swiper-main').addClass('fullscreen-box');
           return false;
       }
   });

   // 大图关闭
   $('.topMain .vClose').on('click',function(){
       $('.swiper-main').removeClass('fullscreen-box');
       $('.markBox').removeClass('show');
       return false;
   });
   $('.videoModal .vClose').on('click',function(){
       $('.videoModal').css('display','none');
       $('.markBox').removeClass('show');
       return false;
   })

   //标题超出两行时
   var h3Len = $('.head-wrap .no-h3').text().length;
   if(h3Len > 16){
       $('.sInfoBox h3').addClass('in');
       $('.sInfoBox_info1').addClass('show');
       $('.no-h3').hide();
   }else{
       $('.sInfoBox h3').addClass('over');
       $('.sInfoBox_info2').addClass('show');
       $('.no-h3').hide();
   }

   //banner下 图片 视频 全景数量
   getIconNum()
   function getIconNum(){
       //相册数量
       $.ajax({
             url: '/include/ajax.php?service=business&action=albums_list&pageSize=1&uid='+id,
             type: 'get',
             dataType: 'json',
             success: function(data){
               var totalCount = 0;
               if(data && data.state == 100){
                 var list = data.info.pageInfo, html = [];
                 totalCount = list.totalCount;
               }
               $('.album-num').text(totalCount);
             },
             error: function(){}
       })

       if($('.video-num').size() > 0){
           //视频数量
           $.ajax({
                 url: '/include/ajax.php?service=business&action=video_list&pageSize=1&uid='+id,
                 type: 'get',
                 dataType: 'json',
                 success: function(data){
                   var totalCount = 0;
                   if(data && data.state == 100){
                     var list = data.info.pageInfo, html = [];
                     totalCount = list.totalCount;
                   }
                   $('.video-num').text(totalCount);
                 },
                 error: function(){}
           })
       }

       if($('.qj-num').size() > 0){
           //全景数量
           $.ajax({
                 url: '/include/ajax.php?service=business&action=panor_list&pageSize=1&uid='+id,
                 type: 'get',
                 dataType: 'json',
                 success: function(data){
                   var totalCount = 0;
                   if(data && data.state == 100){
                     var list = data.info.pageInfo, html = [];
                     totalCount = list.totalCount;
                   }
                   $('.qj-num').text(totalCount);
                 },
                 error: function(){}
           })
       }
   }

   //商家公告数据
   newsList()
   function newsList(){
       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=business&action=news_list&uid='+id+'&pageSize=5',
           success: function(data) {
               if(data.state == 100){
                   $('.tcNews').show();
                   var tcNewsHtml = [], list = data.info.list;
                   for (var i = 0; i < list.length; i++){
                       var paramId = list[i].typeid;
                       var listUrl = noteUrl.replace('%id',paramId)
                       tcNewsHtml.push('<div class="swiper-slide swiper-no-swiping">');
                       tcNewsHtml.push('<p><a href="'+listUrl+'">'+(list[i].typename ? '<span data-num="6" class="sliceFont">'+list[i].typename+'</span>' : '')+list[i].title+'<i></i></a></p>');
                       tcNewsHtml.push('</div>');
                   }

                   $('.tcNews .swiper-wrapper').html(tcNewsHtml.join(''));
                   var mySwiper = new Swiper ('.tcNews .swiper-container', {
                           direction: 'vertical',
                           loop: true,
                           pagination: {
                             el: '.tcNews .pagination',
                           },
                           autoplay: {
                           delay: 2000,
                           stopOnLastSlide: false,
                           disableOnInteraction: true,
                           },
                   })
                   //控制标题的字数
                   $('.sliceFont').each(function(index, el) {
                       var num = $(this).attr('data-num');
                       var text = $(this).text();
                       var len = text.length;
                       if(len > num){
                           $(this).html(text.substring(0,num));
                       }
                   });

               }else{
                   $('.tcNews').hide();
               }
           },
           error: function(){
               $('.tcNews').hide();
           }
       });
   }

   //控制typename的字数
   $('.good-type').each(function(index, el) {
       var num = $(this).attr('data-num');
       var text = $(this).text();
       var len = text.length;
       if(len > num){
           $(this).html(text.substring(0,num));
       }
   });


   if($('.module-tab li').size() == 0){//导航栏没有开通的模块时
       $('.module-tab').css('display','none');
       $('.module-container .common-con:nth-child(2) .common-title').css({'display':'block','padding-top':'.3rem'})
   }

   var h = $(window).height();

   // 导航栏置顶
   $(window).bind("scroll",function(){
       var d = $(window).scrollTop();
       var Ggoffset = $('.module-container .module-tab-wrap').offset().top;//tab
       if(Ggoffset < d){
           $('.module-tab').addClass('topfixed');
       }else{
           $('.module-tab').removeClass('topfixed');
       }
   });

   var isClick = 0;
   //左侧导航点击
   $(".module-tab li").bind("click", function(){
       isClick = 1; //关闭滚动监听
       var t = $(this), theadTop;
       var name = t.data('name');
        $(".common-con").each(function(){
           var coname = $(this).data('name');
           if(name == coname){
              theadTop = $(this).offset().top - 60
           }
        })
       t.addClass("curr").siblings("li").removeClass("curr");
       $(window).scrollTop(theadTop);
       setTimeout(function(){
         isClick = 0;//开启滚动监听
       },1000);
       //点击到美食事
       var end = $('.curr').offset().left + $('.curr').width() / 2 - $('body').width() /2;
       var star = $(".module-tab").scrollLeft();
       $('.module-tab').scrollLeft(end + star);
   });
   //滚动监听
   $(window).scroll(function() {
       $('.module-tab').css('-webkit-overflow-scrolling','auto');//ios 出现卡顿现象 scrollTop不会时时更新，要等到页面停止滚动后才能获取到scrollTop值
       var scroH = $(this).scrollTop();
       var thh =scroH + h;
       if(isClick) return false;//点击切换时关闭滚动监听

       var theadLength = $(".common-con").length;
       $(".module-tab li").removeClass("curr");

       $(".common-con").each(function(index, element) {
           var offsetTop = $(this).offset().top;

           if (index != theadLength - 1) {
               var newName = $(this).data('name');
               var offsetNextTop = $(".common-con:eq(" + (index + 1) + ")").offset().top - 80;
               if (scroH < offsetNextTop) {
                   $(".module-tab li[data-name='"+newName+"']").addClass("curr");
                   return false;
               }
           } else {
               $(".module-tab li:last").addClass("curr");
               return false;
           }
       });
       if($('.module-tab li').size() == 0) return false;
       var end = $('.curr').offset().left + $('.curr').width() / 2 - $('body').width() /2;
       var star = $(".module-tab").scrollLeft();
       $('.module-tab').scrollLeft(end + star);
       $('.module-tab').css('-webkit-overflow-scrolling','touch');

   });

   //特殊模块 各样式
   var speLen = $('.spelist li').length;
   $('.spelist').addClass('spelist'+speLen)

   //点击切换设计师和工长
   $('.reno_tab li').on('click',function(){
       $(this).addClass('curr').siblings().removeClass('curr')
       var i =$(this).index();
       $('.site_con').eq(i).addClass('site_show').siblings('.site_con').removeClass('site_show');
   })

   //判断自定义菜单的内容
   $('.selfInfo').each(function(){
       var h = $(this).height();
       if(h>200){
           $(this).addClass('whiteBg')
       }
   })
   //圈子 关注
   $('body').delegate('.attention', 'click', function() {

       var t = $(this),
           p = t.parents('.quan-company');
       var id = p.attr('data-id');
       console.log(id)
       var userid = $.cookie(cookiePre + "login_user");
       if (userid == null || userid == "") {
           window.location.href = masterDomain + '/login.html';
           return false;
       }

       if ($(this).hasClass('cared')) {
           $(this).removeClass('cared').html(langData['circle'][0][49]);  /*关注 */
       } else {
           $(this).addClass('cared').html(langData['circle'][0][50]);  /* 已关注*/
       }

       $.post("/include/ajax.php?service=member&action=followMember&id=" + id);

       return false;
   });


   $.fn.scrollTo =function(options){
       var defaults = {
           toT : 0, //滚动目标位置
           durTime : 500, //过渡动画时间
           delay : 30, //定时器时间
           callback:null //回调函数
       };
       var opts = $.extend(defaults,options),
           timer = null,
           _this = this,
           curTop = _this.scrollTop(),//滚动条当前的位置
           subTop = opts.toT - curTop, //滚动条目标位置和当前位置的差值
           index = 0,
           dur = Math.round(opts.durTime / opts.delay),
           smoothScroll = function(t){
               index++;
               var per = Math.round(subTop/dur);
               if(index >= dur){
                   _this.scrollTop(t);
                   window.clearInterval(timer);
                   if(opts.callback && typeof opts.callback == 'function'){
                       opts.callback();
                   }
                   return;
               }else{

                   _this.scrollTop(curTop + index*per);
               }
           };
       timer = window.setInterval(function(){
           smoothScroll(opts.toT);
       }, opts.delay);
       return _this;
   };

   $('.appMapBtn').attr('href', OpenMap_URL);

     // 收藏
     $('.follow-wrapper').click(function(){
       var t = $(this), type = t.find('.follow-icon').hasClass("active") ? "del" : "add";
       var userid = $.cookie(cookiePre+"login_user");
       if(userid == null || userid == ""){
         location.href = masterDomain + '/login.html';
         return false;
       }
       if(type == 'add'){
           t.find('.follow-icon').addClass('active');
           t.find('.text-follow').html(langData['business'][5][25]);//已收藏
       }else{
           t.find('.follow-icon').removeClass('active')
           t.find('.text-follow').html(langData['siteConfig'][19][240]);//收藏
       }
       $.post("/include/ajax.php?service=member&action=collect&module=business&temp=detail&type="+type+'&id='+id);
     });



   // 电话弹框
   $(".tel_a,.utelphone").on("click",function(){
       $.smartScroll($('.modal-public'), '.tel_alert');
       $('html').addClass('nos');
       $('.m-telphone').addClass('curr');
       return false;
   });

   // 关闭
   $(".modal-public .close_tel").on("click",function(){
       $("html, .modal-public").removeClass('curr nos');
       return false;
   })
   $(".bgCover").on("click",function(){
       $("html, .modal-public").removeClass('curr nos');
   })


   function auto_data_size(){
       var imgss= $("figure img");
       $("figure a").each(function() {
           var t = $(this);
           var imgs = new Image();
           imgs.src = t.attr("href");

           if (imgs.complete) {
               t.attr("data-size","").attr("data-size",imgs.width+"x"+imgs.height);
           } else {
               imgs.onload = function () {
                   t.attr("data-size","").attr("data-size",imgs.width+"x"+imgs.height);
                   imgs.onload = null;
               };
           };

       })
   };
   auto_data_size();


   //直播数据
   if($('.live-wrap').size() > 0){
       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=live&action=alive&uid='+uid+'&pageSize=1',
           success: function(data) {
               if(data.state == 100){
                   $('.live-wrap').show();
                   var info = data.info.list[0];
                   $('.live-wrap .live-top a').attr('href', info.url);
                   $('.live-wrap h2').html(info.title);
                   $('.live-wrap .live-left span').html(info.click + langData['siteConfig'][13][32]);  //几人
                   $('.live-wrap .live-img2').attr('src', info.litpic);
               }
           }
       });
   }


   //圈子数据
   if($('.quanzi-wrap').size() > 0){
       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=circle&action=tlist&u=1&uid='+uid+'&pageSize=1',
           success: function(data) {
               if(data.state == 100){
                   $('.quanzi-wrap').show();
                   var info = data.info.list[0];

                   $('.quan-logo img').attr('src', info.photo);
                   $('.company-info h2').html(info.username);
                   $('.company-info p').html(returnHumanTime(info.pubdate, 2));

                   //关注
                   if(info.isfollow){
                       $(".attention").addClass('cared').html(langData['circle'][0][50]);  //已关注
                   }

                   $('#circle_a').attr('href', info.url);
                   $(".quan-tit").html((info.zan*1>customhot*1 ? '<s class="con-hot"></s>' : '') + info.content);
                   $('#circle_common').html(info.reply);
                   $('#circle_zan').html(info.zan);

                   if(info.thumbnail){
                       $('.quan-right img').attr('src', info.thumbnail);
                   }else{
                       if(info.media){
                           $('.quan-right img').attr('src', info.media[0]);
                       }else{
                           $('.quan-right').remove();
                       }
                   }

               }
           }
       });
   }


   //资讯数据
   if($('.article-con').size() > 0){

       $('.article-con .common-title a').attr('href', moduleData['store']['article']['homepage']);

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=article&action=alist&media='+moduleData['store']['article']['sid']+'&pageSize=5',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];

                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li><a href="'+list[i].url+'">');
                           if(list[i].litpic){
                               html.push('<div class="article_img"><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'" alt=""><em class="blue-em">'+list[i].typeName[0]+'</em></div>');
                           }
                           html.push('<div class="articleInfo">');
                           html.push('<h2>'+list[i].title+'</h2>');
                           html.push('<p><span>'+returnHumanTime(list[i].pubdate, 2)+'</span><em>'+list[i].click+'</em></p>');
                           html.push('</div></a></li>');
                       }
                       $('.article-con ul').html(html.join(''));
                       $(".article-con img").scrollLoading();
                   }else{
                       $('.article-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.article-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });
   }


   //分类数据
   if($('.info-con').size() > 0){

       $('.info-con .common-title a').attr('href', moduleData['store']['info']['homepage']);

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=info&action=ilist_v2&uid='+uid+'&pageSize=4',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];

                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li><a href="'+list[i].url+'">');
                           html.push('<div class="top_img">');
                           html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'" alt="">');
                           html.push('<span class="infoType">'+list[i].typename+'</span>');
                           html.push('</div>');
                           html.push('<div class="infoInfo">');
                           if(list[i].titleBlod){
                               html.push('<h4 style="color:'+list[i].color+'; font-weight:bold;">');
                               html.push(list[i].title+'</h4>')
                           }else{
                               html.push('<h4 style="color:'+list[i].color+';">');
                               html.push(list[i].title+'</h4>')
                           }

                           if(list[i].price_switch == 0){
                               if(list[i].price == 0){
                                   html.push('<h5><strong>'+langData['business'][5][37]+'</strong></h5>');  //价格面议
                               }else{
                                   var price = list[i].price.split('.');
                                   html.push('<h5><em>' + echoCurrency('symbol') + '</em><strong>'+price[0]+'</strong><em>.'+price[1]+'</em></h5>');
                               }
                           }else{
                               html.push('<h5><strong>&nbsp;</strong></h5>');  //占位，防止高度不对齐
                           }

                           html.push('<p class="addr-info"><span class="addr">'+list[i].address[list[i].address.length-2]+' - '+list[i].address[list[i].address.length-1]+'</span>');
                           html.push('<span class="pubtime fn-right">'+returnHumanTime(list[i].pubdate, 2)+'</span></p>');

                           html.push('</div></a></li>');
                       }
                       $('.info-con ul').html(html.join(''));
                       $(".info-con img").scrollLoading();
                   }else{
                       $('.info-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.info-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });
   }


   //房产数据
   if($('.house-con').size() > 0){

       //房源数据
       $('.house_con1 .common-title a').attr('href', moduleData['store']['house']['homepage']);

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=house&action=companyAllHouseList&comid='+moduleData['store']['house']['sid'],
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var pageInfo = data.info.pageInfo;
                   var html = [];

                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           //只显示前5条
                           if(i < 5){
                               //二手房
                               if(list[i].styleType == 'sale'){

                                   var price = '';
                                   if(list[i].price > 0){
                                       price = '<strong>'+list[i].price+'</strong>' + langData['siteConfig'][13][27];  //万
                                   }else{
                                       price = langData['siteConfig'][46][70];  //面议
                                   }

                                   html.push('<li class="fn-clear"><a href="'+list[i].url+'">');
                                   html.push('<div class="house_img fn-left">');
                                   html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'">');
                                   html.push('<span class="houseType">'+langData['siteConfig'][19][218]+'</span>');  //二手房
                                   html.push('</div><div class="house_mid fn-left">');
                                   html.push('<h2>'+list[i].title+'</h2>');
                                   html.push('<div class="houseInfo fn-clear">');
                                   html.push('<span class="fn-left"><em>'+list[i].room+'</em><em>'+list[i].area+'㎡</em></span>');
                                   html.push('<span class="housePrice fn-right">'+price+'</span>');
                                   html.push('</div><div class="houseAddr">');
                                   html.push('<span>'+list[i].community+'</span><span class="junPrice fn-right">'+langData['siteConfig'][13][61]+'&nbsp;'+list[i].unitprice+echoCurrency('short')+'/㎡</span>');
                                   html.push('</div></div></a></li>');  //均价

                               //租房
                               }else if(list[i].styleType == 'zu'){

                                   var price = '';
                                   if(list[i].price > 0){
                                       price = '<strong>'+list[i].price+'</strong>' + echoCurrency('short') + '/' + langData['siteConfig'][13][18];  //月
                                   }else{
                                       price = langData['siteConfig'][46][70];  //面议
                                   }

                                   html.push('<li class="fn-clear"><a href="'+list[i].url+'">');
                                   html.push('<div class="house_img fn-left">');
                                   html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'">');
                                   html.push('<span class="houseType">'+langData['siteConfig'][19][219]+'</span>');  //租房
                                   html.push('</div><div class="house_mid fn-left">');
                                   html.push('<h2>'+list[i].title+'</h2>');
                                   html.push('<div class="houseInfo fn-clear">');
                                   html.push('<span class="fn-left"><em>'+list[i].room+'</em><em>'+list[i].area+'㎡</em></span>');
                                   html.push('<span class="housePrice fn-right">'+price+'</span>');
                                   html.push('</div><div class="houseAddr">');
                                   html.push('<span>'+list[i].community+'</span>');
                                   html.push('</div></div></a></li>');

                               //写字楼
                               }else if(list[i].styleType == 'xzl'){

                                   var total = '';
                                   var price = '';
                                   if(list[i].type == 0){
                                       var total = list[i].price>0 ? '<strong>' + parseInt(list[i].price * list[i].area).toFixed(0) + '</strong><em>' + echoCurrency('short')+'/'+langData['siteConfig'][13][18]+'</em>' : langData['siteConfig'][46][70];  //月   面议
                                       var price = list[i].price>0 ? list[i].price + ''+echoCurrency('short')+'/m²•'+langData['siteConfig'][13][18] : '';  //月
                                   }else{
                                       var total = list[i].price>0 ? '<strong>' + (list[i].price / list[i].area ).toFixed(2) + '</strong><em>' + langData['siteConfig'][13][27] +'/㎡</em>' : '';  //万
                                       var price = list[i].price>0 ? list[i].price + langData['siteConfig'][13][27] : langData['siteConfig'][46][70];  //万  面议
                                   }

                                   html.push('<li class="fn-clear"><a href="'+list[i].url+'">');
                                   html.push('<div class="house_img fn-left">');
                                   html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'">');
                                   html.push('<span class="houseType">'+langData['siteConfig'][19][220]+'</span>');  //写字楼
                                   html.push('</div><div class="house_mid fn-left">');
                                   html.push('<h2>'+list[i].title+'</h2>');
                                   html.push('<div class="houseInfo fn-clear">');
                                   html.push('<span class="fn-left"><em>'+list[i].area+'㎡</em><em>'+list[i].zhuangxiu+'</em></span>');
                                   html.push('<span class="housePrice fn-right">'+total+'</span>');
                                   html.push('</div><div class="houseAddr">');
                                   html.push('<span>'+list[i].addr[list[i].addr.length-2]+' - '+list[i].addr[list[i].addr.length-1]+'</span><span class="junPrice fn-right">'+price+'</span>');
                                   html.push('</div></div></a></li>');

                               //商铺
                               }else if(list[i].styleType == 'sp'){

                                   var price = '';
                                   if(list[i].price){
                                       var price = list[i].price + (list[i].type ? langData['siteConfig'][13][27] : echoCurrency('short')+"/"+langData['siteConfig'][13][18]);  //万   月
                                   }else{
                                       var price = langData['siteConfig'][46][70];  //面议
                                   }

                                   var elevatortxt = '';
                                   if(list[i].type==1){
                                       if(list[i].price>0){
                                           elevatortxt = (list[i].price / list[i].area).toFixed(1) + langData['siteConfig'][13][27]  + '/m²';  //万
                                        }
                                      }else if(list[i].type==2){
                                          if(list[i].transfer>0){
                                              elevatortxt = langData['siteConfig'][19][120] + ':' + parseInt(list[i].transfer).toFixed(1) + langData['siteConfig'][13][27];  //转让费   万
                                          }
                                      }else if(list[i].type==0){
                                          if(list[i].price>0){
                                              elevatortxt = (list[i].price / list[i].area).toFixed(0) + ''+echoCurrency('short')+'/m²•' + langData['siteConfig'][13][18];  //月
                                          }
                                      }

                                   html.push('<li class="fn-clear"><a href="'+list[i].url+'">');
                                   html.push('<div class="house_img fn-left">');
                                   html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'">');
                                   html.push('<span class="houseType">'+langData['siteConfig'][19][221]+'</span>');  //商铺
                                   html.push('</div><div class="house_mid fn-left">');
                                   html.push('<h2>'+list[i].title+'</h2>');
                                   html.push('<div class="houseInfo fn-clear">');
                                   html.push('<span class="fn-left"><em>'+list[i].area+'㎡</em><em>'+list[i].zhuangxiu+'</em></span>');
                                   html.push('<span class="housePrice fn-right">'+price+'</span>');
                                   html.push('</div><div class="houseAddr">');
                                   html.push('<span>'+list[i].addr[list[i].addr.length-2]+' - '+list[i].addr[list[i].addr.length-1]+'</span><span class="junPrice fn-right">'+elevatortxt+'</span>');
                                   html.push('</div></div></a></li>');

                               //厂房/仓库
                               }else if(list[i].styleType == 'cf'){

                                   var price = '';
                                   if(list[i].price > 0) {
                                       if (list[i].type == 0) {
                                           price = list[i].price + ''+echoCurrency('short')+'/'+langData['siteConfig'][13][18];  //月
                                       } else if (list[i].type == 1) {
                                           price = list[i].price + ''+echoCurrency('short')+'/'+langData['siteConfig'][13][18];  //月
                                       } else if (list[i].type == 2) {
                                           price = list[i].price + langData['siteConfig'][13][27];  //万
                                       }
                                   }else{
                                       price = langData['siteConfig'][46][70];  //面议
                                   }

                                   var elevatortxt = '';
                                   if(list[i].type==2){
                                       if(list[i].price>0){
                                           var epr = (list[i].price / list[i].area);
                                           if(epr>=1){
                                               elevatortxt = epr.toFixed(0) + langData['siteConfig'][13][27] + '/m²';  //万
                                           }else{
                                               elevatortxt = epr.toFixed(1) + langData['siteConfig'][13][27] + '/m²';  //万
                                           }

                                        }
                                      }else if(list[i].type==1){
                                          if(list[i].transfer>0){
                                              elevatortxt = langData['siteConfig'][19][120] + ':' + parseInt(list[i].transfer).toFixed(0) + langData['siteConfig'][13][27];  //转让费   万
                                          }
                                      }else if(list[i].type==0){
                                          if(list[i].price>0){
                                              var epri = (list[i].price / list[i].area);
                                              if(epri>=1){
                                               elevatortxt = epri.toFixed(0) + ''+echoCurrency('short')+'/m²•'+langData['siteConfig'][13][18];  //月
                                           }else{
                                               elevatortxt = epri.toFixed(1) + ''+echoCurrency('short')+'/m²•'+langData['siteConfig'][13][18];  //月
                                           }
                                          }
                                      }

                                   html.push('<li class="fn-clear"><a href="'+list[i].url+'">');
                                   html.push('<div class="house_img fn-left">');
                                   html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'">');
                                   html.push('<span class="houseType">'+langData['siteConfig'][19][222]+'</span>');  //厂房、仓库
                                   html.push('</div><div class="house_mid fn-left">');
                                   html.push('<h2>'+list[i].title+'</h2>');
                                   html.push('<div class="houseInfo fn-clear">');
                                   html.push('<span class="fn-left"><em>'+list[i].area+'㎡</em><em>'+list[i].protype+'</em></span>');
                                   html.push('<span class="housePrice fn-right">'+price+'</span>');
                                   html.push('</div><div class="houseAddr">');
                                   html.push('<span>'+list[i].addr[list[i].addr.length-2]+' - '+list[i].addr[list[i].addr.length-1]+'</span><span class="junPrice fn-right">'+elevatortxt+'</span>');
                                   html.push('</div></div></a></li>');

                               //车位
                               }else if(list[i].styleType == 'cw'){

                                   var price = '';
                                   if(list[i].price > 0) {
                                       if (list[i].type == 0) {
                                           price = list[i].price + ''+echoCurrency('short')+'/' + langData['siteConfig'][13][18];  //月
                                       } else if (list[i].type == 2) {
                                           price = list[i].price + ''+echoCurrency('short')+'/' + langData['siteConfig'][13][18];  //月
                                       } else if (list[i].type == 1) {
                                           price = list[i].price + langData['siteConfig'][13][27];  //万
                                       }
                                   }else{
                                       price = langData['siteConfig'][46][70];  //面议
                                   }

                                   var elevatortxt = '';
                                   if(list[i].type==1){
                                       if(list[i].price>0){
                                           elevatortxt = (list[i].price / list[i].area).toFixed(0) + langData['siteConfig'][13][27] + '/m²';  //万
                                        }
                                      }else if(list[i].type==2){
                                          if(list[i].transfer>0){
                                              elevatortxt = langData['siteConfig'][19][120] + ':' + parseInt(list[i].transfer).toFixed(0) + langData['siteConfig'][13][27];  //转让费   万
                                          }
                                      }else if(list[i].type==0){
                                          if(list[i].price>0){
                                              elevatortxt = (list[i].price / list[i].area).toFixed(0) + echoCurrency('short')+'/m²•' + langData['siteConfig'][13][18];  //月
                                          }
                                      }

                                   html.push('<li class="fn-clear"><a href="'+list[i].url+'">');
                                   html.push('<div class="house_img fn-left">');
                                   html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'">');
                                   html.push('<span class="houseType">'+langData['siteConfig'][31][7]+'</span>');  //车位
                                   html.push('</div><div class="house_mid fn-left">');
                                   html.push('<h2>'+list[i].title+'</h2>');
                                   html.push('<div class="houseInfo fn-clear">');
                                   html.push('<span class="fn-left"><em>'+list[i].area+'㎡</em><em>'+list[i].protype+'</em></span>');
                                   html.push('<span class="housePrice fn-right">'+price+'</span>');
                                   html.push('</div><div class="houseAddr">');
                                   html.push('<span>'+list[i].addr[list[i].addr.length-2]+' - '+list[i].addr[list[i].addr.length-1]+'</span><span class="junPrice fn-right">'+elevatortxt+'</span>');
                                   html.push('</div></div></a></li>');

                               }
                           }
                       }
                       $('.house_con1 ul').html(html.join(''));
                       $(".house_con1 img").scrollLoading();

                       //统计
                       var houseItem = [];
                       if(pageInfo.sale){
                           var saleLink = $('.house-con').attr('data-sale').replace('%%', moduleData['store']['house']['sid']);
                           houseItem.push('<a href="'+saleLink+'">'+langData['siteConfig'][19][218]+'('+pageInfo.sale+')<i></i></a>');
                       }
                       if(pageInfo.zu){
                           var zuLink = $('.house-con').attr('data-zu').replace('%%', moduleData['store']['house']['sid']);
                           houseItem.push('<a href="'+zuLink+'">'+langData['siteConfig'][19][219]+'('+pageInfo.zu+')<i></i></a>');
                       }
                       if(pageInfo.xzl){
                           var xzlLink = $('.house-con').attr('data-xzl').replace('%%', moduleData['store']['house']['sid']);
                           houseItem.push('<a href="'+xzlLink+'">'+langData['siteConfig'][19][220]+'('+pageInfo.xzl+')<i></i></a>');
                       }
                       if(pageInfo.sp){
                           var spLink = $('.house-con').attr('data-sp').replace('%%', moduleData['store']['house']['sid']);
                           houseItem.push('<a href="'+spLink+'">'+langData['siteConfig'][19][221]+'('+pageInfo.sp+')<i></i></a>');
                       }
                       if(pageInfo.cf){
                           var cfLink = $('.house-con').attr('data-cf').replace('%%', moduleData['store']['house']['sid']);
                           houseItem.push('<a href="'+cfLink+'">'+langData['siteConfig'][19][222]+'('+pageInfo.cf+')<i></i></a>');
                       }
                       if(pageInfo.cw){
                           var cwLink = $('.house-con').attr('data-cw').replace('%%', moduleData['store']['house']['sid']);
                           houseItem.push('<a href="'+cwLink+'">'+langData['siteConfig'][31][7]+'('+pageInfo.cw+')<i></i></a>');
                       }
                       $('.house-con .common-tag').html(houseItem.join(''));


                   }else{
                       $('.house_con1 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.house_con1 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });

       //经纪人数据
       $('.house_con2 .common-title a').attr('href', $('.house_con2 .common-title a').attr('data-href').replace('%%', moduleData['store']['house']['sid']));

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=house&action=zjUserList&comid='+moduleData['store']['house']['sid']+'&type=getnormal&pageSize=3',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];

                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li><a href="'+list[i].url+'">');
                           html.push('<div class="top_img"><img  onerror="this.src=\'/static/images/noPhoto_100.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'" alt=""></div>');
                           html.push('<div class="bottom_info">');
                           html.push('<h2>'+(list[i].nickname ? list[i].nickname : '&nbsp;')+'</h2>');
                           html.push('<div class="sale-num">');
                           html.push('<dl><dt>'+parseInt(list[i].zuCount)+'</dt><dd>'+langData['business'][2][46]+'</dd></dl>');  //出租
                           html.push('<dl><dt>'+parseInt(list[i].saleCount)+'</dt><dd>'+langData['business'][2][47]+'</dd></dl>');  //出售
                           html.push('</div></div></a></li>');
                       }
                       $('.house_con2 ul').html(html.join(''));
                       $(".house_con2 img").scrollLoading();
                   }else{
                       $('.house_con2 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.house_con2 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });

   }


   //招聘数据
   if($('.job-con').size() > 0){

       $('.job-con .common-title a').attr('href', moduleData['store']['job']['homepage']);

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=job&action=postList&company='+moduleData['store']['job']['sid']+'&pageSize=5',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];

                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li><a href="'+list[i].url+'">');
                           html.push('<div class="zhiwei_title">');
                           html.push('<div class="title_01"><span>'+list[i].title+'</span><p>'+list[i].show_salary+'</p></div>');
                           html.push('<div class="title_02 fn-clear">');
                           if(list[i].job_addr_detail){
                            html.push('<span>'+list[i].job_addr_detail.addrName[1]+'<em>|</em></span>');
                           }
                           html.push('<span>'+list[i].experience+'<em>|</em></span><span>'+list[i].educational+'<em>|</em></span>');

                           html.push(list[i].nature);

                           html.push('<em class="pub_time">'+huoniao.transTimes(list[i].update_time, 2)+'</em>');
                           html.push('</div></div></a></li>');
                       }
                       $('.job-con ul').html(html.join(''));
                       $(".job-con img").scrollLoading();
                   }else{
                       $('.job-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.job-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });
   }


   //商城数据
   if($('.shop-con').size() > 0){

       $('.shop-con .common-title a, .shop-con .common-more a').attr('href', moduleData['store']['shop']['homepage']);

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=shop&action=slist&store='+moduleData['store']['shop']['sid']+'&pageSize=4',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];

                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li><a href="'+list[i].url+'">');
                           html.push('<div class="top_img"><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'" alt=""></div>');
                           html.push('<div class="goodInfo">');
                           html.push('<h4>'+list[i].title+'</h4>');
                           html.push('<div class="infobot fn-clear">');
                           html.push('<div class="left">');
                           html.push('<p><em class="good-type">'+list[i].typename+'</em>');
                           html.push('<span class="sellnum fn-right">'+langData['siteConfig'][19][518]+list[i].sales+'</span>');  //已售
                           html.push('</p>');
                           var price = list[i].price.split('.');
                           html.push('<h5><em>'+echoCurrency('symbol')+'</em><strong>'+price[0]+'</strong><em>.'+price[1]+'</em><del>'+list[i].mprice+'</del></h5>');
                           html.push('</div></div></div></a></li>');
                       }
                       $('.shop-con ul').html(html.join(''));
                       $(".shop-con img").scrollLoading();
                   }else{
                       $('.shop-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.shop-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });
   }


   //外卖数据
   if($('.waimai-con').size() > 0){

       $('.waimai-con .common-title a').attr('href', moduleData['store']['waimai']['homepage']);

       //商家信息
       $.ajax({
           url: "/include/ajax.php?service=waimai&action=storeDetail&id=" + moduleData['store']['waimai']['sid'],
           type: "POST",
           dataType: "json",
           success: function (data) {
               var html=[];
               if(data && data.state == 100){
                   var info = data.info;
                   var shopname = info.shopname;  //店铺名
                   var shop_banner = info.shop_banner[0];  //logo
                   var first_discount = info.first_discount;  //首单
                   var promotions = info.promotions;  //满减

                   $('.waimai-logo').html(`<img src="${shop_banner}" onerror="this.src='/static/images/bus_default.png'"/>`);
                   $('.waimai-info h2').html(shopname);

                   var waimaiItem = [];
                   if(first_discount){
                       waimaiItem.push('<span>首单减' + first_discount + '</span>');
                   }
                   if(promotions){
                       for (var i = 0; i < promotions.length; i++) {
                           waimaiItem.push('<span>满' + promotions[i][0] + '减' + promotions[i][1] + '</span>');
                       }
                   }
                   $('.waimai-yh').html(waimaiItem.join(''));

                   //商品信息
                   $.ajax({
                       url: "/include/ajax.php?service=waimai&action=food&shop=" + moduleData['store']['waimai']['sid'],
                       type: "POST",
                       dataType: "json",
                       success: function (data) {
                           var html=[];
                           if(data && data.state == 100){
                               var list = data.info;
                               if(list){
                                   for (var i = 0; i < list.length; i++) {
                                       if(i < 3){
                                           var pic = list[i].pics != "" && list[i].pics != undefined ? huoniao.changeFileSize(list[i].pics[0], "small") : "/static/images/food.png";

                                           var oldPrice = list[i].price.toString();//因为价格是数字 所以要转化成字符串来分割
                                           var priceArr2=[],price2='',price1='';

                                           if(oldPrice.indexOf('.')!= -1){//数字中有小数时
                                               priceArr2 = (Number(oldPrice).toFixed(2)).split('.');
                                               price1 = priceArr2[0];
                                               price2 = (priceArr2[1])
                                           }else{
                                               price1 = list[i].price;
                                               price2 = '00'
                                           }

                                           var mprice = '';
                                           if(list[i].formerprice > 0){
                                               mprice = echoCurrency('symbol')+list[i].formerprice;
                                           }
                                           html.push('<dl><a href="'+moduleData['store']['waimai']['homepage']+'">');
                                           html.push(`    <dt><img src="${pic}" onerror="this.src='/static/images/404.jpg'"></dt>`);
                                           html.push('     <dd>'+list[i].title+'</dd>');
                                           html.push('     <dd><span>'+echoCurrency('symbol')+'<strong>'+price1+'</strong>.'+price2+'</span><del>'+mprice+'</del></dd>');
                                           html.push('</a></dl>');
                                       }
                                   }
                               }
                           }
                           $('.waimai_con').html(html.join(''));
                       }
                   });

               }else{
                   $('.waimaiInfo').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       })
   }


   //团购数据
   if($('.tuan-con').size() > 0){

       $('.tuan-con .common-title a').attr('href', moduleData['store']['tuan']['homepage']);

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=tuan&action=tlist&store='+moduleData['store']['tuan']['sid']+'&getuser=1&pageSize=5',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];
                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li><a href="'+list[i].url+'">');
                           html.push('<div class="tuan_img fn-left"><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'" alt=""></div>');
                           html.push('<div class="tuan_right">');
                           html.push('<h2>'+list[i].title+'</h2>');
                           var price = list[i].price.split('.');
                           html.push('<h5 class="tuan_price"><em>'+echoCurrency('symbol')+'</em><strong>'+price[0]+'</strong><em>.'+price[1]+'</em><del>'+echoCurrency('symbol')+list[i].market+'</del></h5>');
                           html.push('<p class="tuan_sale">'+langData['siteConfig'][19][518]+list[i].sale+'</p>');  //已售
                           html.push('<span class="go-tuan">'+langData['business'][3][12]+'</span>');  //去抢购
                           html.push('</div></a></li>');
                       }
                       $('.tuan-con ul').html(html.join(''));
                       $(".tuan-con img").scrollLoading();
                   }else{
                       $('.tuan-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.tuan-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });
   }


   //活动数据
   if($('.huodong-wrap').size() > 0){

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=huodong&action=hlist&uid='+uid+'&pageSize=1',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];
                   if(list.length > 0){
                       var info = list[0];
                       html.push('<a href="'+info.url+'">');
                       html.push('<div class="huodong-left fn-left">');
                       html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="'+info.litpic+'" alt="" class="huodong-img">');
                       html.push('</div>');
                       html.push('<div class="huodong-mid">');
                       html.push('<h2 class="huodong-title">'+info.title+'</h2>');

                       var price = '';
                       if(info.feetype == 0){
                           price = langData['siteConfig'][19][427];  //免费
                       }else{
                           mprice = info.mprice.split('.');
                           price = echoCurrency('symbol') + '<strong>' + mprice[0] + '</strong>.'+mprice[1];
                       }
                       html.push('<p class="huodong-num"><span>' + price + '</span><em>'+langData['business'][5][55].replace('1', info.reg)+'</em>');
                       html.push('</div>');
                       html.push('<div class="huodong-go fn-right">'+langData['business'][3][26]+'</div>');  //去报名
                       html.push('</a>');

                       $('.huodong-top').html(html.join(''));
                   }else{
                       $('.huodong-top').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.huodong-top').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });
   }


   //养老数据
   if($('.pension-con').size() > 0){

       $('.pension-con .common-more a').attr('href', moduleData['store']['pension']['homepage']);

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=pension&action=storeDetail&id='+moduleData['store']['pension']['sid'],
           success: function(data) {
               $('.pension-con .empty').remove();
               if(data.state == 100){
                   var info = data.info;
                   var html = [];

                   html.push('<div class="top_img fn-clear"><a href="'+info.url+'">');
                   var tag = [];
                   if(info.tagArr){
                       for (var i = 0; i < info.tagArr.length; i++) {
                           tag.push('<span>'+info.tagArr[i]+'</span>');
                       }
                   }
                   html.push('<div class="left_img"><img src="'+info.pics[0]['path']+'" alt=""><div class="pension-tag">'+tag.join('')+'</div></div>');
                   html.push('<div class="right_img">');
                   if(info.pics[1]){
                       html.push('<div class="r_img1"><img src="'+info.pics[1]['path']+'" /></div>');
                   }
                   if(info.pics[2]){
                       html.push('<div class="r_img2"><img src="'+info.pics[2]['path']+'" /></div>');
                   }
                   html.push('</div></a></div>');

                   html.push('<div class="pensionInfo"><a href="'+info.url+'">');
                   html.push('<h2>'+info.title+'</h2>');
                   html.push('<p><span>'+echoCurrency('symbol')+'<strong>'+info.price+'</strong>'+langData['siteConfig'][19][836]+'</span><em class="fn-right">'+info.addrname[info.addrname.length-2]+' - '+info.addrname[info.addrname.length-1]+'</em></p>');  //起
                   html.push('</a></div>');

                   html.push('<div class="pensionPrice">');
                   html.push('<span class="fei">'+langData['pension'][7][53]+'</span>');  //费用详情
                   html.push('<ul>');

                   if(info.catid){
                       for (var i = 0; i < info.catid.length; i++) {
                           if(info.catid[i] == 1){
                               html.push('<li><a href="'+info.url+'">');
                               html.push('<img src="'+templets+'images/pension-jg.png" alt="">'+langData['pension'][7][54]+'<div class="fn-right">'+langData['siteConfig'][41][66]+'<i></i></div>');  //机构养老  详情
                               html.push('</a></li>');
                           }
                           if(info.catid[i] == 2){
                               html.push('<li><a href="'+info.url+'">');
                               html.push('<img src="'+templets+'images/pension-jj.png" alt="">'+langData['pension'][7][55]+'<div class="fn-right">'+langData['siteConfig'][41][66]+'<i></i></div>');  //居家养老  详情
                               html.push('</a></li>');
                           }
                           if(info.catid[i] == 3){
                               html.push('<li><a href="'+info.url+'">');
                               html.push('<img src="'+templets+'images/pension-lj.png" alt="">'+langData['pension'][7][56]+'<div class="fn-right">'+langData['siteConfig'][41][66]+'<i></i></div>');  //旅居养老  详情
                               html.push('</a></li>');
                           }
                       }
                   }

                   html.push('</ul>');

                   if(info.awarddesc){
                       html.push('<div class="pension-ruzhu"><a href="'+info.url+'"><h1>'+langData['business'][5][71]+'</h1>');  //入住有奖
                       html.push('<p>'+info.awarddesc+'</p>');
                       html.push('</a></div>');
                   }

                   $('.pension-con').append(html.join(''));

               }else{
                   $('.pension-con').append('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });
   }


   //教育数据
   if($('.edu-con').size() > 0){

       $('.edu-con .common-title a').attr('href', moduleData['store']['education']['homepage']);

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=education&action=coursesList&store='+moduleData['store']['education']['sid']+'&pageSize=5',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];
                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li><a href="'+list[i].url+'">');
                           html.push('<div class="edu_img">');
                           html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'" alt="">');
                           if(list[i].typename){
                               html.push('<em class="blue-em">'+list[i].typename+'</em>');
                           }
                           html.push('</div>');
                           html.push('<div class="eduInfo">');
                           html.push('<h2>'+list[i].title+'</h2>');
                           html.push('<p><span>'+langData['siteConfig'][49][40].replace('1', list[i].price)+'</span><em>'+(list[i].user && list[i].user.addrname ? list[i].user.addrname[list[i].user.addrname.length-1] : '')+'</em></p>');
                           html.push('<h5><span>'+list[i].classname+'</span><em>'+langData['business'][5][76].replace('1', list[i].sale)+'</em></h5>');
                           html.push('</div></a></li>');

                           $('.edu-con ul').html(html.join(''));
                           $(".edu-con img").scrollLoading();
                       }
                   }else{
                       $('.edu-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.edu-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });
   }


   //旅游数据
   if($('.travel-con').size() > 0){

       //汇总数据
       $('.travel_con1 .common-title a').attr('href', moduleData['store']['travel']['homepage']);

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=travel&action=companyAllDataList&store='+moduleData['store']['travel']['sid']+'&uid='+uid+'pageSize=5',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var pageInfo = data.info.pageInfo;
                   var html = [];
                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           if(i < 5){

                               var info = list[i];
                               var styleType = info.styleType;

                               //门票
                               if(styleType == 'ticket'){

                                   html.push('<li><a href="'+info.url+'">');
                                   html.push('<div class="travel_img"><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+info.litpic+'"><em class="blue-em">'+langData['travel'][1][0]+'</em></div>');  //景点门票
                                   html.push('<div class="travelInfo"><h2>'+info.title+'</h2>');
                                   html.push('<p>');
                                   if(info.tagAll){
                                       for(var m=0;m<info.tagAll.length;m++){
                                           if(m>2) break;
                                           html.push('<span>'+info.tagAll[m].jc+'</span>');
                                       }
                                   }
                                   html.push('</p>');

                                   var price = info.price.split('.');
                                   html.push('<h5><span>' + echoCurrency('symbol') + '<strong>'+price[0]+'</strong>.'+price[1]+'</span><em>'+info.addrname[info.addrname.length-2]+' - '+info.addrname[info.addrname.length-1]+'</em></h5>');
                                   html.push('</div></a></li>');

                               //一日游
                               }else if(styleType == 'agency0'){

                                   html.push('<li><a href="'+info.url+'">');
                                   html.push('<div class="travel_img"><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+info.litpic+'"><em class="blue-em">'+langData['travel'][2][0]+'</em></div>');  //一日游
                                   html.push('<div class="travelInfo"><h2>'+info.title+'</h2>');
                                   html.push('<p>');
                                   if(info.tagAll){
                                       for(var m=0;m<info.tagAll.length;m++){
                                           if(m>2) break;
                                           html.push('<span>'+info.tagAll[m].jc+'</span>');
                                       }
                                   }
                                   html.push('</p>');

                                   html.push('<h5><span>' + echoCurrency('symbol') + '<strong>'+info.price+'</strong></span><em>'+info.addrname[info.addrname.length-2]+' - '+info.addrname[info.addrname.length-1]+'</em></h5>');
                                   html.push('</div></a></li>');

                               //跟团游
                               }else if(styleType == 'agency1'){

                                   html.push('<li><a href="'+info.url+'">');
                                   html.push('<div class="travel_img"><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+info.litpic+'"><em class="blue-em">'+langData['travel'][2][13]+'</em></div>');  //跟团游
                                   html.push('<div class="travelInfo"><h2>'+info.title+'</h2>');
                                   html.push('<p>');
                                   if(info.tagAll){
                                       for(var m=0;m<info.tagAll.length;m++){
                                           if(m>2) break;
                                           html.push('<span>'+info.tagAll[m].jc+'</span>');
                                       }
                                   }
                                   html.push('</p>');

                                   html.push('<h5><span>' + echoCurrency('symbol') + '<strong>'+info.price+'</strong></span><em>'+info.addrname[info.addrname.length-2]+' - '+info.addrname[info.addrname.length-1]+'</em></h5>');
                                   html.push('</div></a></li>');

                               //租车
                               }else if(styleType == 'rentcar'){

                                   html.push('<li><a href="'+info.url+'">');
                                   html.push('<div class="travel_img"><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+info.litpic+'"><em class="blue-em">'+langData['travel'][9][2]+'</em></div>');  //租车
                                   html.push('<div class="travelInfo"><h2>'+info.title+'</h2>');
                                   html.push('<p>');
                                   html.push('<span>'+info.typename+'</span>');
                                   if(info.tagAll){
                                       for(var m=0;m<info.tagAll.length;m++){
                                           if(m>2) break;
                                           html.push('<span>'+info.tagAll[m].jc+'</span>');
                                       }
                                   }
                                   html.push('</p>');

                                   var price = info.price.split('.');
                                   html.push('<h5><span>' + echoCurrency('symbol') + '<strong>'+price[0]+'</strong>.'+price[1]+'</span><em>'+info.addrname[info.addrname.length-2]+' - '+info.addrname[info.addrname.length-1]+'</em></h5>');
                                   html.push('</div></a></li>');

                               //签证
                               }else if(styleType == 'visa'){

                                   html.push('<li><a href="'+info.url+'">');
                                   html.push('<div class="travel_img"><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+info.litpic+'"><em class="blue-em">'+langData['travel'][12][66]+'</em></div>');  //签证
                                   html.push('<div class="travelInfo"><h2>'+info.title+'</h2>');
                                   html.push('<p>');
                                   html.push('<span>'+info.typename+'</span>');
                                   html.push('</p>');

                                   var price = info.price.split('.');
                                   html.push('<h5><span>' + echoCurrency('symbol') + '<strong>'+price[0]+'</strong>.'+price[1]+'</span><em>'+info.countryname+'</em></h5>');
                                   html.push('</div></a></li>');

                               //视频
                               }else if(styleType == 'video'){

                                   html.push('<li><a href="'+info.url+'">');
                                   html.push('<div class="travel_img"><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+info.litpic+'"><em class="blue-em">'+langData['travel'][3][1]+'</em></div>');  //视频
                                   html.push('<div class="travelInfo"><h2>'+info.title+'</h2>');
                                   html.push('<p>');
                                   html.push('<span>'+info.user['nickname']+'</span>');
                                   html.push('</p>');

                                   html.push('<h5><span></span><em>'+info.click+langData['travel'][6][9]+'</em></h5>');  //人预览
                                   html.push('</div></a></li>');

                               }

                           }

                           $('.travel_con1 ul').html(html.join(''));
                           $(".travel_con1 img").scrollLoading();

                           //统计
                           var travelItem = [];
                           if(pageInfo.ticket){
                               var ticketLink = $('.travel_con1').attr('data-ticket').replace('%%', moduleData['store']['travel']['sid']);
                               travelItem.push('<a href="'+ticketLink+'">'+langData['travel'][1][0]+'('+pageInfo.ticket+')<i></i></a>');
                           }
                           if(pageInfo.agency0){
                               var agency0Link = $('.travel_con1').attr('data-agency0').replace('%%', moduleData['store']['travel']['sid']);
                               travelItem.push('<a href="'+agency0Link+'">'+langData['travel'][2][0]+'('+pageInfo.agency0+')<i></i></a>');
                           }
                           if(pageInfo.agency1){
                               var agency1Link = $('.travel_con1').attr('data-agency1').replace('%%', moduleData['store']['travel']['sid']);
                               travelItem.push('<a href="'+agency1Link+'">'+langData['travel'][2][13]+'('+pageInfo.agency1+')<i></i></a>');
                           }
                           if(pageInfo.rentcar){
                               var rentcarLink = $('.travel_con1').attr('data-rentcar').replace('%%', moduleData['store']['travel']['sid']);
                               travelItem.push('<a href="'+rentcarLink+'">'+langData['travel'][9][2]+'('+pageInfo.rentcar+')<i></i></a>');
                           }
                           if(pageInfo.visa){
                               var visaLink = $('.travel_con1').attr('data-visa').replace('%%', moduleData['store']['travel']['sid']);
                               travelItem.push('<a href="'+visaLink+'">'+langData['travel'][12][66]+'('+pageInfo.visa+')<i></i></a>');
                           }
                           if(pageInfo.video){
                               var videoLink = $('.travel_con1').attr('data-video');
                               travelItem.push('<a href="'+videoLink+'">'+langData['travel'][3][1]+'('+pageInfo.video+')<i></i></a>');
                           }
                           $('.travel_con1 .common-tag').html(travelItem.join(''));
                       }
                   }else{
                       $('.travel-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.travel-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });

       //旅游攻略
       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=travel&action=strategyList&u=1&uid='+uid+'&pageSize=2',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];
                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li><a href="'+list[i].url+'">');
                           html.push('<div class="top_img">');
                           html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'" alt="">');
                           html.push('<em class="blue-em">'+list[i].typename+'</em>');
                           html.push('</div>');
                           html.push('<h2>'+list[i].title+'</h2>');
                           html.push('<div class="up_info"><div class="_left"><div class="headimg">');
                           html.push('<img onerror="this.src=\'/static/images/noPhoto_40.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].user.photo+'" alt="">');
                           html.push('</div><p class="up_name">'+list[i].user.nickname+'</p>');
                           html.push('</div>');
                           html.push('<em class="_right">'+list[i].click+'</em>');
                           html.push('</div></a></li>');

                           $('.travel_con2 ul').html(html.join(''));
                           $(".travel_con2 img").scrollLoading();
                       }
                   }else{
                       $('.travel_con2').remove();
                   }
               }else{
                   $('.travel_con2').remove();
               }
           }
       });

       //旅游酒店
       $('.travel_con3 .common-title a').attr('href', $('.travel_con3').attr('data-url').replace('%%', moduleData['store']['travel']['sid']));

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=travel&action=hotelList&store='+moduleData['store']['travel']['sid']+'&pageSize=1',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];
                   if(list.length > 0){

                       var info = list[0];
                       html.push('<div class="top_img fn-clear"><a href="'+info.url+'">');
                       html.push('<div class="left_img"><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+info.litpic+'">');
                       html.push('<div class="pension-tag">');
                       if(info.tagAll!=''){
                           for(var m=0;m<info.tagAll.length;m++){
                               html.push('<span>'+info.tagAll[m].jc+'</span>');
                           }
                       }
                       html.push('</div></div></a></div>');
                       html.push('<div class="hotelInfo"><a href="'+info.url+'">');
                       html.push('<h2>'+info.title+'</h2>');
                       html.push('<p><span>'+echoCurrency('symbol')+'<strong>'+info.price+'</strong>'+langData['travel'][1][6]+'</span><em class="fn-right">'+info.addrname[info.addrname.length-2]+' - '+info.addrname[info.addrname.length-1]+'</em></p>');  //起
                       html.push('</a></div>');

                       $('.travel_con3').append(html.join(''));
                       $(".travel_con3 img").scrollLoading();

                       //房型
                       $.ajax({
                           type: "POST",
                           url: "/include/ajax.php",
                           dataType: "json",
                           data: 'service=travel&action=hotelDetail&id='+info.id,
                           success: function(data) {
                               if(data.state == 100){
                                   var html = [];
                                   var workArr = data.info.workArr;
                                   if(workArr){
                                       html.push('<ul>');
                                       for (var i = 0; i < workArr.length; i++) {
                                           html.push('<li><a href="'+info.url+'" class="fn-clear">');
                                           html.push('<div class="hotel_l fn-left">');
                                           html.push('<h3>'+workArr[i].title+'</h3>');
                                           html.push('<p><span>'+workArr[i].area+'㎡</span><span>'+workArr[i].iswindowname+'</span><span>'+workArr[i].typename+'</span><span>'+workArr[i].breakfastname+'</span></p>');
                                           html.push('</div>');
                                           var price = workArr[i].price.split('.');
                                           html.push('<div class="hotel_m fn-left">' + echoCurrency('symbol') + '<strong>'+price[0]+'</strong>.' + price[1] + '</div>');
                                           html.push('<div class="hotel_r fn-right">'+langData['business'][4][41]+'</div>');  //立即预订
                                           html.push('</a></li>');
                                       }
                                       html.push('</ul>');
                                       $('.travel_con3').append(html.join(''));
                                   }
                               }
                           }
                       });

                   }else{
                       $('.travel_con3').remove();
                   }
               }else{
                   $('.travel_con3').remove();
               }
           }
       });
   }


   //婚嫁数据
   if($('.marry-con').size() > 0){

       $('.marry_con1 .common-title a, .marry_con2 .common-title a').attr('href', moduleData['store']['marry']['homepage']);

       //数据汇总
       var custom = moduleData['store']['marry']['custom'];
       var html = [];
       if(custom){
           for (var i = 0; i < custom.length; i++) {
               if(custom[i] == 2){
                   var url = $('.marry-con').attr('data-url2').replace('%%', moduleData['store']['marry']['sid']);
                   html.push('<a href="'+url+'">婚礼策划<i></i></a>');
               }else if(custom[i] == 3){
                   var url = $('.marry-con').attr('data-url3').replace('%%', moduleData['store']['marry']['sid']);
                   html.push('<a href="'+url+'">租婚车<i></i></a>');
               }else if(custom[i] == 4){
                   var url = $('.marry-con').attr('data-url4').replace('%%', moduleData['store']['marry']['sid']);
                   html.push('<a href="'+url+'">婚纱摄影<i></i></a>');
               }else if(custom[i] == 5){
                   var url = $('.marry-con').attr('data-url5').replace('%%', moduleData['store']['marry']['sid']);
                   html.push('<a href="'+url+'">摄影跟拍<i></i></a>');
               }else if(custom[i] == 6){
                   var url = $('.marry-con').attr('data-url6').replace('%%', moduleData['store']['marry']['sid']);
                   html.push('<a href="'+url+'">婚礼主持<i></i></a>');
               }else if(custom[i] == 7){
                   var url = $('.marry-con').attr('data-url7').replace('%%', moduleData['store']['marry']['sid']);
                   html.push('<a href="'+url+'">珠宝首饰<i></i></a>');
               }else if(custom[i] == 8){
                   var url = $('.marry-con').attr('data-url8').replace('%%', moduleData['store']['marry']['sid']);
                   html.push('<a href="'+url+'">摄像跟拍<i></i></a>');
               }else if(custom[i] == 9){
                   var url = $('.marry-con').attr('data-url9').replace('%%', moduleData['store']['marry']['sid']);
                   html.push('<a href="'+url+'">新娘跟妆<i></i></a>');
               }else if(custom[i] == 10){
                   var url = $('.marry-con').attr('data-url10').replace('%%', moduleData['store']['marry']['sid']);
                   html.push('<a href="'+url+'">婚纱礼服<i></i></a>');
               }
           }
           $('.marry_con1 .common-tag').html(html.join(''));
       }

       //商店+场地信息
       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=marry&action=storeDetail&id='+moduleData['store']['marry']['sid'],
           success: function(data) {
               if(data.state == 100){
                   var html = [];
                   var info = data.info;

                   html.push('<a href="'+moduleData['store']['marry']['homepage']+'"><div class="top_img"><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+info.pics[0].path+'"><span>'+info.addrname[info.addrname.length-2]+' - '+info.addrname[info.addrname.length-1]+'</span></div>');
                   html.push('<div class="wedInfo">');
                   html.push('<div><h2>'+info.title+'</h2><span class="wed-price">'+echoCurrency('symbol')+'<strong>'+info.pricee+'</strong>'+langData['siteConfig'][19][836]+'</span></div>');  //起
                   html.push('<p class="wed-tag">');
                   if(info.flagArr){
                       for (var i = 0; i < info.flagArr.length; i++) {
                           html.push('<span>'+info.flagArr[i].val+'</span>');
                       }
                   }
                   html.push('</p></div></a><div class="wed-info">');
                   html.push('</div>');

                   $('.marry_con2 .wedding').html(html.join(''));
                   $(".marry_con2 img").scrollLoading();

                   //场地
                   $.ajax({
                       type: "POST",
                       url: "/include/ajax.php",
                       dataType: "json",
                       data: 'service=marry&action=hotelfieldList&store='+moduleData['store']['marry']['sid']+'&pageSize=2',
                       success: function(data) {
                           if(data.state == 100){
                               var html = [];
                               var list = data.info.list;
                               if(list){
                                   html.push('<ul>');
                                   for (var i = 0; i < list.length; i++) {
                                       var info = list[i];
                                       html.push('<dl><a href="'+info.url+'">');
                                       html.push('<dt><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+info.litpic+'"></dt>');
                                       html.push('<dd>'+info.title+'</dd>');
                                       html.push('<dd class="spe-dd">');
                                       html.push('<span><em>'+info.maxtable+langData['marry'][5][25]+'</em><em>'+langData['marry'][5][27]+info.floorheight+'m</em><em>'+langData['marry'][5][28]+info.area+'㎡</em></span></dd>');  //桌   层高   面积
                                       html.push('</a></dl>');
                                   }
                                   html.push('</ul>');
                                   $('.marry_con2 .wed-info').append(html.join(''));
                                   $(".marry_con2 img").scrollLoading();
                               }
                           }
                       }
                   });


               }else{
                   $('.marry_con2').remove();
               }
           }
       });
   }


   //家政数据
   if($('.home-con').size() > 0){

       $('.home_con1 .common-title a, .home_con2 .common-title a').attr('href', moduleData['store']['homemaking']['homepage']);

       //服务项目
       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=homemaking&action=hList&store='+moduleData['store']['homemaking']['sid']+'&pageSize=5',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];
                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li><a href="'+list[i].url+'" class="fn-clear">');
                           html.push('<div class="home_img">');
                           html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'" alt="">');
                           if(list[i].typename){
                               html.push('<em class="blue-em">'+list[i].typename+'</em>');
                           }
                           html.push('</div>');
                           html.push('<div class="homeInfo">');
                           html.push('<h2>'+list[i].title+'</h2>');
                           html.push('<p class="sale_after">');
                           if(list[i].store.flagArr){
                               for (var f = 0; f < list[i].store.flagArr.length; f++) {
                                   html.push('<span><img src="'+templets+'images/'+list[i].store.flagArr[f].py+'.png" alt=""><span>'+list[i].store.flagArr[f].val+'</span></span>');
                               }
                           }
                           html.push('</p>');
                           html.push('<p class="new_order"><span class="new_price">' + echoCurrency('symbol') + '<strong>' + list[i].price + '</strong></span>');
                           if(list[i].flagAll.length>0){
                               html.push('<span class="service_arrive">'+list[i].flagAll.jc[0]+'</span>');
                           }
                           html.push('<span class="new_sale fn-right">'+langData['waimai'][7][84]+'<span>'+list[i].sale+'</span></span>');  //已售
                           html.push('</p></div></a></li>');

                           $('.home_con1 ul').html(html.join(''));
                           $(".home_con1 img").scrollLoading();
                       }
                   }else{
                       $('.home_con1 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.home_con1 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });


       //服务人员
       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=homemaking&action=nannyList&store='+moduleData['store']['homemaking']['sid']+'&pageSize=3',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];
                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li><a href="'+list[i].url+'">');
                           html.push('<div class="top_img">');
                           html.push('<img onerror="this.src=\'/static/images/noPhoto_100.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].photo+'" alt="">');

                           if(list[i].experiencename != ''){
                               html.push('<em>');
                               if(list[i].tag!=''){
                                   html.push('<i class="baomu-jin"></i>');
                               }
                               html.push('从业' + list[i].experiencename);
                               html.push('</em>');
                           }

                           html.push('</div>');

                           html.push('<div class="homemakingInfo">');
                           html.push('<h2><strong>'+list[i].username+'</strong><em>'+list[i].age+langData['siteConfig'][13][29]+'</em></h2>');  //岁
                           if(list[i].salaryname > 0){
                               html.push('<p>'+echoCurrency('symbol')+'<strong>'+list[i].salaryname+'</strong>/'+langData['siteConfig'][13][18]+'</p>');  //月
                           }else{
                               html.push('<p><strong>'+langData['business'][5][66]+'</strong></p>');  //面议
                           }
                           html.push('</div></a></li>');

                           $('.home_con2 ul').html(html.join(''));
                           $(".home_con2 img").scrollLoading();
                       }
                   }else{
                       $('.home_con2 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.home_con2 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });

   }


   //汽车数据
   if($('.car-con').size() > 0){

       $('.car-con .common-title a').attr('href', moduleData['store']['car']['homepage']);

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=car&action=car&store='+moduleData['store']['car']['sid']+'&pageSize=5',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];
                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li><a href="'+list[i].url+'">');
                           html.push('<div class="car_img fn-left">');
                           html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'" alt="">');
                           html.push('</div>');
                           html.push('<div class="carInfo">');
                           html.push('<h2>'+list[i].title+'</h2>');
                           html.push('<div class="car-info">');
                           html.push('<span class="car_price"><em>'+echoCurrency('symbol')+'</em><strong>'+list[i].price+'</strong>'+langData['siteConfig'][13][27]+'</span>');  //万
                           if(list[i].sf){
                               html.push('<span class="car_sf">首付'+list[i].sf+'万</span>');
                           }
                           html.push('</div>');
                           html.push('<div class="car-info2">');
                           html.push('<span>'+(list[i].cardtime1.split('-')[0])+'年<em>|</em>'+list[i].mileage+'万公里</span>');
                           html.push('</div>');
                           html.push('</div></a></li>');

                           $('.car-con ul').html(html.join(''));
                           $(".car-con img").scrollLoading();
                       }
                   }else{
                       $('.car-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.car-con ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });
   }


   //装修数据
   if($('.reno-con').size() > 0){

       //案例
       $('.reno_con1 .common-title a').attr('href', moduleData['store']['renovation']['homepage']);

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=renovation&action=diary&company='+moduleData['store']['renovation']['sid']+'&pageSize=5',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];
                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li><a href="'+list[i].url+'">');
                           html.push('<div class="reno_img">');
                           html.push('<img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].litpic+'" alt="">');
                           html.push('<em class="blue-em">'+list[i].units+'</em>');
                           html.push('</div>');
                           html.push('<div class="renoInfo">');
                           html.push('<h2 class="anli_h2">'+list[i].title+'</h2>');
                           html.push('<div class="anli_info fn-clear"><div class="anli_l">');
                           html.push('<img onerror="this.src=\'/static/images/noPhoto_40.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].designer.photo+'" alt="">');
                           html.push('</div>');
                           html.push('<p class="anli_r">'+list[i].area+'m²<em></em>'+list[i].style+'<em></em>'+list[i].price+'万<em></em>'+list[i].btype+'</p>');
                           html.push('</div>');
                           html.push('</div></a></li>');

                           $('.reno_con1 ul').html(html.join(''));
                           $(".reno_con1 img").scrollLoading();
                       }
                   }else{
                       $('.reno_con1 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.reno_con1 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });

       //设计师
       $('.reno_con2 .common-title a').attr('href', $('.reno_con2').attr('data-url').replace('%%', moduleData['store']['renovation']['sid']));

       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=renovation&action=team&company='+moduleData['store']['renovation']['sid']+'&pageSize=3',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];
                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<dl><a href="'+list[i].url+'">');
                           html.push('<dt>');
                           html.push('<img onerror="this.src=\'/static/images/noPhoto_100.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].photo+'" alt="">');
                           html.push('<span><em>'+list[i].post+'</em></span></dt>');
                           html.push('<dd>');
                           html.push('<h2>'+list[i].name+'</h2>');
                           html.push('<h3>'+langData['business'][5][81].replace('1', list[i].works)+'</h2>');  //从业1年
                           html.push('<p>'+langData['business'][5][82]+list[i].style+'</p>');  //擅长
                           html.push('</dd>');
                           html.push('</a></dl>');

                           $('.reno_con2 .site_con').html(html.join(''));
                           $(".reno_con2 img").scrollLoading();
                       }
                   }else{
                       $('.reno_con2 .site_con').html('<p class="empty" style="font-size: .24rem;">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.reno_con2 .site_con').html('<p class="empty" style="font-size: .24rem;">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });
   }


   //交友数据
   if($('.dating-con').size() > 0){

       $('.dating_con1 .common-title a, .dating_con2 .common-title a').attr('href', moduleData['store']['dating']['homepage']);

       //会员
       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=dating&action=memberList&store='+moduleData['store']['dating']['sid']+'&pageSize=5',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];
                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li class="fn-clear"><a href="'+list[i].url+'">');
                           html.push('<div class="dating_img fn-left">');
                           html.push('<img onerror="this.src=\'/static/images/noPhoto_100.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].photo+'" alt="">');
                           html.push('</div>');
                           html.push('<div class="dating_right fn-left">');
                           html.push('<h2><span>'+list[i].nickname+'</span><i class="sex-'+(list[i].sex == 1 ? 'nan' : 'nv')+'"></i></h2>');
                           html.push('<p class="dating_info">'+(list[i].age ? list[i].age + '岁' : '保密')+'<em>|</em>'+(list[i].dutiesName ? list[i].dutiesName : '保密')+'<em>|</em>'+(list[i].heightName ? list[i].heightName : '未填写')+'</p>');
                           html.push('<p class="dating_descrp">'+list[i].profile+'</p>');
                           html.push('<span class="see-dating">'+langData['business'][5][52]+'</span>');  //去看看TA
                           html.push('</div></a></li>');

                           $('.dating_con1 ul').html(html.join(''));
                           $(".dating_con1 img").scrollLoading();
                       }
                   }else{
                       $('.dating_con1 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.dating_con1 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });

       //红娘
       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=dating&action=hnList&company='+moduleData['store']['dating']['sid']+'&pageSize=2',
           success: function(data) {
               if(data.state == 100){
                   var list = data.info.list;
                   var html = [];
                   if(list.length > 0){
                       for (var i = 0; i < list.length; i++) {
                           html.push('<li class="fn-clear"><a href="'+list[i].url+'">');
                           html.push('<div class="hn_img fn-left">');
                           html.push('<img onerror="this.src=\'/static/images/noPhoto_100.jpg\'" src="/static/images/blank.gif" data-url="'+list[i].photo+'" alt="">');
                           html.push('</div>');
                           html.push('<div class="hn_right fn-left">');
                           html.push('<h2>'+list[i].nickname+'</h2>');
                           html.push('<p>'+list[i].year+'年经验</p>');
                           html.push('<span>'+(list[i].case > 0 ? langData['business'][5][50].replace('1', list[i].case) : langData['business'][5][110])+'</span>');  //1对案例   暂无案例
                           html.push('</div></a></li>');

                           $('.dating_con2 ul').html(html.join(''));
                           $(".dating_con2 img").scrollLoading();
                       }
                   }else{
                       $('.dating_con2 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
                   }
               }else{
                   $('.dating_con2 ul').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });
   }

   //贴吧数据
   if($('.tie-wrap').size() > 0){
       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=tieba&action=tlist&uid='+uid+'&pageSize=1',
           success: function(data) {
               if(data.state == 100){
                   var info = data.info.list[0];
                   var html = [];
                   html.push('<a href="'+info.url+'">');
                   if(info.imgGroup.length > 0){
                       html.push('<div class="tie-left fn-left"><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+info.imgGroup[0]+'" class="tie-img"></div>');
                   }
                   html.push('<div class="tie-mid">');
                   html.push('<h2 class="tie-title">'+info.title+'</h2>');
                   html.push('<p class="tie-num">'+info.content+'</p>');
                   html.push('</div>');
                   html.push('<div class="tie-go fn-right">'+langData['business'][5][73]+'</div>');  //去看看
                   html.push('</a>');

                   $('.tie-top').html(html.join(''));
                   $(".tie-top img").scrollLoading();

               }else{
                   $('.tie-top').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });
   }

   //投票数据
   if($('.vote-wrap').size() > 0){
       $.ajax({
           type: "POST",
           url: "/include/ajax.php",
           dataType: "json",
           data: 'service=vote&action=vlist&uid='+uid+'&pageSize=1',
           success: function(data) {
               if(data.state == 100){
                   var info = data.info.list[0];
                   var html = [];
                   html.push('<a href="'+info.url+'">');
                   html.push('<div class="vote-left fn-left"><img onerror="this.src=\'/static/images/404.jpg\'" src="/static/images/blank.gif" data-url="'+info.litpic+'" class="vote-img"></div>');
                   html.push('<div class="vote-mid">');
                   html.push('<h2 class="vote-title">'+info.title+'</h2>');
                   html.push('<p class="vote-num">'+langData['business'][5][41].replace('1', info.total)+'</p>');
                   html.push('</div>');
                   html.push('<div class="vote-go fn-right">'+langData['business'][5][42]+'</div>');  //去投票
                   html.push('</a>');

                   $('.vote-top').html(html.join(''));
                   $(".vote-top img").scrollLoading();

               }else{
                   $('.vote-top').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
               }
           }
       });
   }


   function getComment(){
       var page = 1, pageSize = 5;
       var where = $('.goodMark li.active').data('id');
       where = where ? '&'+where : '';
       $.ajax({
           url: masterDomain + '/include/ajax.php?service=member&action=getComment&son=1&type=business&isAjax=0&aid='+id+where+'&page='+page+'&pageSize='+pageSize,
           type: 'get',
           dataType: 'jsonp',
           success: function(data){

               if(data && data.state == 100){
                   var list = data.info.list;
                   var pageInfo = data.info.pageInfo;
                   var html = [];
                   for(var i = 0; i < list.length; i++){

                       var d = list[i];

                       if(d.content == '' && d.pics.length == 0) continue;
                       html.push('<li class="fn-clear" data-id="'+d.id+'" data-url="comdetail.html">');
                       html.push('    <div class="lileft">');
                       html.push('        <a href="javascript:;" class="headImg">');
                       html.push('            <img src="'+(d.user.photo ? d.user.photo : (staticPath + 'images/noPhoto_60.jpg') )+'" alt="">');
                       html.push('        </a>');
                       html.push('    </div>');
                       html.push('    <div class="liCon">');
                       html.push('        <div class="faComment-tit fn-clear"><h4 class="fn-clear">'+d.user.nickname+'</h4><p class="fa-star"><s style="width: '+parseInt(d.sco1/5*100 ) + '%'+';"></s></p></div>');
                       html.push('        <div class="conInfo">');
                       html.push('          <a href="'+businessUrl+'/comdetail-'+d.id+'.html" class="link">');
                       html.push('            <p>'+d.content.replace(/\n/g, '<br>')+'</p>');
                       if(d.pics.length){
                           html.push('            <div class="comPic">');
                           html.push('                <div class="wrapper fn-clear">');
                           html.push('          <div class="my-gallery comment-pic-slide" itemscope="" itemtype="" data-pswp-uid="1">');
                           html.push('              <div class="swiper-wrapper">');

                           for(var n = 0; n < d.pics.length; n++){
                               html.push('                  <figure itemprop="associatedMedia" itemscope="" itemtype="" class="swiper-slide">');
                               html.push('                        <div itemprop="contentUrl" data-size="800x800" class="picarr" id="pic0">');
                               html.push(`                          <img src="${d.pics[n]}" onerror="this.src='/static/images/404.jpg'" itemprop="thumbnail" alt="Image description">`);
                               html.push('                        </div>');
                               html.push('                   </figure>');
                           }
                           html.push('              </div>');
                           html.push('          </div>');
                           html.push('        </div>');
                           html.push('                <span class="vmark picNum">'+d.pics.length+'张</span>');
                           html.push('            </div>');
                       }
                       html.push('         </a>');
                       html.push('            <div class="conBottom">');
                       html.push('                <em>'+huoniao.transTimes(d.dtime, 2).replace(/-/g, '.')+'</em>');
                       html.push('               <a href="'+businessUrl+'/comdetail-'+d.id+'.html" class="fn-right"><span class="comment"><i></i><em>'+d.lower.count+'</em></span></a>');
                       if(d.is_self != "1"){
                           html.push('                <span class="like'+(d.zan_has == "1" ? " like1" : "")+'"><i></i><em>'+d.zan+'</em></span>');
                       }
                       html.push('            </div>');
                       html.push('        </div>');
                       html.push('    </div>');
                       html.push('</li>');
                   }
                   $('.comment_total').text(pageInfo.totalCount);
                   $('#comment_good').text(pageInfo.sco4 + pageInfo.sco5);
                   $('#comment_middle').text(pageInfo.sco2 + pageInfo.sco3);
                   $('#comment_bad').text(pageInfo.sco1);
                   $('#comment_pic').text(pageInfo.pic);

                   $('.proBox').each(function(i){
                       var t = $(this), s = t.find('s'), num = t.find('.num'), r = 0, n = 0;
                       if(i == 0){
                           n = pageInfo.sco5;
                       }else if(i == 1){
                           n = pageInfo.sco4;
                       }else if(i == 2){
                           n = pageInfo.sco3;
                       }else if(i == 3){
                           n = pageInfo.sco2;
                       }else if(i == 4){
                           n = pageInfo.sco1;
                       }
                       r = (n / pageInfo.totalCount * 100).toFixed(2);
                       s.width(r + '%');
                       num.text(n > 999 ? '999+' : n);
                   })


                   $('.showlist').html(html.join(""));
               }else{
                   $('.showlist').html('');
               }
           }
       })
   }
   getComment();

   // 全部评论
   $(".goodMark ul li").on("click",function(){
       $(this).addClass("active").siblings().removeClass("active");
       var i = $(this).index();
       $('.detailBox ul').eq(i).addClass('showlist').siblings().removeClass("showlist");
       getComment();
   })

   //国际手机号获取
   getNationalPhone();
   function getNationalPhone(){
       $.ajax({
           url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
           type: 'get',
           dataType: 'jsonp',
           success: function(data){
               if(data && data.state == 100){
                  var phoneList = [], list = data.info;
                  var listLen = list.length;
                  var codeArea = list[0].code;
                  if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                       $('.areacode_span').closest('dl').hide();
                       return false;
                  }
                  for(var i=0; i<list.length; i++){
                       phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                  }
                  $('.layer_list ul').append(phoneList.join(''));
               }else{
                  $('.layer_list ul').html('<div class="loading">'+langData['siteConfig'][21][64]+'</div>');//暂无数据！
                 }
           },
           error: function(){
                   $('.layer_list ul').html('<div class="loading">'+langData['siteConfig'][20][462]+'</div>');//加载失败！
               }

       })
   }
   // 打开手机号地区弹出层
   $(".areacode_span").click(function(){
       $('.layer_code').show();
       $('.mask-code').addClass('show');
   })
   // 选中区域
   $('.layer_list').delegate('li','click',function(){
       var t = $(this), txt = t.find('em').text();
       $(".areacode_span label").text(txt);
       $("#areaCode").val(txt.replace("+",""));

       $('.layer_code').hide();
       $('.mask-code').removeClass('show');
   })

   // 关闭弹出层
   $('.layer_close, .mask-code').click(function(){
       $('.layer_code').hide();
       $('.mask-code').removeClass('show');
   })
   //店铺认领弹出
   $('.renling').bind('click', function(){
       $('.renling_alert,.renling-mask').show();

   });

   //关闭店铺认领弹出
   $('.step .cancel,.renling-mask').bind('click', function(){
       $('.renling_alert,.renling-mask,.rl_success').hide();
   });

   $('.rl_success .know').bind('click', function(){
       $('.renling-mask,.rl_success').hide();
   });


   // 错误提示
   function showMsg(str){
       var o = $(".error");
       o.html('<p>'+str+'</p>').show();
       setTimeout(function(){o.hide()},1000);
   }
   //提交认领
   $('.step .sure').bind('click', function(e){
       e.preventDefault();

       var t = $("#fabuForm"), action = t.attr('action'), r = true;

       var username = $('#username').val();
       var tel      = $('#tel').val();
       if(!username){
           r = false;
           showMsg(langData['education'][6][32]); //请输入姓名
           return;
       }else if(!tel){
           r = false;
           showMsg(langData['education'][6][24]); //请输入手机号
           return;
       }

       if(!r){
           return;
       }
       $('.renling_alert').hide();
       $('.rl_success').show();
       // $.ajax({
       //     url: action,
       //     data: t.serialize(),
       //     type: 'post',
       //     dataType: 'json',
       //     success: function(data){
       //         if(data && data.state == 100){
       //             showMsg(data.info);
       //             $('.renling-mask,.renling_alert').hide();
       //         }else{
       //           showMsg(data.info);
       //         }
       //     },
       //     error: function(){
       //       showMsg(langData['education'][5][33]);
       //     }
       // });

   });

   //商家店铺弹出
   // $('.has-module,.more-dianpu').bind('click', function(){
   //     $('.shop_alert').animate({"bottom":'0'},500);
   //     $('.shop-mask').show();
   //     $('html').addClass('noscroll');
   // });

   //关闭商家店铺
   $('.shop_alert .close_alert,.shop-mask').bind('click', function(){
       $('.shop_alert').animate({"bottom":'-100%'},500);
       $('.shop-mask').hide();
       $('html').removeClass('noscroll');
   });


   // 切换全景或者视频
   $(".tab_box li").click(function(){
       $(this).addClass("on_chose").siblings('li').removeClass("on_chose");
       var qjsrc = $('.quanjing-box .playdalog').attr('data-src')
       if($(this).hasClass("qj_btn")){

           $('.quanjing-box').show();
           $(".topMain").addClass("highBox");
           if(!$(".quanjing-box iframe").attr('src')){
               $('.quanjing-box iframe').attr("src",qjsrc);
           }
           $(".topMain .swiper-main,.quanjing-box img").hide();
       }else if($(this).hasClass("v_btn")){
           swiper.slideTo(slideIndex_video);
           $('.quanjing-box').hide();
           $(".topMain .swiper-main").show();
           $(".topMain").removeClass("highBox");
       }else{
           swiper.slideTo(slideIndex_img);
           $('.quanjing-box').hide();
           $(".topMain .swiper-main").show();
           $(".topMain").removeClass("highBox");
       }
       swiper.update();
   });

   var bottom_height = $(".bottom_box").height()
   $(".other-comment").click(function(){
       $(".bottom_box").animate({
           "bottom":0
       },100);
       $(".btm_mask").fadeIn(100);
       $('html').addClass("noscroll")

   });

   $(".bottom_box .close_btn,.btm_mask").click(function(){
       $(".bottom_box").animate({
           "bottom": (-100-bottom_height)
       },100);
       $(".btm_mask").fadeOut(100);
       $('html').removeClass("noscroll")

   })
});
