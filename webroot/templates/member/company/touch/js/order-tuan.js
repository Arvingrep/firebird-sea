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

	getList(1);

	// 删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			if(confirm(langData['siteConfig'][20][182])){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=tuan&action=delOrder&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							objId.html('');
							getList();

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

});

function getList(is){

  isload = true;

	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	var state = $('.tab .curr').attr('data-id') ? $('.tab .curr').attr('data-id') : '';

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=tuan&action=orderList&store=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [], durl = $(".tab ul").data("url"), rUrl = $(".tab ul").data("refund"), cUrl = $(".tab ul").data("comment");
					var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";

					switch(state){
						case "":
							totalCount = pageInfo.totalCount;
							break;
						case "0":
							totalCount = pageInfo.unpaid;
							break;
						case "1":
							totalCount = pageInfo.ongoing;
							break;
						case "2":
							totalCount = pageInfo.expired;
							break;
						case "3":
							totalCount = pageInfo.success;
							break;
						case "4":
							totalCount = pageInfo.refunded;
							break;
						case "5":
							totalCount = pageInfo.rates;
							break;
						case "6":
							totalCount = pageInfo.recei;
							break;
						case "7":
							totalCount = pageInfo.closed;
							break;
					}

					var msg = totalCount == 0 ? langData['siteConfig'][20][126] : langData['siteConfig'][20][185];

					$("#unused").html(pageInfo.ongoing);
					$("#used").html(pageInfo.success);
					$("#refund").html(pageInfo.refunded);
					$("#recei").html(pageInfo.recei);
					$("#closed").html(pageInfo.closed);

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
								var item       = [],
										id         = list[i].id,
										company    = list[i].company,
										ordernum   = list[i].ordernum,
										proid      = list[i].proid,
										procount   = list[i].procount,
										orderprice = list[i].orderprice,
										orderstate = list[i].orderstate,
										retState   = list[i].retState,
										expDate    = list[i].expDate,
										orderdate  = huoniao.transTimes(list[i].orderdate, 1),
										title      = list[i].product.title,
										enddate    = huoniao.transTimes(list[i].product.enddate, 2),
										litpic     = list[i].product.litpic,
										url        = list[i].product.url;

								var stateInfo = btn = "";
								var urlString = tuanEditUrl.replace("%id%", id);

								switch(orderstate){
									case "0":
										stateInfo = langData['siteConfig'][9][22];
										break;
									case "1":
										stateInfo = langData['siteConfig'][9][25];
										btn = '<a href="'+urlString+t+"rates=1"+'" class="sureBtn">'+langData['siteConfig'][6][154]+'</a>';
										break;
									case "2":
										stateInfo = langData['siteConfig'][9][29];
										break;
									case "3":
										stateInfo = langData['siteConfig'][9][37];
										break;
									case "6":
										//申请退款
										if(retState == 1){

											//还未发货
											if(expDate == 0){
												stateInfo = langData['siteConfig'][9][55];

											//已经发货
											}else{
												stateInfo = langData['siteConfig'][9][56];
											}

										//未申请退款
										}else{
											stateInfo = langData['siteConfig'][9][58];
										}
										break;
									case "7":
										stateInfo = langData['siteConfig'][9][34];
										break;
								}

								html.push('<div class="item" data-id="'+id+'">');
								html.push('<p class="order-number fn-clear"><span class="fn-left">'+langData['siteConfig'][19][308]+'：'+ordernum+'</span><span class="time">'+orderdate+'</span></p>');
								html.push('<p class="store fn-clear">');
								html.push('<span class="title fn-clear"><em class="sname">'+company+'</em></span>');
								html.push('<span class="state">'+stateInfo+'</span>');
								html.push('</p>');

								html.push('<a href="'+urlString+'">');
								html.push('<div class="fn-clear">');
								html.push('<div class="imgbox"><img src="'+litpic+'" alt=""></div>');
								html.push('<div class="txtbox">');
								html.push('<p class="gname">'+title+'</p>');
								html.push('</div>');
								html.push('<div class="pricebox">');
								html.push('<p class="price">'+(echoCurrency('symbol'))+orderprice+'</p>');
								html.push('<p class="mprice">×'+procount+'</p>');
								html.push('</div>');
								html.push('</div>');
								html.push('</a>');
								html.push('<p class="btns fn-clear"><a href="'+urlString+'" class="blueBtn">'+langData['siteConfig'][19][313]+'</a>'+btn+'</p>');
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
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
