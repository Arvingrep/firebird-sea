var URL = location.href;
var URLArrary = URL.split('#')[1];

function transTimes(timestamp, n){
	
    const dateFormatter = huoniao.dateFormatter(timestamp);
    const year = dateFormatter.year;
    const month = dateFormatter.month;
    const day = dateFormatter.day;
    const hour = dateFormatter.hour;
    const minute = dateFormatter.minute;
    const second = dateFormatter.second;
    
	if(n == 1){
		return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
	}else if(n == 2){
		return (year+'-'+month+'-'+day);
	}else if(n == 3){
		return (month+'-'+day);
	}else if(n == 4){
		return (hour+':'+minute);
	}else if(n == 5){
		return (month+'-'+day+' '+hour+':'+minute+':'+second);
	}else{
		return 0;
	}
}

$(function(){

	if (URLArrary != undefined) {
		$('.nav_box li[data-action='+URLArrary+']').addClass('nav_bc').siblings('li').removeClass('nav_bc');
		$('.'+URLArrary+'_box').show().siblings('.main_box').removeClass('nav_bc');
	}else {
		$('.nav_box li').eq(0).addClass('nav_bc').siblings('li').removeClass('nav_bc');
		$('.main_box').eq(0).show().siblings('.main_box').removeClass('nav_bc');
	}

	// 初始加载数据
	if (typeof(atpage) != "undefined") {
		getList();
	}

	//获取服务器当前时间
	$.ajax({
		"url": masterDomain+"/include/ajax.php?service=system&action=getSysTime",
		"dataType": "jsonp",
		"success": function(data){
			if(data){
				nowStamp = data.now;
			}
		}
	});

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

  // 房产tab切换
  $('.house_nav ul li').click(function(){
    var x = $(this), index = x.index();
    x.addClass('HN_bc').siblings().removeClass('HN_bc');
		atpage = 1;
		getList();
  })

  // 粉丝关注按钮
  $('.fans_list ul li .attention').click(function(){
    var x = $(this);
    if (x.hasClass('guanzhu_btn')) {
			follow(x, function(){
				x.removeClass('guanzhu_btn').text(langData['siteConfig'][19][846]);  //关注
			});
    }else{
			follow(x, function(){
				x.addClass('guanzhu_btn').text(langData['siteConfig'][19][845]);  //已关注
			});

    }
  })
	// 留言板评论展开
	$('body').delegate('.reply_btn i', "click", function(){
		var x = $(this),
			find = x.closest('.reply').find('.comment_box');
		if (find.css("display") == "block") {
			find.hide();
		}else{
			find.show();
		}
		var name = x.closest(".message_txt").find(".mes_first .name").text();
		find.find(".textarea").attr("placeholder", langData['siteConfig'][6][29]+"：" + name).focus();  //回复
	})
	var commonChange = function(t){
		var val = t.text(), maxLength = 200;
		var charLength = val.replace(/<[^>]*>|\s/g, "").replace(/&\w{2,4};/g, "a").length;
		var imglength = t.find('img').length;
		var alllength = charLength + imglength;
		var surp = maxLength - charLength - imglength;
		surp = surp <= 0 ? 0 : surp;

		t.closest('.write').find('em').text(surp);

		if(alllength > maxLength){
			t.text(val.substring(0,maxLength));
			return false;
		}
    if(alllength > 0){
      t.closest('.comment_box').find('.com_btn').css('background','#34bdf6')
    }else{
      t.closest('.comment_box').find('.com_btn').css('background','#d4d4d4')
    }
	}
	$('body').delegate('.txt', "keyup", function(){
		memerySelection = window.getSelection();
		commonChange($(this));
	})

	// 表情盒子打开关闭
  var memerySelection;
	$('body').delegate('.editor', "click", function(){
		var x = $(this),
			find = x.closest('.comment_foot').find('.face_box');
		if (find.css("display") == "block") {
			find.hide();
			x.removeClass('ed_bc');
		}else{
	    memerySelection = window.getSelection();
			find.show();
			x.addClass('ed_bc');
			return false;
		}
	})

	// 选择表情
	$('body').delegate('.face_box ul li', "click", function(){
    var t = $(this).find('img'), textarea = t.closest('.comment_box').find('.textarea'), hfTextObj = textarea;
    hfTextObj.focus();
    pasteHtmlAtCaret('<img src="'+t.attr("src")+'" />');
		commonChange(textarea);
		t.closest(".face_box").hide();
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

	//评论
	var page = 1, pageSize = 10, totalPage = 1;
	var loadmore = $("#leave_message .load_more");

	//表情
	var emot = [];
	for (var i = 1; i < 51; i++) {
		var fi = i < 10 ? "0" + i : i;
		emot.push('<li><a href="javascript:;"><img src="/static/images/ui/emot/baidu/i_f'+fi+'.png" /></a></li>');
	}

	if($("#leave_message").size() > 0){
		getMessage();

		//查看更多
		loadmore.bind("click", function(){
			var t = $(this);
			if(t.hasClass("disabled")) return false;
			if(page > totalPage){
				t.hide();
				return false;
			}
			t.addClass("disabled");
			t.html('<img src="/static/images/loadgray.gif" />');
			getMessage();
		});
	}

	//加载留言
	function getMessage(){
		$.ajax({
			url: "/include/ajax.php?service=member&action=messageList&uid="+uid+"&page="+page+"&pageSize="+pageSize,
			type: "GET",
			async: false,
			dataType: "jsonp",
			success: function (data) {
				loadmore.removeClass("disabled").html(langData['siteConfig'][6][148]);  //查看更多留言
				if(data && data.state == 100){
					var list = data.info.list, pageInfo = data.info.pageInfo;

					totalPage = pageInfo.totalPage;

					//拼接留言列表
					var html = [];
					for(var i = 0; i < list.length; i++){
						html.push('<div class="message_txt" data-id="'+list[i].id+'">');
						html.push('<div class="mes_first">');
						html.push('<div class="mes_pic"><a href="'+masterDomain+'/user/'+list[i].uid+'" target="_blank" title="'+list[i].nickname+'"><img src="'+list[i].photo+'" onerror="this.src=\'/static/images/noPhoto_60.jpg\'" alt="'+list[i].nickname+'"></a></div>');
						html.push('<div class="com_infor">');
						html.push('<div class="com_per fn-clear">');
						html.push('<div class="name"><a href="'+masterDomain+'/user/'+list[i].uid+'" target="_blank" title="'+list[i].nickname+'">'+list[i].nickname+'</a></div>');
						html.push('<div class="time">'+list[i].date+'</div>');
						html.push('</div>');
						html.push('<div class="connect">');
						html.push(list[i].content);
						html.push('</div>');

						html.push('</div>');
						html.push('</div>');

						if(list[i].reply){
							html.push('<div class="reply_txt">');
							html.push('<i></i>');
							html.push('<p><a href="'+masterDomain+'/user/'+list[i].reply.uid+'" target="_blank" title="'+list[i].reply.nickname+'">'+list[i].reply.nickname+'</a></p>');
							html.push('<span>'+list[i].reply.content+'</span>');
							html.push('</div>');
						}

						html.push('<div class="reply">');
						html.push('<div class="reply_btn fn-clear">');
						html.push('<i></i>');
						html.push('</div>');
						html.push('<div class="comment_box">');
						html.push('<div class="write">');
						html.push('<div class="textarea txt" contenteditable="true" ></div>');
						html.push('<em>200</em>');
						html.push('</div>');
						html.push('<div class="comment_foot fn-clear">');
						html.push('<div class="editor_btn"><input type="button" class="editor"></div>');
						html.push('<div class="com_btn">'+langData['siteConfig'][6][29]+'</div>');  //回复
						html.push('<div class="face_box ">');
						html.push('<i></i>');
						html.push('<ul>');
						html.push(emot.join(""));
						html.push('</ul>');
						html.push('</div>');
						html.push('</div>');
						html.push('</div>');
						html.push('</div>');

						html.push('</div>');
					}

					loadmore.before(html.join(""));

					//如果已经到最后一页了，移除更多按钮
					if(page == pageInfo.totalPage){
						loadmore.remove();
					}else{
						page++;
					}

				}else{
					loadmore.remove();
					if(page == 1){
						$("#leave_message .messages_box").html('<div class="empty">'+langData['siteConfig'][20][387]+'</div>');  //暂无留言！
					}
				}
			},
			error: function(){
				alert(langData['siteConfig'][19][388]);  //打赏总人数
				loadmore.removeClass("disabled").html(langData['siteConfig'][6][148]);  //查看更多留言
			}
		});
	}

	//发表留言
	$('body').delegate('.com_btn', "click", function(){
		var t = $(this), txt = t.text();
		if(t.hasClass("disabled")) return false;

		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain + '/login.html';
			return false;
		}

		var content = t.closest('.comment_box').find('.textarea').html();
		if($.trim(content) == ""){
			alert(langData['siteConfig'][20][385]);  //请填写留言内容！
			return false;
		}

		var rid = 0;
		if(txt == langData['siteConfig'][6][29]){  //回复
			rid = t.closest('.message_txt').attr("data-id");
		}

		t.addClass("disabled").html(langData['siteConfig'][6][35]+"..");  //提交中

		$.ajax({
			url: "/include/ajax.php?service=member&action=sendMessage&uid="+uid,
			type: "POST",
			data: {content: content, rid: rid},
			async: false,
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					location.reload();
				}else{
					t.removeClass("disabled").html(txt);
					alert(data.info);
				}
			},
			error: function(){
				t.removeClass("disabled").html(txt);
				alert(langData['siteConfig'][20][386]);  //账户余额
			}
		});

	});

	// 左侧导航切换
	$('.nav_box li').click(function(){
		var t = $(this), action = t.attr('data-action');
		t.addClass('nav_bc').siblings('li').removeClass('nav_bc');
		$('.'+action+'_box').show().siblings().hide();
		atpage = 1;
		getList();
	})

  //绑定所有分享按钮所在A标签的鼠标移入事件，从而获取动态ID
	$(".main_right").delegate(".bdsharebuttonbox", "hover", function(){
		var t = $(this);
		Shareurl = t.attr("data-url");
		Sharelitpic = t.attr("data-litpic");
		Sharetitle = t.attr("data-title");
		window._bd_share_config.share.bdUrl= Shareurl;
		window._bd_share_config.share.bdText= Sharetitle;
		window._bd_share_config.share.bdPic= Sharelitpic;
	});


})

