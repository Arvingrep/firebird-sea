$(function(){

  //页面自适应设置
  $(window).resize(function(){
    var screenwidth = window.innerWidth || document.body.clientWidth;
    var criticalPoint = criticalPoint != undefined ? criticalPoint : 1240;
    var criticalClass = criticalClass != undefined ? criticalClass : "w1200";
    if(screenwidth < criticalPoint){
      $("html").removeClass(criticalClass);
    }else{
      $("html").addClass(criticalClass);
    }

  });

  // 头部搜索框
  $('.search-nav').hover(function(){
    $(this).find('ul').show();
  },function(){
    $(this).find('ul').hide();
  })

  $('.search-nav li').click(function(){
    var t = $(this), val = t.text(), parent = t.closest('.search-nav').find('span');
    parent.html(val);
  })

  // 表单验证
  var djObj = $('.second'),info = djObj.find('.info');

  djObj.find('.loupan').focus(function(){
    validation.loupan();
  }).blur(function(){
    validation.loupan(1);
  })

  djObj.find('.price').focus(function(){
    validation.price();
  }).blur(function(){
    validation.price(1);
  })

  djObj.find('.name').focus(function(){
    validation.name();
  }).blur(function(){
    validation.name(1);
  })

  djObj.find('.phone').focus(function(){
    validation.phone();
  }).blur(function(){
    validation.phone(1);
  })

  $(document).on('change','#addrlist select',function(){
    validation.addr();
  })

  var validation = {
    loupan : function(type){
      var o = djObj.find('.loupan'),v = o.val(),t = o.parents('dd');
      if(v == '') {
        t.find('.error em').text('请填写楼盘');
        t.find('.error').hide();
        if(type) {
          $('.error').hide();
          t.find('.error').show();
        }
        return false;
      } else {
        t.find('.error').hide();
        return true;
      }
    },
    price : function(type){
      var o = djObj.find('.price'),v = o.val(),t = o.parents('dd');
      if(v == '') {
        t.find('.error em').text('请填写价格');
        t.find('.error').hide();
        if(type) {
          $('.error').hide();
          t.find('.error').show();
        }
        return false;
      } else {
        t.find('.error').hide();
        return true;
      }
    },
    name : function(type){
      var o = djObj.find('.name'),v = o.val(),t = o.parents('.inp-small');
      if(v == '') {
        t.find('.error em').text('填写您的姓名');
        t.find('.error').hide();
        if(type) {
          $('.error').hide();
          t.find('.error').show();
        }
        return false;
      } else {
        t.find('.error').hide();
        return true;
      }
    },
    phone : function(type){
      var a = this ,o = djObj.find('.phone'),v = o.val(),t = o.parents('.inp-small');
      if(v == '') {
        t.find('.error em').text('填写您的电话');
        t.find('.error').hide();
        if(type) {
          $('.error').hide();
          t.find('.error').show();
        }
        return false;
      }
      return true;
      // else {
      //   var telReg = !!v.match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
      //   if(!telReg && ! /^((0\d{2,3})[-_－—]?)(\d{7,8})([-_－—]?(\d{3,}))?$/.test(v)){
      //     t.find('.error em').text('您的号码格式有误');
      //     t.find('.error').show();
      //     return false;
      //   } else {
      //     $('.error').hide();
      //     return true;
      //   }
      // }
    },
    check :function(){

    }
  }


  //获取报名人数
  $.ajax({
      url: "/include/ajax.php?service=house&action=bookingList&type=1&pageSize=1",
      dataType: "jsonp",
      success: function (data) {
          if(data.state == 100){
              $(".nin:eq(1)").html(data.info.pageInfo.totalCount);
          }
      }
  });
  //国际手机号获取
  getNationalPhone();
  function getNationalPhone(){
    $.ajax({
            url: masterDomain+"/include/ajax.php?service=siteConfig&action=internationalPhoneSection",
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
    var areaWrap =$(this).closest(".weiz").find('.areaCode_wrap');
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
    var par = t.closest(".weiz");
    var areaIcode = par.find(".areaCode");
    areaIcode.find('i').html('+' + code);
  });

  $('body').bind('click', function(){
    $('.areaCode_wrap').fadeOut(300);
  });


  $('.second form').submit(function(e){
    if(validation.loupan(1) && validation.price(1) && validation.name(1) && validation.phone(1)) {
        var huxing = [];
        djObj.find("input[type='checkbox']:checked").each(function(){
            huxing.push($(this).val());
        });
        var areaIcode = djObj.find(".areaCode");
        var areaCode = areaIcode.find("i").text().replace('+', '');
        var data = [];
        data.push("type=1");
        data.push("loupan="+djObj.find('.loupan').val());
        data.push("amount="+djObj.find('.price').val());
        data.push("huxing="+huxing.join(","));
        data.push("name="+djObj.find('.name').val());
        data.push("mobile="+djObj.find('.phone').val());
        data.push("areaCode="+areaCode);

        $.ajax({
            url: "/include/ajax.php?service=house&action=booking&"+data.join("&"),
            type: "POST",
            dataType: "jsonp",
            success: function (data) {
                if(data.state == 100){
                    $('.layer-success h3').html('提交成功，我们会尽快与您取得联系');
                    $('.layer-success, .mask').show();
                }else{
                    $('.layer-failed h3').html(data.info);
                    $('.layer-failed, .mask').show();
                }
            },
            error: function(){
                $('.layer-failed h3').html('网络错误，提交失败！');
                $('.layer-failed, .mask').show();
            }
        });
        return false;
    } else {
        e.preventDefault();
        $(this).find('.error').eq(0).children('input').focus();
    }
  })

  // 关闭弹出层
  $('.layer-tit a, .layer .btn').click(function(){
    $('.layer-success, .layer-failed, .mask').hide();
  })

  // 浮动导航
	$('.scroll a').hover(function(){
		$(this).addClass('hover');
	},function(){
		$(this).removeClass('hover');
	})

	$('.s-wx').hover(function(){
		$('.wx-down-box').show();
	},function(){
		$('.wx-down-box').hide();
	})

  // 回到顶部
  $('.scroll .s-top').click(function(){
    $('body, html').animate({scrollTop: 0}, 300);
  })


})
