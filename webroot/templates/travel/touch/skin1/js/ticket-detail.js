$(function(){
	var	page = 1, pageSize = 10, isload = false, lng = '', lat = '';

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
	//门票须知
	$('.notice_ticket').click(function(){
		$('.mask').show();
		$('.detail_price').animate({'bottom':'1.2rem'},200)
	});

	$('.detail_price h2>i,.mask').click(function(){
		$('.mask').hide();
		$('.detail_price').animate({'bottom':'-20rem'},100)
	});

	//点赞
	$('.commentList').on('click','.btnUp',function(){
		var userid = $.cookie(cookiePre+"login_user");
        if(userid == null || userid == ""){
          window.location.href = masterDomain+'/login.html';
          return false;
		}

		var t = $(this), id = t.attr("data-id");
        // if(t.hasClass("active")) return false;

		var num = t.find('em').html();
        if( typeof(num) == 'object') {
          num = 0;
		}
		var type = 'add';
        if(t.hasClass("active")){
            type = 'del';
            num--;
        }else{
            num++;
        }

		$.ajax({
			url: "/include/ajax.php?service=member&action=dingComment&id="+id+ "&type=" + type,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data.state==100){
                    if(t.hasClass("active")){
                        t.removeClass('active');
                    }else{
                        t.addClass('active');
                    }
                    t.find('em').html(num);
                }else{
                    alert(data.info);
                    t.removeClass('active');
                }
			}
		});

	});

	HN_Location.init(function(data){
		if (data == undefined || data.address == "" || data.name == "" || data.lat == "" || data.lng == "") {
			$(".ul_box").html('<div class="loading">定位失败,请重新刷新页面！</div>');
		}else{
			lng = data.lng, lat = data.lat;
			getList();
		}
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

	function getList(){
		var data = [];
        data.push("page="+page);
		data.push("pageSize="+pageSize);
		data.push("lng="+lng);
		data.push("lat="+lat);
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
            url: masterDomain + "/include/ajax.php?service=travel&action=ticketList&"+data.join("&"),
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
						var labshow = list[i].flagname != "" && list[i].flagname != undefined ? '<label class="labshow">'+list[i].flagname+'</label>' : '';
						html.push('<div class="left_b '+videoshow+'">'+labshow+'<img src="'+pic+'" /></div>');
						html.push('<div class="right_b">');
						html.push('<h2>'+list[i].title+'</h2>');
						if(list[i].tagAll!=''){
                            html.push('<p class="lab_box">');
                            for(var m=0;m<list[i].tagAll.length;m++){
                                if(m>2) break;
                                html.push('<span>'+list[i].tagAll[m].jc+'</span>');
                            }
                            html.push('</p>');
						}
						html.push('<p class="price"><span>'+echoCurrency('symbol')+'<em>'+list[i].price+'</em></span>'+langData['travel'][1][6]+'</p>');
						html.push('<p class="info_view"><span class="distance">'+langData['travel'][1][7]+list[i].distance+'</span><span class="posi_view">'+list[i].addrname[0]+' '+list[i].addrname[1]+'</span></p>');
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
					isload = true;
					if(page == 1){
                        $(".listBox ul").html("");
                    }
					$(".tip").html(data.info).show();
				}
			},
            error: function(){
				isload = true;
				$(".listBox ul").html("");
				$('.tip').text(langData['travel'][0][10]).show();//请求出错请刷新重试
            }
		});

	}

});
