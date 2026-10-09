
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
	}else{
		return 0;
	}
}

var URL = location.href;
var URLArrary = URL.split('#');
var iname_start = URLArrary[1]  ? URLArrary[1] : '';

$(function(){

	var device = navigator.userAgent;
	// 判断设备类型，ios全屏
	if (device.indexOf('huoniao_iOS') > -1) {
		$('body').addClass('huoniao_iOS');
		$('.header').addClass('padTop20');
	}

	setTimeout(function(){
		if (appInfo.device == "") {
			$('.float-download').show();
		}
	}, 500)

	$('.navbar li:eq(0)').addClass('active');


	$('.float-download .closesd').click(function(){
		$('.float-download').hide();
		$('.header').css('top', '0');
	})

	// 关注按钮
  $('body').delegate('.nofollow', 'click', function(){
    var x = $(this);
    if (x.hasClass('follow')) {
			follow(x, function(){
				x.removeClass('follow').text(langData['siteConfig'][19][846]);
			});
    }else{
			follow(x, function(){
				x.addClass('follow').text(langData['siteConfig'][19][845]);
			});
    }
  })

  var follow = function(t, func){
    var userid = $.cookie(cookiePre+"login_user");
    if(userid == null || userid == ""){
      location.href = masterDomain + '/login.html';
      return false;
    }

    if(t.hasClass("disabled")) return false;
    t.addClass("disabled");
    $.post("/include/ajax.php?service=member&action=followMember&id="+t.attr("data-id"), function(){
      t.removeClass("disabled");
      func();
    });
  }


	var loadMoreLock = false;

  var navbar = $('.navbar');
  var navHeight = navbar.offset().top;

  // 导航条左右切换模块
  var tabsSwiper = new Swiper('#tabs-container',{
    speed:350,
    autoHeight: true,
		touchAngle : 35,
    onSlideChangeStart: function(){
			loadMoreLock = false;
      $(".navbar .active").removeClass('active');
      $(".navbar li").eq(tabsSwiper.activeIndex).addClass('active');
       var iname = $(".navbar li").eq(tabsSwiper.activeIndex).attr('data-action');
       window.location.href = URLArrary[0] + '#' + (iname?iname:listid);
      if (navbar.hasClass('fixed')) {
        $(window).scrollTop(navHeight + 2);
      }

			$("#tabs-container .swiper-slide").eq(tabsSwiper.activeIndex).css('height', 'auto').siblings('.swiper-slide').height($(window).height());

			// 当模块的数据为空的时候加载数据
			if($.trim($("#tabs-container .swiper-slide").eq(tabsSwiper.activeIndex).find(".content-slide").html()) == ""){
				getList();
			}

    },
    onSliderMove: function(){
      // isload = true;
    },
    onSlideChangeEnd: function(){
      // isload = false;
    }
  })
  if(iname_start != ''){
  	var index = $('.navbar li[data-action="'+iname_start+'"]').index();
  	console.log(index)
  	tabsSwiper.slideTo( index );
  }else{
  	getList();
  }
  $(".navbar li").on('touchstart mousedown',function(e){
    e.preventDefault();
    $(".navbar .active").removeClass('active');
    $(this).addClass('active');
    tabsSwiper.slideTo( $(this).index() );

  })
  $(".tabs a").click(function(e){
    e.preventDefault();
  })


  // 导航吸顶
	$(window).on("scroll", function(){
		var sct = $(window).scrollTop();
		if ($(window).scrollTop() > navHeight) {
			$('.navbar').addClass('fixed');
			if (device.indexOf('huoniao_iOS') > -1) {
				$('.navbar, .navblank').addClass('padTop20');
			}
		}else {
      $('.navbar').removeClass('fixed padTop20');
      $('.navblank').removeClass('padTop20');
			$('.gotop').hide();
		}

		if(sct + $(window).height() + 50 > $(document).height() && !loadMoreLock) {
      var page = parseInt($('.navbar .active').attr('data-page')),
          totalPage = parseInt($('.navbar .active').attr('data-totalPage'));
      if(page < totalPage) {
				++page;
				$('.navbar .active').attr('data-page', page);
				getList();
      }
    }
	});

	// 房产tab切换
	$('.htab li').click(function(){
		var x = $(this), index = x.index();
		x.addClass('active').siblings().removeClass('active');
		$('.house').html("");
		page = 1;
		$('.navbar .active').attr('data-page', page);
		getList();
	})

//getList();

  // 异步获取列表
  function getList(){

    var active = $('.navbar .active'), action = active.attr('data-action'), url, objId;
    var page = active.attr('data-page');

    if (action == "article") {
			url = masterDomain + "/include/ajax.php?service=article&action=alist&uid="+uid+"&group_img=1&page=" + page + "&pageSize="+pageSize;
			objId = 'article';
    }else if (action == "huodong") {
			url = masterDomain + "/include/ajax.php?service=huodong&action=hlist&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
			objId = 'huodong';
    }else if (action == "tieba") {
			url = masterDomain + "/include/ajax.php?service=tieba&action=tlist&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
			objId = 'tieba';
    }else if (action == "info") {
			url = masterDomain + "/include/ajax.php?service=info&action=ilist&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
			objId = 'info';
		}else if (action == "house") {
			curr = $('.htab .active').attr('data-action');
			url = masterDomain + "/include/ajax.php?service=house&action="+curr+"&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
			objId = 'house';
		}else if(action == "live"){
			url = "/include/ajax.php?service=live&action=alive&uid="+uid+"&page=" + page + "&pageSize="+pageSize;
			objId = 'live';
		}

		$('.loading').remove();
		$('.'+objId).after('<div class="loading">'+langData['siteConfig'][20][184]+'..</div>');

		loadMoreLock = true;

    $.ajax({
      url: url,
      type: "GET",
      dataType: "jsonp",
      success: function(data){
        if (data && data.state != 200) {
          if (data.state == 101) {
						$('.loading').remove();
						$('.'+objId).after('<div class="loading">'+langData['siteConfig'][20][126]+'</div>');
            // panel.children('.content').append("<p class='error'>"+data.info+"</p>");
          }else {
            var list = data.info.list, articleHtml = [], huodongHtml = [], tiebaHtml = [], videoHtml = [], houseHtml = [], infoHtml = [], liveHtml=[];
            var totalPage = data.info.pageInfo.totalPage;
						active.attr('data-totalPage', totalPage);
            for (var i = 0; i < list.length; i++) {
              // 资讯模块
              if (action == "article") {

                // 如果是图集
                if(list[i].group_img){
                  articleHtml.push('<div class="item imglist">');
                  articleHtml.push('<a href="' + list[i].url + '" class="clearfix">');
                  articleHtml.push('<div class="item-txt">');
                  articleHtml.push('<p class="item-tit">' + list[i].title + '</p>');
                  articleHtml.push('<ul class="item-pics clearfix">');
                  var n = 0;
                  for (var g = 0; g < list[i].group_img.length; g++) {
                    var src = list[i].group_img[g].path;
                    if(src && n < 3) {
                      articleHtml.push('<li><img src="' + src +'"></li>');
                      n++;
                      if(n == 3) break;
                    }
                  }
                  articleHtml.push('</ul>');
                  articleHtml.push('<ul class="item-info fn-clear"><li class="time">' + list[i].typeName[0] + ' · ' + list[i].common + langData['siteConfig'][13][32] + langData['siteConfig'][6][114] + ' · ' + transTimes(list[i].pubdate, 3) + '</li></ul>');
                  articleHtml.push('</div>');
                  articleHtml.push('</a>');
                  articleHtml.push('</div>');

                // 缩略图
                }else {
                  var litpic = list[i].litpic;
                  articleHtml.push('<div class="item imglist">');
                  articleHtml.push('<a href="' + list[i].url + '" class="clearfix">');

                  articleHtml.push('<div class="item-txt">');
                  articleHtml.push('<p class="item-tit">' + list[i].title + '</p>');
									if (litpic) {
										articleHtml.push('<ul class="item-pics fn-clear"><li><img src="'+litpic+'"></li></ul>');
									}else {
										articleHtml.push('<p class="content">' + list[i].description + '</p>');
									}
                  articleHtml.push('<ul class="item-info fn-clear"><li class="time">' + list[i].typename + ' · ' + list[i].common + langData['siteConfig'][13][32] + langData['siteConfig'][6][114] + ' · ' + transTimes(list[i].pubdate, 3) + '</li></ul>');
                  articleHtml.push('</div>');
                  articleHtml.push('</a>');
                  articleHtml.push('</div>');

                }

              // 活动列表
              }else if (action == "huodong") {
                var userphoto = list[i].userphoto, feetype = list[i].feetype;
                huodongHtml.push('<div class="item">');
                huodongHtml.push('<a href="' + list[i].url + '">');
                huodongHtml.push('<img src="' + list[i].litpic + '" alt="" class="hImg">');
                huodongHtml.push('<p class="title">' + list[i].title + '</p>');
                huodongHtml.push('<div class="desc">');
                huodongHtml.push('<p>'+langData['siteConfig'][19][851]+'：' + transTimes(list[i].pubdate, 3) + '</p>');
                huodongHtml.push('<p>'+langData['siteConfig'][19][852]+'：' + list[i].addrname[0] + '</p>');
                // huodongHtml.push('<p>参与人数：546人</p>');
                huodongHtml.push('<p>'+langData['siteConfig'][19][853]+'：' + list[i].reg + langData['siteConfig'][13][32] + '</p>');
                huodongHtml.push('</div>');
                huodongHtml.push('<p class="hInfo fn-clear">');

								if (feetype == 1) {
	                huodongHtml.push('<span class="price fn-left">'+echoCurrency('symbol')+' <em>' + list[i].mprice + '</em> /'+langData['siteConfig'][13][32]+'</span>');
								}else {
									huodongHtml.push('<span class="price fn-left">'+langData['siteConfig'][19][427]+'</span>');
								}
                huodongHtml.push('<span class="btn fn-right">'+langData['siteConfig'][6][149]+'</span>');
                huodongHtml.push('</p>');
                huodongHtml.push('</a>');
                huodongHtml.push('</div>');

              // 贴吧列表
              }else if (action == "tieba") {
								var group = list[i].imgGroup;
                tiebaHtml.push('<div class="item">');
                tiebaHtml.push('<a href="' + list[i].url + '" class="item-a">');
								var jinghua = list[i].jinghua != '0' ? '<i class="jing">'+langData['siteConfig'][19][854]+'</i>' : '';
								var top = list[i].top != '0' ? '<i class="ding">'+langData['siteConfig'][19][855]+'</i>' : '';
                tiebaHtml.push('<p class="title fn-clear"><span class="fn-left">' + list[i].title + '</span>'+jinghua+top+'</p>');

                if (list[i].content != "") {
	                tiebaHtml.push('<p class="content">' + list[i].content + '</p>');
								}

								//图集
								if(group.length > 0){
									tiebaHtml.push('<div class="imgbox fn-clear">')
									if(group.length > 4){
										tiebaHtml.push('<span class="total">'+langData['siteConfig'][19][856].replace('1', group.length)+'</span><i class="img-num"></i>');
									}
									for(var g = 0; g < group.length; g++){
										if(g < 4){
											tiebaHtml.push('<img src="' + group[g] + '" alt="">');
										}
									}
									tiebaHtml.push('</div>');
								}
								tiebaHtml.push('<div class="operate fn-clear"><span class="type fn-left">' + list[i].typename[0] + '／' + list[i].reply + langData['siteConfig'][13][32] + langData['siteConfig'][6][114] + '</span><span class="time fn-right">' + transTimes(list[i].pubdate, 4) + '</span></div>');
								tiebaHtml.push('</a>');
								tiebaHtml.push('</div>');

							// 房源
							}else if (action == "house") {
								var litpic = list[i].litpic;

								// 二手房
								if (curr == 'saleList') {
									var flag = list[i].flags;
									houseHtml.push('<div class="item">');
									houseHtml.push('<a href="'+list[i].url+'">');
									if (litpic != "" && litpic != undefined) {
										houseHtml.push('<img src="'+list[i].litpic+'" alt="" class="hImg">');
									}
									houseHtml.push('<p class="title">'+list[i].title+'</p>');

									houseHtml.push('<div class="htags">');
									if (flag != "") {
										for (var j = 0; j < flag.length; j++) {
											houseHtml.push('<span>'+flag[j]+'</span>');
										}
									}
									houseHtml.push('</div>');
									houseHtml.push('<p class="desc">'+list[i].room+' · '+list[i].bno+langData['siteConfig'][13][12]+'（'+langData['siteConfig'][19][857].replace('1', list[i].floor)+'，'+list[i].buildage+langData['siteConfig'][13][14]+'）· '+list[i].direction+' · '+list[i].zhuangxiu+'</p>');
									var addr = list[i].addr[1] != undefined ? '-'+list[i].addr[1] : '';
									houseHtml.push('<p class="addr">'+list[i].addr[0]+addr+'</p>');
									houseHtml.push('<p class="hInfo fn-clear"><span class="price fn-left">'+echoCurrency('symbol')+' <em>'+list[i].price+'</em> '+langData['siteConfig'][13][27]+'<i>（'+list[i].area+echoCurrency('areasymbol')+'）</i></span><span class="fn-right">' + transTimes(list[i].pubdate, 3) + '</span></p>');

									houseHtml.push('</a>');
									houseHtml.push('</div>');

								// 租房
								}else if (curr == 'zuList') {

									houseHtml.push('<div class="item">');
									houseHtml.push('<a href="'+list[i].url+'">');
									if (litpic != "" && litpic != undefined) {
										houseHtml.push('<img src="'+list[i].litpic+'" alt="" class="hImg">');
									}
									houseHtml.push('<p class="title">'+list[i].title+'</p>');

									houseHtml.push('<p class="desc">'+list[i].room+' · '+list[i].bno+langData['siteConfig'][13][12]+'（'+langData['siteConfig'][19][857].replace('1', list[i].floor)+'）· '+list[i].direction+' · '+list[i].zhuangxiu+'</p>');
									var addr = list[i].addr[1] != undefined ? '-'+list[i].addr[1] : '';
									houseHtml.push('<p class="addr">'+list[i].addr[0]+addr+'</p>');
									houseHtml.push('<p class="hInfo fn-clear"><span class="price fn-left">'+echoCurrency('symbol')+' <em>'+list[i].price+'</em> /'+langData['siteConfig'][13][18]+'<i>（'+list[i].area+echoCurrency('areasymbol')+'）</i></span><span class="fn-right">' + transTimes(list[i].pubdate, 3) + '</span></p>');

									houseHtml.push('</a>');
									houseHtml.push('</div>');

								// 写字楼
								}else if (curr == 'xzlList') {
									var price = list[i].price, area = list[i].area, tprice, unit, usertype = list[i].usertype;

									houseHtml.push('<div class="item">');
									houseHtml.push('<a href="'+list[i].url+'">');
									if (litpic != "" && litpic != undefined) {
										houseHtml.push('<img src="'+list[i].litpic+'" alt="" class="hImg">');
									}
									houseHtml.push('<p class="title">'+list[i].title+'</p>');
									houseHtml.push('<p class="desc">'+list[i].area+echoCurrency('areasymbol')+' · '+list[i].protype+' · '+list[i].zhuangxiu+'</p>');
									var addr = list[i].addr[1] != undefined ? '-'+list[i].addr[1] : '';
									houseHtml.push('<p class="addr">'+list[i].addr[0]+addr+'</p>');
									if (list[i].type == '0') {
										tprice = price * area, unit = langData['siteConfig'][13][18];
									}else {
										tprice = price / area * 10000, unit = echoCurrency('areasymbol');
									}
									houseHtml.push('<p class="hInfo fn-clear"><span class="price fn-left">'+echoCurrency('symbol')+' <em>'+tprice+'</em> /'+unit+'<i>（'+list[i].area+echoCurrency('areasymbol')+'）</i></span><span class="fn-right">' + transTimes(list[i].pubdate, 3) + '</span></p>');
									houseHtml.push('</a>');
									houseHtml.push('</div>');

								// 商铺
								}else if (curr == 'spList') {
									var price = list[i].price, tprice = (price / 10000).toFixed(2);

									houseHtml.push('<div class="item">');
									houseHtml.push('<a href="'+list[i].url+'">');
									if (litpic != "" && litpic != undefined) {
										houseHtml.push('<img src="'+list[i].litpic+'" alt="" class="hImg">');
									}
									houseHtml.push('<p class="title">'+list[i].title+'</p>');

									houseHtml.push('<p class="desc">'+list[i].protype+' · '+list[i].bno+langData['siteConfig'][13][12]+'（'+langData['siteConfig'][19][857].replace('1', list[i].floor)+'）· '+list[i].zhuangxiu+'</p>');
									var addr = list[i].addr[1] != undefined ? '-'+list[i].addr[1] : '';
									houseHtml.push('<p class="addr">'+list[i].addr[0]+addr+'</p>');
									houseHtml.push('<p class="hInfo fn-clear"><span class="price fn-left">'+echoCurrency('symbol')+' <em>'+tprice+'</em> '+langData['siteConfig'][13][27]+'/'+langData['siteConfig'][13][18]+'<i>（'+list[i].area+echoCurrency('areasymbol')+'）</i></span><span class="fn-right">' + transTimes(list[i].pubdate, 3) + '</span></p>');

									houseHtml.push('</a>');
									houseHtml.push('</div>');

								// 厂房
								}else {
									var price = list[i].price, tprice = (price / 10000).toFixed(2);


									houseHtml.push('<div class="item">');
									houseHtml.push('<a href="'+list[i].url+'">');
									if (litpic != "" && litpic != undefined) {
										houseHtml.push('<img src="'+list[i].litpic+'" alt="" class="hImg">');
									}
									houseHtml.push('<p class="title">'+list[i].title+'</p>');
									houseHtml.push('<p class="desc">'+list[i].protype+'</p>');
									var addr = list[i].addr[1] != undefined ? '-'+list[i].addr[1] : '';
									houseHtml.push('<p class="addr">'+list[i].addr[0]+addr+'</p>');
									houseHtml.push('<p class="hInfo fn-clear"><span class="price fn-left">'+echoCurrency('symbol')+' <em>'+tprice+'</em> '+langData['siteConfig'][13][27]+'/'+langData['siteConfig'][13][18]+'<i>（'+list[i].area+echoCurrency('areasymbol')+'）</i></span><span class="fn-right">' + transTimes(list[i].pubdate, 3) + '</span></p>');

									houseHtml.push('</a>');
									houseHtml.push('</div>');

								}

              // 二手
              }else if(action == "info"){
                infoHtml.push('<div class="item">');
                infoHtml.push('<a href="' + list[i].url + '">');

								var rec = list[i].rec != '0' ? '<i class="jing">'+langData['siteConfig'][19][858]+'</i>' : '';
								var top = list[i].top != '0' ? '<i class="ding">'+langData['siteConfig'][19][855]+'</i>' : '';
                infoHtml.push('<p class="title fn-clear"><span class="fn-left">' + list[i].title + '</span>'+rec+top+'</p>');
                infoHtml.push('<p class="content">' + list[i].desc + '</p>');
								if (list[i].litpic != undefined) {
	                infoHtml.push('<div class="item-img"><img src="' + list[i].litpic + '"></div>');
								}
                infoHtml.push('<p class="item-tel"><em>' + list[i].tel + '</em> (' + list[i].teladdr + ')</p>');
                infoHtml.push('<div class="item-zan">' + list[i].typename + ' · ' + list[i].address + ' · ' + transTimes(list[i].pubdate, 3) + '</div>');
                infoHtml.push('</a>');
                infoHtml.push('</div>');

              }else{
              	var datalist = list;
              	var className = '', ftime='' ,care='',txt="";
         		if(datalist[i].state==1){
         			className = 'living';
         		}else if(datalist[i].state==2){
         			className = 'live_after';
         		}else{
         			className = 'live_before';
         			ftime='<em>'+datalist[i].ftime+'</em>'
         		}
         		liveHtml.push('<li class="video_box libox">');
					liveHtml.push('<a href="'+datalist[i].url+'">');
						liveHtml.push('<div class="video_img">');
							liveHtml.push('<span class="video_state '+className+'">'+ftime+'</span>');
							liveHtml.push('<img src="'+datalist[i].litpic+'" />');
						liveHtml.push('</div>');
						liveHtml.push('<div class="info_box">');
							liveHtml.push('<div class="look_num">'+datalist[i].click+'</div>');
							liveHtml.push('<div class="video_info">');
								liveHtml.push('<h3>'+datalist[i].title+'</h3>');
								liveHtml.push('<p>#'+(datalist[i].typename?datalist[i].typename:"其他")+'</p>');
							liveHtml.push('</div>	');
						liveHtml.push('</div>');
					liveHtml.push('</a>');
				liveHtml.push('</li>');
              }
            }
						$('.loading').remove();
            $('.article').append(articleHtml.join(""));
            $('.huodong').append(huodongHtml.join(""));
            $('.tieba').append(tiebaHtml.join(""));
            $('.house').append(houseHtml.join(""));
            $('.info').append(infoHtml.join(""));
			$('.live').append(liveHtml.join(""));

          }
        }
				loadMoreLock = false;

      }
    })

  }


	// 上滑下滑导航隐藏
	var upflag = 1, downflag = 1, fixFooter = $(".fixFooter, .navbar");
	//scroll滑动,上滑和下滑只执行一次！
	scrollDirect(function (direction) {
		var dom = $('.navbar').hasClass('fixed');
		if (direction == "down" && dom) {
			if (downflag) {
				fixFooter.hide();
				$('.gotop').hide();
				downflag = 0;
				upflag = 1;
			}
		}
		if (direction == "up") {
			if (upflag) {
				fixFooter.show();
				$('.gotop').show();
				downflag = 1;
				upflag = 0;
			}
		}
	});

	// 回到顶部
	$('.gotop').click(function(){
		$(window).scrollTop(navHeight + 2);
	})


})

var	scrollDirect = function (fn) {
  var beforeScrollTop = document.body.scrollTop;
  fn = fn || function () {
  };
  window.addEventListener("scroll", function (event) {
      event = event || window.event;

      var afterScrollTop = document.body.scrollTop;
      delta = afterScrollTop - beforeScrollTop;
      beforeScrollTop = afterScrollTop;

      var scrollTop = $(this).scrollTop();
      var scrollHeight = $(document).height();
      var windowHeight = $(this).height();
      if (scrollTop + windowHeight > scrollHeight - 10) {
          return;
      }
      if (afterScrollTop < 10 || afterScrollTop > $(document.body).height - 10) {
          fn('up');
      } else {
          if (Math.abs(delta) < 10) {
              return false;
          }
          fn(delta > 0 ? "down" : "up");
      }
  }, false);
}
