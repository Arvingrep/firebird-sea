$(function(){
    var isload = false;

    //旅游攻略切换tab
    $('.travel_nav').delegate('li','click',function(){
		$(this).addClass('on').siblings().removeClass('on');
	    var i = $(this).index();
        // $('.travel_content ul').eq(i).addClass('show').siblings().removeClass('show');
        page = 1;
	    getList();
    });
    
    getList();

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

    function getList(){
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        
        var typeid = $('.travel_nav li.on').data('id');
        typeid = typeid ? typeid : 0;
        data.push("typeid="+typeid);
        
        isload = true;
        if(page == 1){
			$(".travel_content ul").html();
            $(".tip").html(langData['travel'][12][57]).show();
        }else{
            $(".tip").html(langData['travel'][12][57]).show();
        }
        
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=travel&action=strategyList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li><a href="'+list[i].url+'">');
						var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "";
						html.push('<div class="left_img"><img src="'+pic+'" alt=""></div>');
						html.push('<div class="right_text">');
						html.push('<h2>'+list[i].title+'</h2>');
						html.push('<div class="up_info">');
						html.push('<div class="_left">');
						var pics = list[i].user['photo'] != "" && list[i].user['photo'] != undefined ? huoniao.changeFileSize(list[i].user['photo'], "small") : "/static/images/noPhoto_40.jpg";
						html.push('<div class="headimg"><img src="'+pics+'"></div>');
						html.push('<p class="up_name">'+list[i].user['nickname']+'</p>');
						html.push('</div>');
						html.push('<p class="_right">'+list[i].click+'人预览</p>');
						html.push('</div>');
						html.push('</div>');
						html.push('</a></li>');
                    }
                    if(page == 1){
                        $(".travel_content ul").html(html.join(""));
                    }else{
                        $(".travel_content ul").append(html.join(""));
                    }
                    isload = false;

                    if(page >= pageinfo.totalPage){
                        isload = true;
                        $(".tip").html(langData['travel'][0][9]).show();
                    }
                }else{
                    if(page == 1){
                        $(".travel_content ul").html("");
                    }
					$(".tip").html(data.info).show();
                }
            },
            error: function(){
				isload = false;
				$(".travel_content ul").html("");
				$('.tip').text(langData['travel'][0][10]).show();//请求出错请刷新重试
            }
        });

    }
	
})
