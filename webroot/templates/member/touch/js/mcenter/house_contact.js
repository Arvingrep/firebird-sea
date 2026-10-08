$(function(){
	/* 我的活动 */
	var hdpage = 1,hdLoad = false;  // 我的活动
	
	var cpage = 1,cLoad = false; // 联系我的
	
	if(typeof(hostUrl) != 'undefined'){
		getHdList();
	}else{
		getContactCount()
	}
	
	$(window).scroll(function(){
		var allh = $('body').height();
		var w = $(window).height();
		var scroll = allh - w - 50;
		if ($(window).scrollTop() >= scroll && !hdLoad) {
			if(typeof(hostUrl)!='undefined'){
				getHdList();
			}else{
				getContactCount()
			}
		};
	});
	
	// 直播活动订阅
	function getHdList(){
		if(hdLoad) return false;
		hdLoad = true;
		var url = '/include/ajax.php?service=house&action=tuan&u=1&page='+hdpage;
		$(".huodong_box").append('<p class="loading">加载中~</p>')
		$.ajax({
			url: url,
			type: "POST",
			dataType: "json",
			success: function (data) {
				$(".huodong_box .loading").remove();
				if(data.state != 100){
					$(".huodong_box").html('<p class="loading">暂无数据~</p>')
				}else{
					var list = data.info.list;
					var html1 = [],html2=[];
					for(var i=0; i<list.length; i++){
						var detail = list[i].loupanDetail;
						var start = detail.tuanbegan;  //开始时间
						var end = detail.tuanend;  //结束时间;
						var nowDate = Date.parse(new Date())/1000;
						var smonth = new Date(start*1000).getMonth() + 1;
						var sday = new Date(start*1000).getDate();
						var emonth = new Date(end*1000).getMonth() + 1;
						var eday = new Date(end*1000).getDate();
						var unit = detail.ptype=='1'?('万'+echoCurrency('short')+'/平'):('万/套');
						if(end<nowDate){
							html2.push('<dd class="list_dd">');
							html2.push('<a href="'+hostUrl+'/loupan-detail-'+detail.id+'.html" class="fn-clear">');
							html2.push('<div class="litpic"><img src="'+detail.litpic+'" alt="" onerror="this.src=\'/images/images/404.jpg\'"></div>');
							html2.push('<div class="rinfo">');
							html2.push('<h1>'+detail.title+'</h1>');
							if(detail.price && detail.price != '0'){
								html2.push('<div class="price_show"><span class="allprice"><b>'+detail.price+'</b>'+unit+'</span> </div>');
							}else{
								html2.push('<div class="price_show"><span class="allprice">暂无报价</span> </div>');
							}
							html2.push('<div class="end_time"><span>'+smonth+'月'+sday+'日</span>-<span>'+emonth+'月'+eday+'日</span></div>');
							html2.push('<p>'+detail.addr[detail.addr.length-2]+'·'+detail.addr[detail.addr.length-1]+'</p>');
							html2.push('</div>');
							html2.push('</a>');
							html2.push('</dd>');
						}else {
							html1.push('<dd class="list_dd">');
							html1.push('<a href="'+hostUrl+'/loupan-detail-'+detail.id+'.html" class="fn-clear">');
							html1.push('<div class="litpic">');
							if(end>=nowDate && nowDate<=start){
								html1.push('<span class="act_label">活动中</span>');
							}
							html1.push('<img src="'+detail.litpic+'" alt="" onerror="this.src=\'/images/images/404.jpg\'">')
							html1.push('</div>');
							html1.push('<div class="rinfo">');
							html1.push('<h1>'+detail.title+'</h1>');
							if(detail.price && detail.price != '0'){
								html1.push('<div class="price_show"><span class="allprice"><b>'+detail.price+'</b>'+unit+'</span> </div>');
							}else{
								html1.push('<div class="price_show"><span class="allprice">暂无报价</span> </div>');
							}
							html1.push('<div class="end_time"><span>'+smonth+'月'+sday+'日</span>-<span>'+emonth+'月'+eday+'日</span></div>');
							html1.push('<p>'+detail.addr[detail.addr.length-2]+'·'+detail.addr[detail.addr.length-1]+'</p>');
							html1.push('</div>');
							html1.push('</a>');
							html1.push('</dd>');
						}
					}
					if(hdpage==1){
						$(".join_huodong dd,.shixiao_huodong dd").remove();
					}
					$(".join_huodong").append(html1.join(''));
					$(".shixiao_huodong").append(html2.join(''));
					hdpage++;
					hdLoad = false;
					if(hdpage>data.info.pageInfo.totalPage){
						hdLoad = true;
						$(".huodong_box").append('<p class="loading">没有更多了~</p>')
					}
					
					if($(".join_huodong dd").length>0){
						$(".join_huodong").removeClass('fn-hide');
						$(".join_huodong dt em").text($(".join_huodong dd").length)
					}
					
					if($(".shixiao_huodong dd").length>0){
						$(".join_huodong").removeClass('fn-hide');
					}
				}
			},
			error: function(){}
		});
	}

	
	// 客户联系
	function getContactCount(){
		if(cLoad) return false;
		cLoad = true;
		$(".tab_con .tab_list").append('<p class="loading">加载中~</p>')
		$.ajax({
			url: '/include/ajax.php?service=house&action=getContactlog&page='+cpage,
			type: "POST",
			dataType: "json",
			success: function (data) {
				$(".loading").remove();
				if(data.state!=100){
					$(".tab_con .tab_list").html('<p class="loading">暂无数据~</p>')
				}else{
					var list = data.info.list;
					var dt_flag = false; 
					var html = [];
					for(var i=0; i<list.length; i++){
						var pubdate = new Date(list[i].date*1000);
						var bYY = pubdate.getFullYear(); //浏览年
						var bMM = pubdate.getMonth()+1; //浏览月
						var bDD = pubdate.getDate(); //浏览日
						var bhh = pubdate.getHours(); //时
						var bmm = pubdate.getMinutes(); //分
						var bpYY,bpMM,bpDD,bnYY,bnMM,bnDD;
						var html_dt = [];
						var houseType = '';
						if(list[i].type == 'sale'){
							houseType = '二手房'
						}else if(list[i].type == 'zu'){
							houseType = '租房'
						}else if(list[i].type == 'cw'){
							houseType = '车位'
						}else if(list[i].type == 'cf'){
							houseType = '厂房'
						}else if(list[i].type == 'sp'){
							houseType = '商铺'
						}else if(list[i].type == 'xzl'){
							houseType = '写字楼'
						}
						if($("dl[data-date='"+list[i].date+"']").size()>0){
							dt_flag = true;
						}
						
						if(i>0){
							var pubdate_pve = new Date(list[i-1].date*1000)
							bpYY = pubdate_pve.getFullYear(); //浏览年
							bpMM = pubdate_pve.getMonth()+1; //浏览月
							bpDD = pubdate_pve.getDate(); //浏览日
						}
						
						if(i != (list.length-1)){
							var pubdate_aft = new Date(list[i+1].date*1000)
							bnYY = pubdate_aft.getFullYear(); //浏览年
							bnMM = pubdate_aft.getMonth()+1; //浏览月
							bnDD = pubdate_aft.getDate(); //浏览日
						}
						if(dt_flag){
							html_dt.push('<dd class="list_dd">');
							html_dt.push('<a href="'+house_channel+'/'+list[i].type+'-detail-'+list[i].aid+'">');
							html_dt.push('<div class="left_info">');
							html_dt.push('<h3>'+list[i].username+'</h3>');
							html_dt.push('<p>在线咨询-'+list[i].title+'</p>');
							html_dt.push('<h5>'+houseType+' <em>'+showTime+'</em></h5>');
							html_dt.push('</div>');
							html_dt.push('<span class="tel" data-id="'+list[i].uid+'">联系</span>');
							html_dt.push('</a>');
							html_dt.push('</dd>');
							$("dl:last-of-type").append(html_dt.join(''));
							dt_flag = false;
						}else{
							if((i==0) || (i>0 && (bpYY!=bYY || bpMM!=bMM || bpDD!=bDD))){
								html.push('<dl data-date="'+list[i].date+'">');
								var showDate = (bYY == new Date().getFullYear())?(bMM+'-'+bDD):(bYY+'-'+bMM+'-'+bDD);
								var showTime = bhh +':'+ bmm;
								if(new Date().getFullYear() == bYY && (new Date().getMonth()+1) == bMM && new Date().getDate() == bDD){
									showDate = '今日';
								}
								html.push('<dt>'+showDate+' <span><em>0</em>条记录</span></dt>');
							}
							html.push('<dd class="list_dd">');
							html.push('<a href="'+house_channel+'/'+list[i].type+'-detail-'+list[i].aid+'">');
							html.push('<div class="left_info">');
							html.push('<h3>'+list[i].username+'</h3>');
							html.push('<p>在线咨询-'+list[i].title+'</p>');
							html.push('<h5>'+houseType+' <em>'+showTime+'</em></h5>');
							html.push('</div>');
							html.push('<span class="tel" data-id="'+list[i].uid+'">联系</span>');
							html.push('</a>');
							html.push('</dd>');
							if(i == (list.length-1) || (bnYY != bYY || bnMM != bMM || bnDD != bDD)){
								html.push('</dl>');
							}
						}
					}
					
					cpage++;
					cLoad = false;
					$(".tab_con .tab_list").append(html.join(''))
					$("dl").each(function(){
						var t = $(this);
						t.find('dt em').text(t.find('dd').length)
					})
					if(cpage>data.info.pageInfo.totalPage){
						cLoad = true;
						$(".tab_con .tab_list").append('<p class="loading">没有更多了~</p>')
					}
				}
			},
			error: function(data){}
		});
	}

// 与客户聊天
	$("body").delegate('.tel','click',function(){
		var chatid = $(this).attr('data-id');
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			window.location.href = masterDomain+'/login.html';
			return false;
		}
		if(device.indexOf('huoniao') > -1 && user_id){
			 var param = {
			        from: user_id,
			        to: chatid,
			  };
			  setupWebViewJavascriptBridge(function(bridge) {
				bridge.callHandler('invokePrivateChat',  param, function(responseData){
					console.log(responseData)
				});
			  });
		}else{
			window.location.href = chat_url+'/im/chat-'+chatid+'.html'
		}
		return false;
	})

})