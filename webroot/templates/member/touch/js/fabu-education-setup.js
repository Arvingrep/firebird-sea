$(function () {

  $("#price").blur(function(){
      if($(this).val().length > 0 ){

        $(".class-p label").css("color","#45464f");
      }
    });


    //选择课程类型
    $('.class_type span').click(function () {
      $(this).toggleClass('active').siblings().removeClass('active');
      if($(this).attr('data-id')==0){
        $('.class_origin1').show();
        $('.class_origin2').hide();
      }else{

        $('.class_origin1').hide();
        $('.class_origin2').show();
      }
      $("#typeid").val($(this).attr('data-id'));
    })

    //选择授课时间
    $('.info li  table td').click(function () {
      $(this).toggleClass('on');
      var td_text= $(this).text();
      if($(this).hasClass('on')){
        $(this).find('span').hide();
        $(this).append('<img src="'+templatePath+'images/education/book.png" alt="" class="td_img">')
      }else{
        $(this).find('span').show();
        $(this).find('.td_img').hide();
      }
      
    })
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
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areacode_span').closest('li').hide();
                        return false;
                   }
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
        $(".areacode_span label").text(txt);
        $("#areaCode").val(txt.replace("+",""));

        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 关闭弹出层
    $('.layer_close, .mask-code').click(function(){
        $('.layer_code').hide();
        $('.mask-code').removeClass('show');
    })

    // 信息提示框
    // 错误提示
    function showMsg(str){
      var o = $(".error");
      o.html('<p>'+str+'</p>').show();
      setTimeout(function(){o.hide()},1000);
    }

    //表单验证
    function isPhoneNo(p) {
        var areaCode = parseInt($("#areaCode").val());
        if(areaCode == 86){
            var pattern = /^1[23456789]\d{9}$/;
            return pattern.test(p);
        }
        return true;
    }
    $('#btn-keep').click(function (e) {
        e.preventDefault();

        var t = $("#fabuForm"), action = t.attr('action');
        var addrid = 0, cityid = 0, r = true;

        var price = $('#price').val();//价格
        var addrid = $('#addrid').val();//授课区域
        var class_address = $('#class_address').val();//授课地址
        var contact = $('#contact').val();//手机号
        var phone_confirm = $('#phone_confirm').val();//验证码

        if(!price){
          r = false;
          showMsg(langData['education'][6][26]); //请填写价格
          return;
        }else if(!$('.class_type span').hasClass('active')){
          r = false;
          showMsg(langData['education'][6][27]); //请选择授课方式
          return;
        }else if(($('.class_type .type2').hasClass('active')) && !class_address ){
          r = false;
          showMsg(langData['education'][6][29]);  //请填写授课地址
          return;
        }else if(!$('.info li  table td').hasClass('on')){
          r = false;
          showMsg(langData['education'][6][30]); //请选择授课时间
          return;
        }else if(!contact){
          r = false;
          showMsg(langData['education'][6][24]); //请输入手机号
          return;
        }
        // else if (isPhoneNo($.trim($('#contact').val())) == false) {
        //   r = false;
        //   showMsg(langData['education'][6][25]);  //请输入正确的手机号
        //   return;
        // }
        else if($('.test_code').css('display')=='block' && $("#phone_confirm").val() == ''){
          r = false;
          showMsg(langData['education'][6][31]); //请填写验证码
          return;
        }

        var data = '';
        $("table td").each(function(){
          if($(this).hasClass('on')){
            var name = $(this).children('span').attr('data-name'), id = $(this).children('span').attr('data-id');
            if(name!='' && id !=''){
              data += name + "=" + id + "&";
            }
          }
        });
        if(data!=''){
          data = data.substring(0, data.length-1);
        }

       if(($('.class_type .type1').hasClass('active')) && !addrid ){
          var ids = $('.gz-addr-seladdr').attr("data-ids");
          if(ids != undefined && ids != ''){
                addrid = $('.gz-addr-seladdr').attr("data-id");
                ids = ids.split(' ');
                cityid = ids[0];
          }else{
                r = false;
                showMsg(langData['homemaking'][5][19]);  //请选择所在地
                return;
          }
          $('#areaaddrid').val(addrid);
          $('#areacityid').val(cityid);
        }

        if(!r){
          return;
        }

        $("#btn-keep").addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中

        $.ajax({
            url: action,
            data: t.serialize() + "&" + data,
            type: 'post',
            dataType: 'json',
            success: function(data){
                if(data && data.state == 100){
                    var tip = langData['siteConfig'][20][341];
                    if(id != undefined && id != "" && id != 0){
                        tip = langData['siteConfig'][20][229];
                    }
                    $("#btn-keep").removeClass("disabled").html(langData['education'][5][33]);		//立即发布
                    showMsg(tip);
                }else{
                  showMsg(data.info);
                  $("#btn-keep").removeClass("disabled").html(langData['education'][5][33]);		//立即发布
                }
            },
            error: function(){
              showMsg(langData['education'][5][33]);
            }
        })





    });
});