/**
 * 会员中心商家点餐
 */

module = '';
$(function(){

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

	getConfig();

});



function getList(is){

	objId.html('<p class="loading">'+langData['siteConfig'][20][184]+'...</p>');

	state = $(".tab-all .curr").attr("data-id");

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=business&action=diancanOrder&u=1&page="+atpage+"&pageSize="+pageSize+"&state="+state,
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
								table      = list[i].table,
								people     = list[i].people,
								orderdate  = huoniao.transTimes(list[i].pubdate, 1),
								amount     = list[i].amount,
								user       = list[i].user;

							var detailUrl = editUrl.replace("%id%", id);
							var fhUrl = detailUrl.indexOf("?") > -1 ? detailUrl + "&rates=1" : detailUrl + "?rates=1";
							var stateInfo = btn = "";

							switch(orderstate){
								case "1":
									stateInfo = "<span class='state1'>"+langData['siteConfig'][16][117]+"</span>";
									break;
								case "3":
									stateInfo = "<span class='state3'>"+langData['siteConfig'][9][12]+"</span>";
									break;
								case "0":
									stateInfo = "<span class='state4'>"+langData['siteConfig'][9][11]+"</span>";
									break;
							}

							item.push('<div class="item" data-id="'+id+'">');
							item.push('    <p class="order-number fn-clear">');
							item.push('        <span class="fn-left">'+langData['siteConfig'][19][308]+'：'+ordernum+'</span>');
							item.push('        <span class="time">'+orderdate+'</span></p>');
							item.push('    <p class="store fn-clear">');
							item.push('        <span class="title fn-clear">');
							item.push('            <img src="'+(user.photo != '' ? huoniao.changeFileSize(user.photo, "small") : '/static/images/default_user.jpg')+'">');
							item.push('            <em class="sname">'+user.name+'</em>');
							item.push('        </span>');
							item.push('        <span class="state">'+stateInfo+'</span>');
							item.push('    </p>');
							item.push('    <a href="'+detailUrl+'">');
							item.push('        <div class="fn-clear">');
							// item.push('            <div class="imgbox">');
							// item.push('                <img src="null" alt=""></div>');
							item.push('            <div class="txtbox">');
							item.push('                <p class="gname" style="height:auto;"><span style="color:#f60;">'+table+'</span>'+langData['siteConfig'][19][484]+'&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#f60;">'+people+'</span>'+langData['siteConfig'][13][35]+'</p></div>');
							item.push('            <div class="pricebox">');
							item.push('                <p class="price">'+echoCurrency('symbol')+amount+'</p>');
							item.push('                <p class="mprice"></p>');
							item.push('            </div>');
							item.push('        </div>');
							item.push('    </a>');
							item.push('    <p class="btns fn-clear">');
							item.push('        <a href="'+detailUrl+'" class="blueBtn">'+langData['siteConfig'][19][313]+'</a>');
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

					totalCount = pageInfo.totalCount;
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
