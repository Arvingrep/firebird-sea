$(function(){
	//APP端取消下拉刷新
    toggleDragRefresh('off');
  // var device = navigator.userAgent;
  // if(device.indexOf('huoniao') > -1){
  //       $('.areaChose').bind('click', function(e){
           
  //           setupWebViewJavascriptBridge(function(bridge) {
  //               bridge.callHandler('goToCity', {'module': 'pension'}, function(){});
  //           });
  //         return false;
  //       });
    // }
//搜索框
//接受输入的值
  $('.btn-go').click(function(){
    var keywords = $('#keywords').val()

    $('.textIn-box ').submit();

  });

   $('.search-form ').delegate('.type', 'click', function(event) {
        $('.typelist').toggleClass('show');
   });
   $('.typelist').delegate('p', 'click', function(event) {
        var url = $(this).data('url');
        if($(this).text()=="机构养老"){
          $('.search-form').find('.type label').text('机构养老');
          $('.typelist').toggleClass('show');
          $('#sform').attr('action', url);
        }else if($(this).text()=="居家养老"){
          $('.search-form').find('.type label').text('居家养老');
          $('.typelist').toggleClass('show');
          $('#sform').attr('action', url);
        }else{
          $('.search-form').find('.type label').text('旅居养老');
          $('.typelist').toggleClass('show');
          $('#sform').attr('action', url);
        }
   });
   $(".inp").delegate('#search', 'click', function(event) {
    $('#sform').submit();
   });


  // banner轮播图
  new Swiper('.banner .swiper-container', {pagination:{ el: '.banner .pagination',} ,slideClass:'slideshow-item',loop: true,grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,}});

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



    // //导航内容切换
    $('.reno_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('#tabs_container .design_container').eq(i).addClass('div_show').siblings().removeClass('div_show');
    });

    //滚动信息
    $.ajax({
        url : "/include/ajax.php?service=pension&action=storeList",
        type : "GET",
        data : {},
        dataType : "json",
        success : function (data) {
            var obj = $(".mBox .swiper-wrapper");
            if(data.state == 100){
                var list = data.info.list;
                var html = '';
                var length = list.length;
                for (var i = 0; i < length; i++){
                    if(i < length){
                        if(i % 2 != 0 ){
                            continue;
                        }
                    }

                    var html2 = '';
                    html2 =  '<a href="'+list[i+1].url+'" class="fn-clear"><p><span>5/23</span><span>欢迎</span><span>'+list[i+1].title+'</span><span>成功入驻</span></p></a>' ;
                    html += '<div class="swiper-slide swiper-no-swiping">' +
                        '<a href="'+list[i].url+'" class="fn-clear"><p><span>5/23</span><span>欢迎</span><span>'+list[i].title+'</span><span>成功入驻</span></p></a>' +
                        html2 +
                        '</div>';

                }
                obj.html(html);
                new Swiper('.tcNews .swiper-container', {direction: 'vertical', pagination: { el: '.tcNews .pagination'},loop: true,autoplay: {delay: 2000},observer: true,observeParents: true,disableOnInteraction: false});
            }
        }
    });


   //横向滚动

    var swiper = new Swiper('.org_service .swiper-container', {
      slidesPerView: 1.6,
      spaceBetween: 10,


    });




    // 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }
    // 手机号验证
    function isPhoneNo(p) {
        var pattern = /^1[34578]\d{9}$/;
        return pattern.test(p);
    }





    // 悬浮发布
    $(document).ready(function (ev) {
          $('.menu').on('touchend', function (ev) {
              if($('.mask').hasClass('show')){
                 $('.mask').removeClass('show');
               }else{
                 $('.mask').addClass('show');
               }
              $('.mIcon').toggleClass('close');
              $('.menu').toggleClass('m_active');
              $('.mIcon.wx').toggleClass('m_curr');
              $('.mIcon.my').toggleClass('m_curr');
              $('.mIcon.gt').toggleClass('m_curr');
          });

    });







});
