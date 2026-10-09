/**
 * 会员中心我参与的活动
 * by guozi at: 20161229
 */

var objId = $("#list");
$(function(){

    //APP端取消下拉刷新
    toggleDragRefresh('off');

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


	//电子票后退
	$("#detail .header-l a").bind("click", function(e){
		e.preventDefault();
		$("#detail").hide();
		$("#body").show();
		return false;
	});


	var operid;
	var M={};
	//取消报名
	$('body').delegate(".cancel", "click", function(){
		var t = $(this);
		if(operid && !t.hasClass('load')){
			M.dialog = jqueryAlert({
		          'title'   : '',
		          'content' : '确定取消吗?',
		          'modal'   : true,
		          'buttons' :{
		              '是' : function(){
			                M.dialog.close();
							t.addClass("load");

							$.ajax({
								url: masterDomain+"/include/ajax.php?service=huodong&action=cancelJoin&id="+operid,
								type: "GET",
								dataType: "jsonp",
								success: function (data) {
									if(data && data.state == 100){
										$("#body").show();
										$("#detail").hide();
										objId.html('');
										atpage = 1;
										getList();
									}else{
										alert(data.info);
										t.removeClass("load");
									}
								},
								error: function(){
									alert(langData['siteConfig'][20][183]);
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

	var M={};
	//取消报名
	objId.delegate("._cancel", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			M.dialog = jqueryAlert({
		          'title'   : '',
		          'content' : '确定取消吗?',
		          'modal'   : true,
		          'buttons' :{
		              '是' : function(){
			                M.dialog.close();
			                t.siblings("a").hide();
							t.addClass("load");

							$.ajax({
								url: masterDomain+"/include/ajax.php?service=huodong&action=cancelJoin&id="+id,
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

	//完成报名
	$('body').delegate(".success", "click", function(){
		var t = $(this);
		if(operid && !t.hasClass('load')){
			M.dialog = jqueryAlert({
		          'title'   : '',
		          'content' : langData['siteConfig'][20][584],
		          'modal'   : true,
		          'buttons' :{
		              '是' : function(){
			                M.dialog.close();
			                t.addClass("load");

							$.ajax({
								url: masterDomain+"/include/ajax.php?service=huodong&action=compleateJoin&id="+operid,
								type: "GET",
								dataType: "jsonp",
								success: function (data) {
									if(data && data.state == 100){
										$("#body").show();
										$("#detail").hide();
										objId.html('');
										atpage = 1;
										getList();
									}else{
										alert(data.info);
										t.removeClass("load");
									}
								},
								error: function(){
									alert(langData['siteConfig'][20][183]);
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

	//查看详情
	objId.delegate(".detail", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id && !t.hasClass("load")){
			operid = id;
			t.addClass("load");
			$.ajax({
				url: masterDomain+"/include/ajax.php?service=huodong&action=regDetail&id="+id,
				type: "GET",
				dataType: "jsonp",
				success: function (data) {
					if(data && data.state == 100){
						t.removeClass("load");
						var info = data.info, property = info.property;

						var state_ = '';
						switch (info.state) {
							case '1':
								state_ = langData['siteConfig'][19][891];
								break;
							case '2':
								state_ = langData['siteConfig'][16][116];
								break;
							case '3':
								state_ = langData['siteConfig'][9][13];
								break;
							case '4':
								state_ = langData['siteConfig'][9][30];
								break;
						}

						var content = '<div class="cbody"><div class="item">';
						content += '<h3>'+langData['siteConfig'][23][122]+'：'+(info.price > 0 ? info.price : langData['siteConfig'][19][427])+'</h3>';
						content += '<div class="code"><h2>'+info.code+'</h2><img src="'+masterDomain+'/include/qrcode.php?data='+(info.code.replace(/\s/g, ''))+'" /><p>'+state_+'</p></div>';
						content += '</div>';
						content += '<div class="item">';
						content += '<a href="'+info.url+'"><dl class="fn-clear inline"><dt>'+info.title+'</dt><dd><s></s></dd></dl></a>';

                        if(info.feeTitle != '' && info.feeTitle != null){
                            content += '<dl class="fn-clear"><dt>活动票种：</dt><dd>'+info.feeTitle+'</dd></dl>';
                        }

						content += '<dl class="fn-clear"><dt>'+langData['siteConfig'][19][851]+'：</dt><dd>'+transTimes(info.began, 1)+'</dd></dl>';
						content += '<dl class="fn-clear"><dt>'+langData['siteConfig'][19][852]+'：</dt><dd>'+info.address+'</dd></dl>';
						content += '<a href="tel:'+info.contact+'"><dl class="fn-clear"><dt>'+langData['siteConfig'][18][49]+'：</dt><dd><span>'+info.nickname+'</span><i>'+langData['siteConfig'][19][56]+'</i><s></s></dd></dl></a>';
						content += '</div>';

						if(property.length > 0){
							content += '<div class="item">';
							for(var tmp in property){
								for(var n in property[tmp]){
									content += '<dl class="fn-clear"><dt>'+n+'：</dt><dd>'+property[tmp][n]+'</dd></dl>';
								}
							}
							content += '</div>';
						}
						content += '</div></div>';

						if(info.state == '1'){
							content += '<div class="oper">';
							if (info.sign == '0'){
								content += '<a href="javascript:;" class="cancel"><s></s>'+langData['siteConfig'][19][773]+'</a>';
							}
							content += '<a href="javascript:;" class="success"><s></s>'+langData['siteConfig'][6][186]+'</a>';
							content += '</div>';
						}

						$("#dcon").html(content);
						$("#body").hide();
						$("#detail").show();

					}else{
						$.dialog.alert(data.info);
						t.removeClass("load");
					}
				},
				error: function(){
					$.dialog.alert(langData['siteConfig'][20][183]);
					t.removeClass("load");
				}
			})
		}
	});




});



function transTimes(timestamp, n){

    const dateFormatter = huoniao.dateFormatter(timestamp);
    const year = dateFormatter.year;
    const month = dateFormatter.month;
    const day = dateFormatter.day;
    const hour = dateFormatter.hour;
    const minute = dateFormatter.minute;
    const second = dateFormatter.second;

	if(n == 1){
		return (year+'-'+month+'-'+day+' '+hour+':'+minute);
	}else{
		return 0;
	}
}

function getList(is){

	 isload = true;


	if(is != 1){
		// $('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.append('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=huodong&action=joinList&state="+$(".tab .curr").data("id")+"&page="+atpage+"&pageSize="+pageSize,
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
							var item     = [],
								id       = list[i].id,
								title    = list[i].title,
								litpic   = huoniao.changeFileSize(list[i].litpic, "middle"),
								url      = list[i].url,
								addrname = list[i].addrname,
								address  = list[i].address,
								going    = list[i].going,
								state    = list[i].state,
								sign    = list[i].sign,
								reg      = list[i].reg,
								began    = transTimes(list[i].began, 1),
								end      = transTimes(list[i].end, 1),
								date     = huoniao.transTimes(list[i].date, 1);


							html.push('<div class="item" data-id="'+id+'">');
							html.push('<div class="title">');
			                html.push('<span style="color:#919191;font-size: .24rem;">'+langData['siteConfig'][19][851]+'：'+began+langData['siteConfig'][13][7]+end+'</span>');//至
			                var status_ = '';
							switch (state) {
								case '1':
									status_ = langData['siteConfig'][19][891];
									break;
								case '2':
									status_ = langData['siteConfig'][16][116];
									break;
								case '3':
									status_ = langData['siteConfig'][9][13];
									break;
								case '4':
									status_ = langData['siteConfig'][9][30];
									break;
							}
							html.push('<span style="color:#f9412e; font-size: .26rem; float: right;">'+status_+'</span>');

			                html.push('</div>');

							html.push('<a href="'+url+'">');
							html.push('<div class="info-item fn-clear">');
							if(litpic != "" && litpic != undefined){
								html.push(`<div class="info-img fn-left"><img src="${litpic}" onerror="this.src='/static/images/404.jpg'"/></div>`);
							}
							html.push('<dl>');
							html.push('<dt>'+title+'</dt>');
							html.push('<dd class="item-type-1"><em> '+langData['siteConfig'][19][9]+'：'+addrname[0]+' '+addrname[1]+' '+address+'</em></dd>');
							html.push('<dd class="item-area"><span class="sp_bm"><em></em>'+langData['siteConfig'][45][7].replace('0', list[i].reg)+'</span></dd>');//0人报名
							html.push('</dl>');
							html.push('</a></div>');
							html.push('<div class="o fn-clear">');
							if(going){
								html.push('<a href="javascript:;" class="detail">'+langData['siteConfig'][6][175]+'</a>');
							}
							if(going&&(state == "1") && sign == 0){
								html.push('<a href="javascript:;" class="edit _cancel">'+langData['siteConfig'][19][773]+'</a>');//取消报名
							}else{
								//html.push('<a href="javascript:;" class="del">'+langData['siteConfig'][6][8]+'</a>');//删除
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
           					 objId.append("<p class='loading'>"+langData['siteConfig'][20][185]+"</p>");
					}

					var totalCount = pageInfo.totalCount;
					switch ($(".tab .curr").data("id")) {
						case 1:
							totalCount = pageInfo.involved;
							break;
						case 2:
							totalCount = pageInfo.success;
							break;
						case 3:
							totalCount = pageInfo.cancel;
							break;
						case 4:
							totalCount = pageInfo.refund;
							break;
					}
					$("#total").html(totalCount);
					if(pageInfo.involved>0){
			            $("#involved").show().html(pageInfo.involved);
			        }else{
			            $("#involved").hide();
			        }
			        if(pageInfo.success>0){
			            $("#success").show().html(pageInfo.success);
			        }else{
			            $("#success").hide();
			        }
			        if(pageInfo.cancel>0){
			            $("#cancel").show().html(pageInfo.cancel);
			        }else{
			            $("#cancel").hide();
			        }
			        if(pageInfo.refund>0){
			            $("#refund").show().html(pageInfo.refund);
			        }else{
			            $("#refund").hide();
			        }
					// showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
        $('.count span').text(0);
			}
		}
	});
}
