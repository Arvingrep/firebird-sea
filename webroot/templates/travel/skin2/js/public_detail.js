$(function(){

    //查看店铺电话
    $('.go_call').delegate('a','click',function(){
        var h3 = $(this).find('h3');
        var realCall = h3.attr('data-call');
        var hideP = $(this).find('p').hide()
        h3.text(realCall);
        h3.animate({"paddingTop":'8px'},200);
   })

    // 导航栏置顶
    var Ggoffset = $('.det_tab').offset().top - 150;
        
   var h=$(window).height();
          
    $(window).bind("scroll",function(){
        var d = $(document).scrollTop();   
        if(Ggoffset < d){
            $('.det_tab').addClass('fixed');
        }else{
            $('.det_tab').removeClass('fixed');

        }
     
    });
    //详情切换
    var isClick = 0;
    //左侧导航点击
    $(".det_tab li").bind("click", function(){

        isClick = 1; //关闭滚动监听
        var t = $(this), index = t.index(), theadTop = $(".agency_con:eq("+index+")").offset().top - 230;
        t.addClass("active").siblings("li").removeClass("active");
        $('html, body').animate({
            scrollTop: theadTop
        }, 500, function(){
            isClick = 0; //开启滚动监听
        });
    });
    //滚动监听
    $(window).scroll(function() {
        var scroH = $(this).scrollTop();

      
        if(isClick) return false;//点击切换时关闭滚动监听
        
        var theadLength = $(".agency_con").length;
        $(".det_tab li").removeClass("active");

        $(".agency_con").each(function(index, element) {
            var offsetTop = $(this).offset().top;
            if (index != theadLength - 1) {
                var offsetNextTop = $(".agency_con:eq(" + (index + 1) + ")").offset().top - 230;
                if (scroH < offsetNextTop) {
                    $(".det_tab li:eq(" + index + ")").addClass("active");
                    return false;
                }
            } else {
                $(".det_tab li:last").addClass("active");
                return false;
            }
        });

        
    });




})