// 异步获取列表
function getList(){

	var active = $('.nav_box .nav_bc'), action = active.attr('data-action'), url, curr, mainBox;

	if (action == "article") {
		url = masterDomain + "/include/ajax.php?service=article&action=alist&uid="+uid+"&group_img=1&page=" + atpage + "&pageSize="+pageSize;
		mainBox = 'article_box';
	}else if (action == "huodong") {
		url = masterDomain + "/include/ajax.php?service=huodong&action=hlist&uid="+uid+"&page=" + atpage + "&pageSize="+pageSize;
		mainBox = 'huodong_box';
	}else if (action == "tieba") {
		url = masterDomain + "/include/ajax.php?service=tieba&action=tlist&uid="+uid+"&page=" + atpage + "&pageSize="+pageSize;
		mainBox = 'tieba_box';
	}else if (action == "info") {
		url = masterDomain + "/include/ajax.php?service=info&action=ilist&uid="+uid+"&page=" + atpage + "&pageSize="+pageSize;
		mainBox = 'info_box';
	}else if (action == "house") {
		curr = $('.house_nav .HN_bc').attr('data-action');
		url = masterDomain + "/include/ajax.php?service=house&action="+curr+"&uid="+uid+"&page=" + atpage + "&pageSize="+pageSize;
		if (curr == 'zuList') {
			url = masterDomain + "/include/ajax.php?service=house&action="+curr+"&uid="+uid+"&page=" + atpage + "&pageSize="+pageSize;
		}
		mainBox = 'house_list';
	}else if(action == 'live'){
		url = masterDomain + "/include/ajax.php?service=live&action=alive&uid="+uid+"&page=" + atpage + "&pageSize="+pageSize;
		mainBox = 'live_box';
	}

	$('.'+mainBox).html('<div class="loading">'+langData['siteConfig'][20][184]+'...</div>');  //加载中，请稍后

	loadMoreLock = true;

	$.ajax({
		url: url,
		type: "GET",
		dataType: "jsonp",
		success: function(data){
			if (data && data.state != 200) {
				if (data.state == 101) {
					$('.loading').html(langData['siteConfig'][21][64]);  //暂无数据！
				}else {
					var list = data.info.list, articleHtml = [], huodongHtml = [], tiebaHtml = [], houseHtml = [], infoHtml = [] ,liveHtml = [];
					var totalPage = data.info.pageInfo.totalPage;
					totalCount = data.info.pageInfo.totalCount;
					for (var i = 0; i < list.length; i++) {
						// 资讯模块
						if (action == "article") {

							// 如果是图集
							if(list[i].group_img){
								articleHtml.push('<div class="news_detail">');
								articleHtml.push('<div class="news_lead fn-clear">');
								articleHtml.push('<div class="news_title"><a href="' + list[i].url + '" target="_blank">' + list[i].title + '</a></div>');
								articleHtml.push('<div class="news_tips"><i></i>'+list[i].typeName[0]+'</div>');
								articleHtml.push('</div>');
								articleHtml.push('<ul class="fn-clear">');
								var n = 0;
								for (var g = 0; g < list[i].group_img.length; g++) {
									var src = huoniao.changeFileSize(list[i].group_img[g].path, "small");
									if(src && n < 3) {
										articleHtml.push('<li><a href="' + list[i].url + '" target="_blank"><img src="' + src + '" alt=""></a></li>');
										n++;
										if(n == 3) break;
									}
								}
								articleHtml.push('</ul>');
								articleHtml.push('<div class="news_foot fn-clear">');
								articleHtml.push('<em>' + transTimes(list[i].pubdate,3) + '</em>');
								articleHtml.push('<div class="com"><a href="' + list[i].url + '" target="_blank">' + list[i].common + '</a></div>');
								articleHtml.push('<div class="share_btn">');
								articleHtml.push('<div class="share_box">');
								articleHtml.push('<div class="bdsharebuttonbox" data-url="'+list[i].url+'" data-litpic="'+list[i].group_img[0].path+'" data-title="'+list[i].title+'"><div class="Share_QQ Share"><a href="#"class="bds_sqq"data-cmd="sqq"title="'+langData['siteConfig'][23][119]+'"></a><i></i></div><div class="Share_weixin Share"><a href="#"class="bds_weixin"data-cmd="weixin"title="'+langData['siteConfig'][23][120]+'"></a><i></i></div><div class="Share_weibo Share"><a href="#"class="bds_tsina"data-cmd="tsina"title="'+langData['siteConfig'][23][121]+'"></a><i></i></div></div>');
								articleHtml.push('</div>');
								articleHtml.push('</div>');
								articleHtml.push('</div>');
								articleHtml.push('</div>');

							//如果是单图
							}else {
								var litpic = list[i].litpic;
								articleHtml.push('<div class="news_detail">');
								articleHtml.push('<div class="news_lead fn-clear">');
								articleHtml.push('<div class="news_title"><a href="' + list[i].url + '" target="_blank">' + list[i].title + '</a></div>');
								articleHtml.push('<div class="news_tips"><i></i>'+list[i].typeName[0]+'</div>');
								articleHtml.push('</div>');
								articleHtml.push('<p class="desc">' + list[i].description + '</p>');
								if (litpic) {
									articleHtml.push('<ul class="fn-clear"><li><a href="' + list[i].url + '" target="_blank"><img src="' + huoniao.changeFileSize(litpic, "small") + '" alt=""></a></li></ul>');
								}
								articleHtml.push('<div class="news_foot fn-clear">');
								articleHtml.push('<em>' + transTimes(list[i].pubdate,3) + '</em>');
								articleHtml.push('<div class="com"><a href="' + list[i].url + '" target="_blank">' + list[i].common + '</a></div>');
								articleHtml.push('<div class="share_btn">');
								articleHtml.push('<div class="share_box">');
								articleHtml.push('<div class="bdsharebuttonbox" data-url="'+list[i].url+'" data-litpic="'+list[i].litpic+'" data-title="'+list[i].title+'"><div class="Share_QQ Share"><a href="#"class="bds_sqq"data-cmd="sqq"title="'+langData['siteConfig'][23][119]+'"></a><i></i></div><div class="Share_weixin Share"><a href="#"class="bds_weixin"data-cmd="weixin"title="'+langData['siteConfig'][23][120]+'"></a><i></i></div><div class="Share_weibo Share"><a href="#"class="bds_tsina"data-cmd="tsina"title="'+langData['siteConfig'][23][121]+'"></a><i></i></div></div>');
								//分享到QQ好友---分享到微信---分享到新浪微博
								articleHtml.push('</div>');
								articleHtml.push('</div>');
								articleHtml.push('</div>');
								articleHtml.push('</div>');
							}

						// 活动列表
						}else if (action == "huodong") {
							var userphoto = list[i].userphoto, feetype = list[i].feetype;
							huodongHtml.push('<div class="huodong_detail fn-clear">');
							huodongHtml.push('<div class="huodong_pic"><a href="' + list[i].url + '" target="_blank"><img src="' + list[i].litpic + '" alt=""></a></div>');
							huodongHtml.push('<div class="huodong_info">');
							huodongHtml.push('<div class="hodong_title"><a href="' + list[i].url + '" target="_blank">' + list[i].title + '</a></div>');
							huodongHtml.push('<ul>');
							huodongHtml.push('<li><em>'+langData['siteConfig'][19][851]+'</em>' + transTimes(list[i].pubdate,3) + '</li>');
							//活动时间
							huodongHtml.push('<li><em>'+langData['siteConfig'][19][852]+'</em>' + list[i].addrname[0] + '</li>');
							//活动地点
							if (feetype == 1) {
								huodongHtml.push('<li><em>'+langData['siteConfig'][23][122]+'</em>'+echoCurrency('symbol')+ list[i].mprice + '/人</li>');//费用
							}else {
								huodongHtml.push('<li><em>'+langData['siteConfig'][23][122]+'</em>'+langData['siteConfig'][19][427]+'</li>');
								//费用---免费
							}
							// huodongHtml.push('<li><em>参与人数</em>1346人</li>');
							huodongHtml.push('</ul>');
							huodongHtml.push('<div class="huodong_foot fn-clear"><em>'+langData['siteConfig'][23][123]+'</em><div class="share_box"><div class="bdsharebuttonbox"  data-url="'+list[i].url+'" data-litpic="'+list[i].litpic+'" data-title="'+list[i].title+'"><div class="Share_QQ Share"><a href="#"class="bds_sqq"data-cmd="sqq"title="'+langData['siteConfig'][23][119]+'"></a><i></i></div><div class="Share_weixin Share"><a href="#"class="bds_weixin"data-cmd="weixin"title="'+langData['siteConfig'][23][120]+'"></a><i></i></div><div class="Share_weibo Share"><a href="#"class="bds_tsina"data-cmd="tsina"title="'+langData['siteConfig'][23][121]+'"></a><i></i></div></div></div></div>');
							//分享到--分享到QQ好友--分享到微信--分享到新浪微博
							var baoming = nowStamp > list[i].end ? '<span class="donthave">'+langData['siteConfig'][19][507]+'</span>' : '<a href="' + list[i].url + '" class="have">'+langData['siteConfig'][6][149]+'</a>';
							//已结束--我要报名
							huodongHtml.push('<div class="huodong_btnbox fn-clear"><div class="per_num"><em>'+langData['siteConfig'][23][124]+'</em><span>' + list[i].reg + langData['siteConfig'][13][32]+'</span></div><div class="in_btn">'+baoming+'</div></div>');
							//新浪微博----年龄、性别、区域
							huodongHtml.push('</div>');
							huodongHtml.push('</div>');
							huodongHtml.push('</div>');

						// 贴吧列表
						}else if (action == "tieba") {
							var group = list[i].imgGroup;
							tiebaHtml.push('<div class="tie_detail">');
							tiebaHtml.push('<div class="tie_lead fn-clear">');
							var jinghua = list[i].jinghua != '0' ? '<i class="jing"></i>' : '';
							var top = list[i].top != '0' ? '<i class="top"></i>' : '';
							tiebaHtml.push('<div class="tie_title"><a href="' + list[i].url + '" target="_blank">' + list[i].title + '</a>'+top+jinghua+'</div>');
							tiebaHtml.push('<div class="tie_tips"><i></i>' + list[i].typename[0] + '</div>');
							tiebaHtml.push('</div>');
							tiebaHtml.push('<p class="desc">' + list[i].content + '</p>');

							//图集
							if(group.length > 0){
								tiebaHtml.push('<ul class="fn-clear">');
								for(var g = 0; g < group.length; g++){
									if(g < 5){
										var total = g == 4 ? '<div class="Pic_Number">'+group.length+langData['siteConfig'][13][17]+'</div>' : '';   //张
										tiebaHtml.push('<li><a href="#"><img src="' + group[g] + '" alt="">'+total+'</a></li>');
									}
								}
								tiebaHtml.push('</ul>');
							}

							tiebaHtml.push('<div class="tie_foot"><em>' + transTimes(list[i].pubdate, 3) + '</em><span> '+langData['siteConfig'][19][394] + list[i].reply + '</span></div>');  //浏览
							tiebaHtml.push('</div>');
							tiebaHtml.push('</div>');

						// 房源
						}else if (action == "house") {
							var litpic = list[i].litpic;

							// 二手房
							if (curr == 'saleList') {
								var flag = list[i].flags;
								houseHtml.push('<div class="house_detail fn-clear">');
								if (litpic != "" && litpic != undefined) {
									houseHtml.push('<div class="house_pic"><a href="'+list[i].url+'" target="_blank"><img src="'+list[i].litpic+'" alt=""></a></div>');
								}
								houseHtml.push('<div class="house_info">');
								houseHtml.push('<div class="hosue_title"><a href="'+list[i].url+'" target="_blank">'+list[i].title+'</a></div>');
								houseHtml.push('<div class="hosue_tips">');
								if (flag != "") {
									for (var j = 0; j < flag.length; j++) {
										houseHtml.push('<em>'+flag[j]+'</em>');
									}
								}
								houseHtml.push('</div>');
								houseHtml.push('<div class="house_type">'+list[i].community+' / '+list[i].area+'m² / '+list[i].room+' / '+list[i].bno+langData['siteConfig'][13][12]+'<em>('+langData['siteConfig'][13][13]+list[i].floor+langData['siteConfig'][13][12]+'/'+list[i].buildage+langData['siteConfig'][13][14]+')</em> / '+list[i].direction+' / '+list[i].zhuangxiu+'</div>');
								// 层---共---层----年
								houseHtml.push('<div class="house_price">'+langData['siteConfig'][19][428]+'：¥ <em>'+list[i].unitprice+'</em>/m²</div>');  //价格

								var addr = list[i].addr[1] != undefined ? '-'+list[i].addr[1] : '';
								houseHtml.push('<div class="house_location"><i></i>'+list[i].addr[0]+addr+'</div>');
								houseHtml.push('<div class="hosue_foot fn-clear"><div class="house_time"><i></i>' + transTimes(list[i].pubdate, 3) + '</div><div class="house_sell_price"><em>'+echoCurrency('symbol')+list[i].price+'</em> '+langData['siteConfig'][13][27]+'</div></div>');
								houseHtml.push('</div>');
								houseHtml.push('</div>');

							// 租房
							}else if (curr == 'zuList') {
								houseHtml.push('<div class="house_detail fn-clear">');
								if (litpic != "" && litpic != undefined) {
									houseHtml.push('<div class="house_pic"><a href="'+list[i].url+'" target="_blank"><img src="'+list[i].litpic+'" alt=""></a></div>');
								}
								houseHtml.push('<div class="house_info">');
								houseHtml.push('<div class="hosue_title"><a href="'+list[i].url+'" target="_blank">'+list[i].title+'</a></div>');
								houseHtml.push('<div class="hosue_tips">');
								houseHtml.push('</div>');
								houseHtml.push('<div class="house_type">'+list[i].community+' / '+list[i].area+'m² / '+list[i].room+' / '+list[i].bno+langData['siteConfig'][13][12]+'<em>('+langData['siteConfig'][13][13]+list[i].floor+langData['siteConfig'][13][12]+')</em> / '+list[i].direction+' / '+list[i].zhuangxiu+'</div>');
								// 层---共---层
								var addr = list[i].addr[1] != undefined ? '-'+list[i].addr[1] : '';
								houseHtml.push('<div class="house_location"><i></i>'+list[i].addr[0]+addr+'</div>');
								houseHtml.push('<div class="hosue_foot fn-clear"><div class="house_time"><i></i>' + transTimes(list[i].pubdate, 3) + '</div><div class="house_sell_price"><em>'+echoCurrency('symbol')+list[i].price+'</em> /'+langData['siteConfig'][13][18]+'</div></div>');
								//月
								houseHtml.push('</div>');
								houseHtml.push('</div>');

							// 写字楼
							}else if (curr == 'xzlList') {
								var price = list[i].price, area = list[i].area, tprice, unit, usertype = list[i].usertype;
								houseHtml.push('<div class="house_detail fn-clear">');
								if (litpic != "" && litpic != undefined) {
									if (usertype == '0') {
										type = '<div class="geren"></div>';
									}else {
										type = '<div class="zhongjie"></div>';
									}
									houseHtml.push('<div class="house_pic"><a href="'+list[i].url+'" target="_blank"><img src="'+list[i].litpic+'" alt="">'+type+'</a></div>');
								}
								houseHtml.push('<div class="house_info">');
								houseHtml.push('<div class="hosue_title"><a href="'+list[i].url+'" target="_blank">'+list[i].title+'</a></div>');
								houseHtml.push('<div class="hosue_tips">');
								houseHtml.push('</div>');
								houseHtml.push('<div class="house_type">'+list[i].area+'m² / '+list[i].protype+' / '+list[i].zhuangxiu+'</div>');

								if (list[i].type == '0') {
									houseHtml.push('<div class="house_price">'+langData['siteConfig'][19][428]+'：'+echoCurrency('symbol')+' <em>'+price+'</em>/m²•'+langData['siteConfig'][13][18]+'</div>');   // 价格--  月
									tprice = price * area, unit = langData['siteConfig'][13][18];  //价格
								}else {
									houseHtml.push('<div class="house_price">'+langData['siteConfig'][19][428]+'：'+echoCurrency('symbol')+' <em>'+tprice+'</em>'+langData['siteConfig'][13][27]+'</div>');  //价格---万
									tprice = price / area * 10000, unit = 'm²';
								}

								var addr = list[i].addr[1] != undefined ? '-'+list[i].addr[1] : '';
								houseHtml.push('<div class="house_location"><i></i>'+list[i].addr[0]+addr+'</div>');
								houseHtml.push('<div class="hosue_foot fn-clear"><div class="house_time"><i></i>' + transTimes(list[i].pubdate, 3) + '</div><div class="house_sell_price"><em>'+echoCurrency('symbol')+tprice+'</em> /'+unit+'</div></div>');
								houseHtml.push('</div>');
								houseHtml.push('</div>');

							// 商铺
							}else if (curr == 'spList') {
								var price = list[i].price, tprice = (price / 10000).toFixed(2);
								houseHtml.push('<div class="house_detail fn-clear">');
								if (litpic != "" && litpic != undefined) {
									houseHtml.push('<div class="house_pic"><a href="'+list[i].url+'" target="_blank"><img src="'+list[i].litpic+'" alt=""></a></div>');
								}
								houseHtml.push('<div class="house_info">');
								houseHtml.push('<div class="hosue_title"><a href="'+list[i].url+'" target="_blank">'+list[i].title+'</a></div>');
								houseHtml.push('<div class="hosue_tips">');
								houseHtml.push('</div>');
								houseHtml.push('<div class="house_type">'+list[i].protype+' / '+list[i].area+'m² / '+list[i].bno+langData['siteConfig'][13][12]+'<em>('+langData['siteConfig'][13][13]+list[i].floor+langData['siteConfig'][13][12]+')</em> / '+list[i].zhuangxiu+'</div>');
								// 层---共---层

								var addr = list[i].addr[1] != undefined ? '-'+list[i].addr[1] : '';
								houseHtml.push('<div class="house_location"><i></i>'+list[i].addr[0]+addr+'</div>');
								houseHtml.push('<div class="hosue_foot fn-clear"><div class="house_time"><i></i>' + transTimes(list[i].pubdate, 3) + '</div><div class="house_sell_price"><em>'+echoCurrency('symbol')+tprice+'</em> '+langData['siteConfig'][13][27]+'/'+langData['siteConfig'][13][18]+'</div></div>');
								//万--月
								houseHtml.push('</div>');
								houseHtml.push('</div>');

							// 厂房
							}else {
								var price = list[i].price, tprice = (price / 10000).toFixed(2);
								houseHtml.push('<div class="house_detail fn-clear">');
								if (litpic != "" && litpic != undefined) {
									houseHtml.push('<div class="house_pic"><a href="'+list[i].url+'" target="_blank"><img src="'+list[i].litpic+'" alt=""></a></div>');
								}
								houseHtml.push('<div class="house_info">');
								houseHtml.push('<div class="hosue_title"><a href="'+list[i].url+'" target="_blank">'+list[i].title+'</a></div>');
								houseHtml.push('<div class="hosue_tips">');
								houseHtml.push('</div>');
								houseHtml.push('<div class="house_type">'+list[i].protype+' / '+list[i].area+'m² / </div>');

								var addr = list[i].addr[1] != undefined ? '-'+list[i].addr[1] : '';
								houseHtml.push('<div class="house_location"><i></i>'+list[i].addr[0]+addr+'</div>');
								houseHtml.push('<div class="hosue_foot fn-clear"><div class="house_time"><i></i>' + transTimes(list[i].pubdate, 3) + '</div><div class="house_sell_price"><em>'+echoCurrency('symbol')+tprice+'</em> '+langData['siteConfig'][13][27]+'/'+langData['siteConfig'][13][18]+'</div></div>');
								//万--月
								houseHtml.push('</div>');
								houseHtml.push('</div>');

							}

						// 二手
						}else if (action == "info"){

							infoHtml.push('<div class="info_detail">');
							infoHtml.push('<div class="info_lead">');
							var rec = list[i].rec != '0' ? '<i class="jian"></i>' : '';
							var fire = list[i].fire != '0' ? '<i class="ji"></i>' : '';
							infoHtml.push('<div class="news_title"><a href="' + list[i].url + '" target="_blank">' + list[i].title + '</a>'+rec+fire+'</div>');
							infoHtml.push('<div class="tel"><i></i>' + list[i].tel + '</div>');
							infoHtml.push('</div>');
							infoHtml.push('<div class="tel_location">' + list[i].teladdr + '</div>');
							infoHtml.push('<p class="desc"></p>');
							if (list[i].litpic != undefined) {
								infoHtml.push('<ul class="fn-clear"><li><a href="#"><img src="' + list[i].litpic + '" alt=""></a></li></ul>');
							}
							infoHtml.push('<div class="info_foot">' + transTimes(list[i].pubdate, 3) + ' • ' + list[i].address + ' • ' + list[i].typename + '</div>');
							infoHtml.push('</div>');

						}else if(action == 'live'){
							var live_state = '',txt="";
							if(list[i].state ==1){
								live_state = 'living';

							}else if(list[i].state == 2){
								live_state = 'lived';
								txt=langData['siteConfig'][31][137];	//精彩回放
							}else{
								live_state = 'wlive';
								txt=list[i].ftime;
							}
							liveHtml.push('<div class="live_detail '+live_state+'">');
								liveHtml.push('<a href="'+list[i].url+'">');
									liveHtml.push('<h2>'+list[i].title+'</h2>');
									liveHtml.push('<div class="imgbox">');
									liveHtml.push('<i>'+txt+'</i>');
									liveHtml.push('<img src="'+list[i].litpic+'" /></div>');
									liveHtml.push('<div class="live_info">');
									liveHtml.push('<span class="ftime">#'+(list[i].typename?list[i].typename:""+langData['siteConfig'][19][201]+"")+'&nbsp;&nbsp;&nbsp;&nbsp;  '+transTimes(list[i].ftimes,5)+'</span>');//其他
									liveHtml.push('<p>');
									liveHtml.push('<em class="comm_num fn-hide">30</em>');
									liveHtml.push('<em class="click_num">'+list[i].click+'</em>');
									liveHtml.push('</p>');
									liveHtml.push('</div>');
								liveHtml.push('</a>');
							liveHtml.push('</div>');
						}
					}
					$('.loading').remove();
					$('.article_box').append(articleHtml.join(""));
					$('.huodong_box').append(huodongHtml.join(""));
					$('.tieba_box').append(tiebaHtml.join(""));
					$('.house_list').append(houseHtml.join(""));
					$('.'+mainBox).append(infoHtml.join(""));
					$('.live_box').append(liveHtml.join(""));
					showPageInfo();

				}
			}
			loadMoreLock = false;

		}
	})



}
