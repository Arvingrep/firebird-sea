$(function(){
	// 获取数据
	var page = 1,isload = false;
	getvideos();
	function getvideos(){
		if(isload) return false;
		isload = true;
		$(".videoList .loading").remove();
		$(".videoList").append('<div class="loading">'+langData['siteConfig'][38][2]+'~</div>');   //加载中
		$.ajax({
			url: "/include/ajax.php?service=business&action=video&u=1&page="+page+"&pageSize=15",
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data.state == 100){
					var list = data.info.list;
					var html = [];
					renderHtml(list,html);
					page++;
					isload = false;
					$(".videoList .loading").html(langData['business'][9][42]);  //下拉加载更多
					if(page > data.info.pageInfo.totalPage){
						isload = true;
						$(".videoList .loading").html(langData['business'][6][20]) //没有更多了
					}
				}else{
					isload = false;
					$(".videoList .loading").html(data.info)
				}
			},
			error:function(data) {$(".videoList .loading").html('error')},
		})
	}

	function checkType(value) {
	    return value.typeid == currTypeid;
	}


	function renderHtml(list,html){
		for(var m = 0; m < list.length; m++ ){
			html.push('<li class="video" data-id="'+list[m].id+'">');
			html.push('<a class="video_info" href="'+list[m].url+'">');
			html.push('<div class="vimg"><img src="'+list[m].litpic+'" onerror="this.src=\'/static/images/404.jpg\'" alt=""></div>');
			html.push('<div class="vinfo">');
			html.push('<h3>'+list[m].title+'</h3>');
			html.push('<p class="vclick_num">'+list[m].click+'</p>');
			html.push('<p class="pubtime">'+huoniao.transTimes(list[m].pubdate,1)+'</p>');
			html.push('</div>');
			html.push('</a>');
			html.push('<div class="btnsGroup">');
			html.push('<a class="edit_btn btn" href="'+urlPath+'/fabu-business-video.html?id='+list[m].id+'">'+langData['siteConfig'][6][6]+'</a> ');  //编辑
			html.push('<span class="del_btn btn">'+langData['siteConfig'][6][8]+'</span>');  //删除
			html.push('</div>');
			html.push('</li>');
		}
		$(".videoList ul").append(html.join(''))
	}

	// 下拉加载
	$(window).scroll(function(){
		var scrollH = $(window).scrollTop() + $(window).height();
		var bodyH = $('body').height()-100;
		if(scrollH >= bodyH && !isload){
			getvideos()
		}
	});


	// 删除视频
	$(".videoList").delegate('.del_btn.btn','click',function(){
		var t = $(this), li = t.closest('li'), did = li.attr('data-id');
		$('.delMask').addClass('show');
		$(".delAlert").show();

		$(".delMask,.delAlert .cancelDel").click(function(){
			$('.delMask').removeClass('show');
			$(".delAlert").hide();
		});

		$(".delAlert .sureDel").click(function(){
			$.ajax({
				url: "/include/ajax.php?service=business&action=delvideo&id="+did,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						li.remove();
						showErrAlert(langData['business'][9][28]);   //删除成功
						$('.delMask').removeClass('show');
						$(".delAlert").hide();
					}else{
						showErrAlert(data.info);
					}
				},
				error: function(){
					showErrAlert(langData['siteConfig'][20][183]);

				}
			});
		})
	})

})
