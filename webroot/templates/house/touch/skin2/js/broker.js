$(function() {

	var device = navigator.userAgent, isClick = true, isload = false;
	$('#broker-list').css('min-height', $(window).height() - $('.footer').height());

	// 新房点击电话弹框
	$('.house-list').delegate('.phone_icon', 'click', function(event){
		event.stopPropagation();
		event.preventDefault();
		$('.desk').show();
		$('.phone').show();
	});
	$('.signout').click(function(){
		$('.desk').hide();
		$('.phone').hide();
	});

	var detailList, getParid;
  detailList = new h5DetailList();
  setTimeout(function(){detailList.removeLocalStorage();}, 800);

	var dataInfo = {
			areaType: '',
			addrid: '',
			business: '',
			addrName: '',
			subway: '',
			station: '',
			price: '',
			priceName: '',
			area: '',
			areaName: '',
			room: '',
			rentype: '',
			salestate: '',
			times: '',
			buildtype: '',
			zhuangxiu: '',
			keywords: '',
			community: '',
			comid: '',
			isBack: true
	};

	$('#broker-list').delegate('.house-box', 'click', function(){
		var t = $(this), a = t.find('a'), url = a.attr('data-url');
		var room = $('.tab-room .active').attr('data-id'), salestate = $('.tab-salestate .active').attr('data-id'),
				times = $('.tab-times .active').attr('data-id'), buildtype = $('.tab-buildtype .active').attr('data-id'),
				zhuangxiu = $('.tab-zhuangxiu .active').attr('data-id'), rentype = $('.tab-rentype .active').attr('data-id');

		var tabArea = $(".tab-area"), areaType = tabArea.attr("data-type"),
				addrid = 0, business = 0, subway = 0, station = 0;

		if(areaType == "area"){
			addrid = Number(tabArea.attr("data-area"));
			business = Number(tabArea.attr("data-business"));
		}else if(areaType == "subway"){
			subway = Number(tabArea.attr("data-subway"));
			station = Number(tabArea.attr("data-station"));
		}

		var price = $(".tab-price").attr("data-id");
		price = price == undefined ? "" : price;

		var type = $(".tab-type").attr("data-id");
		type = type == undefined ? "" : type;

		//更新筛选条件
		dataInfo.areaType = areaType;
		dataInfo.addrid = addrid;
		dataInfo.business = business;
		dataInfo.subway = subway;
		dataInfo.station = station;
		dataInfo.addrName = $('.tab-area span').text();
		dataInfo.price = price;
		dataInfo.priceName = $('.tab-price span').text();
		dataInfo.area = type;
		dataInfo.areaName = $('.tab-type span').text();
		dataInfo.keywords = $('#search_keyword').val();
		// dataInfo.community = community;
		dataInfo.comid = comid;
		if (room != '') {dataInfo.room = room;}
		if (rentype != '') {dataInfo.rentype = rentype;}
		if (salestate != '') {dataInfo.salestate = salestate;}
		if (times != '') {dataInfo.times = times;}
		if (buildtype != '') {dataInfo.buildtype = buildtype;}
		if (zhuangxiu != '') {dataInfo.zhuangxiu = zhuangxiu;}

		detailList.insertHtmlStr(dataInfo, $("#broker-list").html(), {lastIndex: atpage});

        if(!wx_miniprogram && !baidu_miniprogram && !qq_miniprogram) {
            setTimeout(function () {
                location.href = url;
            }, 500);
        }

	})

	$('.mask').on('touchstart', function() {
		$(this).hide();
		$('.choose li').removeClass('active');
		$('.header').css('z-index', '99');
		$('.choose-box').css('z-index', '1002');
		$('.choose-box').removeClass('choose-top');
		$('.nav, .choose-local, .white').hide();
		isClick = true;
	})

	var xiding = $(".choose-box");
	var chtop = parseInt(xiding.offset().top);

	//var myscroll_price = new iScroll("scroll-price", {vScrollbar: false});
	//var myscroll_type = new iScroll("scroll-type", {vScrollbar: false});
	var myscroll_area = new iScroll("area-box", {vScrollbar: false});
	//var myscroll_subway = new iScroll("subway-box", {vScrollbar: false});
	var myscroll_first = new iScroll("scroll-first", {vScrollbar: false});

	// 选择
	$('.choose li').each(function(index) {
		$(this).click(function() {
			if (!$('.choose-box').hasClass('choose-top')) {
				isClick = false;
			}else {
				isClick = true;
			}
			if(index==0){
				if ($('.choose-local').eq(index).css("display") == "none") {
					$(this).addClass('active');
					$(this).siblings().removeClass('active');
					if (device.indexOf('huoniao_iOS') > -1) {
						// $('.choose-local').css('top', 'calc(.81rem + 20px)');
						// $('.white').css('margin-top', 'calc(.8rem + 20px)');
					}
					$('.choose-local').eq(index).show().siblings('.choose-local').hide();
					//myscroll_price.refresh();
					//myscroll_type.refresh();
					myscroll_area.refresh();
					//myscroll_subway.refresh();
					myscroll_first.refresh();
					$(this).parents('.choose-box').addClass('choose-top');

					$('.mask, .white').show();
					$('body').scrollTop(chtop);

				}else {
					$('.choose-local').eq(index).hide();
					$('.choose li').removeClass('active');
					$('.mask, .white').hide();
					$(this).parents('.choose-box').removeClass('choose-top');
				}
			}else{
				$(this).addClass('active');
				$(this).siblings().removeClass('active');
				$('.choose-local').eq(index).siblings('.choose-local').hide();
				$('.mask, .white').hide();
				$(this).parents('.choose-box').removeClass('choose-top');
				getList(1);
			}

		})
	})


	//var myscroll_more = new iScroll("more-box", {vScrollbar: false});
	$('.tab-more').click(function() {
		//myscroll_more.refresh();
	})

	$('.choose-local li').click(function() {
		$(this).addClass('active').siblings().removeClass('active');
	})

	$('#area').click(function() {
		$('#area-box').show();
		$('#subway-box').hide();
		$('.choose-local-first').removeClass('short-first');
		$('.choose-local-second').removeClass('short-second');
		$('.choose-local-third').hide();
	})
	$('#subway').click(function() {
		$('#subway-box').show();
		$('#area-box').hide();
		$('.choose-local-first').removeClass('short-first');
		$('.choose-local-second').removeClass('short-second');
		$('.choose-local-third').hide();
	})

	var myscroll3 = new iScroll("scroll-third", {vScrollbar: false});
	$('#area-box li').click(function() {
		if($(this).index() == 0) {
			chooseNormal();
			return false;
		}
		var id = $(this).attr("data-id");
		$('.choose-local-first').addClass('short-first');
		$('.choose-local-second').addClass('short-second');
		$('.area-third .choose-local-third').show();
		$("#scroll-third .scroll").html('<div class="loading">加载中...</div>');
		$.ajax({
			url: "/include/ajax.php?service=house&action=addr&type="+id,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					var list = [], info = data.info;
					list.push('<ul style="display:block;">');
					list.push('<li data-area="'+id+'" data-business="0"><a href="javascript:;">全部</a></li>');
					for(var i = 0; i < info.length; i++){
						list.push('<li data-area="'+id+'" data-business="'+info[i].id+'"><a href="javascript:;">'+info[i].typename+'</a></li>');
					}
					list.push('</ul>');

					$("#scroll-third .scroll").html(list.join(""));
					myscroll3.refresh();
				}else{
					var list = [];
					list.push('<li data-area="'+id+'" data-business="0"><a href="javascript:;">全部</a></li>');
					$("#scroll-third .scroll").html(list.join(""));
					myscroll3.refresh();
				}
			}
		});
	})

	function chooseNormal(){
		$('.choose-box').removeClass('choose-top');
		$('.choose-local-first').removeClass('short-first');
		$('.choose-local-second').removeClass('short-second');
		$('.area-third .choose-local-third').hide();
		$('.choose-local, .mask').hide();
		$('.choose li').removeClass('active');
		$('.tab-area span').html('不限');
		$('.white').hide();
		isClick = true;

		$(".tab-area").removeAttr("data-type");
		getList(1);
	};


	$('.area-third .choose-local-third, .subway-third .choose-local-third').delegate('li', 'click', function() {
		$('.choose-box').removeClass('choose-top');
		var t = $(this), dom = t.find('a').html();
		$('.tab-area span').html(dom);
		$('.choose li').removeClass('active');
		$('.choose-local, .mask, .white').hide();
		t.addClass("active").siblings("li").removeClass("active");
		isClick = true;

		//区域
		if(t.closest(".choose-local-third").attr("id") == "scroll-third"){
			$(".tab-area").attr("data-type", "area");
			$(".tab-area").attr("data-area", t.attr("data-area"));
			$(".tab-area").attr("data-business", t.attr("data-business"));
		}

		getList(1);

	})

	//选择价格
	// $('.choose-price li').click(function() {
	// 	$('.choose-box').removeClass('choose-top');
	// 	var t = $(this), dom = t.find('a').html();
	// 	$('.tab-price span').html(dom);
	// 	$(this).parents('.choose-local').hide();
	// 	$('.mask').hide();
	// 	$('.choose li').removeClass('active');
	// 	$('.white').hide();
	// 	isClick = true;

	// 	var price = t.attr("data-price");
	// 	price = price == undefined ? "" : price;
	// 	$(".tab-price").attr("data-id", price);
	// 	getList(1);

	// })

	// $('.choose-type li').click(function() {
	// 	$('.choose-box').removeClass('choose-top');
	// 	var t = $(this), dom = t.find('a').html();
	// 	$('.tab-type span').html(dom);
	// 	$(this).parents('.choose-local').hide();
	// 	$('.mask').hide();
	// 	$('.choose li').removeClass('active');
	// 	$('.white').hide();
	// 	isClick = true;

	// 	var type = t.attr("data-id");
	// 	type = type == undefined ? "" : type;
	// 	$(".tab-type").attr("data-id", type);
	// 	getList(1);

	// })

		// 重置
	$('.reset').click(function() {
		$('#more-box li').removeClass('active')
		$('#more-box .choose-more-condition').each(function(){
			$(this).find("li:eq(0)").addClass("active");
		});
	})
	$('.confirm').click(function() {
		$('.choose-box').removeClass('choose-top');
		$('.choose-local').hide();
		$('.white,.mask').hide();
		$('.tab-more').removeClass('active');
		isClick = true;
		getList(1);
	})

	// 搜索
	$('.search-box').submit(function(e){
		e.preventDefault();
		$('#search_button').click();
	})
	$('#search_button').click(function(){
		var keywords = $('#search_keyword').val();
		getList(1);
	})

	$(window).on("scroll", function() {
		var thisa = $(this);
		var st = thisa.scrollTop();
		if (st >= chtop) {
			$(".choose-box").addClass('choose-top');
			if (device.indexOf('huoniao_iOS') > -1) {
				$(".choose-box").addClass('padTop20');
			}
		} else {
			$(".choose-box").removeClass('choose-top padTop20');
		}
	});

	// 下拉加载
	$(document).ready(function() {
		$(window).scroll(function() {
			var h = $('.footer').height() + $('.house-box').height() * 2;
			var allh = $('body').height();
			var w = $(window).height();
			var scroll = allh - h - w;
			if ($(window).scrollTop() > scroll && !isload) {
				atpage++;
				getList();
			};
		});
	});

	// 上滑下滑导航隐藏
	var upflag = 1, downflag = 1, fixFooter = $(".choose-box");
	//scroll滑动,上滑和下滑只执行一次！
	scrollDirect(function (direction) {
		var dom = fixFooter.hasClass('choose-top');
		if (direction == "down" && dom && isClick) {
			if (downflag) {
				fixFooter.hide();
				downflag = 0;
				upflag = 1;
			}
		}
		if (direction == "up" && dom && isClick) {
			if (upflag) {
				fixFooter.show();
				downflag = 1;
				upflag = 0;
			}
		}
	});


	//初始加载
	if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){
    getList();
	}else {
		getData();
		setTimeout(function(){
			detailList.removeLocalStorage();
		}, 500)
	}

	function getList(tr){
		isload = true;

		if(tr){
			atpage = 1;
			$(".house-list").html("");
		}

		$(".house-list .loading").remove();
		$(".house-list").append('<div class="loading">加载中...</div>');

		var addrid = 0, business = 0, orderby = 0 ;
		var tabArea = $(".tab-area"), areaType = tabArea.attr("data-type");
		if(areaType == "area"){
			addrid = Number(tabArea.attr("data-area"));
			business = Number(tabArea.attr("data-business"));
			if(business){
				addrid = business;
			}
		}
		orderby = $(".choose .active").attr('data-id');
		orderby = orderby==undefined ? 0 : orderby;
		var data = [];
		data.push("page="+atpage);
		data.push("pageSize="+pageSize);
		data.push("comid="+comid);
		data.push("addrid="+addrid);
		data.push("orderby="+orderby);
		data.push("type=getnormal");
		var keywords = $('#search_keyword').val();
		if(keywords!=''){
			data.push("keywords="+keywords);
		}

		$.ajax({
            url: masterDomain+"/include/ajax.php?service=house&action=zjUserList",
            data: data.join("&"),
            type: "GET",
            dataType: "jsonp",
			success: function(data){
				if(data){
					if(data.state == 100){
						$(".house-list .loading").remove();
						var list = data.info.list, html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								html.push('<div class="house-box">');
								html.push('<a href="javascript:;" data-url="'+list[i].url+'">');
								html.push('<div class="house-item">');
								if(list[i].litpic == ''){
									html.push('');
								}else{
									html.push('<div class="jy_img l">'+(list[i].post == 2 ? '<span class="dz"></span>' : '')+'<img onerror="this.src=`/static/images/404.jpg`" src="'+list[i].litpic+'"></div>');
								}

								html.push('<dl>');
								var sf_rz = list[i].certify==1 ? '<span class="sf_rz">身份认证</span>' : '';
								var mp_rz = list[i].flag==1 ? '<span class="mp_rz">名片认证</span>' : '';
								html.push('<dt><em>'+list[i].nickname+'</em>'+sf_rz+mp_rz+'</dt>');
                                html.push('<dd class="jy-level">'+(list[i].level ? '<img alt="'+list[i].level.name+'" src="'+list[i].level.icon+'" />' : '')+'</dd>');
								html.push('<dd class="jy_item-area"><span><em>出租</em><em>'+list[i].zuCount+'</em></span><em>|</em><span><em>出售</em><em>'+list[i].saleCount+'</em></span><em>|</em><span><em>成交</em><em>'+list[i].sucCount+'</em></span></dd>');
								html.push('<dd class="item-type-1 jy-item-type-1 fn-clear"><em>' +list[i].address.join('&nbsp;&nbsp;') + '</em><button class="r">进入店铺</button></dd>');
								html.push('</dl>');
								html.push('</div>');
								html.push('<div class="clear"></div>');
								html.push('</a>');
								html.push('</div>');
							}
							$(".house-list").append(html.join(""));
							isload = false;

							//最后一页
							if(atpage >= data.info.pageInfo.totalPage){
								isload = true;
								$(".house-list").append('<div class="loading">已经到最后一页了</div>');
							}
						}else{
							isload = true;
							$(".house-list").append('<div class="loading">暂无相关信息</div>');
						}
					}else{
						$(".house-list .loading").html(data.info);
					}
				}else{
					$(".house-list .loading").html('加载失败');
				}
			},
			error: function(){
				isload = false;
				$(".house-list .loading").html('网络错误，加载失败！');
			}
		});
	}






	// 本地存储的筛选条件
	function getData() {
		var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];
		isload = false;
		areaType = filter.areaType;
		addrid = filter.addrid;
		business = filter.business;
		keywords = filter.keywords;
		community = filter.community;
		comid = filter.comid;
		atpage = detailList.getLocalStorage()['extraData'].lastIndex;

		if (areaType == 'area') {
			$('.tab-area').attr('data-type', areaType);
			$('#area').addClass('active').siblings('li').removeClass('active');
			$('#area-box').show();
			$('#subway-box').hide();
			$('#area-box li[data-id="'+addrid+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (addrid != '') {
			$('.tab-area').attr('data-area', addrid);
		}
		if (business != '') {
			$('.tab-area').attr('data-business', business);
		}
		if (keywords != '') {
			$('#search_keyword').val(keywords);
		}
		if (filter.addrName != "") {
			$('.tab-area span').text(filter.addrName);
		}
		if (filter.price != "") {
			$('.tab-price').attr('data-id', filter.price);
			$('#scroll-price li[data-price="'+filter.price+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.priceName != "") {
			$('.tab-price span').text(filter.priceName);
		}
		if (filter.area != "") {
			$('.tab-type').attr('data-id', filter.area);
			$('#scroll-type li[data-id="'+filter.area+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.areaName != "") {
			$('.tab-type span').text(filter.areaName);
		}
		if (filter.room != undefined) {
			$('.tab-room li[data-id="'+filter.room+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.salestate != undefined) {
			$('.tab-salestate li[data-id="'+filter.salestate+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.times != undefined) {
			$('.tab-times li[data-id="'+filter.times+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.buildtype != undefined) {
			$('.tab-buildtype li[data-id="'+filter.buildtype+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.zhuangxiu != undefined) {
			$('.tab-zhuangxiu li[data-id="'+filter.zhuangxiu+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.rentype != undefined) {
			$('.tab-rentype li[data-id="'+filter.rentype+'"]').addClass('active').siblings('li').removeClass('active');
		}
	}

})
