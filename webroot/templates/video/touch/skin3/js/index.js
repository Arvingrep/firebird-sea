$(function(){
  var device = navigator.userAgent;
  if(device.indexOf('huoniao') > -1){
    // $('.areaChose').bind('click', function(e){
    //   e.preventDefault();
    //   setupWebViewJavascriptBridge(function(bridge) {
    //     bridge.callHandler('goToCity', {'module': 'video'}, function(){});
    //   });
    // });
  }

  //搜索框
  $('.search').click(function(){
    $('.search form').addClass('slideL');
    $('#skeyword').focus();
  })

  //banner1
  var advlen1 = $('.adv_banner1').find('.swiper-slide').length;
  if (advlen1 != 0) {
      var swiper_adv = new Swiper('.adv_banner1 .swiper-container', {
          centeredSlides: true,
          slidesPerView: 'auto',
          autoplay: {
              delay: 2000,
              disableOnInteraction: false,
          },
          spaceBetween: 4,
          loop: true,


      });

  } else {
    $('.tjBox').addClass('noBanner');
      $('.BannerBox').hide();
  }



var isload = false,page =1;
//滚动底部加载
$(window).scroll(function() {
    var allh = $('body').height();
    var w = $(window).height();
    var s_scroll = allh - 30 - w;
    if ($(window).scrollTop() > s_scroll && !isload) {
        page++;
        getList();
    };
});
// 点击搜索框
$('.search i').click(function(){
  if(!$('.hh').hasClass('btnShow')){
      $('.hh').addClass('btnShow').removeClass('btnHide');
  }
});



// 数据加载
getList();
function getList(title){
  isload=true;
  $('.video_list .loading').remove();
  $(".video_list").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
  $.ajax({
      url : '/include/ajax.php?service=video&action=alist&pageSize=10&page=' + page + '&orderby=1',
      data : '',
      type : 'get',
      dataType : 'json',
      success : function (data) {
        if(data.state == 100){
          $(".video_list .loading").remove();
          var list = data.info.list,len = list.length, html = [];
          for (var i = 0; i < len; i++) {
              var pic = list[i].litpic!='' && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
              var photo = list[i].user.photo!='' && list[i].user.photo != undefined ? list[i].user.photo : "/static/images/404.jpg";
              html.push('<li>');
              html.push('  <div class="top_img">');
              html.push('     <a href="'+list[i].url+'">');
              html.push('     <img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/404.jpg\';this.onerror=this.src=\''+staticPath+'images/noPhoto_100.jpg\';">');
              if(list[i].times){
                html.push('     <div class="scInfo"><span class="time">'+list[i].times+'</span></div>');
              }
              html.push('     <div class="need">');
              var str1 = str2 ='';
              if(list[i].videocharge.split(',').indexOf('3')>-1 ){
                  str1 = ' <span class="money">付费</span>';
              }
              if(list[i].videocharge.split(',').indexOf('1')>-1 ){
                  str2 = ' <span class="vip">VIP</span>';
              }
              html.push('       '+str1+str2+'');
              html.push('     </div>');
              html.push('     </a>');
              html.push('   </div>');
              html.push('   <div class="vInfo">');
              html.push('     <h3><a href="'+list[i].url+'">'+list[i].title+'</a></h3>');
              var is_user = list[i].is_user;
              if(is_user){
                html.push('   <div class="fbInfo">');
                html.push('     <a href="'+list[i].user_url+'" class="fn-clear">');
                html.push('     <div class="lImg"><img src="'+photo+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                html.push('     <h4>'+(list[i].user.nickname ? list[i].user.nickname : list[i].user.username)+'</h4>');
                html.push('     </a>');
                html.push('   </div>');
              }
               html.push('</div>');
              html.push('</li>');
          }

          if(len > 0){
            isload = false;
            $(".video_list ul").append(html.join(""));
          }else{
            isload = true;
            $('.video_list .loading').html(langData['siteConfig'][21][64]);//暂无数据！
          }
          if(page >= data.info.pageInfo.totalPage){
            isload = true;
            $(".video_list").append('<div class="loading">'+langData['siteConfig'][20][429]+'</div>');
          }

        }else{
            isload = false;
            $('.video_list .loading').html(langData['siteConfig'][21][64]);//暂无数据！
        }

      },
      error: function(){
          isload = false;
          $('.video_list .loading').html(langData['siteConfig'][20][462]);//加载失败！
      }
  })

}


    $(".search_keyword").click(function () {
        var active = $('.pubBox .active'), action = active.attr('data-id');
        if(action == 1){
            $(".video_list ul").html('');
        }else if (action == 2){
            $(".tc_list ul").html('');
        }
        var key = $(".txt_search").val();
        title = key;
        getList(title);

    })



})
