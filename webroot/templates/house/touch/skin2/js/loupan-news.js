$(function() {

	var page = 1, pageSize = 10, isload = false;
	var container = $(".dynamic_main"), load = $(".loading");

	// 滚动加载
	$(window).scroll(function(){
		if(isload) return;
		var h = $('.header').height();
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - h - w;
		if ($(window).scrollTop() > scroll && !isload) {
			page++;
			getList();
		}
	})

	function getList(tr){

		isload = true;
		load.text('正在加载，请稍后').show();

		$.ajax({
			url: masterDomain + '/include/ajax.php?service=house&action=loupanNewsList&page='+page+'&pageSize='+pageSize+'&loupanid=' + JubaoConfig.id,
			type: 'get',
			dataType: 'jsonp',
			success: function(data){
				if(data && data.state == 100){
					var list = data.info.list, len = list.length, html = [];
					if(len){
						for(var i = 0; i < len; i++){
							var d = list[i];
							html.push('<div class="dynamic_list">');
							html.push('  <a href="'+d.url+'">');
							html.push('    <p class="dy_list_title">'+d.title+'</p>');
							html.push('    <p class="dy_list_txt">'+d.note+'</p>');
							html.push('    <p class="dy_list_type fn-clear"><span class="type_icon">楼盘资讯</span><span>'+huoniao.transTimes(d.pubdate, 2)+'</span></p>');
							html.push('  </a>');
							html.push('</div>');
						}

						load.hide();
						container.append(html.join(""));
						isload = false;

					}else{
						if(page == 1){
							$(".loading").text("暂无相关信息");
						}else{
							$(".loading").text("已加载全部信息");
						}
					}
				}else{
					if(page == 1){
						$(".loading").text("暂无相关信息");
					}else{
						$(".loading").text("已加载全部信息");
					}
				}

			},
			error: function(){
				isload = false;
				$(".loading").text("网络错误，请刷新重试！");
			}
		})
	}

	getList();

})
