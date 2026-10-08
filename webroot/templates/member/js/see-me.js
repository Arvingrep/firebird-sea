var atpage = 1, pageSize = 20, totalCount = 0, container = $('.people-box');

$(function(){
	// 判断浏览器是否是ie8
  if($.browser.msie && parseInt($.browser.version) >= 8){
    $('.people-list:nth-child(6n)').css('margin-right','0');
  }
  // 是否删除
  container.delegate('.see-me-delete', 'click', function(){
    var t = $(this);
    var box = t.closest('.people-list');
    $('.desk').show();
   	$('.hello-popup').show().data('item', box);
  })
  $('#sure').click(function(){
    var item = $('.hello-popup').data('item');
    var id = item.attr('data-id');
    $.post(masterDomain + '/include/ajax.php?service=dating&action=cancelFollow&type=2&id='+id);
    $('.desk').hide();
    $('.hello-popup').hide();
    item.find('.see-me-delete').hide();
    item.find('.followed, .follow-each').html(langData['siteConfig'][19][846]).removeClass().addClass('follow');  //关注
  })
  // 关闭弹窗
  $('#hello-popup-delete, #cancel').click(function(){
    $('.desk').hide();
   	$('.hello-popup').hide();
  })
  // 关注按钮
  container.delegate('.is-follow a', 'click', function(){
    var t = $(this);
    var box = t.closest('.people-list');
    var id = box.attr('data-id');
    if(t.hasClass('follow')){
      $.post(masterDomain + '/include/ajax.php?service=dating&action=visitOper&type=2&id='+id);
      t.addClass('followed').removeClass('follow').html('<img src="'+templets_skin+'images/followed.png" alt="">'+langData['siteConfig'][19][845]);//已关注
      box.find('.see-me-delete').show();
    }else{
      box.find('.see-me-delete').click();
    }
  })

  //导航条
  $(".main-tab li").click(function(){
    $(this).addClass("curr").siblings().removeClass("curr");
    getList(1);
  });

  getList();
})
  function getList(tr){

    var data = [], state = 0, spec = '';
    var navActive = $(".main-tab li.curr"), index = navActive.index();
    if(tr){
      atpage = 1;
    }

    container.html('<div class="loading">'+langData['siteConfig'][20][409]+'...</div>');  //正在获取，请稍后

    if(index == 0){
      var url = masterDomain + '/include/ajax.php?service=dating&action=visit&autoread=1&oper=visit&act=in&page='+atpage+'&pageSize='+pageSize;
    }else if(index == 1){
      var url = masterDomain + '/include/ajax.php?service=dating&action=visit&autoread=1&oper=follow&act=in&page='+atpage+'&pageSize='+pageSize;
    }else if(index == 2){
      var url = masterDomain + '/include/ajax.php?service=dating&action=visit&autoread=1&oper=follow&act=out&page='+atpage+'&pageSize='+pageSize;
    }else if(index == 3){
      var url = masterDomain + '/include/ajax.php?service=dating&action=friendList&page='+atpage+'&pageSize='+pageSize;
    }
    console.log(url)
    $.ajax({
      url: url,
      type: 'get',
      dataType: 'jsonp',
      success: function(data){

        if(data && data.state == 100){
          var list = data.info.list, len = list.length;
          var pageInfo = data.info.pageInfo;
          totalCount = pageInfo.totalCount;
          var list = data.info.list, len = list.length, html = [];
          for(var i = 0; i < len; i++){
            var d = list[i];
            if(index == 3){
              var user = d;
            }else{
              var user = d.member;
            }
            var photo = user.photo ? user.photo : staticPath + 'images/default_user.jpg';
            html.push('<div class="people-list fn-left" data-id="'+user.id+'">');
            html.push('  <a href="'+user.url+'" target="_blank"><img class="see-me-portrait" src="'+photo+'" alt=""></a>');
            html.push('  <p class="name"><a href="javascript:;">'+user.nickname+'</a></p>');
            html.push('  <p class="is-follow">');
            if(index == 3 || (d.follow && d.followby) ){
              html.push('    <a href="javascript:;" class="follow-each"><img src="'+templets_skin+'images/follow-each.png" alt="">'+langData['siteConfig'][38][34]+'</a>');//互相关注
            }else if(d.follow){
              html.push('    <a href="javascript:;" class="followed"><img src="'+templets_skin+'images/followed.png" alt="">'+langData['siteConfig'][19][845]+'</a>');//已关注
            }else{
              html.push('    <a href="javascript:;" class="follow">'+langData['siteConfig'][19][846]+'</a>');//关注
            }
            html.push('  </p>');
            html.push('  <a href="javascript:;" class="see-me-delete"'+(index != 3 && !d.follow ? ' style="display:none;"' : '')+'><img src="'+templets_skin+'images/see-me-delete.png" alt=""></a>');
            html.push('</div>');
          }
          container.html(html.join(''));
          showPageInfo();
        }else{
          container.html('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');//暂无相关信息！
        }
      },
      error: function(){
        container.html('<div class="loading">'+langData['siteConfig'][6][203]+'</div>');//网络错误，请重试
      }
    })
  }