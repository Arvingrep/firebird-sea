$(function(){
  var atpage = 1, isload = false, nextHour='',clearTime='';
  $(".flash_sale .info .info_header ul").delegate("li","click",function(){
	  var t = $(this);
	  if( !t.hasClass('active') ){
	    nextHour = t.attr("data-time");
	    getTime(nextHour,1);
		t.addClass('active');
		t.siblings().removeClass('active');
	  }
  });

    //倒计时（开始时间、结束时间、显示容器）
	var countDown = function(stime, etime, obj, func){
		sys_second = etime - stime;
		clearInterval(clearTime);
		var timer = setInterval(function(){
			if (sys_second > 0) {
				sys_second -= 1;
				clearTime = timer;
				var hour = Math.floor((sys_second / 3600) % 24);
				var minute = Math.floor((sys_second / 60) % 60);
				var second = Math.floor(sys_second % 60);

				$(obj).find(".h").text(hour < 10 ? "0" + hour : hour);
				$(obj).find(".m").text(minute < 10 ? "0" + minute : minute);
				$(obj).find(".s").text(second < 10 ? "0" + second : second);
			} else {
				getTime('',1);
				clearInterval(timer);
				typeof func === 'function' ? func() : "";
			}
		}, 1000);
	};

	//点击 提醒与取消提醒不跳转页面
	$('#limitlist').delegate('li', 'click', function(e){
		var t = $(this), a = t.find('.aa'), url = a.attr('data-url'), id = a.attr('data-id');
		var target = $(e.target);
		if(target.closest(".remind").length == 1){

		}else{
			location.href = url;
		}
	});


// 按钮状态 btn_01：立即抢购
// btn_02：提醒我
// btn_01：已抢光
// btn_01：取消提醒
	function getTime(time,tr){
		if(tr){
    		atpage = 1;
    		$("#limitlist").html("");
    	}
    	isload = true;
		$.ajax({
	      url: "/include/ajax.php?service=tuan&action=systemTime",
	      type: "GET",
	      dataType: "jsonp",
	      success: function (data) {
			if(data.state == 100){
				var list = data.info.list, now = data.info.now, nowTime = data.info.nowTime, html = [], className='';
				if(list.length > 0){
					for(var i = 0; i < list.length; i++){
						//判断是否是当前时间
						if(now == list[i].nowTime){
							var nextHour = list[i].nextHour;
							if(list[i].nextHour==time){
								className='active';
						    }else if((time=='' || time==undefined) && now == list[i].nowTime){
								className='active';
						    }else{
								className='';
						    }
							html.push('<li class="'+className+'" data-hour="'+list[i].nowTime+'" data-time="'+list[i].nextHour+'"><p>'+list[i].showTime+'</p><p>抢购中</p></li>');
						}else{
						    if(list[i].nextHour==time){
								className='active';
						    }else{
								className='';
						    }
							html.push('<li class="'+className+'" data-hour="'+list[i].nowTime+'" data-time="'+list[i].nextHour+'"><p>'+list[i].showTime+'</p><p>即将开始</p></li>');
						}
					}
					$("#limit").html(html.join(""));
					if(time!='' && time!=undefined){
						nextHour = time;
					}
					var parm = [];
					parm.push("page="+atpage);
					$.ajax({
						url: "/include/ajax.php?service=tuan&action=tlist&iscity=1&hourly=1&time="+nextHour+"&pageSize=3",//&hourly=1&time="+nextHour+"
						type: "GET",
						data: parm.join("&"),
						dataType: "jsonp",
						success: function (data) {
							if(data && data.state == 100 && data.info.list.length > 0){
								var list = data.info.list, html = [];
								if(list.length > 0){
									for(var i = 0; i < list.length; i++){
										html.push('<li class="fn-clear">');
								        html.push('  <div class="s_img"><img src="'+list[i].litpic+'"></div>');
								        html.push('  <div class="s_title">');
								        html.push('     <div class="bus_txt fn-clear"><span class="bus_txt_title business-txt">'+list[i].title+'</span></div>');
								        html.push('     <div class="price"><span class="discounted">'+echoCurrency('symbol')+'<em>'+list[i].price+'</em></span><span class="or_price">'+echoCurrency('symbol')+''+list[i].market+'</span></div>');
								        var state = '';
								        if(list[i].state==1){
											state = '<div data-url="'+list[i].url+'" class="btn_03 aa">已结束</div>';
								        }else if(list[i].state==2){
											state = '<div data-url="'+list[i].url+'" class="btn_01 aa">已抢光</div>';
								        }else if(list[i].state==3){
											state = '<div data-url="'+list[i].url+'" class="btn_01 aa">立即抢购</div>';
								        }else if(list[i].state==4){
											state = '<div data-url="'+list[i].url+'" data-id="'+list[i].id+'" class="btn_04 aa remind">取消提醒</div>';
								        }else if(list[i].state==5){
											state = '<div data-url="'+list[i].url+'" data-id="'+list[i].id+'" class="btn_02 aa remind">提醒我</div>';
								        }
								        html.push('     <div class="addr fn-clear"><span class="bb"><em>已抢'+list[i].sale+'件</em></span>'+state+'</div>');
								        html.push('   </div>');
								        html.push('</li>');
									}
									$("#limitlist").append(html.join(""));
									isload = false;
									//最后一页
									if(atpage >= data.info.pageInfo.totalPage){
										isload = true;
										$("#limitlist").append('<div class="loading">已经到最后一页了</div>');
									}
									$(".daojishi").fadeIn();
									countDown(nowTime, nextHour, '.daojishi', function(){
										//$(".daojishi").fadeOut();
										//fadeIn
										//$(".daojishi").show();
									});
								}else{
									isload = true;
									$("#limitlist").append('<div class="loading">暂无相关信息</div>');
								}
							}else{
							    $(".daojishi").fadeOut();
								$("#limitlist").html('<div class="loading">暂无相关信息</div>');
							}
						},
						error: function(){
							isload = false;
							$("#limitlist").html('<div class="loading">网络错误，加载失败！</div>');
						}
					});
				}
			}
	      }
	    });
	}
	//setInterval(getTime(),1000);
	getTime();

  $(window).scroll(function() {
    var allh = $('body').height();
    var w = $(window).height();
    var scroll = allh - w;
    if($(window).scrollTop() >= scroll && !isload) {
      atpage++;
	  isload = true;
	  getTime(nextHour);
    };
  });

	//提醒与取消提醒
  $("#limitlist").delegate(".remind","click",function(){
	var userid = $.cookie(cookiePre+"login_user");
	if(userid == null || userid == ""){
		window.location.href = masterDomain+'/login.html';
		return false;
	}
	var id = $(this).data('id');
	var t  = $(this);
	$.ajax({
    	url: "/include/ajax.php?service=tuan&action=remind",
    	type: "GET",
    	data: {id:id},
    	dataType: "json",
    	success: function (data) {
			if(data.state == 100){
				if(data.info==1){
					t.text('提醒我');
					t.removeClass('btn_04');
					t.addClass('btn_02');
				}else if(data.info==2){
					t.text('取消提醒');
					t.removeClass('btn_02');
					t.addClass('btn_04');
				}
			}
 		}
	});
  });

})