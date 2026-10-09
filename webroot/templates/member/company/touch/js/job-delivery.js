/**
 * 会员中心招聘投递职位列表
 * by guozi at: 20160527
 */

var objId = $(".list"), isload = false;
$(function(){

  //导航
  $('.header-r .screen').click(function(){
    var nav = $('.nav'), t = $('.nav').css('display') == "none";
    if (t) {nav.show();}else{nav.hide();}
  })

	getList(1);

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


});

function getList(is){

	if(isload) return;
	isload = true;

	if(is == 1){
		objId.html('');
	}

	objId.append('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=job&action=deliveryList&type=person&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item = [],
								id   = list[i].aid,
								post = list[i].post,
								date = list[i].date;

							html.push('<div class="item">');
										html.push('<a href="'+post['url']+'">');
										html.push('<dl>');
										html.push('<dt>'+langData['siteConfig'][19][408]+'</dt>');
										html.push('<dd>'+post['title']+'</dd>');
										html.push('</dl>');
							html.push('<dl>');
										html.push('<dt>'+langData['siteConfig'][19][354]+'</dt>');
										html.push('<dd>'+post['company']+'</dd>');
										html.push('</dl>');
							html.push('<dl>');
										html.push('<dt>'+langData['siteConfig'][19][409]+'</dt>');
										html.push('<dd>'+date+'</dd>');
										html.push('</dl>');
							html.push('</a>');
							html.push('</div>');
						}

			            $('.loading').remove();
			            objId.append(html.join(""));
			            isload = false;

					}else{
						$('.loading').remove();
						objId.append("<p class='loading'>"+(pageInfo.totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185])+"</p>");
					}

					totalCount = pageInfo.totalCount;
					$("#total").html(pageInfo.totalCount);
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
