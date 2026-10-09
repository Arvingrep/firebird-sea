$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');
    //地址跳转
	$('.appMapBtn').attr('href', OpenMap_URL);
    // banner轮播图
  	var bannerS = new Swiper('.banner #banContainer', {pagination:{ el: '.banner .pagination',} ,slideClass:'swiper-slide',loop: false,grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,}});

	//判断是否有广告
	if($(".advbox .siteAdvObj").length == 0){
		$(".advbox").remove();
	}
	//商家广告位
	new Swiper('.advbox .swiper-container', {pagination: {el: '.advbox .swiper-pagination',type: 'fraction',} ,autoplay: true,loop: true,grabCursor: true,paginationClickable: true,
	});

  	// 图片放大
    var videoSwiper = new Swiper('.videoModal .swiper-container', {pagination: {el:'.videoModal .swiper-pagination',type: 'fraction',},loop: false})
    $(".topSwiper").delegate('.swiper-slide', 'click', function() {
        var imgBox = $('.topSwiper .swiper-slide');
        var i = $(this).index();
        $(".videoModal .swiper-wrapper").html("");
        for(var j = 0 ,c = imgBox.length; j < c ;j++){
            if(j==0){
                if(detail_video!=''){
                    $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><video width="100%" height="100%" controls preload="meta" x5-video-player-type="h5" x5-playsinline playsinline webkit-playsinline  x5-video-player-fullscreen="true" id="video" src="'+detail_video+'"  poster="' + imgBox.eq(j).find("img").attr("src") + '"></video></div>');
                }else{
                    $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><img src="' + imgBox.eq(j).find("img").attr("src") + '" / ></div>');
                }
            }else{
                $(".videoModal .swiper-wrapper").append('<div class="swiper-slide"><img src="' + imgBox.eq(j).find("img").attr("src") + '" / ></div>');
            }

        }
        videoSwiper.update();
        $(".videoModal").addClass('vshow');
        $('.markBox').toggleClass('show');
        videoSwiper.slideTo(i, 0, false);
        return false;
    });


    $(".imgCout").click(function(){
    	$(".topSwiper .swiper-slide-active").click()
    })

    $(".videoModal").delegate('.vClose', 'click', function() {
        var video = $('.videoModal').find('video').attr('id');
        $(video).trigger('pause');
        $(this).closest('.videoModal').removeClass('vshow');
        $('.videoModal').removeClass('vshow');
        $('.markBox').removeClass('show');
    });
	var listArr = [];
	//判断是否有广告
  	if($(".advbox .siteAdvObj").length == 0){
      $(".advbox").remove();
    }

    $(".zhizhaoBox .rz").click(function(){
    	$(this).find('a').click()
    })
/**************20210524新增****************/
// 倒计时
if($('.cutTime').size() > 0){
	var timer = setInterval(function(){
	  $('.cutTime').html( timerCut())
	},1000)
}
function timerCut(){
  var timenow = new Date();
			timenow = timenow.valueOf();
  			var ktime = $('.kanjiaBox').attr('data-ktime');
  			var etime = $('.kanjiaBox').attr('data-etime');
  			var txt = '';
  			var timeEnd = 0;
  			if(ktime*1000 > timenow){
              timeEnd = ktime;
              txt = '距开始'
            }else {
              timeEnd = etime;
              txt = '距结束'
            }
  			if(ktime*1000 > timenow){
              $('.kj_img label').text('即将开始')
            }else{
              $('.kj_img label').text('即将结束')
            }
			timeEnd = timeEnd*1000;
			timeCount = parseInt((timeEnd - timenow)/1000)

			if(timeCount < 0){
				clearInterval(timer)
				return;
			}
			var time = timeCount;
			var d = parseInt(time / (60 * 60 * 24));
			var h = parseInt(time / 60 / 60 % 24);
			var m = parseInt(time / 60 % 60);
			var s = parseInt(time % 60);
      var html = txt+'<span class="hh">'+(h>9?h:'0'+h)+'</span><em>:</em><span class="mm">'+(m>9?m:'0'+m)+'</span><em>:</em><span class="ss">'+(s>9?s:'0'+s)+'</span>'
			return html;
}



