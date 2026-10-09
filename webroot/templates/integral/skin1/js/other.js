$(function(){

	// --------------------------------排行榜
	//----左侧一级分类
	$('.rank-tp-list li .m').click(function(){
		var $this = $(this),
			$p = $this.parent('li'),
			$dl = $this.siblings('dl'),
			id = $this.attr('data-id');
		if($p.hasClass('on')){
			if($dl.find('a.curr').length == 0){
				$dl.slideUp(200,function(){
					$p.removeClass('on');
				})
				typeid = -1;
				console.log(typeid)
			}
		}else{
			$dl.slideDown(200,function(){
				$p.addClass('on');
			})
		}
		$p.siblings().removeClass('on').find('dl').slideUp();
		$('.rank-tp-list li dd a').removeClass('curr');

		if(typeid != id){
			typeid = typeid < 0 ? 0 : id;
			getList();
		}

	})

	$('.rank-tp-list li dd a').click(function(){
		var t = $(this), id = t.attr('data-id');
		if(t.hasClass('curr')) return;
		$('.rank-tp-list li dd a').removeClass('curr');
		t.addClass('curr');
		typeid = id;
		getList();
	})


	//排行榜
	$('.rankbox-right .tab-ul li').click(function(){
		$(this).addClass('on').siblings('li').removeClass('on');
		getList();
	})

	changeRankNo();
})

var typeid = 0, page = 1, pageSize = 20, totalPage = 0, isload = false;

function getList(first){
  $('.main').html('');

  if(isload) return;

  var ranking = $('.rankbox-right .tab-ul li.on').attr('data-id');

  $('.loading').html('正在获取，请稍后').show();

  isload = true;

  var data = [];
  data.push('typeid='+typeid);
  data.push('orderby=1');
  data.push('ranking='+ranking);
  $.ajax({
    url: '/include/ajax.php?service=integral&action=slist&page='+page+'&pageSize='+pageSize,
    type: 'get',
    data: data.join('&'),
    dataType: 'json',
    success: function(data){
      if(data && data.state == 100){
        var list = data.info.list, len = list.length, html = [];
        totalPage = data.info.pageInfo.totalPage;

        if(len){
          for(var i = 0; i < len; i++){
            var obj = list[i];
			html.push('<li>');
			html.push('	<div class="rank item"><i></i></div>');
			html.push('	<div class="name item">');
			html.push('		<div class="pic"><a href="'+obj.url+'" target="_blank"><img src="'+obj.litpic+'" alt="'+obj.title+'"></a></div>');
			html.push('		<div class="des"><a href="'+obj.url+'" target="_blank">'+obj.title+'</a></div>');
			html.push('	</div>');
			html.push('	<div class="integral item">');
			html.push('		<div>'+pointName+'：<span>'+obj.point+'</span></div>');
			html.push('	</div>');
			html.push('	<div class="linebg"></div>');
			html.push('</li>');
          }
          $('.loading').hide();
          $('.main').html(html.join(''));
          $('.max').text(len);
          setTimeout(function(){
          	changeRankNo();
          },100)
          
        }else{
          if(totalPage == 0){
            $('.loading').html('暂无相关商品').show();
          }else{
            $('.loading').html('已加载全部商品').show();
          }
        }

        isload = false;

      }else{
        $('.loading').html('暂无相关商品').show();
        isload = false;
      }
    },
    error: function(){
      $('.loading').html('网络错误，加载失败！').show();
      isload = false;
    }
  })
}


function changeRankNo(){
	$('.rank-type-list li').each(function(e){
		var pos = '0 -' + e*22 + 'px';
		var t = 'background .2s '+ 0.2 * e+'s';
		$(this).find('i').css({'background-position':pos, 'transition': t});
	})
}

