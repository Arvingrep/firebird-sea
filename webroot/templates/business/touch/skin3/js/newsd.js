$(function(){

	  //状态切换
    $(".nav span").bind("click", function(){
        var t = $(this), id = t.find('a').attr("data-id");
        if(!t.hasClass("active")){
            type = id;
            atpage = 1;
            t.addClass("active").siblings("span").removeClass("active");
            $('.newList ul').html('')
            getList();
        }
    });
    function getParameter(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)","i");
      var r = location.search.substr(1).match(reg);
      if (r!=null) return (r[2]); return null;
  }
    var urlSearch = location.search;
    var string = urlSearch.split("=")[1]; //分割取出typeid
    var typeidPram = getParameter("typeid"); //通过getParameter获取
   $(".nav span ").each(function(){
    var t = $(this), id = t.find('a').attr("data-id");
    if(typeidPram == id){
      $(this).click();

      //点击到
      var end = $(this).offset().left + $(this).width() / 2 - $('body').width() /2;
      var star = $(".nav").scrollLeft();
      $('.nav').scrollLeft(end + star);
    }
   })
    function getList(){
        $('.newList ul').html("<p class='loading'>"+langData['siteConfig'][20][184]+"</p>");//加载中，请稍候
        $.ajax({
              url: '/include/ajax.php?service=business&action=news_list&uid='+id+'&page='+atpage+'&typeid='+type,
              type: 'get',
              dataType: 'json',
              success: function(data){
                var totalCount = 0;
                if(data && data.state == 100){
                   $('.newList ul .loading').remove();
                  var list = data.info.list, html = [];
                  for(var i = 0; i < list.length; i++){
                    var time = huoniao.transTimes(list[i].pubdate, 2);
                    html.push('<li>')
                    html.push('  <a href="'+list[i].url+'">')
                    html.push('     <div class="news-txt">')
                    html.push('         <div class="new_title"><h3>'+list[i].title+'</h3></div>')
                    html.push('         <p class="news_type"><span>#'+list[i].typename+'#</span></p>')
                    html.push('         <p class="news-time fn-clear">')
                    html.push('         <span>'+time+'</span><span><i class=""></i>'+list[i].click+'</span></p>')
                    html.push('     </div>')
                    html.push(' </a>')
                    html.push('</li>')
                  }
                  $('.newList ul').append(html.join(""));
                  
                }else{
                    $('.newList ul').html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
                }
              },
              error: function(){
                    $('.newList ul').html("<p class='loading'>"+langData['siteConfig'][20][183]+"</p>");//网络错误，请稍候重试！
              }
        })
    }

})
