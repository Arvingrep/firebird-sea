
/*APP端取消下拉刷新*/
toggleDragRefresh('off');
var device = navigator.userAgent;
	var cookie = $.cookie("HN_float_hide");

//如果不是在客户端，显示下载链接
	if (device.indexOf('huoniao') <= -1 && cookie == null && $('.float-download').size() > 0) {

		$('.float-download').show();
	}

	$('.float-download .closesd').click(function(){
		$('.float-download').hide();
		setCookie('HN_float_hide', '1', '1');
	});

	function setCookie(name, value, hours) { //设置cookie
     var d = new Date();
     d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
     var expires = "expires=" + d.toUTCString();
     document.cookie = name + "=" + value + "; " + expires;
  }
var userAgent = navigator.userAgent.toLowerCase();

if (userAgent.toLowerCase().match(/micromessenger/)) {
	$('.fi_02').show();
};

var u = navigator.userAgent;
var isIOS = u.indexOf('iPhone') > -1;

$(function() {
	$(".emotion-box").html(appendEmoji());
	
	
	
	/*判断是否有广告图*/
	if ($.trim($('.advbox .swiper-wrapper').html()) == '' && $('.advbox .swiper-wrapper').find('.advPlaceholder').length == 0) {
		$('.advbox').hide();
	} else {
		$('.advbox').show();
		/*广告切换*/
		var adv = new Swiper('.advbox', {
			pagination: {
				el: '.swiper-pagination'
			},
			autoplay: {
				delay: 2000,
				disableOnInteraction: false,
			},

			direction: 'horizontal',
			loop: true,
		});

	}

	//图文介绍
	Zepto.fn.bigImage({
		artMainCon:".introduce ",  //图片所在的列表标签
		show_Con:".introduce_title"
	});
	/*关注*/
	$('.tab_box').on('click', 'span',
		function() {
			var userid = $.cookie(cookiePre + "login_user");
			if (userid == null || userid == "") {
				window.location.href = masterDomain + '/login.html';
				return false;
			}

			var t = $(this),id = t.attr('data-id');

			if ($(this).hasClass('active')) {
				$(this).removeClass('active').html('关注');
			} else {
				$(this).addClass('active').html('已关注');
			}

			$.post("/include/ajax.php?service=member&action=followMember&id=" + id);
		});

	/*更多*/
	$('.more_detail').click(function() {
		$('.videoTitle').toggleClass('limit')
	});

//	var now = parseInt(new Date().getTime() / 1000);
//	var container = $('#myswiper');
//	var page = 1;
//	var timer = null;
//	var loadImgText = false;
//	function getImgText(opeartype) {
//		if(loadImgText) return;
//		(function(type){
//			var param = [];
//			param.push('chatid=' + id);
//			param.push('page=' + page);
//
//			// 获取历史消息
//			if(type == 'old'){
//				var oid = $('#myswiper li:last-child').attr('data-id');
//				param.push('id='+oid);
//				param.push('pageSize=10');
//			}else{
//				var time = $('#myswiper li').length ? $('#myswiper li:first-child').attr('data-pubdate') : '';
//				param.push('date=' + time);
//				param.push('pageSize='+(time ? 50 : 10));
//			}
//			loadImgText = true;
//			$.ajax({
//				url: '/include/ajax.php?service=live&action=imgTextList&' + param.join('&'),
//				type: 'get',
//				dataType: 'json',
//				success: function(res) {
//					loadImgText = false;
//					if (res && res.state == 100) {
//						if (res.info.list.length) {
//							var html = [];
//							for (var i = 0; i < res.info.list.length; i++) {
//								var d = res.info.list[i];
//								html.push('<li class="libox big_img" data-id="' + d.id + '" data-pubdate="' + d.pubdate + '">');
//								html.push('  <div class="info fn-clear">');
//								html.push('    <div class="art_info">');
//								html.push('      <span class="art_head">');
//								html.push('        <img src="' + cfg_attachment + media.ac_photo + '" />');
//								html.push('      </span>');
//								html.push('      <span class="art_name">' + media.ac_name + ' </span>');
//								html.push('    </div>');
//								html.push('    <div class="img_info">' + huoniao.transTimes(d.pubdate, 1) + '</div>');
//								html.push('  </div>');
//								html.push('  <a href="javascript:;" class="fn-clear">');
//								if (d.text) {
//									html.push('    <h2>' + d.text + '</h2>');
//								}
//								if (d.img.length) {
//									html.push('    <div class="img_box">');
//									for (var n = 0; n < d.img.length; n++) {
//										html.push('      <img src="' + d.img[n] + '"/>');
//									}
//
//									html.push('    </div>');
//								}
//								html.push('  </a>');
//								html.push('</li>');
//							}
//							if(type == 'old'){
//								container.append(html.join(""));
//							}else{
//								container.prepend(html.join(""));
//							}
//							$("img").scrollLoading();  //测试懒加载
//						}
//					}
//				},
//				error: function(){
//					loadImgText = false;
//				}
//			})
//		})(opeartype)
//	}
//	if ($('.con_box li[data-id="1"]').length) {
//		getImgText();
//		setInterval(function(){
//			getImgText();
//		}, 5000)
//	}
//	$(window).scroll(function(){
//		var sct = $(window).scrollTop(), winh = $(window).height(), last = $('.libox:last-child');
//		if(!last.length || last.hasClass('load')) return;
//		var lasttop = last.offset().top;
//		if(sct + winh + 50 >= lasttop){
//			last.addClass('load');
////			getImgText('old');
//		}
//	})
});

