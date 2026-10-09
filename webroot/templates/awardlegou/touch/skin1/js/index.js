$(function(){
	
	$('.btgz').click(function(){
		$(".gz_mask").show();
		$(".gzPop").css("bottom","0")
	});
	
	$(".btn_cancel,.gz_mask").click(function(){
		$(".gz_mask").hide();
		$(".gzPop").css("bottom","-9rem");
	});
	
	
	var swiperList = new Swiper('.proListBox .swiper-container', {
	     autoHeight: true,
		 on:{
			 init:function(){
				getProList();
			 },
			 slideChangeTransitionStart:function(){
				$(".tab_ul li").eq(this.activeIndex).click();
				var end = $('.curr').offset().left + $('.curr').width() / 2 - $('body').width() /2;
				var star = $(".tab_ul").scrollLeft();
				$(".tab_box").scrollLeft(end + star);
				if($('.listBox').eq(this.activeIndex).find('li').length==0){
					getProList();
				}
			 },
		 }
	});
	
	$(".tab_ul li").click(function(){
		$(this).addClass('curr').siblings('li').removeClass('curr');
		var index = $(this).index();
		swiperList.updateAutoHeight(100);
		swiperList.slideTo(index);
	});
	
	 $(window).scroll(function () {
		 var allh = $('body').height();
		 var w = $(window).height();
		 var scroll = allh - w - 50;
		 var isload = Number($(".tab_box li.curr").attr('data-load')) ;
		 if ($(window).scrollTop() >= scroll && !isload) {
			 getProList()
		 }
	 })
	
	function getProList(){
		var page = Number($(".tab_box li.curr").attr('data-page'));
		var isload = Number($(".tab_box li.curr").attr('data-load')) ;
		var index = $(".tab_box li.curr").index();
		var foodtype = Number($(".tab_box li.curr").attr('data-typeid'))
		if(isload) return false;
		isload = 1;
		$(".tab_box li.curr").attr('data-load',isload)
		$('.listBox').eq(index).find(".loading").html('加载中~');
		var dom = $('.listBox').eq(index).find('ul')
		var url  = '/include/ajax.php?service=awardlegou&action=goodList&pageSize=10&foodtype='+foodtype+'&page='+page;
		$.ajax({
			url: url,
			type: "POST",
			dataType: "json",
			success: function (data) {
				if(data.state==100){
					var list = data.info.list;
					var html = []
					for(var i = 0; i<list.length; i++){
						var link = list[i].linkurl ,  //链接
							title = list[i].title,
							imgpath = list[i].litpicpath ,
							price = list[i].price ,
							mprice = list[i].mprice ,
							point = list[i].usepoint ,
							prizetype = list[i].prizetype;
						
						html.push('<li class="pro_li" data-id="'+list[i].id+'">');
						html.push('<a href="'+link+'" class="fn-clear">');
						html.push('<div class="imgbox"><img src="'+imgpath+'"></div>');
						html.push('<div class="pro_info">');
						html.push('<h4>'+title+'</h4>');
						html.push('<dl>');
						html.push('<dt>乐购价</dt>');
						html.push('<dd><span class="qian">'+echoCurrency('symbol')+'<b>'+price+'</b></span>');
						if(point * 1 != 0){
							html.push('<span class="jfen"> +'+point+cfg_pointName+'</span>');
						}
						if(mprice){
							html.push('<em class="yuan">'+echoCurrency('symbol')+mprice+'</em>')
						}
						html.push('</dd>');
						if(prizetype ==1){
							html.push('<div class="btn"><span class="l_txt">领现金红包</span><span class="r_txt" >乐购</span></div>');
						}else {
							html.push('<div class="btn gift_btn"><span class="l_txt"><img src="'+list[i].pizelitpic+'"> 等好礼相送</span><span class="r_txt">乐购</span></div>');
						}

						html.push('</dl>');
						html.push('</div></a></li>');
					}
					
					dom.append(html.join(''));
					page++;
					isload = 0;
					$('.listBox').eq(index).find(".loading").html('下拉加载更多~');
					if(page>data.info.pageInfo.totalPage){
						isload = 1;
						$('.listBox').eq(index).find(".loading").html('没有更多了~');
					}
					$(".tab_box li.curr").attr('data-page',page);
					$(".tab_box li.curr").attr('data-load',isload);
					swiperList.updateAutoHeight(100);
				}else{
					$('.listBox').eq(index).find(".loading").html(data.info);
				}
			},
			error: function(){}
		});
	}
	statistics();
	function statistics() {
		var url  = '/include/ajax.php?service=awardlegou&action=statistics';
		$.ajax({
			url: url,
			type: "POST",
			dataType: "json",
			success: function (data) {
				$("#hongbao").text(data.info.hongbaocount);
				$("#lipin").text(data.info.shiwucount);
			},
			error: function(){}
		})
	}
	
	// 发起了购
	//$("body").delegate(' .btn',"click",function(e){
		// var id = $(this).closest('li.pro_li').attr('data-id');
		// console.log(channelDomain +'/confirm-order.html?proid='+id);
		// return false;
		// window.location = channelDomain +'/confirm-order.html?proid='+id;
	//	console.log(11111);
	//	return false;
	//});
  
  
	
})