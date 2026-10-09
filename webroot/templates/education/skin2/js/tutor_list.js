$(function(){

    //显示二维码
    $('.list_ul li .t_bg').hover(function () {
        $(this).parents('li').find('.code_bg').show();
    },function () {
        $(this).parents('li').find('.code_bg').hide();
    });
    $('.list_left .list_ul li:nth-child(2n)').css('margin-right','0')
    //广告轮播
    $(".adv_r #slideBox").slide({mainCell:".bd ul",effect:"left",easing:"easeOutCirc",delayTime:600,
        autoPlay:true,autoPage:'<li></li>', titCell: '.hd ul'});
    //排序切换
    $('.sort ul li').click(function(){
        $(this).addClass('curr').siblings().removeClass('curr')
    })
    //hover可预约
    $('.list_left .list_ul li').hover(function () {
        $(this).find('.leftLi').addClass('active');
        $(this).find('.rightLi').addClass('curr');

    },function () {
        $(this).removeClass('active')
        $(this).find('.leftLi').removeClass('active');
        $(this).find('.rightLi').removeClass('curr');
    });

    $('.order a').click(function(){
        var f = $(this);
        var tutorid = f.attr('data-id');
        $('.tutorid').val(tutorid)
        if(f.hasClass("disabled")) return false;
        $('.order_mask').show();
        //区号重置
        var codeOld = $('.areaCode_wrap li:first-child').data('code');
        $('.areaCode i').text('+'+codeOld);
        $('#areaCode').val(codeOld);
        return false;
    })
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