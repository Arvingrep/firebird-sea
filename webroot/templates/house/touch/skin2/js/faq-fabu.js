$(function(){
  //国际手机号获取
    getNationalPhone();
    function getNationalPhone(){
        $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
            type: 'get',
            dataType: 'jsonp',
            success: function(data){
                if(data && data.state == 100){
                   var phoneList = [], list = data.info;
                   for(var i=0; i<list.length; i++){
                        phoneList.push('<li><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                   }
                   $('.layer_list ul').append(phoneList.join(''));
                }else{
                   $('.layer_list ul').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                        $('.layer_list ul').html('<div class="loading">加载失败！</div>');
                    }

        })
    }
    // 打开手机号地区弹出层
    $(".areacode_span").click(function(){
        $('.layer_code').show();
        $('.mask-code').addClass('show');
    })
    // 选中区域
    $('.layer_list').delegate('li','click',function(){
        var t = $(this), txt = t.find('em').text();
        console.log(txt)
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code, #popupReg-captcha-mobile').hide();
        $('.mask-code').removeClass('show');
    })
  $("#submit").click(function(){
    $("#tj").submit();
  })
  $("#tj").submit(function(event){
    event.preventDefault();
    var t = $("#submit");
    if(t.hasClass("disabled")) return;
    t.addClass("disabled");
    var body = $("#body").val(), people = $("#people").val(), phone = $("#phone").val(), areaCode = $("#areaCode").val();
    var data = [];
    data.push("body="+encodeURIComponent(body));
    data.push("people="+encodeURIComponent(people));
    data.push("phone="+encodeURIComponent(phone));
    data.push("areaCode="+encodeURIComponent(areaCode));

    $.ajax({
      url: "/include/ajax.php?service=house&action=fabuFaq&"+data.join("&"),
      type: "POST",
      dataType: "json",
      success: function (data) {
        if(data.state == 100){
            alert('提交成功！');
            if(device.indexOf('huoniao') > -1) {
                setupWebViewJavascriptBridge(function (bridge) {
                    bridge.callHandler("pageRefresh", {}, function (responseData) {
                    });
                });
            }else {
                location.href = backUrl;
            }
        }else{
          t.removeClass("disabled");
          alert(data.info);
        }
      },
      error: function(){
        t.removeClass("disabled");
        alert('网络错误，提交失败！');
      }
    });

  })

})