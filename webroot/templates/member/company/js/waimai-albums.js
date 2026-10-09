/**
 * 会员中心新闻投稿列表
 * by guozi at: 20150627
 */

var objId = $("#list");
$(function(){

	getList(1);

	//删除
	objId.delegate(".del", "click", function(){
		var t = $(this), par = t.closest(".item"), id = par.attr("data-id");
		if(id){
			$.dialog.confirm(langData['siteConfig'][27][127], function(){
				t.siblings("a").hide();
				t.addClass("load");

				$.ajax({
					url: masterDomain+"/include/ajax.php?service=waimai&action=delAlbums&id="+id,
					type: "GET",
					dataType: "jsonp",
					success: function (data) {
						if(data && data.state != 200){

							//删除成功后移除信息层并异步获取最新列表
							par.slideUp(300, function(){
								par.remove();

								setTimeout(function(){getList(1);}, 200);
							});

						}else{
							$.dialog.alert(langData['siteConfig'][27][77]);
							t.siblings("a").show();
							t.removeClass("load");
						}
					},
					error: function(){
						$.dialog.alert(langData['siteConfig'][20][183]);
						t.siblings("a").show();
						t.removeClass("load");
					}
				});
			});
		}
	});


	//菜单分类
	$(".albumsType").bind("click", function(){
		$.ajax({
			url: "/include/ajax.php?service=waimai&action=albumType",
			data: "store="+storeid,
			type: "POST",
			dataType: "json",
			success: function(data){
				var content = [];
				if(data.state == 100){
					var info = data.info;
					for(var i = 0; i < info.length; i++){
						content.push('<li data-id="'+info[i].id+'"><i class="icon-move" title="'+langData['siteConfig'][6][83]+'"></i><input type="text" name="name[]" value="'+info[i].typename+'" /><a href="javascript:;" class="icon-trash" title="'+langData['siteConfig'][6][8]+'"></a></li>');
					}
				}
				content = '<ul class="menu-itemlist">'+content.join("")+'</ul>';
				content += '<a href="javascript:;" id="addNewManageType"><i class="icon-plus"></i>'+langData['siteConfig'][6][82]+'</a>';

				$.dialog({
					id: "ManageType",
					title: langData['siteConfig'][26][181],
					content: content,
					width: 360,
					ok: function(){
						var data = [], itemList = self.parent.$(".menu-itemlist li");
						for(var i = 0; i < itemList.length; i++){
							var obj = itemList.eq(i), id = obj.attr("data-id"), weight = obj.index(), val = obj.find("input").val();
							data.push('{"id": "'+id+'", "weight": "'+weight+'", "val": "'+val+'"}');
						}

						$.ajax({
							url: "/include/ajax.php?service=waimai&action=updateAlbumsType",
							data: "store="+storeid+"&data=["+data.join(",")+"]",
							type: "POST",
							dataType: "json",
							success: function(data){
								if(data && data.state == 100){
									location.reload();
								}else{
									alert(data.info);
								}
							}
						});
						return false;
					},
					cancel: true
				});


				//拖动排序
				$(".menu-itemlist").dragsort({ dragSelector: "li>i", placeHolderTemplate: '<li class="holder"></li>' });

				//删除
				$('.menu-itemlist').delegate("a", "click", function(){
					var parent = $(this).parent(), id = parent.attr("data-id");
					if(id != ""){
						$.dialog.confirm(langData['siteConfig'][27][128], function(){
							parent.remove();
							$.ajax({
								url: masterDomain+"/include/ajax.php?service=waimai&action=delAlbumsType&id="+id,
								dataType: "jsonp",
								success: function(data){
									if(data && data.state == 100){
										alert(langData['siteConfig'][20][444]);
									}else{
										alert(data.info);
									}
								}
							});
						});
					}else{
						parent.remove();
					}
				});

				//新增
				$("#addNewManageType").bind("click", function(){
					var html = '<li data-id=""><i class="icon-move" title="'+langData['siteConfig'][6][83]+'"></i><input type="text" name="name[]" value="" placeholder="'+langData['waimai'][5][78]+'" /><a title="'+langData['siteConfig'][6][8]+'" href="javascript:;" class="icon-trash"></a></li>';
					$(".menu-itemlist").append(html);
				});
			}
		});
	});

});

function getList(is){

	$('.main').animate({scrollTop: 0}, 300);

	objId.html('<p class="loading"><img src="'+staticPath+'images/ajax-loader.gif" />'+langData['siteConfig'][20][184]+'...</p>');
	$(".pagination").hide();

	$.ajax({
		url: masterDomain+"/include/ajax.php?service=waimai&action=album&store="+storeid,
		type: "GET",
		dataType: "jsonp",
		success: function (data) {
			if(data && data.state != 200){
				if(data.state == 101){
					objId.html("<p class='loading'>"+data.info+"</p>");
				}else{
					var list = data.info, html = [];

					//拼接列表
					if(list.length > 0){

						for(var i = 0; i < list.length; i++){
							var item     = [],
								id       = list[i].id,
								typeName = list[i].typeName,
								title    = list[i].title,
								path     = list[i].path;

							html.push('<div class="item fn-clear" data-id="'+id+'">');
							html.push('<div class="photo"><a href="'+path+'" target="_blank"><i></i><img src="'+huoniao.changeFileSize(path, "small")+'" /></a></div>');
							html.push('<div class="name">'+typeName+'：'+title+'</div>');
							html.push('<div class="o"><a href="javascript:;" class="del"><s></s>'+langData['siteConfig'][6][8]+'</a></div>');
							html.push('</div>');

						}

						objId.html(html.join(""));

					}else{
						objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
					}

				}
			}else{
				objId.html("<p class='loading'>"+langData['siteConfig'][20][126]+"</p>");
			}
		}
	});
}
