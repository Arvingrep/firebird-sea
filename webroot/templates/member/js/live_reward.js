var objId = $("#list");
$(function(){
	 getList(1);

	 // 筛选
	 $(".live_orderby ").click(function(e){
	 	$(".orderby_ul").slideUp();
	 	if($(this).find('.orderby_ul').is(':hidden')){
	 		$(this).find(".orderby_ul").slideDown();
	 		$(document).one("click",function(){
	 			$(".orderby_ul").slideUp();
	 		})
	 	}else{
	 		$(".orderby_ul").slideUp();
	 	}
	 	e.stopPropagation();
	 });

	 $(".orderby_ul li").click(function(){
	 	var t = $(this);
	 	var ul = t.closest('ul');
	 	var txt = t.text();
	 	var val = t.attr('data-value');
	 	input = ul.siblings("input");
	 	input.val(txt).attr('data-val',val);

	 	var orderby = $("#orderby").attr('data-val');
	 	getList('',orderby)
	 	ul.slideUp();
	 });

	 // 点击搜索按钮
	 $(".search_btn").click(function(){
	 	keywords = $.trim($("#search").val());
	 	getList(1);
	 })

});


function getList(is,orderby){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".live_head").offset().top}, 300);
	}

	orderby = orderby == undefined ? '' : orderby;

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".pagination").hide();
	$.ajax({
		url: "/include/ajax.php?service=live&action=chatRoomRewardList&chatid="+chatid+"&page="+atpage+"&pageSize="+pageSize+"&keywords="+keywords+"&orderby="+(orderby?orderby:''),
		type: "GET",
		dataType: "json",
		success: function (data) {
			if(data && data.state != 200){

				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  // //暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

						for(var i = 0; i < list.length; i++){
							var item    = [],
								id      = list[i].id,
								userid   = list[i].reward_userid,
								amount   = list[i].amount,
								price    = list[i].price,
								userinfo = list[i].userinfo,
								fee      = list[i].fee,
								date     = huoniao.transTimes(list[i].date, 1);

							html.push('<li class="fn-clear" data-id="'+id+'">');
							html.push('<div class="incomebox fn-clear">');
							html.push('<div class="ic_user fn-clear">');
							html.push('<div class="user_img"><img src="'+userinfo.photo+'"></div>');
							html.push('<div class="user_detail">');
							html.push('<h4><a href="/user/'+userid+'" target="_blank">'+userinfo.nickname+'</a></h4>');
							html.push('<p>ID：'+userid+'</p>');
							html.push('<p>'+(userinfo.sex == '0' ? '女' : '男')+'</p></div></div>');
							html.push('<div class="ic_time"><p>'+date+'</p></div>');
							html.push('<div class="ic_money">'+echoCurrency('symbol')+'<em>'+price+'</em></div>');
							html.push('<div class="ic_money" style="font-weight: 500;">'+fee+'</div>');
							html.push('<div class="ic_money" style="font-weight: 500;">'+echoCurrency('symbol')+amount+'</div></div></li>');
						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
					}

					totalCount = pageInfo.totalCount;
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
			}
		}
	});
}
