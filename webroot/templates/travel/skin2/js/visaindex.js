$(function () {

	//热门国家/地区
	var page = 1, pageSize = 99;
   	//类别切换
   	$('.area_nav li').click(function(){
		$(this).addClass('on').siblings().removeClass('on');
		var i = $(this).index();
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
            $(".country_list .tip").html(langData['travel'][12][57]).show();
        }else{
            $(".country_list .tip").html(langData['travel'][12][57]).show();
		}

		$.ajax({
            url:  "/include/ajax.php?service=travel&action=countrytype&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                if(data && data.state == 100){
                	//$(".tip").hide()
					var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    for (var i = 0; i < list.length; i++) {
						var urlString = visaUrl.replace("%id%", list[i].id);
						html.push('<li>');
						html.push('<a href="'+urlString+'">');						
						html.push('<div class="mask_01"></div>');						
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
                        $(".country_list .tip").html(langData['travel'][0][9]).hide();//已显示全部
                    }
                    $('.country_list ul li:nth-child(5n)').css('margin-right','0')
				}else{
					if(page == 1){
                        $(".country_list ul").html("");
                    }
					$(".country_list .tip").html(data.info).show();
				}
			},
            error: function(){
				$(".country_list ul").html("");
				$('.country_list .tip').text(langData['travel'][0][10]).show();//请求出错请刷新重试
            }
		});

    }
	var vpage = 1, vpageSize = 99;
   	//免签/落地签
   	$('.visa_nav li').click(function(){
		$(this).addClass('on').siblings().removeClass('on');
		var i = $(this).index();
		vpage = 1;
		getvisaList();
   	});
   	getvisaList()
   	function  getvisaList(){
        var data = [];
        data.push("page="+vpage);
        data.push("pageSize="+vpageSize);

        var id = $('.visa_nav li.on').data('id');
        data.push("typeid="+id);

        isload = true;
        if(page == 1){
			$(".listBox ul").html();
            $(".listBox .tip").html(langData['travel'][12][57]).show();
        }else{
            $(".listBox .tip").html(langData['travel'][12][57]).show();
        }
        
        $.ajax({
            url:  "/include/ajax.php?service=travel&action=countrytype&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
					var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
					
                    for (var i = 0; i < list.length; i++) {
                    	var vid = list[i].id;
                    	var html2=[], html3=[];
                        html.push('<li class="li_box" >');
                        html.push('<a href="javascript:;" data-url="'+list[i].url+'">');
                        html.push('<div class="mask_01"></div>');
                        var pic = list[i].icon != "" && list[i].icon != undefined ? huoniao.changeFileSize(list[i].icon, "small") : "/static/images/404.jpg";
						html.push('<div class="li_img"><img src="'+pic+'" /></div>');
                        html.push('<div class="text">');
                        //此处可能有免签落地签共存情况
                        html.push('<span>'+list[i].typeidname+'</span>');
                        html.push('<p class="place">'+list[i].typename+'</p>');
                        html.push('</div>');
                        html.push('</a>');
                        $.ajax({
				            url:  "/include/ajax.php?service=travel&action=countryDetail&id="+vid,
				            type: "GET",
				            async: false,
				            dataType: "jsonp",
				            success: function (data) {
				                isload = false;
				                if(data && data.state == 100){
				                	
									var detail = data.info;
			                        html2.push('<div class="countyDetail">');
			                        html2.push('<div class="countyBox">');
			                        html2.push('<div class="top_cont">');
			                        //两种政策并存时
                                    if(detail.typeid ==2){
									html2.push('<ul class="fn-clear two-ul"><li class="two-li on"><a href="javascript:;">'+langData['travel'][12][90]+'</a></li><li class="two-li"><a href="javascript:;">'+langData['travel'][12][91]+'</a></li></ul>');
									//只有一种政策时
                                    }else{
                                        html2.push('<ul class="fn-clear one-ul"><li class="'+(detail.typeid==0?"on":"fn-hide")+'"><a href="javascript:;">'+langData['travel'][12][90]+'</a></li><li class="'+(detail.typeid==1?"on":"fn-hide")+'"><a href="javascript:;">'+langData['travel'][12][91]+'</a></li></ul>');
                                    }
									
									html2.push('</div>');
									html2.push('<div class="detilBox">');									
									html2.push('<div class="div_box '+(detail.typeid==0 || detail.typeid==2 ?"show":"")+'">');
									html2.push('<dl><dt>'+langData['travel'][10][3]+'</dt><dd>'+detail.duration+'</dd></dl>');//停留期限
									html2.push('<dl><dt>'+langData['travel'][10][4]+'</dt><dd>'+detail.condition.replace('</div>','')+'</dd></dl>');//条件说明
									html2.push('</div>');
									html2.push('<div class="div_box '+(detail.typeid==1 ?"show":"")+'">');
									html2.push('<dl><dt>'+langData['travel'][10][3]+'</dt><dd>'+detail.duration+'</dd></dl>');//停留期限
									html2.push('<dl><dt>'+langData['travel'][10][4]+'</dt><dd>'+detail.condition.replace('</div>','')+'</dd></dl>');//条件说明
									html2.push('<dl><dt>'+langData['travel'][10][5]+'</dt><dd>'+detail.expenses+'</dd></dl>');//办理费用
									html2.push('</div>');
									html2.push('</div>');						
									html2.push('<p class="_tip">该信息通过相关驻华使馆通报及其网上公开信息搜集整理，因各种原因可能存在未及时更新的情况，仅供参考。</p>');
									html2.push('<p class="goHere" data-place="'+detail.typename+'"><a href="javascript:;">我要去这玩</a></p>');
									html2.push('</div>');
									html2.push('</div>');
									html3=html2.join("");									
								}
							}
						})
                        html.push(html3); 
                        html.push('</li>'); 
                    }
                    if(page == 1){
                        $(".listBox ul").html(html.join(""));
                    }else{
                        $(".listBox ul").append(html.join(""));
                    }
                    $(".listBox ul li.li_box:nth-child(5n),.listBox ul li.li_box:nth-child(5n-1)").addClass('spe_li');
                    $(".listBox ul li.li_box:nth-child(5n)").css('margin-right','0')
                    isload = false;

                    if(page >= pageinfo.totalPage){
                        isload = true;
                        $(".listBox .tip").html(langData['travel'][0][9]).hide();
                    }
                }else{
                    if(page == 1){
                        $(".listBox ul").html("");
                    }
					$(".listBox .tip").html(data.info).show();
                }
            },
            error: function(){
				isload = false;
				$(".listBox ul").html("");
				$('.listBox .tip').text(langData['travel'][0][10]).show();//请求出错请刷新重试
            }
        });

    }
    //免签政策 落地签政策切换
    $('#visacountry').delegate('.two-li','click',function(){
    	$(this).addClass('on').siblings().removeClass('on')
    	var i=$(this).index();
        var par = $(this).closest('.li_box')
        par.find('.div_box').eq(i).addClass('show').siblings('.div_box').removeClass('show');
    })

    //我要去这玩
    $('#visacountry').delegate('.goHere','click',function(){
    	var txt =$(this).attr('data-place');
    	location.href = channelDomain+'/grouptravel.html?keywords='+txt;
        return false;
    })

});