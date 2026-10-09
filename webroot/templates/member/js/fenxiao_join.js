
$(function(){
    if(tj_state == 1){
      setTimeout(function(){
        location.href = fenxiaoUrl;
      }, 1000)
    }
    //合伙人权益样式
    var liHeight = []
    $('.paGoods li').each(function(){
        liHeight.push($(this).height());
    })
    var endH = Math.max.apply(null, liHeight);
    $('.paGoods li').css('height',endH)



    //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: "/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'JSONP',
            success: function(data){
                if(data && data.state == 100){
                    var phoneList = [], list = data.info;
                    var listLen = list.length;
                    var codeArea = list[0].code;
                    if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areChoose').hide();
                        return false;
                    }
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
    $('.areChoose').bind('click', function(e){
        e.stopPropagation();
        var areaWrap =$(this).find('.areaCode_wrap');
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
        var par = t.closest("dd");
        var areaIcode = par.find(".areCs");
        areaIcode.html(code);
        $('#areaCode').val(code);
    });

    $('body').bind('click', function(){
        $('.areaCode_wrap,.levelList').fadeOut(300);
    });
    //选择等级
    $('.chooseLevel').click(function(){
        var levelWrap =$(this).find('.levelList');
        if(levelWrap.is(':visible')){
            $(this).removeClass('active');
            levelWrap.fadeOut(300)
        }else{
          $(this).addClass('active');
          levelWrap.fadeIn(300);
          return false;
        }
    })



    $('.levelList').delegate('li','click',function(){
        var t = $(this), id = t.attr('data-id'),txt = t.text();
        t.addClass('achose').siblings('li').removeClass('achose');
        $("#levelname").val(txt);
        $("#level").val(id);
        var tPrice = t.attr('data-price');
        $('.botPrice .priceAll strong').text(tPrice);
        $('.botPrice .fakeD p').text(txt);//费用
    })

    var dataGeetest = "";
    var ftype = "phone";

    //发送验证码
    function sendPhoneVerCode(captchaVerifyParam,callback){
        var btn = $('.test_btn button');
        if(btn.filter(":visible").hasClass("disabled")) return;

        var vericode = "";
        // var vericode = $("#vdimgck").val();  //图形验证码
        // if(vericode == '' && !geetest){
        //   alert(langData['siteConfig'][20][170]);
        //   return false;
        // }

        var number = $('#contact').val();
        if (number == '') {
          alert(langData['siteConfig'][20][27]);
          return false;
        }

       if(isNaN(number)){
          alert(langData['siteConfig'][20][179]);
          return false;
        }else{
          ftype = "phone";
        }

        btn.addClass("disabled");

        if(ftype == "phone"){
          var action = "getPhoneVerify";
          var dataName = "phone";
          let param = "vericode="+vericode+"&areaCode="+$('#areaCode').val()+"&phone="+number
          if(captchaVerifyParam && geetest == 2){
            param = param + '&geetest_challenge=' + captchaVerifyParam
          }else if(geetest == 1 && captchaVerifyParam){
            param = param +  captchaVerifyParam
          }
          $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=verify",
            data: param,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
              if(callback){
                callback(data)
              }
              //获取成功
              if(data && data.state == 100){
                // alert(langData['siteConfig'][38][101]);//验证码已发送
                
                countDown(60, $('.getCodes'));
                //获取失败
              }else{
                btn.removeClass("disabled");
                if(data.info != '图形验证错误，请重试！'){
                  alert(data.info);
                }
              }
            },
            error: function(){
              btn.removeClass("disabled");
              alert(langData['siteConfig'][20][173]);
            }
          });
        }
    }

    //倒计时
    function countDown(time, obj){
        obj.html(time+(langData['siteConfig'][44][1].replace('1',''))).addClass('disabled');
        mtimer = setInterval(function(){
            obj.html((--time)+(langData['siteConfig'][44][1].replace('1',''))).addClass('disabled');//1秒后重发
            if(time <= 0) {
                clearInterval(mtimer);
                obj.html(langData['siteConfig'][6][55]).removeClass('disabled');//重新发送
            }
        }, 1000);
    }

    if(!geetest){
        $('.test_btn button').click(function(){
          if(!$(this).hasClass("disabled")){
            sendPhoneVerCode();
          }
        });
    }else{
        //极验验证
      
    captchaVerifyFun.initCaptcha('web','#codeButton',sendPhoneVerCode)
    //获取验证码
    $('.test_btn button').click(function(){
      if($(this).hasClass("disabled")) return;
      var number   = $('#contact').val();
      if (number == '') {
        alert(langData['siteConfig'][20][27]);
        return false;
      } else {
        if(isNaN(number)){
          alert(langData['siteConfig'][20][179]);
          return false;
        }else{
          ftype = "phone";
        }

          //弹出验证码
				if (geetest == 1) {
					captchaVerifyFun.config.captchaObjReg.verify();
				} else {
					$('#codeButton').click()
				}

      }
    });

}
    $('.sub_btn').click(function(){
      var form = $("#fabuForm"), action = form.attr("action"), url = form.attr("data-url"), tj = true;
      var t = $(this)
          ,phone = $('#contact').val()  //手机号
          ,vercode = $('#vercode').val()  //验证码
          ,cityname = $('#addr').val()  //分站
          ,level = $('#level').val()  //合伙人等级
          ;
      if(t.hasClass('disabled')) return;
      if(cityname == ''){
        showMsg(langData['siteConfig'][54][45]);//请选择分站
        return false;
      }
      if(level == '' && identify){
        showMsg(langData['siteConfig'][54][46]);//请选择合伙人等级
        return false;
      }
      if(phone == ''){
        showMsg(langData['siteConfig'][20][239]);
        return false;
      }
      if(vercode == '' && fenxiaoJoinCheckPhone == 0){
        showMsg(langData['siteConfig'][20][176]);
        return false;
      }
      t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

      $.ajax({
        url: action,
        type: 'post',
        data: form.serialize(),
        dataType: 'json',
        success: function(res){
            t.removeClass("disabled").html(langData['siteConfig'][54][44]);
          if(res && res.state == 100){
              if (typeof (res.info) == 'object') {
                  info = res.info;
                  cutDown = setInterval(function () {
                      $(".payCutDown").html(payCutDown(info.timeout));
                  }, 1000)

                  var datainfo = [];
                  for (var k in info) {
                      datainfo.push(k + '=' + info[k]);
                  }
                  $("#amout").text(info.order_amount);
                  $('.payMask').show();
                  $('.payPop').show();


                  if (totalBalance * 1 < info.order_amount * 1) {
                      $("#moneyinfo").text('余额不足，');
                      $(".pay_balance").addClass('disabled_pay');
                  }else{
                      $("#moneyinfo").text('可用');
                      $(".pay_balance").addClass('disabled_pay');
                  }

                  if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                      $("#bonusinfo").text('额度不足，可用');
                      $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
                  }else if( bonus * 1 < info.order_amount * 1){
                      $("#bonusinfo").text('余额不足，可用');
                      $("#bonusinfo").closest('.pay_item').addClass('disabled_pay')
                  }else{
                      $("#bonusinfo").text('可用');
                      $("#bonusinfo").closest('.pay_item').removeClass('disabled_pay')
                  }

                  ordernum = info.ordernum;
                  order_amount = info.order_amount;

                  $("#ordertype").val('fenxiaoJoinPay');
                  $('#pordertype').val('fenxiaoJoinPay');
                  $("#service").val('member');
                  service = 'member';
                  var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
                  $('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));
              }else {
                  if(res.info.indexOf('http') > -1){
                      location.href = res.info;
                  }else{
                      location.reload();
                  }
              }
              }else{
                showMsg(res.info);
                t.removeClass("disabled").html(langData['siteConfig'][54][44]);
              }
            },
        error: function(){
          showMsg(langData['siteConfig'][20][183]);
          t.removeClass("disabled").html(langData['siteConfig'][54][44]);
        }
      })
    })

    // 错误提示
    function showMsg(str){
        var o = $(".error");
        o.html('<p>'+str+'</p>').show();
        setTimeout(function(){o.hide()},1000);
    }





})
