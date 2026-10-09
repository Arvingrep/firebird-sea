$(function () {

    //手续费
    $('.no_pay li').click(function () {
      $(this).toggleClass('active').siblings().removeClass('active')
      if($(this).hasClass("active") ){
          var price_typ=$(this).attr('data-id');
          if(price_typ==1){
            $('.need_pay').show();
            $('.wrap_content2').show();
            $('.demo_tip').show();
          }else if(price_typ==0){
            $('.need_pay').hide();
            $('.wrap_content2').hide();
            $('.demo_tip').hide();
            
          }
        }


    });

    $('.need_pay li').click(function () {
      $(this).toggleClass('active').siblings().removeClass('active')
      if($(this).hasClass("active") ){
          var price_typ=$(this).attr('data-id');
          if(price_typ==1){           
            $('.wrap_content2 p').text(langData['homemaking'][7][5]);     //线下收费
            $('.demo_tip').text(langData['homemaking'][7][11]);     //请务必确保顾客当面结清所有费用
            $('.baomu_manage_footer p').text(langData['homemaking'][7][10]);      //确认已线下收款

          }else if(price_typ==0){           
            $('.wrap_content2 p').text(langData['homemaking'][7][4]);     //线上收费
            $('.demo_tip').text(langData['homemaking'][7][9]);      //提交后请确保顾客当面结清所有费用
            $('.baomu_manage_footer p').text(langData['homemaking'][7][0]);     //确认服务费用

          }
        }


    });

    $(".baomu_manage_footer p").click(function(e){
      e.preventDefault();
      var type = $(".no_pay .active").attr('data-id'), online = $(".need_pay .active").attr('data-id'), price = $("#price").val(), servicedesc = $("#demo").val();

      if(type==1){
        if(price<0 || price==''){
          alert(langData['homemaking'][9][87]);
          return;
        }
      }

      var data =[], t = $(this);
      data.push('id='+id);
      data.push('servicetype='+type);
      data.push('guarantee='+$("#guarantee").val());
      data.push('online='+online);
      data.push('price='+price);
      data.push('servicedesc='+servicedesc);

      t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

      $.ajax({
        url: '/include/ajax.php?service=homemaking&action=addservice',
        data: data.join("&"),
        type: "POST",
        dataType: "json",
        success: function (data) {
          if(data && data.state == 100){

            if(device.indexOf('huoniao') > -1) {
                setupWebViewJavascriptBridge(function (bridge) {
                    bridge.callHandler("goBack", {}, function (responseData) {
                    });
                });
            }else if(typeof(wx_miniprogram) != undefined && wx_miniprogram){
        		wx.miniProgram.navigateBack()
            }else if(typeof(isBytemini) && isBytemini){
				tt.miniProgram.navigateBack()
            }else{
                history.go(-1);
            }
            
          }else{
            alert(data.info);
            t.removeClass("disabled").html(langData['siteConfig'][11][19]);
          }
        },
        error: function(){
          t.removeClass("disabled").html(langData['siteConfig'][11][19]);
        }
      });

    });



});