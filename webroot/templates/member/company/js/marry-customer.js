var objId = $("#list");
$(function(){
	$(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("active")){
			typeid = id;
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
			getList();
		}
	});
	getList(1);

	//操作
	objId.delegate(".lx", "click", function(){
		var t = $(this), par = t.closest("tr"), id = par.attr("data-id"),type = t.attr("data-type");
		var url = '';
		if(type ==1){
			url = masterDomain+"/include/ajax.php?service=marry&action=updateRese&id="+id;

		}else if(type ==2 || type ==3){
			url = masterDomain+"/include/ajax.php?service=marry&action=updateRese&id="+id;
			// url = masterDomain+"/include/ajax.php?service=renovation&action=updateEntrust&id="+id;

		}
		if(id){
			$.dialog.confirm(langData['siteConfig'][27][79], function(){
				t.addClass("load");

				$.ajax({
					url: url,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state != 200){
							t.parent().html(langData['siteConfig'][26][146]);
						}else{
							$.dialog.alert(langData['siteConfig'][27][77]);
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

});

function getList(is){
	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();
	if (typeid == 1) {

		url =  "/include/ajax.php?service=marry&action=getrese&page="+atpage+"&pageSize="+pageSize;

	}else if(typeid == 2){

		url = "/include/ajax.php?service=marry&action=getContactlog&resetype=1&type=0&page="+atpage+"&pageSize="+pageSize;
	}
	$.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						
						html.push('<table><thead><tr><td class="fir"></td>');
						html.push('<td class="rowPeo">'+langData['siteConfig'][19][642]+'</td>');//联系人
						html.push('<td class="rowPhone">'+langData['siteConfig'][19][56]+'</td>');//联系电话					
						html.push('<td class="rowTime">'+langData['siteConfig'][31][119]+'</td>');//预约时间
						html.push('<td class="rowComm">'+langData['marry'][7][46]+'</td>');//客户来源
                        if (typeid == 1) {
						    html.push('<td class="rowState">'+langData['siteConfig'][19][307]+'</td>');//状态
                        }
						html.push('</tr></thead>');

						for(var i = 0; i < list.length; i++){
							var item      = [],
									id        = list[i].id,
									people    = list[i].people,
									tel       = list[i].contact,
									comtype       = list[i].comtype,
									pubdate   = huoniao.transTimes(list[i].pubdate,1),
									 date   = huoniao.transTimes(list[i].date,1),

								state     = list[i].state;
							html.push('<tr data-id="'+id+'"><td class="fir"></td>');
							if(typeid ==1){//预约管理
								 
								html.push('<td>'+people+'</td>');
								html.push('<td>'+tel+'</td>');

								html.push('<td>'+pubdate+'</td>');
								var comUrl = comtype == 1?storeUrl.replace('%id%',list[i].company):hotelUrl.replace('%id%',list[i].company);
                        		var httxt = comtype == 1?'酒店主页':'商家主页';  									
								html.push('<td><a href="'+comUrl+'">'+httxt+'</a></td>');
								
								
							}else{//商家咨询
								html.push('<td>'+list[i].username+'</td>');
								html.push('<td>'+list[i].tel+'</td>');
								html.push('<td>'+date+'</td>');
								html.push('<td><a href="'+list[i].link+'">'+ list[i].title+'</a></td>');
							}
							if (typeid == 1) {
                                if(state == 0){
                                    html.push('<td><button class="lx" data-type="'+typeid+'" type="button">&nbsp;&nbsp;'+langData['siteConfig'][6][0]+'&nbsp;&nbsp;</button></td>');//确认
                                }else{
                                    html.push('<td>'+langData['siteConfig'][26][146]+'</td>');//已联系
                                }
                            }
							html.push('</tr>');


						}

						objId.html(html.join("")+"</table>");

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalCount = pageInfo.totalCount;
					if(typeid == 1)
					$("#total").html(pageInfo.totalCount);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
