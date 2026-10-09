$(function(){
    // //导航全部分类
    $(".lnav").find('.category-popup').hide();

    $(".lnav").hover(function(){
        $(this).find(".category-popup").show();
    }, function(){
        $(this).find(".category-popup").hide();
    });

    


    //二维码

    // $('.info_list ul li .code').hover(function(){
    //     $(this).next('.code-img').addClass('show');
    // },function(){
    //     $(this).next('.code-img').removeClass('show');
    // })


	$('body').delegate('.code','hover',function () {
        $(this).next('.code-img').addClass('show');
    });

    $('body').delegate('.code','mouseout',function () {
        $(this).next('.code-img').removeClass('show');
    });

  var atpage = 1, isload = false, nextHour='',clearTime='', pageSize = 12;
  $(".flash_sale .info .info_header ul").delegate("li","click",function(){
	  var t = $(this);
	  if( !t.hasClass('active') ){
	    nextHour = t.attr("data-time");
	    getTime(nextHour,1);
		t.addClass('active');
		t.siblings().removeClass('active');
		t.siblings('nowtimcurr').css('color','#a0a0a0');
	  }
  });

  $('.daojishi').click(function () {
    $(".flash_sale .info .info_header ul li").each(function(){
        if($(this).hasClass('nowtimcurr')){
            nextHour = $(this).attr("data-time");
            getTime(nextHour,1);
        }
    });

    $('.active').removeClass('active');
    $(".flash_sale .info .info_header ul .nowtimcurr").addClass('active');
    $(this).css('color','#fff');
});


	//倒计时一次请求
    $.ajax({
        url: "/include/ajax.php?service=tuan&action=systemTime",
        type: "GET",
        dataType: "jsonp",
        success:function (data) {
            var list = data.info.list,nowTime = data.info.nowTime,now = data.info.now;
            for(var i = 0; i < list.length; i++){
                if(now ==list[i].nowTime){
                    var nextHour = list[i].nextHour;
                    var nowTime = data.info.nowTime;
                    var intDiff = nextHour - nowTime;

                    function timer(intDiff){
                        window.setInterval(function(){
                            var hour=0,
                                minute=0,
                                second=0;//时间默认值
                            if(intDiff > 0){
                                var hour = Math.floor((intDiff / 3600) % 24);
                                var minute = Math.floor((intDiff / 60) % 60);
                                var second = Math.floor(intDiff % 60);
                            }

                            $('.daojishi').find(".h").text(hour < 10 ? "0" + hour : hour);
                            $('.daojishi').find(".m").text(minute < 10 ? "0" + minute : minute);
                            $('.daojishi').find(".s").text(second < 10 ? "0" + second : second);
                            intDiff--;
                        }, 1000);
                    }
                    timer(intDiff);

                }
            }
        }
    });



    //点击 提醒与取消提醒不跳转页面
	$('#limitlist').delegate('li', 'click', function(e){
		var t = $(this), a = t.find('.btn'), url = a.attr('data-url'), id = a.attr('data-id');
		var target = $(e.target);
		if(target.closest(".remind").length == 1){

		}else{
            window.open(url, '_blank');
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
              // console.log(data);
			if(data.state == 100){
				var list = data.info.list, now = data.info.now, nowTime = data.info.nowTime, html = [], className='';

				if(list.length > 0){
					for(var i = 0; i < list.length; i++){

                        if(list[i].ketime == '0' || list[i].kstime == '0'){
                            continue;
                        }
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
                            $('.daojishi').css('color','#fff');

						    html.push('<li class="nowtimcurr '+className+'" data-hour="'+list[i].nowTime+'" data-time="'+list[i].nextHour+'"><p class="time">'+list[i].showTime+'</p><p class="state"><i>正在秒杀</i></p></li>');
						}else{
						    if(list[i].nextHour==time){
								className='active';
                                $('.daojishi').css('color','#333');
						    }else{
								className='';
						    }

							html.push('<li class="'+className+'" data-hour="'+list[i].nowTime+'" data-time="'+list[i].nextHour+'"><p class="time">'+list[i].showTime+'</p><p class="state"><span>即将开始</span></p></li>');
						}
					}
					$("#limit").html(html.join(""));
					if(time!='' && time!=undefined){
						nextHour = time;
					}
					var parm = [];
					parm.push("page="+atpage);

                    $("#limitlist").html('<div class="loading">加载中，请稍候...</div>');
                    // $("#limitlist .loading").html("加载中，请稍候...").show();
					$.ajax({
						url: "/include/ajax.php?service=tuan&action=tlist&iscity=1&hourly=1&time="+nextHour+"&pageSize=" + pageSize,//&hourly=1&time="+nextHour+"
						type: "GET",
						data: parm.join("&"),
						dataType: "jsonp",
						success: function (data) {
							$('#limitlist .loading').remove();
							if(data && data.state == 100 && data.info.list.length > 0){
								var list = data.info.list, html = [], pageinfo = data.info.pageInfo;
								if(list.length > 0){
									for(var i = 0; i < list.length; i++){
										html.push('<li class="fn-clear">');
								        html.push('  <div class="img"><img src="'+list[i].litpic+'"></div>');
								        html.push('  <div class="con">');
								        html.push('     <h4>'+list[i].title+'</h4>');
								        html.push('<p class="count">已抢'+list[i].sale+'件</p>');
								        html.push('<p class="price"><i>'+echoCurrency('symbol')+'</i><span>'+list[i].price+'</span><s><i>'+echoCurrency('symbol')+'</i>'+list[i].market+'</s></p>');
								        var state = '';
								        if(list[i].state==1){
											state = '<div data-url="'+list[i].url+'" class="btn_03 btn">已结束</div>';
								        }else if(list[i].state==2){
											state = '<div data-url="'+list[i].url+'" class="btn_01 btn">已抢光</div>';
								        }else if(list[i].state==3){
											state = '<div data-url="'+list[i].url+'" class="btn_01 btn">立即抢购</div>';
								        }else if(list[i].state==4){
											state = '<div data-url="'+list[i].url+'" data-id="'+list[i].id+'" class="btn_04 btn remind">取消提醒</div>';
								        }else if(list[i].state==5){
											state = '<div data-url="'+list[i].url+'" data-id="'+list[i].id+'" class="btn_02 btn remind">提醒我</div>';
								        }
								        html.push('     <div class="addr fn-clear"><span class="bb"></span>'+state+'</div>');
								        html.push('   </div>');
								        html.push('<img class="code" src="'+templets_skin+'images/qrcode.png">');
								        html.push('<div class="code-img"><img src="'+qrcodeurl+list[i].url+'" alt=""></div>');
								        html.push('</li>');
									}
									$("#limitlist").html(html.join(""));
									isload = false;
									totalCount = pageinfo.totalCount;
									showPageInfo();
									$(".daojishi").fadeIn();


                                    // countDown(nowTime, nextHour, '.daojishi', function(){
									// });

								}else{
									isload = true;
                                    $("#limitlist").html('<div class="loading">暂无相关信息</div>');
                                    $('.pagination').html('');
                                    // $(".daojishi").fadeOut();
								}
							}else{
							    //$(".daojishi").fadeOut();
                                $("#limitlist").html('<div class="loading">暂无相关信息</div>');
                                $('.pagination').html('');

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

	//打印分页
    function showPageInfo() {
        var info = $(".pagination");
        var nowPageNum = atpage;
        var allPageNum = Math.ceil(totalCount/pageSize);
        var pageArr = [];

        info.html("").hide();

        var pageList = [];
        //上一页
        if(atpage > 1){
            pageList.push('<a href="javascript:;" class="pg-prev"><i class="trigger"></i><span class="text">上一页</span></a>');
        }else{
            pageList.push('<span class="pg-prev"><i class="trigger"></i><span class="text">上一页</span></span>');
        }

        //下一页
        if(atpage >= allPageNum){
            pageList.push('<span class="pg-next"><span class="text">下一页</span><i class="trigger"></i></span>');
        }else{
            pageList.push('<a href="javascript:;" class="pg-next"><span class="text">下一页</span><i class="trigger"></i></a>');
        }

        //页码统计
        pageList.push('<span class="sum"><em>'+atpage+'</em>/'+allPageNum+'</span>');

        $("#bar-area .pagination").html(pageList.join(""));

        var pages = document.createElement("div");
        pages.className = "pagination-pages fn-clear";
        info.append(pages);

        //拼接所有分页
        if (allPageNum > 1) {

            //上一页
            if (nowPageNum > 1) {
                var prev = document.createElement("a");
                prev.className = "prev";
                prev.innerHTML = '上一页';
               prev.setAttribute('href','#');
                prev.onclick = function () {
                    atpage = nowPageNum - 1;
                    getTime(nextHour);
                }
                info.find(".pagination-pages").append(prev);
            }

            //分页列表
            if (allPageNum - 2 < 1) {
                for (var i = 1; i <= allPageNum; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    } else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                       page.setAttribute('href','#');
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            getTime(nextHour);
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
            } else {
                for (var i = 1; i <= 2; i++) {
                    if (nowPageNum == i) {
                        var page = document.createElement("span");
                        page.className = "curr";
                        page.innerHTML = i;
                    }
                    else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                      page.setAttribute('href','#');
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            getTime(nextHour);
                        }
                    }
                    info.find(".pagination-pages").append(page);
                }
                var addNum = nowPageNum - 4;
                if (addNum > 0) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = nowPageNum - 1; i <= nowPageNum + 1; i++) {
                    if (i > allPageNum) {
                        break;
                    }
                    else {
                        if (i <= 2) {
                            continue;
                        }
                        else {
                            if (nowPageNum == i) {
                                var page = document.createElement("span");
                                page.className = "curr";
                                page.innerHTML = i;
                            }
                            else {
                                var page = document.createElement("a");
                                page.innerHTML = i;
                              page.setAttribute('href','#');
                                page.onclick = function () {
                                    atpage = Number($(this).text());
                                    getTime(nextHour);
                                }
                            }
                            info.find(".pagination-pages").append(page);
                        }
                    }
                }
                var addNum = nowPageNum + 2;
                if (addNum < allPageNum - 1) {
                    var em = document.createElement("span");
                    em.className = "interim";
                    em.innerHTML = "...";
                    info.find(".pagination-pages").append(em);
                }
                for (var i = allPageNum - 1; i <= allPageNum; i++) {
                    if (i <= nowPageNum + 1) {
                        continue;
                    }
                    else {
                        var page = document.createElement("a");
                        page.innerHTML = i;
                      page.setAttribute('href','#');
                        page.onclick = function () {
                            atpage = Number($(this).text());
                            getTime(nextHour);
                        }
                        info.find(".pagination-pages").append(page);
                    }
                }
            }

            //下一页
            if (nowPageNum < allPageNum) {
                var next = document.createElement("a");
                next.className = "next";
                next.innerHTML = '下一页';
                next.setAttribute('href','#');
                next.onclick = function () {
                    atpage = nowPageNum + 1;
                    getTime(nextHour);
                }
                info.find(".pagination-pages").append(next);
            }

            //输入跳转
            var insertNum = Number(nowPageNum + 1);
            if (insertNum >= Number(allPageNum)) {
                insertNum = Number(allPageNum);
            }

            var redirect = document.createElement("div");
            redirect.className = "redirect";
            redirect.innerHTML = '<i>到</i><input id="prependedInput" type="number" placeholder="页码" min="1" max="'+allPageNum+'" maxlength="4"><i>页</i><button type="button" id="pageSubmit">确定</button>';
            info.find(".pagination-pages").append(redirect);

            //分页跳转
            info.find("#pageSubmit").bind("click", function(){
                var pageNum = $("#prependedInput").val();
                if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
                    atpage = Number(pageNum);
                    getTime(nextHour);
                } else {
                    $("#prependedInput").focus();
                }
            });

            info.show();

        }else{
            info.hide();
        }
    }


  // $(window).scroll(function() {
  //   var allh = $('body').height();
  //   var w = $(window).height();
  //   var scroll = allh - w;
  //   if($(window).scrollTop() >= scroll && !isload) {
  //     atpage++;
	//   isload = true;
	//   getTime(nextHour);
  //   };
  // });

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