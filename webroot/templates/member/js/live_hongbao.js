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

		var state = $("#state").attr('data-val');
		var orderby = $("#orderby").attr('data-val');
		ul.slideUp();

		atpage = 1;
		getList();
	})

	//抢红包
	$('#list').delegate('.get_button', 'click', function(){
		var t = $(this), hid = t.closest('li').attr('data-id');
		if(t.hasClass('disabled')) return false;

		t.addClass('disabled').html(langData['siteConfig'][46][105]);  //领取中...
		$.ajax({
			url: '/include/ajax.php?service=live&action=getHongbao',
			data: {h_id: hid},
			type: "GET",
			dataType: "json",
			success: function(data) {
				if (data.state == 100) {
					if (data.info.states == 200) {
						alert(langData['siteConfig'][46][108] + '' + data.info.get_amount);  //恭喜抢到：

					} else if (data.info.states == 201) {
						alert(langData['siteConfig'][46][106]);  //已抢完

					} else {
						if (data.info.is_fin == 1 && data.info.states == 203) {
							alert(langData['siteConfig'][46][106]);  //已抢完

						} else if (data.info.states == 202) {
							alert(langData['siteConfig'][46][107]);  //不能重复领取
						}
					}
				} else {
					alert(data.info);
				}
				getList();
			},
			error: function() {
				console.log(langData['siteConfig'][31][135]);  //网络错误，操作失败！
			}
		});
	});

});


getList(1)
function getList(is,state,orderby){
	if(is != 1){
		$('html, body').animate({scrollTop: $(".live_head").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".pagination").hide();

	var mold = $('.main-sub-tab label.curr').data('id');

	$("#total").html(0);
	$("#audit").html(0);
	$("#gray").html(0);
	$("#refuse").html(0);

	$.ajax({
		url: "/include/ajax.php?service=live&action=chatRoomHongbaoList&chatid="+chatid+"&page="+atpage+"&pageSize="+pageSize+"&from="+$('#orderby').attr('data-val')+"&state="+$('#state').attr('data-val'),
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
								id        = list[i].id,
								userid    = list[i].user_id,
								username  = list[i].userinfo.nickname,
								userphoto = list[i].userinfo.photo,
								note      = list[i].note,
								amount    = list[i].amount,
								amount1   = list[i].amount1,
								count     = list[i].count,
								count1    = list[i].count1,
								date      = huoniao.transTimes(list[i].date, 2),
								state     = list[i].state,
								get       = list[i].get;

							html.push('<li class="fn-clear" data-id="'+id+'"><div class="hbbox fn-clear"><div class="hb_info fn-clear">');
							html.push('<div class="hb_img"><p class="hb_id">H'+id+'</p></div>');
							html.push('<div class="hb_detail"><h4>'+langData['siteConfig'][46][31]+'</h4><p>'+note+'</p></div></div>');  //普通红包
							html.push('<div class="hb_from"><h4><a href="/user/'+userid+'" target="_blank">'+username+'</a></h4><p>ID：'+userid+'</p></div>');
							html.push('<div class="hb_time"><p>'+date+'</p></div>');
							html.push('<div class="hb_count"><p><span>'+echoCurrency('symbol')+'<s>'+amount+'</s></span><em> / '+count+''+langData['siteConfig'][13][50]+'</em></p></div>');  //个
							html.push('<div class="hb_left"><p><span>'+echoCurrency('symbol')+'<s>'+amount1+'</s></span><em> / '+count1+''+langData['siteConfig'][13][50]+'</em></p></div>');  //个
							if(get == 1){
								html.push('<div class="hb_get"><a href="javascript:;">'+langData['siteConfig'][46][16]+'</a></div></div></li>');  //已领取
							}else{
								if(state == '0'){
									html.push('<div class="hb_get"><a href="javascript:;" class="get_button ">'+langData['siteConfig'][46][104]+'</a></div></div></li>');  //领取
								}else{
									html.push('<div class="hb_get"><a href="javascript:;">'+langData['siteConfig'][46][103]+'</a></div></div></li>');  //已领完
								}
							}

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
