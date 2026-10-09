


	//			判断是安卓还是苹果
	var u = navigator.userAgent,
	app = navigator.appVersion;
	var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1; //g
	var elemtVideo = '';
	// if (isAndroid) {
	//     console.log("安卓机！");
	// 	$('#my-video').hide();
	//     $('#player').show();
	//     $('#player')[0].play();
	//     elemtVideo = $('#player');

	// } else {
	    $('#my-video').show();
	    $('#player').hide();
	    $('#my-video')[0].play();
	    elemtVideo = $('#my-video');
	// }


//	//判断是否在安卓微信
//	if(is_weixn() && isAndroid){
//	    $('.svdetail_top').hide();
//	}
	// document.getElementById('player').addEventListener("x5videoenterfullscreen", function(){
	//   $('.svdetail_top').hide();
	// });

	// document.getElementById('player').addEventListener("x5videoexitfullscreen", function(){
	//   $('.svdetail_top').show();
	// })

	var giftswiper=null,clock=null;
	var isplayer=0;
	function audioAutoPlay(id){
		var audio = document.getElementById(id),
			play = function(){
				audio.play();
				document.removeEventListener("touchstart",play, false);
			};
		audio.oncanplay=function(){
	//		$(".video_line").removeClass('loading');
			setTimeout(function() {
				$(".video_line").removeClass('loading');
			},500)
		}

//		audio.onplay=function(){
//			console.log('开始播放')
//		}
		audio.onplaying=function(){
//			console.log('正在播放')
			$('.video_banner .play_btn').hide()
		}
		audio.onpause=function(){
//			console.log('暂停')
			$('.video_banner .play_btn').show()
		}

//		audio.onreadystatechange = function(){
//			console.log('测试')
//		}
		audio.onloadstart = function(){
			$(".video_line").addClass('loading');
		}
		audio.ontimeupdate = function(){
			var allTime = audio.duration;
			var curTime = audio.currentTime;
			var scale = curTime / allTime;
			$('.bofa_line').css('width',scale * ($('.video_line').width()))
		}
		audio.play();

		document.addEventListener("WeixinJSBridgeReady", function () {
			play();
		}, false);
		document.addEventListener('YixinJSBridgeReady', function() {
			play();
		}, false);
		document.addEventListener("touchstart",play, false);
	}

	function is_weixn(){
	    var ua = navigator.userAgent.toLowerCase();
	    if(ua.match(/MicroMessenger/i)=="micromessenger") {
	        return true;
	    } else {
	        return false;
	    }
	}


	function goPlay(e) {
	    var e = e || event;
	    e.cancelBubble = true;
	    var that = e.target || e.srcElement;
	    if (that.isFirstLoadVideo) {
	        that.mySwiper.unlockSwipeToNext();
	        that.isFirstLoadVideo = false;
	    }

	    // if (isAndroid) {
	    //     var ele = document.getElementById('player');
	    // } else {
	        var ele = document.getElementById('my-video');
	    // }
	    var paused = ele.paused;
	    var ended = ele.ended;
	    var readyState = ele.readyState;
	    if (paused) {
	        ele.play();
	        $(that).parent().find('.play_btn').hide();
	        $(that).parent().find('.posterImg').hide();
	        that.playBtnStatus = true;
	        if (that.readyState) {
	            that.playerStatus = true;
	        } else {
	            if (isAndroid) {
	                console.log("that.isAndroid延迟--1500--" + readyState);
	                setTimeout(function() {
	                    that.playerStatus = true;
	                    console.log("that.isAndroid延迟--1500--" + readyState);
	                },
	                1500)
	            } else {
	                that.playerStatus = true;
	            }
	        }
	    } else {
	        ele.pause();
	        that.playerStatus = false;
	        that.playBtnStatus = false;
	        that.readyState = true;
	        $(that).parent().find('.play_btn').show();
	    }

	}
