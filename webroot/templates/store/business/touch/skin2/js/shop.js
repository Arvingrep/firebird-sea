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
            $(".Shoplist").html('<div class="loading">加载中...</div>');
        }else{
            $(".Shoplist").append('<div class="loading">加载中...</div>');
        }
        $.ajax({
            url: "/include/ajax.php?service=shop&action=slist&page="+page+"&pageSize="+pagesize+"&store="+store ,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data.state != 101){
                    $('.Shoplist .loading').remove();
                    var list = data.info.list, box, html = [];
                    if(list.length > 0){
                        for(var i = 0; i < list.length; i++){
                            box = list[i];
                            html.push('<div class="Shop_de"><a href="'+box.url+'">');
                            html.push('     <div class="Shop_pic"><img src="'+changeFileSize(box.litpic, "middle")+'" alt=""></div>');
                            html.push('     <div class="Shop_title">'+box.title+'</div>');
                            html.push('     <div class="Shop_foot fn-clear">');
                            html.push('         <em>'+echoCurrency('symbol')+''+box.price+'</em><s>'+echoCurrency('symbol')+''+box.mprice+'</s>');
                            html.push('     </div>');
                            html.push('</a></div>');
                        }
                        $(".Shoplist").append(html.join(""));
                        isload = false;
                        //最后一页
                        if(page >= data.info.pageInfo.totalPage){
                            isload = true;
                            $(".Shoplist").append('<div class="loading">已全部加载完成...</div>');
                        }
                    }else{
                        $(".Shoplist").html('<div class="loading">暂无相关内容！</div>');
                    }
                }else{
                    $(".Shoplist").html('<div class="loading">'+data.info+'</div>');
                }
            }
        })
    }
})
