$(function(){
	var URL = location.href;
	var URLArrary = URL.split('?');
	var CLASSID = URLArrary[1] && parseInt(URLArrary[1]) ? parseInt(URLArrary[1]) : 0;

	var xiding = $(".nav-outer"),chtop = parseInt(xiding.offset().top);
	var atpage = 1, isload = false;

	$('.nav-box a').click(function(){
	    var b = $(this), index = b.index(), active = index;
	    CLASSID = b.data('id');
	    if(!b.hasClass('on')){
	      onefindList(CLASSID,1);
	      b.addClass('on').siblings().removeClass('on');
	    }
	    $('.nav-info a').eq(active).addClass("on").siblings().removeClass("on")
    });

	$(".nav-box a").eq(0).click();

	  var mySwiper = new Swiper('.nav-box',{
	      initialSlide : 0,
	      slidesPerView : "auto",
	      freeMode : true,
	      freeModeSticky : true,
	      slideToClickedSlide:true
	  });


$(".nav-box a").click(function(){
  var t = $(this), left = t.offset().left, index = t.index();
  var mg = t.css('margin');
  var mgl = mg.split(' ')[1];
  mgl = parseInt(mgl);
  var com = $('.swiper-wrapper');
  var comleft = com[0].style.transform;
  if(comleft){
    comleft = comleft.split('(')[1];
    comleft = comleft.split(',')[0];
    comleft = parseInt(comleft);
  }else{
    comleft = 0;
  }
  if(index > 0){
    var prev = t.prev(), preveWidth = prev.width();
    if(left <= (preveWidth + mgl)){
        var newLeft = comleft + (preveWidth + mgl * 2);
        $(".swiper-wrapper").css({'transition-duration':'200ms', transform:'translate3d('+newLeft+'px, 0, 0)'})
        setTimeout(function(){
          $(".swiper-wrapper").css({'transition-duration':0});
        },200)
    }else{
      var conw = com.width();
      if(left > conw + mgl){
        new Swiper('.nav-box',{
            initialSlide : index,
            slidesPerView : "auto",
            freeMode : true,
            freeModeSticky : true,
            slideToClickedSlide:true
        })
      }
    }
  }else{
    $(".swiper-wrapper").css({'transition-duration':'200ms', transform:'translate3d(0, 0, 0)'})
    setTimeout(function(){
      $(".swiper-wrapper").css({'transition-duration':0});
    },200)
  }
})


	// 吸顶
	$(window).on("scroll", function() {
		var thisa = $(this);
		var st = thisa.scrollTop();
		if (st >= chtop) {
			$(".nav-outer").addClass('choose-top');
			$('.business').css('margin-top','1rem');
			if (device.indexOf('huoniao_iOS') > -1) {
				$(".nav-outer").addClass('padTop20');
			}
		} else {
			$(".nav-outer").removeClass('choose-top padTop20');
			$('.business').css('margin-top','0');
		}
	});
	$('.business').delegate('li', 'click', function(){
		var t = $(this), a = t.find('a'), url = a.attr('data-url');
		if(!wx_miniprogram) {
            setTimeout(function () {
                location.href = url;
            }, 500);
        }

	})


	onefindList(CLASSID,1);

	$('.inp').delegate('#search', 'click', function(){
	  	onefindList(CLASSID,1);
	});

	function onefindList(id,tr){
		if(tr){
		    atpage = 1;
			$(".business ul").html('');
		}
		var url = "";
		if(id==0){
			url = "/include/ajax.php?service=tuan&action=tlist&iscity=1&pin=1";
		}else{
			url = "/include/ajax.php?service=tuan&action=tlist&iscity=1&pin=1&typeid="+id;
		}
		$(".business .loading").remove();
		$(".business").append('<div class="loading">加载中...</div>');

		var data = [];
		data.push("page="+atpage);
		data.push("pageSize=10");
		if($('#keywords').val()!=''){
			data.push("title="+$('#keywords').val());
		}
		$.ajax({
			url: url,
			data: data.join("&"),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data){
					if(data.state == 100){
						$(".business .loading").remove();
						var list = data.info.list, html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								html.push('<li class="fn-clear">');
								html.push(`<a class="btn_03 toMini" href="javascript:void(0);" data-temp="detail" data-module="tuan" data-id="${list[i].id}" data-url=${list[i].url}>`);
							    html.push('  <div class="s_img"><img src="'+list[i].litpic+'"></div>');
							    html.push('  <div class="s_title">');
							    html.push('     <div class="bus_txt fn-clear"><span class="bus_txt_title">'+list[i].title+'</span></div>');
							    html.push('     <div class="pintuan_money"><span>'+echoCurrency('symbol')+'<em>'+list[i].pinprice+'</em></span><span>单买价:'+echoCurrency('symbol')+''+list[i].price+'</span></div>');
							    var state = '';
						        if(list[i].state==1){
									state = '<div class="btn_03 aa">已结束</div>';
						        }else if(list[i].state==2){
									state = '<div class="btn_01 aa">已抢完</div>';
						        }else if(list[i].state==3){
									state = '<div class="btn_01 aa">立即拼团</div>';
						        }
							    html.push('     <div class="addr fn-clear"><span><em>'+list[i].pinnum+'人已拼</em></span>'+state+'</div>');
							    html.push('   </div>');
							    html.push('</a>');
							    html.push('</li>');
							}
							$(".business ul").append(html.join(""));
							isload = false;
							//最后一页
							if(atpage >= data.info.pageInfo.totalPage){
								isload = true;
								$(".business").append('<div class="loading">已经到最后一页了</div>');
							}
						}else{
							isload = true;
							$(".business").append('<div class="loading">暂无相关信息</div>');
						}
					}else{
						$(".business .loading").html(data.info);
					}
				}else{
					$(".business .loading").html('加载失败！');
				}
			},
			error: function(){
				isload = false;
				$(".business .loading").html('网络错误，加载失败！');
			}
		});
	};

  $(window).scroll(function() {
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - w;
    if ($(window).scrollTop() >= scroll && !isload) {
      atpage++;
      isload = true;
      onefindList(CLASSID);
    };
  });






});