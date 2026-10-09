$(function () {
    var anchorId, refreshTopTimer;
   // $('.container.tw_info .img_box li a').abigimage();
	var pro_num = $(".liveProList .ul_livePro li").length;
	if(pro_num){
		$(".livePro .pro_num em").text(pro_num);
		$(".livePro").removeClass('fn-hide');
	}else{
		$(".livePro").addClass('fn-hide');
	}
	if($(".tw_info .item").size()==0){
		$('.empty').removeClass("fn-hide");
	}
	setTimeout(function(){
		$(".videoBox .msg_show").fadeOut();
	},3000);
	$('.container.tw_info .img_box li').click(function(){
		var src = $(this).find('img').attr('src');
		showBigImg(src)
	})
	
	if($(".recbox .ul_list li").size()==0){
		$(".recbox .nodata").show();
	}
	
	//页面自适应设置
	$(window).resize(function(){
		if(vertical) return false;
		var screenwidth = window.innerWidth || document.body.clientWidth;
		var criticalPoint = criticalPoint != undefined ? criticalPoint : 1600;
		var criticalClass = criticalClass != undefined ? criticalClass : "newsize";
		if(screenwidth > criticalPoint){
			$(".w1600").removeClass(criticalClass);
		}else{
			$(".w1600").addClass(criticalClass);
		}
	});
	
	$(".live-emoji-hide").append(huoniao.appendEmoji());
	setTimeout(function(){
		$(".live-emoji-hide ul").addClass('live-emoji-list');
	},300)
	
	// 显示和隐藏商品
	var flagshow = 0;
	$(".livePro").click(function(){
		var  t = $(this);
		if(t.hasClass("noClick")){
			if(liveType==1){
				$(".invite-box").addClass('pop-show');
			}else{
				$(".play-box").addClass('pop-show');
			}
			$(".dalogo").addClass('pop-show');
			return false;
		}
		t.addClass("fn-hide");
		$(".liveProListBox").removeClass("fn-hide");
		if(!flagshow){
			if($(".w1600").hasClass("newsize")  && $(".ul_livePro li").length>3){
				// 商品展示
				$(".liveProList").slide({mainCell:".ul_livePro",effect:"left",pnLoop:false,prevCell:".prev",nextCell:".next",scroll:3,vis:3,autoPage:true});
			}else if($(".ul_livePro li").length>4){
				// 商品展示
				$(".liveProList").slide({mainCell:".ul_livePro",effect:"left",pnLoop:false,prevCell:".prev",nextCell:".next",scroll:4,vis:4,autoPage:true});
			}else{
				$(".liveProListBox a.next,.liveProListBox a.prev").hide()
				$(".liveProList").css("padding-left",'0')
			}
			// $(".newProBox").addClass('fn-hide');
			flagshow = 1;
		}
	});
	
	$("body div").click(function(){
		if($(this).hasClass("noClick")){
			if(liveType==1){
				$(".invite-box").addClass('pop-show');
			}else{
				$(".play-box").addClass('pop-show');
			}
			$(".dalogo").addClass('pop-show');
		}
	})
	
	$(".ul_livePro li,.vProList li").each(function(){
		var t = $(this);
		var price = t.find('.pro_price').attr('data-price');
		var pprice = price.split('.');
		t.find('.pro_price em').text(pprice[0]);
		t.find('.pro_price s').text('.'+pprice[1]);
	})
	
	$(".close_pro").click(function(){
		$(".liveProListBox").addClass("fn-hide");
		$(".livePro").removeClass("fn-hide");
	});
	
	
	// $("#mine").hover(function(){
	// 	$('html').addClass("noscroll");
	// },function(){
	// 	$('html').removeClass("noscroll");
	// })
	
	// 改变支付方式
	$(".changePay").click(function(){
		var userid = $.cookie(cookiePre + "login_user");
        if (userid == null || userid == "") {
            window.location.href = masterDomain+'/login.html';
            return false;
        }

        var data = [];
        data.push("liveid="+id);
        data.push("amount="+livemoney);
        data.push("paytype=wxpay");
        data.push("qr=1");

        $.ajax({
            url:'/include/ajax.php?service=live&action=livePay',
            data:data.join('&'),
            type:'GET',
            dataType:'json',
            success:function (data) {
                if(data.state == 100){
                	info = data.info;
					orderurl = info.orderurl;
					if(typeof (info) != 'object'){
						location.href = info;
						return false;
					}
					if(info.timeout){
						cutDown = setInterval(function () {
							$(".payCutDown").html(payCutDown(info.timeout));
						}, 1000)
					}else{
						$(".payInfoShow p").hide()
					}

					

					var datainfo = [];
					for (var k in info) {
						datainfo.push(k + '=' + info[k]);
					}
					$("#amout").text(info.order_amount);
					$('.payMask').show();
					$('.payPop').show();

					if (usermoney * 1 < info.order_amount * 1) {

						$("#moneyinfo").text('余额不足，');
					}

					if(monBonus * 1 < info.order_amount * 1  &&  bonus * 1 >= info.order_amount * 1){
						$("#bonusinfo").text('额度不足，可用');
						$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
					}else if( bonus * 1 < info.order_amount * 1){
						$("#bonusinfo").text('余额不足，');
						$("#bonusinfo").closest('.check-item').addClass('disabled_pay')
					}else{
						$("#bonusinfo").text('');
						$("#bonusinfo").closest('.check-item').removeClass('disabled_pay')
					}

					ordernum  = info.ordernum;
					order_amount = info.order_amount;

					$("#ordertype").val('');
					$("#service").val('live');
					service = 'live';
					var src = masterDomain + '/include/qrPay.php?' + datainfo.join('&');
					$('#payQr img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

                }
            }
    	})
	});


    $('.intro  span').click(function () {
        $(this).addClass('curr').siblings().removeClass('curr');
        var i = $(this).index();
        $('.filter .container').eq(i).addClass('show').siblings().removeClass('show');
    });
    
    
    $('.conBox .conList li').hover(function () {
        $(this).find('.code_bg').show();
    },function () {
        $(this).find('.code_bg').hide();
    });

    //点击关注
    function follow(id){
		// $.post("/include/ajax.php?service=member&action=followMember&for=live_anchor&id="+id, function(){
		// });
		$.post("/include/ajax.php?service=member&action=followMember&id=" + id);
	}
    $('#follow').click(function (e) {
        var t = $(this),id=t.attr('data-id');
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            huoniao.login();
            return false;
        }

        if(!t.hasClass("curr")){
            t.addClass("curr");
            t.find('.txt').html('已关注');
			t.attr('title','取消关注');
            $(this).parent().find('.appo_sec').show();
            fadeOut();
            follow(id);
            var num = $("#follow .num").attr('data-num');
            num = parseInt(num) + 1;
			$("#follow .num").attr('data-num',num)
            $("#follow .num").html(num>10000?((num/10000).toFixed(2))+"w":num);
        }else {
			
            $(this).parent().find('.appo_cancel').show();
            $(document).one("click",function(){
				$('.appo_cancel').fadeOut()
			});
			
        }
		e.stopPropagation();
        
    });
    $('#gz_sure').click(function () {
        $(this).parents('.gz').find('.follow').removeClass("curr");
        $(this).parents('.gz').find('.txt').html('关注');
		$('#follow').attr('title','关注主播');
        $(this).parents('.appo_cancel').fadeOut();
        var id = $(this).parents('.gz').find('.follow').attr("data-id");
        follow(id);
        var num = $("#follow .num").attr('data-num');
        num = parseInt(num) - 1;
		$("#follow .num").attr('data-num',num);
        $("#follow .num").html(num>10000?(num/10000)+"w":num);
    });

    $('#gz_cancel').click(function () {
        $(this).parents('.appo_cancel').fadeOut();
    });

    // 验证邀请码
    $('.invite-box .btn a.sure').click(function (e) {
        var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
            window.location.href = masterDomain+'/login.html';
            return false;
        }

        e.preventDefault();
        var invite = $('#invite').val();
        var msg;
        if(invite==''){
            msg = "请输入邀请码";
            $('#inv-msg').html(msg);
			$("#invite").attr("placeholder","")
            return false;
        }

        var url = $("#pForm").attr('action'), data = $("#pForm").serialize();

        $.ajax({
			url: url,
			data: data,
			type: "POST",
			dataType: "html",
			success: function (data) {
                if(data!='密码错误'){
					$(".tip-box,.dalogo").removeClass("pop-show");
					$(".play-success").addClass("pop-show");
					$("body div").removeClass("noClick");
					setTimeout(function(){
						$(".play-success").removeClass("pop-show");
						location.reload();
					},1500)
                }else{
                    $('#inv-msg').html('！'+data);
					$("#invite").val('').attr('placeholder','')
                }
            },
			error: function(){
				alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
            }
        });

    });
	$("#invite").focus(function(){
		$("#invite").val('').attr('placeholder','输入邀请码');
		$('#inv-msg').html('');
	});
	
	// 关闭弹窗
	$(".close_pop").click(function(){
		var t = $(this);
		$('.tip-box,.dalogo').removeClass("pop-show");
	})

    // 去支付
    $('.play-box .btn a.sure').click(function () {
        var userid = $.cookie(cookiePre + "login_user");
        if (userid == null || userid == "") {
            window.location.href = masterDomain+'/login.html';
            return false;
        }

        var data = [];
        data.push("liveid="+id);
        data.push("amount="+livemoney);
        data.push("paytype=wxpay");
        data.push("qr=1");

        $.ajax({
            url:'/include/ajax.php?service=live&action=livePay',
            data:data.join('&'),
            type:'GET',
            dataType:'json',
            success:function (data) {
                if(data.state == 100){

                    $(".play-money").addClass('pop-show');
                    $('.play-box').removeClass('pop-show');

                    var param = [], info = data.info;
                    for (var k in info) {
                        param.push(k + '=' + info[k]);
                    }

                    var src = masterDomain + '/include/qrPay.php?' + param.join('&');
                    $('.play-money .code img').attr('src', masterDomain + '/include/qrcode.php?data=' + encodeURIComponent(src));

                    //验证是否支付成功，如果成功跳转到指定页面
                    if (refreshTopTimer != null) {
                        clearInterval(refreshTopTimer);
                    }

                    refreshTopTimer = setInterval(function () {

                        $.ajax({
                            type: 'POST',
                            async: false,
                            url: '/include/ajax.php?service=member&action=tradePayResult&type=3&order=' + info['ordernum'],
                            dataType: 'json',
                            success: function (str) {
                                if (str.state == 100 && str.info != "") {
                                    clearInterval(refreshTopTimer);
                                    $(".play-money").removeClass('pop-show');
                                    $('.dalogo').hide();
                                    $('.play-success').fadeIn();
                                    setTimeout(function () {
                                        $('.play-success').fadeOut();
                                    },1500);
                                } else if (str.state == 101) { //订单不存在
                                    console.log(langData['siteConfig'][21][162]);
                                }
                            }
                        });

                    }, 2000);

                }else{
                    alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
                }
            }
        });

        

    });





	var mouseOn = 0;
	$(".anchorBox").hover(function(){
		mouseOn = 1;
	},function(){
		mouseOn = 0;
	})
    //聊天室点击详情
    $('.play_r .room .collapsing .rank-list ul.list li  .name').hover(function () {
		clearTimeout(clearTime)
        var h1 = $(this).parents('.collapsing').offset().top;
        var h2 = $(this).offset().top;
        var h = h2-h1+35;
        $('#anchorBox').attr('style','top:'+h+'px');
        $('#anchorBox i.jian').attr('style','left:10%');
        $('#anchorBox').show();
        //点击区域以外地方影藏该区域
        $(document).click(function(){
            $('#anchorBox').hide();
        });
        event.stopPropagation();
        anchorId = $(this).attr('data-id')
        getAnchor(anchorId);
    },function(){
		clearTime = setTimeout(function(){
			if(!mouseOn){
				$('#anchorBox').hide();
			}
		},1500)
	});
    var clearTime = '';
    $('.play_r .room .collapsing .rank-list .th-item:nth-child(1) .img_box,.play_r .room .collapsing .rank-list .th-item:nth-child(1) .info .name').hover(function () {
		clearTimeout(clearTime)
        $('#anchorBox').attr('style','top:126px;left:100px');
        $('#anchorBox i.jian').css({
        	'left':'40%',
        });
        $('#anchorBox').show();
        $(document).click(function(){
            $('#anchorBox').hide();
        });
        event.stopPropagation();
        anchorId = $(this).parents('.th-item').attr('data-id')    
        getAnchor(anchorId);
    },function(){
		clearTime = setTimeout(function(){
			if(!mouseOn){
				$('#anchorBox').hide();
			}
		},1500)
	});
    $('.play_r .room .collapsing .rank-list .top-three .th-item:nth-child(2)  .img_box,.play_r .room .collapsing .rank-list .th-item:nth-child(2) .info .name').hover(function () {
		clearTimeout(clearTime)
		$('#anchorBox').attr('style','top:126px;left:48px');
		$('#anchorBox i.jian').attr('style','left:15%');
        $('#anchorBox').show();
        $(document).click(function(){
            $('#anchorBox').hide();
        });
		
        event.stopPropagation();
        anchorId =$(this).parents('.th-item').attr('data-id')
        getAnchor(anchorId);
		
    },function(){
		clearTime = setTimeout(function(){
			if(!mouseOn){
				$('#anchorBox').hide();
			}
		},1500)
	});
    $('.play_r .room .collapsing .rank-list .top-three .th-item:nth-child(3) .img_box,.play_r .room .collapsing .rank-list .th-item:nth-child(3) .info .name').hover(function () {
		clearTimeout(clearTime)
        $('#anchorBox').attr('style','top:126px;left:120px');
        $('#anchorBox i.jian').css({
        	'left':'90%',
        })
        $('#anchorBox').show();
        $(document).click(function(){
            $('#anchorBox').hide();
        });
        event.stopPropagation();
        anchorId = $(this).parents('.th-item').attr('data-id')
        console.log(anchorId);
        getAnchor(anchorId); 
    },function(){
		clearTime = setTimeout(function(){
			if(!mouseOn){
				$('#anchorBox').hide();
			}
		},1500)
	});
	
    function getAnchor(anchorId) {
        $.ajax({
            url:'/include/ajax.php?service=live&action=getUserInfo&id='+anchorId+'',
            type:'GET',
            dataType:'json',
            success:function (data) {
                if(data.state == 100){
                    var html = [],data=data.info;

                        html.push('<div class="img_box"><div class="img"><img src="'+huoniao.changeFileSize(data.photo, "small")+'" alt=""></div><i></i></div>');
                        html.push('<p class="name">'+data.nickname+'</p>');
                        html.push('<p class="num"><span class="z_num">直播 '+data.livenum+'</span><span>粉丝 '+data.totalFans+'</span></p>');
                        html.push('<p class="ID"><i></i>'+data.userid+'</p>');
                        html.push('<p class="btn"><a target="_blank" href="'+masterDomain+'/user/'+data.userid+'">Ta的主页 ></a></p>');

                    $("#anchorBox .anchor").html(html.join(""));
                }else{
                    $("#anchorBox .anchor").html('<div class="loading">'+data.info+'</div>');
                }
            }
        });
    }

    function fadeOut(){
        setTimeout(function () {
            $('.appo_sec').fadeOut();
        },1500);
    }


    // 聊天室
    // $('.play_r .room .room-hd ul.rank-tab li').click(function () {
    //     $(this).toggleClass('curr').siblings().removeClass('curr');
    //     var i = $(this).index();
    //     $('.collapsing .rank-list').eq(i).toggleClass('show').siblings().removeClass('show');

    // });
	
	$('.play_r .room .room-hd ul.rank-tab li').hover(function(){
		$(this).addClass('curr').siblings().removeClass('curr');
		var i = $(this).index();
		$('.collapsing .rank-list').eq(i).addClass('show').siblings().removeClass('show');
		$(".room-hd-bg").addClass("show")
	},function(){})
	
	
	
    $('.play_r .room .room-hd ul.rank-tab').click(function () {
        if($('.play_r .room .room-hd ul').find('.curr').length==0){
            $('.play_r .room .room-hd .room-hd-bg').removeClass('show');
        }else{
            $('.play_r .room .room-hd .room-hd-bg').addClass('show');
        }

    });
	
	$(".room-hd").hover(function(){
		$('.play_r .room .room-hd .room-hd-bg').hover(function(){
			$(".collapsing .rank-list").removeClass("show");
			$('.play_r .room .room-hd .room-hd-bg').removeClass('show');
			$('.play_r .room .room-hd ul.rank-tab li').removeClass('curr');
		})
	},function(){
		 $(".collapsing .rank-list").removeClass("show");
		 $('.play_r .room .room-hd .room-hd-bg').removeClass('show');
		 $('.play_r .room .room-hd ul.rank-tab li').removeClass('curr');
	})
	
  //   $('.play_r .room .room-hd .bottom_bar').click(function () {

		// if($(".collapsing .rank-list.show").size()>0){
		// 	$(".collapsing .rank-list").removeClass("show");
		// 	$('.play_r .room .room-hd .room-hd-bg').removeClass('show');
		// 	$('.play_r .room .room-hd ul.rank-tab li').removeClass('curr');
		// 	console.log('11')
		// }else{
		// 	$('.collapsing .invite-list').addClass('show');
		// 	$('.play_r .room .room-hd ul.rank-tab li.invite').addClass('curr');
		// 	$('.play_r .room .room-hd .room-hd-bg').addClass('show');
		// 	console.log('22')
		// }
         
  //   });
	
	//计算输入的字数
	$(".jubaoBox .txtbox ").bind('input propertychange', 'textarea', function() {
		var length = 100;
		var content_len = $(".jubaoBox textarea").val().length;
		var in_len = length - content_len;
		if (content_len >= 100) {
			$(".jubaoBox textarea").val($(".jubaoBox textarea").val().substring(0, 100));
		}
		$('.jubaoBox .num_txt').text($(".jubaoBox textarea").val().length+"/100");
	});
	
	
	$(".jubaoBox .check_box li").click(function(){
		var t = $(this);
		t.toggleClass("chosed")
	});
	
	$(".report_btn").bind("click", function(){
	    $(this).find(".jubaoBox").show();
	});
	$(".jubaoBox .close_btn").click(function(e){
		$(".report_btn .jubaoBox").css("display","none");
		e.stopPropagation()
	})


	// 发红包
	$(".hb_send").click(function(){
		$('html').addClass("noscroll");
		$(".mask_fhb,.fahb_box").show();
		$(".hb_confirm").addClass("fn-hide");
		$(".hbin_box").removeClass("fn-hide");
	});
	
	$(".hb_input input").bind('input propertychange',function(){
		var t = $(this);
		var val = t.val();
		if(val!=''){
			t.siblings('i').show();
		}else{
			t.siblings('i').hide();
		}
	})
	$(".ht_input input").focus(function(){
		$(".ht_input").addClass('full');
	})
	$(".ht_input input").blur(function(){
		var t = $(this);
		var val = t.val();
		if(val!=''){
			$(".ht_input").addClass('full');
		}else{
			$(".ht_input").removeClass('full');
		}
	})
	// $(".ht_input input").bind('input propertychange',function(){
	// 	var t = $(this);
	// 	var val = t.val();
	// 	if(val!=''){
	// 		$(".ht_input").addClass('full');
	// 	}else{
	// 		$(".ht_input").removeClass('full');
	// 	}
	// });
	
	$(".btn_sai").click(function(){
		hm_num = $(".hbm_input input").val(); //红包钱数
		hb_num = $(".hbn_input input").val(); //红包个数
		if(hm_num == ''){
			showMsg('请输入红包数目');
			return false;
		}else if(hb_num == ''){
			showMsg('请输入红包个数');
			return false;
		}
		$(".hbin_box").addClass("fn-hide");
		$(".hb_confirm").removeClass("fn-hide");
		
	});
	
	// 红包字数
	$(".ht_input").bind('input propertychange', 'input', function() {
		var length = 20;
		var content_len = $("#hb_txt").val().length;
		var in_len = length - content_len;
		if (content_len >= 20) {
			$("#hb_txt").val($("#hb_txt").val().substring(0, 20));
		}
		$('.ht_input em').text($("#hb_txt").val().length+"/20");
	});
	
	// 抢红包
	$("body").delegate(".user_hb","click",function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
		    huoniao.login();
		    return false;
		}
		$("html").addClass("noscroll");
		$(".mask_hb").show();
		$(".hbBox").removeClass("open");
		$(".hb_qiang,.hb_to,.no_hb").addClass("fn-hide");
		
		var t = $(this),
		h_id = t.attr("data-liveid"),
		state = t.attr("data-state");
		if (state == 1) {
			var info = getHongBaoInfo(h_id);
			showHongBaoAfter(info);
			$(".hbBox").show();
			return;
		} else if (state == 2) {
			/*已经抢过 展示抢到的结果*/
			var info = getHongBaoInfo(h_id);
			showHongBaoAfter(info);
			console.log(info)
			//$(".hb_qiang").removeClass("fn-hide");
			//$(".hb_nick em").text(info.hongbao.user.nickname);  //发红包人的昵称
			
			$(".hbBox").show();
			//$(".hbBox .hb_fa .hb_img").find('img').attr('src', info.hongbao.user.photo);  //发红包人的头像
			//$(".hbBox").addClass('open');
			//$(".hb_money em").text(info.hongbao.amount)
		} else {
			 $(".hbBox .qiang").attr("data-id", h_id);
			/*让红包显示*/
			var info = getHongBaoInfo(h_id);
			$(".hb_nick em").text(info.hongbao.user.nickname);  //发红包人的昵称
			 $('.hb_text').text(info.hongbao.note==''?"恭喜发财，大吉大利！":info.hongbao.note)
			$(".hbBox").show();
			$(".hbBox .hb_fa .hb_img").find('img').attr('src', info.hongbao.user.photo);  //发红包人的头像
			$(".hb_info .hb_to").removeClass("fn-hide");
			$(".hb_money em").text(info.hongbao.amount)
			$(".hb_info .hb_num").text("共"+info.hongbao.count+"个");  //红包个数
		}
		
	});
	$(".ds_btn").hover(function(){
		$(this).find('img').attr('src',templets+'images/hn_png1.png')
		
	},function(){
		$(this).find('img').attr('src',templets+'images/hb_png.png')
	})
	/*点击 抢*/
	$(".qiang").click(function() {
		var t = $(this);
		var h_id = t.attr("data-id");
		getHongBao(t, h_id);
		$(".user_hb[data-liveid='"+h_id+"']").removeClass("hongbao_bg_01").addClass("hongbao_bg_02");
		$(".user_hb[data-liveid='"+h_id+"']").find(".rb_info p").text('红包已领取')
	});
	// 没抢到 查看
	$(".no_hb .go_link,.hb_detail").click(function(){
		$(".hbBox").addClass("open")
	})
	
	// 关闭红包
	$(".hbBox .close_btn").click(function(){
		$(".hbBox,.mask_hb").hide();
		$('html').removeClass("noscroll");
	})
	
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
	
	function showHongBaoAfter(info) {
		if (info.user == undefined) {
			$(".hb_m_number").text('0');
			$(".no_hb").removeClass("fn-hide");
			$(".hb_qiang,.hb_to").addClass("fn-hide");
			$(".hb_num").text("共"+info.hongbao.count+"个")
			$(".hb_money em").text(info.hongbao.amount)
			/*自己没抢到*/
		} else {
			$(".hb_to,.no_hb").addClass("fn-hide");
			$(".hb_qiang").removeClass("fn-hide")
			$(".hb_money em").text(info.user.recv_money);
			// $(".hbBox").addClass("open")
		}
		
		$(".hb_nick em").text(info.hongbao.user['nickname']);
		/*发红包的人昵称*/
		$(".hb_fa .hb_img img").attr("src", info.hongbao.user['photo']);
		/*发红包的人头像*/
		var yilq = info.list.length;  //抢红包的人
		var zongg = info.hongbao.count;
		$('.hb_text').text(info.hongbao.note==''?"恭喜发财，大吉大利！":info.hongbao.note)
		$(".hb_left").text(yilq);
		/*已抢多少人*/
		$(".hb_all").text(info.hongbao.count);
		/*总共多少个*/
		var ylq_y = 0;
		var list_h = '';
		for (var i = 0; i < yilq; i++) {
			ylq_y += info.list[i].recv_money * 1;
			list_h +='<li class="fn-clear"><div class="head"><img src="' + info.list[i].user.photo + '"></div><div class="r_dtail"><h4 class="fn-clear"><span class="fn-left" title="' + info.list[i].user.nickname + '">' + info.list[i].user.nickname + '</span><em  class="fn-right">' + info.list[i].recv_money + echoCurrency('short')+'</em></h4><p>'+ info.list[i].date + '</p></div></li>'
		}
		$(".hb_leftmoney").text((info.hongbao.amount-info.hongbao.amount1).toFixed(2));
		/*已抢多少钱*/
		$(".hb_allmoney").text(info.hongbao.amount);
		/*红包总额*/
		/*抢红包列表*/
		$(".hbget_box ul").html(list_h);
		$(".get_num").text(yilq);
		$(".all_num").text(info.hongbao.count);
		
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
						$(".hongbao").attr("data-state", 2);
						$(".user_hb[data-liveid='"+h_id+"']").attr("data-state", 2);
						/*已经领过*/
	
					} else if (data.info.states == 201) {
						/*抢完*/
						$(".hb_receive").css('display', 'block');
						$(".hb_qiang img").hide();
						$(".hb_slogan").text("已抢完");
						$(".hb_receive").attr("data-hid", h_id);
						
						$(".disk_02").show();
						//$(".hb_img").show();
	
					} else {
	
						if (data.info.is_fin == 1 && data.info.states == 203) {
							var info = getHongBaoInfo(h_id);
							showHongBaoAfter(info);
							//$('.hb_img').hide();
							$('.disk_02').hide();
							$(".hongbao").attr("data-state", 2);
							
							/*已经领过*/
	
							/*已抢完*/
							$(".user_hb[data-liveid='"+h_id+"']").attr("data-state", 1).removeClass('hongbao_bg_01').addClass('hongbao_bg_02');
						//	$(".hongbao").removeClass('hongbao_bg_01').addClass('hongbao_bg_02').attr("data-state", 1);
	
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
	
	//提示窗
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

	// 打赏
	$(".ds_btn").click(function(){
		
		$("html").addClass("noscroll");
		$(".mask_ds,.ds_box").show();
		$(".ds_num").removeClass("fn-hide");
		$(".ds_confirm").addClass("fn-hide");
	});
	
	$(".self_num input").bind("input propertychange",function(){
		var val = $(this).val();
		if(isNumber(val) && val!='' && val<8888888){
			console.log(val*1)
			$(".ds_num h5 em").text((val*1).toFixed(2))
		}else{
			showMsg("请输入数字");
			if(val==''){
				$(".ds_num h5 em").text(8.8);
			}
			
			return false;
		}
	});
	
	$(".dsBtn").click(function(){
		$(".ds_num").addClass("fn-hide");
		$(".ds_confirm").removeClass("fn-hide");
		var ds_num = $(".ds_num h5 em").text();
		$(".ds_confirm .right_num h5 em").text(ds_num)
	});
	
	$(".link_btn .back_btn").click(function(){
		$(".ds_confirm").addClass("fn-hide");
		$(".ds_num").removeClass("fn-hide");
	})
	
	// 关闭打赏框
	$('.ds_box .close_btn,.mask_ds').click(function(){
		$(".ds_box,.mask_ds").hide();
		$('html').removeClass("noscroll");
	});
	
	// 关闭发红包
	$(".mask_fhb,.fahb_box .close_btn").click(function(){
		$(".mask_fhb,.fahb_box").hide();
		$('html').removeClass("noscroll");
	});
	
	// 打赏礼物
	$(".show_detail .liwu_num").delegate("li","click",function(){
		var t = $(this), p = t.parents(".show_detail");
		t.addClass("on_chose").siblings("li").removeClass("on_chose");
		var singlePrice = p.find(".right_info").attr("data-price")//单价
		if(t.hasClass("self_define")){
			$(".self_define input").bind("input propertychange",function(){
				var val = $(this).val();
				p.find(".num_show em").text(val);
				p.find(".price_count em").text((singlePrice*val).toFixed(2)+"积分")
			})
		}else{
			p.find(".num_show em").text(t.text());
			p.find(".price_count em").text((singlePrice*t.text()).toFixed(2)+"积分")
		}
	});
	
	// 查看所有礼物
	var allShow = 0;
	$(".all_gift").click(function(e){
		if($(this).parents('.right_tool').hasClass('noClick')) return false;
		$(".allgift_box").show();
		allShow = 1;
		$(document).one('click',function(){
			$(".allgift_box").hide();
			allShow = 0
		});
		e.stopPropagation();
	});
	
	$(".all_gift").hover(function(){
		$(".allgift_box").show();
	},function(){
		if(!allShow){
			$(".allgift_box").hide();
			// var cleartime1 = setTimeout(function(){
				
			// },1000);
			// $(".allgift_box").hover(function(){
			// 	clearTimeout(cleartime1)
			// },function(){
			// 	if(!allShow){
			// 		$(".allgift_box").hide();
			// 	}
			// })
		}
	})
	
	
	// 关闭所有礼物
	$(".liveToolbar .allgift_box .close_btn").click(function(){
		$(".allgift_box").hide();
		allShow = 0;
		return false;
	});
	
	$(".gift_box li").click(function(){
		var t = $(this);
		var singlePrice = t.attr("data-price");   //单价
		var giftName = t.find(".mlbn-present-zan-name").text();  //礼物名
		var giftNum = $(".allgift_box .chose_info .num_show em").text(); // 个数
		t.addClass("li_chosed").siblings("li").removeClass("li_chosed");
		$(".price_count span").text(giftName);
		$(".price_count em").text((giftNum*singlePrice).toFixed(2)+"积分");
	});
	$(".allgift_box .liwu_num li").click(function(){
		var t = $(this),p = t.parents(".send_box");
		var singlePrice = $(".allgift_box .li_chosed").attr("data-price");   //单价
		var giftName = $(".allgift_box .li_chosed").find(".mlbn-present-zan-name").text();  //礼物名
		var giftNum = $(".allgift_box .chose_info .num_show em").text(); // 个数
		t.addClass("on_chose").siblings("li").removeClass("on_chose")
		if(t.hasClass("self_define")){
			$(".self_define input").bind("input propertychange",function(){
				var val = $(this).val();
				p.find(".num_show em").text(val);
				p.find(".price_count em").text((singlePrice*val).toFixed(2)+"积分")
			})
		}else{
			p.find(".num_show em").text(t.text());
			p.find(".price_count em").text((singlePrice*t.text()).toFixed(2)+"积分")
		}
	});
	
	// 收藏直播
	$(".shou_btn").click(function(){
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
		    huoniao.login();
		    return false;
		}
		var t = $(this);
		if(t.hasClass("shou")){
			t.removeClass("shou");
			t.find('em').text("收藏")
		}else{
			t.addClass("shou");
			t.find('em').text("已收藏")
		}
	})
	
	
	function isNumber(val){
	    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
	    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
	    if(regPos.test(val) || regNeg.test(val)){
	        return true;
	    }else{
	        return false;
	    }
	}
	
	
	//提交
		$(".jb_btn").bind("click", function(event){
			event.preventDefault();
	
	
			var t = $(this), check = true;
			var type = $(".check_box li.chosed span").text();
			//var areaIcode = t.closest(".form").find(".areaCode");
			//var areaCode = areaIcode.find("i").text().replace('+', '');
			if($(".check_box li.chosed").size() == 0){
				showMsg("请选择举报类型");
				check = false;
			}
	// 		var phone = $("#phone");
	// 		if(phone.val() == ""){
	// 			phone.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+phone.attr("data-title"));
	// 			check = false;
	// 		}
	// 		var vdimgck = $("#vdimgck");
	// 		if(vdimgck.val() == ""){
	// 			vdimgck.siblings(".tip-inline").removeClass().addClass("tip-inline error").html("<s></s>"+vdimgck.attr("data-title"));
	// 			check = false;
	// 		}
	
			if(!check) return false;
			t.attr("disabled", true).html(langData['siteConfig'][6][35]+"...");   //提交中
	
			$.ajax({
				url: "/include/ajax.php",
				data: {
					"service": "member",
					"template": "complain",
					"module": 'live',
					"dopost": dopost,
					"aid": aid,
					"type": type,
					"desc": $(".txtbox textarea").val(),
				},
				type: "POST",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						alert(langData['siteConfig'][21][242]);   //举报成功！
	
						setTimeout(function(){
							$(".jubaoBox").hide();
						}, 500);
	
					}else{
						alert(data.info);
						t.attr("disabled", false).html(langData['siteConfig'][6][151]);  //提交
	
						if(data.state == 101){
							setTimeout(function(){
								$(".jubaoBox").hide();
							}, 500);
						}
					}
				},
				error: function(){
					alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
					t.attr("disabled", false).html(langData['siteConfig'][6][151]);  //提交
				}
			});
	
		});
		
		// 显示小视频
		var flagvideo = 0;
		$(window).scroll(function(){
			var sch = $(window).scrollTop();
			var top = $(".liveToolbar").offset().top
			if(!flagvideo && live_state != '0' && $("#J_prismPlayer").size()>0){
				if(sch > top){
					$(".svideo_box").append($('.videoBox .content_main'))
					$(".svideo_box").show();
				}else{
					$('.videoBox').prepend($('.svideo_box .content_main'))
					$(".svideo_box").hide();
				}
				
			}
			
		});
		
		// 关闭小窗口
		$(".svideo_box .close_video").click(function(){
			flagvideo = 1;
			$('.videoBox').prepend($('.svideo_box .content_main'))
			$(".svideo_box").stop().hide();
		});
		
		
		// 预约直播
		$(".yue_btn").click(function(){
			var userid = $.cookie(cookiePre+"login_user");
			 if(userid == null || userid == ""){
				window.location.href = masterDomain+'/login.html';
				return false;
			}
			var t =$(this);
			$.ajax({
					url: "/include/ajax.php?service=live&action=liveBooking&aid="+id,
					type: "GET",
					dataType: "json", //指定服务器返回的数据类型
					success: function (data) {
					 if(data.state == 100){
						if(!t.hasClass('yued')){
							t.addClass('yued');
							t.find('em').text('已预约');
							showMsg("预约成功");
						}else{
							t.removeClass('yued');
							t.find('em').text('预约');
							showMsg("已取消预约");
						}
					 }else{
						alert(data.info)
					 }
					},
					error:function(err){
						console.log('fail');
					}
			});
		});
		
		
		// showBigImg();
		
		$('body').on('click', '.close', function() {
		    $('.slide-box').hide();
		})
		function showBigImg(src) {
			    $('.slide-box').remove();
			    var slide=[],html=[],slide2;
				var i = 0
				$(".tw_info .item .img_box li").each(function(){
					var pic = $(this).find('img').attr('src');
					var txt = $(this).attr('data-text'); 
					var m=i+1;
					slide.push('<a href="javascript:;" data-bigpic="'+pic+'" data-title="'+txt+'">');
					slide.push('<img src="'+pic+'" alt="">');                        
					slide.push('<div>');                        
					slide.push('<span class="atpage" id="atpage">'+m+'</span>/<span class="tpage" id="tpage">'+($(".tw_info .item .img_box li").length)+'</span>');                        
					slide.push('</div>');                        
					slide.push('</a>');  
					slide2 = slide.join("");
					i = i+1;
				})
					
					
					html.push('<div class="slide-box">');
					html.push('<div class="slide">');
					html.push('<span class="close"><img src="'+templets+'images/close.png"></span>');
					html.push('<div class="slide-text"><span>直播动态</span><em></em></div>');
					html.push('<div class="slide-title">动态图片</div>')
					html.push('<div id="slide_big">');
					html.push('</div>');
					html.push('<a href="javascript:;" class="prev" id="slidebtn_prev"><s></s></a>');
					html.push('<a href="javascript:;" class="next" id="slidebtn_next"><s></s></a>');
					html.push('<div class="live_info"><span>'+typename+'</span><span>'+look_num+'人观看</span></div>')
					html.push('<div id="slide_small">');
					// html.push('<div class="prevbox l">');
					// html.push('<img src="">');
					// html.push('<div class="span-bg">');
					// html.push('<b>上一套</b><span></span>');
					// html.push('</div>');
					// html.push('</div>');
					html.push('<div class="spbox">');
					html.push('<div class="picsmall fn-clear">');
					html.push(slide2);			          
					html.push('</div>');
					html.push('</div>');
					// html.push('<div class="prevbox r">');
					// html.push('<img src="">');
					// html.push('<div class="span-bg">');
					// html.push('<b>下一套</b><span></span>');
					// html.push('</div>');
					// html.push('</div>');
					html.push('<a href="javascript:;" class="prev disabled" id="slidebtn2_prev"><s></s></a>');
					html.push('<a href="javascript:;" class="next" id="slidebtn2_next"><s></s></a>');
					html.push('</div>');
					html.push('</div>');
					html.push('</div>');

					 $('body').append(html.join(""));  
					 $('.prevbox').hide();
					// if(prevId != undefined){
					// 	var prevImgSrc = $('#' + prevId).find('img').attr('src');
					// 	var prevText = $('#' + prevId).find('p.name').text();
					// 	$('.prevbox.l').css('display', 'inline-block');
					// 	$('.prevbox.l').find('img').attr('src', prevImgSrc);
					// 	$('.prevbox.l').find('span').text(prevText);
					// 	$('.prevbox.l').attr('data-id', prevId);
					// }
					// if(nextId != undefined){
					// 	var nextImgSrc = $('#' + nextId).find('img').attr('src');
					// 	var nextText = $('#' + nextId).find('p.name').text();
					// 	$('.prevbox.r').css('display', 'inline-block');
					// 	$('.prevbox.r').find('img').attr('src', nextImgSrc);
					// 	$('.prevbox.r').find('span').text(nextText);
					// 	$('.prevbox.r').attr('data-id', nextId);
					// }
					$('.slide-box').show();
					//幻灯
					$('.slide').picScroll();
					$(".picsmall a[data-bigpic='"+src+"']").click()
		    
			}
		

});