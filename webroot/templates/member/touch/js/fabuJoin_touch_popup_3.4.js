$(function(){

    //原生APP后退回来刷新页面
    pageBack = function(data) {
        setupWebViewJavascriptBridge(function(bridge) {
            bridge.callHandler("pageRefresh", {}, function(responseData){});
        });
    }

    //定时查询当前会员是否已经入驻成功
    // setTimeout(function(){
    //     var timer = setInterval(function(){
    //         var userid = $.cookie(cookiePre+"login_user");
    //         if(userid && $('#rzshop').size() > 0) {
    //             $.ajax({
    //                 url: masterDomain+'/getUserInfo.html',
    //                 type: "GET",
    //                 async: false,
    //                 dataType: "jsonp",
    //                 success: function (data) {
    //                     if(data && data.userType == 2){
    //                         clearTimeout(timer);
    //                         if(device.indexOf('huoniao') > -1){
    //                             typeof pageBack == "function" && pageBack(data);
    //                         }else{
    //                             location.reload();
    //                         }
    //                     }
    //                     if(!data){
    //                       clearTimeout(timer);
    //                     }
    //                 },
    //                 error: function(){
    //                   clearTimeout(timer);
    //                 }
    //             });
    //         }
    //     }, 2000);
    // }, 10000)

    //APP端取消下拉刷新
    toggleDragRefresh('off');

  if(self == top && device.indexOf('huoniao') > -1){
    $('.closeBox').hide();
  }
  var joinTypeSelect = null;

    //客户端发帖
    // setupWebViewJavascriptBridge(function(bridge) {
    //     $(".postTieba").bind("click", function(event){
    //         if (device.indexOf('huoniao_Android') > -1) {
    //             event.preventDefault();
    //             var userid = $.cookie(cookiePre+"login_user");
    //             if(userid == null || userid == ""){
    //                 location.href = masterDomain + "/login.html";
    //                 return false;
    //             }
    //             bridge.callHandler("postTieba", {}, function(responseData) {});
    //         }
    //     });
    // });


  firstLoad();
  window.addEventListener('hashchange', function () {
    firstLoad();
  })

  function firstLoad(type){
    if(location.hash == '#join' || type == 'join'){
      if($('.tabHead li').length == 1){
        $('.tabHead').hide();
      }
      $(".tabContent").eq(1).addClass('showMain').siblings().removeClass('showMain');
      $('.tabHead li').eq(1).addClass("active").siblings().removeClass("active");
    }else{
      $(".tabContent").eq(0).addClass('showMain').siblings().removeClass('showMain');
      $('.tabHead li').eq(0).addClass("active").siblings().removeClass("active");
    }
  }



    $('#shopManage').bind('change', function() {
        $("#typeid").val($(this).val());
        checkForm($("#shopForm"));
    });


  var audio;
    audio = new Audio();
    audio.src = audioSrc.tap;
	 // 发布切换
    $(".tabHead ul li a").bind('tap', function(){
          audio.play();
          $(this).parent().addClass("active").siblings().removeClass("active");
          var i=$(this).parent().index();
          $('.tabContent').eq(i).addClass("showMain").siblings().removeClass("showMain");
          if(i == 1){
              firstLoad('join');
          }
    });
	 // 发布信息
    $(".tabContent .tableft ul li").bind('tap', function(){
          audio.play();
          $(this).addClass("curr").siblings().removeClass("curr");
          var i=$(this).index();
          $('.tabright .tabBox').eq(i).addClass("show").siblings().removeClass("show");

    });

      $(".closeBox i").bind('click', function(event) {
        if (self != top) {
            //处理跨域问题
            if(parentDomain.indexOf(masterDomain) < 0){
                $('body').append('<iframe style="display: none;" scrolling="no" src="'+parentDomain+'include/iframe.html?action=btnFbClose&v='+~(-new Date())+'"></iframe>');
            }

            window.parent.postMessage(['btnFbClose'], masterDomain);
            parent.btnFbClose();

        }else{
          if(window.history.length == 1){
            if(window.wx){
              wx.miniProgram.navigateBack({
                delta:1
              });
              setTimeout(() => {
                wx.miniProgram.reLaunch({
                  url:'/pages/index/index',
                })
              },500)
            }else if(window.isBytemini){
              tt.miniProgram.navigateBack({delta:1});
              setTimeout(() => {
                tt.miniProgram.reLaunch({
                  url:'/pages/index/index',
                })
              },500)
            }
            return;
          }
          if(document.referrer === ''){
            window.location.href = masterDomain;
          }else{
            window.history.go(-1);
          }
        }
      });
    // 打开手机号地区弹出层
	  $(".tabArea").bind('tap', function(){
	    var t = $(this), top = t.offset().top + t.height();
	    $('.layer').css('top',top).show();
	    $('.mask-code').addClass('show');
	  })
	  // 选中区域
	  $('.layer').delegate('li', 'click', function(){
	    var t = $(this), txt = t.find('em').text();
      $(".areaCodeLab").text(txt);
	    $("#areaCode").val(txt.replace("+",""));

	    $('.layer').hide();
	    $('.mask-code').removeClass('show');

	    checkForm($("#shopForm"));
	  })

	  // 关闭弹出层
	  $('.layer_close, .mask-code').bind('tap', function(){
	    $('.layer, #popupReg-captcha-mobile').hide();
	    $('.mask-code').removeClass('show');
	  });

    $('#shopForm #tel').bind({
      focus:function(){
          if (this.value == this.defaultValue){
             this.value="";
          }
          $('#shopForm .inpClose').css('opacity','1');
      },
      keypress:function(){
          if (this.value == this.defaultValue){
          this.value="";
          }
          $('#shopForm .inpClose').css('opacity','1');
        },
        blur:function(){
          if (this.value == ""){
          this.value = this.defaultValue;
          }
          $('#shopForm .inpClose').css('opacity','0');
        }
      });

	  // 手机号码清空
	  $("#shopForm .inpClose").bind('click', function(){
	  	  var inptel = $('input[name="telphone"]').val();
	  		if(inptel!=''){
	  			$('input[name="telphone"]').val('');
	  		}
        $('#shopForm .inpClose').css('opacity','0');
	  });



// ----------------------------------------
	var type = 0, rtype = 0;
  // 入驻店铺 手机号验证
  $('#shopForm input').on('input propertychange', function(e){
    var t = $(this), form = t.closest("form");
    var r = checkForm(form);
    var yzm = $('.btnYzm');
    if(r.telphone){
      yzm.removeClass("disabled").addClass("default");
      // yzm.addClass('disabled').text(langData['siteConfig'][7][6]);

      // $.ajax({
      //   url: masterDomain+'/include/ajax.php?service=member&action=joinBusinessCheck&account='+account,
      //   dataType: 'jsonp',
      //   success: function(data){
      //     yzm.text(langData['siteConfig'][4][1]);
      //     if(data && data.state == 100){
      //       yzm.removeClass("disabled").addClass("default");
      //     }else{
      //       showMsg(data.info);
      //       yzm.removeClass("default").addClass("disabled");
      //     }
      //   },
      //   error: function(){
      //     yzm.removeClass("disabled").addClass("default").text(langData['siteConfig'][4][1]);
      //     showMsg(langData['siteConfig'][20][173], 1500, false)
      //   }
      // })

    }
  }).trigger('propertychange');


  $('#shopForm .agree').change(function(){
    checkForm($(this).closest("form"));
  })

  function checkForm(form){
    var r = true;
    var res = {telphone:0};
    form.find('input').each(function(){
      var t = $(this);
      if(t.hasClass("inp")){
        if(t.val() == ''){
          r = false;
          return;
        }
      }else if(t.hasClass("agree")){
        if(!t.is(":checked")){
          r = false;
        }
      }
    })

    var telphone = form.find(".telphone");
    var val = telphone.val();
    var yzm = form.find(".btnYzm");
    // 手机号
    if(telphone.attr("id") == "tel"){
      var area = $("#areaCode").val();
      if(val != ''){
        if(area == "86"){
          var phoneReg = /(^1\d{10}$)|(^09\d{8}$)/;
          if(!phoneReg.test(val)){
            r = false;
            yzm.removeClass("default").addClass("disabled");
          }else{
            res.telphone = 1;
            // yzm.removeClass("disabled").addClass("default");
          }
        }else{
          res.telphone = 1;
          yzm.removeClass("disabled").addClass("default");
        }
      }else{
        r = false;
        yzm.removeClass("default").addClass("disabled");
      }

    }
    if($("#typeid").val() == 0){
      r = false;
    }

    if(r){
      form.find('.btnSubmit').removeClass('disabled');
    }else{
      form.find('.btnSubmit').addClass('disabled');
    }

    return res;
  }

  // 去掉手机号前的0, 86下验证合法性和是否可注册
  $('.telphone').keyup(function(){
    var t = $(this), _tel = t.val();
    _tel = _tel.replace(/\b(0+)/gi,"");
    t.val(_tel);
  })

  var dataGeetest = "";



  //发送验证码
  function sendVerCode(){
    var form = $("#shopForm");
    var btn = form.find('.btnYzm'), v = form.find(".telphone").val(), areaCode = $("#areaCode").val();

    if(btn.hasClass("disabled") || btn.hasClass("not")) return;


    // var action = type == 3 ? "getEmailVerify" : "getPhoneVerify";
    // var dataName = type == 3 ? "email" : "phone";
 	// console.log(dataName)
    var r = checkForm(form);
    if(!r.telphone){
      showMsg(langData['siteConfig'][20][239] );//请输入手机号
      return false;
    }else{

        btn.addClass("not").text(langData['siteConfig'][44][91]);//已发送
        $.ajax({
          url: "/include/ajax.php?service=siteConfig&action=getPhoneVerify",
          data: "type=join&phone="+v+'&areaCode='+areaCode+dataGeetest,
          type: "GET",
          dataType: "jsonp",
          success: function (data) {
            $("#maskReg, #popupReg-captcha-mobile").removeClass("show");

            //获取成功
            if(data && data.state == 100){
              countDown(30, form.find(".btnYzm"));
            //获取失败
            }else{
              btn.removeClass("not").text(langData['siteConfig'][4][1]);
              showMsg(data.info);
            }
          },
          error: function(){
            btn.removeClass("not").text(langData['siteConfig'][4][1]);
            showMsg(langData['siteConfig'][20][173]);
          }
        });
    }
  }


  if(!geetest){
    $('#shopForm').delegate('.default', 'tap', function(){
      var t = $(this);
      if(t.hasClass("disabled") || t.hasClass("not")) return;
      sendVerCode();
    });
  }

  $(".m-ruzhu .modal-main ul li").on('tap',function(){
        $(this).addClass('curr').siblings().removeClass('curr');
   });
  // 关闭表单申请成功的提示弹框
  $('.btnSuc').click(function(){
  	 setTimeout(function(){
      $('.sucBox').remove();
    }, 1000)

  })
  $("#shopForm").submit(function(e){
    e.preventDefault();

    var form = $(this), btn = form.find(".btnSubmit"), telphone = form.find(".telphone").val();

    var tj = true;
  	if($('.cname').val() == ''){
  		showMsg(langData['siteConfig'][44][92]);//联系人不能为空！
  		return false;
  	}
  	if($('#shopManage').val() == ''){
  		showMsg(langData['siteConfig'][30][40]);//请选择经营类目
  		return false;
  	}

    if(!tj) return false;

    var f = $('input[name=type]:checked').val();
    $("#type").val(f);
    var priceCon = $(".price_"+f);
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
        if(data && data.state == 100){
          var price = $('.m-ruzhu ul.active li.curr').attr("data-price");
          if(price > 0){
            top.location.href = data.info;
          }else{
            $(".m-ruzhu .close").click();
            $(".sucBox").removeClass("tipBox-hide");
            setTimeout(function(){
              top.location.href = data.info;
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

  //倒计时（开始时间、结束时间、显示容器）
  var times = null;
  var countDown = function(time, obj, func){
    times = obj;
    obj.addClass("not").text(time+'s');
    mtimer = setInterval(function(){
      obj.text((--time)+'s');
      if(time <= 0) {
        clearInterval(mtimer);
        obj.removeClass('not').text(langData['siteConfig'][4][2]);
      }
    }, 1000);
  }




// ------------------------------

	  // 服务协议弹框
      // $(".agreeBox a").on("click",function(){
      //     $.smartScroll($('.modal-public'), '.modal-main');
      //     $('html').addClass('nos');
      //     $('.m-server').addClass('curr');
      // });

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



        //客户端登录验证
        if (device.indexOf('huoniao') > -1) {
            setupWebViewJavascriptBridge(function(bridge) {
                //未登录状态下，隔时验证是否已登录，如果已登录，则刷新页面
                var userid = $.cookie("HN_login_user");
                if(userid == null || userid == ""){
                    var timer = setInterval(function(){
                        userid = $.cookie("HN_login_user");
                        if(userid){
                            $.ajax({
                                url: '/getUserInfo.html',
                                type: "get",
                                async: false,
                                dataType: "jsonp",
                                success: function (data) {
                                    if(data){
                                        clearInterval(timer);
                                        bridge.callHandler('appLoginFinish', {'passport': data.userid, 'username': data.username, 'nickname': data.nickname, 'userid_encode': data.userid_encode, 'cookiePre': data.cookiePre, 'photo': data.photo, 'dating_uid': data.dating_uid}, function(){});
                                        bridge.callHandler('pageReload', {}, function(responseData){});
                                    }
                                }
                            });

                            // location.reload();
                        }
                    }, 500);
                }else if($('.nlogin').size() > 0){
                    location.reload();
                }
            })
        }

})
