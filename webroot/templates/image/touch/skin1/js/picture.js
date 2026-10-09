$(function(){

  var device = navigator.userAgent;
  if (device.indexOf('huoniao_iOS') > -1) {
    $('body').addClass('huoniao_iOS');
    $('.nav .btn_l').hide();
    // $('.areaChose').bind('click', function(e){
    //   e.preventDefault();
    //   setupWebViewJavascriptBridge(function(bridge) {
    //     bridge.callHandler('goToCity', {'module': 'image'}, function(){});
    //   });
    // });
  }


  $('img').scrollLoading();

  // 滚动图片
  $('#picscroll').slider();


    // 显示/隐藏全部导航
    $('#btn_toggle').click(function(){
    	var nav = $('.nav'),p = $('.navbox');
        $('.nav_content').toggleClass('open')

        var h = $('#nav_list').height();
        var last = $('#nav_list .item:last');
        var left = last.position().left, w = last.width();
        if(left+w + $('.btn_r').width() >= $('.navbox').width()) {
            p.css('padding-bottom', '.82rem');
        }
    })


	var mySwiper = new Swiper('.tjlist .swiper-container', {
		autoplay: 3000,
	    slidesPerView: 'auto',
	    direction : 'horizontal'
	})
	var mySwiper = new Swiper('.pic_1 .swiper-container', {
		autoplay: 3000,
	    slidesPerView: 'auto',
	    direction : 'horizontal'
	})

	// 潮范
	$('.pic_4 a').click(function(){
		$('.frist_list').addClass('sho_w').animate({"left":"0"},200);
		// $('.qiqi').removeClass('siqi');
	})
	$('.top .back_btn').click(function(){
		$('.frist_list').animate({"left":"100%"},200);
	})

	$('.more_display').click(function(){
    atpage++;
		ajaxNews();
	})


	// 搜索
	$('.keywords').focus(function(){
		var keywords = $('.keywords').val();
		var list = searchkey('get');
		if(list){
			html = [];
			for(var i = 0; i < list.length; i++){
				html.push('<li class="item"><a href="#">'+list[i]+'</a><span></span></li>');
			}
			html.push('<li><a href="javascript:;" class="clear">清除数据</a></li>')
			$('.history').html(html.join("")).show();
		}
	}).blur(function(){
		setTimeout(function(){
			$('.history').hide();
		},10)
	})
	// 点击历史记录
	$('.history').delegate("li.item","click",function(){
		var t = $(this), str = t.children('a').text();
		searchkey('update',str);
		$('.keywords').val(str);
		$('.search').submit();
	})

	//清除历史记录
	$('.history').delegate('.clear', 'click',function(){
		$.cookie('keywords','');
	})
	$('.submit').click(function(){
		var keywords = $('.keywords').val();
		if(keywords == ''){
			alert('请输入关键词');
		}else{
			searchkey('update',keywords);
		}
		$('.search').submit();
	})



  ajaxNews();


	function ajaxNews(){
		$.ajax({
			url: "/include/ajax.php?service=image&action=alist&pageSize=10&group_img=1&page="+atpage,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state != 200){
					if(data.state == 101){
						$("#list").html("<p class='loading'>"+data.info+"</p>");
					}else{
						var list = data.info.list, html = [], html1 = [];
						for(var i = 0; i < list.length; i++){
							var item        = [],
									id          = list[i].id,
									title       = list[i].title,
									url         = list[i].url,
									common      = list[i].common,
									litpic      = list[i].litpic,
									description = list[i].description;

							if(list[i].group_img){
								item.push('<a href="'+url+'">');
								item.push('<ul class="miss_you">');
								item.push('<li class="value_per">'+title+'</li>');
								item.push('<li class="fn-clear tupian">');
								for (var g = 0; g < list[i].group_img.length && g < 3; g++) {
									item.push('<img src="'+list[i].group_img[g].path+'" class="l">');
								};

                if (list[i].group_img.length >= 3) {
                  item.push('<i>'+list[i].group_img.length+'</i>');
                  item.push('<em class="which"></em>');
                }
								item.push('</li>');
								item.push('<li class="online_info">'+list[i].source+'</li>');
								item.push('</ul>');
								item.push('</a>');
							}
							html.push(item.join(""));
						}
						$("#list").append(html.join(""));
						if(list.length > 10){
							// $("#list").append('<span class="mnbtn" data-url="'+href+'"><a href="javascript:;">再显示10条新闻</a></span>');
						}else{
							// $("#list").append('<span class="mnbtn" data-url="'+href+'" style="block;"><a href="javascript:;" style="background:none;">查看更多要闻</a></span>');
						}
					}
				}else{
					$("#list").html("<p class='loading'>数据获取失败，请稍候访问！</p>");
				}
			},
			error: function(){
				$("#list").html("<p class='loading'>数据获取失败，请稍候访问！</p>");
			}
		});
	}







	function searchkey(type,key){
		var history = $.cookie('keywords'), list = [];
		if(history != '' && history != null && history != 0){
			list = history.split("|");
		}
		if(type == 'get'){
			return list;
		}
		if(type == 'update'){
			for(var i in list){
				if(key == list[i]){
					list.splice(i,1);
				}
			}
			if(list.length >= 10){
				list.pop();
			}
			list.unshift(key);
			$.cookie('keywords',list.join("|"));
		}
	}
})
