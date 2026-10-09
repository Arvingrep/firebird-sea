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
                    var a = ''
                      if(i == 0){a = 'active'}
                      phoneList.push('<li class="'+a+'"><span>'+list[i].name+'</span><em class="fn-right">+'+list[i].code+'</em></li>');
                      
                   }
                   $('.dropdown-menu ul.dropdown-list').append(phoneList.join(''));
                }else{
                   $('.dropdown-menu ul.dropdown-list').html('<div class="loading">暂无数据！</div>');
                  }
            },
            error: function(){
                    $('.dropdown-menu ul.dropdown-list').html('<div class="loading">加载失败！</div>');
                }

        })
  }

  $('.inpbox dd input').bind('input propertychange', function(){
    var t = $(this);
    if (t.val() != "") {
      $(this).siblings('.error').hide();
    }
  })

  // 国际版手机
  $('.dropdown-menu').click(function(){
    var list = $('.dropdown-list');
    if (list.css('display') == 'none') {
      list.show();
    }else {
      list.hide();
    }
    return false;
  })

  $('.dropdown-list').delegate('li','click',function(){
    var t = $(this), val = t.find('em').text();
    t.addClass('active').siblings('li').removeClass('active');
    $('.dropdown-menu label').text(val);
  })

  $('body').click(function(){
    $('.dropdown-list').hide();
  })


  var geetestData = "";
  function sendVerCode(captchaVerifyParam,callback){
    let t = $(".verify")
    t.addClass('disabled').html(langData['siteConfig'][7][10]+'...');   //发送中
    let param =  "areaCode="+$('.droptab').find('label').html().replace("+", "")+"&phone="+$('#phone').val()
    if(captchaVerifyParam && geetest == 2){
      param = param + '&geetest_challenge=' + captchaVerifyParam
    }else if(geetest == 1 && captchaVerifyParam){
      param = param +  captchaVerifyParam
    }
    $.ajax({
      url: masterDomain+"/include/ajax.php?service=siteConfig&action=getPhoneVerify&type=join",
      data: param,
      type: "POST",
      dataType: "jsonp",
      success: function (data) {
        if(callback){
          callback(data)
        }
        //获取成功
        if(data && data.state == 100){
          t.addClass('disabled').html(langData['siteConfig'][6][55]+'(<em class="count">60</em>s)')  //重新发送
          count = t.find('.count');
          countDown(60, count, t);

        //获取失败
        }else{
          t.removeClass("disabled").html(langData['siteConfig'][4][4]);  //获取短信验证码
          if(data.info != '图形验证错误，请重试！'){
            alert(data.info);
          }
        }
      }
    });
  }


  if(geetest){
    captchaVerifyFun.initCaptcha('web','#codeButton',sendVerCode)
		$('.verify').click(function(){
      var t = $(this), phone = $('#phone');
      if (t.hasClass('disabled')) {
        return false;
      }
      if (phone.val() == "") {
        phone.siblings('.error').show();
      }else {
        //弹出验证码
				if (geetest == 1) {
					captchaVerifyFun.config.captchaObjReg.verify();
				} else {
					$('#codeButton').click()
				}
      }
    })

	}else{
    // 发送验证码
    $('.verify').click(function(){
      var t = $(this), phone = $('#phone');
      if (t.hasClass('disabled')) {
        return false;
      }
      if (phone.val() == "") {
        phone.siblings('.error').show();
      }else {
        sendVerCode();
      }
    })
  }


  // 倒计时（开始时间，显示容器）
  function countDown(time, obj, con){
    var mtimer = setInterval(function(){
      obj.text((--time));
      if (time <= 0) {
        clearInterval(mtimer);
        con.text(langData['siteConfig'][4][1]).removeClass('disabled');
      }
    }, 1000)
  }

  // 下一步
  $('.next-btn').click(function(){
    $('#addrid').val($('.addrBtn').attr('data-id'));
    var t = $(this), id = t.attr('data-id'), step = t.attr('data-step'), index = t.attr('data-index'),
        width = (20 * index)+'%';
    var name = $('#name'),
        areaCode = $('.droptab').find('label').html().replace("+", ""),
        phone = $('#phone'),
        yzm = $('#yzm'),
        email = $('#email'),
        cardnum = $('#cardnum'),
        company = $('#company'),
        licensenum = $('#licensenum'),
        addrid = $('#addrid'),
        address = $('#address'),
        cardfront = $('#certfy-front'),
        cardbehind = $('#certfy-back'),
        license = $('#zhizhao'),
        accounts = $('#xuke'),
        jingying = $('#shangbiao'),
        typeid = $('#typeid'),
        logo = $('#logo');

    var offsetTop = 0;

    if(t.hasClass("disabled")) return false;

    if (name.val() == "") {
      name.siblings('.error').show();
      offsetTop = offsetTop == 0 ? name.offset().top : offsetTop;
    }
    if (phone.val() == "") {
      phone.siblings('.error').show();
      offsetTop = offsetTop == 0 ? phone.offset().top : offsetTop;
    }
    if (yzm.val() == "") {
      yzm.siblings('.error').show();
      offsetTop = offsetTop == 0 ? yzm.offset().top : offsetTop;
    }
    if (email.val() == "") {
      email.siblings('.error').text(langData['siteConfig'][20][497]).show();
      offsetTop = offsetTop == 0 ? email.offset().top : offsetTop;
    }else{
			var reg = !!email.val().match(/^([\.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/);
			if(!reg) {
				email.siblings('.error').text(langData['siteConfig'][20][319]).show();
        offsetTop = offsetTop == 0 ? email.offset().top : offsetTop;
			}
		}
    if (cardnum.val() == "") {
      cardnum.siblings('.error').text(langData['siteConfig'][20][106]).show();
      offsetTop = offsetTop == 0 ? cardnum.offset().top : offsetTop;
    }else{
      // if (!checkIdcard(cardnum.val())) {
      //   cardnum.siblings('.error').text('请输入正确的身份证号码').show();
			// 	offsetTop = offsetTop == 0 ? cardnum.offset().top : offsetTop;
      // }
		}
    if (company.val() == "") {
      company.closest('dd').find('.error').show();
      offsetTop = offsetTop == 0 ? $('#company').offset().top : offsetTop;
    }else {
      company.closest('dd').find('.error').hide();
    }
    if (licensenum.val() == "") {
      licensenum.closest('dd').find('.error').show();
      offsetTop = offsetTop == 0 ? $('#licensenum').offset().top : offsetTop;
    }else {
      licensenum.closest('dd').find('.error').hide();
    }
    if (addrid.val() == "") {
      $('.cityName .error').show();
      offsetTop = offsetTop == 0 ? $('.cityName').offset().top : offsetTop;
    }else {
      $('.cityName .error').hide();
    }
    if (address.val() == "") {
      address.closest('dd').find('.error').show();
      offsetTop = offsetTop == 0 ? $('#address').offset().top : offsetTop;
    }else {
      address.closest('dd').find('.error').hide();
    }

    if (cardfront.val() == "") {
      cardfront.closest('dd').find('.error').show();
      offsetTop = offsetTop == 0 ? $('#up_certfy-front').offset().top : offsetTop;
    }else {
      cardfront.closest('dd').find('.error').hide();
    }
    if (cardbehind.val() == "") {
      cardbehind.closest('dd').find('.error').show();
      offsetTop = offsetTop == 0 ? $('#up_certfy-back').offset().top : offsetTop;
    }else {
      cardbehind.closest('dd').find('.error').hide();
    }
    if (typeid.val() == "") {
      typeid.closest('dd').find('.error').show();
      offsetTop = offsetTop == 0 ? typeid.offset().top : offsetTop;
    }else {
      typeid.closest('dd').find('.error').hide();
    }
    if (logo.val() == "") {
      logo.closest('dd').find('.error').show();
      offsetTop = offsetTop == 0 ? logo.offset().top : offsetTop;
    }else {
      logo.closest('dd').find('.error').hide();
    }

    if(offsetTop){
			$('html, body').animate({scrollTop: offsetTop - 5}, 300);
			return false;
		}


    t.addClass("disabled").html(langData['siteConfig'][6][35]+"...")

    var data = {
      name: name.val(),
      areaCode: areaCode,
      phone: phone.val(),
      yzm: yzm.val(),
      email: email.val(),
      cardnum: cardnum.val(),
      company: company.val(),
      licensenum: licensenum.val(),
      addrid: addrid.val(),
      address: address.val(),
      cardfront: cardfront.val(),
      cardbehind: cardbehind.val(),
      license: license.val(),
      accounts: accounts.val(),
      jingying: jingying.val(),
      typeid: typeid.val(),
      logo: logo.val()
    }

    $.ajax({
        url: masterDomain+"/include/ajax.php?service=member&action=joinBusiness",
        data: data,
        type: "post",
        dataType: "jsonp",
        success: function (data) {
          t.removeClass("disabled").html(langData['siteConfig'][6][32]);   //下一步
          if(data.state == 100){
            window.location.href = data.info;
          }else{
            alert(data.info);
          }
        },
        error: function(){
          t.removeClass("disabled").html(langData['siteConfig'][6][32]); //下一步
          alert(langData['siteConfig'][20][181]);  //网络错误，提交失败！
        }
    });


  })


  // 点击示例
  $('.zhi-demoBtn').click(function(){
    $('.shili, .mask').show();
  })

  // 关闭示例
  $('.shili .close, .shili-btn .confirm').click(function(){
    $('.shili, .mask').hide();
  })



  // 上传图片
  function upload(t, width, height){
    var obj = t.closest(".picker"), fileupload = obj.find("p"), id = t.attr('id'),
        list = t.find('.uploader-list');

    fileupload.text(langData['siteConfig'][6][177]+'...');  //上传中

    var data = [];
    data['mod'] = 'member';
		data['type'] = 'card';
    data['filetype'] = "image";

    $.ajaxFileUpload({
      url: "/include/upload.inc.php",
      fileElementId: id,
      dataType: "json",
      data: data,
      success: function(m, l) {
        if (m.state == "SUCCESS") {

          var focus = obj.find("#"+id.replace("up_", ""));
          // 删除之前的图片
          if(focus.val() != ""){
            delFile(focus.val());
          }
          focus.val(m.url);

          obj.addClass('load').find(".uploader-list").html('<li><img src="'+m.turl+'"></li>');

          obj.removeClass("empty").find(".upload_sbtn").removeClass("empty");

          fileupload.text(langData['siteConfig'][6][59]);   //重新上传
          obj.find(".error").hide();

        } else {
          fileupload.text(langData['siteConfig'][6][59]);  //重新上传
          obj.closest("dl").find(".error").text(m.state).show();
        }
      },
      error: function() {

        obj.closest("dl").find(".error").text(langData['siteConfig'][20][183]).show();  //网络错误，请稍候重试！
      }
    });

  }

  $(".input-img").change(function(){
    var t = $(this);
    if (t.val() == '') return;
    upload(t);
  });

  //判断身份证信息
  function checkIdcard(sId) {
  	var tj = true;
  	var aCity = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外" }
  	var iSum = 0
  	var info = ""
  	if (!/^\d{17}(\d|x)$/i.test(sId)) {
  		tj = false;
  	}
  	sId = sId.replace(/x$/i, "a");
  	if (aCity[parseInt(sId.substr(0, 2))] == null) {
  		tj = false;
  	}
  	sBirthday = sId.substr(6, 4) + "-" + Number(sId.substr(10, 2)) + "-" + Number(sId.substr(12, 2));
  	var d = new Date(sBirthday.replace(/-/g, "/"))
  	if (sBirthday != (d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate())) {
  		tj = false;
  	}
  	for (var i = 17; i >= 0; i--) iSum += (Math.pow(2, i) % 11) * parseInt(sId.charAt(17 - i), 11)
  	if (iSum % 11 != 1) {
  		tj = false;
  	}
  	return tj;
  }


})
//建立一個可存取到該file的url
function getObjectURL(file) {
  var url = null ;
  if (window.createObjectURL!=undefined) { // basic
    url = window.createObjectURL(file) ;
  } else if (window.URL!=undefined) { // mozilla(firefox)
    url = window.URL.createObjectURL(file) ;
  } else if (window.webkitURL!=undefined) { // webkit or chrome
    url = window.webkitURL.createObjectURL(file) ;
  }
  return url ;
}

// 删除图片
function delFile(src){
  var g = {
    mod: "member",
    type: "delCard",
    picpath: src,
    randoms: Math.random()
  };
  $.ajax({
    type: "POST",
    cache: false,
    async: false,
    url: "/include/upload.inc.php",
    dataType: "json",
    data: $.param(g),
    success: function() {}
  });
}
