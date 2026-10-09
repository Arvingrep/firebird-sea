$(function(){

   // 导航栏置顶
    var Ggoffset = $('.tutor_tab').offset().top - 50;
    $(window).bind("scroll",function(){
        var d = $(document).scrollTop();
        if(Ggoffset < d){
                $('.tutor_tab').addClass('fixed');
        }else{
            $('.tutor_tab').removeClass('fixed');
        }
    });
    //家教详情切换
    var isClick = 0;
    //左侧导航点击
    $(".tutor_tab a").bind("click", function(){

        isClick = 1; //关闭滚动监听
        var t = $(this), parent = t.parent(), index = parent.index(), theadTop = $(".tutor_con:eq("+index+")").offset().top - 100;
        parent.addClass("active").siblings("li").removeClass("active");
        $('html, body').animate({
            scrollTop: theadTop
        }, 300, function(){
            isClick = 0; //开启滚动监听
        });
    });
    //滚动监听
    $(window).scroll(function() {
        if(isClick) return false;
        var scroH = $(this).scrollTop();
        console.log(scroH)
        var theadLength = $(".tutor_con").length;
        $(".tutor_tab li").removeClass("active");

        $(".tutor_con").each(function(index, element) {
            var offsetTop = $(this).offset().top;
            if (index != theadLength - 1) {
                var offsetNextTop = $(".tutor_con:eq(" + (index + 1) + ")").offset().top - 80;
                if (scroH < offsetNextTop) {
                    $(".tutor_tab li:eq(" + index + ")").addClass("active");
                    return false;
                }
            } else {
                $(".tutor_tab li:last").addClass("active");
                return false;
            }
        });
    });
    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
    $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li data-cn="'+list[i].name+'" data-code="'+list[i].code+'">'+list[i].name+' +'+list[i].code+'</li>');
                   }
                   $('.areaCode_wrap ul').append(phoneList.join(''));
                }else{
                   $('.areaCode_wrap ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                        $('.areaCode_wrap ul').html('<div class="loading">加载失败！</div>');
                    }

        })
  }
  //显示区号
  $('.areaCode').bind('click', function(){

    var areaWrap =$(this).closest(".order_container").find('.areaCode_wrap');
    if(areaWrap.is(':visible')){
      areaWrap.fadeOut(300)
    }else{
      areaWrap.fadeIn(300);
      return false;
    }
  });

  //选择区号
  $('.areaCode_wrap').delegate('li', 'click', function(){
    var t = $(this), code = t.attr('data-code');
    var par = t.closest(".order_container");
    var areaIcode = par.find(".areaCode");
    areaIcode.find('i').html('+' + code);
    $('#areaCode').val(code);
  });

  $('body').bind('click', function(){
    $('.areaCode_wrap').fadeOut(300);
  });




})