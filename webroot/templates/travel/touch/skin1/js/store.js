$(function(){
    var isload = false;
     //APP端取消下拉刷新
    toggleDragRefresh('off'); 
    
    var detailList;
    detailList = new h5DetailList();
    detailList.settings.appendTo = ".store-list";
	setTimeout(function(){detailList.removeLocalStorage();}, 800);

	var dataInfo = {
        id: '',
        url: '',
        typeid: '',
        typename: '',
        price: '',
        isBack: true
	};
	
	$('.store-list').delegate('.li_box', 'click', function(){
        var t = $(this), a = t.find('a'), url = a.attr('data-url'), id = t.attr('data-id');

        dataInfo.url = url;

        detailList.insertHtmlStr(dataInfo, $("#store").html(), {lastIndex: page});

        setTimeout(function(){location.href = url;}, 500);

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
    
    function  getList(){
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("filter=4");

        isload = true;
        if(page == 1){
			$(".listBox ul.ul_box").html();
            $(".tip").html(langData['travel'][12][57]).show();
        }else{
            $(".tip").html(langData['travel'][12][57]).show();
        }
        
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=travel&action=storeList&"+data.join("&"),
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
                        html.push('<div class="info_view">');
                        html.push('<ul>');
                        html.push('<li>'+langData['travel'][5][1]+'：'+list[i].contact+'</li>');
                        html.push('<li>'+langData['travel'][5][2]+'：'+list[i].tel+'</li>');
                        html.push('<li>'+langData['travel'][5][9]+'：'+list[i].license+'</li>');
                        html.push('</ul>');
                        html.push('<div class="go_shop">'+langData['travel'][5][32]+'</div>');
                        html.push('</div>');
                        html.push('</div>');
						html.push('</a>');
						html.push('</li>');
                    }   
                    if(page == 1){
                        $(".listBox ul.ul_box").html(html.join(""));
                    }else{
                        $(".listBox ul.ul_box").append(html.join(""));
                    }
                    isload = false;

                    if(page >= pageinfo.totalPage){
                        isload = true;
                        $(".tip").html(langData['travel'][0][9]).show();
                    }
                }else{
                    if(page == 1){
                        $(".listBox ul.ul_box").html("");
                    }
					$(".tip").html(data.info).show();
                }
            },
            error: function(){
				isload = false;
				$(".listBox ul.ul_box").html("");
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

    }
	
});

