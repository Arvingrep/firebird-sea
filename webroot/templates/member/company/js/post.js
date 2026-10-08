/**
 * 会员中心商城订单
 * by guozi at: 20150928
 */

var objId = $("#list");
$(function(){

	// $(".nav-tabs li:first").addClass("active");
	// state = $(".nav-tabs li:first").data("id");

	$(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("active") && !t.hasClass("add")){
			state = id;
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
			getList();
		}
	});

	getList(1);

	//删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=job&action=delPost&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state != 200){

							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();

								setTimeout(function(){getList(1);}, 200);
							});

						}else{
							$.dialog.alert(data.info);
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);
					}
				});
			});
		}
	});


	//刷新
	objId.delegate('.refresh', 'click', function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-id"), title = par.attr("data-title");
		refreshTopFunc.init('refresh', 'job', 'detail', id, t, title);
	});


	//置顶
	objId.delegate('.topping', 'click', function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-id"), title = par.attr("data-title");
		refreshTopFunc.init('topping', 'job', 'detail', id, t, title);
	});

});


function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=job&action=post&com=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){

							var isbid       = parseInt(list[i].isbid),
									bid_type    = list[i].bid_type,
									bid_price   = list[i].bid_price,
									bid_end     = huoniao.transTimes(list[i].bid_end, 1),
									bid_plan    = list[i].bid_plan,
									refreshSmart = list[i].refreshSmart;

							//智能刷新
							if(refreshSmart){
								refreshCount = list[i].refreshCount;
								refreshTimes = list[i].refreshTimes;
								refreshPrice = list[i].refreshPrice;
								refreshBegan = huoniao.transTimes(list[i].refreshBegan, 1);
								refreshNext = huoniao.transTimes(list[i].refreshNext, 1);
								refreshSurplus = list[i].refreshSurplus;
							}

							html.push('<tr data-id="'+list[i].id+'"><td class="tit"><a href="'+list[i]['url']+'" target="_blank">'+list[i].title+'</a></td>');
							html.push('<td>'+list[i].delivery+'</td>');
							html.push('<td>'+huoniao.transTimes(list[i].pubdate, 1)+'</td>');
							html.push('<td>'+huoniao.transTimes(list[i].valid, 2)+'</td>');

							var states = "";
							switch (list[i].state) {
								case "0":
									states = langData['siteConfig'][19][556];
									break;
								case "1":
									states = langData['siteConfig'][19][392];
									break;
								case "2":
									states = langData['siteConfig'][23][101];
									break;
								case "3":
									states = langData['siteConfig'][9][29];
									break;
							}
							html.push('<td>'+states+'</td>');
							html.push('<td class="cz">');

							if(list[i].state == "1"){
								if(!refreshSmart){
									html.push('<a href="javascript:;" class="refresh">'+langData['siteConfig'][16][70]+'</a>');//刷新
								}
								if(!isbid){
									html.push('<a href="javascript:;" class="topping">'+langData['siteConfig'][19][762]+'</a>');//置顶
								}
							}

							html.push('<a href="'+editUrl.replace("%id%", list[i].id)+'" class="edit">'+langData['siteConfig'][6][4]+'</a>');
							if(!refreshSmart && !isbid){
								html.push('<a href="#" class="del">'+langData['siteConfig'][6][8]+'</a>');
							}
							html.push('</td>');

                            if(refreshSmart || isbid == 1){
                                html.push('<tr class="sd"><td colspan="6">');
                                if(refreshSmart){                                 
                                    html.push('<p><span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][45][2]+langData['siteConfig'][45][1].replace('1','<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>')+'，'+langData['siteConfig'][45][0].replace('1','<span class="SurplusRefreshCount">'+refreshSurplus+'</span>')+'</font></p>');//后刷新--已刷新1次--剩余1次
                                }
                                if(isbid && bid_type == 'normal'){
                                    html.push('<p>'+langData['siteConfig'][31][130]+'，<span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+' </span></p>');//已开通置顶--结束
                                }
                                if(isbid && bid_type == 'plan'){

                                    //记录置顶详情
                                    topPlanData['job'] = Array.isArray(topPlanData['job']) ? topPlanData['job'] : [];
                                    topPlanData['job'][list[i].id] = bid_plan;

                                    html.push('<p class="topPlanDetail" data-module="job" data-id="'+list[i].id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');//查看详情--已开通计划置顶
                                }
                                html.push('</td></tr>');
                            }

						}

						objId.html('<table><colgroup><col style="width:38%;"><col style="width:7%;"><col style="width:17%;"><col style="width:10%;"><col style="width:10%;"><col style="width:18%;"></colgroup><tbody>'+html.join("")+'</tbody></table>');

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}
                    countDownRefreshSmart();

					switch(state){
						case "":
							totalCount = pageInfo.totalCount;
							break;
						case "0":
							totalCount = pageInfo.state0;
							break;
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


					$("#totalCount").html(pageInfo.totalCount);
					$("#state0").html(pageInfo.state0);
					$("#state1").html(pageInfo.state1);
					$("#state2").html(pageInfo.state2);
					$("#state3").html(pageInfo.state3);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
