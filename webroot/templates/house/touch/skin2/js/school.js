$(function() {

	$('.f_nav li').click(function(){		
		if(!$(this).hasClass('active')){
			$(this).addClass('active').siblings('li').removeClass('active');
			var  i = $(this).index();
			$('.topCon .comCon').eq(i).addClass('show').siblings('.comCon').removeClass('show');
			getList(1);
			if(i == 0){
				$('#keywords').attr('placeholder','输入小区名称查询');
				$('.d_search').attr('href',cUrl);
				$('.hotit').text('热门小区');
			}else{
				$('#keywords').attr('placeholder','输入学校名称查询');
				$('.d_search').attr('href',sUrl);
				$('.hotit').text('热门学校');
			}
		}
		
	})
	var atpage = 1,isload = false;
	// 下拉加载	
	$(window).scroll(function() {
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w - 50;
		if ($(window).scrollTop() > scroll && !isload) {
			atpage++;
			getList();
		};
	});
	

	getList(1)
	//数据列表
	function getList(tr){

		isload = true;

		//如果进行了筛选或排序，需要从第一页开始加载
		if(tr){
			atpage = 1;
			$(".list ul").html("");
		}

		$(".list .loading").remove();
		$(".list").append('<div class="loading">加载中...</div>');
		var act = $('.f_nav li.active').attr('data-type');
		var url;
		if(act == 1){//查小区
			url="/include/ajax.php?service=house&action=getCommunity&hot=1&pageSize=6&page="+atpage;
		}else{//查学校
			url="/include/ajax.php?service=house&action=getSchool&order=1&pageSize=6&page="+atpage;
		}


		$.ajax({
			url: url,
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data){
					if(data.state == 100){
						$(".list .loading").remove();
						var list = data.info.list, html = [];
						if(list.length > 0){
							for(var i = 0; i < list.length; i++){
								var pic = list[i].logo != "" && list[i].logo != undefined ? list[i].logo : "/static/images/404.jpg";
								var typearr = list[i].typearr;
								// 查小区
								if(act == '1'){
									html.push('<li class="comuLi"><a href="'+scUrl+'?sid='+list[i].id+'&sname='+list[i].title+'" class="fn-clear">');
									html.push('<div class="left_b fn-left">');
									html.push('<h2 class="tit">'+list[i].title+'</h2>');
									html.push('<p class="addr"><i></i>'+list[i].addrName+'</p>');
									html.push('</div>');									
									html.push('<div class="right_b fn-right"><strong>'+list[i].schoolcount+'</strong>所学校</div>');
									html.push('</a></li>');
									
								}else{//查学校
									html.push('<li class="scLi"><a href="'+dUrl+'?id='+list[i].id+'">');
									html.push('<div class="left_img"><img src="'+pic+'" alt="" onerror="javascript:this.src=\''+staticPath+'images/404.jpg\';"></div>');
									html.push('<div class="rightSc">');
									html.push('<h3>'+list[i].title+'</h3> ');
									html.push('<p class="addr"><i></i>'+list[i].addrName+'</p> ');
									html.push('<p class="tag">');
									html.push('<span class="nature">'+list[i].schoolnaturename+'</span>');//民办或者公办必有
									for(var a = 0; a < typearr.length; a++){
										var cla = '3';
                                      if(typearr[a].typename == '幼儿园'){
                                        cla ='1'
                                      }else if(typearr[a].typename == '小学'){
                                        cla ='2'
                                      }
										html.push('<span class="slevel-'+cla+'">'+typearr[a].typename+'</span>');//幼儿园等 可多个
									}
									html.push('</p>');
									html.push('<p class="fire"><i></i>'+list[i].click+'</p>');//热度
									html.push('</div>');
									html.push('</a></li>');
								}

							}

							$(".list ul").append(html.join(""));
							isload = false;

							//最后一页
							if(atpage >= data.info.pageInfo.totalPage){
								isload = true;
								$(".list ul").append('<div class="loading">已经到最后一页了</div>');
							}

						//没有数据
						}else{
							isload = true;
							$(".list ul").append('<div class="loading">暂无相关信息</div>');
						}

					//请求失败
					}else{
						$(".list .loading").html(data.info);
					}

				//加载失败
				}else{
					$(".list .loading").html('加载失败');
				}
			},
			error: function(){
				isload = false;
				$(".list .loading").html('网络错误，加载失败！');
			}
		});
	}




})
