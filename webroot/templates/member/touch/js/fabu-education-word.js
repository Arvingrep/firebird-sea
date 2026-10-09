$(function () {
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
                        $('.areacode_span').closest('' +
                            'li').hide();
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

    $("#class_times").blur(function(){
      if($(this).val().length > 0 ){
        $(".class-p label").css("color","#45464f");
      }
    });

    $("#word_price").blur(function(){
      if($(this).val().length > 0 ){

        $(".class-p2 label").css("color","#45464f");
      }
    });

    //身份要求
    function getType(){
      $.ajax({
          type: "POST",
          url: masterDomain + "/include/ajax.php?service=education&action=educationitem&type=1&value=1",
          dataType: "jsonp",
          success: function(res){
              if(res.state==100 && res.info){
                  var eduSelect = new MobileSelect({
                      trigger: '.word_edu',
                      title: '',
                      wheels: [
                          {data:res.info}
                      ],
                      position:[0, 0],
                      callback:function(indexArr, data){
                          $('#word_edu').val(data[0]['value']);
                          $('#educations').val(data[0]['id']);
                          $('.word_edu .choose span').hide();
                      }
                      ,triggerDisplayData:false,
                  });
              }
          }
      });

    }

    getType();

    //性别要求  不限 男 女
    var numArr =[{'id':2,"value":langData['education'][3][17]},{'id':1,"value":langData['education'][6][16]},{'id':0,"value":langData['education'][6][17]}];//自定义数据
    var huxinSelect = new MobileSelect({
        trigger: '.word_sex ',
        title: '',
        wheels: [
            {data: numArr}
            
        ],
        position:[0, 0],
        callback:function(indexArr, data){
            $('#word_sex').val(data[0]['value']);
            $('#sex').val(data[0]['id']);
            $('.word_sex .choose span').hide();
        }
        ,triggerDisplayData:false,
    });

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
    $('#btn-fabu').click(function (e) {
        e.preventDefault();

        var t = $("#fabuForm"), action = t.attr("action"), url = t.attr("data-url"), r = true;
        var addrid = 0, cityid = 0;

        var word_title = $('#word_title').val();//留言标题
        var word_object = $('#word_object').val();//求教科目
        var addrid = $('#addrid').val();//所在区域
        var word_edu = $('#word_edu').val();//身份要求
        var word_sex = $('#word_sex').val();//性别要求
        var word_price = $('#word_price').val();//预期费用
        var contact = $('#contact').val();//手机号
        if(!word_title){
          r = false;
          showMsg(langData['education'][6][18]);//请填写留言标题
          return;
        }else if(!word_object){
          r = false;
          showMsg(langData['education'][6][19]); //请填写求教科目
          return;
        }else if(!word_edu){
          r = false;
          showMsg(langData['education'][6][21]); //请选择身份要求
          return;
        }else if(!word_price){
          r = false;
          showMsg(langData['education'][6][23]); //请填写预期费用
          return;  
        }else if(!contact){
          r = false;
          showMsg(langData['education'][6][24]); //请输入手机号
          return;
        }else if (isPhoneNo($.trim($('#contact').val())) == false) {
          r = false;
          showMsg(langData['education'][6][25]); //请输入正确的手机号
          return;
        }

        var ids = $('.gz-addr-seladdr').attr("data-ids");
        if(ids != undefined && ids != ''){
              addrid = $('.gz-addr-seladdr').attr("data-id");
              ids = ids.split(' ');
              cityid = ids[0];
        }else{
              r = false;
              showMsg(langData['education'][6][20]);  //请填写所在区域
              return;
        }
        $('#addrid').val(addrid);
        $('#cityid').val(cityid);

        if(!r){
          return;
        }

        $("#btn-keep").addClass("disabled").html(langData['siteConfig'][6][35]+"...");	//提交中

        $.ajax({
            url: action,
            data: t.serialize(),
            type: 'post',
            dataType: 'json',
            success: function(data){
              console.log(data)
                if(data && data.state == 100){
                  var tip = langData['siteConfig'][20][341];
                  if(id != undefined && id != "" && id != 0){
                      tip = langData['siteConfig'][20][229];
                  }
                  if(data.info.check == 0){
                    alert(langData['siteConfig'][44][69]);//请等待管理员审核您的信息,如果需要加急处理请联系网站客服!
                    location.href = url;

                  }else{
                    location.href = url;

                  }
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