/*创建播放器*/
var islive = false,
type = $('.prism-player').data('type');
if (type == 1) {
	islive = true;
	$('#progress, #time').css('visibility', 'hidden');
}
var source = $('.prism-player').data('src');
var poster = $('.prism-player').data('poster');
if($('#player-con').length>0){
	var player = new Aliplayer({
	"id": "player-con",
	"source": source,
	"cover": poster,
	"width": "100%",
	"height": "100%",
	"autoplay": false,
	"isLive": islive,
	"rePlay": false,
	"playsinline": true,
	"preload": true,
	"controlBarVisibility": "hover",
	"useH5Prism": true,
	"skinLayout": [],
},
function(player) {
	console.log("播放器创建了。");
	$('.poster_img').hide()
	$('#player-con video').attr('poster', poster);

});
}else{
	console.log('预告');
}



/*滚动条滚动*/
$(window).scroll(function() {

	var v_top = $('.con_box').offset().top - $('.videoinfo').height();
	scroll = $(window).scrollTop()-10;
	if (scroll > v_top && $('.vinfo_box').find('.prism-player').length==0) {
		$('.video_big ').addClass('position')
		$('.vinfo_box').show();//.find('.v_right').append($('.prism-player'))
		$('.tab_box').addClass('topfixed');
	} else {
		$('.video_big ').removeClass('position');
		$('.vinfo_box').hide();
		$('.tab_box').removeClass('topfixed');


	}
	return false;
});

/*点击小视屏，回到顶部*/
$('.vinfo_box .v_left').click(function() {
	$(window).scrollTop(0);
});
/*控制栏显示*/
$('.prism-player video').on('click',
function() {
	$('.video-btn').css('display', '-webkit-flex');
	$('#video-control').css('display', '-webkit-flex');
	$(".live_state").css('display','block');
	setTimeout(function() {
		$('#video-control').css('display', 'none');
		$('.video-btn,.live_state').css('display', 'none');
	},
	5000);
});

function getlook(){

	$.ajax({
			url: '/include/ajax.php?service=live&action=detail&id='+id,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data.state==100){
					$(".live_state.living em").html(data.info[0].click+'人正在观看');
				}
				
			},
			error: function(){

			}
		});
}

if(livedetail_state == 1){
	setInterval(getlook,5000);
}


