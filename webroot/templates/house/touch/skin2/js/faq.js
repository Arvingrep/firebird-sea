$(function() {

	var typeid = 0;
	var page = 1, pageSize = 10, isload = false;
	var container = $(".container"), load = $(".loading");

	// 点击一级分类
	$(".topnav li").click(function(){
		var t = $(this), index = t.index();
		typeid = t.attr("data-id");
		t.addClass("active").siblings().removeClass("active");
		$(".subnav ul").eq(index).addClass("curr").show().siblings().removeClass("curr").hide();

		getList(1);
	})

	// 点击二级分类
	$(".subnav li").click(function(){
		var t = $(this), index = t.index();
		t.addClass("active").siblings().removeClass("active");
		getList(1);
	})

	// 滚动加载
	$(window).scroll(function(){
		if(isload) return;
		var h = $('.header').height() + $('.typenave').height();
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

		if(tr){
			container.html('');
			page = 1;
			isload = false;
		}

		var subli = $(".subnav ul.curr li.active");
		if(subli.length){
			typeid = subli.attr("data-id");
		}else{
			typeid = $(".topnav li.active").attr("data-id");
		}

		load.text('正在加载，请稍后').show();

		$.ajax({
			url: masterDomain + '/include/ajax.php?service=house&action=faq&page='+page+'&pageSize='+pageSize+'&typeid=' + typeid,
			type: 'get',
			dataType: 'jsonp',
			success: function(data){
				if(data && data.state == 100){
					var list = data.info.list, len = list.length, html = [];
					if(len){
						for(var i = 0; i < len; i++){
							var d = list[i];
							html.push('<div class="item">');
							html.push('  <a href="'+d.url+'" class="fn-clear">');
							html.push('    <div class="type">问</div>');
							html.push('    <div class="info">');
							html.push('      <h3 class="title"><span class="time">'+huoniao.transTimes(d.pubdate, 2).substr(2).replace(/-/g,'/')+'</span>'+d.title+'</h3>');
							html.push('      <p class="about"><span class="tpname">'+d.typename+'</span><span class="user"></span><font class="click">'+d.click+'</font></p>');
							html.push('    </div>');
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
