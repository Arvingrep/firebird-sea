$(function(){
    //转换PHP时间戳
	function transTimes(timestamp, n){
        
        const dateFormatter = huoniao.dateFormatter(timestamp);
        const year = dateFormatter.year;
        const month = dateFormatter.month;
        const day = dateFormatter.day;
        const hour = dateFormatter.hour;
        const minute = dateFormatter.minute;
        const second = dateFormatter.second;
        
		if(n == 1){
			return (year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
		}else if(n == 2){
			return (year+'-'+month+'-'+day);
		}else if(n == 3){
			return (month+'-'+day);
		}else if(n == 4){
			return (hour+':'+minute+':'+second);
		}else{
			return 0;
		}
	}
    //获取时间段
    function time_tran(time) {
            var dur = nowStamp - time;
            if (dur < 0) {
                    return transTimes(time, 2);
            } else {
                    if (dur < 60) {
                            return dur+'秒前';
                    } else {
                            if (dur < 3600) {
                                    return parseInt(dur / 60)+'分钟前';
                            } else {
                                    if (dur < 86400) {
                                            return parseInt(dur / 3600)+'小时前';
                                    } else {
                                            if (dur < 259200) {//3天内
                                                    return parseInt(dur / 86400)+'天前';
                                            } else {
                                                    return transTimes(time, 2);
                                            }
                                    }
                            }
                    }
            }
    }
    // 下拉加载
	var isload = false;
	$(document).ready(function() {
		$(window).scroll(function() {
			var allh = $('body').height();
			var w = $(window).height();
			var scroll = allh - w;
			if ($(window).scrollTop() + 50 > scroll && !isload) {
				page++;
				getList();
			};
		});
	});
    getList();
    function getList(){
        isload = true;
        if(page == 1){
            $(".Businesslist").html('<div class="loading">加载中...</div>');
        }else{
            $(".Businesslist").append('<div class="loading">加载中...</div>');
        }
        $.ajax({
            url: "/include/ajax.php?service=business&action=news_list&page="+page+"&pageSize="+pagesize+"&uid="+uid,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data.state != 101){
                    $('.Businesslist .loading').remove();
                    var list = data.info.list, box, html = [];
                    if(list.length > 0){
                        for(var i = 0; i < list.length; i++){
                            box = list[i];
                            html.push('<div class="Business_de"><a href="'+box.url+'">');
                            html.push('     <div class="Business_title">'+box.title+'</div>');
                            html.push('     <div class="Business_foot fn-clear">');
                            html.push('          <span>'+time_tran(list[i].pubdate)+'</span>');
                            html.push('          <p><i></i>'+box.click+'</p>');
                            html.push('     </div>');
                            html.push('</a></div>');
                        }
                        $(".Businesslist").append(html.join(""));
                        isload = false;
                        //最后一页
                        if(page >= data.info.pageInfo.totalPage){
                            isload = true;
                            $(".Businesslist").append('<div class="loading">已全部加载完成...</div>');
                        }
                    }else{
                        $(".Businesslist").html('<div class="loading">暂无相关内容！</div>');
                    }
                }else{
                    $(".Businesslist").html('<div class="loading">'+data.info+'</div>');
                }
            }
        })
    }
})
