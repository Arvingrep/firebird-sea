$(function(){

  // 第一步
  $('.result').delegate('.btnbox', 'click', function(){
    var t = $(this), li = t.closest('li'), name = li.find('.name').text(),
        address = li.find('.address').text();
    $('.module-h1').html('<em class="blue">'+name+'</em>'+langData['siteConfig'][18][60]+'：'+address);    //营业地址
    $('.module-1').hide();
    $('.module-2').show();
  })

  // 第二步选择资质类型
  $('.select-tit').click(function(){
    var t = $(this);
    if (t.hasClass('active')) {
      $('.select-ul').hide();
      t.removeClass('active');
    }else {
      t.addClass('active');
      $('.select-ul').show();
    }
    return false;
  })

  $('.select-ul li').click(function(){
    var txt = $(this).text();
    $(this).addClass('active').siblings('li').removeClass('active');
    $('.select-tit span').text(txt);
  })

  $(document).click(function(){
    $('.select-tit').removeClass('active');
    $('.select-ul').hide();
  })

  // 获取验证码
  $('.verify').click(function(){
    var t = $(this), phone = $('#phone'), error = phone.siblings('.error'), box = t.closest('.module-box');
    if (t.hasClass('disabled') || box.hasClass('disabled')){return};

    if (phone.val() == "") {
      error.show();
    }else {
      t.addClass('disabled').html(langData['siteConfig'][6][202]+'（<em class="count">60</em>）');  //重新获取
      obj = t.find('.count');
      countDown(60, obj, t)
    }
  })

  // 服务协议
  $('.agree').click(function(){
    var t = $(this);
    if (t.hasClass('active')) {
      t.removeClass('active');
      $('#submit').addClass('disabled');
    }else {
      t.addClass('active');
      $('#submit').removeClass('disabled');
    }
  })

  $('.uploadBtn').hover(function(){
    var t = $(this), list = t.find('.uploader-list'), bg = list.siblings('.upload-bg');
    if (t.find('li').length > 0) {
      bg.show();
    }
    return false;
  }, function(){
    var t = $(this), list = t.find('.uploader-list'), bg = list.siblings('.upload-bg');
    bg.hide();
  })

  $('.inpbox dd input').bind('input propertychange', function(){
    var t = $(this);
    if (t.val() != "") {
      $(this).siblings('.error').hide();
    }
  })

  $('#submit').click(function(e){
    e.preventDefault();

    var t = $(this),
        company = $('#company'),
        name = $('#name'),
        idcard = $('#idcard'),
        phone = $('#phone'),
        verify = $('#verify'),
        front = $('#front'),
        back = $('#back');

    var offsetTop = 0;
    if (t.hasClass('disabled')) {return};

    if (company.val() == "") {
      company.siblings('.error').show();
      offsetTop = offsetTop == 0 ? company.offset().top : offsetTop;
    }
    if (name.val() == "") {
      name.siblings('.error').show();
      offsetTop = offsetTop == 0 ? name.offset().top : offsetTop;
    }
    if (idcard.val() == "") {
      idcard.siblings('.error').show();
      offsetTop = offsetTop == 0 ? idcard.offset().top : offsetTop;
    }
    if (front.val() == "" || back.val() == "") {
      $('.certy').siblings('.error').show();
      offsetTop = offsetTop == 0 ? $('.certy').offset().top : offsetTop;
    }else {
      $('.certy').siblings('.error').hide();
    }
    if (phone.val() == "") {
      phone.siblings('.error').show();
      offsetTop = offsetTop == 0 ? phone.offset().top : offsetTop;
    }
    if (verify.val() == "") {
      verify.siblings('.error').show();
      offsetTop = offsetTop == 0 ? verify.offset().top : offsetTop;
    }


    if(offsetTop){
      $('html, body').animate({scrollTop: offsetTop - 5}, 300);
      return false;
    }

    $('.step2').removeClass('active');
    $('.step3').addClass('active');
    $('.module-2').hide();
    $('.module-3').show();


  })









  //倒计时（开始时间、结束时间、显示容器）
 	function countDown(time, obj, btn){
 		mtimer = setInterval(function(){
 			obj.text((--time));
 			if(time <= 0) {
 				clearInterval(mtimer);
 				btn.removeClass('disabled').html('发&nbsp;送');
 			}
 		}, 1000);
 	}


  // 上传图片
  function upload(t, width, height){
    var obj = t.closest(".uploadBtn"), id = t.attr('id'), txt = obj.find('.upload-txt'),
        list = obj.find('.uploader-list');

    txt.text(langData['siteConfig'][6][177]+'...');   //上传中

    var data = [];
    data['mod'] = 'member';
		data['type'] = 'card';
    data['filetype'] = "image";

    $.ajaxFileUpload({
      url: masterDomain + "/include/upload.inc.php",
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

          $('.upload-bg').hide();
          txt.text(langData['siteConfig'][6][59]);    //重新上传
          obj.find(".error").hide();

          if (id == 'up_zizhi') {
            $('.module-box').removeClass('disabled');
            $('.inpbox input').attr('disabled', false);
            $('#submit').removeClass('disabled');
          }

        } else {
          txt.text(langData['siteConfig'][6][59]);   //重新上传
          obj.closest("dl").find(".error").text(m.state).show();
        }
      },
      error: function() {
        obj.closest("dl").find(".error").text(langData['siteConfig'][6][203]).show();  //网络错误，请重试
      }
    });

  }

  $(".upload-img").change(function(){
    var t = $(this), id = t.attr('id');
    if (t.val() == '') return;
    upload(t);
  });

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
})
