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
			url = masterDomain+"/include/ajax.php?service=renovation&action=updateEntrust&id="+id;
		}else if(type ==2 || type ==3 || type ==4 || type ==5){
			url = masterDomain+"/include/ajax.php?service=renovation&action=updateRese&id="+id;
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

		url =  "/include/ajax.php?service=renovation&action=entrust&page="+atpage+"&pageSize="+pageSize;

	}else if(typeid == 2){

		url = "/include/ajax.php?service=renovation&action=rese&resetype=1&company="+Identity.store.id+"&type=0&page="+atpage+"&pageSize="+pageSize;
	}else if(typeid == 3){

		url = "/include/ajax.php?service=renovation&action=construction&company="+Identity.store.id+"&page="+atpage+"&pageSize="+pageSize;
	}else if(typeid == 4){

		url = "/include/ajax.php?service=renovation&action=rese&is_smart=1&company="+Identity.store.id+"&type=0&page="+atpage+"&pageSize="+pageSize;

	}else if(typeid == 5){

		url = "/include/ajax.php?service=renovation&action=rese&resetype=0&company="+Identity.store.id+"&type=0&page="+atpage+"&pageSize="+pageSize;
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
						if(typeid ==1){//免费设计
							
							html.push('<td class="rowTime">'+langData['siteConfig'][19][304]+'</td>');//申请时间
							html.push('<td class="rowComm">'+langData['siteConfig'][37][44]+'</td>');//小区
							
						}else if(typeid ==2){//在线报价
							html.push('<td>'+langData['renovation'][15][33]+'</td>');//房屋面积
							html.push('<td>'+langData['renovation'][10][2]+'</td>');//房屋户型
							html.push('<td>'+langData['renovation'][2][16]+'</td>');//所在区域
							html.push('<td>'+langData['siteConfig'][19][304]+'</td>');//申请时间

						}else if(typeid == 3){//参观工地
							html.push('<td>'+langData['siteConfig'][19][304]+'</td>');//申请时间
							html.push('<td>'+langData['renovation'][15][34]+'</td>');//工地名称
							
						}else if(typeid == 4){//智选客户
							html.push('<td>'+langData['renovation'][2][4]+'</td>');//户型
							html.push('<td>'+langData['renovation'][10][4]+'</td>');//客户要进行的
							html.push('<td>'+langData['renovation'][10][5]+'</td>');//客户注重的
							html.push('<td>'+langData['siteConfig'][19][304]+'</td>');//申请时间
							
						}else if(typeid == 5){//在线预约
							html.push('<td class="rowComm">'+langData['siteConfig'][37][44]+'</td>');//小区
							html.push('<td>'+langData['renovation'][2][16]+'</td>');//所在区域
							html.push('<td>'+langData['siteConfig'][19][304]+'</td>');//申请时间
						}
                        if(typeid != 4){
						    html.push('<td class="rowState">'+langData['siteConfig'][19][307]+'</td>');//状态
                        }
						html.push('</tr></thead>');

						for(var i = 0; i < list.length; i++){
							var item      = [],
									id        = list[i].id,
									people    = list[i].people,
									tel       = list[i].contact,
									pubdate   = list[i].md +" "+list[i].his,
									state     = list[i].state;
									address   = list[i].address;
							html.push('<tr data-id="'+id+'"><td class="fir"></td>');
							html.push('<td>'+people+'</td>');
							html.push('<td>'+tel+'</td>');
							if(typeid ==1){//免费设计
								html.push('<td>'+pubdate+'</td>');
								html.push('<td>'+address+'</td>');
							}else if(typeid ==2){//在线报价
								html.push('<td>'+list[i].are+echoCurrency('areasymbol')+'</td>');
								html.push('<td>'+list[i].units+'</td>');
								html.push('<td>'+address+'</td>');
								html.push('<td>'+pubdate+'</td>');
							}else if(typeid == 3){//参观工地
								html.push('<td>'+pubdate+'</td>');
								html.push('<td>'+list[i].constructionetail.title+'</td>');
							}else if(typeid == 4){//智选客户
								html.push('<td>'+list[i].units+'</td>');
								html.push('<td>'+list[i].stype+'</td>');
								html.push('<td>'+list[i].style+'</td>');
								html.push('<td>'+pubdate+'</td>');
							}else if(typeid == 5){//在线预约
								html.push('<td>'+list[i].community+'</td>');
								html.push('<td>'+list[i].address+'</td>');
								html.push('<td>'+pubdate+'</td>');
							}

                            if(typeid != 4){
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

					$("#total").html(pageInfo.totalCount);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
