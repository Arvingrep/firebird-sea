$(function(){

  // 点击查看大图
  initPhotoSwipeFromDOM('.my-gallery');

  // 评论切换
  $('.elv-tab a').click(function(){
    var t = $(this);
    t.addClass('active').siblings('a').removeClass('active');
  })

  // 评价图片尺寸
  $('.my-gallery figure').each(function(){
    var t = $(this), a = t.find('a'), img = t.find('img'), imgSrc = img.attr('src');
    getImageSize(imgSrc,function(width, height){
  		a.attr('data-size', width+'x'+height);
  	});
  })


  // 获取图片的真实尺寸
  function getImageSize(url,callback){
  	var img = new Image();
  	img.src = url;

  	// 如果图片被缓存，则直接返回缓存数据
  	if(img.complete){
  	  callback(img.width, img.height);
  	}else{
      // 完全加载完毕的事件
  	  img.onload = function(){
  		  callback(img.width, img.height);
  	  }
    }
  }

  // 点击回复
  $('.list').delegate('.replyBtn', 'click', function(){
    var t = $(this), item = t.closest('.item'), reply = item.find('.reply-more'), textarea = reply.find('textarea');
    if (reply.css('display') == 'none') {
      $('.reply-more').hide();
      $('.replyBtn').text(langData['siteConfig'][6][29]);//回复
      reply.show();
      textarea.val("");
      t.text(langData['siteConfig'][45][99]);//收起回复
    }else {
      reply.hide();
      textarea.val("");
      t.text(langData['siteConfig'][6][29]);//回复
    }
  })



})
