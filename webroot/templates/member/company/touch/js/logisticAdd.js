$(function(){

  //下拉菜单
  $('.demo-test-select').scroller(
    $.extend({preset: 'select'})
  );

  // 展开收起
  $(".PackageList").delegate(".PackageBox_arrow","click",function(){
      var x = $(this),
          box = x.closest('.PackageBox').find('.PackageBox_List');
          height = box.height();
      if (x.hasClass('rog')) {
          box.show();
          x.removeClass('rog');
      }else{
          box.hide();
          x.addClass('rog')
      }
  })

  $(".bearFreight span").bind("click", function(){
    var val = $(this).data("id");
    $(this).addClass('curr').siblings('span').removeClass('curr');
    if(val == 1){
      $("#freight").hide();
    }else{
      $("#freight").show();
    }
    $(this).siblings('input').val(val);
  });

  $(".valuation span").bind("click", function(){
    var val = $(this).data("id"), i = $("#freight i");
    $(this).addClass('curr').siblings('span').removeClass('curr');
    if(val == 0){
      i.html("件");
    }else if(val == 1){
      i.html("kg");
    }else if(val == 2){
      i.html("m³");
    }
    $(this).siblings('input').val(val);
  });

  //提交发布
  $(".Package_ADD").click(function(event){
    event.preventDefault();

    var t = $(this), form = $('#fabuForm'), id = form.closest('.PackageBox').attr('data-id');
    if(t.hasClass("disabled")) return;

    var cityid = form.find('.cityid').val();
    var offsetTop = 0;

    //验证城市
    // if(cityid == "" || cityid == 0){
    //   showErr(langData['siteConfig'][20][585], 1000);
    //   return;
    // }

    var action = form.attr("action"), data = form.serialize();
    console.log(data)
    t.addClass("disabled").html(langData['siteConfig'][6][35]+"...");

    $.ajax({
      url: action,
      data: data,
      type: "get",
      dataType: "jsonp",
      success: function (data) {
        if(data && data.state == 100){
          var tip = langData['siteConfig'][20][312];
          if(id != undefined && id != "" && id != 0){
            tip = langData['siteConfig'][20][229];
          }
          showErr(tip, 1000, function(){
            location.href = manageUrl;
          })
        }else{
          showErr(data.info, 1000);
          t.removeClass("disabled").html(langData['shop'][1][7]);
        }
      },
      error: function(){
        showErr(langData['siteConfig'][20][183]);
        t.removeClass("disabled").html(langData['shop'][1][7]);
      }
    });

  });

  $('#fabuForm').submit(function(e){
    e.preventDefault();
    $(".Package_ADD").click();
  })
  
  //错误提示
  var showErrTimer;
  function showErr(txt, time, callback){
      showErrTimer && clearTimeout(showErrTimer);
      $(".popErr").remove();
      if(txt == '' || txt == undefined) return;
      $("body").append('<div class="popErr"><p>'+txt+'</p></div>');
      $(".popErr p").css({"margin-left": -$(".popErr p").width()/2, "left": "50%"});
      $(".popErr").css({"visibility": "visible"});
      if(time){
        showErrTimer = setTimeout(function(){
            $(".popErr").fadeOut(300, function(){
                $(this).remove();
                callback && callback();
            });
        }, time);
      }
  }

})