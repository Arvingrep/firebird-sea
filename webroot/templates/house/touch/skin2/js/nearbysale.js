$(function() {

	var device = navigator.userAgent, isClick = true, isload = false;
	$('#sale-list').css('min-height', $(window).height() - $('.footer').height());



	$('#sale-list').delegate('.house-box', 'click', function(){
		var t = $(this), a = t.find('a'), url = a.attr('data-url');
        if(!wx_miniprogram) {
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

    getList();

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
		data.push("orderby=1");
		data.push("schoolid="+schoolid);
		data.push("school=1");

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
									html.push('<div class="house-img l"><i class="house_disk"></i><img src="'+huoniao.changeFileSize(list[i].litpic, "large")+'">'+video+vr+typestate+'</div>');
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




})
