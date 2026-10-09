$(function(){

  var device = navigator.userAgent;
  if (device.indexOf('huoniao_iOS') > -1) {
  	$('.header').addClass('padTop20');
  }

  // 文本框输入
  $('.inpbox input').focus(function(){
    var t = $(this), inpbox = t.closest('.inpbox');
    inpbox.addClass('focus');
  })
  $('.inpbox input').blur(function(){
    var t = $(this), inpbox = t.closest('.inpbox');
    inpbox.removeClass('focus');
  })

  $('.account_clear').click(function(){
    $('#account').val('');
  })
  // 记住密码
  $('.remember').click(function(){
    var t = $(this);
    if (t.hasClass('checked')) {
      t.removeClass('checked');
    }else {
      t.addClass('checked');
    }
  })
  // 密码可见
  $('.psw-show').click(function(){
    var t = $(this);
    if (t.hasClass('psw-hide')) {
      t.removeClass('psw-hide');
      $('#password').attr('type', 'password');
    }else {
      t.addClass('psw-hide');
      $('#password').attr('type', 'text');
    }
  })

  // 去掉手机号前的0
  $('#account').blur(function(){
    var username3 = $('#account').val();
    $('#account').val(username3.replace(/\b(0+)/gi,""));
  })

  // 登录验证
  $('.submit').click(function(){
    event.preventDefault();

    var t = $(this);
    if(t.hasClass('disabled')){return;};

    var tj = true;

    var account = $('#account').val(),
        password = $('#password').val(),
        vericode = $('.vericode').val();

    if (account == "") {
      $('.error span').html(langData['siteConfig'][20][166]).addClass('show').fadeIn(100);
      setTimeout(function(){$('.error span').fadeOut(100);}, 1300);
      tj = false;
    }else if (password == "") {
      $('.error span').html(langData['siteConfig'][20][165]).fadeIn(100);
      setTimeout(function(){$('.error span').fadeOut(100);}, 1300);
      tj = false;
    }

	  if(!tj){
      return false;
    }

    var data = [];
    data.push("username="+account);
    data.push("password="+password);
    if(vericode != undefined){
      data.push("vericode="+vericode);
    }

    //异步提交
    $.ajax({
      url: masterDomain+"/loginCheck.html",
      data: data.join("&"),
      type: "POST",
      dataType: "html",
      success: function (data) {
        if(data){
          if(data.indexOf("100") > -1){
            $("body").append('<div style="display:none;">'+data+'</div>');

            if(appInfo.device == ""){
              top.location.href = redirectUrl;
            }else{
              setupWebViewJavascriptBridge(function(bridge) {
                $.ajax({
                  url: masterDomain+'/getUserInfo.html',
                  type: "GET",
                  async: false,
                  dataType: "jsonp",
                  success: function (data) {
                    if(data){
                      bridge.callHandler('appLoginFinish', {'passport': data.userid}, function(){});
                      top.location.href = redirectUrl;
                    }else{
                      alert(langData['siteConfig'][20][167]);
                      $('.login-btn input').attr("disabled", false).val(langData['siteConfig'][2][0]);
                    }
                  },
                  error: function(){
                    alert(langData['siteConfig'][20][168]);
                    $('.login-btn input').attr("disabled", false).val(langData['siteConfig'][2][0]);
                    return false;
                  }
                });
              });
            }


          }else{
            var data = data.split("|");
            alert(data[1]);
            $('#verifycode').click();
            t.removeAttr("disabled").val(langData['siteConfig'][2][0]);
          }
        }else{
          alert(langData['siteConfig'][20][167]);
          $('#verifycode').click();
          t.removeAttr("disabled").val(langData['siteConfig'][2][0]);
        }
      },
      error: function(){
        alert(langData['siteConfig'][20][168]);
        $('#verifycode').click();
        t.removeAttr("disabled").val(langData['siteConfig'][2][0]);
      }
    });

  })



  	//客户端登录
    setupWebViewJavascriptBridge(function(bridge) {

  		$(".other_login a").bind("click", function(event){
  			var t = $(this), href = t.attr('href'), type = href.split("type=")[1];
  			event.preventDefault();

  			var action = "";

  			//QQ登录
  			if(type == "qq"){
  				action = "qq";
  			}

  			//微信登录
  			if(type == "wechat"){
  				action = "wechat";
  			}

  			//新浪微博登录
  			if(type == "sina"){
  				action = "sina";
  			}

  			bridge.callHandler(action+"Login", {}, function(responseData) {
  				if(responseData){
  					var data = JSON.parse(responseData);
  					var access_token = data.access_token ? data.access_token : data.accessToken, openid = data.openid, unionid = data.unionid;


  					$('.login-btn input').attr("disabled", true).val(langData['siteConfig'][2][5]+'...');

  					//异步提交
  					$.ajax({
  						url: masterDomain+"/api/login.php",
  						data: "type="+action+"&action=appback&access_token="+access_token+"&openid="+openid+"&unionid="+unionid,
  						type: "GET",
  						dataType: "html",
  						success: function (data) {

  							$.ajax({
  								url: masterDomain+'/getUserInfo.html',
  								type: "get",
  								async: false,
  								dataType: "jsonp",
  								success: function (data) {
  									if(data){
  										bridge.callHandler('appLoginFinish', {'passport': data.userid}, function(){});
  										top.location.href = redirectUrl;
  									}else{
  										alert(langData['siteConfig'][20][167]);
  										$('.login-btn input').attr("disabled", false).val(langData['siteConfig'][2][0]);
  									}
  								},
  								error: function(){
  									top.location.href = '/bindMobile.html?type='+action;
  									return false;
  								}
  							});

  						},
  						error: function(){
  							alert(langData['siteConfig'][20][168]);
  							$('.login-btn input').attr("disabled", false).val(langData['siteConfig'][2][0]);
  						}
  					});
  				}
  			});
  		});
    });


      //微信登录验证
  	$(".wechat").click(function(event){
  		if(!navigator.userAgent.toLowerCase().match(/micromessenger/) && navigator.userAgent.toLowerCase().match(/iphone|android/) && appInfo.device == ""){
  			event.preventDefault();
  			alert(langData['siteConfig'][20][169]);
  		}
  	});


})