var box = $("#video-control");
/*box对象*/
var video = $("#video");
/*视频对象*/
var play = $("#play");
/*播放按钮*/
var vbplay = $("#vbplay");
/*视频中间播放按钮*/
var time = $('#time');
var progress = $("#progress");
/*进度条*/
var bar = $("#bar");
/*蓝色进度条*/
var control = $("#control");
/*声音按钮*/
var sound = $("#sound");
/*喇叭*/
var full = $("#full");
/*全屏*/
if(player){
	player.on('pause',
function() {
	play.addClass('play').removeClass('pause');
	$('.play-box').find('i').removeClass('pause-icon').addClass('play-icon');

});
player.on('play',
function() {
	play.addClass('pause').removeClass('play');
	// vbplay.click();
	$('.play-box').find('i').removeClass('play-icon').addClass('pause-icon');
	$('.load-box, .prism-cover').hide();

});

/*数据缓冲*/
player.on('waiting',
function() {
	$('.video-btn').css('display', '-webkit-flex');
	vbplay.hide();
	$('.load-box').show();
});
player.on('canplay',
function() {
	vbplay.show();
	$('.load-box').hide();
});

player.on('ended',
function() {
	$('.video-btn').css('display', '-webkit-flex');
	vbplay.show();
});
/*视频时间*/
player.on('timeupdate',
function() {
	var timeStr = parseInt(player.getCurrentTime());
	var minute = parseInt(timeStr / 60);
	if (minute == 0) {
		if (timeStr < 10) {
			timeStr = "0" + timeStr;
		}
		minute = "00:" + timeStr;
	} else {
		var timeStr = timeStr % 60;
		if (timeStr < 10) {
			timeStr = "0" + timeStr;
		}
		minute = minute + ":" + timeStr;
	}
	time.html(minute);
});
/*当视频全屏的时候*/
player.on('requestFullScreen',
function() {
	if (!isIOS) {
		$('.full').addClass('small');
		$('#player-con video').css({
			'width': '100%',
			'height': 'auto !important'
		});
	}

});
/*当视频取消全屏的时候*/
player.on('cancelFullScreen',
function() {
	$('.full').removeClass('small');
	if (!isIOS) {
		$('#player-con video').css({
			'width': '100%',
			'height': '100% !important'
		});
	}
	player.play();
});
/*进度条*/
player.on('timeupdate',
function() {
	var scales = player.getCurrentTime() / player.getDuration();
	bar.css('width', progress.width() * scales + "px");
	control.css('left', progress.width() * scales + "px");
},
false);
}
var move = 'ontouchmove' in document ? 'touchmove': 'mousemove';
control.on("touchstart",
function(e) {
	var leftv = e.touches[0].clientX - progress.offset().left - box.offset().left;
	if (leftv <= 0) {
		leftv = 0;
	}
	if (leftv >= progress.width()) {
		leftv = progress.width();
	}
	control.css('left', leftv + "px");
	console.log('开始' + leftv)
},
false);
control.on('touchmove',
function(e) {
	var leftv = e.touches[0].clientX - progress.offset().left - box.offset().left;
	if (leftv <= 0) {
		leftv = 0;
	}
	if (leftv >= progress.width()) {
		leftv = progress.width();
	}
	control.css('left', leftv + "px");
	console.log('移动' + leftv)
},
false);
control.on("touchend",
function(e) {
	var leftv = e.changedTouches[0].clientX - progress.offset().left - box.offset().left;
	var scales = leftv / progress.width();

	player.seek(player.getDuration() * scales);

	document.onmousemove = null;
	document.onmousedown = null;
	console.log(control.offset().left)
},
false);

/*设置静音或者解除静音*/
sound.click(function() {
	if (sound.hasClass('soundon')) {
		sound.removeClass('soundon').addClass('soundoff');
		player.setVolume(0);
		console.log('静音')
	} else {
		sound.addClass('soundon').removeClass('soundoff');
		player.setVolume(.5)
	}
});
/*设置全屏*/

full.click(function() {
	if (!isIOS) {
		if (player.fullscreenService.getIsFullScreen()) {
			$(this).removeClass('small');
			player.fullscreenService.cancelFullScreen();
		} else {
			$(this).addClass('small');
			player.fullscreenService.requestFullScreen();
		}
	} else {
		player.fullscreenService.requestFullScreen();
	}
});

/*点击播放*/

vbplay.click(function() {
	var status = player.getStatus();
	$('.prism-player video').click();
    $('.prism-cover').addClass('hide');
	console.log(status);
	if (status == 'playing') {
		player.pause();
	} else {
		player.play();
	}
});

play.click(function() {
	if (play.hasClass('play')) {
		player.play();
		console.log('播放中');
	} else {
		player.pause();
		console.log('暂停中')
	}
});

/*tab页面切换*/
//$('.tab li').click(function() {
//	var t = $(this),
//	id = t.data('id');
//	$(this).addClass('tab_on').siblings('li').removeClass('tab_on');
//	var i = $(this).index();
//	if (id > 0) {
//		$('.con .con_li').eq(i).addClass('show').siblings('.con_li').removeClass('show');
//		//修改
//		setTimeout(function(){
//			$('.con .con_li').eq(i).find('.btm_fixed').fadeIn();
//			$('.con .con_li').eq(i).siblings('.con_li').find('.btm_fixed').fadeOut();
//		},500)
//	}
//});

