$(function() {

	var device = navigator.userAgent, isClick = true;
	$('#cf-list').css('min-height', $(window).height() - $('.footer').height());

	var detailList, getParid;
  detailList = new h5DetailList();
  setTimeout(function(){detailList.removeLocalStorage();}, 800);

	var dataInfo = {
			type: '',
			parid: '',
			addrid: '',
			addrName: '',
			price: '',
			priceName: '',
			area: '',
			areaName: '',
			protype: '',
			protypeName: '',
			industry: '',
			industryName: '',
			comid: '',
			isBack: true
	};

	$('.mask').on('touchmove', function() {
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

	$('.mask').on('click', function() {
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

	$('#cf-list').delegate('.house-box', 'click', function(){
		var t = $(this), a = t.find('a'), url = a.attr('data-url');

		var addrid = $(".tab-addrid").attr("data-id");
		addrid = addrid == undefined ? "" : addrid;

		var price = $(".tab-price").attr("data-id");
		price = price == undefined ? "" : price;

		var area = $(".tab-area").attr("data-id");
		area = area == undefined ? "" : area;

		var protype = $(".tab-protype").attr("data-id");
		protype = protype == undefined ? "" : protype;

		var genre = $(".tab-genre").attr("data-id");
		genre = genre == undefined ? "" : genre;

		//更新筛选条件
		dataInfo.type = $('#sptype').val();
		dataInfo.parid = $('#area-box .active').attr('data-area');
		dataInfo.addrid = addrid;
		dataInfo.price = price;
		dataInfo.area = area;
		dataInfo.protype = protype;
		dataInfo.genre = genre;
		dataInfo.comid = comid;
		dataInfo.addrName = $('.tab-addrid span').text();
		dataInfo.priceName = $('.tab-price span').text();
		dataInfo.areaName = $('.tab-area span').text();
		dataInfo.protypeName = $('.tab-protype span').text();
		dataInfo.genreName = $('.tab-genre span').text();

		detailList.insertHtmlStr(dataInfo, $("#cf-list").html(), {lastIndex: atpage});

        if(!wx_miniprogram && !baidu_miniprogram && !qq_miniprogram) {
            setTimeout(function () {
                location.href = url;
            }, 500);
        }

	})

	var xiding = $(".choose-box");
	var chtop = parseInt(xiding.offset().top);
	var myscroll_price = new iScroll("scroll-price", {vScrollbar: false});
	var myscroll_mj = new iScroll("scroll-area", {vScrollbar: false,});
	var myscroll_area = new iScroll("area-box", {vScrollbar: false});
	var myscroll_more = new iScroll("more-box", {vScrollbar: false});
	var myscroll_ty = new iScroll("scroll-type", {vScrollbar: false,});
	// 选择
	$('.choose li').each(function(index) {
		$(this).click(function() {
			if (!$('.choose-box').hasClass('choose-top')) {
				isClick = false;
			}else {
				isClick = true;
			}
			if ($('.choose-local').eq(index).css("display") == "none") {
				$(this).addClass('active').siblings().removeClass('active');
				if (device.indexOf('huoniao_iOS') > -1) {
					// $('.choose-local').css('top', 'calc(.81rem + 20px)');
					// $('.white').css('margin-top', 'calc(.8rem + 20px)');
				}
				$('.choose-local').eq(index).show().siblings('.choose-local').hide();
				myscroll_price.refresh();
				myscroll_mj.refresh();
				myscroll_area.refresh();
				myscroll_more.refresh();
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

	$('.choose-local li').click(function() {
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
	})

	// 点击一级区域
	$('#area-box li').click(function(){
		var a = $(this),id = a.data('area'),name = a.children('a').text();
		if(id && id != 0){
			$.ajax({
				url: "/include/ajax.php?service=house&action=addr&type="+id,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data){
						if(data.state == 100){
							var info = data.info,len = info.length,html = ['<li data-area="'+id+'" data-pname="'+name+'"><a href="javascript:;">全部</a></li>'];
							for(var i = 0; i < len; i++){
								var obj = info[i];
								html.push('<li data-area="'+obj.id+'"><a href="javascript:;">'+obj.typename+'</a></li>');
							}
							$("#scroll-third .scroll").html(html.join(""));
							$('.cf .choose-local-second').css('width', '60.5%');
							$('.area-third .choose-local-third').show();
							myscroll = new iScroll("scroll-third", {
								vScrollbar: false
							});
						}else{
							var html = [];
							html.push('<li data-area="'+id+'" data-pname="'+name+'"><a href="javascript:;">全部</a></li>');
							$("#scroll-third .scroll").html(html.join(""));
							$('.cf .choose-local-second').css('width', '60.5%');
							$('.area-third .choose-local-third').show();
							myscroll = new iScroll("scroll-third", {
								vScrollbar: false
							});
						}
					}
				},
				error : function(){

				}
			})

		}else{
			$('.cf .choose-local-second').css('width', '100%');
			$('.area-third .choose-local-third').hide();
			$('.choose-local').hide();
			$('.mask').hide();
			$('.choose li').removeClass('active');
			$('.tab-area span').html('不限');
			$('.white').hide();
			isClick = true;

			$('.tab-addrid').attr('data-id','').find('span').text('不限');
			getList(1);
		}
	})

	// 选择二级区域
	$('.area-third .choose-local-third').on('click', 'li', function() {
		var a = $(this),id = a.data('area'),name = a.children('a').text();
		if(a.hasClass('active')) return;
		a.addClass('active').siblings().removeClass('active');
		if(name == '全部'){
			name = a.data('pname');
		}
		$('.tab-addrid span').html(name);
		$('.choose-local').hide();
		$('.mask').hide();
		$('.choose li').removeClass('active');
		$('.white').hide();
		$('.tab-addrid').attr('data-id',id);
		isClick = true;

		getList(1);
	})

	// 点击筛选条件 筛选地区不在内
	$('.choose-local').not('.choose-area').find('li').click(function(){
		var obj = $(this),id = obj.data('id') || '',name = obj.children('a').text(),p = obj.parents('.choose-local');

		var type = p.data('type');
		$('.tab-'+type).attr('data-id',id).find('span').html(name);
		if(type == "type"){
			$(".tab-price").attr("data-id",'');
			if(id == 2){
				$(".tab-price span").text('总价');
				$(".choose-price ul").hide();
				$(".choose-price ul").eq(1).show();
			}else{
				$(".tab-price span").text('租金');
				$(".choose-price ul").hide();
				$(".choose-price ul").eq(0).show();
			}
		}
		p.hide();
		$('.mask').hide();
		$('.choose li').removeClass('active');
		$('.white').hide();
		isClick = true;

		getList(1);
	})


	// 自定义价格
	$('#scroll-price').delegate('.btn_submit', 'click', function(event) {
		var t = $(this),par = t.parents('.zdybox');
		if(par.hasClass('zu')){

			var pri_1 = par.find('.inp_box .p1').val();
       		var pri_2 = par.find('.inp_box .p2').val();

       		price_section = pri_1/1000 + ',' + pri_2/1000;
        	$('.tab-price span').html(pri_1/10000+'-'+pri_2/10000 + '万');
		}else{
			var pri_1 = par.find('.inp_box .p1').val();
       		var pri_2 = par.find('.inp_box .p2').val();

       		price_section = pri_1 + ',' + pri_2;
        	$('.tab-price span').html(pri_1+'-'+pri_2 + '万');
		}
		$('.choose-box').removeClass('choose-top');
        if (!pri_1 && !pri_2) {
            $(".zu .inp_box .p1").val('');
            $(".zu .inp_box .p2").val('');
            alert('请输入价格');
        } else if (pri_1 && pri_2 && parseInt(pri_1) > parseInt(pri_2)) {
        	alert('价格上限应该大于下限');
        } else {
            $(this).parents(".choose-local").find('li').removeClass('active');
            $('.zu .inp_box').addClass('curr');
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

	// 自定义面积
	$('#scroll-area').delegate('.btn_submit', 'click', function() {
		$('.choose-box').removeClass('choose-top');
        var area_1 = $("#scroll-area .inp_box .p1").val();
        var area_2 = $("#scroll-area .inp_box .p2").val();
        area_section = area_1 + ',' + area_2;
        $('.tab-area span').html(area_1+'-'+area_2 + echoCurrency('areasymbol'));
        if (!area_1 && !area_2) {
            $("#scroll-area .inp_box .p1").val('');
            $("#scroll-area .inp_box .p2").val('');
            alert('请输入面积');
        } else if (area_1 && area_2 && parseInt(area_1) > parseInt(area_2)) {
        	alert('面积上限应该大于下限');
        } else {
            $(this).parents(".choose-local").find('li').removeClass('active');
            $('#scroll-area .inp_box').addClass('curr');
        }
        $(this).parents('.choose-local').hide();
        $('.mask').hide();
        $('.choose li').removeClass('active');
        $('.white').hide();
        isClick = true;

        var area = area_section;
		area = area == undefined ? "" : area;
		$(".tab-area").attr("data-id", area);
        getList(1);
	});



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

	// 头部切换类别
	$('#sptype').change(function(){
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
		$(".choose-more-condition ul").each(function(){
			var t = $(this), active = t.find(".active");
			if(active.text() != "不限"){
			}
		});


		$(".house-list .loading").remove();
		$(".house-list").append('<div class="loading">加载中...</div>');

		//请求数据
		var data = [];
		data.push("pageSize="+pageSize);

		$('.choose li').each(function(){
			var obj = $(this),cls = obj.attr('class'),field = cls.split('-')[1];
			var val = obj.attr('data-id');
			if(val){
				data.push(field+"="+val);
			}
		})


		//更新筛选条件
		$(".choose-more-condition").each(function(){
			var t = $(this), type = t.attr("data-type"), val = t.find(".active").attr('data-id');
			if(val != undefined && val != ""){
				data.push(type+"="+val);
			}
		});

		data.push("page="+atpage);
		data.push("comid="+comid);

		var keywords = $('#search_keyword').val();
		data.push("keywords="+keywords);
		data.push("orderby=1");

		$.ajax({
			url: "/include/ajax.php?service=house&action="+action,
			data: data.join("&"),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				$('.choose-box').removeClass('choose-top');
				if(data){
					if(data.state == 100){
						$(".house-list .loading").remove();
						var list = data.info.list, html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){

								var pic = list[i].litpic == false || list[i].litpic == '' ? '/static/images/blank.gif' : huoniao.changeFileSize(list[i].litpic, "large");

								if (list[i].sellstate==1) {
									var saleIcon = '<i class="sale_icon"></i>';
									var cla = 'over_house';
								}else if(list[i].sellstate==2){
									var saleIcon = '<i class="zu_icon"></i>';
									var cla = 'over_house';
								}else if(list[i].sellstate==3){
									var saleIcon = '<i class="transfer_icon"></i>';
									var cla = 'over_house';
								}else{
									var saleIcon = '';
									var cla = '';
								}

								html.push('<div class="house-box '+cla+'">');
								html.push('<a href="javascript:;" data-url="'+list[i].url+'">');
								html.push(saleIcon);//房源标识
								html.push('<div class="house-item">');
								var video = list[i].video==1 ? '<i class="play_img"></i>' : '';
								var vr    = list[i].qj==1 ? '<i class="VR_img"></i>' : '';
								var typestate = list[i].usertype==1 ? '<em class="zhongjie">中介</em>' : '<em class="geren">个人</em>';
								if(pic ==''){
									html.push('');
								}else{
									html.push('<div class="house-img l"><i class="house_disk"></i><img onerror="this.src=`/static/images/404.jpg`" src="'+pic+'">'+video+vr+typestate+'</div>');
								}
								html.push('<dl>');
								var top = list[i].isbid==1 ? '<i class="set_top"></i>' : '';
								var hsflag = list[i].type==0 ? '租':(list[i].type == 2 ? "售" : "转");
								html.push('<dt>'+top+'<b class="houseFlag">'+hsflag+'</b><em class="sp_title">'+list[i].title+'</em></dt>');
								var price = '';
								if(list[i].price > 0) {
                                    if (list[i].type == 0) {
                                        price = list[i].price + ''+echoCurrency('short')+'/月';
                                    } else if (list[i].type == 1) {
                                        price = list[i].price + ''+echoCurrency('short')+'/月';
                                    } else if (list[i].type == 2) {
                                        price = list[i].price + '万';
                                    }
                                }else{
								    price = '面议';
                                }
								var cenggao = '';
								if(list[i].cenggao>0){
									cenggao = '|层高' + list[i].cenggao + 'm';
								}
								var elevatortxt = '';
	                            if(list[i].type==2){
									if(list[i].price>0){
										var epr = (list[i].price / list[i].area);
										if(epr>=1){
											elevatortxt = epr.toFixed(0) + '万/'+echoCurrency('areasymbol');
										}else{
											elevatortxt = epr.toFixed(1) + '万/'+echoCurrency('areasymbol');
										}

									 }
	                           	}else if(list[i].type==1){
	                           		if(list[i].transfer>0){
	                           			elevatortxt = '转让费： ' + parseInt(list[i].transfer).toFixed(0) + '万';
	                           		}
	                           	}else if(list[i].type==0){
	                           		if(list[i].price>0){
	                           			var epri = (list[i].price / list[i].area);
	                           			if(epri>=1){
											elevatortxt = epri.toFixed(0) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月';
										}else{
											elevatortxt = epri.toFixed(1) + ''+echoCurrency('short')+'/'+echoCurrency('areasymbol')+'•月';
										}
	                           		}
	                           	}

								html.push('<dd class="item-area cf-item-area"><em>'+list[i].area+echoCurrency('areasymbol')+'|'+list[i].protype+cenggao+'</em><span class="price r">'+price+'</span></dd>');
								html.push('<dd class="item-type-1 cf-item-type-1"><em>'+list[i].address+'</em><em>'+elevatortxt+'</em></dd>');
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
				$('.choose-box').removeClass('choose-top');
			}
		});
	}

	// 本地存储的筛选条件
	function getData() {
		var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];
		isload = false;
		type = filter.type;
		parid = filter.parid;
		addrid = filter.addrid;
		addrName = filter.addrName;
		price = filter.price;
		priceName = filter.priceName;
		area = filter.area;
		areaName = filter.areaName;
		protype = filter.protype;
		protypeName = filter.protypeName;
		atpage = detailList.getLocalStorage()['extraData'].lastIndex;

		$("#sptype").find("option[val='"+type+"']").attr("selected", true);

		if (parid != '') {
			$('#area-box li[data-area="'+parid+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (addrid != '') {
			$('.tab-addrid').attr('data-id', addrid);
		}
		if (addrName != '') {
			$('.tab-addrid span').text(addrName);
		}
		if (price != '') {
			$('.tab-price').attr('data-id', price);
			$('#scroll-price li[data-id="'+price+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (priceName != '') {
			$('.tab-price span').text(priceName);
		}
		if (area != '') {
			$('.tab-area').attr('data-id', area);
			$('#scroll-area li[data-id="'+area+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (areaName != '') {
			$('.tab-area span').text(areaName);
		}
		if (protype != '') {
			$('.tab-protype').attr('data-id', protype);
			$('#more-box li[data-id="'+protype+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (protypeName != '') {
			$('.tab-protype span').text(protypeName);
		}
	}


})
