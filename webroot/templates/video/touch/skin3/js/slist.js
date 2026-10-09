$(function(){
//获取url中的参数
function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if ( r != null ){
     return decodeURI(r[2]);
  }else{
     return null;
  }
}
var skeyword = decodeURI(getUrlParam('keyword'));
var keyword = '';
if(skeyword !='' && skeyword  != 'null'){
  keyword = skeyword;
  $('#skeyword').val(keyword);
  $('.searchBox .clear_inp').show();
}
//监听input输入
$(".searchBox #skeyword").bind('input propertychange', function () {
    var term = $(this).val();
    if (term!='') {
      $('.searchBox .clear_inp').show();
    }else{
      $('.searchBox .clear_inp').hide();
    }

});
//清除头部input
$(".searchBox").delegate('.clear_inp', 'click', function(event) {
  $(".searchBox #skeyword").val('');
  $(this).hide();

});
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
  $('.video_list .loading').remove();
  $(".video_list").append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...
  
  $.ajax({
      url : '/include/ajax.php?service=video&action=alist&pageSize=10&page=' + page + '&title='+keyword+'&orderby=2',
      data : '',
      type : 'get',
      dataType : 'json',
      success : function (data) {
        if(data.state == 100){
          $(".video_list .loading").remove();
          var list = data.info.list,len = list.length, html = [];
          for (var i = 0; i < len; i++) {
              var pic = list[i].litpic!='' && list[i].litpic != undefined ? list[i].litpic : "/static/images/404.jpg";
              var photo = list[i].user.photo!='' && list[i].user.photo != undefined ? list[i].user.photo : "/static/images/404.jpg";
              html.push('<li>');
              html.push('  <div class="top_img">');             
              html.push('     <a href="'+list[i].url+'">');
              html.push('     <img src="'+pic+'" onerror="javascript:this.src=\''+staticPath+'images/404.jpg\';this.onerror=this.src=\''+staticPath+'images/noPhoto_100.jpg\';">');
              html.push('     <div class="scInfo">');
              if(list[i].click > 0){
                html.push('    <span class="see"><em>'+list[i].click+'</em>次观看</span>');
              }
            if(list[i].times){
              html.push('     <span class="time">'+list[i].times+'</span>');
            }
              html.push('     </div>');
              html.push('     <div class="need">');
              var str1 = str2 ='';
              if(list[i].videocharge ==3){
                  str1 = ' <span class="money">'+langData['video'][0][1]+'</span>';
              }
              if(list[i].videocharge ==1){
                  str2 = ' <span class="vip">VIP</span>';
              }
              html.push('       '+str1+str2+'');
              html.push('     </div>');
              html.push('     </a>');
              html.push('   </div>');             
              html.push('   <div class="vInfo">');
              html.push('     <h3><a href="'+list[i].url+'">'+list[i].title+'</a></h3>');
              html.push('</div>');
              html.push('</li>');
          }

          
          if(len > 0){  
            isload = false;            
            $(".video_list ul").append(html.join(""));
          }else{
            isload = true;
            $('.video_list .loading').html(langData['siteConfig'][21][64]);//暂无数据！
          }
          if(page >= data.info.pageInfo.totalPage){
            isload = true;
            $(".video_list").append('<div class="loading">'+langData['siteConfig'][20][429]+'</div>');
          } 
          $('.vInfo h3 a').each(function(){
            var txt = $(this).text();
            var wordArr = txt.split(keyword);
            var wordTxt = wordArr[0]+'<em class="red">'+keyword+'</em>'+wordArr[1];
            $(this).html(wordTxt);
          })

        }else{
            isload = false;
            $('.video_list .loading').html(langData['siteConfig'][21][64]);//暂无数据！
        }

      },
      error: function(){
          isload = false;
          $('.video_list .loading').html(langData['siteConfig'][20][462]);//加载失败！
      }
  })

}


})
