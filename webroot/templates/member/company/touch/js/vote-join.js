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

					//拼接列表
					if(list.length > 0){

						for(var i = 0; i < list.length; i++){
							var item      = [],
								id          = list[i].id,
								title       = list[i].title,
								description = list[i].description,
								url         = list[i].url,
								vstate      = list[i].state,
								arcrank     = list[i].arcrank,
								join        = list[i].join,
								// waitpay  = list[i].waitpay,
								pubdatef    = list[i].pubdatef;

							// url = waitpay == "1" || list[i].state != "1" ? 'javascript:;' : url;

              html.push('<div class="item" data-id="'+id+'">');

              var stateTxt = '', styleState = vstate;
              if(vstate == 1){
                stateTxt = langData['siteConfig'][45][79];//投票进行中
              }else if(vstate == 2){
                stateTxt = langData['siteConfig'][19][507];//已结束
              }

							html.push('<div class="info-item fn-clear">');
							html.push('<a href="'+url+'">');
							html.push('<dl>');
							html.push('<dt class="fn-clear">'+title+'<em class="fn-right state state'+styleState+'">'+stateTxt+'</em></dt>');
							html.push('<dd class="item-area"><em>'+langData['siteConfig'][45][25].replace('1',join)+'</em></dd>');//1人投票
							html.push('<dd class="item-type-1"><em> '+langData['siteConfig'][11][8]+'：'+pubdatef+'</em></dd>');//发布时间
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
