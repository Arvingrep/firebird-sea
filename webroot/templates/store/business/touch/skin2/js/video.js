$(function(){
    function changeFileSize(url, to, from){
		if(url == "" || url == undefined) return "";
		if(to == "") return url;
		var from = (from == "" || from == undefined) ? "large" : from;
		var newUrl = "";
		if(hideFileUrl == 1){
			newUrl =  url + "&type=" + to;
		}else{
			newUrl = url.replace(from, to);
		}

		return newUrl;
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
            $(".video").html('<div class="loading">加载中...</div>');
        }else{
            $(".video").append('<div class="loading">加载中...</div>');
        }
        $.ajax({
            url: "/include/ajax.php?service=business&action=video_list&page="+page+"&pageSize="+pagesize+"&uid="+uid,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data.state != 101){
                    $('.video .loading').remove();
                    var list = data.info.list, box, html = [];
                    if(list.length > 0){
                        for(var i = 0; i < list.length; i++){
                            box = list[i];
                            html.push('<div class="video-box">');
                            html.push('     <h3>'+box.title+'</h3>');
                            html.push('     <div class="video-wrap" style="background:url('+changeFileSize(box.litpic, "middle")+') no-repeat; background-size: cover;">');
                            html.push('           <div class="bg"><a href="'+box.url+'"></a></div>');
                            html.push('     </div>');
                            html.push('</div>');
                        }
                        $(".video").append(html.join(""));
                        isload = false;
                        //最后一页
                        if(page >= data.info.pageInfo.totalPage){
                            isload = true;
                            $(".video").append('<div class="loading">已全部加载完成...</div>');
                        }
                    }else{
                        $(".video").html('<div class="loading">暂无相关内容！</div>');
                    }
                }else{
                    $(".video").html('<div class="loading">'+data.info+'</div>');
                }
            }
        })
    }
})
