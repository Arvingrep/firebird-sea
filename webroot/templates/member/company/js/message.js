/**
 * 会员中心站内消息
 * by guozi at: 20151225
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

	getList(1);

	//全选
	$("#selectAll").bind("click", function(){
		$(this).is(":checked") ? $("#list input").attr("checked", true) : $("#list input").attr("checked", false);
	});


	//删除
	$(".delSelect").bind("click", function(){
		var id = [];
		$("#list input").each(function(){
			$(this).is(":checked") ? id.push($(this).val()) : "";
		});

		if(id){
			$.dialog.confirm(langData['siteConfig'][27][119], function(){

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=member&action=delMessage&id="+id.join(","),
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							getList(1);
						}else{
							$.dialog.alert(data.info);
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);
					}
				});
			});
		}
	});


	//设为已读
	$(".readSelect").bind("click", function(){
		var id = [];
		$("#list input").each(function(){
			$(this).is(":checked") ? id.push($(this).val()) : "";
		});

		if(id){
			$.dialog.confirm(langData['siteConfig'][20][544], function(){

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=member&action=setMessageRead&id="+id.join(","),
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){
							getList(1);
						}else{
							$.dialog.alert(data.info);
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);
					}
				});
			});
		}
	});


});

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();
	$(".opera").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=member&action=message&state="+state+"&page="+atpage+"&pageSize="+pageSize,
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
							var item  = [],
									id    = list[i].id,
									title = list[i].title,
									state = list[i].state,
									date  = list[i].date;

							var detailUrl = url.replace("%id", id);
							var status = state == 0 ? langData['siteConfig'][9][7] : langData['siteConfig'][9][8];
							var isread = state == 0 ? "unread" : "read";

							html.push('<tr class="'+isread+'"><td class="fir"><input type="checkbox" value="'+id+'" /></td>');
							html.push('<td><a href="'+detailUrl+'">'+title+'</a></td>');
							html.push('<td>'+status+'</td>');
							html.push('<td>'+date+'</td>');
							html.push('</tr>');

						}

						objId.html('<table><thead class="thead"><tr><th class="fir">&nbsp;</th><th>'+langData['siteConfig'][19][0]+'</th><th width="100">'+langData['siteConfig'][19][307]+'</th><th>'+langData['siteConfig'][19][384]+'</th></tr></thead><tbody>'+html.join("")+'</tbody></table>');
						$(".opera").show();

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					switch(state){
						case "":
							totalCount = pageInfo.totalCount;
							break;
						case "0":
							totalCount = pageInfo.unread;
							break;
						case "1":
							totalCount = pageInfo.read;
							break;
					}


					$("#total").html(pageInfo.totalCount);
					$("#read").html(pageInfo.read);
					$("#unread").html(pageInfo.unread);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
