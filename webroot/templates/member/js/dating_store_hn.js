var atpage = 1, pageSize =10, totalCount = 0, container = $('.door-maker');

$(function(){
  
  //添加红娘
  $('.add-maker').click(function(){
    $('.desk').show();
    $('.desk-add-maker').show();
  });
  if(add){
    $('.add-maker').click();
  }
  $('.desk').click(function(){
    $('.desk').hide();
    $('.desk-add-maker').hide();
  })
  // 关闭
  $('.add-maker-close a').click(function(){
    $('.desk').hide();
    $('.desk-add-maker').hide();
  })
  // 添加红娘表单验证
  var lgform = $('.add-maker-form');
  var err = lgform.find('.error p');

  lgform.submit(function(e){
    e.preventDefault();
    err.text('').hide();
    var nameinp = $('.add-maker-name'),
      name = nameinp.val(),
      jobinp = $('.add-maker-job'),
      job = jobinp.val(),
      telinp = $('.add-maker-tel'),
      tel = telinp.val(),
      passinp = $('.add-maker-pass'),
      pass = passinp.val(),
      t = lgform.find('.submit'),
      r = true;    
    if (name == '') {
      err.text(langData['siteConfig'][20][533]).show();    //请输入您的姓名
      nameinp.focus();
      return false;
    }
    if(tel == '') {
      r = false;
      err.text(langData['siteConfig'][29][150]).show();   //请输入您的电话号码
      telinp.focus();
      return false;
    } else {
      var reg , h = '';
      reg = !!tel.match(/^1[34578](\d){9}$/);
      if(!reg){
        err.text(langData['siteConfig'][29][159]).show();  //您的手机号输入有误
        telinp.focus();
        return false;
      }
    } 
    if(pass == '') {
      r = false;
      err.text(langData['siteConfig'][5][22]).show();  //请输入会员密码
      passinp.focus();
      return false;
    }

    t.attr('disabled', true);
    $.ajax({
      url: '/include/ajax.php?service=dating&action=addUser',
      type: 'post',
      data: lgform.serialize(),
      dataType: 'json',
      success: function(data){
        t.attr('disabled', false);
        if(data && data.state == 100){
          getList(1);
          nameinp.val('');
          telinp.val('');
          nameinp.focus();
        }else{
          err.text(data.info).show();
        }
      },
      error: function(){
        t.attr('disabled', false);
        err.text(langData['siteConfig'][6][203]).show();   //网络错误，请重试
      }
    })
  })

  // 删除红娘
  container.delegate('.delete-img', 'click', function(){
    var t = $(this), item = t.closest('.member-list');
    $('.desk').show();
    $('.hello-popup').show().data('item', item);
  })
  $('.hello-btn .sure').click(function(){
      var item = $('.hello-popup').data('item'), id = item.attr('data-id');
      item.remove();
      $('.desk').hide();
      $('.hello-popup').hide();
      $.post('/include/ajax.php?service=dating&action=delHn&id='+id);
  })
  $('.hello-popup-delete, .hello-btn .cancel').click(function(){
    $('.desk').hide();
    $('.hello-popup').hide();
  })
  // 门店红娘eee

  // 会员申请sss
  $('.member-list .mem-state .sign').click(function(){
    $(this).hide();
    $(this).next('a').show();
  })

  $('#selectTypeMenu').hover(function(){
    $(this).show();
    $(this).closest('selectType').addClass('hover');
  }, function(){
    $(this).hide();
    $(this).closest('selectType').removeClass('hover');
  });

  $("#selectTypeText").hover(function () {
    $(this).next("span").slideDown(200);
    $(this).closest('selectType').addClass('hover');
  },function(){
    $(this).next("span").hide();
    $(this).closest('selectType').removeClass('hover');
  });
  
  $("#selectTypeMenu>a").click(function () {
    $("#selectTypeText").text($(this).text());
    $("#selectTypeText").attr("value", $(this).attr("rel"));
    $(this).parent().hide();
    $('selectType').removeClass('hover');
  });
  // 会员申请eee
  $('.searchform').submit(function(e){
    e.preventDefault();
    getList(1);
  })
  getList();
})
  
  function getList(tr){
    if(tr){
      atpage = 1;
    }
    keywords = $('.door-text').val();
    container.html('<div class="loading">'+langData['siteConfig'][20][409]+'...</div>');   //正在获取，请稍后
    totalCount = 0;
    showPageInfo();
    $.ajax({
      url: '/include/ajax.php?service=dating&action=hnList&type=2&company='+user.storeUid+'&page='+atpage+'&pageSize='+pageSize+'&keywords='+keywords,
      type: 'get',
      dataType: 'json',
      success: function(data){
        if(data && data.state == 100){
          var html = [];
          totalCount = data.info.pageInfo.totalCount;
          for(var i = 0; i < data.info.list.length; i++){
            var d = data.info.list[i];
            if(d.photo){
              var photo = '<img src="'+d.photo+'" alt="">';
            }else{
              var photo = '<img src="'+staticPath + 'images/default_user.jpg" class="noimg" alt="">';
            }
            html.push('<div class="member-list fn-clear" data-id="'+d.id+'">');
            html.push('  <a href="'+d.url+'" target="_blank">'+photo+'</a>');
            html.push('  <div class="personal-wrap">');
            html.push('    <p class="name"><a href="javascript:;">'+d.nickname+'</a><!--<span>'+langData['siteConfig'][29][160]+'</span><--></--></p>');  //资深婚恋顾问
            html.push('    <p class="tel">'+d.phone+'</p>');
            html.push('  </div>');
            html.push('  <a href="javascript:;"><img src="'+templets_skin+'images/delete-img.png" alt="" class="delete-img"></a>');
            html.push('</div>');
          }
          container.html(html.join(""));
          showPageInfo();
        }else{
          container.html('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');  //暂无相关信息
        }
      },
      error: function(){
        container.html('<div class="loading">'+langData['siteConfig'][6][203]+'</div>');  //网络错误，请重试
      }
    })
  }
