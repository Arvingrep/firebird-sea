// c -> 评论  r -> 回复  z -> 点赞  p -> 商品
var cpage = 1,
	cload = 0,
	rpage = 1,
	rload = 0,
	zpage = 1,
	zload = 0,
	ppage = 1,
	pload = 0;

$(function() {
	// 给表情添加对应的字符
	$(".bq_box").html(appendEmoji());
  	//提示窗
		var showErrTimer;
		function showErr(txt,time){
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
		};

	// 大图预览
	Zepto.fn.bigImage({
		artMainCon: ".con_box", //图片所在的列表标签
		show_Con: '.imgcom',
	});

	// 发布按钮
	setTimeout(function(){
			$('.go_fabu a').css({'width':".84rem"})
			$('.go_fabu').animate({'right':".3rem"},300)
		},5000)


	// 关注
	$('body').delegate('.care_btn', 'click', function() {
		var t = $(this),
			p = t.parents('.art_info');
		var id = p.attr('data-id');
		var userid = $.cookie(cookiePre + "login_user");
		if (userid == null || userid == "") {
			window.location.href = masterDomain + '/login.html';
			return false;
		}

		if ($(this).hasClass('cared')) {
			$(this).removeClass('cared').html(langData['circle'][0][49]);  /*关注 */
		} else {
			$(this).addClass('cared').html(langData['circle'][0][50]);  /* 已关注*/
		}

		$.post("/include/ajax.php?service=member&action=followMember&id=" + id);

		return false;
	});

    //触发分享

    $('.share_btn').click(function(){
      $('.HN_PublicShare').off('click').click();
    })

	//评论点赞
	// $('body').delegate(".cz_btn",'click',function(){
	// 	var t = $(this),
	// 		p = t.parents('.replybox');
	// 		plid = p.attr('data-id');
	// 		$.ajax({
	// 		url: "include/ajax.php?service=member&action=dingComment&id=="+plid+"&type=add",
	// 		type:"POST",
	// 		dataType:"json",
	// 		success:function(data){
	// 			// console.log(data.info);
	// 			if(data.info =="ok"){
	// 				if (t.hasClass('zaned')) {
	// 						t.removeClass('zaned');
	// 						num = num - 1;
	// 				} else {
	// 					t.find('.canvas_box').show();
	// 					setTimeout(function() {
	// 						t.find('.canvas_box').hide();
	// 						t.addClass('zaned');
	// 					}, 500)
	// 					num = num + 1;
	// 					}
	// 				}
	// 		t.find('em').text(num > 0 ? num : "");
	// 		},
	// 		error:function(){

	// 		}
	// 	});

	// });

// 评论点赞
	$('body').delegate('.cz_btn','click',function(){
		var t = $(this);
		if(t.hasClass('disabled')) return ;
		t.addClass('disabled');
		var action = "add" ;  //操作
		var num = t.text()*1
		var rid = t.parents('.replybox').attr('data-id')
		if(t.hasClass('cared')){
			action = "del"
			num = num-1;
		}else{
			action = "add";
			num = num+1;
		}
		$.ajax({
			url: "/include/ajax.php?service=member&action=dingComment&id="+rid+"&type="+action,
			type: "GET",
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					t.text(num);
					if(action=="add"){
						t.addClass('cared')
					}else{
						t.removeClass('cared')
					}
				} else {
					alert(data.info)
				}
				t.removeClass('disabled');
			},
			error: function(err) {
				console.log(err);
				t.removeClass('disabled');
			}
		});
	})


	// 评论加载
	getcommt();

	$(window).scroll(function() {
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w;
		if ($(window).scrollTop() >= scroll && !cload) {
			getcommt()
		}
	});

	// 查看点赞列表
	$('.zan_list').delegate('.more_btn', 'click', function(e) {
		var did = $(this).attr('data-id');
		$('.mask_zan').show();
		$('html').addClass('noscroll');
		$('.az_box').animate({
			'bottom': 0
		}, 150);
		if ($('.az_list ul.az_ul>li').length > 0) {
			e.stopPropagation();
		}
		setTimeout(function() {
			getzanList(did)
		}, 100);

	});

	// 点赞列表滚动下载
	$('.az_list').scroll(function() {
		var allh = $('.az_list ul').height();
		var w = $('.az_list').height();
		var scroll = allh - w - 50;
		var did = $('.zan_list .more_btn').attr('data-id');
		console.log($('.az_list').scrollTop() >= scroll)
		if ($('.az_list').scrollTop() >= scroll && !zload) {
			getzanList(did)
		}
	});


	// 隐藏点赞列表
	$('.mask_zan,.az_box .close_btn').click(function() {
		$('.mask_zan').hide();
		$('.az_box').animate({
			'bottom': '-90%'
		}, 150);
		$('html').removeClass('noscroll');
	});


	// 查看回复列表
	$('.commt_box').delegate('.r_more', 'click', function() {
		rpage = 1;
		var t = $(this),
			p = t.parents('.commt_dd'),
			com_id = t.parents('dd.commt_dd').attr('data-id');
		var ctn = p.find('.commt_con h4').html();
		var ptime = p.find('.pub_time').text()

		var info = p.find('.commt_user').html();
		$('.re_list .reply_div .reply_user').html(info)
		$('.re_list .reply_div .reply_con h4').html(ctn);
		$('.re_list .reply_div .reply_con .pub_time').html(ptime)
		$('.re_list .reply_div').attr('data-id', com_id)

		$('.mask_reply').show();
		$('.re_box').animate({
			'bottom': 0
		}, 150);
		$('html').addClass('noscroll');
		getreplyList(com_id);
	})

	// 收起回复列表
	$(".mask_reply,.close_btn").click(function() {
		$('html').removeClass('noscroll');
		$('.mask_reply').hide();
		$('.re_box').animate({
			'bottom': '-90%'
		}, 150);
	});

	// 回复列表滚动加载
	$('.re_list').scroll(function() {
		var allh = $('.re_list .box_scroll').height();
		var w = $('.re_list').height();
		var scroll = allh - w;
		var id = 43;
		if ($('.re_list').scrollTop() >= scroll && !rload) {
			getreplyList()
		}
	});


	var cscroll = 0;
	// 回复框显示
	$('body').delegate('.reply_btn', 'click', function() {
		cscroll = $(this).offset().top
		var t = $(this),
			p = t.parents('.replybox'),
			id = p.attr('data-id');
		$('.bottom_box,.mask_re').show();
		$('.bottom_box').attr('data-reply',id)
		$('.bottom_box').find('#reply').focus();
		$('html').addClass('noscroll');
	});



	// 查看商品列表
	$('.rec_pbox .open_btn').click(function() {
		$('.mask_alink').show();
		$('.alink_box').animate({
			"bottom": 0
		}, 150);
		$('html').addClass('noscroll');
		//if ($('.alink_box').find('li.alink_li').length == 0) {
		//	setTimeout(function() {
		//		getproList()
		//	}, 150)
		//}
	});



	// 关闭商品列表
	$('.alink_box .close_btn,.mask_alink').click(function() {
		$('.mask_alink').hide();
		$('.alink_box').animate({
			"bottom": '-90%'
		}, 150);
		$('html').removeClass('noscroll')
	})

	//打赏
	var dashangElse = false;
	$('.ds_btn').click(function() {
		$('html').addClass('noscroll');
		var t = $(this),
			newsid = plid;
		name = $('.art_info .r_info h3').text()
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

					$("#ds_page .dsMask,#ds_page .dsPop").show();

				} else {
					alert(data.info);
				}
			},
			error: function() {
				t.removeClass("load");
				alert(langData['circle'][0][73]);  /* "网络错误，操作失败，请稍候重试！"*/
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
		$('body').unbind('touchmove');
		$('html').removeClass('noscroll');
	})

	// 关闭打赏
	$('.shang-money .close').click(function() {
		$('.mask').hide();
		$('.shang-box').hide();
		$('.shang-money .shang-item .error-tip').hide()
		$('body').unbind('touchmove');
		$('html').removeClass('noscroll');
	})

	// 选择打赏支付方式
	var amount = 0;
	$('.shang-btn').click(function() {
		var newsid = plid
		amount = dashangElse ? parseFloat($(".shang-item input").val()) : parseFloat($(".shang-item-cash em").text());
		var regu = "(^[1-9]([0-9]?)+[\.][0-9]{1,2}?$)|(^[1-9]([0-9]+)?$)|(^[0][\.][0-9]{1,2}?$)";
		var re = new RegExp(regu);
		if (!re.test(amount)) {
			amount = 0;
			alert(langData['circle'][0][66]);   /* 打赏金额格式错误，最少0.01元！*/
			return false;
		}

		var app = device.indexOf('huoniao') >= 0 ? 1 : 0;
		location.href = "/include/ajax.php?service=circle&action=reward&aid=" + newsid + "&amount=" + amount + "&app=" +
			app;

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
			alert(langData['circle'][0][66]);   /* 打赏金额格式错误，最少0.01元！*/
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
	$('.jubao_btn').click(function() {
		JubaoConfig.id = plid;

		$('.jubao_box').show();
		$('.jubao_detail h4').find('em').text($('.art_info .r_info h3').text());
		$('.jubao_title').text($(this).parents('.more_box').attr('data-title'));
		$('html').addClass('noscroll');
	});


	// 举报提交
	var JuMask = $('.JuMask'),
		JubaoBox = $('.jubao_box');
	$('.content_box .sub').click(function() {

		var t = $(this);
		if (t.hasClass('disabled')) return;
		if ($('.jubap_type input').val() == '') {
			console.log('请选择举报类型')
			showErr(langData['siteConfig'][24][2]); //请选择举报类型
		} else if ($('.contact input').val() == "") {
			console.log('请输入联系方式')
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

	// 点赞
	$(".btn_zan").click(function(){
		$(".zan_btn").click();
	});

	$('body').delegate('.zan_btn', 'click', function() {

		var userid = $.cookie(cookiePre + "login_user");
		if (userid == null || userid == "") {
			window.location.href = masterDomain + '/login.html';
			return false;
		}
		var t = $(this),
			num = t.text() == "" ? 0 : Number(t.text())
		var did = t.attr("data-did");
		var uid = t.attr("data-uid");
		if(t.hasClass('disabled')) return false;
		t.addClass('disabled');  //防止多次点击触发
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
						$('.btn_zan em,.zan_btn').text(num > 0 ? num : "")
						t.removeClass('disabled');
                }else{
                    showErrAlert(data.info);
                }


			},
			error:function(){

			}
		});

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

	$('#reply').click(function(){
		var t = $(this);
		 $('.bq_btn').removeClass('bq_open');
		 $('.bq_box').removeClass('show')
	})

	// 获取评论
	function getcommt() {
		cload = 1;
		$('.commt_box').append('<div class="loading_tip"><img src="' + templets_skin + 'images/loading.png" ></div>');
		var ctype = "tieba-detail";

		$.ajax({
			url: "/include/ajax.php?service=member&action=getComment&type=circle-dynamic&son=1&aid=" + plid +
				"&page="+cpage+"&pageSize=10",
			type: "GET",
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var html = [];
					if (cpage == 1) {
						$('.commt_box dl').find('dd').remove();
					}
					for (var i = 0; i < data.info.list.length; i++) {
						var d = data.info.list[i];
                       var len =0
                      	if(d.lower.list){
                          len = d.lower.list.length; //len表示此评论下的回复数
                        }
						html.push('<dd class="commt_dd replybox" data-id="' + d.id + '"><div class="commt_user fn-clear">');
						html.push('<a href="'+masterDomain+'/user/'+d.user.userid+'" class="l_head"><img src="' + (d.user.photo ? d.user.photo : "/static/images/noPhoto_60.jpg") +
							'" />');
                        //<div class="v_icon"><img src="' + templets_skin + 'images/v_1.png"></div>
						html.push('</a>');
						// 此处需判断当前登录用户是否点过赞 ，已经点过赞加 cared
						html.push('<div class="r_info"><h3>' + d.user.nickname + '</h3></div><a class="cz_btn '+(d.zan_has?"cared":"")+'">' + d.zan +
							'</a></div>');

						html.push('<div class="commt_con"><h4>' + d.content + '</h4>');
						var len = d.lower.count;
						if (len > 0) {
							html.push('<div class="reply_list"><ul class="r_ul">');
							var ahtml = [];
							html.push(commtAdd(ahtml,d.lower.list))
							html.push('</ul><a href="javascript:;" class="r_more">'+langData['circle'][1][22]+'></a></div>');   /*  全部1条回复  */
						}
						html.push('<p><em class="pub_time">' + d.ftime + (d.iphome ? ' · ' + d.iphome : '') +
							'  ·</em> <a href="javascript:;" class="reply_btn">'+langData['circle'][1][5]+'</a></p></div></dd>');  /* 回复他*/
					}
					$('.commt_box dl').append(html.join(''));
					$('.commt_box .loading_tip').remove();
					setTimeout(function() {
						cload = 0;
						cpage++;
						if (cpage > data.info.pageInfo.totalPage) {
							cload = 1;
							$('.commt_box').append('<div class="loading_tip">'+langData['circle'][0][54]+'</div>');   /* 没有更多了~*/
						}
					})
				} else {
                    $('.commt_box .loading_tip').remove();
					$('.commt_box').append('<div class="loading_tip">'+langData['circle'][0][55]+'</div>');  /* 暂无数据*/
				}
			},
			error: function(err) {
				console.log('fail');

			}
		});
	}


  // 评论拼接
	function commtAdd(html,clist,rname){
		for(var s = 0; s<(clist.length>3?3:clist.length); s++){
			if(rname){
				html.push('<li class="r_li" data-sid="' + clist[s].sid + '" data-rid="' + clist[s].rid + '"> <span>' + clist[s].user.nickname + '</span> 回复 <span>' + rname + '：</span>' +clist[s].content + ' </li>');
			}else{
				html.push('<li class="r_li" data-sid="' + clist[s].sid + '" data-rid="' + clist[s].rid + '"> <span>' + clist[s].user.nickname + '</span>：' +clist[s].content + ' </li>');
			}
			if(clist[s]['lower']!=undefined  && clist[s]['lower'].count>0){
				commtAdd(html,clist[s]['lower'].list,clist[s].user.nickname);

			}
		}
		 return html.join("");

	}
  //回复拼接
	function replyAdd(html,rlist){
		var len = rlist.length;
		for (var i = 0; i <len; i++) {
			var d = rlist[i];
			console.log(rlist)
			html.push('<dd class="reply_dd replybox" data-id="' + d.id + '"><div class="reply_user fn-clear">');
			html.push('<div class="l_head"><img src="' + (d.user.photo ? d.user.photo : "/static/images/noPhoto_60.jpg") +'" />');
			html.push('<div class="v_icon"><img src="' + templets_skin + 'images/v_1.png"></div></div>');
			html.push('<div class="r_info"><h3>' + d.user.nickname + '</h3></div><a class="cz_btn ' + (d.zan_has ?"cared" : "") + '">' + d.zan + '</a></div>');
			html.push('<div class="reply_con">');
			html.push('<h4>回复 <span class="mname">'+d.member.nickname+' </span> ' + d.content + '</h4>');
			html.push('<p><em class="pub_time">' + d.ftime + (d.iphome ? ' · ' + d.iphome : '') +' ·</em> <a href="javascript:;" class="reply_btn">'+langData['circle'][1][5]+'</a></p></div></dd>');  /* 回复他*/
			if(d.lower!=undefined &&d.lower.count>0){
				replyAdd(d.lower.list)
			}
		}
		return html.join("");
	}
	// 获取点赞
	function getzanList(did) {
		zload = 1;
		$('.az_list').append('<div class="loading_tip"><img src="' + templets_skin + 'images/loading.png" ></div>');
		$.ajax({
			url: "/include/ajax.php?service=circle&action=dianzantj&did="+did+"&page=" + zpage + "&pageSize=15",
			type: "GET",
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [];

					for (var i = 0; i < data.info.list.length; i++) {
						var d = data.info.list[i];
						if (d.level > 0) {
							var vimg = "<img src="+templets_skin+"images/v_4.png>";

						}else{
							var vimg = '';
						}
						list.push('<li class="az_li"><div class="l_head">');
						list.push('<img src="' + (d.photo ? d.photo : "/static/images/noPhoto_60.jpg") + '" onerror="this.src= \'/static/images/noPhoto_100.jpg\'" />');
						list.push('<div class="v_icon">'+vimg+'</div></div>');
						list.push('<div class="r_info"><h5>' + d.nickname + '</h5><p>'+(d.email ? d.email:langData['circle'][3][19])+'</p></div>');   //暂无
						list.push('<a href="javascript:;" class="zan_icon">'+langData['circle'][1][12]+'</a></li>');  /* 赞*/
					}
					$('.az_list ul').append(list.join(''));
					$('.az_list .loading_tip').remove();
					setTimeout(function() {
						zload = 0;
						if (zpage > data.info.pageInfo.totalPage) {
							zload = 1;
							$('.az_list').append('<div class="loading_tip">'+langData['circle'][0][54]+'</div>');  /* 没有更多了~*/
						}
						zpage++;
					})
				} else {
					$('.az_list').append('<div class="loading_tip">'+langData['circle'][0][55]+'</div>');  /* 暂无数据*/
				}
			},
			error: function(err) {
				console.log('fail');

			}
		});
	}

	// 获取回复
	function getreplyList(id) {
		rload = 1;
		if (rpage == 1) {
			$('.re_dl dd').remove()
		}
		$('.re_dl').append('<div class="loading_tip"><img src="' + templets_skin + 'images/loading.png" ></div>');
		$.ajax({
			url: "/include/ajax.php?service=member&action=getChildComment&pid=" + id + "&page=1&pageSize=10",
			type: "GET",
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [];
					$("#replynum").html(data.info.list.length);
					for (var i = 0; i < data.info.list.length; i++) {
						var d = data.info.list[i];
						list.push('<dd class="reply_dd replybox" data-id="' + d.id + '"><div class="reply_user fn-clear">');
						list.push('<div class="l_head"><img src="' + (d.user.photo ? d.user.photo : "/static/images/noPhoto_60.jpg") +
							'" />');
						list.push('<div class="v_icon"><img src="' + templets_skin + 'images/v_1.png"></div></div>');
						list.push('<div class="r_info"><h3>' + d.user.nickname + '</h3></div><a class="cz_btn ' + (d.zan_has ?
							"cared" : "") + '">' + d.zan + '</a></div>');
						list.push('<div class="reply_con">');
						list.push('<h4>' + d.content + '</h4>');
						list.push('<p><em class="pub_time">' + d.ftime + (d.iphome ? ' · ' + d.iphome : '') +
							' ·</em> <a href="javascript:;" class="reply_btn">'+langData['circle'][1][5]+'</a></p></div></dd>');  /* 回复他*/
                      if(d.lower!=undefined &&d.lower.count>0){
							var html = [];
							list.push(replyAdd(html,d.lower.list));
						}
					}
					$('.re_dl').append(list.join(''));
					$('.re_dl .loading_tip').remove();

					setTimeout(function() {
						rload = 0;
						rpage++;
						if (rpage > data.info.pageInfo.totalPage) {
							rload = 1;
							$('.re_dl').append('<div class="loading_tip">'+langData['circle'][0][54]+'</div>');  /* 没有更多了~*/
						}
					})
				} else {
					$('.re_dl').append('<div class="loading_tip">'+langData['circle'][0][55]+'</div>');  /* 暂无数据*/
				}
			},
			error: function(err) {
				console.log('fail');

			}
		});
	}

	// 获取商品列表
	function getproList() {
		pload = 1;
		$('.alink_box .al_list').append('<div class="loading_tip"><img src="' + templets_skin +
			'images/loading.png" ></div>');
		$.ajax({
			url: "/include/ajax.php?service=shop&action=slist&page=" + ppage + "&pageSize=10",
			type: "GET",
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [];
					for (var i = 0; i < data.info.list.length; i++) {
						var d = data.info.list[i];
						list.push('<li class="alink_li" data-id="' + d.id + '"><a href="' + d.url + '" class="fn-clear">');
						list.push('<div class="l_img"><img src="' + d.litpic + '"></div>');
						list.push('<div class="r_info">');
						list.push('<h3>' + d.title + '</h3>');
						list.push('<div class="buy_box">');
						list.push('<p class="price_show"><em>' + echoCurrency('symbol') + '</em>' + d.price + '</p>');
						list.push('<span class="go_link"></span></div></div></a></li>');
					}
					$('.alink_box .al_list ul').append(list.join(''));
					$('.alink_box .al_list .loading_tip').remove();
					setTimeout(function() {
						pload = 0;
						ppage++;
						if (ppage > data.info.pageInfo.totalPage) {
							pload = 1;
							$('.alink_box .al_list').append('<div class="loading_tip">'+langData['circle'][0][54]+'</div>');  /* 没有更多了~*/
						}
					})
				} else {
					$('.alink_box .al_list').append('<div class="loading_tip">'+langData['circle'][0][55]+'</div>');  /* 暂无数据*/
				}
			},
			error: function(err) {
				console.log('fail');

			}
		});
	}


	// 打赏列表单个显示
	var len = 0,
		w1 = $('.ds_li').width();
	line()
	var timeshow = setInterval(line, 5000)

	function line() {
		var li = $('.ds_box ul>li').eq(len);
		li.addClass('show');
		var w = li.find('.box_li').width();
		li.animate({
			'width': w + 4
		}, 500);
		setTimeout(function() {
			$('.ds_box ul>li.show').animate({
				'width': w1
			}, 300);
			setTimeout(function() {
				$('.ds_box ul>li').removeClass('show')
			}, 320);
			len++;
			if (len == $('.ds_box ul>li').length) {
				len = 0;
			}
		}, 4000)
	}

	// 关闭打赏列表显示
	$('.ds_box').delegate('.close_btn','click',function(){
		var t = $(this);
		var p = t.parents('.ds_li');
		$('.ds_box ul>li.show').animate({
			'width': w1
		}, 300);
		setTimeout(function() {
			$('.ds_box ul>li').removeClass('show');
			$('.ds_box').remove(); //隐藏打赏列表
		}, 320);
	})



	// 点击评论

	$('.bbtns_box .lr_btn').click(function(){
		var t = $(this);
		$('.bottom_box,.mask_re').show();
		$('.bq_box').removeClass('show');
		$('.bottom_box').attr('data-reply','')
	});

	$('.bbtns_box .bq_btn').click(function(){
		var t = $(this);
		$('.bottom_box').attr('data-reply','')
		$('.bottom_box,.mask_re').show();
		$('.reply_box .bq_btn').addClass('bq_open');
		$('.bq_box').addClass('show');
	});

	$('.mask_re').click(function(){
		$('.mask_re,.bottom_box').hide();
		$('html').removeClass('noscroll');

	});

	$('#reply').blur(function(){
		var bh = $('body').height();
		setTimeout(function() {
			$(window).scrollTop(cscroll); //失焦后强制让页面归位
		}, 100);
	})


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
			$(".bottom_box").css("padding-bottom",".28rem");
		}else{
			$(".bottom_box").css("padding-bottom","3rem");
		}
		set_focus($('#reply'));
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

	// 发送评论
	$('.send_btn').click(function(){
		var t = $(this);
		replyid = t.parents('.bottom_box').attr('data-reply');   //此处需判断是否存在，如果有则回复评论，如果没有则评论该条动态
      	if(replyid){
			var url = '/include/ajax.php?service=member&action=replyComment&check=1&id=' + replyid;
		}else{
			var url = '/include/ajax.php?service=member&action=sendComment&check=1&type=circle-dynamic&aid=' + plid;
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
			showErr(langData['circle'][3][20]);   //请输入评论内容
		}else{
			$.ajax({
				url: url,
				data: "content=" + encodeURIComponent($('#reply').html()),
				type: "POST",
				dataType: "json",
				success: function(data) {
					if (data && data.state == 100) {
						if (data.info.ischeck == 1) {
							showErr(langData['circle'][3][21]);   //回复成功
							cpage = 1;
							$('#reply').html('')
							getcommt();
						} else {
							showErr(langData['circle'][3][22]);  //评论成功，请等待管理员审核！
						}
						$(".mask_re").click();

					} else {
						alert(data.info);
					}
				},
				error: function() {
					alert(langData['circle'][3][23]);  //网络错误，发表失败，请稍候重试！
				}
		});
		}

	})





















});
