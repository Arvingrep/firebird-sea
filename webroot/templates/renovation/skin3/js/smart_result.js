$(function(){

	$('.re_ul').delegate('li','click',function(){
		if($(this).hasClass('active')){
            $(this).toggleClass('active');
            
        }else{
            if($('.re_ul li.active').size() < 3){
                $(this).toggleClass('active');


            }else{
                alert(langData['renovation'][4][31]);//最多只能选择三个

            }
        }
	})

	var list=[];
	var re_ul=$('.re_ul')
	var page =1,pageSize=3;
	getList();
	$('.re_choose').delegate('.re_more','click',function(){
        page++;
        getList();
	})
	function getList(){

		re_ul.append('<div class="loading">'+langData['siteConfig'][38][8]+'</div>');//加载中...		
		var data = [];
        data.push("jiastyle="+jiastyle);
        data.push("comstyle="+comstyle);
        data.push("style="+style);
        data.push("page="+page);
        data.push("pageSize="+pageSize);
		$.ajax({
            url:  "/include/ajax.php?service=renovation&action=store&"+data.join("&"),
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
                isload = false;
                if(data && data.state == 100){
                    
                    var html = [], list = data.info.list, pageinfo = data.info.pageInfo;
                    if(list.length>0){
                        $(".loading").remove();
                        for (var i = 0; i < list.length; i++) {

							html.push('	<li class="fn-clear" data-id='+list[i].id+'>');
							html.push('		<div class="re_img">');
							var pic = list[i].logo != "" && list[i].logo != undefined ? list[i].logo : "/static/images/404.jpg";
							html.push('			<img src="'+pic+'" alt="">');
							html.push('		</div>');
							html.push('		<div class="re_txt">');
							html.push('			<div class="re_top">'+list[i].company+'');
							if(list[i].safeguard > 0){
				                html.push('<i class="defend"></i>'); 
				            }
				            if (list[i].certi == 1) {
				                html.push('<i class="certify"></i>'); 
				            }
				            html.push('		</div>');
							html.push('			<div class="prove">');

							html.push('				<p class="anli"><span>'+langData['renovation'][0][24]+'</span><span>'+langData['renovation'][14][75].replace('1',list[i].diaryCount)+'</span></p>');//案例 -- 1套
							html.push('				<p class="site"><span>'+langData['renovation'][0][25]+'</span><span>'+langData['renovation'][14][81].replace('1',list[i].constructionCount)+'</span></p>');//工地 -- 1个
							html.push('				<p class="forman"><span>'+langData['renovation'][0][34]+'</span><span>'+langData['renovation'][14][81].replace('1',list[i].foremanCount)+'</span></p>');//工长--1个
							html.push('				<p class="artist"><span>'+langData['renovation'][0][4]+'</span><span>'+langData['renovation'][14][81].replace('1',list[i].teamCount)+'</span></p>');//设计师--1个
							html.push('			</div>');
							html.push('		</div>');
							html.push('		<div class="re_phone"><a href="tel:'+list[i].contact+'">'+list[i].contact+'</a></div>');
							html.push('	</li>');
								
						}
						re_ul.append(html.join("")); 
						if(page >= pageinfo.totalPage){
				            $('.re_more').hide();                          
				            re_ul.append('<div class="loading">'+langData['renovation'][2][28]+'</div>');//到底了...                            
				        }
				    }else{
				    	$('.re_more').hide();
                        $(".loading").html(langData['siteConfig'][20][126]);//暂无相关信息！
                    }                                      
                }else{
                	$('.re_more').hide();
                    $(".loading").html(data.info);
                }
            },
            error: function(){
                $('.re_more').hide();
                $(".loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
		})
	}
	 //提交

    $('.re_submit').click(function(){

    	if(!($('.re_ul li').hasClass('active'))){
    		alert(langData['renovation'][14][5]);//请选择装修公司
    	}else{
    		var store = [];
    		$('.re_ul li.active').each(function(){
    			var tid = $(this).attr("data-id");
    			store.push(tid)
    		})

    		data = [];
    		data.push("people="+people);
    		data.push("address="+address);
    		data.push("contact="+contact);
    		data.push("addrid="+addrid);
    		data.push("stype="+stype);
    		data.push("style="+style);
    		data.push("comstyle="+comstyle);
    		data.push("jiastyle="+jiastyle);
    		data.push("stype="+stype);
			data.push("is_smart=1");
    		data.push("community="+community);
    		company  = store.join(","); 
            data.push("company="+company);
    		data.push("bid="+company);

    		param = data.join("&");

    		$.ajax({
            url:  "/include/ajax.php?service=renovation&action=sendRese&"+param,
            type: "POST",
            dataType: "jsonp",
            success: function (data) {
            	if(data.state !=100){
            		alert(data.info)
            	}else{
					alert(data.info)
    				$('.order_mask').show();
            	}
            },
            error:function(){
            	$('.re_more').hide();
                $(".loading").html(langData['renovation'][2][29]);//网络错误，加载失败...
            }
        	})

    	}


    	
    })

    $('.order_mask .close_alert').click(function(){
        location.href = channelDomain+"/index.html";
    })
     $('.order_mask .t3').click(function(){
        location.href = channelDomain+"/index.html";
    })

})
