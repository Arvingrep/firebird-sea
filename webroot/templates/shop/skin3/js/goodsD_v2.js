var showAlertErrTimer;
var cutDownArr = {}

function showErrAlert(data, dom) {
	showAlertErrTimer && clearTimeout(showAlertErrTimer);
	$(".popErrAlert").remove();
	if (dom && $(dom).length > 0) {
		$(dom).append('<div class="popErrAlert"><p>' + data + '</p></div>');
	} else {
		$("body").append('<div class="popErrAlert"><p>' + data + '</p></div>');
	}

	$(".popErrAlert p").css({
		"margin-left": -$(".popErrAlert p").width() / 2,
		"left": "50%"
	});
	$(".popErrAlert").css({
		"visibility": "visible"
	});
	showAlertErrTimer = setTimeout(function () {
		$(".popErrAlert").fadeOut(300, function () {
			$(this).remove();
		});
	}, 1500);
}
$(function () {

    if ($('video').length > 0) {
        $("video").attr('playsinline', true);
        var players = Plyr.setup('video', {
            // enabled: !/Android|webOS|BlackBerry/i.test(a),
            update: !0,
            controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "fullscreen"],
            fullscreen: {
                enabled: !0,
                fallback: !0,
                iosNative: !0
            }
        });
    }

	// 进店逛逛
	$(".storeImg ,.storeInfo").click(function (e) {
		if (e.target != $(".storeInfo .chat_btn")[0]) {
			window.open($('.toshop').attr('href'))
		}
	})


	//判断返积分状态 如果是关闭的就是没有
	if ($(".newqbox>div").length == 0) {
		$(".q_li").hide()
	}
	// 已经拼单列表
	if ($('.pindanListBox').size() > 0) {
		$.ajax({
			type: "GET",
			url: "/include/ajax.php",
			dataType: "json",
			data: 'service=shop&action=pinuserList&tid=' + huodongid + '&pageSize=20',
			success: function (data) {

				if (data.state == 100 && data.info.list.length > 0) {
					var tcNewsHtml = [],
						list = data.info.list;

					for (var i = 0; i < list.length; i++) {
						tcNewsHtml.push('<li data-id="'+list[i].id+'"><div class="orderInfo fn-clear">');
						tcNewsHtml.push('<div class="buyer left"><div class="headIcon">');
						tcNewsHtml.push('<img src="' + list[i].photo + '" alt="" onerror="javascript:this.src=\'' + staticPath + 'images/noPhoto_100.jpg\';this.onerror=this.src=\'' + staticPath + 'images/404.jpg\';">');
						tcNewsHtml.push('</div><p>' + list[i].name + '</p></div>');
						tcNewsHtml.push('<div class="right"><h3>还差<span>' + list[i].rest + '人</span>拼成</h3>');
						tcNewsHtml.push('<p class="cuttime" data-id="'+list[i].id+'" data-time="' + list[i].enddate + '" data-now="' + list[i].now + '">剩余00:00:00</p>');
						tcNewsHtml.push('</div></div><a href="javascript:;" class="pindan_btn" data-id="'+list[i].id+'">立即拼单</a></li>');
					}
					$('.pindanListBox h2 span em').html(list.length)
					$('.pindanList').html(tcNewsHtml.join(''));
					$('.pindanListBox').removeClass('fn-hide');

					addCutDown(); //倒计时
				} else {
					$('.pindanListBox').addClass('fn-hide');
				}
			},
			error: function () {
				$('.pindanListBox').addClass('fn-hide');
			}
		});
	}

	function addCutDown(){
		$('.pindanListBox .orderInfo').each(function(){
			let now = $(this).find('.cuttime').attr('data-now');
			let end = $(this).find('.cuttime').attr('data-time');
			let id = $(this).find('.cuttime').attr('data-id');
			let offtime = end-now
			var interval = setInterval(function(){
				pindanCutDown(offtime,id);
				offtime--;
			},1000)
			cutDownArr[id] = interval
		})
	}

	// 倒计时
	function pindanCutDown(offtime,id){
		var h = parseInt(offtime / 60 / 60 % 24);      //计算小时
            h = h < 10 ? '0' + h : h;
            var m = parseInt(offtime / 60 % 60);         //计算分钟
            m = m < 10 ? '0' + m : m;
            var s = parseInt(offtime % 60);            //计算秒数
            s = s < 10 ? '0' + s : s;
            $('.pindanListBox .cuttime[data-id="'+id+'"]').text('剩余'+ h + ':' + m + ':' + s )
            if (offtime <= 0) {
                clearInterval(cutDownArr[id]);                          //1ms
            }


	}


	$('body').delegate('.pindan_btn','click',function(){
		let id = $(this).attr('data-id')
		$('#pinid').val(id)
		var $buy = $(this),
			$li = $(".sys_item_specpara"),
			$ul = $(".singleGoods dd.info"),
			n = $li.length;
		if ($buy.hasClass("disabled")) return false;
		var len = $li.length;
		var spValue = parseInt($(".singleGoods dd var b").text()),
			inputValue = parseInt($(".singleGoods dd input").val());
		//验证登录
		var userid = $.cookie(cookiePre + "login_user");
		if (userid == null || userid == "") {
			huoniao.login();
			return false;
		}

		if ($('#hid').val() != '') {
			$("#ordertype").val($buy.attr('data-name'));
			$("#ordertype").val('fqbuy');
		}
		console.log($("#buyForm").serializeArray())
		if (n > 0) { //有规格
			if ($(".singleGoods").find("a.selected").length == n && inputValue <= spValue) {
				var t = ''; //该商品的属性编码 以“-”链接个属性
				$(".sys_item_specpara").each(function () {
					var $t = $(this),
						y = $t.find("a.selected").attr("attr_id");
					t = t + "-" + y;
				})
				t = t.substr(1);
                var tArr = t.split('-');
				var paramData = sku_conf.data;
				// if(huodongid && sku_conf.pindata && JSON.stringify(sku_conf.pindata) != "{}"){
                if(prohuodongtype == 4){
					paramData = sku_conf.pindata;
				}
				var paramId = paramData && paramData[tArr.join(';')] ? paramData[tArr.join(';')].id : '';
				$("#pros").val(detailID + "," + paramId + "," + inputValue);
				// $("#pros").val(detailID + "," + t + "," + inputValue);
				$("#buyForm").submit();
			} else {
				$ul.addClass("on");
			}
		} else {
			$("#pros").val(detailID + "," + "" + "," + inputValue);
			$("#buyForm").submit();
		}
	})



	// 聊天
	$(".chat_btn").click(function () {
		$(".chat_to-Link").click();
	})
	//导航全部分类
	$(".lnav").find('.category-popup').hide();

	$(".lnav").hover(function () {
		$(this).find(".category-popup").show();
	}, function () {
		$(this).find(".category-popup").hide();
	});

	// 优惠券大log
	$('.quandalog .quanbox .closebtn').click(function () {
		$('.quandalog').hide();
	});
	$('.singleGoods dd.info li .yhquan').click(function () {
		$('.quandalog').show();
	});

	var loadComm = 0;

	//商品列表--商品放大镜
	$(".jqzoom").imagezoom();

	$("#thumblist li a").click(function () {
		var t = $(this);
		$(".pro_show").hide()
		$(this).parents("li").addClass("tb-selected").siblings().removeClass("tb-selected");
		$(".jqzoom").attr('src', $(this).find("img").attr("mid"));
		$(".jqzoom").attr('rel', $(this).find("img").attr("big"));
		var end = t.position().left + t.width() / 2 - $('.thumblistBox').width() / 2;
		var star = $("#thumblist").scrollLeft();
		$('#thumblist').scrollLeft(end + star);
	});


	//商品列表--商品详情页--商品评价的好评中评差评的选择
	$(".detailComment .left a").on("click", function () {
		var $a = $(this),
			i = $a.index();
		$a.addClass("on").siblings("a").removeClass("on");
		// $(".allCon .con").eq(i).show().siblings(".con").hide();
		var scrollTop = $(".allCon .con").eq(i).offset().top;
		$(window).scrollTop(scrollTop - 50)

        if($('.detailComment .left').find('a').length == 4){

        }else{
            if (i == 1) {
                $('.detailCon').hide();
                $('.comentCon').show();
            } else {
                $('.detailCon').show();
                $('.comentCon').hide();
            }
            if (i == 1 && !loadComm) {
                getComments();
            }
        }
	});

	$(".singleGoods .cartBuy .pindan").click(function () {
		$("#pinid").val('')
		var $buy = $(this),
			$li = $(".sys_item_specpara"),
			$ul = $(".singleGoods dd.info"),
			n = $li.length;
		if ($buy.hasClass("disabled")) return false;
		var len = $li.length;
		var spValue = parseInt($(".singleGoods dd var b").text()),
			inputValue = parseInt($(".singleGoods dd input").val());
		//验证登录
		var userid = $.cookie(cookiePre + "login_user");
		if (userid == null || userid == "") {
			huoniao.login();
			return false;
		}

		if ($('#hid').val() != '') {
			$("#ordertype").val($buy.attr('data-name'));
			$("#ordertype").val('fqbuy');
		}
		console.log($("#ordertype").val())
		if (n > 0) { //有规格
			if ($(".singleGoods").find("a.selected").length == n && inputValue <= spValue) {
				var t = ''; //该商品的属性编码 以“-”链接个属性
				$(".sys_item_specpara").each(function () {
					var $t = $(this),
						y = $t.find("a.selected").attr("attr_id");
					t = t + "-" + y;
				})
				t = t.substr(1);
                var tArr = t.split('-');
				var paramData = sku_conf.data;
				// if(huodongid && sku_conf.pindata && JSON.stringify(sku_conf.pindata) != "{}"){
                if(prohuodongtype == 4){
					paramData = sku_conf.pindata;
				}
				var paramId = paramData && paramData[tArr.join(';')] ? paramData[tArr.join(';')].id : '';
				$("#pros").val(detailID + "," + paramId + "," + inputValue);
				// $("#pros").val(detailID + "," + t + "," + inputValue);
				$("#buyForm").submit();
			} else {
				$ul.addClass("on");
			}
		} else {
			$("#pros").val(detailID + "," + "" + "," + inputValue);
			$("#buyForm").submit();
		}
	})


	$(window).scroll(function () {
		var scrtop = $(window).scrollTop();
		var divTop = $(".commentBox").offset().top;
		if (scrtop >= divTop) {
			$(".detailBox").addClass('fixedTop')
		} else {
			$(".detailBox").removeClass('fixedTop')
		}
	})


	//---------------------------异步加载评价列表------------------------------------------

	var atpage = 1,
		totalCount = 0,
		pageSize = 20;
	showPageInfo()
	var ratelist = $(".all-comment"),
		loading = $(".loading"),
		ul = $("#comment-list");

	$(".all-comment .commentSel a").on("click", function () {
		$(this).addClass("on").siblings("a").removeClass("on");
		atpage = 1;
		getComments();
	})

	//初始点击定位当前位置
	$("html").delegate(".carousel .thumb li", "click", function () {
		var t = $(this),
			carousel = t.closest(".carousel"),
			album = carousel.find(".album");
		if (album.is(":hidden")) {
			t.addClass("on");
			$('html, body').animate({
				scrollTop: carousel.offset().top - 45
			}, 300);
			album.show();
		}
	});

	//收起图集
	$("html").delegate(".carousel .close", "click", function () {
		var t = $(this),
			carousel = t.closest(".carousel"),
			thumb = carousel.find(".thumb"),
			album = carousel.find(".album");
		album.hide();
		thumb.find(".on").removeClass("on");
	});

	//获取评价
	getComments();

	function getComments() {

		loading.show();
		ul.html("");
		loadComm = 1;

		var data = [];
		data.push('aid=' + detailID);
		data.push('page=' + atpage);
		data.push('pageSize=' + pageSize);
		data.push('filter=' + $(".all-comment .commentSel .on").data("filter"));

		$.ajax({
			url: masterDomain + "/include/ajax.php?service=member&action=getComment&type=shop-order",
			data: data.join("&"),
			type: "POST",
			dataType: "jsonp",
			success: function (data) {

				loading.hide();
				if (data && data.state == 100) {

					var list = data.info.list,
						pageinfo = data.info.pageInfo,
						html = [];
					totalCount = pageinfo.totalCount;
					var score2 = Number(pageinfo.sco3) + Number(pageinfo.sco4);
					var score3 = Number(pageinfo.sco1) + Number(pageinfo.sco2);

					if ($(".all-comment .commentSel .on").data("filter") == '') {
						$('.score0').html('(' + (pageinfo.sco6 + pageinfo.sco7 + pageinfo.sco8) + ')');
						$('.score1').html('(' + pageinfo.sco6 + ')');
						$('.score2').html('(' + pageinfo.sco7 + ')');
						$('.score3').html('(' + pageinfo.sco8 + ')');
						$('.score4').html('(' + Number(pageinfo.pic) + ')');
					}
					for (var i = 0; i < list.length; i++) {
						var photo = list[i].user.photo == "" ? staticPath + 'images/noPhoto_40.jpg' : list[i].user.photo;
						html.push('<li class="comment_li">');
						html.push('<div class="leftBox">');
						html.push('<div class="headIcon"><img src="' + photo + '" alt="" onerror="this.src=\'/static/images/noPhoto_40.jpg\'"></div>');
						html.push('<h5 class="nickname">' + (list[i].user.nickname ? list[i].user.nickname : "匿名用户") + '</h5></div>');
						html.push('<div class="commCon"><p class="star"><i style="width:' + (list[i].sco1 / 5) * 100 + '%;"></i></p>');
						html.push('<div class="txtcon">' + list[i].content + '</div>');
						// 图集
						var pics = list[i].pics;
						if (list[i].pics.length > 0) {
							var thumbArr = [],
								albumArr = [];
							for (var p = 0; p < pics.length; p++) {
								thumbArr.push('<li class="imgbox"><a href="javascript:;"><img src="' + huoniao.changeFileSize(pics[p], "small") + '" /></a></li>');
								albumArr.push('<div class="aitem"><i></i><img src="' + pics[p] + '" /></div>');
							}
							html.push('<div class="carousel"><div class="thumb"><ul class="imgList fn-clear">');
							html.push(thumbArr.join("") + '</ul>');
							if (pics.length > 7) {
								html.push('<a href="javascript:;" class="sprev"><i></i></a>');
								html.push('<a href="javascript:;" class="snext"><i></i></a>');
							}
							html.push('</div>');
							html.push('<div class="album">');
							html.push('<a href="javascript:;" hidefocus="true" class="prev"></a>');
							html.push('<a href="javascript:;" hidefocus="true" class="close"></a>');
							html.push('<a href="javascript:;" hidefocus="true" class="next"></a>');
							html.push('<div class="albumlist">' + albumArr.join("") + '</div>');
							html.push('</div></div>');
						}
						html.push('<p class="pro_chose"><span class="btime">' + list[i].ftime + '</span>' + list[i].specation + '</p>')
					}

					ul.html(html.join(""));
					showPageInfo();

					//切换效果
					ul.find(".carousel").each(function () {
						var t = $(this),
							album = t.find(".album");
						//大图切换
						t.slide({
							titCell: ".thumb li",
							mainCell: ".albumlist",
							trigger: "click",
							autoPlay: false,
							delayTime: 0,
							startFun: function (i, p) {
								if (i == 0) {
									t.find(".sprev").click()
								} else if (i % 8 == 0) {
									t.find(".snext").click()
								}
							}
						});
						//小图左滚动切换
						t.find(".thumb").slide({
							mainCell: "ul",
							delayTime: 300,
							vis: 10,
							scroll: 8,
							effect: "left",
							autoPage: true,
							prevCell: ".sprev",
							nextCell: ".snext",
							pnLoop: false
						});
					});
					$(".carousel .thumb li.on").removeClass("on");

				} else {
					ul.html('<li class="empty">' + data.info + '</li>');
				}
			},
			error: function () {
				loading.hide();
				ul.html('<li class="empty">' + '网络错误，加载失败！' + '</li>');
			}
		});
	}



	//分页
	function showPageInfo() {
		var info = $(".comment-list .pagination");
		var nowPageNum = atpage;
		var allPageNum = Math.ceil(totalCount / pageSize);
		var pageArr = [];

		info.html("").hide();

		var pages = document.createElement("div");
		pages.className = "pagination-pages fn-clear";
		info.append(pages);

		//拼接所有分页
		if (allPageNum > 1) {

			//上一页
			if (nowPageNum > 1) {
				var prev = document.createElement("a");
				prev.className = "prev";
				prev.innerHTML = '关闭';
				prev.onclick = function () {
					atpage = nowPageNum - 1;
					getComments();
				}
				info.find(".pagination-pages").append(prev);
			}

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
							getComments();
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
					} else {
						var page = document.createElement("a");
						page.innerHTML = i;
						page.onclick = function () {
							atpage = Number($(this).text());
							getComments();
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
					} else {
						if (i <= 2) {
							continue;
						} else {
							if (nowPageNum == i) {
								var page = document.createElement("span");
								page.className = "curr";
								page.innerHTML = i;
							} else {
								var page = document.createElement("a");
								page.innerHTML = i;
								page.onclick = function () {
									atpage = Number($(this).text());
									getComments();
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
					} else {
						var page = document.createElement("a");
						page.innerHTML = i;
						page.onclick = function () {
							atpage = Number($(this).text());
							getComments();
						}
						info.find(".pagination-pages").append(page);
					}
				}
			}

			//下一页
			if (nowPageNum < allPageNum) {
				var next = document.createElement("a");
				next.className = "next";
				next.innerHTML = '下一页';
				next.onclick = function () {
					atpage = nowPageNum + 1;
					getComments();
				}
				info.find(".pagination-pages").append(next);
			}

			//输入跳转
			var insertNum = Number(nowPageNum + 1);
			if (insertNum >= Number(allPageNum)) {
				insertNum = Number(allPageNum);
			}

			var redirect = document.createElement("div");
			redirect.className = "redirect";
			// redirect.innerHTML = '<i>'+'到'+'</i><input id="prependedInput" type="number" placeholder="'+'页码'+'" min="1" max="'+allPageNum+'" maxlength="4"><i>'+'页'+'</i><button type="button" id="pageSubmit">'+'确定'+'</button>';
			info.find(".pagination-pages").append(redirect);

			//分页跳转
			info.find("#pageSubmit").bind("click", function () {
				var pageNum = $("#prependedInput").val();
				if (pageNum != "" && pageNum >= 1 && pageNum <= Number(allPageNum)) {
					atpage = Number(pageNum);
					getComments();
				} else {
					$("#prependedInput").focus();
				}
			});

			info.show();

		} else {
			info.hide();
		}
	}





	//倒计时
	var now = date[0],
		stime = date[1],
		etime = date[2],
		state = 1,
		summary = $(".singleGoods"),
		btns = summary.find(".cartBuy"),
		expiry = summary.find(".cutDom .right");
	//还未开始
	if (now < stime) {
		state = 2;
		btns.find(".buyNow").html('还未开始');

		//已结束
	} else if (now > etime) {
		state = 3;
		btns.find(".buyNow").html('已结束');
	}
	if (state > 1) btns.find("a").addClass("disabled"), btns.find(".cart").hide();

	var timeCompute = function (a, b) {
			if (this.time = a, !(0 >= a)) {
				for (var c = [86400 / b, 3600 / b, 60 / b, 1 / b], d = .1 === b ? 1 : .01 === b ? 2 : .001 === b ? 3 : 0, e = 0; d > e; e++) c.push(b * Math.pow(10, d - e));
				for (var f, g = [], e = 0; e < c.length; e++) f = Math.floor(a / c[e]),
					g.push(f),
					a -= f * c[e];
				return g
			}
		},
		CountDown = function (a) {
			this.time = a,
				this.countTimer = null,
				this.run = function (a) {
					var b, c = this;
					this.countTimer = setInterval(function () {
						b = timeCompute.call(c, c.time - 1, 1);
						b || (clearInterval(c.countTimer), c.countTimer = null);
						"function" == typeof a && a(b || [0, 0, 0, 0, 0], !c.countTimer)
					}, 1000);
				}
		};

	var begin = stime - now;
	var end = etime - now;
	var time = begin > 0 ? begin : end > 0 ? end : 0;

	var timeTypeText = '距开始剩余';
	if (begin < 0 && end < 0) {
		timeTypeText = '已结束';
	} else if (begin > 0 && end > 0) {
		timeTypeText = '距开始剩余';
	} else if (begin < 0 && end > 0) {
		timeTypeText = '距结束剩余';
	}
	var countDown = new CountDown(time);
	if (date.length > 0) {
		countDownRun();
	}

	var state = $('.box .tb-booth .state');

	function countDownRun(time) {
		time && (countDown.time = time);
		countDown.run(function (times, complete) {
			// var clsDom = times[0] == 0?"":'<b class="day"><em class="dd">' + times[0] +	'</em>天</b>'
			var times_h = times[0] > 0 ? (times[1] + 24 * times[0]) : times[1];
			var html = '' + timeTypeText + '<span><em class="hh">' + (times_h > 9 ? times_h : "0" + times_h) + ' </em>:<em class="mm">' + (times[2] > 9 ? times[2] : "0" + times[2]) + '</em>:<em clss="ss">' + (times[3] > 9 ? times[3] : "0" + times[3]) + '</em>';
			expiry.html(html);
			if (complete) {
				if (begin < 0 && end < 0) {
					btns.find("a").addClass("disabled"), btns.find(".cart").hide();
					btns.find(".buyNow").html('已结束');
				} else if (begin > 0) {
					btns.find("a").removeClass("disabled"), btns.find(".cart").show();
					btns.find(".buyNow").html('立即抢购');
					timeTypeText = '剩余';
					countDownRun(etime - stime);
					begin = null;
				} else {
					btns.find("a").addClass("disabled"), btns.find(".cart").hide();
					if (begin === null || begin <= 0) {
						btns.find(".buyNow").html('已结束');
					} else {
						btns.find(".buyNow").html('还未开始');
					}
				}
			}
		});
	}




	//商品详情页--数量的加减

	//加
	$(".singleGoods li .num i.up").on("click", function () {

		var stockx = parseInt($(".singleGoods .count var b").text()),
			n = $(".sys_item_specpara").length;
		$(".singleGoods li .num i.down").removeClass('noclick')
		var $c = $(this),
			value;
		value = parseInt($c.siblings("input").val());
		if (maxCount * 1 == 0) { //限购为0 则表示不限购
			var canbuycount = stockx
		} else {
			var canbuycount = Math.min.apply(null, [stockx, maxCount * 1]); //库存和限购的最小值为 最大购买数量
		}

		if (value >= canbuycount) {
			$(this).addClass('noclick');
		} else {
			$(this).removeClass('noclick');
		}
		if ($(this).hasClass('noclick')) {
			if (canbuycount == maxCount * 1) {
				$(".singleGoods .count cite").html('限购' + maxCount + detailShopunit + '!').show();

			} else {
				$(".singleGoods .count cite").html('超过当前库存！').show();
			}
			return false;
		}


		if (value < canbuycount || canbuycount == 0) {
			$(this).removeClass('noclick')

			//2021-9-13 增加最小起订量和每次装箱数量
			//每次装箱数量
			var eachcout = $('.buy_mincount .mincoutTip').attr('data-eachcout');
			value = value + eachcout * 1;
			if (value >= canbuycount) {
				value = canbuycount;
				$(this).addClass('noclick')
			}
			$c.siblings("input").val(value);
			if (value > canbuycount) {
				$(".singleGoods .count cite").show();
			}
			var spValue = parseInt($(".singleGoods dd var b").text()),
				inputValue = parseInt($(".singleGoods dd input").val());
			if ($(".singleGoods .pro").find("a.selected").length == n && inputValue < spValue) {
				$(".singleGoods dd.info ul").removeClass("on");
			}
		}
	})

	//减
	$(".singleGoods li .num i.down").on("click", function () {
		if ($(this).hasClass('noclick')) {
			showErrAlert('不能再减少了');
			return false;
		}
		var stockx = parseInt($(".singleGoods .count var b").text()),
			n = $(".sys_item_specpara").length;
		var $c = $(this),
			value;
		value = parseInt($c.siblings("input").val());
		if (maxCount * 1 == 0) { //限购为0 则表示不限购
			var canbuycount = stockx
		} else {
			var canbuycount = Math.min.apply(null, [stockx, maxCount * 1]); //库存和限购的最小值为 最大购买数量
		}
		//每次装箱数量
		var eachcout = $('.buy_mincount .mincoutTip').attr('data-eachcout');
		var mincout = $('.buy_mincount .mincoutTip').attr('data-mincout'); //最小起订量
		if (value >= mincout * 1) {

			$(this).removeClass('noclick')
			//2021-9-13 增加最小起订量和每次装箱数量

			value = value - eachcout * 1;

			if (value <= mincout * 1) {
				value = mincout * 1;
				$(this).addClass('noclick')
			}
			$c.siblings("input").val(value);
			if (value <= canbuycount) {
				$('.up').removeClass('noclick');
				$(".singleGoods .count cite").hide();
			}
			var spValue = parseInt($(".singleGoods dd var b").text()),
				inputValue = parseInt($(".singleGoods dd input").val());
			if ($(".singleGoods .pro").find("a.selected").length == n && inputValue <= spValue) {
				$(".singleGoods dd.info ul").removeClass("on");
			}
		}
	})




	//商品属性选择
	var SKUResult = {}; //保存组合结果
	var mpriceArr = []; //市场价格集合
	var priceArr = []; //现价集合
	var totalStock = 0; //总库存
	var skuObj = $(".singleGoods dd.info li.count"),
		mpriceObj = $(".singleGoods dd.info li.price s"), //原价
		priceObj = $(".singleGoods dd.info li.price .moneyTxt b"), //现价
		stockObj = $(".singleGoods .count var b"), //库存
		disabled = "disabled", //不可选
		selected = "selected"; //已选

	var init = {

		//拼接HTML代码
		start: function () {

				var proDataArr = [],
					data = sku_conf.property;
				for (var i = 0; i < data.length; i++) {
					proDataArr.push('<li class="sys_item_specpara fn-clear"><span class="label left">' + data[i].name + '</span><div class="pro">');
					var options = data[i].options;
					for (var ii = 0; ii < options.length; ii++) {
						if (options[ii].pic) {
							proDataArr.push('<a href="javascript:;" class="sku pic disabled" attr_id="' + options[ii].id + '" title="' + options[ii].name + '"><img src="' + options[ii].pic + '"></a>');
						} else {
							proDataArr.push('<a href="javascript:;" class="sku disabled" attr_id="' + options[ii].id + '">' + options[ii].name + '</a>');
						}

					}
					proDataArr.push('</div></li>');
				}
				skuObj.before(proDataArr.join(""));

				// init.initSKU();
			}

			,
		tuanstart: function () {
				var proDataArr = [],
					data = sku_conf.property;
				proDataArr.push('<li class="sys_item_specpara"><span class="label left">选择套餐：</span><div class="pro">');
				for (var i = 0; i < data.length; i++) {
					var options = data[i].options;
					for (var ii = 0; ii < options.length; ii++) {
						if (options[ii].pic) {
							proDataArr.push('<a href="javascript:;" class="sku pic disabled" attr_id="' + options[ii].id + '" title="' + options[ii].name + '"><img src="' + options[ii].pic + '"></a>');
						} else {
							proDataArr.push('<a href="javascript:;" class="sku disabled" attr_id="' + options[ii].id + '">' + options[ii].name + '</a>');
						}

					}
				}
				proDataArr.push('</div></li>');
				skuObj.before(proDataArr.join(""));

				// init.initSKU();
			}

			//获得对象的key
			,
		getObjKeys: function (obj) {
				if (obj !== Object(obj)) throw new TypeError('Invalid object');
				var keys = [];
				for (var key in obj) {
					if (Object.prototype.hasOwnProperty.call(obj, key)) {
						keys[keys.length] = key;
					}
				}
				return keys;
			}


			//默认值
			,
		defautx: function () {

				//市场价范围
				var maxPrice = Math.max.apply(Math, mpriceArr);
				var minPrice = Math.min.apply(Math, mpriceArr);
				mpriceObj.html((echoCurrency('symbol')) + (maxPrice > minPrice ? minPrice.toFixed(2) + "-" + maxPrice.toFixed(2) : maxPrice.toFixed(2)));

				//现价范围
				var maxPrice = Math.max.apply(Math, priceArr);
				var minPrice = Math.min.apply(Math, priceArr);
				priceObj.html((maxPrice > minPrice ? minPrice.toFixed(2) + "-" + maxPrice.toFixed(2) : maxPrice.toFixed(2)));


				// vip优惠
				var vipyouhui = $(".vipyouhui").attr('data-privilege');
				if (vipyouhui) {
					$(".vipyouhui .vipJian").text(((maxPrice > minPrice ? minPrice : maxPrice) * vipyouhui).toFixed(2))
				}
				var pointGet = $(".point").attr('data-point');
				if (pointGet) {
					$(".point .pointGet").text(((maxPrice > minPrice ? minPrice : maxPrice) * pointGet).toFixed(2))
				}

				//总库存

				stockObj.text(totalStock);

				//设置属性状态
				$('.sku').each(function () {
					SKUResult[$(this).attr('attr_id')] ? $(this).removeClass(disabled) : $(this).addClass(disabled).removeClass(selected);
				})
				if (maxCount * 1 == 0) { //限购为0 则表示不限购
					var canbuycount = totalStock;
				} else {
					var canbuycount = Math.min.apply(null, [totalStock, maxCount * 1]); //库存和限购的最小值为 最大购买数量
				}
				var inputValue = parseInt($(".singleGoods dd .num input").val());
				var inputTip = $(".singleGoods dd cite");
				if (inputValue >= canbuycount) {
					if (canbuycount == totalStock) {
						inputTip.html('超过当前库存！')
					} else {
						inputTip.html('限购' + maxCount + detailShopunit + '!');
					}
					$('.singleGoods dd .num .up').addClass('noclick');
					inputTip.show();
				} else {
					$('.singleGoods dd .num .up').removeClass('noclick');
					inputTip.hide();
				}

			}

			//初始化得到结果集
			,
		initSKU: function () {
				var i, j, skuKeys = init.getObjKeys(sku_conf.data);
				// if(huodongid){//活动中的商品
				// 	skuKeys = init.getObjKeys(sku_conf.pindata);
				// }
				if (huodongid && sku_conf.pindata && JSON.stringify(sku_conf.pindata) != "{}") { //活动中的商品
					skuKeys = init.getObjKeys(sku_conf.pindata);
				}
				for (i = 0; i < skuKeys.length; i++) {
					var skuKey = skuKeys[i]; //一条SKU信息key
					var sku = sku_conf.data[skuKey]; //一条SKU信息value
					if (huodongid && sku_conf.pindata && JSON.stringify(sku_conf.pindata) != "{}") { //活动中的商品
						sku = sku_conf.pindata[skuKey];
					}
					var skuKeyAttrs = skuKey.split(";"); //SKU信息key属性值数组
					var len = skuKeyAttrs.length;

					//对每个SKU信息key属性值进行拆分组合
					var combArr = init.arrayCombine(skuKeyAttrs);

					for (j = 0; j < combArr.length; j++) {
						init.add2SKUResult(combArr[j], sku);
					}

					mpriceArr.push(sku.mprice);
					priceArr.push(sku.price);
					totalStock += sku.stock * 1;

					//结果集接放入SKUResult
					SKUResult[skuKey] = {
						stock: sku.stock * 1,
						prices: [sku.price],
						mprices: [sku.mprice]
					}
				}
				init.defautx();
			}

			//把组合的key放入结果集SKUResult
			,
		add2SKUResult: function (combArrItem, sku) {
				var key = combArrItem.join(";");
				//SKU信息key属性
				if (SKUResult[key]) {
					SKUResult[key].stock = sku.stock * 1;
					SKUResult[key].prices.push(sku.price);
					SKUResult[key].mprices.push(sku.mprice);
				} else {
					SKUResult[key] = {
						stock: sku.stock * 1,
						prices: [sku.price],
						mprices: [sku.mprice]
					};
				}
			}

			//从数组中生成指定长度的组合
			,
		arrayCombine: function (targetArr) {
				if (!targetArr || !targetArr.length) {
					return [];
				}

				var len = targetArr.length;
				var resultArrs = [];

				// 所有组合
				for (var n = 1; n < len; n++) {
					var flagArrs = init.getFlagArrs(len, n);
					while (flagArrs.length) {
						var flagArr = flagArrs.shift();
						var combArr = [];
						for (var i = 0; i < len; i++) {
							flagArr[i] && combArr.push(targetArr[i]);
						}
						resultArrs.push(combArr);
					}
				}

				return resultArrs;
			}

			//获得从m中取n的所有组合
			,
		getFlagArrs: function (m, n) {
			if (!n || n < 1) {
				return [];
			}

			var resultArrs = [],
				flagArr = [],
				isEnd = false,
				i, j, leftCnt;

			for (i = 0; i < m; i++) {
				flagArr[i] = i < n ? 1 : 0;
			}

			resultArrs.push(flagArr.concat());

			while (!isEnd) {
				leftCnt = 0;
				for (i = 0; i < m - 1; i++) {
					if (flagArr[i] == 1 && flagArr[i + 1] == 0) {
						for (j = 0; j < i; j++) {
							flagArr[j] = j < leftCnt ? 1 : 0;
						}
						flagArr[i] = 0;
						flagArr[i + 1] = 1;
						var aTmp = flagArr.concat();
						resultArrs.push(aTmp);
						if (aTmp.slice(-n).join("").indexOf('0') == -1) {
							isEnd = true;
						}
						break;
					}
					flagArr[i] == 1 && leftCnt++;
				}
			}
			return resultArrs;
		}

	}

	if (sku_conf.property.length > 0) {
		if (modultype == '1') {
			init.tuanstart();
		} else {
			init.start();
		}

	}

	$(".jqzoom1").imagezoom();
	//点击事件
	console.log(sku_conf.data)
	console.log(SKUResult)

	$('.sku').each(function () {
		var self = $(this);
		var attr_id = self.attr('attr_id');
		var skuData = huodongid && sku_conf.pindata && JSON.stringify(sku_conf.pindata) != "{}" ? sku_conf.pindata : sku_conf.data;
		for(var item in skuData){
			if(item.indexOf(attr_id) > -1 && skuData[item].stock > 0){ //有该选项的商品 并且库存不为0
				self.removeClass(disabled);
				break;
			}
		}
	}).click(function () {
		var checkStock = 0; // 没有库存

		var self = $(this);
		if(self.hasClass('disabled')) return false;
		$('.sku').removeClass('disabled')
		self.toggleClass(selected).siblings("a").removeClass(selected);


		// 带图片的商品
		if (self.find("img").size() > 0) {
			if (self.hasClass(selected)) {
				$(".pro_show").show();
			} else {
				$(".pro_show").hide();
			}
			$(".jqzoom1").attr('src', self.find("img").attr("src"));
			$(".jqzoom1").attr('rel', self.find("img").attr("src"));
		} else if (self.parents(".pro").prev("span").text() != "颜色：") {
			$(".pro_show").hide();
		}

		var spValue = parseInt($(".singleGoods dd var b").text()),
			inputValue = parseInt($(".singleGoods dd input").val());
		var n = $(".sys_item_specpara").length;

		if ($(".singleGoods .pro").find("a.selected").length == n && inputValue < spValue) {

			$(".singleGoods dd.info ul").removeClass("on");
		}

		// console.log(spValue,inputValue,n)

		//已经选择的节点
		var selectedObjs = $('.' + selected);
		var selectedIds = []
		selectedObjs.each(function(){
			var sel = $(this)
			selectedIds.push(sel.attr('attr_id'))
		});
		var len = selectedIds.length;
		// selectedIds.sort()
		// console.log(selectedIds)

		// 验证当前选项是否有库存 可选
		var currStock = 0;
		var priceArr = [],mpriceArr = [];
		var skuData = huodongid && sku_conf.pindata && JSON.stringify(sku_conf.pindata) != "{}" ? sku_conf.pindata : sku_conf.data;
		if(len == 0) return false;
		for(var item in skuData){
			var testIds = item.split(';');
			var includeArr = selectedIds.filter(val => {
				return testIds.includes(val)
			})
			
			if(includeArr.length == selectedIds.length){
				testIdsArr = testIds.filter(val => {
					return !selectedIds.includes(val);
				});
				// 判断当前节点是否有库存
				$(".sku").not(selectedObjs).not(self).each(function () {
					var siblingsSelectedObj = $(this).siblings('.' + selected);
					var testAttrIds = []; //从选中节点中去掉选中的兄弟节点
					if (siblingsSelectedObj.length) {
						var siblingsSelectedObjId = siblingsSelectedObj.attr('attr_id');
						for (var i = 0; i < len; i++) {
							(selectedIds[i] != siblingsSelectedObjId) && testAttrIds.push(selectedIds[i]);
						}
					} else {
						testAttrIds = selectedIds.concat();
					}
					testAttrIds = testAttrIds.concat($(this).attr('attr_id'));
					testAttrIds.sort();
			
					var stockFlag = 0; 
					for(var iitem in skuData){
						var flag = 0;
						for(var mm = 0; mm < testAttrIds.length; mm++){
							if(!iitem.split(';').includes(testAttrIds[mm])){
								flag = 1;
								break;
							}
						}
						if(flag == 0 && skuData[iitem].stock != 0){
							stockFlag = 1;
						}
					}

					if(!stockFlag){
						$(this).addClass('disabled').removeClass(selected)
					}else{
						$(this).removeClass('disabled')
					}



				})

				// $(".sys_item_specpara").each(function(){
				// 	var li = $(this);
				// 	li.find('.sku').not(selectedObjs).not(self).each(function(){
				// 		var sku = $(this);
				// 		var siblingsSelectedObj = $(this).siblings('.' + selected);
				// 		console.log(sku.attr('attr_id'))
				// 	})
				// })

				if(skuData[item].stock == 0){ //没有库存
					// // 没有库存
     //                self.toggleClass(selected).siblings("a").removeClass(selected);
     //                self.addClass('disabled');
                    // alert('库存不足');
     //                return false;
					
					// console.log(testIdsArr)
				}else{
					checkStock = 1; //表示有库存
					currStock = skuData[item].stock * 1 + currStock;
					priceArr.push(skuData[item].price)
					mpriceArr.push(skuData[item].mprice)
				}
			}
		}

		if(!checkStock){
			alert('没有库存')
			return false;
		}
		var min_price = Math.min.apply(null,priceArr);
		var max_price = Math.max.apply(null,priceArr);
		var min_mprice = Math.min.apply(null,mpriceArr);
		var max_mprice = Math.max.apply(null,mpriceArr);
		priceObj.text(min_price == max_price ? min_price : (min_price + '-' + max_price)); //价格填入
		mpriceObj.text((echoCurrency('symbol') + (min_mprice == max_mprice ? min_mprice : (min_mprice + '-' + max_mprice))))
		stockObj.text(currStock)
		// vip优惠
		var vipyouhui = $(".vipyouhui").attr('data-privilege');
		if (vipyouhui) {
			$(".vipyouhui .vipJian").text(((max_price > min_price ? min_price : max_price) * vipyouhui).toFixed(2))
		}

		//获取input的值
		var inputValue = parseInt($(".singleGoods dd .num input").val());
		var inputTip = $(".singleGoods dd cite");
		if (maxCount * 1 == 0) { //表示不限购
			var canbuycount = currStock;
		} else {
			var canbuycount = Math.min.apply(null, [currStock, maxCount * 1]); //库存和限购的最小值为 最大购买数量
		}


		if (inputValue >= canbuycount) {
			if (canbuycount > currStock) { //原先是等于
				inputTip.html('超过当前库存！')
			} else if (canbuycount < currStock) {
				inputTip.html('限购' + maxCount + detailShopunit + '!');
			}
			$('.singleGoods dd .num .up').addClass('noclick');
			inputTip.show();
		} else {
			$('.singleGoods dd .num .up').removeClass('noclick');
			inputTip.hide();
		}
	})


	$(".sys_item_specpara").each(function () {
		var ts = $(this);
		ts.find('.sku').each(function () {
			var tss = $(this);
			if (!tss.hasClass('disabled') && ts.find('.selected').length == 0) {
				tss.click();
			}
		})
	})


	//加入购物车及加入购物车判断
	$(".detailComment .right .cart").click(function () {
		$(".singleGoods dd.cartBuy a.cart").click();
		$(window).scrollTop(0)
	})
	$(".singleGoods dd.cartBuy a.cart").on("click", function (event) {
		//验证登录
		var userid = $.cookie(cookiePre + "login_user");
		if (userid == null || userid == "") {
			huoniao.login();
			return false;
		}

		var $buy = $(this),
			$li = $(".sys_item_specpara"),
			$ul = $(".singleGoods dd.info"),
			n = $li.length;
		if ($buy.hasClass("disabled")) return false;
		var len = $li.length;
		var spValue = parseInt($(".singleGoods dd var b").text()),
			inputValue = parseInt($(".singleGoods dd input").val());

		if ($(".singleGoods .pro").find("a.selected").length == n && inputValue <= spValue) {

			//加入购物车动画
			$(".singleGoods dd.info").removeClass("on");
			var offset = $(".topcart .cart-btn .icon").offset();
			var flyer = $('<img class="flyer-img" src="' + detailThumb + '">'); //抛物体对象
			var t = $(this).offset();
			var scH = $(window).scrollTop();

			flyer.fly({
				start: {
					left: t.left + 50, //抛物体起点横坐标
					top: t.top - scH - 20 //抛物体起点纵坐标
				},
				end: {
					left: offset.left + 12, //抛物体终点横坐标
					top: offset.top - scH, //抛物体终点纵坐标
					width: 20,
					height: 20,
					borderRadius: 10
				},
				onEnd: function () {
					var $i = $("<b class='flyend'>").text("+1");
					var x = 22,
						y = 0;

					setTimeout(function () {
						$(".topcart").append($i);
						$i.animate({
							top: y - 50,
							opacity: 0
						}, 500, function () {
							$i.remove();
						});
					}, 300);

					this.destroy(); //销毁抛物体
				}
			});

			var $dl = $(this).parents("dl");
			var t = ''; //该商品的属性编码 以“-”链接个属性
			$(".sys_item_specpara").each(function () {
				var $t = $(this),
					y = $t.find("a.selected").attr("attr_id");
				t = t + "-" + y;
			})
			t = t.substr(1);

			glocart.find(".empty").hide();
			$(".cartlist").show();

			var num = parseInt($(".singleGoods dd .num input").val());
			var tArr = t.split('-').sort();
			var paramData = sku_conf.data;
			if(huodongid && sku_conf.pindata && JSON.stringify(sku_conf.pindata) != "{}"){
				paramData = sku_conf.pindata;
			}
			var paramId = paramData && paramData[tArr.join(';')] ? paramData[tArr.join(';')].id : '';
			//操作购物车
			var data = [];
			data.id = detailID;
			data.specation = paramId;
			data.count = num;
			data.title = detailTitle;
			data.url = detailUrl;
			shopInit.add(data);

		} else {
			$ul.addClass("on");
		}

	});


	function addCart(t, num) {
		if ($(".cartlist ul li[data-pro=" + t + "]").length > 0) {
			var n = parseInt($(".cartlist ul li[data-pro=" + t + "]").find("strong.c").text());
			n += num;
			$(".cartlist ul li[data-pro=" + t + "]").attr("data-count", n);
		} else {
			$(".cartlist ul").append("<li id=" + detailID + " data-pro=" + t + " data-count=" + num + "></li>");
		}
	}


	//立即购买判断
	$(".singleGoods dd.cartBuy a.buyNow,.cartBuy .zjbuy").on("click", function (event) {
		$("#ordertype").val('zjbuy')
		$("#pinid").val('')
		var $buy = $(this),
			$li = $(".sys_item_specpara"),
			$ul = $(".singleGoods dd.info"),
			n = $li.length;
		if ($buy.hasClass("disabled")) return false;
		var len = $li.length;
		var spValue = parseInt($(".singleGoods dd var b").text()),
			inputValue = parseInt($(".singleGoods dd input").val());

		//验证登录
		var userid = $.cookie(cookiePre + "login_user");
		if (userid == null || userid == "") {
			huoniao.login();
			return false;
		}
		if ($('#hid').val() != '' && $('#buytype').val() == 'pintuan') {
			// $("#ordertype").val("");
			$("#buytype").val('');
		}

		if ($('#hid').val() != '' && $('#buytype').val() != 'pintuan' && !$buy.hasClass('zjbuy')) {
			$("#ordertype").val("");
		}

        //原价购买
        var buytype = $('#buytype').val();
        if($buy.hasClass('yjbuy')){
            $('#buytype').val('');
            //2秒后恢复原值
            setTimeout(function(){
                $('#buytype').val(buytype);
            }, 2000);
        }

		if (n > 0) { //有规格
			if ($(".singleGoods").find("a.selected").length == n && inputValue <= spValue) {
				var t = ''; //该商品的属性编码 以“-”链接个属性
				$(".sys_item_specpara").each(function () {
					var $t = $(this),
						y = $t.find("a.selected").attr("attr_id");
					t = t + "-" + y;
				})
				t = t.substr(1);
				var tArr = t.split('-');
				var paramData = sku_conf.data;
				// if(huodongid && sku_conf.pindata && JSON.stringify(sku_conf.pindata) != "{}"){
                if(prohuodongtype == 4){
					paramData = sku_conf.pindata;
				}
				var paramId = paramData && paramData[tArr.join(';')] ? paramData[tArr.join(';')].id : '';
				$("#pros").val(detailID + "," + paramId + "," + inputValue);
				$("#buyForm").submit();
			} else {
				$ul.addClass("on");
			}
		} else {
			$("#pros").val(detailID + "," + "" + "," + inputValue);
			$("#buyForm").submit();
		}

	})

	$('#buyForm').keydown(function(e){
		if(e.keyCode == 13) return false;
	})

	// $('#buyForm').submit(function(e){

	// 	console.log(e)
	// 	return false;
	// })
});


