$(function(){

  // 第一步选择开通模块
  $('.module-box li').click(function(){
    var t = $(this), sum = 0, html = [];
    t.hasClass('active') ? t.removeClass('active') : t.addClass('active');
    $('.module-box li.active').each(function(){
      var li = $(this), price = Number(t.find('.module-price').find('em').text()), liHtml = li.html();
      sum += price;
      html.push('<li>');
      html.push(liHtml);
      html.push('</li>');
    })
    $('.selected-module').html(html.join(''));
    $('.sum i, .total-price').text(sum.toFixed(2));
  })

  // 单选框
  $('.checkbox li').click(function(){
    $(this).addClass('active').siblings('li').removeClass('active');
  })

  // 身份证有效期
  $('.input-time .radio').click(function(){
    $(this).hasClass('active') ? $(this).removeClass('active') : $(this).addClass('active');
  })

  $('.inpbox dd input').bind('input propertychange', function(){
    var t = $(this);
    if (t.val() != "") {
      $(this).siblings('.error').hide();
    }
  })

  // 下一步
  $('.next-btn').click(function(){
    $('#addr').val($('.addrBtn').attr('data-id'));
    var t = $(this), id = t.attr('data-id'), step = t.attr('data-step'), index = t.attr('data-index'),
        width = (20 * index)+'%';
    var bEmail = $('#bEmail'),
        bPhone = $('#bPhone'),
        mbPhone = $('#mbPhone'),
        idcard = $('#idcard'),
        company = $('#company'),
        addr = $('#addr'),
        address = $('#address'),
        zhizhaoNumber = $('#zhizhaoNumber'),
        certfyFront = $('#certfy-front'),
        certfyBack = $('#certfy-back'),
        startDate = $('#start-date'),
        endDate = $('#end-date'),
        store = $('#store'),
        logo = $('#logo'),
        storeDetail = $('#store-detail');

    var offsetTop = 0;

    // 第一步
    if (id == "step-box1") {

      if ($('.module-box li.active').length < 1) {
        $('.module-box').siblings('.error').show();
        offsetTop = offsetTop == 0 ? $('.module-box').offset().top : offsetTop;
      }
      if (bEmail.val() == "") {
        bEmail.siblings('.error').show();
        offsetTop = offsetTop == 0 ? bEmail.offset().top : offsetTop;
      }
      if (bPhone.val() == "") {
        bPhone.siblings('.error').show();
        offsetTop = offsetTop == 0 ? bPhone.offset().top : offsetTop;
      }
      if (idcard.val() == "") {
        idcard.siblings('.error').show();
        offsetTop = offsetTop == 0 ? idcard.offset().top : offsetTop;
      }
      if (company.val() == "") {
        company.siblings('.error').show();
        offsetTop = offsetTop == 0 ? company.offset().top : offsetTop;
      }
      if (addr.val() == "") {
        addr.siblings('.cityName').find('.error').show();
        offsetTop = offsetTop == 0 ? $('.cityName').offset().top : offsetTop;
      }else {
        addr.siblings('.cityName').find('.error').hide();
      }
      if (address.val() == "") {
        address.siblings('.error').show();
        offsetTop = offsetTop == 0 ? address.offset().top : offsetTop;
      }
      if (zhizhaoNumber.val() == "") {
        zhizhaoNumber.siblings('.error').show();
        offsetTop = offsetTop == 0 ? zhizhaoNumber.offset().top : offsetTop;
      }
      if (certfyFront.val() == "") {
        certfyFront.closest('dd').find('.error').show();
        offsetTop = offsetTop == 0 ? $('#up_certfy-front').offset().top : offsetTop;
      }else {
        certfyFront.closest('dd').find('.error').hide();
      }
      if (certfyBack.val() == "") {
        certfyBack.closest('dd').find('.error').show();
        offsetTop = offsetTop == 0 ? $('#up_certfy-back').offset().top : offsetTop;
      }else {
        certfyBack.closest('dd').find('.error').hide();
      }
      if (startDate.val() == "" || endDate.val() == "") {
        $('.input-time').siblings('.error').show();
        offsetTop = offsetTop == 0 ? startDate.offset().top : offsetTop;
      }else {
        $('.input-time').siblings('.error').hide();
      }


      if(offsetTop){
  			$('html, body').animate({scrollTop: offsetTop - 5}, 300);
  			return false;
  		}


    }else if (id == 'step-box2') {
      if (store.val() == "") {
        store.siblings('.error').show();
        offsetTop = offsetTop == 0 ? store.offset().top : offsetTop;
      }
      if (logo.val() == "") {
        logo.closest('dd').find('.error').show();
        offsetTop = offsetTop == 0 ? logo.offset().top : offsetTop;
      }else {
        logo.closest('dd').find('.error').hide();
      }
      if (storeDetail.val() == "") {
        storeDetail.siblings('.error').show();
        offsetTop = offsetTop == 0 ? storeDetail.offset().top : offsetTop;
      }

      $('.txt_store').text(store.val());
      if(offsetTop){
  			$('html, body').animate({scrollTop: offsetTop - 5}, 300);
  			return false;
  		}



    }else if (id == 'step-box4') {

    }

    $('.'+id).hide();
    $('.'+step).show();
    $('.step li').eq(index).addClass('active');
    $('.step .active-line').css('width', width);

  })


  // 上一步
  $('.prev-btn').click(function(){
    var t = $(this), id = t.attr('data-id'), step = t.attr('data-step'), index = t.attr('data-index'),
        width = (20 * index)+'%';

    $('.'+id).hide();
    $('.'+step).show();
    $('.step li').eq(index).removeClass('active');
    $('.step .active-line').css('width', width);
  })



  // 点击示例
  $('.zhi-demoBtn').click(function(){
    $('.shili, .mask').show();
  })

  // 关闭示例
  $('.shili .close, .shili-btn .confirm').click(function(){
    $('.shili, .mask').hide();
  })

  // 点击选择支付方式
  $('.paybox li').click(function(){
    $(this).addClass('active').siblings('li').removeClass('active');
  })


  // 上传图片
  function upload(t, width, height){
    var obj = t.closest(".picker"), fileupload = obj.find("p"), id = t.attr('id'),
        list = t.find('.uploader-list');

    fileupload.text(langData['siteConfig'][6][177]+'...');   //上传中

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

          fileupload.text(langData['siteConfig'][6][59]);  //重新上传
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
