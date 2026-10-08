var objId = $("#list"), keywords = "", orderby = 0;
$(function(){

	// 查看更多评论
	$(".cmt_list").delegate(".cmt_con em","click",function(e){
		var t = $(this), p = t.closest('.cmt_con');
		p.find(".all_con").show();

		$(document).one("click",function(){
			p.find(".all_con").hide();
		});
		e.stopPropagation();

	});
	$(".live_order").click(function(e){
		var t = $(this);
		t.toggleClass("reverse");
		if(t.hasClass("reverse")){
			$("#orderby").attr('data-val',1);
		}else{
			$("#orderby").attr('data-val',0);
		}
		atpage = 1;
		orderby = $("#orderby").attr('data-val');
		getList('',orderby)
	});


	// 点击搜索按钮
	$(".search_btn").click(function(){
		atpage = 1;
		keywords = $.trim($("#search").val());
		getList(1);
	})

	 getList(1);

	//删除
	var tj = false;
	objId.delegate(".del", "click", function(e){
		var t = $(this), par = t.closest("li"), id = par.attr("data-id");
		if(id && !tj){
			tj = true;
			par.find('.pop_box.notip').show();
			$(".pop_box.notip .sure_btn").click(function(){
				$.ajax({
					url: "/include/ajax.php?service=live&action=delChatRoomComment&aid="+chatid+"&cid="+id,
					type: "GET",
					dataType: "json",
					success: function (data) {
						tj = false;
						if(data && data.state == 100){
							getList(1);
						}else{
							$.dialog.alert(data.info);
						}
					},
					error: function(){
						tj = false;
						$.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
					}
				});
			});
			$(".pop_box.notip .cancel_btn").click(function(ev){
				par.find('.pop_box.notip').hide();
				ev.stopPropagation();
			});
			$(document).one("click",function(){
				par.find('.pop_box.notip').hide();
			});

			e.stopPropagation();
		}
	});

});

function getList(is){
	if(is != 1){
		$('html, body').animate({scrollTop: $(".live_head").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".pagination").hide();

	orderby = orderby == undefined ? 0 : orderby;

	$.ajax({
		url: "/include/ajax.php?service=live&action=chatRoomComment&aid="+chatid+"&page="+atpage+"&pageSize="+pageSize+"&keywords="+keywords+"&orderby="+orderby,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state != 100){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  // //暂无相关信息！
				}else{

					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					$('.live_head h3 em').html(pageInfo.totalCount);

					//拼接列表
					if(list.length > 0){

						for(var i = 0; i < list.length; i++){
							var item     = [],
								type     = list[i].type,
								info     = list[i].info,
								id       = info.id,
								uid      = info.uid,
								time     = info.time,
								content  = type == 'image' ? '/include/attachment.php?f=' + info.content.url : info.content,
								userinfo = info.userinfo;

              				var url = masterDomain + '/user/'+uid;
							html.push('<li class="item fn-clear" data-id="'+id+'"><div class="cmtbox fn-clear">');
							html.push('<div class="user_info fn-clear"><a href="'+url+'" target="_blank" class="user_img"><i></i><img src="'+(userinfo.photo?userinfo.photo:"/static/images/noPhoto_60.png")+'" /></a>');
							html.push('<div class="user_detail"><h4 title="'+userinfo.nickname+'">'+userinfo.nickname+'</h4>');
							html.push('<p>ID：'+uid+'</p><p>'+(userinfo.sex == '0' ? '女' : '男')+'</p></div></div>');

							if(type == 'text'){
								html.push('<div class="cmt_con"><p>'+content.substr(0,50)+(content.length>50 ? '...' : '')+'</p>');
								if(content.length>50){
									html.push('<em>'+langData['live'][1][43]+'</em><div class="all_con"><h4>'+userinfo.nickname+'</h4><p>'+content+'</p></div>'); /* 更多*/
								}
							}else{
								html.push('<div class="cmt_con con_images"><a href="'+content+'" target="_blank"><img src="'+content+'" onerror="this.src=\'/static/images/404.jpg\'" /></a>');
							}

							html.push('</div>');

							html.push('<div class="cmt_time">'+huoniao.transTimes(time, 1)+'</div>');

							/* 移除 此操作不可撤回，确定删除该条评论？ 取消 确认 */
							html.push('<div class="cmt_op"><button type="button" class="del" data-id="'+id+'"><i></i>'+langData['live'][3][4]+'<div class="pop_box notip"><i class="arr"></i><h5>'+langData['live'][3][12]+'</h5><div class="btns_group"><a href="javascript:;" class="cancel_btn">'+langData['live'][0][9]+'</a><a href="javascript:;" class="sure_btn">'+langData['live'][1][39]+'</a></div></div></button></div>');
							html.push('</div></li>');
						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
					}

					totalCount = pageInfo.totalCount;
					$("#total").html(pageInfo.totalCount);

					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
			}
		}
	});
}
