$(function(){
    var page = 1, pageSize = 10, isload = false;
    
    //APP端取消下拉刷新
    toggleDragRefresh('off'); 

    //初始加载
    getList(1);
    
    function  getList(){
        var data = [];
        data.push("page="+page);
        data.push("pageSize="+pageSize);

        isload = true;
        if(page == 1){
            $(".tip").html(langData['travel'][12][57]).show();
        }else{
            $(".tip").html(langData['travel'][12][57]).show();
        }
        
        $.ajax({
            url: masterDomain + "/include/ajax.php?service=travel&action=videoList&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
					var html = [], html1 = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
						if(i%2==0){
							html.push('<li><a class="li_video" href="'+list[i].url+'">');
							var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "";
							html.push('<div class="video_img"><img src="'+pic+'" /></div>');
							html.push('<div class="videoInfo">');
							html.push('<h2>'+list[i].title+'</h2>');
							html.push('<div class="up_more">');
							html.push('<div class="_left">');
							var photo = list[i].user['photo'] != "" && list[i].user['photo'] != undefined ? huoniao.changeFileSize(list[i].user['photo'], "small") : "/static/images/noPhoto_40.jpg";
							html.push('<div class="headimg"><img src="'+photo+'"></div>');
							html.push('<p class="up_name">'+list[i].user['nickname']+'</p>');
							html.push('</div>');
							html.push('<p class="_right">'+list[i].click+langData['travel'][6][9]+'</p>');
							html.push('</div>');
							html.push('</div>');
							html.push('</a></li>');
						}else{
							html1.push('<li><a class="li_video" href="'+list[i].url+'">');
							var pic = list[i].litpic != "" && list[i].litpic != undefined ? huoniao.changeFileSize(list[i].litpic, "small") : "";
							html1.push('<div class="video_img"><img src="'+pic+'" /></div>');
							html1.push('<div class="videoInfo">');
							html1.push('<h2>'+list[i].title+'</h2>');
							html1.push('<div class="up_more">');
							html1.push('<div class="_left">');
							var photo = list[i].user['photo'] != "" && list[i].user['photo'] != undefined ? huoniao.changeFileSize(list[i].user['photo'], "small") : "/static/images/noPhoto_40.jpg";
							html1.push('<div class="headimg"><img src="'+photo+'"></div>');
							html1.push('<p class="up_name">'+list[i].user['nickname']+'</p>');
							html1.push('</div>');
							html1.push('<p class="_right">'+list[i].click+langData['travel'][6][9]+'</p>');
							html1.push('</div>');
							html1.push('</div>');
							html1.push('</a></li>');
                        }
                    }
                    
                    if(page == 1){
                        if(html!=''){
                            $(".left_list").html(html.join(""));
                        }
                        if(html1!=''){
                            $(".right_list").html(html1.join(""));
                        }
                    }else{
                        if(html!=''){
                            $(".left_list").append(html.join(""));
                        }
                        if(html1!=''){
                            $(".right_list").append(html1.join(""));
                        }
                    }
                    
                    isload = false;

                    if(page >= pageinfo.totalPage){
                        isload = true;
                        $(".tip").html(langData['travel'][0][9]).show();
                    }

				}else{
					if(page == 1){
                        $(".left_list").html("");
                        $(".right_list").html("");
                    }
                    $(".tip").html(data.info).show();
				}
			},
            error: function(){
				$('.tip').text(langData['travel'][0][10]).show();//请求出错请刷新重试
            }
        });
        
    }

    //滚动底部加载
    $(window).scroll(function() {
        var allh = $('body').height();
        var w = $(window).height();
        var s_scroll = allh - 30 - w;
        //服务列表
        if ($(window).scrollTop() > s_scroll && !isload) {
            page++;
            getList();
        };
    });
    
});
