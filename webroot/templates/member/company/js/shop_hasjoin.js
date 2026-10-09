/**
 * 会员中心商城商品列表
 * by guozi at: 20160419
 */

var objId = $("#list");
$(function(){

	$(".nav-tabs li[data-id='"+state+"']").addClass("active");

	$(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("active") && !t.hasClass("add")){
			state = id;
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
			getList();
		}
	});
	//状态切换
    $(".joincomTab .stateUl li").bind("click", function(){
        var t = $(this);
        if(!t.hasClass("active")){
        	atpage = 1;
            t.addClass("active").siblings("li").removeClass("active");
            getList();
        }
    });

    $(".joincomTab .typeUl li").bind("click", function(){
        var t = $(this);    
        t.toggleClass("active").siblings("li").removeClass("active");
        atpage = 1;
        getList();
        
    });
	getList(1);
	// 2023.12.14-增加搜索功能
	$('.joincomTab .search div').click(res=>{
		$('.joincomTab .search').submit();
	});
	$('.joincomTab .search').submit(res=>{
		let keywords = $('.joincomTab .search input').val();
		getList(1,keywords);
		return false
	});

	//删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=shop&action=storeBranchConfig&oper=del&id="+id,
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
						$.dialog.alert(langData['siteConfig'][20][183]);
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});
});

function getList(is,keywords){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();
	var stateid = $('.stateUl .active a').attr('data-id');
    var typeid = $('.typeUl .active a').attr('data-id');
	$.ajax({
		url: `${masterDomain}/include/ajax.php?service=shop&action=proHuodongList&u=1&huodongstate=${stateid}&huodongtype=${typeid}&page=${atpage}&pageSize=${pageSize}&title=${keywords||''}`,
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
						//编辑
						var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
						var param = t + "do=edit&id=";
						var type = '';
						for(var i = 0; i < list.length; i++){
							var item      = [],
									id        = list[i].id,
									hid       = list[i].hid,
									title     = list[i].title,
									sta       = list[i].state,
									huodongstate       = list[i].huodongstate,
									url       = sta == 1 ? list[i].url : "javascript:;",
									litpic    = list[i].litpic,
									type      = 'tuan',
									date      = huoniao.transTimes(list[i].pubdate, 1);
							//预览
							if(huodongstate == 1 ){
								type = 'qianggou';
							}else if(huodongstate == 2 ){
								type = 'secKill';
							}else if(huodongstate == 3 ){
								type = 'bargain';
							}else if(huodongstate == 4 ){
								type = 'tuan';
							}
							var editUrl2 = editUrl.replace("%type%", type);
							var urlString = editUrl2 + param;
							html.push('<div class="item fn-clear" data-id="'+id+'">');
							if(litpic != ""){
								html.push('<div class="p"><a href="'+url+'" target="_blank"><img src="'+litpic+'" />');
								if(list[i].state == 1){

									if(list[i].huodongtimestate ==1){

										html.push('<span>活动中</span>');

									}else if(list[i].huodongtimestate == 2){

										html.push('<span>已结束</span>');
									}else{
										html.push('<span>未开始</span>');
									}
								}else if(list[i].state ==3){
									html.push('<span>已结束</span>');
								}
		                        html.push('</a></div>');
							}
							
							html.push('<div class="o">');

							html.push('<a href="'+urlString+hid+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');//编辑
							html.push('<a href="'+url+'" class="yulan"><i></i>预览</a>');			
							html.push('</div>');
							html.push('<div class="i">');
							var typeTxt = '';
							if(list[i].huodongstate == 4){
	                          typeTxt='<span class="tuan">拼团</span>'; 
	                        }else if(list[i].huodongstate == 2){
	                          typeTxt='<span class="miaosha">秒杀</span>'; 
	                        }else if(list[i].huodongstate == 3){
	                          typeTxt='<span class="bargain">砍价</span>'; 
	                        }else if(list[i].huodongstate == 1){
	                          typeTxt='<span class="qianggou">抢购</span>'; 
	                        }
							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+typeTxt+title+'</a></h5>');
							html.push(' <div class="priceDiv"><span>'+echoCurrency('symbol')+'<strong>'+list[i].huodongprice+'</strong></span><s>'+echoCurrency('symbol')+list[i].mprice+'</s>');
							html.push('</div>');
							var arcrank = "";
							if(sta == "0"){
								arcrank = '&nbsp;&nbsp;&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][26][74]+'</span>';//等待审核
							}
							html.push('<p>时间:'+list[i].ktime+'~'+list[i].etime+arcrank+'</p>');
							
	                        
                            html.push('<div class="qIng ingDiv">');
                            if(list[i].huodongstate == 1 || list[i].huodongstate == 2){//抢购 秒杀
	                            html.push('<dl><dt>浏览量：</dt><dd>'+list[i].click+'</dd></dl>');
	                            html.push('<dl><dt>已售：</dt><dd>'+list[i].huodongsales+'</dd></dl>');
                            }else if(list[i].huodongstate == 4){//拼团
								html.push('<dl><dt>拼团成功：</dt><dd>'+list[i].successres+'</dd></dl>');
	                            html.push('<dl><dt>拼团中：</dt><dd>'+list[i].handres+'</dd></dl>');
	                            html.push('<dl><dt>拼团失败：</dt><dd>'+list[i].failres+'</dd></dl>');
	                            html.push('<dl><dt>浏览量：</dt><dd>'+list[i].click+'</dd></dl>');
                            }else if(list[i].huodongstate == 3){//砍价
                            	html.push('<dl><dt>砍价成功：</dt><dd>'+list[i].successres+'</dd></dl>');
                            	if(list[i].huodongtimestate != 2){

	                            	html.push('<dl><dt>砍价中：</dt><dd>'+list[i].handres+'</dd></dl>');
                            	}
	                            html.push('<dl><dt>砍价失败：</dt><dd>'+list[i].failres+'</dd></dl>');
	                            html.push('<dl><dt>浏览量：</dt><dd>'+list[i].click+'</dd></dl>');
                            }
                            html.push('</div>');
							html.push('</div>');
							html.push('</div>');
							

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalCount = pageInfo.totalCount;

					switch(stateid){
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


					$("#audit").html(pageInfo.audit);
					$("#gray").html(pageInfo.gray);
					$("#refuse").html(pageInfo.refuse);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
