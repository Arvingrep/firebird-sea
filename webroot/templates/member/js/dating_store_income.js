var atpage = 1, pageSize = 10, totalCount = 0, container = $('.member-con');
$(function(){

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
    
  // 筛选类型
  $("#selectTypeMenu>a").click(function () {
    var t = $(this);
    if(t.hasClass('active')) return;
    $("#selectTypeText").text(t.text());
    t.parent().hide();
    $('selectType').removeClass('hover');
    t.addClass('active').siblings().removeClass('active');
    getList(1);
  });

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
    var category = $('#selectTypeMenu a.active').data('id');
    category = category == undefined ? '' : category;
    keywords = $('#keywords').val();

    container.html('<div class="loading">'+langData['siteConfig'][29][25]+'...</div>');   //获取中，请稍后
    totalCount = 0;
    showPageInfo();

    $.ajax({
      url: masterDomain + '/include/ajax.php?service=dating&action=incomeStoreList&spec=in&autoread=1&page='+atpage+'&pageSize='+pageSize+'&category='+category+'&keywords='+keywords,
      type: 'get',
      dataType: 'jsonp',
      success: function(data){
        if(data && data.state == 100 && data.info.list.length){
          var html = [];
          totalCount = data.info.pageInfo.totalCount;
          $("#total").text(data.info.pageInfo.totalMoney);
          for(var i = 0; i < data.info.list.length; i++){
            var d = data.info.list[i];
            var photo = d.user.photo ? d.user.photo : staticPath + 'images/default_user.jpg';
            var hn_url = hn_income_url.replace('#id', d.uid);
            html.push('<div class="member-list fn-clear">');
            html.push('  <div class="list-left fn-clear">');
            html.push('    <a href="'+hn_url+'" target="_blank"><img src="'+photo+'" alt=""></a>');
            html.push('    <div class="intro">');
            html.push('      <a href="'+hn_url+'" target="_blank"><p class="name">'+d.user.nickname+'</p></a>');
            html.push('      <p class="years">'+d.user.year+langData['siteConfig'][29][161]+'</p>');   
             //年经验
            html.push('    </div>');
            html.push('  </div>');
            html.push('  <div class="list-right">+'+d.totalMoney+'</div>');
            html.push('</div>');
          }
          container.html(html.join(""));
          showPageInfo();
        }else{
          container.html('<div class="loading">'+langData['siteConfig'][21][138]+'</div>');   //暂无相关数据
        }
      },
      error: function(){

      }
    })
  }