// 数字字母中文混合排序
function arrSortMinToMax(a, b) {
	// 判断是否为数字开始; 为啥要判断?看上图源数据
	if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
		// 提取起始数字, 然后比较返回
		return /^\d+$/.exec(a) - /^\d+$/.exec(b);
		// 如包含中文, 按照中文拼音排序
	} else if (isChinese(a) && a.indexOf('custom_') < 0 && isChinese(b) && b.indexOf('custom_') < 0) {
		// 按照中文拼音, 比较字符串 (英文加汉字混合时 中文加英文加汉字混合)
		var rvalue;
		var sa = a.substr(0, 1),
			sb = b.substr(0, 1);
		var saArr = a.split(''),
			sbArr = b.split(''); //英文加中文时  首字母相同时
		var sflg = false,
			noSame = [];
		var blen = saArr.length > sbArr.length ? saArr.length : sbArr.length;
		for (var mm = 0; mm < blen; mm++) {
			if (saArr[mm] != sbArr[mm]) {
				noSame.push(saArr[mm])
				noSame.push(sbArr[mm])
				sflg = true;
				break;
			}
		}
		if ((/^[A-Za-z]+$/).test(sa) && (/^[A-Za-z]+$/).test(sb)) { //首字母全为英文
			if (sa == sb) { //首字母相同时 比较出不一样的元素
				var ssa = noSame[0],
					ssb = noSame[1];
				if (ssa != undefined) {
					if (ssb == undefined) { //a短b长
						rvalue = 1;
					} else {
						if ((/^[A-Za-z]+$/).test(ssa)) { //英文
							if ((/^[A-Z][A-z0-9]*$/).test(ssa)) { //大写
								if ((/^\d+/.test(ssb))) { //数字
									rvalue = 1;
								} else if ((/^[A-Za-z]+$/).test(ssb)) { //字母
									if ((/^[A-Z][A-z0-9]*$/).test(ssb)) {
										rvalue = ssa.localeCompare(ssb, 'en');
									} else { //大写排小写前面
										rvalue = -1;
									}

								} else { //汉字
									rvalue = -1;
								}

							} else { //小写
								if ((/^\d+/.test(ssb))) { //数字 排前面
									rvalue = 1;
								} else if ((/^[A-Za-z]+$/).test(ssb)) { //字母
									if ((/^[A-Z][A-z0-9]*$/).test(ssb)) { //大写 排前面
										rvalue = 1;
									} else { //小写
										rvalue = ssa.localeCompare(ssb, 'en');
									}

								} else { //汉字
									rvalue = -1;
								}
							}
						} else if ((/^\d+/.test(ssa))) { //数字
							if ((/^\d+/.test(ssb))) { //数字
								if (ssa > ssb) {
									rvalue = 1;
								} else {
									rvalue = -1;
								}

							} else {
								rvalue = -1;
							}
						} else { //汉字
							if ((/^\d+/.test(ssb)) || (/^[A-Za-z]+$/).test(ssb)) { //数字或字母
								rvalue = 1;
							} else { //汉字
								rvalue = ssa.localeCompare(ssb, 'zh-CN');
							}
						}
					}
				} else { //a长b短
					rvalue = -1;
				}


			} else {
				if ((/^[A-Z][A-z0-9]*$/).test(sa) && (!(/^[A-Z][A-z0-9]*$/).test(sb))) { //大写和小写
					rvalue = -1;
				} else if ((/^[A-Z][A-z0-9]*$/).test(sb) && (!(/^[A-Z][A-z0-9]*$/).test(sa))) { //大写和小写
					rvalue = 1;
				}
			}

		} else { //首字母英文和中文时

			if ((/^[A-Za-z]+$/).test(sa) && (!((/^[A-Za-z]+$/).test(sb)) && !(/^\d+/.test(sb)))) { //英文和中文
				rvalue = -1;
			} else if ((/^[A-Za-z]+$/).test(sb) && (!((/^[A-Za-z]+$/).test(sa)) && !(/^\d+/.test(sa)))) {
				rvalue = 1;
			} else {
				rvalue = a.localeCompare(b, 'zh-CN');
			}

		}
		return rvalue;
	} else {
		var rvalue;
		//a/b为大写字母开头 且b/a不为数字 是小写
		var sa = a.substr(0, 1),
			sb = b.substr(0, 1);
		if ((/^[A-Z][A-z0-9]*$/).test(sa) && (!(/^[A-Z][A-z0-9]*$/).test(sb) && !(/^\d+/.test(sb)))) {
			rvalue = -1;
		} else if ((/^[A-Z][A-z0-9]*$/).test(sb) && (!(/^[A-Z][A-z0-9]*$/).test(sa) && !(/^\d+/.test(sa)))) {
			rvalue = 1;
		} else {
			rvalue = a.localeCompare(b, 'en');
		}
		// 排序数字和字母
		return rvalue;
	}
}

// 检测是否为中文，true表示是中文，false表示非中文
function isChinese(str) {
	// 中文万国码正则
	if (/[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/.test(str)) {
		return true;
	} else {
		return false;
	}
}