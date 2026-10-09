
$(function(){

	$('audio').removeAttr('controls');
	$(".emoji-hide").html(huoniao.appendEmoji());
	
  var amr_;
  $('body').delegate('.audio-panel', 'click', function(){
    var t = $(this);
    var init = t.find('audio');
	var aUrl = init.attr('src');
	if(amr_ && amr_.isInit()){
		amr_.stop();
	}
	amr_ = new BenzAMRRecorder();
	if(amr_.isPlaying()){   //是否正在播放
		t.removeClass('im-voicePlay');
		amr_.stop();
	}else{
		t.addClass('im-voicePlay');
		amr_.initWithUrl(aUrl).then(function() {  //重新初始化
		  amr_.play();
		});
	}
	amr_.onEnded(function(){
		t.removeClass('im-voicePlay');  //是否播放完成
	})
    return false;
  })

	//页码
	$('.tiezi-pages').html($('.pagination').html())
	//只看楼主定位
	$(document).scroll(function(){
    	var top =  $('.left-content').offset().top;
//  	var left =  $('.left-content').offset().left;
    	if($(document).scrollTop()>top){
//  		console.log($('.left-content').offset().top)
    		$('.tiezi-title').css({'top':'0','position':'fixed'})
    	}else{
    		$('.tiezi-title').css({'position':'relative'})
    	}

    });

	//banner广告图
	var swiper = new Swiper('.small_banner-box', {
      pagination: {
        el: '.small_banner-box .mypagination',
        clickable :true,
      },
      autoplay: {
      	delay:2000,
      	disableOnInteraction: false,
      },
      loop: true,
    });

    //收藏
	$(".store-btn").bind("click", function(){
		var t = $(this), type = "add", oper = "+1", txt = "已收藏";

		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}

		if(!t.hasClass("curr")){
			t.addClass("curr");
		}else{
			type = "del";
			t.removeClass("curr");
			oper = "-1";
			txt = "收藏";
		}

		var $i = $("<b>").text(oper);
		var x = t.offset().left, y = t.offset().top;
		$i.css({top: y - 10, left: x + 17, position: "absolute", "z-index": "10000", color: "#E94F06"});
		$("body").append($i);
		$i.animate({top: y - 50, opacity: 0, "font-size": "2em"}, 800, function(){
			$i.remove();
		});

		t.children('button').html("<em></em><i></i>"+txt);

		$.post("/include/ajax.php?service=member&action=collect&module=tieba&temp=detail&type="+type+"&id="+id);

	});

    //点击评论楼主
    $('.li_comment,.floor-top .ping_btn ,.comment-btn').click(function(){
    	var h1= $(document).height,h2=$(window).height()
    	$("html,body").animate({scrollTop:($(document).height())},500);
    })

    //回复框收放
    $('body').delegate('.floor-members .floor-info ul li.ping_btn','click',function(){
    	var t = $(this), parent = t.closest('.floor-content'), box = parent.find('.reply-text-box');

//		如果没有回复，查看回复则显示回复框
		if($(this).parents(".floor-members").attr("data-reply") == 0){
			var emoji = $('.emoji-hide').html();
	    	$('.emoje-box').html(emoji);
	    	$(this).parents('.floor-content').find('.textarea-box').slideDown(300);
	    	$('.mytextarea').focus();
		}
		$(this).hide().siblings('.reply_shou').show();
		box.slideDown(300);

    });
    $('body').delegate('.floor-members .floor-info ul li.reply_shou','click',function(){
    	var t = $(this), parent = t.closest('.floor-content'), box = parent.find('.reply-text-box');
    	parent.find('.textarea-box').slideUp(300);
    	box.slideUp(300);
    	$(this).hide().siblings('.ping_btn').show();


    });
    $('.floor-members').each(function(){
    	var t = $(this), replyMore = t.find(".reply-text-box"), rid = Number(t.data("id")), reply = Number(t.data("reply"));
		if(id && reply){
			getReply(replyMore, rid, 1);
		}
	})

	//举报
	var complain = null;
	$(".inform_btn").bind("click", function(){

		var domainUrl = channelDomain.replace(masterDomain, "").indexOf("http") > -1 ? channelDomain : masterDomain;
		var commonid = $(this).attr('data-id');
		commonid = commonid=='' ? 0 : commonid;
		complain = $.dialog({
			fixed: true,
			title: "帖子举报",
			content: 'url:'+domainUrl+'/complain-tieba-detail-'+id+'.html?commonid=' + commonid,
			width: 500,
			height: 300
		});
	});

	//点赞
	//$('.zan_btn').click(function(){
	$('.floor-box').delegate(".zan_btn", "click", function () {
		var userid = $.cookie(cookiePre+"login_user");
	    if(userid == null || userid == ""){
	      location.href = masterDomain + '/login.html';
	      return false;
	    }
		var flag = $(this).children('a').hasClass('color_btn');
		var t = $(this);
    	if(flag){
    		$(this).children('a').toggleClass('userclick');
    	}else{
			var commonid = $(this).attr('data-id');
			if(commonid){
				var num = $(this).children('a').children('span').html(), id = t.attr("data-id");
				if(isNaN(num)){//不是数字
					num = 0;
				}
				num++;
				var type = '';
				if(t.hasClass('active')){
					type = 'del';
				}else{
					type = 'add';
				}
				if (id != "" && id != undefined) {
					$.ajax({
						url: "/include/ajax.php?service=member&action=dingComment&id=" + id + "&type=" + type,
						type: "GET",
						dataType: "json",
						success: function (data) {
							if(data.state==100){
								if(type=='add'){
									t.addClass("active");
									t.children('a').children('span').html(num)
								}else{
									t.removeClass("active");
									if(num-2==0){
										t.children('a').children('span').html('点赞');
									}else{
										t.children('a').children('span').html(num-2);
									}
								}
							}
						}
					});
				}
			}else{
				var num = $('#zannum').html();
				if(isNaN($('#zannum').html())){//不是数字
					num = 0;
				}
				num++;
				if(t.hasClass('active')){
					t.removeClass("active");
					$('.li_zan').removeClass("active");
					$('#photo' + currentid).remove();
					upLike(function(){
						if(num-2==0){
							$('#zannum').html('点赞');
							$('.zan_headicon').hide();
						}else{
							var numnew = num - 2;
							$('#zannum').html(numnew);
							$('.label-zan').html('<p><i></i>'+numnew+'</p>')
						}
					});
				}else{
					var photo = (currentPhoto == "" || currentPhoto == undefined) ? staticPath+'images/noPhoto_100.jpg' : currentPhoto;
					$('.label-zan').before('<dd id="photo'+currentid+'"><img src="'+photo+'" /></dd>');
					$('.label-zan').html('<p><i></i>'+num+'</p>')
					$('.zan_headicon').show();
					t.addClass("active");
					$('.li_zan').addClass("active");
					upLike(function(){
						$('#zannum').html(num);
					});
				}
			}
		}
	})



	var upLike = function(func){
	    $.post("/include/ajax.php?service=member&action=getZan&module=tieba&temp=detail&title="+zanTitle+"&id="+id+"&uid="+louzuid, function(data){
            if(data.state == 100){
		        func();
            }else{
                alert(data.info);
            }
	    },"json");
    }

	if($('#upList').val()>0){
		$('#zannum').html($('#upList').val());
		$('.mylabel').show();
		$('.label-zan').html('<p><i></i>'+$('#upList').val()+'</p>')
	}


    //获取回复列表
function getReply(replyMore, rid, page){
	replyMore.html("<div class='loading'><i></i>加载中...</div>");
	$.ajax({
		url: masterDomain+"/include/ajax.php?service=member&action=getChildComment&sid="+rid+"&page="+page+"&pageSize="+replyPageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state == 100){

				var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
				for(var i = 0; i < list.length; i++){
					var src = staticPath+'images/noPhoto_100.jpg';
					if(list[i].user.photo){
						src = huoniao.changeFileSize(list[i].user.photo, "middle");
					}
					html.push('<li><div class="head_img"><img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';" src="'+src+'"  /></div><div class="reply-text"><div class="reply-info"><p class="reply-user"><span>'+list[i].user.nickname+'</span>：</p><p class="reply_time"><span>'+huoniao.transTimes(list[i].dtime, 1)+(list[i].iphome ? ' · ' + list[i].iphome : '')+'</span> <span class="reply_btn">回复</span></p></div><div class="reply-p">'+list[i].content+'</div></div></li>')


				}
				replyMore.html('<ul>'+html.join("")+'</ul>');
				replyMore.append('<div class="reply-action page "><p class="reply-me"><i></i>我也说一句</p></div>');

				if(pageInfo.totalPage > 1){
					showReplyPage(pageInfo, replyMore, rid);
				}

			}
		}
	});
}

  //打印回复分页
