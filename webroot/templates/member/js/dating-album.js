/**
 * 会员中心交友相册列表
 * by guozi at: 20160612
 */

var objId = $("#list");
$(function(){

	getList(1);

	//删除
	objId.delegate(".item s", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][20][211], function(){    //确认要删除吗？
				$.ajax({
					url: masterDomain+"/include/ajax.php?service=dating&action=albumDel&id="+id,
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
							$.dialog.tips(langData['siteConfig'][20][300], 3, 'error.png');   //删除失败！
						}
					},
					error: function(){
						$.dialog.tips(langData['siteConfig'][20][183], 3, 'error.png');   //网络错误，请稍候重试！
					}
				});
			});
		}
	});

	//修改
	objId.delegate(".item b", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id"), note = par.find(".note").html();
		var userid = $.cookie(cookiePre+"login_user");
		if(userid == null || userid == ""){
			huoniao.login();
			return false;
		}

		if(id){
	    dataInfo = $.dialog({
				id: "dataInfo",
				fixed: true,
				title: langData['siteConfig'][6][4],  //修改
				content: '<div class="sx fn-clear"><textarea>'+note+'</textarea></div>',
				width: 450,
				height: 120,
				ok: function(){
	        var note = $(".sx textarea").val();
          $.ajax({
            url: masterDomain + "/include/ajax.php?service=dating&action=albumEdit&id="+id+"&note="+note,
            type: "GET",
            dataType: "jsonp",
            success: function (data) {
              if(data.state == 100){
                $.dialog.tips(langData['siteConfig'][20][229], 3, 'success.png');   //修改成功！
								par.find(".note").html(note);
              }else{
                $.dialog.tips(data.info, 3, 'error.png');
              }
            },
            error: function(){
              $.dialog.tips(langData['siteConfig'][20][173], 3, 'error.png'); //网络错误，发送失败！
            }
          });
	      }
			});
		}

	});

});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 300);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=dating&action=albumList&u=1&page="+atpage+"&pageSize="+pageSize,
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
							html.push('<div class="item" data-id="'+list[i].id+'">');
							html.push('<b title="'+langData['siteConfig'][6][4]+'">'+langData['siteConfig'][6][4]+'</b>');
							html.push('<s title="'+langData['siteConfig'][6][8]+'">&times;</s>');
							var state = '';
							if(list[i].state == 0){
								state = '<div class="bg"><strong>'+langData['siteConfig'][23][100]+'</strong><span></span></div>';
							}else if(list[i].state == 2){
								state = '<div class="bg"><strong>'+langData['siteConfig'][23][101]+'</strong><span></span></div>';
							}
							html.push('<a href="'+huoniao.changeFileSize(list[i].path, "large")+'" target="_blank"><i></i><img src="'+huoniao.changeFileSize(list[i].path, "small")+'" />'+state+'</a>');
							html.push('<div class="fn-hide note">'+list[i].note+'</div>');
							html.push('</div>');
						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

					totalCount = pageInfo.totalCount;
					showPageInfo();
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