// 互动的高度
    var a = $(window).height();
    var b = $('.player-area').height();
    var c = 0;
    var d = $('.header').height();
    var e = $('.search_bar').height();
    var f = $('.btn_request').height();
//  $('.interact').css('min-height',a-b-c-d-e);
    $('.jieshao').css('min-height',a-b-c-d);
   $('.hudong').css('height',a-b-c-d-e);
       $('.yaoqinbang').css('min-height',a-b-c-d);
    $('.yqb').css('min-height',a-b-c-d-f);
       $('.interact').css('height',a-b-c-d-e);
		$('#myswiper').css('min-height',a-b-d);
		$('.hezuo').css('min-height',a-b-c-d);
		$('.tuwen').css('min-height',a-b-c-d);



/*点击互动的搜索框*/
$('.search_keyword').click(function() {
	checkLogin();
	console.log(111)
	$('.ios-input-box').show();
	$('#content_text').focus();
	$('#content_text').click();
	$('.reply_title').text('发表评论');
	$('.prism-player video').addClass('player-hide');
	/*隐藏视频*/
});
$('.ios-input-close').click(function() {
	$('#content_text').attr('data-reply', '');
	$('.ios-input-box').hide();
	$('.emotion-box').hide();
	$('.search_bar').css('bottom', '0');
	$('.biaoqin').removeClass('active');
	$('.prism-player video').removeClass('player-hide');
	/*显示视频*/
});

//$('#content_text').focus(function() {
//	$('.emotion-box').hide();
//	$('.search_bar').css('bottom', '0');
//	$('.biaoqin').removeClass('active');
//	console.log('哈哈哈')
//});
$('#content_text').click(function() {
	$('.emotion-box').hide();
	$('.search_bar').css('bottom', '0');
	$('.biaoqin').removeClass('active');

});

/*表情区域禁止滑动*/
// $('.emotion-box, .linkbox').bind('touchmove',
// function(e) {
// 	e.preventDefault();
// });
/*点赞*/
$('.fixed_icon .fi_04').click(function() {
	checkLogin();
	var t = $(this),
	m = parseInt(t.find('p').text());
    var zanTitle = wxconfig.title;

    t.hasClass('active') ? m-- : m++;
    var zanTitle = wxconfig.title;
    $.ajax({
        url: "/include/ajax.php?service=member&action=getZan&module=live&temp=detail&title="+zanTitle+"&uid="+luser_id+"&id="+id,
        type: "GET",
        dataType: "jsonp",
        success: function (data) {
            if(data.state == 100){
                t.toggleClass('active');
                t.find('p').text(m);
            }else{
                showErrAlert(data.info);
            }
        }
    });
});

/*点击加-红包、照片*/
$('.jia').click(function() {
	checkLogin();
	upflag = 1;
	var t = $(this);
	if (t.hasClass('on')) {
		t.removeClass('on');
		$('.Multi_function').hide();
		$('.search_bar').css('bottom', '0');
		$('.mask_01').hide();
	} else {
		t.addClass('on');
		$('.Multi_function').show();
		$('.search_bar').css('bottom', '2.04rem');
		$('.mask_01').show();
		$('.emotion-box').hide();
	}
});
$('.mask_01').click(function() {
	$('.jia').removeClass('on');
	$('.Multi_function').hide();
	$('.search_bar').css('bottom', '0');
	$('.mask_01').hide();
});

/*点击送礼物*/
$('.liwu').click(function() {
	checkLogin();
	$('#c-gift').show();
	$('.mask').show();

});
$('.mask').click(function() {
	$('#c-gift').hide();
	$('.mask').hide();
});
$('.layui-m-anim-scale .mlbn-present li').click(function() {
	var t = $(this);
	var c = parseFloat(t.find('.mlbn-present-zan-money').html());
	$('#c-gift').addClass('Upward');
	if (!t.hasClass('on')) {
		t.addClass('on').siblings().removeClass('on');
	}
	$('#fs-gift-total').html(c);
	$('.fsl-shuliang-number').val(1);

});
/*点击表情*/
$('.biaoqin').click(function() {
	checkLogin();
	var t = $(this);
	if (t.hasClass('active')) {
		$('.emotion-box').hide();
		$('.search_bar').css({
			'bottom': '0',
			'z-index': '10'
		});
		t.removeClass('active');
		$('.ios-input-box').hide();
		$('.prism-player video').removeClass('player-hide');

	} else {
		set_focus($('#content_text:last'));
		$('.emotion-box').show();
		$('.search_bar').css({
			'bottom': '4.1rem',
			'z-index': '10000'
		});
		t.addClass('active');
		$('.ios-input-box').show();
		$('.prism-player video').addClass('player-hide');
		$('#c-gift').hide();
		$('.mask').hide();
		$('.Multi_function').hide();
		$('.mask_01').hide();
	}
});

