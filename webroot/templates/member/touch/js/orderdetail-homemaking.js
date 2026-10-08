


$(function () {


    $('.wrap_content li').click(function () {
      $(this).toggleClass('active').siblings().removeClass('active')
      if($(this).hasClass("active") ){
          var price_typ=$(this).text();
          console.log(price_typ)
          if(price_typ==langData['siteConfig'][45][32]){//线下收费
            $('.wrap_content3').hide();
            $('.wrap_content2 p').text(langData['siteConfig'][45][32]);//线下收费
            $('.demo_tip').text(langData['siteConfig'][45][33]);//请务必确保顾客当面结清所有费用
            $('.baomu_manage_footer p').text(langData['siteConfig'][45][34]);//确认已线下收款

          }
        }


    });


//修改时间
$('.time_choose').on('click', function () {

        //数字为正整数，0表示当天可取
        pickuptime.init(0, function (data) {
          console.log(data)
          $(".choose_txt").text(data);

        });
    });


});