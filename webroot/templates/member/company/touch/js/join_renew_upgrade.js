$(function(){

  var audio;
  audio = new Audio();
  audio.src = audioSrc.tap;
  // 发布切换
  $(".tabHead ul li a").bind('click', function(){
    audio.play();
    $(this).parent().addClass("active").siblings().removeClass("active");
    var i=$(this).parent().index();
    $('.tabContent').eq(i).addClass("showMain").siblings().removeClass("showMain");

  });
  $(".tabHead ul li a").parent().eq(0).addClass('active')
  // 发布信息
  $(".tabContent .tableft ul li").bind('click', function(){
    audio.play();
    $(this).addClass("curr").siblings().removeClass("curr");
    var i=$(this).index();
    $('.tabright .tabBox').eq(i).addClass("show").siblings().removeClass("show");
  });

  $(".closeBox i").click(function(event) {
      parent.btnFbClose();
  });


// ----------------------------------------

  $(".m-ruzhu .modal-main ul li").on('click',function(){
        $(this).addClass('curr').siblings().removeClass('curr');
   });
  // 关闭表单申请成功的提示弹框
  $('.btnSuc').click(function(){
  	 setTimeout(function(){
      $('.sucBox').remove();
    }, 1000)

  })

  // 点击支付 关闭价格窗口
  $(".btn-pay").click(function(){
    var cost = $(".modal-main ul.active li.curr").index();
    $("#cost").val(cost);
    $('html').removeClass('nos');
    $('.m-ruzhu').removeClass('curr');
    submitForm();
  })

  function submitForm(){

    var form = $("#shopForm"), action = form.attr("action"), btn = form.find(".btnSubmit");
    btn.addClass("disabled").attr("disabled", true).val(langData['siteConfig'][6][35]+"...");

    //异步提交
    $.ajax({
      url: action+'&'+form.serialize(),
      type: "get",
      dataType: "jsonp",
      success: function (data) {
        console.log(data)
        if(data && data.state == 100){
          var price = $('.m-ruzhu ul.active li.curr').attr("data-price");
          if(price > 0){
              if(device.indexOf('huoniao_Android') > -1) {
                  setupWebViewJavascriptBridge(function (bridge) {
                      bridge.callHandler('pageClose', {}, function (responseData) {
                      });
                  });
                  top.location.href = data.info;
              }else{
                  top.location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
              }
          }else{
            $(".m-ruzhu .close").click();
            $(".sucBox").removeClass("tipBox-hide");
            setTimeout(function(){
                if(device.indexOf('huoniao_Android') > -1) {
                    setupWebViewJavascriptBridge(function (bridge) {
                        bridge.callHandler('pageClose', {}, function (responseData) {
                        });
                    });
                    top.location.href = data.info;
                }else{
                    top.location.href = data.info + (data.info.indexOf('?') > -1 ? '&' : '?') + 'currentPageOpen=1';
                }
            }, 2000)
          }
        }else{
          showMsg(data.info);
          btn.removeClass("disabled").removeAttr("disabled").val(langData['siteConfig'][6][118]);
        }
      },
      error: function(){
        showMsg(langData['siteConfig'][20][183]);
        btn.removeClass("disabled").removeAttr("disabled").val(langData['siteConfig'][6][118]);
      }
    });
  }

  $('.submit').click(function(){
    var priceCon = $(".price_"+type);
    if(priceCon.length){
      priceCon.addClass("active").siblings("ul").removeClass("active");
      // 企业入驻信息弹框
      $.smartScroll($('.modal-public'), '.modal-main');
      $('html').addClass('nos');
      $('.m-ruzhu').addClass('curr');
    }else{
      submitForm();
    }
  })

    // 消息提示
  function showMsg(msg, time){
    var time = time ? time : 2000;
    $('.errBox').removeClass('tipBox-hide');
    var html='<div class="tipBox errBox">';
    html += '<div class="erleft"><i></i></div>';
    html += '<div class="erright">';
    html += '<h5>'+langData['siteConfig'][44][93]+'</h5>';//发生了错误
    html += '<p>'+msg+'</p>';
    html += '<i class="btn-close"><img src="'+templets+'images/tclose.png" alt=""></i>';
    html += '</div>';
    html += '</div>';
    $('body').append(html);
    setTimeout(function(){
      $('.errBox').addClass('tipBox-hide').removeClass('errBox');
    }, time)
    $('.btn-close').click(function(){
      $('.tipBox').hide();
    })
  }

// ------------------------------

	// 基础信息弹框
  $(".baseIcon").on("click",function(){
    var t = $(this), p = t.closest(".tabConBox"), tit = p.find(".tit").text(), note = p.find(".note").text().replace(/\n/g, '<br>');
    $.smartScroll($('.modal-public'), '.modal-main');
    $('html').addClass('nos');
    $('.m-baseInfo .tit').text(tit);
    $('.m-baseInfo .main').html(note);
    $('.m-baseInfo').addClass('curr');
  });

  // 电话弹框
  $(".ctTel").on("click",function(){
    $.smartScroll($('.modal-public'), '.modal-main');
    $('html').addClass('nos');
    $('.m-telphone').addClass('curr');
  });
  // qq弹框
  $(".ctQq").on("click",function(){
    $.smartScroll($('.modal-public'), '.modal-main');
    $('html').addClass('nos');
    $('.m-qq').addClass('curr');
  });
  // 微信弹框
  $(".ctWx").on("click",function(){
    $.smartScroll($('.modal-public'), '.modal-main');
    $('html').addClass('nos');
    $('.m-wx').addClass('curr');
  });
  // 关闭
  $(".modal-public .modal-main .close,.bClose").on("touchend",function(){
    $("html, .modal-public").removeClass('curr nos');
    return false;
  })
  $(".bgCover").on("touchend",function(){
    $("html, .modal-public").removeClass('curr nos');
    return false;
  })

})
