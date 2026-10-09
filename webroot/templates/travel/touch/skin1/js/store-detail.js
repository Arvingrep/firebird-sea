$(function(){
    $('.appMapBtn').attr('href', OpenMap_URL);

    var page = 1, pageSize = 3, isload = false;

    //店铺相关tab
    $('.detail_nav').delegate('li','click',function(){
		$(this).addClass('on').siblings().removeClass('on');
	    var i = $(this).index(), id = $(this).data('id');
        $('.detail_content .changebox').eq(i).addClass('show').siblings().removeClass('show');
        page = 1;
        getList(1);
    });


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


    getList(1);

    function  getList(tr){
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);
        data.push("store="+id);

        var type = $(".detail_nav2 .on").data('id');
        if(type=='') return;
        var url = '';
        if(type == 'agency'){
            url = masterDomain + '/include/ajax.php?service=travel&action=agencyList&';
        }else if(type == 'visa'){
            url = masterDomain + '/include/ajax.php?service=travel&action=visaList&';
        }

        isload = true;
        if(page == 1){
            if(type == 'agency'){
                $(".agencylist ul").html();
            }else if(type == 'visa'){
                $(".visalist ul").html();
            }
            $(".tip").html(langData['travel'][12][57]).show();
        }else{
            $(".tip").html(langData['travel'][12][57]).show();
        }
        
        $.ajax({
            url: url + data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
                        if(type == 'agency'){
                            if(i>=0){
                                html.push('<li class="li_box">');
                                html.push('<a href="'+list[i].url+'">');
                                var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                                var videoshow = list[i].video != "" && list[i].video != undefined ? "videoshow" : '';
                                var labshow = list[i].flagname != "" && list[i].flagname != undefined ? '<label class="labshow"><span>'+list[i].flagname+'</span></label>' : '';
                                html.push('<div class="left_b '+videoshow+'">'+labshow+'<img src="'+pic+'" /></div>');
                                html.push('<div class="right_b">');
                                html.push('<h2>'+list[i].title+'</h2>');
                                if(list[i].typeid==1){
                                    html.push('<p class="time_box">'+list[i].missiontime+'</p>');
                                }
                                html.push('<div class="info_view"><p class="price"><span>'+echoCurrency('symbol')+' <em>'+list[i].price+'</em></span>'+langData['travel'][1][6]+'</p></div>');
                                html.push('</div>');
                                html.push('</a>');
                                html.push('</li>');
                              }else{
                                $('.newPoster.travelStore .html2ConShow .travelStoreGo').remove();
                            }
                        }else if(type == 'visa'){
                            html.push('<li class="li_box">');
                            html.push('<a href="'+list[i].url+'">');
                            var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "/static/images/404.jpg";
                            var videoshow = list[i].video != "" && list[i].video != undefined ? "videoshow" : '';
                            html.push('<div class="left_b '+videoshow+'"><img src="'+pic+'" /></div>');
                            html.push('<div class="right_b">');
                            html.push('<h2>'+list[i].title+'</h2>');
                            html.push('<p class="lab_box"><span>'+list[i].typename+'/'+list[i].countryname+'</span></p>');
                            html.push('<div class="info_view"><p class="price"><span>'+echoCurrency('symbol')+' <em>'+list[i].price+'</em></span>'+langData['travel'][1][6]+'</p></div>');
                            html.push('</div>');
                            html.push('</a>');
                            html.push('</li>');
                        }
                    }
                    if(page == 1){
                        if(type == 'agency'){
                            $(".agencylist ul").html(html.join(""));
                        }else if(type == 'visa'){
                            $(".visalist ul").html(html.join(""));
                        }
                    }else{
                        if(type == 'agency'){
                            $(".agencylist ul").append(html.join(""));
                        }else if(type == 'visa'){
                            $(".visalist ul").append(html.join(""));
                        }
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
                  	if(type == 'agency'){
                        $('.newPoster.travelStore .html2ConShow .travelStoreGo').remove();
                    }
                }
            },
            error: function(){
				isload = false;
				$(".listBox ul").html("");
				$('.tip').text(langData['travel'][0][10]).show();//请求出错请刷新重试
            }
        });
    }

})





 