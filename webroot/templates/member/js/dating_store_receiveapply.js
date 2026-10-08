var atpage = 1, pageSize =10, totalCount = 0, container = $('.member-con');

$(function(){

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

    getList(1);
  });

  container.delegate('.sign', 'click', function(){
    var t = $(this), id = t.closest('.member-list').attr('data-id');
    t.removeClass().addClass('done').text(langData['siteConfig'][26][146]);  //已联系
    $.post('/include/ajax.php?service=dating&action=applyOper&type='+type+'&id='+id);
  })

  getList();
})
  function getList(tr){
    if(tr){
      atpage = 1;
    }
    var sex = $('#selectTypeText').attr('value');
    sex = sex == undefined ? "" : '&sex='+sex;
    container.html('<div class="loading">'+langData['siteConfig'][20][409]+'...</div>');  //正在获取，请稍后
    totalCount = 0;
    showPageInfo();

    $.ajax({
      url: '/include/ajax.php?service=dating&action=applyList&type='+type+'&autoread=1&page='+atpage+'&pageSize='+pageSize+sex,
      type: 'get',
      dataType: 'json',
      success: function(data){
        if(data && data.state == 100){
          var html = [];
          totalCount = data.info.pageInfo.totalCount;
          for(var i = 0; i < data.info.list.length; i++){
            var d = data.info.list[i];
            var photo = d.ufrom.phototurl ? d.ufrom.phototurl : staticPath + 'images/default_user.jpg';
            html.push('<div class="member-list fn-clear" data-id="'+d.id+'">');
            html.push('  <div class="member fn-left">');
            html.push('    <a href="'+d.ufrom.url+'" target="_blank"><img src="'+photo+'" alt=""></a>');
            html.push('    <div class="con fn-left">');
            html.push('      <p class="name"><a href="'+d.ufrom.url+'" target="_blank">'+d.ufrom.nickname+'</a>'+(d.ufrom.online ? '<span>'+langData['siteConfig'][29][139]+'</span>' : '<span class="grey">'+langData['siteConfig'][29][140]+'</span>')+'</p>');
            //在线-离线
            html.push('      <p class="loc">'+d.city+'</p>');
            html.push('    </div>');
            html.push('  </div>');
            html.push('  <div class="mem-sex fn-left">'+(d.sex == '1' ? langData['siteConfig'][13][4] : langData['siteConfig'][13][5])+'</div>');   //男-女
            html.push('  <div class="mem-tel fn-left">'+d.mobile+'</div>');
            html.push('  <div class="mem-money fn-left">'+d.money+'</div>');
            html.push('  <div class="mem-time fn-left">'+huoniao.transTimes(d.pubdate, 2).replace(/-/g, '.')+'</div>');
            html.push('  <div class="mem-state fn-left">');
            if(d.state == 0){
              html.push('    <a href="javascript:;" class="sign">'+langData['siteConfig'][29][162]+'</a>');   //标记已联系
            }else{
              html.push('    <a href="javascript:;" class="done">'+langData['siteConfig'][26][146]+'</a>');  //已联系
            }
            html.push('  </div>');
            html.push('</div>');
          }
          container.html(html.join(""));
          showPageInfo();
        }else{
          container.html('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');//暂无相关信息
        }
      },
      error: function(){
        container.html('<div class="loading">'+langData['siteConfig'][6][203]+'</div>');//网络错误，请重试
      }
    })
  }