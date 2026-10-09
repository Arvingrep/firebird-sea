/**
 * 会员中心-经纪人收到的房源委托
 * by guozi at: 20150627
 */

var objId = $("#list");
$(function(){

	$(".main-tab li[data-id='"+state+"']").addClass("curr");

	$(".main-tab li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("curr")){
			state = id;
			atpage = 1;
			t.addClass("curr").siblings("li").removeClass("curr");
			getList();
		}
	});

	getList(1);

	objId.delegate(".bj", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id"), title, newstate;
		if(id){
			if(t.hasClass('state0')){
				title = langData['siteConfig'][31][113];    //确定要该条信息标记为已处理吗？
				newstate = 1;
			}else{
				return;
				title = langData['siteConfig'][31][114];   //确定要该条信息标记为未处理吗？
				newstate = 0;
			}
			$.dialog.confirm(title, function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=house&action=operaEntrust&iszj=1&state="+newstate+"&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();
								setTimeout(function(){getList(1);}, 200);
							});

						}else{
							$.dialog.alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);   //网络错误，请稍候重试！
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][543], function(){  //你确定要删除这条信息吗？
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=house&action=operaEntrust&iszj=1&state=-1&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state == 100){

							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();
								setTimeout(function(){getList(1);}, 200);
							});

						}else{
							$.dialog.alert(data.info);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);  //网络错误，请稍候重试！
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});


});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');   //加载中，请稍候
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=house&action=myEntrust&iszj=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$("#total").html(0);
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item       = [],
									id         = list[i].id,
									aid        = list[i].aid,
									title      = list[i].title,
									date       = list[i].date,
									username   = list[i].username,
									contact    = list[i].contact,
									sex        = list[i].sex,
									address    = list[i].address,
									doornumber = list[i].doornumber,
									area       = list[i].area,
									price      = list[i].price,
									transfer   = list[i].transfer,
									istate     = list[i].state,
									type       = list[i].type,
									note       = list[i].note,
									detail     = list[i].detail,
									pubdate    = list[i].pubdate;

							var typename = '';
							if(type == 0) typename = langData['siteConfig'][19][109];  //出租
							if(type == 1) typename = langData['siteConfig'][19][110];  //出售
							if(type == 2) typename = langData['siteConfig'][19][111];  //转让


							html.push('<table data-id="'+id+'" class="oh"> <colgroup> <col style="width:5%;"> <col style="width:40%;"> <col style="width:15%;"> <col style="width:15%;"> <col style="width:15%;"> </colgroup> <thead> <th></th> <th class="tl">'+langData['siteConfig'][31][115]+'</th> <th>'+langData['siteConfig'][31][105]+'</th> <th>'+langData['siteConfig'][31][106]+'</th> <th>'+langData['siteConfig'][6][11]+'</th> </thead> <tbody>');
							//委托客户---委托类型---委托时间---操作
							html.push('<tr>');
					  	html.push('	<td></td>');
					  	html.push('	<td class="tl">');
					  	html.push('	<p class="user">'+username+(sex == 1 ? langData['siteConfig'][19][693] : (sex == 2 ? langData['siteConfig'][19][694] : ''))+'&nbsp;&nbsp;'+contact+'</p>');//先生-女士
					  	html.push('	<p class="title">'+langData['siteConfig'][19][9] +'：'+address+'</p>');  //地址
					  	html.push('	<p class="title">'+langData['siteConfig'][31][107] +'：'+(doornumber == '' ? langData['siteConfig'][31][108] : doornumber)+'</p>');//门牌号-未填写
					  	html.push('	<p class="title">'+langData['siteConfig'][19][85] +'：'+(area == 0 ?  langData['siteConfig'][31][108] : area)+'㎡</p>');//面积-未填写
					  	if(type == 2){
						  	html.push('	<p class="title">'+langData['siteConfig'][31][109] +'：'+(price == 0 ?  langData['siteConfig'][31][108] : price)+langData['siteConfig'][31][111] +'</p>');
						  	html.push('	<p class="title">'+langData['siteConfig'][19][120] +'：'+(transfer == 0 ?  langData['siteConfig'][31][108] : transfer + langData['siteConfig'][40][44])+'</p>');//元
						  }else{
						  	html.push('	<p class="title">'+langData['siteConfig'][31][110] +'：'+(price == 0 ?  langData['siteConfig'][31][108] : price + (type == 0 ? langData['siteConfig'][31][111]  : langData['siteConfig'][13][27]+echoCurrency('short')) )+'</p>');  
						  	//报价
						  }
					  	html.push('	</td>');
					  	html.push('	<td>'+typename+'</td>');
					  	html.push('	<td>'+huoniao.transTimes(pubdate, 2)+'</td>');
					  	html.push('	<td>');
					  	if(istate == "0"){
						  	html.push('		<span class="bj state0" title="'+langData['siteConfig'][31][116] +'"><em></em>'+langData['siteConfig'][6][138] +'</span>');  //标记为已处理---标记
						  }else{
						  	html.push('		<span class="bj state1" title="'+langData['siteConfig'][31][117] +'">'+langData['siteConfig'][9][64] +'</span>');//点击标记为未处理---已处理
						  }
					  	html.push('		<a href="javascript:;" class="del"></a>');
				  		html.push('	</td>');
					  	html.push('</tr>');
					  	if(note != ''){
					  		html.push('<tr class="note"><td colspan="5">'+note+'</td></tr>');
					  	}
					  	html.push('</tobdy>');
					  	html.push('</table>');

						}
						objId.html(html.join(""));
					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");   //暂无相关信息！
					}

					totalCount = pageInfo.totalCount;

					$("#total").html(pageInfo.totalCount);

					showPageInfo();
				}
			}else{
				$("#total").html(0);
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");   //暂无相关信息！
			}
		}
	});
}
