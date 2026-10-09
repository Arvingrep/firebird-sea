$(function () {
	//购买者滚动
    $.ajax({
        type: "GET",
        url: "/include/ajax.php",
        dataType: "json",
        data: 'service=shop&action=buyList&huodong=2',
        success: function(data) {

            if(data.state == 100){
                var tcNewsHtml = [], list = data.info;

                for (var i = 0; i < list.length; i++){
                    tcNewsHtml.push('<div class="swiper-slide"><div>');
                    tcNewsHtml.push('<div class="buyImg"><img src="'+list[i].photourl+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/noPhoto_100.jpg\';"></div>');
                    tcNewsHtml.push('<p><em>'+list[i].nickname+'</em>抢到了'+list[i].title+'</p>');
                    tcNewsHtml.push('</div></div>');

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
                    loop : true,
                })

            }else{
                $('.buyGun').hide();
            }
        },
        error: function(){
            $('.buyGun').hide();
        }
    });

	var isload = false,clearTime=0;

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

	$(document).ready(function() {
		$(window).scroll(function() {
			var allh = $('body').height();
			var w = $(window).height();
			var scroll = allh - w;
			if ($(window).scrollTop() + 50 > scroll && !isload) {
				atpage++;
				getList();
			};
		});
	});

	$('.miaoshabox').delegate('.contbox', 'click', function(){
		var t = $(this), url = t.attr('data-url');
		setTimeout(function(){location.href = url;}, 200);
	});

	//tab切换
	$('.msTab li').click(function(){
		if(!$(this).hasClass('curr')){
			$(this).addClass('curr').siblings('li').removeClass('curr');
			atpage = 1;
			isload = false;
			getList(1);
		}
	})

	getList();
	function getList(tr,cid){
		isload = true;
		if(tr){
   			$(".miaoshabox").html('<div class="ms_ph"><div class="loading"><span></span><span></span><span></span><span></span><span></span></div></div>');
   		}
   			
   		//请求数据
		var data = [];
		var now = Date.parse(new Date())/1000;  //当前时间的毫秒数
		data.push("pageSize="+pageSize);
		data.push("page="+atpage);
		var stid = $('.msTab li.curr').attr('data-id')

		if (stid == 0) {
			data.push("presale=1");
		}
		if(cid == 0){
			data.push("presale=1");
		}
   		$.ajax({
	      url: "/include/ajax.php?service=shop&action=proHuodongList&huodongtype=2",
	      data: data.join("&"),
	      type: "GET",
	      dataType: "jsonp",
	      success: function (data) {
	        if(data.state == 100){
	        	//$(".miaoshabox .loading").remove();
				var list = data.info.list, html = [],className='';
				for(var i = 0; i < list.length; i++){
					if(list[i].ktimestr > now){
						className = 'mnostart';
					}
					html.push('<div data-url="'+list[i].url+'" class="contbox '+className+'">');
					//未开始
					if(list[i].ktimestr > now){
						html.push('<div class="ttopbox">');
						html.push('<div id="jsTime'+list[i].ktimestr+'" class="jsTime fn-clear" data-time="'+list[i].ktimestr+'"><span class="day">00</span><em class="sepot">天</em><span class="hour">00</span><em>:</em><span class="minute">00</span><em>:</em><span class="second">00</span><i>即将开始</i></div>');
						html.push('</div>');
					}
					
					html.push('<div class="mainbox fn-clear">');
					var sstxt = '';
					if(list[i].huodonginventory == 0 || list[i].huodongtimestate == 2){
						sstxt = '<span>已抢完</span>'
					}
					html.push('<div class="l imgbox">'+sstxt+'<img src="'+list[i].litpic+'" alt=""></div>');
					html.push('<div class="txtbox">');
					html.push('<div class="fibox">');
					html.push('<h3>'+list[i].title+'</h3>');
					html.push('<h4>'+list[i].subtitle+'</h4>');
					html.push('</div>');
					html.push('<div class="msPrice">');
					var hdPrice = parseFloat(list[i].huodongprice);
					if(list[i].huodongprice>=10000){
						hdPrice = parseFloat(list[i].huodongprice);
					}
					html.push('	<div class="price1"><span><em>'+echoCurrency('symbol')+'</em><strong>'+hdPrice+'</strong></span><s>'+echoCurrency('symbol')+'<b>'+parseFloat(list[i].mprice)+'</b></s></div>');
					var chaPrice = list[i].mprice-list[i].huodongprice;
					html.push('	<div class="price2"><i></i><span>直降'+chaPrice.toFixed(2)+'</span></div>');
					html.push('</div>');
					html.push('<div class="msOpe">');
					
					var cls = clTxt = qtxt = '';
					if(list[i].huodongtimestate == 1){//已经开始
						clTxt = '立即抢';
						if(list[i].huodonginventory == 0){
							cls ='disabled';
							clTxt = '已抢完';
						}else if(list[i].huodonginventory <=50){
							qtxt = '<p>仅剩'+list[i].huodonginventory+'件</p>';

							
						}
					}else if(list[i].huodongtimestate == 2){
						cls ='disabled';
							clTxt = '已抢完';
					}else{//未开始
						clTxt = '抢先加购';
						if(list[i].huodonginventory <=1000){
							qtxt = '<p>仅'+list[i].huodonginventory+'件</p>';
							
						}
					}
					html.push(qtxt);
					html.push('	<span class="'+cls+'">'+clTxt+'</span>');
					html.push('</div>');
					html.push('</div>');
					html.push('</div>');
					html.push('</div>');
				}
				if(atpage == 1){
		   			$(".miaoshabox .ms_ph").remove();
		   		}else{
		   			$(".miaoshabox .loading").remove();
		   		}
		   		if(atpage == 1){
		   			$(".miaoshabox").html(html.join(""));
		   		}else{
		   			$(".miaoshabox").append(html.join(""));
		   		}
				
				isload = false;
				//引入倒计时效果
				$('.jsTime').each(function() {
					//var id = $(this).attr('id');
					//countDown('#'+id);
					var t = $(this),inx = t.index();
	                var stimes =t.attr('data-time');
	                var shtml = [];
	                setInterval(function(){
	                  shtml = cutDownTime(serviceTime,stimes);
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
				});
				//最后一页
				if(atpage >= data.info.pageInfo.totalPage){
					isload = true;
					$(".miaoshabox").append('<div class="loading">没有更多了</div>');
				}
				// if(stid == 0 || cid == 0){

				// }else{
				// 	getList('',0);
				// }
	        }else{
	        	isload = true;
	        	// if(stid == 0 || cid == 0){
	        	// 	$(".msTab li[data-id='0']").hide();
	        	// 	$(".msTab li[data-id='1']").css({'width':'100%'});
	        	// }else{
	        	// 	$(".msTab li[data-id='1']").hide();
	        	// 	$(".msTab li[data-id='0']").css({'width':'100%'})
	        	// 	$(".msTab li[data-id='0']").click();
	        	// }
	        	if($(".contbox ").length == 0){
	        		$(".miaoshabox .loading").html('暂无相关信息');
	        	}
				
	        }
	      },
		  error: function(){
		  	isload = false;
			$('.miaoshabox').html('<div class="ms_ph"><div class="loading">'+langData['siteConfig'][20][227]+'</div></div>');
		  }
	    });
	}

});