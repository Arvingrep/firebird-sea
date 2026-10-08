/**
 * Created by Administrator on 2018/5/18.
 */
$(function(){
    // 判断浏览器是否是ie8
     if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.app-con .down .con-box:last-child').css('margin-right','0');
        $('.wx-con .c-box:last-child').css('margin-right','0');
        $('.module-con .box-con:last-child').css('margin-right','0');
        $('.recommend-info .picture-con .picture:last-child').css('margin-right','0');
        $('.tuan-box .tuan-con .main-tuan:last-child').css('margin-right','0');
        $('.qiye-con .main-box:last-child').css('margin-right','0');
        $('.house-box .slideBox .bd ul li .li-box:last-child').css({'border-bottom':'none','padding-bottom':'0'});
        $('.kefu-box .con-box .sub-fi:nth-child(4n)').css('margin-right','0');
        $('.kefu-box .con-box .bu-con ul.fb-list li:nth-child(5n)').css('margin','0 0 10px 0');
     }
     // 手机端、微信端
     $('.app-con .icon-box.app').hover(function(){
        $('.app-down').show();
     },function(){
        $('.app-down').hide();
     });
     $('.app-con .icon-box.wx').hover(function(){
        $('.wx-down').show();
     },function(){
        $('.wx-down').hide();
     })


    // 焦点图
    $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});
    //公告
    if($(".NewsBox .Newslead .notice").size() > 0){
        $(".NewsBox .Newslead .notice").slide({mainCell: "ul", effect: "top", autoPlay: true});
    }


    //推荐商家-导航条
    $('.buss-con').each(function(){
      var swiperNav = [], mainNavLi = $(this).find('li a');
      for (var i = 0; i < mainNavLi.length; i++) {
        swiperNav.push($(this).find('li:eq('+i+')').html());
      }
      var liArr = [];
      for(var i = 0; i < swiperNav.length; i++){
        liArr.push(swiperNav.slice(i, i + 5).join(""));
        i += 4;
      }
      $(this).find('ul').html('<li>'+liArr.join('</li><li>')+'</li>');
    });

    $(".slideBox00").slide({titCell:".hd ul", mainCell:".bd ul",effect:"leftLoop",autoPage:"<li></li>"});



    //鼠标经过头部链接显示浮动菜单
    $(".nav-con ul li").hover(function(){
        var t = $(this), pop = t.find(".li-down");
        pop.show();
        t.addClass("active");
    }, function(){
        var t = $(this), pop = t.find(".li-down");
        pop.hide();
        t.removeClass("active");
    });



    // 同城活动--轮播
    var swiperNav = [], mainNavLi = $('.activity-con').find('li');
    for (var i = 0; i < mainNavLi.length; i++) {
      swiperNav.push($('.activity-con').find('li:eq('+i+')').html());
    }
    var liArr = [];
    for(var i = 0; i < swiperNav.length; i++){
      liArr.push(swiperNav.slice(i, i + 4).join(""));
      i += 3;
    }
    $('.activity-con').find('ul').html('<li>'+liArr.join('</li><li>')+'</li>');
    $(".slideBox3").slide({mainCell:".bd ul",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});


     //发布信息-导航条
    $(".recommend-info .top-box ul li").click(function(){
        $(this).addClass("active").siblings().removeClass("active");
        var i=$(this).index();
        $(this).closest('.recommend-info').find(".info-con").eq(i).addClass("show").siblings().removeClass("show");
    });

     //推荐商品-导航条
    $(".goods-box .top-box ul li").click(function(){
        $(this).addClass("active").siblings().removeClass("active");
        var i=$(this).index();
        $(".goods-con").eq(i).addClass("show").siblings().removeClass("show");
    });

     //企业招聘-导航条
    $(".job-box .top-box ul li").click(function(){
        $(this).addClass("active").siblings().removeClass("active");
        var i=$(this).index();
        $(".job-con").eq(i).addClass("show").siblings().removeClass("show");
    });

    //企业招聘--一句话招聘
    $('.job-con.zhaopin ul').find('li').hover(function(){
        $(this).find('.j-cover').html($(this).find('.j-con').html());
        $(this).find('.j-cover').css('opacity','1');
    },function(){
        $(this).find('.j-cover').css('opacity','0');
    });

    // 推荐二手房--焦点图
    var swiperNav = [], mainNavLi = $('.slideBox4 .bd').find('li');
    for (var i = 0; i < mainNavLi.length; i++) {
      swiperNav.push($('.slideBox4 .bd').find('li:eq('+i+')').html());
    }
    var liArr = [];
    for(var i = 0; i < swiperNav.length; i++){
      liArr.push(swiperNav.slice(i, i + 4).join(""));
      i += 3;
    }
    $('.slideBox4 .bd').find('ul').html('<li>'+liArr.join('</li><li>')+'</li>');
    $(".slideBox4").slide({titCell:".hd ul", mainCell:".bd ul",effect:"leftLoop", autoPage:"<li></li>",autoPlay: true});

    // 最新求租-导航条
    $(".box-right.house-info .top-box ul li").click(function(){
        $(this).addClass("active").siblings().removeClass("active");
        var i=$(this).index();
        $(".h-info").eq(i).addClass("show").siblings().removeClass("show");
    });

     //最新入驻
    if($(".hy-info .newHy .right-con").size() > 0){

        $(".hy-info .newHy .right-con").slide({mainCell:"ul",autoPage:true,effect:"top",autoPlay:true,vis:3});

    }


    //悬浮
    $('.kefu-box').find('.con-box').hover(function(){
        $(this).find('.k-cover').html($(this).find('.k-con').html().replace('.png', '1.png'));
        $(this).find('.k-cover').show();
        $(this).find('.f-box').show(100);
    },function(){
        $(this).find('.k-cover').hide();
        $(this).find('.f-box').hide();
    });

    $(".kefu-box .fabu-con .fb-list li").bind("hover", function(){
        var t = $(this), index = t.index();
        if(!t.hasClass("curr")){
            t.addClass("curr").siblings("li").removeClass("curr");
            $(".kefu-box .fabu-con .sub-fi").hide();
            if(t.hasClass('house')){
              $(".kefu-box .fabu-con .sub-fi").show();
            }
        }else{
            t.removeClass("curr");
            $(".kefu-box .fabu-con .sub-fi:eq("+index+")").hide();
        }
    });

    $(".btn-close").click(function(){
        $('.fabu-con').css('display','none');
    })

    // 返回顶部
    $(".goTop").click(function() {
      $("html,body").animate({scrollTop:0}, 500);
    });


})
