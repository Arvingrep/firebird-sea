$(function(){
    //查看地图
    $('.appMapBtn').attr('href', OpenMap_URL);
    $(".imgBox").slide({mainCell:".bd ul",autoPage:true,effect:"left",autoPlay:true,vis:3,trigger:"click"});
    //查看店铺电话
    $('.go_call').delegate('a','click',function(){
        var h3 = $(this).find('h3');
        var realCall = h3.attr('data-call');
        var hideP = $(this).find('p').fadeOut(300)
        h3.text(realCall);
        h3.animate({"paddingTop":'24px'},300);
    })
    //相册图片放大
    $('.imgBox').viewer({
        url: 'data-original',
    });

    // 左侧置顶
    //获取要定位元素距离浏览器顶部的距离
    var navH = $(".shopbox").offset().top;
    var botH = $(".footer").offset().top-655; 


    //滚动条事件
    $(window).scroll(function(){
        //获取滚动条的滑动距离
        var scroH = $(this).scrollTop();
        //滚动条的滑动距离大于等于定位元素距离浏览器顶部的距离，就固定，反之就不固定
        
        if(scroH>=navH&&scroH<botH){
            $(".shopbox").addClass('fixed');
        }else{
            $(".shopbox").removeClass('fixed');
        }
    })




})
