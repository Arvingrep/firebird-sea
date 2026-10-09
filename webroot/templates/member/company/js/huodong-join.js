/**
 * 会员中心我参与的活动
 * by guozi at: 20161229
 */

var objId = $("#list");
$(function(){

	$(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("active")){
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
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
						$.dialog.alert(langData['siteConfig'][20][183]);
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
			$.dialog.confirm(langData['siteConfig'][20][584], function(){
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
						$.dialog.alert(langData['siteConfig'][20][183]);
						t.removeClass("load");
					}
				});
			});
		}
	});

	//查看详情
	objId.delegate(".edit", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
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
						content += '<div class="number"><p>'+langData['siteConfig'][18][48]+'</p><h2>'+info.code+'</h2></div>';
						content += '<div class="con">';
						content += '<dl class="fn-clear">';
						content += '<dt><img src="'+masterDomain+'/include/qrcode.php?data='+(info.code.replace(/\s/g, ''))+'" /></dt>';
						content += '<dd>';
						content += '<p style="color: #f60;">'+langData['siteConfig'][23][122]+'：'+(info.price > 0 ? info.price : langData['siteConfig'][19][427])+'</p>';

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
						content += '<div class="sto">'+langData['siteConfig'][18][49]+'：'+info.nickname+'<br />'+langData['siteConfig'][19][56]+'：'+info.contact+'</div>';
						content += '<div class="btn fn-clear">';

						if(info.state == '1'){
							if (info.sign == 0){
								content += '<a href="javascript:;" class="cancel">'+langData['siteConfig'][19][773]+'</a>';
							}
							content += '<a href="javascript:;" class="ok">'+langData['siteConfig'][6][186]+'</a>';
						}else{

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

							content += '<a href="javascript:;">'+state_+'</a>';
						}

						content += '</div>';
						content += '</div>';
						content += '</div>';

						detailPopup = $.dialog({
							title: langData['siteConfig'][19][313],
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

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=huodong&action=joinList&state="+$(".nav-tabs .active").data("state")+"&page="+atpage+"&pageSize="+1,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
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
							var status = '&nbsp;&nbsp;·&nbsp;&nbsp;<font color="red">'+langData['siteConfig'][19][418]+'</font>';
								html.push('<div class="o">');
								var state_ = '';
								switch (state) {
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
								html.push('<span style="color: #f60;">'+state_+'</span>');
								html.push('<a href="javascript:;" class="edit"><s></s>'+langData['siteConfig'][6][175]+'</a>');
								if(going){
									// html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][19][773]+'</a>');
									status = '&nbsp;&nbsp;·&nbsp;&nbsp;<font color="#0eabee">'+langData['siteConfig'][19][772]+'</font>';
								}
								html.push('</div>');
							html.push('<div class="i">');
							html.push('<p>'+langData['siteConfig'][19][417]+'：'+date+state+'</p>');
							html.push('<h5><a href="'+url+'" target="_blank" title="'+title+'">'+title+'</a></h5>');
							html.push('<p>'+langData['siteConfig'][19][419]+'：'+began+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][9]+'：'+addrname[0]+' '+addrname[1]+' '+address+'</p>');
							html.push('</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
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
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
