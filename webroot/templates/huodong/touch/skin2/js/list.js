$(function(){
	
	// 筛选样式
	$(".shai_btn").click(function(){
		$(".mask_shai").show();
		$('html').addClass('noscroll');
		$(".shai_page").animate({
			"right":0,
		},300,"swing")
	});
	
	$(".mask_shai").click(function(){
		$(".mask_shai").hide();
		$('html').removeClass('noscroll');
		$(".shai_page").animate({
			"right":"-6rem",
		},300,"swing");
	});
	
	
	var page = 1, totalPage = 0 , islaod = 0; 
	var con = $('.list_box'), clist = con.children('ul');
	
	getData();
	
	
	// 点击快速筛选
	$(".fast_shai li").click(function(){
		var t =$(this),orderby = t.attr("data-order");
		t.addClass('onclick').siblings('li').removeClass('onclick');
		getData(1);
	});
	
	// 确认筛选
	$(".sure_btn").click(function(){
		getData(1);
		$(".mask_shai").click();
	});
	
	// 筛选
	$(".shai_page li").click(function(){
		var t = $(this);
		t.addClass('on_chose').siblings('li').removeClass('on_chose');
	})
	
	
	
	
	$(window).scroll(function(){
		var scrTop = $(window).scrollTop();
		var bh = $('body').height();
		var wh = $(window).height();
		var scroll = bh - wh ;
		if(scrTop >= $(".shai_box").offset().top){
			$('.topfixed').append($(".shai"));
		}else{
			$(".shai_box").append($(".shai"));
		}
		
		console.log(scrTop >= scroll , !isload)
		if(scrTop >= scroll && !isload){
			
			getData()
		}
	})
	
	
	
	// 获取数据
	
	function getData(is){
		if(is){   //更换筛选条件
			page = 1; 
			totalPage = 0 ;
			islaod = 0;
			clist.html('');
		}
		
		islaod = 1;
		var data = [] ;
		var orderby = $(".onclick").attr("data-order");
		if(orderby != undefined && orderby != ''){
			data.push("orderby=" + orderby);
		}
		data.push("page=" + page);
		data.push('pageSize=10');
		data.push('keywords='+keywords);
		
		$(".shai_page .dl_box").each(function(i){
			console.log(i)
			var t = $(this), id = t.find('.on_chose').attr('data-id');
			if(id != undefined && id != ''){
				$(".shai_btn").addClass('onclick');
			    switch(i){
			        case 0:
			        data.push('feetype='+id);
			        break;
			        case 1:
			        data.push('times='+id);
			        break;
			        case 2:
			        data.push('typeid='+id);
			        break;
			    }
			}
		});
		
		
		
		
		$.ajax({
		    url: '/include/ajax.php?service=huodong&action=hlist',
		    type: 'GET',
		    data: data.join('&'),
		    dataType: 'json',
		    success: function(data){
		        if(data){
		            if(data.state == 100){
		                var info = data.info, list = info.list, html = [];
						totalPage = info.pageInfo.totalPage;
		               for(let m = 0; m<list.length; m++){
						    html.push('<li class="li_box">');
							html.push('<a href="'+list[m].url+'" class="hd_box fn-clear">');
							html.push('<div class="hd_img"><img src="'+list[m].litpic+'" alt=""></div>');
							html.push('<div class="right_info"><h3>'+list[m].title+'</h3>');
							html.push('<div class="hd_detail">');
							html.push('<p class="act_time"><i></i><span>'+returnHumanTime(list[m].began,2)+'</span></p>');
							html.push('<p class="act_addr"><i></i><span>'+list[m].addrname.join(' ')+'</span></p>');
							html.push('<p class="act_bm"><i></i><span>'+(langData['huodong'][0][1].replace("1",list[m].reg))+'</span></p></div></div></a>');  //已报名<em>1</em>人
							html.push('<a href="'+list[m].memberurl+'" class="host_box fn-clear">');
							html.push('<div class="head_img"><img src="'+list[m].userphoto+'" onerror="javascript:this.src=\''+masterDomain+'/static/images/noPhoto_40.jpg\';"></div></div>');
							html.push('<p>'+list[m].username+' </p>');
							if(list[m].feetype=="0"){
								  html.push('<div class="price_show free">'+langData['huodong'][0][5]+'</div>');  //免费
							}else{
								  html.push('<div class="price_show ">'+echoCurrency('symbol')+'<em>'+list[m].mprice+'</em>'+langData['huodong'][0][6]+'</div>');
							}
							html.push('</a></li>');
					   }
						
		                clist.append(html.join(""));
						page ++;
						isload = 0;
						
						if(page>totalPage){
							isload = 1;
							$(".loading").html(langData['huodong'][1][14]);  //已全部加载
						}
						
		            }else{
		                $(".loading").html(data.info)
		            }
		        }else{
		            $(".loading").html(data.info)
		        }
		    },
		    error: function(){
		        alert(langData['huodong'][1][16]);  //网络错误，请刷新重试
		    }
		})
		
	}
	
	
	
	
	
	
})