function showReplyPage(pageInfo, replyMore, rid){

	var info = replyMore.find(".page");
	var nowPageNum = Number(pageInfo.page);
	var allPageNum = Math.ceil(Number(pageInfo.totalCount)/Number(pageInfo.pageSize));
	var pageArr = [];

	var pages = document.createElement("div");
	pages.className = "pagination-pages";
	info.prepend(pages);

	//拼接所有分页
	if (allPageNum > 1) {

		//上一页
		if (nowPageNum > 1) {
			var prev = document.createElement("a");
			prev.className = "prev";
			prev.innerHTML = '上一页<i></i>';
			prev.onclick = function () {
				atpage = nowPageNum - 1;
				getReply(replyMore, rid, atpage);
			}
		}
		info.find(".pagination-pages").append(prev);

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
					page.onclick = function () {
						atpage = Number($(this).text());
						getReply(replyMore, rid, atpage);
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
					page.onclick = function () {
						atpage = Number($(this).text());
						getReply(replyMore, rid, atpage);
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
							page.onclick = function () {
								atpage = Number($(this).text());
								getReply(replyMore, rid, atpage);
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
					page.onclick = function () {
						atpage = Number($(this).text());
						getReply(replyMore, rid, atpage);
					}
					info.find(".pagination-pages").append(page);
				}
			}
		}

		//下一页
		if (nowPageNum < allPageNum) {
			var next = document.createElement("a");
			next.className = "next";
			next.innerHTML = '下一页<i></i>';
			next.onclick = function () {
				atpage = nowPageNum + 1;
				getReply(replyMore, rid, atpage);
			}
		}
		info.find(".pagination-pages").append(next);

		info.show();

	}else{
		info.hide();
	}

}
 	var emoji = $('.emoji-hide').html();
	$('.emoje-box').html(emoji);
    $('body').delegate('.floor-content .reply-me','click',function(){

    	$(this).parents('.F_content').find('.textarea-box').slideToggle(300).find('.mytextarea').text('').focus();

    })
    //回复别人
    $('.reply-text-box').delegate('.reply_btn','click',function(){
    	var name = $(this).parents('.reply_time').siblings('.reply-user').find('span').text();
    	var textareabox = $(this).parents('.F_content').find('.textarea-box')
		if(name == (textareabox.find('.mytextarea label span').text())){
			textareabox.slideToggle(300);
		}else{
			textareabox.slideDown(300);
		}
    	textareabox.find('.mytextarea').html('<label contenteditable="false" >回复     <span>'+name+'</span>：<label>&nbsp;');
		var a = textareabox.offset().top;
		if ( a > ($(window).scrollTop() + $(window).height())) {
            $("html,body").animate({scrollTop:($(this).parents('.reply-text').offset().top)},500);
         }
		set_focus(textareabox.find('.mytextarea'));
		textareabox.find('.mytextarea').focus()
    })
	$('.textarea-box').delegate('.subbtn','click',function(){
//		alert('111');
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}
		
		var t = $(this), par = t.closest(".floor-members"), rid = par.data("id");
		$(".mytextarea img").each(function(){
			var img = $(this),txt= img.attr('data-txt');
				img.after('<em>'+txt+'</em>');
				img.remove()
		})
		var content = par.find(".mytextarea").html();

			t.addClass("disabled");

			if(rid == '' || rid == undefined){
				var url = '/include/ajax.php?service=member&action=sendComment&check=1&type=tieba-detail&aid=' + id;
			}else{
				var url = '/include/ajax.php?service=member&action=replyComment&check=1&id=' + rid;
			}

			$.ajax({
				url: url,
				data: "content="+encodeURIComponent(content),
				type: "POST",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){

						var info = data.info;
						$(".textarea-box").hide();

						var html = '<li><div class="head_img"><img onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';" src="'+info.userinfo.photo+'" /></div><div class="reply-text"><div class="reply-info"><p class="reply-user"><span>'+info.userinfo.nickname+'</span></p><p class="reply_time"><span>'+huoniao.transTimes(info.dtime, 1)+(info.iphome ? ' · ' + info.iphome : '')+'</span> <span class="reply_btn">回复</span></p></div><div class="reply-p">'+info.content+'</div></div></li>';
						if(par.find(".reply-text-box ul").length == 0){
							par.find(".reply-text-box").html('<ul>'+html+'</ul><div class="reply-action page "><p class="reply-me"><i></i>我也说一句</p></div>');
						}else{
							par.find(".reply-text-box ul").append(html);
						}
						$(".reply-text-box").show();
						t.removeClass("disabled");
					}else{
						alert(data.info);
						t.removeClass("disabled");
					}
				},
				error: function(){
					alert("网络错误，发表失败，请稍候重试！");
					t.removeClass("disabled");
				}
			});
