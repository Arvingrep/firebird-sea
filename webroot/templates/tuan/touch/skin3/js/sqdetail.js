$(function(){
	$('.appMapBtn').attr('href', OpenMap_URL);

	var atpage = 1, isload = false, lng='', lat='', CLASSID = 0;
	HN_Location.init(function(data){
		if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
	      	$(".business").append('<div class="loading">定位失败,请重新刷新页面！</div>');
	  	}else{
		  lng = data.lng, lat = data.lat;
		  onefindList(CLASSID,1);
	  	}
	  	window.addEventListener("mousewheel", (e) => {
		   if (e.deltaY === 1) {
		     e.preventDefault();
		   }
		});
	});

	var xiding = $(".nav-outer"),chtop = parseInt(xiding.offset().top);

	$('.nav-box a').click(function(){
	    var b = $(this), index = b.index();
	    active = index;
	    if(!b.hasClass('on')){
	      CLASSID = b.data('id');
	      onefindList(CLASSID,1);
	      b.addClass('on').siblings().removeClass('on');
	    }
	    $('.nav-info a').eq(active).addClass("on").siblings().removeClass("on")
	});
  $('.nav-info a').click(function(){
    // flashList();
    var b = $(this), index = b.index();
    active = index;
    if(!b.hasClass('on')){
      b.addClass('on').siblings().removeClass('on');
    }
    $('.nav-box a').eq(active).click();
    $('.c_switch').hide();
    $('.arrow-down').removeClass('active');
  });
$(".nav-box a").eq(0).click();

var mySwiper = new Swiper('.nav-box',{
    initialSlide : 0,
    slidesPerView : "auto",
    freeMode : true,
    freeModeSticky : true,
    slideToClickedSlide:true
})


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

	$('.inp').delegate('#search', 'click', function(){
	  	onefindList(CLASSID,1);
	});


//onefindList();
function onefindList(id,tr){
	if(tr){
		atpage = 1;
		$(".business ul").html("");
  	}
  	isload = true;

	var data = [];
	if($("#keywords").val() != ''){
		data.push("search="+$("#keywords").val());
	}
  	data.push("page="+atpage);

  	$(".business .loading").remove();
	$(".business").append('<div class="loading">加载中...</div>');

  	$.ajax({
		url: "/include/ajax.php?service=tuan&action=storeList&pageSize=10"+'&lng='+lng+'&lat='+lat+'&typeid='+id+"&circle="+detail_id,
		data: data.join("&"),
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data.state == 100){
				$(".business .loading").remove();
				var list = data.info.list, html = [];
				if(list.length > 0){
					for(var i = 0; i < list.length; i++){
						 html.push('<li class="fn-clear">');
						 html.push('<a href="'+list[i].url+'">');
						 html.push('  <div class="s_img"><img src="'+list[i].litpic+'"></div>');
						 html.push('  <div class="s_title">');
						 html.push('     <div class="bus_txt fn-clear"><span class="bus_txt_title business-txt">'+list[i].company+'</span></div>');
						 html.push('      <p class="tuan"><span>发布团购<em>'+list[i].tuannum+'</em></span><span>综合评分<em>'+list[i].rating+'分</em></span></p>');
						 if(list[i].vouchers!=''){
						 	html.push('     <div class="quan fn-clear"><span>券</span><span>'+list[i].vouchers+'</span></div>');
						 }
						 html.push('     <div class="addr fn-clear"><span><em>'+list[i].shortaddress+'</em>&nbsp;<em>'+list[i].distance+'</em></span><div class="aa">进入店铺</div></div>');
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
				$(".list").append('<div class="loading"></div>');
				$(".business .loading").html(data.info);
			}
		},
		error: function(){
			isload = false;
			$(".business").html('<div class="loading">网络错误，加载失败！</div>');
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
	}
});



});