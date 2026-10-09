$(function(){

    $('img').scrollLoading();
    
    // 判断浏览器是否是ie8
     if($.browser.msie && parseInt($.browser.version) >= 8){
        $('.ulbox li:last-child').css('margin-right','0');
        $('.sub-category dl:last-child').css('padding-bottom','0');
        $('.conbox ul li:last-child').css('margin-bottom','0');
        $('.category-popup li:last-child .fix').css('border-bottom','0');
        $('.esfbox .midbox ul li:nth-child(3n),.agent_content .agent_main:last-child,.agency_main ul li:nth-child(3n)').css('margin-right','0');
        $('.esfbox .midbox ul li:nth-child(4),.esfbox .midbox ul li:nth-child(5),.esfbox .midbox ul li:nth-child(6)').css('margin-bottom','0');
     }

    /* 左侧导航 */
    $(".category-popup").hover(function(){
        $(this).find("li").show();
        $(this).addClass("category-hover");
        $(this).find(".more").hide();
    }, function(){
        $(this).removeClass("category-hover");
        $(this).find("li").each(function(){
            var index = $(this).index();
            if(index > 3 ){
                $(this).hide();
            }
        });
        $(this).find(".more").show();
    });

    $(".category-popup li").hover(function(){
        var t = $(this);
        t.siblings("li").removeClass("active");
        t.siblings("li").find(".sub-category").hide();

        if(!t.hasClass("active")){
            t.addClass("active");

            setTimeout(function(){
                if(t.find(".subitem").html() == undefined){
                    // var dlh = $(".category-popup").height(), ddh = dlh - 55, ocount = parseInt(ddh/32), aCount = t.find("dd a").length;
                    // t.find("dd").css("height", ddh+"px");
                    // t.find(".sub-category").css({"width": Math.ceil(aCount/ocount) * 120 + "px"});
                    // t.find("dd a").each(function(i){ t.find("dd a").slice(i*ocount,i*ocount+ocount).wrapAll("<div class='subitem'>");});
                }
            }, 1);
            var rcon = t.find('.databyleft');
            if(rcon.length && rcon.html() == ""){
                var addr = t.find('.datalist').html().replace(/fn-hide/g, '');
                rcon.html(addr);
            }
            t.find(".sub-category").show();
        }
    }, function(){
        $(this).removeClass("active");
        $(this).find(".sub-category").hide();
    });

    //焦点图
    $(".slideBox1").cycle({pager: '#slidebtn',pause: true});
    $('.slidebtn a').html('');
    
    //文字向上滚动
    $(".txtMarquee-top").slide({mainCell:".bd ul",autoPlay:true,effect:"topMarquee",vis:3,interTime:50});

    // 房产资讯内容切换
    var slidebox2 = [],slidebox3 = [];
    $('.fcNews').delegate('.ftab_nav li', 'click', function(event) {
        var t = $(this),i = t.index();
        if(!t.hasClass('active')){
            t.addClass('active').siblings('li').removeClass('active');
            $('.ftab_con').eq(i).addClass('fcshow').siblings().removeClass('fcshow');
        }
        if(!slidebox2[i]){
            console.log(!slidebox2[i])
            slidebox2[i] = $('.slideBox2:eq('+i+')').slide({titCell:".hd ul",mainCell:".bd",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});
        }
        if(!slidebox3[i]){
          slidebox3[i] = $('.slideBox3:eq('+i+')').slide({titCell:".hd ul",mainCell:".bd",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});
        }
    });
    $('.slideBox2').each(function(index){
      var t = $(this), ul = t.find('.bd ul');
      var swiperNav = [], mainNavLi = ul.find('li');
      for (var i = 0; i < mainNavLi.length; i++) {
        swiperNav.push(ul.find('li:eq('+i+')').html());
      }
      var liArr = [];
      for(var i = 0; i < swiperNav.length; i++){
        liArr.push(swiperNav.slice(i, i+1).join(""));
      }

      ul.html('<li>'+liArr.join('</li><li>')+'</li>');
      if(index == 0){
        slidebox2[index] = t.slide({titCell:".hd ul",mainCell:".bd",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});
      }

    });

    $('.slideBox3').each(function(index){
      var t = $(this), ul = t.find('.bd ul');
      var swiperNav = [], mainNavLi = ul.find('li');
      for (var i = 0; i < mainNavLi.length; i++) {
        swiperNav.push(ul.find('li:eq('+i+')').html());
      }
      var liArr = [];
      for(var i = 0; i < swiperNav.length; i++){
        liArr.push(swiperNav.slice(i, i + 1).join(""));
      }
      ul.html('<li>'+liArr.join('</li><li>')+'</li>');

      if(index == 0){
        slidebox3[index] = t.slide({titCell:".hd ul",mainCell:".bd",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>",prevCell:".prev",nextCell:".next"});
      }
    });
  
    //报名组团看房下拉菜单
    $('#selectTypeMenu').hover(function(){
        $(this).show();
        $(".searchArrow").addClass("searchArrowRote");
    }, function(){
        $(this).hide();
        $(".searchArrow").removeClass("searchArrowRote");
    });

    $("#selectTypeText").hover(function () {
        $(this).next("span").slideDown(200);
        $(".searchArrow").addClass("searchArrowRote");
    }, function(){
        $(this).next("span").hide();
        $(".searchArrow").removeClass("searchArrowRote");
    });
    
    $("#selectTypeMenu>a").click(function () {
        $("#selectTypeText").text($(this).text());
        $("#selectTypeRel").attr("value", $(this).attr("rel"));
        $(this).parent().hide();
        $(".searchArrow").removeClass("searchArrowRote");
    });

  
    // 我要报名
    $('.conbox').delegate('.btn_bm', 'click', function() {
        var t = $(this),id = t.closest('li').attr('data-id');
        $(".baoming").addClass("popup").fadeIn().attr('data-id',id);
        $(".popup_bg").show();

        $(".baoming.popup dl .checkbox").removeClass("checked");
        $(".baoming.popup .cbm").addClass("checked");
        return false;
    });
    
    $("body").delegate(".close", "click", function(){
        $(this).parent().hide();
        $("#verifycode").click();
        $(".popup_bg").hide();
    });

    //修复订阅浮动层IE下不兼容placeholder
    $("body").delegate(".popup input", "click", function(){
        var t = $(this), val = t.val(), placeholder = t.attr("placeholder");
        if(val == placeholder){
            t.val("").removeClass("placeholder");
        }
    });
    $("body").delegate(".popup input", "blur", function(){
        var t = $(this), val = t.val(), placeholder = t.attr("placeholder");
        if(val == ""){
            t.val(placeholder).addClass("placeholder");
        }
    });

    //复选框
    $("body").delegate(".dc dl", "click", function(){
        var t = $(this).find(".checkbox");
        t.hasClass("checked") ? t.removeClass("checked") : t.addClass("checked");
    });

    $("body").delegate(".checkbox", "click", function(){
        var t = $(this);
        t.hasClass("checked") ? t.removeClass("checked") : t.addClass("checked");
    });

    // 单选框
    var sexval='';
    $("body").delegate(".sexbox input[type='radio']", "click", function(){
        var t = $(this);
        if(this.checked){
            sexval= t.val();
        }
    });

    //更新验证码
    var verifycode = $("#verifycode").attr("src");
    $("body").delegate("#verifycode", "click", function(){
        $(this).attr("src", verifycode+"?v="+Math.random());
    });

    //验证提示弹出层
    function showMsg(msg){
      $('.baoming .dc').append('<p class="ptip">'+msg+'</p>')     
      setTimeout(function(){   
        $('.ptip').remove();
      },2000);
    }


    //提交订阅信息
    $("body").delegate("#tj", "click", function(){
        var data = [],type =[],t = $(this), obj = t.closest(".baoming"), btnhtml = t.html();

        if(t.hasClass("disabled")) return false;

        obj.find("dl").each(function(){
            var checkbox = $(this).find(".checkbox");
            if(checkbox.hasClass("checked")){
                type.push(checkbox.attr('data-val'));
            }
        });

        if(type.length == 0){
            errMsg = "请选择要订阅的信息类型";
            showMsg(errMsg);
            return false;
        }

        var name = obj.find("#name");
        var phone = obj.find("#phone");
        var vercode = obj.find("#vercode");
        var xy = obj.find(".xy");


        if(name.val() == "" || name.val() == name.attr("placeholder")){
            errMsg = "请输入您的姓名";
            showMsg(errMsg);
            return false;
        }else if(phone.val() == "" || phone.val() == phone.attr("placeholder")){
            errMsg = "请输入您的手机号码";
            showMsg(errMsg);
            return false;
        }else if(!/(13|14|15|17|18)[0-9]{9}/.test($.trim(phone.val()))){
            errMsg = "手机号码格式错误，请重新输入！";
            showMsg(errMsg);
            return false;
        }else if(vercode.val() == "" || vercode.val() == vercode.attr("placeholder")){
            errMsg = "请输入验证码";
            showMsg(errMsg);
            return false;
        }

        if(!xy.hasClass("checked")){
            errMsg = "请先同意[免责协议]";
            showMsg(errMsg);
            return false;
        }
        t.addClass("disabled").html("提交中...");
      
      	var id = obj.attr('data-id');
      	
        data.push("act=loupan");
      	data.push("aid="+id);
        data.push("type="+type.join(","));
        data.push("name="+name.val());
        data.push("phone="+phone.val());
        data.push("vercode="+vercode.val());
        data = data.join("&");

        $.ajax({
          url: masterDomain+"/include/ajax.php?service=house&action=subscribe",
          data: data,
          dataType: "JSONP",
          success: function(data){
            if(data && data.state == 100){
              t.removeClass("disabled").html("订阅成功");
              setTimeout(function(){
                t.closest(".baoming").find(".close").click();
              }, 1000);
            }else{
              t.removeClass("disabled").html(btnhtml);
              showMsg(data.info);
            }
          },
          error: function(){
            t.removeClass("disabled").html(btnhtml);
            showMsg("网络错误，请稍候重试！");
          }
        })


    });
   
    
    //验证提示弹出层
    function showMsg(msg){
      $('.formbox').append('<div class="ptip">'+msg+'</div>')     
      setTimeout(function(){   
        $('.ptip').remove();
      },1000);
    }

    $('body').delegate('.btnSub', 'click', function() {
        var t = $(this), obj = t.closest("#bmForm");
        var loupan = obj.find("#selectTypeText"),
            phone = obj.find(".tel-text"),
            vcode = obj.find("#number"),
            nickname = obj.find('.nickname'),
            areaCode = $("#areaCode").val().replace('+', ''),
            r = true;

        if(t.hasClass("disabled")) return false;

        if (loupan.text() == "" || loupan.text() == "请选择意向楼盘") {
            r = false;
            showMsg('请选择意向楼盘');
            return false;
        }else if (nickname.val() == "") {
            r = false;
            nickname.focus();
            nickname.attr('placeholder', '请输入您的姓名');
        } else if (phone.val() == "") {
            r = false;
            phone.focus();
            phone.attr('placeholder', '请输入手机号码');
        }else if(!$.trim(phone.val()).match(/^1[2345789](\d){9}$/) && areaCode == "86"){
            r = false;
            phone.val('');
            phone.focus();
            phone.attr('placeholder', '手机号码格式错误，请重新输入！');
        }else if(vcode.val() == ""){
            r = false;
            vcode.focus();
            vcode.attr('placeholder', '请输入短信验证码');
        }
        if (!r) return;
      
        var data=[];
        var loupan = $("#selectTypeText").text();
        var tel = $.trim($(".tel-text").val());
        var name = $.trim($(".name-text").val());
        var code = $(".form-input .code").find(".number").val();

        t.addClass('disabled');

        $.ajax({
            url: '/include/ajax.php?service=house&action=booking',
            type: 'get',
            data: {
                loupan: loupan,
                name: name,
                mobile: tel,
                // flag: '1',
                code: code,
                areaCode: areaCode,
            },
            dataType: 'jsonp',
            success: function (data) {
                t.removeClass('disabled');
                if (data.state == 100) {
                    showMsg("预约成功！");
                    $('#number').val('');
                    $('#selectTypeText').text('请选择意向楼盘');
                } else {
                    showMsg(data.info);
                }
            }
        })

    });

    var sendSmsData = [];

    if(geetest){
        captchaVerifyFun.initCaptcha('web','#codeButton',sendSmsFunc)
        $('.sendvdimgck').bind("click", function (){
          if($(this).hasClass('disabled')) return false;
          var tel = $(".tel-text").val();
          if(tel == ''){
            errMsg = "请输入手机号码";
            showMsg(errMsg);
            $(".tel-text").focus();
            return false;
          }

          //弹出验证码
          if(geetest == 1){
            captchaVerifyFun.config.captchaObjReg.verify();
          }else{
            $('#codeButton').click()
          }
        })
    }else{
        $(".sendvdimgck").bind("click", function (){
          if($(this).hasClass('disabled')) return false;
          var tel = $(".tel-text").val();
          if(tel == ''){
            errMsg = "请输入手机号码";
            showMsg(errMsg);
            $('.tel-text').focus().attr('placeholder', '请输入手机号码');
            return false;
          }
          $("#number").focus();
          sendSmsFunc();
        })
      }

  //发送验证码
  function sendSmsFunc(captchaVerifyParam,callback){
    var tel = $(".tel-text").val();
    var areaCode = $("#areaCode").val().replace('+', '');
    var sendSmsUrl = "/include/ajax.php?service=siteConfig&action=getPhoneVerify";

    sendSmsData = []; //清空
    sendSmsData.push('type=verify');
    sendSmsData.push('areaCode=' + areaCode);
    sendSmsData.push('phone=' + tel);
    let param = sendSmsData.join('&')
      if(captchaVerifyParam && geetest == 2){
      param = param + '&geetest_challenge=' + captchaVerifyParam
    }else if(geetest == 1 && captchaVerifyParam){
      param = param +  captchaVerifyParam
    }

    $.ajax({
      url: sendSmsUrl,
      data: param,
      type: 'POST',
      dataType: 'json',
      success: function (res) {
        if(callback){
          callback(res)
        }
        if (res.state == 101) {
          showMsg(res.info);
        }else{
          countDown($('.sendvdimgck'), 60);
        }
      }
    })
  }


  //倒计时
  function countDown(obj,time){
    obj.html(time+'s').addClass('disabled');
    mtimer = setInterval(function(){
      obj.html((--time)+'s').addClass('disabled');
      if(time <= 0) {
        clearInterval(mtimer);
        obj.html('重新发送').removeClass('disabled');
      }
    }, 1000);
  }

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
    var par = $(this).closest('.number');
    var areaWrap =par.find('.areaCode_wrap');
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
    var par = t.closest('.number');
    var areaIcode = par.find(".areaCode");
    areaIcode.find('i').html('+' + code);
    $('#areaCode').val(code);
  });

  $('body').bind('click', function(){
    $('.areaCode_wrap').fadeOut(300);
  });

})
