$(function(){
	if($('#typenum').val()<13){
		$('.typemore').hide();
	}
  if($.browser.msie && parseInt($.browser.version) >= 8){
    $('.intro-shop .shop-con ul li:nth-child(5n)').css('margin-right','0');
    $('.flash-sale .buy ul li:last-child').css('margin-right','0');
    $('.group-wrap .group .group-list:last-child').css('margin-right','0');
    $('.find-wrap .find-left .find-list:nth-child(4n)').css('margin-right','0');
    $('.yellow-page .yellow-con .yellow-list:nth-child(2n)').css('margin-right','0');
    $('.new-media .media-page .media-list:last-child').css('border-right','none');
  	$('.yellow-right .join-list:last-child').css('border-bottom','none');
    $('.slideBox2 .prev:after').css('background','#000');
    $('.slideBox2 .next:after').css('background','#000');
  }
  $('.introduce .menu-left ul.one .one-li').hover(function(){
  	$(this).addClass('current');
  },function(){
  	$(this).removeClass('current');
  })
  $('.introduce .menu-left ul.one li.see-more').hover(function(){
  	$(this).find('.menu-two').show();
  },function(){
  	$(this).find('.menu-two').hide();
  })

  $(".slideBox1").slide({titCell:".hd ul",mainCell:".bd ul",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>"});
  

  // 公告
  $(".txtMarquee-top").slide({mainCell:".bd ul",autoPlay:true,effect:"topMarquee",vis:5,interTime:50});
  $('.intro-shop .shop-con ul li .shop-bg .code').hover(function(){
    $(this).next('.code-img').addClass('show');
  },function(){
    $(this).next('.code-img').removeClass('show');
  })
  $('.flash-sale .sale-list .now .code').hover(function(){
    $(this).next('.code-img').addClass('show');
  },function(){
    $(this).next('.code-img').removeClass('show');
  })
  // 发现好店
  $('.find-wrap .find-left .find-shop .list-bg').hover(function(){
    $(this).closest('.find-list').find('.hover').show();
  })
  $('.find-wrap .find-left .find-list .hover').hover(function(){
    $(this).show();
  },function(){
    $(this).hide();
  })

  //获取服务器当前时间
	var nowStamp = 0;
	$.ajax({
		"url": masterDomain+"/include/ajax.php?service=system&action=getSysTime",
		"dataType": "jsonp",
		"success": function(data){
			if(data){
				nowStamp = data.nextHour;
				var nows = huoniao.transTimes(nowStamp, 1);
				$(".settime").attr('endtime',nows);
			}
		}
	});


	function getTime(){
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=system&action=getSysTime",
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data){
					var now = huoniao.transTimes(data.now, 1);
					now = now.split(" ")[1];
					var hour = now.split(":")[0], index = hour - 9;
					var now = data.now, nextHour = data.nextHour;

					//获取团购数据
					$.ajax({
						url: masterDomain+"/include/ajax.php?service=tuan&action=tlist&hourly=1&time="+nextHour+"&pageSize=12",
						type: "GET",
						dataType: "jsonp",
						success: function (data) {
							if(data && data.state == 100 && data.info.list.length > 0){
								var list = data.info.list, html = [], html1 = [] , html2 = [], html3 = [];
								for(var i = 0; i < list.length; i++){
									if(i>0 && i<=4){
										html.push('<div class="list">');
										html.push('<a href="'+list[i].url+'"><img class="sale-img" src="'+huoniao.changeFileSize(list[i].litpic, "small")+'" alt=""></a>');
										html.push('<div class="sale-con">');
										html.push('<p class="name"><a target="_blank" href="'+list[i].url+'">'+list[i].title+'</a></p>');
										html.push('<div class="money fn-clear">');
										html.push('<p class="red fn-left"><span class="sign">'+echoCurrency('symbol')+'</span><span class="qian">'+list[i].price+'</span></p>');
										html.push('<p class="grey fn-left"><span class="sign">'+echoCurrency('symbol')+'</span><span class="qian">'+list[i].market+'</span></p>');
										html.push('</div>');
										html.push('<div class="now">');
										html.push('<a class="go" target="_blank" href="'+list[i].url+'">马上抢</a>');
										html.push('<img class="code" src="'+templatePath+'images/code2.png" alt="">');
										html.push('<div class="code-img"><img src="'+masterDomain+'/include/qrcode.php?data='+list[i].url+'" alt=""></div>');
										html.push('</div>');
										html.push('</div>');
										html.push('</div>');
									}else if(i>4 && $<=8){
										html1.push('<div class="list">');
										html1.push('<a href="'+list[i].url+'"><img class="sale-img" src="'+huoniao.changeFileSize(list[i].litpic, "small")+'" alt=""></a>');
										html1.push('<div class="sale-con">');
										html1.push('<p class="name"><a target="_blank" href="'+list[i].url+'">'+list[i].title+'</a></p>');
										html1.push('<div class="money fn-clear">');
										html1.push('<p class="red fn-left"><span class="sign">'+echoCurrency('symbol')+'</span><span class="qian">'+list[i].price+'</span></p>');
										html1.push('<p class="grey fn-left"><span class="sign">'+echoCurrency('symbol')+'</span><span class="qian">'+list[i].market+'</span></p>');
										html1.push('</div>');
										html1.push('<div class="now">');
										html1.push('<a class="go" target="_blank" href="'+list[i].url+'">马上抢</a>');
										html1.push('<img class="code" src="'+templatePath+'images/code2.png" alt="">');
										html1.push('<div class="code-img"><img src="'+masterDomain+'/include/qrcode.php?data='+list[i].url+'" alt=""></div>');
										html1.push('</div>');
										html1.push('</div>');
										html1.push('</div>');
									}else{
										html2.push('<div class="list">');
										html2.push('<a href="'+list[i].url+'"><img class="sale-img" src="'+huoniao.changeFileSize(list[i].litpic, "small")+'" alt=""></a>');
										html2.push('<div class="sale-con">');
										html2.push('<p class="name"><a target="_blank" href="'+list[i].url+'">'+list[i].title+'</a></p>');
										html2.push('<div class="money fn-clear">');
										html2.push('<p class="red fn-left"><span class="sign">'+echoCurrency('symbol')+'</span><span class="qian">'+list[i].price+'</span></p>');
										html2.push('<p class="grey fn-left"><span class="sign">'+echoCurrency('symbol')+'</span><span class="qian">'+list[i].market+'</span></p>');
										html2.push('</div>');
										html2.push('<div class="now">');
										html2.push('<a class="go" target="_blank" href="'+list[i].url+'">马上抢</a>');
										html2.push('<img class="code" src="'+templatePath+'images/code2.png" alt="">');
										html2.push('<div class="code-img"><img src="'+masterDomain+'/include/qrcode.php?data='+list[i].url+'" alt=""></div>');
										html2.push('</div>');
										html2.push('</div>');
										html2.push('</div>');
									}
								}
								if(html!=''){
									html3 = '<li>' + html.join("") + '</li>';
								}
								if(html1!=''){
									html3 += '<li>' + html1.join("") + '</li>';
								}
								if(html2!=''){
									html3 += '<li>' + html2.join("") + '</li>';
								}
								$("#limit").html(html3);
								$(".slideBox2").slide({titCell:".hd ul",mainCell:".bd ul",effect:"leftLoop",autoPlay:true,autoPage:"<li></li>"});
							}else{
								$("#limit").html("<div class='empty'>暂无此时间段的团购信息！</div>");
							}
						}
					});
				}
			}
		});
	}
	getTime();

	var atpage = 1, isload = false, lng='',lat='';
	HN_Location.init(function(data){
		if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
		  $(".nearby-con").append('<div class="loading">定位失败,请重新刷新页面！</div>');
	  	}else{
		  lng = data.lng, lat = data.lat;
		  //onefindList();
	  	}
	});

	function onefindList(){
		var data = [];
		$(".nearby-con").append('<div class="loading">加载中...</div>');
		$(".nearby-con .loading").remove();

    	$.ajax({
			url: "/include/ajax.php?service=tuan&action=circleList&pageSize=5"+'&lng='+lng+'&lat='+lat,
			data: data.join("&"),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data){
					if(data.state == 100){
						$(".nearby-con .loading").remove();
						var list = data.info.list, html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								html.push('<a target="_blank" href="'+list[i].url+'">');
								html.push('<div class="nearby-list fn-clear">');
								html.push('<img src="'+list[i].litpic+'" alt="">');
								html.push('<div class="list-right">');
								html.push('<p class="name">'+list[i].name+'</p>');
								html.push('<div class="good fn-clear">');
								html.push('<p class="num fn-left">发现<span>&nbsp;'+list[i].storenum+'&nbsp;</span>家好店</p>');
								html.push('<p class="meter fn-right">'+list[i].distance+'</p>');
								html.push('</div>');
								html.push('</div>');
						        html.push('</div>');
						        html.push('</a>');
							}
							$(".nearby-con").append(html.join(""));
						}else{
							$(".nearby-con").append('<div class="loading">暂无相关信息</div>');
						}
					}else{
						$(".nearby-con").append('<div class="loading"></div>');
						$(".nearby-con .loading").html(data.info);
					}
				}else{
					$(".nearby-con").html('<div class="loading">加载失败</div>');
				}
			},
			error: function(){
				$(".nearby-con").html('<div class="loading">网络错误，加载失败！</div>');
			}
		});
	}


  // 倒计时
  updateEndTime();

})
//倒计时函数
function updateEndTime() {
    var date = new Date();
    var time = date.getTime(); //当前时间距1970年1月1日之间的毫秒数
    $(".settime").each(function(i) {
        var endDate = this.getAttribute("endTime"); //结束时间字符串
        //转换为时间日期类型
        var endDate1 = eval('new Date(' + endDate.replace(/\d+(?=-[^-]+$)/, function(a) {
            return parseInt(a, 10) - 1;
        }).match(/\d+/g) + ')');
        var endTime = endDate1.getTime(); //结束时间毫秒数
        var lag = (endTime - time) / 1000; //当前时间和结束时间之间的秒数
        if (lag > 0) {
            var second = Math.floor(lag % 60);
            var minite = Math.floor((lag / 60) % 60);
            var hour = Math.floor((lag / 3600) % 24);
            var day = Math.floor((lag / 3600) / 24);
            // $(this).html("距离团购结束的时间："  + hour + "小时" + minite + "分" + second + "秒");
            $(this).html( '<span>'+ hour + '</span>' + '<span>' + minite + '</span>' + '<span>' + second + '</span>');
        }
    });
    setTimeout("updateEndTime()", 1000);
}