// 领券滑动
if($(".quanbox li").length > 1){
  new Swiper('.quanbox.swiper-container',{
    slidesPerView: 'auto',
  });
}

if($(".baoreBox .swiper-slide").length > 0){
	$('.baoreBox').removeClass('fn-hide');
  var baoreS = new Swiper('.baoreBox .swiper-container', {pagination:{ el: '.baoreBox .pagination',} ,slideClass:'swiper-slide',loop: true,grabCursor: true,paginationClickable: true,autoplay:{delay: 2000,}});
}


// 显示店铺详情

$(".shopInfo .shopTop,.shopInfo .openInfo").click(function(){
  $(".shopMask,.shopDetailBox").show();
  $('html').addClass('noscroll')
  $('.shopDetailBox').css('transform',"translateY(0)");
  setTimeout(function(){
    $('.shopDetailBox').css('transform',"none");
  },300)
})
$('.shopMask').click(function(){
	$('.shopDetailBox').css('transform',"translateY(100%)");
    setTimeout(function(){
      $(".shopMask,.shopDetailBox").hide();
      $('html').removeClass('noscroll')
    },300)
})


// 查看所有商品
$('.shopDetailBox').click(function(e){
  if(e.target == $('.shopDetailBox')[0]){
    $('.shopDetailBox').css('transform',"translateY(100%)");
    setTimeout(function(){
      $(".shopMask,.shopDetailBox").hide();
      $('html').removeClass('noscroll')
    },300)
  }
})

