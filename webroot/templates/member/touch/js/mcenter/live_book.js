$(function(){
	var page = 1,isload = false;
	
	getlivebook();
	
	$(window).scroll(function(){
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w - 50;
		if ($(window).scrollTop() >= scroll && !isload) {
			getlivebook();
		};
	});
	
	$('body').delegate('.noread',"click",function(){
		showErrAlert('此直播不支持观看回放')
	})
	
	function getlivebook(){
		if(isload) return false;
		isload = true;
		$(".yuyue_box").append('<p class="loading">加载中~</p>')
		$.ajax({
			url: '/include/ajax.php?service=live&action=getBooking&page='+page,
			type: "POST",
			dataType: "json",
			success: function (data) {
				$(".loading").remove()
				if(data.state==100){
					var html0 = [],html1=[],html2=[];
					var list = data.info.list;
					for(var i=0; i<list.length; i++){
						if(list[i].state=='0'){
							html0.push('<li class="list_li">');
							html0.push('<a href="'+live_url+'/detail-'+list[i].id+'" class="fn-clear">');
							html0.push('	<div class="litpic"><img src="'+list[i].litpic+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
							html0.push('	<div class="rinfo">');
							html0.push('		<h1>'+list[i].title+'</h1>');
							html0.push('		<div class="live_detail">');
							html0.push('			<p class="state">即将开播</p>');
							html0.push('			<h4>'+huoniao.transTimes(list[i].ftime,1)+'</h4>');
							html0.push('		</div>');
							html0.push('	</div>');
							html0.push('</a>');
							html0.push('</li>');
						}else if(list[i].state=='1'){
							html1.push('<a class="live_now" data-id="'+list[i].id+'" href="'+live_url+'/detail-'+list[i].id+'">');
							html1.push('<div class="litpic"><img src="'+list[i].litpic+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
							html1.push('<div class="live_tit">'+list[i].title+'</div>');
							html1.push('</a>');
						}else if(list[i].state=='2'){
							var url = live_url+'/detail-'+list[i].id;
							
							html2.push('<li class="list_li">');
							html2.push('<a href="'+(list[i].replaystate=='0'?"javascript:;":url)+'" class="fn-clear '+(list[i].replaystate=='0'?"noread":"")+'">');
							html2.push('	<div class="litpic"><img src="'+list[i].litpic+'" onerror="this.src=\'/static/images/404.jpg\'"></div>');
							html2.push('	<div class="rinfo">');
							html2.push('		<h1>'+list[i].title+'</h1>');
							html2.push('		<div class="live_detail">');
							if(list[i].replaystate=='0'){
								html2.push('			<p class="state">直播结束</p>');
							}else{
								html2.push('			<p class="state">观看回放</p>');
							}
							
							html2.push('			<h4>'+huoniao.transTimes(list[i].ftime,1)+'</h4>');
							html2.push('		</div>');
							html2.push('	</div>');
							html2.push('</a>');
							html2.push('</li>');
						}
					}
					if(html1.length>0){
						$(".liveing").removeClass('fn-hide')
					}
					
					if(html0.length>0){
						$(".live_for").removeClass('fn-hide')
					}
					if(html2.length>0){
						$(".live_end").removeClass('fn-hide')
					}
					$(".liveing").append(html1.join(''));
					$(".live_for ul").html(html0.join(''));
					$(".live_end ul").html(html2.join(''));
					$(".live_list").each(function(){
						var t = $(this);
						t.find('h3 em').text(t.find('li').length)
					})
					page++;
					isload = false;
					if(page > data.info.pageInfo.totalPage){
						isload = true;
						$(".yuyue_box").append('<p class="loading">没有更多了~</p>')
					}
				}else{
					$(".yuyue_box").append('<p class="loading">暂无数据</p>')
				}
			},
			error: function(data) {},
		});
	}
	
});