//
	});

    //点赞爱心动态-----效果
    $('body').delegate('.li_zan','click',function(){
		var userid = $.cookie(cookiePre+"login_user");
	    if(userid == null || userid == ""){
	      location.href = masterDomain + '/login.html';
	      return false;
		}

    	$(this).find('i').animate({top: '-15px',right:'5px',opacity:0,'width':'32px','height':'30px'},800,function(){
    		$(this).find('i').remove();
    	});
		$(this).append('<i></i>')

		var t = $(this);
		var num = $('#zannum').html();
		if(isNaN($('#zannum').html())){//不是数字
			num = 0;
		}
		num++;
		if(t.hasClass('active')){
			t.removeClass("active");
			$('.floor-top .zan_btn').removeClass("active");
			$('#photo' + currentid).remove();
			upLike(function(){
				if(num-2==0){
					$('#zannum').html('点赞');
					$('.zan_headicon').hide();
				}else{
					var numn = num - 2;
					$('.label-zan').html('<p><i></i>'+numn+'</p>')
					$('#zannum').html(numn);
				}
			});
		}else{
			var photo = (currentPhoto == "" || currentPhoto == undefined) ? staticPath+'images/noPhoto_100.jpg' : currentPhoto;
			$('.label-zan').before('<dd id="photo'+currentid+'"><img src="'+photo+'" /></dd>');
			$('.label-zan').html('<p><i></i>'+num+'</p>')
			$('.zan_headicon').show();
			t.addClass("active");
			$('.floor-top .zan_btn').addClass("active");
			upLike(function(){
				$('#zannum').html(num);
			});
		}

    })



    var memerySelection
    $('body').delegate('.emoje-box li a','click',function(){
    	memerySelection = window.getSelection();
    	var Imgsrc = $(this).children('img').attr('src') ;
		var txt = $(this).parents('li').attr('data-txt');
    	var textarea = $(this).parents('.textarea-box').find('.mytextarea')
//  	$(this).parents('.textarea-box').find('.mytextarea').append('<img src="'+Imgsrc+'"/>');

    	textarea.focus()
		pasteHtmlAtCaret('<img data-txt="'+txt+'" src="'+Imgsrc+'" />');
    });
    //根据光标位置插入指定内容
	function pasteHtmlAtCaret(html) {
      var sel, range;
      if (window.getSelection) {
          sel = memerySelection;
          if (sel.getRangeAt && sel.rangeCount) {
              range = sel.getRangeAt(0);
              range.deleteContents();
              var el = document.createElement("div");
              el.innerHTML = html;
              var frag = document.createDocumentFragment(), node, lastNode;
              while ( (node = el.firstChild) ) {
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
	function set_focus(el){
		el=el[0];
		el.focus();
		if($.browser.msie){
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
		}else{
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	}

	var follow = function(t, func){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain + '/login.html';
			return false;
		}

		if(t.hasClass("disabled")) return false;
		t.addClass("disabled");
		$.post("/include/ajax.php?service=member&action=followMember&id="+t.data("id"), function(){
			t.removeClass("disabled");
			func();
		});
	}

	// 顶部个人关注按钮
	$('.attion').click(function(){
		var x = $(this);
		if (x.hasClass('attioned')) {
			follow(x, function(){
				x.removeClass('attioned').html('<em>+</em><span>'+langData['siteConfig'][19][846]+'</span>');
			});
		}else{
			follow(x, function(){
				x.addClass('attioned').html(langData['siteConfig'][19][845]);
			});
		}
	})

	//HTML枨式化
	function clearHtml(e){
		e.preventDefault();
		var text = null;

		if(window.clipboardData && clipboardData.setData) {
			// IE
			text = window.clipboardData.getData('text');
		} else {
			text = (e.originalEvent || e).clipboardData.getData('text/plain') || prompt('在这里输入文本');
		}
		if (document.body.createTextRange) {
			if (document.selection) {
				textRange = document.selection.createRange();
			} else if (window.getSelection) {
				sel = window.getSelection();
				var range = sel.getRangeAt(0);

				// 创建临时元素，使得TextRange可以移动到正确的位置
				var tempEl = document.createElement("span");
				tempEl.innerHTML = "&#FEFF;";
				range.deleteContents();
				range.insertNode(tempEl);
				textRange = document.body.createTextRange();
				textRange.moveToElementText(tempEl);
				tempEl.parentNode.removeChild(tempEl);
			}
			textRange.text = text;
			textRange.collapse(false);
			textRange.select();
		} else {
			// Chrome之类浏览器
			document.execCommand("insertText", false, text);
		}
	}

    // 打赏金额
	$('.rewardS-pay-select li').click(function(){
		var t = $(this), li = t.text(), num = parseInt(li);
		$('.rewardS-pay-box .rewardS-pay-money .inp').focus().val(num);
	})

	// 打赏金额验证
	var rewardInput = $('.rewardS-pay-box .rewardS-pay-money .inp');
	rewardInput.blur(function(){
		var t = $(this), val = t.val();

		var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
		var re = new RegExp(regu);
		if (!re.test(val)) {
			t.val(0);
		}
	})

	// 支付方式
	$('.rewardS-pay-way ul li').click(function(){
		$(this).addClass('on').siblings('li').removeClass('on');
	})

	//打开
	$('.li_shang').click(function(){
		var t = $(this);
		if(t.hasClass("loading")) return;
		t.addClass("loading");

		//验证文章状态
		$.ajax({
			"url": masterDomain + "/include/ajax.php?service=tieba&action=checkRewardState",
			"data": {"aid": id},
			"dataType": "jsonp",
			success: function(data){
				t.removeClass("loading");
				if(data && data.state == 100){
					$("#ds_page .dsMask,#ds_page .dsPop").show();
					rewardInput.focus().val(rewardInput.val());
				}else{
					alert(data.info);
				}
			},
			error: function(){
				t.removeClass("loading");
				alert("网络错误，操作失败，请稍候重试！");
			}
		});
	})

	//关闭
	$('.rewardS-pay-tit .close').click(function(){
		$('.rewardS-pay').hide(); $('.rewardS-mask').hide();
	})

	//立即支付
	$('.rewardS-pay .rewardS-sumbit a').bind("click", function(event){
		var t = $(this);
		var amount = rewardInput.val();
		var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
		var re = new RegExp(regu);
		if (!re.test(amount)) {
			event.preventDefault();
			alert("打赏金额格式错误，最少0.01"+echoCurrency('symbol')+"！");
		}

		var paytype = $(".rewardS-pay-way .on").data("type");
		if(paytype == "" || paytype == undefined || paytype == null){
			event.preventDefault();
			alert("请选择支付方式！");
		}

		var url = t.data("url").replace("$amount", amount).replace("$paytype", paytype);
		t.attr("href", url);
		$('.rewardS-pay-tit .close').click();

	})


	// 查看更多打赏列表
	$(".rewardS-support .num").click(function(){
		var num = parseInt($(this).find("font").text());
		if (num > 10) {
			$(".pop_main_box, .rewardS-mask").show();
		}
	})

	// 关闭打赏列表
	$(".pop-close").click(function(){
		$(".pop_main_box, .rewardS-mask").hide();
	})

	pageInfo();

	// 打赏分页
	function pageInfo(){

		var pageSize = 10, total = Math.ceil($(".gratuity_list li").length / pageSize);
		var current = 1, pageHtml = [];
		$(".gratuity_list li:lt("+pageSize+")").show();

		// 打印页数
		pageHtml.push('<li id="btnPrev" class="btn disabled always">上一页</li>');
		for (var i = 0; i < total; i++) {
			if (i == 0) {
				pageHtml.push('<li data-id="'+(i+1)+'" class="always"><a href="javascript:;" class="pageCurrent">'+(i+1)+'</a></li>');
				pageHtml.push('<li class="prevdot"><span>...</span></li>');
			}else if (i == total - 1) {
				pageHtml.push('<li class="nextdot"><span>...</span></li>');
				pageHtml.push('<li data-id="'+(i+1)+'" class="always"><a href="javascript:;">'+(i+1)+'</a></li>');
			}else {
				pageHtml.push('<li data-id="'+(i+1)+'"><a href="javascript:;">'+(i+1)+'</a></li>');
			}
		}
		pageHtml.push('<li id="btnNext" class="btn always">下一页</li>');
		if (total > 1) {
			$("#page-list-content .rwPage").html(pageHtml.join(""));
		}

		pagedot();

		// 上一页
		$("#btnPrev").click( function() {
				var t = $(this);
				if (t.hasClass("disabled")) return;

				$("#btnNext").removeClass("disabled");
				var cur = $('.rwPage .pageCurrent'), li = cur.parent("li");
				cur.removeClass("pageCurrent");
				$(".rwPage li[data-id="+(current - 1)+"]").find('a').addClass("pageCurrent");

				current -= 1;
				var indexStart = (current - 1) * pageSize, indexEnd = indexStart + pageSize - 1;
				$(".gratuity_list li").show();
				$(".gratuity_list li:lt(" + indexStart + "), .gratuity_list li:gt(" + indexEnd + ")").hide();

				if (current == 1) t.addClass("disabled");
				pagedot();
		});

		// 下一页
		$("#btnNext").click( function() {

			var t = $(this);
			if (t.hasClass("disabled")) return;

			$("#btnPrev").removeClass("disabled");
			var cur = $('.rwPage .pageCurrent'), li = cur.parent("li");
			cur.removeClass("pageCurrent");
			$(".rwPage li[data-id="+(current + 1)+"]").find('a').addClass("pageCurrent");


			current += 1;
			$(".gratuity_list li").show();
			var indexStart = (current - 1) * pageSize,
					indexEnd = current * pageSize - 1 > $(".gratuity_list li").length - 1 ? $(".gratuity_list li").length - 1 : current * pageSize - 1;
			$(".gratuity_list li:lt(" + indexStart + "), .gratuity_list li:gt(" + indexEnd +")").hide();
			if (current == total) t.addClass("disabled");
			pagedot();
		});

		// 点击页数
		$('.rwPage li').click(function(){
			var t = $(this);
			if (t.hasClass("btn")) return;

			current = parseInt(t.attr("data-id"));
			$('.rwPage .pageCurrent').removeClass("pageCurrent");
			$(".rwPage li[data-id="+current+"]").find('a').addClass("pageCurrent");

			var indexStart = (current - 1) * pageSize, indexEnd = indexStart + pageSize - 1;
			$(".gratuity_list li").show();
			$(".gratuity_list li:lt(" + indexStart + "), .gratuity_list li:gt(" + indexEnd + ")").hide();

			if (current == 1) {
				$("#btnPrev").addClass("disabled");
			}else {
				$("#btnPrev").removeClass("disabled");
			}
			if (current == total) {
				$("#btnNext").addClass("disabled");
			}else {
				$("#btnNext").removeClass("disabled");
			}

			pagedot();

		})

		function pagedot(){

			if (total < 6) {
				$(".nextdot, .prevdot").hide();
			}else {

				if (current > 3) {
					$('.prevdot').show();
					$(".rwPage li").show();
					$(".rwPage li:lt(" + current + ")").hide();


					if (current > (total - 3)) {
						$(".rwPage li:gt(" + (total - 3) + ")").show();
						$('.nextdot').hide();
					}else {
						$(".rwPage li:gt(" + (current + 2) + ")").hide();
						$('.nextdot').show();
					}
					$(".prevdot").show();

				}else {
					$(".rwPage li").show();
					$('.prevdot').hide();
					$(".rwPage li:gt(5)").hide();
					$('.nextdot').show();

				}

				$(".always").show();

			}
		}

	}

})
