$(function(){
    var isload = false;
    //APP端取消下拉刷新
    toggleDragRefresh('off');

    var detailList;
    detailList = new h5DetailList();
    detailList.settings.appendTo = ".visa-list";
	setTimeout(function(){detailList.removeLocalStorage();}, 800);

	var dataInfo = {
        id: '',
        url: '',
        ishot: '',
        country: '',
        countryname: '',
        orderby: '',
        orderbyname: '',
        keywords: '',
        isBack: true
	};

	$('.visa-list').delegate('li', 'click', function(e){
        e.preventDefault();
        var t = $(this), a = t.find('a'), url = a.attr('data-url'), id = t.attr('data-id');

        var orderby     = $('.chosecontent li.chosed').attr('data-id');
        var orderbyname = $('.chosecontent li.chosed').text();

        var country     = $('.zm dd.z_chose').attr('data-id') ? $('.zm dd.z_chose').attr('data-id') : $('.hot_country dd.c_chose').attr('data-id');
        var countryname = $('.zm dd.z_chose').text() ? $('.zm dd.z_chose').text() : $('.hot_country dd.c_chose').text();

        var ishot = 0;
        if($('.zm dd.z_chose').attr('data-id')!='' && $('.zm dd.z_chose').attr('data-id')!=undefined){
            ishot = 1;
        }else if($('.hot_country dd.c_chose').attr('data-id')!='' && $('.hot_country dd.c_chose').attr('data-id')!=undefined){
            ishot = 2;
        }

        dataInfo.url = url;
        dataInfo.orderby   = orderby;
        dataInfo.orderbyname = orderbyname;
        dataInfo.ishot = ishot;
        dataInfo.country   = country;
        dataInfo.countryname = countryname;
        dataInfo.keywords = $('#search').val();

        detailList.insertHtmlStr(dataInfo, $("#visa").html(), {lastIndex: page});
        setTimeout(function(){
            if(wx_miniprogram) {

            }else{
                location.href = url;
            }
        }, 500);

    });

    //智能排序
	$('.chosecontent li').click(function(){
		$('.li_px a').text($(this).text());
		$(this).addClass('chosed').siblings('li').removeClass('chosed');
		$(this).parents('.chosecontent').removeClass('chosing');
		$('.mask').hide();
		$('.choose-tab li').removeClass('onchose');
		var id = $(this).data('id');
        $('.li_px').attr('data-id', id);
        page = 1;
		getList();
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

    function  getList(){
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);

        $(".choose-tab li").each(function(){
            data.push($(this).attr("data-type") + "=" + $(this).attr("data-id"));
        });

        if($("#search").val()!=''){
            data.push("search="+$("#search").val());
        }

		isload = true;
        if(page == 1){
			$(".listBox ul").html();
            $(".tip").html(langData['travel'][12][57]).show();
        }else{
            $(".tip").html(langData['travel'][12][57]).show();
        }

        $.ajax({
            url: masterDomain + "/include/ajax.php?service=travel&action=visaList&"+data.join("&"),
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
                        html.push('<p class="lab_box">');
                        html.push('<span>'+list[i].typename+'</span>');
                        html.push('<span>'+list[i].countryname+'</span>');
                        html.push('</p>');
						html.push('<div class="info_view">');
                        html.push('<p class="price"><span>'+echoCurrency('symbol')+'<em>'+list[i].price+'</em></span>/'+langData['travel'][12][89]+'</p>');
                        html.push('<span class="posi_view">'+list[i].store['title']+'</span>');
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

        if (filter.orderbyname != '' && filter.orderbyname != null) {$('.li_px a').text(filter.orderbyname);}

        if (filter.orderby != '') {
            $('.li_px').attr('data-id', filter.orderby);
            $('.chosecontent li[data-id="'+filter.orderby+'"]').addClass('chosed').siblings('li').removeClass('chosed');
        }

        if (filter.countryname != '') {$('.area a').text(filter.countryname);}

        if (filter.country != '') {
            $('.area').attr('data-id', filter.country);
            if(filter.ishot == 1){
                $('.zm dd[data-id="'+filter.country+'"]').addClass('z_chose').siblings('dd').removeClass('z_chose');
                $('.zm dd[data-id="'+filter.country+'"]').addClass('z_chose').parents('.zm').siblings('.zm').children('dd').removeClass('z_chose');
                $('.hot_country dd').removeClass('c_chose');
            }else if(filter.ishot == 2){
                $('.hot_country dd[data-id="'+filter.country+'"]').addClass('c_chose').siblings('dd').removeClass('c_chose');
                $('.zm dd').removeClass('z_chose');
            }
        }

        if (filter.keywords != '') {
			$('#search').val(filter.keywords);
		}

    }

	// 侧边栏点击字幕条状
    var navBar = $(".navbar");
    navBar.on("touchstart", function (e) {
        $(this).addClass("active");
        $('.letter').html($(e.target).html()).show();


        var width = navBar.find("li").width();
        var height = navBar.find("li").height();
        var touch = e.touches[0];
        var pos = {"x": touch.pageX, "y": touch.pageY};
        var x = pos.x, y = pos.y;
        $(this).find("li").each(function (i, item) {
            var offset = $(item).offset();
            var left = offset.left, top = offset.top;
            if (x > left && x < (left + width) && y > top && y < (top + height)) {
                var id = $(item).find('a').attr('data-id');
                var cityHeight = $('#'+id).offset().top + $('.area_list').scrollTop();
                if(cityHeight>45){
                    $('.area_list').scrollTop(cityHeight-45);
                    $('.letter').html($(item).html()).show();
                }

            }
        });
    });

    navBar.on("touchmove", function (e) {
        e.preventDefault();
        var width = navBar.find("li").width();
        var height = navBar.find("li").height();
        var touch = e.touches[0];
        var pos = {"x": touch.pageX, "y": touch.pageY};
        var x = pos.x, y = pos.y;
        $(this).find("li").each(function (i, item) {
            var offset = $(item).offset();
            var left = offset.left, top = offset.top;
            if (x > left && x < (left + width) && y > top && y < (top + height)) {
                var id = $(item).find('a').attr('data-id');
                var cityHeight = $('#'+id).offset().top + $('.area_list').scrollTop();
                if(cityHeight>45) {
                    $('.area_list').scrollTop(cityHeight - 45);
                    $('.letter').html($(item).html()).show();
                }
            }
        });
    });


    navBar.on("touchend", function () {
        $(this).removeClass("active");
        $(".letter").hide();
    });

    //目的地选择
    $('.area').click(function(){
        $('.mask0').show();
        $('.areaBox').animate({"right":0},100);
        $('.chosecontent').removeClass('chosing');
        $('.mask').hide();
    });

    $('.goback,.mask0').click(function(){
        $('.mask0').hide();
        $('.areaBox').animate({"right":'-85%'},100)
    });

    $('.li_px').click(function(){
        if($(this).hasClass('onchose')){
            $(this).removeClass('onchose')
            $('.chosecontent').removeClass('chosing');
            $('.mask').hide();
            $('.listBox').css('position','static');
        }else{
            $(this).addClass('onchose')
            $('.chosecontent').addClass('chosing');
            $('.mask').show();
            // $('.listBox').css('position','fixed');
        }
    });

    $('.mask').click(function(){
        $('.chosecontent').removeClass('chosing');
        $('.mask').hide();
    });

    $('.search').click(function(){
        var keywords = $('#search').val();
        $('.mask0').hide();
        $('.areaBox').animate({"right":'-85%'},100)
        page = 1;
		getList();
    });

    //热门国家选择
    $('.hot_country').delegate('dd','click',function(){
        $(this).addClass('c_chose').siblings('dd').removeClass('c_chose');
        $('.zm dd').removeClass('z_chose');
        $('.mask0').hide();
        $('.areaBox').animate({"right":'-85%'},100);
        $('.area a').text($(this).text());
        //筛选数据
        var id = $(this).data('id');
        $('.area').attr('data-id', id);
        page = 1;
        getList();
    });

    $('.zm').delegate('dd','click',function(){
        $(this).addClass('z_chose').siblings('dd').removeClass('z_chose');
        $(this).addClass('z_chose').parents('.zm').siblings('.zm').children('dd').removeClass('z_chose');
        $('.hot_country dd').removeClass('c_chose');
        $('.mask0').hide();
        $('.areaBox').animate({"right":'-85%'},100);
        $('.area a').text($(this).text())
        //筛选数据
        var id = $(this).data('id');
        $('.area').attr('data-id', id);
        page = 1;
        getList();
    });

});
