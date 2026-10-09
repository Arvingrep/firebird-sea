$(function(){

	// //左右导航切换(公司介绍 荣誉资质 )
    // //导航内容切换

    $('.profile_tab li').click(function(){
        $(this).addClass('active').siblings().removeClass('active');
        var i = $(this).index();
        $('.tabs_container .pro_content').eq(i).addClass('pro_show').siblings().removeClass('pro_show');
    });

     //放大图片
    $.fn.bigImage({
        artMainCon:".tabs_container",  //图片所在的列表标签
    });
    //获取url中的参数
    // function getUrlParam(name) {
    //   var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    //   var r = window.location.search.substr(1).match(reg);
    //   if ( r != null ){
    //      return decodeURI(r[2]);
    //   }else{
    //      return null;
    //   }
    // }
    // var type = decodeURI(getUrlParam('type'));
    // if(type == 2){
    //     $('.profile_tab li.ry').click();
    // }


  

})