var textarea = $('#content_text');




var memerySelection
$('.emotion-box ').delegate("li","click",function() {

    memerySelection = window.getSelection();
	var t = $(this).find('img');
	var txt = $(this).attr('data-txt');
	if (/iphone|ipad|ipod/.test(userAgent)) {
		$('#content_text').append('<img src="' + t.attr("src") + '" class="emotion-img" data-txt="'+txt+'"/>');
		return false;
	} else {
		set_focus($('#content_text:last'));
		pasteHtmlAtCaret('<img src="' + t.attr("src") + '" class="emotion-img" data-txt="'+txt+'" />');
	}
	document.activeElement.blur();
	return false;
});

/*根据光标位置插入指定内容*/
function pasteHtmlAtCaret(html) {
	var sel, range;

	if (window.getSelection) {
		sel = memerySelection;

		if (sel.anchorNode == null) {
			return;
		}

		if (sel.anchorNode.className != undefined && sel.anchorNode.className.indexOf('placeholder') > -1 || sel.anchorNode.parentNode.className != undefined && sel.anchorNode.parentNode.className.indexOf('placeholder') > -1) {

			if (sel.getRangeAt && sel.rangeCount) {

				range = sel.getRangeAt(0);
				range.deleteContents();
				var el = document.createElement("div");
				el.innerHTML = html;
				var frag = document.createDocumentFragment(),
				node,
				lastNode;

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
		}
	} else if (document.selection && document.selection.type != "Control") {
		document.selection.createRange().pasteHTML(html);
	}
};

/*光标定位到最后*/
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
};



/*点击邀请榜*/
$('.yaoqinbang .switch_list p span').click(function() {
	var t = $(this);
	var state = t.attr("data-id");
	if (!t.hasClass('active')) {
		t.addClass('active');
		t.siblings().removeClass('active');
		if (state == 1) {
			$(".dashangbang").hide();
			$(".yaoqingbang").show();
		} else {
			$(".yaoqingbang").hide();
			$(".dashangbang").show();
		}
	}
});
//$(".ios-input-submit").click(function() {
//	var text = $("#content_text").html();
//	var replytxt = $("#content_text").attr('data-reply');
//	if (text.trim() == '') {
//		alert("请输入要评论的内容");
//		return;
//	}
//	if (luser_id == -1) {
//		alert("请登录!");
//		window.location.href = masterDomain + '/login.html';
//		return;
//	}
//	if (replytxt != '' && replytxt != null) {
//
//} else {
//
//}
//
//	$.ajax({
//		url: '/include/ajax.php?service=live&action=chatTalk',
//		data: {
//			chatid: chatRoomId,
//			userid: luser_id,
//			username: username,
//			userphoto: userphoto,
//			content: text,
//		},
//		type: 'GET',
//		dataType: 'json',
//		success: function(data) {
//			if (data.state == 100) {
//				$("#content_text").html('').attr('data-reply', '');
//				$('.ios-input-close').click();
//			} else {
//				/*只限于测试*/
//				$("#content_text").html('').attr('data-reply', '');
//				$('.ios-input-close').click();
//				console.log(data);
//			}
//			$(window).scrollTop($('body')[0].scrollHeight);
//
//		}
//	});
//
//});



/*判断登录*/
function checkLogin() {
	var userid = $.cookie(cookiePre + "login_user");
	if (userid == null || userid == "") {
		window.location.href = masterDomain + '/login.html';
		return false;
	}
};



