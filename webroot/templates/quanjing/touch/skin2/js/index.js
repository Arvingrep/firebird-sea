$(function(){
// var device = navigator.userAgent;
// if(device.indexOf('huoniao') > -1){
//   $('.areaChose').bind('click', function(e){
//     e.preventDefault();
//     setupWebViewJavascriptBridge(function(bridge) {
//       bridge.callHandler('goToCity', {'module': 'quanjing'}, function(){});
//     });
//   });
// }
    var page = 1;
    var  type = '';
    var  title = '';

  // 点击导航栏（切换栏目）
  $('.arrow-down').click(function(){
    var a = $(this);
    if(a.hasClass('active')){
      $('.c_switch').hide();
      a.removeClass('active');

    }else{
      $('.c_switch').show();
      a.addClass('active');
    }
  });


  var active = 0;


  // 点击导航栏选中
  $('.nav-box a').click(function(){
    var b = $(this), index = b.index();
    active = index;
      $(".video_list ul").empty();
    page = 1;
      type = b.attr("data-id");
      $("#search_keyword").val("");
      title = '';

      getList();
    if(!b.hasClass('on')){
      b.addClass('on').siblings().removeClass('on');
    }
    $('.nav-info a').eq(active).addClass("on").siblings().removeClass("on")
  });
$(".nav-box a").eq(0).click();

  var mySwiper = new Swiper('.nav-box',{
      initialSlide : 0,
      slidesPerView : "auto",
      freeMode : true,
      freeModeSticky : true,
      slideToClickedSlide:true
  })


$(".nav-box a").click(function(){
  var t = $(this), left = t.offset().left, index = t.index();
  var mg = t.css('margin');
  var mgl = mg.split(' ')[1];
  mgl = parseInt(mgl);
  var com = $('.swiper-wrapper');
  var comleft = com[0].style.transform;
  if(comleft){
    comleft = comleft.split('(')[1];
    comleft = comleft.split(',')[0];
    comleft = parseInt(comleft);
  }else{
    comleft = 0;
  }
  if(index > 0){
    var prev = t.prev(), preveWidth = prev.width();
    if(left <= (preveWidth + mgl)){
        var newLeft = comleft + (preveWidth + mgl * 2);
        $(".swiper-wrapper").css({'transition-duration':'200ms', transform:'translate3d('+newLeft+'px, 0, 0)'})
        setTimeout(function(){
          $(".swiper-wrapper").css({'transition-duration':0});
        },200)
    }else{
      var conw = com.width();
      if(left > conw + mgl){
        new Swiper('.nav-box',{
            initialSlide : index,
            slidesPerView : "auto",
            freeMode : true,
            freeModeSticky : true,
            slideToClickedSlide:true
        })
      }
    }
  }else{
        $(".swiper-wrapper").css({'transition-duration':'200ms', transform:'translate3d(0, 0, 0)'})
        setTimeout(function(){
          $(".swiper-wrapper").css({'transition-duration':0});
        },200)
  }
})



function getList(){
  var html = [];
      $.ajax({
          url : '/include/ajax.php?service=quanjing&action=qlist&pageSize=10&orderby=1&page=' + page+'&typeid='+type+'&title='+title,
          data : {},
          type : 'get',
          dataType : 'json',
          success : function (data) {
              if(data.state == 100){
                  var list = data.info.list;
                  var len = list.length;
                  var html = [];
                  for(var i=0; i<len; i++){
                        var is_zan = '';
                        if(list[i].is_zan){
                            is_zan = 'active';
                        }
                      var url_user = list[i].url_user;
                      var is_user = list[i].is_user;

                      var is_follow = 'add_follow';
                        var is_follow_htm = '关注';
                        if(list[i].is_follow){
                            is_follow = 'pitchOn';
                            is_follow_htm = '已关注';
                        }
                        var username = list[i].user.username;
                        if(username == 'undefined'){
                            username = '管理员';
                        }
                      html.push('<a href="'+list[i].url+'">');
                      html.push('<li>');
                      html.push('  <div class="bg_img">');
                      html.push('<img src="'+list[i].litpic+'">');
                      html.push('<p>'+list[i].title+'</p>');
                      html.push('<div class="fn-clear"><span>'+list[i].click+'</span></div>');
                      html.push('</div>');

                      if(is_user){
                          html.push('<div class="bg_content fn-clear">');
                          html.push('</a>');
                          html.push('<a href="'+url_user+'">');
                          html.push('  <div class="headPortrait"><img src="'+list[i].user.photo+'"></div>');
                          html.push('  <span class="user_name">'+list[i].user.username+'</span>');
                          html.push('</a>');
                          html.push('  <span class="follow '+is_follow+'" data-vid="'+list[i].id+'">'+is_follow_htm+'</span>');
                          html.push('  <span class="dianzan '+is_zan+'" data-uid="'+list[i].user.userid+'" data-vid="'+list[i].id+'">'+list[i].zanCount+'</span>');
                          html.push('  <span class="xinxi">'+list[i].common+'</span>');
                          html.push('</div>');
                      }



                      html.push('</li>');
                  }

                  $(".video_list ul").append(html.join(""));

              }else{
                  $(".video_list ul").html("<p style='align-content: center;margin-left: 169px;margin-top: 10px;'>暂无数据！</p>");
              }
          }
      })

  }


// 点击关注
$('.video_list ul').delegate('.follow','click',function(){
  var t = $(this);
    var vid = t.attr("data-vid");
    var type = 0;
    if(t.hasClass('add_follow')){
      type = 1;
      $.ajax({
          url : '/include/ajax.php?service=video&action=follow&vid=' + vid + '&type=' + type + '&temp=quanjing',
          data : '',
          type : 'get',
          dataType : 'json',
          success : function (data) {
              if(data.state == 100){
                  t.removeClass('add_follow').addClass('pitchOn');
                  t.text('已关注');
              }else{
                  alert(data.info);
                  window.location.href = masterDomain + '/login.html';

              }

          }
      })
  }else{
        $.ajax({
            url : '/include/ajax.php?service=video&action=follow&vid=' + vid + '&type=' + type + '&temp=quanjing',
            data : '',
            type : 'get',
            dataType : 'json',
            success : function (data) {
                if(data.state == 100){
                    t.removeClass('pitchOn').addClass('add_follow');
                    t.text('关注');
                }else{
                    alert(data.info);
                    window.location.href = masterDomain + '/login.html';
                }

            }
        })
  }
});

// 点赞
$('.video_list ul').delegate('.dianzan','click',function(){
  var t = $(this);
    var vid = t.attr("data-vid"), uid = t.attr("data-uid");
    var type = 0;
    //取消

    var b = t.text();
    t.hasClass('active') ? b-- : b++;
	var zanTitle = t.closest('li').find('.bg_img p').text();
    $.ajax({
      url: "/include/ajax.php?service=member&action=getZan&module=quanjing&temp=detail&title="+zanTitle+"&id="+vid+"&uid="+uid,
      type: "GET",
      dataType: "json",
      success: function (data) {
        if(data.state == 100){
            t.toggleClass('active');
            t.text(b);
        }else{
            showErrAlert(data.info);
        }
      }
    });
});

var xiding = $(".nav-box"),chtop = parseInt(xiding.offset().top);
$(window).on("scroll", function() {
    var thisa = $(this);
    var st = thisa.scrollTop();
    var sct = $(window).scrollTop();
    if (st >= chtop) {
      $(".nav-box").addClass('choose-top');
    } else {
      $(".nav-box").removeClass('choose-top');
    }
    if (sct + $(window).height() >= $(document).height()) {
        page++;
       getList();
    }

  });

    $(".search-btn").click(function () {
        var key = $(".txt_search").val();
        title = key;
        $(".video_list ul").html('');
        getList();
    })



})
