$(function () {
    $('.appMapBtn').attr('href', OpenMap_URL);

    // 分销分享
    $(".fenxiao_share").click(function(){
      if (device.indexOf('huoniao_iOS') > -1 || device.indexOf('huoniao_Android') > -1){
       setupWebViewJavascriptBridge(function(bridge) {
                 bridge.callHandler("appShare", {
                     "platform": "all",
                     "title": wxconfig.title,
                     "url": wxconfig.link,
                     "imageUrl": wxconfig.imgUrl,
                     "summary": wxconfig.description
                 }, function(responseData){
                     var data = JSON.parse(responseData);
                 })
           });
      }else{
       $("#postFast").click();
      }
    })
    
    var page = 1, pageSize = 10, isload = false;

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

    getList();

    function  getList(){
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("addrid="+addrid);
        data.push("noid="+id);

        isload = true;
        if(page == 1){
			$(".listBox ul").html();
            $(".tip").html(langData['travel'][12][57]).show();
        }else{
            $(".tip").html(langData['travel'][12][57]).show();
        }

        $.ajax({
            url: masterDomain + "/include/ajax.php?service=travel&action=rentcarList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
					var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        html.push('<li class="li_box">');
						html.push('<a href="'+list[i].url+'" data-url="'+list[i].url+'">');
						var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
						var videoshow = list[i].video != "" && list[i].video != undefined ? "videoshow" : '';
						html.push('<div class="left_b '+videoshow+'"><img src="'+pic+'" /></div>');
						html.push('<div class="right_b">');
						html.push('<h2>'+list[i].title+'</h2>');
						html.push('<p class="car_info">'+list[i].typename+' / '+list[i].addrname[2]+'</p>');
						if(list[i].tagAll!=''){
                            html.push('<p class="lab_box">');
                            for(var m=0;m<list[i].tagAll.length;m++){
                                if(m>2) break;
                                html.push('<span>'+list[i].tagAll[m].jc+'</span>');
                            }
                            html.push('</p>');
						}
						html.push('<div class="info_view">');
						html.push('<p class="price"><span>'+echoCurrency('symbol')+'<em>'+list[i].price+'</em></span>/'+langData['travel'][12][79]+'</p>');
						// html.push('<p class="distance">500m</p>');
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
});
