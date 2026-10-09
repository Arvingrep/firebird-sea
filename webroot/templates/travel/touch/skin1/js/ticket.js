$(function(){
	//APP端取消下拉刷新
	toggleDragRefresh('off');
	
	var	isload = false, lng = '', lat = '';

	var detailList;
	detailList = new h5DetailList();
	setTimeout(function(){detailList.removeLocalStorage();}, 500);

	var dataInfo = {
		id: '',
		url: '',
		addrid: '',
		addrpid: '',
		addrname: '',
		orderby: '',
		orderbyname: '',
		flag:'',
		keywords:'',
		isBack: true
	};

	$('.ticket-list').delegate('li', 'click', function(){
		var t = $(this), a = t.find('a'), url = a.attr('data-url'), typeid = $('.choose-tab .food').attr('data-id'),
				typename = $('.choose-tab .food span').text(), id = t.attr('data-id');

		var flag = [];
		$(".xl .box .tabchosed").each(function(){
			flag.push($(this).data('id'));
		});

		var orderby     = $('.px li.chosed').attr('data-id');
		var orderbyname = $('.px li.chosed').text();
		
		var addrpid     = $('.left_chose li.on').attr('data-id');
		var addrid      = $('.second_chose li.second_on').attr('data-id');
        var addrname2   = $('.left_chose li.on').text();
		var addrname1   = $('.second_chose li.second_on').text();
		var addrname    = addrpid == addrid ? addrname2 : addrname1;
		

		dataInfo.url = url;
		dataInfo.flag = flag;
		dataInfo.addrid = addrid;
		dataInfo.addrpid = addrpid;
		dataInfo.addrname = addrname;
		dataInfo.orderby = orderby;
		dataInfo.orderbyname = orderbyname;
		dataInfo.keywords = $('#search_keyword').val();

		detailList.insertHtmlStr(dataInfo, $("#ticket").html(), {lastIndex: page});

		location.href = url;

	});

	

	//初始加载
	if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){
		HN_Location.init(function(data){
			if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
				$("#ticket").append('<div class="loading">'+langData["travel"][12][80]+'</div>');
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

	getAddrList();

	function getList(tr){
		if(tr){
			page = 1;
			$(".listBox ul").html("");
		}

		isload = true;

		$(".listBox .loading").remove();
		$(".listBox ul").append('<div class="loading">'+langData['travel'][12][57]+'</div>');

		//请求数据
		var data = [];
		data.push("page="+page);
		data.push("pageSize="+pageSize);
		data.push("lng="+lng);
		data.push("lat="+lat);

		$(".choose-tab li").each(function(){
			if($(this).attr("data-type") != '' && $(this).attr("data-type") != null  && $(this).attr("data-id") != null){
				data.push($(this).attr("data-type") + "=" + $(this).attr("data-id"));
			}
		});
		
		if($("#search_keyword").val()!='' && $("#search_keyword").val()!=null){
			data.push("search="+$("#search_keyword").val());
		}

		$.ajax({
            url: masterDomain + "/include/ajax.php?service=travel&action=ticketList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
					$(".loading").remove();
					var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
						html.push('<li class="li_box">');
						html.push('<a href="javascript:;" data-url="'+list[i].url+'">');
						var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
						var videoshow = list[i].video != "" && list[i].video != undefined ? "videoshow" : '';
						var labshow = list[i].flagname != "" && list[i].flagname != undefined ? '<label class="labshow">'+list[i].flagname+'</label>' : '';
						html.push('<div class="left_b '+videoshow+'">'+labshow+'<img src="'+pic+'" /></div>');

						html.push('<div class="right_b">');
						html.push('<h2>'+list[i].title+'</h2>');
						if(list[i].tagAll!=''){
                            html.push('<p class="lab_box">');
                            for(var m=0;m<list[i].tagAll.length;m++){
                                if(m>2) break;
                                html.push('<span>'+list[i].tagAll[m].jc+'</span>');
                            }
                            html.push('</p>');
						}
						html.push('<p class="price"><span>'+echoCurrency('symbol')+'<em>'+list[i].price+'</em></span>'+langData['travel'][1][6]+'</p>');
						html.push('<p class="info_view"><span class="distance">'+langData['travel'][1][7]+list[i].distance+'</span><span class="posi_view">'+list[i].addrname[0]+' '+list[i].addrname[1]+'</span></p>');
						html.push('</div>');
						html.push('</a>');
						html.push('</li>');	
					}
					if(page == 1){
                        $(".listBox ul").html(html.join(""));
                    }else{
                        $(".listBox ul").append(html.join(""));
                    }
                    isload = false;

                    if(page >= pageinfo.totalPage){
						isload = true;
						$(".listBox ul").append('<div class="loading">'+langData['travel'][0][9]+'</div>');
                    }
				}else{
					$(".listBox ul").html('<div class="loading">'+data.info+'</div>');
				}
			},
            error: function(){
				isload = false;
				$(".listBox ul").html('<div class="loading">'+langData['travel'][0][10]+'</div>');
            }
		});
		

	}

	//滚动底部加载
	$(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - 30 - w;
        if ($(window).scrollTop() > s_scroll && !isload) {
            page++;
            getList();
        };

    });

    

	//搜索
	$('.search').bind('click',function(){
		var p = $(this).parent('.hh');
		p.removeClass('btnHide').addClass('btnShow');
		$('.mask').hide();
		$('.chosecontent').removeClass('chosing');
		$(this).animate({'background':'#f5f5f5'})
	});

	//关闭搜索
	$('.cuo').bind('click',function(){
		var p = $(this).parent('.hh');
		p.removeClass('btnShow').addClass('btnHide');
		$('.search').animate({'background':'#fdc224'})
	});

	//提交筛选
	$('.tijiao').click(function(){
		$('.choose-tab li').removeClass('onchose');
		$('.mask').hide();
		$('.listBox').css('position','static');
		$('.chosecontent').removeClass('chosing');
		$('.choose-tab li').removeClass('onchose');

		var typeArr = [];
		$(".xl .box .tabchosed").each(function(){
			typeArr.push($(this).data('id'));
		});
		if(typeArr!=''){
			$(".li_xl").attr("data-id", typeArr.join(','));
		}else{
			$(".li_xl").attr("data-id", '');
		}
		page = 1;
		getList();

	});

	//筛选
	$('.choose-tab').delegate('li','click',function(){
		var t=$(this),index = t.index();
		if(t.hasClass('onchose')){
			t.removeClass('onchose');
			$('.chosecontent').removeClass('chosing');
			$('.mask').hide();
		}else{
			t.addClass('onchose').siblings('li').removeClass('onchose');
			$('.mask').show();
			$('.chosecontent').eq(index).addClass('chosing').siblings('.chosecontent').removeClass('chosing');
		}
	});

	$('.mask,.cancel').click(function(){
		$('.choose-tab li').removeClass('onchose');
		$('.mask').hide();
		$('.listBox').css('position','static');
		$('.chosecontent').removeClass('chosing');
	});
	
	
	//智能排序
	$('.px li').click(function(){
		$('.li_px a').text($(this).text());
		$(this).addClass('chosed').siblings('li').removeClass('chosed');
		$(this).parents('.chosecontent').removeClass('chosing');
		$('.mask').hide();
		$('.choose-tab li').removeClass('onchose');
		var id = $(this).data('id');
		$('.li_px').attr('data-id', id);
		page = 1;
		getList(1);
	});
	
	//景点选择
	$('.xl li,.sx li').click(function(){
		if($(this).hasClass('tabchosed')){
			$(this).removeClass('tabchosed');
		}else{
			$(this).addClass('tabchosed');
		}
	});

	//筛选
	$('.left_chose').delegate('li','click',function(){
		var t = $(this), id = t.attr("data-id");
		t.addClass('on').siblings('li').removeClass('on');
		if(id){
			$.ajax({
				url: masterDomain + "/include/ajax.php?service=travel&action=addr&type="+id,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						var html = [], list = data.info;
						html.push('<li data-id="'+id+'">'+langData['travel'][13][7]+'</li>');
						for (var i = 0; i < list.length; i++) {
							html.push('<li data-id="'+list[i].id+'">'+list[i].typename+'</li>');
						}
						$(".second_chose").html(html.join(""));
					}else if(data.state == 102){
						$(".second_chose").html('<li data-id="'+id+'">'+langData['travel'][13][7]+'</li>');
					}else{
						$(".second_chose").html('<li class="load">'+data.info+'</li>');
					}
				},
				error: function(){
					$(".second_chose").html('<li class="load">'+langData['travel'][13][6]+'</li>');
				}
			});
		}else{
			$('.area').removeClass('chosing');
			$('.mask').hide();
			$('.choose-tab li').removeClass('onchose');
			$(".li_sx").attr('data-id', '');
			$(".second_chose").html('');
			$(".li_sx a").text(t.text());
			page = 1;
			getList();
		}
	});

	
	

	function getAddrList(){
		var id = $(".left_chose .on").data('id');

		var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];

		if(id){
			$.ajax({
				url: masterDomain + "/include/ajax.php?service=travel&action=addr&type="+id,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						var html = [], list = data.info;
						var className1 = filter.addrid == id ? 'class="second_on"' : '';
						html.push('<li '+className1+' data-id="'+id+'">'+langData['travel'][13][7]+'</li>');
						for (var i = 0; i < list.length; i++) {
							var className = filter.addrid == list[i].id ? 'class="second_on"' : '';
							html.push('<li '+className+' data-id="'+list[i].id+'">'+list[i].typename+'</li>');
						}
						$(".second_chose").html(html.join(""));
					}else if(data.state == 102){
						$(".second_chose").html('<li data-id="'+id+'">'+langData['travel'][13][7]+'</li>');
					}else{
						$(".second_chose").html('<li class="load">'+data.info+'</li>');
					}
				},
				error: function(){
					$(".second_chose").html('<li class="load">'+langData['travel'][13][6]+'</li>');
				}
			});
		}
	}

	$('.second_chose').delegate('li','click',function(){
		var t = $(this), id = t.attr("data-id"), addrname = t.text();
		t.addClass('second_on').siblings('li').removeClass('second_on');
		$('.area').removeClass('chosing');
		$('.mask').hide();
		$('.choose-tab li').removeClass('onchose');
		$(".li_sx").attr('data-id', id);
		$(".li_sx a").text(addrname);
		page = 1;
		getList();
	});

	$('.third_chose').delegate('li','click',function(){
		$(this).addClass('third_on').siblings('li').removeClass('third_on');
		//加载数据
		$('.listBox').css('position','static');
		$('.area').removeClass('chosing');
		$('.mask').hide();
		$('.choose-tab li').removeClass('onchose');
	});
	
	//搜索
	$('.search_keyword').click(function(){
		var keywords = $('#search_keyword').val();
		getList(1);
	});

	// 本地存储的筛选条件
    function getData() {

        var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];

		page = detailList.getLocalStorage()['extraData'].lastIndex;
		
		if (filter.flag != undefined && filter.flag!='') {
			$('.li_xl').attr('data-id', filter.flag);
			$('.xl .box li').siblings('li').removeClass('tabchosed');
			for (var i = 0; i < filter.flag.length; i++) {
				$('.xl .box li[data-id="'+filter.flag[i]+'"]').addClass('tabchosed');
			}
		}

		if (filter.addrpid != undefined && filter.addrpid!='') {
			$('.left_chose li').siblings('li').removeClass('on');
			$('.left_chose li[data-id="'+filter.addrpid+'"]').addClass('on');
		}

		if (filter.addrid != undefined && filter.addrid!='') {
			$('.li_sx').attr('data-id', filter.addrid);
			$('.second_chose li').siblings('li').removeClass('second_on');
			$('.second_chose li[data-id="'+filter.addrid+'"]').addClass('second_on');
		}

		if (filter.keywords != '') {
			$('#search_keyword').val(filter.keywords);
		}

		if (filter.addrname != '' && filter.addrname != null) {$('.li_sx a').text(filter.addrname);}

		if (filter.orderbyname != '' && filter.orderbyname != null) {$('.li_px a').text(filter.orderbyname);}

        if (filter.orderby != '') {
            $('.li_px').attr('data-id', filter.orderby);
            $('.px li[data-id="'+filter.orderby+'"]').addClass('chosed').siblings('li').removeClass('chosed');
		}
		
    }
	
})
