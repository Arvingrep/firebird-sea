var _thumbNum = 1;
var shearHtml = '<li><a target="_blank" href="http://service.weibo.com/share/share.php?url=pageurl&amp;title=pagetitle" class="weibo" title="分享到 新浪微博">新浪微博</a></li> <li><a target="_blank" href="http://share.v.t.qq.com/index.php?c=share&amp;a=index&amp;title=pagetitle&amp;url=pageurl&amp;pic=picurl" class="tweibo" title="分享到 腾讯微博">腾讯微博</a></li> <li><a target="_blank" href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=pageurl&amp;title=&amp;pics=picurl&amp;summary=" class="qzone" title="分享到 QQ空间">QQ空间</a></li> <li><a target="_blank" href="http://widget.renren.com/dialog/share?resourceUrl=pageurl&amp;srcUrl=#&amp;title=pagetitle&amp;pic=picurl&amp;description=" class="renren" title="分享到 人人网">人人网</a></li> <li><a target="_blank" href="http://shuo.douban.com/%21service/share?image=picurl&amp;href=pageurl&amp;name=pagetitle&amp;text=" class="douban" title="分享到 豆瓣网">豆瓣网</a></li>';

$(function(){
	var isFull = false;
	var length = $('.listul li').length;
	var largeImg = $('.imgbox img');
	var ratioIn = $('.scale_num');
	var scrollWrap = $('.scrollWrap ul');
	var isload = false;

	var groupInfoCon = $('.side_top');

	groupInfoCon.find('.page span').text(length);

	scrollWrap.width(95 * length)
	$('.preview').css('visibility','visible');

	//展开/收起右侧
	$('.toggleSide').click(function(){
		$('body').toggleClass('openSide');
		setTimeout(function(){
			$(window).resize();
		},300)
	})

	//全屏
	$('.fullScreen').click(function(){
		$('body').addClass('full tran0');
		var element = document.documentElement;
		if(element.requestFullscreen) {
			element.requestFullscreen();
		} else if(element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if(element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if(element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
	})

	// 关闭全屏
	function exitFull(){
		$('body').removeClass('full');
		isFull = false;
		if (document.exitFullscreen) {
	        document.exitFullscreen();
	    }
	    else if (document.mozCancelFullScreen) {
	        document.mozCancelFullScreen();
	    }
	    else if (document.webkitCancelFullScreen) {
	        document.webkitCancelFullScreen();
	    }
	    else if (document.msExitFullscreen) {
	        document.msExitFullscreen();
	    }
	    $(window).resize();

	    setTimeout(function(){
	    	$('body').removeClass('tran0');
	    },400)
	}
	$(document).keyup(function(e){
		if(e.which == 27){
			exitFull();
		}else if(e.which == 109){
			changeRation('dec');
		}else if(e.which == 107){
			changeRation('add');
		}
	})
	$('.inside .close').click(function(){
		exitFull();
	})

	//隐藏缩略图
	$('.toggleThumb').click(function(){
		var btn = $(this);
		$('.bigimgbox').addClass('btmtran03').toggleClass('showThumb');
		$('.thumblist').slideToggle(300,function(){
			$('.bigimgbox').removeClass('btmtran03');
			if(btn.hasClass('show')){
				btn.removeClass('show').text('隐藏缩略图');
			}else{
				btn.addClass('show').text('显示缩略图');
			}
			$(window).resize();
		});
	})

	// 放大缩小
	$('.scale span').click(function(){
		var btn = $(this), ratio = parseInt(ratioIn.val());
		if(btn.hasClass('add')){
			ratio = ratio + 5;
		}
		else{
			ratio = ratio >= 6 ? ratio - 5 : 1;
		}
		ratioIn.val(ratio + '%');

		changeRation();
	})

	ratioIn.on("keyup",function(e){
		changeRation();
	})

	function setRatio(){
		var width = largeImg.width(), _width = largeImg.data('width'), ratio = (parseInt(width / _width * 100));
		ratioIn.val(ratio+'%');
	}

	// 改变缩放比例
	function changeRation(type){
		var ratio = parseInt(ratioIn.val());
		if(type == 'add'){
			ratio += 5;
		}
		if(type == 'dec'){
			ratio -= 5;
		}

		ratio = ratio > 1 ? ratio : 1;
		ratioIn.val(ratio+'%');

		var width = largeImg.data('width') * ratio / 100,
			height = largeImg.data('height') * ratio  / 100,
			boxw = $('#dragbox').width(),
			boxh = $('#dragbox').height();

		var left = (boxw - width) / 2,
			top = (boxh - height) / 2;

		$('.imgbox').removeClass('init');
		largeImg.css({'position':'absolute','left':left+'px','top':top+'px','max-width':'','width':width+'px','height':height+'px'});
	}

	//鼠标滚轮
	largeImg.on('mousewheel',function(e){
		var ratio = parseInt(ratioIn.val());
		var delta = -e.originalEvent.wheelDelta || e.originalEvent.detail;//firefox使用detail:下3上-3,其他浏览器使用wheelDelta:下-120上120//下滚
	    if(delta>0){
	        ratio -= 5;
	    }
	    //上滚
	    if(delta<0){
	        ratio += 5;
	    }
	    ratioIn.val(ratio+'%');

	    changeRation();
	})

	setThumbWidth(false);
	$(window).resize(function(){
		setThumbWidth(true);
		largeImg.css({'max-width':'','position':'static'});
		$('#dragbox').css({'left':0,'top':0})
		$('.imgbox').addClass('init');
		largeImg.css({'position':'static','left':0,'top':0,'width':'auto','height':'auto'});

		if($(window).width() < 600){
		}
		setRatio();
	});

	var resizeTime = 0;

	function setThumbWidth(resize){

		$('.compatible').css('height',$('#bigimgbox').height());

		var wrapw = $('.inside').width();

		$('.imgbox img').css('max-width',wrapw+'px');

		if(resize && isFull) return;

		var conMaxW = wrapw - 200;
		var thumbMaxNum = parseInt(conMaxW / 95)  == 0 ? 1 :  parseInt(conMaxW / 95);
		_thumbNum = length > thumbMaxNum ? thumbMaxNum : length;
		var thumbWidth = _thumbNum * 95;
		$('.scrollWrap').width(thumbWidth);

		if(resize){
			clearTimeout(resizeTime);
			resizeTime = setTimeout(function(){
				setThumbLeft();
			},500)
		}
	}

	//缩略图并滚动
	function setThumbLeft(index){
		var showLen = _thumbNum;
		var curr = $('.listul li.curr');
		var index = index == undefined ? curr.index() : index;
		var step = index - parseInt(showLen / 2)
		var maxStep = length - showLen;

		var havemore = true;
		while(!isload && havemore && step >= maxStep){
			getData(function(data){
				if(data && data.imglist.length > 0){
					maxStep = length - showLen;
				}else{
					havemore = false;
				}
			})
		}

		if(step < 0) step = 0;
		if(step > maxStep) step = maxStep;

		var move = step * 95;

		$('.listul').stop(true).animate({
			'left':'-'+move+'px'
		},500,'easeInQuart',function(){
			if(index == 0){
				$('.large_prev, .arrow-left').addClass('disabled');
			}else if(index == length - 1){
				$('.large_next').addClass('disabled');
			}else{
				var nowstep = Math.abs(parseInt(scrollWrap.css('left'))) / 95;
				if(nowstep >= maxStep){
					$('.arrow-right').addClass('disabled');
				}else{
					$('.arrow-right').removeClass('disabled');
				}

				$('.large_prev, .large_next').removeClass('disabled');
				var left = parseInt(scrollWrap.css('left'));
				if(left < 0){
					$('.arrow-left').removeClass('disabled');
				}else{
					$('.arrow-left').addClass('disabled');
				}
				if(left / 95 == -(length - showLen) ) {
					$('.arrow-right').addClass('disabled');
				}else{
					$('.arrow-right').removeClass('disabled');
				}
			}
		})

	}

	// 点击缩略图
	$('.listul').delegate('li','click',function(){
		var slide = $(this), index = slide.index(), large = slide.find('img').attr('data-large'), showLen = _thumbNum;
		if(slide.hasClass('curr')) return;
		slide.addClass('curr').siblings().removeClass('curr');
		$('#bigimgbox').addClass('bgload');
		$('.imgbox').addClass('init');
		$('#dragbox').css({'left':0,'top':0});

		largeImg.attr({'src':large})
				.css({'position':'static','width':'auto','height':'auto','left':0,'top':0});

		var group    = parseInt(slide.attr('data-group')),
			gindex   = parseInt(slide.attr('data-index')),
			gtitle   = pageInfo[group].title,
			gtypeid  = pageInfo[group].typeid,
			gtypename = pageInfo[group].typeName[1],
			gtypeurl  = pageInfo[group].typeUrl,
			gpicnum  = pageInfo[group].picnum,
			gfrom    = pageInfo[group].from,
			gfromurl = pageInfo[group].fromUrl,
			gurl     = pageInfo[group].url,
			gdes     = slide.attr('data-des'),
			gpicw     = slide.attr('data-width'),
			gpich     = slide.attr('data-height'),
			gpicsize     = slide.attr('data-size');

		groupInfoCon.find('.page b').text(++gindex);
		groupInfoCon.find('.page span').text(gpicnum);
		groupInfoCon.find('.size1').text(gpicw+'x'+gpich);
		groupInfoCon.find('.size2').text(gpicsize);
		if(gfromurl != ""){
			groupInfoCon.find('.from').html('来源：<a href="'+gfromurl+'" target="_blank">'+gfrom+'</a>');
		}else{
			groupInfoCon.find('.from').html('来源：'+gfrom);
		}
		if(gdes != ""){
			groupInfoCon.find('.des span').text(gdes);
			groupInfoCon.find('.des').show();
		}else{
			groupInfoCon.find('.des').hide();
		}

		if(gfromurl != ""){
			groupInfoCon.find('h3').html('<a href="'+gfromurl+'" target="_blank">'+gtitle+'</a>');
		}else{
			groupInfoCon.find('h3').html(gtitle);
		}

		var image = new Image();
		image.src = large;
		image.onload = function(){
			var _width = image.width,
				_height = image.height,
				width = largeImg.width(),
				height = largeImg.height();
			var ratio = width / _width;
			ratioIn.val(parseInt(ratio * 100) + '%');
			largeImg.data({'width':_width,'height':_height,'ratio':ratio});

			var left = largeImg.position().left;
			var top = largeImg.position().top;

			$('.imgbox').removeClass('init');
			largeImg.css({'position':'absolute','left':left+'px','top':top+'px'})

			$('#bigimgbox').removeClass('bgload');
			changeRation();
		}

		setThumbLeft();

		// 更新分享链接和标题
		var shear = shearHtml.replace(/pageurl/g,gurl).replace(/pagetitle/g,gtitle).replace(/picurl/g,large);
		$('#shareList').html(shear);


		window.history.pushState({}, 0, gurl);
		document.title = gtitle;
		$("#typeObj").attr("href", gtypeurl).html(gtypename);

		//加载相关图片
		$.ajax({
			url: masterDomain+'/include/ajax.php?service=image&action=alist&orderby=3&typeid='+gtypeid,
			dataType: 'jsonp',
			success: function(data){
				if(data.state == 100){
					var list = data.info.list, aboutArr = [];
					for (var i = 0; i < list.length; i++) {
						aboutArr.push('<li><a href="'+list[i].url+'" title="'+list[i].title+'"><img src="'+huoniao.changeFileSize(list[i].litpic, "small")+'" onerror="this.url='+list[i].litpic+'" alt=""></a></li>');
					}
					$(".side_about ul").html(aboutArr.join(""));
				}
			}
		});

	})
	$('.listul li').eq(0).click();

	//上一张
	$('.large_prev').click(function(){
		var btn = $(this);
		if(btn.hasClass('disabled')) return;
		var sllide = $('.listul li.curr');
		var prev = sllide.prev();
		prev.click();
	})

	//下一张
	$('.large_next').click(function(){
		var sllide = $('.listul li.curr');
		var next = sllide.next();
		var nextLen = next.length;
		var havemore = true;

		if(nextLen == 0){
			while(!isload && havemore && nextLen == 0){
				getData(function(data){
					if(data && data.imglist.length > 0){
					}else{
						havemore = false;
					}
					next = sllide.next();
					nextLen = next.length;
					if(nextLen == 0){
						$(this).addClass('disabled');
					}else{
						next.click();
					}
				});
			}
		}else{
			if(nextLen == 0){
				$(this).addClass('disabled');
			}else{
				next.click();
			}
		}
	})

	//上一组
	$('.arrow-left').click(function(){
		var btn = $(this);
		if(btn.hasClass('disabled') || scrollWrap.is(':animated')) return;
		var showLen = _thumbNum;
		var nowstep = Math.abs(parseInt(scrollWrap.css('left')) / 95);
		if(nowstep < showLen){
			var step = 0;
		}else{
			var step = nowstep - showLen;
		}
		if(step == 0){
			btn.addClass('disabled');
		}
		scrollWrap.stop(true).animate({
			'left' : (-95*step) + 'px'
		},500,'easeInOutCirc',function(){
			$('.arrow-right').removeClass('disabled');
		})
	})

	//下一组
	$('.arrow-right').click(function(){
		var btn = $(this);
		if(btn.hasClass('disabled') || scrollWrap.is(':animated')) return;
		var showLen = _thumbNum;
		var nowstep = Math.abs(parseInt(scrollWrap.css('left'))) / 95;
		var maxStep = length - showLen;
		var havemore = true;
		while(!isload && havemore && (nowstep + showLen >= maxStep)){
			getData(function(data){
				if(data && data.imglist.length > 0){
					maxStep = length - showLen;
					$('.arrow-right').removeClass('disabled');
				}else{
					havemore = false;
				}
			});
		}
		if(nowstep + showLen > maxStep){
			var step = maxStep;
			btn.addClass('disabled');
		}else{
			var step = nowstep + showLen;
		}
		if(step >= maxStep){
			btn.addClass('disabled');
		}
		scrollWrap.stop(true).animate({
			'left' : (-95*step) + 'px'
		},500,'easeInOutCirc',function(){
			$('.arrow-left').removeClass('disabled');
		})
	})


	//拖动
	var dzshapan = "#bigimgbox", dzObj = $(dzshapan);
	var shapanImg = $("#dragbox");
	shapanImg.jqDrag({
		dragParent: dzshapan,
		dragHandle: "#zoomDiv"
	})


	function getData(callback){
		isload = true;
		$.ajax({
			url: masterDomain+'/include/ajax.php?service=image&action=nextData&id='+pageid,
			dataType: 'jsonp',
			success: function(data){

				if(data.state == 100){

					var info    = data.info,
						id      = info.id,
						typeid  = info.typeid,
						typeName = info.typeName,
						typeUrl = info.typeUrl,
						title   = info.title,
						url     = info.url,
						imglist = info.imglist,
						from    = info.source,
						fromUrl = info.sourceurl;

					pageid = id;

					length += imglist.length;

					var html = [];
					var lastGroup = parseInt($('.listul li').last().attr('data-group'));

					for(var i = 0; i < imglist.length; i++){
						html.push('<li data-group="'+(lastGroup+1)+'" data-index="'+i+'" data-des="'+imglist[i].info+'" data-width="'+imglist[i].pic_width+'" data-height="'+imglist[i].pic_height+'" data-size="'+imglist[i].pic_size+'"><img src="'+huoniao.changeFileSize(imglist[i].path, "small")+'" onerror="this.url='+imglist[i].path+'" data-large="'+imglist[i].path+'" alt=""></li>')
					}

					$('.listul').append(html.join("")).css('width', 95*length + 'px');

					var newGroup = {
						'id': id,
						'typeid': typeid,
						'typeName': typeName,
						'typeUrl': typeUrl,
						'title': title,
						'url': url,
						'picnum': imglist.length,
						'from': from,
						'fromUrl': fromUrl
					}
					pageInfo.push(newGroup);

					if(typeof callback == 'function'){
						callback(data.info);
					}

					setThumbWidth(true);

				}

				isload = false;

			},
			error: function(){
				isload = false;

				if(typeof callback == 'function'){
					callback(data.info);
				}
			}
		})
	}

})

//单点登录执行脚本
function ssoLogin(info){

	$("#navLoginBefore, #navLoginAfter").remove();
	//已登录
	if(info){
		$(".right-btn").prepend('<div class="login-after" id="navLoginAfter"><a href="'+info['userDomain']+'" target="_blank" class="mycollect">会员中心</a></div>');
		$.cookie(cookiePre+'login_user', info['uid'], {expires: 365, domain: channelDomain.replace("http://", ""), path: '/'});

	//未登录
	}else{
		$(".right-btn").prepend('<div class="login-before" id="navLoginBefore"><a href="'+masterDomain+'/login.html" class="login">登陆</a><span class="sep">|</span><a href="'+masterDomain+'/register.html" class="regist">注册</a></div>');
		$.cookie(cookiePre+'login_user', null, {expires: -10, domain: channelDomain.replace("http://", ""), path: '/'});

	}

}
