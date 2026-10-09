/**
 * 会员中心商家订座
 */

$(function(){

	// getList(1);
	var turnState = 0;
	function getConfig(){
		$.ajax({
			url: '/include/ajax.php?service=business&action=serviceUpdateState&get=1&type='+type,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					turnState = 1;
					$(".header-r").html('<a href="javascript:;" class="totalTurn">'+langData['siteConfig'][6][15]+'<span>'+langData['siteConfig'][16][148]+'</span></a>');
				}else{
					turnState = 0;
					$(".header-r").html('<a href="javascript:;" class="totalTurn">'+langData['siteConfig'][6][24]+'<span>'+langData['siteConfig'][16][149]+'</span></a>');
				}
			}
		})
	}

	$("body").delegate(".totalTurn", "click", function(){
		var t = $(this);
		if(t.hasClass('disabled')) return;
		t.addClass('disabled');
		$.ajax({
			url: '/include/ajax.php?service=business&action=serviceUpdateState&type='+type,
			type: 'post',
			dataType: 'json',
			success: function(data){
				if(data && data.state == 100){
					turnState = turnState == 0 ? 1 : 0;
					if(turnState == 1){
						$(".header-r").html('<a href="javascript:;" class="totalTurn">'+langData['siteConfig'][6][15]+'<span>'+langData['siteConfig'][16][148]+'</span></a>');
					}else{
						$(".header-r").html('<a href="javascript:;" class="totalTurn">'+langData['siteConfig'][6][24]+'<span>'+langData['siteConfig'][16][149]+'</span></a>');
					}
				}else{
					alert(data.info);
					t.removeClass('disabled');
				}
			}
		})
	})

	// 展开详情
	objId.delegate(".detail", "click", function(){
		var t = $(this), p = t.closest(".item");
		if(p.hasClass("showDetail")){
			p.removeClass("showDetail");
			t.text(langData['siteConfig'][6][113]);
		}else{
			p.addClass("showDetail");
			t.text(langData['siteConfig'][16][77]);
		}
	})

	// 确认,取消订单
	objId.delegate(".ok, .cancel", "click", function(){
		var t = $(this), id = t.closest(".item").attr("data-id");
		var state = 0;
		if(t.hasClass("ok")){
			state = 1;
		}if(t.hasClass("cancel")){
			state = 2;
		}

		if(state == 1){
			if(confirm(langData['siteConfig'][20][427])){
				updateState(id, state);
			}
		}else if(state == 2){
			var str = prompt(langData['siteConfig'][20][425], langData['siteConfig'][20][428]);
			if(str != undefined){
				updateState(id, state, str);
			}
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
					alert(data.info);
				}
			},
			error: function(){
				alert(langData['siteConfig'][20][183]);
			}
		})
	}

	getConfig();

});



function getList(is){

	objId.html('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

	state = $(".tab-all .curr").attr("data-id");

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
									stateInfo = "<span class='state4'>"+langData['siteConfig'][7][5]+"</span>";
									btn = "<a href='javascript:;' class='ok'>"+langData['siteConfig'][6][163]+"</a>&nbsp;&nbsp;<a href='javascript:;' class='cancel'>"+langData['siteConfig'][6][12]+"</a>";
									break;
								case "1":
									stateInfo = "<span class='state3'>"+langData['siteConfig'][19][507]+"</span>";
									break;
								case "2":
									stateInfo = "<span class='state3'>"+langData['siteConfig'][9][13]+"</span>";
									break;
							}

							item.push('<div class="item" data-id="'+id+'">');
							item.push('    <p class="order-number fn-clear">');
							item.push('        <span class="fn-left">'+langData['siteConfig'][19][308]+'：'+ordernum+'</span>');
							item.push('        <span class="time">'+orderdate+'</span></p>');
							item.push('    <p class="store fn-clear">');
							item.push('        <span class="title fn-clear">');
							// item.push('            <img src="'+(user.photo != '' ? huoniao.changeFileSize(user.photo, "small") : '/static/images/default_user.jpg')+'">');
							item.push('            <em class="sname">'+user.name+' <span style="color:#f60;">'+people+'</span>'+langData['siteConfig'][13][35]+'</em>');
							item.push('        </span>');
							item.push('        <span class="state">'+stateInfo+'</span>');
							item.push('    </p>');
							item.push('    <div class="detail-con">');
							item.push('    	<div class="box">');
							item.push('        <div class="fn-clear">');
							item.push('            <div class="">');
							item.push('                <p class="gname" style="height:auto;">'+langData['siteConfig'][19][510]+'：<span>'+table+'</span></p></div>');
							item.push('        </div>');
							item.push('    	</div>');
							item.push('    </div>');
							item.push('    <p class="btns fn-clear">');
							item.push('        <a href="javascript:;" class="blueBtn detail">'+langData['siteConfig'][19][313]+'</a>'+btn);
							item.push('    </p>');
							item.push('</div>');

							html.push(item.join(""));
						}


						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					$("#total").text(pageInfo.totalCount);
					$("#unused").text(pageInfo.totalGray);
					$("#recei").text(pageInfo.totalAudit);
					$("#cancel").text(pageInfo.totalCancel);

					totalCount = pageInfo.totalCount;
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
