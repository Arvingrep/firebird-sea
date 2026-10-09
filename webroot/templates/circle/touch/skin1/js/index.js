var page = 1,mpage = 1, mload = 0,
	isload = 0;
var URL = location.href;
var URLArrary = URL.split('?action=');
var id_start = getParam('action') ? getParam('action') : listid;
var topictype = getParam('topictype') ? getParam('topictype') : '';
function getParam(name) {
   return location.href.match(new RegExp('[?#&]' + name + '=([^?#&]+)', 'i')) ? RegExp.$1 : '';
}
$(function() {
	//APP端取消下拉刷新
	toggleDragRefresh('off');
	
	function getParam(name) {
        return location.href.match(new RegExp('[?#&]' + name + '=([^?#&]+)', 'i')) ? RegExp.$1 : '';
    }
	// 给表情添加对应的字符
	$(".bq_box").html(appendEmoji());
	
	
	setTimeout(function(){
		$('.go_fabu a').css({'width':".84rem"})
		$('.go_fabu').animate({'right':".3rem"},300)
	},5000)
	set_focus($('#reply'));
	//错误提示
	var showErrTimer;
	function showErr(txt) {
		showErrTimer && clearTimeout(showErrTimer);
		$(".popErr").remove();
		$("body").append('<div class="popErr"><p>' + txt + '</p></div>');
		$(".popErr p").css({
			"margin-left": -$(".popErr p").width() / 2,
			"left": "50%"
		});
		$(".popErr").css({
			"visibility": "visible"
		});
		showErrTimer = setTimeout(function() {
			$(".popErr").fadeOut(300, function() {
				$(this).remove();
			});
		}, 1500);
	}
	// 新增存储 获取定位
	var localData = utils.getStorage('circle_local');
	if(localData != null){
		var last = localData.time;
	}else{
		var last = 0;
	}
	var time = Date.parse(new Date());
	if(local == 'manual' || (time - last < 60*10*1000)){
		lat = localData.lat;
		lng = localData.lng;
		utils.setStorage('circle_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address': localData.address}));
	}else{
		//获取定位
		HN_Location.init(function (data) {
		    if (data == undefined || data.address == "" || data.lat == "" || data.lng == "") {
				console.log('定位获取失败');
		     } else {
		         lat = data.lat;
		         lng = data.lng;
				 name = data.name;
		         address = data.address instanceof Array ? data.address[0] : data.address;
				 utils.setStorage('circle_local', JSON.stringify({'time': time, 'lng': lng, 'lat': lat, 'address':name}));
				setTimeout(function(){
					 console.log(utils.getStorage('circle_local'));
				},1000)
		    }
		});
	}

  	 $(".footer_4_3 li").click(function(e){
    	var index = $(this).index();
    	if(index==1){
    		$(".nav_box li").eq(4).click();
    		e.preventDefault()
    	}else if(index==0){
    		$(".nav_box li").eq(0).click();
    		e.preventDefault()
    	}
    	
    })

    //调起原生应用
	$('.swiper-body').delegate('.li_box .dt_detail','click',function(e){
		var t = $(this),p = t.parents('.li_box');
		var v = t.find('.video_item');
		var vid = p.attr('data-id');
		if(device.indexOf('huoniao') > -1 && v.size()>0){
	      var param = {
			id:vid,
	      };
	      setupWebViewJavascriptBridge(function(bridge) {
	        bridge.callHandler('circlePlayVideo',  param, function(responseData){
	        	console.log(responseData)
	        });
	      });
	      e.preventDefault();
	    }
	});

	// 短视频原生页面
	$('.swiper-body').delegate('.liBox','click',function(e){
		var t = $(this);
		var vid = t.attr('data-id');
		if(device.indexOf('huoniao') > -1 ){
		  var param = {
			id:vid,
		  };
		  setupWebViewJavascriptBridge(function(bridge) {
		    bridge.callHandler('circlePlayVideo',  param, function(responseData){
		    	console.log(responseData)
		    });
		  });
		  e.preventDefault();
		}
	})

	// 页面滑动切换
	var swiper = new Swiper('.swiper-container.swiper-body', {
		//initialSlide: 1,
		autoHeight: true,
		noSwiping: true,
		longSwipesRatio: 0.4,
		touchAngle: 15,
		observer: true,
		observeParents: true,
		on: {
			init: function(){
				var p = $('#tabs-container>.swiper-wrapper>.swiper-slide').eq(0).find('.tab_con ul.show');
				$('.refreshText').addClass('shorttxt')
				getlist(p); //初始加载推荐最新
			},
			slideChangeTransitionStart: function() {
				window.scroll(0,0);
				isload = 1;
				$('.mask_change').click();
				$('.swiper-slide.slide_con').css("min-height", $(window).height());
				$('.fixedTop').hide();
				$('.nav_box li').eq(this.activeIndex).addClass('li_on').siblings('li').removeClass('li_on');
				var index_icon = $(".footer_4_3 li:first-child").find('a').attr("data-icon1");
				var index_icon2 = $(".footer_4_3 li:first-child").find('a').attr("data-icon2");
				var ht_icon = $(".footer_4_3 li:nth-child(2)").find('a').attr("data-icon1");
				var ht_icon2 = $(".footer_4_3 li:nth-child(2)").find('a').attr("data-icon2");
				
				if(this.activeIndex==4){console.log(ht_icon2)
					$(".footer_4_3 li:nth-child(2)").find('img').attr('src',ht_icon2);
					$(".footer_4_3 li:first-child").find('img').attr('src',index_icon);
				}else{
					$(".footer_4_3 li:nth-child(2)").find('img').attr('src',ht_icon);
					$(".footer_4_3 li:first-child").find('img').attr('src',index_icon2);
				}
				var tid = $('.li_on').attr('data-id');
				// window.location.href = URLArrary[0] + '#' + (tid ? tid : listid);
				console.log(window.location.href)
				var nurl = window.location.href.split('?action=');
				var nurl2 = window.location.href.split('&action=');
				var prarm = '';
				if(nurl.length>1){
					prarm = nurl[1].replace(nurl[1].split('')[0],"") 
					window.history.replaceState({}, 0, '?action=' + (tid ? tid : listid)+prarm);
				}else if(nurl2.length>1){
					var prarm1 = nurl2[0].split('?')[1];
					var prarm2 = nurl2[1].replace(nurl2[1].split('')[0],"")
					window.history.replaceState({}, 0, prarm1 + '&action=' + (tid ? tid : listid) + prarm2);
				}

				if (this.activeIndex == 0 && $(window).scrollTop() <= $('.content_box').offset().top) {
					$('.nav_box').hide();
					$('#tabs-container>.swiper-wrapper>.swiper-slide').eq(this.activeIndex).addClass('swiper-no-swiping');
				} else {
					$('.nav_box').show();
				}
				var len = $('#tabs-container>.swiper-wrapper>.swiper-slide').eq(this.activeIndex).find('.li_box').length;

				if (this.activeIndex == 1 && len == 0) {
					getlist($('.gz_ulbox'),'follow');
				} else if (this.activeIndex == 0 && len == 0) {
					var p = $('#tabs-container>.swiper-wrapper>.swiper-slide').eq(1).find('.tab_con ul.show');
					// getqlist(); //加载推荐页话题数据
					getlist(p); //初始加载推荐最新
				} else if (this.activeIndex == 3 && len == 0) {
					setTimeout(function(){
					  $(".nav_box li").eq(this.activeIndex).attr('data-page',1)
                      getlist($('.near_dt'),'fujin');
                    },1500)

				} else if (this.activeIndex == 4 && $('#tabs-container>.swiper-wrapper>.swiper-slide').eq(this.activeIndex).find('.t_li').length ==
					0) {
					topiclist();
				} else if(this.activeIndex == 2){  //短视频
					getsvlist();
				}else{
					console.log('已加载')
				}
			},
			slideChangeTransitionEnd: function() {
				if(this.activeIndex == 0){
					$('.refreshText').addClass('shorttxt')
				}else{
					$('.refreshText').removeClass('shorttxt')
				}
				setTimeout(function() {
					var page = $('.nav_box li.li_on').attr('data-page');
					var total = $('.nav_box li.li_on').attr('data-total');
					if (total*1 > page*1) {
						isload = 0;
					} else {
						isload = 1;
					}
				}, 1000);
			}
		},
	});
	if (id_start != '0') {
		swiper.slideTo(id_start);
		if(topictype == 'mytopic'){
			setTimeout(function(){
				$('.join_btn').click();
			}, 500);
		}
	} else if (listid) {
		swiper.slideTo(listid);
	}
	// 点击切换
	$('.nav_box li,.cate_nav li').click(function() {
		var t = $(this);
		index = t.index();
		if (index !=5) {
			swiper.slideTo(index);
		}
	});

	$(window).bind('hashchange', function() {
		var change = location.href;
		var n_url = change.split('?action=');
		var hash = n_url[1] ? n_url[1] : '1';
		swiper.slideTo(hash);
	});

	//返回顶部
	$('.fastTop').off('tap').bind('tap',function(){
		$(window).scrollTop(0);
		$('.fixedTop').hide();
	})

	// 滚动出现顶部导航
	var windowTop = 0;
	$(window).scroll(function() {
		var scrolls = $(window).scrollTop(); //获取当前可视区域距离页面顶端的距离
		if($(window).scrollTop() > 400) {
		     $('.popupRightBottom .fastTop').css("visibility", "visible");
	    }else{
		     $('.popupRightBottom .fastTop').css("visibility", "hidden");
		}
		if (swiper.activeIndex == 0) {
			if (scrolls > $('.cate_nav').offset().top) {
				$('.nav_box').show();
				$('.swiper-wrapper .swiper-slide').eq(swiper.activeIndex).removeClass('swiper-no-swiping');
                var tb_top = $('.swiper-slide-active .tab_ul').offset().top;
				var sw_top = $(window).scrollTop();
				// 向上滑显示向下滑隐藏
				if (scrolls >= windowTop) { //当B>A时，表示页面在向上滑动
					//需要执行的操作
					windowTop = scrolls;
					$('.rec_top').hide();

				} else { //当B<a 表示手势往下滑动
					//需要执行的操作
					windowTop = scrolls;

                  if(sw_top > tb_top){
						$('.rec_top').show().siblings('.topic_top').hide();
					}else{
						$('.rec_top').hide();
					}
				}
			} else {
				$('.swiper-wrapper .swiper-slide.slide_con').eq(swiper.activeIndex).addClass('swiper-no-swiping');
				$('.nav_box').hide();
			}


		} else if (swiper.activeIndex == 3 || swiper.activeIndex == 4) {
			// 向上滑显示向下滑隐藏
			// var st = $('.swiper-slide.slide_con').eq(swiper.activeIndex).find('.tab_ul').offset().top;
			var tb_top = swiper.activeIndex==3?$('.swiper-slide-active .tab_ul').offset().top:$('.tlist_box').offset().top;
			var sw_top = $(window).scrollTop();
			if (scrolls >= windowTop) { //当B>A时，表示页面在向上滑动
				//需要执行的操作
				windowTop = scrolls;
				$('.fixedTop[data-type="' + swiper.activeIndex + '"]').hide();

			} else { //当B<a 表示手势往下滑动
				//需要执行的操作
				windowTop = scrolls;
               if(sw_top > tb_top){
					$('.fixedTop[data-type="' + swiper.activeIndex + '"]').show().siblings('.fixedTop').hide();
				}else{
					$('.fixedTop[data-type="' + swiper.activeIndex + '"]').hide();
				}

			}
		} else {
			$('.fixedTop').hide();
		}

		// 滚动加载
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w - 100;
		if ($(window).scrollTop() >= scroll && !isload) {
			windowTop = scrolls;
			console.log('测试下拉加载')
			if (swiper.activeIndex == 1) {
				if ($('.gz_tip').hasClass('fn-hide')) {
					getlist($('.recgz_ul'),"nofollow")

				} else {

					getlist($('.gz_ulbox'),'follow')
				}
			} else if (swiper.activeIndex == 0) {
				getlist($('.swiper-slide.slide_con.rec_slide').find('.tab_con>ul.show'));
			} else if (swiper.activeIndex == 4) {
				topiclist();
			}else if(swiper.activeIndex == 2){
				getsvlist();
			} else if (swiper.activeIndex == 3) {
				if ($('.near_dt').hasClass('show')) {
					console.log('111')
					getlist($('.near_dt'),"fujin");
				} else {
					aplist();
				}
			}
		}
	});

	// tab点击切换内容
	$('.fixedTop li').click(function(e) {
		var t = $(this),
			p = t.parents('.fixedTop'),
			index = t.index();
		var tid = p.attr('data-type');
		t.addClass('on_chose').siblings('li').removeClass('on_chose');
		if (p.hasClass('near_top')) {
			if (index == 1) {
				$(window).scrollTop(0)
				return false;
			} else if (index == 2) {
				$('.swiper-slide.slide_con').eq(tid).find('.tab_ul li').eq(1).click();
			} else {
				$('.swiper-slide.slide_con').eq(tid).find('.tab_ul li').eq(index).click();
			}

		}else if(p.hasClass('topic_top')){
			console.log(tid)
			$('.topic_slide .btn_group a').eq(index).click()
		}

		$('.swiper-slide.slide_con').eq(tid).find('.tab_ul li').eq(index).click();
	});

	$('.tab_ul li').click(function() {

		var t = $(this),
			index = t.index(),
			pp = t.parents('.swiper-slide.slide_con');
		var tid = pp.index();
		var n_page = $('.nav_box li.li_on').attr('data-page');
		var t_page = t.attr('data-page');
		var n_total = $('.nav_box li.li_on').attr('data-total');
		var t_total = t.attr('data-total');

		if (!t.hasClass('on_chose')) {
			t.siblings('li').attr('data-page', n_page).attr('data-total', n_total);
			$('.nav_box li.li_on').attr('data-page', t_page).attr('data-total', t_total);
			t.addClass('on_chose').siblings('li').removeClass('on_chose');
			if (tid == 2 && index == 1) {
				$('.fixedTop[data-type="' + tid + '"] li').eq(2).addClass('on_chose').siblings('li').removeClass('on_chose');
			} else {
				$('.fixedTop[data-type="' + tid + '"] li').eq(index).addClass('on_chose').siblings('li').removeClass('on_chose');
			}

			$('.swiper-slide.slide_con').eq(tid).find('.tab_con>ul').eq(index).siblings('ul').removeClass('show');
			$('.swiper-slide.slide_con').eq(tid).find('.tab_con>ul').eq(index).addClass('show');
			swiper.updateAutoHeight(500);
			// 如果没有加载过数据，需要请求一次
			if ($('.swiper-slide.slide_con').eq(tid).find('.tab_con>ul').eq(index).find('li').length == 0) {
				if (tid == 0) {
					getlist($('.swiper-slide.slide_con').eq(tid).find('.tab_con>ul.show'));
				} else if (tid == 3) {
					//附近的人
					aplist()
				} else {
				}
			}

		} else {
			// console.log('不需要切换哟');
		}




	})


	// 跳转至话题
	$('.go_link').click(function() {
		swiper.slideTo(4)
	});

	// 点赞
	$('body').delegate('.zan_btn', 'click', function() {
		var userid = $.cookie(cookiePre + "login_user");
		if (userid == null || userid == "") {
			window.location.href = masterDomain + '/login.html';
			return false;
		}
		var t = $(this),
			num = t.find('em').text() == "" ? 0 : Number(t.find('em').text())
		var did = t.attr("data-did");
		var uid = t.attr("data-uid");
		$.ajax({
			url: "/include/ajax.php?service=circle&action=Fabulous",
			data:{'did':did,'fbuid':uid,'dzuid':dzuid},
			type:"POST",
			dataType:"json",
			success:function(data){
				// console.log(data.info);
				if(data.info =="ok"){
					if (t.hasClass('zaned')) {
							t.removeClass('zaned');
							num = num - 1;
					} else {
						t.find('.canvas_box').show();
						setTimeout(function() {
							t.find('.canvas_box').hide();
							t.addClass('zaned');
						}, 500)
						num = num + 1;
                    }
                }else{
                    showErrAlert(data.info);
                }
			t.find('em').text(num > 0 ? num : "");
			},
			error:function(){

			}
		});

	});

	// 短视频点赞

	$('body').delegate('.liBox .numZan','click',function(e){
		var t = $(this);
		var vid  = t.parent('._right').attr('data-id');
		var uid = t.parent('._right').attr('data-uid');
		var num = t.text()*1;
		var userid = $.cookie(cookiePre + "login_user");
		if (userid == null || userid == "") {
			window.location.href = masterDomain + '/login.html';
			return false;
		}
		$.ajax({
			url: "/include/ajax.php?service=circle&action=Fabulous",
			data:{'did':vid,'fbuid':uid,'dzuid':dzuid},
			type:"POST",
			dataType:"json",
			success:function(data){
				// console.log(data.info);
				if(data.info =="ok"){
					if (t.hasClass('onclick')) {
							t.removeClass('onclick');
							num = num - 1;
					} else {
						t.find('.canvas_box').show();
						setTimeout(function() {
							t.addClass('onclick');
						}, 500)
						num = num + 1;
					}
				}else{
                    showErrAlert(data.info);
                }
				t.text(num > 0 ? num : "");
				return false;
			},
			error:function(){

			}
		});
		return false;

	})



	var scroll = 0,
		pHeight = 0;
	// 评论
	$('body').delegate('.commt_btn,.comt_btn', 'click', function() {
		scroll = $(this).offset().top;
		var id = $(this).parents('.li_box').attr('data-id')
		pHeight = $(this).parents('.li_box').height()
		$('.bottom_box,.mask_re').show();
		$('.bottom_box').attr('data-reply',id);
        $('.bottom_box').removeAttr('data-type');
		 $('#reply').click();
		$('html').addClass('noscroll');
	});
	$('.mask_re').on('click', function() {
		$('.bottom_box #reply').blur();
		$('.bottom_box,.mask_re').hide();
		$('.bq_box').removeClass('show');
		$('.bq_btn').removeClass('bq_open');
		$('html').removeClass('noscroll');

	});
	$('#reply').click(function(){
		var t = $(this);
		 $('.bq_btn').removeClass('bq_open');
		 $('.bq_box').removeClass('show')
         t.focus();
	})
	// 隐藏评论框
	// $('.bottom_box #reply').blur(function() {
	// 	// $('.bottom_box,.mask_re').hide();
	// 	// setTimeout(function() {
	// 	// 	window.scroll(0, 400); //失焦后强制让页面归位
	// 	// }, 100);
	// 	scroll = 0;
 //        //$('.mask_re').click();
	// 	$('html').removeClass('noscroll');
	// });


	// 更多
	$('body').delegate('.btn_group .r_btn', 'click', function() {
		var t = $(this),
			id = t.parents('.li_box').attr('data-id');
		var name = t.parents('.li_box').find('.r_info h4 .artname').text();
		var title = t.parents('.li_box').find('.art_con h2').text();
		$('.mask_more').show();
		$('html').addClass('noscroll');
		$('.more_box').animate({
				'bottom': 0
			}, 150)
			.attr('data-id', id)
			.attr('data-name', name)
			.attr('data-title', title);
	});

	// 隐藏更多
	$('.mask_more,.cancel_btn').click(function() {
		$('.mask_more').hide();
		$('html').removeClass('noscroll')
		$('.more_box').animate({
				'bottom': '-4.1rem'
			}, 150)
			.removeAttr('data-id')
			.removeAttr('data-name')
			.removeAttr('data-title');
	});

	// 附近的人筛选
	$('.c_type i').click(function(e){
		var t = $(this);
		$('.mask_change').show();
		$('.sx_person span').off('click').click(function(){
			var sex = $(this).attr('data-type')?$(this).attr('data-type'):"";
			$('.near_person').html('');
			$(this).addClass('on_span').siblings('span').removeClass('on_span')
			$('.c_type').click();
			$('.mask_change').hide();

			$('.nav_box .li_on').attr('data-page','1');
			aplist(sex);
		});
		e.stopPropagation();
	});

	$('.area_box i.chose_ptype').click(function(){
		var scroll = $('.area_box .tab_ul').offset().top;
		$(window).scrollTop(scroll);
		$('.c_type i').click();
	})

	$('.bq_btn').click(function(){
		var t = $(this);
		$('.bq_box').addClass('show');

	})


	// 隐藏
	$('.mask_change').on('touchmove',function(){
		$(this).hide();
	})
	$('.mask_change').on('click',function(){
		$(this).hide();
	})

	// 参与/创建话题切换
	$('.topic_slide .btn_group a').click(function(){
		var t = $(this),txt = t.find('h3').text();
		$('.mask_topic').show();
		$('.myt_box').find('h2 span').text(txt)
		$('.myt_box').animate({"bottom":0},150);
		mpage = 1,mload = 0;
		if(t.hasClass('create_btn')){
			topic_my('create')
		}else{
			topic_my('join')
		}
		$('html').addClass('noscroll');
		var index = t.index()
		$('.topic_top li').eq(index).addClass('on_chose').siblings('li').removeClass('on_chose')
	});

	// 隐藏参与/创建话题
	$('.myt_box .close_btn').click(function(){
		$('html').removeClass('noscroll');
		$('.mask_topic').hide();
		$('.myt_box').animate({"bottom":"-90%"},150);
	});

	$('.mask_topic').on('touchstart',function(){
		$('html').removeClass('noscroll');
		$('.mask_topic').hide();
		$('.myt_box').animate({"bottom":"-90%"},150);
		return false;
	});

	// 滚动加载
	$('.myt_list').scroll(function(){
		// 滚动加载
		var allh = $('.myt_list ul').height();
		var w = $('.myt_list').height();
		var scroll = allh - w;
		if ($('.myt_list').scrollTop() >= scroll && !mload){
			var type = $('.topic_top .on_chose').attr('data-type');
			topic_my(type)
		}

	})

	// 关注
	$('body').delegate('.care_btn','click',function(){
		var t = $(this),p = t.parents('li.p_li');
		var id = p.attr('data-id');
		if (id == undefined) {
			var id = t.attr('data-userid');
			if (id == undefined) {
				alert("参数有误");
				return;
			}

		}
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
		  window.location.href = masterDomain+'/login.html';
		  return false;
		}

	    if ($(this).hasClass('cared')) {
	        $(this).removeClass('cared').html(langData['circle'][0][1]);  /* 关注*/
	    } else {
	        $(this).addClass('cared').html(langData['circle'][0][50]);   /* 已关注*/
	    }

	    $.post("/include/ajax.php?service=member&action=followMember&id=" + id);

	    return false;
	})

	// 获取话题排行数据
	function getqlist() {

		url = "/include/ajax.php?service=circle&action=alist&mold=0";
		data = {
			'page': '1',
			'pageSize': 10,
			'flag': 'h'
		}
		$.ajax({
			url: url,
			type: "GET",
			data: data,
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [],list2=[];
					$('.topic_ph').find('dd').remove();
					for (var i = 0; i < data.info.list.length; i++) {
						var d = data.info.list[i];
						if (i == 0) {
							$('.hot_dt').find('img').attr('src', d.litpic);
							$('.hot_dt').find('h2').html('#' + d.title + '#');
							$('.hot_dt').find('.r_t').html(d.click + langData['circle'][0][51]);  /* 浏览*/
						} else if(i<7){
							list.push('<dd><a href="' + d.url + '">#' + d.title + '#</a></dd>');
						}else if(i<9){
							list2.push('<li><a href="'+ d.url +'"><img src="'+ d.litpic+'"><p>#'+d.title+'#</p></a></li>')
						}else{
							list2.push('<li><a href="javascript:;" class="go_link"><img src="'+d.litpic+'"><p><em>More</em>'+langData['circle'][0][18]+' &gt;</p></a></li>')
						}
					}
					// list2.push('<li><a href="javascript:;" class="go_link"><img src="'+templates_skin+'upfiles/banner_image.png"><p><em>More</em>更多话题 &gt;</p></a></li>')
					$('.topic_ph').append(list.join(''));
					$('.topic_ul').html(list2.join(''))
				} else {
					$('.hot_topic').hide();
				}
			},
			error: function(err) {
				console.log('fail');

			}
		});
	};


	// 获取列表数据   以贴吧数接口为例
	function getlist(p,type) {
		isload = 1;
		var page = $('.nav_box .li_on').attr('data-page');
		var orderby = $('.slide_con.swiper-slide-active').find('.tab_con .show').attr('data-order');
		p.find('.loading_tip').remove()
		p.append('<div class="loading_tip"><img src="' + templets_skin + 'images/loading.png" ></div>');
		url = "/include/ajax.php?service=circle&action=tlist";
		data = {
			'page': page,
			'pageSize': 10,
			'orderby': orderby ? orderby : "",
			'type': type ? type : '',
			'lat':lat,
			'lng':lng
		}
		$.ajax({
			url: url,
			type: "GET",
			data: data,
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [];
					var datalist = data.info.list;
					$('.nav_box .li_on').attr('data-total', data.info.pageInfo.totalPage);

					for (var i = 0; i < datalist.length; i++) {
						var d = datalist[i];
                     	var clsname = ''
                        if(d.isfollow==1){
                          clsname = 'cared'
                          ctxt = langData['circle'][0][50] ;//已关注
                        }else{
                          clsname = '';
                          ctxt = langData['circle'][0][1] ;//关注
                        }
                        var level = (d.level!="0")?Number(d.level):0;
                      	var levicon = (d.usertype == '2')?"":"fn-hide";
						var levelname = d.levelname?d.levelname:langData['circle'][3][25];   //普通会员
                        //是否热门
                        var hottag = (d.zan*1>customhot*1?"hot_con":"");
						list.push('<li class="li_box" data-id="' + d.id + '" data-url="' + d.url + '">');
						if (p == $('.recgz_ul')) { //关注板块的
							list.push('<div class="rec_tip"><p>'+langData['circle'][3][26]+'</p></div>')  //来自你参与的话题
						}
						/* 作者信息s */
						list.push('<a href="'+masterDomain+'/user/'+d.userid+'" class="art_ib"><div class="left_head">');
						if (d.photo) {
								var phonimg = d.photo;
							}else{
								var phonimg = "/static/images/noPhoto_40.jpg";
							}
						list.push('<img src="' +phonimg + '" /><div class="v_log '+levicon+'">');
						list.push('<img src="' + templets_skin + 'upfiles/vip.png" /></div></div>');
						list.push('<div class="r_info vip_icon">');
						list.push('<h4><span class="artname">' + (d.username) + '</span><div class="lBox level_'+level+'">'+(level>0?'<i><img src="'+ d.levelicon +'"></i>':'')+'<span>'+levelname+'</span></div></h4>');
						list.push('<p class="pub_time">' + d.pubdate1 +"  "+ (type=='fujin'?d.juli:"") +'</p></div>');

						if (p[0] == $('.recgz_ul')[0]) { //关注板块的
							list.push('<a href="javascript:;" class="care_btn '+clsname+'" data-userid ="'+d.userid+'">'+ ctxt +'</a>');
						}
                      list.push('</a>')
						/* 作者信息e */

						list.push('<div class="art_con '+hottag+'"><a href="' + d.url + '" class="dt_detail">' + (d.content ? "<h2>" + d.content +
							"</h2>" : ""));
						//图片内容
						if (d.media.length == 2 || d.media.length == 4) {
							list.push('<div class="img_box fn-clear">');
							for (var m = 0; m < d.media.length; m++) {
								list.push('<div class="img_item d_img"><img data-url=' + d.media[m] + ' src='+d.media[m]+'></div>');
							}
							list.push('</div>');
						} else if (d.media.length > 4 || d.media.length == 3) {
							var imglen = d.media.length > 9 ? 9 : d.media.length
							list.push('<div class="img_box fn-clear">');
							for (var l = 0; l < imglen; l++) {
                              	var style = ((l+1)%3==0)?"style='margin-right:0'":""
								list.push('<div class="img_item m_img" '+style+'><img data-url=' + d.media[l] + ' src='+d.media[l]+'></div>');
							}
							list.push('</div>');
						} else if (d.media.length == 1) {
							list.push('<div class="img_box fn-clear">');
							/*一张图片判断尺寸   <div class="img_item h_img video_item"><img src="{#$templets_skin#}upfiles/bg1.jpg"><em>0:56</em></div>*/
							list.push('<div class="img_item v_img"><img data-url=' + d.media[0] + ' src='+d.media[0]+'></div>')
							list.push('</div>');
						}else if(d.media.length==0 && d.videoadr!=''){
							list.push('<div class="img_box fn-clear">');
							var img_v = (d.thumbnail=="")?templets_skin+'images/sv_icon.png':d.thumbnail
							list.push('<div class="img_item h_img video_item"><img data-url="'+img_v+'" src="'+(page==1?huoniao.changeFileSize(d.thumbnail, "large"):"/static/images/blank.gif")+'"></div>')
							list.push('</div>');
						}

						list.push('</a>')
						// 链接
                        if(d.commodity != ''&& d.commodity!=null && d.commodity.length>0){
                           list.push('<a class="link_out" href="'+d.commodity[0]['url']+'"><div class="left_img"><img src="' +d.commodity[0]['litpic']+
							 '"></div><p>'+d.commodity[0]['title']+'</p></a>');
                           }


						// 话题链接
                      if(d.topictitle){
                         list.push('<a class="topic_link" href="'+d.topicurl+'">'+d.topictitle+'</a>');
                        }

						// 定位
                       if(d.addrname){
                         list.push('<a href="javascript:;" class="posi_link">'+d.addrname+'</a>');
                       }


						// 点赞按钮
						list.push('<div class="btn_group"><a href="javascript:;" class="r_btn"></a>');
						list.push('<div class="left_btns"><a href="javascript:;" class="comt_btn">' + (d.reply > 0 ? d.reply : "") +
							'</a>');
						if(d.isdz == '1'){
							var zclass = "zan_btn zaned";
						}else{
							var zclass = "zan_btn ";
						}
						list.push('<a href="javascript:;" class="'+zclass+'" data-did ="'+d.id+'" data-uid = "'+d.userid+'"><div class="canvas_box"><img src="' + templets_skin +
							'images/zan.gif" /></div><em>' + (d.up > 0 ? d.up : "") + '</em></a>');
						let isapp=Boolean(navigator.userAgent.toLowerCase().match(/huoniao/));
						list.push(`<a href="javascript:;" class="share_btn${isapp?'':' hidea'} "></a><a href="javascript:;" class="HN_PublicShare hidea"  style="display:none;"></a></div></div>`);

						// 点赞列表
						if (d.up != 0 || d.reply != 0) {
							list.push('<div class="comt_box">');
							if (d.up != 0) {
								list.push('<div class="zan_box"><ul class="zan_ul fn-clear">');
								// console.log(d);
								for (var a = 0; a < ((d.dianres.length)>8?8:(d.dianres.length)); a++) {

									list.push('<li class="zan_li"> <a href="'+masterDomain+'/user/'+ d.dianres[a].id +'#circle"><img src="' +  (d.dianres[a].photo?d.dianres[a].photo:("/static/images/noPhoto_100.jpg" ))+ ' " onerror="this.src= \'/static/images/noPhoto_100.jpg\'"></a> </li>')
								}
								list.push('<a href="javascript:;" class="zan_count"><em>' + d.up + '赞</em></a>')
								list.push('</ul></div>');
							}
							if (d.reply != 0) {
								list.push('<div class="comt_list"><ul class="comt_ul">');
								for (var n = 0; n < d.lastReply.length; n++) {
									list.push('<li class="comt_li" data-plid = "'+d.lastReply[n].id+'"> <a href="javascript:;">'+d.lastReply[n].nickname+'</a>：'+d.lastReply[n].content+' </li>')
								}
								if (d.lastReply.length == "3") {
									list.push('<a href="'+d.url+'" class="comt_detail">全部'+d.reply +'条评论></a>')
								}
								list.push('</ul><div class="commt_btn">'+langData['circle'][0][53]+'</div></div>');  /* 写评论*/

							}
							list.push('</div>')
						}

						list.push('</div></li>')
					}
					p.find('.loading_tip').remove();
					if(page==1){
						p.html(list.join(''));
					}else{
						p.append(list.join(''));
					}

					setTimeout(function() {
						isload = 0;
						page++;
						$('.nav_box .li_on').attr('data-page', page);
						if (page > data.info.pageInfo.totalPage) {
							p.append('<div class="loading_tip">'+ langData['circle'][0][54]+'</div>');   /*  没有更多了~  */
							isload = 1;
						}

						swiper.updateAutoHeight(500);
					}, 1000)
					// console.log($('#tabs-container>.swiper-wrapper').height())
					 $("img").scrollLoading();

				} else {
					isload = 0;
					p.find('.loading_tip').remove();
					if ($('.nav_box .li_on').index() != 1) {
						p.append('<div class="loading_tip">'+ langData['circle'][0][55]+'</</div>');   /*  暂无数据  */
					} else if ($('.gz_ulbox li').length == 0 && $('.gz_ulbox')[0]==p[0]) {
						// && p== $('.gz_ulbox')
						$('.gz_ulbox').hide();
						$('.rec_box').show();
						getlist($('.recgz_ul'),"nofollow");
					} else {
                        p.find('.loading_tip').remove();
						p.append('<div class="loading_tip">'+ langData['circle'][0][55] +'</div>'); /*  暂无数据  */
					}
				}
			},
			error: function(err) {
				console.log('fail');
				isload = 0;
				console.log("改变isload")
				p.find('.loading_tip').text('暂无数据')
			}
		});
	}

	// 获取话题列表数据
	function topiclist() {
		isload = 1;
		var page = $('.nav_box .li_on').attr('data-page');
		var data = {
			'page': page,
			'pageSize': 10,
			'type':"topicdetail"
		}
		var p = $('.tlist_box .tlist_ul');
		p.find('.loading_tip').remove()
		p.append('<div class="loading_tip"><img src="' + templets_skin + 'images/loading.png" ></div>');
		$.ajax({
			url: '/include/ajax.php?service=circle&action=tlist',
			type: "GET",
			data: data,
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100 &&data.info.list.length>0) {
					var list = [];
					$('.nav_box .li_on').attr('data-total', data.info.pageInfo.totalPage);
					for (var i = 0; i < data.info.list.length; i++) {
						var d = data.info.list[i];
                        var levicon = (d.usertype == '2')?"":"fn-hide"
						list.push('<li class="t_li"><a href="' + d.topicurl + '" class="fn-clear">');
						list.push('<h1>' + d.topictitle + '</h1>');
						list.push('<div class="tcon_box"><div class="t_hoster">');
						list.push('<div class="left_head"><img src="' + (d.photo ? d.photo : "/static/images/noPhoto_40.jpg") +
							'" /><div class="v_log '+levicon+'"><img src="' + templets_skin + 'upfiles/vip.png" /></div></div>');
						list.push('<div class="right_info"><h3>' + (d.username ? d.username : langData['circle'][0][56]) + '</h3><p>' + d.pubdate1 + '</p></div></div>');  /*管理员 */
						if (d.media.length > 0) {
							list.push('<div class="t_con"><div class="r_img"><img src="' + d.media[0] + '" /></div><h2>' + d.content +
								'</h2></div>');
						}
						 else if(d.videoadr!="" && d.media.length==0){
							list.push('<div class="t_con">');
							list.push('<div class="r_img"><img src="'+((d.thumbnail!="")?d.thumbnail:(templets_skin+"images/sv_icon.png"))+'" /></div><h2>' + d.content +
								'</h2>');
							list.push('</div>')
						}else{
							list.push('<div class="t_con"><h2>' + d.content +'</h2></div>');
						}

						list.push('</div><div class="t_info"><em>' + d.browse + langData['circle'][0][57]+'</em> <em>' + d.topicjoin + langData['circle'][0][58]+'</em> <em>' + d.pubdate1 + '</em></div>');   /* 围观---参与 */
						list.push('</a></li>');
					}
					p.find('.loading_tip').remove();
					if(page==1){
						p.html(list.join(''));
					}else{
						p.append(list.join(''));
					}

					setTimeout(function() {
						isload = 0;
						page++;
						$('.nav_box .li_on').attr('data-page', page)
						if (page > data.info.pageInfo.totalPage) {
							p.append('<div class="loading_tip">'+langData['circle'][0][54]+'</div>');  /* 没有更多了~ */
							isload = 1;
						}

						swiper.updateAutoHeight(500);
					}, 500)
				} else {
					p.find('.loading_tip').remove();
					p.append('<div class="loading_tip">'+langData['circle'][0][59]+'</div>');   /* 暂无相关数据 */
					isload = 0;
					console.log("改变isload")
				}
			},
			error: function(err) {
				console.log('fail');
				isload = 0;
				console.log("改变isload")
				p.find('.loading_tip').text('暂无数据')
			}
		});
	}



	// 获取附近的人列表数据
	function aplist() {
		var t = $('.on_span').attr("data-type")?$('.on_span').attr("data-type"):""
		isload = 1;
		var page = $('.nav_box .li_on').attr('data-page');
		var data = {
			'page': page,
			'pageSize': 10,
			'sex':t,
			'lng':lng,
			'lat':lat
		}
		var p = $('.near_person');
		var sex = '&sex='+t
		p.find('loading').remove();
		p.append('<div class="loading_tip"><img src="' + templets_skin + 'images/loading.png" ></div>');

		$.ajax({
			url: '/include/ajax.php?service=circle&action=nearbypeople&ac_field=0',
			type: "GET",
			data: data,
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [];
					$('.nav_box .li_on').attr('data-total', data.info.pageInfo.totalPage);
					for (var i = 0; i < data.info.list.length; i++) {
						var d = data.info.list[i];
						var cls = "";
						if(d.isfollow==1){
							cls = "cared";
						}else if(d.isfollow==2){
							cls = "fn-hide";
						}else{
						}
						list.push('<li class="p_li" data-sex="1" data-id="'+d.id+'"><a href="'+masterDomain+'/user/'+d.id+'" class="fn-clear"><div class="l_head"><img src="'+(d.photo?d.photo:"static/images/noPhoto_60.jpg")+'" /></div><div class="r_detail"><div class="r_info"><h3>'+d.nickname+'</h3><p>'+returnHumanClick(d.total_fans)+langData['circle'][3][27]+' ·'+d.juli+'</p></div><h4 class="r_dt"><em>'+huoniao.transTimes(d.addtime,3)+'  '+(d.content ? '/' : '')+'</em> '+(d.content ? d.content : '')+'​​​​</h4></div><span class="care_btn '+cls+'">'+(d.isfollow==1?langData['circle'][0][50]:langData['circle'][0][1])+'</span></a></li>')
					}
					p.find('.loading_tip').remove();
					if(page==1){
						p.html(list.join(''));
					}else{
						p.append(list.join(''));
					}

					setTimeout(function() {
						swiper.updateAutoHeight(500);
						isload = 0;
						page++;
						$('.nav_box .li_on').attr('data-page', page);
						p.find('.loading_tip').remove();
						if (page > data.info.pageInfo.totalPage) {
							p.append('<div class="loading_tip">'+langData['circle'][0][54]+'</div>'); /* 没有更多了~ */
							isload = 1;
						}

					}, 500)
				} else {
                  	p.find('.loading_tip').remove();
					p.append('<div class="loading_tip">'+langData['circle'][0][59]+'</div>');    /* 暂无相关数据 */
					isload = 0;
					console.log("改变isload")
				}
			},
			error: function(err) {
				console.log('fail');
				isload = 0;
				console.log("改变isload")
			}
		});
	}

	// 获取短视频列表数据
	function getsvlist(){
		isload = 1;
		$('.sv_list').append('<div class="loading_tip"><img src="'+templets_skin+'images/loading.png"></div>')
		var vpage = $('.li_on[data-id="2"]').attr('data-page');
		url = '/include/ajax.php?service=circle&action=tlist&page='+vpage+'&orderby=getviedo&type=&lat=&lng=&module=all';
		var h1 = [], h2 = [];
		$.ajax({
			url: '/include/ajax.php?service=circle&action=tlist&page='+vpage+'&orderby=getviedo&type=&lat=&lng=&module=all&pageSize=20',
			type: "GET",
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if(data.state == 100){
					$('.nav_box .li_on').attr('data-total', data.info.pageInfo.totalPage);
					var list = data.info.list
					for(var i = 0; i<list.length; i++){
						var lr = list[i];
                      	var levicon = (lr.usertype == '2')?"":"fn-hide";
						if(i%2==0){
							h1.push('<li class="liBox" data-id="'+lr.id+'">');
							h1.push('<a href="' + lr.url + '" data-url="' + lr.url + '">');
							h1.push('<div class="imgbox"><img src="'+(vpage==1?huoniao.changeFileSize(lr.thumbnail, "large"):"/static/images/blank.gif")+'" data-url="'+huoniao.changeFileSize(lr.thumbnail, "large")+'" /></div>');
							h1.push('<div class="videoInfo">');
							h1.push('<h2>' + lr.content + '</h2>');
							h1.push('<div class="up_more">');
							h1.push('<div class="_left"><div class="headimgbox"><img src="'+(lr.photo ? huoniao.changeFileSize(lr.photo, "large") : (staticPath + 'images/noPhoto_60.jpg') )+'" alt=""><div class="v_log '+levicon+'"><img src="' + templets_skin + 'upfiles/vip.png" /></div></div><h2>'+(lr.username?lr.username:"佚名")+'</h2></div>');
							if(lr.isdz==1){
								h1.push('<div data-id="' + lr.id + '" data-uid="' + lr.userid + '" class="_right"><span class="numZan onclick">' + lr.zan + '</span></div>');
							}else{
								h1.push('<div data-id="' + lr.id + '" data-uid="' + lr.userid + '" class="_right"><span class="numZan">' + lr.zan + '</span></div>');
							}
							h1.push('</div>');
							h1.push('</div>');
							h1.push('</a>');
							h1.push('</li>');
						}else{
							h2.push('<li class="liBox"  data-id="'+lr.id+'">');
							h2.push('<a href="' + lr.url + '" data-url="' + lr.url + '">');
							h2.push('<div class="imgbox"><img src="'+huoniao.changeFileSize(lr.thumbnail, "large")+'" /></div>');
							h2.push('<div class="videoInfo">');
							h2.push('<h2>' + lr.content + '</h2>');
							h2.push('<div class="up_more">');
							h2.push('<div class="_left"><div class="headimgbox"><img src="'+(lr.photo ? huoniao.changeFileSize(lr.photo, "large") : (staticPath + 'images/noPhoto_60.jpg') )+'" alt=""><div class="v_log '+levicon+'"><img src="' + templets_skin + 'upfiles/vip.png" /></div></div><h2>'+(lr.username?lr.username:"佚名")+'</h2></div>');
							if(lr.isdz==1){
								h2.push('<div data-id="' + lr.id + '" data-uid="' + lr.userid + '" class="_right"><span class="numZan onclick">' + lr.zan + '</span></div>');
							}else{
								h2.push('<div data-id="' + lr.id + '" data-uid="' + lr.userid + '" class="_right"><span class="numZan">' + lr.zan + '</span></div>');
							}
							h2.push('</div>');
							h2.push('</div>');
							h2.push('</a>');
							h2.push('</li>');
						}
					};
					$('.sv_list').find('.loading_tip').remove();
					$('.sv_list .box1').append(h1.join(''));
					$('.sv_list .box2').append(h2.join(''));
					isload = 1;
					$("img").scrollLoading();
					setTimeout(function(){
						isload = 0
						vpage++;
						$('.nav_box .li_on').attr('data-page', vpage);
						if(vpage > data.info.pageInfo.totalPage){
							isload = 0;
							$('.sv_list').append('<div class="loading_tip">'+langData['circle'][0][54]+'</div>'); /* 没有更多了 */
						}
					},500)

				}else{
					$('.sv_list').find('.loading_tip').remove();
					$('.sv_list').append('<div class="loading_tip">'+data.info+'</div>');
				}

			},
			error: function(){
				$('.sv_list').find('.loading_tip').remove();
				$('.sv_list').append('<div class="loading_tip">'+data.info+'</div>');
			}
		});
	}


	// 我创建/参与的话题
	function topic_my(type){
		mload = 1;
		var sx = "&type="+type;
		var tip ="";
		url = "/include/ajax.php?service=circle&action=topicquery&mold="+sx;
		data = {
			'page': mpage,
			'pageSize': 10,
		}
		$('.myt_list').append('<div class="loading_tip"><img src="'+templets_skin+'images/loading.png"></div>')
		if(mpage==1){
			$('.myt_list ul').html('');
		}

		if(type=="create"){
			tip = langData['circle'][0][61];   /*  创建  */
		}else{
			tip = langData['circle'][0][62];   /*   参与 */
		}
		$.ajax({
			url: url,
			type: "GET",
			data: data,
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [];
					var datalist = data.info.list;
					for(var i = 0; i<datalist.length; i++){
						var d = datalist[i];
						if (d.litpic) {
							var img = '/include/attachment.php?f='+d.litpic
						}else{
							var img = templets_skin+"images/f_topic1.png"
						}
						list.push('<li class="myt_li"><a href="'+d.url+'" class="fn-clear">');
						list.push('<div class="l_img"><img src="'+img+'" /></div>');
						list.push('<div class="r_info"><h3>#'+d.title+'</h3><p>'+returnHumanClick(d.topicjoin)+langData['circle'][0][60]+'</p></div></a></li>');   /* 人参与*/
					}

					$('.myt_list').find('.loading_tip').remove();
					$('.myt_list ul').append(list.join(''));
					setTimeout(function(){
						mpage++;
						mload = 0;
						if(mpage > data.info.pageInfo.totalPage){
							mload = 1;
							$('.myt_list').append('<div class="loading_tip">'+langData['circle'][0][54]+'</div>');  /*没有更多了~ */
						}
						console.log(mpage)
					},500)
				} else {
					$('.myt_list').find('.loading_tip').remove();
					$('.myt_list').append('<div class="loading_tip">'+langData['circle'][0][54].replace('1',tip)+'</div>');  /* 您还没有1任何话题*/
				}
			},
			error: function(err) {
				$('.myt_list').find('.loading_tip').remove();
				$('.myt_list').append('<div class="loading_tip">'+langData['circle'][0][64]+'</div>');  /* 数据错误，请稍后刷新页面*/
			}
		});
	}


	//打赏
	var dashangElse = false;
	$('.ds_btn').click(function() {
		var t = $(this),
		newsid = t.parents('.more_box').attr('data-id');
		name = t.parents('.more_box').attr('data-name')
		if (t.hasClass("load")) return;
		t.addClass("load");
		//验证文章状态
		$.ajax({
			"url": "/include/ajax.php?service=circle&action=checkRewardState",
			"data": {
				"aid": newsid
			},
			"dataType": "jsonp",
			success: function(data) {
				t.removeClass("load");
				if (data && data.state == 100) {

					$("#ds_page .dsMask,#ds_page .dsPop").show().attr('data-id',newsid);
					console.log(newsid)
					// $('.mask').show();
					// $('.shang-box').show();
					// $('.shang-item-cash').show();
					// $('.shang-item .inp').show();
					// $('.shang-item .shang-else').hide();
					// $('body').bind('touchmove', function(e) {
					// 	e.preventDefault();
					// });
					// $('.shang_to').find('span').text(name)

				} else {
					alert(data.info);
				}
			},
			error: function() {
				t.removeClass("load");
				alert(langData['circle'][0][65]);     /* 网络错误，操作失败，请稍候重试！*/
			}
		});
	});

	// 其他金额
	$('.shang-item .inp').click(function() {
		$(this).hide();
		$('.shang-item-cash').hide();
		$('.shang-money .shang-item .error-tip').show()
		$('.shang-item .shang-else').show();
		dashangElse = true;
		$(".shang-else input").focus();
	})

	// 遮罩层
	$('.mask').on('click', function() {
		$('.mask').hide();
		$('.shang-money .shang-item .error-tip').hide()
		$('.shang-box').hide();
		$('.paybox').animate({
			"bottom": "-100%"
		}, 300)
		setTimeout(function() {
			$('.paybox').removeClass('show');
		}, 300);
		$('body').unbind('touchmove')
	})

	// 关闭打赏
	$('.shang-money .close').click(function() {
		$('.mask').hide();
		$('.shang-box').hide();
		$('.shang-money .shang-item .error-tip').hide()
		$('body').unbind('touchmove')
	})

	// 选择打赏支付方式
	var amount = 0;
	$('.shang-btn').click(function() {
		newsid = $('.more_box').attr('data-id')
		amount = dashangElse ? parseFloat($(".shang-item input").val()) : parseFloat($(".shang-item-cash em").text());
		var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
		var re = new RegExp(regu);
		if (!re.test(amount)) {
			amount = 0;
			alert(langData['circle'][0][66]);   /* 打赏金额格式错误，最少0.01元！*/
			return false;
		}

		var app = device.indexOf('huoniao') >= 0 ? 1 : 0;
		location.href = "/include/ajax.php?service=circle&action=reward&aid=" + newsid + "&amount=" + amount + "&app=" +app;
		return;

		$('.shang-box').animate({
			"opacity": "0"
		}, 300);
		setTimeout(function() {
			$('.shang-box').hide();
		}, 300);

		//如果不在客户端中访问，根据设备类型删除不支持的支付方式
		if (appInfo.device == "") {
			// 赏
			if (navigator.userAgent.toLowerCase().match(/micromessenger/)) {
				$("#shangAlipay, #shangGlobalAlipay").remove();
			}
			// else{
			//  $("#shangWxpay").remove();
			// }
		}
		$(".paybox li:eq(0)").addClass("on");

		$('.paybox').addClass('show').animate({
			"bottom": "0"
		}, 300);
	})

	$('.paybox li').click(function() {
		var t = $(this);
		t.addClass('on').siblings('li').removeClass('on');
	})

	//提交支付
	$("#dashang").bind("click", function() {

		var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
		var re = new RegExp(regu);
		if (!re.test(amount)) {
			amount = 0;
			alert(langData['circle'][0][66]);  /* 打赏金额格式错误，最少0.01元！*/
			return false;
		}

		var paytype = $(".paybox .on").data("id");
		if (paytype == "" || paytype == undefined) {
			alert(langData['circle'][0][67]);   /* 请选择支付方式！*/
			return false;
		}

		//非客户端下验证支付类型
		if (appInfo.device == "") {
			if (paytype == "alipay" && navigator.userAgent.toLowerCase().match(/micromessenger/)) {
				showErr(langData['circle'][0][68]);  /*微信浏览器暂不支持支付宝付款<br />请使用其他浏览器！ */
				return false;
			}

			location.href = "/include/ajax.php?service=circle&action=reward&aid=" + newsid + "&amount=" + amount +
				"&paytype=" + paytype;
		} else {
			location.href = "/include/ajax.php?service=circle&action=reward&aid=" + newsid + "&amount=" + amount +
				"&paytype=" + paytype + "&app=1";
		}


	});


	//举报按钮
	$('.jb_btn').click(function() {
		JubaoConfig.id = $(this).parents('.more_box').attr('data-id');
        var title =  $(this).parents('.more_box').attr('data-title')?$(this).parents('.more_box').attr('data-title'):"";
		$('.jubao_box').show();
		$('.jubao_detail h4').find('em').text($(this).parents('.more_box').attr('data-name'));
		$('.jubao_title').text(title);

	});


	// 举报提交
	var JuMask = $('.JuMask'),
		JubaoBox = $('.jubao_box');
	$('.content_box .sub').click(function() {

		var t = $(this);
		if (t.hasClass('disabled')) return;
		if ($('.jubap_type input').val() == '') {
			showErr(langData['siteConfig'][24][2]); //请选择举报类型
		} else if ($('.contact input').val() == "") {
			showErr(langData['siteConfig'][20][459]); //请填写您的联系方式
		} else {

			var type = $('.jubap_type input').val();
			var desc = $('.jubao_content .con textarea').val();
			var phone = $('.contact input').val();

			if (JubaoConfig.module == "" || JubaoConfig.action == "" || JubaoConfig.id == 0) {
				showErr('Error!');
				setTimeout(function() {
					JubaoBox.hide();
					JuMask.removeClass('show');
				}, 1000);
				return false;
			}

			t.addClass('disabled').html(langData['circle'][0][69]);   /* 正在提交*/

			$.ajax({
				url: "/include/ajax.php",
				data: "service=member&template=complain&module=" + JubaoConfig.module + "&dopost=" + JubaoConfig.action +
					"&aid=" + JubaoConfig.id + "&type=" + encodeURIComponent(type) + "&desc=" + encodeURIComponent(desc) +
					"&phone=" + encodeURIComponent(phone),
				type: "GET",
				dataType: "jsonp",
				success: function(data) {
					t.removeClass('disabled').html(langData['siteConfig'][6][151]); //提交
					if (data && data.state == 100) {
						showErr(langData['siteConfig'][21][242]); //举报成功！
						setTimeout(function() {
							JubaoBox.hide();
							JuMask.removeClass('show');
						}, 1500);

					} else {
						showErr(data.info);
					}
				},
				error: function() {
					t.removeClass('disabled').html(langData['siteConfig'][6][151]); //提交
					showErr(langData['siteConfig'][20][183]); //网络错误，请稍候重试！
				}
			});

		}
	});

	//关闭举报窗口
	$('.jubao .close_btn').click(function() {
		$('.jubao_box').hide();
		$('.jubao_box').find('input').val('');
		$('.jubao_box').find('textarea').val('');
		$('.chosebox').removeClass('show');
	});

	//举报类型选择
	$('.jubap_type').click(function(e) {
		$('.chosebox').addClass('show');
		$(document).one('click', function() {
			$('.chosebox').removeClass('show');
		});
		e.stopPropagation();
	});
	$('.chose_ul li').click(function() {
		var txt = $(this).text();
		$('.chosebox').removeClass('show');
		$('.jubap_type input').val(txt);
		return false;
	});

	//计算输入的字数
	$(".jubao_content ").bind('input propertychange', 'textarea', function() {
		var length = 100;
		var content_len = $(".jubao_content textarea").val().length;
		var in_len = length - content_len;
		if (content_len >= 100) {
			$(".jubao_content textarea").val($(".jubao_content textarea").val().substring(0, 100));
		}
		$('.jubao_content dt em').text($(".jubao_content textarea").val().length);

	});


	// 分享
	$('body').delegate('.share_btn', 'click', function() {
		var t = $(this),
			p = t.parents('.li_box');
		var url = p.attr('data-url'),
			desc = p.find('.art_con h2').text()
		img_url = p.find('.img_item:nth-child(1) img').attr('src');
		wxconfig['link'] = url;
		wxconfig['title'] = desc;
		wxconfig['img_url'] = img_url;
		wxconfig['description'] = desc;
		if(device.indexOf('huoniao') > -1){
			setupWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler("appShare", {
					"platform": "all",
					"title": wxconfig.title,
					"url": wxconfig.link,
					"imageUrl": wxconfig.imgUrl,
					"summary": wxconfig.description
				}, function(responseData){
					var data = JSON.parse(responseData);

				})
		  });
		}else{
			$('.HN_PublicShare').click();
		}
	});

	var timeoutflag = null;
	    (function (window) {

	        var _element = document.getElementById('tabs-container'),

	            _refreshText = document.querySelector('.refreshText'),
	            _startPosY = 0,
	            _startPosX = 0,
	            _transitionHeight = 0;
	        _element.addEventListener('touchstart', function (e) {
	            _startPosY = e.touches[0].pageY;
	            _startPosX = e.touches[0].pageX;
	            //          _element.style.position = 'relative';
	            _element.style.transition = 'transform 0s';

	        }, false);

	        _element.addEventListener('touchmove', function (e) {

	            _transitionHeight = e.touches[0].pageY - _startPosY;
	            _transitionWidth = e.touches[0].pageX - _startPosX;
	            if($('.con_zqnum').hasClass('swiper-slide-active')&&_startPosX<=$('.list_left').width()){
	            	clearTimeout(timeoutflag);
	             	return false;
	             }
	            if (_transitionHeight > 40 && _transitionHeight < 70 && .5 * _transitionWidth <
	                _transitionHeight) {
	                _refreshText.innerText = langData['circle'][0][70];    /*下拉刷新 */
	                _element.style.transform = 'translateY(50px)';
	                if (_transitionHeight > 68) {
	                    _refreshText.innerText = langData['circle'][0][71];  /*下拉刷新 */
	                }
	            }
	        }, false);
	        _element.addEventListener('touchend', function (e) {
	            _element.style.transition = 'transform 0.2s ease .3s';
	            _element.style.transform = 'translateY(0px)';
	            _refreshText.innerText = '';
				if($('.con_zqnum').hasClass('swiper-slide-active')&&_startPosX<=$('.list_left').width()){
	            	clearTimeout(timeoutflag);
	             	return false;
	             }
	            if (e.changedTouches[0].clientY - _startPosY > 68) {
	                if (timeoutflag != null) {
	                    clearTimeout(timeoutflag);
	                }
	//              _refreshText.innerText = '更新中...';
	                timeoutflag = setTimeout(function () {
	                    _refreshText.innerText = '';
	                    pullrefresh();
	                }, 500);

	            }
	        }, false);
	    })(window);



	    function pullrefresh() {
			isload = 0;
			$('.li_on').attr('data-page','1');
			if($('.li_on').attr('data-id')=='1'){
				getlist($('.gz_ulbox'),'follow')
			}else if($('.li_on').attr('data-id')=='0'){
				var p =$('#tabs-container>.swiper-wrapper>.swiper-slide').eq(0).find('.tab_con ul.show');
				getlist(p)
			}else if($('.li_on').attr('data-id')=='3'){
				if($('.near_dt').hasClass('show')){
					console.log('1')
					getlist($('.near_dt'),"fujin");
				}else{
					aplist();
				}

			}else if($('.li_on').attr('data-id')=='4'){
				topiclist()
			}else if($('.li_on').attr('data-id')=='2'){
				$('.sv_list>ul').html('');
				getsvlist()
			}
	    }


		// 表情
		// 选择表情

			$('.reply_box a').click(function() {
				if (!$(this).hasClass('bq_btn')) {
					$('.bq_box').removeClass('show');
					$('bq_btn').addClass()
				} else {
					var t = $(this);

					if (!t.hasClass('bq_open')) {
						$('.bq_btn').addClass('bq_open');
						$('.bq_box').addClass('show');
					} else {
						$('.bq_btn').removeClass('bq_open');
						$('.bq_box').removeClass('show');
					}
					// $(window).scrollTop(0)
				}
			});

			//点击表情，输入
			var memerySelection;
			var userAgent = navigator.userAgent.toLowerCase();
			if (/iphone|ipad|ipod/.test(userAgent)) {
				$(".bottom_box").css('padding-bottom',".28rem");
			}else{
				$(".bottom_box").css('padding-bottom',"3rem");
			}
			$('.bq_box').delegate(".emot_li","click",function() {
				var t = $(this),txt = t.attr('data-txt');
				var emojsrc = t.find('img').attr('src');
			
				memerySelection = window.getSelection();
				if (/iphone|ipad|ipod/.test(userAgent)) {
					$('#reply').append('<img data-txt="'+txt+'" src="' + emojsrc + '" class="emotion-img" />');
					return false;

				} else {
					set_focus($('#reply:last'));
					pasteHtmlAtCaret('<img  data-txt="'+txt+'"  src="' + emojsrc + '" class="emotion-img" />');
				}
				document.activeElement.blur();
				return false;
			})

			//根据光标位置插入指定内容
			function pasteHtmlAtCaret(html) {
				var sel, range;
				if (window.getSelection) {
					sel = memerySelection;
					// console.log(sel)
					if (sel.anchorNode == null) {
						return;
					}
					if (sel.getRangeAt && sel.rangeCount) {

						range = sel.getRangeAt(0);
						range.deleteContents();
						var el = document.createElement("div");
						el.innerHTML = html;
						var frag = document.createDocumentFragment(),
							node, lastNode;
						while ((node = el.firstChild)) {
							lastNode = frag.appendChild(node);
						}
						range.insertNode(frag);
						if (lastNode) {
							range = range.cloneRange();
							range.setStartAfter(lastNode);
							range.collapse(true);
							sel.removeAllRanges();
							sel.addRange(range);
						}
					}

				} else if (document.selection && document.selection.type != "Control") {
					document.selection.createRange().pasteHTML(html);
				}
			}
			//光标定位到最后
			function set_focus(el) {
				el = el[0];
				el.focus();
				if ($.browser.msie) {
					var rng;
					el.focus();
					rng = document.selection.createRange();
					rng.moveStart('character', -el.innerText.length);
					var text = rng.text;
					for (var i = 0; i < el.innerText.length; i++) {
						if (el.innerText.substring(0, i + 1) == text.substring(text.length - i - 1, text.length)) {
							result = i + 1;
						}
					}
					return false;
				} else {
					var range = document.createRange();
					range.selectNodeContents(el);
					range.collapse(false);
					var sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}

			 getsList();
			 function getsList(){
			         var pageSize = 4;
			         $.ajax({
			             url:'/include/ajax.php?service=business&action=blist&store=2&page=1&pageSize=5&lng='+lng+'&lat='+lat,
			             type: 'get',
			             dataType: 'jsonp',
			             success: function(data){
			                 if(data && data.state == 100){
			                     var html = [];
								 for(var i=0; i<data.info.list.length; i++){
									 var d = data.info.list[i]
									html.push('<li class="swiper-slide shop_li"><a href="'+d.url+'"><img src="'+(d.logo ? d.logo : (templets_skin + 'images/fShop.png'))+'" /></a></li>');
								 }
			                     $('.swiper-shop>ul').html(html.join(''));
								// 附近商店
								var swiper1 = new Swiper('.swiper-container.swiper-shop', {
									slidesPerView: 'auto',
								});
			                 }else{
								 $('.shop_area').hide()
			                     $('.business-list-box .shop-more a').text(langData['circle'][0][59]);  /* '暂无相关信息'*/
			                     $('.business-list-box .loading').text(langData['circle'][0][55]);  /* '暂无数据！'*/
			                 }
			             },
			             error: function(){
			                 if(page == 1){
			                     $('.business-list-box .loading').text(langData['circle'][0][72]);   /* 网络错误，请重试 */
			                 }
			                 $('.business-list-box .shop-more a').text(langData['circle'][0][72]);   /* 网络错误，请重试 */
			                 page = page > 1 ? page - 1 : 1;
			             }
			         })
			     }

	// 回复评论
	$('.content_box').delegate('.comt_li','click',function(){
	  var rid = $(this).attr('data-plid');
	  $('.bottom_box').attr('data-reply',rid);
	  $('.bottom_box').attr('data-type','reply');
	  $('.bottom_box,.mask_re').show();

		$('#reply').focus();
		$('html').addClass('noscroll');
	});

	// 发送评论
	$('.send_btn').click(function(){
		var t = $(this);
		var replyid = t.parents('.bottom_box').attr('data-reply');
		var rtype = t.parents('.bottom_box').attr('data-type');
		if(rtype=='reply'){
			var url = '/include/ajax.php?service=member&action=replyComment&check=1&id=' + replyid;
		}else{
			var url = '/include/ajax.php?service=member&action=sendComment&check=1&type=circle-dynamic&aid=' + replyid;
		}
		var userid = $.cookie(cookiePre + "login_user");
		
		$('#reply img').each(function(){
			var t = $(this),txt= t.attr('data-txt');
			t.after('<em>'+txt+'</em>');
			t.remove()
		});
		var con = $('#reply').html();  //去掉回车和空格
		if (userid == null || userid == "") {
			window.location.href = masterDomain + '/login.html';
			return false;
		}
		if(con==''){
			showErr(langData['circle'][3][20]);return false;  //请输入评论内容
		}else{
			$.ajax({
					url: url,
					data: "content=" + encodeURIComponent(con),
					type: "POST",
					dataType: "json",
					success: function(data) {
						if (data && data.state == 100) {
							if (data.info.ischeck == 1) {
								showErr(langData['circle'][3][21]);    //回复成功！
								$('#reply').html('');
								pullrefresh();
								$(".mask_re").click();
								// setTimeout(function(){
								// 	location.reload();
								// },500)
								$('#reply').html('')
								
							} else {
								showErr(langData['circle'][3][22]);  //评论成功，请等待管理员审核！
								$(".mask_re").click();
							}


						} else {
							alert(data.info);
						}
					},
					error: function() {
						alert(langData['circle'][3][23]);  //网络错误，发表失败，请稍候重试！
					}
			});
		}

	});



});