$(function() {
	//APP端取消下拉刷新
	toggleDragRefresh('off');

  	$(".goBack").click(function(){
		window.location.href = channelDomain;
	})
	var page = 1,v_load = 0;
    setTimeout(function(){
    	$('.svdetail_top .left_tip').css({'animation':'leftFadeOut .5s ease-out forwards'});
    },5000);

    $('.left_tip').click(function(){
    	 $('.svdetail_top .header-search a').click();
    	 $(this).css({'animation':'leftFadeOut .5s ease-out forwards'});
    });
    //默认暂停按钮隐藏
    // $('.play_btn').hide();

	setTimeout(function(){
		getvideo_detail(obj.videoData[0]);
	},500)
	//获取第一次 的数据
	$.ajax({
		type: "post",
		dataType: "json",
		url: "/include/ajax.php?service=circle&action=tlist&page="+page+"&pageSize=10&orderby=getviedo&type=&lat=&lng=&dynamicid="+nowid+"&h5type=1&uid="+fuid+(fuid ? '&u=1' : ''),
		cache:false,
		success: function(d){
			if (d.state == 100) {
				// 初始化数据
				if(d.info.list.length>0){
					for(var i=0; i<d.info.list.length; i++ ){
						if(d.info.list[i].id!=obj.videoData[0].id){
							obj.videoData.push(d.info.list[i]);
						}
					}
					slideN = 1;
					obj.twoData = obj.videoData[obj.current+1];
					obj.threeData = obj.videoData[obj.current + 2];
					page++;
					if(page>d.info.pageInfo.totalPage){
						v_load = 1;
					}
					// if (isAndroid) {
					// 	audioAutoPlay("player");
					// } else {
						audioAutoPlay("my-video");
					// }

					$('#PrevEle').prop('style', "background-image: url("+obj.twoData.thumbnail+")");
					title = obj.twoData.title;
					img_url = obj.twoData.thumbnail;
				}
			}else{
				mySwiper2.allowSlideNext = false;
			}
		}
	});
   var mySwiper2,slide = 1,slideP=0,slideN=0;
	window.onresize = function() {
		if($(window).width()>$(window).height()){
			mySwiper2.changeDirection('horizontal');
			$('.video_ele').width($(window).height());
			$('.video_ele').height($(window).width());

		}else{
			mySwiper2.changeDirection('vertical');
			$('.video_ele').width($(window).width());
			$('.video_ele').height($(window).height());
		}
    }



	mySwiper2 = new Swiper('#shipin_banner_box', {
	        initialSlide: 1,
	        direction: 'vertical',
	        loop: false,
	        allowSlideNext: true,
	        on: {
	        	init:function(){
	        		this.allowSlidePrev = false;
	        		// this.allowSlideNext = false

	        	},
	            slideNextTransitionEnd: function() {
	            	//重置相关数据
	            	$('.bofa_line').css('width','0');
	            	// $('.care_btn').removeClass('cared');
	            	// $('.care_btn').removeClass('myhide');
	            	$('.pro_link,.link_box,.link_hide').remove();
	            	$(".head_box img").attr('src','/static/images/blank.gif')
	            	// $('.up_num').removeClass('active')
	                obj.current++;
					if(obj.current>0)
					{
	                	obj.oneData = obj.videoData[obj.current - 1];
	                	this.allowSlidePrev = false;
						slideP =1
					}
	                obj.twoData = obj.videoData[obj.current];
	                if (obj.current < (obj.videoData.length - 1) ) {
	                    obj.threeData = obj.videoData[obj.current + 1];
						slideN = 1;
	                } else if(slide==0){
	                    // 下划加锁
	                    obj.threeData = obj.videoData[0];
	                    this.allowSlideNext = false;
						slideN = 0;
	                    setTimeout(function() {
	                        console.log('已经没有更多了！', 'text');
	                    },
	                    2000);
	                }
	                slide = 0;
	                elemtVideo.prop('src', obj.twoData.videoadr);
	                elemtVideo.prop('poster', obj.twoData.thumbnail);
					$("#videoid").val(obj.twoData.id);
					if(obj.current!=0){window.history.replaceState({}, 0, obj.twoData.url);}
					$(".fabuNeirong_container .name_title").html(obj.twoData.username);   //发布的用户名
					$(".fabuNeirong_container .content").html(obj.twoData.content);         //视频标题
					$('.head_box a').attr('href',userLink.replace('.html','-'+obj.twoData.userid+'.html'))
					wxconfig.title = obj.twoData.content;
					wxconfig.imgUrl = obj.twoData.thumbnail;
					wxconfig.link = obj.twoData.url+(dzuid?'?fromShare='+dzuid : '');
					$(".HN_button_link").attr('data-clipboard-text',wxconfig.link);
					//点赞数目相关操作
					$(".zan_box span").attr('data-num',obj.twoData.zan)
					$(".zan_box span").html(obj.twoData.zan!="0"?obj.twoData.zan:langData['circle'][3][3]);   //点赞数
					$(".comm_box span").html(obj.twoData.reply!="0"?obj.twoData.reply:langData['circle'][3][4]);         //评论数
					$(".zan_box a").attr('data-id',obj.twoData.id);
					$(".zan_box a").attr('data-admin',obj.twoData.userid);  //暂不知其意
					title = obj.twoData.title==""?channelName:obj.twoData.title;
					img_url = obj.twoData.litpic;
					if(obj.current != 0){
						setTimeout(function(){
							getvideo_detail(obj.twoData)
						},200)
					}





					if(obj.current>0){
						$('#PrevEle').prop('src', obj.oneData.videoadr);
						$('#PrevEle').prop('style', "background-image: url("+obj.oneData.thumbnail+");");
						$('#PrevEle').prop('poster', obj.oneData.thumbnail);
					}

	                $('#NextEle').prop('src', obj.threeData.videoadr);
	                $('#NextEle').prop('poster', obj.threeData.thumbnail);
					$('#NextEle').prop('style', "background-image: url("+obj.threeData.thumbnail+");");

	                // 解锁上划
	                if (obj.current > 0) {
	                    this.allowSlidePrev = true;
	                }
	                if (this.activeIndex == 2) {
	                    mySwiper2.slideTo(1, 0, false);
	                }


					if(obj.current !=0){
						// if (isAndroid) {
						// 	audioAutoPlay("player");
						// } else {
							audioAutoPlay("my-video");
						// }
					}


					if(obj.current==obj.videoData.length-3 && obj.state=="0")
					{
						if(!v_load && page!=1){
							$.ajax({
								type: "post",
								dataType: "json",
								url: "/include/ajax.php?service=circle&action=tlist&page="+page+"&pageSize=10&orderby=getviedo&type=&lat=&lng=&dynamicid="+nowid+"&h5type=1&uid="+fuid+(fuid ? '&u=1' : ''),
								cache:false,
								success: function(d){
									if (d.state == 100) {
										if(d.info.list.length>0)
										{
											obj.videoData = obj.videoData.concat(d.info.list);
											page++;
											if(page>d.info.pageInfo.totalPage){
												console.log('啥时候进这里')
												v_load = 1;

											}
										}
									}
								}
							});
						}

					}
	           },
	            slidePrevTransitionEnd: function() {
	            	//重置相关数据
	            	$(".head_box img").attr('src','/static/images/blank.gif')
	            	$('.bofa_line').css('width','0');
	            	// $('.care_btn').removeClass('cared');
	            	// $('.care_btn').removeClass('myhide');
	            	$('.pro_link,.link_box,.link_hide').remove();

	                obj.current--;

	                if (obj.current == 0) {
	                    // 上划加锁
	                    this.allowSlidePrev = false;
						slideP = 0
	                } else {
	                    obj.oneData = obj.videoData[obj.current - 1];
	                }

					obj.twoData = obj.videoData[obj.current];
	                obj.threeData = obj.videoData[obj.current + 1];
	                elemtVideo.prop('src', obj.twoData.videoadr);
	                elemtVideo.prop('poster', obj.twoData.thumbnail);

					$("#videoid").val(obj.twoData.id);
					window.history.replaceState({}, 0, obj.twoData.url);
					$(".fabuNeirong_container .name_title").html(obj.twoData.username);
					$(".fabuNeirong_container .content").html(obj.twoData.content);
					$('.head_box a').attr('href',userLink.replace('.html','-'+obj.twoData.userid+'.html'))
					wxconfig.title = obj.twoData.content;
					wxconfig.imgUrl = obj.twoData.thumbnail;
					wxconfig.link = obj.twoData.url+(dzuid?'?fromShare='+dzuid : '');
					$(".HN_button_link").attr('data-clipboard-text',wxconfig.link);
					//点赞数目相关操作
					$(".zan_box span").attr('data-num',obj.twoData.zan);
					$(".zan_box span").html(obj.twoData.zan!=0?obj.twoData.zan:langData['circle'][3][3]);   //点赞数
					$(".comm_box span").html(obj.twoData.reply!=0?obj.twoData.reply:langData['circle'][3][4]);         //评论数
					$(".zan_box a").attr('data-id',obj.twoData.id);
					$(".zan_box a").attr('data-admin',obj.twoData.userid);
					title = obj.twoData.content==""?channelName : obj.twoData.content;
					img_url = obj.twoData.thumbnail;


	                $('#PrevEle').prop('style', "background-image: url("+obj.oneData.thumbnail+");");
	                $('#PrevEle').prop('src', obj.oneData.videoadr);
	                $('#PrevEle').prop('poster', obj.oneData.thumbnail);
	                $('#NextEle').prop('style', "background-image: url("+obj.threeData.thumbnail+");");
	                $('#NextEle').prop('poster', obj.threeData.thumbnail);

					setTimeout(function(){
						getvideo_detail(obj.twoData)
					},200)


	                if (obj.current < obj.videoData.length - 1) {
	                    // 下划解锁
	                    this.allowSlideNext = true;
	                }
	                if (this.activeIndex == 0) {
	                    mySwiper2.slideTo(1, 0, false);
	                }
//	 			  var nWidth = obj.videoData[obj.current].picwidth;
//	              var nHeight = obj.videoData[obj.current].picheight;
//	              if (nHeight > nWidth) {
//	                  elemtVideo.css('object-fit', 'cover');
//	              } else {
//	                  elemtVideo.css('object-fit', 'contain');
//	              }

	            },
	        }
	   });
//	setTimeout(function(){
//		console.log('22222')
//		 mySwiper2.update(updateTranslate);
//	},600);

	//获取视频详情
	function getvideo_detail(data){
		var id = $("#videoid").val();
		// 获取详情
		$('.head_box img').attr('src',data.photo);
		$('.care_btn').attr('data-id',data.userid);
        if(data.topictitle!=''){
			$('.topic_title').show()
			$('.topic_title a').html(data.topictitle).attr('href',data.topicurl)
		}else{
			$('.topic_title').hide()
		}

		wxconfig.title = data.content==""?channelName:data.content;
		wxconfig.imgUrl = data.thumbnail;
		wxconfig.link = data.url;
		var userid = $.cookie((window.cookiePre ? window.cookiePre : 'HN_') + 'userid');
		if(userid){
		  wxconfig.link = data.url+"?fromShare="+userid
		}
		//关注按钮
		if(data.isfollow==1){
			$('.care_btn').addClass('cared');
			$('.care_btn').addClass('myhide');
		}else{
			$('.care_btn').removeClass('myhide');
			$('.care_btn').removeClass('cared');
		}
		$("title").html(data.content==""?channelName:data.content)
		// 点赞状态
		if(data.isdz=="0"){
			$('.zan_box .up_num').removeClass('active');
		}else{
			$('.zan_box .up_num').addClass('active');
		}

		//点赞数
		$('.zan_box span').attr('data-num',data.zan);
		$('.zan_box span').text(data.zan!="0"?data.zan:langData['circle'][3][3]);
		$('.comm_box span').text(data.reply!="0"?data.reply:langData['circle'][3][4]);

		// 头像
		$('.name_title').text(data.username);
		$('.head_box img').attr('src',data.photo?data.photo:staticPath+"images/default_user.jpg")

		//链接
		if(data.commodity && data.commodity.length>0){
			var linkArr = data.commodity;
			var proName = '';
			var proArr = [],lArr = [];

			for(var i=0 ; i<linkArr.length ; i++){
				if(linkArr[i].ltype == "pro"){
					proArr.push(linkArr[i]);
					proName = proName +linkArr[i].title;

				}else{
					lArr.push(linkArr[i]);
				}

			}
			if(linkArr.length==1 && linkArr[0].ltype=='link'){
				$('.swiper-slide-active .fabuNeirong_container').prepend('<div class="link_box"><a href="'+lArr[0].url+'" class="link_info fn-clear"><div class="left_img"><img src="'+lArr[0].litpic+'"></div><div class="right_info">'+lArr[0].title+'</div></a><a href="'+lArr[0].url+'" class="l_btn">'+langData['circle'][3][28]+'</a><i class="close_btn"></i></div>');  //了解详情
				$('.link_box .link_btn').attr("href",lArr[0].url).find('span').html(lArr[0].title);  //暂时只显示一个
			}else{

				$('.swiper-slide-active  .fabuNeirong_container').prepend('<div class="link_btn pro_link"><span>'+proName+'</span>等<em>'+proArr.length+'</em>件宝贝</div>');
			}

			if(linkArr.length>0){
				console.log(linkArr)
				$('.prolist_box>h2>em').text(linkArr.length);
				var plist = []
				for(var i=0; i<linkArr.length; i++){
					plist.push('<li class="pro_li fn-clear"><a href="'+linkArr[i].url+'" class="fn-clear">');
					plist.push('<div class="left_proimg"><img src="'+linkArr[i].litpic+'" /></div>');
					plist.push('<div class="right_proinfo">');
					plist.push('<h3 class="pro_title">'+linkArr[i].title+'</h3>');
					if(linkArr[i].ltype=="pro"){
						var p = linkArr[i].price;
						var pr = p.substring(0,p.indexOf('.'));
						var pl = p.substr(p.indexOf('.')+1,2);
						plist.push('<p class="pro_price">'+pr+'<em>.'+pl+'</em></p>');
					}
					plist.push('</div></a></li>')
				}
				$('.pro_ul').html(plist.join(''))
			}

		}

		// 播放量
		$.ajax({
		  url: "/include/ajax.php?service=circle&action=dynamicbrowse&id="+id,
		  type: "GET",
		  dataType: "json",
		  success: function (data) {},
		  error:function(data){}
		});

	}

	 //点击关注
	 var care_f = 0
	 $('body').delegate('.care_btn','click',function(){
	 	var userid = $.cookie(cookiePre+"login_user");
			if(userid == null || userid == ""){
				window.location.href = masterDomain+'/login.html';
				return false;
			}

			// $(this).css('animation','swirl-out-bck .3s ease-in both');
			// $(this).css('animation','flip-scale-down-ver .5s ease-in-out both');
			
			var t = $(this);
			if($(this).hasClass('cared')){
				$(this).removeClass('cared');
				care_f = 0;

			}else{
				$(this).addClass('cared')
				care_f = 1;
			}

			// setTimeout(function(){
			//   if(care_f){
			//   	t.addClass('cared')
			//   }else{
			//   	t.removeClass('cared')
			//   }
			// },200)
			var mediaid = $(this).attr("data-id");
			$.post("/include/ajax.php?service=member&action=followMember&id="+mediaid,function(data){
				if(care_f){
					// 关注成功
					showMsg(langData['circle'][3][29]);  //关注成功!

					setTimeout(function(){
						t.fadeOut(500)
						// t.addClass('myhide')
					},700)

				}else{
					//取消关注
					console.log(langData['circle'][3][30])  //已取消关注
				}
			});
	 });

 	// 错误提示

	    var showErrTimer;
	    function showMsg(txt,time){
	        ht = time?time:1500
	        showErrTimer && clearTimeout(showErrTimer);
	        $(".popMsg").remove();
	        $("body").append('<div class="popMsg"><p>'+txt+'</p></div>');
	        $(".popMsg p").css({ "left": "50%"});
	        $(".popMsg").css({"visibility": "visible"});
	        showErrTimer = setTimeout(function(){
	            $(".popMsg").fadeOut(300, function(){
	                $(this).remove();
	            });
	        }, ht);
	    }


	 //点赞功能
	   // 视频点赞
	  $('.up_num').click(function(){
		  if($(this).hasClass('disabled')) return;  //禁止重复多次点击
	      var userid = $.cookie(cookiePre+"login_user");
	      var uid = $(this).attr('data-admin'),  //发布者的id
	          did = $(this).attr('data-id');   //该视频的id
	      if(userid == null || userid == ""){
	        window.location.href = masterDomain+'/login.html';
	        return false;
	      }
	      $('.up_num').addClass('disabled')
	      $(this).find("i").addClass('puff-out-center')
	     setTimeout(function(){
			$('.up_num').find("i").removeClass('puff-out-center');
		  },500)
	      var num = parseInt($('.zan_box span').attr('data-num'));
	      var t = $(this);
	      t.hasClass('active') ? num-- : num++;


	      $.ajax({
	        url: "/include/ajax.php?service=circle&action=Fabulous",
	        type: "GET",
			data:{'did':did,'fbuid':uid,'dzuid':dzuid},
	        dataType: "json",
	        success: function (data) {
				if(data.state==100){
					t.toggleClass('active');
					$('.zan_box span').text(num>0?num:langData['circle'][3][3]);
					$('.zan_box span').attr('data-num',num)

				}else{
                    showErrAlert(data.info);
                }
				$('.up_num').removeClass('disabled');
	        },
			error:function(data){
				$('.up_num').removeClass('disabled');
			}
	      });
	  });


	  //关闭链接
	  $('body').delegate('.link_box .close_btn','click',function(){
	  	  var t = $(this),p = $(this).parents('.link_box');
		  var url = p.find('.l_btn').attr('href')
	  	  p.css('animation','bottomFadeOut .5s ease-in-out forwards');
	  	  $('.swiper-slide.swiper-slide-active .fabuNeirong_container').prepend('<a href="'+url+'" class="link_btn link_hide"><span>'+p.find('.right_info').text()+'</span></a>')

	  });

//	  //点击软文链接
//	  $('body').delegate('.link_hide','click',function(){
//	  	  $('.link_box').show();
//	  	  $(this).remove();
//	  	   e.preventDefault();
//	  });


	  //点击商品链接
	  $('body').delegate('.pro_link','click',function(e){
	  	//加载数据
	  	mySwiper2.allowSlideNext = false;
	  	mySwiper2.allowSlidePrev = false;
	  	$('.mask_pro').show();
	  	$('.prolist_box').animate({"bottom":0},200);
	  	 e.preventDefault();
	  });

	  $('body').delegate('.prolist_box i.close_btn,.mask_pro','tap',function(){
	  	$('.mask_pro').hide();
	  	$('.prolist_box').animate({"bottom":"-68%"},200);
		if(slideN==1){
			mySwiper2.allowSlideNext = true;
		}
	  	if(slideP==1){
			mySwiper2.allowSlidePrev = true;
		}

	  } );
	   $('body').delegate('.prolist_box i.close_btn','touchend',function(e){
	  	//	 阻止点透事件
	  	 e.preventDefault();
	  } );
	  //更多按钮
	  $('.svdetail_top .header-search a').click(function(){
	  	$('.more_box').toggle();
	  });
	  $('.mask0').on('tap',function(){
	  	$('.more_box').hide();
	  });

	  //分享按钮点击
	  $('.share_btn.HN_PublicShare').click(function(){
	  	  $('.mask0').click();
	  });

	  //举报按钮
	  $('.jubao_btn').click(function(){
	  	JubaoConfig.id = $('#videoid').val()
	  	$('.jubao_box').show();
	  	$('.more_box').hide();
	  	$('.jubao_detail h4').find('em').text($('.fabuNeirong_container .name_title').text());
	  	$('.jubao_title').text($('.fabuNeirong_container .content').text());

	  });


	    // 举报提交
	  var JuMask = $('.JuMask'), JubaoBox = $('.jubao_box');
  $('.content_box .sub').click(function(){

    var t = $(this);
    if(t.hasClass('disabled')) return;
    if ($('.jubap_type input').val()=='') {
    	console.log('请选择举报类型')
      showErr(langData['siteConfig'][24][2]);  //请选择举报类型
    }else if ($('.contact input').val() == "") {
    	console.log('请输入联系方式')
      showErr(langData['siteConfig'][20][459]);  //请填写您的联系方式
    }else {

      var type = $('.jubap_type input').val();
      var desc = $('.jubao_content .con textarea').val();
      var phone = $('.contact input').val() ;

      if(JubaoConfig.module == "" || JubaoConfig.action == "" || JubaoConfig.id == 0){
        showErr('Error!');
        setTimeout(function(){
          JubaoBox.hide();
          JuMask.removeClass('show');
        }, 1000);
        return false;
      }

      t.addClass('disabled').html('正在提交');

      $.ajax({
        url:"/include/ajax.php",
        data: "service=member&template=complain&module="+JubaoConfig.module+"&dopost="+JubaoConfig.action+"&aid="+JubaoConfig.id+"&type="+encodeURIComponent(type)+"&desc="+encodeURIComponent(desc)+"&phone="+encodeURIComponent(phone),
        type: "GET",
        dataType: "jsonp",
        success: function(data){
          t.removeClass('disabled').html(langData['siteConfig'][6][151]);  //提交
          if (data && data.state == 100) {
            showErr(langData['siteConfig'][21][242]);  //举报成功！
            setTimeout(function(){
              JubaoBox.hide();
              JuMask.removeClass('show');
            }, 1500);

          }else{
            showErr(data.info);
          }
        },
        error: function(){
          t.removeClass('disabled').html(langData['siteConfig'][6][151]);  //提交
          showErr(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
        }
      });

    }
  });

	   // 显示错误
  function showErr(txt){
    $('.JuError').text(txt).show();
    setTimeout(function(){
      $('.JuError').fadeOut();
    }, 2000)
  }






	  //关闭举报窗口
	  $('.jubao .close_btn').click(function(){
	  	$('.jubao_box').hide();
	  	$('.jubao_box').find('input').val('');
	  	$('.jubao_box').find('textarea').val('');
	  	$('.chosebox').removeClass('show');
	  });

	  //举报类型选择
	  $('.jubap_type').click(function(e){
	  	  $('.chosebox').addClass('show');
	  	  $(document).one('click',function(){
	  		 $('.chosebox').removeClass('show');
	  	  });
	  	  e.stopPropagation();
	  });
	   $('.chose_ul li').click(function(){
	   	  var txt = $(this).text();
	   	  $('.chosebox').removeClass('show');
	   	  $('.jubap_type input').val(txt);
	   	 return false;
	   });

   //计算输入的字数
    $(".jubao_content ").bind('input propertychange','textarea',function(){
         var length = 100;
         var content_len = $(".jubao_content textarea").val().length;
         var in_len = length-content_len;
         if(content_len>=100){
         	$(".jubao_content textarea").val($(".jubao_content textarea").val().substring(0,100));
         }
        $('.jubao_content dt em').text($(".jubao_content textarea").val().length);

    });


   //发布短视频
   $('.fabu_btn').click(function(){
   		var userid = $.cookie(cookiePre+"login_user");
	    if(userid == null || userid == ""){
	       window.location.href = masterDomain+'/login.html';
	       return false;
	    }
	    window.location.href = member_center+'/fabu_circle.html'

   })






   var comm_page = 1, comm_load = 0;
   var reply_page = 1; reply_load = 0;
	 //评论列表加载
	$('.comm_box').click(function(){
	  	var id = $('#videoid').val();
	  	$('.commonlist_box').animate({"bottom":0},200);
		$('.commonlist_box h2').attr('data-type','comment');
		$('.mask_comm').show();
		comm_page = 1;
		comm_load = 0;
	  	getcommt();  //加载评论
		console.log(slideN)
	  	mySwiper2.allowSlideNext = false;
	  	mySwiper2.allowSlidePrev = false;
	});
	$('body').delegate('.commonlist_box i.close_btn,.mask_comm','click',function(){
	  	$('.commonlist_box').animate({"bottom":"-68%"},200);
	  	$('.mask_comm').hide();
	    if(slideN==1){
	    	mySwiper2.allowSlideNext = true;
	    }
		if(slideP==1){
			mySwiper2.allowSlidePrev = true;
		}

	});
  	//回复列表加载
  	$('body').delegate('.reply_detail','click',function(){
  		$('.commonlist_box h2').attr('data-type','replay');

  		var pid = $(this).parents('li.comm_li').attr('data-id');
  		$('.commonlist_box h2').attr('data-pid',pid);
  		reply_page = 1; reply_load = 0;
  		getreply(pid);
  		return false;
  	});

  	//返回评论
	$('body').delegate('.back_comt','click',function(){
		var id = $('#videoid').val();
		comm_page = 1;
		comm_load = 0;
		getcommt();  //加载评论
	});


  	//滚动加载
  	$('.comm_ul').scroll(function(){
  		 var allh = $('.comm_ul')[0].scrollHeight;
         var w = $('.comm_ul').height();
         var scroll = allh - w -20;
         var type = $('.commonlist_box h2').attr('data-type');

         if ($('.comm_ul').scrollTop() >= scroll ) {
         	if(type=='comment' && !comm_load){
         		getcommt();
         	}else if(type=='reply' && !reply_load){
         		var pid = $('.commonlist_box h2').attr('data-pid');
         		getreply(pid)
         	}

         }
  	});

  	//评论点赞
  	$('.commonlist_box').delegate('.right_zan','click',function(){
  		var t = $(this), id = t.closest("li").attr("data-id");
  		var userid = $.cookie(cookiePre+"login_user");
	      if(userid == null || userid == ""){
	        window.location.href = masterDomain+'/login.html';
	        return false;
	      }
	      t.addClass('disabled');

         if(id != "" && id != undefined){
            $.ajax({
                url: "/include/ajax.php?service=member&action=dingComment&type=add&id="+id,
                type: "GET",
                dataType: "json",
                success: function (data) {
					if(data.state==100){
						var ncount = Number(t.text().replace("(", "").replace(")", ""));
						 t.find('span').css('animation','mypopup .5s ease-in-out')
						if(!t.hasClass("zaned")){
							t.addClass("zaned").find('.comzan_num').html(ncount+1);
							console.log('点赞')
						}else{
							t.removeClass("zaned").find('.comzan_num').html(ncount-1);
							console.log('取消点赞')
						}
						t.removeClass('disabled');
						setTimeout(function(){
							t.find('span').css('animation','')
						},500)
					}else{
						showMsg(data.info)
					}

                }
            });
        }
  	});

  	//回复评论
  	$('.commonlist_box').delegate('li.comm_li>.center_cont','click',function(){
  		var id = $(this).closest('li.comm_li').attr('data-id');
  		var reply_nick = $(this).find('.nickname').text();
  		$('.reply_txtarea').attr("placeholder",langData['circle'][3][31]+"  @"+reply_nick);//回复
  		$('.reply_txtarea').attr("data-cmid",id);
  		$('.reply_txtarea').attr("data-type","reply");
  		$('.reply_txtarea').focus();
  		setTimeout(function(){
			$(window).scrollTop($(window).height());
		}, 100);
  	});

    //回复回复
  	$('.commonlist_box').delegate('.reply_ul li.reply_li>.center_cont','click',function(){
  		var id = $(this).closest('li.reply_li').attr('data-id');
  		var reply_nick = $(this).find('.nickname').text();
  		$('.reply_txtarea').attr("placeholder",langData['circle'][3][31]+"  @"+reply_nick);//回复
  		$('.reply_txtarea').attr("data-cmid",id);
  		$('.reply_txtarea').attr("data-type","reply");
  		$('.reply_txtarea').focus();
  		setTimeout(function(){
			$(window).scrollTop($(window).height());
		}, 100);
  	});
  	//失焦后变成回复小视频
	$('.reply_txtarea').blur(function(){
		if($('.reply_txtarea').val()==''){
			$('.reply_txtarea').attr("placeholder",placeholderText);
			$('.reply_txtarea').removeAttr('data-cmid');
			$('.reply_txtarea').attr("data-type","commt");
			$('.commonlist_box').click()
		}
	});
  	//点击输入框
  	$('.reply_txtarea').click(function(){
  		$('.reply_txtarea').focus();
//		setTimeout(function(){
//			$(window).scrollTop($(window).height());
//		}, 100);
  	});

  	//监听评论框输入
//	$('.reply_txtarea').bind("input propertychange",function(event){
//     console.log($('.reply_txtarea').html())
//	});

	$('input,textarea,.reply_txtarea').blur(function(){
		setTimeout(function(){
			$(window).scrollTop($(window).height());
		}, 100);
	})
  	//发布评论
  	$('.reply_btn').click(function(){
  		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}
  		var type = $('.reply_txtarea').attr('data-type');
		if(type == "commt"){   //评论
			id = $('#videoid').val();
			console.log('评论信息'+id)
			url = '/include/ajax.php?service=member&action=sendComment&check=1&type=circle-dynamic&aid=' + id;
		}else if(type == "reply"){    //回复
			id = $('.reply_txtarea').attr('data-cmid');
			console.log('回复评论'+id)
			url = '/include/ajax.php?service=member&action=replyComment&check=1&id=' + id;
		}
		var ptype = $('.commonlist_box h2').attr('data-type');
  		var replytxt = $.trim($('.reply_txtarea').val());
  		console.log("评论:"+replytxt)
  		if(replytxt != ''){
  		 $.ajax({
            url: url,
            data: "content="+replytxt,
            type: "POST",
            dataType: "json",
            success: function (data) {
                if(data && data.state == 100){
                    var info = data.info;
                    var list = [];
                    $('.reply_txtarea').val('');
					var uphoto = (info.userinfo.photo=="")?"/static/images/default_user.jpg":info.userinfo.photo
                    if(type=="commt"){
                    	$('.comm_ul').append('<li class="comm_li fn-clear"><div class="left_head"><img src="'+(uphoto)+'" οnerrοr="javascript:this.src=\'/static/images/default_user.jpg\';"  /></div><a href="javascript:;" class="right_zan"><span></span><p class="comzan_num">0</p></a><div class="center_cont"><p class="nickname">'+info.userinfo.nickname+'</p><p class="comm">'+info.content+'</p><p class="pubtime">'+huoniao.transTimes(info.dtime,3)+(info.iphome ? ' · ' + info.iphome : '')+'</p></div></li>');

                    }else if(ptype=='comment'){
                    	var tip = $('.comm_ul li[data-id="'+id+'"]').find('.reply_detail')
                    	var num = $('.comm_ul li[data-id="'+id+'"]').find('.reply_detail em').text();
                    	tip.find('em').text(num*1+1);
                    	var len = $('.comm_ul li[data-id="'+id+'"]').find('.reply_ul').length;
                    	var html = '<li class="reply_li"><div class="left_head"><img src="'+(uphoto)+'"  οnerrοr="javascript:this.src=\'/static/images/default_user.jpg\';"/></div><a href="javascript:;" class="right_zan"><span></span><p class="comzan_num">0</p></a><div class="center_cont"><p class="nickname">'+info.userinfo.nickname+'</p><p class="comm">'+info.content+'</p><p class="pubtime">'+huoniao.transTimes(info.dtime,3)+(info.iphome ? ' · ' + info.iphome : '')+'</p></div></li>'
                    	if(len>0){
                    		$('.comm_ul li[data-id="'+id+'"]').find('.reply_ul').append(html);
                    		$('.comm_ul li[data-id="'+id+'"]').find('.reply_ul').append(tip);

                    	}else{
                    		$('.comm_ul li[data-id="'+id+'"]').append('<ul class="reply_ul">'+html+'</ul>');
                    	}

                    }else{
                      $('.comm_ul').append('<li class="comm_li fn-clear"><div class="left_head"><img src="'+(uphoto)+'" οnerrοr="javascript:this.src=\'/static/images/default_user.jpg\';" /></div><a href="javascript:;" class="right_zan"><span></span><p class="comzan_num">0</p></a><div class="center_cont"><p class="nickname">'+info.userinfo.nickname+'</p><p class="comm">'+info.content+'</p><p class="pubtime">'+huoniao.transTimes(info.dtime,3)+(info.iphome ? ' · ' + info.iphome : '')+'</p></div></li>');
                    };

                    $('.comm_ul').append($('.comm_loading'))

                }

            }
        });
  		}else{
  			alert(langData['circle'][3][20])  //'请输入评论内容'
  		}

  	});

  	//打赏
  	var dashangElse = false;
    $('.reward_box').click(function(){
        var t = $(this),newsid =$('#videoid').val();
      if(t.hasClass("load")) return;
        t.addClass("load");
      //验证文章状态
        $.ajax({
            "url":  "/include/ajax.php?service=circle&action=checkRewardState",
            "data": {"aid": newsid},
            "dataType": "jsonp",
            success: function(data){
                t.removeClass("load");
                if(data && data.state == 100){

                  $('.mask').show();
                  $('.shang-box').show();
                    $('.shang-item-cash').show();$('.shang-item .inp').show();
                    $('.shang-item .shang-else').hide();
                    $('body').bind('touchmove',function(e){e.preventDefault();});
                    $('.shang_to').find('span').text($('.name_title').text())

                }else{
                    alert(data.info);
                }
            },
            error: function(){
                t.removeClass("load");
                alert("网络错误，操作失败，请稍候重试！");
            }
        });
    });

       // 其他金额
    $('.shang-item .inp').click(function(){
      	$(this).hide();
      	$('.shang-item-cash').hide();
    	$('.shang-money .shang-item .error-tip').show()
      	$('.shang-item .shang-else').show();
    	dashangElse = true;
    	$(".shang-else input").focus();
    })

    // 遮罩层
    $('.mask').on('click',function(){
	    $('.mask').hide();
	    $('.shang-money .shang-item .error-tip').hide()
	    $('.shang-box').hide();
	    $('.paybox').animate({"bottom":"-100%"},300)
	    setTimeout(function(){
	      $('.paybox').removeClass('show');
	    }, 300);
        $('body').unbind('touchmove')
    })

    // 关闭打赏
    $('.shang-money .close').click(function(){
        $('.mask').hide();$('.shang-box').hide();
        $('.shang-money .shang-item .error-tip').hide()
        $('body').unbind('touchmove')
    })

  // 选择打赏支付方式
  var amount = 0;
  $('.shang-btn').click(function(){
  	var newsid = $('#videoid').val()
      amount = dashangElse ? parseFloat($(".shang-item input").val()) : parseFloat($(".shang-item-cash em").text());
      var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
      var re = new RegExp(regu);
      if (!re.test(amount)) {
          amount = 0;
          alert("打赏金额格式错误，最少0.01元！");
          return false;
      }
      if(amount > rewardLimit){
        alert("最多"+rewardLimit+"元！");
        return false;
      }

      // var app = device.indexOf('huoniao') >= 0 ? 1 : 0;
      // location.href = "/include/ajax.php?service=circle&action=reward&aid="+newsid+"&amount="+amount+"&app=1";

      // return;

      // $('.shang-box').animate({"opacity":"0"},300);
      // setTimeout(function(){
      //   $('.shang-box').hide();
      // }, 300);

      // //如果不在客户端中访问，根据设备类型删除不支持的支付方式
      // if(appInfo.device == ""){
      //   // 赏
      //   if(navigator.userAgent.toLowerCase().match(/micromessenger/)){
      //       $("#shangAlipay, #shangGlobalAlipay").remove();
      //   }
      //   // else{
      //   //  $("#shangWxpay").remove();
      //   // }
      // }
      // $(".paybox li:eq(0)").addClass("on");

      // $('.paybox').addClass('show').animate({"bottom":"0"},300);

      $.ajax({
            
            url: '/include/ajax.php?service=circle&action=reward&aid='+newsid+'&amount='+amount,
            type: "POST",
            dataType: "json",
            success: function (data) {
                  var info = data.info;

                  payCutDown('',info.timeout,info);

                  $("#amout").text(info.order_amount);
                  $('.payMask').show();
                  $('.payPop').css('transform','translateY(0)');
                  //
                  // if(usermoney*1 < info.order_amount *1){
                  //
                  //   $("#moneyinfo").text('余额不足，');
                  // }
                if (usermoney * 1 < info.order_amount * 1) {

                  $("#moneyinfo").text('余额不足，');
                  $("#moneyinfo").closest('.check-item').addClass('disabled_pay')
                }else{
                  $("#moneyinfo").text('可用');
                  $("#moneyinfo").closest('.check-item').removeClass('disabled_pay')
                }
                 if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
                    $("#bonusinfo").text('额度不足，可用');
                    $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                 }else if( bonus * 1 < info.order_amount * 1){
                   $("#bonusinfo").text('余额不足，可用');
                   $("#bonusinfo").closest('.check-item').addClass('disabled_pay')
                 }else{
                   $("#bonusinfo").text('可用');
                   $("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
                 }

                  if(typeof(timer_trade) != 'undefined' && timer_trade != null){
                    clearInterval(timer_trade);
                  }else{
                  	var timer_trade = null;
                  }

                  //验证是否支付成功，如果成功跳转到指定页面


                  timer_trade = setInterval(function(){
                    $.ajax({
                      type: 'POST',
                      // async: false,
                      url: '/include/ajax.php?service=member&action=tradePayResult&type=1&order='+ordernum,
                      dataType: 'json',
                      success: function(str){
                        if(str.state == 100 && str.info != ""){
                          //如果已经支付成功，则跳转到指定页面
                          location.href = str.info;
                        }
                      }
                    });

                  }, 2000);
                  ordernum     = info.ordernum;
                  order_amount = info.order_amount;
            },
            error: function () { }
        });

  })

  $('.paybox li').click(function(){
    var t = $(this);
    t.addClass('on').siblings('li').removeClass('on');
  })

  //提交支付
  $("#dashang").bind("click", function(){

      var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
      var re = new RegExp(regu);
      if (!re.test(amount)) {
          amount = 0;
          alert("打赏金额格式错误，最少0.01元！");
          return false;
      }

      var paytype = $(".paybox .on").data("id");
      if(paytype == "" || paytype == undefined){
          alert("请选择支付方式！");
          return false;
      }

      //非客户端下验证支付类型
      if(appInfo.device == ""){
            if (paytype == "alipay" && navigator.userAgent.toLowerCase().match(/micromessenger/)) {
                showErr("微信浏览器暂不支持支付宝付款<br />请使用其他浏览器！");
                return false;
              }

          location.href =  "/include/ajax.php?service=circle&action=reward&aid="+newsid+"&amount="+amount+"&paytype="+paytype;
      }else{
          location.href = "/include/ajax.php?service=circle&action=reward&aid="+newsid+"&amount="+amount+"&paytype="+paytype+"&app=1";
      }


  });














	  //获取评论
	  function getcommt(){
	  	comm_load = 1;
	  	var id  = $("#videoid").val();
	  	if(comm_page==1){
	  		$('.comm_ul').html('');
	  	}

	  	$('.comm_ul').append('<div class="comm_loading"><img src="'+templets_skin+'images/loading.png" /></div>');
	  	$.ajax({
			type: "post",
			dataType: "json",
			url: "/include/ajax.php?service=member&action=getComment&son=1&type=circle-dynamic&page="+comm_page+"&pageSize=10&aid="+id,
			cache:false,
			success: function(d){
				if (d.state == 100) {
					var list = d.info.list, html = [];
					$('.commonlist_box h2').html('<em>'+d.info.pageInfo.totalCount+'</em>条评论  <i class="close_btn"></i>')
					for(var i=0; i<list.length; i++){
						html.push('<li class="comm_li fn-clear" data-id="'+list[i].id+'">');
						html.push('<div class="left_head">');
						html.push('<img src="'+(list[i].user.photo?list[i].user.photo:staticPath+"images/default_user.jpg")+'" /></div>');
						html.push('<a href="javascript:;" class="right_zan '+(list[i].zan_has?"zaned":"")+'">');
						html.push('<span></span><p class="comzan_num">'+((list[i].zan>10000)?(list[i].zan/10000+"w"):list[i].zan)+'</p></a>');
						html.push('<div class="center_cont">');
						html.push('<p class="nickname">'+list[i].user.nickname+'</p>');
						html.push('<p class="comm">'+list[i].content+'</p>');
						html.push('<p class="pubtime">'+huoniao.transTimes(list[i].dtime,3)+(list[i].iphome ? ' · ' + list[i].iphome : '')+'</p></div>');
						if(list[i].lower.count>0){
							html.push('<ul class="reply_ul">');
							html.push('<li class="reply_li" data-id="'+list[i].lower.list[0].id+'">');
							html.push('<div class="left_head">');
							html.push('<img src="'+(list[i].lower.list[0].user.photo?list[i].lower.list[0].user.photo:staticPath+"images/default_user.jpg")+'" />');
							html.push('</div>');
							html.push('<a href="javascript:;" class="right_zan '+(list[i].lower.list[0].zan_has?"zaned":"")+'">');
							html.push('<span></span><p class="comzan_num">'+list[i].lower.list[0].zan+'</p></a>');
							html.push('<div class="center_cont">');
							html.push('<p class="nickname">'+list[i].lower.list[0].user.nickname+'</p>');
							html.push('<p class="comm">'+list[i].lower.list[0].content+'</p>');
							html.push('<p class="pubtime">'+huoniao.transTimes(list[i].lower.list[0].dtime,3)+(list[i].iphome ? ' · ' + list[i].iphome : '')+'</p>');
							html.push('</div></li>');
							if(list[i].lower.count>1){
								html.push('<a href="javascript:;" class="reply_detail">'+langData['circle'][3][34].replace("1",list[i].lower.count)+'</a>');  //查看1条回复
							}
							html.push('</ul>');
						}
						html.push('</li>');
					}
					$('.comm_ul .comm_loading').remove();
					$('.comm_ul').append(html.join(''));
					comm_page++;
					comm_load = 0;
					if(comm_page > d.info.pageInfo.totalPage){
						comm_load = 1;
						$('.comm_ul').append('<div class="comm_loading">'+langData['circle'][3][33]+'</div>');  //全部加载
					}
				}else{
					$('.commonlist_box h2').html('<em>0</em>'+langData['circle'][3][10]+'  <i class="close_btn"></i>')
					$('.comm_ul .comm_loading').html(langData['circle'][3][32])//'暂无评论，还不快抢沙发'
				}
			}
		});
	  }
	  //获取回复
	  function getreply(pid){
	  	var id = $('#videoid').val();
	  	reply_load = 1;
	  	if(reply_page == 1){
	  		$('.comm_ul').html('');
	  	}
	  	$('.comm_ul').append('<div class="comm_loading"><img src="'+templets_skin+'images/loading.png" /></div>');
		  	$.ajax({
				type: "post",
				dataType: "json",
				url: "/include/ajax.php?service=member&action=getChildComment&type=circle-detail&page="+reply_page+"&pageSize=10&aid="+id+"&pid="+pid,
				cache:false,
				success: function(d){
					if (d.state == 100) {
						var list = d.info.list, html = [];
						$('.commonlist_box h2').html('<span class="back_comt"></span><em>'+d.info.pageInfo.totalCount+'</em>条回复  <i class="close_btn"></i>')
						for(var i=0; i<list.length; i++){
							if(list[i].pid!=list[i].sid){
								third_id = list[i].sid;
							}
							html.push('<li class="comm_li fn-clear" data-id="'+list[i].id+'">');
							html.push('<div class="left_head">');
							html.push('<img src="'+(list[i].user.photo?list[i].user.photo:staticPath+"images/default_user.jpg")+'" /></div>');
							html.push('<a href="javascript:;" class="right_zan '+(list[i].zan_has?"zaned":"")+'">');
							html.push('<span></span><p class="comzan_num">'+((list[i].zan>10000)?(list[i].zan/10000+"w"):list[i].zan)+'</p></a>');
							html.push('<div class="center_cont">');
							html.push('<p class="nickname">'+list[i].user.nickname+'</p>');
							html.push('<p class="comm">'+list[i].content+'</p>');
							html.push('<p class="pubtime">'+huoniao.transTimes(list[i].dtime,3)+(list[i].iphome ? ' · ' + list[i].iphome : '')+'</p></div>');
							html.push('</li>');
							if(list[i].lower.count>0){
								 html.push(getLowerReply(list[i].lower.list, list[i].user));
							}
						}
						$('.comm_ul .comm_loading').remove();
						$('.comm_ul').append(html.join(''));
						reply_load = 0;
						reply_page++;
						if(reply_page>d.info.pageInfo.totalpage){
							reply_load = 1;
							$('.comm_ul').html('<div class="comm_loading">'+langData['circle'][3][33]+'</div>')
						}
					}else{
						$('.comm_ul .comm_loading').html(langData['circle'][3][32])//'暂无评论，还不快抢沙发'
					}
				}
			});
	  }
	  //回复子级
      function getLowerReply(arr, member){
		  console.log(member)
        if(arr){
            var html = [];
            for(var i = 0; i < arr.length; i++){
                var src = staticPath+'images/noPhoto_100.jpg';
                if(arr[i].user.photo){
                    src = huoniao.changeFileSize(arr[i].user.photo, "middle");
                }
                html.push('<li class="comm_li fn-clear" data-id="'+arr[i].id+'"><div class="left_head"><img src="'+src+'" /></div><a href="javascript:;" class="right_zan"><span></span><p class="comzan_num">'+arr[i].zan+'</p></a><div class="center_cont"><p class="nickname">'+arr[i].user.nickname+'</p><p class="comm">'+langData['circle'][3][331]+'      <em>' +arr[i].member.nickname+'：</em>'+arr[i].content+'</p><p class="pubtime">'+huoniao.transTimes(arr[i].dtime,3)+(arr[i].iphome ? ' · ' + arr[i].iphome : '')+'</p></div></li>');
                if(arr[i].lower != null){
                    html.push(getLowerReply(arr[i].lower.list, arr[i].user));

                }
            }
            return html.join("");
        }
      }





})
