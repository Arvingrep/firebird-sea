/**
 * 会员中心我参与的活动
 * by guozi at: 20161229
 */

var objId = $("#list");
$(function(){

	$(".main-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr")){
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});

	getList(1);

	var operid, detailPopup;

	//取消报名
	$('body').delegate(".cancel", "click", function(){
		var t = $(this);
		if(operid && !t.hasClass('load')){
			$.dialog.confirm(langData['siteConfig'][20][192], function(){
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=huodong&action=cancelJoin&id="+operid,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							detailPopup.hide();
							getList(1);
						}else{
							$.dialog.alert(data.info);
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);   //网络错误，请稍候重试！
						t.removeClass("load");
					}
				});
			});
		}
	});

	//完成报名
	$('body').delegate(".ok", "click", function(){
		var t = $(this);
		if(operid && !t.hasClass('load')){
			$.dialog.confirm(langData['siteConfig'][20][584], function(){     //确定已完成活动吗？
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=huodong&action=compleateJoin&id="+operid,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							detailPopup.hide();
							getList(1);
						}else{
							$.dialog.alert(data.info);
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
						t.removeClass("load");
					}
				});
			});
		}
	});

	//查看详情
	objId.delegate(".edit", "click", function(){
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

						var content = '<div class="ticketContent">';
						content += '<div class="number"><p>'+langData['siteConfig'][18][48]+'</p><h2>'+info.code+'</h2></div>';// 电子票号
						content += '<div class="con">';
						content += '<dl class="fn-clear">';
						content += '<dt><img src="'+masterDomain+'/include/qrcode.php?data='+(info.code.replace(/\s/g, ''))+'" /></dt>';
						content += '<dd>';

                        if(info.feeTitle != '' && info.feeTitle != null){
                            content += '<p>活动票种：'+info.feeTitle+'</p>';
                        }

						content += '<p style="color: #f60;">'+langData['siteConfig'][23][122]+'：'+(info.price > 0 ? info.price : langData['siteConfig'][19][427])+'</p>';    //费用--免费

						if(property.length > 0){
							for(var tmp in property){
								for(var n in property[tmp]){
									content += '<p><span>'+n+'：</span>'+property[tmp][n]+'</p>';
								}
							}
						}

						content += '</dd>';
						content += '</dl>';
						content += '</div>';
						content += '<div class="fot fn-clear">';
						content += '<div class="sto">'+langData['siteConfig'][18][49]+'：'+info.nickname+'<br />'+langData['siteConfig'][19][56]+'：'+info.contact+'</div>';//主办单位----联系电话
						content += '<div class="btn fn-clear">';

						if(info.state == '1'){
							if (info.sign == '0'){
								content += '<a href="javascript:;" class="cancel">'+langData['siteConfig'][19][773]+'</a>';  //取消报名
							}
							content += '<a href="javascript:;" class="ok">'+langData['siteConfig'][6][186]+'</a>';  //完成活动
						}else{

							var state_ = '';
							switch (info.state) {
								case '1':
									state_ = langData['siteConfig'][19][891];//待参与
									break;
								case '2':
									state_ = langData['siteConfig'][16][116];  //已完成
									break;
								case '3':
									state_ = langData['siteConfig'][9][13];   //已取消
									break;
								case '4':
									state_ = langData['siteConfig'][9][30];//已退款
									break;
							}

							content += '<a href="javascript:;">'+state_+'</a>';
						}

						content += '</div>';
						content += '</div>';
						content += '</div>';

						detailPopup = $.dialog({
							title: langData['siteConfig'][19][313],   //订单详情
							width: 535,
							content: content,
							ok: false
						});

					}else{
						$.dialog.alert(data.info);
						t.removeClass("load");
					}
				},
				error: function(){
					$.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
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
		return (month+'-'+day+' '+hour+':'+minute);
	}else{
		return 0;
	}
}

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');  //加载中，请稍候
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=huodong&action=joinList&state="+$(".main-tab .curr").data("state")+"&page="+atpage+"&pageSize="+pageSize,
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
								began    = transTimes(list[i].began, 1),
								date     = huoniao.transTimes(list[i].date, 1);

							html.push('<div class="item fn-clear" data-id="'+id+'">');
							if(litpic){
								html.push('<div class="p"><a href="'+url+'" target="_blank"><i></i><img src="'+litpic+'"></a></div>');
							}
							var status = '&nbsp;&nbsp;·&nbsp;&nbsp;<font color="red">'+langData['siteConfig'][19][418]+'</font>';  //活动已结束
								html.push('<div class="o">');
								var state_ = '';
								switch (state) {
									case '1':
										state_ = langData['siteConfig'][19][891];  //待参与
										break;
									case '2':
										state_ = langData['siteConfig'][16][116];  //已完成
										break;
									case '3':
										state_ = langData['siteConfig'][9][13];  //已取消
										break;
									case '4':
										state_ = langData['siteConfig'][9][30];  //已退款
										break;
								}
								html.push('<span style="color: #f60;">'+state_+'</span>');
								html.push('<a href="javascript:;" class="edit"><s></s>'+langData['siteConfig'][6][175]+'</a>');  //查看
								if(going){
									// html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][19][773]+'</a>');
									status = '&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#0eabee">'+langData['siteConfig'][19][772]+'</font>';  //活动进行中
								}
								html.push('</div>');
							html.push('<div class="i">');
							html.push('<p>'+langData['siteConfig'][19][417]+'：'+date+status+'</p>');   //报名时间
							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');
							html.push('<p>'+langData['siteConfig'][17][34]+'：'+began+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][9]+'：'+addrname[0]+' '+addrname[1]+' '+address+'</p>');   //开始时间---地址
							html.push('</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
					}

					$("#total").html(pageInfo.totalCount);
					$("#involved").html(pageInfo.involved);
					$("#success").html(pageInfo.success);
					$("#cancel").html(pageInfo.cancel);
					$("#refund").html(pageInfo.refund);
					showPageInfo();
				}
			}else{
				$("#total").html(0);
				$("#involved").html(0);
				$("#success").html(0);
				$("#cancel").html(0);
				$("#refund").html(0);
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
			}
		}
	});
}
