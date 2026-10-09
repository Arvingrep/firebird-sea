$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

	var	isload = false, isClick = true, lng = '', lat = '',
			xiding = $(".choose"),
			chtop = parseInt(xiding.offset().top),
			device = navigator.userAgent;



	var detailList;
  detailList = new h5DetailList();
  setTimeout(function(){detailList.removeLocalStorage();}, 500);

	var dataInfo = {
			id: '',
			url: '',
			parid: '',
			typeid: '',
			typename: '',
			cityName: '',
			addrid: '',
			business: '',
			subway: '',
			station: '',
			orderby: '',
			orderbyName: '',
			isBack: true
	};

	// 显示下拉框
	$('.choose-tab li').click(function(){
		var index = $(this).index();
		var local = $('.choose-local').eq(index);
		if (!$('.choose').hasClass('choose-top')) {
			isClick = false;
		}else {
			isClick = true;
		}
		if ( local.css("display") == "none") {
			$(this).addClass('active').siblings('.choose-tab li').removeClass('active');
			local.show().siblings('.choose-local').hide();
			$('.mask').show();
			// $('body').scrollTop(chtop);
		}else{
			$(this).removeClass('active');
			local.hide();
			$('.mask').hide();
		}
	})

	// 分类
	var myscroll = new iScroll("choose-food", {vScrollbar: false});
	var myscroll0 = null;
	$('.food').click(function() {
		$('#choose-food').css('width','100%');
		$('.city-second,.more-second').hide();
		myscroll.refresh();
	});
	$('.choose-food li').click(function() {
		var html = $(this).find('.name').html(), id = $(this).attr("data-id");
		var dom = $(this).hasClass('right-more');
		$(this).addClass('active').siblings('.choose-food li').removeClass('active');
		$('.choose-tab .food').attr('data-id', id);
		if (dom) {
			$('.more-second').show();
			$('#choose-food').css('width', '40%');
			$("#more-second").html('<div class="loading">加载中...</div>');

			$.ajax({
				url: "/include/ajax.php?service=tuan&action=type&type="+id,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						var list = [], info = data.info;
						list.push('<ul>');
						var url = typeUrl.replace("%id%", id);
						list.push('<li data-id=""><a href="javascript:;" data-url="'+url+'" ><span class="sub-name">全部</span></a></li>');
						for(var i = 0; i < info.length; i++){
							var url = typeUrl.replace("%id%", info[i].id);
							list.push('<li data-id="'+info[i].id+'"><a href="javascript:;" data-url="'+url+'"><span class="sub-name">'+info[i].typename+'</span></a></li>');
						}
						list.push('</ul>');

						$("#more-second").html(list.join(""));
						myscroll0 = new iScroll("more-second", {vScrollbar: false});

					}else{
						$("#more-second").html('<div class="loading">'+data.info+'</div>');
						myscroll0 = new iScroll("more-second", {vScrollbar: false});
					}
				}
			});

		} else {
			$('#choose-food').css('width', '100%');
			$('.more-second').hide();
			$('.food span').html(html);
			$('.food').removeClass('active');
			$('.choose-local,.mask').hide();
			getList(1);
		}
	})



	// 全城
	var myscroll1 = new iScroll("choose-city-sq", {vScrollbar: false});
	var myscroll2 = new iScroll("choose-city-dt", {vScrollbar: false});
	var myscroll3 = null;
	$('.city').click(function(){
		$('.more-second').hide();
		$('.choose-city-area').css('width','100%');
		myscroll1.refresh();
		myscroll2.refresh();
	});
	$('.choose-area a').click(function(){
		$('.city-second').hide();
		$('.choose-city-area').css('width','100%')
		$(this).addClass('active').siblings('.choose-area a').removeClass('active');
		var index = $(this).index();
		$('.choose-city-area').eq(index).show().siblings('.choose-city-area').hide();
	})

	$('#choose-city-sq li').click(function(){
		var html = $(this).find('.name').text();
		var dom = $(this).hasClass('right-more');
		var id = $(this).attr("data-id");
		$('.choose-tab .city span').text(html);
		$(this).addClass('active').siblings('.choose-city-area li').removeClass('active');
		$('.choose-tab .city').attr('data-addrid', id);
		if (dom) {
			$('.city-second').show();
			$('.choose-city-area').css('width','40%');
			$("#city-second").html('<div class="loading">加载中...</div>');

			$.ajax({
				url: "/include/ajax.php?service=tuan&action=circle&type="+id,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						var list = [], info = data.info;
						list.push('<ul>');
						var url = addrUrl.replace("%addr%", id).replace("%circle%", 0);
						list.push('<li data-id=""><a href="javascript:;" data-url="'+url+'"><span class="sub-name">全部</span></a></li>');
						for(var i = 0; i < info.length; i++){
							var url = addrUrl.replace("%addr%", id).replace("%circle%", info[i].id);
							list.push('<li data-id="'+info[i].id+'"><a href="javascript:;" data-url="'+url+'"><span class="sub-name">'+info[i].name+'</span></a></li>');
						}
						list.push('</ul>');

						$("#city-second").html(list.join(""));
						myscroll3 = new iScroll("city-second", {vScrollbar: false});
					}else{
						$("#city-second").html('<div class="loading">'+data.info+'</div>');
						myscroll3 = new iScroll("city-second", {vScrollbar: false});
					}
				}
			});
		}else {
			$('#choose-city-sq').css('width', '100%');
			$('.more-second, .choose-local').hide();
			$('.city span').html(html);
			$('.city').removeClass('active').attr('data-addrid', '').attr('data-business', '').attr('data-subway', '').attr('data-station', '');
			$('.city-second, .mask').hide();
			getList(1);
		}
	});

	//公交地铁
	$('#choose-city-dt li').click(function(){
		var html = $(this).find('span').html();
		var dom = $(this).hasClass('right-more');
		var id = $(this).attr("data-id");
		$('.choose-tab .city span').text(html);
		$(this).addClass('active').siblings('.choose-city-area li').removeClass('active');
		$('.choose-tab .city').attr('data-subway', id);
		if (dom) {
			$('.city-second').show();
			$('.choose-city-area').css('width','40%');
			$("#city-second").html('<div class="loading">加载中...</div>');

			$.ajax({
				url: "/include/ajax.php?service=siteConfig&action=subwayStation&type="+id,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						var list = [], info = data.info;
						list.push('<ul>');
						var url = addrUrl.replace("%addr%", id).replace("%circle%", 0);
						list.push('<li data-id=""><a href="'+url+'"><span class="sub-name">全部</span></a></li>');
						for(var i = 0; i < info.length; i++){
							var url = subwayUrl.replace("%subway%", id).replace("%station%", info[i].id);
							list.push('<li data-id="'+info[i].id+'"><a href="javascript:;"><span class="sub-name">'+info[i].title+'</span></a></li>');
						}
						list.push('</ul>');

						$("#city-second").html(list.join(""));
						myscroll3 = new iScroll("city-second", {vScrollbar: false});
					}else{
						$("#city-second").html('<div class="loading">'+data.info+'</div>');
						myscroll3 = new iScroll("city-second", {vScrollbar: false});
					}
				}
			});

		}
	});


	// 默认排序
	$('.sort').click(function(){
		$('.city-second,.more-second').hide();
		myscrollSort.refresh();
	});

	// 筛选
	$('.screen').click(function(){
		$('.city-second,.more-second').hide();
		myscrollFilter.refresh();
	})
	$('.eat-time li').click(function(){
		$(this).addClass('active').siblings('.eat-time li').removeClass('active');
	})
	$('.end-box .reset').click(function(){
		$('.eat-time').find('li:first').addClass('active').siblings('.eat-time li').removeClass('active');
		$('.sx-line input').prop("checked", false);
	})
	$('.end-box .save').click(function(){
		$('.choose-local,.mask').hide();
		$('.screen').removeClass('active');
		getList(1);
	})

	// 吸顶
	$(window).on("scroll", function() {
		var thisa = $(this);
		var st = thisa.scrollTop();
		if (st >= chtop) {
			$(".choose").addClass('choose-top');
			if (device.indexOf('huoniao_iOS') > -1) {
				$(".choose").addClass('padTop20');
			}
		} else {
			$(".choose").removeClass('choose-top padTop20');
		}
	});

	$('.mask').on('click', function(){
		$('.choose-local').hide();
		$('.mask').hide();
		$('.choose-tab ul li').removeClass('active');
		isClick = true;
	})

	$('.mask').on('touchmove', function(){
		$('.choose-local').hide();
		$('.mask').hide();
		$('.choose-tab ul li').removeClass('active');
		isClick = true;
	})

	// 下拉加载
	$(document).ready(function() {
		$(window).scroll(function() {
			var h = $('.shop-list').height();
			var allh = $('body').height();
			var w = $(window).height();
			var scroll = allh - h - w - 10;

			//已经到底部，并且数据不在请求状态
			if ($(window).scrollTop() > scroll && !isload) {
				atpage++;
				isload = true;
				getList();
			};
		});
	});

	// 上滑下滑导航隐藏
	var upflag = 1, downflag = 1, fixFooter = $(".choose");
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

	$('#more-second').delegate('li', 'click', function(){
		var t = $(this);
		var id = t.attr('data-id') == "" ? $('#choose-food .active').attr('data-id') : t.attr('data-id');
		var name = t.attr('data-id') == "" ? $('#choose-food .active').find('span.name').text() : t.find('span').text();
		$('.choose-tab .food').attr('data-id', id).find('span').text(name);
		$('.choose-local').hide();
		$('.mask').hide();
		$('.choose-tab ul li').removeClass('active');
		getList(1);
	})

	$('#city-second').delegate('li', 'click', function(){
		var t = $(this), action = $('.choose-area .active').attr('data-action'), id = t.attr('data-id');
		if (action == 'business') {
			$('.choose-tab .city').attr('data-addrid', $('#choose-city-sq .active').attr('data-id'));
			$('.choose-tab .city').attr('data-business', id);
		}else {
			$('.choose-tab .city').attr('data-subway', $('#choose-city-dt .active').attr('data-id'));
			$('.choose-tab .city').attr('data-station', id);
		}
		$('.choose-local').hide();
		$('.mask').hide();
		$('.choose-tab ul li').removeClass('active');
		getList(1);
	})


	$('.shop-box').delegate('li', 'click', function(){
		var t = $(this), a = t.find('a'), url = a.attr('data-url'), typeid = $('.choose-tab .food').attr('data-id'),
				typename = $('.choose-tab .food span').text(), id = t.attr('data-id');

		var orderby = $('.choose-tab .sort').attr('data-id');
		var orderbyName = $('.choose-tab .sort').text();
		var parid = $('#choose-food li.active').attr('data-id');
		var typeid = $('.choose-tab .food').attr('data-id');
		var typename = $('.choose-tab .food span').text();

		var action = $('.choose-area .active').attr('data-action');
		if (action == "business") {
			var addrid = $('.choose-tab .city').attr('data-addrid');
			var business = $('.choose-tab .city').attr('data-business');
			var subway = '';
			var station = '';
		}else {
			var subway = $('.choose-tab .city').attr('data-subway');
			var station = $('.choose-tab .city').attr('data-station');
			var addrid = '';
			var business = '';
		}

		var cityName = $('.choose-tab .city span').text();

		dataInfo.url = url;
		dataInfo.parid = parid;
		dataInfo.typeid = typeid;
		dataInfo.typename = typename;
		dataInfo.cityName = cityName;
		dataInfo.addrid = addrid;
		dataInfo.business = business;
		dataInfo.subway = subway;
		dataInfo.station = station;
		dataInfo.orderby = orderby;
		dataInfo.orderbyName = orderbyName;
		//dataInfo.item = itemId.join("$$");

		detailList.insertHtmlStr(dataInfo, $("#detailList").html(), {lastIndex: atpage});

		if(!wx_miniprogram) {
            setTimeout(function () {
                location.href = url;
            }, 500);
        }

	})

	//初始加载
	if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){
		HN_Location.init(function(data){
			if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
		  		//getList();
		  		$(".shop-box").append('<div class="loading">定位失败,请重新刷新页面！</div>');
		  	}else{
			  lng = data.lng, lat = data.lat;
			  getList();

		  	}
		});
		window.addEventListener("mousewheel", (e) => {
		   if (e.deltaY === 1) {
		     e.preventDefault();
		   }
		});
	}else {
		getData();
		setTimeout(function(){
			detailList.removeLocalStorage();
		}, 500)
	}

	$('.inp').delegate('#search', 'click', function(){
		$('.choose-local').hide();
		$('.mask').hide();
		$('.choose-tab ul li').removeClass('active');
	  	getList(1);
	});

	//数据列表
	function getList(tr){

		//如果进行了筛选或排序，需要从第一页开始加载
		if(tr){
			atpage = 1;
			$(".shop-box ul").html("");
		}

		isload = true;

		var orderby = $('.choose-tab .sort').attr('data-id');
		var orderbyName = $('.choose-tab .sort').text();
		var typeid = $('.choose-tab .food').attr('data-id');
		var typename = $('.choose-tab .food span').text();

		var action = $('.choose-area .active').attr('data-action');
		if (action == "business") {
			var addrid = $('.choose-tab .city').attr('data-addrid');
			var business = $('.choose-tab .city').attr('data-business');
			var subway = '';
			var station = '';
		}else {
			var subway = $('.choose-tab .city').attr('data-subway');
			var station = $('.choose-tab .city').attr('data-station');
			var addrid = '';
			var business = '';
		}

		$(".shop-box .loading").remove();
		$(".shop-box").append('<div class="loading">加载中...</div>');

		//请求数据
		var data = [];
		data.push("pageSize="+pageSize);
		data.push("typeid="+typeid);
		data.push("addrid="+addrid);
		data.push("subway="+subway);
		data.push("station="+station);
		if($("#keywords").val() != ''){
			data.push("search="+$("#keywords").val());
		}

		// if (!tr) {
		// 	atpage = $.isEmptyObject(detailList.getLocalStorage()['extraData']) ? atpage : detailList.getLocalStorage()['extraData']['lastIndex'];
		// }
		data.push("page="+atpage);

		$.ajax({
			url: "/include/ajax.php?service=tuan&action=storeList"+'&lng='+lng+'&lat='+lat,
			data: data.join("&"),
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data.state == 100){
					$(".shop-box .loading").remove();
					var list = data.info.list, html = [];
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							html.push('<li class="fn-clear">');
							html.push('<a href="javascript:void(0);" data-url='+list[i].url+'>');
							html.push('<div class="s_img"><img src="'+list[i].litpic+'"></div>');
							html.push(' <div class="s_title"> ');
							html.push('   <div class="bus_txt fn-clear"><span class="bus_txt_title business-txt">'+list[i].company+'</span></div>');
							html.push('   <p class="tuan"><span>发布团购<em>'+list[i].tuannum+'</em></span><span>综合评分<em>'+list[i].rating+'分</em></span></p>');
							if(list[i].vouchers!=''){
								html.push('   <div class="quan fn-clear"><span>券</span><span>'+list[i].vouchers+'</span></div> ');
							}
							html.push('   <div class="addr fn-clear"><span><em>'+list[i].shortaddress+'</em>&nbsp;<em>'+list[i].distance+'</em></span><em class="right_state">进入店铺</em></div> ');
							html.push(' </div> ');
							if(list[i].istop==1){
								html.push(' <i></i> ');
							}
							html.push('</a></li> ');
						}
						$(".shop-box ul").append(html.join(""));
						isload = false;
						// detailList.insertHtmlStr(dataInfo, $("#detailList").html(), {lastIndex: (atpage + 1)});

						//最后一页
						if(atpage >= data.info.pageInfo.totalPage){
							isload = true;
							$(".shop-box").append('<div class="loading">已经到最后一页了</div>');
						}

					//没有数据
					}else{
						isload = true;
						$(".shop-box").append('<div class="loading">暂无相关信息</div>');
					}

				}else{
					$(".shop-box .loading").html(data.info);
				}
			},
			error: function(){
				isload = false;
				$(".shop-box .loading").html('网络错误，加载失败！');
			}
		});
	}


	// 本地存储的筛选条件
	function getData() {

		var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];
		atpage = detailList.getLocalStorage()['extraData']['lastIndex'];

		if (filter.typename != '') {$('.choose-tab .food span').text(filter.typename);}
		if (filter.parid != '') {
			$('#choose-food li[data-id="'+filter.parid+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.typeid != '') {
			$('.choose-tab .food').attr('data-id', filter.typeid);
		}
		if (filter.cityName != '') {$('.choose-tab .city span').text(filter.cityName);}
		if (filter.addrid != '') {
			$('.choose-tab .city').attr('data-addrid', filter.addrid);
			$('#choose-city-sq li[data-id="'+filter.addrid+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.business != '') {$('.choose-tab .city').attr('data-business', filter.business);}
		if (filter.subway != '') {
			$('.choose-tab .city').attr('data-subway', filter.subway);
			$('#choose-city-dt li[data-id="'+filter.subway+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (filter.station != '') {$('.choose-tab .city').attr('data-station', filter.station);}
		if (filter.orderbyName != '') {$('.choose-tab .sort span').text(filter.orderbyName);}

	}



});