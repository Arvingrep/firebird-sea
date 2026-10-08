/**
 * 会员中心我参与的活动
 * by guozi at: 20161229
 */

var objId = $("#list");
$(function(){

	$(".tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr")){
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			objId.html('');
			getList();
		}
	});


	// 下拉加载
	$(window).scroll(function() {
		var h = $('.item').height();
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w - h;
		if ($(window).scrollTop() > scroll && !isload) {
			atpage++;
			getList();
		};
	});

	getList(1);

});


function getList(is){

	 isload = true;


	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
	var state = $(".tab .curr").data("state");

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=vote&action=joinList&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
          $('.count span').text(0);
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					console.log(data)
					//拼接列表
					if(list.length > 0){

						for(var i = 0; i < list.length; i++){
							var item      = [],
								id          = list[i].id,
								title       = list[i].title,
								description = list[i].description,
								url         = list[i].url,
								litpic   = huoniao.changeFileSize(list[i].litpic, "middle"),
								vstate      = list[i].state,
								arcrank     = list[i].arcrank,
								join        = list[i].join,
								click    = list[i].click,
								waitpay  = list[i].waitpay,
								total    = list[i].total,
								pubdatef    = list[i].pubdatef;

							// url = waitpay == "1" || list[i].state != "1" ? 'javascript:;' : url;

				            html.push('<div class="item" data-id="'+id+'">');

				            var stateTxt = '', styleState = vstate;
				            if(vstate == 1){
				                stateTxt = langData['siteConfig'][6][58];//正在进行
				            }else if(vstate == 2){
				                stateTxt = langData['siteConfig'][19][507];//已结束
				            }

				            html.push('<div class="title">');
			                html.push('<span style="color:#919191;font-size: .24rem;">'+langData['siteConfig'][11][8]+'：'+pubdatef+'</span>');
			                html.push('<span style="color:#f9412e; font-size: .26rem; float: right;"'+styleState+'>'+stateTxt+'</span>');
			                html.push('</div>');

							html.push('<div class="info-item fn-clear">');
							html.push('<a href="'+url+'">');
							if(litpic != "" && litpic != undefined){
								html.push('<div class="info-img fn-left"><img src="'+litpic+'" /></div>');
							}
							html.push('<dl>');
							html.push('<dt class="fn-clear">'+title+'</dt>');
							html.push('<dd class="item-area"><span class="sp_tp"><em></em> '+langData['siteConfig'][45][23]+':'+total+'</span><span class="sp_see"><em></em>'+langData['siteConfig'][45][24]+':'+click+'</span></dd>');//累计票数 -- 浏览量
							html.push('<dd class="item-type-1"><span class="sp_bm"><em></em>'+langData['siteConfig'][45][25].replace('1',join)+'</span></dd>');//1人投票
							html.push('</dl>');
							html.push('</a>');
							html.push('</div>');
							html.push('</div>');
							html.push('</div>');
							html.push('</div>');

						}

						objId.append(html.join(""));
            $('.loading').remove();
            isload = false;

					}else{
						$('.loading').remove();
            objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
					}

					var totalCount = pageInfo.totalCount;
					switch (state) {
						case 1:
							totalCount = pageInfo.audit;
							break;
						case 2:
							totalCount = pageInfo.expire;
							break;
					}
					$("#total").html(totalCount);
					// showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
        $('.count span').text(0);
			}
		}
	});
}