$(".hd_sign_out").click(function() {
	$(".disk_03").hide();
	$(".hongbao_list").hide();
});
$('.main_info').delegate('.hongbao', 'click',
function() {
	var t = $(this),
	h_id = t.attr("data-liveid"),
	state = t.attr("data-state");

	if (state == 1) {
		var info = getHongBaoInfo(h_id);
		showHongBaoAfter(info);
		$('.hb_img').hide();
		$('.disk_02').hide();
		return;
	} else if (state == 2) {
		/*已经抢过 展示抢到的结果*/
		var info = getHongBaoInfo(h_id);
		showHongBaoAfter(info);
		$('.hb_img').hide();
		$('.disk_02').hide();
	} else {
		 $(".hb_qiang").attr("data-id", h_id);
        /*让红包显示*/
        var info = getHongBaoInfo(h_id);
        console.log(info)
        var h_info = t.find('.h_01').text();
        $(".hb_slogan").html(h_info);
        //		var hb_info = info.user;
        $('.hb_img').show();
        $('.hb_img .hb_portrait').find('img').attr('src', info.hongbao.user.photo);
        $('.hb_img .hb_txt').text(info.hongbao.user.nickname);
        $('.disk_02').show();

	}
});

/*点击 抢*/
$(".hb_qiang").click(function() {
	var t = $(this);
	var h_id = t.attr("data-id");
	getHongBao(t, h_id);

});

$(".hudong .fixed_icon .fi_03").click(function() {
	checkLogin();
	$(".disk_04").show();
	$(".dashang").show();

	$('.prism-player video').addClass('player-hide');
	/*隐藏视频*/
});

function showHongBaoAfter(info) {
	if (info.user == undefined) {
		$(".hb_m_number").text('0');
		/*自己没抢到*/
	} else {
		$(".hb_m_number").text(info.user.recv_money);
	}
	$(".hongbao_list .hb_txt").text(info.hongbao.user['nickname'] + "的红包");
	/*发红包的人昵称*/
	$(".hongbao_list .hb_portrait img").attr("src", info.hongbao.user['photo']);
	/*发红包的人头像*/
	var yilq = info.list.length;
	var zongg = info.hongbao.count;
	$(".h_yilingqu").text(yilq);
	/*已抢多少人*/
	$(".h_zonggong").text(zongg);
	/*总共多少个*/
	var ylq_y = 0;
	var list_h = '';
	for (var i = 0; i < yilq; i++) {
		ylq_y += info.list[i].recv_money * 1;
		list_h += '<li class="fn-clear">' + '<div class="listuser_img"><img src="' + info.list[i].user.photo + '"></div>' + '<div class="listuser_name">' + '<p class="fn-clear"><em>' + info.list[i].user.nickname + '</em><em>' + info.list[i].recv_money + echoCurrency('short')+'</em></p>' + '<p>' + info.list[i].date + '</p>' + '</div>' + '</li>';
	}
	var zg_y = info.hongbao.amount;
	$(".ylq_yuan").text(ylq_y);
	/*已抢多少钱*/
	$(".zg_yuan").text(zg_y);
	/*红包总额*/
	/*抢红包列表*/
	$(".list_qianghongbao").html(list_h);
	$(".disk_03").show();
	$(".hongbao_list").show();
};

/*送礼物*/
$("#fs-gift-send").click(function() {
	var t = $(this);
	var gift_id = $("#c-gift").find(".on").attr("data-id");
	var num = $("#fs-gift-amount").val();
	var amount = $(".fs-gift-total").html();
	$.ajax({
		url: '/include/ajax.php?service=live&action=songGift',
		data: {
			reward_userid: live_user,
			live_id: id,
			gift_id: gift_id,
			num: num,
			chat_id: chatRoomId,
			amount: amount,
		},
		type: "GET",
		dataType: "json",
		success: function(data) {
			$(".payBeforeLoading").hide()
			if (data.state == 100) {
				// info = data.info;
				// location.href = info;
				if(typeof(data.info) != 'object'){
					location.href = info;
					return false;
				}
				sinfo = data.info;
				service = 'live';
				$('#ordernum').val(sinfo.ordernum);
				$('#action').val('pay');

				$('#pfinal').val('1');
				$("#amout").text(sinfo.order_amount);
				$('.payMask').show();
				$('.payPop').css('transform', 'translateY(0)');

				if (totalBalance * 1 < sinfo.order_amount * 1) {

					$("#moneyinfo").text('余额不足，');

					$('#balance').hide();
				}

				if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
					$("#bonusinfo").text('额度不足，');
					$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
				}else if( bonus * 1 < sinfo.order_amount * 1){
					$("#bonusinfo").text('余额不足，');
					$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
				}else{
					$("#bonusinfo").text('');
					$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
				}
				$(".mask").click()
				ordernum = sinfo.ordernum;
				order_amount = sinfo.order_amount;
				var ptime = sinfo.timeout ? sinfo.timeout : 0
				payCutDown('', ptime, sinfo);
			} else {
				alert(data.info);
			}
		},
		error: function() {
			console.log('网络错误，操作失败！');
		}
	});
});

