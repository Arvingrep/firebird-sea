$(function() {

	var device = navigator.userAgent, isClick = true, isload = false;
	$('#sale-list').css('min-height', $(window).height() - $('.footer').height());

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
			direction: '',
			buildage: '',
			floor: '',
			zhuangxiu: '',
			keywords: '',
			community: '',
			comid: '',
			isBack: true
	};

	$('#sale-list').delegate('.house-box', 'click', function(){
		var t = $(this), a = t.find('a'), url = a.attr('data-url');
		var room = $('.tab-room .active').attr('data-id'), direction = $('.tab-direction .active').attr('data-id'),
				buildage = $('.tab-buildage .active').attr('data-id'), floor = $('.tab-floor .active').attr('data-id'),
				zhuangxiu = $('.tab-zhuangxiu .active').attr('data-id');

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
		dataInfo.community = community;
		dataInfo.comid = comid;
		if (room != '') {dataInfo.room = room;}
		if (direction != '') {dataInfo.direction = direction;}
		if (buildage != '') {dataInfo.buildage = buildage;}
		if (floor != '') {dataInfo.floor = floor;}
		if (zhuangxiu != '') {dataInfo.zhuangxiu = zhuangxiu;}

		detailList.insertHtmlStr(dataInfo, $("#sale-list").html(), {lastIndex: atpage});

       if(!wx_miniprogram && !baidu_miniprogram && !qq_miniprogram) {
            setTimeout(function () {
                location.href = url;
            }, 500);
        }

	})

	$('.h-menu').on('click', function() {
		if ($('.nav,.mask').css("display") == "none") {
			$('.nav,.mask').show();
			$('.header').css('z-index', '101');
			$('.choose-box').css('z-index', '88');

		} else {
			$('.nav,.mask').hide();
			$('.header').css('z-index', '99');
			$('.choose-box').css('z-index', '1002');

		}
	})

	$('.mask').on('touchstart', function() {
		$(this).hide();
		$('.nav').hide();
		$('.choose-local').hide();
		$('.choose li').removeClass('active');
		$('.header').css('z-index', '99');
		$('.choose-box').css('z-index', '1002');
		$('.choose-box').removeClass('choose-top');
		$('.white').hide();
		isClick = true;
	})

	var xiding = $(".choose-box");
	var chtop = parseInt(xiding.offset().top);

	var myscroll_price = new iScroll("scroll-price", {vScrollbar: false});
	var myscroll_type = new iScroll("scroll-type", {vScrollbar: false});
	var myscroll_area = new iScroll("area-box", {vScrollbar: false});
	var myscroll_subway = new iScroll("subway-box", {vScrollbar: false});
	var myscroll_first = new iScroll("scroll-first", {vScrollbar: false});

	// 选择
	$('.choose li').each(function(index) {
		$(this).click(function() {
			if (!$('.choose-box').hasClass('choose-top')) {
				isClick = false;
			}else {
				isClick = true;
			}
			if ($('.choose-local').eq(index).css("display") == "none") {
				$(this).addClass('active');
				$(this).siblings().removeClass('active');
				if (device.indexOf('huoniao_iOS') > -1) {
					// $('.choose-local').css('top', 'calc(.81rem + 20px)');
					// $('.white').css('margin-top', 'calc(.8rem + 20px)');
				}
				$('.choose-local').eq(index).show().siblings('.choose-local').hide();
				myscroll_price.refresh();
				myscroll_type.refresh();
				myscroll_area.refresh();
				myscroll_subway.refresh();
				myscroll_first.refresh();
				$(this).parents('.choose-box').addClass('choose-top');

				$('.mask, .white').show();
				$('body').scrollTop(chtop);

			} else {
				$('.choose-local').eq(index).hide();
				$('.choose li').removeClass('active');
				$('.mask, .white').hide();
				$(this).parents('.choose-box').removeClass('choose-top');
			}

		})
	})

	var myscroll_more = new iScroll("more-box", {vScrollbar: false});
	$('.tab-more').click(function() {
		myscroll_more.refresh();
	})

	$('.choose-local li').click(function() {
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
	})

	$('#area').click(function() {
		$('#area-box').show();
		$('#subway-box').hide();
		$('.choose-local-first').removeClass('short-first');
		$('.choose-local-second').removeClass('short-second');
		$('.choose-local-third').hide();
		myscroll_area.refresh();

	})
	$('#subway').click(function() {
		$('#subway-box').show();
		$('#area-box').hide();
		$('.choose-local-first').removeClass('short-first');
		$('.choose-local-second').removeClass('short-second');
		$('.choose-local-third').hide();
		myscroll_subway.refresh();
	})

	var myscroll3 = new iScroll("scroll-third", {vScrollbar: false});
	$('#area-box li').click(function(index) {
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
			dataType: "json",
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

	var myscroll4 = new iScroll("scroll-third-s", {vScrollbar: false});
	$('#subway-box li').click(function(index) {
		if($(this).index() == 0) {
			chooseNormal();
			return false;
		}
		var id = $(this).attr("data-id");
		$('.choose-local-first').addClass('short-first');
		$('.choose-local-second').addClass('short-second');
		$('.subway-third .choose-local-third').show();
		$("#city-second").html('<div class="loading">加载中...</div>');
		$.ajax({
			url: "/include/ajax.php?service=siteConfig&action=subwayStation&type="+id,
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){
					var list = [], info = data.info;
					list.push('<ul style="display:block;">');
					list.push('<li data-subway="'+id+'" data-station="0"><a href="javascript:;">全部</a></li>');
					for(var i = 0; i < info.length; i++){
						list.push('<li data-subway="'+id+'" data-station="'+info[i].id+'"><a href="javascript:;">'+info[i].title+'</a></li>');
					}
					list.push('</ul>');

					$("#scroll-third-s .scroll").html(list.join(""));
					myscroll4.refresh();
				}
			}
		});
	})

	function chooseNormal(){
		$('.choose-box').removeClass('choose-top');
		$('.choose-local-first').removeClass('short-first');
		$('.choose-local-second').removeClass('short-second');
		$('.area-third .choose-local-third').hide();
		$('.choose-local').hide();
		$('.mask').hide();
		$('.choose li').removeClass('active');
		$('.tab-area span').html('不限');
		$('.white').hide();
		isClick = true;

		$('.tab-area').attr('data-area', '0').attr('data-subway', '0').attr('data-station', '0');

		$(".tab-area").removeAttr("data-type");
		getList(1);
	}


	$('.area-third .choose-local-third, .subway-third .choose-local-third').delegate('li', 'click', function() {
		$('.choose-box').removeClass('choose-top');
		var t = $(this), dom = t.find('a').html();
		$('.tab-area span').html(dom);
		$('.choose-local').hide();
		$('.mask').hide();
		$('.choose li').removeClass('active');
		$('.white').hide();
		t.addClass("active").siblings("li").removeClass("active");
		isClick = true;

		//区域
		if(t.closest(".choose-local-third").attr("id") == "scroll-third"){
			$(".tab-area").attr("data-type", "area");
			$(".tab-area").attr("data-area", t.attr("data-area"));
			$(".tab-area").attr("data-business", t.attr("data-business"));

		//公交/地铁
		}else{
			$(".tab-area").attr("data-type", "subway");
			$(".tab-area").attr("data-subway", t.attr("data-subway"));
			$(".tab-area").attr("data-station", t.attr("data-station"));
		}

		getList(1);

	})

	//选择价格
	$('.choose-price li').click(function() {
		$('.choose-box').removeClass('choose-top');
		var t = $(this), dom = t.find('a').html();
		$('.tab-price span').html(dom);
		$(this).parents('.choose-local').hide();
		$('.mask').hide();
		$('.choose li').removeClass('active');
		$('.white').hide();
		isClick = true;

		var price = t.attr("data-price");
		price = price == undefined ? "" : price;
		$(".tab-price").attr("data-id", price);
		getList(1);

	})

	// 自定义价格
	$('.choose-price').delegate('.btn_submit', 'click', function(event) {
		$('.choose-box').removeClass('choose-top');
        var pri_1 = $(".choose-price .inp_box .p1").val();
        var pri_2 = $(".choose-price .inp_box .p2").val();
        price_section = pri_1 + ',' + pri_2;
        $('.tab-price span').html(pri_1+'-'+pri_2 + '万');
        if (!pri_1 && !pri_2) {
            $(".choose-price .inp_box .p1").val('');
            $(".choose-price .inp_box .p2").val('');
            alert('请输入价格');
        } else if (pri_1 && pri_2 && parseInt(pri_1) > parseInt(pri_2)) {
        	alert('价格上限应该大于下限');
        } else {
            $(this).parents(".choose-local").find('li').removeClass('active');
            $('.choose-price .inp_box').addClass('curr');
        }
        $(this).parents('.choose-local').hide();
        $('.mask').hide();
        $('.choose li').removeClass('active');
        $('.white').hide();
        isClick = true;

        var price = price_section;
		price = price == undefined ? "" : price;
		$(".tab-price").attr("data-id", price);
        getList(1);

	});


	$('.choose-type li').click(function() {
		$('.choose-box').removeClass('choose-top');
		var t = $(this), dom = t.find('a').html();
		$('.tab-type span').html(dom);
		$(this).parents('.choose-local').hide();
		$('.mask').hide();
		$('.choose li').removeClass('active');
		$('.white').hide();
		isClick = true;

		var type = t.attr("data-area");
		type = type == undefined ? "" : type;
		$(".tab-type").attr("data-id", type);
		getList(1);

	})

	// 自定义面积
	$('.choose-type').delegate('.btn_submit', 'click', function() {
		$('.choose-box').removeClass('choose-top');
        var area_1 = $(".choose-type .inp_box .p1").val();
        var area_2 = $(".choose-type .inp_box .p2").val();
        area_section = area_1 + ',' + area_2;
        console.log(area_section)
        $('.tab-type span').html(area_1+'-'+area_2 + echoCurrency('areasymbol'));
        if (!area_1 && !area_2) {
            $(".choose-type .inp_box .p1").val('');
            $(".choose-type .inp_box .p2").val('');
            alert('请输入面积');
        } else if (area_1 && area_2 && parseInt(area_1) > parseInt(area_2)) {
        	alert('面积上限应该大于下限');
        } else {
            $(this).parents(".choose-local").find('li').removeClass('active');
            $('.choose-type .inp_box').addClass('curr');
        }
        $(this).parents('.choose-local').hide();
        $('.mask').hide();
        $('.choose li').removeClass('active');
        $('.white').hide();
        isClick = true;

        var area = area_section;
		area = area == undefined ? "" : area;
		$(".tab-type").attr("data-id", area);
        getList(1);
	});

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

	//数据列表
	function getList(tr){

		isload = true;

		//如果进行了筛选或排序，需要从第一页开始加载
		if(tr){
			atpage = 1;
			$(".house-list").html("");
		}

		//自定义筛选内容
		var item = [];

		$(".house-list .loading").remove();
		$(".house-list").append('<div class="loading">加载中...</div>');

		//请求数据
		var data = [];
		data.push("pageSize="+pageSize);

		var tabArea = $(".tab-area"), areaType = tabArea.attr("data-type"),
				addrid = 0, business = 0, subway = 0, station = 0;

		if(areaType == "area"){
			addrid = Number(tabArea.attr("data-area"));
			business = Number(tabArea.attr("data-business"));
			if(business){
				addrid = business;
			}
		}else if(areaType == "subway"){
			subway = Number(tabArea.attr("data-subway"));
			station = Number(tabArea.attr("data-station"));
		}
		data.push("addrid="+addrid);
		data.push("subway="+subway);
		data.push("station="+station);

		var price = $(".tab-price").attr("data-id");
		price = price == undefined ? "" : price;
		if(price != ""){
			data.push("price="+price);
		}
		data.push("community="+community);
		data.push("comid="+comid);

		var type = $(".tab-type").attr("data-id");
		type = type == undefined ? "" : type;
		if(type != ""){
			data.push("area="+type);
		}

		//更新筛选条件
		$(".choose-more-condition").each(function(){
			var t = $(this), type = t.attr("data-type"), val = t.find(".active").attr('data-id');
			if(val != undefined && val != ""){
				data.push(type+"="+val);
			}
		});

		data.push("page="+atpage);

		var keywords = $('#search_keyword').val();
		data.push("keywords="+keywords);
		data.push("orderby=1");

		$.ajax({
			url: "/include/ajax.php?service=house&action=saleList",
			data: data.join("&"),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data){
					if(data.state == 100){
						$(".house-list .loading").remove();
						var list = data.info.list, html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								if (list[i].sellstate==1) {
									var saleIcon = '<i class="sale_icon"></i>';
									var cla = 'over_house';
								}else{
									var saleIcon = '';
									var cla = '';
								}
								html.push('<div class="house-box '+cla+'">');								
								html.push('<a href="javascript:;" data-url="'+list[i].url+'">');
								html.push(saleIcon);//房源已售
								html.push('<div class="house-item">');
								var video = list[i].video==1 ? '<i class="play_img"></i>' : '';
								var vr    = list[i].qj==1 ? '<i class="VR_img"></i>' : '';
								var typestate = list[i].usertype==1 ? '<em class="zhongjie">中介</em>' : '<em class="geren">个人</em>';
								if(list[i].litpic ==''){
									html.push('');
								}else{
									html.push('<div class="house-img l"><i class="house_disk"></i><img onerror="this.src=`/static/images/404.jpg`" src="'+huoniao.changeFileSize(list[i].litpic, "large")+'">'+video+vr+typestate+'</div>');
								}
								
								html.push('<dl>');
								var top = list[i].isbid==1 ? '<i class="set_top"></i>' : '';
								var vrstate = list[i].qj==1 ? '<span class="label_01">全景</span>' : '';
								html.push('<dt>'+top+'<em>'+list[i].title+'</em>'+vrstate+'</dt>');

								//区域
								html.push('<dd class="item-area"><em>'+list[i].room+'</em>');
								html.push('<em>'+list[i].area+echoCurrency('areasymbol')+'</em>');
								html.push('<span class="price r">'+(list[i].price > 0 ? (list[i].price+'万'+echoCurrency('short')) : '价格面议')+'</span>');

								html.push('</dd>');

								html.push('<dd class="item-type-1 fn-clear">');
								if(list[i].unitprice > 0) {
                                    html.push('<em class="l">' + list[i].community + '</em><em class="r">均价 ' + list[i].unitprice + ''+echoCurrency('short')+'/'+echoCurrency('areaname')+'</em>');
                                }

								html.push('</dd>')

								html.push('</dl>')
								html.push('</div>')
								html.push('<div class="clear"></div>')
								html.push('</a>')
								html.push('</div>')


							}

							$(".house-list").append(html.join(""));
							isload = false;

							//最后一页
							if(atpage >= data.info.pageInfo.totalPage){
								isload = true;
								$(".house-list").append('<div class="loading">已经到最后一页了</div>');
							}

						//没有数据
						}else{
							isload = true;
							$(".house-list").append('<div class="loading">暂无相关信息</div>');
						}

					//请求失败
					}else{
						$(".house-list .loading").html(data.info);
					}

				//加载失败
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
		subway = filter.subway;
		station = filter.station;
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
		}else {
			$('.tab-area').attr('data-type', areaType);
			$('#subway').addClass('active').siblings('li').removeClass('active');
			$('#area-box').hide();
			$('#subway-box').show();
			$('#subway-box li[data-id="'+subway+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (addrid != '') {
			$('.tab-area').attr('data-area', addrid);
		}
		if (business != '') {
			$('.tab-area').attr('data-business', business);
		}
		if (subway != '') {
			$('.tab-area').attr('data-subway', subway);
		}
		if (station != '') {
			$('.tab-area').attr('data-station', station);
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
			$('#scroll-type li[data-area="'+filter.area+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.areaName != "") {
			$('.tab-type span').text(filter.areaName);
		}
		if (filter.room != undefined) {
			$('.tab-room li[data-id="'+filter.room+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.direction != undefined) {
			$('.tab-direction li[data-id="'+filter.direction+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.buildage != undefined) {
			$('.tab-buildage li[data-id="'+filter.buildage+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.floor != undefined) {
			$('.tab-floor li[data-id="'+filter.floor+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.zhuangxiu != undefined) {
			$('.tab-zhuangxiu li[data-id="'+filter.zhuangxiu+'"]').addClass('active').siblings('li').removeClass('active');
		}
	}


})
