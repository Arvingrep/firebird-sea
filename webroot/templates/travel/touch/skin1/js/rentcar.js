$(function () {
	var isload = false;
    //APP端取消下拉刷新
	toggleDragRefresh('off'); 


	$('.choose-tab li').bind('click',function(){
		var t=$(this),index = t.index();
		if(t.hasClass('onchose')){
			t.removeClass('onchose');
			$('.chosecontent').removeClass('chosing');
			$('.mask').hide();
			$('.listBox').css('position','static')
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
		$('.choose-tab li').removeClass('onchose')
	});

	

	$("#price_u").ionRangeSlider({
        skin: "big",
        type: "double",
        min: 0,
        max: 10000,
        from: 0,
        to: 10000,
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

        if(to==10000){
			$('.price_text').html(''+echoCurrency('symbol')+from+'-不限');
			$(".price").attr('data-id', from + ',');
			$("#pricetemp").val(from + ',' + '10000');
        }else{
			$('.price_text').html(''+echoCurrency('symbol')+from+'-'+echoCurrency('symbol')+to);
			$(".price").attr('data-id', from + ',' + to);
			$("#pricetemp").val(from + ',' + to);
		}
		
		$('.xj li').removeClass('tabchosed');

	});


	$('.left_chose').delegate('li.lei','click',function(){
		$(this).addClass('on').siblings('li').removeClass('on');
		if($(this).hasClass('nochose')){
			$('.third_chose').html('')
		}else{
			//加载数据
			var html=[];
			for(var i=0; i<10; i++){
				html.push("<li>福克斯"+$(this).text()+i+"</li>")
			}
			$('.third_chose').html(html.join(''));
			$('.third_chose').scrollTop(0)
		}
	});
	
	
	$('.third_chose').delegate('li','click',function(){
		$(this).addClass('third_on').siblings('li').removeClass('third_on');
		$('.onchose a').text($('.third_on').text());
		$('.choose-tab li').removeClass('onchose');
		//加载数据
		$('.listBox').css('position','static');
		$('.chosecontent').removeClass('chosing');
		$('.mask').hide();
		$('.listBox').css('position','static');
	});
	
	//默认排序
	$('.px li').click(function(){
		$('#px').val($(this).text());
		$('#px').siblings('a').text($(this).text());
		$(this).addClass('chosed').siblings('li').removeClass('chosed');
		$(this).parents('.chosecontent').removeClass('chosing');
		$('.listBox').css('position','static');
		$('.mask').hide();
		$('.choose-tab li').removeClass('onchose')
		//筛选数据
	});
	
	
	//住宿选择
	$('.xl li').click(function(){
		if($(this).hasClass('tabchosed')){
			$(this).removeClass('tabchosed');
		}else{
			$(this).addClass('tabchosed');
		}
		

	//	$('.choose-tab li').removeClass('onchose');
	});

	$('.xj li').click(function(){
		// $(this).addClass('chosed').siblings('li').removeClass('chosed');

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

		
		
	//	$('.choose-tab li').removeClass('onchose');
	});
	
	//价格
	$('.xj .tijiao').click(function(){
		$('.chosecontent.chosing').removeClass('chosing');
		$('.mask').hide();
		$('.listBox').css('position','static');
	//	if($('.price_text').text()==''){
	//		$('.onchose a').text($('.tabchosed').text());
	//	}else{
	//		$('.onchose a').text($('.price_text').text());
	//	}
		$('.choose-tab li').removeClass('onchose');

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
	
	//类型
	$('.xl .tijiao').click(function(){
		$('.listBox').css('position','static');
		$('.chosecontent.chosing').removeClass('chosing');
		$('.mask').hide();
		$('.listBox').css('position','static');
		$('.choose-tab li').removeClass('onchose');

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
	
	var detailList;
    detailList = new h5DetailList();
    detailList.settings.appendTo = ".rentcar-list";
	setTimeout(function(){detailList.removeLocalStorage();}, 800);

	var dataInfo = {
        id: '',
        url: '',
        typeid: '',
        typename: '',
        price: '',
        isBack: true
	};
	
	$('.rentcar-list').delegate('li', 'click', function(){
        var t = $(this), a = t.find('a'), url = a.attr('data-url'), id = t.attr('data-id');

		var typeid = [];
		$(".xl .box .tabchosed").each(function(){
			typeid.push($(this).data('id'));
		});

		var price = $('.xj .box li.tabchosed').attr('data-id');

		if (typeid != '') {dataInfo.typeid = typeid;}
		dataInfo.url = url;
		dataInfo.price = price;

        detailList.insertHtmlStr(dataInfo, $("#rentcar").html(), {lastIndex: page});

        setTimeout(function(){location.href = url;}, 500);

	})
	
	//初始加载
	if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){
        getList(1);
    }else {
        getData();
        setTimeout(function(){
            detailList.removeLocalStorage();
        }, 500)
	}
	
	function  getList(){
        var data = [];
        data.push("page="+page);
		data.push("pageSize="+pageSize);
		
		$(".choose-tab li").each(function(){
            data.push($(this).attr("data-type") + "=" + $(this).attr("data-id"));
        });
		
		isload = true;
        if(page == 1){
			$(".listBox ul").html();
            $(".tip").html(langData['travel'][12][57]).show();
        }else{
            $(".tip").html(langData['travel'][12][57]).show();
		}

		$.ajax({
            url: masterDomain + "/include/ajax.php?service=travel&action=rentcarList&"+data.join("&"),
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
						html.push('<div class="left_b '+videoshow+'"><img src="'+pic+'" /></div>');
						html.push('<div class="right_b">');
						html.push('<h2>'+list[i].title+'</h2>');
						html.push('<p class="car_info">'+list[i].typename+' / '+list[i].addrname[2]+'</p>');
						if(list[i].tagAll!=''){
                            html.push('<p class="lab_box">');
                            for(var m=0;m<list[i].tagAll.length;m++){
                                if(m>2) break;
                                html.push('<span>'+list[i].tagAll[m].jc+'</span>');
                            }
                            html.push('</p>');
						}
						html.push('<div class="info_view">');
						html.push('<p class="price"><span>'+echoCurrency('symbol')+'<em>'+list[i].price+'</em></span>/'+langData['travel'][12][79]+'</p>');
						// html.push('<p class="distance">500m</p>');
						html.push('</div>');
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

		if (filter.typeid != undefined && filter.typeid!='') {
			$('.typeid').attr('data-id', filter.typeid);
			$('.xl .box li').siblings('li').removeClass('tabchosed');
			for (var i = 0; i < filter.typeid.length; i++) {
				$('.xl .box li[data-id="'+filter.typeid[i]+'"]').addClass('tabchosed');
			}
		}

		if (filter.price != undefined) {
			$('.price').attr('data-id', filter.price);
			$('.xj .box li[data-id="'+filter.price+'"]').addClass('tabchosed').siblings('li').removeClass('tabchosed');
		}

		
    }
	
});
