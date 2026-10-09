$(function() {

	var device = navigator.userAgent;
  if (device.indexOf('huoniao_iOS') > -1) {
    $('body').addClass('huoniao_iOS');
  }

	var height = $(window).height()-$('.photo-head-h').height()-$('.by_day').height();
	$('.swiper-container,.swiper-slide').css({'height':height,'opacity':1});
	$('.swiper-slide').css('line-height',height+'px');

	var mySwiper = new Swiper('.swiper-container', {
		observer:true,//修改swiper自己或子元素时，自动初始化swiper
    observeParents:true,//修改swiper的父元素时，自动初始化swiper
		onSlideChangeStart: function(swiper){
			getImage(swiper.activeIndex);
		}
	});

	$('#Gallery').delegate('li', 'touchend', function(){
		var t = $(this), index = t.index(), parent = t.closest('ul'), length = parent.find('li').length;
		if (index == length - 2) {
			getData(function(data){
				if(data && data.imglist.length > 0){

					next = t.next();
					nextLen = next.length;
					if(nextLen == 0){
						$(this).addClass('disabled');
					}else{
						next.click();
					}
				}else{
					havemore = false;
				}
			});
		}
	})

	// mySwiper.swipeTo(atPage, 100, false);
	getImage(atPage);


	function getImage(index){
		var li = $(".swiper-container li:eq("+index+")"), type = li.data("type"), img = li.find("img"), src = img.data("src"), alt = img.attr("alt");

		img.attr("src", src);
		$(".f14").html(alt);

	}

	$('.swiper-container').click(function(){
		if ($('.pic-int').css("display")=="none") {
			$('.pic-int,.f10,.btn-box').show();
		}else{
			$('.pic-int,.f10,.btn-box').hide();
		}
	})

	$('body').on('touchmove', function(){

	})

	function getData(callback){
		isload = true;
		$.ajax({
			url: masterDomain+'/include/ajax.php?service=image&action=nextData&id='+pageid,
			dataType: 'jsonp',
			success: function(data){

				if(data.state == 100){

					var info    = data.info,
						id      = info.id,
						typeid  = info.typeid,
						typeName = info.typeName,
						typeUrl = info.typeUrl,
						title   = info.title,
						url     = info.url,
						imglist = info.imglist,
						from    = info.source,
						fromUrl = info.sourceurl;

					pageid = id;

					length += imglist.length;

					var html = [];
					var lastGroup = parseInt($('.listul li').last().attr('data-group'));

					for(var i = 0; i < imglist.length; i++){
						html.push('<li class="swiper-slide"><img src="'+imglist[i].path+'" alt="'+(i+1)+'/'+imglist.length+'" class="swiper-lazy"><div class="swiper-lazy-preloader"></div><div class="font_scroll"><span>'+imglist[i].info+'</span></div></li>')
					}

					$('#Gallery').append(html.join(""));

					// 重新初始化swiper
					mySwiper.reInit();
                    $('.swiper-container,.swiper-slide').css({'height':height,'opacity':1});
					$('.swiper-slide').css('line-height',height+'px');


					var newGroup = {
						'id': id,
						'typeid': typeid,
						'typeName': typeName,
						'typeUrl': typeUrl,
						'title': title,
						'url': url,
						'picnum': imglist.length,
						'from': from,
						'fromUrl': fromUrl
					}
					pageInfo.push(newGroup);

					if(typeof callback == 'function'){
						callback(data.info);
					}

					// setThumbWidth(true);

				}

				isload = false;

			},
			error: function(){
				isload = false;

				if(typeof callback == 'function'){
					callback(data.info);
				}
			}
		})
	}







})
