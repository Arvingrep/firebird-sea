$(function(){
	var swiper1 = new Swiper('.adv_box .swiper-container', {
		  loop: true,
		  autoplay: {
	        delay: 2000,
	        disableOnInteraction: false,
	      },
	      pagination: {
	        el: '.adv_box .adv_page',
	      },
	});

	var page = 1, isload = 0;
	getlist();

	$(window).scroll(function(){
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w;

		if ($(window).scrollTop() >= scroll && !isload) {
			page++;
			getlist();

		}
	})

	function getlist(){
		if(isload) return false;
		isload = 1;
		$(".proList .loading").remove();
		$(".proList").append('<div class="loading">加载中~</div>');
		$.ajax({
			url: '/include/ajax.php?service=waimai&action=saleRec',
			data: {
				page: page,
				pageSize: 10
			},
			type: 'get',
			dataType: 'json',
			success: function(data){
				if(data.state == 100){
					var html = [];
					var list = data.info.list;
					for(var i=0; i<list.length; i++){
						var d = list[i];
						html += '<dl class="pro_dl '+(d.stock <= 0 ? 'no_left' : '')+'" >'+
								'	<dt>'+
								'		<a class="shop" href="javascript:;">'+d.shopname+'</a>'+
								'		<div class="sale_info">'+
								'			<span class="score">'+d.star+'分</span>'+
								'			<span class="sale">已售 '+d.sale+'</span>'+
								'		</div>'+
								'	</dt>'+
								'	<dd class="pro_info fn-clear">'+
								'		<div class="pro_img"><img src="'+d.pics[0]+'" onerror="this.src=\'/static/images/404.jpg\'" /></div>'+
								'		<div class="pro_detail">'+
								'			<h2>'+d.title+'</h2>'+
								'			<div class="num">'+
								'				<span class="left">'+(d.stock <= 10 ? '仅' : '')+'剩余'+d.stock+'份</span>'+
								'				'+(d.delivery_time ? '<em>'+d.delivery_time+'分钟</em>' : '')+
								'				<s></s>'+
								'				<em>'+(d.delivery_fee ? '配送'+echoCurrency('symbol')+d.delivery_fee : '免配送费')+'</em>'+
								'			</div>'+
								'			<div class="buy_box">'+
								'				<div class="pricebox"><span class="nprice"><em>'+echoCurrency('symbol')+'</em>'+d.price+'</span> '+(d.formerprice > 0 ? '<s class="oprice">'+echoCurrency('symbol')+d.formerprice+'</s>' : '')+'</div>'+
								'				<a href="'+d.url+'" class="btn_buy">马上抢</a>'+
								'			</div>'+
								'		</div>'+
								'	</dd>'+
								'</dl>'
					}
					$(".proList .loading").remove();
					$(".proList").append(html);
					isload = 0;
					if(page>data.info.pageInfo.totalPage){
						isload = 1;
						$(".proList").append('<div class="loading">没有更多了~</div>');
					}
				}else{
					isload = 1;
					$(".proList .loading").remove();
					$(".proList").append('<div class="loading">暂无数据~</div>');
				}
			},
			error: function(data){
				showErrAlert(data.info)
			},

		})
	}



})
