$(function(){
	var page = 1, isload = 0;
	
	// 切换
	$(".profit_tbox .profit_tli").click(function(){
		var t = $(this),index = t.index();
		if(t.hasClass("on_chose")) return false;
		t.addClass("on_chose").siblings("li").removeClass("on_chose");
		$(".profit_con .profit_list").removeClass('show');
		$(".profit_con .profit_list").eq(index).addClass('show');
		page = 1; isload = 0;
		getlist();
	})
	
	
	// 滚动加载
	$(window).scroll(function(){
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w -10;
		if ($(window).scrollTop() >= scroll && !isload) {
			type = $(".tab_box  li.on_chose").attr('data-type');
			getlist();
		};
	})
	
	
	getlist();
	function getlist(){
		if(isload) return false;
		isload = 1;
		var type = $(".profit_tbox .profit_tli.on_chose").attr('data-type');
		$(".profit_list.show").find(".loading").remove();
		$(".profit_list.show").append('<p class="loading">'+langData['live'][4][16]+'</p>'); //加载中~;
		if(type=='gift'){
			url = '/include/ajax.php?service=live&action=chatRoomGiftList&chatid='+chatid+'&page='+page+'&pageSize=10&keywords=&orderby=';
		}else if(type=='reward'){
			url = '/include/ajax.php?service=live&action=chatRoomRewardList&chatid='+chatid+'&page='+page+'&pageSize=10&keywords=&orderby=';
		}else{
			url = '/include/ajax.php?service=live&action=chatRoomPaySeeList&chatid='+chatid+'&page='+page+'&pageSize=10&keywords=&orderby=';
		}
		
		$.ajax({
			url:url,
			type:"GET",
			dataType:"json",
			success:function(data){
				if(data.state==100){
						var list = data.info.list;
						var totalPage = data.info.pageInfo.totalPage;
						var html = [];
						$(".profit_list.show").find('h2 em').text(data.info.pageInfo.totalCount)
						for(var i=0; i<list.length; i++){
							var gift = list[i];
							$(".profit_list.show").find(".tip em").text(gift.fee)
							html.push('<li class="profit_li" data-id="'+gift.gift_id+'"><div class="fn-clear">');
							html.push('<div class="left_himg"><a href="'+masterDomain+'/user/'+gift.reward_userid+'"><img src="'+gift.userinfo.photo+'" onerror="this.src=\'/static/images/noPhoto_60.jpg\'"></a></div>');
							html.push('<div class="uinfo"><h3>'+gift.userinfo.nickname+'</h3>');
							html.push('<p>'+huoniao.transTimes(gift.date,1)+'</p></div>');
							html.push('<span class="count">'+(type=='livefee'?gift.amount:gift.price)+'</span></div>');
							if(type=='gift'){
								html.push('<div class="gift_con"><div class="gift_img"><img src="'+gift.gift_litpic+'"></div>'+langData['live'][5][18]+gift.gift_name+'<em><i>x</i>'+gift.num+'</em></div>');   //送出
							}
							
							html.push('</li>');
						
							
						}
						if(page==1){
							$(".profit_list.show .profit_ul").html(html.join(''))
						}else{
							$(".profit_list.show .profit_ul").append(html.join(''));
						}
						$(".profit_list.show").find(".loading").remove();
						
						isload = 0;
						page++;
						if(page>totalPage){
							isload = 1;
							$(".profit_list.show").append('<p class="loading">'+langData['live'][5][10]+'</p>');  //没有更多了
						}
				}else{
					$(".profit_list.show").find(".loading").remove();
					$(".profit_list.show").append('<p class="loading">'+data.info+'</p>');  //加载出错，请稍后重试
				}
			},
			error:function(data){
				$(".profit_list.show").find(".loading").remove();
				$(".profit_list.show").append('<p class="loading">'+langData['live'][5][17]+'</p>');   //加载出错，请稍后重试
			}
		});
		
	}
})