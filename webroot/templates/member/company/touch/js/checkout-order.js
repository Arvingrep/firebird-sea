$(function(){
  var isload = false;

  var tabsSwiper;

  checkUserModule();


  $("#swiper-container1 .swiper-slide").on('touchstart mousedown',function(e){
    e.preventDefault();
    $("#swiper-container1 .active-nav").removeClass('active-nav')
    $(this).addClass('active-nav')
    tabsSwiper.slideTo( $(this).index() )
  })
  $("#swiper-container1 .swiper-slide").click(function(e){
    e.preventDefault()
  })

  // 选择类型
  $('.select').click(function(){
     var t = $(this);
     if (t.hasClass('show')) {
       t.removeClass('show');
     }else {
       t.addClass('show');
     }
     return false;
   })

   $('body').click(function(){
     $('.select').removeClass('show');
   })

   //类型切换
   $(".select ul li").bind("click", function(){
     var t = $(this), id = t.attr("data-id"), txt = t.text();
     if(!t.hasClass("curr")){
       t.addClass("curr").siblings("li").removeClass("curr");
       $('.select em').text(txt);
     }
   });

   $(window).scroll(function(){
    var sct = $(window).scrollTop();
    var active = $(".stra_lead .active-nav"), index = active.index();
    var loading = $(".order-list").eq(index).find(".loading");

    var top = loading.offset().top;
    var fixh = $(window).height() - loading.height();
    if(sct + fixh + 10 >= top){
      getOrderList('next');
    }
   })


   function checkUserModule(){

     if($(".stra_lead .swiper-slide").length > 0){

      $(".stra_lead").removeClass("vh");
      var html = [];
      for(var i = 0; i < $(".stra_lead .swiper-slide").length; i++){
        html.push('<div class="swiper-slide">');
        html.push(' <div class="content-slide">');
        html.push('   <ul class="order-list">');
        html.push('     <li class="loading">'+langData['siteConfig'][20][409]+'</li>');
        html.push('   </ul>');
        html.push('  </div>');
        html.push('</div>');
      }
      $(".quan_list").html(html.join(""));

      tabsSwiper = new Swiper('#swiper-container2',{
        speed:500,
        autoHeight: true,
        onSlideChangeStart: function(){
          $("#swiper-container1 .active-nav").removeClass('active-nav');
          $("#swiper-container1 .swiper-slide").eq(tabsSwiper.activeIndex).addClass('active-nav');
          $("#swiper-container2 .swiper-slide").eq(tabsSwiper.activeIndex).css('height', 'auto').siblings('.swiper-slide').height($(window).height() - $('.header').height() - $('#swiper-container1').height());
          $(window).scrollTop(0);
          getOrderList('refresh', tabsSwiper.activeIndex);

        },
        onSliderMove: function(){

        },
        onSlideChangeEnd: function(){

        }
      })

      getOrderList();

     }else{
      $(".quan_list").html('<div class="loading" style="width:100%;">'+langData['siteConfig'][20][421]+'</div>');
    }

  }


  // 获取明细
  function getOrderList(type, idx){

    if(isload) return;

    var data = [];
    var active, index;
    if(idx){
      active = $(".stra_lead .swiper-slide").eq(idx);
      index = idx;
    }else{
      active = $(".stra_lead .active-nav");
      index = active.index();
    }

    var module = active.attr("data-module"),
        page = active.attr("data-page");

    var objContent = $(".quan_list .swiper-slide").eq(index);

    if(type == 'refresh'){
      page = 1;
      active.attr("data-page", "1");
      objContent.find("ul").html('<li class="loading">'+langData['siteConfig'][20][409]+'</li>');
    }
    var loading = objContent.find('.loading');

    if(type == 'next'){
      page++;
      active.attr("data-page", page);
    }

    if(loading.hasClass("end")) return;

    data.push('module='+module);
    data.push('page='+page);
    data.push('pageSize=10');

    isload = true;

    $.ajax({
      url: '/include/ajax.php?service=member&action=getOrderList',
      data: data.join('&'),
      type: 'post',
      dataType: 'json',
      success: function(res){

        if(res && res.state == 100){
          var list = res.info.list, len = list.length, pageInfo = res.info.pageInfo;

          if(len > 0){
            var html = [];
            for(var i = 0; i < len; i++){
              var obj = list[i],
                  date = obj.date,
                  paytype = obj.paytype,
                  amount = obj.amount,
                  ordernum = obj.ordernum,
                  orderdate = obj.orderdate,
                  user = obj.user,
                  store = obj.store;

              var ptstr = [];
              var ptarr = paytype.split(",");
              for(var m = 0; m < ptarr.length; m++){
                for(n in paytypeArr){
                  if(ptarr[m] == n){
                    ptstr.push(paytypeArr[n]);
                    break;
                  }
                }
              }

              html.push('<li data-storeTitle="'+store.title+'" data-storeLog="'+store.logo+'" data-storeUrl="'+store.url+'" data-user="'+user+'" data-ordernum="'+ordernum+'" data-orderdate="'+orderdate+'" data-amount="'+amount+'">');
              html.push('  <a href="javascript:;" class="detail">');
              html.push('    <p class="mount fn-clear"><span>'+ptstr.join(",")+'</span><em>+'+amount+'</em></p>');
              html.push('    <p class="gray">'+date+'</p>');
              html.push('  </a>');
              html.push('</li>');
            }

            loading.before(html.join("")).addClass("vh");

            if(page == pageInfo.totalPage){
              loading.html(langData['siteConfig'][20][429]).addClass('end').removeClass('vh');
            }

          }else{
            loading.html(langData['siteConfig'][20][429]).addClass('end').removeClass('vh');
          }

        }else{
          loading.html(langData['siteConfig'][21][64]).addClass('end').removeClass('vh');
        }

        isload = false;
      },
      error: function(){
        alert(langData['siteConfig'][20][183]);
        isload = false;
      }
    })
   }

   // 查看详情
   var psct = 0;
   $(".quan_list").delegate(".detail", "click", function(){
    psct = $(window).scrollTop();
    var t = $(this), li = t.closest('li');
    var store = li.attr('data-storeTitle'),
        logo = li.attr('data-storelog') != '' ? li.attr('data-storelog') : $('.detailcon .store a img').attr('data-src'),
        url = li.attr('data-storeUrl'),
        paytype = t.find('p span').text(),
        user = li.attr('data-user'),
        ordernum = li.attr('data-ordernum'),
        orderdate = li.attr('data-orderdate'),
        amount = li.attr('data-amount');


        var con = $(".detailcon"),
            info = con.children('.info');

        con.find('.store a').attr('href', url)
          .children('img').attr('src', logo)
          .next().text(store);

        con.find('.count em').text(amount);

        info.children('li').eq(0).children('em').text(paytype);
        info.children('li').eq(1).children('em').text(user);
        info.children('li').eq(2).children('em').text(orderdate);
        info.children('li').eq(3).children('em').text(ordernum);

      $('body').addClass('fixed');
      con.addClass('isshow');

   })

  // 关闭详情
  $(".detailcon .header-l a").click(function(){
    $(".detailcon").removeClass("isshow");
    $('body').removeClass('fixed');
    if(psct){
      $(window).scrollTop(psct);
    }
  })

})

var paytypeArr = [];
paytypeArr['alipay'] = langData['siteConfig'][19][699];
paytypeArr['wxpay'] = langData['siteConfig'][19][700];
paytypeArr['money'] = langData['siteConfig'][19][328];
paytypeArr['point'] = langData['siteConfig'][19][701];
paytypeArr['unionpay'] = langData['siteConfig'][19][702];
paytypeArr['paypal'] = langData['siteConfig'][19][703];
paytypeArr['tenpay'] = langData['siteConfig'][19][704];
