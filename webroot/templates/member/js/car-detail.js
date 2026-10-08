/**
 * Created by Administrator on 2018/5/18.
 */
$(function(){
        $('.appMapBtn').attr('href', OpenMap_URL);
    // 导航栏置顶
    var Ggoffset = $('.car_tab').offset().top - 150;
        
   var r=$('.command').offset().top; 
   var p1 = $(".command").height();
   var tp1=r + p1;

   var h=$(window).height();
          
    $(window).bind("scroll",function(){
        var d = $(document).scrollTop();   
        var th =d + h;
        if(Ggoffset < d){
            $('.car_tab').addClass('fixed');
        }else{
            $('.car_tab').removeClass('fixed');
            $('.car_tab').removeClass('sticky');
        }

        if((tp1 +500) > d && (r+500) <th){//滚动到相关推荐时  
        console.log(222)          
            $('.car_tab').removeClass('fixed').addClass('sticky');
        }
       

     
    });
    //家教详情切换
    var isClick = 0;
    //左侧导航点击
    $(".car_tab a").bind("click", function(){

        isClick = 1; //关闭滚动监听
        var t = $(this), parent = t.parent(), index = parent.index(), theadTop = $(".car_con:eq("+index+")").offset().top - 260;
        parent.addClass("active").siblings("li").removeClass("active");
        $('html, body').animate({
            scrollTop: theadTop
        }, 500, function(){
            isClick = 0; //开启滚动监听
        });
    });
    //滚动监听
    $(window).scroll(function() {
        var scroH = $(this).scrollTop();
        var thh =scroH + h;
       
        if(scroH > 263 ){ //273为$('.info_right').offset().top;
        
            $('.info_right').addClass('fixed').removeClass('sticky')
        }else{

               $('.info_right').removeClass('fixed') 
               $('.info_right').removeClass('sticky')

            
        }
        if(tp1 > scroH && r <thh){
            $('.info_right').removeClass('fixed').addClass('sticky');
        }


        if(isClick) return false;//点击切换时关闭滚动监听
        
        var theadLength = $(".car_con").length;
        $(".car_tab li").removeClass("active");

        $(".car_con").each(function(index, element) {
            var offsetTop = $(this).offset().top;
            if (index != theadLength - 1) {
                var offsetNextTop = $(".car_con:eq(" + (index + 1) + ")").offset().top - 280;
                if (scroH < offsetNextTop) {
                    $(".car_tab li:eq(" + index + ")").addClass("active");
                    return false;
                }
            } else {
                $(".car_tab li:last").addClass("active");
                return false;
            }
        });

        
    });
        //收藏
    $(".store-btn").bind("click", function(){
        var t = $(this), type = "add", oper = "+1", txt = langData['siteConfig'][44][0];//已收藏

        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        if(!t.hasClass("curr")){
            t.addClass("curr");
        }else{
            type = "del";
            t.removeClass("curr");
            oper = "-1";
            txt = langData['siteConfig'][19][240];//收藏
        }

        var $i = $("<b>").text(oper);
        var x = t.offset().left, y = t.offset().top;
        $i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
        $("body").append($i);
        $i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
            $i.remove();
        });

        t.children('button').html("<em></em><span>"+txt+"</span>");

        $.post("/include/ajax.php?service=member&action=collect&module=car&temp=detail&type="+type+"&id="+id);
    });





})
