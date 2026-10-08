/**
 * 会员中心分类信息列表
 * by guozi at: 20150627
 */

var objId = $("#list");
$(function(){

	$(".main-tab li[data-id='"+state+"']").addClass("curr");

	$(".main-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("add")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});

	getList(1);

	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){   //你确定要删除这条信息吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=car&action=del&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();
								setTimeout(function(){getList(1);}, 200);
							});

						}else{
							$.dialog.alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});


	//刷新
	objId.delegate('.refresh', 'click', function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
		refreshTopFunc.init('refresh', 'car', 'detail', id, t, title);
	});


	//置顶
	objId.delegate('.topping', 'click', function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
		refreshTopFunc.init('topping', 'car', 'detail', id, t, title);
	});


});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=car&action=car&u=1&orderby=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

						var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
						var param = t + "do=edit&id=";
						var urlString = editUrl + param;

						for(var i = 0; i < list.length; i++){
							var item        = [],
									id          = list[i].id,
									title       = list[i].title,
									color       = list[i].color,
									address     = list[i].address,
									typename    = list[i].typename,
									url         = list[i].url,
									litpic      = list[i].litpic,
									click       = list[i].click,
									common      = list[i].common,
									isvalid     = list[i].isvalid,
									brandname   = list[i].brandname,
									isbid       = parseInt(list[i].isbid),
									bid_type    = list[i].bid_type,
									bid_price   = list[i].bid_price,
									bid_end     = huoniao.transTimes(list[i].bid_end, 1),
									bid_plan    = list[i].bid_plan,
									waitpay     = list[i].waitpay,
									refreshSmart= list[i].refreshSmart,
									is_valid    = list[i].is_valid,
									pubdate     = huoniao.transTimes(list[i].pubdate, 1);

							//智能刷新
							if(refreshSmart){
								refreshCount = list[i].refreshCount;
								refreshTimes = list[i].refreshTimes;
								refreshPrice = list[i].refreshPrice;
								refreshBegan = huoniao.transTimes(list[i].refreshBegan, 1);
								refreshNext = huoniao.transTimes(list[i].refreshNext, 1);
								refreshSurplus = list[i].refreshSurplus;
							}

							url = waitpay == "1" || list[i].state != "1" ? 'javascript:;' : url;

							html.push('<div class="item fn-clear" data-id="'+id+'" data-title="'+title+'">');
							if(litpic != "" && litpic != undefined){
								html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img src="'+huoniao.changeFileSize(litpic, "small")+'" /></a></div>');
							}

							if(waitpay == "1"){
								html.push('<div class="o"><a href="javascript:;" class="stick delayPay" style="color:#ff6600;"><s></s>'+langData['siteConfig'][23][113]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
								//为求职者提供最新最全的招聘信息------删除
							}else{
								html.push('<div class="o">');

								if(list[i].state == "1"){
									if(!refreshSmart){
										html.push('<a href="javascript:;" class="refresh"><s></s>'+langData['siteConfig'][16][70]+'</a>'); //刷新
									}
									if(!isbid){
										html.push('<a href="javascript:;" class="topping"><s></s>'+langData['siteConfig'][19][762]+'</a>');  //置顶
									}
								}

								html.push('<a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>'); //编辑
								if(!refreshSmart && !isbid){
									html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>');//删除
								}
								html.push('</div>');
							}
							html.push('<div class="i">');

							var arcrank = "";
							if(list[i].state == "0"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>'; //未审核
							}else if(list[i].state == "2"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';//审核拒绝
							}else if(list[i].state == "3"){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][23][114]+'</span>';  //取消显示
							}else if(list[i].state == "4"){
								//arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][29]+'</span>';  //已过期
							}

							html.push('<p>'+langData['siteConfig'][19][393]+'：'+brandname+'&nbsp;&nbsp;·&nbsp;&nbsp;'+pubdate+arcrank+'</p>');//分类
							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'" style="color:'+color+';">'+title+'</a></h5>');

							html.push('<p>'+langData['siteConfig'][19][8]+'：'+address+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][394]+'：'+click+langData['siteConfig'][13][26]+'&nbsp;&nbsp;·&nbsp;&nbsp;');
							//浏览--次--评论--条
							html.push('</p>');

							if(refreshSmart || isbid == 1){
								html.push('<div class="sd">');
								if(refreshSmart){
									html.push('<p><span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][31][128]+'<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>'+langData['siteConfig'][31][129]+'<span class="SurplusRefreshCount">'+refreshSurplus+'</span>'+langData['siteConfig'][13][26]+'</font></p>');
									//后刷新，已刷新---次，剩余---次
								}
								if(isbid && bid_type == 'normal'){
									html.push('<p>'+langData['siteConfig'][31][130]+'，<span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+'</span></p>');
									//已开通置顶---结束
								}
								if(isbid && bid_type == 'plan'){

								    //记录置顶详情
                                    topPlanData['info'] = Array.isArray(topPlanData['info']) ? topPlanData['info'] : [];
                                    topPlanData['info'][id] = bid_plan;

                                    html.push('<p class="topPlanDetail" data-module="info" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');
                                    //查看详情---已开通计划置顶
								}
								html.push('</div>');
							}

							html.push('</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));
                        countDownRefreshSmart();

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
					}

					switch(state){
						case "":
							totalCount = pageInfo.totalCount;
							break;
						case "0":
							totalCount = pageInfo.gray;
							break;
						case "1":
							totalCount = pageInfo.audit;
							break;
						case "2":
							totalCount = pageInfo.refuse;
							break;
						case "4":
							totalCount = pageInfo.expire;
							break;
					}


					$("#total").html(pageInfo.totalCount);
					$("#audit").html(pageInfo.audit);
					$("#gray").html(pageInfo.gray);
					$("#refuse").html(pageInfo.refuse);
					$("#expire").html(pageInfo.expire);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
			}
		}
	});
}
