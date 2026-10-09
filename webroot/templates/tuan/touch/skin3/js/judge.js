$(function(){
	var isload = false;
	var filter = "";

	$('.comment-tab a').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
		filter = $(this).data("val");
		getComments(1);
	})

	$('.tab-pic').click(function(){
		$('.user-comment').each(function(){
			var dom = $(this).is(':has(ul)');
			if (!dom) {
				$(this).parent('.judge-user').hide();
			}
		})
	})

	// 下拉加载
	
	$(document).ready(function() {
		$(window).scroll(function() {
			var h = $('.judge-user:last').height();
			var allh = $('body').height();
			var w = $(window).height();
			var scroll = allh - h - w;
			if ($(window).scrollTop() > scroll && !isload) {
				atPage++;
				isload = true;
				getComments();
			};
		});
	});

	//初始加载
	getComments();



	var imgLoad = function (url, obj) {
		var img = new Image();
		img.src = url;
		if (img.complete) {
			$("#"+obj).attr("data-size", img.width+"x"+img.height);
		} else {
			img.onload = function () {
				$("#"+obj).attr("data-size", img.width+"x"+img.height);
				img.onload = null;
			};
		};
	};

	//评论列表
	var imgArr = [];
	function getComments(tr){

		//如果进行了筛选或排序，需要从第一页开始加载
		if(tr){
			atPage = 1;
			$("#common").html("");
		}

		$("#common .loading").remove();
		$("#common").append('<div class="loading">加载中...</div>');

		var data = [];
		data.push('aid='+detailID);
		data.push('filter='+filter);
		data.push('page='+atPage);
		data.push('pageSize=10');

		$.ajax({
			url: "/include/ajax.php?service=member&action=getComment&type=tuan-order",
			data: data.join("&"),
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data && data.state == 100){

					var list = data.info.list,
							pageinfo = data.info.pageInfo,
							html = [];

					if(list.length > 0){
						$("#common .loading").remove();
						totalCount = pageinfo.totalCount;
						for(var i = 0; i < list.length; i++){

							var photo = list[i].user.photo == "" ? staticPath+'images/noPhoto_40.jpg' : list[i].user.photo;

							html.push('<div class="judge-user">');
							html.push('	<div class="user-tit">');
							html.push('		<dl class="fn-clear">');
							html.push('			<dt><img src="'+photo+'"></dt>');
							html.push('			<dd class="user-name">'+list[i].user.nickname+'</dd>');
							html.push('			<dd>');
							html.push('				<div class="shop-star">');
							html.push('					<i class="icon-star"><s style="width: '+(list[i].rating * 20)+'%;"></s></i>');
							html.push('					<span>'+huoniao.transTimes(list[i].dtime, 2)+'</span>');
							html.push('				</div>');
							html.push('			</dd>');
							html.push('		</dl>');
							html.push('	</div>');
							html.push('	<div class="user-comment">');
							html.push('		<p>'+list[i].content+'</p>');

							//图集
							var pics = list[i].pics;
							if(pics.length > 0){
								html.push('		<div class="my-gallery">');
								for(var p = 0; p < pics.length; p++){

									imgArr.push([pics[p], "pic"+i+"_"+p]);
									// imgLoad(pics[p], "pic"+i+"_"+p);

									html.push('			<figure itemprop="associatedMedia">');
									html.push('				<a href="'+pics[p]+'" id="pic'+i+'_'+p+'" data-size="100%x100%">');
									html.push('					<img src="'+pics[p]+'" />');
									html.push('				</a>');
									html.push('			</figure>');
								}
								html.push('		</div>');
							}

							html.push('	</div>');
							html.push('</div>');

						}

						$("#common").append(html.join(""));
						initPhotoSwipeFromDOM('.my-gallery');
						isload = false;

						for(var i = 0; i < imgArr.length; i++){
							imgLoad(imgArr[i][0], imgArr[i][1]);
						}

						//最后一页
						if(atPage >= pageinfo.totalPage){
							isload = true;
							$("#common").append('<div class="loading">已经到最后一页了</div>');
						}

					}else{

						isload = true;
						$("#common").append('<div class="loading">暂无相关信息</div>');

					}

				}else{
					$("#common .loading").html('暂无评价信息');
				}
			},
			error: function(){
				$("#common .loading").html('网络错误，加载失败！');
			}
		});
	}


})
