/**
 * 会员中心房产列表
 * by guozi at: 20150627
 */

var objId = $("#list"), lei = 0;
$(function(){

	lei = $(".sel label.curr").data("id");
	if(type != ""){
		$(".main-tab li[data-id='"+type+"']").addClass("curr");
	}else{
		var fir = $(".main-tab li:eq(0)");
		fir.addClass("curr");
		type = fir.attr("data-id");
	}

	//类型切换
	$(".sel label").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr")){
			lei = id;
			state = "";
			atpage = 1;

			$(".main-sub-tab li:eq(1)").addClass("curr").siblings("li").removeClass("curr");
			t.addClass("curr").siblings("label").removeClass("curr");

			getList();
		}
	});

	//项目
	$(".main-sub-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr") && !t.hasClass("sel")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});

	//发布房源子级菜单
	$(".main-tab .add").hover(function(){
		var t = $(this), dl = t.find("dl");
		if(dl.size() > 0){
			dl.show();
		};
	}, function(){
		var t = $(this), dl = t.find("dl");
		if(dl.size() > 0){
			dl.hide();
		};
	});

	getList(1);

	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=house&type="+type+"&action=del&id="+id,
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
						$.dialog.alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
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
		refreshTopFunc.init('refresh', 'house', type, id, t, title);
	});


	//置顶
	objId.delegate('.topping', 'click', function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), title = par.attr("data-title");
		refreshTopFunc.init('topping', 'house', type, id, t, title);
	});

});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍后
	$(".pagination").hide();

	var t = "type="+(lei ? lei : '');
	if(type == "zu") t = "rentype="+lei;
	var action = type+"List";
	if(type == "qzu" || type == "qgou" || type == "demand"){
		action = "demand";
		t = "typeid="+lei;
	}

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=house&action="+action+"&"+t+"&u=1&orderby=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$("#total").html(0);
					$("#audit").html(0);
					$("#gray").html(0);
					$("#refuse").html(0);
					$("#expire").html(0);
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

						var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
						var param = t + "do=edit&type="+type+"&id=";
						var urlString = editUrl + param;

						for(var i = 0; i < list.length; i++){
							var item        = [],
									id          = list[i].id,
									title       = list[i].title,
									community   = list[i].community,
									addr        = list[i].addr,
									price       = list[i].price,
									url         = list[i].url,
									litpic      = list[i].litpic,
									protype     = list[i].protype,
									room        = list[i].room,
									bno         = list[i].bno,
									floor       = list[i].floor,
									area        = list[i].area,
									isbid       = parseInt(list[i].isbid),
									bid_type    = list[i].bid_type,
									bid_price   = list[i].bid_price,
									bid_end     = huoniao.transTimes(list[i].bid_end, 1),
									bid_plan    = list[i].bid_plan,
									refreshSmart = list[i].refreshSmart,
									waitpay     = list[i].waitpay,
									pubdate     = list[i].pubdate;

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

							//求租
							if(type == "qzu" || type == "qgou" || type == "demand"){

								html.push('<div class="item qiu fn-clear" data-id="'+id+'">');

								html.push('<div class="o">');
								// if(list[i].state == "1"){
								// 	if(isbid == 1){
								// 		html.push('<a href="javascript:;" class="bid has"><s></s>'+langData['siteConfig'][19][78]+'：'+bid_price+'，'+langData['siteConfig'][6][17]+'</a>');   //预算--加价
								// 	}else{
								// 		html.push('<a href="javascript:;" class="bid"><s></s>'+langData['siteConfig'][6][16]+'</a>');  //竞价
								// 	}
								// }
								html.push('<a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');  //编辑
								if(isbid == "0"){
								}
								html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>');  //删除
								html.push('</div>');

								// html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
								html.push('<div class="i">');

								var state_html = "";
								if(list[i].state == "0"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';  //未审核
								}else if(list[i].state == "2"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';  //审核拒绝
								}

								var protype = "";
								switch(list[i].type){
									case "0":
										protype = langData['siteConfig'][31][20];  //求租
										break;
									case "1":
										protype = langData['siteConfig'][31][21];  //求购
										break;
								}

								html.push('<p>'+langData['siteConfig'][19][84]+'：'+protype+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][8]+'：'+addr+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][11][8]+'：'+pubdate+state_html);
								//类型--区域--发布时间
								if(isbid == 1){
									html.push('&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#ff6600">'+langData['siteConfig'][19][67]+'：'+bid_end+'</font>');
									//竞价结束
								}
								html.push('</p>');
								html.push('<h5><a href="javascript:;" title="'+title+'">'+title+'</a></h5>');
								html.push('</div>');
								html.push('</div>');

							//二手房
							}else if(type == "sale"){

								var unitprice   = list[i].unitprice;

								html.push('<div class="item fn-clear" data-id="'+id+'" data-title="'+title+'">');
								if(litpic != "" && litpic != undefined){
									html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img onerror="this.src=\''+litpic+'\'" src="'+huoniao.changeFileSize(litpic, "small")+'" /></a></div>');
								}
								if(waitpay == "1"){
									html.push('<div class="o"><a href="javascript:;" class="stick delayPay" style="color:#f60;"><s></s>'+langData['siteConfig'][23][113]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
									//立即支付--删除
								}else{
									html.push('<div class="o">');
									if(list[i].state == "1"){
										if(!refreshSmart){
											html.push('<a href="javascript:;" class="refresh"><s></s>'+langData['siteConfig'][16][70]+'</a>');   //刷新
										}
										if(!isbid){
											html.push('<a href="javascript:;" class="topping"><s></s>'+langData['siteConfig'][19][762]+'</a>');   //置顶
										}
									}
									html.push('<a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');  //编辑
									if(!refreshSmart && !isbid){
										html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>'); //删除
									}
									html.push('</div>');
								}

								// html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
								html.push('<div class="i">');

								var state_html = "";
								if(list[i].state == "0"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';   //未审核
								}else if(list[i].state == "2"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';  //审核拒绝
								}

								html.push('<p>'+langData['siteConfig'][19][84]+'：'+protype+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][312]+'：'+price+langData['siteConfig'][13][27]+'&nbsp;&nbsp;·&nbsp;&nbsp;'+unitprice+echoCurrency('short')+'/㎡&nbsp;&nbsp;·&nbsp;&nbsp;'+area+' ㎡'+state_html+'</p>');
								//类型--总价--万
								html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');

								html.push('<p>'+community+'&nbsp;&nbsp;·&nbsp;&nbsp;'+room+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][87]+'：'+bno+'/'+floor+'&nbsp;&nbsp;·&nbsp;&nbsp;'+huoniao.transTimes(pubdate, 1));  //楼层

								// if(isbid == 1){
								// 	html.push('&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#ff6600">'+langData['siteConfig'][19][67]+'：'+bid_end+'</font>');
								// }
								html.push('</p>');

                                if(refreshSmart || isbid == 1){
                                    html.push('<div class="sd">');
                                    if(refreshSmart){
                                        html.push('<p><span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][31][128]+'<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>'+langData['siteConfig'][31][129]+'<span class="SurplusRefreshCount">'+refreshSurplus+'</span>'+langData['siteConfig'][13][26]+'</font></p>');
                                       //后刷新，已刷新---次，剩余---次
                                    }
                                    if(isbid && bid_type == 'normal'){
                                        html.push('<p>'+langData['siteConfig'][31][130]+'，<span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+'</span></p>');
                                        //已开通置顶--结束
                                    }
                                    if(isbid && bid_type == 'plan'){

                                        //记录置顶详情
                                        topPlanData['house_sale'] = Array.isArray(topPlanData['house_sale']) ? topPlanData['house_sale'] : [];
                                        topPlanData['house_sale'][id] = bid_plan;

                                        html.push('<p class="topPlanDetail" data-module="house_sale" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');
                                        //查看详情----已开通计划置顶

                                    }
                                    html.push('</div>');
                                }

								html.push('</div>');
								html.push('</div>');

							//出租房
							}else if(type == "zu"){

								var zhuangxiu = list[i].zhuangxiu,
										rentype   = list[i].rentype;

								html.push('<div class="item fn-clear" data-id="'+id+'" data-title="'+title+'">');
								if(litpic != "" && litpic != undefined){
									html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img onerror="this.src=\''+litpic+'\'" src="'+huoniao.changeFileSize(litpic, "small")+'" /></a></div>');
								}

								if(waitpay == "1"){
									html.push('<div class="o"><a href="javascript:;" class="stick delayPay" style="color:#f60;"><s></s>'+langData['siteConfig'][23][113]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
									//立即支付---删除
								}else{
									html.push('<div class="o">');
									if(list[i].state == "1"){
										if(!refreshSmart){
											html.push('<a href="javascript:;" class="refresh"><s></s>'+langData['siteConfig'][16][70]+'</a>');  //刷新
										}
										if(!isbid){
											html.push('<a href="javascript:;" class="topping"><s></s>'+langData['siteConfig'][19][762]+'</a>');  //置顶
										}
									}
									html.push('<a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');  //编辑
									if(!refreshSmart && !isbid){
										html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>');  //删除
									}
									html.push('</div>');
								}

								// html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
								html.push('<div class="i">');

								var state_html = "";
								if(list[i].state == "0"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';   //未审核
								}else if(list[i].state == "2"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';     //审核拒绝
								}

								html.push('<p>'+langData['siteConfig'][19][84]+'：'+protype+'&nbsp;&nbsp;·&nbsp;&nbsp;'+zhuangxiu+'&nbsp;&nbsp;·&nbsp;&nbsp;');
								html.push(rentype+'&nbsp;&nbsp;·&nbsp;&nbsp;'+price+echoCurrency('short')+'/'+langData['siteConfig'][13][18]+'&nbsp;&nbsp;·&nbsp;&nbsp;'+area+' ㎡'+state_html+'</p>');				//类型----月
								html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');

								html.push('<p>'+community+'&nbsp;&nbsp;·&nbsp;&nbsp;'+room+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][87]+'：'+bno+'/'+floor+'&nbsp;&nbsp;·&nbsp;&nbsp;'+huoniao.transTimes(pubdate, 1));   //楼层

								// if(isbid == 1){
								// 	html.push('&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#ff6600">'+langData['siteConfig'][19][67]+'：'+bid_end+'</font>');
								// }
								html.push('</p>');

                                if(refreshSmart || isbid == 1){
                                    html.push('<div class="sd">');
                                    if(refreshSmart){
                                        html.push('<p><span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][31][128]+'<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>'+langData['siteConfig'][31][129]+'<span class="SurplusRefreshCount">'+refreshSurplus+'</span>'+langData['siteConfig'][13][26]+'</font></p>');
                                        //后刷新，已刷新-----次，剩余---次
                                    }
                                    if(isbid && bid_type == 'normal'){
                                        html.push('<p>'+langData['siteConfig'][31][130]+'，<span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+'</span></p>');   //已开通置顶--结束
                                    }
                                    if(isbid && bid_type == 'plan'){

                                        //记录置顶详情
                                        topPlanData['house_zu'] = Array.isArray(topPlanData['house_zu']) ? topPlanData['house_zu'] : [];
                                        topPlanData['house_zu'][id] = bid_plan;

                                        html.push('<p class="topPlanDetail" data-module="house_zu" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');
                                         //查看详情----已开通计划置顶
                                    }
                                    html.push('</div>');
                                }

								html.push('</div>');
								html.push('</div>');

							//写字楼
							}else if(type == "xzl"){

								var loupan = list[i].loupan;

								html.push('<div class="item fn-clear" data-id="'+id+'" data-title="'+title+'">');
								if(litpic != "" && litpic != undefined){
									html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img onerror="this.src=\''+litpic+'\'" src="'+huoniao.changeFileSize(litpic, "small")+'" /></a></div>');
								}

								if(waitpay == "1"){
									html.push('<div class="o"><a href="javascript:;" class="stick delayPay" style="color:#f60;"><s></s>'+langData['siteConfig'][23][113]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');//立即支付---删除
								}else{
									html.push('<div class="o">');
									if(list[i].state == "1"){
										if(!refreshSmart){
											html.push('<a href="javascript:;" class="refresh"><s></s>'+langData['siteConfig'][16][70]+'</a>');//刷新
										}
										if(!isbid){
											html.push('<a href="javascript:;" class="topping"><s></s>'+langData['siteConfig'][19][762]+'</a>');//置顶
										}
									}
									html.push('<a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');  //编辑
									if(!refreshSmart && !isbid){
										html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>');  //删除
									}
									html.push('</div>');
								}

								// html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
								html.push('<div class="i">');

								var state_html = "";
								if(list[i].state == "0"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';  //未审核
								}else if(list[i].state == "2"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';   //审核拒绝
								}

								var p = lei == 0 ? (echoCurrency('short')+"/m²•"+langData['siteConfig'][13][18]) : (langData['siteConfig'][13][27]+echoCurrency('short'));  //月---万
								html.push('<p>'+langData['siteConfig'][19][84]+'：'+protype+'&nbsp;&nbsp;·&nbsp;&nbsp;'+price+p+'&nbsp;&nbsp;·&nbsp;&nbsp;'+huoniao.transTimes(pubdate, 1)+state_html+'</p>');//类型
								html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');

								html.push('<p>'+loupan+'&nbsp;&nbsp;·&nbsp;&nbsp;'+addr+'&nbsp;&nbsp;·&nbsp;&nbsp;'+area+' ㎡');
								// if(isbid == 1){
								// 	html.push('&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#ff6600">'+langData['siteConfig'][19][67]+'：'+bid_end+'</font>');
								// }
								html.push('</p>');

                                if(refreshSmart || isbid == 1){
                                    html.push('<div class="sd">');
                                    if(refreshSmart){
                                        html.push('<p><span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][31][128]+'<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>'+langData['siteConfig'][31][129]+'<span class="SurplusRefreshCount">'+refreshSurplus+'</span>'+langData['siteConfig'][13][26]+'</font></p>');
                                        //后刷新，已刷新--次，剩余--次
                                    }
                                    if(isbid && bid_type == 'normal'){
                                        html.push('<p>'+langData['siteConfig'][31][130]+'，<span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+'</span></p>');//已开通置顶----结束
                                    }
                                    if(isbid && bid_type == 'plan'){

                                        //记录置顶详情
                                        topPlanData['house_xzl'] = Array.isArray(topPlanData['house_xzl']) ? topPlanData['house_xzl'] : [];
                                        topPlanData['house_xzl'][id] = bid_plan;

                                        html.push('<p class="topPlanDetail" data-module="house_xzl" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');
                                        //查看详情----已开通计划置顶
                                    }
                                    html.push('</div>');
                                }

								html.push('</div>');
								html.push('</div>');

							//商铺
							}else if(type == "sp"){

								var transfer = list[i].transfer,
										address  = list[i].address;

								html.push('<div class="item fn-clear" data-id="'+id+'" data-title="'+title+'">');
								if(litpic != "" && litpic != undefined){
									html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img onerror="this.src=\''+litpic+'\'" src="'+huoniao.changeFileSize(litpic, "small")+'" /></a></div>');
								}

								if(waitpay == "1"){
									html.push('<div class="o"><a href="javascript:;" class="stick delayPay" style="color:#f60;"><s></s>'+langData['siteConfig'][23][113]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
									//立即支付---删除
								}else{
									html.push('<div class="o">');
									if(list[i].state == "1"){
										if(!refreshSmart){
											html.push('<a href="javascript:;" class="refresh"><s></s>'+langData['siteConfig'][16][70]+'</a>');  //刷新
										}
										if(!isbid){
											html.push('<a href="javascript:;" class="topping"><s></s>'+langData['siteConfig'][19][762]+'</a>');//置顶
										}
									}
									html.push('<a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');   //编辑
									if(!refreshSmart && !isbid){
										html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>');  //刷新
									}
									html.push('</div>');
								}

								// html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
								html.push('<div class="i">');

								var state_html = "";
								if(list[i].state == "0"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';   //未审核
								}else if(list[i].state == "2"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';//审核拒绝
								}

								var p = lei == 0 ? (echoCurrency('short')+"/"+langData['siteConfig'][13][18]) : (langData['siteConfig'][13][27]+echoCurrency('short'));
								//月 ---万
								var tran = lei == 2 ? "&nbsp;&nbsp;·&nbsp;&nbsp;"+langData['siteConfig'][19][120]+"："+transfer+langData['siteConfig'][13][27]+echoCurrency('short')+"" : "";  //转让费---万
								//
								html.push('<p>'+langData['siteConfig'][19][84]+'：'+protype+'&nbsp;&nbsp;·&nbsp;&nbsp;'+price+p+tran+'&nbsp;&nbsp;·&nbsp;&nbsp;'+huoniao.transTimes(pubdate, 1)+state_html+'</p>');//类型
								html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');

								html.push('<p>'+langData['siteConfig'][19][8]+'：'+addr+'&nbsp;&nbsp;·&nbsp;&nbsp;'+address+'&nbsp;&nbsp;·&nbsp;&nbsp;'+area+' ㎡');  //关键词

								// if(isbid == 1){
								// 	html.push('&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#ff6600">'+langData['siteConfig'][19][67]+'：'+bid_end+'</font>');
								// }
								html.push('</p>');

                                if(refreshSmart || isbid == 1){
                                    html.push('<div class="sd">');
                                    if(refreshSmart){
                                        html.push('<p><span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][31][128]+'<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>'+langData['siteConfig'][31][129]+'<span class="SurplusRefreshCount">'+refreshSurplus+'</span>'+langData['siteConfig'][13][26]+'</font></p>');
                                        //后刷新，已刷新 -- 次，剩余 -- 次
                                    }
                                    if(isbid && bid_type == 'normal'){
                                        html.push('<p>'+langData['siteConfig'][31][130]+'，<span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+'</span></p>'); //已开通置顶--结束
                                    }
                                    if(isbid && bid_type == 'plan'){

                                        //记录置顶详情
                                        topPlanData['house_sp'] = Array.isArray(topPlanData['house_sp']) ? topPlanData['house_sp'] : [];
                                        topPlanData['house_sp'][id] = bid_plan;

                                        html.push('<p class="topPlanDetail" data-module="house_sp" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');
                                        //查看详情----已开通计划置顶
                                    }
                                    html.push('</div>');
                                }

								html.push('</div>');
								html.push('</div>');

							//厂房、仓库
							}else if(type == "cf"){

								var transfer = list[i].transfer,
										address  = list[i].address;

								html.push('<div class="item fn-clear" data-id="'+id+'" data-title="'+title+'">');
								if(litpic != "" && litpic != undefined){
									html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img onerror="this.src=\''+litpic+'\'" src="'+huoniao.changeFileSize(litpic, "small")+'" /></a></div>');
								}

								if(waitpay == "1"){
									html.push('<div class="o"><a href="javascript:;" class="stick delayPay" style="color:#f60;"><s></s>'+langData['siteConfig'][23][113]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
									//立即支付---删除
								}else{
									html.push('<div class="o">');
									if(list[i].state == "1"){
										if(!refreshSmart){
											html.push('<a href="javascript:;" class="refresh"><s></s>'+langData['siteConfig'][16][70]+'</a>');//刷新
										}
										if(!isbid){
											html.push('<a href="javascript:;" class="topping"><s></s>'+langData['siteConfig'][19][762]+'</a>');//置顶
										}
									}
									html.push('<a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');//编辑
									if(!refreshSmart && !isbid){
										html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>');//删除
									}
									html.push('</div>');
								}

								// html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
								html.push('<div class="i">');

								var state_html = "";
								if(list[i].state == "0"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>'; //未审核
								}else if(list[i].state == "2"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';//审核拒绝
								}

								var p = lei == 0 ? (echoCurrency('short')+"/"+langData['siteConfig'][13][18]) : (langData['siteConfig'][13][27]+echoCurrency('short'));

								var tran = lei == 1 ? "&nbsp;&nbsp;·&nbsp;&nbsp;"+langData['siteConfig'][19][120]+"："+transfer+langData['siteConfig'][13][27]+echoCurrency('short')+"" : "";  //月--万--转让费--万

								html.push('<p>'+langData['siteConfig'][19][84]+'：'+protype+'&nbsp;&nbsp;·&nbsp;&nbsp;'+price+p+tran+'&nbsp;&nbsp;·&nbsp;&nbsp;'+huoniao.transTimes(pubdate, 1)+state_html+'</p>');//类型
								html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');

								html.push('<p>'+langData['siteConfig'][19][8]+'：'+addr+'&nbsp;&nbsp;·&nbsp;&nbsp;'+address+'&nbsp;&nbsp;·&nbsp;&nbsp;'+area+' ㎡');  //区域
								// if(isbid == 1){
								// 	html.push('&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#ff6600">'+langData['siteConfig'][19][67]+'：'+bid_end+'</font>');
								// }
								html.push('</p>');

                                if(refreshSmart || isbid == 1){
                                    html.push('<div class="sd">');
                                    if(refreshSmart){
                                        html.push('<p><span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][31][128]+'<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>'+langData['siteConfig'][31][129]+'<span class="SurplusRefreshCount">'+refreshSurplus+'</span>'+langData['siteConfig'][13][26]+'</font></p>');
                                        //后刷新，已刷新--次，剩余--次
                                    }
                                    if(isbid && bid_type == 'normal'){
                                        html.push('<p>'+langData['siteConfig'][31][130]+'，<span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+'</span></p>'); //已开通置顶--结束
                                    }
                                    if(isbid && bid_type == 'plan'){

                                        //记录置顶详情
                                        topPlanData['house_cf'] = Array.isArray(topPlanData['house_cf']) ? topPlanData['house_cf'] : [];
                                        topPlanData['house_cf'][id] = bid_plan;

                                        html.push('<p class="topPlanDetail" data-module="house_cf" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');
                                        //查看详情----已开通计划置顶
                                    }
                                    html.push('</div>');
                                }

								html.push('</div>');
								html.push('</div>');

							}else if(type == 'cw'){
								var transfer = list[i].transfer,
										address  = list[i].address;

								html.push('<div class="item fn-clear" data-id="'+id+'" data-title="'+title+'">');
								if(litpic != "" && litpic != undefined){
									html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img onerror="this.src=\''+litpic+'\'" src="'+huoniao.changeFileSize(litpic, "small")+'" /></a></div>');
								}
								if(waitpay == "1"){
									html.push('<div class="o"><a href="javascript:;" class="stick delayPay" style="color:#f60;"><s></s>'+langData['siteConfig'][23][113]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
									//立即支付---删除
								}else{
									html.push('<div class="o">');
									if(list[i].state == "1"){
										if(!refreshSmart){
											html.push('<a href="javascript:;" class="refresh"><s></s>'+langData['siteConfig'][16][70]+'</a>');  //刷新
										}
										if(!isbid){
											html.push('<a href="javascript:;" class="topping"><s></s>'+langData['siteConfig'][19][762]+'</a>');  //置顶
										}
									}
									html.push('<a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');  //编辑
									if(!refreshSmart && !isbid){
										html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>');  //删除
									}
									html.push('</div>');
								}

								// html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
								html.push('<div class="i">');

								var state_html = "";
								if(list[i].state == "0"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][9][21]+'</span>';  //未审核
								}else if(list[i].state == "2"){
									state_html = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';//审核拒绝
								}

								var p = lei == 0 ? (echoCurrency('short')+"/"+langData['siteConfig'][13][18]) : (langData['siteConfig'][13][27]+echoCurrency('short'));

								var tran = lei == 2 ? "&nbsp;&nbsp;·&nbsp;&nbsp;"+langData['siteConfig'][19][120]+"："+transfer+langData['siteConfig'][13][27]+echoCurrency('short')+"" : "";

								html.push('<p>'+(list[i].protype ? langData['siteConfig'][19][84]+'：'+list[i].protype+'&nbsp;&nbsp;·&nbsp;&nbsp;' : '')+price+p+tran+'&nbsp;&nbsp;·&nbsp;&nbsp;面积：'+parseInt(area)+'㎡&nbsp;&nbsp;·&nbsp;&nbsp;'+huoniao.transTimes(pubdate, 1)+state_html+'</p>');
								html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');

								html.push('<p>'+community+'&nbsp;&nbsp;·&nbsp;&nbsp;'+address);
								// if(isbid == 1){
								// 	html.push('&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#ff6600">'+langData['siteConfig'][19][67]+'：'+bid_end+'</font>');
								// }
								html.push('</p>');

                                if(refreshSmart || isbid == 1){
                                    html.push('<div class="sd">');
                                    if(refreshSmart){
                                        html.push('<p><span class="refreshSmartTime" data-time="'+list[i].refreshNext+'">0:0:0</span>'+langData['siteConfig'][31][128]+'<span class="alreadyRefreshCount">'+(refreshCount-refreshSurplus)+'</span>'+langData['siteConfig'][31][129]+'<span class="SurplusRefreshCount">'+refreshSurplus+'</span>'+langData['siteConfig'][13][26]+'</font></p>');
                                        //后刷新，已刷新--次，剩余--次
                                    }
                                    if(isbid && bid_type == 'normal'){
                                        html.push('<p>'+langData['siteConfig'][31][130]+'，<span class="topEndTime">'+bid_end+langData['siteConfig'][6][163]+'</span></p>'); //已开通置顶--结束
                                    }
                                    if(isbid && bid_type == 'plan'){

                                        //记录置顶详情
                                        topPlanData['house_sale'] = Array.isArray(topPlanData['house_sale']) ? topPlanData['house_sale'] : [];
                                        topPlanData['house_sale'][id] = bid_plan;

                                        html.push('<p class="topPlanDetail" data-module="house_sale" data-id="'+id+'" title="'+langData['siteConfig'][6][113]+'">'+langData['siteConfig'][31][131]+'<s></s></p>');
                                        //查看详情----已开通计划置顶
                                    }
                                    html.push('</div>');
                                }

								html.push('</div>');
								html.push('</div>');
							}

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");   //暂无相关信息！
					}
                    countDownRefreshSmart();

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
							totalCount = pageInfo.refresh;
							break;
					}


					$("#total").html(pageInfo.totalCount);
					$("#audit").html(pageInfo.audit);
					$("#gray").html(pageInfo.gray);
					$("#refuse").html(pageInfo.refresh);
					$("#expire").html(pageInfo.expire);
					showPageInfo();
				}
			}else{
				$("#total").html(0);
				$("#audit").html(0);
				$("#gray").html(0);
				$("#refuse").html(0);
				$("#expire").html(0);
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");   //暂无相关信息！
			}
		}
	});
}