function getHongBaoInfo(h_id) {
	var info;
	$.ajax({
		url: '/include/ajax.php?service=live&action=getHongBaoInfo',
		data: {
			h_id: h_id
		},
		type: "GET",
		async: false,
		dataType: "json",
		success: function(data) {
			if (data.state == 100) {
				info = data.info;
			} else {
				alert(data.info);
			}
		},
		error: function() {
			console.log('网络错误，操作失败！');
		}
	});
	return info;
};

/*抢红包*/
function getHongBao(T, h_id) {
	$.ajax({
		url: '/include/ajax.php?service=live&action=getHongbao',
		data: {
			h_id: h_id
		},
		type: "GET",
		dataType: "json",
		success: function(data) {
			if (data.state == 100) {
				if (data.info.states == 200) {
					/*显示领到的钱*/
					var info = getHongBaoInfo(h_id);
					showHongBaoAfter(info);
					$('.hb_img').hide();
					$('.disk_02').hide();
					$(".hongbao").attr("data-state", 2);
					/*已经领过*/

				} else if (data.info.states == 201) {
					/*抢完*/
					$(".hb_receive").css('display', 'block');
					$(".hb_qiang img").hide();
					$(".hb_slogan").text("已抢完");
					$(".hb_receive").attr("data-hid", h_id);
					$(".disk_02").show();
					$(".hb_img").show();

				} else {

					if (data.info.is_fin == 1 && data.info.states == 203) {
						var info = getHongBaoInfo(h_id);
						showHongBaoAfter(info);
						$('.hb_img').hide();
						$('.disk_02').hide();
						$(".hongbao").attr("data-state", 2);
						/*已经领过*/

						/*已抢完*/
						$(".hongbao").removeClass('hongbao_bg_01').addClass('hongbao_bg_02').attr("data-state", 1);

					} else if (data.info.states == 202) {
						T.attr("data-state", 2);
						alert('不能重复领取');
					}

				}
			} else {
				alert(data.info);
			}
		},
		error: function() {
			console.log('网络错误，操作失败！');
		}
	});
};

$(".hb_receive").click(function() {
	var t = $(this);

	$(".disk_02").hide();
	$(".hb_img").hide();
	var info = getHongBaoInfo(t.attr("data-hid"));
	showHongBaoAfter(info);
});

/*验证提示弹出层*/
function showTipMsg(msg) {
	/* 给出一个浮层弹出框,显示出errorMsg,2秒消失!*/
	/* 弹出层 */
	$('.protips').html(msg);
	var scrollTop = $(document).scrollTop();
	var windowTop = $(window).height();
	var xtop = windowTop / 2 + scrollTop;
	$('.protips').css('display', 'block');
	setTimeout(function() {
		$('.protips').css('display', 'none');
	},
	2000);
};

$('.dashang .hong_bottom .hong_bg_l ul li').on('touchstart',
function(e) {
	var t = $(this);
	t.css('background', '#bd2726');
	t.css('color', '#fff');
});
$('.dashang .hong_bottom .hong_bg_l ul li').on('touchend',
function(e) {
	var t = $(this);
	t.css('background', '#fefbdc');
	t.css('color', '#d63233');
});

$('.gengduo .gengduo_btn .gengduo_btn_01').click(function() {
	$('.disk_05').hide();
	$('.gengduo').hide();
});

$('.other_money').click(function() {
	$('.disk_05').show();
	$('.gengduo').show();
});

$('.dashang .hong_sign_out').click(function() {
	$('.disk_04').hide();
	$('.dashang').hide();
	$('.prism-player video').removeClass('player-hide');
});

