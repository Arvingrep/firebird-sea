/**
 * 会员中心交友私信列表
 * by guozi at: 20160608
 */

var objId = $("#list");
var hash = (!window.location.hash) ? "" : window.location.hash;
$(function(){

	getList(1);

	//回复
	$("#send").bind("click", function(){
		var note = $("#con").val();
		if($.trim(note) == ""){
			$.dialog.tips(langData['siteConfig'][20][297], 3, 'error.png');    //请输入私信内容
			return false;
		}
		$.ajax({
			url: masterDomain + "/include/ajax.php?service=dating&action=fabuReview&id="+tid+"&note="+note,
			type: "GET",
			dataType: "jsonp",
			success: function (data) {
				if(data.state == 100){
					$.dialog.tips(langData['siteConfig'][20][298], 3, 'success.png');  //发送成功
					$("#con").val("");
					getList();
				}else{
					$.dialog.tips(data.info, 3, 'error.png');
				}
			},
			error: function(){
				$.dialog.tips(langData['siteConfig'][20][173], 3, 'error.png');  //网络错误，发送失败！
			}
		});
	});

});

function getList(is){

	if(is != 1){
		$('html, body').animate({scrollTop: $(".main-tab").offset().top}, 0);
	}

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=dating&action=reviewDetail&id="+id+"&page="+atpage+"&pageSize="+pageSize,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>"); //暂无相关信息！
				}else{
					var list = data.info.list, pageInfo = data.info.pageInfo, html = [];

					//拼接列表
					if(list.length > 0){
						for(var i = 0; i < list.length; i++){
							var type = " l", url = tinfo['url'], name = tinfo['nickname'], photo = huoniao.changeFileSize(tinfo['photo'], "small");
							if(list[i].from == mid){
								type = " r";
								url = minfo['url'];
								name = langData['siteConfig'][19][742];   //我
								photo = huoniao.changeFileSize(minfo['photo'], "small");
							}
							html.push('<div class="li fn-clear'+type+'" id="r'+list[i].pubdate+'">');
							html.push('<a href="'+url+'" target="_blank" class="photo"><img src="'+photo+'" onerror="javascript:this.src=\''+masterDomain+'/static/images/default_user.jpg\';" /></a>');
							html.push('<div class="info">');
							html.push('<s><i></i></s>');
							html.push('<h3><a href="'+url+'" target="_blank">'+name+'</a></h3>');
							html.push('<p>'+list[i].content+'</p>');
							html.push('<em>'+huoniao.transTimes(list[i].pubdate, 1)+'</em>');
							html.push('</div>');
							html.push('</div>');
						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");   //暂无相关信息！
					}

					totalCount = pageInfo.totalCount;
					showPageInfo();

					if(hash != ""){
						hash = hash.replace("#", "");
						var obj = $("#"+hash).offset();
						if(obj){
							$('html, body').animate({scrollTop:obj.top}, 300);
						}
					}
				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");  //暂无相关信息！
			}
		}
	});
}
