/**
 * 会员中心-汽车顾问
 * by guozi at: 20150627
 */

var objId = $("#list");
$(function(){

	$(".nav-tabs li").bind("click", function(){
		var t = $(this), id = t.attr("data-id");
		if(!t.hasClass("active") && !t.hasClass("add")){
			state = id;
			atpage = 1;
			t.addClass("active").siblings("li").removeClass("active");
			getList(1);
		}
	});

	getList(1);

	// 切换拒绝原因
	$('.model_fail .choose label').click(function(){
		var t = $(this);
		t.addClass('active').siblings().removeClass('active');
	})
	// 关闭弹窗
	$('.model .close, .model .cancel').click(function(){
		$(this).closest('.model').hide();
	})

	// 拒绝
	objId.delegate(".bj.fail", "click", function(){
		var t = $(this), par = t.closest("table"), id = par.attr("data-id"), title, newstate;
		if(id){
			$('.model_fail textarea').val('');
			$('.model_fail .choose label:eq(0)').addClass('active').siblings().removeClass('active');
			$('.model_fail .info').removeClass('show').text('');
			$('.model_fail').show().data('id', id);
		}
	});
	// 确定拒绝
	$('.model_fail .ok').click(function(){
		var fail_type = $('.model_fail .choose label.active').data("id");
		var fail_info = $('.model_fail textarea').val();
		var info = $('.model_fail .info');
		info.removeClass('show').text('');
		var id = $('.model_fail').data('id');
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=car&action=updateAdviserState&state=2&id="+id+"&fail_type="+fail_type+'&fail_info='+fail_info,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){
					$('.model_fail').hide();
					getList(1);
				}else{
					info.addClass('show').text(data.info);
				}
			},
			error: function(){
				info.addClass('show').text(langData['siteConfig'][20][183]);
			}
		});
	})

	// 通过
	objId.delegate(".bj.suc", "click", function(){
		var t = $(this).closest('table');
		var title = $('.model_del .model_title'), val = title.data("agree");
		title.text(val);
		$('.model_del').show().data({'type':'agree','tab': t});
	});

	//删除
	objId.delegate(".del", "click", function(){
		var t = $(this).closest('table');
		var title = $('.model_del .model_title'), val = title.data("del");
		title.text(val);
		$('.model_del').show().data({'type':'del','tab': t});
	});

	// 确定通过或删除
	$('.model_del .ok').click(function(){
		var par = $('.model_del').data('tab'), type = $('.model_del').data('type'), id = par.attr('data-id');
		var newstate = type == "agree" ? 1 : 0;
		$.ajax({
			url: masterDomain+"/include/ajax.php?service=car&action=operAdviser&type="+type+"&id="+id+"&comid="+comid+"&state="+newstate,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data && data.state == 100){

					$('.model_del .close').click();
					//删除成功后移除信息层并异步获取最新列表
					par.slideUp(300, function(){
						par.remove();
						setTimeout(function(){getList(1);}, 200);
					});

				}else{
					$.dialog.alert(data.info);
				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
			}
		});
	})


});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".nav-tabs").offset().top}, 300);
	}else{
		atpage = 1;
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=car&action=adviserList&iszjcom=1&comid="+comid+"&u=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					$(".nav-tabs li span").html(0);
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];
					$('#total').text(pageInfo.totalCount);
					$('#yes_total').text(pageInfo.state1 + pageInfo.state2);
					$('#not_total').text(pageInfo.state0);
					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var item     = [],
									id       = list[i].id,
									aid      = list[i].aid,
									title    = list[i].title,
									nickname = list[i].nickname,
									phone    = list[i].phone,
									photo    = list[i].photo,
									qq       = list[i].qq,
									qqQr     = list[i].qqQr,
									wx       = list[i].wx,
									wxQr     = list[i].wxQr,
									istate   = list[i].state,
									license  = list[i].license,
									detail   = list[i].detail,
									pubdate  = huoniao.transTimes(list[i].pubdate, 1);


							html.push('<table data-id="'+id+'"> <colgroup> <col style="width:30%;"> <col style="width:20%;"> <col style="width:20%;"> <col style="width:30%;"> </colgroup> <thead> <th>'+langData['siteConfig'][19][4]+'</th> <th>'+langData['siteConfig'][19][56]+'</th> <th>'+langData['siteConfig'][19][46]+'</th> <th>'+langData['siteConfig'][19][307]+'</th> </thead>');//姓名--联系电话--申请时间--状态

							html.push('<tbody>');
							html.push('<tr>');
					  	html.push('	<td>'+(photo != '' ? '<img src="'+photo+'" class="photo" />' : '')+nickname+'</td>');
					  	html.push('	<td>'+phone+'</td>');
					  	html.push('	<td>'+pubdate+'</td>');

						  html.push('	<td class="o">');
					  	if(istate == "0"){
					  		html.push('		<a href="javascript:;" class="bj fail">'+langData['siteConfig'][9][3]+'</a><a href="javascript:;" class="bj suc">'+langData['siteConfig'][9][2]+'</a>');//拒绝 -- 通过
						  }else if(istate == "1"){
						  	html.push('		<span class="bj state1">'+langData['siteConfig'][45][70]+'</span>');//已通过
					  	}else if(istate == "2"){
						  	html.push('		<span class="bj state2">'+langData['siteConfig'][45][69]+'</span>');//已拒绝
						  }
						  html.push('		<a href="javascript:;" class="bj del">'+langData['siteConfig'][6][8]+'</a>');//删除
					  	html.push('	</td>');
					  	html.push('</tr>');
							//html.push('<tr>');
							//html.push('<td colspan="4" class="rz">');
							//html.push('<span>身份证正面：'+(list[i].idcardFront != '' ? '<a href="'+list[i].idcardFront+'" target="_blank"><img src="'+list[i].idcardFront+'" /></a>' : '<em>未上传</em>')+'</span>');
							//html.push('<span>身份证反面：'+(list[i].idcardBack != '' ? '<a href="'+list[i].idcardBack+'" target="_blank"><img src="'+list[i].idcardBack+'" /></a>' : '<em>未上传</em>')+'</span>');
							//html.push('<span>名片：'+(list[i].litpic != '' ? '<a href="'+list[i].litpic+'" target="_blank"><img src="'+list[i].litpic+'" /></a>' : '<em>未上传</em>')+'</span>');
							//html.push('<span>执业资格认证：'+(list[i].license != '' ? '<a href="'+list[i].license+'" target="_blank"><img src="'+list[i].license+'" /></a>' : '<em>未上传</em>')+'</span>');
							//html.push('</td>');
					  	//html.push('</tr>');
					  	html.push('</tobdy>');
					  	html.push('</table>');
							
						}
						objId.html(html.join(""));
					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalCount = pageInfo.totalCount;

					$("#total").html(pageInfo.totalCount);

					showPageInfo();
				}
			}else{
				$("#total").html(0);
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
