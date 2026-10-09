/**
 * 会员中心商城订单列表
 * by guozi at: 20151130
 */

var objId = $("#list");
$(function(){



	//状态切换
	$(".tab ul li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("sel")){
			state = id;
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

	getList();

	// 删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			if(confirm(langData['siteConfig'][20][182])){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=waimai&action=delOrder&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							location.reload();
						}else{
							alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						alert(langData['siteConfig'][20][183]);
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			};
		}
	});


  // 送餐电话
  $('#list').delegate('.sureBtn', 'click', function(){
    $('.waimai-tel, .disk').show();
  })

	// 关闭送餐电话
  $('.waimai-tel .close').click(function(){
    $('.waimai-tel, .disk').hide();
  })

});

function getList(is){

  isload = true;

	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	var num = $('.tab li.curr span').text();
	var msg = num == '0' ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];

	state = $('.tab .curr').attr('data-id') ? $('.tab .curr').attr('data-id') : '';

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=waimai&action=order&store=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$('.loading').remove();
					objId.append("<p class='loading'>"+msg+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [], durl = $(".tab ul").data("url"), rUrl = $(".tab ul").data("refund"), cUrl = $(".tab ul").data("comment");

					totalCount = pageInfo.state1;
					switch(state){
						case "1":
							totalCount = pageInfo.state1;
							break;
						case "2":
							totalCount = pageInfo.state2;
							break;
						case "3":
							totalCount = pageInfo.state3;
							break;
					}

					$("#state1").html(pageInfo.state1);
					$("#state2").html(pageInfo.state2);
					$("#state3").html(pageInfo.state3);

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
								var item      = [],
									id        = list[i].id,
									ordernum  = list[i].ordernum,
									state     = list[i].state,
									storename = list[i].storename,
									orderdate = huoniao.transTimes(list[i].orderdate, 1),
									price     = parseFloat(list[i].price),
									paytype   = list[i].paytype,
									peisong   = parseFloat(list[i].peisong),
									offer     = parseFloat(list[i].offer),
									note      = list[i].note;
									menus     = list[i].menus;

								var stateInfo = btn = "";

								switch(state){
									case "1":
										stateInfo = "<span class='state'>"+langData['siteConfig'][9][25]+"</span>";
										btn = '<a href="javascript:;" class="btn sureBtn">'+langData['siteConfig'][6][155]+'</a>';
										break;
									case "3":
										stateInfo = "<span class='state'>"+langData['siteConfig'][9][37]+"</span>";
										break;
								}

								html.push('<div class="item" data-id="'+id+'">');
								html.push('<p class="order-number fn-clear"><span class="fn-left">'+langData['siteConfig'][19][308]+'：'+ordernum+'</span><span class="time">'+orderdate+'</span></p>');
								html.push('<p class="store fn-clear">');
								html.push('<span class="title fn-clear"><em class="sname">'+storename+'</em></span>'+stateInfo+'</p>');
								html.push('<a href="javascript:;">');
								html.push('<div class="waimai-list">');

								var totalCount = 0;
                for (var j = 0; j < menus.length; j++) {
									totalCount = totalCount + Number(menus[j].count);
    							html.push('<p class="fn-clear"><span class="waimai-name">'+menus[j].pname+'</span><span class="waimai-amount">×'+menus[j].count+'</span></p>');
                }

                html.push('</div>');
                html.push('</a>');
								html.push('<p class="sum">'+langData['siteConfig'][19][689].replace('1', totalCount)+'   '+langData['siteConfig'][19][316]+'：<font class="blue">'+list[i].price+'</font></p>');
								html.push('<p class="btns fn-clear">'+btn+'</p>');
  							html.push('</div>');

						}

						objId.append(html.join(""));
            $('.loading').remove();
            isload = false;

					}else{
            $('.loading').remove();
						objId.append("<p class='loading'>"+msg+"</p>");
					}
				}
			}else{
				$('.loading').remove();
				objId.append("<p class='loading'>"+msg+"</p>");
			}
		}
	});
}
