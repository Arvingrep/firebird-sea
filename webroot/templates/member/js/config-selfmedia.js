$(function(){

  if($('#waitAudit').length){
    $('.step2 .desk').show();;
  }

  // 入驻
  // step1
  $('.step1 ul li').click(function(){
    $(this).addClass('active').siblings().removeClass('active');
    $('.step1 .btn').removeClass('disabled');
    var id = $(this).data("id");
    $('#type').val(id);
    $('.variable').hide().find('input, textarea, select').prop('disabled', true);
    // $('.variable-'+id).show().find('input, textarea, select').prop('disabled', false);
    $('.variable-'+id).each(function(){
      var o = b = $(this);
      if(b.find('.variable-'+id).length){
        o = b.find('.variable-'+id);
      }
      b.show();
      o.find('input, textarea, select').prop('disabled', false);
    })
    $('#group-op-title span').text(id == 1 ? langData['siteConfig'][28][37] : langData['siteConfig'][28][61] );    //'运营者联系信息' : '授权运营者联系信息'
    $('#type2_mb_type .radio span:eq(0)').click();
  })
  $('.next').click(function(){
    if($(this).hasClass('disabled')) return;
    $('.step2').show().siblings().hide();
  })

  $('.choose').click(function(){
    $('.step1').show().siblings().hide();
  })

  // 已入住
  if(detail.id){
    $('.variable').not('.variable-'+detail.type).remove();
    $('#group-op-title span').text(detail.type == 1 ? langData['siteConfig'][28][37] : langData['siteConfig'][28][61]);   //'运营者联系信息' : '授权运营者联系信息'
  }

  function showErr(obj, type){
    if(type == 'suc'){
      obj.siblings('.tip-inline').removeClass().addClass("tip-inline success").show();
    }else{
      obj.siblings('.tip-inline').addClass("tip-inline error").html('<s></s>'+obj.data('title')).css('display','inline-block');
    }
  }

  $('.agreement i').click(function(){
    $(this).toggleClass('active');
  })
  $('.agreement a').click(function(){
    $('.agreemenmodel, .bg').show();
  })
  $('.bg, .agreemenmodel .close').click(function(){
    $('.agreemenmodel, .bg').hide();
  })
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
                   var listLen = list.length;
                   var codeArea = list[0].code;
                   if(listLen == 1 && codeArea == 86){//当数据只有一条 并且这条数据是大陆地区86的时候 隐藏区号选择
                        $('.areaCode').hide();
                        $('.w-form #fabuForm .inp#op_phone').css({'padding-left':'10px','width':'218px'});
                        return false;
                   }
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
    var areaWrap =$(this).closest("dd").find('.areaCode_wrap');
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
    var par = t.closest("dd");
    var areaIcode = par.find(".areaCode");
    areaIcode.find('i').html('+' + code);
    $('#areaCode').val(code)
  });

  $('body').bind('click', function(){
    $('.areaCode_wrap').fadeOut(300);
  });
  $("#fabuForm").submit(function(e){
    e.preventDefault();
    console.log('submit')
    var t            = $(this),
        id           = $("#id").val(),
        typeid       = $("#type"),
        ac_name      = $("#ac_name"),
        ac_profile   = $("#ac_profile"),
        ac_field     = $("#ac_field"),
        ac_photo     = $("#ac_photo"),
        op_name      = $("#op_name").val(),
        op_phone     = $("#op_phone").val(),
        op_email     = $("#op_email").val(),
        offsetTop    = 0,
        btn          = $('#submit'),
        agree        = $('.agreement i').hasClass('active'),
        tj           = true;

    // 前台只验证账号信息
    //标题
    if(ac_name.val() == ''){
      showErr(ac_name);
      offsetTop = offsetTop == 0 ? ac_name.closest('dl').offset().top : offsetTop;
    };

    //介绍
    if(ac_profile.val() == ''){
      showErr(ac_profile);
      offsetTop = offsetTop == 0 ? ac_profile.closest('dl').offset().top : offsetTop;
    };

    // 领域
    if(ac_field.val() == "" || ac_field.val() == 0){
      showErr(ac_field);
      offsetTop = offsetTop == 0 ? ac_field.closest('dl').offset().top : offsetTop;
    }else{
      showErr(ac_field, 'suc');
    }

    // 头像
    if(offsetTop == 0 && ac_photo.val() == ''){
      $.dialog.alert(langData['siteConfig'][28][62]);     //请上传自媒体头像
      offsetTop = offsetTop == 0 ? ac_photo.closest('dl').offset().top : offsetTop;
    }

    var ac_addrid = $('.addrBtn').attr('data-id'), ids = $('.addrBtn').attr('data-ids');
    var cityid = 0;
    if(ac_addrid){
      cityid = ids.split(' ')[0];
      $('#ac_addrid').val(ac_addrid);
      $('#cityid').val(cityid);
    }
    //区域
    if(offsetTop == 0 && (ac_addrid == '' || ac_addrid == 0) ){
        $.dialog.alert(langData['siteConfig'][28][63]);   //请选择所在地
        offsetTop = offsetTop == 0 ? $('.addrBtn').closest('dl').offset().top : offsetTop;
    };

    if(detail.id == 0 && !agree && offsetTop == 0){
      offsetTop = offsetTop == 0 ? $('.agreement').offset().top : offsetTop;
      $.dialog.alert(langData['siteConfig'][28][64]); //必须同意入驻协议
    }

    if(offsetTop){
      $('html,body').animate({'scrollTop':offsetTop}, 500);
      return false;
    }

    btn.attr("disabled", true);
    var data = t.serialize();
    if(tj){
      $.ajax({
        url: '/include/ajax.php?service=article&action=selfmediaConfig',
        type: 'post',
        data: data,
        dataType: 'json',
        success: function(data){
          if(data && data.state == 100){
            $.dialog({
              title: langData['siteConfig'][22][72],    //提示信息
              icon: 'success.png',
              content: data.info,
              close: false,
              ok: function(){
                location.reload();
              },
              cancel: function(){
                location.reload();
              }
            });
          }else{
            btn.attr('disabled', false);
            $.dialog.alert(data.info);
          }
        },
        error: function(){
          btn.attr('disabled', false);
          $.dialog.alert(langData['siteConfig'][6][203]);//网络错误，请重试
        }
      })
    }

  })
})
