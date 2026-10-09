$(function(){
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
                $(".job ul").html('<div class="loading">加载中...</div>');
            }else{
                $(".job ul").append('<div class="loading">加载中...</div>');
            }
            $.ajax({
                url: "/include/ajax.php?service=job&action=post&page="+page+"&pageSize="+pagesize+"&company="+company,
                type: "GET",
                dataType: "jsonp",
                success: function (data) {
                    if(data.state != 101){
                        $('.job ul .loading').remove();
                        var list = data.info.list, box, html = [];
                        if(list.length > 0){
                            for(var i = 0; i < list.length; i++){
                                box = list[i];
                                html.push('<li>');
                                html.push('    <a href="'+box.url+'#jobDetail">');
                                html.push('       <div class="Job_title fn-clear">');
                                html.push('            <span>'+box.title+'</span>');
                                html.push('            <em>'+box.salary+'</em>');
                                html.push('       </div>');
                                html.push('       <div class="Job_tips">');
                                html.push('           <em>'+box.educational+'</em>');
                                html.push('           <em>'+box.experience+'</em>');
                                html.push('       </div>');
                                html.push('       <div class="Job_bottom fn-clear">');
                                html.push('            <div class="Job_location">');
                                html.push('                <span class="job-province">'+box.addr[0]+'</span><em>-</em>');
                                html.push('                <span class="job-local">'+box.addr[1]+'</span>');
                                html.push('            </div>');
                                html.push('            <div class="Job_time">'+box.timeUpdate+'</div>');
                                html.push('       </div>');
                                html.push('    </a>');
                                html.push('</li>');
                            }
                            $(".job ul").append(html.join(""));
                            isload = false;
                            //最后一页
                            if(page >= data.info.pageInfo.totalPage){
                                isload = true;
                                $(".job ul").append('<div class="loading">已全部加载完成...</div>');
                            }
                        }else{
                            $(".job ul").html('<div class="loading">暂无相关内容！</div>');
                        }
                    }else{
                        $(".job ul").html('<div class="loading">'+data.info+'</div>');
                    }
                }
            })
        }
    })

})
