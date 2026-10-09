$(function(){
    //
    var atpage = 2,isload = 0;
    //状态切换
	$(".albumsnav span").bind("click", function(){
		var t = $(this), id = t.find('a').attr("data-id");
		if(!t.hasClass("active")){
			type = id;
			atpage = 1;
			isload = 0;
			t.addClass("active").siblings("span").removeClass("active");
			$('#picobj').html('')
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
   $(".albumsnav span ").each(function(){
    var t = $(this), id = t.find('a').attr("data-id");
    if(typeidPram == id){
      $(this).click();

      //点击到
      var end = $(this).offset().left + $(this).width() / 2 - $('body').width() /2;
      var star = $(".albumsnav").scrollLeft();
      $('.albumsnav').scrollLeft(end + star);
    }
   })
    function getList(){
    	if(isload) return false;
    	isload = 1;
    	$('#picobj').append("<p class='loading'>"+langData['siteConfig'][20][184]+"</p>");//加载中，请稍候
    	var type = $(".albumsnav span.active a").attr('data-id');
        $.ajax({
              url: '/include/ajax.php?service=business&action=albums_list&uid='+id+'&page='+atpage+'&typeid='+type,
              type: 'get',
              dataType: 'json',
              success: function(data){
                var totalCount = 0;
                if(data && data.state == 100){
                   $('#picobj .loading').remove();
                  var list = data.info.list, html = [];
                  for(var i = 0; i < list.length; i++){
                  	html.push('<figure itemprop="associatedMedia" itemscope="" itemtype="" class="swiper-slide">')
                  	html.push('	<a href="'+list[i].litpic+'" itemprop="contentUrl" data-size="800x800" class="picarr" id="pic0">')
                  	html.push('		<div class="img-box"><img src="'+list[i].litpic+'" itemprop="thumbnail" alt="Image description"></div>')
                  	html.push(' 	<p><span>'+list[i].typename+'</span></p>')
                  	html.push(' </a>')
                  	html.push('</figure>')
                  }
                  $('#picobj').append(html.join(""));
                  atpage++;
                  isload = 0;
                  if(atpage > data.info.pageInfo.totalPage){
                    isload = 1;
                  }
                }else{
                	$('#picobj').append("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
                }
              },
              error: function(){
              		$('#picobj .loading').remove();
					$('#picobj').append("<p class='loading'>"+langData['siteConfig'][20][183]+"</p>");//网络错误，请稍候重试！
              }
        })
    }

	function auto_data_size(){
		var imgss= $("figure img");
		$("figure img").each(function() {
			var imgs = new Image();
			imgs.src=$(this).attr("src");
			var w = imgs.width,
			h =imgs.height;
			$(this).closest("a").attr("data-size","").attr("data-size",w+"x"+h);
		})
	};
	auto_data_size();


	$(window).scroll(function(){
		var sct = $(window).scrollTop();
		var scw = sct + $(window).height() + 100;
		var bh = $('body').height()
		if(scw >= bh && !isload){
			getList();
		}
		
	})
});