$(function () {
    var isload = false;
    //APP端取消下拉刷新
    toggleDragRefresh('off'); 
    
    $('.top_cont li').click(function(){
        var i = $(this).index();
        $(this).addClass('on').siblings().removeClass('on');
        // $('.listBox ul').eq(i).addClass('show').siblings('ul').removeClass('show')
        page = 1;
        getList(1);
    })

    var detailList;
    detailList = new h5DetailList();
    detailList.settings.appendTo = ".visacountry-list";
	setTimeout(function(){detailList.removeLocalStorage();}, 800);

	var dataInfo = {
        id: '',
        url: '',
        typeid: '',
        typename: '',
        isBack: true
	};
	
	$('.visacountry-list').delegate('li', 'click', function(){
        var t = $(this), a = t.find('a'), url = a.attr('data-url'), id = t.attr('data-id');

        var typeid = $('.top_cont li.on').attr('data-id');

        dataInfo.url = url;
        dataInfo.typeid = typeid;

        detailList.insertHtmlStr(dataInfo, $("#visacountry").html(), {lastIndex: page});
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

        var id = $('.top_cont li.on').data('id');
        data.push("typeid="+id);
        
        /**
		 * 需要完善的js
		 * 1、记住筛选条件：
		 * 从列表页面筛选调教后进入详情页面，再从详情页面返回列表页面，记住筛选的条件；参考房产频道或其他的频道；
		 */

        isload = true;
        if(page == 1){
			$(".listBox ul").html();
            $(".tip").html(langData['travel'][12][57]).show();
        }else{
            $(".tip").html(langData['travel'][12][57]).show();
        }
        
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=travel&action=countrytype&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
					var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li class="li_box">');
                        html.push('<a href="javascript:;" data-url="'+list[i].url+'">');
                        html.push('<div class="box"><p>'+list[i].typename+'</p></div>');
                        var pic = list[i].icon != "" && list[i].icon != undefined ? huoniao.changeFileSize(list[i].icon, "small") : "/static/images/404.jpg";
						html.push('<img src="'+pic+'" />');
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

        if (filter.typeid != undefined) {
			$('.top_cont li[data-id="'+filter.typeid+'"]').addClass('on').siblings('li').removeClass('on');
        }
        
    }
    
});