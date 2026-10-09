/**
 * 会员中心活动管理列表
 * by guozi at: 20161228
 */

var objId = $("#list");
$(function(){

  //项目
	$(".tab .type").bind("click", function(){
		var t = $(this), id = t.attr("data-id"), index = t.index();
		if(!t.hasClass("curr") && !t.hasClass("sel")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
      		$('#list').html('');
			getList(1);
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
	var M={};
	//删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			M.dialog = jqueryAlert({
		          'title'   : '',
		          'content' : langData['siteConfig'][44][98],//确定要删除吗?
		          'modal'   : true,
		          'buttons' :{
		              '是' : function(){
			                M.dialog.close();
			                t.siblings("a").hide();
							t.addClass("load");

							$.ajax({
								url: masterDomain+"/include/ajax.php?service=huodong&action=del&id="+id,
								type: "GET",
								dataType: "jsonp",
								success: function (data) {
									if(data && data.state == 100){

										//删除成功后移除信息层并异步获取最新列表
										par.slideUp(300, function(){
											par.remove();
											setTimeout(function(){$('#list').html("");getList(1);}, 200);
										});

									}else{
										alert(data.info);
										t.siblings("a").show();
										t.removeClass("load");
									}
								},
								error: function(){
									alert(langData['siteConfig'][20][183]);//网络错误，请稍候重试！
									t.siblings("a").show();
									t.removeClass("load");
								}
							});
		              },
		              '否' : function(){
		                  M.dialog.close();
		              }
		          }
		    })
		}
	});

});

var uploadErrorInfo = [];


function transTimes(timestamp, n){
        
    const dateFormatter = huoniao.dateFormatter(timestamp);
    const year = dateFormatter.year;
    const month = dateFormatter.month;
    const day = dateFormatter.day;
    const hour = dateFormatter.hour;
    const minute = dateFormatter.minute;
    const second = dateFormatter.second;
    
	if(n == 1){
		return (month+'-'+day+' '+hour+':'+minute);
	}else{
		return 0;
	}
}

function getList(is){

  isload = true;


	if(is != 1){
	// 	$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}else{
		atpage = 1;
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');//加载中，请稍候

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=huodong&action=hlist&u=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
		          objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
		          $('.count span').text(0);
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

						var editUrl = $(".tab ul").data("url"), regUrl = $(".tab ul").data("reg");

						for(var i = 0; i < list.length; i++){
							var item     = [],
								id       = list[i].id,
								title    = list[i].title,
								litpic   = huoniao.changeFileSize(list[i].litpic, "middle"),
								typename = list[i].typename.join("-"),
								url      = list[i].url,
								click    = list[i].click,
								reg      = list[i].reg,
								began    = transTimes(list[i].began, 1),
								end      = transTimes(list[i].end, 1),
								feetype  = list[i].feetype,
								reply    = list[i].reply,
								waitpay  = list[i].waitpay,
								pubdate  = transTimes(list[i].pubdate, 1);

							url = waitpay == "1" || list[i].state != "1" ? 'javascript:;' : url;

				            html.push('<div class="item" data-id="'+id+'">');
				            if(waitpay == "0"){
  								html.push('<div class="title">');
				                var apa = [];
				                html.push('<span style="color:#919191;font-size: .24rem;">'+langData['siteConfig'][11][8]+'：'+pubdate+'</span>');
				                // var arcrank = "";
				                if(list[i].state == "0"){
				                   html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][19][556]+'</span>');
				                 }else if(list[i].state == "1"){
				                   html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][26][73]+'</span>');
				                 }else if(list[i].state == "2"){
				                   html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+langData['siteConfig'][9][35]+'</span>');
				                 }
				                html.push('</div>');
				            }
							html.push('<div class="info-item fn-clear">');
							html.push('<a href="'+url+'">');
							if(litpic != "" && litpic != undefined){
								html.push('<div class="info-img fn-left"><img src="'+litpic+'" /></div>');
							}
							html.push('<dl>');
              				var type = "";
							if(feetype == "1"){
								type = '<em class="fn-right" style="background: #f66; color:#fff; padding: 0 .1rem; margin: .05rem 0 0 .2rem; font-size: .22rem; font-weight: 500; border-radius: .04rem">'+langData['siteConfig'][19][889]+'</em>';//收费
							}else{
								type = '<em class="fn-right" style="background: #66a3ff; color:#fff; padding: 0 .1rem; margin: .05rem 0 0 .2rem; font-size: .22rem; font-weight: 500; border-radius: .04rem">'+langData['siteConfig'][19][427]+'</em>';//免费
							}
							html.push('<dt class="fn-clear"><p>'+title+'</p>'+type+'</dt>');
							html.push('<dd class="item-type-1">'+langData['siteConfig'][19][384]+'：'+began+'&nbsp;'+langData['siteConfig'][13][7]+'&nbsp;'+end+'</dd>');//时间 -- 至
							if(list[i].state=="1"){
								html.push('<dd class="item-area"><span class="sp_bm"><em></em>'+reg+(langData['siteConfig'][45][7].replace('0',''))+'</span><span class="sp_comment"><em></em>'+reply+'</span><span class="sp_see"><em></em>'+click+'</span></dd>');//1人报名
							}

							html.push('</dl>');
							html.push('</a></div>');
							html.push('<div class="o fn-clear">');
							if(waitpay == "1"){
				                html.push('<a href="javascript:;" class="delayPay">'+langData['siteConfig'][19][327]+'</a><a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');//支付 --删除
				            }else{
					            if(reg > 0){
									html.push('<a href="'+regUrl.replace("%id", id)+'" class="reg">'+langData['siteConfig'][19][421]+'</a>');//报名管理
								}
								html.push('<a href="'+editUrl.replace("%id", id)+'" class="edit">'+langData['siteConfig'][6][6]+'</a>');//编辑
				                if(reg <= 0){
									html.push('<a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');//删除
								}
							}
							html.push('</div>');
							html.push('</div>');
							html.push('</div>');
						}

		            objId.append(html.join(""));
		            $('.loading').remove();
		            	isload = false;
					}else{
			            $('.loading').remove();
			            objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");//已加载完全部信息！
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
					}

					if(pageInfo.audit>0){
			            $("#audit").show().html(pageInfo.audit);
			        }else{
			            $("#audit").hide();
			        }
			        if(pageInfo.gray>0){
			            $("#gray").show().html(pageInfo.gray);
			        }else{
			            $("#gray").hide();
			        }
			        if(pageInfo.refuse>0){
			            $("#refuse").show().html(pageInfo.refuse);
			        }else{
			            $("#refuse").hide();
			        }

					// $("#total").html(pageInfo.totalCount);
					// $("#audit").html(pageInfo.audit);
					// $("#gray").html(pageInfo.gray);
					// $("#refuse").html(pageInfo.refuse);
					// showPageInfo();
				}
			}else{
		        objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");//暂无相关信息！
		        $('.count span').text(0);
			}
		}
	});
}