$(".gengduo_btn_02").click(function() {
	var other_money = $("input[name=other_money]").val();
	if (other_money < 0.1 || other_money > 999) {
		alert('请填写规定的金额');
		return;
	}

	$.ajax({
		url: '/include/ajax.php?service=live&action=songGift',
		data: {
			reward_userid: live_user,
			live_id: id,
			gift_id: 0,
			num: 1,
			chat_id: chatRoomId,
			amount: other_money,
		},
		type: "GET",
		dataType: "json",
		success: function(data) {
			$(".payBeforeLoading").hide()
			if (data.state == 100) {
				if(typeof(data.info) != 'object'){
					location.href = info;
					return false;
				}
				sinfo = data.info;
				service = 'live';
				$('#ordernum').val(sinfo.ordernum);
				$('#action').val('pay');

				$('#pfinal').val('1');
				$("#amout").text(sinfo.order_amount);
				$('.payMask').show();
				$('.payPop').css('transform', 'translateY(0)');

				if (totalBalance * 1 < sinfo.order_amount * 1) {

					$("#moneyinfo").text('余额不足，');

					$('#balance').hide();
				}

				if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
					$("#bonusinfo").text('额度不足，');
					$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
				}else if( bonus * 1 < sinfo.order_amount * 1){
					$("#bonusinfo").text('余额不足，');
					$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
				}else{
					$("#bonusinfo").text('');
					$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
				}
				$(".gengduo_btn_01").click()
				ordernum = sinfo.ordernum;
				order_amount = sinfo.order_amount;
				var ptime = sinfo.timeout ? sinfo.timeout : 0
				payCutDown('', ptime, sinfo);
			} else {
				alert(data.info);
			}
		},
		error: function() {
			console.log('网络错误，操作失败！');
		}
	});

});

$(".hong_bg_l li").click(function() {
	var t = $(this);
	var money = parseInt(t.html());
	var gift_id = 0;
	var num = 1;

	$.ajax({
		url: '/include/ajax.php?service=live&action=songGift',
		data: {
			reward_userid: live_user,
			live_id: id,
			gift_id: gift_id,
			num: num,
			chat_id: chatRoomId,
			amount: money,
		},
		type: "GET",
		dataType: "json",
		success: function(data) {
			$(".payBeforeLoading").hide()
			if (data.state == 100) {
				if(typeof(data.info) != 'object'){
					location.href = info;
					return false;
				}
				sinfo = data.info;
				service = 'live';
				$('#ordernum').val(sinfo.ordernum);
				$('#action').val('pay');

				$('#pfinal').val('1');
				$("#amout").text(sinfo.order_amount);
				$('.payMask').show();
				$('.payPop').css('transform', 'translateY(0)');

				if (totalBalance * 1 < sinfo.order_amount * 1) {

					$("#moneyinfo").text('余额不足，');

					$('#balance').hide();
				}

				if(monBonus * 1 < sinfo.order_amount * 1  &&  bonus * 1 >= sinfo.order_amount * 1){
					$("#bonusinfo").text('额度不足，');
					$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
				}else if( bonus * 1 < sinfo.order_amount * 1){
					$("#bonusinfo").text('余额不足，');
					$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
				}else{
					$("#bonusinfo").text('');
					$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
				}
				$(".hong_sign_out").click()
				ordernum = sinfo.ordernum;
				order_amount = sinfo.order_amount;
				var ptime = sinfo.timeout ? sinfo.timeout : 0
				payCutDown('', ptime, sinfo);
			} else {
				alert(data.info);
			}
		},
		error: function() {
			console.log('网络错误，操作失败！');
		}
	});

});

/*红包的隐藏*/
$('.hb_img .sign_out').click(function() {
	$('.hb_img').hide();
	$('.disk_02').hide();
});

/*送礼物数量*/
$('.fsl-shuliang-plus').click(function() {
	var a = $('.fsl-shuliang-number').val();
	var b = $('.fsl-present-price #fs-gift-total');
	var c = parseFloat($('.mlbn-present .on .mlbn-present-zan-money').html());
	a++;
	var r = (c * a).toFixed(2);
	$('.fsl-shuliang-number').val(a);
	b.html(r);

});
$('.fsl-shuliang-reduce').click(function() {
	var a = $('.fsl-shuliang-number').val();
	var b = $('.fsl-present-price #fs-gift-total');
	var c = parseFloat($('.mlbn-present .on .mlbn-present-zan-money').html());
	if (a > 1) {
		a--;
		var r = (c * a).toFixed(2);
		$('.fsl-shuliang-number').val(a);
		b.html(r);
	}
});
