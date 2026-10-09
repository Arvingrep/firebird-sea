$(function(){
  //数字滚动
  var qrr = {
      useEasing: true,
      easingFn: function(a, b, e, d) {
          d = (a /= d) * a;
          return b + e * (d * a + -3 * d + 3 * a)
      },
      useGrouping: true,
      separator: ",",
      decimal: ".",
      prefix: "",
      suffix: ""
  };

  //砍价价格
  var needKan = yuanPrice-buyPrice;
  priceCalc();
  function priceCalc(){
    var hasKanPrice = yuanPrice - firstKan;   
    var kanRatio = ((hasKanPrice/needKan)*100).toFixed(2);
    console.log(kanRatio)
    if(kanRatio <= 14){
      $('.hasCon .kanPro span').animate({'left':'13%'},300);
      $('.hasCon .kanPro s').animate({'left':kanRatio+'%'},300);
    }else if(kanRatio > 95){
      $('.hasCon .kanPro span').animate({'left':'85%'},300);
      $('.hasCon .kanPro s').animate({'left':'95%'},300);

    }else if(kanRatio > 86){
      $('.hasCon .kanPro span').animate({'left':'85%'},300);
      $('.hasCon .kanPro s').animate({'left':kanRatio+'%'},300);

    }else{
      $('.hasCon .kanPro span').animate({'left':kanRatio+'%'},300);
      $('.hasCon .kanPro s').animate({'left':kanRatio+'%'},300);
    }
    
    $('.hasCon .kanPro i').animate({'width':kanRatio+'%'},300); 
    //数字滚动
    $(".hasCon").on('inview', function(event, isInview) {
        if(isInview){
            var hasKan =  new CountUp("hasKan", 0, 0, 2, 3, qrr);
            hasKan.update(firstKan);
        }
    })
  }
  

	//购买者滚动
    $.ajax({
        type: "GET",
        url: "/include/ajax.php",
        dataType: "jsonp",
        data: 'service=article&action=alist&flag=h&pageSize=10',
        success: function(data) {

            if(data.state == 100){
                var tcNewsHtml = [], list = data.info.list;
                
                for (var i = 0; i < list.length; i++){
                    tcNewsHtml.push('<div class="swiper-slide">');
                    tcNewsHtml.push('<div class="buyImg"><img src="'+list[i].litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
                    tcNewsHtml.push('<p><em>“一只小猫咪”</em>148元拿下</p>');
                    tcNewsHtml.push('</div>');

                }
                
                $('.buyGun .swiper-wrapper').html(tcNewsHtml.join(''));
                $('.buyGun').show();
                var mySwiper = new Swiper('.buyGun .swiper-container',{
                    direction : 'vertical',
                    autoplay: {
                    delay: 2000,
                    stopOnLastSlide: false,
                    disableOnInteraction: true,
                    },
                })

            }else{
                $('.buyGun').hide();
            }
        },
        error: function(){
            $('.buyGun').hide();
        }
    });
    // 倒计时
    var eday = 3;
    timer = setInterval(function(){
        var end = $('body').find('.jsTime').attr("data-time")*1000;  //点击的结束抢购时间的毫秒数
        var newTime = Date.parse(new Date());  //当前时间的毫秒数
        var youtime = end - newTime; //还有多久时间结束的毫秒数
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
        var c=new Date();
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
         $(".jsTime").find("span.day").html(CDay);   
        }else{
            $('.jsTime span.day,.jsTime em.speDot').hide();
        }
        
        $(".jsTime").find("span.hour").html(CHour);
        $(".jsTime").find("span.minute").html(CMinute);
        $(".jsTime").find("span.second").html(CSecond);

  	}, 1000);
  	//帮好友砍一刀
  	$('.buyNow').click(function(){
      var a1 = $('.content2 .hasCon #hasKan').text();
      var tPrice = $(this).attr('data-price');
      $('.content2 .hasCon #hasKan').text((a1-tPrice).toFixed(2));
      
  		$('.comMask').show();
      $('.selfAlert').addClass('show');
  		$(this).hide();
  		$('.selfBuy').removeClass('fn-hide');
      $('.content2 .hasTip').removeClass('fn-hide');
      $('.content2 .hasCon .kanPro .kanSpan').hide();
      $('.content2 .hasCon .kanPro s').hide();
      //数字滚动
      $(".selfAlert").on('inview', function(event, isInview) {
          if(isInview){
              var allin =  new CountUp("num1", 0, 0, 2, 3, qrr);
              allin.update(tPrice);
              var bangPrice =  new CountUp("bangPrice", 0, 0, 2, 3, qrr);
              bangPrice.update(tPrice);
          }
      })
  	})

  	$('.comMask,.goKan,.closeAlert').click(function(){
     // priceCalc();
  		$('.comMask,.ruleAlert').hide();
      $('.selfAlert').removeClass('show');
  	})

    //规则弹窗
    $('.content1 .rule').click(function(){
      $('.comMask,.ruleAlert').show();
    })
    $('.ruleAlert .closeAlert').click(function(){
      $('.comMask,.ruleAlert').hide();
    })

    var a = $('.content4 .swiper-slide').length;
    if(a == 1){
      $(".content4 .swiper-wrapper").css('height','1.1rem');
    }else if(a>=2){
      new Swiper('.content4 .swiper-container', {direction: 'vertical',autoplay:{delay: 5000,},slidesPerView:"auto",loop:true });
    }else{
      $('.content4').html('').hide();
    }

  	var page = 1,isload = false;
  	getList();

    //滚动加载
    $(window).scroll(function(){
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - w - 100;
        if ($(window).scrollTop() > s_scroll && !isload) {
            page++;
            getList();

        }
    })
  	//好友助力榜
  	function getList(){
		isload = true;
		$('.loading').remove();
		$('.content3 ul').append('<div class="loading">加载中...</div>');
	  	$.ajax({
	        type: "GET",
	        url: '/include/ajax.php?service=article&action=alist&flag=h&page='+page+'&pageSize=10',
	        dataType: "jsonp",
	        success: function(data) {
	        	if(data.state == 100){
	        		var list = data.info.list,pageinfo = data.info.pageInfo,page = pageinfo.page,html = [];
	        		for(var i = 0; i < list.length; i++){
	        			$('.loading').remove();
	        			html.push('<li class="fn-clear">');
                html.push('<a href="'+kanUrl.replace('%id',list[i].id)+'">');
	        			var litpic = list[i].litpic == "" ? staticPath+'images/noPhoto_40.jpg' : list[i].litpic;
	        			html.push('<div class="goodImg"><img src="'+litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/404.jpg\';"></div>');
	        			html.push('<div class="goodInfo">');
	        			html.push('<h4>'+list[i].title+'</h4>');
                html.push('<p class="mPrice"><s>'+echoCurrency('symbol')+'699.00</s></p>');
                var priceAr = '148.00'.split('.');
                html.push('<p class="nPrice"><em>'+echoCurrency('symbol')+'</em><span>'+priceAr[0]+'</span>.'+priceAr[1]+'<i></i></p>');
                html.push('</div>');
	        			html.push('<span class="kanSpan">立即砍价</span>');
	        			html.push('</a>');
                html.push('</li>');
	        		}
	        		$('.content3 ul').append(html.join(""));
	        		isload = false;
	        		//最后一页
                    if(page >= data.info.pageInfo.totalPage){
                        isload = true;                      
                        $('.content3 ul').append('<div class="loading">已加载全部</div>');
                    }
	        	}else{
	        		$('.content3 ul .loading').html(data.info);
	        	}
			},
	        error: function(){
	            isload = false;
                $('.content3 ul .loading').html(langData['siteConfig'][20][227]);
	        }
	    });
  	}

  	function trans(timestamp){
        
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
		
		return (month+'-'+day+' '+hour+':'+minute+':'+second);
		
  	}
  	

})
