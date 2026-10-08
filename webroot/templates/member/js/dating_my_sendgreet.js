var atpage = 1, pageSize = 10, totalCount = 0, container = $('.hello-box');
$(function(){
	$("ul.main-tab li").click(function(){
      $(this).addClass("curr").siblings().removeClass("curr");
      getList(1);
  });

	// 删除
	container.delegate('.hello-delete', 'click', function(){
		var t = $(this), item = t.closest('.hello-list');
		$('.hello-desk').show();
		$('.hello-popup').show().data({'item':item});
	})
	// 确定删除
	$('.sure-btn').click(function(){
		var item = $('.hello-popup').data('item'), id = item.attr('data-id');
		$('.hello-desk').hide();
		$('.hello-popup').hide();
		item.remove();
		$.post(masterDomain + '/include/ajax.php?service=dating&action=visitDel&id='+id);
	})
	// 取消删除
	$('#hello-popup-delete, .cancel-btn').click(function(){
		$('.hello-desk').hide();
		$('.hello-popup').hide();
	})

	// 消息弹框
	$('.hello-box .text').click(function(){
		$('.desk').show();
		$('.send-popup').show();
	})
	$('.send-popup .close').click(function(){
		$('.desk').hide();
		$('.send-popup').hide();
	})
	getList();
})

	function getList(tr){
    if(tr){
      atpage = 1;
    }
    container.html('<div class="loading">'+langData['siteConfig'][20][409]+'...</div>');   //正在获取，请稍后
    var act = $('.main-tab .curr').data('id');
    $.ajax({
      url: masterDomain + '/include/ajax.php?service=dating&action=visit&oper=meet&act='+act+'&page='+atpage+'&pageSize='+pageSize,
      type: 'get',
      dataType: 'jsonp',
      success: function(data){
        if(data && data.state == 100){
          var html = [], length = data.info.list.length;
          totalCount = data.info.pageInfo.totalCount;
          if(length){
            for(var i = 0; i < length; i++){
              var d = data.info.list[i];
              var photo = d.member.photo ? d.member.photo : staticPath + 'images/default_user.jpg';
							html.push('<div class="hello-list fn-clear" data-id="'+d.id+'">');
							html.push('	<div class="fn-left">');
							html.push('		<a href="'+d.member.url+'" target="_blank"><img class="portrait" src="'+photo+'" alt=""></a>');
							html.push('		<div class="con fn-left">');
							html.push('			<p class="name"><font class="user">'+d.member.nickname+'</font>'+(d.member.certifyState == "1" ? '<span>'+langData['siteConfig'][29][144]+'</span>' : '')+'</p>');
							//实名
							html.push('			<p class="text">'+d.member.profile+'</p>');
							html.push('		</div>');
							html.push('	</div>');
							var time = d.pubdate.split(' ')[0].split('-');
							time = time[1]+'/'+time[2];
							html.push('	<div class="fn-right time">'+time+'</div>');
							html.push('	<a href="javascript:;"><img class="hello-delete" src="'+templets_skin+'images/hello-delete.png" alt=""></a>');
							html.push('</div>');
            }
            container.html(html.join(""));
          }else{
            container.html('<div class="loading">'+langData['siteConfig'][20][126]+'</div>'); //暂无相关信息
          }
          showPageInfo();
        }else{
        	totalCount = 0;
          showPageInfo();
          container.html('<div class="loading">'+langData['siteConfig'][20][126]+'</div>'); //暂无相关信息
        }
      },
      error: function(){
      	$.dialog.alert(langData['siteConfig'][6][203]);  //网络错误，请重试
      }
    })
  }











