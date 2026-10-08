var atpage = 1, pageSize = 10, totalCount = 0, container = $('.detail-con');
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
      url: masterDomain + '/include/ajax.php?service=dating&action=incomeList&type=1&spec=in&autoread=1&page='+atpage+'&pageSize='+pageSize+'&category='+category+'&keywords='+keywords,
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
            html.push('<div class="detail-list fn-clear">');
            html.push('  <div class="name-con fn-left">');
            html.push('    <a href="'+d.user.url+'" target="_blank"><img class="fn-left" src="'+photo+'" alt=""></a>');
            html.push('    <div class="name-r fn-left">');
            html.push('      <a class="nickname" href="'+d.user.url+'" target="_blank">'+d.user.nickname+'</a>');
            html.push('      <p>'+d.ordernum+'</p>');
            html.push('    </div>');
            html.push('  </div>');
            html.push('  <div class="time-con fn-left">'+huoniao.transTimes(d.pubdate, 2).replace(/-/g, '.')+'</div>');
            html.push('  <div class="serve-con fn-left">'+d.title+'</div>');
            html.push('  <div class="up-con fn-left">'+d.extRatio+'%</div>');
            html.push('  <div class="money-con fn-left">+'+d.extMoney+'</div>');
            html.push('</div>');

          }
          container.html(html.join(""));
          showPageInfo();
        }else{
          container.html('<div class="loading">'+langData['siteConfig'][21][138]+'</div>');  //暂无相关数据
        }
      },
      error: function(){

      }
    })
  }
