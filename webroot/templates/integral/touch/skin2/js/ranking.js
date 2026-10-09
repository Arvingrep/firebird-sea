$(function(){

    toggleDragRefresh('off');

	var dom = $('#screen'), disk = $('.mask'),
		infoScroll = infoSecScroll = subScroll = null,
		chooseScroll = function(obj){return new iScroll(obj, {vScrollbar: false, mouseWheel: true, click: true});};

  // 筛选框
	$('.tab a').click(function(){
		var $t = $(this), box = $('.choose-local');
    if ($t.hasClass('filter')) {
  		if (box.css("display")=="none") {
  		 	box.show().siblings().hide();dom.hide();
        infoScroll = chooseScroll('choose0');
  		 	disk.show();
  		}else{
  		 	$t.removeClass('active');
  		 	box.hide();disk.hide();
  		}
    }else {
      $t.addClass('active').siblings().removeClass('active');
      getList(1);
    }
	});

  $('.choose-local li').click(function(){

		var $t = $(this), val = $(this).html(), local = $t.closest('.choose-local'),
				id = $t.attr('data-id'), par = $t.parent().parent(), lower = $t.attr('data-lower');

    $t.addClass('active').siblings().removeClass('active');

    if (par.hasClass('fchoose')) {
      if (lower == "1") {
        par.addClass('half');
        par.addClass('half');
        var sub = $t.children('.sub').html();
        sub = sub.replace(/<p/g, '<li');
        sub = sub.replace(/p>/g, 'li>');
        $('#choose1').show().html('<ul>'+sub+'</ul>');

        subScroll = chooseScroll('choose1');
      }else {
	      typeid = id;
        $('#choose0').removeClass('half');
        $('#choose1').hide();
        infoSecScroll = null;
        local.hide();disk.hide();
				getList(1);
      }
    }else {
      typeid = id;
      local.hide();disk.hide();
			getList(1);
    }


	})

  $('#choose1').delegate('li', 'click', function(){
    var $t = $(this), local = $t.closest('.choose-local');
    $t.addClass('active').siblings().removeClass('active');
    $(".typeid").attr("data-id", $t.attr("data-id"));
    local.hide();disk.hide();

    typeid = $t.attr('data-id');
    getList(1);
  })




	// 点击遮罩层
	disk.on('click',function(){
		disk.hide();dom.hide();
		$('.choose-local').hide();
		$('.choose-tab li').removeClass('active');
	})

	// 点击遮罩层
	disk.on('touchmove',function(){
		disk.hide();dom.hide();
		$('.choose-local').hide();
		$('.choose-tab li').removeClass('active');
	})

  getList();

})

var typeid = 0, page = 1, pageSize = 20, totalPage = 0, isload = false;

function getList(first){
  if(first){
    page = 1;
    $('.list').html('');
  }

  if(isload) return;

  var ranking = $('.tab a.active').attr('data-id');

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
            var n = i + 1;
            if(n < 10){
              n = '0' + n;
            }
            html.push('<li class="fn-clear">');
            html.push('  <a href="'+obj.url+'">');
            html.push('   <div class="imgbox fn-left"><img src="'+obj.litpic+'" alt=""></div>');
            html.push('   <div class="txtbox"><p class="title">'+obj.title+'</p><p class="gray"><em class="orange">'+echoCurrency('symbol')+'</em> '+obj.price+' + '+pointName+' <em class="orange">'+obj.point+'</em></p></div>');
            html.push('   <span class="tag">'+n+'</span>');
            html.push('  </a>');
            html.push('</li>');
          }

          $('.loading').hide();
          $('.list').append(html.join(''));

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
