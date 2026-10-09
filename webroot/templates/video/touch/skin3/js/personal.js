$(function () {
    //展开收起
    $('.pro .zk').click(function(){
        if(!$('.proDetail').hasClass('active')){
            $('.proDetail').addClass('active');
            $(this).text('收起');
        }else{
            $('.proDetail').removeClass('active');
            $(this).text('展开');
        }
    })



var isload = false,page =1;
//滚动底部加载
$(window).scroll(function() {
    var allh = $('body').height();
    var w = $(window).height();
    var s_scroll = allh - 30 - w;
    if ($(window).scrollTop() > s_scroll && !isload) {
        page++;
        getList();
    };
});


// 数据加载
getList();
function getList(title){
  isload=true;
  $('.zjList .loading').remove();
  $(".zjList").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
  $.ajax({
      url : '/include/ajax.php?service=video&action=albumlist&pageSize=10&page=' + page +'&uid='+followId,
      data : '',
      type : 'get',
      dataType : 'json',
      success : function (data) {
        if(data.state == 100){
          $(".zjList .loading").remove();
          var list = data.info.list,len = list.length, html = [];
          for (var i = 0; i < len; i++) {
              var pic = list[i].litpic!='' && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
              html.push('<li>');
              html.push('     <a href="'+list[i].albumurl+'">');
              html.push('  <div class="top_img">');                          
              html.push('     <img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/404.jpg\';this.onerror=this.src=\''+staticPath+'images/noPhoto_100.jpg\';">');
              html.push('   </div>');             
              html.push('   <div class="vInfo">');
              html.push('     <h3>'+list[i].title+'</h3>');
              html.push('     <p class="vNum">'+list[i].videocout+'个视频</p>');
              html.push('   </div>');
              html.push('</a></li>');
          }
          
          if(len > 0){  
            isload = false;            
            $(".zjList ul").append(html.join(""));
          }else{
            isload = true;
            $('.zjList .loading').html(langData['siteConfig'][21][64]);//暂无数据！
          }
          if(page >= data.info.pageInfo.totalPage){
            isload = true;
            $(".zjList").append('<div class="loading">'+langData['siteConfig'][20][429]+'</div>');
          } 

        }else{
            isload = false;
            $('.zjList .loading').html(langData['siteConfig'][21][64]);//暂无数据！
        }

      },
      error: function(){
          isload = false;
          $('.zjList .loading').html(langData['siteConfig'][20][462]);//加载失败！
      }
  })

}

// 点击关注
$('.follow').off('click').click(function () {

    var t = $(this);
    if (t.hasClass('add_follow')) {
        $.ajax({
            url:  '/include/ajax.php?service=video&action=follow&type=1&temp=video&userid='+followId,
            data: '',
            type: 'get',
            dataType: 'json',
            success: function (data) {
                if (data.state == 100) {
                    $('.sucAdd').show();
                    $('.sucAdd p').text('关注成功');
                    setTimeout(function(){$('.sucAdd').fadeOut()},1500);
                    t.removeClass('add_follow');
                    t.addClass('pitchOn');
                    t.text('已关注');
                    
                } else {
                    alert(data.info);
                    window.location.href = masterDomain + '/login.html';

                }

            }
        })

    } else {
        $.ajax({
            url:  '/include/ajax.php?service=video&action=follow&type=0&temp=video&userid=' + followId,
            data: '',
            type: 'get',
            dataType: 'json',
            success: function (data) {
                if (data.state == 100) {
                    $('.sucAdd').show();
                    $('.sucAdd p').text('取消关注成功');
                    setTimeout(function(){$('.sucAdd').fadeOut()},1500);
                    t.removeClass('pitchOn').addClass('add_follow');
                    t.html('<i></i>关注');
                } else {
                    alert(data.info);
                    window.location.href = masterDomain + '/login.html';

                }

            }
        })

    }
});

})