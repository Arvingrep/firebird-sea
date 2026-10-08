


$(function () {


    $('.wrap_content li').click(function () {
      $(this).toggleClass('active').siblings().removeClass('active')
      if($(this).hasClass("active") ){
          var price_typ=$(this).text();
          console.log(price_typ)
          if(price_typ=="线下收费"){
            $('.wrap_content3').hide();
            $('.wrap_content2 p').text('线下收费');
            $('.demo_tip').text('请务必确保顾客当面结清所有费用');
            $('.baomu_manage_footer p').text('确认已线下收款');

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

    $('#sure').click(function(){
      var orderid = id;
      var businessbz = $("#businessbz").val();

      $.ajax({
        url : '/include/ajax.php?service=homemaking&action=operOrder&oper=businessbz',
        data : {orderid:id,businessbz:businessbz},
        type : 'post',
        datatype : 'json',
        success : function(result){
          var data = JSON.parse(result);
           if (data.state==100) {
            alert(data.info);
            window.location.reload()

           }else{

            alert(data.info);

           }
        },
        error : function(){

          alert(langData['siteConfig'][6][203]);

        }
      });

    })





});