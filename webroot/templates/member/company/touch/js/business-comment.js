$(function(){
	
	var page = 1,isload = false;
	 getlist()
	function getlist(){
		if(isload) return false;
		isload = true;
		$('.loading').remove();
		$(".menuList").append('<div class="loading">'+langData['siteConfig'][38][2]+'~</div>');  //加载中
		$.ajax({
			url: "/include/ajax.php?service=member&action=getComment&type=business&son=1&aid="+businessID+"&page="+page+"&pageSize=10",
			type: "GET",
			dataType: "json",
			success: function (data) {
				if(data.state == 100){
					var list = data.info.list;
					var html = [];
					
					for(var i = 0; i < list.length; i++){
						var d = list[i];
						var cls = (d.lower && d.lower.count>0) ? "disabled" : "";
						html.push('<li class="comm_li" data-id="'+d.id+'">');
						html.push('<div class="custombox">');
						html.push('<div class="head_icon"><img src="'+d.user.photo+'" onerror="this.src = \'/static/images/noPhoto_100.jpg\'"></div>');
						html.push('<div class="detail">');
						html.push('<h3>'+d.user.nickname+'</h3>');
						html.push('<p>'+d.ftime+'</p></div></div>');
						html.push('<div class="comm_con">'+d.content+'</div>');
						if(d.lower && d.lower.count>0){
							var ld = d.lower.list;
							html.push('<dl class="reply_con">');
							html.push('<dt>'+langData['business'][9][74]+':</dt>');   //我的回复
							for(var m = 0; m < ld.length ; m++){
								html.push('<dd data-id='+ld[m].id+'>'+ld[m].content+'</dd>');
							}
							html.push('</dl>');
						}
						html.push('<div class="btnsGroup">');
						var rtxt = cls==''?langData['siteConfig'][6][29]:langData['business'][9][76]
						html.push('<a class="reply_btn btn '+cls+'" href="javascript:;" >'+rtxt+'</a>');  //回复
						html.push('<span class="del_btn btn">'+langData['siteConfig'][6][8]+'</span>');
						html.push('</div></li>');
					}
					$('.loading').remove();
					$(".commentList ul").append(html.join(''))
					$(".commentList").append('<div class="loading">'+langData['business'][9][42]+'</div>');  //下拉加载更多
					page++;
					isload = false;
					if(page > data.info.pageInfo.totalPage){
						isload = true;
						$(".commentList .loading").html(langData['business'][6][20]+'~')  //下拉加载更多
					}
				}else{
					$(".commentList").append('<div class="loading">'+data.info+'</div>');
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
	$(".commentList").delegate('.del_btn','click',function(){
		var t = $(this), li = t.closest('li'), did = li.attr('data-id');
		$('.delMask').addClass('show');
		$(".delAlert").show();
		
		$(".delMask,.delAlert .cancelDel").off('click').click(function(){
			$('.delMask').removeClass('show');
			$(".delAlert").hide();
		});
		
		$(".delAlert .sureDel").off('click').click(function(){
			$.ajax({
				url: "/include/ajax.php?service=member&action=delComment&id="+did,
				type: "GET",
				dataType: "json",
				success: function (data) {
					if(data && data.state == 100){
						li.remove();
						showErrAlert(langData['business'][9][28]);  //'删除成功'
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
	});
	
	
	// 回复评论
	$(".commentList").delegate('.reply_btn','click',function(){
		var cid = $(this).closest('li').attr('data-id');
		var cuser = $(this).closest('li').find('.detail h3').text()
		$(".pop_mask").show();
		$(".pop").css({
			'transform':'translateY(0)',
			'opacity':'1'
		}).attr('data-id',cid);
		$(".pop textarea").attr('placeholder',langData['siteConfig'][6][29]+cuser)
		
	});
	$(".pop cancel_btn,.pop_mask").click(function(){
		$(".pop_mask").hide();
		$(".pop").css({'transform':'translateY(6rem)'}).removeAttr('data-id');
		setTimeout(function(){
			$(".pop").css({'opacity':'0'});
		},500)
	});
	
	$(".pop .sure_btn").click(function(){
		var id = $(".pop").attr('data-id');
		var newReply = $(".pop textarea").val();
		var li = $("li.comm_li[data-id='"+id+"']");
		btn = li.find(".btnsGroup");
		btn.find('.reply_btn').addClass('disabled')
		if(newReply){
			reply(id,newReply);
			$(".pop_mask").click();
		}else{
			showErrAlert(langData['business'][9][75]);   //'请输入回复内容'
		}
	});
	
	function reply(id,newReply){
		var li = $("li.comm_li[data-id='"+id+"']");
		btn = li.find(".btnsGroup");
		$.ajax({
			url: "/include/ajax.php?service=member&action=replyComment&type=business&sco1=1&id="+id+"&content="+newReply,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					
					btn.before('<dl class="reply_con"><dt>'+langData['business'][9][74]+':</dt><dd>'+newReply+'</dd></dl>');  //我的回复
					showErrAlert(langData['siteConfig'][21][147])    //'回复成功'
				}else{
					btn.removeClass('disabled').text(langData['business'][9][76])
					showErrAlert(data.info)
				}
			},
			error: function(){
				showErrAlert(langData['siteConfig'][20][183]);
			}
		});
	}
})