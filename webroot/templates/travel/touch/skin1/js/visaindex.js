$(function () {
	var page = 1, pageSize = 9;
	var swper2 = new Swiper('.banner', {
		pagination:{
			el:'.swiper-pagination'
			},
		   autoplay: {
			   delay: 2000,
			   disableOnInteraction: false,
		   },
	   direction: 'horizontal',
	   loop: true,
   });

   //类别切换
   $('.area_nav li').click(function(){
		$(this).addClass('on').siblings().removeClass('on');
		var i = $(this).index();
		// $('.country_list ul').eq(i).addClass('on_show').siblings().removeClass('on_show');
		page = 1;
		getList();
   });

   getList();

   function  getList(){
		var data = [];
		data.push("page="+page);
		data.push("pageSize="+pageSize);

		var id = $('.area_nav li.on').data('id');
		if(id == 'hot'){
			data.push("hot=1");
		}else{
			data.push("continent=" + id);
		}

        if(page == 1){
			$(".country_list ul").html();
            $(".tip").html(langData['travel'][12][57]).show();
        }else{
            $(".tip").html(langData['travel'][12][57]).show();
		}

		$.ajax({
            url: masterDomain + "/include/ajax.php?service=travel&action=countrytype&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
					var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
						var urlString = visaUrl.replace("%id%", list[i].id);
						html.push('<li>');
						html.push('<a href="'+urlString+'">');
						//if(list[i].price>0){
							html.push('<div class="mask_01"></div>');
						//}
						var pic = list[i].icon != "" && list[i].icon != undefined ? huoniao.changeFileSize(list[i].icon, "small") : "/static/images/404.jpg";
						html.push('<img src="'+pic+'" />');
						html.push('<div class="text">');
						html.push('<h3>'+list[i].typename+'</h3>');
						if(list[i].price>0){
							html.push('<p>'+echoCurrency('symbol')+'<em>'+list[i].price+'</em>'+langData['travel'][12][89]+'</p>');
						}
						html.push('</div>');
						html.push('</a>');
						html.push('</li>');
					}
					if(page == 1){
                        $(".country_list ul").html(html.join(""));
                    }else{
                        $(".country_list ul").append(html.join(""));
                    }
                    if(page >= pageinfo.totalPage){
                        $(".tip").html(langData['travel'][0][9]).show();
                    }
				}else{
					if(page == 1){
                        $(".country_list ul").html("");
                    }
					$(".tip").html(data.info).show();
				}
			},
            error: function(){
				$(".country_list ul").html("");
				$('.tip').text(langData['travel'][0][10]).show();//请求出错请刷新重试
            }
		});

   }
});