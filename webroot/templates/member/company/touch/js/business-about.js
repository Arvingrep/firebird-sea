$(function(){

	var page = 1,isload = false;
	 getlist()
	function getlist(){
		if(isload) return false;
		isload = true;
		$('.loading').remove();
		$(".menuList").append('<div class="loading">'+langData['siteConfig'][38][2]+'~</div>');   //加载中
		$.ajax({
			url: "/include/ajax.php?service=business&action=about&u=1&page="+page+"&pageSize=10",
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data.state == 100){
					var list = data.info.list;
					var html = [];
					var lurl = window.location.href.indexOf(".html") > -1 ? "?" : "&";
					var param = lurl + "id=";
					var urlString = editUrl + param;
					for(var i = 0; i < list.length; i++){
						var d = list[i];
						var item   = [],
							id     = list[i].id,
							title  = list[i].title,
							click   = list[i].click,
							url     = list[i].url,
							pubdate = huoniao.transTimes(list[i].pubdate, 1);
						html.push('<dl class="menu" data-id="'+d.id+'">');
						html.push('<dt>'+d.title+'</dt>');
						html.push('<dd>');
						html.push('<div class="txt">'+d.body+'</div>');
						html.push('<div class="btnsGroup">');
						html.push('<a class="edit_btn btn" href="'+urlString+id+'">'+langData['siteConfig'][6][6]+'</a> ');
						html.push('<span class="del_btn btn">'+langData['siteConfig'][6][8]+'</span>');
						html.push('</div></dd></dl>');
					}
					$('.loading').remove();
					$(".menuList").append(html.join(''))
					$(".menuList").append('<div class="loading">'+langData['business'][9][42]+'</div>');  //下拉加载更多
					page++;
					isload = false;
					if(page > data.info.pageInfo.totalPage){
						isload = true;
						$(".menuList .loading").html(langData['business'][6][20]) //'没有更多了~'
					}
				}else{
					showErrAlert(data.info);
					$(".menuList .loading").html(data.info)
				}
			},
			error: function(){},
		});
	}

	// 下拉加载
	$(window).scroll(function(){
		var scrollH = $(window).scrollTop() + $(window).height();
		var bodyH = $('body').height()-100;
		if(scrollH >= bodyH && !isload){
			getlist()
		}
	});


	// 删除
	$(".menuList").delegate('.del_btn','click',function(){
		var t = $(this), li = t.closest('dl'), did = li.attr('data-id');
		$('.delMask').addClass('show');
		$(".delAlert").show();

		$(".delMask,.delAlert .cancelDel").click(function(){
			$('.delMask').removeClass('show');
			$(".delAlert").hide();
		});

		$(".delAlert .sureDel").click(function(){
			$.ajax({
				url: "/include/ajax.php?service=business&action=delabout&id="+did,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						li.remove();
						showErrAlert(langData['business'][9][28]);  //删除成功
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