//查看所有优惠
$('.btn_to_pro').click(function(){
	var sctop = $('.shop_container').offset().top;
	$('.shopDetailBox').css('transform',"translateY(100%)");
    setTimeout(function(){
      $(".shopMask,.shopDetailBox").hide();
      $('html').removeClass('noscroll');
      document.scrollingElement.scrollTop = sctop;

    },500)


})


	// 关注
	$('.shopCollect .collectInfo,.collectBus,.btn-care').click(function(){
        var t = $(this), type = t.hasClass("cared") ? "del" : "add";
        var userid = $.cookie(cookiePre+"login_user");
	    if(userid == null || userid == ""){
	      location.href = masterDomain + '/login.html';
	      return false;
	    }
	    if(type == 'add'){
	    	t.addClass('cared niceIn');
		     setTimeout(function() {
	           $('.shopCollect .collectInfo,.collectBus,.btn-care').removeClass('niceIn');
	        }, 500)
	    }
	    
      	$.post("/include/ajax.php?service=member&action=collect&module=shop&temp=store-detail&type="+type+"&id="+storeid,function(data,status){
	        if(type == 'add'){
	            $('.shopCollect .collectInfo,.collectBus,.btn-care').addClass('cared');
	            // $('.collectBus').addClass('curr');
	            $('.buscollect h2,.collectBus p,.btn-care').html('已关注');
	            $('.buscollect p').html('订阅商家动态');

	            
	           
	           
	        }else{
	            $('.shopCollect .collectInfo,.collectBus,.btn-care').removeClass('cared');
	            $('.buscollect h2,.collectBus p').html('关注商家');
	            $('.btn-care').html('关注');
	            $('.buscollect p').html(colNum+'人已关注');
	             $('.collectBus').removeClass('curr');
	        }

        });
    });


	var windowTop = 0;
	// 下拉加载
	var isload = false,atpage = 1,pageSize = 20;
	var titleTop=$('.shopTop').offset().top;

	$(window).scroll(function() {
		var scrolls = $(window).scrollTop();
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w;
		if (scrolls + 50 > scroll && !isload) {
			var atpage = parseInt($('.headbox .curr').attr('data-page')),
            totalPage = parseInt($('.headbox .curr').attr('data-totalPage'));
            if (atpage < totalPage) {
                ++atpage;
                $('.headbox .curr').attr('data-page', atpage);
                getList();
            }
		};

		//滚动标题固定
		if(scrolls > titleTop){
			var headTxt = $('.shopInfo .shopTop h2').html();
			$('.header-address span').html(headTxt);
			$('.header').removeClass('transparent');
		}else{
			$('.header-address span').html('');
			$('.header').addClass('transparent');
		}

		//滚动隐藏底部
		if (scrolls >= windowTop) { //当B>A时，表示页面在向上滑动
			//需要执行的操作
			windowTop = scrolls;
			$('.contact_box').css('transform',"translateY(100%)");

		} else { //当B<a 表示手势往下滑动
			//需要执行的操作
			windowTop = scrolls;

		}
		setTimeout(function(){
			$('.contact_box').css('transform',"translateY(0)");
		},2000)
	});


	//左右导航切换
	var tabsSwiper = new Swiper('#tabs-container', {
	    speed: 350,
	    touchAngle: 35,
	    observer: true,
	    observeParents: true,
	    freeMode: false,
	    longSwipesRatio: 0.1,
	    autoHeight: true,
	    on: {
	        slideChangeTransitionStart: function() {
	            $(".headbox .curr").removeClass('curr');
	            $(".headbox li").eq(tabsSwiper.activeIndex).addClass('curr');
	            var len = $("#tabs-container .swiper-slide").eq(tabsSwiper.activeIndex).find('li').length;
	            var len2 = $("#tabs-container .swiper-slide").eq(tabsSwiper.activeIndex).find('.empty').length;
	            if(len != 0 || len2 != 0){
	            }else{
	              getList();
	            }

	        },
	    },
	})
	$('.headbox li').click(function() {
	      var i = $(this).index();
	      if (!$(this).hasClass('curr')) {
	          $(this).addClass('curr').siblings().removeClass('curr');
	          tabsSwiper.slideTo($(this).index());
	      }

	})
	//拼团未开始倒计时
  	if($('.ptdjs').size() > 0){

	  	var stimes =$('.ptdjs').attr('data-time');
		var pttml = [];
		setInterval(function(){
			pttml = cutDownTime(serviceTime,stimes)
			if(pttml[0] > 0){
              	$('.ptdjs').find('.day').text(pttml[0]).show();
              	$('.ptdjs').find('.daypot').show();
            }else{
              	$('.ptdjs').find('.day').hide();
              	$('.ptdjs').find('.daypot').hide();
            }
            // if(pttml[1] > 0){
            //   	$('.ptdjs').find('.hour').text(pttml[1]).show();
            //   	$('.ptdjs').find('.hourpot').show();
            // }else{
            //   	$('.ptdjs').find('.hour').hide();
            //   	$('.ptdjs').find('.hourpot').hide();
            // }
			$('.ptdjs').find('.hour').text(pttml[1]);
			$('.ptdjs').find('.minute').text(pttml[2]);
			$('.ptdjs').find('.second').text(pttml[3]);
		},1000) ;
  	}
	//倒计时
	function cutDownTime(setime,datatime){
	    var eday = 3;
	    var jsTime = parseInt((new Date()).valueOf()/1000);
	    var timeOffset = parseInt(jsTime - setime);
	      var end = datatime*1000;  //点击的结束抢购时间的毫秒数
	      var newTime = Date.parse(new Date()) - timeOffset;  //当前时间的毫秒数
	      var youtime = end - newTime; //还有多久时间结束的毫秒数
	      var timeArr = [];
	      if(youtime <= 0){
	        timeArr = ['00','00','00','00'];
	        return timeArr;
	        return false;
	      }
	      var seconds = youtime/1000;//秒
	      var minutes = Math.floor(seconds/60);//分
	      var hours = Math.floor(minutes/60);//小时
	      var days = Math.floor(hours/24);//天

	      var CDay= days ;
	      var CHour= hours % 24 ;
	      if(CDay <= eday){//3天之内的只要小时 不要天
	          CHour = CHour + CDay*24;
	          CDay = 0;
	      }
	      var CMinute= minutes % 60;
	      var CSecond= Math.floor(seconds%60);//"%"是取余运算，可以理解为60进一后取余数
	      var c = new Date(Date.parse(new Date()) - timeOffset);
	      var millseconds=c.getMilliseconds();
	      var Cmillseconds=Math.floor(millseconds %100);
	      if(CSecond<10){//如果秒数为单数，则前面补零
	        CSecond="0"+CSecond;
	      }
	      if(CMinute<10){ //如果分钟数为单数，则前面补零
	        CMinute="0"+CMinute;
	      }
	      if(CHour<10){//如果小时数为单数，则前面补零
	        CHour="0"+CHour;
	      }
	      if(CDay<10){//如果天数为单数，则前面补零
	        CDay="0"+CDay;
	      }
	      if(Cmillseconds<10) {//如果毫秒数为单数，则前面补零
	        Cmillseconds="0"+Cmillseconds;
	      }
	      if(CDay > 0){
	        timeArr = [CDay,CHour,CMinute,CSecond];
	        return timeArr;
	      }else{
	        timeArr = ['00',CHour,CMinute,CSecond];
	        return timeArr;
	      }
	}
	getList();

	//数据列表
	function getList(){
	    var tload   = $('.headbox li.curr').attr('data-isload');

	    var gettype = $('.headbox li.curr').attr('data-action');
	    if (tload == '1'){
	      return false;
	    }

	    $('.headbox li.curr').attr('data-isload','1');
	    var tindex = $('.headbox li.curr').index();
	    var objId = $('#tabs-container .swiper-slide-active')
	    objId.find('.loading').remove();
	    objId.append('<div class="loading">加载中</div>');
	    var active = $('.headbox .curr');
	    var page = active.attr('data-page');

	    //请求数据
	    var data = [];
	    data.push("pageSize="+pageSize);
	    data.push("page="+page);
	    data.push("store="+storeid);

	    if (gettype == 1) {
			data.push("moduletype=3");
		} else {
			data.push("moduletype=5");
		}
	    $.ajax({
	      url: "/include/ajax.php?service=shop&action=slist",
	      data: data.join("&"),
	      type: "GET",
	      dataType: "jsonp",
	      success: function (data) {
	        if(data && data.state == 100){
	          var list = data.info.list, pageinfo = data.info.pageInfo,totalPage = pageinfo.totalPage, lr;
	          $('.headbox li.curr').attr('data-totalpage',totalPage);
	          var html1 = [], html2=[];
	          if(list.length > 0){
	            objId.find('.loading').remove()
	            for(var i = 0; i < list.length; i++){
	              lr = list[i];
	              html = []
	              var pic = lr.litpic == false || lr.litpic == '' ? '/static/images/404.jpg' : lr.litpic;
	              if(tindex == 0){//到店优惠
                  	html.push('<li class="pro_li">');
					html.push('	<a href="'+lr.url+'">');
					html.push('		<div class="pimg"><img src="'+pic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'">');
					html.push('		</div>');
					html.push('		<div class="pinfo">');
					html.push('			<h3>'+lr.title+'</h3>');
					html.push('			<div class="saleBox">');
					html.push('				<span>消费'+lr.sales+'</span>');
					html.push('				<em></em>');
					html.push('				<span class="txt_day">'+lr.daystr+'</span>');
					html.push('			</div>');
					html.push('			<div class="pricebox">');
					var priArr = lr.price.split('.');
					html.push('				<h4>'+echoCurrency('symbol')+'<b>'+priArr[0]+'</b><span>.'+priArr[1]+'</span></h4>');
					html.push('				<p class="mprice">'+echoCurrency('symbol')+'<span>'+lr.mprice+'</span></p>');
					html.push('			</div>');
					html.push('		</div>');
					html.push('	</a>');
					html.push('</li>');


	                if(i % 2 == 0){
						html1.push(html.join(""))
					}else{
						html2.push(html.join(""))
					}
	              }else{//同城配送


	                  	html.push('<li class="pro_li tc_li">');
						html.push('	<a href="'+lr.url+'">');
						html.push('		<div class="pimg"><img src="'+pic+'" alt="" onerror="this.src=\'/static/images/404.jpg\'">');
						html.push('		</div>');
						html.push('		<div class="pinfo">');
						var qtxt = '';
		                if(lr.huodongarr==1){//准点抢购特有
		                    qtxt='<span class="xianshi">限时抢</span>';
		                }
						html.push('			<h3>'+qtxt+lr.title+'</h3>');

						if(lr.huodongarr==1 || lr.huodongarr==4){//拼团 准点抢购特有
							html.push('    <div class="choicePrice tesPrice">');
							html.push('      <p class="spePrice">');
							var priTxt = '';
							if(lr.huodongprice>=1000){
								priTxt = '<strong>'+parseInt(lr.huodongprice)+'</strong>';
							}else{
								var priArr = lr.huodongprice.split('.');
								if(priArr[1] > 0){
									priTxt = '<strong>'+priArr[0]+'</strong><em>.'+priArr[1]+'</em>';
								}else{
								    priTxt = '<strong>'+parseFloat(lr.huodongprice)+'</strong>';
								}
							}

		                    html.push('      <span class="newPrice">'+echoCurrency('symbol')+priTxt+'</span>');
		                    html.push('        <s class="oldPrice">'+echoCurrency('symbol')+parseInt(lr.mprice)+'</s>');

		                    html.push('      </p>');
		                    html.push('      <s class="pr-bg"></s>');
		                    var pstxt = '';
		                    if(lr.huodongarr==1){//准点抢购
		                      pstxt = lr.huodongechangci+'场';
		                    }else{
		                      pstxt = lr.huodongnumber+'人拼';
		                    }
		                    html.push('      <span class="psPan">'+pstxt+'</span>');
		                    html.push('	</div>');
		                    html.push('    <div class="choiceSale">');
			                  if(lr.huodongarr==1){//准点抢购特有

			                    html.push('      <div class="tsTime" data-time="1637374062"><i></i>');
			                    html.push('         <span class="day">00</span><em class="sepot">:</em>');
			                    html.push('         <span class="hour">00</span><em>:</em>');
			                    html.push('        <span class="minute">00</span><em>:</em>');
			                    html.push('         <span class="second">00</span>');
			                    html.push('       </div>');
			                  }
			                  var saleTxt = lr.huodongarr==4?'已拼':'已售';
			                  html.push('      <p class="hasSale">'+saleTxt+lr.sales+'</p>');
			                  html.push('    </div>');
						}else{
							html.push('			<p class="mprice">'+echoCurrency('symbol')+'<span>'+lr.mprice+'</span></p>');
							html.push('			<div class="pricebox">');
							var qhtml='',baoytxt = '';
		                    if(lr.quanhave ==1){
		                        qhtml = '<span class="quan_icon">券</span>';
		                    }
		                    // if(i == 2){//是否包邮
		                    //     baoytxt = '<span class="by_icon">包邮</span>';
		                    // }
							var priArr = lr.price.split('.');
							html.push('				<h4>'+echoCurrency('symbol')+'<b>'+priArr[0]+'</b><span>.'+priArr[1]+'</span>'+baoytxt+qhtml+'</h4>');

							html.push('				<span class="hasSale">已售'+lr.sales+'</span>');
							html.push('			</div>');
						}
						html.push('		</div>');

	                  	html.push('</a></li>');

	                if(i % 2 == 0){
						html1.push(html.join(""))
				  	}else{
						html2.push(html.join(""))
				  	}
	              }

	            }

	            if(page == 1){
	              objId.find('.list_ul1').html(html1.join(""));
	              objId.find('.list_ul2').html(html2.join(""));
	            }else{
	              objId.find('.list_ul1').append(html1.join(""));
	              objId.find('.list_ul2').append(html2.join(""));
	            }
	            objId.find('.tsTime').each(function(){
	              var t = $(this),inx = t.index();
	              var stimes =t.attr('data-time');
	              var shtml = [];
	              setInterval(function(){
	                shtml = cutDownTime(serviceTime,stimes)
	                if(shtml[0] > 0){
	                  	t.find('.day').text(shtml[0]).show();
	                  	t.find('.sepot').show();
	                }else{
	                  	t.find('.day').hide();
	                  	t.find('.sepot').hide();
	                }
	                t.find('.hour').text(shtml[1]);
	                t.find('.minute').text(shtml[2]);
	                t.find('.second').text(shtml[3]);
	              },1000) ;
	            })


	            tload = '0';
	            $('.headbox li.curr').attr('data-isload',tload);
	            if(page >= pageinfo.totalPage){
	                tload = '1';
	                $('.headbox li.curr').attr('data-isload',tload);
	                objId.append('<div class="loading">没有更多了</div>');//没有更多了
	            }

	          //没有数据
	          }else{
	            tload = '1';
	            $('.headbox li.curr').attr('data-isload',tload);
	            objId.find('.loading').html('<div class="empty"></div><p>暂无数据!</p>');
	          }

	        //请求失败
	        }else{
	          tload = '1';
	          $('.headbox li.curr').attr('data-isload',tload);
	          objId.find('.loading').html('<div class="empty"></div><p>'+data.info+'</p>');
	        }
	        tabsSwiper.updateAutoHeight(100);

	      },
	      error: function(){
	        tload = '0';
	        //网络错误，加载失败
	        objId.find('.loading').html('网络错误，加载失败'); // 网络错误，加载失败
	        $('.headbox li.curr').attr('data-isload',tload);
	      }
	    });
	}


	$('.canGet').click(function(){
		var qid = $(this).attr('data-id');
		$.ajax({
			url: "/include/ajax.php?service=shop&action=getQuan&qid="+qid,
			type:'POST',
			dataType: "json",
			success:function (data) {
				if(data.state ==100){

					$(this).text('已领取');
					$(this).addClass('noChose');
					showErrAlert(data.info)

				}else{
					showErrAlert(data.info)
				}
			},
			error:function () {

			}
		});

	})

  HN_Location.init(function(data){
        if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {

          $(".distance").closest('p').remove(); //没有获取到定位  隐藏距离
        }else{
          var shopPosi_lng = lnglat.split(',')[0],
              shopPosi_lat = lnglat.split(',')[1],
              my_lat = data.lat,
              my_lng = data.lng;
              console.log(data)
              var distance = mapDistance(shopPosi_lat,shopPosi_lng,my_lat,my_lng);
              $(".distance").text(distance)
              $(".city").text(data.city)
              $(".sdetail span").text(distance)

        }
    }, device.indexOf('huoniao') > -1 ? false : true);

  // 计算距离
  function  mapDistance(lat_a,lng_a,lat_b,lng_b){
        var pk = 180 / 3.14169;
        var a1 = lat_a / pk;
        var a2 = lng_a / pk;
        var b1 = lat_b / pk;
        var b2 = lng_b / pk;
        var t1 = Math.cos(a1) * Math.cos(a2) * Math.cos(b1) * Math.cos(b2);
        var t2 = Math.cos(a1) * Math.sin(a2) * Math.cos(b1) * Math.sin(b2);
        var t3 = Math.sin(a1) * Math.sin(b1);
        var tt = Math.acos(t1 + t2 + t3);


        var km = 6366000 * tt / 1000;
        if(km<1){
          km = (km*1000).toFixed(0)+'m'
        }else{
          km = km.toFixed(1)+'km';
        }
        return km;

	  }


})
