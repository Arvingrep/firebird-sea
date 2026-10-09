/**
 * 会员中心商家点评
 * by guozi at: 20170328
 */

var objId = $("#list"), isload = false;
$(function(){

	getList(1);

	$("#stateCon li").click(function(){
		if(isload) return;
		$(this).addClass("active").siblings().removeClass("active");
		getList(1);
	})

	// 确认,取消订单
	objId.delegate(".ok, .cancel", "click", function(){
		var t = $(this), id = t.closest("table").attr("data-id");
		var state = 0;
		if(t.hasClass("ok")){
			state = 1;
		}if(t.hasClass("cancel")){
			state = 2;
		}

		if(state == 1){
			$.dialog.confirm(langData['siteConfig'][20][427], function(){
				updateState(id, state);
			})
		}else if(state == 2){
			$.dialog.prompt(langData['siteConfig'][20][425], function(str){
				updateState(id, state, str);
			}, langData['siteConfig'][20][428])
		}

	})

	function updateState(id, sta, str){
		$.ajax({
			url: '/include/ajax.php?service=business&action=paiduiUpdateState&u=1&state='+sta+'&id='+id+(sta == 2 ? '&cancel_bec='+str : ''),
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					location.reload();
				}else{
					$.dialog.alert(data.info);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
			}
		})
	}

});



function getList(is){

	if(isload) return;

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	var state = $("#stateCon li.active").attr("data-id");

	isload = true;
	$.ajax({
		url: masterDomain+"/include/ajax.php?service=business&action=paiduiOrder&u=1&page="+atpage+"&pageSize="+pageSize+"&state="+state,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {

			// return;
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item       = [],
									id         = list[i].id,
									ordernum   = list[i].ordernum,
									orderstate = list[i].state,
									people     = list[i].people,
									table      = list[i].table,
									cancel_bec = list[i].cancel_bec,
									orderdate  = huoniao.transTimes(list[i].pubdate, 1),
									user       = list[i].user;

							var detailUrl = editUrl.replace("%id%", id);
							var fhUrl = detailUrl.indexOf("?") > -1 ? detailUrl + "&rates=1" : detailUrl + "?rates=1";
							var stateInfo = btn = "";


							switch(orderstate){
								case "0":
									stateInfo = "<span class='state4' style='color:#f60;'>"+langData['siteConfig'][7][5]+"</span>";
									btn = '<a href="javascript:;" class="ok" style="color:#4caf50;">'+langData['siteConfig'][26][154]+'</a>&nbsp;&nbsp;<a href="javascript:;" class="cancel" style="color:#f60;">'+langData['siteConfig'][6][65]+'</a>';
									totalCount = pageInfo.totalGray;
									break;
								case "1":
									stateInfo = "<span class='state3' style='color:#999;'>"+langData['siteConfig'][19][507]+"</span>";
									totalCount = pageInfo.totalAudit;
									break;
								case "2":
									stateInfo = "<span class='state3' style='color:#999;'>"+langData['siteConfig'][9][13]+"</span>";
									btn = '<span style="color:#999;">'+cancel_bec+'</span>';
									totalCount = pageInfo.totalCancel;
									break;
								default :
									totalCount = pageInfo.totalCount;
									break;
							}

							html.push('<table data-id="'+id+'"><colgroup><col style="width:20%;"><col style="width:20%;"><col style="width:20%;"><col style="width:20%;"><col style="width:20%;"></colgroup>');
							html.push('<thead><tr class="placeh"><td colspan="5">');
							html.push('<span class="dealtime" title="'+orderdate+'">'+orderdate+'</span>');
							html.push('<span class="number">'+langData['siteConfig'][19][308]+'：'+ordernum+'</span>');
							// var memberHtml = user.name;
							// html.push('<span class="store">'+memberHtml+'</span>');
							html.push('</td>');
							html.push('<td colspan="1"></td></tr></thead>');
							html.push('<tbody>');

							cla = "";
							html.push('<tr'+cla+'>');
							html.push('<td class="nb"><div class="info"><div class="txt"><p>'+user.name+'</p></div></div></td>');
							html.push('<td class="nb">'+people+'</td>');
							html.push('<td class="nb">'+table+'</td>');
							html.push('<td class="nb">'+stateInfo+'</td>');
							html.push('<td class="bf" rowspan="1"><div>'+btn+'</td>');

							html.push('</tr>');

							html.push('</tbody>');

						}


						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					$("#total").html(pageInfo.totalCount);



					showPageInfo();

					$("#total").text(pageInfo.totalCount);
					$("#unused").text(pageInfo.totalGray);
					$("#eating").text(pageInfo.totalEat);
					$("#recei").text(pageInfo.totalAudit);
					$("#cancel").text(pageInfo.totalCancel);

				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}

			isload = false;

		}
	});
}
