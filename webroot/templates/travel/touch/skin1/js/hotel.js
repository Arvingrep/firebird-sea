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
			typeid: '',
			addrid: '',
			addrpid: '',
			addrname: '',
			orderby: '',
			orderbyname: '',
			price: '',
			isBack: true
	};

	$('.hotel-list').delegate('li', 'click', function(){
		var t = $(this), a = t.find('a'), url = a.attr('data-url'), typeid = $('.choose-tab .food').attr('data-id'),
				typename = $('.choose-tab .food span').text(), id = t.attr('data-id');

		var orderby     = $('.px li.chosed').attr('data-id');
		var orderbyname = $('.px li.chosed').text();
		var typeid = [];
		$(".xl .box .tabchosed").each(function(){
			typeid.push($(this).data('id'));
		});

		var addrpid     = $('.left_chose li.on').attr('data-id');
		var addrid      = $('.second_chose li.second_on').attr('data-id');
        var addrname2   = $('.left_chose li.on').text();
		var addrname1   = $('.second_chose li.second_on').text();
		var addrname    = addrpid == addrid ? addrname2 : addrname1;

		var price1 = $('#pricetemp').val();
		var price2 = $('.xj .box li.tabchosed').attr('data-id');
		price = price2 ? price2 : price1;
		
		dataInfo.url = url;
		dataInfo.typeid  = typeid;
		dataInfo.price   = price;
		dataInfo.addrid  = addrid;
		dataInfo.addrpid = addrpid;
		dataInfo.addrname = addrname;
		dataInfo.orderby = orderby;
		dataInfo.orderbyname = orderbyname;

		detailList.insertHtmlStr(dataInfo, $("#hotel").html(), {lastIndex: page});

		location.href = url;

	});

	$('.choose-tab li').bind('click',function(){
		var t=$(this),index = t.index();
		if(t.hasClass('onchose')){
			t.removeClass('onchose');
			$('.chosecontent').removeClass('chosing');
			$('.mask').hide();
			$('.listBox').css('position','static');
		}else{
			$('.listBox').css('position','fixed')
			t.addClass('onchose').siblings('li').removeClass('onchose');
			$('.mask').show();
			$('.chosecontent').eq(index).addClass('chosing').siblings('.chosecontent').removeClass('chosing');
		}
	});

	$('.mask,.cancel').click(function(){
		$('.mask').hide();
		$('.chosecontent').removeClass('chosing');
		$('.listBox').css('position','static');
		$('.choose-tab li').removeClass('.onchose')
	});

	$("#price_u").ionRangeSlider({
        skin: "big",
        type: "double",
        min: 0,
        max: 1000,
        from: 0,
        to: 1000,
        grid: true,
        step: 1,
        from_fixed: false,  // fix position of FROM handle
        to_fixed: false     // fix position of TO handle
	});

	var slider = $("#price_u").data("ionRangeSlider");
	
	$("#price_u").on("change", function () {
        var $inp = $(this);
        var v = $inp.prop("value");     // input value in format FROM;TO
        var from = $inp.data("from");   // input data-from attribute
        var to = $inp.data("to");       // input data-to attribute

        if(to==1000){
		   $('.price_text').html(''+echoCurrency('symbol')+from+'-'+langData['travel'][7][63]);
		   $("#pricetemp").val(from + ',' + '1000');
        }else{
			$('.price_text').html(''+echoCurrency('symbol')+from+'-'+echoCurrency('symbol')+to);
			$("#pricetemp").val(from + ',' + to);
		}
		
		$('.xj li').removeClass('tabchosed');
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
			$(".addrid").attr('data-id', '');
			$(".second_chose").html('');
			$(".addrid a").text(t.text());
			$('.listBox').css('position','static');
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
		$(".addrid").attr('data-id', id);
		$(".addrid a").text(addrname);
		$('.listBox').css('position','static');
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
	
	//默认排序
	$('.px li').click(function(){
		$('#px').val($(this).text());
		$('#px').siblings('a').text($(this).text());
		$(this).addClass('chosed').siblings('li').removeClass('chosed');
		$(this).parents('.chosecontent').removeClass('chosing');
		$('.mask').hide();
		$('.choose-tab li').removeClass('onchose');
		$('.listBox').css('position','static');
		//筛选数据
		var id = $(this).data('id');
		$('.orderby').attr('data-id', id);
		page = 1;
		getList();
	});
	
	
	//住宿选择
	$('.xl li').click(function(){
		if($(this).hasClass('tabchosed')){
			$(this).removeClass('tabchosed');
		}else{
			$(this).addClass('tabchosed');
		}

		var typeArr = [];
		$(".xl .box .tabchosed").each(function(){
			typeArr.push($(this).data('id'));
		});
		if(typeArr!=''){
			$(".typeid").attr("data-id", typeArr.join(','));
		}else{
			$(".typeid").attr("data-id", '');
		}
		page = 1;
		getList();

	});

	$('.xj li').click(function(){
		slider.reset();

		if($(this).hasClass('tabchosed')){
			$(this).removeClass('tabchosed');
			$(this).siblings('li').removeClass('tabchosed');
			// $(".price").attr('data-id', '');
		}else{
			// $(this).addClass('tabchosed');
			$(this).addClass('tabchosed').siblings('li').removeClass('tabchosed');
			// $(".price").attr('data-id', $(this).data('id'));
		}

		$("#pricetemp").val('');

	});
	
	
	$('.tijiao').click(function(){
		$('.chosecontent.chosing').removeClass('chosing');
		$('.mask').hide();
		$('.choose-tab li').removeClass('onchose');
		$('.listBox').css('position','static');

		var typeArr = [];
		$(".xj .box .tabchosed").each(function(){
			typeArr.push($(this).data('id'));
		});
		if(typeArr!=''){
			$(".price").attr("data-id", typeArr.join(','));
		}else{
			var pricetemp = $("#pricetemp").val();
			if(pricetemp!=''){
				$(".price").attr("data-id", pricetemp);
			}else{
				$(".price").attr("data-id", '');
			}
			
		}
		page = 1;
		getList();
	});

	//初始加载
	if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){
		HN_Location.init(function(data){
			if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
				$("#hotel").html('');
				$(".tip").html(langData["travel"][12][80]);
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

	function getList(){
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

		isload = true;
        if(page == 1){
			$(".listBox ul").html();
            $(".tip").html(langData['travel'][12][57]).show();
        }else{
            $(".tip").html(langData['travel'][12][57]).show();
		}

		$.ajax({
            url: masterDomain + "/include/ajax.php?service=travel&action=hotelList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
					var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
						html.push('<li class="li_box">');
						html.push('<a href="javascript:;" data-url="'+list[i].url+'">');
						var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
						var videoshow = list[i].video != "" && list[i].video != undefined ? "videoshow" : '';
						var labshow = list[i].typeid == 2 ? '<label class="labshow">'+list[i].typename+'</label>' : '';
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
						html.push('<p class="info_view"><span class="distance">'+langData['travel'][1][7]+list[i].distance+'</span><em>|</em><span class="posi_view">'+list[i].addrname[0]+' '+list[i].addrname[1]+'</span></p>');
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
                        $(".tip").html(langData['travel'][0][9]).show();
                    }
				}else{
					if(page == 1){
                        $(".listBox ul").html("");
                    }
					$(".tip").html(data.info).show();
				}
			},
            error: function(){
				isload = false;
				$(".listBox ul").html("");
				$('.tip').text(langData['travel'][0][10]).show();//请求出错请刷新重试
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
	
	// 本地存储的筛选条件
    function getData() {
        var filter = $.isEmptyObject(detailList.getLocalStorage()['filter']) ? dataInfo : detailList.getLocalStorage()['filter'];
		page = detailList.getLocalStorage()['extraData'].lastIndex;
		
        if (filter.orderbyname != '' && filter.orderbyname != null) {$('.orderby a').text(filter.orderbyname);}

        if (filter.orderby != '') {
            $('.orderby').attr('data-id', filter.orderby);
            $('.px li[data-id="'+filter.orderby+'"]').addClass('chosed').siblings('li').removeClass('chosed');
		}

		if (filter.typeid != undefined && filter.typeid!='') {
			$('.typeid').attr('data-id', filter.typeid);
			$('.xl .box li').siblings('li').removeClass('tabchosed');
			for (var i = 0; i < filter.typeid.length; i++) {
				$('.xl .box li[data-id="'+filter.typeid[i]+'"]').addClass('tabchosed');
			}
		}
		
		if (filter.addrpid != undefined && filter.addrpid!='') {
			$('.left_chose li').siblings('li').removeClass('on');
			$('.left_chose li[data-id="'+filter.addrpid+'"]').addClass('on');
		}

		if (filter.addrid != undefined && filter.addrid!='') {
			$('.addrid').attr('data-id', filter.addrid);
			$('.second_chose li').siblings('li').removeClass('second_on');
			$('.second_chose li[data-id="'+filter.addrid+'"]').addClass('second_on');
		}

		if (filter.addrname != '' && filter.addrname != null) {$('.addrid a').text(filter.addrname);}

		if (filter.price != undefined) {
			$('.price').attr('data-id', filter.price);
			$('.xj .box li[data-id="'+filter.price+'"]').addClass('tabchosed').siblings('li').removeClass('tabchosed');
		}

    }

	

});