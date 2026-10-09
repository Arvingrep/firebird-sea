$(function(){

	//图片懒加载
	$("body img").scrollLoading();

  	if($('.all_shop li').length <= 0){
      $('.all_shop').hide();
    }

	if($.browser.msie && parseInt($.browser.version) >= 8){
		$('.pro_list .goods-item:nth-child(3n),.tuan_list .tuan_li:nth-child(3n),.module_box  .car_list li:nth-child(3n),.module_box .jy_list .hy_li:nth-child(3n),.module_box .travel_list .tscenic_li:nth-child(3n),.module_box .travel_list .trent_li:nth-child(3n),.module_box .travel_list .visa_li:nth-child(3n)').css('margin-right','0');
		$('.pro_type li:nth-child(8n),.art_type li:nth-child(12n),.house_list .agent_li:nth-child(2n)').css('margin-right','0');
		$('.job_list .zp_li:nth-child(1)').addClass('first_zp');
	}
	// 关闭遮罩层
	$(".mask,.pop_close,.knowed").click(function(){
		$('.mask').hide();
		$('.pop_box,.areaList').removeClass('show');
		$('html').removeClass('noscroll');
	});

	var pageDetail = pageData;

	$('.reno_ul').BlocksIt({
		numOfCol: 3,
		offsetX: 8,
		offsetY: 8,
		blockElement: '.grid'
	});

	// 浮动导航
	var mapTop = $('.map_box').offset().top;
	$(window).scroll(function(){
		var left = $('.body_content').offset().left;
		var top = $(".left_nav").offset().top;
		var scTop = $(window).scrollTop();

		if(scTop>=250){
			$(".left_nav").css({
				"position":"fixed",
				"left":(left-$(".left_nav").width()-64)+'px',
				"top":"0"
			})
		}else{
			$(".left_nav").css({
				"position":"absolute",
				"left":'-140px',
				"top":"250px"
			})
		}

		// 地图浮动
		if(scTop>mapTop){
			$('.map_box').css({
				"position":"fixed",
				"top":"0",
			})
		}else{
			$('.map_box').css({
				"position":"static",
			})
		}
	})

	// 点击切换
	$('.pro_type li').click(function(){
		var t = $(this);
		console.log(t.index());
		var par = t.parents('.module_box');
		clist = par.find('.mod_list');
		t.addClass('onclick').siblings('li').removeClass('onclick');
		clist.children('.tab_box').removeClass('show');
		clist.find('.tab_box').eq(t.index()).addClass('show');
		$('.reno_ul').BlocksIt({
			numOfCol: 3,
			offsetX: 8,
			offsetY: 8,
			blockElement: '.grid'
		});
	});

	// 焦点图
	$(".hotel_container").slide({mainCell:".hd",effect:"leftLoop",autoPlay:true});

	// 点击圈子相关内容
	var aa;
	$(".module_box").delegate(".art_ib,.art_con,.circle",'click',function(){
		if(aa){
			clearTimeout(aa);
		}
		$(".module_box .poster").show();
		aa = setTimeout(function(){
			$(".module_box .poster").hide();
		},5000)
	})

	$(".txtMarquee-top").slide({mainCell:".bd ul",autoPlay:true,effect:"topMarquee",vis:3,interTime:50});

	// 地图
	$('.appMapImg').attr('src', typeof MapImg_URL != "undefined" ? MapImg_URL : "");

	// 发送到手机
	$('.phone.tel').click(function(){
		$('.mask').show();
		$('.pop_box.send_pop').addClass('show');
		$('html').addClass('noscroll');
	});
	// 区号显示
	$('.aCode').click(function(e){
		var t = $(this);
		var p = t.parents('.phone_in');
		p.find('.areaList').toggleClass('show');
		$(document).one('click',function(){
			p.find('.areaList').removeClass('show');
		});
		 e.stopPropagation();  //停止事件传播
	});

	$(".sendTo.pop_btn").off('click').click(function(){
		var tel = $("#Totel1").val();
		var acode = $("#areaList1").val();
		var reg = "^(13|14|15|16|17|18|19)\d{9}$";
		if(tel==''){
			alert(langData['business'][5][6]);  //请输入发送到手机号
			return false;
		}else if(tel.match(reg)){
			alert(langData['business'][5][24]);  //请输入正确的手机号
			return false;
		}
		$.ajax({
			url: "/include/ajax.php?service=business&action=sendBusiness&id="+id+"&phone="+tel+"&areaCode="+$('#areacode').val(),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					alert(langData['business'][5][7]);   //发送成功
					$('.pop_box.send_pop').removeClass('show');
					$('.mask').hide();
				}else{
					alert(data.info);
				}
			}
		});
	})
	// 区号选择
	$('.areaList li').click(function(){
		var t = $(this);
		var areacode = t.attr('data-acode');
		var p1 = t.closest('.phone_in');
		var p2 = t.parents('.areaList');
		p1.find('input[name="areacode"]').val(areacode);
		p1.find('.aCode span').text('+'+areacode);
		p2.removeClass('show');
	});

	// 判断数目显示或隐藏更多按钮
	var devide_num = $(".li_devide").length;
	if(devide_num>12){
		$(".more_btn").removeClass('fn-hide')
	}else{
		$(".more_btn").addClass('fn-hide')
	}


	// $(".more_btn").click(function(e){
	// 	$(".device_more").toggle();
	// 	$(document).one('click',function(){
	// 		$(".device_more").hide();
	// 	});
	// 	e.stopPropagation();
	// });
	// 店铺认领
	$('.shop_rl').click(function(){
		$('.mask').show();
		$('.pop_box.access_pop').addClass('show');
		$('html').addClass('noscroll');
	});

	// 确定认领
	$(".subTo.pop_btn").click(function(){
		var t = $(this);
		var name = $("#uname").val();
		var tel = $("#Totel2").val();
		var reg = "^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\\d{8}$";
		if(name==''){
			alert(langData['business'][5][23]);  //请输入姓名
			return false;
		}else if(tel==''){
			alert(langData['business'][1][47]);  //请输入手机号
			return false;
		}else if(!tel.match(reg)){
			alert(langData['business'][5][24]);  //请输入正确的手机号
			return false;
		}
		$('.pop_box.access_pop').removeClass('show');
		$('.pop_box.success_pop').addClass('show');
	})



	// 收藏店铺
	$('.shoucang').click(function(){
		var t = $(this), type = t.hasClass("click") ? "del" : "add";
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
		  location.href = masterDomain + '/login.html';
		  return false;
		}
		if(type == 'add'){
			t.addClass('click').html(langData['business'][5][25]); //已收藏
		}else{
			t.removeClass('click').html('<img src="'+templets_skin+'images/care.png" alt="">'+langData['business'][2][12]);   //收藏
		}
		$.post("/include/ajax.php?service=member&action=collect&module=business&temp=detail&type="+type+'&id='+id);
	});


	isclick = 0;
	// 固定 链接定位
	$(window).scroll(function(){
		for(var i=0; i<$('.module_box').length; i++){
			var scroll = $('.module_box').eq(i).offset().top;
			if($(window).scrollTop() >=(scroll)-20 && !isclick){
				$('.left_nav li').eq(i).addClass('li_part').siblings('li').removeClass('li_part');
			}

		}
	});

	$('.left_nav li span').click(function(){
		isclick = 1;
		var  t = $(this).parents('li');
		t.addClass('li_part').siblings('li').removeClass('li_part');
		var index = t.index();
		var scroll = $('.module_box').eq(index).offset().top;
		$('html,body').animate({scrollTop:scroll}, 300);
		setTimeout(function(){
			isclick = 0;
		},300)
	});

	 //分享功能
	    $("html").delegate(".sharebtn", "mouseenter", function(){
	        console.log(0);
	        var t = $(this), title = t.attr("data-title"), url = t.attr("data-url"), pic = t.attr("data-pic"), site = encodeURIComponent(document.title);
	        title = title == undefined ? "" : encodeURIComponent(title);
	        url   = url   == undefined ? "" : encodeURIComponent(url);
	        pic   = pic   == undefined ? "" : encodeURIComponent(pic);
	        if(title != "" || url != "" || pic != ""){
	            $("#shareBtn").remove();
	            var offset = t.offset(),
	                left   = offset.left - 42 + "px",
	                top    = offset.top + 20 + "px",
	                shareHtml = [];
	            shareHtml.push('<s></s>');
	            shareHtml.push('<ul>');
	            shareHtml.push('<li class="tqq"><a href="http://share.v.t.qq.com/index.php?c=share&a=index&url='+url+'&title='+title+'&pic='+pic+'" target="_blank">腾讯微博</a></li>');
	            shareHtml.push('<li class="qzone"><a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url='+url+'&desc='+title+'&pics='+pic+'" target="_blank">QQ空间</a></li>');
	            shareHtml.push('<li class="qq"><a href="http://connect.qq.com/widget/shareqq/index.html?url='+url+'&desc='+title+'&title='+title+'&summary='+site+'&pics='+pic+'" target="_blank">QQ好友</a></li>');
	            shareHtml.push('<li class="sina"><a href="http://service.weibo.com/share/share.php?url='+url+'&title='+title+'&pic='+pic+'" target="_blank">腾讯微博</a></li>');
	            shareHtml.push('</ul>');

	            $("<div>")
	                .attr("id", "shareBtn")
	                .css({"left": left, "top": top})
	                .html(shareHtml.join(""))
	                .mouseover(function(){
	                    $(this).show();
	                    return false;
	                })
	                .mouseout(function(){
	                    $(this).hide();
	                })
	                .appendTo("body");
	        }
	    });

	    $("html").delegate(".sharebtn", "mouseleave", function(){
	        $("#shareBtn").hide();
	    });

	    $("html").delegate(".shareBtn a", "click", function(event){
	        event.preventDefault();
	        var href = $(this).attr("href");
	        var w = $(window).width(), h = $(window).height();
	        var left = (w - 760)/2, top = (h - 600)/2;
	        window.open(href, "shareWindow", "top="+top+", left="+left+", width=760, height=600");
	    });


		// 查看地图
		$(".thotel_ul .thotel_li").each(function(){
			var t = $(this),
			btn = t.find('a.h_addr'),
			lat = btn.attr('data-lat'),
			lng = btn.attr('data-lng');
			var address = btn.text().replace('查看地图','');
			var title = t.find('.h_info h3').text();
			var OpenMap_URL = ""; //跳转链接路径
			//跳转链接路径
			var userAgent1 = navigator.userAgent;
			var ua = navigator.userAgent.toLowerCase();//获取判断用的对象
			if (ua.match(/MicroMessenger/i) == "micromessenger") {
			    OpenMap_URL = "javascript:;";
			    if (pageDetail.mapType == "baidu") {
			        var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
			        var x = lng - 0.0065;
			        var y = lat - 0.006;
			        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
			        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
			         lng = z * Math.cos(theta);
			         lat = z * Math.sin(theta);
			    }
			}else if (pageDetail.mapType == "baidu") {
			    OpenMap_URL = "https://api.map.baidu.com/marker?location="+lat+","+lng+"&title="+title+"&content="+address+"&output=html"
			}else if (pageDetail.mapType == "google") {
			    OpenMap_URL = "https://www.google.com/maps/place/"+address+""+title
			}else if (pageDetail.mapType == "amap") {
			    OpenMap_URL = "https://m.amap.com/search/mapview/keywords="+title
			}else if (pageDetail.mapType == "qq") {
			    OpenMap_URL = "http://apis.map.qq.com/tools/poimarker?type=0&marker=coord:"+lat+","+lng+";title:"+title+"&key="+pageDetail.mapKey+"&referer=myapp"
			}
			btn.attr('href',OpenMap_URL);

		})



	//加载圈子数据
	if($('.circle_box').size() > 0){

		$.ajax({
			url: "/include/ajax.php?service=circle&action=tlist",
			type: "GET",
			data: {
				'pageSize': 6,
				'u': 1,
				'uid': uid
			},
			dataType: "json", //指定服务器返回的数据类型
			crossDomain: true,
			success: function(data) {
				if (data.state == 100) {
					var list = [];
					var datalist = data.info.list;
					var info = datalist[0];

					list.push('<div class="art_ib">');
					list.push('<div class="left_head">');
					list.push('<img src="'+info.photo+'" onerror="this.src=\'/static/images/noPhoto_40.jpg\'">');
					list.push('<div class="v_log fn-hide"></div>');
					list.push('</div>');
					list.push('<div class="r_info vip_icon">');
					list.push('<h4><span class="artname">'+info.username+'</span></h4>');
					list.push('<p class="pub_time">'+info.pubdate1+'</p>');
					list.push('</div></div>');
					list.push('<div class="art_con '+(info.zan > customhot ? 'hot_tag' : '')+'">');
					list.push('<h2><img src="'+templets_skin+'images/hot.png" alt="">'+info.content+'</h2>');
					list.push('<div class="img_con '+(info.media.length > 2 ? 'three_box' : '')+'">');
					for (var i = 0; i < info.media.length; i++) {
						if(i < 3){
							list.push('<div class="img_box"><img src="'+info.media[i]+'" onerror="this.src=\'/static/images/404.jpg\'" /></div>');
						}
					}
					list.push('</div>');

					//链接
					if(info.commodity != '' && info.commodity.length>0){
						list.push('<a class="link_out" href="javascript:;">');
						list.push('<div class="left_img"><img src="'+info.commodity[0]['litpic']+'" onerror="this.src=\''+templets_skin+'images/link.png\'"></div>');
						list.push('<p>'+info.commodity[0]['title']+'</p>');
						list.push('</a>');
					}

					//话题
					if(info.topictitle){
						list.push('<a class="topic_link" href="javascript:;"><img src="'+templets_skin+'images/topic.png">'+info.topictitle+'</a>');
					}

					//定位
					if(info.addrname){
						list.push('<a href="javascript:;" class="posi"><img src="'+templets_skin+'images/posi.png">'+info.addrname+'</a>');
					}

					list.push('<div class="zanbox">');

					//点赞列表
					if(info.dianres.length > 0){
						list.push('<div class="zan_list"><ul>');
						for (var i = 0; i < info.dianres.length; i++) {
							list.push('<li><img src="'+info.dianres[i].photo+'" onerror="this.src=\'/static/images/noPhoto_40.jpg\'"></li>');
						}
						list.push('</ul><span class="zan_count"><em>'+info.zan+'赞</em></span></div>');
					}

					list.push('<div class="btns"><ul><li class="more"><img src="'+templets_skin+'images/more_1.png"></li><li class="share"><img src="'+templets_skin+'images/share.png"></li><li class="commt"><img src="'+templets_skin+'images/commt.png">'+info.reply+'</li></ul></div>');

					list.push('</div>');

					//评论列表
					if(info.reply > 0 && info.lastReply.length > 0){
						list.push('<div class="comt_list"><ul class="comt_ul">');
						for (var i = 0; i < info.lastReply.length; i++) {
							list.push('<li class="comt_li"><a href="javascript:;">'+info.lastReply[i].nickname+'</a>：'+info.lastReply[i].content+'</li>');
						}
						list.push('<a href="javascript:;">全部'+info.reply+'条评论></a>');
						list.push('</ul><div class="commt_btn">'+langData['circle'][0][53]+'</div></div>');  //写评论...
					}
					list.push('</div>');

					$('.circle_box').html(list.join(''));

					//更多
					if(data.info.pageInfo.totalCount > 1){

						var list = [];
						for (var i = 1; i < datalist.length; i++) {
							if(datalist[i].media.length > 0){
								list.push('<li title="'+datalist[i].content+'"><img src="'+datalist[i].media[0]+'" onerror="this.src=\'/static/images/404.jpg\'" /></li>');
							}
						}
						list.push('<li class="more_li"><span>'+langData['business'][2][25]+'</span></li>');  //更多圈子动态
						$('.circle_more').html(list.join(''));
						$('.box2.circle').show();

					}else{
						$('.box2.circle').remove();
					}
				}else{
					$('.circle_box').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
				}
			}
		})

	}


	//加载养老数据
	if($('.pension_detail').size() > 0){

		$.ajax({
            type: "POST",
            url: "/include/ajax.php",
            dataType: "json",
            data: 'service=pension&action=storeDetail&id='+$('.pension_detail').data('sid'),
            success: function(data) {
                if(data.state == 100){
                    var info = data.info;
                    var html = [];
					var homepage = $('.pension_detail').data('homepage');

					html.push('<div class="pension_banner fn-clear">');
					html.push('<div class="right_img">');
					html.push('<div class="img_box"><a href="'+homepage+'" target="_blank"><img src="'+info.pics[1]['path']+'" /></a></div>');
					html.push('<div class="img_box"><a href="'+homepage+'" target="_blank"><img src="'+info.pics[2]['path']+'" /></a></div>');
					html.push('</div>');
					html.push('<div class="left_img"><div class="l_img"><a href="'+homepage+'" target="_blank"><img src="'+info.pics[0]['path']+'" /></a></div></div>');
					html.push('</div>');
					html.push('<div class="pension_info">');
					html.push('<h1><a href="'+homepage+'" target="_blank">'+info.title+'</a></h1>');
					html.push('<div class="pension_price">'+echoCurrency('symbol')+'<em>'+info.price+'</em>'+langData['siteConfig'][19][836]+'</div>');  //起
					html.push('<div class="text">');
					html.push('<p><i><img src="'+templets_skin+'images/pen_1.png"></i>' + langData['business'][4][44] + '：' + info.typeidArr.join('、') + '</p>');  //机构类型
					html.push('<p><i><img src="'+templets_skin+'images/pen_2.png"></i>' + langData['business'][4][45] + '：' + info.servicecontentArr.join('、') + '</p>');  //服务内容
					html.push('<p><i><img src="'+templets_skin+'images/pen_3.png"></i>' + langData['business'][4][46] + '：' + info.targetcareArr.join('、') + '</p>');  //照顾对象
					html.push('<a href="'+homepage+'" target="_blank" class="h_posi"><i><img src="'+templets_skin+'images/posi_5.png"></i>' + langData['business'][4][47] + '：' + info.addrname[info.addrname.length-2]+' - '+info.addrname[info.addrname.length-1] + ' ' + info.address + '<span>'+langData['business'][3][45]+'</span></a>');  //查看地图
					html.push('</div>');
					html.push('<a href="'+homepage+'" target="_blank" class="pdetail_link">'+langData['business'][4][48]+'</a>');  //查看机构详情
					html.push('</div>');

					if(info.awarddesc){
						html.push('<div class="pension_adv">');
						html.push('<div class="adv_con">');
						html.push('<h3>'+langData['business'][5][71]+'</h3>');  //入住有奖
						html.push('<p>'+info.awarddesc+'</p>');
						html.push('</div>');
						html.push('<img src="{#$templets_skin#}images/pension_bg.png" alt="">');
						html.push('</div>');
					}

                    $('.pension_detail').html(html.join(''));

                }else{
					$('.pension_detail').html('<p class="empty">'+langData['siteConfig'][20][126]+'</p>');  //暂无相关信息！
				}
            }
        });

	}

})
