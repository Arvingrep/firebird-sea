$(function(){
	 var fid = 0;    // 费用类型
	 $('.appMapBtn').attr('href', OpenMap_URL);
	var page = 1;
	var cpage = 1,cload = 0,rpage = 1,rload = 0;

	var clist = $(".rec_hd ul");
	 getData();
	// 导航列表
	var swiper = new Swiper('.swiper-container', {
	      slidesPerView: "auto",
	    });


	// 切换
	$('body').delegate(".tab_box li","click",function(){
		var t =$(this),index = t.index();
		t.addClass("on_chose").siblings("li").removeClass("on_chose");
		$(".tab_container>div").eq(index).removeClass("fn-hide").siblings().addClass("fn-hide");
		swiper.update()
	});


	$(window).scroll(function(){
		var top = $(".hdetail_box").offset().top;
		var scrTop = $(window).scrollTop();
		var rTop = $(".rec_hd").offset().top-80;
		if(scrTop >= top && scrTop < rTop){
			$(".fixedtop").html($(".tab_box"))
		}else{
			$(".tab_div").html($(".tab_box"))
		}

	})

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


	// 收藏
	$(".left_btn.soucan").click(function(){
		var t = $(this), type = "add";
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain + '/login.html';
			return false;
		}

		if(t.hasClass("soued")){
			type = "del";
			t.removeClass("soued").find("em").html("收藏");
		}else{
			t.addClass("soued").find("em").html("已收藏");
		}
		$.post("/include/ajax.php?service=member&action=collect&module=huodong&temp=detail&type="+type+"&id="+plid);
	})


	$(".btn_click").click(function(){
		$(".bottom_box .right_btn").click();
	})

	// 报名

	$(".bottom_box .right_btn").click(function(){
		var t = $(this);
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain + '/login.html';
			return false;
		}
		 if(t.hasClass('disabled')) return;
         
         if(t.hasClass('isbaoming')) return false;

		 if(t.hasClass('cancel')){
		   reg(t,'cancel');
		 }else{
		   $(".hd_pop_mask").show();
		   $("html").addClass("noscroll")
		   if(feetype){
		     showPrice();
		   }else{
		     //填写报名信息
		     $(".hd_pop_bm").removeClass("fn-hide").animate({"bottom":"0"},300,"swing")
		   }
		 }


	});


	function showPrice(){
	    if(!feetype){
	        return true;
	    }else{
	       $(".ticket_box").removeClass("fn-hide").animate({"bottom":"0"},300,"swing")
	        return false;
	    }
	}



	// 选择票种之后

	$(".next_step").click(function(){
		if($(".li_ticket.chosed").size()>0){
			$(".hd_pop_bm").removeClass("fn-hide").animate({"bottom":"0"},300,"swing");
			$(".ticket_box").addClass("fn-hide").animate({"bottom":"-9rem"},300,"swing")

		}else{
			showErr("请选择票种")
		}
	});

	// 选择区号
	$(".acode_show").click(function(){
		$(".popl_mask").show();
		$(".popl_box").animate({"bottom":"0"},300,"swing");
	});

	// 取消选择区号
	$("#areaList li").click(function(){
		var t = $(this);
		var code = t.attr("data-code");
		var area = t.attr("data-cn");
		$(".acode_show").html(code);
		$("#areaCode").val(code);
		t.addClass('achose').siblings('li').removeClass('achose');
		$(".popl_box.anum_box .back").click();
	})

	// 取消选择区号
	$(".popl_box.anum_box .back").click(function(){
		$(".popl_mask").hide();
		$(".popl_box").animate({"bottom":"-9rem"},300,"swing");
	})

	$(".li_ticket ").click(function(){
		var t = $(this);
		t.toggleClass("chosed").siblings("li").removeClass("chosed");
		if(t.hasClass("chosed")){
			fid = t.attr('data-id');
		}else{
			fid = 0;
		}
	});


	// 单选框
	$("dd.select span").click(function(){
		var t = $(this);
		t.addClass("chosed").siblings("span").removeClass('chosed');
		t.siblings("input[type='hidden']").val(t.attr('data-value'));

	});

	// 多选框
	$("dd.option span").click(function(){
		var t = $(this);
		t.toggleClass("chosed");
		var val = []
		$("dd.option span.chosed").each(function(){
			var m = $(this);
			val.push(m.attr('data-value'));
		})
		t.siblings("input[type='hidden']").val(val.join(','));
	});


	$(".hd_pop_mask").click(function(){
		$(".hd_pop_mask").hide();
		$("html").removeClass("noscroll")
		$(".hd_pop_box").animate({"bottom":"-9rem"},300);
		setTimeout(function(){
			$(".hd_pop_box").addClass("fn-hide")
		},300)
	});

	$(".close_btn").click(function(){
		$(".hd_pop_mask").click()
	});

	$("#tj").click(function(){
		reg($(this))
	});




	function reg(m,type){
		//验证登录
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
		    location.href = masterDomain + '/login.html';
		    return false;
		}

		m.addClass("disabled");

		if(type == 'cancel'){
		    if(confirm("确认取消报名吗？")){
		        $.ajax({
		            url: "/include/ajax.php?service=huodong&action=cancelJoin&id="+id,
		            type: "GET",
		            dataType: "jsonp",
		            success: function (data) {
		                m.removeClass("disabled");
		                if(data && data.state == 100){
		                    location.reload();
		                }else{
		                    showErr(data.info);
		                }
		                m.removeClass("disabled");
		            },
		            error: function(){
		                alert("网络错误，操作失败，请稍候重试！");
		                m.removeClass("disabled");
		            }
		        });
		    }else{
		        m.removeClass("disabled");
		    }
		    return false;

		}

		var tj = true, data = [];
		$(".formbox dl").each(function(){
			if(!tj) return false;
			var t = $(this);
			var type = t.attr("data-type")
			var req = t.attr("data-required");
			var value = '';
			var tip = '';
			var title = t.attr("data-id");
			if(type=='text_long'){
				value = t.find('.txt_con').html();
				tip = t.find('.txt_con').attr("placeholder");
			}else if(type=='text'){
				value = t.find('input[type="text"]').val();
				tip = t.find('input[type="text"]').attr("placeholder");
			}else{
				value = t.find('input[type="hidden"]').val();
				tip = t.find('input').attr("placeholder");
			}
			if(req=='1' && (value=='' || value==undefined)){
				showErr(tip);
				tj = false;
				return false;

			}else if(value){
				data.push('{"'+title+'": "'+value+'"}');
			}

		});
		if(!tj) return false;
		data = '['+data.join(',')+']';

		var areaCode = $("#areaCode").val();

		$.ajax({
			url: "/include/ajax.php?service=huodong&action=join&id="+id+"&fid="+fid+"&areaCode="+areaCode+"&data="+data,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){

					if(feetype == 1 && data.info != langData['huodong'][2][29])	{
						info = data.info;
						$("#amout").text(info.order_amount);
						$('.payMask').show();
						$('.payPop').css('transform','translateY(0)');

						if(usermoney*1 < info.order_amount *1){
						
							$("#moneyinfo").text('余额不足，');
						}
						if (usermoney * 1 < info.order_amount * 1) {
						
							$("#moneyinfo").text('余额不足，');
							$("#moneyinfo").closest('.check-item').addClass('disabled_pay')
						
							$('#balance').hide();
						}

						if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
							$("#bonusinfo").text('额度不足，');
							$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
						}else if( bonus * 1 < info.order_amount * 1){
							$("#bonusinfo").text('余额不足，');
							$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
						}else{
							$("#bonusinfo").text('');
							$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
						}



						ordernum     = info.ordernum;
						order_amount = info.order_amount;

						payCutDown('',info.timeout,info);
					}else{
						showErrAlert('报名成功！');
						setTimeout(function(){
							location.reload();
						},1500)
						
					}
					
					// if(feetype == 1 && data.info != "报名成功！"){
					// 	location.href = data.info;
					// }else{
					// 	location.reload();
					// }
				}else{
					alert(data.info);
					t.removeClass("disabled");
				}
			},
			error: function(){
				alert("网络错误，报名失败，请稍候重试！");
				t.removeClass("disabled");
			}
		});
	}



	function getData(){
		islaod = 1;
		var data = [] ;
		data.push("page=" + page);
		data.push('pageSize=3');
		data.push('typeid='+typeid)

		$.ajax({
		    url: '/include/ajax.php?service=huodong&action=hlist',
		    type: 'GET',
		    data: data.join('&'),
		    dataType: 'json',
		    success: function(data){
		        if(data){
		            if(data.state == 100){
		                var info = data.info, list = info.list, html = [];
						totalPage = info.pageInfo.totalPage;
		               for(let m = 0; m<list.length; m++){
						    html.push('<li class="li_box">');
							html.push('<a href="'+list[m].url+'" class="hd_box fn-clear">');
							html.push('<div class="hd_img"><img src="'+list[m].litpic+'" alt=""></div>');
							html.push('<div class="right_info"><h3>'+list[m].title+'</h3>');
							html.push('<div class="hd_detail">');
							html.push('<p class="act_time"><i></i><span>'+returnHumanTime(list[m].began,2)+'</span></p>');
							html.push('<p class="act_addr"><i></i><span>'+list[m].addrname.join(' ')+'</span></p>');
							html.push('<p class="act_bm"><i></i><span>已报名<em>'+list[m].reg+'</em>人</span></p></div></div></a>');
							html.push('<a href="'+list[m].memberurl+'" class="host_box fn-clear">');
							html.push('<div class="head_img"><img src="'+list[m].userphoto+'" onerror="javascript:this.src=\''+masterDomain+'/static/images/noPhoto_40.jpg\';"></div></div>');
							html.push('<p>'+list[m].username+' </p>');
							if(list[m].feetype=="0"){
								  html.push('<div class="price_show free">免费</div>');
							}else{
								  html.push('<div class="price_show ">'+echoCurrency('symbol')+'<em>'+list[m].mprice+'</em>起</div>');
							}
							html.push('</a></li>');
					   }

		                clist.append(html.join(""));
						page ++;
						isload = 0;

						if(page>totalPage){
							isload = 1;
							$(".loading").html('数据加载完成')
						}

		            }else{
		                $(".loading").html(data.info)
		            }
		        }else{
		            $(".loading").html(data.info)
		        }
		    },
		    error: function(){
		        alert('网络错误，请刷新重试');
		    }
		})

	}


	// ========================================分割线====================================
	getcommt();

	// 查看更多评论
	$(".comBox").delegate(".loadmore","click",function(){
		getcommt();
	})


	// 获取评论
	function getcommt() {
		cload = 1;
		$('.commt_box .loading_tip').remove();
		$('.commt_box').append('<div class="loading_tip"><img src="' + templets_skin + 'images/loading.png" ></div>');
		var ctype = "tieba-detail";

		$.ajax({
			url: "/include/ajax.php?service=member&action=getComment&type=huodong-detail&son=1&aid="+id+"&page="+cpage+"&pageSize=10",
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
						html.push('<div class="r_info"><h3><a href="'+masterDomain+'/user/'+d.user.userid+'">' + d.user.nickname + '</a></h3></div><a class="cz_btn '+(d.zan_has?"cared":"")+'">' + d.zan +
							'</a></div>');

						html.push('<div class="commt_con"><h4>' + d.content + '</h4>');
						var len = d.lower.count;
						if (len > 0) {
							html.push('<div class="reply_list"><ul class="r_ul">');
							var ahtml = [];
							html.push(commtAdd(ahtml,d.lower.list));
							html.push('</ul>');
							if (len > 3){
								html.push('<a href="javascript:;" class="r_more">'+langData['circle'][1][22]+'></a>');
							}
							html.push('</div>');
						}
						html.push('<p><em class="pub_time">' + d.ftime+(d.iphome ? ' · ' + d.iphome : '') +
							'  ·</em> <a href="javascript:;" class="reply_btn">'+langData['circle'][1][5]+'</a></p></div></dd>');  /* 回复他*/
					}
					$('.commt_box dl').append(html.join(''));
					$('.commt_box .loading_tip').addClass("loadmore").html('更多评论');
					setTimeout(function() {
						cload = 0;
						cpage++;
						if (cpage > data.info.pageInfo.totalPage) {
							cload = 1;
							$('.commt_box .loading_tip').removeClass("loadmore").html(langData['circle'][0][54]);/* 没有更多了~*/
						}
					})
				} else {
					$('.commt_box .loading_tip').html('还没有人评论哦~');  /* 暂无数据*/
				}
			},
			error: function(err) {
				console.log('fail');

			}
		});
	}


  // 评论拼接
	function commtAdd(html,clist,rname){
		for(var s = 0; s<(clist.length>3 ? 3:clist.length); s++){
			if(rname){
				html.push('<li class="r_li" data-id="'+ clist[s].id +'" data-sid="' + clist[s].sid + '" data-rid="' + clist[s].rid + '"> <span>' + clist[s].user.nickname + '</span> 回复 <span>' + rname + '：</span>' +clist[s].content + ' </li>');
			}else{
				html.push('<li class="r_li" data-id="'+ clist[s].id +'" data-sid="' + clist[s].sid + '" data-rid="' + clist[s].rid + '"> <span>' + clist[s].user.nickname + '</span>：' +clist[s].content + ' </li>');
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
			var levelicon = d.user.level!="0"?(d.user.levelIcon):(templets_skin+"images/level_0.png");
			html.push('<div class="v_icon level_'+d.user.level+'"><img src="'+levelicon+'"></div></div>');
			html.push('<div class="r_info"><h3>' + d.user.nickname + '</h3></div><a class="cz_btn ' + (d.zan_has ?"cared" : "") + '">' + d.zan + '</a></div>');
			html.push('<div class="reply_con">');
			html.push('<h4>回复 <span class="mname">'+d.member.nickname+' </span> ' + d.content + '</h4>');
			html.push('<p><em class="pub_time">' + d.ftime+(d.iphome ? ' · ' + d.iphome : '') +' ·</em> <a href="javascript:;" class="reply_btn">'+langData['circle'][1][5]+'</a></p></div></dd>');  /* 回复他*/
			if(d.lower!=undefined &&d.lower.count>0){
				replyAdd(d.lower.list)
			}
		}
		return html.join("");
	}

		// 关注活动发起人
		$(".sponsor_box .care_btn").click(function(){
			var t = $(this),userid = t.attr('data-uid');
			if (t.hasClass('cared')) {
				follow(t, function(){
					t.removeClass('cared');  //关注
					t.find('em').html(langData['siteConfig'][19][846]);
				});
			}else{
				follow(t, function(){
					t.addClass('cared');
					t.find('em').text(langData['siteConfig'][19][845]);  //已关注
				});
			}
		});

		function follow(t, func){
			var userid = $.cookie(cookiePre+"login_user");
			if(userid == null || userid == ""){
				location.href = masterDomain + '/login.html';
				return false;
			}

			if(t.hasClass("disabled")) return false;
			t.addClass("disabled");
			$.post("/include/ajax.php?service=member&action=followMember&id="+t.data("uid"), function(){
				t.removeClass("disabled");
				func();
			});
		}

	// 评论点赞
	$('body').delegate('.cz_btn','click',function(){
		var t = $(this);
		if(t.hasClass('disabled')) return ;
		t.addClass('disabled');
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			location.href = masterDomain + '/login.html';
			return false;
		}
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

	// 点击评论
	$('.commt_btn').click(function(){
		var t = $(this);
		$('.bottom_rbox,.mask_re').show();
		$('.bq_box').removeClass('show');
		$('.bottom_rbox').attr('data-reply','');
		$("html").addClass("noscroll");
	});

	$('.bottom_rbox .bq_btn').click(function(){
		var t = $(this);
		t.toggleClass('bq_open');      	
        $(".bq_box").html() == '' ? $(".bq_box").append(appendEmoji()) : '';  //此时再加载表情
		$('.bq_box').toggleClass('show');

		if(/iphone|ipad|ipod/.test(userAgent)){
			$('.bottom_rbox').removeClass("pbottom");
		}else{
			$('.bottom_rbox').toggleClass("pbottom");
		}

	});



	// 发送评论
	$('.send_btn').click(function(){
		var t = $(this);
		replyid = t.parents('.bottom_rbox').attr('data-reply');   //此处需判断是否存在，如果有则回复评论，如果没有则评论该条动态
		if(replyid){
			var url = '/include/ajax.php?service=member&action=replyComment&check=1&id=' + replyid;
		}else{
			var url = '/include/ajax.php?service=member&action=sendComment&check=1&type=huodong-detail&aid=' + plid;
		}
		var userid = $.cookie(cookiePre + "login_user");
		$('#reply img').each(function(){
			var t = $(this);
			var txt = t.attr('data-txt');
			t.after(txt);
			t.remove();
		});

		var con = $('#reply').html().replace(/\ +/g,"").replace(/[\r\n]/g,"") ;  //去掉回车和空格

		if (userid == null || userid == "") {
			window.location.href = masterDomain + '/login.html';
			return false;
		}
		if(con==''){
			showErr(langData['circle'][3][20]);   //请输入评论内容
		}else{
			$.ajax({
				url: url,
				data: "sco1=1&content=" + encodeURIComponent($('#reply').html()),
				type: "POST",
				dataType: "json",
				success: function(data) {
					if (data && data.state == 100) {
						if (data.info.ischeck == 1) {
							showErr(langData['circle'][3][21]);   //回复成功
							cpage = 1;
							$("#reply").html('');
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
		$('body').delegate('.reply_btn, .commt_con h4', 'click', function() {
			cscroll = $(this).offset().top
			var t = $(this),
				p = t.parents('.replybox'),
				id = p.attr('data-id');
				console.log(id)
			$('.bottom_rbox,.mask_re').show();
			$('.bottom_rbox').attr('data-reply',id)
			$('.bottom_rbox').find('#reply').focus();
			$('html').addClass('noscroll');
		});

		$('body').delegate('.r_li', 'click', function() {
			cscroll = $(this).offset().top
			var t = $(this),
				p = t.parents('.replybox'),
				id = t.attr('data-id');
				console.log(id)
			$('.bottom_rbox,.mask_re').show();
			$('.bottom_rbox').attr('data-reply',id)
			$('.bottom_rbox').find('#reply').focus();
			$('html').addClass('noscroll');
		});
		$('.bottom_rbox #reply').click(function(){
			$(".bq_btn").removeClass("bq_open");
			if(!(/iphone|ipad|ipod/.test(userAgent))){
				$('.bottom_rbox').addClass("pbottom");
			}
			$('.bq_box').removeClass('show');
		})

		$('.mask_re').click(function(){
			$('.mask_re,.bottom_rbox').hide();
			if(!(/iphone|ipad|ipod/.test(userAgent))){
				$('.bottom_rbox').addClass("pbottom");
			}
			$(".bq_btn").removeClass("bq_open");
			$('.bq_box').removeClass('show');
			$('html').removeClass('noscroll');

		});


		//点击表情，输入
		var memerySelection;
		var userAgent = navigator.userAgent.toLowerCase();

		set_focus($('#reply'));
		$('.emot_li').click(function() {
			var t = $(this);
			var emojsrc = t.find('img').attr('src');
			var txt = t.attr('data-txt');
			memerySelection = window.getSelection();
			if (/iphone|ipad|ipod/.test(userAgent)) {
				$('#reply').append('<img src="' + emojsrc + '" class="emotion-img" data-txt="'+txt+'" />');
				return false;

			} else {
				set_focus($('#reply:last'));
				pasteHtmlAtCaret('<img src="' + emojsrc + '" class="emotion-img" data-txt="'+txt+'"/>');
			}
			// $('.input_container .inbox:before').css('display',"none")
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
			if (/msie/.test(navigator.userAgent.toLowerCase())) {
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
								var levelicon =( d.user.level!="0")?(d.user.levelIcon):(templets_skin+"images/level_1.png");
							list.push('<div class="v_icon level_'+d.user.level+'"><img src="'+levelicon+'"></div></div>');
							list.push('<div class="r_info"><h3>' + d.user.nickname + '</h3></div><a class="cz_btn ' + (d.zan_has ?
								"cared" : "") + '">' + d.zan + '</a></div>');
							list.push('<div class="reply_con">');
							list.push('<h4>' + d.content + '</h4>');
							list.push('<p><em class="pub_time">' + d.ftime+(d.iphome ? ' · ' + d.iphome : '') +
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





});
