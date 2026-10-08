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
            $(".overall ul").html('<div class="loading">加载中...</div>');
        }else{
            $(".overall ul").append('<div class="loading">加载中...</div>');
        }
        $.ajax({
            url: "/include/ajax.php?service=business&action=panor_list&page="+page+"&pageSize="+pagesize+"&typeid="+typeid+"&uid="+uid,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data.state != 101){
                    $('.overall ul .loading').remove();
                    var list = data.info.list, box, html = [];
                    if(list.length > 0){
                        for(var i = 0; i < list.length; i++){
                            box = list[i];
                            html.push('<li><a href="'+box.url+'">');
                            html.push('    <div class="view-box"  style="background:url('+changeFileSize(box.litpic, "middle")+') no-repeat; background-size: cover;">');
                            html.push('         <div class="bg"></div>');
                            html.push('         <div class="view-tit"><p class="view-brief">'+box.title+'</p></div>');
                            html.push('    <div>');
                            html.push('</a></li>');
                        }
                        $(".overall ul").append(html.join(""));
                        isload = false;
                        //最后一页
                        if(page >= data.info.pageInfo.totalPage){
                            isload = true;
                            $(".overall ul").append('<div class="loading">已全部加载完成...</div>');
                        }
                    }else{
                        $(".overall ul").html('<div class="loading">暂无相关内容！</div>');
                    }
                }else{
                    $(".overall ul").html('<div class="loading">'+data.info+'</div>');
                }
            }
        })
    }
})
