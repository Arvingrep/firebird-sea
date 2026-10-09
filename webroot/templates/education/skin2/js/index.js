$(function () {    
    //头部轮播
    $(".slider .bd li").first().before($(".slider .bd li").last());
    $(".slider").hover(function() {
        $(this).find(".arrow").stop(true, true).fadeIn(300)
    },
    function() {
        $(this).find(".arrow").fadeOut(300)
    });
    $(".slider").slide({
        titCell: ".hd ul",
        mainCell: ".bd ul",
        effect: "leftLoop",
        autoPlay: true,
        vis: 3,
        autoPage: '<li><a></a></li>',
        trigger: "click"
    });


    $(".classList .slideBox2").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:"<li></li>",effect:"leftLoop",autoPlay:true,vis:4,scroll:4});
    $(".orgList .slideBox3").slide({titCell:".hd ul",mainCell:".bd ul",autoPage:"<li></li>",effect:"leftLoop",autoPlay:true,vis:4,scroll:4});



    //显示二维码
    $('.bd .t_bg,.lang_con .t_bg').hover(function () {
        $(this).parents('a').find('.code_bg').css('display','block');
    },function () {
        $(this).parents('a').find('.code_bg').hide();
    });
    //hover可预约
    $('.tutor_list ul li').hover(function () {
        $(this).find('.tutor_info').addClass('active');
        $(this).find('.right_in').addClass('curr');
        $(this).find('.info_det').addClass('active');
    },function () {
        $(this).removeClass('active')
        $(this).find('.tutor_info').removeClass('active');
        $(this).find('.right_in').removeClass('curr');
        $(this).find('.info_det').removeClass('active');
    });

    //预约弹窗弹出
    $(".tutor_list .order").bind("click", function(){
        var f = $(this);
        var tutorid = f.attr('data-id');
        $('.tutorid').val(tutorid)
        if(f.hasClass("disabled")) return false;
        $('.order_mask').show();
        return false;
     })
    

    //广告轮播
    $(".fir_l_top #slideBox").slide({mainCell:".bd ul",effect:"left",easing:"easeOutCirc",delayTime:600,
        autoPlay:true,
        autoPage:'<li></li>', titCell: '.hd ul'});
    //发布留言样式
    $('.word_info ul li:nth-child(2n)').css('float','right');

    $('.word_ul .word_li').hover(function () {
       $(this).addClass('curr').siblings().removeClass('curr');
    });

    $('.lang_con ul li:nth-child(4n)').css('margin-right','0');

    //都在关注
    $(".part_thr .foucebox2").slide({
        mainCell: ".bd ul",
        effect: "fold",
        autoPlay: true,
        delayTime: 300,
        triggerTime: 50,
        startFun: function(i) {
            $(".foucebox2 .hoverBg").animate({
                    "margin-top": 126 * i
                },
                150);
        }
    });

    //控制标题的字数 学校名最多8字
    $('.tutor_edu .school').each(function(index, el) {
        var num = $(this).attr('data-num');
        var text = $(this).text();
        var len = text.length;
        if(len > num){
            $(this).html(text.substring(0,num));
        }
    });

    //点击显示联系方式
    $(".user_contact a").click(function(){
        $(this).find('.cont-num').show()
        
        $(this).find('.cont').hide();
    })


    $(".isearch").click(function(){
        var url = $("#myform").attr('action');
        location.href = url + '?keywords=' + $(".searchkey").val();
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

});