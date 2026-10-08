var objId = $("#list"), keywords = "";
$(function(){

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
getList(1)
function getList(is,orderby){
	if(is != 1){
		$('html, body').animate({scrollTop: $(".live_head").offset().top}, 300);
	}

	orderby = orderby == undefined ? '' : orderby;

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".pagination").hide();
	$.ajax({
		url: "/include/ajax.php?service=live&action=chatRoomGiftList&chatid="+chatid+"&page="+atpage+"&pageSize="+pageSize+"&keywords="+keywords+"&orderby="+orderby,
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
							var item        = [],
								id          = list[i].id,
								userid      = list[i].reward_userid,
								amount      = list[i].amount,
								date        = huoniao.transTimes(list[i].date, 1),
								num         = list[i].num,
								username    = list[i].userinfo.nickname,
								gift_name   = list[i].gift_name,
								gift_litpic = list[i].gift_litpic,
								price       = list[i].price,
								fee         = list[i].fee;

							html.push('<li class="fn-clear" data-id="'+id+'"><div class="gtbox fn-clear"><div class="gt_info fn-clear">');
							html.push('<div class="gt_img" style="background: none;"><img src="'+gift_litpic+'" /></div>');
							html.push('<div class="gt_detail">');
							html.push('<h4>'+gift_name+'</h4><p>'+echoCurrency('symbol')+amount+'</p></div></div>');
							html.push('<div class="gt_num"><p>'+num+'</p></div>');
							html.push('<div class="gt_to"><h4><a href="/user/'+userid+'" target="_blank">'+username+'</a></h4><p>ID：'+userid+'</p></div>');
							html.push('<div class="gt_time"><p>'+date+'</p></div>');
							html.push('<div class="gt_percent"><p>'+fee+'</p></div>');
							html.push('<div class="gt_get">'+echoCurrency('symbol')+'<em>'+price+'</em></div></div></li>');
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
