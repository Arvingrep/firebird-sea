$(function(){
	var isload = false;
    //APP端取消下拉刷新
	toggleDragRefresh('off'); 
	
	var detailList;
    detailList = new h5DetailList();
    detailList.settings.appendTo = ".grouptravel-list";
	setTimeout(function(){detailList.removeLocalStorage();}, 800);

	var dataInfo = {
        id: '',
        url: '',
        price: '',
        minp:'',
        maxp:'',
        orderby: '',
        orderbyname: '',
        addrid: '',
        addrpid: '',
        addrname: '',
        flag:'',
        isBack: true
	};
	
	$('.grouptravel-list').delegate('li', 'click', function(){
        var t = $(this), a = t.find('a'), url = a.attr('data-url'), id = t.attr('data-id');

        var orderby     = $('.px li.chosed').attr('data-id');
        var orderbyname = $('.px li.chosed').text();

        var addrpid     = $('.left_chose li.on').attr('data-id');
		var addrid      = $('.second_chose li.second_on').attr('data-id');
        var addrname2   = $('.left_chose li.on').text();
		var addrname1   = $('.second_chose li.second_on').text();
        var addrname    = addrpid == addrid ? addrname2 : addrname1;
        
        var price     = $('.num_day li.tabchosed').attr('data-id');

        var flag = [];
		$(".sx .box .tabchosed").each(function(){
			flag.push($(this).data('id'));
		});
        
        dataInfo.url = url;
        dataInfo.price = price;
        dataInfo.flag = flag;
        dataInfo.minp = $("#minp").val();
        dataInfo.maxp = $("#maxp").val();
        dataInfo.orderby = orderby;
        dataInfo.orderbyname = orderbyname;
        dataInfo.addrid  = addrid;
		dataInfo.addrpid = addrpid;
		dataInfo.addrname = addrname;
        detailList.insertHtmlStr(dataInfo, $("#grouptravel").html(), {lastIndex: page});
        setTimeout(function(){location.href = url;}, 500);
	});

	//初始加载
	if($.isEmptyObject(detailList.getLocalStorage()['extraData']) || !detailList.isBack()){
        getList(1);
    }else {
        getData();
        setTimeout(function(){
            detailList.removeLocalStorage();
        }, 500)
    }

    getAddrList();
	
	function  getList(){
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("typeid=1");

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
            url: masterDomain + "/include/ajax.php?service=travel&action=agencyList&"+data.join("&"),
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
                        var labshow = list[i].flag != 0 && list[i].flag != "" && list[i].video != undefined ? '<label class="labshow">'+list[i].flagname+'</label>' : '';
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
                        html.push('<div class="info_view"><p class="price"><span>'+echoCurrency('symbol')+'<em>'+list[i].price+'</em></span>'+langData['travel'][1][6]+'</p><span class="posi_view">'+list[i].travelservice+' </span></div>');
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

        if (filter.price != '' && filter.price != null) {
            $('.price').attr('data-id', filter.price);
            $('.pannelbox li[data-id="'+filter.price+'"]').addClass('tabchosed').siblings('li').removeClass('tabchosed');
        }
        
        if (filter.minp != '' && filter.minp != null && filter.maxp != '' && filter.maxp != null) {
            $('.price').attr('data-id', filter.minp + ',' + filter.maxp);
            $("#minp").val(filter.minp);
            $("#maxp").val(filter.maxp);
        }else if(filter.minp != '' && filter.maxp == ''){
            $('.price').attr('data-id', ',' + filter.minp);
            $("#minp").val(filter.minp);
            $("#maxp").val('');
        }else if(filter.minp == '' && filter.maxp != ''){
            $('.price').attr('data-id',  filter.maxp + ',');
            $("#minp").val('');
            $("#maxp").val(filter.maxp);
        }

        if (filter.flag != undefined && filter.flag!='') {
			$('.flag').attr('data-id', filter.flag);
			$('.sx .box li').siblings('li').removeClass('tabchosed');
			for (var i = 0; i < filter.flag.length; i++) {
				$('.sx .box li[data-id="'+filter.flag[i]+'"]').addClass('tabchosed');
			}
		}
        
	}
	
	$('.choose-tab li').bind('click',function(){
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

	//取消
	$('.mask,.cancel').click(function(){
		$('.choose-tab li').removeClass('onchose');
		$('.mask').hide();
		$('.chosecontent').removeClass('chosing');
		$('.listBox').css('position','static');
	});

	//默认排序
	$('.px li').click(function(){
		$('#px').val($(this).text());
		$('#px').siblings('a').text($(this).text());
		$(this).addClass('chosed').siblings('li').removeClass('chosed');
		$(this).parents('.chosecontent').removeClass('chosing');
        $('.mask').hide();
        $('.choose-tab li').removeClass('onchose');
        var id = $(this).data('id');
		$('.orderby').attr('data-id', id);
		page = 1;
		getList();
    });
    
    //区域
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
			$('.xl').removeClass('chosing');
			$('.mask').hide();
			$('.choose-tab li').removeClass('onchose');
            $(".addrid").attr('data-id', '');
            $(".second_chose").html('');
			$(".addrid a").text(t.text());
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
		$('.xl').removeClass('chosing');
		$('.mask').hide();
		$('.choose-tab li').removeClass('onchose');
		$(".addrid").attr('data-id', id);
		$(".addrid a").text(addrname);
		page = 1;
		getList();
	});

	//线路选择
	$('.xl li,.sx li').click(function(){
		if($(this).hasClass('tabchosed')){
			$(this).removeClass('tabchosed');
		}else{
			$(this).addClass('tabchosed');
		}
	});

	//价格天数
	$('.num_day li').click(function(){
		if($(this).hasClass('tabchosed')){
			$(this).removeClass('tabchosed');
		}else{
			$(this).addClass('tabchosed').siblings('li').removeClass('tabchosed');
		}
	})

	//确认选择
	$('.num_day .tijiao').click(function(){
		$('.choose-tab li').removeClass('onchose');
		$('.mask').hide();
		$('.chosecontent').removeClass('chosing');
		$('.listBox').css('position','static');
        //筛选
        var id = $('.num_day .pannelbox .tabchosed').data('id');
        if(id){
            $(".price").attr('data-id', id);
        }else{
            var minp = $("#minp").val();
            var maxp = $("#maxp").val();
            if(minp=='' && maxp!=''){
                $(".price").attr('data-id', maxp + ',');
            }else if(minp!='' && maxp==''){
                $(".price").attr('data-id', ',' + minp);
            }else if(minp!='' && maxp!='' && minp < maxp){
                if(minp > maxp){
                    alert(langData['travel'][13][10]);
                    return;
                }
                $(".price").attr('data-id', minp + ',' + maxp);
            }else{
                $(".price").attr('data-id', '');
            }
        }
        page = 1;
		getList();
    });
    
    $('.sx .tijiao').click(function(){
		$('.choose-tab li').removeClass('onchose');
		$('.mask').hide();
		$('.chosecontent').removeClass('chosing');
		$('.listBox').css('position','static');
        //筛选
        var typeArr = [];
		$(".sx .box .tabchosed").each(function(){
			typeArr.push($(this).data('id'));
		});
		if(typeArr!=''){
			$(".flag").attr("data-id", typeArr.join(','));
		}else{
			$(".flag").attr("data-id", '');
		}
		page = 1;
		getList();
	})
	
});