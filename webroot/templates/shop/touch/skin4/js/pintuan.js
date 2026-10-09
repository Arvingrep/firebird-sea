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
	    	isload = false;
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



	$('.business').delegate('li', 'click', function(){
		var t = $(this), a = t.find('a'), url = a.attr('data-url');
		if(!wx_miniprogram) {
            setTimeout(function () {
                location.href = url;
            }, 500);
        }

	})

	var tjFlag = false;
	onefindList(CLASSID,1);
	function onefindList(id,tr){
		if(isload) return false;
		isload = true;
		if(tr){
		    atpage = 1;
			$(".business ul").html('');
		}
		var url = "";
		if(id==0){
			url = "/include/ajax.php?service=shop&action=proHuodongList&huodongtype=4&huodongstate=1";
		}else{
			url = "/include/ajax.php?service=shop&action=proHuodongList&huodongtype=4&huodongstate=1&protype="+id;
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
						var list = data.info.list, html = [],html2 = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								//取出第一个为推荐团
								if(i==0 && !tjFlag){
									html2.push('<a href="'+list[i].url+'" style="display:block;"><div class="tjImg"><img src="'+list[0].litpic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/good_default.png\';"></div>');
						            html2.push('<div class="tjInfo">');
						            html2.push('    <h2>'+list[0].title+'</h2>');
						            html2.push('    <h3>'+list[0].subtitle+'</h3>');
						            html2.push('   <span class="tjtNum"><em>'+list[0].huodongnumber+'人团</em></span>');
						            html2.push('    <div class="tjPrice">');
						            html2.push('        <div class="tjLeft">');
						            html2.push('            <p class="price1"><em>拼团价</em><span>'+echoCurrency('symbol')+'<strong>'+parseFloat(list[0].huodongprice)+'</strong></span></p>');
						            html2.push('            <p class="price2">'+echoCurrency('symbol')+parseFloat(list[0].mprice)+'</p>');
						            html2.push('        </div>');
						            if(list[0].huodongtimestate == 1){
						            	html2.push('        <div class="tjRt">去拼团</div>');
						            	$('.tjPintuan .ktOne').html('<div class="jsTime hasfa fn-clear" data-time="'+list[0].etimestr+'"><div><span class="day">00</span><em class="speDot">天</em><span class="hour">00</span><em>小时</em><span class="minute">00</span><em>分</em><i>后结束</i></div></div>');
						            	var timer_nopay = setInterval(function(){
									        cutDownTime($('.jsTime'));
									    },1000) ;

						            }else{
						            	$('.tjPintuan .ktOne').html('预计今日<span>'+list[0].ktime+'</span>开团')
						            	html.push('        <div class="tjRt">提前加购</div>');
						            }
						            
						            html2.push('    </div>');
						            html2.push('</div></a>');
								}
								html.push('<li class="fn-clear">');
								html.push('<a class="btn_03" href="javascript:void(0);" data-url='+list[i].url+'>');
							    html.push('  <div class="s_img"><img src="'+list[i].litpic+'"></div>');
							    html.push('  <div class="s_title">');
							    html.push('     <div class="bus_txt">'+list[i].title+'</div>');
							    html.push('     <div class="pintuan_money"><span class="money1"><em>拼团价</em><s>'+echoCurrency('symbol')+''+list[i].mprice+'</s></span><span class="money2">'+echoCurrency('symbol')+'<strong>'+parseFloat(list[i].huodongprice)+'</strong></span></div>');
							    var state = '';
						        if(list[i].state==1){
						        	if(list[i].sales < 100){//正在拼
						        		state = '<div class="btn"><em>火热拼团中</em><span>去拼团</span></div>';
						        	}else{
						        		var ssale = parseInt(list[i].sales/100)*100;
						        		state = '<div class="btn"><em>'+ssale+'+人正在拼</em><span>去拼团</span></div>';
						        	}
						        }
							    html.push('     <div class="addr"><span>'+list[i].huodongnumber+'人团</span></div>');
							    html.push(state)
							    html.push('   </div>');
							    html.push('</a>');
							    html.push('</li>');
							}
							$(".business ul").append(html.join(""));
							if(!tjFlag){
								$('.tjPintuan .tjBot').html(html2.join(''));
								tjFlag = true;
							}
							
							isload = false;
							//最后一页
							if(atpage >= data.info.pageInfo.totalPage){
								isload = true;
								$(".business").append('<div class="loading">已经到最后一页了</div>');
							}
						}else{
							isload = true;
							$(".business").append('<div class="loading">暂无相关信息</div>');
							$('.tjPintuan').hide();
						}
					}else{
						$(".business .loading").html(data.info);
						$('.tjPintuan').hide();
					}
				}else{
					$(".business .loading").html('加载失败！');
					$('.tjPintuan').hide();
				}
			},
			error: function(){
				isload = false;
				$(".business .loading").html('网络错误，加载失败！');
				$('.tjPintuan').hide();
			}
		});
	};

	$(window).scroll(function() {
	    var allh = $('body').height();
	    var w = $(window).height();
	    var scroll = allh - w;
	    if ($(window).scrollTop() >= scroll && !isload) {
	      atpage++;
	      onefindList(CLASSID);
	    };
	});
	// 倒计时
    var eday = 3;    
    function cutDownTime(dom){   
        // timeOffset  是服务器和本地时间的时间差
        var end = dom.attr("data-time")*1000;  //点击的结束抢购时间的毫秒数
        var newTime = Date.parse(new Date()) - timeOffset;  //当前时间的毫秒数
        var youtime = end - newTime; //还有多久时间结束的毫秒数
        if(youtime <= 0){
          if(dom.hasClass('hasfa')){
            clearInterval(timer_hasfa);
          }else if(dom.hasClass('tuanIn')){
            clearInterval(timer_tuanin);
          }else if(dom.hasClass('nopay')){
            clearInterval(timer_nopay);
          }
            
            return;

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
         dom.find("span.day").html(CDay);
         dom.find("span.day").show();
         dom.find("em.speDot").show();
        }else{
          dom.find("span.day").hide();
          dom.find("em.speDot").hide();
        }

        dom.find("span.hour").html(CHour);
        dom.find("span.minute").html(CMinute);
        dom.find("span.second").html(CSecond);
    }
    
	//推荐团







});