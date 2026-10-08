/**
 * 会员中心分店列表
 * by guozi at: 20160419
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

	//删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"),orderCount = par.attr("data-ocount");
		par.addClass('active').siblings('.item').removeClass('active');
		$('.delbranchAlert .sureDelbranch').attr('data-id',id);
		if(id){
			if(orderCount > 0){
				$('.delbranchAlert .delbranchTit span').html('该分店有未完成订单，确定删除吗');
				$('.delbranchAlert p').html('删除分店后订单将由总店接管，可至订单详情页面重新分配。');
			}else{
				$('.delbranchAlert .delbranchTit span').html('确定删除该分店吗');
				$('.delbranchAlert p').html('删除后该分店下的历史订单将由总店接管');
			}
			$('.delbranchMask').show();
			$('.delbranchAlert').addClass('show');

		}
	});
	$('.delbranchAlert .sureDelbranch').click(function(){
		var tid = $(this).attr('data-id');
		var par = $(".item.active");
		$.ajax({
			url: "/include/ajax.php?service=shop&action=storeBranchConfig&oper=del&id="+tid,
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

				}
			},
			error: function(){
				$.dialog.alert(langData['siteConfig'][20][183]);
			}
		});
	})

	//关闭弹窗
	$(".delbranchMask,.delbranchAlert .delbranch_close").click(function(){
		$('.delbranchMask').hide();
		$('.delbranchAlert').removeClass('show');
	})

});

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=shop&action=storeBranch&u=1&state="+state+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){

						var t = window.location.href.indexOf(".html") > -1 ? "?" : "&";
						var param = t + "id=";
						var urlString = editUrl + param;

						for(var i = 0; i < list.length; i++){
							var item      = [],
									id        = list[i].id,
									title     = list[i].title,
									sta       = list[i].state,
									url       = state == 1 ? list[i].url : "javascript:;",
									sales     = list[i].sales,
									tel       = list[i].tel,
									people    = list[i].people,
									logo      = list[i].logo,
									date      = huoniao.transTimes(list[i].pubdate, 1);

							html.push('<div class="item fn-clear" data-id="'+id+'" data-ocount="10">');
							if(logo != ""){
								html.push('<div class="p"><a href="'+url+'" style="cursor: default;"><i></i><img src="'+logo+'" onerror="javascript:this.src=\''+staticPath+'images/noPhoto_100.jpg\';this.onerror=this.src=\''+staticPath+'images/bus_default.png\';"/></a></div>');
							}
							html.push('<div class="o"><a href="'+urlString+id+'" class="edit"><s></s>'+langData['siteConfig'][6][6]+'</a>');
							html.push('<a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a>');
							html.push('</div>');
							html.push('<div class="i">');

							var arcrank = "";
							if(list[i].state == 0){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="gray">'+langData['siteConfig'][26][74]+'</span>';
							}else if(list[i].state == 1){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['siteConfig'][19][392];
							}else if(list[i].state == 2){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][9][35]+'</span>';
							}else if(list[i].state == 3){
								arcrank = '&nbsp;&nbsp;·&nbsp;&nbsp;<span class="red">'+langData['siteConfig'][19][507]+'</span>';
							}
							html.push('<p>'+langData['siteConfig'][11][8]+'：'+date+'&nbsp;&nbsp;'+arcrank+'</p>');

							html.push('<h5>'+title+'</h5>');

							html.push('<p>'+langData['shop'][5][87]+'：'+people+'&nbsp;&nbsp;·&nbsp;&nbsp;'+langData['shop'][5][88]+'：'+tel+'&nbsp;&nbsp;</p>');
							html.push('</div>');
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalCount = pageInfo.totalCount;

					switch(state){
						case "":
							totalCount = pageInfo.totalCount;
							break;
						case "0":
							totalCount = pageInfo.gray;
							break;
						case "1":
							totalCount = pageInfo.audit;
							break;
						case "2":
							totalCount = pageInfo.refuse;
							break;
					}

					$("#total").html(pageInfo.totalCount);
					$("#audit").html(pageInfo.audit);
					$("#gray").html(pageInfo.gray);
					$("#refuse").html(pageInfo.refuse);
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
