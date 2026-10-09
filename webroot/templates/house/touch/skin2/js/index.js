$(function(){

	// var device = navigator.userAgent;
  	// if(device.indexOf('huoniao') > -1){
    //     $('.area a').bind('click', function(e){
    //         e.preventDefault();
    //         setupWebViewJavascriptBridge(function(bridge) {
    //             bridge.callHandler('goToCity', {'module': 'house'}, function(){});
    //         });
    //     });
    // }
	
	noReadMessage();
    //获取未读信息
    function noReadMessage(){
    	$.ajax({
   			url: "/include/ajax.php?service=member&action=message&type=tongji&im=1",
   			type: "GET",
   			dataType: "jsonp",
   			success: function (d) {
	           if(d.state == 100){
	               var list = d.list, pageinfo = d.info.pageInfo, html = [];
	               if(pageinfo.unread>0 || pageinfo.upunread > 0 || pageinfo.commentunread > 0 || pageinfo.im > 0){
						$("#message").show().html(pageinfo.unread+pageinfo.upunread+pageinfo.commentunread+pageinfo.im);
	               }else{
	               		$("#message").hide();
	               }
	           }else{
					$("#message").hide();
	           }
   			}
   		});
    }

 //    var lng = '', lat = '';

 //    HN_Location.init(function(data){
	// 	if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
	// 	  $('.properties ul').html('<div class="loading" style="text-align:center;">定位失败，请刷新页面</div>');
	// 	  $('.pns ul').html('<div class="loading" style="text-align:center;">定位失败，请刷新页面</div>');
	// 	}else{
	// 	  lng = data.lng, lat = data.lat;
	// 	  getloupanList();
	// 	}

		

	// });
	getloupanList();
	function getloupanList(){
		//楼盘
		$.ajax({
		    url: masterDomain + '/include/ajax.php?service=house&action=loupanList&pageSize=4&page=1',
		    dataType: 'jsonp',
		    success: function(data){
				if(data.state == 100){
			        var list = data.info.list, html = [];
			        for(var i = 0; i < list.length; i++){
						html.push('<li class="fn-clear">');
						html.push('<a href="'+list[i].url+'">');
						var video = list[i].video==1 ? '<i></i>' : '';
						html.push('<div class="rleft"><img onerror="this.src=`/static/images/404.jpg`" src="'+huoniao.changeFileSize(list[i].litpic, "large")+'" alt="'+list[i].title+'">'+video+'</div>');
						html.push('<div class="rright">');
							html.push('<div class="rtitle fn-clear">');
							if(list[i].isbid==1){
								html.push('<i></i>');
							}
							html.push('<p>'+list[i].title+'</p>');
							if(list[i].salestate==1){
								html.push('<em class="zaishou">在售</em>');
							}
							if(list[i].qj){
								html.push('<em class="quanjing">全景</em>');
							}
							if(list[i].shapancount==1){
								html.push('<em class="zaishou">沙盘</em>');
							}
							html.push('</div>');
							html.push('<div class="comment">');
							html.push('<span>');
							if(list[i].price>0){
								html.push('<em>'+list[i].price+'</em>&nbsp;&nbsp;');
								if(list[i].ptype==1){
									html.push(''+echoCurrency('short')+'/'+echoCurrency('areaname'));
								}else{
									html.push('万'+echoCurrency('short')+'/套');
								}
							}else{
								html.push('<em>待定</em>');
							}
							html.push('</span>');
							if(list[i].buildarea>0){
								html.push('<span>建面'+list[i].buildarea+echoCurrency('areaname')+'</span>');
							}else{
								html.push('<span>未知</span>');
							}
							html.push('</div>');
							html.push('<p class="addr">'+list[i].addr[list[i].addr.length-1]+'<span>'+(list[i].distance > 0 ? list[i].distance : '')+'</span></p>');


						html.push('</div>');
						html.push('</a>');
						html.push('<div data-tel="'+list[i].tel+'" data-phone="'+list[i].phone+'" class="tel"><img src="'+templets_skin+'images/hPhone.png" alt=""></div>');

						html.push('</li>');
			        }
			        $('.properties ul').append(html.join(''));
			    }else{
					$('.properties ul').html('<div class="loading" style="text-align:center;">'+data.info+'</div>');
			    }
		    },
		    error: function(){
	        	$('.loading').show();
				$('.properties ul').html('<div class="loading" style="text-align:center;">网络错误！</div>');
		    }
		});

		//租房
		$.ajax({
		    url: masterDomain + '/include/ajax.php?service=house&action=zuList&orderby=1&pageSize=4&page=1',
		    dataType: 'jsonp',
		    success: function(data){
				if(data.state == 100){
			        var list = data.info.list, html = [];
			        for(var i = 0; i < list.length; i++){
						html.push('<li class="fn-clear">');
						html.push('<a href="'+list[i].url+'">');
						var video = list[i].video==1 ? '<i></i>' : '';
						html.push('<div class="rleft"><img onerror="this.src=`/static/images/404.jpg`" src="'+huoniao.changeFileSize(list[i].litpic, "large")+'" alt="'+list[i].title+'">'+video+'</div>');
						html.push('<div class="rright">');
							html.push('<div class="rtitle fn-clear">');
							if(list[i].isbid==1){
								html.push('<i></i>');
							}
							html.push('<p>'+list[i].title+'</p>');
							html.push('</div>');
							html.push('<div class="comment fn-clear">');
							if(list[i].rentype==1){
								html.push('<span>合租</span>');
							}else{
								html.push('<span>整租</span>');
							}
							var price = list[i].price > 0 ? list[i].price + ''+echoCurrency('short')+'/月' : '面议';
							html.push('<span class="area">'+list[i].room+'</span><span class="area">'+list[i].area+echoCurrency('areaname')+'</span><em>'+price+'</em>');

							html.push('</div>');
							html.push('<p class="addr">'+(list[i].distances > 0 ? list[i].distances : '')+'<span class="addr_ess">'+list[i].addr[list[i].addr.length-1]+'</span></p>');

						html.push('</div>');
						html.push('</a>');
						html.push('</li>');
			        }
			        $('.pns ul').append(html.join(''));
			    }else{
					$('.pns ul').html('<div class="loading" style="text-align:center;">'+data.info+'</div>');
			    }
		    },
		    error: function(){
	        	$('.loading').show();
				$('.pns ul').html('<div class="loading" style="text-align:center;">网络错误！</div>');
		    }
		});
	}

    function getNews(){
        $.ajax({
            url: masterDomain + '/include/ajax.php?service=house&action=news&page=1&pageSize=6&litpic=1',
            type: 'get',
            dataType: 'jsonp',
            success: function(data){

                if(data.state == 100){
                    var tcNewsHtml = [], list = data.info.list;
                    var step = 1;
                    var img = '', imgUrl = '';

                    for (var i = 0; i < list.length; i++){
                        if(step == 1){
                            tcNewsHtml.push('<div class="swiper-slide swiper-no-swiping"><div class="mlBox">');
                            tcNewsHtml.push('<p><a href="'+list[i].url+'"><span>['+list[i].typename+']</span>'+list[i].title+'</a></p>');
                            if(list[i].litpic){
                                img = list[i].litpic;
                                imgUrl = list[i].url;
                            }
                        }

                        if(step == 2){
                            tcNewsHtml.push('<p><a href="'+list[i].url+'"><span>['+list[i].typename+']</span>'+list[i].title+'</a></p>');
                            if(img == '' && list[i].litpic){
                                img = list[i].litpic;
                                imgUrl = list[i].url;
                            }
                            step = 0;
                        }

                        if(step == 0 || i == list.length - 1){
                            tcNewsHtml.push('</div>');
                            step = 0;
                        }

                        if(img && step == 0){
                            tcNewsHtml.push('<div class="mrBox"><a href="'+imgUrl+'"><img onerror="this.src=`/static/images/404.jpg`" src="'+img+'" alt=""></a></div>');
                        }

                        if(step == 0) {
                            tcNewsHtml.push('</div>');
                        }
                        step++;

                    }

                    $('.tcNews .swiper-wrapper').html(tcNewsHtml.join(''));
                    new Swiper('.tcNews .swiper-container', {pagination: '.tcNews .pagination',direction: 'vertical',paginationClickable: true, loop: true, autoplay: 2000, autoplayDisableOnInteraction : false});

                }else{
                    $('.tcNews').hide();
                }
            }

        })
    }
    getNews();

    // banner轮播图
    new Swiper('.banner .swiper-container', {pagination: '.banner .pagination',loop: true,grabCursor: true,paginationClickable: true,autoplay:2000});

    // 滑动导航
    var t = $('.tcInfo .swiper-wrapper');
    var swiperNav = [], mainNavLi = t.find('li');
    for (var i = 0; i < mainNavLi.length; i++) {
        swiperNav.push('<li>'+t.find('li:eq('+i+')').html()+'</li>');
    }

    var liArr = [];
    for(var i = 0; i < swiperNav.length; i++){
        liArr.push(swiperNav.slice(i, i + 10).join(""));
        i += 9;
    }

    t.html('<div class="swiper-slide"><ul class="fn-clear">'+liArr.join('</ul></div><div class="swiper-slide"><ul class="fn-clear">')+'</ul></div>');
    new Swiper('.swipre00', {pagination: '.pag00', loop: false, grabCursor: true, paginationClickable: true});


    // 联系客服
    $('.kefu').click(function(){
        $('.phone_frame').show();
        $('.desk').show();
    });
    $('.phone_frame .phone_cuo').click(function(){
        $('.phone_frame').hide();
        $('.desk').hide();
    });

    // 电话弹出框
    $('.properties').delegate('.tel', 'click', function (e) {
      e.preventDefault();
      $("#tel").html('');
	  $("#phone").html('');
	  if($(this).attr('data-tel')!=''){
		$("#tel").html('<a href="tel:'+$(this).attr('data-tel')+'">'+$(this).attr('data-tel')+'</a>').show();
	  }else{
		$("#tel").hide();
	  }
	  if($(this).attr('data-phone')!=''){
		$("#phone").html('<a href="tel:'+$(this).attr('data-phone')+'">'+$(this).attr('data-phone')+'</a>').show();
	  }else{
	  	$("#phone").hide();
	  }
      $('.desk').show();
      $('.phone').show();
    });
    $('.phone .signout').click(function(){
      $('.desk').hide();
      $('.phone').hide();
    });

    // 联系客服
    $('.kefu').click(function(){
        $('.phone_frame').show();
        $('.desk').show();
    });
    $('.phone_frame .phone_cuo').click(function(){
        $('.phone_frame').hide();
        $('.desk').hide();
    });

})
