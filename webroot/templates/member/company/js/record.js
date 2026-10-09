/**
 * 会员中心交易明细
 * by guozi at: 20151109
 */

var objId = $("#list");
$(function(){

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

	getList(1);

});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-sub-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');

	var type = $(".main-sub-tab .curr").attr("data-id");

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=member&action=record&type="+type+"&page="+atpage+"&pageSize="+pageSize,
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
							var item   = [],
									type   = list[i].type,
									time   = list[i].date,
									amount = list[i].amount,
                  balance = list[i].balance,
									info   = list[i].info;

							if(i == 0){
								html.push('<thead><tr><td class="fir"></td>');
								html.push('<td colspan="3"><strong>'+addDateInV1_2(time.split(' ')[0])+'</strong></td>');
								html.push('</tr></thead>');
							}else{
								if(time.split(' ')[0]  != list[i-1].date.split(' ')[0]){
									html.push('<thead><tr><td class="fir"></td>');
									html.push('<td colspan="3"><strong>'+addDateInV1_2(time.split(' ')[0])+'</strong></td>');
									html.push('</tr></thead>');
								}
							}

							html.push('<tbody><tr><td class="fir"></td>');
							html.push('<td style="width:50%;">'+info+'</td>');
							html.push('<td style="padding-left: 30px;" class="'+(type == 1 ? "add" : "less")+'">'+(type == 1 ? "+" : "-")+amount+'</td>');
              html.push('<td style="padding-left: 30px;">'+(judgeTime(time) ? balance : '-')+'</td>');
							html.push('<td>'+time.split(' ')[1]+'</td>');
							html.push('</tr></tbody>');

						}

						objId.html('<table><thead class="thead"><tr><th class="fir"></th><th>'+langData['siteConfig'][19][382]+'</th><th style="padding-left: 30px;">'+langData['siteConfig'][19][383]+'</th><th style="padding-left: 30px;">'+langData['siteConfig'][56][40]+'</th><th>'+langData['siteConfig'][19][384]+'</th></tr></thead>'+html.join("")+'</table>');

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalAdd = pageInfo.totalAdd;
					totalLess = pageInfo.totalLess;
					totalCount = pageInfo.totalCount;
					$("#total label").html("&nbsp;&nbsp;（"+langData['siteConfig'][19][380]+" <strong style='color:#30992e;'>"+pageInfo.totalAdd+"</strong>&nbsp;&nbsp;|&nbsp;&nbsp;"+langData['siteConfig'][19][381]+" <strong style='color:#b1000f;'>"+pageInfo.totalLess+"</strong>）");
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}

function addDateInV1_2(strDate){
	var d = new Date();
	var day = d.getDate();
	var month = d.getMonth() + 1;
	var year = d.getFullYear();
	var dateArr = strDate.split('-');
	var tmp;
	var monthTmp;
	if(dateArr[2].charAt(0) == '0'){
		tmp = dateArr[2].substr(1);
	}else{
		tmp = dateArr[2];
	}
	if(dateArr[1].charAt(0) == '0'){
		monthTmp = dateArr[1].substr(1);
	}else{
		monthTmp = dateArr[1];
	}
	if(day == tmp && month == monthTmp && year == dateArr[0]){
		return langData['siteConfig'][13][24];
	}else{
		return dateArr[0] + langData['siteConfig'][13][14] + monthTmp + langData['siteConfig'][13][18] + tmp + langData['siteConfig'][13][25];
	}
}

// 判断时间
function judgeTime(time){
    var strtime = time.replace(/-/g, "/");//时间转换
    var endtime = "2021-07-13 00:00:00".replace(/-/g, "/");//时间转换
    //时间
    var date1=new Date(strtime);
    //现在时间
    var date2=new Date(endtime);
    //判断时间是否过期
    return date1>date2?true:false;
}
