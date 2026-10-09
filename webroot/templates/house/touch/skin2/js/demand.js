$(function() {
	var login = $('#demand').attr('data-login')
	var device = navigator.userAgent, isClick = true;
	$('#demand').css('min-height', $(window).height() - $('.footer').height());

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
			genreName:'',
			isBack: true
	};

	// 点击求租求购分类
	$('.rent_btn ul li').click(function(){
		var t = $(this);
		if(!t.hasClass('active')){
			t.addClass('active');
			t.siblings().removeClass('active');
		}
        window.history.pushState({}, 0, t.data('href'));
		getList(1);
	});

	$('.mask').on('touchmove', function() {
		$(this).hide();
		$('.nav').hide();
		$('.choose-local').hide();
		$('.choose_ li').removeClass('active');
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
		$('.choose_ li').removeClass('active');
		$('.header').css('z-index', '99');
		$('.choose-box').css('z-index', '1002');
		$('.choose-box').removeClass('choose-top');
		$('.white').hide();
		isClick = true;
	})

	$('#demand').delegate('.house-box', 'click', function(){
		var t = $(this), a = t.find('a'), url = a.attr('data-url');

		var addrid = $(".tab-area").attr("data-business");
		addrid = addrid == undefined || addrid == 0 ? $('.tab-area').attr('data-area') : addrid;

		// var price = $(".tab-price").attr("data-id");
		// price = price == undefined ? "" : price;

		// var area = $(".tab-type").attr("data-id");
		// area = area == undefined ? "" : area;

		var protype = $(".tab-mold").attr("data-id");
		protype = protype == undefined ? "" : protype;

		// var genre = $(".tab-genre").attr("data-id");
		// genre = genre == undefined ? "" : genre;

		//更新筛选条件
		// dataInfo.type = $('#sptype').val();
		dataInfo.parid = $('#area-box .active').attr('data-id');
		dataInfo.addrid = addrid;
		dataInfo.price = price;
		dataInfo.area = area;
		dataInfo.protype = protype;
		dataInfo.genre = genre;
		dataInfo.addrName = $('.tab-area span').text();
		// dataInfo.priceName = $('.tab-price span').text();
		// dataInfo.areaName = $('.tab-type span').text();
		dataInfo.protypeName = $('.tab-mold span').text();
		// dataInfo.genreName = $('.tab-genre span').text();

		detailList.insertHtmlStr(dataInfo, $("#demand").html(), {lastIndex: atpage});

		//setTimeout(function(){location.href = url;}, 500);

	})

	var xiding = $(".choose-box");
	var chtop = parseInt(xiding.offset().top);
	var myscroll_price = new iScroll("scroll-price", {vScrollbar: false});
	//var myscroll_type = new iScroll("scroll-type", {vScrollbar: false,});
	var myscroll_area = new iScroll("area-box", {vScrollbar: false});
	//var myscroll_more = new iScroll("more-box", {vScrollbar: false});
	//var myscroll_ty = new iScroll("scroll-sptype", {vScrollbar: false,});
	// 选择
	$('.choose_ li').each(function(index) {
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
				//myscroll_type.refresh();
				myscroll_area.refresh();
				//myscroll_more.refresh();
				//myscroll_ty.refresh();
				$(this).parents('.choose-box').addClass('choose-top');

				$('.mask, .white').show();
				$('body').scrollTop(chtop);

			} else {
				$('.choose-local').eq(index).hide();
				$('.choose_ li').removeClass('active');
				$('.mask, .white').hide();
				$(this).parents('.choose-box').removeClass('choose-top');
			}
		})
	})

	$('.choose-local li').click(function() {
		$(this).addClass('active');
		$(this).siblings().removeClass('active');
	})

	var myscroll3 = new iScroll("scroll-third", {vScrollbar: false});
	$('#area-box li').click(function(index) {
		if($(this).index() == 0) {
			chooseNormal();
			return false;
		}
		var id = $(this).attr("data-id");
		$('.cf .choose-local-second').css('width', '60.5%');
		$('.area-third .choose-local-third').show();
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

	function chooseNormal(){
		$('.cf .choose-local-second').css('width', '100%');
		$('.area-third .choose-local-third').hide();
		$('.choose-local').hide();
		$('.mask').hide();
		$('.choose_ li').removeClass('active');
		$('.tab-area span').html('不限');
		$('.white').hide();
		$('.tab-area').attr('data-area', '').attr('data-business', "");
        $('.choose-box').removeClass('choose-top');
		isClick = true;

		getList(1);

	}

	$('.area-third .choose-local-third,.subway-third .choose-local-third').on('click', 'li', function() {
		var t = $(this), dom = t.find('a').html();
    	$(this).parents('.choose-box').removeClass('choose-top');
		$('.tab-area span').html(dom);
		$('.choose-local').hide();
		$('.mask').hide();
		$('.choose_ li').removeClass('active');
		$('.white').hide();
		isClick = true;

		//区域
		if(t.closest(".choose-local-third").attr("id") == "scroll-third"){
			t.addClass('active').siblings().removeClass('active');
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

	$('.choose-act li').click(function() {
		var t = $(this), dom = t.find('a').html();
    	$(this).parents('.choose-box').removeClass('choose-top');
		$('.tab-act span').html(dom);
		$(this).parents('.choose-local').hide();
		$('.mask').hide();
		$('.choose_ li').removeClass('active');
		$('.white').hide();
		isClick = true;

		var act = t.attr("data-id");
		act = act == undefined ? "" : act;
		$(".tab-act").attr("data-id", act);
		getList(1);
	})

	$('.choose-mold li').click(function() {
		var t = $(this), dom = t.find('a').html();
    	$(this).parents('.choose-box').removeClass('choose-top');
		$('.tab-mold span').html(dom);
		$(this).parents('.choose-local').hide();
		$('.mask').hide();
		$('.choose_ li').removeClass('active');
		$('.white').hide();
		isClick = true;

		var type = t.attr("data-protype");
		type = type == undefined ? "" : type;
		$(".tab-more").attr("data-id", type);
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

	var isload = false;
	// 下拉加载
	$(document).ready(function() {
		$(window).scroll(function() {
			var h = $('.footer').height() + $('.house-rent').height() * 2;
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

		var tabArea = $(".tab-area"), areaType = tabArea.attr("data-type"),
				addrid = 0, business = 0;

		if(areaType == "area"){
			addrid = Number(tabArea.attr("data-area"));
			business = Number(tabArea.attr("data-business"));
			if(business){
				addrid = business;
			}
		}
		data.push("addrid="+addrid);

		var type = $('.rent_btn ul li.active').attr("data-id");
		type = type == undefined ? "" : type;
		if(type != ""){
		 	data.push("typeid="+type);
		}

		var act = $(".tab-act").attr("data-id");
	    act = act == undefined ? "" : act;
	    if(act != ""){
	      data.push("act="+act);
	    }

		data.push("page="+atpage);

		$.ajax({
			url: "/include/ajax.php?service=house&action=demand",
			data: data.join("&"),
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data){
					console.log(data)
					if(data.state == 100){
						$(".house-list .loading").remove();
						var list = data.info.list, html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								html.push('<div class="house-rent" data-id="'+list[i].id+'">');
								html.push('<div class="rent-item">');
								html.push('<div class="rent-left l">');
                                html.push('<a href="'+list[i].url+'">');
								html.push('<div class="rent_title fn-clear">');
								if(list[i].type==1){
									html.push('<span class="gou l">购</span>');
								}else{
									html.push('<span class="zu l">租</span>');
								}
								html.push('<span class="caption">'+list[i].title+'</span>');
								html.push('</div>');
								html.push('<p class="rent_adderss">'+list[i].note+'</p>');
								html.push('<div class="information"><span class="information_red">'+list[i].action+'</span><em>|</em><span>'+list[i].addr[list[i].addr.length-2]+' - '+list[i].addr[list[i].addr.length-1]+'</span><em>|</em><span>'+list[i].pubdate+'</span></div>');
								html.push('<i></i>');
                                html.push('</a>');
								html.push('</div>');
								var areaCode = list[i].areaCode;
								var code = '';
								if(areaCode != '' && areaCode != '86'){
									code = areaCode;
								}
								if(login==1){
									html.push('<div class="rent-right l"><a href="tel:'+list[i].showMobile+'" ><i data-tel="'+list[i].showMobile+'"></i></a></div>');
								}else{
									html.push('<div class="rent-right l"><a href="javascript:;" class="go-login"><i data-tel="登陆后查看"></i></a></div>');
								}
								
								html.push('</div>');
								html.push('<div class="clear"></div>');
								html.push('</div>');
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
			$('.tab-area').attr('data-area', addrid).attr('data-type', 'area');
			$('#area-box li[data-id="'+parid+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (addrid != '') {
			$('.tab-area').attr('data-business', addrid);
		}
		if (addrName != '') {
			$('.tab-area span').text(addrName);
		}
		if (price != '') {
			$('.tab-price').attr('data-id', price);
			$('#scroll-price li[data-price="'+price+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (priceName != '') {
			$('.tab-price span').text(priceName);
		}
		if (area != '') {
			$('.tab-type').attr('data-id', area);
			$('#scroll-type li[data-area="'+area+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (areaName != '') {
			$('.tab-type span').text(areaName);
		}
		if (protype != '') {
			$('.tab-mold').attr('data-id', protype);
			$('#more-box li[data-protype="'+protype+'"]').addClass('active').siblings('li').removeClass('active');
		}
		if (protypeName != '') {
			$('.tab-mold span').text(protypeName);
		}
	}


   //强制登录
   $('#demand').delegate('.go-login','click',function(){
		alert('请先登录');
		window.location.href = masterDomain+"/login.html";
   })


    //发布
    var aid = 0;
    $('.fabudemand').bind('click', function(){
        $('.popup-fabu .tit').html('快速发布求租求购<s></s>');
        $('#submit').html('立即发布');
        $('.popup-fabu .edit').hide();
        $('.container').addClass('fn-hide');
        $('.gz-address').addClass('show');
        $('html').addClass('nos');
        $('.popup-fabu input[type=text], .popup-fabu textarea').val('');
        $('.popupRightBottom').hide()
        // $('.gz-addr-seladdr').attr('data-ids', '').attr('data-id', '').find('p').html('<font style="color: #aaa;">请选择</font>');
        //区号重置
        var areaCodeOld = $('.layer_list li:first-child em').text().replace('+','');
        $("#areaCode").val(areaCodeOld);
        $('.areacode_span label').text('+'+areaCodeOld);
    });

    //关闭
    $('.popup-fabu').delegate('.tit s', 'click', function(){
        $('html').removeClass('nos');
        $('.container').removeClass('fn-hide');
        $('.gz-address').removeClass('show');
    });


    // 选择特色
    $('.facility li').click(function(){
        var t = $(this);
        if (!t.hasClass('on')) {
            $(this).addClass('on').siblings('li').removeClass('on');
        }
    })

    //提交
    $('#submit').bind('click', function(){
        var t = $(this);
        var ids = $('.gz-addr-seladdr').attr('data-ids');
        var idsArr = ids.split(' ');
        var title = $.trim($('#title').val()),
            note = $.trim($('#note').val()),
            act = $('.facility[data-type=act] .on').data('id'),
            type = $('.facility[data-type=type] .on').data('id'),
            manage = $('.facility[data-type=manage] .on').data('id'),
            cityid = idsArr[0],
            addr = idsArr[idsArr.length-1],
            person = $.trim($('#person').val()),
            areaCode = $.trim($('#areaCode').val()),
            contact = $.trim($('#contact').val()),
            password = $.trim($('#password').val());

        if(title == ''){
            alert('请输入标题！');
            return false;
        }

        if(note == ''){
            alert('请输入需求描述！');
            return false;
        }

        if(act == '' || act == 0 || act == undefined){
            alert('请选择类别！');
            return false;
        }

        if(type == '' || type == undefined){
            alert('请选择供求！');
            return false;
        }

        if(addr == '' || addr == 0){
            alert('请选择位置！');
            return false;
        }

        if(person == ''){
            alert('请输入联系人！');
            return false;
        }

        if(contact == ''){
            alert('请输入联系电话！');
            return false;
        }

        if(password == ''){
            alert('请输入管理密码！');
            return false;
        }

        t.attr('disabled', true);

        var action = aid ? 'edit' : 'put';

        //删除
        if(manage == '2'){
            $.ajax({
                url: masterDomain + '/include/ajax.php?service=house&action=del&type=demand&password=' + password + '&id=' + aid,
                dataType: "jsonp",
                success: function (data) {
                    if(data && data.state == 100){
                        alert('删除成功！');
                        if(device.indexOf('huoniao') > -1) {
                            setupWebViewJavascriptBridge(function (bridge) {
                                bridge.callHandler("pageRefresh", {}, function (responseData) {
                                });
                            });
                        }else {
                            location.reload();
                        }
                    }else{
                        alert(data.info);
                        t.removeAttr('disabled');
                    }
                },
                error: function(){
                    alert(langData['siteConfig'][20][183]);
                    t.removeAttr('disabled');
                }
            });
            return false;
        }

        $.ajax({
            url: masterDomain + '/include/ajax.php?service=house&action='+action+'&type=demand',
            data: {
                'id': aid,
                'title': title,
                'note': note,
                'category': type,
                'lei': act,
                'cityid': cityid,
                'addrid': addr,
                'person': person,
                'areaCode': areaCode,
                'contact': contact,
                'password': password
            },
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){

                    var info = data.info.split('|');
                    if(info[1] == 1){
                        alert(aid ? '修改成功' : '发布成功！');
                    }else{
                        alert(aid ? '提交成功，请等待管理员审核！' : '发布成功，请等待管理员审核！');
                    }

                    if(device.indexOf('huoniao') > -1) {
                        setupWebViewJavascriptBridge(function (bridge) {
                            bridge.callHandler("pageRefresh", {}, function (responseData) {
                            });
                        });
                    }else {
                        location.reload();
                    }

                }else{
                    alert(data.info);
                    t.removeAttr('disabled');
                }
            },
            error: function(){
                alert(langData['siteConfig'][20][183]);
                t.removeAttr('disabled');
            }
        });

    });


})
